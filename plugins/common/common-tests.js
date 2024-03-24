using('core-tests')

component('commonTest.json.stringify', {
  impl: dataTest(json.stringify(()=>({a:5})), equals('{"a":5}'))
})

component('commonTest.join', {
  impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2'))
})

component('commonTest.data', {
  impl: dataTest(join({ data: list(1,2) }), equals('1,2'))
})

component('commonTest.listWithVar', {
  impl: dataTest(pipeline(Var('a', 1), list('%$a%',2), join()), equals('1,2'))
})

component('commonTest.slice', {
  impl: dataTest(pipeline(list(1,2,3), slice(0, 2), join()), equals('1,2'))
})

component('commonTest.disabled', {
  impl: dataTest(pipeline(list(1,2,3), slice(0, 2, { $disabled: true }), join()), equals('1,2,3'))
})

component('commonTest.varInPipeline', {
  impl: dataTest(pipeline(Var('a', '33'), '%$a%'), equals('33'))
})

component('commonTest.filter', {
  impl: dataTest(pipeline('%$personWithChildren/children/name%', filter(contains('i')), join()), equals('Lisa,Maggie'))
})

component('commonTest.toUpperCase', {
  impl: dataTest(pipeline('%$personWithChildren/children%', '%name%', toUpperCase(), join()), equals('BART,LISA,MAGGIE'))
})

component('commonTest.split', {
  impl: dataTest(pipeline('1,2', split(',', { part: 'last' })), equals('2'))
})

component('commonTest.splitAllFeatures', {
  impl: dataTest({
    calculate: obj({
      data: 'one-two-three-four',
      props: [
        prop('original', '%%'),
        prop('splitAll', pipeline(split('-'), join(','))),
        prop('splitFirst', split('-', { part: 'first' })),
        prop('splitSecond', split('-', { part: 'second' })),
        prop('splitLast', split('-', { part: 'last' })),
        prop('splitButFirst', pipeline(split('-', { part: 'but first' }), join(','))),
        prop('splitButLast', pipeline(split('-', { part: 'but last' }), join(',')))
      ]
    }),
    expectedResult: equals(
      obj(
        prop('original', 'one-two-three-four'),
        prop('splitAll', 'one,two,three,four'),
        prop('splitFirst', 'one'),
        prop('splitSecond', 'two'),
        prop('splitLast', 'four'),
        prop('splitButFirst', 'two,three,four'),
        prop('splitButLast', 'one,two,three')
      )
    )
  })
})

component('commonTest.pipe', {
  impl: dataTest(pipe(list(1,2), join()), equals('1,2'))
})

component('commonTest.pipeWithPromise', {
  impl: dataTest(pipe(delay(1), list(1,2), join()), equals('1,2'))
})

component('commonTest.pipeInPipe', {
  impl: dataTest(pipe(Var('a', 3), pipe(delay(1), list([1,2,'%$a%']), join())), equals('1,2,3'))
})

component('commonTest.delayedVar', {
  impl: dataTest(pipe(Var('a', delay(1, 3)), '%$a%'), equals('3'))
})

component('commonTest.pipeInPipeWithDelayedVar', {
  impl: dataTest({
    calculate: pipe(Var('a', delay(1, 3)), pipe(delay(1), list([1,2,'%$a%']), join())),
    expectedResult: equals('1,2,3')
  })
})

component('commonTest.pipeWithPromise2', {
  impl: dataTest(pipe(delay(1, list(1,2)), join()), equals('1,2'))
})

component('commonTest.pipeWithPromise3', {
  impl: dataTest(pipe(list(delay(1, 1), 2, delay(1,3)), join()), equals('1,2,3'))
})

component('commonTest.dataSwitchDefault', {
  impl: dataTest({
    calculate: pipeline(
      list(4,5,7),
      Switch(Case(equals(4), 'a'), Case(equals(5), 'b'), Case(equals(6), 'c'), {
        default: 'd'
      }),
      join()
    ),
    expectedResult: equals('a,b,d')
  })
})

component('commonTest.extendWithIndex', {
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      extendWithIndex(prop('nameTwice', '%name%-%name%'), prop('index', '%$index%')),
      join('\n', { prefix: '# The kids\n', suffix: '\n--', itemText: '%index%. %nameTwice%' })
    ),
    expectedResult: equals('# The kids\n0. Bart-Bart\n1. Lisa-Lisa\n2. Maggie-Maggie\n--')
  })
})

component('commonTest.if', {
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      If(equals('%name%', 'Bart'), 'funny', 'mamy'),
      join()
    ),
    expectedResult: equals('funny,mamy,mamy')
  })
})

component('commonTest.if.filters', {
  impl: dataTest(pipeline('%$personWithChildren/children%', If(equals('%name%', 'Bart'), 'funny'), count()), equals(1))
})

component('commonTest.assign', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children%', assign(prop('nameTwice', '%name%-%name%')), '%nameTwice%', join()),
    expectedResult: contains('Bart-Bart,Lisa-Lisa,Maggie-Maggie')
  })
})

component('commonTest.obj', {
  impl: dataTest(pipeline(obj(prop('a', 1), prop('b', 2)), '%a%-%b%'), equals('1-2'))
})

component('commonTest.jbartExpression.select', {
  impl: dataTest(pipeline('%$people/0/name%'), contains('Homer'))
})

component('commonTest.jbartExpression.boolean', {
  impl: dataTest(pipeline('%$people%', filter('%age%==42'), '%name%'), contains('Homer'))
})

component('commonTest.evalExpression', {
  impl: dataTest(evalExpression('1+1'), equals(2))
})

component('commonTest.firstSucceeding', {
  impl: dataTest(firstSucceeding(evalExpression('1/0'), 2, 1), equals(2))
})

component('commonTest.firstSucceeding.withEmptyString', {
  impl: dataTest(firstSucceeding('','a','b'), equals('a'))
})

component('commonTest.unique', {
  impl: dataTest(pipeline('%$people%', unique('%male%'), count()), equals(2))
})

component('convertGradeToDescription', {
  params: [
    {id: 'grade', as: 'number', mandatory: true, defaultValue: '%%'}
  ],
  impl: pipeline(
    '%$grade%',
    Switch({
      cases: [
        Case(range(1, 60), 'Fail'),
        Case(range(60, 70), 'Pass'),
        Case(range(70, 80), 'Good'),
        Case(range(80, 90), 'Very Good'),
        Case(range(90, 101), 'Excellent')
      ],
      default: 'Invalid grade'
    })
  )
})

component('commonTest.convertGradeToDescription', {
  impl: dataTest({
    calculate: pipeline(list(95,85,72,65,55,-5), convertGradeToDescription('%%'), join()),
    expectedResult: equals('Excellent,Very Good,Good,Pass,Fail,Invalid grade')
  })
})

component('commonTest.runActionOnItems', {
  impl: dataTest(pipeline('%$personWithChildren/children/name%', join()), equals('aBart,aLisa,aMaggie'), {
    runBefore: runActionOnItems('%$personWithChildren/children%', writeValue('%name%', 'a%name%'))
  })
})

component('commonTest.objFromVars', {
  impl: dataTest(pipeline(Var('a', 3), Var('b', 5), objFromVars('a','b'), '%a%,%b%'), equals('3,5'))
})
