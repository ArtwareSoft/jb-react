using('remote-jbm,loader')

extension('puppeteer', {
    initExtension() { return { } },
})

component('puppeteerWorker', {
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
    init: remote.action(puppeteer.init({ headless: '%$headless%', url: '%$url%' }), '%$jbm%')
  })
})

component('puppeteerCmd', {
  type: 'jbm<jbm>',
  params: [
    {id: 'id', as: 'string', byName: 'true'},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'headless'},
    {id: 'url', as: 'string'},
    {id: 'spy', as: 'string'}
  ],
  impl: cmd(extend('%$sourceCode%', sourceCode(plugins('llm,puppeteer'))))
})

component('puppeteer.init', {
  type: 'action<>',
  params: [
    {id: 'headless', as: 'boolean', type: 'boolean', byName: true},
    {id: 'url', as: 'string'}
  ],
  impl: async (ctx,headless,url) => {
    debugger
      // const puppeteer = require('puppeteer-extra');
      // const StealthPlugin = require('puppeteer-extra-plugin-stealth');
      // puppeteer.use(StealthPlugin());
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.launch({ headless, userDataDir: '/home/shaiby/.config/google-chrome/Profile 5' })
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36')
      Object.assign(jb.puppeteer, {puppeteer,browser,page})
      await page.goto(url)
      //await browser.close();
  }
})
