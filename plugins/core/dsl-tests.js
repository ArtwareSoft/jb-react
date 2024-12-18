component('cmp1', {
  impl: 'noDsl-DataType'
})

component('cmp1', {
  type: 'myType',
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
  type: 'data<>',
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
    expectedResult: equals('noDsl,myDsl,innerDsl')
  })
})

component('dslTest.defaultInnerDSLInParamType', {
  impl: dataTest({
    calculate: typeAdapter('data<myDsl.inner>', testDslClientInInnerDsl(cmp1(), cmp1(), { innerDsl: cmp1() })),
    expectedResult: equals('noDsl,myDsl,innerDsl')
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
  impl: dataTest(typeAdapter('myType<myDsl>', resolveDefaultValues()), equals('myDsl,noDsl'))
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
    {id: 'x1', type: 't<myDsl>', moreTypes: 't<myDsl.inner>'},
    {id: 'x2', type: 't<myDsl.inner>', moreTypes: 't<myDsl>'},
    {id: 'x3', type: 't<myDsl>', moreTypes: 't<>'},
    {id: 'x4', type: 't', moreTypes: 't<myDsl>'}
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
    calculate: typeAdapter('data<myDsl.inner>', testMultiTypes(cmpAtInnerDsl(), cmpAtMyDsl(), { x3: cmpAtMyDsl(), x4: cmpAtMyDsl('50') })),
    expectedResult: equals('innerDsl,myDsl,myDsl,myDsl50')
  })
})

component('dslTest.resolveByName', {
  impl: dataTest(test.helperByName(testMultiTypes({ x4: cmpAtMyDsl(20) })), equals(',,,myDsl20'))
})

// macro tests
component('macroTest.dsl.simple', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('cmpAtMyDsl',jb.comps['t<myDsl>cmpAtMyDsl']),
    expectedResult: and(contains(`type: 't<myDsl>'`), notContains(`'$`))
  })
})

component('macroTest.dsl.inherit', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('israel',jb.comps['state<location>israel']),
    expectedResult: and(notContains('state<location>'), notContains('$'))
  })
})

component('dslTest.inheritTypeFromImp', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})

component('dslTest.jbDsl.dslType', {
  impl: dataTest({
    calculate: () => jb.comps['settlement<location>city'].$type,
    expectedResult: equals('settlement<location>')
  })
})

component('dslTest.jbDsl.inheritDslType', {
  impl: dataTest({
    calculate: () => jb.comps['state<location>israel'].$type,
    expectedResult: equals('state<location>')
  })
})

component('dslTest.treeShake', {
  impl: dataTest(pipeline(() => jb.treeShake.treeShake(['state<location>israel'],[]), join()), contains('eilat'))
})

// more tests at tgp-tests, ui-dsl-tests
