jb.component('dataTest.pipeWithObservable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.callbag.fromIter([1,2]), '%%a', join({})),
    expectedResult: equals('1a,2a')
  })
})
  
jb.component('dataTest.callbag.mapPromise', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(0)),
          rx.mapPromise(({data}) =>jb.delay(1,data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbag.doPromise', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(1)),
          rx.doPromise( ({data}) =>jb.delay(1,data *10)),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
        ),
    expectedResult: equals('3')
  })
})

jb.component('dataTest.callbag.pipe', {
  impl: dataTest({
    calculate: pipe(rx.pipe( rx.fromIter(list('1','2','3','4')),rx.map('-%%-')),join(',')),    
    expectedResult: equals('-1-,-2-,-3-,-4-')
  })
})

jb.component('dataTest.callbag.pipeInsidePipeWithConcatMap', {
  impl: dataTest({
    calculate: ctx => {
      const {pipe,fromIter, map, concatMap, toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([1,2]), concatMap(x => pipe(fromIter([x]), map(x=>`-${x}-`))))).then(ar=>ar.join(','))
    },
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('dataTest.callbag.rawPipeInsidePipe', {
  impl: dataTest({
    calculate: ctx => {
      const {pipe,fromIter, map, toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([1,2]), x => pipe(x, map(x=>`-${x}-`)))).then(ar=>ar.join(','))
    },
    expectedResult: equals('-1-,-2-')
  })
})

jb.cbLogByPath = {}

jb.component('dataTest.callbagTakeWhile', {
  impl: dataTest({
    calculate: pipe(rx.pipe(rx.interval(1), rx.takeWhile('%%<2')), join(',')),
    expectedResult: equals('0,1')
  })
})

jb.component('dataTest.callbagActionPulls', {
  impl: dataTest({
    vars: Var('out',obj()),
    runBefore: rx.pipe(source.data(1), rx.map('%%'), sink.data('%$out/x%')),
    calculate: '%$out/x%',
    expectedResult: equals('1')
  })
})

jb.component('dataTest.callbagTakeWhileIter', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.fromIter([0,1,2,3]),
          rx.takeWhile('%%<2')
        ),
      join(',')
    ),
    expectedResult: equals('0,1')
  })
})


jb.component('dataTest.callbag.innerPipe', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.interval(1),
          rx.take(2),
          rx.innerPipe(
              rx.mapPromise(pipe(delay(1), '-%%-')),
              rx.var('a', '-%%-'),
              rx.map('-%$a%-')
            )
        ),
      join(',')
    ),
    expectedResult: equals('---0---,---1---')
  })
})

jb.component('dataTest.callbag.interval', {
  impl: dataTest({
    calculate: pipe(rx.pipe(rx.interval(1), rx.take('4'), rx.map('-%%-')), join(',')),
    expectedResult: equals('-0-,-1-,-2-,-3-')
  })
})

jb.component('dataTest.callbag.var', {
  impl: dataTest({
    vars: [Var('a', 'hello')],
    calculate: pipe(
      rx.pipe(
          rx.interval(1),
          rx.take('4'),
          rx.var('origin'),
          rx.map('-%%-'),
          rx.map('%$a%;%%;%$origin%'),
          rx.last()
        ),
      join(',')
    ),
    expectedResult: equals('hello;-3-;3')
  })
})

jb.component('dataTest.callbag.reduceCount', {
  impl: dataTest({
    calculate: rx.pipe(rx.interval(1),rx.take('4'),rx.count(),rx.map('%$count%'),rx.last() ),
    expectedResult: equals(4)
  })
})

jb.component('dataTest.callbag.reduceMax', {
  impl: dataTest({
    calculate: rx.pipe(rx.interval(1),rx.take('4'),rx.max(),rx.map('%$max%'),rx.last()),
    expectedResult: equals(3)
  })
})

jb.component('dataTest.callbag.reduceJoin', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.interval(1),
      rx.take('4'),
      rx.join('res', ';'),
      rx.map('%$res%'),
      rx.last()
    ),
    expectedResult: equals('0;1;2;3')
  })
})

