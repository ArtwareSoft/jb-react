jb.component('zuiTest.basic', {
  impl: uiTest({
    control: zui.control(),
    expectedResult: contains('cmp-id')
  })
})