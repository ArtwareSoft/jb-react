
globalThis.vscodeNS = require('vscode')

const fs = require('fs')
const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode\/preview$/,'')    
console.log('jbBaseUrl',jbBaseUrl)
const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
require('vm').runInThisContext(loaderCode)
globalThis.jbFetchFile = url => require('util').promisify(fs.readFile)(url)
globalThis.jbFileSymbols = fileSymbolsFunc // function defined below
 
async function activate(context) {
    // TODO: change to load the Project instead of studio and tests
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-preview',{projects: ['studio','tests'], plugins: ['vscode'], doNoInitLibs: true}))
    jb.initializeLibs(['utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode'])
    jb.vscode.initVscodeAsHost()

    ;['preview'].forEach(viewId => context.subscriptions.push(
        vscodeNS.window.registerWebviewViewProvider(`jbart.${viewId}`, jb.vscode.createWebViewProvider(viewId,context.extensionUri))))
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