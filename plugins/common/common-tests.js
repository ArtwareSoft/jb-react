using('core-tests')

component('dataTest.join', {
  impl: dataTest(pipeline(list(1,2), join()), equals('1,2'))
})

component('dataTest.runActionOnItems', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join()),
    expectedResult: equals('aBart,aLisa,aMaggie'),
    runBefore: runActionOnItems('%$personWithChildren/children%', writeValue('%name%', 'a%name%'))
  })
})

component('dataTest.pipe', {
  impl: dataTest(pipe(list(1,2), join()), equals('1,2'))
})

component('dataTest.pipeWithPromise', {
  impl: dataTest(pipe(ctx => Promise.resolve([1,2]), join()), equals('1,2'))
})

component('dataTest.pipeInPipe', {
  impl: dataTest(pipe(Var('a', 3), pipe(delay(1), list([1, 2, '%$a%']), join())), equals('1,2,3'))
})

component('dataTest.pipeInPipeWithDelayedVar', {
  impl: dataTest(pipe(Var('a', ctx => Promise.resolve(3)), pipe(delay(1), list([1, 2, '%$a%']), join())), equals('1,2,3'))
})

component('dataTest.pipeWithPromise2', {
  impl: dataTest(pipe(dataTest.delayedObj(list(1, 2)), join()), equals('1,2'))
})

component('dataTest.pipeWithPromise3', {
  impl: dataTest(pipe(list(dataTest.delayedObj(1), 2, dataTest.delayedObj(3)), join()), equals('1,2,3'))
})

component('dataTest.dataSwitch', {
  impl: dataTest(
    pipeline(5, data.switch([data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')])),
    equals('b')
  )
})

component('dataTest.dataSwitchDefault', {
  impl: dataTest(
    pipeline(7, data.switch([data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')], 'd')),
    equals('d')
  )
})

component('dataTest.extendWithIndex', {
  impl: dataTest(
    pipeline(
      '%$personWithChildren/children%',
      extendWithIndex(prop('nameTwice', '%name%-%name%'), prop('index', '%$index%')),
      join({itemText: '%index%.%nameTwice%'})
    ),
    contains('0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie')
  )
})

component('dataTest.if', {
  impl: dataTest(
    pipeline('%$personWithChildren/children%', If(equals('%name%', 'Bart'), 'funny', 'mamy'), join()),
    contains('funny,mamy,mamy')
  )
})

component('dataTest.if.filters', {
  impl: dataTest(pipeline('%$personWithChildren/children%', If(equals('%name%', 'Bart'), 'funny'), count()), equals(1))
})

component('dataTest.pipelineMultiple', {
  impl: dataTest(pipeline(list(1, 2), join()), '1,2')
})

component('dataTest.assign', {
  impl: dataTest(
    pipeline('%$personWithChildren/children%', assign(prop('nameTwice', '%name%-%name%')), '%nameTwice%', join()),
    contains('Bart-Bart,Lisa-Lisa,Maggie-Maggie')
  )
})

component('dataTest.obj', {
  impl: dataTest(pipeline(obj(prop('a', 1), prop('b', 2)), '%a%-%b%', '\n%%\n', {'$': 'object', res: '%%'}, '%res%'), contains('1-2'))
})

component('dataTest.evalExpression', {
  impl: dataTest(evalExpression('1+1'), equals(2))
})

component('dataTest.firstSucceeding', {
  impl: dataTest(firstSucceeding(evalExpression('1/0'), 2, 1), equals(2))
})

component('dataTest.firstSucceeding.withEmptyString', {
  impl: dataTest(firstSucceeding('', 'a', 'b'), equals('a'))
})

component('dataTest.unique', {
  impl: dataTest(pipeline('%$people%', unique('%male%'), count()), equals(2))
})

