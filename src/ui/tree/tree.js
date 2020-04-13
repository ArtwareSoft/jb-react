(function() {
jb.ns('tree')

jb.component('tree', {
  type: 'control',
  params: [
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.expandBox({}), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: context => {
	  const tree = {}
	  const ctx = context.setVars({ $tree: tree })
	  const nodeModel = ctx.params.nodeModel()
	  if (!nodeModel)
	  	return jb.logError('missing nodeModel in tree',ctx);
	  return jb.ui.ctrl(ctx, features(
			defHandler('flipExpandCollapse', (ctx,{cmp}) => {
				const path = cmp.elemToPath(event.target)
				if (!path) debugger
				cmp.state.expanded[path] = !(cmp.state.expanded[path]);
				cmp.refresh(null,{srcCtx: ctx.componentContext});
			}),
			interactiveProp('model', '%$$model.nodeModel%'),
			interactive( (ctx,{cmp}) => {
				cmp.state.expanded =  { [cmp.model.rootPath] : true }
				tree.cmp = cmp
				cmp.selectionEmitter = jb.callbag.subject()
				tree.redraw = cmp.redraw = () => cmp.refresh(null,{srcCtx: ctx.componentContext})

				cmp.expandPath = path => {
					const changed = jb.ui.treeExpandPath(cmp.state.expanded,path)
					if (changed) cmp.redraw()
					return changed
				}
				cmp.elemToPath = el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))
			}),
			feature.init( (ctx,{cmp}) => {
				cmp.model = nodeModel
				cmp.state.expanded =  cmp.state.expanded || {}
				jb.ui.treeExpandPath(cmp.state.expanded, nodeModel.rootPath)
			}),
			css('{user-select: none}')
		))
	}
})

jb.ui.treeExpandPath = jb.ui.treeExpandPath || ((expanded, path) => {
	let changed = false
	path.split('~').reduce((base, x) => {
			const inner = base ? (base + '~' + x) : x;
			changed = changed || (!expanded[inner])
			expanded[inner] = true;
			return inner;
		},'')
	return changed
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
		const children = cmp.state.expanded[path] ? [h('div',{ class: 'treenode-children'} ,
			model.children(path).map(childPath=>this.renderNode(childPath)))] : []

		return h('div',{class: clz, path}, [ this.renderLine(path), ...children ] )
	}
}

jb.component('tree.plain', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
    {id: 'noHead', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,showIcon,noHead) => ctx.run(customStyle({
	template: (cmp,state,h) => {
		function renderLine(path) {
			const model = cmp.model
			const icon = model.icon && model.icon(path) || 'radio_button_unchecked';
			return h('div',{ class: `treenode-line`},[
				model.isArray(path) ? h('i',{class:'material-icons noselect flip-icon', onclick: 'flipExpandCollapse', path },
					cmp.state.expanded[path] ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : h('span',{class: 'no-children-holder'}),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!cmp.state.expanded[path])),
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

jb.component('tree.expandBox', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
    {id: 'noHead', as: 'boolean', type: 'boolean'},
    {id: 'lineWidth', as: 'string', defaultValue: '300px'}
  ],
  impl: (ctx,showIcon,noHead,lineWidth) => ctx.run(customStyle({
	  template: (cmp,state,h) => {
		function renderLine(path) {
			const model = cmp.model
			const icon = model.icon && model.icon(path) || 'radio_button_unchecked';
			const nochildren = model.isArray(path) ? '' : ' nochildren'
			const collapsed = cmp.state.expanded[path] ? '' : ' collapsed';
			const showIconClass = showIcon ? ' showIcon' : '';

			return h('div',{ class: `treenode-line${collapsed}`},[
				h('button',{class: `treenode-expandbox${nochildren}${showIconClass}`, onclick: 'flipExpandCollapse', path },[
					h('div',{ class: 'frame'}),
					h('div',{ class: 'line-lr'}),
					h('div',{ class: 'line-tb'}),
				]),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!cmp.state.expanded[path])),
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

jb.component('tree.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', dynamic: true},
    {id: 'autoSelectFirst', as: 'boolean', type: 'boolean'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onRightClick', type: 'action', dynamic: true}
  ],
  impl: features(
    ctx => ({
		  onclick: true,
		  componentDidUpdate : cmp => cmp.setSelected(cmp.state.selected),
	  }),
    feature.init(
        (ctx,{cmp},{databind}) => {
		cmp.state.expanded = cmp.state.expanded||{}
		const selectedPath = jb.val(databind())
		selectedPath && jb.ui.treeExpandPath(cmp.state.expanded, selectedPath.split('~').slice(0,-1).join('~'))
	  },
        5
      ),
    interactive(
        (ctx,{cmp},{databind,autoSelectFirst,onSelection,onRightClick}) => {
			const selectedRef = databind()
			const {pipe,map,filter,subscribe,merge,distinctUntilChanged} = jb.callbag
			const databindObs = jb.isWatchable(selectedRef) &&
				pipe(jb.ui.refObservable(selectedRef,cmp,{srcCtx: ctx}), map(e=>jb.val(e.ref)))

			cmp.setSelected = selected => {
				cmp.state.selected = selected
				if (!cmp.base) return
				jb.ui.findIncludeSelf(cmp.base,'.treenode.selected').forEach(elem=>elem.classList.remove('selected'))
				jb.ui.findIncludeSelf(cmp.base,'.treenode').filter(elem=> elem.getAttribute('path') === selected)
					.forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
			}
			cmp.getSelected = () => cmp.state.selected = cmp.elemToPath(jb.ui.findIncludeSelf(cmp.base,'.treenode.selected')[0])


			pipe(
				merge(
					cmp.selectionEmitter, databindObs, pipe(cmp.onclick, map(event => cmp.elemToPath(event.target)))),
				distinctUntilChanged(),
				filter(x=>x),
				map(x=> jb.val(x)),
				subscribe(selected=> {
					cmp.setSelected(selected);
					selectedRef && jb.writeValue(selectedRef, selected, ctx);
					onSelection(cmp.ctx.setData(selected));
			}))

			jb.subscribe(cmp.onclick, () => cmp.regainFocus && cmp.regainFocus())

			if (onRightClick.profile)
				cmp.base.oncontextmenu = (e=> {
					jb.ui.wrapWithLauchingElement(onRightClick,
						ctx.setData(cmp.elemToPath(e.target)), e.target)();
					return false;
				});

			// first auto selection selection
			var first_selected = jb.val(selectedRef);
			if (!first_selected && autoSelectFirst) {
				var first = jb.ui.find(cmp.base.parentNode,'.treenode')[0];
				first_selected = cmp.elemToPath(first);
			}
			if (first_selected)
				jb.delay(1).then(() => cmp.selectionEmitter.next(first_selected))
  	   }
      )
  )
})

jb.component('tree.keyboardSelection', {
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
			templateModifier: vdom => {
				vdom.attributes = vdom.attributes || {};
				vdom.attributes.tabIndex = -1
			},
			afterViewInit: cmp=> {
				const {pipe,map,filter,subscribe} = jb.callbag
				const keyDownNoAlts = pipe(cmp.onkeydown, filter(e=> !e.ctrlKey && !e.altKey))

				context.vars.$tree.regainFocus = cmp.regainFocus = cmp.getKeyboardFocus = cmp.getKeyboardFocus || (_ => {
					jb.ui.focus(cmp.base,'tree.keyboard-selection regain focus',context);
					return false;
				})

				if (context.params.autoFocus)
					jb.ui.focus(cmp.base,'tree.keyboard-selection init autofocus',context);

				pipe(keyDownNoAlts, filter(e=> e.keyCode == 13), subscribe(e =>
					runActionInTreeContext(context.params.onEnter)))

				pipe(keyDownNoAlts, filter(e=> e.keyCode == 38 || e.keyCode == 40),
					map(event => {
						const diff = event.keyCode == 40 ? 1 : -1;
						const nodes = jb.ui.findIncludeSelf(cmp.base,'.treenode');
						const selectedEl = jb.ui.findIncludeSelf(cmp.base,'.treenode.selected')[0];
						return cmp.elemToPath(nodes[nodes.indexOf(selectedEl) + diff]) || cmp.getSelected();
					}), subscribe(x=> cmp.selectionEmitter.next(x)))
				// expand collapse
				pipe(keyDownNoAlts, filter(e=> e.keyCode == 37 || e.keyCode == 39), subscribe(event => {
						const selected = cmp.getSelected()
						const isArray = cmp.model.isArray(selected);
						if (!isArray || (cmp.state.expanded[selected] && event.keyCode == 39))
							return runActionInTreeContext(context.params.onRightClickOfExpanded);
						if (isArray && selected) {
							cmp.state.expanded[selected] = (event.keyCode == 39);
							cmp.redraw()
						}
				}))

				function runActionInTreeContext(action) {
					console.log(cmp.getSelected())
					jb.ui.wrapWithLauchingElement(action,
						context.setData(cmp.getSelected()), jb.ui.findIncludeSelf(cmp.base,'.treenode.selected>.treenode-line')[0])()
				}
				// menu shortcuts - delay in order not to block registration of other features
		    jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
					if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
					 && (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
						var menu = context.params.applyMenuShortcuts(context.setData(cmp.getSelected()));
						if (menu && menu.applyShortcut && menu.applyShortcut(e))
							return false  // stop propagation
					}
					return false  // stop propagation always
				}))
			}
		})
})

jb.component('tree.regainFocus', {
  type: 'action',
  impl: ctx => ctx.vars.$tree && ctx.vars.$tree.regainFocus && ctx.vars.$tree.regainFocus()
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

jb.component('tree.expandPath', {
  type: 'action',
  params: [
    {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
  ],
  impl: (ctx,paths) => ctx.vars.cmp && paths.forEach(path => jb.ui.treeExpandPath(ctx.vars.cmp.state.expanded, path))
})

jb.component('tree.pathOfInteractiveItem', {
  descrition: 'path of the clicked/dragged item using event.target',
  type: 'data',
  impl: ctx => {
		const {cmp,ev} = ctx.vars
		return cmp && cmp.elemToPath && ev && ev.target && cmp.elemToPath(ev.target)
	}
})

jb.component('tree.dragAndDrop', {
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
				el.dragged = { path, expanded: cmp.state.expanded[path]}
				delete cmp.state.expanded[path]; // collapse when dragging
			})

			drake.on('drop', (dropElm, target, source,_targetSibling) => {
				if (!dropElm.dragged) return;
				dropElm.parentNode.removeChild(dropElm);
				cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
				const state = treeStateAsRefs(cmp);
				const targetSibling = _targetSibling; // || target.lastElementChild == dropElm && target.previousElementSibling
				let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : 
					target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
				// strange dragule behavior fix
				const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
				const targetIndex = Number(targetPath.split('~').pop()) || 0;
				if (target === source && targetIndex > draggedIndex)
					targetPath = addToIndex(targetPath,-1)
				cmp.model.move(dropElm.dragged.path,targetPath,ctx);
				restoreTreeStateFromRefs(cmp,state);
				cmp.selectionEmitter.next(targetPath)
				dropElm.dragged = null;
				cmp.redraw(true);
		    })

			// ctrl up and down
			const {pipe,filter,subscribe} = jb.callbag
    		pipe(cmp.onkeydown, filter(e=>e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40)), subscribe(e=> {
				const selected = cmp.getSelected()
				const selectedIndex = Number(selected.split('~').pop());
				if (isNaN(selectedIndex)) return;
				const no_of_siblings = Array.from(cmp.base.querySelector('.treenode.selected').parentNode.children).length;
				const diff = e.keyCode == 40 ? 1 : -1;
				const target = (selectedIndex + diff+ no_of_siblings) % no_of_siblings;
				//const state = treeStateAsRefs(tree);
				const targetPath = selected.split('~').slice(0,-1).concat([target]).join('~')
				cmp.model.move(selected, targetPath,ctx)
				cmp.selectionEmitter && cmp.selectionEmitter.next(targetPath)
				jb.delay(10).then(()=>cmp.regainFocus && cmp.regainFocus())
				//restoreTreeStateFromRefs(cmp,state);
			}))
      	},
  	})
})

treeStateAsRefs = cmp => ({
	selected: pathToRef(cmp.model,cmp.getSelected()),
	expanded: jb.entries(cmp.state.expanded).filter(e=>e[1]).map(e=>pathToRef(cmp.model,e[0]))
})

restoreTreeStateFromRefs = (cmp,state) => {
	if (!cmp.model.refHandler) return
	refToPath(state.selected) && cmp.setSelected(refToPath(state.selected));
	cmp.state.expanded = {};
	state.expanded.forEach(ref=>cmp.state.expanded[refToPath(ref)] = true)
}

pathToRef = (model,path) => path && model.refHandler && model.refHandler.refOfPath(path.split('~'))
refToPath = ref => ref && ref.path ? ref.path().join('~') : ''

addToIndex = (path,toAdd) => {
	if (!path) debugger;
	if (isNaN(Number(path.slice(-1)))) return path
	const index = Number(path.slice(-1)) + toAdd;
	return path.split('~').slice(0,-1).concat([index]).join('~')
}


})()
