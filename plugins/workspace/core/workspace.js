
extension('workspace', 'core', {
	$phase: 50,
    initExtension() { 
        const gotoPathRequest = jb.callbag.subject()
        //jb.utils.subscribe(jb.watchableComps.source, e => jb .workspace.applyDeltaFromStudio(e))
        //jb.utils.subscribe(gotoPathRequest, e => jb .tgpTextEditor.gotoPath(e))

        return {
            onSaveDoc: jb.callbag.subject(),
            onOpenDoc: jb.callbag.subject(),
            onChangeSelection: jb.callbag.subject(),
            gotoOffsetRequest: jb.callbag.subject(),
            applyEditRequest: jb.callbag.subject(),
            gotoPathRequest,

            openDocs: {},
            activeUri: ''
    }},
    initJbWorkspaceAsHost() {
        if (jb.path('jb.tgpTextEditor.host.type') == 'jbWorkspace') return
        jb.tgpTextEditor.host = {
            type: 'jbWorkspace',
            async applyEdit(edit,{uri, ctx, tgpPathsForLines} = {}) {
                const docUri = uri || jb.workspace.activeUri
                const docText = jb.workspace.openDocs[docUri].text
                const from = jb.tgpTextEditor.lineColToOffset(docText, edit.range.start)
                const to = jb.tgpTextEditor.lineColToOffset(docText,edit.range.end)
                const newText = jb.workspace.openDocs[docUri].text = docText.slice(0,from) + edit.newText + docText.slice(to)
                jb.tgpTextEditor.lastEditForTester = { edit , uri }
                ctx && ctx.runAction({ $: 'runFEMethodFromBackEnd', selector: '#activeEditor', method: 'setText', Data: { $asIs: newText} })
                //ctx && ctx.runAction({ $: 'runFEMethodFromBackEnd', selector: '#activeEditor', method: 'updateTgpPathClasses', Data: { $asIs: tgpPathsForLines }})
            },
            getActiveDoc: () => jb.workspace.openDocs[jb.workspace.activeUri],
            selectRange(start,{end, ctx} = {}) {
                end = end || start
                jb.workspace.openDocs[jb.workspace.activeUri].selection = { start, end: end || start }
                jb.tgpTextEditor.host.selectionSource.next({start,end})
                ctx && ctx.runAction({$: 'runFEMethodFromBackEnd', selector: '#activeEditor', method: 'selectRange', Data: {start, end}})
            },
            compTextAndCursor() {
                const doc = jb.workspace.openDocs[jb.workspace.activeUri]
                return jb.tgpTextEditor.closestComp(doc.text, doc.selection.start.line, doc.selection.start.col, jb.workspace.activeUri)                
            },
            async execCommand(cmd) {
                //console.log('exec command', cmd)
            },
            async saveDoc() {
            },
            initDoc(uri,text, selection = { start:{line:0,col:0}, end:{line:0,col:0} }) {
                jb.workspace.openDocs[uri] = { text, selection}
                jb.workspace.activeUri = uri
            },
            selectionSource: jb.callbag.subject(),
            async getTextAtSelection() {
                const selection = jb.workspace.openDocs[jb.workspace.activeUri].selection
                const docText = jb.workspace.openDocs[jb.workspace.activeUri].text
                const from = jb.tgpTextEditor.lineColToOffset(docText, selection.start)
                const to = jb.tgpTextEditor.lineColToOffset(docText, selection.start)
                return docText.slice(from,to)
            },
            log(arg) { jb.log(arg,{})},
            async gotoFilePos(path,line,col) {},
            overlayActionMap: ({id, baseStyle,tgpPathToStyle,actionMap,ctx}) => ({
              apply: () => ctx.runAction({$: 'runFEMethodFromBackEnd', selector: '#activeEditor', method: 'applyOverlay', Data: {id, baseStyle,tgpPathToStyle,actionMap}}),
              remove: () => ctx.runAction({$: 'runFEMethodFromBackEnd', selector: '#activeEditor', method: 'removeOverlay', Data: id })
            })
        }
    }
})

component('workspace.initAsHost', {
  type: 'action<>',
  params: [
    {id: 'docUri', as: 'string'},
    {id: 'line', as: 'number', byName: true},
    {id: 'col', as: 'number'},
  ],
  impl: async (ctx,docUri,line,col) => {
      jb.workspace.initJbWorkspaceAsHost()
      const docContent = await jbHost.codePackageFromJson().fetchFile(docUri)
      //(await jbHost.fetch(docUri)).text()
      jb.tgpTextEditor.host.initDoc(docUri,docContent)
      const doc = jb.workspace.openDocs[jb.workspace.activeUri]
      doc.selection = { start : { line, col }, end: { line, col}}
  }
})

component('workspace.activeUri', {
  type: 'data<>',
  impl: () => jb.workspace.activeUri
})

component('workspace.activeDocContentRef', {
  type: 'data<>',
  impl: () => jb.db.objectProperty(jb.workspace.openDocs[jb.workspace.activeUri], 'text')
})

component('workspace.selelctionChanged', {
  type: 'action',
  params: [
    {id: 'selection'},
    {id: 'docUri', as: 'string'}
  ],
  impl: (ctx,{line, col },docUri) => {
      jb.workspace.activeUri = docUri
      const doc = jb.workspace.openDocs[jb.workspace.activeUri]
      doc.selection = { start : { line, col }, end: { line, col}}
  }
})