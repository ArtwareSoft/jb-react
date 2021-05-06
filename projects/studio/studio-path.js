jb.extension('watchableComps', 'studio', {
	initExtension_phase40() {
		  jb.studio.scriptChange && jb.utils.subscribe(jb.watchableComps.handler.resourceChange, e => jb.watchableComps.scriptChangeHnadler(e))
  	},
	scriptChangeHnadler(e) {
		jb.log('watchable studio script changed',{ctx: e.srcCtx,e})
		jb.studio.scriptChange.next(e)
		writeValueToDataResource(e.path,e.newVal)
		if (jb.studio.isStudioCmp(e.path[0]))
			jb.studio.refreshStudioComponent(e.path)
		jb.studio.lastStudioActivity = new Date().getTime()
		e.srcCtx.run(writeValue('%$studio/lastStudioActivity%',() => jb.studio.lastStudioActivity))
	
		jb.studio.highlightByScriptPath(e.path)
	
		function writeValueToDataResource(path,value) {
			if (path.length > 1 && ['watchableData','passiveData'].indexOf(path[1]) != -1) {
				const resource = jb.db.removeDataResourcePrefix(path[0])
				const dataPath = '%$' + [resource, ...path.slice(2)].map(x=>isNaN(+x) ? x : `[${x}]`).join('/') + '%'
				return jb.exec(writeValue(dataPath,_=>value))
			}
		}
	},  
})


jb.extension('studio', 'path', {
  initExtension() { return { 
	  previewjb: jb,
	  scriptChange: jb.callbag.subject()
  }},
  execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.core.jbCtx().run(...args),
  // adaptors
  val: v => jb.watchableComps.handler.val(v),
  writeValue: (ref,value,ctx) => jb.watchableComps.handler.writeValue(ref,value,ctx),
  objectProperty: (obj,prop) => jb.watchableComps.handler.objectProperty(obj,prop),
  splice: (ref,args,ctx) => jb.watchableComps.handler.splice(ref,args,ctx),
  push: (ref,value,ctx) => jb.watchableComps.handler.push(ref,value,ctx),
  merge: (ref,value,ctx) => jb.watchableComps.handler.merge(ref,value,ctx),
  isRef: ref => jb.watchableComps.handler.isRef(ref),
  asRef: obj => jb.watchableComps.handler.asRef(obj),
  //refreshRef: ref => jb.watchableComps.handler.refresh(ref),
  refOfPath: (path,silent) => {
		const _path = path.split('~')
		jb.watchableComps.handler.makeWatchable && jb.watchableComps.handler.makeWatchable(_path[0])
		const ref = jb.watchableComps.handler.refOfPath(_path,silent)
		if (!ref) return
		ref.jbToUse = jb
		return ref
  },
  parentPath: path => path.split('~').slice(0,-1).join('~'),
  parents: path => path.split('~').reduce((acc,last,i) => acc.concat(i ? [acc[acc.length-1],last].join('~') : last),[]).reverse(),
  valOfPath: path => jb.path(jb.comps,path.split('~')),
  compNameOfPath: (path,silent) => {
    if (path.indexOf('~') == -1)
      return 'jbComponent'
    if (path.match(/~\$vars$/)) return
    const prof = jb.studio.valOfPath(path,silent)
  	return jb.utils.compName(prof) || jb.utils.compName(prof,jb.studio.paramDef(path))
  },
  paramDef: path => {
	if (!jb.studio.parentPath(path))
		return { type: jb.path(jb.comps[path],'type')};
	if (!isNaN(Number(path.split('~').pop()))) // array elements
		path = jb.studio.parentPath(path);
	// const parent_prof = jb.studio.valOfPath(jb.studio.parentPath(path),true);
	// const comp = parent_prof && jb.studio.getComp(jb.utils.compName(parent_prof));
	const comp = jb.studio.compOfPath(jb.studio.parentPath(path),true);
	const params = jb.utils.compParams(comp);
	const paramName = path.split('~').pop();
	if (paramName.indexOf('$') == 0) // sugar
		return params[0];
	return params.filter(p=>p.id==paramName)[0];
  },
  compOfPath: (path,silent) => jb.studio.getComp(jb.studio.compNameOfPath(path,silent)),
  paramsOfPath: (path,silent) => jb.utils.compParams(jb.studio.compOfPath(path,silent)),
  writeValueOfPath: (path,value,ctx) => jb.studio.writeValue(jb.studio.refOfPath(path),value,ctx),
  getComp: id => jb.comps[id],
  compAsStr: id => jb.utils.prettyPrintComp(id,jb.studio.getComp(id)),
  isStudioCmp: id => jb.path(jb.comps,[id,jb.core.project]) == 'studio'
})

// write operations with logic

