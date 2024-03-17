using('ui-core')

extension('ui', 'tree', {
	TreeRenderer: class TreeRenderer {
		constructor(args) {
			Object.assign(this,args)
		}
		renderTree() {
			const {model,h} = this
			if (this.noHead)
				return h('div',{}, model.children(model.rootPath).map(childPath=> this.renderNode(childPath)))
			return this.renderNode(model.rootPath)
		}
		renderNode(path) {
			const {expanded,model,h} = this
			const disabled = model.disabled && model.disabled(path) ? 'jb-disabled' : ''
			const selected = path == this.selected ? 'selected' : ''
			const clz = ['treenode', model.isArray(path) ? 'jb-array-node': '',disabled, selected].filter(x=>x).join(' ')
			const children = expanded[path] && model.children(path).length ? [h('div.treenode-children', {} ,
				model.children(path).map(childPath=>this.renderNode(childPath)))] : []
	
			return h('div',{class: clz, path, ...expanded[path] ? {expanded: true} :{} }, [ this.renderLine(path), ...children ] )
		}
	}
})

component('tree', {
  type: 'control',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree-style', defaultValue: tree.expandBox(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('tree.noHead', {
  type: 'feature',
  impl: features(calcProp('noHead', true))
})

component('tree.initTree', {
  type: 'feature',
  impl: features(
    variable('treeCmp', '%$cmp%'),
    calcProp('model', '%$$model/nodeModel()%'),
    method('flipExpandCollapse', runActions(
      ({},{$state,ev}) => $state.expanded[ev.path] = !$state.expanded[ev.path],
      action.refreshCmp('%$$state%')
    )),
    userStateProp('expanded', ({},{$state,$props}) => ({
			 ...$state.expanded, 
			 ...(!$state.refresh && {[$props.model.rootPath]: true}) 
		})),
    frontEnd.enrichUserEvent(({},{cmp,ev}) => {
			const el = jb.ui.querySelectorAll(ev.target,'.selected')[0] || ev.target
			const labelEl = jb.ui.querySelectorAll(el,'.treenode-label')[0] || el
			ev.fixedTarget = labelEl
			return { path: cmp.elemToPath(el) }
		}),
    frontEnd.prop('elemToPath', () => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))),
    css('{user-select: none}')
  )
})

component('tree.expandPath', {
  type: 'feature',
  params: [
    {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
  ],
  impl: feature.init(({},{$state},{paths}) => {
//		if ($state.refresh) return
		$state.expanded = $state.expanded || {}
		;(paths || []).forEach( path=> path.split('~').reduce((base, x, i) => {
			const inner = i ? (base + '~' + x) : x
			$state.expanded[inner] = true
			return inner
		},''))
	})
})

// **** styles ***
component('tree.plain', {
  type: 'tree-style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean', byName: true}
  ],
  impl: customStyle({
    template: (cmp,{showIcon,noHead,expanded,model,selected},h) => {
		function renderLine(path) {
			const _icon = model.icon(path) || 'radio_button_unchecked'
			return h('div',{ class: `treenode-line`},[
				model.isArray(path) ? h('i.material-icons noselect flip-icon', { onclick: 'flipExpandCollapse', path },
					expanded[path] ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : h('span',{class: 'no-children-holder'}),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, _icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!expanded[path])),
			])
		}
		return new jb.ui.TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	},
    css: `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -1px }

	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; padding-bottom: 3px; align-items: center }

	|>.treenode { display: block }
	|>.flip-icon { font-size: 16px; margin-right: 2px;}
	|>.treenode-icon { font-size: 16px; margin-right: 2px; }

	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  { 
		color: var(--jb-menu-selection-fg); background: var(--jb-menu-selection-bg)}
	`,
    features: tree.initTree()
  })
})

