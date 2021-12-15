jb.component('FETest.distributedWidget', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: runActions(
      jbm.child('jbxServer'),
      remote.action(remote.distributedWidget({ 
        control: button('hello world'), 
        frontend: jbm.byUri('tests•jbxServer'), 
        selector: '.xRoot' 
      } ), jbm.worker()),
      uiAction.waitForSelector('button')
    ),
    control: group({controls: [], features: css.class('xRoot')}),
    expectedResult: contains('hello')
  })
})

jb.component('FETest.remoteWidgetTest.changeText', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: runActions(
      jbm.child('jbxServer'),
      remote.action(remote.distributedWidget({ 
        control: group({
          controls: [
            text({ text: 'hey %$fName%', features: watchRef('%$fName%')}),
            editableText({databind:'%$fName%'})
          ],
          features: watchable('fName','Dan'),
        }), 
        frontend: jbm.byUri('tests•jbxServer'), 
        selector: '.xRoot' 
      } ), jbm.worker()),
      uiAction.waitForSelector('input'),
      uiAction.setText('danny'),
      uiAction.keyboardEvent({selector: 'input', type: 'keyup'}),
      uiAction.waitForSelector('[cmp-ver="2"]'),
    ),
    control: group({controls: [], features: css.class('xRoot')}),
    expectedResult: contains('hey danny')
  })
})

jb.component('FETest.remoteWidget.codemirror', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 3000,
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(text({text: 'hello', style: text.codemirror({height: 100})}), jbm.worker()),
    expectedResult: contains('hello')
  })
})

jb.component('FETest.remoteWidget.codemirror.editableText', {
  impl: uiFrontEndTest({
    runBefore: remote.action(addComponent({id: 'person', value: obj(prop('name','Homer')), type: 'watchableData' }), jbm.worker()),
    renderDOM: true,
    timeout: 3000,
    action: waitFor(() => document.querySelector('.CodeMirror')),
    control: remote.widget(editableText({databind: '%$person/name%', style: editableText.codemirror({height: 100})}), jbm.worker()),
    expectedResult: contains('Homer')
  })
})

// jb.component('remoteWidgetTest.refresh.cleanUp', {
//   description: 'creating remote widgets and deleting them with gc',
//   impl: uiFrontEndTest({
//     renderDOM: true,
//     timeout: 3000,
//     control: group({
//       controls: remote.widget(text('%$person1/name%'), jbm.worker()),
//       features: [
//         variable('person1','%$person%'), // only local vars are passed to remote
//         watchRef('%$person/name%')
//       ]
//     }),
//     action: rx.pipe( 
//       source.data(0),
//       rx.do(writeValue('%$person/name%', 'hello')),
//       rx.flatMap(source.remote(source.promise(waitFor(count(widget.headlessWidgets()))), jbm.worker())),
//       rx.do(() => jb.ui.garbageCollectCtxDictionary(true,true)),
//       rx.flatMap(source.remote(source.promise(waitFor(equals(1, count(widget.headlessWidgets())))), jbm.worker())),
//       rx.timeoutLimit(1000, () => jb.logError('worker did not cleanup')),
//       rx.catchError()
//     ),    
//     expectedResult: contains('hello')
//   })
// })

jb.component('FETest.remoteWidget.infiniteScroll', {
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

jb.component('FETest.remoteWidget.infiniteScroll.MDInplace', {
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
      delay(200),
      uiAction.click('i','toggle'),
      delay(200)
    ),
    expectedResult: and(contains(['colspan="','inner text','Bart']),not(contains('>42<')), not(contains(['inner text','inner text'])))
  })
})

jb.component('FETest.remoteWidget.refresh', {
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