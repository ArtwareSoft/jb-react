
component('uiTest.group', {
  impl: uiTest(group({controls: [text('hello world'), text('2')]}), contains(['hello world','2']))
})

component('uiTest.label', {
  impl: uiTest(text({text: 'hello world', features: css.color('red')}), contains(['hello world','red']))
})

component('uiTest.label0', {
  impl: uiTest({control: text(0), expectedResult: contains('>0<')})
})

component('uiTest.html', {
  impl: uiTest(html('<p>hello world</p>'), contains('>hello world</p>'))
})

component('uiTest.html.inIframe', {
  impl: uiTest({
    control: html({html: '<p>hello world</p>', style: html.inIframe()}),
    expectedResult: contains('iframe')
  })
})

component('uiTest.controls', {
  impl: uiTest(
    group({
      controls: [
        text('hello'),
        controls(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
        text('world')
      ]
    }),
    contains(['hello','-1-','-2-','world'])
  )
})

component('uiTest.waitForWithPipe', {
  impl: uiTest({
    control: group({controls: text('%%'), features: group.wait(pipe(delay(1), 'hello'))}),
    uiAction: waitForNextUpdate(),
    expectedResult: and(contains('hello'), not(contains('loading'))),
    expectedCounters: {'init uiComp': 4}
  })
})

component('uiTest.waitForRx', {
  impl: uiTest({
    control: group({
      controls: text('%%'),
      features: group.wait(rx.pipe(source.interval(10), rx.take(1), rx.map('hello')))
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: and(contains('hello'), not(contains('loading'))),
    expectedCounters: {'init uiComp': 4}
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

component('uiTest.asynchLabel', {
  impl: uiTest({
    control: text({text: pipe(delay(1), 'hello'), features: text.allowAsynchValue()}),
    expectedResult: contains('hello'),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'start renderVdom': 2, 'refresh uiComp !request': 1}
  })
})

component('uiTest.waitForWithVar', {
  impl: uiTest({
    uiAction: waitForNextUpdate(),
    control: group({ controls: text('%$txt%'), features: group.wait({ for: pipe(delay(1), 'hello'), varName: 'txt' }) }),
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
//     expectedCounters: {'start renderVdom': 2},
//     expectedResult: contains('Homer Simpson')
//   })
// })

component('uiTest.button', {
  impl: uiTest({ control: button('btn1', ctx => alert(1)), expectedResult: contains('btn1') })
})

// component('uiTest.button.disabled', {
//   impl: uiTest({
//     control: button({title: 'btn1', action: delay(100), style: button.native()}),
//     uiAction: click(),
//     expectedResult: contains('disabled')
//   })
// })

component('uiTest.button.mdcIcon', {
  impl: uiTest({
    control: button({
      title: 'btn1',
      action: ctx => alert(1),
      style: button.mdcIcon(icon('build'))
    }),
    expectedResult: contains('build')
  })
})

component('uiTest.icon.mdi', {
  impl: uiTest(control.icon({icon: 'Yoga', type: 'mdi'}), contains('svg'))
})

component('uiTest.group2', {
  impl: uiTest(group({controls: [button('button1'), text('label1')]}), contains(['button1','label1']))
})

component('uiTest.editableText', {
  impl: uiTest(
    editableText({title: 'name', databind: '%$person/name%', style: editableText.input()}),
    contains(['input','Homer Simpson'])
  )
})

component('uiTest.editableText.emptyData', {
  impl: uiTest(editableText('name', '%$person/name1%'), not(contains('undefined')))
})

component('uiTest.editableTextEmpty', {
  impl: uiTest(
    editableText({title: 'name', databind: '%$person/name1%', style: editableText.input()}),
    not(contains('object'))
  )
})

component('uiTest.editableTextMdc', {
  impl: uiTest(
    editableText({title: 'name', databind: '%$person/name%', style: editableText.mdcInput()}),
    contains(['input','Homer Simpson'])
  )
})

component('uiTest.editableText.xButton', {
  impl: uiTest(
    editableText({title: 'name', databind: '%$person/name%', features: editableText.xButton()}),
    contains({text: ['×','input','Homer Simpson'], inOrder: false})
  )
})

component('uiTest.twoWayBinding', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({title: 'name', databind: '%$person/name%', style: editableText.input()}),
        text('%$person/name%')
      ]
    }),
    expectedResult: contains(['<span','hello']),
    uiAction: setText('hello')
  })
})

// component('uiTest.sectionExpandCollapse', {
//   impl: uiFrontEndTest({
//     control: remote.widget(group({style: group.sectionExpandCollapse(text('open')), controls: text('hello')})),
//     expectedResult: contains('hello')
//   })
// })

component('uiTest.autoFocusOnFirstInput', {
  impl: uiTest(
    group({
      controls: [
        editableText('name', '%$person/name%'),
        editableText('age', '%$person/age%')
      ],
      features: group.autoFocusOnFirstInput()
    }),
    contains('__focus=\"autoFocusOnFirstInput\"')
  )
})

component('uiTest.layout.horizontal', {
  impl: uiTest(
    group({layout: layout.horizontal(30), controls: [button('button1'), text('label1')]}),
    contains(['button1','label1','margin-right: 30px;'])
  )
})

component('uiTest.layout.vertical', {
  impl: uiTest(
    group({layout: layout.vertical(30), controls: [button('button1'), text('label1')]}),
    contains(['button1','label1','margin-bottom: 30px;'])
  )
})

component('uiTest.openDialog', {
  impl: uiTest({
    control: button(
      'click me',
      openDialog({
        title: 'hello',
        content: text('jbart'),
        id: 'hello',
        features: dialogFeature.nearLauncherPosition()
      })
    ),
    expectedResult: contains(['hello','jbart']),
    uiAction: click('button')
  })
})

component('uiTest.codeMirrorDialogResizer', {
  impl: uiTest({
    control: button({
      title: 'click me',
      action: openDialog({
        content: editableText({
          databind: '%$person/name%',
          style: editableText.codemirror({ mode: 'javascript' })
        }),
        title: 'resizer',
        features: [dialogFeature.nearLauncherPosition({}), dialogFeature.resizer(true)]
      })
    }),
    expectedResult: true
  })
})

component('uiTest.codeMirrorDialogResizerOkCancel', {
  impl: uiTest({
    control: button(
      'click me',
      openDialog({
        title: 'resizer',
        content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
        style: dialog.dialogOkCancel(),
        features: [dialogFeature.nearLauncherPosition(), dialogFeature.resizer(true)]
      })
    ),
    expectedResult: true
  })
})

component('uiTest.renderable', {
  impl: uiTest({
    control: button('click me', openDialog(text('hello as label'), text('jbart'))),
    uiAction: click('button'),
    expectedResult: contains('hello as label')
  })
})

component('uiTest.refreshDialog', {
  impl: uiTest({
    control: button(
      'click me',
      openDialog({
        content: text('%$person/name%'),
        features: followUp.action(writeValue('%$person/name%', 'mukki'))
      })
    ),
    uiAction: uiActions(click('button'), waitForNextUpdate(6)),
    expectedResult: contains('mukki')
  })
})

// jb.component('uiTest.dialogCleanup', {
//   impl: uiFrontEndTest({
//     vars: [Var('cleanup', obj(prop('destroy'), prop('tickAfterDestroy')))],
//     control: button({
//       title: 'click me',
//       action: openDialog({
//         id: 'hello',
//         content: text('world'),
//         title: 'hello',
//         features: ctx => ({
//           destroy: cmp => {
//             ctx.run(writeValue('%$cleanup/destroy%',
//               cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' ))
//             jb.delay(1).then(()=> ctx.run(writeValue('%$cleanup/tickAfterDestroy%',
//               cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' )))
//           }
//         })
//       })
//     }),
//     action: [click('button'), dialog.closeAll(), delay(20)],
//     expectedResult: and(
//       equals('%$cleanup/destroy%', 'attached'),
//       equals('%$cleanup/tickAfterDestroy%', 'detached')
//     )
//   })
// })

component('uiTest.dialogCleanupBug', {
  impl: uiTest({
    control: button('click me', openDialog({title: 'hello', content: text('world'), id: 'hello'})),
    uiAction: uiActions(click(), action(dialog.closeAll())),
    expectedResult: isEmpty(dialog.shownDialogs())
  })
})

// // ensure the right order between the unmount that causes elem._component = null and the blur event which is automatically generated when detaching the dialog
// jb.component('uiTest.updateOnBlurWhenDialogClosed', {
//   impl: uiFrontEndTest({
//     control: group({
//       controls: [
//         button({
//           title: 'click me',
//           action: ctx => ctx.setVars({elemToTest:null}).run(openDialog({content:
//             editableText({title: 'name', updateOnBlur: true, databind: '%$person/name%' })
//           }))
//         }),
//         text('%$person/name%')
//       ]
//     }),
//     action: click('button'),
//     expectedResult: true
//   })
// })

component('uiTest.groupFlex', {
  impl: uiTest({
    control: group({layout: layout.flex('row'), controls: [button('button1'), text('label1')]}),
    expectedResult: contains(['button1','label1'])
  })
})

component('uiTest.click.doNotWaitForNextUpdate', {
  impl: uiTest({
    control: button('Click Me', writeValue('%$person/name%', 'mukki')),
    uiAction: click({doNotWaitForNextUpdate: true}),
    expectedResult: equals('%$person/name%', 'mukki')
  })
})

component('uiTest.buttonX', {
  impl: uiTest({control: button({title: 'Click Me', style: button.x()}), expectedResult: contains('×')})
})

component('uiTest.resource', {
  impl: uiTest({control: button('%$person.name%'), expectedResult: contains('Homer')})
})

component('uiTest.featuresCss', {
  impl: uiFrontEndTest({
    control: text({text: 'Hello World', features: css('color: red')}),
    expectedResult: ctx => {
      const elem = jb.ui.widgetBody(ctx)
      document.body.appendChild(elem)
      const ret = getComputedStyle(elem.firstElementChild).color == 'rgb(255, 0, 0)'
      document.body.removeChild(elem)
      return ret
    }
  })
})

component('uiTest.itemlist', {
  impl: uiTest({
    control: itemlist({items: '%$people%', controls: text('%$item.name% - %name%')}),
    expectedResult: contains(['Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson'])
  })
})

component('uiTest.itemlistPrimitiveArray', {
  impl: uiTest({
    control: itemlist({ items: '%$personWithPrimitiveChildren/childrenNames%', controls: text('%%') }),
    expectedResult: contains(['Bart', 'Lisa', 'Maggie'])
  })
})

component('uiTest.itemlistPrimitiveArrayItemShouldBeRef', {
  impl: uiTest({
    timeout: 100,
    vars: Var('isResultRef', obj(prop('answer', false))),
    control: itemlist({
      items: '%$personWithPrimitiveChildren/childrenNames%',
      controls: ctx => {
        ctx.run(writeValue('%$isResultRef/answer%', () => !!jb.db.isRef(ctx.data)))
        return ctx.run(text('%%'))
      }
    }),
    expectedResult: '%$isResultRef/answer%'
  })
})

component('uiTest.itemlistRxSource', {
  impl: uiTest({
    control: itemlist({
      items: source.data('%$people%'),
      controls: text('%$item.name% - %name%'),
      features: itemlist.incrementalFromRx()
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains(['Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson'])
  })
})

component('uiTest.table', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text('%name%'),
        button({title: 'delete', style: button.x(), features: field.columnWidth('50px')})
      ]
    }),
    expectedResult: contains('Homer Simpson')
  })
})

