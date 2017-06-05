
jb.component('studio.search-component', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    title: 'itemlist-with-find', 
    style :{$: 'layout.horizontal', spacing: '' }, 
    controls: [
      {$: 'itemlist-container.search', 
        control :{$: 'studio.search-list', path: '%$path%' }, 
        title: 'Search', 
        searchIn: item => 
          item.id, 
        databind: '%$itemlistCntrData/search_pattern%', 
        style :{$: 'editable-text.mdl-input', width: '200' }, 
        features: [
          {$: 'editable-text.helper-popup', 
            features :{$: 'dialog-feature.near-launcher-position' }, 
            control :{$: 'studio.search-list' }, 
            popupId: 'search-component', 
            popupStyle :{$: 'dialog.popup' }
          }
        ]
      }
    ], 
    features: [
      {$: 'group.itemlist-container' }, 
      {$: 'css.margin', top: '-13' }
    ]
  }
})

jb.component('studio.search-list', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'table', 
        items :{
          $pipeline: [
            {$: 'studio.components-cross-ref' }, 
            {$: 'itemlist-container.filter' }, 
            {$: 'numeric-sort', propertyName: 'refCount' }, 
            {$: 'slice', start: '0', end: '50' }
          ]
        }, 
        fields: [
          {$: 'field.control', 
            control :{$: 'material-icon', 
              icon :{$: 'studio.icon-of-type', type: '%type%' }, 
              features: [
                {$: 'css.opacity', opacity: '0.3' }, 
                {$: 'css', css: '{ font-size: 16px }' }, 
                {$: 'css.padding', top: '5', left: '5' }
              ]
            }
          }, 
          {$: 'field', title: 'id', data: '%id%' }, 
          {$: 'field', title: 'refs', data: '%refCount%' }, 
          {$: 'field', title: 'type', data: '%type%' }, 
          {$: 'field', title: 'impl', data: '%implType%' }
        ], 
        style :{$: 'table.with-headers' }, 
        features :{$: 'itemlist.selection' }
      }
    ]
  }
})

jb.component('studio.search-component-selected',{
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: {$runActions: [
    {$: 'write-value', to: '%$itemlistCntrData/search_pattern%', value: '' },
    {$: 'studio.goto-path', path: '%$path%' },
    {$: 'close-containing-popup' }
  ]}
})