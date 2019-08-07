const {pipeline, join, list} = jb.profiles

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

jb.component('delayedObj', {
  params: [
    { id: 'obj', type: 'data' }
  ],
  impl: (ctx,obj) =>
    jb.delay(1).then(_=>obj)
})

jb.component('data-test.join', {
	 impl :{$: 'data-test',
		calculate: pipeline([list([1,2]), join()]),
		expectedResult :{$: 'contains', text: '1,2' }
	},
})

jb.component('data-test.write-value', {
	 impl :{$: 'data-test',
	 runBefore:{$: 'write-value', value: 20, to: '%$person/age%'},
	 calculate: '%$person/age%',
	 expectedResult :{$: 'contains', text: '20' }
	}
})

jb.component('data-test.ref-api', {
	 impl :{$: 'data-test',
	 calculate: '',
	 expectedResult : ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name'
	}
})


jb.component('data-test.ref-of-array-item', {
	 impl :{$: 'data-test',
	 calculate: '',
	 expectedResult : ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1'
	}
})

jb.component('data-test.exp-with-array', {
	 impl :{$: 'data-test',
	 calculate: '%$personWithChildren/children[0]/name%',
	 expectedResult :{$: 'equals' , item1: '%%', item2: 'Bart' }
 }
})

jb.component('data-test.array-length', {
	 impl :{$: 'data-test',
	 calculate: '%$personWithChildren/children/length%',
	 expectedResult :{$: 'equals' , item1: '%%', item2: 3 }
 }
})

jb.component('data-test.string-length', {
	 impl :{$: 'data-test',
	 calculate: '%$personWithChildren/name/length%',
	 expectedResult :{$: 'equals' , item1: '%%', item2: 13 }
 }
})

jb.component('data-test.exp-with-array-var', {
	 impl :{$: 'data-test',
	 $vars: { children: '%$personWithChildren/children%'},
	 calculate: '%$children[0]/name%',
	 expectedResult :{$: 'equals' , item1: '%%', item2: 'Bart' }
 }
})

jb.component('data-test.conditional-text', {
  impl: {$: 'data-test',
    calculate :{$: 'pipeline',
      $vars: { full: 'full', empty: '' },
      items: ['{?%$full% is full?} {?%$empty% is empty?}']
    },
    expectedResult :{$: 'and',
      items: [
        {$: 'contains', text: 'full' },
        {$: 'not',
          of :{$: 'contains', text: 'is empty' }
        }
      ]
    }
  }
})

jb.component('data-test.null-param-pt', {
  params: [
    {id: 'tst1', as: 'string'}
  ],
  impl: (ctx,tst1) =>
    tst1
})


jb.component('data-test.empty-param-as-string', {
    impl: {$: 'data-test',
      calculate :{$: 'data-test.null-param-pt' },
      expectedResult: ctx =>
        ctx.data == '' && ctx.data != null
    }
})

jb.component('data-test.wait-for-promise', {
  impl: {$: 'data-test',
      calculate: {$: 'log', obj: ctx =>
          jb.delay(100).then(()=>5) },
    expectedResult: { $: 'contains', text: '5' }
  }
})

jb.component('data-test.pipe', {
   impl :{$: 'data-test',
    calculate: {$pipe : [ ctx => [1,2] , {$join: ','}  ]},
    expectedResult :{$: 'contains', text: '1,2' }
  },
})

jb.component('data-test.pipe-with-promise', {
   impl :{$: 'data-test',
    calculate: {$pipe : [ ctx => Promise.resolve([1,2]), {$join: ','}  ]},
    expectedResult :{$: 'contains', text: '1,2' }
  },
})

jb.component('data-test.pipe-with-promise2', {
   impl :{$: 'data-test',
    calculate: {$pipe : [ { $delayedObj: {$list: [1,2]} } , {$join: ','}  ]},
    expectedResult :{$: 'contains', text: '1,2' }
  },
})

jb.component('data-test.pipe-with-promise3', {
   impl :{$: 'data-test',
    calculate: {$pipe : [ { $list: [ { $delayedObj: 1 } , 2, { $delayedObj: 3 }]}, {$join: ','}  ]},
    expectedResult :{$: 'contains', text: '1,2,3' }
  },
})

jb.component('data-test.pipe-with-observable', {
   impl :{$: 'data-test',
    calculate: {$pipe : [ ctx => jb.rx.Observable.of([1,2]), '%%a' ,{$join: ','}  ]},
    expectedResult :{$: 'contains', text: '1a,2a' }
  },
})

jb.component('data-test.data-switch-singleInType', {
   impl :{$: 'data-test',
    calculate: {$: 'data.switch',  cases: [
      { condition: '1==2', value: 'a'},
      { condition: '1==1', value: 'b'},
    ] },
    expectedResult :{$: 'contains', text: 'b' }
  },
})

jb.resource('ar-test',{ ar: ['0'] })

jb.component('data-test.restoreArrayIds-bug', {
   impl :{$: 'data-test',
   runBefore: ctx => {
      var ar_ref = ctx.exp('%$ar-test/ar%','ref');
      var refWithBug = jb.refHandler().refOfPath(['ar-test','ar','0']);
      jb.splice(ar_ref,[[1,0,'1']]);
      var v = jb.val(refWithBug);
      console.log(v);
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

jb.component('data-test.calculate-properties', {
   impl :{$: 'data-test',
   calculate: {$pipeline: [
    '%$personWithChildren/children%',
      {$:'calculate-properties',
        property: [
          {$: 'calculated-property', title: 'nameTwice', val: '%name%-%name%'},
          {$: 'calculated-property', title: 'index', val: '%$index%'},
        ]
      },
      { $: 'join' , itemText: '%index%.%nameTwice%' }
    ] },
   expectedResult :{$: 'contains', text: '0.Bart-Bart,1.Lisa-Lisa,2.Maggie-Maggie' }
 }
})


// jb.component('data-test.http-get', {
//    impl :{$: 'data-test',
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })
