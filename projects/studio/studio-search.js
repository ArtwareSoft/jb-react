component('studio.searchList', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: table({
    items: pipeline(tgp.allComps(), itemlistContainer.filter(), tgp.componentStatistics('%%')),
    controls: [
      control.icon(tgp.iconOfType('%type%'), {
        features: [css.opacity('0.3'), css.padding('5', '5')]
      }),
      button({
        title: pipeline(
          text.highlight({
            base: '%id%',
            highlight: '%$itemlistCntrData/search_pattern%',
            cssClass: 'var(--vscode-editor-findMatchHighlightBackground)'
          })
        ),
        action: runActions(writeValue('%$studio/circuit%', '%id%'), dialog.closeDialog()),
        style: button.href(),
        features: [
          field.columnWidth(200),
          field.title('id')
        ]
      }),
      button({
        title: '%refCount%',
        action: menu.openContextMenu(
          menu.menu({
            options: [
              studio.gotoReferencesOptions('%id%', { refs: tgp.references('%id%') })
            ]
          })
        ),
        style: button.href(),
        features: field.title('refCount')
      }),
      text('%type%', { features: field.title('type') }),
      text(pipeline('%file%', split('/', { part: 'last' })), { features: field.title('file') }),
      text(pipeline('%implType%', If('%% = "function"', 'javascript', '')), { features: field.title('impl') })
    ],
    visualSizeLimit: 30,
    features: [
      watchRef('%$itemlistCntrData/search_pattern%'),
      itemlist.selection('%$itemlistCntrData/selected%', '%%', {
        databindToSelected: '%%',
        cssForSelected: 'background: #bbb !important; color: #fff !important'
      }),
      itemlist.infiniteScroll(),
      itemlist.keyboardSelection({ onEnter: studio.gotoPath('%id%') }),
      css.boxShadow({ shadowColor: '#cccccc' }),
      css.padding('4', { right: '5' }),
      css.height('600', 'auto', { minMax: 'max' }),
      css.width('400', { minMax: 'min' }),
      css.class('searchList')
    ]
  })
})

component('studio.searchComponent', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      itemlistContainer.search('Search', {
        databind: '%$itemlistCntrData/search_pattern%',
        style: editableText.mdcInput(),
        features: [
          editableText.helperPopup(studio.searchList(), styleWithFeatures(dialog.popup(), { features: nearLauncherPosition() }), {
            popupId: 'search-component'
          }),
          css.height('40', { selector: '~ .mdc-text-field' })
        ]
      })
    ],
    title: 'itemlist-with-find',
    layout: layout.horizontal(''),
    features: [group.itemlistContainer()]
  })
})
