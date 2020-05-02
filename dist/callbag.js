(function() {
// inspired (and also many lines of code taken) from André Staltz, https://staltz.com/why-we-need-callbags.html
const is = (previous, current) => previous === current
const UNIQUE = {}
const kTrue = () => true
const identity = a => a

jb.callbag = {
    fromIter: iter => (start, sink) => {
        if (start !== 0) return
        const iterator =
            typeof Symbol !== 'undefined' && iter[Symbol.iterator]
            ? iter[Symbol.iterator]()
            : iter
        let inloop = false
        let got1 = false
        let res
        function loop() {
            inloop = true
            while (got1) {
                got1 = false
                res = iterator.next()
                if (res.done) sink(2)
                else sink(1, res.value)
            }
            inloop = false
        }
        sink(0, (t, d) => {
            if (t === 1) {
                got1 = true
                if (!inloop && !(res && res.done)) loop()
            }
        })
    },
    pipe(..._cbs) {
      const cbs = _cbs.filter(x=>x)
      if (!cbs[0]) return
      let res = cbs[0]
      for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res)
      return res
    },
    Do: f => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => {
            if (t == 1) f(d)
            sink(t, d)
        })
    },
    filter: condition => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t === 1) {
            if (condition(d)) sink(t, d)
            else talkback(1)
          }
          else sink(t, d)
        })
    },
    map: f => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => {
            sink(t, t === 1 ? f(d) : d)
        })
    },
    distinctUntilChanged: compare => source => (start, sink) => {
        compare = compare || is
        if (start !== 0) return
        let inited = false, prev, talkback
        source(0, (type, data) => {
            if (type === 0) talkback = data
            if (type !== 1) {
                sink(type, data)
                return
            }
            if (inited && compare(prev, data)) {
                talkback(1)
                return
            }
            inited = true
            prev = data
            sink(1, data)
        })
    },
    takeUntil(notifier) {
        if (jb.isPromise(notifier))
            notifier = jb.callbag.fromPromise(notifier)
        return source => (start, sink) => {
            if (start !== 0) return
            let sourceTalkback, notifierTalkback, inited = false, done = UNIQUE

            source(0, (t, d) => {
                if (t === 0) {
                    sourceTalkback = d

                    notifier(0, (t, d) => {
                        if (t === 0) {
                            notifierTalkback = d
                            notifierTalkback(1)
                            return
                        }
                        if (t === 1) {
                            done = void 0
                            notifierTalkback(2)
                            sourceTalkback(2)
                            if (inited) sink(2)
                            return
                        }
                        if (t === 2) {
                            notifierTalkback = null
                            done = d
                            if (d != null) {
                                sourceTalkback(2)
                                if (inited) sink(t, d)
                            }
                        }
                    })
                    inited = true

                    sink(0, (t, d) => {
                        if (done !== UNIQUE) return
                        if (t === 2 && notifierTalkback) notifierTalkback(2)
                        sourceTalkback(t, d)
                    })

                    if (done !== UNIQUE) sink(2, done)
                    return
                }
                if (t === 2) notifierTalkback(2)
                if (done === UNIQUE) sink(t, d)
            })
        }
    },
    flatMap: (_makeSource, combineResults) => source => (start, sink) => {
        if (start !== 0) return
        const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
        if (!combineResults) combineResults = (x, y) => y

        let index = 0
        let talkbacks = {}
        let sourceEnded = false
        let inputSourceTalkback = null

        let pullHandle = (t, d) => {
            var currTalkback = Object.values(talkbacks).pop()
            if (t === 1) {
                if (currTalkback) currTalkback(1)
                else if (!sourceEnded) inputSourceTalkback(1)
                else sink(2)
            }
            if (t === 2) {
                if (currTalkback) currTalkback(2)
                inputSourceTalkback(2)
            }
        }

        let stopOrContinue = d => {
            if (sourceEnded && Object.keys(talkbacks).length === 0) sink(2, d)
            else inputSourceTalkback(1)
        }

        let makeSink = (i, d, talkbacks) =>
            (currT, currD) => {
                if (currT === 0) {talkbacks[i] = currD; talkbacks[i](1)}
                if (currT === 1) sink(1, combineResults(d, currD))
                if (currT === 2) {
                    delete talkbacks[i]
                    stopOrContinue(currD)
                }
            }

        source(0, (t, d) => {
            if (t === 0) {
                inputSourceTalkback = d
                sink(0, pullHandle)
            }
            if (t === 1) {
                makeSource(d)(0, makeSink(index++, d, talkbacks))
            }
            if (t === 2) {
                sourceEnded = true
                stopOrContinue(d)
            }
    })
    },
    merge(..._sources) {
        const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
        return (start, sink) => {
          if (start !== 0) return
          const n = sources.length
          const sourceTalkbacks = new Array(n)
          let startCount = 0
          let endCount = 0
          let ended = false
          const talkback = (t, d) => {
            if (t === 2) ended = true
            for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
          }
          for (let i = 0; i < n; i++) {
            if (ended) return
            sources[i](0, (t, d) => {
              if (t === 0) {
                sourceTalkbacks[i] = d
                if (++startCount === 1) sink(0, talkback)
              } else if (t === 2 && d) {
                ended = true
                for (let j = 0; j < n; j++) {
                  if (j !== i) sourceTalkbacks[j] && sourceTalkbacks[j](2)
                }
                sink(2, d)
              } else if (t === 2) {
                sourceTalkbacks[i] = void 0
                if (++endCount === n) sink(2)
              } else sink(t, d)
            })
          }
        }
    }, // elem,event,options
    fromEvent: (event, elem, options) => (start, sink) => {
        if (start !== 0) return
        let disposed = false
        const handler = ev => sink(1, ev)
      
        sink(0, (t, d) => {
          if (t !== 2) {
            return
          }
          disposed = true
          if (elem.removeEventListener) elem.removeEventListener(event, handler, options)
          else if (elem.removeListener) elem.removeListener(event, handler)
          else throw new Error('cannot remove listener from elem. No method found.')
        })
      
        if (disposed) {
          return
        }
      
        if (elem.addEventListener) elem.addEventListener(event, handler, options)
        else if (elem.addListener) elem.addListener(event, handler)
        else throw new Error('cannot add listener to elem. No method found.')
    },
    fromPromise: promise => (start, sink) => {
        if (start !== 0) return
        let ended = false
        const onfulfilled = val => {
          if (ended) return
          sink(1, val)
          if (ended) return
          sink(2)
        }
        const onrejected = (err = new Error()) => {
          if (ended) return
          sink(2, err)
        }
        promise.then(onfulfilled, onrejected)
        sink(0, (t, d) => {
          if (t === 2) ended = true
        })
    },
    subject() {
        let sinks = []
        const subj = (t, d) => {
            if (t === 0) {
                const sink = d
                sinks.push(sink)
                sink(0, t => {
                    if (t === 2) {
                        const i = sinks.indexOf(sink)
                        if (i > -1) sinks.splice(i, 1)
                    }
            })
            } else {
                    const zinkz = sinks.slice(0)
                    for (let i = 0, n = zinkz.length, sink; i < n; i++) {
                        sink = zinkz[i]
                        if (sinks.indexOf(sink) > -1) sink(t, d)
                }
            }
        }
        subj.next = data => subj(1,data)
        subj.complete = () => subj(2)
        subj.error = err => subj(2,err)
        return subj
    },
    catchError: fn => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => t === 2 && typeof d !== 'undefined' ? fn(d) : sink(t, d))
    },
    concatMap(_project) {
        const project = (...args) => jb.callbag.fromAny(_project(...args))
        return source => (start, sink) => {
          if (start !== 0) return
          const queue = []
          let innerTalkback = null
          let sourceTalkback
      
          const innerSink = (t, d) => {
            if (t === 0) {
              innerTalkback = d
              innerTalkback(1)
            } else if (t === 1) {
              sink(1, d)
              innerTalkback(1)
            } else if (t === 2) {
              innerTalkback = null
              if (queue.length === 0) return
              project(queue.shift())(0, innerSink)
            }
          }
      
          const wrappedSink = (t, d) => {
            if (t === 2 && innerTalkback !== null) innerTalkback(2, d)
            sourceTalkback(t, d)
          }
      
          source(0, (t, d) => {
            if (t === 0) {
              sourceTalkback = d
              sink(0, wrappedSink)
              return
            } else if (t === 1) {
              if (innerTalkback !== null) 
                queue.push(d) 
              else 
                project(d)(0, innerSink)
            } else if (t === 2) {
              sink(2, d)
              if (innerTalkback !== null) innerTalkback(2, d)
            }
          })
        }
    },
    create: prod => (start, sink) => {
        if (start !== 0) return
        if (typeof prod !== 'function') {
          sink(0, () => {})
          sink(2)
          return
        }
        let end = false
        let clean
        sink(0, (t) => {
          if (!end) {
            end = t === 2
            if (end && typeof clean === 'function') clean()
          }
        })
        if (end) return
        clean = prod((v) => {
            if (!end) sink(1, v)
          }, (e) => {
            if (!end && e !== undefined) {
              end = true
              sink(2, e)
            }
          }, () => {
            if (!end) {
              end = true
              sink(2)
            }
        })
    },
    debounceTime: duration => source => (start, sink) => {
        if (start !== 0) return
        let timeout
        source(0, (t, d) => {
          // every event clears the existing timeout, if any
          if (timeout) clearTimeout(timeout)
          if (t === 1) timeout = setTimeout(() => sink(1, d), typeof duration == 'function' ? duration() : duration)
          else sink(t, d)
        })
    },
    take: max => source => (start, sink) => {
        if (start !== 0) return
        let taken = 0
        let sourceTalkback
        let end
        function talkback(t, d) {
          if (t === 2) {
            end = true
            sourceTalkback(t, d)
          } else if (taken < max) sourceTalkback(t, d)
        }
        source(0, (t, d) => {
          if (t === 0) {
            sourceTalkback = d
            sink(0, talkback)
          } else if (t === 1) {
            if (taken < max) {
              taken++
              sink(t, d)
              if (taken === max && !end) {
                end = true
                sourceTalkback(2)
                sink(2)
              }
            }
          } else {
            sink(t, d)
          }
        })
    },
    last: () => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        let lastVal
        let matched = false
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t === 1) {
            lastVal = d
            matched = true
            talkback(1)
          } else if (t === 2) {
            if (matched) sink(1, lastVal)
            sink(2)
          } else {
            sink(t, d)
          }
        })
    },
    forEach: operation => source => {
      let talkback
      source(0, (t, d) => {
          if (t === 0) talkback = d
          if (t === 1) operation(d)
          if (t === 1 || t === 0) talkback(1)
      })
    },
    subscribe: (listener = {}) => source => {
        if (typeof listener === "function") listener = { next: listener }
        let { next, error, complete } = listener
        let talkback
        source(0, (t, d) => {
          if (t === 0) talkback = d
          if (t === 1 && next) next(d)
          if (t === 1 || t === 0) talkback(1)  // Pull
          if (t === 2 && !d && complete) complete()
          if (t === 2 && !!d && error) error( d )
          if (t === 2 && listener.finally) listener.finally( d )
        })
        return () => talkback && talkback(2) // dispose
    },
    mapPromise: promiseF => jb.callbag.concatMap(e => jb.callbag.fromPromise(promiseF(e))),
    toPromise: source => {
        return new Promise((resolve, reject) => {
          jb.callbag.subscribe({
            next: resolve,
            error: reject,
            complete: () => {
              const err = new Error('No elements in sequence.')
              err.code = 'NO_ELEMENTS'
              reject(err)
            },
          })(jb.callbag.last(source))
        })
    },
    toPromiseArray: source => {
        const res = []
        let talkback
        return new Promise((resolve, reject) => {
                source(0, (t, d) => {
                    if (t === 0) talkback = d
                    if (t === 1) res.push(d)
                    if (t === 1 || t === 0) talkback(1)  // Pull
                    if (t === 2 && !d) resolve(res)
                    if (t === 2 && !!d) reject( d )
            })
        })
    },
    interval: period => (start, sink) => {
      if (start !== 0) return
      let i = 0;
      const id = setInterval(() => {
        sink(1, i++)
      }, period)
      sink(0, t => {
        if (t === 2) clearInterval(id)
      })
    },
    startWith: (...xs) => source => (start, sink) => {
        if (start !== 0) return
        let disposed = false
        let inputTalkback
        let trackPull = false
        let lastPull
      
        sink(0, (t, d) => {
          if (trackPull && t === 1) {
            lastPull = [1, d]
          }
      
          if (t === 2) {
            disposed = true
            xs.length = 0
          }
      
          if (!inputTalkback) return
          inputTalkback(t, d)
        })
      
        while (xs.length !== 0) {
          if (xs.length === 1) {
            trackPull = true
          }
          sink(1, xs.shift())
        }
      
        if (disposed) return
      
        source(0, (t, d) => {
          if (t === 0) {
            inputTalkback = d
            trackPull = false
      
            if (lastPull) {
              inputTalkback(...lastPull)
              lastPull = null
            }
            return
          }
          sink(t, d)
        })
    },
    delay: duration => source => (start, sink) => {
        if (start !== 0) return
        source(0,(t,d) => {
            if (t !== 1) return sink(t,d)
            let id = setTimeout(()=> {
                clearTimeout(id)
                sink(1,d)
            }, typeof duration == 'function' ? duration() : duration)
        })
    },
    skip: max => source => (start, sink) => {
        if (start !== 0) return
        let skipped = 0, talkback
        source(0, (t, d) => {
          if (t === 0) talkback = d
          if (t === 1 && skipped < max) {
              skipped++
              talkback(1)
              return
          }
          sink(t, d)
        })
    },
    sourceSniffer: (cb, snifferSubject) => (start, sink) => {
      if (start !== 0) return
      jb.log('snifferStarted',[])
      cb(0, (t,d) => {
        snif('out',t,d)
        sink(t,d)
      })
      sink(0,(t,d) => snif('talkback',t,d))

      function snif(dir,t,d) {
        const now = new Date()
        const time = `${now.getSeconds()}:${now.getMilliseconds()}`
        if (t == 1) snifferSubject.next({dir, d, time})
        if (t == 2) {
          jb.log('snifferCompleted',[])
          snifferSubject.complete()
        }
      }
    },
    sniffer: (cb, snifferSubject) => source => (start, sink) => {
      if (start !== 0) return
      jb.log('snifferStarted',[])
      const cbSource = (start, sink) => {
        if (start != 0) return
        source(0, (t,d) => {
          snif('in',t,d)
          sink(t,d)
        })
      }

      // cbSink
      cb(cbSource)(0, (t,d) => {
        snif('out',t,d)
        sink(t,d)
      })

      function snif(dir,t,d) {
        const now = new Date()
        const time = `${now.getSeconds()}:${now.getMilliseconds()}`
        if (t == 1) snifferSubject.next({dir, d, time})
        if (t == 2) {
          jb.log('snifferCompleted',[])
          snifferSubject.complete()
        }
      }
    },
    fromCallBag: source => source,
    fromAny: (source, name, options) => {
        const f = source && 'from' + (jb.isPromise(source) ? 'Promise'
            : source.addEventListener ? 'Event'
            : typeof source[Symbol.iterator] === 'function' ? 'Iter'
            : '')
        if (jb.callbag[f]) 
            return jb.callbag[f](source, name, options)
        else if (jb.callbag.isCallbag(source))
            return source
        else
            return jb.callbag.fromIter([source])
    },
    isCallbag: source => typeof source == 'function' && source.toString().split('=>')[0].replace(/\s/g,'').match(/start,sink|t,d/),
    isCallbagFunc: source => typeof source == 'function' && source.toString().split('\n')[0].replace(/\s/g,'').match(/source|start,sink|t,d/)
}

})()
;

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
;

