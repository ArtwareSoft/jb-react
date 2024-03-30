using('ui-testers')

component('workspaceUITest.currentTextEditor.openCompletions', {
  doNotRunInTests: true,
  impl: uiTest(workspace.currentTextEditor(), contains('cmp-pt="text">pipeline</span>'), {
    runBefore: workspace.initAsHost('/plugins/common/common-tests.js', { line: 7, col: 43 }),
    uiAction: uiActions(
      keyboardEvent('#activeEditor', 'keydown', { '//': 'Ctrl+Space', keyCode: '32', ctrl: 'ctrl' }),
      waitForSelector('.jb-item')
    ),
    emulateFrontEnd: true
  })
})

component('workspaceUITest.currentTextEditor.openCompletionsAndSelect', {
  doNotRunInTests: true,
  impl: uiTest(workspace.currentTextEditor(), contains('pipeline(join()))'), {
    runBefore: workspace.initAsHost('/plugins/common/common-tests.js', { line: 7, col: 43 }),
    uiAction: uiActions(
      keyboardEvent('#activeEditor', 'keydown', { '//': 'Ctrl+Space', keyCode: '32', ctrl: 'ctrl' }),
      waitForSelector('.jb-item'),
      keyboardEvent('input', 'keydown', {
        '//': 'down arrow selection - no UI update is needed at the FE',
        keyCode: 40,
        doNotWaitForNextUpdate: true
      }),
      keyboardEvent('input', 'keyup', { keyCode: 13 }),
      waitForText('pipeline(join()))')
    ),
    emulateFrontEnd: true
  })
})

component('workspaceUITest.floatingCompletions', {
  doNotRunInTests: true,
  impl: uiTest(workspace.floatingCompletions(), {
    runBefore: workspace.initAsHost('/plugins/common/common-tests.js', { line: 1, col: 43 })
  })
})

component('workspaceUITest.probeVisitCount', {
  doNotRunInTests: true,
  impl: browserTest(workspace.currentTextEditor(), {
    runBefore: workspace.initAsHost('/plugins/tgp/lang-server/lang-server-tests.js', { line: 4, col: 43 }),
    uiAction1: action(runActions(
      delay(100),
      runFEMethodFromBackEnd({
        selector: '#activeEditor',
        method: 'applyOverlay',
        Data: asIs({
          id: 'visitCount',
          compId: 'test<>langServerTest.join',
          cssClassDefs: [
            {base: true, clz: 'overlay-visitCount-base', style: {}},
            {
              clz: 'overlay-visitCount-test__langServerTest-join-doNotRunInTests',
              style: {textDecoration: []},
              line: 1,
              fromCol: 19,
              toCol: 23
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 8,
              toCol: 16
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 17,
              toCol: 25
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-0',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 26,
              toCol: 30
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-0-items-0',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 31,
              toCol: 32
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-0-items-1',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 33,
              toCol: 34
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-1',
              style: {textDecoration: ['double underline green']},
              line: 2,
              fromCol: 37,
              toCol: 41
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-2',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 43,
              toCol: 47
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-expectedResult',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 52,
              toCol: 58
            },
            {
              clz: 'overlay-visitCount-test__langServerTest-join-impl-expectedResult-item1',
              style: {textDecoration: ['underline green']},
              line: 2,
              fromCol: 59,
              toCol: 64
            }
          ],
          compTextHash: 1205162763,
          fromLine: 2,
          toLine: 6
        })
      })
    )),
    renderDOM: true
  })
})
