dsl('zui')

component('byName', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string', mandatory: true, defaultValue: ''}
  ],
  impl: (ctx, att) => {
    const res = (ctx.vars.prepareProps || []).find(x=>x.att == att)
    if (!res && att)
      jb.logError(`preDefined itemProp - can not find ${att} in pre-defined props`,{att, prepareProps: ctx.vars.prepareProps, ctx})
    return res
  }
})

component('numeric', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'prefix', as: 'string', description: 'e.g. $'},
    {id: 'suffix', as: 'string', description: 'e.g. meter'},
    {id: 'features', type: 'prop_feature[]', dynamic: true}
  ],
  impl: (ctx, att, calc, prefix, suffix, features) => {
    const DIM = ctx.vars.DIM
    const items = ctx.vars.items || []
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      asText: item => prefix + item[att] + suffix,
      pivots() { // create scale by order
          if (this._pivots) return this._pivots
          const spaceFactor = Math.floor(DIM / Math.sqrt(items.length))
          items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          const range = [items[0][att] || 0,items.slice(-1)[0][att] || 0]
          if (range[0] == range[1])
            jb.logError(`zui empty range for ${att}`,{ctx})
          const linearScale = range[0] == range[1] ? () => 0 : item=> ((+item[att] || 0)-range[0])/(range[1]-range[0])
          return this._pivots = [
            { att, spaceFactor, 
              scale: x => x[`scale_${att}`], 
              linearScale, 
              preferedAxis: this.preferedAxis 
            }
          ]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('enumarator', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
  ],
  impl: (ctx, att, calc) => {
    const DIM = ctx.vars.DIM
    const items = ctx.vars.items || []
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      pivots() { // create scale by order
          if (this._pivots) return this._pivots
          const domain = jb.utils.unique(items.map(item=>item[att]))
          const linearScale = item => domain.indexOf(item[att]) / (domain.length-1)
          return this._pivots = [ { att, linearScale } ]
      }
    }
    return prop
  }
})

component('geo', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'features', type: 'prop_feature[]', dynamic: true}
  ],
  impl: (ctx, att, features) => {
    const items = ctx.vars.items

    const prop = {
      att,
      val: item => item[att],
      asText: item => ''+item[att],
      pivots() { // create scale by order
          if (this._pivots) return this._pivots
          //const spaceFactor = Math.floor(DIM / Math.sqrt(items.length))
          items.sort((i1,i2) => i1[att] - i2[att] )
          const from = items[0][att], to = items[items.length-1][att], range = to - from
          items.forEach((x) => x[`scale_${att}`] = (x[att] - from) / range)
          return this._pivots = [{ att, spaceFactor:0.999, scale: x => x[`scale_${att}`], linearScale: item=> ((+item[att] || 0)-range[0])/(range[1]-range[0]) , preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('priorty', {
  type: 'prop_feature',
  params: [
    {id: 'priority', mandatory: true, as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({
    enrich(obj) { obj.priority = priority}
  })
})

component('preferedAxis', {
  type: 'prop_feature',
  params: [
    {id: 'axis', mandatory: true, as: 'string', options: 'x,y'}
  ],
  impl: (ctx,axis) => ({
    enrich(obj) { obj.preferedAxis = axis}
  })
})

component('colorScale', {
  type: 'prop_feature',
  params: [
    {id: 'colorScale', mandatory: true, type: 'color_scale' }
  ],
  impl: (ctx,colorScale) => ({
    enrich(obj) { obj.colorScale = colorScale}
  })
})

component('white', {
  type: 'color_scale',
  impl: () => x => [255,255,255]
})

component('black', {
  type: 'color_scale',
  impl: () => x => [0,0,0]
})

component('reds', {
  type: 'color_scale',
  impl: () => x => [x,0,0]
})
component('greens', {
  type: 'color_scale',
  impl: () => x => [0,x,0]
})
component('blues', {
  type: 'color_scale',
  impl: () => x => [0,0,x]
})