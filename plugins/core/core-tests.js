component('coreTest.datum', {
  impl: dataTest(pipeline(Var('datum', 'hello'), '%%'), equals('hello'))
})

component('coreTest.datum2', {
  impl: dataTest(pipeline('%%', { data: 'hello' }), equals('hello'))
})

component('coreTest.propertyPassive', {
  impl: dataTest(property('name', obj(prop('name', 'homer'))), equals('homer'))
})

component('test.withDefaultValueComp', {
  params: [
    {id: 'val', defaultValue: pipeline('5')}
  ],
  impl: '%$val%'
})
component('coreTest.DefaultValueComp', {
  impl: dataTest(test.withDefaultValueComp(), equals(5))
})

component('test.getAsBool', {
  params: [
    {id: 'val', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,val) => val
})

component('coreTest.getRefValueAsBoolean', {
  impl: dataTest(test.getAsBool('%$person/male%'), ({data}) => data === true)
})

component('coreTest.getExpValueAsBoolean', {
  impl: dataTest(test.getAsBool('%$person/name%==Homer Simpson'), ({data}) => data === true)
})

component('coreTest.getValueViaBooleanTypeVar', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: test.getAsBool('%$a%'),
    expectedResult: ({data}) => data === false
  })
})

component('coreTest.ctx.expOfRefWithBooleanType', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: ctx => ctx.exp('%$person/male%','boolean'),
    expectedResult: ({data}) => data === true
  })
})

component('coreTest.nullParamPt', {
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) => tst1
})
component('coreTest.emptyParamAsString', {
  impl: dataTest(coreTest.nullParamPt(), ctx => ctx.data == '' && ctx.data != null)
})

component('coreTest.asArrayBug', {
  impl: dataTest({
    vars: [
      Var('items', [{id: 1}, {id: 2}])
    ],
    calculate: ctx =>                                                                                                                                                                                                
      ctx.exp('%$items/id%','array'),
    expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
  })
})

component('coreTest.varsCases', {
  impl: dataTest({
    vars: [
      Var('items', [{id: 1}, {id: 2}])
    ],
    calculate: pipeline(Var('sep', '-'), '%$items/id%', '%% %$sep%', join()),
    expectedResult: equals('1 -,2 -')
  })
})
