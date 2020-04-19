jb.component('globals', {
  watchableData: {}
})

jb.component('watchablePeople', {
  watchableData: [
    {name: 'Homer Simpson - watchable', age: 42, male: true},
    {name: 'Marge Simpson - watchable', age: 38, male: false},
    {name: 'Bart Simpson - watchable', age: 12, male: true}
  ]
})

jb.component('people', {
  passiveData: [
    {name: 'Homer Simpson', age: 42, male: true},
    {name: 'Marge Simpson', age: 38, male: false},
    {name: 'Bart Simpson', age: 12, male: true}
  ]
})

jb.component('person', {
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

jb.component('personWithAddress', {
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

jb.component('personWithPrimitiveChildren', {
  watchableData: {
    childrenNames: ['Bart','Lisa','Maggie'],
  }
})

jb.component('personWithChildren', {
  watchableData: {
    name: 'Homer Simpson',
    children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}],
    friends: [{name: 'Barnie'}]
  }
})

jb.component('emptyArray', {
  watchableData: []
})


jb.component('uiTest.label', {
  impl: uiTest({
    control: text('hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('uiTest.html', {
  impl: uiTest({
    control: html({html: '<p>hello world</p>'}),
    expectedResult: contains('<p>hello world</p>')
  })
})

jb.component('uiTest.html.inIframe', {
  impl: uiTest({
    control: html({html: '<p>hello world</p>', style: html.inIframe()}),
    expectedResult: contains('iframe')
  })
})

jb.component('uiTest.group', {
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

jb.component('uiTest.waitForWithPipe', {
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

jb.component('uiTest.asynchLabel', {
  impl: uiTest({
    control: text({text: pipe(delay(10), 'hello'), features: text.allowAsynchValue()}),
    action: delay(40),
    expectedResult: contains('hello')
  })
})

jb.component('uiTest.waitForWithVar', {
  impl: uiTest({
    control: group({
      controls: text('%$txt%'),
      features: group.wait({for: pipe(delay(1), 'hello'), varName: 'txt'})
    }),
    action: delay(40),
    expectedResult: contains('hello')
  })
})

// jb.component('uiTest.watchObservable', {
//   impl: uiTest({
//     vars: Var('promise', ctx => jb.delay(1)),
//     control: text({
//       text: '%$person/name%',
//       features: watchObservable({ toWatch: (ctx,{promise}) => jb.callbag.fromPromise(promise) })
//     }),
//     expectedCounters: {setState: 1},
//     expectedResult: true
//   })
// })

jb.component('uiTest.button', {
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1)}),
    expectedResult: contains('btn1')
  })
})

jb.component('uiTest.button.mdcIcon', {
  impl: uiTest({
    control: button({title: 'btn1', action: ctx => alert(1), style: button.mdcIcon(icon('build'))}),
    expectedResult: contains('build')
  })
})


jb.component('uiTest.group2', {
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

jb.component('uiTest.editableText', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.input()
    }),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('uiTest.editableTextEmpty', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name1%',
      style: editableText.input()
    }),
    expectedResult: not(contains('object'))
  })
})

jb.component('uiTest.editableTextMdc', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.mdcInput()
    }),
    expectedResult: contains(['input', 'Homer Simpson'])
  })
})

jb.component('uiTest.editableText.xButton', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      features: [editableText.xButton()]
    }),
    expectedResult: contains({text: ['×', 'input', 'Homer Simpson'], inOrder: false})
  })
})

jb.component('uiTest.editableTextExpandable', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.expandable({})
    }),
    expectedResult: true
  })
})

