dsl('zui')

component('itemColor', {
  type: 'item_color',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: (ctx,unitScale,colorScale) => ctx => {
        const index = Math.floor(unitScale(ctx) * colorScale.length *0.9999)
        const color = colorScale[index] ? colorScale[index] : 'white'
        return Array.isArray(color) ? `rgb(${color.join(',')})` : color
    }
})

component('colorByItemValue', {
  type: 'item_color',
  params: [
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'case', type: 'item_color_case[]'},
    {id: 'defaultColor', type: 'static_color', defaultValue: [255,255,255]}
  ],
  impl: (ctx,valF,cases,defaultColor) => {
    const casesHash = jb.objFromEntries(cases.map(x=>x.entry))
    return ctx => {
      const color = casesHash[valF(ctx)] || defaultColor
      return Array.isArray(color) ? `rgb(${color.join(',')})` : color
    }
  }
})

component('Case', {
  type: 'item_color_case',
  params: [
    {id: 'val', as: 'string', mandatory: true},
    {id: 'color', type: 'static_color'}
  ],
  impl: (ctx,val,color) => ({entry: [val,color]})
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
            const index = Math.floor(unitScale(ctx) * borderStyleScale.length *0.9999)
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
            const index = Math.floor(unitScale(ctx) * opacityScale.length *0.9999)
            return opacityScale[index] ? opacityScale[index] : 1
        }
    }
})

component('opacityScale', {
  type: 'opacity_scale',
  impl: () => [0.5,0.6,0.7,0.9,1.0]
})

component('zui.itemSymbolFunc', {
  params: [
    {id: 'itemSymbol', dynamic: true, type: 'item_symbol'}
  ],
  impl: (ctxWithItems,itemSymbolF) => itemSymbolF(ctxWithItems)
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
            const index = Math.floor(unitScale(ctx) * symbolScale.length *0.9999)
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

component('iqScale', {
  type: 'symbol_scale',
  impl: list('🐦', '🐒', '🐋', '🐬', '🧒', '🧑', '🧑‍🎓')
})


component('star5', {
  type: 'symbol_scale',
  impl: list('⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐')
})

component('speedScale10', {
  type: 'symbol_scale',
  impl: list('🚶','🚶‍♀️','🏃','🏃‍♀️','🚴','🚴‍♀️','🚗','🏎️','✈️','🚀')
})

component('unitScale', {
  type: 'unit_scale',
  params: [
    {id: 'att', as: 'string', defaultValue: 'index'},
    {id: 'calc', as: 'number', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'items', dynamic: true, defaultValue: '%$zoomingGridCmp/items%'},
    {id: 'byOrder', as: 'boolean', type: 'boolean<>'}
  ],
  impl: (_ctx, _att, calc, itemsF, byOrder) => {
    const att = `fixed_${_att}`
    let _items = null
    let range = null
    let valid = false
    return ctx => {
      calcRange(ctx)
      if (!valid) return 0
      const item = ctx.data
      return ((+item[att] || 0)-range[0])/(range[1]-range[0])
    }
    function calcRange(ctx) {
      const {cmp} = ctx.vars
      const items = itemsF(_ctx) || itemsF(ctx)     
      if (items.length == 0) { valid = false; return }
      if (items == _items) return // caching range calculation. assuming items is immutable
      _items = items
      items.forEach((item,i) => item[att] = calc.profile ? calc(_ctx.setData(item)) : _att == 'index' ? i : +item[_att] )
      items.sort((i1,i2) => i1[att] - i2[att])
      range = [items[0][att] || 0,items.slice(-1)[0][att] || 0]
      valid = range[0] != range[1]
      if (valid && byOrder)
        items.forEach((item,index) => item[att] = (index+1)* (range[1]-range[0])/items.length )
    }
  }
})

component('index', {
    type: 'unit_scale',
    impl: unitScale('index')
})

component('severity5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60], description: 'very bad' }, // Bright red
    { from: 0.2, color: [230, 126, 34], description: 'bad' },    // Orange
    { from: 0.4, color: [244, 208, 63], description: 'neutral' }, // Yellow
    { from: 0.6, color: [169, 223, 191], description: 'good' },   // Light green
    { from: 0.8, color: [46, 204, 113], description: 'very good' } // Bright green
  ]
})

