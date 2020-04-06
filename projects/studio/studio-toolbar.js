jb.ns('contentEditable')

jb.component('studio.pickAndOpen', {
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

jb.component('studio.toolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('5'),
    controls: [
      editableBoolean({
        databind: '%$studio/settings/contentEditable%',
        style: editableBoolean.buttonXV({
          yesIcon: icon({icon: 'location_searching', type: 'mdc'}),
          noIcon: icon({icon: 'location_disabled', type: 'mdc'}),
          buttonStyle: button.mdcFloatingAction(true, true)
        }),
        title: 'Inline content editing',
        features: [
          feature.onEvent({event: 'click', action: contentEditable.deactivate()}),
          css('background: grey')
        ]
      }),
      editableBoolean({
        databind: '%$studio/settings/activateWatchRefViewer%',
        style: editableBoolean.buttonXV({
          yesIcon: icon({icon: 'blur_on', type: 'mdc'}),
          noIcon: icon({icon: 'blur_off', type: 'mdc'}),
          buttonStyle: button.mdcFloatingAction(true, false)
        }),
        title: 'Watch Data Connections',
        features: css('background: grey')
      }),
      button({
        title: 'Select',
        action: studio.pickAndOpen(),
        style: button.mdcIcon(icon('call_made'))
      }),
      button({
        title: 'Save',
        action: studio.saveComponents(),
        style: button.mdcIcon(icon('save')),
        features: ctrlAction(studio.saveComponents())
      }),
      button({
        title: 'Refresh Preview',
        action: studio.refreshPreview(),
        style: button.mdcIcon(icon('refresh'))
      }),
      button({
        title: 'Javascript',
        action: studio.editSource(),
        style: button.mdcIcon(icon({icon: 'LanguageJavascript', type: 'mdi'}))
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
        title: 'jbEditor',
        action: studio.openComponentInJbEditor(studio.currentPagePath()),
        style: button.mdcIcon(icon('build')),
        features: ctrlAction(
          studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true})
        )
      }),
      button({
        title: 'Event Tracker',
        action: studio.openEventTracker(),
        style: button.mdcIcon(icon({icon: 'bug_report', type: 'mdc'})),
        features: [ctrlAction(studio.openEventTracker('true'))]
      }),
      button({
        title: 'History',
        action: studio.openScriptHistory(),
        style: button.mdcIcon('pets'),
        features: hidden()
      }),
      button({
        title: 'Show Data',
        action: {'$': 'studio.showProbeData'},
        style: button.mdcIcon('input'),
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
      feature.keyboardShortcut('Alt+C', studio.pickAndOpen()),
      feature.keyboardShortcut(
        'Alt++',
        studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})
      ),
      feature.keyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.keyboardShortcut(
        'Alt+X',
        studio.openJbEditor({
          path: firstSucceeding('%$studio/profile_path%', studio.currentPagePath())
        })
      ),
      css.transformScale({x: '0.8', y: '0.8'})
    ]
  })
})
