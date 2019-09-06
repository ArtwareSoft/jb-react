(function() {
jb.ns('tree')

class NodeLine extends jb.ui.Component {
	constructor(props) {
		super();
		this.state.expanded = props.tree.expanded[props.path];
		var tree = props.tree, path = props.path;
		var model = tree.nodeModel;

		this.state.flip = _ => {
			tree.expanded[path] = !(tree.expanded[path]);
			this.setState({expanded:tree.expanded[path]});
			tree.redraw();
		};
	}

	render(props,state) {
		var h = jb.ui.h, tree= props.tree, model = props.tree.nodeModel;

		const path = props.path;
		const collapsed = tree.expanded[path] ? '' : ' collapsed';
		const nochildren = model.isArray(path) ? '' : ' nochildren';
		const title = model.title(path,!tree.expanded[path]);
		const icon = model.icon ? model.icon(path) : 'radio_button_unchecked';

		return h('div',{ class: `treenode-line${collapsed}`},[
			h('button',{class: `treenode-expandbox${nochildren}`, onclick: _=> state.flip() },[
				h('div',{ class: 'frame'}),
				h('div',{ class: 'line-lr'}),
				h('div',{ class: 'line-tb'}),
			]),
			h('i',{class: 'material-icons', style: 'font-size: 16px; margin-left: -4px; padding-right:2px'}, icon),
			h('span',{class: 'treenode-label'}, title),
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
		jb.log('render-tree',['Node',props.path,...arguments])

		return h('div',{class: clz, path: props.path},
			[h(NodeLine,{ tree: tree, path: path })].concat(!tree.expanded[path] ? [] : h('div',{ class: 'treenode-children'} ,
					tree.nodeModel.children(path).map(childPath=>
						h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') })
					))
			))

	}
}

 //********************* jBart Components

jb.component('tree', { /* tree */
  type: 'control',
  params: [
    {id: 'nodeModel', type: 'tree.nodeModel', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.ulLi(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
		var nodeModel = ctx.params.nodeModel();
		if (!nodeModel)
			return jb.logError('missing nodeModel in tree',ctx);
		var tree = { nodeModel: nodeModel };
		var ctx = ctx.setVars({$tree: tree});
		return jb.ui.ctrl(ctx, {
			class: 'jb-tree', // define host element to keep the wrapper
			beforeInit: (cmp,props) => {
				cmp.tree = Object.assign( tree, {
					redraw: strong => { // needed after dragula that changes the DOM
						cmp.setState({empty: strong});
						if (strong)
							jb.delay(1).then(_=>
								cmp.setState({empty: false}))
					},
					expanded: jb.obj(tree.nodeModel.rootPath, true),
					elemToPath: el =>
						jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'),
					selectionEmitter: new jb.rx.Subject(),
				})
			},
			afterViewInit: cmp =>
				tree.el = cmp.base
		})
	}
})

jb.component('tree.ul-li', { /* tree.ulLi */
  type: 'tree.style',
  impl: customStyle(
    (cmp,state,h) => {
			var tree = cmp.tree;
			return h('div',{},
				state.empty ? h('span') : h(TreeNode,{ tree: tree, path: tree.nodeModel.rootPath,
				class: 'jb-control-tree treenode' + (tree.selected == tree.nodeModel.rootPath ? ' selected': '') })
			)
		}
  )
})

jb.component('tree.no-head', { /* tree.noHead */
  type: 'tree.style',
  impl: customStyle(
    (cmp,state,h) => {
		var tree = cmp.tree, path = tree.nodeModel.rootPath;
		return h('div',{},tree.nodeModel.children(path).map(childPath=>
				 h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') }))
		)}
  )
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
		  const tree = cmp.tree;
		  const selectedRef = databind()

  		  const databindObs = jb.isWatchable(selectedRef) && jb.ui.refObservable(selectedRef,cmp,{watchScript: ctx}).map(e=>jb.val(e.ref));

		  tree.selectionEmitter
		  	.merge(databindObs || [])
		  	.merge(cmp.onclick.map(event =>
		  		tree.elemToPath(event.target)))
		  	.filter(x=>x)
		  	.map(x=>
		  		jb.val(x))
//	  		.distinctUntilChanged()
		  	.subscribe(selected=> {
		  	  if (tree.selected == selected)
		  	  	return;
			  tree.selected = selected;
			  selected.split('~').slice(0,-1).reduce(function(base, x) {
				  var path = base ? (base + '~' + x) : x;
				  tree.expanded[path] = true;
				  return path;
			  },'')
			  if (selectedRef)
				  jb.writeValue(selectedRef, selected);
			  ctx.params.onSelection(cmp.ctx.setData(selected));
			  tree.redraw();
		  });

		  cmp.onclick.subscribe(_=>
		  	tree.regainFocus && tree.regainFocus()
		  );

		if (ctx.params.onRightClick.profile)
			cmp.base.oncontextmenu = (e=> {
				jb.ui.wrapWithLauchingElement(ctx.params.onRightClick,
					ctx.setData(tree.elemToPath(e.target)), e.target)();
				return false;
			});

		  // first auto selection selection
		  var first_selected = jb.val(selectedRef);
		  if (!first_selected && ctx.params.autoSelectFirst) {
			  var first = jb.ui.find(tree.el.parentNode,'.treenode')[0];
			  first_selected = tree.elemToPath(first);
		  }
		  if (first_selected)
  			jb.delay(1).then(() =>
  				tree.selectionEmitter.next(first_selected))
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
						var diff = event.keyCode == 40 ? 1 : -1;
						var nodes = jb.ui.findIncludeSelf(tree.el,'.treenode');
						var selected = jb.ui.findIncludeSelf(tree.el,'.treenode.selected')[0];
						return tree.elemToPath(nodes[nodes.indexOf(selected) + diff]) || tree.selected;
					}).subscribe(x=>
						tree.selectionEmitter.next(x))
				// expand collapse
				keyDownNoAlts
					.filter(e=> e.keyCode == 37 || e.keyCode == 39)
					.subscribe(event => {
						var isArray = tree.nodeModel.isArray(tree.selected);
						if (!isArray || (tree.expanded[tree.selected] && event.keyCode == 39))
							runActionInTreeContext(context.params.onRightClickOfExpanded);
						if (isArray && tree.selected) {
							tree.expanded[tree.selected] = (event.keyCode == 39);
							tree.redraw()
						}
					});

				function runActionInTreeContext(action) {
					jb.ui.wrapWithLauchingElement(action,
						context.setData(tree.selected), jb.ui.findIncludeSelf(tree.el,'.treenode.selected>.treenode-line')[0])()
				}
				// menu shortcuts - delay in order not to block registration of other features
		    jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
					if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
					 && (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
						var menu = context.params.applyMenuShortcuts(context.setData(tree.selected));
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
  impl: ctx =>
		ctx.vars.$tree && ctx.vars.$tree.regainFocus && ctx.vars.$tree.regainFocus()
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
  params: [
    
  ],
  impl: ctx => ({
  		onkeydown: true,
  		afterViewInit: cmp => {
  			var tree = cmp.tree;
        var drake = tree.drake = dragula([], {
				      moves: el =>
					         jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
	      });
        drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
          //jb.ui.findIncludeSelf(cmp.base,'.jb-array-node').map(el=>el.children()).filter('.treenode-children').get();

	      drake.on('drag', function(el, source) {
	          var path = tree.elemToPath(el.firstElementChild)
	          el.dragged = { path: path, expanded: tree.expanded[path]}
	          delete tree.expanded[path]; // collapse when dragging
	        })

	      drake.on('drop', (dropElm, target, source,targetSibling) => {
	            if (!dropElm.dragged) return;
				      dropElm.parentNode.removeChild(dropElm);
	            tree.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
      				var state = treeStateAsVals(tree);
      				var targetPath = targetSibling ? tree.elemToPath(targetSibling) : addOneToIndex(tree.elemToPath(target.lastElementChild));
      				if (!targetPath)
      					debugger;
      				tree.nodeModel.move(dropElm.dragged.path,targetPath);
      				restoreTreeStateFromVals(tree,state);
      				dropElm.dragged = null;
      				tree.redraw(true);
	      });

	        // ctrl up and down
    		cmp.onkeydown.filter(e=>
    				e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
    				.subscribe(e=> {
      					var diff = e.keyCode == 40 ? 2 : -1;
      					var selectedIndex = Number(tree.selected.split('~').pop());
      					if (isNaN(selectedIndex)) return;
      					var no_of_siblings = Array.from(cmp.base.querySelector('.treenode.selected').parentNode.children).length;
                //$($('.treenode.selected').parents('.treenode-children')[0]).children().length;
      					var index = (selectedIndex + diff+ no_of_siblings+1) % (no_of_siblings + 1);
      					var path = tree.selected.split('~').slice(0,-1).join('~');
      					var state = treeStateAsVals(tree);
      					tree.nodeModel.move(tree.selected, tree.selected.split('~').slice(0,-1).concat([index]).join('~'))
      					restoreTreeStateFromVals(tree,state);
      			})
      		},
      		doCheck: function(cmp) {
      			var tree = cmp.tree;
    		  	if (tree.drake)
    			     tree.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
    				       //$(cmp.base).findIncludeSelf('.jb-array-node').children().filter('.treenode-children').get();
      		}
  	})
})


treeStateAsVals = tree => ({
	selected: pathToVal(tree.nodeModel,tree.selected),
	expanded: jb.entries(tree.expanded).filter(e=>e[1]).map(e=>pathToVal(tree.nodeModel,e[0]))
})

restoreTreeStateFromVals = (tree,vals) => {
	tree.selected = valToPath(tree.nodeModel,vals.selected);
	tree.expanded = {};
	vals.expanded.forEach(v=>tree.expanded[valToPath(tree.nodeModel,v)] = true)
}

pathToVal = (model,path) =>
	model.refHandler.val(model.refHandler.refOfPath(path.split('~')))

valToPath = (model,val) => {
	var ref = model.refHandler.asRef(val);
	return ref ? ref.path().join('~') : ''
}

addOneToIndex = path => {
	if (!path) debugger;
	var index = Number(path.slice(-1)) + 1;
	return path.split('~').slice(0,-1).concat([index]).join('~')
}


})()
