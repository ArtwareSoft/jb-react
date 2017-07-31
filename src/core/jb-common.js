jb.component('call', {
 	type: '*',
 	params: [
 		{ id: 'param', as: 'string' }
 	],
 	impl: function(context,param) {
 	  var paramObj = context.componentContext && context.componentContext.params[param];
      if (typeof(paramObj) == 'function')
 		return paramObj(new jb.jbCtx(context, {
 			data: context.data,
 			vars: context.vars,
 			componentContext: context.componentContext.componentContext,
 			forcePath: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
});

jb.pipe = function(context,items,ptName) {
	var start = [jb.toarray(context.data)[0]]; // use only one data item, the first or null
	if (typeof context.profile.items == 'string')
		return context.runInner(context.profile.items,null,'items');
	var profiles = jb.toarray(context.profile.items || context.profile[ptName]);
	if (context.profile.items && context.profile.items.sugar)
		var innerPath =  '' ;
	else
		var innerPath = context.profile[ptName] ? (ptName + '~') : 'items~';

	if (ptName == '$pipe') // promise pipe
		return profiles.reduce((deferred,prof,index) => {
			return deferred.then(data=>
				jb.synchArray(data))
			.then(data=>
				step(prof,index,data))
		}, Promise.resolve(start))

	return profiles.reduce((data,prof,index) =>
		step(prof,index,data), start)


	function step(profile,i,data) {
		var parentParam = (i == profiles.length - 1 && context.parentParam) ? context.parentParam : { as: 'array'};
		if (jb.profileType(profile) == 'aggregator')
			return jb.run( new jb.jbCtx(context, { data: data, profile: profile, path: innerPath+i }), parentParam);
		return [].concat.apply([],data.map(item =>
				jb.run(new jb.jbCtx(context,{data: item, profile: profile, path: innerPath+i}), parentParam))
			.filter(x=>x!=null)
			.map(x=> Array.isArray(jb.val(x)) ? jb.val(x) : x ));
	}
}

jb.component('pipeline',{
	type: 'data',
	description: 'map data arrays one after the other',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb.pipe(ctx,items,'$pipeline')
})

jb.component('pipe', { // synched pipeline
	type: 'data',
	description: 'map asynch data arrays',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb.pipe(ctx,items,'$pipe')
})

jb.component('data.if', {
 	type: 'data',
 	params: [
 		{ id: 'condition', type: 'boolean', as: 'boolean', essential: true},
 		{ id: 'then', essential: true, dynamic: true },
 		{ id: 'else', dynamic: true },
 	],
 	impl: (ctx,cond,_then,_else) =>
 		cond ? _then() : _else()
});

jb.component('action.if', {
 	type: 'action',
 	description: 'if then else',
 	params: [
 		{ id: 'condition', type: 'boolean', as: 'boolean', essential: true},
 		{ id: 'then', type: 'action', essential: true, dynamic: true },
 		{ id: 'else', type: 'action', dynamic: true },
 	],
 	impl: (ctx,cond,_then,_else) =>
 		cond ? _then() : _else()
});

// jb.component('apply', {
// 	description: 'run a function',
//  	type: '*',
//  	params: [
//  		{ id: 'func', as: 'single'},
//  	],
//  	impl: (ctx,func) => {
//  		if (typeof func == 'function')
//  	  		return func(ctx);
//  	}
// });

jb.component('jb-run', {
 	type: 'action',
 	params: [
 		{ id: 'profile', as: 'string', essential: true},
 		{ id: 'params', as: 'single' },
 	],
 	impl: (ctx,profile,params) =>
 		ctx.run(Object.assign({$:profile},params || {}))
});


jb.component('list', {
	type: 'data',
	description: 'also flatten arrays',
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		var out = [];
		items.forEach(item => {
			if (Array.isArray(item))
				out = out.concat(item);
			else
				out.push(item);
		});
		return out;
	}
});

jb.component('firstSucceeding', {
	type: 'data',
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		for(var i=0;i<items.length;i++)
			if (jb.val(items[i]))
				return items[i];
		// return last one if zero or empty string
		var last = items.slice(-1)[0];
		return (last != null) && jb.val(last);
	}
});

jb.component('first', {
	type: 'data',
	params: [
		{ id: 'items', type: "data", as: 'array', composite: true }
	],
	impl: (ctx,items) => items[0]
});

jb.component('property-names', {
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx,obj) =>
		jb.ownPropertyNames(obj).filter(p=>p.indexOf('$jb_') != 0)
})

jb.component('assign', {
	type: 'data',
	params: [
		{ id: 'property', essential: true, as: 'string' },
		{ id: 'value', essential: true },
		{ id: 'obj', defaultValue: '%%', as: 'single' },
	],
	impl: (ctx,prop,val,obj) =>
		Object.assign({},obj,jb.obj(prop,val))
})

jb.component('properties',{
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%', as: 'single' }
	],
	impl: (context,obj) =>
		jb.ownPropertyNames(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
});

jb.component('prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(0,text.indexOf(separator))
});

