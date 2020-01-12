jb.component('ui-test.check-box-with-calculated-and-watch-ref',  /* uiTest_checkBoxWithCalculatedAndWatchRef */ {
    impl: uiTest({
        control: editableBoolean({
          databind: '%$person/name% == \"Homer Simpson\"',
          style: editableBoolean_checkboxWithTitle(),
          textForTrue: 'yes',
          textForFalse: 'nonono',
          features: watchRef('%$person/name%')
        }),
        action: writeValue('%$person/name%', 'Mukki'),
        expectedResult: contains('nonono'),
        expectedCounters: {refreshElem: 1}
    })
})

jb.component('ui-test.boolean-watchable-var-as-boolean-true-to-false', {
    impl: uiTest({
      control: label({
        text: data.if('%$person/male%','Error','OK'),
        features: watchRef('%$person/male%'),
      }),
      action: writeValue('%$person/male%', false),
      expectedResult: contains('OK')
    })
})

jb.component('ui-test.boolean-watchable-var-as-boolean-false-to-true', {
    impl: uiTest({
      runBefore: writeValue('%$person/male%', false),
      control: label({
        text: data.if('%$person/male%','OK','Error'),
        features: watchRef('%$person/male%'),
      }),
      action: writeValue('%$person/male%', true),
      expectedResult: contains('OK')
    })
})

jb.component('ui-test.watchable-var',  /* uiTest_mutableVar */ {
    impl: uiTest({
      control: group({
        controls: label('%$var1%'),
        features: [
          variable({name: 'var1', value: 'hello', watchable: true}),
          feature.afterLoad(writeValue('%$var1%', 'foo'))
        ]
      }),
      expectedResult: contains('foo')
    })
})

jb.component('ui-test.watchable-var-with-global-id',  /* uiTest_mutableVarWithGlobalId */ {
    impl: uiTest({
      control: group({
        controls: label('%$var1%'),
        features: [
          variable({name: 'var1', value: 'hello', watchable: true, globalId: 'globalVar1'}),
          feature.afterLoad(writeValue('%$var1%', 'foo'))
        ]
      }),
      expectedResult: contains('foo')
    })
})

jb.component('ui-test.watchable-var-as-object',  /* uiTest_mutableVarAsObject */ {
    impl: uiTest({
      control: group({
        controls: label('%$obj1/txt%'),
        features: [
          variable({name: 'obj1', value: {$: 'object', txt: 'hello'}, watchable: true}),
          feature.afterLoad(writeValue('%$obj1/txt%', 'foo'))
        ]
      }),
      expectedResult: contains('foo')
    })
})

jb.component('ui-test.watchable-var-as-array',  /* uiTest_mutableVarAsArray */ {
    impl: uiTest({
      control: group({
        controls: label('%$items[1]/title%'),
        features: variable({
          name: 'items',
          value: asIs([{title: 'koo'}, {title: 'foo'}]),
          watchable: true,
          globalId: 'items'
        })
      }),
      expectedResult: contains('foo')
    })
})

jb.component('ui-test.watchable-var-as-array-one-item',  /* uiTest_mutableVarAsArrayOneItem */ {
    impl: uiTest({
      control: group({
        controls: label('%$items[0]/title%'),
        features: variable({name: 'items', value: asIs([{title: 'foo'}]), watchable: true, globalId: 'items'})
      }),
      expectedResult: contains('foo')
    })
})


jb.component('ui-test.watchable-var-as-object-not-initialized',  /* uiTest_mutableVarAsObjectNotInitialized */ {
    impl: uiTest({
      control: group({
        controls: label('%$obj1/txt%'),
        features: [
          variable({name: 'obj1', value: {$: 'object'}, watchable: true}),
          feature.afterLoad(writeValue('%$obj1/txt%', 'foo'))
        ]
      }),
      expectedResult: contains('foo')
    })
})

jb.component('ui-test.calculated-var',  /* uiTest_calculatedVar */ {
    impl: uiTest({
      control: group({
        controls: [
          editableText({databind: '%$var1%', features: id('var1')}),
          editableText({databind: '%$var2%'}),
          label('%$var3%')
        ],
        features: [
          variable({name: 'var1', value: 'hello', watchable: true}),
          variable({name: 'var2', value: 'world', watchable: true}),
          calculatedVar({name: 'var3', value: '%$var1% %$var2%', watchRefs: list('%$var1%', '%$var2%')})
        ]
      }),
      action: uiAction.setText('hi', '#var1'),
      expectedResult: contains('hi world')
    })
})

