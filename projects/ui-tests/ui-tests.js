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

jb.component('empty-array', {
  watchableData: []
})


jb.component('ui-test.label', { /* uiTest.label */
  impl: uiTest({
    control: text('hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('ui-test.html', { /* uiTest.html */
  impl: uiTest({
    control: html({html: '<p>hello world</p>'}),
    expectedResult: contains('<p>hello world</p>')
  })
})

jb.component('ui-test.html.in-iframe', { /* uiTest.html.inIframe */
  impl: uiTest({
    control: html({html: '<p>hello world</p>', style: html.inIframe()}),
    expectedResult: contains('iframe')
  })
})

jb.component('ui-test.group', { /* uiTest.group */
  impl: uiTest({
    control: group({
      controls: [
        text('hello world'),
        text('2')
      ]
    }),
    expectedResult: contains(['hello world', '2'])
  })
})

jb.component('ui-test.wait-for-with-pipe', { /* uiTest.waitForWithPipe */
  impl: uiTest({
    control: group({
      controls: text('%%'),
      features: group.wait({for: pipe(delay(10), 'hello')})
    }),
    action: delay(40),
    expectedResult: and(contains('hello'), not(contains('loading'))),
    expectedCounters: {initCmp: 4}
  })
})

// jb.component('ui-test.wait-for-with-MD', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         itemlist({
//           items: '%$people%',
//           controls: text('%$item.name%'),
//           features: [
//             itemlist.selection({
//               databind: '%$globals/selectedPerson%',
//               autoSelectFirst: true
//             }),
//           ]
//         }),
//         group({
//           controls: text('%%'),
//           features: [
//             watchRef({ ref: '%$globals/selectedPerson%', strongRefresh: true }),
//             group.wait({for: pipe(delay(10), '%$globals/selectedPerson/name% -- delayed')})
//           ]
//         })
//       ]
//     }),
//     action: [
//       delay(10),
//       writeValue('%$globals/selectedPerson%','%$people[1]%'),
//       delay(40)
//     ],
//     expectedResult: and(contains('Marge Simpson -- delayed'),not(contains('loading'))),
//     expectedCounters: {replaceTop: 2, applyDeltaTop: 4}
//   })
// })

jb.component('ui-test.asynch-label', { /* uiTest.asynchLabel */
  impl: uiTest({
    control: text({text: pipe(delay(10), 'hello'), features: text.allowAsynchValue()}),
    action: delay(40),
    expectedResult: contains('hello')
  })
})

jb.component('ui-test.wait-for-with-var', { /* uiTest.waitForWithVar */
  impl: uiTest({
    control: group({
      controls: text('%$txt%'),
      features: group.wait({for: pipe(delay(1), 'hello'), varName: 'txt'})
    }),
    action: delay(40),
    expectedResult: contains('hello')
  })
})

// jb.component('ui-test.watchObservable', {
//   impl: uiTest({
//     vars: Var('promise', ctx => jb.delay(1)),
//     control: text({
//       text: '%$person/name%',
//       features: watchObservable({ toWatch: (ctx,{promise}) => jb.rx.Observable.fromPromise(promise) })
//     }),
//     expectedCounters: {setState: 1},
//     expectedResult: true
//   })
// })

jb.component('ui-test.button', { /* uiTest.button */
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1)}),
    expectedResult: contains('btn1')
  })
})

jb.component('ui-test.button.mdc-icon', { /* uiTest.button.mdcIcon */
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1), style: button.mdcIcon('build')}),
    expectedResult: contains('build')
  })
})


jb.component('ui-test.group2', { /* uiTest.group2 */
  impl: uiTest({
    control: group({
      controls: [
        button('button1'),
        text('label1')
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

jb.component('ui-test.editable-text-empty', { /* uiTest.editableTextEmpty */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name1%',
      style: editableText.input()
    }),
    expectedResult: not(contains('object'))
  })
})

jb.component('ui-test.editable-text-mdc', { /* uiTest.editableTextMdc */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.mdcInput()
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

jb.component('ui-test.editable-text-expandable', { /* uiTest.editableTextExpandable */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.expandable({})
    }),
    expectedResult: true
  })
})

jb.component('ui-test.editable-text-by-control', { /* uiTest.editableTextByControl */
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: styleByControl(
        group({
          controls: [

          ],
          features: [variable({name: 'expandableContext', value: obj()})]
        }),
        'editableTextModel'
      )
    }),
    expectedResult: true
  })
})

