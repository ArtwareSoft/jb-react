
extension('studio', 'jbEditor', {
	jbEditorTree: class jbEditorTree {
		constructor(rootPath,includeCompHeader) {
			this.rootPath = rootPath;
			this.refHandler = jb.watchableComps.handler;
			this.includeCompHeader= includeCompHeader;
		}
		title(path, collapsed) {
			let val = jb.tgp.valOfPath(path)
			let compName = jb.tgp.shortCompNameOfPath(path)
			if (path.indexOf('~') == -1)
				compName = 'jbComponent'
			if (path.match(/^[^~]+~params~[0-9]+$/))
				compName = 'jbParam'
			if (compName && compName.match(/case$/))
				compName = 'case'
			let prop = path.split('~').pop()
			if (!isNaN(Number(prop))) // array value - title as a[i]
				prop = path.split('~').slice(-2)
					.map(x=>x.replace(/\$pipeline/,'').replace(/\$obj/,''))
					.join('[') + ']'
			if (path.match(/\$vars~[0-9]+~val$/))
				prop = jb.tgp.valOfPath(jb.tgp.parentPath(path)).name
			let summary = ''
			if (collapsed && typeof val == 'object')
				summary = ': ' + jb.tgp.summary(path).substr(0,20)
			// if (path.match(/\$vars~[0-9]+$/))
			//  	summary = jb.tgp.summary(path+'~val') || jb.tgp.shortCompNameOfPath(path+'~val')
			if (typeof val == 'function')
				val = val.toString()

			// if (path.match(/\$vars~[0-9]+~val$/))
			// 	return jb.ui.h('div',{},[val.name ,jb.ui.h('span',{class:'treenode-val', title: summary},jb.ui.limitStringLength(summary,50))]);
			if (compName)
				return jb.ui.h('div',{},[prop,jb.ui.h('span',{class:'treenode-val', title: compName+summary},jb.ui.limitStringLength(compName+summary,50))]);
			else if (prop === '$vars')
				return jb.ui.h('div',{},['vars',jb.ui.h('span',{class:'treenode-val', title: summary},jb.ui.limitStringLength(summary,50))]);
			else if (['string','boolean','number'].indexOf(typeof val) != -1)
				return jb.ui.h('div',{},[prop,jb.ui.h('span',{class:'treenode-val', title: ''+val},jb.ui.limitStringLength(''+val,50))]);

			return prop + (Array.isArray(val) ? ` (${val.length})` : '');
		}
		isArray(path) {
			return this.children(path).length > 0;
		}
		children(path) {
			const val = jb.tgp.valOfPath(path)
			if (!val) return []
			return ( /\$vars$/.test(path) ? [] : jb.tgp.arrayChildren(path) || [])
	//        .concat((this.includeCompHeader && this.compHeader(path,val)) || [])
					.concat(this.vars(path,val) || [])
	//				.concat(this.sugarChildren(path,val) || [])
					.concat(this.specialCases(path,val) || [])
					.concat(this.innerProfiles(path) || [])
		}
		move(from,to,ctx) {
			return jb.db.move(jb.tgp.ref(from),jb.tgp.ref(to),ctx)
		}
		disabled(path) {
			return jb.tgp.isDisabled(path)
		}
		icon(path) {
			return jb.tgp.icon(path)
		}
		innerProfiles(path) {
			if (!this.includeCompHeader && path.indexOf('~') == -1)
				path = path + '~impl';

			return jb.tgp.paramsOfPath(path).map(p=> ({ path: path + '~' + p.id, param: p}))
					.filter(e=>jb.tgp.valOfPath(e.path) !== undefined || e.param.mandatory)
					.flatMap(({path})=> Array.isArray(jb.tgp.valOfPath(path)) ? jb.tgp.arrayChildren(path) : [path])
		}
		vars(path,val) {
			if (path.match(/\$vars$/))
				return jb.tgp.arrayChildren(path,true).map(p=>p+'~val')
			if (Array.isArray(jb.path(val,'$vars')))
				return [path+'~$vars']
		}

		specialCases(path,val) {
			if (jb.utils.compName(val) == 'object')
				return Object.getOwnPropertyNames(val)
					.filter(p=>p!='$')
					.filter(p=>p.indexOf('$jb_') != 0)
					.map(p=>path+'~'+p);
			if (jb.utils.compName(val) == 'if')
				return ['then','else']
			return []
		}
	},
})

