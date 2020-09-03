jb.ns('widget')
  
jb.component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(source.interval(1), remote.worker()),
            rx.take(2),
            rx.map('-%%-'),
            rx.log('tst'),
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
      rx.pipe(source.remote(source.data([1, 2, 3]), remote.worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.operator', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(
         rx.pipe(
            source.data([1,2,3]),
            remote.operator(rx.take(2), remote.worker()),
            rx.map('-%%-')
      ), join(',')),
      expectedResult: equals('-1-,-2-')
    })
})

// jb.component('remoteTest.sampleObject', {
//   params: [
//     {id: 'val', as: 'number' }
//   ],
//   impl: (ctx,val) => {
//       class tst {
//           constructor(d) { this.d = val}
//           m1() { return this.d}
//       }
//       return new tst(val)
//   }
// })

// jb.component('remoteTest.remoteObjectWithMethods', {
//   impl: dataTest({
//     timeout: 5000,
//     calculate: rx.pipe(
//       source.data(1),
//       remote.operator(rx.map(remoteTest.sampleObject(5)), remote.worker()),
//       remote.operator(rx.map('%m1()%'), remote.worker()),
//       rx.take(1)
//     ),
//     expectedResult: equals(5)
//   })
// })

jb.component('remoteTest.remoteParam', {
  params: [
    { id: 'retVal', defaultValue: 5},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          remote.operator(rx.map('%$retVal%'), remote.worker()),
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
          source.data(1),
          remote.operator(rx.map('%$func()%'), remote.worker()),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

// jb.component('remoteTest.dynamicJsFunc', {
//   params: [
//     { id: 'func', dynamic: true, defaultValue: ({data}) => `-${data}-`},
//   ],
//   impl: dataTest({
//     timeout: 5000,
//       calculate: rx.pipe(
//           source.data(1),
//           remote.operator(rx.map('%$func()%'), remote.worker()),
//           rx.take(1)
//     ),
//     expectedResult: equals('-1-')
//   })
// })

jb.component('remoteTest.twoTierWidget.button', {
  impl: uiTest({
    timeout: 500,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: widget.twoTierWidget(button('hello world'), remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteTest.twoTierWidget.changeText', {
  impl: uiTest({
    timeout: 2000,
    control: widget.twoTierWidget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind:'%$fName%'})
        ],
        features: variable({name: 'fName', value: 'Dan', watchable: true})
      }),
      remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })
    ),
    userInputRx: rx.pipe(
      source.waitForSelector('input'),
      rx.map(userInput.setText('danny')),
      rx.log('userInputRx'),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

jb.component('remoteTest.twoTierWidget.infiniteScroll', {
  impl: uiFrontEndTest({
    timeout: 1000,
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
    }),
    remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })),
    action: rx.pipe( source.waitForSelector('.jb-itemlist'), sink.action(uiAction.scrollBy('.jb-itemlist',100))),
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

