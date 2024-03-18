using('ui-tests,workspace-ui')

component('tgpTextEditorTest.getPosOfPath', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.tgpTextEditor.getPosOfPath('test<>tgpTextEditorTest.getPosOfPath~impl~expectedResult', 'edit'),
      '%line%,%col%'
    ),
    expectedResult: equals('6,27')
  })
})

component('tgpTextEditorTest.pathChangeTest.wrap', {
  impl: tgp.pathChangeTest('control<>probeTest.label1~impl', tgp.wrapWithGroup('control<>probeTest.label1~impl'), {
    expectedPathAfter: 'control<>probeTest.label1~impl~controls~0'
  })
})

component('uiTest.watchableAsText', {
  impl: uiTest({
    control: group({
      vars: [
        Var('watchedText', tgpTextEditor.watchableAsText('%$watchablePeople%'))
      ],
      controls: [
        editableText({
          databind: '%$watchedText%',
          style: editableText.textarea(30, 80),
          features: [
            id('editor'),
            feature.onKey('Alt-P', writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%'))),
            {$: 'textarea.initTgpTextEditor'},
            watchRef('%$watchablePeople%', { includeChildren: 'yes' })
          ]
        }),
        button('show path of cursor', writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%')), {
          features: [
            id('show-path'),
            textarea.enrichUserEvent('#editor')
          ]
        }),
        button('change name', writeValue('%$watchablePeople[1]/name%', 'mukki'), {
          features: id('change-name')
        }),
        text('%$path%')
      ],
      features: [id('group'), watchable('path')]
    }),
    expectedResult: contains('watchablePeople~0~name'),
    uiAction: uiActions(
      waitForSelector('#editor'),
      action(runFEMethodFromBackEnd('#editor', 'setSelectionRange', { Data: obj(prop('from', 22)) })),
      click('#show-path')
    ),
    emulateFrontEnd: true
  })
})

component('uiTest.watchableAsTextWrite', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$watchablePeople%', 'hello'),
    uiAction: setText('hello', '#editor', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableAsTextWriteObjectInArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$watchablePeople/0/a%', '3'),
    uiAction: setText('[{a:3}]', '#editor', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableAsTextWriteSetObjectToArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$emptyArray%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$emptyArray/0/a%', '3'),
    uiAction: setText('[{a:3}]', '#editor', { doNotWaitForNextUpdate: true })
  })
})

