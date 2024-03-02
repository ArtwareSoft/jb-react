dsl('jbm')
using('remote-widget')

extension('vscode', 'ports', {
    portFromWebViewToExt(from,to) { return {
        from, to,
        postMessage: _m => { 
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
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
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
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
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            parentPort.postMessage(m) 
        },
        onMessage: { addListener: handler => parentPort.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromExtensionToWorker(worker,from,to) { return {
        worker, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            worker.postMessage(m) 
        },
        onMessage: { addListener: handler => worker.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromForkToExt(parentProcess,from,to) { return {
        parentProcess, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            parentProcess.send(m) 
        },
        onMessage: { addListener: handler => parentProcess.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromExtensionToFork(child,from,to) { return {
        child, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            child.send(m) 
        },
        onMessage: { addListener: handler => child.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},   
})

// component('completionServer', {
//   type: 'jbm<jbm>',
//   impl: remoteNodeWorker({
//     id: 'completionServer',
//     loadTests: true,
//     inspect: 7010,
//     spyParam: 'vscode,completion,remote'
//   })
// })

// jb.component('vscodeRemoteProbe', {
//   type: 'jbm',
//   params: [
//     {id: 'filePath', as: 'ref'},
//     {id: 'probePath', as: 'ref'}
//   ],
//   impl: remoteNodeWorker({
//     id: 'remoteProbe',
//     projects: tgp.pluginsOfFilePath('%$filePath%'),
//     restart: source.watchableData('%$filePath%'),
//     init: vscode.initRemoteProbe('%$probePath%'),
//     loadTests: true,
//     inspect: 7011,
//     nodeContainerUrl: 'http://localhost:8082',
//     spyParam: 'vscode,remote'
//   })
// })

// jb.component('vscode.initRemoteProbe', {
//   type: 'action',
//   impl: runActions(
//     remote.shadowResource('probe', '%$jbm%'),
//     rx.pipe(
//       vscode.scriptChange(),
//       rx.log('vscode preview probe change script'),
//       rx.map(obj(prop('op', '%op%'), prop('path', '%path%'))),
//       rx.var('cssOnlyChange', tgp.isCssPath('%path%')),
//       sink.action(
//         remote.action({
//           action: probe.handleScriptChangeOnPreview('%$cssOnlyChange%'),
//           jbm: '%$jbm%',
//           oneway: true
//         })
//       )
//     )
//   )
// })

component('vscodeWebView', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: sourceCode(plugins('remote,remote-widget,vscode,probe-result-ui')) },
    {id: 'init', type: 'action', dynamic: true}
  ],
  impl: (ctx,id,panel,sourceCode, init) => {
        if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
        const webViewUri = `${jb.uri}•${id}`
        const _jbBaseUrl = 'http://localhost:8082'
        sourceCode.plugins = sourceCode.plugins
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="${_jbBaseUrl}/plugins/loader/jb-loader.js"></script>
    <script type="text/javascript" src="${_jbBaseUrl}/dist/codemirror.js"></script>
    <link rel="stylesheet" type="text/css" href="${_jbBaseUrl}/dist/css/codemirror.css"/>

    <script>
    jbHost.baseUrl = '${_jbBaseUrl}'
    ;(async () => {
      globalThis.jb = await jbInit('${webViewUri}', ${JSON.stringify(sourceCode)})
      globalThis.spy = jb.spy.initSpy({spyParam: 'remote,vscode'})
      jb.parent = jb.ports['${jb.uri}'] = jb.jbm.extendPortToJbmProxy(jb.vscode.portFromWebViewToExt('${webViewUri}','${jb.uri}'))
      jb.parent.remoteExec(jb.remoteCtx.stripJS(() => jb.jbm.notifyChildReady['${webViewUri}']() ), {oneway: true} )
      function ${jb.vscode.portFromWebViewToExt.toString()}
    })()

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
        return jb.jbm.childJbms[id] = {
            uri: webViewUri,
            async rjbm() {
                if (this._rjbm) return this._rjbm
                this._rjbm = jb.ports[webViewUri] = jb.jbm.extendPortToJbmProxy(
                    jb.vscode.portFromExtensionToWebView(panel.webview, jb.uri, webViewUri))
                await new Promise(resolve=> {
                    jb.jbm.notifyChildReady[webViewUri] = resolve
                    panel.webview.html = html
                })
                jb.log('vscode jbm webview ready',{id})
                await init(ctx.setVar('jbm',jb.jbm.childJbms[id]))
                return jb.jbm.childJbms[id]
            }
        }
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
//     ${jbInit.toString()}
//     ${jbSupervisedLoad.toString()}
//     jbInit('${webViewUri}',{ baseUrl: '${_jbBaseUrl}', projects: ${projects} }).then(()=>{
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

  // jb.component('initJb.vcodeCompletionWorker', {
  //   type: 'initJbCode',
  //   impl: ({vars}) => {
  //     const f = async () => { 
  //         globalThis.jb = await jbInit('URI', {
  //             projects: ['studio','tests'], plugins: ['vscode', ...jb_plugins], doNoInitLibs: true
  //         })
  //         await jb.initializeLibs(['utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode','jbm','cbHandler','treeShake'])
  //     }
  //     const func = f.toString().replace(/URI/,vars.uri)
  //     return `(${func})()`
  //     }
  // })

  // jb.component('jbm.vscodeFork', {
  //   type: 'jbm',
  //   params: [
  //     {id: 'id', as: 'string', defaultValue: 'server'},
  //     {id: 'initJbCode', type: 'initJbCode', dynamic: true, defaultValue: initJb.vcodeCompletionWorker()}
  //   ],
  //   impl: (ctx,name,initJbCode) => {
  //     if (jb.jbm.childJbms[name] && !jb.vscode.restartLangServer) 
  //       return jb.jbm.childJbms[name]
  //     const forkUri = `${jb.uri}•${name}`
  //     if (jb.vscode.restartLangServer) {
  //       if (jb.path(jb.jbm.childJbms[name],'kill'))
  //         jb.jbm.childJbms[name].kill()
  //       const killThemAll = "ps -aux | grep tgp-lang | cut -d ' ' -f 5 | xargs kill"
  //       jb.frame.jbRunShell && jb.frame.jbRunShell(killThemAll)

  //       delete jb.jbm.childJbms[name]
  //       delete jb.ports[forkUri]
  //       jb.vscode.restartLangServer = false
  //     }

  //     const initJBCode = initJbCode(ctx.setVars({uri: forkUri, multipleJbmsInFrame: false}))

  //   const workerCode = `
  // const fs = require('fs')
  // const util = require('util')
  // const vm = require('vm')
  // globalThis.jbInWorker = true
  // process.send('forkJbmLog: start-loading')  

  // globalThis.jbBaseUrl = '${jbBaseUrl}'
  // globalThis.jbFetchFile = url => util.promisify(fs.readFile)(url)
  // globalThis.jbFetchJson = url => (util.promisify(fs.readFile)(url)).then(x=>JSON.parse(x))
  // require(jbBaseUrl+ '/hosts/node/node-host.js')

  // const { jbInit, jb_plugins } = require(jbBaseUrl+ '/plugins/loader/jb-loader.js')
  // globalThis.jbInit = jbInit
  // globalThis.jb_plugins = jb_plugins

  // ;(async () => {
  //   await ${initJBCode};
  //   globalThis.spy = jb.spy.initSpy({spyParam: 'remote,vscode,completion,tgpTextEditor'})
  //   jb.treeShake.codeServerJbm = jb.parent = jb.ports['${jb.uri}'] = jb.jbm.extendPortToJbmProxy(portFromForkToExt(process,'${forkUri}','${jb.uri}'))
  //   await jb.vscode.initServer('${jb.uri}')
  //   process.send('jbm-loaded')  
  //   function ${jb.vscode.portFromForkToExt.toString()}
  // })()

  // //# sourceURL=${forkUri}-initJb.js
  //         `
  //         const fork = vsChild.fork(`${vsPluginDir}/minimal-child.js`,['--inspect=7010'])

  //         const res = new Promise(resolve=>{
  //           console.log('fork',fork)
  //           fork.send(`eval:${workerCode}`);
    
  //           jb.jbm.childJbms[name] = jb.ports[forkUri] = 
  //               jb.jbm.extendPortToJbmProxy(jb.vscode.portFromExtensionToFork(fork,jb.uri,forkUri))
  //           jb.jbm.childJbms[name].uri = forkUri
  //           jb.jbm.childJbms[name].kill = fork.kill
  //           jb.jbm.childJbms[name].pid = fork.pid  

  //           fork.on('exit', (code,ev) => {
  //             console.log(`fork exit ${code} ${ev}`)
  //             resolve()
  //           })
  //           fork.on('error', e=> {
  //             console.log('error in fork', e)
  //             resolve()
  //           })

  //           function jbmLoadedHandler(message) {
  //             if (message == 'jbm-loaded') {
  //               fork.off('message', jbmLoadedHandler)
  //               resolve()
  //             }
  //           }
  //           fork.on('message', jbmLoadedHandler);          
  //         }).then( () => {
  //           console.log(`fork ${fork.pid} after init`)
  //           return jb.jbm.childJbms[name]
  //         })
  //         res.uri = forkUri
  //         return res
  //     }
  // })

