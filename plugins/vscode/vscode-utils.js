using('tgp-lang-server,probe-result-ui')

extension('vscode', 'utils', {
    initExtension() { return { 
        panels: {},
        ctx: new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLang'})
    } },
    async initVscodeAsHost({context}) {
        jb.log('vscode initVscodeAsHost', {context})
        jb.tgpTextEditor.host = {
            async applyEdit(edit,{uri,hash} = {}) {
                const editor = vscodeNS.window.activeTextEditor
                uri = uri || editor.document.uri
                const wEdit = new vscodeNS.WorkspaceEdit()
                wEdit.replace(uri, { start: jb.vscode.toVscodeFormat(edit.range.start), end: jb.vscode.toVscodeFormat(edit.range.end) }, edit.newText)
                jb.log('vscode applyEdit',{wEdit, edit,uri})
                jb.tgpTextEditor.lastEdit = edit.newText
                if (hash) {
                    const { compText } = jb.tgpTextEditor.closestComp(editor.document.getText(),
                        editor.selection.active.line, editor.selection.active.character, editor.document.uri.path)
                    const code = '{\n' + (compText||'').split('\n').slice(1).join('\n').slice(0, -1)
                    if (hash != jb.tgpTextEditor.calcHash(code))
                        return jb.logError('applyEdit - different hash. edit will not be applied',{edit, text})
                }
                await vscodeNS.workspace.applyEdit(wEdit)
             },
            async selectRange(start,end) {
                end = end || start
                const editor = vscodeNS.window.activeTextEditor
                const line = start.line
                 editor.revealRange(new vscodeNS.Range(line, 0,line, 0), vscodeNS.TextEditorRevealType.InCenterIfOutsideViewport)
                 editor.selection = new vscodeNS.Selection(line, start.col, end.line, end.col)
             },
            compTextAndCursor() {
                const editor = vscodeNS.window.activeTextEditor
                const docProps = jb.tgpTextEditor.closestComp(editor.document.getText(),
                    editor.selection.active.line, editor.selection.active.character, editor.document.uri.path)
                if (jb.path(docProps,'shortId')) {
                    if (jb.vscode.lastEdited != docProps.shortId)
                        jb.langService.tgpModels1 = {} // clean cache
                    jb.vscode.lastEdited = docProps.shortId
                }
                return docProps
            },
            async execCommand(cmd) {
                vscodeNS.commands.executeCommand(cmd)
            },
            saveDoc() {
                return vscodeNS.window.activeTextEditor.document.save()
            },
            async gotoFilePos({path,line,col}) {
                const targetUri = vscodeNS.Uri.file(jbHost.jbReactDir+path)
                const position = new vscodeNS.Position(line, col)
                const doc = await vscodeNS.workspace.openTextDocument(targetUri)
                const editor = await vscodeNS.window.showTextDocument(doc, { preview: false })
                editor.selection = new vscodeNS.Selection(position, position)
                await editor.revealRange(new vscodeNS.Range(position, position))
                jb.vscode.log(`gotoFilePos ${path}:${line},${col}`)
            }
        }
        jb.vscode.log('init')

        vscodeNS.workspace.onDidChangeTextDocument(({document, reason, contentChanges}) => {
            if (!contentChanges || contentChanges.length == 0) return
            if (!document.uri.toString().match(/^file:/)) return
            jb.log('vscode onDidChangeTextDocument clean cache',{document, reason, contentChanges})
            if (jb.path(contentChanges,'0.text') == jb.tgpTextEditor.lastEdit) {
                jb.tgpTextEditor.lastEdit = ''
            }
        })      
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
        jbHost.log([...args,`time: ${new Date().getTime() % 100000}`])
    },
    provideCompletionItems() {
        return jb.calc(langService.completionItems())
    },
    async provideDefinition() {
        const loc = await jb.calc(langService.definition())
        if (!loc)
            return jb.logError('provideDefinition - no location returned', {})
        const repos = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path)
            .map(path=>({path,repo: path.split('/').pop()}))
        const repo = repos.find(x=>x.repo == loc.repo) 
        const path = ((repo || {}).path || jbHost.jbReactDir) + loc.path
        return new vscodeNS.Location(vscodeNS.Uri.file(path), new vscodeNS.Position((+loc.line) || 0, 0))
    },
    async provideReferences() {
        const locations = await jb.calc(langServer.references()) 
        const base = jbHost.jbReactDir
        const res = locations.map(({path, line, col}) => new vscodeNS.Location(vscodeNS.Uri.file(base + path), new vscodeNS.Position(line-1, col)))
        return res
    },
    // commands    
    moveUp() {
        return jb.vscode.moveInArray(-1)
    },
    moveDown() { 
        return jb.vscode.moveInArray(1)
    },
    async moveInArray(diff) {
        const {edit, cursorPos} = await jb.vscode.ctx.setData(diff).run(langService.moveInArrayEdits('%%'))
        await jb.tgpTextEditor.host.applyEdit(edit)
        cursorPos && jb.tgpTextEditor.host.selectRange(cursorPos)
    },
    async openProbeResultPanel() {
        const probeRes = await jb.calc(langServer.probe())
        jb.vscode.panels.main.render('probeUI.probeResViewForVSCode',probeRes)
    },
    async openProbeResultEditor() { // ctrl-I
        vscodeNS.commands.executeCommand('workbench.action.editorLayoutTwoRows')
        const compProps = await jb.calc(langService.calcCompProps()) // IMPORTANT - get comp props here. opening the view will change the current editor
        if (!jb.vscode.panels.inspect) {
            jb.vscode.panels.inspect = {}
            const panel = jb.vscode.panels.inspect.panel = vscodeNS.window.createWebviewPanel('jbart.inpect', 'inspect', vscodeNS.ViewColumn.Two, { enableScripts: true })
            panel.onDidDispose(() => { 
                delete jb.vscode.panels.inspect
                delete jb.jbm.childJbms.vscode_inspect
            })
            jb.vscode.panels.inspect.jbm = await jb.exec(jbm.start(vscodeWebView({ id: 'vscode_inspect', panel: () => panel})))
        }
        const probeRes = await jb.vscode.ctx.setData(compProps).run(langServer.probe()) || { compProps, errors: ['null probe res']}
        probeRes.$$asIs = true
        probeRes.badFormat = (probeRes.errors || []).find(x=>x.err == 'reformat edits') && true

        return jb.vscode.ctx.setData(probeRes).run(
            remote.action(renderWidget({$: 'probeUI.probeResViewForVSCode', probeRes: '%%'}, '#main'), ()=> jb.vscode.panels.inspect.jbm))
    },
    visitLastPath() { // ctrl-Q
        jb.tgpTextEditor.visitLastPath()
    },
    async closeProbeResultEditor() { // ctrl-shift-I
        delete jb.vscode.panels.inspect
        delete jb.jbm.childJbms.vscode_inspect
        vscodeNS.commands.executeCommand('workbench.action.editorLayoutSingle')
    },
    async openLiveProbeResultPanel() {
    },
    async openjBartStudio() { // ctrl-j - should open quick menu
        const compProps = await jb.calc(langService.calcCompProps({includeCircuitOptions: true}))
        if (compProps.path)
            jb.vscode.ctx.setData(compProps).run(vscode.jbMenu())

        // const url = await jb.calc(langServer.studioCircuitUrl())
        // vscodeNS.env.openExternal(vscodeNS.Uri.parse(url))
    },
    async openjBartTest() { // ctrl-shift-j - should open menu
        const docProps = jb.tgpTextEditor.host.compTextAndCursor()
        const testID = docProps.shortId
        const spyParam = jb.spy.spyParamForTest(testID)
        const _repo = ((docProps.filePath || '').match(/projects\/([^/]*)/) || [])[1]
        const repo = _repo != 'jb-react' ? `&repo=${_repo}` : ''
        vscodeNS.env.openExternal(`http://localhost:8082/hosts/tests/tests.html?test=${testID}&show${repo}&spy=${spyParam}`)
    },
    openLastCmd() {
        const url = jbHost.fs.readFileSync(jbHost.jbReactDir + '/temp/runCtxUrl')
        vscodeNS.env.openExternal(vscodeNS.Uri.parse(url))
    },
    async delete() {
        const {edit, cursorPos, hash} = await jb.calc(langService.deleteEdits())
        await jb.tgpTextEditor.host.applyEdit(edit,{hash})
        cursorPos && jb.tgpTextEditor.host.selectRange(cursorPos)
    },
    async disable() {
        const {edit, cursorPos, hash} = await jb.calc(langService.disableEdits())
        await jb.tgpTextEditor.host.applyEdit(edit,{hash})
        cursorPos && jb.tgpTextEditor.host.selectRange(cursorPos)
    },
    async duplicate() {
        const {edit, cursorPos, hash} = await jb.calc(langService.duplicateEdits())
        await jb.tgpTextEditor.host.applyEdit(edit,{hash})
        cursorPos && jb.tgpTextEditor.host.selectRange(cursorPos)
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
    }
})

component('vscode.openQuickPickMenu', {
  type: 'action<>',
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

component('vscode.jbMenu', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: vscode.openQuickPickMenu(langServer.jBartMenu())
})

component('vscode.gotoFilePos', {
  type: 'action<>',
  params: [
    {id: 'location'},
  ],
  impl: (ctx,location) => {
    debugger
    jb.tgpTextEditor.host.gotoFilePos(location)
  }
})

component('langServer.jBartMenu', {
  type: 'menu.option<>',
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: menu.menu({
    vars: [
      Var('circuit', '%$compProps/circuitOptions/0/shortId%')
    ],
    title: 'type: %$compProps/type%, pluginDsl: %$compProps/pluginDsl%, fileDsl: %$compProps/fileDsl%',
    options: [
      menu.action('goto circuit: %$circuit%', vscode.gotoFilePos('%$compProps/circuitOptions/0/location%')),
      menu.action('open test circuit: %$circuit%', gotoUrl(langServer.testUrl())),
      menu.action('open studio for circuit: %$circuit% at %$compProps/path%', gotoUrl(langServer.studioCircuitUrl())),
      menu.action('open probe in browser', gotoUrl(langServer.runCtxOfRemoteCmdUrl()))
    ]
  })
})
