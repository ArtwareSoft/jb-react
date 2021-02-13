if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['notebook-worker'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
var { studio } = jb.ns('studio');
eval(jb.importAllMacros());

(function() {
const st = jb.studio

Object.assign(st, {
  compsHistory: [],
  scriptChange: jb.callbag.subject(),
  compsRefOfjbm(jbm, {historyWin, compsRefId} = {historyWin: 5, compsRefId: 'comps'}) {
	function compsRef(val,opEvent,{source}= {}) {
		if (typeof val == 'undefined')
			return jbm.comps
		else {
			if (historyWin) updateHistory(val,opEvent,source)
			jbm.comps = val
		}
	}
	compsRef.id = compsRefId
	return compsRef

	function updateHistory(val, opEvent, source) {
		val.$jb_selectionPreview = opEvent && opEvent.srcCtx && opEvent.srcCtx.vars.selectionPreview
		if (!val.$jb_selectionPreview && source != 'probe') {
			st.compsHistory.push({before: jbm.comps, after: val, opEvent: opEvent, undoIndex: st.undoIndex})
			if (st.compsHistory.length > historyWin)
				st.compsHistory = st.compsHistory.slice(-1*historyWin)
		}
			if (opEvent)
				st.undoIndex = st.compsHistory.length
	}
  },
  initLocalCompsRefHandler(compsRef,compId) {
	if (st.compsRefHandler) return
    st.compsRefHandler = jb.initExtraWatchableHandler(compsRef)
    st.compsRefHandler.resourceReferred(compId)
    jb.callbag.subscribe(e=>st.scriptChange.next(e))(st.compsRefHandler.resourceChange)
  },

  initReplaceableCompsRefHandler(compsRef, {allowedTypes}) {
  	// CompsRefHandler may need to be replaced when reloading the preview iframe
 	const {pipe,subscribe,takeUntil} = jb.callbag
	const oldHandler = st.compsRefHandler
	oldHandler && oldHandler.stopListening.next(1)
	st.compsRefHandler = jb.initExtraWatchableHandler(compsRef, {oldHandler, initUIObserver: true})
	st.compsRefHandler.allowedTypes = st.compsRefHandler.allowedTypes.concat(allowedTypes)
	st.compsRefHandler.stopListening = jb.callbag.subject()

	pipe(st.compsRefHandler.resourceChange,
		takeUntil(st.compsRefHandler.stopListening),
		subscribe(e=>{
			jb.log('script changed',{ctx: e.srcCtx,e})
			st.scriptChange.next(e)
			writeValueToDataResource(e.path,e.newVal)
			if (st.isStudioCmp(e.path[0]))
				st.refreshStudioComponent(e.path)
			st.lastStudioActivity = new Date().getTime()
			e.srcCtx.run(writeValue('%$studio/lastStudioActivity%',() => st.lastStudioActivity))

			st.highlightByScriptPath && st.highlightByScriptPath(e.path)
	}))

	function writeValueToDataResource(path,value) {
		if (path.length > 1 && ['watchableData','passiveData'].indexOf(path[1]) != -1) {
			const resource = jb.removeDataResourcePrefix(path[0])
			const dataPath = '%$' + [resource, ...path.slice(2)].map(x=>isNaN(+x) ? x : `[${x}]`).join('/') + '%'
			return st.previewjb.exec(writeValue(dataPath,_=>value))
		}
	}	
  },

  // adaptors
  val: v => st.compsRefHandler.val(v),
  writeValue: (ref,value,ctx) => st.compsRefHandler.writeValue(ref,value,ctx),
  objectProperty: (obj,prop) => st.compsRefHandler.objectProperty(obj,prop),
  splice: (ref,args,ctx) => st.compsRefHandler.splice(ref,args,ctx),
  push: (ref,value,ctx) => st.compsRefHandler.push(ref,value,ctx),
  merge: (ref,value,ctx) => st.compsRefHandler.merge(ref,value,ctx),
  isRef: ref => st.compsRefHandler.isRef(ref),
  asRef: obj => st.compsRefHandler.asRef(obj),
  //refreshRef: ref => st.compsRefHandler.refresh(ref),
  refOfPath: (path,silent) => {
		const _path = path.split('~')
		st.compsRefHandler.resourceReferred && st.compsRefHandler.resourceReferred(_path[0])
		const ref = st.compsRefHandler.refOfPath(_path,silent)
		if (!ref) return
		ref.jbToUse = st.previewjb
		return ref
  },
  parentPath: path => path.split('~').slice(0,-1).join('~'),
  parents: path => path.split('~').reduce((acc,last,i) => acc.concat(i ? [acc[acc.length-1],last].join('~') : last),[]).reverse(),
  valOfPath: path => jb.path(st.previewjb.comps,path.split('~')),
  compNameOfPath: (path,silent) => {
    if (path.indexOf('~') == -1)
      return 'jbComponent'
    if (path.match(/~\$vars$/)) return
    const prof = st.valOfPath(path,silent)
  	return jb.compName(prof) || jb.compName(prof,st.paramDef(path))
  },
  paramDef: path => {
	if (!st.parentPath(path)) // no param def for root
		return;
	if (!isNaN(Number(path.split('~').pop()))) // array elements
		path = st.parentPath(path);
	// const parent_prof = st.valOfPath(st.parentPath(path),true);
	// const comp = parent_prof && st.getComp(jb.compName(parent_prof));
	const comp = st.compOfPath(st.parentPath(path),true);
	const params = jb.compParams(comp);
	const paramName = path.split('~').pop();
	if (paramName.indexOf('$') == 0) // sugar
		return params[0];
	return params.filter(p=>p.id==paramName)[0];
  },
  compOfPath: (path,silent) => st.getComp(st.compNameOfPath(path,silent)),
  paramsOfPath: (path,silent) => jb.compParams(st.compOfPath(path,silent)),
  writeValueOfPath: (path,value,ctx) => st.writeValue(st.refOfPath(path),value,ctx),
  getComp: id => st.previewjb.comps[id],
  compAsStr: id => jb.prettyPrintComp(id,st.getComp(id),{comps: jb.studio.previewjb.comps}),
  isStudioCmp: id => (jb.path(jb.comps,[id,jb.location,0]) || '').indexOf('!st!') != -1
})

// write operations with logic

Object.assign(st, {
	_delete: (path,srcCtx) => {
		if (path.match(/\$vars~[0-9]+~val$/) && !st.valOfPath(path)) // delete empty variable if deleting the value
			path = st.parentPath(path)
		const prop = path.split('~').pop()
		const parent = st.valOfPath(st.parentPath(path))
		if (Array.isArray(parent)) {
			const index = Number(prop)
			st.splice(st.refOfPath(st.parentPath(path)),[[index, 1]],srcCtx)
		} else {
			st.writeValueOfPath(path,undefined,srcCtx)
		}
	},
	wrapWithGroup: (path,srcCtx) => st.writeValueOfPath(path,{ $: 'group', controls: [ st.valOfPath(path) ] },srcCtx),
	wrap(path,compName,srcCtx) {
		const comp = st.getComp(compName)
		const compositeParam = jb.compParams(comp).filter(p=>p.composite)[0]
		if (compositeParam) {
			const singleOrArray = compositeParam.type.indexOf('[') == -1 ? st.valOfPath(path) : [st.valOfPath(path)]
			const result = { $: compName, [compositeParam.id]: singleOrArray}
			st.writeValueOfPath(path,result,srcCtx)
		}
	},
	addProperty(path,srcCtx) {
		// if (st.paramTypeOfPath(path) == 'data')
		// 	return st.writeValueOfPath(path,'')
		const param = st.paramDef(path)
		let result = param.defaultValue || {$: ''}
		if (st.paramTypeOfPath(path).indexOf('data') != -1)
			result = ''
		if ((param.type ||'').indexOf('[') != -1)
			result = []
		st.writeValueOfPath(path,result,srcCtx)
	},
	clone(profile) {
		if (typeof profile !== 'object') return profile
		return st.evalProfile(jb.prettyPrint(profile,{noMacros: true}))
	},
	duplicateControl(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = st.valOfPath(path)
		const parent_ref = st.getOrCreateControlArrayRef(st.parentPath(st.parentPath(path)))
		if (parent_ref)
			st.splice(parent_ref,[[Number(prop), 0,st.clone(val)]],srcCtx)
	},
	duplicateArrayItem(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = st.valOfPath(path)
		const parent_ref = st.refOfPath(st.parentPath(path))
		if (parent_ref && Array.isArray(st.val(parent_ref)))
			st.splice(parent_ref,[[Number(prop), 0,st.clone(val)]],srcCtx)
	},
	disabled(path) {
		const prof = st.valOfPath(path)
		return prof && typeof prof == 'object' && prof.$disabled
	},
	toggleDisabled(path,srcCtx) {
		const prof = st.valOfPath(path)
		if (prof && typeof prof == 'object' && !Array.isArray(prof))
			st.writeValue(st.refOfPath(path+'~$disabled'),prof.$disabled ? null : true,srcCtx)
	},
	newProfile(comp,compName) {
		const result = { $: compName }
		jb.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = []
			if (p.templateValue)
				result[p.id] = JSON.parse(JSON.stringify(p.templateValue))
		})
		return result
	},
	setComp(path,compName,srcCtx) {
		const comp = compName && st.getComp(compName)
		if (!compName || !comp) return
		const params = jb.compParams(comp)

		const result = st.newProfile(comp,compName)
		const currentVal = st.valOfPath(path)
		params.forEach(p=>{
			if (currentVal && currentVal[p.id] !== undefined)
				result[p.id] = currentVal[p.id]
		})
		st.writeValue(st.refOfPath(path),result,srcCtx)
	},

	insertControl(path,compToInsert,srcCtx) {
		let newCtrl = compToInsert
		if (typeof compToInsert == 'string') {
			const comp = compToInsert && st.getComp(compToInsert)
			if (!compToInsert || !comp) return
			newCtrl = st.newProfile(comp,compToInsert)
		}

		// find group parent that can insert the control
		if (path.indexOf('~') == -1)
			path = path + '~impl'
		let group_path = path
		while (st.controlParams(group_path).length == 0 && group_path)
			group_path = st.parentPath(group_path)
		const group_ref = st.getOrCreateControlArrayRef(group_path,srcCtx)
		if (group_path == st.parentPath(st.parentPath(path)))
			st.splice(group_ref,[[Number(path.split('~').pop())+1, 0,newCtrl]],srcCtx)
		else if (group_ref)
			st.push(group_ref,[newCtrl],srcCtx)
	},
    // if drop destination is not an array item, fix it
   	moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (st.valOfPath(to) === undefined)
				jb.writeValue(st.refOfPath(to),[],srcCtx)
			if (!Array.isArray(st.valOfPath(to)))
				jb.writeValue(st.refOfPath(to),[st.valOfPath(to)],srcCtx)

            to += '~' + st.valOfPath(to).length
		}
		return jb.move(st.refOfPath(from),st.refOfPath(to),srcCtx)
	},

	addArrayItem(path,{toAdd,srcCtx, index} = {}) {
		const val = st.valOfPath(path)
		toAdd = toAdd === undefined ? {$:''} : toAdd
		if (Array.isArray(val)) {
			if (index === undefined)
				st.push(st.refOfPath(path),[toAdd],srcCtx)
			else
				st.splice(st.refOfPath(path),[[val.length,0,toAdd]],srcCtx)
		}
		else if (!val) {
			st.writeValueOfPath(path,toAdd,srcCtx)
		} else {
			st.writeValueOfPath(path,[val].concat(toAdd),srcCtx)
		}
	},

	wrapWithArray(path,srcCtx) {
		const val = st.valOfPath(path)
		if (val && !Array.isArray(val))
			st.writeValueOfPath(path,[val],srcCtx)
	},

	getOrCreateControlArrayRef(path,srcCtx) {
		const val = st.valOfPath(path)
		const prop = st.controlParams(path)[0]
		if (!prop)
			return jb.logError('getOrCreateControlArrayRef: no control param',{path,srcCtx})
		let ref = st.refOfPath(path+'~'+prop)
		if (val[prop] === undefined)
			jb.writeValue(ref,[],srcCtx)
		else if (!Array.isArray(val[prop])) // wrap
			jb.writeValue(ref,[val[prop]],srcCtx)
		ref = st.refOfPath(path+'~'+prop)
		return ref
	},

	evalProfile(prof_str) {
		try {
			return (st.previewWindow || window).eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile',{prof_str})
		}
	},

  	pathOfRef: ref => ref && ref.path().join('~'),
	nameOfRef: ref => ref.path().slice(-1)[0].split(':')[0],
	valSummaryOfRef: ref => st.valSummary(jb.val(ref)),
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
  impl: (ctx,path) => st.refOfPath(path)
})

