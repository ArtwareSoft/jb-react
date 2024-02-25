component('studio.categoriesMarks', {
  params: [
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: pipeline(
    {
      '$': 'object',
      control: pipeline(
        list('common:100','control:95','input:90','group:85','studio-helper:0,suggestions-test:0,studio:0,test:0,basic:0,ui-tests:0,studio-helper-dummy:0,itemlist-container:0'),
        split(','),
        {'$': 'object', code: split(':', { part: 'first' }), mark: split(':', { part: 'second' })}
      ),
      feature: pipeline(
        list('css:100','watch:95','lifecycle:90','events:85','group:80','all:20','feature:0,tabs:0,text:0,picklist:0,studio:0,text:0,menu:0,flex-layout-container:0,md-style:0,itemlist-container:0,editable-text:0,editable-boolean:0,first-succeeding:0,itemlist-filter:0','md-style:0'),
        split(','),
        {'$': 'object', code: split(':', { part: 'first' }), mark: split(':', { part: 'second' })}
      ),
      'group-style': pipeline(
        list('layout:100','group:90','tabs:0'),
        split(','),
        {'$': 'object', code: split(':', { part: 'first' }), mark: split(':', { part: 'second' })}
      )
    },
    firstSucceeding(ctx => ctx.data[ctx.exp('%$type%','string')], {'$': 'object', code: 'all', mark: '100'})
  )
})

component('studio.flattenCategories', {
  type: 'data',
  aggregator: true,
  impl: ctx =>
    ctx.data.filter(cat=>cat.code != 'all')
      .flatMap(category=> [{text: `---${category.code}---`}, ...category.pts.map(text => ({text, compName: text, description: jb.comps[text].description}))])
})

component('studio.selectProfile', {
  type: 'control',
  params: [
    {id: 'onSelect', type: 'action', dynamic: true},
    {id: 'onBrowse', type: 'action', dynamic: true},
    {id: 'type', as: 'string'},
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        controls: [
          itemlistContainer.search({
            title: 'search',
            searchIn: search.fuse({
              keys: list(
                obj(prop('name', 'id'), prop('weight', '0.6', { type: 'number' })),
                obj(prop('name', 'desc'), prop('weight', '0.2', { type: 'number' })),
                obj(prop('name', 'name'), prop('weight', '0.4', { type: 'number' }))
              ),
              threshold: '0.3'
            }),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText.mdcInput('200'),
            features: feature.onEsc(dialog.closeDialog(false))
          }),
          control.icon('search', 'search icon', { features: css.margin('20', '-25') })
        ],
        layout: layout.horizontal(3)
      }),
      group({
        controls: [
          itemlist({
            items: pipeline(
              '%$Categories%',
              filter(
                or(equals('%code%', '%$SelectedCategory%'), notEmpty('%$itemlistCntrData/search_pattern%'))
              ),
              '%pts%',
              ({data}) => ({ id: data, desc: jb.comps[data].description }),
              itemlistContainer.filter(),
              '%id%',
              unique('%%', { items: '%%' })
            ),
            controls: text(studio.unMacro(), 'profile'),
            style: itemlist.ulLi(),
            visualSizeLimit: '30',
            features: [
              itemlist.selection('%$itemlistCntrData/selected%', {
                onSelection: call('onBrowse'),
                onDoubleClick: runActions(watchableComps.cleanSelectionPreview(), call('onSelect'), dialog.closeDialog()),
                autoSelectFirst: true
              }),
              itemlist.keyboardSelection({ onEnter: runActions(watchableComps.cleanSelectionPreview(), call('onSelect'), dialog.closeDialog()) }),
              watchRef('%$SelectedCategory%'),
              watchRef('%$itemlistCntrData/search_pattern%'),
              css.margin('3', { selector: '>li' }),
              css.height('360', 'auto'),
              css.width('200'),
              itemlist.infiniteScroll('2')
            ]
          }),
          picklist('', '%$SelectedCategory%', {
            options: '%$Categories%',
            style: styleByControl({
              control: group({
                controls: itemlist({
                  items: '%$picklistModel/options/code%',
                  controls: text(pipeline('%$Categories%', filter('%code% == %$item%'), '%code% (%pts/length%)'), {
                    style: text.span(),
                    features: [
                      css.width('120'),
                      css('{text-align: left}'),
                      css.padding({ left: '10' })
                    ]
                  }),
                  style: itemlist.ulLi(),
                  features: [
                    itemlist.selection('%$SelectedCategory%', {
                      cssForSelected: 'box-shadow: 3px 0px 0 0 var(--jb-dropdown-shadow) inset; color: black !important; background: none !important; !important'
                    })
                  ]
                }),
                features: group.itemlistContainer()
              }),
              modelVar: 'picklistModel'
            }),
            features: picklist.onChange(writeValue('%$itemlistCntrData/search_pattern%'))
          })
        ],
        title: 'categories and items',
        layout: layout.horizontal('33')
      }),
      text(pipeline('%$itemlistCntrData/selected%', tgp.val('%%'), '%description%'), { style: text.span() })
    ],
    title: 'itemlist-with-find',
    layout: layout.vertical(3),
    features: [
      css.margin('10', '20'),
      variable('unsortedCategories', tgp.categoriesOfType('%$type%')),
      variable('Categories', picklist.sortedOptions('%$unsortedCategories%', {
        marks: studio.categoriesMarks('%$type%', '%$path%')
      })),
      watchable('SelectedCategory', If(notEmpty(tgp.val('%$path%')), 'all', '%$Categories[0]/code%')),
      group.itemlistContainer(tgp.compName('%$path%')),
      css.width('400')
    ]
  })
})

