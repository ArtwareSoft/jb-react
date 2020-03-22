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
    layout: layout.vertical(),
    controls: [
      text({text: 'hi there', title: 'my title'})
    ],
    features: css.width('400')
  })
})
