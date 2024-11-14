dsl('zui')
using('remote-widget')

component('zui.itemlist', {
  type: 'control<>',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemsPositions', type: 'items_positions', as: 'array', dynamic: true},
    {id: 'prepareProps', type: 'itemProp[]', dynamic: true},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view<zui>', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'center', as: 'string', description: 'e.g., 2,7'},
    {id: 'onChange', type: 'action<>', dynamic: true},
    {id: 'style', type: 'itemlist-style<zui>', dynamic: true, defaultValue: GPU()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})
  
component('GPU', {
  type: 'itemlist-style',
  params: [
    {id: 'width', as: 'string', defaultValue: '200'},
    {id: 'height', as: 'string', defaultValue: '200'}
  ],
  impl: typeAdapter('style<>', customStyle({
    template: ({},{width,height},h) => h('canvas', {...jb.zui.calcWidthHeightBE(width, height), zuiBackEndForTest:true }),
    css: '{ touch-action: none; border: 1px black solid;}',
    features: [
      calcProps((ctx,{$model,zuiCtx},{width,height})=> {
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
        // layout calculator is done in both BE and FE
        const { elemsLayout, shownViews } = jb.zui.initLayoutCalculator(itemView.createLayoutObj('top')).layoutView([width,height])

        const be_views = itemView.createBEObjs('top',true)
        const beData = jb.objFromEntries(be_views.filter(v=>!v.async).map(v => [v.id, v.calc()]))
        beData.itemsPositions = {atts: [itemsPositions.itemPos] }

        const props = {
          DIM, center: [], tCenter, tZoom: zoom, elemsLayout, shownViews, width,height, be_views, beData, noOfItems, 
          itemsPositions, itemView // for nodejs build
        }
        if (zuiCtx) 
          zuiCtx.props = props
        return props
      }),
      method('onChange', '%$$model/onChange()%'),
      method('calcBEData', '%$props/be_views/{%%}/calc()%'),
      method('calcFollowUpViewData', async (ctx,{$props, cmp, uiTest}) => {
        const be_views = $props.be_views.filter(v=>v.async)
        const res = {}
        await be_views.reduce((pr,v) => pr.then(()=> v.calc().then(be_data=>res[v.id] = be_data)), Promise.resolve())
        if (uiTest)
          jb.ui.applyDeltaToCmp({ctx,delta: { attributes: { followupviewdata : jb.utils.prettyPrint(res,{noMacros: true}) } },cmpId: cmp.cmpId})
        return res
      }),
      frontEnd.varsFromBEProps('DIM','tCenter','tZoom','beData','elemsLayout','noOfItems','width','height'),
      frontEnd.prop('beDataGpu', mapValues(zui.convertBEDataForGPU(), '%$beData%')),
      frontEnd.var('itemViewProfile', ({},{$model}) => $model.itemView.profile),
      frontEnd.prop('layoutCalculator', (ctx,{itemViewProfile}) =>
        jb.zui.initLayoutCalculator(ctx.run(itemViewProfile,{ type: 'view<zui>'}).createLayoutObj('top'))),
      frontEnd.prop('ZOOM_LIMIT', ({},{DIM}) => [1, jb.ui.isMobile() ? DIM: DIM*2]),
      frontEnd.prop('debugElems', () => [
          //jb.zui.showTouchPointers(),
          //jb.zui.mark4PointsZuiElem(), 
          //jb.zui.markGridAreaZuiElem()
      ]),
      zui.Zoom(),
      frontEnd.prop('exposedView', rx.subject()),
      frontEnd.flow(
        source.animationFrame(),
        rx.flatMap(source.data('%$cmp.animationStep()%')),
        rx.do(({},{cmp}) => cmp.renderCounter++),
        rx.flatMap(source.data('%$cmp.layoutViews()%')),
        rx.map('%$cmp/feViews/{%%}%'),
        rx.do(action.subjectNext('%$cmp.exposedView%')),
        rx.log('zui view to render candidate'),
        rx.filter(not('%$cmp.requiredBEElements()%')),
        rx.flatMap(source.merge(source.data('%$cmp.debugViews%'), source.data('%%'))),
        rx.log('zui view to render'),
        sink.action('%$cmp.renderGPUView()%')
      ),
      frontEnd.flow(
        source.subject('%$cmp.exposedView%'),
        rx.log('zui exposedView handler'),
        rx.var('reqBeElems', '%$cmp.requiredBEElements()%'),
        rx.filter('%$reqBeElems%'),
        rx.filter(not('%waitingForBE/{%$reqBeElems%}%')),
        rx.do(writeValue('%waitingForBE/{%$reqBeElems%}%', 'true')),
        rx.log('zui calcBEData'),
        rx.var('view'),
        rx.mapPromise(dataMethodFromBackend('calcBEData', obj(prop('viewId', '%id%'), prop('reqBeElems', '%$reqBeElems%')))),
        rx.do(writeValue('%$cmp/beDataGpu/{%$view/id%}%', zui.convertBEDataForGPU())),
        rx.do(writeValue('%$view/waitingForBE/{%$reqBeElems%}%', '')),
        sink.action(writeValue('%$cmp/renderRequest%', true))
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), rx.debounceTime(100), sink.BEMethod('onChange')),
      frontEnd.flow(source.event('resize', () => jb.frame.window), sink.action('%$cmp.refreshCanvasToFullScreen()%')),
      frontEnd.init(runActionOnItem(dataMethodFromBackend('calcFollowUpViewData'), runActions(
        runActionOnItems(values(), writeValue('%$cmp/beDataGpu/{%id%}%', zui.convertBEDataForGPU())),
        async ctx => {
          const {cmp} = ctx.vars
          await jb.zui.initFECmp(ctx)
          cmp.clearCanvas()
          cmp.renderRequest = true
          cmp.updateZoomState({ dz :1, dp:0 })
        }
      )))
    ]
  }))
})

