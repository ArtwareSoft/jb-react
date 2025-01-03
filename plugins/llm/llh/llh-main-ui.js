using('ui-misc','tgp-text-editor','ui-styles','ui-tree','markdown-editor','ui-iframe-dialog','ui-mdc-styles')

component('helperData', { watchableData: {
  workingArea: {from: { line: 1, col: 0}, to : {line:3, col: 0}}, prompts: [{text: 'prompt1'},{text: 'prompt2'}], tasks: []
}
})

component('llh.targetDoc' ,{
  impl: workspace.documentRef({ docUri: 'targetDoc', initialContent: `line1\nline2\nline3` })
})

component('llh.workingArea' ,{
  impl: workspace.documentSectionRef({ docUri: 'targetDoc', from: '%$helperData/workingArea/from%', to: '%$helperData/workingArea/to%' })
})

component('llh.commandBar', {
  type: 'control<>',
  impl: group({
    controls: [
      editableText('enter command', '%$command/cmd%', {
        style: editableText.mdcInput('420'),
        features: features(
          feature.onKey('Enter', llh.runHelperAction('%$ev/value%')),
          editableText.picklistHelper({
            options: picklist.optionsByComma('1111,2,3,4'),
            popupFeatures: [
              css.padding({ left: '10', right: '10' })
            ]
          })
        )
      })
    ],
    layout: layout.flex({ justifyContent: 'space-between' }),
    features: [
      watchable('command', obj(prop('cmd', '')))
    ]
  })
})

component('llh.main', {
  type: 'control<>',
  impl: group(
    llh.promptEditor(),
    group({
      controls: [
        markdown.editor(llh.targetDoc(), 'all document', { simplemdeSettings: {toolbar: [
          {
            name: "bold",
            className: "fa fa-scissors",
            title: "Bold",
            default: true
          },
          {
            name: "italic",
            className: "fa fa-italic",
            title: "Italic",
            default: true
          }
        ]
        }}),
        markdown.editor(llh.workingArea(), 'working area')
      ],
      title: 'document',
      style: group.tabs(),
      features: features(css.border({ width: '2', side: 'top', color: 'var(--jb-menubar-selection-bg)' }))
    })
  )
})

component('llh.prompts', {
  type: 'control',
  params: [
    {id: 'doc', as: 'ref', defaultValue: '%$helperDoc%'}
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
            features: features(field.columnWidth(800), css('> .CodeMirror {background: lightgoldenrodyellow;}'))
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
      button('add prompt', addToArray('%$doc/prompts%', { toAdd: obj(prop('text', 'prompt text')) }), {
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