component('studio.jbEditor', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: 'main',
    layout: layout.horizontalFixedSplit('350px', '100%'),
    controls: [
      studio.jbEditorInteliTree('%$path%'),
      group({
        controls: remote.widget(probe.inOutView(), probePreviewWorker()),
        features: [
          feature.if(not('%$studio/hideProbe%')),
          watchRef('%$studio/hideProbe%')
        ]
      })
    ],
    features: [
      id('jbEditor'),
      css.padding('10'),
      css.height('800', { minMax: 'max' })
    ]
  })
})

component('studio.openJbEditProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: action.switch({
    vars: [
      Var('actualPath', studio.jbEditorPathForEdit('%$path%')),
      Var('paramDef', tgp.paramDef('%$actualPath%'))
    ],
    cases: [
      action.switchCase(endsWith('$vars', '%$path%'), studio.addVariable('%$path%')),
      action.switchCase('%$paramDef/options%', openDialog({
        content: group({
          controls: [
            studio.jbFloatingInputRich('%$actualPath%')
          ],
          features: [
            feature.onEsc(dialog.closeDialog(true)),
            feature.onEnter(dialog.closeDialog(true))
          ]
        }),
        style: dialog.studioJbEditorPopup(),
        features: [
          dialogFeature.autoFocusOnFirstInput(),
          dialogFeature.onClose(popup.regainCanvasFocus())
        ]
      })),
      action.switchCase({
        condition: isOfType('function', tgp.val('%$actualPath%')),
        action: studio.editSource('%$actualPath%')
      }),
      action.switchCase({
        condition: tgp.isOfType('%$actualPath%', 'data,boolean'),
        action: openDialog({
          content: studio.jbFloatingInput('%$actualPath%'),
          style: dialog.studioJbEditorPopup(),
          features: [
            dialogFeature.autoFocusOnFirstInput(),
            dialogFeature.onClose(toggleBooleanValue('%$studio/refreshProbe%'))
          ]
        })
      }),
      action.switchCase({
        vars: [
          Var('ptsOfType', tgp.PTsOfType(tgp.paramType('%$actualPath%')))
        ],
        condition: '%$ptsOfType/length% == 1',
        action: tgp.setComp('%$path%', '%$ptsOfType[0]%')
      })
    ],
    defaultAction: studio.openNewProfileDialog('%$actualPath%', tgp.paramType('%$actualPath%'), {
      mode: 'update',
      onClose: popup.regainCanvasFocus()
    })
  })
})

component('studio.jbEditorInteliTree', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: tree({
    nodeModel: studio.jbEditorNodes('%$path%'),
    style: tree.expandBox(true, '800px'),
    features: [
      variable('popupLauncherCanvas', '%$cmp%'),
      css.class('jb-editor'),
      tree.selection('%$studio/jbEditor/selected%', writeValue('%$probe/path%', '%%'), {
        onRightClick: studio.openJbEditorMenu('%%', '%$path%'),
        autoSelectFirst: true
      }),
      tree.keyboardSelection({
        onEnter: studio.openJbEditProperty('%$studio/jbEditor/selected%'),
        onRightClickOfExpanded: studio.openJbEditorMenu('%%', '%$path%'),
        autoFocus: true,
        applyMenuShortcuts: studio.jbEditorMenu('%%', '%$path%')
      }),
      tree.dragAndDrop(),
      css.width('500', { selector: 'jb-editor' }),
      studio.watchPath('%$path%', 'yes', { allowSelfRefresh: true }),
      watchRef('%$studio/jbEditor/selected%')
    ]
  })
})

component('studio.openComponentInJbEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'}
  ],
  impl: runActions(
    Var('compPath', split('~', { text: '%$path%', part: 'first' })),
    Var('fromPath', '%$fromPath%'),
    openDialog(studio.jbEditorTitle('%$compPath%', 'Inteliscript'), studio.jbEditor('%$compPath%'), {
      style: dialog.studioFloating('jb-editor', '860', { height: '100%' }),
      menu: button({
      action: studio.openJbEditorMenu('%$studio/jbEditor/selected%', '%$path%'),
      style: button.mdcIcon('menu')
    }),
      features: dialogFeature.resizer()
    })
  )
})

component('studio.expandAndSelectFirstChildInJbEditor', {
  type: 'action',
  impl: ctx => {
    const jbEditorElem = document.querySelector('.jb-editor')
    if (!jbEditorElem) return
    const ctxOfTree = ctx.vars.$tree ? ctx : jb.ui.cmpCtxOfElem(jbEditorElem)
    const cmp = ctxOfTree.vars.$tree && ctxOfTree.vars.$tree.cmp;
    if (!cmp) return;
    const path = cmp.getSelected() || ctx.cmpCtx.params.path
    if (!path) return
    const firstChildPath = cmp.model.children(path)[0];
    if (firstChildPath) {
      cmp.selectionEmitter.next(firstChildPath)
      cmp.expandPath(firstChildPath)
    }
    cmp.regainFocus && cmp.regainFocus()
  }
})

