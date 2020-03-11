(function(){
jb.component('studio.extract-style', {
    type: 'action',
    params: [
        {id: 'extractedCtrl'},
        {id: 'targetPath', as: 'string'},
    ],
    impl: openDialog({
        content: itemlist ({
            items: studio.suggestedStyles('%$extractedCtrl%',studio.compName('%$targetPath%')),
            control: '%%',
            features: [
                itemlist.selection({
                    onDoubleClick: runActions(
                        writeValue(studio.ref('%$targetPath%~style'),'%%'),
                        dialog.closeContainingPopup()
                    ),
                })
            ]
        }),
        title: 'select style',
        features: dialogFeature.uniqueDialog('unique')
    })
})

jb.component('studio.suggested-styles', {
    params: [
        {id: 'extractedCtrl'},
        {id: 'target', as: 'string'},
    ],
    impl: (ctx,extractedCtrl,target) =>
        jb.ui.stylePatterns[target] && jb.ui.stylePatterns[target](extractedCtrl)
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
        return texts.flatMap(text=> {
            const boundedCtrl = JSON.parse(JSON.stringify(extractedCtrl))
            jb.path(boundedCtrl,[...text.path.split('/'),'text'],'%$textModel/text%')
            return parents(text.path,true).map(path => pathToObj(boundedCtrl, path))
                .map(ctrl => styleByControl(ctrl,'textModel' ))
        })
    },
    card(extractedCtrl) {
        const content = calcContent(extractedCtrl)
        const images = content.filter(x=>x.ctrl.$ == 'image')
        return jb.unique(images.flatMap(x=>[imageToCardPattern(x.path)]), x=>JSON.stringify(x))
            .map(pattern => ({pattern, instances: findPatternInstances(pattern)}))

    function cardPattern(path) {
        const subPaths = contentAr.filter(x=>x.path.indexOf(path) == 0)
        const image = subPaths.filter(x=>x.image).map(x=>x.path.slice(path.length+1))
        const text = subPaths.filter(x=>x.text).map(x=>x.path.slice(path.length+1))
        if (image && text)
            return {image,text}
    }
    function findPatternInstances(pattern) {
        const imageDepth = pattern.image[0].split('/').length
        return contentAr.filter(x=>x.image).map(x=>parents(x.path)[imageDepth])
            .filter(base=> hasTexts(base, pattern.text,content))
            .map(path=>({path,
                elem: pathToObj(target_el,path) }))
    }
    function imageToCardPattern(imgPath) {
        return parents(imgPath).slice(1).reduce((acc,x) => acc || (acc = cardPattern(x)), null)
    }    
    }
}  

})()