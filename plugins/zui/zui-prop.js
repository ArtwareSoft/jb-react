jb.dsl('zui')

jb.component('adaptableText', {
  type: 'itemProp',
  params: [
    {id: 'att', as: 'text'},
    {id: 'val', dynamic: true, description: 'not needed if no calculation'},
    {id: 'priority', as: 'number', description: 'used by zui for scene enter order'}
  ],
  impl: (ctx, att, val) => {
      const items = ctx.vars.items
      if (val.profile)
        items.forEach(i=> i[att] = val(ctx.setData(i)))

      return {
        textSummaries: jb.zui.textSummaries,
        pivot() {
            items.sort((i1,i2) => i2[_att] - i1[_att] ).forEach((x,i) => x[`scale_${_att}`] = i/items.length)
            return { _att, scale: x => x[`scale_${_att}`] }
        } 
      }
  }
})

jb.extension('zui','prop', {
    pivot(items, att) {
        items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
        return { att, scale: x => x[`scale_${att}`] }
    },
    textSummaries(text) { // 31 floats = 1 + 2 + 4 + (4+4) + (4+4+4+4)
        const words = text.split(' ').filter(x=>x)
        const text2 = words.length < 2 ? text.slice(0,2) : words.slice(0,2).map(x=>x[0].toUpperCase()).join('')
        const text4 = words.length < 2 ? text.slice(0,4) : [words[0].slice(0,1), words[1].slice(0,2)].join(' ')
        const text8 = words.length < 2 ? text.slice(0,8) : [words[0].slice(0,3), words[1].slice(0,4)].join(' ')
        return [text2,text4,text8,text.slice(0,16), text.slice(0,32)]
    }     
})