component('menu.studioWrapWith', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'type', as: 'string'},
    {id: 'components', as: 'array'}
  ],
  impl: menu.dynamicOptions(If(tgp.isOfType('%$path%', '%$type%'), '%$components%', list()), {
    genericOption: menu.action('Wrap with %%', runActions(tgp.wrap('%$path%', '%%'), studio.expandAndSelectFirstChildInJbEditor(), studio.gotoPath('%$path%', 'close-array')))
  })
})

component('menu.studioWrapWithArray', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: If({
    condition: tgp.canWrapWithArray('%$path%'),
    then: menu.action('Wrap with array', runActions(tgp.wrapWithArray('%$path%'), studio.expandAndSelectFirstChildInJbEditor(), studio.gotoPath('%$path%', 'close-array'))),
    Else: []
  })
})

component('studio.addVariable', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    title: 'New variable',
    content: group({
      controls: [
        editableText('variable name', '%$dialogData/name%', {
          style: editableText.mdcInput(),
          features: [
          feature.onEnter(
            runActions(
              addToArray(tgp.ref('%$path%'), {
                toAdd: obj(prop('$', 'Var'), prop('name', '%$dialogData/name%'), prop('value', ''))
              }),
              dialog.closeDialog(),
              popup.regainCanvasFocus()
            )
          )
        ]
        })
      ],
      features: css.padding('9', '20', { right: '20' })
    }),
    style: dialog.popup(),
    id: 'add variable',
    features: [css.width('300'), dialogFeature.nearLauncherPosition(), dialogFeature.autoFocusOnFirstInput()]
  })
})

component('studio.openJbEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'fromPath', as: 'string'},
    {id: 'newWindow', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    vars: [
      Var('dialogId', If('%$newWindow%', '', 'jb-editor')),
      Var('fromPath', '%$fromPath%')
    ],
    title: studio.jbEditorTitle('%$path%', 'Inteliscript'),
    content: studio.jbEditor('%$path%'),
    style: dialog.studioFloating('%$dialogId%', '860', { height: '100%' }),
    menu: button({ action: studio.openJbEditorMenu('%$path%', '%$path%'), style: button.mdcIcon('menu') }),
    features: dialogFeature.resizer()
  })
})

component('studio.jbEditorPathForEdit', {
  type: 'data',
  description: 'in case of array, use extra element path',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const ar = jb.tgp.valOfPath(path)
    return Array.isArray(ar) ? path + '~' + ar.length : path
  }
})

component('studio.openJbEditorMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'root', as: 'string'}
  ],
  impl: menu.openContextMenu(studio.jbEditorMenu('%$path%', '%$root%'), {
    features: dialogFeature.onClose(popup.regainCanvasFocus())
  })
})

component('studio.jbEditorNodes', {
  type: 'tree.node-model',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	new jb.studio.jbEditorTree(path,true)
})

component('studio.jbEditorTitle', {
  type: 'control',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'prefix', as: 'string'}
  ],
  impl: group({
    layout: layout.horizontal('9'),
    controls: [
      text('%$prefix%'),
      button({
        title: ctx => {
          const path = ctx.cmpCtx.params.path
          const title = jb.tgp.shortTitle(path) || '',compName = jb.tgp.shortCompNameOfPath(path) || ''
          return title == compName ? title : compName + ' ' + title
        },
        action: runActions(writeValue('%$studio/profile_path%', '%$path%'), studio.openControlTree()),
        style: button.href(),
        features: feature.hoverTitle('%$path%')
      }),
      menu.control({
        menu: menu.menu({
          options: [
            menu.action('pick context', studio.pick(), { icon: icon('Selection', { type: 'mdi' }) })
          ],
          icon: icon('undo')
        }),
        style: menuStyle.toolbar(),
        features: css.margin({ left: '100' })
      }),
      editableBoolean({
        databind: '%$studio/hideProbe%',
        style: editableBoolean.buttonXV({
          yesIcon: icon('ArrowCollapseRight', { type: 'mdi' }),
          noIcon: icon('ArrowCollapseLeft', { type: 'mdi' }),
          buttonStyle: button.mdcFloatingAction(20, true)
        }),
        title: 'hide input-output',
        textForTrue: 'hide probe',
        textForFalse: 'show probe',
        features: css('>*>svg { transform: scale(0.5,0.5) }')
      })
    ]
  })
})