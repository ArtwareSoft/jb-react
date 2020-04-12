jb.ns('helloWorld')

jb.component('dataResource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homer Simpson1',
      age: 42,
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: 38,
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: 12, male: false, children: []}
  ]
})

jb.component('dataResource.room', { /* dataResource.room */
  passiveData: ''
})

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical('20'),
    controls: [
      text({
        text: 'my text',
        title: 'my title',
        style: styleByControl(
          group({
            title: 'div',
            style: group.htmlTag('div'),
            controls: [
              text({
                text: '%$textModel/text%',
                features: [
                  css.layout('position: relative;display: flex;flex-direction: column'),
                  css.padding({top: '1rem', left: '1rem', right: '3rem', bottom: '1rem'}),
                  css.detailedBorder('border-bottom: 1px solid rgb(3, 181, 210)'),
                  css.detailedColor(
                    'color: rgb(3, 181, 210);background-color: rgb(255, 255, 255)'
                  ),
                  css.typography(
                    'font-size: 1.15rem;font-weight: 400;font-family: Hind, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;text-align: start;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;text-decoration-style: initial;text-decoration-color: initial'
                  ),
                  css(
                    '-webkit-box-orient: vertical;-webkit-box-direction: normal;cursor: pointer;letter-spacing: normal;orphans: 2;white-space: normal;widows: 2;word-spacing: 0px'
                  )
                ]
              })
            ],
            features: []
          }),
          'textModel'
        )
      }),
      text({
        text: 'my text',
        title: 'my title',
        features: css.gridArea('grid-area: 1 / 4')
      })
    ]
  })
})

jb.component('helloWorld.f1', {
  type: 'data',
  impl: pipeline(
    'dsdsds',
    'bbbb'
  ),
  testData: 'asdsaasd asdas'
})

jb.component('dataResource.projectSettings', {
  watchableData: {
    project: 'itemlists',
    libs: 'common,ui-common,material,dragula,md-icons',
    jsFiles: ['file23.js', 'file.js', 'file.js']
  }
})

jb.component('dataResource.studio', {
  watchableData: {
    libToAdd: 'inner-html',
    libsAsArray: ['common', 'ui-common', 'material', 'dragula', 'md-icons']
  }
})
