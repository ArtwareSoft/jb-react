jb.dsl('zui')

jb.component('zui.multiStage', {
  type: 'control<>',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'stages', type: 'stage<zui>[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'multiStageStyle<zui>', dynamic: true, defaultValue: multiStageStyle() },
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiStageStyle', {
  type: 'multiStageStyle',
  impl: customStyle({
    typeCast: 'style',
    template: ({},{},h) => h('canvas',{width: 600, height: 460}),
    features: [
      calcProps((ctx,{$model})=> {
        const items = $model.items()
        // TODO: move to model
        const DIM = 256
        const _greens = jb.d3.lib().scaleSequential(jb.frame.d3.interpolateLab('green','white'))
        const greens = x => jb.frame.d3.color(_greens(x))
        const pivots = { x: pivot('price'), y: pivot('hits') }
        const stages = $model.stages()
        const summaryLabel = item => `${item.title} (${item.price}, ${item.hits})`

        return {
            DIM, stages, items, pivots, summaryLabel, scales: { greens }, 
            center: [DIM* 0.5, DIM* 0.5], stage: 0 , zoom: DIM
        }

        function pivot(att) {
            items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
            return { att, scale: x => x[`scale_${att}`] }
        }
      }),
      frontEnd.coLocation(),
      frontEnd.init(async ({},{cmp, el, $props}) => {
            const props = cmp.props = $props
            const gl = null //el.getContext('webgl')
            Object.assign(props, { glCanvas: el, gl, aspectRatio: el.width/el.height })
            jb.zui.initCmp(cmp,props,props.stages, el)
            await Promise.all(props.stages.map(st=>st.prepare && st.prepare()).filter(x=>x))
            cmp.firstRender()
      }),
      frontEnd.prop('zuiEvents', rx.subject()),
      frontEnd.flow(
        source.frontEndEvent('pointerdown'),
        rx.var('pid', '%pointerId%'),
        rx.do(({},{cmp,pid}) => cmp.addPointer(pid)),
        rx.flatMap(
          rx.mergeConcat(
            rx.pipe(
              source.event('pointermove'),
              rx.filter('%$pid%==%pointerId%'),
              rx.do(({data},{cmp,pid}) => cmp.updatePointer(pid,data)),
              rx.takeUntil(rx.pipe(source.frontEndEvent('pointerup'), rx.filter('%$pid%==%pointerId%')))
            ),
            rx.pipe(
              source.interval(100),
              rx.do(({},{cmp,pid}) => cmp.applyFriction(pid)),
              rx.log('zui momentum'),
              rx.takeWhile(({},{cmp,pid}) => cmp.hasVelocity(pid))
            ),
            rx.pipe(source.data(1), rx.do(({data},{cmp}) => cmp.removePointer(data.pointerId)))
          )
        ),
        rx.flatMap(source.data(({},{cmp}) => cmp.zoomEventFromPointers())),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(
        source.subject('%$cmp.zuiEvents%'),
        rx.map('%$cmp.props.stage%'),
        rx.distinctUntilChanged(),
        rx.var('stage'),
        sink.action(({},{cmp}) => {
              const props = cmp.props, stage = props.stages[props.stage]
              if (!isNaN(props.formerStage))
                stage.release && stage.release()

              props.itemsPositions = stage.calcItemsPositions(props)
              props.buffers = stage.prepareGPU(props)
              props.formerStage = props.stage
          })
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), sink.action('%$cmp.render()%')),
      frontEnd.flow(
        source.frontEndEvent('wheel'),
        rx.log('zui wheel'),
        rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 0.9 : 1 })),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      )
    ]
  })
})

jb.extension('zui','multiStage', {
  initCmp(cmp,props,stages,el) {
    const DIM = props.DIM, w = el.offsetWidth, h = el.offsetHeight

    Object.assign(cmp, {
      zoomEventFromPointers() {
          return cmp.pointers.length == 0 ? [] : cmp.pointers[1] 
              ? [{ p: avg('p'), v: avg('v'), dz: cmp.pointers[0].dgap > 0 ? 0.92 : 1.08 }]
              : [{ v: cmp.pointers[0].v }]
      
          function avg(att) {
            const pointers = cmp.pointers.filter(p=>p[att])
            return [0,1].map(axis => pointers.reduce((sum,p) => sum + p[att][axis], 0) / pointers.length)
          }
      },
      updateZoomState({ dz, v }) {
        if (dz)
          props.zoom *= dz
        if (v)
          props.center = [props.center[0] - v[0]/w*props.zoom, props.center[1] + v[1]/h*props.zoom]

        Object.assign(props, cmp.currentStage())
        jb.log('zui event',{dz, v, zoom: props.zoom, center: props.center, cmp})
      },
      currentStage() {
          const zoom = props.zoom
          if (zoom > DIM)
              return { stage: 0, zoom: DIM }
          if (zoom < 1)
              return { stage: stages.length-1, zoom: 1 }

          for(let i=0;i<stages.length;i++) {
              const {fromZoom, toZoom} = stages[i]
              if (fromZoom >= zoom && zoom > toZoom)
                  return { stage: i, zoom }
          }
      },
      render() {
        stages[props.stage].renderGPUFrame(props)
      },
      firstRender() {
        const stage = stages[0]
        props.itemsPositions = stage.calcItemsPositions(props)
        props.buffers = stage.prepareGPU(props)
        stage.renderGPUFrame(props)      
      },

      pointers: [],
      findPointer(pid) { return this.pointers.find(x=>x.pid == pid) },
      addPointer(pid) { this.pointers.push({pid}); },
      removePointer(pid) { this.pointers.splice(this.pointers.findIndex(x=>x.pid == pid), 1)} ,
      updatePointer(pid,sourceEvent) {
        const pointer = this.pointers.find(x=>x.pid == pid)
        pointer.dt = sourceEvent.timeStamp - (pointer.time || 0)
        pointer.time = sourceEvent.timeStamp
        const [x,y] = [sourceEvent.offsetX, sourceEvent.offsetY]
        const v = pointer.dt > 500 ? [0,0] : [x - pointer.p[0], y - pointer.p[1]]
        pointer.vAvg = pointer.v * 0.8 + v *0.2
        pointer.v = v
        pointer.p = [x,y]
        pointer.sourceEvent = sourceEvent

        const otherPointer = this.pointers.length > 1 && this.pointers.find(x=>x.pid != pid)
        if (otherPointer) {
            const gap = Math.hypot(...[0,1].map(axis => Math.abs(pointer.p[axis] - otherPointer.p[axis])))
            otherPointer.dgap = pointer.dgap = gap - (pointer.gap || 0)
            otherPointer.gap = pointer.gap = gap
        }
        jb.log('zui update pointers', {v: `[${pointer.v[0]},${pointer.v[1]}]` , pointer, otherPointer, cmp})
      },
      applyFriction(pid) {
        const pointer = this.pointers.find(x=>x.pid == pid)
        if (!pointer) return []

        if (pointer.vAvg) {
          pointer.v = pointer.vAvg
          pointer.vAvg = 0
        }
        const force = 0.5
        ;[0,1].forEach(axis => {
          pointer.v[axis] *= 0.9
          if (Math.abs(pointer.v[axis]) < 1) pointer.v[axis] = 0
              // const sign = Math.sign(pointer.v[axis]), v = Math.abs(pointer.v[axis])
              // pointer.v[axis] = sign * Math.max(0,v-force)
        })
      },
      hasVelocity(pid) {
        const pointer = this.pointers.find(x=>x.pid == pid)
        return pointer.v[0] != 0 || pointer.v[1] != 0
      }
    })
  }
})