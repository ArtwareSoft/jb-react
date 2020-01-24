jb.component('studio.search-list', { /* studio.searchList */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      table({
        items: pipeline(
          studio.allComps(),
          itemlistContainer.filter(),
          studio.componentStatistics('%%'),
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
                label.highlight(
                    '%id%',
                    '%$itemlistCntrData/search_pattern%',
                    'mdl-color-text--indigo-A700'
                  )
              ),
              action: studio.openJbEditor('%id%'),
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
            title: 'file',
            data: pipeline('%file%', split({separator: '/', part: 'last'}))
          }),
          field({
            title: 'impl',
            data: pipeline('%implType%', data.if('%% = \"function\"', 'javascript', ''))
          })
        ],
        style: table.plain(),
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
    layout: layout.horizontal(''),
    controls: [
      itemlistContainer.search({
        title: 'Search',
        databind: '%$itemlistCntrData/search_pattern%',
        style: editableText.mdcNoLabel(),
        features: [
          editableText.helperPopup({
            control: studio.searchList(),
            popupId: 'search-component',
            popupStyle: dialog.popup()
          }),
          css(
            '>input {padding-right: 45px; border-bottom-color: white !important} {height: 35px; background: white !important}'
          )
        ]
      }),
      materialIcon({
        icon: 'search',
        features: [css.margin({top: '5', left: '-30'}), css('z-index: 1000')]
      })
    ],
    features: [group.itemlistContainer({}), css.margin({top: '-3', left: '10'})]
  })
})
