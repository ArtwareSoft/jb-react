extension('tree', {
	ROjson: class ROjson {
		constructor(json,rootPath) {
			this.json = json
			this.rootPath = rootPath
		}
		children(path) {
			const val = this.val(path)
			const out = (typeof val == 'object') ? Object.keys(val || {}) : []
			return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p)
		}
		val(path) {
			if (path.indexOf('~') == -1)
				return jb.val(this.json)
			return jb.val(path.split('~').slice(1).reduce((o,p) =>o[p], this.json))
		}
		isArray(path) {
			const val = this.val(path)
			return typeof val == 'object' && val !== null
		}
		icon() {
			return ''
		}
		title(path,collapsed) {
			const val = this.val(path)
			const prop = path.split('~').pop()
			const h = jb.ui.h
			if (val == null)
				return h('div',{},prop + ': null')
			if (!collapsed && typeof val == 'object')
				return h('div',{},prop)
	
			if (typeof val != 'object')
				return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: ''+val},jb.ui.limitStringLength(''+val,20))])
	
			return h('div',{},[h('span',{},prop + ': ')].concat(
				Object.keys(val).filter(p=>p.indexOf('$jb_') != 0).filter(p=> ['string','boolean','number'].indexOf(typeof val[p]) != -1)
				.map(p=> h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)))))
		}
	},
	Json: class Json {
		constructor(jsonRef,rootPath) {
			this.json = jsonRef;
			this.rootPath = rootPath;
			this.refHandler = jb.db.refHandler(jsonRef)
		}
		children(path) {
			const val = this.val(path)
			const out = (typeof val == 'object') ? Object.keys(val || {}) : [];
			return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p);
		}
		val(path) {
			if (path.indexOf('~') == -1)
				return jb.val(this.json)
			return jb.val(path.split('~').slice(1).reduce((o,p) => o[p], jb.val(this.json)))
	
			function clean(v) {
				const cls = jb.path(v,'constructor.name')
				return ['Object','Array','Boolean','Number','String'].indexOf(cls) == -1 ? cls : v
			}
		}
		isArray(path) {
			var val = this.val(path);
			return typeof val == 'object' && val !== null;
		}
		icon() {
			return ''
		}
		title(path,collapsed) {
			var val = this.val(path);
			var prop = path.split('~').pop();
			var h = jb.ui.h;
			if (val == null)
				return prop + ': null';
			if (!collapsed && typeof val == 'object')
				return prop
	
			if (typeof val != 'object')
				return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: val},jb.ui.limitStringLength(val,20))]);
	
			return h('div',{},[h('span',{},prop + ': ')].concat(
				Object.keys(val).filter(p=> typeof val[p] == 'string' || typeof val[p] == 'number' || typeof val[p] == 'boolean')
				.map(p=> h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)))))
		}
		modify(op,path,args,ctx) {
			op.call(this,path,args);
		}
		move(dragged,_target,ctx) { // drag & drop
			const draggedArr = this.val(dragged.split('~').slice(0,-1).join('~'));
			const target = isNaN(Number(_target.split('~').slice(-1))) ? _target + '~0' : _target
			const targetArr = this.val(target.split('~').slice(0,-1).join('~'));
			if (Array.isArray(draggedArr) && Array.isArray(targetArr))
				jb.db.move(jb.db.asRef(this.val(dragged)), this.val(target) ? jb.db.asRef(this.val(target)) : this.extraArrayRef(target) ,ctx)
		}
		extraArrayRef(target) {
			const targetArr = this.val(target.split('~').slice(0,-1).join('~'));
			const targetArrayRef = jb.db.asRef(targetArr)
			const handler = targetArrayRef.handler
			return handler && handler.refOfPath(handler.pathOfRef(targetArrayRef).concat(target.split('~').slice(-1)))
		}
	}	
})

component('tree.jsonReadOnly', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'single', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: ({}, json, rootPath) => new jb.tree.ROjson(json,rootPath)
})

component('tree.json', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'ref', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: ({}, json, rootPath) => new jb.tree.Json(json,rootPath)
})