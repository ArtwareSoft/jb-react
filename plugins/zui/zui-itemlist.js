dsl('zui')

component('zui.itemlist', {
  type: 'control<>',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemProps', type: 'itemProp[]', dynamic: true},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view<zui>', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'center', as: 'string', description: 'e.g., 2,7'},
    {id: 'onChange', type: 'action<>', dynamic: true},
    {id: 'style', type: 'itemlist-style<zui>', dynamic: true, defaultValue: itemlistStyle()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})
  
component('itemlistStyle', {
  type: 'itemlist-style',
  params: [
    {id: 'width', as: 'string', defaultValue: '200'},
    {id: 'height', as: 'string', defaultValue: '200'}
  ],
  impl: typeAdapter('style<>', customStyle({
    template: ({},{width,height},h) => h('canvas', {...jb.zui.calcWidthHeight(width, height), zuiBackEndForTest:true }),
    css: '{ touch-action: none; border: 1px black solid;}',
    features: [
      calcProps((ctx,{$model,zuiCtx},{width,height})=> {
        const DIM = $model.boardSize
        const items = $model.items()
        const zoom = +($model.initialZoom || DIM)
        const tCenter = $model.center ? $model.center.split(',').map(x=>+x) : [DIM* 0.5, DIM* 0.5]
        const ctxWithItems = ctx.setVars({items})
        const itemProps = $model.itemProps(ctxWithItems)
        const itemView = $model.itemView(ctxWithItems.setVars({itemProps}))
        const pivotsFromItemProps = itemProps.flatMap(prop=>prop.pivots({DIM}))
        const pivots = [...pivotsFromItemProps, ...itemView.pivots({DIM}).filter(p=>! pivotsFromItemProps.find(_p => _p.att == p.att)) ]
        pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
        const itemsPositions = pivots.x && pivots.y && jb.zui.calcItemsPositions({items, pivots, DIM})
        jb.zui.prepareItemView(itemView)
        const props = {
          DIM, center: [], tCenter, tZoom: zoom, itemsPositions, itemView //width,height,
        }
        if (zuiCtx) 
          zuiCtx.props = props
        // if (itemsPositions) { // emulate layout in BE for tests
        //        jb.zui.prepareItemView(itemView)

        //   const sizeInPx = jb.zui.calcWidthHeight(width, height)
        //   const elemsLayout = {itemView: { size: [sizeInPx.width/zoom,sizeInPx.height/zoom], zoom }}
        //   const itemView = $model.itemView(ctxWithItems.setVars({itemProps}))
        //   jb.zui.layoutView(itemView, elemsLayout, props)
        // }
        return props
      }),
      frontEnd.var('itemPropsProfile', ({},{$model}) => $model.itemProps.profile),
      frontEnd.var('itemViewProfile', ({},{$model}) => $model.itemView.profile),
      frontEnd.prop('itemView', (ctx,{itemPropsProfile, itemViewProfile}) => {
          const itemProps = ctx.run(itemPropsProfile, {type: 'itemProp[]<zui>' })
          return ctx.setVars({itemProps}).run(itemViewProfile,{ type: 'view<zui>'})
      }),
      frontEnd.varsFromBEProps('DIM','tCenter','tZoom','itemsPositions'),
      frontEnd.prop('ZOOM_LIMIT', ({},{DIM}) => [1, jb.ui.isMobile() ? DIM: DIM*2]),
      frontEnd.prop('elemBuffers', obj()),
      frontEnd.prop('debugElems', () => [
          //jb.zui.showTouchPointers(),
          //jb.zui.mark4PointsZuiElem(), 
          //jb.zui.markGridAreaZuiElem()
      ]),
      frontEnd.method('refreshCanvas', async ({},{cmp, el}) => {
          const sizeInPx = cmp.calcWidthHeight(cmp.width, cmp.height)
          el.width = sizeInPx.width;
          el.height = sizeInPx.height;
          cmp.clearCanvas()
          cmp.aspectRatio = el.width/el.height
          await jb.delay(1)
          cmp.elemsLayoutCache = {}
          cmp.renderRequest = true
      }),
      frontEnd.init(async ({},vars) => {
          //document.body.style.overflow = "hidden"
          const {cmp, el, itemsPositions, DIM} = vars
          cmp.glCanvas = el
          const gl = cmp.gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

          jb.zui.initZuiCmp(vars,el,gl)
          itemsPositions.vertexArray = new Float32Array(itemsPositions.sparse.flatMap(([item, x,y]) => [1.0*x,1.0*(DIM-y)]))

          await jb.zui.initItemlistCmp(vars)
          
          cmp.clearCanvas()
          cmp.renderRequest = true
          el.setAttribute('zui-rendered',true) // for tests
          cmp.updateZoomState({ dz :1, dp:0 })
      }),
      frontEnd.prop('zuiEvents', rx.subject()),
      frontEnd.prop('exposedView', rx.subject()),
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
        rx.takeUntil('%$cmp.destroyed%'),
        rx.log('zui wheel'),
        rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 1/1.1 : 1 })),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(source.event('resize', () => jb.frame.window), sink.FEMethod('refreshCanvas')),
      frontEnd.flow(
        source.animationFrame(),
        rx.flatMap(source.data('%$cmp.animationStep()%')),
        rx.do(({},{cmp}) => cmp.renderCounter++),
        rx.flatMap(source.data('%$cmp.layoutViews()%')),
        rx.do(action.subjectNext('%$cmp.exposedView%')),
        rx.var('viewId'),
        rx.map(({data},{cmp})=> jb.zui.viewOfId(cmp.itemView,data)),
        rx.log('zui view to render'),
        rx.flatMap(source.merge(source.data('%$cmp.debugElems%'), source.data('%zuiElem%'))), 
        rx.log('zui elem to render'),
        rx.filter(or('%ready%', '%$cmp/elemBuffers/{%$viewId%}%')),
//        rx.filter('%ready%'),
        rx.do('%calcExtraProps()%'),
        rx.log('zui elem to render'),
        sink.action('%$cmp.renderGPUFrame()%')
      ),
      method('onChange', '%$$model/onChange()%'),
      method('calcElemBuffers', (...args) => jb.zui.calcElemBuffersBE(...args)),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), rx.debounceTime(100), sink.BEMethod('onChange')),
      frontEnd.flow(
        source.subject('%$cmp.exposedView%'),
        rx.log('zui exposedView 1'),
//        rx.distinct(),
//        rx.mapPromise(jb.zui.calcElemBuffers),
        rx.var('viewId'),
        rx.filter(not('%$cmp/elemBuffers/{%$viewId%}%')),
        rx.log('zui calc elem buffers'),
        rx.mapPromise(dataMethodFromBackend('calcElemBuffers', '%%')),
        rx.do(writeValue('%$cmp/elemBuffers/{%$viewId%}%', '%%')),
        sink.action(writeValue('%$cmp/renderRequest%', true))
      ),
      method('buildPartition', (...args) => jb.zui.buildPartitionFromItemList(...args))
    ]
  }))
})

