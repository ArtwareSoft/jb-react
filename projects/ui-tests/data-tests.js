jb.component('delayedObj', {
  params: [
    { id: 'obj', type: 'data' }
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

jb.component('test.getAsBool',{
  params: [
    { id: 'val', as: 'boolean'}
  ],
  impl: (ctx,val) => val
})

jb.component('data-test.get-ref-value-as-boolean', {
  impl: dataTest({
	  calculate: test_getAsBool("%$person/male%"),
	  expectedResult: ({data}) => data === true
	})
})

jb.component('data-test.get-exp-value-as-boolean', {
  impl: dataTest({
	  calculate: test_getAsBool("%$person/name%==Homer Simpson"),
	  expectedResult: ({data}) => data === true
	})
})

jb.component('data-test.get-value-via-boolean-type-var', {
  impl: dataTest({
    vars: Var('a','false'),
	  calculate: test_getAsBool("%$a%"),
	  expectedResult: ({data}) => data === false
	})
})

jb.component('data-test.ctx.exp-of-ref-with-boolean-type', {
  impl: dataTest({
    vars: Var('a','false'),
	  calculate: ctx => ctx.exp('%$person/male%','boolean'),
	  expectedResult: ({data}) => data === true
	})
})


jb.component('data-test.join', {
	 impl: dataTest({
		calculate: pipeline(list(1,2), join()),
		expectedResult: equals('1,2')
	 })
})

jb.component('data-test.write-value', {
  impl: dataTest({
    runBefore: writeValue('%$person/age%', 20),
	  calculate: '%$person/age%',
	  expectedResult: equals('20')
	})
})

jb.component('data-test.write-value-false-bug', {
  impl: dataTest({
    runBefore: writeValue('%$person/male%', false),
	  calculate: '%$person/male%',
	  expectedResult: equals(false)
	})
})

jb.component('data-test.splice-delete', {
  impl: dataTest({
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1, noOfItemsToRemove: 1
    }),
	  calculate: pipeline('%$personWithChildren/children/name%', join()),
	  expectedResult: contains('Bart,Maggie')
	})
})

jb.component('data-test.splice', {
  impl: dataTest({
    runBefore: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 1, noOfItemsToRemove: 1, itemsToAdd: {$asIs: [ { name: 'Lisa2' }, { name: 'Maggie2' } ]}
    }),
	  calculate: pipeline('%$personWithChildren/children/name%', join()),
	  expectedResult: contains('Bart,Lisa2,Maggie2,Maggie')
	})
})


jb.component('data-test.write-value-inner', {
  impl: dataTest({
    runBefore: writeValue('%$person/zz/age%', 20),
	  calculate: '%$person/zz/age%',
	  expectedResult: equals('20')
	})
})

jb.component('data-test.write-value-with-link', {
  impl: dataTest({
    runBefore: runActions(
        writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
        writeValue('%$personWithChildren/children[0]/name%', 'Barty1'),
    ),
	  calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
	  expectedResult: equals('Barty1,Barty1')
	})
})

jb.component('data-test.write-value-via-link', {
  impl: dataTest({
    runBefore: runActions(
        writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
        writeValue('%$person/linkToBart/name%', 'Barty1'),
    ),
	  calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
	  expectedResult: equals('Barty1,Barty1')
	})
})


jb.component('data-test.write-value-with-array-link', {
  impl: dataTest({
    runBefore: runActions(
        writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
        writeValue('%$personWithChildren/children[0]/name%', 'Barty1'),
    ),
	  calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
	  expectedResult: equals('Barty1,Barty1')
	})
})

jb.component('data-test.write-value-via-array-link', {
  impl: dataTest({
    runBefore: runActions(
        writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
        writeValue('%$person/childrenLink[0]/name%', 'Barty1'),
    ),
	  calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
	  expectedResult: equals('Barty1,Barty1')
	})
})

