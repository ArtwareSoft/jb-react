using('core')

component('call', {
  type: 'any',
  hidden: true,
  description: 'invoke dynamic parameter',
  category: 'system:50',
  params: [
    {id: 'param', as: 'string', description: 'parameter name'}
  ],
  impl: (ctx,param) => {
 	  const paramObj = ctx.cmpCtx && ctx.cmpCtx.params[param]
    return typeof paramObj == 'function' ?
 		  paramObj(new jb.core.jbCtx(ctx, { cmpCtx: paramObj.runCtx, forcePath: paramObj.srcPath })) : paramObj
 	}
})

component('runCtx', {
  type: 'any',
  hidden: true,
  params: [
    {id: 'path', as: 'string'},
    {id: 'vars'},
    {id: 'profile'}
  ]
})

component('typeAdapter', {
  type: 'any',
  params: [
    {id: 'fromType', as: 'string', mandatory: true, description: 'e.g. type1<myDsl>'},
    {id: 'val'}
  ],
  impl: ctx => ctx.params.val
})

component('If', {
  type: 'any',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', type: '$asParent', dynamic: true, composite: true},
    {id: 'Else', type: '$asParent', dynamic: true}
  ],
  impl: ({},cond,_then,_else) => cond() ? _then() : _else()
})

component('firstNotEmpty', {
  type: 'any',
  params: [
    {id: 'first', type: '$asParent', mandatory: true},
    {id: 'second', type: '$asParent', mandatory: true}
  ],
  impl: If('%$first%', '%$first%', '%$second%')
})

component('TBD', {
  type: 'any',
  hidden: true,
  impl: 'TBD'
})

extension('utils', 'pipe', {
  calcPipe(ctx,ptName,passRx) {
    let start = jb.toarray(ctx.data)
    if (start.length == 0) start = [null]
    if (typeof ctx.profile.items == 'string')
      return ctx.runInner(ctx.profile.items,null,'items');
    const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
    const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
      : (ctx.profile[ptName] ? (ptName + '~') : 'items~');

    if (ptName == '$pipe') // promise pipe
      return profiles.reduce((deferred,prof,index) =>
        deferred.then(data=>jb.utils.toSynchArray(data, !passRx)).then(data=>step(prof,index,data))
      , Promise.resolve(start))
        .then(data=>jb.utils.toSynchArray(data, !passRx))

    return profiles.reduce((data,prof,index) => step(prof,index,data), start)

    function step(profile,i,data) {
      if (!profile || profile.$disabled) return data;
      const path = innerPath+i
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {}) ;
      if (jb.utils.profileType(profile) == 'aggregator')
        return jb.core.run( new jb.core.jbCtx(ctx, { data, profile, path }), parentParam);
      return [].concat.apply([],data.map(item =>
          jb.core.run(new jb.core.jbCtx(ctx,{data: item, profile, path}), parentParam))
        .filter(x=>x!=null)
        .map(x=> {
          const val = jb.val(x)
          return Array.isArray(val) ? val : x 
        }));
    }
  }
})

component('pipeline', {
  type: 'data',
  category: 'common:100',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {
      id: 'items',
      type: 'data,aggregator[]',
      ignore: true,
      mandatory: true,
      composite: true,
      description: 'click \"=\" for functions list'
    }
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipeline')
})

component('pipe', {
  type: 'data',
  category: 'async:100',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipe',false)
})

component('data.if', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', mandatory: true, dynamic: true},
    {id: 'else', dynamic: true, defaultValue: '%%'}
  ],
  impl: ({},cond,_then,_else) =>	cond() ? _then() : _else()
})

component('action.if', {
  type: 'action',
  description: 'if then else',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'action', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'action', dynamic: true}
  ],
  impl: ({},cond,_then,_else) => jb.utils.isPromise(cond) ? Promise.resolve(cond).then(_cond=> _cond ? _then() : _else()) :	(cond ? _then() : _else())
})

component('list', {
  type: 'data',
  description: 'list definition, flatten internal arrays',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
})

// component('gList', {
//   type: 'any',
//   description: 'generic list definition, flatten internal arrays',
//   params: [
//     {id: 'items', type: '$asParent[]', as: 'array', composite: true}
//   ],
//   impl: ({},items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
// })

