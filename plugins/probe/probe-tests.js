using('ui-tests')

component('person', { watchableData: {
	name: "Homer Simpson",
	male: true,
	isMale: 'yes',
	age: 42
}})

component('peopleArray', {
  watchableData: {
    people: [
      {name: 'Homer Simpson', age: 42, male: true},
      {name: 'Marge Simpson', age: 38, male: false},
      {name: 'Bart Simpson', age: 12, male: true}
    ]
  }
})

component('probeTest.extraElement.pipeline', {
  impl: probeTest(pipeline('%$people%'), 'items~1', {
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name%', 'Homer Simpson')
  })
})

component('probeTest.extraElement.pipe', {
  impl: probeTest(pipe('%$people%', delay(1)), 'items~2', {
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name%', 'Homer Simpson')
  })
})

component('probeTest.singleControl', {
  impl: probeTest(group({ controls: text('hello') }), 'controls', { expectedVisits: 1 })
})

component('probeTest.ptByExample', {
  impl: probeTest(group({ controls: itemlist({ items: list(1,2), controls: text('hello') }) }), 'controls~controls', {
    expectedVisits: 2
  })
})

component('probeTest.usingGlobal', {
  impl: probeTest(group({ controls: test.innerLabel() }), 'controls', { expectedVisits: 1 })
})

component('test.innerLabel', {
  type: 'control',
  impl: text('hello')
})

component('test.innerLabelTemplate', {
  type: 'control',
  params: [
    {id: 'ctrl', type: 'control', dynamic: true}
  ],
  impl: group({ controls: call('ctrl') })
})

component('test.innerLabelTemplateStaticParam', {
  type: 'control',
  params: [
    {id: 'param1', type: 'string'}
  ],
  impl: group({ controls: [] })
})

component('probeTest.staticInnerInTemplate', {
  impl: probeTest(group({ controls: test.innerLabelTemplateStaticParam('hello') }), 'controls~param1', {
    expectedVisits: 1
  })
})

component('probeTest.labelText', {
  impl: probeTest(text(ctx => 'hello'), 'text', { expectedVisits: 1 })
})

component('probeTest.pipelineMultiple', {
  impl: probeTest(pipeline(list(1,2), join()), 'items~1', { expectedVisits: 1 })
})

component('probeTest.innerInTemplate', {
  impl: probeTest(group({ controls: test.innerLabelTemplate(text('hello')) }), 'controls~ctrl~text', {
    expectedVisits: 1
  })
})

component('probeTest.pipelineNoSugar', {
  impl: probeTest(group({ controls: text(pipeline('hello')) }), 'controls~text~items~0')
})

component('probeTest.gap.actionsArray', {
  impl: probeTest({
    circuit: group({ controls: button('hello', [winUtils.gotoUrl('google')]) }),
    probePath: 'controls~action~0~url',
    allowClosestPath: true,
    expectedVisits: 1
  })
})

component('probeTest.insideWriteValue', {
  impl: probeTest(button({ action: writeValue('%$person/name%', 'homer') }), 'action~to', {
    expectedVisits: 1
  })
})

component('probeTest.insideOpenDialog', {
  impl: probeTest(button({ action: openDialog({ content: text('hello') }) }), 'action~content~text', {
    expectedVisits: 1
  })
})

component('probeTest.gaps.insideOpenDialogOnOk', {
  impl: probeTest({
    circuit: button({ action: openDialog({ content: text('hello'), onOK: writeValue('%$person/name%', 'homer') }) }),
    probePath: 'action~onOK~value',
    expectedVisits: 1
  })
})

component('probeTest.gaps.runActionOnItems', {
  impl: probeTest({
    circuit: button({ action: runActionOnItems('%$people%', writeValue('%$person/name%', '%name%')) }),
    probePath: 'action~action~value',
    expectedVisits: 3
  })
})

component('probeTest.gaps.insideGotoUrl', {
  impl: probeTest(button({ action: winUtils.gotoUrl('google%%') }), 'action~url', { expectedVisits: 1 })
})

component('test.actionWithSideEffects', {
  type: 'action,has-side-effects',
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: _ => 0
})

component('probeTest.insideActionWithSideEffects', {
  impl: probeTest(button({ action: test.actionWithSideEffects('hello') }), 'action~text', {
    expectedVisits: 0
  })
})

component('probeTest.filterNoSugar', {
  impl: probeTest({
    circuit: group({ controls: text(pipeline('hello', filter('%% == "hello"'))) }),
    probePath: 'controls~text~items~1~filter'
  })
})

