using('ui','tgp-text-editor')
dsl('llm')

component('llm.localHelper', {
  type: 'control<>',
  params: [
    {id: 'doc', defaultValue: '%$llmTutorial_Query%'}
  ],
  impl: group({
    controls: [
      group({
        controls: [
          editableText('enter command', '%$command/cmd%', {
            style: editableText.mdcInput('420'),
            features: editableText.picklistHelper(picklist.optionsByComma('1111,2,3,4'), {
              popupFeatures: [
                css('zoom: 60%;'),
                css.padding({ left: '10', right: '10' })
              ],
              onEnter: editableText.setInputState('%$selectedOption%', '%value%')
            })
          }),
          group({
            controls: [
              button('Save', runActions(), { style: button.mdcIcon(icon('ContentSave', { type: 'mdi' })) }),
              button('add', runActions(), { style: button.mdcIcon(icon('Plus', { type: 'mdi' })) }),
              button('play', runActions(), { style: button.mdcIcon(icon('Play', 'run command', { type: 'mdi' })) })
            ],
            layout: layout.horizontal('5'),
            features: [
              feature.globalKeyboardShortcut('Alt+C'),
              css.transformScale('0.7', '0.7'),
              css.color({ background: 'var(--jb-menubar-selection-bg)', selector: '~ button' })
            ]
          })
        ],
        layout: layout.flex({ justifyContent: 'space-between' })
      }),
      group({
        controls: [
          markdown('%$doc/examples%', { title: 'examples' }),
          markdown('%$doc/quizzes%', { title: 'quizzes' }),
          markdown('%$doc/system%', { title: 'system' })
        ],
        title: 'document',
        style: group.tabs(),
        features: css.border('2', 'top', { color: 'var(--jb-menubar-selection-bg)' })
      })
    ],
    features: [
      watchable('command', obj(prop('cmd', ''))),
      css('zoom: 60%;'),
      frontEnd.requireExternalLibrary('../bin/studio/css/studio-all.css'),
      frontEnd.requireExternalLibrary('material-components-web.js','css/font.css','css/material.css')
    ]
  })
})


component('localHelper.openHelperDialog', {
  type: 'action<>',
  params: [],
  impl: openDialog('LLM Helper', llm.localHelper(), {
    style: llm.Floating('helper', '860', { height: '100%' }),
    features: [dialogFeature.resizer()]
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
  impl: ctx => {
      const el = document.querySelector('textarea')
      el && el.addEventListener('keydown', event => {
        if (event.altKey && event.key === 'j')
          jb.ui.extendWithServiceRegistry(ctx).runAction({$: 'localHelper.openHelperDialog'})
      })
  }
})

component('localHelper.runHelperAction', {
  type: 'action<>',
  params: [
    {id: 'actionStr', as: 'string'}
  ],
  impl: (ctx,actionStr) => {
      const profile = jb.tgpTextEditor.evalProfileDef('', `typeAdapter('helper-action',${actionStr})`, 'llm', 'llm')
      return profile && ctx.run(profile,'helper-action')
  }
})

component('setPrompt', {
  type: 'helper-action',
  params: [
    {id: 'prompt', as: 'string'}
  ],
  impl: (ctx,prompt) => {
      const el = document.querySelector('textarea')
      el && (el.value = prompt)
    }
})