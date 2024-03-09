using('ui-tests','workspace-core')

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
    control: group(text('%$var1%'), {
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
    control: group(text('%$obj1/txt%'), {
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
    control: group(text('%$items[1]/title%'), {
      features: watchable('items', asIs([{title: 'koo'}, {title: 'foo'}]))
    }),
    expectedResult: contains('foo')
  })
})

component('uiTest.watchableVarAsArrayOneItem', {
  impl: uiTest({
    control: group(text('%$items[0]/title%'), { features: watchable('items', asIs([{title: 'foo'}])) }),
    expectedResult: contains('foo')
  })
})


component('uiTest.watchableVarAsObjectNotInitialized', {
  impl: uiTest({
    control: group(text('%$obj1/txt%'), {
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
  impl: uiTest(text(typeAdapter('boolean<>', isOfType('string', '123'))), contains('true'))
})

component('uiTest.booleanNotReffableFalse', {
  impl: uiTest(text(typeAdapter('boolean<>', isOfType('string2', '123'))), contains('false'))
})

component('uiTest.labelWithWatchRefInSplicedArray', {
  impl: uiTest({
    control: group(text('%$personWithChildren/children[1]/name%'), {
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
  impl: uiTest({
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(
          If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/')
        )
      ]
    }),
    expectedResult: contains('color: green; /*css-only*/'),
    uiAction: writeValue('%$person/name%', 'Dan')
  })
})

component('uiTest.CssOnly.SetAndBack', {
  impl: uiTest({
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(
          If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/')
        )
      ]
    }),
    expectedResult: and(contains('color: red; /*css-only*/'), notContains('green')),
    uiAction: [
      writeValue('%$person/name%', 'Dan'),
      writeValue('%$person/name%', 'Homer Simpson')
    ]
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
    control: group(text('%$text1/text%'), {
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
    control: group(text('%$text1/text%'), {
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
    control: group(text(json.stringify('%$watchablePeople%'), { features: watchRef('%$watchablePeople%', 'yes') }), {
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
