jb.component('sampleProject.main', {
  impl: text('hello')
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
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~text'),'world') }),
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
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~features'),() => css('color: red')) }),
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
      writeValue(studio.ref('sampleProject.main~impl~features'),() => css('color: green'))
    ),
    control: group({
      controls: [
        button({title: 'change script', action: writeValue(studio.ref('sampleProject.main~impl~features'),() => css('color: red')) }),
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