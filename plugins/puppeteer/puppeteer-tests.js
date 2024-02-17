component('puppeteerTest.simple', {
  doNotRunInTests: true,
  impl: dataTest(remote.data(pipeline('hello', '%%'),puppeteer()), equals('hello'), { timeout: 3000 })
})