component('studio.openNewProfileDialog', {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()},
    {id: 'type', as: 'string'},
    {id: 'index', as: 'number'},
    {id: 'mode', option: 'insert,insert-control,update', defaultValue: 'insert'},
    {id: 'onClose', type: 'action', dynamic: true}
  ],
  impl: openDialog({
    title: 'new %$type%',
    content: studio.selectProfile({
      onSelect: action.switch(
        action.switchCase('%$mode% == "insert-control"', tgp.insertControl('%%', '%$path%')),
        action.switchCase({
          condition: '%$mode% == "insert"',
          action: tgp.addArrayItem('%$path%', studio.newProfile('%%'), { index: '%$index%' })
        }),
        action.switchCase('%$mode% == "update"', tgp.setComp('%$path%', '%%'))
      ),
      type: '%$type%',
      path: '%$path%'
    }),
    style: dialog.studioFloating(),
    features: [
      css.height('520', 'hidden', { minMax: 'min' }),
      css.width('450', 'hidden'),
      dialogFeature.closeWhenClickingOutside(),
      css('~ .mdc-text-field { background-color: inherit }'),
      dialogFeature.dragTitle('new %$type%', true),
      studio.nearLauncherPosition(),
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.onClose(call('onClose'))
    ]
  })
})

component('studio.pickProfile', {
  description: 'picklist for picking a profile in a context',
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button(prettyPrint(tgp.val('%$path%'), true), studio.openPickProfile('%$path%'), {
    style: button.selectProfileStyle(),
    features: [
      studio.watchPath('%$path%', 'yes'),
      css.opacity(0.7)
    ]
  })
})

component('studio.openPickProfile', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    title: pipeline(tgp.paramType('%$path%'), 'select %%'),
    content: group(
      studio.selectProfile({
        onSelect: tgp.setComp('%$path%', '%%'),
        onBrowse: If({
          condition: or(
            equals('layout', tgp.paramType('%$path%')),
            endsWith('-style', tgp.paramType('%$path%'))
          ),
          then: tgp.setComp('%$path%', '%%')
        }),
        type: tgp.paramType('%$path%'),
        path: '%$path%'
      }),
      studio.properties('%$path%')
    ),
    style: dialog.studioFloating(),
    features: [
      css.height('520', 'hidden', { minMax: 'min' }),
      css.width('450', 'hidden'),
      css('~ .mdc-text-field { background-color: inherit }'),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.autoFocusOnFirstInput(),
      css.padding({ right: '20' }),
      feature.initValue('%$dialogData/originalVal%', pipeline(tgp.val('%$path%'), property('$'))),
      dialogFeature.onClose(If(not('%%'), tgp.setComp('%$path%', '%$dialogData/originalVal%')))
    ]
  })
})

component('studio.openNewPage', {
  type: 'action',
  impl: studio.openNewProfile('New Reusable Control (page)', runActions(
    Var('compName', tgp.titleToId('%$dialogData/name%')),
    studio.newComp('%$compName%', {
      compContent: asIs({type: 'control', impl: {$: 'control<>group'}}),
      file: '%$dialogData/file%'
    }),
    writeValue('%$studio/profile_path%', '%$compName%~impl'),
    writeValue('%$studio/circuit%', '%$compName%'),
    studio.openControlTree(),
    popup.regainCanvasFocus()
  ))
})

component('studio.openNewFunction', {
  type: 'action',
  impl: studio.openNewProfile('New Function', runActions(
    Var('compName', tgp.titleToId('%$dialogData/name%')),
    studio.newComp('%$compName%', {
      compContent: asIs({type: 'data', impl: {$: 'data<>pipeline', items: ['']}}),
      file: '%$dialogData/file%'
    }),
    writeValue('%$studio/profile_path%', '%$compName%'),
    studio.openJbEditor('%$compName%'),
    refreshControlById('functions')
  ))
})

