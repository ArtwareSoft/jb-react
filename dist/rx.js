jb.ns('rx')

jb.component('rx.pipe', {
  type: 'rx,data,action',
  category: 'combine',
  description: 'pipeline of reactive observables',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []},
  ],
  impl: (ctx,elems) => jb.callbag.pipe(...elems) //, jb.callbag.map(x=>x.data))
})

jb.component('rx.innerPipe', {
  type: 'rx',
  category: 'combine',
  description: 'inner reactive pipeline',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []},
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

jb.component('rx.merge', {
    type: 'rx',
    category: 'combine',
    description: 'merge more callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array' },
    ],
    impl: (ctx,sources) => jb.callbag.merge(...sources)
})

jb.component('rx.startWith', {
    type: 'rx',
    category: 'combine',
    description: 'startWith callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array' },
    ],
    impl: (ctx,sources) => jb.callbag.startWith(...sources)
})

jb.component('rx.var', {
  type: 'rx',
  description: 'define a variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true},
  ],
  impl: (ctx,name,value) => source => (start, sink) => {
    if (start != 0) return 
    return source(0, function Var(t, d) {
      sink(t, t === 1 ? d && d.setVar && d.setVar(name,value(d)) : d)
    })
  }
})

jb.component('rx.reduce', {
  type: 'rx',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc'},
    {id: 'initialValue', dynamic: true, description: 'receives first value as input', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated var is available. E,g. %$acc%,%% ',  mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor'},
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value(d.setVar(varName,acc))
        } else {
          acc = value(d.setVar(varName,acc))
        }
        sink(t, acc == null ? d : d.setVar(varName, acc))
      } else {
        sink(t, d)
      }
    })
  }
})

jb.component('rx.count', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: rx.reduce({
    varName: '%$varName%',
    initialValue: 0,
    value: (ctx,{},{varName}) => ctx.vars[varName]+1
  })
})

jb.component('rx.join', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: rx.reduce({
    varName: '%$varName%',
    initialValue: '%%',
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

jb.component('rx.max', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%' },
  ],
  impl: rx.reduce({
    varName: '%$varName%', initialValue: Number.NEGATIVE_INFINITY, value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})


// ************ sources
  
jb.component('rx.fromEvent', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document },
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' },
  ],
  impl: (ctx,event,elem,options) => jb.callbag.map(x=>ctx.ctx({data:x, profile: '', forcePath: ''}))(jb.callbag.fromEvent(event,elem,options))
})

jb.component('rx.fromIter', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'iter', mandatory: true, as: 'array', description: 'array or js Iterators or Generators. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators '},
  ],
  impl: (ctx,iter) => jb.callbag.map(x=>ctx.ctx({data:x, profile: '', forcePath: ''}))(jb.callbag.fromIter(iter))
})

jb.component('rx.fromAny', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'},
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.ctx({data:x, profile: '', forcePath: ''}))(jb.callbag.fromAny(source || []))
})

jb.component('rx.fromPromise', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'promise', mandatory: true},
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.ctx({data:x, profile: '', forcePath: ''}))(jb.callbag.fromPromise(promise))
})

jb.component('rx.interval', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.ctx({data:x, profile: '', forcePath: ''}))(jb.callbag.interval(interval))
})

// ******** operators *****

jb.component('rx.do', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

jb.component('rx.doPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

jb.component('rx.map', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true},
  ],
  impl: (ctx,func) => jb.callbag.map(ctx2 => ctx2.setData(func(ctx2)))
})

jb.component('rx.mapPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true},
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(res => ctx2.setData(res)))
})

jb.component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true},
  ],
  impl: (ctx,filter) => jb.callbag.filter(ctx2 => filter(ctx2))
})

jb.component('rx.flatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'map each input to promise or callbag'},
  ],
  impl: (ctx,func) => jb.callbag.flatMap(ctx2 => func(ctx2))
})

