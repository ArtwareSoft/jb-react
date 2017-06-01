
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
          }, 
          {$: 'css.margin', top: '-10' }
        ]
      }
    ], 
    features: [
      {$: 'group.itemlist-container' }, 
      {$: 'css.width', width: '230' }, 
      {$: 'css.margin', top: '-8' }
    ]
  }
})

jb.component('studio.search-list', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'itemlist', 
        title: 'items', 
        items :{
          $pipeline: [
            {$: 'studio.components-cross-ref' }, 
            {$: 'itemlist-container.filter' }, 
            {$: 'numeric-sort', propertyName: 'refCount' }, 
            {$: 'slice', start: '0', end: '50' }
          ]
        }, 
        controls :{$: 'group', 
          style :{$: 'layout.horizontal', spacing: 3 }, 
          controls: [
            {$: 'material-icon', 
              icon :{$: 'studio.icon-of-type', type: '%type%' }, 
              features: [
                {$: 'css.opacity', opacity: '0.3' }, 
                {$: 'css', css: '{ font-size: 16px }' }, 
                {$: 'css.padding', top: '5', left: '5' }
              ]
            }, 
            {$: 'label', 
              title :{$: 'highlight', 
                base: '%id% (%refCount%)', 
                highlight: '%$itemlistCntrData/search_pattern%'
              }, 
              style :{$: 'custom-style', 
                template: (cmp,state,h) => 
              h('span',{},state.title), 
                features: [
                  {$: 'css.padding', left: '3' }, 
                  {$: 'css.opacity', opacity: '1' }
                ]
              }
            }
          ]
        }, 
        watchItems: true, 
        itemVariable: 'item', 
        features: [
          {$: 'css.height', height: '300', overflow: 'auto', minMax: '' }, 
          {$: 'itemlist.selection', 
            onDoubleClick :{$: 'studio.search-component-selected', path: '%id%' }, 
            autoSelectFirst: true
          }, 
          {$: 'itemlist.keyboard-selection', 
            onEnter :{$: 'studio.search-component-selected', path: '%id%' }, 
            autoFocus: false
          }, 
          {$: 'feature.if', 
            showCondition: '%$itemlistCntrData/search_pattern%'
          }
        ]
      }, 
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
          {$: 'field', title: 'id', data: '%id%' }, 
          {$: 'field', title: 'refs', data: '%refCount%' }, 
          {$: 'field', title: 'type', data: '%type%' }, 
          {$: 'field', title: 'impl', data: '%implType%' }
        ], 
        style :{$: 'table.with-headers' }
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