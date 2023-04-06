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
      layoutSizes: ({size}) => [1,1, 4,4, 10 + 0.1*jb.zui.floorLog2(size[0]),10 + 0.1*jb.zui.floorLog2(size[0])],
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
      // async prepare({gl}) {
      //   this.pointTexture = await jb.zui.imageToTexture(gl, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDgwCEMBJZu0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABM5JREFUWMO1V0tPG2cUPZ4Hxh6DazIOrjFNqJs0FIMqWFgWQkatsmvVbtggKlSVRVf5AWz4AWz4AUSKEChll19QJYSXkECuhFxsHjEhxCYm+DWGMZ5HF72DJq4bAzFXurI0M/I5997v3u9cC65vTJVn2lX/xHINQOYSBLTLEuIuCWw4Z3IGAEvf6ASmVHjNzHCXBG4A0AjACsAOwEbO0nsFQBnAGYASAIl+ZRMR7SolMEdsByD09fV5R0ZGgg8ePPjW5/N1iqLYpuu6RZblciKR2I9Go69evnwZnZ+fjwI4IS8AKBIRzeQfJWCANwKwh0KhtrGxsYehUOin1tbW+zzP23ietzY2NnIAoGmaLsuyUiqVyvl8XtrY2NiamZn589mzZxsAUgCOAeQAnFI2tI+VxIjaAeDzoaGh7xYWFuZOTk6OZVk+12uYqqq6JEnn0Wg0OT4+/geAXwGEAdwDIFJQXC1wO4DWR48e/RCPxxclSSroVzRFUbSDg4P848ePFwH8DuAhkWih83TRQWxFOXgAwvDwcOfo6OhvXV1d39tsNtuVBwTDWBwOh1UUxVsMw1hXVlbSdCgNV43uYSvrHg6H24aHh38eHBz85TrgF9FYLHA4HLzH43FvbW2d7u/vG+dANp8FpqIlbd3d3V8Fg8EfBUFw4BONZVmL3+9vHhkZCQL4AoAHgJPK8G+yzC0XDofdoVAo5PP5vkadTBAEtr+/39ff3x8gAp/RPOEqx2qjx+NpvXv3bk9DQ0NDvQgwDIOWlhZrMBj8kgi0UJdxRgYMArzL5XJ7vd57qLPZ7Xamp6fnNgBXtQxcjFuHw+Hyer3t9SYgCAITCAScAJoBNNEY/08GOFVVrfVMv7kMNDntFD1vjIAPrlRN0xjckOm6biFQ3jwNPwDMZrOnqVTqfb3Bi8Wivru7W/VCYkwPlKOjo0IikXh7EwQikYgE4Nw0CfXKDCipVCoTj8df3QABbW1tLUc6oUgkFPMkVACUNjc337148eKvw8PDbJ2jP1taWkoCyNDVXDSECmNSK4qiKNLq6urW8+fPI/UicHx8rD59+jSVy+WOAKSJhKENwFItLtoxk8mwsixzHR0dHe3t7c5PAU+n09rs7OzJkydPYqVSaQfANoDXALIk31S2smU1TWMPDg7K5XKZ7+3t9TudTut1U7+wsFCcmJiIpdPpbQBxADsAknQWymYCOukBHYCuKApisdhpMpnURFEU79y503TVyKenpzOTk5M7e3t7MQKPV0Zv1gNm+awB0MvlshqLxfLb29uyJElWURSbXC4XXyvqxcXFs6mpqeTc3Nzu3t7e3wQcA7BPZ8Cov1pNlJplmQtAG8MwHV6v95tAINA5MDBwPxAIuLu6upr8fr/VAN3c3JQjkcjZ+vp6fnl5+d2bN29SuVzuNYAEpf01CdRChUL+X1VskHACuA3Ay3Fcu9vt7nA6nZ7m5uYWQRCaNE3jVVW15PP580KhIGUymWw2m00DOAJwSP4WwPtq4LX2Ao6USxNlQyS/RcQcdLGwlNIz6vEMAaZpNzCk2Pll94LK/cDYimxERiBwG10sxjgvEZBE0UpE6vxj+0Ct5bTaXthgEhRmja8QWNkkPGsuIpfdjpkK+cZUWTC0KredVmtD/gdlSl6EG4AMvQAAAABJRU5ErkJggg==')
      // },
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

          // gl.activeTexture(gl.TEXTURE0)
          // gl.bindTexture(gl.TEXTURE_2D, this.pointTexture)
          // gl.uniform1i(gl.getUniformLocation(shaderProgram, 'pointTexture'), 0)
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
})