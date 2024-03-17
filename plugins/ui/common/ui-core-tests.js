using('ui-tests')

component('uiTest.changeText', {
  impl: uiTest({
    control: group(text('%$fName%'), editableText({ databind: '%$fName%', style: editableText.input() }), {
      features: watchable('fName', 'Dan')
    }),
    expectedResult: contains('danny'),
    uiAction: setText('danny', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.transactiveHeadless.createWidget', {
  impl: uiTest(text('hello world'), contains('hello world'), { transactiveHeadless: true })
})

component('uiTest.transactiveHeadlessChangeText', {
  impl: uiTest({
    control: group({
      controls: [
        text('-%$fName%-', { features: watchRef('%$fName%') }),
        text('+%$fName%+', { features: watchRef('%$fName%') }),
        editableText({ databind: '%$fName%', style: editableText.input() })
      ],
      features: watchable('fName', 'Dan')
    }),
    expectedResult: contains('-danny-','+danny+'),
    uiAction: setText('danny'),
    backEndJbm: worker('changeText', { sourceCode: sourceCode(pluginsByPath('/plugins/ui/group.js')) }),
    transactiveHeadless: true,
  })
})

component('uiTest.controlWithFeatures.variable', {
  impl: uiTest({
    control: controlWithFeatures(text('%$txt%'), { features: variable('txt', 'homer') }),
    expectedResult: contains('homer')
  })
})

component('test.controlWithFeaturesUseParams', {
  type: 'control',
  params: [
    {id: 'name'}
  ],
  impl: controlWithFeatures(text('%$txt%'), { features: variable('txt', '%$name%') })
})

component('uiTest.controlWithFeatures.useParams', {
  impl: uiTest(test.controlWithFeaturesUseParams('homer'), contains('homer'))
})

component('uiTest.watchableRefToInnerElementsWhenValueIsEmpty', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$selected/name%'),
        button('set', writeValue('%$selected%', obj(prop('name', 'hello'))), { features: id('set') })
      ],
      features: watchable('selected', obj())
    }),
    expectedResult: contains('hello'),
    uiAction: click('#set', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.recursiveCtrl', {
  type: 'control',
  params: [
    {id: 'Data'}
  ],
  impl: group(text('%$Data/text%'), uiTest.recursiveCtrl('%$Data/child%'), {
    features: group.eliminateRecursion(5)
  })
})

component('uiTest.eliminateRecursion', {
  impl: uiTest({
    vars: [
      Var('recData', () => {
      const res = { text: 'txt' }
      res.child = res
      return res
    })
    ],
    control: uiTest.recursiveCtrl('%$recData%'),
    expectedResult: contains('txt','txt','txt','txt','txt')
  })
})

component('uiTest.remoteItemlistKeyboardSelection', {
  impl: uiTest({
    control: group({
      controls: [
        text('-%$res/selected%-', { features: watchRef('%$res/selected%') }),
        itemlist({
          items: '%$people%',
          controls: text('%name%'),
          features: [
            itemlist.selection({ autoSelectFirst: true }),
            itemlist.keyboardSelection({ onEnter: writeValue('%$res/selected%', '%name%') })
          ]
        })
      ],
      features: watchable('res', obj())
    }),
    expectedResult: contains('-Homer Simpson-'),
    uiAction: keyboardEvent('.jb-itemlist', 'keydown', { keyCode: 13 }),
    timeout: 5000,
    backEndJbm: worker('itemlist', {
      sourceCode: sourceCode(pluginsByPath('/plugins/ui/tests/ui-tests.js'), plugins('remote-widget'))
    }),
    emulateFrontEnd: true
  })
})
