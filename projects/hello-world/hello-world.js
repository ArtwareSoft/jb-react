jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);


jb.component('hello-world.main', {
  type: 'control', 
  impl :{$: 'group', 
    style :{$: 'layout.horizontal', spacing: 3 }, 
    controls: [
      {$: 'label', title: 'hello world' }, 
      {$: 'control.first-succeeding', 
        controls: [
          {$: 'control-with-condition', 
            condition: '%$state%', 
            control: [
              {$: 'editable-boolean', 
                databind: '%$state%', 
                style :{$: 'editable-boolean.checkbox' }, 
                textForTrue: 'yes', 
                textForFalse: 'no'
              }
            ]
          }, 
          {$: 'editable-boolean', 
            style :{$: 'editable-boolean.checkbox' }, 
            textForTrue: 'yes', 
            textForFalse: 'no'
          }
        ], 
        style :{$: 'first-succeeding.style' }
      }
    ], 
    features :{$: 'var', name: 'state', mutable: true }
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
jb.component("hello-world.xx",
  {
    type: 'control', 
    impl :{$: 'group', 
      style :{$: 'layout.horizontal', spacing: '66' }, 
      controls: [
        group({
          style: layout_horizontal('66'),
          controls: [
            group({
              controls: [
                editableText({databind: '%$gender%'}),
                button({title: 'female', action: writeValue('%$gender%', 'female'), features: id('female')}),
                button({title: 'zee', action: writeValue('%$gender%', 'zee'), features: id('zee')}),
                button({title: 'male', action: writeValue('%$gender%', 'male'), features: id('male')}),
                control_firstSucceeding({
                  controls: [
                    controlWithCondition('%$gender% == \"male\"', label('male')),
                    label('not male')
                  ],
                  features: firstSucceeding_watchRefreshOnCtrlChange('%$gender%')
                })
              ],
              features: variable({name: 'gender', value: 'male', mutable: true})
            }),
            group({
              controls: [
                label({title: 'is male %$male%', style: label_span(), features: watchRef('%$male%')}),
                button({title: 'female', action: writeValue('%$male%', false)}),
                button({title: 'male', action: writeValue('%$male%', true)}),
                control_firstSucceeding({
                  controls: [
                    controlWithCondition('%$male%', label('male')),
                    label('not male')
                  ],
                  features: firstSucceeding_watchRefreshOnCtrlChange('%$male%')
                })
              ],
              features: variable({name: 'male', value: true, mutable: true})
            })
          ]
        })
      ]
    }
  }
)