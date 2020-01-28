jb.ns('helloWorld')
jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    layout: layout.vertical(),
    controls: [
      text({
        text: '%$people/name%',
        features: [css.height(309), css.padding({top: 0, left: 25}), css.width(663)]
      }),
      text({text: 'my text', title: 'my title'})
    ]
  })
})

jb.component('data-resource.people', { /* dataResource.people */
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


jb.component('data-resource.room', { /* dataResource.room */
  passiveData: ''
})
