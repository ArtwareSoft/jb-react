(function() {
const st = jb.studio;

jb.component('source-editor.refresh-editor', {
  type: 'action',
  params: [ {id: 'path', as: 'string'} ],
  impl: (ctx,path) =>  ctx.vars.refreshEditor && ctx.vars.refreshEditor(path)
})

jb.component('source-editor.prop-options', {
  params: [ {id: 'path', as: 'string'} ],
  impl: (ctx,path) =>  {
    const val = st.val(path) || {}
    return st.paramsOfPath(path).filter(p=> val[p.id] === undefined)
      .map(param=> Object.assign(param,{ text: param.id }))
  }
})

jb.component('source-editor.store-to-ref', {
  type: 'action',
  impl: ctx => ctx.vars.editor && ctx.vars.editor() && ctx.vars.editor().storeToRef()
})

jb.component('source-editor.first-param-as-array-path', {
  type: 'action',
  params: [ {id: 'path', as: 'string'} ],
  impl: (ctx,path) => {
    const params = st.paramsOfPath(path)
    const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
    return firstParamIsArray ? path + '~' + params[0].id : path
  }
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
      style: editableText.codemirror({
        cm_settings: { extraKeys: {
          'Enter': action.if(textEditor.isDirty(), runActions(sourceEditor.storeToRef(), sourceEditor.refreshEditor()), 
            textEditor.withCursorPath(studio.openEditProperty('%$cursorPath%')))
        }}
      }),
      features: [
        feature.onKey('Ctrl-I',studio.openJbEditor('%$path%')),
        textEditor.init(),
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
    Var('pathType', split({text: '%$path%', separator: '~!', part: 'last'})),
    Var('actualPath', split({text: '%$path%', separator: '~!', part: 'first'})), 
    Var('parentPath', studio.parentPath('%$actualPath%')),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    [
      action.switchCase( or(
          startsWith('obj-separator','%$pathType%'),
          inGroup(list('close-profile','open-profile','open-by-value','close-by-value'),'%$pathType%')
        ), 
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: sourceEditor.addProp('%$actualPath%'),
          features: [
            studio.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput(), 
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
      })),
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
        runActions(
          Var('sugarArrayPath', sourceEditor.firstParamAsArrayPath('%$actualPath%')), 
          Var('index', data.switch({cases:[
            data.case(equals('open-sugar','%$pathType%'), 0),
            data.case(equals('close-sugar','%$pathType%'), count(studio.val('%$sugarArrayPath%')))
          ]})),
          Var('actualPathHere',data.if(endsWith('-sugar','%$pathType%'), '%$sugarArrayPath%~%$index%','%$actualPath%')),
          action.if(endsWith('-sugar','%$pathType%'), studio.addArrayItem({path: '%$sugarArrayPath%', index: '%$index%', toAdd: ''})),
          // action.if(equals('open-sugar','%$pathType%'), studio.addArrayItem({path: '%$sugarArrayPath%', index: 0, toAdd: ''})),
          // action.if(equals('close-sugar','%$pathType%'), studio.addArrayItem({path: '%$sugarArrayPath%', toAdd: ''})),
          openDialog({
            style: dialog.studioJbEditorPopup(),
            content: studio.jbFloatingInput('%$actualPathHere%'),
            features: [
              dialogFeature.autoFocusOnFirstInput(),
              studio.nearLauncherPosition(),
              dialogFeature.onClose(
                runActions(toggleBooleanValue('%$studio/jb_preview_result_counter%'), sourceEditor.refreshEditor())
              )
            ]
          })
      )),
      action.switchCase(
        Var('ptsOfType', studio.PTsOfType(studio.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        runActions(studio.setComp('%$path%', '%$ptsOfType[0]%'),sourceEditor.refreshEditor())
      ),
      action.switchCase(and(startsWith('open','%$pathType%'), studio.isArrayType('%$actualPath%')),
          studio.openNewProfileDialog({
            path: '%$actualPath%',
            type: studio.paramType('%$actualPath%'),
            index: 0,
            mode: 'insert',
            onClose: sourceEditor.refreshEditor('%$actualPath%~0')
          })
      ),
      action.switchCase(and(startsWith('close','%$pathType%'), studio.isArrayType('%$actualPath%')),
          studio.openNewProfileDialog({
            vars: Var('length', count(studio.val('%$actualPath%'))),
            path: '%$actualPath%',
            type: studio.paramType('%$actualPath%'),
            index: '%$length%',
            mode: 'insert',
            onClose: sourceEditor.refreshEditor('%$actualPath%~%$length%')
          })
      ),
      action.switchCase(and(startsWith('array-separator','%$pathType%'), studio.isArrayType('%$actualPath%')),
          studio.openNewProfileDialog({
            vars: [
              Var('index', (ctx,{actualPath}) => +actualPath.split('~').pop()+1),
              Var('nextSiblingPath',pipeline(list('%$actualPath%','%$index%'),join('~'))),
            ],            
            path: '%$actualPath%',
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

jb.component('source-editor.add-prop', {
  type: 'control',
  params: [ {id: 'path', as: 'string'} ],
  impl: group({
    controls: [
      editableText({
        title: pipeline(studio.compName('%$path%'), '%% properties'),
        databind: '%$suggestionData/text%',
        style: editableText.floatingInput(),
        features: [
          feature.onKey('Enter', runActions(
            dialog.closeDialog('studio-jb-editor-popup'),
            studio.openEditProperty('%$path%~%$suggestionData/selected/id%'),true)
          ),
          editableText.helperPopup({
            control: sourceEditor.suggestionsItemlist('%$path%'),
            popupId: 'suggestions',
            popupStyle: dialog.popup(),
            showHelper: true,
            autoOpen: true,
            // onEnter: [dialog.closeDialog('studio-jb-editor-popup'), tree.regainFocus()],
            onEsc: [dialog.closeDialog('studio-jb-editor-popup'), tree.regainFocus()]
          })
        ]
      }),
      label({title: '', features: css('{border: 1px solid white;}')})
    ],
    features: [
      variable({
        name: 'suggestionData',
        value: {$: 'object', selected: '', text: '' },
      }),
      css.padding({left: '4', right: '4'}),
      css.margin({top: '-20', selector: '>*:last-child'})
    ]
  })
})

jb.component('source-editor.suggestions-itemlist', { /* sourceEditor.suggestionsItemlist */
  params: [ {id: 'path', as: 'string'}],
  impl: itemlist({
    items: sourceEditor.propOptions('%$path%'),
    controls: label({title: '%text%', features: [css.padding({left: '3', right: '2'})]}),
    features: [
      id('suggestions-itemlist'),
      itemlist.noContainer(),
      itemlist.selection({
        databind: '%$suggestionData/selected%',
//        onDoubleClick: studio.pasteSuggestion(),
        autoSelectFirst: true
      }),
      itemlist.keyboardSelection({autoFocus: false}),
      css.height({height: '500', overflow: 'auto', minMax: 'max'}),
      css.width({width: '300', overflow: 'auto', minMax: 'min'}),
      css('{ position: absolute; z-index:1000; background: white }'),
      css.border({width: '1', color: '#cdcdcd'}),
      css.padding({top: '2', left: '3', selector: 'li'}),
    ]
  })
})


})()
