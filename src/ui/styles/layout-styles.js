jb.component('layout.vertical', { /* layout.vertical */
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex; flex-direction: column}
          >* { margin-bottom: ${jb.ui.withUnits(ctx.params.spacing)} }
          >*:last-child { margin-bottom:0 }`,
  })
})

jb.component('layout.horizontal', { /* layout.horizontal */
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* { margin-right: ${jb.ui.withUnits(ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

jb.component('layout.horizontal-fixed-split', { /* layout.horizontalFixedSplit */
  type: 'layout,feature',
  params: [
    {id: 'leftWidth', as: 'string', defaultValue: '200px', mandatory: true},
    {id: 'rightWidth', as: 'string', defaultValue: '100%', mandatory: true},
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >*:first-child { margin-right: ${jb.ui.withUnits(ctx.params.spacing)}; 
          width: ${jb.ui.withUnits(ctx.params.leftWidth)}; }
        >*:last-child { margin-right:0; width: ${jb.ui.withUnits(ctx.params.rightWidth)}; }`,
  })
})

jb.component('layout.horizontal-wrapped', { /* layout.horizontalWrapped */
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* { margin-right: ${jb.ui.withUnits(ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

jb.component('layout.flex', { /* layout.flex */
  type: 'layout,feature',
  params: [
    {id: 'alignItems', as: 'string', options: ',normal,stretch,center,start,end,flex-start,flex-end,baseline,first baseline,last baseline,safe center,unsafe center' },
    {id: 'spacing', as: 'string' },
    {id: 'justifyContent', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around' },
    {id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse'},
    {id: 'wrap', as: 'string', options: ',wrap,wrap-reverse,nowrap'}
  ],
  impl: ctx => ({
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
    >* { margin-right: %$spacingWithUnits% }
    ${ctx.params.spacing ? '>*:last-child { margin-right:0 }' : ''}`),
  })
})

jb.component('layout.grid', { /* layout.grid */
  type: 'layout,feature',
  params: [
    {id: 'columnSizes', as: 'array', templateValue: list('auto','auto'), description: 'grid-template-columns, list of lengths' },
    {id: 'rowSizes', as: 'array', description: 'grid-template-rows, list of lengths' },
    {id: 'columnGap', as: 'string', description: 'grid-column-gap' },
    {id: 'rowGap', as: 'string', description: 'grid-row-gap' },
  ],
  impl: ctx => ({
    css: ctx.setVars({...ctx.params,
          colSizes: ctx.params.columnSizes.join(' ') , rowSizes: ctx.params.rowSizes.join(' ')
         }).exp(`{ display: grid; {?grid-template-columns:%$colSizes%;?} {?grid-template-rows:%$rowSizes%;?} 
            {?grid-column-gap:%$columnGap%;?} {?grid-column-gap:%$rowGap%;?} }`)
  })
})

jb.component('flex-item.grow', { /* flexItem.grow */
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: (ctx,factor) => ({
      css: `{ flex-grow: ${factor} }`
    })
})

jb.component('flex-item.basis', { /* flexItem.basis */
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: (ctx,factor) => ({
      css: `{ flex-basis: ${factor} }`
    })
})

jb.component('flex-item.align-self', { /* flexItem.alignSelf */
  type: 'feature',
  category: 'flex-item',
  params: [
    {
      id: 'align',
      as: 'string',
      options: 'auto,flex-start,flex-end,center,baseline,stretch',
      defaultValue: 'auto'
    }
  ],
  impl: (ctx,align) => ({
      css: `{ align-self: ${align} }`
    })
})

// jb.component('flex-filler', {
//     type: 'control',
//     params: [
//         { id: 'title', as: 'string', defaultValue: 'flex filler' },
//         { id: 'basis', as: 'string', defaultValue: '1' },
//         { id: 'grow', as: 'string', defaultValue: '1' },
//         { id: 'shrink', as: 'string', defaultValue: '0' },
//     ],
//     impl: (ctx,title,basis,grow,shrink) => {
//       var css = [
//         `flex-basis: ${basis}`,
//         `flex-grow: ${grow}`,
//         `flex-shrink: ${shrink}`,
//       ].join('; ');

//       return jb_ui.Comp({ template: `<div style="${css}"></div>`},ctx)
//     }
// })


jb.component('responsive.only-for-phone', { /* responsive.onlyForPhone */
  type: 'feature',
  impl: () => ({
      cssClass: 'only-for-phone'
    })
})

jb.component('responsive.not-for-phone', { /* responsive.notForPhone */
  type: 'feature',
  impl: () => ({
      cssClass: 'not-for-phone'
    })
})
