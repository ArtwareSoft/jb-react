//using('ui-tests')


// component('jbEditorTest.basic', {
//   impl: uiTest(group(probe.remoteCircuitPreview(), studio.jbEditor('control<>sampleProject.main~impl')), contains('hello'), {
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     timeout: 1000
//   })
// })

// jb.component('jbEditorTest.onWorker', {
//   impl: uiFrontEndTest({
//     renderDOM: true,
//     timeout: 5000,
//     runBefore: runActions(
//       writeValue('%$probe/defaultMainCircuit%','control<>sampleProject.main'),
//       remote.action(() => jb.component('dataResource.studio', { watchableData: {
//         jbEditor: { 
//           circuit: 'control<>sampleProject.main',
//           selected: 'control<>sampleProject.main~impl~controls~0~0~text'}} 
//         }), worker('inteli'))
//     ),
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         remote.widget(
//           controlWithFeatures(
//             studio.jbEditorInteliTree('control<>sampleProject.main~impl'),{
//               toLoad: [
//               () => { /* code loader: jb.watchableComps.forceLoad(); jb.ui.createHeadlessWidget() */ },
//               {$: 'control<>sampleProject.main'}
//             ]})
//         ,worker('inteli')),
//       ],
//     }),
//     action: uiActions(
//       click('[path="control<>sampleProject.main~impl~controls~0~text"]'),
//       waitForSelector('.selected'),
//       keyboardEvent({ selector: '.jb-editor', type: 'keydown', keyCode: 13 }),
//       waitForSelector('.jb-dialog'),
//     ),    
//     expectedResult: contains('hello')
//   })
// })

// jb.component('previewTest.childPreview', {
//   impl: uiTest({
//     control: preview.remoteWidget(jbm.childPreview()),
//     runBefore: writeValue('%$studio/circuit%', 'uiTest.label'),
//     expectedResult: contains('hello')
//   })
// })

// jb.component('previewTest.uiFrontEndTest', {
//   impl: uiTest({
//     control: preview.remoteWidget(jbm.childPreview()),
//     runBefore: writeValue('%$studio/circuit%', 'FETest.runFEMethod'),
//     expectedResult: contains('change')
//   })
// })