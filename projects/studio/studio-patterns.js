(function(){

jb.ns('patterns')

jb.component('studio.select-style', { /* studio.selectStyle */
  type: 'control',
  params: [
    {id: 'extractedCtrl'},
    {id: 'targetPath', as: 'string'}
  ],
  impl: group({
    layout: layout.grid({columnSizes: list('600'), columnGap: '10px', rowGap: '10px'}),
    style: group.sections({
      titleStyle: header.mdcHeadline6(),
      sectionStyle: styleWithFeatures(
        group.div(),
        [
          css.padding({left: '10', bottom: '20'}),
          css.boxShadow({
            blurRadius: '2',
            spreadRadius: '0',
            shadowColor: '#000000',
            opacity: 0.5,
            horizontal: '2',
            vertical: '2'
          }),
          css('position: relative')
        ]
      ),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({top: '20', right: '20'})])
    }),
    controls: dynamicControls({
      controlItems: pipeline(
        studio.suggestedStyles('%$extractedCtrl%','%$targetPath%'),
        ctx => {
            const clone = JSON.parse(JSON.stringify(ctx.run(studio.val('%$targetPath%'))))
            const length = JSON.stringify(ctx.exp('%%')).length
            return { ...clone, style: ctx.exp('%%'), length }
        }
      ),
      genericControl: group({
        controls: [
          ctx => ctx.run(ctx.exp('%$__option%')),
          button({
            title: 'select (%$__option/length%)',
            action: runActions(
              writeValue(studio.ref('%$targetPath%~style'), '%$__option/style%'),
              dialog.closeContainingPopup()
            ),
            features: css('position: absolute; top: 0; left: 30px;')
          })
        ]
      }),
      itemVariable: '__option'
    }),
    features: css.height('600')
    })
})

jb.component('studio.extract-style', {
    type: 'action',
    params: [
        {id: 'extractedCtrl'},
        {id: 'targetPath', as: 'string'},
    ],
    impl: openDialog({
        content: studio.selectStyle('%$extractedCtrl%','%$targetPath%'),
        title: 'select style',
        features: dialogFeature.uniqueDialog('unique')
    })
})

jb.component('studio.suggested-styles', {
    params: [
        {id: 'extractedCtrl'},
        {id: 'targetPath', as: 'string'},
    ],
    impl: (ctx,extractedCtrl,targetPath) => {
        const constraints = ctx.exp('%$studio/pattern/constraints%') || []
        const target = jb.studio.valOfPath(targetPath)
        const {params, options} = jb.ui.stylePatterns[target.$] && jb.ui.stylePatterns[target.$](extractedCtrl,target) || {}
        if (!params) return []
        const previewCtx = jb.studio.closestCtxInPreview(ctx.exp('%$targetPath%')).ctx
        return options.filter(x => checkConstraints(x)).map(x=>mark(x)).sort((x,y) => y.mark - x.mark)

        function checkConstraints(option) {
            return constraints.reduce((res,cons) => res && cons.match(option),true)
        }

        function mark(option) {
            const mark = params.reduce((res,p) => res + paramDiff(p),0)
            return {...option, mark}

            function paramDiff(param) {
                if (param.type == 'text') {
                    const origValue = previewCtx && previewCtx.run(param.origValue) || ''
                    const draggedValue = option._patternInfo.paramValues[param.id].draggedValue || ''
                    return Math.abs(origValue.length - draggedValue.length)
                }
                if (param.type == 'image') {
                    // todo image size
                }
                return 0
            }
        }
    }        
})

jb.component('pattern.path-value-constraint',{
    params: [
        {id: 'path', as: 'string'},
        {id: 'value'},
    ],
    impl: (ctx,path,value) => ({
        match: option => option._patternInfo.mapping[path] == value
    })
})

function pathToObj(base, path) {
    return path.split('/').filter(x=>x).reduce((o,p) => o[p],base)
}

function parents(path,includeThis) {
    const result = ['']
    path.split('/').reduce((acc,p) => {
        const path = [acc,p].filter(x=>x).join('/')
        result.push(path)
        return path
    } ,'')
    return result.reverse().slice(includeThis ? 0 : 1)
}

function flatContent(ctrl ,path) {
    const children = jb.asArray(ctrl.controls||[])
        .flatMap((ch,i) => flatContent(ch,
            [path,'controls',Array.isArray(ctrl.controls) ? i : ''].filter(x=>x!=='').join('/')))
    return [{ctrl,path}, ...children]
}

const paramProps = { text: 'text', button: 'title', image: 'url' }

