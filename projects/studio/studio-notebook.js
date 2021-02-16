jb.ns('nb,studio')

jb.component('studio.notebook', {
  type: 'control',
  impl: group({
    controls: [
      studio.notebookTopBar(),
      ctx => ctx.run({$: ctx.exp('%$studio/project%.notebook')}),
      studio.ctxCounters()
    ],
    features: [
        group.wait(runActions(
            pipe(
              studio.fetchProjectSettings(),
              ({data}) => self.jb_loadProject(data,{libs: true, appFiles: true}),
            ),
            Var('notebookId', '%$studio/project%.notebook'),
            waitFor(ctx => jb.comps[ctx.exp('%$notebookId%')] ),
            jbm.worker('notebook'),
            remote.action(loadLibs(['ui-common','markdown','two-tier-widget','notebook-worker']),jbm.notebookWorker()),
            remote.initShadowComponent({compId: '%$notebookId%', jbm: jbm.notebookWorker(), initUIObserver: true}),
            studio.initNotebookSaveService(),
        )),
        feature.requireService(urlHistory.mapStudioUrlToResource('studio')),
        id('notebook-main')
    ]
  })
})

jb.component('remote.initShadowComponent', {
  type: 'action',
  params: [
    {id: 'compId', as: 'string'},
    {id: 'initUIObserver', as: 'boolean', description: 'enable watchRef on comps' },
    {id: 'jbm', type: 'jbm'},
  ],
  impl: runActions(
      studio.initLocalCompsRefHandler({compIdAsReferred: '%$compId%', initUIObserver: '%$initUIObserver%'}),
      Var('code',({},{},{compId}) => jb.remoteCtx.serializeCmp(compId)),
      remote.action(runActions(
        ({},{code}) => jb.remoteCtx.deSerializeCmp(code),
        studio.initLocalCompsRefHandler({compIdAsReferred: '%$compId%', initUIObserver: '%$initUIObserver%'}),
      ), '%$jbm%'),
      rx.pipe(
          studio.scriptChange(),
          rx.filter(equals('%path/0%','%$compId%')),
          rx.map(obj(prop('path','%path%'),prop('op','%op%'))),
          sink.action(remote.action( ctx =>
            jb.studio.compsRefHandler.doOp(jb.studio.compsRefHandler.refOfPath(ctx.data.path), ctx.data.op, ctx)
          , '%$jbm%'))
      )
    )
})

jb.component('studio.initNotebookSaveService', {
    type: 'action',
    impl: ctx => {
        const st = jb.studio
        st.changedComps = () => {
            if (!st.compsHistory || !st.compsHistory.length) return []

            const changedComps = jb.unique(st.compsHistory.map(e=>jb.path(e,'opEvent.path.0')))
            return changedComps.map(id=>[id,jb.comps[id]])
        }
    }
})

jb.component('jbm.notebookWorker', {
  type: 'jbm',
  impl: jbm.byUri('studio►notebook')
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
          }),
        ],
        features: css('padding-left: 18px; width: 100%; ')
      })
    ],
    features: [css('height: 73px; border-bottom: 1px #d9d9d9 solid;')]
  })
})

jb.component('nb.nbElemToolbar', {
  type: 'control',
  params: [
    {id: 'path'}
  ],
  impl: group({
    layout: layout.horizontal('3'),
    controls: [
      button({
        title: 'edit',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('edit'), '20')
      }),
      button({
        title: 'Insert Before',
        action: studio.openNewNbElemDialog({
          mode: 'insert-before',
          onClose: studio.openNotebookLastEdit()
        }),
        style: button.mdcIcon(icon('add'), '20')
      }),
      button({
        title: 'insert after',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: studio.openNotebookLastEdit()
        }),
        style: button.mdcIcon(icon('add'), '20')
      }),
      button({
        title: 'view',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('view'), '20')
      }),
      button({
        title: 'edit with preview',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('view'), '20')
      }),
      button({
        title: 'full screen',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('view'), '20')
      }),
      button({
        title: 'inteliscript',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('view'), '20')
      }),
      button({
        title: 'javascript',
        action: studio.openSizesEditor(),
        style: button.mdcIcon(icon('view'), '20')
      }),
      button({
        title: 'Delete',
        action: studio.delete('%$path%'),
        style: button.mdcIcon(icon('delete'), '20')
      })
    ]
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
        features: [button.ctrlAction(studio.saveComponents()), feature.if(not(studio.inVscode()))]
      }),
      button({
        title: 'jbEditor',
        action: studio.openComponentInJbEditor(studio.currentPagePath()),
        style: button.mdcIcon(icon('build')),
        features: button.ctrlAction(studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true}))
      }),
      button({
        title: 'Outline',
        action: studio.openControlTree(),
        style: button.mdcIcon(icon('format_align_left'))
      }),
      button({
        title: 'Properties',
        action: studio.openProperties(true),
        style: button.mdcIcon(icon('storage'))
      }),
      button({
        title: 'Refresh Notebook',
        action: refreshControlById('notebook-main'),
        style: button.mdcIcon(icon('refresh'))
      }),
      button({
        title: 'add',
        action: studio.openNewProfileDialog({
          type: 'nb.elem',
          mode: 'insert-control',
          onClose: studio.gotoLastEdit()
        }),
        style: button.mdcIcon(icon('add'))
      }),
      button({
        title: 'Responsive',
        action: studio.openResponsivePhonePopup(),
        style: button.mdcIcon(icon('tablet_android'))
      })
    ],
    features: [
      feature.globalKeyboardShortcut('Alt++', studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})),
      feature.globalKeyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.globalKeyboardShortcut('Ctrl+Z', studio.undo()),
      feature.globalKeyboardShortcut('Ctrl+Y', studio.redo()),
      css.transformScale('0.7', '0.7'),
      css.color({background: 'var(--jb-menubar-selection-bg)', selector: '~ button'})
    ]
  })
})

