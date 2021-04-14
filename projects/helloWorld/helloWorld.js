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

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    controls: [
      text('hello world'),
      image({
        url: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png',
        width: '100',
        height: '66'
      })
    ]
  }),
})