jb.component('suffix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(text.lastIndexOf(separator)+separator.length)
});

jb.component('remove-prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(text.indexOf(separator)+separator.length)
});

jb.component('remove-prefix-regex',{
	type: 'data',
	params: [
		{ id: 'prefix', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,prefix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp('^'+prefix);
		var m = (text||'').match(context.profile.prefixRegexp);
		return ((m && m.index==0 && text || '').substring(m[0].length)) || text;
	}
});

jb.component('remove-suffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(0,text.lastIndexOf(separator))
});

jb.component('remove-suffix-regex',{
	type: 'data',
	params: [
		{ id: 'suffix', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,suffix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp(suffix+'$');
		var m = (text||'').match(context.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
});

jb.component('write-value',{
	type: 'action',
	params: [
		{ id: 'to', as: 'ref', essential: true },
		{ id: 'value', essential: true}
	],
	impl: (ctx,to,value) =>
		jb.writeValue(to,jb.val(value),ctx)
});

jb.component('remove-from-array', {
	type: 'action',
	params: [
		{ id: 'array', as: 'ref', essential: true },
		{ id: 'itemToRemove', as: 'single', description: 'choose item or index' },
		{ id: 'index', as: 'number', description: 'choose item or index' },
	],
	impl: (ctx,array,itemToRemove,index) => {
		var ar = jb.toarray(array);
		var index = itemToRemove ? ar.indexOf(item) : index;
		if (index != -1 && ar.length > index)
			jb.splice(array,[[index,1]],ctx)
	}
});

jb.component('toggle-boolean-value',{
	type: 'action',
	params: [
		{ id: 'of', as: 'ref' },
	],
	impl: (ctx,_of) =>
		jb.writeValue(_of,jb.val(_of) ? false : true)
});


jb.component('slice', {
	type: 'aggregator',
	params: [
		{ id: 'start', as: 'number', defaultValue: 0, description: '0-based index', essential: true },
		{ id: 'end', as: 'number', essential: true, description: '0-based index of where to end the selection (not including itself)' }
	],
	impl: function(context,begin,end) {
		if (!context.data || !context.data.slice) return null;
		return end ? context.data.slice(begin,end) : context.data.slice(begin);
	}
});

jb.component('numeric-sort', { // with side effects!!! decision made for performance reasons
	type: 'aggregator',
	params: [
		{ id: 'propertyName', as: 'string', essential: true }
	],
	impl: (ctx,prop) => {
		if (!ctx.data || ! Array.isArray(ctx.data)) return null;
		return ctx.data.sort((x,y)=>y[prop] - x[prop]);
	}
});

jb.component('not', {
	type: 'boolean',
	params: [
		{ id: 'of', type: 'boolean', as: 'boolean', essential: true, composite: true}
	],
	impl: (context, of) => !of
});

jb.component('and', {
	type: 'boolean',
	params: [
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true, composite: true }
	],
	impl: function(context) {
		var items = context.profile.$and || context.profile.items || [];
		var innerPath =  context.profile.$and ? '$and~' : 'items~';
		for(var i=0;i<items.length;i++) {
			if (!context.runInner(items[i], { type: 'boolean' }, innerPath + i))
				return false;
		}
		return true;
	}
});

jb.component('or', {
	type: 'boolean',
	params: [
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true, composite: true }
	],
	impl: function(context) {
		var items = context.profile.$or || context.profile.items || [];
		var innerPath =  context.profile.$or ? '$or~' : 'items~';
		for(var i=0;i<items.length;i++) {
			if (context.runInner(items[i],{ type: 'boolean' },innerPath+i))
				return true;
		}
		return false;
	}
});

jb.component('contains',{
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'string'},
		{ id: 'inOrder', defaultValue: true, as:'boolean'},
	],
	impl: function(context,text,allText,inOrder) {
      var prevIndex = -1;
      for(var i=0;i<text.length;i++) {
      	var newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1);
      	if (newIndex == -1) return false;
      	prevIndex = inOrder ? newIndex : -1;
      }
      return true;
	}
})

