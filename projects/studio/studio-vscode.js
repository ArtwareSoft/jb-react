jb.extension('vscode', {
    initExtension() { return { loadedProjects : {} } },
    async init() {
        global.spy = jb.spy.initSpy({spyParam: 'dialog,watchable,headless,method,refresh,remote,codeLoader,vscode'})
        await jb.vscode.loadOpenedProjects()
        jb.vscode.watchFileChange()
        jb.vscode.watchCursorChange()
        jb.vscode.updatePosVariables()
        jb.vscode.applyDeltaFromStudio()
    },
    createWebViewProvider(id,extensionUri) { 
        jb.log('vscode create webview provider',{id,extensionUri})
        return {
        async resolveWebviewView(panel, context, _token) {
            jb.log('vscode resolve webView',{id,extensionUri,context,panel})
            this._panel = panel
            panel.webview.options = {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
            panel.onDidDispose(() => jb.log('vscode webview panel disposed',{id,extensionUri}))
            panel.onDidChangeVisibility(() => { 
                jb.log('vscode webview panel changed vis',{visible: panel.visible, id,extensionUri})
                if (panel.visible)
                    show()
            })
            show()

            async function show() {
                jb.jbm.terminateChild(id)
                jb.log(`vscode show webview ${id}`)
                const profile = 
                      id == 'preview' ? { $: 'vscode.openPreviewPanel' }
                    : id == 'logs' ? { $: 'vscode.openLogsPanel' }
                    : { $: 'vscode.showInXWebView' }
                jb.exec({ ...profile, id, panel })
            }
        }
    }},
    api() {
        jb.vscode._api = jb.vscode._api || (typeof acquireVsCodeApi != 'undefined' ? acquireVsCodeApi() : null)
        return jb.vscode._api
    },   
    watchFileChange() {
        vscodeNS.workspace.onDidSaveTextDocument(() => { // update component of active selection
            const editor = vscodeNS.window.activeTextEditor
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            const {compId, compSrc} = jb.codeEditor.closestComp(editor.document.getText(), {line: editor.selection.active.line})
            if (compId) {
                const compRef = jb.studio.refOfPath(compId)
                const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
                jb.codeEditor.setStrValue(newVal, compRef, ctx)
            }
            const ref = ctx.exp('%$studio/scriptChangeCounter%','ref')
            jb.db.writeValue(ref, +(jb.val(ref)||0)+1 ,ctx)
        })
        vscodeNS.workspace.onDidOpenTextDocument(({fileName}) => 
            fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) && jb.vscode.loadOpenedProjects())
    },
    calcActiveEditorPath() {
        const editor = vscodeNS.window.activeTextEditor
        if (!editor) return {}
        const line = editor.selection.active.line, col = editor.selection.active.character
        const lines = editor.document.getText().split('\n')
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
        return { compId, ...jb.codeEditor.getPathOfPos(compId, {line: line-componentHeaderIndex,col}, actualText) }
    },
    watchCursorChange() {
        vscodeNS.window.onDidChangeTextEditorSelection(jb.vscode.updatePosVariables)
    },
    updatePosVariables() {
        const { compId, path, semanticPath } = jb.vscode.calcActiveEditorPath()
        vscodeNS.commands.executeCommand('setContext', 'jbart.inComponent', !!(compId || path))
        const fixedPath = path || compId && `${compId}~impl`
        if (fixedPath) {
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), fixedPath ,ctx)
            semanticPath && jb.db.writeValue(ctx.exp('%$studio/semanticPath%','ref'), semanticPath.path ,ctx)

            const circuitOptions = jb.studio.circuitOptions(fixedPath.split('~')[0])
            if (circuitOptions && circuitOptions[0])
                jb.db.writeValue(ctx.exp('%$studio/circuit%','ref'), circuitOptions[0] ,ctx)
            const profilePath = (fixedPath.match(/^[^~]+~impl/) || [])[0]
            if (profilePath)
                jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
        }
    },
    openedProjects() {
        return jb.utils.unique(vscodeNS.workspace.textDocuments
            .map(doc => (doc.fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) || ['',''])[1]))
    },
    loadOpenedProjects() {
        const projects = jb.vscode.openedProjects().filter(p=>p && p != 'studio' && !jb.vscode.loadedProjects[p])
        projects.forEach(p=> jb.vscode.loadedProjects[p] = true)
        if (projects.length)
            return loadProjectsCode(projects)
    },
    applyDeltaFromStudio() {
        jb.utils.subscribe(jb.watchableComps.handler.resourceChange, async e => {
            const compId = e.path[0]
            const comp = jb.comps[compId]
            try {
                const fn = comp[jb.core.location][0].toLowerCase()
                const doc = vscodeNS.workspace.textDocuments.find(doc => doc.uri.path.toLowerCase() == fn)
                if (!doc) return // todo: open file and try again
                const fileContent = doc.getText()
                if (fileContent == null) return
                const edits = [jb.vscode.deltaFileContent(fileContent, {compId,comp})].filter(x=>x).filter(x=>x.newText.length > 10000)
                console.log('edits', edits)
                const edit = new vscodeNS.WorkspaceEdit()
                edit.set(doc.uri, edits)                
                await vscodeNS.workspace.applyEdit(edit)
                //await jb.vscode.gotoPath(e.path.join('~'),'value')
            } catch (e) {
                jb.logException(e,'error while saving ' + compId,{compId, comp, fn}) || []
            }   
        })
    },
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
    
   // commands
    async formatComponent() {
        const { compId, needsFormat } = jb.vscode.calcActiveEditorPath()
        if (needsFormat) {
            const editor = vscodeNS.window.activeTextEditor
            const doc = editor && editor.document
            if (!doc) return
            try {
                const oldLocation = jb.comps[compId][jb.core.location]
                jb.frame.eval(jb.vscode.componentTextInEditor(doc.getText(),compId).content || '')
                jb.comps[compId][jb.core.location] = oldLocation
            } catch (e) {
                return jb.logError('can not parse profile', {e, compId})
            }
            const comp = jb.comps[compId]
            const edits = [jb.vscode.deltaFileContent(doc.getText(), {compId,comp})].filter(x=>x)
            console.log('format edits', edits)
            const edit = new vscodeNS.WorkspaceEdit()
            edit.set(doc.uri, edits)
            await vscodeNS.workspace.applyEdit(edit)          
        }
    },
    onEnter() {
        const { semanticPath, needsFormat } = jb.vscode.calcActiveEditorPath()
        if (needsFormat)
            jb.vscode.formatComponent()
        else if (semanticPath) {
            let path = semanticPath.path.split('~!')[0]
            const semanticPart = semanticPath.path.split('~!')[1]
            const menu = menuType(path,semanticPart)
            jb.exec({$: 'vscode.openQuickPickMenu', menu: {$: `codeEditor.${menu}`, path, semanticPart }, path })
        }

        function menuType(path,semanticPart) {
            if (jb.studio.paramDef(path).options)
                return 'selectEnum'
            const profile = jb.studio.valOfPath(path)
            const params = jb.path(jb.comps[(profile||{}).$],'params') || []
            const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
            
            const editMenu = ['value','value-text','prop'].indexOf(semanticPart) != -1 
                || !firstParamIsArray && semanticPart.match(/-by-value|obj-separator-|profile|-sugar/)

            return editMenu ? 'editMenu' : 'selectPT'
        }
    },
    async gotoPath(path,semanticPart) {
        const compId = path.split('~')[0]
        const fn = jb.comps[compId][jb.core.location][0]
        const doc = await vscodeNS.workspace.openTextDocument(fn)
        const editor = await vscodeNS.window.showTextDocument(doc)
        const pos = jb.codeEditor.getPosOfPath(`${path}~!${semanticPart}`)
        const line =pos[0] + Number(jb.comps[compId][jb.core.location][1]) - 1
        //if (line < editor.visibleRanges[0].start.line || line > editor.visibleRanges[0].end.line)
            editor.revealRange(new vscodeNS.Range(line, 0,line, 0), vscodeNS.TextEditorRevealType.InCenterIfOutsideViewport)
        editor.selection.active = new vscodeNS.Position(line, pos[1]+1)
        editor.selection = new vscodeNS.Selection(line, pos[1]+1, line, pos[1]+1)
        console.log('goto path',line, pos[1]+1)
    }
})

