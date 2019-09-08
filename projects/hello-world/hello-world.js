jb.component('people', { watchableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Marge Simpson" ,age: 38 , male: false, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Bart Simpson"  ,age: 12 , male: true, children: []}
]
})

jb.component('hello-world.main', { /* helloWorld.main */ 
  type: 'control',
  impl: group({
    controls: [label('hello world')]
  })
})
