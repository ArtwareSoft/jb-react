// jb.ns('vega')

jb.component('dataResource.vegaItems', {
  passiveData: [
    {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
    {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
    {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
  ]
})

jb.component('vegaTest.bar', {
  impl: uiFrontEndTest({
    control: vega.interactiveChart(
      vega.spec({
        data: vega.jbData('%$vegaItems%'),
        mark: vega.bar(),
        encoding: vega.positionChannels(vega.channel('a', 'nominal'), vega.channel('b', 'quantitative'))
      })
    ),
    action: uiAction.waitForSelector('svg'),
    expectedResult: contains('linear scale with values from 0 to 100'),
    renderDOM: true
  })
})
