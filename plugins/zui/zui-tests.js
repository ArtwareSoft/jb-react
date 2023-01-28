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
        zui.multiLayer({items: pipeline('%$phones%',slice(0, 10)), layers: [summaryLabel(), circles()]})
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.summaryLabel', {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft(),
          controls: [
            text('%$zuiCtx/props/DIM%', 'DIM'),
            text('%$zuiCtx/props/zoom%', 'zoom'),
            text('%$zuiCtx/props/strLen%', 'strLen'),
            text('%$zuiCtx/props/center[0]% , %$zuiCtx/props/center[1]%', 'center'),
            text('%$zuiCtx/props/boxSize[0]% , %$zuiCtx/props/boxSize[1]%', 'boxSize')
          ],
          features: id('propSheet')
        }),
        zui.multiLayer({
          boardSize: 8,
          initialZoom: 2,
          items: pipeline('%$phones%', slice(0, 10)),
          layers: [summaryLabel(), circles('30.0')],
          onChange: refreshControlById('propSheet')
        })
      ],
      features: variable('zuiCtx', obj())
    }),
    expectedResult: contains('cmp-id')
  })
})