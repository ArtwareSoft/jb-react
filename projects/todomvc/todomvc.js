

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


jb.component('todomvc.start', { /* todomvc.start */ 
  impl: group({
    title: 'start',
    controls: [
      group({
        style: group.htmlTag('header'),
        controls: [
          label({title: 'todos', style: label.htmlTag('h1')}),
          editableText({
            databind: '%$input%',
            style: editableText.input(),
            features: [
              feature.onEnter(
                runActions(
                  addToArray(
                    '%$todo%',
                    obj(prop('task', '%$input%', 'string'), prop('completed', undefined, 'boolean'))
                  ),
                  writeValue('%$input%')
                )
              ),
              htmlAttribute('placeholder', 'What needs to be done?'),
              css.class('new-todo')
            ]
          })
        ]
      }),
      group({
        controls: [
          editableBoolean({
            databind: equals({$: 'todomvc.ToggleAllFilter'}, true),
            style: {$: 'editable-boolean.checkbox-with-label', editableBooleanCssClass: 'toggle-all'},
            textForTrue: 'yes',
            textForFalse: 'no',
            features: [
              watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true}),
              feature.onEvent({
                event: 'change',
                action: action.if(
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
          itemlist({
            items: pipeline(
              '%$todo%',
              data.if(
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
                style: layout.horizontal(3),
                controls: [
                  group({
                    style: layout.horizontal(3),
                    controls: [
                      editableBoolean({
                        databind: '%completed%',
                        style: editableBoolean.checkbox(),
                        textForTrue: 'yes',
                        textForFalse: 'no',
                        features: css.class('toggle')
                      }),
                      editableText({
                        databind: '%task%',
                        updateOnBlur: true,
                        style: {$: 'editable-text.input-or-label', inputCssClass: 'edit', labelCssClass: ''
                         ,onToggle: toggleBooleanValue("%$editableline%") }
                      }),
                      button({
                        title: '',
                        action: splice({
                          array: '%$todo%',
                          fromIndex: indexOf('%$todo%', '%%'),
                          noOfItemsToRemove: '1',
                          itemsToAdd: []
                        }),
                        style: {$: 'todomvc.button.simple', size: '21'},
                        features: css.class('destroy')
                      })
                    ],
                    features: [
                      conditionalClass('completed', '%completed%'),
                      watchRef({ref: '%$editableline%', includeChildren: null, allowSelfRefresh: true})
                    ]
                  })
                ],
                features: [variable({name: 'editableline', value: false, mutable: true})]
              })
            ],
            style: itemlist.ulLi(),
            itemVariable: 'item',
            features: [
              watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true}),
              watchRef({ref: '%$filterBy%', allowSelfRefresh: false}),
              css.class('todo-list')
            ]
          })
        ],
        features: css.class('main')
      }),
      group({
        title: 'toolbar',
        style: group.htmlTag('footer'),
        controls: [
          label({
            title: pipeline('%$todo%', filter(not('%completed%')), count('%%'), '%% items left'),
            style: label.span(),
            features: [watchRef({ref: '%$todo%', includeChildren: true}), css.class('todo-count')]
          }),
          group({
            title: 'filters',
            style: {$: 'todomvc.group.ul-li'},
            controls: [
              button({
                title: 'all',
                action: writeValue('%$filterBy%', 'all'),
                style: button.href(),
                features: [
                  conditionalClass('selected', equals('%$filterBy%', 'all')),
                  watchRef({ref: '%$filterBy%', allowSelfRefresh: true})
                ]
              }),
              button({
                title: 'active',
                action: writeValue('%$filterBy%', 'active'),
                style: button.href(),
                features: [
                  conditionalClass('selected', equals('%$filterBy%', 'active')),
                  watchRef({ref: '%$filterBy%', allowSelfRefresh: true})
                ]
              }),
              button({
                title: 'completed',
                action: writeValue('%$filterBy%', 'completed'),
                style: button.href(),
                features: [
                  conditionalClass('selected', equals('%$filterBy%', 'completed')),
                  watchRef({ref: '%$filterBy%', allowSelfRefresh: true})
                ]
              })
            ],
            features: css.class('filters')
          }),
          button({
            title: 'Clear completed',
            action: runActionOnItems(
              pipeline('%$todo%', filter('%completed%')),
              splice({
                array: '%$todo%',
                fromIndex: indexOf('%$todo%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: {$: 'todomvc.button.simple'},
            features: [
              hidden(notEmpty(pipeline('%$todo%', filter('%completed%')))),
              watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: true}),
              css.class('clear-completed')
            ]
          })
        ],
        features: css.class('footer')
      }),
      label({
        title: pipeline(json.stringify('%$todo%'), '%$filterBy%: %%'),
        style: label.span(),
        features: [
          watchRef({ref: '%$todo%', includeChildren: true, allowSelfRefresh: false}),
          watchRef('%$filterBy%')
        ]
      })
    ],
    features: [
      variable({name: 'filterBy', value: 'all', mutable: true}),
      variable({name: 'todo', value: asIs([{task: 'home', completed: true}]), mutable: true}),
      variable({name: 'input', mutable: true}),
      css.class('todoapp')
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






jb.component('editable-text.input-or-label', {
  type: 'editable-text.style',
  params:[
    { id: 'labelCssClass', as: 'string'  },
    { id: 'inputCssClass', as: 'string' , defaultValue: "input"  },
    { id: 'onToggle', type: 'action' , dynamic: true  }
  ], 
  impl: styleByControl(
    control_firstSucceeding({
      controls: [
        controlWithCondition(
          '%$editable%',
          editableText({
            databind: '%$editableTextModel/databind%',
            updateOnBlur: true,
            style: editableText_input(),
            features:[
            feature_onEvent({event: 'blur', action: 
              runActions(writeValue('%$editable%', false), 
              call('onToggle')
              )
            }),
            css_class("%$inputCssClass%")
            ]

          })
        ),
        label({
          title: ctx => ctx.exp('%$editableTextModel/databind%'),
          style: label.htmlTag('label'),
          features:[
           feature_onEvent({event: 'dblclick', 
           action: runActions(
             writeValue('%$editable%', true),
             focusOnSibling(".%$inputCssClass%"), 
             call('onToggle')
             )})
           ,
           css_class("%$labelCssClass%")
          ]
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

jb.component('editable-boolean.checkbox-with-label', {
  type: 'editable-boolean.style',
  params: [{id:"editableBooleanCssClass", as: 'string'}],
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: state.model, 
        onchange: e => cmp.jbModel(e.target.checked), 
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup'), class: cmp.editableBooleanCssClass,id: 'switch_' + state.fieldId  }),
        h('label',{for: 'switch_' + state.fieldId })
      ])
  }
})


jb.component('todomvc.group.ul-li', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li', {class: 'jb-item'} ,h(ctrl)),ctrl.ctx.data))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0; display: inline;}`,
    features :{$: 'group.init-group'}
  },
})


jb.component('todomvc.button.simple', {
  type: 'button.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('button',{onclick: ev => cmp.clicked(ev)}, state.title),
        
    }
})

