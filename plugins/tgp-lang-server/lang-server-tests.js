using('tgp-lang-service-tests')

component('langServiceTest.provideDefinition', {
  impl: dataTest({
    calculate: pipe(langService.dummyCompProps(`component('x', {
  impl: dataTest('', __not())
})`), langService.definition()),
    expectedResult: contains('jb-common', { data: '%path%' })
  })
})

component('langServiceTest.provideDefinition.inFunc', {
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps(
        `component('x', {
  impl: dataTest('', () => { __jb.utils.prettyPrint('aa'); return 3})
})`
      ),
      langService.definition()
    ),
    expectedResult: contains('pretty-print', { data: '%path%' })
  })
})

component('langServiceTest.moveInArrayEdits', {
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps(
        `component('x', {
  impl: dataTest(pipeline(list(1,2,3), __slice(0, 2), join()), equals('1,2'))
})`
      ),
      langService.moveInArrayEdits(1)
    ),
    expectedResult: equals('%cursorPos/col%', 47)
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

component('langServiceTest.completions', {
  impl: dataTest({
    calculate: pipe(langService.dummyCompProps(`component('x', {
  impl: dataTest('', __not())
})`), langService.completionItems(), count()),
    expectedResult: '%% > 0',
    timeout: 2000
  })
})

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
      langService.dummyCompProps(
        `component('uiTest.group', {
  impl: uiTest(group(text('hello world'), text('2')), __containsbb('hello world','2'))
})`
      ),
      langService.compProps(),
      langServer.probe(),
    ),
    expectedResult: and(contains('hello', { allText: '%result/0/in/data%' })),
    timeout: 2000
  })
})

component('langServerTest.studioCircuitUrl', {
  impl: dataTest({
    calculate: pipe(
      langService.dummyCompProps(
        `component('x', {
  impl: dataTest(pipeline('hello,world'), __split(','))
})`
      ),
      langServer.studioCircuitUrl()
    ),
    expectedResult: contains('http://localhost:8082/project/studio/CmpltnTst','impl~expectedResult?sourceCode='),
    timeout: 2000
  })
})

component('langServerTest.tgpModelData', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('someDir/projects/jb-react/plugins/ui/tests/ui-tests.js'),
      '%comps/button/type%'
    ),
    expectedResult: contains('control'),
    timeout: 1000
  })
})

component('langServerTest.tgpModelData.studio', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      remote.tgpModelData('%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js'),
      '%comps%',
      property('studio.main'),
      '%type%'
    ),
    expectedResult: equals('control'),
    timeout: 1000
  })
})

component('langServerTest.tgpModelData.external', {
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
