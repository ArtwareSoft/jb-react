jb.component('remoteWidgetTest.button', {
  impl: uiTest({
    timeout: 3000,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(button('hello world'), jbm.worker()),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteWidgetTest.group.wait', {
  impl: uiTest({
    timeout: 3000,
    checkResultRx: () => jb.ui.renderingUpdates,
    control: remote.widget(group({
      controls: button('hello world'),
      features: group.wait(treeShake.getCodeFromRemote('sampleProject.main')),
    }), jbm.worker()),
    expectedResult: contains('hello world')
  })
})

jb.component('remoteWidgetTest.distributedWidget', {
  impl: uiTest({
    timeout: 3000,
    control: group({
      controls:button({title: 'click', 
        action: runActions(
          jbm.child('jbxServer'),
          remote.action(remote.distributedWidget({ 
            control: text('hello world'), 
            frontend: jbm.byUri('tests•jbxServer'), 
            selector: '.xRoot' 
          }), jbm.worker()),
      )}), 
      features: css.class('xRoot')}
    ),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('button')),
      rx.map(userInput.click()),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('hello')
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

jb.component('remoteWidgetTest.buttonClick', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: [
          text('%$fName%'),
          button({title: 'change', action: writeValue('%$fName%','danny') })
        ],
        features: watchable('fName','Dan'),
      }),
      jbm.worker()
    ),
    userInputRx: source.promises(
      uiAction.waitForSelector('button'),
      userInput.click(),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('danny')
  })
})

jb.component('remoteWidgetTest.dialog', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      button({title: 'open', action: openDialog({title: 'hello', content: group()})}),
      jbm.worker()
    ),
    userInputRx: rx.pipe(
      source.promise(uiAction.waitForSelector('button')),
      rx.map(userInput.click()),
    ),
    checkResultRx: () => jb.ui.renderingUpdates,
    expectedResult: contains('hello')
  })
})

jb.component('remoteWidgetTest.loadCodeManully', {
  impl: uiTest({
    timeout: 1000,
    control: remote.widget(
      group({
        controls: ctx => ctx.run({$: 'text', text: 'hello' }),
        features: group.wait(treeShake.getCodeFromRemote('text'))
      }),
      jbm.worker()
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


