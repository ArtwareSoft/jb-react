(function() {
const st = jb.studio;

st.PropertiesTree = class {
	constructor(rootPath) {
		this.rootPath = rootPath;
		this.refHandler = st.compsRefHandler;
	}
	isArray(path) {
		return this.children(path).length > 0;
	}
	children(path) {
		if (st.isOfType(path,'data'))
			return []
		if (Array.isArray(st.valOfPath(path)))
			return st.arrayChildren(path,false)
		return st.paramsOfPath(path)
			.filter(p=>!st.isControlType(p.type))
			.map(prop=>path + '~' + prop.id)
	}
	val(path) {
		return st.valOfPath(path)
	}
	move(from,to,ctx) {
		return st.moveFixDestination(from,to,ctx)
	}
	disabled(path) {
		return st.disabled(path)
	}
	icon(path) {
		return st.icon(path)
	}
}

st.ControlTree = class {
	constructor(rootPath) {
		this.rootPath = rootPath;
		this.refHandler = st.compsRefHandler;
	}
	title(path,collapsed) {
		const val = st.valOfPath(path);
		if (path &&  (val == null || Array.isArray(val) && val.length == 0) && path.match(/~controls$/))
			return jb.ui.h('a',{style: {cursor: 'pointer', 'text-decoration': 'underline'}, onclick: 'newControl' },'add new');
		return this.fixTitles(st.shortTitle(path),path,collapsed)
	}
	// differnt from children() == 0, beacuse in the control tree you can drop into empty group
	isArray(path) {
		return this.children(path).length > 0;
	}
	children(path,nonRecursive) {
		return [].concat.apply([],st.controlParams(path).map(prop=>path + '~' + prop)
				.map(innerPath=> {
					const val = st.valOfPath(innerPath);
					if (Array.isArray(val) && val.length > 0)
					 return st.arrayChildren(innerPath,true);
					return [innerPath]
				}))
				.concat(nonRecursive ? [] : this.innerControlPaths(path));
	}
	move(from,to,ctx) {
		return st.moveFixDestination(from,to,ctx)
	}
	disabled(path) {
		return st.disabled(path)
	}
	icon(path) {
		return st.icon(path)
	}

	// private
	innerControlPaths(path) {
		return ['action~content','action~menu'] // add more inner paths here
			.map(x=>path+'~'+x).filter(p=>st.isControlType(st.paramTypeOfPath(p)))
	}
	fixTitles(title,path) {
		if (title == 'control-with-condition')
			return jb.ui.h('div',{},[this.title(path+'~control'),jb.ui.h('span',{class:'treenode-val'},'conditional') ]);
		return title;
	}
}

st.jbEditorTree = class {
	constructor(rootPath,includeCompHeader) {
		this.rootPath = rootPath;
		this.refHandler = st.compsRefHandler;
    	this.includeCompHeader= includeCompHeader;
	}
	title(path, collapsed) {
		let val = st.valOfPath(path);
		let compName = st.compNameOfPath(path);
		if (path.indexOf('~') == -1)
			compName = 'jbComponent'
		if (path.match(/^[^~]+~params~[0-9]+$/))
			compName = 'jbParam'
		if (compName && compName.match(/case$/))
      		compName = 'case';
		let prop = path.split('~').pop();
		if (!isNaN(Number(prop))) // array value - title as a[i]
			prop = path.split('~').slice(-2)
				.map(x=>x.replace(/\$pipeline/,'').replace(/\$obj/,''))
				.join('[') + ']';
		let summary = '';
		if (collapsed && typeof val == 'object')
			summary = ': ' + st.summary(path).substr(0,20);
		if (typeof val == 'function')
		val = val.toString();

		if (compName)
			return jb.ui.h('div',{},[prop + '= ',jb.ui.h('span',{class:'treenode-val', title: compName+summary},jb.ui.limitStringLength(compName+summary,50))]);
		else if (prop === '$vars')
			return jb.ui.h('div',{},['vars= ',jb.ui.h('span',{class:'treenode-val', title: summary},jb.ui.limitStringLength(summary,50))]);
		else if (['string','boolean','number'].indexOf(typeof val) != -1)
			return jb.ui.h('div',{},[prop + (collapsed ? ': ': ''),jb.ui.h('span',{class:'treenode-val', title: ''+val},jb.ui.limitStringLength(''+val,50))]);

		return prop + (Array.isArray(val) ? ` (${val.length})` : '');
	}
	isArray(path) {
		return this.children(path).length > 0;
	}
	children(path) {
		const val = st.valOfPath(path);
		if (!val) return [];
		return (st.arrayChildren(path) || [])
//        .concat((this.includeCompHeader && this.compHeader(path,val)) || [])
				.concat(this.vars(path,val) || [])
				.concat(this.sugarChildren(path,val) || [])
				.concat(this.specialCases(path,val) || [])
				.concat(this.innerProfiles(path,val) || [])
	}
	move(from,to,ctx) {
		return jb.move(st.refOfPath(from),st.refOfPath(to),ctx)
	}
	disabled(path) {
		return st.disabled(path)
	}
	icon(path) {
		return st.icon(path)
	}

	// private
	sugarChildren(path,val) {
		const compName = jb.compName(val);
		if (!compName) return
		const sugarPath = path + '~$' +compName;
		const sugarVal = st.valOfPath(sugarPath);
		if (Array.isArray(sugarVal)) // sugar array. e.g. $pipeline: [ .. ]
			return st.arrayChildren(sugarPath);
		else if (sugarVal)
			return [sugarPath];
	}
	innerProfiles(path,val) {
		if (this.sugarChildren(path,val)) return [];
		if (!this.includeCompHeader && path.indexOf('~') == -1)
			path = path + '~impl';
		
		return st.paramsOfPath(path).map(p=> ({ path: path + '~' + p.id, param: p}))
				.filter(e=>st.valOfPath(e.path) !== undefined || e.param.mandatory)
				.flatMap(({path})=> Array.isArray(st.valOfPath(path)) ? st.arrayChildren(path) : [path])
	}
	vars(path,val) {
		return val && typeof val == 'object' && typeof val.$vars == 'object' && [path+'~$vars']
	}

	specialCases(path,val) {
		if (jb.compName(val) == 'object' || path.match(/~\$vars$/))
			return Object.getOwnPropertyNames(val)
				.filter(p=>p!='$')
				.filter(p=>p.indexOf('$jb_') != 0)
				.map(p=>path+'~'+p);
		if (jb.compName(val) == 'if')
			return ['then','else']
		return []
	}
}


Object.assign(st,{
	jbEditorMoreParams: path =>
		st.paramsOfPath(path)
			.filter(p=>st.valOfPath(path+'~'+p.id) == null && !p.mandatory)
			.map(p=> path + '~' + p.id),

	nonControlChildren: (path,includeFeatures) =>
		st.paramsOfPath(path).filter(p=>!st.isControlType(p.type))
			.filter(p=>includeFeatures || p.id != 'features')
			.map(p=>path + '~' + p.id),

	arrayChildren: (path,noExtraElem) => {
		const val = st.valOfPath(path);
		if (Array.isArray(val))
			return Object.getOwnPropertyNames(val)
				.filter(x=> x.indexOf('$jb_') != 0)
				.filter(x=> !(noExtraElem && x =='length'))
				.map(x=>x=='length'? val.length : x) // extra elem
				.map(k=> path +'~'+k);
		return [];
	},
	isExtraElem: path => {
		const parentVal = st.valOfPath(st.parentPath(path));
		if (Array.isArray(parentVal))
			return parentVal.length == (path.match(/~([0-9]+)$/) || ['',-1])[1]
	},
	asArrayChildren: path => { // support the case of single element - used by properties features
		const val = st.valOfPath(path);
		if (Array.isArray(val))
			return st.arrayChildren(path,true)
		else if (val)
			return [path]
	},
	isControlType: type =>
		(type||'').split('[')[0].match(/^(control|options|menu.option|table-field|d3g.pivot)$/),
	controlParams: path =>
		st.paramsOfPath(path).filter(p=>st.isControlType(p.type)).map(p=>p.id),

	summary: path => {
		const val = st.valOfPath(path);
		if (path.match(/~cases~[0-9]*$/))
			return st.summary(path+'~condition');
		if (val == null || typeof val != 'object') 
			return '';
		if (path.match(/~\$vars$/))
			return Object.keys(val).join(', ')
		return st.paramsOfPath(path).map(x=>x.id)
				.filter(p=> p != '$')
				.filter(p=> p.indexOf('$jb_') != 0)
				.map(p=>val[p])
				.filter(v=>typeof v != 'object')
				.join(', ');
	},

	shortTitle: path => {
		if (path == '') return '';
		if (path.indexOf('~') == -1)
			return path;
		if (path.match(/~impl$/))
			return path.split('~')[0];

		const val = st.valOfPath(path);
		const fieldTitle = jb.asArray(val && val.features).filter(x=>x.$ == 'field.title').map(x=>x.title)[0]
		return fieldTitle || (val && typeof val.title == 'string' && val.title) || (val && val.Name) || (val && val.remark) || (val && st.compNameOfPath(path)) || path.split('~').pop();
	},
	icon: path => {
		if (st.parentPath(path)) {
			const parentVal = st.valOfPath(st.parentPath(path));
			if (Array.isArray(parentVal) && path.split('~').pop() == parentVal.length)
				return 'add';
		}
		if (st.paramTypeOfPath(path) == 'control') {
			if (st.valOfPath(path+'~style',true) && st.compNameOfPath(path+'~style') == 'layout.horizontal')
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
		const compName = st.compNameOfPath(path);
		if (comp2icon[compName])
			return comp2icon[compName];

		if (st.isOfType(path,'action'))
			return 'play_arrow'

		return '';
	},
	previewCompsAsEntries: () => jb.entries(st.previewjb.comps).filter(e=>e[1]),
	projectFiles: () => jb.exec('%$studio/projectSettings/jsFiles%'),
	projectCompsAsEntries: () => {
		const files = st.projectFiles()
		return st.previewCompsAsEntries().filter(e=> {
			const fn = e[1][jb.location] && e[1][jb.location][0].split('/').pop()
			return files.indexOf(fn) != -1
		})
	},
	// queries
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
	isArrayType: path => ((st.paramDef(path)||{}).type||'').indexOf('[]') != -1,
	isOfType: (path,type) => {
		const types = type.split(',');
		if (types.length > 1)
			return types.some(t=>st.isOfType(path,t));
		
    	if (path.indexOf('~') == -1)
		  return st.isCompNameOfType(path,type);
		const paramDef = st.paramDef(path) || {};
		if (type == 'style' && (paramDef.type || '').indexOf('.style') != -1)
			return true
		return (paramDef.type || 'data').split(',')
			.map(x=>x.split('[')[0]).filter(_t=>type.split(',').indexOf(_t) != -1).length;
	},
	PTsOfType: type => {
		const single = /([^\[]*)(\[\])?/;
		const types = [].concat.apply([],(type||'').split(',')
			.map(x=>
				x.match(single)[1])
			.map(x=>
				x=='data' ? ['data','aggregator','boolean'] : [x]));
		const comp_arr = types.map(t=>
			jb.entries(st.previewjb.comps)
				.filter(c=> st.isCompObjOfType(c[1],t))
				.map(c=>c[0]));
		return comp_arr.reduce((all,ar)=>all.concat(ar),[]);
	},
	isCompNameOfType: (name,type) => {
		const _jb = st.previewjb;
		const comp = name && _jb.comps[name];
		if (comp) {
			while (_jb.comps[name] && !(_jb.comps[name].type || _jb.comps[name].typePattern) && _jb.compName(_jb.comps[name].impl))
				name = _jb.compName(_jb.comps[name].impl);
			return _jb.comps[name] && st.isCompObjOfType(_jb.comps[name],type);
		}
	},
	isCompObjOfType: (compObj,type) => (compObj.type||'data').split(',').indexOf(type) != -1
		|| (compObj.typePattern && compObj.typePattern(type)),

	// single first param type
	paramTypeOfPath: path => {
		const res = ((st.paramDef(path) || {}).type || 'data').split(',')[0].split('[')[0];
		if (res == '$asParent' || res == '*')
			return st.paramTypeOfPath(st.parentPath(path));
		return res;
	},
	PTsOfPath: path => st.PTsOfType(st.paramTypeOfPath(path)),

	profilesOfPT: pt => // in project
		jb.entries(jb.comps).filter(c=> c[1].impl.$ == pt).map(c=>c[0]),

	propName: path =>{
		if (!isNaN(Number(path.split('~').pop()))) // array elements
			return st.parentPath(path).split('~').pop().replace(/s$/,'');

		const paramDef = st.paramDef(path);
		if (!paramDef) return '';
		const val = st.valOfPath(path);
		if ((paramDef.type ||'').indexOf('[]') != -1) {
			const length = st.arrayChildren(path).length;
			if (length)
				return path.split('~').pop() + ' (' + length + ')';
		}

		return path.split('~').pop();
	},

	closestCtxOfLastRun: pathToTrace => {
		let path = pathToTrace.split('~')
		if (pathToTrace.match(/items~0$/) && st.isExtraElem(pathToTrace)) {
				const pipelineCtx = st.previewjb.ctxByPath[path.slice(0,-2).join('~')]
				if (pipelineCtx)
					return pipelineCtx.setVars(pipelineCtx.profile.$vars || {})
			}
		if (pathToTrace.match(/items~[1-9][0-9]*$/) && st.isExtraElem(pathToTrace)) {
            const formerIndex = Number(pathToTrace.match(/items~([1-9][0-9]*)$/)[1])-1
			path[path.length-1] = formerIndex
        }

		for (;path.length > 0 && !st.previewjb.ctxByPath[path.join('~')];path.pop());
		if (path.length)
			return st.previewjb.ctxByPath[path.join('~')]
	},

	closestTestCtx: pathToTrace => {
		const compId = pathToTrace.split('~')[0]
		const statistics = new jb.jbCtx().run(studio.componentStatistics(ctx=>compId))
		const test = statistics.referredBy && statistics.referredBy.filter(refferer=>st.isOfType(refferer,'test'))[0]
		const _ctx = new st.previewjb.jbCtx()
		if (test)
			return _ctx.ctx({ profile: {$: test}, comp: test, path: ''})
		const testData = st.previewjb.comps[compId].testData
		if (testData)
			return _ctx.ctx({profile: pipeline(testData, {$: compId}), path: '' })
	},
	pathParents(path,includeThis) {
		const result = ['']
		path.split('~').reduce((acc,p) => {
			const path = [acc,p].filter(x=>x).join('~')
			result.push(path)
			return path
		} ,'')
		return result.reverse().slice(includeThis ? 0 : 1)
	}
	
})

})()
