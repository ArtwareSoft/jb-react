
jb.extension('zui','circle', {
    circleZuiElem: viewCtx => ({
      state: () => jb.zui.viewState(viewCtx),
      async prepare({gl}) {
        this.pointTexture = await jb.zui.imageToTexture(gl, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDgwCEMBJZu0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABM5JREFUWMO1V0tPG2cUPZ4Hxh6DazIOrjFNqJs0FIMqWFgWQkatsmvVbtggKlSVRVf5AWz4AWz4AUSKEChll19QJYSXkECuhFxsHjEhxCYm+DWGMZ5HF72DJq4bAzFXurI0M/I5997v3u9cC65vTJVn2lX/xHINQOYSBLTLEuIuCWw4Z3IGAEvf6ASmVHjNzHCXBG4A0AjACsAOwEbO0nsFQBnAGYASAIl+ZRMR7SolMEdsByD09fV5R0ZGgg8ePPjW5/N1iqLYpuu6RZblciKR2I9Go69evnwZnZ+fjwI4IS8AKBIRzeQfJWCANwKwh0KhtrGxsYehUOin1tbW+zzP23ietzY2NnIAoGmaLsuyUiqVyvl8XtrY2NiamZn589mzZxsAUgCOAeQAnFI2tI+VxIjaAeDzoaGh7xYWFuZOTk6OZVk+12uYqqq6JEnn0Wg0OT4+/geAXwGEAdwDIFJQXC1wO4DWR48e/RCPxxclSSroVzRFUbSDg4P848ePFwH8DuAhkWih83TRQWxFOXgAwvDwcOfo6OhvXV1d39tsNtuVBwTDWBwOh1UUxVsMw1hXVlbSdCgNV43uYSvrHg6H24aHh38eHBz85TrgF9FYLHA4HLzH43FvbW2d7u/vG+dANp8FpqIlbd3d3V8Fg8EfBUFw4BONZVmL3+9vHhkZCQL4AoAHgJPK8G+yzC0XDofdoVAo5PP5vkadTBAEtr+/39ff3x8gAp/RPOEqx2qjx+NpvXv3bk9DQ0NDvQgwDIOWlhZrMBj8kgi0UJdxRgYMArzL5XJ7vd57qLPZ7Xamp6fnNgBXtQxcjFuHw+Hyer3t9SYgCAITCAScAJoBNNEY/08GOFVVrfVMv7kMNDntFD1vjIAPrlRN0xjckOm6biFQ3jwNPwDMZrOnqVTqfb3Bi8Wivru7W/VCYkwPlKOjo0IikXh7EwQikYgE4Nw0CfXKDCipVCoTj8df3QABbW1tLUc6oUgkFPMkVACUNjc337148eKvw8PDbJ2jP1taWkoCyNDVXDSECmNSK4qiKNLq6urW8+fPI/UicHx8rD59+jSVy+WOAKSJhKENwFItLtoxk8mwsixzHR0dHe3t7c5PAU+n09rs7OzJkydPYqVSaQfANoDXALIk31S2smU1TWMPDg7K5XKZ7+3t9TudTut1U7+wsFCcmJiIpdPpbQBxADsAknQWymYCOukBHYCuKApisdhpMpnURFEU79y503TVyKenpzOTk5M7e3t7MQKPV0Zv1gNm+awB0MvlshqLxfLb29uyJElWURSbXC4XXyvqxcXFs6mpqeTc3Nzu3t7e3wQcA7BPZ8Cov1pNlJplmQtAG8MwHV6v95tAINA5MDBwPxAIuLu6upr8fr/VAN3c3JQjkcjZ+vp6fnl5+d2bN29SuVzuNYAEpf01CdRChUL+X1VskHACuA3Ay3Fcu9vt7nA6nZ7m5uYWQRCaNE3jVVW15PP580KhIGUymWw2m00DOAJwSP4WwPtq4LX2Ao6USxNlQyS/RcQcdLGwlNIz6vEMAaZpNzCk2Pll94LK/cDYimxERiBwG10sxjgvEZBE0UpE6vxj+0Ct5bTaXthgEhRmja8QWNkkPGsuIpfdjpkK+cZUWTC0KredVmtD/gdlSl6EG4AMvQAAAABJRU5ErkJggg==')
      },
      prepareGPU({ gl, itemsPositions }) {
          const src = [`attribute vec2 itemPos;
              uniform vec2 zoom;
              uniform vec2 center;
              uniform vec2 circlePos;
              uniform float circleSize;
          
              void main() {
                gl_Position = vec4((itemPos+circlePos - center) / zoom * vec2(2.0,2.0), 0.0, 1.0);
                gl_PointSize = circleSize;
              }`,
              `precision highp float;
              uniform sampler2D pointTexture;
              uniform vec4 globalColor;
  
              void main() {
                  gl_FragColor = globalColor * texture2D( pointTexture, gl_PointCoord );
              }`
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
      calcElemProps({glCanvas, zoom, DIM}) {
        const gridSizeInPixels = glCanvas.width/ zoom
        const state = this.state()
        Object.assign(state, {
            circleSize: viewCtx.params.circleSize({},{zoom, DIM}), 
            circlePos: [state.top/gridSizeInPixels, state.left/gridSizeInPixels]
        })
      },        
      renderGPUFrame({ gl, aspectRatio, zoom, center}, { vertexBuffer, shaderProgram, vertexNumComponents, vertexCount }) {
          gl.useProgram(shaderProgram)
          const {circleSize, circlePos} = jb.zui.viewState(viewCtx)
        
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom/aspectRatio])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)

          gl.uniform1f(gl.getUniformLocation(shaderProgram, 'circleSize'), circleSize)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'circlePos'), circlePos)

          gl.uniform4fv(gl.getUniformLocation(shaderProgram, 'globalColor'), [0.1, 0.7, 0.2, 1.0])
        
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPos')
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)
  
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, this.pointTexture)
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'pointTexture'), 0)
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
  })
  
  jb.extension('zui','text', {
    textZuiElem: viewCtx => ({
      state: () => jb.zui.viewState(viewCtx),
      charSetSize: 64,
      txt_fields: ['2','4','8','16_0','16_1','32_0','32_1','32_2','32_3'],
      async prepare({gl}) {
        this.charSetTexture = await jb.zui.imageToTexture(gl,this.createCharSetImage())
      },
      createCharSetImage() {
          const fontSize = 16
          const txt = ' abcdefghijklmnopqrstuvwxyz0123456789!@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          const canvas = document.createElement('canvas')
          canvas.width = this.charSetSize * fontSize
          canvas.height = fontSize
          document.body.appendChild(canvas)
          const ctx = canvas.getContext('2d')
          ctx.font = `${fontSize}px monospace`
          ctx.textBaseline = 'top'
          ctx.textAlign = 'left'
          ctx.fillStyle = 'black'
          Array.from(new Array(txt.length).keys()).forEach(i=> ctx.fillText(txt[i],i*10,0))
          const dataUrl = canvas.toDataURL('image/png')
          document.body.removeChild(canvas)
          return dataUrl
      },

      vertexShaderCode() { 
      const txt_fields = this.txt_fields
      return `
        attribute vec2 vertexPos;
        attribute vec2 inRectanglePos;
        ${txt_fields.map(fld => `attribute vec4 _text_${fld};`).join('\n')}
                        
        uniform vec2 zoom;
        uniform vec2 center;
        uniform vec2 canvasSize;
        uniform float textSquareInPixels;
        varying vec2 npos;
        
        ${txt_fields.map(fld => `varying vec4 text_${fld};`).join('\n')}
        
        void main() {
          ${txt_fields.map(fld => `text_${fld} = _text_${fld};`).join('\n')}
          vec2 _npos = vec2(2.0,2.0) * (vertexPos - center) / zoom;
          gl_Position = vec4(_npos , 0.0, 1.0);
          npos = _npos;
          gl_PointSize = textSquareInPixels;
        }`
      },

      fragementShaderCode() { 
      const txt_fields = this.txt_fields
      return `precision highp float;
        uniform sampler2D charSetTexture;
        uniform vec2 zoom;
        uniform int strLen;
        uniform vec2 canvasSize;
        uniform vec2 boxSize;
        uniform float charWidthInTexture;
        varying vec2 npos;
        ${txt_fields.map(fld => `varying vec4 text_${fld};\n`).join('\n')}
  
        vec4 getTextVec(float x) {
          if (strLen <= 2) return text_2;
          if (strLen <= 4) return text_4;
          if (strLen <= 8) return text_8;
          if (strLen <= 16) {
            if (x < 0.5) return text_16_0;
            return text_16_1;
          }
          if (strLen <= 32) {
            if (x < 0.25) return text_32_0;
            if (x < 0.5) return text_32_1;
            if (x < 0.75) return text_32_2;
            return text_32_3;
          }
        }
        
        float getIndexInVec(float x) {
          if (strLen <= 2) return 0.0;
          if (strLen <= 4) return floor(x * 2.0);
          if (strLen <= 8) return floor(x * 4.0);
          if (strLen <= 16) return floor(mod(x,0.5) * 8.0);
          if (strLen <= 32) return floor(mod(x,0.25) * 16.0);
        }
  
        float calcCharCode(float x) {
          int index = 0;
          int idx = int(getIndexInVec(x));
          vec4 vec = getTextVec(x);
          float flt = 0.0;
          for(int i=0;i<4;i++)
            if (idx == i) flt = vec[i];
  
          if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
            return floor(flt/256.0);
          return mod(flt,256.0);
        }
  
        void main() {
          vec2 coord = vec2(2.0,2.0) * gl_FragCoord.xy / canvasSize - vec2(1.0,1.0);
          vec2 boxBaseDist = coord - (npos - boxSize*vec2(0.5,0.5));
          vec2 inBoxPos = boxBaseDist / boxSize;
          if (inBoxPos[0] < 0.0 || inBoxPos[0] > 1.0 || inBoxPos[1] < 0.0 || inBoxPos[1] > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0);
            return;                    
          }
          float inCharPos = mod(inBoxPos[0] * float(strLen), 1.0);
          vec2 texturePos = vec2((calcCharCode(inBoxPos[0]) + inCharPos) * charWidthInTexture, inBoxPos[1]);
          gl_FragColor = texture2D( charSetTexture, texturePos * vec2(1.0, -1.0));
        }`
      },
      prepareGPU(props) {
          const { gl, itemsPositions } = props
          const textBoxNodes = itemsPositions.sparse.map(([item, x,y]) => 
              [x,y, ...jb.zui.texts2to32AsFloats(viewCtx.params.prop.textSummaries2to32(item))])
          const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
          const floatsInVertex = 2 + 31
          const vertexCount = vertexArray.length / floatsInVertex
  
          const buffers = {
            vertexCount, floatsInVertex,
            vertexBuffer: gl.createBuffer(),
            shaderProgram: jb.zui.buildShaderProgram(gl, [this.vertexShaderCode(props), this.fragementShaderCode(props)])
          }    
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
  
          return buffers
      },
      calcElemProps({zoom, glCanvas}) {
        const gridSizeInPixels = glCanvas.width/ zoom
        const strLen = 2**Math.floor(Math.log(gridSizeInPixels/10)/Math.log(2))
        //const textWidth =  2 -> 1, 4->1, 8-> , 16 32 -> 2.4
        const textSquareInPixels = 3 * glCanvas.width / zoom
        const boxSizeWidthFactor = strLen == 2 ? 0.8 : strLen == 4 ? 1 : strLen == 8 ? 2 : strLen == 16 ? 1.5 : 0.5 
        const boxSizeHeightFactor = strLen == 2 ? 4 : strLen == 4 ? 2 : strLen == 8 ? 1 : strLen == 16 ? 0.5 : 0.25 
        const boxSize = [boxSizeWidthFactor / zoom, boxSizeHeightFactor * 0.4 / zoom]
        const charWidthInTexture=  1/ (this.charSetSize * 1.6)
        Object.assign(jb.zui.viewState(viewCtx), {strLen, boxSize, textSquareInPixels, charWidthInTexture})
      },
      renderGPUFrame({ glCanvas, gl, aspectRatio, zoom, center} , { vertexCount, floatsInVertex, vertexBuffer, shaderProgram }) {
          gl.useProgram(shaderProgram)

          const {strLen, boxSize, textSquareInPixels, charWidthInTexture} = jb.zui.viewState(viewCtx)
  
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom/aspectRatio]) // DIM units
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center) // DIM units
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'boxSize'), boxSize) // [-1..1] units
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), strLen)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform1f(gl.getUniformLocation(shaderProgram, 'textSquareInPixels'), textSquareInPixels) // in pixels
          gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), charWidthInTexture) // 0-1
          
          const vertexPos = gl.getAttribLocation(shaderProgram, 'vertexPos')
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(vertexPos)
          gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)
  
          const sizes = [1,2,4, 4,4, 4,4,4,4]
          let offset = 2
          this.txt_fields.forEach((id,i) => {
            const text1 = gl.getAttribLocation(shaderProgram, `_text_${id}`)
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
            gl.enableVertexAttribArray(text1)
            gl.vertexAttribPointer(text1, sizes[i], gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
            offset += sizes[i]  
          })
  
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, this.charSetTexture)
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'charSetTexture'), 0)
  
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    }),
  
    textSummaries2to32(text) { // text2,text4,text8,text16,text32
      const words = text.split(' ').filter(x=>x)
      const text2 = words.length < 2 ? text.slice(0,2) : words.slice(0,2).map(x=>x[0].toUpperCase()).join('')
      const text4 = words.length < 2 ? text.slice(0,4) : [words[0].slice(0,1), words[1].slice(0,2)].join(' ')
      const text8 = words.length < 2 ? text.slice(0,8) : [words[0].slice(0,3), words[1].slice(0,4)].join(' ')
      return [text2,text4,text8,text.slice(0,16), text.slice(0,32)]
    },
    texts2to32AsFloats([text2,text4,text8,text16,text32]) { // 31 floats = 1 + 2 + 4 + (4+4) + (4+4+4+4)
      return [...encode(text2,2),...encode(text4,4) ,...encode(text8,8), ...encode(text16,16) , ...encode(text32,32) ]
  
      function encode(text,size) {
        const pad = '                  '.slice(0,Math.ceil((size-text.length)/2))
        const txtChars = charset((pad + text + pad).slice(0,size))
        const floats = Array.from(new Array(Math.ceil(size/2)).keys())
            .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1]))
        return floats
      }
      function charset(text) {
        return Array.from(text).map(x=>
          x.match(/[a-z]/) ? x[0].charCodeAt(0)-97+1 : 
          x.match(/[A-Z]/) ? x[0].charCodeAt(0)-65+42 : 
          x.match(/[0-9]/) ? x[0].charCodeAt(0)-48+27 : 0)
      }
      function twoCharsToFloat(char1, char2) {
        return char1 * 256 + char2
      }
    }  
  })