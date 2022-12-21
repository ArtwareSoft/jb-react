jb.dsl('zui')

jb.component('zui.multiStage', {
  type: 'control<>',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'stages', type: 'control<>[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'multiStageStyle', dynamic: true, defaultValue: zui.multiStageStyle()},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('zui.multiStageStyle', {
    type: 'multiStageStyle',
    impl: customStyle({
      typeCast: 'style',
      template: ({},{},h) => h('canvas',{width: 600, height: 460}),
      features: [
        frontEnd.requireExternalLibrary(['d3-scale.js','d3-color.js','d3-interpolate.js']),
        frontEnd.init(({},{cmp, el}) => {
            jb.zui.gpu(el, cmp) 
            cmp.pointers = []

            cmp.calcHighLevelEvent = function() {
                return cmp.pointers[1] 
                    ? ({$: 'zoom', p: avg('p'), v: avg('v'), dz: cmp.pointers[0].dgap > 0 ? 1.1 : 0.9 }) 
                    : ({$: 'pan', v: cmp.pointers[0].v })
            
                function avg(att) {
                    return [0,1].map(axis => Math.avg(...[0,1].map(pointer => cmp.pointers[pointer][att][axis])))
                }
            }
        }),
        frontEnd.method('addPointer',({},{cmp,pid}) => cmp.pointers.push({pid}) ),
        frontEnd.method('removePointer',({},{cmp,pid}) => cmp.pointers.splice(cmp.pointers.findIndex(x=>x.pid == pid), 1) ),
        frontEnd.method('updatePointer',({},{cmp,pid,sourceEvent}) => {
            const pointer = cmp.pointers.find(x=>x.pid == pid)
            const t = new Date().time(), dt = t - (pointer.time || 0)
            pointer.time = t 
            pointer = pointer || [sourceEvent.offsetX, sourceEvent.offsetY]
            pointer.v = dt > 50 ? [0,0] : [sourceEvent.offsetX - pointer.p[0], sourceEvent.offsetY - pointer.p[1]]
            pointer.p = [sourceEvent.offsetX, sourceEvent.offsetY]

            const otherPointer = cmp.pointer.length > 1 && cmp.pointers.find(x=>x.pid != pid)
            if (otherPointer) {
                const gap = Math.hypot(...[0,1].map(axis => Math.abs(pointer.p[axis] - otherPointer.p[axis])))
                otherPointer.dgap = pointer.dgap = gap - (pointer.gap || 0)
                otherPointer.gap = pointer.gap = gap
            }
        }),
        frontEnd.method('applyFriction',({},{cmp,pid}) => {
            const force = 10
            ;[0,1].forEach(axis => {
                const sign = Math.sign(cmp.pointers[pid].v[axis]), v = Math.abs(cmp.pointers[pid].v[axis])
                cmp.pointers[pid].v[axis] = sign * Math.max(0,v-force)
                cmp.pointers[pid].p[axis] += cmp.pointers[pid].v[axis]
            })
        }),        
        frontEnd.flow(
            source.frontEndEvent('pointerdown'),
            rx.var('pid','%pointerId%'), rx.do(runFEMethod('addPointer')), 
            rx.concatMap(
                rx.pipe(
                    source.event('pointermove'),
                    rx.filter('%$pid%==%pointerId%'),
                    rx.takeUntil(source.event('pointerup')),
                    rx.do(runFEMethod('updatePointer'))
                ),
                rx.pipe(
                    source.interval(100),
                    rx.do(runFEMethod('applyFriction')),
                    rx.log('momentum'),
                    rx.takeUntil(({},{cmp,pid}) => cmp.pointers[pid].v[0] == 0 && cmp.pointers[pid].v[1] == 0),
                ),
            ),
            rx.map(({},{cmp}) => cmp.calcHighLevelEvent()),
            rx.subscribe({
                next: ({data},{cmp}) => cmp.handleZoomEvent(data),
                finally: runFEMethod('removePointer')
            }),
        ),
        frontEnd.flow(
            source.frontEndEvent('wheel'),
            rx.log('zoom'),
            sink.action(({},{cmp, sourceEvent, el}) => {
                const dz = sourceEvent.deltaY > 0 ? 0.9 : sourceEvent.deltaY < 0 ? 1.1 : 1
                const x = sourceEvent.offsetX, y = sourceEvent.offsetY
                const [w,h] = [el.offsetWidth, el.offsetHeight]
                cmp.zoom(dz, {x: x-w/2, y: y-h/2 })
            })
        )
    ]
    })
})