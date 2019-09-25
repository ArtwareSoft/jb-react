jb.component('todo', { watchableData: [
  {task: 'eat', completed: false},
  {task: 'drink', completed: true},
]
})
jb.component('new-task', { watchableData:
  {task: '', completed: false},
})


jb.component('todomvc.main', { /* todomvc.main */
  type: 'control',
  impl: group({
    controls: [
      label({title: 'todos', style: label.htmlTag('h1')}),
      editableText({
        title: 'input',
        databind: '%$new-task/task%',
        style: editableText.input(),
        features: [
          feature.onEnter(
            runActions(addToArray('%$todo%', '%$new-task%'), writeValue('%$new-task/task%'))
          ),
          css.class('new-tod'),
          css.class('new-todo'),
          htmlAttribute('placeholder', 'What needs to be done?')
        ]
      }),
      group({
        title: 'main',
        controls: [
          itemlist({
            title: 'todo-list',
            items: pipeline('%$todo%', filter(and())),
            controls: [
              group({
                style: layout.flex({alignItems: 'center', spacing: '20'}),
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
                    title: 'delete',
                    action: removeFromArray({array: '%$todo%', itemToRemove: '%%'}),
                    style: button.native(),
                    features: [itemlist.shownOnlyOnItemHover(), css.class('destroy')]
                  })
                ],
                features: conditionalClass('completed', '%completed%')
              })
            ],
            features: [
              watchRef({ref: '%$todo%', includeChildren: 'yes', allowSelfRefresh: true}),
              css.class('todo-list')
            ]
          })
        ],
        features: css.class('main')
      }),
      group({
        title: 'toolbar',
        style: layout.flex({spacing: '30', justifyContent: 'space-between'}),
        controls: [
          text({
            title: 'items left',
            text: pipeline(
              '%$todo%',
              filter('%completed% == false'),
              count(),
              If('%% > 1', '%% items', '%% item'),
              '%% left'
            ),
            style: label.span(),
            features: watchRef({ref: '%$todo%', includeChildren: 'yes', delay: ''})
          }),
          picklist({
            title: 'filter by',
            databind: '%$filterBy%',
            options: picklist.optionsByComma('all,completed,active'),
            style: styleByControl(
              itemlist({
                items: '%$picklistModel/options%',
                controls: button({title: '%text%', style: button.href(), features: []}),
                style: itemlist.horizontal('30'),
                features: [
                  itemlist.selection({
                    onSelection: writeValue('%$picklistModel/databind%', '%code%'),
                    cssForSelected: 'border-color: rgba(175, 47, 47, 0.2); color : red'
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
    features: css.class('todoapp')
  })
})
