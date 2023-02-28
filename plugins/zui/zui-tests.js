jb.component('zuiTest.basic', {
  impl: uiTest({control: zui.control(), expectedResult: contains('cmp-id')})
})

jb.component('zuiTest.multiStage', {
  impl: uiTest({
    control: group({
      controls: [
        text('2'),
        zui.multiStage({items: '%$phones%', stages: [threejsCircles()]})
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.multiLayer', {
  impl: uiTest({
    control: group({
      controls: [
        text('2'),
        zui.multiLayer({items: pipeline('%$phones%', slice(0, 10)), layers: [summaryLabel(), circles()]})
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.summaryLabel', {
  impl: uiTest({
    control: group({
      controls: [
        zui.debugProps(),
        zui.multiLayer({
          boardSize: 256,
          initialZoom: 2,
          initialCenter: '158,135',
          items: pipeline('%$phones%', slice(0, 10000)),
          layers: [summaryLabel(), circles()],
          onChange: refreshControlById('debugProps')
        })
      ],
      features: variable('zuiCtx', obj())
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.itemlist', {
  impl: uiFrontEndTest({
    control: group({
      controls: [
        zui.debugProps(),
        zui.itemPreview('zuiTest.itemlist'),
        zui.itemlist({
          itemView: group(
            verticalOneByOne(),
            [
              text(adaptableText({att: 'title', features: priorty(1)})),
              circle(numeric({att: 'hits', features: priorty(2)}))
            ]
          ),
          items: '%$phones%',
          itemProps: [
            numeric({att: 'price', features: preferedAxis('x')}),
            numeric({att: 'hits', features: preferedAxis('y')})
          ],
          onChange: runActions(refreshControlById('debugProps'), refreshControlById('itemPreview'))
        })
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    action: uiAction.waitForSelector("canvas[zui-rendered='true']"),
    expectedResult: contains('zui-rendered')
  })
})
