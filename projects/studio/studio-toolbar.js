jb.ns('contentEditable')

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
          buttonStyle: button.mdcFloatingAction('40', true)
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
          buttonStyle: button.mdcFloatingAction('40', false)
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
        features: [ctrlAction(studio.openEventTracker())]
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
      feature.keyboardShortcut('Ctrl+Z', studio.undo()),
      feature.keyboardShortcut('Ctrl+Y', studio.redo()),
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
