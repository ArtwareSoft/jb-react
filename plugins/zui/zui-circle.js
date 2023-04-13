jb.dsl('zui')

jb.component('circle', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp' },
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,prop,features) => { 
    const zuiElem = jb.zui.circleZuiElem(ctx)
    const view = zuiElem.view = {
      title: 'circle',
      ctxPath: ctx.path,
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => round == 0 ? [5,5] : 
        [10 + 0.1*jb.zui.floorLog2(available[1]),10 + 0.1*jb.zui.floorLog2(available[1])],

      pivots: (s) => prop ? prop.pivots(s): [],
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
    }
    if (prop.colorScale)
      view.backgroundColorByProp = {prop,colorScale: prop.colorScale}
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.extension('zui','circle', {
    circleZuiElem: viewCtx => ({
      renderProps: () => jb.zui.renderProps(viewCtx),
      prepareGPU({ gl, itemsPositions, DIM }) {
          const src = [jb.zui.vertexShaderCode({
              id:'circle',
              code: 'attribute vec3 _backgroundColor;varying vec3 backgroundColor;',
              main: 'backgroundColor = _backgroundColor;'
            }), 
            jb.zui.fragementShaderCode({
              code: `varying vec3 backgroundColor;`,
              main: `vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
              float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
              if (distance < 0.5)
                gl_FragColor = vec4(backgroundColor,1.0);`
            })] 
           
          const backgroundColor = this.view.backgroundColorByProp || { colorScale: x => [0,x,0], prop: {pivots: () => [ {scale: () => 1 }]}}
          const itemToColor01 = backgroundColor.prop.pivots({DIM})[0].scale

          const circleNodes = itemsPositions.sparse.map(([item, x,y]) => [x,y, ...backgroundColor.colorScale(itemToColor01(item))])
          const vertexArray = new Float32Array(circleNodes.flatMap(v=> v.map(x=>1.0*x)))

          const floatsInVertex = 2 + 3
          const vertexCount = vertexArray.length / floatsInVertex

          const buffers = {
              vertexBuffer: gl.createBuffer(),
              shaderProgram: jb.zui.buildShaderProgram(gl, src),
              vertexCount, floatsInVertex
          }    
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
  
          return buffers        
      },
      renderGPUFrame({ gl, glCanvas, zoom, center}, { vertexBuffer, shaderProgram, floatsInVertex, vertexCount }) {
          gl.useProgram(shaderProgram)
          const {size, pos } = this.renderProps()
        
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPoscircle')
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

          const background = gl.getAttribLocation(shaderProgram, '_backgroundColor')
          gl.enableVertexAttribArray(background)
          gl.vertexAttribPointer(background, 3, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
})