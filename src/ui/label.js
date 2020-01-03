jb.ns('label')

jb.component('text', { /* label */
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'my title', dynamic: true},
    {id: 'style', type: 'label.style', defaultValue: label.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('label', {...jb.comps.text,type: 'depricated-control'} )

jb.component('label.bind-text', { /* label.bindText */
  type: 'feature',
  impl: ctx => ({
    watchAndCalcRefProp: { prop: 'text', toState: jb.ui.toVdomOrStr, strongRefresh: true },
    studioFeatures: feature.editableContent('text')
  })
})

jb.component('label.allow-asynch-value', {
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
    features: label.bindText(),
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

;[1,2,3,4,5,6].map(level=>jb.component(`header.h${level}`, {
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h(`h${level}`,{},state.text),
    features: label.bindText()
  })
}))

;[1,2,3,4,5,6].map(level=>jb.component(`header.mdc-headline${level}`, {
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('h2',{class: `mdc-typography mdc-typography--headline${level}`},state.text),
    features: label.bindText()
  })
}))

;[1,2].map(level=>jb.component(`header.mdc-subtitle${level}`, {
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('h2',{class: `mdc-typography mdc-typography--subtitle${level}`},state.text),
    features: label.bindText()
  })
}))

;[1,2].map(level=>jb.component(`text.mdc-body${level}`, {
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('h2',{class: `mdc-typography mdc-typography--body${level}`},state.text),
    features: label.bindText()
  })
}))

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
    return jb.ui.h('div',{},[  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)])
  }
})
