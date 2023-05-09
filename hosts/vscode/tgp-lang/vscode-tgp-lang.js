
globalThis.vscodeNS = require('vscode')
globalThis.vsChild = require('child_process')
globalThis.vsNet = require('net')
globalThis.vsHttp = require('http')

globalThis.vsPluginDir = __dirname

const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')    
console.log('jbBaseUrl',jbBaseUrl)
require(jbBaseUrl+ '/hosts/node/node-utils.js')

const { jbInit, jb_plugins } = require(jbBaseUrl+ '/plugins/loader/jb-loader.js')
globalThis.jbInit = jbInit
globalThis.jb_plugins = jb_plugins
 
async function activate(context) {
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-lsp-ext', {
        plugins: ['common','rx','tree-shake','pretty-print','watchable','ui','vscode', 'tgp','remote','remote-widget']
        , doNoInitLibs: true, noTests: true
    }))
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