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

jb.component('itemlists.table', {
  type: 'control', 
  impl :{$: 'table', 
    items: '%$people%', 
    fields: [
      {$: 'field', title: 'name', data: '%name%', width: '200' }, 
      {$: 'field', title: 'age', data: '%age%' }
    ]
  }
})

jb.component('itemlists.button-field', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'button-field', 
    controls: [
      {$: 'table', 
        items: '%$people%', 
        fields: [
          {$: 'field', title: 'name', data: '%name%' }, 
          {$: 'field.button', 
            title: 'children', 
            buttonText: '%children/length%', 
            action :{$: 'open-dialog', 
              content :{$: 'group', 
                controls :{$: 'label', 
                  title :{
                    $pipeline: [
                      '%children/name%', 
                      {$: 'join', 
                        separator :{$: 'newline' }, 
                        items: '%%', 
                        itemName: 'item', 
                        itemText: '%%'
                      }
                    ]
                  }, 
                  style :{$: 'label.card-title' }
                }
              }, 
              title: 'children of %name%', 
              onOK: {  }
            }
          }
        ], 
        style :{$: 'table.with-headers' }, 
        visualSizeLimit: 100, 
        features: [{$: 'css.width', width: '300' }]
      }
    ]
  }
})

jb.component('itemlists.large-table', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'large-table', 
    controls: [
      {$: 'table', 
        items :{
          $pipeline: [
            {$: 'range', from: 1, to: '1000' }, 
            {$: 'object', id: '%%', name: '%%-%%' }
          ]
        }, 
        fields: [
          {$: 'field', title: 'id', data: '%id%', numeric: true }, 
          {$: 'field', title: 'group', data: ctx => Math.floor(Number(ctx.data.id) /10) }
        ], 
        style :{$: 'table.mdl', 
          classForTable: 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp', 
          classForTd: 'mdl-data-table__cell--non-numeric'
        }, 
        visualSizeLimit: '1000'
      }
    ]
  }
})

jb.component('itemlists.editable-table', { /* itemlists.editableTable */
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: '%$people%',
        style: table.withHeaders(),
        controls: [
            materialIcon({
              icon: 'person',
              style: icon.material(),
              features: [ itemlist.dragHandle(), field.columnWidth(60) ]
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
              action: removeFromArray({ array: '%$people%', itemToRemove: '%%' }),
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
    ],
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

jb.component('itemlists.table-with-filters', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        title: 'container', 
        controls: [
          {$: 'group', 
            title: 'filters', 
            style :{$: 'layout.horizontal', spacing: 45 }, 
            controls: [
              {$: 'editable-text', 
                title: 'name', 
                databind: '%$itemlistCntrData/name_filter%', 
                style :{$: 'editable-text.mdl-input', width: '100' }, 
                features :{$: 'itemlist-container.filter-field', 
                  fieldData: '%name%', 
                  filterType :{$: 'filter-type.text', ignoreCase: true }
                }
              }, 
              {$: 'editable-text', 
                title: 'age above', 
                databind: '%$itemlistCntrData/age_filter%', 
                style :{$: 'editable-text.mdl-input', width: '100' }, 
                features :{$: 'itemlist-container.filter-field', 
                  fieldData: '%age%', 
                  filterType :{$: 'filter-type.numeric' }
                }
              }
            ]
          }, 
          {$: 'table', 
            items :{$: 'pipeline', 
              items: [
                '%$people%', 
                {$: 'itemlist-container.filter' }
              ]
            }, 
            fields: [
              {$: 'field', title: 'name', data: '%name%', width: '200' }, 
              {$: 'field', title: 'age', data: '%age%' }
            ], 
            features :{$: 'watch-ref', ref: '%$itemlistCntrData%', includeChildren: 'yes' }
          }
        ], 
        features :{$: 'group.itemlist-container' }
      }
    ]
  }
})


