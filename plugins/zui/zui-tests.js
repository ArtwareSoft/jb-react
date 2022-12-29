jb.component('zuiTest.basic', {
  impl: uiTest({control: zui.control(), expectedResult: contains('cmp-id')})
})

jb.component('zuiTest.multiStage', {
  impl: uiTest({control: zui.multiStage({items: '%$phones%', stages: [threejsCircles()]}), expectedResult: contains('cmp-id')})
})

