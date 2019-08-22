
jb.component('studio.data-resources', { /* studio_dataResources */
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
  })
})

jb.component('studio.open-resource', { /* studio_openResource */
  type: 'action',
  params: [
    {id: 'resourceId', as: 'string'}
  ],
  impl: openDialog({
    style: dialog_editSourceStyle({id: 'edit-source', width: 600}),
    content: editableText({
      databind: (ctx,vars,{resourceId}) => jb.prettyPrint(jb.studio.previewjb.resources[resourceId]),
      style: editableText_studioCodemirrorTgp()
    }),
    title: studio_shortTitle('%$resourceId%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature_resizer(true)
    ]
  })
  // impl: openDialog({
  //   style: dialog_studioFloating({id: 'resource %$id%', width: 500}),
  //   content: tree({
  //     nodeModel: tree_jsonReadOnly('%$resource%', '%$id%'),
  //     features: [css_class('jb-control-tree'), tree_selection({}), tree_keyboardSelection({})]
  //   }),
  //   title: '%$id%'
  // })
})

jb.component('studio.data-resource-menu', { /* studio_dataResourceMenu */ 
  type: 'menu.option',
  impl: menu_menu({
    title: 'Data',
    options: [
      dynamicControls({
        controlItems: ctx => Object.keys(jb.studio.previewjb.resources),
        genericControl: menu_action({
          title: '%$controlItem%',
          action: studio_openResource('%$controlItem%')
        })
      })
    ]
  })
})

