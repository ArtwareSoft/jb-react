jb.component('delayedObj', { /* delayedObj */
  params: [
    {id: 'obj', type: 'data'}
  ],
  impl: (ctx,obj) =>
    jb.delay(1).then(_=>obj)
})

jb.component('person', { watchableData: {
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
}})

jb.component('personWithChildren', { watchableData: {
  name: "Homer Simpson",
  children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ],
  friends: [{ name: 'Barnie' } ],
}})

jb.component('test.getAsBool', { /* test.getAsBool */
  params: [
    {id: 'val', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,val) => val
})

jb.component('data-test.get-ref-value-as-boolean', { /* dataTest.getRefValueAsBoolean */
  impl: dataTest({
    calculate: test.getAsBool('%$person/male%'),
    expectedResult: ({data}) => data === true
  })
})

jb.component('data-test.get-exp-value-as-boolean', { /* dataTest.getExpValueAsBoolean */
  impl: dataTest({
    calculate: test.getAsBool('%$person/name%==Homer Simpson'),
    expectedResult: ({data}) => data === true
  })
})

jb.component('data-test.get-value-via-boolean-type-var', { /* dataTest.getValueViaBooleanTypeVar */
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: test.getAsBool('%$a%'),
    expectedResult: ({data}) => data === false
  })
})

jb.component('data-test.ctx.exp-of-ref-with-boolean-type', { /* dataTest.ctx.expOfRefWithBooleanType */
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: ctx => ctx.exp('%$person/male%','boolean'),
    expectedResult: ({data}) => data === true
  })
})


jb.component('data-test.join', { /* dataTest.join */
  impl: dataTest({
    calculate: pipeline(list(1, 2), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.write-value', { /* dataTest.writeValue */
  impl: dataTest({
    calculate: '%$person/age%',
    runBefore: writeValue('%$person/age%', 20),
    expectedResult: equals('20')
  })
})

jb.component('data-test.write-value-false-bug', { /* dataTest.writeValueFalseBug */
  impl: dataTest({
    calculate: '%$person/male%',
    runBefore: writeValue('%$person/male%', false),
    expectedResult: equals(false)
  })
})

jb.component('data-test.splice-delete', { /* dataTest.spliceDelete */
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1,
      noOfItemsToRemove: 1
    }),
    expectedResult: contains('Bart,Maggie')
  })
})

jb.component('data-test.splice', { /* dataTest.splice */
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1,
      noOfItemsToRemove: 1,
      itemsToAdd: asIs([{name: 'Lisa2'}, {name: 'Maggie2'}])
    }),
    expectedResult: contains('Bart,Lisa2,Maggie2,Maggie')
  })
})


jb.component('data-test.write-value-inner', { /* dataTest.writeValueInner */
  impl: dataTest({
    calculate: '%$person/zz/age%',
    runBefore: writeValue('%$person/zz/age%', 20),
    expectedResult: equals('20')
  })
})

jb.component('data-test.write-value-with-link', { /* dataTest.writeValueWithLink */
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('data-test.write-value-via-link', { /* dataTest.writeValueViaLink */
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$person/linkToBart/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})


jb.component('data-test.write-value-with-array-link', { /* dataTest.writeValueWithArrayLink */
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('data-test.write-value-via-array-link', { /* dataTest.writeValueViaArrayLink */
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$person/childrenLink[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('data-test.runActionOnItems', { /* dataTest.runActionOnItems */
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: runActionOnItems(
      '%$personWithChildren/children%',
      writeValue('%name%', 'a%name%')
    ),
    expectedResult: equals('aBart,aLisa,aMaggie')
  })
})

jb.component('data-test.runActionOnItems-array-ref', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: runActionOnItems(
      '%$personWithChildren/children/name%',
      writeValue('%%', 'a%%')
    ),
    expectedResult: equals('aBart,aLisa,aMaggie')
  })
})

jb.component('data-test.ref-api', { /* dataTest.refApi */
  impl: dataTest({
    calculate: '',
    expectedResult: ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'
  })
})


jb.component('data-test.ref-of-array-item', { /* dataTest.refOfArrayItem */
  impl: dataTest({
    calculate: '',
    expectedResult: ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'
  })
})

jb.component('data-test.exp-with-array', { /* dataTest.expWithArray */
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%',
    expectedResult: equals('Bart')
  })
})

jb.component('data-test.array-length', { /* dataTest.arrayLength */
  impl: dataTest({
    calculate: '%$personWithChildren/children/length%',
    expectedResult: equals(3)
  })
})

jb.component('data-test.string-length', { /* dataTest.stringLength */
  impl: dataTest({
    calculate: '%$personWithChildren/name/length%',
    expectedResult: equals(13)
  })
})

jb.component('data-test.exp-with-array-var', { /* dataTest.expWithArrayVar */
  impl: dataTest({
    vars: [Var('children', '%$personWithChildren/children%')],
    calculate: '%$children[0]/name%',
    expectedResult: equals('Bart')
  })
})

