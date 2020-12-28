jb.ns('nb,studio')

jb.component('studio.notebook', {
  type: 'control',
  impl: group({
    controls: [
      //studio.notebookTopBar(),
      group({
          controls: [
//              widget.twoTierWidget(studio.eventTracker(), remote.notebookWorkerSpy()),
              ctx => ctx.run({$: ctx.exp('%$studio/project%.notebook')}),
          ],
          features: group.wait(pipe(
            studio.initProjectSandbox('%%'),
            waitFor(ctx => jb.comps[ctx.exp('%$studio/project%.notebook')] )
          ), text('loading notebook...') )
      }),
      studio.ctxCounters()
    ],
    features: [
        group.wait(studio.fetchProjectSettings(), text('')), 
        feature.requireService(studio.autoSaveService()), 
        feature.requireService(urlHistory.mapStudioUrlToResource('studio')),
    ]
  })
})

jb.component('studio.notebookTopBar', {
  type: 'control',
  impl: group({
    title: 'top bar',
    layout: layout.flex({alignItems: 'start', spacing: ''}),
    controls: [
      image({
        url: pipeline(studio.baseStudioUrl(), '%%css/jbartlogo.png'),
        width: '',
        features: [css.margin('5', '5'), css.width({width: '80', minMax: 'min'}), css.height('100')]
      }),
      group({
        title: 'title and menu',
        layout: layout.vertical('11'),
        controls: [
          text({text: 'message', style: text.studioMessage()}),
          text({
            text: replace({
              find: '_',
              replace: ' ',
              text: '%$studio/project%'
            }),
            style: text.htmlTag('div'),
            features: [css('{ font: 20px Arial; margin-left: 6px; margin-top: 6px}'), watchRef('%$studio/project%')]
          }),
          group({
            title: 'menu and toolbar',
            layout: layout.flex({spacing: '160'}),
            controls: [
              menu.control({
                menu: studio.notebookMenu(),
                style: menuStyle.pulldown(),
                features: [id('mainMenu'), css.height('30')]
              }),
              group({
                title: 'toolbar',
                controls: studio.notebookToolbar(),
                features: css.margin('-10')
              }),
              controlWithFeatures(studio.searchComponent(), [css.margin('-10', '-100')])
            ]
          })
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: [css('height: 73px; border-bottom: 1px #d9d9d9 solid;')]
  })
})

jb.component('studio.notebookMenu', {
    type: 'menu.option',
    impl: menu.menu({
      title: 'main',
      options: [
        menu.menu({
          title: 'File',
          options: [
            menu.menu({
              title: 'Sample notebooks',
              options: [
              ]
            }),
            menu.action({
              title: 'New Notebook',
              action: studio.openNewProject('notebook'),
              icon: icon('new')
            }),
            menu.action({
              title: 'Open Notebook ...',
              action: studio.openProject('notebook'),
            }),
            menu.action({
              title: 'Save',
              action: studio.saveComponents(),
              icon: icon('save'),
              shortcut: 'Ctrl+S',
            }),
            menu.action({
              title: 'Force Save',
              action: studio.saveComponents(),
              icon: icon('save'),
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
          ]
        })
      ]
    })
})

jb.component('studio.notebookToolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('5'),
    controls: [
      button({
        title: 'Save',
        action: studio.saveComponents(),
        style: button.mdcIcon(icon('save')),
        features: [ctrlAction(studio.saveComponents()), feature.if(not(studio.inVscode()))]
      }),
      button({
        title: 'jbEditor',
        action: studio.openComponentInJbEditor(studio.currentPagePath()),
        style: button.mdcIcon(icon('build')),
        features: ctrlAction(
          studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true})
        )
      }),
      button({
        title: 'History',
        action: studio.openScriptHistory(),
        style: button.mdcIcon('pets'),
        features: hidden()
      }),
      button({
        title: 'add',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: studio.gotoLastEdit()
        }),
        style: button.mdcIcon(icon('add')),
        features: studio.dropHtml(studio.insertControl('%$newCtrl%'))
      }),
      button({
        title: 'Responsive',
        action: studio.openResponsivePhonePopup(),
        style: button.mdcIcon(icon('tablet_android'))
      })
    ],
    features: [
      feature.globalKeyboardShortcut(
        'Alt++',
        studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})
      ),
      feature.globalKeyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.globalKeyboardShortcut('Ctrl+Z', studio.undo()),
      feature.globalKeyboardShortcut('Ctrl+Y', studio.redo()),
      css.transformScale({x: '0.7', y: '0.7'}),
      css.color({
        background: 'var(--jb-menubar-selection-bg)',
        selector: '~ button'
      })
    ]
  })
})

