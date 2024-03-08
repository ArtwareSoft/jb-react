
component('control.icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'size', as: 'number', defaultValue: 24},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('icon.init', {
  type: 'feature',
  category: 'icon:0',
  impl: features(calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'))
})

component('icon', {
  type: 'icon',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.materialNoClick()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('icon.material', {
  type: 'icon-style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), onclick: true, style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(), onclick: true,
        $html: `<svg width="24" height="24" jb_external="true" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.ui,['MDIcons',icon])}"/></svg>`}),
    features: icon.init()
  })
})

component('icon.materialNoClick', {
  type: 'icon-style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(),
        $html: `<svg width="24" height="24" jb_external="true" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.ui,['MDIcons',icon])}"/></svg>`}),
    features: icon.init()
  })
})

component('feature.icon', {
  type: 'feature',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'position', as: 'string', options: ',pre,post,raised', defaultValue: ''},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'size', as: 'number', defaultValue: 24},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.materialNoClick()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ({ 
    icon: jb.ui.ctrl(ctx, typeAdapter('feature<>', 
        features(calcProp('icon'), calcProp('type'),calcProp('title'), calcProp('size'), calcProp('iconPosition','%$$model/position%')
      )))
    })
})

