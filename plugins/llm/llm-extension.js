using('net')

component('llm.helper', {
    type: 'jbm<jbm>',
    impl: viaRouter('llmHelper')
})

component('llm.helperUrl', {
  type: 'data<>',
  impl: remote.data(() => location.href, viaRouter('llmHelper'))
})