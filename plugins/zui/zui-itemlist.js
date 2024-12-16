dsl('zui')

extension('zui','itemlist', {
  fixGrid(grid) {
    if (!grid) return [5,5]
    if (typeof grid === 'number') return [grid,grid]
    if (grid.length == 1) return [grid[0],grid[0]]
    return grid
  }
})

component('itemlist', {
  type: 'control',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true, defaultValue: grid()},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: grid()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('grid', {
  type: 'itemlist-style',
  impl: features(
    variable('items', '%$$model/items()%'),
    variable('itemsLayout', '%$$model/itemsLayout()%'),
    frontEnd.var('gridSize', '%$itemsLayout/gridSize%'),
    frontEnd.var('itemsXyPos', ({},{items}) => items.map(i=>i.xyPos)),
    frontEnd.var('initialZoomCenter', ['%$itemsLayout/initialZoom%','%$itemsLayout/center%']),
    variable('inZoomingGrid', true),
    init((ctx,{cmp, items}) => {
      cmp.enrichCtxFromDecendents = async descendants => {
        const elemsHtmlCss = []
        await descendants.reduce((pr,child_cmp)=>pr.then(async ()=> elemsHtmlCss.push(await child_cmp.calcHtmlPayload()) ), Promise.resolve())
        return {elemsHtmlCss}
      }
      cmp.extendedPayloadWithHtmlDescendants = (res,descendants) => {
        const pack = { [res.id]: res }
        descendants.forEach(cmp=>{
          const  { id, title, clz, frontEndMethods, frontEndVars, methods, zoomingCssProfile } = cmp
          pack[id] = { id, title, clz, frontEndMethods, frontEndVars, methods, zoomingCssProfile }
        })
        return pack
      }
    }),
    html((ctx,{elemsHtmlCss,cmp,items}) => `<div class="zui-items ${cmp.clz}">${items.map(
      item=>`<div class="zui-item pos_${item.xyPos.join('-')}">${elemsHtmlCss.map(ch=>ch.html).join('\t\n')}</div>`)
      .join('\n')}</div>`),
    css((ctx,{elemsHtmlCss,cmp}) => [
      ...elemsHtmlCss.map(({id,css}) => ({id, css})),
      {id: cmp.id, css: `.${cmp.clz}.zui-items {position: relative}\n .${cmp.clz}>.zui-item {pointer-events: none; position: absolute}`}
    ]),
    zui.canvasZoom(),
    frontEnd.init((ctx,{cmp,widget,initialZoomCenter}) => {
      widget.state.zoom = widget.state.tZoom = initialZoomCenter[0]
      widget.state.center = widget.state.tCenter = initialZoomCenter[1]
    }),
    frontEnd.method('renderHtml', (ctx,{cmp,widget,uiTest}) => {
      if (uiTest) return
      widget.canvas.innerHTML = cmp.html || ''
      jb.zui.setCmpCss(cmp)
    }),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize,widget,itemsXyPos}) => {
      const center = widget.state.center, canvasSize = widget.canvasSize
      jb.zui.setCss(`dynamic-${cmp.clz}`, [
        `.${cmp.clz}>.zui-item { width: ${itemSize[0]}px; height: ${itemSize[1]}px }`,
        ...itemsXyPos.map(xyPos => {
          const pos = xyPos.map((v,axis)=>(v- center[axis]+1)*itemSize[axis]+ canvasSize[axis]/2)
          const visible = pos[0] > 0 && pos[0] <= canvasSize[0] && pos[1] > 0 && pos[1] <= canvasSize[1]
          return `.${cmp.clz}>.pos_${xyPos.join('-')} { ${visible ? `top: ${canvasSize[1] - pos[1]}px; left: ${pos[0]}px` : 'display:none'} }`
        })].join('\n')
      )
    }),
    frontEnd.method('buildLayoutCalculator', (ctx,{cmp,widget}) => {
      cmp.layoutCalculator = jb.zui.initLayoutCalculator(buildNode(cmp.id,0))

      function buildNode(id,childIndex) {
        const cmpData = widget.cmpsData[id]
        const zoomingSize = cmpData.zoomingSizeProfile ? ctx.run(cmpData.zoomingSizeProfile) : {}
        const layoutProps = cmpData.layoutProps || {}
        const children = cmpData.childrenIds && cmpData.childrenIds.split(',').map((ch,i)=>buildNode(ch,i))
        return { id, childIndex, children, zoomingSize, layoutProps, title: cmpData.title}
      }
    }),
    frontEnd.flow(
      source.animationFrame(),
      rx.flatMap(source.data('%$cmp.animationStep()%')),
      rx.do(({},{widget}) => widget.renderCounter++),
      rx.var('itemSize', (ctx,{widget}) => [0,1].map(axis=>widget.canvasSize[axis]/widget.state.zoom)),
      sink.action('%$widget.renderCmps()%')
    ),
    frontEnd.method('render', (ctx,{cmp,widget}) => {
      const itemSize = [0,1].map(axis=>widget.canvasSize[axis]/widget.state.zoom)
      const {shownCmps, elemsLayout} = cmp.layoutCalculator.calcItemLayout(itemSize,ctx)
      widget.cmpsData[cmp.id].itemLayoutforTest = {shownCmps, elemsLayout}
      const toRender = Object.values(widget.cmps)
        .filter(cmp=>cmp.renderRole == 'dynamicFlowTop' || shownCmps.indexOf(cmp.id) != -1)
      const notReady = toRender.filter(cmp=>cmp.notReady).map(cmp=>cmp.id)
      if (notReady.length) 
        widget.beProxy.beUpdateRequest(notReady)
      cmp.showGrid(ctx)
      jb.log('zui itemlist render',{elemsLayout, shownCmps, toRender, notReady, ctx})
      toRender.filter(cmp=>!cmp.notReady && !cmp.renderRole.match(/[Ff]lowElem/))
        .forEach(cmp=>widget.renderCmp(cmp,ctx.setVars({elemLayout: elemsLayout[cmp.id]})))
    }),
    frontEnd.method('showGrid', (ctx,{cmp,widget}) => {
        const glCode = [`attribute vec2 itemPos;
            uniform vec2 zoom;
            uniform vec2 center;
        
            void main() {
              vec2 itemTopLeftNdc = (itemPos - center) / (0.5*zoom);
              gl_PointSize = 3.0;
              gl_Position = vec4( itemTopLeftNdc, 0.0, 1.0);
            }`,
            `precision highp float;
            void main() {
              gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
              return;
            }`
        ]
        
        const {gridSize} = cmp.vars
        const {gl} = widget
        const ar = []
        for(let x = 0;x<gridSize[0];x++) for(let y = 0;y<gridSize[1];y++) { ar.push(x); ar.push(y) }
        const vertexArray = new Float32Array(ar.map(x=>1.0*x))

        const shaderProgram = jb.zui.buildShaderProgram(gl, glCode)
        gl.useProgram(shaderProgram)

        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [widget.state.zoom,widget.state.zoom])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), widget.state.center)

        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
        const itemPos = gl.getAttribLocation(shaderProgram, 'itemPos')
        gl.enableVertexAttribArray(itemPos)
        gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, 0, 0)

        gl.drawArrays(gl.POINTS, 0, gridSize[0]*gridSize[1])  
    }),
    init((ctx,{cmp, itemsLayout, widget, $model}) => {
      const ctxForChildren = ctx.setVars({renderRole: 'zoomingGridElem'}) // using the feature is not feasible in init
      cmp.children = [$model.itemControl(ctxForChildren).init()]
      cmp.extendedPayloadWithDescendants = async (res,descendants) => {
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {shownCmps} = layoutCalculator.calcItemLayout(itemsLayout.itemSize, ctx)
        const pack = { [res.id]: res }
        await descendants.filter(cmp=>!cmp.dynamicFlowElem).reduce((pr,cmp)=>pr.then(async ()=> {
          const { id , title, layoutProps, zoomingSizeProfile } = cmp

          pack[id] = cmp.children || shownCmps.indexOf(id) != -1 ? await cmp.calcPayload()
              : {id, title, zoomingSizeProfile, layoutProps, notReady: true } 
        }), Promise.resolve())
        return pack
      }
    })
  )
})

component('grid', {
  type: 'items_layout',
  params: [
    {id: 'gridSize', as: 'array', defaultValue: 10, description: 'e,g, 5 => [5,5]'},
    {id: 'xyPivots', type: 'grid_pivot', dynamic: true, defaultValue: xyByProps()},
    {id: 'initialZoom', as: 'number', description: 'grid units', defaultValue: 10},
    {id: 'center', as: 'array', description: 'grid units', defaultValue: [2.5,2.6]}
  ],
  impl: (ctx,gridSize) =>jb.zui.gridItemsLayout({...ctx.params,gridSize: jb.zui.fixGrid(gridSize)},ctx)
})


// component('elemBorder', {
//   type: 'feature',
//   params: [],
//   impl: dependentFeature({
//     feature: shaderMainSnippet(`
//     if (inElem[0] <1.0 || inElem[0] > size[0]-1.0 || inElem[1] <1.0 || inElem[1] > size[1]-1.0)
//       gl_FragColor = vec4(borderColor, 1.0);`),
//     glVars: ['borderColor']
//   })
// })