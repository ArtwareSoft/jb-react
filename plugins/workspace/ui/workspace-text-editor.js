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
    style: editableText.codemirror({ height: '%$height%', mode: 'javascript', maxLength: -1 }),
    features: [
      id('activeEditor'),
      workspace.editorFontCss(),
      workspace.visitCountCss(),
      frontEnd.var('docUri', '%$docUri%'),
      frontEnd.var('initCursorPos', () => jb.path(jb.workspace.openDocs[jb.workspace.activeUri],'selection.start') || {line:0, col: 0}),
      variable('codeMirrorCmp', '%$cmp%'),
      frontEnd.init(({},{cmp, initCursorPos}) => cmp.editor && cmp.editor.setCursor(initCursorPos.line, initCursorPos.col)),
      frontEnd.flow(
        source.codeMirrorCursor(),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('selectionChanged', '%%')
      ),
      feature.onKey('Ctrl-I', runActions(
        Var('compProps', langService.calcCompProps(), { async: true }),
        Var('probeRes', langServer.probe('%$compProps%'), { async: true }),
        Var('visitCountOverlay', tgpTextEditor.visitCountOverlay('%$probeRes%', '%$compProps%')),
        runFEMethodFromBackEnd({ selector: '#activeEditor', method: 'applyOverlay', Data: '%$visitCountOverlay%' })
      )),
      frontEnd.flow(
        source.frontEndEvent('keydown'),
        rx.filter(key.match('Ctrl+Space')),
        rx.userEventVar(),
        rx.var('offsets', ({},{cmp}) => cmp.editor && cmp.editor.charCoords(cmp.editor.getCursor(), "local")),
        sink.BEMethod('openPopup', '%$offsets%', obj(prop('ev', '%$ev%')))
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
      workspace.tgpPathOverlay()
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
      editableText('%$completions/title%', '%$text%', {
        style: underline(),
        features: [
          editableText.picklistHelper({
            options: workspace.filterCompletionOptions(),
            picklistStyle: workspace.completions(),
            //picklistFeatures: picklist.allowAsynchOptions(),
            popupFeatures: css('margin-top: -5px'),
            showHelper: true,
            autoOpen: true,
            onEnter: runActions(
              dialog.closeDialogById('floatingCompletions'),
              workspace.applyCompChange(),
              codeMirror.regainFocus('%$codeMirrorCmp/cmpId%')
            ),
            onEsc: runActions(
              dialog.closeDialogById('floatingCompletions'),
              codeMirror.regainFocus('%$codeMirrorCmp/cmpId%')
            )
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

component('workspace.applyCompChange', {
  type: 'action',
  params: [
    {id: 'option', defaultValue: '%$selectedOption%'}
  ],
  impl: (ctx,option) => jb.tgpTextEditor.applyCompChange(ctx.vars.completions.items[jb.val(option).refIndex], {ctx})
})

component('workspace.tgpPathOverlay', {
  type: 'feature',
  impl: features(
    frontEnd.method('applyProbeResOnCode', (ctx,{cmp}) => {
      debugger
        const {id, baseStyle,tgpPathToStyle,actionMap} = ctx.data
        const baseClassName = `overlay-${id}-base`
        const tgpPaths = jb.utils.unique(actionMap.map(x=>x.action.split('!').pop()))

        const styleElement = document.createElement('style');
        styleElement.id = `overlay-${id}`
        styleElement.textContent = tgpPaths.map(path=>`.overlay-${id}-${classNameOfPath(path)} { ${tgpPathToStyle(ctx.setData(path))} }`).join('\n')
        document.head.appendChild(styleElement)

        cmp.overlays = cmp.overlays || {}
        cmp.overlays[id] = { token: (stream, state) => {
                state.token(stream, state) // Advance the stream to the end of the token
                const line = stream.lineOracle.line
                const col = stream.start
                const tgpPath = tgpPathAtPos({line, col})
                return tgpPath ? [baseClassName,`overlay-${id}-${classNameOfPath(tgpPath)}`].join(' ') : null
            }
        }
        editor.addOverlay(cmp.overlays[id])
        
        function classNameOfPath(path) {
            return path.replace(/[<>]/g,'_').replace(/[~\.<>]/g,'-').replace(/-[-]+/g,'-')
        }
    }),
    frontEnd.method('removeOverlay', ({data},{cmp}) => {
        const id = data
        cmp.editor.removeOverlay(cmp.overlays[id])
        document.getElementById(`overlay-${id}`).remove()
    })
  )
})

component('tgpTextEditor.probeResOverlay', {
  params: [
    {id: 'id', as: 'string'},
    {id: 'probeRes', as: 'object', byName: true},
    {id: 'compProps', as: 'object'},
    {id: 'baseStyle', as: 'object', description: 'for style.after' },
    {id: 'tgpPathToStyle', dynamic: true, as: 'object'}
  ],
  impl: pipeline(Var('id','%$id%'), Var('fromLine', '%$compProps/line%'))
})

// applyOverlay(id, fromLine, toLine, classMap: { [pos: {line,col}, 'className className'] }, cssStyle: {[class]: css} )

component('tgpTextEditor.visitCountOverlay', {
  params: [
    {id: 'probeRes', as: 'object'},
    {id: 'compProps', as: 'object'}
  ],
  impl: tgpTextEditor.probeResOverlay('visitCount', {
    probeRes: '%$probeRes%',
    compProps: '%$compProps%',
    baseStyle: asIs({
        position: 'absolute',
        bottom: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        borderRadius: '50%',
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center',
        fontSize: '12px'
    }),
    tgpPathToStyle: obj(prop('contentText', '%$visitCount[{%$tgpPath%}]%'))
  })
})