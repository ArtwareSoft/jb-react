(function() {
const is = (previous, current) => previous === current
const UNIQUE = {}
const kTrue = () => true
const identity = a => a

jb.callbag = {
    forEach: operation => source => {
        let talkback
        source(0, (t, d) => {
            if (t === 0) talkback = d
            if (t === 1) operation(d)
            if (t === 1 || t === 0) talkback(1)
        })
    },
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
    pipe(..._cbs) {
        const cbs = _cbs.filter(x=>x)
        if (!cbs[0]) return
        let res = cbs[0]
        for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res)
        return res
    },
    distinctUntilChanged(compare = is) {
        return source => (start, sink) => {
            if (start !== 0) return
            let inited = false
            let prev
            let talkback
            source(0, (type, data) => {
                if (type === 0) {
                    talkback = data
                }

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
        }
    },
    takeUntil(notifier) {
        if (Object.prototype.toString.call(notifier) === "[object Promise]")
            notifier = jb.callbag.fromPromise(notifier)
        return source => (start, sink) => {
            if (start !== 0) return
            let sourceTalkback
            let notifierTalkback
            let inited = false
            let done = UNIQUE

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
    flatMap: (_makeSource, combineResults) => inputSource => (start, sink) => {
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

        inputSource(0, (t, d) => {
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
    },
    fromEvent: (node, name, options) => (start, sink) => {
        if (start !== 0) return
        let disposed = false
        const handler = ev => sink(1, ev)
      
        sink(0, (t, d) => {
          if (t !== 2) {
            return
          }
          disposed = true
          if (node.removeEventListener) node.removeEventListener(name, handler, options)
          else if (node.removeListener) node.removeListener(name, handler)
          else throw new Error('cannot remove listener from node. No method found.')
        })
      
        if (disposed) {
          return
        }
      
        if (node.addEventListener) node.addEventListener(name, handler, options)
        else if (node.addListener) node.addListener(name, handler)
        else throw new Error('cannot add listener to node. No method found.')
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
    last: (predicate = kTrue, resultSelector = identity) => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        let lastVal
        let matched = false
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t === 1) {
            if (predicate(d)) {
              lastVal = d
              matched = true
            }
            talkback(1)
          } else if (t === 2) {
            if (matched) sink(1, resultSelector(lastVal))
            sink(2)
          } else {
            sink(t, d)
          }
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
    toPromise(source) {
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
    toPromiseArray(source) {
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
    startWith: (...xs) => inputSource => (start, sink) => {
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
      
        inputSource(0, (t, d) => {
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
        source(0,(t,d)=>{
            if (t !== 1) return sink(t,d)
            let id = setTimeout(()=> {
                clearTimeout(id)
                sink(1,d)
            },duration)
        })
    },
    skip: max => source => (start, sink) => {
        if (start !== 0) return;
        let skipped = 0;
        let talkback;
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d;
            sink(t, d);
          } else if (t === 1) {
            if (skipped < max) {
              skipped++;
              talkback(1);
            } else sink(t, d);
          } else {
            sink(t, d);
          }
        });
    },    
    fromCallBag: source => source,
    fromAny: (source, name, options) => {
        const f = source && 'from' + (Object.prototype.toString.call(source) === "[object Promise]" ? 'Promise'
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
    isCallbag: source => source.toString().split('=>')[0].replace(/\s/g,'').match(/start,sink|t,d/)
}


})()