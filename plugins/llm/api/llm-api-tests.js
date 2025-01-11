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

component('llmTest.rx', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: rx.pipe(
      source.llmCompletions({
        chat: user(`You are an expert medical assistant for doctors in emergency settings. 
    Given this brief description of a patient or their symptoms, 
    Query: age 40, dizziness, stomach ache
    context: Balance issues
    generate a JSON list of *30* diagnostic suggestions. 
    Each suggestion should follow the structure below and include relevant, accurate medical information.
    
    Each item in the JSON should include:
    - **title**: Name of the condition.
    - **likelihood**: A scale from 1 to 10 estimating how likely this diagnosis is based on the input.
        
    1. Use medical knowledge to populate the fields based on the input hints.  
    2. Generate realistic and context-appropriate values for urgency, likelihood, and other attributes. 

    Example Input:  
    "A patient presents with abdominal pain and fever."
    
    **Response format (JSON)**
    \`\`\`json
    [
      {
        "title": "Appendicitis",
      "likelihood": 7,
      }
    ]
    `),
        llmModel: gpt_4o()
      }),
      llm.textToJsonItems(),
      rx.do(({data}) => console.log(data))
    ),
    expectedResult: contains('')
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