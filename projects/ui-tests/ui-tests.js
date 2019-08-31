jb.component('globals', { watchableData:  {}});

jb.component('watchable-people', { watchableData: [
  { name: 'Homer Simpson - watchable', age: 42, male: true },
  { name: 'Marge Simpson - watchable', age: 38, male: false },
  { name: 'Bart Simpson - watchable', age: 12, male: true }
]})

jb.component('people', { passiveData: [
  { name: 'Homer Simpson', age: 42, male: true },
  { name: 'Marge Simpson', age: 38, male: false },
  { name: 'Bart Simpson', age: 12, male: true }
]})


jb.component('person', { watchableData: {
  name: 'Homer Simpson',
  male: true,
  isMale: 'yes',
  age: 42
}})

jb.component('personWithAddress', { watchableData: {
  name: 'Homer Simpson',
  address: {
    city: 'Springfield',
    street: '742 Evergreen Terrace'
  }
}})

jb.component('personWithChildren', { watchableData: {
  name: 'Homer Simpson',
  children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' }],
  friends: [{ name: 'Barnie' }],
}})

jb.component('ui-test.label',  /* uiTest_label */ {
  impl: uiTest({
    control: label('hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('ui-test.group',  /* uiTest_group */ {
  impl: uiTest({
    control: group({
      controls: [
        label('hello world'),
        label('2')
      ]
    }),
    expectedResult: contains(['hello world', '2'])
  })
})

jb.component('ui-test.wait-for',  /* uiTest_waitFor */ {
  impl: uiTest({
    control: group({
      controls: label('%%'),
      features: group_wait(ctx => jb.delay(10).then(_ => 'hello'))
    }),
    action: ctx => jb.delay(40),
    expectedResult: contains('hello')
  })
})

// jb.component('ui-test.asynch-label', {
//    impl :{$: 'ui-test',
//     control: {$:'label', title: ctx => jb.delay(10).then(_=>'hello') },
//     action: ctx=> jb.delay(40),
//     expectedResult :{$: 'contains', text: 'hello' }
//   },
// })
//
// jb.component('ui-test.asynch-label-with-pipeline1', {
//    impl :{$: 'ui-test',
//     control: {$:'label', title: {$pipeline: [ 'hello', ctx => jb.delay(10).then(ctx.data)] } },
//     action: ctx=> jb.delay(40),
//     expectedResult :{$: 'contains', text: 'hello' }
//   },
// })
//
// jb.component('ui-test.asynch-label-with-pipeline2', {
//    impl :{$: 'ui-test',
//     control: {$:'label', title: {$pipeline: [ ctx => jb.delay(10).then('hello'), '%%'] } },
//     action: ctx=> jb.delay(40),
//     expectedResult :{$: 'contains', text: 'hello' }
//   },
// })

jb.component('ui-test.wait-for-with-var',  /* uiTest_waitForWithVar */ {
  impl: uiTest({
    control: group({
      controls: [
        label('%$txt%')
      ],
      features: group_wait({for: ctx => jb.delay(10).then(_ => 'hello'), varName: 'txt'})
    }),
    action: ctx => jb.delay(40),
    expectedResult: contains('hello')
  })
})

jb.component('ui-test.button',  /* uiTest_button */ {
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1)}),
    expectedResult: contains('btn1')
  })
})

jb.component('ui-test.button.mdl-icon',  /* uiTest_button_mdlIcon */ {
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1), style: button_mdlIcon('build')}),
    expectedResult: contains('build')
  })
})


