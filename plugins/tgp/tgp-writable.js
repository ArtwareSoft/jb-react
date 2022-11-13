jb.extension('tgp', 'writable', {
	initExtension() {
		jb.watchableComps.startWatch()
	},
	ref: (path,silent) => {
		const _path = path.split('~')
		jb.watchableComps.handler.makeWatchable && jb.watchableComps.handler.makeWatchable(_path[0])
		const ref = jb.watchableComps.handler.refOfPath(_path,silent)
		if (!ref) return
		ref.jbToUse = jb
		return ref
	},
	valOfRef: ref => jb.watchableComps.handler.val(ref),
	objectProperty: (obj,prop) => jb.watchableComps.handler.objectProperty(obj,prop),
	isRef: ref => jb.watchableComps.handler.isRef(ref),
	asRef: obj => jb.watchableComps.handler.asRef(obj),

	pathOfRef: ref => ref && ref.path().join('~'),
	nameOfRef: ref => ref.path().slice(-1)[0].split(':')[0],
	valSummaryOfRef: ref => jb.tgp.valSummary(jb.val(ref)),
	
	writeValue: (ref,value,ctx) => jb.watchableComps.handler.writeValue(ref,value,ctx),
	splice: (ref,args,ctx) => jb.watchableComps.handler.splice(ref,args,ctx),
	push: (ref,value,ctx) => jb.watchableComps.handler.push(ref,value,ctx),
	merge: (ref,value,ctx) => jb.watchableComps.handler.merge(ref,value,ctx),
 
	//refreshRef: ref => jb.watchableComps.handler.refresh(ref),
	writeValueOfPath: (path,value,ctx) => jb.tgp.writeValue(jb.tgp.ref(path),value,ctx),
	clone(profile) {
		if (typeof profile !== 'object') return profile
		return jb.tgp.evalProfile(jb.utils.prettyPrint(profile,{noMacros: true}))
	},
	evalProfile(prof_str) {
		try {
			return jb.frame.eval('('+prof_str+')')
			//return (jb.studio.previewWindow() || window).eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile',{prof_str})
		}
	},	
	newProfile(comp,compName,path) {
		const currentVal = path && jb.tgp.valOfPath(path)
		const result = { $: compName }
		jb.utils.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = currentVal == null  || Array.isArray(currentVal) ? [] : jb.asArray(currentVal)
			if (p.templateValue)
				result[p.id] = JSON.parse(JSON.stringify(p.templateValue))
		})
		return result
	},
	setComp(path,compName,srcCtx) {
		const comp = compName && jb.tgp.getComp(compName)
		if (!compName || !comp) return
		const params = jb.utils.compParams(comp)

		const result = jb.tgp.newProfile(comp,compName)
		const currentVal = jb.tgp.valOfPath(path)
		params.forEach(p=>{
			if (currentVal && currentVal[p.id] !== undefined)
				result[p.id] = currentVal[p.id]
		})
		jb.tgp.writeValue(jb.tgp.ref(path),result,srcCtx)
	},

    // if drop destination is not an array item, fix it
   	moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (jb.tgp.valOfPath(to) === undefined)
				jb.db.writeValue(jb.tgp.ref(to),[],srcCtx)
			if (!Array.isArray(jb.tgp.valOfPath(to)))
				jb.db.writeValue(jb.tgp.ref(to),[jb.tgp.valOfPath(to)],srcCtx)

            to += '~' + jb.tgp.valOfPath(to).length
		}
		return jb.db.move(jb.tgp.ref(from),jb.tgp.ref(to),srcCtx)
	},

	addArrayItem(path,{toAdd,srcCtx, index} = {}) {
		const val = jb.tgp.valOfPath(path)
		toAdd = toAdd === undefined ? {$:''} : toAdd
		if (Array.isArray(val)) {
			if (index === undefined || index == -1)
				jb.tgp.push(jb.tgp.ref(path),[toAdd],srcCtx)
			else
				jb.tgp.splice(jb.tgp.ref(path),[[index,0,toAdd]],srcCtx)
		}
		else if (!val) {
			jb.tgp.writeValueOfPath(path,toAdd,srcCtx)
		} else {
			jb.tgp.writeValueOfPath(path,[val].concat(toAdd),srcCtx)
		}
	},
})

jb.component('tgp.ref', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jb.tgp.ref(path)
})

jb.defComponents('pathOfRef,nameOfRef'.split(','), f => jb.component(`tgp.${f}`, { 
	params: [
		{id: 'ref', defaultValue: '%%', mandatory: true},
		{id: 'func', as: 'string', defaultValue: f}
	  ],
	impl: ({},ref,f) => jb.tgp[f](ref),
	require: `() => #jb.tgp.${f}()`
}))

jb.component('tgp.boolRef', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => ({
        $jb_val(value) {
            if (value === undefined)
                return jb.toboolean(jb.tgp.ref(path))
            else
				jb.db.writeValue(jb.tgp.ref(path),!!value,ctx)
        }
	})
})