jb.component('data-test.Var', { /* dataTest.Var */
  impl: dataTest({
    calculate: pipeline(
      Var('children', '%$personWithChildren/children%'),
      Var('children2', '%$personWithChildren/children%'),
      remark('hello'),
      '%$children[0]/name% %$children2[1]/name%'
    ),
    expectedResult: equals('Bart Lisa')
  })
})

jb.component('data-test.conditional-text', { /* dataTest.conditionalText */
  impl: dataTest({
    vars: [Var('full', 'full'), Var('empty', '')],
    calculate: '{?%$full% is full?} {?%$empty% is empty?}',
    expectedResult: and(contains('full'), not(contains('is empty')))
  })
})

jb.component('data-test.null-param-pt', { /* dataTest.nullParamPt */
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) =>
    tst1
})


jb.component('data-test.empty-param-as-string', { /* dataTest.emptyParamAsString */
  impl: dataTest({
    calculate: dataTest.nullParamPt(),
    expectedResult: ctx =>
        ctx.data == '' && ctx.data != null
  })
})

jb.component('data-test.wait-for-promise', { /* dataTest.waitForPromise */
  impl: dataTest({
    calculate: ctx => jb.delay(100).then(()=>5),
    expectedResult: equals('5')
  })
})

jb.component('data-test.pipe', { /* dataTest.pipe */
  impl: dataTest({
    calculate: pipe(list(1, 2), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise', { /* dataTest.pipeWithPromise */
  impl: dataTest({
    calculate: pipe(ctx => Promise.resolve([1,2]), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise2', { /* dataTest.pipeWithPromise2 */
  impl: dataTest({
    calculate: pipe(delayedObj(list(1, 2)), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise3', { /* dataTest.pipeWithPromise3 */
  impl: dataTest({
    calculate: pipe(list(delayedObj(1), 2, delayedObj(3)), join({})),
    expectedResult: equals('1,2,3')
  })
})

jb.component('data-test.pipe-with-observable', { /* dataTest.pipeWithObservable */
  impl: dataTest({
    calculate: pipe(ctx => jb.rx.Observable.of([1,2]), '%%a', join({})),
    expectedResult: equals('1a,2a')
  })
})

jb.component('data-test.data-switch', { /* dataTest.dataSwitch */
  impl: dataTest({
    calculate: pipeline(
      5,
      data.switch(
          [data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')]
        )
    ),
    expectedResult: equals('b')
  })
})

jb.component('data-test.data-switch-default', { /* dataTest.dataSwitchDefault */
  impl: dataTest({
    calculate: pipeline(
      7,
      data.switch({
          cases: [data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')],
          default: 'd'
        })
    ),
    expectedResult: equals('d')
  })
})

jb.component('ar-test', { watchableData: { ar: ['0'] }})

jb.component('data-test.restoreArrayIds-bug', { /* dataTest.restoreArrayIdsBug */
  impl: dataTest({
    calculate: '%$ar-test/result%',
    runBefore: ctx => {
      const ar_ref = ctx.run('%$ar-test/ar%',{as: 'ref'});
      const refWithBug = jb.refHandler(ar_ref).refOfPath(['ar-test','ar','0']);
      jb.splice(ar_ref,[[1,0,'1']]);
      const v = jb.val(refWithBug);
      jb.writeValue(ctx.exp('%$ar-test/result%','ref'),v);
   },
    expectedResult: contains('0')
  })
})

jb.component('data-test.assignWithIndex', { /* dataTest.assignWithIndex */
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      assignWithIndex(prop('nameTwice', '%name%-%name%'), prop('index', '%$index%')),
      join({itemText: '%index%.%nameTwice%'})
    ),
    expectedResult: contains('0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie')
  })
})

jb.component('data-test.if', { /* dataTest.if */
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      If(equals('%name%', 'Bart'), 'funny', 'mamy'),
      join({})
    ),
    expectedResult: contains('funny,mamy,mamy')
  })
})

jb.component('data-test.if.filters', { /* dataTest.if.filters */
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      If(equals('%name%', 'Bart'), 'funny'),
      count()
    ),
    expectedResult: equals(1)
  })
})


jb.component('data-test.assign', { /* dataTest.assign */
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      assign(prop('nameTwice', '%name%-%name%')),
      '%nameTwice%',
      join({})
    ),
    expectedResult: contains('Bart-Bart,Lisa-Lisa,Maggie-Maggie')
  })
})

jb.component('data-test.obj', { /* dataTest.obj */
  impl: dataTest({
    calculate: pipeline(
      obj(prop('a', 1), prop('b', 2)),
      '%a%-%b%',
      {'$': 'object', res: '%%'},
      '%res%'
    ),
    expectedResult: contains('1-2')
  })
})

jb.component('data-test.pretty-print-macro', { /* dataTest.prettyPrintMacro */
  impl: dataTest({
    calculate: prettyPrint({profile: () => jb.comps['data-test.obj'].impl, macro: true}),
    expectedResult: contains(["prop('a', 1)", () => "res: '%%'"])
  })
})

