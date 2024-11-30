dsl('zui')

component('button', {
  type: 'control',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'fixedPos', as: 'array', defaultValue: [0,0] },
    {id: 'style', type: 'button-style', defaultValue: button(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('button', {
  type: 'button-style',
  params: [
    {id: 'borderRadius', as: 'array', defaultValue: [15,15]},
    {id: 'opacity', as: 'number', defaultValue: 0.8},
    {id: 'clickEffect', as: 'number', defaultValue: 1}
  ],
  impl: features(
    If('%$parentItemlistId%', zoomingSize(texture('titleTexture'))),
    posByContext('%$$model/fixedPos%'),
    fixedBorderColor('red'),
    prop('titleImage', zui.imageOfText('%$$model/title()%')),
    uniforms(
      vec2('size', '%$$props/titleImage/size%'),
      float('opacity', '%$opacity%'),
      float('clickEffect', '%$clickEffect%'),
      texture('titleTexture', '%$$props/titleImage%')
    ),
    borderRadius('%$borderRadius%'),
    textBackground('texture2D(titleTexture, rInElem)'),
    shaderMainSnippet('gl_FragColor = resColor;')
  )
})

