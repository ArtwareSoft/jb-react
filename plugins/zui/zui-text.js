dsl('zui')

component('fixedText', {
  description: 'fixed length text',
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true},
    {id: 'length', as: 'number', description: '<= 8', defaultValue: 8},
    {id: 'fontSize', as: 'number', defaultValue: 16},
    {id: 'fontWidth', as: 'number', defaultValue: 10},
    {id: 'charSet', as: 'string', defaultValue: ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~    `}
  ],
  impl: view('fixedText-%$prop/att%', '%$prop%', {
    layout: keepBaseRatio({ base: ({},{},{length,fontWidth}) => [fontWidth*length/2,16/2] }),
    viewProps: prop('charSetImage', ({},{},params) => jb.zui.charSetImage(params), { async: true }),
    atts: [
      color('backgroundColor', white()),
      text8('text', '%$length%', { charSet: '%$charSet%' })
    ],
    renderGPU: gpuCode({
      shaderCode: colorOfPoint(`float fStrLen = float(strLen);
    float charCode = calcCharCode(rInElem[0]);    
    float inCharPosPx = mod(inElem[0], charWidthInElem);
    float sizeRatio = charWidthInElem / charWidthInTexture;
    vec2 texturePos = vec2(charCode * charWidthInTexture + inCharPosPx/sizeRatio, (size[1] - inElem[1])/sizeRatio) / charSetTextureSize;

    if (backgroundColor[0] == -1.0) {
      gl_FragColor = texture2D( charSetTexture, texturePos);
      return;
    }

    vec4 texel = texture2D(charSetTexture, texturePos);
    if (texel.a < 0.2) {
      gl_FragColor = vec4(backgroundColor, 1.0);
    } else {
      gl_FragColor = vec4(getContrastingFontColor(), 1.0);
    }`),
      utils: text8Utils(),
      uniforms: [
        texture('charSetTexture', '%$view.props.charSetImage%'),
        Float('charWidthInTexture', '%$fontWidth%'),
        vec2('charSetTextureSize', ({},{},{charSet,fontWidth,fontSize}) => [charSet.length * fontWidth,fontSize]),
        Int('strLen', '%$length%')
      ],
      zoomDependentUniforms: [
        Float('charWidthInElem', (ctx,{elemLayout},{length}) => elemLayout.size[0]/length)
      ]
    })
  })
})

component('text8Utils', {
  type: 'gpu_utils',
  impl: utils(`float getIndexInVec(float x) {
    if (strLen <= 2) return 0.0;
    if (strLen <= 4) return floor(x * 2.0);
    if (strLen <= 8) return floor(x * 4.0);
  }

  float calcCharCode(float x) {
    int index = 0;
    int idx = int(getIndexInVec(x));
    vec4 vec = text;
    float flt = 0.0;
    for(int i=0;i<4;i++)
      if (idx == i) flt = vec[i];

    if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
      return floor(flt/256.0);
    return mod(flt,256.0);
  }
  vec3 getContrastingFontColor() {
    float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));
    float whiteLuminance = dot(vec3(1.0), vec3(0.299, 0.587, 0.114));
    float blackLuminance = dot(vec3(0.0), vec3(0.299, 0.587, 0.114));
    float whiteContrast = abs(bgLuminance - whiteLuminance);
    float blackContrast = abs(bgLuminance - blackLuminance);
    vec3 fontColor = (whiteContrast > blackContrast) ? vec3(1.0) : vec3(0.0);
    return fontColor;
  } 
  `)
})

component('text8', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'length', as: 'number', description: '<= 8', defaultValue: 8},
    {id: 'charSet', as: 'string'}
  ],
  impl: (ctx,id, length,charSet) => ({ 
      id,
      size: 4,
      glType: 'vec4',
      calc: v => ctx.vars.items.map(item=>jb.zui.textAsFloats(charSet, v.itemProp.asText(item), length))
    })
})


component('growingText', {
  description: 'fixed length text',
  type: 'view',
})

extension('zui','canvas', {
  createCanvas(...size) {
    return jbHost.isNode ? require('canvas').createCanvas(...size) : new OffscreenCanvas(...size)
  },
  async canvasToDataUrl(canvas) {
    if (jbHost.isNode) {
      const buffer = canvas.toBuffer('image/png')
      const base64 = buffer.toString('base64')
      return `data:image/png;base64,${base64}`
    } else {
        const blob = await canvas.convertToBlob()
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
        return dataUrl
    }
  }
})

extension('zui','text', {
    async charSetImage({charSet, fontSize, fontWidth}) {
        const canvas = jb.zui.createCanvas(charSet.length * fontWidth,fontSize)
        const ctx2d = canvas.getContext('2d')
        ctx2d.font = `500 ${fontSize}px monospace`
        ctx2d.fontWeight = 'bold'
        ctx2d.textBaseline = 'top'
        ctx2d.textAlign = 'left'
        ctx2d.fillStyle = 'black'
        Array.from(new Array(charSet.length).keys()).forEach(i=> ctx2d.fillText(charSet[i],i*10,0))
        return jb.zui.canvasToDataUrl(canvas)
    },
    // charsetEncodeAscii(text) {
    //     return Array.from(text).map(x=> {
    //         const code = jb.zui.charSet.indexOf(x)
    //         return code == -1 ? 0 : code
    //     })
    // },
    // async charSetTexture(gl) {
    //   if (!jb.zui._charSetTexture)
    //     jb.zui._charSetTexture = jb.zui.imageToTexture(gl, jb.zui.charSetImage())
    //   return jb.zui._charSetTexture
    // },
    textAsFloats(charSet, _text, length) {
      const text = (_text || 'null').slice(0,length)
      const pad = '                  '.slice(0,Math.ceil((length-text.length)/2))
      const txtChars = encode((pad + text + pad).slice(0,length))
      const floats = Array.from(new Array(4).keys())
          .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1])).map(x=> isNaN(x) ? 0 :x) 
      return floats

      function twoCharsToFloat(char1, char2) {
        return char1 * 256 + char2
      }
      function encode(params) {
        return Array.from(text).map(x=> {
          const code = charSet.indexOf(x)
          return code == -1 ? 0 : code
        })
      }
    }      
})

// component('growingText', {
//   description: 'text growing from 2 to 32 according to zoom',
//   type: 'view',
//   params: [
//     {id: 'prop', type: 'itemProp', mandatory: true},
//     {id: 'viewFeatures', type: 'view_feature[]', dynamic: true},
//     {id: 'backgroundColorByProp', as: 'boolean', type: 'boolean'}
//   ],
//   impl: (ctx,prop, features) => {
//     const zuiElem = jb.zui.text2_32ZuiElem(ctx)
//     const view = zuiElem.view = {
//         title: `growingText - ${prop.att}`,
//         layoutRounds: 4,
//         sizeNeeds: ({round }) => [2**(round+2) *10,16],
//         ctxPath: ctx.path,
//         pivots: (s) => prop.pivots(s),
//         zuiElem: zuiElem,
//         priority: prop.priority || 10,
//     }
//     features().forEach(f=>f.enrich(view))
//     return view
//   }
// })

// extension('zui','text_2_32', {
//   text2_32ZuiElem: viewCtx => ({
//       txt_fields: ['2','4','8','16_0','16_1','32_0','32_1','32_2','32_3'],
//       async asyncPrepare({gl}) {
//         this.charSetTexture = await jb.zui.charSetTexture(gl)
//       },
//       vertexShaderCode() {
//         const txt_fields = this.txt_fields
//         return jb.zui.vertexShaderCode({
//           id: 'text_2_32',
//           code: txt_fields.map(fld => `attribute vec4 _text_${fld};varying vec4 text_${fld};`).join('\n'), 
//           main: txt_fields.map(fld => `text_${fld} = _text_${fld};`).join('\n')
//         })
//       },
//       fragementShaderCode() { 
//       const txt_fields = this.txt_fields
//         return jb.zui.fragementShaderCode({code: 
//           `uniform sampler2D charSetTexture;
//           uniform float charWidthInTexture;
//           uniform vec2 charSetTextureSize;
//           uniform int strLen;
//           ${txt_fields.map(fld => `varying vec4 text_${fld};\n`).join('\n')}
          
