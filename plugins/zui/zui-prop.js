jb.dsl('zui')

jb.component('adaptableText', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'priority', as: 'number', description: 'used by zui for scene enter order'}
  ],
  impl: (ctx, att, calc, priority) => {
      const items = ctx.vars.items
      if (calc.profile) // calculated attribute
        items.forEach(i=> i[att] = calc(ctx.setData(i)))

      return {
        val: item => item.att,
        textSummaries2to32: item => jb.zui.textSummaries2to32(item[att]),
        pivot() { // create scale by order
            items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
            return { att, scale: x => x[`scale_${att}`] }
        },
        priority
      }
  }
})

jb.component('numeric', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text'},
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
    {id: 'priority', as: 'number', description: 'used by zui for scene enter order'}
  ],
  impl: (ctx, att, calc, priority) => {
      const items = ctx.vars.items
      if (calc.profile) // calculated attribute
        items.forEach(i=> i[att] = +calc(ctx.setData(i)))

      return {
        val: item => item.att,
        pivot() { // create scale by order
            items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
            return { att, scale: x => x[`scale_${att}`] }
        },
        priority
      }
  }
})
