
component('studio.gotoPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string', options: 'prop,value', defaultValue: 'value'}
  ],
  impl: If('%$path%', runActions(
    dialog.closeDialog(),
    writeValue('%$studio/profile_path%', '%$path%'),
    ({},{},{path,semanticPart}) => jb.workspace.gotoPathRequest && jb.workspace.gotoPathRequest.next({path,semanticPart}),
    popup.regainCanvasFocus()
  ))
})

component('studio.openPropertyMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu(
    menu.menu({
      vars: [
        Var('compName', tgp.compName('%$path%'))
      ],
      options: [
        studio.styleEditorOptions('%$path%'),
        menu.action('multiline edit', studio.openMultilineEdit('%$path%'), {
          showCondition: equals(pipeline(tgp.paramDef('%$path%'), '%as%'), 'string')
        }),
        menu.action(pipeline(tgp.shortCompName('%$path%'), 'Goto %%'), studio.gotoPath('%$compName%'), {
          showCondition: '%$compName%'
        }),
        menu.action('Inteliscript editor', studio.openJbEditor('%$path%'), {
          icon: icon('build'),
          shortcut: 'Ctrl+I'
        }),
        menu.action('Javascript editor', studio.editSource('%$path%'), {
          icon: icon('LanguageJavascript', { type: 'mdi' }),
          shortcut: 'Ctrl+J'
        }),
        studio.gotoEditorOptions('%$path%'),
        menu.action('Delete', tgp.delete('%$path%'), { icon: icon('delete'), shortcut: 'Delete' }),
        menu.action(If(tgp.isDisabled('%$path%'), 'Enable', 'Disable'), tgp.toggleDisabled('%$path%'), {
          icon: icon('do_not_disturb'),
          shortcut: 'Ctrl+X'
        })
      ]
    })
  )
})

