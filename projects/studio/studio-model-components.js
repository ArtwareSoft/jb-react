(function() {
var st = jb.studio;

jb.component('studio.val', {
	params: [ {id: 'path', as: 'string', essential: true } ],
	impl: (ctx,path) =>
		st.valOfPath(path)
})

jb.component('studio.is-primitive-value', {
  params: [ {id: 'path', as: 'string', essential: true } ],
  impl: (ctx,path) =>
      st.isPrimitiveValue(st.valOfPath(path))
})

jb.component('studio.is-of-type', {
  params: [
  	{ id: 'path', as: 'string', essential: true },
  	{ id: 'type', as: 'string', essential: true },
  ],
  impl: (ctx,path,_type) =>
      st.isOfType(path,_type)
})

jb.component('studio.param-type', {
  params: [
  	{ id: 'path', as: 'string', essential: true },
  ],
  impl: (ctx,path) =>
      st.paramTypeOfPath(path)
})

jb.component('studio.PTs-of-type', {
  params: [
  	{ id: 'type', as: 'string', essential: true },
  ],
  impl: (ctx,_type) =>
      st.PTsOfType(_type)
})

jb.component('studio.categories-of-type', {
  params: [
  	{ id: 'type', as: 'string', essential: true },
  ],
  impl: (ctx,_type,marks,allCategory) => {
  	var comps = st.previewjb.comps;
  	var pts = st.PTsOfType(_type);
  	var categories = jb.unique([].concat.apply([],pts.map(pt=>
  		(comps[pt].category||'').split(',').map(c=>c.split(':')[0])
  			.concat(pt.indexOf('.') != -1 ? pt.split('.')[0] : [])
  			.filter(x=>x))))
  			.map(c=>({
  				name: c,
  				pts: ptsOfCategory(c)
  			}));
  	return categories.concat({name: 'all', pts: pts });

  	function ptsOfCategory(category) {
      var pts_with_marks = pts.filter(pt=>
      		pt.split('.')[0] == category ||
      		(comps[pt].category||'').split(',').map(x=>x.split(':')[0]).indexOf(category) != -1)
      	.map(pt=>({
	      	pt: pt,
	      	mark: (comps[pt].category||'').split(',')
	      		.filter(c=>c.indexOf(category) == 0)
	      		.map(c=>Number(c.split(':')[1] || 50))[0]
	      }))
      	.map(x=> {
      		if (x.mark == null)
      			x.mark = 50;
      		return x;
      	})
      	.filter(x=>x.mark != 0);
	  pts_with_marks.sort((c1,c2)=>c2.mark-c1.mark);
	  return pts_with_marks.map(pt=>pt.pt)
  	}
  }
})

jb.component('studio.short-title', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.shortTitle(path)
})

jb.component('studio.summary', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.summary(path)
})

jb.component('studio.has-param', {
	params: [
		{ id: 'path', as: 'string' },
		{ id: 'param', as: 'string' },
	],
	impl: (ctx,path,param) =>
		st.paramDef(path+'~'+param)
})

jb.component('studio.non-control-children', {
	params: [
		{id: 'path', as: 'string' },
		{id: 'includeFeatures', as: 'boolean' },
	],
	impl: (ctx,path,includeFeatures) =>
		st.nonControlChildren(path,includeFeatures)
})

jb.component('studio.as-array-children', {
	params: [
		{id: 'path', as: 'string' },
	],
	impl: (ctx,path) =>
		st.asArrayChildren(path)
})

jb.component('studio.comp-name',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st.compNameOfPath(path) || ''
})

jb.component('studio.param-def',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st.paramDef(path)
})

jb.component('studio.enum-options',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		((st.paramDef(path) || {}).options ||'').split(',').map(x=>({code:x,text:x}))
})

jb.component('studio.prop-name',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.propName(path)
})

jb.component('studio.more-params',{
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
        st.jbEditorMoreParams(path)
})


jb.component('studio.comp-name-ref', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => ({
			$jb_val: function(value) {
				if (typeof value == 'undefined')
					return st.compNameOfPath(path);
				else
					st.setComp(path,value)
			},
			$jb_observable: cmp =>
				st.refObservable(st.refOfPath(path),cmp,{includeChildren: true})
	})
})

