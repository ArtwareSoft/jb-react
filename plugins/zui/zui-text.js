jb.dsl('zui')

jb.component('growingText', {
  description: 'text growing from 2 to 32 according to zoom',
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
    {id: 'backgroundColorByProp', as: 'boolean' }
  ],
  impl: (ctx,prop, features) => {
    const zuiElem = jb.zui.text2_32ZuiElem(ctx)
    const view = zuiElem.view = {
        title: `growingText - ${prop.att}`,
        layoutSizes: ({size}) => [2*10,16, (jb.zui.floorLog2(size[0]/10)-2)*10,0, 0,0 ],
        fitPrefered: axis => axis == 0 ? alloc => (jb.zui.floorLog2(alloc/10)-2)*10 : false,
        renderProps: () => jb.zui.renderProps(ctx),
        ctxPath: ctx.path,
        pivots: (s) => prop.pivots(s),
        zuiElems: () => [zuiElem],
        priority: prop.priority || 10,
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.component('fixedText', {
  description: 'fixed length text',
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
    {id: 'length', as: 'number', description: '<= 8', defaultValue: 8},
    {id: 'backgroundColorByProp', as: 'boolean' },
  ],
  impl: (ctx,prop, features,length) => {
    const zuiElem = jb.zui.text8ZuiElem(ctx)
    const view = zuiElem.view = {
      title: `fixedText - ${prop.att}`,
      layoutSizes: () => [length*10,16, 0,0, 0,0 ],
      ctxPath: ctx.path,
      renderProps: () => jb.zui.renderProps(ctx),
      pivots: (s) => prop.pivots(s),
      zuiElems: () => [zuiElem],
      priority: prop.priority || 10,
    }
    if (prop.colorScale)
      view.backgroundColorByProp = {prop,colorScale: prop.colorScale}

    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.extension('zui','ascii', {
    initExtension() {
        const fontSize = 16, asciiCharSetSize = 128
        return { 
            asciiCharSet: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~    ',
            asciiCharSetSize,
            fontSize,
            charSetTextureSize: [asciiCharSetSize * 10,fontSize]
        }
    },
    asciiCharSetImage() {
        if (jb.zui.asciiCharSetDataUrl)
          return jb.zui.asciiCharSetDataUrl
        const canvas = document.createElement('canvas')
        canvas.width = jb.zui.charSetTextureSize[0]
        canvas.height = jb.zui.charSetTextureSize[1]
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        ctx.font = `500 ${jb.zui.fontSize}px monospace`
        ctx.fontWeight = 'bold'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillStyle = 'black'
        const charSet = jb.zui.asciiCharSet
        Array.from(new Array(charSet.length).keys()).forEach(i=> ctx.fillText(charSet[i],i*10,0))
        const dataUrl = canvas.toDataURL('image/png')
        document.body.removeChild(canvas)
        return jb.zui.asciiCharSetDataUrl = dataUrl
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
      renderProps: () => jb.zui.renderProps(viewCtx),
      txt_fields: ['2','4','8','16_0','16_1','32_0','32_1','32_2','32_3'],
      async prepare({gl}) {
        this.charSetTexture = await jb.zui.imageToTexture(gl, jb.zui.asciiCharSetImage())
      },
      vertexShaderCode() {
        const txt_fields = this.txt_fields
        return jb.zui.vertexShaderCode({
          id: 'text_2_32',
          code: txt_fields.map(fld => `attribute vec4 _text_${fld};varying vec4 text_${fld};`).join('\n'), 
          main: txt_fields.map(fld => `text_${fld} = _text_${fld};`).join('\n')
        })
      },
      fragementShaderCode() { 
      const txt_fields = this.txt_fields
        return jb.zui.fragementShaderCode({code: 
          `uniform sampler2D charSetTexture;
          uniform float charWidthInTexture;
          uniform vec2 charSetTextureSize;
          uniform int strLen;
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
          }`, 
          main:`
            float fStrLen = float(strLen);
            float inCharPos = mod(rInElem[0] * fStrLen, 1.0);
            float charCode = calcCharCode(rInElem[0]);    
            float inCharPosPx = mod(inElem[0], charWidthInTexture);
            vec2 texturePos = vec2(charCode * charWidthInTexture + inCharPosPx, size[1] - inElem[1]) / charSetTextureSize;

            gl_FragColor = texture2D( charSetTexture, texturePos);
            //gl_FragColor = vec4(getIndexInVec(rInElem[0])/4.0,0.0, 0.0, 1.0);
          `}
        )
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
      calcElemProps() {
        const renderProps = jb.zui.renderProps(viewCtx)
        Object.assign(renderProps, {strLen: jb.zui.floorLog2(renderProps.size[0]/10)})
      },
      renderGPUFrame({ glCanvas, gl, zoom, center} , { vertexCount, floatsInVertex, vertexBuffer, shaderProgram }) {
          gl.useProgram(shaderProgram)

          const {size, pos, strLen} = this.renderProps()
//          console.log('strlen',strLen, zoom, size[0])
 
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), strLen)
          gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), 10)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'charSetTextureSize'), jb.zui.charSetTextureSize)
          
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPostext_2_32')
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)
  
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
      renderProps: () => jb.zui.renderProps(viewCtx),
      async prepare({gl}) {
        this.charSetTexture = await jb.zui.imageToTexture(gl,jb.zui.asciiCharSetImage())
      },
      vertexShaderCode: () => jb.zui.vertexShaderCode({id: 'text8',
        code: `attribute vec4 _text; varying vec4 text;
        attribute vec3 _backgroundColor; varying vec3 backgroundColor;`, 
        main:'text = _text; backgroundColor = _backgroundColor;'
      }),
      fragementShaderCode: () => jb.zui.fragementShaderCode({code: 
        `varying vec4 text; varying vec3 backgroundColor;
        uniform sampler2D charSetTexture;
        uniform float charWidthInTexture;
        uniform vec2 charSetTextureSize;
        uniform int strLen;
        
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
        `, 
        main:`
          float fStrLen = float(strLen);
          float inCharPos = mod(rInElem[0] * fStrLen, 1.0);
          float charCode = calcCharCode(rInElem[0]);    
          float inCharPosPx = mod(inElem[0], charWidthInTexture);
          vec2 texturePos = vec2(charCode * charWidthInTexture + inCharPosPx, size[1] - inElem[1]) / charSetTextureSize;

          vec4 texel = texture2D(charSetTexture, texturePos);
          if (texel.a < 0.2) {
            gl_FragColor = vec4(backgroundColor, 1.0);
          } else {
            float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));
            float whiteLuminance = dot(vec3(1.0), vec3(0.299, 0.587, 0.114));
            float blackLuminance = dot(vec3(0.0), vec3(0.299, 0.587, 0.114));
            float whiteContrast = abs(bgLuminance - whiteLuminance);
            float blackContrast = abs(bgLuminance - blackLuminance);
            vec3 fontColor = (whiteContrast > blackContrast) ? vec3(1.0) : vec3(0.0);
            gl_FragColor = vec4(fontColor, 1.0);
          }
          // float luminance = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
          // vec3 inverted_color = mix(vec3(1.0), vec3(0.0), step(luminance, 0.5) * step(dot(backgroundColor, vec3(1.0)) , 1.5));
          // gl_FragColor = vec4(inverted_color, 1.0);

          //gl_FragColor = vec4(vec3(0.0,1.0,0.0) * texture2D( charSetTexture, texturePos)[3] ,1.0);
        `}
      ),
      prepareGPU(props) {
          const { gl, itemsPositions, DIM } = props

          const backgroundColor = this.view.backgroundColorByProp || { colorScale: x => [0,x,0], prop: {pivots: () => [ {scale: () => 1 }]}}
          const itemToColor01 = backgroundColor.prop.pivots({DIM})[0].scale

          const textBoxNodes = itemsPositions.sparse.map(([item, x,y]) => 
              [x,y, 
                ...jb.zui.textAsFloats(viewCtx.params.prop.asText(item), viewCtx.params.length),
                ...backgroundColor.colorScale(itemToColor01(item))
              ])
          const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
          const floatsInVertex = 2 + 4 + 3
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
      renderGPUFrame({ glCanvas, gl, zoom, center} , { vertexCount, floatsInVertex, vertexBuffer, shaderProgram }) {
          gl.useProgram(shaderProgram)

          const {size, pos} = this.renderProps()
 
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), 8)
          gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), 10)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'charSetTextureSize'), jb.zui.charSetTextureSize)
          
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPostext8')
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

          const text = gl.getAttribLocation(shaderProgram, '_text')
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(text)
          gl.vertexAttribPointer(text, 4, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)

          const background = gl.getAttribLocation(shaderProgram, '_backgroundColor')
          gl.enableVertexAttribArray(background)
          gl.vertexAttribPointer(background, 3, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 6* Float32Array.BYTES_PER_ELEMENT)
          
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
