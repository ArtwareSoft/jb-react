jb.dsl('zui')

jb.component('circle', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
    {
      id: 'circleSize',
      dynamic: true,
      defaultValue: ({vars}) => 10 + 2 * Math.log(vars.$props.DIM/vars.$props.zoom)
    },
    {id: 'colorScale', type: 'color_scale'}
  ],
  impl: (ctx,prop,features) => { 
    const zuiElem = jb.zui.circleZuiElem(ctx)
    const view = {
      title: 'circle',
      ctxPath: ctx.path,
      layoutSizes: ({size}) => [0.01,0.01, 10 + 0.1*jb.zui.floorLog2(size[0]),10 + 0.1*jb.zui.floorLog2(size[0]), 0,0 ],
      state: () => jb.zui.renderProps(ctx),
      pivots: () => prop.pivots(),
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.extension('zui','circle', {
    circleZuiElem: viewCtx => ({
      renderProps: () => jb.zui.renderProps(viewCtx),
      async prepare({gl}) {
        this.pointTexture = await jb.zui.imageToTexture(gl, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDgwCEMBJZu0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABM5JREFUWMO1V0tPG2cUPZ4Hxh6DazIOrjFNqJs0FIMqWFgWQkatsmvVbtggKlSVRVf5AWz4AWz4AUSKEChll19QJYSXkECuhFxsHjEhxCYm+DWGMZ5HF72DJq4bAzFXurI0M/I5997v3u9cC65vTJVn2lX/xHINQOYSBLTLEuIuCWw4Z3IGAEvf6ASmVHjNzHCXBG4A0AjACsAOwEbO0nsFQBnAGYASAIl+ZRMR7SolMEdsByD09fV5R0ZGgg8ePPjW5/N1iqLYpuu6RZblciKR2I9Go69evnwZnZ+fjwI4IS8AKBIRzeQfJWCANwKwh0KhtrGxsYehUOin1tbW+zzP23ietzY2NnIAoGmaLsuyUiqVyvl8XtrY2NiamZn589mzZxsAUgCOAeQAnFI2tI+VxIjaAeDzoaGh7xYWFuZOTk6OZVk+12uYqqq6JEnn0Wg0OT4+/geAXwGEAdwDIFJQXC1wO4DWR48e/RCPxxclSSroVzRFUbSDg4P848ePFwH8DuAhkWih83TRQWxFOXgAwvDwcOfo6OhvXV1d39tsNtuVBwTDWBwOh1UUxVsMw1hXVlbSdCgNV43uYSvrHg6H24aHh38eHBz85TrgF9FYLHA4HLzH43FvbW2d7u/vG+dANp8FpqIlbd3d3V8Fg8EfBUFw4BONZVmL3+9vHhkZCQL4AoAHgJPK8G+yzC0XDofdoVAo5PP5vkadTBAEtr+/39ff3x8gAp/RPOEqx2qjx+NpvXv3bk9DQ0NDvQgwDIOWlhZrMBj8kgi0UJdxRgYMArzL5XJ7vd57qLPZ7Xamp6fnNgBXtQxcjFuHw+Hyer3t9SYgCAITCAScAJoBNNEY/08GOFVVrfVMv7kMNDntFD1vjIAPrlRN0xjckOm6biFQ3jwNPwDMZrOnqVTqfb3Bi8Wivru7W/VCYkwPlKOjo0IikXh7EwQikYgE4Nw0CfXKDCipVCoTj8df3QABbW1tLUc6oUgkFPMkVACUNjc337148eKvw8PDbJ2jP1taWkoCyNDVXDSECmNSK4qiKNLq6urW8+fPI/UicHx8rD59+jSVy+WOAKSJhKENwFItLtoxk8mwsixzHR0dHe3t7c5PAU+n09rs7OzJkydPYqVSaQfANoDXALIk31S2smU1TWMPDg7K5XKZ7+3t9TudTut1U7+wsFCcmJiIpdPpbQBxADsAknQWymYCOukBHYCuKApisdhpMpnURFEU79y503TVyKenpzOTk5M7e3t7MQKPV0Zv1gNm+awB0MvlshqLxfLb29uyJElWURSbXC4XXyvqxcXFs6mpqeTc3Nzu3t7e3wQcA7BPZ8Cov1pNlJplmQtAG8MwHV6v95tAINA5MDBwPxAIuLu6upr8fr/VAN3c3JQjkcjZ+vp6fnl5+d2bN29SuVzuNYAEpf01CdRChUL+X1VskHACuA3Ay3Fcu9vt7nA6nZ7m5uYWQRCaNE3jVVW15PP580KhIGUymWw2m00DOAJwSP4WwPtq4LX2Ao6USxNlQyS/RcQcdLGwlNIz6vEMAaZpNzCk2Pll94LK/cDYimxERiBwG10sxjgvEZBE0UpE6vxj+0Ct5bTaXthgEhRmja8QWNkkPGsuIpfdjpkK+cZUWTC0KredVmtD/gdlSl6EG4AMvQAAAABJRU5ErkJggg==')
      },
      prepareGPU({ gl, itemsPositions }) {
          const src = [jb.zui.vertexShaderCode({id:'circle'}), 
            jb.zui.fragementShaderCode({
              code: `uniform sampler2D pointTexture;
                    uniform vec4 pointColor;`,
              main: 'gl_FragColor = pointColor * texture2D( pointTexture, inElem/size );'
            })] 
           
          const vertexArray = new Float32Array(itemsPositions.sparse.flatMap(x=>x.slice(1,3)).map(x=>1.0*x))
  
          const buffers = {
              vertexBuffer: gl.createBuffer(),
              shaderProgram: jb.zui.buildShaderProgram(gl, src),
              vertexNumComponents: 2,
              vertexCount: vertexArray.length/2,
          }    
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
  
          return buffers        
      },
      renderGPUFrame({ gl, glCanvas, zoom, center}, { vertexBuffer, shaderProgram, vertexNumComponents, vertexCount }) {
          gl.useProgram(shaderProgram)
          const {size, pos } = this.renderProps()
        
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

          gl.uniform4fv(gl.getUniformLocation(shaderProgram, 'pointColor'), [0.1, 0.7, 0.2, 1.0])
        
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPoscircle')
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)
  
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, this.pointTexture)
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'pointTexture'), 0)
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
})