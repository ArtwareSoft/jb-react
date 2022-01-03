
jb.extension('workspace', {
	$phase: 50,
    initExtension() { 
        const gotoPathRequest = jb.callbag.subject()
        jb.utils.subscribe(jb.watchableComps.source, e => jb.workspace.applyDeltaFromStudio(e))
        jb.utils.subscribe(gotoPathRequest, e => jb.workspace.gotoPath(e))

        return {
            onSaveDoc: jb.callbag.subject(),
            onOpenDoc: jb.callbag.subject(),
            onChangeSelection: jb.callbag.subject(),
            gotoOffsetRequest: jb.callbag.subject(),
            applyEditsRequest: jb.callbag.subject(),
            gotoPathRequest,

            openDocs: {},
            activeUri: '',
            activeTextEditor: { // TODO - implement workspaceHost to support vscode
                document: {
                    getText: () => jb.workspace.openDocs[jb.workspace.activeUri].text
                },
                selection: { 
                    active: () => jb.workspace.openDocs[jb.workspace.activeUri].activeSelection 
                },
            }
    }},
    contentChanged(text, docUri,ctx) {
        jb.workspace.activeUri = docUri
        jb.workspace.openDocs[docUri].text = text

        const {compId, compSrc} = jb.workspace.closestComp(text, {line: jb.workspace.openDocs[docUri].activeSelection.line})
        if (compId) {
            const compRef = jb.tgp.ref(compId)
            const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
            jb.tgpTextEditor.setStrValue(newVal, compRef, ctx)
        }
        const ref = ctx.exp('%$probe/scriptChangeCounter%','ref')
        jb.db.writeValue(ref, +(jb.val(ref)||0)+1 ,ctx)
    },
    refreshActiveEditor() {
        jb.workspace.openDoc(jb.workspace.activeUri)
    },
    async openDoc(docUri) {
        if (!jb.workspace.openDocs[docUri]) {
            const text = await jbFetchFile(jb.baseUrl+docUri)
            jb.workspace.openDocs[docUri] = {text, uri: docUri, activeSelection: {line: 0, col: 0}}
        }
        jb.workspace.activeUri = docUri
        jb.workspace.onOpenDoc.next(docUri)
    },
    async closeDoc(docUri) {
        delete jb.workspace.openDocs[docUri]
        jb.workspace.docUri = Object.keys(jb.workspace.openDocs).pop()
        jb.workspace.openDoc(jb.workspace.activeUri)
    },
    applyDeltaFromStudio(ev) {
        const compId = ev.path[0]
        const comp = jb.comps[compId]
        try {
            const uri = comp[jb.core.location][0]
            const doc = jb.workspace.openDocs[uri]
            if (!doc) return // todo: open file and try again
            const fileContent = doc.text
            if (fileContent == null) return
            const edits = [jb.workspace.deltaFileContent(fileContent, {compId,comp})].filter(x=>x).filter(x=>x.newText).filter(x=>x.newText.length < 10000)
            if (!edits.length) return
            jb.workspace.applyEdits(edits,uri)
            if (uri == jb.workspace.activeUri) {
            //     //jb.workspace.openDoc(uri)
                //jb.workspace.gotoPath({path: ev.path.join('~'), semanticPart: 'value'})
            }
        } catch (e) {
            jb.logException(e,'error while saving ' + compId,{ev, compId, comp, fn}) || []
        }   
    },    
    closestComp(fileContent, pos) {
        const lines = fileContent.split('\n')
        const closestComp = lines.slice(0,pos.line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = pos.line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(componentHeaderIndex+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine) {
          jb.logError('workspace - can not find end of component', { compId, linesFromComp })
          return {}
        }
        const compSrc = linesFromComp.slice(0,compLastLine+1).join('\n')
        return {compId, compSrc, componentHeaderIndex, compLastLine}
    },
    async formatComponent() {
        const { compId, needsFormat } = jb.workspace.calcActiveTextEditorPath()
        if (needsFormat) {
            const editor = jb.workspace.activeTextEditor
            const doc = editor && editor.document
            if (!doc) return
            const text = doc.getText()
            try {
                const oldLocation = jb.comps[compId][jb.core.location]
                // TODO: implement in childJbm
                jb.frame.eval(jb.macro.importAll() + ';' + jb.workspace.componentTextInEditor(text,compId).content || '')
                jb.comps[compId][jb.core.location] = oldLocation
            } catch (e) {
                return jb.logError('can not parse profile', {e, compId})
            }
            const comp = jb.comps[compId]
            const edits = [jb.workspace.deltaFileContent(text, {compId,comp})].filter(x=>x)
            jb.workspace.applyEdits(edits)
            jb.workspace.gotoPath()
        }
    },
    calcActiveTextEditorPath() {
        const editor = jb.workspace.activeTextEditor
        if (!editor) return {}
        const line = editor.selection.active().line, col = editor.selection.active().col
        const lines = editor.document.getText().split('\n')
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
        return { compId, ...jb.tgpTextEditor.getPathsOfPos(compId, {line: line-componentHeaderIndex,col}, actualText),
            ...jb.tgpTextEditor.getPathOfPos(compId, {line: line-componentHeaderIndex,col}, actualText) }
    },
    // async updatePosVariables() {
    //     const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromTgpTextEditor: true}})
    //     const { path, semanticPath, relevant, offset } = jb.workspace.calcActiveTextEditorPath()
    //     jb.db.writeValue(ctx.exp('%$workspace/offset%','ref'), offset ,ctx)
    //     jb.db.writeValue(ctx.exp('%$workspace/relevant%','ref'), relevant ,ctx)
    //     semanticPath && jb.db.writeValue(ctx.exp('%$workspace/semanticPath%','ref'), semanticPath.path ,ctx)
    //     jb.db.writeValue(ctx.exp('%$workspace/selectedPath%','ref'), path ,ctx)
    //     const probeCircuit = await jb.exec({$: 'remote.data', data: () => jb.probe.calcCircuitPath(), jbm: {$: 'jbm.wProbe'} })
    //     jb.db.writeValue(ctx.exp('%$workspace/probeCircuit%','ref'), probeCircuit ,ctx)

    //     //vscodeNS.commands.executeCommand('setContext', 'jbart.inComponent', !!(compId || path))
    //     // const fixedPath = path || compId && `${compId}~impl`
    //     // if (fixedPath) {
    //     //     jb.db.writeValue(ctx.exp('%$workspace/selectedPath%','ref'), fixedPath ,ctx)
    //     //     semanticPath && jb.db.writeValue(ctx.exp('%$workspace/semanticPath%','ref'), semanticPath.path ,ctx)

    //         // const circuitOptions = jb.tgp.circuitOptions(fixedPath.split('~')[0])
    //         // if (circuitOptions && circuitOptions[0])
    //         //     jb.db.writeValue(ctx.exp('%$workspace/circuitOptions%','ref'), circuitOptions ,ctx)
    //     //}
    // },
    componentTextInEditor(fileContent, compId) {
        const lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
        const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${compId}'`) == 0)
        if (lineOfComp == -1) return {}
        const linesFromComp = lines.slice(lineOfComp)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
          return jb.logError('can not find end of component', {compId, linesFromComp})
        return { lineOfComp, content: linesFromComp.slice(0,compLastLine+1).join('\n') }
    },
    deltaFileContent(fileContent, {compId,comp}) {
        const { lineOfComp, content} = jb.vscode.componentTextInEditor(fileContent,compId)
        const newCompContent = comp ? jb.utils.prettyPrintComp(compId,comp,{comps: jb.comps}) : ''
        const justCreatedComp = !content.length && comp[jb.core.location][1] == 'new'
        if (justCreatedComp) {
          comp[jb.core.location][1] == lines.length
          return { range: {start: { line: lines.length, character: 0}, end: {line: lines.length, character: 0} } , newText: '\n\n' + newCompContent }
        }
        const {common, oldText, newText} = calcDiff(content, newCompContent)
        const commonStartSplit = common.split('\n')
        // using vscode terminology
        const start = {line: lineOfComp + commonStartSplit.length - 1, character: commonStartSplit.slice(-1)[0].length }
        const end = { line: start.line + oldText.split('\n').length -1, 
          character : (oldText.split('\n').length-1 ? 0 : start.character) + oldText.split('\n').pop().length }
        return { range: {start, end} , newText }
      
        // the diff is continuous, so we cut the common parts at the begining and end 
        function calcDiff(oldText,newText)  {
          let i=0;j=0;
          while(newText[i] == oldText[i] && i < newText.length) i++
          const common = oldText.slice(0,i)
          oldText = oldText.slice(i); newText = newText.slice(i);
          while(newText[newText.length-j] == oldText[oldText.length-j] && j < newText.length) j++ // calc backwards from the end
          return {firstDiff: i, common, oldText: oldText.slice(0,-j+1), newText: newText.slice(0,-j+1)}
        }
    },
    async applyEdits(editsInVsCodeFormat,uri) {
        const docUri = uri || jb.workspace.activeUri
        const docText = jb.workspace.openDocs[docUri].text
        const edits = editsInVsCodeFormat.map(({range, newText}) => ({
                text: newText,
                from: jb.tgpTextEditor.lineColToOffset(docText, { line: range.start.line, col: range.start.character }),
                to: jb.tgpTextEditor.lineColToOffset(docText,{ line: range.end.line, col: range.end.character })
            })).sort((x,y) => x.from - y.from)

        if (edits.length > 1) debugger // TODO - check sort order - end to begining
        edits.forEach(({from, to, text}) => {
            const docText = jb.workspace.openDocs[docUri].text
            jb.workspace.openDocs[docUri].text = docText.slice(0,from) + text + docText.slice(to)
        })
        jb.workspace.applyEditsRequest.next({edits, uri})
    },
    onEnter(ctx) {
        const { semanticPath, needsFormat } = jb.workspace.calcActiveTextEditorPath()
        if (needsFormat) {
            jb.workspace.formatComponent()
            jb.workspace.refreshActiveEditor()
        } else if (semanticPath) {
            let path = semanticPath.path.split('~!')[0]
            const semanticPart = semanticPath.path.split('~!')[1]
            const menu = menuType(path,semanticPart)
            ctx.run({$: 'workspace.openQuickPickMenu', menu: {$: `tgpTextEditor.${menu}`, path, semanticPart }, path })
        }

        function menuType(path,semanticPart) {
            if (jb.tgp.paramDef(path).options)
                return 'selectEnum'
            const profile = jb.tgp.valOfPath(path)
            if (profile.$ == 'TBD')
                return 'selectPT'
            const params = jb.path(jb.comps[(profile||{}).$],'params') || []
            const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
            
            const editMenu = ['value','value-text','prop'].indexOf(semanticPart) != -1 
                || !firstParamIsArray && semanticPart.match(/-by-value|obj-separator-|profile|-sugar/)

            return editMenu ? 'editMenu' : 'selectPT'
        }
    },
    gotoPath({path,semanticPart} = {}) {
        path = path || jb.exec('%$workspace/selectedPath%')
        if (!path) return
        semanticPart = semanticPart || jb.exec('%$workspace/semanticPath%').split('!').pop()
        const compId = path.split('~')[0]
        const pos = jb.tgpTextEditor.getPosOfPath(`${path}~!${semanticPart}`)
        if (!pos)
            return jb.logError(`goto path - can not find pos for path ${path}`, {semanticPart})
        const line = pos[0] + Number(jb.comps[compId][jb.core.location][1]) - 1
        const uri = jb.comps[compId][jb.core.location][0]
        const offset = jb.tgpTextEditor.lineColToOffset(jb.workspace.openDocs[uri].text, {line, col: pos[1]})
        jb.workspace.gotoOffsetRequest.next({from: offset, to: offset, path, uri})
        //if (line < editor.visibleRanges[0].start.line || line > editor.visibleRanges[0].end.line)
//            editor.revealRange(new vscodeNS.Range(line, 0,line, 0), vscodeNS.TextEditorRevealType.InCenterIfOutsideViewport)
        // editor.selection.active = new vscodeNS.Position(line, pos[1]+1)
        // editor.selection = new vscodeNS.Selection(line, pos[1]+1, line, pos[1]+1)
        // console.log('goto path',line, pos[1]+1)
    }
})
