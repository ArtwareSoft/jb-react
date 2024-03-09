using('ui-tests')

component('uiTest.openDialog', {
  impl: uiTest({
    control: button('click me', openDialog('hello', text('jbart'), { id: 'hello', features: dialogFeature.nearLauncherPosition() })),
    expectedResult: contains('hello','jbart'),
    uiAction: click('button')
  })
})

component('uiTest.codeMirrorDialogResizer', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      features: [
        dialogFeature.nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('uiTest.codeMirrorDialogResizerOkCancel', {
  impl: uiTest({
    control: button('click me', openDialog({
      title: 'resizer',
      content: editableText({ databind: '%$person/name%', style: editableText.codemirror({ mode: 'javascript' }) }),
      style: dialog.dialogOkCancel(),
      features: [
        dialogFeature.nearLauncherPosition(),
        dialogFeature.resizer(true)
      ]
    })),
    expectedResult: true
  })
})

component('uiTest.refreshDialog', {
  impl: uiTest({
    control: button('click me', openDialog({
      content: text('%$person/name%'),
      features: followUp.action(writeValue('%$person/name%', 'mukki'))
    })),
    expectedResult: contains('mukki'),
    uiAction: uiActions(click('button'), waitForNextUpdate(6))
  })
})

component('uiTest.dialogCleanupBug', {
  impl: uiTest(button('click me', openDialog('hello', text('world'), { id: 'hello' })), isEmpty(dialog.shownDialogs()), {
    uiAction: uiActions(click(), action(dialog.closeAll()))
  })
})

component('uiTest.table', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text('%name%'),
        button('delete', { style: button.x(), features: field.columnWidth('50px') })
      ]
    }),
    expectedResult: contains('Homer Simpson')
  })
})

component('uiTest.table.shownOnlyOnItemHover', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text('%name%'),
        button('delete', { style: button.x(), features: [itemlist.shownOnlyOnItemHover(), field.columnWidth('50px')] })
      ]
    }),
    expectedResult: contains('Homer Simpson')
  })
})

component('uiTest.itemlistDD', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%name%', { features: css.class('drag-handle') }),
        features: [
          itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true }),
          itemlist.keyboardSelection({ autoFocus: true }),
          itemlist.dragAndDrop(),
          id('itemlist')
        ]
      }),
      text('----'),
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%name%'),
        features: watchRef('%$watchablePeople%')
      })
    ),
    expectedResult: contains('Bart','Marge','Homer'),
    uiAction: keyboardEvent('#itemlist', 'keydown', { keyCode: 40, ctrl: 'ctrl' }),
    useFrontEnd: true
  })
})

component('uiTest.table.expandToEndOfRow', {
  impl: uiTest({
    control: table({
      items: '%$people%',
      controls: [
        text('%name%', { features: feature.expandToEndOfRow('%name%==Homer Simpson') }),
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
          group(editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()), text('%name%'), {
            layout: layout.flex('row', 'start', { alignItems: 'center' })
          }),
          controlWithCondition({
            condition: '%$sectionExpanded/{%$index%}%',
            control: group(text('inner text'), { features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%') })
          }),
          text('%age%'),
          text('%age%')
        ],
        lineFeatures: [
          watchRef('%$sectionExpanded/{%$index%}%', { allowSelfRefresh: true }),
          table.enableExpandToEndOfRow()
        ]
      }),
      features: watchable('sectionExpanded', obj())
    }),
    expectedResult: and(contains('colspan="','inner text'), not(contains('>42<'))),
    uiAction: click('i', 'toggle')
  })
})

