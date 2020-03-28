jb.ns('d3-demo,d3g')
jb.ns('d3Chart,d3Scatter,d3Histogram')

jb.component('d3Demo.main', {
  type: 'control',
  impl: group({
    controls: [
      d3g.chartScatter({
        title: 'phones',
        items: pipeline('%$phones%', filter(between({from: '4', to: '7', val: '%size%'}))),
        frame: d3g.frame({
          width: '1200',
          height: '480',
          top: 20,
          right: 20,
          bottom: '40',
          left: '80'
        }),
        pivots: [
          d3g.pivot({title: 'size', value: '%size%'}),
          d3g.pivot({title: 'hits', value: '%hits%', scale: d3g.sqrtScale()}),
          d3g.pivot({title: 'performance', value: '%performance%'}),
          d3g.pivot({title: 'make', value: '%make%'}),
          d3g.pivot({title: '$', value: '%price%'})
        ],
        itemTitle: '%title% (%Announced%)',
        visualSizeLimit: '3000',
        style: d3Scatter.plain()
      })
    ]
  })
})
