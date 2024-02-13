using('ui-tests')

component('completionTest.param', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(__text(__'hello world',__ ''__)__,__ __contains('hello world')__)
})`,
    expectedSelections: ['runBefore','style','style','style','runBefore','runBefore','not','runBefore']
  })
})

component('completionTest.param1', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(text(__'hello world', ''), contains('hello world'))
})`,
    expectedSelections: ['style']
  })
})

component('completionTest.pt', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(group(__text('__hello world'), __text('2'__)__), __contains('hello world','2'))
})`,
    expectedSelections: ['button','pipeline','button','style','button','not']
  })
})

component('completionTest.text', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(text(__'__hello'__, __'__'__))
})`, {
    expectedSelections: ['style','pipeline','style','style','pipeline','style']
  })
})

component('completionTest.betweentwoFirstArgs', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(text('hello world'),__ contains('hello world'))
})`,
    expectedSelections: ['runBefore']
  })
})

component('completionTest.pipeline', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(__)))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.typeAdapter', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(text(typeAdapter('state<location>', __TBD())))
})`,
    expectedSelections: ['israel']
  })
})

component('completionTest.pipeline2', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline('__')))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.createPipelineFromComp', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(text(__split()))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 26}},
        newText: 'pipeline(split()'
      }),
    expectedCursorPos: '1,29'
  })
})

component('completionTest.groupInGroup', {
  impl: completionOptionsTest({
    compText: `component('x', {
  impl: uiTest(group(group(__text(''))))
})`,
    expectedSelections: ['button']
  })
})

component('completionTest.singleArgAsArray.begin', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(group(__text('')))
})`, {
    completionToActivate: 'features',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 29}, end: {line: 1, col: 29}},
      newText: ', { features: TBD() }'
    }),
    expectedCursorPos: '1,43'
  })
})

component('completionTest.singleArgAsArray.end', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(group(text('')__))
})`, {
    completionToActivate: 'button',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 29}, end: {line: 1, col: 29}},
        newText: ", button('click me')"
      }),
    expectedCursorPos: '1,38'
  })
})

component('completionTest.singleArgAsArray.middle', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(group(text(''),__ text('2')))
})`, {
    completionToActivate: 'button',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 31}, end: {line: 1, col: 31}},
      newText: `button('click me'), `
    }),
    expectedCursorPos: '1,38'
  })
})

component('completionTest.paramsAndProfiles', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(__text(''))
})`, {
    expectedSelections: ['runBefore','button']
  })
})

component('completionTest.createPipelineFromString', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(text('__aa'))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 24}},
        newText: "pipeline('aa')"
      }),
    expectedCursorPos: '1,29'
  })
})

component('completionTest.createPipelineFromEmptyString', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(text('hello world', '__'))
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 35}, end: {line: 1, col: 37}},
      newText: `pipeline('')`
      }),
    expectedCursorPos: '1,44'
  })
})

component('completionTest.insideVar', {
  impl: completionActionTest(`component('x', {
  impl: dataTest({ vars: [Var('a', '__b')] })
})`, {
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 35}, end: {line: 1, col: 38}},
        newText: `pipeline('b')`
      }),
    expectedCursorPos: '1,44'
  })
})

component('completionTest.splitInsidePipeline', {
  impl: completionActionTest(`component('x', {
  impl: uiTest(text(pipeline(__)))
})`, {
    completionToActivate: 'split',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 29}, end: {line: 1, col: 29}},
        newText: 'split()'
      }),
    expectedCursorPos: '1,35'
  })
})

