



jb.resource('to_do_list',[
  { "task": "eat" ,completed: false },
  { "task": "fly" ,completed: false },
  { "task": "drink" ,completed: true }
]);
jb.resource('todo_list',[
]);


jb.component('todomvc.main', {
  type: 'control',
  impl: group({
    controls: [
      editableText({
        title: 'text',
        databind: '%$input%',
        updateOnBlur: 'false',
        style: editableText_input(),
        features: [
          feature_onEnter(
            runActions(
              addToArray(
                '%$todo_list%',
                obj(prop('task', '%$input%', 'string'), prop('completed', 'false', 'boolean'))
              ),
              refreshControlById('list'),
              writeValue('%$input%')
            )
          ),
          feature_onEvent({event: 'blur', action: writeValue('%$input%', '')})
        ]
      }),
      itemlist({
        items: '%$todo_list%',
        controls: [
          group({
            title: 'switch first succeeding',
            style: layout_horizontal(3),
            controls: [
              editableBoolean({
                databind: '%completed%',
                style: editableBoolean_checkbox(),
                title: 'completed',
                textForTrue: 'yes',
                textForFalse: 'no'
              }),
              control_firstSucceeding({
                controls: [
                  controlWithCondition(
                    equals('%$state%', 'label'),
                    label({
                      title: '%task%',
                      style: label_span(),
                      features: [feature_onEvent({event: 'dblclick', action: writeValue('%$state%', 'text')})]
                    }),
                    'label task'
                  ),
                  editableText({
                    title: 'task editable',
                    databind: '%task%',
                    updateOnBlur: true,
                    style: editableText_input(),
                    features: [feature_onEvent({event: 'blur', action: writeValue('%$state%', 'label')})]
                  })
                ],
                title: 'switch',
                style: firstSucceeding_style(),
                features: [watchRef({ref: '%$state%', allowSelfRefresh: 'true'})]
              })
            ],
            features: {$: 'var', name: 'state', value: 'label', mutable: true}
          })
        ],
        style: itemlist_ulLi(),
        itemVariable: '%$todo_list%',
        features: id('list')
      }),
      group({
        title: 'switch-hidden',
        style: layout_horizontal(3),
        controls: [
          label({
            title: 'my label',
            style: label_span(),
            features: [
              feature_onEvent({event: 'dblclick', action: writeValue('%$filterBy%', 'text')}),
              hidden(equals('%$filterBy%', 'label')),
              watchRef({ref: '%$filterBy%', allowSelfRefresh: true})
            ]
          }),
          editableText({
            databind: '%$input%',
            style: editableText_input(),
            features: [
              feature_onEvent({
                event: 'blur',
                action: runActions(
                  writeValue('%$filterBy%', 'label'),
                  openDialog({content: label('my label')}),
                  writeValue('%$input%', 'wow')
                )
              }),
              hidden(equals('text', '%$filterBy%')),
              watchRef({ref: '%$filterBy%', allowSelfRefresh: true})
            ]
          })
        ]
      }),
      label({title: json_stringify('%$todo_list%'), style: label_span(), features: [id('show')]})
    ],
    features: [
      {$: 'var', name: 'filterBy', value: 'label', mutable: true},
      {$: 'var', name: 'input', value: 'hey', mutable: true},
      {$: 'var', name: 'todolist', value: '', mutable: true}
    ]
  })
})

