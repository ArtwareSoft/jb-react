dsl('rx')

using('watchable,common')

// --- pipes
component('rxPipe', {
  type: 'data<>',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true},
    {id: 'elems', type: 'operator', dynamic: true}
  ],
  impl: (ctx,source,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx))].filter(x=>x),ctx))
})

component('rxFlow', {
  type: 'action<>',
  macroByValue: true,
  description: 'pipeline of reactive observables with source, operators, and sink',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true, mandatory: true},
    {id: 'elems', type: 'operator', dynamic: true, mandatory: true},
    {id: 'sink', type: 'sink', dynamic: true, mandatory: true},
  ],
  impl: (ctx,source,elems,sink) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx)), sink(ctx)].filter(x=>x),ctx))
})

component('sourcePipe', {
  type: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true},
    {id: 'elems', type: 'operator', dynamic: true}
  ],
  impl: (ctx,source,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx))].filter(x=>x),ctx))
})

component('data', {
  type: 'source',
  params: [
    {id: 'Data', mandatory: true}
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

component('watchableData', {
  type: 'source',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', byName: true, description: 'watch childern change as well'}
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x=>ctx.dataObj(x))(jb.watchable.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

component('callbag', {
  type: 'source',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'}
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})

component('callback', {
  type: 'source',
  params: [
    {id: 'registerFunc', mandatory: true, description: 'receive callback function, returns handler'},
    {id: 'unRegisterFunc', mandatory: true, description: 'receive handler from register'}
  ],
  impl: (ctx,registerFunc,unRegisterFunc) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromCallbackFunc(registerFunc,unRegisterFunc))
})

component('animationFrame', {
  type: 'source',
  impl: callback(()=>jb.frame.requestAnimationFrame, () => jb.frame.cancelAnimationFrame)
})

component('event', {
  type: 'source',
  macroByValue: true,
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll,resize'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document},
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'}
  ],
  impl: (ctx,event,elem,options) => elem && jb.callbag.map(sourceEvent=>ctx.setVars({sourceEvent, elem}).dataObj(sourceEvent))(jb.callbag.fromEvent(event,elem,options))
})

component('any', {
  type: 'source',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'}
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

component('promise', {
  type: 'source',
  params: [
    {id: 'promise', mandatory: true}
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

component('promises', {
  type: 'source',
  params: [
    {id: 'promises', type: 'data[]', mandatory: true}
  ],
  impl: (ctx,promises) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promises))
})

component('interval', {
  type: 'source',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

component('merge', {
  type: 'source',
  description: 'merge callbags sources (or any)',
  params: [
    {id: 'sources', type: 'source[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

component('mergeConcat', {
  type: 'source',
  description: 'merge sources while keeping the order of sources',
  params: [
    {id: 'sources', type: 'source[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: sourcePipe(
    data(ctx => ctx.cmpCtx.params.sources.profile),
    concatMap(ctx => ctx.run(ctx.data))
  )
})

// ******** operators *****

component('elems', {
  type: 'operator',
  description: 'composite operator, inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'operator[]', as: 'array', mandatory: true, composite: true}
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

component('startWith', {
  type: 'operator',
  description: 'startWith callbags sources (or any)',
  params: [
    {id: 'source', type: 'source', as: 'array'}
  ],
  impl: (ctx,source) => jb.callbag.startWith([source])
})

component('Var', {
  type: 'operator', 
  description: 'define an immutable variable that can be used later in the pipe. recalculated for each input',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true}
  ],
  impl: If('%$name%', ({},{},{name,value}) => source => (start, sink) => {
        if (start != 0) return
        return source(0, function Var(t, d) {
            sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: value(d)}} : d)
        })
    })
})

component('resource', {
  type: 'operator',
  description: 'define a static mutable variable that can be used later in the pipe. unlike Var it is calculated once',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, mandatory: true}
  ],
  impl: If('%$name%', ({},{},{name,value}) => source => (start, sink) => {
    if (start != 0) return
    const val = value()
    return source(0, function Var(t, d) {
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: val}} : d)
    })
  })
})

component('reduce', {
  type: 'operator',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc', byName: true},
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

component('count', {
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: reduce({ varName: '%$varName%', initialValue: 0, value: (ctx,{},{varName}) => ctx.vars[varName]+1 })
})

component('joinIntoVariable', {
  description: 'join vals into a variable',
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: reduce({
    varName: '%$varName%',
    initialValue: '%%',
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

component('join', {
  description: 'wait for all, and join vals',
  type: 'operator',
  params: [
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: elems(toArray(), map(join('%$separator%')))
})

component('max', {
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%'}
  ],
  impl: reduce({
    varName: '%$varName%',
    initialValue: -Infinity,
    value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})

component('Do', {
  type: 'operator',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

component('doPromise', {
  type: 'operator',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

component('map', {
  type: 'operator',
  params: [
    {id: 'func', type: 'data<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ({data: func(ctx2), vars: ctx2.vars || {}}),ctx))
})

component('mapPromise', {
  type: 'operator',
  params: [
    {id: 'func', type: 'action<>,data<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ({vars: ctx2.vars || {}, data}))
    .catch(err => ({vars: {...ctx2.vars, err }, data: err})) )
})

component('filter', {
  type: 'operator',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.utils.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

component('flatMap', {
  type: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'sourceGenerator', type: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'}
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

component('flatMapArrays', {
  type: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'}
  ],
  impl: flatMap(data('%$func()%'))
})

component('concatMap', {
  type: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines original %$input% with the inner func result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

component('distinctUntilChanged', {
  type: 'operator',
  description: 'filters adjacent items in stream',
  category: 'filter',
  params: [
    {id: 'equalsFunc', dynamic: true, mandatory: true, defaultValue: ({data},{prev}) => data === prev, description: 'e.g. %% == %$prev%'}
  ],
  impl: (ctx,equalsFunc) => jb.callbag.distinctUntilChanged((prev,cur) => equalsFunc(ctx.setData(cur.data).setVar('prev',prev.data)))
})

component('distinct', {
  type: 'operator',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('unique', {
  type: 'operator',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('catchError', {
  type: 'operator',
  category: 'error',
  impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

component('timeoutLimit', {
  type: 'operator',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic'},
    {id: 'error', dynamic: true, defaultValue: 'timeout'}
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

component('throwError', {
  type: 'operator',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

component('debounceTime', {
  type: 'operator',
  description: 'waits for a cooldown period, them emits the last arrived',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

component('throttleTime', {
  type: 'operator',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
})

component('delay', {
  type: 'operator',
  params: [
    {id: 'time', dynamic: true, description: 'can be dynamic'}
  ],
  impl: (ctx,time) => jb.callbag.delay(time)
})

component('replay', {
  type: 'operator',
  description: 'stores messages and replay them for later subscription',
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'}
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

component('takeUntil', {
  type: 'operator',
  description: 'closes the stream when events comes from notifier',
  category: 'terminate',
  params: [
    {id: 'notifier', type: 'source', description: 'can be also promise or any other'}
  ],
  impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

component('take', {
  type: 'operator',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count())
})

component('takeWhile', {
  type: 'operator',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'passtLastEvent', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,whileCondition,passtLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passtLastEvent)
})

component('toArray', {
  type: 'operator',
  description: 'wait for all to end, and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
})

component('last', {
  description: 'wait for all to end, and returns the last item',
  type: 'operator',
  category: 'filter',
  impl: () => jb.callbag.last()
})

component('skip', {
  type: 'operator',
  category: 'filter',
  params: [
    {id: 'count', as: 'number', dynamic: true}
  ],
  impl: (ctx,count) => jb.callbag.skip(count())
})

component('log', {
  type: 'operator',
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string', dynamic: true, description: 'log names'},
    {id: 'extra', as: 'single', dynamic: true, description: 'object. more properties to log'}
  ],
  impl: Do((ctx,vars,{name,extra}) => jb.log(name(ctx),{data: ctx.data,vars,...extra(ctx), ctx: ctx.cmpCtx}))
})

component('consoleLog', {
  type: 'operator',
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: Do((x,{},{name}) => console.log(name,x))
})

component('sniffer', {
  type: 'operator',
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
})

// component('Switch', {
//   type: 'operator',
//   description: 'like if, separate between cases',
//   params: [
//     {id: 'case', type: 'case[]', mandatory: true}
//   ]
// })

// component('sourceCase', {
//   type: 'case',
//   params: [
//     {id: 'condition', type: 'boolean', dynamic: true, mandatory: true},
//     {id: 'source', type: 'source', mandatory: true},
//   ]
// })

// component('operatorCase', {
//   type: 'case',
//   params: [
//     {id: 'condition', type: 'boolean', dynamic: true, mandatory: true},
//     {id: 'elems', type: 'operator', mandatory: true},
//   ]
// })

// ** sink

component('subscribe', {
  type: 'sink',
  description: 'forEach action for all items',
  params: [
    {id: 'next', type: 'action<>', dynamic: true, mandatory: true},
    {id: 'error', type: 'action<>', dynamic: true},
    {id: 'complete', type: 'action<>', dynamic: true}
  ],
  impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

component('action', {
  type: 'sink',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

component('writeValue', {
  type: 'sink',
  params: [
    {id: 'Data', as: 'ref', dynamic: true, mandatory: true}
  ],
  impl: action(writeValue('%$Data()%', '%%'))
})

// // ********** subject 
component('rxSubject', {
  type: 'data<>',
  description: 'callbag "variable" that you can write or listen to. use with Var',
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

component('subjectNext', {
  type: 'sink',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

component('subject', {
  type: 'source',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subj) => subj.source
})

// component('action.subjectNext', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true},
//     {id: 'Data', dynamic: true, defaultValue: '%%'}
//   ],
//   impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
// })

// component('action.subjectComplete', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true}
//   ],
//   impl: (ctx,subject) => subject.trigger.complete()
// })

// component('action.subjectError', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true},
//     {id: 'error', dynamic: true, mandatory: true}
//   ],
//   impl: (ctx,subject,error) => subject.trigger.error(error())
// })

// // ********** queue 
component('rxQueue', {
    type: 'data<>',
    description: 'message queue',
    category: 'variable',
    params: [
      {id: 'items', as: 'array'}
    ],
    impl: (ctx,items) => ({ items: items.slice(0), subject: jb.callbag.subject(), mkmk: 5 })
  })
  
  component('queue', {
    type: 'source',
    params: [
      {id: 'queue', mandatory: true}
    ],
    impl: merge(data('%$queue/items%'), '%$queue/subject%')
  })
  
  // component('action.addToQueue', {
  //   type: 'action',
  //   params: [
  //     {id: 'queue', mandatory: true},
  //     {id: 'item', dynamic: true, defaultValue: '%%'}
  //   ],
  //   impl: (ctx,queue,item) => {
  //     const toAdd = item(ctx)
  //     queue.items.push(toAdd)
  //     queue.subject.next(ctx.dataObj(toAdd)) 
  //   }
  // })
  
  // component('action.removeFromQueue', {
  //   type: 'action',
  //   params: [
  //     {id: 'queue', mandatory: true},
  //     {id: 'item', dynamic: true, defaultValue: '%%'}
  //   ],
  //   impl: (ctx,queue,item) => {
  // 		const index = queue.items.indexOf(item(ctx))
  // 		if (index != -1)
  //       queue.items.splice(index,1)
  //   }
  // })