jb.component('ui-test.group2',  /* uiTest_group2 */ {
  impl: uiTest({
    control: group({
      controls: [
        button('button1'),
        label('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.editable-text',  /* uiTest_editableText */ {
  impl: uiTest({
    control: editableText({title: 'name', databind: '%$person/name%', style: editableText_input()}),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('ui-test.editable-text-mdl',  /* uiTest_editableTextMdl */ {
  impl: uiTest({
    control: editableText({title: 'name', databind: '%$person/name%', style: editableText_mdlInput()}),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('ui-test.editable-text.x-button',  /* uiTest_editableText_xButton */ {
  impl: uiTest({
    control: editableText({title: 'name', databind: '%$person/name%', features: [editableText_xButton()]}),
    expectedResult: contains({text: ['×', 'input', 'Homer Simpson'], inOrder: false})
  })
})

jb.component('ui-test.two-way-binding',  /* uiTest_twoWayBinding */ {
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%', features: id('inp')}),
        label('%$person/name%')
      ]
    }),
    action: uiAction_setText('hello', '#inp'),
    expectedResult: contains(['hello', 'hello'])
  })
})

jb.component('ui-test.group-horizontal',  /* uiTest_groupHorizontal */ {
  impl: uiTest({
    control: group({
      style: layout_horizontal(),
      controls: [
        button('button1'),
        label('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.tree',  /* uiTest_tree */ {
  impl: uiTest({
    control: tree({
      nodeModel: tree_jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [tree_selection({}), tree_keyboardSelection({})]
    }),
    expectedResult: contains(['address'])
  })
})

jb.component('ui-test.tree-rightClick',  /* uiTest_treeRightClick */ {
  impl: uiTest({
    control: tree({
      nodeModel: tree_jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [
        tree_selection({
          onRightClick: openDialog({title: 'hello', features: dialogFeature_nearLauncherPosition({})})
        }),
        tree_keyboardSelection({})
      ]
    }),
    expectedResult: contains(['address'])
  })
})

jb.component('ui-test.tree-DD',  /* uiTest_treeDD */ {
  impl: uiTest({
    control: tree({
      nodeModel: tree_json('%$personWithChildren%', 'Homer'),
      features: [tree_selection({}), tree_dragAndDrop(), tree_keyboardSelection({})]
    }),
    action: ctx =>
      jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
        ctx.exp('%$personWithChildren/friends[0]%', 'ref')),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join({})
      ),
      'Bart,Maggie,Lisa,Barnie'
    )
  })
})

jb.component('ui-test.tree-DD-after-last',  /* uiTest_treeDDAfterLast */ {
  impl: uiTest({
    control: tree({
      nodeModel: tree_json('%$personWithChildren%', 'Homer'),
      features: [tree_selection({}), tree_dragAndDrop(), tree_keyboardSelection({})]
    }),
    action: ctx =>
      jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
        ctx.exp('%$personWithChildren/friends[1]%', 'ref')),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join({})
      ),
      'Bart,Maggie,Barnie,Lisa'
    )
  })
})

jb.component('ui-test.open-dialog',  /* uiTest_openDialog */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        id: 'hello',
        content: group({
          controls: [
            label('jbart')
          ]
        }),
        title: 'hello',
        features: [
          dialogFeature_nearLauncherPosition({offsetTop: ctx => Math.floor(Math.random() * 20 + 2) * 10}),
          dialogFeature_resizer()
        ]
      })
    }),
    action: uiAction_click('button'),
    expectedResult: contains({text: ['hello', 'jbart'], allText: test_dialogContent('hello')})
  })
})

jb.component('ui-test.code-mirror-dialog-resizer',  /* uiTest_codeMirrorDialogResizer */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        content: editableText({databind: '%$person/name%', style: editableText_codemirror({mode: 'javascript'})}),
        title: 'resizer',
        features: [dialogFeature_nearLauncherPosition({}), dialogFeature_resizer(true)]
      })
    }),
    expectedResult: true
  })
})

jb.component('ui-test.code-mirror-dialog-resizer-ok-cancel',  /* uiTest_codeMirrorDialogResizerOkCancel */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        style: dialog_dialogOkCancel(),
        content: editableText({databind: '%$person/name%', style: editableText_codemirror({mode: 'javascript'})}),
        title: 'resizer',
        features: [dialogFeature_nearLauncherPosition({}), dialogFeature_resizer(true)]
      })
    }),
    expectedResult: true
  })
})

jb.component('ui-test.renderable',  /* uiTest_renderable */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: label('jbart'), title: label('hello as label')})
    }),
    action: uiAction_click('button'),
    expectedResult: contains({text: 'hello as label', allText: test_dialogContent('hello')})
  })
})

var ui_test_dialog_isAttached = false;

jb.component('ui-test.dialog-cleanup',  /* uiTest_dialogCleanup */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        id: 'hello',
        content: label('world'),
        title: 'hello',
        features: ctx => ({
          destroy: cmp =>
            ui_test_dialog_isAttached = cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode
        })
      })
    }),
    action: [uiAction_click('button'), dialog_closeAll()],
    expectedResult: ctx =>
      !ui_test_dialog_isAttached
  })
})

jb.component('ui-test.dialog-cleanup-bug',  /* uiTest_dialogCleanupBug */ {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: label('world'), title: 'hello'})
    }),
    action: [uiAction_click('button'), dialog_closeAll()],
    expectedResult: ctx =>
      !jb.resources['jb_dialog_hello']
  })
})

