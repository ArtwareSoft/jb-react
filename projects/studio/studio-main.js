jb.resource('studio',{});

jb.component('studio.cmps-of-project',  /* studio_cmpsOfProject */ {
  type: 'data',
  params: [
    {id: 'project', as: 'string'}
  ],
  impl: (ctx,prj) =>
      jb.studio.previewjb ? Object.getOwnPropertyNames(jb.studio.previewjb.comps)
              .filter(id=>id.split('.')[0] == prj) : []
})

jb.component('studio.project-pages',  /* studio_projectPages */ {
  type: 'data',
  impl: pipeline(
    studio_cmpsOfProject('%$studio/project%'),
    filter(studio_isOfType('%%', 'control')),
    suffix('.')
  )
})

jb.component('studio.pages',  /* studio_pages */ {
  type: 'control',
  impl: group({
    title: 'pages',
    style: layout_horizontal(),
    controls: [
      button({
        title: 'new page',
        action: studio_openNewPage(),
        style: button_mdlIcon12('add'),
        features: css('{margin: 5px}')
      }),
      itemlist({
        items: studio_projectPages(),
        controls: label({title: extractSuffix('.'), features: css_class('studio-page')}),
        style: itemlist_horizontal(),
        features: [
          id('pages'),
          itemlist_selection({
            databind: '%$studio/page%',
            onSelection: writeValue('%$studio/profile_path%', '{%$studio/project%}.{%$studio/page%}'),
            autoSelectFirst: true
          }),
          css(
            "{ list-style: none; padding: 0;\n              margin: 0; margin-left: 20px; font-family: \"Arial\"}\n                  >* { list-style: none; display: inline-block; padding: 0 5px; font-size: 12px; border: 1px solid transparent; cursor: pointer;}\n                  >* label { cursor: inherit; }\n                  >*.selected { background: #fff;  border: 1px solid #ccc;  border-top: 1px solid transparent; color: inherit;  }"
          )
        ]
      })
    ],
    features: [
      css(
        '{ background: #F5F5F5; position: absolute; bottom: 0; left: 0; width: 100%; border-top: 1px solid #aaa}'
      ),
      group_wait({for: studio_waitForPreviewIframe(), loadingControl: label({})}),
      studio_watchComponents()
    ]
  })
})

jb.component('studio.ctx-counters',  /* studio_ctxCounters */ {
  type: 'control',
  impl: label({
    title: ctx => (performance.memory.usedJSHeapSize / 1000000)  + 'M',
    features: [
      css('{ background: #F5F5F5; position: absolute; bottom: 0; right: 0; }'),
      watchObservable(ctx => jb.studio.compsRefHandler.resourceChange.debounceTime(500))
    ]
  })
})

jb.component('studio.main-menu',  /* studio_mainMenu */ {
  type: 'menu.option',
  impl: menu_menu({
    title: 'main',
    options: [
      menu_menu({
        title: 'File',
        options: [
          menu_action({title: 'New Project', action: studio_openNewProject(), icon: 'new'}),
          menu_action({title: 'Open Project ...', action: studio_openProject()}),
          menu_action({title: 'Save', action: studio_saveComponents(), icon: 'save', shortcut: 'Ctrl+S'}),
          menu_action({title: 'Force Save', action: studio_saveComponents(true), icon: 'save'}),
          menu_action({title: 'Source ...', action: studio_editSource(studio_currentProfilePath())})
        ]
      }),
      menu_menu({
        title: 'View',
        options: [
          menu_action({title: 'Refresh Preview', action: studio_refreshPreview()}),
          menu_action({title: 'Redraw Studio', action: studio_redrawStudio()}),
          menu_action({title: 'Edit source', action: studio_editSource()}),
          menu_action({title: 'Outline', action: studio_openControlTree()}),
          menu_action({
            title: 'Inteliscript Editor',
            action: studio_openJbEditor({path: studio_currentProfilePath()})
          }),
          menu_action({
            title: 'Disable probe',
            action: ctx => jb.studio.probeDisabled = true,
            showCondition: ctx => !jb.studio.probeDisabled
          }),
          menu_action({
            title: 'Enable probe',
            action: ctx => jb.studio.probeDisabled = false,
            showCondition: ctx => jb.studio.probeDisabled
          })
        ]
      }),
      studio_insertControlMenu(),
      studio_dataResourceMenu()
    ]
  })
})

jb.component('studio.top-bar',  /* studio_topBar */ {
  type: 'control',
  impl: group({
    title: 'top bar',
    style: layout_horizontal('3'),
    controls: [
      image({
        url: '/projects/studio/css/jbartlogo.png',
        imageHeight: '60',
        units: 'px',
        style: image_default(),
        features: css_margin({top: '15', left: '5'})
      }),
      group({
        title: 'title and menu',
        style: layout_vertical('17'),
        controls: [
          label({title: 'message', style: label_studioMessage()}),
          label({
            title: replace({find: '_', replace: ' ', text: '%$studio/project%'}),
            style: label_span(),
            features: css('{ font: 20px Arial; margin-left: 6px; }')
          }),
          group({
            title: 'menu and toolbar',
            style: layout_flex('space-between'),
            controls: [
              menu_control({menu: studio_mainMenu(), style: menuStyle_pulldown({}), features: css_height('30')}),
              studio_toolbar(),
              studio_searchComponent()
            ],
            features: [css_width('1040')]
          })
        ],
        features: css('{ padding-left: 18px; width: 100%; }')
      })
    ],
    features: css('{ height: 90px; border-bottom: 1px #d9d9d9 solid}')
  })
})

jb.component('studio.all',  /* studio_all */ {
  type: 'control',
  impl: group({
    controls: [
      studio_topBar(),
      studio_previewWidget({width: 1280, height: 520}),
      studio_pages(),
      studio_ctxCounters()
    ],
    features: [
      group_data({data: '%$studio/project%', watch: true}),
      feature_init(urlHistory_mapStudioUrlToResource('studio'))
    ]
  })
})

jb.component('studio.dynamic',  /* studio_dynamic */ {
  type: 'control',
  impl: group({
    title: 'top bar',
    style: layout_horizontal('3'),
    controls: [
      image({
        url: '/projects/studio/css/jbartlogo.png',
        imageHeight: '60',
        units: 'px',
        style: image_default(),
        features: css_margin({top: '15', left: '5'})
      }),
      group({
        title: 'title and menu',
        style: layout_vertical('17'),
        controls: [
          label({title: 'message', style: label_studioMessage()}),
          group({
            style: layout_flex('space-between'),
            controls: [
              studio_toolbar(),
              studio_searchComponent()
            ],
            features: [css_width('1040')]
          })
        ],
        features: css('{ padding-left: 18px; width: 100%; }')
      })
    ],
    features: css('{ height: 90px; border-bottom: 1px #d9d9d9 solid}')
  })
})

jb.component('studio.path-hyperlink',  /* studio_pathHyperlink */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'prefix', as: 'string'}
  ],
  impl: group({
    style: layout_horizontal('9'),
    controls: [
      label('%$prefix%'),
      button({
        title: ctx => {
	  		const path = ctx.componentContext.params.path;
	  		const title = jb.studio.shortTitle(path) || '',compName = jb.studio.compNameOfPath(path) || '';
	  		return title == compName ? title : compName + ' ' + title;
	  	},
        action: studio_gotoPath('%$path%'),
        style: button_href(),
        features: feature_hoverTitle('%$path%')
      })
    ]
  })
})