jb.component('ui-test.calculated-var-cyclic',  /* uiTest_calculatedVarCyclic */ {
    impl: uiTest({
      control: group({
        controls: [
          editableText({databind: '%$var1%', features: id('var1')}),
          editableText({databind: '%$var2%'}),
          label('%$var3%')
        ],
        features: [
          calculatedVar({name: 'var1', value: 'xx%$var3%', watchRefs: '%$var3%'}),
          variable({name: 'var2', value: 'world', watchable: true}),
          calculatedVar({name: 'var3', value: '%$var1% %$var2%', watchRefs: list('%$var1%', '%$var2%')})
        ]
      }),
      action: uiAction_setText('hi', '#var1'),
      expectedResult: contains('hi world')
    })
})

jb.component('ui-test.boolean-not-reffable-true',  /* uiTest_booleanNotReffableTrue */ {
    impl: uiTest({
      control: label({text: isOfType('string', '123')}),
      expectedResult: contains('true')
    })
})

jb.component('ui-test.boolean-not-reffable-false',  /* uiTest_booleanNotReffableFalse */ {
    impl: uiTest({
      control: label({text: isOfType('string2', '123')}),
      expectedResult: contains('false')
    })
})

jb.component('ui-test.label-with-watch-ref-in-spliced-array', {
    impl: uiTest({
      control: label({
        text: '%$personWithChildren/children[1]/name%',
        //features: watchRef('%$personWithChildren/children%')
      }),
      action: splice({array: '%$personWithChildren/children%', fromIndex: 0, noOfItemsToRemove: 1}),
      expectedResult: contains('Maggie'),
      expectedCounters: {refreshElem: 1}
    })
})

jb.component('ui-test.splice-and-set', {
  impl: uiTest({
    control: label({
      text: '%$personWithChildren/children[1]/name%',
      features: watchRef('%$personWithChildren/children%')
    }),
    action: [
      splice({array: '%$personWithChildren/children%', fromIndex: 0, noOfItemsToRemove: 1}),
      writeValue('%$personWithChildren/children[1]/name%','hello')
    ],
    expectedResult: contains('hello'),
    //expectedCounters: {refreshElem: 2}
  })
})

jb.component('ui-test.label-not-watching-ui-var', {
  impl: uiTest({
    control: label({
      text: '%$text1/text%',
      features: [
        variable({name: 'text1', value: obj(prop('text','OK'))}),
        feature_afterLoad(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedCounters: {refreshElem: 0},
    expectedResult: contains('OK')
  })
})

jb.component('ui-test.label-not-watching-basic-var', {
  impl: uiTest({
    control: label({
      vars: Var('text1', obj(prop('text','OK'))),
      text: '%$text1/text%',
      features: [
        feature_afterLoad(writeValue('%$text1/text%', 'not good'))
      ]
    }),
    expectedCounters: {refreshElem: 0},
    expectedResult: contains('OK')
  })
})

jb.component('ui-test.group-watching-without-includeChildren', {
  impl: uiTest({
    control: group({
      controls: label('%$text1/text%'),
    features: [
      variable({name: 'text1', value: obj(prop('text','OK'))}),
      watchRef({ref: '%$text1%'}),
      feature_afterLoad(writeValue('%$text1/text%', 'not good'))
    ]
  }),
    expectedCounters: {refreshElem: 0},
    expectedResult: contains('OK')
  })
})

jb.component('ui-test.group-watching-with-includeChildren', {
  impl: uiTest({
    control: group({
      controls: label('%$text1/text%'),
      features: [
        variable({name: 'text1', watchable: true, value: obj(prop('text','OK'))}),
        watchRef({ref: '%$text1%', includeChildren: 'yes'}),
        feature_afterLoad(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedCounters: {refreshElem: 1}, // a kind of bug fixed with includeChildren: 'structure'
    expectedResult: contains('changed')
  })
})

jb.component('ui-test.group-watching-structure', {
  impl: uiTest({
    control: group({
      controls: label('%$text1/text%'),
      features: [
        variable({name: 'text1', watchable: true, value: obj(prop('text','OK'))}),
        watchRef({ref: '%$text1%', includeChildren: 'structure'}),
        feature.afterLoad(writeValue('%$text1/text%', 'changed'))
      ]
    }),
    expectedCounters: {refreshElem: 1},
    expectedResult: contains('changed')
  })
})

jb.component('ui-test.watch-ref-array-delete-with-run-action-on-items',  {
  impl: uiTest({
    control: group({
      controls: label({
          text: json.stringify("%$watchable-people%"),
          features: watchRef({ref: '%$watchable-people%', includeChildren: 'yes'}) 
      }),
      features: [
        feature.afterLoad( 
          runActionOnItems('%$watchable-people%', 
            splice({
              array: "%$watchable-people%",
              fromIndex: indexOf("%$watchable-people%", '%%'),
              noOfItemsToRemove: '1',
              itemsToAdd: []
            })))
      ]
    }),
    expectedCounters: { refreshElem: 3},
    expectedResult: contains('[]')
  })
})

jb.component('ui-test.watchable-as-text', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({
          databind: watchableAsText('%$watchable-people%'),
          features: [
            id('editor'),
            feature.onKey('Alt-P', textEditor.withCursorPath(writeValue('%$path%','%$cursorPath%'))),
            textarea.initTextareaEditor(),
            //textEditor.init()
          ],
          style1: editableText.codemirror(),
          style: editableText.textarea({rows: 30,cols: 80})
        }),
        button({
          title: 'show path of cursor',
          action: textEditor.withCursorPath(writeValue('%$path%','%$cursorPath%'),'#editor'),
          features: id('show-path')
        }),
        button({
          features: id('change-name'),
          title: 'change name',
          action: writeValue('%$watchable-people[1]/name%','mukki')
        }),
        label('%$path%'),
      ],
      features: [
        id('group'),
        variable({name: 'path', value: '', watchable: true})
      ]
    }),
    action: runActions(
      ctx => jb.ui.cmpOfSelector('#editor',ctx).editor.setSelectionRange({line: 2, col: 20}),
      uiAction.click('#show-path'),
    ),
    expectedResult: contains('watchable-people~0~name~!value')
  })
})

jb.component('ui-test.watchable-as-text-write', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$watchable-people%'),
      features: id('editor'),
      style: editableText.textarea({rows: 30,cols: 80})
    }),
    action: uiAction_setText('hello','#editor'),
    expectedResult: equals('%$watchable-people%','hello')
  })
})

