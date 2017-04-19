jb.component('ui-test.label', {
   impl :{$: 'ui-test', 
    control:{$:'label', title: 'hello world'},
    expectedResult :{$: 'contains', text: 'hello world' }
  },
})

jb.component('ui-test.group', {
   impl :{$: 'ui-test', 
    control: { $: 'group', controls: [
      {$:'label', title: 'hello world'},
      {$:'label', title: '2'},
    ] },
    expectedResult :{$: 'contains', text: ['jb-group','hello world','2'] }
  },
})

