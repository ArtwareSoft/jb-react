jb.component('studio.search-list',  /* studio_searchList */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      table({
        items: pipeline(
          studio_componentsCrossRef(),
          itemlistContainer_filter(),
          sort('refCount'),
          slice('0', '50')
        ),
        fields: [
          field_control({
            control: materialIcon({
              icon: studio_iconOfType('%type%'),
              features: [css_opacity('0.3'), css('{ font-size: 16px }'), css_padding({top: '5', left: '5'})]
            })
          }),
          field_control({
            title: 'id',
            control: button({
              title: pipeline(
                highlight('%id%', '%$itemlistCntrData/search_pattern%', 'mdl-color-text--indigo-A700')
              ),
              action: studio_gotoPath('%id%'),
              style: button_href()
            }),
            width: '200'
          }),
          field_control({
            title: 'refs',
            control: button({
              title: '%refCount%',
              action: menu_openContextMenu({
                menu: menu_menu({options: [studio_gotoReferencesOptions('%id%', studio_references('%id%'))]})
              }),
              style: button_href()
            })
          }),
          field({title: 'type', data: '%type%'}),
          field({
            title: 'impl',
            data: pipeline('%implType%', data_if('%% = \"function\"', 'javascript', ''))
          })
        ],
        style: table_withHeaders(),
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist_selection({
            databind: '%$itemlistCntrData/selected%',
            selectedToDatabind: '%%',
            databindToSelected: '%%',
            cssForSelected: 'background: #bbb !important; color: #fff !important'
          }),
          itemlist_keyboardSelection({onEnter: studio_gotoPath('%id%')})
        ]
      })
    ],
    features: [
      css_boxShadow({shadowColor: '#cccccc'}),
      css_padding({top: '4', right: '5'}),
      css_height({height: '600', overflow: 'auto', minMax: 'max'}),
      css_width({width: '400', minMax: 'min'})
    ]
  })
})

jb.component('studio.search-component',  /* studio_searchComponent */ {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'itemlist-with-find',
    style: layout_horizontal(''),
    controls: [
      itemlistContainer_search({
        title: 'Search',
        searchIn: item =>
          item.id,
        databind: '%$itemlistCntrData/search_pattern%',
        style: editableText_mdlSearch(),
        features: [
          editableText_helperPopup({
            control: studio_searchList(),
            popupId: 'search-component',
            popupStyle: dialog_popup()
          })
        ]
      })
    ],
    features: [group_itemlistContainer({}), css_margin({top: '-13', left: '10'})]
  })
})
