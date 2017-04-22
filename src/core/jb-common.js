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
 			comp: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
});

function jb_pipe(context,items,ptName) {
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
			return jb.jb_run( new jb.jbCtx(context, { data: data, profile: profile, path: innerPath+i }), parentParam);
		return [].concat.apply([],data.map(item =>
				jb.jb_run(new jb.jbCtx(context,{data: item, profile: profile, path: innerPath+i}), parentParam)
			)).filter(x=>x!=null);
	}
}

jb.component('pipeline',{
	type: 'data',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb_pipe(ctx,items,'$pipeline')
})

jb.component('pipe', { // synched pipeline
	type: 'data',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb_pipe(ctx,items,'$pipe')
})

jb.component('run', {
 	type: '*',
 	params: [
 		{ id: 'profile', as: 'single'},
 	],
 	impl: function(context,profile) {
 	  	return context.run(profile);
 	}
});

jb.component('apply', {
	description: 'run a function',
 	type: '*',
 	params: [
 		{ id: 'func', as: 'single'},
 	],
 	impl: (ctx,func) => {
 		if (typeof func == 'function')
 	  		return func(ctx);
 	}
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

jb.component('first-succeeding', {
	type: 'data',
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		for(var i=0;i<items.length;i++)
			if (jb.val(items[i]))
				return items[i];
	}
});

// jb.component('objectProperties', {
// 	type: 'data',
// 	params: [
// 		{ id: 'object', defaultValue: '%%', as: 'single' }
// 	],
// 	impl: (ctx,object) =>
// 		jb.ownPropertyNames(object)
// })

// jb.component('objectToArray',{
// 	type: 'data',
// 	params: [
// 		{ id: 'object', defaultValue: '%%', as: 'single' }
// 	],
// 	impl: (context,object) =>
// 		jb.ownPropertyNames(object).map((id,index) => 
// 			({id: id, val: object[id], index: index}))
// });

// jb.component('propertyName',{
// 	type: 'data',
// 	impl: function(context) {
// 		return context.data && context.data.$jb_property;
// 	}
// });

jb.component('prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(0,text.indexOf(separator))
	}
});

jb.component('suffix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(text.lastIndexOf(separator)+separator.length)
	}
});

jb.component('remove-prefix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(text.indexOf(separator)+separator.length)
	}
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
	impl: function(context,separator,text) {
		return (text||'').substring(0,text.lastIndexOf(separator))
	}
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
		{ id: 'to', as: 'ref' },
		{ id: 'value',}
	],
	impl: (ctx,to,value) =>
		jb.writeValue(to,value)
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

jb.component('numeric-sort', { // with side effects for performance reasons
	type: 'aggregator',
	params: [
		{ id: 'propertyName' }
	],
	impl: (ctx,prop) => {
		if (!ctx.data || ! Array.isArray(ctx.data)) return null;
		return ctx.data.sort((x,y)=>y[prop] - x[prop]); 
	}
});

jb.component('not',{
	type: 'boolean',
	params: [ 
		{ id: 'of', type: 'boolean', as: 'boolean', essential: true} 
	],
	impl: function(context, of) {
		return !of;
	}
});

jb.component('and',{
	type: 'boolean',
	params: [ 
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true } 
	],
	impl: function(context) {
		var items = context.profile.$and || context.profile.items || [];
		for(var i=0;i<items.length;i++) {
			if (!context.run({ profile: items[i], path: i},{ type: 'boolean' }))
				return false;
		}
		return true;
	}
});

jb.component('or',{
	type: 'boolean',
	params: [ 
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true } 
	],
	impl: function(context) {
		var items = context.profile.$or || context.profile.items || [];
		for(var i=0;i<items.length;i++) {
			if (context.run({ profile: items[i], path: i}),{ type: 'boolean' })
				return true;
		}
		return false;
	}
});

jb.component('contains',{
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'array'}
	],
	impl: function(context,text,allText) {
      var all = "";
      allText.forEach(function(allTextItem) {
		if (allTextItem.outerHTML)
			all += allTextItem.outerHTML + $(allTextItem).findIncludeSelf('input,textarea').get().map(function(item) { return item.value; }).join();
		else if (typeof(allTextItem) == 'object') 
			all += JSON.stringify(allTextItem);
		else 
			all += jb.tostring(allTextItem);
      });
      var prevIndex = -1;
      for(var i=0;i<text.length;i++) {
      	var newIndex = all.indexOf(jb.tostring(text[i]),prevIndex+1);
      	if (newIndex <= prevIndex) return false;
      	prevIndex = newIndex;
      }
      return true;
	}
})

jb.component('not-contains',{
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'array'}
	],
	impl :{$not: {$: 'contains', text: '%$text%', allText :'%$allText%'}} 
})

