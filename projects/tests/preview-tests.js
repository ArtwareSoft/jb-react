jb.component('sampleProject.main', {
  impl: group({
    controls: text({text: 'hello', features: [id('sampleText')] }),
    features: [
//      group.wait(delay(100)),
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

jb.component('sampleComp.ctrlWithPipeline', {
  impl: group({
    controls: text(pipeline(list('hello','%$var1%'), join(' '))),
    features: [
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

jb.component('workerPreviewTest.basic', {
  impl: uiTest({
    timeout: 1000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
    control: probe.remoteMainCircuitView(),
    expectedResult: contains('hello')
  })
})

jb.component('workerPreviewTest.changeScript', {
  impl: uiTest({
    timeout: 1000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(tgp.ref('sampleProject.main~impl~controls~text'),'world') }),
        probe.remoteMainCircuitView()
      ],
    }),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('[cmp-pt="text"]')),
      rx.map(userInput.click()),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,       
    expectedResult: contains('world')
  })
})

jb.component('workerPreviewTest.nodePreview', {
  impl: uiTest({
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(tgp.ref('sampleProject.main~impl~controls~text'),'world') }),
        probe.remoteMainCircuitView(jbm.nodeProbe())
      ],
    }),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('[cmp-pt="text"]')),
      rx.map(userInput.click()),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,       
    expectedResult: contains('world')
  })
})

jb.component('FETest.workerPreview.addCss', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(tgp.ref('sampleProject.main~impl~controls~features~1'),() => css('color: red')) }),
        probe.remoteMainCircuitView()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('#sampleText'),
      uiAction.click('button'),
      waitFor(()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/tests•wProbe/)))
    ),    
    expectedResult: () => getComputedStyle(document.querySelector('#sampleText')).color == 'rgb(255, 0, 0)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•wProbe/)).forEach(x=>x.remove())
  })
})

jb.component('FETest.workerPreview.changeCss', {
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
        probe.remoteMainCircuitView()
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

jb.component('FETest.workerPreviewTest.suggestions', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        probe.remoteMainCircuitView(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.waitForSelector('input'),
      uiAction.setText('hello %','input'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0) }),
      uiAction.waitForSelector('.jb-dialog .jb-item'),
    ),    
    expectedResult: contains('$var1')
  })
})

jb.component('FETest.workerPreviewTest.suggestions.select', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        probe.remoteMainCircuitView(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.waitForSelector('input'),
      uiAction.setText('hello %$v','input'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: '%'.charCodeAt(0) }),
      uiAction.waitForSelector('.jb-dialog .jb-item'),
      uiAction.click('.jb-dialog .jb-item:first-child'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: 13 }),
      uiAction.waitForSelector('[cmp-ver="3"]'),
    ),    
    expectedResult: contains('hello world')
  })
})

// jb.component('workerPreviewTest.suggestions2', {
//   impl: uiTest({
//     runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
//     control: group({
//       controls: [
//         probe.remoteMainCircuitView(),
//         studio.propertyPrimitive('sampleProject.main~impl~controls~text')
//       ],
//     }),
//     expectedResult: contains('hello world')
//   })
// })

jb.component('FETest.workerPreviewTest.suggestions.filtered', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    control: group({
      controls: [
        probe.remoteMainCircuitView(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.waitForSelector('input'),
      uiAction.setText('hello %$var1','input'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0) }),
      uiAction.waitForSelector('.jb-dialog .jb-item'),
    ),    
    expectedResult: not(contains('$xx'))
  })
})

jb.component('jbEditorTest.basic', {
  impl: uiTest({
    control: group({
      controls: [
        probe.remoteMainCircuitView(),
        studio.jbEditor('sampleProject.main~impl')
      ]
    }),
    runBefore: writeValue('%$probe/defaultMainCircuit%', 'sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
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
//         }), jbm.worker('inteli'))
//     ),
//     control: group({
//       controls: [
//         probe.remoteMainCircuitView(),
//         remote.widget(
//           controlWithFeatures(
//             studio.jbEditorInteliTree('sampleProject.main~impl'),{
//               toLoad: [
//               () => { /* code loader: jb.watchableComps.forceLoad(); jb.ui.createHeadlessWidget() */ },
//               {$: 'sampleProject.main'}
//             ]})
//         ,jbm.worker('inteli')),
//       ],
//     }),
//     action: runActions(
//       uiAction.click('[path="sampleProject.main~impl~controls~text"]'),
//       uiAction.waitForSelector('.selected'),
//       uiAction.keyboardEvent({ selector: '.jb-editor', type: 'keydown', keyCode: 13 }),
//       uiAction.waitForSelector('.jb-dialog'),
//     ),    
//     expectedResult: contains('hello')
//   })
// })

// jb.component('workerPreviewTest.yellowPages', {
//   impl: dataTest({
//     runBefore: runActions(
//       jbm.wPreview(),
//       remote.useYellowPages(jbm.worker())
//     ),
//     calculate: remote.data('%$yellowPages/preview%', jbm.worker()),
//     expectedResult: contains('wPreview')
//   })
// })

jb.component('previewTest.childJbm', {
  impl: uiTest({
    timeout: 1000,
    runBefore: runActions(
      jbm.child({id: 'childPreview', init: probe.initRemoteProbe()}),
      writeValue('%$probe/defaultMainCircuit%','sampleProject.main'),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    control: probe.remoteMainCircuitView(jbm.child('childPreview')),
    expectedResult: contains('hello')
  })
})
