
using('ui,remote-widget,parsing,testing')

// component('macroTest.simple', {
//   impl: dataTest(prettyPrint(ctx => jb.comps['dataTest.obj'].impl), contains(["prop('a', 1)", ctx => "res: '%%'"]))
// })

component('macroTest.vars', {
  impl: dataTest(ctx => {
    try {
      const testToTest = 'dataTest.varsCases'
      const compTxt = jb.utils.prettyPrintComp(testToTest.replace(/varsCases/, 'varsCases2'), jb.comps[testToTest])
      eval(compTxt)
      return ctx.run(dataTest.asArrayBug()) // checks for error
        .then(({ success }) => success && compTxt)
    } catch (e) {
      return false
    }
  }, contains("[\n      Var('items', [{id: 1}, {id: 2}])\n    ]"))
})

component('macroTest.varsPath', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(split({ vars: [Var('a', 'b')] })),
      log('test'),
      '%map/~$vars~0~val~!value%',
      join()
    ),
    equals('1,18,1,21')
  )
})

component('macroTest.remark.pipeline', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(pipeline(Var('x',1), remark('r'), 'a'),{forceFlat: true}),
      log('test'),
      '%text%'
    ),
    equals("pipeline(remark('r'), Var('x', 1), 'a')")
  )
})

component('macroTest.Positions.shouldNotFlat', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({ title: '2.0', controls: text('my label') })),
      log('test'),
      '%map/~controls~text~!value%',
      join()
    ),
    equals('2,17,2,27')
  )
})

component('macroTest.Positions.closeArray', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({ controls: [text('my label'), text('my label')] }), { colWidth: 30 }),
      '%map/~controls~!close-array%',
      join()
    ),
    equals('3,20,4,2')
  )
})


component('macroTest.Positions.separator', {
  impl: dataTest(
    pipeline(() => jb.utils.prettyPrintWithPositions({ a: 1, b: 2 }), log('test'), '%map/~!obj-separator-0%', join()),
    equals('1,6,2,2')
  )
})

component('macroTest.Positions.InnerFlat', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
    group({
      title: 'main',
      controls: [
        group({ title: '2.0', controls: text('my label') }),
        text('1.00')
      ]
    })
  ), '%map/~controls~0~controls~text~!value%', join()), equals('3,40,3,50'))
})


component('macroTest.nameValuePattern', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(frontEnd.var('itemPropsProfile', ({ }, { $model }) =>
        $model.itemProps.profile)),
      '%map/~value~!value%',
      join()
    ),
    equals('0,33,1,32')
  )
})

component('macroTest.singleFunc', {
  impl: dataTest(
    pipeline(() => jb.utils.prettyPrintWithPositions(frontEnd.init(({ }, { }) => 5)), '%map/~action~!value%', join()),
    equals('0,14,0,29')
  )
})

component('macroTest.PathInPipeline', {
  impl: dataTest(
    pipeline(() => jb.utils.prettyPrintWithPositions(pipeline('main')), '%map/~items~0~!value%', join()),
    equals('0,9,0,15')
  )
})

component('macroTest.Array', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
    group({ controls: [] })
  ), '%map/~controls~!value[0]%'), equals(1))
})

component('macroTest.primitiveArray', {
  impl: dataTest(() => jb.utils.prettyPrintWithPositions(list(1, 2, 3, 4)), equals('%text%', 'list(1,2,3,4)'))
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
  impl: dataTest(() => jb.utils.prettyPrint(dataTest(async () => { 5 })), and(not(contains('a:')), contains('async () => { 5 }')))
})

component('macroTest.funcDefaults', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint({ aB(c, { b } = {}) { 3 } }),
    expectedResult: and(not(contains('aB:')), contains('aB(c, { b } = {}) { 3 }')),
    runBefore: runActionOnItems(list(1,2,3), delay(), 'index')
  })
})

component('macroTest.typeAdapter.from', {
  impl: dataTest(
    prettyPrint(() => typeAdapter('state<location>', israel()), true),
    equals(
      "typeAdapter('state<location>', israel())"
    )
  )
})

component('macroTest.typeAdapter.to', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})

component('macroTest.mixed.byNameSection', {
  impl: dataTest(
    () => jb.utils.prettyPrint(runActionOnItems(list(1,2,3), delay(), 'index'), { mixed: true, initialPath: 'myProf~impl' }),
    contains('{indexVariable:')
  )
})

// component('macroTest.mixed.load', {
//   impl: dataTest(
//     () => jb.utils.prettyPrint(jb.utils.prettyPrintComp(), { mixed: true, initialPath: 'myProf~impl' }),
//     contains('{indexVariable:')
//   )
// })