component('uiTest.itemlist.shownOnlyOnItemHover', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text('%name%'),
        button({
          title: 'delete',
          style: button.x(),
          features: [itemlist.shownOnlyOnItemHover(), field.columnWidth('50px')]
        })
      ],
    }),
    expectedResult: contains('Homer Simpson')
  })
})

component('uiTest.itemlistWithSelect', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'Bart Simpson - Bart Simpson'])
  })
})

component('FETest.itemlistWithSelect.click', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    action: click('ul>li:nth-child(2)'),
    expectedResult: contains(['Homer Simpson - Homer Simpson', 'selected', 'Bart Simpson - Bart Simpson'])
  })
})

component('FETest.itemlistDD', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text({ text: '%name%', features: css.class('drag-handle') }),
          features: [
            itemlist.selection({
              databind: '%$globals/selectedPerson%',
              autoSelectFirst: true
            }),
            itemlist.keyboardSelection(true),
            itemlist.dragAndDrop(),
            //watchRef('%$watchablePeople%'),
            id('itemlist')
          ]
        }),
        text('----'),
        itemlist({
          items: '%$watchablePeople%',
          controls: text('%name%'),
          features: watchRef('%$watchablePeople%')
        })
      ]
    }),
    action: uiActions(
      waitForSelector('.drag-handle'),
      keyboardEvent({ selector: '#itemlist', type: 'keydown', keyCode: 40, ctrl: 'ctrl' })
    ),
    expectedResult: contains(['Bart', 'Marge', 'Homer'])
  })
})

