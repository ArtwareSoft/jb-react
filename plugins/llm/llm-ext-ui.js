using('ui-misc','tgp-text-editor','ui-styles','ui-tree','markdown-editor','ui-iframe-dialog')
dsl('llm')

component('llm.commandBar', {
  type: 'control<>',
  impl: group({
    controls: [
      editableText('enter command', '%$command/cmd%', {
        style: editableText.mdcInput('420'),
        features: features(
          feature.onKey('Enter', localHelper.runHelperAction('%$ev/value%')),
          editableText.picklistHelper(picklist.optionsByComma('1111,2,3,4'), {
            popupFeatures: [
              css.padding({ left: '10', right: '10' })
            ]
          })
        )
      })
    ],
    layout: layout.flex({ justifyContent: 'space-between' }),
    features: [
      watchable('command', obj(prop('cmd', ''))),
      frontEnd.requireExternalLibrary('material-components-web.js','css/font.css','css/material.css')
    ]
  })
})

//       frontEnd.requireExternalLibrary('../bin/studio/css/studio-all.css'),

component('llm.docHelper', {
  type: 'control<>',
  params: [
    {id: 'doc', defaultValue: '%$llmDocExample%'}
  ],
  impl: group(
    llm.commandBar(),
    group({
      controls: [
        markdown.editor('%$doc/content%', 'all document'),
        markdown.editor('%$doc/section%', 'working area'),
        markdown.editor('%$doc/outline%', 'outline')
      ],
      title: 'document',
      style: group.tabs(),
      features: features(css.border('2', 'top', { color: 'var(--jb-menubar-selection-bg)' }))
    })
  )
})

component('llm.localHelper', {
  type: 'control<>',
  params: [
    {id: 'doc', defaultValue: '%$llmTutorial_Query%'}
  ],
  impl: group(
    llm.commandBar(),
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
  )
})

// component('llm.helperDialog', {
//   type: 'control<>',
//   impl: inPlaceDialog('LLM Helper', llm.docHelper('%$llmDocExample%'), {
//     style: llm.Floating('helper', '860', { height: '100%' }),
//     features: [dialogFeature.resizer(), id('llm-dialog')]
//   })
// })

component('localHelper.code', {
  type: 'data<>',
  impl: () => [...document.querySelectorAll('code')].map(x=>({
      type: (x.className.match(/language-([a-z]+)/)||[])[1],
      code: x.innerText}))
})

component('localHelper.openDialogInIframe', {
  type: 'action<>',
  impl: renderDialogInIframe({
    dialog: inPlaceDialog('LLM Helper', llm.docHelper('%$llmDocExample%'), {
      style: inIframe.Floating('helper', { width: '460', height: '600' })
    }),
    sourceCode: plugins('llm')
  })
})

component('localHelper.runHelperAction', {
  type: 'action<>',
  params: [
    {id: 'actionStr', as: 'string'}
  ],
  impl: (ctx,actionStr) => {
      const toRun = `${actionStr.split(' ')[0]}('${actionStr.split(' ')[1] || ''}')`
      const {res} = jb.tgpTextEditor.evalProfileDef('', `typeAdapter('helper-action<llm>',${toRun})`, 'llm', 'llm')
      const profile = jb.utils.resolveProfile(res)
      return profile && ctx.run(profile,'helper-action<llm>')
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
      jb.exec(writeValue('%$llmStateForTests/prompt%',prompt))
    }
})