using('ui-tests')

component('uiTest.probeUI.detailedInput', {
  impl: uiTest(probeUI.detailedInput('%$probe_sampleProbe/result%'), contains('---'))
})

component('uiTest.probeUilogView', {
  doNotRunInTests: true,
  impl: uiTest(probeUI.probeLogView('%$probe_sample_result_with_logs%'))
})