component('tree.expandBox', {
  type: 'tree-style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean', byName: true},
    {id: 'lineWidth', as: 'string', defaultValue: '300px'}
  ],
  impl: customStyle({
    template: (cmp,{showIcon,noHead,expanded,model,selected},h) => {
		function renderLine(path) {
			const _icon = model.icon(path) || 'radio_button_unchecked';
			const nochildren = model.isArray(path) ? '' : ' nochildren'
			const collapsed = expanded[path] ? '' : ' collapsed';
			const showIconClass = showIcon ? ' showIcon' : '';

			return h('div',{ class: `treenode-line${collapsed}`},[
				h('button',{class: `treenode-expandbox${nochildren}${showIconClass}`, onclick: 'flipExpandCollapse', path },
					[ 
						h('div.frame'),h('div.line-lr'),h('div.line-tb')
					]
				),
				...(showIcon ? [h('i.material-icons treenode-icon',{}, _icon)] : []),
				h('span.treenode-label',{}, model.title(path,!expanded[path])),
			])
		}
		return new jb.ui.TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	  },
    css: ({},{},{lineWidth}) => `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -2px }
	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; width: ${lineWidth}; padding-bottom: 3px;}

	|>.treenode { display: block }
	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  
		{ color: var(--jb-menu-selection-fg); background: var(--jb-menu-selection-bg)}

	|>.treenode-icon { font-size: 16px; margin-right: 2px; }
	|>.treenode-expandbox { border: none; background: none; position: relative; width:9px; height:9px; padding: 0; vertical-align: top;
		margin-top: 5px;  margin-right: 5px;  cursor: pointer;}
	|>.treenode-expandbox.showIcon { margin-top: 3px }
	|>.treenode-expandbox div { position: absolute; }
	|>.treenode-expandbox .frame { background: var(--jb-menu-bg); border-radius: 3px; border: 1px solid var(--jb-expandbox-bg); top: 0; left: 0; right: 0; bottom: 0; }
	|>.treenode-expandbox .line-lr { background: var(--jb-expandbox-bg); top: 4px; left: 2px; width: 5px; height: 1px; }
	|>.treenode-expandbox .line-tb { background: var(--jb-expandbox-bg); left: 4px; top: 2px; height: 5px; width: 1px; display: none;}
	|>.treenode-line.collapsed .line-tb { display: block; }
	|>.treenode.collapsed .line-tb { display: block; }
	|>.treenode-expandbox.nochildren .frame { display: none; }
	|>.treenode-expandbox.nochildren .line-lr { display: none; }
	|>.treenode-expandbox.nochildren .line-tb { display: none;}`,
    features: tree.initTree()
  })
})

component('tree.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', dynamic: true},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onRightClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'}
  ],
  impl: features(
    tree.expandPath(tree.parentPath('%$databind()%')),
    method('onSelection', runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%%')), call('onSelection'))),
    method({
      id: 'onRightClick',
      action: runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%%')), call('onRightClick'))
    }),
    userStateProp({
      id: 'selected',
      value: (ctx,{$props,$state},{databind, autoSelectFirst}) => jb.val(databind()) || $state.selected || 
			(autoSelectFirst && $props.noHead ? $props.model.children($props.model.rootPath)[0] : $props.model.rootPath ),
      phase: 20
    }),
    followUp.flow(
      source.data('%$$props/selected%'),
      rx.filter(and('%$autoSelectFirst%', not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode.selected'))
		  .forEach(elem=>jb.ui.removeClass(elem,'selected'))
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode'))
		  .filter(elem=> elem.getAttribute('path') == cmp.state.selected)
		  .forEach(elem=> {jb.ui.addClass(elem,'selected'); jb.ui.scrollIntoView(elem)})
	  }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
		cmp.base.state.selected = cmp.state.selected = data
		cmp.runFEMethod('applyState')
	  }),
    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('contextmenu'),
      rx.map(tree.pathOfElem('%target%')),
      rx.filter('%%'),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
      source.merge(
        rx.pipe(source.frontEndEvent('click'), rx.map(tree.pathOfElem('%target%')), rx.filter('%%')),
        source.subject('%$cmp.selectionEmitter%')
      ),
      rx.filter('%%'),
      rx.filter(({data},{cmp}) => cmp.state.selected != data),
      rx.distinctUntilChanged(),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
    )
  )
})
  
