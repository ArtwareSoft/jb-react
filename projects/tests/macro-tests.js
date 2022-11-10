jb.component('macroTest.simple', {
  impl: dataTest(prettyPrint(ctx => jb.comps['dataTest.obj'].impl), contains(["prop('a', 1)", ctx => "res: '%%'"]))
})
  
jb.component('macroTest.vars', {
  impl: dataTest(ctx => { try {
        const testToTest = 'dataTest.varsCases'
        const compTxt = jb.utils.prettyPrintComp(testToTest.replace(/varsCases/,'varsCases2'), jb.comps[testToTest])
        eval(compTxt)
        return ctx.run(dataTest.asArrayBug()) // checks for error
          .then(({success}) => success && compTxt)
        } catch(e) {
          return false
        }
      }, contains("vars: [Var('items', [{id: 1}, {id: 2}])]"))
})
  
jb.component('macroTest.Positions.shouldNotFlat', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({title: '2.0', controls: text('my label')})),
      log('test'),
      '%map/~controls~text~!value%',
      join()
    ),
    equals('2,17,2,27')
  )
})
  
jb.component('macroTest.Positions.closeArray', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({controls: [text('my label'), text('my label')]} ), {colWidth: 30} ),
      '%map/~controls~!close-array%',
      join()
    ),
    equals('3,20,4,2')
  )
})
  
  
jb.component('macroTest.Positions.separator', {
  impl: dataTest(
    pipeline(() => jb.utils.prettyPrintWithPositions({a: 1, b: 2}), '%map/~!obj-separator-0%', join()),
    equals('1,6,2,2')
  )
})
  
jb.component('macroTest.Positions.InnerFlat', {
    impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
        group({
          title: 'main',
          controls: [
            group({title: '2.0', controls: text('my label')}),
            text('1.00')
          ]
        })
        ), '%map/~controls~0~controls~text~!value%', join()), equals('2,49,2,59'))
})
  
jb.component('macroTest.PathInPipeline', {
    impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
          pipeline('main')
        ), '%map/~items~0~!value[0]%'), equals(1))
})
  
jb.component('macroTest.Array', {
    impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
          group({controls:[]})
        ), '%map/~controls~!value[0]%'), equals(1))
})
  
jb.component('macroTest.contains', {
    impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions( {$contains: 'hello'}), '%text%'), contains('hello'))
})
  
jb.component('macroTest.byValue.cutTailingUndefinedArgs', {
  impl: dataTest(() => jb.utils.prettyPrint(css.boxShadow({inset: false})), notContains('undefined'))
})
  
jb.component('macroTest.async', {
  impl: dataTest(() => jb.utils.prettyPrint({ async a() {3} }), and(not(contains('a:')), contains('async a() {3}')))
})
  
jb.component('macroTest.asyncInProfile', {
  impl: dataTest(() => jb.utils.prettyPrint(dataTest(async () => {5})), and(not(contains('a:')), contains('async () => {5}')))
})
  
jb.component('macroTest.funcDefaults', {
  impl: dataTest(() => jb.utils.prettyPrint({ aB(c,{b} = {}) {3} }), and(not(contains('aB:')), contains('aB(c,{b} = {}) {3}')))
})
  