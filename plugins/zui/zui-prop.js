dsl('zui')

component('byName', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string', mandatory: true, defaultValue: ''}
  ],
  impl: (ctx, att) => {
    const res = (ctx.vars.itemProps || []).find(x=>x.att == att)
    if (!res && att)
      jb.logError(`preDefined itemProp - can not find ${att} in pre-defined props`,{att, itemProps: ctx.vars.itemProps, ctx})
    return res
  }
})

component('text', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string', mandatory: true},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, features) => {
    const items = ctx.vars.items || []
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      asText: item => item[att],
      pivots() { // create scale by string sort
        return []
          // items.sort((i1,i2) => i1[att].localeCompare(i2[att]) ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          // return [{ att, scale: x => x[`scale_${att}`] , preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('numeric', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'prefix', as: 'string', description: 'e.g. $'},
    {id: 'suffix', as: 'string', description: 'e.g. meter'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, prefix, suffix, features) => {
    const items = ctx.vars.items || []
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      asText: item => prefix + item[att] + suffix,
      pivots({DIM} = {}) { // create scale by order
          const spaceFactor = Math.floor(DIM / Math.sqrt(items.length))
          items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          const range = [items[0][att] || 0,items.slice(-1)[0][att] || 0]
          return [{ att, spaceFactor, scale: x => x[`scale_${att}`], linearScale: item=> ((+item[att] || 0)-range[0])/(range[1]-range[0]) , preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('geo', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, features) => {
    const items = ctx.vars.items

    const prop = {
      att,
      val: item => item[att],
      asText: item => ''+item[att],
      pivots({DIM} = {}) { // create scale by order
          //const spaceFactor = Math.floor(DIM / Math.sqrt(items.length))
          items.sort((i1,i2) => i1[att] - i2[att] )
          const from = items[0][att], to = items[items.length-1][att], range = to - from
          items.forEach((x) => x[`scale_${att}`] = (x[att] - from) / range)
          return [{ att, spaceFactor:1, scale: x => x[`scale_${att}`], linearScale: item=> ((+item[att] || 0)-range[0])/(range[1]-range[0]) , preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('xyByIndex', {
  type: 'itemProp',
  params: [
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx,features) => {
    const items = ctx.vars.items
    const dim = Math.ceil(Math.sqrt(items.length))
    items.map((item,i) => {item.x = (i % dim)/dim; item.y = Math.floor(i / dim)/dim })

    const prop = {
      val: item => [item.x,item.y],
      asText: item => [item.x,item.y].join(','),
      pivots({DIM} = {}) { // create scale by order
        const spaceFactor = Math.floor(DIM / dim)
        if (spaceFactor == 0)
          jb.logError('xyByIndex, DIM too low',{DIM,dim,ctx})
        return [
            { att: 'x', spaceFactor , scale: item => item.x, preferedAxis: 'x' },
            { att: 'y', spaceFactor , scale: item => item.y, preferedAxis: 'y' }            
        ]
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
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: green()}
  ],
  impl: (ctx,colorScale) => ({
    enrich(obj) { obj.colorScale = colorScale}
  })
})

component('red', {
  type: 'color_scale',
  impl: () => x => [x,0,0]
})
component('green', {
  type: 'color_scale',
  impl: () => x => [0,x,0]
})
component('blue', {
  type: 'color_scale',
  impl: () => x => [0,0,x]
})