component('text.htmlTag', {
    type: 'text.style',
    params: [
      {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
      {id: 'cssClass', as: 'string'}
    ],
    impl: customStyle({
      template: (cmp,{text,htmlTag,cssClass},h) => h(`${htmlTag}.${cssClass}`,{},text),
      features: text.bindText()
    })
})
  
component('text.noWrappingTag', {
    type: 'text.style',
    category: 'text:0',
    impl: customStyle({
      template: (cmp,{text},h) => text,
      features: text.bindText()
    })
})
  
component('text.span', {
  type: 'text.style',
  impl: customStyle({template: (cmp,{text},h) => h('span',{},text), features: text.bindText()})
})

component('text.chip', {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('div.jb-chip',{},h('span',{},text)),
      features: text.bindText()
    })
})
  
component('header.mdcHeaderWithIcon', {
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

component('text.alignToBottom', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('div',{},h('span',{},text)),
    css: '{position: relative } ~>span { position: absolute; left: 0; bottom: 0 }',
    features: text.bindText()
  })
})

 jb.defComponents('1,2,3,4,5,6'.split(','), 
  level=> component(`header.h${level}`, ({
    autoGen: true,
    type: 'text.style',
    params: [
      { id: 'level', as: 'string', defaultValue: level }
    ],
    impl: customStyle({
      template: (cmp,{text,level},h) => h(`h${level}`,{},text),
      features: text.bindText()
    })
})))

component('text.h2WithClass', {
  type: 'text.style:0',
  params: [
    {id: 'clz', as: 'string'}
  ],
  impl: customStyle({template: (cmp,{text,clz},h) => h('h2',{class: clz},text), features: text.bindText()})
})

 jb.defComponents('1,2,3,4,5,6'.split(','), 
  level=> component(`header.mdcHeadline${level}`, 
    ({autoGen: true, type: 'text.style', impl: {$: 'text.h2WithClass', clz: `mdc-typography mdc-typography--headline${level}`}})
))

 jb.defComponents('1,2'.split(','), 
  level=> component(`header.mdcSubtitle${level}`, 
    ({autoGen: true, type: 'text.style', impl: {$: 'text.h2WithClass', clz: `header.mdcSubtitle${level}`}})
))

 jb.defComponents('1,2'.split(','), 
  level => component(`header.mdcBody${level}`, 
    ({autoGen: true, type: 'text.style', impl: {$: 'text.h2WithClass', clz: `mdc-typography mdc-typography--body${level}`}})
))

component('text.textarea', {
  type: 'text.style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
  ],
  impl: customStyle({
    template: (cmp,{text,rows,cols},h) => h('textarea', { rows: rows, cols: cols, value: text}),
      features: text.bindText()
  })
})