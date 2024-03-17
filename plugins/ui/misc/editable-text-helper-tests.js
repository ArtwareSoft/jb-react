component('editableTextHelperTest.helperPopup', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: editableText.helperPopup(text('--%value%--'), { autoOpen: true })
    }),
    expectedResult: contains('--Homer'),
    uiAction: waitForNextUpdate()
  })
})

component('editableTextHelperTest.picklistHelper', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      style: editableText.mdcInput(),
      features: editableText.picklistHelper(picklist.optionsByComma('1,2,333'), {
        autoOpen: true
      })
    }),
    expectedResult: contains('333'),
    uiAction: waitForNextUpdate()
  })
})

component('editableTextHelperTest.changingOptions', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: editableText.picklistHelper(picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')), {
        showHelper: notEquals(test.getSelectionChar(), 'b'),
        autoOpen: true
      })
    }),
    expectedResult: contains('ddd'),
    uiAction: waitForNextUpdate()
  })
})

component('editableTextHelperTest.richWatchingGroup', {
  impl: uiTest({
    control: group({
      controls: editableText('name', '%$person/name%', {
        features: editableText.picklistHelper(picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')), {
          showHelper: notEquals(test.getSelectionChar(), 'b'),
          autoOpen: true
        })
      }),
      features: watchRef('%$person/name%')
    }),
    expectedResult: contains('ddd'),
    uiAction: waitForNextUpdate()
  })
})

component('editableTextHelperTest.setInput', {
  doNotRunInTests: true,
  impl: browserTest({
    control: editableText('name', '%$person/name%', {
      features: [
        editableText.picklistHelper({
          options: picklist.optionsByComma('1111,2,3,4'),
          autoOpen: true,
          onEnter: editableText.setInputState({ newVal: '%$selectedOption%', assumedVal: '%value%' })
        })
      ]
    }),
    expectedResult: contains('1111</input-val>'),
    uiAction: uiActions(
      waitForSelector('.jb-dialog'),
      keyboardEvent('input', 'keyup', { keyCode: 40 }),
      keyboardEvent('input', 'keyup', { keyCode: 13 })
    ),
    renderDOM: true
  })
})