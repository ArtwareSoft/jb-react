using('ui-tests,tgp,workspace')

component('uiTest.checkBoxWithCalculatedAndWatchRef', {
  impl: uiFrontEndTest({
    control: editableBoolean({
      databind: '%$person/name% == \"Homer Simpson\"',
      style: editableBoolean.checkboxWithLabel(),
      title: '%$person/name%',
      features: watchRef('%$person/name%')
    }),
    action: writeValue('%$person/name%', 'Mukki'),
    expectedResult: contains('Mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.booleanWatchableVarAsBooleanTrueToFalse', {
  impl: uiTest({
    control: text({text: data.if('%$person/male%', 'Error', 'OK'), features: watchRef('%$person/male%')}),
    uiAction: writeValue('%$person/male%', false),
    expectedResult: contains('OK')
  })
})

component('uiTest.booleanWatchableVarAsBooleanFalseToTrue', {
  impl: uiTest({
    control: text({text: data.if('%$person/male%', 'OK', 'Error'), features: watchRef('%$person/male%')}),
    runBefore: writeValue({to: '%$person/male%', value: false}),
    uiAction: writeValue('%$person/male%', true),
    expectedResult: contains('OK')
  })
})

component('uiTest.watchableVar', {
  impl: uiTest({
    control: group({
      controls: text('%$var1%'),
      features: [
        watchable('var1', 'hello'),
        followUp.action(writeValue('%$var1%', 'foo'))
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('foo')
  })
})

component('uiTest.watchableVarAsObject', {
  impl: uiTest({
    control: group({
      controls: text('%$obj1/txt%'),
      features: [
        watchable('obj1', obj(prop('txt', 'hello'))),
        followUp.action(writeValue('%$obj1/txt%', 'foo'))
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('foo')
  })
})

component('uiTest.watchableVarAsArray', {
  impl: uiTest({
    control: group({
      controls: text('%$items[1]/title%'),
      features: watchable('items',asIs([{title: 'koo'}, {title: 'foo'}])),
    }),
    expectedResult: contains('foo')
  })
})

component('uiTest.watchableVarAsArrayOneItem', {
  impl: uiTest({
    control: group({
      controls: text('%$items[0]/title%'),
      features: watchable('items', asIs([{title: 'foo'}]))
    }),
    expectedResult: contains('foo')
  })
})


component('uiTest.watchableVarAsObjectNotInitialized', {
  impl: uiTest({
    control: group({
      controls: text('%$obj1/txt%'),
      features: [
        watchable('obj1', obj()),
        followUp.action(writeValue('%$obj1/txt%', 'foo'))
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('foo')
  })
})

// component('uiTest.calculatedVar', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         editableText({databind: '%$var1%', features: id('var1')}),
//         editableText({databind: '%$var2%'}),
//         text('%$var3%')
//       ],
//       features: [
//         id('group'),
//         watchable('var1', 'hello'),
//         watchable('var2','world'),
//         calculatedVar({
//           name: 'var3',
//           value: '%$var1% %$var2%',
//           watchRefs: list('%$var1%', '%$var2%')
//         })
//       ]
//     }),
//     userInputRx: rx.pipe(source.promise(waitForCompReady('#group')), rx.map(userInput.setText('hi', '#var1'))),
//     expectedResult: contains('hi world')
//   })
// })

// component('uiTest.calculatedVarCyclic', {
//   impl: uiTest({
//     allowError: true,
//     control: group({
//       controls: [
//         editableText({databind: '%$var1%', features: id('var1')}),
//         editableText({databind: '%$var2%'}),
//         text('%$var3%')
//       ],
//       features: [
//         id('group'),
//         calculatedVar({name: 'var1', value: 'xx%$var3%', watchRefs: '%$var3%'}),
//         watchable('var2','world'),
//         calculatedVar({
//           name: 'var3',
//           value: '%$var1% %$var2%',
//           watchRefs: list('%$var1%', '%$var2%')
//         })
//       ]
//     }),
//     userInputRx: rx.pipe(source.promise(waitForCompReady('#group')), rx.map(userInput.setText('hi', '#var1'))),
//     expectedResult: contains('hi world')
//   })
// })

component('uiTest.booleanNotReffableTrue', {
  impl: uiTest({
    control: text({text: isOfType('string', '123')}),
    expectedResult: contains('true')
  })
})

component('uiTest.booleanNotReffableFalse', {
  impl: uiTest({
    control: text({text: isOfType('string2', '123')}),
    expectedResult: contains('false')
  })
})

component('uiTest.labelWithWatchRefInSplicedArray', {
  impl: uiTest({
    control: group({
      controls: text('%$personWithChildren/children[1]/name%'),
      features: followUp.action(splice({array: '%$personWithChildren/children%', fromIndex: 0, noOfItemsToRemove: 1}))
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('Maggie'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.spliceAndSet', {
  impl: uiTest({
    control: text({
      text: '%$personWithChildren/children[1]/name%',
      features: watchRef('%$personWithChildren/children%')
    }),
    uiAction: action(runActions(
      splice({
        array: '%$personWithChildren/children%',
        fromIndex: 0,
        noOfItemsToRemove: 1
      }),
      writeValue('%$personWithChildren/children[1]/name%', 'hello')
    )),
    expectedResult: contains('hello')
  })
})

component('uiTest.labelNotWatchingUiVar', {
  impl: uiTest({
    control: text({
      text: '%$text1/text%',
      features: [
        variable('text1', obj(prop('text', 'OK'))),
        followUp.action(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element !check': 0}
  })
})

component('uiTest.labelNotWatchingBasicVar', {
  impl: uiTest({
    control: text({
      vars: [
        Var('text1', obj(prop('text', 'OK')))
      ],
      text: '%$text1/text%',
      features: followUp.action(writeValue('%$text1/text%', 'not good'))
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element !check': 0}
  })
})

component('uiTest.watchRefCssOnly', {
  impl: uiFrontEndTest({
    control: text({
      text: 'hey',
      features: [
        watchRef({ref: '%$person/name%', cssOnly: true}),
        css(If('%$person/name% == Homer Simpson','color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    action: writeValue('%$person/name%','Dan'),
    expectedResult: ctx => Array.from(document.querySelectorAll('style')).map(el=>el.innerText).filter(x=>x.indexOf('color: green; /*css-only*/') != -1)[0],
  })
})

component('uiTest.CssOnly.SetAndBack', {
  impl: uiFrontEndTest({
    control: text({
      text: 'hey',
      features: [
        watchRef({ref: '%$person/name%', cssOnly: true}),
        css(If('%$person/name% == Homer Simpson','color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    action: [
      writeValue('%$person/name%','Dan'),
      writeValue('%$person/name%','Homer Simpson'),
    ],
    expectedResult: ctx => Array.from(document.querySelectorAll('style')).map(el=>el.innerText).filter(x=>x.indexOf('color: red; /*css-only*/') != -1)[0],
  })
})

// jb.component('uiTest.watchRefPhase', {
//   impl: uiTest({
//     vars: Var('arr', () => []),
//     control: group({
//       controls: [
//         text({
//           text: (ctx,{arr}) => { arr.push(1); return 'hey' },
//           features: watchRef({ref: '%$person/name%', phase: 20}),
//         }),
//         text({
//           text: (ctx,{arr}) => { arr.push(2); return 'hey' },
//           features: watchRef({ref: '%$person/name%', phase: 5}),
//         }),
//       ]
//     }),
//     action: writeValue('%$person/name%','Dan'),
//     expectedResult: (ctx,{arr}) => arr.join(',') == '1,2,2,1',
//   })
// })

component('uiTest.groupWatchingWithoutIncludeChildren', {
  impl: uiTest({
    control: group({
      controls: text('%$text1/text%'),
      features: [
        variable({name: 'text1', value: obj(prop('text', 'OK'))}),
        watchRef('%$text1%'),
        followUp.action(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element !check': 0}
  })
})

// jb.component('uiTest.groupWatchingWithIncludeChildren', {
//   impl: uiFrontEndTest({
//     control: group({
//       controls: text('%$text1/text%'),
//       features: [
//         watchable('text1', obj(prop('text', 'OK'))),
//         watchRef({ref: '%$text1%', includeChildren: 'yes'}),
//         followUp.action(writeValue('%$text1/text%', 'changed'))
//       ]
//     }),
//     expectedResult: contains('changed'),
//     expectedCounters: {'do refresh element !check': 1}
//   })
// })

component('uiTest.groupWatchingStructure', {
  impl: uiTest({
    control: group({
      controls: text('%$text1/text%'),
      features: [
        watchable('text1', obj(prop('text', 'OK'))),
        watchRef('%$text1%', 'structure'),
        followUp.action(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('changed'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.watchRefArrayDeleteWithRunActionOnItems', {
  impl: uiTest({
    control: group({
      controls: text({text: json.stringify('%$watchablePeople%'), features: watchRef('%$watchablePeople%', 'yes')}),
      features: followUp.action(
        runActionOnItems(
          '%$watchablePeople%',
          splice({
            array: '%$watchablePeople%',
            fromIndex: indexOf('%$watchablePeople%', '%%'),
            noOfItemsToRemove: '1',
            itemsToAdd: []
          })
        )
      )
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('[]'),
    expectedCounters: {'do refresh element !check': 3}
  })
})

component('uiTest.watchableAsText', {
  impl: uiFrontEndTest({
    //renderDOM: true,
    control: group({
      vars: Var('watchedText', tgpTextEditor.watchableAsText('%$watchablePeople%')),
      controls: [
        editableText({
          databind: '%$watchedText%',
          style: editableText.textarea({rows: 30, cols: 80}),
          features: [
            id('editor'),
            feature.onKey(
              'Alt-P',
              writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%'))
            ),
            textarea.initTgpTextEditor(),
            watchRef({ ref: '%$watchablePeople%', includeChildren: 'yes'})
          ]
        }),
        button({
          title: 'show path of cursor',
          action: writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%')),
          features: [
            id('show-path'),
            textarea.enrichUserEvent('#editor'),
          ]
        }),
        button({
          title: 'change name',
          action: writeValue('%$watchablePeople[1]/name%', 'mukki'),
          features: id('change-name')
        }),
        text('%$path%')
      ],
      features: [
        id('group'),
        watchable('path')
      ]
    }),
    action: uiActions(
      waitFor(ctx => jb.ui.cmpOfSelector('#editor',ctx) ),
      action(runFEMethod({ selector: '#editor', method: 'setSelectionRange', data: {$: 'object', from: 22} })),
      click('#show-path')
    ),
    expectedResult: contains('watchablePeople~0~name~!value')
  })
})

component('uiTest.watchableAsTextWrite', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef({ref: '%$watchablePeople%', allowSelfRefresh: true})
      ]
    }),
    uiAction: setText({value: 'hello', selector: '#editor', doNotWaitForNextUpdate: true}),
    expectedResult: equals('%$watchablePeople%', 'hello')
  })
})

component('uiTest.watchableAsTextWriteObjectInArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef({ref: '%$watchablePeople%', allowSelfRefresh: true})
      ]
    }),
    uiAction: setText({value: '[{a:3}]', selector: '#editor', doNotWaitForNextUpdate: true}),
    expectedResult: equals('%$watchablePeople/0/a%', '3')
  })
})

component('uiTest.watchableAsTextWriteSetObjectToArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$emptyArray%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef({ref: '%$watchablePeople%', allowSelfRefresh: true})
      ]
    }),
    uiAction: setText({value: '[{a:3}]', selector: '#editor', doNotWaitForNextUpdate: true}),
    expectedResult: equals('%$emptyArray/0/a%', '3')
  })
})

component('uiTest.watchableObjectToPrimitiveBug', {
  impl: uiTest({
    control: text('%$person%'),
    uiAction: uiActions(writeValue('%$person%', 'world'), writeValue('%$person%', 'hello')),
    expectedResult: contains('hello')
  })
})

component('uiTest.spliceShouldNotFireFullContainerChange', {
  impl: uiTest({
    control: itemlist({items: '%$watchablePeople%', controls: text('%name%')}),
    uiAction: action(addToArray('%$watchablePeople%', obj(prop('name', 'mukki')))),
    expectedResult: not(contains('mukki')),
    expectedCounters: {'do refresh element !check': 0}
  })
})

component('uiTest.spliceAndWatchRefStrcture', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', 'structure')
    }),
    uiAction: action(addToArray('%$watchablePeople%', obj(prop('name', 'mukki')))),
    expectedResult: contains('mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.spliceAndWatchRefWithoutIncludeChildren', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', 'no')
    }),
    uiAction: writeValue('%$watchablePeople[0]/name%', 'mukki'),
    expectedResult: contains('mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.frontEnd.onDestroy', {
  impl: uiFrontEndTest({
    vars: [Var('res', obj())],
    control: group({
      controls: controlWithCondition(
        '%$person/name%!=mukki',
        text({text: 'hello', features: frontEnd.onDestroy(writeValue('%$res/destroyed%', 'ya'))})
      ),
      features: watchRef('%$person/name%')
    }),
    uiAction: writeValue('%$person/name%', 'mukki'),
    expectedResult: equals('%$res/destroyed%', 'ya')
  })
})

component('uiTest.spliceAndWatchRefAddTwice', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', 'structure')
    }),
    uiAction: action(
      runActions(
        addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
        addToArray('%$watchablePeople%', obj(prop('name', 'kukki')))
      )
    ),
    expectedResult: contains('kukki'),
    expectedCounters: {'do refresh element !check': 2}
  })
})

component('uiTest.refProp', {
  impl: dataTest({
    runBefore: writeValue(pipeline(
      obj(refProp('personName','%$person/name%')),
      '%personName%'
      ),'Dan'),
    calculate: '%$person/name%',
    expectedResult: equals('Dan')
  })
})

// jb.component('ui-test.serialize-ctx-of-vdom', {
//   impl: dataTest({
//     calculate: ctx => {
//       const vdom = ctx.setVar('a',{x: 10}).run(text('hello from worker')).renderVdom()
//       const store = jb.ui.serializeCtxOfVdom(vdom)
//       const restored = jb.ui.deserializeCtxStore(store)
//       return restored.ctx[29].vars.a.x
//     },
//     expectedResult: equals(10)
//   })
// })