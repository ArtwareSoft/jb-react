jb.component('studio', { /* studio */
  watchableData: {
    project: '',
    page: '',
    profile_path: '',
    pickSelectionCtxId: ''
  }
})

jb.component('pickSelection', { // can not put rich objects as watchable, only pickSelectionCtxId is watchable
  passiveData: {  ctx: null, elem: null }
})

jb.component('studio.cmps-of-project', { /* studio.cmpsOfProject */
  type: 'data',
  params: [
    {id: 'project', as: 'string'}
  ],
  impl: (ctx,prj) =>
      jb.studio.previewjb ? Object.getOwnPropertyNames(jb.studio.previewjb.comps)
              .filter(id=>id.split('.')[0] == prj) : []
})

jb.component('studio.project-pages', { /* studio.projectPages */
  type: 'data',
  impl: pipeline(
    studio.cmpsOfProject('%$studio/project%'),
    filter(studio.isOfType('%%', 'control')),
    suffix('.')
  )
})

jb.component('studio.pages', { /* studio.pages */
  type: 'control',
  impl: group({
    title: 'pages',
    style: layout.horizontal(),
    controls: [
      button({
        title: 'new page',
        action: studio.openNewPage(),
        style: button.mdlIcon12('add'),
        features: css('{margin: 5px}')
      }),
      itemlist({
        items: studio.projectPages(),
        controls: label({title: extractSuffix('.'), features: css.class('studio-page')}),
        style: itemlist.horizontal(),
        features: [
          id('pages'),
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: runActions(
              writeValue('%$studio/profile_path%', '{%$studio/project%}.{%$studio/page%}')
            ),
            autoSelectFirst: true
          }),
          css(
            `{ list-style: none; padding: 0;
              margin: 0; margin-left: 20px; font-family: "Arial"}
                  >* { list-style: none; display: inline-block; padding: 0 5px; font-size: 12px; border: 1px solid transparent; cursor: pointer;}
                  >* label { cursor: inherit; }
                  >*.selected { background: #fff;  border: 1px solid #ccc;  border-top: 1px solid transparent; color: inherit;  }`
          )
        ]
      })
    ],
    features: [
      css(
        '{ background: #F5F5F5; position: absolute; bottom: 0; left: 0; width: 100%; border-top: 1px solid #aaa}'
      ),
      group.wait({for: studio.waitForPreviewIframe(), loadingControl: label({})}),
      studio.watchComponents()
    ]
  })
})

jb.component('studio.ctx-counters', { /* studio.ctxCounters */
  type: 'control',
  impl: label({
    title: ctx => (performance.memory.usedJSHeapSize / 1000000)  + 'M',
    features: [
      css('{ background: #F5F5F5; position: absolute; bottom: 0; right: 0; }'),
      watchObservable(ctx => jb.studio.scriptChange.debounceTime(500))
    ]
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
          menu.action({title: 'New Project', action: studio.openNewProject(), icon: 'new'}),
          menu.action({title: 'Open Project ...', action: studio.openProject()}),
          menu.action({
            title: 'Save',
            action: studio.saveComponents(),
            icon: 'save',
            shortcut: 'Ctrl+S'
          }),
          menu.action({
            title: 'Force Save',
            action: studio.saveComponents(true),
            icon: 'save'
          }),
          menu.action({
            title: 'Source ...',
            action: studio.editSource(studio.currentProfilePath())
          })
        ]
      }),
      menu.menu({
        title: 'View',
        options: [
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
    style: layout.horizontal('3'),
    controls: [
      image({
        url: '//unpkg.com/jb-react/bin/studio/css/jbartlogo.png',
        imageHeight: '60',
        units: 'px',
        style: image.default(),
        features: css.margin({top: '15', left: '5'})
      }),
      group({
        title: 'title and menu',
        style: layout.vertical('17'),
        controls: [
          label({title: 'message', style: label.studioMessage()}),
          label({
            title: replace({find: '_', replace: ' ', text: '%$studio/project%'}),
            style: label.span(),
            features: css('{ font: 20px Arial; margin-left: 6px; }')
          }),
          group({
            title: 'menu and toolbar',
            style: layout.flex('space-between'),
            controls: [
              menu.control({
                menu: studio.mainMenu(),
                style: menuStyle.pulldown({}),
                features: [id('mainMenu'), css.height('30')]
              }),
              studio.toolbar(),
              studio.searchComponent()
            ],
            features: [css.width('1040')]
          })
        ],
        features: css('{ padding-left: 18px; width: 100%; }')
      })
    ],
    features: css('{ height: 90px; border-bottom: 1px #d9d9d9 solid}')
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
      group.data({data: '%$studio/project%', watch: true}),
      feature.init(urlHistory.mapStudioUrlToResource('studio'))
    ]
  })
})

jb.component('studio.dynamic', { /* studio.dynamic */
  type: 'control',
  impl: group({
    title: 'top bar',
    style: layout.horizontal('3'),
    controls: [
      image({
        url: '//unpkg.com/jb-react/bin/studio/css/jbartlogo.png',
        imageHeight: '60',
        units: 'px',
        style: image.default(),
        features: css.margin({top: '15', left: '5'})
      }),
      group({
        title: 'title and menu',
        style: layout.vertical('17'),
        controls: [
          label({title: 'message', style: label.studioMessage()}),
          group({
            style: layout.flex('space-between'),
            controls: [
              studio.toolbar(),
              studio.searchComponent()
            ],
            features: [css.width('1040')]
          })
        ],
        features: css('{ padding-left: 18px; width: 100%; }')
      })
    ],
    features: css('{ height: 90px; border-bottom: 1px #d9d9d9 solid}')
  })
})

jb.component('studio.path-hyperlink', { /* studio.pathHyperlink */
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'prefix', as: 'string'}
  ],
  impl: group({
    style: layout.horizontal('9'),
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