component('firstSucceeding', {
  type: 'data',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => {
    for(let i=0;i<items.length;i++) {
      const val = jb.val(items[i])
      const isNumber = typeof val === 'number'
      if (val !== '' && val != null && (!isNumber || (!isNaN(val)) && val !== Infinity && val !== -Infinity))
        return items[i]
    }
		return items.slice(-1)[0];
	}
})

component('keys', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj && typeof obj === 'object' ? obj : {})
})

component('values', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.values(obj && typeof obj === 'object' ? obj : {})
})

component('properties', {
  description: 'object entries as id,val',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
})

component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => jb.entries(obj)
})

component('aggregate', {
  type: 'aggregator',
  description: 'calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'aggregator', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

component('math.max', {
  type: 'aggregator',
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.min', {
  type: 'aggregator',
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.sum', {
  type: 'aggregator',
  category: 'math:80',
  impl: ctx => ctx.data.reduce((acc,item) => +item+acc, 0)
})

component('math.plus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true },
    {id: 'y', as: 'number', mandatory: true },
  ],
  impl: ({},x,y) => +x + +y
})

component('math.minus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x - +y
})

component('math.mul', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x * +y
})

component('math.div', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x / +y
})


 jb.defComponents('abs,acos,acosh,asin,asinh,atan,atan2,atanh,cbrt,ceil,clz32,cos,cosh,exp,expm1,floor,fround,hypot,log2,random,round,sign,sin,sinh,sqrt,tan,tanh,trunc'
  .split(','), f => component(`math.${f}`, {
    category: 'math:70',
    params: [
      {id: 'func', as: 'string', defaultValue: f}
    ],
    impl: ({data},f) => Math[f](data)
  })
)

component('objFromEntries', {
  description: 'object from entries',
  type: 'aggregator',
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

component('evalExpression', {
  description: 'evaluate javascript expression',
  type: 'data',
  params: [
    {id: 'expression', as: 'string', defaultValue: '%%', expression: 'e.g. 1+2'}
  ],
  impl: ({},expression) => {
    try {
      return eval('('+expression+')')
    } catch(e) {}
  }
})

component('prefix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(0,text.indexOf(separator))
})

component('suffix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(text.lastIndexOf(separator)+separator.length)
})

component('removePrefix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
})

component('removeSuffix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
})

component('removeSuffixRegex', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'suffix', as: 'string', mandatory: true, description: 'regular expression. e.g [0-9]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,suffix,text) => {
		ctx.profile.prefixRegexp = ctx.profile.prefixRegexp || new RegExp(suffix+'$');
		const m = (text||'').match(ctx.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
})

component('property', {
  description: 'navigate/select/path property of object',
  category: 'common:70',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,prop,obj) =>	jb.db.objectProperty(obj,prop,ctx)
})

component('indexOf', {
  category: 'common:70',
  params: [
    {id: 'array', as: 'array', mandatory: true},
    {id: 'item', as: 'single', mandatory: true}
  ],
  impl: ({},array,item) => array.indexOf(item)
})

component('writeValue', {
  type: 'action',
  category: 'mutable:100',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,to,value,noNotifications) => {
    if (!jb.db.isRef(to)) {
      debugger
      ctx.run(ctx.profile.to,{as: 'ref'}) // for debug
      return jb.logError(`can not write to: ${ctx.profile.to}`, {ctx})
    }
    const val = jb.val(value)
    if (jb.utils.isPromise(val))
      return Promise.resolve(val).then(_val=>jb.db.writeValue(to,_val,ctx,noNotifications))
    else
      jb.db.writeValue(to,val,ctx,noNotifications)
  }
})

component('addToArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'toAdd', as: 'array', mandatory: true}
  ],
  impl: (ctx,array,toAdd) => jb.db.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
})

component('move', {
  type: 'action',
  category: 'mutable:80',
  description: 'move item in tree, activated from D&D',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.db.move(from,_to,ctx)
})

component('splice', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'fromIndex', as: 'number', mandatory: true},
    {id: 'noOfItemsToRemove', as: 'number', defaultValue: 0},
    {id: 'itemsToAdd', as: 'array', defaultValue: []}
  ],
  impl: (ctx,array,fromIndex,noOfItemsToRemove,itemsToAdd) =>
		jb.db.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
})

