jb.component('studio.tree-menu',  /* studio_treeMenu */ {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_menu({
    options: [
      menu_action({
        title: 'Insert Field',
        action: studio_openNewProfileDialog({
          path: '%$path%',
          type: 'table-field',
          mode: 'insert-control',
          onClose: studio_gotoLastEdit()
        }),
        showCondition: equals(pipeline(studio_val('%$path%'), '%$%'), 'table')
      }),
      menu_action({
        title: 'Insert',
        action: studio_openNewProfileDialog({
          path: '%$path%',
          type: 'control',
          mode: 'insert-control',
          onClose: studio_gotoLastEdit()
        })
      }),
      menu_action({
        title: 'Wrap with group',
        action: [
          studio_wrapWithGroup('%$path%'),
          onNextTimer([writeValue('%$studio/profile_path%', '%$path%~controls~0'), tree_regainFocus()])
        ]
      }),
      menu_action({title: 'Duplicate', action: studio_duplicateControl('%$path%'), shortcut: 'Ctrl+D'}),
      menu_separator(),
      menu_action({
        title: 'Inteliscript editor',
        action: studio_openJbEditor('%$path%'),
        shortcut: 'Ctrl+I'
      }),
      menu_action({
        title: 'Context viewer',
        action: {$: 'studio.open-context-viewer', path: '%$path%'}
      }),
      menu_action({
        title: 'Javascript editor',
        action: studio_editSource('%$path%'),
        icon: 'code',
        shortcut: 'Ctrl+J'
      }),
      menu_action({
        vars: [Var('compName', studio_compName('%$path%'))],
        title: 'Goto %$compName%',
        action: studio_gotoPath('%$compName%'),
        showCondition: '%$compName%'
      }),
      studio_gotoEditorOptions('%$path%'),
      menu_separator(),
      menu_endWithSeparator({options: studio_gotoReferencesOptions('%$path%')}),
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
    ]
  })
})

jb.component('studio.open-tree-menu',  /* studio_openTreeMenu */ {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_openContextMenu({
    menu: studio_treeMenu('%$path%')
  })
})

jb.component('studio.control-tree.nodes',  /* studio_controlTree_nodes */ {
  type: 'tree.nodeModel',
  impl: function(context) {
		var currentPath = context.run({ $: 'studio.currentProfilePath' });
		var compPath = currentPath.split('~')[0] || '';
		return new jb.studio.ControlTree(compPath + '~impl');
	}
})

jb.component('studio.control-tree',  /* studio_controlTree */ {
  type: 'control',
  impl: group({
    controls: [
      tree({
        nodeModel: studio_controlTree_nodes(),
        features: [
          css_class('jb-control-tree'),
          tree_selection({
            databind: '%$studio/profile_path%',
            autoSelectFirst: true,
            onSelection: [studio_openProperties(), studio_highlightInPreview(studio_currentProfilePath())],
            onRightClick: studio_openTreeMenu('%%')
          }),
          tree_keyboardSelection({
            onEnter: studio_openProperties(true),
            onRightClickOfExpanded: studio_openTreeMenu('%%'),
            applyMenuShortcuts: studio_treeMenu('%%')
          }),
          tree_dragAndDrop(),
          studio_watchScriptChanges()
        ]
      })
    ],
    features: [css_padding('10')]
  })
})

// after model modifications the paths of the selected and expanded nodes may change and the tree should fix it.
// jb.component('studio.control-tree.refresh-path-changes', {
//   type: 'feature',
//   impl: ctx => ({
//     init : cmp => {
//       var tree = cmp.ctx.vars.$tree;
//       if (!tree) return;
//       jb.studio.compsRefHandler.resourceChange.takeUntil( cmp.destroyed )
//         .subscribe(opEvent => {
//           var new_expanded = {};
//           jb.entries(tree.expanded)
//             .filter(e=>e[1]).map(e=>e[0])
//             .map(path=> fixPath(path,opEvent))
//             .filter(x=>x)
//             .forEach(path => new_expanded[path] = true)
//           tree.expanded = new_expanded;
//           tree.selectionEmitter.next(fixPath(tree.selected,opEvent));
//         })
//
//         function fixPath(path,opEvent) {
//           var oldPath = opEvent.oldRef.$jb_path.join('~');
//           if (path.indexOf(oldPath) == 0)
//             return opEvent.ref.$jb_invalid ? null : path.replace(oldPath,opEvent.ref.$jb_path.join('~'));
//           return path;
//         }
//     }
//   })
// })

jb.component('studio.open-control-tree',  /* studio_openControlTree */ {
  type: 'action',
  impl: openDialog({
    style: dialog_studioFloating({id: 'studio-outline', width: '350'}),
    content: studio_controlTree(),
    menu: button({
      title: ' ',
      action: studio_openTreeMenu('%$studio/profile_path%'),
      style: button_mdlIcon('menu'),
      features: css('{ background: none }')
    }),
    title: 'Outline'
  })
})

