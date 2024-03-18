component('uiTest.itemlistContainerSearchCtrl', {
  type: 'control',
  impl: group({
    controls: [
      itemlistContainer.search({ style: editableText.mdcSearch(), features: id('search') }),
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

component('itemlistContainerTest.search.highligh', {
  impl: uiTest(uiTest.itemlistContainerSearchCtrl(), contains('Ho<','>mer'), { uiAction: setText('ho', '#search') })
})

component('itemlistContainerTest.search.pick', {
  impl: uiTest({
    vars: [Var('res', obj())],
    control: uiTest.itemlistContainerSearchCtrl(),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    uiAction: keyboardEvent('.jb-itemlist', 'keydown', { keyCode: 13, doNotWaitForNextUpdate: true }),
    emulateFrontEnd: true
  })
})

component('itemlistContainerDemo.searchPeople', {
  doNotRunInTests: true,
  impl: uiTest(group({
    controls: [
      itemlistContainer.search('Search', search.searchInAllProperties(), {
        databind: '%$itemlistCntrData/search_pattern%',
        style: editableText.mdcSearch('300')
      }),
      table({
        items: pipeline('%$people%', itemlistContainer.filter()),
        controls: [
          text('%name%', 'name'),
          text('%age%', 'age')
        ],
        style: table.mdc(),
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.selection({ onDoubleClick: openDialog('double click', group()), autoSelectFirst: 'true' }),
          itemlist.keyboardSelection(),
          css.width('300')
        ]
      })
    ],
    layout: layout.vertical(),
    features: [
      group.itemlistContainer(),
      css.width('300')
    ]
  }))
})

component('itemlistContainerDemo.filters', {
  doNotRunInTests: true,
  impl: uiTest(group(
    group({
      controls: [
        group({
          controls: [
            editableText('name', '%$itemlistCntrData/name_filter%', {
              style: editableText.mdcInput('100'),
              features: itemlistContainer.filterField('%name%', filterType.text(true))
            }),
            editableText('age above', '%$itemlistCntrData/age_filter%', {
              style: editableText.mdcInput('100'),
              features: itemlistContainer.filterField('%age%', filterType.numeric())
            })
          ],
          title: 'filters',
          layout: layout.horizontal('100')
        }),
        table('', {
          items: pipeline('%$people%', itemlistContainer.filter()),
          controls: [
            text('%name%', 'name'),
            text('%age%', 'age')
          ],
          style: table.mdc({ hideHeaders: true }),
          features: watchRef('%$itemlistCntrData%', { includeChildren: 'yes' })
        })
      ],
      title: 'container',
      features: [
        group.itemlistContainer(),
        css.width('300')
      ]
    })
  ))
})

component('itemlistContainerDemo.masterDetails', {
  doNotRunInTests: true,
  impl: uiTest(group({
    controls: [
      table({
        items: '%$people%',
        controls: text('%name%', 'name'),
        style: table.mdc({ hideHeaders: true }),
        features: [
          itemlist.selection({ autoSelectFirst: 'true' }),
          itemlist.keyboardSelection(),
          css.width('200px')
        ]
      }),
      group(text('%name%', 'name'), text('%age%', 'age'), {
        title: 'person',
        style: propertySheet.titlesLeft(),
        features: [
          css.margin('20'),
          group.data('%$itemlistCntrData/selected%', { watch: true })
        ]
      })
    ],
    layout: layout.horizontal({ spacing: '20' }),
    features: group.itemlistContainer()
  }))
})