extension('zui','itemlist-BE', {
  prepareItemView(itemView) {
    const shortPaths = calcShortPaths(itemView, '')
    const axes = [0,1]
    const records = axes.map(axis => calcMinRecord(itemView, axis).sort((r1,r2) => r1.p - r2.p))

    return { records, shortPaths }

    function calcMinRecord(view, layoutAxis) {
      if (!view.children) {
        return [{
          p: view.priority || 10000, path: view.shortPath, 
          axis: layoutAxis, title: view.title,
          min: view.sizeNeeds({round: 0, available:[0,0]})[layoutAxis] }]
        }
      return view.children.flatMap(childView => calcMinRecord(childView,layoutAxis))
    }

    function calcShortPaths(view, shortPath) {
      view.id = view.shortPath = shortPath
      if (!view.children) return { [shortPath]: view.ctxPath }
      return view.children.reduce(
        (acc, childView,i) => ({...acc, ...calcShortPaths(childView, [shortPath,''+i].filter(x=>x!='').join('~'))}),{})
    }
  },
  async calcElemBuffersBE({data},{$props}) {
    const viewId = data
    const view = jb.zui.viewOfId($props.itemView,viewId)
    const buffers = await view && view.zuiElem && view.zuiElem.calcBuffers(view, $props)
    return buffers
  }
})

