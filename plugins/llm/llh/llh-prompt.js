dsl('llh')

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