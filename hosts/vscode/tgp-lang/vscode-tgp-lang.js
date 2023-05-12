globalThis.vscodeNS = require('vscode')
//globalThis.vsChild = require('child_process')
//globalThis.vsHttp = require('http')
function findjbReact() {
    const underJbReact = (__dirname.match(/projects\/jb-react(.*)$/) || [''])[1]
    if (underJbReact)
        return __dirname.slice(0,-1*underJbReact.length)
    const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
    if (__dirname.match(/extensions/)) 
        return workspaceDir
    return __dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')            
    // const dir2 = [...__dirname.split('/').slice(0,__dirname.split('/').indexOf('projects')), 'jb-react'].join('/')
    // if (fs.statSync(dir2).isDirectory())
    //     return dir2
}

// const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
// global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')    
// console.log('jbBaseUrl',jbBaseUrl)
const { jbHost } = require(findjbReact() + '/hosts/node/node-host.js')
jbHost.WebSocket_WS = require('ws')
const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')
const plugins = ['common','rx','tree-shake','pretty-print','watchable','ui','vscode', 'tgp','remote','remote-widget']
// globalThis.jbInit = jbInit
// globalThis.jb_plugins = jb_plugins
 
async function activate(context) {
    globalThis.jb = await jbInit('jbart-lsp-ext', { plugins, doNoInitLibs: true, noTests: true })
    await jb.initializeLibs(['utils','treeShake','remoteCtx','jbm','cbHandler'
        ,'tgpTextEditor','vscode','nodeContainer'])
    jb.spy.initSpy({spyParam: 'remote,vscode'})
    await jb.vscode.initVscodeAsHost({context})

    ;['applyCompChange']
        .forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.tgpTextEditor[cmd]))

    ;['moveUp','moveDown','openProbeResultPanel','restartLangServer']
            .forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.vscode[cmd]))
    
    ;['main'].forEach(viewId => context.subscriptions.push(
        vscodeNS.window.registerWebviewViewProvider(`jbart.${viewId}`, jb.vscode.createWebViewProvider(viewId,context.extensionUri))))

	context.subscriptions.push(vscodeNS.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems() {
            try {
                const docProps = jb.tgpTextEditor.host.docTextAndCursor()
                jb.log('vscode provideCompletionItems request',{docProps})
                return jb.vscode.provideCompletionItems(docProps)
            } catch(e) {
                jb.logException(e,'provide completions')
            }
		}
	}))
	context.subscriptions.push(vscodeNS.languages.registerDefinitionProvider('javascript', {
		provideDefinition() {
            try {
                return jb.vscode.provideDefinition(jb.tgpTextEditor.host.docTextAndCursor())
            } catch(e) {
                jb.logException(e,'provide definition')
            }
        }
	}))
    // jb.delat(5000).then(()=> {
    //     ;['main'].forEach(viewId => context.subscriptions.push(
    //         vscodeNS.commands.registerWebviewViewProvider(`jbart.${viewId}`, jb.vscode.createWebViewProvider(viewId,context.extensionUri))))
    // })

    // context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('jbart',{
    //     provideEvaluatableExpression(doc, position) {
    //         return new vscodeNS.Hover('Hello World')
    //     }
    // }))   
}

module.exports = { activate }