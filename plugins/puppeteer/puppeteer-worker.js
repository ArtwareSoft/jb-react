using('remote,ui-tests,loader')

extension('puppeteer', {
    initExtension() { return { } },
    start({healess,page} = {}) {

    }
})

component('puppeteer', {
  type: 'jbm<jbm>',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true, byName: 'true'},
    {id: 'init', type: 'action', dynamic: true},
    {id: 'headeless', as: 'boolean', type: 'boolean'},
    {id: 'page', as: 'string'},
    {id: 'uiAction', type: 'ui-action<test>'},
    {id: 'spy', as: 'string'}
  ],
  impl: remoteNodeWorker(firstSucceeding('%$id%','puppeteer1'), {
    sourceCode: extend('%$sourceCode%', sameAsParent())
  })
})