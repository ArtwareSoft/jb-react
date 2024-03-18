using('ui-tree','ui-misc','ui-styles','probe-preview','workspace-core','tgp-lang-service')

component('workspace', { watchableData: { bottomViewIndex : 0 } })

component('workspace.IDE', {
  type: 'control',
  params: [
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: group({
    controls: [
      group({
        controls: dynamicControls({
          controlItems: () => Object.keys(jb.workspace.openDocs),
          genericControl: group(workspace.textEditor(({},{docUri}) => jb.workspace.openDocs[docUri].text, '%$docUri%'), {
            title: pipeline('%$docUri%', suffix('/'))
          }),
          itemVariable: 'docUri'
        }),
        style: group.tabs(),
        features: [
          followUp.watchObservable(() => jb.workspace.onOpenDoc),
          followUp.flow(
            source.callbag(() => jb.workspace.gotoOffsetRequest),
            sink.action(runFEMethodFromBackEnd('#activeEditor', 'setSelectionRange', { data: '%%' }))
          ),
          followUp.flow(
            source.callbag(() => jb.workspace.applyEditRequest),
            sink.action(runFEMethodFromBackEnd('#activeEditor', 'applyEdit', { data: '%%' }))
          )
        ]
      }),
      remote.widget(probe.inOutView(), probePreviewWorker())
    ],
    features: [
      css.height('%$height%', { minMax: 'max' }),
      group.wait(jbm.start(probePreviewWorker()))
    ]
  })
})

component('workspace.views', {
  type: 'control',
  params: [
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: group(group(probe.inOutView(), { title: 'preview' }))
})

component('workspace.openDoc', {
  type: 'action',
  params: [
    {id: 'docUri', as: 'string'}
  ],
  impl: ({},docUri) => jb.workspace.openDoc(docUri)
})

component('textarea.enrichUserEvent', {
  type: 'feature',
  params: [
    {id: 'textEditorSelector', as: 'string', description: 'used for external buttons'}
  ],
  impl: features(
    frontEnd.var('textEditorSelector', '%$textEditorSelector%'),
    frontEnd.enrichUserEvent((ctx,{cmp,textEditorSelector}) => {
        const elem = textEditorSelector ? jb.ui.widgetBody(ctx).querySelector(textEditorSelector) : cmp.base
        if (elem instanceof jb.ui.VNode)
          return { selectionStart: jb.path(elem, '_component.state.selectionRange.from') }
        return elem && {
            outerHeight: jb.ui.outerHeight(elem), 
            outerWidth: jb.ui.outerWidth(elem), 
            clientRect: elem.getBoundingClientRect(),
            text: elem.value,
            selectionStart: jb.tgpTextEditor.offsetToLineCol(elem.value,elem.selectionStart)
        }
    })
  )
})

component('workspace.openQuickPickMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: menu.openContextMenu('%$menu()%', {
    features: [
      nearLauncherPosition({
        offsetLeft: ({},{ev}) => ev.clientRect.width / 120 * (jb.workspace.activeTextEditor.selection.active().col +1),
        offsetTop: ({},{ev}) => -1 * ev.clientRect.height + ev.clientRect.height / 15 * (jb.workspace.activeTextEditor.selection.active().line+1)
      })
    ]
  })
})

component('workspace.currentTextEditor', {
  impl: group(workspace.textEditor('%$docContent%', workspace.activeUri()), {
    features: watchable('docContent', pipeline(workspace.activeDocContent(), '%text%', first()))
  })
})

component('workspace.textEditor', {
  type: 'control',
  params: [
    {id: 'docContent', as: 'ref'},
    {id: 'docUri', as: 'string'},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: editableText('edit %$docUri%', '%$docContent%', {
    style: editableText.codemirror({ height: '%$height%', mode: 'javascript' }),
    features: [
      id('activeEditor'),
      frontEnd.var('docUri', '%$docUri%'),
      frontEnd.var('initCursorPos', () => jb.path(jb.workspace.openDocs[jb.workspace.activeUri],'selection.start') || {line:0, col: 0}),
      variable('popupLauncherCanvas', '%$cmp%'),
      frontEnd.init(({},{cmp, initCursorPos}) => cmp.editor && cmp.editor.setCursor(initCursorPos.line, initCursorPos.col)),
      frontEnd.flow(
        source.codeMirrorCursor(),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('selectionChanged', '%%')
      ),
      frontEnd.flow(
        source.frontEndEvent('keydown'),
        rx.filter(key.match('Ctrl+Space')),
        rx.userEventVar(),
        rx.var('offsets', ({},{cmp}) => cmp.editor && cmp.editor.charCoords(cmp.editor.getCursor(), "local")),
        sink.BEMethod('openPopup', '%$offsets%', obj(prop('ev', '%$ev%')))
      ),
      method('openPopup', openDialog({
        content: workspace.floatingCompletions(),
        style: workspace.popup(),
        id: 'floatingCompletions',
        features: [
          autoFocusOnFirstInput(),
          nearLauncherPosition('%left%', '%top%', { insideLauncher: true })
        ]
      })),
      method('selectionChanged', workspace.selelctionChanged('%%', '%$docUri%')),
      feature.byCondition('%$height%', css.height('%$height%', { minMax: 'max' }), null)
    ]
  })
})

component('workspace.floatingCompletions', {
  type: 'control<>',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        controls: [
          editableText('', '%$text%', {
            updateOnBlur: true,
            style: editableText.floatingInput(),
            features: [
              watchRef(tgp.ref('%$path%'), { strongRefresh: true }),
              feature.onKey('Right', suggestions.applyOption({ addSuffix: '/' })),
              feature.onKey('Enter', runActions(
                suggestions.applyOption(),
                dialog.closeDialogById('floatingCompletions'),
                popup.regainCanvasFocus()
              )),
              feature.onKey('Esc', runActions(dialog.closeDialogById('floatingCompletions'), popup.regainCanvasFocus())),
              editableText.picklistHelper({
                options: workspace.completionOptions(),
                picklistStyle: workspace.completions(),
                picklistFeatures: picklist.allowAsynchOptions(),
                showHelper: true,
                autoOpen: true
              }),
              css.width('100%'),
              css('~ input { padding-top: 30px !important}')
            ]
          }),
          text(pipeline(tgp.paramDef('%$path%'), '%description%'), { features: css('color: grey') })
        ],
        layout: layout.vertical(),
        features: css.width('100%')
      })
    ],
    layout: layout.horizontal({ spacing: '20' }),
    features: [
      watchable('text', ''),
      variable('completions', obj()),
      css.padding({ left: '4', right: '4' }),
      css.width('500')
    ]
  })
})

component('workspace.completionOptions', {
  type: 'picklist.options',
  params: [
    {id: 'input', defaultValue: '%%'}
  ],
  impl: async (ctx, input) => {
    const { completions } = ctx.vars
    const items = completions.resolvedItems || (completions.resolvedItems = await jb.langService.completionItems(ctx))
    const val = jb.val(input)
    return { options: items.map((item,i)=>({i, code: item.label, text: item.label})).filter(({text})=> text.indexOf(val) != -1) }
  }
})
