using('ui-tests','net')

component('llmStateForTests', { passiveData: {
  prompt: ''
}})

component('llmTest.tutorialBuilder', {
  doNotRunInTests: true,
  impl: uiTest(tutorialBuilder('%$tutorialSample%'), contains('build'))
})

component('llmTest.enrichTutorialData', {
  doNotRunInTests: true,
  impl: dataTest(enrichTutorialData('%$tutorialSample%'), and(
    equals(pipeline('%features%', filter(equals('%id%', 'data<>pipeline')), '%usage/length%'), 7),
    equals(pipeline('%features%', filter(equals('%id%', 'data<>split')), '%params/0/usage/length%'), 2)
  ))
})

component('llmTest.enrichTrainingItem', {
  doNotRunInTests: true,
  impl: dataTest(enrichTrainingItem('%$tutorialSample/training/0%'))
})

component('llmTest.helloToRouter', {
  doNotRunInTests: true,
  impl: dataTest(remote.data('hello', router()), equals('hello'))
})

component('llmTest.listRouter', {
  doNotRunInTests: true,
  impl: dataTest(remote.data(() => Object.keys(jb.jbm.networkPeers) , router()), contains('llmHelper'))
})

component('llmHelperTest.localHelper.sayHello', {
  doNotRunInTests: true,
  impl: uiTest({
    control: llm.localHelper('%$llmTutorial_Query%'),
    expectedResult: equals('%$llmStateForTests/prompt%', 'hello'),
    uiAction: uiActions(setText('setPrompt hello'), keyboardEvent('input', 'keydown', { keyCode: '13' })),
    useFrontEnd: true
  })
})