jb.component('delayedObj', {
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

jb.component('peopleWithChildren', { watchableData: [
  {
    name: 'Homer',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  },
  {
    name: 'Marge',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  }
]
})

jb.component('stringArray', { watchableData: ['a','b','c']})
jb.component('stringTree', { watchableData: { node1: ['a','b','c'], node2: ['1','2','3']}})


jb.component('test.getAsBool', {
  params: [
    {id: 'val', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,val) => val
})

jb.component('test.withDefaultValueComp', {
  params: [
    {id: 'val', defaultValue: pipeline('5')}
  ],
  impl: '%$val%'
})

jb.component('dataTest.getRefValueAsBoolean', {
  impl: dataTest({
    calculate: test.getAsBool('%$person/male%'),
    expectedResult: ({data}) => data === true
  })
})

jb.component('dataTest.propertyWatchable', {
  impl: dataTest({
    calculate: property('name', '%$person%'),
    expectedResult: equals('Homer Simpson')
  })
})

jb.component('dataTest.pipelineVar', {
  impl: dataTest({
    calculate: pipeline(
      '%$peopleWithChildren%',
      pipeline(Var('parent'), '%children%', '%name% is child of %$parent/name%'),
      join({})
    ),
    expectedResult: equals(
      'Bart is child of Homer,Lisa is child of Homer,Bart is child of Marge,Lisa is child of Marge'
    )
  })
})

jb.component('dataTest.propertyPassive', {
  impl: dataTest({
    vars: [Var('person', obj(prop('name', 'homer')))],
    calculate: property('name', '%$person%'),
    expectedResult: equals('homer')
  })
})

jb.component('dataTest.getExpValueAsBoolean', {
  impl: dataTest({
    calculate: test.getAsBool('%$person/name%==Homer Simpson'),
    expectedResult: ({data}) => data === true
  })
})

jb.component('dataTest.getValueViaBooleanTypeVar', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: test.getAsBool('%$a%'),
    expectedResult: ({data}) => data === false
  })
})

jb.component('dataTest.ctx.expOfRefWithBooleanType', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: ctx => ctx.exp('%$person/male%','boolean'),
    expectedResult: ({data}) => data === true
  })
})


jb.component('dataTest.join', {
  impl: dataTest({
    calculate: pipeline(list(1, 2), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('dataTest.writeValue', {
  impl: dataTest({
    calculate: '%$person/age%',
    runBefore: writeValue('%$person/age%', 20),
    expectedResult: equals('20')
  })
})

jb.component('dataTest.writeValueFalseBug', {
  impl: dataTest({
    calculate: '%$person/male%',
    runBefore: writeValue('%$person/male%', false),
    expectedResult: equals(false)
  })
})

jb.component('dataTest.spliceDelete', {
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

jb.component('dataTest.splice', {
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

jb.component('dataTest.writeValueInner', {
  impl: dataTest({
    calculate: '%$person/zz/age%',
    runBefore: writeValue('%$person/zz/age%', 20),
    expectedResult: equals('20')
  })
})

jb.component('dataTest.writeValueWithLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('dataTest.writeValueViaLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$person/linkToBart/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})


jb.component('dataTest.writeValueWithArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('dataTest.writeValueViaArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$person/childrenLink[0]/name%', 'Barty1')
    ),
    expectedResult: equals('Barty1,Barty1')
  })
})

jb.component('dataTest.runActionOnItems', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: runActionOnItems(
      '%$personWithChildren/children%',
      writeValue('%name%', 'a%name%')
    ),
    expectedResult: equals('aBart,aLisa,aMaggie')
  })
})

jb.component('dataTest.runActionOnItemsArrayRef', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join({})),
    runBefore: runActionOnItems('%$personWithChildren/children/name%', writeValue('%%', 'a%%')),
    expectedResult: equals('aBart,aLisa,aMaggie')
  })
})

jb.component('dataTest.refApi', {
  impl: dataTest({
    calculate: '',
    expectedResult: ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'
  })
})


jb.component('dataTest.refOfArrayItem', {
  impl: dataTest({
    calculate: '',
    expectedResult: ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'
  })
})

jb.component('dataTest.refOfStringArrayItemSplice', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      ctx.run(splice({array: '%$stringArray%', fromIndex: 0, noOfItemsToRemove: 1}))
      refs.valAfter = jb.val(refs.refOfc)
    },
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%')
  })
})

jb.component('dataTest.refOfStringArrayItemMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringArray[1]%','ref')
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      jb.move(refs.refOfc, refs.refOfb, ctx)
      refs.valAfter = jb.val(refs.refOfc)
    },
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%')
  })
})

jb.component('dataTest.refOfStringTreeMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringTree/node1[1]%','ref')
      refs.refOf2 = ctx.exp('%$stringTree/node2[2]%','ref')
      refs.valBefore = jb.val(refs.refOfb)
      jb.move(refs.refOfb, refs.refOf2, ctx)
      refs.valAfter = jb.val(refs.refOfb)
    },
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%')
  })
})

