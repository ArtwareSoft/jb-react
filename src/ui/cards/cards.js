jb.ns('image,card,card-filter,card-list,card-properties')

jb.component('card', {
  type: 'control',
  params: [
    {id: 'data'},
    {id: 'style', type: 'card.style', dynamic: true},
    {id: 'adapter', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,data,style,adapter) => style(ctx.setData(adapter(ctx.setData(data)))).jbExtend({ctxForPick: ctx },ctx)
})

jb.component('cardFilter', {
  type: 'control',
  params: [
    {id: 'data'},
    {id: 'style', type: 'card-filter.style', dynamic: true}
  ],
  impl: (ctx,data,style) => style(ctx.setData(data)).jbExtend({ctxForPick: ctx },ctx)
})

jb.component('cardList', {
  type: 'control',
  params: [
    {id: 'data'},
    {id: 'style', type: 'card-list.style', dynamic: true},
    {id: 'adapter', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,data,style,adapter) => style(adapter(ctx.setData(data))).jbExtend({ctxForPick: ctx },ctx)
})


jb.component('card.properties', {
  type: 'control',
  params: [
    {id: 'style', type: 'card-properties.style', defaultValue: cardProperties.simple(), dynamic: true}
  ],
  impl: (ctx,style) => style().jbExtend({ctxForPick: ctx },ctx)
})

jb.component('cardProperties.simple', {
  type: 'card-properties.style',
  impl: group({
    title: 'metadata',
    layout: layout.horizontal('20'),
    controls: [
      text({
        text: formatDate({date: '%_updatedDate%', dateStyle: 'medium'}),
        title: 'time'
      }),
      text({text: '•', title: 'bullet sign'}),
      text({text: '1 min', title: 'timeToRead'})
    ],
    features: css('font: 12px proxima-n-w01-reg, sans-serif')
  })
})
