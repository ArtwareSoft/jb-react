
component('studioTest.categoriesOfType', {
  impl: dataTest(pipeline(tgp.categoriesOfType('control'), '%code%', join()), contains('control'))
})

component('test.simplePipeline', {
  type: 'data',
  impl: pipeline('x','y','z')
})

component('test.cmpWithVars', {
  type: 'data',
  impl: pipeline(Var('v1', 'hello'), 'x', 'y', 'z')
})

component('test.moveInTree', {
  type: 'control',
  impl: group(text('a'), text('b'), text('c'), group(), group())
})

component('test.moveInTree2', {
  type: 'control',
  impl: group(text('a'), text('b'), text('c'), group(), group())
})

component('test.moveInTree3', {
  type: 'control',
  impl: group(text('a'), text('b'), text('c'), group(), group())
})

component('studioTest.setCompInVars', {
  impl: dataTest(tgp.val('test.cmpWithVars~impl~$vars~0~val'), equals(({data}) => data.$, 'pipeline'), {
    runBefore: tgp.setComp('test.cmpWithVars~impl~$vars~0~val', 'pipeline')
  })
})

component('studioTest.moveFixDestinationNullGroup', {
  impl: dataTest({
    calculate: pipeline(
      list(tgp.val('test.moveInTree~impl~controls'), tgp.val('test.moveInTree~impl~controls~2~controls')),
      '%text%',
      join()
    ),
    expectedResult: equals('a,c,b'),
    runBefore: ctx =>
	 		jb.tgp.moveFixDestination('test.moveInTree~impl~controls~1', 'test.moveInTree~impl~controls~3~controls',ctx)
  })
})

component('studioTest.moveFixDestinationEmptyGroup', {
  impl: dataTest({
    calculate: pipeline(
      list(tgp.val('test.moveInTree2~impl~controls'), tgp.val('test.moveInTree2~impl~controls~3~controls')),
      '%text%',
      join()
    ),
    expectedResult: equals('a,c,b'),
    runBefore: ctx =>
	 		jb.tgp.moveFixDestination('test.moveInTree2~impl~controls~1', 'test.moveInTree2~impl~controls~4~controls',ctx)
  })
})

component('studioTest.jbEditorMove', {
  impl: dataTest(pipeline(tgp.val('test.moveInTree3~impl~controls'), '%text%', join()), equals('b,a,c'), {
    runBefore: ctx =>
	 		jb.db.move(jb.tgp.ref('test.moveInTree3~impl~controls~1'), jb.tgp.ref('test.moveInTree3~impl~controls~0'),ctx)
  })
})

component('test.profileAsTextExample', {
  impl: text('a')
})

component('test.referee', {
  impl: ctx => ''
})

component('test.referer1', {
  impl: pipeline(test.referee())
})

component('test.referer2', {
  impl: pipeline(test.referee(), test.referee())
})

component('studioUiTest.gotoReferencesButton', {
  impl: uiTest(studio.gotoReferencesButton('test.referee'), contains('3 references'))
})

component('studio.completionPropOfPt', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls :{$: 'itemlist',"),
    expectedResult: ctx => JSON.stringify(ctx.data || '').indexOf('items') != -1
  })
})

component('studio.completionPtOfType', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls:{ "),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})

component('studio.completionPtOfTypeInArray', {
  impl: dataTest({
    calculate: ctx=> jb.studioCompletion.hint("{$: 'group', controls :[{$: 'label' }, {$:'"),
    expectedResult: ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
  })
})


component('studioTest.pathOfTextInArray', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{$: 'group', \n\tcontrols: [ {$: 'label', text: 'aa' }, {$: 'label', text: '"),
    expectedResult: ctx => ctx.data.join('~') == "controls~1~text"
  })
})

component('studioTest.pathOfTextProp', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{$: 'group', text :{$: 'split' , part: '"),
    expectedResult: ctx => ctx.data.join('~') == "text~part"
  })
})

component('studioTest.pathOfTextPropTop', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{ $:'group', style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})

component('studioTest.pathOfTextPropAfterArray', {
  impl: dataTest({
    calculate: ctx => jb.studioCompletion.pathOfText("{ $:'group', controls :[{$: '' }, {$:'label'}], style :{$: 'layo"),
    expectedResult: ctx => ctx.data.join('~') == "style"
  })
})

component('test.makeLocalCases', {
  type: 'data',
  params: [
    {id: 'oneSimpleUsage'},
    {id: 'simpleAndComplex'},
    {id: 'multiSimpleUsages'},
    {id: 'usedInFunc'},
    {id: 'toCall'}
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

component('studioTest.makeLocal', {
  impl: dataTest({
    calculate: pipeline(
      Var('aa', 75),
      studio.calcMakeLocal('studioTest.makeLocal~impl~runBefore'),
      ctx => ctx.run(ctx.data),
      join(',')
    ),
    expectedResult: equals('%%', '1,200,3,10,10,75,4'),
    runBefore: test.makeLocalCases('1', '200', { multiSimpleUsages: '10', usedInFunc: '4', toCall: '%$aa%' })
  })
})
