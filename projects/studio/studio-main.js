jb.component('dataResource.studio', {
  watchableData: {
    project: '',
    page: '',
    profile_path: '',
    pickSelectionCtxId: '',
    preview: {width: 1280, height: 520, zoom: jb.frame.jbInvscode ? 8 : 10},
    settings: {contentEditable: true, activateWatchRefViewer: true},
    vscode: jb.frame.jbInvscode
  }
})

jb.component('studio.pages', {
  type: 'control',
  impl: group({
    title: 'pages',
    layout: layout.horizontal(),
    controls: [
      button({
        title: 'new page',
        action: studio.openNewPage(),
        style: button.mdcIcon(icon('add'), 16),
        features: [css('{margin: 5px}'), feature.hoverTitle('new page')]
      }),
      itemlist({
        title: '',
        items: pipeline(studio.cmpsOfProject(), filter(studio.isOfType('%%', 'control'))),
        controls: text({
          text: pipeline(suffix('.'), extractSuffix('.')),
          features: css.class('studio-page')
        }),
        style: itemlist.horizontal(),
        features: [
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: writeValue('%$studio/profile_path%', '%$studio/page%'),
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
        features: [css('{margin: 5px}'), feature.hoverTitle('new function')]
      }),
      itemlist({
        items: pipeline(studio.cmpsOfProject(), filter(studio.isOfType('%%', 'data'))),
        controls: text({
          text: pipeline(suffix('.'), extractSuffix('.')),
          style: text.alignToBottom(),
          features: feature.onEvent('click', studio.openJbEditor('%%'))
        }),
        style: itemlist.horizontal(),
        features: [id('functions'), css.class('studio-pages-items'), studio.watchComponents()]
      })
    ],
    features: [
      css.class('studio-pages'),
      group.wait({for: studio.waitForPreviewIframe(), loadingControl: text({})})
    ]
  })
})

jb.component('studio.ctxCounters', {
  type: 'control',
  impl: text({
    text: ctx => (jb.frame.performance && performance.memory && performance.memory.usedJSHeapSize / 1000000)  + 'M',
    features: [
      css('{ position: absolute; bottom: 0; right: 0; }'),
      followUp.watchObservable(studio.scriptChange(), 500)
    ]
  })
})

jb.component('studio.sampleProject', {
  type: 'menu.option',
  params: [
    {id: 'project', as: 'string'}
  ],
  impl: menu.action({
    title: '%$project%',
    action: action.if(
      studio.inVscode(),
      studio.reOpenStudio(pipeline(studio.projectsDir(),'%%/%$project%/%$project%.js'), 0),
      gotoUrl(
        'https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?host=github&hostProjectId=http://artwaresoft.github.io/jb-react/projects/%$project%&project=%$project%',
        'new tab'
      )
    )
  })
})

jb.component('studio.mainMenu', {
  type: 'menu.option',
  impl: menu.menu({
    title: 'main',
    options: [
      menu.menu({
        title: 'File',
        options: [
          menu.menu({
            title: 'Sample Projects',
            options: [
              studio.sampleProject('styleGallery'),
              studio.sampleProject('itemlists'),
              studio.sampleProject('todomvc'),
              studio.sampleProject('htmlParsing'),
              studio.sampleProject('cardsDemo')
            ]
          }),
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
            title: 'Source ...',
            action: studio.viewAllFiles(studio.currentProfilePath()),
            showCondition: not(studio.inVscode())
          }),
          menu.action({
            title: 'Github helper...',
            action: studio.githubHelper(),
            showCondition: not(studio.inVscode())
          }),
          menu.action({
            title: 'Settings...',
            action: openDialog({
              style: dialog.dialogOkCancel(),
              content: studio.projectSettings(),
              title: 'Project Settings',
              onOK: runActions(
                writeValue(
                    '%$studio/projectSettings/libs%',
                    pipeline('%$studio/libsAsArray%', join(','))
                  ),
                studio.saveProjectSettings(),
                studio.refreshPreview()
              ),
              features: dialogFeature.dragTitle()
            })
          })
        ]
      }),
      menu.menu({
        title: 'Edit',
        options: [
          menu.action({
            title: 'Undo',
            action: studio.undo(),
            icon: icon('undo'),
            shortcut: 'Ctrl+Z'
          }),
          menu.action({
            title: 'Redo',
            action: studio.redo(),
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
      }),
      menu.menu({
        title: 'View',
        options: [
          menu.action({
            title: 'Components...',
            action: openDialog({
              style: dialog.studioFloating({}),
              content: studio.componentsList(),
              title: 'components',
              features: css.width('600')
            })
          }),
          menu.action({title: 'Refresh Preview', action: studio.refreshPreview()}),
          menu.action({title: 'Redraw Studio', action: studio.redrawStudio()}),
          menu.action({title: 'Edit source', action: studio.editSource()}),
          menu.action({title: 'Outline', action: studio.openControlTree()}),
          menu.action({
            title: 'Inteliscript Editor',
            action: studio.openJbEditor({path: studio.currentProfilePath()})
          }),
          menu.action({
            title: 'Disable probe',
            action: ctx => jb.studio.probeDisabled = true,
            showCondition: ctx => !jb.studio.probeDisabled
          }),
          menu.action({
            title: 'Enable probe',
            action: ctx => jb.studio.probeDisabled = false,
            showCondition: ctx => jb.studio.probeDisabled
          })
        ]
      }),
      studio.insertControlMenu(),
      studio.dataResourceMenu()
    ]
  })
})

jb.component('studio.baseStudioUrl', {
  impl: () => jb.studio.host.baseUrl + '/bin/studio/'
})

jb.component('studio.topBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({alignItems: 'start', spacing: ''}),
    controls: [
      image({
        url: pipeline(studio.baseStudioUrl(), '%%css/jbartlogo.png'),
        width: '',
        features: [
          css.margin({top: '5', left: '5'}),
          css.width({width: '80', minMax: 'min'}),
          css.height('100')
        ]
      }),
      group({
        title: 'title and menu',
        layout: layout.vertical('11'),
        controls: [
          text({text: 'message', style: text.studioMessage()}),
          text({
            text: replace({find: '_', replace: ' ', text: '%$studio/project%'}),
            style: text.htmlTag('div'),
            features: [
              css('{ font: 20px Arial; margin-left: 6px; margin-top: 6px}'),
              watchRef('%$studio/project%')
            ]
          }),
          group({
            title: 'menu and toolbar',
            layout: layout.flex({spacing: '160'}),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown({}),
                features: [id('mainMenu'), css.height('30')]
              }),
              group({
                title: 'toolbar',
                controls: [
                  studio.toolbar()
                ],
                features: css.margin('-10')
              }),
              controlWithFeatures(
                studio.searchComponent(),
                [css.margin({top: '-10', left: '-100'})]
              )
            ]
          })
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: [css('height: 73px; border-bottom: 1px #d9d9d9 solid;')]
  })
})

