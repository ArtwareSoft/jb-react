
extension('workspace', {
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
            async applyEdit(edit,uri) {
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
            compTextAndCursor() {
                const doc = jb.workspace.openDocs[jb.workspace.activeUri]
                return jb.tgpTextEditor.closestComp(doc.text, doc.selection.start.line, doc.selection.start.col, jb.workspace.activeUri)                
            },
            async execCommand(cmd) {
                //console.log('exec command', cmd)
            },
            async saveDoc() {
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
            async gotoFilePos(path,line,col) {}      
        }
    }
})
