using('remote-widget,data-browser,watchable-comps,probe-preview,net,tgp,workspace')

component('studio.main', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition(studio.isCircuit(), studio.circuit()),
//      controlWithCondition(studio.isNotebook(), studio.notebook()),
      studio.jbart()
    ],
    features: [group.wait(ctx => jb.studio.host.settings()
        .then(settings => ctx.run(writeValue('%$studio/settings%',
          Object.assign(ctx.exp('%$studio/settings%'), typeof settings == 'string' ? JSON.parse(settings) : {})))), text('')), group.firstSucceeding()]
  })
})

component('studio.isNotebook',{
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
          css.height({height: '%$studio/preview/height%', overflow: 'auto', minMax: 'max'}),
          css.width({width: '%$studio/preview/width%', overflow: 'auto', minMax: 'max'})
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
          followUp.action(studio.openControlTree()),
          watchRef('%$studio/preview%', 'yes'),
          css.height({height: '%$studio/preview/height%', overflow: 'auto', minMax: 'max'}),
          css.width({width: '%$studio/preview/width%', overflow: 'auto', minMax: 'max'})
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
    jbEditor: {},
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
      button({
        title: 'new page',
        action: studio.openNewPage(),
        style: button.mdcIcon(icon('add'), 16),
        features: [
          css('{margin: 5px}'),
          feature.hoverTitle('new page')
        ]
      }),
      itemlist({
        items: pipeline(studio.cmpsOfProject(), filter(tgp.isOfType('%%', 'control'))),
        controls: text({text: pipeline(suffix('.'), extractSuffix('.')), features: css.class('studio-page')}),
        style: itemlist.horizontal(),
        features: [
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: runActions(
              writeValue('%$studio/profile_path%', '%$studio/page%'),
              writeValue('%$studio/circuit%', tgp.circuitOptions('%$studio/page%'))
            ),
            autoSelectFirst: true
          }),
          css.class('studio-pages-items'),
          studio.watchComponents(),
          css.width({width: '1200', overflow: 'auto', minMax: 'max'}),
          css('align-items: center;')
        ]
      }),
      text('|'),
      button({
        title: 'new function',
        action: studio.openNewFunction(),
        style: button.mdcIcon(icon({icon: 'add', type: 'mdc'}), '16'),
        features: [
          css('{margin: 5px}'),
          feature.hoverTitle('new function')
        ]
      }),
      itemlist({
        items: pipeline(studio.cmpsOfProject(), filter(tgp.isOfType('%%', 'data'))),
        controls: text({
          text: pipeline(suffix('.'), extractSuffix('.')),
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
      css.border({width: '1', side: 'bottom', color: 'var(--jb-dropdown-border)'})
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
  impl: menu.action(
    '%$project%',
    action.if(
      studio.inVscode(),
      studio.reOpenStudio(pipeline(studio.projectsDir(), '%%/%$project%/%$project%.js'), 0),
      winUtils.gotoUrl(
        'https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?host=github&hostProjectId=http://artwaresoft.github.io/jb-react/projects/%$project%&project=%$project%',
        'new tab'
      )
    )
  )
})

component('studio.mainMenu', {
  type: 'menu.option',
  impl: menu.menu(
    'main',
    [
      menu.menu(
        'File',
        [
          menu.menu(
            'Sample Projects',
            [
              studio.sampleProject('styleGallery'),
              studio.sampleProject('itemlists'),
              studio.sampleProject('todomvc'),
              studio.sampleProject('htmlParsing'),
              studio.sampleProject('cardsDemo')
            ]
          ),
          menu.action({
            title: 'New Project',
            action: studio.openNewProject(),
            icon: icon('new')
          }),
          menu.action({
            title: 'Open Project ...',
            action: studio.openProject(),
            showCondition: not(studio.inVscode())
          }),
          menu.action({
            title: 'Save',
            action: studio.saveComponents(),
            icon: icon('save'),
            shortcut: 'Ctrl+S',
            showCondition: not(studio.inVscode())
          }),
          menu.action({
            title: 'Force Save',
            action: studio.saveComponents(),
            icon: icon('save'),
            showCondition: not(studio.inVscode())
          }),
          menu.action({
            title: 'Github helper...',
            action: studio.githubHelper(),
            showCondition: not(studio.inVscode())
          }),
          menu.action(
            'Settings...',
            openDialog({
              title: 'Project Settings',
              content: studio.projectSettings(),
              style: dialog.dialogOkCancel(),
              onOK: runActions(
                writeValue('%$studio/projectSettings/libs%', pipeline('%$studio/libsAsArray%', join(','))),
                studio.saveProjectSettings(),
                studio.refreshPreview()
              ),
              features: dialogFeature.dragTitle()
            })
          )
        ]
      ),
      menu.menu(
        'Edit',
        [
          menu.action({
            title: 'Undo',
            action: watchableComps.undo(),
            icon: icon('undo'),
            shortcut: 'Ctrl+Z'
          }),
          menu.action({
            title: 'Redo',
            action: watchableComps.redo(),
            icon: icon('redo'),
            shortcut: 'Ctrl+Y'
          }),
          menu.action({
            title: 'Extract Component',
            action: studio.openExtractComponent(),
            shortcut: '',
            showCondition: studio.canExtractParam()
          }),
          menu.action({
            title: 'Extract Param',
            action: studio.openExtractParam(),
            shortcut: '',
            showCondition: studio.canExtractParam()
          })
        ]
      ),
      menu.menu(
        'View',
        [
          menu.action(
            'Components...',
            openDialog({
              title: 'components',
              content: studio.componentsList(),
              style: dialog.studioFloating(),
              features: css.width('600')
            })
          ),
          menu.action('Refresh Preview', studio.refreshPreview()),
          menu.action('Redraw Studio', studio.redrawStudio()),
          menu.action('Edit source', studio.editSource()),
          menu.action('Outline', studio.openControlTree()),
          menu.action('Inteliscript Editor', studio.openJbEditor(studio.currentProfilePath())),
          menu.separator(),
          menu.dynamicOptions(
            studio.cmpsOfProject(),
            menu.action(
              pipeline(
                Var('type', data.if(tgp.isOfType('%%', 'control'), 'page', 'component')),
                suffix('.'),
                extractSuffix('.'),
                '%% (%$type%)'
              ),
              runActions(
                writeValue('%$studio/page%', '%%'),
                writeValue('%$studio/profile_path%', '%%'),
                writeValue('%$studio/circuit%', tgp.circuitOptions('%%'))
              )
            )
          )
        ]
      ),
      studio.insertControlMenu(),
      studio.dataResourceMenu()
    ]
  )
})

component('studio.baseStudioUrl', {
  impl: () => jb.studio.host.baseUrl + '/bin/studio/'
})

component('studio.topBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({alignItems: 'start', spacing: ''}),
    controls: [
      image({
        url: pipeline(studio.baseStudioUrl(), '%%css/jbartlogo.png'),
        width: '',
        features: [
          css.margin('5', '5'),
          css.width({width: '80', minMax: 'min'}),
          css.height('100')
        ]
      }),
      group({
        title: 'title and menu',
        controls: [
          text({text: 'message', style: text.studioMessage()}),
          group({
            title: 'menu and toolbar',
            layout: layout.flex({spacing: '160'}),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown(),
                features: [id('mainMenu'), css.height('30'), css.margin('18')]
              }),
              group({title: 'toolbar', controls: studio.toolbar(), features: css.margin('8')}),
              controlWithFeatures(studio.searchComponent(), [
                css.margin('8', '-100')
              ])
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
    layout: layout.flex({
      direction: 'column',
      alignItems: 'start',
      spacing: ''
    }),
    controls: [
      text({
        text: If(
          '%$studio/project%==tests',
          '%$studio/circuit%',
          replace({
            find: '_',
            replace: ' ',
            text: '%$studio/project%'
          })
        ),
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
            layout: layout.flex({
              justifyContent: 'space-between',
              alignItems: 'baseline',
              spacing: ''
            }),
            style: group.htmlTag(),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown(),
                features: id('mainMenu')
              }),
              group({title: 'toolbar', controls: studio.toolbar()}),
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
      }),
    ]
  })
})

component('studio.projectSettings', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical(),
    style: group.tabs({}),
    controls: [
      group({
        title: 'Files (%$studio/projectSettings/jsFiles/length%)',
        controls: [
          itemlist({
            title: '',
            items: '%jsFiles%',
            controls: [
              group({
                layout: layout.horizontal('1'),
                controls: [
                  editableText({
                    title: 'file',
                    databind: '%%',
                    style: editableText.mdcNoLabel('262'),
                    features: [
                      css('background-color: transparent !important;'),
                      css.padding({left: '30', right: ''})
                    ]
                  }),
                  button({
                    title: 'delete',
                    action: removeFromArray({array: '%$studio/projectSettings/jsFiles%', itemToRemove: '%%'}),
                    style: button.plainIcon(),
                    features: [
                      itemlist.shownOnlyOnItemHover(),
                      css('background-color: transparent !important; z-index: 10000; cursor: pointer'),
                      feature.icon({icon: 'cancel', type: 'mdc'}),
                      css.margin({top: '20', left: '-30'})
                    ]
                  })
                ]
              })
            ],
            style: itemlist.div(),
            layout: layout.flex({wrap: 'wrap'}),
            features: [
              watchRef({ref: '%jsFiles%', includeChildren: 'structure', allowSelfRefresh: true}),
              itemlist.dragAndDrop(),
              css.width('100%')
            ]
          }),
          button({
            title: 'add file',
            action: addToArray('%jsFiles%', 'myFile.js'),
            style: button.mdcChipAction()
          })
        ],
        features: [feature.icon({icon: 'FileOutline', type: 'mdi'})]
      }),
      multiSelect({
        title: 'Libs (%$studio/libsAsArray/length%)',
        databind: '%$studio/libsAsArray%',
        options: picklist.optionsByComma(
          'remote,codemirror,fuse,animate,cards,cards-sample-data,d3,dragula,md-icons,material,pretty-print,xml,jison,parsing,puppeteer,rx',
          ''
        ),
        style: multiSelect.chips(),
        features: [
          css.margin({top: '15', left: '10'}),
          feature.icon({icon: 'Library', type: 'mdi'})
        ]
      })
    ],
    features: [
      group.data({
        data: '%$studio/projectSettings%',
        watch: true,
        includeChildren: 'structure'
      }),
      css.width('600'),
      feature.initValue('%$studio/libsAsArray%', split({text: '%libs%'}))
    ]
  })
})
