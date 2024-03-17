using('ui-tests')

component('dialogTest.openDialog', {
  impl: uiTest({
    control: button('click me', openDialog('hello', text('jbart'), { id: 'hello', features: nearLauncherPosition() })),
    expectedResult: contains('hello','jbart'),
    uiAction: click('button')
  })
})

component('dialogTest.codeMirrorDialogResizer', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      features: [
        nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('dialogTest.codeMirrorDialogResizerOkCancel', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      style: dialog.dialogOkCancel(),
      features: [
        nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('dialogTest.refreshDialog', {
  impl: uiTest({
    control: button('click me', openDialog({
      content: text('%$person/name%'),
      features: followUp.action(writeValue('%$person/name%', 'mukki'))
    })),
    expectedResult: contains('mukki'),
    uiAction: uiActions(click('button'), waitForNextUpdate(6))
  })
})

component('dialogTest.closeDialog', {
  impl: uiTest({
    control: button('click me', openDialog('hello', text('world'), { id: 'hello' })),
    expectedResult: isEmpty(querySelectorAll('.jb-dialog')),
    uiAction: uiActions(click(), action(dialog.closeAll()))
  })
})

component('dialogTest.closeDialogWithFlows', {
  impl: uiTest({
    control: button('click me', openDialog('hello', text('world'), {
      style: dialog.div(),
      id: 'hello',
      features: closeWhenClickingOutside()
    })),
    expectedResult: isEmpty(querySelectorAll('.jb-dialog')),
    uiAction: uiActions(click(), action(dialog.closeAll())),
    expectedCounters: {'frontend start flow source.data...7': 1, 'frontend end flow source.data...7': 1},
    emulateFrontEnd: true
  })
})

component('dialogTest.inPlaceDialog', {
  impl: uiTest(inPlaceDialog('dialog title', text('inside')), contains('dialog title','inside'))
})

