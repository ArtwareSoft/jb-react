using('ui-tests')

component('sampleProject.main', {
  impl: group(text('hello', { features: [id('sampleText')] }), {
    features: [
      variable('var1', 'world'),
      variable('xx', 'xx')
    ]
  })
})

component('probePreviewTest.suggestions.varsFilter', {
  doNotTerminateWorkers: true,
  impl: probePreviewSuggestionsTest('control<>sampleProject.main~impl~controls~0~text', '%$p', {
    circuitPath: 'control<>sampleProject.main',
    expectedResult: and(contains('$people'), not(contains('$win')))
  })
})

component('probePreviewTest.basic', {
  doNotTerminateWorkers: true,
  impl: uiTest(probe.remoteCircuitPreview('control<>sampleProject.main'), contains('hello'), {
    uiAction: waitForText('hello'),
    timeout: 3000
  })
})

component('probePreviewTest.changeScript', {
  doNotTerminateWorkers: true,
  impl: uiTest(probe.remoteCircuitPreview('control<>sampleProject.main'), contains('world'), {
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    uiAction: uiActions(
      waitForText('hello'),
      writeValue(tgp.ref('control<>sampleProject.main~impl~controls~0~text'), 'hello world'),
      waitForText('world')
    ),
    timeout: 3000
  })
})

// component('probePreviewTest.suggestions.filtered', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         probe.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')
//       ]
//     }),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     userInputRx: source.mergeConcat(
//       source.promise(waitForSelector('input')),
//       source.data(userInput.setText('hello %$var1', 'input')),
//       source.data(userInput.keyboardEvent({selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0)})),
//       source.promise(waitForSelector('.jb-dialog .jb-item'))
//     ),
//     expectedResult: and(contains('$var1'), notContains('$xx')),
//   }),
//   require: sampleProject.main()
// })

component('probePreviewTest.addCss', {
  doNotTerminateWorkers: true,
  impl: uiTest({
    control: group(
      button('change script', writeValue({
        to: tgp.ref('control<>sampleProject.main~impl~controls~0~features~1'),
        value: () => ({$:'feature<>css', css: 'color: green'})
      })),
      probe.remoteCircuitPreview('control<>sampleProject.main')
    ),
    expectedResult: contains('color: green'),
    uiAction: uiActions(waitForText('hello'), click()),
    useFrontEnd: true
  })
})

component('probePreviewTest.changeCss', {
  doNotTerminateWorkers: true,
  impl: uiTest({
    control: group(
      button('change script', writeValue({
        to: tgp.ref('control<>sampleProject.main~impl~controls~0~features~1'),
        value: () => ({$:'feature<>css', css: 'color: blue'})
      })),
      probe.remoteCircuitPreview('control<>sampleProject.main')
    ),
    expectedResult: contains('color: blue'),
    runBefore: runActions(
      writeValue({
        to: tgp.ref('control<>sampleProject.main~impl~controls~0~features~1'),
        value: () => ({$:'feature<>css', css: 'color: green'})
      })
    ),
    uiAction: uiActions(waitForText('hello'), click()),
    useFrontEnd: true
  })
})

    // runBefore: runActions(
    //   writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
    //   writeValue({
    //     to: tgp.ref('control<>sampleProject.main~impl~controls~0~features~1'),
    //     value: () => ({$:'feature<>css', css: 'color: green'})
    //   })
    // ),


// component('previewTest.childJbm', {
//   impl: uiTest({
//     control: probe.remoteCircuitPreview(child('childProbe')),
//     runBefore: runActions(
//       jbm.start(child({id: 'childProbe', init: probe.initPreview()})),
//       writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main')
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 1000
//   })
// })

// component('previewTest.workerJbm', {
//   impl: uiTest({
//     control: probe.remoteCircuitPreview(worker('childProbe')),
//     runBefore: runActions(
//       jbm.start(worker({id: 'childProbe', init: probe.initPreview()})),
//       writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main')
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 1000
//   })
// })


// jb.component('probePreviewTest.yellowPages', {
//   impl: dataTest({
//     runBefore: runActions(
//       jbm.wPreview(),
//       remote.useYellowPages(worker())
//     ),
//     calculate: remote.data('%$yellowPages/preview%', worker()),
//     expectedResult: contains('wPreview')
//   })
// })
