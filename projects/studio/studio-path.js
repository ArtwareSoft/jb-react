(function() { var st = jb.studio;

function compsRef(val,opEvent) {
  if (typeof val == 'undefined') 
    return st.previewjb.comps;
  else {
  	st.compsHistory.push({before: st.previewjb.comps, after: val, opEvent: opEvent, undoIndex: st.undoIndex});
    st.previewjb.comps = val;
    st.undoIndex = st.compsHistory.length;
  }
}

st.compsRefHandler = new jb.ui.ImmutableWithPath(compsRef);
st.compsRefHandler.resourceChange.subscribe(_=>st.lastStudioActivity= new Date().getTime())
// adaptors

Object.assign(st,{
  val: (v) =>
    st.compsRefHandler.val(v),
  writeValue: (ref,value,srcCtx) =>
    st.compsRefHandler.writeValue(ref,value,srcCtx),
  objectProperty: (obj,prop) =>
    st.compsRefHandler.objectProperty(obj,prop),
  splice: (ref,args,srcCtx) =>
    st.compsRefHandler.splice(ref,args,srcCtx),
  push: (ref,value,srcCtx) =>
    st.compsRefHandler.push(ref,value,srcCtx),
  merge: (ref,value,srcCtx) =>
    st.compsRefHandler.merge(ref,value,srcCtx),
  isRef: (ref) =>
    st.compsRefHandler.isRef(ref),
  asRef: (obj) =>
    st.compsRefHandler.asRef(obj),
  refreshRef: (ref) =>
    st.compsRefHandler.refresh(ref),
  scriptChange: st.compsRefHandler.resourceChange,
  refObservable: (ref,cmp,includeChildren) => 
  	st.compsRefHandler.refObservable(ref,cmp,includeChildren),
  refOfPath: (path,silent) =>
  	st.compsRefHandler.refOfPath(path.split('~'),silent),
  parentPath: path =>
	path.split('~').slice(0,-1).join('~'),
  valOfPath: (path,silent) =>
  	st.val(st.refOfPath(path,silent)),
  compNameOfPath: (path,silent) => 
  	jb.compName(st.valOfPath(path + (path.indexOf('~') == -1 ? '~impl' : ''),silent)),
  compOfPath: (path,silent) => 
  	st.getComp(st.compNameOfPath(path,silent)),
  paramsOfPath: (path,silent) =>
  	jb.compParams(st.compOfPath(path,silent)),
  writeValueOfPath: (path,value) =>
	st.writeValue(st.refOfPath(path),value),
  getComp: id =>
	st.previewjb.comps[id],
  compAsStr: id =>
	st.prettyPrintComp(id,st.getComp(id)),
});


// write operations with logic

Object.assign(st, {
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

	moveInTree: (path,draggedPath,index) => { // drag & drop
		var draggedRef = st.refOfPath(draggedPath);
		var dragged = st.valOfPath(draggedPath);
		var dest = st.getOrCreateControlArrayRef(path);
		if (!st.refreshRef(draggedRef))
			return;
		var _draggedPath = draggedRef.$jb_path.join('~');
		if (dest) {
			st._delete(_draggedPath);
			var _index = (index == -1) ? jb.val(dest).length : index;
			st.splice(dest,[[_index,0,dragged]]);
		}
 	},

	moveInArray: (path,draggedPath,index) => { // drag & drop
		var dragged = st.valOfPath(draggedPath);
		var array = st.valOfPath(path);
		if (Array.isArray(array)) {
			if (index < 0 || index >= array.length) 
				return 'moveInArray: out of array index ' + index + ' in array of size ' + array.length;
			st._delete(draggedPath);
			array = st.valOfPath(path);
			var _index = (index == -1) ? jb.val(array).length : index;
			st.splice(array,[[_index,0,dragged]]);
		}
	},

//	newComp:(path,profile) =>
//        st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] })
//        st.compsRefHandler.doOp({$jb_path: [path]},{$set: profile}),

	wrapWithGroup: (path) =>
		st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] }),

	wrap: (path,compName) => {
		var comp = st.getComp(compName);
		var compositeParam = jb.compParams(comp).filter(p=>p.composite)[0];
		if (compositeParam) {
			var singleOrArray = compositeParam.type.indexOf('[') == -1 ? st.valOfPath(path) : [st.valOfPath(path)];
			if (jb.compParams(comp).length == 1) // use sugar
				var result = jb.obj('$'+compName,singleOrArray);
			else
				var result = Object.assign({ $: compName }, jb.obj(compositeParam.id,singleOrArray));
			st.writeValueOfPath(path,result);
		}
	},
	addProperty: (path) => {
		// if (st.paramTypeOfPath(path) == 'data')
		// 	return st.writeValueOfPath(path,'');
		var param = st.paramDef(path);
		var result = param.defaultValue || {$: ''};
		if (st.paramTypeOfPath(path).indexOf('data') != -1)
			result = '';
		if (param.type.indexOf('[') != -1) 
			result = [];
		st.writeValueOfPath(path,result);
	},

	duplicateControl: path => {
		var prop = path.split('~').pop();
		var val = st.valOfPath(path);
		var parent_ref = st.getOrCreateControlArrayRef(st.parentPath(st.parentPath(path)));
		if (parent_ref) {
			var clone = st.evalProfile(st.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]]);
		}
	},
	duplicateArrayItem: path => {
		var prop = path.split('~').pop();
		var val = st.valOfPath(path);
		var parent_ref = st.refOfPath(st.parentPath(path));
		if (parent_ref && Array.isArray(st.val(parent_ref))) {
			var clone = st.evalProfile(st.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]]);
		}
	},
	disabled: path => {
		var prof = st.valOfPath(path);
		return prof && typeof prof == 'object' && prof.$disabled;
	},
	toggleDisabled: path => {
		var prof = st.valOfPath(path);
		if (prof && typeof prof == 'object' && !Array.isArray(prof)) 
			st.writeValue(st.refOfPath(path+'~$disabled'),prof.$disabled ? null : true)
	},
	setComp: (path,compName) => {
		var comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		var params = jb.compParams(comp);
		if (params.length == 1 && params[0].composite == true)
			return st.setSugarComp(path,compName,params[0]);

		var result = { $: compName };
		params.forEach(p=>{
			if (p.composite)
				result[p.id] = [];
			if (p.defaultValue && typeof p.defaultValue != 'object')
				result[p.id] = p.defaultValue;
			if (p.defaultValue && typeof p.defaultValue == 'object' && (p.forceDefaultCreation || Array.isArray(p.defaultValue)))
				result[p.id] = JSON.parse(JSON.stringify(p.defaultValue));
		})
		var currentVal = st.valOfPath(path);
		if (!currentVal || typeof currentVal != 'object')
			st.writeValue(st.refOfPath(path),result)
		else
			st.merge(st.refOfPath(path),result);
	},

	setSugarComp: (path,compName,param) => {
		var emptyVal = (param.type||'').indexOf('[') == -1 ? '' : [];
		var currentVal = st.valOfPath(path);
		if (typeof currentVal == 'object') {
			var properties = Object.getOwnPropertyNames(currentVal);
			if (properties.length == 1 && properties[0].indexOf('$') == 0)
				currentVal = currentVal[properties[0]];
			else
				currentVal = st.valOfPath(path+'~'+param.id,true) || st.valOfPath(path+'~$'+compName,true);
		}
		if (currentVal && !Array.isArray(currentVal) && (param.type||'').indexOf('[') != -1)
			currentVal = [currentVal];
		st.writeValue(st.refOfPath(path),jb.obj('$'+compName,currentVal || emptyVal))
	},

	insertControl: (path,compName) => {
		var comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		var newCtrl = { $: compName };
		// copy default values
		jb.compParams(comp).forEach(p=>{
			if (p.defaultValue || p.defaultTValue)
				newCtrl[p.id] = JSON.parse(JSON.stringify(p.defaultValue || p.defaultTValue))
		})
		if (st.controlParams(path)[0] == 'fields')
			newCtrl = { $: 'field.control', control : newCtrl};
		// find group parent that can insert the control
		var group_path = path;
		while (st.controlParams(group_path).length == 0 && group_path)
			group_path = st.parentPath(group_path);
		var group_ref = st.getOrCreateControlArrayRef(group_path);
		if (group_ref)
			st.push(group_ref,[newCtrl]);
	},

	addArrayItem: (path,toAdd) => {
		var val = st.valOfPath(path);
		var toAdd = toAdd || {$:''};
		if (Array.isArray(val)) {
			st.push(st.refOfPath(path),[toAdd]);
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
	getOrCreateControlArrayRef: (path) => {
		var val = st.valOfPath(path);
		var prop = st.controlParams(path)[0];
		if (!prop)
			return console.log('getOrCreateControlArrayRef: no control param');
		var ref = st.refOfPath(path+'~'+prop);
		if (val[prop] === undefined)
			jb.writeValue(ref,[]);
		else if (!Array.isArray(val[prop])) // wrap
			jb.writeValue(ref,[val[prop]]);
		ref = st.refOfPath(path+'~'+prop);
		return ref;
	},
	evalProfile: prof_str => {
		try {
			return eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile:'+prof_str);
		}
	},

  	pathOfRef: ref =>
  		ref && ref.$jb_path && ref.$jb_path.join('~'),
	nameOfRef: ref => 
		(ref && ref.$jb_path) ? ref.$jb_path.slice(-1)[0].split(':')[0] : 'ref',
	valSummaryOfRef: ref => 
		st.valSummary(jb.val(ref)),
	valSummary: val => {
		if (val && typeof val == 'object')
			return val.id || val.name
		return '' + val;
	},
	pathSummary: path => 
		path.replace(/~controls~/g,'~').replace(/~impl~/g,'~').replace(/^[^\.]*./,''),
	isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
})

