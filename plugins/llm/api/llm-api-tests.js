using('ui-testers')

component('llmTest.hello', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: llmViaApi.completions(system('please answer clearly'), user('how large is israel')),
    expectedResult: contains('srael'),
    timeout: 5000
  })
})

component('llmTest.hello.withRedis', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: llmViaApi.completions(system('please answer clearly'), user('how large is USA'), {
      useRedisCache: true
    }),
    expectedResult: contains('3.8'),
    timeout: 5000
  })
})

component('llmTest.hello.reasoning', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: llmViaApi.completions(user('how large is USA?'), {
      metaPrompt: reasoning(),
      useRedisCache: true
    }),
    expectedResult: contains('3.8'),
    timeout: 5000
  })
})

component('llmTest.count', {
  doNotRunInTests: true,
  impl: browserTest({
    control: group({
      controls: [
        itemlist({
          items: rx.pipe(
            source.llmCompletions(user('Count to 20, with a comma between each number and no newlines. E.g., 1,2,3,...'), {
              maxTokens: 1200
            }),
            rx.takeWhile(not('%$llmSession/stop%')),
            rx.take(5),
            rx.log('test')
          ),
          controls: text('%%'),
          style: itemlist.horizontal(),
          features: itemlist.incrementalFromRx()
        }),
        button('stop', writeValue('%$llmSession/stop%', 'true'))
      ],
      features: watchable('llmSession', obj())
    }),
    uiAction: waitForText('20'),
    expectedResult: contains('1,2,3,4,5'),
    renderDOM: true
  })
})