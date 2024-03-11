using('ui-tests')

component('renderDialogInIframeTest.Floating', {
  doNotRunInTests: true,
  impl: uiFrontEndTest({
    control: text('my text'),
    runBefore: renderDialogInIframe(inPlaceDialog('dialog title', text('dialog text'), { style: inIframe.Floating() })),
    renderDOM: true
  })
})