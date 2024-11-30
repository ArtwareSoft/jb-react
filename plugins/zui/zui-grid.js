dsl('zui')
using('remote-widget')

component('zui.grid', {
  type: 'control<>',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemsPositions', type: 'grid_pivot', dynamic: true},
    {id: 'prepareProps', type: 'itemProp[]', dynamic: true},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'center', as: 'string', description: 'e.g., 2,7'},
    {id: 'onChange', type: 'action<>', dynamic: true},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: GPU()},
    {id: 'extraRendering', type: 'control[]', dynamic: true, defaultValue: showTouchPointers()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})
  
component('GPU', {
  type: 'itemlist-style',
  params: [
    {id: 'width', as: 'string', defaultValue: '200'},
    {id: 'height', as: 'string', defaultValue: '200'},
    {id: 'fullScreen', as: 'boolean', type: 'boolean<>'}
  ],
  impl: typeAdapter('style<>', customStyle({
    template: ({},{width,height},h) => h('canvas', {...jb.zui.calcWidthHeightBE(width, height), zuiBackEndForTest:true }),
    css: '{ touch-action: none; border: 1px black solid;}',
    features: [
      calcProps((ctx,{$model,zuiCtx,uiTest},{width,height})=> {
        const canvasSizeFromBE = Object.values(jb.zui.calcWidthHeightBE(width, height))
        const DIM = $model.boardSize
        const items = $model.items()
        const zoom = +($model.initialZoom || DIM)
        const tCenter = $model.center ? $model.center.split(',').map(x=>+x) : [DIM* 0.5, DIM* 0.5]
        const ctxWithItems = ctx.setVars({items, DIM, gpu: true})
        const prepareProps = [...$model.prepareProps(ctxWithItems), ...$model.itemsPositions(ctxWithItems)]
        const pivots = prepareProps.flatMap(prop=>prop.pivots())
        pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
        const itemsPositions = jb.zui.calcItemsPositions(pivots, ctxWithItems)
        const noOfItems = items.length

        const itemView = $model.itemView(ctxWithItems.setVars(itemsPositions))
        const be_views = itemView.createBEObjs('top',true)
        const itemsPositionsData = { itemsPositions : {atts: [itemsPositions.itemPos] } }

        const props = {
          calls_counter: 0, DIM, center: [], tCenter, tZoom: zoom, be_views, itemsPositionsData, noOfItems, canvasSizeFromBE
        }
        if (uiTest) {
          props.itemViewSize = canvasSizeFromBE.map(x=>x/zoom)
          props.elemsLayout = jb.zui.initLayoutCalculator(itemView.createLayoutObj('top')).layoutView(props.itemViewSize).elemsLayout
        }
        if (zuiCtx) 
          zuiCtx.props = props
        return props
      }),
      method('onChange', '%$$model/onChange()%'),
      method('calcBEData', async (ctx,{$props, cmp, uiTest, glLimits}) => {
        const viewIds = ctx.data
        const be_views = $props.be_views.filter(({id}) => viewIds.indexOf(id) != -1)
        const res = {}
        await be_views.reduce((pr,v) => pr.then( async ()=> res[v.id] = await v.calc(ctx)), Promise.resolve())
        const counter = $props.calls_counter++
        jb.log(`zui calcBEData result for ${viewIds.join(',')}`,{res, counter, ctx})
        if (uiTest)
          jb.ui.applyDeltaToCmp({ctx,delta: { attributes: { [`calcbedata${counter}`] : jb.utils.prettyPrint(res,{noMacros: true}) } },cmpId: cmp.cmpId})
        return res
      }),
      frontEnd.varsFromBEProps('DIM','tCenter','tZoom','itemsPositionsData','noOfItems','canvasSizeFromBE','width','height','elemsLayout','itemViewSize','fullScreen'),
      frontEnd.var('itemViewProfile', ({},{$model}) => $model.itemView.profile),
      frontEnd.prop('layoutCalculator', (ctx,{itemViewProfile}) =>
        jb.zui.initLayoutCalculator(ctx.run(itemViewProfile,{ type: 'view<zui>'}).createLayoutObj('top'))),
      frontEnd.var('extraRenderingProfile', ({},{$model}) => $model.extraRendering.profile),
      frontEnd.prop('extraRendering', (ctx,{extraRenderingProfile}) => ctx.run(extraRenderingProfile,{ type: 'control<zui>'})),
      frontEnd.prop('ZOOM_LIMIT', ({},{DIM}) => [1, jb.ui.isMobile() ? DIM: DIM*2]),
      frontEnd.prop('beDataGpu', obj()),
      zui.Zoom(),
      frontEnd.prop('exposedViews', rx.subject()),
      frontEnd.flow(
        source.animationFrame(),
        rx.flatMap(source.data('%$cmp.animationStep()%')),
        rx.do(({},{cmp}) => cmp.renderCounter++),
        rx.map('%$cmp.calcItemViewLayout()%'),
        rx.filter('%length%'),
        rx.do(action.subjectNext('%$cmp.exposedViews%', '%%')),
        rx.flatMap(source.data('%%')),
        rx.map('%$cmp/feViews/{%%}%'),
        rx.log('zui view to render candidate'),
        rx.filter('%$cmp/beDataGpu/{%id%}%'),
        rx.flatMap(source.merge(source.data('%$cmp.debugViews%'), source.data('%%'))),
        rx.log('zui view to render'),
        sink.action('%$cmp.renderGPUView()%')
      ),
      frontEnd.flow(
        source.subject('%$cmp.exposedViews%'),
        rx.map(pipeline('%%', filter(not('%$cmp/beDataGpu/{%%}%')))),
        rx.filter(notEmpty('%%')),
        rx.log('zui exposedView without backend data'),
        rx.filter(not('%$cmp/waitingForBE%')),
        rx.do(writeValue('%$cmp/waitingForBE%', 'true')),
        rx.mapPromise(dataMethodFromBackend('calcBEData', '%%', zui.glLimits())),
        rx.doPromise(zui.loadBEDataToFE()),
        rx.do(writeValue('%$cmp/waitingForBE%', '')),
        sink.action(writeValue('%$cmp/renderRequest%', true))
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), rx.debounceTime(100), sink.BEMethod('onChange')),
      frontEnd.flow(
        source.event('resize', () => jb.frame.window),
        sink.action('%$cmp.refreshCanvasToFullScreen()%')
      ),
      frontEnd.init(async ctx => {
          const {cmp} = ctx.vars
          await jb.zui.initFECmp(ctx)
          cmp.clearCanvas()
          cmp.renderRequest = true
          cmp.updateZoomState({ dz :1, dp:0 })
        }),
      frontEnd.init(zui.loadBEDataToFE('%$itemsPositionsData%'))
    ]
  }))
})

