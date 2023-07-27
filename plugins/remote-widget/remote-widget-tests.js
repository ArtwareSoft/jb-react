using('ui-tests')

// component('remoteWidgetTest.text', {
//   impl: uiTest({
//     control: remote.widget(text('hello world'), worker()),
//     uiAction: waitForNextUpdate(),
//     expectedResult: contains('hello world'),
//     timeout: 3000,
//   })
// })

component('remoteWidgetTest.text', {
  impl: uiTest({
    control: text('hello world'),
    expectedResult: contains('hello world'),
    timeout: 1000,
    backEndJbm: worker()
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
//     userInputRx: rx.pipe(source.promise(waitForSelector('button')), rx.map(userInput.click())),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('hello'),
//     timeout: 3000
//   })
// })

component('remoteWidgetTest.changeText2', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$fName%'),
        editableText({databind: '%$fName%'})
      ],
      features: watchable('fName', 'Dan')
    }),
    uiAction: setText({value: 'danny', doNotWaitForNextUpdate: true}),
    expectedResult: contains('danny'),
    timeout: 500,
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.changeText', {
  impl: uiFrontEndTest({
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind: '%$fName%'})
        ],
        features: watchable('fName', 'Dan')
      }),
      worker()
    ),
    uiAction: setText('danny'),
    expectedResult: contains('danny'),
    timeout: 1000
  })
})

component('remoteWidgetTest.group.wait', {
  impl: uiTest({
    control: group({
      controls: button('hello world'),
      features: group.wait(treeShake.getCodeFromRemote('sampleProject.main'))
    }),
    expectedResult: contains('hello world'),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.buttonClick', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$fName%'),
        button('change', writeValue('%$fName%', 'danny'))
      ],
      features: watchable('fName', 'Dan')
    }),
    uiAction: click(),
    expectedResult: contains('danny'),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.dialog', {
  impl: uiTest({
    control: button('open', openDialog('hello', group())),
    uiAction: uiActions(click(), waitForSelector('.jb-dialog')),
    expectedResult: contains('hello'),
    backEndJbm: worker()
  })
})

component('remoteWidgetTest.loadCodeManully', {
  impl: uiTest({
    control: group({
      controls: ctx => ctx.run({$: 'text', text: 'hello' }),
      features: group.wait(treeShake.getCodeFromRemote('text'))
    }),
    expectedResult: contains('hello'),
    backEndJbm: worker()
  })
})

component('FETest.distributedWidget', {
  impl: uiFrontEndTest({
    control: group({controls: [], features: css.class('xRoot')}),
    uiAction: uiActions(
      action(
        remote.distributedWidget({
          control: button('hello world'),
          backend: worker(),
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
  impl: uiFrontEndTest({
    control: group({controls: [], features: css.class('xRoot')}),
    action: uiActions(
      action(remote.distributedWidget({
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
      })),
      waitForSelector('input'),
      setText('danny'),
      keyboardEvent('input', 'keyup'),
      waitForSelector('[cmp-ver=\"2\"]')
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
    backEndJbm: worker(),
    uiAction: uiActions(click('.jb-itemlist', 'fetchNextPage'), waitForText('>8<')),
    expectedResult: contains('>8<'),
  })
})

// component('FETest.remoteWidget.infiniteScroll.MDInplace', {
//   impl: uiFrontEndTest({
//     control: remote.widget(
//       group({
//         controls: [
//           table({
//             items: '%$people%',
//             controls: [
//               group({
//                 layout: layout.flex({
//                   direction: 'row',
//                   justifyContent: 'start',
//                   alignItems: 'center'
//                 }),
//                 controls: [
//                   editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
//                   text('%name%')
//                 ]
//               }),
//               controlWithCondition(
//                 '%$sectionExpanded/{%$index%}%',
//                 group({controls: text('inner text'), features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')})
//               ),
//               text('%age%'),
//               text('%age%')
//             ],
//             visualSizeLimit: 2,
//             features: [
//               css.height('40', 'scroll'),
//               itemlist.infiniteScroll(2)
//             ],
//             lineFeatures: [
//               watchRef({ref: '%$sectionExpanded/{%$index%}%', allowSelfRefresh: true}),
//               table.enableExpandToEndOfRow()
//             ]
//           })
//         ],
//         features: [
//           watchable('sectionExpanded', obj()),
//           variable(
//             'people',
//             [
//               {
//                 name: 'Homer Simpson',
//                 age: 42,
//                 male: true
//               },
//               {
//                 name: 'Marge Simpson',
//                 age: 38,
//                 male: false
//               },
//               {
//                 name: 'Bart Simpson',
//                 age: 12,
//                 male: true
//               }
//             ]
//           )
//         ]
//       }),
//       worker()
//     ),
//     action: uiActions(scrollBy('.jb-itemlist', 100), delay(200), click('i'), delay(200)),
//     expectedResult: and(contains(['colspan=\"', 'inner text', 'Bart']), not(contains('>42<')), not(contains(['inner text', 'inner text']))),
//     renderDOM: true
//   })
// })

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
    action: uiActions(
      waitForSelector('#text1'),
      writeValue('%$person/name%', 'hello'),
      waitForText('hello')
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
    action: click(),
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
    action: uiActions(click(), waitForSelector('[cmp-ver=\"2\"]')),
    expectedResult: contains('hello')
  })
})
