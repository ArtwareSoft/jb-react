jb.component('studio.watchable-or-passive', { /* studio.watchableOrPassive */
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => path.match(/~watchable/) ? 'Watchable' : 'Passive'
})

jb.component('studio.open-resource', { /* studio.openResource */
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'}
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'edit-data', width: 600}),
    content: editableText({
      databind: studio.profileAsText('%$path%'),
      style: editableText.studioCodemirrorTgp()
    }),
    title: pipeline(studio.watchableOrPassive('%$path%'), 'Edit %$name% (%%)'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

jb.component('studio.open-new-resource', { /* studio.openNewResource */
  params: [
    {id: 'watchableOrPassive', as: 'string'}
  ],
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: group({
      style: group.div(),
      controls: [
        editableText({
          title: 'resource name',
          databind: '%$name%',
          style: editableText.mdlInput(),
          features: feature.onEnter(dialog.closeContainingPopup())
        })
      ],
      features: css.padding({top: '14', left: '11'})
    }),
    title: 'New %$watchableOrPassive% Data Source',
    onOK: [
      (ctx,{name},{watchableOrPassive}) => jb.studio.previewjb. component(jb.tostring(name), {
        [watchableOrPassive+'Data'] : (new jb.studio.previewjb.jbCtx).run({$:'object'})
      }),
      studio.openResource('%$name%~%$watchableOrPassive%Data', '%$name%')
    ],
    modal: true,
    features: [
      variable({name: 'name', watchable: true}),
      dialogFeature.autoFocusOnFirstInput()
    ]
  })
})

jb.component('studio.data-resource-menu', { /* studio.dataResourceMenu */ 
  type: 'menu.option',
  impl: menu.menu({
    title: 'Data',
    options: [
      menu.endWithSeparator({
        options: dynamicControls({
          controlItems: ctx => jb.entries(jb.studio.previewjb.comps)
          .filter(e=>! jb.comps[e[0]])
          .filter(e=>e[1].watchableData !== undefined || e[1].passiveData !== undefined)
            .map(e=> {
              const watchableOrPassive = e[1].watchableData ? 'watchable' : 'passive'
              const upper = watchableOrPassive.charAt(0).toUpperCase() + watchableOrPassive.slice(1)
              return {
                name: `${e[0]} (${upper})`,
                path: `${e[0]}~${watchableOrPassive}Data`
              }
            }
            ),
          genericControl: menu.action({
            title: '%$controlItem/name%',
            action: studio.openResource('%$controlItem/path%', '%$controlItem/name%')
          })
        })
      }),
      menu.action({
        title: 'New Watchable',
        action: studio.openNewResource('watchable')
      }),
      menu.action({title: 'New Passive', action: studio.openNewResource('passive')})
    ]
  })
})



