
component('text', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', dynamic: true},
    {id: 'style', type: 'text-style', defaultValue: text.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('text.bindText', {
  type: 'feature',
  category: 'text:0',
  impl: features(
    watchAndCalcModelProp('text', ({data}) => jb.ui.toVdomOrStr(data)),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'text' }})
  )
})

component('text.allowAsynchValue', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  params: [
    {id: 'propId', defaultValue: 'text'},
    {id: 'waitingValue', defaultValue: ''}
  ],
  impl: features(
    calcProp('%$propId%', firstSucceeding('%$$state/{%$propId%}%','%$$props/{%$propId%}%')),
    followUp.flow(
      source.any(If('%$$state/{%$propId%}%', '', '%$$props/{%$propId%}%')),
      rx.log('followUp allowAsynchValue'),
      rx.map(({data}) => jb.ui.toVdomOrStr(data)),
      sink.refreshCmp(obj(prop('%$propId%', '%%')))
    )
  )
})

component('text.highlight', {
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

component('text.htmlTag', {
  type: 'text-style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
    {id: 'cssClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{text,htmlTag,cssClass},h) => h(`${htmlTag}.${cssClass}`,{},text),
    features: text.bindText()
  })
})

component('text.span', {
  type: 'text-style',
  impl: customStyle({ template: (cmp,{text},h) => h('span',{},text), features: text.bindText() })
})