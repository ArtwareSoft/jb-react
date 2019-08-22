
jb.component('studio.data-resources',  /* studio_dataResources */ {
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: '%$samples%',
        controls: [
          button({title: '%%', style: button_mdlFlatRipple()})
        ],
        style: itemlist_ulLi(),
        watchItems: true,
        itemVariable: 'item'
      }),
      button({title: 'add resource', style: button_mdlIcon('add')}),
      group({
        style: group_section(),
        controls: [
          itemlist({
            items: list('1', '2', '3'),
            style: itemlist_ulLi(),
            watchItems: true,
            itemVariable: 'item'
          })
        ],
        features: variable({name: 'selected_in_itemlist', mutable: true})
      })
    ],
    features: group_wait({
      for: {
        $: 'level-up.entries',
        db: {$: 'level-up.file-db', rootDirectory: '/projects/data-tests/samples'}
      }
    })
  })
})

jb.component('studio.open-resource',  /* studio_openResource */ {
  type: 'action',
  params: [
    {id: 'resource', type: 'data'},
    {id: 'id', as: 'string'}
  ],
  impl: openDialog({
    style: dialog_studioFloating({id: 'resource %$id%', width: 500}),
    content: tree({
      nodeModel: tree_jsonReadOnly('%$resource%', '%$id%'),
      features: [css_class('jb-control-tree'), tree_selection({}), tree_keyboardSelection({})]
    }),
    title: '%$id%'
  })
})

jb.component('studio.data-resource-menu',  /* studio_dataResourceMenu */ {
  type: 'menu.option',
  impl: menu_menu({
    title: 'Data',
    options: [
      dynamicControls({
        controlItems: pipeline(ctx => jb.studio.previewjb.resources, keys('%%'), filter(notContains(':', '%%'))),
        genericControl: menu_action({
          title: '%$controlItem%',
          action: studio_openResource(
            function (ctx) {
                     return jb.path(jb, ['previewWindow', 'jbart_widgets', ctx.exp('%$studio/project%'), 'resources', ctx.exp('%$controlItem%')]);
                },
            '%$controlItem%'
          )
        })
      })
    ]
  })
})

