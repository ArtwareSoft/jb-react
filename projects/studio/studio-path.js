(function() { var st = jb.studio;

function compsRef(val) {
  if (typeof val == 'undefined') 
    return jb.studio.previewjb.comps;
  else
    jb.studio.previewjb.comps = val;
}

st.compsRefHandler = new jb.ui.ImmutableWithPath(compsRef);

// adaptors

Object.assign(st,{
  val: (v) =>
    st.compsRefHandler.val(v),
  writeValue: (ref,value) =>
    st.compsRefHandler.writeValue(ref,value),
  objectProperty: (obj,prop) =>
    st.compsRefHandler.objectProperty(obj,prop),
  splice: (ref,args) =>
    st.compsRefHandler.splice(ref,args),
  push: (ref,value) =>
    st.compsRefHandler.splice(ref,value),
  isRef: (ref) =>
    st.compsRefHandler.isRef(ref),
  asRef: (obj) =>
    st.compsRefHandler.asRef(obj),
  refreshRef: (ref) =>
    st.compsRefHandler.refresh(ref),
  scriptChange: st.compsRefHandler.resourceChange,
  refObservable: (ref,cmp) => 
  	st.compsRefHandler.refObservable(ref,cmp),
  refOfPath: (path,silent) =>
  	st.compsRefHandler.refOfPath(path.split('~'),silent),
  parentPath: path =>
	path.split('~').slice(0,-1).join('~'),
  valOfPath: (path,silent) =>
  	st.val(st.refOfPath(path,silent)),
  compOfPath: (path,silent) => 
  	st.getComp(jb.compName(st.valOfPath(path,silent))),
  paramsOfPath: (path,silent) =>
  	jb.compParams(st.compOfPath(path,silent)),
  compNameOfPath: (path) => {
  	var comp = st.valOfPath(path);
	return comp && jb.compName(comp.impl)
  },
  writeValueOfPath: (path,value) =>
	st.writeValue(st.refOfPath(path),value),
  getComp: id =>
	st.previewjb.comps[id],
  compAsStr: id =>
	st.prettyPrintComp(id,st.getComp(id)),
});


// write operations with logic

Object.assign(st,{
	_delete: (path) => {
		var prop = path.split('~').pop();
		var parent = st.valOfPath(st.parentPath(path))
		if (Array.isArray(parent)) {
			var index = Number(prop);
			st.splice(st.refOfPath(st.parentPath(path)),[[index, 1]])
		} else { 
			st.writeValueOfPath(path,null);
		}
	},

	move: (path,draggedPath,index) => { // drag & drop
		var dragged = st.valOfPath(draggedPath);
		var arr = st.valOfPath(path);
		if (!Array.isArray(arr))
			arr = jb.getOrCreateControlArray(path);
		if (Array.isArray(arr)) {
			st._delete(dragged);
			var _index = (index == -1) ? arr.length : index;
			st.splice(st.refOfPath(path),[[_index,0,dragged]]);
		}
	},

	moveInArray: (path,moveUp) => { // drag & drop 
		var arr = st.valOfPath(st.parentPath(path));
		if (Array.isArray(arr)) {
			var index = Number(path.split('~').pop());
			var base = moveUp ? index -1 : index; 
			if (base <0 || base >= arr.length-1) 
				return; // the + elem
			st.splice(st.refOfPath(st.parentPath(path)),[[base,2,arr[base+1],arr[base]]]);
		}
	},

	newComp:(path,profile) =>
        st.compsRefHandler.doOp({$jb_path: [path]},{$set: profile}),

	wrapWithGroup: (path) =>
		st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] }),

	wrap: (path,compName) => {
		var comp = st.getComp(compName);
		var firstParam = jb.compParams(comp).filter(p=>p.composite)[0];
		if (firstParam) {
			var result = jb.extend({ $: compName }, jb.obj(firstParam.id, [st.valOfPath(path)]));
			st.writeValueOfPath(path,result);
		}
	},
	addProperty: (path) => {
		var parent = st.valOfPath(st.parentPath(path));
		if (st.paramTypeOfPath(path) == 'data')
			return st.writeValueOfPath(path,'');
		var param = st.paramDef(path);
		st.writeValueOfPath(path,param.defaultValue || {$: ''});
	},

	duplicate: (path) => {
		var prop = path.split('~').pop();
		var val = st.valOfPath(path);
		var arr_ref = st.refOfPath(st.parentPath(st.parentPath(path)))
		var arr = jb.getOrCreateControlArray(arr_ref);
		if (Array.isArray(arr)) {
			var clone = st.evalProfile(st.prettyPrint(val));
			var index = Number(prop);
			st.splice(arr_ref,[[index, 0,clone]]);
		}
	},

	setComp: (path,compName) => {
		var comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		var result = { $: compName };
		var existing = st.valOfPath(path);
		jb.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = [];
			if (existing && existing[p.id])
				result[p.id] = existing[p.id];
			if (p.defaultValue && typeof p.defaultValue != 'object')
				result[p.id] = p.defaultValue;
			if (p.defaultValue && typeof p.defaultValue == 'object' && (p.forceDefaultCreation || Array.isArray(p.defaultValue)))
				result[p.id] = JSON.parse(JSON.stringify(p.defaultValue));
		})
		st.writeValueOfPath(path,result);
	},

	insertControl: (path,compName) => {
		var comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		var result = { $: compName };
		// copy default values
		jb.compParams(comp).forEach(p=>{
			if (p.defaultValue || p.defaultTValue)
				result[p.id] = JSON.parse(JSON.stringify(p.defaultValue || p.defaultTValue))
		})
		// find group parent that can insert the control
		var group_path = path;
		while (!jb.controlParam(group_path) && group_path)
			group_path = st.parentPath(group_path);
		var arr = jb.getOrCreateControlArray(group_path);
		if (arr) 
			st.push(st.refOfPath(group_path),result);
	},

	addArrayItem: (path,toAdd) => {
		var val = st.valOfPath(path);
		var toAdd = toAdd || {$:''};
		if (Array.isArray(val)) {
			st.push(st.refOfPath(path),toAdd);
//			return { newPath: path + '~' + (val.length-1) }
		}
		else if (!val) {
			st.writeValueOfPath(path,toAdd);
		} else {
			st.writeValueOfPath(path,[val].concat(toAdd));
//			return { newPath: path + '~1' }
		}
	},

	wrapWithArray: (path) => {
		var val = st.valOfPath(path);
		if (val && !Array.isArray(val))
			st.writeValueOfPath(path,[val]);
	},

	makeLocal: (path) =>{
		var comp = st.compOfPath(path);
		if (!comp || typeof comp.impl != 'object') return;
		var res = JSON.stringify(comp.impl, (key, val) => typeof val === 'function' ? ''+val : val , 4);

		var profile = st.valOfPath(path);
		// inject conditional param values
		jb.compParams(comp).forEach(p=>{ 
				var pUsage = '%$'+p.id+'%';
				var pVal = '' + (profile[p.id] || p.defaultValue || '');
				res = res.replace(new RegExp('{\\?(.*?)\\?}','g'),(match,condition_exp)=>{ // conditional exp
						if (condition_exp.indexOf(pUsage) != -1)
							return pVal ? condition_exp : '';
						return match;
					});
		});
		// inject param values 
		jb.compParams(comp).forEach(p=>{ 
				var pVal = '' + (profile[p.id] || p.defaultValue || ''); // only primitives
				res = res.replace(new RegExp(`%\\$${p.id}%`,'g') , pVal);
		});

		st.writeValueOfPath(path,st.evalProfile(res));
	},
	getOrCreateControlArray: (path) => {
		var val = st.valOfPath(path);
		var prop = jb.controlParam(path);
		if (!prop)
			return console.log('pushing to non array');
		if (val[prop] === undefined)
			val[prop] = [];
		if (!Array.isArray(val[prop]))
			val[prop] = [val[prop]];
		return val[prop];
	},
	evalProfile: prof_str => {
		try {
			return eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile:'+prof_str);
		}
	},
})

// ******* components ***************

jb.component('studio.ref',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (context,path) => 
		st.refOfPath(path)
});

jb.component('group.studio-watch-path', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'path', essential: true, as: 'ref' },
  ],
  impl: {$: 'watch-ref', ref :{$: 'studio.ref', path: '%$path%'}}
})

})()