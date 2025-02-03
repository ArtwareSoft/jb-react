component('companionTest.app', {
  impl: htmlTest({
    page: companion.app({
      vars: [
        Var('appData', () => ({
            userPrompt: 'remove dsl',
            compLine: 124,
            originalComp: jb.utils.prettyPrintComp('fixEditedCompTest',jb.comps['test<>fixEditedCompTest']),
        }))
      ]
    }),
    expectedResult: contains('hello world','my css')
  })
})