jb.component('ui-test.group-flex',  /* uiTest_groupFlex */ {
  impl: uiTest({
    control: group({
      style: layout_flex({direction: 'row'}),
      controls: [
        button('button1'),
        label('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.button-click',  /* uiTest_buttonClick */ {
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1)}),
    expectedResult: true
  })
})

jb.component('ui-test.button-x',  /* uiTest_buttonX */ {
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1), style: button_x()}),
    expectedResult: true
  })
})

jb.component('ui-test.resource',  /* uiTest_resource */ {
  impl: uiTest({
    control: button('%$person.name%'),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.features-css',  /* uiTest_featuresCss */ {
  impl: uiTest({
    control: label({title: 'Hello World2', features: css('{color: cyan; font-weight: bold}')}),
    expectedResult: contains(['Hello'])
  })
})

jb.component('ui-test.itemlist',  /* uiTest_itemlist */ {
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: label('%$item.name% - %name%')}),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-with-select',  /* uiTest_itemlistWithSelect */ {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%$item.name% - %name%'),
      features: itemlist_selection({})
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-DD',  /* uiTest_itemlistDD */ {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchable-people%',
          watchItems: true,
          controls: label({title: '%name%', features: css_class('drag-handle')}),
          features: [
            itemlist_selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            itemlist_keyboardSelection(true),
            itemlist_dragAndDrop(),
            id('itemlist')
          ]
        }),
        itemlist({items: '%$watchable-people%', controls: label('%name%'), watchItems: true })
      ]
    }),
    action: [
      ctx => jb.delay(10),
      uiAction_keyboardEvent({selector: '#itemlist', type: 'keydown', keyCode: 40, ctrl: 'ctrl'})
    ],
    expectedResult: contains(['Bart', 'Marge', 'Homer'])
  })
})

jb.component('ui-test.itemlist-basic',  /* uiTest_itemlistBasic */ {
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: label('%name%')}),
    expectedResult: contains(['Homer Simpson', 'Bart Simpson'])
  })
})

// jb.component('ui-test.itemlist-heading', {
//   impl :{$: 'ui-test', control :{$: 'group', controls:
//   [
//     { $: 'itemlist-with-groups', items: '%$people%',
//         controls :{$: 'label', title: '%name%' },
//         groupBy :{$: 'itemlist-heading.group-by',
//           itemToGroupID :{$if: '%male%', then: 'male', else: 'female'}
//         },
// //        headingCtrl :{$: 'label', title: '%title%' },
//         features: [
//             { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true },
//             { $: 'itemlist.keyboard-selection', autoFocus: true },
//             {$: 'css', css: '.jb-item:not(.heading) { margin-left: 30px }' }
//         ],
//     },
//   ]},
//   expectedResult: { $: 'contains', text: ['female', 'Marge', 'male', 'Homer Simpson', 'Bart Simpson'] },
// }
// })


jb.component('ui-test.itemlist-add-button',  /* uiTest_itemlistAddButton */ {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({items: '%$people%', controls: label('%$item.name% - %name%')}),
        button({title: 'add', action: (ctx) => ctx.exp('%$people%').push({ name: "Magi" })})
      ]
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-selection',  /* uiTest_itemlistSelection */ {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%$item.name%'),
      features: [
        itemlist_selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true})
      ]
    }),
    expectedResult: contains(['Homer Simpson'])
  })
})

jb.component('ui-test.itemlist-MD',  /* uiTest_itemlistMD */ {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people%',
          controls: label('%$item.name%'),
          features: [
            itemlist_selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            itemlist_keyboardSelection(true)
          ]
        }),
        label({
          title: '%$globals/selectedPerson/name% selected',
          features: watchRef('%$globals/selectedPerson%')
        })
      ]
    }),
    action: ctx => jb.delay(50),
    expectedResult: contains(['Homer Simpson', 'Homer Simpson selected'])
  })
})

jb.component('ui-test.itemlist-container-search-ctrl',  /* uiTest_itemlistContainerSearchCtrl */ {
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer_search({}),
      itemlist({
        items: pipeline('%$people%', itemlistContainer_filter()),
        controls: label({
          title: highlight('%name%', '%$itemlistCntrData/search_pattern%'),
          features: [
            css_class('label1'),
            watchRef('%$itemlistCntrData/search_pattern%')
          ]
        }),
        features: [
          itemlist_selection({autoSelectFirst: true}),
          itemlist_keyboardSelection({autoFocus: true, onEnter: writeValue('%$person/selected%', '%name%')}),
          watchRef('%$itemlistCntrData/search_pattern%')
        ]
      })
    ],
    features: group_itemlistContainer({})
  })
})

