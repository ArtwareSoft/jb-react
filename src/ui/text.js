jb.ns('text')

jb.component('text', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'my title', dynamic: true},
    {id: 'style', type: 'text.style', defaultValue: text.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('label', {...jb.comps.text,type: 'depricated-control'} )

jb.component('text.bindText', {
  type: 'feature',
  category: 'text:0',
  impl: features(
    watchAndCalcModelProp('text', ({data}) => jb.ui.toVdomOrStr(data)),
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'text' }})
  )
})

jb.component('text.allowAsynchValue', {
  type: 'feature',
  impl: features(
    calcProp({id: 'text', value: (ctx,{cmp}) => cmp.text || ctx.vars.$props.text}),
    interactive(
        (ctx,{cmp}) => {
      if (cmp.text) return
      const val = jb.ui.toVdomOrStr(ctx.vars.$model.text(cmp.ctx))
      if (val && typeof val.then == 'function')
        val.then(res=>cmp.refresh({text: jb.ui.toVdomOrStr(res)},{srcCtx: ctx.componentContext}))
    }
      )
  )
})

jb.component('text.htmlTag', {
  type: 'text.style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
    {id: 'cssClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{text,htmlTag,cssClass},h) => h(htmlTag,{class: cssClass},text),
    features: text.bindText()
  })
})

jb.component('text.noWrappingTag', {
  type: 'text.style',
  category: 'text:0',
  impl: customStyle({
    template: (cmp,{text},h) => text,
    features: text.bindText()
  })
})

jb.component('text.span', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('span',{},text),
    features: text.bindText()
  })
})

;[1,2,3,4,5,6].map(level=>jb.component(`header.h${level}`, {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h(`h${level}`,{},text),
    features: text.bindText()
  })
}))


;[1,2,3,4,5,6].map(level=>jb.component(`header.mdcHeadline${level}`, {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--headline${level}`},text),
    features: text.bindText()
  })
}))

;[1,2].map(level=>jb.component(`header.mdcSubtitle${level}`, {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--subtitle${level}`},text),
    features: text.bindText()
  })
}))

jb.component('header.mdcHeaderWithIcon', {
  type: 'text.style',
  params: [
    {id: 'level', options: '1,2,3,4,5,6', as: 'string', defaultValue: '1'}
  ],
  impl: customStyle({
    template: (cmp,{text,level},h) =>
        h(`h${level}`,{ class: 'mdc-tab__content'}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon).map(h),
          h('span',{ class: 'mdc-tab__text-label'},text),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
    css: '{justify-content: initial}',
    features: text.bindText()
  })
})

;[1,2].map(level=>jb.component(`text.mdcBody${level}`, {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--body${level}`},text),
    features: text.bindText()
  })
}))

jb.component('text.highlight', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--deep-purple-A700'}
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
