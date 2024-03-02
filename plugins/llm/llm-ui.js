using('ui')

component('workingDoc', { passiveData: '# hello markdown'
})

component('workingSection', { passiveData: ''
})

component('llm.localHelper', {
  type: 'control<>',
  params: [],
  impl: group({
    controls: [
      group({
        controls: [
          markdown('%$workingDoc%', { title: '' }),
          editableText({ databind: '%$workingDoc%', style: editableText.markdown('') })
        ],
        title: 'document'
      }),
      group(button('click me'), { title: 'actions' })
    ],
    style: group.tabs()
  })
})


component('localHelper.openHelperDialog', {
  type: 'action<>',
  params: [],
  impl: openDialog('LLM Helper', llm.localHelper(), {
    style: llm.Floating('helper', '860', { height: '100%' }),
    menu: menu.control(menu.menu({ options: menu.action('save') }), menuStyle.toolbar()),
    features: dialogFeature.resizer()
  })
})

component('localHelper.code', {
  type: 'data<>',
  impl: () => [...document.querySelectorAll('code')].map(x=>({
      type: (x.className.match(/language-([a-z]+)/)||[])[1],
      code: x.innerText}))
})

component('localHelper.init', {
  type: 'action<>',
  impl: () => {
      const el = document.querySelector('textarea')
      el && el.addEventListener('keydown', e => {
        if (e.key == 'Enter') {}
      })
    }
})

component('localHelper.setPrompt', {
  type: 'action<>',
  params: [
    {id: 'prompt', as: 'string'}
  ],
  impl: (ctx,prompt) => {
      const el = document.querySelector('textarea')
      el && (el.value = prompt)
    }
})