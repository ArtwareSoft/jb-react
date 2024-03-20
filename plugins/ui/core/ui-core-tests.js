using('ui-testers')

component('uiTest.changeText', {
  impl: uiTest({
    control: group(text('%$fName%'), editableText({ databind: '%$fName%', style: editableText.input() }), {
      features: watchable('fName', 'Dan')
    }),
    expectedResult: contains('danny'),
    uiAction: setText('danny', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.refreshControlById.text', {
  impl: uiTest({
    vars: [
      Var('person1', () => ({ name: 'Homer' }))
    ],
    control: text('%$person1/name%', { features: id('t1') }),
    expectedResult: contains('Dan'),
    uiAction: uiActions(writeValue('%$person1/name%', 'Dan'), action(refreshControlById('t1')))
  })
})

component('uiTest.refreshControlById.withButton', {
  impl: uiTest({
    vars: [
      Var('person1', () => ({ name: 'Homer' }))
    ],
    control: group(
      text('%$person1/name%', { features: id('t1') }),
      button('refresh', runActions(writeValue('%$person1/name%', 'Dan'), refreshControlById('t1')))
    ),
    expectedResult: contains('Dan'),
    uiAction: click('button')
  })
})

component('uiTest.refreshByStateChange', {
  impl: uiTest({
    control: group(text('%$name%'), {
      features: [
        id('g1'),
        variable('name', 'name: %$$state/name%'),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    expectedResult: contains('Dan'),
    uiAction: runMethod('#g1', 'refresh', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.refreshWithStyleByCtrl', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$name%'),
        button('click', ctx => jb.ui.runBEMethodByElem(jb.ui.querySelectorAll(jb.ui.widgetBody(ctx), '#g1')[0], 'refresh'))
      ],
      style: group.sections(),
      features: [
        id('g1'),
        variable('name', ctx => ctx.exp('name: %$$state/name%')),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    expectedResult: contains('Dan'),
    uiAction: click('button')
  })
})

component('uiTest.watchRef.recalcVars', {
  impl: uiTest({
    control: text('%$changed%', {
      features: [
        variable('changed', '--%$person/name%--'),
        watchRef('%$person/name%')
      ]
    }),
    expectedResult: contains('--hello--'),
    uiAction: writeValue('%$person/name%', 'hello')
  })
})

component('uiTest.rawVdom', {
  impl: uiTest(ctx => jb.ui.h('div', {}, 'hello world'), contains('hello world'))
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
      sourceCode: plugins('ui-common-tests','remote-widget')
    }),
    emulateFrontEnd: true
  })
})

component('uiTest.styleByControl', {
  impl: uiTest({
    control: text('Hello World', { style: styleByControl(button('%$labelModel/text()%2'), 'labelModel') }),
    expectedResult: contains('Hello World2')
  })
})

component('uiTest.expectedEffects.checkLog', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), { features: watchable('txt', 'aaa') }),
    expectedResult: contains('bbb'),
    uiAction: click({
      expectedEffects: Effects(checkLog('delta', '%delta%', { log: 'delta', condition: contains('$text="bbb"') }))
    })
  })
})

component('uiTest.expectedEffects.compChange', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), {
      features: watchable('txt', 'aaa')
    }),
    expectedResult: contains('bbb'),
    uiAction: click({ expectedEffects: Effects(compChange('bbb')) })
  })
})

component('uiTest.innerLabel1Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: text(call('title'))
})
component('uiTest.innerLabel2Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel1Tst(call('title'))
})
component('uiTest.innerLabel3Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel2Tst(call('title'))
})
component('uiTest.innerLabel', {
  impl: uiTest(uiTest.innerLabel3Tst('Hello World2'), contains('Hello World2'))
})

component('uiTest.BEOnDestroy', {
  impl: uiTest({
    control: group(
      button('click me', openDialog({
        content: text('in dialog', { features: onDestroy(writeValue('%$person/name%', 'dialog closed')) }),
        id: 'dlg'
      })),
      text('%$person/name%')
    ),
    expectedResult: contains('dialog closed'),
    uiAction: uiActions(click(), action(dialog.closeDialogById('dlg')), waitForText('dialog closed'))
  })
})

component('uiTest.hiddenRefBug', {
  impl: uiTest({
    control: group(text('hey', { features: hidden('%$hidden%') }), { features: watchable('hidden', false) }),
    expectedResult: contains('display:none')
  })
})
