jb.component('dataTest.pipeWithObservable', {
  impl: dataTest({
    calculate: pipe(ctx => jb.callbag.fromIter([1,2]), '%%a', join()),
    expectedResult: equals('1a,2a')
  })
})
  
jb.component('dataTest.callbag.mapPromise', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
          rx.fromIter(list(1)),
          () => jb.callbag.map(x=>jb.delay(1).then(()=>x))
        ),
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