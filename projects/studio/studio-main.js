jb.component('data-resource.studio', { /* dataResource.studio */
  watchableData: {
    project: '',
    page: '',
    profile_path: '',
    pickSelectionCtxId: '',
    settings: {contentEditable: true, activateWatchRefViewer: true},
    baseStudioUrl: '//unpkg.com/jb-react/bin/studio/'
  }
})

jb.component('data-resource.pickSelection', { /* dataResource.pickSelection */
  passiveData: {
    ctx: null,
    elem: null
  }
})
jb.component('studio.pages', { /* studio.pages */
  type: 'control',
  impl: group({
    title: 'pages',
    layout: layout.horizontal(),
    controls: [
      button({
        title: 'new page',
        action: studio.openNewPage(),
        style: button.mdcIcon12('add'),
        features: [css('{margin: 5px}'), feature.hoverTitle('new page')]
      }),
      itemlist({
        items: pipeline(
          studio.cmpsOfProject(),
          filter(studio.isOfType('%%', 'control')),
          suffix('.')
        ),
        controls: label({text: extractSuffix('.'), features: css.class('studio-page')}),
        style: itemlist.horizontal(),
        features: [
          id('pages'),
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: writeValue('%$studio/profile_path%', '{%$studio/project%}.{%$studio/page%}'),
            autoSelectFirst: true
          }),
          css.class('studio-pages-items')
        ]
      }),
      label('|'),
      button({
        title: 'new function',
        action: studio.openNewFunction(),
        style: button.mdcIcon12('add'),
        features: [css('{margin: 5px}'), feature.hoverTitle('new function')]
      }),
      itemlist({
        items: pipeline(
          studio.cmpsOfProject(),
          filter(studio.isOfType('%%', 'data')),
          suffix('.')
        ),
        controls: label({
          text: extractSuffix('.'),
          features: [
            feature.onEvent({
              event: 'click',
              action: studio.openJbEditor('%$studio/project%.%%')
            })
          ]
        }),
        style: itemlist.horizontal(),
        features: [id('functions'), css.class('studio-pages-items')]
      })
    ],
    features: [
      css.class('studio-pages'),
      group.wait({for: studio.waitForPreviewIframe(), loadingControl: label({})}),
      studio.watchComponents()
    ]
  })
})

jb.component('studio.ctx-counters', { /* studio.ctxCounters */
  type: 'control',
  impl: label({
    text: ctx => (jb.frame.performance && performance.memory && performance.memory.usedJSHeapSize / 1000000)  + 'M',
    features: [
      css('{ background: #F5F5F5; position: absolute; bottom: 0; right: 0; }'),
      watchObservable(ctx => jb.studio.scriptChange.debounceTime(500))
    ]
  })
})

jb.component('studio.sample-project',{
  type: 'menu.option',
  params:[
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

jb.component('studio.main-menu', { /* studio.mainMenu */
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
              studio.sampleProject('itemlists'),
              studio.sampleProject('todos'),
              studio.sampleProject('html-parsing'),
            ]
          }),
          menu.action({title: 'New Project', action: studio.openNewProject(), icon: 'new'}),
          menu.action({title: 'Open Project ...', action: studio.openProject()}),
          menu.action({
            title: 'Save',
            action: studio.saveComponents(),
            icon: 'save',
            shortcut: 'Ctrl+S'
          }),
          menu.action({title: 'Force Save', action: studio.saveComponents(), icon: 'save'}),
          menu.action({
            title: 'Source ...',
            action: studio.viewAllFiles(studio.currentProfilePath())
          }),
          menu.action({title: 'Github helper...', action: studio.githubHelper()}),
          menu.action({
            title: 'Settings...',
            action: openDialog({
              style: dialog.dialogOkCancel(),
              content: group({
                style: propertySheet.titlesLeft({}),
                controls: [
                  editableBoolean({
                    databind: '%$studio/settings/activateWatchRefViewer%',
                    style: editableBoolean.mdcSlideToggle(),
                    title: 'activate watchRef viewer'
                  })
                ],
                features: css.margin({top: '10', left: '10'})
              }),
              title: 'Settings'
            })
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

jb.component('studio.top-bar', { /* studio.topBar */
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({alignItems: 'start', spacing: '3'}),
    controls: [
      image({
        url: '%$studio/baseStudioUrl%css/jbartlogo.png',
        features: [css.margin({top: '5', left: '5'}), css.width('80'), css.height('100')]
      }),
      group({
        title: 'title and menu',
        layout: layout.vertical('11'),
        controls: [
          label({text: 'message', style: label.studioMessage()}),
          label({
            text: replace({find: '_', replace: ' ', text: '%$studio/project%'}),
            style: label.htmlTag('div'),
            features: [
              css('{ font: 20px Arial; margin-left: 6px; margin-top: 6px}'),
              watchRef('%$studio/project%')
            ]
          }),
          group({
            title: 'menu and toolbar',
            layout: layout.flex({justifyContent: 'space-between'}),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown({}),
                features: [id('mainMenu'), css.height('30')]
              }),
              studio.toolbar(),
              studio.searchComponent()
            ],
            features: [css.width('960')]
          })
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: css('height: 73px; border-bottom: 1px #d9d9d9 solid;')
  })
})

jb.component('studio.all', { /* studio.all */
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
        loadingControl: label('')
      }),
      group.data({data: '%$studio/project%', watch: true}),
      feature.init(urlHistory.mapStudioUrlToResource('studio'))
    ]
  })
})

jb.component('studio.path-hyperlink', { /* studio.pathHyperlink */
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'prefix', as: 'string'}
  ],
  impl: group({
    layout: layout.horizontal('9'),
    controls: [
      label('%$prefix%'),
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