component('uiTest.itemlistBasic', {
  impl: uiTest({
    control: itemlist({ items: '%$people%', controls: text('%name%') }),
    expectedResult: contains(['Homer Simpson', 'Bart Simpson'])
  })
})

component('uiTest.itemlistAddButton', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text('%name%'),
          features: watchRef('%$watchablePeople%')
        }),
        button({
          title: 'add',
          action: addToArray('%$watchablePeople%', obj(prop('name', 'maggie')))
        })
      ]
    }),
    expectedResult: contains(['Homer Simpson', 'Bart Simpson'])
  })
})

component('uiTest.table.expandToEndOfRow', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text({ text: '%name%', features: feature.expandToEndOfRow('%name%==Homer Simpson') }),
        text('%age%')
      ],
      lineFeatures: table.enableExpandToEndOfRow()
    }),
    expectedResult: and(contains('colspan="'), not(contains('>42<')))
  })
})

component('uiTest.table.MDInplace', {
  impl: uiTest({
    control: group({
      controls: table({
        items: '%$people%',
        controls: [
          group({
            layout: layout.flex({direction: 'row', justifyContent: 'start', alignItems: 'center'}),
            controls: [
              editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
              text('%name%')
            ]
          }),
          controlWithCondition(
            '%$sectionExpanded/{%$index%}%',
            group({
              controls: text('inner text'),
              features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')
            })
          ),
          text('%age%'),
          text('%age%')
        ],
        lineFeatures: [
          watchRef({ref: '%$sectionExpanded/{%$index%}%', allowSelfRefresh: true}),
          table.enableExpandToEndOfRow()
        ]
      }),
      features: watchable('sectionExpanded', obj())
    }),
    expectedResult: and(contains(['colspan=\"','inner text']), not(contains('>42<'))),
    uiAction: click('i', 'toggle')
  })
})

component('uiTest.table.MDInplace.withScroll', {
  impl: uiTest({
    control: group({
      controls: table({
        items: '%$people%',
        controls: [
          group({
            layout: layout.flex({direction: 'row', justifyContent: 'start', alignItems: 'center'}),
            controls: [
              editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
              text('%name%')
            ]
          }),
          controlWithCondition(
            '%$sectionExpanded/{%$index%}%',
            group({
              controls: text('inner text'),
              features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')
            })
          ),
          text('%age%'),
          text('%age%')
        ],
        visualSizeLimit: 2,
        features: [
          css.height('40', 'scroll'),
          itemlist.infiniteScroll(2)
        ],
        lineFeatures: [
          watchRef({ref: '%$sectionExpanded/{%$index%}%', allowSelfRefresh: true}),
          table.enableExpandToEndOfRow()
        ]
      }),
      features: watchable('sectionExpanded', obj())
    }),
    expectedResult: and(
      contains(['colspan=\"','inner text','Bart']),
      not(contains('>42<')),
      not(contains(['inner text','inner text']))
    ),
    uiAction: uiActions(click('.jb-itemlist', 'fetchNextPage'), click('i', 'toggle')),
    timeout: 300
  })
})

component('uiTest.itemlistMDAutoSelectFirst', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people%',
          controls: text('%$item.name%'),
          features: [
            itemlist.selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            itemlist.keyboardSelection(true)
          ]
        }),
        text({text: '%$globals/selectedPerson/name% selected', features: watchRef('%$globals/selectedPerson%')})
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains(['Homer Simpson','Homer Simpson selected'])
  })
})

component('uiTest.itemlistSelection.autoSelectFirst', {
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

component('uiTest.itemlistSelection.click', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people%',
          controls: text({text: '%$item.name%', features: id('idx-%$index%')}),
          features: itemlist.selection('%$globals/selectedPerson%')
        }),
        text({text: '-%$globals/selectedPerson/name%-', features: watchRef('%$globals/selectedPerson%')})
      ]
    }),
    uiAction: click('#idx-2'),
    expectedResult: contains('-Marge Simpson-'),
    useFrontEnd: true
  })
})

component('uiTest.itemlistSelection.databind', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$people/name%',
          controls: text('%%'),
          features: [
            itemlist.selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            watchRef('%$globals/selectedPerson%')
          ]
        }),
        button('select Marge', writeValue('%$globals/selectedPerson%', '%$people/1/name%'))
      ]
    }),
    uiAction: click('button'),
    expectedResult: contains(['li','li','selected','Marge'])
  })
})

component('uiTest.itemlistMDOfRefs.refChangeBug', {
  impl: uiTest({
    control: group({
      controls: [
        itemlist({
          items: '%$watchablePeople%',
          controls: text({text: '%$item.name%', features: id('itemlist%$index%')}),
          features: [
            id('itemlist'),
            itemlist.selection({databind: '%$globals/selectedPerson%', autoSelectFirst: true}),
            itemlist.keyboardSelection(true)
          ]
        }),
        text({text: '%$globals/selectedPerson/name% selected', features: watchRef('%$globals/selectedPerson%')})
      ]
    }),
    uiAction: uiActions(
      waitForNextUpdate(),
      runMethod({selector: '#itemlist', method: 'onSelection', data: 2}),
      runMethod({selector: '#itemlist', method: 'onSelection', data: 1})
    ),
    expectedResult: contains(['Marge Simpson','Marge Simpson - watchable selected'])
  })
})

component('uiTest.itemlistContainerSearchCtrl', {
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer.search({ features: id('search') }),
      itemlist({
        items: pipeline('%$people%', itemlistContainer.filter()),
        controls: text(text.highlight('%name%', '%$itemlistCntrData/search_pattern%')),
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.selection({ autoSelectFirst: true }),
          itemlist.keyboardSelection({
            autoFocus: true,
            onEnter: writeValue('%$res/selected%', '%name%')
          })
        ]
      })
    ],
    features: group.itemlistContainer()
  })
})