//           vec4 getTextVec(float x) {
//             if (strLen <= 2) return text_2;
//             if (strLen <= 4) return text_4;
//             if (strLen <= 8) return text_8;
//             if (strLen <= 16) {
//               if (x < 0.5) return text_16_0;
//               return text_16_1;
//             }
//             if (strLen <= 32) {
//               if (x < 0.25) return text_32_0;
//               if (x < 0.5) return text_32_1;
//               if (x < 0.75) return text_32_2;
//               return text_32_3;
//             }
//           }
          
//           float getIndexInVec(float x) {
//             if (strLen <= 2) return 0.0;
//             if (strLen <= 4) return floor(x * 2.0);
//             if (strLen <= 8) return floor(x * 4.0);
//             if (strLen <= 16) return floor(mod(x,0.5) * 8.0);
//             if (strLen <= 32) return floor(mod(x,0.25) * 16.0);
//           }
    
//           float calcCharCode(float x) {
//             int index = 0;
//             int idx = int(getIndexInVec(x));
//             vec4 vec = getTextVec(x);
//             float flt = 0.0;
//             for(int i=0;i<4;i++)
//               if (idx == i) flt = vec[i];
    
//             if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
//               return floor(flt/256.0);
//             return mod(flt,256.0);
//           }`, 
//           main:`
//             float fStrLen = float(strLen);
//             float inCharPos = mod(rInElem[0] * fStrLen, 1.0);
//             float charCode = calcCharCode(rInElem[0]);    
//             float inCharPosPx = mod(inElem[0], charWidthInTexture);
//             vec2 texturePos = vec2(charCode * charWidthInTexture + inCharPosPx, size[1] - inElem[1]) / charSetTextureSize;

