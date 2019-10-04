(function() {
const st = jb.studio;

jb.component('source-editor.refresh-editor', { /* sourceEditor.refreshEditor */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>  ctx.vars.refreshEditor && ctx.vars.refreshEditor(path)
})

jb.component('source-editor.prop-options', { /* sourceEditor.propOptions */
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>  {
    const val = st.val(path) || {}
    return st.paramsOfPath(path).filter(p=> val[p.id] === undefined)
      .map(param=> Object.assign(param,{ text: param.id }))
  }
})

jb.component('source-editor.store-to-ref', { /* sourceEditor.storeToRef */
  type: 'action',
  impl: ctx => ctx.vars.editor && ctx.vars.editor() && ctx.vars.editor().storeToRef()
})

jb.component('source-editor.first-param-as-array-path', { /* sourceEditor.firstParamAsArrayPath */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const params = st.paramsOfPath(path)
    const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
    return firstParamIsArray ? path + '~' + params[0].id : path
  }
})

jb.component('studio.open-editor', { /* studio.openEditor */
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
      cm_settings: {
        extraKeys: {
          Enter: action.if(
            textEditor.isDirty(),
            runActions(sourceEditor.storeToRef(), sourceEditor.refreshEditor()),
            textEditor.withCursorPath(studio.openEditProperty('%$cursorPath%'))
          )
        }
      }
    }),
    features: [
      ctx => ({
        init: cmp => ctx.vars.$dialog.refresh = () => cmp.refresh && cmp.refresh()
      }),
      feature.onKey('Ctrl-I', studio.openJbEditor('%$path%')),
      textEditor.init()
    ]
  })
})


jb.component('studio.edit-source', { /* studio.editSource */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'editor', width: 600}),
    content: studio.editableSource('%$path%'),
    title: studio.shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

jb.component('studio.edit-all-files', { /* studio.editAllFiles */
  type: 'action',
  params: [
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: openDialog({
    style: dialog.editSourceStyle({id: 'editor', width: 600}),
    content: group({
      title: 'project files',
      controls: [
        picklist({
          databind: '%$file%',
          options: picklist.codedOptions({
            options: sourceEditor.filesOfProject(),
            code: '%%',
            text: suffix('/')
          }),
          style: styleByControl(
            itemlist({
              items: '%$picklistModel/options%',
              controls: label({
                title: '%text%',
                style: label.mdlRippleEffect(),
                features: [css.width('%$width%'), css('{text-align: left}')]
              }),
              style: itemlist.horizontal('5'),
              features: itemlist.selection({
                onSelection: writeValue('%$picklistModel/databind%', '%code%')
              })
            }),
            'picklistModel'
          )
        }),
        editableText({
          databind: pipe(
            ctx => { const host = jb.studio.host; return host.getFile(host.locationToPath(jb.tostring(ctx.exp('%$file%')))) }
            ,studio.fileAfterChanges('%$file%', '%%')),
          style: editableText.studioCodemirrorTgp(),
          features: [
            ctx => ({ init: cmp => ctx.vars.$dialog.refresh = () => cmp.refresh && cmp.refresh() }),
            watchRef('%$file%')
          ]
        })
      ],
      features: variable({
        name: 'file',
        value: pipeline(sourceEditor.filesOfProject(), first()),
        watchable: true
      })
    }),
    title: studio.shortTitle('%$path%'),
    features: [
      css('.jb-dialog-content-parent {overflow-y: hidden}'),
      dialogFeature.resizer(true)
    ]
  })
})

jb.component('studio.goto-editor-secondary', { /* studio.gotoEditorSecondary */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.action({
    vars: [Var('baseComp', split({separator: '~', text: '%$path%', part: 'first'}))],
    title: 'Goto editor: %$baseComp%',
    action: studio.openEditor('%$baseComp%'),
    showCondition: notEquals(studio.compName('%$path%'), '%$baseComp%')
  })
})

jb.component('studio.goto-editor-first', { /* studio.gotoEditorFirst */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.action({
    title: pipeline(studio.compName('%$path%'), 'Goto editor: %%'),
    action: studio.openEditor(studio.compName('%$path%')),
    shortcut: 'Alt+E',
    showCondition: notEmpty(studio.compName('%$path%'))
  })
})

jb.component('studio.goto-editor-options', { /* studio.gotoEditorOptions */
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.endWithSeparator(
    [studio.gotoEditorFirst('%$path%'), studio.gotoEditorSecondary('%$path%')]
  )
})

jb.component('studio.open-edit-property', { /* studio.openEditProperty */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch(
    Var('pathType', split({separator: '~!', text: '%$path%', part: 'last'})),
    Var('actualPath', split({separator: '~!', text: '%$path%', part: 'first'})),
    Var('parentPath', studio.parentPath('%$actualPath%')),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    [
      action.switchCase(
        or(
          startsWith('obj-separator', '%$pathType%'),
          inGroup(
              list('close-profile', 'open-profile', 'open-by-value', 'close-by-value'),
              '%$pathType%'
            )
        ),
        openDialog({
          style: dialog.studioJbEditorPopup(),
          content: sourceEditor.addProp('%$actualPath%'),
          features: [
            studio.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(sourceEditor.refreshEditor())
          ]
        })
      ),
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
      action.switchCase(
        studio.isOfType('%$actualPath%', 'data,boolean'),
        runActions(
          Var('sugarArrayPath', sourceEditor.firstParamAsArrayPath('%$actualPath%')),
          Var(
              'index',
              data.switch(
                [
                  data.case(equals('open-sugar', '%$pathType%'), 0),
                  data.case(
                    equals('close-sugar', '%$pathType%'),
                    count(studio.val('%$sugarArrayPath%'))
                  )
                ]
              )
            ),
          Var(
              'actualPathHere',
              data.if(
                endsWith('-sugar', '%$pathType%'),
                '%$sugarArrayPath%~%$index%',
                '%$actualPath%'
              )
            ),
          action.if(
              endsWith('-sugar', '%$pathType%'),
              studio.addArrayItem({path: '%$sugarArrayPath%', toAdd: '', index: '%$index%'})
            ),
          openDialog({
              style: dialog.studioJbEditorPopup(),
              content: studio.jbFloatingInput('%$actualPathHere%'),
              features: [
                dialogFeature.autoFocusOnFirstInput(),
                studio.nearLauncherPosition(),
                dialogFeature.onClose(
                  runActions(
                    toggleBooleanValue('%$studio/jb_preview_result_counter%'),
                    sourceEditor.refreshEditor()
                  )
                )
              ]
            })
        )
      ),
      action.switchCase(
        Var('ptsOfType', studio.PTsOfType(studio.paramType('%$actualPath%'))),
        '%$ptsOfType/length% == 1',
        runActions(
          studio.setComp('%$path%', '%$ptsOfType[0]%'),
          sourceEditor.refreshEditor()
        )
      ),
      action.switchCase(
        and(startsWith('open', '%$pathType%'), studio.isArrayType('%$actualPath%')),
        studio.openNewProfileDialog({
          path: '%$actualPath%',
          type: studio.paramType('%$actualPath%'),
          index: 0,
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~0')
        })
      ),
      action.switchCase(
        and(startsWith('close', '%$pathType%'), studio.isArrayType('%$actualPath%')),
        studio.openNewProfileDialog({
          vars: [Var('length', count(studio.val('%$actualPath%')))],
          path: '%$actualPath%',
          type: studio.paramType('%$actualPath%'),
          index: '%$length%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$actualPath%~%$length%')
        })
      ),
      action.switchCase(
        and(
          startsWith('array-separator', '%$pathType%'),
          studio.isArrayType('%$actualPath%')
        ),
        studio.openNewProfileDialog({
          vars: [
            Var('index', (ctx,{actualPath}) => +actualPath.split('~').pop()+1),
            Var('nextSiblingPath', pipeline(list('%$actualPath%', '%$index%'), join('~')))
          ],
          path: '%$actualPath%',
          type: studio.paramType('%$actualPath%'),
          index: '%$index%',
          mode: 'insert',
          onClose: sourceEditor.refreshEditor('%$nextSiblingPath%')
        })
      )
    ],
    studio.openNewProfileDialog({
      path: '%$actualPath%',
      type: studio.paramType('%$actualPath%'),
      mode: 'update',
      onClose: sourceEditor.refreshEditor('%$actualPath%')
    })
  )
})