component('uiTest.itemlistContainerSearch', {
  impl: uiTest({
    control: uiTest.itemlistContainerSearchCtrl(),
    uiAction: setText('ho', '#search'),
    expectedResult: contains(['Ho<','>mer'])
  })
})

component('FETest.itemlistContainerSearchEnterOnLi', {
  impl: uiFrontEndTest({
    vars: [Var('res', obj())],
    control: uiTest.itemlistContainerSearchCtrl(),
    uiAction: keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13}),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    renderDOM: true
  })
})

component('uiTest.itemlistKeyboardSelection', {
  impl: uiTest({
    vars: [Var('res', obj())],
    control: itemlist({
      items: '%$people%',
      controls: text('%name%'),
      features: [
        itemlist.selection({autoSelectFirst: true}),
        itemlist.keyboardSelection({onEnter: writeValue('%$res/selected%', '%name%')})
      ]
    }),
    uiAction: keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13, doNotWaitForNextUpdate: true}),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    useFrontEnd: true
  })
})

component('uiTest.remote.itemlistKeyboardSelection', {
  impl: uiTest({
    control: group({
      controls: [
        text({text: '-%$res/selected%-', features: watchRef('%$res/selected%')}),
        itemlist({
          items: '%$people%',
          controls: text('%name%'),
          features: [
            itemlist.selection({autoSelectFirst: true}),
            itemlist.keyboardSelection({onEnter: writeValue('%$res/selected%', '%name%')})
          ]
        })
      ],
      features: [
        watchable('res', obj())
      ]
    }),
    uiAction: keyboardEvent({selector: '.jb-itemlist', type: 'keydown', keyCode: 13}),
    expectedResult: contains('-Homer Simpson-'),
    timeout: 1000,
    backEndJbm: remoteNodeWorker('itemlist', sourceCode(pluginsByPath('/plugins/ui/tests/ui-tests.js'))),
    useFrontEnd: true
  })
})

component('uiTest.secondaryLinkSetBug', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%name%'),
      features: itemlist.selection({ databind: '%$globals/selected%', autoSelectFirst: true })
    }),
    action: uiActions(
      writeValue('%$globals/selected%', '%$people[1]%'),
      writeValue('%$globals/data1%', '5')
    ),
    expectedResult: ctx => true
  })
})

component('uiTest.itemlistWithTableStyle', {
  impl: uiTest({
    control: table({
      items: '%$watchablePeople%',
      controls: [
        text({ text: '%$index%', title: 'index', features: field.columnWidth(40) }),
        text({ text: '%name%', title: 'name', features: field.columnWidth(300) }),
        text({ text: '%age%', title: 'age' })
      ],
      features: [
        itemlist.selection({
          databind: '%$globals/selectedPerson%',
          autoSelectFirst: true
        })
      ]
    }),
    expectedResult: contains(['300', 'age', 'Homer Simpson', '38', '>3<', 'Bart'])
  })
})

component('test.personName', {
  type: 'control',
  params: [
    { id: 'person' }
  ],
  impl: text('%$person/name%')
})

component('uiTest.itemlistWithTableStyleUsingDynamicParam', {
  impl: uiTest({
    control: table({
      items: '%$watchablePeople%',
      controls: test.personName('%%'),
    }),
    expectedResult: contains('Bart')
  })
})

// jb.component('uiTest.table', {
//   impl: uiTest({
//     control: table({
//       items: '%$people%',
//       fields: [field({title: 'name', data: '%name%'}), field({title: 'age', data: '%age%'})],
//       features: [
//         itemlist.selection({
//           databind: '%$globals/selectedPerson%',
//           autoSelectFirst: true
//         })
//       ]
//     }),
//     expectedResult: contains(['age', 'Homer Simpson', '12'])
//   })
// })

component('uiTest.BEOnDestroy', {
  impl: uiFrontEndTest({
    control: text('%$person/name%'),
    action: action(runActions(
      openDialog({
        id: 'dlg',
        content: text({
          text: 'in dialog',
          features: onDestroy(writeValue('%$person/name%', 'dialog closed'))
        })
      }),
      dialog.closeDialogById('dlg')
    )),
    expectedResult: contains('dialog closed')
  })
})

component('uiTest.editableTextInGroup', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({ title: 'name', databind: '%$person/name%' }),
        editableText({ title: 'name', databind: '%$person/name%' }),
        text('%$person/name%')
      ]
    }),
    expectedResult: contains('Homer')
  })
})

component('FETest.onKey', {
  impl: uiFrontEndTest({
    control: editableText({
      title: 'name', databind: '%$person/name%',
      features: [id('inp'), feature.onKey('ctrl-Enter', openDialog({ title: 'hello' }))]
    }),
    action: keyboardEvent({ selector: '#inp', type: 'keydown', keyCode: 13, ctrl: 'ctrl' }),
    expectedResult: contains('hello')
  })
})

component('uiTest.editableText.blockSelfRefresh', {
  impl: uiTest({
    control: group({
      controls: editableText({title: 'name', databind: '%$person/name%', features: id('inp')}),
      features: watchRef('%$person/name%')
    }),
    uiAction: setText('hello', '#inp'),
    expectedResult: true,
    expectedCounters: {'start renderVdom': 2}
  })
})

component('uiTest.editableText.allowSelfRefresh', {
  impl: uiTest({
    control: group({
      controls: editableText('name', '%$person/name%'),
      features: watchRef({ref: '%$person/name%', allowSelfRefresh: true})
    }),
    uiAction: setText('hello'),
    expectedResult: contains('hello'),
    expectedCounters: {'start renderVdom': 4}
  })
})

component('uiTest.editableTextHelper', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      features: editableText.helperPopup({control: text('--%value%--'), autoOpen: true})
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('--Homer')
  })
})

component('uiTest.editableText.picklistHelper', {
  impl: uiTest({
    uiAction: waitForNextUpdate(),
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.mdcInput(),
      features: editableText.picklistHelper({options: picklist.optionsByComma('1,2,333'), autoOpen: true})
    }),
    expectedResult: contains('333')
  })
})

component('uiTest.editableText.picklistHelperWithChangingOptions', {
  impl: uiTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      features: editableText.picklistHelper({
        options: picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')),
        showHelper: notEquals(test.getSelectionChar(), 'b'),
        autoOpen: true
      })
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('ddd')
  })
})

