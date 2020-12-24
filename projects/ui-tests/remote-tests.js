jb.ns('widget')
  
jb.component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(source.interval(1), remote.worker()),
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

jb.component('remoteTest.twoTierWidget.html', {
  impl: uiTest({
    timeout: 500,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: widget.twoTierWidget(html('<p>hello world<p>'), remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })),
    expectedResult: contains('<p>hello world')
  })
})

jb.component('remoteTest.twoTierWidget.changeText', {
  impl: uiTest({
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
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

jb.component('remoteTest.twoTierWidget.infiniteScroll', {
  impl: uiFrontEndTest({
    timeout: 1000,
    renderDOM: true,
    control: widget.twoTierWidget(
      itemlist({
        items: range(0,10),
        controls: text('%%'),
        visualSizeLimit: '7',
        features: [
          css.height({height: '100', overflow: 'scroll'}),
          itemlist.infiniteScroll(),
          css.width('600')
        ]
      }),
      remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })
    ),
    action: rx.pipe( 
      source.waitForSelector('.jb-itemlist'),
      rx.do(uiAction.scrollBy('.jb-itemlist',100)),
      rx.delay(200),
    ),
    expectedResult: contains('>8<')
  })
})

jb.component('remoteTest.twoTierWidget.infiniteScroll.MDInplace', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: widget.twoTierWidget(group({
      controls: itemlist({
        items: '%$people%',
        visualSizeLimit: 2,
        controls: [
          group({
            controls: [
              editableBoolean({databind: '%$sectionExpanded/{%$index%}%', style: editableBoolean.expandCollapse()}),
              text('%name%'),
            ],
            layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'})
          }),
          controlWithCondition('%$sectionExpanded/{%$index%}%', group({ 
            controls: text('inner text'), 
            features: feature.expandToEndOfRow('%$sectionExpanded/{%$index%}%')
          })),
          text('%age%'),
          text('%age%')
        ],
        style: table.plain(),
        features: [
          table.expandToEndOfRow(),
          watchRef({ref: '%$sectionExpanded%', includeChildren: 'yes' , allowSelfRefresh: true }),
          css.height({height: '40', overflow: 'scroll'}),
          itemlist.infiniteScroll(2),  
        ]
      }),
      features: variable({name: 'sectionExpanded', watchable: true, value: obj() }),
    }),
    remote.worker({id: 'ui-with-samples', libs: ['common','ui-common','remote','two-tier-widget','../projects/ui-tests/test-data-samples'] })
    ),
    action: rx.pipe( 
      source.waitForSelector('.jb-itemlist'),
      rx.do(uiAction.scrollBy('.jb-itemlist',100)),
      rx.do(uiAction.click('i','toggle')),
      rx.delay(200),
    ),
    expectedResult: and(contains(['colspan="','inner text','Bart']),not(contains('>42<')), not(contains(['inner text','inner text'])))
  })
})

// jb.component('remoteTest.twoTierWidget.recoverAfterError', {
//   impl: uiTest({
//     timeout: 3000,
//     control: widget.twoTierWidget( 
//       button({ title: 'generate delta error %$recover%',
//         style: button.native(),
//         action: ({},{widgetId}) => 
//           jb.ui.renderingUpdates.next({widgetId, delta: { }, cmpId: 'wrongId'})
//       }), 
//       remote.worker({id: 'ui', libs: ['common','ui-common','remote','two-tier-widget'] })
//     ),
//     userInputRx: rx.pipe(
//       source.waitForSelector('button'),
//       rx.map(userInput.click('button')),
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('delta error true')
//   })
// })