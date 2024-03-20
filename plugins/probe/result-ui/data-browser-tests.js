using('ui-testers')

component('uiTest.dataBrowse', {
  impl: uiTest(ui.dataBrowse(obj(prop('x', 'hello world'))), contains('hello world'))
})

