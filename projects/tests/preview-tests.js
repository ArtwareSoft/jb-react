jb.component('sampleProject.main', {
  impl: group({
    controls: text('hello'),
    features: [
//      group.wait(delay(100)),
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

jb.component('workerPreviewTest.basic', {
  impl: uiTest({
    timeout: 1000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
    control: preview.remoteWidget(),
    expectedResult: contains('hello')
  })
})

jb.component('workerPreviewTest.changeScript', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~text'),'world') }),
        preview.remoteWidget()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.click('button'),
      uiAction.waitForSelector('[cmp-ver="2"]'),
    ),    
    expectedResult: contains('world')
  })
})

jb.component('workerPreviewTest.addCss', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: red')) }),
        preview.remoteWidget()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.click('button'),
      waitFor(()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/tests•wPreview/)))
    ),    
    expectedResult: () => getComputedStyle(document.querySelector('[cmp-pt="text"]')).color == 'rgb(255, 0, 0)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•wPreview/)).forEach(x=>x.remove())
  })
})

jb.component('workerPreviewTest.changeCss', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: runActions(
      writeValue('%$studio/circuit%','sampleProject.main'),
      writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: green'))
    ),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: red')) }),
        preview.remoteWidget()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.click('button'),
      waitFor(()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/color: red/)))
    ),    
    expectedResult: () => getComputedStyle(document.querySelector('[cmp-pt="text"]')).color == 'rgb(255, 0, 0)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•preview/)).forEach(x=>x.remove())
  })
})

jb.component('workerPreviewTest.suggestions', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    control: group({
      controls: [
        preview.remoteWidget(),
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

jb.component('workerPreviewTest.suggestions.select', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    control: group({
      controls: [
        preview.remoteWidget(),
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
//     runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
//     control: group({
//       controls: [
//         preview.remoteWidget(),
//         studio.propertyPrimitive('sampleProject.main~impl~controls~text')
//       ],
//     }),
//     expectedResult: contains('hello world')
//   })
// })

jb.component('workerPreviewTest.suggestions.filtered', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/circuit%','sampleProject.main'),
    control: group({
      controls: [
        preview.remoteWidget(),
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
        preview.remoteWidget(),
        studio.jbEditor('sampleProject.main~impl')
      ]
    }),
    runBefore: writeValue('%$studio/circuit%', 'sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('hello'),
    timeout: 1000
  }),
  location: null
})

// jb.component('jbEditorTest.onWorker', {
//   impl: uiFrontEndTest({
//     renderDOM: true,
//     timeout: 5000,
//     runBefore: runActions(
//       writeValue('%$studio/circuit%','sampleProject.main'),
//       remote.action(() => jb.component('dataResource.studio', { watchableData: {
//         jbEditor: { 
//           circuit: 'sampleProject.main',
//           selected: 'sampleProject.main~impl~controls~0~text'}} 
//         }), jbm.worker('inteli'))
//     ),
//     control: group({
//       controls: [
//         preview.remoteWidget(),
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