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
    layout: layout.vertical(),
    controls: [
      text({text: 'my text', title: 'my title'}),
      button({
        title: 'hey1',
        style: button.mdcFloatingAction(true),
        raised: '',
        features: [
          feature.icon({
            icon: 'SkipPreviousCircle',
            title: '',
            position: 'pre',
            type: 'mdi',
            scale: '1',
            style: icon.material(),
            features: watchRef({ref: '', allowSelfRefresh: true, strongRefresh: true})
          }),
          feature.icon({icon: 'delete', position: 'post', type: 'mdc'}),
          feature.icon({icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'}),
          watchRef({allowSelfRefresh: false})
        ]
      })
    ],
    features: css.width('600')
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
