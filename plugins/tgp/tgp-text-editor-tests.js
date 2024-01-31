component('tgpTextEditorTest.getPosOfPath', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.tgpTextEditor.getPosOfPath('tgpTextEditorTest.getPosOfPath~impl~expectedResult', 'edit'),
      '%line%,%col%'
    ),
    expectedResult: equals('6,27')
  })
})

component('tgpTextEditorTest.pathChangeTest.wrap', {
  impl: tgp.pathChangeTest('probeTest.label1~impl', tgp.wrapWithGroup('probeTest.label1~impl'), {
    expectedPathAfter: 'probeTest.label1~impl~controls~0'
  })
})

component('langServerTest.provideDefinition', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest('', __not())
})`)),
      '1',
      tgp.provideDefinition('%$docProps%'),
      '%path%'
    ),
    expectedResult: contains('jb-common'),
  })
})

component('langServerTest.provideDefinition.inFunc', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(
        `component('x', {
  impl: dataTest('', () => { __jb.utils.prettyPrint('aa'); return 3})
})`
      )),
      '1',
      tgp.provideDefinition('%$docProps%'),
      '%path%'
    ),
    expectedResult: contains('pretty-print')
  })
})

component('langServerTest.moveInArrayEdits', {
  impl: dataTest({
    calculate: pipe(
      tgp.dummyDocProps(
        `component('x', {
  impl: dataTest(pipeline(list(1,2,3), __slice(0, 2), join()), equals('1,2'))
})`
      ),
      tgp.moveInArrayEdits(assign(prop('diff', 1)))
    ),
    expectedResult: equals('%cursorPos/col%', 52)
  })
})

component('remoteTest.langServer.completions', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest('', __not())
})`)),
      '1',
      tgp.completionItemsByDocProps('%$docProps%'),
      log('test'),
      count()
    ),
    expectedResult: '%% > 0',
    timeout: 1000
  })
})

component('remoteTest.langServer.externalCompletions', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest('', __not())
})`, {
        filePath: '%$PROJECTS_PATH%/amta/plugins/amta-parsing/parsing-tests.js'
      })),
      '1',
      tgp.completionItemsByDocProps('%$docProps%'),
      log('test'),
      count()
    ),
    expectedResult: '%% > 0',
    timeout: 1000
  })
})

component('remoteTest.langServer.studioCompletions', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: pipeline(pipeline(__))
})`, {
        filePath: '%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js'
      })),
      '1',
      tgp.completionItemsByDocProps('%$docProps%'),
      log('test'),
      count()
    ),
    expectedResult: '%% > 10',
    timeout: 1000
  })
})

component('remoteTest.langServer.editsAndCursorPos', {
  impl: dataTest({
    vars: [
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest(pipeline(__))
})`))
    ],
    calculate: pipe(
      tgp.completionItemsByDocProps('%$docProps%'),
      filter(equals('%label%', 'split')),
      log('test'),
      tgp.editsAndCursorPosByDocProps('%$docProps%', '%command/arguments/0%'),
      log('test'),
      '%edit/newText%'
    ),
    expectedResult: '%%==split()',
    timeout: 5000
  })
})

component('remoteTest.tgpTextEditor.probeByDocProps', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest(pipeline('hello,world'), __split(','))
})`)),
      tgpTextEditor.probeByDocProps('%$docProps%'),
      '%result/out%',
      count()
    ),
    expectedResult: equals(2),
    timeout: 1000
  })
})

component('remoteTest.tgpTextEditor.studioCircuitUrlByDocProps', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest(pipeline('hello,world'), __split(','))
})`)),
      tgpTextEditor.studioCircuitUrlByDocProps('%$docProps%')
    ),
    expectedResult: contains('http://localhost:8082/project/studio/CmpltnTst','impl~expectedResult?sourceCode='),
    timeout: 1000
  })
})