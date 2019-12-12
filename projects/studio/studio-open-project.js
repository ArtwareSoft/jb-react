jb.component('studio.goto-project', { /* studio.gotoProject */
  type: 'action',
  params: [
    {id: 'name', as: 'string'},
  ],
  impl: runActions(
    gotoUrl(ctx => jb.studio.host.projectUrlInStudio(ctx.exp('%$name%')), 'new tab'),
    dialog.closeContainingPopup()
  )
})

jb.component('studio.choose-project', { /* studio.chooseProject */
  type: 'control',
  impl: group({
    title: 'itemlist-with-find',
    controls: [
      group({
        controls: [
          itemlistContainer.search({features: css.width('250')})
        ],
        features: group.autoFocusOnFirstInput()
      }),
      itemlist({
        items: pipeline('%projects%', itemlistContainer.filter()),
        controls: button({
          title: label.highlight('%%', '%$itemlistCntrData/search_pattern%'),
          action: studio.gotoProject('%%'),
          style: button.mdlFlatRipple(),
          features: css('{ text-align: left; width: 250px }')
        }),
        features: [
          itemlist.selection({}),
          itemlist.keyboardSelection({autoFocus: true, onEnter: studio.gotoProject('%%')}),
          watchRef('%$itemlistCntrData/search_pattern%'),
          css.height({height: '400', overflow: 'scroll'})
        ]
      })
    ],
    features: [
      group.wait({for: http.get('/?op=projects', 'true')}),
      css.padding({top: '15', left: '15'}),
      group.itemlistContainer({})
    ]
  })
})

jb.component('studio.open-project', { /* studio.openProject */
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel('OK', 'Cancel'),
    content: studio.chooseProject(),
    title: 'Open project'
  })
})