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
      jbm.worker('innerWorker'), 
      remote.data('hello','%%')
    ),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', jbm.worker('innerWorker'))),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.remote.action', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      remote.action(() => jb.passive('w','hello'), jbm.worker('innerWorker')),
      remote.data('%$w%', jbm.worker('innerWorker')),
    ),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.childJbmPort', {
  impl: dataTest({
    timeout: 5000,
    runBefore: pipe(
      jbm.worker('innerWorker'), 
      remote.action(jbm.child('inner'),'%%')
    ),
    calculate: remote.data('hello',jbm.byUri('tests►innerWorker►inner')),
    expectedResult: 'hello'
  })
})

jb.component('remoteTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'networkPeer', networkPeer: true}), jbm.child('inner')),
    calculate: rx.pipe(
      source.promise(jbm.worker('innerWorker')),
      rx.flatMap(source.remote(source.promise(pipe(jbm.child('inWorker'),'x')), '%%')),
      rx.mapPromise(pipe(net.listSubJbms(), join(',')))
    ),
    expectedResult: contains(['tests►innerWorker','tests►innerWorker►inWorker'])
  })
})

jb.component('remoteTest.jbm.byUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('tst'),
    calculate: source.remote(source.data('hello'), jbm.byUri('tests►tst')),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.workerByUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.worker('innerWorker'),
    calculate: rx.pipe(
      source.data('hello'),
      remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker'))
    ),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.workerToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker('innerWorker'), jbm.worker('innerWorker2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker2'))
      ), jbm.byUri('tests►innerWorker')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.networkToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker('innerWorker2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker2'))
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
    runBefore: pipe(
      jbm.worker('innerWorker'), 
      remote.action(runActions(
        loadLibs('watchable'),
        addComponent({id: 'person', value: obj(), type: 'watchableData' })
      ),'%%'),
      remote.initShadowData({src: '%$person%', jbm: jbm.byUri('tests►innerWorker')}),
      () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) } // writeValue after calculate
    ),
    calculate: remote.data(
      pipe(rx.pipe(
        source.watchableData('%$person/name%'),
        rx.log('test'),
        rx.map('%newVal%'),
        rx.take(1)
      )), 
      jbm.byUri('tests►innerWorker')
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

jb.component('remoteTest.uiWorker', {
  type: 'remote',
  impl: jbm.worker({id: 'ui', libs: ['common','ui-common','remote','remote-widget'] })
})

jb.component('remoteTest.uiWorkerWithSamples', {
  type: 'remote',
  impl: jbm.worker({id: 'ui-with-samples', libs: ['common','ui-common','remote','remote-widget','codemirror-backend'], jsFiles: ['/projects/ui-tests/test-data-samples.js']})
})

jb.component('remoteWidgetTest.button', {
  impl: uiTest({
    timeout: 1000,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(button('hello world'), remoteTest.uiWorker()),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteWidgetTest.codemirror', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(text({text: 'hello', style: text.codemirror({height: 100})}), remoteTest.uiWorkerWithSamples()),
    expectedResult: contains('hello')
  })
})

jb.component('remoteWidgetTest.codemirror.editableText', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(editableText({databind: '%$person/name%', style: editableText.codemirror({height: 100})}), remoteTest.uiWorkerWithSamples()),
    expectedResult: contains('Homer')
  })
})

jb.component('remoteWidgetTest.refresh.cleanUp', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: group({
      controls: remote.widget(text('%$person1/name%'), remoteTest.uiWorker()),
      features: [
        variable('person1','%$person%'), // only local vars are passed to remote
        watchRef('%$person/name%')
      ]
    }),
    action: rx.pipe( 
      source.data(0),
      rx.do(writeValue('%$person/name%', 'hello')),
      rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))),remoteTest.uiWorker())),
      rx.do(() => jb.ui.garbageCollectCtxDictionary(true,true)),
      rx.flatMap(source.remote(source.promise(waitFor(equals(1, count(widget.headlessWidgets())))),remoteTest.uiWorker())),
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
    control: remote.widget(html('<p>hello world</p>'), remoteTest.uiWorker()),
    expectedResult: contains('hello world</p>')
  })
})

jb.component('remoteWidgetTest.css', {
  impl: uiFrontEndTest({
    control: remote.widget(text({text: 'hello', features: css('color: red')}), remoteTest.uiWorker()),
    expectedResult: true
  })
})

jb.component('remoteWidgetTest.changeText', {
  impl: uiTest({
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          editableText({databind:'%$fName%'})
        ],
        features: variable({name: 'fName', value: 'Dan', watchable: true})
      }),
      remoteTest.uiWorker()
    ),
    userInputRx: rx.pipe(
      source.waitForSelector('input'),
      rx.map(userInput.setText('danny')),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
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
      remoteTest.uiWorker()
    ),
    action: rx.pipe( 
      source.waitForSelector('.jb-itemlist'),
      rx.do(uiAction.scrollBy('.jb-itemlist',100)),
      rx.delay(200),
    ),
    expectedResult: contains('>8<')
  })
})

jb.component('remoteWidgetTest.infiniteScroll.MDInplace', {
  impl: uiFrontEndTest({
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
      features: variable({name: 'sectionExpanded', watchable: true, value: obj() }),
    }),
    remoteTest.uiWorkerWithSamples()
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

jb.component('remoteWidgetTest.refresh', {
  impl: uiFrontEndTest({
    renderDOM: true,
    control: group({
      controls: remote.widget(text('%$person1/name%'), remoteTest.uiWorker()),
      features: [
        variable('person1','%$person%'), // only local vars are passed to remote
        watchRef('%$person/name%')
      ]
    }),
    action: rx.pipe( 
      source.data(0),
      rx.do(writeValue('%$person/name%', 'hello')),
      rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))), remoteTest.uiWorker())),
    ),    
    expectedResult: contains('hello')
  })
})

jb.component('eventTracker.worker.vDebugger', {
  impl: uiTest({
    timeout: 2000,
    runBefore: pipe(
      jbm.worker('innerWorker'), 
      remote.action(runActions(
        () => jb.initSpy({spyParam: 'remote,log1'}),
        log('log1',obj(prop('hello','world'))),
        jbm.vDebugger()),
      '%%')
    ),
    control: remote.widget(studio.eventTracker(), jbm.byUri('tests►innerWorker►vDebugger')),
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
      ), remoteTest.uiWorkerWithSamples()),
    control: group({
      controls: [
        remote.widget(editableText({databind:'%$person/name%'}), remoteTest.uiWorkerWithSamples()),
        remote.widget(studio.eventTracker(), jbm.byUri('tests►ui-with-samples►vDebugger')),
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
//       remoteTest.uiWorker()
//     ),
//     userInputRx: rx.pipe(
//       source.waitForSelector('button'),
//       rx.map(userInput.click('button')),
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('delta error true')
//   })
// })