component('uiTest.table.MDInplace.withScroll', {
  impl: uiTest({
    control: group({
      controls: table({
        items: '%$people%',
        controls: [
          group(editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()), text('%name%'), {
            layout: layout.flex('row', 'start', { alignItems: 'center' })
          }),
          controlWithCondition({
            condition: '%$sectionExpanded/{%$index%}%',
            control: group(text('inner text'), { features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%') })
          }),
          text('%age%'),
          text('%age%')
        ],
        visualSizeLimit: 2,
        features: [
          css.height('40', 'scroll'),
          itemlist.infiniteScroll(2)
        ],
        lineFeatures: [
          watchRef('%$sectionExpanded/{%$index%}%', { allowSelfRefresh: true }),
          table.enableExpandToEndOfRow()
        ]
      }),
      features: watchable('sectionExpanded', obj())
    }),
    expectedResult: and(contains('colspan="','inner text','Bart'), not(contains('>42<')), not(contains('inner text','inner text'))),
    uiAction: uiActions(click('.jb-itemlist', 'fetchNextPage'), click('i', 'toggle')),
    timeout: 300
  })
})

// component('uiTest.itemlistWithTableStyle', {
//   impl: uiTest({
//     control: table({
//       items: '%$watchablePeople%',
//       controls: [
//         text('%$index%', 'index', { features: field.columnWidth(40) }),
//         text('%name%', 'name', { features: field.columnWidth(300) }),
//         text('%age%', 'age')
//       ],
//       features: itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true })
//     }),
//     expectedResult: contains('300','age','Homer Simpson','38','>3<','Bart')
//   })
// })

// component('test.personName', {
//   type: 'control',
//   params: [
//     {id: 'person'}
//   ],
//   impl: text('%$person/name%')
// })

// component('uiTest.itemlistWithTableStyleUsingDynamicParam', {
//   impl: uiTest(table({ items: '%$watchablePeople%', controls: test.personName('%%') }), contains('Bart'))
// })


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
          itemlist.keyboardSelection({ autoFocus: true, onEnter: writeValue('%$res/selected%', '%name%') })
        ]
      })
    ],
    features: group.itemlistContainer()
  })
})

component('uiTest.itemlistContainerSearch', {
  impl: uiTest(uiTest.itemlistContainerSearchCtrl(), contains('Ho<','>mer'), { uiAction: setText('ho', '#search') })
})

component('uiTest.itemlistContainerSearchEnterOnLi', {
  impl: uiTest({
    vars: [Var('res', obj())],
    control: uiTest.itemlistContainerSearchCtrl(),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    uiAction: keyboardEvent('.jb-itemlist', 'keydown', { keyCode: 13, doNotWaitForNextUpdate: true }),
    useFrontEnd: true
  })
})

