dsl('zui')

component('rgb', {
  type: 'static_color',
  macroByValue: true,
  params: [
    {id: 'r', as: 'number', mandatory: true},
    {id: 'g', as: 'number', mandatory: true},
    {id: 'b', as: 'number', mandatory: true}
  ],
  impl: (ctx,r,g,b) => [r,g,b]
})

component('color', {
  type: 'feature',
  params: [
    {id: 'of', as: 'string', options: 'fill,background,border,text', mandatory: true},
    {id: 'color', mandatory: true, as: 'string', defaultValue: 'white'}
  ],
  impl: uniforms(vec3('%$of%Color', ({},{},{color}) => jb.zui.colorToRgb(color) ))
})

component('itemColor', {
  type: 'item_color',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: (ctx,unitScale,colorScale) => ctx => {
        const index = Math.floor(unitScale(ctx.data) * colorScale.length *0.9999)
        const color = colorScale[index] ? colorScale[index] : [255,255,255]
        return ctx.vars.widget.htmlMode ? `rgb(${color.join(',')})` : color
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
      return ctx.vars.widget.htmlMode ? `rgb(${color.join(',')})` : color
    }
  }
})

component('Case', {
  type: 'item_color_case',
  params: [
    {id: 'val', as: 'string', mandatory: true},
    {id: 'color', type: 'static_color'}
  ],
  impl: (ctx,val,color) => ({entry: [val,jb.zui.colorToRgb(color)]})
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
