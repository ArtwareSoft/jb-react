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
        zui.multiLayer({
          items: '%$phones%',
          layers: [summaryLabel(), nativeCircles()]
        })
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})