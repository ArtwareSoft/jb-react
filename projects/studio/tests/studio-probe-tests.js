using('probe-tests')

component('FETest.workerPreviewTest.suggestions.select', {
  impl: uiFrontEndTest({
    control: group(studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text'), probe.remoteCircuitPreview()),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    uiAction: uiActions(
      waitForSelector('#sampleText'),
      setText('hello %$var1'),
      keyboardEvent('input', 'keyup', { keyCode: 37 }),
      waitForSelector('.jb-dialog .jb-item'),
      click('.jb-dialog .jb-item:first-child'),
      keyboardEvent('input', 'keyup', { keyCode: 13 }),
      waitForSelector('[cmp-ver="4"]')
    ),
    expectedResult: contains('hello world'),
    renderDOM: true,
    covers: ['FETest.workerPreviewTest.suggestions','FETest.workerPreviewTest.suggestions.selectPopup','FETest.workerPreviewTest.suggestions.filtered']
  })
})

component('FETest.workerPreviewTest.suggestions', {
  impl: uiFrontEndTest({
    control: group(probe.remoteCircuitPreview(), studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    uiAction: uiActions(
      waitForSelector('[cmp-pt="text"]'),
      waitForSelector('input'),
      setText('hello %', 'input'),
      keyboardEvent('input', 'keyup', { keyCode: ()=> '%'.charCodeAt(0) }),
      waitForSelector('.jb-dialog .jb-item')
    ),
    expectedResult: contains('$var1')
  })
})

component('FETest.workerPreviewTest.suggestions.selectPopup', {
  impl: uiFrontEndTest({
    control: group(studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text'), probe.remoteCircuitPreview()),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    uiAction: uiActions(
      waitForSelector('#sampleText'),
      waitForSelector('input'),
      setText('hello %$'),
      keyboardEvent('input', 'keyup', { keyCode: 37 }),
      waitForSelector('.jb-dialog .jb-item')
    ),
    expectedResult: contains('(world)')
  })
})

// jb.component('workerPreviewTest.suggestions2', {
//   impl: uiTest({
//     runBefore: writeValue('%$probe/defaultMainCircuit%','control<>sampleProject.main'),
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')
//       ],
//     }),
//     expectedResult: contains('hello world')
//   })
// })

component('FETest.workerPreviewTest.suggestions.filtered', {
  impl: uiFrontEndTest({
    control: group(probe.remoteCircuitPreview(), studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    uiAction: uiActions(
      waitForSelector('#sampleText'),
      waitForSelector('input'),
      setText('hello %$var1'),
      keyboardEvent('input', 'keyup', { keyCode: ()=> '%'.charCodeAt(0) }),
      waitForSelector('.jb-dialog .jb-item')
    ),
    expectedResult: not(contains('$xx'))
  })
})

component('jbEditorTest.basic', {
  impl: uiTest(group(probe.remoteCircuitPreview(), studio.jbEditor('control<>sampleProject.main~impl')), contains('hello'), {
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    timeout: 1000
  })
})

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