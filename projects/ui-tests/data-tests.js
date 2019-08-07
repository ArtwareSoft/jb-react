const {dataTest, pipeline, pipe, join, list, writeValue, contains, equals, and, not, assign, prop, assignWithIndex, obj} = jb.profiles
const {$switch, $case} = jb.profiles.data

jb.component('delayedObj', {
  params: [
    { id: 'obj', type: 'data' }
  ],
  impl: (ctx,obj) =>
    jb.delay(1).then(_=>obj)
})

const {delayedObj} = jb.profiles

jb.resource('person',{
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
});

jb.resource('personWithChildren',{
  name: "Homer Simpson",
  children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ],
  friends: [{ name: 'Barnie' } ],
})

jb.component('data-test.join', {
	 impl: dataTest({
		calculate: pipeline(list(1,2), join()),
		expectedResult: contains('1,2')
	 })
})

jb.component('data-test.write-value', {
  impl: dataTest({
    runBefore: writeValue('%$person/age%', 20),
	  calculate: '%$person/age%',
	  expectedResult: contains('20')
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

jb.component('data-test.conditional-text', {
  impl: dataTest({
    $vars: {full: 'full', empty: '' },
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
    expectedResult: contains('5')
  })
})

jb.component('data-test.pipe', {
  impl: dataTest({
    calculate: pipe(list(1,2), join()),
    expectedResult: contains('1,2')
  })
})

jb.component('data-test.pipe-with-promise', {
  impl: dataTest({
    calculate: pipe(ctx => Promise.resolve([1,2]), join()),
    expectedResult: contains('1,2')
  })
})

jb.component('data-test.pipe-with-promise2', {
  impl: dataTest({
    calculate: pipe(delayedObj(list(1,2)), join()),
    expectedResult: contains('1,2')
  })
})

jb.component('data-test.pipe-with-promise3', {
  impl: dataTest({
    calculate: pipe(list(delayedObj(1), 2, delayedObj(3)), join()),
    expectedResult: contains('1,2,3')
  })
})

jb.component('data-test.pipe-with-observable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.rx.Observable.of([1,2]), '%%a', join()),
    expectedResult: contains('1a,2a')
  })
})

jb.component('data-test.data-switch-singleInType', {
  impl: dataTest({
    calculate: pipeline(5,
      $switch(
          $case(equals(4), 'a'), 
          $case(equals(5), 'b')
      )),
    expectedResult: contains('b')
  })
})

jb.resource('ar-test',{ ar: ['0'] })

jb.component('data-test.restoreArrayIds-bug', {
   impl :{$: 'data-test',
   runBefore: ctx => {
      var ar_ref = ctx.exp('%$ar-test/ar%','ref');
      var refWithBug = jb.refHandler().refOfPath(['ar-test','ar','0']);
      jb.splice(ar_ref,[[1,0,'1']]);
      var v = jb.val(refWithBug);
      jb.writeValue(ctx.exp('%$ar-test/result%','ref'),v);
   },
   calculate: '%$ar-test/result%',
   expectedResult :{$: 'contains', text: '0' }
  }
})

jb.component('data-test.as-array-bug', {
   impl :{$: 'data-test',
    $vars: {
        items: [{id: 1},{id:2}]
    },
    calculate: ctx => ctx.exp('%$items/id%','array'),
    expectedResult : ctx => !Array.isArray(ctx.data[0])
  },
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
      '%a%-%b%'
    ),
    expectedResult: contains('1-2')
  })
})

// jb.component('data-test.http-get', {
//    impl :{$: 'data-test',
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })
