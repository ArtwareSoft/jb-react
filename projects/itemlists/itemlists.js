jb.ns('d3Chart,d3Scatter,d3Histogram')

jb.component('people', { watchableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Marge Simpson" ,age: 38 , male: false, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Bart Simpson"  ,age: 12 , male: true, children: []}
]
})

jb.component('itemlists.main', { /* itemlists.main */
  type: 'control',
  impl: itemlist({
    items: '%$people%',
    controls: [
      text({title: 'name', text: '%name%', features: [field.columnWidth('250')]}),
      text({title: 'age', text: '%age%', features: null})
    ],
    style: table.withHeaders()
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
            style: layout.horizontal(45),
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

jb.component('itemlists.phones-chart', { /* itemlists.phonesChart */
  type: 'control',
  impl: group({
    controls: [
      d3Chart.chartScatter({
        title: 'phones',
        items: pipeline('%$phones%', filter(between({from: '4', to: '7', val: '%size%'}))),
        frame: d3Chart.frame({
          width: '1200',
          height: '480',
          top: 20,
          right: 20,
          bottom: '40',
          left: '80'
        }),
        pivots: [
          d3Chart.pivot({title: 'performance', value: '%performance%'}),
          d3Chart.pivot({title: 'size', value: '%size%'}),
          d3Chart.pivot({title: 'hits', value: '%hits%', scale: d3Chart.sqrtScale()}),
          d3Chart.pivot({title: 'make', value: '%make%'}),
          d3Chart.pivot({title: '$', value: '%price%'})
        ],
        itemTitle: '%title% (%Announced%)',
        onSelect: openDialog({
          style: dialog.popup(),
          content: group({
            controls: group({
              controls: [
                menu.control({
                  menu: menu.menu({
                    title: 'filter by',
                    options: [menu.action('by maker %make%'), menu.action({})]
                  })
                })
              ]
            })
          }),
          title: 'asa',
          features: [dialogFeature.nearLauncherPosition({offsetLeft: '5', offsetTop: '5'})]
        }),
        visualSizeLimit: '3000',
        style: d3Scatter.plain()
      })
    ]
  })
})