jb.component('ui-test.two-way-binding', { /* uiTest.twoWayBinding */
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%', features: id('inp')}),
        text('%$person/name%')
      ]
    }),
    action: ctx => ctx.run(uiAction.setText('hello', '#inp')),
    expectedResult: contains(['<span', 'hello', '</span'])
  })
})

jb.component('ui-test.group-horizontal', { /* uiTest.groupHorizontal */
  impl: uiTest({
    control: group({
      layout: layout.horizontal(30),
      controls: [
        button('button1'),
        text('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.layout-vertical', { /* uiTest.layoutVertical */
  impl: uiTest({
    control: group({
      layout: layout.vertical(30),
      controls: [
        button('button1'),
        text('label1')
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
        content: text('jbart'),
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
      action: openDialog({id: 'hello', content: text('jbart'), title: text('hello as label')})
    }),
    action: uiAction.click('button'),
    expectedResult: contains({text: 'hello as label', allText: test.dialogContent('hello')})
  })
})

jb.component('ui-test.refresh-dialog', { /* uiTest.refreshDialog */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        id: 'hello',
        content: text('%$person/name%'),
        features: interactive(
          action.if(
              '%$person/name% == \"mukki\"',
              '',
              runActions(writeValue('%$person/name%', 'mukki'), (ctx,{cmp}) => cmp.refresh())
            )
        )
      })
    }),
    action: uiAction.click('button'),
    expectedResult: contains({text: 'mukki', allText: test.dialogContent('hello')})
  })
})

jb.component('ui-test.dialog-cleanup', { /* uiTest.dialogCleanup */
  impl: uiTest({
    vars: [Var('cleanup', obj(prop('destroy'), prop('tickAfterDestroy')))],
    control: button({
      title: 'click me',
      action: openDialog({
        id: 'hello',
        content: text('world'),
        title: 'hello',
        features: ctx => ({
          destroy: cmp => {
            ctx.run(writeValue('%$cleanup/destroy%',
              cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' ))
            jb.delay(1).then(()=> ctx.run(writeValue('%$cleanup/tickAfterDestroy%',
              cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' )))
          }
        })
      })
    }),
    action: [uiAction.click('button'), dialog.closeAll(), delay(20)],
    expectedResult: and(
      equals('%$cleanup/destroy%', 'attached'),
      equals('%$cleanup/tickAfterDestroy%', 'detached')
    )
  })
})

jb.component('ui-test.dialog-cleanup-bug', { /* uiTest.dialogCleanupBug */
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: text('world'), title: 'hello'})
    }),
    action: [uiAction.click('button'), dialog.closeAll()],
    expectedResult: ctx =>
      !jb.resources['jb_dialog_hello']
  })
})

// ensure the right order between the unmount that causes elem._component = null and the blur event which is automatically generated when detaching the dialog
jb.component('ui-test.updateOnBlur-when-dialog-closed', { /* uiTest.updateOnBlurWhenDialogClosed */
  impl: uiTest({
    control: group({
      controls: [
        button({
          title: 'click me',
          action: ctx => ctx.setVars({elemToTest:null}).run(openDialog({content:
            editableText({title: 'name', updateOnBlur: true, databind: '%$person/name%' })
          }))
        }),
        text('%$person/name%')
      ]
    }),
    action: runActions(
      uiAction.click('button'),
      ctx => {
        // document.querySelector('input').value = 'hello'
        // document.querySelector('input').focus()
        // document.querySelector('.dialog-close').click()
      }
    ),
    expectedResult: true
  })
})

jb.component('ui-test.group-flex', { /* uiTest.groupFlex */
  impl: uiTest({
    control: group({
      layout: layout.flex('row'),
      controls: [
        button('button1'),
        text('label1')
      ]
    }),
    expectedResult: contains(['button1', 'label1'])
  })
})

jb.component('ui-test.button-click', { /* uiTest.buttonClick */
  impl: uiTest({
    control: button({title: 'Click Me', action: writeValue('%$person/name%', 'mukki')}),
    action: uiAction.click('button'),
    expectedResult: equals('%$person/name%', 'mukki')
  })
})

jb.component('ui-test.button-x', { /* uiTest.buttonX */
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1), style: button.x()}),
    expectedResult: contains('×')
  })
})

jb.component('ui-test.resource', { /* uiTest.resource */
  impl: uiTest({
    control: button('%$person.name%'),
    expectedResult: contains('Homer')
  })
})

