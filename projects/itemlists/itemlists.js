using('ui-core')
component('dataResource.sortBy', {
  watchableData: 'age'
})

component('dataResource.selectedItem', {
  watchableData: {

  }
})

component('dataResource.noOfItems', {
  watchableData: '1000'
})

component('itemlists.main', {
  type: 'control',
  description: `Table of people with name and age columns.
The data source is taken from a variable named \"%$people%\".
In the example, field in a table with title \"name\" is bounded to the path \"%name%\"
  `,
  impl: table({
    items: '%$people%',
    controls: [
      text('%name%', 'name'),
      text('%age%', 'age')
    ],
    style: table.mdc()
  })
})

component('itemlists.selection', {
  type: 'control',
  description: `Table with single selection. The selection is bounded to a watchable reactive variable named %$selectedItem%`,
  impl: table({
    items: '%$people%',
    controls: [
      text('%name%', 'name'),
      text('%age%', 'age')
    ],
    style: table.mdc(),
    features: [itemlist.selection({databind: '%$selectedItem%', autoSelectFirst: 'true'}), itemlist.keyboardSelection()]
  })
})

component('itemlists.manyItems', {
  type: 'data<>',
  params: [
    {id: 'howMany', as: 'number', defaultValue: 1000 }
  ],
  impl: pipeline(range(1, '%$howMany%'), obj(prop('id','%%'), prop('name','%%-%%'), prop('group', ({data}) => Math.floor(Number(data) /10))))
})

component('itemlists.largeTable', {
  type: 'control',
  description: `Large tables with many items are defined with the infinite scroll feature`,
  impl: table({
    items: itemlists.manyItems(),
    controls: [
      text('%id%','id'),
      text('%group%','group'),
    ],
    style: table.mdc(),
    features: itemlist.infiniteScroll()
   })
})

component('itemlists.search', {
  type: 'control',
  description: `Do the following to add a search capability to itemlist
- wrap the itemlist with a group called itemlist container and set a group.itemlistContainer feature to it
- add a itemlistContainer.search control to the container group
- set to itemlist items as a pipeline with itemlistContainer.filter() at the end
- add watchRef to the itemlist features bounded to '%$itemlistCntrData/search_pattern%' in order to auto refresh the itemlist when the search pattern is changed
- set itemlist property visualSizeLimit to 5-10 items to make the resposonse faster after each user click
- add infinite scroll to allow the user to scroll to more results
`,
  impl: group({
    layout: layout.vertical('20'),
    controls: [
      itemlistContainer.search(),
      table({
        items: pipeline(
          itemlists.manyItems(),
          itemlistContainer.filter()
        ),
        controls: [
          text('%id%','id'),
          text('%group%','group'),
        ],
        style: table.mdc(),
        visualSizeLimit: 10,
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.infiniteScroll(),
        ]
      })
    ],
    features: group.itemlistContainer()
  })
})


component('itemlists.editableTable', {
  type: 'control',
  impl: group({
    controls: [
      table({
        items: '%$people%',
        controls: [
          control.icon({
            icon: 'person',
            features: [itemlist.dragHandle(), field.columnWidth(60)]
          }),
          editableText({
            title: 'name',
            databind: '%name%',
            style: editableText.mdcNoLabel('200')
          }),
          editableText({
            title: 'age',
            databind: '%age%',
            style: editableText.mdcNoLabel('50')
          }),
          button({
            action: removeFromArray({array: '%$people%', itemToRemove: '%%'}),
            style: button.x('21'),
            features: [itemlist.shownOnlyOnItemHover(), field.columnWidth(60)]
          })
        ],
        style: table.mdc(),
        features: [
          watchRef({ref: '%$people%', includeChildren: 'structure', allowSelfRefresh: true}),
          itemlist.dragAndDrop(),
          itemlist.keyboardSelection({}),
          itemlist.selection({})
        ]
      }),
      button({
        title: 'add person',
        action: addToArray('%$people%', obj()),
        raised: 'true',
        features: [
          css.width('200'),
          css.margin('10'),
          feature.icon('person_add_disabled', undefined)
        ]
      })
    ]
  })
})


