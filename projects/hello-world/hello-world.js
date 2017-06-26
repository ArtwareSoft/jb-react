jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);


jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'group', 
    title: '%$people%', 
    controls: [
      {$: 'label', title: 'a' }, 
      {$: 'label', title: 'b' }, 
      {$: 'group', 
        controls: [
          {$: 'control-by-condition', 
            controls: [
              {$: 'control-with-condition', 
                condition: '%$gender% == "male"', 
                control :{$: 'label', title: 'male' }
              }, 
              {$: 'control-with-condition', 
                condition: '%$gender% != "male"', 
                control :{$: 'label', title: 'female' }
              }
            ], 
            default :{$: 'label', title: 'default' }
          }
        ], 
        features: [{$: 'var', name: 'gender', value: 'male' }]
      }
    ]
  }
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
