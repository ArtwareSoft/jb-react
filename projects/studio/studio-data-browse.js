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
        [constOrMutable+'Data'] : (new jb.studio.previewjb.jbCtx).run({$:'object'})
      })
    ],
    modal: true,
    features: [variable({name: 'name', mutable: true}), dialogFeature_autoFocusOnFirstInput()]
  })
})

jb.component('studio.open-resource', { /* studio_openResource */
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'},
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'edit-data', width: 600}),
    content: editableText({
      databind: studio.profileAsMacroText('%$path%'),
      style: editableText.studioCodemirrorTgp()
    }),
    title: 'Edit %$name%',
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
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
          .filter(e=>e[1].mutableData !== undefined || e[1].constData !== undefined)
            .map(e=>({
              name: e[0],
              path: `${e[0]}~${e[1].mutableData ? 'mutable' : 'const'}Data`
            })),
          genericControl: menu.action({
            title: '%$controlItem/name%',
            action: studio.openResource('%$controlItem/path%','%$controlItem/name%')
          })
        })
      }),
      menu.action({title: 'new mutable', action: studio.openNewResource('mutable')}),
      menu.action({title: 'new const', action: studio.openNewResource('const')}),
    ]
  })
})



