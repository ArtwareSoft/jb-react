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
  impl: probeTest({
    circuit: pipeline('%$people%'),
    probePath: 'items~1',
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name%','Homer Simpson')
  })
})

component('probeTest.extraElement.pipe', {
  impl: probeTest({
    circuit: pipe('%$people%',delay(1)),
    probePath: 'items~2',
    allowClosestPath: true,
    expectedResult: equals('%0.in.data.name%','Homer Simpson')
  })
})

component('probeTest.singleControl', {
  impl: probeTest({
    circuit: group({controls: text('hello')}),
    probePath: 'controls',
    expectedVisits: 1
  })
})

component('probeTest.ptByExample', {
  impl: probeTest({
    circuit: group({controls: itemlist({items: list(1, 2), controls: text('hello')})}),
    probePath: 'controls~controls',
    expectedVisits: 2
  })
})

component('probeTest.usingGlobal', {
  impl: probeTest({
    circuit: group({controls: test.innerLabel()}),
    probePath: 'controls',
    expectedVisits: 1
  })
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
  impl: group({controls: call('ctrl')})
})

component('test.innerLabelTemplateStaticParam', {
  type: 'control',
  params: [
    {id: 'param1', type: 'string'}
  ],
  impl: group({controls: []})
})

component('probeTest.staticInnerInTemplate', {
  impl: probeTest({
    circuit: group({controls: test.innerLabelTemplateStaticParam('hello')}),
    probePath: 'controls~param1',
    expectedVisits: 1
  })
})

component('probeTest.labelText', {
  impl: probeTest({
    circuit: text(
      ctx => 'hello'
    ),
    probePath: 'text',
    expectedVisits: 1
  })
})

component('probeTest.pipelineMultiple', {
  impl: probeTest({
    circuit: pipeline(list(1,2),join()),
    probePath: 'items~1',
    expectedVisits: 1
  })
})

component('probeTest.innerInTemplate', {
  impl: probeTest({
    circuit: group({controls: test.innerLabelTemplate(text('hello'))}),
    probePath: 'controls~ctrl~text',
    expectedVisits: 1
  })
})

component('probeTest.pipelineNoSugar', {
  impl: probeTest({
    circuit: group({controls: text({text: pipeline('hello')})}),
    probePath: 'controls~text~items~0'
  })
})

component('probeTest.gap.actionsArray', {
  impl: probeTest({
    circuit: group({controls: button('hello', [
          winUtils.gotoUrl('google')
        ])}),
    probePath: 'controls~action~0~url',
    allowClosestPath: true,
    expectedVisits: 1
  })
})

component('probeTest.insideWriteValue', {
  impl: probeTest({
    circuit: button({action: writeValue('%$person/name%', 'homer')}),
    probePath: 'action~to',
    expectedVisits: 1
  })
})

component('probeTest.insideOpenDialog', {
  impl: probeTest({
    circuit: button({action: openDialog({content: text('hello')})}),
    probePath: 'action~content~text',
    expectedVisits: 1
  })
})

component('probeTest.insideOpenDialogOnOk', {
  impl: probeTest({
    circuit: button({
      action: openDialog({
        content: text('hello'),
        onOK: writeValue('%$person/name%', 'homer')
      })
    }),
    probePath: 'action~onOK~value',
    expectedVisits: 1
  })
})

component('probeTest.insideGotoUrl', {
  impl: probeTest({
    circuit: button({action: winUtils.gotoUrl('google')}),
    probePath: 'action~url',
    expectedVisits: 1
  })
})

component('test.actionWithSideEffects', {
  type: 'action,has-side-effects',
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: _ => 0
})

component('probeTest.insideActionWithSideEffects', {
  impl: probeTest({
    circuit: button({action: test.actionWithSideEffects('hello')}),
    probePath: 'action~text',
    expectedVisits: 0
  })
})

component('probeTest.filterNoSugar', {
  impl: probeTest({
    circuit: group({controls: text({text: pipeline('hello', filter('%% == \"hello\"'))})}),
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
  impl: pipeline(list('a', 'b'), '%%', join())
})

component('test.pathSrcCaller', {
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: test.pathSrcComp(['a', 'b'])
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
  impl: dataTest(
    pipe(
      probe.runCircuit('test.probePipeline~impl~items~1'),
      ({data}) => data.result.visits
    ),
    equals(2)
  )
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
  impl: text({text: '', features: []})
})

component('suggestionsTest.simpleVars', {
  impl: suggestionsTest({
    expression: '%',
    expectedResult: contains('$people')
  })
})

component('suggestionsTest.varsFilter', {
  impl: suggestionsTest({expression: '%$p', expectedResult: and(contains('$people'), not(contains('$win')))})
})

component('suggestionsTest.component', {
  impl: suggestionsTest({
    path: 'suggestionsTest.defaultProbe~impl~features~0',
    expression: '=watc',
    expectedResult: contains('watchRef')
  }),
  require :{ $: 'suggestionsTest.defaultProbe'}
})

component('suggestionsTest.insideArray', {
  impl: suggestionsTest({expression: '%$peopleArray/', expectedResult: and(contains('people'), not(contains('$people')))})
})

component('suggestionsTest.1', {
  impl: suggestionsTest({expression: '%', expectedResult: contains('people')})
})

component('sampleComp.ctrlWithPipeline', {
  impl: group({
    controls: text(pipeline(list('hello','%$var1%'), join(' '))),
    features: [
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

