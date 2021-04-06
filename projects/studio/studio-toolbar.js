// var { contentEditable } = jb.ns('contentEditable')

jb.component('studio.toolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('5'),
    controls: [
      // editableBoolean({
      //   databind: '%$studio/settings/contentEditable%',
      //   style: editableBoolean.buttonXV({
      //     yesIcon: icon({icon: 'location_searching', type: 'mdc'}),
      //     noIcon: icon({icon: 'location_disabled', type: 'mdc'}),
      //     buttonStyle: button.mdcFloatingAction('40', true)
      //   }),
      //   title: 'Inline content editing',
      //   features: feature.onEvent('click', contentEditable.deactivate())
      // }),
      // editableBoolean({
      //   databind: '%$studio/settings/activateWatchRefViewer%',
      //   style: editableBoolean.buttonXV({
      //     yesIcon: icon({icon: 'blur_on', type: 'mdc'}),
      //     noIcon: icon({icon: 'blur_off', type: 'mdc'}),
      //     buttonStyle: button.mdcFloatingAction('40', false)
      //   }),
      //   title: 'Watch Data Connections'
      // }),
      button({
        title: 'Select',
        action: studio.pickAndOpen(),
        style: button.mdcIcon(icon('call_made'))
      }),
      button({
        title: 'Save',
        action: studio.saveComponents(),
        style: button.mdcIcon(icon('save')),
        features: [button.ctrlAction(studio.saveComponents()), feature.if(not(studio.inVscode()))]
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
        features: button.ctrlAction(
          studio.openJbEditor({path: '%$studio/profile_path%', newWindow: true})
        )
      }),
      button({
        title: 'Event Tracker',
        action: studio.openEventTracker(),
        style: button.mdcIcon(icon({icon: 'bug_report', type: 'mdc'})),
        features: [button.ctrlAction(studio.openEventTracker())]
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
      feature.globalKeyboardShortcut('Alt+C', studio.pickAndOpen()),
      feature.globalKeyboardShortcut(
        'Alt++',
        studio.openNewProfileDialog({type: 'control', mode: 'insert-control'})
      ),
      feature.globalKeyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.globalKeyboardShortcut('Ctrl+Z', watchableComps.undo()),
      feature.globalKeyboardShortcut('Ctrl+Y', watchableComps.redo()),
      feature.globalKeyboardShortcut(
        'Alt+X',
        studio.openJbEditor({
          path: firstSucceeding('%$studio/profile_path%', studio.currentPagePath())
        })
      ),
      css.transformScale({x: '0.7', y: '0.7'}),
      css.color({
        background: 'var(--jb-menubar-selection-bg)',
        selector: '~ button'
      })
    ]
  })
})
