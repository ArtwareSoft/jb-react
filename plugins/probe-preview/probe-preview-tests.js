using('ui-tests')

component('sampleProject.main', {
  impl: group({
    controls: text({text: 'hello', features: [id('sampleText')]}),
    features: [
      variable('var1', 'world'),
      variable('xx', 'xx')
    ]
  })
})

component('suggestionsTest.varsFilter.remote', {
  impl: remoteSuggestionsTest({
    expression: '%$p',
    expectedResult: and(contains('$people'), not(contains('$win'))),
  })
})

component('workerPreviewTest.basic', {
  impl: uiTest({
    control: probe.remoteCircuitPreview(),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    expectedResult: contains('hello'),
    timeout: 1000
  })
})

component('workerPreviewTest.changeScript', {
  impl: uiTest({
    control: group({
      controls: [
        button('change script', writeValue(tgp.ref('sampleProject.main~impl~controls~text'), 'world')),
        probe.remoteCircuitPreview()
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    userInputRx: rx.pipe(source.promise(uiAction.waitForSelector('#sampleText')), rx.map(userInput.click())),
    expectedResult: contains('world'),
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
//     userInputRx: rx.mergeConcat(
//       source.promise(uiAction.waitForSelector('input')),
//       source.data(userInput.setText('hello %$var1', 'input')),
//       source.data(userInput.keyboardEvent({selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0)})),
//       source.promise(uiAction.waitForSelector('.jb-dialog .jb-item'))
//     ),
//     expectedResult: and(contains('$var1'), notContains('$xx')),
//   }),
//   require: sampleProject.main()
// })

component('workerPreviewTest.nodePreview', {
  impl: uiTest({
    control: group({
      controls: [
        button('change script', writeValue(tgp.ref('sampleProject.main~impl~controls~text'), 'world')),
        probe.remoteCircuitPreview()
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    userInputRx: rx.pipe(source.promise(uiAction.waitForSelector('#sampleText')), rx.map(userInput.click())),
    expectedResult: contains('world'),
    timeout: 1000
  })
})

component('FETest.workerPreviewTest.addCss', {
  impl: uiFrontEndTest({
    control: group({
      controls: [
        button(
          'change script',
          writeValue(
            tgp.ref('sampleProject.main~impl~controls~features~1'),
            () => css('color: red')
          )
        ),
        probe.remoteCircuitPreview()
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    action: runActions(
      uiAction.waitForSelector('#sampleText'),
      uiAction.click('button'),
      waitFor(
        ()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/tests•wProbe/))
      )
    ),
    expectedResult: () => getComputedStyle(document.querySelector('#sampleText')).color == 'rgb(255, 0, 0)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•wProbe/)).forEach(x=>x.remove()),
    renderDOM: true
  })
})

component('FETest.workerPreviewTest.changeCss', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: runActions(
      writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
      writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'),() => css('color: green'))
    ),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'),() => css('color: blue')) }),
        probe.remoteCircuitPreview()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('#sampleText'),
      uiAction.click('button'),
      waitFor(()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/color: blue/)))
    ),    
    expectedResult: () => getComputedStyle(document.querySelector('#sampleText')).color == 'rgb(0, 0, 255)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•wProbe/)).forEach(x=>x.remove())
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
