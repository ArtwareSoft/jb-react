jb.component('dataResource.studio', {
  watchableData: {
    project: '',
    page: '',
    profile_path: '',
    pickSelectionCtxId: '',
    settings: {contentEditable: true, activateWatchRefViewer: true},
    baseStudioUrl: '//unpkg.com/jb-react/bin/studio/'
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
        items: pipeline(
          studio.cmpsOfProject(),
          filter(studio.isOfType('%%', 'control')),
          suffix('.')
        ),
        controls: text({text: extractSuffix('.'), features: css.class('studio-page')}),
        style: itemlist.horizontal(),
        features: [
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: writeValue('%$studio/profile_path%', studio.currentPagePath()),
            autoSelectFirst: true
          }),
          css.class('studio-pages-items'),
          studio.watchComponents()
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
        items: pipeline(
          studio.cmpsOfProject(),
          filter(studio.isOfType('%%', 'data')),
          suffix('.')
        ),
        controls: text({
          text: extractSuffix('.'),
          features: [
            feature.onEvent({
              event: 'click',
              action: studio.openJbEditor({path: pipeline(list(studio.projectId(), '%%'), join('.'))})
            })
          ]
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
      css('{ background: #F5F5F5; position: absolute; bottom: 0; right: 0; }'),
      watchObservable(ctx => jb.studio.scriptChange, 500)
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
    action: gotoUrl(
      'https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?host=github&hostProjectId=http://artwaresoft.github.io/jb-react/projects/%$project%&project=%$project%',
      'new tab'
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
              studio.sampleProject('style-gallery'),
              studio.sampleProject('itemlists'),
              studio.sampleProject('todos'),
              studio.sampleProject('html-parsing'),
              studio.sampleProject('cards-demo')
            ]
          }),
          menu.action({
            title: 'New Project',
            action: studio.openNewProject(),
            icon: icon('new')
          }),
          menu.action({title: 'Open Project ...', action: studio.openProject()}),
          menu.action({
            title: 'Save',
            action: studio.saveComponents(),
            icon: icon('save'),
            shortcut: 'Ctrl+S'
          }),
          menu.action({
            title: 'Force Save',
            action: studio.saveComponents(),
            icon: icon('save')
          }),
          menu.action({
            title: 'Source ...',
            action: studio.viewAllFiles(studio.currentProfilePath())
          }),
          menu.action({title: 'Github helper...', action: studio.githubHelper()}),
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
                studio.saveProjectSettings()
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

jb.component('studio.topBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({alignItems: 'start', spacing: ''}),
    controls: [
      image({
        url: '%$studio/baseStudioUrl%css/jbartlogo.png',
        features: [css.margin({top: '5', left: '5'}), css.width('80'), css.height('100')]
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
            layout: layout.horizontal('160'),
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
              studio.searchComponent()
            ]
          })
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: [css('height: 73px; border-bottom: 1px #d9d9d9 solid;')]
  })
})

jb.component('studio.all', {
  type: 'control',
  impl: group({
    controls: [
      studio.topBar(),
      group({
        controls: studio.previewWidget({width: 1280, height: 520}),
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
      group.data({data: '%$studio/project%', watch1: true}),
      feature.init(runActions(urlHistory.mapStudioUrlToResource('studio'), 
        studio.initVscodeAdapter('studio'),
        studio.initAutoSave()
      ))
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
	  		const path = ctx.componentContext.params.path;
	  		const title = jb.studio.shortTitle(path) || '',compName = jb.studio.compNameOfPath(path) || '';
	  		return title == compName ? title : compName + ' ' + title;
	  	},
        action: studio.gotoPath('%$path%'),
        style: button.href(),
        features: feature.hoverTitle('%$path%')
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
                    style: editableText.mdcNoLabel('200'),
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
            layout: layout.flex({direction: '', justifyContent: '', wrap: 'wrap'}),
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
          `remote,codemirror,fuse,animate,cards,cards-sample-data,d3,dragula,md-icons,material,pretty-print,xml,jison,parsing
`
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
