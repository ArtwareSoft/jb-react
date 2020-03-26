jb.component('studio.treeMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.menu({
    options: [
      menu.action({
        title: 'Insert Field',
        action: studio.openNewProfileDialog({
          path: '%$path%',
          type: 'table-field',
          mode: 'insert-control',
          onClose: studio.gotoLastEdit()
        }),
        showCondition: equals(pipeline(studio.val('%$path%'), '%$%'), 'table')
      }),
      menu.action({
        title: 'Insert',
        action: studio.openNewProfileDialog({
          path: '%$path%',
          type: 'control',
          mode: 'insert-control',
          onClose: studio.gotoLastEdit()
        })
      }),
      menu.action({
        title: 'Wrap with group',
        action: [
          studio.wrapWithGroup('%$path%'),
          onNextTimer(
            [writeValue('%$studio/profile_path%', '%$path%~controls~0'), tree.regainFocus()]
          )
        ]
      }),
      menu.action({
        title: 'Duplicate',
        action: studio.duplicateControl('%$path%'),
        shortcut: 'Ctrl+D'
      }),
      menu.separator(),
      menu.action({
        title: 'Inteliscript editor',
        action: studio.openJbEditor('%$path%'),
        shortcut: 'Ctrl+I'
      }),
      menu.action({
        title: 'Context viewer',
        action: {'$': 'studio.open-context-viewer', path: '%$path%'}
      }),
      menu.action({
        title: 'Javascript editor',
        action: studio.editSource('%$path%'),
        icon: icon('code'),
        shortcut: 'Ctrl+J'
      }),
      menu.action({
        vars: [Var('compName', studio.compName('%$path%'))],
        title: 'Goto %$compName%',
        action: studio.gotoPath('%$compName%'),
        showCondition: '%$compName%'
      }),
      studio.gotoEditorOptions('%$path%'),
      menu.separator(),
      menu.endWithSeparator({options: studio.gotoReferencesOptions('%$path%')}),
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
      })
    ]
  })
})

jb.component('studio.openTreeMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu({
    menu: studio.treeMenu('%$path%')
  })
})

jb.component('studio.controlTreeNodes', {
  type: 'tree.node-model',
  impl: function(context) {
		var currentPath = context.run({ $: 'studio.currentProfilePath' });
		var compPath = currentPath.split('~')[0] || '';
		return new jb.studio.ControlTree(compPath + '~impl');
	}
})

jb.component('studio.controlTree', {
  type: 'control',
  impl: group({
    controls: [
      tree({
        nodeModel: studio.controlTreeNodes(),
        style: tree.expandBox(true),
        features: [
          tree.selection({
            databind: '%$studio/profile_path%',
            autoSelectFirst: true,
            onSelection: [studio.openProperties(), studio.highlightByPath(studio.currentProfilePath())],
            onRightClick: studio.openTreeMenu('%%')
          }),
          tree.keyboardSelection({
            onEnter: studio.openProperties(true),
            onRightClickOfExpanded: studio.openTreeMenu('%%'),
            applyMenuShortcuts: studio.treeMenu('%%')
          }),
          tree.dragAndDrop(),
          studio.watchScriptChanges(),
          defHandler(
            'newControl',
            studio.openNewProfileDialog({
              path: tree.pathOfInteractiveItem(),
              type: 'control',
              mode: 'insert-control',
              onClose: studio.gotoLastEdit()
            })
          ),
          studio.dropHtml(studio.extractStyle('%$newCtrl%', tree.pathOfInteractiveItem()))
        ]
      })
    ],
    features: css.padding('10')
  })
})

jb.component('studio.openControlTree', {
  type: 'action',
  impl: openDialog({
    style: dialog.studioFloating({id: 'studio-outline', width: '350'}),
    content: studio.controlTree(),
    menu: button({
      title: ' ',
      action: studio.openTreeMenu('%$studio/profile_path%'),
      style: button.mdcIcon('menu'),
      features: css('{ background: none }')
    }),
    title: 'Outline'
  })
})

