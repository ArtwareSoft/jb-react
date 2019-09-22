jb.ns('html')

jb.component('html', { 
    type: 'control',
    category: 'control:100,common:80',
    params: [
      {id: 'title', as: 'string', mandatory: true, templateValue: 'html', dynamic: true},
      {id: 'html', as: 'string', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
      {id: 'style', type: 'html.style', defaultValue: html.plain(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('html.plain', {
    type: 'label.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        features: ctx => ({
            afterViewInit: cmp => cmp.base.innerHTML = cmp.ctx.vars.$model.html()
        })
    })
})

