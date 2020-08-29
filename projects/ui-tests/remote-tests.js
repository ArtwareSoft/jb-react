jb.ns('widget')
  
jb.component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(rx.interval(500), remote.worker()),
            rx.take(2),
            rx.map('-%%-'),
      ), join(',')),
      expectedResult: equals('-0-,-1-')
    })
})

jb.component('remoteTest.remote', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3])), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.remoteWorker', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(rx.fromIter([1, 2, 3]), remote.worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.innerRx', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(
         rx.pipe(
            rx.fromIter([1,2,3]),
            remote.innerRx(rx.take(2)),
            rx.map('-%%-')
      ), join(',')),
      expectedResult: equals('-1-,-2-')
    })
})

jb.component('remoteTest.remoteObject', {
  impl: dataTest({
    timeout: 5000,
    calculate: rx.pipe(
      rx.fromIter([1]),
      remote.innerRx(rx.map(ctx => jb.remote.createSampleObject(5))),
      remote.innerRx(rx.map('%m1()%')),
      rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('remoteTest.remoteParam', {
  params: [
    { id: 'retVal', defaultValue: 5},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map( (ctx,{},{retVal}) => { debugger ; return jb.remote.createSampleObject(retVal) })),
          remote.innerRx(rx.map('%m1()%')),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('remoteTest.dynamicProfileFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: '-%%-'},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map('%$func()%')),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

jb.component('remoteTest.dynamicJsFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: ({data}) => `-${data}-`},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          rx.fromIter([1]),
          remote.innerRx(rx.map('%$func()%')),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

jb.component('remoteTest.twoTierWidget.button.local', {
  impl: uiFrontEndTest({
    control: widget.twoTierWidget(button('hello world')),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteTest.twoTierWidget.changeText.local', {
  impl: uiFrontEndTest({
    control: widget.twoTierWidget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind:'%$fName%'})
        ],
        features: variable({name: 'fName', value: 'Dan', watchable: true})
      })
    ),
    action: uiAction.setText('danny'),
    expectedResult: contains('danny')
  })
})

jb.component('remoteTest.twoTierWidget.infiniteScroll.local', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: widget.twoTierWidget(itemlist({
      items: range(0,10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        css.height({height: '100', overflow: 'scroll'}),
        itemlist.infiniteScroll(),
        css.width('600')
      ]
    })),
    action: uiAction.scrollBy('.jb-itemlist',100),
    expectedResult: contains('>8<')
  })
})

// jb.component('uiTest.remoteWidget', {
//   impl: uiTest({
//     control: remote.widget('uiTest.helloFromWorker'),
//     runBefore: remote.initMainWorker(
//       ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
//     ),
//     action: delay(20),
//     expectedResult: contains('hello from worker')
//   })
// })
  
// jb.component('uiTest.remoteWidgetEditableText', {
//     impl: uiTest({
//         control: remote.widget('uiTest.remoteEditableCtrl'),
//         runBefore: remote.initMainWorker(
//         ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
//         ),
//         action: [delay(40), ctx => ctx.run(userInput.setText('hello', '#inp')),delay(40)],
//         expectedResult: contains(['<span', 'hello', '</span'])
//     })
// })
  
// jb.component('uiTest.remoteWidgetEmptyEditableText', {
//     impl: uiTest({
//       control: remote.widget('uiTest.remoteEditableCtrl'),
//       runBefore: remote.initMainWorker(
//         ctx => `http://${location.host}/projects/ui-tests/remote-widgets.js`
//       ),
//       action: [delay(40), ctx => ctx.run(userInput.setText('', '#inp')), delay(20)],
//       expectedResult: and(not(contains('undefined')), not(contains('Homer')))
//     })
// })
  
// jb.component('uiTest.remoteWidgetInfiniteScroll', {
//     impl: uiTest({
//       control: remote.widget('uiTest.remoteInfiniteScroll'),
//       runBefore: remote.initMainWorker(
//         () => `http://${location.host}/projects/ui-tests/remote-widgets.js`
//       ),
//       action: [delay(40), userInput.scrollDown('.jb-itemlist'), delay(20)],
//       expectedResult: contains('>8<')
//     })
// })

// jb.component('uiTest.remoteRx', {
//     impl: uiTest({
//       control: remote.widget('uiTest.remoteInfiniteScroll'),
//       runBefore: remote.initMainWorker(
//         () => `http://${location.host}/projects/ui-tests/remote-widgets.js`
//       ),
//       action: [delay(40), userInput.scrollDown('.jb-itemlist'), delay(20)],
//       expectedResult: contains('>8<')
//     })
// })

