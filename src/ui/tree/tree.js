class NodeLine extends jb.ui.Component {
	constructor(props) {
		super();
		this.state.expanded = props.tree.expanded[props.path];
		var tree = props.tree, path = props.path;
		var model = tree.nodeModel;
		this.setState({
			title: model.title(path,!tree.expanded[path]),
			icon: model.icon ? model.icon(path) : 'radio_button_unchecked'
		})

		this.state.flip = _ => {
			tree.setExpanded(path,!tree.expanded[path]);
			this.setState({expanded:tree.expanded[path]});
			tree.redraw();
		};
	}
	componentWillUpdate() {
		var tree = this.props.tree, path = this.props.path;
		var model = tree.nodeModel;
		this.setState({
			title: model.title(path,!tree.expanded[path]),
			icon: model.icon ? model.icon(path) : 'radio_button_unchecked'
		})
	}
	render(props,state) {
		var h = jb.ui.h, tree= props.tree, model = props.tree.nodeModel;

		var collapsed = tree.expanded[props.path] ? '' : ' collapsed';
		var nochildren = model.isArray(props.path) ? '' : ' nochildren';

		return h('div',{ class: `treenode-line${collapsed}`},[
			h('button',{class: `treenode-expandbox${nochildren}`, onclick: _=> state.flip() },[
				h('div',{ class: 'frame'}),
				h('div',{ class: 'line-lr'}),
				h('div',{ class: 'line-tb'}),
			]),
			h('i',{class: 'material-icons', style: 'font-size: 16px; margin-left: -4px; padding-right:2px'},state.icon),
			h('span',{class: 'treenode-label'}, state.title),
		])
	}
}

class TreeNode extends jb.ui.Component {
	constructor() {
		super();
	}
	render(props,state) {
		var h = jb.ui.h, tree = props.tree, path = props.path, model = props.tree.nodeModel;
		var disabled = model.disabled && model.disabled(props.path) ? 'jb-disabled' : '';
		var clz = [props.class, model.isArray(path) ? 'jb-array-node': '',disabled].filter(x=>x).join(' ');

		return h('div',{class: clz, path: props.path},
			[h(NodeLine,{ tree: tree, path: path })].concat(!tree.expanded[path] ? [] : h('div',{ class: 'treenode-children'} ,
					tree.nodeModel.children(path).map(childPath=>
						h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') })
					))
			))

	}
}

 //********************* jBart Components

jb.component('tree', {
	type: 'control',
	params: [
		{ id: 'nodeModel', type: 'tree.nodeModel', dynamic: true, essential: true },
		{ id: 'style', type: "tree.style", defaultValue: { $: "tree.ul-li" }, dynamic: true },
		{ id: 'features', type: "feature[]", dynamic: true }
	],
	impl: ctx => {
		var nodeModel = ctx.params.nodeModel();
		if (!nodeModel)
			return jb.logException('missing nodeModel in tree');
		var tree = { nodeModel: nodeModel };
		var ctx = ctx.setVars({$tree: tree});
		return jb.ui.ctrl(ctx, {
			class: 'jb-tree', // define host element to keep the wrapper
			beforeInit: (cmp,props) => {
				cmp.tree = Object.assign( tree, {
					redraw: function() { // needed after dragula that changes the DOM
						cmp.setState({});
						// if (this.nodeModel.refHandler) {
						// 	this.selectionPathObs && this.selectionPathObs.unsubscribe();
						// 	this.selectionPathObs = jb.ui.pathObservable(this.selected,this.nodeModel.refHandler,cmp)
						// 		.subscribe(e=>
						// 			this.selectionEmitter.next(e.newPath))
						// }
					},
					expanded: {},
					setExpanded: function(path,expanded) {
						if (!tree.nodeModel.refHandler)
							return this.expanded[path] = expanded;
						if (this.expanded[path] && !this.expanded[path].unsubscribe)
							debugger;
						if (!expanded && this.expanded[path]) {
							this.expanded[path].unsubscribe();
							delete this.expanded[path];
						} else {
							this.expanded[path] && this.expanded[path].unsubscribe();
							this.expanded[path] = jb.ui.pathObservable(path,tree.nodeModel.refHandler,cmp)
							.subscribe(e=> {
								this.setExpanded(e.newPath,true);
								this.setExpanded(e.oldPath,false);
							})
						}
					},
					elemToPath: el =>
						$(el).closest('.treenode').attr('path'),
					selectionEmitter: new jb.rx.Subject(),
				});
				tree.setExpanded(tree.nodeModel.rootPath, true);
			},
			afterViewInit: cmp =>
				tree.el = cmp.base
		})
	}
})

