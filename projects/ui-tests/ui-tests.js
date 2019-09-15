jb.component('globals', { /* globals */
  watchableData: {

  }
})

jb.component('watchable-people', { /* watchablePeople */
  watchableData: [
    {name: 'Homer Simpson - watchable', age: 42, male: true},
    {name: 'Marge Simpson - watchable', age: 38, male: false},
    {name: 'Bart Simpson - watchable', age: 12, male: true}
  ]
})

jb.component('people', { /* people */
  passiveData: [
    {name: 'Homer Simpson', age: 42, male: true},
    {name: 'Marge Simpson', age: 38, male: false},
    {name: 'Bart Simpson', age: 12, male: true}
  ]
})


jb.component('person', { /* person */
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

jb.component('personWithAddress', { /* personWithAddress */
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

jb.component('personWithChildren', { /* personWithChildren */
  watchableData: {
    name: 'Homer Simpson',
    children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}],
    friends: [{name: 'Barnie'}]
  }
})

jb.component('ui-test.label', { /* uiTest.label */
  impl: uiTest({
    control: label('hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('ui-test.group', { /* uiTest.group */
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

jb.component('ui-test.wait-for', { /* uiTest.waitFor */
  impl: uiTest({
    control: group({
      controls: label('%%'),
      features: group.wait(ctx => jb.delay(10).then(_ => 'hello'))
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

jb.component('ui-test.wait-for-with-var', { /* uiTest.waitForWithVar */
  impl: uiTest({
    control: group({
      controls: [
        label('%$txt%')
      ],
      features: group.wait({for: ctx => jb.delay(10).then(_ => 'hello'), varName: 'txt'})
    }),
    action: ctx => jb.delay(40),
    expectedResult: contains('hello')
  })
})

jb.component('ui-test.button', { /* uiTest.button */
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1)}),
    expectedResult: contains('btn1')
  })
})

jb.component('ui-test.button.mdl-icon', { /* uiTest.button.mdlIcon */
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1), style: button.mdlIcon('build')}),
    expectedResult: contains('build')
  })
})


jb.component('ui-test.group2', { /* uiTest.group2 */
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

jb.component('ui-test.editable-text', { /* uiTest.editableText */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.input()
    }),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('ui-test.editable-text-mdl', { /* uiTest.editableTextMdl */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.mdlInput()
    }),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('ui-test.editable-text.x-button', { /* uiTest.editableText.xButton */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      features: [editableText.xButton()]
    }),
    expectedResult: contains({text: ['×', 'input', 'Homer Simpson'], inOrder: false})
  })
})

jb.component('ui-test.two-way-binding', { /* uiTest.twoWayBinding */
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%', features: id('inp')}),
        label('%$person/name%')
      ]
    }),
    action: uiAction.setText('hello', '#inp'),
    expectedResult: contains(['hello', 'hello'])
  })
})

jb.component('ui-test.group-horizontal', { /* uiTest.groupHorizontal */
  impl: uiTest({
    control: group({
      style: layout.horizontal(),
      controls: [
        button('button1'),
        label('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})


jb.component('ui-test.open-dialog', { /* uiTest.openDialog */
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
          dialogFeature.nearLauncherPosition({
            offsetTop: ctx => Math.floor(Math.random() * 20 + 2) * 10
          }),
          dialogFeature.resizer()
        ]
      })
    }),
    action: uiAction.click('button'),
    expectedResult: contains({text: ['hello', 'jbart'], allText: test.dialogContent('hello')})
  })
})

jb.component('ui-test.code-mirror-dialog-resizer', { /* uiTest.codeMirrorDialogResizer */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        content: editableText({
          databind: '%$person/name%',
          style: editableText.codemirror({mode: 'javascript'})
        }),
        title: 'resizer',
        features: [dialogFeature.nearLauncherPosition({}), dialogFeature.resizer(true)]
      })
    }),
    expectedResult: true
  })
})

jb.component('ui-test.code-mirror-dialog-resizer-ok-cancel', { /* uiTest.codeMirrorDialogResizerOkCancel */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        style: dialog.dialogOkCancel(),
        content: editableText({
          databind: '%$person/name%',
          style: editableText.codemirror({mode: 'javascript'})
        }),
        title: 'resizer',
        features: [dialogFeature.nearLauncherPosition({}), dialogFeature.resizer(true)]
      })
    }),
    expectedResult: true
  })
})

