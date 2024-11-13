dsl('zui')

component('text', {
  type: 'view',
  params: [
    {id: 'text', dynamic: true, mandatory: true},
    {id: 'lineLength', as: 'number', defaultValue: 10},
    {id: 'summary', type: 'summary', defaultValue: slice()},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'},
    {id: 'noOfLines', as: 'number', defaultValue: 1},
    {id: 'align', type: 'align_image', defaultValue: keepSize()}
  ],
  impl: view('text', text('%$text()%', '%$summary%', '%$lineLength%', '%$noOfLines%', '%$font%'), {
    layout: text('%$lineLength%', '%$noOfLines%', { fontDimention: zui.fontDimention('%$font%') }),
    viewProps: [
      prop('fontDimention', zui.fontDimention('%$font%')),
      asyncProp('atlas', calcAtlas())
    ],
    atts: [
      vec2('imagePos', '%$view.props.atlas.xyToPos/{%$item.xyPos%}/pos%'),
      vec2('imageSize', '%$view.props.atlas.xyToPos/{%$item.xyPos%}/size%')
    ],
    renderGPU: gpuCode({
      shaderCode: colorOfPoint(`
        vec2 effSize = effectiveSize();
        vec2 inImage = inImagePx(effSize, inElem);
        
        if (inImage[0] < 0.0 || inImage[0] >= effSize[0] || inImage[1] < 0.0 || inImage[1] >= effSize[1]) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
        
        vec2 rInImage = inImage / effSize;
        gl_FragColor = texture2D(atlas, (imagePos + flipH(rInImage) * imageSize) / atlasSize);
      `),
      utils: [
        utils('vec2 flipH(vec2 pos) { return vec2(pos[0],1.0-pos[1]); }'),
        imageUtils('%$align%')
      ],
      uniforms: [
        imageUniforms('%$align%'),
        vec2('atlasSize', '%$view.props.atlas.size%'),
        texture('atlas', '%$view.props.atlas.url%')
      ]
    })
  })
})

component('calcAtlas', {
  impl: async ctx => {
    const {items, view} = ctx.vars
    const { text, summary, lineLength, font } = view.itemProp
    const {fontDimention} = ctx.vars.view.props


    const tmpCanvas = jb.zui.createCanvas(1,1)
    const tmpCtx = tmpCanvas.getContext('2d');tmpCtx.font = font; tmpCtx.textBaseline = 'top'; tmpCtx.textAlign = 'left'; tmpCtx.fillStyle = 'black'

    const xyToPos = {}, MAX_WIDTH = 1024
    let yPos = 0, xPos = 0
    const glyphs = items.map((item,i) =>{
      const str = summary.summary(text(ctx.setData(item)),lineLength,false)
      const size = [tmpCtx.measureText(str).width, fontDimention[1]]

      if (xPos + size[0] > MAX_WIDTH) { yPos += fontDimention[1]; xPos = 0}
      const pos = [xPos,yPos]
      xyToPos[item.xyPos] = { pos, size }
      xPos += size[0]
      return { pos, str }
    })
    
    const size = [yPos == 0 ? xPos : MAX_WIDTH, yPos + fontDimention[1]]
    const canvas = jb.zui.createCanvas(...size)
    const cnvCtx = canvas.getContext('2d')
    cnvCtx.font = font; cnvCtx.textBaseline = 'top'; cnvCtx.textAlign = 'left'; cnvCtx.fillStyle = 'black'

    glyphs.forEach(({str, pos})=> cnvCtx.fillText(str,...pos))

    const url = await jb.zui.canvasToDataUrl(canvas)
    return {url, size, xyToPos}
  }
})

component('text', {
  type: 'itemProp',
  macroByValue: true,
  params: [
    {id: 'text', dynamic: true},
    {id: 'summary', type: 'summary'},
    {id: 'lineLength', as: 'number'},
    {id: 'noOfLines', as: 'number', defaultValue: 1},
    {id: 'font', as: 'string'},
  ]
})

component('text', {
  type: 'layout_feature',
  params: [
    {id: 'lineLength', as: 'number'},
    {id: 'noOfLines', as: 'number'},
    {id: 'fontDimention'},
    {id: 'lineSpace', as: 'number', defaultValue: 2},
  ],
  impl: (ctx,lineLength,noOfLines,fontDimention,lineSpace) => ({
      layoutRounds: 1,
      sizeNeeds: ({round, available }) => [fontDimention[0]*lineLength, fontDimention[1]*noOfLines + lineSpace*(noOfLines-1) ]
  })
})