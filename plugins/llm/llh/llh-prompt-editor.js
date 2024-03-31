using('workspace-ui','workspace-core')

component('llh.myPrompt', {
  impl: llh.prompt()
})

component('llh.initPromptEditor', {
  type: 'feature<>',
  impl: group.wait(typeAdapter('action<>', workspace.initAsHost('/plugins/llm/llh/llh-prompt-editor.js', {
    line: 1,
    col: 47,
    docText: `component('llh.myPrompt', {\n  impl: llh.prompt()\n})`
  })))
})

component('llh.promptEditor', {
  type: 'control',
  params: [
    {id: 'docContent', as: 'ref', type: 'data<>', dynamic: true, defaultValue: {$: 'workspace.activeDocContentRef'}},
    {id: 'docUri', as: 'string', type: 'data<>', dynamic: true, defaultValue: {$: 'workspace.activeUri'}},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 50}
  ],
  impl: group({
    controls: editableText('edit prompt', '%$docContent()%', {
      style: editableText.codemirror({ height: '%$height%', mode: 'javascript', lineNumbers: true, maxLength: -1 }),
      features: [
        id('promptEditor'),
        workspace.editorFontCss(),
        variable('editorCmpId', '%$cmp/cmpId%'),
        codemirror.enrichUserEvent(),
        frontEnd.flow(
          source.frontEndEvent('keydown'),
          rx.filter(key.match('Ctrl+Space')),
          rx.userEventVar(),
          sink.BEMethod('openPopup', '%$ev/cursorOffset%', obj(prop('ev', '%$ev%')))
        ),
        method('openPopup', runActions(
          Var('completions', workspace.initCompletionOptions(), { async: true }),
          openDialog({
            content: llh.floatingCompletions(),
            style: workspace.popup(),
            id: 'floatingCompletions',
            features: [
              autoFocusOnFirstInput(),
              nearLauncherPosition('%left%', plus(20, '%top%'), { insideLauncher: true })
            ]
          })
        )),
        frontEnd.flow(source.codeMirrorCursor(), sink.BEMethod('selectionChanged', '%%')),
        method('selectionChanged', workspace.selelctionChanged('%%', '%$docUri()%'))
      ]
    }),
    features: llh.initPromptEditor()
  })
})

component('llh.floatingCompletions', {
  type: 'control<>',
  impl: group({
    controls: [
      editableText('%$completions/title%', '%$text%', {
        style: underline(),
        features: [
          editableText.picklistHelper({
            options: workspace.filterCompletionOptions(),
            picklistStyle: workspace.completions(),
            popupFeatures: css('margin-top: -5px'),
            showHelper: true,
            autoOpen: true,
            onEnter: runActions(
              Var('completionItem', '%$completions/items/{%$selectedOption/refIndex%}%'),
              Var('editAndCursor', langService.editAndCursorOfCompletionItem('%$completionItem%')),
              tgpTextEditor.applyCompChange('%$editAndCursor%'),
              dialog.closeDialogById('floatingCompletions'),
              codeMirror.regainFocus('%$editorCmpId%')
            ),
            onEsc: runActions(dialog.closeDialogById('floatingCompletions'), codeMirror.regainFocus('%$editorCmpId%'))
          })
        ]
      })
    ],
    layout: layout.vertical(),
    features: [
      css.width('300'),
      watchable('text', '')
    ]
  })
})