jb.component('todomvc.classes', {
  type: 'control',
  impl: group({
    title: 'classes',
    controls: [
      label({title: 'todos', style: {$: 'label.h1'}}),
      group({
        style: layout_horizontal(3),
        controls: [
          editableText({
            title: 'text',
            databind: '%$input%',
            style: editableText_input(),
            features: feature_onEnter(
              runActions(
                addToArray(
                  '%$todo_list%',
                  obj(prop('task', '%$input%', 'string'), prop('completed', '', 'boolean'))
                ),
                writeValue('%$input%'),
                refreshControlById('counter')
              )
            )
          })
        ]
      }),
      group({
        controls: [
          editableBoolean({
            databind: {$: 'todomvc.status'},
            style: {$: 'todomvc.editable-boolean.label+editableboolen', inputCssClass: 'toggle-all'},
            textForTrue: 'yes',
            textForFalse: 'no',
            features: [
              id('status'),
              feature_onEvent({
                event: 'change',
                action: runActions(
                  action_if(
                    equals({$: 'todomvc.status'}, true),
                    runActions(runActionOnItems('%$todo_list%', writeValue('%completed%', false)))
                  ),
                  action_if(
                    equals({$: 'todomvc.status'}, false),
                    runActionOnItems('%$todo_list%', writeValue('%completed%', true))
                  ),
                  refreshControlById('counter')
                )
              }),
              watchRef({ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: true})
            ]
          }),
          itemlist({
            items: {$: 'todomvc.todofilters1'},
            controls: [
              group({
                title: 'item',
                style: layout_horizontal(3),
                controls: [
                  editableBoolean({
                    databind: '%completed%',
                    title: '',
                    textForTrue: 'yes',
                    textForFalse: 'no',
                    features: feature_onEvent({
                      event: 'change',
                      action: runActions(refreshControlById('todolist'), refreshControlById('counter'))
                    })
                  }),
                  control_firstSucceeding({
                    controls: [
                      controlWithCondition(
                        equals('%$state%', 'label'),
                        label({
                          title: '%task%',
                          style: label_span(),
                          features: [feature_onEvent({event: 'dblclick', action: writeValue('%$state%', 'text')})]
                        }),
                        'label task'
                      ),
                      editableText({
                        title: 'task editable',
                        databind: '%task%',
                        updateOnBlur: true,
                        style: editableText_input(),
                        features: [feature_onEvent({event: 'blur', action: writeValue('%$state%', 'label')})]
                      })
                    ],
                    title: 'switch',
                    style: firstSucceeding_style(),
                    features: [watchRef({ref: '%$state%', allowSelfRefresh: 'true'})]
                  }),
                  button({
                    title: 'delete',
                    action: runActions(
                      splice({
                        array: '%$todo_list%',
                        fromIndex: indexOf('%$todo_list%', '%$item%'),
                        noOfItemsToRemove: '1',
                        itemsToAdd: []
                      }),
                      refreshControlById('counter')
                    ),
                    style: tableButton_href()
                  })
                ],
                features: {$: 'var', name: 'state', value: 'label', mutable: true}
              })
            ],
            style: itemlist_ulLi(),
            itemVariable: 'item',
            features: [
              watchRef({ref: '%$todo_list%', includeChildren: 'true', allowSelfRefresh: 'true'}),
              watchRef({ref: '%$filterby%', allowSelfRefresh: true}),
              id('todolist')
            ]
          })
        ]
      }),
      group({
        title: 'footer',
        style: {$: 'todomvc.footer', leftWidth: 200, rightWidth: 200, spacing: 3},
        controls: [
          label({
            title: pipeline('%$todo_list%', filter(not('%completed%')), count('%%'), '%% item left'),
            style: label_span(),
            features: [
              watchRef({ref: '$todo_list%', includeChildren: true}),
              id('counter'),
              css_class('todo-count')
            ]
          }),
          group({
            title: 'ul',
            style: group_ulLi(),
            controls: [
              button({
                title: 'all',
                action: writeValue('%$filterby%', 'all'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'all'))
              }),
              button({
                title: 'active',
                action: writeValue('%$filterby%', 'active'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'active'))
              }),
              button({
                title: 'completed',
                action: writeValue('%$filterby%', 'completed'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'completed'))
              })
            ],
            features: [css_class('filters'), watchRef({ref: '%$filterby%', allowSelfRefresh: true})]
          }),
          button({
            title: 'delete all',
            action: runActionOnItems(
              {$: 'todomvc.completed1', $pipeline: ['%$to_do_list%', filter('%completed%')]},
              splice({
                array: '%$todo_list%',
                fromIndex: indexOf('%$todo_list%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: tableButton_href(),
            features: [
              hidden(notEquals(undefined, {$: 'todomvc.completed1'})),
              watchRef({ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: ''}),
              css_class('clear-completed')
            ]
          })
        ],
        features: css_class('footer')
      }),
      label({
        title: json_stringify('%$todo_list%'),
        style: label_span(),
        features: [watchRef({ref: '%$todo_list%', includeChildren: 'true'}), id('show')]
      })
    ],
    features: [
      {$: 'var', name: 'filterby', value: 'all', mutable: true},
      {$: 'var', name: 'input', mutable: true},
      css_class('todoapp')
    ]
  })
})




jb.component('todomvc.almost', {
  type: 'control',
  impl: group({
    title: 'almost',
    controls: [
      group({
        style: layout_horizontal(3),
        controls: [
          button({
            title: 'done all',
            action: runActions(
              runActionOnItems('%$todo_list%', writeValue('%completed%', 'true')),
              refreshControlById('counter')
            ),
            style: tableButton_href()
          }),
          editableText({
            title: 'text',
            databind: '%$input%',
            style: editableText_input(),
            features: feature_onEnter(
              runActions(
                addToArray(
                  '%$todo_list%',
                  obj(prop('task', '%$input%', 'string'), prop('completed', '', 'boolean'))
                ),
                writeValue('%$input%'),
                refreshControlById('counter')
              )
            )
          })
        ]
      }),
      itemlist({
        items: {$: 'todomvc.todofilters1'},
        controls: [
          group({
            title: 'item',
            style: layout_horizontal(3),
            controls: [
              editableBoolean({
                databind: '%completed%',
                title: '',
                textForTrue: 'yes',
                textForFalse: 'no',
                features: feature_onEvent({
                  event: 'change',
                  action: runActions(refreshControlById('todolist'), refreshControlById('counter'))
                })
              }),
              control_firstSucceeding({
                controls: [
                  controlWithCondition(
                    equals('%$state%', 'label'),
                    label({
                      title: '%task%',
                      style: label_span(),
                      features: [feature_onEvent({event: 'dblclick', action: writeValue('%$state%', 'text')})]
                    }),
                    'label task'
                  ),
                  editableText({
                    title: 'task editable',
                    databind: '%task%',
                    updateOnBlur: true,
                    style: editableText_input(),
                    features: [feature_onEvent({event: 'blur', action: writeValue('%$state%', 'label')})]
                  })
                ],
                title: 'switch',
                style: firstSucceeding_style(),
                features: [watchRef({ref: '%$state%', allowSelfRefresh: 'true'})]
              }),
              button({
                title: 'delete',
                action: runActions(
                  splice({
                    array: '%$todo_list%',
                    fromIndex: indexOf('%$todo_list%', '%$item%'),
                    noOfItemsToRemove: '1',
                    itemsToAdd: []
                  }),
                  refreshControlById('counter')
                ),
                style: tableButton_href()
              })
            ],
            features: {$: 'var', name: 'state', value: 'label', mutable: true}
          })
        ],
        style: itemlist_ulLi(),
        itemVariable: 'item',
        features: [
          watchRef({ref: '%$todo_list%', includeChildren: 'true', allowSelfRefresh: 'true'}),
          watchRef({ref: '%$filterby%', allowSelfRefresh: true}),
          id('todolist')
        ]
      }),
      group({
        style: layout_horizontal(3),
        controls: [
          label({
            title: pipeline('%$todo_list%', filter(not('%completed%')), count('%%'), '%% item left'),
            style: label_span(),
            features: [watchRef({ref: '$todo_list%', includeChildren: true}), id('counter')]
          }),
          button({title: 'all', action: writeValue('%$filterby%', 'all'), style: tableButton_href()}),
          button({
            title: 'active',
            action: writeValue('%$filterby%', 'active'),
            style: tableButton_href()
          }),
          button({
            title: 'completed',
            action: writeValue('%$filterby%', 'completed'),
            style: tableButton_href()
          }),
          button({
            title: 'delete all',
            action: runActionOnItems(
              {$: 'todomvc.completed1', $pipeline: ['%$to_do_list%', filter('%completed%')]},
              splice({
                array: '%$todo_list%',
                fromIndex: indexOf('%$todo_list%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: tableButton_href(),
            features: [
              hidden(notEquals(undefined, {$: 'todomvc.completed1'})),
              watchRef({ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: ''})
            ]
          })
        ]
      }),
      label({
        title: json_stringify('%$todo_list%'),
        style: label_span(),
        features: [watchRef({ref: '%$todo_list%', includeChildren: 'true'}), id('show')]
      })
    ],
    features: [
      {$: 'var', name: 'filterby', value: 'all', mutable: true},
      {$: 'var', name: 'input', mutable: true}
    ]
  })
})


jb.component('todomvc.check', {
  type: 'control',
  impl: group({
    title: 'check',
    controls: [
      label({title: 'todos', style: {$: 'label.h1'}}),
      group({
        style: layout_horizontal(3),
        controls: [
          editableText({
            title: 'text',
            databind: '%$input%',
            style: editableText_input(),
            features: feature_onEnter(
              runActions(
                addToArray(
                  '%$todo_list%',
                  obj(prop('task', '%$input%', 'string'), prop('completed', '', 'boolean'))
                ),
                writeValue('%$input%'),
                refreshControlById('counter')
              )
            )
          })
        ]
      }),
      group({
        controls: [
          editableBoolean({
            databind: {$: 'todomvc.status'},
            style: {$: 'todomvc.editable-boolean.label+editableboolen', inputCssClass: 'toggle-all'},
            textForTrue: 'yes',
            textForFalse: 'no',
            features: [
              id('status'),
              feature_onEvent({
                event: 'change',
                action: runActions(
                  action_if(
                    equals({$: 'todomvc.status'}, true),
                    runActions(runActionOnItems('%$todo_list%', writeValue('%completed%', false)))
                  ),
                  action_if(
                    equals({$: 'todomvc.status'}, false),
                    runActionOnItems('%$todo_list%', writeValue('%completed%', true))
                  ),
                  refreshControlById('counter')
                )
              }),
              watchRef({ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: true})
            ]
          }),
          itemlist({
            items: {$: 'todomvc.todofilters1'},
            controls: [
              group({
                title: 'item',
                style: layout_horizontal(3),
                controls: [
                  editableBoolean({
                    databind: '%completed%',
                    title: '',
                    textForTrue: 'yes',
                    textForFalse: 'no',
                    features: feature_onEvent({
                      event: 'change',
                      action: runActions(refreshControlById('todolist'), refreshControlById('counter'))
                    })
                  }),
                  control_firstSucceeding({
                    controls: [
                      controlWithCondition(
                        equals('%$state%', 'label'),
                        label({
                          title: '%task%',
                          style: label_span(),
                          features: [feature_onEvent({event: 'dblclick', action: writeValue('%$state%', 'text')})]
                        }),
                        'label task'
                      ),
                      editableText({
                        title: 'task editable',
                        databind: '%task%',
                        updateOnBlur: true,
                        style: editableText_input(),
                        features: [feature_onEvent({event: 'blur', action: writeValue('%$state%', 'label')})]
                      })
                    ],
                    title: 'switch',
                    style: firstSucceeding_style(),
                    features: [watchRef({ref: '%$state%', allowSelfRefresh: 'true'})]
                  }),
                  button({
                    title: 'delete',
                    action: runActions(
                      splice({
                        array: '%$todo_list%',
                        fromIndex: indexOf('%$todo_list%', '%$item%'),
                        noOfItemsToRemove: '1',
                        itemsToAdd: []
                      }),
                      refreshControlById('counter')
                    ),
                    style: tableButton_href()
                  })
                ],
                features: {$: 'var', name: 'state', value: 'label', mutable: true}
              })
            ],
            style: itemlist_ulLi(),
            itemVariable: 'item',
            features: [
              watchRef({ref: '%$todo_list%', includeChildren: 'true', allowSelfRefresh: 'true'}),
              watchRef({ref: '%$filterby%', allowSelfRefresh: true}),
              id('todolist')
            ]
          })
        ]
      }),
      group({
        title: 'footer',
        style: {$: 'todomvc.footer', leftWidth: 200, rightWidth: 200, spacing: 3},
        controls: [
          label({
            title: pipeline('%$todo_list%', filter(not('%completed%')), count('%%'), '%% item left'),
            style: label_span(),
            features: [
              watchRef({ref: '$todo_list%', includeChildren: true}),
              id('counter'),
              css_class('todo-count')
            ]
          }),
          group({
            title: 'ul',
            style: group_ulLi(),
            controls: [
              button({
                title: 'all',
                action: writeValue('%$filterby%', 'all'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'all'))
              }),
              button({
                title: 'active',
                action: writeValue('%$filterby%', 'active'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'active'))
              }),
              button({
                title: 'completed',
                action: writeValue('%$filterby%', 'completed'),
                style: tableButton_href(),
                features: conditionalClass('selected', equals('%$filterby%', 'completed'))
              })
            ],
            features: [css_class('filters'), watchRef({ref: '%$filterby%', allowSelfRefresh: true})]
          }),
          button({
            title: 'delete all',
            action: runActionOnItems(
              {$: 'todomvc.completed1', $pipeline: ['%$to_do_list%', filter('%completed%')]},
              splice({
                array: '%$todo_list%',
                fromIndex: indexOf('%$todo_list%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: tableButton_href(),
            features: [
              hidden(notEquals(undefined, {$: 'todomvc.completed1'})),
              watchRef({ref: '%$todo_list%', includeChildren: true, allowSelfRefresh: ''}),
              css_class('clear-completed')
            ]
          })
        ],
        features: css_class('footer')
      }),
      label({
        title: json_stringify('%$todo_list%'),
        style: label_span(),
        features: [watchRef({ref: '%$todo_list%', includeChildren: 'true'}), id('show')]
      })
    ],
    features: [
      {$: 'var', name: 'filterby', value: 'all', mutable: true},
      {$: 'var', name: 'input', mutable: true},
      css_class('todoapp')
    ]
  })
})



jb.component('todomvc.start', {
  impl: group({
    title: 'start',
    controls: [
      editableBoolean({
        databind: equals({$: 'todomvc.ToggleAllFilter'}, true),
        style: editableBoolean_checkbox(),
        textForTrue: 'yes',
        textForFalse: 'no',
        features: [
          watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true}),
          feature_onEvent({
            event: 'change',
            action: action_if(
              equals({$: 'todomvc.ToggleAllFilter'}, true),
              runActionOnItems('%$todo%', toggleBooleanValue('%completed%')),
              runActionOnItems(
                pipeline('%$todo%', filter(not('%completed%'))),
                toggleBooleanValue('%completed%')
              )
            )
          }),
          hidden(notEmpty('%$todo%'))
        ]
      }),
      editableText({
        databind: '%$input%',
        style: editableText_input(),
        features: [
          feature_onEnter(
            runActions(
              addToArray(
                '%$todo%',
                obj(prop('task', '%$input%', 'string'), prop('completed', undefined, 'boolean'))
              ),
              writeValue('%$input%')
            )
          ),
          htmlAttribute('placeholder', 'What needs to be done?')
        ]
      }),
      itemlist({
        items: pipeline(
          '%$todo%',
          data_if(
            or(
              and(equals('%$filterBy%', 'completed'), '%completed%'),
              and(equals('%$filterBy%', 'active'), not('%completed%')),
              equals('%$filterBy%', 'all')
            ),
            '%%',
            null
          )
        ),
        controls: [
          group({
            style: layout_horizontal(3),
            controls: [
              editableBoolean({
                databind: '%completed%',
                style: editableBoolean_checkbox(),
                textForTrue: 'yes',
                textForFalse: 'no'
              }),
              editableText({databind: '%task%', updateOnBlur: true, style: {$: 'editable-text.input-or-label'}}),
              button({
                title: 'delete',
                action: splice({
                  array: '%$todo%',
                  fromIndex: indexOf('%$todo%', '%%'),
                  noOfItemsToRemove: '1',
                  itemsToAdd: []
                }),
                style: button_href()
              })
            ]
          })
        ],
        style: itemlist_ulLi(),
        itemVariable: 'item',
        features: [
          watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true}),
          watchRef({ref: '%$filterBy%', allowSelfRefresh: false})
        ]
      }),
      group({
        title: 'toolbar',
        style: layout_horizontal(3),
        controls: [
          label({
            title: pipeline('%$todo%', filter(not('%completed%')), count('%%'), '%% items left'),
            style: label_span(),
            features: [watchRef({ref: '%$todo%', includeChildren: true})]
          }),
          group({
            title: 'filters',
            style: layout_horizontal(3),
            controls: [
              button({title: 'all', action: writeValue('%$filterBy%', 'all'), style: button_href()}),
              button({title: 'active', action: writeValue('%$filterBy%', 'active'), style: button_href()}),
              button({
                title: 'completed',
                action: writeValue('%$filterBy%', 'completed'),
                style: button_href()
              })
            ]
          }),
          button({
            title: 'delete all',
            action: runActionOnItems(
              pipeline('%$todo%', filter('%completed%')),
              splice({
                array: '%$todo%',
                fromIndex: indexOf('%$todo%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: button_href(),
            features: [
              hidden(notEmpty(pipeline('%$todo%', filter('%completed%')))),
              watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true})
            ]
          })
        ]
      }),
      label({
        title: pipeline(json_stringify('%$todo%'), '%$filterBy%: %%'),
        style: label_span(),
        features: [
          watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: false}),
          watchRef('%$filterBy%')
        ]
      })
    ],
    features: [
      {$: 'var', name: 'filterBy', value: 'all', mutable: true},
      {
        $: 'var',
        name: 'todo',
        mutable: true,
        value: asIs([{task: 'home', completed: true}])
      },
      {$: 'var', name: 'input', mutable: true}
    ]
  })
})

                      


  jb.component("todomvc.ToggleAllFilter",{
    params: [
      { id: 'data', as: 'string'}]
    ,
    impl :{$: 'equals', 
      item1 :{$: 'count', items: '%$todo%' }, 
      item2 :{ $pipeline: ['%$todo%', 
            {$: 'count', 
              items :{$: 'filter', filter: '%completed%' }
            }
          ]
      }
              
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


jb.component('editable-text.input-or-label', {
  type: 'editable-text.style',
  impl: styleByControl(
    control_firstSucceeding({
      controls: [
        controlWithCondition(
          '%$editable%',
          editableText({
            databind: '%$editableTextModel/databind%',
            updateOnBlur: true,
            style: editableText_input(),
            features: feature_onEvent({event: 'blur', action: writeValue('%$editable%', false)})
          })
        ),
        label({
          title: ctx => ctx.exp('%$editableTextModel/databind%'),
          style: label_span(),
          features: feature_onEvent({event: 'dblclick', action: runActions(focusOnSibling('input'), writeValue('%$editable%', true))})
        })
      ],
      style: firstSucceeding_style(),
      features: [
        {$: 'var', name: 'editable', mutable: true},
        firstSucceeding_watchRefreshOnCtrlChange('%$editable%', false)
      ]
    }),
    'editableTextModel'
  )
})

