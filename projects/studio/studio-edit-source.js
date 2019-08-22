(function() {
const st = jb.studio;

jb.component('studio.open-editor',  /* studio_openEditor */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    path && fetch(`/?op=gotoSource&comp=${path.split('~')[0]}`)
  }
})

jb.component('studio.edit-source',  /* studio_editSource */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio_currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog_editSourceStyle({id: 'edit-source', width: 600}),
    content: editableText({
      databind: studio_profileAsText('%$path%'),
      style: editableText_studioCodemirrorTgp()
    }),
    title: studio_shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature_resizer(true)
    ]
  })
})

jb.component('studio.edit-as-macro',  /* studio_editAsMacro */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio_currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog_editSourceStyle({id: 'edit-source', width: 600}),
    content: editableText({
      databind: studio_profileAsMacroText('%$path%'),
      style: editableText_studioCodemirrorTgp()
    }),
    title: studio_shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature_resizer(true)
    ]
  })
})

jb.component('studio.goto-editor-secondary',  /* studio_gotoEditorSecondary */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_action({
    vars: [Var('baseComp', split({separator: '~', text: '%$path%', part: 'first'}))],
    title: 'Goto editor: %$baseComp%',
    action: studio_openEditor('%$baseComp%'),
    showCondition: notEquals(studio_compName('%$path%'), '%$baseComp%')
  })
})

jb.component('studio.goto-editor-first',  /* studio_gotoEditorFirst */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_action({
    title: pipeline(studio_compName('%$path%'), 'Goto editor: %%'),
    action: studio_openEditor(studio_compName('%$path%')),
    shortcut: 'Alt+E',
    showCondition: notEmpty(studio_compName('%$path%'))
  })
})

jb.component('studio.goto-editor-options',  /* studio_gotoEditorOptions */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_endWithSeparator(
    [studio_gotoEditorFirst('%$path%'), studio_gotoEditorSecondary('%$path%')]
  )
})

})()
