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

// type includes tests
//jb.type('myType2<myDsl.inner>', { includes: 'myType2<myDsl>'})

jb.component('cmpAtMyDsl', {
  type: 't<myDsl>',
  impl: 'myDsl'
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

jb.component('dslTest.multiTypes', {
  impl: dataTest(
    testMultiTypes({
      typeCast: 'data<myDsl.inner>',
      x1: cmpAtInnerDsl(),
      x2: cmpAtMyDsl(),
      x3: cmpAtInnerDsl(),
      x4: cmpAtMyDsl(),
    }),
    equals('innerDsl,myDsl,innerDsl,myDsl')
  )
})

// inherit type from imp

jb.component('inheritTypeFromImp', {
  impl: cmpAtMyDsl()
})

jb.component('dslTest.inheritTypeFromImp', {
  impl: dataTest(
    inheritTypeFromImp(typeCast('t<myDsl>')),
    equals('myDsl')
  )
})

// multiple engine tests

// macro test

jb.component('macroTest.dsl.simple', {
  impl: dataTest(
    () => jb.utils.prettyPrintComp('cmpAtMyDsl',jb.utils.getComp('t<myDsl>cmpAtMyDsl')),
    and(contains("type: 't<myDsl>'"), notContains('$'))
  )
})

jb.component('macroTest.dsl.inherit', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('inheritTypeFromImp',jb.utils.getComp('t<myDsl>inheritTypeFromImp')),
    expectedResult: and(notContains('t<myDsl>'), notContains('$')),
    allowError: true
  })
})


// completion tests

jb.component('dslTest.basicType', {
  impl: tgp.completionOptionsTest(`jb.component('x', {
  impl: dataTest(text(pipeline(__)))
})`, ['split'])
})