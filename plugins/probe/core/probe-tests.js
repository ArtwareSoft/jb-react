using('ui-testers','ui-misc','tgp-text-editor')

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
  impl: probeTest(pipeline('%$people%', '%%'), 'items~1', {
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name.0%', 'Homer Simpson')
  })
})

component('probeTest.extraElement.pipe', {
  impl: probeTest(pipe('%$people%', delay(1)), 'items~2', {
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name.0%', 'Homer Simpson')
  })
})

component('probeTest.singleControl', {
  impl: probeTest(group(text('hello')), 'controls', { expectedVisits: 1 })
})

component('probeTest.ptByExample', {
  impl: probeTest(group(itemlist({ items: list(1,2), controls: text('hello') })), 'controls~controls', {
    expectedVisits: 2
  })
})

component('probeTest.usingGlobal', {
  impl: probeTest(group(test.innerLabel()), 'controls', { expectedVisits: 1 })
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
  impl: group(call('ctrl'))
})

component('test.innerLabelTemplate2', {
  type: 'control',
  params: [
    {id: 'ctrl', type: 'control', dynamic: true}
  ],
  impl: group('%$ctrl()%')
})

component('test.innerLabelTemplateStaticParam', {
  type: 'control',
  params: [
    {id: 'param1', type: 'string'}
  ],
  impl: group()
})

component('probeTest.staticInnerInTemplate', {
  impl: probeTest(group(test.innerLabelTemplateStaticParam('hello')), 'controls~param1', {
    expectedVisits: 1
  })
})

component('probeTest.labelText', {
  impl: probeTest(text(ctx => 'hello'), 'text', { expectedVisits: 1 })
})

component('probeTest.pipelineMultiple', {
  impl: probeTest(pipeline(list(1,2), join()), 'items~0', { expectedVisits: 1 })
})

component('probeTest.innerInTemplate', {
  impl: probeTest(group(test.innerLabelTemplate(text('hello'))), 'controls~ctrl~text', {
    expectedVisits: 1
  })
})

component('probeTest.innerInTemplate2', {
  impl: probeTest(group(test.innerLabelTemplate2(text('hello'))), 'controls~ctrl~text', {
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
  impl: probeTest(button({ action: gotoUrl('google%%') }), 'action~url', { expectedVisits: 1 })
})

component('test.actionWithSideEffects', {
  type: 'action',
  hasSideEffect: true,
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
    calculate: async ctx => {
   	  const res = await new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: {$: 'data<>test.pathSrcCaller'}, comp: 'data<>test.pathSrcCaller', path: '' } ),true)
        .runCircuit('data<>test.pathSrcComp~impl~items~1')
      return res.resultVisits
    },
    expectedResult: equals(1)
  })
})

component('probeTest.pathSrcThrough.call2', {
  impl: dataTest({
    calculate: ctx => {
   	 const probe1 = new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: {$: 'data<>test.pathSrcCaller'}, comp: 'data<>test.pathSrcCaller', path: '' } ),true)
      .runCircuit('data<>test.pathSrcCaller~impl~items~1');
    return probe1.then(res=> ''+res.resultVisits)
   },
    expectedResult: contains('1')
  })
})

component('probeTest.runCircuit', {
  impl: dataTest({
    calculate: pipe(probe.runCircuit('data<>test.probePipeline~impl~items~0'), ({data}) => data.resultVisits),
    expectedResult: equals(2)
  })
})

component('test.sourceDataTest', {
  doNotRunInTests: true,
  impl: dataTest(test.far1())
})

component('test.far1', {
  impl: test.far2()
})

component('test.far2', {
  impl: pipeline(test.far1())
})

component('probeTest.calcCircuit', {
  impl: dataTest({
    calculate: probe.calcCircuitPath('data<>test.far2~impl~items~0'),
    expectedResult: equals('test<>test.sourceDataTest','%path%')
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

component('suggestionsTest.textControl', {
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
    path: 'control<>suggestionsTest.textControl~impl~features~0',
    expectedResult: contains('watchRef')
  }),
  require: 'control<>suggestionsTest.textControl'
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
  impl: group(text(pipeline(list('hello','%$var1%'), join(' '))), {
    features: [
      variable('var1', 'world'),
      variable('xx', 'xx')
    ]
  })
})

component('probeTest.remote.data', {
  impl: probeTest(remote.data(pipeline('hello', '%%', '%% world'), child()), 'calc~items~0', {
    expectedVisits: 1,
    expectedOutResult: equals('hello')
  })
})

component('probeTest.remote.action', {
  impl: probeTest(typeAdapter('action<>', remote.action(runActionOnItem('hello'), child())), 'val~action~item', {
    expectedVisits: 1,
    expectedOutResult: equals('hello')
  })
})

component('probeTest.remote.source', {
  impl: probeTest({
    circuit: rx.pipe(source.remote(source.data(pipeline('hello', '%%', '%% world')), child())),
    probePath: 'elems~0~rx~Data~items~0',
    expectedVisits: 1,
    expectedOutResult: equals('hello')
  })
})

component('probeTest.remote.operator', {
  impl: probeTest({
    circuit: rx.pipe(source.data('hello'), remote.operator(rx.map('%%'), child()), rx.map('%% world')),
    probePath: 'elems~1~rx~func',
    expectedVisits: 1,
    expectedOutResult: equals('hello')
  })
})