component('uiTest.editableTextHelper', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: editableText.helperPopup(text('--%value%--'), { autoOpen: true })
    }),
    expectedResult: contains('--Homer'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.editableText.picklistHelper', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      style: editableText.mdcInput(),
      features: editableText.picklistHelper(picklist.optionsByComma('1,2,333'), {
        autoOpen: true
      })
    }),
    expectedResult: contains('333'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.editableText.picklistHelperWithChangingOptions', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: editableText.picklistHelper(picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')), {
        showHelper: notEquals(test.getSelectionChar(), 'b'),
        autoOpen: true
      })
    }),
    expectedResult: contains('ddd'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.editableText.richPicklistHelperWithWatchingGroup', {
  impl: uiTest({
    control: group({
      controls: editableText('name', '%$person/name%', {
        features: editableText.picklistHelper(picklist.optionsByComma(If(test.getSelectionChar(), '1,2,3,4', 'a,b,c,ddd')), {
          showHelper: notEquals(test.getSelectionChar(), 'b'),
          autoOpen: true
        })
      }),
      features: watchRef('%$person/name%')
    }),
    expectedResult: contains('ddd'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.editableNumber', {
  impl: uiTest({
    control: group({
      controls: [
        editableNumber('%$person/age%', 'age', { style: editableNumber.sliderNoText() }),
        editableNumber('%$person/age%', 'age', { style: editableNumber.slider() }),
        editableNumber('%$person/age%', 'age'),
        text('%$person/age%')
      ],
      layout: layout.vertical()
    }),
    expectedResult: contains('42','42','42','42')
  })
})

component('uiTest.editableBoolean.buttonXV', {
  impl: uiTest({
    control: editableBoolean('%$person/male%', editableBoolean.buttonXV({
      yesIcon: icon('location_searching', { type: 'mdc' }),
      noIcon: icon('location_disabled', { type: 'mdc' }),
      buttonStyle: button.mdcFloatingAction('40')
    })),
    expectedResult: contains('material-icons','location_searching')
  })
})

component('uiTest.editableBoolean.allStyles', {
  impl: uiTest({
    control: group(
      editableBoolean('%$person/male%', editableBoolean.checkbox(), { title: 'male' }),
      editableBoolean('%$person/male%', editableBoolean.checkboxWithLabel(), {
        title: 'gender',
        textForTrue: 'male',
        textForFalse: 'female'
      }),
      editableBoolean('%$person/male%', editableBoolean.mdcSlideToggle(), { title: 'male' }),
      editableBoolean('%$person/male%', editableBoolean.expandCollapse(), { title: 'male' }),
      editableBoolean('%$person/male%', editableBoolean.mdcXV(), { title: 'male' }),
      text('%$person/male%')
    ),
    expectedResult: contains('male')
  })
})

component('uiTest.editableBoolean.mdcSlideToggle', {
  impl: uiTest(editableBoolean('%$person/male%', editableBoolean.mdcSlideToggle(), { title: 'male' }), contains('male'))
})

component('uiTest.editableBooleanSettings', {
  impl: uiTest({
    control: group(
      editableBoolean('%$person/male%', editableBoolean.checkboxWithLabel(), {
        title: 'male',
        textForTrue: 'male',
        textForFalse: 'female'
      })
    ),
    expectedResult: contains('male')
  })
})

component('uiTest.editableBoolean.expandCollapse', {
  impl: uiTest({
    control: group({
      controls: [
        editableBoolean('%$expanded%', editableBoolean.expandCollapse(), { features: id('toggle') }),
        text('inner text', { features: [feature.if('%$expanded%'), watchRef('%$expanded%')] })
      ],
      features: watchable('expanded', false)
    }),
    expectedResult: contains('inner text'),
    uiAction: click('#toggle', 'toggle')
  })
})

component('uiTest.expandCollapseWithDefaultCollapse', {
  type: 'control',
  impl: group({
    controls: [
      editableBoolean('%$default%', editableBoolean.checkboxWithLabel(), {
        title: 'default value for expanded',
        features: id('default')
      }),
      group({
        controls: [
          editableBoolean('%$expanded%', editableBoolean.expandCollapse(), { title: 'expColl', features: id('expCollapse') }),
          text('inner text', { features: [feature.if('%$expanded%'), watchRef('%$expanded%')] })
        ],
        features: [
          watchRef('%$default%'),
          feature.initValue('%$expanded%', '%$default%', { alsoWhenNotEmpty: true })
        ]
      })
    ],
    features: [
      watchable('expanded', () => null),
      watchable('default', false)
    ]
  })
})

component('uiTest.editableBoolean.expandCollapseWithDefaultVal', {
  impl: uiTest(uiTest.expandCollapseWithDefaultCollapse(), contains('inner text'), { uiAction: click('#default', 'toggle') })
})

component('uiTest.editableBoolean.expandCollapseWithDefaultCollapse', {
  impl: uiTest(uiTest.expandCollapseWithDefaultCollapse(), not(contains('inner text')))
})

component('uiTest.checkBoxWithText', {
  impl: uiTest({
    control: group(
      editableBoolean('%$person/male%', editableBoolean.checkboxWithLabel(), {
        textForTrue: 'male',
        textForFalse: 'girl',
        features: id('male')
      })
    ),
    expectedResult: contains('male')
  })
})

component('uiTest.picklist', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London')
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
  })
})

