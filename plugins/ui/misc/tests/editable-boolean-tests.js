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