jb.component('ui-test.renderable', { /* uiTest.renderable */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: label('jbart'), title: label('hello as label')})
    }),
    action: uiAction.click('button'),
    expectedResult: contains({text: 'hello as label', allText: test.dialogContent('hello')})
  })
})

var ui_test_dialog_isAttached = false;

jb.component('ui-test.dialog-cleanup', { /* uiTest.dialogCleanup */
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
    action: [uiAction.click('button'), dialog.closeAll()],
    expectedResult: ctx =>
      !ui_test_dialog_isAttached
  })
})

jb.component('ui-test.dialog-cleanup-bug', { /* uiTest.dialogCleanupBug */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: label('world'), title: 'hello'})
    }),
    action: [uiAction.click('button'), dialog.closeAll()],
    expectedResult: ctx =>
      !jb.resources['jb_dialog_hello']
  })
})

jb.component('ui-test.group-flex', { /* uiTest.groupFlex */
  impl: uiTest({
    control: group({
      style: layout.flex({direction: 'row'}),
      controls: [
        button('button1'),
        label('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.button-click', { /* uiTest.buttonClick */
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1)}),
    expectedResult: true
  })
})

jb.component('ui-test.button-x', { /* uiTest.buttonX */
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1), style: button.x()}),
    expectedResult: true
  })
})

jb.component('ui-test.resource', { /* uiTest.resource */
  impl: uiTest({
    control: button('%$person.name%'),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.features-css', { /* uiTest.featuresCss */
  impl: uiTest({
    control: label({title: 'Hello World2', features: css('{color: cyan; font-weight: bold}')}),
    expectedResult: contains(['Hello'])
  })
})

jb.component('ui-test.itemlist', { /* uiTest.itemlist */
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: label('%$item.name% - %name%')}),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-with-select', { /* uiTest.itemlistWithSelect */
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%$item.name% - %name%'),
      features: itemlist.selection({})
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-DD', { /* uiTest.itemlistDD */
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchable-people%',
          controls: label({title: '%name%', features: css.class('drag-handle')}),
          features: [
            itemlist.selection({
              databind: '%$globals/selectedPerson%',
              autoSelectFirst: true
            }),
            itemlist.keyboardSelection(true),
            itemlist.dragAndDrop(),
            watchRef('%$watchable-people%'),
            id('itemlist')
          ]
        }),
        itemlist({
          items: '%$watchable-people%',
          controls: label('%name%'),
          features: watchRef('%$watchable-people%')
        })
      ]
    }),
    action: [
      ctx => jb.delay(10),
      uiAction.keyboardEvent({
        selector: '#itemlist',
        type: 'keydown',
        keyCode: 40,
        ctrl: 'ctrl'
      })
    ],
    expectedResult: contains(['Bart', 'Marge', 'Homer'])
  })
})

jb.component('ui-test.itemlist-basic', { /* uiTest.itemlistBasic */
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


jb.component('ui-test.itemlist-add-button', { /* uiTest.itemlistAddButton */
  impl: uiTest({
    control: group({
      controls: [
        itemlist({items: '%$people%', controls: label('%$item.name% - %name%')}),
        button({
          title: 'add',
          action: (ctx) => ctx.exp('%$people%').push({ name: "Magi" })
        })
      ]
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-selection', { /* uiTest.itemlistSelection */
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%$item.name%'),
      features: [
        itemlist.selection({
          databind: '%$globals/selectedPerson%',
          autoSelectFirst: true
        })
      ]
    }),
    expectedResult: contains(['Homer Simpson'])
  })
})

jb.component('ui-test.itemlist-MD', { /* uiTest.itemlistMD */
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people%',
          controls: label('%$item.name%'),
          features: [
            itemlist.selection({
              databind: '%$globals/selectedPerson%',
              autoSelectFirst: true
            }),
            itemlist.keyboardSelection(true)
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

jb.component('ui-test.itemlist-container-search-ctrl', { /* uiTest.itemlistContainerSearchCtrl */
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer.search({}),
      itemlist({
        items: pipeline('%$people%', itemlistContainer.filter()),
        controls: label({
          title: highlight('%name%', '%$itemlistCntrData/search_pattern%'),
          features: [css.class('label1'), watchRef('%$itemlistCntrData/search_pattern%')]
        }),
        features: [
          itemlist.selection({autoSelectFirst: true}),
          itemlist.keyboardSelection({
            autoFocus: true,
            onEnter: writeValue('%$person/selected%', '%name%')
          }),
          watchRef('%$itemlistCntrData/search_pattern%')
        ]
      })
    ],
    features: group.itemlistContainer({})
  })
})

jb.component('ui-test.itemlist-container-search', { /* uiTest.itemlistContainerSearch */
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    action: uiAction.setText('ho', '.mdl-textfield'),
    expectedResult: and(contains(['Ho', 'mer']), not(contains('Marge')), not(contains('Homer')))
  })
})