jb.component('tgp.profileValueAsText', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => ({
		$jb_path: () => path.split('~'),
			$jb_val: function(value) {
				if (value == undefined) {
					const val = jb.tgp.valOfPath(path);
					if (val == null)
						return '';
					if (jb.utils.isPrimitiveValue(val))
						return '' + val
					if (jb.tgp.compNameOfPath(path))
						return '=' + jb.tgp.compNameOfPath(path)
				}
				else if (value.indexOf('=') != 0)
					jb.tgp.writeValueOfPath(path, valToWrite(value),ctx);

        function valToWrite(val) {
          const type = (jb.tgp.paramDef(path) || {}).as
          if (type == 'number' && Number(val)) return +val
          if (type == 'boolean')
            return val === 'true' ? true : val === 'false' ? false : '' + val
          return '' + val
        }
      }
    })
})

jb.component('tgp.getOrCreateCompInArray', {
	type: 'data',
	params: [
		{id: 'path', as: 'string', mandatory: true},
		{id: 'compId', as: 'string', mandatory: true}
	],
	impl: (ctx,path,compId) => {
		let arrayRef = jb.tgp.ref(path)
		let arrayVal = jb.val(arrayRef)
		if (!arrayVal) {
		  jb.db.writeValue(arrayRef,{$: compId},ctx)
		  return path
		} else if (!Array.isArray(arrayVal) && arrayVal.$ == compId) {
		  return path
		} else {
		  if (!Array.isArray(arrayVal)) { // If a different comp, wrap with array
			jb.db.writeValue(arrayRef,[arrayVal],ctx)
			arrayRef = jb.tgp.ref(path)
			arrayVal = jb.val(arrayRef)
		  }
		  const existingFeature = arrayVal.findIndex(f=>f.$ == compId)
		  if (existingFeature != -1) {
			return `${path}~${existingFeature}`
		  } else {
			const length = arrayVal.length
			jb.db.push(arrayRef,{$: compId},ctx)
			return `${path}~${length}`
		  }
		}
	}
})

jb.component('tgp.wrap', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'compId', as: 'string', mandatory: true}
  ],
  impl: (ctx,path,compId) => {
        const comp = jb.tgp.getComp(compId)
        const compositeParam = jb.utils.compParams(comp).filter(p=>p.composite)[0]
        if (compositeParam) {
            const singleOrArray = compositeParam.type.indexOf('[') == -1 ? jb.tgp.valOfPath(path) : [jb.tgp.valOfPath(path)]
            const result = { $: compId, [compositeParam.id]: singleOrArray}
            jb.tgp.writeValueOfPath(path,result,ctx)
        }
    }
})

jb.component('tgp.addProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		// if (jb.tgp.paramType(path) == 'data')
		// 	return jb.tgp.writeValueOfPath(path,'')
		const param = jb.tgp.paramDef(path)
		const paramType = jb.tgp.paramType(path)
		const result = param.defaultValue ? JSON.parse(JSON.stringify(param.defaultValue))
			: (paramType.indexOf('data') != -1 || jb.frame.jbInvscode) ? '' : {$: 'TBD'}
		
		jb.tgp.writeValueOfPath(path,result,ctx)
	}
})

jb.component('tgp.duplicateArrayItem', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		const prop = path.split('~').pop()
		const val = jb.tgp.valOfPath(path)
		const parent_ref = jb.tgp.ref(jb.tgp.parentPath(path))
		if (parent_ref && Array.isArray(jb.tgp.valOfRef(parent_ref)))
			jb.tgp.splice(parent_ref,[[Number(prop), 0,jb.tgp.clone(val)]],ctx)
	}
})

jb.component('tgp.addArrayItem', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'toAdd', as: 'single'},
    {id: 'index', as: 'number', defaultValue: -1}
  ],
  impl: (srcCtx,path,toAdd,index) => jb.tgp.addArrayItem(path, {srcCtx, toAdd , index})
})

jb.component('tgp.wrapWithArray', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    const val = jb.tgp.valOfPath(path)
    if (val && !Array.isArray(val))
        jb.tgp.writeValueOfPath(path,[val],ctx)
  }
})

jb.component('tgp.setComp', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'comp', as: 'single'}
  ],
  impl: (ctx,path,comp) => jb.tgp.setComp(path, comp,ctx)
})

jb.component('tgp.delete', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		if (path.match(/\$vars~[0-9]+~val$/) && !jb.tgp.valOfPath(path)) // delete empty variable if deleting the value
			path = jb.tgp.parentPath(path)
		const prop = path.split('~').pop()
		const parent = jb.tgp.valOfPath(jb.tgp.parentPath(path))
		if (Array.isArray(parent)) {
			const index = Number(prop)
			jb.tgp.splice(jb.tgp.ref(jb.tgp.parentPath(path)),[[index, 1]],ctx)
		} else {
			jb.tgp.writeValueOfPath(path,undefined,ctx)
		}
	}
})

jb.component('tgp.toggleDisabled', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
        const prof = jb.tgp.valOfPath(path)
        if (prof && typeof prof == 'object' && !Array.isArray(prof))
            jb.tgp.writeValue(jb.tgp.ref(path+'~$disabled'),prof.$disabled ? null : true,ctx)
    }
})