jb.component('ui-test.itemlist-container-search',  /* uiTest_itemlistContainerSearch */ {
  impl: uiTest({
    control: uiTest_itemlistContainerSearchCtrl(),
    action: uiAction_setText('ho', '.mdl-textfield'),
    expectedResult: and(contains(['Ho', 'mer']), not(contains('Marge')), not(contains('Homer')))
  })
})

jb.component('ui-test.itemlist-container-search-enter-on-li',  /* uiTest_itemlistContainerSearchEnterOnLi */ {
  impl: uiTest({
    control: uiTest_itemlistContainerSearchCtrl(),
    action: runActions(uiAction_keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13})),
    expectedResult: equals('%$person/selected%', 'Homer Simpson')
  })
})

jb.component('ui-test.secondaryLink-set-bug',  /* uiTest_secondaryLinkSetBug */ {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%name%'),
      features: itemlist_selection({databind: '%$globals/selected%', autoSelectFirst: true})
    }),
    action: runActions(
      writeValue('%$globals/selected%', '%$people[1]%'),
      writeValue('%$globals/data1%', '5')
    ),
    expectedResult: ctx => true
  })
})

jb.component('ui-test.search-doesnot-create-ReactClass',  /* uiTest_searchDoesnotCreateReactClass */ {
  impl: uiTest({
    control: group({
      controls: [
        itemlistContainer_search({}),
        itemlist({
          items: pipeline('%$people%', itemlistContainer_filter()),
          controls: label({title: highlight('%name%', '%$itemlistCntrData/search_pattern%')}),
          features: [
            itemlist_selection({autoSelectFirst: true}),
            itemlist_keyboardSelection(true),
            watchRef('%$itemlistCntrData/search_pattern%')
          ]
        })
      ],
      features: [group_itemlistContainer({})]
    }),
    action: uiAction_setText('ho', '.mdl-textfield'),
    expectedResult: ctx => true,
    expectedCounters: ctx => ({ createReactClass: 6 })
  })
})

jb.component('ui-test.table',  /* uiTest_table */ {
  impl: uiTest({
    control: table({
      items: '%$people%',
      fields: [field({title: 'name', data: '%name%'}), field({title: 'age', data: '%age%'})],
      features: [
        itemlist_selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true})
      ]
    }),
    expectedResult: contains(['age', 'Homer Simpson', '12'])
  })
})

jb.component('ui-test.table-DD',  /* uiTest_tableDD */ {
  impl: uiTest({
    control: group({
      controls: [
        table({
          items: '%$watchable-people%',
          fields: [
            field({title: 'name', data: '%name%', width: 300, class: 'drag-handle'}),
            field({title: 'age', data: '%age%', width: 50}),
            field_control({
              control: button({title: 'delete', action: removeFromArray({array: '%$people%'}), style: button_x()})
            })
          ],
          watchItems: true,
          features: [
            itemlist_selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            itemlist_keyboardSelection(true),
            itemlist_dragAndDrop()
          ]
        }),
        label({title: pipeline('%$watchable-people/name%', join({})), features: watchRef('%$watchable-people%')})
      ]
    }),
    expectedResult: contains(['age', 'Homer Simpson', '12'])
  })
})

jb.component('ui-test.table.button-field',  /* uiTest_table_buttonField */ {
  impl: uiTest({
    control: table({
      items: '%$people%',
      fields: [
        field({title: 'name', data: '%name%'}),
        field_button({title: 'age', buttonText: '%age%', action: ctx => alert(ctx.data)})
      ]
    }),
    expectedResult: contains(['age', 'Homer Simpson', '12'])
  })
})

// jb.component('ui-test.ngShow-label', {
// //   impl :{$: 'ui-test',
//   control :{$: 'label',
//         title: 'Dan',
//         features :{$ngAtts: {'[hidden]': '12==12'} }
//    },
//     expectedResult: { $contains: ['hidden' , 'Dan'] }
// },
// })

// jb.component('ui-test.ngShow-list', {
// //   impl :{$: 'ui-test',
//   control :{$: 'itemlist',
//       items: '%$people%',
//       controls :{$: 'label',
//         title: '%$item.name% - %age%',
//         features :{ $ngAtts: {'[hidden]': '%age%==12'} }
//       },
//     },
//     expectedResult: { $contains: ['Homer','Marge', 'hidden' , 'Bart'] }
// },
// })