jb.component('data-test.as-array-bug', { /* dataTest.asArrayBug */
  impl: dataTest({
    remark: 'should return array',
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: ctx => ctx.exp('%$items/id%','array'),
    expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
  })
})

jb.component('data-test.vars-cases', { /* dataTest.varsCases */
  impl: dataTest({
    remark: 'should return array',
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: pipeline(Var('sep', '-'), remark('hello'), '%$items/id%', '%% %$sep%', join({})),
    expectedResult: equals('1 -,2 -')
  })
})

jb.component('data-test.pretty-print-macro-vars', { /* dataTest.prettyPrintMacroVars */
  impl: dataTest({
    calculate: ctx => { try {
      const testToTest = 'data-test.vars-cases'
      const compTxt = jb.prettyPrintComp(testToTest, jb.comps[testToTest], {macro: true, depth: 1, initialPath: testToTest})
      eval(compTxt)
      return ctx.run(dataTest_asArrayBug())
        .then(({success}) => success)
      } catch(e) {
        return false
      }
    },
    expectedResult: '%%'
  })
})

jb.component('data-test.macro-ns', { /* dataTest.macroNs */
  impl: dataTest({
    calculate: json.stringify(()=>({a:5})),
    expectedResult: contains(['a', '5'])
  })
})

jb.component('data-test.create-new-resource-and-write', { /* dataTest.createNewResourceAndWrite */
  impl: dataTest({
    calculate: '%$zzz/a%',
    runBefore: runActions(
      ctx => jb.component('zzz',{watchableData: {}}),
      writeValue('%$zzz%', () => ({a: 5}))
    ),
    expectedResult: equals(5)
  })
})

jb.component('data-test.non-watchable-ref', { /* dataTest.nonWatchableRef */
  impl: dataTest({
    vars: [Var('constA', () => ({a: 5}))],
    calculate: '%$constA/a%',
    runBefore: writeValue('%$constA/a%', '7'),
    expectedResult: equals(7)
  })
})

jb.component('data-test.inner-of-undefined-var', { /* dataTest.innerOfUndefinedVar */
  impl: dataTest({
    calculate: '%$unknown/a%',
    runBefore: writeValue('%$unknown/a%', '7'),
    expectedResult: ({data}) => data === undefined
  })
})

// jb.component('data-test.http-get', {
//    impl :{$: 'data-test',
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })

jb.component('watchableVar', { watchableData: 'hey' })
jb.component('data-test.string-watchable-var', {
  impl: dataTest({
    runBefore: writeValue('%$watchableVar%', 'foo'),
    calculate: '%$watchableVar%',
    expectedResult: equals('foo')
})})

jb.component('passiveVar', { passiveData: 'hey' })
jb.component('data-test.string-passive-var', {
  impl: dataTest({
    runBefore: writeValue('%$passiveVar%', 'foo'),
    calculate: '%$passiveVar%',
    expectedResult: equals('foo')
})})

jb.component('data-test.forward-macro', {
  impl: dataTest({
    calculate: data.test1({first: 'a', second: 'b'}),
    expectedResult: equals('a-b')
})})

jb.component('data-test.forward-macro-by-value', {
  impl: dataTest({
    calculate: data.test1('a','b'),
    expectedResult: equals('a-b')
})})

jb.component('data.test1', { /* data.test1 */
  params: [
    {id: 'first'},
    {id: 'second'}
  ],
  impl: '%$first%-%$second%'
})

jb.component('data-test.pretty-print-positions', { /* dataTest.prettyPrintPositions */
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(group({title: '2.0', controls: label('my label')})),
      '%map/~controls~title~!value%',
      join({})
    ),
    expectedResult: equals('3,4,3,14')
  })
})

jb.component('data-test.pretty-print-positions-inner-flat', { /* dataTest.prettyPrintPositionsInnerFlat */
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(
      group({
        title: 'main',
        controls: [
          group({title: '2.0', controls: label('my label')}),
          label('1.00')
        ]
      })
      ),
      '%map/~controls~0~controls~title~!value%',
      join({})
    ),
    expectedResult: equals('3,41,3,51')
  })
})

jb.component('data-test.pretty-print-path-in-pipeline', { /* dataTest.prettyPrintPathInPipeline */
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(
        pipeline('main')
      ),
      '%map/~items~0~!value[0]%'
    ),
    expectedResult: equals(1)
  })
})

jb.component('data-test.pretty-print-array', { /* dataTest.prettyPrintArray */
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(
        group({controls:[]})
      ),
      '%map/~controls~!value[0]%'
    ),
    expectedResult: equals(1)
  })
})

jb.component('data-test.pretty-print-$contains', { /* dataTest.prettyPrint-$contains */
  impl: dataTest({
    calculate: pipeline(() => jb.prettyPrintWithPositions(
        {$contains: 'hello'}
      ), '%text%'),
    expectedResult: contains('hello')
  })
})
