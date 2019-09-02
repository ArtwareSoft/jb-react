jb.component('todo', { /* todo */ 
  watchableData: [
    {task: 'home', completed: false},
    {task: 'gym', completed: true}
  ]
})

jb.component('filterBy', { /* filterBy */ 
  watchableData: 'all'
})

jb.component('input', { /* input */ 
  watchableData: ""
})

jb.component('todomvc.main', { /* todomvc.main */ 
  type: 'control',
  impl: group({
    controls: [
      editableText({
        title: 'text',
        databind: '%$input%',
        updateOnBlur: 'false',
        style: {
          $: 'editable-text.input-or-label',
          inputCssClass: 'input',
          onToggle: addToArray(
            '%$to_do_list%',
            obj(prop('task', 'yosef', 'string'), prop('completed', undefined, 'boolean'))
          )
        }
      }),
      itemlist({
        items: '%$to_do_list%',
        controls: [
          label({title: '%task%', style: label.span()}),
          button({
            title: 'click me',
            action: splice({
              array: '%$to_do_list%',
              fromIndex: indexOf('%$to_do_list%', '%%'),
              noOfItemsToRemove: '1',
              itemsToAdd: []
            }),
            style: button.x('21')
          }),
          editableBoolean({
            databind: '%completed%',
            style: editableBoolean.checkbox(),
            textForTrue: 'yes',
            textForFalse: 'no'
          })
        ],
        style: itemlist.ulLi(),
        itemVariable: 'item',
        features: watchRef({ref: '%$to_do_list%', includeChildren: 'yes', allowSelfRefresh: true})
      }),
      button({
        title: 'delete all',
        action: runActionOnItems(
          pipeline('%$to_do_list%', filter('%completed%')),
          splice({
            array: '%$to_do_list%',
            fromIndex: indexOf('%$to_do_list%', '%%'),
            noOfItemsToRemove: '1',
            itemsToAdd: []
          })
        ),
        style: button.mdlRaised(),
        features: watchRef({ref: '%$to_do_list%', includeChildren: 'yes', allowSelfRefresh: true})
      }),
      label({
        title: json.stringify('%$to_do_list%'),
        style: label.span(),
        features: [id('show'), watchRef({ref: '%$to_do_list%', includeChildren: 'yes'})]
      })
    ],
    features: [variable({name: 'to_do_list', value: asIs([{task: 'home', completed: true}]), watchable: true}),
      variable({name: 'input', value: 'hey', watchable: true})
    ]
  })
})


jb.component('todomvc.test', { /* todomvc.test */ 
  impl: group({
    title: 'test',
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
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
                  editableBoolean({
                    databind: '%completed%',
                    style: editableBoolean.checkbox(),
                    textForTrue: 'yes',
                    textForFalse: 'no',
                    features: [css.class('toggle'), hidden('%$editableline%')]
                  }),
                  editableText({
                    databind: '%task%',
                    updateOnBlur: true,
                    style: {
                      $: 'editable-text.input-or-label',
                      control: control.firstSucceeding({
                        controls: [
                          controlWithCondition(
                            '%$editable%',
                            editableText({
                              databind: '%$editableTextModel/databind%',
                              updateOnBlur: true,
                              style: editableText.input(),
                              features: [
                                feature.onEvent({
                                  event: 'blur',
                                  action: runActions(writeValue('%$editable%', false), call('onToggle'))
                                }),
                                css.class('%$inputCssClass%')
                              ]
                            })
                          ),
                          label({
                            title: ctx => ctx.exp('%$editableTextModel/databind%'),
                            style: label.htmlTag('label'),
                            features: [
                              feature.onEvent({
                                event: 'dblclick',
                                action: runActions(
                                  writeValue('%$editable%', true),
                                  focusOnSibling('.%$inputCssClass%'),
                                  call('onToggle')
                                )
                              }),
                              css.class('%$labelCssClass%')
                            ]
                          })
                        ],
                        style: firstSucceeding.style(),
                        features: [
                          variable({name: 'editable', mutable: true}),
                          firstSucceeding.watchRefreshOnCtrlChange('%$editable%', false)
                        ]
                      }),
                      modelVar: 'editableTextModel',
                      inputCssClass: 'edit',
                      labelCssClass: '',
                      onToggle: toggleBooleanValue('%$editableline%')
                    },
                    features: null
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
                    features: [
                      css.class('destroy'),
                      hidden('%$editableline%'),
                      watchRef({ref: '%$editableline%', allowSelfRefresh: false})
                    ]
                  })
                ],
                features: [
                  conditionalClass('completed', '%completed%'),
                  variable({name: '%$editableline%', value: false, mutable: true})
                ]
              })
            ],
            style: itemlist.ulLi(),
            itemVariable: 'item',
            features: [
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
            features: [watchRef({ref: '%$todo%', includeChildren: 'yes'}), css.class('todo-count')]
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
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
          watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: false}),
          watchRef('%$filterBy%')
        ]
      })
    ],
    features: [
      variable({name: 'filterBy', value: 'all', watchable: true}),
      variable({name: 'input', watchable: true}),
      css.class('todoapp')
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
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
                  editableBoolean({
                    databind: '%completed%',
                    style: editableBoolean.checkbox(),
                    textForTrue: 'yes',
                    textForFalse: 'no',
                    features: [css.class('toggle'), hidden('%$editableline%'), watchRef('%$editableline%')]
                  }),
                  editableText({
                    databind: '%task%',
                    updateOnBlur: true,
                    style: {
                      $: 'editable-text.input-or-label',
                      inputCssClass: 'edit',
                      labelCssClass: '',
                      onToggle: toggleBooleanValue('%$editableline%')
                    }
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
                    features: [css.class('destroy'), hidden('%$editableline%'), watchRef('%$editableline%')]
                  })
                ],
                features: [
                  conditionalClass('completed', '%completed%'),
                  variable({name: 'editableline', value: true, watchable: true})
                ]
              })
            ],
            style: itemlist.ulLi(),
            itemVariable: 'item',
            features: [
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
            features: [watchRef({ref: '%$todo%', includeChildren: 'yes'}), css.class('todo-count')]
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
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
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
          watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: false}),
          watchRef('%$filterBy%')
        ]
      })
    ],
    features: [
      variable({name: 'filterBy', value: 'all', watchable: true}),
      variable({name: 'input', watchable: true}),
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
          style: label.htmlTag('label'),
          title: ctx => ctx.exp('%$editableTextModel/databind%'),
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
        {$: 'var', name: 'editable', watchable: true},
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


jb.component('todomvc.xx', { /* todomvc.xx */ 
  type: 'control',
  impl: group({
    controls: [label({title: 'my label', style: label.span()})]
  })
}) 