// jb.component('probeTest.callbag.sniffer', {
//   impl: probeTest({
//     circuit: pipe(rx.pipe(source.data(list('1', '2', '3', '4')), rx.map('-%%-')), join(',')),
//     probePath: 'items~0~elems~1',
//     expectedOutResult: equals(
//       pipeline(filter('%dir%==out'), '%d/data%', join(',')),
//       '-1-,-2-,-3-,-4-'
//     )
//   })
// })

component('probeTest.label1', {
  type: 'control',
  impl: text()
})

component('test.pathSrcComp', {
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: list(call('items'))
})

component('test.probePipeline', {
  impl: pipeline(list('a','b'), '%%', join())
})

component('test.pathSrcCaller', {
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: test.pathSrcComp(['a','b'])
})

component('probeTest.pathSrcThrough.call', {
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: {$: 'test.pathSrcCaller'}, comp: 'test.pathSrcCaller', path: '' } ),true)
      .runCircuit('test.pathSrcComp~impl~items~1');
    return probe1.then(res=> ''+res.result.visits)
   },
    expectedResult: contains('0')
  })
})

component('probeTest.pathSrcThrough.call2', {
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: {$: 'test.pathSrcCaller'}, comp: 'test.pathSrcCaller', path: '' } ),true)
      .runCircuit('test.pathSrcCaller~impl~items~1');
    return probe1.then(res=> ''+res.result.visits)
   },
    expectedResult: contains('1')
  })
})

component('probeTest.runCircuit', {
  impl: dataTest({
    calculate: pipe(probe.runCircuit('test.probePipeline~impl~items~1'), ({data}) => data.result.visits),
    expectedResult: equals(2)
  })
})

// jb.component('path-change-test.insert-comp', {
// 	 impl :{$: 'path-change-test',
// 	 	path: 'test.group1~impl',
// 	 	action :{$: 'studio.insert-control', path: 'test.group1~impl', comp: 'label' },
// 	 	expectedPathAfter: 'test.group1~impl~controls',
// //	 	cleanUp: {$: 'watchableComps.undo'}
// 	}
// })

// jb.component('probe-test.asIs', {
// // 	 impl :{$: 'studio-probe-test',
// // 		circuit: {$: 'group',
// 			controls :{$: 'label', title :{ $asIs: 'hello'} },
// 		},
// 		probePath : 'controls~text~$asIs',
// 		expectedVisits: 0,
// 		probeCheck : '%$tst% == ""'
// 	}
// })

component('suggestionsTest.defaultProbe', {
  type: 'control',
  impl: text('', { features: [] })
})

component('suggestionsTest.simpleVars', {
  impl: suggestionsTest('%', { expectedResult: contains('$people') })
})

component('suggestionsTest.varsFilter', {
  impl: suggestionsTest('%$p', { expectedResult: and(contains('$people'), not(contains('$win'))) })
})

component('suggestionsTest.component', {
  impl: suggestionsTest('=watc', {
    path: 'suggestionsTest.defaultProbe~impl~features~0',
    expectedResult: contains('watchRef')
  }),
  require: suggestionsTest.defaultProbe()
})

component('suggestionsTest.insideArray', {
  impl: suggestionsTest('%$peopleArray/', {
    expectedResult: and(contains('people'), not(contains('$people')))
  })
})

component('suggestionsTest.1', {
  impl: suggestionsTest('%', { expectedResult: contains('people') })
})

component('sampleComp.ctrlWithPipeline', {
  impl: group({
    controls: text(pipeline(list('hello','%$var1%'), join(' '))),
    features: [
      variable('var1', 'world'),
      variable('xx', 'xx')
    ]
  })
})

component('uiTest.probe.detailedInput', {
  impl: uiTest(probe.detailedInput('%$probe_sampleProbe/result%'), () => true)
})

component('probe_sampleProbe', { passiveData: {
  "result": [
      {
          "in": {
              "id": 77,
              "path": "test.probePipeline~impl~items~1",
              "profile": "%%",
              "data": "a",
              "vars": { v1 : 1, v2 : 2 }
          },
          "out": [
              "a"
          ],
          "counter": 0
      },
      {
          "in": {
              "id": 78,
              "path": "test.probePipeline~impl~items~1",
              "profile": "%%",
              "data": "b",
              "vars": { v1 : 1, v2 : 2 }
          },
          "out": [
              "b"
          ],
          "counter": 0
      }
  ]
}
})