extension('zui','itemlist-BE', {
  calcWidthHeightBE(width, height) {
    return {width: width == '100%' ? 600 : +width, height: height == '100%' ? 800 : +height}
  }  
})

component('zui.loadBEDataToFE', {
  moreTypes: 'action<>',
  params: [
    {id: 'BEViewsData', defaultValue: '%%'},
  ],
  impl: async (ctx,BEViewsData) => {
    const {noOfItems, cmp} = ctx.vars
  
    Object.entries(BEViewsData).map(([viewId,be_data]) => {
      const atts = be_data.atts
      const floatsInVertex = atts.reduce((acc,att) => acc + att.size, 0)
      const gpuAtts = atts.reduce((acc,att) => ({ 
          offset: acc.offset + att.size, 
          atts: [...acc.atts, {id: `_${att.id}`, size: att.size, offset: acc.offset}]
        }), {offset: 0, atts: []}).atts
      const buffer = new Float32Array(floatsInVertex * noOfItems)
      for (let i = 0; i < noOfItems; i++) for (let att = 0; att < atts.length; att++) for (let j = 0; j < atts[att].size; j++)
          buffer[i * floatsInVertex + gpuAtts[att].offset + j] = atts[att].size == 1 ? 1.0*atts[att].ar[i] : 1.0*atts[att].ar[i][j]
      cmp.beDataGpu[viewId] = { ...(cmp.beDataGpu[viewId] || {}),...be_data, gpuAtts, buffer, floatsInVertex }
    })
    await Object.keys(BEViewsData).map(k => cmp.feViews[k]).filter(x=>x)
      .reduce((pr,view) => pr.then(()=>cmp.prepareTextures(view)), Promise.resolve())
    jb.log('zui BEData loaded in FE',{beDataGpu: cmp.beDataGpu,BEViewsData,ctx})
  }
})

