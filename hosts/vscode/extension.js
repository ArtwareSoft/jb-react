"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const {commands,ViewColumn,Uri,workspace, WorkspaceEdit} = vscode
const fs = require("fs")

function activate(context) {
    const startCommnad = { $: 'vscode.openjbEditor'}
    context.subscriptions.push(commands.registerCommand('jb.studio.openJbEditor', () => createOrDo(context,startCommnad)))
    context.subscriptions.push(commands.registerCommand('jb.studio.openProperties', () => createOrDo(context)))
}
exports.activate = activate;
let studio

function createOrDo(context, command) {
    if (!studio) {
        const win = vscode.window
        const column = win.activeTextEditor ? (win.activeTextEditor.viewColumn || 0) + 1 : ViewColumn.One
        const panel = win.createWebviewPanel(jBartStudio.viewType, 'jBart Studio', column, { enableScripts: true })
        studio = new jBartStudio(context, panel,command)
    } else {
        studio.runCommand({...command, activeEditorPosition: studio.calcActiveEditorPosition()})
    }
}

class jBartStudio {
    constructor(context, panel,startCommand) {
        this._disposables = []
        this._panel = panel
        this.context = context
        this.startCommand = startCommand
        panel.webview.html = this.getHtmlForWebview(panel.webview)
        panel.onDidDispose(() => this.dispose(), null, this._disposables)
        const fileSystemWatcher = workspace.createFileSystemWatcher("**/*.{ts,js}")
        fileSystemWatcher.onDidChange(() => {
            const editor = vscode.window.activeTextEditor
            editor && this._panel.webview.postMessage({ $: 'studio.profileChanged',
                line: editor.selection.active.line, col: editor.selection.active.character,
                fileContent: { $asIs: editor.document.getText() }
            })
        })
        panel.webview.onDidReceiveMessage(message => {
            Promise.resolve(this.processMessage(message)).then(result =>
                message.messageID && this._panel.webview.postMessage({ result, messageID: message.messageID })
            , error => 
                this._panel.webview.postMessage({ isError: true, error, messageID: message && message.messageID }))
        }, null, this._disposables)
    }
    runCommand(command) {
        this._panel.webview.postMessage(command)
    }

    getHtmlForWebview(webview) {
        const ws = workspace.workspaceFolders && workspace.workspaceFolders[0] || { uri: { path: '' } }
        const jbBaseProjUrl = webview.asWebviewUri(Uri.file(ws.uri.path))
        const jbModuleUrl = fs.existsSync(ws.uri.fsPath + '/node_modules/jb-react') ? webview.asWebviewUri(Uri.file(ws.uri.path + '/node_modules/jb-react')) : ''
        if (!jbModuleUrl && !ws.uri.path.match(/jb-react/))
            return this.installHtml()
        return this.studioHtml(jbModuleUrl, jbBaseProjUrl, JSON.stringify(this.calcProjectSettings(jbModuleUrl)), 
            JSON.stringify(this.calcDocsDiffFromFiles(webview)))
    }

    calcDocsDiffFromFiles(webview) {
        return workspace.textDocuments.filter(doc => doc.fileName.match(/\.(ts|js|csv)$/))
            .filter(doc => doc.getText() != fs.readFileSync(doc.fileName, 'utf8'))
            .map(doc => [doc.getText(), `//# sourceURL=${webview.asWebviewUri(doc.uri)}`].join('\n'));
    }

