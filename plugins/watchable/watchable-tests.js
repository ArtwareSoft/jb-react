using('ui-tests','workspace-core','testing')

component('watchableTest.property', {
  impl: dataTest(property('name', '%$person%'), equals('Homer Simpson'))
})

component('watchableResource1', { watchableData: 'hey' })
component('watchableTest.stringResource', {
  impl: dataTest('%$watchableResource1%', equals('foo'), {
    runBefore: writeValue('%$watchableResource1%', 'foo')
  })
})

component('watchableTest.createNewResourceAndWrite', {
  impl: dataTest('%$zzz/a%', equals(5), {
    runBefore: runActions(ctx => component('zzz',{watchableData: {}}), writeValue('%$zzz%', () => ({a: 5})))
  })
})

component('watchableTest.checkBoxWithCalculatedAndWatchRef', {
  impl: uiTest({
    control: editableBoolean('%$person/name% == "Homer Simpson"', editableBoolean.checkboxWithLabel(), {
      title: '%$person/name%',
      features: watchRef('%$person/name%')
    }),
    expectedResult: contains('Mukki'),
    uiAction: writeValue('%$person/name%', 'Mukki'),
    expectedCounters: {'do refresh element': 1}
  })
})

component('watchableTest.booleanWatchableVarAsBooleanTrueToFalse', {
  impl: uiTest(text(If('%$person/male%', 'Error', 'OK'), { features: watchRef('%$person/male%') }), contains('OK'), {
    uiAction: writeValue('%$person/male%', false)
  })
})

component('watchableTest.booleanWatchableVarAsBooleanFalseToTrue', {
  impl: uiTest(text(If('%$person/male%', 'OK', 'Error'), { features: watchRef('%$person/male%') }), contains('OK'), {
    runBefore: writeValue('%$person/male%', false),
    uiAction: writeValue('%$person/male%', true)
  })
})

