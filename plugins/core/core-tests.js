component('dataTest.delayedObj', {
  params: [
    {id: 'obj', type: 'data'}
  ],
  impl: (ctx,obj) => jb.delay(1).then(_=>obj)
})

component('test.getAsBool', {
  params: [
    {id: 'val', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,val) => val
})

component('test.withDefaultValueComp', {
  params: [
    {id: 'val', defaultValue: pipeline('5')}
  ],
  impl: '%$val%'
})

component('dataTest.getRefValueAsBoolean', {
  impl: dataTest(test.getAsBool('%$person/male%'), ({data}) => data === true)
})

component('dataTest.propertyWatchable', {
  impl: dataTest(property('name', '%$person%'), equals('Homer Simpson'))
})

component('dataTest.pipelineVar', {
  impl: dataTest({
    calculate: pipeline(
      '%$peopleWithChildren%',
      pipeline(Var('parent'), '%children%', '%name% is child of %$parent/name%'),
      join()
    ),
    expectedResult: equals(
      'Bart is child of Homer,Lisa is child of Homer,Bart is child of Marge,Lisa is child of Marge'
    ),
    covers: ['dataTest.Var','dataTest.join']
  })
})

component('dataTest.datum', {
  impl: dataTest(pipeline('hello', pipeline(Var('datum', 'world'), '%%'), join()), equals('world'))
})

component('dataTest.propertyPassive', {
  impl: dataTest({
    vars: [Var('person', obj(prop('name', 'homer')))],
    calculate: property('name', '%$person%'),
    expectedResult: equals('homer')
  })
})

component('dataTest.getExpValueAsBoolean', {
  impl: dataTest(test.getAsBool('%$person/name%==Homer Simpson'), ({data}) => data === true)
})

component('dataTest.getValueViaBooleanTypeVar', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: test.getAsBool('%$a%'),
    expectedResult: ({data}) => data === false
  })
})

component('dataTest.ctx.expOfRefWithBooleanType', {
  impl: dataTest({
    vars: [Var('a', 'false')],
    calculate: ctx => ctx.exp('%$person/male%','boolean'),
    expectedResult: ({data}) => data === true
  })
})

component('dataTest.writeValue', {
  impl: dataTest({
    calculate: '%$person/age%',
    expectedResult: equals('20'),
    runBefore: writeValue('%$person/age%', 20)
  })
})

component('dataTest.writeValueFalseBug', {
  impl: dataTest({
    calculate: '%$person/male%',
    expectedResult: equals(false),
    runBefore: writeValue({to: '%$person/male%', value: false})
  })
})

component('dataTest.spliceDelete', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join()),
    expectedResult: contains('Bart,Maggie'),
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1,
      noOfItemsToRemove: 1
    })
  })
})

component('dataTest.splice', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join()),
    expectedResult: contains('Bart,Lisa2,Maggie2,Maggie'),
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1,
      noOfItemsToRemove: 1,
      itemsToAdd: asIs([{name: 'Lisa2'}, {name: 'Maggie2'}])
    })
  })
})

component('dataTest.writeValueInner', {
  impl: dataTest({
    calculate: '%$person/zz/age%',
    expectedResult: equals('20'),
    runBefore: writeValue('%$person/zz/age%', 20)
  })
})

component('dataTest.writeValueWithLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

component('dataTest.writeValueViaLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$person/linkToBart/name%', 'Barty1')
    )
  })
})

component('dataTest.writeValueWithArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

component('dataTest.writeValueViaArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$person/childrenLink[0]/name%', 'Barty1')
    )
  })
})

component('dataTest.runActionOnItemsArrayRef', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join(',')),
    expectedResult: equals('aBart,aLisa,aMaggie'),
    runBefore: runActionOnItems('%$personWithChildren/children/name%', writeValue('%%', 'a%%'))
  })
})

component('dataTest.refApi', {
  impl: dataTest({calculate: '', expectedResult: ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'})
})

component('dataTest.refOfArrayItem', {
  impl: dataTest({calculate: '', expectedResult: ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'})
})

component('dataTest.refOfStringArrayItemSplice', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%'),
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      ctx.run(splice({array: '%$stringArray%', fromIndex: 0, noOfItemsToRemove: 1}))
      refs.valAfter = jb.val(refs.refOfc)
    }
  })
})

component('dataTest.refOfStringArrayItemMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringArray[1]%','ref')
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      jb.db.move(refs.refOfc, refs.refOfb, ctx)
      refs.valAfter = jb.val(refs.refOfc)
    },
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%')
  })
})

component('dataTest.refOfStringTreeMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringTree/node1[1]%','ref')
      refs.refOf2 = ctx.exp('%$stringTree/node2[2]%','ref')
      refs.valBefore = jb.val(refs.refOfb)
      jb.db.move(refs.refOfb, refs.refOf2, ctx)
      refs.valAfter = jb.val(refs.refOfb)
    },
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%')
  })
})