component('uiTest.editableText.richPicklistHelperWithWatchingGroup', {
  impl: uiTest({
    control: group({
      controls: editableText({
        title: 'name',
        databind: '%$person/name%',
        features: editableText.picklistHelper({
          options: picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')),
          showHelper: notEquals(test.getSelectionChar(), 'b'),
          autoOpen: true
        })
      }),
      features: watchRef('%$person/name%')
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('ddd')
  })
})

component('uiTest.editableText.richPicklistHelper.setInput', {
  impl: uiFrontEndTest({
    control: editableText({
      title: 'name',
      databind: '%$person/name%',
      style: editableText.input(),
      features: [
        id('inp'),
        editableText.picklistHelper({
          options: picklist.optionsByComma('1111,2,3,4'),
          onEnter: editableText.setInputState('%$selectedOption%', '%value%')
        })
      ]
    }),
    uiAction: uiActions(
      keyboardEvent({selector: '#inp', type: 'keyup', keyCode: 37}),
      keyboardEvent({selector: '#inp', type: 'keydown', keyCode: 40}),
      keyboardEvent({selector: '#inp', type: 'keyup', keyCode: 13}),
    ),
    expectedResult: contains('1111</input-val>'),
    useFrontEnd: true
  })
})

component('test.getSelectionChar', {
  impl: ctx => {
    const input = ctx.vars.$state.input || jb.path(ctx.vars.ev, 'input') || { value: '', selectionStart: 0 }
    const selectionStart = input.selectionStart || 0
    return input.value.slice(selectionStart, selectionStart + 1)
  }
})


component('uiTest.editableTextWithJbVal', {
  impl: uiTest({
    control: group({
      vars: [Var('a1', ctx => {
        return {
          $jb_val: value => {
            if (value === undefined)
              return jb.__test_jb_val || 'Marge';
            else
              jb.__test_jb_val = value;
          }
        }
      })],
      controls: [
        editableText('name', '%$a1%'),
        editableText('name', '%$a1%'),
        picklist({
          title: 'name',
          databind: '%$a1%',
          options: picklist.optionsByComma('Homer,Marge')
        }),
        text('%$a1%')
      ]
    }),
    expectedResult: contains(['Homer'])
  })
})

component('uiTest.propertySheet.titlesAbove', {
  impl: uiTest({
    control: group({
      style: propertySheet.titlesAbove(),
      controls: [
        editableText({ title: 'name', databind: '%$person/name%' }),
        editableText({ title: 'address', databind: '%$person/age%' })
      ]
    }),
    expectedResult: contains('Homer')
  })
})

component('uiTest.propertySheet.titlesLeft', {
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft({}),
      controls: [
        editableText({
          title: 'name',
          databind: '%$person/name%',
          style: editableText.input()
        }),
        editableText({
          title: 'address',
          databind: '%$person/age%',
          style: editableText.input()
        })
      ]
    }),
    expectedResult: contains('Homer')
  })
})

component('uiTest.editableNumber', {
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
        editableNumber({ databind: '%$person/age%', title: 'age' }),
        text('%$person/age%')
      ]
    }),
    expectedResult: contains(['42', '42'])
  })
})

component('uiTest.editableNumberSlider', {
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: contains('42')
  })
})

component('uiTest.editableNumberSliderEmpty', {
  impl: uiTest({
    control: editableNumber({
      databind: '%$person/age1%',
      title: 'age',
      style: editableNumber.slider()
    }),
    expectedResult: true
  })
})

component('uiTest.editableBoolean.buttonXV', {
  impl: uiTest({
    control: editableBoolean({
      databind: '%$person/male%',
      style: editableBoolean.buttonXV({
        yesIcon: icon({ icon: 'location_searching', type: 'mdc' }),
        noIcon: icon({ icon: 'location_disabled', type: 'mdc' }),
        buttonStyle: button.mdcFloatingAction('40')
      }),
    }),
    expectedResult: true
  })
})

component('uiTest.editableBoolean.allStyles', {
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
          style: editableBoolean.checkboxWithLabel(),
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
    expectedResult: contains('male')
  })
})

component('uiTest.editableBoolean.mdcSlideToggle', {
  impl: uiTest({
    control: editableBoolean({
      databind: '%$person/male%',
      style: editableBoolean.mdcSlideToggle(),
      title: 'male'
    }),
    expectedResult: contains('male')
  })
})

component('uiTest.editableBooleanSettings', {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkboxWithLabel(),
          title: 'male',
          textForTrue: 'male',
          textForFalse: 'female'
        })
      ]
    }),
    expectedResult: contains('male')
  })
})

component('uiTest.editableBoolean.expandCollapse', {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({databind: '%$expanded%', style: editableBoolean.expandCollapse(), features: id('toggle')}),
        text({text: 'inner text', features: [
          feature.if('%$expanded%'),
          watchRef('%$expanded%')
        ]})
      ],
      features: watchable('expanded', false)
    }),
    uiAction: click('#toggle', 'toggle'),
    expectedResult: contains('inner text')
  })
})

component('uiTest.expandCollapseWithDefaultCollapse', {
  type: 'control',
  impl: group({
    controls: [
      editableBoolean({
        databind: '%$default%',
        title: 'default value for expanded',
        style: editableBoolean.checkboxWithLabel(),
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
        features: [watchRef('%$default%'), feature.initValue({ to: '%$expanded%', value: '%$default%', alsoWhenNotEmpty: true })]
      })
    ],
    features: [
      watchable('expanded', () => null),
      watchable('default', false)
    ]
  })
})

component('uiTest.editableBoolean.expandCollapseWithDefaultVal', {
  impl: uiTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    uiAction: click('#default', 'toggle'),
    expectedResult: contains('inner text')
  })
})

component('uiTest.editableBoolean.expandCollapseWithDefaultCollapse', {
  impl: uiFrontEndTest({
    control: uiTest.expandCollapseWithDefaultCollapse(),
    expectedResult: not(contains('inner text')),
    renderDOM: true
  })
})

component('uiTest.codeMirror', {
  impl: uiFrontEndTest({
    control: group({
      vars: [
        Var('js', {
          '$': 'object', text: `function f1() {
return 15
}`}),
        Var('css', { '$': 'object', text: '{ width: 15px; }' }),
        Var('html', { '$': 'object', text: '<div><span>hello</span></div>' })
      ],
      controls: [
        editableText({
          databind: '%$js/text%',
          style: editableText.codemirror({ mode: 'javascript' }),
          features: codemirror.fold()
        }),
        editableText({
          databind: '%$css/text%',
          style: editableText.codemirror({ mode: 'css' }),
          features: [
            codemirror.fold(),
            codemirror.lineNumbers()
          ]
        }),
        editableText({ databind: '%$html/text%', style: editableText.codemirror({ mode: 'htmlmixed' }) })
      ]
    }),
    action: waitForSelector('.CodeMirror'),
    expectedResult: contains(['function', 'f1', 15]),
    renderDOM: true
  })
})

