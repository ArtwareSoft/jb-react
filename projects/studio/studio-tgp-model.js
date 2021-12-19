	// nonControlChildren: (path,includeFeatures) =>
	// 	jb.tgp.paramsOfPath(path).filter(p=>!jb.studio.isControlType(p.type))
	// 		.filter(p=>includeFeatures || p.id != 'features')
	// 		.map(p=>path + '~' + p.id),

	// arrayChildren(path,noExtraElem) {
	// 	const val = jb.tgp.valOfPath(path)
	// 	if (!Array.isArray(val)) return []
	// 	return Object.getOwnPropertyNames(val)
	// 			.filter(x=> x.indexOf('$jb_') != 0)
	// 			.filter(x=> !(noExtraElem && x =='length'))
	// 			.map(x=>x=='length'? val.length : x) // extra elem
	// 			.map(k=> path +'~'+k)
	// },
	// isExtraElem(path) {
	// 	const parentVal = jb.tgp.valOfPath(jb.tgp.parentPath(path));
	// 	if (Array.isArray(parentVal))
	// 		return parentVal.length == (path.match(/~([0-9]+)$/) || ['',-1])[1]
	// },
	// asArrayChildren(path) { // support the case of single element - used by properties features
	// 	const val = jb.tgp.valOfPath(path)
	// 	if (Array.isArray(val))
	// 		return jb.studio.arrayChildren(path,true)
	// 	else if (val)
	// 		return [path]
	// },
	// isControlType: type => (type||'').split('[')[0].match(/^(control|options|menu.option|table-field|d3g.pivot)$/),
	// controlParams: path => jb.tgp.paramsOfPath(path).filter(p=>jb.studio.isControlType(p.type)).map(p=>p.id),

	// summary(path) {
	// 	const val = jb.tgp.valOfPath(path);
	// 	if (path.match(/~cases~[0-9]*$/))
	// 		return jb.tgp.summary(path+'~condition')
	// 	if (typeof val == 'string')
	// 		return val
	// 	if (val == null || typeof val != 'object') 
	// 		return '';
	// 	if (path.match(/~\$vars$/))
	// 		return jb.asArray(val).map(x=>x.name).join(', ')
	// 	return jb.tgp.paramsOfPath(path).map(x=>x.id)
	// 			.filter(p=> p != '$')
	// 			.filter(p=> p.indexOf('$jb_') != 0)
	// 			.map(p=>val[p])
	// 			.filter(v=>typeof v != 'object')
	// 			.join(', ');
	// },

	// shortTitle(path) {
	// 	if (path == '') return '';
	// 	if (path.indexOf('~') == -1)
	// 		return path;
	// 	if (path.match(/~impl$/))
	// 		return path.split('~')[0];

	// 	const val = jb.tgp.valOfPath(path);
	// 	const fieldTitle = jb.asArray(val && val.features).filter(x=>x.$ == 'field.title').map(x=>x.title)[0]
	// 	return fieldTitle || (val && typeof val.title == 'string' && val.title) || (val && val.Name) || (val && val.remark) || (val && jb.tgp.compNameOfPath(path)) || path.split('~').pop();
	// },
	// icon(path) {
	// 	if (jb.tgp.parentPath(path)) {
	// 		const parentVal = jb.tgp.valOfPath(jb.tgp.parentPath(path));
	// 		if (Array.isArray(parentVal) && path.split('~').pop() == parentVal.length)
	// 			return 'add';
	// 	}
	// 	if (jb.studio.paramType(path) == 'control') {
	// 		if (jb.tgp.valOfPath(path+'~style',true) && jb.tgp.compNameOfPath(path+'~style') == 'layout.horizontal')
	// 			return 'view_column'
	// 		return 'folder_open'; //'view_headline' , 'folder_open'
	// 	}
	// 	const comp2icon = {
	// 		label: 'font_download',
	// 		button: 'crop_landscape',
	// 		tab: 'tab',
	// 		image: 'insert_photo',
	// 		'custom-control': 'build',
	// 		'editable-text': 'data_usage',
	// 		'editable-boolean': 'radio_button',
	// 		'editable-number': 'donut_large',
	// 	}
	// 	const compName = jb.tgp.compNameOfPath(path);
	// 	if (comp2icon[compName])
	// 		return comp2icon[compName];

	// 	if (jb.tgp.isOfType(path,'action'))
	// 		return 'play_arrow'

	// 	return '';
	// },
	// isArrayType: path => ((jb.tgp.paramDef(path)||{}).type||'').indexOf('[]') != -1,
	// isOfType(path,type) {
	// 	const types = type.split(',')
	// 	if (types.length > 1)
	// 		return types.some(t=>jb.tgp.isOfType(path,t))
	// 	if (path.match(/~impl$/)) path = path.replace('~impl','')
    // 	if (path.indexOf('~') == -1)
	// 	  return jb.studio.isCompNameOfType(path,type)
	// 	const paramDef = jb.tgp.paramDef(path) || {}
	// 	if (type == 'style' && (paramDef.type || '').indexOf('.style') != -1)
	// 		return true
	// 	return (paramDef.type || 'data').split(',')
	// 		.map(x=>x.split('[')[0]).filter(_t=>type.split(',').indexOf(_t) != -1).length
	// },
	// PTsOfType(type) {
	// 	const single = /([^\[]*)(\[\])?/;
	// 	const types = [].concat.apply([],(type||'').split(',')
	// 		.map(x=>
	// 			x.match(single)[1])
	// 		.map(x=>
	// 			x=='data' ? ['data','aggregator','boolean'] : [x]));
	// 	const comp_arr = types.map(t=>
	// 		jb.entries(jb.comps)
	// 			.filter(c=> jb.studio.isCompObjOfType(c[1],t))
	// 			.map(c=>c[0]));
	// 	return comp_arr.reduce((all,ar)=>all.concat(ar),[]);
	// },
	// isCompNameOfType(name,type) {
	// 	const comp = name && jb.comps[name];
	// 	if (comp) {
	// 		while (jb.comps[name] && !(jb.comps[name].type || jb.comps[name].typePattern) && jb.utils.compName(jb.comps[name].impl))
	// 			name = jb.utils.compName(jb.comps[name].impl);
	// 		return jb.comps[name] && jb.studio.isCompObjOfType(jb.comps[name],type);
	// 	}
	// },
	// isCompObjOfType: (compObj,type) => (compObj.type||'data').split(',').indexOf(type) != -1
	// 	|| (compObj.typePattern && compObj.typePattern(type)),

	// // single first param type
	// paramType(path) {
	// 	const res = ((jb.tgp.paramDef(path) || {}).type || 'data').split(',')[0].split('[')[0];
	// 	if (res == '$asParent' || res == '*')
	// 		return jb.studio.paramType(jb.tgp.parentPath(path));
	// 	return res;
	// },
	// PTsOfPath: path => jb.tgp.PTsOfType(jb.studio.paramType(path)),
	// profilesOfPT: pt => jb.entries(jb.comps).filter(c=> c[1].impl.$ == pt).map(c=>c[0]),
	// propName(path) {
	// 	if (!isNaN(Number(path.split('~').pop()))) // array elements
	// 		return jb.tgp.parentPath(path).split('~').pop().replace(/s$/,'');

	// 	const paramDef = jb.tgp.paramDef(path);
	// 	if (!paramDef) return '';
	// 	const val = jb.tgp.valOfPath(path);
	// 	if ((paramDef.type ||'').indexOf('[]') != -1) {
	// 		const length = jb.studio.arrayChildren(path).length;
	// 		if (length)
	// 			return path.split('~').pop() + ' (' + length + ')';
	// 	}

	// 	return path.split('~').pop();
	// },

// 	pathParents(path,includeThis) {
// 		const result = ['']
// 		path.split('~').reduce((acc,p) => {
// 			const path = [acc,p].filter(x=>x).join('~')
// 			result.push(path)
// 			return path
// 		} ,'')
// 		return result.reverse().slice(includeThis ? 0 : 1)
// 	}
// })