component('dataTest.moveDown.checkPaths', {
  impl: dataTest({
    vars: [Var('res', obj())],
    calculate: '',
    expectedResult: equals('%$res/paths%', '1,0'),
    runBefore: ctx => {
      const bart = ctx.exp('%$personWithChildren/children[0]%')
      const lisa = ctx.exp('%$personWithChildren/children[1]%')
      ctx.run(move('%$personWithChildren/children[0]%','%$personWithChildren/children[1]%'))
      ctx.vars.res.paths = jb.db.asRef(bart).path()[2] + ',' + jb.db.asRef(lisa).path()[2]
    }
  })
})

component('dataTest.expWithArray', {
  impl: dataTest('%$personWithChildren/children[0]/name%', equals('Bart'))
})

component('dataTest.arrayLength', {
  impl: dataTest('%$personWithChildren/children/length%', equals(3))
})

component('dataTest.stringLength', {
  impl: dataTest('%$personWithChildren/name/length%', equals(13))
})

component('dataTest.expWithArrayVar', {
  impl: dataTest({
    vars: [Var('children', '%$personWithChildren/children%')],
    calculate: '%$children[0]/name%',
    expectedResult: equals('Bart')
  })
})

component('dataTest.Var', {
  impl: dataTest(
    pipeline(
      Var('children', '%$personWithChildren/children%'),
      Var('children2', '%$personWithChildren/children%'),
      '%$children[0]/name% %$children2[1]/name%'
    ),
    equals('Bart Lisa')
  )
})

component('dataTest.conditionalText', {
  impl: dataTest({
    vars: [Var('full', 'full'), Var('empty', '')],
    calculate: '{?%$full% is full?} {?%$empty% is empty?}',
    expectedResult: and(contains('full'), not(contains('is empty')))
  })
})

component('dataTest.nullParamPt', {
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) => tst1
})


component('dataTest.emptyParamAsString', {
  impl: dataTest(dataTest.nullParamPt(), ctx =>
        ctx.data == '' && ctx.data != null)
})

component('dataTest.waitForPromise', {
  impl: dataTest(() => jb.delay(1).then(()=>5), equals('5'))
})

component('arTest', { watchableData: { ar: ['0'] }})

component('dataTest.restoreArrayIdsBug', {
  impl: dataTest({
    calculate: '%$arTest/result%',
    expectedResult: contains('0'),
    runBefore: ctx => {
      const ar_ref = ctx.run('%$arTest/ar%',{as: 'ref'});
      const refWithBug = jb.db.refHandler(ar_ref).refOfPath(['arTest','ar','0']);
      jb.db.splice(ar_ref,[[1,0,'1']],ctx);
      const v = jb.val(refWithBug);
      jb.db.writeValue(ctx.exp('%$arTest/result%','ref'),v,ctx);
   }
  })
})

component('dataTest.activateMethod', {
  impl: dataTest({
    vars: [Var('o1', () => ({ f1: () => ({a:5}) }))],
    calculate: '%$o1/f1()/a%',
    expectedResult: equals(5)
  })
})

component('dataTest.asArrayBug', {
  impl: dataTest({
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: ctx =>                                                                                                                                                                                                
      ctx.exp('%$items/id%','array'),
    expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
  })
})

component('dataTest.varsCases', {
  impl: dataTest({
    vars: [
      Var('items', [{id: 1}, {id: 2}])
    ],
    calculate: pipeline(Var('sep', '-'), '%$items/id%', '%% %$sep%', join()),
    expectedResult: equals('1 -,2 -')
  })
})

component('dataTest.macroNs', {
  impl: dataTest(json.stringify(()=>({a:5})), contains(['a', '5']))
})

component('dataTest.createNewResourceAndWrite', {
  impl: dataTest({
    calculate: '%$zzz/a%',
    expectedResult: equals(5),
    runBefore: runActions(ctx => component('zzz',{watchableData: {}}), writeValue('%$zzz%', () => ({a: 5})))
  })
})

component('dataTest.nonWatchableRef', {
  impl: dataTest({
    vars: [Var('constA', () => ({a: 5}))],
    calculate: '%$constA/a%',
    expectedResult: equals(7),
    runBefore: writeValue('%$constA/a%', '7')
  })
})

component('dataTest.innerOfUndefinedVar', {
  impl: dataTest({
    calculate: '%$unknown/a%',
    expectedResult: ({data}) => data === undefined,
    runBefore: writeValue('%$unknown/a%', '7'),
    allowError: true
  })
})

// component('dataTest.httpGet', {
//    impl :{$: 'data-test',
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })

component('watchableVar', { watchableData: 'hey' })

component('dataTest.stringWatchableVar', {
  impl: dataTest({
    calculate: '%$watchableVar%',
    expectedResult: equals('foo'),
    runBefore: writeValue('%$watchableVar%', 'foo')
  })
})

component('passiveVar', { passiveData: 'hey' })

component('dataTest.stringPassiveVar', {
  impl: dataTest({
    calculate: '%$passiveVar%',
    expectedResult: equals('foo'),
    runBefore: writeValue('%$passiveVar%', 'foo')
  })
})

component('dataTest.DefaultValueComp', {
  impl: dataTest(test.withDefaultValueComp(), equals(5))
})



