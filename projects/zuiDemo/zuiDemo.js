using('common','zui')

component('zuiDemo.main', {
  type: 'control',
  impl: group({
    layout: layout.flex({direction: 'row', wrap: 'wrap'}),
    controls: [
      zui.itemlist({
        itemView: group(
          [
            text8({prop: byName('price'), length: 8}),
            circle(byName('price')),
            growingText(byName('name')),
            group([
              text8({prop: byName('rating'), length: 4})
            ], horizontal()),
            image({
              url: 'https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp',
            }),
            text8('%xy%'),
            text8('%imageDebug%')
          ]
        ),
        boardSize: 64,
        initialZoom: 18,
        center: '11.250771189536731,23.093061441630162',
        items: pipeline('%$hotels%', unique('%name%')),
        itemProps: [
          numeric({att: 'price', prefix: '$', features: [
            priorty(1),
            colorScale(greens())
          ]}),
          numeric({att: 'rating', features: [priorty(2), colorScale(red())]}),
          text({att: 'name', features: priorty(3)}),
          geo('lat', preferedAxis('y')),
          geo('long', preferedAxis('x'))
        ],
        onChange: refreshControlById('itemPreview')
      }),
      zui.itemPreviewTable()
    ],
    features: [
      variable('zuiCtx', obj())
    ]
  })
})

//                 firstToFit(
//                   [
//                     text8({prop: byName('price'), length: 8}),
//                     // text8({
//                     //   prop: byName('price'),
//                     //   length: 4,
//                     //   backgroundColorByProp: true
//                     // }),
// //                    circle(byName('price'))
//                   ]
//                 ),


