using('net')

component('llh', {
    type: 'jbm<jbm>',
    impl: viaRouter('llh')
})

component('llh.code', {
  type: 'data<>',
  impl: () => [...document.querySelectorAll('code')].map(x=>({
      type: (x.className.match(/language-([a-z]+)/)||[])[1],
      code: x.innerText}))
})

component('llh.openDialogInIframe', {
  type: 'action<>',
  impl: renderDialogInIframe({
    dialog: inPlaceDialog('LLM Helper', llh.main('%$helperDoc%'), {
      style: inIframe.Floating('helper', { width: '460', height: '600' })
    }),
    sourceCode: plugins('llm')
  })
})

component('llh.runHelperAction', {
  type: 'action<>',
  params: [
    {id: 'actionStr', as: 'string'}
  ],
  impl: (ctx,actionStr) => {
      const toRun = `${actionStr.split(' ')[0]}('${actionStr.split(' ')[1] || ''}')`
      const {res} = jb.tgpTextEditor.evalProfileDef('', `typeAdapter('action<llh>',${toRun})`, 'llh', 'llh')
      const profile = jb.utils.resolveProfile(res)
      return profile && ctx.run(profile,'action<llh>')
  }
})

component('setPrompt', {
  type: 'action',
  params: [
    {id: 'prompt', as: 'string'}
  ],
  impl: (ctx,prompt) => {
      const el = document.querySelector('textarea')
      el && (el.value = prompt)
      jb.exec(writeValue('%$llmStateForTests/prompt%',prompt))
    }
})