
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
      layout: layout.horizontal(),
      controls: [
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
          onChange: refreshControlById('itemPreview')
        }),
        zui.itemPreview(),
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    action: uiAction.waitForSelector("canvas[zui-rendered='true']"),
    expectedResult: contains('zui-rendered')
  })
})

jb.component('zuiState', {
  passiveData: {
  'zuiTest.itemlist~impl~control~controls~2~itemView': {
    zoom: 512,
    width: 1.171875,
    height: 0.8984375,
    top: 0,
    left: 0
  },
  'zuiTest.itemlist~impl~control~controls~2~itemView~views~1': {
    height: 0.8984375,
    width: 1.171875,
    top: 0,
    left: 0,
    circleSize: 8.61370563888011,
    circlePos: [0, 0]
  },
  'zuiTest.itemlist~impl~control~controls~2~itemView~views~0': {
    height: 0,
    width: 1.171875,
    top: 0,
    left: 0,
    strLen: 2,
    boxSize: [0.04309413075697204, 0.08618826151394408],
    textSquareInPixels: 96.96179420318708,
    charWidthInTexture: 0.009765625
  }
}
})

jb.component('zuiTest.itemPreview', {
  impl: uiTest({
    control: group({
      vars: [
        Var('zuiCtx', obj(prop('props',obj(prop('zuiState', '%$zuiState%')))))
      ],
      controls: zui.itemPreview('zuiTest.itemlist~impl~control~controls~2~itemView')
    }),
    expectedResult: contains('circlePos')
  })
})
