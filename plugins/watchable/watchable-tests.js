using('ui-tests,tgp,workspace')

component('uiTest.checkBoxWithCalculatedAndWatchRef', {
  impl: uiTest({
    control: editableBoolean('%$person/name% == "Homer Simpson"', editableBoolean.checkboxWithLabel(), {
      title: '%$person/name%',
      features: watchRef('%$person/name%')
    }),
    expectedResult: contains('Mukki'),
    uiAction: writeValue('%$person/name%', 'Mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.booleanWatchableVarAsBooleanTrueToFalse', {
  impl: uiTest(text(If('%$person/male%', 'Error', 'OK'), { features: watchRef('%$person/male%') }), contains('OK'), {
    uiAction: writeValue('%$person/male%', false)
  })
})

component('uiTest.booleanWatchableVarAsBooleanFalseToTrue', {
  impl: uiTest(text(If('%$person/male%', 'OK', 'Error'), { features: watchRef('%$person/male%') }), contains('OK'), {
    runBefore: writeValue('%$person/male%', false),
    uiAction: writeValue('%$person/male%', true)
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
    expectedResult: contains('foo'),
    uiAction: waitForNextUpdate()
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
    expectedResult: contains('foo'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.watchableVarAsArray', {
  impl: uiTest({
    control: group({
      controls: text('%$items[1]/title%'),
      features: watchable('items', asIs([{title: 'koo'}, {title: 'foo'}]))
    }),
    expectedResult: contains('foo')
  })
})

component('uiTest.watchableVarAsArrayOneItem', {
  impl: uiTest({
    control: group({ controls: text('%$items[0]/title%'), features: watchable('items', asIs([{title: 'foo'}])) }),
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
    expectedResult: contains('foo'),
    uiAction: waitForNextUpdate()
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
  impl: uiTest(text(isOfType('string', '123')), contains('true'))
})

component('uiTest.booleanNotReffableFalse', {
  impl: uiTest(text(isOfType('string2', '123')), contains('false'))
})

component('uiTest.labelWithWatchRefInSplicedArray', {
  impl: uiTest({
    control: group({
      controls: text('%$personWithChildren/children[1]/name%'),
      features: followUp.action(splice('%$personWithChildren/children%', 0, { noOfItemsToRemove: 1 }))
    }),
    expectedResult: contains('Maggie'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.spliceAndSet', {
  impl: uiTest({
    control: text('%$personWithChildren/children[1]/name%', {
      features: watchRef('%$personWithChildren/children%')
    }),
    expectedResult: contains('hello'),
    uiAction: action(
      runActions(
        splice('%$personWithChildren/children%', 0, { noOfItemsToRemove: 1 }),
        writeValue('%$personWithChildren/children[1]/name%', 'hello')
      )
    )
  })
})

component('uiTest.labelNotWatchingUiVar', {
  impl: uiTest({
    control: text('%$text1/text%', {
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
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    uiAction: writeValue('%$person/name%', 'Dan'),
    expectedResult: ctx => Array.from(document.querySelectorAll('style')).map(el=>el.innerText).filter(x=>x.indexOf('color: green; /*css-only*/') != -1)[0]
  })
})

component('uiTest.CssOnly.SetAndBack', {
  impl: uiFrontEndTest({
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    uiAction: [
      writeValue('%$person/name%', 'Dan'),
      writeValue('%$person/name%', 'Homer Simpson')
    ],
    expectedResult: ctx => Array.from(document.querySelectorAll('style')).map(el=>el.innerText).filter(x=>x.indexOf('color: red; /*css-only*/') != -1)[0]
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
        variable('text1', obj(prop('text', 'OK'))),
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
    expectedResult: contains('changed'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.watchRefArrayDeleteWithRunActionOnItems', {
  impl: uiTest({
    control: group({
      controls: text(json.stringify('%$watchablePeople%'), { features: watchRef('%$watchablePeople%', 'yes') }),
      features: followUp.action(
        runActionOnItems('%$watchablePeople%', splice('%$watchablePeople%', indexOf('%$watchablePeople%', '%%'), {
          noOfItemsToRemove: '1',
          itemsToAdd: []
        }))
      )
    }),
    expectedResult: contains('[]'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element !check': 3}
  })
})

component('uiTest.watchableAsText', {
  impl: uiFrontEndTest({
    control: group({
      vars: [
        Var('watchedText', tgpTextEditor.watchableAsText('%$watchablePeople%'))
      ],
      controls: [
        editableText({
          databind: '%$watchedText%',
          style: editableText.textarea(30, 80),
          features: [
            id('editor'),
            feature.onKey('Alt-P', writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%'))),
            textarea.initTgpTextEditor(),
            watchRef('%$watchablePeople%', 'yes')
          ]
        }),
        button('show path of cursor', writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%')), {
          features: [
            id('show-path'),
            textarea.enrichUserEvent('#editor')
          ]
        }),
        button('change name', writeValue('%$watchablePeople[1]/name%', 'mukki'), {
          features: id('change-name')
        }),
        text('%$path%')
      ],
      features: [id('group'), watchable('path')]
    }),
    uiAction: uiActions(
      waitFor(ctx => jb.ui.cmpOfSelector('#editor',ctx)),
      action(runFEMethod('#editor', 'setSelectionRange', { data: {'$': 'object', from: 22} })),
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
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$watchablePeople%', 'hello'),
    uiAction: setText('hello', '#editor', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableAsTextWriteObjectInArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$watchablePeople/0/a%', '3'),
    uiAction: setText('[{a:3}]', '#editor', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableAsTextWriteSetObjectToArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$emptyArray%'),
      style: editableText.textarea(30, 80),
      features: [
        id('editor'),
        watchRef('%$watchablePeople%', { allowSelfRefresh: true })
      ]
    }),
    expectedResult: equals('%$emptyArray/0/a%', '3'),
    uiAction: setText('[{a:3}]', '#editor', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableObjectToPrimitiveBug', {
  impl: uiTest(text('%$person%'), contains('hello'), {
    uiAction: uiActions(writeValue('%$person%', 'world'), writeValue('%$person%', 'hello'))
  })
})

component('uiTest.spliceShouldNotFireFullContainerChange', {
  impl: uiTest(itemlist({ items: '%$watchablePeople%', controls: text('%name%') }), not(contains('mukki')), {
    uiAction: action(addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) })),
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
    expectedResult: contains('mukki'),
    uiAction: action(addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) })),
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
    expectedResult: contains('mukki'),
    uiAction: writeValue('%$watchablePeople[0]/name%', 'mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

component('uiTest.frontEnd.onDestroy', {
  impl: uiFrontEndTest({
    vars: [Var('res', obj())],
    control: group({
      controls: controlWithCondition({
        condition: '%$person/name%!=mukki',
        control: text('hello', { features: frontEnd.onDestroy(writeValue('%$res/destroyed%', 'ya')) })
      }),
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
    expectedResult: contains('kukki'),
    uiAction: action(
      runActions(
        addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) }),
        addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'kukki')) })
      )
    ),
    expectedCounters: {'do refresh element !check': 2}
  })
})

component('uiTest.refProp', {
  impl: dataTest('%$person/name%', equals('Dan'), {
    runBefore: writeValue(pipeline(obj(refProp('personName', '%$person/name%')), '%personName%'), 'Dan')
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
