



jb.resource('to_do_list',[
  { "task": "eat" ,completed: false },
  { "task": "fly" ,completed: false },
  { "task": "drink" ,completed: true }
]);
jb.resource('todo_list',[
]);


jb.component('todomvc.main', {
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

jb.component('todomvc.classes', {
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
      {$: 'group', 
        controls: [
          {$: 'editable-boolean', 
            databind :{$: 'todomvc.status' }, 
            style :{$: 'todomvc.editable-boolean.label+editableboolen', inputCssClass: 'toggle-all' }, 
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
                        item1 :{$: 'todomvc.status' }, 
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
                        item1 :{$: 'todomvc.status' }, 
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
              }, 
              {$: 'watch-ref', ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: true }
            ]
          }, 
          {$: 'itemlist', 
            items :{$: 'todomvc.todofilters1' }, 
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
          }
        ]
      }, 
      {$: 'group', 
        title: 'footer', 
        style :{$: 'todomvc.footer', leftWidth: 200, rightWidth: 200, spacing: 3 }, 
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
              items :{$: 'todomvc.completed1', 
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
                  item :{$: 'todomvc.completed' }, 
                  item2 :{$: 'todomvc.completed1' }
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




jb.component('todomvc.almost', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'almost', 
    controls: [
      {$: 'control.first-succeeding', 
        controls: [
          {$: 'control-with-condition', 
            condition: '%$editable%', 
            control :{$: 'editable-text', 
              style :{$: 'editable-text.mdl-input' }
            }
          }, 
          {$: 'label', 
            title: '%$input%', 
            style :{$: 'label.span' }, 
            features :{$: 'feature.onEvent', 
              event: 'click', 
              action :{$: 'write-value', to: '%$editable%', value: true }
            }
          }
        ], 
        style :{$: 'first-succeeding.style' }, 
        features: [
          {$: 'var', name: 'editable', mutable: true }, 
          {$: 'var', name: 'input', value: 'hello', mutable: true }, 
          {$: 'first-succeeding.watch-refresh-on-ctrl-change', 
            ref: '%$editable%', 
            includeChildren: false
          }
        ]
      }
    ]
  }
})


jb.component('todomvc.check', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'check', 
    controls: [
      {$: 'label', 
        title: 'todos', 
        style :{$: 'label.h1' }
      }, 
      {$: 'group', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
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
      {$: 'group', 
        controls: [
          {$: 'editable-boolean', 
            databind :{$: 'todomvc.status' }, 
            style :{$: 'todomvc.editable-boolean.label+editableboolen', inputCssClass: 'toggle-all' }, 
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
                        item1 :{$: 'todomvc.status' }, 
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
                        item1 :{$: 'todomvc.status' }, 
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
              }, 
              {$: 'watch-ref', ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: true }
            ]
          }, 
          {$: 'itemlist', 
            items :{$: 'todomvc.todofilters1' }, 
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
          }
        ]
      }, 
      {$: 'group', 
        title: 'footer', 
        style :{$: 'todomvc.footer', leftWidth: 200, rightWidth: 200, spacing: 3 }, 
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
              items :{$: 'todomvc.completed1', 
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
                  item :{$: 'todomvc.completed' }, 
                  item2 :{$: 'todomvc.completed1' }
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


jb.component('todomvc.start', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'start', 
    controls: [
      {$: 'editable-text', 
        databind: '%$input%', 
        style :{$: 'editable-text.input' }, 
        features :{$: 'feature.onEnter', 
          action :{
            $runActions: [
              {$: 'add-to-array', 
                array: '%$todo%', 
                itemsToAdd :{
                  $obj: [
                    {$: 'prop', title: 'task', val: '%$input%', type: 'string' }, 
                    {$: 'prop', title: 'completed', type: 'boolean' }
                  ]
                }
              }, 
              {$: 'write-value', to: '%$input%' }
            ]
          }
        }
      }, 
      {$: 'itemlist', 
        items :{
          $pipeline: [
            '%$todo%', 
            {$: 'data.if', 
              condition :{
                $or: [
                  {
                    $and: [
                      {$: 'equals', item1: '%$filterBy%', item2: 'completed' }, 
                      '%completed%'
                    ]
                  }, 
                  {
                    $and: [
                      {$: 'equals', item1: '%$filterBy%', item2: 'active' }, 
                      { $not: '%completed%' }
                    ]
                  }, 
                  {$: 'equals', item1: '%$filterBy%', item2: 'all' }
                ]
              }, 
              then: '%%', 
              else: ''
            }
          ]
        }, 
        controls: [
          {$: 'group', 
            title: '', 
            style :{$: 'layout.horizontal', spacing: '30' }, 
            controls: [
              {$: 'editable-boolean', 
                databind: '%completed%', 
                style :{$: 'editable-boolean.checkbox' }, 
                textForTrue: 'yes', 
                textForFalse: 'no'
              }, 
              {$: 'editable-text', 
                databind: '%task%', 
                updateOnBlur: true, 
                style :{$: 'editable-text.input-or-label' }
              }
            ]
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item', 
        features: [
          {$: 'watch-ref', 
            ref: '%$todo%', 
            includeChildren: true, 
            allowSelfRefresh: true
          }, 
          {$: 'watch-ref', ref: '%$filterBy%' }
        ]
      }, 
      {$: 'label', 
        title :{
          $pipeline: [{$: 'json.stringify', value: '%$todo%' }, '%$filterBy%:%%']
        }, 
        style :{$: 'label.span', htmlTag: 'span' }, 
        features: [
          {$: 'watch-ref', ref: '%$todo%', includeChildren: true }, 
          {$: 'watch-ref', ref: '%$filterBy%' }
        ]
      }, 
      {$: 'group', 
        title: 'toolbar', 
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'button', 
            title: 'all', 
            action :{$: 'write-value', to: '%$filterBy%', value: 'all' }, 
            style :{$: 'button.mdl-raised' }
          }, 
          {$: 'button', 
            title: 'active', 
            action :{$: 'write-value', to: '%$filterBy%', value: 'active' }, 
            style :{$: 'button.mdl-raised' }
          }, 
          {$: 'button', 
            title: 'completed', 
            action :{$: 'write-value', to: '%$filterBy%', value: 'completed' }, 
            style :{$: 'button.mdl-raised' }
          }
        ]
      }
    ], 
    features: [
      {$: 'var', 
        name: 'todo', 
        value :{ $asIs: [{ task: 'home', completed: true }] }, 
        mutable: true
      }, 
      {$: 'var', name: 'filterBy', value: 'all', mutable: true }, 
      {$: 'var', name: 'input', mutable: true }
    ]
  }
})

jb.component("todomvc.todofilters1",{
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
jb.component("todomvc.status",{
  impl: {
    $and: [
      {$: 'equals', 
        $pipeline: [], 
        item1 :{$: 'count', items: '%$todo_list%' }, 
        item2 :{$: 'count', 
          items :{$: 'todomvc.completed1' }
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
jb.component('todomvc.footer', {
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
jb.component('todomvc.ul', {
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

jb.component('todomvc.editable-boolean.label+editableboolen', {
  type: 'editable-boolean.style',
  params : [ { id: 'inputCssClass', as: 'string', mandatory: false, defaultvalue: "" },],
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('div',{}, [
        h('input', { class : cmp.inputCssClass,type: 'checkbox', id: 'switch_'+cmp.inputCssClass  ,
          checked: state.model, onchange: e => cmp.jbModel(e.target.checked) }),
        h('label',{ for: 'switch_'+cmp.inputCssClass}  )
      ]
      ),
      features :[
        {$: 'field.databind' },
        {$: 'editable-boolean.keyboard-support' },
      ]

  }
})


jb.component('todomvc.label.label', {
  type: 'label.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('label',{},state.title),
      features :{$: 'label.bind-title' }
  }
})

jb.component('editable-text.input-or-label', {
  type: 'editable-text.style',
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'editableTextModel',
    control :{$: 'control.first-succeeding', 
      controls: [
        {$: 'control-with-condition', 
          condition: '%$editable%', 
          control :{$: 'editable-text', updateOnBlur: true,
            databind: '%$editableTextModel/databind%', 
            style :{$: 'editable-text.input' }, 
            features :{$: 'feature.onEvent', 
              event: 'blur', 
              action :{$: 'write-value', to: '%$editable%', value: false }
            }
          }
        },
        {$: 'label', 
          title: ctx => ctx.exp('%$editableTextModel/databind%'), 
          style :{$: 'label.span' }, 
          features :{$: 'feature.onEvent', 
            event: 'click', 
            action :{$: 'write-value', to: '%$editable%', value: true }
          }
        }
      ], 
      style :{$: 'first-succeeding.style' }, 
      features: [
        {$: 'var', name: 'editable', mutable: true }, 
        {$: 'first-succeeding.watch-refresh-on-ctrl-change', 
          ref: '%$editable%', 
          includeChildren: false
        }
      ]
    }
  }
})
