jb.component('studio.pickAndOpen',  /* studio_pickAndOpen */ {
  type: 'action',
  params: [
    {id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'}
  ],
  impl: studio_pick(
    '%$from%',
    [
      writeValue('%$studio/last_pick_selection%', '%%'),
      writeValue('%$studio/profile_path%', '%path%'),
      studio_openControlTree(),
      studio_openProperties()
    ]
  )
})

jb.component('studio.toolbar',  /* studio_toolbar */ {
  type: 'control',
  impl: group({
    style: studio_toolbarStyle(),
    controls: [
      label({title: '', features: css('{ width: 170px }')}),
      button({title: 'Select', action: studio_pickAndOpen(), style: button_mdlIcon('call_made')}),
      button({
        title: 'Save',
        action: studio_saveComponents(),
        style: button_mdlIcon('save'),
        features: ctrlAction(studio_saveComponents(true))
      }),
      button({
        title: 'Refresh Preview',
        action: studio_refreshPreview(),
        style: button_mdlIcon('refresh')
      }),
      button({title: 'Javascript', action: studio_editAsMacro(), style: button_mdlIcon('code')}),
      button({
        title: 'Outline',
        action: studio_openControlTree(),
        style: button_mdlIcon('format_align_left')
      }),
      button({
        title: 'Properties',
        action: studio_openProperties('true'),
        style: button_mdlIcon('storage')
      }),
      button({
        title: 'jbEditor',
        action: studio_openComponentInJbEditor('%$studio/project%.%$studio/page%'),
        style: button_mdlIcon('build'),
        features: ctrlAction(studio_openJbEditor({path: '%$studio/profile_path%', newWindow: true}))
      }),
      button({
        title: 'Event Tracker',
        action: studio_openEventTracker(),
        style: button_mdlIcon('hearing'),
        features: ctrlAction(studio_openEventTracker('true'))
      }),
      button({
        title: 'History',
        action: studio_openScriptHistory(),
        style: button_mdlIcon('pets')
      }),
      button({
        title: 'Show Data',
        action: {$: 'studio.showProbeData'},
        style: button_mdlIcon('input')
      }),
      button({
        title: 'Insert Control',
        action: studio_openNewProfileDialog({type: 'control', mode: 'insert-control', onClose: studio_gotoLastEdit()}),
        style: button_mdlIcon('add')
      }),
      button({
        title: 'Responsive',
        action: studio_openResponsivePhonePopup(),
        style: button_mdlIcon('tablet_android')
      })
    ],
    features: [
      feature_keyboardShortcut('Alt+C', studio_pickAndOpen()),
      feature_keyboardShortcut('Alt++', studio_openNewProfileDialog({type: 'control', mode: 'insert-control'})),
      feature_keyboardShortcut('Alt+N', studio_pickAndOpen('studio')),
      feature_keyboardShortcut(
        'Alt+X',
        studio_openJbEditor({
          path: firstSucceeding('%$studio/profile_path%', '%$studio/project%.%$studio/page%')
        })
      )
    ]
  })
})
