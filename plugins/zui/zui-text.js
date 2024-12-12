dsl('zui')

component('text', {
  type: 'control',
  params: [
    {id: 'text', dynamic: true, mandatory: true},
    {id: 'width', as: 'number', defaultValue: 200},
    {id: 'font', as: 'string', defaultValue1: '16px Arial', defaultValue: `16px 'Noto Sans', 'Roboto', 'Arial', sans-serif`},
    {id: 'packRatio', as: 'number', defaultValue: 4, options: '2,4,8,16,32', description: 'performance versus text quality'},
    {id: 'align', type: 'align_image', defaultValue: keepSize()},
    {id: 'style', type: 'text-style', defaultValue: textureByContext(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('textureByContext', {
  type: 'text-style',
  impl: features(
    mainByContext(),
    minWidth('%$$model/width%'),
    minHeight(14),
    If('%$renderRole%==fixed', text.singleTexture()),
    If('%$renderRole%==flowElem', text.singleTexture()),
    If('%$inZoomingGrid%', text.zoomingGrid())
  )
})

component('text.singleTexture', {
  type: 'feature',
  impl: features(
    prop('textImage', zui.imageOfText('%$$model/text()%')),
    uniforms(
      vec3('align', '%$$model/align%'),
      vec2('glyphSize', '%$$props/textImage/size%'),
      texture('textTexture', '%$$props/textImage%')
    ),
    textBlendingFunction(),
    text.colorOfPixel()
  )
})

component('text.zoomingGrid', {
  type: 'feature',
  impl: features(
    prop('atlas', zuiText.multiLineAtlas()),
    glAtt(vec2('atlasOffset', '%$$props/atlas.offsets/{%$item.xyPosStr%}%')),
    glAtt(vec2('glyphSize', '%$$props/atlas.glyphSize/{%$item.xyPosStr%}%')),
    uniforms(
      vec3('align', '%$$model/align%'),
      vec2('atlasSize', '%$$props/atlas.texture.size%'),
      texture('textTexture', '%$$props/atlas.texture%')
    ),
    textBlendingFunction(),
    text.colorOfPixel()
  )
})

component('text.colorOfPixel', {
  type: 'feature',
  impl: features(
    shaderMainSnippet({
      code: pipeline(
        Switch(
          Case('%$renderRole%==fixed', 'textBlending(inGlyph, glyphSize, vec2(0.0)'),
          Case('%$renderRole%==flowElem', 'textFlowBlending(cmp, inGlyph, glyphSize, vec2(0.0)'),
          Case({
            condition: '%$renderRole%==dynamicFlowElem',
            value: 'textFlowBlending(cmp, inGlyph, atlasSize_%$cmp.flowCmpIndex%, atlasOffset_%$cmp.flowCmpIndex%.xy'
          }),
          Case('%$inZoomingGrid%', 'textBlending(inGlyph, atlasSize, atlasOffset.xy')
        ),
        'gl_FragColor = vec4(0.0, 0.0, 0.0, %%, %$$model/packRatio%.0));'
      ),
      phase: 20
    }),
    prop('requiredForFlowMain', 'textFlowBlendingFunction')
  )
})

component('zui.imageOfText', {
  params: [
    {id: 'text', as: 'string' },
    {id: 'font', as: 'string', defaultValue: '%$$model/font%'},
    {id: 'packRatio', as: 'number', defaultValue: '%$$model/packRatio%'}
  ],
  impl: async (ctx,text, font, packRatio) => {
    const metrics = jb.zui.measureCanvasCtx(font).measureText(text)
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    const size = [metrics.width, height].map(x => Math.ceil(x))

    const canvas = jb.zui.createCanvas(...size)
    const cnvCtx = canvas.getContext('2d')
    cnvCtx.font = font
    cnvCtx.fillStyle = 'black'
    cnvCtx.fillRect(0, 0, canvas.width, canvas.height)

    cnvCtx.fillStyle = 'white'; // Text color
    cnvCtx.textBaseline = 'alphabetic'
    cnvCtx.textAlign = 'left'
    cnvCtx.fillText(text, 0, metrics.actualBoundingBoxAscent)

    //jb.zui.canvasToDataUrl(canvas).then(url => console.log(url));

    const bwBitMap = jb.zui.bwCanvasToBase64(packRatio, cnvCtx.getImageData(0, 0, ...size).data, ...size)
    const textureSize = [ Math.ceil(size[0] / packRatio) * 4, size[1]]
    return { textureSize, size, bwBitMap, packRatio }
  }
})

component('textBlendingFunction', {
  type: 'feature',
  impl: shaderDecl(`
  float textBlending(vec2 inGlyph, vec2 textureSize, vec2 textureOffset, float packRatio) {
      float bitsPerPixel = floor(32.0 / packRatio);
      float pixelsPerByte = floor(8.0 / bitsPerPixel);
      float unitX = floor(inGlyph.x / packRatio) * packRatio;
      vec2 rBase = (textureOffset + vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / textureSize;
      vec4 unit = texture2D(textTexture, rBase) * 255.0;
      float pixel = floor(inGlyph.x - unitX);
      int byteIndex = int(floor(pixel/pixelsPerByte));
      float byteValue = unit[3];
      if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];
      
      float localPixelIndex = floor(mod(pixel, pixelsPerByte));
      float startBitIndex = bitsPerPixel * localPixelIndex;
      float noOfGrayColors = pow(2.0, bitsPerPixel);
      float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);      
      return grayColor/(noOfGrayColors-1.0);
    }`)
})

component('textFlowBlendingFunction', {
  type: 'feature',
  impl: shaderDecl((ctx,{cmp,$props,$model}) => `float textFlowBlending(int cmp, vec2 inGlyph, vec2 textureSize, vec2 textureOffset, float packRatio) {
    float bitsPerPixel = floor(32.0 / packRatio);
    float pixelsPerByte = floor(8.0 / bitsPerPixel);
    float unitX = floor(inGlyph.x / packRatio) * packRatio;
    vec2 rBase = (textureOffset + vec2(unitX + 0.5, floor(inGlyph.y) + 0.5)) / textureSize;
    vec4 unit;
${cmp.shownChildren.filter((_,i)=>cmp.glVars.uniforms.find(u=>u.glVar == `textTexture_${i}`))
      .map((_,i)=>`\t\tif (cmp == ${i}) unit = texture2D(textTexture_${i}, rBase) * 255.0;`).join('\n')}
    float pixel = floor(inGlyph.x - unitX);
    int byteIndex = int(floor(pixel/pixelsPerByte));
    float byteValue = unit[3];
    if (byteIndex == 0) byteValue = unit[0]; else if (byteIndex == 1) byteValue = unit[1]; else if (byteIndex == 2) byteValue = unit[2];

    float localPixelIndex = floor(mod(pixel, pixelsPerByte));
    float startBitIndex = bitsPerPixel * localPixelIndex;
    float noOfGrayColors = pow(2.0, bitsPerPixel);
    float grayColor = mod(byteValue / pow(2.0, startBitIndex), noOfGrayColors);   
    return grayColor/(noOfGrayColors-1.0);
    }`)
})

component('zuiText.multiLineAtlas', {
  params: [
    {id: 'text', as: 'string', dynamic: true, defaultValue: '%$$model/text()%'},
    {id: 'width', as: 'number', defaultValue: '%$$model/width%'},
    {id: 'font', as: 'string', defaultValue: '%$$model/font%'},
    {id: 'packRatio', as: 'number', defaultValue: '%$$model/packRatio%'}
  ],
  impl: (ctx,textF,width,font,packRatio) => {
    const {items,glLimits,cmp} = ctx.vars

    const maxMetrics = jb.zui.measureCanvasCtx(font).measureText('XgQ')
    const lineHeight = maxMetrics.actualBoundingBoxAscent + maxMetrics.actualBoundingBoxDescent
    const height_shift = 3

    const offsets = {}, glyphSize = {},maxHeight = glLimits.MAX_TEXTURE_SIZE, maxWidth = glLimits.MAX_TEXTURE_SIZE*packRatio
    let yPos = 0, xPos = 0
    const glyphs = items.map((item,i) => {
        const str = textF(ctx.setData(item))
        const lines = str.indexOf(' ') == -1 ? [{words: [str]}] : jb.zui.calculateLineBreaksAndSpacing(str, width, font)
        const height = lines.length*lineHeight
        if (yPos+height > maxHeight) {xPos += width; yPos =0}
        if (xPos > maxWidth)
            jb.logError(`texture is too small for atlas for ${cmp.title}`,{cmp, ctx})

        offsets[item.xyPos] = [xPos,yPos+height_shift]
        yPos += height
        return { pos: [xPos,yPos] , lines, xyPos: item.xyPos}
    })
    
    const size = [Math.ceil(xPos+width/32)*32, yPos+height_shift]
    const canvas = jb.zui.createCanvas(...size)
    const cnvCtx = canvas.getContext('2d')
    cnvCtx.font = font; cnvCtx.textBaseline = 'alphabetic'; cnvCtx.textAlign = 'left'; 
    cnvCtx.fillStyle = 'black'; cnvCtx.fillRect(0, 0, canvas.width, canvas.height); cnvCtx.fillStyle = 'white' // Text color

    glyphs.forEach(({lines, pos, xyPos})=> {
        let width = 0;
        lines.forEach((line, index) => {
            let x = 0
            const y = index * lineHeight
            line.words.forEach(word => {
                cnvCtx.fillText(word,pos[0]+x,pos[1]+y)
                if (line.wordSpacing)
                    x += cnvCtx.measureText(word).width + line.wordSpacing // Move x position for the next word
            })
            width = Math.max(x,width)
        })
        glyphSize[xyPos] = [width,lines.length*lineHeight]
    })

    const bwBitMap = jb.zui.bwCanvasToBase64(packRatio, cnvCtx.getImageData(0, 0, ...size).data, ...size)
    //jb.zui.canvasToDataUrl(canvas).then(url => console.log(url));
    const textureSize = [ Math.ceil(size[0] / packRatio) * 4, size[1]]
    return { offsets, glyphSize, texture: { textureSize, size, bwBitMap, packRatio } }
  }
})

