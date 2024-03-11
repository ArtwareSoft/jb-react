using('ui-tests')

component('uiTest.openDialog', {
  impl: uiTest({
    control: button('click me', openDialog('hello', text('jbart'), { id: 'hello', features: dialogFeature.nearLauncherPosition() })),
    expectedResult: contains('hello','jbart'),
    uiAction: click('button')
  })
})

component('uiTest.codeMirrorDialogResizer', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      features: [
        dialogFeature.nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('uiTest.codeMirrorDialogResizerOkCancel', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      style: dialog.dialogOkCancel(),
      features: [
        dialogFeature.nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('uiTest.refreshDialog', {
  impl: uiTest({
    control: button('click me', openDialog({
      content: text('%$person/name%'),
      features: followUp.action(writeValue('%$person/name%', 'mukki'))
    })),
    expectedResult: contains('mukki'),
    uiAction: uiActions(click('button'), waitForNextUpdate(6))
  })
})

component('uiTest.dialogCleanupBug', {
  impl: uiTest(button('click me', openDialog('hello', text('world'), { id: 'hello' })), isEmpty(dialog.shownDialogs()), {
    uiAction: uiActions(click(), action(dialog.closeAll()))
  })
})

component('uiTest.inPlaceDialog', {
  impl: uiTest(inPlaceDialog('dialog title', text('inside')), contains('dialog title','inside'))
})

