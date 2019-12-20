jb.ns('label')

jb.component('label', { /* label */
  type: 'control',
  category: 'control:100,common:80',
  params: [
    {id: 'text', as: 'ref', mandatory: true, defaultValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, defaultValue: 'my label', dynamic: true},
    {id: 'style', type: 'label.style', defaultValue: label.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('text', jb.comps.label)

jb.component('label.bind-text', { /* label.bindText */
  type: 'feature',
  impl: ctx => ({
    watchAndCalcRefProp: { prop: 'text', toState: jb.ui.toVdomOrStr },
    // watchRef: { refF: ctx.vars.$model.text, srcCtx: ctx },
    // calcState: cmp => ({ text: jb.ui.toVdomOrStr((ctx.vars.$model.text)(cmp.ctx)) }),
  })
})

jb.component('label.allow-asych-value', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      const textF = ctx.vars.$model.text 
      const textRef = textF(cmp.ctx);
      const val = jb.ui.toVdomOrStr(textRef)
      if (val && typeof val.then == 'function')
        refreshAsynchText(val)

      cmp.refresh = _ => refreshAsynchText(jb.ui.toVdomOrStr(textF(cmp.ctx)))

      function refreshAsynchText(textPromise) {
        Promise.resolve(textPromise).then(text => cmp.setState({text}))
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

jb.component('label.highlight', { /* label.highlight */
  type: 'data',
  macroByValue: true,
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