component('tree.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'onKeyboardSelection', type: 'action', dynamic: true},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onRightClickOfExpanded', type: 'action', dynamic: true},
    {id: 'autoFocus', type: 'boolean'},
    {id: 'applyMenuShortcuts', type: 'menu.option', dynamic: true}
  ],
  impl: features(
    htmlAttribute('tabIndex', 0),
    method('onEnter', call('onEnter')),
    method('runShortcut', (ctx,{path},{applyMenuShortcuts}) => {
		if (!path)
			return jb.logError(`missing path "${path}" in tree`,{ctx})
		const shortCut = applyMenuShortcuts(ctx.setData(path))
		shortCut && shortCut.runShortcut(ctx.data) 
	}),
    method('expand', (ctx,{cmp,$props,$state},{onRightClickOfExpanded}) => {
		const {expanded} = $state, selected = ctx.data
		if (!selected)
			return jb.logError(`missing selected "${selected}" in expand tree`,{ctx})
		$state.selected = selected
		if ($props.model.isArray(selected) && !expanded[selected]) {
			expanded[selected] = true
			cmp.refresh($state,{},ctx)
		} else {
			onRightClickOfExpanded(ctx.setData(selected))
		}
	}),
    method('collapse', (ctx,{cmp,$state}) => {
		const {expanded} = $state, selected = ctx.data
		if (!selected)
			return jb.logError(`missing selected "${selected}" in collapse tree`,{ctx})
		$state.selected = selected
		if (Object.keys(expanded).some(x=>x.indexOf(selected == 0))) {
			delete expanded[selected]
			cmp.refresh($state,{},ctx)
		}
	}),
    frontEnd.prop({
      id: 'onkeydown',
      value: rx.pipe(source.frontEndEvent('keydown'), rx.filter(not('%ctrlKey%')), rx.filter(not('%altKey%')), rx.userEventVar())
    }),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter('%keyCode%==13'),
      rx.filter('%$cmp.state.selected%'),
      sink.BEMethod('onEnter', '%$cmp.state.selected%')
    ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(tree.nextSelected(If('%keyCode%==40', 1, -1))),
      sink.subjectNext('%$cmp.selectionEmitter%')
    ),
    frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==39'), sink.BEMethod('expand', '%$cmp.state.selected%')),
    frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==37'), sink.BEMethod('collapse', '%$cmp.state.selected%')),
    frontEnd.flow(
      source.callbag(({},{cmp}) => 
		  	jb.callbag.create(obs=> cmp.base.onkeydown = ev => { obs(ev); return false } // stop propagation
		)),
      rx.filter(({data}) => (data.ctrlKey || data.altKey || data.keyCode == 46) // Delete
			  && (data.keyCode != 17 && data.keyCode != 18)),
      rx.userEventVar(),
      sink.BEMethod('runShortcut', '%$ev%', obj(prop('path', '%$cmp.state.selected%')))
    ),
    frontEnd.flow(source.frontEndEvent('click'), sink.FEMethod('regainFocus')),
    frontEnd.method('regainFocus', action.focusOnCmp('tree regain focus')),
    frontEnd.var('autoFocus', '%$autoFocus%'),
    frontEnd.init(If('%$autoFocus%', action.focusOnCmp('tree autofocus')))
  )
})

component('tree.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.requireExternalLibrary('dragula.js','css/dragula.css'),
    htmlAttribute('tabIndex', 0),
    method('moveItem', tree.moveItem('%from%', '%to%')),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(
        obj(
          prop('from', tree.nextSelected(0)),
          prop('to', tree.nextSelected(If('%keyCode%==40', 1, -1)))
        )
      ),
      rx.filter(tree.sameParent('%from%', '%to%')),
      sink.BEMethod('moveItem', '%%')
    ),
    frontEnd.var('uiTest', '%$uiTest%'),
    frontEnd.onRefresh((ctx,{cmp}) => cmp.drake && (cmp.drake.containers = jb.ui.querySelectorAll(cmp.base,'.jb-array-node>.treenode-children'))),
    frontEnd.init((ctx,{uiTest, cmp}) => {
		if (uiTest) return
		const drake = cmp.drake = dragula([], {
			moves: el => jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
		})
		drake.containers = jb.ui.querySelectorAll(cmp.base,'.jb-array-node>.treenode-children');
		drake.on('drag', function(el) {
			const path = cmp.elemToPath(el.firstElementChild)
			el.dragged = { path, expanded: cmp.state.expanded[path]}
			delete cmp.state.expanded[path]; // collapse when dragging
		})

		drake.on('drop', (dropElm, target, source,_targetSibling) => {
			if (!dropElm.dragged) return;
			dropElm.parentNode.removeChild(dropElm);
			cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
			const targetSibling = _targetSibling; // || target.lastElementChild == dropElm && target.previousElementSibling
			let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : 
				target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
			// strange dragula behavior fix
			const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
			const targetIndex = Number(targetPath.split('~').pop()) || 0;
			if (target === source && targetIndex > draggedIndex)
				targetPath = addToIndex(targetPath,-1)
			ctx.run(action.runBEMethod('moveItem',() => ({from: dropElm.dragged.path, to: targetPath})))

			function addToIndex(path,toAdd) {
				if (!path) debugger;
				if (isNaN(Number(path.slice(-1)))) return path
				const index = Number(path.slice(-1)) + toAdd;
				return path.split('~').slice(0,-1).concat([index]).join('~')
			}
		})
	})
  )
})

