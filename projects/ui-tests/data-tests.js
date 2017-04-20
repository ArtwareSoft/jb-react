jb.component('data-test.join', {
   impl :{$: 'data-test', 
    calculate: {$pipeline: [ {$list: [1,2]}, {$: 'join'} ]},
    expectedResult :{$: 'contains', text: '1,2' }
  },
})