jb.component('source-editor.suggestions', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: If(
    Var('pathType', split({separator: '~!', text: '%$path%', part: 'last'})),
    Var('actualPath', split({separator: '~!', text: '%$path%', part: 'first'})),
    Var('paramDef', studio.paramDef('%$actualPath%')),
    or(
      startsWith('obj-separator', '%$pathType%'),
      inGroup( list('close-profile', 'open-profile', 'open-by-value', 'close-by-value'), '%$pathType%')
    ),
      pipeline(studio.paramsOfPath('%$actualPath%'),'%id%'),
      If(
        '%$paramDef/options%',
        split({separator: ',', text: '%$paramDef/options%', part: 'all'}),
        studio.PTsOfType('%$actualPath%')
      )
    )
})

jb.component('source-editor.add-prop', { /* sourceEditor.addProp */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      editableText({
        title: pipeline(studio.compName('%$path%'), '%% properties'),
        databind: '%$suggestionData/text%',
        style: editableText.floatingInput(),
        features: [
          feature.onKey(
            'Enter',
            runActions(
              dialog.closeDialog('studio-jb-editor-popup'),
              studio.openEditProperty('%$path%~%$suggestionData/selected/id%'),
              true
            )
          ),
          editableText.helperPopup({
            control: sourceEditor.suggestionsItemlist('%$path%'),
            popupId: 'suggestions',
            popupStyle: dialog.popup(),
            showHelper: true,
            autoOpen: true,
            onEsc: [dialog.closeDialog('studio-jb-editor-popup'), tree.regainFocus()]
          })
        ]
      }),
      label({title: '', features: css('{border: 1px solid white;}')})
    ],
    features: [
      variable({
        name: 'suggestionData',
        value: {'$': 'object', selected: '', text: ''}
      }),
      css.padding({left: '4', right: '4'}),
      css.margin({top: '-20', selector: '>*:last-child'})
    ]
  })
})

jb.component('source-editor.suggestions-itemlist', { /* sourceEditor.suggestionsItemlist */
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
    items: sourceEditor.propOptions('%$path%'),
    controls: label({title: '%text%', features: [css.padding({left: '3', right: '2'})]}),
    features: [
      id('suggestions-itemlist'),
      itemlist.noContainer(),
      itemlist.selection({
        databind: '%$suggestionData/selected%',
        autoSelectFirst: true
      }),
      itemlist.keyboardSelection(false),
      css.height({height: '500', overflow: 'auto', minMax: 'max'}),
      css.width({width: '300', overflow: 'auto', minMax: 'min'}),
      css('{ position: absolute; z-index:1000; background: white }'),
      css.border({width: '1', color: '#cdcdcd'}),
      css.padding({top: '2', left: '3', selector: 'li'})
    ]
  })
})

jb.component('source-editor.files-of-project', {
  impl: ctx => {
    const _jb = jb.studio.previewjb
    return jb.unique(jb.entries(_jb.comps).map(e=>e[1][_jb.location][0]).filter(x=>x.indexOf('/' + ctx.exp('%$studio/project%') + '/') != -1))
  }
})

})()
