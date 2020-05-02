jb.ns('rx')

jb.component('rx.pipe', {
  type: 'rx,data',
  category: 'combine',
  description: 'pipeline of reactive observables',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []}
  ],
  impl: (ctx,elems) => jb.callbag.pipe(...elems)
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
  
jb.component('rx.fromEvent', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document },
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' },
  ],
  impl: (ctx,event,elem,options) => jb.callbag.fromEvent(event,elem,options)
})

jb.component('rx.fromIter', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'iter', mandatory: true, as: 'array', description: 'array or js Iterators or Generators. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators '},
  ],
  impl: (ctx,iter) => jb.callbag.fromIter(iter)
})

jb.component('rx.fromAny', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'},
  ],
  impl: (ctx,source) => jb.callbag.fromAny(source || [])
})

jb.component('rx.fromPromise', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'promise', mandatory: true},
  ],
  impl: (ctx,promise) => jb.callbag.fromPromise(promise || Promise.resolve())
})

jb.component('rx.interval', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.interval(interval)
})

// ******** operators *****

jb.component('rx.do', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.Do(x => action(ctx.setData(x)))
})

jb.component('rx.map', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true},
  ],
  impl: (ctx,func) => jb.callbag.map(x => func(ctx.setData(x)))
})

jb.component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true},
  ],
  impl: (ctx,filter) => jb.callbag.map(x => filter(ctx.setData(x)))
})

jb.component('rx.flatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'can return array, promise or callbag'},
  ],
  impl: (ctx,func) => jb.callbag.flatMap(x => func(ctx.setData(x)))
})

jb.component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
  ],
  impl: (ctx,func) => jb.callbag.concatMap(x => func(ctx.setData(x)))
})

jb.component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream', 
  category: 'filter',
  params: [
    {id: 'compareFunc', dynamic: true, description: 'default is identical, compare %prev% to %data%'},
  ],
  impl: (ctx,compareFunc) => jb.callbag.distinctUntilChanged(compareFunc && ((prev, data) => compareFunc(ctx.setData({prev, data}))))
})

jb.component('rx.catchError', {
    type: 'rx',
    category: 'error',
    params: [
      {id: 'handler', type: 'action', dynamic: true, mandatory: true },
    ],
    impl: (ctx,handler) => jb.callbag.catchError(err => handler(ctx.setData(err)))
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

jb.component('rx.takeUntil', {
    type: 'rx',
    description: 'closes the stream when events comes from notifier', 
    category: 'destructor',
    params: [
      {id: 'notifier', dynamic: true, type: 'rx', description: 'can be also promise or any other' },
    ],
    impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

jb.component('rx.take', {
  type: 'rx',
  description: 'closes the stream after taking some items',
  category: 'destructor',
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
    impl: (ctx,next, error, complete) => jb.callbag.subscribe(x => next(ctx.setData(x)), err => error(ctx.setData(err)), () => complete())
})




// ********** subject 
jb.component('rx.subject', {
    type: 'data',
    description: 'callbag "variable" that you can write or listen to', 
    category: 'variable',
    impl: () => jb.callbag.subject()
})
  
jb.component('rx.subjectAsSource', {
    type: 'rx',
    params: [
        {id: 'subject', dynamic: true, mandatory: true },
      ],
    impl: '%$subject%'
})

jb.component('rx.subject.next', {
    type: 'action',
    params: [
        {id: 'subject', dynamic: true, mandatory: true },
        {id: 'data', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,data) => subject().next(data())
})

jb.component('rx.subject.complete', {
    type: 'action',
    params: [
        {id: 'subject', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject) => subject().complete()
})

jb.component('rx.subject.error', {
    type: 'action',
    params: [
        {id: 'subject', dynamic: true, mandatory: true },
        {id: 'error', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,error) => subject().error(error())
})
