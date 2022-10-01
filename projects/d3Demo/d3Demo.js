// jb.component('d3Demo.main', {
//   type: 'control',
//   impl: group({
//     title: '',
//     layout: layout.vertical('12'),
//     controls: [
//       d3g.chartScatter({
//         title: 'phones',
//         items: pipeline('%$phones%', filter(between({from: '4', to: '7', val: '%size%'}))),
//         frame: d3g.frame({
//           width: '1200',
//           height: '480',
//           top: 20,
//           right: 20,
//           bottom: '40',
//           left: '80'
//         }),
//         pivots: [
//           d3g.axis({title: 'size', value: '%size%'}),
//           d3g.axis({title: 'hits', value: '%hits%', scale: d3g.sqrtScale()}),
//           d3g.axis({title: 'performance', value: '%performance%'}),
//           d3g.axis({title: 'make', value: '%make%'}),
//           d3g.axis({title: '$', value: '%price%'})
//         ],
//         itemTitle: '%title% (%Announced%)',
//         visualSizeLimit: '3000',
//         style: d3Scatter.plain()
//       })
//     ]
//   }),
//   category: ''
// })

jb.component('d3Demo.main', {
  type: 'control',
  impl: group({
    controls: itemlist({
      items: '%$phones%',
      controls: [
        text({
          text: '%size%',
          title: 'size',
          features: space.axis()
        }),
        text({
          text: '%price%',
          title: 'price',
          features: space.axis()
        }),
        text({
          text: '%hits%',
          title: 'hits',
          features: space.axis({scale: space.sqrtScale()})
        })
      ]
    }),
    features: group.itemlistContainer()
  })
})
