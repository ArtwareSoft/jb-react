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
      features: editableText.picklistHelper({ options: picklist.optionsByComma('1,2,333'), autoOpen: true })
    }),
    expectedResult: contains('333'),
    uiAction: waitForNextUpdate()
  })
})

component('editableTextHelperTest.delayedOptions', {
  impl: uiTest({
    control: editableText({
      databind: '%$person/name%',
      features: editableText.picklistHelper({
        options: typeAdapter('data<>', delay(1, obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('1,2,3')))))),
        picklistFeatures: picklist.allowAsynchOptions(),
        showHelper: true
      })
    }),
    expectedResult: true
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
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: [
        editableText.picklistHelper({
          options: picklist.optionsByComma('1111,2,3,4'),
          picklistStyle: picklist.labelList(),
          autoOpen: true,
          onEnter: editableText.setInputState({ newVal: '%$selectedOption%', assumedVal: '%$person/name%' })
        })
      ]
    }),
    expectedResult: contains('value="1111"'),
    uiAction: uiActions(
      waitForSelector('.jb-dialog'),
      keyboardEvent('input', 'keydown', {
        '//': 'down arrow selection - no UI update is needed at the FE',
        keyCode: 40,
        doNotWaitForNextUpdate: true
      }),
      keyboardEvent('input', 'keyup', { keyCode: 13 })
    ),
    emulateFrontEnd: true
  })
})