component('cmp1', {
  impl: 'noDsl'
})

component('cmp1', {
  type: 'myType<myDsl>',
  impl: 'myDsl'
})

component('cmp1', {
  type: 'myType<myDsl.inner>',
  impl: 'innerDsl'
})

component('testDslClientOutOfDsl', {
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: join({ items: list('%$defaultDsl%','%$myDsl%','%$innerDsl%') })
})

component('testDslClientInMyDsl', {
  type: 'data<myDsl>',
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: '%$defaultDsl%,%$myDsl%,%$innerDsl%'
})

component('testDslClientInInnerDsl', {
  type: 'data<myDsl.inner>',
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: '%$defaultDsl%,%$myDsl%,%$innerDsl%'
})

component('dslTest.sameIdDifferentDsls', {
  impl: dataTest({
    calculate: testDslClientOutOfDsl(cmp1(), cmp1(), { innerDsl: cmp1() }),
    expectedResult: equals('noDsl,myDsl,innerDsl')
  })
})

// default DSL in param type

component('dslTest.defaultDSLInParamType', {
  impl: dataTest({
    calculate: typeAdapter('data<myDsl>', testDslClientInMyDsl(cmp1(), cmp1(), { innerDsl: cmp1() })),
    expectedResult: equals('myDsl,myDsl,innerDsl')
  })
})

component('dslTest.defaultInnerDSLInParamType', {
  impl: dataTest({
    calculate: typeAdapter('data<myDsl.inner>', testDslClientInInnerDsl(cmp1(), cmp1(), { innerDsl: cmp1() })),
    expectedResult: equals('innerDsl,myDsl,innerDsl')
  })
})

// resolve impl in global profile

component('resolveImpl', {
  type: 'myType<myDsl>',
  impl: cmp1()
})

component('dslTest.resolveImpl', {
  impl: dataTest(typeAdapter('myType<myDsl>', resolveImpl()), equals('myDsl'))
})

// resolve default values in params

component('resolveDefaultValues', {
  type: 'myType<myDsl>',
  params: [
    {id: 'fullTypeName', type: 'myType<myDsl>', defaultValue: cmp1()},
    {id: 'relativeTypeName', type: 'myType', defaultValue: cmp1()}
  ],
  impl: '%$fullTypeName%,%$relativeTypeName%'
})

component('dslTest.resolveDefaultValues', {
  impl: dataTest(typeAdapter('myType<myDsl>', resolveDefaultValues()), equals('myDsl,myDsl'))
})

component('cmpAtMyDsl', {
  type: 't<myDsl>',
  params: [
    {id: 'x', as: 'string'}
  ],
  impl: 'myDsl%$x%'
})

component('cmpAtInnerDsl', {
  type: 't<myDsl.inner>',
  impl: 'innerDsl'
})

component('testMultiTypes', {
  type: 'data<myDsl.inner>',
  params: [
    {id: 'x1', type: 't<myDsl>,t<myDsl.inner>'},
    {id: 'x2', type: 't<myDsl.inner>,t<myDsl>'},
    {id: 'x3', type: 't<myDsl>,t'},
    {id: 'x4', type: 't,t<myDsl>'}
  ],
  impl: '%$x1%,%$x2%,%$x3%,%$x4%'
})

component('test.helperByName', {
  params: [
    {id: 'x1', type: 'data<myDsl.inner>'}
  ],
  impl: '%$x1%'
})

component('dslTest.multiTypes', {
  impl: dataTest({
    calculate: typeAdapter('data<myDsl.inner>', testMultiTypes(cmpAtInnerDsl(), cmpAtMyDsl(), { x3: cmpAtInnerDsl(), x4: cmpAtMyDsl('50') })),
    expectedResult: equals('innerDsl,myDsl,innerDsl,myDsl50')
  })
})

component('dslTest.resolveByName', {
  impl: dataTest(test.helperByName(testMultiTypes({ x4: cmpAtMyDsl(20) })), equals(',,,myDsl20'))
})

// macro tests
component('macroTest.dsl.simple', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('cmpAtMyDsl',jb.utils.getComp('t<myDsl>cmpAtMyDsl')),
    expectedResult: and(contains(`type: 't<myDsl>'`), notContains(`'$`))
  })
})

component('macroTest.dsl.inherit', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('israel',jb.utils.getComp('state<location>israel')),
    expectedResult: and(notContains('state<location>'), notContains('$'))
  })
})

component('dslTest.inheritTypeFromImp', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})

component('dslTest.jbDsl.dslType', {
  impl: dataTest({
    calculate: () => jb.utils.getComp('settlement<location>city')[jb.core.CT].dslType,
    expectedResult: equals('settlement<location>')
  })
})

component('dslTest.jbDsl.inheritDslType', {
  impl: dataTest({
    calculate: () => jb.utils.getComp('state<location>israel')[jb.core.CT].dslType,
    expectedResult: equals('state<location>')
  })
})

component('dslTest.treeShake', {
  impl: dataTest(pipeline(() => jb.treeShake.treeShake(['state<location>israel'],[]), join()), contains('eilat'))
})

// more tests at tgp-tests, ui-dsl-tests
