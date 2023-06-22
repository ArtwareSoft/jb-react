using('ui-tests')

component('remoteWidgetTest.button', {
  impl: uiTest({
    control: remote.widget(button('hello world'), worker()),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('hello world'),
    timeout: 3000
  })
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
//     userInputRx: rx.pipe(source.promise(uiAction.waitForSelector('button')), rx.map(userInput.click())),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 3000
//   })
// })

component('remoteWidgetTest.changeText', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind:'%$fName%'})
        ],
        features: watchable('fName','Dan'),
      }),
      worker()
    ),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('input')),
      rx.map(userInput.setText('danny')),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

component('remoteWidgetTest.group.wait', {
  impl: uiTest({
    timeout: 3000,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(group({
      controls: button('hello world'),
      features: group.wait(treeShake.getCodeFromRemote('sampleProject.main')),
    }), worker()),
    expectedResult: contains('hello world')
  })
})

component('remoteWidgetTest.buttonClick', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          button({title: 'change', action: writeValue('%$fName%','danny') })
        ],
        features: watchable('fName','Dan'),
      }),
      worker()
    ),
    userInputRx: source.promises(
      uiAction.waitForSelector('button'),
      userInput.click(),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

component('remoteWidgetTest.dialog', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      button({title: 'open', action: openDialog({title: 'hello', content: group()})}),
      worker()
    ),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('button')),
      rx.map(userInput.click()),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('hello')
  })
})

component('remoteWidgetTest.loadCodeManully', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: ctx => ctx.run({$: 'text', text: 'hello' }),
        features: group.wait(treeShake.getCodeFromRemote('text'))
      }),
      worker()
    ),
    expectedResult: contains('hello')
  })
})

component('remoteWidgetTest.html', {
  impl: uiTest({
    timeout: 500,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(html('<p>hello world</p>'), worker()),
    expectedResult: contains('hello world</p>')
  })
})


component('FETest.distributedWidget', {
  impl: uiFrontEndTest({
    control: group({controls: [], features: css.class('xRoot')}),
    action: runActions(
      remote.distributedWidget({
        control: button('hello world'),
        backend: worker(),
        frontend: child('jbxServer'),
        selector: '.xRoot'
      }),
      uiAction.waitForSelector('button')
    ),
    expectedResult: contains('hello'),
    renderDOM: true
  })
})

component('FETest.remoteWidgetTest.changeText', {
  impl: uiFrontEndTest({
    control: group({controls: [], features: css.class('xRoot')}),
    action: runActions(
      remote.distributedWidget({
        control: group({
          controls: [
            text({text: 'hey %$fName%', features: watchRef('%$fName%')}),
            editableText({databind: '%$fName%'})
          ],
          features: watchable('fName', 'Dan')
        }),
        backend: worker(),
        frontend: child('jbxServer'),
        selector: '.xRoot'
      }),
      uiAction.waitForSelector('input'),
      uiAction.setText('danny'),
      uiAction.keyboardEvent('input', 'keyup'),
      uiAction.waitForSelector('[cmp-ver=\"2\"]')
    ),
    expectedResult: contains('hey danny'),
    renderDOM: true
  })
})

component('FETest.remoteWidget.codemirror', {
  impl: uiFrontEndTest({
    control: remote.widget(text({text: 'hello', style: text.codemirror({height: 100})}), worker()),
    action: waitFor(() => document.querySelector('.CodeMirror')),
    expectedResult: contains('hello'),
    renderDOM: true
  })
})

component('FETest.remoteWidget.codemirror.editableText', {
  impl: uiFrontEndTest({
    control: remote.widget(editableText({databind: '%$person/name%', style: editableText.codemirror({height: 100})}), worker()),
    runBefore: remote.action(addComponent({
      id: 'person',
      value: obj(prop('name', 'Homer')),
      type: 'watchableData'
    }), worker()),
    action: waitFor(() => document.querySelector('.CodeMirror')),
    expectedResult: contains('Homer'),
    renderDOM: true
  })
})