jb.component('not-contains', {
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'array'}
	],
	impl :{$not: {$: 'contains', text: '%$text%', allText :'%$allText%'}}
})

jb.component('starts-with', {
	type: 'boolean',
	params: [
		{ id: 'startsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: (context,startsWith,text) =>
		text.lastIndexOf(startsWith,0) == 0
})

jb.component('ends-with',{
	type: 'boolean',
	params: [
		{ id: 'endsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: (context,endsWith,text) =>
		text.indexOf(endsWith,text.length-endsWith.length) !== -1
})


jb.component('filter',{
	type: 'aggregator',
	params: [
		{ id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, essential: true }
	],
	impl: (context,filter) =>
		jb.toarray(context.data).filter(item =>
			filter(context,item))
});

jb.component('count', {
	type: 'aggregator',
	description: 'length, size of array',
	params: [{ id: 'items', as:'array', defaultValue: '%%'}],
	impl: (ctx,items) =>
		items.length
});

jb.component('to-string', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text
});

jb.component('to-uppercase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toUpperCase()
});

jb.component('to-lowercase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toLowerCase()
});

jb.component('capitalize', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.charAt(0).toUpperCase() + text.slice(1)
});

jb.component('join', {
	params: [
		{ id: 'separator', as: 'string', defaultValue:',', essential: true },
		{ id: 'prefix', as: 'string' },
		{ id: 'suffix', as: 'string' },
		{ id: 'items', as: 'array', defaultValue: '%%'},
		{ id: 'itemName', as: 'string', defaultValue: 'item'},
		{ id: 'itemText', as: 'string', dynamic:true, defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: function(context,separator,prefix,suffix,items,itemName,itemText) {
		var itemToText = (context.profile.itemText) ?
			item => itemText(new jb.jbCtx(context, {data: item, vars: jb.obj(itemName,item) })) :
			item => jb.tostring(item);	// performance

		return prefix + items.map(itemToText).join(separator) + suffix;
	}
});

jb.component('unique', {
	params: [
		{ id: 'id', as: 'string', dynamic: true, defaultValue: '%%' },
		{ id: 'items', as: 'array', defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: (ctx,idFunc,items) => {
		var _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.unique(items,_idFunc);
	}
});

jb.component('log', {
	params: [
		{ id: 'obj', as: 'single', defaultValue: '%%'}
	],
	impl: function(context,obj) {
		var out = obj;
		if (typeof GLOBAL != 'undefined' && typeof(obj) == 'object')
			out = JSON.stringify(obj,null," ");
		if (typeof window != 'undefined')
			(window.parent || window).console.log(out);
		else
			console.log(out);
		return out;
	}
});

jb.component('asIs',{ params: [{id: '$asIs'}], impl: ctx => context.profile.$asIs });

jb.component('object',{
	impl: function(context) {
		var result = {};
		var obj = context.profile.$object || context.profile;
		if (Array.isArray(obj)) return obj;
		for(var prop in obj) {
			if (prop == '$' && obj[prop] == 'object')
				continue;
			result[prop] = context.runInner(obj[prop],null,prop);
			var native_type = obj[prop]['$as'];
			if (native_type)
				result[prop] = jb.tojstype(result[prop],native_type);
		}
		return result;
	}
});

jb.component('json.stringify', {
	params: [
		{ id: 'value', defaultValue: '%%', as:'single'},
		{ id: 'space', as: 'string', description: 'use space or tab to make pretty output' }
	],
	impl: (context,value,space) =>
			JSON.stringify(value,null,space)
});

jb.component('json.parse', {
	params: [
		{ id: 'text', as: 'string' }
	],
	impl: (ctx,text) =>	{
		try {
			return JSON.parse(text)
		} catch (e) {
			jb.logException(e,'json parse');
		}
	}
});

jb.component('split', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', defaultValue: ',' },
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'part', options: ',first,second,last,but first,but last' }
	],
	impl: function(context,separator,text,part) {
		var out = text.split(separator);
		switch (part) {
			case 'first': return out[0];
			case 'second': return out[1];
			case 'last': return out.pop();
			case 'but first': return out.slice(1);
			case 'but last': return out.slice(0,-1);
			default: return out;
		}
	}
});

jb.component('replace', {
	type: 'data',
	params: [
		{ id: 'find', as: 'string' },
		{ id: 'replace', as: 'string' },
		{ id: 'text', as: 'string', defaultValue: '%%' },
		{ id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
		{ id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m' }
	],
	impl: function(context,find,replace,text,useRegex,regexFlags) {
		if (useRegex) {
			return text.replace(new RegExp(find,regexFlags) ,replace);
		} else
			return text.replace(find,replace);
	}
});

jb.component('touch', {
	type: 'action',
	params: [
		{ id: 'data', as: 'ref'},
	],
	impl: function(context,data_ref) {
		var val = Number(jb.val(data_ref));
		jb.writeValue(data_ref,val ? val + 1 : 1);
	}
});

jb.component('isNull', {
	type: 'boolean',
	params: [
		{ id: 'obj', defaultValue: '%%'}
	],
	impl: (ctx, obj) => jb.val(obj) == null
});

jb.component('isEmpty', {
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: (ctx, item) =>
		!item || (Array.isArray(item) && item.length == 0)
});

jb.component('notEmpty', {
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: (ctx, item) =>
		item && !(Array.isArray(item) && item.length == 0)
});

jb.component('equals', {
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx, item1, item2) => item1 == item2
});

jb.component('not-equals', {
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx, item1, item2) => item1 != item2
});

jb.component('parent', {
	type: 'data',
	params: [
		{ id: 'item', as: 'ref', defaultValue: '%%'}
	],
	impl: (ctx,item) =>
		item && item.$jb_parent
});

jb.component('runActions', {
	type: 'action',
	params: [
		{ id: 'actions', type:'action[]', ignore: true, composite: true, essential: true }
	],
	impl: function(context) {
		if (!context.profile) debugger;
		var actions = jb.toarray(context.profile.actions || context.profile['$runActions']);
		if (context.profile.actions && context.profile.actions.sugar)
			var innerPath =  '' ;
		else
			var innerPath = context.profile['$runActions'] ? '$runActions~' : 'items~';
		return actions.reduce((def,action,index) => {
			if (def && def.then)
				return def.then(_ =>	context.runInner(action, { as: 'single'}, innerPath + index ))
			else
				return context.runInner(action, { as: 'single'}, innerPath + index );
			},null)
	}
});

// jb.component('delay', {
// 	params: [
// 		{ id: 'mSec', type: 'number', defaultValue: 1}
// 	],
// 	impl: ctx => jb.delay(ctx.params.mSec)
// })

jb.component('on-next-timer', {
	description: 'run action after delay',
	type: 'action',
	params: [
		{ id: 'action', type: 'action', dynamic: true, essential: true },
		{ id: 'delay', type: 'number', defaultValue: 1}
	],
	impl: (ctx,action,delay) =>
		jb.delay(delay,ctx).then(()=>
			action())
})

jb.component('extract-prefix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,separator,text,regex,keepSeparator) {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '');
		} else { // regex
			var match = text.match(separator);
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '');
		}
	}
});

