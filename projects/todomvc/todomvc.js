component('dataResource.todo', { watchableData: [
  {task: 'eat', completed: false},
  {task: 'drink', completed: true},
]
})

component('dataResource.newTask', {
  watchableData: {
    task: 'sleep well',
    completed: false
  }
})

component('todomvc.main', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      text({text: 'todos', style: text.htmlTag('h1')}),
      editableText({
        title: 'input',
        databind: '%$newTask/task%',
        style: editableText.input(),
        features: [
          feature.onEnter(
            runActions(
              addToArray('%$todo%', '%$newTask%'),
              writeValue('%$newTask/task%', '')
            )
          ),
          css.class('new-todo'),
          htmlAttribute('placeholder', 'What needs to be done?'),
          watchRef({ref: '%$newTask/task%', allowSelfRefresh: true})
        ]
      }),
      group({
        title: 'main',
        controls: [
          itemlist({
            title: '',
            items: pipeline(
              '%$todo%',
              filter(
                  or(
                    and('%completed% == true', '%$filterBy% == completed'),
                    and('%completed% == false', '%$filterBy% == active'),
                    '%$filterBy% == all'
                  )
                )
            ),
            controls: [
              group({
                layout: layout.flex({alignItems: 'center', spacing: '20'}),
                controls: [
                  editableBoolean({
                    databind: '%completed%',
                    style: editableBoolean.checkbox(),
                    features: css.class('toggle')
                  }),
                  editableText({
                    title: '',
                    databind: '%task%',
                    style: editableText.expandable({
                      buttonFeatures: css.class('task'),
                      editableFeatures: css.class('edit')
                    }),
                    features: css.class('editable-text')
                  }),
                  button({
                    title: '',
                    action: removeFromArray({array: '%$todo%', itemToRemove: '%%'}),
                    style: button.native(),
                    features: [itemlist.shownOnlyOnItemHover(), css.class('destroy'), field.title('delete')]
                  })
                ],
                features: css.conditionalClass('completed', '%completed%')
              })
            ],
            features: [
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
              css.class('todo-list'),
              watchRef('%$filterBy%')
            ]
          })
        ],
        features: css.class('main')
      }),
      group({
        title: 'toolbar',
        layout: layout.flex({
          justifyContent: 'space-between',
          alignItems: 'center',
          spacing: '30'
        }),
        controls: [
          text({
            text: pipeline(
              '%$todo%',
              filter('%completed% == false'),
              count(),
              If('%% > 1', '%% items', '%% item'),
              '%% left'
            ),
            title: 'items left',
            style: text.span(),
            features: watchRef({ref: '%$todo%', includeChildren: 'yes'})
          }),
          picklist({
            title: 'filter by',
            databind: '%$filterBy%',
            options: picklist.optionsByComma('all,completed,active'),
            style: styleByControl(
              itemlist({
                items: '%$picklistModel/options%',
                controls: button({
                  title: '%text%',
                  style: button.href(),
                  features: [css.width('%$width%'), css('{text-align: left}')]
                }),
                style: itemlist.horizontal('20'),
                features: [
                  itemlist.selection({
                    onSelection: writeValue('%$picklistModel/databind%', '%code%'),
                    cssForSelected: ' '
                  }),
                  css.class('filters')
                ]
              }),
              'picklistModel'
            )
          })
        ],
        features: css.class('footer')
      })
    ],
    features: [css.class('todoapp'), css.width('600')]
  })
})

component('dataResource.filterBy', { /* dataResource.filterBy */
  watchableData: 'active'
})
