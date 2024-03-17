using('ui-tests')

component('renderDialogInIframeTest.Floating', {
  doNotRunInTests: true,
  impl: browserTest({
    control: text('my text'),
    runBefore: renderDialogInIframe({
      dialog: inPlaceDialog('dialog title', text('dialog text'), { style: inIframe.Floating() }),
      sourceCode: plugins('ui-misc,ui-iframe-dialog')
    }),
    renderDOM: true
  })
})