jb.component('studio.categories-marks', { /* studio.categoriesMarks */
  params: [
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: pipeline(
    {
        '$': 'object',
        control: pipeline(
          list(
              'common:100',
              'control:95',
              'input:90',
              'group:85',
              'studio-helper:0,suggestions-test:0,studio:0,test:0,basic:0,ui-tests:0,studio-helper-dummy:0,itemlist-container:0'
            ),
          split(','),
          {
              '$': 'object',
              code: split({separator: ':', part: 'first'}),
              mark: split({separator: ':', part: 'second'})
            }
        ),
        feature: pipeline(
          list(
              'css:100',
              'watch:95',
              'lifecycle:90',
              'events:85',
              'group:80',
              'all:20',
              'feature:0,tabs:0,label:0,picklist:0,mdl:0,studio:0,text:0,menu:0,flex-layout-container:0,mdl-style:0,itemlist-container:0,editable-text:0,editable-boolean:0',
              'mdl-style:0'
            ),
          split(','),
          {
              '$': 'object',
              code: split({separator: ':', part: 'first'}),
              mark: split({separator: ':', part: 'second'})
            }
        ),
        'group.style': pipeline(
          list('layout:100', 'group:90', 'tabs:0'),
          split(','),
          {
              '$': 'object',
              code: split({separator: ':', part: 'first'}),
              mark: split({separator: ':', part: 'second'})
            }
        )
      },
    firstSucceeding(
        ctx => ctx.data[ctx.exp('%$type%','string')],
        {'$': 'object', code: 'all', mark: '100'}
      )
  )
})

jb.component('studio.select-profile', { /* studio.selectProfile */
  type: 'control',
  params: [
    {id: 'onSelect', type: 'action', dynamic: true},
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'itemlist-with-find',
    style: layout.vertical(3),
    controls: [
      group({
        style: layout.horizontal(3),
        controls: [
          itemlistContainer.search({
            title: 'search',
            searchIn: itemlistContainer.searchInAllProperties(),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText.mdlInput('200'),
            features: feature.onEsc(dialog.closeContainingPopup(false))
          }),
          materialIcon({
            icon: 'search',
            title: 'search icon',
            style: icon.material(),
            features: css.margin({top: '20', left: '-25'})
          })
        ]
      }),
      group({
        title: 'categories and items',
        style: layout.horizontal('33'),
        controls: [
          itemlist({
            title: 'items',
            items: pipeline(
              '%$Categories%',
              filter(
                  or(
                    equals('%code%', '%$SelectedCategory%'),
                    notEmpty('%$itemlistCntrData/search_pattern%')
                  )
                ),
              '%pts%',
              itemlistContainer.filter(),
              unique('%%', '%%')
            ),
            controls: [
              label({
                title: highlight('%%', '%$itemlistCntrData/search_pattern%'),
                style: label.span(),
                features: [
                  css('{ text-align: left; }'),
                  css.padding({top: '0', left: '4', right: '4', bottom: '0'}),
                  css.width({width: '250', minMax: 'min'})
                ]
              })
            ],
            itemVariable: 'item',
            features: [
              css.height({height: '300', overflow: 'auto', minMax: ''}),
              itemlist.selection({
                databind: '%$itemlistCntrData/selected%',
                onSelection: runActions(
                  {
                      '$if': contains({text: ['control', 'style'], allText: '%$type%'}),
                      then: call(Var('selectionPreview', true), 'onSelect')
                    }
                ),
                onDoubleClick: runActions(
                  studio.cleanSelectionPreview(),
                  call('onSelect'),
                  dialog.closeContainingPopup()
                ),
                autoSelectFirst: true
              }),
              itemlist.keyboardSelection({
                onEnter: runActions(
                  studio.cleanSelectionPreview(),
                  call('onSelect'),
                  dialog.closeContainingPopup()
                )
              }),
              watchRef('%$SelectedCategory%'),
              watchRef('%$itemlistCntrData/search_pattern%'),
              css.margin({top: '3', selector: '>li'}),
              css.width('200')
            ]
          }),
          picklist({
            title: '',
            databind: '%$SelectedCategory%',
            options: '%$Categories%',
            style: styleByControl(
              group({
                controls: itemlist({
                  items: '%$picklistModel/options/code%',
                  controls: label({
                    title: pipeline('%$Categories%', filter('%code% == %$item%'), '%code% (%pts/length%)'),
                    style: label.span(),
                    features: [css.width('120'), css('{text-align: left}'), css.padding({left: '10'})]
                  }),
                  style: itemlist.ulLi(),
                  features: [
                    itemlist.selection({
                      databind: '%$SelectedCategory%',
                      cssForSelected: 'box-shadow: 3px 0px 0 0 #304ffe inset; color: black !important; background: none !important; !important'
                    })
                  ]
                }),
                features: group.itemlistContainer({})
              }),
              'picklistModel'
            ),
            features: picklist.onChange(writeValue('%$itemlistCntrData/search_pattern%'))
          })
        ]
      }),
      label({
        title: pipeline('%$itemlistCntrData/selected%', studio.val('%%'), '%description%'),
        style: label.span()
      })
    ],
    features: [
      css.margin({top: '10', left: '20'}),
      variable({
        name: 'unsortedCategories',
        value: studio.categoriesOfType('%$type%', '%$path%')
      }),
      variable({
        name: 'Categories',
        value: picklist.sortedOptions(
          '%$unsortedCategories%',
          studio.categoriesMarks('%$type%', '%$path%')
        )
      }),
      variable({
        name: 'SelectedCategory',
        value: {'$if': studio.val('%$path%'), then: 'all', else: '%$Categories[0]/code%'},
        watchable: true
      }),
      variable({name: 'SearchPattern', value: '', watchable: true}),
      group.itemlistContainer({initialSelection: studio.compName('%$path%')})
    ]
  })
})

