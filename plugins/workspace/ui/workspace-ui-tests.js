using('ui-tests')

component('workspaceUITest.currentTextEditor', {
  doNotRunInTests: true,
  impl: browserTest({
    control: workspace.currentTextEditor(),
    runBefore: workspace.initAsHost({
      docUri: '/plugins/common/common-tests.js',
      docContent: `component('commonTest.join', {\n  impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2'))\n})`,
      line: 1,
      col: 43
    }),
    uiAction: uiActions(waitForSelector('.CodeMirror'), keyboardEvent('#activeEditor', 'keydown', { keyCode: '32', ctrl: 'ctrl' })),
    renderDOM: true
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