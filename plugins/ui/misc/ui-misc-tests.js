using('ui-slider')

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
    emulateFrontEnd: true
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

component('uiTest.picklist.rxOptions', {
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

// component('uiTest.picklist.innerSelector', {
//   impl: uiTest(picklist({ options: picklist.optionsByComma('a') }), ctx => jb.ui.elemOfSelector('select>option',ctx))
// })

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

