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
    runBefore: workspace.initAsHost('/plugins/common/common-tests.js', { line: 7, col: 43 }),
    uiAction: action(runActions(
      delay(100),
      runFEMethodFromBackEnd({
        selector: '#activeEditor',
        method: 'applyOverlay',
        Data: asIs({
            id: 'visitCount',
            compId: 'test<>langServerTest.join',
            cssClassDefs: [
              {
                clz: 'overlay-visitCount-base',
                style: {
                  after: {
                    position: 'absolute',
                    bottom: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '20px',
                    lineHeight: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'red',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '12px'
                  }
                }
              },
              {
                clz: 'overlay-visitCount-test__langServerTest-join-impl',
                style: {after: {content: 1}},
                line: 2,
                col: 8
              },
              {
                clz: 'overlay-visitCount-test__langServerTest-join-impl-calculate-items-1',
                style: {after: {content: 2}},
                line: 2,
                col: 37
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
