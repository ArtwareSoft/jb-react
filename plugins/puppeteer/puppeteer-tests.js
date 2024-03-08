using('ui-tests')

component('puppeteer.activator', {
  type: 'control<>',
  impl: group(button('launch'), {
    features: group.wait(jbm.start(puppeteerWorker({ id: 'pupp1', url: 'https://chat.openai.com' })))
  })
})


//'https://chat.openai.com/c/b9bf2dcf-a2cf-4cf9-972b-3e0a938f511f' 
