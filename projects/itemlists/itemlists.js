jb.component('people', { watchableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Marge Simpson" ,age: 38 , male: false, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Bart Simpson"  ,age: 12 , male: true, children: []}
]
})

jb.component('itemlists.main', {
  type: 'control',
  impl: group({
    layout: layout.vertical(),
    controls: [
      button({title: 'click me', style: button.mdcIcon(icon({icon: 'Yoga', type: 'mdi'}))}),
      itemlist({
        title: '',
        items: '%$people%',
        controls: [
          text({text: '%name%', title: 'name', features: field.columnWidth('250')}),
          text({text: '%age%', title: 'age'})
        ],
        style: table.plain(),
        features: [
          itemlist.selection({databind: '%$selectedItem%', autoSelectFirst: 'true'}),
          itemlist.keyboardSelection({})
        ]
      })
    ]
  })
})

jb.component('itemlists.table', {
  type: 'control',
  impl: table({
    items: '%$people%',
    fields: [
      field({title: 'name', data: '%name%', width: '200'}),
      field({title: 'age', data: '%age%'})
    ],
    style: table.mdc()
  })
})

jb.component('itemlists.largeTable', {
  type: 'control',
  impl: group({
    title: 'large-table',
    controls: [
      table({
        items: pipeline(range(1, '1000'), {'$': 'object', id: '%%', name: '%%-%%'}),
        fields: [
          field({title: 'id', data: '%id%', numeric: true}),
          field({title: 'group', data: ctx => Math.floor(Number(ctx.data.id) /10)})
        ],
        style: table.mdc(),
        visualSizeLimit: '1000'
      })
    ]
  })
})

jb.component('itemlists.largeTableWithSearch', {
  type: 'control',
  impl: group({
    title: 'large-table',
    controls: [
      itemlistContainer.search({searchIn: search.fuse({})}),
      table({
        items: pipeline(
          range(1, '1000'),
          {'$': 'object', id: '%%', name: '%%-%%'},
          itemlistContainer.filter()
        ),
        fields: [
          field({title: 'id', data: '%id%', hoverTitle: '--%id%--', numeric: true}),
          field({title: 'group', data: ctx => Math.floor(Number(ctx.data.id) /10)})
        ],
        style: table.mdc(),
        visualSizeLimit: '1000',
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.selection({
            onDoubleClick: openDialog({
              content: group({}),
              title: '%id%',
              features: dialogFeature.uniqueDialog('unique')
            })
          }),
          itemlist.keyboardSelection({
            onEnter: openDialog({
              content: group({}),
              title: '%id%',
              features: [dialogFeature.uniqueDialog('unique')]
            })
          })
        ]
      })
    ],
    features: group.itemlistContainer({})
  })
})

jb.component('itemlists.editableTable', {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
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


jb.component('itemlists.tableWithSearch', {
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
            fields: [field({title: 'name', data: '%name%'}), field({title: 'age', data: '%age%'})],
            style: table.mdc(),
            features: [
              watchRef('%$itemlistCntrData/search_pattern%'),
              itemlist.selection({
                onDoubleClick: openDialog({content: group({}), title: 'double click'}),
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

jb.component('itemlists.tableWithFilters', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: 'container',
        controls: [
          group({
            title: 'filters',
            layout: layout.horizontal(45),
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
            items: pipeline('%$people%', itemlistContainer.filter()),
            fields: [
              field({title: 'name', data: '%name%', width: '200'}),
              field({title: 'age', data: '%age%'})
            ],
            features: watchRef({ref: '%$itemlistCntrData%', includeChildren: 'yes'})
          })
        ],
        features: group.itemlistContainer({})
      })
    ]
  })
})

jb.component('itemlists.masterDetailsWithContainer', {
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      itemlist({
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
        features: [group.data({data: '%$itemlistCntrData/selected%', watch: true}), group.card({})]
      })
    ],
    features: group.itemlistContainer({})
  })
})

jb.component('itemlists.masterDetails', {
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      itemlist({
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
        features: [group.data({data: '%$selected%', watch: true}), group.card({width: '500'})]
      })
    ],
    features: [
      variable({name: 'selected', value: '%$people/0%', watchable: true}),
      css.width('500')
    ]
  })
})

jb.component('itemlists.withSort', {
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
            style: picklist.native(),
            features: css.width('100')
          })
        ]
      }),
      itemlist({
        items: pipeline('%$people%', sort({propertyName: '%$sortBy%', ascending: 'true'})),
        controls: [
          text({text: '%name%', title: 'name', features: field.columnWidth('250')}),
          text({text: '%age%', title: 'age'})
        ],
        style: table.plain(),
        features: watchRef('%$sortBy%')
      })
    ]
  })
})

jb.component('dataResource.sortBy', {
  watchableData: 'age'
})

jb.component('dataResource.selectedItem', {
  watchableData: {

  }
})

jb.component('dataResource.people', {
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

jb.component('itemlists.infiniteScroll', {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        title: '',
        items: range(),
        controls: [
          text({text: '%%', title: 'my title'})
        ],
        visualSizeLimit: '7',
        features: [
          css.height({height: '100', overflow: 'scroll'}),
          itemlist.infiniteScroll(),
          css.width('600')
        ]
      }),
      itemlistContainer.search({
        title: '',
        searchIn: '%%',
        databind: '%$itemlistCntrData/search_pattern%'
      }),
      itemlist({
        title: '',
        items: pipeline(ctx => jb.frame.MDIcons, keys(), itemlistContainer.filter()),
        controls: [
          group({
            layout: layout.horizontal(),
            controls: [
              button({title: 'icon', style: button.mdcIcon(icon({icon: '%%', type: 'mdi'}))}),
              text({
                text: pipeline('%%', text.highlight('%%', '%$itemlistCntrData.search_pattern%')),
                title: 'icon name'
              })
            ]
          })
        ],
        visualSizeLimit: '50',
        features: [
          watchRef({ref: '%$itemlistCntrData/search_pattern%', strongRefresh: 'true'}),
          css.height({height: '300', overflow: 'scroll'}),
          css.width('600'),
          itemlist.infiniteScroll()
        ]
      })
    ],
    features: group.itemlistContainer({})
  })
})