jb.component('ui-test.features-css', { /* uiTest.featuresCss */
  impl: uiTest({
    control: text({text: 'Hello World', features: css('color: red')}),
    expectedResult: ctx => {
      const elem = ctx.vars.elemToTest
      document.body.appendChild(elem)
      const ret = getComputedStyle(elem.firstElementChild).color == 'rgb(255, 0, 0)'
      document.body.removeChild(elem)
      return ret
    }
  })
})

jb.component('ui-test.itemlist', { /* uiTest.itemlist */
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: text('%$item.name% - %name%')}),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('ui-test.itemlist.shown-only-on-item-hover', { /* uiTest.itemlist.shownOnlyOnItemHover */
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: [
        text('%name%'),
        button({
          title: 'delete',
          style: button.x(),
          features: [itemlist.shownOnlyOnItemHover(), field.columnWidth('50px')]
        })
      ],
      style: table.plain()
    }),
    expectedResult: contains(['Homer Simpson'])
  })
})

jb.component('ui-test.itemlist-with-select', { /* uiTest.itemlistWithSelect */
  impl: uiTest({
    control: itemlist({
      items: list('%$people%', '%$people%', '%$people%'),
      controls: text('%$item.name% - %name%'),
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
          controls: text({text: '%name%', features: css.class('drag-handle')}),
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
          controls: text('%name%'),
          features: watchRef('%$watchable-people%')
        })
      ]
    }),
    action: [
      delay(10),
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
    control: itemlist({items: '%$people%', controls: text('%name%')}),
    expectedResult: contains(['Homer Simpson', 'Bart Simpson'])
  })
})

jb.component('ui-test.itemlist-add-button', { /* uiTest.itemlistAddButton */
  impl: uiTest({
    control: group({
      controls: [
        itemlist({items: '%$people%', controls: text('%$item.name% - %name%')}),
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
      controls: text('%$item.name%'),
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

jb.component('ui-test.itemlist-MD-auto-select-first', { /* uiTest.itemlistMDAutoSelectFirst */
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people%',
          controls: text('%$item.name%'),
          features: [
            itemlist.selection({
              databind: '%$globals/selectedPerson%',
              autoSelectFirst: true
            }),
            itemlist.keyboardSelection(true)
          ]
        }),
        text({
          text: '%$globals/selectedPerson/name% selected',
          features: watchRef('%$globals/selectedPerson%')
        })
      ]
    }),
    expectedResult: contains(['Homer Simpson', 'Homer Simpson selected'])
  })
})

jb.component('ui-test.itemlist-container-search-ctrl', { /* uiTest.itemlistContainerSearchCtrl */
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer.search({}),
      itemlist({
        items: '%$people%',
        controls: text({
          text: text.highlight('%name%', '%$itemlistCntrData/search_pattern%'),
          features: [css.class('label1'), watchRef('%$itemlistCntrData/search_pattern%')]
        }),
        features: [
          itemlist.fastFilter(),
          itemlist.selection({autoSelectFirst: true}),
          itemlist.keyboardSelection({
            autoFocus: true,
            onEnter: writeValue('%$person/selected%', '%name%')
          })
        ]
      })
    ],
    features: group.itemlistContainer({})
  })
})

jb.component('ui-test.itemlist-container-search', { /* uiTest.itemlistContainerSearch */
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    action: uiAction.setText('ho', '.mdc-text-field'),
    expectedResult: contains(['Ho', 'mer', 'display: none;', 'display: none;'])
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
      controls: text('%name%'),
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
          controls: text({text: text.highlight('%name%', '%$itemlistCntrData/search_pattern%')}),
          features: [
            itemlist.selection({autoSelectFirst: true}),
            itemlist.keyboardSelection(true),
            watchRef('%$itemlistCntrData/search_pattern%')
          ]
        })
      ],
      features: [group.itemlistContainer({})]
    }),
    action: uiAction.setText('ho', '.mdc-text-field'),
    expectedResult: ctx => true
  })
})

