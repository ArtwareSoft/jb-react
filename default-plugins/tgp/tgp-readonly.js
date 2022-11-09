
jb.extension('tgp', 'readOnly', {
	parentPath: path => path.split('~').slice(0,-1).join('~'),
	parents: path => path.split('~').reduce((acc,last,i) => acc.concat(i ? [acc[acc.length-1],last].join('~') : last),[]).reverse(),
	valOfPath: path => { 
		const res = jb.path(jb.comps,path.split('~'))
        if (res && res[jb.macro.isMacro])
            return res()
		return res
	},
	firstChildOfPath: path => [path,Object.keys(jb.tgp.valOfPath(path) || {}).find(x=>x != '$')].filter(x=>x).join('~'),
	compNameOfPath: (path,silent) => {
	  if (path.indexOf('~') == -1)
		return 'jbComponent'
	  if (path.match(/~\$vars$/)) 
	  	return
	  const prof = jb.tgp.valOfPath(path,silent)
	  return jb.utils.compName(prof) || jb.utils.compName(prof,jb.tgp.paramDef(path))
	},
	paramDef: path => {
	  if (!jb.tgp.parentPath(path))
		  return jb.tgp.getComp(path)
	  if (!isNaN(Number(path.split('~').pop()))) // array elements
		  path = jb.tgp.parentPath(path)
	  const comp = jb.tgp.compOfPath(jb.tgp.parentPath(path),true)
	  const params = jb.utils.compParams(comp)
	  const paramName = path.split('~').pop()
	  if (paramName.indexOf('$') == 0) // sugar
		  return params[0]
	  return params.find(p=>p.id==paramName)
	},
	compOfPath: (path,silent) => jb.tgp.getComp(jb.tgp.compNameOfPath(path,silent)),
	paramsOfPath: (path,silent) => jb.utils.compParams(jb.tgp.compOfPath(path,silent)),
	getComp: id => id && id.indexOf('<') != -1 && jb.utils.getComp(id.split('>')[1], id.split('>')[1] + '>') || jb.utils.getComp(id),
	compAsStr: id => jb.utils.prettyPrintComp(id,jb.tgp.getComp(id)),
	valSummary: val => {
		if (val && typeof val == 'object')
			return val.id || val.name
		return '' + val
	},
	pathSummary: path => path.replace(/~controls~/g,'~').replace(/~impl~/g,'~').replace(/^[^\.]*./,''),
	singleParamAsArray: path => {
		const params = jb.path(jb.tgp.compOfPath(path),'params') || []
        return params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1 && params[0]
	},
	isArrayType: path => ((jb.tgp.paramDef(path)||{}).type||'').indexOf('[]') != -1,
	isOfType(path,type) {
		const types = type.split(',')
		if (types.length > 1)
			return types.some(t=>jb.tgp.isOfType(path,t))
		if (path.match(/~impl$/)) path = path.replace('~impl','')
    	if (path.indexOf('~') == -1)
		  return jb.tgp.isCompNameOfType(path,type)
		const paramDef = jb.tgp.paramDef(path) || {}
		if (type == 'style' && (paramDef.type || '').indexOf('.style') != -1)
			return true
		return (paramDef.type || 'data').split(',')
			.map(x=>x.split('[')[0]).filter(_t=>type.split(',').indexOf(_t) != -1).length
	},
	PTsOfType(type) {
		const single = /([^\[]*)(\[\])?/
		const types = (type||'').split(',').map(x=>x.match(single)[1])
			.flatMap(x=> x=='data' ? ['data','aggregator','boolean'] : [x])
		const res = types.flatMap(t=> PTsofSingleType(t) )
		res.sort((c1,c2) => jb.tgp.markOfComp(c2) - jb.tgp.markOfComp(c1))
		return res

		function PTsofSingleType(t) {
			if (t.indexOf('<') != -1) {
				const dsl = t.split('<')[1].slice('>')[0], typeId = t.split('<')[0];
				return Object.keys(jb.path(jb.dsls,[dsl,typeId])).map(id=> `${t}${id}`)
			} else {
				return jb.entries(jb.comps).filter(c=> jb.tgp.isCompObjOfType(c[1],t)).map(c=>c[0])
			}
		}
	},
	markOfComp(id) {
		return +(((jb.tgp.getComp(id).category||'').match(/common:([0-9]+)/)||[0,0])[1])
	},
	isCompNameOfType(name,type) {
		if (name.indexOf('<') != -1)
			return name.split('<')[0] === type
		const comp = name && jb.comps[name]
		if (comp) {
			while (jb.comps[name] && !(jb.comps[name].type || jb.comps[name].typePattern) && jb.utils.compName(jb.comps[name].impl))
				name = jb.utils.compName(jb.comps[name].impl);
			return jb.comps[name] && jb.tgp.isCompObjOfType(jb.comps[name],type)
		}
	},
	isCompObjOfType: (compObj,type) => {
		const compType = !compObj.type && typeof compObj.impl == 'function' ? 'data' : compObj.type || ''
		return compType.split(',').includes(type) || (compObj.typePattern && compObj.typePattern(type))
	},

	paramTypes: path => (jb.path(jb.tgp.paramDef(path),[jb.core.CT,'dslType']) || '').split(',')
		.map(t=>t.split('[')[0])
		.map(t=> t == '$asParent' ? jb.tgp.paramType(jb.tgp.parentPath(path)) : t),
	paramType: path => jb.tgp.paramDef(path) ? jb.tgp.paramTypes(path)[0] : '',
	PTsOfPath: path => {
		const types = jb.tgp.paramTypes(path)
		if (types.length == 1)
			return jb.tgp.PTsOfType(types[0])
		const pts = jb.utils.unique(types.flatMap(t=>jb.tgp.PTsOfType(t)))
		pts.sort((c1,c2) => jb.tgp.markOfComp(c2) - jb.tgp.markOfComp(c1))
		return pts
	},
	enumOptions: path => ((jb.tgp.paramDef(path) || {}).options ||'').split(',')
		.map(x=> ({code: x.split(':')[0],text: x.split(':')[0]})),
	propName(path) {
		if (!isNaN(Number(path.split('~').pop()))) // array elements
			return jb.tgp.parentPath(path).split('~').pop().replace(/s$/,'')

		const paramDef = jb.tgp.paramDef(path)
		if (!paramDef) return ''
		if ((paramDef.type ||'').indexOf('[]') != -1) {
			const length = jb.tgp.arrayChildren(path).length
			if (length)
				return path.split('~').pop() + ' (' + length + ')'
		}

		return path.split('~').pop()
	},
	pathParents(path,includeThis) {
		const result = ['']
		path.split('~').reduce((acc,p) => {
			const path = [acc,p].filter(x=>x).join('~')
			result.push(path)
			return path
		} ,'')
		return result.reverse().slice(includeThis ? 0 : 1)
	},
	arrayChildren(path,noExtraElem) {
		const val = jb.tgp.valOfPath(path)
		if (!Array.isArray(val)) return []
		return Object.getOwnPropertyNames(val)
				.filter(x=> x.indexOf('$jb_') != 0)
				.filter(x=> !(noExtraElem && x =='length'))
				.map(x=>x=='length'? val.length : x) // extra elem
				.map(k=> path +'~'+k)
	},
	isExtraElem(path) {
		const parentVal = jb.tgp.valOfPath(jb.tgp.parentPath(path));
		if (Array.isArray(parentVal))
			return parentVal.length == (path.match(/~([0-9]+)$/) || ['',-1])[1]
	},

	summary(path) {
		const val = jb.tgp.valOfPath(path);
		if (path.match(/~cases~[0-9]*$/))
			return jb.tgp.summary(path+'~condition')
		if (typeof val == 'string')
			return val
		if (val == null || typeof val != 'object') 
			return '';
		if (path.match(/~\$vars$/))
			return jb.asArray(val).map(x=>x.name).join(', ')
		return jb.tgp.paramsOfPath(path).map(x=>x.id)
				.filter(p=> p != '$')
				.filter(p=> p.indexOf('$jb_') != 0)
				.map(p=>val[p])
				.filter(v=>typeof v != 'object')
				.join(', ');
	},

	shortTitle(path) {
		if (path == '') return '';
		if (path.indexOf('~') == -1)
			return path;
		if (path.match(/~impl$/))
			return path.split('~')[0];

		const val = jb.tgp.valOfPath(path);
		const fieldTitle = jb.asArray(val && val.features).filter(x=>x.$ == 'field.title').map(x=>x.title)[0]
		return fieldTitle || (val && typeof val.title == 'string' && val.title) || (val && val.Name) || (val && val.remark) || (val && jb.tgp.compNameOfPath(path)) || path.split('~').pop();
	},
	icon(path) {
		if (jb.tgp.parentPath(path)) {
			const parentVal = jb.tgp.valOfPath(jb.tgp.parentPath(path));
			if (Array.isArray(parentVal) && path.split('~').pop() == parentVal.length)
				return 'add';
		}
		if (jb.tgp.isOfType(path,'control')) {
			if (jb.tgp.valOfPath(path+'~style',true) && jb.tgp.compNameOfPath(path+'~style') == 'layout.horizontal')
				return 'view_column'
			return 'folder_open'; //'view_headline' , 'folder_open'
		}
		const comp2icon = {
			label: 'font_download',
			button: 'crop_landscape',
			tab: 'tab',
			image: 'insert_photo',
			'custom-control': 'build',
			'editable-text': 'data_usage',
			'editable-boolean': 'radio_button',
			'editable-number': 'donut_large',
		}
		const compName = jb.tgp.compNameOfPath(path);
		if (comp2icon[compName])
			return comp2icon[compName];

		if (jb.tgp.isOfType(path,'action'))
			return 'play_arrow'

		return '';
	},
	isDisabled: path => jb.path(jb.tgp.valOfPath(path),'$disabled'),
	moreParams: path => jb.tgp.paramsOfPath(path).filter(p=>jb.tgp.valOfPath(path+'~'+p.id) == null), // && !p.mandatory)
	canWrapWithArray: path => {
		const type = jb.tgp.paramDef(path) ? (jb.tgp.paramDef(path).type || '') : ''
		const val = jb.tgp.valOfPath(path)
		const parentVal = jb.tgp.valOfPath(jb.tgp.parentPath(path))
		return type.includes('[') && !Array.isArray(val) && !Array.isArray(parentVal)
	}
})


// ******* components ***************

jb.defComponents(
'isArrayType,parentPath,shortTitle,summary,isDisabled,enumOptions,propName,paramDef,paramType,moreParams,paramsOfPath,firstChildOfPath,canWrapWithArray'
	.split(','), f => jb.component(`tgp.${f}`, { 
	params: [
		{id: 'path', as: 'string', mandatory: true},
		{id: 'func', as: 'string', defaultValue: f}
	  ],
	  impl: ({},path,f) => jb.tgp[f](path),
	  require: `() => #jb.tgp.${f}()`
}))

jb.component('tgp.compName', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => jb.tgp.compNameOfPath(path) || ''
})

