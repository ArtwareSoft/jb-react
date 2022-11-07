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
jb.type('myType2<myDsl.inner>', { includes: 'myType2<myDsl>'})

jb.component('cmpAtMyDsl', {
  type: 'myType2<myDsl>',
  impl: 'myDsl'
})

jb.component('cmpAtInnerDsl', {
  type: 'myType2<myDsl.inner>',
  impl: 'innerDsl'
})

jb.component('testType2InInnerDsl', {
  type: 'data<myDsl.inner>',
  params: [
    {id: 'myDsl', type: 'myType2<myDsl>'},
    {id: 'innerDsl', type: 'myType2<myDsl.inner>'}
  ],
  impl: '%$myDsl%,%$innerDsl%'
})

jb.component('dslTest.typeIncludes', {
  impl: dataTest(
    testType2InInnerDsl({
      typeCast: 'data<myDsl.inner>',
      myDsl: cmpAtMyDsl(),
      innerDsl: cmpAtMyDsl()
    }),
    equals('myDsl,myDsl')
  )
})

// multiple engine tests


// completion tests

// jb.component('dslTest.basicType', {
//   impl: tgp.completionOptionsTest({
//     compText: "jb.component('x', {\n  impl: uiTest(text(pipeline(__)))\n})",
//     expectedSelections:['split']
//  })
// })