// ******* components ***************

jb.component('studio.ref', {
	params: [ {id: 'path', as: 'string', essential: true } ],
	impl: (ctx,path) => 
		st.refOfPath(path)
});

jb.component('studio.path-of-ref', {
	params: [ {id: 'ref', defaultValue: '%%', essential: true } ],
	impl: (ctx,ref) => 
		st.pathOfRef(ref)
});

jb.component('studio.name-of-ref', {
	params: [ {id: 'ref', defaultValue: '%%', essential: true } ],
	impl: (ctx,ref) => 
		st.nameOfRef(ref)
});


jb.component('studio.is-new', {
	type: 'boolean',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => {
		if (st.compsHistory.length == 0) return false;
		var version_before = new jb.ui.ImmutableWithPath(_=>st.compsHistory.slice(-1)[0].before).refOfPath(path.split('~'),true);
		var res =  st.valOfPath(path) && !st.val(version_before);
		return res;
	}
});

jb.component('studio.watch-path', {
  type: 'feature', 
  category: 'group:0', 
  params: [
    { id: 'path', as: 'string', essential: true }, 
    { id: 'includeChildren', as: 'boolean' },
  ], 
  impl: (ctx,path,includeChildren) => ({
      init: cmp => 
      	jb.ui.watchRef(ctx,cmp,st.refOfPath(path),includeChildren)
  })
})

