
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
          {$: 'field.control', 
            title: 'id', 
            control :{$: 'button', 
              title :{$: 'pipeline', 
                items :{$: 'highlight', 
                  base: '%id%', 
                  highlight: '%$itemlistCntrData/search_pattern%', 
                  cssClass: 'mdl-color-text--indigo-A700'
                }
              }, 
              action :{$: 'studio.goto-path', path: '%id%' }, 
              style :{$: 'button.href' }
            }, 
            width: '200'
          }, 
          {$: 'field', title: 'refs', data: '%refCount%', width: '30' }, 
          {$: 'field', title: 'type', data: '%type%' }, 
          {$: 'field', 
            title: 'impl', 
            data :{$: 'pipeline', 
              items: [
                '%implType%', 
                {$: 'data.if', 
                  condition: '%% = "function"', 
                  then: 'javascript', 
                  else: ''
                }
              ]
            }
          }
        ], 
        style :{$: 'table.with-headers' }, 
        features: [
          {$: 'itemlist.selection', databind: '' }, 
          {$: 'watch-ref', 
            ref: '%$itemlistCntrData/search_pattern%', 
            strongRefresh: 'true'
          }
        ]
      }
    ], 
    features: [
      {$: 'css.box-shadow', shadowColor: '#cccccc' }, 
      {$: 'css.padding', top: '4', right: '5' }, 
      {$: 'css.height', height: '600', overflow: 'auto', minMax: 'max' }, 
      {$: 'css.width', width: '400', minMax: 'min' }
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
    {$: 'dialog.close-containing-popup' }
  ]}
})