jb.component('ui-test.itemlist-with-table-style', { /* uiTest.itemlistWithTableStyle */
  impl: uiTest({
    control: itemlist({
      items: '%$watchable-people%',
      controls: [
        text({text: '%$index%', title: 'index', features: field.columnWidth(40)}),
        text({text: '%name%', title: 'name', features: field.columnWidth(300)}),
        text({text: '%age%', title: 'age'})
      ],
      style: table.plain(),
      features: [
        itemlist.selection({
          databind: '%$globals/selectedPerson%',
          autoSelectFirst: true
        })
      ]
    }),
    action: delay(20),
    expectedResult: contains(['300', 'age', 'Homer Simpson', '38', '>3<', 'Bart'])
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

jb.component('ui-test.editable-text-in-group', { /* uiTest.editableTextInGroup */
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%'}),
        editableText({title: 'name', databind: '%$person/name%'}),
        text('%$person/name%')
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
        text('%$a1%')
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
          style: propertySheet.titlesAbove({}),
          controls: [
            editableText({title: 'name', databind: '%$person/name%'}),
            editableText({title: 'address', databind: '%$person/address%'})
          ]
        }),
        text('%$person/name%')
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
      layout: layout.vertical(),
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
        text('%$person/age%')
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
          style: editableBoolean.mdcSlideToggle(),
          title: 'male'
        }),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.expandCollapse(),
          title: 'male'
        }),
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.mdcXV(),
          title: 'male'
        }),
        text('%$person/male%')
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
        text({
          text: 'inner text',
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
            features: id('expCollapse')
          }),
          text({
            text: 'inner text',
            features: [feature.if('%$expanded%'), watchRef('%$expanded%')]
          })
        ],
        features: [watchRef('%$default%'), feature.init(writeValue('%$expanded%', '%$default%'))]
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
    action: uiAction.click('#default', 'toggle'),
    expectedResult: contains('inner text')
  })
})

jb.component('ui-test.editable-boolean.expand-collapse-with-default-collapse', { /* uiTest.editableBoolean.expandCollapseWithDefaultCollapse */
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    action: runActions(),
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
  impl: text({
    text: call('title')
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
        text({
          text: ctx => jb_prettyPrintComp('ui-test.inner-label1-tst', jb.comps['ui-test.inner-label1-tst']),
          style: {'$': 'text.multi-line'}
        }),
        text({
          text: ctx => jb_prettyPrintComp('editable-text.codemirror', jb.comps['editable-text.codemirror']),
          style: text.codemirror({})
        })
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
        text('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.picklist-radio', { /* uiTest.picklistRadio */
  impl: uiTest({
    control: picklist({
      title: 'city',
      databind: '%$personWithAddress/address/city%',
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.radio()
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

jb.component('ui-test.field-title-of-label', { /* uiTest.fieldTitleOfLabel */
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft({}),
      controls: text({text: '%$personWithAddress/address/city%', features: field.title('City')})
    }),
    expectedResult: contains('City')
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
        text('%$personWithAddress/address/city%')
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
        text('a1'),
        inlineControls(text('a2'), text('a3'))
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
        group({title: 'tab1', controls: text('in tab1')}),
        group({title: 'tab2', controls: text('in tab2')})
      ]
    }),
    expectedResult: and(contains(['tab1', 'in tab1']), contains('tab2'), not(contains('in tab2')))
  })
})

jb.component('ui-test.group.accordion', { /* uiTest.group.accordion */
  impl: uiTest({
    control: group({
      style: group.accordion({}),
      controls: [
        group({title: 'tab1', controls: text('in tab1')}),
        group({title: 'tab2', controls: text('in tab2')})
      ]
    }),
    action: delay(1),
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
    control: text({
      text: 'Hello World',
      style: styleByControl(button('%$labelModel/text%2'), 'labelModel')
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
          style: picklist.labelList({})
        }),
        text('%$personWithAddress/address/city%')
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
      controls: text('%title%'),
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

jb.component('ui-test.raw-vdom', { /* uiTest.rawVdom */
  impl: uiTest({
    control: ctx => jb.ui.h('div',{},'hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('ui-test.control.first-succeeding', { /* uiTest.control.firstSucceeding */
  impl: uiTest({
    control: group({
      controls: [
        group({
          controls: controlWithCondition('%$gender% == \"male\"', text('male')),
          features: group.firstSucceeding()
        }),
        group({
          controls: [
            controlWithCondition('%$gender% == \"female\"', text('female')),
            controlWithCondition('%$gender% != \"female\"', text('male2')),
            controlWithCondition(true, text('second-succeeding'))
          ],
          features: group.firstSucceeding()
        })
      ],
      features: [variable({name: 'gender', value: 'male'})]
    }),
    expectedResult: and(contains(['male', 'male2']), not(contains('second-succeeding')))
  })
})

jb.component('ui-test.control.first-succeeding-inner-var', { /* uiTest.control.firstSucceedingInnerVar */
  impl: uiTest({
    control: group({
      controls: controlWithCondition('%$innerVar% == \"5\"', text('innerVar')),
      features: [group.firstSucceeding(), variable({name: 'innerVar', value: '5'})]
    }),
    expectedResult: contains('innerVar')
  })
})

jb.component('ui-test.control.first-succeeding-default', { /* uiTest.control.firstSucceedingDefault */
  impl: uiTest({
    control: group({
      controls: [
        controlWithCondition(false, text('female')),
        text('defaultCtrl')
      ],
      features: group.firstSucceeding()
    }),
    expectedResult: contains('defaultCtrl')
  })
})

jb.component('ui-test.control.first-succeeding-without-condition', { /* uiTest.control.firstSucceedingWithoutCondition */
  impl: uiTest({
    control: group({
      controls: [
        text('withoutCondition'),
        controlWithCondition(true, text('female'))
      ],
      features: group.firstSucceeding()
    }),
    expectedResult: contains('withoutCondition')
  })
})

jb.component('ui-test.first-succeeding-watchable-sample', { /* uiTest.firstSucceedingWatchableSample */
  type: 'control',
  impl: group({
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
      group({
        controls: [
          controlWithCondition('%$gender% == \"male\"', text('a male')),
          text('not male')
        ],
        features: [group.firstSucceeding(), watchRef('%$gender%')]
      })
    ],
    features: variable({name: 'gender', value: 'male', watchable: true})
  })
})

jb.component('ui-test.first-succeeding.watch-refresh-on-ctrl-change', { /* uiTest.firstSucceeding.watchRefreshOnCtrlChange */
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: uiAction.click('#female'),
    expectedResult: contains('not male'),
    expectedCounters: {renderVdom: 9}
  })
})

jb.component('ui-test.first-succeeding.same-does-not-recreate', { /* uiTest.firstSucceeding.sameDoesNotRecreate */
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: [uiAction.click('#female'), uiAction.click('#zee')],
    expectedResult: contains('not male'),
    expectedCounters: {renderVdom: 9}
  })
})

jb.component('ui-test.first-succeeding.watch-refresh-on-ctrl-change-and-back', { /* uiTest.firstSucceeding.watchRefreshOnCtrlChangeAndBack */
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: runActions(uiAction.click('#female'), uiAction.click('#male')),
    expectedResult: contains('a male'),
    expectedCounters: {renderVdom: 11}
  })
})

jb.component('ui-test.watchRef.recalcVars', { /* uiTest.watchRef.recalcVars */
  impl: uiTest({
    control: text({
      text: '%$changed%',
      features: [
        variable({name: 'changed', value: '--%$person/name%--'}),
        watchRef('%$person/name%')
      ]
    }),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains('--hello--')
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
          textForFalse: 'girl',
          features: id('male')
        })
      ]
    }),
    expectedResult: contains('male')
  })
})

