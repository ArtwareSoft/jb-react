jb.component('hello-world.main', { /* helloWorld.main */ 
  type: 'control',
  impl: group({
    controls: [label('hello world')]
  })
})
