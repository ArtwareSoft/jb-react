(function() {
const st = jb.studio
jb.ns('animation')

jb.component('studio.position-of-data', {
    type: 'position',
    params: [
        {id: 'path', as: 'string'},
    ],
    impl: (ctx,path) => {
        const editor = editorOfPath(path)
        if (!editor) return []
        const positions = posOfData(path)
        if (positions.length == 0)
            positions.push([0,0,0,0])
        const asPoints = positions.map(pos=>editor.charCoords({line: pos[0], col: pos[1]}))
        return enrichWithCenter({
            top: Math.min(...asPoints.map(x=>x.top)),
            left: Math.min(...asPoints.map(x=>x.left)),
            right: Math.max(...asPoints.map(x=>x.right)),
            bottom: Math.max(...asPoints.map(x=>x.bottom)),
        })
    }
})

function editorOfPath(path) {
    const resource = path.split('~')[0]
    const dialog_elem = Array.from(document.querySelectorAll('[dialogId=edit-data-resource]'))
        .filter(el=>el._component.ctx.data.path.split('data-resource.').pop() == resource + '~watchableData')[0]
    return dialog_elem && dialog_elem.querySelector('.CodeMirror').parentElement._component.editor
}

function posOfData(path) {
    const editor = editorOfPath(path)
    if (!editor) return []
    const map = editor.data_ref.locationMap
    const innerPath = path.split('~').slice(1).join('~')
    return jb.entries(map).filter(e=>e[0].split('~watchableData~')[1].split('~!')[0] == innerPath)
        .map(e=>e[1].positions)
}

function highlightData(path) {
    const editor = editorOfPath(path)
    posOfData(path).forEach(pos=>editor.markText({line: pos[0], col: pos[1]}, {line: pos[2], col: pos[3]}))
}

function enrichWithCenter(e) {
    return Object.assign(e,{
        centerY: Math.floor((e.top + e.bottom)/2), centerX: Math.floor((e.left + e.right)/2)
    })
}

function fixPreviewOffset(e) {
    const previewOffset = jb.ui.offset(document.querySelector('.preview-iframe'))
    return Object.assign(e,{ centerX: e.centerX + previewOffset.x, centerY: e.centerY + previewOffset.y })
}

function elemsOfCtx(ctx)  {
    let elems = Array.from(st.previewWindow.document.querySelectorAll(`[jb-ctx="${ctx.id}"]`))
    return elems.length ? elems : Array.from(st.previewWindow.document.querySelectorAll('[jb-ctx]'))
            .filter(e=>{
                const _ctx = st.previewWindow.jb.ctxDictionary[e.getAttribute('jb-ctx')];
                return _ctx && _ctx.path == ctx.path
    })
}

function positionsOfCtx(ctx)  {
    return elemsOfCtx(ctx).map(el => fixPreviewOffset(enrichWithCenter(jb.ui.offset(el))))
}

jb.component('studio.animate-watch-ref-particle', {
    type: 'action',
    params: [
        {id: 'from'},
        {id: 'to'},
    ],
    impl: openDialog({
        style: studio.dialogParticleStyle(),
        content: label({
          title: '➤',
          features: [
            css((ctx,{},{from,to}) => {
                const dx = (to.centerX - from.centerX) || 1, dy = (to.centerY - from.centerY) || 1
                const addPI = dx < 0 ? 3.14 : 0
                return `transform: rotate(${addPI+Math.atan(dx/dy)}rad)`
            }),
            feature.onEvent({
            event: 'load',
            action: runActions(
              animation.start({
                  animation: animation.moveTo({
                        X: animation.range('%$from/centerX%', '%$to/centerX%'),
                        Y: animation.range('%$from/centerY%', '%$to/centerY%')
                     }),
                  duration: '1000'
                }),
              dialog.closeContainingPopup()
            )
          })]
        }),
    })
})

jb.component('studio.animate-cmp-destroy', {
    type: 'action',
    params: [
        {id: 'pos'},
    ],
    impl: openDialog({
        style: studio.dialogParticleStyle(),
        content: label({
          title: '◯',
          features: [ 
            css('color: grey'),
            feature.onEvent({
                event: 'load',
                action: runActions(
                    animation.start({
                        animation: animation.moveTo({
                            X: '%$pos/centerX%',
                            Y: '%$pos/centerY%'
                        }),
                        duration: '1'
                    }),
                    animation.start({
                        animation: [
                        animation.scale({scale: animation.range('0.1', '3')}),
                        animation.easing(animation.inOutEasing('Cubic', 'Out'))
                        ],
                        direction: 'reverse',
                        duration: '1000'
                    }),
                dialog.closeContainingPopup()
                )
          })]
        }),
    })
})

jb.component('studio.animate-cmp-refresh', {
    type: 'action',
    params: [
        {id: 'pos'},
    ],
    impl: openDialog({
        style: studio.dialogParticleStyle(),
        content: label({
          title: '▯',
          features: feature.onEvent({
            event: 'load',
            action: runActions(
                animation.start({
                    animation: animation.moveTo({
                        X: '%$pos/centerX%',
                        Y: '%$pos/centerY%'
                    }),
                    duration: '1'
                }),
                animation.start({
                    animation: animation.rotate('5turn'),
                    duration: '1000'
                }),
              dialog.closeContainingPopup()
            )
          })
        }),
    })
})

function animateCtxRefresh(ctx) {    
    jb.exec(
        animation.start({
            animation: [
                animation.rotate({rotateY: () => [0,25]}),
                animation.easing(animation.inOutEasing('Quad', 'InOut'))
            ],
            duration: '600',
            direction: 'alternate',
            target: () => elemsOfCtx(ctx)
        })
    )
}

function animateCtxDestroy(ctx) {    
    jb.exec(
        animation.start({
            animation: [
                animation.scale({scale: () => [1,0.1]}),
                animation.easing(animation.inOutEasing('Quad', 'InOut'))
            ],
            duration: '600',
            direction: 'alternate',
            target: () => elemsOfCtx(ctx)
        })
    )
}


jb.studio.activateWatchRefViewer = () => {
    if (!st.previewjb.spy)
        st.previewjb.initSpy({})
    st.previewjb.spy.setLogs('registerCmpObservable,notifyCmpObservable,destroyCmp,setState')

    const delayedSpy = jb.rx.Observable.zip(
            jb.rx.Observable.interval(300),
            st.previewjb.spy.observable()
    ).map(z=>z[1])
    
    delayedSpy.filter(e=>e.logName === 'registerCmpObservable').subscribe(e=> {
            const ref = e.record[0].ref
            const ctx = e.record[0].cmp.ctx
            const path = ref && jb.refHandler(ref).pathOfRef(ref).join('~')
            if (!editorOfPath(path)) return
            jb.studio.highlightCtx(ctx)
            highlightData(path)
            positionsOfCtx(ctx).forEach(pos => jb.exec(studio.animateWatchRefParticle(
                () => pos,
                studio.positionOfData(path)
            )))
    })
    delayedSpy.filter(e=>e.logName === 'notifyCmpObservable')
        .subscribe(e=> {
            const ref = e.record[3].ref
            const ctx = e.record[3].cmp.ctx
            const path = ref && jb.refHandler(ref).pathOfRef(ref).join('~')
            if (!editorOfPath(path)) return
            jb.studio.highlightCtx(ctx)
            highlightData(path)
            positionsOfCtx(ctx).forEach(pos => jb.exec(studio.animateWatchRefParticle(
                studio.positionOfData(path),
                () => pos,
            )))
    })

    delayedSpy.filter(e=>e.logName === 'destroyCmp').subscribe(e =>
        positionsOfCtx(e.record[0].ctx).forEach(pos=>
            jb.exec(studio.animateCmpDestroy({pos}))))

    delayedSpy.filter(e=>e.logName === 'setState').subscribe(e => 
        animateCtxRefresh(e.record[1]))
}

})()