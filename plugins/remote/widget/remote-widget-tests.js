using('ui-tests')

component('remoteWidgetTest.text', {
  impl: uiTest(text('hello world'), contains('hello world'), { timeout: 1000, backEndJbm: worker() })
})

// component('remoteWidgetTest.distributedWidget', {
//   impl: uiTest({
//     control: group({
//       controls: button(
//         'click',
//         remote.distributedWidget({
//           control: text('hello world'),
//           backend: worker(),
//           frontend: child('jbxServer'),
//           selector: '.xRoot'
//         })
//       ),
//       features: css.class('xRoot')
//     }),
//     userInputRx: rx.pipe(source.promise(waitForSelector('button')), rx.map(userInput.click())),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 3000
//   })
// })

component('remoteWidgetTest.changeText2', {
  impl: uiTest({
    control: group(text('%$fName%'), editableText({ databind: '%$fName%' }), { features: watchable('fName', 'Dan') }),
    expectedResult: contains('danny'),
    uiAction: setText('danny', { doNotWaitForNextUpdate: true }),
    timeout: 500,
    backEndJbm: worker(),
    covers: ['remoteWidgetTest.text','remoteWidgetTest.changeText']
  })
})

component('remoteWidgetTest.changeText', {
  impl: uiTest({
    control: group(text('%$fName%'), editableText({ databind: '%$fName%' }), { features: watchable('fName', 'Dan') }),
    expectedResult: contains('danny'),
    uiAction: setText('danny'),
    timeout: 1000,
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.group.wait', {
  impl: uiTest({
    control: group(button('hello world'), {
      features: group.wait(treeShake.getCodeFromRemote('control<>sampleProject.main'))
    }),
    expectedResult: contains('hello world'),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.buttonClick', {
  impl: uiTest({
    control: group(text('%$fName%'), button('change', writeValue('%$fName%', 'danny')), {
      features: watchable('fName', 'Dan')
    }),
    expectedResult: contains('danny'),
    uiAction: click(),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.dialog', {
  impl: uiTest(button('open', openDialog('hello', group())), contains('hello'), {
    uiAction: uiActions(click(), waitForSelector('.jb-dialog')),
    backEndJbm: worker(),
    covers: ['remoteWidgetTest.buttonClick']
  })
})

component('remoteWidgetTest.loadCodeManully', {
  impl: uiTest({
    control: group(ctx => ctx.run({$: 'control<>text', text: 'hello' }), {
      features: group.wait(treeShake.getCodeFromRemote('control<>text'))
    }),
    expectedResult: contains('hello'),
    backEndJbm: worker()
  })
})

component('FETest.distributedWidget', {
  impl: uiFrontEndTest(group({ features: css.class('xRoot') }), {
    uiAction: uiActions(
      action(
        remote.distributedWidget(button('hello world'), worker(), {
          frontend: child('jbxServer'),
          selector: '.xRoot'
        })
      ),
      waitForSelector('button')
    ),
    expectedResult: contains('hello'),
    renderDOM: true
  })
})

component('FETest.remoteWidgetTest.changeText', {
  impl: uiFrontEndTest(group({ features: css.class('xRoot') }), {
    uiAction: uiActions(
      action(remote.distributedWidget({
        control: group({
          controls: [
            text('hey %$fName%', { features: watchRef('%$fName%') }),
            editableText({ databind: '%$fName%' })
          ],
          features: watchable('fName', 'Dan')
        }),
        backend: worker(),
        frontend: child('jbxServer'),
        selector: '.xRoot'
      })),
      waitForSelector('input'),
      setText('danny'),
      keyboardEvent('input', 'keyup'),
      waitForSelector('[cmp-ver="2"]')
    ),
    expectedResult: contains('hey danny'),
    renderDOM: true,
    covers: ['FETest.distributedWidget']
  })
})

component('FETest.remoteWidget.codemirror', {
  impl: uiFrontEndTest(remote.widget(text('hello', { style: text.codemirror({ height: 100 }) }), worker()), {
    uiAction: waitFor(() => jb.frame.document.querySelector('.CodeMirror')),
    expectedResult: contains('hello'),
    renderDOM: true
  })
})

component('FETest.remoteWidget.codemirror.editableText', {
  impl: uiFrontEndTest({
    control: remote.widget({
      control: editableText({ databind: '%$person/name%', style: editableText.codemirror({ height: 100 }) }),
      jbm: worker()
    }),
    runBefore: remote.action(addComponent('person', obj(prop('name', 'Homer')), { type: 'watchableData' }), worker()),
    uiAction: waitFor(() => jb.frame.document.querySelector('.CodeMirror')),
    expectedResult: contains('Homer'),
    renderDOM: true,
    covers: ['FETest.remoteWidget.codemirror']
  })
})

component('FETest.remoteWidget.infiniteScroll', {
  impl: uiTest({
    control: itemlist({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        css.height('100', 'scroll'),
        itemlist.infiniteScroll(),
        css.width('600')
      ]
    }),
    expectedResult: contains('>8<'),
    uiAction: uiActions(click('.jb-itemlist', 'fetchNextPage'), waitForText('>8<')),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.refresh', {
  impl: uiTest({
    control: group(remote.widget(text('%$person1/name%', { features: id('text1') }), worker()), {
      features: [
        id('group1'),
        variable('person1', '%$person%'),
        watchRef('%$person/name%')
      ]
    }),
    expectedResult: contains('hello'),
    uiAction: uiActions(waitForSelector('#text1'), writeValue('%$person/name%', 'hello'), waitForText('hello')),
    timeout: 2000,
    useFrontEnd: true
  })
})

component('remoteWidgetTest.runInBECmpContext', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$var1%'),
        frontEnd.widget(
          button('click me', runInBECmpContext('%$frontEndCmpId%', writeValue('%$var1%', 'hello')), {
            style: button.native()
          })
        )
      ],
      features: watchable('var1', 'Hi')
    }),
    expectedResult: true,
    uiAction: click(),
    backEndJbm: worker(),
    useFrontEnd: true
  })
})
