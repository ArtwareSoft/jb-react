jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        title: 'text', 
        databind: '%$text%', 
        style :{$: 'editable-text.mdl-input' }
      }, 
      {$: 'label', title: '%$text%' }
    ], 
    features :{$: 'var', name: 'text', value: 'hello world', mutable: 'true' }
  }
})