jb.component('extract-suffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,separator,text,regex,keepSeparator) {
		if (!regex) {
			return text.substring(text.lastIndexOf(separator) + (keepSeparator ? 0 : separator.length));
		} else { // regex
			var match = text.match(separator+'(?![\\s\\S]*' + separator +')'); // (?!) means not after, [\\s\\S]* means any char including new lines
			if (match)
				return text.substring(match.index + (keepSeparator ? 0 : match[0].length));
		}
	}
});

jb.component('range', {
	type: 'data',
	params: [
		{ id: 'from', as: 'number', defaultValue: 1 },
		{ id: 'to', as: 'number', defaultValue: 10 },
	],
	impl: (ctx,from,to) =>
    Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

jb.component('type-of', {
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%' },
	],
	impl: (ctx,_obj) => {
	  	var obj = jb.val(_obj);
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

jb.component('class-name', {
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%' },
	],
	impl: (ctx,_obj) => {
	  	var obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

jb.component('is-of-type', {
  type: 'boolean',
  params: [
  	{ id: 'type', as: 'string', essential: true, description: 'string,boolean' },
  	{ id: 'obj', defaultValue: '%%' },
  ],
  impl: (ctx,_type,_obj) => {
  	var obj = jb.val(_obj);
  	var objType = Array.isArray(obj) ? 'array' : typeof obj;
  	return _type.split(',').indexOf(objType) != -1;
  }
})

jb.component('in-group', {
  type: 'boolean',
  params: [
  	{ id: 'group', as: 'array', essential: true },
  	{ id: 'item', as: 'single', defaultValue: '%%' },
  ],
  impl: (ctx,group,item) =>
  	group.indexOf(item) != -1
})

jb.component('http.get', {
	params: [
		{ id: 'url', as: 'string' },
		{ id: 'json', as: 'boolean' }
	],
	impl: (ctx,url,_json) => {
		if (ctx.probe)
			return jb.http_get_cache[url];
		var json = _json || url.match(/json$/);
		return fetch(url)
			  .then(r =>
			  		json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[url] = res) : res)
			  .catch(e => jb.logException(e) || [])
	}
});

jb.component('isRef', {
	params: [
		{ id: 'obj', essential: true }
	],
	impl: (ctx,obj) => jb.isRef(obj)
})

jb.component('asRef', {
	params: [
		{ id: 'obj', essential: true }
	],
	impl: (ctx,obj) => jb.asRef(obj)
})

jb.component('data.switch', {
  params: [
  	{ id: 'cases', type: 'data.switch-case[]', as: 'array', essential: true, defaultValue: [] },
  	{ id: 'default', dynamic: true },
  ],
  impl: (ctx,cases,defaultValue) => {
  	for(var i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].value(ctx)
  	return defaultValue(ctx);
  }
})

jb.component('data.switch-case', {
  type: 'data.switch-case',
  singleInType: true,
  params: [
  	{ id: 'condition', type: 'boolean', essential: true, dynamic: true },
  	{ id: 'value', essential: true, dynamic: true },
  ],
  impl: ctx => ctx.params
})

jb.component('action.switch', {
  type: 'action',
  params: [
  	{ id: 'cases', type: 'action.switch-case[]', as: 'array', essential: true, defaultValue: [] },
  	{ id: 'defaultAction', type: 'action', dynamic: true },
  ],
  impl: (ctx,cases,defaultAction) => {
  	for(var i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

jb.component('action.switch-case', {
  type: 'action.switch-case',
  singleInType: true,
  params: [
  	{ id: 'condition', type: 'boolean', as: 'boolean', essential: true, dynamic: true },
  	{ id: 'action', type: 'action' ,essential: true, dynamic: true },
  ],
  impl: ctx => ctx.params
})
