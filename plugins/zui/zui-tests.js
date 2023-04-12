
jb.component('zuiTest.itemlist', {
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
                  firstToFit([
                    fixedText({prop: byName('price'), backgroundColorByProp: true}),
                    circle(byName('price'))
                  ]),
                  fixedText({prop: byName('rating'), backgroundColorByProp: true})
                ],
                horizontal()
              ),
              image('/hotels/images/256-256%image%.webp'),
//              growingText(text({att: 'distanceLabel', features: priorty(4)}))
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
            geo({att: 'lat', features: preferedAxis('y')}),
            geo({att: 'long', features: preferedAxis('x')})
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.visualItemPreview()
      ],
      features: [
        //frontEnd.init(async () => { document.body.style.overflow = 'hidden'}),
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})


