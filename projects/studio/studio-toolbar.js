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
      studio.openProperties(true)
    ]
  )
})

jb.component('studio.toolbar', { /* studio.toolbar */
  type: 'control',
  impl: group({
    layout: layout.horizontal('5'),
    controls: [
      button({
        title: 'Select',
        action: studio.pickAndOpen(),
        style: button.mdcIcon('call_made')
      }),
      button({
        title: 'Save',
        action: studio.saveComponents(),
        style: button.mdcIcon('save'),
        features: ctrlAction(studio.saveComponents())
      }),
      button({
        title: 'Refresh Preview',
        action: studio.refreshPreview(),
        style: button.mdcIcon('refresh')
      }),
      button({
        title: 'Javascript',
        action: studio.editSource(),
        style: button.mdcIcon('code')
      }),
      button({
        title: 'Outline',
        action: studio.openControlTree(),
        style: button.mdcIcon('format_align_left')
      }),
      button({
        title: 'storage',
        action: studio.openProperties(true),
        style: button.mdcIcon('storage')
      }),
      button({
        title: 'jbEditor',
        action: studio.openComponentInJbEditor('%$studio/project%.%$studio/page%'),
        style: button.mdcIcon('build'),
        features: ctrlAction(
          studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true})
        )
      }),
      button({
        title: 'Event Tracker',
        action: studio.openEventTracker(),
        style: button.mdcIcon('hearing'),
        features: ctrlAction(studio.openEventTracker('true'))
      }),
      button({
        title: 'History',
        action: studio.openScriptHistory(),
        style: button.mdcIcon('pets')
      }),
      button({
        title: 'Show Data',
        action: {'$': 'studio.showProbeData'},
        style: button.mdcIcon('input')
      }),
      button({
        title: 'add',
        action: studio.openNewProfileDialog({
          type: 'control',
          mode: 'insert-control',
          onClose: studio.gotoLastEdit()
        }),
        style: button.mdcIcon('add')
      }),
      button({
        title: 'Responsive',
        action: studio.openResponsivePhonePopup(),
        style: button.mdcIcon('tablet_android')
      })
    ],
    features: [
      feature.keyboardShortcut('Alt+C', studio.pickAndOpen()),
      feature.keyboardShortcut(
        'Alt++',
        studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})
      ),
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
