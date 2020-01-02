(function() {
jb.ns('tree')

jb.component('tree', { /* tree */
  type: 'control',
  params: [
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.expandBox(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: context => {
	  const tree = {}
	  const ctx = context.setVars({ $tree: tree })
	  const nodeModel = ctx.params.nodeModel()
	  if (!nodeModel)
	  	return jb.logError('missing nodeModel in tree',ctx);
	  return jb.ui.ctrl(ctx, {
			init: cmp => {
				cmp.model = nodeModel
				cmp.flipExpandCollapse = e => {
					const path = cmp.elemToPath(e.target)
					if (!path) debugger
					cmp.expanded[path] = !(cmp.expanded[path]);
					cmp.setState();
				}
				cmp.expanded = { [nodeModel.rootPath] : true }
				cmp.selectionEmitter = new jb.rx.Subject()
				tree.redraw = cmp.redraw = () => cmp.setState()
				tree.cmp = cmp

				cmp.expandPath = path => {
					let changed = false
					path.split('~').reduce((base, x) => {
							const inner = base ? (base + '~' + x) : x;
							changed = changed || (!cmp.expanded[inner])
							cmp.expanded[inner] = true;
							return inner;
						},'')
					if (changed) cmp.redraw()
					return changed
				}
	
				cmp.elemToPath = el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))
			},
			css: '{user-select: none}'
		})
	}
})

class TreeRenderer {
	constructor(args) {
		Object.assign(this,args)
		this.model = this.cmp.model
	}
	renderTree() {
		const {model,h} = this
		if (this.noHead) 
			return h('div',{}, model.children(model.rootPath).map(childPath=> this.renderNode(childPath)))
		return this.renderNode(model.rootPath)
	}
	renderNode(path) {
		const {cmp,model,h} = this
		const disabled = model.disabled && model.disabled(path) ? 'jb-disabled' : ''
		const clz = ['treenode', model.isArray(path) ? 'jb-array-node': '',disabled].filter(x=>x).join(' ')
		const children = cmp.expanded[path] ? [h('div',{ class: 'treenode-children'} ,
			model.children(path).map(childPath=>this.renderNode(childPath)))] : []

		return h('div',{class: clz, path}, [ this.renderLine(path), ...children ] )
	}
}

jb.component('tree.plain', { /* tree.plain */
  type: 'tree.style',
  params: [
	{id: 'showIcon', as: 'boolean'},
	{id: 'noHead', as: 'boolean'},
  ],
  impl: (ctx,showIcon,noHead) => ctx.run(customStyle({
	template: (cmp,state,h) => {
		function renderLine(path) {
			const model = cmp.model
			const icon = model.icon && model.icon(path) || 'radio_button_unchecked';
			return h('div',{ class: `treenode-line`},[
				model.isArray(path) ? h('i',{class:'material-icons noselect flip-icon', onclick: 'flipExpandCollapse', path },
					cmp.expanded[path] ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : h('span',{class: 'no-children-holder'}),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!cmp.expanded[path])),
			])
		}
		return new TreeRenderer({cmp,h,showIcon,noHead,renderLine}).renderTree(cmp.model.rootPath)
	},
	css: `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -1px }

	|>.treenode-label .treenode-val { color: red; padding-left: 4px; }
	|>.treenode-line { display: flex; box-orient: horizontal; padding-bottom: 3px; align-items: center }

	|>.treenode { display: block }
	|>.flip-icon { font-size: 16px; margin-right: 2px;}
	|>.treenode-icon { font-size: 16px; margin-right: 2px; }

	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  { background: #D9E8FB;}
	`
  }))
})

jb.component('tree.expand-box', {
	type: 'tree.style',
	params: [
	  {id: 'showIcon', as: 'boolean'},
	  {id: 'noHead', as: 'boolean'},
	  {id: 'lineWidth', as: 'string', defaultValue: '300px'},
	],
	impl: (ctx,showIcon,noHead,lineWidth) => ctx.run(customStyle({
	  template: (cmp,state,h) => {
		function renderLine(path) {
			const model = cmp.model
			const icon = model.icon && model.icon(path) || 'radio_button_unchecked';
			const nochildren = model.isArray(path) ? '' : ' nochildren'
			const collapsed = cmp.expanded[path] ? '' : ' collapsed';
			const showIconClass = showIcon ? ' showIcon' : '';

			return h('div',{ class: `treenode-line${collapsed}`},[
				h('button',{class: `treenode-expandbox${nochildren}${showIconClass}`, onclick: 'flipExpandCollapse', path },[
					h('div',{ class: 'frame'}),
					h('div',{ class: 'line-lr'}),
					h('div',{ class: 'line-tb'}),
				]),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!cmp.expanded[path])),
			])
		}
		return new TreeRenderer({cmp,h,showIcon,noHead,renderLine}).renderTree(cmp.model.rootPath)
	  },
	  css: `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -2px }
	|>.treenode-label .treenode-val { color: red; padding-left: 4px; }
	|>.treenode-line { display: flex; box-orient: horizontal; width: ${lineWidth}; padding-bottom: 3px;}
	  
	|>.treenode { display: block }
	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  { background: #D9E8FB;}
  
	|>.treenode-icon { font-size: 16px; margin-right: 2px; }
	|>.treenode-expandbox { border: none; background: none; position: relative; width:9px; height:9px; padding: 0; vertical-align: top;
		margin-top: 5px;  margin-right: 5px;  cursor: pointer;}
	|>.treenode-expandbox.showIcon { margin-top: 3px }
	|>.treenode-expandbox div { position: absolute; }
	|>.treenode-expandbox .frame { background: #F8FFF9; border-radius: 3px; border: 1px solid #91B193; top: 0; left: 0; right: 0; bottom: 0; }
	|>.treenode-expandbox .line-lr { background: #91B193; top: 4px; left: 2px; width: 5px; height: 1px; }
	|>.treenode-expandbox .line-tb { background: #91B193; left: 4px; top: 2px; height: 5px; width: 1px; display: none;}
	|>.treenode-line.collapsed .line-tb { display: block; }
	|>.treenode.collapsed .line-tb { display: block; }
	|>.treenode-expandbox.nochildren .frame { display: none; }
	|>.treenode-expandbox.nochildren .line-lr { display: none; }
	|>.treenode-expandbox.nochildren .line-tb { display: none;}`
	}))
})
  
