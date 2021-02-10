var { If, call, rx,sink,source } = jb.ns('rx,sink,source')
// ************ sources

jb.component('source.data', {
  type: 'rx',
  params: [
    {id: 'data', mandatory: true },
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

jb.component('source.watchableData', {
  type: 'rx',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref' },
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x=>ctx.dataObj(x))(jb.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

jb.component('source.callbag', {
  type: 'rx',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'},
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})
  
jb.component('source.event', {
  type: 'rx',
  macroByValue: true,
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document },
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' },
  ],
  impl: (ctx,event,elem,options) => elem && jb.callbag.map(ev=>ctx.setVar('sourceEvent',ev).dataObj(ev))(jb.callbag.fromEvent(event,elem,options))
})

jb.component('source.any', {
  type: 'rx',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'},
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

jb.component('source.promise', {
  type: 'rx',
  params: [
    {id: 'promise', mandatory: true},
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

jb.component('source.interval', {
  type: 'rx',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

jb.component('rx.pipe', {
  type: 'rx,data,action',
  category: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: (ctx,elems) => jb.callbag.pipe(...jb.callbag.injectSniffers(elems(ctx).filter(x=>x),ctx))
})

jb.component('rx.merge', {
    type: 'rx',
    category: 'source',
    description: 'merge callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [] },
    ],
    impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

// ******** operators *****

jb.component('rx.innerPipe', {
  type: 'rx',
  category: 'operator',
  description: 'inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []},
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

jb.component('rx.startWith', {
    type: 'rx',
    category: 'operator',
    description: 'startWith callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array' },
    ],
    impl: (ctx,sources) => jb.callbag.startWith(...sources)
})

jb.component('rx.var', {
  type: 'rx',
  category: 'operator',
  description: 'define a variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true},
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
    if (start != 0) return 
    return source(0, function Var(t, d) {
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: value(d)}} : d)
    })
  }, null)
})

jb.component('rx.reduce', {
  type: 'rx',
  category: 'operator',
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
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
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
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.addDebugInfo(ctx2 => ({data: func(ctx2), vars: ctx2.vars || {}}),ctx))
})

jb.component('rx.mapPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ({vars: ctx2.vars || {}, data})))
})

jb.component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true},
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

jb.component('rx.flatMap', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'source', type: 'rx', category: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'},
  ],
  impl: (ctx,sourceGenerator) => source => (start, sink) => {
    if (start !== 0) return
    let sourceTalkback, innerSources = [], sourceEnded

    source(0, function flatMap(t, d) {
      if (t === 0) 
        sourceTalkback = d
      if (t === 1 && d != null)
        createInnerSrc(d)
      if (t === 2) {
          sourceEnded = true
          stopOrContinue(d)
      }
    })

    sink(0, function flatMap(t,d) {
      if (t == 1 && d == null || t == 2) {
        sourceTalkback(t,d)
        innerSources.forEach(src=>src.talkback && src.talkback(t,d))
      }
    })

    function createInnerSrc(d) {
      const newSrc = sourceGenerator(ctx.setData(d.data).setVars(d.vars))
      innerSources.push(newSrc)
      newSrc(0, function flatMap(t,d) {
        if (t == 0) newSrc.talkback = d
        if (t == 1) sink(t,d)
        if (t != 2 && newSrc.talkback) newSrc.talkback(1)
        if (t == 2) {
          innerSources.splice(innerSources.indexOf(newSrc),1)
          stopOrContinue(d)
        }
      })
    }

    function stopOrContinue(d) {
      if (sourceEnded && innerSources.length == 0)
        sink(2,d)
    }
  }
})

jb.component('rx.flatMapArrays', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'},
  ],
  impl: rx.flatMap(source.data(call('func')))
})

jb.component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines %$input% with the inner result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

jb.component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream', 
  category: 'filter',
  impl: () => jb.callbag.distinctUntilChanged((prev,cur) => prev && cur && prev.data == cur.data)
})

jb.component('rx.catchError', {
    type: 'rx',
    category: 'error',
    impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

jb.component('rx.timeoutLimit', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic' },
    {id: 'error', dynamic: true, defaultValue: 'timeout'},
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

jb.component('rx.throwError', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

jb.component('rx.debounceTime', {
    type: 'rx',
    description: 'waits for a cooldown period, them emits the last arrived',
    category: 'operator',
    params: [
      {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic' },
      {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true' },
    ],
    impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

jb.component('rx.throttleTime', {
  type: 'rx',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic' },
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true' },
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
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
      {id: 'notifier', type: 'rx', description: 'can be also promise or any other' },
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

jb.component('rx.takeWhile', {
  type: 'rx',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true},
    {id: 'passtLastEvent', as: 'boolean'}
  ],
  impl: (ctx,whileCondition,passtLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passtLastEvent)
})

jb.component('rx.toArray', {
  type: 'rx',
  category: 'operator',
  description: 'wait for all and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
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

jb.component('sink.action', {
  type: 'rx',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

jb.component('sink.data', {
  type: 'rx',
  params: [
    {id: 'data', as: 'ref', dynamic: true, mandatory: true},
  ],
  impl: sink.action(writeValue('%$data()%','%%'))
})

jb.component('rx.log', {
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'},
    {id: 'extra', as: 'single', dynamic: true},
  ],
  impl: (ctx,name,extra) => ctx.run(rx.do(_ctx => jb.log(name,{data: _ctx.data,vars: _ctx.vars,ctx, ...extra(_ctx)})))
})

jb.component('rx.clog', {
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'},
  ],
  impl: rx.do((x,{},{name}) => console.log(name,x))
})

jb.component('rx.sniffer', {
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'},
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
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
      const trigger = jb.callbag.subject()
      const source = replay ? jb.callbag.replay(itemsToKeep)(trigger): trigger
      source.ctx = trigger.ctx = ctx
      return { trigger, source } 
    }
})

jb.component('sink.subjectNext', {
  type: 'rx',
  params: [
      {id: 'subject', mandatory: true },
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

jb.component('source.subject', {
    type: 'rx',
    params: [
        {id: 'subject', mandatory: true },
      ],
    impl: (ctx,subj) => subj.source
})

jb.component('action.subjectNext', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'data', dynamic: true, defaultValue: '%%' },
    ],
    impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
})

jb.component('action.subjectComplete', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
    ],
    impl: (ctx,subject) => subject.trigger.complete()
})

jb.component('action.subjectError', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'error', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,error) => subject.trigger.error(error())
})