jb.component('ui-test.hidden-ref-bug', { /* uiTest.hiddenRefBug */
  impl: uiTest({
    control: group({
      controls: text({text: 'hey', features: hidden('%$hidden%')}),
      features: variable({name: 'hidden', watchable: true})
    }),
    expectedResult: contains('display:none')
  })
})

jb.component('ui-test.css-dynamic', { /* uiTest.cssDynamic */
  impl: uiTest({
    control: group({
      controls: [
        text({
          text: '%$color%',
          features: [css.dynamic('{ color: %$color% }'), id('label')]
        }),
        button({
          title: 'green',
          action: writeValue('%$color%', 'green'),
          features: id('green')
        }),
        button({title: 'blue', action: writeValue('%$color%', 'blue')})
      ],
      features: variable({name: 'color', value: 'blue', watchable: true})
    }),
    action: uiAction.click('#green'),
    expectedResult: pipeline(ctx => jb.ui.cssOfSelector('#label',ctx), contains('color: green'))
  })
})

jb.component('ui-test.css-with-condition', { /* uiTest.cssWithCondition */
  impl: uiTest({
    control: group({
      controls: [
        text({
          text: '%$color%',
          features: [
            css.dynamic('{ color: %$color% }'),
            css.withCondition('%$color%==blue', '{background: white}'),
            css.withCondition('%$color%==green', '{background: grey}'),
            id('label')
          ]
        }),
        button({
          title: 'green',
          action: writeValue('%$color%', 'green'),
          features: id('green')
        }),
        button({title: 'blue', action: writeValue('%$color%', 'blue')})
      ],
      features: variable({name: 'color', value: 'blue', watchable: true})
    }),
    action: uiAction.click('#green'),
    expectedResult: pipeline(
      ctx => jb.ui.cssOfSelector('#label',ctx),
      contains(['color: green', 'grey'])
    )
  })
})