jb.component('dataTest.expWithArray', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%',
    expectedResult: equals('Bart')
  })
})

jb.component('dataTest.arrayLength', {
  impl: dataTest({
    calculate: '%$personWithChildren/children/length%',
    expectedResult: equals(3)
  })
})

jb.component('dataTest.stringLength', {
  impl: dataTest({
    calculate: '%$personWithChildren/name/length%',
    expectedResult: equals(13)
  })
})

jb.component('dataTest.expWithArrayVar', {
  impl: dataTest({
    vars: [Var('children', '%$personWithChildren/children%')],
    calculate: '%$children[0]/name%',
    expectedResult: equals('Bart')
  })
})

jb.component('dataTest.Var', {
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

jb.component('dataTest.conditionalText', {
  impl: dataTest({
    vars: [Var('full', 'full'), Var('empty', '')],
    calculate: '{?%$full% is full?} {?%$empty% is empty?}',
    expectedResult: and(contains('full'), not(contains('is empty')))
  })
})

jb.component('dataTest.nullParamPt', {
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) =>
    tst1
})


jb.component('dataTest.emptyParamAsString', {
  impl: dataTest({
    calculate: dataTest.nullParamPt(),
    expectedResult: ctx =>
        ctx.data == '' && ctx.data != null
  })
})

jb.component('dataTest.waitForPromise', {
  impl: dataTest({
    calculate: ctx => jb.delay(100).then(()=>5),
    expectedResult: equals('5')
  })
})

jb.component('dataTest.pipe', {
  impl: dataTest({
    calculate: pipe(list(1, 2), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('dataTest.pipeWithPromise', {
  impl: dataTest({
    calculate: pipe(ctx => Promise.resolve([1,2]), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('dataTest.pipeInPipe', {
  impl: dataTest({
    calculate: pipe(Var('a', 3), pipe(delay(1), list([1, 2, '%$a%']), join({}))),
    expectedResult: equals('1,2,3')
  })
})

jb.component('dataTest.pipeInPipeWithDelayedVar', {
  impl: dataTest({
    calculate: pipe(
      Var('a', ctx => Promise.resolve(3)),
      pipe(delay(1), list([1, 2, '%$a%']), join({}))
    ),
    expectedResult: equals('1,2,3')
  })
})

jb.component('dataTest.pipeWithPromise2', {
  impl: dataTest({
    calculate: pipe(delayedObj(list(1, 2)), join({})),
    expectedResult: equals('1,2')
  })
})

jb.component('dataTest.pipeWithPromise3', {
  impl: dataTest({
    calculate: pipe(list(delayedObj(1), 2, delayedObj(3)), join({})),
    expectedResult: equals('1,2,3')
  })
})

jb.component('dataTest.pipeWithObservable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.callbag.fromIter([1,2]), '%%a', join({})),
    expectedResult: equals('1a,2a')
  })
})

jb.component('dataTest.dataSwitch', {
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

jb.component('dataTest.dataSwitchDefault', {
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

jb.component('arTest', { watchableData: { ar: ['0'] }})

jb.component('dataTest.restoreArrayIdsBug', {
  impl: dataTest({
    calculate: '%$arTest/result%',
    runBefore: ctx => {
      const ar_ref = ctx.run('%$arTest/ar%',{as: 'ref'});
      const refWithBug = jb.refHandler(ar_ref).refOfPath(['arTest','ar','0']);
      jb.splice(ar_ref,[[1,0,'1']],ctx);
      const v = jb.val(refWithBug);
      jb.writeValue(ctx.exp('%$arTest/result%','ref'),v,ctx);
   },
    expectedResult: contains('0')
  })
})

jb.component('dataTest.extendWithIndex', {
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      extendWithIndex(prop('nameTwice', '%name%-%name%'), prop('index', '%$index%')),
      join({itemText: '%index%.%nameTwice%'})
    ),
    expectedResult: contains('0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie')
  })
})

jb.component('dataTest.if', {
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      If(equals('%name%', 'Bart'), 'funny', 'mamy'),
      join({})
    ),
    expectedResult: contains('funny,mamy,mamy')
  })
})

jb.component('dataTest.if.filters', {
  impl: dataTest({
    calculate: pipeline(
      '%$personWithChildren/children%',
      If(equals('%name%', 'Bart'), 'funny'),
      count()
    ),
    expectedResult: equals(1)
  })
})


jb.component('dataTest.assign', {
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

jb.component('dataTest.obj', {
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

jb.component('dataTest.prettyPrintMacro', {
  impl: dataTest({
    calculate: prettyPrint(ctx => jb.comps['dataTest.obj'].impl),
    expectedResult: contains(["prop('a', 1)", ctx => "res: '%%'"])
  })
})

jb.component('dataTest.activateFunction', {
  impl: dataTest({
    vars: [Var('f1', ctx => (() => ({ a: 5 })))],
    calculate: '%$f1()/a%',
    expectedResult: equals(5)
  })
})

jb.component('dataTest.asArrayBug', {
  impl: dataTest({
    remark: 'should return array',
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: ctx => ctx.exp('%$items/id%','array'),
    expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
  })
})

jb.component('dataTest.varsCases', {
  impl: dataTest({
    remark: 'should return array',
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: pipeline(Var('sep', '-'), remark('hello'), '%$items/id%', '%% %$sep%', join({})),
    expectedResult: equals('1 -,2 -')
  })
})

jb.component('dataTest.prettyPrintMacroVars', {
  impl: dataTest({
    calculate: ctx => { try {
      const testToTest = 'data-test.vars-cases'
      const compTxt = jb.prettyPrintComp(testToTest, jb.comps[testToTest], {initialPath: testToTest})
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

jb.component('dataTest.macroNs', {
  impl: dataTest({
    calculate: json.stringify(()=>({a:5})),
    expectedResult: contains(['a', '5'])
  })
})

jb.component('dataTest.createNewResourceAndWrite', {
  impl: dataTest({
    calculate: '%$zzz/a%',
    runBefore: runActions(
      ctx => jb.component('zzz',{watchableData: {}}),
      writeValue('%$zzz%', () => ({a: 5}))
    ),
    expectedResult: equals(5)
  })
})

jb.component('dataTest.nonWatchableRef', {
  impl: dataTest({
    vars: [Var('constA', () => ({a: 5}))],
    calculate: '%$constA/a%',
    runBefore: writeValue('%$constA/a%', '7'),
    expectedResult: equals(7)
  })
})

jb.component('dataTest.innerOfUndefinedVar', {
  impl: dataTest({
    calculate: '%$unknown/a%',
    runBefore: writeValue('%$unknown/a%', '7'),
    expectedResult: ({data}) => data === undefined
  })
})

// jb.component('dataTest.httpGet', {
//    impl :{$: 'data-test',
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })

jb.component('watchableVar', { watchableData: 'hey' })

jb.component('dataTest.stringWatchableVar', {
  impl: dataTest({
    calculate: '%$watchableVar%',
    runBefore: writeValue('%$watchableVar%', 'foo'),
    expectedResult: equals('foo')
  })
})

jb.component('passiveVar', { passiveData: 'hey' })

jb.component('dataTest.stringPassiveVar', {
  impl: dataTest({
    calculate: '%$passiveVar%',
    runBefore: writeValue('%$passiveVar%', 'foo'),
    expectedResult: equals('foo')
  })
})

jb.component('dataTest.forwardMacro', {
  impl: dataTest({
    calculate: data.test1('a', 'b'),
    expectedResult: equals('a-b')
  })
})

jb.component('dataTest.forwardMacroByValue', {
  impl: dataTest({
    calculate: data.test1('a', 'b'),
    expectedResult: equals('a-b')
  })
})

jb.component('data.test1', {
  params: [
    {id: 'first'},
    {id: 'second'}
  ],
  impl: '%$first%-%$second%'
})

jb.component('dataTest.prettyPrintPositions', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(group({title: '2.0', controls: text('my label')})),
      '%map/~controls~text~!value%',
      join({})
    ),
    expectedResult: equals('3,4,3,14')
  })
})

jb.component('dataTest.prettyPrintPositionsInnerFlat', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.prettyPrintWithPositions(
      group({
        title: 'main',
        controls: [
          group({title: '2.0', controls: text('my label')}),
          text('1.00')
        ]
      })
      ),
      '%map/~controls~0~controls~text~!value%',
      join({})
    ),
    expectedResult: equals('3,40,3,50')
  })
})

jb.component('dataTest.prettyPrintPathInPipeline', {
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

jb.component('dataTest.prettyPrintArray', {
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

jb.component('dataTest.prettyPrint$contains', {
  impl: dataTest({
    calculate: pipeline(() => jb.prettyPrintWithPositions(
        {$contains: 'hello'}
      ), '%text%'),
    expectedResult: contains('hello')
  })
})

jb.component('dataTest.evalExpression', {
  impl: dataTest({
    calculate: evalExpression('1+1'),
    expectedResult: equals(2)
  })
})

jb.component('dataTest.firstSucceeding', {
  impl: dataTest({
    calculate: firstSucceeding(evalExpression('1/0'), 2, 1),
    expectedResult: equals(2)
  })
})

jb.component('dataTest.firstSucceeding.withEmptyString', {
  impl: dataTest({
    calculate: firstSucceeding('', 'a', 'b'),
    expectedResult: equals('a')
  })
})

jb.component('dataTest.DefaultValueComp', {
  impl: dataTest({
    calculate: test.withDefaultValueComp(),
    expectedResult: equals(5)
  })
})