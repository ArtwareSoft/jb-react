using('ui-testers')

component('uiTest.runFEMethod', {
  impl: uiTest({
    control: group(
      button('change', runFEMethodFromBackEnd('#input1', 'changeText', { Data: 'world' })),
      editableText({
        databind: '%$person/name%',
        style: editableText.input(),
        features: [
          id('input1'),
          frontEnd.method('changeText', ({data},{el}) => el.value = data)
        ]
      })
    ),
    expectedResult: contains('world'),
    uiAction: click(),
    emulateFrontEnd: true
  })
})

component('uiTest.onKey', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$out%'),
        editableText('', '%$person/name%', {
          features: feature.onKey('Ctrl+Space', writeValue('%$out%', 'hello'))
        })
      ],
      features: watchable('out')
    }),
    expectedResult: contains('hello'),
    uiAction: keyboardEvent('input', 'keydown', { keyCode: '32', ctrl: 'ctrl' }),
    emulateFrontEnd: true
  })
})

component('uiTest.frontEnd.flow', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$out%'),
        editableText('', '%$person/name%', {
          features: features(
            method('sayHello', writeValue('%$out%', 'hello')),
            frontEnd.flow(source.frontEndEvent('keydown'), sink.BEMethod('sayHello'))
          )
        })
      ],
      features: watchable('out')
    }),
    expectedResult: contains('hello'),
    uiAction: keyboardEvent('input', 'keydown', { keyChar: 'a' }),
    emulateFrontEnd: true
  })
})

component('uiTest.key.match', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$out%'),
        editableText('', '%$person/name%', {
          features: features(
            method('sayHello', writeValue('%$out%', 'hello')),
            frontEnd.flow(
              source.frontEndEvent('keydown'),
              rx.filter(key.match('Ctrl+Space')),
              sink.BEMethod('sayHello')
            )
          )
        })
      ],
      features: watchable('out')
    }),
    expectedResult: contains('hello'),
    uiAction: keyboardEvent('input', 'keydown', { keyCode: '32', ctrl: 'ctrl' }),
    emulateFrontEnd: true
  })
})

component('uiTest.initOrRefresh', {
  impl: uiTest({
    control: group({
      controls: [
        button('change', writeValue('%$name%', '%$name%a')),
        text('%$name%', {
          features: features(
            frontEnd.flow(source.data(1), sink.action()),
            frontEnd.initOrRefresh(({},{cmp,el,FELifeCycle}) => {
                jb.log('refresh test',{cmp,el,FELifeCycle})
            })
          )
        })
      ],
      features: watchable('name', '')
    }),
    expectedResult: contains('aaaa'),
    uiAction: uiActions(click(), click(), click(), click()),
    emulateFrontEnd: true
  })
})

component('uiTest.frontEnd.strongRefresh', {
    doNotRunInTests: true,
  impl: browserTest({
    control: group({
      controls: [
        button('change', writeValue('%$name%', '%$name%a')),
        text('%$name%', {
          features: features(
            id('txt'),
            watchRef('%$name%', { allowSelfRefresh: true, strongRefresh: true }),
            feature.onKey('Enter', writeValue('%$name%', '%$name%a')),
            frontEnd.flow(source.data(1), sink.action())
          )
        })
      ],
      features: watchable('name', '')
    }),
    uiAction: uiActions(
      keyboardEvent('#txt', 'keydown', { keyCode: '13' }),
      keyboardEvent('#txt', 'keydown', { keyCode: '13' }),
      keyboardEvent('#txt', 'keydown', { keyCode: '13' }),
      keyboardEvent('#txt', 'keydown', { keyCode: '13' })
    ),
    expectedResult: contains('aaaa'),
    renderDOM: true
  })
})

component('uiTest.frontEnd.codeMirrorText', {
  doNotRunInTests: true,
  impl: browserTest({
    control: group({
      controls: [
        button('strong', refreshControlById('_editor', { strongRefresh1: true })),
        editableText({ databind: '%$name%', style: editableText.codemirror(), features: id('_editor') })
      ],
      features: watchable('name', 'aaa')
    }),
    uiAction: uiActions(click(), click()),
    expectedResult: contains(''),
    renderDOM: true
  })
})