//             gl_FragColor = texture2D( charSetTexture, texturePos);
//             //gl_FragColor = vec4(getIndexInVec(rInElem[0])/4.0,0.0, 0.0, 1.0);
//           `}
//         )
//       },
//       calcBuffers(view, {itemsPositions }) {
//           const textBoxNodes = itemsPositions.sparse.map(([item, x,y]) => 
//               [x,y, ...jb.zui.texts2to32AsFloats(
//                 jb.zui.textSummaries2to32(viewCtx.params.prop.asText(item)))])
//           const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
//           const floatsInVertex = 2 + 31
//           const vertexCount = vertexArray.length / floatsInVertex
  
//           return {
//             vertexArray, vertexCount, floatsInVertex,
//             src: [this.vertexShaderCode(), this.fragementShaderCode()]
//           }    
//       },

//       // frontEnd
//       calcExtraProps({vars}) {
//         const { cmp } = vars
//         const elemLayoutProps = cmp.state.elemsLayout[this.view.ctxPath]
//         Object.assign(elemLayoutProps, {strLen: jb.zui.floorLog2(elemLayoutProps.size[0]/10)})
//       },
//       renderGPUFrame({cmp, shaderProgram, glCanvas, gl, zoom, center, elemLayout, vertexCount, floatsInVertex, vertexBuffer, size, pos}) {
//         const {strLen } = elemLayout

// //          console.log('strlen',strLen, zoom, size[0])
 
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'itemViewSize'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

//           gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), strLen)
//           gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), 10)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'charSetTextureSize'), jb.zui.charSetTextureSize)
          
//           const itemPos = gl.getAttribLocation(shaderProgram, 'itemPostext_2_32')
//           gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//           gl.enableVertexAttribArray(itemPos)
//           gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)
  
//           const sizes = [1,2,4, 4,4, 4,4,4,4]
//           let offset = 2
//           this.txt_fields.forEach((id,i) => {
//             const text1 = gl.getAttribLocation(shaderProgram, `_text_${id}`)
//             gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//             gl.enableVertexAttribArray(text1)
//             gl.vertexAttribPointer(text1, sizes[i], gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
//             offset += sizes[i]  
//           })
  
