using('ui-testers')

component('uiTest.button.mdcIcon', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$txt%'),
        button('btn1', writeValue('%$txt%', 'bbb'), { style: button.mdcIcon(icon('build')) })
      ],
      features: watchable('txt', 'aaa')
    }),
    expectedResult: contains('bbb'),
    uiAction: click()
  })
})

component('uiTest.icon.mdi', {
  impl: uiTest(control.icon('Yoga', { type: 'mdi' }), contains('svg'))
})

component('uiTest.editableTextMdc', {
  impl: uiTest(editableText('name', '%$person/name%', { style: editableText.mdcInput() }), contains('input','Homer Simpson'))
})

