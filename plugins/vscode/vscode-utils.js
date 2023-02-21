jb.extension('vscode', {
    initExtension() { return { loadedProjects : {}, useFork: true, ctx: new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLang'})} },
    async initVscodeAsHost({context, extentionUri}) {
        jb.log('vscode initVscodeAsHost', {context, extentionUri})
        if (extentionUri) { // the lang server
            jb.vscode.useFork = false // avoid potential bug
            const ctx = new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLangSrvr'})
            jb.tgpTextEditor.host = { // limited tgpEditor host at the server
                serverUri: jb.uri,
                applyEdit: async (edit,uri) => ctx.setData({edit,uri}).run( 
                    remote.action(({data}) => jb.tgpTextEditor.host.applyEdit(data.edit, data.uri), jbm.byUri(()=> extentionUri))),
            }
            return        
        }
        jb.vscode.initLogs(context)
        jb.tgpTextEditor.cache = {}
        jb.tgpTextEditor.host = {
            async applyEdit(edit,uri) {
                uri = uri || vscodeNS.window.activeTextEditor.document.uri
                const wEdit = new vscodeNS.WorkspaceEdit()
                wEdit.replace(uri, { start: jb.vscode.toVscodeFormat(edit.range.start), end: jb.vscode.toVscodeFormat(edit.range.end) }, edit.newText)
                jb.log('vscode applyEdit',{wEdit, edit,uri})
                jb.tgpTextEditor.lastEdit = edit.newText
                await vscodeNS.workspace.applyEdit(wEdit)
            },
            selectRange(start,end) {
                end = end || start
                const editor = vscodeNS.window.activeTextEditor
                const line = start.line
                editor.revealRange(new vscodeNS.Range(line, 0,line, 0), vscodeNS.TextEditorRevealType.InCenterIfOutsideViewport)
                editor.selection = new vscodeNS.Selection(line, start.col, end.line, end.col)
            },
            docTextAndCursor({maxSize} = {}) {
                const editor = vscodeNS.window.activeTextEditor
                return { docText: maxSize ? editor.document.getText().slice(0,maxSize) : editor.document.getText(),
                    cursorLine: editor.selection.active.line,
                    cursorCol: editor.selection.active.character
                }
            },
            async execCommand(cmd) {
                vscodeNS.commands.executeCommand(cmd)
            },
        }

        vscodeNS.workspace.onDidChangeTextDocument(({contentChanges}) => {
            if (contentChanges && contentChanges.length == 0) return
            jb.tgpTextEditor.cache = {}
            jb.log('vscode onDidChangeTextDocument clean cache',{contentChanges})
            if (jb.path(contentChanges,'0.text') == jb.tgpTextEditor.lastEdit) {
                jb.tgpTextEditor.lastEdit = ''
            } else {
                jb.vscode.updateCurrentCompFromEditor()
            }
        })      
        // vscodeNS.window.onDidChangeTextEditorSelection( async () => {           
        // })
        // vscodeNS.workspace.onDidSaveTextDocument(() => {
        // })
    },
    updateCurrentCompFromEditor() {
        const docProps = jb.tgpTextEditor.host.docTextAndCursor()
        if (jb.vscode.useFork)
            return ctx.setData(docProps).run(remote.action(ctx => jb.tgpTextEditor.updateCurrentCompFromEditor(ctx.data), jbm.vscodeFork()))
        else
            jb.tgpTextEditor.updateCurrentCompFromEditor()
    },
    provideCompletionItems(docProps) {
        if (jb.vscode.useFork)
            return jb.vscode.ctx.setData(docProps).run(
                remote.data(ctx => jb.tgpTextEditor.provideCompletionItems(ctx.data, ctx), jbm.vscodeFork()))
        else
            return jb.tgpTextEditor.provideCompletionItems(docProps)
    },
    provideDefinition(docProps) {
        if (jb.vscode.useFork)
            return jb.vscode.ctx.setData(docProps).run(
                remote.data(ctx => jb.tgpTextEditor.provideDefinition(ctx.data, ctx), jbm.vscodeFork()))
        else
            return jb.tgpTextEditor.provideDefinition(docProps)
    },    
    toVscodeFormat(pos) {
        return { line: pos.line, character: pos.col }
    },
    tojBartFormat(pos) {
        return { line: pos.line, col: pos.character }
    },    
    async initWatches() {
        globalThis.spy = jb.spy.initSpy({spyParam: 'dialog,watchable,headless,method,refresh,remote,treeShake,vscode'})
        await jb.vscode.loadOpenedProjects()
        jb.vscode.watchFileChange()
        jb.vscode.watchCursorChange()
        jb.vscode.updatePosVariables()
        //jb.vscode.applyDeltaFromStudio()
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
        vscodeNS.workspace.onDidChangeTextDocument(() => {
            jb.vscode.cache = {}
        })
        vscodeNS.workspace.onDidSaveTextDocument( () => { // update component of active selection
            jb.vscode.updateCurrentCompFromEditor(jb.tgpTextEditor.host.docTextAndCursor())
        })
        vscodeNS.workspace.onDidOpenTextDocument(({fileName}) => 
            fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) && jb.vscode.loadOpenedProjects())
    },
    watchCursorChange() {
    //    vscodeNS.window.onDidChangeTextEditorSelection(jb.vscode.updatePosVariables)
    },
    // updatePosVariables(docProps) {
    //     const { compId, path, semanticPath } = jb.tgpTextEditor.calcActiveEditorPath(docProps)
    //     if (!path) return
    //     console.log('update pos', semanticPath)
    //     vscodeNS.commands.executeCommand('setContext', 'jbart.inComponent', !!(compId || path))
    //     const fixedPath = path || compId && `${compId}~impl`
    //     if (fixedPath) {
    //         const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
    //         jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), fixedPath ,ctx)
    //         semanticPath && jb.db.writeValue(ctx.exp('%$studio/semanticPath%','ref'), semanticPath.path ,ctx)

    //         const circuitOptions = jb.tgp.circuitOptions(fixedPath.split('~')[0])
    //         if (circuitOptions && circuitOptions[0])
    //             jb.db.writeValue(ctx.exp('%$studio/circuit%','ref'), circuitOptions[0] ,ctx)
    //         const profilePath = (fixedPath.match(/^[^~]+~impl/) || [])[0]
    //         if (profilePath)
    //             jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
    //     }
    // },
    openedProjects() {
        return jb.utils.unique(vscodeNS.workspace.textDocuments
            .map(doc => (doc.fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) || ['',''])[1]))
    },
    loadOpenedProjects() {
        const doc = vscodeNS.window.activeTextEditor.document
        jb.frame.eval(jb.macro.importAll() + ';' + doc.getText() || '')
        // const projects = jb.vscode.openedProjects().filter(p=>p && p != 'studio' && !jb.vscode.loadedProjects[p])
        // projects.forEach(p=> jb.vscode.loadedProjects[p] = true)

        // if (projects.length)
        //     return loadProjectsCode(projects)
    },
    async initLogs() {
        const outputChannel = jb.vscode.OutputChannel = vscodeNS.window.createOutputChannel('jbart')
        outputChannel.appendLine('Hello jBart vscode')
        //outputChannel.show()
        // const fromWorker = await jb.exec({$: 'vscode.workerTst'})
        // outputChannel.appendLine(fromWorker); 
    }
    // applyDeltaFromStudio() {
    //     jb.utils.subscribe(jb.watchableComps.source, async e => {
    //         const compId = e.path[0]
    //         const comp = jb.comps[compId]
    //         try {
    //             const fn = comp[jb.core.CT].location[0].toLowerCase()
    //             const doc = vscodeNS.workspace.textDocuments.find(doc => doc.uri.path.toLowerCase().slice(0,-1) == fn.slice(0,-1))
    //             if (!doc) return // todo: open file and try again
    //             const fileContent = doc.getText()
    //             if (fileContent == null) return
    //             const edits = [jb.tgpTextEditor.deltaFileContent(fileContent, {compId,comp})].filter(x=>x).filter(x=>x.newText.length < 10000)
    //             console.log('edits', edits)
    //             const edit = new vscodeNS.WorkspaceEdit()
    //             edit.set(doc.uri, edits)                
    //             await vscodeNS.workspace.applyEdit(edit)
    //             //await jb.vscode.gotoPath(e.path.join('~'),'value')
    //         } catch (e) {
    //             jb.logException(e,'error while saving ' + compId,{compId, comp, fn}) || []
    //         }   
    //     })
    // }, 
})

jb.component('studio.inVscode',{
    type: 'boolean',
    impl: () => jb.frame.jbInvscode
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

jb.component('vscode.workerTst', {
  type: 'data',
  impl: remote.data('hello from worker', jbm.vscodeFork('vscodeFork'))
})

// DO NOT DELETE - vscode views should be fixed and moved
// jb.component('vscode.jbEditorCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('profile path: %$studio/profile_path%'),
//       text(' selected: %$studio/jbEditor/selected%'),
//       text(' semantic: %$studio/semanticPath%'),
//       studio.jbEditorInteliTree('%$studio/profile_path%')
//     ],
//     features: [watchRef('%$studio/profile_path%'), watchRef('%$studio/scriptChangeCounter%')]
//   })
// })

// jb.component('vscode.previewCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('circuit: %$studio/circuit%'),
//       preview.control()
//     ],
//     features: watchRef('%$studio/circuit%')
//   })
// })

// jb.component('vscode.logsCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('logs'),
//       studio.eventTracker()
//     ]
//   })
// })

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
            jb.tgp.writeValueOfPath(path,quickPick.value,ctx)
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
