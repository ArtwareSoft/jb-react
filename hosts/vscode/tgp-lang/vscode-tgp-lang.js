
globalThis.vscodeNS = require('vscode')

const fs = require('fs')
const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode\/tgp-lang$/,'')    
console.log('jbBaseUrl',jbBaseUrl)
const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
require('vm').runInThisContext(loaderCode)
globalThis.jbFetchFile = url => require('util').promisify(fs.readFile)(url)
globalThis.jbFileSymbols = fileSymbolsFunc // function defined below
 
async function activate(context) {
    // TODO: change to load the Project instead of studio and tests
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-lsp-server',{projects: ['studio','tests'], plugins: ['vscode', ...jb_plugins], doNoInitLibs: true}))
    jb.initializeLibs(['utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode'])
    jb.vscode.initVscodeAsHost()
    // try {
    //     jb.frame.eval(jb.macro.importAll() + ';' + jb.tgpTextEditor.host.docText() || '')
    // } catch(e) {}

    ;['gotoPath','applyCompChange','formatComponent','moveUp','moveDown'].forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.tgpTextEditor[cmd]))

    const ctx = new jb.core.jbCtx({},{vars: {}, path: 'vscode.tgpLang'})

	context.subscriptions.push(vscodeNS.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems() {
            try {
                return jb.tgpTextEditor.provideCompletionItems(ctx)
            } catch(e) {
                jb.logException(e,'provide completions')
            }
		}
	}))
	context.subscriptions.push(vscodeNS.languages.registerDefinitionProvider('javascript', {
		provideDefinition() {
            try {
                return jb.tgpTextEditor.provideDefinition(ctx)
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

function fileSymbolsFunc(path, _include, _exclude) {
    const fs = require('fs')
    const include = _include && new RegExp(_include)
    const exclude = _exclude && new RegExp(_exclude)
    return Promise.resolve(getFilesInDir(path).filter(f => f.match(/\.js/)).map(path => fileContent(path)))

    function getFilesInDir(dirPath) {
        return fs.readdirSync(`${jbBaseUrl}/${dirPath}`).sort((x, y) => x == y ? 0 : x < y ? -1 : 1).reduce((acc, file) => {
            const path = `${dirPath}/${file}`
            if (include && !include.test(path) || exclude && exclude.test(path)) return acc
            return fs.statSync(`${jbBaseUrl}/${path}`).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
        }, [])
    }
    function fileContent(path) {
        const content = fs.readFileSync(`${jbBaseUrl}/${path}`, 'utf-8')
        return {
            dsl: unique(content.split('\n').map(l=>(l.match(/^jb.dsl\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0]))[0],
            path: '/' + path,
            ns: unique(content.split('\n').map(l => (l.match(/^jb.component\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0])),
            libs: unique(content.split('\n').map(l => (l.match(/^jb.extension\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0]))
        }
    }
    function unique(list) {
        const ret = {}
        list.forEach(x => ret[x] = true)
        return Object.keys(ret)
    }
}

module.exports = { activate }