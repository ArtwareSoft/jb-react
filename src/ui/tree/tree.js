(function() {
jb.ns('tree')

jb.component('tree', {
  type: 'control',
  params: [
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.expandBox(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.noHead',{
	type: 'feature',
	impl: features(calcProp('noHead',true))
})

jb.component('tree.initTree', {
	type: 'feature',
	impl: features(
		variable('treeCmp','%$cmp%'),
		calcProp('model','%$$model/nodeModel()%'),
		method('flipExpandCollapse', runActions(
			({},{$state,ev}) => $state.expanded[ev.path] = !$state.expanded[ev.path],
			//writeValue('%$$state/expanded/{%$ev/path%}%', not('%$$state/expanded/{%$ev/path%}%')),
			action.refreshCmp('%$$state%')
		)),
		userStateProp('expanded', ({},{$state,$props}) => ({...$state.expanded, [$props.model.rootPath]: true})),
		frontEnd.enrichUserEvent(({},{cmp,ev}) => ({ path: cmp.elemToPath(ev.target)})),
		frontEnd.prop('elemToPath',() => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))),
		css('{user-select: none}')
	)
})

jb.component('tree.expandPath', {
	type: 'feature',
	params: [
	  {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
	],
	impl: feature.init(({},{$state},{paths}) => {
//		if ($state.refresh) return
		$state.expanded = $state.expanded || {}
		paths.forEach( path=> path.split('~').reduce((base, x, i) => {
			const inner = i ? (base + '~' + x) : x
			$state.expanded[inner] = true
			return inner
		},''))
	})
})

// **** styles ***
jb.component('tree.plain', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
  ],
  impl: customStyle({
	template: (cmp,{showIcon,noHead,expanded,model,selected},h) => {
		function renderLine(path) {
			const _icon = model.icon(path) || 'radio_button_unchecked'
			return h('div',{ class: `treenode-line`},[
				model.isArray(path) ? h('i#material-icons noselect flip-icon', { onclick: 'flipExpandCollapse', path },
					expanded[path] ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : h('span',{class: 'no-children-holder'}),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, _icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!expanded[path])),
			])
		}
		return new TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	},
	css: `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -1px }

	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; padding-bottom: 3px; align-items: center }

	|>.treenode { display: block }
	|>.flip-icon { font-size: 16px; margin-right: 2px;}
	|>.treenode-icon { font-size: 16px; margin-right: 2px; }

	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  { 
		color: var(--jb-menu-selectionForeground); background: var(--jb-menu-selectionBackground)}
	`,
	features: tree.initTree()
  })
})

jb.component('tree.expandBox', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
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
						h('div#frame'),h('div#line-lr'),h('div#line-tb')
					]
				),
				...(showIcon ? [h('i#material-icons treenode-icon',{}, _icon)] : []),
				h('span#treenode-label',{}, model.title(path,!expanded[path])),
			])
		}
		return new TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	  },
	  css: ({},{},{lineWidth}) => `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -2px }
	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; width: ${lineWidth}; padding-bottom: 3px;}

	|>.treenode { display: block }
	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  
		{ color: var(--jb-menu-selectionForeground); background: var(--jb-menu-selectionBackground)}

	|>.treenode-icon { font-size: 16px; margin-right: 2px; }
	|>.treenode-expandbox { border: none; background: none; position: relative; width:9px; height:9px; padding: 0; vertical-align: top;
		margin-top: 5px;  margin-right: 5px;  cursor: pointer;}
	|>.treenode-expandbox.showIcon { margin-top: 3px }
	|>.treenode-expandbox div { position: absolute; }
	|>.treenode-expandbox .frame { background: var(--jb-menu-background); border-radius: 3px; border: 1px solid var(--jb-expandbox-background); top: 0; left: 0; right: 0; bottom: 0; }
	|>.treenode-expandbox .line-lr { background: var(--jb-expandbox-background); top: 4px; left: 2px; width: 5px; height: 1px; }
	|>.treenode-expandbox .line-tb { background: var(--jb-expandbox-background); left: 4px; top: 2px; height: 5px; width: 1px; display: none;}
	|>.treenode-line.collapsed .line-tb { display: block; }
	|>.treenode.collapsed .line-tb { display: block; }
	|>.treenode-expandbox.nochildren .frame { display: none; }
	|>.treenode-expandbox.nochildren .line-lr { display: none; }
	|>.treenode-expandbox.nochildren .line-tb { display: none;}`,
		features: tree.initTree()
	}),
})

