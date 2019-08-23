



jb.resource('to_do_list',[
  { "task": "eat" ,completed: false },
  { "task": "fly" ,completed: false },
  { "task": "drink" ,completed: true }
]);
jb.resource('todo_list',[
]);


jb.component('try.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'editable-text', 
        title: 'text', 
        databind: '%$input%', 
        updateOnBlur: 'false', 
        style :{$: 'editable-text.input' }, 
        features: [
          {$: 'feature.onEnter', 
            event: 'keypress', 
            action :{
              $runActions: [
                {$: 'add-to-array', 
                  array: '%$todo_list%', 
                  itemsToAdd :{
                    $obj: [
                      {$: 'prop', title: 'task', val: '%$input%', type: 'string' }, 
                      {$: 'prop', title: 'completed', val: 'false', type: 'boolean' }
                    ]
                  }
                }, 
                {$: 'refresh-control-by-id', id: 'list' }, 
                {$: 'write-value', to: '%$input%' }
              ]
            }
          }, 
          {$: 'feature.onEvent', 
            event: 'blur', 
            action :{$: 'write-value', 
              content :{$: 'group' }, 
              title: 'hey', 
              style :{$: 'dialog.default' }, 
              to: '%$input%', 
              value: ''
            }
          }
        ]
      }, 
      {$: 'itemlist', 
        items: '%$todo_list%', 
        controls: [
          {$: 'group', 
            title: 'switch first succeeding', 
            style :{$: 'layout.horizontal', spacing: 3 }, 
            controls: [
              {$: 'editable-boolean', 
                databind: '%completed%', 
                style :{$: 'editable-boolean.checkbox' }, 
                title: 'completed', 
                textForTrue: 'yes', 
                textForFalse: 'no'
              }, 
              {$: 'control.first-succeeding', 
                controls: [
                  {$: 'control-with-condition', 
                    condition :{$: 'equals', item1: '%$state%', item2: 'label' }, 
                    control :{$: 'label', 
                      title: '%task%', 
                      style :{$: 'label.span' }, 
                      features: [
                        {$: 'feature.onEvent', 
                          event: 'dblclick', 
                          action :{$: 'write-value', to: '%$state%', value: 'text' }
                        }
                      ]
                    }, 
                    title: 'label task'
                  }, 
                  {$: 'editable-text', 
                    title: 'task editable', 
                    databind: '%task%', 
                    updateOnBlur: true, 
                    style :{$: 'editable-text.input' }, 
                    features: [
                      {$: 'feature.onEvent', 
                        event: 'blur', 
                        action :{$: 'write-value', to: '%$state%', value: 'label' }
                      }
                    ]
                  }
                ], 
                title: 'switch', 
                style :{$: 'first-succeeding.style' }, 
                features: [{$: 'watch-ref', ref: '%$state%', allowSelfRefresh: 'true' }]
              }
            ], 
            features :{$: 'var', name: 'state', value: 'label', mutable: true }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: '%$todo_list%', 
        features :{$: 'id', id: 'list' }
      }, 
      {$: 'group', 
        $disabled: true, 
        title: 'switch-hidden', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'label', 
            title: 'my label', 
            style :{$: 'label.span' }, 
            features: [
              {$: 'feature.onEvent', 
                event: 'dblclick', 
                action :{$: 'write-value', to: '%$filterBy%', value: 'text' }
              }, 
              {$: 'hidden', 
                showCondition :{$: 'equals', item1: '%$filterBy%', item2: 'label' }
              }, 
              {$: 'watch-ref', ref: '%$filterBy%', allowSelfRefresh: true }
            ]
          }, 
          {$: 'editable-text', 
            databind: '%$input%', 
            style :{$: 'editable-text.input' }, 
            features: [
              {$: 'feature.onEvent', 
                event: 'blur', 
                action :{
                  $runActions: [
                    {$: 'write-value', to: '%$filterBy%', value: 'label' }, 
                    {$: 'open-dialog', 
                      $disabled: true, 
                      content :{$: 'label', title: 'my label' }
                    }, 
                    {$: 'write-value', to: '%$input%', value: 'wow' }
                  ]
                }
              }, 
              {$: 'hidden', 
                showCondition :{$: 'equals', item1: 'text', item2: '%$filterBy%' }
              }, 
              {$: 'watch-ref', ref: '%$filterBy%', allowSelfRefresh: true }
            ]
          }
        ]
      }, 
      {$: 'label', 
        title :{$: 'json.stringify', value: '%$todo_list%' }, 
        style :{$: 'label.span' }, 
        features: [{$: 'id', id: 'show' }]
      }
    ], 
    features: [
      {$: 'var', name: 'filterBy', value: 'label', mutable: true }, 
      {$: 'var', name: 'input', value: 'hey', mutable: true }, 
      {$: 'var', name: 'todolist', value: '', mutable: true }
    ]
  }
})