jb.component('studio.inVscode',{
    type: 'boolean',
    impl: () => jb.frame.jbInvscode
})

jb.component('vscode.jbEditorCtrl', {
  type: 'control',
  impl: group({
    controls: [
      text('profile path: %$studio/profile_path%'),
      text(' selected: %$studio/jbEditor/selected%'),
      text(' semantic: %$studio/semanticPath%'),
      studio.jbEditorInteliTree('%$studio/profile_path%')
    ],
    features: [watchRef('%$studio/profile_path%'), watchRef('%$studio/scriptChangeCounter%')]
  })
})

jb.component('vscode.previewCtrl', {
  type: 'control',
  impl: group({
    controls: [
      text('circuit: %$studio/circuit%'),
      preview.control()
    ],
    features: watchRef('%$studio/circuit%')
  })
})

jb.component('vscode.logsCtrl', {
  type: 'control',
  impl: group({
    controls: [
      text('logs'),
      studio.eventTracker()
    ]
  })
})

jb.component('vscode.gotoUrl', {    
  type: 'action',
  params: [
    {id: 'url', as: 'string'}
  ],
  impl: remote.action(({},{},{url}) => { debugger; vscodeNS.env.openExternal(vscodeNS.Uri.parse(url)) }, jbm.byUri('vscode')),
})

jb.component('vscode.openQuickPickMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,menu,path) => {
    const model = menu()
    const quickPick = vscodeNS.window.createQuickPick()
    quickPick.title = model.title
    quickPick.items = (model.options() || []).map(option => ({label: option.separator ? '----' : option.title, ...option}))
    quickPick.onDidAccept(() => {
        const option = quickPick.activeItems[0]
        if (option && option.action)
            option.action()
        if (!option && quickPick.value) {
            jb.studio.writeValueOfPath(path,quickPick.value,ctx)
        }
        quickPick.dispose()
    })
    quickPick.onDidChangeSelection(option => {
        if (option[0] && option[0].separator)
        if (option[0].action)
            option[0].action()
        else if (option[0].options) {
            // multi level
        }
    })
    quickPick.onDidHide(() => quickPick.dispose())
    quickPick.show()
    }
})

jb.component('vscode.gotoPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string' }
  ],
  impl: (ctx,path,semanticPart) => jb.vscode.gotoPath(path,semanticPart)
})