// jb.component('ui-test.ngIf', {
// type: 'test',
//   impl :{$: 'ui-test',
//   control :{$: 'itemlist',
//       items: '%$people%',
//       controls :{$: 'label',
//         title: '%$item.name% - %age%',
//         atts: {'*ngIf': '%age%>12'}
//       },
//     },
//     expectedResult :{$and:
//       [
//         { $contains: ['Homer','Marge'] },
// //        { $not: { $contains: 'Bart'}}
//       ]
//     }
// },
// })

jb.component('ui-test.editable-text-in-group',  /* uiTest_editableTextInGroup */ {
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%'}),
        editableText({title: 'name', databind: '%$person/name%'}),
        label('%$person/name%')
      ]
    }),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.editable-text-with-jb-val',  /* uiTest_editableTextWithJbVal */ {
  impl: {
    $: 'ui-test2',
    control: group({
      vars: [
        Var(
          'a1',
          ctx => {
          return {
            $jb_val: value => {
              if (value === undefined)
                return jbart.__test_jb_val || 'Marge';
              else
                jbart.__test_jb_val = value;
            }
          }
        }
        )
      ],
      controls: [
        editableText({title: 'name', databind: '%$a1%'}),
        editableText({title: 'name', databind: '%$a1%'}),
        picklist({title: 'name', databind: '%$a1%', options: picklist_optionsByComma('Homer,Marge')}),
        label('%$a1%')
      ]
    }),
    expectedResult: contains(['Homer'])
  }
})

jb.component('ui-test.property-sheet.titles-above',  /* uiTest_propertySheet_titlesAbove */ {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet_titlesAboveFloatLeft(),
          controls: [
            editableText({title: 'name', databind: '%$person/name%'}),
            editableText({title: 'address', databind: '%$person/address%'})
          ]
        }),
        label('%$person/name%')
      ]
    }),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.property-sheet.titles-left',  /* uiTest_propertySheet_titlesLeft */ {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet_titlesLeft({}),
          controls: [
            editableText({title: 'name', databind: '%$person/name%', style: editableText_input()}),
            editableText({title: 'address', databind: '%$person/address%', style: editableText_input()})
          ]
        })
      ]
    }),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.editable-number',  /* uiTest_editableNumber */ {
  impl: uiTest({
    control: group({
      style: layout_vertical(),
      controls: [
        editableNumber({databind: '%$person/age%', title: 'age', style: editableNumber_sliderNoText()}),
        editableNumber({databind: '%$person/age%', title: 'age', style: editableNumber_slider()}),
        editableNumber({databind: '%$person/age%', title: 'age'}),
        label('%$person/age%')
      ]
    }),
    expectedResult: contains(['42', '42'])
  })
})

jb.component('ui-test.editable-number-slider',  /* uiTest_editableNumberSlider */ {
  impl: uiTest({
    control: editableNumber({databind: '%$person/age%', title: 'age', style: editableNumber_slider()}),
    expectedResult: contains('42')
  })
})

jb.component('ui-test.editable-number-slider-empty',  /* uiTest_editableNumberSliderEmpty */ {
  impl: uiTest({
    control: editableNumber({databind: '%$person/age1%', title: 'age', style: editableNumber_slider()}),
    expectedResult: true
  })
})

jb.component('ui-test.editable-boolean.all-styles',  /* uiTest_editableBoolean_allStyles */ {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({databind: '%$person/male%', style: editableBoolean_checkbox(), title: 'male'}),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean_checkboxWithTitle(),
          title: 'gender',
          textForTrue: 'male',
          textForFalse: 'female'
        }),
        editableBoolean({databind: '%$person/male%', style: editableBoolean_mdlSlideToggle(), title: 'male'}),
        editableBoolean({databind: '%$person/male%', style: editableBoolean_expandCollapse(), title: 'male'}),
        label('%$person/male%')
      ]
    }),
    expectedResult: contains(['male'])
  })
})

jb.component('ui-test.editable-boolean-settings',  /* uiTest_editableBooleanSettings */ {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean_checkboxWithTitle(),
          title: 'male',
          textForTrue: 'male',
          textForFalse: 'female'
        })
      ]
    }),
    expectedResult: contains('male')
  })
})