jb.component('itemlists.phones-chart', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'd3.chart-scatter', 
        style :{$: 'd3-scatter.plain' }, 
        pivots: [
          {$: 'd3.pivot', title: 'performance', value: '%performance%' }, 
          {$: 'd3.pivot', title: 'size', value: '%size%' }, 
          {$: 'd3.pivot', 
            title: 'hits', 
            value: '%hits%', 
            scale :{$: 'd3.sqrt-scale' }
          }, 
          {$: 'd3.pivot', title: 'make', value: '%make%' }, 
          {$: 'd3.pivot', title: '$', value: '%price%' }
        ], 
        title: 'phones', 
        frame :{$: 'd3.frame', width: '1200', height: '480', top: 20, right: 20, bottom: '40', left: '80' }, 
        visualSizeLimit: '3000', 
        itemTitle: '%title% (%Announced%)', 
        items: '%$devices%'
      }
    ], 
    features :{$: 'global-var', 
      name: 'devices', 
      value :{
        $pipeline: [
          '%$global/phones%', 
          {$: 'slice', $disabled: true, end: '1000' }, 
          {$: 'sample', 
            filter :{$: 'starts-with', startsWith: 'Sam', text: '%title%' }, 
            $disabled: true, 
            size: 300, 
            items: '%%'
          }, 
          {$: 'assign', 
            property: [
              {$: 'prop', 
                title: 'make', 
                val :{$: 'split', separator: ' ', text: '%title%', part: 'first' }, 
                type: 'string'
              }, 
              {$: 'prop', 
                title: 'year', 
                val :{$: 'match-regex', text: '%Announced%', regex: '20[0-9][0-9]' }, 
                type: 'number'
              }, 
              {$: 'prop', 
                title: 'price', 
                val :{
                  $pipeline: [
                    {$: 'match-regex', text: '%Price%', regex: '([0-9.]+) EUR' }, 
                    {$: 'last' }, 
                    ctx => ctx.data * 1.2
                  ]
                }, 
                type: 'number'
              }, 
              {$: 'prop', 
                title: 'size', 
                val :{
                  $pipeline: [
                    {$: 'match-regex', text: '%Size%', regex: '([0-9.]+) inch' }, 
                    {$: 'last' }
                  ]
                }, 
                type: 'number'
              }, 
              {$: 'prop', 
                title: 'performance', 
                val :{
                  $pipeline: [
                    {$: 'match-regex', text: '%Performance%', regex: 'Basemark OS II 2.0:\\s*([0-9.]+)' }, 
                    {$: 'last' }
                  ]
                }, 
                type: 'number'
              }
            ], 
            items: '%%'
          }, 
          {$: 'filter', 
            filter :{ $and: [{$: 'between', from: '4', to: '7', val: '%size%' }, ctx => (ctx.data.year || 0) >= 2016] }
          }
        ]
      }
    }
  }, 
  features :{$: 'variable', 
    name: 'devices', 
    value :{
      $pipeline: [
        '%$global/phones/products%', 
        {$: 'slice', start: '2000', end: '2100' }, 
        {$: 'assign', 
          property: [
            {$: 'prop', 
              title: 'price', 
              val :{
                $pipeline: [
                  '%Price%', 
                  {$: 'match-regex', text: '%%', regex: '([0-9]+) EUR' }, 
                  {$: 'last' }, 
                  ctx => ctx.data * 1.2
                ]
              }, 
              type: 'number'
            }, 
            {$: 'prop', 
              title: 'year', 
              val :{
                $pipeline: [
                  '%Announced%', 
                  {$: 'match-regex', text: '%%', regex: '20[0-9][0-9]' }, 
                  {$: 'last' }
                ]
              }, 
              type: 'number'
            }, 
            {$: 'prop', 
              title: 'size', 
              val :{
                $pipeline: [
                  '%Size%', 
                  {$: 'match-regex', text: '%%', regex: '([0-9.]+) inch' }, 
                  {$: 'last' }
                ]
              }, 
              type: 'number'
            }, 
            {$: 'prop', 
              title: 'performance', 
              val :{
                $pipeline: [
                  '%Performance%', 
                  {$: 'match-regex', text: '%%', regex: 'Basemark OS II 2.0:\\s*([0-9.]+)' }, 
                  {$: 'last' }
                ]
              }, 
              type: 'number'
            }, 
            {$: 'prop', 
              title: 'make', 
              val :{$: 'split', separator: ' ', text: '%title%', part: 'first' }, 
              type: 'string'
            }
          ], 
          items: '%%'
        }, 
        {$: 'filter', 
          filter :{$: 'between', from: '4', to: '7', val: '%size%' }
        }
      ]
    }
  }
})