// jb.component('remoteWidgetTest.refresh.cleanUp', {
//   description: 'creating remote widgets and deleting them with gc',
//   impl: uiFrontEndTest({
//     renderDOM: true,
//     timeout: 3000,
//     control: group({
//       controls: remote.widget(text('%$person1/name%'), worker()),
//       features: [
//         variable('person1','%$person%'), // only local vars are passed to remote
//         watchRef('%$person/name%')
//       ]
//     }),
//     action: rx.pipe(
//       source.data(0),
//       rx.do(writeValue('%$person/name%', 'hello')),
//       rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))), worker())),
//       rx.do(() => jb.ui.garbageCollectCtxDictionary(true,true)),
//       rx.flatMap(source.remote(source.promise(waitFor(equals(1, count(widget.headlessWidgets())))), worker())),
//       rx.timeoutLimit(1000, () => jb.logError('worker did not cleanup')),
//       rx.catchError()
//     ),
//     expectedResult: contains('hello')
//   })
// })

component('FETest.remoteWidget.infiniteScroll', {
  impl: uiFrontEndTest({
    control: remote.widget(
      itemlist({
        items: range(0, 10),
        controls: text('%%'),
        visualSizeLimit: '7',
        features: [
          css.height('100', 'scroll'),
          itemlist.infiniteScroll(),
          css.width('600')
        ]
      }),
      worker()
    ),
    action: runActions(uiAction.scrollBy('.jb-itemlist', 100), uiAction.waitForText('>8<')),
    expectedResult: contains('>8<'),
    renderDOM: true
  })
})

component('FETest.remoteWidget.infiniteScroll.MDInplace', {
  impl: uiFrontEndTest({
    control: remote.widget(
      group({
        controls: [
          table({
            items: '%$people%',
            controls: [
              group({
                layout: layout.flex({
                  direction: 'row',
                  justifyContent: 'start',
                  alignItems: 'center'
                }),
                controls: [
                  editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
                  text('%name%')
                ]
              }),
              controlWithCondition(
                '%$sectionExpanded/{%$index%}%',
                group({controls: text('inner text'), features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')})
              ),
              text('%age%'),
              text('%age%')
            ],
            visualSizeLimit: 2,
            features: [
              css.height('40', 'scroll'),
              itemlist.infiniteScroll(2)
            ],
            lineFeatures: [
              watchRef({ref: '%$sectionExpanded/{%$index%}%', allowSelfRefresh: true}),
              table.enableExpandToEndOfRow()
            ]
          })
        ],
        features: [
          watchable('sectionExpanded', obj()),
          variable(
            'people',
            [
              {
                name: 'Homer Simpson',
                age: 42,
                male: true
              },
              {
                name: 'Marge Simpson',
                age: 38,
                male: false
              },
              {
                name: 'Bart Simpson',
                age: 12,
                male: true
              }
            ]
          )
        ]
      }),
      worker()
    ),
    action: runActions(uiAction.scrollBy('.jb-itemlist', 100), delay(200), uiAction.click('i'), delay(200)),
    expectedResult: and(contains(['colspan=\"', 'inner text', 'Bart']), not(contains('>42<')), not(contains(['inner text', 'inner text']))),
    renderDOM: true
  })
})

component('FETest.remoteWidget.refresh', {
  impl: uiFrontEndTest({
    control: group({
      controls: remote.widget(text({text: '%$person1/name%', features: id('text1')}), worker()),
      features: [
        id('group1'),
        variable('person1', '%$person%'),
        watchRef('%$person/name%')
      ]
    }),
    action: runActions(
      uiAction.waitForSelector('#text1'),
      writeValue('%$person/name%', 'hello'),
      uiAction.waitForText('hello')
    ),
    expectedResult: contains('hello')
  })
})

component('remoteWidgetTest.FE.dialog', {
  impl: uiFrontEndTest({
    control: remote.widget(
      frontEnd.widget(
        button({title: 'click me', action: openDialog('hello', group()), style: button.native()})
      ),
      worker()
    ),
    action: uiAction.click(),
    expectedResult: contains('hello')
  })
})

component('remoteWidgetTest.FE.useBackEnd', {
  impl: uiFrontEndTest({
    control: remote.widget(
      group({
        controls: [
          text('%$var1%'),
          frontEnd.widget(
            button({
              title: 'click me',
              action: runInBECmpContext('%$frontEndCmpId%', writeValue('%$var1%', 'hello')),
              style: button.native()
            })
          )
        ],
        features: watchable('var1', 'Hi')
      }),
      worker()
    ),
    action: runActions(uiAction.click(), uiAction.waitForSelector('[cmp-ver=\"2\"]')),
    expectedResult: contains('hello')
  })
})
