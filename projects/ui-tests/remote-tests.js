jb.ns('widget2tier')

jb.component('uiTest.widget2tier.button', {
  impl: uiTest({
    control: widget2tier.local(button('hello world')),
    expectedResult: contains('hello world')
  })
})

jb.component('uiTest.widget2tier.infiniteScroll', {
  impl: uiTest({
    control: widget2tier.local(itemlist({
      items: range(0,10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        css.height({height: '100', overflow: 'scroll'}),
        itemlist.infiniteScroll(),
        css.width('600')
      ]
    })),
    expectedResult: contains('hello world')
  })
})

jb.component('uiTest.remoteWidget', {
  impl: uiTest({
    control: remote.widget('uiTest.helloFromWorker'),
    runBefore: remote.initMainWorker(
      ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
    ),
    action: delay(20),
    expectedResult: contains('hello from worker')
  })
})
  
jb.component('uiTest.remoteWidgetEditableText', {
    impl: uiTest({
        control: remote.widget('uiTest.remoteEditableCtrl'),
        runBefore: remote.initMainWorker(
        ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
        ),
        action: [delay(40), ctx => ctx.run(uiAction.setText('hello', '#inp')),delay(40)],
        expectedResult: contains(['<span', 'hello', '</span'])
    })
})
  
jb.component('uiTest.remoteWidgetEmptyEditableText', {
    impl: uiTest({
      control: remote.widget('uiTest.remoteEditableCtrl'),
      runBefore: remote.initMainWorker(
        ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
      ),
      action: [delay(40), ctx => ctx.run(uiAction.setText('', '#inp')), delay(20)],
      expectedResult: and(not(contains('undefined')), not(contains('Homer')))
    })
})
  
jb.component('uiTest.remoteWidgetInfiniteScroll', {
    impl: uiTest({
      control: remote.widget('uiTest.remoteInfiniteScroll'),
      runBefore: remote.initMainWorker(
        () => `http://${location.host}/projects/ui-tests/remote-widgets.js`
      ),
      action: [delay(40), uiAction.scrollDown('.jb-itemlist'), delay(20)],
      expectedResult: contains('>8<')
    })
})

jb.component('uiTest.remoteRx', {
    impl: uiTest({
      control: remote.widget('uiTest.remoteInfiniteScroll'),
      runBefore: remote.initMainWorker(
        () => `http://${location.host}/projects/ui-tests/remote-widgets.js`
      ),
      action: [delay(40), uiAction.scrollDown('.jb-itemlist'), delay(20)],
      expectedResult: contains('>8<')
    })
})

jb.component('dataTest.remote.sourceNoTalkback', {
    impl: dataTest({
        calculate: pipe(rx.pipe(
            remote.sourceRx(rx.interval(10)),
            rx.take(2),
            rx.map('-%%-')
      ), join(',')),
      expectedResult: equals('-0-,-1-')
    })
})

jb.component('dataTest.remote.sourceRx', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(remote.sourceRx(rx.fromIter([1, 2, 3])), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('dataTest.remote.innerRx', {
    impl: dataTest({
        calculate: pipe(
          rx.pipe(
            rx.fromIter([1,2,3]),
            remote.innerRx(rx.take(2)),
            rx.map('-%%-')
      ), join(',')),
      expectedResult: equals('-1-,-2-')
    })
})

jb.component('dataTest.remote.remoteObject', {
  impl: dataTest({
    calculate: rx.pipe(
      rx.fromIter([1]),
      remote.innerRx(rx.map(ctx => jb.remote.createSampleObject(5))),
      remote.innerRx(rx.map(({data}) => { return data.m1() })),
      rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('dataTest.remote.remoteParam', {
  params: [
    { id: 'retVal', defaultValue: 5},
  ],
  impl: dataTest({
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map( (ctx,{},{retVal}) => { debugger ; return jb.remote.createSampleObject(retVal) })),
          remote.innerRx(rx.map( ({data}) => data.m1() )),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('dataTest.remoteDynamicProfileFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: '-%%-'},
  ],
  impl: dataTest({
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map('%$func()%')),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

jb.component('dataTest.remoteDynamicJsFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: ({data}) => `-${data}-`},
  ],
  impl: dataTest({
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map('%$func()%')),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})
