component('studio.gotoProject', {
  type: 'action',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: runActions(winUtils.gotoUrl(ctx => jb.studio.host.projectUrlInStudio(ctx.exp('%$name%')), 'new tab'), dialog.closeDialog())
})

component('studio.chooseProject', {
  type: 'control',
  impl: group({
    title: 'itemlist-with-find',
    controls: [
      group({ controls: [itemlistContainer.search({ features: css.width('250') })], features: group.autoFocusOnFirstInput() }),
      itemlist({
        items: pipeline('%projects%', itemlistContainer.filter()),
        controls: button(text.highlight('%%', '%$itemlistCntrData/search_pattern%'), studio.gotoProject('%%'), {
          style: button.mdcChipAction(),
          features: css('{ text-align: left; width: 250px }')
        }),
        features: [
          itemlist.keyboardSelection({ autoFocus: true, onEnter: studio.gotoProject('%%') }),
          watchRef('%$itemlistCntrData/search_pattern%'),
          css.height('400', 'scroll')
        ]
      })
    ],
    features: [
      group.wait(http.get('/?op=projects', 'true')),
      css.padding('15', '15'),
      group.itemlistContainer()
    ]
  })
})

component('studio.openProject', {
  type: 'action',
  impl: openDialog('Open project', studio.chooseProject(), { style: dialog.dialogOkCancel('OK', 'Cancel') })
})