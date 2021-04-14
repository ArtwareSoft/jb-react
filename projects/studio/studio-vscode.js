jb.extension('vscode', {
    initExtension() { return { loadedProjects : {} } },
    async init() {
        global.spy = jb.spy.initSpy({spyParam: 'remote,codeLoader,watchable'})
        await jb.vscode.loadOpenedProjects()
        jb.vscode.watchFileChange()
        jb.vscode.watchCursorChange()
    },
    createWebViewProvider(id,extensionUri) { return {
        async resolveWebviewView(panel, context, _token) {
            this._panel = panel
            panel.webview.options = {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
            const webViewJbm = await jb.exec({$: `jbm.${id}WebView`, panel})
            jb.exec({ $: 'remote.widgetFrontEnd', control: {$: 'studio.vscodeStatus'}, jbm: ()=> webViewJbm, selector: '#main' } )
        }
    }},
    api() {
        jb.vscode._api = jb.vscode._api || (typeof acquireVsCodeApi != 'undefined' ? acquireVsCodeApi() : null)
        return jb.vscode._api
    },
    portFromWebViewToExt(from,to) { return {
        from, to,
        postMessage: _m => { 
            const m = {from, to,..._m}
            jb.log(`remote sent from ${from} to ${to}`,{m})
            jb.vscode.api().postMessage(m) 
        },
        onMessage: { addListener: handler => 
            jb.frame.addEventListener('message', e => jb.net.handleOrRouteMsg(from,to,handler,e.data)) 
        }
    }},
    portFromExtensionToWebView: (webview, from,to) => ({
        from, to,
        postMessage: _m => { 
            const m = {from, to,..._m}
            jb.log(`remote sent from ${from} to ${to}`,{m})
            webview.postMessage(m) 
        },
        onMessage: { addListener: handler => 
            webview.onDidReceiveMessage(m => jb.net.handleOrRouteMsg(from,to,handler,m))
        }
    }),
    watchFileChange() {
        const fileSystemWatcher = vscodeNS.workspace.createFileSystemWatcher("**/*.{ts,js}")
        fileSystemWatcher.onDidChange(() => {
            // todo: calc/format and save comp
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            const ref = ctx.exp('%$studio/scriptChangeCounter%','ref')
            jb.db.writeValue(ref, +jb.val(ref)+1 ,ctx)
        })
        vscodeNS.workspace.onDidOpenTextDocument(({fileName}) => 
            fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) && jb.vscode.loadOpenedProjects())
    },
    calcActiveEditorPath() {
        const editor = vscodeNS.window.activeTextEditor
        if (!editor) return
        const line = editor.selection.active.line, col = editor.selection.active.character
        const lines = editor.document.getText().split('\n')
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return
        const componentHeaderIndex = line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const path = jb.textEditor.getPathOfPos(compId, {line: line-componentHeaderIndex,col})
        return path
    },
    watchCursorChange() {
        vscodeNS.window.onDidChangeTextEditorSelection(() => {
            console.log('hey')
            const path = jb.vscode.calcActiveEditorPath()
            if (path) {
                const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
                const profilePath = (path.match(/^[^~]+~impl/) || [])[0]
                jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), profilePath ,ctx)
                jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
            }
        })
    },
    loadOpenedProjects() {
        const projects = jb.utils.unique(vscodeNS.workspace.textDocuments
            .map(doc => (doc.fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) || ['',''])[1])
            .filter(p=>p && p != 'studio' && !jb.vscode.loadedProjects[p]))
        projects.forEach(p=> jb.vscode.loadedProjects[p] = true)
        if (projects.length)
            return loadProjectsCode(projects)
    }
})

jb.component('jbm.vscodeWebView', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string' },
        {id: 'panel' },
        {id: 'init' , type: 'action', dynamic: true },
    ],    
    impl: (ctx,name,panel, init) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const webViewUri = `${jb.uri}•${name}`
        const _jbBaseUrl = 'http://localhost:8082'
        const code = jb.codeLoader.code(jb.codeLoader.treeShake([...jb.codeLoader.clientComps,'#vscode.portFromWebViewToExt'],{}))
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script>
    jb = { uri: '${webViewUri}'}
    ${code};

    jb.codeLoader.baseUrl = '${_jbBaseUrl}'
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
    jb.codeLoaderJbm = jb.parent = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromWebViewToExt('${webViewUri}','${jb.uri}'))
    </script>
    <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/material.css"/>

    <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/styles.css"/>
    <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/font.css"/>
    <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/projects/studio/css/studio.css"/>
    
</head>
<body class="vscode-studio">
    <div id="main"></div>
</body>
</html>`
        panel.webview.html = html
        jb.jbm.childJbms[name] = jb.jbm.extendPortToJbmProxy(
            jb.vscode.portFromExtensionToWebView(panel.webview, jb.uri, webViewUri))
        const result = Promise.resolve(init()).then(()=>jb.jbm.childJbms[name])
        result.uri = webViewUri
        return result
    }
})

jb.component('jbm.jbEditorWebView', {
    type: 'jbm',
    params: [
        {id: 'panel' },
    ],
    impl: jbm.vscodeWebView('jbEditor', '%$panel%')
})

jb.component('studio.vscodeStatus', {
    type: 'control',
    impl: group({
        controls: [
            text('profile path: %$studio/profile_path%'),
            studio.jbEditorInteliTree('%$studio/profile_path%')
        ],
        features: watchRef('%$studio/profile_path%')
    })
})

// jb.component('vscode.previewWebView', {
//     type: 'jbm',
//     params: [
//         {id: 'panel' },
//     ],
//     impl: jbm.vscodeWebView({
//         id: 'preview', 
//         init: runActions(
//             remote.action(runActions(
//                 () => jb.component('dataResource.studio', { watchableData: { preview: {}, scriptChangeCounter: 0} }),
//                 ({},{dataResources}) => { jb.ctxByPath = {}; jb.watchableComps.forceLoad() }, 
//             ), jbm.worker('preview')),
//             remote.initShadowData('%$studio%', jbm.worker('preview')),
//             rx.pipe(
//                 source.callbag(() => jb.watchableComps.handler.resourceChange),
//                 rx.map(obj(prop('op','%op%'), prop('path','%path%'))),
//                 rx.log('preview change script'),
//                 rx.var('cssOnlyChange',studio.isCssPath('%path%')),
//                 sink.action(remote.action( preview.handleScriptChangeOnWorker('%$cssOnlyChange%'), jbm.worker('preview')))
//             )
//         )
//     })
// })

