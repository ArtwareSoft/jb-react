jb.component('studio.goto-project', { /* studio_gotoProject */
  type: 'action',
  impl: runActions(
    gotoUrl('/project/studio/%%', 'new tab'),
    dialog_closeContainingPopup()
  )
})

jb.component('studio.choose-project', { /* studio_chooseProject */
  type: 'control',
  impl: group({
    title: 'itemlist-with-find',
    controls: [
      itemlistContainer_search({features: css_width('250')}),
      itemlist({
        items: pipeline('%projects%', itemlistContainer_filter()),
        controls: button({
          title: highlight('%%', '%$itemlistCntrData/search_pattern%'),
          action: studio_gotoProject(),
          style: button_mdlFlatRipple(),
          features: css('{ text-align: left; width: 250px }')
        }),
        features: [
          itemlist_selection({}),
          itemlist_keyboardSelection({autoFocus: true, onEnter: studio_gotoProject()}),
          watchRef('%$itemlistCntrData/search_pattern%'),
          css_height({height: '400', overflow: 'scroll'})
        ]
      })
    ],
    features: [
      group_wait({for: http_get('/?op=projects', 'true')}),
      css_padding({top: '15', left: '15'}),
      group_itemlistContainer({})
    ]
  })
})

jb.component('studio.open-project', { /* studio_openProject */ 
  type: 'action',
  impl: openDialog({
    style: dialog_dialogOkCancel('OK', 'Cancel'),
    content: studio_chooseProject(),
    title: 'Open project'
  })
})