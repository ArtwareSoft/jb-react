
globalThis.vscodeNS = require('vscode')
globalThis.vsChild = require('child_process')
globalThis.vsPluginDir = __dirname

const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')    
console.log('jbBaseUrl',jbBaseUrl)
require(jbBaseUrl+ '/hosts/node/node-utils.js')

const { jbInit, jb_plugins } = require(jbBaseUrl+ '/src/loader/jb-loader.js')
globalThis.jbInit = jbInit
globalThis.jb_plugins = jb_plugins
 
async function activate(context) {
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-lsp-ext', {
        plugins: ['vscode', 'tgp'], doNoInitLibs: true
    }))
    await jb.initializeLibs(['utils','vscode','jbm','cbHandler','tgpTextEditor'])
    jb.spy.initSpy({spyParam: 'remote,vscode'})
    await jb.vscode.initVscodeAsHost({context})

    ;['gotoPath','restartLangServer','applyCompChange','moveUp','moveDown'].forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.tgpTextEditor[cmd]))

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
    // context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('jbart',{
    //     provideEvaluatableExpression(doc, position) {
    //         return new vscodeNS.Hover('Hello World')
    //     }
    // }))   
}

module.exports = { activate }