//           const {i} = jb.zui.allocateSingleTextureUnit({view: 'charSetTexture',cmp})
//           gl.activeTexture(gl['TEXTURE'+i])
//           gl.bindTexture(gl.TEXTURE_2D, this.charSetTexture)
//           gl.uniform1i(gl.getUniformLocation(shaderProgram, 'charSetTexture'), i)
  
//           gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//           gl.drawArrays(gl.POINTS, 0, vertexCount)
//       }
//     }),
  
//     textSummaries2to32(text) { // text2,text4,text8,text16,text32
//       const words = text.split(' ').filter(x=>x)
//       const text2 = words.length < 2 ? text.slice(0,2) : words.slice(0,2).map(x=>x[0].toUpperCase()).join('')
//       const text4 = words.length < 2 ? text.slice(0,4) : [words[0].slice(0,1), words[1].slice(0,2)].join(' ')
//       const text8 = words.length < 2 ? text.slice(0,8) : [words[0].slice(0,3), words[1].slice(0,4)].join(' ')
//       return [text2,text4,text8,text.slice(0,16), text.slice(0,32)]
//     },
//     texts2to32AsFloats([text2,text4,text8,text16,text32]) { // 31 floats = 1 + 2 + 4 + (4+4) + (4+4+4+4)

//       return [...encode(text2,2),...encode(text4,4) ,...encode(text8,8), ...encode(text16,16) , ...encode(text32,32) ]
  
//       function encode(text,size) {
//         const pad = '                  '.slice(0,Math.ceil((size-text.length)/2))
//         const txtChars = jb.zui.charsetEncodeAscii((pad + text + pad).slice(0,size))
//         const floats = Array.from(new Array(Math.ceil(size/2)).keys())
//             .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1]))
//         return floats
//       }
//       function twoCharsToFloat(char1, char2) {
//         return char1 * 256 + char2
//       }
//     }  
// })

// extension('zui','text8', {
//   text8ZuiElem: viewCtx => ({
//       async asyncPrepare({gl}) {
//         this.charSetTexture = await jb.zui.charSetTexture(gl)
//       },
//       vertexShaderCode: () => jb.zui.vertexShaderCode({id: 'text8',
//         code: `attribute vec4 _text; varying vec4 text;
//         attribute vec3 _backgroundColor; varying vec3 backgroundColor;`, 
//         main:'text = _text; backgroundColor = _backgroundColor;'
//       }),
//       fragementShaderCode: () => jb.zui.fragementShaderCode({code: 
//         `varying vec4 text; varying vec3 backgroundColor;
//         uniform sampler2D charSetTexture;
//         uniform float charWidthInTexture;
//         uniform vec2 charSetTextureSize;
//         uniform int strLen;

//         float getIndexInVec(float x) {
//           if (strLen <= 2) return 0.0;
//           if (strLen <= 4) return floor(x * 2.0);
//           if (strLen <= 8) return floor(x * 4.0);
//         }
  
//         float calcCharCode(float x) {
//           int index = 0;
//           int idx = int(getIndexInVec(x));
//           vec4 vec = text;
//           float flt = 0.0;
//           for(int i=0;i<4;i++)
//             if (idx == i) flt = vec[i];
  
//           if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
//             return floor(flt/256.0);
//           return mod(flt,256.0);
//         }        
//         float calcCharCode2(float x) {
//           int index = 0;
//           int idx = int(floor(x * 4.0));
//           vec4 vec = text;
//           float flt = 0.0;
//           for(int i=0;i<4;i++)
//             if (idx == i) flt = vec[i];
  