component('completionTest.splitPart', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(text(pipeline(split(__))))
})`, {
    expectedSelections: ['part']
  })
})

component('completionTest.dynamicFormat', {
  impl: completionActionTest({
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
  impl: completionActionTest(`component('x', {
  impl: uiTest(__text())
})`, {
    completionToActivate: 'group',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
      newText: 'group(text()'
    }),
    expectedCursorPos: '1,21'
  })
})

component('completionTest.wrapWithArray', {
  impl: completionActionTest({
    compText: `component('x', {
  impl: uiTest(text({ features: __id('x') }), contains())
})`,
    completionToActivate: 'wrap with array',
    expectedEdit: () => ({
      range: {start: {line: 1, col: 32}, end: {line: 1, col: 39}},
      newText: `[id('x')]`
    }),
    expectedCursorPos: '1,40'
  })
})

component('completionTest.buttonFeature', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(button('', { features: [__] }))
})`, {
    expectedSelections: ['method','button.ctrlAction']
  })
})

component('completionTest.singleParamAsArray.rx', {
  impl: completionOptionsTest(`component('x', {
  impl: dataTest(rx.pipe(__))
})`, {
    expectedSelections: ['source.data']
  })
})

component('completionTest.singleParamAsArray.data', {
  impl: completionOptionsTest(`component('x', {
  impl: dataTest(pipeline(__))
})`, {
    expectedSelections: ['split']
  })
})

component('completionTest.actionReplaceTBD', {
  impl: completionActionTest(`component('x', {
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
  impl: fixEditedCompTest({
    compText: `component('completionTest.fixEditedSample', {
   impl:     pipeline(__) 
})`,
    expectedFixedComp: `{
  impl: pipeline()
}`
  })
})

component('completionTest.fixEditedCompWrongName', {
  impl: fixEditedCompTest({
    compText: `component('completionTest.fixEditedSample' ,{
  impl: pipeline(__a) 
})`,
    expectedFixedComp: `{
  impl: pipeline(TBD())
}`
  })
})

component('completionTest.people', {
  impl: completionOptionsTest(`component('x', {
  impl: dataTest('%$peopleArray/__')
})`, {
    expectedSelections: ['people (3 items)']
  })
})

component('completionTest.person', {
  impl: completionOptionsTest(`component('x', {
  impl: dataTest('%$__')
})`, {
    expectedSelections: ['$person (4 props)']
  })
})

component('completionTest.writePerson', {
  impl: completionActionTest(`component('x', {
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
  impl: completionActionTest(`component('x', {
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
  impl: completionActionTest(`component('x', {
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
  impl: completionActionTest(`component('x', {
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
  impl: completionActionTest(`component('x', {
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
  impl: completionActionTest(`component('x', {
  impl: state(__)
})`, {
    completionToActivate: 'capital',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 14}, end: {line: 1, col: 14}},
        newText: 'TBD()'
      }),
    expectedCursorPos: '1,14',
    dsl: 'location'
  })
})

component('completionTest.dslTest.nameOverride', {
  impl: completionOptionsTest(`component('x', {
  impl: state(pipeline(__))
})`, {
    expectedSelections: ['checkNameOverride'],
    dsl: 'location'
  })
})

component('completionTest.dslTest.top', {
  impl: completionOptionsTest(`component('x', {
  impl: state(__)
})`, {
    expectedSelections: ['capital'],
    dsl: 'location'
  })
})

component('completionTest.multiLine', {
  impl: completionActionTest({
    compText: `component('x', {
  impl: group(__
    text('hello'),
    group(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
    text('world')
  )
})`,
    completionToActivate: 'button',
    expectedEdit: () => ({
      range: {start: {line: 2, col: 4}, end: {line: 2, col: 4}}, 
      newText: `button('click me'),
    `}),
    expectedCursorPos: '2,11'
  })
})

component('completionTest.multiLineAddProp', {
  impl: completionActionTest({
    compText: `component('x', {
  impl: group(__
    text('hello'),
    group(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
    text('world')
  )
})`,
    completionToActivate: 'features', 
    expectedEdit: () => ({
          range: {start: {line: 1, col: 14}, end: {line: 5, col: 2}},
          newText: `{
    controls: [
      text('hello'),
      group(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
      text('world')
    ],
    features: TBD()
  }`
      }),
    expectedCursorPos: '7,14'
  })
})