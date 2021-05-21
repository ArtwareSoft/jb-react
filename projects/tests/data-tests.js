jb.component('dataTest.delayedObj', {
  params: [
    {id: 'obj', type: 'data'}
  ],
  impl: (ctx,obj) => jb.delay(1).then(_=>obj)
})

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
  impl: dataTest(test.getAsBool('%$person/male%'), ({data}) => data === true)
})

jb.component('dataTest.propertyWatchable', {
  impl: dataTest(property('name', '%$person%'), equals('Homer Simpson'))
})

jb.component('dataTest.pipelineVar', {
  impl: dataTest(
    pipeline('%$peopleWithChildren%', pipeline(Var('parent'), '%children%', '%name% is child of %$parent/name%'), join()),
    equals('Bart is child of Homer,Lisa is child of Homer,Bart is child of Marge,Lisa is child of Marge')
  )
})

jb.component('dataTest.datum', {
  impl: dataTest(pipeline('hello', pipeline(Var('datum', 'world'), '%%'), join()), equals('world'))
})

jb.component('dataTest.propertyPassive', {
  impl: dataTest({
    vars: [Var('person', obj(prop('name', 'homer')))],
    calculate: property('name', '%$person%'),
    expectedResult: equals('homer')
  })
})

jb.component('dataTest.getExpValueAsBoolean', {
  impl: dataTest(test.getAsBool('%$person/name%==Homer Simpson'), ({data}) => data === true)
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
  impl: dataTest(pipeline(list(1, 2), join()), equals('1,2'))
})

jb.component('dataTest.writeValue', {
  impl: dataTest({
    calculate: '%$person/age%',
    expectedResult: equals('20'),
    runBefore: writeValue('%$person/age%', 20)
  })
})

jb.component('dataTest.writeValueFalseBug', {
  impl: dataTest({
    calculate: '%$person/male%',
    expectedResult: equals(false),
    runBefore: writeValue({to: '%$person/male%', value: false})
  })
})

jb.component('dataTest.spliceDelete', {
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

jb.component('dataTest.splice', {
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

jb.component('dataTest.writeValueInner', {
  impl: dataTest({
    calculate: '%$person/zz/age%',
    expectedResult: equals('20'),
    runBefore: writeValue('%$person/zz/age%', 20)
  })
})

jb.component('dataTest.writeValueWithLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

jb.component('dataTest.writeValueViaLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$person/linkToBart/name%', 'Barty1')
    )
  })
})

jb.component('dataTest.writeValueWithArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

jb.component('zbl', {
  type: 'control',
  impl: group({
    layout: layout.flex({direction: 'column', spacing: '21'}),
    controls: [
      button({
        title: 'hello',
        action: runActions(writeValue('aaa')),
        style: button.href()
      }),
      text({
        text: 'hello',
        features: css.boxShadow({
          blurRadius: 10,
          spreadRadius: 3,
          shadowColor: 'blue'
        })
      }),
      html(),
      text({text: 'sdsds', features: css.color('red')}),
      button({title: 'click me', style: ''}),
      text(),
      button(),
      text('aa')
    ],
    features: features(method('aaa', addToArray()))
  })
})

jb.component('dataTest.writeValueViaArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$person/childrenLink[0]/name%', 'Barty1')
    )
  })
})

jb.component('dataTest.runActionOnItems', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join()),
    expectedResult: equals('aBart,aLisa,aMaggie'),
    runBefore: runActionOnItems('%$personWithChildren/children%', writeValue('%name%', 'a%name%'))
  })
})

jb.component('dataTest.runActionOnItemsArrayRef', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children/name%', join(',')),
    expectedResult: equals('aBart,aLisa,aMaggie'),
    runBefore: runActionOnItems('%$personWithChildren/children/name%', writeValue('%%', 'a%%'))
  })
})

