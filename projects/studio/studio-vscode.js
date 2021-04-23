jb.extension('vscode', {
    initExtension() { return { loadedProjects : {} } },
    async init() {
        global.spy = jb.spy.initSpy({spyParam: 'dialog,watchable,headless,method'})
        await jb.vscode.loadOpenedProjects()
        jb.vscode.watchFileChange()
        jb.vscode.watchCursorChange()
        jb.vscode.updatePosVariables()
        await jb.exec(jbm.vscodeWorker({id: 'wPreview', init: studio.initPreview()}))
        console.log('preview loaded')
        jb.vscode.applyDeltaFromStudio()
    },
    createWebViewProvider(id,extensionUri) { 
        console.log('create provider',{id,extensionUri})
        return {
        async resolveWebviewView(panel, context, _token) {
            console.log('resolve webView',{id,extensionUri,context,panel})
            this._panel = panel
            panel.webview.options = {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
            panel.onDidDispose(() => console.log('panel disposed',{id,extensionUri}))
            panel.onDidChangeVisibility(() => { 
                console.log('panel changed vis',{visible: panel.visible, id,extensionUri})
                if (panel.visible)
                    show()
            })
            show()

            async function show() {
                console.log(`show ${id}`)
                const webViewJbm = await jb.exec({$: 'jbm.vscodeWebView', id, panel, init: {$: 'remote.useYellowPages'}})
                jb.exec({ 
                    $: 'remote.distributedWidget', 
                    control: {$: `vscode.${id}Ctrl`}, 
                    backend: () => id == 'preview' ? jb.jbm.childJbms.wPreview : jb, 
                    frontend: ()=> webViewJbm, 
                    selector: '#main' 
                })
            }
        }
    }},
    api() {
        jb.vscode._api = jb.vscode._api || (typeof acquireVsCodeApi != 'undefined' ? acquireVsCodeApi() : null)
        return jb.vscode._api
    },   
    watchFileChange() {
        vscodeNS.workspace.onDidSaveTextDocument(() => {
            const editor = vscodeNS.window.activeTextEditor
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            const {compId, compSrc} = jb.textEditor.closestComp(editor.document.getText(), {line: editor.selection.active.line})
            if (compId) {
                const compRef = jb.studio.refOfPath(compId)
                const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
                jb.textEditor.setStrValue(newVal, compRef, ctx)
            }
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
        vscodeNS.window.onDidChangeTextEditorSelection(jb.vscode.updatePosVariables)
    },
    updatePosVariables() {
        const path = jb.vscode.calcActiveEditorPath()
        if (path) {
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
            jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), path ,ctx)

            const profilePath = (path.match(/^[^~]+~impl/) || [])[0]
            jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
            const circuitOptions = jb.studio.circuitOptions(path.split('~')[0])
            if (circuitOptions && circuitOptions[0])
                jb.db.writeValue(ctx.exp('%$studio/circuit%','ref'), circuitOptions[0] ,ctx)
        }
    },
    loadOpenedProjects() {
        const projects = jb.utils.unique(vscodeNS.workspace.textDocuments
            .map(doc => (doc.fileName.split(jbBaseUrl).pop().match(/projects[/]([^/]*)/) || ['',''])[1])
            .filter(p=>p && p != 'studio' && !jb.vscode.loadedProjects[p]))
        projects.forEach(p=> jb.vscode.loadedProjects[p] = true)
        if (projects.length)
            return loadProjectsCode(projects)
    },
    applyDeltaFromStudio() {
        jb.utils.subscribe(jb.watchableComps.handler.resourceChange, async e => {
            const compId = e.path[0]
            const comp = jb.comps[compId]
            const fn = jbBaseUrl + comp[jb.core.location][0].toLowerCase()
            try {
                const doc = vscodeNS.workspace.textDocuments.find(doc => doc.uri.path.toLowerCase() == fn)
                if (!doc) return // todo: open file and try again
                const fileContent = doc.getText()
                if (fileContent == null) return
                const edits = [jb.save.deltaFileContent(fileContent, {compId,comp})].filter(x=>x)
                console.log('edits', edits)
                const edit = new vscodeNS.WorkspaceEdit()
                edit.set(doc.uri, edits)
                vscodeNS.workspace.applyEdit(edit)
            } catch (e) {
                jb.logException(e,'error while saving ' + compId,{compId, comp, fn}) || []
            }   
        })
    }
})

jb.extension('vscode', 'ports', {
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
    portFromWorkerToExt(parentPort,from,to) { return {
        parentPort, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`remote sent from ${from} to ${to}`,{m})
            parentPort.postMessage(m) 
        },
        onMessage: { addListener: handler => parentPort.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromExtensionToWorker(worker,from,to) { return {
        worker, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`remote sent from ${from} to ${to}`,{m})
            worker.postMessage(m) 
        },
        onMessage: { addListener: handler => worker.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
})

jb.component('studio.inVscode',{
    type: 'boolean',
    impl: () => jb.frame.jbInvscode
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
        jb.jbm.childJbms[name] = jb.ports[webViewUri] = jb.jbm.extendPortToJbmProxy(
            jb.vscode.portFromExtensionToWebView(panel.webview, jb.uri, webViewUri))
        const result = Promise.resolve(init(ctx.setVar('jbm',jb.jbm.childJbms[name]))).then(()=>jb.jbm.childJbms[name])
        result.uri = webViewUri
        return result
    }
})

jb.component('jbm.vscodeWorker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string' },
        {id: 'init' , type: 'action', dynamic: true },
        {id: 'startupCode', type: 'startupCode', dynamic: true, defaultValue: startup.codeLoaderClient() },
    ],    
    impl: (ctx,name,init,startupCode) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const workerUri = `${jb.uri}•${name}`
        const code = startupCode(ctx.setVars({uri: workerUri, multipleJbmsInFrame: false}))
        const workerCode = `
global.jbInWorker = true
global.importScripts = global.require
jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
${jb_codeLoaderServer.toString()}
${jb_evalCode.toString()}
function jb_loadFile(url, baseUrl) { 
    baseUrl = baseUrl || location.origin || ''
    return Promise.resolve(importScripts(baseUrl+url)) 
}
${code};

function ${jb.vscode.portFromWorkerToExt.toString()}
const { parentPort} = require('worker_threads')
jb.codeLoaderJbm = jb.parent = jb.ports['${jb.uri}'] = jb.jbm.extendPortToJbmProxy(portFromWorkerToExt(parentPort,'${workerUri}','${jb.uri}'))
jbLoadingPhase = 'appFiles'
//jb.delay(3000).then(()=>{debugger})
//# sourceURL=${workerUri}-startup.js
`
        const worker = new Worker(workerCode, {eval: true})
        worker.on('error', e=> console.log('error in worker', e))
        jb.jbm.childJbms[name] = jb.ports[workerUri] = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromExtensionToWorker(worker,jb.uri,workerUri))
        const result = Promise.resolve(init(ctx.setVar('jbm',jb.jbm.childJbms[name]))).then(()=>jb.jbm.childJbms[name])
        result.uri = workerUri
        return result
    }
})

jb.component('vscode.jbEditorCtrl', {
    type: 'control',
    impl: group({
        controls: [
            text('profile path: %$studio/profile_path%, selected: '),
            text('%$studio/jbEditor/selected%'),
            studio.jbEditorInteliTree('%$studio/profile_path%')
        ],
        features: [ watchRef('%$studio/profile_path%'), watchRef('%$studio/scriptChangeCounter%') ]
    })
})

jb.component('vscode.previewCtrl', {
    type: 'control',
    impl: group({
        controls: [
            text('circuit: %$studio/circuit%'),    
            preview.control()
        ],
    })
})
