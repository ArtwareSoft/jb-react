var { remoteTest} = jb.ns('remoteTest,widget')

jb.component('remoteTest.childJbm', {
    impl: dataTest({
      timeout: 1000,
      calculate: pipe(
        jbm.child('tst'), 
        remote.data('hello','%%')
      ),
      expectedResult: equals('hello')
    })
})

jb.component('remoteTest.childWorker', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      jbm.worker(), 
      remote.data('hello','%%')
    ),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', jbm.worker())),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.remote.action', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      remote.action(() => jb.db.passive('w','hello'), jbm.worker()),
      remote.data('%$w%', jbm.worker()),
    ),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.childJbmPort', {
  impl: dataTest({
    timeout: 5000,
    runBefore: pipe(
      jbm.worker(), 
      remote.action(jbm.child('inner'),'%%')
    ),
    calculate: remote.data('hello',jbm.byUri('tests•innerWorker•inner')),
    expectedResult: 'hello'
  })
})

jb.component('remoteTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.action(jbm.child('inWorker'), jbm.worker()),
    calculate: pipe(net.listSubJbms(), join(',')),
    expectedResult: contains(['tests•w1','tests•w1•inWorker'])
  })
})

jb.component('remoteTest.jbm.byUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('tst'),
    calculate: remote.data('hello', jbm.byUri('tests•tst')),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.workerByUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.worker(),
    calculate: rx.pipe(
      source.data('hello'),
      remote.operator(rx.map('%% world'), jbm.byUri('tests•w1'))
    ),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.workerToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker(), jbm.worker('w2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests•w2'))
      ), jbm.byUri('tests•w1')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.networkToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker('w2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests•w2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.networkGateway', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker({id: 'peer2', networkPeer: true})),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('peer2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.shadowData', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(
      remote.action(addComponent({id: 'person', value: obj(), type: 'watchableData' }), jbm.worker()),
      remote.initShadowData('%$person%', jbm.worker()),
      () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) } // writeValue after calculate
    ),
    calculate: remote.data(
      pipe(rx.pipe(
        source.watchableData('%$person/name%'),
        rx.log('test'),
        rx.map('%newVal%'),
        rx.take(1)
      )), 
      jbm.worker()
    ),
    expectedResult: equals('Dan')
  })
})

jb.component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(source.interval(1), jbm.worker()),
            rx.take(2),
            rx.map('-%%-'),
      ), join(',')),
      expectedResult: equals('-0-,-1-')
    })
})

jb.component('remoteTest.source.remote.local', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3])), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.source.remote.worker', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3]), jbm.worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.remote.operator', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(
         rx.pipe(
            source.data([1,2,3]),
            remote.operator(rx.take(2), jbm.worker()),
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
//       remote.operator(rx.map(remoteTest.sampleObject(5)), jbm.worker()),
//       remote.operator(rx.map('%m1()%'), jbm.worker()),
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
          remote.operator(rx.map('%$retVal%'), jbm.worker()),
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
          remote.operator(rx.map('%$func()%'), jbm.worker()),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

// jb.component('remoteTest.dynamicJsFuncAsParam', {
//   params: [
//     { id: 'func', dynamic: true, defaultValue: ({data}) => `-${data}-`},
//   ],
//   impl: dataTest({
//     timeout: 5000,
//       calculate: rx.pipe(
//           source.data(1),
//           remote.operator(rx.map('%$func()%'), jbm.worker()),
//           rx.take(1)
//     ),
//     expectedResult: equals('-1-')
//   })
// })

// jb.component('remoteTest.uiWorker', {
//   type: 'remote',
//   impl: jbm.worker('ui')
// })

// jb.component('jbm.worker', {
//   type: 'remote',
//   impl: jbm.worker({id: 'ui-with-samples', libs: ['common','ui-common','remote','remote-widget','codemirror-backend'], jsFiles: ['/projects/ui-tests/test-data-samples.js']})
// })

jb.component('remoteWidgetTest.button', {
  impl: uiTest({
    timeout: 1000,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(button('hello world'), jbm.worker()),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteWidgetTest.changeText', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind:'%$fName%'})
        ],
        features: watchable('fName','Dan'),
      }),
      jbm.worker()
    ),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('input')),
      rx.map(userInput.setText('danny')),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

jb.component('remoteWidgetTest.codemirror', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: jb.delay(1000),
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(text({text: 'hello', style: text.codemirror({height: 100})}), jbm.worker()),
    expectedResult: contains('hello')
  })
})

jb.component('remoteWidgetTest.codemirror.editableText', {
  impl: uiFrontEndTest({
    runBefore: remote.action(addComponent({id: 'person', value: obj(prop('name','Homer')), type: 'watchableData' }), jbm.worker()),
    renderDOM: true,
    timeout: 3000,
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(editableText({databind: '%$person/name%', style: editableText.codemirror({height: 100})}), jbm.worker()),
    expectedResult: contains('Homer')
  })
})

