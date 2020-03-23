jb.component('person', { watchableData: {
	name: "Homer Simpson",
	male: true,
	isMale: 'yes',
	age: 42
}
})

jb.component('probeTest.singleControl', {
  impl: studioProbeTest({
    circuit: group({controls: text('hello')}),
    probePath: 'controls',
    expectedVisits: 1
  })
})

jb.component('probeTest.ptByExample', {
  impl: studioProbeTest({
    circuit: group({controls: itemlist({items: list(1, 2), controls: text('hello')})}),
    probePath: 'controls~controls',
    expectedVisits: 2
  })
})

jb.component('probeTest.usingGlobal', {
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabel()}),
    probePath: 'controls',
    expectedVisits: 1
  })
})

jb.component('test.innerLabel', {
  type: 'control',
  impl: text(
    'hello'
  )
})

jb.component('test.innerLabelTemplate', {
  type: 'control',
  params: [
    {id: 'ctrl', type: 'control', dynamic: true}
  ],
  impl: group({
    controls: call('ctrl')
  })
})

jb.component('test.innerLabelTemplateStaticParam', {
  type: 'control',
  params: [
    {id: 'param1', type: 'string'}
  ],
  impl: group({
    controls: [

    ]
  })
})

jb.component('probeTest.staticInnerInTemplate', {
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabelTemplateStaticParam('hello')}),
    probePath: 'controls~param1',
    expectedVisits: 1
  })
})

jb.component('probeTest.labelText', {
  impl: studioProbeTest({
    circuit: text(ctx => 'hello'),
    probePath: 'text',
    expectedVisits: 1
  })
})

jb.component('probeTest.innerInTemplate', {
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabelTemplate(text('hello'))}),
    probePath: 'controls~ctrl~text',
    expectedVisits: 1
  })
})

jb.component('probeTest.pipelineNoSugar', {
  impl: studioProbeTest({
    circuit: group({controls: text({text: pipeline('hello')})}),
    probePath: 'controls~text~items~0'
  })
})

jb.component('probeTest.pipelineSugarJsonFormat', {
  impl: studioProbeTest({
    circuit: group({controls: text({text: {$pipeline: ['hello'] } })}) ,
    probePath: 'controls~text~$pipeline~0'
  })
})

jb.component('probeTest.pipelineOneElemJsonFormat', {
  impl: studioProbeTest({
    circuit: group({controls: text({text: {$: 'pipeline', items: 'hello' }})}),
    probePath: 'controls~text~items'
  })
})

jb.component('probeTest.actionsSugar', {
  impl: studioProbeTest({
    circuit: group({controls: button({title: 'hello', action: [gotoUrl('google')]})}),
    probePath: 'controls~action~0',
    expectedVisits: 1
  })
})

jb.component('probeTest.insideWriteValue', {
  impl: studioProbeTest({
    circuit: button({action: writeValue('%$person/name%', 'homer')}),
    probePath: 'action~to',
    expectedVisits: 1
  })
})

jb.component('probeTest.insideOpenDialog', {
  impl: studioProbeTest({
    circuit: button({action: openDialog({content: text('hello')})}),
    probePath: 'action~content~text',
    expectedVisits: 1
  })
})

jb.component('probeTest.insideOpenDialogOnOk', {
  impl: studioProbeTest({
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

jb.component('probeTest.insideGotoUrl', {
  impl: studioProbeTest({
    circuit: button({action: gotoUrl('google')}),
    probePath: 'action~url',
    expectedVisits: 1
  })
})

jb.component('test.actionWithSideEffects', {
  type: 'action,has-side-effects',
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: _ => 0
})

jb.component('probeTest.insideActionWithSideEffects', {
  impl: studioProbeTest({
    circuit: button({action: test.actionWithSideEffects('hello')}),
    probePath: 'action~text',
    expectedVisits: 0
  })
})


jb.component('probeTest.filterNoSugar', {
  impl: studioProbeTest({
    circuit: group({controls: text({text: pipeline('hello', filter('%% == \"hello\"'))})}),
    probePath: 'controls~text~items~1~filter'
  })
})

jb.component('test.label1', {
  type: 'control',
  impl: text({

  })
})

jb.component('pathChangeTest.wrap', {
  impl: pathChangeTest({
    path: 'test.label1~impl',
    action: studio.wrapWithGroup('test.label1~impl'),
    expectedPathAfter: 'test.label1~impl~controls~0'
  })
})

jb.component('test.pathSrcComp', {
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: list(
    call('items')
  )
})

jb.component('test.pathSrcCaller', {
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: test.pathSrcComp(
    ['a', 'b']
  )
})

jb.component('probeTest.pathSrcThrough$call', {
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrcCaller'}, comp: 'test.pathSrcCaller', path: '' } ),true)
      .runCircuit('test.pathSrc-comp~impl~items~1');
    return probe1.then(res=>
    	''+res.result.visits)
   },
    expectedResult: contains('0')
  })
})

jb.component('probeTest.pathSrcThrough$call2', {
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrcCaller'}, comp: 'test.pathSrcCaller', path: '' } ),true)
      .runCircuit('test.pathSrcCaller~impl~items~1');
    return probe1.then(res=>
    	''+res.result.visits)
   },
    expectedResult: contains('1')
  })
})


// jb.component('path-change-test.insert-comp', {
// 	 impl :{$: 'path-change-test',
// 	 	path: 'test.group1~impl',
// 	 	action :{$: 'studio.insert-control', path: 'test.group1~impl', comp: 'label' },
// 	 	expectedPathAfter: 'test.group1~impl~controls',
// //	 	cleanUp: {$: 'studio.undo'}
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
