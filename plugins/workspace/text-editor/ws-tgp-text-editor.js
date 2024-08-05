using('ui-misc','ui-styles','workspace-ui','workspace-core','tgp-lang-server')

extension('workspace', 'textEditor', {
  $requireLibs: ['/dist/fuse.js']
})

component('workspace.currentTextEditor', {
  impl: workspace.textEditor(workspace.activeDocContentRef(), workspace.activeUri())
})

component('workspace.textEditor', {
  type: 'control',
  params: [ 
    {id: 'docContent', as: 'ref'},
    {id: 'docUri', as: 'string'},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: 700}
  ],
  impl: editableText('edit %$docUri%', '%$docContent%', {
    style: editableText.codemirror({ height: '%$height%', mode: 'javascript', lineNumbers: true, maxLength: -1 }),
    features: [
      id('activeEditor'),
      workspace.editorFontCss(),
      workspace.visitCountCss(),
      frontEnd.var('docUri', '%$docUri%'),
      frontEnd.var('initCursorPos', () => jb.path(jb.workspace.openDocs[jb.workspace.activeUri],'selection.start') || {line:0, col: 0}),
      variable('editorCmpId', '%$cmp/cmpId%'),
      frontEnd.init(({},{cmp, initCursorPos}) => cmp.editor && cmp.editor.setCursor(initCursorPos.line, initCursorPos.col)),
      frontEnd.flow(
        source.codeMirrorCursor(),
        sink.BEMethod('selectionChanged', '%%')
      ),
      feature.onKey('Ctrl-I', runActions(
        Var('visitCountOverlay', langServer.calcProbeOverlay(probeVisitCount()), { async: true }),
        runFEMethodFromBackEnd({ method: 'applyOverlay', Data: '%$visitCountOverlay%' })
      )),
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
          content: workspace.floatingCompletions(),
          style: workspace.popup(),
          id: 'floatingCompletions',
          features: [
            autoFocusOnFirstInput(),
            nearLauncherPosition('%left%', plus(20, '%top%'), { insideLauncher: true })
          ]
        })
      )),
      method('selectionChanged', workspace.selelctionChanged('%%', '%$docUri%')),
      feature.byCondition('%$height%', css.height('%$height%', { minMax: 'max' }), null),
      workspace.compOverlay()
    ]
  })
})

component('workspace.floatingCompletions', {
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

component('workspace.initCompletionOptions', {
  type: 'data',
  impl: async (ctx) => {
      const {items, paramDef, title } = await jb.langService.completionItems(ctx)
      const keys = ['label',  { name: 'detail', weight: 0.5 } ]
      const _items = items.filter(x=>x.kind != 25)
      return { items: _items, fuse: new jb.frame.Fuse(_items,{keys}), paramDef, title }
  }
})
component('workspace.filterCompletionOptions', {
  type: 'picklist.options',
  params: [
    {id: 'input', defaultValue: '%%'}
  ],
  impl: (ctx, input) => {
    const query = jb.val(input)
    const {fuse, items} = ctx.vars.completions
    const options = query ? fuse.search(query).map(({refIndex,item})=> ({refIndex, text: item.label})) 
      : items.map((item,i) => ({refIndex:i, text: item.label }))
    jb.log('workspace completionOptions',{ctx, query, options})
    return options
  }
})

