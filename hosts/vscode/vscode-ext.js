"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const {commands,ViewColumn,Uri,workspace, WorkspaceEdit} = vscode
const fs = require("fs")
const vm = require("vm")
const jbBaseProjUrl = '/home/shaiby/projects/jb-react' // TODO: to be put in extension
global.jbInvscode = true

function loadCodeLoaderServer() {
    try {
        const loaderCode = fs.readFileSync(`${jbBaseProjUrl}/src/loader/jb-loader.js`)+'\n//# sourceURL=jb-loader.js'
        vm.runInThisContext(loaderCode)
        jb_codeLoaderServer('vscode', {projects:['studio'], loadFileFunc, getAllCodeFunc })
    } catch (e) {
        vscode.window.showErrorMessage(`error loading jb-loader: ${JSON.stringify(e||'')}`)
    }    
}

function loadFileFunc(url) {
    vm.runInThisContext(fs.readFileSync(`${jbBaseProjUrl}${url}`),url)
}

function getAllCodeFunc(path,_include,_exclude) { // todo - use saved version
    const include = _include && new RegExp(_include)
    const exclude = _exclude && new RegExp(_exclude)
    return Promise.resolve(getFilesInDir(path).filter(f=>f.match(/\.js/)).map(path => fileContent(path)))

    function getFilesInDir(dirPath) {
      return fs.readdirSync(`${jbBaseProjUrl}/${dirPath}`).sort((x,y) => x == y ? 0 : x < y ? -1 : 1).reduce( (acc, file) => {
        const path = `${dirPath}/${file}`
        if (include && !include.test(path) || exclude && exclude.test(path)) return acc
        return fs.statSync(`${jbBaseProjUrl}/${path}`).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
      }, [])
    }
    function fileContent(path) {
      const content = fs.readFileSync(`${jbBaseProjUrl}/${path}`,'utf-8')
      return { path : '/' + path,
        ns: unique(content.split('\n').map(l=>(l.match(/^jb.component\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0])),
        libs: unique(content.split('\n').map(l=>(l.match(/^jb.extension\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0]))
      }
    }
    function unique(list) {
      const ret = {}
      list.forEach(x=>ret[x]=true)
      return Object.keys(ret)
    }
}


function activate(context) {
    loadCodeLoaderServer()
    const xx = jb.exec('hello world')
    const provider = new jBartStudio(context.extensionUri)
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(jBartStudio.viewType, provider))            
	// context.subscriptions.push(vscode.window.registerWebviewViewProvider('jbart.logs', provider))            
	// context.subscriptions.push(vscode.window.registerWebviewViewProvider('jbart.preview', provider))            
	// context.subscriptions.push(vscode.window.registerWebviewViewProvider('jbart.IO', provider))            
}
exports.activate = activate;

class jBartStudio {
    static viewType = 'jbart.jbEditor'
	constructor(_extensionUri) { 
        this._extensionUri = _extensionUri
    }    
    resolveWebviewView(panel,context,_token) {
		this._panel = panel

		panel.webview.options = {
			enableScripts: true,
			localResourceRoots: [Uri]
		}

		panel.webview.html = this.getHtmlForWebview(panel.webview)
	}
    show() {
        this._panel && this._panel.show(true)
    }
    getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html>
    <head>
    </head>
    <body class="vscode-studio">
        Hello
    </body>
</html>`
    }
}