jb.component('ui-test.itemlist-container-search-enter-on-li', { /* uiTest.itemlistContainerSearchEnterOnLi */
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    action: runActions(
      uiAction.keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13})
    ),
    expectedResult: equals('%$person/selected%', 'Homer Simpson')
  })
})

jb.component('ui-test.secondaryLink-set-bug', { /* uiTest.secondaryLinkSetBug */
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: label('%name%'),
      features: itemlist.selection({databind: '%$globals/selected%', autoSelectFirst: true})
    }),
    action: runActions(
      writeValue('%$globals/selected%', '%$people[1]%'),
      writeValue('%$globals/data1%', '5')
    ),
    expectedResult: ctx => true
  })
})

jb.component('ui-test.search-doesnot-create-ReactClass', { /* uiTest.searchDoesnotCreateReactClass */
  impl: uiTest({
    control: group({
      controls: [
        itemlistContainer.search({}),
        itemlist({
          items: pipeline('%$people%', itemlistContainer.filter()),
          controls: label({title: highlight('%name%', '%$itemlistCntrData/search_pattern%')}),
          features: [
            itemlist.selection({autoSelectFirst: true}),
            itemlist.keyboardSelection(true),
            watchRef('%$itemlistCntrData/search_pattern%')
          ]
        })
      ],
      features: [group.itemlistContainer({})]
    }),
    action: uiAction.setText('ho', '.mdl-textfield'),
    expectedResult: ctx => true,
    expectedCounters: ctx => ({ createReactClass: 6 })
  })
})

jb.component('ui-test.itemlist-with-table-style', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      style: table.withHeaders(),
      controls: [
        text({title: 'index', text: '%$index%', features: field.columnWidth(40) }), 
        text({title: 'name', text: '%name%', features: field.columnWidth(300) }), 
        text({title: 'age', text: '%age%'})
      ],
      features: [
        itemlist.selection({
          databind: '%$globals/selectedPerson%',
          autoSelectFirst: true
        })
      ]
    }),
    expectedResult: contains(['300','age', 'Homer Simpson', '38', '>3<', 'Bart'])
  })
})


jb.component('ui-test.table', { /* uiTest.table */
  impl: uiTest({
    control: table({
      items: '%$people%',
      fields: [field({title: 'name', data: '%name%'}), field({title: 'age', data: '%age%'})],
      features: [
        itemlist.selection({
          databind: '%$globals/selectedPerson%',
          autoSelectFirst: true
        })
      ]
    }),
    expectedResult: contains(['age', 'Homer Simpson', '12'])
  })
})

jb.component('ui-test.table.button-field', { /* uiTest.table.buttonField */
  impl: uiTest({
    control: table({
      items: '%$people%',
      fields: [
        field({title: 'name', data: '%name%'}),
        field.button({title: 'age', buttonText: '%age%', action: ctx => alert(ctx.data)})
      ]
    }),
    expectedResult: contains(['age', 'Homer Simpson', '12'])
  })
})

jb.component('ui-test.editable-text-in-group', { /* uiTest.editableTextInGroup */
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

jb.component('ui-test.editable-text-with-jb-val', { /* uiTest.editableTextWithJbVal */
  impl: {
    '$': 'ui-test2',
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
        picklist({
          title: 'name',
          databind: '%$a1%',
          options: picklist.optionsByComma('Homer,Marge')
        }),
        label('%$a1%')
      ]
    }),
    expectedResult: contains(['Homer'])
  }
})

jb.component('ui-test.property-sheet.titles-above', { /* uiTest.propertySheet.titlesAbove */
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesAboveFloatLeft(),
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

jb.component('ui-test.property-sheet.titles-left', { /* uiTest.propertySheet.titlesLeft */
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft({}),
          controls: [
            editableText({
              title: 'name',
              databind: '%$person/name%',
              style: editableText.input()
            }),
            editableText({
              title: 'address',
              databind: '%$person/address%',
              style: editableText.input()
            })
          ]
        })
      ]
    }),
    expectedResult: contains(['Homer'])
  })
})