component('removeFromArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'itemToRemove', as: 'single', description: 'choose item or index'},
    {id: 'index', as: 'number', description: 'choose item or index'}
  ],
  impl: (ctx,array,itemToRemove,_index) => {
		const index = itemToRemove ? jb.toarray(array).indexOf(itemToRemove) : _index;
		if (index != -1)
			jb.db.splice(array,[[index,1]],ctx)
	}
})

component('getOrCreate', {
  type: 'data',
  description: 'memoize, cache, calculate value if empty and assign for next time',
  category: 'mutable:80',
  params: [
    {id: 'writeTo', as: 'ref', mandatory: true},
    {id: 'calcValue', dynamic: true}
  ],
  impl: async (ctx,writeTo,calcValue) => {
    let val = jb.val(writeTo)
    if (val == null) {
      val = await calcValue()
      jb.db.writeValue(writeTo,val,ctx)
    }
    return val
	}
})

component('toggleBooleanValue', {
  type: 'action',
  params: [
    {id: 'of', as: 'ref'}
  ],
  impl: (ctx,_of) => jb.db.writeValue(_of,jb.val(_of) ? false : true,ctx)
})

component('slice', {
  type: 'aggregator',
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {
      id: 'end',
      as: 'number',
      mandatory: true,
      description: '0-based index of where to end the selection (not including itself)'
    }
  ],
  impl: ({data},start,end) => {
		if (!data || !data.slice) return null
		return end ? data.slice(start,end) : data.slice(start)
	}
})

component('sort', {
  type: 'aggregator',
  params: [
    {id: 'propertyName', as: 'string', description: 'sort by property inside object'},
    {id: 'lexical', as: 'boolean', type: 'boolean'},
    {id: 'ascending', as: 'boolean', type: 'boolean'}
  ],
  impl: ({data},prop,lexical,ascending) => {
    if (!data || ! Array.isArray(data)) return null;
    let sortFunc
    const firstData = data[0] //jb.entries(data[0]||{})[0][1]
		if (lexical || isNaN(firstData))
			sortFunc = prop ? (x,y) => (x[prop] == y[prop] ? 0 : x[prop] < y[prop] ? -1 : 1) : (x,y) => (x == y ? 0 : x < y ? -1 : 1);
		else
			sortFunc = prop ? (x,y) => (x[prop]-y[prop]) : (x,y) => (x-y);
		if (ascending)
  		return data.slice(0).sort((x,y)=>sortFunc(x,y));
		return data.slice(0).sort((x,y)=>sortFunc(y,x));
	}
})

component('first', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items[0]
})

component('last', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(-1)[0]
})

component('count', {
  type: 'aggregator',
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.length
})

component('reverse', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(0).reverse()
})

component('sample', {
  type: 'aggregator',
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

component('obj', {
  description: 'build object (dictionary) from props',
  category: 'common:100',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, sugar: true}
  ],
  impl: (ctx,properties) => jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx),p.type)]))
})

component('dynamicObject', {
  type: 'data',
  description: 'process items into object properties',
  params: [
    {id: 'items', mandatory: true, as: 'array'},
    {id: 'propertyName', mandatory: true, as: 'string', dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,items,name,value) =>
    items.reduce((obj,item)=>({ ...obj, [name(ctx.setData(item))]: value(ctx.setData(item)) }),{})
})

component('extend', {
  description: 'assign and extend with calculated properties',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) =>
		Object.assign({}, ctx.data, jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx),p.type)])))
})
component('assign', jb.utils.getUnresolvedProfile('extend'))

component('extendWithIndex', {
  type: 'aggregator',
  description: 'extend with calculated properties. %$index% is available ',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) => jb.toarray(ctx.data).map((item,i) =>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
})

component('prop', {
  type: 'prop',
  macroByValue: true,
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'}
  ],
  impl: ctx => ctx.params
})

component('refProp', {
  type: 'prop',
  description: 'value by reference allows to change or watch the value',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, as: 'ref', mandatory: true}
  ],
  impl: ctx => ({ ...ctx.params, type: 'ref' })
})

