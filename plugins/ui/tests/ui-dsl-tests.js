using('tgp-lang-service-tests')

component('location.control', {
  type: 'control<>',
  params: [
    {id: 'state', type: 'state<location>'}
  ],
  impl: group(
    text('%$state/capital/name%', { style: header.h2() }),
    itemlist({ items: '%$state/cities%', controls: text('%name%') })
  )
})

component('dslTest.usingCtrl', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(__TBD())
})`, {
    expectedSelections: ['location.control']
  })
})

component('dslTest.usingCtrl2', {
  impl: completionOptionsTest(`component('x', {
  impl: uiTest(location.control(__TBD()))
})`, {
    expectedSelections: ['israel']
  })
})

component('dslTest.jbDsl.usingCtrl', {
  impl: uiTest(location.control(israel()), contains('Jerusalem'))
})

component('remoteTest.dsl', {
  impl: uiTest(location.control(israel()), contains('Jerusalem'), { timeout: 500, backEndJbm: worker() })
})
