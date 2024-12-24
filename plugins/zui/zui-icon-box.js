dsl('zui')

component('iconBox', {
  type: 'control',
  params: [
    {id: 'abrv', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'iconBox-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('card', {
  type: 'control',
  params: [
    {id: 'title', dynamic: true, as: 'string', mandatory: true},
    {id: 'description', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'card-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('borderStyle', {
  type: 'item_border_style',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'borderStyleScale', mandatory: true, type: 'border_style_scale', defaultValue: borderStyleScale3()}
  ],
  impl: (ctx,unitScaleF,borderStyleScale) => {
    const unitScale = unitScaleF()
    return ctx => {
            const index = Math.floor(unitScale(ctx.data) * borderStyleScale.length *0.9999)
            return borderStyleScale[index] ? borderStyleScale[index] : 'solid'
        }
    }
})

component('borderStyleScale3', {
  type: 'border_style_scale',
  impl: () => ['solid','dashed','dotted']
})

component('opacity', {
  type: 'item_opacity',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'opacityScale', mandatory: true, type: 'opacity_scale', defaultValue: opacityScale()}
  ],
  impl: (ctx,unitScaleF,opacityScale) => {
    const unitScale = unitScaleF()
    return ctx => {
            const index = Math.floor(unitScale(ctx.data) * opacityScale.length *0.9999)
            return opacityScale[index] ? opacityScale[index] : 1
        }
    }
})

component('opacityScale', {
  type: 'opacity_scale',
  impl: () => [1.0,0.8,0.6,0.4,0.2]
})

component('symbol', {
  type: 'item_symbol',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'symbolScale', mandatory: true, type: 'symbol_scale'}
  ],
  impl: (ctx,unitScaleF,symbolScale) => {
        const unitScale = unitScaleF()
        return ctx => {
            const index = Math.floor(unitScale(ctx.data) * symbolScale.length *0.9999)
            return symbolScale[index] ? symbolScale[index] : ''
        }
    }
})

component('symbolByItemValue', {
  type: 'item_symbol',
  params: [
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'case', type: 'item_symbol_case[]'}
  ],
  impl: (ctx,valF,cases) => {
    const casesHash = jb.objFromEntries(cases.map(x=>x.entry))
    return ctx => casesHash[valF(ctx)] || '❓'
  }
})

component('Case', {
  type: 'item_symbol_case',
  params: [
    {id: 'val', as: 'string', mandatory: true},
    {id: 'symbol', mandatory: true, as: 'string'}
  ],
  impl: (ctx,val,symbol) => ({entry: [val,symbol]})
})



component('list', {
  type: 'symbol_scale',
  params: [
    {id: 'list', type: 'data<>[]', as: 'array'}
  ],
  impl: '%$list%'
})

component('success3', {
  type: 'symbol_scale',
  impl: list('✔️', '➖', '❌')
})