jb.component('data-test.runActionOnItems', {
  impl: dataTest({
    runBefore: runActionOnItems('%$personWithChildren/children%', writeValue('%name%', 'a%name%')),
	  calculate: pipeline('%$personWithChildren/children/name%',join()),
	  expectedResult: equals('aBart,aLisa,aMaggie')
	})
})

jb.component('data-test.ref-api', {
  impl: dataTest({
    calculate: '',
	  expectedResult : ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'
	})
})


jb.component('data-test.ref-of-array-item', {
  impl: dataTest({
    calculate: '',
  	 expectedResult : ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'
	})
})

jb.component('data-test.exp-with-array', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%',
	  expectedResult: equals('Bart')
 })
})

jb.component('data-test.array-length', {
  impl: dataTest({
    calculate: '%$personWithChildren/children/length%',
	 expectedResult: equals(3)
 })
})

jb.component('data-test.string-length', {
  impl: dataTest({
    calculate: '%$personWithChildren/name/length%',
	 expectedResult: equals(13)
 })
})

jb.component('data-test.exp-with-array-var', {
  impl: dataTest({
    $vars: { children: '%$personWithChildren/children%'},
	  calculate: '%$children[0]/name%',
	  expectedResult: equals('Bart')
  })
})

jb.component('data-test.Var', { // system props
  impl: dataTest({
	  calculate: pipeline(
        Var('children','%$personWithChildren/children%'), 
        remark('hello'),
        Var('children2','%$personWithChildren/children%'), 
        '%$children[0]/name% %$children2[1]/name%',
    ),
	  expectedResult: equals('Bart Lisa')
  })
})

jb.component('data-test.conditional-text', {
  impl: dataTest({
    vars: [
      Var('full','full'), 
      Var('empty','')
    ],
    calculate: '{?%$full% is full?} {?%$empty% is empty?}',
    expectedResult: and(contains('full'), not(contains('is empty')))
  })
})

jb.component('data-test.null-param-pt', {
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) =>
    tst1
})


jb.component('data-test.empty-param-as-string', {
  impl: dataTest({
    calculate :{$: 'data-test.null-param-pt' },
      expectedResult: ctx =>
        ctx.data == '' && ctx.data != null
  })
})

jb.component('data-test.wait-for-promise', {
  impl: dataTest({
    calculate: ctx => jb.delay(100).then(()=>5),
    expectedResult: equals('5')
  })
})

jb.component('data-test.pipe', {
  impl: dataTest({
    calculate: pipe(list(1,2), join()),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise', {
  impl: dataTest({
    calculate: pipe(ctx => Promise.resolve([1,2]), join()),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise2', {
  impl: dataTest({
    calculate: pipe(delayedObj(list(1,2)), join()),
    expectedResult: equals('1,2')
  })
})

jb.component('data-test.pipe-with-promise3', {
  impl: dataTest({
    calculate: pipe(list(delayedObj(1), 2, delayedObj(3)), join()),
    expectedResult: equals('1,2,3')
  })
})

jb.component('data-test.pipe-with-observable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.rx.Observable.of([1,2]), '%%a', join()),
    expectedResult: equals('1a,2a')
  })
})

jb.component('data-test.data-switch', {
  impl: dataTest({
    calculate: pipeline(5,
      data.switch({cases:[
          data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')
      ]})
    ),
    expectedResult: equals('b')
  })
})

jb.component('data-test.data-switch-default', {
  impl: dataTest({
    calculate: pipeline(7,
      data.switch({
        cases:[
          data.case(equals(4), 'a'), data.case(equals(5), 'b'), data.case(equals(6), 'c')
        ],
        default: 'd'
    })
    ),
    expectedResult: equals('d')
  })
})

jb.component('ar-test', { watchableData: { ar: ['0'] }})

jb.component('data-test.restoreArrayIds-bug', {
   impl :{$: 'data-test',
   runBefore: ctx => {
      const ar_ref = ctx.run('%$ar-test/ar%',{as: 'ref'});
      const refWithBug = jb.refHandler(ar_ref).refOfPath(['ar-test','ar','0']);
      jb.splice(ar_ref,[[1,0,'1']]);
      const v = jb.val(refWithBug);
      jb.writeValue(ctx.exp('%$ar-test/result%','ref'),v);
   },
   calculate: '%$ar-test/result%',
   expectedResult :{$: 'contains', text: '0' }
  }
})

jb.component('data-test.assignWithIndex', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children%',
      assignWithIndex(
          prop('nameTwice', '%name%-%name%'),
          prop('index', '%$index%'),
      ),
      join({itemText: '%index%.%nameTwice%' })
    ),
    expectedResult: contains('0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie')
  })
})