jb.component('tree.selection', { /* tree.selection */
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', dynamic: true},
    {id: 'autoSelectFirst', as: 'boolean'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onRightClick', type: 'action', dynamic: true}
  ],
  impl: (ctx,databind) => ({
		onclick: true,
		componentDidUpdate : cmp => cmp.setSelected(cmp.selected),

  		afterViewInit: cmp => {
			const selectedRef = databind()
  			const databindObs = jb.isWatchable(selectedRef) && jb.ui.refObservable(selectedRef,cmp,{srcCtx: ctx}).map(e=>jb.val(e.ref))

			cmp.setSelected = selected => {
				cmp.selected = selected
				if (!cmp.base) return
				jb.ui.findIncludeSelf(cmp.base,'.treenode.selected').forEach(elem=>elem.classList.remove('selected'))
				jb.ui.findIncludeSelf(cmp.base,'.treenode').filter(elem=> elem.getAttribute('path') === selected)
					.forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
			}
	  
		  cmp.selectionEmitter
		  	.merge(databindObs || [])
		  	.merge(cmp.onclick.map(event => cmp.elemToPath(event.target)))
			.distinctUntilChanged()
		  	.filter(x=>x)
		  	.map(x=> jb.val(x))
		  	.subscribe(selected=> {
				cmp.setSelected(selected);
				const changed = cmp.expandPath(selected.split('~').slice(0,-1).join('~'))
				selectedRef && jb.writeValue(selectedRef, selected, ctx);
				ctx.params.onSelection(cmp.ctx.setData(selected));
		  })
		  cmp.onclick.subscribe(_=>	cmp.regainFocus && cmp.regainFocus())

		if (ctx.params.onRightClick.profile)
			cmp.base.oncontextmenu = (e=> {
				jb.ui.wrapWithLauchingElement(ctx.params.onRightClick,
					ctx.setData(cmp.elemToPath(e.target)), e.target)();
				return false;
			});

		  // first auto selection selection
		  var first_selected = jb.val(selectedRef);
		  if (!first_selected && ctx.params.autoSelectFirst) {
			  var first = jb.ui.find(cmp.base.parentNode,'.treenode')[0];
			  first_selected = cmp.elemToPath(first);
		  }
		  if (first_selected)
  			jb.delay(1).then(() => cmp.selectionEmitter.next(first_selected))
  		},
  	})
})

