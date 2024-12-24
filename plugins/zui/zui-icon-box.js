dsl('zui')

component('iconBox', {
  type: 'control',
  params: [
    {id: 'abrv', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'iconBox-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('card', {
  type: 'control',
  params: [
    {id: 'title', dynamic: true, as: 'string', mandatory: true},
    {id: 'description', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'card-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