jb.component('studio.vscodeTopBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({direction: 'column', alignItems: 'start', spacing: ''}),
    controls: [
      text({
        text: If(
          '%$studio/project%==tests',
          '%$studio/page%',
          replace({find: '_', replace: ' ', text: '%$studio/project%'})
        ),
        style: header.h1(),
        features: [
          watchRef('%$studio/project%'),
          watchRef('%$studio/page%'),
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
            style: group.htmlTag({}),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown({}),
                features: [id('mainMenu')]
              }),
              group({
                title: 'toolbar',
                controls: [
                  studio.toolbar()
                ]
              }),
              studio.searchComponent('')
            ]
          })
        ],
        features: css('width: 100%; ')
      })
    ]
  })
})

jb.component('studio.all', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition(not('%$studio/vscode%'), studio.topBar()),
      controlWithCondition('%$studio/vscode%', studio.vscodeTopBar()),
      group({
        controls: studio.previewWidget(),
        features: id('preview-parent')
      }),
      studio.pages(),
      studio.ctxCounters()
    ],
    features: [
      group.wait({
        for: ctx => jb.studio.host.settings().then(settings => ctx.run(writeValue('%$studio/settings%',
          Object.assign(ctx.exp('%$studio/settings%'), typeof settings == 'string' ? JSON.parse(settings) : {})))),
        loadingControl: text('')
      }),
//      group.data({data: '%$studio/project%', watch1: true}),
      feature.init(runActions(urlHistory.mapStudioUrlToResource('studio'),
        studio.initVscodeAdapter('studio'),
        studio.initAutoSave()
      )),
    ]
  })
})

jb.component('studio.pathHyperlink', {
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
	  		const path = ctx.cmpCtx.params.path;
	  		const title = jb.studio.shortTitle(path) || '',compName = jb.studio.compNameOfPath(path) || '';
	  		return title == compName ? title : compName + ' ' + title;
	  	},
        action: studio.gotoPath('%$path%'),
        style: button.href(),
        features: feature.hoverTitle('%$path%')
      }),
      menu.control({
        menu: menu.menu({
          options: menu.action({title: 'undo', action: studio.undo(), icon: icon('undo')}),
          icon: icon('undo')
        }),
        style: menuStyle.toolbar(),
        features: css.margin({left: '100'})
      }),
      editableBoolean({
        databind: '%$studio/hideProbe%',
        style: editableBoolean.iconWithSlash('20'),
        title: 'hide input-output',
        textForTrue: 'hide probe',
        textForFalse: 'show probe',
        features: feature.icon({icon: 'power_input', type: 'mdc', size: '12'})
      })
    ]
  })
})

jb.component('studio.projectSettings', {
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
      feature.init(writeValue('%$studio/libsAsArray%', split({text: '%libs%'})))
    ]
  })
})