jb.component('tree.keyboard-selection', { /* tree.keyboardSelection */
  type: 'feature',
  params: [
    {id: 'onKeyboardSelection', type: 'action', dynamic: true},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onRightClickOfExpanded', type: 'action', dynamic: true},
    {id: 'autoFocus', type: 'boolean'},
    {id: 'applyMenuShortcuts', type: 'menu.option', dynamic: true}
  ],
  impl: context => ({
			onkeydown: true,
			afterViewInit: cmp=> {
				cmp.base.setAttribute('tabIndex','0');

				const keyDownNoAlts = cmp.onkeydown.filter(e=> !e.ctrlKey && !e.altKey)

				context.vars.$tree.regainFocus = cmp.regainFocus = cmp.getKeyboardFocus = cmp.getKeyboardFocus || (_ => {
					jb.ui.focus(cmp.base,'tree.keyboard-selection regain focus',context);
					return false;
				})

				if (context.params.autoFocus)
					jb.ui.focus(cmp.base,'tree.keyboard-selection init autofocus',context);

				keyDownNoAlts.filter(e=> e.keyCode == 13).subscribe(e =>
							runActionInTreeContext(context.params.onEnter))

				keyDownNoAlts.filter(e=> e.keyCode == 38 || e.keyCode == 40)
					.map(event => {
						const diff = event.keyCode == 40 ? 1 : -1;
						const nodes = jb.ui.findIncludeSelf(cmp.base,'.treenode');
						const selected = jb.ui.findIncludeSelf(cmp.base,'.treenode.selected')[0];
						return cmp.elemToPath(nodes[nodes.indexOf(selected) + diff]) || cmp.selected;
					}).subscribe(x=> cmp.selectionEmitter.next(x))
				// expand collapse
				keyDownNoAlts
					.filter(e=> e.keyCode == 37 || e.keyCode == 39)
					.subscribe(event => {
						const isArray = cmp.model.isArray(cmp.selected);
						if (!isArray || (cmp.expanded[cmp.selected] && event.keyCode == 39))
							runActionInTreeContext(context.params.onRightClickOfExpanded);
						if (isArray && cmp.selected) {
							cmp.expanded[cmp.selected] = (event.keyCode == 39);
							cmp.redraw()
						}
					});

				function runActionInTreeContext(action) {
					jb.ui.wrapWithLauchingElement(action,
						context.setData(cmp.selected), jb.ui.findIncludeSelf(cmp.base,'.treenode.selected>.treenode-line')[0])()
				}
				// menu shortcuts - delay in order not to block registration of other features
		    jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
					if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
					 && (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
						var menu = context.params.applyMenuShortcuts(context.setData(cmp.selected));
						if (menu && menu.applyShortcut && menu.applyShortcut(e))
							return false;  // stop propagation
					}
					return false;  // stop propagation always
				}))
			}
		})
})

jb.component('tree.regain-focus', { /* tree.regainFocus */
  type: 'action',
  impl: ctx => ctx.vars.$tree && ctx.vars.$tree.regainFocus && ctx.vars.$tree.regainFocus()
})

