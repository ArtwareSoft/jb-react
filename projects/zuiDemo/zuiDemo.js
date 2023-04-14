
jb.component('zuiDemo.main', {
  type: 'control',
  impl: group({
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
            image('/hotels/images/256-256%image%.webp'),
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
  })
})