component('uiTest.innerLabel1Tst', {
  params: [
    { id: 'title', mandatory: true, dynamic: true }
  ],
  impl: text(call('title'))
})

component('uiTest.innerLabel2Tst', {
  params: [
    { id: 'title', mandatory: true, dynamic: true }
  ],
  impl: uiTest.innerLabel1Tst(call('title'))
})

component('uiTest.innerLabel3Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel2Tst(call('title'))
})

component('uiTest.picklist', {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft(),
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

component('uiTest.picklist.delayedOptions', {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft(),
          controls: picklist({
            title: 'city',
            databind: '%$personWithAddress/address/city%',
            options: source.data(
              obj(prop('options', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))
            ),
            features: picklist.allowAsynchOptions()
          })
        }),
        text('%$personWithAddress/address/city%')
      ]
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains(['Springfield','New York'])
  })
})

component('uiTest.picklist.delayedOptions.StyleByControlBug', {
  impl: uiTest({
    control: picklist({
      title: 'city',
      style: picklist.labelList(),
      databind: '%$personWithAddress/address/city%',
      options: source.data(obj(prop('options', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))),
      features: picklist.allowAsynchOptions()
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

component('uiTest.picklist.delayedOptions.StyleByControlBug.Promise', {
  impl: uiTest({
    control: picklist({
      title: 'city',
      databind: '%$personWithAddress/address/city%',
      options: pipe(
        delay(1),
        obj(prop('options', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))
      ),
      style: picklist.labelList(),
      features: picklist.allowAsynchOptions()
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains(['Springfield','New York'])
  })
})

component('uiTest.picklistHelper.delayedOptions', {
  impl: uiTest({
    control: editableText({
      databind: '%$person/name%',
      features: editableText.picklistHelper({
        showHelper: true,
        options: pipe(delay(1),
          (obj(prop('options', picklist.optionsByComma(() => [1, 2, 3].map(() => Math.floor(Math.random() * 10)).join(',')))))
        ),
        picklistFeatures: picklist.allowAsynchOptions(),
        picklistStyle: picklist.labelList(),
      }),
    }),
    expectedResult: true
  })
})

component('uiTest.picklistRadio', {
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

component('uiTest.picklist.mdcSelect', {
  impl: uiFrontEndTest({
    control: picklist({
      title: 'city',
      databind: '%$personWithAddress/address/city%',
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.mdcSelect('200'),
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

component('uiTest.fieldTitleOfLabel', {
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft(),
      controls: text({text: '%$personWithAddress/address/city%', features: field.title('City')})
    }),
    expectedResult: contains('City')
  })
})

component('uiTest.picklistSort', {
  impl: dataTest(
    pipeline(
      picklist.sortedOptions(
        picklist.optionsByComma('a,b,c,d'),
        pipeline(
          'c:100,d:50,b:0,a:20',
          split(','),
          {
            '$': 'object',
            code: split({ separator: ':', part: 'first' }),
            mark: split({ separator: ':', part: 'second' })
          }
        )
      ),
      '%text%',
      join()
    ),
    contains('c,d,a')
  )
})

component('uiTest.picklistGroups', {
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

component('uiTest.dynamicControls', {
  impl: uiTest({
    control: group({
      style: propertySheet.titlesLeft(),
      controls: dynamicControls(list('name', 'age'), editableText('%$controlItem%', '%$person/{%$controlItem%}%'))
    }),
    expectedResult: contains(['name', 'age'])
  }),
  location: null
})

component('uiTest.inlineControls', {
  impl: uiTest({
    control: group({controls: [
      text('a1'),
      inlineControls(text('a2'), text('a3'))
    ]}),
    expectedResult: contains(['a1','a2','a3'])
  })
})

component('uiTest.tabs', {
  impl: uiTest({
    control: group({
      style: group.tabs(),
      controls: [
        group({title: 'tab1', controls: text('in tab1')}),
        group({title: 'tab2', controls: text('in tab2')})
      ]
    }),
    expectedResult: and(contains(['tab1','in tab1']), contains('tab2'), not(contains('in tab2')))
  })
})

component('uiTest.group.accordion', {
  impl: uiTest({
    control: group({
      style: group.accordion(),
      controls: [
        group({title: 'tab1', controls: text('in tab1')}),
        group({title: 'tab2', controls: text('in tab2')})
      ]
    }),
    expectedResult: contains(['tab1','in tab1','tab2'])
  })
})

component('uiTest.innerLabel', {
  impl: uiTest({control: uiTest.innerLabel3Tst('Hello World2'), expectedResult: contains('Hello World2')})
})

// jb.component('uiTest.markdown', {
//   impl: uiTest({
//     control: markdown(
//       `| Day     | Meal    | Price |
// | --------|---------|-------|
// | Monday  | pasta   | $6    |
// | Tuesday | chicken | $8    |    `
//     ),
//     expectedResult: contains('table')
//   })
// })

component('uiTest.styleByControl', {
  impl: uiTest({
    control: text({text: 'Hello World', style: styleByControl(button('%$labelModel/text()%2'), 'labelModel')}),
    expectedResult: contains('Hello World2')
  })
})

component('uiTest.picklistAsItemlist', {
  impl: uiTest({
    control: group({
      controls: [
        picklist({
          databind: '%$personWithAddress/address/city%',
          options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
          style: picklist.labelList()
        }),
        text('%$personWithAddress/address/city%')
      ]
    }),
    expectedResult: contains(['Springfield', 'New York'])
  })
})

component('menuTest.menu1', {
  impl: menu.menu({
    title: 'main',
    options: [
      menu.menu({
        title: 'File',
        options: [
          menu.action('New', () => alert(1)),
          menu.action('Open'),
          menu.menu({
            title: 'Bookmarks',
            options: [menu.action('Google'), menu.action('Facebook')]
          }),
          menu.menu({ title: 'Friends', options: [menu.action('Dave'), menu.action('Dan')] })
        ]
      }),
      menu.menu({ title: 'Edit', options: [menu.action('Copy'), menu.action('Paste')] }),
      menu.dynamicOptions(list(1, 2, 3), menu.action('dynamic-%%'))
    ]
  })
})

component('menuTest.toolbar', {
  impl: uiTest({
    control: menu.control(
      menu.menu({
        options: [
          menu.action({title: 'select', action: () => console.log('select'), icon: icon({icon: 'Selection', type: 'mdi'})})
        ],
        icon: icon('undo')
      }),
      menuStyle.toolbar()
    ),
    expectedResult: contains('button')
  })
})

component('menuTest.pulldown', {
  impl: uiTest({
    control: menu.control({ menu: menuTest.menu1(), style: menuStyle.pulldown({}) }),
    expectedResult: contains(['File', 'Edit', 'dynamic-1', 'dynamic-3'])
  })
})

component('menuTest.pulldown.inner', {
  impl: uiTest({
    control: menu.control(menuTest.menu1(), menuStyle.pulldown()),
    uiAction: click('[$text=\"File\"]', 'openPopup'),
    expectedResult: and(contains('Open'), contains(['File','Edit','dynamic-1','dynamic-3']))
  })
})

component('menuTest.contextMenu', {
  impl: uiTest({
    control: menu.control({ menu: menuTest.menu1() }),
    expectedResult: contains(['File', 'Edit'])
  })
})

component('menuTest.openContextMenu', {
  impl: uiTest({
    control: button({ title: 'open', action: menu.openContextMenu({ menu: menuTest.menu1() }) }),
    expectedResult: contains('open')
  })
})

component('uiTest.refreshControlById.text', {
  impl: uiFrontEndTest({
    vars: [
      Var('person1', () => ({ name: 'Homer' }))
    ],
    control: text({text: '%$person1/name%', features: id('t1')}),
    uiAction: uiActions(writeValue('%$person1/name%', 'Dan'), action(refreshControlById('t1'))),
    expectedResult: contains('Dan')
  })
})

component('uiTest.refreshControlById.withButton', {
  impl: uiFrontEndTest({
    renderDOM: true,
    vars: Var('person1', () => ({ name: 'Homer' })), // none watchable var
    control: group({
      controls: [
        text({ text: '%$person1/name%', features: id('t1') }),
        button({
          title: 'refresh',
          action: runActions(writeValue('%$person1/name%', 'Dan'), refreshControlById('t1'))
        })
      ]
    }),
    action: click('button'),
    expectedResult: contains('Dan')
  })
})

component('uiTest.refreshByStateChange', {
  impl: uiTest({
    control: group({
      controls: text('%$name%'),
      features: [
        id('g1'),
        variable('name', 'name: %$$state/name%'),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    uiAction: runMethod({selector: '#g1', method: 'refresh', doNotWaitForNextUpdate: true}),
    expectedResult: contains('Dan')
  })
})

component('uiTest.refreshWithStyleByCtrl', {
  impl: uiTest({
    control: group({
      style: group.sections(),
      controls: [
        text('%$name%'),
        button('click', ctx => jb.ui.runBEMethodByElem(jb.ui.find(ctx, '#g1')[0], 'refresh'))
      ],
      features: [
        id('g1'),
        variable('name', ctx => ctx.exp('name: %$$state/name%')),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    uiAction: click('button'),
    expectedResult: contains('Dan')
  })
})

component('uiTest.rawVdom', {
  impl: uiTest({
    control: ctx => jb.ui.h('div', {}, 'hello world'),
    expectedResult: contains('hello world')
  })
})

component('uiTest.control.firstSucceeding', {
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
      features: [variable({ name: 'gender', value: 'male' })]
    }),
    expectedResult: and(contains(['male', 'male2']), not(contains('second-succeeding')))
  })
})

component('uiTest.control.firstSucceedingInnerVar', {
  impl: uiTest({
    control: group({
      controls: controlWithCondition('%$innerVar% == \"5\"', text('innerVar')),
      features: [group.firstSucceeding(), variable({ name: 'innerVar', value: '5' })]
    }),
    expectedResult: contains('innerVar')
  })
})

component('uiTest.control.firstSucceedingDefault', {
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

component('uiTest.control.firstSucceedingWithoutCondition', {
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

component('uiTest.firstSucceedingWatchableSample', {
  type: 'control',
  impl: group({
    controls: [
      editableText({ databind: '%$gender%' }),
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
    features: watchable('gender', 'male')
  })
})

component('uiTest.firstSucceeding.watchRefreshOnCtrlChange', {
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    uiAction: click('#female'),
    expectedResult: contains('not male'),
    expectedCounters: {'start renderVdom': 9}
  })
})

component('uiTest.firstSucceeding.sameDoesNotRecreate', {
  impl: uiTest({
    control: uiTest.firstSucceedingWatchableSample(),
    uiAction: uiActions(click('#female'), click('#zee')),
    expectedResult: contains('not male'),
    expectedCounters: { 'start renderVdom': 11 }
  })
})

component('uiTest.watchRef.recalcVars', {
  impl: uiFrontEndTest({
    control: text({
      text: '%$changed%',
      features: [
        variable({ name: 'changed', value: '--%$person/name%--' }),
        watchRef('%$person/name%')
      ]
    }),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains('--hello--')
  })
})

component('uiTest.checkBoxWithText', {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean({
          databind: '%$person/male%',
          style: editableBoolean.checkboxWithLabel(),
          textForTrue: 'male',
          textForFalse: 'girl',
          features: id('male')
        })
      ]
    }),
    expectedResult: contains('male')
  })
})

component('uiTest.hiddenRefBug', {
  impl: uiTest({
    control: group({controls: text({text: 'hey', features: hidden('%$hidden%')}), features: watchable('hidden', false)}),
    expectedResult: contains('display:none')
  })
})

// jb.component('uiTest.cssDynamic', {
//   impl: uiFrontEndTest({
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
//       features: watchable('color','blue')
//     }),
//     action: click('#green'),
//     expectedResult: pipeline(ctx => jb.ui.cssOfSelector('#label',ctx), contains('color: green'))
//   })
// })

component('uiTest.validator', {
  impl: uiTest({
    control: group({
      controls: [
        editableText({
          title: 'project',
          databind: '%$person/project%',
          features: [
            id('fld'),
            validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')
          ]
        })
      ]
    }),
    uiAction: setText('a b', '#fld'),
    expectedResult: contains('invalid project name'),
    allowError: true
  })
})

component('uiTest.watchableVariableAsProxy', {
  impl: uiTest({
    control: group({ features: watchable('link', '%$person%') }),
    expectedResult: ctx => jb.db.resources[Object.keys(jb.db.resources).filter(x => x.match(/link:[0-9]*/))[0]][Symbol.for("isProxy")]
  })
})


component('uiTest.watchableLinkWriteOriginalWatchLink', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$person/name%'),
        text('%$link/name%')
      ],
      features: watchable('link', '%$person%')
    }),
    uiAction: writeValue('%$person/name%', 'hello'),
    expectedResult: contains(['hello','hello'])
  })
})

component('uiTest.watchableWriteViaLink', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$person/name%'),
        text('%$link/name%'),
        button({title: 'set', action: writeValue('%$link/name%', 'hello'), features: id('set')})
      ],
      features: watchable('link', '%$person%')
    }),
    uiAction: click({selector: '#set', doNotWaitForNextUpdate: true}),
    expectedResult: contains(['hello','hello'])
  })
})

component('uiTest.watchableParentRefreshMaskChildren', {
  impl: uiFrontEndTest({
    control: group({ controls: text('%$person/name%'), features: watchRef('%$person/name%') }),
    action: writeValue('%$person/name%', 'hello'),
    expectedResult: contains('hello'),
    expectedCounters: { 'refresh from observable elements': 1 }
  })
})

component('uiTest.watchableUrl', {
  impl: uiTest({
    control: text('%$person/name%'),
    expectedResult: contains('observe=\"resources://2~name;person~name')
  })
})

component('uiTest.itemlistWithGroupWait', {
  impl: uiTest({
    control: itemlist({
      items: '%$items%',
      controls: text('%name%'),
      features: group.wait({for: pipe(delay(1), () => [{ name: 'homer' }]), varName: 'items'})
    }),
    uiAction: waitForNextUpdate(),
    expectedResult: contains('homer')
  })
})

component('uiTest.watchableRefToInnerElementsWhenValueIsEmpty', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$selected/name%'),
        button({title: 'set', action: writeValue('%$selected%', obj(prop('name', 'hello'))), features: id('set')})
      ],
      features: watchable('selected', obj())
    }),
    uiAction: click({selector: '#set', doNotWaitForNextUpdate: true}),
    expectedResult: contains('hello')
  })
})