component('uiTest.picklist.delayedOptions', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: typeAdapter('rx<>', source.data(obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))))),
          features: picklist.allowAsynchOptions()
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.picklist.delayedOptions.StyleByControlBug', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: typeAdapter('rx<>', source.data(obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))))),
      style: picklist.labelList(),
      features: picklist.allowAsynchOptions()
    }),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.picklist.delayedOptions.StyleByControlBug.Promise', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: typeAdapter('data<>', pipe(
        delay(1),
        obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London'))))
      )),
      style: picklist.labelList(),
      features: picklist.allowAsynchOptions()
    }),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('uiTest.picklistHelper.delayedOptions', {
  impl: uiTest({
    control: editableText({
      databind: '%$person/name%',
      features: editableText.picklistHelper({
        options: typeAdapter('data<>', pipe(
          delay(1),
          obj(
            prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma(() => [1, 2, 3].map(() => Math.floor(Math.random() * 10)).join(','))))
          )
        )),
        picklistStyle: picklist.labelList(),
        picklistFeatures: picklist.allowAsynchOptions(),
        showHelper: true
      })
    }),
    expectedResult: true
  })
})

component('uiTest.picklistRadio', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.radio()
    }),
    expectedResult: contains('Springfield','New York')
  })
})

component('uiTest.picklist.innerSelector', {
  impl: uiTest(picklist({ options: picklist.optionsByComma('a') }), ctx => jb.ui.elemOfSelector('select>option',ctx))
})

component('uiTest.picklistSort', {
  impl: dataTest({
    calculate: pipeline(
      picklist.sortedOptions(picklist.optionsByComma('a,b,c,d'), {
        marks: pipeline(
          'c:100,d:50,b:0,a:20',
          split(','),
          {'$': 'object', code: split(':', { part: 'first' }), mark: split(':', { part: 'second' })}
        )
      }),
      '%text%',
      join()
    ),
    expectedResult: contains('c,d,a')
  })
})

component('uiTest.picklistGroups', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: picklist.optionsByComma('US.Springfield,US.New York,Israel.Tel Aviv,UK.London,mooncity'),
          style: picklist.groups()
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
  })
})

component('uiTest.picklistAsItemlist', {
  impl: uiTest({
    control: group(
      picklist({
        databind: '%$personWithAddress/address/city%',
        options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
        style: picklist.labelList()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
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
    expectedResult: contains('>10<'),
    uiAction: uiActions(runMethod('#itemlist', 'fetchNextPage'), runMethod('#itemlist', 'fetchNextPage'))
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
    expectedResult: contains('>10<','</tbody>'),
    uiAction: runMethod('#itemlist', 'fetchNextPage')
  })
})

component('menuTest.menu1', {
  impl: menu.menu('main', {
    options: [
      menu.menu('File', {
        options: [
          menu.action('New', () => alert(1)),
          menu.action('Open'),
          menu.menu('Bookmarks', { options: [menu.action('Google'), menu.action('Facebook')] }),
          menu.menu('Friends', { options: [menu.action('Dave'), menu.action('Dan')] })
        ]
      }),
      menu.menu('Edit', { options: [menu.action('Copy'), menu.action('Paste')] }),
      menu.dynamicOptions(list(1,2,3), menu.action('dynamic-%%'))
    ]
  })
})

component('menuTest.toolbar', {
  impl: uiTest({
    control: menu.control({
      menu: menu.menu({
        options: [
          menu.action('select', () => console.log('select'), {
            icon: icon('Selection', { type: 'mdi' })
          })
        ],
        icon: icon('undo')
      }),
      style: menuStyle.toolbar()
    }),
    expectedResult: contains('button')
  })
})

component('menuTest.pulldown', {
  impl: uiTest(menu.control(menuTest.menu1(), menuStyle.pulldown()), contains('File','Edit','dynamic-1','dynamic-3'))
})

component('menuTest.pulldown.inner', {
  impl: uiTest(menu.control(menuTest.menu1(), menuStyle.pulldown()), and(contains('Open'), contains('File','Edit','dynamic-1','dynamic-3')), {
    uiAction: click('[$text="File"]', 'openPopup')
  })
})

component('menuTest.contextMenu', {
  impl: uiTest(menu.control(menuTest.menu1()), contains('File','Edit'))
})

component('menuTest.openContextMenu', {
  impl: uiTest(button('open', menu.openContextMenu(menuTest.menu1())), contains('open'))
})

