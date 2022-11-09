
jb.component('tgpTextEditor.prepareSetPT', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string'},
    {id: 'compName', as: 'string'},
  ],
  macroByValue: true,
  impl: (ctx,_path,semanticPart,compName) => {
    const profile = jb.tgp.valOfPath(_path)
    const params = jb.path(jb.comps[(profile||{}).$],'params') || []
    const singleParamAsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
    const semanticIndex = semanticPart.match(/[0-9]+$/)
    const openArray = semanticPart.indexOf('open-array') == 0
    const path = singleParamAsArray ? [_path,params[0].id].join('~') : _path
    if (Array.isArray(profile)) {
        const index = openArray ? 0 : semanticIndex ? +semanticIndex[0]+1 : profile.length
        return { path: [path,index].join('~'), do: () => jb.tgp.addArrayItem(path,{toAdd: {$: compName}, srcCtx: ctx, index}) }
    } else if (singleParamAsArray || semanticIndex) {
        const ar = profile[params[0].id]
        const lastIndex = Array.isArray(ar) ? ar.length : 1
        const index = ar == null ? undefined : openArray ? 0 : semanticIndex ? +semanticIndex[0]+1 : lastIndex
        return { path: [path,index].join('~'), do: () => jb.tgp.addArrayItem(path,{toAdd: {$: compName}, srcCtx: ctx, index}) }
    }
    return { innerPath: path, do: () => jb.tgp.setComp(path, compName, ctx) }
  }
})

jb.component('tgpTextEditor.selectPT', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string'}
  ],
  impl: menu.menu({
    vars: Var('type',tgp.paramType('%$path%')),
    options: menu.dynamicOptions(pipeline(
      picklist.sortedOptions(
        tgp.categoriesOfType('%$type%'),
        studio.categoriesMarks('%$type%', '%$path%')
      ),
      studio.flattenCategories()
    ),
    menu.action({
        title: '%text%',
        action: runActions(
          Var('prepareSetPT', tgpTextEditor.prepareSetPT({path: '%$path%', semanticPart: '%$semanticPart%', compName: '%compName%'})),
          '%$prepareSetPT/do()%',
          studio.gotoPath('%$prepareSetPT/innerPath%', 'open-profile')
        ),
        description: '%description%'
      })
    )
  })
})

jb.component('tgpTextEditor.selectEnum', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
  ],
  impl: menu.menu({
    options: menu.dynamicOptions(
      ({},{},{path}) => jb.tgp.paramDef(path).options.split(','), 
      menu.action('%%', (ctx,{},{path}) => jb.studio.writeValueOfPath(path,ctx.data,ctx)))
  })
})

jb.component('tgpTextEditor.editMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.menu(
    tgp.shortTitle('%$path%'),
    [
      menu.action({
        title: 'Add variable',
        action: studio.addVariable('%$path%'),
        showCondition: endsWith('~$vars', '%$path%')
      }),
      menu.endWithSeparator(
        menu.dynamicOptions(
          tgp.moreParams('%$path%'),
          menu.action({ 
            title: '%id%', 
            description: '%description%',
            action: runActions(tgp.addProperty('%$path%~%id%'), studio.gotoPath('%$path%~%id%', 'value-text'))
          })
        )
      ),
      studio.styleEditorOptions('%$path%'),
      menu.endWithSeparator(
        [
          menu.action({
            vars: [Var('compName', tgp.compName('%$path%'))],
            title: 'Goto %$compName%',
            action: studio.gotoPath('%$compName%', 'open'),
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
        action: tgp.duplicateArrayItem('%$path%'),
        shortcut: 'Ctrl+D',
        showCondition: tgp.isArrayItem('%$path%')
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
                features: [feature.onEnter(writeValue(tgp.ref('%$path%~remark'), '%$remark%'))]
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
            watchable('remark', tgp.val('%$path%~remark')),
            dialogFeature.nearLauncherPosition(),
            dialogFeature.autoFocusOnFirstInput()
          ]
        }),
        showCondition: isOfType('object', tgp.val('%$path%'))
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
            and(matchRegex('vars~[0-9]+~val$', '%$path%'), isEmpty(tgp.val('%$path%'))),
            writeValue('%$studio/jbEditor/selected%', tgp.parentPath(tgp.parentPath('%$path%')))
          ),
          tgp.delete('%$path%')
        ),
        icon: icon('delete'),
        shortcut: 'Delete'
      }),
      menu.action({
        title: If(tgp.isDisabled('%$path%'), 'Enable', 'Disable'),
        action: tgp.toggleDisabled('%$path%'),
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