//           if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
//             return floor(flt/256.0);
//           return mod(flt,256.0);
//         }
//         vec3 getContrastingFontColor(backgroundColor) {
//           float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));
//           float whiteLuminance = dot(vec3(1.0), vec3(0.299, 0.587, 0.114));
//           float blackLuminance = dot(vec3(0.0), vec3(0.299, 0.587, 0.114));
//           float whiteContrast = abs(bgLuminance - whiteLuminance);
//           float blackContrast = abs(bgLuminance - blackLuminance);
//           vec3 fontColor = (whiteContrast > blackContrast) ? vec3(1.0) : vec3(0.0);
//           return fontColor;
//         }        
//         `, 
//         main:`
//           float fStrLen = float(strLen);
//           float inCharPos = mod(rInElem[0] * fStrLen, 1.0);
//           float charCode = calcCharCode(rInElem[0]);    
//           float inCharPosPx = mod(inElem[0], charWidthInTexture);
//           vec2 texturePos = vec2(charCode * charWidthInTexture + inCharPosPx, size[1] - inElem[1]) / charSetTextureSize;
//           if (backgroundColor[0] == -1.0) {
//             gl_FragColor = texture2D( charSetTexture, texturePos);
//             return;
//           }

//           vec4 texel = texture2D(charSetTexture, texturePos);
//           if (texel.a < 0.2) {
//             gl_FragColor = vec4(backgroundColor, 1.0);
//           } else {
//             gl_FragColor = vec4(getContrastingFontColor(), 1.0);
//           }
//         `}
//       ),
//       calcBuffers(view, {itemsPositions }) {
//           const backgroundColor = view.backgroundColorByProp || { colorScale: x => [-1,-1,-1], prop: {pivots: () => [ {scale: () => 1 }]}}
//           const itemToColor01 = backgroundColor.prop.pivots()[0].scale

//           const textBoxNodes = itemsPositions.sparse.map(([item, x,y]) => 
//               [x,y, 
//                 ...jb.zui.textAsFloats(viewCtx.params.prop.asText(item), viewCtx.params.length),
//                 ...backgroundColor.colorScale(itemToColor01(item))
//               ])
//           const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
//           const floatsInVertex = 2 + 4 + 3
//           const vertexCount = vertexArray.length / floatsInVertex
  
//           return {
//             vertexArray, vertexCount, floatsInVertex,
//             src: [this.vertexShaderCode(), this.fragementShaderCode()]
//           }    
//       },
//       renderGPUFrame({cmp, shaderProgram, glCanvas, gl, zoom, center, elemsLayout, vertexCount, floatsInVertex, vertexBuffer, size, pos}) {
 
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'itemViewSize'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

//           gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), viewCtx.params.length)
//           gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), 10)
//           gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'charSetTextureSize'), jb.zui.charSetTextureSize)
          
//           const itemPos = gl.getAttribLocation(shaderProgram, 'itemPostext8')
//           gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//           gl.enableVertexAttribArray(itemPos)
//           gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

//           const text = gl.getAttribLocation(shaderProgram, '_text')
//           gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//           gl.enableVertexAttribArray(text)
//           gl.vertexAttribPointer(text, 4, gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)

//           const background = gl.getAttribLocation(shaderProgram, '_backgroundColor')
//           gl.enableVertexAttribArray(background)
//           gl.vertexAttribPointer(background, 3, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 6* Float32Array.BYTES_PER_ELEMENT)
          
//           const {i} = jb.zui.allocateSingleTextureUnit({view: 'charSetTexture',cmp})
//           gl.activeTexture(gl['TEXTURE'+i])
//           gl.bindTexture(gl.TEXTURE_2D, this.charSetTexture)
//           gl.uniform1i(gl.getUniformLocation(shaderProgram, 'charSetTexture'), i)
  
//           gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//           gl.drawArrays(gl.POINTS, 0, vertexCount)
//       }
//     }),
  
//     textAsFloats(_text, length) {
//       const text = (_text || 'null').slice(0,length)
//       const pad = '                  '.slice(0,Math.ceil((length-text.length)/2))
//       const txtChars = jb.zui.charsetEncodeAscii((pad + text + pad).slice(0,length))
//       const floats = Array.from(new Array(4).keys())
//           .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1])).map(x=> isNaN(x) ? 0 :x) 
//       return floats

//       function twoCharsToFloat(char1, char2) {
//         return char1 * 256 + char2
//       }
//     }  
// })