component('itemlists.searchPeople', {
  type: 'control',
  impl: group({
    controls: [
      group({
        layout: layout.vertical(),
        controls: [
          itemlistContainer.search({
            title: 'Search',
            searchIn: search.searchInAllProperties(),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText.mdcSearch('300')
          }),
          table({
            items: pipeline('%$people%', itemlistContainer.filter()),
            controls: [
              text({text: '%name%', title: 'name'}),
              text({text: '%age%', title: 'age'})
            ],
            style: table.mdc(),
            features: [
              watchRef('%$itemlistCntrData/search_pattern%'),
              itemlist.selection({
                onDoubleClick: openDialog({title: 'double click', content: group({})}),
                autoSelectFirst: 'true'
              }),
              itemlist.keyboardSelection({}),
              css.width('300')
            ]
          })
        ],
        features: [group.itemlistContainer({}), css.width('300')]
      })
    ]
  })
})

component('itemlists.filters', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: 'container',
        controls: [
          group({
            title: 'filters',
            layout: layout.horizontal('100'),
            controls: [
              editableText({
                title: 'name',
                databind: '%$itemlistCntrData/name_filter%',
                style: editableText.mdcInput('100'),
                features: itemlistContainer.filterField('%name%', filterType.text(true))
              }),
              editableText({
                title: 'age above',
                databind: '%$itemlistCntrData/age_filter%',
                style: editableText.mdcInput('100'),
                features: itemlistContainer.filterField('%age%', filterType.numeric())
              })
            ]
          }),
          table({
            title: '',
            items: pipeline('%$people%', itemlistContainer.filter()),
            controls: [
              text({text: '%name%', title: 'name'}),
              text({text: '%age%', title: 'age'})
            ],
            features: [watchRef({ref: '%$itemlistCntrData%', includeChildren: 'yes'})]
          })
        ],
        features: [group.itemlistContainer({}), css.width('300')]
      })
    ]
  })
})

component('itemlists.masterDetailsWithContainer', {
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      table({
        items: '%$people%',
        controls: [
          text({text: '%name%', title: 'name'})
        ],
        style: table.mdc(true),
        features: [
          itemlist.selection({autoSelectFirst: 'true'}),
          itemlist.keyboardSelection({}),
          css.width('200px')
        ]
      }),
      group({
        title: 'person',
        style: propertySheet.titlesAbove({titleStyle: header.mdcHeadline6()}),
        controls: [
          text({text: '%name%', title: 'name'}),
          text({text: '%age%', title: 'age'})
        ],
        features: [group.data({Data: '%$itemlistCntrData/selected%', watch: true}), group.card({})]
      })
    ],
    features: group.itemlistContainer({})
  })
})

component('itemlists.masterDetails', {
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      table({
        items: '%$people%',
        controls: [
          text({text: '%name%', title: 'name'})
        ],
        style: table.mdc(true),
        features: [
          itemlist.selection({databind: '%$selected%', autoSelectFirst: 'true'}),
          itemlist.keyboardSelection({})
        ]
      }),
      group({
        title: 'person',
        style: propertySheet.titlesLeft({
          titleStyle: styleWithFeatures(text.span(), css.bold()),
          titleText: '%%:'
        }),
        controls: [
          text({text: '%name%', title: 'name'}),
          text({text: '%age%', title: 'age'})
        ],
        features: [group.data({Data: '%$selected%', watch: true}), group.card({width: '500'})]
      })
    ],
    features: [
      watchable('selected', '%$people/0%'),
      css.width('500')
    ]
  })
})

component('itemlists.sort', {
  type: 'control',
  impl: group({
    controls: [
      group({
        style: propertySheet.titlesLeft({}),
        controls: [
          picklist({
            title: 'sort by:',
            databind: '%$sortBy%',
            options: picklist.optionsByComma('age,name'),
            style: select.native(),
            features: css.width('100')
          })
        ]
      }),
      table({
        items: pipeline('%$people%', sort({propertyName: '%$sortBy%', ascending: 'true'})),
        controls: [
          text({text: '%name%', title: 'name', features: field.columnWidth('250')}),
          text({text: '%age%', title: 'age'})
        ],
        features: watchRef('%$sortBy%')
      })
    ]
  })
})

component('dataResource.people', {
  watchableData: [
    {
      name: 'Homer Simpson',
      age: '42',
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: '38',
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: '12'}
  ]
})

