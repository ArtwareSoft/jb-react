using('probe-tests')

component('FETest.workerPreviewTest.suggestions', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        probe.remoteCircuitPreview(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ],
    }),
    action: uiActions(
      waitForSelector('[cmp-pt="text"]'),
      waitForSelector('input'),
      setText('hello %','input'),
      keyboardEvent({ selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0) }),
      waitForSelector('.jb-dialog .jb-item'),
    ),    
    expectedResult: contains('$var1')
  })
})

component('FETest.workerPreviewTest.suggestions.select', {
  impl: uiFrontEndTest({
    control: group({
      controls: [
        studio.propertyPrimitive('sampleProject.main~impl~controls~text'),
        probe.remoteCircuitPreview()
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    action: uiActions(
      waitForSelector('#sampleText'),
      waitForSelector('input'),
      setText('hello %$var1', 'input'),
      keyboardEvent({selector: 'input', type: 'keyup', keyCode: 37}),
      waitForSelector('.jb-dialog .jb-item'),
      click('.jb-dialog .jb-item:first-child'),
      keyboardEvent({selector: 'input', type: 'keyup', keyCode: 13}),
      waitForSelector('[cmp-ver=\"4\"]')
    ),
    expectedResult: contains('hello world'),
    renderDOM: true
  })
})

component('FETest.workerPreviewTest.suggestions.selectPopup', {
  impl: uiFrontEndTest({
    control: group({controls: [
      studio.propertyPrimitive('sampleProject.main~impl~controls~text'),
      probe.remoteCircuitPreview()
    ]}),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    action: uiActions(
      waitForSelector('#sampleText'),
      waitForSelector('input'),
      setText('hello %$', 'input'),
      keyboardEvent({ selector: 'input', type: 'keyup',  keyCode: 37 }), // %
      waitForSelector('.jb-dialog .jb-item')
    ),
    expectedResult: contains('(world)'),
    renderDOM: true
  })
})

// jb.component('workerPreviewTest.suggestions2', {
//   impl: uiTest({
//     runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         studio.propertyPrimitive('sampleProject.main~impl~controls~text')
//       ],
//     }),
//     expectedResult: contains('hello world')
//   })
// })

component('FETest.workerPreviewTest.suggestions.filtered', {
  impl: uiFrontEndTest({
    control: group({
      controls: [
        probe.remoteCircuitPreview(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    action: uiActions(
      waitForSelector('#sampleText'),
      waitForSelector('input'),
      setText('hello %$var1', 'input'),
      keyboardEvent({selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0)}),
      waitForSelector('.jb-dialog .jb-item')
    ),
    expectedResult: not(contains('$xx')),
    renderDOM: true
  })
})

component('jbEditorTest.basic', {
  impl: uiTest({
    control: group({
      controls: [
        probe.remoteCircuitPreview(),
        studio.jbEditor('sampleProject.main~impl')
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    expectedResult: contains('hello'),
    timeout: 1000
  }),
})

// jb.component('jbEditorTest.onWorker', {
//   impl: uiFrontEndTest({
//     renderDOM: true,
//     timeout: 5000,
//     runBefore: runActions(
//       writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
//       remote.action(() => jb.component('dataResource.studio', { watchableData: {
//         jbEditor: { 
//           circuit: 'sampleProject.main',
//           selected: 'sampleProject.main~impl~controls~0~text'}} 
//         }), worker('inteli'))
//     ),
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         remote.widget(
//           controlWithFeatures(
//             studio.jbEditorInteliTree('sampleProject.main~impl'),{
//               toLoad: [
//               () => { /* code loader: jb.watchableComps.forceLoad(); jb.ui.createHeadlessWidget() */ },
//               {$: 'sampleProject.main'}
//             ]})
//         ,worker('inteli')),
//       ],
//     }),
//     action: uiActions(
//       click('[path="sampleProject.main~impl~controls~text"]'),
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