extension('zui','itemlist-BE', {
  calcWidthHeightBE(width, height) {
    if (width == '100%') width = 600
    return {width: +width, height: +height}
  }  
})

component('zui.convertBEDataForGPU', {
  impl: ctx => {
    const be_data = ctx.data
    const {noOfItems,view} = ctx.vars
    const {atts} = be_data
  
    const floatsInVertex = atts.reduce((acc,att) => acc + att.size, 0)
    const resAtts = atts.reduce((acc,att) => ({ 
        offset: acc.offset + att.size, 
        atts: [...acc.atts, {id: `_${att.id}`, size: att.size, offset: acc.offset}]
      }), {offset: 0, atts: []}).atts
    const buffer = new Float32Array(floatsInVertex * noOfItems)
    for (let i = 0; i < noOfItems; i++) for (let att = 0; att < atts.length; att++) for (let j = 0; j < atts[att].size; j++)
        buffer[i * floatsInVertex + resAtts[att].offset + j] = atts[att].size == 1 ? 1.0*atts[att].ar[i] : 1.0*atts[att].ar[i][j]
    return { ...be_data, atts: resAtts, buffer, floatsInVertex }
  }
})

extension('zui','itemlist-FE', {
  emptyImageUrl: () => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogI0I1QjVCNTsgc3Ryb2tlLXdpZHRoOiA0OyBzdHJva2UtZGFzaGFycmF5OiA0LCA0OyIvPgo8L3N2Zz4=',
  async initFECmp(ctx) {
    //document.body.style.overflow = "hidden"
    const {cmp, el, beDataGpu, DIM, emulateFrontEndInTest, width, height, itemViewProfile} = ctx.vars
    const glCanvas = el
    const canvasSize = el instanceof jb.ui.VNode ? [width,height] : [glCanvas.width, glCanvas.height]
    const gl = createGl()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    cmp.feViews = jb.objFromEntries(ctx.run(itemViewProfile,{ type: 'view<zui>'}).createFEObjs('top',true).map(v=>[v.id,v]) )

    el.setAttribute('zui-rendered',true) // for tests
    cmp.emptyTexture = cmp.emptyTexture || jbHost.isNode || await jb.zui.imageToTexture(gl,jb.zui.emptyImageUrl()) 
        
    const NO_OF_UNITS = 8
    Object.assign(cmp, {
      clearCanvas() {
        gl.viewport(0, 0, ...canvasSize)
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)    
      },
      layoutViews() {          
        const {zoom } = cmp.state
        cmp.state.itemViewSize = [0,1].map(axis=>canvasSize[axis]/zoom)
        const {elemsLayoutCache, layoutCalculator} = cmp
        if (elemsLayoutCache[zoom]) {
          Object.assign(cmp.state, [zoom])
        } else {
          const itemViewSize = cmp.state.itemViewSize
          const layout = layoutCalculator.layoutView(itemViewSize)
          elemsLayoutCache[zoom] = JSON.parse(JSON.stringify(layout))
          Object.assign(cmp.state, elemsLayoutCache[zoom])
          jb.log('zui elemsLayout',{...layout, itemViewSize, ctx:cmp.ctx})
        }
        return cmp.state.shownViews
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
        const shaderProgram = jb.zui.buildShaderProgram(gl, glCode)
        const fixedCenter = [center[0], DIM-center[1]+1]
        gl.useProgram(shaderProgram)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridPadding'), [2,0])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), fixedCenter)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), canvasSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'itemViewSize'), itemViewSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

        viewBeData.uniforms.forEach(({glType,id,glMethod,value}) => {
          if (glType == 'sampler2D') {
            const {i} = jb.zui.allocateSingleTextureUnit({view: id,cmp})
            gl.activeTexture(gl['TEXTURE'+i])
            gl.bindTexture(gl.TEXTURE_2D, view.textures[id] || emptyTexture)
            gl.uniform1i(gl.getUniformLocation(shaderProgram, id), i)    
          } else {
            gl[`uniform${glMethod}`](gl.getUniformLocation(shaderProgram, id), value)
          }
        })

        beDataGpu.itemsPositions.atts[0].id = 'itemPos' // the default id is _itemPos...
        ;[ beDataGpu.itemsPositions, viewBeData].forEach(({id, atts, buffer, floatsInVertex}) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
          gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)
  
          atts.forEach(({id,size,offset}) => {
            const att = gl.getAttribLocation(shaderProgram, id)
            gl.enableVertexAttribArray(att)
            gl.vertexAttribPointer(att, size, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
          })
        })
        jb.log('zui itemlist renderGPUView beDataGpu', {beDataGpu, ctx})
        jb.log('zui itemlist renderGPUView', {elemLayout, glCode, view, zoom,fixedCenter,canvasSize,itemViewSize,ctx})
        console.log(zoom,center,size)

        gl.drawArrays(gl.POINTS, 0, noOfItems)
      },
      elemsLayoutCache: {},
      atlasTexturePool: {},
      renderCounter: 0,
      boundTextures: Array.from(new Array(NO_OF_UNITS).keys()).map(i=>({i, lru : 0})),

      async refreshCanvasToFullScreen() {
        const sizeInPx = calcWidthHeight()
        glCanvas.width = sizeInPx.width
        glCanvas.height = sizeInPx.height
        this.clearCanvas()
        this.aspectRatio = glCanvas.width/glCanvas.height
        await jb.delay(1)
        cmp.state.elemsLayoutCache = {}
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

    await Object.values(cmp.feViews).reduce((pr,feView) => pr.then(() => cmp.prepareTextures(feView)), Promise.resolve())

    function createGl() {
        const glParams = { alpha: true, premultipliedAlpha: true }
        return jbHost.isNode ? require('gl')(...canvasSize, glParams)
          : emulateFrontEndInTest ? new OffscreenCanvas(...canvasSize).getContext('webgl', glParams)
          : el.getContext('webgl', glParams)
    }
  }
})