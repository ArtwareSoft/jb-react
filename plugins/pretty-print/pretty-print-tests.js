using('ui,remote-widget,parsing,testing')

// component('PPrintTest.simple', {
//   impl: dataTest(prettyPrint(ctx => jb.comps['dataTest.obj'].impl), contains(["prop('a', 1)", ctx => "res: '%%'"]))
// })

component('PPrintTest.vars', {
  impl: dataTest({
    calculate: ctx => {
    try {
      const testToTest = 'dataTest.varsCases'
      const compTxt = jb.utils.prettyPrintComp(testToTest.replace(/varsCases/, 'varsCases2'), jb.comps[testToTest])
      eval(compTxt)
      return ctx.run(dataTest.asArrayBug()) // checks for error
        .then(({ success }) => success && compTxt)
    } catch (e) {
      return false
    }
  },
    expectedResult: contains(`Var('items', [{id: 1}, {id: 2}])`)
  })
})

component('PPrintTest.varsPath', {
  impl: PPPosOfPath(() => split(Var('a', 'b')), 'edit!~$vars~0~val', '27,27')
})

// component('PPrintTest.prependInGroup', {
//   impl: PPPosOfPath(() => group(text(''), text('')), 'prependPT!~controls', '6,6')
// })

component('PPrintTest.prependSingleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'prependPT!~controls', '6,6')
})

component('PPrintTest.singleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'begin!~controls~text', '11,11')
})

component('PPrintTest.multiLineExample', {
  type: 'control',
  impl: group(
    text('hello'),
    group(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
    text('world')
  )
})

component('PPrintTest.multiLine.prepend', {
  impl: PPPosOfPath(() => jb.comps['PPrintTest.multiLineExample'], 'prependPT!~impl~controls', '76,81')
})

component('PPrintTest.multiLine.addPropBegin', {
  impl: PPPosOfPath(() => jb.comps['PPrintTest.multiLineExample'], 'addProp!~impl', '76,76')
})

component('PPrintTest.multiLine.addPropEnd', {
  impl: PPPosOfPath(() => jb.comps['PPrintTest.multiLineExample'], 'addProp!~impl', '198,199')
})

component('PPrintTest.remark.pipeline', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(pipeline(Var('x',1), 'a' , {remark: 'hello'}),{singleLine: true}),
      log('test'),
      '%text%'
    ),
    expectedResult: equals(`pipeline(Var('x', 1), 'a', { remark: 'hello' })`)
  })
})

component('PPrintTest.Positions.closeArray', {
  impl: PPPosOfPath({
    profile: () => text('hey', { features: [css.color('green'), css.color('green')] }),
    path: 'end!~features',
    expectedPos: '65,65'
  })
})

component('test.foldFunction', {
  impl: pipeline(
    () => jb.utils.prettyPrintWithPositions(frontEnd.var('itemPropsProfile', ({ }, { $model }) => 
      $model.itemProps.profile)),
    '%text%'
  )
})

component('PPrintTest.posOfFoldFunctionBug', {
  impl: dataTest(() => jb.tgpTextEditor.getPosOfPath('test.foldFunction~impl~items~1'), equals('%line%', 4))
})

component('PPrintTest.singleFunc', {
  impl: PPPosOfPath(() => frontEnd.init(({ }, { }) => 5), 'function!~action', '14,29')
})

component('PPrintTest.primitiveArray', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintWithPositions(list(1, 2, 3, 4)),
    expectedResult: equals('%text%', 'list(1,2,3,4)')
  })
})

component('PPrintTest.byValue.cutTailingUndefinedArgs', {
  impl: dataTest(() => jb.utils.prettyPrint(css.boxShadow({ inset: false })), notContains('undefined'))
})

component('PPrintTest.async', {
  impl: dataTest(() => jb.utils.prettyPrint({ async a() { 3 } }), and(not(contains('a:')), contains('async a() { 3 }')))
})

component('PPrintTest.asIs', {
  impl: dataTest(() => jb.utils.prettyPrint(asIs({remoteRun: { $: 'runCtx' }})), contains('$:'))
})

component('PPrintTest.asyncInProfile', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint(dataTest(async () => { 5 })),
    expectedResult: and(not(contains('a:')), contains('async () => { 5 }'))
  })
})

component('PPrintTest.funcDefaults', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint({ aB(c, { b } = {}) { 3 } }),
    expectedResult: and(not(contains('aB:')), contains('aB(c, { b } = {}) { 3 }')),
    runBefore: runActionOnItems(list(1,2,3), delay(), 'index')
  })
})

component('PPrintTest.typeAdapter.from', {
  impl: dataTest({
    calculate: prettyPrint(() => typeAdapter('state<location>', israel()), true),
    expectedResult: equals(`typeAdapter('state<location>', israel())`)
  })
})

component('PPrintTest.typeAdapter.to', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})