// helper for styles
class TreeRenderer {
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
		const children = expanded[path] ? [h('div#treenode-children', {} ,
			model.children(path).map(childPath=>this.renderNode(childPath)))] : []

		return h('div',{class: clz, path, ...expanded[path] ? {expanded: true} :{} }, [ this.renderLine(path), ...children ] )
	}
}

// ******** tree features

jb.component('tree.selection', {
	type: 'feature',
	params: [
	  {id: 'databind', as: 'ref', dynamic: true},
	  {id: 'onSelection', type: 'action', dynamic: true},
	  {id: 'onRightClick', type: 'action', dynamic: true},
	  {id: 'autoSelectFirst', type: 'boolean'},
	],
	impl: features(
	  method('onSelection', runActions( If(isRef('%$databind()%'),writeValue('%$databind()%','%%')), call('onSelection'))),
	  method('onRightClick', runActions( If(isRef('%$databind()%'),writeValue('%$databind()%','%%')), call('onRightClick'))),
	  userStateProp({
		  id: 'selected',
		  phase: 20, // after other props
		  value: (ctx,{$props,$state},{databind, autoSelectFirst}) => jb.val(databind()) || $state.selected || 
			(autoSelectFirst && $props.noHead ? $props.model.children($props.model.rootPath)[0] : $props.model.rootPath )
	  }),
	  followUp.flow(source.data('%$$props/selected%'),
		  rx.filter(and('%$autoSelectFirst%','%$$state/refresh%')),
		  sink.BEMethod('onSelection')
	  ),
	  frontEnd.method('applyState', ({},{cmp}) => {
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode.selected'))
		  .forEach(elem=>elem.classList.remove('selected'))
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode'))
		  .filter(elem=> elem.getAttribute('path') == cmp.state.selected)
		  .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
	  }),
	  frontEnd.method('setSelected', ({data},{cmp}) => {
		  cmp.state.selected = data
		  cmp.runFEMethod('applyState')
	  }),
  
	  frontEnd.prop('selectionEmitter', rx.subject()),
	  frontEnd.flow(
		source.frontEndEvent('contextmenu'), 
		rx.map(tree.pathOfElem('%target%')), rx.filter('%%'), 
		sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
	  ),
	  frontEnd.flow(
		  rx.merge( 
			rx.pipe(source.frontEndEvent('click'), rx.map(tree.pathOfElem('%target%')), rx.filter('%%')),
			source.subject('%$cmp.selectionEmitter%')
		  ),
		  rx.filter('%%'),rx.distinctUntilChanged(),
		  sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
	  )
	)
})
  
jb.component('tree.keyboardSelection', {
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
	  htmlAttribute('tabIndex',0),
	  method('onEnter', call('onEnter')),
	  method('applyMenuShortcuts', call('applyMenuShortcuts')),
	  method('expand', (ctx,{cmp,$props,$state},{onRightClickOfExpanded}) => {
		const {expanded} = $state, selected = ctx.data
		$state.selected = selected
		if ($props.model.isArray(selected) && !expanded[selected]) {
			expanded[selected] = true
			cmp.refresh($state)
		} else {
			onRightClickOfExpanded(ctx.setData(selected))
		}
	  }),
	  method('collapse', ({data},{cmp,$state}) => {
		const {expanded} = $state, selected = data
		$state.selected = selected
		if (expanded[selected]) {
			delete expanded[selected]
			cmp.refresh($state)
		}
	  }),
	  frontEnd.prop('onkeydown', rx.pipe(
		  source.frontEndEvent('keydown'), rx.filter(not('%ctrlKey%')), rx.filter(not('%altKey%')), frontEnd.addUserEvent() )),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==13'), rx.filter('%$cmp.state.selected%'), sink.BEMethod('onEnter','%$cmp.state.selected%') ),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter(inGroup(list(38,40),'%keyCode%')),
		rx.map(tree.nextSelected(If('%keyCode%==40',1,-1))), 
		sink.subjectNext('%$cmp.selectionEmitter%')
	  ),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==39'), sink.BEMethod('expand','%$cmp.state.selected%')),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==37'), sink.BEMethod('collapse','%$cmp.state.selected%')),
	  frontEnd.flow(source.frontEndEvent('click'), sink.FEMethod('regainFocus')),

	  frontEnd.method('regainFocus', action.focusOnCmp('tree regain focus')),
	  frontEnd.init(If('%$autoFocus%', action.focusOnCmp('tree autofocus') )),
	  frontEnd.init((ctx,{cmp})=>{
			// menu shortcuts - delay in order not to block registration of other features
			jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
				if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
						&& (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
					ctx.run(action.runBEMethod('applyMenuShortcuts',() => cmp.state.selected))
					// const menu = applyMenuShortcuts(ctx.setData(cmp.state.selected));
					// if (menu && menu.applyShortcut && menu.applyShortcut(e))
					// 	return false  // stop propagation
				}
				return false  // stop propagation
			}))
	  })
	)
})

