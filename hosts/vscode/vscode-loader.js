"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
global.vscodeNS = require("vscode");
global.fs = require("fs")
const vm = require("vm")
const {Worker} = require('worker_threads')
global.jbBaseUrl = '/home/shaiby/projects/jb-react' // TODO: to be put in a global place, maybe in extension code
// (vscode.workspace.workspaceFolders[0] || { uri: { path: '' } }).uri.path
global.jbInvscode = true
global.reloadJbart = loadCodeLoaderServer
global.loadProjectsCode = loadProjectsCode
global.Worker = Worker

console.log('vscode extension started')

async function activate(context) {
    console.log('vscode extension activate')
    await loadCodeLoaderServer()
    console.log('vscode init')
    await jb.vscode.init()
    context.subscriptions.push(vscodeNS.window.registerWebviewViewProvider('jbart.preview', jb.vscode.createWebViewProvider('preview',context.extensionUri)))
    context.subscriptions.push(vscodeNS.window.registerWebviewViewProvider('jbart.jbEditor', jb.vscode.createWebViewProvider('jbEditor',context.extensionUri)))
}
exports.activate = activate

function loadCodeLoaderServer() {
    try {
        const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
        vm.runInThisContext(loaderCode)
        return jb_codeLoaderServer('vscode', { projects: ['studio'], loadFileFunc, getAllCodeFunc })
    } catch (e) {
        vscodeNS.window.showErrorMessage(`error loading jb-loader: ${JSON.stringify(e || '')}`)
    }
}

function loadFileFunc(url) {
    vm.runInThisContext(fs.readFileSync(`${jbBaseUrl}${url}`), url)
}

function getAllCodeFunc(path, _include, _exclude) {
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

async function loadProjectsCode(projects) {
    const projectsCode = await projects.reduce( async (acc,project) => [...await acc, ...await getAllCodeFunc(`projects/${project}`)], [])
    await jb_evalCode(projectsCode,{jb, jb_loadFile: loadFileFunc})
}

