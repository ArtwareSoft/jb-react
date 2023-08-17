globalThis.vscodeNS = require('vscode')
globalThis.jbVSCodeLog = vscodeNS.window.createOutputChannel('jbart').appendLine
function findjbReact() {
    const _dirname = __dirname.replace(/\\/g,'/')
    const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path.replace(/\\/g,'/'))[0] || ''
    const rep = (workspaceDir.match(/projects\/([^/]*)$/) || [])[1]
    jbVSCodeLog('rep:' + rep)
    if (rep)
        return workspaceDir.split('projects/')[0] + 'projects/jb-react'
  
    if (_dirname.match(/\/hosts\/vscode\/tgp-lang$/)) // debugger case
        return _dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')
    jbVSCodeLog('can not locate jbReact dir')
    jbVSCodeLog('_dirname:' + _dirname)
    jbVSCodeLog('workspaceDir:' + workspaceDir)
}

const { jbHost } = require(findjbReact() + '/hosts/node/node-host.js')
jbHost.WebSocket_WS = require('ws')
const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')
const plugins = ['common','rx','tree-shake','pretty-print','watchable','ui','vscode', 'tgp','remote','remote-widget','workspace']
// globalThis.jbInit = jbInit
// globalThis.jb_plugins = jb_plugins
 
async function activate(context) {
    globalThis.jb = await jbInit('jbart_lsp_ext', { plugins, doNoInitLibs: true, noTests: true })
    await jb.initializeLibs(['utils','treeShake','remoteCtx','jbm','cbHandler'
        ,'tgpTextEditor','vscode','nodeContainer'])
    jb.spy.initSpy({spyParam: 'remote,vscode'})
    await jb.vscode.initVscodeAsHost({context})

    ;['applyCompChange']
        .forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.tgpTextEditor[cmd]))

    ;['moveUp','moveDown','openProbeResultPanel','openjBartStudio','openLastCmd','openProbeResultEditor','closeProbeResultEditor','openjBartTest']
            .forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.vscode[cmd]))
    
    ;['main'].forEach(viewId => context.subscriptions.push(
        vscodeNS.window.registerWebviewViewProvider(`jbart.${viewId}`, jb.vscode.createWebViewProvider(viewId,context.extensionUri))))

	context.subscriptions.push(vscodeNS.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems() {
            try {
                const docProps = jb.tgpTextEditor.host.compTextAndCursor()
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
                return jb.vscode.provideDefinition(jb.tgpTextEditor.host.compTextAndCursor())
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