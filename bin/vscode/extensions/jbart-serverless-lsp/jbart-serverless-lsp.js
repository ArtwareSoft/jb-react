
const vscode = require('vscode');
globalThis.vscodeNS = vscode
if (importScripts.native) { // browser worker
    jbBaseUrl = location.origin || ''
    jbFetchFile = fetch.native && (path => fetch.native(path).then(x=>x.text()))
    importScripts.native(location.origin+'/src/loader/jb-loader.js')
} else { // nodejs
    jbBaseUrl = __dirname.replace(/\/hosts\/vscode$/)
    const loaderCode = require('fs').readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
    require('vm').runInThisContext(loaderCode)
    jbFetchFile = url => require('util').promisify(require('fs').readFile)(url)
    // define fileSymbolsFunc      
}
 
async function activate(context) {
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-lsp-server',{projects: ['studio','tests'], plugins: ['vscode'], doNotLoadLibs: true}))
    jb.initializeLibs(['utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode'])
    jb.vscode.initVscodeAsHost()
    // TODO: change to load the whole Project
    jb.frame.eval(jb.macro.importAll() + ';' + jb.tgpTextEditor.host.docText() || '')

    ;['gotoPath','applyCompChange','formatComponent'].forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.tgpTextEditor[cmd]))

    const ctx = new jb.core.jbCtx({},{vars: {}, path:'vscode.completion'})

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('jbart', {
		provideCompletionItems() {
            try {
                return jb.tgpTextEditor.provideCompletionItems(ctx)
            } catch(e) {
                jb.logException(e,'provide completions')
            }
		},
        // resolveCompletionItem(item) {
        //     return item
        // }
	}))
    context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('jbart',{
        provideEvaluatableExpression(doc, position) {
            return new vscodeNS.Hover('Hello World')
        }
    }))
    
}

module.exports = { activate }