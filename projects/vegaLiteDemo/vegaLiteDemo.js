jb.ns('vegaDemo,vega')
x = {
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}

jb.component('dataResource.items', {
  passiveData: [
    {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
    {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
    {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
  ]
})

jb.component('vegaDemo.main', {
  type: 'control',
  impl: vega.interactiveChart(vega.unit({
    data: vega.jbData('%$items%'),
    mark: vega.bar(),
    encoding: vega.positionChannels({
      x: vega.channel('a','nominal'),
      y: vega.channel('b','quantitative'),
    })
  }))
})
