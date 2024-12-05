dsl('zui')

component('button', {
  type: 'control',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'style', type: 'button-style', defaultValue: fixedPosButton(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('fixedPosButton', {
  type: 'button-style',
  params: [
    {id: 'borderRadius', as: 'array', defaultValue: [15,15]},
    {id: 'clickEffect', as: 'number', defaultValue: 1}
  ],
  impl: features(
    modeByContext(),
    prop('titleImage', zui.imageOfText('%$$model/title()%')),
    uniforms(
      vec2('elemSize', '%$$props/titleImage/size%'),
      vec2('titleImageSize', '%$$props/titleImage/size%'),
      float('clickEffect', '%$clickEffect%'),
      texture('titleTexture', '%$$props/titleImage%')
    ),
    textByTexture()
  )
})