jb.component('studio.pathOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => st.pathOfRef(ref)
})

jb.component('studio.nameOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => st.nameOfRef(ref)
})

jb.component('studio.scriptChange', {
	type: 'rx',
	impl: source.callbag(() => st.scriptChange)
})

jb.component('studio.boolRef', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => ({
        $jb_val(value) {
            if (value === undefined)
                return jb.toboolean(st.refOfPath(path))
            else
				jb.writeValue(st.refOfPath(path),!!value,ctx)
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
		let arrayRef = st.refOfPath(path)
		let arrayVal = jb.val(arrayRef)
		if (!arrayVal) {
		  jb.writeValue(arrayRef,{$: compName},ctx)
		  return path
		} else if (!Array.isArray(arrayVal) && arrayVal.$ == compName) {
		  return path
		} else {
		  if (!Array.isArray(arrayVal)) { // If a different comp, wrap with array
			jb.writeValue(arrayRef,[arrayVal],ctx)
			arrayRef = st.refOfPath(path)
			arrayVal = jb.val(arrayRef)
		  }
		  const existingFeature = arrayVal.findIndex(f=>f.$ == compName)
		  if (existingFeature != -1) {
			return `${path}~${existingFeature}`
		  } else {
			const length = arrayVal.length
			jb.push(arrayRef,{$: compName},ctx)
			return `${path}~${length}`
		  }
		}
	}
})

jb.component('studio.initLocalCompsRefHandler', {
  type: 'action',
  params: [
    {id: 'compId', as: 'string', description: 'comp to make watchable' },
    {id: 'compsRefId', as: 'string', defaultValue: 'comps'},
  ],
  impl: (ctx,compId,compsRefId) => {
	const st = jb.studio
	st.initLocalCompsRefHandler(st.compsRefOfjbm(jb, {historyWin: 5, compsRefId }), compId )
  }
})

})()
;