jb.component('uiTest.editableTextByControl', {
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

jb.component('uiTest.twoWayBinding', {
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

jb.component('uiTest.groupHorizontal', {
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

jb.component('uiTest.layoutVertical', {
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

jb.component('uiTest.openDialog', {
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

jb.component('uiTest.codeMirrorDialogResizer', {
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

jb.component('uiTest.codeMirrorDialogResizerOkCancel', {
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

jb.component('uiTest.renderable', {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({id: 'hello', content: text('jbart'), title: text('hello as label')})
    }),
    action: uiAction.click('button'),
    expectedResult: contains({text: 'hello as label', allText: test.dialogContent('hello')})
  })
})

jb.component('uiTest.refreshDialog', {
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

jb.component('uiTest.dialogCleanup', {
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

jb.component('uiTest.dialogCleanupBug', {
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
jb.component(' uiTest.updateOnBlurWhenDialogClosed', {
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

jb.component('uiTest.groupFlex', {
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

jb.component('uiTest.buttonClick', {
  impl: uiTest({
    control: button({title: 'Click Me', action: writeValue('%$person/name%', 'mukki')}),
    action: uiAction.click('button'),
    expectedResult: equals('%$person/name%', 'mukki')
  })
})

jb.component('uiTest.buttonX', {
  impl: uiTest({
    control: button({title: 'Click Me', action: () => alert(1), style: button.x()}),
    expectedResult: contains('×')
  })
})

jb.component('uiTest.resource', {
  impl: uiTest({
    control: button('%$person.name%'),
    expectedResult: contains('Homer')
  })
})

jb.component('uiTest.featuresCss', {
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

jb.component('uiTest.itemlist', {
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: text('%$item.name% - %name%')}),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('uiTest.itemlistPrimitiveArray', {
  impl: uiTest({
    control: itemlist({items: '%$personWithPrimitiveChildren/childrenNames%', controls: text('%%')}),
    expectedResult: contains(['Bart','Lisa','Maggie'])
  })
})

jb.component('uiTest.itemlistPrimitiveArrayItemShouldBeRef', {
  impl: uiTest({
    vars: Var('isResultRef', obj(prop('answer',false))),
    control: itemlist({items: '%$personWithPrimitiveChildren/childrenNames%', 
      controls: ctx => { 
        ctx.run(writeValue('%$isResultRef/answer%', () => !!jb.isRef(ctx.data)))
        return ctx.run(text('%%'))
      }
    }),
    expectedResult: '%$isResultRef/answer%'
  })
})

jb.component('uiTest.itemlistPrimitiveArrayItemShouldBeRef.tableStyle', {
  impl: uiTest({
    vars: Var('isResultRef', obj(prop('answer',false))),
    control: itemlist({items: '%$personWithPrimitiveChildren/childrenNames%', 
      style: table.mdc(),
      controls: ctx => { 
        ctx.run(writeValue('%$isResultRef/answer%', () => !!jb.isRef(ctx.vars.$props.items[0])))
        return ctx.run(text('%%'))
      }
    }),
    expectedResult: '%$isResultRef/answer%'
  })
})




jb.component('uiTest.itemlist.shownOnlyOnItemHover', {
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

jb.component('uiTest.itemlistWithSelect', {
  impl: uiTest({
    control: itemlist({
      items: list('%$people%', '%$people%', '%$people%'),
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({})
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

jb.component('uiTest.itemlistDD', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text({text: '%name%', features: css.class('drag-handle')}),
          features: [
            itemlist.selection({
              databind: '%$globals/selectedPerson%',
              autoSelectFirst: true
            }),
            itemlist.keyboardSelection(true),
            itemlist.dragAndDrop(),
            watchRef('%$watchablePeople%'),
            id('itemlist')
          ]
        }),
        itemlist({
          items: '%$watchablePeople%',
          controls: text('%name%'),
          features: watchRef('%$watchablePeople%')
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

jb.component('uiTest.itemlistBasic', {
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: text('%name%')}),
    expectedResult: contains(['Homer Simpson', 'Bart Simpson'])
  })
})

jb.component('uiTest.itemlistAddButton', {
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

jb.component('uiTest.itemlistSelection', {
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

jb.component('uiTest.itemlistMDAutoSelectFirst', {
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

jb.component('uiTest.itemlistMDOfRefs', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text('%$item.name%'),
          features: [
            id('itemlist'),
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
    action: uiAction.keyboardEvent({ selector: '#itemlist',type: 'keydown', keyCode: 40 }),
    expectedResult: contains(['Marge Simpson', 'Marge Simpson - watchable selected'])
  })
})

jb.component('uiTest.itemlistMDOfRefs.refChangeBug', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text('%$item.name%'),
          features: [
            id('itemlist'),
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
    action: runActions(uiAction.click('#itemlist>li:nth-Child(3)'),
    uiAction.click('#itemlist>li:nth-Child(2)')
    ),
    expectedResult: contains(['Marge Simpson', 'Marge Simpson - watchable selected'])
  })
})

jb.component('uiTest.itemlistContainerSearchCtrl', {
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

jb.component('uiTest.itemlistContainerSearch', {
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    action: uiAction.setText('ho', '.mdc-text-field'),
    expectedResult: contains(['Ho', 'mer', 'display: none;', 'display: none;'])
  })
})

jb.component('uiTest.itemlistContainerSearchEnterOnLi', {
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    action: uiAction.keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13}),
    expectedResult: equals('%$person/selected%', 'Homer Simpson')
  })
})

jb.component('uiTest.secondaryLinkSetBug', {
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

jb.component('uiTest.searchDoesnotCreateReactClass', {
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

jb.component('uiTest.itemlistWithTableStyle', {
  impl: uiTest({
    control: itemlist({
      items: '%$watchablePeople%',
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

jb.component('uiTest.table', {
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

jb.component('uiTest.editableTextInGroup', {
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

jb.component('uiTest.editableTextWithJbVal', {
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

jb.component('uiTest.propertySheet.titlesAbove', {
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

jb.component('uiTest.propertySheet.titlesLeft', {
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

jb.component('uiTest.editableNumber', {
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

jb.component('uiTest.editableNumberSlider', {
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: contains('42')
  })
})

jb.component('uiTest.editableNumberSliderEmpty', {
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age1%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: true
  })
})

jb.component('uiTest.editableBoolean.allStyles', {
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

jb.component('uiTest.editableBooleanSettings', {
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

jb.component('uiTest.editableBoolean.expandCollapse', {
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

jb.component('uiTest.expandCollapseWithDefaultCollapse', {
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

jb.component('uiTest.editableBoolean.expandCollapseWithDefaultVal', {
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    action: uiAction.click('#default', 'toggle'),
    expectedResult: contains('inner text')
  })
})

jb.component('uiTest.editableBoolean.expandCollapseWithDefaultCollapse', {
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    action: runActions(),
    expectedResult: not(contains('inner text'))
  })
})

jb.component('uiTest.codeMirror', {
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

jb.component('uiTest.innerLabel1Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: text({
    text: call('title')
  })
})

jb.component('uiTest.innerLabel2Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel1Tst(
    call('title')
  )
})

jb.component('uiTest.innerLabel3Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel2Tst(
    call('title')
  )
})

jb.component('uiTest.prettyPrintComp', {
  impl: {
    '$': 'ui-test2',
    waitForPromise: delay(50),
    control: group({
      controls: [
        text({
          text: ctx => jb_prettyPrintComp('uiTest.innerLabel1Tst', jb.comps['uiTest.innerLabel1Tst']),
          style: {'$': 'text.multi-line'}
        }),
        text({
          text: ctx => jb_prettyPrintComp('editableText.codemirror', jb.comps['editableText.codemirror']),
          style: text.codemirror({})
        })
      ]
    }),
    expectedResult: contains(['dynamic: true'])
  }
})

jb.component('uiTest.picklist', {
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

jb.component('uiTest.picklistRadio', {
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

jb.component('uiTest.fieldTitleOfLabel', {
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft({}),
      controls: text({text: '%$personWithAddress/address/city%', features: field.title('City')})
    }),
    expectedResult: contains('City')
  })
})

jb.component('uiTest.picklistSort', {
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

jb.component('uiTest.picklistGroups', {
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

jb.component('uiTest.dynamicControls', {
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

jb.component('uiTest.inlineControls', {
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

jb.component('uiTest.tabs', {
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

jb.component('uiTest.group.accordion', {
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

jb.component('uiTest.innerLabel', {
  impl: uiTest({
    control: uiTest.innerLabel3Tst('Hello World2'),
    expectedResult: contains('Hello World2')
  })
})

jb.component('uiTest.markdown', {
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

jb.component('uiTest.styleByControl', {
  impl: uiTest({
    control: text({
      text: 'Hello World',
      style: styleByControl(button('%$labelModel/text%2'), 'labelModel')
    }),
    expectedResult: contains('Hello World2')
  })
})

jb.component('uiTest.picklistAsItemlist', {
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

jb.component('menuTest.menu1', {
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

jb.component('menuTest.pulldown', {
  impl: uiTest({
    control: menu.control({menu: menuTest.menu1(), style: menuStyle.pulldown({})}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit', 'dynamic-1', 'dynamic-3'])
  })
})

jb.component('menuTest.contextMenu', {
  impl: uiTest({
    control: menu.control({menu: menuTest.menu1()}),
    action: ctx => jb.delay(1),
    expectedResult: contains(['File', 'Edit'])
  })
})

jb.component('menuTest.openContextMenu', {
  impl: uiTest({
    control: button({title: 'open', action: menu.openContextMenu({menu: menuTest.menu1()})}),
    expectedResult: contains('open')
  })
})

jb.component('uiTest.refreshControlById.text', {
  impl: uiTest({
    vars: Var('person1', () => ({name: 'Homer'})), // non watchable var
    control: text({ text: '%$person1/name%', features: id('t1') }),
    action: runActions(
      writeValue('%$person1/name%','Dan'),
      refreshControlById('t1'),
    ),
    expectedResult: ctx => ctx.run(contains('Dan'))
  })
})

jb.component('uiTest.rawVdom', {
  impl: uiTest({
    control: ctx => jb.ui.h('div',{},'hello world'),
    expectedResult: contains('hello world')
  })
})

jb.component('uiTest.control.firstSucceeding', {
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

jb.component('uiTest.control.firstSucceedingInnerVar', {
  impl: uiTest({
    control: group({
      controls: controlWithCondition('%$innerVar% == \"5\"', text('innerVar')),
      features: [group.firstSucceeding(), variable({name: 'innerVar', value: '5'})]
    }),
    expectedResult: contains('innerVar')
  })
})

jb.component('uiTest.control.firstSucceedingDefault', {
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

jb.component('uiTest.control.firstSucceedingWithoutCondition', {
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

jb.component('uiTest.firstSucceedingWatchableSample', {
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

jb.component('uiTest.firstSucceeding.watchRefreshOnCtrlChange', {
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: uiAction.click('#female'),
    expectedResult: contains('not male'),
    expectedCounters: {renderVdom: 9}
  })
})

jb.component('uiTest.firstSucceeding.sameDoesNotRecreate', {
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: [uiAction.click('#female'), uiAction.click('#zee')],
    expectedResult: contains('not male'),
    expectedCounters: {renderVdom: 9}
  })
})

jb.component('uiTest.firstSucceeding.watchRefreshOnCtrlChangeAndBack', {
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    action: runActions(uiAction.click('#female'), uiAction.click('#male')),
    expectedResult: contains('a male'),
    expectedCounters: {renderVdom: 11}
  })
})

jb.component('uiTest.watchRef.recalcVars', {
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

jb.component('uiTest.focusOnFirstElement', {
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

jb.component('uiTest.checkBoxWithText', {
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

jb.component('uiTest.hiddenRefBug', {
  impl: uiTest({
    control: group({
      controls: text({text: 'hey', features: hidden('%$hidden%')}),
      features: variable({name: 'hidden', watchable: true})
    }),
    expectedResult: contains('display:none')
  })
})

// jb.component('uiTest.cssDynamic', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         text({
//           text: '%$color%',
//           features: [css.dynamic('{ color: %$color% }'), id('label')]
//         }),
//         button({
//           title: 'green',
//           action: writeValue('%$color%', 'green'),
//           features: id('green')
//         }),
//         button({title: 'blue', action: writeValue('%$color%', 'blue')})
//       ],
//       features: variable({name: 'color', value: 'blue', watchable: true})
//     }),
//     action: uiAction.click('#green'),
//     expectedResult: pipeline(ctx => jb.ui.cssOfSelector('#label',ctx), contains('color: green'))
//   })
// })

jb.component('uiTest.validator', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({
          title: 'project',
          databind: '%$person/project%',
          features: [id('fld'), validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')]
        })
      ],
//      features: variable({name: 'formContainer', value: obj(prop('err', ''))})
    }),
    action: uiAction.setText('a b', '#fld'),
    expectedResult: contains('invalid project name')
  })
})

jb.component('uiTest.watchableVariableAsProxy', {
  impl: uiTest({
    control: group({features: variable({name: 'link', value: '%$person%', watchable: true})}),
    expectedResult: ctx => jb.resources[Object.keys(jb.resources).filter(x=>x.match(/link:[0-9]*/))[0]][Symbol.for("isProxy")]
  })
})


jb.component('uiTest.watchableLinkWriteOriginalWatchLink', {
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

jb.component('uiTest.watchableWriteViaLink', {
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

jb.component('uiTest.watchableParentRefreshMaskChildren', {
  impl: uiTest({
    control: group({controls: text('%$person/name%'), features: watchRef('%$person/name%')}),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains('hello'),
    expectedCounters: {notifyObservableElem: 1}
  })
})

jb.component('uiTest.watchableUrl', {
  impl: uiTest({
    control: text('%$person/name%'),
    expectedResult: contains('observe=\"resources://2~name;person~name')
  })
})

jb.component('uiTest.itemlistWithGroupWait', {
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

jb.component('uiTest.watchableRefToInnerElementsWhenValueIsEmpty', {
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

jb.component('uiTest.infiniteScroll', {
  impl: uiTest({
    control: itemlist({
      items: range(0, 10),
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


