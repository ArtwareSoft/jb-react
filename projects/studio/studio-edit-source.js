(function() {
const st = jb.studio;

jb.component('sourceEditor.open-editor', {
})

jb.component('studio.open-editor', { /* studio_openEditor */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    path && fetch(`/?op=gotoSource&comp=${path.split('~')[0]}`)
  }
})

jb.component('studio.edit-source', { /* studio_editSource */
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

jb.component('studio.edit-as-macro', { /* studio_editAsMacro */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio_currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog_editSourceStyle({id: 'edit-source', width: 600}),
    content: editableText({
      databind: studio_profileAsMacroText('%$path%'),
      style: editableText_studioCodemirrorTgp(),
      //features: textEditor.watchSourceChanges(),
    }),
    title: studio_shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature_resizer(true)
    ]
  })
})

jb.component('studio.goto-editor-secondary', { /* studio_gotoEditorSecondary */
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

jb.component('studio.goto-editor-first', { /* studio_gotoEditorFirst */
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

jb.component('studio.goto-editor-options', { /* studio_gotoEditorOptions */ 
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_endWithSeparator(
    [studio_gotoEditorFirst('%$path%'), studio_gotoEditorSecondary('%$path%')]
  )
})

jb.component('studio.open-edit-property', { /* studio_openEditProperty */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch(
    Var('actualPath', studio.jbEditorPathForEdit('%$path%')),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    [
      action.switchCase(endsWith('$vars', '%$path%')),
      action.switchCase(
        '%$paramDef/options%',
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: group({
            controls: [
              studio.jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature.onEsc(dialog.closeContainingPopup(true)),
              feature.onEnter(dialog.closeContainingPopup(true), sourceEditor.refreshAndRegainFocus())
            ]
          }),
          features: [dialogFeature.autoFocusOnFirstInput(), dialogFeature.onClose(sourceEditor.refreshAndRegainFocus())]
        })
      ),
      action.switchCase(
        studio.isOfType('%$actualPath%', 'data,boolean'),
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: studio.jbFloatingInput('%$actualPath%'),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(
              runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), sourceEditor.refreshAndRegainFocus())
            )
          ]
        })
      ),
      action.switchCase(
        Var('ptsOfType', studio.PTsOfType(studio.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        runActions(studio.setComp('%$path%', '%$ptsOfType[0]%'),sourceEditor.refreshAndRegainFocus())
      )
    ],
    studio.openNewProfileDialog({
      path: '%$actualPath%',
      type: studio.paramType('%$actualPath%'),
      mode: 'update',
      onClose: sourceEditor.refreshAndRegainFocus()
    })
  )
})


})()
