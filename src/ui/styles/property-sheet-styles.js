jb.component('property-sheet.titles-left', { /* propertySheet.titlesLeft */
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'label.style', defaultValue: styleWithFeatures(label.span(), css.bold()), dynamic: true },
    {id: 'titleText', defaultValue: '%%:', dynamic: true },
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px' },
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, state.ctrls.flatMap(ctrl=>[
        h(cmp.ctx.run(label({text: ctx => cmp.titleText(ctx.setData(ctrl.field().title())), style: ctx => cmp.titleStyle(ctx)}))),
        h(ctrl)
      ])
    ),
    css: `{ display: grid; grid-template-columns: auto auto; grid-column-gap:%$spacing%}`,
    features: group.initGroup()
  })
})

jb.component('property-sheet.titles-above', { /* propertySheet.titlesAbove */
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'label.style', defaultValue: styleWithFeatures(label.span(), css.bold()), dynamic: true },
    {id: 'titleText', defaultValue: '%%', dynamic: true },
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px' },
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ style: {'grid-template-columns': state.ctrls.map(()=>'auto').join(' ')}}, [
        ...state.ctrls.map(ctrl=>
          h(cmp.ctx.run(label({
            text: ctx => cmp.titleText(ctx.setData(ctrl.field().title())), 
            style: ctx => cmp.titleStyle(ctx)})))), 
        ...state.ctrls.map(ctrl=>h(ctrl))
      ]
    ),
    css: `{ display: grid; grid-column-gap:%$spacing% }`,
    features: group.initGroup()
  })
})