jb.extension('studio', {
	_delete(path,srcCtx) {
		if (path.match(/\$vars~[0-9]+~val$/) && !jb.studio.valOfPath(path)) // delete empty variable if deleting the value
			path = jb.studio.parentPath(path)
		const prop = path.split('~').pop()
		const parent = jb.studio.valOfPath(jb.studio.parentPath(path))
		if (Array.isArray(parent)) {
			const index = Number(prop)
			jb.studio.splice(jb.studio.refOfPath(jb.studio.parentPath(path)),[[index, 1]],srcCtx)
		} else {
			jb.studio.writeValueOfPath(path,undefined,srcCtx)
		}
	},
	wrapWithGroup: (path,srcCtx) => jb.studio.writeValueOfPath(path,{ $: 'group', controls: [ jb.studio.valOfPath(path) ] },srcCtx),
	wrap(path,compName,srcCtx) {
		const comp = jb.studio.getComp(compName)
		const compositeParam = jb.utils.compParams(comp).filter(p=>p.composite)[0]
		if (compositeParam) {
			const singleOrArray = compositeParam.type.indexOf('[') == -1 ? jb.studio.valOfPath(path) : [jb.studio.valOfPath(path)]
			const result = { $: compName, [compositeParam.id]: singleOrArray}
			jb.studio.writeValueOfPath(path,result,srcCtx)
		}
	},
	addProperty(path,srcCtx) {
		// if (jb.studio.paramTypeOfPath(path) == 'data')
		// 	return jb.studio.writeValueOfPath(path,'')
		const param = jb.studio.paramDef(path)
		const paramType = jb.studio.paramTypeOfPath(path)
		const result = param.defaultValue ? JSON.parse(JSON.stringify(param.defaultValue))
			: (paramType.indexOf('data') != -1 || jb.frame.jbInvscode) ? '' : {$: ''}
		
		jb.studio.writeValueOfPath(path,result,srcCtx)
	},
	clone(profile) {
		if (typeof profile !== 'object') return profile
		return jb.studio.evalProfile(jb.utils.prettyPrint(profile,{noMacros: true}))
	},
	duplicateControl(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = jb.studio.valOfPath(path)
		const parent_ref = jb.studio.getOrCreateControlArrayRef(jb.studio.parentPath(jb.studio.parentPath(path)))
		if (parent_ref)
			jb.studio.splice(parent_ref,[[Number(prop), 0,jb.studio.clone(val)]],srcCtx)
	},
	duplicateArrayItem(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = jb.studio.valOfPath(path)
		const parent_ref = jb.studio.refOfPath(jb.studio.parentPath(path))
		if (parent_ref && Array.isArray(jb.studio.val(parent_ref)))
			jb.studio.splice(parent_ref,[[Number(prop), 0,jb.studio.clone(val)]],srcCtx)
	},
	disabled(path) {
		const prof = jb.studio.valOfPath(path)
		return prof && typeof prof == 'object' && prof.$disabled
	},
	toggleDisabled(path,srcCtx) {
		const prof = jb.studio.valOfPath(path)
		if (prof && typeof prof == 'object' && !Array.isArray(prof))
			jb.studio.writeValue(jb.studio.refOfPath(path+'~$disabled'),prof.$disabled ? null : true,srcCtx)
	},
	newProfile(comp,compName) {
		const result = { $: compName }
		jb.utils.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = []
			if (p.templateValue)
				result[p.id] = JSON.parse(JSON.stringify(p.templateValue))
		})
		return result
	},
	setComp(path,compName,srcCtx) {
		const comp = compName && jb.studio.getComp(compName)
		if (!compName || !comp) return
		const params = jb.utils.compParams(comp)

		const result = jb.studio.newProfile(comp,compName)
		const currentVal = jb.studio.valOfPath(path)
		params.forEach(p=>{
			if (currentVal && currentVal[p.id] !== undefined)
				result[p.id] = currentVal[p.id]
		})
		jb.studio.writeValue(jb.studio.refOfPath(path),result,srcCtx)
	},

	insertControl(path,compToInsert,srcCtx) {
		let newCtrl = compToInsert
		if (typeof compToInsert == 'string') {
			const comp = compToInsert && jb.studio.getComp(compToInsert)
			if (!compToInsert || !comp) return
			newCtrl = jb.studio.newProfile(comp,compToInsert)
		}

		// find group parent that can insert the control
		if (path.indexOf('~') == -1)
			path = path + '~impl'
		let group_path = path
		while (jb.studio.controlParams(group_path).length == 0 && group_path)
			group_path = jb.studio.parentPath(group_path)
		const group_ref = jb.studio.getOrCreateControlArrayRef(group_path,srcCtx)
		if (group_path == jb.studio.parentPath(jb.studio.parentPath(path)))
			jb.studio.splice(group_ref,[[Number(path.split('~').pop())+1, 0,newCtrl]],srcCtx)
		else if (group_ref)
			jb.studio.push(group_ref,[newCtrl],srcCtx)
	},
    // if drop destination is not an array item, fix it
   	moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (jb.studio.valOfPath(to) === undefined)
				jb.db.writeValue(jb.studio.refOfPath(to),[],srcCtx)
			if (!Array.isArray(jb.studio.valOfPath(to)))
				jb.db.writeValue(jb.studio.refOfPath(to),[jb.studio.valOfPath(to)],srcCtx)

            to += '~' + jb.studio.valOfPath(to).length
		}
		return jb.db.move(jb.studio.refOfPath(from),jb.studio.refOfPath(to),srcCtx)
	},

	addArrayItem(path,{toAdd,srcCtx, index} = {}) {
		const val = jb.studio.valOfPath(path)
		toAdd = toAdd === undefined ? {$:''} : toAdd
		if (Array.isArray(val)) {
			if (index === undefined)
				jb.studio.push(jb.studio.refOfPath(path),[toAdd],srcCtx)
			else
				jb.studio.splice(jb.studio.refOfPath(path),[[index,0,toAdd]],srcCtx)
		}
		else if (!val) {
			jb.studio.writeValueOfPath(path,toAdd,srcCtx)
		} else {
			jb.studio.writeValueOfPath(path,[val].concat(toAdd),srcCtx)
		}
	},

	wrapWithArray(path,srcCtx) {
		const val = jb.studio.valOfPath(path)
		if (val && !Array.isArray(val))
			jb.studio.writeValueOfPath(path,[val],srcCtx)
	},

	getOrCreateControlArrayRef(path,srcCtx) {
		const val = jb.studio.valOfPath(path)
		const prop = jb.studio.controlParams(path)[0]
		if (!prop)
			return jb.logError('getOrCreateControlArrayRef: no control param',{path,srcCtx})
		let ref = jb.studio.refOfPath(path+'~'+prop)
		if (val[prop] === undefined)
			jb.db.writeValue(ref,[],srcCtx)
		else if (!Array.isArray(val[prop])) // wrap
			jb.db.writeValue(ref,[val[prop]],srcCtx)
		ref = jb.studio.refOfPath(path+'~'+prop)
		return ref
	},

	evalProfile(prof_str) {
		try {
			return (jb.studio.previewWindow || window).eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile',{prof_str})
		}
	},

  	pathOfRef: ref => ref && ref.path().join('~'),
	nameOfRef: ref => ref.path().slice(-1)[0].split(':')[0],
	valSummaryOfRef: ref => jb.studio.valSummary(jb.val(ref)),
	valSummary: val => {
		if (val && typeof val == 'object')
			return val.id || val.name
		return '' + val
	},
	pathSummary: path => path.replace(/~controls~/g,'~').replace(/~impl~/g,'~').replace(/^[^\.]*./,''),
	isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
})

