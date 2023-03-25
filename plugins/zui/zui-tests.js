
jb.component('zuiTest.itemlist', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            verticalOneByOne(),
            [
              growingText(byName('title')),
              circle(byName('hits'), priorty(1)),
              group(horizontalOneByOne(), [
                fixedText(byName('price')),
                fixedText(byName('hits'))
              ])
            ]
          ),
          boardSize: 16,
          initialZoom: 2,
          center: '3.7,6.6',
          items: pipeline('%$phones%', slice(0, 10)),
          itemProps: [
            text({att: 'title', features: [priorty(2)]}),
            numeric({att: 'price', features: [preferedAxis('x'), priorty(3)]}),
            numeric({att: 'hits', features: preferedAxis('y')})
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

jb.component('zuiTest.verticalOneByOne', {
  impl: uiTest({
    control: group({
      layout: layout.horizontal(),
      controls: [
        zui.itemlist({
          itemView: group(
            verticalOneByOne(),
            [
              growingText(byName('title')),
              fixedText(byName('price')),
              fixedText(byName('hits')),
              circle(byName('hits'), priorty(1))
            ]
          ),
          boardSize: 8,
          initialZoom: 3,
          items: '%$phones%',
          itemProps: [
            text({att: 'title', features: [priorty(2)]}),
            numeric({att: 'price', features: [preferedAxis('x'), priorty(3)]}),
            numeric({att: 'hits', features: preferedAxis('y')})
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.itemPreview()
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('zoom')
  })
})

/*
jb.component('zuiTest.currency', {
  impl: uiTest({
    control: group({
      layout: layout.horizontal(),
      controls: [
        zui.itemlist({
          itemView: fixedText(numeric({att: 'price', prefix: '$'})),
          boardSize: 8,
          items: '%$phones%',
          itemProps: [
            numeric({att: 'price', features: preferedAxis('x')}),
            numeric({att: 'hits', features: preferedAxis('y')})
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.itemPreview()
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    action: uiAction.waitForSelector(
      "canvas[zui-rendered='true']"
    ),
    expectedResult: contains('zui-rendered')
  })
})

jb.component('zuiTest.itemPreview', {
  impl: uiTest({
    control: group({
      vars: [
        Var(
          'renderProps',
          zui.stateOfItemView(
            group(
              verticalOneByOne(),
              [
                fixedText(text('title')),
                circle(numeric('price')),
                group({
                  views: [
                    fixedText(numeric('price')),
                    fixedText(numeric('hits'))
                  ]
                })
              ]
            )
          )
        ),
        Var('zuiCtx', obj(prop('props', obj(prop('renderProps', '%$renderProps%')))))
      ],
      controls: zui.itemPreview()
    }),
    expectedResult: contains('zoom')
  })
})
*/
