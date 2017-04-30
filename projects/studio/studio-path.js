(function() { var st = jb.studio;

st.parentPath = function(path) {
	return path.split('~').slice(0,-1).join('~');
}

st.profileRefFromPath = function(path) {
	if (path.indexOf('~') == -1) return {
		$jb_val: function(value) {
			if (typeof value == 'undefined') 
				return st.profileFromPath(path);
			else
				st.findjBartToLook(path).comps[path].impl = value;
		}
	}

	var ref = {
		path: path,
		$jb_val: function(value) {
			if (typeof value == 'undefined') 
				return st.profileFromPath(this.path);

			var parent = st.profileFromPath(parentPath(this.path));
			parent[this.path.split('~').pop()] = value;
		}
	}
	//pathChangesEm.subscribe(fixer => ref.path = fixer.fix(ref.path))
	return ref;
}

st.profileFromPath = function (path,silent) {
	var id = path.split('~')[0];
	var comp = st.jbart_base().comps[id] || jbart.comps[id];
	comp = comp && comp.impl;
	if (!comp && !silent) {
		jb.logError('st.profileFromPath: can not find path ',path);
		return;
	}
	var innerPath = path.split('~').slice(1).join('~');
	if (!innerPath)
		return comp;
	return comp && innerPath.split('~').reduce(function(obj, p) { 
		if (!obj && !silent)
			jb.logError('st.profileFromPath: non existing path '+ path+ ' property: ' + p);
		// if (obj && p == '0' && obj[p] == null) // flatten one-item array
		// 	return obj;
		if (obj == null)
			return null;
		else if (obj[p] == null)
			return obj['$'+p];
		else
			return obj[p]; 
	}, comp);
}

st.pathFixer = {
	fixIndexPaths: fixIndexPaths,
	fixReplacingPaths: fixReplacingPaths,
	fixMovePaths: fixMovePaths,
	fixArrayWrapperPath: fixArrayWrapperPath,
	fixSetCompPath: fixSetCompPath
}

function profileRefFromPathWithNotification(path,ctx) {
	var _ref = profileRefFromPath(path);
	return {
		$jb_val: function(value) {
			if (typeof value == 'undefined') 
				return _ref.$jb_val(value);
			if (_ref.$jb_val() == value) return;
			var comp = path.split('~')[0];
			var before = compAsStr(comp);
			_ref.$jb_val(value);
			notifyModification(path,before,ctx,this.ngPath);
		}
	}
}

function closest(path) {
	if (!path) return '';
	var _path = path;
	while (st.profileFromPath(_path,true) == null && Number(_path.split('~').pop()) )
		_path = _path.replace(/([0-9]+)$/,(x,y) => Number(y)-1)

	while (st.profileFromPath(_path,true) == null && _path.indexOf('~') != -1)
		_path = parentPath(_path);

	if (st.profileFromPath(_path,true))
		return _path;
}

// ***************** path fixers after changes **************************

function fixMovePaths(from,to) {
//	console.log('fixMovePath',from,to);
	var parent_path = parentPath(to);
	var depth = parent_path.split('~').length;
	var index = Number(to.split('~').pop()) || 0;
	pathChangesEm.next({ from: from, to: to, 
		fix: function(pathToFix) {
			if (!pathToFix) return;
			if (pathToFix.indexOf(from) == 0) {
//				console.log('fixMovePath - action',pathToFix, 'to',to + pathToFix.substr(from.length));
				return to + pathToFix.substr(from.length);
			}
			else {
				var fixed1 = fixIndexOfPath(pathToFix,from,-1);
				return fixIndexOfPath(fixed1,to,1);
			}
		}
	})
}

function fixSetCompPath(comp) {
	pathChangesEm.next({
		fix: pathToFix =>
			pathToFix.indexOf(comp) == 0 ? closest(pathToFix) : pathToFix
	})
}

function fixIndexPaths(path,diff) {
	pathChangesEm.next({ fix: pathToFix =>
		fixIndexOfPath(pathToFix,path,diff)
	})
} 

function fixReplacingPaths(path1,path2) {
	pathChangesEm.next(new FixReplacingPathsObj(path1,path2))
} 

class FixReplacingPathsObj {
	constructor(path1,path2) {
		this.path1 = path1; this.path2 = path2;
	}
	fix(pathToFix) {
		if (pathToFix.indexOf(this.path1) == 0)
			return pathToFix.replace(this.path1,this.path2)
		else if (pathToFix.indexOf(this.path2) == 0)
			return pathToFix.replace(this.path2,this.path1)
		return pathToFix;
	}
}

function fixIndexOfPath(pathToFix,changedPath,diff) {
	var parent_path = parentPath(changedPath);
	var depth = parent_path.split('~').length;
	if (pathToFix.indexOf(parent_path) == 0 && pathToFix.split('~').length > depth) {
		var index = Number(changedPath.split('~').pop()) || 0;
		var elems = pathToFix.split('~');
		var indexToFix = Number(elems[depth]);
		if (indexToFix >= index) {
			elems[depth] = Math.max(0,indexToFix + diff);
//			console.log('fixIndexPath - action',pathToFix, indexToFix,'to',elems[depth]);
		}
		return elems.join('~')
	}
	return pathToFix;
}

function fixArrayWrapperPath() {
	pathChangesEm.next(function(pathToFix) {
		var base = pathToFix.split('~')[0];
		var first = jb.val(profileRefFromPath(base));
		var res = pathToFix.split('~')[0];
		pathToFix.split('~').slice(1).reduce(function(obj,prop) {
			if (!obj || (obj[prop] == null && prop == '0')) 
				return
			if (Array.isArray(obj) && isNaN(Number(prop))) {
				res += '~0~' + prop;
				debugger;
			}
			else
				res += '~' + prop;
			return obj[prop]
		},first);
		return res;
	})
}

// ******* components ***************

jb.component('studio.ref',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (context,path) => 
		profileRefFromPathWithNotification(path,context)
});

jb.component('studio.fix-to-closest-path', {
	params: [ {id: 'path', as: 'ref' } ],
	impl: (ctx,pathRef) => {
		var path = jb.val(pathRef);
		var closest_path = closest(path);

		if (path && path != closest_path) {
			jb.writeValue(pathRef,closest_path);
//			jb_ui.apply(ctx);
		}
	}
})

jb.component('group.studio-watch-path', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'path', essential: true, as: 'ref' },
  ],
  impl: (context, path_ref) =>({
      beforeInit: cmp => {
          cmp.jbWatchGroupChildrenEm = (cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
              .merge(cmp.jbEmitter
                .filter(x => x == 'check')
                .merge(
                  pathChangesEm.takeUntil( cmp.destroyed ).do(fixer=>
                    jb.writeValue(path_ref,fixer.fix(jb.val(path_ref))))
                )
                .map(()=> jb.val(path_ref))
                .distinctUntilChanged()
                .map(val=> {
                    var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx() : cmp.ctx);
                    return context.vars.$model.controls(ctx2)
                })
            )
      },
      jbEmitter: true,
    })
})

jb.component('feature.studio-auto-fix-path', {
  type: 'feature',
  params: [
    { id: 'path', essential: true, as: 'ref' },
  ],
  impl: (context, path_ref) =>
  	({
      beforeInit: cmp => {
        pathChangesEm
            .takeUntil( cmp.destroyed )
            .subscribe(fixer=>
                jb.writeValue(path_ref,fixer.fix(jb.val(path_ref)))
            )
      },
      jbEmitter: true,
    })
})

})()