jb.component('tree.dragAndDrop', {
  type: 'feature',
  impl: features(
		htmlAttribute('tabIndex',0),
		method('moveItem', tree.moveItem('%from%','%to%')),
	  	frontEnd.flow(
			source.frontEndEvent('keydown'), 
			rx.filter('%ctrlKey%'),
			rx.filter(inGroup(list(38,40),'%keyCode%')),
			rx.map(obj(
				prop('from', tree.nextSelected(0)),
				prop('to', tree.nextSelected(If('%keyCode%==40',1,-1)))
			)),
			rx.filter(tree.sameParent('%from%','%to%')),     
			sink.BEMethod('moveItem','%%')
		),
		frontEnd.onRefresh( (ctx,{cmp}) => cmp.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children')),
		frontEnd.init( (ctx,{cmp}) => {
        	const drake = cmp.drake = dragula([], {
				moves: el => jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
	    	})
          	drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
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

jb.component('tree.nextSelected', {
	type: 'data:0',
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

jb.component('tree.pathOfInteractiveItem', {
	type: 'data',
	descrition: 'path of the clicked/dragged item using event.target',
	impl: tree.pathOfElem('%$ev/target%')
})

jb.component('tree.pathOfElem', {
	type: 'data:0',
	descrition: 'FE action',
	params: [
		{id: 'elem'}
	],
	impl: (ctx,el) => ctx.vars.cmp && ctx.vars.cmp.elemToPath && ctx.vars.cmp.elemToPath(el)
})

jb.component('tree.sameParent', { 
	descrition: 'check if two paths have the same parent',
	type: 'boolean',
	params: [
		{id: 'path1', as: 'string'},
		{id: 'path2', as: 'string'}
	],
	impl: (ctx,path1,path2) => (path1.match(/(.*?)~[0-9]*$/)||[])[1] == (path2.match(/(.*?)~[0-9]*$/)||[])[1]
})

jb.component('tree.regainFocus', {
	type: 'action',
	impl: action.focusOnCmp('regain focus','%$treeCmp/cmpId%')
})
  
jb.component('tree.redraw', {
	type: 'action',
	params: [
	  {id: 'strong', type: 'boolean', as: 'boolean'}
	],
	impl: (ctx,strong) => {
		  jb.log('tree',['redraw',ctx.path, ...arguments]);
		  return ctx.vars.$tree && ctx.vars.$tree.redraw && ctx.vars.$tree.redraw(strong)
	  }
})
  
jb.component('tree.moveItem', {
	type: 'action',
	descrition: 'move item in backend, changing also the state of selected and expanded',
	params: [
		{id: 'from', as: 'string'},
		{id: 'to', as: 'string'},
	],
	impl: (ctx,from,to) => {
		const {cmp,$state} = ctx.vars
		const model = cmp.renderProps.model
		const stateAsRefs = pathsToRefs($state)
		model.move(from,to,ctx)
		const state = refsToPaths(stateAsRefs)
		cmp.refresh(state)

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

})()
