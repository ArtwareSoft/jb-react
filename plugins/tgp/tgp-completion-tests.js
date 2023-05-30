using('ui-tests')

component('completionTest.param', {
  impl: tgp.completionOptionsTest({
    compText:`component('x', {
  impl: uiTest(__{control: text(__{__text: 'hello world',__ title: ''__}__),__ expectedResult: contains('hello world')__})
})`,
    expectedSelections:['runBefore','style','style','style','style','style','runBefore','runBefore']
 })
})

component('completionTest.pipeline', {
  impl: tgp.completionOptionsTest({
    compText: "component('x', {\n  impl: uiTest(text(pipeline(__)))\n})",
    expectedSelections:['split']
 })
})

component('completionTest.pipeline2', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(__'')))
})`, ['split'])
})

component('completionTest.pt', {
  impl: tgp.completionOptionsTest({
    compText:`component('x', {
  impl: uiTest({
    control: group({controls: [__
__      text('hello world in the largest'),__
__      text('2')__
__    ]}),
    expectedResult: __contains(['hello world','2'])
  })
})`,
    expectedSelections:['button','button','button','button','button','button','not']
 })
})

component('completionTest.createPipelineFromComp', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest(text(__split()))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 26}},
        newText: 'pipeline(split()'
      }),
    expectedCursorPos: '1,36'
 })
})

component('completionTest.addToArray', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: uiTest(group({controls: [button('')__]}))\n})`,
    completionToActivate: 'button',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 43}, end: {line: 1, col: 43}},
        newText: ", button('click me')"
      }),
    expectedCursorPos: '1,62'
  })
})

component('completionTest.paramsAndProfiles', {
  impl: tgp.completionOptionsTest({
    compText:"component('x', {\n  impl: uiTest(text(__''))\n})",
    expectedSelections:['pipeline']
 })
})

component('completionTest.paramsAndProfiles2', {
  impl: tgp.completionOptionsTest({
    compText:"component('x', {\n  impl: uiTest(text(__''))\n})",
    expectedSelections:['style']
 })
})

component('completionTest.createPipelineFromString', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest(text(__'aa'))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 24}},
        newText: "pipeline('aa')"
      }),
    expectedCursorPos: '1,33'
 })
})

component('completionTest.createPipelineFromEmptyString', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest(text({text: 'hello world', title: __''}))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 52}},
        newText: "'hello world', pipeline('')"
      }),
    expectedCursorPos: '1,46'
 })
})

component('completionTest.insideVar', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: dataTest({vars: [Var('a', __'b')]})\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 34}, end: {line: 1, col: 37}},
        newText: `pipeline('b')`
      }),
    expectedCursorPos: '1,46'
 })
})

component('completionTest.splitInsidePipeline', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: uiTest(text(pipeline(__)))
})`,
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
})`, ['part'])
})

component('completionTest.dynamicFormat', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest(__{control: text('my text'), expectedResult: contains('hello world')})\n})",
    completionToActivate: 'userInput',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 42}, end: {line: 1, col: 42}},
      newText: 'userInput: TBD(), '
    }),
  expectedCursorPos: '1,53'
 })
})

// component('completionTest.wrapWithGroup', {
//   impl: tgp.completionActionTest({
//     compText: "component('x', {\n  impl: uiTest(__text())\n})",
//     completionToActivate: 'group',
//     expectedEdit: () => ({
//         range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
//         newText: 'group({controls: [text()]}'
//       }),
//     expectedCursorPos: '2,4'
//  })
// })

component('completionTest.wrapWithGroup', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest(__text())\n})",
    completionToActivate: 'group',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
        newText: `group({controls: [text()]}`}),
    expectedCursorPos: '1,40'
 })
})

component('completionTest.wrapWithArray', {
  impl: tgp.completionActionTest({
    compText: "component('x', {\n  impl: uiTest({expectedResult: contains(__'')})\n})",
    completionToActivate: 'wrap with array',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 41}, end: {line: 1, col: 43}},
        newText: "['']"
      }),
    expectedCursorPos: '1,44'
 })
})

component('completionTest.buttonFeature', {
  impl: tgp.completionOptionsTest(
    `component('x', {
  impl: uiTest(button({title: '', features: [__]}))
})`,
    ['method', 'button.ctrlAction']
  )
})

component('completionTest.singleParamAsArray.rx', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest(rx.pipe(__))
})`, ['source.data'])
})

component('completionTest.singleParamAsArray.data', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest(pipeline(__))
})`, ['split'])
})

