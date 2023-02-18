jb.dsl('zui')

jb.component('preDefined', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text', mandatory: true},
  ],
  impl: (ctx, att) => {
    const res = (ctx.vars.itemProps || []).find(x=>x.att == att)
    if (!res && att)
      jb.logError(`preDefined itemProp - can not find ${att} in pre-defined props`,{att, itemProps: ctx.vars.itemProps, ctx})
    return res
  }
})

jb.component('adaptableText', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text', mandatory: true},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, features) => {
    if (calc.profile) // calculated attribute
      ctx.vars.items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      val: item => item.att,
      textSummaries2to32: item => jb.zui.textSummaries2to32(item[att]),
      pivots() { // create scale by string sort
          items.sort((i1,i2) => i1[att].localeCompare(i2) ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          return [{ att, scale: x => x[`scale_${att}`] }]
      }
    }
    features.forEach(f=>f.enrich(prop))
    return prop
  }
})

jb.component('numeric', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'features', type: 'prop_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx, att, calc, features) => {
    if (calc.profile) // calculated attribute
      ctx.vars.items.forEach(i=> i[att] = calc(ctx.setData(i)))

    const prop = {
      val: item => item.att,
      pivots() { // create scale by order
          items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
          return [{ att, scale: x => x[`scale_${att}`] }]
      }
    }
    features.forEach(f=>f.enrich(prop))
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