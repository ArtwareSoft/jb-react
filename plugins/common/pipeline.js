extension('utils', 'pipe', {
  calcPipe(ctx,ptName,passRx) {
    let start = jb.toarray(ctx.data)
    if (start.length == 0) start = [null]
    if (typeof ctx.profile.items == 'string')
      return ctx.runInner(ctx.profile.items,null,'items');
    const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
    const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
      : (ctx.profile[ptName] ? (ptName + '~') : 'items~');

    if (ptName == '$pipe') return (async function pipe() {
      const pipeRes = await profiles.reduce( async (pr,prof,index) => {
        const data = await pr;
        const input = await jb.utils.toSynchArray(data, !passRx)
        const stepRes = await step(prof,index,input)
        return stepRes
      }, Promise.resolve(start))

        const res = await jb.utils.toSynchArray(pipeRes, !passRx)
        return res
      })()

    return profiles.reduce((data,prof,index) => step(prof,index,data), start)

    function step(profile,i,data) {
      if (!profile || profile.$disabled) return data;
      const path = innerPath+i
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {})
      if (jb.path(jb.comps[profile.$$],'aggregator'))
                return jb.core.run( new jb.core.jbCtx(ctx, { data, profile, path }), parentParam)
      const res = data.map(item => jb.core.run(new jb.core.jbCtx(ctx,{data: item, profile, path}), parentParam))
        .filter(x=>x!=null)
        .flatMap(x=> {
          const val = jb.val(x)
          return jb.asArray(val)
        })
        return res
    }
  }
})

component('pipeline', {
  type: 'data',
  category: 'common:100',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true, description: 'chain/map data functions'}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipeline')
})

component('pipe', {
  type: 'data',
  category: 'async:100',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipe',false)
})

component('aggregate', {
  type: 'data',
  aggregator: true,
  description: 'in pipeline, calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'data', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

component('objFromProperties', {
  type: 'data',
  aggregator: true,
  description: 'object from entries of properties {id,val}',
  params: [
    {id: 'properties', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},properties) => jb.objFromEntries(properties.map(({id,val}) => [id,val]))
})

component('objFromEntries', {
  type: 'data',
  aggregator: true,
  description: 'object from entries',
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

component('join', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'separator', as: 'string', defaultValue: ','},
    {id: 'prefix', as: 'string', byName: true },
    {id: 'suffix', as: 'string'},
    {id: 'items', as: 'array', defaultValue: '%%'},
    {id: 'itemText', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,separator,prefix,suffix,items,itemText) => {
		const itemToText = ctx.profile.itemText ?	item => itemText(ctx.setData(item)) :	item => jb.tostring(item);	// performance
		return prefix + items.map(itemToText).join(separator) + suffix;
	}
})

component('unique', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
})

component('max', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,jb.asArray(ctx.data))
})

component('min', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.min.apply(0,jb.asArray(ctx.data))
})

component('sum', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => jb.asArray(ctx.data).reduce((acc,item) => +item+acc, 0)
})

component('slice', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {id: 'end', as: 'number', mandatory: true, description: '0-based index of where to end the selection (not including itself)'}
  ],
  impl: ({data},start,end) => {
		if (!data || !data.slice) return null
		return end ? data.slice(start,end) : data.slice(start)
	}
})

component('sort', {
  type: 'data',
  aggregator: true,
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
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items[0]
})

component('last', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(-1)[0]
})

component('count', {
  type: 'data',
  aggregator: true,
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.length
})

component('reverse', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(0).reverse()
})

component('sample', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

component('prop', {
  type: 'data',
  description: 'assign, extend obj with a single prop',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,name,val,type,obj) => ({...obj, [name]: jb.core.tojstype(val(),type)})
})

component('removeProps', {
  type: 'data',
  description: 'remove properties from object',
  params: [
    {id: 'names', type: 'data[]', mandatory: true},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,names,obj) => names.reduce((obj,name) => { const{ [name]: _, ...rest } = obj; return rest }, obj)
})

component('splitByPivot', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'pivot', as: 'string', description: 'prop name', mandatory: true},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,pivot,items) => {
      const keys = jb.utils.unique(items.map(item=>item[pivot]))
      const groups = Object.fromEntries(keys.map(key=> [key,[]]))
      items.forEach(item => groups[item[pivot]].push(item))
      return keys.map(key => ({[pivot]: key, items: groups[key]}))
  }
})

component('groupBy', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'pivot', as: 'string', description: 'new prop name', mandatory: true},
    {id: 'calcPivot', dynamic: true, mandatory: true, byName: true},
    {id: 'aggregate', type: 'group-prop[]', mandatory: true}
  ],
  impl: pipeline(
    prop('%$pivot%', '%$calcPivot()%'),
    splitByPivot('%$pivot%'),
    groupProps('%$aggregate%'),
    removeProps('items')
  )
})

component('groupProps', {
  type: 'data',
  description: 'aggregate, extend group obj with a group props',
  params: [
    {id: 'props', type: 'group-prop[]', mandatory: true},
  ],
  impl: ({data},props) => props.flatMap(x=>jb.asArray(x)).reduce((item,prop) => ({...item, ...prop.enrichGroupItem(item)}), data )
})

component('prop', {
  type: 'group-prop',
  description: 'assign, extend group obj with a single prop, input is items',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true, defaultValue: '', description: 'input is group items'},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'},
  ],
  impl: (ctx,name,val,type) => ({ enrichGroupItem: item => ({...item, [name]: jb.core.tojstype(val(ctx.setData(item.items)),type)}) })
})

component('count', {
  type: 'group-prop',
  params: [
    {id: 'as', as: 'string', defaultValue: 'count'},
  ],
  impl: prop('%$as%', count())
})

component('join', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', mandatory: true, byName: true},
    {id: 'separator', as: 'string', defaultValue: ','},
  ],
  impl: prop('%$as%', join({data: '%{%$prop%}%', separator: '%$separator%'}))
})

component('max', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', defaultValue: 'max', byName: true}
  ],
  impl: prop('%$as%', max({data: '%{%$prop%}%'}))
})

component('min', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', defaultValue: 'min', byName: true}
  ],
  impl: prop('%$as%', min({data: '%{%$prop%}%'}))
})