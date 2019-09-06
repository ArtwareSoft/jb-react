jb.component('studio.search-list', { /* studio.searchList */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      table({
        items: pipeline(
          studio.componentsCrossRef(),
          itemlistContainer.filter(),
          sort('refCount'),
          slice('0', '50')
        ),
        fields: [
          field.control({
            control: materialIcon({
              icon: studio.iconOfType('%type%'),
              features: [
                css.opacity('0.3'),
                css('{ font-size: 16px }'),
                css.padding({top: '5', left: '5'})
              ]
            })
          }),
          field.control({
            title: 'id',
            control: button({
              title: pipeline(
                highlight(
                    '%id%',
                    '%$itemlistCntrData/search_pattern%',
                    'mdl-color-text--indigo-A700'
                  )
              ),
              action: studio.gotoPath('%id%'),
              style: button.href()
            }),
            width: '200'
          }),
          field.control({
            title: 'refs',
            control: button({
              title: '%refCount%',
              action: menu.openContextMenu({
                menu: menu.menu({
                  options: [studio.gotoReferencesOptions('%id%', studio.references('%id%'))]
                })
              }),
              style: button.href()
            })
          }),
          field({title: 'type', data: '%type%'}),
          field({
            title: 'impl',
            data: pipeline('%implType%', data.if('%% = \"function\"', 'javascript', ''))
          })
        ],
        style: table.withHeaders(),
        features: [
          watchRef('%$itemlistCntrData/search_pattern%'),
          itemlist.selection({
            databind: '%$itemlistCntrData/selected%',
            selectedToDatabind: '%%',
            databindToSelected: '%%',
            cssForSelected: 'background: #bbb !important; color: #fff !important'
          }),
          itemlist.keyboardSelection({onEnter: studio.gotoPath('%id%')})
        ]
      })
    ],
    features: [
      css.boxShadow({shadowColor: '#cccccc'}),
      css.padding({top: '4', right: '5'}),
      css.height({height: '600', overflow: 'auto', minMax: 'max'}),
      css.width({width: '400', minMax: 'min'})
    ]
  })
})

jb.component('studio.search-component', { /* studio.searchComponent */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'itemlist-with-find',
    style: layout.horizontal(''),
    controls: [
      itemlistContainer.search({
        title: 'Search',
        searchIn: item =>
          item.id,
        databind: '%$itemlistCntrData/search_pattern%',
        style: editableText.mdlSearch(),
        features: [
          editableText.helperPopup({
            control: studio.searchList(),
            popupId: 'search-component',
            popupStyle: dialog.popup()
          })
        ]
      })
    ],
    features: [group.itemlistContainer({}), css.margin({top: '-13', left: '10'})]
  })
})
