using('ui-misc','tgp-text-editor','ui-styles','ui-tree','markdown-editor','ui-iframe-dialog','ui-mdc-styles')
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
    ]
  })
})

//       frontEnd.requireExternalLibrary('../bin/studio/css/studio-all.css'),

component('llm.docHelper', {
  type: 'control<>',
  impl: group(
    llm.commandBar(),
    group({
      controls: [
        llm.prompts(),
        markdown.editor('%$llmDocExample/content%', 'all document'),
        markdown.editor('%$llmDocExample/section%', 'working area'),
        markdown.editor('%$llmDocExample/outline%', 'outline')
      ],
      title: 'document',
      style: group.tabs(),
      features: features(css.border('2', 'top', { color: 'var(--jb-menubar-selection-bg)' }))
    })
  )
})

component('llm.prompts', {
  type: 'control',
  params: [
    {id: 'doc', as: 'ref', defaultValue: '%$llmDocExample%'}
  ],
  impl: group({
    controls: [
      table({
        items: '%$doc/prompts%',
        controls: [
          text('Ctrl+%$index%', 'shortCut', {
            features: [
              itemlist.dragHandle(),
              field.columnWidth(60),
              css.width('20px')
            ]
          }),
          editableText('prompt', '%text%', {
            style: editableText.codemirror({ height: '60', mode: 'text' }),
            features: field.columnWidth(800)
          }),
          button({
            action: removeFromArray('%$doc/prompts%', '%%'),
            style: button.x('21'),
            features: [
              itemlist.shownOnlyOnItemHover(),
              field.columnWidth(60)
            ]
          })
        ],
        style: table.mdc(false),
        features: [
          watchRef('%$doc/prompts%', { includeChildren: 'structure', allowSelfRefresh: true }),
          itemlist.dragAndDrop(),
          itemlist.keyboardSelection(),
          itemlist.selection()
        ]
      }),
      button({
        title: 'add prompt',
        action: addToArray('%$doc/prompts%', { toAdd: obj(prop('text', 'prompt text')) }),
        style: button.mdcIcon(),
        raised: 'true',
        features: [
          id('add-prompt'),
          css.width('200'),
          css.margin('10'),
          feature.icon('Plus', { position: 'raised', type: 'mdi' })
        ]
      })
    ],
    title: 'prompts'
  })
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