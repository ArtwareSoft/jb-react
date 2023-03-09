
jb.component('studioTest.categoriesOfType', {
  impl: dataTest({
    calculate: pipeline(tgp.categoriesOfType('control'), '%code%', join({})),
    expectedResult: contains(['control'])
  })
})

jb.component('test.simplePipeline', {
  type: 'data',
  impl: pipeline('x', 'y', 'z')
})

jb.component('test.cmpWithVars', {
  type: 'data',
  impl: pipeline(Var('v1', 'hello'), 'x', 'y', 'z')
})

jb.component('test.moveInTree', {
  type: 'control',
  impl: group({
    controls: [
      text('a'),
      text('b'),
      text('c'),
      group(),
      group({controls: []})
    ]
  })
})

jb.component('studioTest.setCompInVars', {
  impl: dataTest({
    calculate: tgp.val('test.cmpWithVars~impl~$vars~0~val'),
    expectedResult: equals(({data}) => data.$,'pipeline'),
    runBefore: tgp.setComp('test.cmpWithVars~impl~$vars~0~val', 'pipeline')
  })
})

jb.component('studioTest.moveFixDestinationNullGroup', {
  impl: dataTest({
    calculate: pipeline(
      list(
          tgp.val('test.moveInTree~impl~controls'),
          tgp.val('test.moveInTree~impl~controls~2~controls')
        ),
      '%text%',
      join({})
    ),
    runBefore: ctx =>
	 		jb.tgp.moveFixDestination('test.moveInTree~impl~controls~1', 'test.moveInTree~impl~controls~3~controls',ctx),
    expectedResult: equals('a,c,b')
  })
})

jb.component('studioTest.moveFixDestinationEmptyGroup', {
  impl: dataTest({
    calculate: pipeline(
      list(
          tgp.val('test.moveInTree~impl~controls'),
          tgp.val('test.moveInTree~impl~controls~3~controls')
        ),
      '%text%',
      join({})
    ),
    runBefore: ctx =>
	 		jb.tgp.moveFixDestination('test.moveInTree~impl~controls~1', 'test.moveInTree~impl~controls~4~controls',ctx),
    expectedResult: equals('a,c,b')
  })
})

jb.component('studioTest.jbEditorMove', {
  impl: dataTest({
    calculate: pipeline(tgp.val('test.moveInTree~impl~controls'), '%text%', join({})),
    runBefore: ctx =>
	 		jb.db.move(jb.tgp.ref('test.moveInTree~impl~controls~1'), jb.tgp.ref('test.moveInTree~impl~controls~0'),ctx),
    expectedResult: equals('b,a,c')
  })
})

jb.component('test.setSugarCompSimple', {
  impl: text({

  })
})

jb.component('test.setSugarCompWrap', {
  impl: text(
    'a'
  )
})

jb.component('test.setSugarCompOverride1', {
  impl: text({
    text: pipeline('a', 'b')
  })
})

jb.component('test.setSugarCompOverride2', {
  impl: text({
    text: list('a', 'b')
  })
})

// jb.component('studioTest.setSugarCompSimple', {
//   impl: dataTest({
//     calculate: tgp.val('test.setSugarCompSimple~impl~text~$pipeline'),
//     runBefore: tgp.setComp('test.setSugarCompSimple~impl~text', 'pipeline'),
//     expectedResult: ctx => JSON.stringify(ctx.data) == '[]'
//   })
// })

// jb.component('studioTest.setSugarCompWrap', {
//   impl: dataTest({
//     calculate: tgp.val('test.setSugarCompWrap~impl~text~$pipeline'),
//     runBefore: tgp.setComp('test.setSugarCompWrap~impl~text', 'pipeline'),
//     expectedResult: ctx =>
// 			JSON.stringify(ctx.data) == '["a"]'
//   })
// })

// jb.component('studioTest.setSugarCompOverride1', {
//   impl: dataTest({
//     calculate: tgp.val('test.setSugarCompOverride1~impl~text~$pipeline'),
//     runBefore: tgp.setComp('test.setSugarCompOverride1~impl~text', 'pipeline'),
//     expectedResult: ctx =>
// 			JSON.stringify(ctx.data) == '["a","b"]'
//   })
// })

// jb.component('studioTest.setSugarCompOverride2', {
//   impl: dataTest({
//     calculate: tgp.val('test.setSugarCompOverride2~impl~text~$pipeline'),
//     runBefore: tgp.setComp('test.setSugarCompOverride2~impl~text', 'pipeline'),
//     expectedResult: ctx =>
// 			JSON.stringify(ctx.data) == '["a","b"]'
//   })
// })

jb.component('test.profileAsTextExample', {
  impl: text('a')
})

jb.component('test.referee', {
  impl: ctx => ''
})

jb.component('test.referer1', {
  impl: pipeline(test.referee())
})

jb.component('test.referer2', {
  impl: pipeline(test.referee(), test.referee())
})

jb.component('studioUiTest.gotoReferencesButton', {
  impl: uiTest({
    control: studio.gotoReferencesButton('test.referee'),
    expectedResult: contains('3 references')
  })
})

jb.component('studio.completionPropOfPt', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls :{$: 'itemlist',"),
    expectedResult: ctx => JSON.stringify(ctx.data || '').indexOf('items') != -1
  })
})

jb.component('studio.completionPtOfType', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls:{ "),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})

jb.component('studio.completionPtOfTypeInArray', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls :[{$: 'label' }, {$:'"),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})


jb.component('studioTest.pathOfTextInArray', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{$: 'group', \n\tcontrols: [ {$: 'label', text: 'aa' }, {$: 'label', text: '"),
    expectedResult: ctx => ctx.data.join('~') == "controls~1~text"
  })
})

jb.component('studioTest.pathOfTextProp', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{$: 'group', text :{$: 'split' , part: '"),
    expectedResult: ctx => ctx.data.join('~') == "text~part"
  })
})

jb.component('studioTest.pathOfTextPropTop', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{ $:'group', style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})

jb.component('studioTest.pathOfTextPropAfterArray', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{ $:'group', controls :[{$: '' }, {$:'label'}], style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})

jb.component('test.makeLocalCases', {
  type: 'data',
  params:[
    { id: 'oneSimpleUsage' },
    { id: 'simpleAndComplex' },
    { id: 'multiSimpleUsages' },
    { id: 'usedInFunc' },
    { id: 'toCall' },
  ],
  impl: list(
    '%$oneSimpleUsage%',
    '%$simpleAndComplex%',
    '%$simpleAndComplex/length%',
    '%$multiSimpleUsages%',
    '%$multiSimpleUsages%',
    call('toCall'),
    (ctx,{},{usedInFunc}) => usedInFunc
  )
})

jb.component('studioTest.makeLocal', {
  impl: dataTest({
    runBefore: test.makeLocalCases({oneSimpleUsage:'1', simpleAndComplex: '200', multiSimpleUsages: '10', usedInFunc: '4', toCall: '%$aa%'}),
    calculate: pipeline(
        Var('aa',75),
        studio.calcMakeLocal('studioTest.makeLocal~impl~runBefore'),
        ctx => ctx.run(ctx.data), 
        join(',')),
    expectedResult: equals('%%','1,200,3,10,10,75,4')
  })
})
