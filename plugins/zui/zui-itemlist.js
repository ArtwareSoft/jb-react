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
    variable('parentItemlistId', '%$cmp.id%'),
    variable('itemsLayout', '%$$model/itemsLayout()%'),
    frontEnd.var('gridSize', '%$itemsLayout/gridSize%'),
    frontEnd.var('initialZoomCenter', ['%$itemsLayout/initialZoom%','%$itemsLayout/center%']),
    init((ctx,{cmp, itemsLayout, $model}) => {
      cmp.children = [$model.itemControl(ctx).init()]
      setAsGridElem(cmp.children[0])
      function setAsGridElem(cmp) {
        cmp.gridElem = true
        ;(cmp.children||[]).forEach(setAsGridElem)
      }
      cmp.extendedPayload = async res => {
        const cmps = ctx.vars.widget.cmps
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {shownCmps} = layoutCalculator.calcItemLayout(itemsLayout.itemSize)
        const pack = { pack: true, [res.id]: res }
        await cmps.filter(cmp=>cmp.id != res.id).reduce((pr,cmp)=>pr.then(async ()=> {
          const { id , title, layoutProps, gridElem, zoomingSize } = cmp
          const zoomingSizeProfile = jb.path(zoomingSize,'profile')
          pack[id] = cmp.children || shownCmps.indexOf(id) != -1 ? await cmp.calcPayload() 
              : {id, title, zoomingSizeProfile, layoutProps, gridElem, notReady: true} 
        }), Promise.resolve())
        return pack
      }
    }),
    zui.canvasZoom(),
    frontEnd.init((ctx,{cmp,widget,initialZoomCenter}) => {
      widget.state.zoom = widget.state.tZoom = initialZoomCenter[0]
      widget.state.center = widget.state.tCenter = initialZoomCenter[1]
    }),
    frontEnd.flow(
      source.animationFrame(),
      rx.flatMap(source.data('%$cmp.animationStep()%')),
      rx.do(({},{widget}) => widget.renderCounter++),
      sink.action('%$widget.renderCmps()%')
    ),
    frontEnd.method('buildLayoutCalculator', (ctx,{cmp,widget}) => {
      const cmpsData = widget.cmpsData
      cmp.layoutCalculator = jb.zui.initLayoutCalculator(buildNode(cmp.id,0))

      function buildNode(id,childIndex) {
        const zoomingSize = cmpsData[id].zoomingSizeProfile ? ctx.run(cmpsData[id].zoomingSizeProfile) : {}
        const children = cmpsData[id].childrenIds && cmpsData[id].childrenIds.split(',').map((ch,i)=>buildNode(ch,i))
        return { id, childIndex, children, ...zoomingSize, ...(cmpsData[id].layoutProps || {}) }
      }
    }),
    frontEnd.method('render', (ctx,{cmp,widget}) => {
      const itemSize = [0,1].map(axis=>widget.canvasSize[axis]/(widget.state.zoom*cmp.vars.gridSize[axis]))
      const {shownCmps, elemsLayout} = cmp.layoutCalculator.calcItemLayout(itemSize)
      widget.cmpsData[cmp.id].itemLayoutforTest = {shownCmps, elemsLayout}
      const toRender = Object.values(widget.cmps).filter(({id})=>shownCmps.indexOf(id) != -1)
      const notReady = toRender.filter(cmp=>cmp.notReady).map(cmp=>cmp.id)
      if (notReady.length) 
        widget.beProxy.beUpdateRequest(notReady)
      cmp.showGrid(ctx)
      toRender.filter(cmp=>!cmp.notReady).forEach(cmp=>widget.renderCmp(cmp,ctx.setVars({elemLayout: elemsLayout[cmp.id]})))
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

component('gridElem', {
  type: 'feature',
  circuit: 'zuiTest.itemlist',
  impl: features(
    frontEnd.uniforms(
      float('zoom', '%$widget.state.zoom%'),
      vec2('center', '%$widget.state.center%'),
      vec2('pos', '%$elemLayout.pos%'),
      vec2('size', '%$elemLayout.size%')
    ),
    uniforms(
      canvasSize(),
      vec2('gridSize', '%$itemsLayout/gridSize%'),
      float('zoom', '%$itemsLayout/initialZoom%'),
      vec2('center', '%$itemsLayout/center%'),
      vec2('pos', [0,0]),
      vec2('size', [0,0])
    ),
    glAtt(vec2('itemPos', '%$item.xyPos%')),
    vertexDecl('vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }'),
    varying('vec2', 'elemBottomLeftCoord', {
      glCode: 'floor((elemBottomLeftNdc + 1.0) * (0.5*canvasSize))'
    }),
    vertexMainSnippet(`vec2 elemCenterPx = invertY(pos+size/2.0);
    vec2 itemTopLeftNdc = (itemPos - center) / (0.5*zoom);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(pos+vec2(0.0,size[1])) / (0.5 * canvasSize);
    gl_PointSize = max(size[0],size[1]) * 1.42;
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    `),
    shaderMainSnippet({
      code: `
        vec2 inElem = gl_FragCoord.xy- elemBottomLeftCoord;
        inElem = vec2(inElem[0], size[1] - inElem[1]);

        if (inElem[0] >= size[0] || inElem[1] >= size[1]) {
          gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
          return;
        }
        if (inElem[0] < 0.0 || inElem[1] < 0.0) {
          gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0); 
          return;
        }
        // if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) {
        //   gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
        //   return;
        // };
        vec2 rInElem = inElem/size;
    `,
      phase: 1
    })
  )
})

component('elemBorder', {
  type: 'feature',
  params: [],
  impl: dependentFeature({
    feature: shaderMainSnippet(`
    if (inElem[0] <1.0 || inElem[0] > size[0]-1.0 || inElem[1] <1.0 || inElem[1] > size[1]-1.0)
      gl_FragColor = vec4(borderColor, 1.0);`),
    glVars: ['borderColor']
  })
})