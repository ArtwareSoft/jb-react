
extension('studio', {
	ControlTree: class ControlTree {
		constructor(rootPath) {
			this.rootPath = rootPath;
			this.refHandler = jb.watchableComps.handler;
		}
		title(path) {
			const val = jb.tgp.valOfPath(path);
			if (path &&  (val == null || Array.isArray(val) && val.length == 0) && path.match(/~controls$/))
				return jb.ui.h('a',{style: {cursor: 'pointer', 'text-decoration': 'underline'}, onclick: 'newControl' },'add new');
      const title = jb.tgp.shortTitle(path)
      if (title == 'control-with-condition')
        return jb.ui.h('div',{},[this.title(path+'~control'),jb.ui.h('span',{class:'treenode-val'},'conditional') ]);
      return title
		}
		// differnt from children() == 0, beacuse in the control tree you can drop into empty group
		isArray(path) {
			return this.children(path).length > 0;
		}
		children(path,nonRecursive) {
			return [].concat.apply([],jb.tgp.controlParams(path).map(prop=>path + '~' + prop)
					.map(innerPath=> {
						const val = jb.tgp.valOfPath(innerPath);
						if (Array.isArray(val) && val.length > 0)
						return jb.tgp.arrayChildren(innerPath,true);
						return [innerPath]
					}))
					.concat(nonRecursive ? [] : this.innerControlPaths(path));
		}
		move(from,to,ctx) {
			return jb.tgp.moveFixDestination(from,to,ctx)
		}
		disabled(path) {
			return jb.tgp.isDisabled(path)
		}
		icon(path) {
			return jb.tgp.icon(path)
		}

		// private
		innerControlPaths(path) {
			return ['action~content','action~menu'] // add more inner paths here
				.map(x=>path+'~'+x).filter(p=>jb.tgp.isControlType(jb.tgp.paramType(p)))
		}
	},
})

component('studio.treeMenu', {
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
        showCondition: equals(pipeline(tgp.val('%$path%'), '%$%'), 'table')
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
        action: runActions(
          tgp.wrapWithGroup('%$path%'),
          writeValue('%$studio/profile_path%', '%$path%~controls~0'), 
          popup.regainCanvasFocus()
        )
      }),
      menu.action({
        title: 'Duplicate',
        action: tgp.duplicateControl('%$path%'),
        shortcut: 'Ctrl+D'
      }),
      menu.separator(),
      menu.action({
        title: 'Inteliscript editor',
        action: studio.openJbEditor('%$path%'),
        shortcut: 'Ctrl+I'
      }),
      menu.action({
        title: 'Javascript editor',
        action: studio.editSource('%$path%'),
        icon: icon('code'),
        shortcut: 'Ctrl+J'
      }),
      menu.action({
        vars: [Var('compName', tgp.compName('%$path%'))],
        title: pipeline(tgp.shortCompName('%$path%'), 'Goto %%'), 
        action: runActions(
          writeValue('%$studio/profile_path%', '%$compName%~impl'),
          studio.openControlTree(),
          studio.openProperties(true)
        ),
        showCondition: '%$compName%'
      }),
      studio.gotoEditorOptions('%$path%'),
      menu.separator(),
      menu.endWithSeparator({options: studio.gotoReferencesOptions('%$path%')}),
      menu.action({
        title: 'Delete',
        action: tgp.delete('%$path%'),
        icon: icon('delete'),
        shortcut: 'Delete'
      }),
      menu.action({
        title: If(tgp.isDisabled('%$path%'),'Enable','Disable'),
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
        title: 'Undo',
        action: watchableComps.undo(),
        icon: icon('undo'),
        shortcut: 'Ctrl+Z'
      }),
      menu.action({
        title: 'Redo',
        action: watchableComps.redo(),
        icon: icon('redo'),
        shortcut: 'Ctrl+Y'
      })
    ]
  })
})

component('studio.openTreeMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu({
    menu: studio.treeMenu('%$path%'),
    features: dialogFeature.onClose(popup.regainCanvasFocus())
  })
})

component('studio.controlTreeNodes', {
  type: 'tree.node-model',
  impl: function(context) {
		var currentPath = context.run({ $: 'studio.currentProfilePath' });
		var compPath = currentPath.split('~')[0] || '';
		return new jb.studio.ControlTree(compPath + '~impl');
	}
})

component('studio.controlTree', {
  type: 'control',
  impl: group({
    controls: [
      tree({
        nodeModel: studio.controlTreeNodes(),
        style: tree.expandBox(true),
        features: [
          variable('popupLauncherCanvas','%$cmp%'),
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
          watchRef({ref: '%$studio/profile_path%', strongRefresh: true, remark: 'override selection state'}),
          studio.watchPath({
            path: studio.currentPagePath(),
            includeChildren: 'structure',
            allowSelfRefresh: true
          }),
          method(
            'newControl',
            studio.openNewProfileDialog({
              path: tree.pathOfInteractiveItem(),
              type: 'control',
              mode: 'insert-control',
              onClose: studio.gotoLastEdit()
            })
          ),
          //studio.dropHtml(cardExtract.extractStyle('%$newCtrl%', tree.pathOfInteractiveItem()))
        ]
      })
    ],
    features: css.padding('10')
  })
})

component('studio.openControlTree', {
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

