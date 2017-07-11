jb.component('studio.open-control-tree', {
  type: 'action', 
  impl :{$: 'open-dialog', 
    style :{$: 'dialog.studio-floating', id: 'studio-outline', width: '350' }, 
    content :{$: 'studio.control-tree' }, 
    menu :{$: 'button', 
      title: ' ', 
      action :{$: 'studio.open-tree-menu', path: '%$studio/profile_path%' }, 
      style :{$: 'button.mdl-icon', icon: 'menu' }, 
      features :{$: 'css', css: '{ background: none }' }
    }, 
    title: 'Outline'
  }
})

jb.component('studio.open-tree-menu', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string' }
  ], 
  impl :{$: 'menu.open-context-menu', menu :{$: 'studio.tree-menu', path: '%$path%'} }
})

jb.component('studio.tree-menu', {
  type: 'menu.option', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'menu.menu', 
    options: [
      {$: 'menu.action', 
        title: 'Insert', 
        action :{$: 'studio.open-new-profile-dialog', 
          type: 'control', 
          mode: 'insert-control'
        }
      }, 
      {$: 'menu.action', 
        title: 'Wrap with group', 
        action: [
          {$: 'studio.wrap-with-group', path: '%$path%' }, 
          {$: 'on-next-timer', 
            action: [
              {$: 'write-value', 
                to: '%$studio/profile_path%', 
                value: '%$path%~controls~0'
              }, 
              {$: 'tree.regain-focus' }
            ]
          }
        ]
      }, 
      {$: 'menu.action', 
        title: 'Duplicate', 
        action :{$: 'studio.duplicate-control', path: '%$path%' }
      }, 
      {$: 'menu.separator' }, 
      {$: 'menu.action', 
        title: 'inteliscript editor', 
        action :{$: 'studio.open-jb-editor', path: '%$path%' }
      }, 
      {$: 'menu.action', 
        title: 'context viewer', 
        action :{$: 'studio.open-context-viewer', path: '%$path%' }
      }, 
      {$: 'menu.action', 
        title: 'javascript editor', 
        action :{$: 'studio.edit-source', path: '%$path%' }
      }, 
      {$: 'menu.action', 
        $vars: {
          compName :{$: 'studio.comp-name', path: '%$path%' }
        }, 
        title: 'Goto %$compName%', 
        action :{$: 'studio.goto-path', path: '%$compName%' }, 
        showCondition: '%$compName%'
      }, 
      {$: 'studio.goto-sublime', path: '%$path%' }, 
      {$: 'menu.separator' }, 
      {$: 'menu.end-with-separator', 
        options :{$: 'studio.goto-references', 
          path: '%$path%', 
          action: [
            {$: 'write-value', to: '%$studio/profile_path%', value: '%%' }, 
            {$: 'studio.open-control-tree', selection: '%$path%' }
          ]
        }
      }, 
      {$: 'menu.action', 
        title: 'Delete', 
        action :{$: 'studio.delete', path: '%$path%' }, 
        icon: 'delete', 
        shortcut: 'Delete'
      }, 
      {$: 'menu.action', 
        title: {$if: {$: 'studio.disabled', path: '%$path%'} , then: 'Enable', else: 'Disable' }, 
        icon: 'do_not_disturb', 
        shortcut: 'Ctrl+D', 
        action: {$: 'studio.toggle-disabled', path: '%$path%' }
      }, 
      {$: 'menu.action', 
        title: 'Copy', 
        action :{$: 'studio.copy', path: '%$path%' }, 
        icon: 'copy', 
        shortcut: 'Ctrl+C'
      }, 
      {$: 'menu.action', 
        title: 'Paste', 
        action :{$: 'studio.paste', path: '%$path%' }, 
        icon: 'paste', 
        shortcut: 'Ctrl+V'
      }, 
      {$: 'menu.action', 
        title: 'Undo', 
        action :{$: 'studio.undo' }, 
        icon: 'undo', 
        shortcut: 'Ctrl+Z'
      }, 
      {$: 'menu.action', 
        title: 'Redo', 
        action :{$: 'studio.redo' }, 
        icon: 'redo', 
        shortcut: 'Ctrl+Y'
      }
    ]
  }
})

jb.component('studio.control-tree', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'tree', 
        nodeModel :{$: 'studio.control-tree.nodes' }, 
        features: [
          {$: 'css.class', class: 'jb-control-tree' }, 
          {$: 'tree.selection', 
            databind: '%$studio/profile_path%', 
            onSelection: [
              {$: 'studio.open-properties' }, 
              {$: 'studio.highlight-in-preview', 
                path :{$: 'studio.currentProfilePath' }
              }
            ], 
            autoSelectFirst: true,
          }, 
          {$: 'tree.keyboard-selection', 
            onEnter :{$: 'studio.open-properties', focus: true },
            onRightClickOfExpanded :{$: 'studio.open-tree-menu', path: '%%' }, 
            applyMenuShortcuts :{$: 'studio.tree-menu', path: '%%' },
            autoFocus: true,
          }, 
          {$: 'tree.drag-and-drop' }, 
//          {$: 'studio.control-tree.refresh-path-changes' }, 
          {$: 'studio.watch-script-changes' }
          // {$: 'tree.onMouseRight', 
          //   action :{$: 'studio.open-tree-menu', path: '%%' }
          // }
        ]
      }
    ], 
    features :[ 
        {$: 'css.padding', top: '10' },
        //{$: 'studio.watch-path', path :{$: 'studio.currentProfilePath' } },
    ]
  }
})

jb.component('studio.control-tree.nodes', {
	type: 'tree.nodeModel',
	impl: function(context) {
		var currentPath = context.run({ $: 'studio.currentProfilePath' });
		var compPath = currentPath.split('~')[0] || '';
		return new jb.studio.ControlTree(compPath + '~impl');
	}
})

// after model modifications the paths of the selected and expanded nodes may change and the tree should fix it.
// jb.component('studio.control-tree.refresh-path-changes', {
//   type: 'feature',
//   impl: ctx => ({
//     init : cmp => {
//       var tree = ctx.vars.$tree; 
//       jb.studio.scriptChanges.takeUntil( cmp.destroyed )
//         .subscribe(fixer => {
//           var new_expanded = {};
//           jb.entries(tree.expanded)
//             .filter(e=>e[1])
//             .forEach(e => new_expanded[fixer.fix(e[0])] = true)
//           tree.expanded = new_expanded;
//           tree.selected = fixer.fix(tree.selected);
//         })
//     }
//   })
// })