jb.component('ui-test.editable-boolean.expand-collapse',  /* uiTest_editableBoolean_expandCollapse */ {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$expanded%',
          style: editableBoolean_expandCollapse(),
          features: id('toggle')
        }),
        label({
          title: 'inner text',
          features: [feature_if('%$expanded%'), watchRef('%$expanded%')]
        })
      ],
      features: variable({name: 'expanded', value: false, watchable: true})
    }),
    action: uiAction_click('#toggle', 'toggle'),
    expectedResult: contains('inner text')
  })
})

jb.component('ui-test.expand-collapse-with-default-collapse',  /* uiTest_expandCollapseWithDefaultCollapse */ {
  type: 'control',
  impl: group({
    controls: [
      editableBoolean({databind: '%$default%', title: 'default', features: id('default')}),
      group({
        controls: [
          editableBoolean({
            databind: '%$expanded%',
            style: editableBoolean_expandCollapse(),
            title: 'expColl',
            features: [id('expCollapse'), field_initValue('%$default%')]
          }),
          label({
            title: 'inner text',
            features: [feature_if('%$expanded%'), watchRef('%$expanded%')]
          })
        ],
        features: [watchRef('%$default%')]
      })
    ],
    features: [
      variable({name: 'expanded', value: null, watchable: true}),
      variable({name: 'default', value: false, watchable: true})
    ]
  })
})

jb.component('ui-test.editable-boolean.expand-collapse-with-default-val',  /* uiTest_editableBoolean_expandCollapseWithDefaultVal */ {
  impl: uiTest({
    control: uiTest_expandCollapseWithDefaultCollapse(),
    action: runActions(uiAction_click('#default', 'toggle')),
    expectedResult: contains('inner text')
  })
})

jb.component('ui-test.editable-boolean.expand-collapse-with-default-collapse',  /* uiTest_editableBoolean_expandCollapseWithDefaultCollapse */ {
  impl: uiTest({
    control: uiTest_expandCollapseWithDefaultCollapse(),
    action: runActions(uiAction_click('#default', 'toggle'), uiAction_click('#expCollapse', 'toggle')),
    expectedResult: not(contains('inner text'))
  })
})

jb.component('ui-test.code-mirror',  /* uiTest_codeMirror */ {
  impl: uiTest({
    control: group({
      vars: [
        Var('js', {$: 'object', text: 'function f1() { return 15 }'}),
        Var('css', {$: 'object', text: '{ width: 15px; }'}),
        Var('html', {$: 'object', text: '<div><span>hello</span></div>'})
      ],
      controls: [
        editableText({databind: '%$js/text%', style: editableText_codemirror({mode: 'javascript'})}),
        editableText({databind: '%$css/text%', style: editableText_codemirror({mode: 'css'})}),
        editableText({databind: '%$html/text%', style: editableText_codemirror({mode: 'htmlmixed'})})
      ]
    }),
    expectedResult: contains(['function', 'f1', '15'])
  })
})

jb.component('ui-test.inner-label1-tst',  /* uiTest_innerLabel1Tst */ {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: label({
    title: call('title')
  })
})

jb.component('ui-test.inner-label2-tst',  /* uiTest_innerLabel2Tst */ {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest_innerLabel1Tst(
    call('title')
  )
})

jb.component('ui-test.inner-label3-tst',  /* uiTest_innerLabel3Tst */ {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest_innerLabel2Tst(
    call('title')
  )
})

jb.component('ui-test.prettyPrintComp',  /* uiTest_prettyPrintComp */ {
  impl: {
    $: 'ui-test2',
    waitForPromise: delay(50),
    control: group({
      controls: [
        {
          $: 'text',
          text: ctx => jb_prettyPrintComp('ui-test.inner-label1-tst', jb.comps['ui-test.inner-label1-tst']),
          style: {$: 'text.multi-line'}
        },
        {
          $: 'text',
          text: ctx => jb_prettyPrintComp('editable-text.codemirror', jb.comps['editable-text.codemirror']),
          style: text_codemirror({})
        }
      ]
    }),
    expectedResult: contains(['dynamic: true'])
  }
})

jb.component('ui-test.picklist',  /* uiTest_picklist */ {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet_titlesLeft({}),
          controls: picklist({
            title: 'city',
            databind: '%$personWithAddress/address/city%',
            options: picklist_optionsByComma('Springfield,New York,Tel Aviv,London')
          })
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.picklist-sort',  /* uiTest_picklistSort */ {
  impl: dataTest({
    calculate: pipeline(
      picklist_sortedOptions(
        picklist_optionsByComma('a,b,c,d'),
        pipeline(
          'c:100,d:50,b:0,a:20',
          split(','),
          {
            $: 'object',
            code: split({separator: ':', part: 'first'}),
            mark: split({separator: ':', part: 'second'})
          }
        )
      ),
      '%text%',
      join({})
    ),
    expectedResult: contains('c,d,a')
  })
})

