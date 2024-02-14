using('ui-tests')

component('uiTest.probeUI.detailedInput', {
  impl: uiTest(probeUI.detailedInput('%$probe_sampleProbe/result%'), contains('---'))
})

component('uiTest.logsView.main', {
  doNotRunInTests: true,
  impl: uiTest(logsView.main('%$probe_sample_result_with_logs/logs%'))
})