component('studio.jbEditorMenu', {
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
          title: 'Add Property',
          content: group({
            controls: [
              editableText('property name', '%$name%', {
                style: editableText.mdcInput(),
                features: [
                feature.onEnter(writeValue(tgp.ref('%$path%~%$name%'), ''))
              ]
              })
            ],
            features: css.padding('9', '20', { right: '20' })
          }),
          style: dialog.popup(),
          id: 'add property',
          features: [watchable('name'), dialogFeature.nearLauncherPosition(), dialogFeature.autoFocusOnFirstInput()]
        }),
        showCondition: equals(tgp.compName('%$path%'), 'object')
      }),
      menu.action({
        title: 'Add variable',
        action: runActions(studio.addVariable('%$path%'), studio.gotoPath('%$path%~%id%', 'value')),
        showCondition: endsWith('~$vars', '%$path%')
      }),
      menu.endWithSeparator(
        menu.dynamicOptions(tgp.moreParams('%$path%'), {
          genericOption: menu.action('%id%', runActions(
          tgp.addProperty('%$path%~%id%'),
          tree.redraw(),
          dialog.closeDialog(),
          writeValue('%$studio/jbEditor/selected%', '%$path%~%id%'),
          studio.gotoPath('%$path%~%id%', 'value'),
          studio.openJbEditProperty('%$path%~%id%')
        ))
        })
      ),
      menu.action({
        title: 'Variables',
        action: [
          writeValue(tgp.ref('%$path%~$vars'), list()),
          writeValue('%$studio/jbEditor/selected%', '%$path%~$vars'),
          tree.redraw(),
          studio.addVariable('%$path%~$vars'),
          studio.gotoPath('%$path%~$vars', 'value')
        ],
        showCondition: and(isEmpty(tgp.val('%$path%~$vars')), isOfType('object', tgp.val('%$path%')))
      }),
      studio.styleEditorOptions('%$path%'),
      menu.endWithSeparator({
        options: menu.action({
          title: 'Goto parent',
          action: studio.openJbEditor(tgp.parentPath('%$path%'), tgp.parentPath('%$fromPath%')),
          shortcut: 'Ctrl+P',
          showCondition: contains('~', { allText: '%$root%' })
        }),
        separator: menu.action({
          vars: [
            Var('compName', tgp.compName('%$path%'))
          ],
          title: pipeline(tgp.shortCompName('%$path%'), 'Goto %%'),
          action: studio.openJbEditor('%$compName%', '%$path%'),
          shortcut: 'Ctrl+I',
          showCondition: '%$compName%'
        })
      }),
      studio.gotoEditorOptions('%$path%'),
      menu.studioWrapWith('%$path%', 'control', { components: list('group') }),
      menu.studioWrapWith('%$path%', 'style', { components: list('styleWithFeatures') }),
      menu.studioWrapWith('%$path%', 'data', {
        components: list('pipeline','list','firstSucceeding')
      }),
      menu.studioWrapWith('%$path%', 'boolean', { components: list('and','or','not') }),
      menu.studioWrapWith('%$path%', 'action', {
        components: list('runActions','runActionOnItems','If')
      }),
      menu.studioWrapWith('%$path%', 'feature', { components: list('feature.byCondition') }),
      menu.studioWrapWithArray('%$path%'),
      menu.action('Duplicate', tgp.duplicateArrayItem('%$path%'), {
        shortcut: 'Ctrl+D',
        showCondition: tgp.isArrayItem('%$path%')
      }),
      menu.separator(),
      menu.action('Set as current page', writeValue('%$studio/circuit%', split('~', { text: '%$path%', part: 'first' }))),
      menu.menu('More', {
        options: [
        menu.action('Pick context', studio.pick()),
        studio.gotoReferencesMenu(split('~', { text: '%$path%', part: 'first' })),
        menu.action({
          title: 'Remark',
          action: openDialog({
            title: 'Remark',
            content: group({
              controls: [
                editableText('remark', '%$remark%', {
                  style: editableText.mdcInput(),
                  features: [
                  feature.onEnter(writeValue(tgp.ref('%$path%~remark'), '%$remark%'))
                ]
                })
              ],
              features: css.padding('9', '20', { right: '20' })
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
        menu.action('Javascript', studio.editSource('%$path%'), {
          icon: icon('LanguageJavascript', { type: 'mdi' }),
          shortcut: 'Ctrl+J'
        }),
        menu.action({
          title: 'Delete',
          action: runActions(
            If({
              condition: and(matchRegex('vars~[0-9]+~val$', '%$path%'), isEmpty(tgp.val('%$path%'))),
              then: writeValue('%$studio/jbEditor/selected%', tgp.parentPath(tgp.parentPath('%$path%')))
            }),
            tgp.delete('%$path%')
          ),
          icon: icon('delete'),
          shortcut: 'Delete'
        }),
        menu.action(If(tgp.isDisabled('%$path%'), 'Enable', 'Disable'), tgp.toggleDisabled('%$path%'), {
          icon: icon('do_not_disturb'),
          shortcut: 'Ctrl+X'
        }),
        menu.action('Copy', studio.copy('%$path%'), { icon: icon('copy'), shortcut: 'Ctrl+C' }),
        menu.action('Paste', studio.paste('%$path%'), { icon: icon('paste'), shortcut: 'Ctrl+V' }),
        menu.action('Undo', watchableComps.undo(), { icon: icon('undo'), shortcut: 'Ctrl+Z' }),
        menu.action('Redo', watchableComps.redo(), { icon: icon('redo'), shortcut: 'Ctrl+Y' }),
        menu.action('Make Local', studio.openMakeLocal('%$path%'), {
          showCondition: studio.canMakeLocal('%$path%')
        }),
        menu.action('Extract Component', studio.openExtractComponent('%$path%'), {
          showCondition: studio.canExtractParam('%$path%')
        }),
        menu.action('Extract Param', studio.openExtractParam('%$path%'), {
          showCondition: studio.canExtractParam('%$path%')
        })
      ]
      })
    ]
  })
})
