jb.component('cmp1', {
  impl: 'noDsl'
})

jb.component('cmp1', {
    type: 'myType<myDsl>',
    impl: 'myDsl'
})

jb.component('cmp1', {
    type: 'myType<myDsl.inner>',
    impl: 'innerDsl'
})

jb.component('testDslClientOutOfDsl', {
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: join({items: list('%$defaultDsl%', '%$myDsl%', '%$innerDsl%')})
})

jb.component('testDslClientInMyDsl', {
  type: 'data<myDsl>',
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: '%$defaultDsl%,%$myDsl%,%$innerDsl%'
})

jb.component('testDslClientInInnerDsl', {
  type: 'data<myDsl.inner>',
  params: [
    {id: 'defaultDsl', type: 'myType'},
    {id: 'myDsl', type: 'myType<myDsl>'},
    {id: 'innerDsl', type: 'myType<myDsl.inner>'}
  ],
  impl: '%$defaultDsl%,%$myDsl%,%$innerDsl%'
})

jb.component('dslTest.sameIdDifferentDsls', {
  impl: dataTest(
    testDslClientOutOfDsl({
      defaultDsl: cmp1(),
      myDsl: cmp1(),
      innerDsl: cmp1()
    }),
    equals('noDsl,myDsl,innerDsl')
  )
})

// default DSL in param type

jb.component('dslTest.defaultDSLInParamType', {
  impl: dataTest(
    testDslClientInMyDsl({
      typeCast: 'data<myDsl>',
      defaultDsl: cmp1(),
      myDsl: cmp1(),
      innerDsl: cmp1()
    }),
    equals('myDsl,myDsl,innerDsl')
  )
})

jb.component('dslTest.defaultInnerDSLInParamType', {
  impl: dataTest(
    testDslClientInInnerDsl({
      typeCast: 'data<myDsl.inner>',
      defaultDsl: cmp1(),
      myDsl: cmp1(),
      innerDsl: cmp1()
    }),
    equals('innerDsl,myDsl,innerDsl')
  )
})

// resolve impl in global profile

jb.component('resolveImpl', {
  type: 'myType<myDsl>',
  impl: cmp1()
})

jb.component('dslTest.resolveImpl', {
  impl: dataTest(
    resolveImpl(typeCast('myType<myDsl>')),
    equals('myDsl')
  )
})

// resolve default values in params

jb.component('resolveDefaultValues', {
  type: 'myType<myDsl>',
  params: [
    {id: 'fullTypeName', type: 'myType<myDsl>', defaultValue: cmp1()},
    {id: 'relativeTypeName', type: 'myType', defaultValue: cmp1()}
  ],
  impl: '%$fullTypeName%,%$relativeTypeName%'
})

jb.component('dslTest.resolveDefaultValues', {
  impl: dataTest(
    resolveDefaultValues(typeCast('myType<myDsl>')),
    equals('myDsl,myDsl')
  )
})

jb.component('cmpAtMyDsl', {
  type: 't<myDsl>',
  params: [ 
    { id: 'x', as: 'string' }],
  impl: 'myDsl%$x%'
})

jb.component('cmpAtInnerDsl', {
  type: 't<myDsl.inner>',
  impl: 'innerDsl'
})

jb.component('testMultiTypes', {
  type: 'data<myDsl.inner>',
  params: [
    {id: 'x1', type: 't<myDsl>,t<myDsl.inner>'},
    {id: 'x2', type: 't<myDsl.inner>,t<myDsl>'},
    {id: 'x3', type: 't<myDsl>,t'},
    {id: 'x4', type: 't,t<myDsl>'},
  ],
  impl: '%$x1%,%$x2%,%$x3%,%$x4%'
})

jb.component('test.helperByName', {
  params: [
    {id: 'x1', type: 'data<myDsl.inner>'}
  ],
  impl: '%$x1%'
})

jb.component('dslTest.multiTypes', {
  impl: dataTest({
    calculate: testMultiTypes({
      typeCast: 'data<myDsl.inner>',
      x1: cmpAtInnerDsl(),
      x2: cmpAtMyDsl(),
      x3: cmpAtInnerDsl(),
      x4: cmpAtMyDsl('50')
    }),
    expectedResult: equals('innerDsl,myDsl,innerDsl,myDsl50')
  })
})

jb.component('dslTest.resolveByName', {
  impl: dataTest(test.helperByName(testMultiTypes({x4:cmpAtMyDsl(20)})), equals(',,,myDsl20'))
})

// macro tests
jb.component('macroTest.dsl.simple', {
  impl: dataTest(
    () => jb.utils.prettyPrintComp('cmpAtMyDsl',jb.utils.getComp('t<myDsl>cmpAtMyDsl')),
    and(contains("type: 't<myDsl>'"), notContains("'$"))
  )
})

jb.component('macroTest.dsl.inherit', {
  impl: dataTest(
    () => jb.utils.prettyPrintComp('israel',jb.utils.getComp('state<location>israel')),
    and(notContains('state<location>'), notContains('$'))
  )
})

jb.component('macroTest.dsl.typeCast', {
  impl: dataTest(
    () => jb.utils.prettyPrintComp('dslTest.multiTypes',jb.utils.getComp('dslTest.multiTypes')),
    and(contains("typeCast: 'data<myDsl.inner>'"), notContains('$'))
  )
})

jb.component('dslTest.inheritTypeFromImp', {
  impl: dataTest(
    pipeline(israel(typeCast('state<location>')),'%capital/name%'),
    equals('Jerusalem')
  )
})

jb.component('dslTest.jbDsl.dslType', {
  impl: dataTest(() => jb.utils.getComp('settlement<location>city')[jb.core.CT].dslType, equals('settlement<location>'))
})

jb.component('dslTest.jbDsl.inheritDslType', {
  impl: dataTest({
    calculate: () => jb.utils.getComp('state<location>israel')[jb.core.CT].dslType,
    expectedResult: equals('state<location>')
  })
})

jb.component('completionTest.dslTest.usingCtrl', {
  impl: tgp.completionOptionsTest(
    "jb.component('x', {\n  impl: uiTest(__TBD())\n})",
    ['location.control']
  )
})

jb.component('completionTest.dslTest.usingCtrl2', {
  impl: tgp.completionOptionsTest(`jb.component('x', {
  impl: uiTest(location.control(__TBD()))
})`, ['israel'])
})

jb.component('completionTest.dslTest.top', {
  impl: tgp.completionOptionsTest({
    compText: `jb.component('x', {
  impl: state(__)
})`,
    expectedSelections: ['capital'],
    dsl: 'location'
  })
})

// jb.component('completionTest.dslTest.nameOverride', {
//   impl: tgp.completionOptionsTest(`jb.component('x', {
//   type: 'state<location>',    
//   impl: state(pipeline(__))
// })`, ['checkNameOverride'])
// })

jb.component('dslTest.jbDsl.usingCtrl', {
  impl: uiTest({control: location.control(israel()), expectedResult: contains('Jerusalem')})
})

jb.component('dslTest.treeShake', {
  impl: dataTest(pipeline(() => jb.treeShake.treeShake(['state<location>israel'],[]), join()), contains('eilat'))
})

jb.component('xxx', {
  type: 'state<location>',
  impl: state()
})

// jb.component('dslTest.setComp', {
//   impl: dataTest({
//     calculate: pipeline(israel(typeCast('state<location>')), '%capital/name%'),
//     expectedResult: equals('nokdim'),
//     //runBefore: tgp.setComp('state<location>israel~impl~capital', 'settlement<location>nokdim')
//   })
// })

// TODO: multi engine tests
