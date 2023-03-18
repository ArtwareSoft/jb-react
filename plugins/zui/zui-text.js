jb.dsl('zui')

jb.component('growingText', {
  description: 'text growing from 2 to 32 according to zoom',
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,prop, features) => {
    const zuiElem = jb.zui.text2_32ZuiElem(ctx)
    const view = {
        layoutSizes: ({size,zoom}) => [2*10,16, size[0]-2*10,16, 0,0 ],
        state: () => jb.zui.viewState(ctx),
        path: ctx.path,
        pivots: () => prop.pivots(),
        zuiElems: () => [zuiElem],
        priority: prop.priority || 10,
    }
    features().forEach(f=>f.enrich(view))
    //view.enterHeight = view.enterHeight || Math.floor(view.preferedHeight()/2)
    return view
  }
})

jb.component('fixedText', {
  description: 'fixed length text',
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
    {id: 'length', as: 'number', description: '<= 8', defaultValue: 6},
  ],
  impl: (ctx,prop, features,length) => {
    const zuiElem = jb.zui.text8ZuiElem(ctx)
    const view = {
      layoutSizes: () => [length*10,16, 0,0, 0,0 ],
      path: ctx.path,
      state: () => jb.zui.viewState(ctx),
      pivots: () => prop.pivots(),
      zuiElems: () => [zuiElem],
      priority: prop.priority || 10,
    }
    features().forEach(f=>f.enrich(view))
    //view.enterHeight = view.enterHeight || Math.floor(view.preferedHeight()/2)
    return view
  }
})

jb.extension('zui','ascii', {
    initExtension() {
        return { 
            asciiCharSet: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            asciiCharSetSize: 128,        
        }
    },
    asciiCharSetImage() {
        const fontSize = 16
        const canvas = document.createElement('canvas')
        canvas.width = jb.zui.asciiCharSetSize * fontSize
        canvas.height = fontSize
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        ctx.font = `550 ${fontSize}px monospace`
        ctx.fontWeight = 'bold'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillStyle = 'black'
        const charSet = jb.zui.asciiCharSet
        Array.from(new Array(charSet.length).keys()).forEach(i=> ctx.fillText(charSet[i],i*10,0))
        const dataUrl = canvas.toDataURL('image/png')
        document.body.removeChild(canvas)
        return dataUrl
    },
    charsetEncodeAscii(text) {
        return Array.from(text).map(x=> {
            const code = jb.zui.asciiCharSet.indexOf(x)
            return code == -1 ? 0 : code
        })
    }

})

jb.extension('zui','text_2_32', {
  text2_32ZuiElem: viewCtx => ({
      state: () => jb.zui.viewState(viewCtx),
      txt_fields: ['2','4','8','16_0','16_1','32_0','32_1','32_2','32_3'],
      async prepare({gl}) {
        this.charSetTexture = await jb.zui.imageToTexture(gl, jb.zui.asciiCharSetImage())
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
              [x,y, ...jb.zui.texts2to32AsFloats(
                jb.zui.textSummaries2to32(viewCtx.params.prop.asText(item)))])
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
        const charWidthInTexture=  1/ (jb.zui.asciiCharSetSize * 1.6)
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
        const txtChars = jb.zui.charsetEncodeAscii((pad + text + pad).slice(0,size))
        const floats = Array.from(new Array(Math.ceil(size/2)).keys())
            .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1]))
        return floats
      }
      function twoCharsToFloat(char1, char2) {
        return char1 * 256 + char2
      }
    }  
})

jb.extension('zui','text8', {
  text8ZuiElem: viewCtx => ({
      state: () => jb.zui.viewState(viewCtx),
      async prepare({gl}) {
        this.charSetTexture = await jb.zui.imageToTexture(gl,jb.zui.asciiCharSetImage())
      },

      vertexShaderCode() { return `
        attribute vec2 vertexPos;
        attribute vec2 inRectanglePos;
        attribute vec4 _text;
                        
        uniform vec2 zoom;
        uniform vec2 center;
        uniform vec2 canvasSize;
        uniform float textSquareInPixels;
        varying vec2 npos;
        varying vec4 text;
        
        void main() {
          text = _text;
          vec2 _npos = vec2(2.0,2.0) * (vertexPos - center) / zoom;
          gl_Position = vec4(_npos , 0.0, 1.0);
          npos = _npos;
          gl_PointSize = textSquareInPixels;
        }`
      },

      fragementShaderCode() { 
      return `precision highp float;
        uniform sampler2D charSetTexture;
        uniform vec2 zoom;
        uniform int strLen;
        uniform vec2 canvasSize;
        uniform vec2 boxSize;
        uniform float charWidthInTexture;
        varying vec2 npos;
        varying vec4 text;
    
        float calcCharCode(float x) {
          int index = 0;
          int idx = int(floor(x * 4.0));
          vec4 vec = text;
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
              [x,y, ...jb.zui.textAsFloats(viewCtx.params.prop.asText(item), viewCtx.params.length)])
          const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
          const floatsInVertex = 2 + 4
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
        const strLen = 8
        const textSquareInPixels = 3 * glCanvas.width / zoom
        const boxSizeWidthFactor = 2
        const boxSizeHeightFactor = 1
        const boxSize = [boxSizeWidthFactor / zoom, boxSizeHeightFactor * 0.4 / zoom]
        const charWidthInTexture=  1/ (jb.zui.asciiCharSetSize * 1.6)
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

          const text = gl.getAttribLocation(shaderProgram, '_text')
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(text)
          gl.vertexAttribPointer(text, 4, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)
 
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, this.charSetTexture)
          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'charSetTexture'), 0)
  
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    }),
  
    textAsFloats(_text, length) {
      const text = _text.slice(0,length)
      const pad = '                  '.slice(0,Math.ceil((length-text.length)/2))
      const txtChars = jb.zui.charsetEncodeAscii((pad + text + pad).slice(0,length))
      const floats = Array.from(new Array(4).keys())
          .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1]))
      return floats

      function twoCharsToFloat(char1, char2) {
        return char1 * 256 + char2
      }
    }  
})