jb.component('dataTest.refApi', {
  impl: dataTest({calculate: '', expectedResult: ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'})
})

jb.component('dataTest.refOfArrayItem', {
  impl: dataTest({calculate: '', expectedResult: ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'})
})

jb.component('dataTest.refOfStringArrayItemSplice', {
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

jb.component('dataTest.refOfStringArrayItemMove', {
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

jb.component('dataTest.refOfStringTreeMove', {
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

jb.component('dataTest.moveDown.checkPaths', {
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

jb.component('dataTest.expWithArray', {
  impl: dataTest('%$personWithChildren/children[0]/name%', equals('Bart'))
})

jb.component('dataTest.arrayLength', {
  impl: dataTest('%$personWithChildren/children/length%', equals(3))
})

jb.component('dataTest.stringLength', {
  impl: dataTest('%$personWithChildren/name/length%', equals(13))
})

jb.component('dataTest.expWithArrayVar', {
  impl: dataTest({
    vars: [Var('children', '%$personWithChildren/children%')],
    calculate: '%$children[0]/name%',
    expectedResult: equals('Bart')
  })
})

jb.component('dataTest.Var', {
  impl: dataTest(
    pipeline(
      Var('children', '%$personWithChildren/children%'),
      Var('children2', '%$personWithChildren/children%'),
      '%$children[0]/name% %$children2[1]/name%'
    ),
    equals('Bart Lisa')
  )
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
  impl: (ctx,tst1) => tst1
})


jb.component('dataTest.emptyParamAsString', {
  impl: dataTest(dataTest.nullParamPt(), ctx =>
        ctx.data == '' && ctx.data != null)
})

jb.component('dataTest.waitForPromise', {
  impl: dataTest(() => jb.delay(1).then(()=>5), equals('5'))
})

jb.component('dataTest.pipe', {
  impl: dataTest(pipe(list(1, 2), join()), equals('1,2'))
})

jb.component('dataTest.pipeWithPromise', {
  impl: dataTest(pipe(ctx => Promise.resolve([1,2]), join()), equals('1,2'))
})

jb.component('dataTest.pipeInPipe', {
  impl: dataTest(pipe(Var('a', 3), pipe(delay(1), list([1, 2, '%$a%']), join())), equals('1,2,3'))
})

jb.component('dataTest.pipeInPipeWithDelayedVar', {
  impl: dataTest(pipe(Var('a', ctx => Promise.resolve(3)), pipe(delay(1), list([1, 2, '%$a%']), join())), equals('1,2,3'))
})

jb.component('dataTest.pipeWithPromise2', {
  impl: dataTest(pipe(dataTest.delayedObj(list(1, 2)), join()), equals('1,2'))
})

jb.component('dataTest.pipeWithPromise3', {
  impl: dataTest(pipe(list(dataTest.delayedObj(1), 2, dataTest.delayedObj(3)), join()), equals('1,2,3'))
})

jb.component('dataTest.dataSwitch', {
  impl: dataTest(
    pipeline(5, data.switch([data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')])),
    equals('b')
  )
})

jb.component('dataTest.dataSwitchDefault', {
  impl: dataTest(
    pipeline(7, data.switch([data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')], 'd')),
    equals('d')
  )
})

jb.component('arTest', { watchableData: { ar: ['0'] }})

jb.component('dataTest.restoreArrayIdsBug', {
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

jb.component('dataTest.extendWithIndex', {
  impl: dataTest(
    pipeline(
      '%$personWithChildren/children%',
      extendWithIndex(prop('nameTwice', '%name%-%name%'), prop('index', '%$index%')),
      join({itemText: '%index%.%nameTwice%'})
    ),
    contains('0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie')
  )
})

jb.component('dataTest.if', {
  impl: dataTest(
    pipeline('%$personWithChildren/children%', If(equals('%name%', 'Bart'), 'funny', 'mamy'), join()),
    contains('funny,mamy,mamy')
  )
})

jb.component('dataTest.if.filters', {
  impl: dataTest(pipeline('%$personWithChildren/children%', If(equals('%name%', 'Bart'), 'funny'), count()), equals(1))
})


jb.component('dataTest.assign', {
  impl: dataTest(
    pipeline('%$personWithChildren/children%', assign(prop('nameTwice', '%name%-%name%')), '%nameTwice%', join()),
    contains('Bart-Bart,Lisa-Lisa,Maggie-Maggie')
  )
})

jb.component('dataTest.obj', {
  impl: dataTest(pipeline(obj(prop('a', 1), prop('b', 2)), '%a%-%b%', {'$': 'object', res: '%%'}, '%res%'), contains('1-2'))
})

jb.component('dataTest.prettyPrintMacro', {
  impl: dataTest(prettyPrint(ctx => jb.comps['dataTest.obj'].impl), contains(["prop('a', 1)", ctx => "res: '%%'"]))
})

jb.component('dataTest.activateMethod', {
  impl: dataTest({
    vars: [Var('o1', () => ({ f1: () => ({a:5}) }))],
    calculate: '%$o1/f1()/a%',
    expectedResult: equals(5)
  })
})

jb.component('dataTest.asArrayBug', {
  impl: dataTest({
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: ctx =>                                                                                                                                                                                                
      ctx.exp('%$items/id%','array'),
    expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
  })
})

jb.component('dataTest.varsCases', {
  impl: dataTest({
    vars: [Var('items', [{id: 1}, {id: 2}])],
    calculate: pipeline(Var('sep', '-'), '%$items/id%', '%% %$sep%', join()),
    expectedResult: equals('1 -,2 -')
  })
})

jb.component('dataTest.prettyPrintMacroVars', {
  impl: dataTest({
    calculate: ctx => { try {
      const testToTest = 'dataTest.varsCases'
      const compTxt = jb.utils.prettyPrintComp(testToTest.replace(/varsCases/,'varsCases2'), jb.comps[testToTest])
      eval(compTxt)
      return ctx.run(dataTest.asArrayBug()) // checks for error
        .then(({success}) => success)
      } catch(e) {
        return false
      }
    },
    expectedResult: '%%'
  })
})

jb.component('dataTest.macroNs', {
  impl: dataTest(json.stringify(()=>({a:5})), contains(['a', '5']))
})

jb.component('dataTest.createNewResourceAndWrite', {
  impl: dataTest({
    calculate: '%$zzz/a%',
    expectedResult: equals(5),
    runBefore: runActions(ctx => jb.component('zzz',{watchableData: {}}), writeValue('%$zzz%', () => ({a: 5})))
  })
})

jb.component('dataTest.nonWatchableRef', {
  impl: dataTest({
    vars: [Var('constA', () => ({a: 5}))],
    calculate: '%$constA/a%',
    expectedResult: equals(7),
    runBefore: writeValue('%$constA/a%', '7')
  })
})

jb.component('dataTest.innerOfUndefinedVar', {
  impl: dataTest({
    calculate: '%$unknown/a%',
    expectedResult: ({data}) => data === undefined,
    runBefore: writeValue('%$unknown/a%', '7'),
    allowError: true
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
    expectedResult: equals('foo'),
    runBefore: writeValue('%$watchableVar%', 'foo')
  })
})

jb.component('passiveVar', { passiveData: 'hey' })

jb.component('dataTest.stringPassiveVar', {
  impl: dataTest({
    calculate: '%$passiveVar%',
    expectedResult: equals('foo'),
    runBefore: writeValue('%$passiveVar%', 'foo')
  })
})

jb.component('dataTest.forwardMacro', {
  impl: dataTest(data.test1('a', 'b'), equals('a-b'))
})

jb.component('dataTest.forwardMacroByValue', {
  impl: dataTest(data.test1('a', 'b'), equals('a-b'))
})

jb.component('data.test1', {
  params: [
    {id: 'first'},
    {id: 'second'}
  ],
  impl: '%$first%-%$second%'
})

jb.component('dataTest.prettyPrintPositions', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({title: '2.0', controls: text('my label')})),
      '%map/~controls~text~!value%',
      join()
    ),
    equals('2,17,2,27')
  )
})

jb.component('dataTest.prettyPrintPositions.closeArray', {
  impl: dataTest(
    pipeline(
      () => jb.utils.prettyPrintWithPositions(group({controls: [text('my label'), text('my label')]} ), {colWidth: 30} ),
      '%map/~controls~!close-array%',
      join()
    ),
    equals('3,20,4,2')
  )
})


jb.component('dataTest.prettyPrintPositions.separator', {
  impl: dataTest(
    pipeline(() => jb.utils.prettyPrintWithPositions({a: 1, b: 2}), '%map/~!obj-separator-0%', join()),
    equals('1,6,2,2')
  )
})

jb.component('dataTest.prettyPrintPositionsInnerFlat', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
      group({
        title: 'main',
        controls: [
          group({title: '2.0', controls: text('my label')}),
          text('1.00')
        ]
      })
      ), '%map/~controls~0~controls~text~!value%', join()), equals('2,49,2,59'))
})

jb.component('dataTest.prettyPrintPathInPipeline', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
        pipeline('main')
      ), '%map/~items~0~!value[0]%'), equals(1))
})

jb.component('dataTest.prettyPrintArray', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions(
        group({controls:[]})
      ), '%map/~controls~!value[0]%'), equals(1))
})

jb.component('dataTest.prettyPrint.contains', {
  impl: dataTest(pipeline(() => jb.utils.prettyPrintWithPositions( {$contains: 'hello'}), '%text%'), contains('hello'))
})

jb.component('dataTest.prettyPrint.byValue.cutTailingUndefinedArgs', {
  impl: dataTest(() => jb.utils.prettyPrint(css.boxShadow({inset: false})), notContains('undefined'))
})

jb.component('dataTest.prettyPrint.async', {
  impl: dataTest(() => jb.utils.prettyPrint({ async a() {3} }), and(not(contains('a:')), contains('async a() {3}')))
})

jb.component('dataTest.prettyPrint.funcDefaults', {
  impl: dataTest(() => jb.utils.prettyPrint({ aB(c,{b} = {}) {3} }), and(not(contains('aB:')), contains('aB(c,{b} = {}) {3}')))
})

jb.component('dataTest.codeEditor.getPosOfPath', {
  impl: dataTest(
    pipeline(
      () => jb.codeEditor.getPosOfPath('dataTest.codeEditor.getPosOfPath~impl~expectedResult~!profile'),
      slice(0, 2),
      join()
    ),
    equals('7,4')
  )
})

jb.component('dataTest.evalExpression', {
  impl: dataTest(evalExpression('1+1'), equals(2))
})

jb.component('dataTest.firstSucceeding', {
  impl: dataTest(firstSucceeding(evalExpression('1/0'), 2, 1), equals(2))
})

jb.component('dataTest.firstSucceeding.withEmptyString', {
  impl: dataTest(firstSucceeding('', 'a', 'b'), equals('a'))
})

jb.component('dataTest.DefaultValueComp', {
  impl: dataTest(test.withDefaultValueComp(), equals(5))
})


