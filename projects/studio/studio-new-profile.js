jb.component('studio.categories-marks', { /* studio_categoriesMarks */
  params: [
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: pipeline(
    {
      $: 'object',
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
          $: 'object',
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
          $: 'object',
          code: split({separator: ':', part: 'first'}),
          mark: split({separator: ':', part: 'second'})
        }
      ),
      'group.style': pipeline(
        list('layout:100', 'group:90', 'tabs:0'),
        split(','),
        {
          $: 'object',
          code: split({separator: ':', part: 'first'}),
          mark: split({separator: ':', part: 'second'})
        }
      )
    },
    firstSucceeding(
      ctx => ctx.data[ctx.exp('%$type%','string')],
      {$: 'object', code: 'all', mark: '100'}
    )
  )
})

jb.component('studio.select-profile', { /* studio_selectProfile */
  type: 'control',
  params: [
    {id: 'onSelect', type: 'action', dynamic: true},
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'itemlist-with-find',
    style: layout_vertical(3),
    controls: [
      group({
        style: layout_horizontal(3),
        controls: [
          itemlistContainer_search({
            title: 'search',
            searchIn: itemlistContainer_searchInAllProperties(),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText_mdlInput('200'),
            features: feature_onEsc(dialog_closeContainingPopup(false))
          }),
          materialIcon({
            icon: 'search',
            title: 'search icon',
            style: icon_material(),
            features: css_margin({top: '20', left: '-25'})
          })
        ]
      }),
      group({
        title: 'categories and items',
        style: layout_horizontal('33'),
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
              itemlistContainer_filter(),
              unique('%%', '%%')
            ),
            controls: [
              label({
                title: highlight('%%', '%$itemlistCntrData/search_pattern%'),
                style: label_span(),
                features: [
                  css('{ text-align: left; }'),
                  css_padding({top: '0', left: '4', right: '4', bottom: '0'}),
                  css_width({width: '250', minMax: 'min'})
                ]
              })
            ],
            itemVariable: 'item',
            features: [
              css_height({height: '300', overflow: 'auto', minMax: ''}),
              itemlist_selection({
                databind: '%$itemlistCntrData/selected%',
                onSelection: runActions(
                  {
                    $if: contains({text: ['control', 'style'], allText: '%$type%'}),
                    then: call(Var('selectionPreview', true), 'onSelect')
                  }
                ),
                onDoubleClick: runActions(studio_cleanSelectionPreview(), call('onSelect'), dialog_closeContainingPopup()),
                autoSelectFirst: true
              }),
              itemlist_keyboardSelection({
                onEnter: runActions(studio_cleanSelectionPreview(), call('onSelect'), dialog_closeContainingPopup())
              }),
              watchRef('%$SelectedCategory%'),
              watchRef('%$itemlistCntrData/search_pattern%'),
              css_margin({top: '3', selector: '>li'}),
              css_width('200')
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
                    style: label_span(),
                    features: [css_width('120'), css('{text-align: left}'), css_padding({left: '10'})]
                  }),
                  style: itemlist_ulLi(),
                  watchItems: false,
                  features: [
                    itemlist_selection({
                      databind: '%$SelectedCategory%',
                      cssForSelected: 'box-shadow: 3px 0px 0 0 #304ffe inset; color: black !important; background: none !important; !important'
                    })
                  ]
                }),
                features: group_itemlistContainer({})
              }),
              'picklistModel'
            ),
            features: picklist_onChange(writeValue('%$itemlistCntrData/search_pattern%'))
          })
        ]
      }),
      label({
        title: pipeline('%$itemlistCntrData/selected%', studio_val('%%'), '%description%'),
        style: label_span()
      })
    ],
    features: [
      css_margin({top: '10', left: '20'}),
      variable({name: 'unsortedCategories', value: studio_categoriesOfType('%$type%', '%$path%')}),
      variable({
        name: 'Categories',
        value: picklist_sortedOptions('%$unsortedCategories%', studio_categoriesMarks('%$type%', '%$path%'))
      }),
      variable({
        name: 'SelectedCategory',
        value: {$if: studio_val('%$path%'), then: 'all', else: '%$Categories[0]/code%'},
        mutable: true
      }),
      variable({name: 'SearchPattern', value: '', mutable: true}),
      group_itemlistContainer({initialSelection: studio_compName('%$path%')})
    ]
  })
})

