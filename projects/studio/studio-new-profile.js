jb.component('studio.categoriesMarks', {
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
              'feature:0,tabs:0,text:0,picklist:0,studio:0,text:0,menu:0,flex-layout-container:0,md-style:0,itemlist-container:0,editable-text:0,editable-boolean:0,first-succeeding:0,itemlist-filter:0',
              'md-style:0'
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

jb.component('studio.selectProfile', {
  type: 'control',
  params: [
    {id: 'onSelect', type: 'action', dynamic: true},
    {id: 'onBrowse', type: 'action', dynamic: true},
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'itemlist-with-find',
    layout: layout.vertical(3),
    controls: [
      group({
        layout: layout.horizontal(3),
        controls: [
          itemlistContainer.search({
            title: 'search',
            searchIn: search.fuse({
              keys: list(
                obj(prop('name', 'id'), prop('weight', '0.6', 'number')),
                obj(prop('name', 'desc'), prop('weight', '0.2', 'number')),
                obj(prop('name', 'name'), prop('weight', '0.4', 'number'))
              ),
              threshold: '0.3'
            }),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText.mdcInput('200'),
            features: feature.onEsc(dialog.closeContainingPopup(false))
          }),
          control.icon({
            icon: 'search',
            title: 'search icon',
            features: css.margin({top: '20', left: '-25'})
          })
        ]
      }),
      group({
        title: 'categories and items',
        layout: layout.horizontal('33'),
        controls: [
          itemlist({
            items: pipeline(
              '%$Categories%',
              filter(
                  or(
                    equals('%code%', '%$SelectedCategory%'),
                    notEmpty('%$itemlistCntrData/search_pattern%')
                  )
                ),
              '%pts%',
              ({data}) => ({ id: data, desc: jb.studio.previewjb.comps[data
].description }),
              itemlistContainer.filter(),
              '%id%',
              unique('%%', '%%')
            ),
            controls: text({text: studio.unMacro(), title: 'profile'}),
            style: itemlist.ulLi(),
            visualSizeLimit: '30',
            features: [
              itemlist.selection({
                databind: '%$itemlistCntrData/selected%',
                onSelection: call('onBrowse'),
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
              css.height({height: '360', overflow: 'auto'}),
              css.width('200'),
              itemlist.infiniteScroll('2')
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
                  controls: text({
                    text: pipeline('%$Categories%', filter('%code% == %$item%'), '%code% (%pts/length%)'),
                    style: text.span(),
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
      text({
        text: pipeline('%$itemlistCntrData/selected%', studio.val('%%'), '%description%'),
        style: text.span()
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
      group.itemlistContainer({initialSelection: studio.compName('%$path%')}),
      css.width('400')
    ]
  })
})

jb.component('studio.openNewProfileDialog', {
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
            studio.insertControl('%%', '%$path%')
          ),
          action.switchCase(
            '%$mode% == \"insert\"',
            studio.addArrayItem({
              path: '%$path%',
              toAdd: studio.newProfile('%%'),
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
      css.height({height: '520', overflow: 'hidden', minMax: 'min'}),
      css.width({width: '450', overflow: 'hidden'}),
      dialogFeature.closeWhenClickingOutside(),
      css('~ .mdc-text-field { background-color: inherit }'),
      dialogFeature.dragTitle('new %$type%'),
      studio.nearLauncherPosition(),
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.onClose(call('onClose'))
    ]
  })
})

jb.component('studio.pickProfile', {
  description: 'picklist for picking a profile in a context',
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: prettyPrint(studio.val('%$path%'), true),
    action: studio.openPickProfile('%$path%'),
    style: button.selectProfileStyle(),
    features: [studio.watchPath({path: '%$path%', includeChildren: 'yes'}), css.opacity(0.7)]
  })
})

jb.component('studio.openPickProfile', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    style: dialog.studioFloating({}),
    content: group({
      controls: [
        studio.selectProfile({
          onSelect: studio.setComp('%$path%', '%%'),
          onBrowse: action.if(
            or(
              equals('layout', studio.paramType('%$path%')),
              endsWith('.style', studio.paramType('%$path%'))
            ),
            studio.setComp('%$path%', '%%')
          ),
          type: studio.paramType('%$path%'),
          path: '%$path%'
        }),
        studio.properties('%$path%')
      ]
    }),
    title: pipeline(studio.paramType('%$path%'), 'select %%'),
    features: [
      css.height({height: '520', overflow: 'hidden', minMax: 'min'}),
      css.width({width: '450', overflow: 'hidden'}),
      css('~ .mdc-text-field { background-color: inherit }'),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.autoFocusOnFirstInput(),
      css.padding({right: '20'}),
      feature.init(writeValue('%$dialogData/originalVal%', studio.val('%$path%'))),
      dialogFeature.onClose(
        action.if(not('%%'), studio.setComp('%$path%', '%$dialogData/originalVal%'))
      )
    ]
  })
})

jb.component('studio.openNewPage', {
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: group({
      style: group.div(),
      controls: [
        editableText({
          title: 'page name',
          databind: '%$dialogData/name%',
          style: editableText.mdcInput(),
          features: [
            feature.onEnter(dialog.closeContainingPopup()),
            validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid page name')
          ]
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Page',
    onOK: runActions(
      Var('compName', ctx => jb.macroName(ctx.exp('%$dialogData/name%'))),
      Var('compId', pipeline(list(studio.projectId(), '%$compName%'), join('.'))),
      studio.newComp('%$compId%', asIs({type: 'control', impl: group({})})),
      writeValue('%$studio/profile_path%', '%$compId%~impl'),
      writeValue('%$studio/page%', '%$compName%'),
      studio.openControlTree(),
      tree.regainFocus(),
    ),
    modal: true,
    features: [dialogFeature.autoFocusOnFirstInput()]
  })
})

jb.component('studio.openNewFunction', {
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: group({
      style: group.div(),
      controls: [
        editableText({
          title: 'function name',
          databind: '%$dialogData/name%',
          style: editableText.mdcInput(),
          features: [
            feature.onEnter(dialog.closeContainingPopup()),
            validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid function name')
          ]
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New Function',
    onOK: runActions(
      Var('compName', ctx => jb.macroName(ctx.exp('%$dialogData/name%'))),
      Var('compId', pipeline(list(studio.projectId(), '%$compName%'), join('.'))),
      studio.newComp(
          '%$compId%',
          asIs({type: 'data', impl: pipeline(''), testData: 'sampleData'})
        ),
      writeValue('%$studio/profile_path%', '%$compId%'),
      studio.openJbEditor('%$compId%'),
      refreshControlById('functions')
    ),
    modal: true,
    features: [dialogFeature.autoFocusOnFirstInput()]
  })
})

jb.component('studio.insertCompOption', {
  params: [
    {id: 'title', as: 'string'},
    {id: 'comp', as: 'string'}
  ],
  impl: menu.action({
    title: '%$title%',
    action: studio.insertControl('%$comp%')
  })
})

jb.component('studio.insertControlMenu', {
  impl: menu.menu({
    title: 'Insert',
    options: [
      menu.action({
        title: 'Drop html from any web site',
        action: openDialog({
          style: dialog.dialogOkCancel(),
          content: group({
            layout: layout.vertical(),
            controls: [
              button({
                title: 'drop here',
                style: button.mdc(),
                raised: '',
                features: [
                  css.height('80'),
                  studio.dropHtml(
                    runActions(studio.insertControl('%$newCtrl%'), dialog.closeContainingPopup())
                  )
                ]
              }),
              editableText({
                title: 'paste html here',
                databind: '%$studio/htmlToPaste%',
                style: editableText.textarea({rows: '3', cols: '80'}),
                features: htmlAttribute('placeholder', 'or paste html here')
              })
            ],
            features: [css.width('400'), css.padding({left: '4', right: '4'})]
          }),
          title: 'Drop html from any web site',
          onOK: action.if(
            '%$studio/htmlToPaste%',
            studio.insertControl(studio.htmlToControl('%$studio/htmlToPaste%'))
          ),
          features: dialogFeature.dragTitle()
        }),
        shortcut: ''
      }),
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

jb.component('studio.newProfile', {
  params: [
    {id: 'compName', as: 'string'}
  ],
  impl: (ctx,compName) => jb.studio.newProfile(jb.studio.getComp(compName), compName)
})

jb.component('studio.newComp', {
  params: [
    {id: 'compName', as: 'string'},
    {id: 'compContent'},
    {id: 'file', as: 'string'},
  ],
  impl: (ctx, compName, compContent,file) => {
    const _jb = jb.studio.previewjb
    _jb.component(compName, compContent)
    const filePattern = '/' + ctx.exp('%$studio/project%')
    const projectFile = file || jb.entries(_jb.comps).map(e=>e[1][_jb.location][0]).filter(x=> x && x.indexOf(filePattern) != -1)[0]
    const compWithLocation = { ...compContent, ...{ [_jb.location]: [projectFile,''] }}
    // fake change for refresh page and save
    jb.studio.writeValue(jb.studio.refOfPath(compName),compWithLocation,ctx)
  }
})

