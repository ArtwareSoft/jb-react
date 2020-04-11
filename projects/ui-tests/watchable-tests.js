jb.ns('remote')

jb.component('uiTest.checkBoxWithCalculatedAndWatchRef', {
  impl: uiTest({
    control: editableBoolean({
      databind: '%$person/name% == \"Homer Simpson\"',
      style: editableBoolean.checkboxWithTitle(),
      textForTrue: 'yes',
      textForFalse: 'nonono',
      features: watchRef('%$person/name%')
    }),
    action: writeValue('%$person/name%', 'Mukki'),
    expectedResult: contains('nonono'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.booleanWatchableVarAsBooleanTrueToFalse', {
  impl: uiTest({
    control: text({
      text: data.if('%$person/male%', 'Error', 'OK'),
      features: watchRef('%$person/male%')
    }),
    action: writeValue('%$person/male%', false),
    expectedResult: contains('OK')
  })
})

jb.component('uiTest.booleanWatchableVarAsBooleanFalseToTrue', {
  impl: uiTest({
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
        variable({name: 'var1', value: 'hello', watchable: true}),
        feature.afterLoad(writeValue('%$var1%', 'foo'))
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
        variable({name: 'obj1', value: {'$': 'object', txt: 'hello'}, watchable: true}),
        feature.afterLoad(writeValue('%$obj1/txt%', 'foo'))
      ]
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.watchableVarAsArray', {
  impl: uiTest({
    control: group({
      controls: text('%$items[1]/title%'),
      features: variable({
        name: 'items',
        value: asIs([{title: 'koo'}, {title: 'foo'}]),
        watchable: true
      })
    }),
    expectedResult: contains('foo')
  })
})

jb.component('uiTest.watchableVarAsArrayOneItem', {
  impl: uiTest({
    control: group({
      controls: text('%$items[0]/title%'),
      features: variable({name: 'items', value: asIs([{title: 'foo'}]), watchable: true})
    }),
    expectedResult: contains('foo')
  })
})


jb.component('uiTest.watchableVarAsObjectNotInitialized', {
  impl: uiTest({
    control: group({
      controls: text('%$obj1/txt%'),
      features: [
        variable({name: 'obj1', value: {'$': 'object'}, watchable: true}),
        feature.afterLoad(writeValue('%$obj1/txt%', 'foo'))
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
        variable({name: 'var1', value: 'hello', watchable: true}),
        variable({name: 'var2', value: 'world', watchable: true}),
        calculatedVar({
          name: 'var3',
          value: '%$var1% %$var2%',
          watchRefs: list('%$var1%', '%$var2%')
        })
      ]
    }),
    action: uiAction.setText('hi', '#var1'),
    expectedResult: contains('hi world')
  })
})

jb.component('uiTest.calculatedVarCyclic', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({databind: '%$var1%', features: id('var1')}),
        editableText({databind: '%$var2%'}),
        text('%$var3%')
      ],
      features: [
        calculatedVar({name: 'var1', value: 'xx%$var3%', watchRefs: '%$var3%'}),
        variable({name: 'var2', value: 'world', watchable: true}),
        calculatedVar({
          name: 'var3',
          value: '%$var1% %$var2%',
          watchRefs: list('%$var1%', '%$var2%')
        })
      ]
    }),
    action: uiAction.setText('hi', '#var1'),
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
    control: text('%$personWithChildren/children[1]/name%'),
    action: splice({
      array: '%$personWithChildren/children%',
      fromIndex: 0,
      noOfItemsToRemove: 1
    }),
    expectedResult: contains('Maggie'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.spliceAndSet', {
  impl: uiTest({
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
        feature.afterLoad(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {refreshElem: 0}
  })
})

jb.component('uiTest.labelNotWatchingBasicVar', {
  impl: uiTest({
    control: text({
      vars: [Var('text1', obj(prop('text', 'OK')))],
      text: '%$text1/text%',
      features: [feature.afterLoad(writeValue('%$text1/text%', 'not good'))]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {refreshElem: 0}
  })
})

jb.component('uiTest.watchRefCssOnly', {
  impl: uiTest({
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
  impl: uiTest({
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
        feature.afterLoad(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedResult: contains('OK'),
    expectedCounters: {refreshElem: 0}
  })
})

jb.component('uiTest.groupWatchingWithIncludeChildren', {
  impl: uiTest({
    control: group({
      controls: text('%$text1/text%'),
      features: [
        variable({name: 'text1', value: obj(prop('text', 'OK')), watchable: true}),
        watchRef({ref: '%$text1%', includeChildren: 'yes'}),
        feature.afterLoad(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedResult: contains('changed'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.groupWatchingStructure', {
  impl: uiTest({
    control: group({
      controls: text('%$text1/text%'),
      features: [
        variable({name: 'text1', value: obj(prop('text', 'OK')), watchable: true}),
        watchRef({ref: '%$text1%', includeChildren: 'structure'}),
        feature.afterLoad(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedResult: contains('changed'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.watchRefArrayDeleteWithRunActionOnItems', {
  impl: uiTest({
    control: group({
      controls: text({
        text: json.stringify('%$watchablePeople%'),
        features: watchRef({ref: '%$watchablePeople%', includeChildren: 'yes'})
      }),
      features: [
        feature.afterLoad(
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
      ]
    }),
    expectedResult: contains('[]'),
    expectedCounters: {refreshElem: 3}
  })
})

jb.component('uiTest.watchableAsText', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({
          databind: watchableAsText('%$watchablePeople%'),
          style: editableText.textarea({rows: 30, cols: 80}),
          features: [
            id('editor'),
            feature.onKey(
              'Alt-P',
              textEditor.withCursorPath(writeValue('%$path%', '%$cursorPath%'))
            ),
            textarea.initTextareaEditor()
          ]
        }),
        button({
          title: 'show path of cursor',
          action: textEditor.withCursorPath(writeValue('%$path%', '%$cursorPath%'), '#editor'),
          features: id('show-path')
        }),
        button({
          title: 'change name',
          action: writeValue('%$watchablePeople[1]/name%', 'mukki'),
          features: id('change-name')
        }),
        text('%$path%')
      ],
      features: [id('group'), variable({name: 'path', value: '', watchable: true})]
    }),
    action: runActions(
      ctx => jb.ui.cmpOfSelector('#editor',ctx).editor.setSelectionRange({line: 2, col: 20}),
      uiAction.click('#show-path')
    ),
    expectedResult: contains('watchablePeople~0~name~!value')
  })
})

jb.component('uiTest.watchableAsTextWrite', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$watchablePeople%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: id('editor')
    }),
    action: uiAction.setText('hello', '#editor'),
    expectedResult: equals('%$watchablePeople%', 'hello')
  })
})

jb.component('uiTest.watchableAsTextWriteObjectInArray', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$watchablePeople%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: id('editor')
    }),
    action: uiAction.setText('[{a:3}]', '#editor'),
    expectedResult: equals('%$watchablePeople/0/a%', '3')
  })
})

jb.component('uiTest.watchableAsTextWriteSetObjectToArray', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$emptyArray%'),
      style: editableText.textarea({rows: 30, cols: 80}),
      features: id('editor')
    }),
    action: uiAction.setText('[{a:3}]', '#editor'),
    expectedResult: equals('%$emptyArray/0/a%', '3')
  })
})


jb.component('dataTest.watchableObjectToPrimitiveBug', {
  impl: uiTest({
    control: text('%$person%'),
    action: runActions(writeValue('%$person%', 'world'), writeValue('%$person%', 'hello')),
    expectedResult: contains('hello')
  })
})

jb.component('uiTest.spliceShouldNotFireFullContainerChange', {
  impl: uiTest({
    control: itemlist({items: '%$watchablePeople%', controls: text('%name%')}),
    action: addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
    expectedResult: not(contains('mukki')),
    expectedCounters: {refreshElem: 0}
  })
})

jb.component('uiTest.spliceAndWatchRefStrcture', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'structure'})
    }),
    action: addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
    expectedResult: contains('mukki'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.spliceAndWatchRefWithoutIncludeChildren', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'no'})
    }),
    action: writeValue('%$watchablePeople[0]/name%', 'mukki'),
    expectedResult: contains('mukki'),
    expectedCounters: {refreshElem: 1}
  })
})