extension('zui','itemlist-FE', {
  viewOfId(view, id) {
    if (view.id == id) return view
    for(let i=0;i<(view.children||[]).length;i++) {
      const found = jb.zui.viewOfId(view.children[i],id)
      if (found) return found
    }
  },
  assignBuffersFromBE(ctx, {cmp}) {
    const {gl} = cmp
    const {viewId, buffers} = ctx.data
    cmp.elemBuffers[viewId] = buffers
    // const view = jb.zui.viewOfId(cmp.itemView,viewId)
    // const elem = view.zuiElem
    // if (!elem) return
    // elem.buffers = buffers
    // rx.log('zui before bind buffers',{viewId, view, buffers: elem.buffers, elem, ctx})
    // ;(elem.bindBuffers || cmp.bindBuffers)(elem, cmp, elem.buffers)

    // elem.buffers.vertexBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, elem.buffers.vertexBuffer)
    // gl.bufferData(gl.ARRAY_BUFFER, elem.buffers.vertexArray, gl.STATIC_DRAW)
    // elem.ready = true
  },
  async initItemlistCmp(vars) {
    const NO_OF_UNITS = 8
    const {cmp} = vars
    Object.assign(cmp, { 
      ...jb.zui.prepareItemView(cmp.itemView),
      layoutViews() {
        // state
        //   userEvent -> tZoom + time -> zoom -> elemsLayout - calculated, cached by zoom
        //   userEvent -> tCenter + time -> center
          
        const {zoom } = cmp.state
        const {glCanvas, elemsLayoutCache} = cmp
        if (elemsLayoutCache[zoom]) {
          cmp.state.elemsLayout = elemsLayoutCache[zoom]
        } else {
          const [width, height] = [glCanvas.width/ zoom, glCanvas.height/ zoom]
          cmp.state.elemsLayout = { itemViewSize: [width,height] }
          const shownViews = cmp.state.elemsLayout.shownViews = jb.zui.layoutView(cmp,vars)
          const elemsLayout = elemsLayoutCache[zoom] = JSON.parse(JSON.stringify(cmp.state.elemsLayout))
          jb.log('zui elemsLayout',{elemsLayout, shownViews, ctx:cmp.ctx})
        }
        return cmp.state.elemsLayout.shownViews
      },
      // renderGPUFrame(ctx) {
      //   const elem = ctx.data
      //   if (elem.ver == 2)
      //     return this.renderGPUFrame2(ctx)
      //   const {cmp} = ctx.vars
      //   const { glCanvas, gl } = cmp
      //   const { elemsLayout, zoom, center } = cmp.state
      //   const { vertexCount, floatsInVertex, vertexBuffer, src } = cmp.elemBuffers[elem.view.id]
      //   const shaderProgram = jb.zui.buildShaderProgram(gl, src)
      //   gl.useProgram(shaderProgram)
      //   const elemLayout = elem.view ? elemsLayout[elem.view.ctxPath] : {}
      //   const {size, pos } = elemLayout
      //   return elem.renderGPUFrame({...ctx.vars, cmp, shaderProgram, glCanvas, gl, zoom, center, elemLayout, vertexCount, floatsInVertex, vertexBuffer, size, pos})
      // },
      renderGPUFrame(ctx) {
        const elem = ctx.data
        const {cmp, itemsPositions, DIM } = ctx.vars
        const { glCanvas, gl } = cmp
        const { elemsLayout, zoom, center } = cmp.state
        const shaderProgram = jb.zui.buildShaderProgram(gl, elem.src)
        gl.useProgram(shaderProgram)
        const elemLayout = elem.view ? elemsLayout[elem.view.ctxPath] : 
          elem.posSize && elem.posSize(cmp.state.elemsLayout.itemViewSize) || { size: cmp.state.elemsLayout.itemViewSize, pos : [ 0.0,0.0] }
        const {size, pos } = elemLayout
        const { vertexArray, vertexCount } = itemsPositions

        const itemPosBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, itemPosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

        const itemPos = gl.getAttribLocation(shaderProgram, 'itemPos')
        gl.enableVertexAttribArray(itemPos)
        gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, 0, 0)

        const buffers = cmp.elemBuffers[elem.view.id]
        Object.entries(buffers.itemAtts).forEach(([bufId,buff]) =>{
          const vertexBuffer = gl.createBuffer()
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, buff.vertexArray, gl.STATIC_DRAW)
  
          const att = gl.getAttribLocation(shaderProgram, `_${bufId}`)
          gl.enableVertexAttribArray(att)
          gl.vertexAttribPointer(att, buff.floatsInVertex, gl.FLOAT, false, 0, 0)
        })

        const canvasSize = [glCanvas.width, glCanvas.height]
        const gridSizeInPixels = [glCanvas.width/ zoom, glCanvas.height/ zoom]
        const fixedCenter = [center[0], DIM-center[1]+1]

        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), fixedCenter)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), canvasSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), gridSizeInPixels)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

        jb.log('zui itemlist renderGPUFrame2', {vertexArray, elem, zoom,fixedCenter,canvasSize,gridSizeInPixels,pos,size,ctx})

        elem.renderGPUFrame && elem.renderGPUFrame({...ctx.vars, cmp, shaderProgram, glCanvas, gl, zoom, center, elemLayout, vertexCount, vertexBuffer, size, pos})  
        gl.drawArrays(gl.POINTS, 0, vertexCount)
      },
      elemsLayoutCache: {},
      atlasTexturePool: {},
      renderCounter: 0,
      boundTextures: Array.from(new Array(NO_OF_UNITS).keys()).map(i=>({i, lru : 0})),
      calcWidthHeight(width, height) {
        const window = jb.frame.window || {innerHeight: 800, innerWidth: 1200, pageYOffset: 0, pageXOffset: 0}
        if (width == '100%') {
            return {
              width: typeof screen != 'undefined' ? screen.width : window.innerWidth,
              height: typeof screen != 'undefined' ? screen.height : window.innerHeight,
            }
        }
        return {width: +width, height: +height}
      }      
    })
  },
  calcWidthHeight(width, height) {
    if (width == '100%') width = 600
    return {width: +width, height: +height}
  }
})