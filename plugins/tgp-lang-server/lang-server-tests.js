using('tgp-lang-service-tests')


component('langServerTest.references', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(langService.dummyCompProps(`dataTest('', __not())`), langServer.references()),
    expectedResult: contains('jb-common', { data: '%path%' }),
    timeout: 5000
  })
})

component('langServerTest.localReferences', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps(`uiTest(text('hello world', { __features: css.color('green') }))`),
      langServer.localReferences()
    ),
    expectedResult: contains('plugins', { data: '%path%' }),
    timeout: 5000
  })
})

// component('langServiceTest.externalCompletions', {
//   impl: dataTest({
//     calculate: pipe(
//       langService.dummyCompProps(`component('x', {
//   impl: dataTest('', __not())
// })`, {
//         filePath: '%$PROJECTS_PATH%/amta/plugins/amta-parsing/parsing-tests.js'
//       }),
//       langService.completionItems(),
//       count()
//     ),
//     expectedResult: '%% > 0',
//     timeout: 5000
//   })
// })
//     covers: ['langServerTest.completions','langServerTest.studioCompletions','langServerTest.editsAndCursorPos','langServerTest.probe','langServerTest.studioCircuitUrl']

// component('langServiceTest.completions', {
//   impl: dataTest({
//     calculate: pipe(langService.dummyCompProps(`component('x', {
//   impl: dataTest('', __not())
// })`), langService.completionItems(), count()),
//     expectedResult: '%% > 0',
//     timeout: 2000
//   })
// })

// component('langServiceTest.studioCompletions', {
//   impl: dataTest({
//     calculate: pipe(
//       langService.dummyCompProps(`component('x', {
//   impl: pipeline(pipeline(__))
// })`, {
//         filePath: '%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js'
//       }),
//       langService.completionItems(),
//       count()
//     ),
//     expectedResult: '%% > 10',
//     timeout: 1000
//   })
// })

component('langServerTest.remoteProbe', {
  impl: dataTest({
    vars: [
      Var('forceRemoteCompProps', true)
    ],
    calculate: pipe(
      langService.dummyCompProps(`component('uiTest.group', {\n  impl: uiTest(group(text('hello world'), text('2')), __contains('hello world','2'))\n})`),
      langService.calcCompProps(),
      langServer.probe()
    ),
    expectedResult: and(contains('hello', { allText: '%result/0/in/data%' })),
    timeout: 2000
  })
})

component('langServerTest.includeCircuitOptions', {
  impl: dataTest({
    calculate: langService.dummyCompProps({
      compText: `component('uiTest.group', {\n  impl: uiTest(group(text('hello world'), text('2')), __contains('hello world','2'))\n})`,
      includeCircuitOptions: true
    }),
    expectedResult: equals('%circuitOptions/0/id%', 'test<>uiTest.group'),
    timeout: 2000
  })
})

component('langServerTest.studioCircuitUrl', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps({
        compText: `component('uiTest.group', {\n  impl: uiTest(group(text('hello world'), text('2')), __contains('hello world','2'))\n})`,
        includeCircuitOptions: true
      }),
      langServer.studioCircuitUrl()
    ),
    expectedResult: contains('http://localhost:8082/project/studio/test<>uiTest.group/test<>uiTest.group~impl~expectedResult?sourceCode=','spy=test,uiTest,headless'),
    timeout: 2000
  })
})

component('langServerTest.runCtxOfRemoteCmdUrl', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps({
        compText: `component('uiTest.group', {\n  impl: uiTest(group(text('hello world'), text('2')), __contains('hello world','2'))\n})`,
        includeCircuitOptions: true
      }),
      langServer.runCtxOfRemoteCmdUrl()
    ),
    expectedResult: contains('http://localhost:8082/project/studio/test<>uiTest.group/test<>uiTest.group~impl~expectedResult?sourceCode=','spy=test,uiTest,headless'),
    timeout: 2000
  })
})

component('remoteTgpModelTest', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('someDir/projects/jb-react/plugins/ui/tests/ui-tests.js'),
      '%comps/control<>button/type%'
    ),
    expectedResult: contains('control'),
    timeout: 1000
  })
})

component('remoteTgpModelTest.tester', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('/home/shaiby/projects/jb-react/plugins/llm/llm-tests.js'),
      '%comps%',
      property('boolean<>tgp.isOfType'),
      '%type%'
    ),
    expectedResult: contains('boolean'),
    timeout: 1000
  })
})

component('remoteTgpModelTest.studio', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js'),
      '%comps%',
      property('control<>studio.main'),
      '%type%'
    ),
    expectedResult: equals('control'),
    timeout: 1000
  })
})

component('remoteTgpModelTest.external', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('%$PROJECTS_PATH%/amta/plugins/amta-parsing/amta-parsing-tests.js'),
      '%comps%',
      property('parser<jison>amta.expressionParser'),
      '%type%'
    ),
    expectedResult: equals('parser<jison>'),
    timeout: 1000,
    spy: ''
  })
})
