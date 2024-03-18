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
          group({
            controls: [
              editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
              text('%name%')
            ],
            layout: layout.flex('row', 'start', { alignItems: 'center' })
          }),
          controlWithCondition('%$sectionExpanded/{%$index%}%', group(text('inner text'), {
            features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')
          })),
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
          group({
            controls: [
              editableBoolean('%$sectionExpanded/{%$index%}%', editableBoolean.expandCollapse()),
              text('%name%')
            ],
            layout: layout.flex('row', 'start', { alignItems: 'center' })
          }),
          controlWithCondition('%$sectionExpanded/{%$index%}%', group(text('inner text'), {
            features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')
          })),
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
    expectedResult: and(
      contains('colspan="','inner text','Bart'),
      not(contains('>42<')),
      not(contains('inner text','inner text'))
    ),
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