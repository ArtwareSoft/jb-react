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
      variable('codeMirrorCmp', '%$cmp%'),
      frontEnd.init(({},{cmp, initCursorPos}) => cmp.editor && cmp.editor.setCursor(initCursorPos.line, initCursorPos.col)),
      frontEnd.flow(
        source.codeMirrorCursor(),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('selectionChanged', '%%')
      ),
      feature.onKey('Ctrl-I', runActions(
        Var('visitCountOverlay', langServer.calcProbeOverlay(probeVisitCount()), { async: true }),
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
      workspace.compOverlay()
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

component('workspace.compOverlay', {
  type: 'feature',
  impl: features(
    frontEnd.method('applyOverlay', (ctx,{cmp}) => {
      const { id, compId, cssClassDefs, compTextHash, fromLine, toLine } = ctx.data
      if (!cmp.editor) return
      const styleElement = document.createElement('style');
      styleElement.id = `cm-overlay-${id}`
      styleElement.textContent = cssClassDefs.map(x => asStyleDef(x)).join('\n')
      document.head.appendChild(styleElement)
      const baseClass = cssClassDefs.filter(({base}) => base).map(({clz})=>clz)[0]

      let lineTokens = null, currLine = 0, token = null, inToken = false
      cmp.overlays = cmp.overlays || {}
      cmp.overlays[id] = {
        token: stream => {
          const newLine = currLine != stream.lineOracle.line
          currLine = stream.lineOracle.line
          if (currLine < fromLine || currLine > toLine) {
            stream.skipToEnd()
            return
          }
          if (newLine) {
            lineTokens = cssClassDefs.filter(({line}) => line == currLine - fromLine)
            inToken = false
            token = lineTokens.shift()
          }
          if (inToken) {
            const clz = token.clz
            eat(stream, token.toCol- token.fromCol)
            token = lineTokens.shift()
            inToken = false
            return `${baseClass} ${clz}`
          } else {
            if (!token) {
              stream.skipToEnd()
              return
            }
            eat(stream, token.fromCol - stream.start)
            inToken = true
            return
          }
        }
      }
      cmp.editor.addOverlay(cmp.overlays[id])

      function eat(stream,num) {
        for(let i=0;i<num;i++) stream.next()
      }
      
      function asStyleDef({clz, style}) {
        return style.after 
          ? `.cm-${clz}::after {\n${Object.entries(style.after).map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join('\n')}}`
          : `.cm-${clz} {\n${Object.entries(style).map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join('\n')}}`
      }
      function checkHash() {
        const compTextInDoc = cmp.editor.getValue().split('\n').slice(fromLine,toLine).join('\n')
        const currentHash = jb.tgpTextEditor.calcHash(compTextInDoc)
        if (currentHash != compTextHash)
          return jb.logError('add overlay comp hash mismatch',{ctx})        
      }
    }),
    frontEnd.method('removeOverlay', ({data},{cmp}) => {
        const id = data
        cmp.editor.removeOverlay(cmp.overlays[id])
        document.getElementById(`overlay-${id}`).remove()
        delete cmp.overlays[id]
    })
  )
})
