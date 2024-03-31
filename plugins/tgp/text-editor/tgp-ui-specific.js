extension('tgp', 'ui_specific', {
	nonControlChildren: (path,includeFeatures) =>
		jb.tgp.paramsOfPath(path).filter(p=>!jb.tgp.isControlType(p.type))
			.filter(p=>includeFeatures || p.id != 'features')
			.map(p=>path + '~' + p.id),

	isControlType: type => (type||'').split('[')[0].match(/^(control|options|menu.option|table-field|d3g.axis)$/),
	controlParams: path => jb.tgp.paramsOfPath(path).filter(p=>jb.tgp.isControlType(p.type)).map(p=>p.id),

	getOrCreateControlArrayRef(path,srcCtx) {
		const val = jb.tgp.valOfPath(path)
		const prop = jb.tgp.controlParams(path)[0]
		if (!prop)
			return jb.logError('getOrCreateControlArrayRef: no control param',{path,srcCtx})
		let ref = jb.tgp.ref(path+'~'+prop)
		if (val[prop] === undefined)
			jb.db.writeValue(ref,[],srcCtx)
		else if (!Array.isArray(val[prop])) // wrap
			jb.db.writeValue(ref,[val[prop]],srcCtx)
		ref = jb.tgp.ref(path+'~'+prop)
		return ref
	}
})

component('tgp.wrapWithGroup', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => jb.tgp.writeValueOfPath(path,{ $: 'group', controls: [ jb.tgp.valOfPath(path) ] },ctx)
})

component('tgp.insertControl', {
  type: 'action',
  params: [
    {id: 'comp', mandatory: true, description: 'comp name or comp json'},
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,compToInsert,path) => {
    let newCtrl = compToInsert
    if (typeof compToInsert == 'string') {
        const comp = compToInsert && jb.tgp.compById(compToInsert)
        if (!compToInsert || !comp) return
        newCtrl = jb.tgp.newProfile(comp).result
    }

    // find group parent that can insert the control
    if (path.indexOf('~') == -1)
        path = path + '~impl'
    let group_path = path
    while (jb.tgp.controlParams(group_path).length == 0 && group_path)
        group_path = jb.tgp.parentPath(group_path)
    const group_ref = jb.tgp.getOrCreateControlArrayRef(group_path,ctx)
    if (group_path == jb.tgp.parentPath(jb.tgp.parentPath(path)))
        jb.tgp.splice(group_ref,[[Number(path.split('~').pop())+1, 0,newCtrl]],ctx)
    else if (group_ref)
        jb.tgp.push(group_ref,[newCtrl],ctx)	}
})

component('tgp.duplicateControl', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
		const prop = path.split('~').pop()
		const val = jb.tgp.valOfPath(path)
		const parent_ref = jb.tgp.getOrCreateControlArrayRef(jb.tgp.parentPath(jb.tgp.parentPath(path)))
		if (parent_ref)
			jb.tgp.splice(parent_ref,[[Number(prop), 0,jb.tgp.clone(val)]],ctx)
	}
})
