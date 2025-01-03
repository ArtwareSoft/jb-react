using('ui-testers','net')

component('llhStateForTests', { passiveData: {
  prompt: ''
}})

component('llhTest.helloToRouter', {
  doNotRunInTests: true,
  impl: dataTest(remote.data('hello', router()), equals('hello'))
})

component('llhTest.listRouter', {
  doNotRunInTests: true,
  impl: dataTest(remote.data(() => Object.keys(jb.jbm.networkPeers) , router()), contains('llh'))
})

component('llhTest.openDialogInIframe', {
  doNotRunInTests: true,
  impl: browserTest(text('my text'), { runBefore: llh.openDialogInIframe(), renderDOM: true })
})

component('llhTest.sayHello', {
  doNotRunInTests: true,
  impl: uiTest({
    control: llh.main(),
    expectedResult: equals('%$llmStateForTests/prompt%', 'hello'),
    uiAction: uiActions(setText('setPrompt hello'), keyboardEvent('input', 'keydown', { keyCode: '13' })),
    emulateFrontEnd: true
  })
})

component('llhTest.main', {
  doNotRunInTests: true,
  impl: browserTest(llh.main())
})

component('llhTest.promptEditor', {
  doNotRunInTests: true,
  impl: uiTest(llh.promptEditor(), contains(''))
})

component('llhTest.prompts', {
  doNotRunInTests: true,
  impl: uiTest(llh.prompts(), contains('prompt text'), { uiAction: click('#add-prompt') })
})

component('llhTest.prompt', {
  doNotRunInTests: true,
  impl: dataTest(llh.prompt(text(), text('asaa'), outputAsMD(), example()))
})
