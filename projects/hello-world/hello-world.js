jb.ns('helloWorld')
jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    layout: layout.vertical(),
    controls: [
      text({text: pipeline('%$people[0]/name%'), title: ''})
    ]
  })
})

jb.component('data-resource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homedsf ds r',
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

