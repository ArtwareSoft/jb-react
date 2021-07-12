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
    jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
    ${jb_codeLoaderServer.toString()}
    ${jb_evalCode.toString()}

    jb = { uri: '${webViewUri}'}
    ${code};

    jb.codeLoader.baseUrl = '${_jbBaseUrl}'
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
    jb.codeLoaderJbm = jb.parent = jb.ports['${jb.uri}'] = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromWebViewToExt('${webViewUri}','${jb.uri}'))
    jb.parent.remoteExec(jb.remoteCtx.stripJS(() => jb.jbm.notifyChildReady['${webViewUri}']() ), {oneway: true} )
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
        jb.jbm.childJbms[name] = jb.ports[webViewUri] = jb.jbm.extendPortToJbmProxy(
            jb.vscode.portFromExtensionToWebView(panel.webview, jb.uri, webViewUri))
        const result = new Promise(resolve=> jb.jbm.notifyChildReady[webViewUri] = resolve)
            .then(() => jb.log('vscode jbm webview ready',{name}))
            .then(()=>init(ctx.setVar('jbm',jb.jbm.childJbms[name])))
            .then(()=>jb.jbm.childJbms[name])
        result.uri = webViewUri
        panel.webview.html = html
        return result
    }
})

// jb.component('jbm.vscodeWebViewWithCodeLoader', {
//     type: 'jbm',
//     params: [
//         {id: 'id', as: 'string' },
//         {id: 'panel' },
//         {id: 'init' , type: 'action', dynamic: true },
//     ],    
//     impl: (ctx,name,panel, init) => {
//         if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
//         const webViewUri = `${jb.uri}•${name}`
//         const _jbBaseUrl = 'http://localhost:8082'
//         const projects = JSON.stringify(jb.utils.unique(['studio', ...jb.vscode.openedProjects()]))
//         const html = `<!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/styles.css"/>
//     <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/font.css"/>
//     <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/projects/studio/css/studio.css"/>

//     <script>
//     jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
//     ${jb_codeLoaderServer.toString()}
//     ${jb_evalCode.toString()}
//     jb_codeLoaderServer('${webViewUri}',{ baseUrl: '${_jbBaseUrl}', projects: ${projects} }).then(()=>{
//         jb.parent = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromWebViewToExt('${webViewUri}','${jb.uri}'))
//         jb.exec(defaultTheme())
//         self.spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
//         jb.parent.remoteExec(jb.remoteCtx.stripJS(() => jb.jbm.notifyChildReady['${webViewUri}']() ), {oneway: true} )
//     })
//     </script>   
// </head>
// <body class="vscode-studio">
//     <div id="main"></div>
// </body>
// </html>`
//         jb.jbm.childJbms[name] = jb.ports[webViewUri] = jb.jbm.extendPortToJbmProxy(
//             jb.vscode.portFromExtensionToWebView(panel.webview, jb.uri, webViewUri))
//         const result = new Promise(resolve=> jb.jbm.notifyChildReady[webViewUri] = resolve)
//             .then(() => jb.log('vscode jbm webview ready',{name}))
//             .then(()=>init(ctx.setVar('jbm',jb.jbm.childJbms[name])))
//             .then(()=>jb.jbm.childJbms[name])
//         result.uri = webViewUri
//         panel.webview.html = html
//         return result
//     }
// })

// jb.component('jbm.vscodeWorker', {
//     type: 'jbm',
//     params: [
//         {id: 'id', as: 'string' },
//         {id: 'init' , type: 'action', dynamic: true },
//         {id: 'startupCode', type: 'startupCode', dynamic: true, defaultValue: startup.codeLoaderClient() },
//     ],    
//     impl: (ctx,name,init,startupCode) => {
//         if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
//         const workerUri = `${jb.uri}•${name}`
//         const code = startupCode(ctx.setVars({uri: workerUri, multipleJbmsInFrame: false}))
//         const workerCode = `
// global.jbInWorker = true
// global.importScripts = global.require
// jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
// ${jb_codeLoaderServer.toString()}
// ${jb_evalCode.toString()}
// function jb_loadFile(url, baseUrl) { 
//     baseUrl = baseUrl || location.origin || ''
//     return Promise.resolve(importScripts(baseUrl+url)) 
// }
// ${code};

// function ${jb.vscode.portFromWorkerToExt.toString()}
// const { parentPort} = require('worker_threads')
// jb.codeLoaderJbm = jb.parent = jb.ports['${jb.uri}'] = jb.jbm.extendPortToJbmProxy(portFromWorkerToExt(parentPort,'${workerUri}','${jb.uri}'))
// //jb.delay(3000).then(()=>{debugger})
// //# sourceURL=${workerUri}-startup.js
// `
//         const worker = new Worker(workerCode, {eval: true, stdout: true})
//         worker.on('exit', e=> console.log('worker exit'))
//         worker.on('error', e=> console.log('error in worker', e))
//         jb.jbm.childJbms[name] = jb.ports[workerUri] = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromExtensionToWorker(worker,jb.uri,workerUri))
//         const result = Promise.resolve(init(ctx.setVar('jbm',jb.jbm.childJbms[name]))).then(()=>jb.jbm.childJbms[name])
//         result.uri = workerUri
//         return result
//     }
// })

jb.component('vscode.openPreviewPanel', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'}
  ],
  impl: jbm.vscodeWebView({
      id: '%$id%', 
      panel: '%$panel%', 
      init: runActions(
          remote.useYellowPages(),
          studio.initPreview(),
          remote.action(renderWidget(vscode.previewCtrl(),'#main'), '%$jbm%')
        )
    })
})

jb.component('vscode.openLogsPanel', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'}
  ],
  impl: vscode.showInXWebView({
      id: '%$id%', 
      panel: '%$panel%', 
      backend: pipe(
        remote.data(jbm.child('logs'), jbm.preview()),
        jbm.byUri('%uri%'),
        first()
    )})
})

jb.component('vscode.showInXWebView', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'},
    {id: 'backend', type: 'jbm', defaultValue: jbm.self() }
  ],
  impl: runActionOnItem(
    Var('profToRun', obj(prop('$', 'vscode.%$id%Ctrl'))),
    jbm.vscodeWebView({
      id: '%$id%',
      panel: '%$panel%',
      init: runActions(remote.useYellowPages(), remote.action(defaultTheme(), '%$jbm%'))
    }),
    remote.distributedWidget({
      control: (ctx,{profToRun}) => ctx.run(profToRun),
      backend: '%$backend%',
      frontend: '%%',
      selector: '#main'
    })
  )
})

