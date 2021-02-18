var { rxTest} = jb.ns('rxTest')

jb.component('rxTest.pipeWithObservable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.callbag.fromIter([1,2]), '%%a', join({})),
    expectedResult: equals('1a,2a')
  })
})
  
jb.component('rxTest.mapPromise', {
  impl: dataTest({
    calculate: rx.pipe(
          source.data(0),
          rx.mapPromise(({data}) =>jb.delay(1,data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('rxTest.doPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(1),
      rx.doPromise( ({data}) =>jb.delay(1,data *10)),
      rx.mapPromise(({data}) =>jb.delay(1,data+2)),
    ),
    expectedResult: equals('3')
  })
})

jb.component('rxTest.pipe', {
  impl: dataTest({
    calculate: pipe(rx.pipe( source.data(list('1','2','3','4')),rx.map('-%%-')),join(',')),    
    expectedResult: equals('-1-,-2-,-3-,-4-')
  })
})

jb.component('rxTest.source.watchableData', {
  impl: dataTest({
    runBefore: () => {jb.exec(runActions(delay(1),writeValue('%$person/name%','Dan')))}, // activate writeValue after 'calculate'
    calculate: pipe(rx.pipe(
          source.watchableData('%$person/name%'),
          rx.map('%newVal%'),
          rx.take(1)
    ),join(',')),
    expectedResult: equals('Dan')
  })
})

jb.component('rxTest.toArray', {
  impl: dataTest({
    calculate: rx.pipe( source.data(list(0,1,2,3)),rx.toArray(),rx.map(join())),    
    expectedResult: equals('0,1,2,3')
  })
})

jb.component('rxTest.distinctUntilChanged', {
  impl: dataTest({
    calculate: rx.pipe( 
      source.data(list(1,2,2,3)),
      rx.distinctUntilChanged(),
      rx.toArray(), rx.map(join())
    ),    
    expectedResult: equals('1,2,3')
  })
})

jb.component('rxTest.enrichWithPrevious', {
  impl: dataTest({
    calculate: rx.pipe( source.data(list(1,2,3,2)),
      rx.reduce({
        varName: 'upDown',
        value: ({data},{upDown,prev}) => {
          const dir = prev && prev < data ? 'up' : 'down'
          return {dir, count: (upDown.dir == dir) ? upDown.count+1 : 1}
        },
        initialValue: obj(prop('count',0),prop('dir',''))
      }),
      rx.skip(1),
      rx.map('%$upDown/dir%-%$upDown/count%'),
      rx.toArray(), rx.map(join())
    ),    
    expectedResult: equals('up-1,up-2,down-1')
  })
})

jb.component('rxTest.toArray.empty', {
  impl: dataTest({
    calculate: rx.pipe( source.data(list()),rx.toArray(),rx.map(({data}) => data.join(','))),    
    expectedResult: equals([])
  })
})

jb.component('rxTest.toArray.active', {
  impl: dataTest({
    calculate: rx.pipe( source.interval(1), rx.take(4),rx.log('test 1'),rx.toArray(),rx.log('test 2'),rx.map(({data}) => data.join(','))),    
    expectedResult: equals('0,1,2,3')
  })
})

jb.component('rxTest.pipeInsidePipeWithConcatMap', {
  impl: dataTest({
    calculate: () => {
      const {pipe,fromIter, map, concatMap, toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([1,2]), concatMap(x => pipe(fromIter([x]), map(x=>`-${x}-`))))).then(ar=>ar.join(','))
    },
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('rxTest.rawPipeInsidePipe', {
  impl: dataTest({
    calculate: () => {
      const {pipe,fromIter, map, toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([1,2]), x => pipe(x, map(x=>`-${x}-`)))).then(ar=>ar.join(','))
    },
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('rxTest.TakeWhile', {
  impl: dataTest({
    calculate: pipe(rx.pipe(source.interval(1), rx.takeWhile('%%<2')), join(',')),
    expectedResult: equals('0,1')
  })
})

jb.component('rxTest.ActionPulls', {
  impl: dataTest({
    vars: Var('out',obj()),
    runBefore: rx.pipe(source.data(1), rx.map('%%'), sink.data('%$out/x%')),
    calculate: '%$out/x%',
    expectedResult: equals('1')
  })
})

jb.component('rxTest.TakeWhileIter', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
        source.data([0,1,2,3]),
        rx.takeWhile('%%<2')
      ),
      join(',')
    ),
    expectedResult: equals('0,1')
  })
})


jb.component('rxTest.innerPipe', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          source.interval(1),
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

jb.component('rxTest.interval', {
  impl: dataTest({
    calculate: pipe(rx.pipe(source.interval(1), rx.take('4'), rx.map('-%%-')), join(',')),
    expectedResult: equals('-0-,-1-,-2-,-3-')
  })
})

jb.component('rxTest.var', {
  impl: dataTest({
    vars: [Var('a', 'hello')],
    calculate: pipe(
      rx.pipe(
          source.interval(1),
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

jb.component('rxTest.reduceCount', {
  impl: dataTest({
    calculate: rx.pipe(source.interval(1),rx.take('4'),rx.count(),rx.map('%$count%'),rx.last() ),
    expectedResult: equals(4)
  })
})

jb.component('rxTest.reduceMax', {
  impl: dataTest({
    calculate: rx.pipe(source.interval(1),rx.take('4'),rx.max(),rx.map('%$max%'),rx.last()),
    expectedResult: equals(3)
  })
})

jb.component('rxTest.reduceJoin', {
  impl: dataTest({
    calculate: rx.pipe(
      source.interval(1),
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

jb.component('rxTest.rawFlatMapPassivePassive', {
  impl: dataTest({
    calculate: ctx => { const {flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), flatMap(x=> pipe(fromIter([0]),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.rawflatMapPassiveActive', {
  impl: dataTest({
    calculate: () => { const {interval, take,flatMap,fromIter,pipe,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), flatMap(()=> pipe(interval(1), take(2)) ))).then(x=>x.join(','))
    },
    expectedResult: equals('0,1')
  })
})

jb.component('rxTest.rawConcatMapPassiveActive', {
  impl: dataTest({
    calculate: () => { const {interval, take,concatMap,fromPromise,pipe,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromPromise(()=>jb.delay(1)), concatMap(()=> pipe(interval(1), take(2)) ))).then(x=>x.join(','))
    },
    expectedResult: equals('0,1')
  })
})

jb.component('rxTest.rawflatMapActivePassive', {
  impl: dataTest({
    calculate: ctx => { const {interval, take,flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(interval(1), take(1), flatMap(x=> pipe(fromIter([0]),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.rawflatMapActiveActive', {
  impl: dataTest({
    calculate: ctx => { const {interval, take,flatMap,fromIter,pipe,map,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(interval(1), take(1), flatMap(x=> pipe(interval(1), take(1),map(x=>`-${x}-`) ) )))
    },
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.flatMapPassivePassive', {
  impl: dataTest({
    calculate: rx.pipe(
          source.data(0),
          rx.flatMap(rx.pipe(source.data(0), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.flatMapActivePassive', {
  impl: dataTest({
    calculate: rx.pipe(
        source.interval(1), rx.take(1),
        rx.flatMap(rx.pipe(source.data(0), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.flatMapPassiveActive', {
  impl: dataTest({
    calculate: rx.pipe(
        source.data(0),
        rx.flatMap(rx.pipe(source.interval(1), rx.take(1), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.flatMapActiveActive', {
  impl: dataTest({
    calculate: rx.pipe(
          source.interval(1), rx.take(1),
          rx.flatMap(rx.pipe(source.interval(1), rx.take(1), rx.map('-%%-'))),
    ),
    expectedResult: equals('-0-')
  })
})

jb.component('rxTest.mapPromiseActiveSource', {
  impl: dataTest({
    calculate: rx.pipe(
          source.interval(1),
          rx.take(1),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
        ),
    expectedResult: equals(2)
  })
})

jb.component('rxTest.rawMapPromiseTwice', {
  impl: dataTest({
    calculate: ctx => { const {fromIter,pipe,mapPromise,toPromiseArray} = jb.callbag
      return toPromiseArray(pipe(fromIter([0]), mapPromise(data =>jb.delay(1,data+2)), mapPromise(data =>jb.delay(1,data+2))))
    },    
    expectedResult: equals('4')
  })
})

jb.component('rxTest.mapPromiseTwice', {
  impl: dataTest({
    calculate: rx.pipe(
          source.data(0),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
          rx.mapPromise(({data}) =>jb.delay(1,data+2)),
        ),
    expectedResult: equals('4')
  })
})

jb.component('rxTest.concatMapBug1', {
  impl: dataTest({
    calculate: rx.pipe(
      source.interval(1),
      rx.take(10),
      rx.concatMap(source.promise(({data}) => jb.delay(1,data+2))),
      rx.take('1')
    ),
    expectedResult: equals('2')
  })
})

jb.component('rxTest.concatMapOrderTiming', {
  impl: dataTest({
    timeout: 500,
    calculate: pipe(
      rx.pipe(
          source.data(list(1, 2, 3)),
          rx.var('inp'),
          rx.concatMap(
              rx.pipe(source.interval(({data}) => data *10), rx.take(3), rx.map('%$inp%-%%'))
            )
        ),
      join(',')
    ),
    expectedResult: equals('1-0,1-1,1-2,2-0,2-1,2-2,3-0,3-1,3-2')
  })
})

jb.component('rxTest.concatMapWithInterval', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(1),
      rx.concatMap(rx.pipe(source.interval(20), rx.take(1))),
    ),
    expectedResult: equals(0)
  })
})

jb.component('rxTest.concatMapCombine', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(source.data([1, 2]), rx.concatMap(source.data(30), '%$input%-%%')),
      join(',')
    ),
    expectedResult: equals('1-30,2-30')
  })
})

jb.component('rxTest.flatMapCtx', {
  impl: dataTest({
    calculate: pipe(rx.pipe(
      source.data('a'),
      rx.var('inp'),
      rx.flatMap(rx.pipe(source.data('%%'),rx.map('%%-%$inp%'))),
    ), join(',')),
    expectedResult: equals('a-a')
  })
})

jb.component('rxTest.flatMapReturnArray', {
  impl: dataTest({
    calculate: pipe(rx.pipe(
      source.data('1,2,3'),
      rx.flatMap(source.data(split(','))),
    ), join(',')),
    expectedResult: equals('1,2,3')
  })
})

jb.component('rxTest.flatMapArrays', {
  impl: dataTest({
    calculate: pipe(rx.pipe(source.data(list('1,2,3')), rx.flatMapArrays(split())), join(',')),
    expectedResult: equals('1,2,3')
  })
})

jb.component('rxTest.FlatMapTiming', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          source.interval(1),
          rx.take(2),
          rx.var('inp'),
          rx.flatMap(rx.pipe(source.interval(10), rx.take(2), rx.map('%$inp%-%%')))
        ),
      join(',')
    ),
    expectedResult: equals('0-0,1-0,0-1,1-1')
  })
})

jb.component('rxTest.RawConcatMapBug1', {
  impl: dataTest({
    calculate: ctx => { const {interval,take,pipe,concatMap,fromPromise,toPromiseArray} = jb.callbag
      return pipe(interval(1),take(1), concatMap(data => fromPromise(jb.delay(1,data+2) )), toPromiseArray)
    },
    expectedResult: equals('2')
  })
})

jb.component('rxTest.RawFlatMapBug1', {
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

jb.component('rxTest.doPromiseActiveSource', {
  impl: dataTest({
    calculate: rx.pipe(
      source.interval(1),
      rx.take(1),
      rx.doPromise(({data})=>jb.delay(1,data *10)),
      rx.mapPromise(({data}) =>jb.delay(1,data+2))
    ),
    expectedResult: equals('2')
  })
})

jb.component('rxTest.subjectReplay', {
  impl: dataTest({
    vars: Var('subj', rx.subject(true)),
    calculate: source.subject('%$subj%'),
    runBefore: runActions(action.subjectNext('%$subj%', '1'), action.subjectComplete('%$subj%')),
    expectedResult: equals('1')
  })
})

jb.component('rxTest.throwPromiseRejection', {
  impl: dataTest({
    calculate: rx.pipe(source.promise( () => new Promise((res,rej) => jb.delay(1,rej('err'))) ), rx.catchError(), rx.map('%%1') ),
    expectedResult: equals('err1')
  })
})

jb.component('rxTest.throwPromiseRejectionInDoPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(1),
      rx.doPromise(() => new Promise((res,rej) => jb.delay(1,rej('err')))), 
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('rxTest.throwInMapPromise', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(2),
      rx.mapPromise(() => jb.delay(1).then(() => { throw 'err' })), 
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('rxTest.throwInMapPromise2', {
  impl: dataTest({
    vars: Var('$throw',true),
    calculate: rx.pipe(
      source.data(2),
      rx.mapPromise(() => { throw 'err'}),
      rx.catchError(), rx.map('%%1')
    ),
    expectedResult: equals('err1')
  })
})

jb.component('rxTest.rx.throwError', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          source.data([1, 2, 3, 4]),
          rx.throwError('%%==3', 'error'),
          rx.catchError()
        ),
      join(',')
    ),
    expectedResult: equals('1,2,error')
  })
})

jb.component('rxTest.throwErrorInterval', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          source.interval(1),
          rx.take(10),
          rx.throwError('%%==3', 'error'),
          rx.catchError()
        ),
      join(',')
    ),
    expectedResult: equals('0,1,2,error')
  })
})

jb.component('rxTest.retrySrc', {
  impl: dataTest({
    vars: [
      Var('counters', () => ({ counter: 0, retries: 0})),
      Var('interval', 3),
      Var('times', 10)
    ],
    calculate: rx.pipe(
      source.data([1, 2]),
      rx.var('inp'),
      rx.concatMap(
          rx.pipe(
            source.interval('%$interval%'),
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

jb.component('rxTest.emptyVar', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(1),
      rx.var(''),
    ),
    expectedResult: '%%==1'
  })
})

jb.component('rxTest.paramedRxPipe', {
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

jb.component('rxTest.dynamicParam', {
  impl: dataTest({
    calculate: rxTest.paramedRxPipe(
      source.data(1),
      rx.map('a%%'),
    ),
    expectedResult: '%%==a1'
  })
})

jb.component('rxTest.snifferBug', {
  impl: dataTest({
    vars: Var('a', () => ({ val: 1})),
    runBefore: rx.pipe(source.data(1), rx.map('2'), sink.data('%$a/val%', 2)),
    calculate: '%$a/val%',
    expectedResult: '%%==2'
  })
})

jb.component('rxTest.race', {
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

jb.component('rxTest.timeoutLimit', {
  impl: dataTest({
    calculate: rx.pipe(
          source.data(1),
          rx.delay(40),
          rx.timeoutLimit(10, 'timeout error'),
          rx.catchError(),
    ),
    expectedResult: '%%==timeout error'
  })
})

jb.component('rxTest.timeoutLimit.notActivated', {
  impl: dataTest({
    calculate: rx.pipe(
          source.data(1),
          rx.delay(20),
          rx.timeoutLimit(100, 'timeout error'),
          rx.catchError(),
    ),
    expectedResult: '%%==1'
  })
})