using('net')

component('llmHelper', {
    type: 'jbm<jbm>',
    impl: viaRouter('llmHelper')
})

component('llmHelper.code', {
  type: 'data<>',
  impl: remote.data({
    calc: () => [...document.querySelectorAll('code')].map(x=>({ 
      type: (x.className.match(/language-([a-z]+)/)||[])[1], 
      code: x.innerText})),
    jbm: viaRouter('llmHelper')
  })
})

component('llmHelper.initCommandListener', {
  type: 'action<>',
  impl: remote.action({
    action: ctx => {
      const el = document.querySelector('textarea')
      el && el.addEventListener('keydown',e => { 
        if (e.key == 'Enter') 
          ctx.setData(el.value).run(
            {$: 'remote.action', action: {$: 'llmHelper.handleCommand', command: '%%'}, jbm: {$: 'viaRouter', uri: jb.uri } }
          ,'action<>')
      })
    },
    jbm: viaRouter('llmHelper')
  })
})

component('llmHelper.handleCommand', {
  type: 'action<>',
  params: [
    {id: 'command', as: 'string'}
  ],
  impl: action.switch(action.switchCase(equals('!say hello'), llmHelper.setPrompt('yes commander')), {
    data: '%$command%'
  })
})

component('llmHelper.setPrompt', {
  type: 'action<>',
  params: [
    {id: 'prompt', as: 'string'}
  ],
  impl: remote.action({
    action: (ctx,{},{prompt}) => {
      const el = document.querySelector('textarea')
      el && (el.value = prompt)
    },
    jbm: viaRouter('llmHelper')
  })
})