component('studio.openNewProfile', {
  type: 'action',
  params: [
    {id: 'title', as: 'string'},
    {id: 'onOK', type: 'action', dynamic: true}
  ],
  impl: openDialog({
    title: '%$title%',
    content: group({
      controls: [
        editableText('name', '%$dialogData/name%', {
          style: editableText.mdcInput(),
          features: [
            feature.initValue('%$dialogData/name%', '%$studio/project%.myComp'),
            feature.onEnter(dialog.closeDialog()),
            validation(matchRegex('^[a-zA-Z_0-9.]+$'), 'invalid name')
          ]
        }),
        picklist('file', '%$dialogData/file%', {
          options: picklist.options(sourceEditor.filesOfProject()),
          style: picklist.mdcSelect(),
          features: [
            feature.initValue('%$dialogData/file%', pipeline(sourceEditor.filesOfProject(), first())),
            validation(notEmpty('%%'), 'mandatory')
          ]
        })
      ],
      title: '',
      layout: layout.horizontal('11'),
      style: group.div(),
      features: [
        css.padding('14', '11'),
        css.width('600'),
        css.height('200')
      ]
    }),
    style: dialog.dialogOkCancel(),
    onOK: call('onOK'),
    features: [dialogFeature.autoFocusOnFirstInput(), dialogFeature.maxZIndexOnClick(), dialogFeature.dragTitle()]
  })
})

component('studio.insertCompOption', {
  params: [
    {id: 'title', as: 'string'},
    {id: 'comp', as: 'string'}
  ],
  impl: menu.action('%$title%', tgp.insertControl('%$comp%', studio.currentProfilePath()))
})

component('studio.insertControlMenu', {
  impl: menu.menu('Insert', {
    options: [
      menu.menu('Control', {
        options: [
          studio.insertCompOption('Label', 'label'),
          studio.insertCompOption('Button', 'button')
        ]
      }),
      menu.menu('Input', {
        options: [
          studio.insertCompOption('Editable Text', 'editable-text'),
          studio.insertCompOption('Editable Number', 'editable-number'),
          studio.insertCompOption('Editable Boolean', 'editable-boolean')
        ]
      }),
      menu.action('More...', studio.openNewProfileDialog({ type: 'control', mode: 'insert-control' })),
      menu.separator(),
      menu.action({
        title: 'Drop html from any web site',
        action: openDialog({
          title: 'Drop html from any web site',
          content: group({
            controls: [
              button('drop here', {
                style: button.mdc(),
                raised: '',
                features: [
                  css.height('80'),
                  studio.dropHtml(runActions(tgp.insertControl('%$newCtrl%', studio.currentProfilePath()), dialog.closeDialog()))
                ]
              }),
              editableText('paste html here', '%$studio/htmlToPaste%', {
                style: editableText.textarea('3', '80'),
                features: htmlAttribute('placeholder', 'or paste html here')
              })
            ],
            layout: layout.vertical(),
            features: [
              css.width('400'),
              css.padding({ left: '4', right: '4' })
            ]
          }),
          style: dialog.dialogOkCancel(),
          onOK: If('%$studio/htmlToPaste%', tgp.insertControl(studio.htmlToControl('%$studio/htmlToPaste%'), studio.currentProfilePath())),
          features: dialogFeature.dragTitle()
        }),
        shortcut: ''
      }),
      menu.separator(),
      menu.action('New Page (Control)', studio.openNewPage()),
      menu.action('New Function', studio.openNewFunction())
    ]
  })
})

component('studio.newProfile', {
  params: [
    {id: 'compName', as: 'string'}
  ],
  impl: (ctx,compName) => jb.tgp.newProfile(jb.tgp.getCompById(compName), compName)
})

component('studio.newComp', {
  type: 'action',
  params: [
    {id: 'compName', as: 'string'},
    {id: 'compContent', byName: true},
    {id: 'file', as: 'string'}
  ],
  impl: (ctx, compName, compContent,file) => {
    component(compName, jb.frame.JSON.parse(JSON.stringify({...compContent, type: '_'})))
    const path = (jb.frame.jbBaseProjUrl || '') + jb.studio.host.pathOfJsFile(ctx.exp('%$studio/project%'), file)
    jb.comps[compName].$location = {path, newComp: true}
    jb.tgp.writeValue(jb.tgp.ref(`${compName}~type`),compContent.type || '',ctx)
  }
})

