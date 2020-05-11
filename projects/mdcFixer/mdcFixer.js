jb.ns('mdcFixer')

jb.component('mdcFixer.main', {
  type: 'control',
  impl: group({
    controls: [
      button('my button'),
      itemlist({
        title: '',
        items: pipeline(mdcFixer.rgbas(), sort('color')),
        controls: [
          text({text: '%color%', title: 'color', features: field.columnWidth('50')}),
          text({text: '%op%', title: 'opacity', features: field.columnWidth('50')})
        ],
        style: table.mdc(),
        visualSizeLimit: '50',
        features: css.width('200')
      })
    ]
  })
})

jb.component('mdcFixer.rgbas', {
  type: 'data',
  impl: pipeline(
    '%$cssContent%',
    extractText({startMarkers: 'rgba(', endMarker: ')', repeating: true}),
    unique(),
    obj(
        prop('color', pipeline(split({}), slice('0', '3'), join(','))),
        prop('op', split({part: 'last'}))
      )
  )
})
