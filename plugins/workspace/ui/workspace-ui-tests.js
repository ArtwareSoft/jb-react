using('ui-testers')

component('workspaceUITest.currentTextEditor.openCompletions', {
  doNotRunInTests: true,
  impl: uiTest(workspace.currentTextEditor(), contains('"text":"aggregate"'), {
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
  impl: uiTest(workspace.currentTextEditor(), {
    runBefore: workspace.initAsHost('/plugins/common/common-tests.js', { line: 7, col: 43 }),
    uiAction: uiActions(
      keyboardEvent('#activeEditor', 'keydown', { '//': 'Ctrl+Space', keyCode: '32', ctrl: 'ctrl' }),
      waitForSelector('.jb-item'),
      keyboardEvent('input', 'keydown', {
        '//': 'down arrow selection - no UI update is needed at the FE',
        keyCode: 40,
        doNotWaitForNextUpdate: true
      }),
      keyboardEvent('input', 'keyup', { keyCode: 13 })
    ),
    timeout: 3000,
    emulateFrontEnd: true
  })
})

component('workspaceUITest.floatingCompletions', {
  doNotRunInTests: true,
  impl: uiTest(workspace.floatingCompletions(), {
    runBefore: workspace.initAsHost({
      docUri: '/plugins/common/common-tests.js',
      docContent: `component('commonTest.join', {\n  impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2'))\n})`,
      line: 1,
      col: 43
    })
  })
})