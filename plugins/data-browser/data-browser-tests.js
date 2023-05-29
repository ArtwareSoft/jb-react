using('ui-tests')

component('uiTest.dataBrowse', {
  impl: uiTest({
    control: ui.dataBrowse(obj(prop('x', 'hello world'))),
    expectedResult: contains('hello world')
  })
})
