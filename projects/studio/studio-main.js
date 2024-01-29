using('remote-widget,data-browser,watchable-comps,probe-preview,net,tgp,workspace')

component('studio.main', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition(studio.isCircuit(), studio.circuit()),
      studio.jbart()
    ],
    features: [
      group.wait({
        for: ctx => jb.studio.host.settings()
        .then(settings => ctx.run(writeValue('%$studio/settings%',
          Object.assign(ctx.exp('%$studio/settings%'), typeof settings == 'string' ? JSON.parse(settings) : {})))),
        loadingControl: text('')
      }),
      group.firstSucceeding()
    ]
  })
})

component('studio.isNotebook', {
  type: 'boolean',
  impl: () => jb.path(globalThis,'location.pathname').indexOf('/notebook') == 0
})

component('studio.isCircuit', {
  type: 'boolean',
  impl: () => /sourceCode=/.test(jb.path(globalThis,'location.href')||'')
})

component('studio.jbart', {
  type: 'control',
  impl: group({
    controls: [
      studio.topBar(),
      group({
        controls: preview.remoteWidget(),
        features: [
          watchRef('%$studio/page%'),
          watchRef('%$studio/preview%', 'yes'),
          css.height('%$studio/preview/height%', 'auto', { minMax: 'max' }),
          css.width('%$studio/preview/width%', 'auto', { minMax: 'max' })
        ]
      }),
      studio.ctxCounters()
    ],
    features: [
      feature.requireService(urlHistory.mapStudioUrlToResource('studio'))
    ]
  })
})

component('studio.circuit', {
  type: 'control',
  impl: group({
    controls: [
      studio.topBar(),
      group({
        controls: probe.remoteCircuitPreview(),
        features: [
          followUp.action(
            studio.openComponentInJbEditor('%$studio/jbEditor/selected%', '%$studio/probe/circuit%')
          ),
          watchRef('%$studio/preview%', 'yes'),
          css.height('%$studio/preview/height%', 'auto', { minMax: 'max' }),
          css.width('%$studio/preview/width%', 'auto', { minMax: 'max' })
        ]
      }),
      studio.ctxCounters()
    ]
  })
})

// jb.component('studio.jbartOld', {
//   type: 'control',
//   impl: group({
//     controls: [
//       studio.topBar(),
//       group({
//         controls: studio.previewWidget(),
//         features: [
//           id('preview-parent'),
//           group.wait(studio.fetchProjectSettings(), text('loading project settings...'))
//         ]
//       }),
//       studio.pages(),
//       studio.ctxCounters()
//     ],
//     features: [
//         feature.requireService(studio.autoSaveService()),
//         feature.requireService(urlHistory.mapStudioUrlToResource('studio'))
//     ]
//   })
// })

component('dataResource.studio', {
  watchableData: {
    circuit: /sourceCode=/.test(jb.path(globalThis,'location.href')||'') ? (jb.path(globalThis,'location.pathname')||'').split('/')[3] : '',
    project: '',
    page: '',
    profile_path: /sourceCode=/.test(jb.path(globalThis,'location.href')||'') ? (jb.path(globalThis,'location.pathname')||'').split('/')[4] : '',
    pickSelectionCtxId: '',
    jbEditor: {
      selected: /sourceCode=/.test(jb.path(globalThis,'location.href')||'') ? (jb.path(globalThis,'location.pathname')||'').split('/')[4] : ''
    },
    preview: {
      width: 1280,
      height: '100%',
      zoom: 10
    },
    settings: {contentEditable: false, activateWatchRefViewer: true},
    vscode: undefined
  }
})

component('studio.pages', {
  type: 'control',
  impl: group({
    title: 'pages',
    layout: layout.horizontal(),
    controls: [
      button('new page', studio.openNewPage(), {
        style: button.mdcIcon(icon('add'), 16),
        features: [
          css('{margin: 5px}'),
          feature.hoverTitle('new page')
        ]
      }),
      itemlist({
        items: pipeline(studio.cmpsOfProject(), filter(tgp.isOfType('%%', 'control'))),
        controls: text(pipeline(suffix('.'), extractSuffix('.')), { features: css.class('studio-page') }),
        style: itemlist.horizontal(),
        features: [
          itemlist.selection('%$studio/page%', {
            onSelection: runActions(
              writeValue('%$studio/profile_path%', '%$studio/page%'),
              writeValue('%$studio/circuit%', tgp.circuitOptions('%$studio/page%'))
            ),
            autoSelectFirst: true
          }),
          css.class('studio-pages-items'),
          studio.watchComponents(),
          css.width('1200', 'auto', { minMax: 'max' }),
          css('align-items: center;')
        ]
      }),
      text('|'),
      button('new function', studio.openNewFunction(), {
        style: button.mdcIcon(icon('add', { type: 'mdc' }), '16'),
        features: [
          css('{margin: 5px}'),
          feature.hoverTitle('new function')
        ]
      }),
      itemlist({
        items: pipeline(studio.cmpsOfProject(), filter(tgp.isOfType('%%', 'data'))),
        controls: text(pipeline(suffix('.'), extractSuffix('.')), {
          features: method('onclickHandler', studio.openJbEditor('%%'))
        }),
        style: itemlist.horizontal(),
        features: [
          id('functions'),
          css.class('studio-pages-items'),
          css('align-items: center;'),
          studio.watchComponents()
        ]
      })
    ],
    features: [
      css.class('studio-pages1'),
      css.border('1', 'bottom', { color: 'var(--jb-dropdown-border)' })
    ]
  })
})