jb.component('tree.ul-li', {
	type: 'tree.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => {
			var tree = cmp.tree;
			return h(TreeNode,{ tree: tree, path: tree.nodeModel.rootPath,
				class: 'jb-control-tree treenode' + (tree.selected == tree.nodeModel.rootPath ? ' selected': '') })
		}
	}
})

jb.component('tree.no-head', {
	type: 'tree.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => {
		var tree = cmp.tree, path = tree.nodeModel.rootPath;
		return h('div',{},tree.nodeModel.children(path).map(childPath=>
				 h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') }))
		)}
	}
})

jb.component('tree.selection', {
  type: 'feature',
  params: [
	  { id: 'databind', as: 'ref' },
	  { id: 'onSelection', type: 'action', dynamic: true },
	  { id: 'autoSelectFirst', type: 'boolean' }
  ],
  impl: context=> ({
	    onclick: true,
  		afterViewInit: cmp => {
  		  var tree = cmp.tree;

  		  var databindObs = jb.ui.refObservable(context.params.databind,cmp).map(e=>jb.val(e.ref));

		  tree.selectionEmitter
		  	.merge(databindObs)
		  	.merge(cmp.onclick.map(event =>
		  		tree.elemToPath(event.target)))
		  	.filter(x=>x)
	  		.distinctUntilChanged()
		  	.subscribe(selected=> {
		  	  if (tree.selected == selected)
		  	  	return;
			  tree.selected = selected;
			  selected.split('~').slice(0,-1).reduce(function(base, x) {
				  var path = base ? (base + '~' + x) : x;
				  tree.setExpanded(path,true);
				  return path;
			  },'')
			  if (context.params.databind)
				  jb.writeValue(context.params.databind, selected);
			  context.params.onSelection(cmp.ctx.setData(selected));
			  tree.redraw();
		  });

		  cmp.onclick.subscribe(_=>
		  	tree.regainFocus && tree.regainFocus()
		  );

		  // first auto selection selection
		  var first_selected = jb.val(context.params.databind);
		  if (!first_selected && context.params.autoSelectFirst) {
			  var first = tree.el.parentNode.querySelectorAll('.treenode')[0];
			  first_selected = tree.elemToPath(first);
		  }
		  if (first_selected)
			jb.delay(1).then(() =>
				tree.selectionEmitter.next(first_selected))
  		},
  	})
})

jb.component('tree.keyboard-selection', {
	type: 'feature',
	params: [
		{ id: 'onKeyboardSelection', type: 'action', dynamic: true },
		{ id: 'onEnter', type: 'action', dynamic: true },
		{ id: 'onRightClickOfExpanded', type: 'action', dynamic: true },
		{ id: 'autoFocus', type: 'boolean' },
		{ id: 'applyMenuShortcuts', type: 'menu.option', dynamic: true },
	],
	impl: context => ({
			onkeydown: true,
			afterViewInit: cmp=> {
				var tree = cmp.tree;
				cmp.base.setAttribute('tabIndex','0');

				var keyDownNoAlts = cmp.onkeydown.filter(e=>
					!e.ctrlKey && !e.altKey);

				tree.regainFocus = cmp.getKeyboardFocus = cmp.getKeyboardFocus || (_ => {
					jb.ui.focus(cmp.base,'tree.keyboard-selection regain focus',context);
					return false;
				});

				if (context.params.autoFocus)
					jb.ui.focus(cmp.base,'tree.keyboard-selection init autofocus',context);

				keyDownNoAlts
					.filter(e=> e.keyCode == 13)
						.subscribe(e =>
							runActionInTreeContext(context.params.onEnter))

				keyDownNoAlts.filter(e=> e.keyCode == 38 || e.keyCode == 40)
					.map(event => {
//						event.stopPropagation();
						var diff = event.keyCode == 40 ? 1 : -1;
						var nodes = Array.from(tree.el.parentNode.querySelectorAll('.treenode'));
						var selected = tree.el.parentNode.querySelector('.treenode.selected');
						return tree.elemToPath(nodes[nodes.indexOf(selected) + diff]) || tree.selected;
					}).subscribe(x=>
						tree.selectionEmitter.next(x))
				// expand collapse
				keyDownNoAlts
					.filter(e=> e.keyCode == 37 || e.keyCode == 39)
					.subscribe(event => {
//						event.stopPropagation();
						var isArray = tree.nodeModel.isArray(tree.selected);
						if (!isArray || (tree.expanded[tree.selected] && event.keyCode == 39))
							runActionInTreeContext(context.params.onRightClickOfExpanded);
						if (isArray && tree.selected) {
							tree.setExpanded(tree.selected,(event.keyCode == 39));
							tree.redraw()
						}
					});

				function runActionInTreeContext(action) {
					jb.ui.wrapWithLauchingElement(action,
						context.setData(tree.selected), tree.el.parentNode.querySelector('.treenode.selected>.treenode-line'))()
				}
				// menu shortcuts - delay in order not to block registration of other features
		    jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
					if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
					 && (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
						var menu = context.params.applyMenuShortcuts(context.setData(tree.selected));
						if (menu && menu.applyShortcut && menu.applyShortcut(e))
							return false;  // stop propagation
					}
					return true;
				}))
			}
		})
})

