using('ui,probe-preview')

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
            sink.action(runFEMethod('#activeEditor', 'setSelectionRange', { data: '%%' }))
          ),
          followUp.flow(
            source.callbag(() => jb.workspace.applyEditRequest),
            sink.action(runFEMethod('#activeEditor', 'applyEdit', { data: '%%' }))
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

component('workspace.selelctionChanged', {
  type: 'action',
  params: [
    {id: 'selection'},
    {id: 'docUri', as: 'string'}
  ],
  impl: runActions(
    Var('editorPath', ({},{},{docUri, selection}) => {
            jb.workspace.activeUri = docUri
            jb.workspace.openDocs[jb.workspace.activeUri].activeSelection = selection
            return jb.workspace.calcActiveTextEditorPath()
        }),
    writeValue('%$probe/path%', '%$editorPath/path%'),
    writeValue('%$workspace/offset%', '%$editorPath/offset%'),
    writeValue('%$workspace/relevant%', '%$editorPath/relevant%'),
    writeValue('%$workspace/semanticPath%', '%$editorPath/semanticPath/path%'),
    writeValue('%$workspace/selectedPath%', '%$editorPath/path%'),
    writeValue('%$workspace/probeCircuit%', remote.data(probe.calcCircuitPath('%$editorPath/path%'), probePreviewWorker()))
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
      dialogFeature.nearLauncherPosition({
        offsetLeft: ({},{ev}) => ev.clientRect.width / 120 * (jb.workspace.activeTextEditor.selection.active().col +1),
        offsetTop: ({},{ev}) => -1 * ev.clientRect.height + ev.clientRect.height / 15 * (jb.workspace.activeTextEditor.selection.active().line+1)
      })
    ]
  })
})

component('workspace.textEditor', {
  type: 'control',
  params: [
    {id: 'docContent', as: 'string'},
    {id: 'docUri', as: 'string'},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'codeMirror', as: 'boolean', type: 'boolean'},
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: text('%$docContent%', {
    style: If('%$codeMirror%', text.codemirror({ height: '%$height%' }), text.textarea(20)),
    features: [
      id('activeEditor'),
      frontEnd.var('docUri', '%$docUri%'),
      variable('popupLauncherCanvas', '%$cmp%'),
      feature.byCondition('%$codeMirror%', codemirror.initTgpTextEditor(), textarea.initTgpTextEditor()),
      feature.onKey('Ctrl-Enter', action.runBEMethod('onEnter')),
      method('onEnter', ctx => jb.workspace.onEnter(ctx)),
      method('selectionChanged', workspace.selelctionChanged('%%', '%$docUri%')),
      method('contentChanged', (ctx,{},{docUri}) => jb.workspace.contentChanged(ctx.data,docUri,ctx)),
      feature.byCondition(
        '%$height%',
        css.height('%$height%', { minMax: 'max' }),
        null
      )
    ]
  })
})

component('textarea.initTgpTextEditor', {
  type: 'feature',
  impl: features(
    textarea.enrichUserEvent(),
    frontEnd.method('applyEdit', ({data},{docUri, el}) => {
            const {edits, uri} = data
            if (uri != docUri) return
            ;(edits || []).forEach(({text, from, to}) => {
                el.value = el.value.slice(0,from) + text + el.value.slice(to)
                el.setSelectionRange(from,from)
            })
        }),
    frontEnd.method('setSelectionRange', ({data},{docUri, el}) => {
            const {uri, from, to} = data || {}
            if (uri != docUri) return
            if (!from) 
                return jb.logError('tgpTextEditor setSelectionRange empty offset',{data ,el})
            jb.log('tgpTextEditor selection set to', {data})
            el.setSelectionRange(from,to || from)
        }),
    frontEnd.flow(
      source.event('selectionchange', () => jb.frame.document),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.filter(({},{el}) => el == jb.path(jb.frame.document,'activeElement')),
      rx.map(({},{el}) => jb.tgpTextEditor.offsetToLineCol(el.value,el.selectionStart)),
      sink.BEMethod('selectionChanged', '%%')
    ),
    frontEnd.flow(
      source.frontEndEvent('keyup'),
      rx.map(({},{el}) => el.value),
      rx.distinctUntilChanged(),
      sink.BEMethod('contentChanged', '%%')
    )
  )
})

component('codemirror.initTgpTextEditor', {
  type: 'feature',
  impl: features(
    codemirror.enrichUserEvent(),
    frontEnd.method('replaceRange', ({data},{cmp}) => {
        const {text, from, to} = data
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = jb.tgpTextEditor.lineColToOffset(cmp.base.value,to)
        cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
    }),
    frontEnd.method('setSelectionRange', ({data},{cmp}) => {
        const from = data.from || data
        const to = data.to || from
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = to && jb.tgpTextEditor.lineColToOffset(cmp.base.value,to) || _from
        cmp.base.setSelectionRange(_from,_to)
    }),
    frontEnd.flow(
      source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('cursorActivity', 
        () => obs(cmp.editor.getDoc().getCursor())))),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.debounceTime('%$debounceTime%'),
      sink.BEMethod('selectionChanged', '%%')
    ),
    frontEnd.flow(
      source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('change', () => obs(cmp.editor.getValue())))),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.debounceTime('%$debounceTime%'),
      rx.distinctUntilChanged(),
      sink.BEMethod('contentChanged', '%%')
    )
  )
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

