jb.resource('person',{ 
  name: "Homer Simpson", 
  male: true,
  isMale: 'yes', 
  age: 42 
});

jb.component('delayedObj', {
  params: [
    { id: 'obj', type: 'data' }
  ],
  impl: (ctx,obj) => 
    jb.delay(1).then(_=>obj)
})

jb.component('data-test.join', {
	 impl :{$: 'data-test', 
		calculate: {$pipeline: [ {$list: [1,2]}, {$: 'join'} ]},
		expectedResult :{$: 'contains', text: '1,2' }
	},
})

jb.component('data-test.write-value', {
	 impl :{$: 'data-test', 
	 runBefore:{$: 'write-value', value: 20, to: '%$person/age%'},
	 calculate: '%$person/age%',
	 cleanUp:{$: 'write-value', value: 42, to: '%$person/age%'},
	 expectedResult :{$: 'contains', text: '20' }
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

// jb.component('data-test.http-get', {
//    impl :{$: 'data-test', 
//     calculate: {$pipe : [ {$: 'http.get', url: '/projects/ui-tests/people.json'}, '%people/name%', {$join:','}  ]},
//     expectedResult :{$: 'contains', text: 'Homer' }
//   },
// })
