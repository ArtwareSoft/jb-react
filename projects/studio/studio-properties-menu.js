jb.component('studio.goto-path', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string' },
	],
	impl :{$runActions: [
		{$: 'dialog.close-containing-popup' },
		{$: 'write-value', to: '%$studio/profile_path%', value: '%$path%' },
		{$if :{$: 'studio.is-of-type', type: 'control,table-field', path: '%$path%'},
			then: {$runActions: [
				{$: 'studio.open-control-tree'},
//				{$: 'studio.open-properties', focus: true}
			]},
			else :{$: 'studio.open-component-in-jb-editor', path: '%$path%' }
		}
	]}
})

jb.component('studio.open-property-menu',  /* studio_openPropertyMenu */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_openContextMenu({
    menu: menu_menu({
      vars: [Var('compName', studio_compName('%$path%'))],
      options: [
        studio_styleEditorOptions('%$path%'),
        menu_action({
          title: 'multiline edit',
          action: studio_openMultilineEdit('%$path%'),
          showCondition: equals(pipeline(studio_paramDef('%$path%'), '%as%'), 'string')
        }),
        menu_action({
          title: 'Goto %$compName%',
          action: studio_gotoPath('%$compName%'),
          showCondition: '%$compName%'
        }),
        menu_action({
          title: 'Inteliscript editor',
          action: studio_openJbEditor('%$path%'),
          icon: 'code',
          shortcut: 'Ctrl+I'
        }),
        menu_action({
          title: 'Javascript editor',
          action: studio_editSource('%$path%'),
          icon: 'code',
          shortcut: 'Ctrl+J'
        }),
        studio_gotoEditorOptions('%$path%'),
        menu_action({
          title: 'Delete',
          action: studio_delete('%$path%'),
          icon: 'delete',
          shortcut: 'Delete'
        }),
        menu_action({
          title: {$if: studio_disabled('%$path%'), then: 'Enable', else: 'Disable'},
          action: studio_toggleDisabled('%$path%'),
          icon: 'do_not_disturb',
          shortcut: 'Ctrl+X'
        })
      ]
    })
  })
})

