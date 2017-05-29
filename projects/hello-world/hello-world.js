jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [ 
    {$: 'label', title: 'a'},
    {$: 'label', title: 'b'},
  ]}
})


jb.component('hello-world.main2', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        style :{$: 'layout.horizontal', spacing: '66' }, 
        controls: [
          {$: 'label', title: '%$text%' }, 
          {$: 'editable-text', 
            title: 'text', 
            databind: '%$text%', 
            style :{$: 'editable-text.mdl-input' }
          }
        ]
      }, 
      {$: 'table', 
        items :{$: 'pipeline', 
          items: [
            '1,2,3', 
            {$: 'split', separator: ',', text: '%%' }, 
            {$: 'object', text: '%%' }
          ]
        }, 
        fields: [{$: 'field', title: 'name', data: '%text%' }]
      }
    ], 
    features :{$: 'var', name: 'text', value: 'hello world', mutable: 'true' }
  }
})