var {nb,studio,widget,markdown} = jb.ns('nb,studio,widget,markdown')

jb.component('nb.notebook', {
  type: 'control',
  params: [
    {id: 'elements', type: 'nb.elem[]'}
  ],
  impl: itemlist({
    items: '%$elements%',
    controls: group({
      layout: layout.horizontal('10'),
      controls: [
        button({raised: false, features: feature.icon({icon: 'CardText', type: 'mdi'})}),
        '%$notebookElem.editor()%',
        widget.twoTierWidget(        
          group({
            controls: (ctx,{path}) => {
                const ret = jb.run( new jb.jbCtx(ctx, { profile: jb.studio.valOfPath(path), forcePath: path, path: 'control' }), {type: 'control'})
                return ret.result(ctx)
            },
            features: followUp.flow(
                source.watchableData(studio.ref('%$path%'), 'yes'),
                sink.refreshCmp()
            )
          }), jbm.notebookWorker()),
      ],
      features: [
            variable('idx', ({},{index}) => index -1), 
            variable('path', '%$studio/project%.notebook~impl~elements~%$idx%')
        ]
    }),
    itemVariable: 'notebookElem'
  })
})

jb.component('studio.notebookElem', {
    type: 'nb.elem',
    params: [
        { id: 'result', type: 'control', dynamic: true},
        { id: 'editor', type: 'control', dynamic: true},
    ],
    impl: ctx => ctx.params
})

