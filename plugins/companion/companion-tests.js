component('companionTest.app', {
  impl: htmlTest({
    page: companion.app({
      vars: [
        Var('appData', () => ({
            preferedLlmModel: 'gpt_35_turbo_0125',
            userPrompt: 'reverse the sort',
            generatedPrompt: '',
            totalCost: '$0.00',
            originalComp: jb.utils.prettyPrintComp('companion.llmModels',jb.comps['data<>companion.llmModels']),
            suggestedComp: jb.utils.prettyPrintComp('companion.llmModels',jb.comps['data<>companion.llmModels']), 
        }))
      ]
    }),
    expectedResult: contains('hello world','my css')
  })
})