jb.component('uiTest.spliceAndWatchRefAddTwice', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
      controls: text('%name%'),
      features: watchRef({ref: '%$watchablePeople%', includeChildren: 'structure'})
    }),
    action: runActions(
      addToArray('%$watchablePeople%', obj(prop('name', 'mukki'))),
      ctx => ctx.run(addToArray('%$watchablePeople%', obj(prop('name','kukki'))))
    ),
    expectedResult: contains('kukki'),
    expectedCounters: {refreshElem: 2}
  })
})

jb.component('uiTest.remoteWidget', {
  impl: uiTest({
    control: remote.widget('uiTest.helloFromWorker'),
    runBefore: remote.initMainWorker(
      ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
    ),
    action: delay(20),
    expectedResult: contains('hello from worker')
  })
})

jb.component('uiTest.remoteWidgetEditableText', {
  impl: uiTest({
    control: remote.widget('uiTest.remoteEditableCtrl'),
    runBefore: remote.initMainWorker(
      ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
    ),
    action: [delay(40), ctx => ctx.run(uiAction.setText('hello', '#inp')),delay(40)],
    expectedResult: contains(['<span', 'hello', '</span'])
  })
})

jb.component('uiTest.remoteWidgetEmptyEditableText', {
  impl: uiTest({
    control: remote.widget('uiTest.remoteEditableCtrl'),
    runBefore: remote.initMainWorker(
      ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
    ),
    action: [delay(40), ctx => ctx.run(uiAction.setText('', '#inp')), delay(20)],
    expectedResult: and(not(contains('undefined')), not(contains('Homer')))
  })
})

jb.component('uiTest.remoteWidgetInfiniteScroll', {
  impl: uiTest({
    control: remote.widget('uiTest.remoteInfiniteScroll'),
    runBefore: remote.initMainWorker(
      () => `http://${location.host}/projects/ui-tests/remote-widgets.js`
    ),
    action: [delay(40), uiAction.scrollDown('.jb-itemlist'), delay(20)],
    expectedResult: contains('>8<')
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