jb.component('studioHelper.jbEditor.callbag', {
  type: 'control',
  impl: group({
    controls: [
      studio.jbEditor('dataTest.callbag.pipe~impl')
    ],
    features: [
      css('{ height: 200px; padding: 50px }'),
      studio.jbEditorContainer({id: 'helper', initialSelection: 'dataTest.callbag.pipe~impl~calculate~items~0~elems~0', circuit: 'dataTest.callbag.pipe'})
    ]
  })
})

jb.component('dataTest.callbag.rawFlatMapPassivePassive', {
  impl: dataTest({
    calculate: ctx => { const {flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), flatMap(x=> pipe(fromIter([0]),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.rawflatMapPassiveActive', {
  impl: dataTest({
    calculate: ctx => { const {interval, take,flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), flatMap(x=> pipe(interval(1), take(1),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.rawflatMapActivePassive', {
  impl: dataTest({
    calculate: ctx => { const {interval, take,flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(interval(1), take(1), flatMap(x=> pipe(fromIter([0]),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.rawflatMapActiveActive', {
  impl: dataTest({
    calculate: ctx => { const {interval, take,flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(interval(1), take(1), flatMap(x=> pipe(interval(1), take(1),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.flatMapPassivePassive', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(0)),
          rx.flatMap(rx.pipe(rx.fromIter(list(0)), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.flatMapActivePassive', {
  impl: dataTest({
    calculate: rx.pipe(
        rx.interval(1), rx.take(1),
        rx.flatMap(rx.pipe(rx.fromIter(list(0)), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.flatMapPassiveActive', {
  impl: dataTest({
    calculate: rx.pipe(
        rx.fromIter(list(0)),
        rx.flatMap(rx.pipe(rx.interval(1), rx.take(1), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.flatMapActiveActive', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.interval(1), rx.take(1),
          rx.flatMap(rx.pipe(rx.interval(1), rx.take(1), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('dataTest.callbag.mapPromiseActiveSource', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.interval(1),
          rx.take(1),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
        ),
    expectedResult: equals(2)
  })
})

jb.component('dataTest.callbag.rawMapPromiseTwice', {
  impl: dataTest({
    calculate: ctx => { const {fromIter,pipe,mapPromise,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), mapPromise(data =>jb.delay(1,data+2)), mapPromise(data =>jb.delay(1,data+2))))
    },    
    expectedResult: equals('4')
  })
})

jb.component('dataTest.callbag.mapPromiseTwice', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(0)),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
        ),
    expectedResult: equals('4')
  })
})

jb.component('dataTest.callbagConcatMapBug1', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.interval(1),
      rx.take(10),
      rx.concatMap(source.promise(({data}) => jb.delay(1,data+2))),
      rx.take('1')
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbagConcatMapOrderTiming', {
  impl: dataTest({
    timeout: 500,
    calculate: pipe(
      rx.pipe(
          rx.fromIter(list(1, 2, 3)),
          rx.var('inp'),
          rx.concatMap(
              rx.pipe(rx.interval(({data}) => data *10), rx.take(3), rx.map('%$inp%-%%'))
            )
        ),
      join(',')
    ),
    expectedResult: equals('1-0,1-1,1-2,2-0,2-1,2-2,3-0,3-1,3-2')
  })
})

jb.component('dataTest.callbagConcatMapWithInterval', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter(list(1)),
      rx.concatMap(rx.pipe(rx.interval(20), rx.take(1))),
    ),
    expectedResult: equals(0)
  })
})

jb.component('dataTest.concatMapCombine', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(rx.fromIter([1, 2]), rx.concatMap(rx.fromIter([30]), '%$input%-%%')),
      join(',')
    ),
    expectedResult: equals('1-30,2-30')
  })
})

jb.component('dataTest.callbagFlatMapCtx', {
  impl: dataTest({
    calculate: pipe(rx.pipe(
      rx.fromIter(list(1)),
      rx.var('inp'),
      rx.flatMap(rx.pipe(rx.fromIter(list(1)),rx.map('%$inp%'))),
    ), join(',')),
    expectedResult: equals('1')
  })
})

jb.component('dataTest.callbagFlatMapReturnArray', {
  impl: dataTest({
    calculate: pipe(rx.pipe(
      rx.fromIter(list('1,2,3')),
      rx.flatMap(ctx => ctx.data.split(',').map(x=>ctx.setData(x))),
    ), join(',')),
    expectedResult: equals('1,2,3')
  })
})

jb.component('dataTest.callbagToMany', {
  impl: dataTest({
    calculate: pipe(rx.pipe(rx.fromIter(list('1,2,3')), rx.flatMapArrays(split())), join(',')),
    expectedResult: equals('1,2,3')
  })
})

jb.component('dataTest.callbagFlatMapTiming', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.interval(1),
          rx.take(2),
          rx.var('inp'),
          rx.flatMap(rx.pipe(rx.interval(10), rx.take(2), rx.map('%$inp%-%%')))
        ),
      join(',')
    ),
    expectedResult: equals('0-0,1-0,0-1,1-1')
  })
})

jb.component('dataTest.callbagRawConcatMapBug1', {
  impl: dataTest({
    calculate: ctx => { const {interval,take,pipe,concatMap,fromPromise,toPromiseArray} = jb.callbag
      return pipe(interval(1),take(1), concatMap(data => fromPromise(jb.delay(1,data+2) )), toPromiseArray)
    },
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbagRawFlatMapBug1', {
  impl: dataTest({
    calculate: ctx => { const {interval,take,pipe,flatMap,fromPromise,toPromiseArray} = jb.callbag
      return pipe(interval(1),take(1), 
        flatMap(data => fromPromise(jb.delay(1,data+2) )), 
        flatMap(data => fromPromise(jb.delay(1,data+2) )),
        toPromiseArray)

    },
    expectedResult: equals(4)
  })
})

jb.component('dataTest.callbag.doPromiseActiveSource', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.interval(1),
      rx.take(1),
      rx.doPromise(({data})=>jb.delay(1,data *10)),
      rx.mapPromise(({data}) =>jb.delay(1,data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbag.subjectReplay', {
  impl: dataTest({
    vars: Var('subj', rx.subject(true)),
    calculate: source.subject('%$subj%'),
    runBefore: runActions(action.subjectNext('%$subj%', '1'), action.subjectComplete('%$subj%')),
    expectedResult: equals('1')
  })
})

jb.component('dataTest.callbag.promiseRejection', {
  impl: dataTest({
    calculate: rx.pipe(source.promise( () => new Promise((res,rej) => jb.delay(1,rej('err'))) ), rx.catchError(), rx.map('%%1') ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.callbag.promiseRejectionInDoPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([1]),
      rx.doPromise(() => new Promise((res,rej) => jb.delay(1,rej('err')))), 
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.callbag.throwInMapPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([2]),
      rx.mapPromise(() => jb.delay(1).then(() => { throw 'err' })), 
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.callbag.throwInMapPromise2', {
  impl: dataTest({
    vars: Var('$throw',true),
    calculate: rx.pipe(
      rx.fromIter([2]),
      rx.mapPromise(() => { throw 'err'}),
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.rx.throwError', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.fromIter([1, 2, 3, 4]),
          rx.throwError('%%==3', 'error'),
          rx.catchError()
        ),
      join(',')
    ),
    expectedResult: equals('1,2,error')
  })
})

jb.component('dataTest.rx.throwErrorInterval', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.interval(1),
          rx.take(10),
          rx.throwError('%%==3', 'error'),
          rx.catchError()
        ),
      join(',')
    ),
    expectedResult: equals('0,1,2,error')
  })
})

jb.component('dataTest.rx.retrySrc', {
  impl: dataTest({
    vars: [
      Var('counters', () => ({ counter: 0, retries: 0})),
      Var('interval', 3),
      Var('times', 10)
    ],
    calculate: rx.pipe(
      rx.fromIter([1, 2]),
      rx.var('inp'),
      rx.concatMap(
          rx.pipe(
            rx.interval('%$interval%'),
            rx.throwError('%%>%$times%', 'retry failed after %$times% times'),
            rx.map('%$inp%'),
            rx.map(
                ({data},{counters}) => {
          if (counters.counter > data) {
            counters.counter = 0
            return 'done'
          }
          counters.counter++
          counters.retries++
          return null // failed - will retry

        }
              ),
            rx.filter('%%'),
            rx.take(1)
          )
        )
    ),
    expectedResult: '%$counters/retries%==5'
  })
})

jb.component('dataTest.rx.retry', {
  impl: dataTest({
    vars: [Var('counters', () => ({ counter: 0, retries: 0}))],
    calculate: rx.pipe(
      rx.fromIter([1, 2]),
      rx.retry({
          interval: 10,
          operator: rx.map(
            ({data},{counters}) => {
              if (counters.counter > data) {
                counters.counter = 0
                return 'done'
              }
              counters.counter++
              counters.retries++
              return null // failed - will retry
            }
          ),
          onRetry: ({data},{inp}) => console.log(`retry ${inp}-${data}`)
        })
    ),
    expectedResult: '%$counters/retries%==5'
  })
})

jb.component('dataTest.rx.retryFailure', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([1]),
      rx.retry({operator: rx.map(()=>null), interval: 10, times: 3}),
      rx.catchError()
    ),
    expectedResult: '%%==retry failed after 30 mSec'
  })
})

jb.component('dataTest.rx.emptyVar', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([1]),
      rx.var(''),
    ),
    expectedResult: '%%==1'
  })
})

jb.component('test.paramedRxPipe', {
  type: 'rx',
  params: [
    {id: 'first', type: 'rx'},
    {id: 'last', type: 'rx'}
  ],
  impl: rx.pipe(
    '%$first%',
    '%$last%'
  )
})

jb.component('dataTest.rx.dynamicParam', {
  impl: dataTest({
    calculate: test.paramedRxPipe(
      rx.fromIter([1]),
      rx.map('a%%'),
    ),
    expectedResult: '%%==a1'
  })
})

jb.component('dataTest.rx.talkbackNotifier', {
  impl: dataTest({
    calculate: pipe(
      Var('log', () => ({ items: []})),
      rx.pipe(
          rx.fromIter([1, 2, 3]),
          (ctx,{log}) => jb.callbag.talkbackNotifier((t,d)=> log.items.push({t,d})),
          rx.take(1)
        ),
      pipeline('%$log/items/t%', join(','))
    ),
    expectedResult: '%%==1,1,2'
  })
})

jb.component('dataTest.rx.talkbackSrc', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.fromIter([1, 2, 3]),
          () => {
            const {talkbackSrc, pipe, interval, map, take} = jb.callbag
            return talkbackSrc(pipe(interval(1),take(3),map(()=>({t:1}))))
          }
        ),
      join(',')
    ),
    expectedResult: '%%==1,2,3'
  })
})

jb.component('dataTest.rx.snifferBug', {
  impl: dataTest({
    vars: [Var('a', () => ({ val: 1})) ],
    runBefore: rx.pipe(rx.fromIter([1]), rx.map('%%'), rx.subscribe({next: writeValue('%$a/val%', 2)})),
    calculate: '%$a/val%',
    expectedResult: '%%==2'
  })
})

jb.component('dataTest.rx.race', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.merge(
          rx.pipe(source.data('a'), rx.delay(40)),
          rx.pipe(source.data('b'), rx.delay(20))
        ),
      rx.take(1)
    ),
    expectedResult: '%%==b'
  })
})

jb.component('dataTest.rx.timeoutLimit', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter([1]),
          rx.delay(40),
          rx.timeoutLimit(10, 'timeout error'),
          rx.catchError(),
    ),
    expectedResult: '%%==timeout error'
  })
})

jb.component('dataTest.rx.timeoutLimit.notActivated', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter([1]),
          rx.delay(20),
          rx.timeoutLimit(100, 'timeout error'),
          rx.catchError(),
    ),
    expectedResult: '%%==1'
  })
})