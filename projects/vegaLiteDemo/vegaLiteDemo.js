// jb.ns('vegaLiteDemo,vega')
sampleX = {
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
          data: vega.jbData('%$phones%'),
          mark: vega.circle(),
          encoding: vega.positionChannels(vega.channel('year', 'nominal'), vega.channel('price', 'quantitative'))
        })
      )
    ],
    features: css.width('500')
  })
})

jb.component('vegaLiteDemo.cars', {
  type: 'control',
  impl: group({
    title: '',
    controls: vega.interactiveChart(
      vega.spec({
        data: vega.dataFromUrl('/projects/vegaLiteDemo/cars.json'),
        mark: vega.circle(),
        encoding: vega.positionChannels({
          x: vega.channel('Miles_per_Gallon', 'quantitative'),
          y: vega.channel('Horsepower', 'quantitative'),
          color: vega.channel('Cylinders')
        })
      })
    ),
    features: []
  })
})

jb.component('population', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      vega.interactiveChart(
        vega.spec({
          data: vega.jbData(
            pipeline(
              '%$phones%',
              stat.groupBy(
                '%Technology%',
                [
                  stat.fieldInGroup({
                    aggregateFunc: stat.min(),
                    aggregateValues: '%price%',
                    aggregateResultField: 'minPrice'
                  }),
                  stat.fieldInGroup({
                    aggregateFunc: stat.stdev(),
                    aggregateValues: '%price%',
                    aggregateResultField: 'priceVariance'
                  })
                ]
              )
            )
          ),
          transform: [],
          mark: vega.circle(vega.generalMarkProps({tooltip: 'hello'})),
          encoding: vega.positionChannels(vega.channel('Technology', 'ordinal'), vega.channel('minPrice'))
        })
      )
    ]
  })
})
