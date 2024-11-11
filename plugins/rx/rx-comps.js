using('watchable,common')

component('source.data', {
  type: 'rx',
  params: [
    {id: 'Data', mandatory: true}
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

component('source.watchableData', {
  type: 'rx',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', byName: true, description: 'watch childern change as well'}
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x => ctx.dataObj({...x, before: null, after: null}))(jb.watchable.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

component('source.callbag', {
  type: 'rx',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'}
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})

component('source.callbackLoop', {
  type: 'rx',
  params: [
    {id: 'registerFunc', mandatory: true, description: 'receive callback function. needs to be recalled for next event'},
  ],
  impl: (ctx,registerFunc) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromCallbackLoop(registerFunc))
})

component('source.animationFrame', {
  type: 'rx',
  impl: source.callbackLoop(()=>jb.frame.requestAnimationFrame || (() => {}))
})

/*
producer interface: obs => {
  bind('myBind', handler)
  return () => unbind('myBind',handler)
  function handler(x) { obs(x) }
}
*/
component('source.producer', {
  type: 'rx',
  params: [
    {id: 'producer', dynamic: true, mandatory: true, description: 'producer function'},
  ],
  impl: (ctx,producer) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromProducer(producer))
})

component('source.event', {
  type: 'rx',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll,resize'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document},
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'},
    {id: 'selector', as: 'string', description: 'optional, including the elem', byName: true}
  ],
  impl: (ctx,event,_elem,options,selector) => {
    const elem = selector ? jb.ui.findIncludeSelf(_elem,selector)[0]: _elem
    return elem && jb.callbag.map(sourceEvent=>ctx.setVars({sourceEvent, elem}).dataObj(sourceEvent))(jb.callbag.fromEvent(event,elem,options))
  }
})

component('source.any', {
  type: 'rx',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'}
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

component('source.promise', {
  type: 'rx',
  params: [
    {id: 'promise', mandatory: true}
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

component('source.interval', {
  type: 'rx',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

component('rx.pipe', {
  type: 'rx',
  moreTypes: 'data<>,action<>',
  category: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: (ctx,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers(elems(ctx).filter(x=>x),ctx))
})

component('source.merge', {
  type: 'rx',
  category: 'source',
  description: 'merge callbags sources (or any)',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

component('source.mergeConcat', {
  type: 'rx',
  category: 'source',
  description: 'merge sources while keeping the order of sources',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: rx.pipe(
    source.data(ctx => ctx.cmpCtx.params.sources.profile),
    rx.concatMap(ctx => ctx.run(ctx.data))
  )
})

// ******** operators *****

component('rx.innerPipe', {
  type: 'rx',
  category: 'operator',
  description: 'composite operator, inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []}
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

component('rx.fork', {
  type: 'rx',
  category: 'operator',
  description: 'separate operator with same source data',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []}
  ],
  impl: (ctx,elems) => jb.callbag.fork(...elems)
})

component('rx.startWith', {
  type: 'rx',
  category: 'operator',
  description: 'startWith callbags sources (or any)',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array'}
  ],
  impl: (ctx,sources) => jb.callbag.startWith(...sources)
})

component('rx.var', {
  type: 'rx',
  category: 'operator',
  description: 'define an immutable variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true}
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
      if (start != 0) return 
      return source(0, function Var(t, d) {
        const vars = t == 1 && d && {...d.vars, [name()]: value(d)}
        t == 1 && d && ctx.cmpCtx.dataObj(d.data,vars)
        sink(t, t === 1 ? d && {data: d.data, vars } : d)
      })
    })
})

component('rx.resource', {
  type: 'rx',
  category: 'operator',
  description: 'define a static mutable variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, mandatory: true}
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
    if (start != 0) return
    let val, calculated
    return source(0, function Var(t, d) {
      val = calculated ? val : value()
      calculated = true
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: val}} : d)
    })
  })
})

component('rx.reduce', {
  type: 'rx',
  category: 'operator',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc'},
    {id: 'initialValue', dynamic: true, description: 'receives first value as input', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated value use %$acc%,%% %$prev%', mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor', type: 'boolean'}
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, prev, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, prev, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
        prev = d.data
      } else {
        sink(t, d)
      }
    })
  }
})

component('rx.count', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: rx.reduce('%$varName%', 0, { value: (ctx,{},{varName}) => ctx.vars[varName]+1 })
})

component('rx.join', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: rx.reduce('%$varName%', '%%', {
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

component('rx.max', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%'}
  ],
  impl: rx.reduce('%$varName%', -Infinity, {
    value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})

component('rx.do', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

component('rx.doPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

component('rx.map', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ctx.dataObj(func(ctx2), ctx2.vars || {},ctx2.data),ctx))
})

component('rx.mapPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', type: 'data', moreTypes: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ctx.dataObj(data, ctx2.vars || {}, ctx2.data))
    .catch(err => ({vars: {...ctx2.vars, err }, data: err})) )
})

component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.utils.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

component('rx.flatMap', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'source', type: 'rx', category: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'}
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
        sourceTalkback && sourceTalkback(t,d)
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

component('rx.flatMapArrays', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'}
  ],
  impl: rx.flatMap(source.data(call('func')))
})

