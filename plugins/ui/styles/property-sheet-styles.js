
component('propertySheet.titlesLeft', {
  type: 'group-style',
  params: [
    {id: 'titleStyle', type: 'text-style', defaultValue: styleWithFeatures(text.span(), { features: css.bold() }), dynamic: true},
    {id: 'titleText', defaultValue: '%%:', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{}, ctrls.flatMap(ctrl=>[
        h(cmp.ctx.run({$: 'text' ,text: ctx => titleText(ctx.setData(ctrl.field().title())), style: ctx => titleStyle(ctx)},'control<>')),
        h(ctrl)
      ])
    ),
    css: '{ display: grid; grid-template-columns: auto auto; grid-column-gap:%$spacing%}',
    features: group.initGroup()
  })
})

component('propertySheet.titlesAbove', {
  type: 'group-style',
  params: [
    {id: 'titleStyle', type: 'text-style', defaultValue: styleWithFeatures(text.span(), { features: css.bold() }), dynamic: true},
    {id: 'titleText', defaultValue: '%%', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{ style: {'grid-template-columns': ctrls.map(()=>'auto').join(' ')}}, [
        ...ctrls.map(ctrl=>
          h(cmp.ctx.run({$: 'text', 
            text: ctx => titleText(ctx.setData(ctrl.field().title())), 
            style: ctx => titleStyle(ctx)}, 'control<>'))), 
        ...ctrls.map(ctrl=>h(ctrl))
      ]
    ),
    css: '{ display: grid; grid-column-gap:%$spacing% }',
    features: group.initGroup()
  })
})
