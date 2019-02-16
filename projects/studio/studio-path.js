(function() { var st = jb.studio;

//  var types = ['focus','apply','check','suggestions','writeValue','render','probe','setState'];
jb.issuesTolog = [];

function compsRef(val,opEvent) {
  if (typeof val == 'undefined')
    return st.previewjb.comps;
  else {
		// if (val.$jb_historyIndex && val == st.compsHistory[val.$jb_historyIndex].after)
		// 	st.compsHistory.slice()

		val.$jb_selectionPreview = opEvent && opEvent.srcCtx && opEvent.srcCtx.vars.selectionPreview;
		if (!val.$jb_selectionPreview)
  		st.compsHistory.push({before: st.previewjb.comps, after: val, opEvent: opEvent, undoIndex: st.undoIndex});

    st.previewjb.comps = val;
    if (opEvent)
      st.undoIndex = st.compsHistory.length;
  }
}

st.compsRefHandler = new jb.ui.ImmutableWithPath(compsRef);
st.compsRefHandler.resourceChange.subscribe(e=>{
	jb.log('script-change',[e.path.join('.'),e]);
	st.lastStudioActivity= new Date().getTime()
})
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
  refObservable: (ref,cmp,settings) =>
  	st.compsRefHandler.refObservable(ref,cmp,settings),
  refOfPath: (path,silent) =>
  	st.compsRefHandler.refOfPath(path.split('~'),silent),
  parentPath: path =>
		path.split('~').slice(0,-1).join('~'),
  valOfPath: (path,silent) =>
  	st.val(st.refOfPath(path,silent)),
  compNameOfPath: (path,silent) => {
    if (path.indexOf('~') == -1)
      return 'jb-component';
    if (path.match(/~\$vars$/)) return;
    var prof = st.valOfPath(path,silent); // + (path.indexOf('~') == -1 ? '~impl' : '');
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
});


// write operations with logic

Object.assign(st, {
	_delete: (path,srcCtx) => {
		var prop = path.split('~').pop();
		var parent = st.valOfPath(st.parentPath(path))
		if (Array.isArray(parent)) {
			var index = Number(prop);
			st.splice(st.refOfPath(st.parentPath(path)),[[index, 1]],srcCtx)
		} else {
			st.writeValueOfPath(path,null,srcCtx);
		}
	},

	wrapWithGroup: (path,srcCtx) =>
		st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] },srcCtx),

	wrap: (path,compName,srcCtx) => {
		var comp = st.getComp(compName);
		var compositeParam = jb.compParams(comp).filter(p=>p.composite)[0];
		if (compositeParam) {
			var singleOrArray = compositeParam.type.indexOf('[') == -1 ? st.valOfPath(path) : [st.valOfPath(path)];
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
		var param = st.paramDef(path);
		var result = param.defaultValue || {$: ''};
		if (st.paramTypeOfPath(path).indexOf('data') != -1)
			result = '';
		if (param.type.indexOf('[') != -1)
			result = [];
		st.writeValueOfPath(path,result,srcCtx);
	},

	duplicateControl: (path,srcCtx) => {
		var prop = path.split('~').pop();
		var val = st.valOfPath(path);
		var parent_ref = st.getOrCreateControlArrayRef(st.parentPath(st.parentPath(path)));
		if (parent_ref) {
			var clone = st.evalProfile(jb.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]],srcCtx);
		}
	},
	duplicateArrayItem: (path,srcCtx) => {
		var prop = path.split('~').pop();
		var val = st.valOfPath(path);
		var parent_ref = st.refOfPath(st.parentPath(path));
		if (parent_ref && Array.isArray(st.val(parent_ref))) {
			var clone = st.evalProfile(jb.prettyPrint(val));
			st.splice(parent_ref,[[Number(prop), 0,clone]],srcCtx);
		}
	},
	disabled: path => {
		var prof = st.valOfPath(path);
		return prof && typeof prof == 'object' && prof.$disabled;
	},
	toggleDisabled: (path,srcCtx) => {
		var prof = st.valOfPath(path);
		if (prof && typeof prof == 'object' && !Array.isArray(prof))
			st.writeValue(st.refOfPath(path+'~$disabled'),prof.$disabled ? null : true,srcCtx)
	},
	setComp: (path,compName,srcCtx) => {
		var comp = compName && st.getComp(compName);
		if (!compName || !comp) return;
		var params = jb.compParams(comp);
		if (params.length == 1 && params[0].composite == true)
			return st.setSugarComp(path,compName,params[0],srcCtx);

		var result = comp.singleInType ? {} : { $: compName };
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
			st.writeValue(st.refOfPath(path),result,srcCtx)
		else
			st.merge(st.refOfPath(path),result,srcCtx);
	},

	setSugarComp: (path,compName,param,srcCtx) => {
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
		st.writeValue(st.refOfPath(path),jb.obj('$'+compName,currentVal || emptyVal),srcCtx)
	},

	insertControl: (path,compName,srcCtx) => {
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
		var group_ref = st.getOrCreateControlArrayRef(group_path,srcCtx);
		if (group_ref)
			st.push(group_ref,[newCtrl],srcCtx);
	},
    // if dest is not an array item, fix it
   moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (st.valOfPath(to) === undefined)
                jb.writeValue(st.refOfPath(to),[],srcCtx);
            to += '~' + st.valOfPath(to).length;
		}
		return jb.move(st.refOfPath(from),st.refOfPath(to),srcCtx)
	},

	addArrayItem: (path,toAdd,srcCtx) => {
		var val = st.valOfPath(path);
		var toAdd = toAdd || {$:''};
		if (Array.isArray(val)) {
			st.push(st.refOfPath(path),[toAdd],srcCtx);
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

		// var res = JSON.stringify(comp.impl, (key, val) => typeof val === 'function' ? ''+val : val , 4);
		//
		// var profile = st.valOfPath(path);
		// // inject conditional param values
		// jb.compParams(comp).forEach(p=>{
		// 		var pUsage = '%$'+p.id+'%';
		// 		var pVal = '' + (profile[p.id] || p.defaultValue || '');
		// 		res = res.replace(new RegExp('{\\?(.*?)\\?}','g'),(match,condition_exp)=>{ // conditional exp
		// 				if (condition_exp.indexOf(pUsage) != -1)
		// 					return pVal ? condition_exp : '';
		// 				return match;
		// 			});
		// });
		// // inject param values
		// jb.compParams(comp).forEach(p=>{
		// 		var pVal = '' + (profile[p.id] || p.defaultValue || ''); // only primitives
		// 		res = res.replace(new RegExp(`%\\$${p.id}%`,'g') , pVal);
		// });
		//
		// st.writeValueOfPath(path,st.evalProfile(res));
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
			return st.previewWindow.eval('('+prof_str+')')
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
		if (st.compsHistory.length == 0 || st.previewjb.comps.$jb_selectionPreview) return false;
		var version_before = new jb.ui.ImmutableWithPath(_=>st.compsHistory.slice(-1)[0].before).refOfPath(path.split('~'),true);
		var res =  JSON.stringify(st.valOfPath(path)) != JSON.stringify(st.val(version_before));
//		var res =  st.valOfPath(path) && !st.val(version_before);
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
    	jb.ui.refObservable(st.refOfPath(path),cmp,{ includeChildren: true})
    		.filter(e=>
    			(typeof e.oldVal == 'object') != (typeof e.newVal == 'object'))
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
