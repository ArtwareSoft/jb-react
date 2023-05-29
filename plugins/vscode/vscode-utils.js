using('remote,tgp')
extension('vscode', 'utils', {
    initExtension() { return { 
        loadedProjects : {}, useCompletionServer: true, panels: {},
        ctx: new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLang'})
    } },
    initServer(clientUri) {
        jb.vscode.useCompletionServer = false // avoid potential bug
        const ctx = new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLangSrvr'})
        jb.tgpTextEditor.host = { // limited tgpEditor host at the server
            serverUri: jb.uri,
            applyEdit: async (edit,uri) => ctx.setData({edit,uri}).run( 
                remote.action(({data}) => jb.tgpTextEditor.host.applyEdit(data.edit, data.uri), byUri(()=> clientUri))),
        }
    },
    async initVscodeAsHost({context}) {
        jb.log('vscode initVscodeAsHost', {context})
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
            compTextAndCursor() {
                const editor = vscodeNS.window.activeTextEditor
                return jb.tgpTextEditor.closestComp(editor.document.getText(),
                    editor.selection.active.line, editor.selection.active.character, editor.document.uri.path)
            },
            async execCommand(cmd) {
                vscodeNS.commands.executeCommand(cmd)
            },
        }
        jb.vscode.log('init')

        vscodeNS.workspace.onDidChangeTextDocument(({document, reason, contentChanges}) => {
            if (!contentChanges || contentChanges.length == 0) return
            if (!document.uri.toString().match(/^file:/)) return
            jb.tgpTextEditor.cache = {}
            jb.log('vscode onDidChangeTextDocument clean cache',{document, reason, contentChanges})
            if (jb.path(contentChanges,'0.text') == jb.tgpTextEditor.lastEdit) {
                jb.tgpTextEditor.lastEdit = ''
            } else {
                // may be used for preview worker
                // jb.vscode.updateCurrentCompFromEditor()
            }
        })      
        // vscodeNS.window.onDidChangeTextEditorSelection( async () => {           
        // })
        // vscodeNS.workspace.onDidSaveTextDocument(() => {
        // })
    },
    initLog() {
        if (jb.vscode._log) return
        jb.vscode._log = globalThis.jbVSCodeLog
        jbHost.log = args => jb.asArray(args).map(x=>jb.vscode._log(tryStringify(x)))

        function tryStringify(x) {
            if (!x) return ''
            if (typeof x == 'string') return x
            try {
                return JSON.stringify(x)
            } catch(e) {
                return x.toString && x.toString()
            }
        }
    },
    log(...args) {
        jb.vscode.initLog();
        jb.log(...args)
        jbHost.log(args)
    },
    // async updateCurrentCompFromEditor() {
    //     const docProps = jb.tgpTextEditor.host.compTextAndCursor()
    //     // check validity
    //     const {docText, cursorLine } = docProps
    //     const {compId, compSrc, dsl} = jb.tgpTextEditor.closestComp(docText, cursorLine)
    //     const {err} = compSrc ? jb.tgpTextEditor.evalProfileDef(compSrc, dsl) : {}
    //     if (err) {
    //         jb.vscode.log(`updateCurrentCompFromEditor compile error ${JSON.stringify(err)}`)
    //         return jb.logError('can not parse comp', {compId, err})
    //     }

    //     if (jb.vscode.useCompletionServer) {
    //         await jb.exec(vscode.completionServer())
    //         jb.vscode.log(`updateCurrentCompFromEditor`)
    //         return jb.vscode.ctx.setData(docProps).run(remote.action(ctx => jb.tgpTextEditor.updateCurrentCompFromEditor(ctx.data,ctx), vscode.completionServer()))
    //     } else {
    //         jb.tgpTextEditor.updateCurrentCompFromEditor(docProps,jb.vscode.ctx)
    //     }
    // },
    async provideCompletionItems(docProps) {
        if (jb.vscode.useCompletionServer) {
            const ret = await jb.exec(tgp.getCompletionItemsFromCmd({docProps: () => docProps }))
            const count = (ret || []).length
            const docSize = docProps.compText.length
            jb.vscode.log(`provideCompletionItems ${docSize} -> ${count}`)
            return ret
        } else {
            return jb.tgpTextEditor.provideCompletionItems(docProps)
        }
    },
    async provideDefinition(docProps) {
        const loc = await jb.exec(tgp.getDefinitionFromCmd({docProps: () => docProps }))
        const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path)[0] || ''

        return loc && new vscodeNS.Location(vscodeNS.Uri.file((workspaceDir || jbHost.jbReactDir) + loc[0]), new vscodeNS.Position((+loc[1]) || 0, 0))
    },
    // commands    
    moveUp() {
        return jb.vscode.moveInArray({ diff: -1, ...jb.tgpTextEditor.host.compTextAndCursor()})
    },
    moveDown() { 
        return jb.vscode.moveInArray({ diff: 1, ...jb.tgpTextEditor.host.compTextAndCursor()})
    },
    async moveInArray(docPropsWithDiff) {
        const {edit, cursorPos} = await jb.exec(tgp.moveInArrayEditsFromCmd({docProps: () => docPropsWithDiff }))
        const json = JSON.stringify(edit)
        jb.vscode.log(`moveInArray ${json.length}`)
        await jb.tgpTextEditor.host.applyEdit(edit)
        cursorPos && jb.tgpTextEditor.host.selectRange(cursorPos)
    },

    async openProbeResultPanel() {
        const docProps = jb.tgpTextEditor.host.compTextAndCursor()
        const probeRes = await jb.vscode.ctx.setData(docProps).run(tgpTextEditor.probeByDocProps('%%'))
        jb.vscode.panels.main.render('probe.probeResView',probeRes)
    },
    async openLiveProbeResultPanel() {
    },
    async openjBartStudio() {
        const docProps = jb.tgpTextEditor.host.compTextAndCursor()
        const url = await jb.vscode.ctx.setData(docProps).run(tgpTextEditor.studioCircuitUrl('%%'))
        vscodeNS.env.openExternal(vscodeNS.Uri.parse(url))
    },

    toVscodeFormat(pos) {
        return { line: pos.line, character: pos.col }
    },
    // tojBartFormat(pos) {
    //     return { line: pos.line, col: pos.character }
    // },    
    // async initWatches() {
    //     globalThis.spy = jb.spy.initSpy({spyParam: 'dialog,watchable,headless,method,refresh,remote,treeShake,vscode'})
    //     await jb.vscode.loadOpenedProjects()
    //     jb.vscode.watchFileChange()
    //     jb.vscode.watchCursorChange()
    //     jb.vscode.updatePosVariables()
    // },
    createWebViewProvider(id,extensionUri) { 
        jb.log('vscode create webview provider',{id,extensionUri})
        jb.vscode.panels[id] = { 
            render(ctrlId, data) {
                this.ctrlId = ctrlId
                this.data = data
                this.show()
            },
            async show() {
                jb.log('vscode show main',{data: this.data, ctrlId: this.ctrlId})
                //await jb.jbm.terminateChild(id)
                if (this.ctrlId && this.panel) {
                    const _jbm = await jb.exec(jbm.start(vscodeWebView({ id, panel: () => this.panel})))
                    await jb.vscode.ctx.setData(this.data).run(
                        remote.action(renderWidget({$: this.ctrlId, probeRes: '%%'}, '#main'), ()=> _jbm))
                }    
            }
        }
        return {
            async resolveWebviewView(panel, context, _token) {
                jb.vscode.log('vscode resolve webView',id)
                jb.log('vscode resolve webView',{id,extensionUri,context,panel})
                jb.vscode.panels[id].panel = this._panel = panel
                panel.webview.options = {
                    enableScripts: true,
                    localResourceRoots: [extensionUri]
                }
                panel.onDidDispose(() => jb.log('vscode webview panel disposed',{id,extensionUri}))
                panel.onDidChangeVisibility(() => { 
                    jb.log('vscode webview panel changed vis',{visible: panel.visible, id,extensionUri})
                    if (panel.visible)
                        jb.vscode.panels[id].show()
                })
                panel.webview.html = ''
                jb.vscode.panels[id].show()
            }
    }},
    api() {
        jb.vscode._api = jb.vscode._api || (typeof acquireVsCodeApi != 'undefined' ? acquireVsCodeApi() : null)
        return jb.vscode._api
    },   
    // watchFileChange() {
    //     vscodeNS.workspace.onDidChangeTextDocument(() => {
    //         jb.vscode.cache = {}
    //     })
    //     vscodeNS.workspace.onDidSaveTextDocument( () => { // update component of active selection
    //         jb.vscode.updateCurrentCompFromEditor(jb.tgpTextEditor.host.compTextAndCursor())
    //     })
    //     vscodeNS.workspace.onDidOpenTextDocument(({fileName}) => 
    //         fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) && jb.vscode.loadOpenedProjects())
    // },
    watchCursorChange() {
    //    vscodeNS.window.onDidChangeTextEditorSelection(jb.vscode.updatePosVariables)
    },
    // openedProjects() {
    //     return jb.utils.unique(vscodeNS.workspace.textDocuments
    //         .map(doc => (doc.fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) || ['',''])[1]))
    // },
    // loadOpenedProjects() {
    //     const doc = vscodeNS.window.activeTextEditor.document
    //     jb.frame.eval(jb.macro.importAll() + ';' + doc.getText() || '')
    // }
})