jb.component('ui-test.validator', { /* uiTest.validator */
  impl: uiTest({
    control: group({
      controls: [
        editableText({
          databind: '%$person/name%',
          features: [id('fld'), validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')]
        })
      ],
      features: variable({name: 'formContainer', value: obj(prop('err', ''))})
    }),
    action: uiAction.setText('a b', '#fld'),
    expectedResult: contains('invalid project name')
  })
})

jb.component('ui-test.watchable-variable-as-proxy', { /* uiTest.watchableVariableAsProxy */
  impl: uiTest({
    control: group({features: variable({name: 'link', value: '%$person%', watchable: true})}),
    expectedResult: ctx => jb.resources[Object.keys(jb.resources).filter(x=>x.match(/link:[0-9]*/))[0]][Symbol.for("isProxy")]
  })
})


jb.component('ui-test.watchable-link-write-original-watch-link', { /* uiTest.watchableLinkWriteOriginalWatchLink */
  impl: uiTest({
    control: group({
      controls: [
        text('%$person/name%'),
        text('%$link/name%')
      ],
      features: variable({name: 'link', value: '%$person%', watchable: true})
    }),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains(['hello', 'hello'])
  })
})

jb.component('ui-test.watchable-write-via-link', { /* uiTest.watchableWriteViaLink */
  impl: uiTest({
    control: group({
      controls: [
        text('%$person/name%'),
        text('%$link/name%'),
        button({
          title: 'set',
          action: writeValue('%$link/name%', 'hello'),
          features: id('set')
        })
      ],
      features: variable({name: 'link', value: '%$person%', watchable: true})
    }),
    action: uiAction.click('#set'),
    expectedResult: contains(['hello', 'hello'])
  })
})

// jb.component('ui-test.watchable-override-link-val', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         text({text: '%$person/name%' }),
//         text({text: '%$link/name%' }),
//         button({title: 'set', action: writeValue('%$link%',obj(prop('name','hello'))), features: id('set')})
//       ],
//       features: variable({name: 'link', value: '%$person%', watchable: true})
//     }),
//     action: uiAction.click('#set'),
//     expectedResult: contains(['Homer','hello'])
//   })
// })

jb.component('ui-test.watchable-parent-refresh-mask-children', { /* uiTest.watchableParentRefreshMaskChildren */
  impl: uiTest({
    control: group({controls: text('%$person/name%'), features: watchRef('%$person/name%')}),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains('hello'),
    expectedCounters: {notifyObservableElem: 1}
  })
})

jb.component('ui-test.watchable-url', { /* uiTest.watchableUrl */
  impl: uiTest({
    control: text('%$person/name%'),
    expectedResult: contains('observe=\"resources://2~name;person~name')
  })
})

jb.component('ui-test.itemlist-with-group-wait', { /* uiTest.itemlistWithGroupWait */
  impl: uiTest({
    control: itemlist({
      items: '%$items%',
      controls: text('%name%'),
      features: group.wait({for: pipe(delay(1), ()=>[{name: 'homer'}]), varName: 'items'})
    }),
    action: delay(20),
    expectedResult: contains('homer')
  })
})

jb.component('ui-test.watchable-ref-to-inner-elements-when-value-is-empty', { /* uiTest.watchableRefToInnerElementsWhenValueIsEmpty */
  impl: uiTest({
    control: group({
      controls: [
        text('%$selected/name%'),
        button({
          title: 'set',
          action: writeValue('%$selected%', obj(prop('name', 'hello'))),
          features: id('set')
        })
      ],
      features: variable({name: 'selected', watchable: true})
    }),
    action: uiAction.click('#set'),
    expectedResult: true
  })
})

jb.component('ui-test.infinite-scroll', {
  impl: uiTest({
    control: itemlist({
      items: range(0,10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        css.height({height: '100', overflow: 'scroll'}),
        itemlist.infiniteScroll(),
        css.width('600')
      ]
    }),
    action: uiAction.scrollDown('.jb-itemlist'),
    expectedResult: contains('>8<')
  })
})