component('pipeline.var', {
  type: 'aggregator',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', mandatory: true, dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({ [Symbol.for('Var')]: true, ...ctx.params })
})

component('not', {
  type: 'boolean',
  params: [
    {id: 'of', type: 'boolean', as: 'boolean', mandatory: true, composite: true}
  ],
  impl: ({}, of) => !of
})

component('and', {
  description: 'logical and',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
      (res,item,i) => res && ctx.runInner(item, { type: 'boolean' }, `items~${i}`), true)
})

component('or', {
  description: 'logical or',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
    (res,item,i) => res || ctx.runInner(item, { type: 'boolean' }, `items~${i}`), false)
})

component('between', {
  description: 'checks if number is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', mandatory: true},
    {id: 'to', as: 'number', mandatory: true},
    {id: 'val', as: 'number', defaultValue: '%%'}
  ],
  impl: ({},from,to,val) => val >= from && val <= to
})

component('contains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', arrayInMacro: true, mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'string', byName: true},
    {id: 'inOrder', defaultValue: true, as: 'boolean', type: 'boolean'}
  ],
  impl: ({},text,allText,inOrder) => {
      let prevIndex = -1
      for(let i=0;i<text.length;i++) {
      	const newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1)
      	if (newIndex == -1) return false
      	prevIndex = inOrder ? newIndex : -1
      }
      return true
	}
})

component('notContains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', arrayInMacro: true, mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'array', byName: true}
  ],
  impl: not(contains('%$text%', { allText: '%$allText%' }))
})

component('startsWith', {
  description: 'begins with, includes, contains',
  type: 'boolean',
  params: [
    {id: 'startsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string', byName: true}
  ],
  impl: ({},startsWith,text) => text.indexOf(startsWith) == 0
})

component('endsWith', {
  description: 'includes, contains',
  type: 'boolean',
  params: [
    {id: 'endsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: ({},endsWith,text) => text.indexOf(endsWith,text.length-endsWith.length) !== -1
})


component('filter', {
  type: 'aggregator',
  params: [
    {id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) =>	jb.toarray(ctx.data).filter(item =>	filter(ctx,item))
})

component('matchRegex', {
  description: 'validation with regular expression',
  type: 'boolean',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: 'e.g: [a-zA-Z]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},regex,text) => text.match(new RegExp(regex))
})

component('toUpperCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) =>	text.toUpperCase()
})

component('toLowerCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.toLowerCase()
})

component('capitalize', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.charAt(0).toUpperCase() + text.slice(1)
})

component('join', {
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', mandatory: true},
    {id: 'prefix', as: 'string'},
    {id: 'suffix', as: 'string'},
    {id: 'items', as: 'array', defaultValue: '%%'},
    {id: 'itemText', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  type: 'aggregator',
  impl: (ctx,separator,prefix,suffix,items,itemText) => {
		const itemToText = ctx.profile.itemText ?	item => itemText(ctx.setData(item)) :	item => jb.tostring(item);	// performance
		return prefix + items.map(itemToText).join(separator) + suffix;
	}
})

component('unique', {
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  type: 'aggregator',
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
})

component('log', {
  params: [
    {id: 'logName', as: 'string', mandatory: 'true' },
    {id: 'logObj', as: 'single', defaultValue: '%%' }
  ],
  impl: (ctx,log,logObj) => { jb.log(log,{...logObj,ctx}); return ctx.data }
})

component('asIs', {
  params: [
    {id: '$asIs', ignore: true}
  ],
  impl: () => context.profile.$asIs
})

component('object', {
  impl: function(context) {
		let result = {};
		const obj = context.profile.$object || context.profile;
		if (Array.isArray(obj)) return obj;
		for(let prop in obj) {
			if ((prop == '$' && obj[prop] == 'object') || obj[prop] == null)
				continue;
			result[prop] = context.runInner(obj[prop],null,prop);
		}
		return result;
	}
})

component('json.stringify', {
  params: [
    {id: 'value', defaultValue: '%%'},
    {id: 'space', as: 'string', description: 'use space or tab to make pretty output'}
  ],
  impl: ({},value,space) => JSON.stringify(jb.val(value),null,space)
})

component('json.parse', {
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: (ctx,text) =>	{
		try {
			return JSON.parse(text)
		} catch (e) {
			jb.logException(e,'json parse',{text, ctx})
		}
	}
})

component('split', {
  description: 'breaks string using separator',
  type: 'data',
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', description: 'E.g., \",\" or \"<a>\"'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'part', options: 'all,first,second,last,but first,but last', defaultValue: 'all'}
  ],
  impl: ({},separator,text,part) => {
		const out = text.split(separator.replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n'));
		switch (part) {
			case 'first': return out[0];
			case 'second': return out[1];
			case 'last': return out.pop();
			case 'but first': return out.slice(1);
			case 'but last': return out.slice(0,-1);
			default: return out;
		}
	}
})

component('replace', {
  type: 'data',
  params: [
    {id: 'find', as: 'string', mandatory: true},
    {id: 'replace', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m'}
  ],
  impl: ({},find,replace,text,useRegex,regexFlags) =>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    useRegex ? text.replace(new RegExp(find,regexFlags) ,replace) : text.replace(find,replace)
})

component('isNull', {
  description: 'is null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) == null
})

component('notNull', {
  description: 'not null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) != null
})

component('isEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => !item || (Array.isArray(item) && item.length == 0)
})

component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => item && !(Array.isArray(item) && item.length == 0)
})