component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', type: 'rx', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines %$input% with the inner result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream',
  category: 'filter',
  params: [
    {id: 'equalsFunc', dynamic: true, mandatory: true, defaultValue: ({data},{prev}) => data === prev, description: 'e.g. %% == %$prev%'}
  ],
  impl: (ctx,equalsFunc) => jb.callbag.distinctUntilChanged((prev,cur) => equalsFunc(ctx.setData(cur.data).setVar('prev',prev.data)), ctx)
})

component('rx.distinct', {
  type: 'rx',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('rx.catchError', {
  type: 'rx',
  category: 'error',
  impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

component('rx.timeoutLimit', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic'},
    {id: 'error', dynamic: true, defaultValue: 'timeout'}
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

component('rx.throwError', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

component('rx.debounceTime', {
  type: 'rx',
  description: 'waits for a cooldown period, them emits the last arrived',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

component('rx.throttleTime', {
  type: 'rx',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
})

component('rx.delay', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'time', dynamic: true, description: 'can be dynamic'}
  ],
  impl: (ctx,time) => jb.callbag.delay(time)
})

component('rx.replay', {
  type: 'rx',
  description: 'stores messages and replay them for later subscription',
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'}
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

component('rx.takeUntil', {
  type: 'rx',
  description: 'closes the stream when events comes from notifier',
  category: 'terminate',
  params: [
    {id: 'notifier', type: 'rx', description: 'can be also promise or any other'}
  ],
  impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

component('rx.take', {
  type: 'rx',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count(),ctx)
})

component('rx.takeWhile', {
  type: 'rx',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'passLastEvent', as: 'boolean', type: 'boolean', byName: true}
  ],
  impl: (ctx,whileCondition,passLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passLastEvent)
})

component('rx.toArray', {
  type: 'rx',
  category: 'operator',
  description: 'wait for all and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
})

component('rx.last', {
  type: 'rx',
  category: 'filter',
  impl: () => jb.callbag.last()
})

component('rx.skip', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'count', as: 'number', dynamic: true}
  ],
  impl: (ctx,count) => jb.callbag.skip(count())
})

component('rx.subscribe', {
  type: 'rx',
  description: 'forEach action for all items',
  category: 'sink',
  params: [
    {id: 'next', type: 'action', dynamic: true, mandatory: true},
    {id: 'error', type: 'action', dynamic: true},
    {id: 'complete', type: 'action', dynamic: true}
  ],
  impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

component('sink.action', {
  type: 'rx',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

component('sink.data', {
  type: 'rx',
  params: [
    {id: 'Data', as: 'ref', dynamic: true, mandatory: true}
  ],
  impl: sink.action(writeValue('%$Data()%', '%%'))
})

component('rx.log', {
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string', dynamic: true, description: 'log names'},
    {id: 'extra', as: 'single', dynamic: true, description: 'object. more properties to log'}
  ],
  impl: rx.do((ctx,vars,{name,extra}) => jb.log(name(ctx),{data: ctx.data,vars,...extra(ctx), ctx: ctx.cmpCtx}))
})

component('rx.clog', {
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: rx.do((x,{},{name}) => console.log(name,x))
})

component('rx.sniffer', {
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
})

// ********** subject 
component('rx.subject', {
  type: 'data',
  description: 'callbag "variable" that you can write or listen to',
  category: 'variable',
  params: [
    {id: 'id', as: 'string', description: 'can be used for logging'},
    {id: 'replay', as: 'boolean', description: 'keep pushed items for late subscription', type: 'boolean'},
    {id: 'itemsToKeep', as: 'number', description: 'relevant for replay, empty for unlimited'}
  ],
  impl: (ctx,id, replay,itemsToKeep) => {
      const trigger = jb.callbag.subject(id)
      const source = replay ? jb.callbag.replay(itemsToKeep)(trigger): trigger
      source.ctx = trigger.ctx = ctx
      return { trigger, source } 
    }
})

component('sink.subjectNext', {
  type: 'rx',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

component('source.subject', {
  type: 'rx',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subj) => subj.source
})

component('action.subjectNext', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true},
    {id: 'Data', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
})

component('action.subjectComplete', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => subject.trigger.complete()
})

component('action.subjectError', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true},
    {id: 'error', dynamic: true, mandatory: true}
  ],
  impl: (ctx,subject,error) => subject.trigger.error(error())
})

// ********** queue 
component('rx.queue', {
  type: 'data',
  description: 'message queue',
  category: 'variable',
  params: [
    {id: 'items', as: 'array'}
  ],
  impl: (ctx,items) => ({ items: items.slice(0), subject: jb.callbag.subject(), mkmk: 5 })
})

component('source.queue', {
  type: 'rx',
  params: [
    {id: 'queue', mandatory: true}
  ],
  impl: source.merge(source.data('%$queue/items%'), '%$queue/subject%')
})

component('action.addToQueue', {
  type: 'action',
  params: [
    {id: 'queue', mandatory: true},
    {id: 'item', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,queue,item) => {
    const toAdd = item(ctx)
    queue.items.push(toAdd)
    queue.subject.next(ctx.dataObj(toAdd)) 
  }
})

component('action.removeFromQueue', {
  type: 'action',
  params: [
    {id: 'queue', mandatory: true},
    {id: 'item', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,queue,item) => {
		const index = queue.items.indexOf(item(ctx))
		if (index != -1)
      queue.items.splice(index,1)
  }
})
