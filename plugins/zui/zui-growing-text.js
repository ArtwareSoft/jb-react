dsl('zui')

component('growingText', {
  type: 'view',
  params: [
    {id: 'text', dynamic: true, mandatory: true},
    {id: 'summary', type: 'summary', defaultValue: slice()},
    {id: 'fontSize', as: 'number', defaultValue: 16},
    {id: 'fontWidth', as: 'number', defaultValue: 10}
  ],
  impl: firstToFit(
    image(imageOfText(zui.summary(64,'%$text()%','%$summary%')), { preferedSize: [640,16], minSize: [321,16] }),
    image(imageOfText(zui.summary(32,'%$text()%','%$summary%')), { preferedSize: [320,16], minSize: [161,16] }),
    image(imageOfText(zui.summary(16,'%$text()%','%$summary%')), { preferedSize: [160,16], minSize: [81,16] }),
    image(imageOfText(zui.summary(8,'%$text()%','%$summary%')), { preferedSize: [80,16], minSize: [41,16] }),
    image(imageOfText(zui.summary(4,'%$text()%','%$summary%')), { preferedSize: [40,16], minSize: [21,16] }),
    image(imageOfText(zui.summary(2,'%$text()%','%$summary%')), { preferedSize: [20,16], minSize: [11,16] }),
    image(imageOfText(zui.summary(1,'%$text()%','%$summary%')), { preferedSize: [10,16], minSize: [10,16] }),
  )
})

component('slice', {
  type: 'summary',
  impl: ctx => ({
    summary: (text, size) => {
      const padding = '                                                      '
      const sliced = text.slice(0,size)
      const paddingSize = size - sliced.length
      return (padding.slice(0,paddingSize/2) + sliced + padding.slice(0,1+ paddingSize/2)).slice(0,size)
    }
  })
})

component('zui.summary', {
  params: [
    {id: 'size', as: 'number', mandatory: true},
    {id: 'text', as: 'string', dynamic: true, mandatory: true},
    {id: 'summary', type: 'summary'},
  ],
  impl: (ctx,size, text,summary) => summary.summary(text(ctx), size)
})