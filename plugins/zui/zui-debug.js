extension('zui','debug', {
  showTouchPointers: cmp => ({
    prepareGPU({ gl }) {
        const src = [`attribute vec4 pointersPos;
            uniform vec2 canvasSize;
            varying vec2 coord;
        
            void main() {
              gl_Position = vec4( pointersPos.xy * 2.0 - 1.0, 0.0, 1.0);
              coord = vec2(pointersPos[2],canvasSize[1] - pointersPos[3]) ;
              gl_PointSize = 100.0;
            }`,
            `precision highp float;
            varying vec2 coord;
            uniform vec2 canvasSize;
            void main() {
              vec2 r = abs(gl_FragCoord.xy - coord) / 100.0;
              float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
              if (distance < 0.5)
                gl_FragColor = vec4(distance,0.0, 0.0, 0.2);
            }`
        ]
        
        return { shaderProgram: jb.zui.buildShaderProgram(gl, src)}
    },
    renderGPUFrame({ gl, glCanvas}, { shaderProgram }) {
        const canvasSize = [glCanvas.width, glCanvas.height]
        gl.useProgram(shaderProgram)
        const vertexArray = new Float32Array(cmp.pointers.flatMap(p=>[...pointTo01(p.p), ...(p.p || [0,0]) ]).map(x=>1.0*x))

        const vertexBuffer = gl.createBuffer()
        const vertexNumComponents = 4
        const vertexCount = vertexArray.length/vertexNumComponents

        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), canvasSize)

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        const itemPos = gl.getAttribLocation(shaderProgram, 'pointersPos')
        gl.enableVertexAttribArray(itemPos)
        gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)

        gl.drawArrays(gl.POINTS, 0, vertexCount)

        function pointTo01(p) {
          if (!p) return [0,0]
          return [p[0]/canvasSize[0], 1-p[1]/canvasSize[1]]
        }
    }
  }),    
  mark4PointsZuiElem: () => ({
    prepareGPU({ gl, itemsPositions }) {
        const src = [`attribute vec2 itemPosmark4Points;
            uniform vec2 zoom;
            uniform vec2 center;
        
            void main() {
              gl_Position = vec4( ((itemPosmark4Points - center) / zoom) * 2.0, 0.0, 1.0);
              gl_PointSize = 5.0;
            }`,
            `precision highp float;
            void main() {
              gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
              return;
            }`
        ]
         
        const vertexArray = new Float32Array(itemsPositions.sparse.flatMap(x=>{
          const _base = x.slice(1,3)
          const base = [0,1].map(axis=>_base[axis]-0.5)
          return [...base, base[0],base[1]+1, base[0]+1,base[1], base[0]+1,base[1]+1]
        }).map(x=>1.0*x))

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
    renderGPUFrame({ gl, zoom, center}, { vertexBuffer, shaderProgram, vertexNumComponents, vertexCount }) {
        gl.useProgram(shaderProgram)
      
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom] )
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
      
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        const itemPos = gl.getAttribLocation(shaderProgram, 'itemPosmark4Points')
        gl.enableVertexAttribArray(itemPos)
        gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)
       gl.drawArrays(gl.POINTS, 0, vertexCount)
    }
  }),
  markGridAreaZuiElem: () => ({
      src: [
        jb.zui.vertexShaderCodeBase({}), 
        jb.zui.fragementShaderCode({main: 'gl_FragColor = vec4(inElem/size,0.0, 1.0);'})
      ],
      posSize(itemViewSize) { return { size: [0,1].map(i=>itemViewSize[i]/2), pos: [0,1].map(i=>itemViewSize[i]/4)} },
      ready: true,     
      ver: 2
  }),
  markGridAreaZuiElem2: () => ({
    prepareGPU({ gl, itemsPositions }) {
        const src = [
          jb.zui.vertexShaderCode({id: 'markGrid'}), 
          jb.zui.fragementShaderCode({main: 'gl_FragColor = vec4(inElem/size,0.0, 1.0);'})
        ] 
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
        const itemViewSize = [glCanvas.width/ zoom, glCanvas.height/ zoom]
      
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom] )
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'itemViewSize'), itemViewSize)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), [0.2*itemViewSize[0],0.7*itemViewSize[1]])
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), [0.6*itemViewSize[0],0.2*itemViewSize[1]])

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        const itemPos = gl.getAttribLocation(shaderProgram, 'itemPosmarkGrid')
        gl.enableVertexAttribArray(itemPos)
        gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)
        gl.drawArrays(gl.POINTS, 0, vertexCount)
    }
  }),
  displayImageContent(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
  
    // Read the texture data into the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    document.body.appendChild(canvas);
  },  
  displayTextureContent(gl, texture, width, height) {
    // Create a framebuffer and attach the texture to it
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // Read the texture data into the canvas
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
    ctx.putImageData(imgData, 0, 0);
  
    // Add the canvas to the DOM
    document.body.appendChild(canvas);
  
    // Cleanup
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(framebuffer);
  }  
})