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
    layout: layout.grid({
      columnSizes: list(286, 50, 269, 247, 311),
      rowSizes: list('70'),
      columnGap: ''
    }),
    controls: [
      text({text: 'my text', title: 'my title'}),
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
