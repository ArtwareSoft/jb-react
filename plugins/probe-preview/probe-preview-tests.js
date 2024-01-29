using('ui-tests')

component('sampleProject.main', {
  impl: group({
    controls: text('hello', { features: [id('sampleText')] }),
    features: [
      variable('var1', 'world'),
      variable('xx', 'xx')
    ]
  })
})

component('suggestionsTest.varsFilter.remote', {
  impl: remoteSuggestionsTest('%$p', { expectedResult: and(contains('$people'), not(contains('$win'))) })
})

component('workerPreviewTest.basic', {
  impl: uiTest(probe.remoteCircuitPreview(), contains('hello'), {
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    uiAction: waitForText('hello'),
    timeout: 3000
  })
})

component('workerPreviewTest.changeScript', {
  impl: uiTest(probe.remoteCircuitPreview(), contains('world'), {
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    uiAction: uiActions(writeValue(tgp.ref('sampleProject.main~impl~controls~text'), 'world'), waitForText('world')),
    timeout: 1000
  })
})

// component('workerPreviewTest.suggestions.filtered', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         probe.remoteCircuitPreview(),
//         probe.propertyPrimitive('sampleProject.main~impl~controls~text')
//       ]
//     }),
//     runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
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

component('uiTest.workerPreviewTest.addCss', {
  impl: uiTest({
    control: group({
      controls: [
        button('change script', writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'), () => css('color: red'))),
        probe.remoteCircuitPreview()
      ]
    }),
    expectedResult: contains('color: red'),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    uiAction: click(),
    useFrontEnd: true
  })
})

component('uiTest.workerPreviewTest.changeCss', {
  impl: uiTest({
    control: group({
      controls: [
        button('change script', writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'), () => css('color: blue'))),
        probe.remoteCircuitPreview()
      ]
    }),
    expectedResult: ctx => Object.values(jb.ui.FEEmulator[ctx.vars.widgetId].styles).join(';').indexOf('color: blue') != -1,
    runBefore: runActions(
      writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
      writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'), () => css('color: green'))
    ),
    uiAction: click(),
    useFrontEnd: true
  })
})


// component('previewTest.childJbm', {
//   impl: uiTest({
//     control: probe.remoteCircuitPreview(child('childProbe')),
//     runBefore: runActions(
//       jbm.start(child({id: 'childProbe', init: probe.initPreview()})),
//       writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main')
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
//       writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main')
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 1000
//   })
// })


// jb.component('workerPreviewTest.yellowPages', {
//   impl: dataTest({
//     runBefore: runActions(
//       jbm.wPreview(),
//       remote.useYellowPages(worker())
//     ),
//     calculate: remote.data('%$yellowPages/preview%', worker()),
//     expectedResult: contains('wPreview')
//   })
// })
