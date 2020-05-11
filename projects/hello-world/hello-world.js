jb.ns('helloWorld')

jb.component('dataResource.people', {
  watchableData: [
    {
      name: 'Homer asdas',
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

jb.component('dataResource.room', {
  passiveData: ''
})

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.flex({}),
    controls: [
      text('%$people/age%'),
      button({
        title: 'click me',
        action: openDialog({
          style: dialog.default(),
          content: group({
            controls: [
              text({text: 'my text', title: 'my title'})
            ]
          }),
          title: 'asdqwsa'
        })
      })
    ],
    features: css.color({})
  })
})


jb.component('dataResource.studio', {
  watchableData: {
    libToAdd: 'inner-html',
    libsAsArray: ['common', 'ui-common', 'material', 'dragula', 'md-icons']
  }
})