component('good5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60], description: 'very bad' }, // Bright red
    { from: 0.2, color: [230, 126, 34], description: 'bad' },    // Orange
    { from: 0.4, color: [244, 208, 63], description: 'neutral' }, // Yellow
    { from: 0.6, color: [169, 223, 191], description: 'good' },   // Light green
    { from: 0.8, color: [46, 204, 113], description: 'very good' } // Bright green
  ]
})

component('success5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [192, 57, 43], description: 'failure' },  // Dark red
    { from: 0.25, color: [211, 84, 0], description: 'partial failure' }, // Dark orange
    { from: 0.5, color: [244, 208, 63], description: 'neutral' },// Yellow
    { from: 0.75, color: [40, 180, 99], description: 'success' },// Green
    { from: 1, color: [29, 131, 72], description: 'full success' } // Dark green
  ]
})

component('distinct5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] }, // Red
    { from: 0.2, color: [52, 152, 219] }, // Blue
    { from: 0.4, color: [46, 204, 113] }, // Green
    { from: 0.6, color: [241, 196, 15] }, // Yellow
    { from: 0.8, color: [155, 89, 182] }  // Purple
  ]
})

component('distinct10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] },  // Red
    { from: 0.1, color: [52, 152, 219] }, // Blue
    { from: 0.2, color: [46, 204, 113] }, // Green
    { from: 0.3, color: [241, 196, 15] }, // Yellow
    { from: 0.4, color: [155, 89, 182] }, // Purple
    { from: 0.5, color: [230, 126, 34] }, // Orange
    { from: 0.6, color: [26, 188, 156] }, // Teal
    { from: 0.7, color: [52, 73, 94] }, // Dark Gray
    { from: 0.8, color: [189, 195, 199] }, // Light Gray
    { from: 0.9, color: [142, 68, 173] }  // Violet
  ]
})

component('green10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [208, 240, 192] },  // Tea Green
    { from: 0.1, color: [152, 255, 152] }, // Mint Green
    { from: 0.2, color: [163, 230, 53] }, // Lime Green
    { from: 0.3, color: [119, 221, 119] }, // Pastel Green
    { from: 0.4, color: [46, 204, 113] }, // Bright Green
    { from: 0.5, color: [46, 204, 64] }, // Emerald Green
    { from: 0.6, color: [0, 255, 127] }, // Spring Green
    { from: 0.7, color: [46, 139, 87] }, // Sea Green
    { from: 0.8, color: [34, 139, 34] }, // Forest Green
    { from: 0.9, color: [0, 100, 0] }  // Dark Green
  ]
})

component('gray5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [224, 224, 224] }, // Very Light Gray
    { from: 0.25, color: [189, 189, 189] }, // Light Gray
    { from: 0.5, color: [158, 158, 158] }, // Medium Gray
    { from: 0.75, color: [97, 97, 97] }, // Dark Gray
    { from: 1, color: [33, 33, 33] }  // Very Dark Gray
  ]
})

component('gray10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [245, 245, 245] }, // Very Light Gray
    { from: 0.1, color: [224, 224, 224] },
    { from: 0.2, color: [204, 204, 204] },
    { from: 0.3, color: [189, 189, 189] },
    { from: 0.4, color: [158, 158, 158] },
    { from: 0.5, color: [125, 125, 125] }, // Medium Gray
    { from: 0.6, color: [97, 97, 97] },
    { from: 0.7, color: [66, 66, 66] },
    { from: 0.8, color: [48, 48, 48] },
    { from: 0.9, color: [33, 33, 33] }  // Very Dark Gray
  ]
})

component('coolToWarm10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [44, 123, 182] }, // Deep Blue
    { from: 0.1, color: [83, 158, 204] }, // Blue
    { from: 0.2, color: [137, 196, 210] }, // Light Blue
    { from: 0.3, color: [171, 217, 233] }, // Very Light Blue
    { from: 0.4, color: [225, 238, 241] }, // Pale Cool
    { from: 0.5, color: [254, 224, 144] }, // Yellow
    { from: 0.6, color: [253, 174, 97] }, // Orange
    { from: 0.7, color: [244, 109, 67] }, // Light Red-Orange
    { from: 0.8, color: [215, 48, 39] }, // Red
    { from: 0.9, color: [165, 0, 38] }  // Deep Red
  ]
})
