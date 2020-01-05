jb.ns('helloWorld')
jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    layout: layout.grid({columnSizes: list('200', '100', 'auto')}),
    controls: [
      itemlist({
        title: '',
        items: '%$people%',
        controls: [
          text({text: '%name%', title: 'my title'})
        ]
      })
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

