dsl('zui')

component('growingText', {
  type: 'view',
  params: [
    {id: 'text', dynamic: true, mandatory: true},
    {id: 'summary', type: 'summary', defaultValue: slice()},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'},
    {id: 'align', type: 'align_image', defaultValue: keepSize()},
    {id: 'minSize', mandatory: true, as: 'array', defaultValue: [0,0]}
  ],
  impl: firstToFit({
    views: [
      text('%$text()%', 32, { summary: '%$summary%', font: '%$font%', align: '%$align%' }),
      text('%$text()%', 16, { summary: '%$summary%', font: '%$font%', align: '%$align%' }),
      text('%$text()%', 8, { summary: '%$summary%', font: '%$font%', align: '%$align%' }),
      text('%$text()%', 4, { summary: '%$summary%', font: '%$font%', align: '%$align%' }),
      text('%$text()%', 2, { summary: '%$summary%', font: '%$font%', align: '%$align%' }),
      text('%$text()%', 1, { summary: '%$summary%', font: '%$font%', align: '%$align%' })
    ],
    layoutFeatures: minSize('%$minSize%')
  })
})

component('slice', {
  type: 'summary',
  impl: ctx => ({
    summary: (text, size,padding) => {
      const sliced = text.slice(0,size)
      if (!padding) return sliced
      const spaces = '                                                      '
      const paddingSize = size - sliced.length
      return (spaces.slice(0,paddingSize/2) + sliced + spaces.slice(0,1+ paddingSize/2)).slice(0,size)
    }
  })
})

component('zui.summary', {
  params: [
    {id: 'size', as: 'number', mandatory: true},
    {id: 'text', as: 'string', dynamic: true, mandatory: true},
    {id: 'summary', type: 'summary'},
    {id: 'padding', as: 'boolean', defaultValue: true},
  ],
  impl: (ctx,size, text,summary,padding) => summary.summary(text(ctx), size, padding)
})