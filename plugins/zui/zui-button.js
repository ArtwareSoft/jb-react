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
    modeByContext(),
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