jb.component('ui-test.editable-number', { /* uiTest.editableNumber */
  impl: uiTest({
    control: group({
      style: layout.vertical(),
      controls: [
        editableNumber({
          databind: '%$person/age%',
          title: 'age',
          style: editableNumber.sliderNoText()
        }),
        editableNumber({
          databind: '%$person/age%',
          title: 'age',
          style: editableNumber.slider()
        }),
        editableNumber({databind: '%$person/age%', title: 'age'}),
        label('%$person/age%')
      ]
    }),
    expectedResult: contains(['42', '42'])
  })
})

jb.component('ui-test.editable-number-slider', { /* uiTest.editableNumberSlider */
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: contains('42')
  })
})

jb.component('ui-test.editable-number-slider-empty', { /* uiTest.editableNumberSliderEmpty */
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age1%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: true
  })
})

jb.component('ui-test.editable-boolean.all-styles', { /* uiTest.editableBoolean.allStyles */
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkbox(),
          title: 'male'
        }),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkboxWithTitle(),
          title: 'gender',
          textForTrue: 'male',
          textForFalse: 'female'
        }),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.mdlSlideToggle(),
          title: 'male'
        }),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.expandCollapse(),
          title: 'male'
        }),
        label('%$person/male%')
      ]
    }),
    expectedResult: contains(['male'])
  })
})

jb.component('ui-test.editable-boolean-settings', { /* uiTest.editableBooleanSettings */
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkboxWithTitle(),
          title: 'male',
          textForTrue: 'male',
          textForFalse: 'female'
        })
      ]
    }),
    expectedResult: contains('male')
  })
})

jb.component('ui-test.editable-boolean.expand-collapse', { /* uiTest.editableBoolean.expandCollapse */
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$expanded%',
          style: editableBoolean.expandCollapse(),
          features: id('toggle')
        }),
        label({
          title: 'inner text',
          features: [feature.if('%$expanded%'), watchRef('%$expanded%')]
        })
      ],
      features: variable({name: 'expanded', value: false, watchable: true})
    }),
    action: uiAction.click('#toggle', 'toggle'),
    expectedResult: contains('inner text')
  })
})