jb.component('try.classes', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'classes', 
    controls: [
      {$: 'label', 
        title: 'todos', 
        style :{$: 'label.h1' }
      }, 
      {$: 'group', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'editable-boolean', 
            databind :{$: 'try.status' }, 
            style :{$: 'editable-boolean.checkbox' }, 
            textForTrue: 'yes', 
            textForFalse: 'no', 
            features: [
              {$: 'id', id: 'status' }, 
              {$: 'feature.onEvent', 
                event: 'change', 
                action :{
                  $runActions: [
                    {$: 'action.if', 
                      condition :{$: 'equals', 
                        item1 :{$: 'try.status' }, 
                        item2: true
                      }, 
                      then :{
                        $runActions: [
                          {$: 'run-action-on-items', 
                            items: '%$todo_list%', 
                            action :{$: 'write-value', to: '%completed%', value: false }
                          }
                        ]
                      }
                    }, 
                    {$: 'action.if', 
                      condition :{$: 'equals', 
                        item1 :{$: 'try.status' }, 
                        item2: false
                      }, 
                      then :{$: 'run-action-on-items', 
                        items: '%$todo_list%', 
                        action :{$: 'write-value', to: '%completed%', value: true }
                      }
                    }, 
                    {$: 'refresh-control-by-id', id: 'counter' }
                  ]
                }
              }
            ]
          }, 
          {$: 'editable-text', 
            title: 'text', 
            databind: '%$input%', 
            style :{$: 'editable-text.input' }, 
            features :{$: 'feature.onEnter', 
              event: 'keypress', 
              action :{
                $runActions: [
                  {$: 'add-to-array', 
                    array: '%$todo_list%', 
                    itemsToAdd :{
                      $obj: [
                        {$: 'prop', title: 'task', val: '%$input%', type: 'string' }, 
                        {$: 'prop', title: 'completed', val: '', type: 'boolean' }
                      ]
                    }
                  }, 
                  {$: 'write-value', to: '%$input%' }, 
                  {$: 'refresh-control-by-id', id: 'counter' }
                ]
              }
            }
          }
        ]
      }, 
      {$: 'itemlist', 
        items :{$: 'try.todofilters1' }, 
        controls: [
          {$: 'group', 
            title: 'item', 
            style :{$: 'layout.horizontal', spacing: 3 }, 
            controls: [
              {$: 'editable-boolean', 
                databind: '%completed%', 
                title: '', 
                textForTrue: 'yes', 
                textForFalse: 'no', 
                features :{$: 'feature.onEvent', 
                  event: 'change', 
                  action :{
                    $runActions: [
                      {$: 'refresh-control-by-id', id: 'todolist' }, 
                      {$: 'refresh-control-by-id', id: 'counter' }
                    ]
                  }
                }
              }, 
              {$: 'control.first-succeeding', 
                controls: [
                  {$: 'control-with-condition', 
                    condition :{$: 'equals', item1: '%$state%', item2: 'label' }, 
                    control :{$: 'label', 
                      title: '%task%', 
                      style :{$: 'label.span' }, 
                      features: [
                        {$: 'feature.onEvent', 
                          event: 'dblclick', 
                          action :{$: 'write-value', to: '%$state%', value: 'text' }
                        }
                      ]
                    }, 
                    title: 'label task'
                  }, 
                  {$: 'editable-text', 
                    title: 'task editable', 
                    databind: '%task%', 
                    updateOnBlur: true, 
                    style :{$: 'editable-text.input' }, 
                    features: [
                      {$: 'feature.onEvent', 
                        event: 'blur', 
                        action :{$: 'write-value', to: '%$state%', value: 'label' }
                      }
                    ]
                  }
                ], 
                title: 'switch', 
                style :{$: 'first-succeeding.style' }, 
                features: [{$: 'watch-ref', ref: '%$state%', allowSelfRefresh: 'true' }]
              }, 
              {$: 'button', 
                title: 'delete', 
                action :{
                  $runActions: [
                    {$: 'splice', 
                      array: '%$todo_list%', 
                      fromIndex :{$: 'index-of', array: '%$todo_list%', item: '%$item%' }, 
                      noOfItemsToRemove: '1', 
                      itemsToAdd: []
                    }, 
                    {$: 'refresh-control-by-id', id: 'counter' }
                  ]
                }, 
                style :{$: 'table-button.href' }
              }
            ], 
            features :{$: 'var', name: 'state', value: 'label', mutable: true }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item', 
        features: [
          {$: 'watch-ref', ref: '%$todo_list%', includeChildren: 'true', allowSelfRefresh: 'true' }, 
          {$: 'watch-ref', ref: '%$filterby%', allowSelfRefresh: true }, 
          {$: 'id', id: 'todolist' }
        ]
      }, 
      {$: 'group', 
        title: 'footer', 
        style :{$: 'try.footer', leftWidth: 200, rightWidth: 200, spacing: 3 }, 
        controls: [
          {$: 'label', 
            title :{
              $pipeline: [
                '%$todo_list%', 
                {$: 'filter', 
                  filter :{ $not: '', of: '%completed%' }
                }, 
                {$: 'count', items: '%%' }, 
                '%% item left'
              ]
            }, 
            style :{$: 'label.span' }, 
            features: [
              {$: 'watch-ref', ref: '$todo_list%', includeChildren: true }, 
              {$: 'id', id: 'counter' }, 
              {$: 'css.class', class: 'todo-count' }
            ]
          }, 
          {$: 'group', 
            title: 'ul', 
            style :{$: 'group.ul-li' }, 
            controls: [
              {$: 'button', 
                title: 'all', 
                action :{$: 'write-value', to: '%$filterby%', value: 'all' }, 
                style :{$: 'table-button.href' }, 
                features :{$: 'conditional-class', 
                  cssClass: 'selected', 
                  condition :{$: 'equals', item1: '%$filterby%', item2: 'all' }
                }
              }, 
              {$: 'button', 
                title: 'active', 
                action :{$: 'write-value', to: '%$filterby%', value: 'active' }, 
                style :{$: 'table-button.href' }, 
                features :{$: 'conditional-class', 
                  cssClass: 'selected', 
                  condition :{$: 'equals', item1: '%$filterby%', item2: 'active' }
                }
              }, 
              {$: 'button', 
                title: 'completed', 
                action :{$: 'write-value', to: '%$filterby%', value: 'completed' }, 
                style :{$: 'table-button.href' }, 
                features :{$: 'conditional-class', 
                  cssClass: 'selected', 
                  condition :{$: 'equals', item1: '%$filterby%', item2: 'completed' }
                }
              }
            ], 
            features: [
              {$: 'css.class', class: 'filters' }, 
              {$: 'watch-ref', ref: '%$filterby%', allowSelfRefresh: true }
            ]
          }, 
          {$: 'button', 
            title: 'delete all', 
            action :{$: 'run-action-on-items', 
              items :{$: 'try.completed1', 
                $pipeline: [
                  '%$to_do_list%', 
                  {$: 'filter', filter: '%completed%' }
                ]
              }, 
              action :{$: 'splice', 
                array: '%$todo_list%', 
                fromIndex :{$: 'index-of', array: '%$todo_list%', item: '%%' }, 
                noOfItemsToRemove: '1', 
                itemsToAdd: []
              }
            }, 
            style :{$: 'table-button.href' }, 
            features: [
              {$: 'hidden', 
                showCondition :{$: 'not-equals', 
                  item :{$: 'try.completed' }, 
                  item2 :{$: 'try.completed1' }
                }
              }, 
              {$: 'watch-ref', ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: '' }, 
              {$: 'css.class', class: 'clear-completed' }
            ]
          }
        ], 
        features :{$: 'css.class', class: 'footer' }
      }, 
      {$: 'label', 
        title :{$: 'json.stringify', 
          $pipeline: [
            '%$to_do_list%', 
            {$: 'json.stringify', 
              separator: ' ,,', 
              items: '%%', 
              itemName: 'todo', 
              itemText: 'task:%task% , state:%completed%', 
              value: '%%'
            }
          ], 
          value: '%$todo_list%'
        }, 
        style :{$: 'label.span' }, 
        features: [
          {$: 'watch-ref', ref: '%$todo_list%', includeChildren: 'true' }, 
          {$: 'id', id: 'show' }
        ]
      }
    ], 
    features: [
      {$: 'var', name: 'filterby', value: 'all', mutable: true }, 
      {$: 'var', name: 'input', mutable: true }, 
      {$: 'css.class', class: 'todoapp' }
    ]
  }
})