jb.component('rx.toMany', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'should return array, pass items one by one'},
  ],
  impl: (ctx,func) => jb.callbag.flatMap(ctx2 => jb.asArray(func(ctx2)), (_ctx,res) => _ctx.setData(res) )
})

jb.component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
  ],
  impl: (ctx,func) => jb.callbag.concatMap(ctx2 => func(ctx2))
})

jb.component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream', 
  category: 'filter',
  params: [
    {id: 'compareFunc', dynamic: true, description: 'default is identical, compare %prev% to %data%'},
  ],
  impl: (ctx,compareFunc) => jb.callbag.distinctUntilChanged(compareFunc && ((prev, data) => compareFunc(ctx.setData({prev: prev.data, data: data.data}))))
})

jb.component('rx.catchError', {
    type: 'rx',
    category: 'error',
    params: [
      {id: 'handler', type: 'action', dynamic: true, mandatory: true },
    ],
    impl: (ctx,handler) => jb.callbag.catchError(err => handler(ctx.ctx({data: err, profile: '', forcePath: ''})))
})

jb.component('rx.debounceTime', {
    type: 'rx',
    category: 'operator',
    params: [
      {id: 'time', dynamic: true, description: 'can be dynamic' },
    ],
    impl: (ctx,time) => jb.callbag.debounceTime(time)
})

jb.component('rx.delay', {
    type: 'rx',
    category: 'operator',
    params: [
      {id: 'time', dynamic: true, description: 'can be dynamic' },
    ],
    impl: (ctx,time) => jb.callbag.delay(time)
})

jb.component('rx.replay', {
  type: 'rx',
  description: 'stores messages and replay them for later subscription', 
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'},
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

jb.component('rx.takeUntil', {
    type: 'rx',
    description: 'closes the stream when events comes from notifier', 
    category: 'terminate',
    params: [
      {id: 'notifier', dynamic: true, type: 'rx', description: 'can be also promise or any other' },
    ],
    impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

jb.component('rx.take', {
  type: 'rx',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count())
})

jb.component('rx.last', {
    type: 'rx',
    category: 'filter',
    impl: () => jb.callbag.last()
})

jb.component('rx.skip', {
    type: 'rx',
    category: 'filter',
    params: [
        {id: 'count', as: 'number', dynamic: true},
    ],    
    impl: (ctx,count) => jb.callbag.skip(count())
})

jb.component('rx.subscribe', {
    type: 'rx',
    description: 'forEach action for all items',
    category: 'sink',
    params: [
      {id: 'next', type: 'action', dynamic: true, mandatory: true},
      {id: 'error', type: 'action', dynamic: true},
      {id: 'complete', type: 'action', dynamic: true},
    ],
    impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

// ********** subject 
jb.component('rx.subject', {
    type: 'data',
    description: 'callbag "variable" that you can write or listen to', 
    category: 'variable',
    params: [
      {id: 'replay', as: 'boolean', description: 'keep pushed items for late subscription'},
      {id: 'itemsToKeep', as: 'number', description: 'relevant for replay, empty for unlimited'},
    ],
    impl: (ctx,replay,itemsToKeep) => {
      const rcvr = jb.callbag.subject()
      return { rcvr, source: replay ? jb.callbag.replay(itemsToKeep)(rcvr): rcvr } 
    }
})
  
jb.component('rx.fromSubject', {
    type: 'rx',
    category: 'source',
    params: [
        {id: 'subject', mandatory: true },
      ],
    impl: (ctx,subj) => subj.source
})

jb.component('rx.subjectNext', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'data', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,data) => subject.rcvr.next(ctx.ctx({data: data(), profile: '', forcePath: ''}))
})

jb.component('rx.subjectComplete', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
    ],
    impl: (ctx,subject) => subject.rcvr.complete()
})

jb.component('rx.subjectError', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'error', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,error) => subject.rcvr.error(error())
})
;

