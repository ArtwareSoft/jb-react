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

jb.component('dataResource.pickSelection', { /* dataResource.pickSelection */
  passiveData: {
    ctx: null,
    elem: null
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
        style: button.mdcIcon12('add'),
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
          id('pages'),
          itemlist.selection({
            databind: '%$studio/page%',
            onSelection: writeValue('%$studio/profile_path%', studio.currentPagePath()),
            autoSelectFirst: true
          }),
          css.class('studio-pages-items')
        ]
      }),
      text('|'),
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
        features: [id('functions'), css.class('studio-pages-items')]
      })
    ],
    features: [
      css.class('studio-pages'),
      group.wait({for: studio.waitForPreviewIframe(), loadingControl: text({})}),
      studio.watchComponents()
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
          menu.action({title: 'New Project', action: studio.openNewProject(), icon: icon('new')}),
          menu.action({title: 'Open Project ...', action: studio.openProject()}),
          menu.action({
            title: 'Save',
            action: studio.saveComponents(),
            icon: icon('save'),
            shortcut: 'Ctrl+S'
          }),
          menu.action({title: 'Force Save', action: studio.saveComponents(), icon: icon('save')}),
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
                title: '',
                layout: layout.vertical(),
                style: group.tabs({}),
                controls: [
                  group({
                    title: 'Files (js and css)',
                    controls: [
                      itemlist({
                        title: '',
                        items: '%jsFiles%',
                        controls: [
                          editableText({
                            title: 'file',
                            databind: '%%',
                            style: editableText.mdcNoLabel('540'),
                            features: css('background-color: transparent !important')
                          }),
                          button({
                            title: 'delete',
                            action: removeFromArray({array: '%$studio/projectSettings/jsFiles%', itemToRemove: '%%'}),
                            style: button.x('21'),
                            features: [
                              itemlist.shownOnlyOnItemHover(),
                              css.margin({top: '20', right: '', left: ''}),
                              css('background-color: transparent !important')
                            ]
                          })
                        ],
                        style: itemlist.ulLi(),
                        features: [
                          watchRef({ref: '%jsFiles%', includeChildren: 'structure', allowSelfRefresh: true}),
                          itemlist.dragAndDrop()
                        ]
                      }),
                      button({
                        title: 'add file',
                        action: addToArray('%jsFiles%', 'file.js'),
                        style: button.mdc(),
                        raised: '',
                        features: [css.width('200'), css.margin('10')]
                      })
                    ],
                    features: [css.padding({bottom: '10'})]
                  }),
                  group({
                    title: 'Libs',
                    controls: [
                      group({
                        title: 'chips',
                        layout: layout.flex({wrap: 'wrap'}),
                        controls: [
                          dynamicControls({
                            controlItems: '%$studio/libsAsArray%',
                            genericControl: group({
                              title: 'chip',
                              layout: layout.flex({wrap: 'wrap', spacing: '0'}),
                              controls: [
                                button({title: '%% ', style: button.mdcChipAction(), raised: 'false'}),
                                button({
                                  title: 'delete',
                                  style: button.x(),
                                  features: [
                                    css('color: black; z-index: 1000;margin-left: -30px'),
                                    itemlist.shownOnlyOnItemHover()
                                  ]
                                })
                              ],
                              features: [
                                css('color: black; z-index: 1000'),
                                feature.onEvent({
                                  event: 'click',
                                  action: removeFromArray({array: '%$studio/libsAsArray%', itemToRemove: '%%'})
                                }),
                                css.class('jb-item')
                              ]
                            })
                          })
                        ],
                        features: watchRef({
                          ref: '%$studio/libsAsArray%',
                          includeChildren: 'yes',
                          allowSelfRefresh: true,
                          strongRefresh: false
                        })
                      }),
                      group({
                        title: 'add lib',
                        layout: layout.horizontal('20'),
                        controls: [
                          picklist({
                            title: '',
                            databind: '%$studio/libToAdd%',
                            options: picklist.options(keys(ctx => jb.frame.jb_modules)),
                            features: [css.width('160'), picklist.onChange(addToArray('%$studio/libsAsArray%', '%%'))]
                          }),
                          button({
                            title: '+',
                            style: button.mdcIcon(icon({icon: 'Plus', type: 'mdi'})),
                            raised: '',
                            features: [feature.hoverTitle('add lib'), css.margin('5')]
                          })
                        ],
                        features: css.margin({left: '10'})
                      })
                    ]
                  })
                ],
                features: [
                  group.data('%$studio/projectSettings%'),
                  css.width('600'),
                  feature.init(writeValue('%$studio/libsAsArray%', split({text: '%libs%'})))
                ]
              }),
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
      group.data({data: '%$studio/project%', watch: true}),
      feature.init(urlHistory.mapStudioUrlToResource('studio'))
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