jb.component('ui-test.picklist-groups',  /* uiTest_picklistGroups */ {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet_titlesLeft({}),
          controls: picklist({
            title: 'city',
            databind: '%$personWithAddress/address/city%',
            options: picklist_optionsByComma('US.Springfield,US.New York,Israel.Tel Aviv,UK.London,mooncity'),
            style: picklist_groups()
          })
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.dynamic-controls',  /* uiTest_dynamicControls */ {
  impl: uiTest({
    control: group({
      style: propertySheet_titlesLeft({}),
      controls: dynamicControls({
        controlItems: list('name', 'age'),
        genericControl: editableText({title: '%$controlItem%', databind: '%$person/{%$controlItem%}%'})
      })
    }),
    expectedResult: contains(['name', 'age'])
  })
})

jb.component('ui-test.inline-controls',  /* uiTest_inlineControls */ {
  impl: uiTest({
    control: group({
      controls: [
        label('a1'),
        inlineControls(label('a2'), label('a3'))
      ]
    }),
    expectedResult: contains(['a1', 'a2', 'a3'])
  })
})

jb.component('ui-test.tabs',  /* uiTest_tabs */ {
  impl: uiTest({
    control: group({
      style: group_tabs(),
      controls: [
        group({title: 'tab1', controls: label('in tab1')}),
        group({title: 'tab2', controls: label('in tab2')})
      ]
    }),
    expectedResult: and(contains(['tab1', 'in tab1']), contains('tab2'), not(contains('in tab2')))
  })
})

jb.component('ui-test.group.accordion',  /* uiTest_group_accordion */ {
  impl: uiTest({
    control: group({
      style: group_accordion(),
      controls: [
        group({title: 'tab1', controls: label('in tab1')}),
        group({title: 'tab2', controls: label('in tab2')})
      ]
    }),
    action: ctx => jb.delay(1),
    expectedResult: contains(['tab1', 'in tab1', 'tab2'])
  })
})

jb.component('ui-test.inner-label',  /* uiTest_innerLabel */ {
  impl: uiTest({
    control: uiTest_innerLabel3Tst('Hello World2'),
    expectedResult: contains('Hello World2')
  })
})

jb.component('ui-test.markdown',  /* uiTest_markdown */ {
  impl: {
    $: 'ui-test2',
    control: {
      $: 'markdown',
      markdown: "| Day     | Meal    | Price |\n| --------|---------|-------|\n| Monday  | pasta   | $6    |\n| Tuesday | chicken | $8    |    "
    },
    expectedResult: contains('table')
  }
})

jb.component('ui-test.style-by-control',  /* uiTest_styleByControl */ {
  impl: uiTest({
    control: label({
      title: 'Hello World',
      style: styleByControl(button('%$labelModel/title%2'), 'labelModel')
    }),
    expectedResult: contains('Hello World2')
  })
})