extension('zui','itemlist-FE', {
  emptyImageUrl: () => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogI0I1QjVCNTsgc3Ryb2tlLXdpZHRoOiA0OyBzdHJva2UtZGFzaGFycmF5OiA0LCA0OyIvPgo8L3N2Zz4=',
  async initFECmp(ctx) {
    if (jbHost.document)
      document.body.style.overflow = "hidden"
    const {cmp, el, DIM, emulateFrontEndInTest, canvasSizeFromBE, width, height, itemViewProfile, shownCmps, fullScreen} = ctx.vars
    const glCanvas = el
    const canvasSize = el instanceof jb.ui.VNode ? canvasSizeFromBE : [glCanvas.width, glCanvas.height]
    const gl = cmp.gl = jb.zui.createGl(canvasSize,emulateFrontEndInTest,el)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    cmp.feViews = jb.objFromEntries(ctx.run(itemViewProfile,{ type: 'view<zui>'}).createFEObjs('top',true).map(v=>[v.id,v]) )

    el.setAttribute('zui-rendered',true) // for tests
        
    const NO_OF_UNITS = 8
    Object.assign(cmp, {
      clearCanvas() {
        gl.viewport(0, 0, ...canvasSize)
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)    
      },
      calcItemViewLayout() {          
        const {zoom } = cmp.state
        cmp.state.itemViewSize = [0,1].map(axis=>canvasSize[axis]/zoom)
        const {elemsLayoutCache, layoutCalculator} = cmp
        if (elemsLayoutCache[zoom]) {
          Object.assign(cmp.state, [zoom])
        } else {
          const itemViewSize = cmp.state.itemViewSize
          const time = new Date().getTime()
          const layout = layoutCalculator.layoutView(itemViewSize)
          const duration = new Date().getTime() - time
          elemsLayoutCache[zoom] = JSON.parse(JSON.stringify(layout))
          Object.assign(cmp.state, elemsLayoutCache[zoom])
          //console.log(duration, 'layout', zoom)
          jb.log('zui elemsLayout',{zoom, duration, ...layout, itemViewSize, ctx:cmp.ctx})
        }
        return cmp.state.shownCmps
      },
      prepareTextures(view) {
        const viewBeData = cmp.beDataGpu[view.id]
        const textures = viewBeData.uniforms.filter(({glType})=>glType == 'sampler2D')
        const allLoaded = textures.reduce((acc, {id}) => acc && view.textures[id], true)
        if (allLoaded) return true
        view.waitingForTextures = view.waitingForTextures || {}
        const toLoad = textures.filter( ({id}) => !view.waitingForTextures[id] && !view.textures[id])
        return toLoad.reduce((pr,{id, value}) => pr.then( async () => {
          view.waitingForTextures[id] = true
          const url = jbHost.isNode || value || jb.path(viewBeData,['props','textures',id])
          view.textures[id] = jbHost.isNode || await jb.zui.imageToTexture(gl,url) 
          delete view.waitingForTextures[id]
        }), Promise.resolve())
      },
      renderGPUView(ctx) {
        const baseTime = new Date().getTime()
        const view = ctx.data
        const { noOfItems, DIM} = ctx.vars
        const { beDataGpu, emptyTexture } = cmp
        const viewBeData = beDataGpu[view.id]
        const { itemViewSize, elemsLayout, zoom, center } = cmp.state
        const elemLayout = elemsLayout[view.id]
        const {size, pos } = elemLayout
        if (!this.prepareTextures(view)) return

        view.zoomDependentUniforms.forEach(({id,val}) =>
            viewBeData.uniforms.find(u=>u.id ==id).value = val(ctx.setVars({elemLayout})))
        if (emulateFrontEndInTest) return

        const glCode = viewBeData.glCode
        const shaderProgram = view.shaderProgram = view.shaderProgram || jb.zui.buildShaderProgram(gl, glCode)
        const fixedCenter = [center[0], DIM-center[1]+1]
        gl.useProgram(shaderProgram)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridPadding'), [2,0])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), fixedCenter)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), canvasSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'itemViewSize'), itemViewSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

        const atlasIdToUnit = (viewBeData.uniforms.find(u=>u.id == 'atlasIdToUnit') || {}).value
        viewBeData.uniforms.forEach(({glType,id,glMethod,value}) => {
          if (glType == 'sampler2D') {
            const i = atlasIdToUnit && id.indexOf('atlas') == 0 ? atlasIdToUnit[id.split('atlas').pop()]
              : jb.zui.allocateSingleTextureUnit({view, uniformId: id,cmp}).i
            gl.activeTexture(gl['TEXTURE'+i])
            gl.bindTexture(gl.TEXTURE_2D, view.textures[id] || emptyTexture)
            gl.uniform1i(gl.getUniformLocation(shaderProgram, id), i)    
          } else {
            gl[`uniform${glMethod}`](gl.getUniformLocation(shaderProgram, id), value)
          }
        })

        beDataGpu.itemsPositions.gpuAtts[0].id = 'itemPos' // the default id is _itemPos...
        ;[ beDataGpu.itemsPositions, viewBeData].forEach(({id, gpuAtts, buffer, floatsInVertex}) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
          gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)
  
          gpuAtts.forEach(({id,size,offset}) => {
            const att = gl.getAttribLocation(shaderProgram, id)
            gl.enableVertexAttribArray(att)
            gl.vertexAttribPointer(att, size, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
          })
        })
        jb.log('zui itemlist renderGPUView beDataGpu', {beDataGpu, ctx})
        jb.log('zui itemlist renderGPUView', {elemLayout, glCode, view, zoom,fixedCenter,canvasSize,itemViewSize,ctx})
        const duration = new Date().getTime() - baseTime
        //console.log(duration, view.id)

        gl.drawArrays(gl.POINTS, 0, noOfItems)
        jb.asArray(cmp.extraRendering).forEach(r=>r.renderGPUFrame({ gl, glCanvas, canvasSize, cmp, ctx }))
      },
      elemsLayoutCache: {},
      atlasTexturePool: {},
      renderCounter: 0,
      boundTextures: Array.from(new Array(NO_OF_UNITS).keys()).map(i=>({i, lru : 0})),

      async refreshCanvasToFullScreen() {
        const sizeInPx = calcWidthHeight()
        canvasSize[0] = glCanvas.width = sizeInPx.width
        canvasSize[1] = glCanvas.height = sizeInPx.height
        this.clearCanvas()
        this.aspectRatio = glCanvas.width/glCanvas.height
        await jb.delay(1)
        cmp.elemsLayoutCache = {}
        cmp.renderRequest = true

        function calcWidthHeight() {
          const window = jb.frame.window || {innerHeight: 800, innerWidth: 1200, pageYOffset: 0, pageXOffset: 0}
          if (width == '100%') {
              return {
                width: typeof screen != 'undefined' ? screen.width : window.innerWidth,
                height: typeof screen != 'undefined' ? screen.height : window.innerHeight,
              }
          }
          return {width: +width, height: +height}
        }
      }
    })
    if (fullScreen) cmp.refreshCanvasToFullScreen()
    await jb.asArray(cmp.extraRendering).reduce((pr,r) =>pr.then(()=> r.init && r.init({ gl, glCanvas, canvasSize, cmp, ctx })), Promise.resolve())
    cmp.emptyTexture = cmp.emptyTexture || jbHost.isNode || await jb.zui.imageToTexture(gl,jb.zui.emptyImageUrl()) 
  }
})