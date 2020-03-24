jb.ns('icon')

jb.component('materialIcon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string'},
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, calcProp('icon','%$$model/icon%'))
})

jb.component('icon.material', {
  type: 'icon.style',
  impl: customStyle(
    (cmp,{icon},h) => h('i',{ class: 'material-icons' }, icon)
  )
})

