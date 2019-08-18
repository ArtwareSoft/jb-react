jb.component('label', {
    type: 'control', category: 'control:100,common:80',
    params: [
        { id: 'title', as: 'ref', mandatory: true, defaultValue: 'my label', dynamic: true },
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
      const ref = ctx.vars.$model.title(cmp.ctx);
      cmp.state.title = fixTitleVal(ref);
      if (jb.isRef(ref))
        jb.ui.refObservable(ref,cmp,{watchScript: ctx})
            .subscribe(e=> !cmp.watchRefOn && jb.ui.setState(cmp,{title: fixTitleVal(ref)},e,ctx));

      cmp.refresh = _ =>
        cmp.setState({title: fixTitleVal(ctx.vars.$model.title(cmp.ctx))})

      function fixTitleVal(titleRef) {
        if (titleRef == null || titleRef.$jb_invalid)
            return 'ref error';
        return jb.ui.toVdomOrStr(titleRef);
      }
    }
  })
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('span',{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.p', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('p',{},state.title),
        features :{$: 'label.bind-title' }
    }
})


jb.component('label.h1', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('h1',{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.heading', {
    type: 'label.style',
    params: [{ id: 'level', as: 'string', defaultValue: 'h1', options: 'h1,h2,h3,h4,h5'}],
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h(cmp.level,{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.card-title', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{ class: 'mdl-card__title' },
    				h('h2',{ class: 'mdl-card__title-text' },	state.title)),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.card-supporting-text', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{ class: 'mdl-card__supporting-text' },	state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('highlight', {
  type: 'data',
  usageByValue: true,
  params: [
    { id: 'base', as: 'string', dynamic: true },
    { id: 'highlight', as: 'string', dynamic: true },
    { id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--indigo-A700'},
  ],
  impl: (ctx,base,highlightF,cssClass) => {
    const h = highlightF(), b = base();
    if (!h || !b) return b;
    const highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return [  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)]
  }
})