component('uiTest.infiniteScroll', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: 7,
      features: [
        css.height('100', 'scroll'),
        itemlist.infiniteScroll(4),
        css.width('100')
      ]
    }),
    action: uiActions(scrollBy('.jb-itemlist', 80), waitForSelector('ul>:nth-child(8)')),
    expectedResult: contains('>10<'),
    renderDOM: true
  })
})

component('uiTest.infiniteScroll.twice', {
  impl: uiTest({
    control: itemlist({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        id('itemlist'),
        css.height('100', 'scroll'),
        itemlist.infiniteScroll(2),
        css.width('100')
      ]
    }),
    uiAction: uiActions(runMethod('#itemlist', 'fetchNextPage'), runMethod('#itemlist', 'fetchNextPage')),
    expectedResult: contains('>10<')
  })
})

component('uiTest.infiniteScroll.table', {
  impl: uiTest({
    control: table({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        id('itemlist'),
        css.height('100', 'scroll'),
        itemlist.infiniteScroll(4),
        css.width('100')
      ]
    }),
    uiAction: runMethod('#itemlist', 'fetchNextPage'),
    expectedResult: contains(['>10<','</tbody>'])
  })
})

component('uiTest.recursiveCtrl', {
  type: 'control',
  params: [
    { id: 'data' }
  ],
  impl: group({
    controls: [
      text('%$data/text%'),
      uiTest.recursiveCtrl('%$data/child%'),
    ],
    features: group.eliminateRecursion(5),
  })
})