jb.component('studio.profile-as-text', {
	type: 'data',
	params: [{ id: 'path', as: 'string', dynamic: true } ],
	impl: ctx => ({
		$jb_val: function(value) {
			var path = ctx.params.path();
			if (!path) return '';
			if (typeof value == 'undefined') {
				var val = st.valOfPath(path);
				if (st.isPrimitiveValue(val))
					return ''+val;
				return st.prettyPrint(val || '');
			} else {
				var newVal = value.match(/^\s*(\(|{|\[)/) ? st.evalProfile(value) : value;
				if (newVal != null)
					st.writeValueOfPath(path, newVal);
			}
		},
		$jb_observable: cmp =>
			st.refObservable(st.refOfPath(ctx.params.path()),cmp,{includeChildren: true})
	})
})

jb.component('studio.profile-as-string-byref', {
	type: 'data',
	params: [{ id: 'path', as: 'string', dynamic: true } ],
	impl: ctx => ({
		$jb_val: function(value) {
			var path = ctx.params.path();
			if (!path) return '';
			if (typeof value == 'undefined') {
				return st.valOfPath(path) || '';
			} else {
				st.writeValueOfPath(path, value);
			}
		},
		$jb_observable: cmp =>
			st.refObservable(st.refOfPath(ctx.params.path()),cmp)
	})
})

jb.component('studio.profile-value-as-text', {
  type: 'data',
  params: [ { id: 'path', as: 'string' } ],
  impl: (ctx,path) => ({
      $jb_val: function(value) {
        if (typeof value == 'undefined') {
          var val = st.valOfPath(path);
          if (val == null)
            return '';
          if (st.isPrimitiveValue(val))
            return ''+val;
          if (st.compNameOfPath(path))
            return '=' + st.compNameOfPath(path);
        }
        else if (value.indexOf('=') != 0)
          st.writeValueOfPath(path, value);
      }
    })
})

jb.component('studio.insert-control',{
	type: 'action',
	params: [
		{ id: 'path', as: 'string', defaultValue :{$: 'studio.currentProfilePath' }  },
		{ id: 'comp', as: 'string' },
	],
	impl: (ctx,path,comp,type) =>
		st.insertControl(path, comp)
})

jb.component('studio.wrap', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string' },
		{ id: 'comp', as: 'string' }
	],
	impl: (ctx,path,comp) =>
		st.wrap(path,comp)
})

jb.component('studio.wrap-with-group', {
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.wrapWithGroup(path)
})

jb.component('studio.add-property', {
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.addProperty(path)
})

jb.component('studio.duplicate-control',{
	type: 'action',
	params: [ { id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.duplicateControl(path)
})

jb.component('studio.duplicate-array-item',{
	type: 'action',
	params: [ { id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.duplicateArrayItem(path)
})

// jb.component('studio.move-in-array',{
// 	type: 'action',
// 	params: [
// 		{ id: 'path', as: 'string' },
// 		{ id: 'moveUp', type: 'boolean', as: 'boolean'}
// 	],
// 	impl: (ctx,path,moveUp) =>
// 		st.moveInArray(path,moveUp)
// })

jb.component('studio.new-array-item', {
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		st.addArrayItem(path)
})

jb.component('studio.add-array-item',{
	type: 'action',
	params: [
		{id: 'path', as: 'string' },
		{id: 'toAdd', as: 'single' }
	],
	impl: (ctx,path,toAdd) =>
		st.addArrayItem(path, toAdd)
})

jb.component('studio.wrap-with-array',{
	type: 'action',
	params: [
		{id: 'path', as: 'string' },
	],
	impl: (ctx,path,toAdd) =>
		st.wrapWithArray(path)
})

jb.component('studio.can-wrap-with-array', {
  type: 'boolean',
  params: [ {id: 'path', as: 'string' } ],
  impl: (ctx,path) =>
      st.paramDef(path) && (st.paramDef(path).type || '').indexOf('[') != -1 && !Array.isArray(st.valOfPath(path))
})

jb.component('studio.is-array-item', {
  type: 'boolean',
  params: [ {id: 'path', as: 'string' } ],
  impl: (ctx,path) =>
      Array.isArray(st.valOfPath(st.parentPath(path)))
})


jb.component('studio.set-comp',{
	type: 'action',
	params: [
		{id: 'path', as: 'string' },
		{id: 'comp', as: 'single' }
	],
	impl: (ctx,path,comp) =>
		st.setComp(path, comp)
})

jb.component('studio.delete',{
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st._delete(path)
})

jb.component('studio.disabled',{
	type: 'boolean',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st.disabled(path)
})

jb.component('studio.toggle-disabled',{
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st.toggleDisabled(path)
})

jb.component('studio.make-local',{
	type: 'action',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => st.makeLocal(path)
})

jb.component('studio.components-cross-ref',{
	type: 'data',
	impl: ctx => {
	  var _jb = st.previewjb;
	  st.scriptChange.subscribe(_=>_jb.statistics = null);
	  if (_jb.statistics) return _jb.statistics;

	  var refs = {}, comps = _jb.comps;

      Object.getOwnPropertyNames(comps).forEach(k=>
      	refs[k] = {
      		refs: calcRefs(comps[k].impl).filter((x,index,self)=>self.indexOf(x) === index) ,
      		by: []
      });
      Object.getOwnPropertyNames(comps).forEach(k=>
      	refs[k].refs.forEach(cross=>
      		refs[cross] && refs[cross].by.push(k))
      );

      return _jb.statistics = jb.entries(comps).map(e=>({
          	id: e[0],
          	refs: refs[e[0]].refs,
          	referredBy: refs[e[0]].by,
          	type: e[1].type || 'data',
          	implType: typeof e[1].impl,
          	refCount: refs[e[0]].by.length
          	//text: jb_prettyPrintComp(comps[k]),
          	//size: jb_prettyPrintComp(e[0],e[1]).length
          }));


      function calcRefs(profile) {
      	if (typeof profile != 'object') return [];
      	return Object.getOwnPropertyNames(profile).reduce((res,prop)=>
      		res.concat(calcRefs(profile[prop])),[_jb.compName(profile)])
      }
	}
})

jb.component('studio.references',{
	type: 'data',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => {
	  if (path.indexOf('~') != -1) return [];

      return jb.entries(st.previewjb.comps)
      	.filter(e=>
      		isRef(e[1].impl))
      	.map(e=>e[0]).slice(0,10);

      function isRef(profile) {
      	if (profile && typeof profile == 'object')
	      	return profile.$ == path || Object.getOwnPropertyNames(profile).reduce((res,prop)=>
	      		res || isRef(profile[prop]),false)
      }
	}
})

jb.component('studio.jb-editor.nodes', {
	type: 'tree.nodeModel',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		  new st.jbEditorTree(path)
})

jb.component('studio.icon-of-type', {
	type: 'data',
	params: [ {id: 'type', as: 'string' } ],
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

jb.component('studio.is-disabled', {
	type: 'boolean',
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		  st.disabled(path)
})

jb.component('studio.disabled-support', {
  params: [
    { id: 'path', as: 'string', essential: true },
  ],
  type: 'feature',
  impl: {$: 'conditional-class', cssClass: 'jb-disabled', condition: {$: 'studio.is-disabled', path: '%$path%'} }
})


})();
