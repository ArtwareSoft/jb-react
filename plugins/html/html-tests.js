component('htmlTest.basic', {
  impl: htmlTest({
    page: page(section({ html: '<div>hello world</div>', css: 'my css' })),
    expectedResult: contains('hello world','my css')
  })
})