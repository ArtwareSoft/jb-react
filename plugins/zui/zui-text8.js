dsl('zui')

component('text8', {
  description: 'fixed length text',
  type: 'view',
  params: [
    {id: 'text', as: 'string', dynamic: true, mandatory: true},
    {id: 'length', as: 'number', description: '<= 8', defaultValue: 8},
    {id: 'fontSize', as: 'number', defaultValue: 16},
    {id: 'fontWidth', as: 'number', defaultValue: 10},
    {id: 'charSet', as: 'string', defaultValue: ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~    `}
  ],
  impl: view('text8', text8('%$text()%'), {
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
      calc: v => ctx.vars.items.map(item=>jb.zui.textAsFloats(charSet, v.itemProp.text(ctx.setData(item)), length))
    })
})

extension('zui','text8', {
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

component('text8', {
  type: 'itemProp',
  params: [
    {id: 'text', as: 'string', dynamic: true},
  ]
})
