using('remote,loader')

extension('puppeteer', {
    initExtension() { return { } },
})

component('puppeteer', {
  type: 'jbm<jbm>',
  params: [
    {id: 'id', as: 'string', byName: 'true'},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'headless'},
    {id: 'url', as: 'string'},
    {id: 'spy', as: 'string'}
  ],
  impl: remoteNodeWorker(firstSucceeding('%$id%','puppeteer1'), {
    sourceCode: extend('%$sourceCode%', sourceCode(plugins('llm,puppeteer'))),
    init: puppeteer.launch({ headless: '%$headless%', url: '%$url%' })
  })
})

component('puppeteer.launch', {
  type: 'action<>',
  params: [
    {id: 'headless', as: 'boolean', type: 'boolean', byName: true},
    {id: 'url', as: 'string'},
  ],
  impl: remote.action(async (ctx,headless,url) => {
    debugger
      const puppeteer = require('puppeteer')
      const browser = await puppeteer.launch({ headless })
      const page = await browser.newPage()
      Object.assign(jb.puppeteer, {puppeteer,browser,page})
      await page.goto(url)
      //await browser.close();
  }, '%$jbm%')
})