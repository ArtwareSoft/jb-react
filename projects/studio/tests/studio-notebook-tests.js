
jb.component('notebookTest.compToShadow', {
  impl: 'Homer'
})

// jb.component('notebookTest.initShadowComponent', {
//   impl: dataTest({
//     timeout: 5000,
//     runBefore: pipe(
//       worker('notebook'),
//       remote.initShadowComponent({compId: 'notebookTest.compToShadow', jbm: byUri('tests•notebook')}),
//       () => { jb.exec(runActions(delay(1), writeValue(tgp.ref('notebookTest.compToShadow~impl'),'Dan'))) } // writeValue after calculate
//     ),
//     calculate: remote.data(
//       pipe(rx.pipe(
//         watchableComps.scriptChange(),
//         rx.log('test'),
//         rx.map('%newVal%'),
//         rx.take(1)
//       )), 
//       byUri('tests•notebook')
//     ),
//     expectedResult: equals('Dan')
//   })
// })