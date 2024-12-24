dsl('zui')

component('button', {
  type: 'control',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'style', type: 'button-style', defaultValue: simpleButton(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('simpleButton', {
  type: 'button-style',
  params: [
    {id: 'clickEffect', as: 'number', defaultValue: 1}
  ],
  impl: features(
    mainByContext(),
    titleTexture('%$$model/title()%'),
    uniforms(float('clickEffect', '%$clickEffect%'))
  )
})

component('titleTexture', {
  type: 'feature',
  params: [
    {id: 'text', as: 'string', dynamic: 'true', defaultValue: 'my title'}
  ],
  impl: features(
    prop('titleImage', zui.imageOfText('%$text()%')),
    uniforms(
      vec2('elemSize', '%$$props/titleImage/size%'),
      vec2('titleImageSize', '%$$props/titleImage/size%'),
      texture('titleTexture', '%$$props/titleImage%')
    ),
    textByTitleTexture()
  )
})

component('zoomingGrid.titleTexture', {
  type: 'feature',
  params: [
    {id: 'text', as: 'string', dynamic: 'true', defaultValue: 'my title'}
  ],
  impl: features(
    prop('titleImage', zui.imageOfText('%$text()%')),
    uniforms(
      vec2('elemSize', '%$$props/titleImage/size%'),
      vec2('titleImageSize', '%$$props/titleImage/size%'),
      texture('titleTexture', '%$$props/titleImage%')
    ),
    textByTitleTexture()
  )
})

component('titleTextureByContext', {
  type: 'feature',
  params: [
    {id: 'text', as: 'string', dynamic: 'true', defaultValue: 'my title'}
  ],
  impl: features(
    If('%$renderRole%==fixed', titleTexture('%$text()%')),
    If('%$renderRole%==flow', titleTexture('%$text()%')),
    If('%$inZoomingGrid%', zoomingGrid.titleTexture('%$text()%')),
  )
})

component('textByTitleTexture', {
  type: 'feature',
  impl: features(
    shaderMainSnippet({
      code: If({
        condition: '%$renderRole%==flow',
        then: 'gl_FragColor = vec4(0.0, 0.0, 0.0, flowTitleBlending(cmp, inGlyph, glyphSize));',
        Else: 'gl_FragColor = vec4(0.0, 0.0, 0.0, titleBlending(inGlyph, glyphSize));'
      }),
      phase: 20
    }),
    textBlendingFunction('title'),
    prop('requiredForFlowMain', 'flowTitleBlending')
  )
})