(function() {
const st = jb.studio
jb.ns('animation')

jb.component('studio.positionOfData', {
  type: 'position',
  params: [
    {id: 'path', as: 'string'}
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
        .filter(el=>el._component.ctx.data.path.split('dataResource.').pop() == resource + '~watchableData')[0]
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

jb.component('studio.animateWatchRefParticle', {
  type: 'action',
  params: [
    {id: 'from'},
    {id: 'to'}
  ],
  impl: openDialog({
    style: studio.dialogParticleStyle(),
    content: text({
      text: '➤',
      features: [
        css(
          (ctx,{},{from,to}) => {
                const dx = (to.centerX - from.centerX) || 1, dy = (to.centerY - from.centerY) || 1
                const addPI = dx < 0 ? 3.14 : 0
                return `transform: rotate(${addPI+Math.atan(dx/dy)}rad)`
            }
        ),
        feature.onEvent({
          event: 'load',
          action: runActions(
            {
                '$': 'animation.start',
                animation: {
                  '$': 'animation.moveTo',
                  X: {'$': 'animation.range', '$byValue': ['%$from/centerX%', '%$to/centerX%']},
                  Y: {'$': 'animation.range', '$byValue': ['%$from/centerY%', '%$to/centerY%']}
                },
                duration: '1000'
              },
            dialog.closeContainingPopup()
          )
        })
      ]
    })
  })
})

jb.component('studio.animateCmpDestroy', {
  type: 'action',
  params: [
    {id: 'pos'}
  ],
  impl: openDialog({
    style: studio.dialogParticleStyle(),
    content: text({
      text: '◯',
      features: [
        css('color: grey'),
        feature.onEvent({
          event: 'load',
          action: runActions(
            {
                '$': 'animation.start',
                animation: {'$': 'animation.moveTo', X: '%$pos/centerX%', Y: '%$pos/centerY%'},
                duration: '1'
              },
            {
                '$': 'animation.start',
                animation: [
                  {
                    '$': 'animation.scale',
                    scale: {'$': 'animation.range', '$byValue': ['0.1', '3']}
                  },
                  {
                    '$': 'animation.easing',
                    '$byValue': [{'$': 'animation.inOutEasing', '$byValue': ['Cubic', 'Out']}]
                  }
                ],
                direction: 'reverse',
                duration: '1000'
              },
            dialog.closeContainingPopup()
          )
        })
      ]
    })
  })
})

jb.component('studio.animateCmpRefresh', {
  type: 'action',
  params: [
    {id: 'pos'}
  ],
  impl: openDialog({
    style: studio.dialogParticleStyle(),
    content: text({
      text: '▯',
      features: feature.onEvent({
        event: 'load',
        action: runActions(
          {
              '$': 'animation.start',
              animation: {'$': 'animation.moveTo', X: '%$pos/centerX%', Y: '%$pos/centerY%'},
              duration: '1'
            },
          {
              '$': 'animation.start',
              animation: {'$': 'animation.rotate', '$byValue': ['5turn']},
              duration: '1000'
            },
          dialog.closeContainingPopup()
        )
      })
    })
  })
})

jb.component('animate.refreshElem', {
  type: 'action',
  params: [
    {id: 'elem'}
  ],
  impl: action.if(
    '%$studio/settings/activateWatchRefViewer%',
    {
      '$': 'animation.start',
      animation: [
        {'$': 'animation.rotate', rotateY: () => [0,25]},
        {
          '$': 'animation.easing',
          '$byValue': [{'$': 'animation.inOutEasing', '$byValue': ['Quad', 'InOut']}]
        }
      ],
      duration: '600',
      direction: 'alternate',
      target: '%$elem%'
    }
  )
})


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
  const {pipe,filter,subscribe} = jb.callbag

    if (!st.previewjb.spy)
        st.previewjb.initSpy({})
    st.previewjb.spy.setLogs('registerCmpObservable,notifyCmpObservable,destroyCmp,setState')

    // const delayedSpy = jb.callbag.zip(
    //         jb.callbag.interval(100),
    //         st.previewjb.spy.observable()
    // ).map(z=>z[1])
    const delayedSpy = st.previewjb.spy.observable()

    pipe(delayedSpy, filter(e=>e.logName === 'registerCmpObservable'), subscribe(e=> {
            const ref = e.record[0].ref
            const ctx = e.record[0].ctx
            const path = ref && jb.refHandler(ref).pathOfRef(ref).join('~')
            if (!editorOfPath(path)) return
            jb.studio.highlightCtx(ctx)
            highlightData(path)
            positionsOfCtx(ctx).forEach(pos => jb.exec(studio.animateWatchRefParticle(
                () => pos,
                studio.positionOfData(path)
            )))
    }))
    pipe(delayedSpy, filter(e=>e.logName === 'notifyCmpObservable'),
        subscribe(e=> {
            const ref = e.record[3].ref
            const ctx = e.record[3].srcCtx
            const path = ref && jb.refHandler(ref).pathOfRef(ref).join('~')
            if (!editorOfPath(path)) return
            jb.studio.highlightCtx(ctx)
            highlightData(path)
            positionsOfCtx(ctx).forEach(pos => jb.exec(studio.animateWatchRefParticle(
                studio.positionOfData(path),
                () => pos,
            )))
    }))

    pipe(delayedSpy,filter(e=>e.logName === 'destroyCmp'), subscribe(e =>
        positionsOfCtx(e.record[0].ctx).forEach(pos=>
            jb.exec(studio.animateCmpDestroy({pos})))))

    pipe(delayedSpy,filter(e=>e.logName === 'setState'), subscribe(e =>
        jb.exec(animate.refreshElem(elemsOfCtx(e.record[0].ctx)))))
}

})()