// ******* components ***************

jb.component('studio.ref', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jb.studio.refOfPath(path)
})

jb.component('studio.pathOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => jb.studio.pathOfRef(ref)
})

jb.component('studio.nameOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => jb.studio.nameOfRef(ref)
})

jb.component('studio.scriptChange', {
	type: 'rx',
	impl: source.callbag(() => jb.studio.scriptChange)
})

jb.component('studio.boolRef', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => ({
        $jb_val(value) {
            if (value === undefined)
                return jb.toboolean(jb.studio.refOfPath(path))
            else
				jb.db.writeValue(jb.studio.refOfPath(path),!!value,ctx)
        }
	})
})

jb.component('studio.getOrCreateCompInArray', {
	type: 'data',
	params: [
		{id: 'path', as: 'string', mandatory: true},
		{id: 'compName', as: 'string', mandatory: true}
	],
	impl: (ctx,path,compName) => {
		let arrayRef = jb.studio.refOfPath(path)
		let arrayVal = jb.val(arrayRef)
		if (!arrayVal) {
		  jb.db.writeValue(arrayRef,{$: compName},ctx)
		  return path
		} else if (!Array.isArray(arrayVal) && arrayVal.$ == compName) {
		  return path
		} else {
		  if (!Array.isArray(arrayVal)) { // If a different comp, wrap with array
			jb.db.writeValue(arrayRef,[arrayVal],ctx)
			arrayRef = jb.studio.refOfPath(path)
			arrayVal = jb.val(arrayRef)
		  }
		  const existingFeature = arrayVal.findIndex(f=>f.$ == compName)
		  if (existingFeature != -1) {
			return `${path}~${existingFeature}`
		  } else {
			const length = arrayVal.length
			jb.db.push(arrayRef,{$: compName},ctx)
			return `${path}~${length}`
		  }
		}
	}
})

jb.component('studio.isCssPath', {
    type: 'boolean',
    description: 'check if the script will change only css and not html',
    params: [
        {id: 'path'}
    ],
    impl: (ctx, path) => {
        const compPath = pathOfCssFeature(path)
        return compPath && (jb.studio.compNameOfPath(compPath) || '').match(/^(css|layout)/)

        function pathOfCssFeature(path) {
            const featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) {
              const layoutIndex = path.lastIndexOf('layout')
              return layoutIndex != -1 && path.slice(0,layoutIndex+1).join('~')
            }
            const array = Array.isArray(jb.studio.valOfPath(path.slice(0,featureIndex+1).join('~')))
            return path.slice(0,featureIndex+(array?2:1)).join('~')
        }
    }
})

jb.component('jbm.vDebugger', {
    type: 'jbm',
    impl: jbm.child('vDebugger', startup.codeLoaderServer('studio'))
})