component('completionTest.actionReplaceTBD', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: uiTest(button('x', remote.action(__TBD())))
})`,
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
  impl: tgp.fixEditedCompTest(
    `component('completionTest.fixEditedSample' ,{ impl: pipeline(__) 
})`,
    `{
  impl: pipeline()
}`
  )
})

component('completionTest.fixEditedCompWrongName', {
  impl: tgp.fixEditedCompTest(
    `component('completionTest.fixEditedSample' ,{ impl: pipeline(__a) 
})`,
    `component('completionTest.fixEditedSample', {
  impl: pipeline(TBD())
})`
  )
})

component('completionTest.people', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest('%$peopleArray/__')
})`, ['people (3 items)'])
})

component('completionTest.person', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: dataTest('%$__')
})`, ['$person (1 prop)'])
})

component('completionTest.writePerson', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: dataTest('%$__')
})`,
    completionToActivate: '$person (1 prop)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 20}, end: {line: 1, col: 20}},
      newText: 'person/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonInner', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: dataTest('%$p__er')
})`,
    completionToActivate: '$person (1 prop)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 23}, end: {line: 1, col: 23}},
      newText: 'son/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonInner2', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: dataTest('%$per__')
})`,
    completionToActivate: '$person (1 prop)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 23}, end: {line: 1, col: 23}},
      newText: 'son/'
    }),
    expectedCursorPos: '1,27'
  })
})

component('completionTest.writePersonName', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: dataTest('%$person/__')
})`,
    completionToActivate: 'name (Homer Simpson)',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 27}, end: {line: 1, col: 27}},
      newText: 'name%'
    }),
    expectedCursorPos: '1,33'
  })
})

component('completionTest.writePreviewValue', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: dataTest('%$peopleArray/__')
})`,
    completionToActivate: 'people (3 items)',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 32}, end: {line: 1, col: 32}},
        newText: 'people/'
      }),
    expectedCursorPos: '1,39'
  })
})

component('completionTest.dslTest.createProp', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: state(__)
})`,
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
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: state(pipeline(__))
})`,
    expectedSelections: ['checkNameOverride'],
    dsl: 'location'
  })
})

component('completionTest.dslTest.top', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: state(__)
})`,
    expectedSelections: ['capital'],
    dsl: 'location'
  })
})

component('remoteTest.langServer.Completions', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps(`component('x', {
  impl: dataTest(pipeline(__))
})`)),
      '1',
      tgp.completionItemsByDocProps('%$docProps%'),
      log('test'),
      count()
    ),
    expectedResult: '%% > 10',
    timeout: 1000
  })
})

component('remoteTest.langServer.ExternalCompletions', {
  impl: dataTest({
    calculate: pipe( 
      Var('docProps', tgp.dummyDocProps({compText: `component('x', {
  impl: dataTest(pipeline(__))
})`, filePath: '/home/shaiby/projects/amta/plugins/amta-parsing/parsing-tests.js'})),
      '1',
      tgp.completionItemsByDocProps('%$docProps%'),
      log('test'),
      count()
    ),
    expectedResult: '%% > 10',
    timeout: 1000
  })
})

component('remoteTest.langServer.StudioCompletions', {
  impl: dataTest({
    calculate: pipe( 
      Var('docProps', tgp.dummyDocProps({compText: `component('x', {
  impl: pipeline(pipeline(__))
})`, filePath: '/home/shaiby/projects/jb-react/projects/studio/studio-main.js'})),
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
    timeout: 5000,
    expectedResult: '%%==split()'
  })
})

component('remoteTest.tgpTextEditor.probeByDocProps', {
  impl: dataTest({
    calculate: pipe(
      Var(
        'docProps',
        tgp.dummyDocProps(`component('x', {
  impl: dataTest(pipeline('hello,world'), __split(','))
})`)
      ),
      tgpTextEditor.probeByDocProps('%$docProps%'),
      '%out%',
      count()
    ),
    expectedResult: equals(2),
    timeout: 1000
  })
})

component('remoteTest.tgpTextEditor.studioCircuitUrlByDocProps', {
  impl: dataTest({
    calculate: pipe(
      Var('docProps', tgp.dummyDocProps({
          compText: `component('x', {
  impl: dataTest(pipeline('hello,world'), __split(','))
})`,
//          filePath: '/home/shaiby/projects/jb-react/plugins/ui/xx-tests.js'
        })
      ),
      tgpTextEditor.studioCircuitUrlByDocProps('%$docProps%')
    ),
    expectedResult: contains(['http://localhost:8082/project/studio/CmpltnTst','impl~expectedResult?sourceCode=']),
    timeout: 1000
  })
})