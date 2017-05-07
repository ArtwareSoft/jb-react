jb.component('label', {
    type: 'control', category: 'control:100,common:80',
    params: [
        { id: 'title', as: 'ref', essential: true, defaultValue: 'my label', dynamic: true },
        { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ui.ctrl(ctx)
})

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      var ref = ctx.vars.$model.title(cmp.ctx);
      cmp.state.title = jb.tostring(ref);
      jb.ui.refObservable(ref,cmp)
        .subscribe(_=>cmp.setState({title: jb.tostring(ref)}))
    }
  })
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'custom-style', 
        template: (cmp,state,h) => 
          h('span',{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('highlight', {
  params: [
    { id: 'base', as: 'string', dynamic: true },
    { id: 'highlight', as: 'string', dynamic: true },
    { id: 'cssClass', as: 'string', defaultValue: 'highlight'},
  ],
  impl: (ctx,base,highlight,cssClass) => 
    highlight() ? jb.ui.h('div',{},[base().split(highlight())[0],jb.ui.h('span',{class: cssClass},highlight()),base().split(highlight())[1]
      ]) : base()
})

