dsl('html')
using('testing')

component('htmlTest', {
  type: 'test<>',
  params: [
    {id: 'page', type: 'page', mandatory: true},
    {id: 'expectedResult', type: 'boolean<>', dynamic: true, mandatory: true},
    {id: 'runBefore', type: 'action<>', dynamic: true},
    {id: 'userEvents', type: 'animation_event<zui>[]'},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean<>'},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'cleanUp', type: 'action<>', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'spy'}
  ],
  impl: dataTest({
    vars: [Var('uiTest', true)],
    calculate: 'html: %$page.section.html()% css: %$page.section.css()%',
    expectedResult: '%$expectedResult()%',
    timeout: '%$timeout%',
    allowError: '%$allowError()%',
    expectedCounters: '%$expectedCounters%',
    spy: ({},{},{spy}) => spy === '' ? 'test,html' : spy,
    includeTestRes: true
  })
})

component('htmlPageRunner', {
  type: 'action<>',
  params: [
    {id: 'page', type: 'page', mandatory: true},
  ],
  impl: (ctx,page) => page.injectIntoElem({topEl: ctx.vars.testElem, registerEvents: true})
})