    calcActiveEditorPosition() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return {};
        const closestComp = _closestComp(editor.document.getText(),editor.selection.active.line)
        return { ...closestComp, line: editor.selection.active.line, col: editor.selection.active.character }
    }

    calcProjectSettings(jbModuleUrl) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return {};
        const splitedPath = editor.document.uri.path.split('/').slice(1, -1)
        const jbartFolder = splitedPath.slice(0,splitedPath.indexOf('jb-react')+1)
        const htmlFileCandidates = [
            [...splitedPath, 'index.html'].join('/'),
            [...jbartFolder,'projects/ui-tests/tests.html'].join('/')
        ]
        return htmlFileCandidates
            .filter(htmlFile=>fs.existsSync(htmlFile))
            .map(htmlFile => {
                const html = fs.readFileSync(htmlFile, 'utf8');
                const res = eval('({' + _extractText(html, 'jbProjectSettings = {', '}', '') + '})');
                return Object.assign(Object.assign({}, res), { 
                    source: jbModuleUrl ? 'vscodeUserHost' : 'vscodeDevHost',
                }) 
            })[0]
    }

    studioHtml(jbModuleUrl, jbBaseProjUrl, jbProjectSettings, jbDocsDiffFromFiles) {
        const studioBin = `<script type="text/javascript" src="${jbModuleUrl}/bin/studio/studio-all.js"></script>
        <link rel="stylesheet" type="text/css" href="${jbModuleUrl}/bin/studio/css/studio-all.css"/>`

        const studioDev = `<script type="text/javascript" src="${jbBaseProjUrl}/src/loader/jb-loader.js"
        modules="common,ui-common,material,ui-tree,dragula,codemirror,pretty-print,studio,history,animate,md-icons,fuse" suffix="?studio"></script>
    <link rel="stylesheet" type="text/css" href="${jbBaseProjUrl}/projects/studio/css/studio.css"/>`
        const jbStartCommand = this.startCommand ? JSON.stringify({...this.startCommand, activeEditorPosition: this.calcActiveEditorPosition()}) : "''"
        const jbWorkspaceState = JSON.stringify(this.context.workspaceState.get('jbartStudio') || {})
        return `<!DOCTYPE html>
<html>
	<head>
		<script type="text/javascript">
            jbInvscode = true
            jbModuleUrl = '${jbModuleUrl}'
			jbBaseProjUrl = '${jbBaseProjUrl}'
			jbPreviewProjectSettings= ${jbProjectSettings}
            jbDocsDiffFromFiles = ${jbDocsDiffFromFiles}
            jbStartCommand = ${jbStartCommand}
            jbWorkspaceState = ${jbWorkspaceState}
        </script>
        ${jbModuleUrl ? studioBin : studioDev}
	</head>
	<body class="vscode-studio">
		<div id="studio" style="width:1280px;"> </div>
		<script>
          jb.studio.vsCodeApi = acquireVsCodeApi()
          jb.exec({$: 'defaultTheme'})
		  jb.ui.render(jb.ui.h(jb.exec({$:'studio.all'})), document.getElementById('studio'))
		</script>
	</body>
</html>`;
    }

    installHtml() {
        return `<!DOCTYPE html>
<html>
	<head>
    <body>
        <h4>jBart is not installed in this project</h4>

        <h2>Option1: install jBart sample project</h2>
        <p>goto sample project <a href="https://github.com/ArtwareSoft/jbart-template">https://github.com/ArtwareSoft/jbart-template</a> and fork it</p>
<div style="display: flex; flex-direction: column">
<img src="https://github-images.s3.amazonaws.com/enterprise/2.13/assets/images/help/repository/fork_button.jpg" style="width:320px">
<p>git clone your forked project</p>

<img src="https://github-images.s3.amazonaws.com/enterprise/2.13/assets/images/help/repository/clone-repo-clone-url-button.png" style="width:320px">
<img src="https://github-images.s3.amazonaws.com/enterprise/2.13/assets/images/help/repository/https-url-clone.png" style="width:320px">
<div>

<code>git clone https://github.com/YOUR-USERNAME/jbart-template.git</code>

<ul>
<li>in the project directory <code>>npm install</code></li>
<li>restart vscode </li>
<li>in vscode File->Add Folder to Wordkspace... and select jbart-template</li>
<li>goto file itemlists/itemlists.js line 10</li>
<li>click ctrl-shift-j to open jBart</li>
</ul>

        <h2>Option2: install jBart inside your project</h2>
        <div><code>npm install --save jb-react</code> </a> </div>
        <div>dev version: <code><div>npm install --save artwaresoft/jb-react</code></div>

        <h2>Puppeteer server (optional)</h2>
        <p>clone the server project <code>git clone https://github.com/ArtwareSoft/jb-puppeteer-server.git</p>
        <code>npm install</code>
        <code>npm start</code>

	</body>
</html>`;
    }
    dispose() {
        studio = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x)
                x.dispose();
        }
    }
    processMessage(message) {
        if (message.$ == 'getFile') {
            return workspace.textDocuments.filter(doc => doc.uri.path.toLowerCase() == message.path.toLowerCase())
                .map(x => x.getText()).join('') || fs.readFileSync(message.path.replace(/^\//,''),'utf8')
        } else if (message.$ == 'saveDelta') {
            const edit = new WorkspaceEdit();
            edit.set(Uri.file(message.path), message.edits);
            workspace.applyEdit(edit);
            return {};
        } else if (message.$ == 'openEditor') {
            const {fn, pos}  = message
            return vscode.workspace.openTextDocument(fn).then(doc => {
                vscode.window.showTextDocument(doc,vscode.ViewColumn.One).then( editor =>{
                    editor.revealRange(new vscode.Range(...pos))
                    editor.selection = new vscode.Selection(pos[0], pos[1], pos[2], pos[3])
                })
            })
        } else if (message.$ == 'installPackage') {
            const cp = require('child_process')
            message.module && cp.exec(`npm -i --save ${message.module}`)
        } else if (message.$ == 'storeWorkspaceState') {
            this.context.workspaceState.update('jbartStudio', message.state)
        } else if (message.$ == 'saveFile') {
            return fs.writeFileSync(message.path,message.contents)
        } else if (message.$ == 'createDirectoryWithFiles') {
            if (!message.baseDir) throw 'no base dir'
            const dirExists = fs.existsSync(message.baseDir)
            if (!message.override && dirExists) throw 'Project already exists'
            if (!dirExists)
                fs.mkdirSync(message.baseDir)
            Object.keys(message.files).forEach(f => fs.writeFileSync(message.baseDir+ '/' + f,message.files[f]) )
            return `${Object.keys(message.files).length} files written`
        }
    }
}
jBartStudio.viewType = 'jBart';
function _extractText(str, startMarker, endMarker, replaceWith) {
    const pos1 = str.indexOf(startMarker), pos2 = str.indexOf(endMarker);
    if (pos1 == -1 || pos2 == -1)
        return '';
    if (replaceWith)
        return str.slice(0, pos1 + startMarker.length) + replaceWith + str.slice(pos2);
    return str.slice(pos1 + startMarker.length, pos2);
}

function _closestComp(fileContent, line) {
    const lines = fileContent.split('\n')
    const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
    if (closestComp == -1) return
    const componentHeaderIndex = line - closestComp
    return { compId: (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1], componentHeaderIndex }
}