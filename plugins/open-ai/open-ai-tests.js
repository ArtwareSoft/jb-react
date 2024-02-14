using('ui-tests')

component('llmTest.hello', {
  doNotRunInTests: true,
  impl: dataTest(openAI.completions(system('please answer clearly'), user('how large is israel')), contains('srael'), {
    timeout: 5000
  })
})