component('equals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 == item2
})

component('notEquals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 != item2
})

component('runActions', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true}
  ],
  impl: ctx => {
		if (!ctx.profile) debugger;
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions']).filter(x=>x)
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    
		return actions.reduce((pr,action,index) =>
				pr.finally(function runActions() {return ctx.runInner(action, { as: 'single'}, innerPath + index ) })
			,Promise.resolve())
	}
})

component('runActionOnItem', {
  type: 'action',
  params: [
    {id: 'item', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,item,action) => jb.utils.isPromise(item) ? Promise.resolve(item).then(_item => action(ctx.setData(_item))) 
    : item != null && action(ctx.setData(item))
})

component('runActionOnItems', {
  type: 'action',
  macroByValue: true,
  params: [
    {id: 'items', as: 'ref[]', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,items,action,indexVariable) => {
		return (jb.val(items)||[]).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runActionOnItems',{item, action, ctx}))
	}
})

component('delay', {
  type: 'action,data',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1},
    {id: 'res', defaultValue: '%%'}
  ],
  impl: ({},mSec,res) => jb.delay(mSec).then(() => res)
})

component('onNextTimer', {
  description: 'run action after delay',
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'delay', type: 'number', defaultValue: 1}
  ],
  impl: (ctx,action,delay) => jb.delay(delay,ctx).then(()=>	action())
})

component('extractPrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '')
		} else { // regex
			const match = text.match(separator)
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '')
		}
	}
})

component('extractSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(text.lastIndexOf(separator) + (keepSeparator ? 0 : separator.length));
		} else { // regex
			const match = text.match(separator+'(?![\\s\\S]*' + separator +')'); // (?!) means not after, [\\s\\S]* means any char including new lines
			if (match)
				return text.substring(match.index + (keepSeparator ? 0 : match[0].length));
		}
	}
})

