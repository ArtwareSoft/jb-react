(function() {
var st = jb.studio;
//import {st.profileFromPath,parentPath,profileRefFromPath,pathFixer} from './studio-path';
//import {jbart_base,findjBartToLook,compAsStr,getComp,modifyOperationsEm,evalProfile} from './studio-utils';

// The jbart control model return string paths and methods to fix them on change

class TgpModel {
	constructor(rootPath,childrenType) { 
		this.rootPath = rootPath;
		this.childrenType = childrenType;
	}

	val(path) { 
		return st.profileFromPath(path) 
	}

	subNodes(path,childrenType) {
		if (childrenType == 'jb-editor')
			return this.jbEditorSubNodes(path);

		var val = st.profileFromPath(path);
		if (childrenType == 'controls') {
			return [].concat.apply([],
				this.controlParams(path).map(prop=>
					childPath(prop)))
				.concat(this.innerControlPaths(path));
			// var prop = this.controlParams(path);
			// if (!prop || !val[prop]) 
			// 	var out = [];
			// else
			// 	var out = childPath(prop);
			//return out.concat(this.innerControlPaths(path));
		} else if (childrenType == 'non-controls') {
			return this.nonControlParams(path).map(prop=>path + '~' + prop)
		} else if (childrenType == 'array') {
			if (!val) 
				return [];
			else if (!Array.isArray(val)) 
				return [path];
			else
				return val.map((inner, i) => path + '~' + i)
		}

		function childPath(prop) {
			if (Array.isArray(val[prop]))
				return val[prop].map((inner, i) => path + '~' + prop + '~' + i)
			else
				return [path + '~' + prop]
		}
	}

	innerControlPaths(path) {
		var out = ['action~content'] // add more inner paths here
			.map(x=>path+'~'+x)
			.filter(p=>
				this.paramType(p) == 'control');
		return out;
	}


	jbEditorSubNodes(path) {
		var val = st.profileFromPath(path);
		if (!val || typeof val != 'object') return [];
		var compName = jb.compName(val);
		var comp = getComp(compName);
		if (Array.isArray(val))
			return Object.getOwnPropertyNames(val)
				.map(x=>x=='length'? val.length : x)
				.map(k=> path +'~'+k)
		else if (val['$'+compName]) { // sugar
			var arr = val['$'+compName];
			var res_path = path + '~$' + compName;
			if (Array.isArray(arr)) // sugar array. e.g. $pipeline: [ .. ]
				return Object.getOwnPropertyNames(arr)
					.map(x=>x=='length'? arr.length : x)
					.map(k=> res_path +'~'+k)

			return [res_path];
		} else if (comp) {
			var composite = jb_compParams(comp)
				.filter(p=>
					p.composite)
				.map(p=>flattenArray(p.id));

			return (composite[0] || []).concat(jb_compParams(comp)
					.filter(p=>!p.composite)
					.map(p=> ({ path: path + '~' + p.id, param: p}))
					.filter(e=>st.profileFromPath(e.path) != null || e.param.essential)
					.map(e=>e.path)
				)
		}

		function flattenArray(prop) {
			var innerVal = val[prop];
			if (Array.isArray(innerVal))
				return Object.getOwnPropertyNames(innerVal)
					.map(x=>x=='length'? innerVal.length : x)
					.map(k=> path +'~'+prop + '~' + k)
			else
				return [path + '~' + prop]
		}

	}

	jbEditorMoreParams(path) {
		var val = st.profileFromPath(path);
		var comp = getComp(jb.compName(val||{}));
		if (comp) {
			var existing = this.jbEditorSubNodes(path);
			return jb_compParams(comp)
					.map(p=> path + '~' + p.id)
					.filter(p=> existing.indexOf(p) == -1)
		}
		return [];
	}


	jbEditorTitle(path, collapsed) { 
		var val = st.profileFromPath(path);
		var compName = jb.compName(val||{});
		var prop = path.split('~').pop();
		if (!isNaN(Number(prop))) // array value - title as a[i]
			prop = path.split('~').slice(-2).join('[') + ']';
		if (Array.isArray(val) && this.paramType(path) == 'data')
			compName = `pipeline (${val.length})`;
		if (Array.isArray(val) && this.paramType(path) == 'action')
			compName = `actions (${val.length})`;
		var summary = '';
		if (collapsed && typeof val == 'object')
			summary = ': ' + this.summary(path).substr(0,20);

		if (compName)
			return prop + `= <span class="treenode-val">${compName}${summary}</span>`;
		else if (typeof val == 'string')
			return prop + (collapsed ? `: <span class="treenode-val" title="${val}">${val}</span>` : '');
		return prop + (Array.isArray(val) ? ` (${val.length})` : '');
	}

	title(path, collapsed) {
		if (path == '') return '';
		collapsed = collapsed || !this.isArray(path);
		var val = st.profileFromPath(path);
		if (path.indexOf('~') == -1)
			return path;

		if (this.childrenType == 'jb-editor') 
			return this.jbEditorTitle(path,collapsed);

		return (val && typeof val.title == 'string' && val.title) || (val && val.remark) || (val && jb.compName(val)) || path.split('~').pop();
	}

	summary(path) {
		var val = st.profileFromPath(path);
		if (typeof val != 'object') return '';
		return Object.getOwnPropertyNames(val)
			.filter(p=> p != '$')
			.map(p=>val[p])
			.filter(v=>typeof v == 'string')
			.join(', ');
	}

	icon(path) {
		if (st.parentPath(path)) {
			var parentVal = st.profileFromPath(st.parentPath(path));
			if (Array.isArray(parentVal) && path.split('~').pop() == parentVal.length)
				return 'add';
		}
		if (this.paramType(path) == 'control') {
			if (st.profileFromPath(path+'~style',true) && this.compName(path+'~style') == 'layout.horizontal')
				return 'view_column'
			return 'folder_open'; //'view_headline' , 'folder_open'
		}
		var comp2icon = { 
			label: 'font_download',
			button: 'crop_landscape',
			tab: 'tab',
			image: 'insert_photo',
			'custom-control': 'build',
			'editable-text': 'data_usage',
			'editable-boolean': 'radio_button',
			'editable-number': 'donut_large',
		}
		var compName = this.compName(path);
		if (comp2icon[compName])
			return comp2icon[compName];

		if (this.isOfType(path,'action'))
			return 'play_arrow'

		return 'radio_button_unchecked';
	}

	compName(path) {
		var val = st.profileFromPath(path);
		return val && jb.compName(val);
	}

	isCompNameOfType(name,type) {
		var _jbart = st.jbart_base().comps[name] ? st.jbart_base() : jbart;
		if (name && _jbart.comps[name]) {
			while (!_jbart.comps[name].type && jb.compName(jbart.comps[name].impl))
				name = jb.compName(_jbart.comps[name].impl);
			return (_jbart.comps[name].type || '').indexOf(type) == 0;
		}
	}

	shortTitle(path) {
		return this.title(path,false);
	}

	// differnt from children() == 0, beacuse in the control tree you can drop into empty group
	isArray(path) {
		if (this.childrenType == 'jb-editor')
			return (this.children(path)||[]).length > 0;
		
		return this.controlParam(path) || this.innerControlPaths(path).length > 0;
	}

	modify(op,path,args,ctx,delayed) {
		var comp = path.split('~')[0];
		var before = getComp(comp) && compAsStr(comp);
		var res = op.call(this,path,args);
		if (res && res.newPath) // used for insert to array that creates new path
			path = res.newPath;
		jb.delay(delayed?1:0).then(()=>{
			modifyOperationsEm.next({ 
				comp: comp, 
				before: before, 
				after: compAsStr(comp), 
				path: path, 
				args: args, 
				ctx: ctx, 
//				jbart: findjBartToLook(path),
				newComp: before ? false: true
			})
		})
	}

	_delete(path,args) {
		var prop = path.split('~').pop();
		var parent = st.profileFromPath(st.parentPath(path))
		if (Array.isArray(parent)) {
			var index = Number(prop);
			parent.splice(index, 1);
			if (!args || !args.noFixer)
				pathFixer.fixIndexPaths(path,-1);
		} else { 
			// if (parent[prop] === undefined) { // array type with one element
			// 	var pathToDelete = st.parentPath(path);
			// 	var parent = st.profileFromPath(st.parentPath(pathToDelete));
			// 	var prop = pathToDelete.split('~').pop();
			// }
			delete parent[prop];
		}
	}
	// modify operations - must have same interface: path,args

	move(path,args) { // drag & drop
		var dragged = st.profileFromPath(args.dragged);
		var arr = st.profileFromPath(path);
		if (!Array.isArray(arr))
			arr = this.getOrCreateArray(path);
		if (Array.isArray(arr)) {
			var ctrlParam = this.controlParam(path);
			this._delete(args.dragged,{noFixer: true});
			var index = (args.index == -1) ? arr.length : args.index;
			arr.splice(index,0,dragged);
			pathFixer.fixMovePaths(args.dragged,path+'~'+ctrlParam+ '~' + index);
		}
	}

	moveInArray(path,args) { // drag & drop
		var arr = st.profileFromPath(st.parentPath(path));
		if (Array.isArray(arr)) {
			var index = Number(path.split('~').pop());
			var base = args.moveUp ? index -1 : index; 
			if (base <0 || base >= arr.length-1) 
				return; // the + elem
			arr.splice(base,2,arr[base+1],arr[base]);
			pathFixer.fixReplacingPaths(st.parentPath(path)+'~'+base,st.parentPath(path)+'~'+(base+1));
		}
	}

	writeValue(path,args) {
		jb.writeValue(profileRefFromPath(path),args.value);
	}

	newComp(path,args) {
        jb.studio.previewjb.comps[path] = jb.studio.previewjb.comps[path] || args.profile;
	}

	wrapWithGroup(path) {
		var result = { $: 'group', controls: [ st.profileFromPath(path) ] };
		jb.writeValue(profileRefFromPath(path),result);
	}
	wrap(path,args) {
		var comp = getComp(args.compName);
		var firstParam = jb_compParams(comp).filter(p=>p.composite)[0];
		if (firstParam) {
			var result = jb.extend({ $: args.compName }, jb.obj(firstParam.id, [st.profileFromPath(path)]));
			jb.writeValue(profileRefFromPath(path),result);
		}
	}

	getStyleComp(path) {
	    var style = this.val(path);
	    var compName = jb.compName(style);
	    if (compName == 'customStyle')
	      return { type: 'inner', path: path, style : style }
		var comp = compName && getComp(compName);
		if (jb.compName(comp.impl) == 'customStyle') 
	      return { type: 'global', path: compName, style: comp.impl, innerPath: path }
	}

	addProperty(path) {
		var parent = st.profileFromPath(st.parentPath(path));
		if (this.paramType(path) == 'data')
			return jb.writeValue(profileRefFromPath(path),'');
		var param = this.paramDef(path);
		jb.writeValue(profileRefFromPath(path),param.defaultValue || {$: ''});
	}

	duplicate(path) {
		var prop = path.split('~').pop();
		var val = st.profileFromPath(path);
		var arr = this.getOrCreateArray(st.parentPath(st.parentPath(path)));
		if (Array.isArray(arr)) {
			var clone = evalProfile(jb.prettyPrint(val));
			var index = Number(prop);
			arr.splice(index, 0,clone);
			if (index < arr.length-2)
				pathFixer.fixIndexPaths(path,1);
		}
	}

	setComp(path,args) {
		var compName = args.comp;
		var comp = compName && getComp(compName);
		if (!compName || !comp) return;
		var result = { $: compName };
		var existing = st.profileFromPath(path);
		jb_compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = [];
			if (existing && existing[p.id])
				result[p.id] = existing[p.id];
			if (p.defaultValue && typeof p.defaultValue != 'object')
				result[p.id] = p.defaultValue;
			if (p.defaultValue && typeof p.defaultValue == 'object' && (p.forceDefaultCreation || Array.isArray(p.defaultValue)))
				result[p.id] = JSON.parse(JSON.stringify(p.defaultValue));
		})
		jb.writeValue(profileRefFromPath(path),result);
	}

	insertControl(path,args) {
		var compName = args.comp;
		var comp = compName && getComp(compName);
		if (!compName || !comp) return;
		var result = { $: compName };
		// copy default values
		jb_compParams(comp).forEach(p=>{
			if (p.defaultValue || p.defaultTValue)
				result[p.id] = JSON.parse(JSON.stringify(p.defaultValue || p.defaultTValue))
		})
		// find group parent that can insert the control
		var group_path = path;
		while (!this.controlParam(group_path) && group_path)
			group_path = st.parentPath(group_path);
		var arr = this.getOrCreateArray(group_path);
		if (arr) {
			arr.push(result);
			args.modifiedPath = [group_path,this.controlParam(group_path),arr.length-1].join('~');
		}
	}

	addArrayItem(path,args) {
		var val = st.profileFromPath(path);
		var toAdd = args.toAdd || {$:''};
		if (Array.isArray(val)) {
			val.push(toAdd);
			return { newPath: path + '~' + (val.length-1) }
		}
		else if (!val) {
			jb.writeValue(profileRefFromPath(path),toAdd);
		} else {
			jb.writeValue(profileRefFromPath(path),[val].concat(toAdd));
			return { newPath: path + '~1' }
		}
	}

	wrapWithArray(path) {
		var val = st.profileFromPath(path);
		if (val && !Array.isArray(val)) {
			jb.writeValue(profileRefFromPath(path),[val]);
			return { newPath: path + '~0' }
		}
	}

	makeLocal(path) {
		var compName = this.compName(path);
		var comp = compName && getComp(compName);
		if (!compName || !comp || typeof comp.impl != 'object') return;
		var res = JSON.stringify(comp.impl, (key, val) => typeof val === 'function' ? ''+val : val , 4);

		var profile = st.profileFromPath(path);
		// inject conditional param values
		jb_compParams(comp).forEach(p=>{ 
				var pUsage = '%$'+p.id+'%';
				var pVal = '' + (profile[p.id] || p.defaultValue || '');
				res = res.replace(new RegExp('{\\?(.*?)\\?}','g'),(match,condition_exp)=>{ // conditional exp
						if (condition_exp.indexOf(pUsage) != -1)
							return pVal ? condition_exp : '';
						return match;
					});
		});
		// inject param values 
		jb_compParams(comp).forEach(p=>{ 
				var pVal = '' + (profile[p.id] || p.defaultValue || ''); // only primitives
				res = res.replace(new RegExp(`%\\$${p.id}%`,'g') , pVal);
		});

		jb.writeValue(profileRefFromPath(path),evalProfile(res));
	}

	children(path,childrenType) {
		childrenType = childrenType || this.childrenType || 'controls';
		this.cache = this.cache || {};
		var res = this.subNodes(path,childrenType);
		if (!jb.compareArrays(res, this.cache[path]))
			this.cache[path] = res;

		return this.cache[path];
	}

	paramDef(path) {
		if (!st.parentPath(path)) // no param def for root
			return;
		if (!isNaN(Number(path.split('~').pop()))) // array elements
			path = st.parentPath(path);
		var parent_prof = st.profileFromPath(st.parentPath(path),true);
		var comp = parent_prof && getComp(jb.compName(parent_prof));
		var params = jb_compParams(comp);
		var paramName = path.split('~').pop();
		return params.filter(p=>p.id==paramName)[0] || {};
	}

	isOfType(path,type) {
		var paramDef = this.paramDef(path);
		if (paramDef)
			return (paramDef.type || 'data').split(',')
				.map(x=>x.split('[')[0]).indexOf(type) != -1;
		return this.isCompNameOfType(this.compName(path),type);
	}
	// single first param type
	paramType(path) {
		var res = ((this.paramDef(path) || {}).type || 'data').split(',')[0].split('[')[0];
		if (res == '*')
			return paramType(st.parentPath(path));
		return res;
	}
	PTsOfPath(path) {
		return this.PTsOfType(this.paramType(path),findjBartToLook(path))
	}
	PTsOfType(type,jbartToLook) {
		var single = /([^\[]*)([])?/;
		var types = [].concat.apply([],(type||'').split(',')
			.map(x=>
				x.match(single)[1])
			.map(x=> 
				x=='data' ? ['data','aggregator'] : [x]));
		var comp_arr = types.map(t=>
			jb_entries((jbartToLook || st.jbart_base()).comps)
				.filter(c=>
					(c[1].type||'data').split(',').indexOf(t) != -1
					|| (c[1].typePattern && t.match(c[1].typePattern.match))
				)
				.map(c=>c[0]));
		return comp_arr.reduce((all,ar)=>all.concat(ar),[]);
	}
	controlParam(path) {
		return this.controlParams(path)[0];
	}
	controlParams(path) {
		var prof = st.profileFromPath(path,true);
		if (!prof) return [];
		var params = jb_compParams(getComp(jb.compName(prof)));
		return params.filter(p=>(p.type||'').match(/control|options|menu/)).map(p=>p.id)
	}
	nonControlParams(path) {
		var prof = st.profileFromPath(path);
		if (!prof) return [];
		var params = jb_compParams(getComp(jb.compName(prof)));
		return params.filter(p=>
				(p.type||'').indexOf('control')==-1)
			.map(p=>p.id)
	}

	getOrCreateArray(path) {
		var val = st.profileFromPath(path);
		var prop = this.controlParam(path);
		if (!prop)
			return console.log('pushing to non array');
		if (val[prop] === undefined)
			val[prop] = [];
		if (!Array.isArray(val[prop]))
			val[prop] = [val[prop]];
		return val[prop];
	}

	propName(path) {
		if (!isNaN(Number(path.split('~').pop()))) // array elements
			return st.parentPath(path).split('~').pop().replace(/s$/,'');

		var paramDef = this.paramDef(path);
		var val = st.profileFromPath(path);
		if ((paramDef.type ||'').indexOf('[]') != -1) {
			var length = this.subNodes(path,'array').length;
			if (length)
				return path.split('~').pop() + ' (' + length + ')';
		}

		return path.split('~').pop();
	}

}

jb.studio.model = new TgpModel('');
jb.studio.TgpModel = TgpModel;

})()