component('uiTest.eliminateRecursion', {
  impl: uiTest({
    vars: [
      Var('recData', () => {
      const res = { text: 'txt' }
      res.child = res
      return res
    })
    ],
    control: uiTest.recursiveCtrl('%$recData%'),
    expectedResult: contains(['txt','txt','txt','txt','txt'])
  })
})

component('uiTest.changeText', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$fName%'),
        editableText({databind: '%$fName%', style: editableText.input()})
      ],
      features: watchable('fName', 'Dan')
    }),
    uiAction: setText({value: 'danny', doNotWaitForNextUpdate: true}),
    expectedResult: contains('danny')
  })
})

component('FETest.runFEMethod', {
  impl: uiFrontEndTest({
    control: group({
      controls: [
        button('change', runFEMethod({
          selector: '#input1',
          method: 'changeText',
          data: 'world'
        })),
        editableText({
          databind: '%$person/name%',
          style: editableText.input(),
          features: [
            id('input1'),
            frontEnd.method('changeText', ({data},{el}) => el.value = data)
          ]
        })
      ]
    }),
    action: click('button'),
    expectedResult: contains('world'),
    renderDOM: true
  })
})

component('FETest.coLocation', {
  impl: uiFrontEndTest({
    vars: Var('toChange',obj()),
    action: click('button'),
    control: button({
      title: 'change',
      action: runFEMethod({ selector: '#btn', method: 'changeDB' }),
      features: [
        frontEnd.coLocation(),
        id('btn'),
        frontEnd.method('changeDB', writeValue('%$toChange.x%',3))
      ]
    }),
    expectedResult: equals('%$toChange/x%',3)
  })
})

component('uiTest.transactiveHeadless.createWidget', {
  impl: uiTest({
    control: text('hello world'),
    expectedResult: contains('hello world'),
    transactiveHeadless: true
  })
})

component('uiTest.transactiveHeadless.changeText', {
  impl: uiTest({
    control: group({
      controls: [
        text({text: '-%$fName%-', features: watchRef('%$fName%')}),
        text({text: '+%$fName%+', features: watchRef('%$fName%')}),
        editableText({databind: '%$fName%', style: editableText.input()})
      ],
      features: watchable('fName', 'Dan')
    }),
    uiAction: setText('danny'),
    expectedResult: contains(['-danny-','+danny+']),
    backEndJbm: worker('changeText', sourceCode(pluginsByPath('/plugins/ui/group.js'))),
    transactiveHeadless: true
  })
})