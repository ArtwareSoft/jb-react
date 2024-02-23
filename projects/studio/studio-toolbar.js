
component('studio.toolbar', {
  type: 'control',
  impl: group({
    controls: [
      button('Select', studio.pickAndOpen(), { style: button.mdcIcon(icon('call_made')) }),
      button('Save', studio.saveComponents(), {
        style: button.mdcIcon(icon('save')),
        features: [
          button.ctrlAction(studio.saveComponents()),
          feature.if(not(studio.inVscode()))
        ]
      }),
      button('Refresh Preview', probe.restartPreviewWorker(), { style: button.mdcIcon(icon('refresh')) }),
      button('Javascript', studio.editSource(), {
        style: button.mdcIcon(icon('LanguageJavascript', { type: 'mdi' }))
      }),
      button('Outline', studio.openControlTree(), { style: button.mdcIcon(icon('format_align_left')) }),
      button('Properties', studio.openProperties(true), {
        style: button.mdcIcon(icon('storage'))
      }),
      button('jbEditor', studio.openComponentInJbEditor(studio.currentPagePath()), {
        style: button.mdcIcon(icon('build')),
        features: button.ctrlAction(
          studio.openJbEditor('%$studio/profile_path%', { newWindow: true })
        )
      }),
      button('Event Tracker', studio.openEventTracker(), {
        style: button.mdcIcon(icon('bug_report', { type: 'mdc' })),
        features: [
          button.ctrlAction(studio.openEventTracker())
        ]
      }),
      button('History', studio.openScriptHistory(), { style: button.mdcIcon('pets'), features: hidden() }),
      button('add', studio.openNewProfileDialog({ type: 'control', mode: 'insert-control', onClose: studio.gotoLastEdit() }), {
        style: button.mdcIcon(icon('add')),
        features: studio.dropHtml(tgp.insertControl('%$newCtrl%', studio.currentProfilePath()))
      }),
      button('Responsive', studio.openResponsivePhonePopup(), { style: button.mdcIcon(icon('tablet_android')) })
    ],
    layout: layout.horizontal('5'),
    features: [
      feature.globalKeyboardShortcut('Alt+C', studio.pickAndOpen()),
      feature.globalKeyboardShortcut('Alt++', studio.openNewProfileDialog({ type: 'control', mode: 'insert-control' })),
      feature.globalKeyboardShortcut('Alt+N', studio.pickAndOpen('studio')),
      feature.globalKeyboardShortcut('Ctrl+Z', watchableComps.undo()),
      feature.globalKeyboardShortcut('Ctrl+Y', watchableComps.redo()),
      feature.globalKeyboardShortcut('Alt+X', studio.openJbEditor(firstSucceeding('%$studio/profile_path%', studio.currentPagePath()))),
      css.transformScale('0.7', '0.7'),
      css.color({ background: 'var(--jb-menubar-selection-bg)', selector: '~ button' })
    ]
  })
})
