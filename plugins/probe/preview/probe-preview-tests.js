using('ui-testers')

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
    emulateFrontEnd: true
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
    emulateFrontEnd: true
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

// component('FETest.workerPreviewTest.suggestions.select', {
//   impl: browserTest({
//     control: group(studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text'), probe.remoteCircuitPreview()),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     uiAction: uiActions(
//       waitForSelector('#sampleText'),
//       setText('hello %$var1'),
//       keyboardEvent('input', 'keyup', { keyCode: 37 }),
//       waitForSelector('.jb-dialog .jb-item'),
//       click('.jb-dialog .jb-item:first-child'),
//       keyboardEvent('input', 'keyup', { keyCode: 13 }),
//       waitForSelector('[cmp-ver="4"]')
//     ),
//     expectedResult: contains('hello world'),
//     renderDOM: true,
//     covers: ['FETest.workerPreviewTest.suggestions','FETest.workerPreviewTest.suggestions.selectPopup','FETest.workerPreviewTest.suggestions.filtered']
//   })
// })

// component('FETest.workerPreviewTest.suggestions', {
//   impl: browserTest({
//     control: group(probe.remoteCircuitPreview(), studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     uiAction: uiActions(
//       waitForSelector('[cmp-pt="text"]'),
//       waitForSelector('input'),
//       setText('hello %', 'input'),
//       keyboardEvent('input', 'keyup', { keyCode: ()=> '%'.charCodeAt(0) }),
//       waitForSelector('.jb-dialog .jb-item')
//     ),
//     expectedResult: contains('$var1')
//   })
// })

// component('FETest.workerPreviewTest.suggestions.selectPopup', {
//   impl: browserTest({
//     control: group(studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text'), probe.remoteCircuitPreview()),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     uiAction: uiActions(
//       waitForSelector('#sampleText'),
//       waitForSelector('input'),
//       setText('hello %$'),
//       keyboardEvent('input', 'keyup', { keyCode: 37 }),
//       waitForSelector('.jb-dialog .jb-item')
//     ),
//     expectedResult: contains('(world)')
//   })
// })

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

// component('FETest.workerPreviewTest.suggestions.filtered', {
//   impl: browserTest({
//     control: group(probe.remoteCircuitPreview(), studio.propertyPrimitive('control<>sampleProject.main~impl~controls~0~text')),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'control<>sampleProject.main'),
//     uiAction: uiActions(
//       waitForSelector('#sampleText'),
//       waitForSelector('input'),
//       setText('hello %$var1'),
//       keyboardEvent('input', 'keyup', { keyCode: ()=> '%'.charCodeAt(0) }),
//       waitForSelector('.jb-dialog .jb-item')
//     ),
//     expectedResult: not(contains('$xx'))
//   })
// })
