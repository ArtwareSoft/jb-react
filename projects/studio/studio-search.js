component('studio.searchList', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: table({
    items: pipeline(
      tgp.allComps(),
      itemlistContainer.filter(),
      tgp.componentStatistics('%%')
    ),
    controls: [
      control.icon({
        icon: tgp.iconOfType('%type%'),
        features: [
          css.opacity('0.3'),
          css.padding({top: '5', left: '5'})
        ]
      }),
      button({
        title: pipeline(
          text.highlight(
              '%id%',
              '%$itemlistCntrData/search_pattern%',
              'var(--vscode-editor-findMatchHighlightBackground)'
            )
        ),
        action: runActions(writeValue('%$studio/circuit%', '%id%'), dialog.closeDialog()),
        style: button.href(),
        features: [field.columnWidth(200), field.title('id')]
      }),
      button({
        title: '%refCount%',
        action: menu.openContextMenu({
          menu: menu.menu({
            options: [studio.gotoReferencesOptions('%id%', tgp.references('%id%'))]
          })
        }),
        style: button.href(),
        features: field.title('refCount')
      }),
      text({text: '%type%', features: field.title('type')}),
      text({
        text: pipeline('%file%', split({separator: '/', part: 'last'})),
        features: field.title('file')
      }),
      text({
        text: pipeline('%implType%', data.if('%% = \"function\"', 'javascript', '')),
        features: field.title('impl')
      })
    ],
    visualSizeLimit: 30,
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
      css.width({width: '400', minMax: 'min'}),
      css.class('searchList'),
    ]
  })
})

component('studio.searchComponent', {
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
        style: editableText.mdcInput({}),
        features: [
          editableText.helperPopup({
            control: studio.searchList(),
            popupId: 'search-component',
            popupStyle: styleWithFeatures(
              dialog.popup(),
              dialogFeature.nearLauncherPosition()
            )
          }),
          css.height({height: '40', selector: '~ .mdc-text-field'})
        ]
      })
    ],
    features: [group.itemlistContainer({})]
  })
})
