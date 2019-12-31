jb.component('person', { watchableData: {
	name: "Homer Simpson",
	male: true,
	isMale: 'yes',
	age: 42
}
})

jb.component('probe-test.single-control', { /* probeTest.singleControl */
  impl: studioProbeTest({
    circuit: group({controls: label('hello')}),
    probePath: 'controls',
    expectedVisits: 1
  })
})

jb.component('probe-test.pt-by-example', { /* probeTest.ptByExample */
  impl: studioProbeTest({
    circuit: group({controls: itemlist({items: list(1, 2), controls: label('hello')})}),
    probePath: 'controls~controls',
    expectedVisits: 2
  })
})

jb.component('probe-test.using-global', { /* probeTest.usingGlobal */
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabel()}),
    probePath: 'controls',
    expectedVisits: 1
  })
})

jb.component('test.inner-label', { /* test.innerLabel */
  type: 'control',
  impl: label(
    'hello'
  )
})

jb.component('test.inner-label-template', { /* test.innerLabelTemplate */
  type: 'control',
  params: [
    {id: 'ctrl', type: 'control', dynamic: true}
  ],
  impl: group({
    controls: call('ctrl')
  })
})

jb.component('test.inner-label-template-static-param', { /* test.innerLabelTemplateStaticParam */
  type: 'control',
  params: [
    {id: 'param1', type: 'string'}
  ],
  impl: group({ controls: []})
})

jb.component('probe-test.static-inner-in-template', { /* probeTest.staticInnerInTemplate */
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabelTemplateStaticParam('hello')}),
    probePath: 'controls~param1',
    expectedVisits: 1
  })
})

jb.component('probe-test.label-text', {
  impl: studioProbeTest({
    circuit: text({text: ctx => 'hello' }),
    probePath: 'text',
    expectedVisits: 1
  })
})

jb.component('probe-test.inner-in-template', { /* probeTest.innerInTemplate */
  impl: studioProbeTest({
    circuit: group({controls: test.innerLabelTemplate(label('hello'))}),
    probePath: 'controls~ctrl~text',
    expectedVisits: 1
  })
})

jb.component('probe-test.pipeline-sugar-json-format', { /* probeTest.pipelineSugar */
  impl: studioProbeTest({
    circuit: group({controls: label({text: {$pipeline: ['hello'] } })}) ,
    probePath: 'controls~text~$pipeline~0'
  })
})

jb.component('probe-test.pipeline-no-sugar', { /* probeTest.pipelineNoSugar */
  impl: studioProbeTest({
    circuit: group({controls: label({text: pipeline('hello')})}),
    probePath: 'controls~text~items~0'
  })
})

jb.component('probe-test.pipeline-one-elem-json-format', { /* probeTest.pipelineOneElem */
  impl: studioProbeTest({
    circuit: group({controls: label({text: {$: 'pipeline', items: 'hello' }})}),
    probePath: 'controls~text~items'
  })
})

jb.component('probe-test.actions-sugar', { /* probeTest.actionsSugar */
  impl: studioProbeTest({
    circuit: group({controls: button({title: 'hello', action: [gotoUrl('google')]})}),
    probePath: 'controls~action~0',
    expectedVisits: 1
  })
})

jb.component('probe-test.inside-write-value', { /* probeTest.insideWriteValue */
  impl: studioProbeTest({
    circuit: button({action: writeValue('%$person/name%', 'homer')}),
    probePath: 'action~to',
    expectedVisits: 1
  })
})

jb.component('probe-test.inside-open-dialog', { /* probeTest.insideOpenDialog */
  impl: studioProbeTest({
    circuit: button({action: openDialog({content: label('hello')})}),
    probePath: 'action~content~text',
    expectedVisits: 1
  })
})

jb.component('probe-test.inside-open-dialog-onOk', { /* probeTest.insideOpenDialogOnOk */
  impl: studioProbeTest({
    circuit: button({
      action: openDialog({
        content: label('hello'),
        onOK: writeValue('%$person/name%', 'homer')
      })
    }),
    probePath: 'action~onOK~value',
    expectedVisits: 1
  })
})

jb.component('probe-test.inside-goto-url', { /* probeTest.insideGotoUrl */
  impl: studioProbeTest({
    circuit: button({action: gotoUrl('google')}),
    probePath: 'action~url',
    expectedVisits: 1
  })
})

jb.component('test.action-with-side-effects', { /* test.actionWithSideEffects */
  type: 'action,has-side-effects',
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: _ => 0
})

jb.component('probe-test.inside-action-with-side-effects', { /* probeTest.insideActionWithSideEffects */
  impl: studioProbeTest({
    circuit: button({action: test.actionWithSideEffects('hello')}),
    probePath: 'action~text',
    expectedVisits: 0
  })
})


jb.component('probe-test.filter-no-sugar', { /* probeTest.filterNoSugar */
  impl: studioProbeTest({
    circuit: group({controls: label({text: pipeline('hello', filter('%% == \"hello\"'))})}),
    probePath: 'controls~text~items~1~filter'
  })
})

jb.component('test.label1', { /* test.label1 */
  type: 'control',
  impl: label({
    
  })
})

jb.component('path-change-test.wrap', { /* pathChangeTest.wrap */
  impl: pathChangeTest({
    path: 'test.label1~impl',
    action: studio.wrapWithGroup('test.label1~impl'),
    expectedPathAfter: 'test.label1~impl~controls~0'
  })
})

jb.component('test.pathSrc-comp', { /* test.pathSrcComp */
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: list(
    call('items')
  )
})

jb.component('test.pathSrc-caller', { /* test.pathSrcCaller */
  params: [
    {id: 'items', dynamic: true}
  ],
  impl: test.pathSrcComp(
    ['a', 'b']
  )
})

jb.component('probe-test.pathSrc-through-$call', { /* probeTest.pathSrcThrough-$call */
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrc-caller'}, comp: 'test.pathSrc-caller', path: '' } ),true)
      .runCircuit('test.pathSrc-comp~impl~items~1');
    return probe1.then(res=>
    	''+res.result.visits)
   },
    expectedResult: contains('0')
  })
})

jb.component('probe-test.pathSrc-through-$call-2', { /* probeTest.pathSrcThrough-$call-2 */
  impl: dataTest({
    calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrc-caller'}, comp: 'test.pathSrc-caller', path: '' } ),true)
      .runCircuit('test.pathSrc-caller~impl~items~1');
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
