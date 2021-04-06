jb.component('sampleProject.main', {
  impl: group({
    controls: text('hello'),
    features: [
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

jb.component('workerPreviewTest.basic', {
  impl: uiTest({
    timeout: 1000,
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.wPreviewCtrl(),
    expectedResult: contains('hello')
  })
})

jb.component('workerPreviewTest.changeScript', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~text'),'world') }),
        remote.wPreviewCtrl()
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
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: red')) }),
        remote.wPreviewCtrl()
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
      writeValue('%$studio/page%','sampleProject.main'),
      writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: green'))
    ),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~controls~features'),() => css('color: red')) }),
        remote.wPreviewCtrl()
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.click('button'),
      waitFor(()=>Array.from(document.querySelectorAll('head>style')).find(x=>x.innerText.match(/color: red/)))
    ),    
    expectedResult: () => getComputedStyle(document.querySelector('[cmp-pt="text"]')).color == 'rgb(255, 0, 0)',
    cleanUp: () => Array.from(document.querySelectorAll('head>style')).filter(x=>x.innerText.match(/tests•wPreview/)).forEach(x=>x.remove())
  })
})

jb.component('workerPreviewTest.suggestions', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    control: group({
      controls: [
        remote.wPreviewCtrl(),
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
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    control: group({
      controls: [
        remote.wPreviewCtrl(),
        studio.propertyPrimitive('sampleProject.main~impl~controls~text')
      ],
    }),
    action: runActions(
      uiAction.waitForSelector('[cmp-pt="text"]'),
      uiAction.waitForSelector('input'),
      uiAction.setText('hello %$v','input'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: ()=> '%'.charCodeAt(0) }),
      uiAction.waitForSelector('.jb-dialog .jb-item'),
      uiAction.click('.jb-dialog .jb-item:first-child'),
      uiAction.keyboardEvent({ selector: 'input', type: 'keyup', keyCode: 13 }),
      uiAction.waitForSelector('[cmp-ver="3"]'),
    ),    
    expectedResult: contains('hello world')
  })
})

jb.component('workerPreviewTest.suggestions.filtered', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    control: group({
      controls: [
        remote.wPreviewCtrl(),
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
    timeout: 1000,
    runBefore: writeValue('%$studio/page%','sampleProject.main'),
    checkResultRx: () => jb.ui.renderingUpdates,
    control: group({
      controls: [
        remote.wPreviewCtrl(),
        studio.jbEditor('sampleProject.main~impl'),
      ],
      features: studio.jbEditorContainer('jbEditorTest')
    }),
    expectedResult: contains('hello')
  })
})