jb.component('nb.markdown', {
    type: 'nb.elem',
    params: [
        {id: 'markdown', as: 'string'}
    ],
    impl: studio.notebookElem(
        markdown('%$markdown%'),
//        widget.twoTierWidget(markdown(pipeline('%$profileContent%','%markdown%')), jbm.notebookWorker()),
        editableText({
            databind: studio.profileAsText('%$path%~markdown'),
            style: editableText.markdown(),
        }),
    )
})

jb.component('nb.control', {
    type: 'nb.elem',
    params: [
        {id: 'control', type: 'control', dynamic: true}
    ],
    impl: studio.notebookElem(
        '%$control()%',
        // (ctx,{profileContent,path}) => 
        //     jb.run( new jb.jbCtx(ctx, { profile: profileContent.control, forcePath: path, path: 'control' }), {type: 'control'}),

        group({ 
            controls: studio.jbEditorInteliTree('%$path%~control'),
            features: studio.jbEditorContainer('comp-in-jb-editor')
        }))
})

jb.component('nb.data', {
    type: 'nb.elem',
    params: [
        {id: 'name', as: 'string', mandatory: true},
        {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
        {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
    ],
    impl: studio.notebookElem(text('%$value%'), studio.jbEditor('%$path%~value') )
})

jb.component('nb.javascript', {
    type: 'nb.elem',
    params: [
        {id: 'code', as: 'string'}
    ],
    impl: studio.notebookElem(nb.evalCode('%$code%'), studio.editableSource('%$path%~code') )
});


};