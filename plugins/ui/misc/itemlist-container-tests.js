component('uiTest.itemlistContainerSearchCtrl', {
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer.search({ style: editableText.mdcSearch(), features: id('search') }),
      itemlist({
        items: pipeline('%$people%', itemlistContainer.filter()),
        controls: text(text.highlight('%name%', '%$itemlistCntrData/search_pattern%')),
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.selection({ autoSelectFirst: true }),
          itemlist.keyboardSelection({ autoFocus: true, onEnter: writeValue('%$res/selected%', '%name%') })
        ]
      })
    ],
    features: group.itemlistContainer()
  })
})

component('uiTest.itemlistContainerSearch', {
  impl: uiTest(uiTest.itemlistContainerSearchCtrl(), contains('Ho<','>mer'), { uiAction: setText('ho', '#search') })
})

component('uiTest.itemlistContainerSearchEnterOnLi', {
  impl: uiTest({
    vars: [Var('res', obj())],
    control: uiTest.itemlistContainerSearchCtrl(),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    uiAction: keyboardEvent('.jb-itemlist', 'keydown', { keyCode: 13, doNotWaitForNextUpdate: true }),
    emulateFrontEnd: true
  })
})
