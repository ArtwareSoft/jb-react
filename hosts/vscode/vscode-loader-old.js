"use strict";
Object.defineProperty(exports, "__esModule", { value: true })
global.vscodeNS = require("vscode")
global.fs = require("fs")
const vm = require("vm")
const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.path).filter(path=>path.match(/jb-react/))[0]
global.jbBaseUrl = __dirname.match(/extensions/) ? workspaceDir : __dirname.replace(/\/hosts\/vscode$/,'')
// TODO: support more generic tree shake - internet, or locally installed
global.jbInvscode = true
global.loadProjectsCode = loadProjectsCode
global.Worker = require('worker_threads').Worker

console.log('vscode init 0')

async function activate(context) {
    try {
        const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
        vm.runInThisContext(loaderCode)
        global.jb = await jbInit('vscode', { projects: ['studio'], fileSymbolsFunc })
    } catch (e) {
        return vscodeNS.window.showErrorMessage(`error loading jb-loader: ${JSON.stringify(e || '')}`)
    }
    console.log('vscode init')
    await jb.vscode.init()

    ;['preview','jbEditor','logs'].forEach(viewId => context.subscriptions.push(
        vscodeNS.window.registerWebviewViewProvider(`jbart.${viewId}`, jb.vscode.createWebViewProvider(viewId,context.extensionUri))))
    ;['formatComponent','onEnter'].forEach(cmd => vscodeNS.commands.registerCommand(`jbart.${cmd}`, jb.vscode[cmd]))
}
exports.activate = activate

// function loadTreeShakeServer() {
//     try {
//         const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
//         vm.runInThisContext(loaderCode)
//         return jbInit('vscode', { projects: ['studio'], fileSymbolsFunc })
//     } catch (e) {
//         vscodeNS.window.showErrorMessage(`error loading jb-loader: ${JSON.stringify(e || '')}`)
//     }
// }

global.jbFetchFile = url => {
    try {
        return require('util').promisify(fs.readFile)(url)
    } catch (e) {
        console.log(url,e)
        vscodeNS.window.showErrorMessage(`error loading ${url} ${e}`)
    }
    return Promise.resolve()
}

function fileSymbolsFunc(path, _include, _exclude) {
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

async function loadProjectsCode(projects) {
    const projectsCode = await projects.reduce( async (acc,project) => [...await acc, ...await fileSymbolsFunc(`projects/${project}`)], [])
    await jbSupervisedLoad(projectsCode,jb)
}

