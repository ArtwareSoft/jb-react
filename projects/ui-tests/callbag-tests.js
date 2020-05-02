jb.component('dataTest.pipeWithObservable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.callbag.fromIter([1,2]), '%%a', join()),
    expectedResult: equals('1a,2a')
  })
})
  
jb.component('dataTest.callbag.mapPromise', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(rx.fromIter(list(1)) ,() => jb.callbag.mapPromise(x=>jb.delay(1).then(()=>x))),
      '%%a'
    ),
    expectedResult: equals('1a')
  })
})
  
jb.component('dataTest.callbag.pipe', {
  impl: dataTest({
    calculate: pipe(rx.pipe( rx.fromIter(list('1','2','3','4')),rx.map('-%%-')),join(',')),    
    expectedResult: equals('-1-,-2-,-3-,-4-')
  })
})

jb.component('dataTest.callbag.interval', {
  impl: dataTest({
    calculate: pipe(rx.pipe(rx.interval(100), rx.take(4), rx.map('-%%-')), join(',')),
    expectedResult: equals('-0-,-1-,-2-,-3-')
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