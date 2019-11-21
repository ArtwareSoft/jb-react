(function() {
const st = jb.studio
jb.ns('animation')

jb.component('studio.position-of-data', {
    type: 'position',
    params: [
        {id: 'path', as: 'string'},
    ],
    impl: (ctx,path) => {
        const resource = path.split('~')[0]
        const innerPath = path.split('~').slice(1).join('~')
        const dialog_elem = Array.from(document.querySelectorAll('[dialogId=edit-data-resource]'))
            .filter(el=>el._component.ctx.data.path.split('data-resource.').pop() == resource + '~watchableData')[0]
        if (!dialog_elem) {
            return { centerX: 300, centerY: 100}
        }
        const cm_elem = dialog_elem.querySelector('.CodeMirror')
        const editor = cm_elem.parentElement._component.editor
        const map = editor.data_ref.locationMap
        const positions = jb.entries(map).filter(e=>e[0].split('~watchableData~')[1].split('~!')[0] == innerPath)
            .map(e=>e[1].positions)
        if (positions.length == 0)
            positions.push({line: 0, col: 0})
        const asPoints = positions.map(pos=>editor.charCoords(pos))
        return enrichWithCenter({
            top: Math.min(...asPoints.map(x=>x.top)),
            left: Math.min(...asPoints.map(x=>x.left)),
            right: Math.max(...asPoints.map(x=>x.right)),
            bottom: Math.max(...asPoints.map(x=>x.bottom)),
        })
    }
})

function enrichWithCenter(e) {
//    const previewOffset = jb.ui.offset(document.querySelector('.preview-iframe'))
    return Object.assign(e,{
        centerY: Math.floor((e.top + e.bottom)/2), // + previewOffset.y,
        centerX: Math.floor((e.left + e.right)/2) //+ previewOffset.x 
    })
}

function fixPreviewOffset(e) {
        const previewOffset = jb.ui.offset(document.querySelector('.preview-iframe'))
        return Object.assign(e,{ centerX: e.centerX + previewOffset.x, centerY: e.centerY + previewOffset.y })
}

jb.component('studio.position-of-ctx', {
    type: 'position',
    params: [
        {id: 'ctxId', as: 'string'},
    ],
    impl: (ctx,ctxId) => Array.from(st.previewWindow.document.querySelectorAll(`[jb-ctx="${ctxId}"]`))
        .map(el => fixPreviewOffset(enrichWithCenter(jb.ui.offset(el))))
})

jb.component('studio.animate-watch-ref-particle', {
    type: 'action',
    params: [
        {id: 'from'},
        {id: 'to'},
    ],
    impl: openDialog({
        style: studio.dialogParticleStyle(),
        content: label({
          title: '◯',
          features: feature.onEvent({
            event: 'load',
            action: runActions(
              animation.start({
                  animation: animation.moveTo({
                    X: animation.range('%$from/centerX%', '%$to/centerX%'),
                    Y: animation.range('%$from/centerY%', '%$to/centerY%')
                  }),
                  duration: '2000'
                }),
              dialog.closeContainingPopup()
            )
          })
        }),
    })
})

jb.studio.activateWatchRefViewer = () => {
    if (!st.previewjb.spy)
        st.previewjb.initSpy({})
    st.previewjb.spy.setLogs('registerCmpObservable,notifyCmpObservable')

    jb.rx.Observable.zip(
            jb.rx.Observable.interval(300),
            st.previewjb.spy.observable().filter(e=>e.logName === 'registerCmpObservable')
        ).map(z=>z[1])
        .subscribe(e=> {
            const ref = e.record[0].ref
            const ctx = e.record[0].cmp.ctx
            const path = ref && jb.refHandler(ref).pathOfRef(ref)
            new jb.jbCtx().run(studio.animateWatchRefParticle(
                studio.positionOfCtx(ctx.id),
                studio.positionOfData(path.join('~'))
            ))
    })
    st.previewjb.spy.observable().filter(e=>e.logName === 'notifyCmpObservable')
        .delay(500)
        .subscribe(e=> {
            const ref = e.record[1].ref
            const ctx = e.record[1].cmp.ctx
            const path = ref && jb.refHandler(ref).pathOfRef(ref)
            new jb.jbCtx().run(studio.animateWatchRefParticle(
                studio.positionOfData(path.join('~')),
                studio.positionOfCtx(ctx.id),
            ))
    })
}

})()