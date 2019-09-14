jb.component('studio-data-test.list-for-tests', { /* studioDataTest.listForTests */
  impl: list(

  )
})

jb.component('studio-data-test.categories-of-type', { /* studioDataTest.categoriesOfType */
  impl: dataTest({
    calculate: pipeline(studio.categoriesOfType('control'), '%code%', join({})),
    expectedResult: contains(['control'])
  })
})

jb.component('studio-data-test.is-of-type-array', { /* studioDataTest.isOfTypeArray */
  impl: dataTest({
    calculate: studio.isOfType('studio-data-test.list-for-tests~items~0', 'data'),
    expectedResult: '%%'
  })
})

jb.component('studio-data-test.param-type-array', { /* studioDataTest.paramTypeArray */
  impl: dataTest({
    calculate: studio.paramType('studio-data-test.list-for-tests~items~0'),
    expectedResult: '%% == \"data\"'
  })
})

jb.component('test.simple-pipeline', { /* test.simplePipeline */
  type: 'data',
  impl: pipeline(
    'x',
    'y',
    'z'
  )
})

jb.component('test.move-in-tree', { /* test.moveInTree */
  type: 'control',
  impl: group({
    controls: [
      label('a'),
      label('b'),
      label('c'),
      group({}),
      group({
        controls: [

        ]
      })
    ]
  })
})

jb.component('studio-data-test.moveFixDestination-null-group', { /* studioDataTest.moveFixDestinationNullGroup */
  impl: dataTest({
    calculate: pipeline(
      list(
          studio.val('test.move-in-tree~impl~controls'),
          studio.val('test.move-in-tree~impl~controls~2~controls')
        ),
      '%title%',
      join({})
    ),
    runBefore: ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~3~controls'),
    expectedResult: equals('a,c,b')
  })
})

jb.component('studio-data-test.moveFixDestination-empty-group', { /* studioDataTest.moveFixDestinationEmptyGroup */
  impl: dataTest({
    calculate: pipeline(
      list(
          studio.val('test.move-in-tree~impl~controls'),
          studio.val('test.move-in-tree~impl~controls~3~controls')
        ),
      '%title%',
      join({})
    ),
    runBefore: ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~4~controls'),
    expectedResult: equals('a,c,b')
  })
})

jb.component('studio-data-test.jb-editor-move', { /* studioDataTest.jbEditorMove */
  impl: dataTest({
    calculate: pipeline(studio.val('test.move-in-tree~impl~controls'), '%title%', join({})),
    runBefore: ctx =>
	 		jb.move(jb.studio.refOfPath('test.move-in-tree~impl~controls~1'), jb.studio.refOfPath('test.move-in-tree~impl~controls~0')),
    expectedResult: equals('b,a,c')
  })
})

jb.component('test.set-sugar-comp-simple', { /* test.setSugarCompSimple */
  impl: label({})
})

jb.component('test.set-sugar-comp-wrap', { /* test.setSugarCompWrap */
  impl: label('a')
})

jb.component('test.set-sugar-comp-override1', { /* test.setSugarCompOverride1 */
  impl: label({
    title: pipeline('a', 'b')
  })
})

jb.component('test.set-sugar-comp-override2', { /* test.setSugarCompOverride2 */
  impl: label({
    title: list('a', 'b')
  })
})

jb.component('studio-data-test.set-sugar-comp-simple', { /* studioDataTest.setSugarCompSimple */
  impl: dataTest({
    calculate: studio.val('test.set-sugar-comp-simple~impl~title~$pipeline'),
    runBefore: studio.setComp('test.set-sugar-comp-simple~impl~title', 'pipeline'),
    expectedResult: ctx => JSON.stringify(ctx.data) == '[]'
  })
})

jb.component('studio-data-test.set-sugar-comp-wrap', { /* studioDataTest.setSugarCompWrap */
  impl: dataTest({
    calculate: studio.val('test.set-sugar-comp-wrap~impl~title~$pipeline'),
    runBefore: studio.setComp('test.set-sugar-comp-wrap~impl~title', 'pipeline'),
    expectedResult: ctx =>
			JSON.stringify(ctx.data) == '["a"]'
  })
})