component('studio.ctxCounters', {
  type: 'control',
  impl: text({
    text: ctx => (jb.frame.performance && performance.memory && performance.memory.usedJSHeapSize / 1000000)  + 'M',
    features: [
      css('{ position: absolute; bottom: 0; right: 0; }'),
      followUp.watchObservable(watchableComps.scriptChange(), 500)
    ]
  })
})

component('studio.sampleProject', {
  type: 'menu.option',
  params: [
    {id: 'project', as: 'string'}
  ],
  impl: menu.action('%$project%', If(studio.inVscode(), studio.reOpenStudio(pipeline(studio.projectsDir(), '%%/%$project%/%$project%.js'), 0)))
})

component('studio.mainMenu', {
  type: 'menu.option',
  impl: menu.menu('main', {
    options: [
      menu.menu('File', {
        options: [
          menu.menu('Sample Projects', {
            options: [
              studio.sampleProject('styleGallery'),
              studio.sampleProject('itemlists'),
              studio.sampleProject('todomvc'),
              studio.sampleProject('htmlParsing'),
              studio.sampleProject('cardsDemo')
            ]
          }),
          menu.action('New Project', studio.openNewProject(), { icon: icon('new') }),
          menu.action('Open Project ...', studio.openProject(), { showCondition: not(studio.inVscode()) }),
          menu.action('Save', studio.saveComponents(), { icon: icon('save'), shortcut: 'Ctrl+S', showCondition: not(studio.inVscode()) }),
          menu.action('Force Save', studio.saveComponents(), { icon: icon('save'), showCondition: not(studio.inVscode()) }),
          menu.action('Github helper...', studio.githubHelper(), { showCondition: not(studio.inVscode()) }),
          menu.action('Settings...', openDialog('Project Settings', studio.projectSettings(), {
            style: dialog.dialogOkCancel(),
            onOK: runActions(writeValue('%$studio/projectSettings/libs%', pipeline('%$studio/libsAsArray%', join(','))), studio.saveProjectSettings(), studio.refreshPreview()),
            features: dialogFeature.dragTitle()
          }))
        ]
      }),
      menu.menu('Edit', {
        options: [
          menu.action('Undo', watchableComps.undo(), { icon: icon('undo'), shortcut: 'Ctrl+Z' }),
          menu.action('Redo', watchableComps.redo(), { icon: icon('redo'), shortcut: 'Ctrl+Y' }),
          menu.action('Extract Component', studio.openExtractComponent(), { shortcut: '', showCondition: studio.canExtractParam() }),
          menu.action('Extract Param', studio.openExtractParam(), { shortcut: '', showCondition: studio.canExtractParam() })
        ]
      }),
      menu.menu('View', {
        options: [
          menu.action('Components...', openDialog('components', studio.componentsList(), { style: dialog.studioFloating(), features: css.width('600') })),
          menu.action('Refresh Preview', studio.refreshPreview()),
          menu.action('Redraw Studio', studio.redrawStudio()),
          menu.action('Edit source', studio.editSource()),
          menu.action('Outline', studio.openControlTree()),
          menu.action('Inteliscript Editor', studio.openJbEditor(studio.currentProfilePath())),
          menu.separator(),
          menu.dynamicOptions(studio.cmpsOfProject(), menu.action({
            title: pipeline(
              Var('type', If(tgp.isOfType('%%', 'control'), 'page', 'component')),
              suffix('.'),
              extractSuffix('.'),
              '%% (%$type%)'
            ),
            action: runActions(
              writeValue('%$studio/page%', '%%'),
              writeValue('%$studio/profile_path%', '%%'),
              writeValue('%$studio/circuit%', tgp.circuitOptions('%%'))
            )
          }))
        ]
      }),
      studio.insertControlMenu(),
      studio.dataResourceMenu()
    ]
  })
})

component('studio.baseStudioUrl', {
  impl: () => jb.studio.host.baseUrl + '/bin/studio/'
})

