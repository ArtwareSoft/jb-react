using('ui-tests')

component('completionTest.param', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(__text(__'hello world',__ ''__)__,__ __contains('hello world')__)
})`,
    expectedSelections: ['runBefore','style','style','style','style','runBefore','not','runBefore']
  })
})

component('completionTest.pt', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(group({ controls: [__text('hello world'), __text('2')__]__ }), __contains(['hello world','2']))
})`,
    expectedSelections: ['button','button','button','style','not']
  })
})

component('completionTest.text', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(__'__hello'__, __'__'__))
})`, {
    expectedSelections: ['pipeline','pipeline','pipeline','pipeline','pipeline','pipeline']
  })
})

component('completionTest.betweentwoFirstArgs', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(text('hello world'),__ contains('hello world'))
})`,
    expectedSelections: ['runBefore']
  })
})

component('completionTest.pipeline', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(__)))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.typeAdapter', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(text(typeAdapter('state<location>', __TBD())))
})`,
    expectedSelections: ['israel']
  })
})

component('completionTest.pipeline2', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(__'')))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.createPipelineFromComp', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(text(__split()))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 26}},
        newText: 'pipeline(split()'
      }),
    expectedCursorPos: '1,36'
  })
})

component('completionTest.addToArray', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(group({ controls: [button('')__] }))
})`, {
    completionToActivate: 'button',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 44}, end: {line: 1, col: 44}},
        newText: ", button('click me')"
      }),
    expectedCursorPos: '1,63'
  })
})

component('completionTest.paramsAndProfiles', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(__''))
})`, {
    expectedSelections: ['pipeline','style']
  })
})

component('completionTest.createPipelineFromString', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(text(__'aa'))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 24}},
        newText: "pipeline('aa')"
      }),
    expectedCursorPos: '1,33'
  })
})

component('completionTest.createPipelineFromEmptyString', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(text('hello world', __''))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 35}, end: {line: 1, col: 37}},
      newText: `pipeline('')`
      }),
    expectedCursorPos: '1,46'
  })
})

component('completionTest.insideVar', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest({ vars: [Var('a', __'b')] })
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 35}, end: {line: 1, col: 38}},
        newText: `pipeline('b')`
      }),
    expectedCursorPos: '1,47'
  })
})

component('completionTest.splitInsidePipeline', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(text(pipeline(__)))
})`, {
    completionToActivate: 'split',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 29}, end: {line: 1, col: 29}},
        newText: 'split()'
      }),
    expectedCursorPos: '1,36'
  })
})

component('completionTest.splitPart', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(split(__))))
})`, {
    expectedSelections: ['part']
  })
})

component('completionTest.dynamicFormat', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: uiTest(__text('my text'), contains('hello world'))
})`,
    completionToActivate: 'uiAction',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 55}, end: {line: 1, col: 55}},
      newText: ', { uiAction: TBD() }'
    }),
    expectedCursorPos: '1,69'
  })
})

component('completionTest.wrapWithGroup', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(__text())
})`, {
    completionToActivate: 'group',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
        newText: `group({ controls: [text()] }`}),
    expectedCursorPos: '1,43'
  })
})

component('completionTest.wrapWithArray', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest({ expectedResult: contains(__'') })
})`, {
    completionToActivate: 'wrap with array',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 42}, end: {line: 1, col: 44}},
      newText: `['']`
    }),
    expectedCursorPos: '1,45'
  })
})

component('completionTest.buttonFeature', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(button('', { features: [__] }))
})`, {
    expectedSelections: ['method','button.ctrlAction']
  })
})

component('completionTest.singleParamAsArray.rx', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest(rx.pipe(__))
})`, {
    expectedSelections: ['source.data']
  })
})

component('completionTest.singleParamAsArray.data', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest(pipeline(__))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.actionReplaceTBD', {
  impl: tgp.completionActionTest(`component('x', {
  impl: uiTest(button('x', remote.action(__TBD())))
})`, {
    completionToActivate: 'move',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 41}, end: {line: 1, col: 44}},
        newText: 'move'
      }),
    expectedCursorPos: '1,46'
  })
})

component('completionTest.fixEditedSample', {
  impl: pipeline()
})

component('completionTest.fixEditedCompSpaces', {
  impl: tgp.fixEditedCompTest(`component('completionTest.fixEditedSample' ,{ impl: pipeline(__) 
})`, `{
  impl: pipeline()
}`)
})

component('completionTest.fixEditedCompWrongName', {
  impl: tgp.fixEditedCompTest(`component('completionTest.fixEditedSample' ,{ impl: pipeline(__a) 
})`, `component('completionTest.fixEditedSample', {
  impl: pipeline(TBD())
})`)
})

component('completionTest.people', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest('%$peopleArray/__')
})`, {
    expectedSelections: ['people (3 items)']
  })
})

component('completionTest.person', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest('%$__')
})`, {
    expectedSelections: ['$person (4 props)']
  })
})

component('completionTest.writePerson', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest('%$__')
})`, {
    completionToActivate: '$person (4 props)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 20}, end: {line: 1, col: 20}},
      newText: 'person/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonInner', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest('%$p__er')
})`, {
    completionToActivate: '$person (4 props)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 23}, end: {line: 1, col: 23}},
      newText: 'son/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonInner2', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest('%$per__')
})`, {
    completionToActivate: '$person (4 props)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 23}, end: {line: 1, col: 23}},
      newText: 'son/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonName', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest('%$person/__')
})`, {
    completionToActivate: 'name (Homer Simpson)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 27}, end: {line: 1, col: 27}},
      newText: 'name%'
    }),
    expectedCursorPos: '1,33'
  })
})

component('completionTest.writePreviewValue', {
  impl: tgp.completionActionTest(`component('x', {
  impl: dataTest('%$peopleArray/__')
})`, {
    completionToActivate: 'people (3 items)',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 32}, end: {line: 1, col: 32}},
        newText: 'people/'
      }),
    expectedCursorPos: '1,39'
  })
})

component('completionTest.dslTest.createProp', {
  impl: tgp.completionActionTest(`component('x', {
  impl: state(__)
})`, {
    completionToActivate: 'capital',
    expectedEdit: () => ({
        range: {start: {line: 2, col: 14}, end: {line: 2, col: 14}},
        newText: 'TBD()'
      }),
    expectedCursorPos: '2,14',
    dsl: 'location'
  })
})

component('completionTest.dslTest.nameOverride', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: state(pipeline(__))
})`, {
    expectedSelections: ['checkNameOverride'],
    dsl: 'location'
  })
})

component('completionTest.dslTest.top', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: state(__)
})`, {
    expectedSelections: ['capital'],
    dsl: 'location'
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
    expectedResult: contains(['http://localhost:8082/project/studio/CmpltnTst','impl~expectedResult?sourceCode=']),
    timeout: 1000
  })
})