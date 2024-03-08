using('common','zui','ui-styles')

component('zuiDemo.main', {
  type: 'control',
  impl: group({
    layout: layout.flex({direction: 'row', wrap: 'wrap'}),
    controls: [
      zui.itemlist({
        itemView: group(
          [
            fixedText({prop: byName('price'), length: 8}),
            circle(byName('price')),
            growingText(byName('name')),
            group([
              fixedText({prop: byName('rating'), length: 4})
            ], horizontal()),
            image({
              url: 'https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp',
              build: imageBuild('projects/zuiDemo/build/top')
            }),
            fixedText(text('xy')),
            fixedText(text('imageDebug'))
          ]
        ),
        boardSize: 64,
        initialZoom: 18,
        center: '11.250771189536731,23.093061441630162',
        items: pipeline('%$hotels%', unique('%name%')),
        itemProps: [
          numeric({att: 'price', prefix: '$', features: [
            priorty(1),
            colorScale(green())
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
//                     fixedText({prop: byName('price'), length: 8}),
//                     // fixedText({
//                     //   prop: byName('price'),
//                     //   length: 4,
//                     //   backgroundColorByProp: true
//                     // }),
// //                    circle(byName('price'))
//                   ]
//                 ),


