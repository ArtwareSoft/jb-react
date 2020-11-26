jb.ns('vegaLiteDemo,vega')
x = {
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}

jb.component('dataResource.vegaItems', {
  passiveData: [
    {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
    {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
    {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
  ]
})

jb.component('vegaLiteDemo.main', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      vega.interactiveChart(
        vega.spec({
          data: vega.jbData('%$vegaItems%'),
          mark: vega.bar(),
          encoding: vega.positionChannels(vega.channel('a', 'nominal'), vega.channel('b', 'quantitative'))
        })
      )
    ],
    features: css.width('500')
  })
})
