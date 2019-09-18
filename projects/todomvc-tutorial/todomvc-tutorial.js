
jb.component('todo', { /* todo */ 
  watchableData: [
  ]
}) 

jb.component('filterBy', { /* filterBy */ 
  watchableData: 'all'
}) 

jb.component('todomvc-tutorial.main', { /* todomvcTutorial.main */
  type: 'control',
  impl: group({
    controls: [
      group({
        title: 'header',
        style: layout.horizontal('3'),
        controls: [
          label({title: 'todos', style: label.htmlTag('h1', 'headline')}),
          editableText({
            title: 'input',
            databind: '%$input%',
            style: editableText.input(),
            features: [
              css.class('new-todo'),
              feature.onEnter(
                action.if(
                    '%$input%',
                    runActions(
                      addToArray(
                          '%$todo%',
                          obj(prop('task', '%$input%', 'string'), prop('completed', undefined, 'boolean'))
                        ),
                      writeValue('%$input%')
                    )
                  )
              ),
              htmlAttribute('placeholder', 'What needs to be done?')
            ]
          })
        ]
      }),
      group({
        title: 'main',
        controls: [
          editableBoolean({
            databind: isEmpty({'$': 'todomvc-tutorial.filter-completed', filterby: 'false'}),
            style: editableBoolean.checkboxWithLabel(),
            title: 'toggle all',
            textForTrue: 'yes',
            textForFalse: 'no',
            features: [
              css.class('toggle-all'),
              hidden(notEmpty('%$todo%')),
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
              feature.onEvent({
                event: 'change',
                action: action.switch(
                  [
                    {
                      condition: isEmpty({'$': 'todomvc-tutorial.filter-completed', filterby: 'false'}),
                      action: runActionOnItems('%$todo%', toggleBooleanValue('%completed%'))
                    },
                    {
                      condition: 'true',
                      action: runActionOnItems(
                        {'$': 'todomvc-tutorial.filter-completed', filterby: 'false'},
                        toggleBooleanValue('%completed%')
                      )
                    }
                  ]
                )
              })
            ]
          }),
          itemlist({
            items: pipeline(
              '%$todo%',
              If(
                  or(
                    equals('%$filterBy%', 'all'),
                    and(equals('%$filterBy%', 'completed'), '%completed%'),
                    and(equals('%$filterBy%', 'active'), not('%completed%'))
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
                    features: [css.class('toggle'), hidden(not('%$editableline%')), watchRef('%$editableline%')]
                  }),
                  editableText({
                    databind: '%task%',
                    style: {
                      '$': 'todomvc-tutorial.editable-text-input-or-label',
                      inputCssClass: 'edit',
                      onToggle: toggleBooleanValue('%$editableline%')
                    }
                  }),
                  button({
                    title: 'click me',
                    action: splice({
                      array: '%$todo%',
                      fromIndex: indexOf('%$todo%', '%%'),
                      noOfItemsToRemove: '1',
                      itemsToAdd: []
                    }),
                    style: {'$': 'todomvc-tutorial.button.simple'},
                    features: [
                      css.class('destroy'),
                      hidden(not('%$editableline%')),
                      watchRef('%$editableline%')
                    ]
                  })
                ],
                features: [
                  variable({name: 'editableline', watchable: true}),
                  conditionalClass('completed', '%completed%')
                ]
              })
            ],
            style: itemlist.ulLi(),
            itemVariable: 'item',
            features: [
              css.class('todo-list'),
              watchRef({ref: '%$filterBy%', allowSelfRefresh: true}),
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true})
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
            title: pipeline(
              count({'$': 'todomvc-tutorial.filter-completed', filterby: 'false'}),
              '%% item left'
            ),
            style: label.span(),
            features: [
              field.title('items left'),
              watchRef({ref: '%$todo%', includeChildren: 'yes'}),
              css.class('todo-count')
            ]
          }),
          group({
            title: 'filters',
            style: customStyle({
              template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li', {class: 'jb-item'} ,h(ctrl)),ctrl.ctx.data))),
              css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0; display: inline;}`,
              features: group.initGroup()
            }),
            controls: [
              button({
                title: 'All',
                action: writeValue('%$filterBy%', 'all'),
                style: button.href(),
                features: conditionalClass('selected', equals('all', '%$filterBy%'))
              }),
              button({
                title: 'Active',
                action: writeValue('%$filterBy%', 'active'),
                style: button.href(),
                features: conditionalClass('selected', equals('active', '%$filterBy%'))
              }),
              button({
                title: 'Completed',
                action: writeValue('%$filterBy%', 'completed'),
                style: button.href(),
                features: conditionalClass('selected', equals('completed', '%$filterBy%'))
              })
            ],
            features: css.class('filters')
          }),
          button({
            title: 'Clear completed',
            action: runActionOnItems(
              {'$': 'todomvc-tutorial.filter-completed'},
              splice({
                array: '%$todo%',
                fromIndex: indexOf('%$todo%', '%%'),
                noOfItemsToRemove: '1',
                itemsToAdd: []
              })
            ),
            style: button.href(),
            features: [
              css.class('clear-completed'),
              hidden(notEmpty({'$': 'todomvc-tutorial.filter-completed'})),
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true})
            ]
          })
        ],
        features: css.class('footer')
      })
    ],
    features: [css.class('todoapp')]
  })
})

jb.component('todomvc-tutorial.filter-completed',{
  params: [{ id: 'filterby', as: 'boolean', description: 'filter completed by true or false' ,defaultValue: true }],
  impl: pipeline('%$todo%', filter(equals('%completed%','%$filterby%')))
})



jb.component('input', { /* input */ 
  watchableData: ''
}) 




jb.component('todomvc-tutorial.editable-text-input-or-label', {
  type: 'editable-text.style',
  params:[

    { id: 'inputCssClass', as: 'string' , defaultValue: "input"  },
    { id: 'onToggle', type: 'action' , dynamic: true  }
    
  ], 
  impl:  styleByControl(control.firstSucceeding({
    controls: [
      controlWithCondition(
        '%$editable%',
        editableText({
          databind: '%$editableTextModel/databind%',
          updateOnBlur: true,
          style: editableText.input(),
          features: [
            feature.onEvent({event: 'blur',
             action:runActions(toggleBooleanValue('%$editable%'),call('onToggle'))
            }),
            css.class('%$inputCssClass%')
          ]
        })
      ),
      label({
        title: '%$editableTextModel/databind%',
        style: label.htmlTag('label'),
        features: feature.onEvent({
          event: 'dblclick',
          action: runActions(toggleBooleanValue('%$editable%'), 
          focusOnSibling('.%$inputCssClass%'),
          call('onToggle'))
        })
      })
    ],
    style: firstSucceeding.style(),
    features: [
      variable({name: 'editable', watchable: true}),
      firstSucceeding.watchRefreshOnCtrlChange('%$editable%')
    ]
  })
  ,
    'editableTextModel'
  )
})