component('studio.topBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({ alignItems: 'start', spacing: '' }),
    controls: [
      image(pipeline(studio.baseStudioUrl(), '%%css/jbartlogo.png'), '', {
        features: [
          css.margin('5', '5'),
          css.width('80', { minMax: 'min' }),
          css.height('100')
        ]
      }),
      group({
        title: 'title and menu',
        controls: [
          text('message', { style: text.studioMessage() }),
          group({
            title: 'menu and toolbar',
            layout: layout.flex({ spacing: '160' }),
            controls: [
              menu.control(studio.mainMenu(), menuStyle.pulldown(), { features: [id('mainMenu'), css.height('30'), css.margin('18')] }),
              group({ title: 'toolbar', controls: studio.toolbar(), features: css.margin('8') }),
              controlWithFeatures(studio.searchComponent(), { features: [css.margin('8', '-100')] })
            ]
          })
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: [
      css('height: 48px; border-bottom: 1px #d9d9d9 solid;')
    ]
  })
})

component('studio.vscodeTopBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex('column', { alignItems: 'start', spacing: '' }),
    controls: [
      text({
        text: If('%$studio/project%==tests', '%$studio/circuit%', replace('_', ' ', { text: '%$studio/project%' })),
        style: header.h1(),
        features: [
          watchRef('%$studio/project%'),
          watchRef('%$studio/circuit%'),
          css('font-size: var(--jb-font-size)'),
          field.title('project name')
        ]
      }),
      group({
        title: 'title and menu',
        controls: [
          group({
            title: 'menu and toolbar',
            layout: layout.flex({ justifyContent: 'space-between', alignItems: 'baseline', spacing: '' }),
            style: group.htmlTag(),
            controls: [
              menu.control(studio.mainMenu(), menuStyle.pulldown(), { features: id('mainMenu') }),
              group({ title: 'toolbar', controls: studio.toolbar() }),
              studio.searchComponent('')
            ]
          })
        ],
        features: css('width: 100%; ')
      })
    ]
  })
})

component('studio.pathHyperlink', {
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'prefix', as: 'string'}
  ],
  impl: group({
    layout: layout.horizontal('9'),
    controls: [
      text('%$prefix%'),
      button({
        title: ctx => {
          const path = ctx.cmpCtx.params.path
          const title = jb.tgp.shortTitle(path) || '',compName = jb.tgp.compNameOfPath(path) || ''
          return title == compName ? title : compName + ' ' + title
        },
        action: runActions(writeValue('%$studio/profile_path%', '%$path%'), studio.openControlTree()),
        style: button.href(),
        features: feature.hoverTitle('%$path%')
      })
    ]
  })
})

component('studio.projectSettings', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical(),
    style: group.tabs(),
    controls: [
      group({
        title: 'Files (%$studio/projectSettings/jsFiles/length%)',
        controls: [
          itemlist('', {
            items: '%jsFiles%',
            controls: [
              group({
                layout: layout.horizontal('1'),
                controls: [
                  editableText('file', '%%', {
                    style: editableText.mdcNoLabel('262'),
                    features: [
                      css('background-color: transparent !important;'),
                      css.padding({ left: '30', right: '' })
                    ]
                  }),
                  button('delete', removeFromArray('%$studio/projectSettings/jsFiles%', '%%'), {
                    style: button.plainIcon(),
                    features: [
                      itemlist.shownOnlyOnItemHover(),
                      css('background-color: transparent !important; z-index: 10000; cursor: pointer'),
                      feature.icon('cancel', { type: 'mdc' }),
                      css.margin('20', '-30')
                    ]
                  })
                ]
              })
            ],
            style: itemlist.div(),
            layout: layout.flex({ wrap: 'wrap' }),
            features: [
              watchRef('%jsFiles%', 'structure', { allowSelfRefresh: true }),
              itemlist.dragAndDrop(),
              css.width('100%')
            ]
          }),
          button('add file', addToArray('%jsFiles%', { toAdd: 'myFile.js' }), { style: button.mdcChipAction() })
        ],
        features: [
          feature.icon('FileOutline', { type: 'mdi' })
        ]
      }),
      multiSelect('Libs (%$studio/libsAsArray/length%)', '%$studio/libsAsArray%', {
        options: picklist.optionsByComma({
          options: 'remote,codemirror,fuse,animate,cards,cards-sample-data,d3,dragula,md-icons,material,pretty-print,xml,jison,parsing,puppeteer,rx',
          allowEmptyValue: ''
        }),
        style: multiSelect.chips(),
        features: [
          css.margin('15', '10'),
          feature.icon('Library', { type: 'mdi' })
        ]
      })
    ],
    features: [
      group.data('%$studio/projectSettings%', { watch: true, includeChildren: 'structure' }),
      css.width('600'),
      feature.initValue('%$studio/libsAsArray%', split({ text: '%libs%' }))
    ]
  })
})