component('tree.nextSelected', {
  type: 'data',
  hidden: true,
  descrition: 'FE action',
  params: [
    {id: 'diff', as: 'number'}
  ],
  impl: (ctx,diff) => {
	  	const {cmp} = ctx.vars
		const nodes = jb.ui.findIncludeSelf(cmp.base,'.treenode')
		const selectedEl = jb.ui.findIncludeSelf(cmp.base,'.treenode.selected')[0]
		return cmp.elemToPath(nodes[nodes.indexOf(selectedEl) + diff])
	}
})

component('tree.pathOfInteractiveItem', {
  type: 'data',
  descrition: 'path of the clicked/dragged item using event.target',
  impl: tree.pathOfElem('%$ev/target%')
})

component('tree.pathOfElem', {
  type: 'data',
  hidden: true,
  descrition: 'FE action',
  params: [
    {id: 'elem'}
  ],
  impl: (ctx,el) => ctx.vars.cmp && ctx.vars.cmp.elemToPath && ctx.vars.cmp.elemToPath(el)
})

component('tree.parentPath', {
  params: [
    {id: 'path', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,path) => path.split('~').slice(0,-1).join('~')
})

component('tree.lastPathElement', {
  params: [
    {id: 'path', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,path) => path.split('~').pop()
})

component('tree.sameParent', {
  descrition: 'check if two paths have the same parent',
  type: 'boolean',
  params: [
    {id: 'path1', as: 'string'},
    {id: 'path2', as: 'string'}
  ],
  impl: (ctx,path1,path2) => (path1.match(/(.*?)~[0-9]*$/)||[])[1] == (path2.match(/(.*?)~[0-9]*$/)||[])[1]
})

component('tree.regainFocus', {
  type: 'action',
  impl: action.focusOnCmp('regain focus', '%$treeCmp/cmpId%')
})
  
component('tree.redraw', {
  type: 'action',
  params: [
    {id: 'strong', type: 'boolean', as: 'boolean'}
  ],
  impl: (ctx,strong) => {
		jb.log('tree redraw',{ cmpId: jb.path(ctx.vars,'$tree.cmpId'), ctx, strong})
		return ctx.vars.$tree && ctx.vars.$tree.redraw && ctx.vars.$tree.redraw(strong)
	}
})
  
component('tree.moveItem', {
  type: 'action',
  descrition: 'move item in backend, changing also the state of selected and expanded',
  params: [
    {id: 'from', as: 'string'},
    {id: 'to', as: 'string'}
  ],
  impl: (ctx,from,to) => {
		const {cmp,$state} = ctx.vars
		const model = cmp.renderProps.model
		const stateAsRefs = pathsToRefs($state)
		model.move(from,to,ctx)
		const state = refsToPaths(stateAsRefs)
		cmp.refresh(state,{},ctx)

		function pathsToRefs({selected,expanded}) {
			return {
				selected: pathToRef(selected),
				expanded: jb.entries(expanded).filter(e=>e[1]).map(e=>pathToRef(e[0]))
		}}
		
		function refsToPaths({selected,expanded}) {
			return {
				selected: refToPath(selected),
				expanded: jb.objFromEntries(expanded.map(ref=>[refToPath(ref), true]))
		}}
		
		function pathToRef(path) { return  path && model.refHandler && model.refHandler.refOfPath(path.split('~')) }
		function refToPath(ref) { return ref && ref.path ? ref.path().join('~') : '' }
	}
})