jb.component('studio-data-test.set-sugar-comp-override1', { /* studioDataTest.setSugarCompOverride1 */
  impl: dataTest({
    calculate: studio.val('test.set-sugar-comp-override1~impl~title~$pipeline'),
    runBefore: studio.setComp('test.set-sugar-comp-override1~impl~title', 'pipeline'),
    expectedResult: ctx =>
			JSON.stringify(ctx.data) == '["a","b"]'
  })
})

jb.component('studio-data-test.set-sugar-comp-override2', { /* studioDataTest.setSugarCompOverride2 */
  impl: dataTest({
    calculate: studio.val('test.set-sugar-comp-override2~impl~title~$pipeline'),
    runBefore: studio.setComp('test.set-sugar-comp-override2~impl~title', 'pipeline'),
    expectedResult: ctx =>
			JSON.stringify(ctx.data) == '["a","b"]'
  })
})

jb.component('test.profile-as-text-example', { /* test.profileAsTextExample */
  impl: label(
    'a'
  )
})

// jb.component('studio-data-test.components-cross-ref', {
// 	 impl :{$: 'data-test',
// 		calculate :{$: 'studio.components-cross-ref' },
// 		expectedResult : ctx => ctx.data.length > 500
// 	},
// })

jb.component('test.referee', { /* test.referee */
  impl: ctx => ''
})

jb.component('test.referer1', { /* test.referer1 */
  impl: {
    '$pipline': [test.referee()]
  }
})

jb.component('test.referer2', { /* test.referer2 */
  impl: {
    '$pipline': [test.referee(), test.referee()]
  }
})

jb.component('studio-ui-test.goto-references-button', { /* studioUiTest.gotoReferencesButton */
  impl: uiTest({
    control: studio.gotoReferencesButton('test.referee'),
    expectedResult: contains('3 references')
  })
})

jb.component('studio.completion-prop-of-pt', { /* studio.completionPropOfPt */
  impl: dataTest({
    calculate: ctx=> jb.studio.completion.hint("{$: 'group', controls :{$: 'itemlist', '{$$}' "),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('items') != -1
  })
})

jb.component('studio.completion-pt-of-type', { /* studio.completionPtOfType */
  impl: dataTest({
    calculate: ctx=> jb.studio.completion.hint("{$: 'group', controls:{ "),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})

jb.component('studio.completion-pt-of-type-in-array', { /* studio.completionPtOfTypeInArray */
  impl: dataTest({
    calculate: ctx=> jb.studio.completion.hint("{$: 'group', controls :[{$: 'label' }, {$:'"),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})


jb.component('studio-data-test.pathOfText-inArray', { /* studioDataTest.pathOfTextInArray */
  impl: dataTest({
    calculate: ctx => jb.studio.completion.pathOfText("{$: 'group', \n\tcontrols: [ {$: 'label', text: 'aa' }, {$: 'label', text: '"),
    expectedResult: ctx => ctx.data.join('~') == "controls~1~text"
  })
})

jb.component('studio-data-test.pathOfText-prop', { /* studioDataTest.pathOfTextProp */
  impl: dataTest({
    calculate: ctx => jb.studio.completion.pathOfText("{$: 'group', text :{$: 'split' , part: '"),
    expectedResult: ctx => ctx.data.join('~') == "text~part"
  })
})

jb.component('studio-data-test.pathOfText-prop-top', { /* studioDataTest.pathOfTextPropTop */
  impl: dataTest({
    calculate: ctx => jb.studio.completion.pathOfText("{ $:'group', style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})


jb.component('studio-data-test.pathOfText-prop-after-array', { /* studioDataTest.pathOfTextPropAfterArray */
  impl: dataTest({
    calculate: ctx => jb.studio.completion.pathOfText("{ $:'group', controls :[{$: '' }, {$:'label'}], style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})
