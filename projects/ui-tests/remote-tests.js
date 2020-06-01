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
      calculate: pipe(rx.pipe(
          remote.sourceRx(rx.fromIter([1,2,3])),
          rx.take(2),
          rx.map('-%%-')
    ), join(',')),
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
