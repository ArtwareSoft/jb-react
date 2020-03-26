jb.ns('icon,control')

jb.component('control.icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string'},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'scale', as: 'number', defaultValue: 1 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('icon'), calcProp('type'), calcProp('scale'), calcProp('title')
  ))
})

jb.component('icon', {
  type: 'icon',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string'},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'scale', as: 'number', defaultValue: 1 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ctx.params
})

jb.component('icon.material', {
  type: 'icon.style',
  impl: customStyle({
    template: (cmp,{icon,type,title,scale},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title, onclick: true, style: {width: '24px', height: '24px', transform: `scale(${scale}) translate(${(scale-1)*12}px,${(scale-1)*12}px)` } }
      , icon) 
      : h('div',{title, onclick: true, style: { transform: `translate(${(scale-1)*12}px,${(scale-1)*12}px)`},
        $html: `<svg width="24" height="24" transform="scale(${scale})"><path d="${jb.path(jb.frame,['MDIcons',icon])}"/></svg>`}),
  })
})

jb.component('feature.icon', {
  type: 'feature',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'position', as: 'string', options: ',pre,post,raised', defaultValue: '' },
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'scale', as: 'string', defaultValue: 1 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ({
    icon: jb.ui.ctrl(ctx, features(
      calcProp('icon'), calcProp('type'), calcProp('scale'), calcProp('title'),
      calcProp('iconPosition','%$$model/position%')
    ))
  })
})