jb.component('studio.jb-editor-menu',  /* studio_jbEditorMenu */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'root', as: 'string'}
  ],
  impl: menu_menu({
    options: [
      menu_action({
        title: 'Add property',
        action: openDialog({
          id: 'add property',
          style: dialog_popup(),
          content: group({
            controls: [
              editableText({
                title: 'property name',
                databind: '%$name%',
                style: editableText_mdlInput(),
                features: [
                  feature_onEnter(
                    writeValue(studio_ref('%$path%~%$name%'), ''),
                    dialog_closeContainingPopup(true),
                    tree_redraw(),
                    tree_regainFocus()
                  )
                ]
              })
            ],
            features: css_padding({top: '9', left: '20', right: '20'})
          }),
          title: 'Add Property',
          modal: 'true',
          features: [
            variable({name: 'name', mutable: true}),
            dialogFeature_nearLauncherPosition({}),
            dialogFeature_autoFocusOnFirstInput()
          ]
        }),
        showCondition: equals(studio_compName('%$path%'), 'object')
      }),
      menu_action({
        title: 'Add variable',
        action: studio_addVariable('%$path%'),
        showCondition: endsWith('~$vars', '%$path%')
      }),
      menu_endWithSeparator({
        options: menu_dynamicOptions(
          studio_moreParams('%$path%'),
          menu_action({
            title: suffix('~'),
            action: runActions(
              studio_addProperty('%%'),
              tree_redraw(),
              dialog_closeContainingPopup(),
              writeValue('%$jbEditorCntrData/selected%', '%%'),
              studio_openJbEditProperty('%%')
            )
          })
        )
      }),
      menu_action({
        title: 'Variables',
        action: [
          writeValue(studio_ref('%$path%~$vars'), {$: 'object'}),
          writeValue('%$jbEditorCntrData/selected%', '%$path%~$vars'),
          tree_redraw(),
          studio_addVariable('%$path%~$vars')
        ],
        showCondition: and(isEmpty(studio_val('%$path%~$vars')), isOfType('object', studio_val('%$path%')))
      }),
      studio_styleEditorOptions('%$path%'),
      menu_endWithSeparator(
        [
          menu_action({
            vars: [Var('compName', split({separator: '~', text: '%$root%', part: 'first'}))],
            title: 'Goto parent',
            action: studio_openComponentInJbEditor('%$path%', '%$fromPath%'),
            showCondition: contains({text: '~', allText: '%$root%'})
          }),
          menu_action({
            vars: [Var('compName', studio_compName('%$path%'))],
            title: 'Goto %$compName%',
            action: studio_openJbEditor({path: '%$compName%', fromPath: '%$path%'}),
            showCondition: '%$compName%'
          }),
          menu_action({
            vars: [Var('compName', split({separator: '~', text: '%$fromPath%', part: 'first'}))],
            title: 'Back to %$compName%',
            action: studio_openComponentInJbEditor('%$fromPath%', '%$path%'),
            showCondition: '%$fromPath%'
          })
        ]
      ),
      studio_gotoEditorOptions('%$path%'),
      menu_studioWrapWith({path: '%$path%', type: 'control', components: list('group')}),
      menu_studioWrapWith({
        path: '%$path%',
        type: 'data',
        components: list('pipeline', 'list', 'firstSucceeding')
      }),
      menu_studioWrapWith({path: '%$path%', type: 'boolean', components: list('and', 'or', 'not')}),
      menu_studioWrapWith({
        path: '%$path%',
        type: 'action',
        components: list('runActions', 'runActionOnItems')
      }),
      menu_studioWrapWithArray('%$path%'),
      menu_action({
        title: 'Duplicate',
        action: studio_duplicateArrayItem('%$path%'),
        shortcut: 'Ctrl+D',
        showCondition: studio_isArrayItem('%$path%')
      }),
      menu_separator(),
      menu_menu({
        title: 'More',
        options: [
          menu_action({title: 'Pick context', action: studio_pick()}),
          studio_gotoReferencesMenu(split({separator: '~', text: '%$path%', part: 'first'})),
          menu_action({
            title: 'Remark',
            action: openDialog({
              id: 'add property',
              style: dialog_popup(),
              content: group({
                controls: [
                  editableText({
                    title: 'remark',
                    databind: '%$remark%',
                    style: editableText_mdlInput(),
                    features: [
                      feature_onEnter(
                        writeValue(studio_ref('%$path%~remark'), '%$remark%'),
                        dialog_closeContainingPopup(true),
                        tree_redraw(),
                        tree_regainFocus()
                      )
                    ]
                  })
                ],
                features: css_padding({top: '9', left: '20', right: '20'})
              }),
              title: 'Remark',
              modal: 'true',
              features: [
                variable({name: 'remark', value: studio_val('%$path%~remark'), mutable: true}),
                dialogFeature_nearLauncherPosition({}),
                dialogFeature_autoFocusOnFirstInput()
              ]
            }),
            showCondition: isOfType('object', studio_val('%$path%'))
          }),
          menu_action({
            title: 'Javascript',
            action: studio_editSource('%$path%'),
            icon: 'code',
            shortcut: 'Ctrl+J'
          }),
          menu_action({
            title: 'Delete',
            action: studio_delete('%$path%'),
            icon: 'delete',
            shortcut: 'Delete'
          }),
          menu_action({
            title: {$if: studio_disabled('%$path%'), then: 'Enable', else: 'Disable'},
            action: studio_toggleDisabled('%$path%'),
            icon: 'do_not_disturb',
            shortcut: 'Ctrl+X'
          }),
          menu_action({title: 'Copy', action: studio_copy('%$path%'), icon: 'copy', shortcut: 'Ctrl+C'}),
          menu_action({title: 'Paste', action: studio_paste('%$path%'), icon: 'paste', shortcut: 'Ctrl+V'}),
          menu_action({title: 'Undo', action: studio_undo(), icon: 'undo', shortcut: 'Ctrl+Z'}),
          menu_action({title: 'Redo', action: studio_redo(), icon: 'redo', shortcut: 'Ctrl+Y'})
        ],
        optionsFilter: '%%'
      })
    ]
  })
})
