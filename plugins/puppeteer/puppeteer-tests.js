using('ui')

component('puppeteerTest.simple', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: remote.data(pipeline('hello','%%'), puppeteer({ url: 'http://www.google.com' })),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})


component('puppeteer.activator', {
  type: 'control<>',
  impl: group(button('launch', puppeteer.launch()))
})
