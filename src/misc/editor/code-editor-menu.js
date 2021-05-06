jb.component('codeEditor.selectPT', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string'},
  ],
  impl: menu.menu({
    options: menu.dynamicOptions(
      ({},{},{path}) => jb.studio.PTsOfPath(path).map(compName=> {
        var name = compName.substring(compName.indexOf('.')+1);
        var ns = compName.substring(0,compName.indexOf('.'));
        return jb.studio.compOption(path, compName, compName, ns ? `${name} (${ns})` : name, jb.studio.getComp(compName).description || '')
      }), 
      menu.action('%text% (%description%)', (ctx,{},{path, semanticPart}) => {
        const profile = jb.studio.valOfPath(path)
        const params = jb.path(jb.comps[(profile||{}).$],'params') || []
        const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
        const semanticIndex = semanticPart.match(/[0-9]+$/)
        if (firstParamIsArray)
          path = [path,params[0].id].join('~')
          if (Array.isArray(profile)) {
            const index = semanticPart == 'open-array' ? 0 : semanticIndex ? +semanticIndex[0]+1 : profile.length
            jb.studio.addArrayItem(path,{toAdd: {$: ctx.data.toPaste}, srcCtx: ctx, index})
          } else if (firstParamIsArray || semanticIndex) {
            const ar = profile[params[0].id]
            const lastIndex = Array.isArray(ar) ? ar.length : 1
            const index = ar == null ? undefined : semanticPart == 'open-array' ? 0 : semanticIndex ? +semanticIndex[0]+1 : lastIndex
            jb.studio.addArrayItem(path,{toAdd: {$: ctx.data.toPaste}, srcCtx: ctx, index})
          } else {
            jb.studio.setComp(path, ctx.data.toPaste, ctx) 
        }
      }
    ))
  })
})

jb.component('codeEditor.selectEnum', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
  ],
  impl: menu.menu({
    options: menu.dynamicOptions(
      ({},{},{path}) => jb.studio.paramDef(path).options.split(','), 
      menu.action('%%', (ctx,{},{path}) => jb.studio.writeValueOfPath(path,ctx.data,ctx)))
  })
})

jb.component('codeEditor.editMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
  ],
  impl: menu.menu(
    studio.shortTitle('%$path%'),
    [
      menu.action({
        title: 'Add variable',
        action: studio.addVariable('%$path%'),
        showCondition: endsWith('~$vars', '%$path%')
      }),
      menu.endWithSeparator(
        menu.dynamicOptions(
          studio.moreParams('%$path%'),
          menu.action(suffix('~'), runActions(studio.addProperty('%%'), studio.gotoPath('%%','value') ))
        )
      ),
      studio.styleEditorOptions('%$path%'),
      menu.endWithSeparator(
        [
          menu.action({
            vars: [Var('compName', studio.compName('%$path%'))],
            title: 'Goto %$compName%',
            action: studio.gotoPath('%$compName%','open'),
            showCondition: '%$compName%'
          }),
          menu.action({
            vars: [
              Var(
                'compName',
                split({
                  separator: '~',
                  text: '%$fromPath%',
                  part: 'first'
                })
              )
            ],
            title: 'Back to %$compName%',
            action: studio.openComponentInJbEditor('%$fromPath%', '%$path%'),
            showCondition: '%$fromPath%'
          })
        ]
      ),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'control',
        components: list('group')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'style',
        components: list('styleWithFeatures')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'data',
        components: list('pipeline', 'list', 'firstSucceeding')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'boolean',
        components: list('and', 'or', 'not')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'action',
        components: list('runActions', 'runActionOnItems', 'action.if')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'feature',
        components: list('feature.byCondition')
      }),
      menu.studioWrapWithArray('%$path%'),
      menu.action({
        title: 'Duplicate',
        action: studio.duplicateArrayItem('%$path%'),
        shortcut: 'Ctrl+D',
        showCondition: studio.isArrayItem('%$path%')
      }),
      menu.separator(),
      studio.gotoReferencesMenu(
        split({
          separator: '~',
          text: '%$path%',
          part: 'first'
        })
      ),
      menu.action({
        title: 'Remark',
        action: openDialog({
          title: 'Remark',
          content: group({
            controls: [
              editableText({
                title: 'remark',
                databind: '%$remark%',
                style: editableText.mdcInput(),
                features: [feature.onEnter(writeValue(studio.ref('%$path%~remark'), '%$remark%'))]
              })
            ],
            features: css.padding({
              top: '9',
              left: '20',
              right: '20'
            })
          }),
          style: dialog.popup(),
          id: 'add property',
          features: [
            watchable('remark', studio.val('%$path%~remark')),
            dialogFeature.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput()
          ]
        }),
        showCondition: isOfType('object', studio.val('%$path%'))
      }),
      menu.action({
        title: 'Javascript',
        action: studio.editSource('%$path%'),
        icon: icon({icon: 'LanguageJavascript', type: 'mdi'}),
        shortcut: 'Ctrl+J'
      }),
      menu.action({
        title: 'Delete',
        action: runActions(
          action.if(
            and(matchRegex('vars~[0-9]+~val$', '%$path%'), isEmpty(studio.val('%$path%'))),
            writeValue('%$studio/jbEditor/selected%', studio.parentPath(studio.parentPath('%$path%')))
          ),
          studio.delete('%$path%')
        ),
        icon: icon('delete'),
        shortcut: 'Delete'
      }),
      menu.action({
        title: If(studio.disabled('%$path%'), 'Enable', 'Disable'),
        action: studio.toggleDisabled('%$path%'),
        icon: icon('do_not_disturb'),
        shortcut: 'Ctrl+X'
      }),
      menu.action({
        title: 'Copy',
        action: studio.copy('%$path%'),
        icon: icon('copy'),
        shortcut: 'Ctrl+C'
      }),
      menu.action({
        title: 'Paste',
        action: studio.paste('%$path%'),
        icon: icon('paste'),
        shortcut: 'Ctrl+V'
      }),
      menu.action({
        title: 'Make Local',
        action: studio.openMakeLocal('%$path%'),
        showCondition: studio.canMakeLocal('%$path%')
      }),
      menu.action({
        title: 'Extract Component',
        action: studio.openExtractComponent('%$path%'),
        showCondition: studio.canExtractParam('%$path%')
      }),
      menu.action({
        title: 'Extract Param',
        action: studio.openExtractParam('%$path%'),
        showCondition: studio.canExtractParam('%$path%')
      })
    ]
  )
})