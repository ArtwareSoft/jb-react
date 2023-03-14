jb.dsl('zui')

jb.component('byName', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string', mandatory: true, defaultValue: ''},
  ],
  impl: (ctx, att) => {
    const res = (ctx.vars.itemProps || []).find(x=>x.att == att)
    if (!res && att)
      jb.logError(`preDefined itemProp - can not find ${att} in pre-defined props`,{att, itemProps: ctx.vars.itemProps, ctx})
    return res
  }
})

jb.component('text', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string', mandatory: true},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, features) => {
    const items = ctx.vars.items
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      asText: item => item[att],
      pivots() { // create scale by string sort
          items.sort((i1,i2) => i1[att].localeCompare(i2) ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          return [{ att, scale: x => x[`scale_${att}`] , preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

jb.component('numeric', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'string'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'prefix', as: 'string', description: 'e.g. $'},
    {id: 'suffix', as: 'string', description: 'e.g. meter'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, prefix, suffix, features) => {
    const items = ctx.vars.items
    if (calc.profile) // calculated attribute
      items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      att,
      val: item => item[att],
      asText: item => prefix + item[att] + suffix,
//      textSummaries2to32: item => jb.zui.textSummaries2to32(prefix + item[att]),
      pivots() { // create scale by order
          items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          return [{ att, scale: x => x[`scale_${att}`], preferedAxis: this.preferedAxis }]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

jb.component('priorty', {
  type: 'prop_feature',
  params: [
    {id: 'priority', mandatory: true, as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({
    enrich(obj) { obj.priority = priority}
  })
})

jb.component('preferedAxis', {
  type: 'prop_feature',
  params: [
    {id: 'axis', mandatory: true, as: 'string', options: 'x,y'}
  ],
  impl: (ctx,axis) => ({
    enrich(obj) { obj.preferedAxis = axis}
  })
})