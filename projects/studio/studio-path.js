(function() { var st = jb.studio;

function compsRefOfPreviewJb(previewjb) {
	st.compsHistory = [];
	function compsRef(val,opEvent) {
		if (typeof val == 'undefined')
			return previewjb.comps;
		else {
			val.$jb_selectionPreview = opEvent && opEvent.srcCtx && opEvent.srcCtx.vars.selectionPreview;
			if (!val.$jb_selectionPreview)
			st.compsHistory.push({before: previewjb.comps, after: val, opEvent: opEvent, undoIndex: st.undoIndex})

			previewjb.comps = val;
			if (opEvent)
			st.undoIndex = st.compsHistory.length;
		}
	}
	compsRef.frame = previewjb.frame
	return compsRef
}
st.scriptChange = new jb.rx.Subject()
st.initCompsRefHandler = function(previewjb,allowedTypes) {
	const oldCompsRefHandler = st.compsRefHandler
	oldCompsRefHandler && oldCompsRefHandler.stopListening.next(1)
	const compsRef = compsRefOfPreviewJb(previewjb);
	st.compsRefHandler = jb.ui.extraWatchableHandler(compsRef, oldCompsRefHandler)
	st.compsRefHandler.allowedTypes = st.compsRefHandler.allowedTypes.concat(allowedTypes);
	st.compsRefHandler.stopListening = new jb.rx.Subject()

	st.compsRefHandler.resourceChange.takeUntil(st.compsRefHandler.stopListening).subscribe(e=>{
		jb.log('scriptChange',[e.srcCtx,e]);
		st.scriptChange.next(e)
		st.highlightByScriptPath(e.path)
		writeValueToDataResource(e.path,e.newVal)
		st.lastStudioActivity= new Date().getTime()
	})
}

function writeValueToDataResource(path,value) {
	if (path.length > 1 && ['watchableData','passiveData'].indexOf(path[1]) != -1) {
		const resource = jb.removeDataResourcePrefix(path[0])
		const dataPath = '%$' + [resource, ...path.slice(2)].map(x=>isNaN(+x) ? x : `[${x}]`).join('/') + '%'
		return (new st.previewjb.jbCtx()).run(writeValue(dataPath,_=>value))
	}
}

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
  refOfPath: (path,silent) => {
		const _path = path.split('~');
		st.compsRefHandler.resourceReferred && st.compsRefHandler.resourceReferred(_path[0]);
		const ref = st.compsRefHandler.refOfPath(_path,silent)
		if (!ref) debugger
		ref.jbToUse = st.previewjb
		return ref
  },
  parentPath: path =>
		path.split('~').slice(0,-1).join('~'),
  valOfPath: path =>
  	jb.path(st.previewjb.comps,path.split('~')),
  compNameOfPath: (path,silent) => {
    if (path.indexOf('~') == -1)
      return 'jb-component';
    if (path.match(/~\$vars$/)) return;
    const prof = st.valOfPath(path,silent); // + (path.indexOf('~') == -1 ? '~impl' : '');
  	return jb.compName(prof) || jb.compName(prof,st.paramDef(path))
  },
  compOfPath: (path,silent) =>
  	st.getComp(st.compNameOfPath(path,silent)),
  paramsOfPath: (path,silent) =>
  	jb.compParams(st.compOfPath(path,silent)), //.concat(st.compHeaderParams(path)),
  writeValueOfPath: (path,value,srcCtx) =>
		st.writeValue(st.refOfPath(path),value,srcCtx),
  getComp: id =>
		st.previewjb.comps[id],
  compAsStr: id =>
		jb.prettyPrintComp(id,st.getComp(id)),
})


// write operations with logic

