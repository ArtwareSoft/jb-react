jb.dsl('zui')

jb.component('image', {
  type: 'view',
  params: [
    {id: 'url', as: 'string', dynamic: 'true', description: '%% is item' },
    {id: 'preferedSize', as: 'string', defaultValue: '400,600' },
    {id: 'minSize', as: 'string', defaultValue: '30,30' },
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,url,preferedSize,minSize,features) => { 
    const zuiElem = jb.zui.image(ctx)
    const view = zuiElem.view = {
      url,
      title: 'image',
      ctxPath: ctx.path,
      layoutSizes: ({size}) => [ ...minSize.split(',').map(x=>+x), ...preferedSize.split(',').map(x=>+x), 0,0],
      pivots: (s) => [],
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.extension('zui','image', {
    image: viewCtx => ({
      renderProps: () => jb.zui.renderProps(viewCtx),
      async prepare({gl, items}) {
        this.imageTexture = await jb.zui.imageToTexture(gl, this.view.url(viewCtx.setData(items[0])))
      },
      prepareGPU({ gl, itemsPositions }) {
          const src = [jb.zui.vertexShaderCode({
              id:'image',
            }), 
            jb.zui.fragementShaderCode({
              code: `uniform sampler2D imageTexture;`,
              main: 'gl_FragColor = texture2D( imageTexture, inElem/size );'
            })] 
           
          const imageNodes = itemsPositions.sparse.map(([item, x,y]) => [x,y])
          const vertexArray = new Float32Array(imageNodes.flatMap(v=> v.map(x=>1.0*x)))

          const floatsInVertex = 2
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
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPosimage')
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, this.imageTexture)
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'imageTexture'), 0)
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
})