jb.ui.stylePatterns = {
    text(extractedCtrl) {
        const content = flatContent(extractedCtrl,'')
        const texts = content.filter(x=>x.ctrl.$ == 'text')
        const value = '%$textModel/text%'
        const params = [{id: 'text', origValue: value, type: 'text'}]
        const options = texts.flatMap(text=> {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            const overridePath = [...text.path.split('/'),'text'] 
            const draggedValue = jb.path(boundedCtrl,overridePath)
            jb.path(boundedCtrl,overridePath,value) // set value
            return parents(text.path,true).map(path => {
                const ctrl = pathToObj(boundedCtrl, path)
                return {...styleByControl(ctrl,'textModel'), 
                    _patternInfo: {
                        top: path,
                        paramValues: { text : {overridePath, draggedValue} }
                    }
                }
            })
        })
        return {params, options}
    },
    group(extractedCtrl, target) {
        const targetContent = flatContent(target,'')
        const content = flatContent(extractedCtrl,'')
        const params = ['button','image','text'].flatMap(type=> content.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: idOfCtrl(elem.ctrl) || `${type}${i}`, origValue: elem.ctrl, type} )))
    },
    group(extractedCtrl, target) {
        const targetContent = flatContent(target,'')
        const params = ['button','image','text'].flatMap(type=> targetContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: idOfCtrl(elem.ctrl) || `${type}${i}`, origValue: elem.ctrl, type} )))

        const content = flatContent(extractedCtrl,'')
        // parents of images that have also text
        const parentGroups = jb.unique(content.filter(x=>x.ctrl.$ == 'image').flatMap(x=>parents(x.path)))
            .filter(path=>hasText(path))
            .slice(-1) // TODO: remove
        const options = parentGroups.flatMap(top => {
            const matches = ['button','image','text'].map(type=>{
                const draggedElemsOfType = content.filter(x=> x.ctrl.$ == type && x.path.indexOf(top) == 0)
                return permutations(params.filter(p=> p.type == type),draggedElemsOfType).filter(x => x.length)
            })
            return combinations(matches.filter(x => x.length))
                .filter(x => x.length).map(matches=>matchesToOption(matches,top))
        })
        return {params, options}

        // returns all matches between the params and the dragElems
        // E.g. [ [ {param1, draggedElem1 }, {param2, draggedElem2 }], [{param1, draggedElem2 }, {param2, draggedElem1 }] ] ]
        // result type [matches] when matches = [match], match: { param, draggedElem }
        function permutations(params,draggedElems) {
            if (params.length == 0 || draggedElems.length == 0) return [[]]
            if (params.length == 1)
                return [draggedElems.map(draggedElem=>({draggedElem, param: params[0]}))]
            // match first param with all dragged Elems and combine with the other params/elems recursevely
            return draggedElems.flatMap( (draggedElem,i)=> {
                    const resultWithoutFirstParam = permutations(params.slice(1),[...draggedElems.slice(0,i),...draggedElems.slice(i+1) ] )
                    return resultWithoutFirstParam.map(matches => matches.map(match=> [...match, {draggedElem, param: params[0]}]))
                }
            ).filter(x => x.length)
        }
        // returns all combinations of the matches
        // input [[matchText1, matchText2],[matchImage1, matchImage2],[matchBtn1, matchBtn2] ] 
        //   => [[...matchText1,...matchImage1,...matchBtn1], [...matchText2,...matchImage1, ...matchBtn1], .. 2*2*2
        // result is [matches] when matches = [match], match: { param, draggedElem }
        function combinations(arrOfMatches) {
            if (arrOfMatches.length == 1) return arrOfMatches[0].map(match=>[match])
            const innerCombinations = combinations(arrOfMatches.slice(1))
            return arrOfMatches[0].flatMap(match=> innerCombinations.map(matches=>[match,...matches]))
        }

        function matchesToOption(matches,top) {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            const paramValues = {}
            matches.forEach(match => {
                const overridePath = [...match.option.path.split('/'), paramProps[match.param.type]] 
                const draggedValue = jb.path(boundedCtrl,overridePath)
                paramValues[match.param.id] = {overridePath, draggedValue}
                jb.path(boundedCtrl,overridePath,match.param.origValue) // set value
            })
            const ctrl = pathToObj(boundedCtrl, top)
            return {...styleByControl(ctrl,''), _patternInfo: { top, paramValues } }
        }
        function hasText(path) {
            return content.filter(x=>x.path.indexOf(path) == 0 && x.ctrl.$ == 'text')[0]
        }
        function idOfCtrl(ctrl) {
            return ctrl && (ctrl.features||[]).filter(f=>f.$ == 'id').map(f=>f.id)[0]
        }
    }
}

})()