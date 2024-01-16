using('ui')
component('dataResource.people', {
  watchableData: [
    {
      name: 'Homer',
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

component('helloWorld.main', {
  type: 'control',
  impl: group({
    controls: [
      text('Hello World')
    ]
  })
})

component('helloWorld.data1', {
  impl: pipeline('a')
})