jb.component('remoteWidgetTest.refresh.cleanUp', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    control: group({
      controls: remote.widget(text('%$person1/name%'), jbm.worker()),
      features: [
        variable('person1','%$person%'), // only local vars are passed to remote
        watchRef('%$person/name%')
      ]
    }),
    action: rx.pipe( 
      source.data(0),
      rx.do(writeValue('%$person/name%', 'hello')),
      rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))), jbm.worker())),
      rx.do(() => jb.ui.garbageCollectCtxDictionary(true,true)),
      rx.flatMap(source.remote(source.promise(waitFor(equals(1, count(widget.headlessWidgets())))), jbm.worker())),
      rx.timeoutLimit(1000, () => jb.logError('worker did not cleanup')),
      rx.catchError()
    ),    
    expectedResult: contains('hello')
  })
})

jb.component('remoteWidgetTest.html', {
  impl: uiTest({
    timeout: 500,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(html('<p>hello world</p>'), jbm.worker()),
    expectedResult: contains('hello world</p>')
  })
})

jb.component('remoteWidgetTest.css', {
  impl: uiFrontEndTest({
    control: remote.widget(text({text: 'hello', features: css('color: red')}), jbm.worker()),
    expectedResult: true
  })
})

jb.component('remoteWidgetTest.infiniteScroll', {
  impl: uiFrontEndTest({
    timeout: 1000,
    renderDOM: true,
    control: remote.widget(
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
      jbm.worker()
    ),
    action: runActions( 
      uiAction.scrollBy('.jb-itemlist',100),
      delay(200)
    ),
    expectedResult: contains('>8<')
  })
})

jb.component('remoteWidgetTest.infiniteScroll.MDInplace', {
  impl: uiFrontEndTest({
    timeout: 1000,
    renderDOM: true,
    control: remote.widget(group({
      controls: [
        table({
        items: '%$people%',
        lineFeatures: [
          watchRef({ref: '%$sectionExpanded/{%$index%}%', allowSelfRefresh: true}),
          table.enableExpandToEndOfRow()
        ],        
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
        features: [
          css.height({height: '40', overflow: 'scroll'}),
          itemlist.infiniteScroll(2),  
        ]
      })],
      features: [
        watchable('sectionExpanded', obj()),
        variable('people', [
            {name: 'Homer Simpson', age: 42, male: true},
            {name: 'Marge Simpson', age: 38, male: false},
            {name: 'Bart Simpson', age: 12, male: true}
          ]
        )
      ]
    }),
    jbm.worker()
    ),
    action: runActions( 
      uiAction.scrollBy('.jb-itemlist',100),
      uiAction.click('i','toggle'),
      delay(200)
    ),
    expectedResult: and(contains(['colspan="','inner text','Bart']),not(contains('>42<')), not(contains(['inner text','inner text'])))
  })
})

jb.component('remoteWidgetTest.refresh', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: group({
      controls: remote.widget(text('%$person1/name%'), jbm.worker()),
      features: [
        variable('person1','%$person%'), // only local vars are passed to remote
        watchRef('%$person/name%')
      ]
    }),
    action: rx.pipe( 
      source.data(0),
      rx.do(writeValue('%$person/name%', 'hello')),
      rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))), jbm.worker())),
    ),    
    expectedResult: contains('hello')
  })
})

jb.component('eventTracker.worker.vDebugger', {
  impl: uiTest({
    timeout: 2000,
    runBefore: remote.action(
      runActions(
        () => jb.spy.initSpy({spyParam: 'remote,log1'}),
        log('log1',obj(prop('hello','world'))),
        jbm.vDebugger()
      ),
      jbm.worker()),
    control: remote.widget(studio.eventTracker(), jbm.byUri('tests•w1•vDebugger')),
    expectedResult: contains('log1')
  })
})

jb.component('eventTracker.uiTest.vDebugger', {
  impl: uiTest({
    timeout: 2000,
    runBefore: remote.action(
      runActions(
        jbm.vDebugger(), 
        log('check test result', obj(prop('html','<div><span>aa</span></div>'), prop('success',true))),
        log('check test result', obj(prop('html','<span/>'), prop('success',false))),
      ), jbm.worker()),
    control: group({
      controls: [
        remote.widget(editableText({databind:'%$person/name%'}), jbm.worker()),
        remote.widget(studio.eventTracker(), jbm.byUri('tests•w1•vDebugger')),
      ]
    }),
    expectedResult: contains('group')
  })
})

// jb.component('remoteWidgetTest.recoverAfterError', {
//   impl: uiTest({
//     timeout: 3000,
//     control: remote.widget( 
//       button({ title: 'generate delta error %$recover%',
//         style: button.native(),
//         action: ({},{widgetId}) => 
//           jb.ui.renderingUpdates.next({widgetId, delta: { }, cmpId: 'wrongId'})
//       }), 
//       jbm.worker()
//     ),
//     userInputRx: rx.pipe(
//       source.waitForSelector('button'),
//       rx.map(userInput.click('button')),
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('delta error true')
//   })
// })

