jb.component('studio.open-new-resource', { 
  params: [
    {id: 'constOrMutable', as: 'string' }
  ],
  type: 'action',
  impl: openDialog({
    style: dialog_dialogOkCancel(),
    content: group({
      style: group_div(),
      controls: [
        editableText({
          title: 'resource name',
          databind: '%$name%',
          style: editableText_mdlInput(),
          features: feature_onEnter(dialog_closeContainingPopup())
        })
      ],
      features: css_padding({top: '14', left: '11'})
    }),
    title: 'New %$constOrMutable%',
    onOK: [
      (ctx,{name},{constOrMutable}) => jb.studio.previewjb. component(jb.tostring(name), { 
        [constOrMutable+'Data'] : {}
      })
    ],
    modal: true,
    features: [variable({name: 'name', mutable: true}), dialogFeature_autoFocusOnFirstInput()]
  })
})

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
    {id: 'path', as: 'string'},
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'edit-data', width: 600}),
    content: editableText({
      databind: studio.profileAsMacroText('%$path%'),
      style: editableText.studioCodemirrorTgp()
    }),
    title: studio.shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
  // impl: openDialog({
  //   style: dialog_editSourceStyle({id: 'edit-source', width: 600}),
  //   content: editableText({
  //     databind: 
  //     (ctx,vars,{resourceId}) => jb.prettyPrint(jb.studio.previewjb.resources[resourceId]),
  //     style: editableText_studioCodemirrorTgp()
  //   }),
  //   title: studio_shortTitle('%$resourceId%'),
  //   features: [
  //     css('.jb-dialog-content-parent {overflow-y: hidden}'),
  //     dialogFeature_resizer(true)
  //   ]
  // })
})

jb.component('studio.data-resource-menu', { /* studio_dataResourceMenu */ 
  type: 'menu.option',
  impl: menu_menu({
    title: 'Data',
    options: [
      menu_endWithSeparator({
        options: dynamicControls({
          controlItems: ctx => jb.entries(jb.studio.previewjb.comps)
          .filter(e=>! jb.comps[e[0]])
          .filter(e=>e[1].mutableData || e[1].constData)
            .map(e=>({
              name: e[0],
              path: `${e[0]}~${e[1].mutableData ? 'mutable' : 'const'}Data`
            })),
          genericControl: menu.action({
            title: '%$controlItem/name%',
            action: studio.openResource('%$controlItem/path%')
          })
        })
      }),
      menu.action({title: 'new mutable', action: studio.openNewResource('mutable')}),
      menu.action({title: 'new const', action: studio.openNewResource('const')}),
    ]
  })
})



