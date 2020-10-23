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

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    title: 'hello',
    style: group.sections({sectionStyle: group.sectionExpandCollopase()}),
    controls: [
      group({
        title: 'section1',
        controls: [
          text('hello world', 'hey')
        ]
      }),
      group({
        title: 'section2',
        controls: [
          text('hello world', 'hey')
        ]
      })
    ]
  })
})