jb.component('tgp.val', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jb.tgp.valOfPath(path)
})

jb.component('tgp.isPrimitiveValue', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jb.utils.isPrimitiveValue(jb.tgp.valOfPath(path))
})

jb.component('tgp.isOfType', {
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'type', as: 'string', mandatory: true}
  ],
  impl: (ctx,path,_type) =>	jb.tgp.isOfType(path,_type)
})

jb.component('tgp.PTsOfType', {
  params: [
    {id: 'type', as: 'string', mandatory: true}
  ],
  impl: (ctx,_type) => jb.tgp.PTsOfType(_type)
})

jb.component('tgp.categoriesOfType', {
  params: [
    {id: 'type', as: 'string', mandatory: true},
  ],
  impl: (ctx,type) => {
		const comps = jb.comps;
		const pts = jb.tgp.PTsOfType(type);
		const categories = jb.utils.unique([
      'common',
      ...pts.flatMap(pt=> [
        ...(comps[pt].category||'').split(',').map(c=>c.split(':')[0]),
				...(pt.indexOf('.') != -1 ? pt.split('.').slice(0,1) : []),
        ].filter(x=>x)),
      'all'])
			.map(c=>({	code: c, pts: ptsOfCategory(c) }))
      .filter(c=>c.pts.length)
		return categories

		function ptsOfCategory(category) {
			const pts_with_marks = pts.filter(pt=>
					category == 'all' 
          || pt.split('.')[0] == category 
          || (comps[pt].category||'').split(',').map(x=>x.split(':')[0]).indexOf(category) != -1
          || category == 'common' && pt.indexOf('.') == -1 && !comps[pt].category 
        ).map(pt=>({
					pt: pt,
					mark: (comps[pt].category||'').split(',')
						.filter(c=>c.indexOf(category) == 0)
						.map(c=>Number(c.split(':')[1] || 50))[0] || 50
				}))
				// .map(x=> {
				// 	if (x.mark == null)
				// 		x.mark = 50;
				// 	return x
				// })
				.filter(x=>x.mark != 0)
			pts_with_marks.sort((c1,c2)=>c2.mark-c1.mark)
			return pts_with_marks.map(pt=>pt.pt)
		}
	}
})

jb.component('tgp.iconOfType', {
  type: 'data',
  params: [
    {id: 'type', as: 'string'}
  ],
  impl: (ctx,type) => {
		if (type.match(/.style$/))
			type = 'style';
		return ({
			action: 'play_arrow',
			data: 'data_usage',
			aggregator: 'data_usage',
			control: 'airplay',
			style: 'format_paint',
			feature: 'brush'
		}[type] || 'extension')
	}
})

jb.component('tgp.titleToId', {
  type: 'data',
  params: [
    {id: 'name', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},name) => jb.macro.titleToId(name)
})

jb.component('tgp.isArrayItem', {
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => Array.isArray(jb.tgp.valOfPath(jb.tgp.parentPath(path)))
})

