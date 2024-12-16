
component('zui.Zoom', {
  type: 'feature<>',
  impl: features()
})

component('zui.canvasZoom', {
  type: 'feature<zui>',
  impl: features(
    frontEnd.init((ctx,{uiTest}) => {
      jb.zui.initZoom(ctx)
      !uiTest && ctx.vars.cmp.updateZoomState({ dz :1, dp:0 })
    }),
    frontEnd.prop('zuiEvents', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('pointerdown'),
      rx.log('zui pointerdown'),
      rx.var('pid', '%pointerId%'),
      rx.do(({},{cmp,pid}) => cmp.addPointer(pid)),
      rx.flatMap(source.mergeConcat(
        rx.pipe(
          source.merge(source.event('pointermove'), source.frontEndEvent('pointerup')),
          rx.filter('%$pid%==%pointerId%'),
          rx.do(({data},{cmp,pid}) => cmp.updatePointer(pid,data)),
          rx.takeWhile('%type%==pointermove'),
          rx.flatMap(source.data(({},{cmp}) => cmp.zoomEventFromPointers()))
        ),
        rx.pipe(
          source.data(({},{cmp,pid}) => cmp.momentumEvents(pid)),
          rx.var('delay', '%delay%'),
          rx.flatMap(rx.pipe(source.data('%events%'))),
          rx.delay('%$delay%'),
          rx.log('momentum zui')
        ),
        rx.pipe(source.data(1), rx.do(({},{cmp,pid}) => cmp.removePointer(pid)))
      )),
      rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
      sink.subjectNext('%$cmp.zuiEvents%')
    ),
    frontEnd.flow(
      source.event('wheel', () => jb.frame.document, { options: obj(prop('capture', true)) }),
      rx.log('zui wheel'),
      rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 1/1.1 : 1 })),
      rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
      sink.subjectNext('%$cmp.zuiEvents%')
    )
  )
})

