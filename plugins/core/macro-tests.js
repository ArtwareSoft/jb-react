
using('ui,remote-widget,parsing,testing')

// component('macroTest.simple', {
//   impl: dataTest(prettyPrint(ctx => jb.comps['dataTest.obj'].impl), contains(["prop('a', 1)", ctx => "res: '%%'"]))
// })

component('macroTest.vars', {
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

component('macroTest.varsPath', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(split(Var('a', 'b'))),
      log('test'),
      '%map/~$vars~0~val~!value%',
      join()
    ),
    expectedResult: equals('1,18,1,21')
  })
})

component('macroTest.remark.pipeline', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(pipeline(Var('x',1), 'a' , {remark: 'hello'}),{singleLine: true}),
      log('test'),
      '%text%'
    ),
    expectedResult: equals(`pipeline(Var('x', 1), 'a', { remark: 'hello' })`)
  })
})

component('macroTest.Positions.shouldNotFlat', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(group({ title: '2.0', controls: text('my label') })),
      '%map/~controls~text~!value%',
      join()
    ),
    expectedResult: equals('2,17,2,27')
  })
})

component('macroTest.Positions.closeArray', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(group({ controls: [text('my label'), text('my label')] }), { colWidth: 30 }),
      '%map/~controls~!close-array%',
      join()
    ),
    expectedResult: equals('3,20,4,2')
  })
})


component('macroTest.Positions.separator', {
  impl: dataTest({
    calculate: pipeline(() => jb.utils.prettyPrintWithPositions({ a: 1, b: 2 }), log('test'), '%map/~!obj-separator-0%', join()),
    expectedResult: equals('1,6,2,2')
  })
})

component('macroTest.Positions.InnerFlat', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(
    group({
      title: 'main',
      controls: [
        group({ title: '2.0', controls: text('my label') }),
        text('1.00')
      ]
    })
  ),
      '%map/~controls~0~controls~text~!value%',
      join()
    ),
    expectedResult: equals('3,41,3,51')
  })
})


component('macroTest.nameValuePattern', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(frontEnd.var('itemPropsProfile', ({ }, { $model }) =>
        $model.itemProps.profile)),
      '%map/~value~!value%',
      join()
    ),
    expectedResult: equals('0,33,1,32')
  })
})

component('macroTest.singleFunc', {
  impl: dataTest({
    calculate: pipeline(() => jb.utils.prettyPrintWithPositions(frontEnd.init(({ }, { }) => 5)), '%map/~action~!value%', join()),
    expectedResult: equals('0,14,0,29')
  })
})

component('macroTest.PathInPipeline', {
  impl: dataTest({
    calculate: pipeline(() => jb.utils.prettyPrintWithPositions(pipeline('main')), '%map/~items~0~!value%', join()),
    expectedResult: equals('0,9,0,15')
  })
})

component('macroTest.Array', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(
    group({ controls: [] })
  ),
      '%map/~controls~!value[0]%'
    ),
    expectedResult: equals(1)
  })
})

component('macroTest.primitiveArray', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintWithPositions(list(1, 2, 3, 4)),
    expectedResult: equals('%text%', 'list(1,2,3,4)')
  })
})

component('macroTest.contains', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions({ $contains: 'hello' }), '%text%'), contains('hello'))
})

component('macroTest.byValue.cutTailingUndefinedArgs', {
  impl: dataTest(() => jb.utils.prettyPrint(css.boxShadow({ inset: false })), notContains('undefined'))
})

component('macroTest.async', {
  impl: dataTest(() => jb.utils.prettyPrint({ async a() { 3 } }), and(not(contains('a:')), contains('async a() { 3 }')))
})

component('macroTest.asyncInProfile', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint(dataTest(async () => { 5 })),
    expectedResult: and(not(contains('a:')), contains('async () => { 5 }'))
  })
})

component('macroTest.funcDefaults', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint({ aB(c, { b } = {}) { 3 } }),
    expectedResult: and(not(contains('aB:')), contains('aB(c, { b } = {}) { 3 }')),
    runBefore: runActionOnItems(list(1,2,3), delay(), 'index')
  })
})

component('macroTest.typeAdapter.from', {
  impl: dataTest({
    calculate: prettyPrint(() => typeAdapter('state<location>', israel()), true),
    expectedResult: equals(`typeAdapter('state<location>', israel())`)
  })
})

component('macroTest.typeAdapter.to', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})