component('watchableTest.Var', {
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

component('watchableTest.VarAsObject', {
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

component('watchableTest.VarAsArray', {
  impl: uiTest({
    control: group(text('%$items[1]/title%'), {
      features: watchable('items', asIs([{title: 'koo'}, {title: 'foo'}]))
    }),
    expectedResult: contains('foo')
  })
})

component('watchableTest.VarAsArrayOneItem', {
  impl: uiTest({
    control: group(text('%$items[0]/title%'), { features: watchable('items', asIs([{title: 'foo'}])) }),
    expectedResult: contains('foo')
  })
})


component('watchableTest.VarAsObjectNotInitialized', {
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

// component('watchableTest.calculatedVar', {
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

// component('watchableTest.calculatedVarCyclic', {
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

component('watchableTest.booleanNotReffableTrue', {
  impl: uiTest(text(isOfType('string', '123')), contains('true'))
})

component('watchableTest.booleanNotReffableFalse', {
  impl: uiTest(text(isOfType('string2', '123')), contains('false'))
})

component('watchableTest.labelWithWatchRefInSplicedArray', {
  impl: uiTest({
    control: group(text('%$personWithChildren/children[1]/name%'), {
      features: followUp.action(splice('%$personWithChildren/children%', 0, { noOfItemsToRemove: 1 }))
    }),
    expectedResult: contains('Maggie'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element': 1}
  })
})

component('watchableTest.spliceAndSet', {
  impl: uiTest({
    control: text('%$personWithChildren/children[1]/name%', {
      features: watchRef('%$personWithChildren/children%')
    }),
    expectedResult: contains('hello'),
    uiAction: action(runActions(
      splice('%$personWithChildren/children%', 0, { noOfItemsToRemove: 1 }),
      writeValue('%$personWithChildren/children[1]/name%', 'hello')
    ))
  })
})

component('watchableTest.labelNotWatchingUiVar', {
  impl: uiTest({
    control: text('%$text1/text%', {
      features: [
        variable('text1', obj(prop('text', 'OK'))),
        followUp.action(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element': 0}
  })
})

component('watchableTest.labelNotWatchingBasicVar', {
  impl: uiTest({
    control: text({
      vars: [
        Var('text1', obj(prop('text', 'OK')))
      ],
      text: '%$text1/text%',
      features: followUp.action(writeValue('%$text1/text%', 'not good'))
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element': 0}
  })
})

component('watchableTest.watchRefCssOnly', {
  impl: uiTest({
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    expectedResult: contains('color: green; /*css-only*/'),
    uiAction: writeValue('%$person/name%', 'Dan')
  })
})

component('watchableTest.CssOnly.setAndBack', {
  impl: uiTest({
    control: text('hey', {
      features: [
        watchRef('%$person/name%', { cssOnly: true }),
        css(If('%$person/name% == Homer Simpson', 'color: red; /*css-only*/', 'color: green; /*css-only*/'))
      ]
    }),
    expectedResult: and(contains('color: red; /*css-only*/'), notContains('green')),
    uiAction: [
      writeValue('%$person/name%', 'Dan'),
      writeValue('%$person/name%', 'Homer Simpson')
    ]
  })
})

component('watchableTest.groupWatchingWithoutIncludeChildren', {
  impl: uiTest({
    control: group(text('%$text1/text%'), {
      features: [
        variable('text1', obj(prop('text', 'OK'))),
        watchRef('%$text1%'),
        followUp.action(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element': 0}
  })
})

// jb.component('watchableTest.groupWatchingWithIncludeChildren', {
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
//     expectedCounters: {'do refresh element': 1}
//   })
// })

component('watchableTest.groupWatchingStructure', {
  impl: uiTest({
    control: group(text('%$text1/text%'), {
      features: [
        watchable('text1', obj(prop('text', 'OK'))),
        watchRef('%$text1%', { includeChildren: 'structure' }),
        followUp.action(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedResult: contains('changed'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element': 1}
  })
})

component('watchableTest.watchRefArrayDeleteWithRunActionOnItems', {
  impl: uiTest({
    control: group({
      controls: text(json.stringify('%$watchablePeople%'), {
        features: watchRef('%$watchablePeople%', { includeChildren: 'yes' })
      }),
      features: followUp.action(runActionOnItems('%$watchablePeople%', splice('%$watchablePeople%', indexOf('%$watchablePeople%', '%%'), {
        noOfItemsToRemove: '1',
        itemsToAdd: []
      })))
    }),
    expectedResult: contains('[]'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'do refresh element': 3}
  })
})

component('watchableTest.ObjectToPrimitiveBug', {
  impl: uiTest(text('%$person%'), contains('hello'), {
    uiAction: uiActions(writeValue('%$person%', 'world'), writeValue('%$person%', 'hello'))
  })
})

component('watchableTest.spliceShouldNotFireFullContainerChange', {
  impl: uiTest(itemlist({ items: '%$watchablePeople%', controls: text('%name%') }), not(contains('mukki')), {
    uiAction: action(addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) })),
    expectedCounters: {'do refresh element': 0}
  })
})

component('watchableTest.spliceAndWatchRefStrcture', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', 'structure')
    }),
    expectedResult: contains('mukki'),
    uiAction: action(addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) })),
    expectedCounters: {'do refresh element': 1}
  })
})


component('watchableTest.spliceAndWatchRefWithoutIncludeChildren', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', 'no')
    }),
    expectedResult: contains('mukki'),
    uiAction: writeValue('%$watchablePeople[0]/name%', 'mukki'),
    expectedCounters: {'do refresh element': 1}
  })
})

component('watchableTest.spliceAndWatchRefAddTwice', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef('%$watchablePeople%', { includeChildren: 'structure' })
    }),
    expectedResult: contains('kukki'),
    uiAction: action(runActions(
      addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'mukki')) }),
      addToArray('%$watchablePeople%', { toAdd: obj(prop('name', 'kukki')) })
    )),
    expectedCounters: {'do refresh element': 2}
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

component('watchableTest.docAsParam', {
  params: [
    {id: 'doc', as: 'ref', defaultValue: '%$watchablePeople%'}
  ],
  impl: group(
    itemlist({
      items: '%$doc%',
      controls: text('%$index%-%name%'),
      features: watchRef('%$doc%', { includeChildren: 'structure' })
    }),
    button('add', addToArray('%$doc%', { toAdd: obj(prop('name', 'mukki')) }))
  )
})
component('watchableTest.docParam', {
  impl: uiTest(watchableTest.docAsParam(), contains('mukki'), { uiAction: click(), expectedCounters: {'do refresh element': 1} })
})
