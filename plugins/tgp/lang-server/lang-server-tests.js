using('tgp-lang-service-tests')

component('langServerTest.join', {
  doNotRunInTests: true,
  impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2'))
})

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
    calculate: pipe(langService.dummyCompProps(`dataTest(pipeline('1,2', split(',', { __part: 'last' })))`), langServer.localReferences()),
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

component('langServerTest.remote.circuitOptions', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: remote.circuitOptions('/plugins/common/xx.js', 'data<>list'),
    expectedResult: equals('%0/shortId%', 'commonTest.listWithVar')
  })
})

component('langServerTest.remoteProbe', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      Var('forceRemoteCompProps', true),
      langService.dummyCompProps({
        compText: `component('commonTest.join', {\n  impl: dataTest(pipeline(list(1,2), '%%', __join()), equals('1,2'))\n})`,
        includeCircuitOptions: true
      }),
      langServer.probe()
    ),
    expectedResult: equals('1', '%result/0/in/data/0%'),
    timeout: 2000
  })
})

component('langServerTest.includeCircuitOptions', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: langService.dummyCompProps({
      compText: `component('commonTest.split', {\n  impl: dataTest(pipeline('1,2', split(',', { part: 'last' })), __equals('2'))\n})`,
      includeCircuitOptions: true
    }),
    expectedResult: equals('%circuitOptions/0/id%', 'test<>commonTest.split'),
    timeout: 2000
  })
})

component('langServerTest.studioCircuitUrl', {
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps({
        compText: `component('commonTest.split', {\n  impl: dataTest(pipeline('1,2', split(',', { part: 'last' })), __equals('2'))\n})`,
        includeCircuitOptions: true
      }),
      langServer.studioCircuitUrl()
    ),
    expectedResult: contains('http://localhost:8082/project/studio/test<>commonTest.split/test<>commonTest.split~impl~expectedResult?sourceCode=','spy=test'),
    timeout: 3000
  })
})

component('remoteTgpModelTest', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('someDir/projects/jb-react/plugins/ui/common/ui-common-tests.js'),
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

component('probeOverlayTest.visitCount', {
  doNotRunInTests: true,
  impl: probeOverlayTest({
    overlay: probeVisitCount(),
    expectedResult: contains(`clz: 'overlay-visitCount-base'`, 'double underline green', {
      allText: prettyPrint()
    }),
    compId: 'test<>langServerTest.join',
    line: 2,
    col: 43
  })
})
