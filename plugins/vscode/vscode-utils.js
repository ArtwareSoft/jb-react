jb.extension('vscode', {
    initExtension() { return { loadedProjects : {} } },
    initVscodeAsHost() {
        jb.tgpTextEditor.cache = {}
        jb.tgpTextEditor.host = {
            async applyEdit(edit,uri) {
                uri = uri || vscodeNS.window.activeTextEditor.document.uri
                const wEdit = new vscodeNS.WorkspaceEdit()
                wEdit.replace(uri, { start: jb.vscode.toVscodeFormat(edit.range.start), end: jb.vscode.toVscodeFormat(edit.range.end) }, edit.newText)
                await vscodeNS.workspace.applyEdit(wEdit)
                jb.tgpTextEditor.lastEdit = { edit , uri }
            },
            selectRange(start,end) {
                end = end || start
                const editor = vscodeNS.window.activeTextEditor
                const line = start.line
                editor.revealRange(new vscodeNS.Range(line, 0,line, 0), vscodeNS.TextEditorRevealType.InCenterIfOutsideViewport)
                editor.selection = new vscodeNS.Selection(line, start.col, end.line, end.col)
            },
            getTextAtSelection() {
                return vscodeNS.window.activeTextEditor.document.getText(vscodeNS.window.activeTextEditor.selection)
            },
            getSelectionRange() {
                const res = vscodeNS.window.activeTextEditor.selection
                return { start: jb.vscode.tojBartFormat(res.start), end: jb.vscode.tojBartFormat(res.end)}
            },
            docText() {
                return vscodeNS.window.activeTextEditor.document.getText()
            },
            cursorLine() {
                return vscodeNS.window.activeTextEditor.selection.active.line
            },
            cursorCol() {
                return vscodeNS.window.activeTextEditor.selection.active.character
            },
            execCommand(cmd) {
                vscodeNS.commands.executeCommand(cmd)
            }
        }
        vscodeNS.workspace.onDidChangeTextDocument(() => {
            jb.tgpTextEditor.cache = {}
            jb.tgpTextEditor.updateCurrentCompFromEditor()
        })        
        vscodeNS.window.onDidChangeTextEditorSelection(() => {
            const { semanticPath } = jb.tgpTextEditor.calcActiveEditorPath()
            console.log('update pos', semanticPath)            
        })
        vscodeNS.workspace.onDidSaveTextDocument(() => {
            jb.tgpTextEditor.updateCurrentCompFromEditor()
        })
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
        vscodeNS.workspace.onDidSaveTextDocument(() => { // update component of active selection
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            const {compId, compSrc} = jb.tgpTextEditor.closestComp(jb.tgpTextEditor.host.getText(), {line: jb.tgpTextEditor.host.cursorLine()})
            if (compId) {
                const compRef = jb.tgp.ref(compId)
                const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
                jb.tgpTextEditor.setStrValue(newVal, compRef, ctx)
            }
            const ref = ctx.exp('%$studio/scriptChangeCounter%','ref')
            jb.db.writeValue(ref, +(jb.val(ref)||0)+1 ,ctx)
        })
        vscodeNS.workspace.onDidOpenTextDocument(({fileName}) => 
            fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) && jb.vscode.loadOpenedProjects())
    },
    watchCursorChange() {
    //    vscodeNS.window.onDidChangeTextEditorSelection(jb.vscode.updatePosVariables)
    },
    // updatePosVariables() {
    //     const { compId, path, semanticPath } = jb.tgpTextEditor.calcActiveEditorPath()
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