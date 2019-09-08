jb.ns('label')

jb.component('label', { /* label */
  type: 'control',
  category: 'control:100,common:80',
  params: [
    {id: 'title', as: 'ref', mandatory: true, defaultValue: 'my label', dynamic: true},
    {id: 'style', type: 'label.style', defaultValue: label.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
        jb.ui.ctrl(ctx)
})

jb.component('text', { /* text */
  type: 'control',
  category: 'control:100,common:80',
  params: [
    {id: 'title', as: 'string', mandatory: true, defaultValue: 'no title', dynamic: true},
    {id: 'text', as: 'ref', mandatory: true, defaultValue: 'my text', dynamic: true},
    {id: 'style', type: 'label.style', defaultValue: label.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
        jb.ui.ctrl(ctx)
})

jb.component('label.bind-text', { /* label.bindText */
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      const textF = ctx.vars.$text || ctx.vars.$model.title 
      const textRef = textF(cmp.ctx);
      cmp.state.text = fixTextVal(textRef);
      if (jb.isWatchable(textRef))
        jb.ui.refObservable(textRef,cmp,{watchScript: ctx})
            .subscribe(e=> !cmp.watchRefOn && jb.ui.setState(cmp,{text: fixTextVal(textRef)},e,ctx));

      cmp.refresh = _ =>
        cmp.setState({text: fixTextVal(textF(cmp.ctx))})

      function fixTextVal(textRef) {
        if (textRef == null || textRef.$jb_invalid)
            return 'ref error';
        return jb.ui.toVdomOrStr(textRef);
      }
    }
  })
})

jb.component('label.htmlTag', { /* label.htmlTag */
  type: 'label.style',
  params: [
    {
      id: 'htmlTag',
      as: 'string',
      defaultValue: 'p',
      options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'
    },
    {id: 'cssClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h(cmp.htmlTag,{class: cmp.cssClass},state.text),
    features: label.bindText()
  })
})

jb.component('label.no-wrapping-tag', { /* label.noWrappingTag() */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => state.text,
    features: label.bindText()
  })
})

jb.component('label.span', { /* label.span */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('span',{},state.text),
    features: label.bindText()
  })
})

jb.component('label.card-title', { /* label.cardTitle */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'mdl-card__title' },
    				h('h2',{ class: 'mdl-card__title-text' },	state.text)),
    features: label.bindText()
  })
})

jb.component('label.card-supporting-text', { /* label.cardSupportingText */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'mdl-card__supporting-text' },	state.text),
    features: label.bindText()
  })
})

jb.component('highlight', { /* highlight */
  type: 'data',
  usageByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--indigo-A700'}
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