jb.component('try.almost', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'almost', 
    controls: [
      {$: 'group', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'button', 
            title: 'done all', 
            action :{
              $runActions: [
                {$: 'run-action-on-items', 
                  items: '%$todo_list%', 
                  action :{$: 'write-value', to: '%completed%', value: 'true' }
                }, 
                {$: 'refresh-control-by-id', id: 'counter' }
              ]
            }, 
            style :{$: 'table-button.href' }
          }, 
          {$: 'editable-text', 
            title: 'text', 
            databind: '%$input%', 
            style :{$: 'editable-text.input' }, 
            features :{$: 'feature.onEnter', 
              event: 'keypress', 
              action :{
                $runActions: [
                  {$: 'add-to-array', 
                    array: '%$todo_list%', 
                    itemsToAdd :{
                      $obj: [
                        {$: 'prop', title: 'task', val: '%$input%', type: 'string' }, 
                        {$: 'prop', title: 'completed', val: '', type: 'boolean' }
                      ]
                    }
                  }, 
                  {$: 'write-value', to: '%$input%' }, 
                  {$: 'refresh-control-by-id', id: 'counter' }
                ]
              }
            }
          }
        ]
      }, 
      {$: 'itemlist', 
        items :{$: 'try.todofilters1' }, 
        controls: [
          {$: 'group', 
            title: 'item', 
            style :{$: 'layout.horizontal', spacing: 3 }, 
            controls: [
              {$: 'editable-boolean', 
                databind: '%completed%', 
                title: '', 
                textForTrue: 'yes', 
                textForFalse: 'no', 
                features :{$: 'feature.onEvent', 
                  event: 'change', 
                  action :{
                    $runActions: [
                      {$: 'refresh-control-by-id', id: 'todolist' }, 
                      {$: 'refresh-control-by-id', id: 'counter' }
                    ]
                  }
                }
              }, 
              {$: 'control.first-succeeding', 
                controls: [
                  {$: 'control-with-condition', 
                    condition :{$: 'equals', item1: '%$state%', item2: 'label' }, 
                    control :{$: 'label', 
                      title: '%task%', 
                      style :{$: 'label.span' }, 
                      features: [
                        {$: 'feature.onEvent', 
                          event: 'dblclick', 
                          action :{$: 'write-value', to: '%$state%', value: 'text' }
                        }
                      ]
                    }, 
                    title: 'label task'
                  }, 
                  {$: 'editable-text', 
                    title: 'task editable', 
                    databind: '%task%', 
                    updateOnBlur: true, 
                    style :{$: 'editable-text.input' }, 
                    features: [
                      {$: 'feature.onEvent', 
                        event: 'blur', 
                        action :{$: 'write-value', to: '%$state%', value: 'label' }
                      }
                    ]
                  }
                ], 
                title: 'switch', 
                style :{$: 'first-succeeding.style' }, 
                features: [{$: 'watch-ref', ref: '%$state%', allowSelfRefresh: 'true' }]
              }, 
              {$: 'button', 
                title: 'delete', 
                action :{
                  $runActions: [
                    {$: 'splice', 
                      array: '%$todo_list%', 
                      fromIndex :{$: 'index-of', array: '%$todo_list%', item: '%$item%' }, 
                      noOfItemsToRemove: '1', 
                      itemsToAdd: []
                    }, 
                    {$: 'refresh-control-by-id', id: 'counter' }
                  ]
                }, 
                style :{$: 'table-button.href' }
              }
            ], 
            features :{$: 'var', name: 'state', value: 'label', mutable: true }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item', 
        features: [
          {$: 'watch-ref', ref: '%$todo_list%', includeChildren: 'true', allowSelfRefresh: 'true' }, 
          {$: 'watch-ref', ref: '%$filterby%', allowSelfRefresh: true }, 
          {$: 'id', id: 'todolist' }
        ]
      }, 
      {$: 'group', 
        style :{$: 'layout.horizontal', leftWidth: 200, rightWidth: 200, spacing: 3 }, 
        controls: [
          {$: 'label', 
            title :{
              $pipeline: [
                '%$todo_list%', 
                {$: 'filter', 
                  filter :{ $not: '', of: '%completed%' }
                }, 
                {$: 'count', items: '%%' }, 
                '%% item left'
              ]
            }, 
            style :{$: 'label.span' }, 
            features: [
              {$: 'watch-ref', ref: '$todo_list%', includeChildren: true }, 
              {$: 'id', id: 'counter' }
            ]
          }, 
          {$: 'button', 
            title: 'all', 
            action :{$: 'write-value', to: '%$filterby%', value: 'all' }, 
            style :{$: 'table-button.href' }
          }, 
          {$: 'button', 
            title: 'active', 
            action :{$: 'write-value', to: '%$filterby%', value: 'active' }, 
            style :{$: 'table-button.href' }
          }, 
          {$: 'button', 
            title: 'completed', 
            action :{$: 'write-value', to: '%$filterby%', value: 'completed' }, 
            style :{$: 'table-button.href' }
          }, 
          {$: 'button', 
            title: 'delete all', 
            action :{$: 'run-action-on-items', 
              items :{$: 'try.completed1', 
                $pipeline: [
                  '%$to_do_list%', 
                  {$: 'filter', filter: '%completed%' }
                ]
              }, 
              action :{$: 'splice', 
                array: '%$todo_list%', 
                fromIndex :{$: 'index-of', array: '%$todo_list%', item: '%%' }, 
                noOfItemsToRemove: '1', 
                itemsToAdd: []
              }
            }, 
            style :{$: 'table-button.href' }, 
            features: [
              {$: 'hidden', 
                showCondition :{$: 'not-equals', 
                  item :{$: 'try.completed' }, 
                  item2 :{$: 'try.completed1' }
                }
              }, 
              {$: 'watch-ref', ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: '' }
            ]
          }
        ]
      }, 
      {$: 'label', 
        title :{$: 'json.stringify', 
          $pipeline: [
            '%$to_do_list%', 
            {$: 'json.stringify', 
              separator: ' ,,', 
              items: '%%', 
              itemName: 'todo', 
              itemText: 'task:%task% , state:%completed%', 
              value: '%%'
            }
          ], 
          value: '%$todo_list%'
        }, 
        style :{$: 'label.span' }, 
        features: [
          {$: 'watch-ref', ref: '%$todo_list%', includeChildren: 'true' }, 
          {$: 'id', id: 'show' }
        ]
      }
    ], 
    features: [
      {$: 'var', name: 'filterby', value: 'all', mutable: true }, 
      {$: 'var', name: 'input', mutable: true }
    ]
  }
})



