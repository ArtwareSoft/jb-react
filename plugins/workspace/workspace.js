
jb.extension('workspace', {
	$phase: 50,
    initJbWorkspaceAsHost() {
        jb.tgpTextEditor.cache = {}
        if (jb.path('jb.tgpTextEditor.host.type') == 'jbWorkspace') return
        jb.tgpTextEditor.host = {
            type: 'jbWorkspace',
            async applyEdit(edit,uri) {
                jb.tgpTextEditor.cache = {}
                const docUri = uri || jb.workspace.activeUri
                const docText = jb.workspace.openDocs[docUri].text
                const from = jb.tgpTextEditor.lineColToOffset(docText, edit.range.start)
                const to = jb.tgpTextEditor.lineColToOffset(docText,edit.range.end)
                jb.workspace.openDocs[docUri].text = docText.slice(0,from) + edit.newText + docText.slice(to)
                jb.tgpTextEditor.lastEditForTester = { edit , uri }
            },
            selectRange(start,end) {
                jb.workspace.openDocs[jb.workspace.activeUri].selection = { start, end: end || start }
                jb.tgpTextEditor.host.selectionSource.next({start,end})
            },
            docTextAndCursor() {
                const doc = jb.workspace.openDocs[jb.workspace.activeUri]
                return { docText: doc.text, cursorLine: doc.selection.start.line, cursorCol: doc.selection.start.col}
            },
            async execCommand(cmd) {
                console.log('exec command', cmd)
            },
            
            // testers only use
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
        }
    },
    initExtension() { 
        const gotoPathRequest = jb.callbag.subject()
        //jb.utils.subscribe(jb.watchableComps.source, e => jb.workspace.applyDeltaFromStudio(e))
        //jb.utils.subscribe(gotoPathRequest, e => jb.tgpTextEditor.gotoPath(e))

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
    // contentChanged(text, docUri,ctx, change) {
    //     jb.workspace.activeUri = docUri
    //     jb.workspace.openDocs[docUri].text = text

    //     const {compId, compSrc} = jb.tgpTextEditor.closestComp(text, {line: jb.workspace.openDocs[docUri].selection.line})
    //     if (compId) {
    //         const compRef = jb.tgp.ref(compId)
    //         const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
    //         jb.tgpTextEditor.setStrValue(newVal, compRef, ctx)
    //     }
    //     const ref = ctx.exp('%$probe/scriptChangeCounter%','ref')
    //     jb.db.writeValue(ref, +(jb.val(ref)||0)+1 ,ctx)
    // },
    // refreshActiveEditor() {
    //     jb.workspace.openDoc(jb.workspace.activeUri)
    // },
    // async openDoc(docUri) {
    //     if (!jb.workspace.openDocs[docUri]) {
    //         const text = await jbFetchFile(jb.baseUrl+docUri)
    //         jb.workspace.openDocs[docUri] = {text, uri: docUri, selection: {line: 0, col: 0}}
    //     }
    //     jb.workspace.activeUri = docUri
    //     jb.workspace.onOpenDoc.next(docUri)
    // },
    // async closeDoc(docUri) {
    //     delete jb.workspace.openDocs[docUri]
    //     jb.workspace.docUri = Object.keys(jb.workspace.openDocs).pop()
    //     jb.workspace.openDoc(jb.workspace.activeUri)
    // },
    // applyDeltaFromStudio(ev) {
    //     const compId = ev.path[0]
    //     const comp = jb.comps[compId]
    //     try {
    //         const uri = comp[jb.core.CT].location[0]
    //         const doc = jb.workspace.openDocs[uri]
    //         if (!doc) return // todo: open file and try again
    //         const fileContent = doc.text
    //         if (fileContent == null) return
    //         const edits = [jb.tgpTextEditor.deltaFileContent(fileContent, {compId,comp})].filter(x=>x).filter(x=>x.newText).filter(x=>x.newText.length < 10000)
    //         if (!edits.length) return
    //         jb.workspace.applyEdit(edits,uri)
    //         if (uri == jb.workspace.activeUri) {
    //         //     //jb.workspace.openDoc(uri)
    //             //jb.workspace.gotoPath({path: ev.path.join('~'), semanticPart: 'value'})
    //         }
    //     } catch (e) {
    //         jb.logException(e,'error while saving ' + compId,{ev, compId, comp, fn}) || []
    //     }   
    // },
    // async formatComponent() {
    //     const { compId, reformatEdits } = jb.workspace.calcActiveTextEditorPath()
    //     if (reformatEdits) {
    //         const editor = jb.workspace.activeTextEditor
    //         const doc = editor && editor.document
    //         if (!doc) return
    //         const text = doc.getText()
    //         try {
    //             const oldLocation = jb.comps[compId][jb.core.CT].location
    //             // TODO: implement in childJbm
    //             jb.frame.eval(jb.macro.importAll() + ';' + jb.tgpTextEditor.fileContentToCompText(text,compId).compText || '')
    //             jb.comps[compId][jb.core.CT].location = oldLocation
    //         } catch (e) {
    //             return jb.logError('can not parse profile', {e, compId})
    //         }
    //         const comp = jb.comps[compId]
    //         const edits = [jb.tgpTextEditor.deltaFileContent(text, {compId,comp})].filter(x=>x)
    //         jb.workspace.applyEdit(edits)
    //         jb.workspace.gotoPath()
    //     }
    // },
    // calcActiveTextEditorPath() {
    //     const editor = jb.workspace.activeTextEditor
    //     if (!editor) return {}
    //     const line = editor.selection.active().line, col = editor.selection.active().col
    //     const lines = editor.document.getText().split('\n')
    //     const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
    //     if (closestComp == -1) return {}
    //     const componentHeaderIndex = line - closestComp
    //     const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
    //     const linesFromComp = lines.slice(componentHeaderIndex)
    //     const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    //     const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
    //     return { compId, ...jb.tgpTextEditor.getPathsOfPos(compId, {line: line-componentHeaderIndex,col}, actualText),
    //         ...jb.tgpTextEditor.getPathOfPos(null, compId, {line: line-componentHeaderIndex,col}) }
    // },
})
