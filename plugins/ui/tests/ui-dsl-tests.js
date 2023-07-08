using('core-tests,tgp-tests')

component('location.control', {
  type: 'control<>',
  params: [
    {id: 'state', type: 'state<location>'}
  ],
  impl: group({
    controls: [
      text({text: '%$state/capital/name%', style: header.h2()}),
      itemlist({items: '%$state/cities%', controls: text('%name%')})
    ]
  })
})

component('completionTest.dslTest.usingCtrl', {
  impl: tgp.completionOptionsTest(
    "component('x', {\n  impl: uiTest(__TBD())\n})",
    ['location.control']
  )
})

component('completionTest.dslTest.usingCtrl2', {
  impl: tgp.completionOptionsTest(`component('x', {
  impl: uiTest(location.control(__TBD()))
})`, ['israel'])
})

component('dslTest.jbDsl.usingCtrl', {
  impl: uiTest({control: location.control(israel()), expectedResult: contains('Jerusalem')})
})

component('remoteTest.dsl', {
  impl: uiTest({
    control: remote.widget(location.control(israel()), worker()),
    expectedResult: contains('Jerusalem'),
    uiAction: waitForNextUpdate(),
    timeout: 500
  })
})