jb.component('data-test.if', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children%',
      If(equals('%name%','Bart'), 'funny','mamy'),
      join()
    ),
    expectedResult: contains('funny,mamy,mamy')
  })
})

jb.component('data-test.if.filters', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children%',
      If(equals('%name%','Bart'), 'funny'),
      count()
    ),
    expectedResult: equals(1)
  })
})


jb.component('data-test.assign', {
  impl: dataTest({
    calculate: pipeline('%$personWithChildren/children%',
      assign(prop('nameTwice', '%name%-%name%')),
      '%nameTwice%',
      join()
    ),
    expectedResult: contains('Bart-Bart,Lisa-Lisa,Maggie-Maggie')
  })
})

jb.component('data-test.obj', {
  impl: dataTest({
    calculate: pipeline(
      obj(
        prop('a',1),
        prop('b',2)
      ), 
      '%a%-%b%',
      {$: 'object', res: '%%'},
      '%res%'
    ),
    expectedResult: contains('1-2')
  })
})

jb.component('data-test.pretty-print-macro', {
  impl: dataTest({
    calculate: prettyPrint({profile: () => jb.comps['data-test.obj'].impl, macro: true}),
    expectedResult: contains(["prop('a', 1)", () => "res: '%%'"])
  })
})

jb.component('data-test.as-array-bug', {
  impl :{$: 'data-test',
   $vars: {
       items: [{id: 1},{id:2}]
   },
   remark: 'should return array',
   calculate: ctx => ctx.exp('%$items/id%','array'),
   expectedResult: ctx => ctx.data[0] == 1 && !Array.isArray(ctx.data[0])
 },
})

jb.component('data-test.vars-cases', {
  impl :{$: 'data-test',
   $vars: {
       items: [{id: 1},{id:2}]
   },
   remark: 'should return array',
   calculate: pipeline(Var('sep','-'),remark('hello'), '%$items/id%','%% %$sep%', join()),
   expectedResult: equals('1 -,2 -')
 },
})

jb.component('data-test.pretty-print-macro-vars', {
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

jb.component('data-test.macro-ns', {
  impl: dataTest({
    calculate: json.stringify(()=>({a:5})),
    expectedResult: contains(['a','5'])
  })
})

jb.component('data-test.create-new-resource-and-write', {
  impl: dataTest({
    runBefore: runActions(
      ctx => jb.component('zzz',{watchableData: {}}),
      writeValue('%$zzz%', () => ({a: 5}))
    ),
    calculate: '%$zzz/a%',
    expectedResult: equals(5)
  })
})

jb.component('data-test.non-watchable-ref', {
  impl: dataTest({
    vars: Var('constA',() => ({a: 5})),
    runBefore: writeValue('%$constA/a%', '7'),
    calculate: '%$constA/a%',
    expectedResult: equals(7)
  })
})

jb.component('data-test.inner-of-undefined-var', {
  impl: dataTest({
    runBefore: writeValue('%$unknown/a%', '7'),
    calculate: '%$unknown/a%',
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

jb.component('data.test1', {
  params:[
    {id: 'first'},
    {id: 'second'},
  ],
  impl: '%$first%-%$second%'
})