jb.component('tree.regain-focus', {
	type: 'action',
	impl : ctx =>
		ctx.vars.$tree && ctx.vars.$tree.regainFocus && ctx.vars.$tree.regainFocus()
})


jb.component('tree.drag-and-drop', {
  type: 'feature',
  params: [
	  { id: 'afterDrop', type: 'action', dynamic: true, essential: true },
  ],
  impl: function(context) {
  	return {
  		onkeydown: true,
  		afterViewInit: cmp => {
  			var tree = cmp.tree;
			var drake = tree.drake = dragula([], {
				moves: function(el) {
					return $(el).is('.jb-array-node>.treenode-children>div')
				}
	        });
					drake.containers = $(cmp.base).findIncludeSelf('.jb-array-node').children().filter('.treenode-children').get();

	        drake.on('drag', function(el, source) {
	          var path = tree.elemToPath(el.firstElementChild)
	          el.dragged = { path: path, expanded: tree.expanded[path]}
	          tree.setExpanded(path,false); // collapse when dragging
	        })

	        drake.on('drop', (dropElm, target, source,sibling) => {
	            if (!dropElm.dragged) return;
							$(dropElm).remove();
	            tree.setExpanded(dropElm.dragged.path,dropElm.dragged.expanded); // restore expanded state
	            var index =  sibling ? $(sibling).index() : -1;
							var path = tree.elemToPath(target);
							var selectedRef = tree.selected && tree.nodeModel.refHandler && tree.nodeModel.refHandler.refOfPath(tree.selected.split('~'));
							var selectedObj = selectedRef && tree.nodeModel.refHandler.val(selectedRef);
							tree.nodeModel.move(path, dropElm.dragged.path,index);
							// refresh the nodes on the tree - to avoid bugs
							//tree.expanded[tree.nodeModel.rootPath] = false;
							jb.delay(1).then(()=> {
								//tree.expanded[tree.nodeModel.rootPath] = true;
								context.params.afterDrop(context.setData({ dragged: dropElm.dragged.path, index: index }));
								if (selectedObj) {
									var path = tree.nodeModel.refHandler.asRef(selectedObj,{resource: tree.selected.split('~')[0]}).$jb_path.join('~');
									tree.selectionEmitter.next(path);
								}
								//var newSelection = dropElm.dragged.path.split('~').slice(0,-1).concat([''+index]).join('~');
								dropElm.dragged = null;
								tree.redraw();
							})
	        });

	        // ctrl up and down
			cmp.onkeydown.filter(e=>
				e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
				.subscribe(e=> {
					var diff = e.keyCode == 40 ? 1 : -1;
					var selectedIndex = Number(tree.selected.split('~').pop());
					if (isNaN(selectedIndex)) return;
					var no_of_siblings = $($('.treenode.selected').parents('.treenode-children')[0]).children().length;
					var index = (selectedIndex + diff+ no_of_siblings) % no_of_siblings;
					var path = tree.selected.split('~').slice(0,-1).join('~');
					if (!tree.nodeModel.move(path, tree.selected, index))
						tree.selectionEmitter.next(path+'~'+index);
			})
  		},
  		doCheck: function(cmp) {
  			var tree = cmp.tree;
		  	if (tree.drake)
			  tree.drake.containers =
				  $(cmp.base).findIncludeSelf('.jb-array-node').children().filter('.treenode-children').get();
  		}
  	}
  }
})
