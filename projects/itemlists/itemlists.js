jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('itemlists.main', {
  type: 'control', 
  impl :{$: 'itemlist', 
    items: '%$people%', 
    controls :{$: 'group', 
      style :{$: 'layout.horizontal', spacing: 3 }, 
      controls: [
        {$: 'label', title: '%name%' }, 
        {$: 'label', title: '%age%' }
      ]
    }
  }
})

jb.component('itemlists.table', {
  type: 'control', 
  impl :{$: 'table', 
    items: '%$people%', 
    fields: [ 
    {$: 'field', title: 'name', data: '%name%'},
    {$: 'field', title: 'age', data: '%age%'},
  ]}
})

jb.component('itemlists.table-with-search', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        controls: [
          {$: 'itemlist-container.search', 
            title: 'Search', 
            searchIn :{$: 'itemlist-container.search-in-all-properties' }, 
            databind: '%$itemlistCntrData/search_pattern%', 
            style :{$: 'editable-text.mdl-search' }
          }, 
          {$: 'table', 
            items :{$: 'pipeline', 
              items: [
                '%$people%', 
                {$: 'itemlist-container.filter' }
              ]
            }, 
            fields: [
              {$: 'field', title: 'name', data: '%name%' }, 
              {$: 'field', title: 'age', data: '%age%' }
            ], 
            watchItems: 'true', 
            features :{$: 'watch-ref', 
              ref: '%$itemlistCntrData/search_pattern%', 
              strongRefresh: 'true', 
              includeChildren: ''
            }
          }
        ], 
        features :{$: 'group.itemlist-container' }
      }
    ]
  }
})

jb.component('itemlists.table-with-filters', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        controls: [
          {$: 'group', 
            style :{$: 'layout.horizontal', spacing: 45 }, 
            controls: [
              {$: 'editable-text', 
                title: 'name', 
                databind: '%$itemlistCntrData/name_filter%', 
                style :{$: 'editable-text.mdl-input', width: '100' }
              }, 
              {$: 'editable-text', 
                title: 'age', 
                databind: '%$itemlistCntrData/age_filter%', 
                style :{$: 'editable-text.mdl-input', width: '100' }
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
              {$: 'field', title: 'name', data: '%name%' }, 
              {$: 'field', title: 'age', data: '%age%' }
            ], 
            watchItems: 'true', 
            features :{$: 'watch-ref', 
              ref: '%$itemlistCntrData/search_pattern%', 
              strongRefresh: 'true', 
              includeChildren: ''
            }
          }
        ], 
        features :{$: 'group.itemlist-container' }
      }
    ]
  }
})