component('range', {
  description: 'returns a range of number, generator, numerator, numbers, index',
  type: 'data',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({},from,to) => Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

component('typeOf', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj)
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

component('className', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

component('isOfType', {
  type: 'boolean',
  params: [
    {id: 'type', as: 'string', mandatory: true, description: 'e.g., string,boolean,array'},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_type,_obj) => {
  	const obj = jb.val(_obj)
  	const objType = Array.isArray(obj) ? 'array' : typeof obj
  	return _type.split(',').indexOf(objType) != -1
  }
})

component('inGroup', {
  description: 'is in list, contains in array',
  type: 'boolean',
  params: [
    {id: 'group', as: 'array', mandatory: true},
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({},group,item) =>	group.indexOf(item) != -1
})

component('isRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.isRef(obj)
})

component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.asRef(obj)
})

component('data.switch', {
  macroByValue: false,
  params: [
    {id: 'cases', type: 'data.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'default', dynamic: true},
  ],
  impl: (ctx,cases,defaultValue) => {
		for(let i=0;i<cases.length;i++)
			if (cases[i].condition(ctx))
				return cases[i].value(ctx)
		return defaultValue(ctx)
	}
})

component('data.case', {
  type: 'data.switch-case',
  params: [
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('action.switch', {
  type: 'action',
  params: [
    {id: 'cases', type: 'action.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'defaultAction', type: 'action', dynamic: true}
  ],
  macroByValue: false,
  impl: (ctx,cases,defaultAction) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

component('action.switchCase', {
  type: 'action.switch-case',
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true, dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('formatDate', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'date', defaultValue: '%%', description: 'Date value'},
    {id: 'dateStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'timeStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'weekday', as: 'string', options: 'long,short,narrow'},
    {id: 'year', as: 'string', options: 'numeric,2-digit'},
    {id: 'month', as: 'string', options: 'numeric,2-digit,long,short,narrow'},
    {id: 'day', as: 'string', options: 'numeric,2-digit'},
    {id: 'hour', as: 'string', options: 'numeric,2-digit'},
    {id: 'minute', as: 'string', options: 'numeric,2-digit'},
    {id: 'second', as: 'string', options: 'numeric,2-digit'},
    {id: 'timeZoneName', as: 'string', options: 'long,short'}
  ],
  impl: (ctx,date) => new Date(date).toLocaleDateString(undefined, jb.objFromEntries(jb.entries(ctx.params).filter(e=>e[1])))
})

component('formatNumber', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'precision', as: 'number', defaultValue: '2', description: '10.33'},
    {id: 'num', defaultValue: '%%' },
  ],
  impl: (ctx,precision,x) => typeof x == 'number' ? +x.toFixed(+precision) : x
})

component('getSessionStorage', {
  params: [
    { id: 'id', as: 'string' }
  ],
  impl: ({},id) => jb.utils.sessionStorage(id)
})

component('action.setSessionStorage', {
  params: [
    { id: 'id', as: 'string' },
    { id: 'value', dynamic: true },
  ],
  impl: ({},id,value) => jb.utils.sessionStorage(id,value())
})

component('waitFor',{
  params: [
    {id: 'check', dynamic: true},
    {id: 'interval', as: 'number', defaultValue: 14, byName: true},
    {id: 'timeout', as: 'number', defaultValue: 3000},
    {id: 'logOnError', as: 'string', dynamic: true},
  ],
  impl: (ctx,check,interval,timeout,logOnError) => {
    // const res1 = check()
    // if (!jb.utils.isPromise(res1))
    //   return Promise.resolve(res1)
    let waitingForPromise, timesoFar = 0
    return new Promise((resolve,reject) => {
        const toRelease = setInterval(() => {
            timesoFar += interval
            if (timesoFar >= timeout) {
              clearInterval(toRelease)
              jb.log('waitFor timeout',{ctx})
              logOnError() && jb.log(logOnError(),{ctx})
              reject('timeout')
            }
            if (waitingForPromise) return
            const v = check()
            jb.log('waitFor check',{v, ctx})
            if (jb.utils.isPromise(v)) {
              waitingForPromise = true
              v.then(_v=> {
                waitingForPromise = false
                handleResult(_v)
              })
            } else {
              handleResult(v)
            }

            function handleResult(res) {
              if (res) {
                clearInterval(toRelease)
                resolve(res)
              }
            }
        }, interval)
    })
  }
})

component('addComponent', {
  description: 'add a component or data resource',
  type: 'action',
  params: [
    {id: 'id', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'type', options: 'watchableData,passiveData,comp', mandatory: true}
  ],
  impl: (ctx,id,value,type) => jb.component(id(), type == 'comp' ? value() : {[type]: value() } ),
  require: () => jb.db.addDataResourcePrefix()
})

component('loadLibs', {
  description: 'load a list of libraries into current jbm',
  type: 'action',
  params: [
    {id: 'libs', as: 'array', mandatory: true}
  ],
  impl: ({},libs) => 
    jb_dynamicLoad(libs, Object.assign(jb, { loadFromDist: true}))
})

component('loadAppFiles', {
  description: 'load a list of app files into current jbm',
  type: 'action',
  params: [
    {id: 'jsFiles', as: 'array', mandatory: true}
  ],
  impl: ({},jsFiles) => 
    jb_loadProject({ uri: jb.uri, baseUrl: jb.baseUrl, libs: '', jsFiles })
})
