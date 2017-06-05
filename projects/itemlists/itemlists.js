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
            items: '%$people%', 
            fields: [
              {$: 'field', title: 'name', data: '%name%' }, 
              {$: 'field', title: 'age', data: '%age%' }
            ]
          }
        ], 
        features :{$: 'group.itemlist-container' }
      }
    ]
  }
})