jb.component('ui-test.watchable-as-text-write-object-in-array', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$watchable-people%'),
      features: id('editor'),
      style: editableText.textarea({rows: 30,cols: 80})
    }),
    action: uiAction_setText('[{a:3}]','#editor'),
    expectedResult: equals('%$watchable-people/0/a%','3')
  })
})

jb.component('ui-test.watchable-as-text-write-set-object-to-array', {
  impl: uiTest({
    control: editableText({
      databind: watchableAsText('%$empty-array%'),
      features: id('editor'),
      style: editableText.textarea({rows: 30,cols: 80})
    }),
    action: uiAction_setText('[{a:3}]','#editor'),
    expectedResult: equals('%$empty-array/0/a%','3')
  })
})


jb.component('data-test.watchable-object-to-primitive-bug', {
  impl: uiTest({
    control: label('%$person%'),
    action: runActions(
      writeValue('%$person%', 'world'), 
      writeValue('%$person%', 'hello') ),
	  expectedResult: contains('hello')
	})
})

jb.component('ui-test.splice-should-not-fire-full-container-change',  {
  impl: uiTest({
    control: itemlist({
      items: '%$watchable-people%',
      controls: label('%name%')
    }),
    action: addToArray('%$watchable-people%', obj(prop('name','mukki'))),
    expectedCounters: {refreshElem: 0 },
    expectedResult: not(contains('mukki'))
  })
})

jb.component('ui-test.splice-and-watch-ref-strcture',  {
  impl: uiTest({
    control: itemlist({
      items: '%$watchable-people%',
      controls: label('%name%'),
      features: watchRef({ref: '%$watchable-people%', includeChildren: 'structure'})
    }),
    action: addToArray('%$watchable-people%', obj(prop('name','mukki'))),
    expectedCounters: {refreshElem: 1 },
    expectedResult: contains('mukki')
  })
})

jb.component('ui-test.splice-and-watch-ref-without-include-children',  {
  impl: uiTest({
    control: itemlist({
      items: '%$watchable-people%',
      controls: label('%name%'),
      features: watchRef({ref: '%$watchable-people%', includeChildren: 'no'})
    }),
    action: writeValue('%$watchable-people[0]/name%', 'mukki'),
    expectedCounters: {refreshElem: 1 },
    expectedResult: contains('mukki')
  })
})

jb.component('ui-test.splice-and-watch-ref-add-twice',  {
  impl: uiTest({
    control: itemlist({
      items: '%$watchable-people%',
      controls: label('%name%'),
      features: watchRef({ref: '%$watchable-people%', includeChildren: 'structure'})
    }),
    action: runActions(
      addToArray('%$watchable-people%', obj(prop('name','mukki'))),
      ctx => ctx.run(addToArray('%$watchable-people%', obj(prop('name','kukki'))))
    ),
    expectedCounters: {refreshElem: 2 },
    expectedResult: contains('kukki')
  })
})