jb.component('studio.watch-script-changes', {
  type: 'feature',
  impl: ctx => ({
      init: cmp =>
        st.compsRefHandler.resourceChange.debounceTime(200).subscribe(e=>
            jb.ui.setState(cmp,null,e,ctx))
   })
})

jb.component('studio.watch-components', {
  type: 'feature',
  impl: ctx => ({
      init: cmp =>
        st.compsRefHandler.resourceChange.filter(e=>e.path.length == 1)
        	.subscribe(e=>
            	jb.ui.setState(cmp,null,e,ctx))
   })
})


jb.component('studio.watch-typeof-script', {
  params: [
    { id: 'path', as: 'string', essential: true }, 
  ],
  type: 'feature',
  impl: (ctx,path) => ({
      init: cmp =>
    	jb.ui.refObservable(st.refOfPath(path),cmp,true)
    		.filter(e=>
    			typeof e.oldVal != typeof e.newVal)
    		.subscribe(e=>
        		jb.ui.setState(cmp,null,e,ctx))
   })
})

jb.component('studio.path-hyperlink', {
  type: 'control', 
  params: [
    { id: 'path', as: 'string', essential: true }, 
    { id: 'prefix', as: 'string' }
  ], 
  impl :{$: 'group', 
    style :{$: 'layout.horizontal', spacing: '9' }, 
    controls: [
      {$: 'label', title: '%$prefix%' }, 
      {$: 'button', 
        title: ctx => {
	  		var path = ctx.componentContext.params.path;
	  		var title = st.shortTitle(path) || '',compName = st.compNameOfPath(path) || '';
	  		return title == compName ? title : compName + ' ' + title;
	  	}, 
        action :{$: 'studio.goto-path', path: '%$path%' }, 
        style :{$: 'button.href' }, 
        features :{$: 'feature.hover-title', title: '%$path%' }
      }
    ]
  }
})

})()