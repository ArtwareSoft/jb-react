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
          rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbag.doPromise', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(1)),
          rx.doPromise(({data})=> jb.delay(1).then(()=>data *10)),
          rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2)),
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

jb.component('dataTest.callbag.sniffer', {
  impl: dataTest({
    calculate: pipe(
      ctx => {
          const {subject, pipe, sniffer, fromIter, map, subscribe, toPromiseArray } = jb.callbag
          const mySniffer = subject()
          const ret = toPromiseArray(mySniffer)
          pipe(fromIter([1,2]), sniffer(map(x=>x*10), mySniffer), subscribe(() => {}))
          return ret

      },
      '%dir% %d%',
      join({separator: ',', itemText: trim()})
    ),
    expectedResult: equals('in 1,out 10,in 2,out 20')
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
          rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2)),
        ),
    expectedResult: equals(2)
  })
})

jb.component('dataTest.callbag.rawMapPromiseTwice', {
  impl: dataTest({
    calculate: ctx => { const {fromIter,pipe,mapPromise,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), mapPromise(data =>jb.delay(1).then(()=> data+2)), mapPromise(data =>jb.delay(1).then(()=> data+2))))
    },    
    expectedResult: equals('4')
  })
})

jb.component('dataTest.callbag.mapPromiseTwice', {
  impl: dataTest({
    calculate: rx.pipe(
          rx.fromIter(list(0)),
          rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2)),
          rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2)),
        ),
    expectedResult: equals('4')
  })
})

jb.component('dataTest.callbagConcatMapBug1', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.interval(1),
      rx.take(10),
      rx.concatMap(rx.fromPromise(({data}) => jb.delay(1).then(()=> data+2))),
      rx.take('1')
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbagConcatMapOrderTiming', {
  impl: dataTest({
    calculate: pipe(rx.pipe(
      rx.fromIter(list(1,2,3)),
      rx.var('inp'),
      rx.concatMap(rx.pipe(rx.interval(({data}) => data *20), rx.take(3), rx.map('%$inp%-%%') )),
    ), join(',')),
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
          rx.interval('20'),
          rx.take('3'),
          rx.var('inp'),
          rx.flatMap(rx.pipe(rx.interval(200), rx.take(3), rx.map('%$inp%-%%')))
        ),
      join(',')
    ),
    expectedResult: equals('0-0,1-0,2-0,0-1,1-1,2-1,0-2,1-2,2-2')
  })
})

jb.component('dataTest.callbagRawConcatMapBug1', {
  impl: dataTest({
    calculate: ctx => { const {interval,take,pipe,concatMap,fromPromise,toPromiseArray} = jb.callbag
      return pipe(interval(1),take(1), concatMap(data => fromPromise(jb.delay(1).then(()=> data+2) ), toPromiseArray))
    },
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbagRawFlatMapBug1', {
  impl: dataTest({
    calculate: ctx => { const {interval,take,pipe,flatMap,fromPromise,toPromiseArray} = jb.callbag
      return pipe(interval(1),take(1), 
        flatMap(data => fromPromise(jb.delay(100).then(()=> data+2) ),null,'first'), 
        flatMap(data => fromPromise(jb.delay(100).then(()=> data+2) ),null,'second'),
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
      rx.doPromise(({data})=>jb.delay(1).then(()=>data *10)),
      rx.mapPromise(({data}) =>jb.delay(1).then(()=> data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('dataTest.callbag.subjectReplay', {
  impl: dataTest({
    vars: [Var('subj', rx.subject(true))],
    calculate: pipe(rx.pipe(rx.fromSubject('%$subj%'))),
    runBefore: runActions(rx.subjectNext('%$subj%', '1'), rx.subjectComplete('%$subj%')),
    expectedResult: equals('1')
  })
})

jb.component('dataTest.callbag.promiseRejection', {
  impl: dataTest({
    calculate: rx.pipe(rx.fromPromise( () => new Promise((res,rej) => jb.delay(1).then(()=>rej('err'))) ), rx.catchError('%%1') ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.callbag.promiseRejectionInDoPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([1]),
      rx.doPromise(() => new Promise((res,rej) => jb.delay(1).then(()=>rej('err')))), 
      rx.catchError('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('dataTest.callbag.throwInMapPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([2]),
      rx.mapPromise(() => jb.delay(1).then(() => { throw 'err' })), 
      rx.catchError('%%1')
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
      rx.catchError('%%1')
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
          rx.catchError('%%')
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
          rx.catchError('%%')
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
      Var('interval', 300),
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
          )
        })
    ),
    expectedResult: '%$counters/retries%==5'
  })
})

