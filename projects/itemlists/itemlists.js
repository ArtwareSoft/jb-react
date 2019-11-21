jb.component('people', { watchableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Marge Simpson" ,age: 38 , male: false, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Bart Simpson"  ,age: 12 , male: true, children: []}
]
})

jb.component('itemlists.main', { /* itemlists.main */
  type: 'control',
  impl: itemlist({
    title: '',
    items: '%$people%',
    controls: [
      text({title: 'name', text: '%name%', features: field.columnWidth('250')}),
      text({title: 'age', text: '%age%'})
    ],
    style: table.withHeaders(),
    features: itemlist.selection({databind: '%$selectedItem%', autoSelectFirst: 'true'})
  })
})

jb.component('itemlists.table', { /* itemlists.table */
  type: 'control',
  impl: table({
    items: '%$people%',
    fields: [
      field({title: 'name', data: '%name%', width: '200'}),
      field({title: 'age', data: '%age%'})
    ]
  })
})

jb.component('itemlists.button-field', { /* itemlists.buttonField */
  type: 'control',
  impl: group({
    title: 'button-field',
    controls: [
      table({
        items: '%$people%',
        fields: [
          field({title: 'name', data: '%name%'}),
          field.button({
            title: 'children',
            buttonText: '%children/length%',
            action: openDialog({
              content: group({
                controls: label({
                  title: pipeline(
                    '%children/name%',
                    join({separator: {'$': 'newline'}, items: '%%', itemName: 'item', itemText: '%%'})
                  ),
                  style: label.cardTitle()
                })
              }),
              title: 'children of %name%',
              onOK: {}
            })
          })
        ],
        style: table.withHeaders(),
        visualSizeLimit: 100,
        features: [css.width('300')]
      })
    ]
  })
})

jb.component('itemlists.large-table', { /* itemlists.largeTable */
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
        style: table.mdl(
          'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
          'mdl-data-table__cell--non-numeric'
        ),
        visualSizeLimit: '1000'
      })
    ]
  })
})

jb.component('itemlists.editable-table', { /* itemlists.editableTable */
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: '%$people%',
        controls: [
          materialIcon({
            icon: 'person',
            style: icon.material(),
            features: [itemlist.dragHandle(), field.columnWidth(60)]
          }),
          editableText({
            title: 'name',
            databind: '%name%',
            style: editableText.mdlInputNoFloatingLabel('200')
          }),
          editableText({
            title: 'age',
            databind: '%age%',
            style: editableText.mdlInputNoFloatingLabel('50')
          }),
          button({
            action: removeFromArray({array: '%$people%', itemToRemove: '%%'}),
            style: button.x('21'),
            features: [itemlist.shownOnlyOnItemHover(), field.columnWidth(60)]
          })
        ],
        style: table.mdl('mdl-data-table mdl-shadow--2dp', 'mdl-data-table__cell--non-numeric'),
        features: [
          watchRef({ref: '%$people%', includeChildren: 'structure', allowSelfRefresh: true}),
          itemlist.dragAndDrop()
        ]
      }),
      button({
        title: 'add',
        action: addToArray('%$people%', obj()),
        style: button.mdlRaised()
      })
    ]
  })
})


jb.component('itemlists.table-with-search', { /* itemlists.tableWithSearch */
  type: 'control',
  impl: group({
    controls: [
      group({
        controls: [
          itemlistContainer.search({
            title: 'Search',
            searchIn: itemlistContainer.searchInAllProperties(),
            databind: '%$itemlistCntrData/search_pattern%',
            style: editableText.mdlSearch()
          }),
          table({
            items: pipeline('%$people%', itemlistContainer.filter()),
            fields: [field({title: 'name', data: '%name%'}), field({title: 'age', data: '%age%'})],
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
        features: group.itemlistContainer({})
      })
    ]
  })
})

jb.component('itemlists.table-with-filters', { /* itemlists.tableWithFilters */
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
                style: editableText.mdlInput('100'),
                features: itemlistContainer.filterField('%name%', filterType.text(true))
              }),
              editableText({
                title: 'age above',
                databind: '%$itemlistCntrData/age_filter%',
                style: editableText.mdlInput('100'),
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

jb.component('itemlists.master-details-with-container', { /* itemlists.masterDetailsWithContainer */
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      itemlist({
        items: '%$people%',
        controls: [
          text({title: 'name', text: '%name%'})
        ],
        features: [itemlist.selection({autoSelectFirst: 'true'}), itemlist.keyboardSelection({})]
      }),
      html({
        title: 'separator',
        html: '<div></div>',
        features: [
          css.border({width: '1', side: 'right', color: 'grey'}),
          css.margin({left: '10', right: '10'})
        ]
      }),
      group({
        title: 'person',
        style: propertySheet.titlesAbove('5'),
        controls: [
          text({title: 'name', text: '%name%', style: label.cardTitle()}),
          text({title: 'age', text: '%age%', style: label.cardTitle()})
        ],
        features: group.data({data: '%$itemlistCntrData/selected%', watch: true})
      })
    ],
    features: group.itemlistContainer({})
  })
})

jb.component('itemlists.master-details', { /* itemlists.masterDetails */
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      itemlist({
        items: '%$people%',
        controls: [
          text({title: 'name', text: '%name%'})
        ],
        features: [
          itemlist.selection({databind: '%$selected%', autoSelectFirst: 'true'}),
          itemlist.keyboardSelection({})
        ]
      }),
      html({
        title: 'separator',
        html: '<div></div>',
        features: [
          css.border({width: '1', side: 'right', color: 'grey'}),
          css.margin({left: '10', right: '10'})
        ]
      }),
      group({
        title: 'person',
        style: propertySheet.titlesLeft({}),
        controls: [
          text({title: 'name', text: '%name%', style: label.cardTitle()}),
          text({title: 'age', text: '%age%', style: label.cardTitle()})
        ],
        features: group.data({data: '%$selected%', watch: true})
      })
    ],
    features: variable({name: 'selected', value: '%$people/0%', watchable: true})
  })
})

jb.component('itemlists.with-sort', { /* itemlists.withSort */
  type: 'control',
  impl: group({
    controls: [
      group({
        style: propertySheet.titlesLeft({vSpacing: '', hSpacing: '', titleWidth: '60'}),
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
          text({title: 'name', text: '%name%', features: field.columnWidth('250')}),
          text({title: 'age', text: '%age%'})
        ],
        style: table.withHeaders(),
        features: watchRef('%$sortBy%')
      })
    ]
  })
})

jb.component('data-resource.sortBy', { /* dataResource.sortBy */
  watchableData: 'age'
})

jb.component('data-resource.selectedItem', { /* dataResource.selectedItem */
  watchableData: {
    
  }
})