jb.component('studio.open-new-profile-dialog', { /* studio.openNewProfileDialog */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    {id: 'type', as: 'string'},
    {id: 'index', as: 'number'},
    {id: 'mode', option: 'insert,insert-control,update', defaultValue: 'insert'},
    {id: 'onClose', type: 'action', dynamic: true}
  ],
  impl: openDialog({
    style: dialog.studioFloating({}),
    content: studio.selectProfile({
      onSelect: action.switch(
        [
          action.switchCase(
            '%$mode% == \"insert-control\"',
            studio.insertControl('%$path%', '%%')
          ),
          action.switchCase(
            '%$mode% == \"insert\"',
            studio.addArrayItem({
              path: '%$path%',
              toAdd: {'$object': {'$': '%%'}},
              index: '%$index%'
            })
          ),
          action.switchCase('%$mode% == \"update\"', studio.setComp('%$path%', '%%'))
        ]
      ),
      type: '%$type%',
      path: '%$path%'
    }),
    title: 'new %$type%',
    features: [
      css.height({height: '430', overflow: 'hidden'}),
      css.width({width: '450', overflow: 'hidden'}),
      dialogFeature.dragTitle('new %$type%'),
      studio.nearLauncherPosition(),
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.onClose(call('onClose'))
    ]
  })
})

jb.component('studio.pick-profile', { /* studio.pickProfile */
  description: 'picklist for picking a profile in a context',
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: firstSucceeding(studio.compName('%$path%'), ''),
    action: openDialog({
      style: dialog.popup(),
      content: studio.selectProfile({
        onSelect: studio.setComp('%$path%', '%%'),
        type: studio.paramType('%$path%'),
        path: '%$path%'
      }),
      features: [dialogFeature.autoFocusOnFirstInput(), css.padding({right: '20'})]
    }),
    style: button.selectProfileStyle(),
    features: studio.watchPath('%$path%')
  })
})

jb.component('studio.open-new-page', { /* studio.openNewPage */
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: group({
      style: group.div(),
      controls: [
        editableText({
          title: 'page name',
          databind: '%$name%',
          style: editableText.mdlInput(),
          features: feature.onEnter(dialog.closeContainingPopup())
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Page',
    onOK: [
      ctx => jb.studio.previewjb. component(ctx.exp('%$studio/project%.%$name%'), {
          type: 'control',
          impl :{$: 'group', title1: ctx.exp('%$name%'), contorls: []}
      }),
      writeValue('%$studio/profile_path%', '%$studio/project%.%$name%~impl'),
      writeValue('%$studio/page%', '%$name%'),
      studio.openControlTree(),
      tree.regainFocus(),
      refreshControlById('pages')
    ],
    modal: true,
    features: [
      variable({name: 'name', watchable: true}),
      dialogFeature.autoFocusOnFirstInput()
    ]
  })
})

jb.component('studio.insert-comp-option', { /* studio.insertCompOption */
  params: [
    {id: 'title', as: 'string'},
    {id: 'comp', as: 'string'}
  ],
  impl: menu.action({
    title: '%$title%',
    action: studio.insertControl(studio.currentProfilePath(), '%$comp%')
  })
})

jb.component('studio.insert-control-menu', { /* studio.insertControlMenu */ 
  impl: menu.menu({
    title: 'Insert',
    options: [
      menu.menu({
        title: 'Control',
        options: [
          studio.insertCompOption('Label', 'label'),
          studio.insertCompOption('Button', 'button')
        ]
      }),
      menu.menu({
        title: 'Input',
        options: [
          studio.insertCompOption('Editable Text', 'editable-text'),
          studio.insertCompOption('Editable Number', 'editable-number'),
          studio.insertCompOption('Editable Boolean', 'editable-boolean')
        ]
      }),
      menu.action({
        title: 'More...',
        action: studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})
      })
    ]
  })
})

jb.studio.newControl = path =>
  new jb.jbCtx().run({$: 'studio.open-new-profile-dialog',
          path: path,
          type: 'control',
          mode: 'insert-control'
        });
