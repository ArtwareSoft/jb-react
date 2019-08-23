jb.component('studio.pickAndOpen', { /* studio.pickAndOpen */
  type: 'action',
  params: [
    {id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'}
  ],
  impl: studio.pick(
    '%$from%',
    [
      writeValue('%$studio/last_pick_selection%', '%%'),
      writeValue('%$studio/profile_path%', '%path%'),
      studio.openControlTree(),
      studio.openProperties()
    ]
  )
})

jb.component('studio.toolbar', { /* studio.toolbar */ 
  type: 'control',
  impl: group({
    style: studio.toolbarStyle(),
    controls: [
      label({title: '', features: css('{ width: 170px }')}),
      button({title: 'Select', action: studio.pickAndOpen(), style: button.mdlIcon('call_made')}),
      button({
        title: 'Save',
        action: studio.saveComponents(),
        style: button.mdlIcon('save'),
        features: ctrlAction(studio.saveComponents(true))
      }),
      button({
        title: 'Refresh Preview',
        action: studio.refreshPreview(),
        style: button.mdlIcon('refresh')
      }),
      button({title: 'Javascript', action: studio.editAsMacro(), style: button.mdlIcon('code')}),
      button({
        title: 'Outline',
        action: studio.openControlTree(),
        style: button.mdlIcon('format_align_left')
      }),
      button({
        title: 'Properties',
        action: studio.openProperties('true'),
        style: button.mdlIcon('storage')
      }),
      button({
        title: 'jbEditor',
        action: studio.openComponentInJbEditor('%$studio/project%.%$studio/page%'),
        style: button.mdlIcon('build'),
        features: ctrlAction(studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true}))
      }),
      button({
        title: 'Event Tracker',
        action: studio.openEventTracker(),
        style: button.mdlIcon('hearing'),
        features: ctrlAction(studio.openEventTracker('true'))
      }),
      button({
        title: 'History',
        action: studio.openScriptHistory(),
        style: button.mdlIcon('pets')
      }),
      button({
        title: 'Show Data',
        action: {$: 'studio.showProbeData'},
        style: button.mdlIcon('input')
      }),
      button({
        title: 'Insert Control',
        action: studio.openNewProfileDialog({type: 'control', mode: 'insert-control', onClose: studio.gotoLastEdit()}),
        style: button.mdlIcon('add')
      }),
      button({
        title: 'Responsive',
        action: studio.openResponsivePhonePopup(),
        style: button.mdlIcon('tablet_android')
      })
    ],
    features: [
      feature.keyboardShortcut('Alt+C', studio.pickAndOpen()),
      feature.keyboardShortcut('Alt++', studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})),
      feature.keyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.keyboardShortcut(
        'Alt+X',
        studio.openJbEditor({
          path: firstSucceeding('%$studio/profile_path%', '%$studio/project%.%$studio/page%')
        })
      )
    ]
  })
})
