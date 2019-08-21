jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);


jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'group', 
    style :{$: 'layout.horizontal', spacing: 3 }, 
    controls: [{$: 'label', title: 'hello world' }]
  }
})


jb.component('hello-world.main2', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        style :{$: 'layout.horizontal', spacing: '66' }, 
        controls: [
          {$: 'label', title: 'test' }, 
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
        fields: [
          {$: 'field', 
            title: 'name', 
            data :{
              $pipeline: [
                '%text%', 
                {$: 'object', huyt: '%%', blbl: '%%*2' }, 
                '%huyt%'
              ]
            }
          }, 
          {$: 'field.control', 
            control :{$: 'itemlist', 
              style :{$: 'itemlist.ul-li' }, 
              itemVariable: 'item'
            }
          }
        ]
      }, 
      {$: 'itemlist', 
        items: '%$people%', 
        controls: [
          {$: 'label', 
            title: '%name%', 
            style :{$: 'label.span' }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item'
      }
    ], 
    features :{$: 'variable', name: 'text', value: 'hello world', mutable: 'true' }
  }
})
