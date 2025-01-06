dsl('zui')

component('zuiTest.measureLlmDurationForTasks', {
  impl: dataTest(pipe(
    Var('domain', typeAdapter('domain<zui>', healthCare())),
    candidateTasks(),
    slice(0, 1),
    pipe(
      Var('task', '%%'),
      Var('prompt', '%$domain.itemsPromptForTask()%'),
      llmViaApi.completions(user('%$prompt%'), {
        llmModel: '%model%',
        maxTokens: 25000,
        includeSystemMessages: true,
        useRedisCache: true
      }),
      obj(
        prop('noOfItems', '%$task/noOfItems%'),
        prop('model', '%$task/model/name%'),
        prop('details', '%$task/details%'),
        prop('duration', '%duration%')
      )
    )
  ))
})
//'%model% %$task/onOfItems%: %duration%'

// component('zuiTest.itemKeys', {
//   doNotRunInTests: true,
//   impl: dataTest({
//     calculate: pipe(zui.itemKeysFromLlm(healthCare(gpt_35_turbo_0125()), 5), '%title%', join(',')),
//     expectedResult: contains('')
//   })
// })