Object.assign(st, {
	_delete: (path,srcCtx) => {
		const prop = path.split('~').pop();
		const parent = st.valOfPath(st.parentPath(path))
		if (Array.isArray(parent)) {
			const index = Number(prop);
			st.splice(st.refOfPath(st.parentPath(path)),[[index, 1]],srcCtx)
		} else {
			st.writeValueOfPath(path,undefined,srcCtx);
		}
	},

	wrapWithGroup: (path,srcCtx) =>
		st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] },srcCtx),

	wrap: (path,compName,srcCtx) => {
		const comp = st.getComp(compName);
		const compositeParam = jb.compParams(comp).filter(p=>p.composite)[0];
		if (compositeParam) {
			const singleOrArray = compositeParam.type.indexOf('[') == -1 ? st.valOfPath(path) : [st.valOfPath(path)];
			if (jb.compParams(comp).length == 1) // use sugar
				var result = jb.obj('$'+compName,singleOrArray);
			else
				var result = Object.assign({ $: compName }, jb.obj(compositeParam.id,singleOrArray));
			st.writeValueOfPath(path,result,srcCtx);
		}
	},
	addProperty: (path,srcCtx) => {
		// if (st.paramTypeOfPath(path) == 'data')
		// 	return st.writeValueOfPath(path,'');
		const param = st.paramDef(path);
		let result = param.defaultValue || {$: ''};
		if (st.paramTypeOfPath(path).indexOf('data') != -1)
			result = '';
		if ((param.type ||'').indexOf('[') != -1)
			result = [];
		st.writeValueOfPath(path,result,srcCtx);
	},

	duplicateControl: (path,srcCtx) => {
		const prop = path.split('~').pop();
		const val = st.valOfPath(path);
		const parent_ref = st.getOrCreateControlArrayRef(st.parentPath(st.parentPath(path)));
		if (parent_ref) {
			const clone = st.evalProfile(jb.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]],srcCtx);
		}
	},
	duplicateArrayItem: (path,srcCtx) => {
		const prop = path.split('~').pop();
		const val = st.valOfPath(path);
		const parent_ref = st.refOfPath(st.parentPath(path));
		if (parent_ref && Array.isArray(st.val(parent_ref))) {
			const clone = st.evalProfile(jb.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]],srcCtx);
		}
	},
	disabled: path => {
		const prof = st.valOfPath(path);
		return prof && typeof prof == 'object' && prof.$disabled;
	},
	toggleDisabled: (path,srcCtx) => {
		const prof = st.valOfPath(path);
		if (prof && typeof prof == 'object' && !Array.isArray(prof))
			st.writeValue(st.refOfPath(path+'~$disabled'),prof.$disabled ? null : true,srcCtx)
	},
	newProfile: (comp,compName) => {
		const result = comp.singleInType ? {} : { $: compName };
		jb.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = [];
			if (p.templateValue)
				result[p.id] = JSON.parse(JSON.stringify(p.templateValue))
		})
		return result
	},
	setComp: (path,compName,srcCtx) => {
		const comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		const params = jb.compParams(comp);
		if (params.length == 1 && (params[0]||{}).composite == true || (params[0]||{}).sugar)
			return st.setSugarComp(path,compName,params[0],srcCtx);

		const result = st.newProfile(comp,compName)
		const currentVal = st.valOfPath(path);
		params.forEach(p=>{
			if (currentVal && currentVal[p.id] !== undefined)
				result[p.id] = currentVal[p.id]
		})
		st.writeValue(st.refOfPath(path),result,srcCtx)
	},

	setSugarComp: (path,compName,param,srcCtx) => {
		var emptyVal = (param.type||'').indexOf('[') == -1 ? '' : [];
		var currentVal = st.valOfPath(path);
		if (currentVal && typeof currentVal == 'object') {
			var properties = Object.getOwnPropertyNames(currentVal);
			if (properties.length == 1 && properties[0].indexOf('$') == 0)
				currentVal = currentVal[properties[0]];
			else
				currentVal = st.valOfPath(path+'~'+param.id,true) || st.valOfPath(path+'~$'+compName,true);
		}
		if (currentVal && !Array.isArray(currentVal) && (param.type||'').indexOf('[') != -1)
			currentVal = [currentVal];
		st.writeValue(st.refOfPath(path),jb.obj('$'+compName,currentVal || emptyVal),srcCtx)
	},

	insertControl: (path,compName,srcCtx) => {
		const comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		let newCtrl = st.newProfile(comp,compName)
		if (st.controlParams(path)[0] == 'fields' && newCtrl.$ != 'field')
			newCtrl = { $: 'field.control', control : newCtrl};
		// find group parent that can insert the control
		if (path.indexOf('~') == -1)
			path = path + '~impl';
		var group_path = path;
		while (st.controlParams(group_path).length == 0 && group_path)
			group_path = st.parentPath(group_path);
		var group_ref = st.getOrCreateControlArrayRef(group_path,srcCtx);
		if (group_ref)
			st.push(group_ref,[newCtrl],srcCtx);
	},
    // if drop destination is not an array item, fix it
   	moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (st.valOfPath(to) === undefined)
				jb.writeValue(st.refOfPath(to),[],srcCtx);
			if (!Array.isArray(st.valOfPath(to)))
				jb.writeValue(st.refOfPath(to),[st.valOfPath(to)],srcCtx);
				
            to += '~' + st.valOfPath(to).length;
		}
		return jb.move(st.refOfPath(from),st.refOfPath(to),srcCtx)
	},

	addArrayItem: (path,{toAdd,srcCtx, index} = {}) => {
		const val = st.valOfPath(path);
		toAdd = toAdd === undefined ? {$:''} : toAdd;
		if (Array.isArray(val)) {
			if (index === undefined)
				st.push(st.refOfPath(path),[toAdd],srcCtx);
			else
				st.splice(st.refOfPath(path),[[val.length,0,toAdd]],srcCtx);
//			return { newPath: path + '~' + (val.length-1) }
		}
		else if (!val) {
			st.writeValueOfPath(path,toAdd,srcCtx);
		} else {
			st.writeValueOfPath(path,[val].concat(toAdd),srcCtx);
//			return { newPath: path + '~1' }
		}
	},

	wrapWithArray: (path,srcCtx) => {
		var val = st.valOfPath(path);
		if (val && !Array.isArray(val))
			st.writeValueOfPath(path,[val],srcCtx);
	},

	makeLocal: (path,srcCtx) =>{
		var comp = st.compOfPath(path);
		if (!comp || typeof comp.impl != 'object') return;
		st.writeValueOfPath(path,st.evalProfile(jb.prettyPrint(comp.impl)),srcCtx);
	},
	getOrCreateControlArrayRef: (path,srcCtx) => {
		var val = st.valOfPath(path);
		var prop = st.controlParams(path)[0];
		if (!prop)
			return console.log('getOrCreateControlArrayRef: no control param');
		var ref = st.refOfPath(path+'~'+prop);
		if (val[prop] === undefined)
			jb.writeValue(ref,[],srcCtx);
		else if (!Array.isArray(val[prop])) // wrap
			jb.writeValue(ref,[val[prop]],srcCtx);
		ref = st.refOfPath(path+'~'+prop);
		return ref;
	},
	evalProfile: prof_str => {
		try {
			return (st.previewWindow || window).eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile:'+prof_str);
		}
	},

  pathOfRef: ref =>
  		ref && ref.path().join('~'),
	nameOfRef: ref =>
		ref.path().slice(-1)[0].split(':')[0],
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

