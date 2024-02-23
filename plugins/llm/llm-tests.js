using('ui-tests')

component('llmTest.hello', {
  doNotRunInTests: true,
  impl: dataTest(llm.completions(system('please answer clearly'), user('how large is israel')), contains('srael'), {
    timeout: 5000
  })
})

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

component('llmTest.buildHtml', {
  doNotRunInTests: true,
  impl: uiTest(llm.HtmlAndCssBuilder(), contains('build'))
})

component('llmTest.count', {
  doNotRunInTests: true,
  impl: uiFrontEndTest({
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

component('llmTest.enrichTrainingItem', {
  doNotRunInTests: true,
  impl: dataTest(enrichTrainingItem('%$tutorialSample/training/0%'))
})