jb.component('ui-test.expand-collapse-with-default-collapse', { /* uiTest.expandCollapseWithDefaultCollapse */
  type: 'control',
  impl: group({
    controls: [
      editableBoolean({
        databind: '%$default%',
        title: 'default',
        features: id('default')
      }),
      group({
        controls: [
          editableBoolean({
            databind: '%$expanded%',
            style: editableBoolean.expandCollapse(),
            title: 'expColl',
            features: [id('expCollapse'), field.initValue('%$default%')]
          }),
          label({
            title: 'inner text',
            features: [feature.if('%$expanded%'), watchRef('%$expanded%')]
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

jb.component('ui-test.editable-boolean.expand-collapse-with-default-val', { /* uiTest.editableBoolean.expandCollapseWithDefaultVal */
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    action: runActions(uiAction.click('#default', 'toggle')),
    expectedResult: contains('inner text')
  })
})

jb.component('ui-test.editable-boolean.expand-collapse-with-default-collapse', { /* uiTest.editableBoolean.expandCollapseWithDefaultCollapse */
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    action: runActions(
      uiAction.click('#default', 'toggle'),
      uiAction.click('#expCollapse', 'toggle')
    ),
    expectedResult: not(contains('inner text'))
  })
})

jb.component('ui-test.code-mirror', { /* uiTest.codeMirror */
  impl: uiTest({
    control: group({
      vars: [
        Var('js', {'$': 'object', text: 'function f1() { return 15 }'}),
        Var('css', {'$': 'object', text: '{ width: 15px; }'}),
        Var('html', {'$': 'object', text: '<div><span>hello</span></div>'})
      ],
      controls: [
        editableText({
          databind: '%$js/text%',
          style: editableText.codemirror({mode: 'javascript'})
        }),
        editableText({
          databind: '%$css/text%',
          style: editableText.codemirror({mode: 'css'})
        }),
        editableText({
          databind: '%$html/text%',
          style: editableText.codemirror({mode: 'htmlmixed'})
        })
      ]
    }),
    expectedResult: contains(['function', 'f1', '15'])
  })
})

jb.component('ui-test.inner-label1-tst', { /* uiTest.innerLabel1Tst */
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: label({
    title: call('title')
  })
})

jb.component('ui-test.inner-label2-tst', { /* uiTest.innerLabel2Tst */
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel1Tst(
    call('title')
  )
})

jb.component('ui-test.inner-label3-tst', { /* uiTest.innerLabel3Tst */
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel2Tst(
    call('title')
  )
})

jb.component('ui-test.prettyPrintComp', { /* uiTest.prettyPrintComp */
  impl: {
    '$': 'ui-test2',
    waitForPromise: delay(50),
    control: group({
      controls: [
        {
          '$': 'text',
          text: ctx => jb_prettyPrintComp('ui-test.inner-label1-tst', jb.comps['ui-test.inner-label1-tst']),
          style: {'$': 'text.multi-line'}
        },
        {
          '$': 'text',
          text: ctx => jb_prettyPrintComp('editable-text.codemirror', jb.comps['editable-text.codemirror']),
          style: text.codemirror({})
        }
      ]
    }),
    expectedResult: contains(['dynamic: true'])
  }
})

jb.component('ui-test.picklist', { /* uiTest.picklist */
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft({}),
          controls: picklist({
            title: 'city',
            databind: '%$personWithAddress/address/city%',
            options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London')
          })
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.picklist-sort', { /* uiTest.picklistSort */
  impl: dataTest({
    calculate: pipeline(
      picklist.sortedOptions(
          picklist.optionsByComma('a,b,c,d'),
          pipeline(
            'c:100,d:50,b:0,a:20',
            split(','),
            {
                '$': 'object',
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

jb.component('ui-test.picklist-groups', { /* uiTest.picklistGroups */
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft({}),
          controls: picklist({
            title: 'city',
            databind: '%$personWithAddress/address/city%',
            options: picklist.optionsByComma(
              'US.Springfield,US.New York,Israel.Tel Aviv,UK.London,mooncity'
            ),
            style: picklist.groups()
          })
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.dynamic-controls', { /* uiTest.dynamicControls */
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft({}),
      controls: dynamicControls({
        controlItems: list('name', 'age'),
        genericControl: editableText({title: '%$controlItem%', databind: '%$person/{%$controlItem%}%'})
      })
    }),
    expectedResult: contains(['name', 'age'])
  })
})

jb.component('ui-test.inline-controls', { /* uiTest.inlineControls */
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

jb.component('ui-test.tabs', { /* uiTest.tabs */
  impl: uiTest({
    control: group({
      style: group.tabs(),
      controls: [
        group({title: 'tab1', controls: label('in tab1')}),
        group({title: 'tab2', controls: label('in tab2')})
      ]
    }),
    expectedResult: and(contains(['tab1', 'in tab1']), contains('tab2'), not(contains('in tab2')))
  })
})

jb.component('ui-test.group.accordion', { /* uiTest.group.accordion */
  impl: uiTest({
    control: group({
      style: group.accordion(),
      controls: [
        group({title: 'tab1', controls: label('in tab1')}),
        group({title: 'tab2', controls: label('in tab2')})
      ]
    }),
    action: ctx => jb.delay(1),
    expectedResult: contains(['tab1', 'in tab1', 'tab2'])
  })
})

jb.component('ui-test.inner-label', { /* uiTest.innerLabel */
  impl: uiTest({
    control: uiTest.innerLabel3Tst('Hello World2'),
    expectedResult: contains('Hello World2')
  })
})

jb.component('ui-test.markdown', { /* uiTest.markdown */
  impl: {
    '$': 'ui-test2',
    control: {
      '$': 'markdown',
      markdown: `| Day     | Meal    | Price |
| --------|---------|-------|
| Monday  | pasta   | $6    |
| Tuesday | chicken | $8    |    `
    },
    expectedResult: contains('table')
  }
})

jb.component('ui-test.style-by-control', { /* uiTest.styleByControl */
  impl: uiTest({
    control: label({
      title: 'Hello World',
      style: styleByControl(button('%$labelModel/title%2'), 'labelModel')
    }),
    expectedResult: contains('Hello World2')
  })
})

jb.component('ui-test.picklist-as-itemlist', { /* uiTest.picklistAsItemlist */
  impl: uiTest({
    control: group({
      controls: [
        picklist({
          databind: '%$personWithAddress/address/city%',
          options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
          style: picklist.selectionList('300')
        }),
        label('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('menu-test.menu1', { /* menuTest.menu1 */
  impl: menu.menu({
    title: 'main',
    options: [
      menu.menu({
        title: 'File',
        options: [
          menu.action('New'),
          menu.action('Open'),
          menu.menu({
            title: 'Bookmarks',
            options: [menu.action('Google'), menu.action('Facebook')]
          }),
          menu.menu({title: 'Friends', options: [menu.action('Dave'), menu.action('Dan')]})
        ]
      }),
      menu.menu({title: 'Edit', options: [menu.action('Copy'), menu.action('Paste')]}),
      menu.dynamicOptions(list(1, 2, 3), menu.action('dynamic-%%'))
    ]
  })
})

jb.component('menu-test.pulldown', { /* menuTest.pulldown */
  impl: uiTest({
    control: menu.control({menu: menuTest.menu1(), style: menuStyle.pulldown({})}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit', 'dynamic-1', 'dynamic-3'])
  })
})

jb.component('menu-test.context-menu', { /* menuTest.contextMenu */
  impl: uiTest({
    control: menu.control({menu: menuTest.menu1()}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit'])
  })
})

jb.component('menu-test.open-context-menu', { /* menuTest.openContextMenu */
  impl: uiTest({
    control: button({title: 'open', action: menu.openContextMenu({menu: menuTest.menu1()})}),
    expectedResult: contains('open')
  })
})

jb.component('ui-test.refresh-control-by-id', { /* uiTest.refreshControlById */
  impl: uiTest({
    vars: [Var('top', asIs({items: [{title: 'i1'}, {title: 'i2'}]}))],
    control: itemlist({
      items: '%$top/items%',
      controls: label('%title%'),
      features: id('itemlist')
    }),
    action: runActions(
      addToArray('%$top/items%', asIs([{title: 'i2'}, {title: 'i3'}])),
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

jb.component('ui-test.control.first-succeeding', { /* uiTest.control.firstSucceeding */
  impl: uiTest({
    control: group({
      controls: [
        control.firstSucceeding(
          [
            controlWithCondition('%$gender% == \"male\"', label('male'))
          ]
        ),
        control.firstSucceeding(
          [
            controlWithCondition('%$gender% == \"female\"', label('female')),
            controlWithCondition('%$gender% != \"female\"', label('male2')),
            controlWithCondition(true, label('second-succeeding'))
          ]
        ),
        control.firstSucceeding(
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

jb.component('ui-test.first-succeeding.watch-refresh-on-ctrl-change', { /* uiTest.firstSucceeding.watchRefreshOnCtrlChange */
  impl: uiTest({
    control: group({
      controls: [
        editableText({databind: '%$gender%'}),
        button({
          title: 'female',
          action: writeValue('%$gender%', 'female'),
          features: id('female')
        }),
        button({
          title: 'zee',
          action: writeValue('%$gender%', 'zee'),
          features: id('zee')
        }),
        button({
          title: 'male',
          action: writeValue('%$gender%', 'male'),
          features: id('male')
        }),
        control.firstSucceeding({
          controls: [
            controlWithCondition('%$gender% == \"male\"', label('male')),
            label('not male')
          ],
          features: firstSucceeding.watchRefreshOnCtrlChange('%$gender%')
        })
      ],
      features: variable({name: 'gender', value: 'male', watchable: true})
    }),
    action: runActions(uiAction.click('#female'), uiAction.click('#zee')),
    expectedResult: contains('not male'),
    expectedCounters: {createReactClass: 8}
  })
})

jb.component('ui-test.focus-on-first-element', { /* uiTest.focusOnFirstElement */
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean('%$person/gender%'),
        editableText({databind: '%$person/name%', style: editableText.textarea({})})
      ]
    }),
    action: focusOnFirstElement('textarea'),
    expectedResult: true
  })
})

jb.component('ui-test.check-box-with-text', { /* uiTest.checkBoxWithText */
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkboxWithTitle(),
          textForTrue: 'male',
          textForFalse: 'female',
          features: id('male')
        })
      ]
    }),
    expectedResult: true
  })
})

jb.component('ui-test.hidden-ref-bug', { 
  impl: uiTest({
    control: group({
    controls: label({title: 'hey', features: hidden('%$hidden%')}),
    features: variable({name: 'hidden', watchable: true})
    }),
    expectedResult: contains('display: none'),
  })
})