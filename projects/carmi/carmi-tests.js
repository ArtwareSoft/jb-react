

// jb.component('carmi.doubleNegated', {
//     impl :{$: 'carmi.model',
//         sample: ctx => [false, 1, 0],
//         vars: [
//             {$: 'carmi.var', id: 'doubleNegated', exp :{$: 'carmi.map', 
//                 array :{$: 'carmi.root'}, mapTo :{$: 'carmi.not' } }}
//         ]
//     }
// })

const mdl = new jb.jbCtx().run({$:'carmi.doubleNegated'}).then(mdl=> console.log(mdl))