jb.component('studio.ref', { /* studio.ref */
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) =>
		st.refOfPath(path)
})

jb.component('studio.path-of-ref', { /* studio.pathOfRef */
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) =>
		st.pathOfRef(ref)
})

jb.component('studio.name-of-ref', { /* studio.nameOfRef */
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) =>
		st.nameOfRef(ref)
})


jb.component('studio.is-new', { /* studio.isNew */
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		if (st.compsHistory.length == 0 || st.previewjb.comps.$jb_selectionPreview) return false;
		var res =  JSON.stringify(jb.path(st.compsHistory.slice(-1)[0].before,path.split('~'))) !=
					JSON.stringify(jb.path(st.previewjb.comps,path.split('~')));
		return res;
	}
})

jb.component('studio.watch-path', { /* studio.watchPath */
  type: 'feature',
  category: 'group:0',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {
      id: 'includeChildren',
      as: 'string',
      options: 'yes,no,structure',
      defaultValue: 'no',
      description: 'watch childern change as well'
    },
    {
      id: 'delay',
      as: 'number',
      description: 'delay in activation, can be used to set priority'
    },
    {
      id: 'allowSelfRefresh',
      as: 'boolean',
      description: 'allow refresh originated from the components or its children',
      type: 'boolean',
      defaultValue: true
    }
  ],
  impl: (ctx,path,includeChildren,delay,allowSelfRefresh) => ({
      init: cmp =>
      	jb.ui.watchRef(ctx,cmp,st.refOfPath(path),{includeChildren,delay,allowSelfRefresh})
  })
})

jb.component('studio.watch-script-changes', { /* studio.watchScriptChanges */
  type: 'feature',
  impl: ctx => ({
      init: cmp =>
        st.scriptChange.takeUntil( cmp.destroyed ).debounceTime(200).subscribe(e=>
            jb.ui.setState(cmp,null,e,ctx))
   })
})

jb.component('studio.watch-components', { /* studio.watchComponents */
  type: 'feature',
  impl: ctx => ({
      init: cmp =>
        st.scriptChange.takeUntil( cmp.destroyed ).filter(e=>e.path.length == 1)
        	.subscribe(e=>
            	jb.ui.setState(cmp,null,e,ctx))
   })
})


jb.component('studio.watch-typeof-script', { /* studio.watchTypeofScript */
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  type: 'feature',
  impl: (ctx,path) => ({
      init: cmp =>
    	jb.ui.refObservable(st.refOfPath(path),cmp,{ includeChildren: 'yes', srcCtx: ctx})
    		.filter(e=>
    			(typeof e.oldVal == 'object') != (typeof e.newVal == 'object'))
    		.subscribe(e=>
        		jb.ui.setState(cmp,null,e,ctx))
   })
})

})()
