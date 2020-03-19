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
          ctx => {
              const previewCtx = jb.studio.closestCtxInPreview(ctx.exp('%$targetPath%'))
              const res = (new jb.studio.previewjb.jbCtx()).ctx(previewCtx)
                .setVar('$runAsWorker','preview')
                .setVar('widgetId',ctx.id)
                .run(ctx.exp('%$__option%'))
              //jb.ui.workerStyleElems.preview
              return res
          },
          button({
            title: 'select (%$__option/length%)',
            action: runActions(
                Var('styleSuffix', If(equals('%$__option/style/$%','group'),'','~style')),
                writeValue(studio.ref('%$targetPath%%$styleSuffix%'), '%$__option/style%'),
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
        const srcContent = flatContent(extractedCtrl,'')
        const types = ['button','image','text']
        const srcParams = types.flatMap(type=> srcContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: `${type}${i}`, origValue: elem.ctrl, type, path: elem.path} )))
        const srcParamsMap = jb.objFromEntries(srcParams.map(p=>[p.id,p]))
        const trgParams = types.flatMap(type=> targetContent.filter(x=>x.ctrl.$ == type).map((elem,i)=>(
            { id: `${type}${i}`, origValue: elem.ctrl, type, path: elem.path} )))
        const trgParamsMap = jb.objFromEntries(trgParams.map(p=>[p.id,p]))
        const _permutations = types.map(type => permutations(srcParams.filter(x=>x.type == type).map(p=>p.id), trgParams.filter(x=>x.type == type).map(p=>p.id)))
        const rawOptions = combinations(_permutations.filter(x=>x.length)).map(comb => comb.split(';')
            .map(match=> ({ src: srcParamsMap[match.split('-')[0]], trg: trgParamsMap[match.split('-')[1]] })))

        const options = rawOptions.map(matches => matchesToOption(matches,''))
        return {params: trgParams, options}

        function permutations(srcIds,trgIds) {
            return srcIds.flatMap( (srcId,srcI) => trgIds.flatMap( (trgId,trgI) => {
                    const resultWithoutPair = permutations([...srcIds.slice(0,srcI),...srcIds.slice(srcI+1) ], 
                        [...trgIds.slice(0,trgI),...trgIds.slice(trgI+1) ] )
                    return [...resultWithoutPair,`${srcId}-${trgId}`]
            }))
        }
        function combinations(arrOfMatches) {
            if (arrOfMatches.length == 0) return []
            if (arrOfMatches.length == 1) return arrOfMatches[0]
            return arrOfMatches[0].flatMap(m1 => combinations(arrOfMatches.slice(1)).map(m2 =>`${m1};${m2}`))
        }

        function matchesToOption(matches,top) {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            const paramValues = {}
            matches.forEach(match => {
                const paramProp = paramProps[match.trg.type]
                const overridePath = [...match.src.path.split('/'), paramProp] 
                const draggedValue = jb.path(boundedCtrl,overridePath)
                paramValues[match.trg.id] = {overridePath, draggedValue}
                jb.path(boundedCtrl,overridePath, match.trg.origValue[paramProp]) // set value
            })
            const ctrl = pathToObj(boundedCtrl, top)
            return {...ctrl, _patternInfo: { top, paramValues }, features: [...jb.asArray(target.features),...jb.asArray(ctrl.features)] }
        }
    },
}

})()