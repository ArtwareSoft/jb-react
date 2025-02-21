
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
        if (jb.path(jb.tgpTextEditor,'host.type') == 'jbWorkspace') return
        jb.tgpTextEditor.host = {
            type: 'jbWorkspace',
            async applyEdit(edit,{docUri, ctx} = {}) {
                const _docUri = docUri || jb.workspace.activeUri
                const docText = jb.workspace.openDocs[_docUri].text
                const from = jb.tgpTextEditor.lineColToOffset(docText, edit.range.start)
                const to = jb.tgpTextEditor.lineColToOffset(docText,edit.range.end)
                const newText = jb.workspace.openDocs[_docUri].text = docText.slice(0,from) + edit.newText + docText.slice(to)
                jb.tgpTextEditor.lastEditForTester = { edit }
                if (jb.path(ctx,'vars.editorCmpId') && !jb.path(ctx,'vars.doNotRefreshEditor')) {
                  const selector = `[cmp-id="${ctx.vars.editorCmpId}"]`
                  ctx.runAction({ $: 'runFEMethodFromBackEnd', selector, method: 'setText', Data: { $asIs: newText} })
                }
            },
            getActiveDoc: () => jb.workspace.openDocs[jb.workspace.activeUri],
            selectRange(start,{end, ctx} = {}) {
                end = end || start
                jb.workspace.openDocs[jb.workspace.activeUri].selection = { start, end: end || start }
                if (jb.path(ctx,'vars.editorCmpId') && !jb.path(ctx,'vars.doNotRefreshEditor')) {
                  const selector = `[cmp-id="${ctx.vars.editorCmpId}"]`
                  ctx.runAction({$: 'runFEMethodFromBackEnd', selector, method: 'selectRange', Data: {start, end}})
                }
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
            async getTextAtSelection() {
                const selection = jb.workspace.openDocs[jb.workspace.activeUri].selection
                const docText = jb.workspace.openDocs[jb.workspace.activeUri].text
                const from = jb.tgpTextEditor.lineColToOffset(docText, selection.start)
                const to = jb.tgpTextEditor.lineColToOffset(docText, selection.start)
                return docText.slice(from,to)
            },
            log(arg) { jb.log(arg,{})},
            async gotoFilePos(path,line,col) {}
        }
    }
})

component('workspace.initAsHost', {
  type: 'action<>',
  params: [
    {id: 'docUri', as: 'string'},
    {id: 'line', as: 'number', byName: true},
    {id: 'col', as: 'number'},
    {id: 'docText', as: 'string', description: 'optional, default is to fetch the uri'}
  ],
  impl: async (ctx,docUri,line,col, docText) => {
    jb.workspace.initJbWorkspaceAsHost()
    const docContent = docText || await jbHost.codePackageFromJson().fetchFile(docUri)
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
  impl: workspace.documentRef(()=>jb.workspace.activeUri)
})

component('workspace.documentRef', {
  type: 'data<>',
  params: [
    {id: 'docUri', as: 'string', byName: true},
    {id: 'initialContent', as: 'string'},
  ],
  impl: (ctx,docUri, initialContent) => {
    jb.workspace.openDocs[docUri] = jb.workspace.openDocs[docUri] || { text: initialContent }
    return jb.db.objectProperty(jb.workspace.openDocs[docUri], 'text')
  }
})

component('workspace.documentSectionRef', {
  type: 'data<>',
  params: [
    {id: 'docUri', as: 'string', byName: true},
    {id: 'from', description: 'offset or {line, col}'},
    {id: 'to', description: 'offset or {line, col}'}
  ],
  impl: (ctx,docUri,from,to) => ({
    $jb_val(val) {
      const text = jb.path(jb.workspace.openDocs,[docUri,'text'])
      if (!text)
        return jb.logError(`workspace documentSectionRef can not find docUri ${docUri}`,{ctx})
      const _from = jb.tgpTextEditor.asOffset(from,text), _to = jb.tgpTextEditor.asOffset(to,text)
      const section = text.slice(_from,_to)
      if (val == undefined) {
        //this.sectionHash = jb.utils.calcHash(section)
        return section
      }
      // if (this.sectionHash != jb.utils.calcHash(section))
      //   return jb.logError(`workspace documentSectionRef doc section was changed ${docUri}`,{from,to,_from,_to, ctx})
      jb.workspace.openDocs[docUri].text = text.slice(0,_from) + val + text.slice(_to)
    }
  })
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