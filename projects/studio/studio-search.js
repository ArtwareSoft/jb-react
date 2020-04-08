jb.component('studio.searchList', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
        items: pipeline(
          studio.allComps(),
          itemlistContainer.filter(),
          studio.componentStatistics('%%'),
        ),
        visualSizeLimit: 30,
        controls: [
          control.icon({
              icon: studio.iconOfType('%type%'),
              features: [
                css.opacity('0.3'),
                css('{ font-size: 16px }'),
                css.padding({top: '5', left: '5'})
              ]
          }),
          button({
              title: pipeline(
                text.highlight(
                    '%id%',
                    '%$itemlistCntrData/search_pattern%',
                    'mdl-color-text--deep-purple-A700'
                  )
              ),
              action: studio.openJbEditor('%id%'),
              style: button.href(),
              features: [field.columnWidth(200), field.title('id')]
          }),
          button({
              title: '%refCount%',
              action: menu.openContextMenu({
                menu: menu.menu({
                  options: [studio.gotoReferencesOptions('%id%', studio.references('%id%'))]
                })
              }),
              style: button.href(),
              features: field.title('refCount')
          }),
          text({
            text: '%type%',
            features: field.title('type')
          }),
          text({
            text: pipeline('%file%', split({separator: '/', part: 'last'})),
            features: field.title('file')
          }),
          text({
            text: pipeline('%implType%', data.if('%% = \"function\"', 'javascript', '')),
            features: field.title('impl')
          }),
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
          itemlist.infiniteScroll(),
          itemlist.keyboardSelection({onEnter: studio.gotoPath('%id%')}),
          css.boxShadow({shadowColor: '#cccccc'}),
          css.padding({top: '4', right: '5'}),
          css.height({height: '600', overflow: 'auto', minMax: 'max'}),
          css.width({width: '400', minMax: 'min'})
      ]
    }),
})

jb.component('studio.searchComponent', {
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
        style: editableText.mdcSearch(),
        features: [
          editableText.helperPopup({
            control: studio.searchList(),
            popupId: 'search-component',
            popupStyle: styleWithFeatures(
              dialog.popup(),
              dialogFeature.nearLauncherPosition({offsetTop: 50})
            )
          }),
          css.margin({top: '-30', left: '10'}),
          css('~ input {border: 0 } {height: 35px; background: white !important;}'),
          css(''),
          css('~ i { top: 40px !important; right: 0px !important}')
        ]
      })
    ],
    features: [group.itemlistContainer({})]
  })
})
