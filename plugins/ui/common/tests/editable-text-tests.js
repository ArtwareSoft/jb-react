component('editableTextTest.simple', {
  impl: uiTest(editableText('name', '%$person/name%'), contains('input','Homer Simpson'))
})

component('editableTextTest.underline', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', { style: underline() }),
    expectedResult: contains('input','Homer Simpson')
  })
})

component('editableTextTest.watchRef', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), text('%$person/name%')),
    expectedResult: contains('hommy</span>'),
    uiAction: setText('hommy')
  })
})

component('editableTextTest.onEnter', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      style: editableText.input(),
      features: feature.onKey('Enter', openDialog({ content: text('hello %$ev/value%') }))
    }),
    expectedResult: contains('hello Homer Simpson'),
    uiAction: keyboardEvent('input', 'keydown', { keyCode: '13' }),
    emulateFrontEnd: true
  })
})

component('editableTextTest.emptyData', {
  impl: uiTest(editableText('name', '%$person/name1%'), and(notContains('object'), notContains('undefined')))
})

component('editableTextTest.xButton', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', { features: editableText.xButton() }),
    expectedResult: contains('input','Homer Simpson','×')
  })
})

component('uiTest.editableText.blockSelfRefresh', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), { features: watchRef('%$person/name%') }),
    expectedResult: contains('Homer Simpson'),
    uiAction: setText('hello', { doNotWaitForNextUpdate: true }),
    expectedCounters: {'start renderVdom': 2}
  })
})

component('uiTest.editableText.allowSelfRefresh', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), {
      features: watchRef('%$person/name%', { allowSelfRefresh: true })
    }),
    expectedResult: contains('hello'),
    uiAction: setText('hello'),
    expectedCounters: {'start renderVdom': 4}
  })
})

component('uiTest.editableText.validation', {
  impl: uiTest({
    control: group(
      editableText('project', '%$person/project%', {
        features: [
          id('fld'),
          validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')
        ]
      })
    ),
    expectedResult: contains('invalid project name'),
    uiAction: setText('a b', '#fld'),
    allowError: true
  })
})

component('uiTest.editableText.onKey', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: [
        id('inp'),
        feature.onKey('ctrl-Enter', openDialog('hello'))
      ]
    }),
    expectedResult: contains('hello'),
    uiAction: keyboardEvent('#inp', 'keydown', { keyCode: 13, ctrl: 'ctrl' }),
    emulateFrontEnd: true
  })
})