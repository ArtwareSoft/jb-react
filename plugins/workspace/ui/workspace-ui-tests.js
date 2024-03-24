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