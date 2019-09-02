(function() {
const st = jb.studio;

jb.component('source-editor.refresh-editor', {
  type: 'action',
  params: [ {id: 'path', as: 'string'} ],
  impl: (ctx,path) =>  ctx.vars.editor.refreshEditor && ctx.vars.editor.refreshEditor(path)
})

jb.component('source-editor.refresh-from-data-ref', {
  type: 'action',
  params: [ {id: 'path', as: 'string'} ],
  impl: (ctx,path) =>  ctx.vars.editor && ctx.vars.editor.refreshFromDataRef()
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

jb.component('studio.editable-source', { /* studio.editableSource */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableText({
      databind: studio.profileAsText('%$path%'),
      style: editableText.codemirror(),
      features: [
        feature.onKey('Enter', sourceEditor.refreshEditor()),
        feature.onKey('Ctrl-Enter', textEditor.withCursorPath(studio.openEditProperty('%$cursorPath[0]%'))),
        textEditor.init(),
        ctx => ({
            extendCtxOnce: (ctx,cmp) => ctx.setVars({
                refreshEditor: path => jb.textEditor.refreshEditor(cmp,path)
              })
          }),
      ]
  })
})


jb.component('studio.edit-source', { /* studio_editSource */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio_currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'edit-source', width: 600}),
    content: studio.editableSource('%$path%'),
    title: studio_shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
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

jb.component('studio.open-edit-property', { /* studio.openEditProperty */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch(
    Var('actualPath', split({text: '%$path%', separator: '~!', part: 'first'})),
    Var('parentPath', studio.parentPath('%$actualPath%')),
    Var('pathType', split({text: '%$path%', separator: '~!', part: 'last'})),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    [
      action.switchCase(endsWith('$vars', '%$path%')),
      action.switchCase( '%$paramDef/options%',
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: group({
            controls: [
              studio.jbFloatingInputRich('%$actualPath%')
            ],
            features: [
              feature.onEsc(dialog.closeContainingPopup(true)),
              feature.onEnter(dialog.closeContainingPopup(true), sourceEditor.refreshEditor())
            ]
          }),
          features: [
            studio.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput(), 
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
        })
      ),
      action.switchCase(studio.isOfType('%$actualPath%', 'data,boolean'),
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: studio.jbFloatingInput('%$actualPath%'),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            studio.nearLauncherPosition(),
            dialogFeature.onClose(
              runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), sourceEditor.refreshEditor())
            )
          ]
        })
      ),
      action.switchCase(
        Var('ptsOfType', studio.PTsOfType(studio.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        runActions(studio.setComp('%$path%', '%$ptsOfType[0]%'),sourceEditor.refreshEditor())
      ),
      action.switchCase(and(equals('%$pathType%','open'), studio.isArrayType('%$actualPath%')),
          studio.openNewProfileDialog({
            path: '%$actualPath%',
            type: studio.paramType('%$actualPath%'),
            index: 0,
            mode: 'insert',
            onClose: sourceEditor.refreshEditor('%$actualPath%~0')
          })
      ),
      action.switchCase(and(equals('%$pathType%','close'), studio.isArrayType('%$parentPath%')),
          studio.openNewProfileDialog({
            vars: Var('length', count(studio.val('%$parentPath%'))),
            path: '%$parentPath%',
            type: studio.paramType('%$actualPath%'),
            index: '%$length%',
            mode: 'insert',
            onClose: sourceEditor.refreshEditor('%$actualPath%~%$length%')
          })
      ),
      action.switchCase(and(equals('%$pathType%','separator'), studio.isArrayType('%$parentPath%')),
          studio.openNewProfileDialog({
            vars: [
              Var('index', (ctx,{actualPath}) => +actualPath.split('~').pop()+1),
              Var('nextSiblingPath',pipeline(list('%$parentPath%','%$index%'),join())),
            ],            
            path: '%$parentPath%',
            type: studio.paramType('%$actualPath%'),
            index: '%$index%',
            mode: 'insert',
            onClose: sourceEditor.refreshEditor('%$nextSiblingPath%')
          })
      ),
    ],
    studio.openNewProfileDialog({
      path: '%$actualPath%',
      type: studio.paramType('%$actualPath%'),
      mode: 'update',
      onClose: sourceEditor.refreshEditor('%$actualPath%')
    })
  )
})


})()
