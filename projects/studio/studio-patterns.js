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
        const target = jb.studio.compNameOfPath(targetPath)
        const {params, suggestions} = jb.ui.stylePatterns[target] && jb.ui.stylePatterns[target](extractedCtrl) || {}
        if (!params) return []
        const previewCtx = jb.studio.closestCtxInPreview(ctx.exp('%$targetPath%')).ctx
        return suggestions.filter(x => checkConstraints(x)).map(x=>mark(x)).sort((x,y) => y.mark - x.mark)

        function checkConstraints(sugg) {
            return constraints.reduce((res,cons) => res && cons.match(sugg),true)
        }

        function mark(sugg) {
            const mark = Object.keys(params).reduce((res,p) => res + paramDiff(p),0)
            return {...sugg, mark}

            function paramDiff(p) {
                if (params[p].type == 'text') {
                    const dropValue = previewCtx && previewCtx.run(params[p].dropValue) || ''
                    const draggedValue = sugg._patternInfo.paramValues[p].draggedValue || ''
                    return Math.abs(dropValue.length - draggedValue.length)
                }
                if (params[p].type == 'image') {
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
        match: sugg => sugg._patternInfo.mapping[path] == value
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

function calcContentMap(ctrl) {
    const ar = flatContent(ctrl,'')
    return { ar, ...jb.objFromEntries(ar.map(x=>([x.path,x])))}
}

jb.ui.stylePatterns = {
    text(extractedCtrl) {
        const content = flatContent(extractedCtrl,'')
        const texts = content.filter(x=>x.ctrl.$ == 'text')
        const value = '%$textModel/text%'
        const params = {text: { dropValue: value, type: 'text'}}
        const suggestions = texts.flatMap(text=> {
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
        return {params, suggestions}
    },
    card(extractedCtrl) {
        const content = flatContent(extractedCtrl,'')
        const contentMap = jb.objFromEntries(content.map(x=>([x.path,x])))
        const images = content.filter(x=>x.ctrl.$ == 'image')

        return jb.unique(images.flatMap(x=>[imageToCardPattern(x.path)]), x=>JSON.stringify(x))
            .map(pattern => ({pattern, instances: findPatternInstances(pattern)}))

        function imageToCardPattern(imgPath) {
            return parents(imgPath).reduce((acc,x) => acc || (acc = cardPattern(x)), null)
        }

        function cardPattern(path) {
            const subPaths = content.filter(x=>x.path.indexOf(path) == 0)
            const image = subPaths.filter(x=>x.ctrl.$ == 'image').map(x=>x.path.slice(path.length+1))
            const text = subPaths.filter(x=>x.ctrl.$ == 'text').map(x=>x.path.slice(path.length+1))
            if (image && text)
                return {image,text}
        }
        function findPatternInstances(pattern) {
            const imageDepth = pattern.image[0].split('/').length
            return content.filter(x=>x.image).map(x=>parents(x.path)[imageDepth])
                .filter(base=> hasTexts(base, pattern.text,content))
                .map(path=>({path,
                    elem: pathToObj(target_el,path) }))
        }
    }
}

})()