extension('zui','zoom', {
    initZoom(ctx) {
        const vars = ctx.vars
        const {widget, cmp, uiTest } =  vars
        if (uiTest) return
        const {state, canvas} = widget
        const w = canvas.offsetWidth, h = canvas.offsetHeight
        if (canvas.addEventListener && canvas.style) {
          canvas.style.touchAction = 'none'
          canvas.oncontextmenu = e => (e.preventDefault(), false)

          ;['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend']
              .forEach(event => canvas.addEventListener(event, e => e.preventDefault()))
        }
  
      Object.assign(cmp, {
        updatePointer(pid,sourceEvent) {
          const pointer = this.pointers.find(x=>x.pid == pid)
          if (!pointer) return
          const dt = pointer.dt = sourceEvent.timeStamp - (pointer.time || 0)
          const [x,y] = [sourceEvent.offsetX, sourceEvent.offsetY];
          const dp = (!pointer.p) ? [0,0] : [x - pointer.p[0], y - pointer.p[1]]
          const v = dt == 0 ? [0,0] : [0,1].map(axis => dp[axis]/dt)
          Object.assign(pointer, {
              time: sourceEvent.timeStamp,
              vAvg: pointer.v ? [0,1].map(axis=> pointer.v[axis] * 0.8 + v[axis] *0.2) : v,
              p: [x,y], v, dp, sourceEvent
          })
          const otherPointer = this.pointers.length > 1 && this.pointers.find(x=>x.pid != pid)
          if (otherPointer && otherPointer.p) {
              const gap = Math.hypot(...[0,1].map(axis => Math.abs(pointer.p[axis] - otherPointer.p[axis])))
              const dscale = (gap == 0  || pointer.gap == 0) ? 1 : pointer.gap / gap
              otherPointer.dscale = pointer.dscale = dscale
              otherPointer.gap = pointer.gap = gap
          }
          jb.log('zui update pointers', {v: `[${pointer.v[0]},${pointer.v[1]}]` , pointer, otherPointer, cmp, widget})
          if (this.pointers.length > 2) {
              jb.logError('zui more than 2 pointers', {pointers: this.pointers})
              this.pointers = this.pointers.slice(-2)
          }
        },      
        zoomEventFromPointers() {
          const pointers = this.pointers
          return pointers.length == 0 ? [] : pointers[1] 
              ? [{ p: avg('p'), dp: avg('dp'), v: avg('v'), dz: pointers[0].dscale }]
              : [{ v: pointers[0].v, dp: pointers[0].dp }]
      
          function avg(att) {
            const pointers = pointers.filter(p=>p[att])
            return [0,1].map(axis => pointers.reduce((sum,p) => sum + p[att][axis], 0) / pointers.length)
          }
        },
        updateZoomState({ dz, dp }) {
          let {tZoom, tCenter} =  state
          const factor = jb.ui.isMobile() ? 1.2 : 3
          if (dz)
            tZoom *= dz**factor
          const tZoomF = Math.floor(tZoom)
          if (dp)
            tCenter = [tCenter[0] - dp[0]/w*tZoomF, tCenter[1] + dp[1]/h*tZoomF]
  
          const gridSize  = cmp.vars.gridSize
          const maxDim = Math.max(gridSize[0],gridSize[1])
          const ZOOM_LIMIT = [1, jb.ui.isMobile() ? maxDim: maxDim]
          ;[0,1].forEach(axis=>tCenter[axis] = Math.min(gridSize[axis],Math.max(0,tCenter[axis])))
  
          tZoom = Math.max(ZOOM_LIMIT[0],Math.min(tZoom, ZOOM_LIMIT[1]))
          state.tZoom = tZoom
          state.tCenter = tCenter
  
          jb.log('zui event',{dz, dp, tZoom, tCenter, cmp, widget})
        },      
        animationStep() {
          let { tZoom, tCenter, zoom, center } = state
          if ( zoom == tZoom && center[0] == tCenter[0] && center[1] == tCenter[1] && !this.renderRequest) 
            return [] // no rendering
          // used at initialiation
          zoom = zoom || tZoom
          ;[0,1].forEach(axis=>center[axis] = center[axis] == null ? tCenter[axis] : center[axis])
  
          // zoom gets closer to targetZoom, when 1% close assign its value
          const SPEED = jb.ui.isMobile() ? 1 : 4
          zoom = zoom + (tZoom - zoom) / SPEED
          if (!tZoom || Math.abs((zoom-tZoom)/tZoom) < 0.01) 
            zoom = tZoom
          ;[0,1].forEach(axis=> {
            center[axis] = center[axis] + (tCenter[axis] - center[axis]) / SPEED
            if (!tCenter[axis] || Math.abs((center[axis]-tCenter[axis])/tCenter[axis]) < 0.01) 
              center[axis] = tCenter[axis]
          })
          
          state.zoom = zoom
          this.renderRequest = false
          return [state]
        },            
        pointers: [],
        findPointer(pid) { return this.pointers.find(x=>x.pid == pid) },
        removeOldPointers() {
          const now = new Date().getTime()
          this.pointers = this.pointers.filter(pointer => now - pointer.time < 2000)
        },
        addPointer(pid) { 
          if (this.findPointer(pid))
            return jb.logError('zui pointer already exists', {pid})
          if (this.pointers.length > 1)
            this.removeOldPointers()
          if (this.pointers.length > 1)
            return jb.logError('zui pointer tring to add thirs pointer', {pid})
  
          this.pointers.push({pid})
        },
        removePointer(pid) {
          //console.log('removePointer',pid,this.pointers)
          const found = this.pointers.findIndex(x=>x.pid == pid)
          //console.log(found)
          if (found != -1)
            this.pointers.splice(found, 1)
        } ,
        momentumEvents(pid) {
          const pointer = this.pointers.find(x=>x.pid == pid)
          if (!pointer) return { delay: 0, events: [] }
          const target = [limitJump(w,500*pointer.vAvg[0]), limitJump(h,500*pointer.vAvg[1])]
          const n = 50
          const dps = Array.from(new Array(n).keys()).map( i => smoth(i,n))
          return { delay: 5, events: dps.map(dp=>({dp})) }
  
          function limitJump(limit,value) {
            return Math.sign(value) * Math.min(Math.abs(value),limit)
          }
          function smoth(i,n) {
            return [0,1].map(axis => target[axis] * (Math.sin((i+1)/n*Math.PI/2) - Math.sin(i/n*Math.PI/2)))
          }
        }
      })
    },
})