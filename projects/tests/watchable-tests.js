// jb.ns('remote')

jb.component('uiTest.checkBoxWithCalculatedAndWatchRef', {
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

jb.component('uiTest.booleanWatchableVarAsBooleanTrueToFalse', {
  impl: uiFrontEndTest({
    control: text({
      text: data.if('%$person/male%', 'Error', 'OK'),
      features: watchRef('%$person/male%')
    }),
    action: writeValue('%$person/male%', false),
    expectedResult: contains('OK')
  })
})

jb.component('uiTest.booleanWatchableVarAsBooleanFalseToTrue', {
  impl: uiFrontEndTest({
    control: text({
      text: data.if('%$person/male%', 'OK', 'Error'),
      features: watchRef('%$person/male%')
    }),
    runBefore: writeValue('%$person/male%', false),
    action: writeValue('%$person/male%', true),
    expectedResult: contains('OK')
  })
})

jb.component('uiTest.watchableVar', {
  impl: uiTest({
    control: group({
      controls: text('%$var1%'),
      features: [
        watchable('var1', 'hello'),
        followUp.action(writeValue('%$var1%', 'foo'))
      ]
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.watchableVarAsObject', {
  impl: uiTest({
    control: group({
      controls: text('%$obj1/txt%'),
      features: [
        watchable('obj1', {'$': 'object', txt: 'hello'}),
        followUp.action(writeValue('%$obj1/txt%', 'foo'))
      ]
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.watchableVarAsArray', {
  impl: uiTest({
    control: group({
      controls: text('%$items[1]/title%'),
      features: watchable('items',asIs([{title: 'koo'}, {title: 'foo'}])),
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.watchableVarAsArrayOneItem', {
  impl: uiTest({
    control: group({
      controls: text('%$items[0]/title%'),
      features: watchable('items', asIs([{title: 'foo'}]))
    }),
    expectedResult: contains('foo')
  })
})


jb.component('uiTest.watchableVarAsObjectNotInitialized', {
  impl: uiTest({
    control: group({
      controls: text('%$obj1/txt%'),
      features: [
        watchable('obj1', {'$': 'object'}),
        followUp.action(writeValue('%$obj1/txt%', 'foo'))
      ]
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.calculatedVar', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({databind: '%$var1%', features: id('var1')}),
        editableText({databind: '%$var2%'}),
        text('%$var3%')
      ],
      features: [
        id('group'),
        watchable('var1', 'hello'),
        watchable('var2','world'),
        calculatedVar({
          name: 'var3',
          value: '%$var1% %$var2%',
          watchRefs: list('%$var1%', '%$var2%')
        })
      ]
    }),
    userInputRx: rx.pipe(source.promise(uiAction.waitForCompReady('#group')), rx.map(userInput.setText('hi', '#var1'))),
    expectedResult: contains('hi world')
  })
})

jb.component('uiTest.calculatedVarCyclic', {
  impl: uiTest({
    allowError: true,
    control: group({
      controls: [
        editableText({databind: '%$var1%', features: id('var1')}),
        editableText({databind: '%$var2%'}),
        text('%$var3%')
      ],
      features: [
        id('group'),
        calculatedVar({name: 'var1', value: 'xx%$var3%', watchRefs: '%$var3%'}),
        watchable('var2','world'),
        calculatedVar({
          name: 'var3',
          value: '%$var1% %$var2%',
          watchRefs: list('%$var1%', '%$var2%')
        })
      ]
    }),
    userInputRx: rx.pipe(source.promise(uiAction.waitForCompReady('#group')), rx.map(userInput.setText('hi', '#var1'))),
    expectedResult: contains('hi world')
  })
})

jb.component('uiTest.booleanNotReffableTrue', {
  impl: uiTest({
    control: text({text: isOfType('string', '123')}),
    expectedResult: contains('true')
  })
})

jb.component('uiTest.booleanNotReffableFalse', {
  impl: uiTest({
    control: text({text: isOfType('string2', '123')}),
    expectedResult: contains('false')
  })
})

jb.component('uiTest.labelWithWatchRefInSplicedArray', {
  impl: uiTest({
    control: group({
      controls: text('%$personWithChildren/children[1]/name%'),
      features: followUp.action(splice({
        array: '%$personWithChildren/children%',
        fromIndex: 0,
        noOfItemsToRemove: 1
      }))
    }),
    expectedResult: contains('Maggie'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

jb.component('uiTest.spliceAndSet', {
  impl: uiFrontEndTest({
    control: text({
      text: '%$personWithChildren/children[1]/name%',
      features: watchRef('%$personWithChildren/children%')
    }),
    action: [
      splice({
        array: '%$personWithChildren/children%',
        fromIndex: 0,
        noOfItemsToRemove: 1
      }),
      writeValue('%$personWithChildren/children[1]/name%', 'hello')
    ],
    expectedResult: contains('hello')
  })
})

jb.component('uiTest.labelNotWatchingUiVar', {
  impl: uiTest({
    control: text({
      text: '%$text1/text%',
      features: [
        variable({name: 'text1', value: obj(prop('text', 'OK'))}),
        followUp.action(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element !check': 0}
  })
})

jb.component('uiTest.labelNotWatchingBasicVar', {
  impl: uiTest({
    control: text({
      vars: [Var('text1', obj(prop('text', 'OK')))],
      text: '%$text1/text%',
      features: [followUp.action(writeValue('%$text1/text%', 'not good'))]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {'do refresh element !check': 0}
  })
})

jb.component('uiTest.watchRefCssOnly', {
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

jb.component('uiTest.CssOnly.SetAndBack', {
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

jb.component('uiTest.groupWatchingWithoutIncludeChildren', {
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

jb.component('uiTest.groupWatchingStructure', {
  impl: uiTest({
    control: group({
      controls: text('%$text1/text%'),
      features: [
        watchable('text1', obj(prop('text', 'OK'))),
        watchRef({ref: '%$text1%', includeChildren: 'structure'}),
        followUp.action(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedResult: contains('changed'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

jb.component('uiTest.watchRefArrayDeleteWithRunActionOnItems', {
  impl: uiTest({
    control: group({
      controls: text({
        text: json.stringify('%$watchablePeople%'),
        features: watchRef({ref: '%$watchablePeople%', includeChildren: 'yes'})
      }),
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
    expectedResult: contains('[]'),
    expectedCounters: {'do refresh element !check': 3}
  })
})

jb.component('uiTest.watchableAsText', {
  impl: uiFrontEndTest({
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
            textarea.initTextareaEditor(),
            watchRef({ ref: '%$watchablePeople%', includeChildren: 'yes'})
          ]
        }),
        button({
          title: 'show path of cursor',
          action: writeValue('%$path%', tgpTextEditor.cursorPath('%$watchedText%')),
          features: [
            id('show-path'),
            tgpTextEditor.enrichUserEvent('#editor'),
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
    action: runActions(
      ctx => jb.ui.cmpOfSelector('#editor',ctx).runFEMethod('setSelectionRange',{line: 2, col: 20}),
      uiAction.click('#show-path')
    ),
    expectedResult: contains('watchablePeople~0~name~!value')
  })
})

jb.component('uiTest.watchableAsTextWrite', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: [id('editor'), watchRef({ ref: '%$watchablePeople%', allowSelfRefresh: true})],
    }),
    userInput: userInput.setText('hello', '#editor'),
    expectedResult: equals('%$watchablePeople%', 'hello')
  })
})

jb.component('uiTest.watchableAsTextWriteObjectInArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$watchablePeople%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: [id('editor'), watchRef({ ref: '%$watchablePeople%', allowSelfRefresh: true})],
    }),
    userInput: userInput.setText('[{a:3}]', '#editor'),
    expectedResult: equals('%$watchablePeople/0/a%', '3')
  })
})

jb.component('uiTest.watchableAsTextWriteSetObjectToArray', {
  impl: uiTest({
    control: editableText({
      databind: tgpTextEditor.watchableAsText('%$emptyArray%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: [id('editor'), watchRef({ ref: '%$watchablePeople%', allowSelfRefresh: true})],
    }),
    userInput: userInput.setText('[{a:3}]', '#editor'),
    checkResultRx: rx.pipe(source.data(0),rx.delay(1)),
    expectedResult: equals('%$emptyArray/0/a%', '3')
  })
})

jb.component('uiTest.watchableObjectToPrimitiveBug', {
  impl: uiFrontEndTest({
    control: text('%$person%'),
    action: runActions(writeValue('%$person%', 'world'), writeValue('%$person%', 'hello')),
    expectedResult: contains('hello')
  })
})

jb.component('uiTest.spliceShouldNotFireFullContainerChange', {
  impl: uiFrontEndTest({
    control: itemlist({items: '%$watchablePeople%', controls: text('%name%')}),
    action: addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
    expectedResult: not(contains('mukki')),
    expectedCounters: {'do refresh element !check': 0}
  })
})

jb.component('uiTest.spliceAndWatchRefStrcture', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'structure'})
    }),
    action: addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
    expectedResult: contains('mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

jb.component('uiTest.spliceAndWatchRefWithoutIncludeChildren', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'no'})
    }),
    action: writeValue('%$watchablePeople[0]/name%', 'mukki'),
    expectedResult: contains('mukki'),
    expectedCounters: {'do refresh element !check': 1}
  })
})

jb.component('uiTest.frontEnd.onDestroy', {
  impl: uiFrontEndTest({
    vars: Var('res',obj()),
    control: group({
      controls: controlWithCondition('%$person/name%!=mukki', text({
        text: 'hello',
        style: text.codemirror(),
        features: frontEnd.onDestroy(writeValue('%$res/destroyed%','ya'))
      })),
      features: watchRef('%$person/name%')
    }),
    action: writeValue('%$person/name%', 'mukki'),
    expectedResult: equals('%$res/destroyed%','ya'),
  })
})

jb.component('uiTest.spliceAndWatchRefAddTwice', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'structure'})
    }),
    action: runActions(
      addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
      addToArray('%$watchablePeople%', obj(prop('name','kukki')))
    ),
    expectedResult: contains('kukki'),
    expectedCounters: {'do refresh element !check': 2}
  })
})

jb.component('uiTest.refProp', {
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