jb.component("try.completed" , {
  impl :{
    $pipeline: [
      '%$to_do_list%', 
      {$: 'filter', filter: '%completed%' }, 

    ]
  }
} )
jb.component("try.completed1" , {
  impl :{
    $pipeline: [
      '%$todo_list%', 
      {$: 'filter', filter: '%completed%' }, 

    ]
  }
} )
jb.component("try.todofilters",{
  impl :{
    $pipeline: [
      {
        $firstSucceeding: [
          {$: 'data.if', condition: '%$filterby%==all', then: '%$to_do_list%' }, 
          {$: 'data.if', 
            condition: '%$filterby%==completed', 
            then :{
              $pipeline: [
                '%$to_do_list%', 
                {$: 'filter', filter: '%completed%' }
              ]
            }
          }, 
          {$: 'data.if', 
            condition: '%$filterby%==active', 
            then :{
              $pipeline: [
                '%$to_do_list%', 
                {$: 'filter', filter: '%completed% == false' }
              ]
            }
          }
        ]
      }
      
    ]
  }

})
jb.component("try.todofilters1",{
  impl :{
    $pipeline: [
      {
        $firstSucceeding: [
          {$: 'data.if', condition: '%$filterby%==all', then: '%$todo_list%' }, 
          {$: 'data.if', 
            condition: '%$filterby%==completed', 
            then :{
              $pipeline: [
                '%$todo_list%', 
                {$: 'filter', filter: '%completed%' }
              ]
            }
          }, 
          {$: 'data.if', 
            condition: '%$filterby%==active', 
            then :{
              $pipeline: [
                '%$todo_list%', 
                {$: 'filter', filter: '%completed% == false' }
              ]
            }
          }
        ]
      }
      
    ]
  }

})
jb.component("try.status",{
  impl: {
    $and: [
      {$: 'equals', 
        $pipeline: [], 
        item1 :{$: 'count', items: '%$todo_list%' }, 
        item2 :{$: 'count', 
          items :{$: 'try.completed1' }
        }
      }, 
      {$: 'not-equals', 
        $not: '', 
        item1 :{$: 'count', items: '%$todo_list%' }, 
        item2: '0'
      }
    ]  
  }
    

  
})
jb.component('try.footer', {
  type: 'group.style',
  params: [
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('footer',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css:'',
    features :{$: 'group.init-group'}
  }
})
jb.component('try.ul', {
  type: 'group.style',
  params: [
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('ul',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css:'',
    features :{$: 'group.init-group'}
  }
})