jb.component('starts-with',{
	type: 'boolean',
	params: [
		{ id: 'startsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: function(context,startsWith,text) {
		return text.lastIndexOf(startsWith,0) == 0;
	}
})

jb.component('ends-with',{
	type: 'boolean',
	params: [
		{ id: 'endsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: function(context,endsWith,text) {
		return text.indexOf(endsWith,text.length-endsWith.length) !== -1;
	}
})


jb.component('filter',{
	type: 'aggregator',
	params: [
		{ id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, essential: true }
	],
	impl: (context,filter) =>
		jb.toarray(context.data).filter(item =>
			filter(context,item)
		)
});

jb.component('count',{
	type: 'aggregator',
	params: [
		{ id: 'items', as:'array', defaultValue: '%%'}
	],
	impl: (ctx,items) =>
		items.length
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

jb.component('unique',{
	params: [
		{ id: 'id', as: 'string', dynamic: true, defaultValue: '%%' },
		{ id: 'items', as:'array', defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: function(context,id,items) {
		var out = [];
		var soFar = {};
		for(var i=0;i<items.length;i++) {
			var itemId = id( new jb.jbCtx(context, {data: items[i] } ));
			if (soFar[itemId]) continue;
			soFar[itemId] = true;
			out.push(items[i]);
		}
		return out;
	}
});

jb.component('log',{
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

jb.component('asIs',{ params: [{id: '$asIs'}], impl: function(context) { return context.profile.$asIs } });

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

jb.component('stringify',{
	params: [
		{ id: 'value', defaultValue: '%%', as:'single'},
		{ id: 'space', as: 'string', description: 'use space or tab to make pretty output' }
	],
	impl: (context,value,space) =>		
			JSON.stringify(value,null,space)
});

jb.component('split',{
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

jb.component('replace',{
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

jb.component('foreach', {
	type: 'action',
	params: [
		{ id: 'items', as: 'array', defaultValue: '%%'},
		{ id: 'action', type:'action', dynamic:true },
		{ id: 'itemVariable', as:'string' },
		{ id: 'inputVariable', as:'string' }
	],
	impl: function(context,items,action,itemVariable,inputVariable) {
		items.forEach(function(item) {
			action(new jb.jbCtx(context,{ data:item, vars: jb.obj(itemVariable,item, jb.obj(inputVariable,context.data)) }));
		});
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

jb.component('isNull',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (item == null);
	}
});

jb.component('isEmpty',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (!item || (Array.isArray(item) && item.length == 0));
	}
});

jb.component('notEmpty',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (item && !(Array.isArray(item) && item.length == 0));
	}
});

jb.component('equals',{
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: function(context, item1, item2) {
		if (!item1 && !item2) return true;
		return JSON.stringify(openObject(item1)) == JSON.stringify(openObject(item2));

		function openObject(obj) {
			return (obj && obj.$jb_parent) ? obj.$jb_parent[obj.$jb_property] : obj;
		}
	}
});

jb.component('not-equals',{
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: { $not: { $: 'equals', item1: '%$item1%', item2: '%$item2%'} }
});

jb.component('parent',{
	type: 'data',
	impl: function(context) {
		var object = jb.tosingle(context.data);
		return object && object.$jb_parent;
	}
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
		return actions.reduce((def,action,index) =>
			def.then(() =>
				Promise.resolve(context.runInner(action, { as: 'single'}, innerPath + index ))),
			Promise.resolve())
	}
});

jb.component('delay', {
	params: [
		{ id: 'mSec', type: 'number', defaultValue: 1}
	],
	impl: ctx => jb.delay(ctx.params.mSec)
})

jb.component('editable-primitive', {
  type: 'data',
  params: {
    type: { type: 'data', as: 'string', options: 'string,number,boolean', defaultValue: 'string' },
    initialValue: { type: 'data', as: 'string' }
  },
  impl: (ctx,_type,initialValue) => {
    var res = { data: jbart.jstypes[_type](initialValue)};
    return { $jb_parent: res, $jb_property: 'data' }
  }
})

jb.component('on-next-timer',{
	type: 'action',
	params: [
		{ id: 'action', type: 'action', dynamic: true }
	],
	impl: (ctx,action) => {
		jb.delay(1,ctx).then(()=>
			action())
	}
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

jb.component('http-get', {
	params: [
		{ id: 'url', as: 'string' },
		{ id: 'json', as: 'boolean' }
	],
	impl: (ctx,url,_json) => {
		var json = _json || url.match(/json$/);
		return fetch(url)
			  .then(r => 
			  		json ? r.json() : r.text())
			  .catch(e =>
			  		jb.logException(e))
	}
})
