
component('zuiTest.itemlist', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            [
              growingText(byName('name')),
              group(
                [
                  firstToFit(
                    [
                      fixedText({prop: byName('price'), length: 8}),
                      fixedText({
                        prop: byName('price'),
                        length: 4,
                        backgroundColorByProp: true
                      }),
                      circle(byName('price'))
                    ]
                  ),
                  fixedText({prop: byName('rating'), length: 4})
                ],
                horizontal()
              ),
              image({url: '/hotels/images/256-256%image%.webp', build: imageBuild('mainImage-64-256px')}),
              fixedText(text('x', ' ')),
              fixedText(text('x', ' '))
            ]
          ),
          boardSize: 64,
          initialZoom: 2.3,
          center: '11.250771189536731,23.093061441630162',
          items: pipeline('%$hotels%'),
          itemProps: [
            numeric({
              att: 'price',
              prefix: '$',
              features: [
                priorty(1),
                colorScale(green())
              ]
            }),
            numeric({att: 'rating', features: [priorty(2), colorScale(red())]}),
            text({att: 'name', features: priorty(3)}),
            geo('lat', preferedAxis('y')),
            geo('long', preferedAxis('x'))
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.visualItemPreview()
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})


component('hotels', { passiveData:
  [
      {
          "name": "Sheraton Tel Aviv",
          "price": 603,
          "rating": "8.1",
          "type": "Hotel",
          "lat": 32.08148956298828,
          "long": 34.768218994140625,
          "distanceLabel": "right by the beach",
          "imagesCount": 195,
          "image": "/itemimages/32/20/322036_v3"
      },
      {
          "name": "Lighthouse Tel Aviv By Brown",
          "price": 163,
          "rating": "7.9",
          "type": "Hotel",
          "lat": 32.07344055175781,
          "long": 34.76831817626953,
          "distanceLabel": "0.2 miles away from the beach",
          "imagesCount": 99,
          "image": "/itemimages/31/43/3143319_v6"
      },
]})

// component('zuiTest.build', {
//   impl: dataTest({runBefore: buildPartition('zuiTest.itemlist')})
// })