jb.component('ui-test.picklist-as-itemlist',  /* uiTest_picklistAsItemlist */ {
  impl: uiTest({
    control: group({
      controls: [
        picklist({
          databind: '%$personWithAddress/address/city%',
          options: picklist_optionsByComma('Springfield,New York,Tel Aviv,London'),
          style: picklist_selectionList('300')
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('menu-test.menu1',  /* menuTest_menu1 */ {
  impl: menu_menu({
    title: 'main',
    options: [
      menu_menu({
        title: 'File',
        options: [
          menu_action('New'),
          menu_action('Open'),
          menu_menu({title: 'Bookmarks', options: [menu_action('Google'), menu_action('Facebook')]}),
          menu_menu({title: 'Friends', options: [menu_action('Dave'), menu_action('Dan')]})
        ]
      }),
      menu_menu({title: 'Edit', options: [menu_action('Copy'), menu_action('Paste')]}),
      menu_dynamicOptions(list(1, 2, 3), menu_action('dynamic-%%'))
    ]
  })
})

jb.component('menu-test.pulldown',  /* menuTest_pulldown */ {
  impl: uiTest({
    control: menu_control({menu: menuTest_menu1(), style: menuStyle_pulldown({})}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit', 'dynamic-1', 'dynamic-3'])
  })
})

jb.component('menu-test.context-menu',  /* menuTest_contextMenu */ {
  impl: uiTest({
    control: menu_control({menu: menuTest_menu1()}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit'])
  })
})

jb.component('menu-test.open-context-menu',  /* menuTest_openContextMenu */ {
  impl: uiTest({
    control: button({title: 'open', action: menu_openContextMenu({menu: menuTest_menu1()})}),
    expectedResult: contains('open')
  })
})

jb.component('ui-test.watchable-var', {
  impl: uiTest({
    control: label({
      title: '%$var1%',
      features: [
        variable({name: 'var1', value: 'hello', watchable: true}),
        feature_afterLoad(writeValue('%$var1%', 'foo'))
      ]
    }),
    action: ctx => jb.delay(1),
    expectedResult: contains('foo')
  })
})

jb.component('ui-test.refresh-control-by-id',  /* uiTest_refreshControlById */ {
  impl: uiTest({
    control: itemlist({
      items: '%$items%',
      controls: label('%title%'),
      features: [
        variable({
          name: 'items',
          value: asIs([{title: 'i1'}, {title: 'i2'}]),
          watchable: true,
          globalId: 'items'
        }),
        id('itemlist')
      ]
    }),
    action: runActions(
      addToArray('%$items%', asIs([{title: 'i2'}, {title: 'i3'}])),
      refreshControlById('itemlist'),
      delay(1)
    ),
    expectedResult: contains(['i1', 'i2', 'i3'])
  })
})


// jb.component('ui-test.raw-vdom', {
//   impl :{$: 'ui-test',
//     control: ctx =>
//       jb.ui.h('div',{},'hello world'),
//     expectedResult :{$: 'contains', text: 'hello world' },
//   },
// })

// jb.component('ui-test.raw-vdom-in-group', {
//   impl :{$: 'ui-test',
//     control: { $: 'group',
//       controls: ctx =>
//           jb.ui.h('div',{},'hello world')
//     },
//     expectedResult :{$: 'contains', text: 'hello world' },
//   },
// })

jb.component('ui-test.control.first-succeeding',  /* uiTest_control_firstSucceeding */ {
  impl: uiTest({
    control: group({
      controls: [
        control_firstSucceeding(
          [
            controlWithCondition('%$gender% == \"male\"', label('male'))
          ]
        ),
        control_firstSucceeding(
          [
            controlWithCondition('%$gender% == \"female\"', label('female')),
            controlWithCondition('%$gender% != \"female\"', label('male2')),
            controlWithCondition(true, label('second-succeeding'))
          ]
        ),
        control_firstSucceeding(
          [
            controlWithCondition('%$gender% == \"female\"', label('female')),
            controlWithCondition('%$gender% == \"lale\"', label('male2')),
            label('default')
          ]
        )
      ],
      features: [variable({name: 'gender', value: 'male'})]
    }),
    expectedResult: and(contains(['male', 'male2', 'default']), not(contains('second-succeeding')))
  })
})

jb.component('ui-test.first-succeeding.watch-refresh-on-ctrl-change',  /* uiTest_firstSucceeding_watchRefreshOnCtrlChange */ {
  impl: uiTest({
    control: group({
      controls: [
        editableText({databind: '%$gender%'}),
        button({title: 'female', action: writeValue('%$gender%', 'female'), features: id('female')}),
        button({title: 'zee', action: writeValue('%$gender%', 'zee'), features: id('zee')}),
        button({title: 'male', action: writeValue('%$gender%', 'male'), features: id('male')}),
        control_firstSucceeding({
          controls: [
            controlWithCondition('%$gender% == \"male\"', label('male')),
            label('not male')
          ],
          features: firstSucceeding_watchRefreshOnCtrlChange('%$gender%')
        })
      ],
      features: variable({name: 'gender', value: 'male', watchable: true})
    }),
    action: runActions(uiAction_click('#female'), uiAction_click('#zee')),
    expectedResult: contains('not male'),
    expectedCounters: {createReactClass: 8}
  })
})

jb.component('ui-test.focus-on-first-element',  /* uiTest_focusOnFirstElement */ {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean('%$person/gender%'),
        editableText({databind: '%$person/name%', style: editableText.textarea()})
      ]
    }),
    action: focusOnFirstElement('textarea'),
    expectedResult: true
  })
})

jb.component('ui-test.check-box-with-text',  /* uiTest_checkBoxWithText */ {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean_checkboxWithTitle(),
          textForTrue: 'male',
          textForFalse: 'female',
          features: id('male')
        })
      ]
    }),
    expectedResult: true
  })
})
