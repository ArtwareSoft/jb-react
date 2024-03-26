component('expTest.select', {
  impl: dataTest({
    calculate: pipeline('%$peopleWithChildren%', pipeline(Var('parent'), '%children%', '%name% is child of %$parent/name%'), join()),
    expectedResult: equals(
      'Bart is child of Homer,Lisa is child of Homer,Bart is child of Marge,Lisa is child of Marge'
    )
  })
})

component('expTest.boolean', {
  impl: dataTest(pipeline('%$people%', filter('%age%==42'), '%name%'), contains('Homer'))
})

component('expTest.dynamicExp', {
  impl: dataTest(pipeline('name','%$people/{%%}%'), contains('Homer'))
})

component('expTest.expWithArray', {
  impl: dataTest('%$personWithChildren/children[0]/name%', equals('Bart'))
})

component('expTest.arrayLength', {
  impl: dataTest('%$personWithChildren/children/length%', equals(3))
})

component('expTest.stringLength', {
  impl: dataTest('%$personWithChildren/name/length%', equals(13))
})

component('expTest.activateMethod', {
  impl: dataTest({
    vars: [
      Var('o1', () => ({ f1: () => ({a:5}) }))
    ],
    calculate: '%$o1/f1()/a%',
    expectedResult: equals(5)
  })
})

component('expTest.conditionalText', {
  impl: dataTest({
    vars: [
      Var('full', 'full'),
      Var('empty', '')
    ],
    calculate: '{?%$full% is full?}{?%$empty% is empty?}',
    expectedResult: equals('full is full')
  })
})

component('expTest.expWithArrayVar', {
  impl: dataTest({
    vars: [
      Var('children', '%$personWithChildren/children%')
    ],
    calculate: '%$children[0]/name%',
    expectedResult: equals('Bart')
  })
})