jb.component('studio.open-new-profile-dialog', { /* studio_openNewProfileDialog */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio_currentProfilePath()},
    {id: 'type', as: 'string'},
    {id: 'mode', option: 'insert,insert-control,update', defaultValue: 'insert'},
    {id: 'onClose', type: 'action', dynamic: true}
  ],
  impl: openDialog({
    style: dialog_studioFloating({}),
    content: studio_selectProfile({
      onSelect: action_if(
        '%$mode% == \"insert-control\"',
        studio_insertControl('%$path%', '%%'),
        {
          $if: '%$mode% == \"insert\"',
          then: studio_addArrayItem('%$path%', {$object: {$: '%%'}}),
          else: studio_setComp('%$path%', '%%')
        }
      ),
      type: '%$type%',
      path: '%$path%'
    }),
    title: 'new %$type%',
    features: [
      css_height({height: '430', overflow: 'hidden'}),
      css_width({width: '450', overflow: 'hidden'}),
      dialogFeature_dragTitle('new %$type%'),
      dialogFeature_nearLauncherPosition({offsetLeft: 0, offsetTop: 0}),
      dialogFeature_autoFocusOnFirstInput(),
      dialogFeature_onClose([call('onClose')])
    ]
  })
})

jb.component('studio.pick-profile', { /* studio_pickProfile */
  description: 'picklist for picking a profile in a context',
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: firstSucceeding(studio_compName('%$path%'), ''),
    action: openDialog({
      style: dialog_popup(),
      content: studio_selectProfile({
        onSelect: studio_setComp('%$path%', '%%'),
        type: studio_paramType('%$path%'),
        path: '%$path%'
      }),
      features: [dialogFeature_autoFocusOnFirstInput(), css_padding({right: '20'})]
    }),
    style: button_selectProfileStyle(),
    features: studio_watchPath('%$path%')
  })
})

jb.component('studio.open-new-page', { /* studio_openNewPage */
  type: 'action',
  impl: openDialog({
    style: dialog_dialogOkCancel(),
    content: group({
      style: group_div(),
      controls: [
        editableText({
          title: 'page name',
          databind: '%$name%',
          style: editableText_mdlInput(),
          features: feature_onEnter(dialog_closeContainingPopup())
        })
      ],
      features: css_padding({top: '14', left: '11'})
    }),
    title: 'New Page',
    onOK: [
      ctx => jb.studio.previewjb. component(ctx.exp('%$studio/project%.%$name%'), {
          type: 'control',
          impl :{$: 'group', title1: ctx.exp('%$name%'), contorls: []}
      }),
      writeValue('%$studio/profile_path%', '%$studio/project%.%$name%~impl'),
      writeValue('%$studio/page%', '%$name%'),
      {$: 'studio.open-control-tree', $recursive: true },
      tree_regainFocus(),
      refreshControlById('pages')
    ],
    modal: true,
    features: [variable({name: 'name', mutable: true}), dialogFeature_autoFocusOnFirstInput()]
  })
})

jb.component('studio.insert-comp-option', { /* studio_insertCompOption */
  params: [
    {id: 'title', as: 'string'},
    {id: 'comp', as: 'string'}
  ],
  impl: menu_action({
    title: '%$title%',
    action: studio_insertControl(studio_currentProfilePath(), '%$comp%')
  })
})

jb.component('studio.insert-control-menu', { /* studio_insertControlMenu */ 
  impl: menu_menu({
    title: 'Insert',
    options: [
      menu_menu({
        title: 'Control',
        options: [
          studio_insertCompOption('Label', 'label'),
          studio_insertCompOption('Button', 'button')
        ]
      }),
      menu_menu({
        title: 'Input',
        options: [
          studio_insertCompOption('Editable Text', 'editable-text'),
          studio_insertCompOption('Editable Number', 'editable-number'),
          studio_insertCompOption('Editable Boolean', 'editable-boolean')
        ]
      }),
      menu_action({
        title: 'More...',
        action: studio_openNewProfileDialog({type: 'control', mode: 'insert-control'})
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