jb.component('tree.redraw', { /* tree.redraw */
  type: 'action',
  params: [
    {id: 'strong', type: 'boolean', as: 'boolean'}
  ],
  impl: (ctx,strong) => {
		jb.log('tree',['redraw',ctx.path, ...arguments]);
		return ctx.vars.$tree && ctx.vars.$tree.redraw && ctx.vars.$tree.redraw(strong)
	}
})

jb.component('tree.expand-path', { 
	type: 'action',
	params: [
	  {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
	],
	impl: (ctx,paths) => ctx.vars.$tree && paths.forEach(path => ctx.vars.$tree.cmp.expandPath(path))
})
  
jb.component('tree.drag-and-drop', { /* tree.dragAndDrop */
  type: 'feature',
  impl: ctx => ({
		onkeydown: true,
		componentDidUpdate : cmp => cmp.drake && (cmp.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children')),
  		afterViewInit: cmp => {
        	const drake = cmp.drake = dragula([], {
				moves: el => jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
	    	})
          	drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
          //jb.ui.findIncludeSelf(cmp.base,'.jb-array-node').map(el=>el.children()).filter('.treenode-children').get();

			drake.on('drag', function(el, source) {
				const path = cmp.elemToPath(el.firstElementChild)
				el.dragged = { path, expanded: cmp.expanded[path]}
				delete cmp.expanded[path]; // collapse when dragging
			})

			drake.on('drop', (dropElm, target, source,_targetSibling) => {
				if (!dropElm.dragged) return;
				dropElm.parentNode.removeChild(dropElm);
				cmp.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
				const state = treeStateAsRefs(cmp);
				const targetSibling = _targetSibling; // || target.lastElementChild == dropElm && target.previousElementSibling
				let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : addToIndex(cmp.elemToPath(target.lastElementChild),1);
				// strange dragule behavior fix
				const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
				const targetIndex = Number(targetPath.split('~').pop());
				if (target === source && targetIndex > draggedIndex)
					targetPath = addToIndex(targetPath,-1)
				cmp.model.move(dropElm.dragged.path,targetPath,ctx);
				restoreTreeStateFromRefs(cmp,state);
				cmp.selectionEmitter.next(targetPath)
				dropElm.dragged = null;
				cmp.redraw(true);
		    })

	        // ctrl up and down
    		cmp.onkeydown.filter(e=>
    				e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
    				.subscribe(e=> {
      					const selectedIndex = Number(cmp.selected.split('~').pop());
      					if (isNaN(selectedIndex)) return;
      					const no_of_siblings = Array.from(cmp.base.querySelector('.treenode.selected').parentNode.children).length;
						const diff = e.keyCode == 40 ? 1 : -1;
      					let target = (selectedIndex + diff+ no_of_siblings) % no_of_siblings;
						const state = treeStateAsRefs(tree);
      					cmp.model.move(cmp.selected, cmp.selected.split('~').slice(0,-1).concat([target]).join('~'),ctx)
						  
						restoreTreeStateFromRefs(cmp,state);
      			})
      		},
  	})
})


treeStateAsRefs = cmp => ({
	selected: pathToRef(cmp.model,cmp.selected),
	expanded: jb.entries(cmp.expanded).filter(e=>e[1]).map(e=>pathToRef(cmp.model,e[0]))
})

restoreTreeStateFromRefs = (cmp,state) => {
	if (!cmp.model.refHandler) return
	cmp.selected = refToPath(state.selected);
	cmp.expanded = {};
	state.expanded.forEach(ref=>cmp.expanded[refToPath(ref)] = true)
}

pathToRef = (model,path) => model.refHandler && model.refHandler.refOfPath(path.split('~'))
refToPath = ref => ref && ref.path ? ref.path().join('~') : ''

addToIndex = (path,toAdd) => {
	if (!path) debugger;
	const index = Number(path.slice(-1)) + toAdd;
	return path.split('~').slice(0,-1).concat([index]).join('~')
}


})()