component('vscode.openQuickPickMenu', {
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

component('vscode.gotoPath', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'semanticPart', as: 'string' }
  ],
  impl: (ctx,path,semanticPart) => jb.vscode.gotoPath(path,semanticPart)
})

// component('probe.probeByCmd', {
//   params: [
//     {id: 'filePath', as: 'string'},
//     {id: 'probePath', as: 'string'}
//   ],
//   impl: async (ctx,filePath,probePath) => {
//     const sourceCode = jb.exec({$: 'probe', $typeCast: 'source-code<jbm>', filePath})
//     const args = ["-main:probe.runCircuit()",`-sourceCode:${JSON.stringify(sourceCode)}`,
//         `%probePath:${probePath}`, "-spy:probe", "-wrap:pipe(MAIN, probe.pruneResult(),first())"]

//     const command = `node --inspect-brk ../hosts/node/jb.js ${args.map(x=>`'${x}'`).join(' ')}`
//     jb.vscode.log(`probeByCmd: ${command}`)

//     if (jbHost.spawn) {
//         let res = null
//         try {
//           res = await jbHost.spawn(args)
//         } catch (e) {
//           jb.logException(e,'probeByCmd',{command})
//         }
//         try {
//           return {...JSON.parse(res), [jb.core.OnlyData]: true }
//         } catch (err) {
//           jb.logError('probeByCmd probe can not parse result returned from command line',{res: res.slice(0,200), command, err})
//         }
//     }
//   }
// })

