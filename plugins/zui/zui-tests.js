
jb.component('zuiTest.itemlist', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            [
              group(
                [
                  firstToFit([
                    fixedText({prop: byName('price'), backgroundColorByProp: true}),
                    circle(byName('price'))
                  ]),
                  fixedText({prop: byName('rating'), backgroundColorByProp: true})
                ],
                horizontal()
              ),
              growingText(byName('name')),
              image('/hotels/images/600-400/%image%.webp'),
              growingText(text({att: 'distanceLabel', features: priorty(4)}))
            ]
          ),
          boardSize: 32,
          initialZoom: 4.5,
          center: '2.7,7.8',
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
            numeric({att: 'lat', features: preferedAxis('x')}),
            numeric({att: 'long', features: preferedAxis('y')})
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


