"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const {commands,ViewColumn,Uri,workspace, WorkspaceEdit} = vscode
const fs = require("fs")

function activate(context) {
    context.subscriptions.push(commands.registerCommand('jb.studio.openJbEditor', () => jBartStudio.createOrShow()));
    context.subscriptions.push(commands.registerCommand('jb.studio.openProperties', () => jBartStudio.createOrShow()));
}
exports.activate = activate;

class jBartStudio {
    constructor(panel) {
        this._disposables = [];
        this._panel = panel;
        panel.webview.html = this.getHtmlForWebview(panel.webview);
        panel.onDidDispose(() => this.dispose(), null, this._disposables);
        panel.onDidChangeViewState(e => { if (panel.visible) { } }, null, this._disposables);
        const fileSystemWatcher = workspace.createFileSystemWatcher("**/*.{ts,js}");
        fileSystemWatcher.onDidChange(() => {
            const editor = vscode.window.activeTextEditor;
            editor && this._panel.webview.postMessage({ $: 'studio.profileChanged',
                line: editor.selection.active.line, col: editor.selection.active.character,
                fileContent: editor.document.getText()
            });
        });
        panel.webview.onDidReceiveMessage(message => {
            Promise.resolve(this.processMessage(message)).then(result => {
                if (message.messageID)
                    this._panel.webview.postMessage({ result, messageID: message.messageID });
            });
        }, null, this._disposables);
    }

    static createOrShow() {
        const win = vscode.window;
        const column = win.activeTextEditor ? (win.activeTextEditor.viewColumn || 0) + 1 : undefined;
        const panel = win.createWebviewPanel(jBartStudio.viewType, 'jBart Studio', column || ViewColumn.One, { enableScripts: true });
        new jBartStudio(panel);
    }

    getHtmlForWebview(webview) {
        const ws = workspace.workspaceFolders && workspace.workspaceFolders[0] || { uri: { path: '' } }
        const jbBaseProjUrl = webview.asWebviewUri(Uri.file(ws.uri.path))
        const jbModuleUrl = fs.existsSync(ws.uri.fsPath + '/node_modules/jb-react') ? webview.asWebviewUri(Uri.file(ws.uri.path + '/node_modules/jb-react')) : ''
        if (!jbModuleUrl && !ws.uri.path.match(/jb-react/))
            return this.installHtml()
        return this.studioHtml(jbModuleUrl, jbBaseProjUrl, JSON.stringify(this.calcProjectSettings(jbModuleUrl)), JSON.stringify(this.calcDocsDiffFromFiles(webview)))
    }

    calcDocsDiffFromFiles(webview) {
        return workspace.textDocuments.filter(doc => doc.fileName.match(/\.(ts|js|csv)$/))
            .filter(doc => doc.getText() != fs.readFileSync(doc.fileName, 'utf8'))
            .map(doc => [doc.getText(), `//# sourceURL=${webview.asWebviewUri(doc.uri)}`].join('\n'));
    }

    calcProjectSettings(jbModuleUrl) {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return {};
        const htmlFile = [...editor.document.uri.path.split('/').slice(0, -1), 'index.html'].slice(1).join('/');
        if (fs.existsSync(htmlFile)) {
            const html = fs.readFileSync(htmlFile, 'utf8');
            const res = eval('({' + _extractText(html, 'jbProjectSettings = {', '}', '') + '})');
            return Object.assign(Object.assign({}, res), { 
                source: jbModuleUrl ? 'vscodeUserHost' : 'vscodeDevHost', 
                line: editor.selection.active.line, col: editor.selection.active.character 
            });
        }
    }

    studioHtml(jbModuleUrl, jbBaseProjUrl, jbProjectSettings, jbDocsDiffFromFiles) {
        const studioBin = `<script type="text/javascript" src="${jbModuleUrl}/bin/studio/studio-all.js"></script>
        <link rel="stylesheet" type="text/css" href="${jbModuleUrl}/bin/studio/css/studio-all.css"/>`

        const studioDev = `<script type="text/javascript" src="${jbBaseProjUrl}/src/loader/jb-loader.js"
        modules="common,ui-common,material,ui-tree,dragula,codemirror,pretty-print,studio,history,animate,md-icons,fuse" prefix1="!st!"></script>
    <link rel="stylesheet" type="text/css" href="${jbBaseProjUrl}/projects/studio/css/studio.css"/>`

        return `<!DOCTYPE html>
<html>
	<head>
		<script type="text/javascript">
            jbInvscode = true
            jbModuleUrl = '${jbModuleUrl}'
			jbBaseProjUrl = '${jbBaseProjUrl}'
			jbPreviewProjectSettings= ${jbProjectSettings}
			jbDocsDiffFromFiles = ${jbDocsDiffFromFiles}
        </script>
        ${jbModuleUrl ? studioBin : studioDev}
	</head>
	<body style="zoom: 0.8">
		<div id="studio" style="background-color: white;width:1280px;"> </div>
		<script>
		  jb.studio.vsCodeApi = acquireVsCodeApi()
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
        <p>please install jBart in your project</p>
        <div><code>npm i --save jb-react</code></div>
        <div>dev version: <code><div>npm i --save artwaresoft/jb-react</code></div>
	</body>
</html>`;
    }
    dispose() {
        jBartStudio.currentPanel = undefined;
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
                .map(x => x.getText()).join('');
            //return fs.readFileSync(message.path,'utf8')
        }
        else if (message.$ == 'saveDelta') {
            const edit = new WorkspaceEdit();
            edit.set(Uri.file(message.path), message.edits);
            workspace.applyEdit(edit);
            return {};
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