jb.component('studio.gotoPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.if(
    '%$path%',
    runActions(
      dialog.closeContainingPopup(),
      writeValue('%$studio/profile_path%', '%$path%')
    )
  )
})

jb.component('studio.openPropertyMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu({
    menu: menu.menu({
      vars: [Var('compName', studio.compName('%$path%'))],
      options: [
        studio.styleEditorOptions('%$path%'),
        menu.action({
          title: 'multiline edit',
          action: studio.openMultilineEdit('%$path%'),
          showCondition: equals(pipeline(studio.paramDef('%$path%'), '%as%'), 'string')
        }),
        menu.action({
          title: 'Goto %$compName%',
          action: studio.gotoPath('%$compName%'),
          showCondition: '%$compName%'
        }),
        menu.action({
          title: 'Inteliscript editor',
          action: studio.openJbEditor('%$path%'),
          icon: icon('build'),
          shortcut: 'Ctrl+I'
        }),
        menu.action({
          title: 'Javascript editor',
          action: studio.editSource('%$path%'),
          icon: icon({icon: 'LanguageJavascript', type: 'mdi'}),
          shortcut: 'Ctrl+J'
        }),
        studio.gotoEditorOptions('%$path%'),
        menu.action({
          title: 'Delete',
          action: studio.delete('%$path%'),
          icon: icon('delete'),
          shortcut: 'Delete'
        }),
        menu.action({
          title: data.if(studio.disabled('%$path%'), 'Enable', 'Disable'),
          action: studio.toggleDisabled('%$path%'),
          icon: icon('do_not_disturb'),
          shortcut: 'Ctrl+X'
        })
      ]
    })
  })
})

jb.component('studio.jbEditorMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'root', as: 'string'}
  ],
  impl: menu.menu({
    options: [
      menu.action({
        title: 'Add property',
        action: openDialog({
          id: 'add property',
          style: dialog.popup(),
          content: group({
            controls: [
              editableText({
                title: 'property name',
                databind: '%$name%',
                style: editableText.mdcInput(),
                features: [
                  feature.onEnter(
                    writeValue(studio.ref('%$path%~%$name%'), ''),
                    dialog.closeContainingPopup(true),
                    tree.redraw(),
                    tree.regainFocus()
                  )
                ]
              })
            ],
            features: css.padding({top: '9', left: '20', right: '20'})
          }),
          title: 'Add Property',
          modal: 'true',
          features: [
            variable({name: 'name', watchable: true}),
            dialogFeature.nearLauncherPosition({}),
            dialogFeature.autoFocusOnFirstInput()
          ]
        }),
        showCondition: equals(studio.compName('%$path%'), 'object')
      }),
      menu.action({
        title: 'Add variable',
        action: studio.addVariable('%$path%'),
        showCondition: endsWith('~$vars', '%$path%')
      }),
      menu.endWithSeparator({
        options: menu.dynamicOptions(
          studio.moreParams('%$path%'),
          menu.action({
            title: suffix('~'),
            action: runActions(
              studio.addProperty('%%'),
              tree.redraw(),
              dialog.closeContainingPopup(),
              writeValue('%$jbEditorCntrData/selected%', '%%'),
              studio.openJbEditProperty('%%')
            )
          })
        )
      }),
      menu.action({
        title: 'Variables',
        action: [
          writeValue(studio.ref('%$path%~$vars'), {'$': 'object'}),
          writeValue('%$jbEditorCntrData/selected%', '%$path%~$vars'),
          tree.redraw(),
          studio.addVariable('%$path%~$vars')
        ],
        showCondition: and(
          isEmpty(studio.val('%$path%~$vars')),
          isOfType('object', studio.val('%$path%'))
        )
      }),
      studio.styleEditorOptions('%$path%'),
      menu.endWithSeparator(
        [
          menu.action({
            title: 'Goto parent',
            action: studio.openJbEditor(studio.parentPath('%$path%'), studio.parent('%$fromPath%')),
            showCondition: contains({text: '~', allText: '%$root%'}),
            shortcut: 'Ctrl+P',
          }),
          menu.action({
            vars: [Var('compName', studio.compName('%$path%'))],
            title: 'Goto %$compName%',
            action: studio.openJbEditor({path: '%$compName%', fromPath: '%$path%'}),
            showCondition: '%$compName%'
          }),
          menu.action({
            vars: [Var('compName', split({separator: '~', text: '%$fromPath%', part: 'first'}))],
            title: 'Back to %$compName%',
            action: studio.openComponentInJbEditor('%$fromPath%', '%$path%'),
            showCondition: '%$fromPath%'
          })
        ]
      ),
      studio.gotoEditorOptions('%$path%'),
      menu.studioWrapWith({path: '%$path%', type: 'control', components: list('group')}),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'style',
        components: list('style-with-features')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'data',
        components: list('pipeline', 'list', 'first-succeeding')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'boolean',
        components: list('and', 'or', 'not')
      }),
      menu.studioWrapWith({
        path: '%$path%',
        type: 'action',
        components: list('runActions', 'runActionOnItems')
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
      menu.menu({
        title: 'More',
        options: [
          menu.action({title: 'Pick context', action: studio.pick()}),
          studio.gotoReferencesMenu(
            split({separator: '~', text: '%$path%', part: 'first'})
          ),
          menu.action({
            title: 'Remark',
            action: openDialog({
              id: 'add property',
              style: dialog.popup(),
              content: group({
                controls: [
                  editableText({
                    title: 'remark',
                    databind: '%$remark%',
                    style: editableText.mdcInput(),
                    features: [
                      feature.onEnter(
                        writeValue(studio.ref('%$path%~remark'), '%$remark%'),
                        dialog.closeContainingPopup(true),
                        tree.redraw(),
                        tree.regainFocus()
                      )
                    ]
                  })
                ],
                features: css.padding({top: '9', left: '20', right: '20'})
              }),
              title: 'Remark',
              modal: 'true',
              features: [
                variable({name: 'remark', value: studio.val('%$path%~remark'), watchable: true}),
                dialogFeature.nearLauncherPosition({}),
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
            action: studio.delete('%$path%'),
            icon: icon('delete'),
            shortcut: 'Delete'
          }),
          menu.action({
            title: {'$if': studio.disabled('%$path%'), then: 'Enable', else: 'Disable'},
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
            title: 'Undo',
            action: studio.undo(),
            icon: icon('undo'),
            shortcut: 'Ctrl+Z'
          }),
          menu.action({
            title: 'Redo',
            action: studio.redo(),
            icon: icon('redo'),
            shortcut: 'Ctrl+Y'
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
          }),
        ],
        optionsFilter: '%%'
      })
    ]
  })
})
