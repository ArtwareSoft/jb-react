component('layout.vertical', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3, byName: true}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex; flex-direction: column}
          >* { ${jb.ui.propWithUnits('margin-bottom',spacing)} }
          >*:last-child { margin-bottom:0 }`)
})

component('layout.horizontal', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3, byName: true}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex}
        >* { ${jb.ui.propWithUnits('margin-right', spacing)} }
        >*:last-child { margin-right:0 }`)
})

component('layout.horizontalFixedSplit', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'leftWidth', as: 'string', defaultValue: '200px', mandatory: true, byName: true},
    {id: 'rightWidth', as: 'string', defaultValue: '100%', mandatory: true},
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >*:first-child { ${jb.ui.propWithUnits('margin-right',ctx.params.spacing)}
        ${jb.ui.propWithUnits('width',ctx.params.leftWidth)} }
        >*:last-child { margin-right:0; ${jb.ui.propWithUnits('width',ctx.params.rightWidth)} }`,
  })
})

component('layout.horizontalWrapped', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3, byName: true}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* {${jb.ui.propWithUnits('margin-right',ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

component('layout.flex', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse', byName: true},
    {id: 'justifyContent', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around'},
    {id: 'alignItems', as: 'string', options: ',normal,stretch,center,start,end,flex-start,flex-end,baseline,first baseline,last baseline,safe center,unsafe center'},
    {id: 'wrap', as: 'string', options: ',wrap,wrap-reverse,nowrap'},
    {id: 'spacing', as: 'string'}
  ],
  impl: ctx => ({
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), marginSpacing: ctx.params.direction.match(/col/) ? 'bottom' : 'right' , ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
      {?>* { margin-%$marginSpacing%: %$spacingWithUnits% }?}
    ${ctx.params.spacing ? '>*:last-child { margin-%$marginSpacing%:0 }' : ''}`),
  })
})

component('layout.grid', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'columnSizes', as: 'array', templateValue: list('auto','auto'), description: 'grid-template-columns, list of lengths', byName: true},
    {id: 'rowSizes', as: 'array', description: 'grid-template-rows, list of lengths'},
    {id: 'columnGap', as: 'string', description: 'grid-column-gap'},
    {id: 'rowGap', as: 'string', description: 'grid-row-gap'}
  ],
  impl: ctx => ({
    css: ctx.setVars({...ctx.params,
          colSizes: ctx.params.columnSizes.map(x=>jb.ui.withUnits(x)).join(' ') , rowSizes: ctx.params.rowSizes.map(x=>jb.ui.withUnits(x)).join(' ')
         }).exp(`{ display: grid; {?grid-template-columns:%$colSizes%;?} {?grid-template-rows:%$rowSizes%;?}
            {?grid-column-gap:%$columnGap%;?} {?grid-row-gap:%$rowGap%;?} }`)
  })
})

component('flexItem.grow', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1', byName: true}
  ],
  impl: css('flex-grow: %$factor%')
})

component('flexItem.basis', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1', byName: true}
  ],
  impl: css('flex-basis: %$factor%')
})

component('flexItem.alignSelf', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto', byName: true}
  ],
  impl: css('align-self: %$align%')
})

