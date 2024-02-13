
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

component('PPrintTest.prependInGroup', {
  impl: PPPosOfPath(() => group(text(''),text('')), 'prependPT!~controls', '6,11')
})

component('PPrintTest.prependSingleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'prependPT!~controls', '6,11')
})

component('PPrintTest.singleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'begin!~controls~text', '11,11')
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
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(text('hello world', { features: [ css.color('green'), css.color('green'), css.color('green') ] }), { colWidth: 30 }),
      '%actionMap%',
      filter(contains('end!~features', { allText: '%action%' })),
      '%from%'
    ),
    expectedResult: equals('109')
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
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(frontEnd.init(({ }, { }) => 5)),
      '%actionMap%',
      filter(contains('function!~action', { allText: '%action%' }))
    ),
    expectedResult: equals('%from%', 14)
  })
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
