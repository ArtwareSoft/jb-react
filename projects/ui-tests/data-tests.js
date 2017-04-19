import 'testing/data-testers.js';

jb.component('data-test.join', {
   impl :{$: 'data-test', 
    calculate: {$pipeline: [ {$list: [1,2]}, {$: 'join'} ]},
    expectedResult :{$: 'contains', text: '1,2' }
  },
})

Promise.resolve(new jb.jbCtx().run({$:'data-test.join'})).then(x=>console.log(x))

// component('ui-test.label', {
//   impl :{$: 'react-ui-test',  
//   control :{$: 'label', title: 'Hello World' },
//   expectedHtmlResult: { $: 'contains', text: 'Hello World' }
//   },
// })

