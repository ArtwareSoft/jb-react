(function() {
jb.ns('tree')

 //********************* jBart Components

jb.component('tree', { /* tree */
  type: 'control',
  params: [
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.ulLi(), dynamic: true},
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
					cmp.setState({expanded:cmp.expanded[path]});
				}
				cmp.expanded = { [nodeModel.rootPath] : true }
				cmp.selectionEmitter = new jb.rx.Subject()
				tree.redraw = cmp.redraw = () => cmp.setState()

				cmp.elemToPath = el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))
			},
			css: '{user-select: none}'
		})
	}
})

function renderLine({path,cmp,model,h}) {
	const collapsed = cmp.expanded[path] ? '' : ' collapsed';
	const nochildren = model.isArray(path) ? '' : ' nochildren';
	const title = model.title(path,!cmp.expanded[path]);
	const icon = model.icon ? model.icon(path) : 'radio_button_unchecked';
	
	return h('div',{ class: `treenode-line${collapsed}`},[
		h('button',{class: `treenode-expandbox${nochildren}`, onclick: 'flipExpandCollapse', path },[
			h('div',{ class: 'frame'}),
			h('div',{ class: 'line-lr'}),
			h('div',{ class: 'line-tb'}),
		]),
		h('i',{class: 'material-icons', style: 'font-size: 16px; margin-left: -4px; padding-right:2px'}, icon),
		h('span',{class: 'treenode-label'}, title),
	])
}

function renderNode({path,cmp,model,h}) {
	const disabled = model.disabled && model.disabled(path) ? 'jb-disabled' : ''
	const selected = cmp.selected == path ? 'selected' : ''
	const clz = ['treenode', selected, model.isArray(path) ? 'jb-array-node': '',disabled].filter(x=>x).join(' ')
	const children = cmp.expanded[path] ? [h('div',{ class: 'treenode-children'} ,
		model.children(path).map(childPath=>renderNode({path: childPath,cmp,model,h})))] : []
	return h('div',{class: clz, path}, [ renderLine({path,cmp,model,h}), ...children ] )
}

jb.component('tree.ul-li', { /* tree.ulLi */
  type: 'tree.style',
  impl: customStyle({
	features: css.class('jb-control-tree'),
	template: (cmp,state,h) => renderNode({path: cmp.model.rootPath,cmp,model: cmp.model,h})
  })
})

jb.component('tree.no-head', { /* tree.noHead */
  type: 'tree.style',
  impl: customStyle({
	features: css.class('jb-control-tree'),
	template: (cmp,state,h) => h('div',{}, cmp.model.children(cmp.model.rootPath)
		.map(childPath=> renderNode({path: childPath,cmp,model: cmp.model,h})))
	}),
	css: '{user-select: none}'
})

jb.component('tree.selection', { /* tree.selection */
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onRightClick', type: 'action', dynamic: true}
  ],
  impl: (ctx,databind) => ({
	    onclick: true,
  		afterViewInit: cmp => {
		  const selectedRef = databind()

  		  const databindObs = jb.isWatchable(selectedRef) && jb.ui.refObservable(selectedRef,cmp,{srcCtx: ctx}).map(e=>jb.val(e.ref));

		  cmp.selectionEmitter
		  	.merge(databindObs || [])
		  	.merge(cmp.onclick.map(event =>
		  		cmp.elemToPath(event.target)))
		  	.filter(x=>x)
		  	.map(x=>
		  		jb.val(x))
//	  		.distinctUntilChanged()
		  	.subscribe(selected=> {
		  	  if (cmp.selected == selected)
		  	  	return;
			  cmp.selected = selected;
			  selected.split('~').slice(0,-1).reduce(function(base, x) {
				  var path = base ? (base + '~' + x) : x;
				  cmp.expanded[path] = true;
				  return path;
			  },'')
			  if (selectedRef)
				  jb.writeValue(selectedRef, selected, ctx);
			  ctx.params.onSelection(cmp.ctx.setData(selected));
			  cmp.redraw();
		  });

		  cmp.onclick.subscribe(_=>
		  	cmp.regainFocus && cmp.regainFocus()
		  );

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
  			jb.delay(1).then(() =>
  				cmp.selectionEmitter.next(first_selected))
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
				});

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
					}).subscribe(x=>
						cmp.selectionEmitter.next(x))
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

jb.component('tree.drag-and-drop', { /* tree.dragAndDrop */
  type: 'feature',
  impl: ctx => ({
  		onkeydown: true,
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

			drake.on('drop', (dropElm, target, source,targetSibling) => {
				if (!dropElm.dragged) return;
				dropElm.parentNode.removeChild(dropElm);
				cmp.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
				const state = treeStateAsRefs(cmp);
				let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : addToIndex(cmp.elemToPath(target.lastElementChild),1);
				// strange dragule behavior fix
				const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
				const targetIndex = Number(targetPath.split('~').pop());
				if (target === source && targetIndex > draggedIndex)
					targetPath = addToIndex(targetPath,-1)
				cmp.model.move(dropElm.dragged.path,targetPath,ctx);
				cmp.selectionEmitter.next(targetPath)
				restoreTreeStateFromRefs(cmp,state);
				dropElm.dragged = null;
//				cmp.redraw(true);
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
      		componentWillUpdate: function(cmp) {
    		  	if (cmp.drake)
    			     cmp.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
    				       //$(cmp.base).findIncludeSelf('.jb-array-node').children().filter('.treenode-children').get();
      		}
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
