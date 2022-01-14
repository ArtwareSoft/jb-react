"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmScriptHoverProvider = exports.invalidateHoverScriptsCache = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const nls = require("vscode-nls");
const readScripts_1 = require("./readScripts");
const tasks_1 = require("./tasks");
const localize = nls.loadMessageBundle();
let cachedDocument = undefined;
let cachedScripts = undefined;
function invalidateHoverScriptsCache(document) {
    if (!document) {
        cachedDocument = undefined;
        return;
    }
    if (document.uri === cachedDocument) {
        cachedDocument = undefined;
    }
}
exports.invalidateHoverScriptsCache = invalidateHoverScriptsCache;
class NpmScriptHoverProvider {
    constructor(context) {
        this.context = context;
        context.subscriptions.push(vscode_1.commands.registerCommand('npm.runScriptFromHover', this.runScriptFromHover, this));
        context.subscriptions.push(vscode_1.commands.registerCommand('npm.debugScriptFromHover', this.debugScriptFromHover, this));
        context.subscriptions.push(vscode_1.workspace.onDidChangeTextDocument((e) => {
            invalidateHoverScriptsCache(e.document);
        }));
    }
    provideHover(document, position, _token) {
        let hover = undefined;
        if (!cachedDocument || cachedDocument.fsPath !== document.uri.fsPath) {
            cachedScripts = (0, readScripts_1.readScripts)(document);
            cachedDocument = document.uri;
        }
        cachedScripts?.scripts.forEach(({ name, nameRange }) => {
            if (nameRange.contains(position)) {
                let contents = new vscode_1.MarkdownString();
                contents.isTrusted = true;
                contents.appendMarkdown(this.createRunScriptMarkdown(name, document.uri));
                contents.appendMarkdown(this.createDebugScriptMarkdown(name, document.uri));
                hover = new vscode_1.Hover(contents);
            }
        });
        return hover;
    }
    createRunScriptMarkdown(script, documentUri) {
        let args = {
            documentUri: documentUri,
            script: script,
        };
        return this.createMarkdownLink(localize('runScript', 'Run Script'), 'npm.runScriptFromHover', args, localize('runScript.tooltip', 'Run the script as a task'));
    }
    createDebugScriptMarkdown(script, documentUri) {
        const args = {
            documentUri: documentUri,
            script: script,
        };
        return this.createMarkdownLink(localize('debugScript', 'Debug Script'), 'npm.debugScriptFromHover', args, localize('debugScript.tooltip', 'Runs the script under the debugger'), '|');
    }
    createMarkdownLink(label, cmd, args, tooltip, separator) {
        let encodedArgs = encodeURIComponent(JSON.stringify(args));
        let prefix = '';
        if (separator) {
            prefix = ` ${separator} `;
        }
        return `${prefix}[${label}](command:${cmd}?${encodedArgs} "${tooltip}")`;
    }
    async runScriptFromHover(args) {
        let script = args.script;
        let documentUri = args.documentUri;
        let folder = vscode_1.workspace.getWorkspaceFolder(documentUri);
        if (folder) {
            let task = await (0, tasks_1.createTask)(await (0, tasks_1.getPackageManager)(this.context, folder.uri), script, ['run', script], folder, documentUri);
            await vscode_1.tasks.executeTask(task);
        }
    }
    debugScriptFromHover(args) {
        let script = args.script;
        let documentUri = args.documentUri;
        let folder = vscode_1.workspace.getWorkspaceFolder(documentUri);
        if (folder) {
            (0, tasks_1.startDebugging)(this.context, script, (0, path_1.dirname)(documentUri.fsPath), folder);
        }
    }
}
exports.NpmScriptHoverProvider = NpmScriptHoverProvider;
//# sourceMappingURL=scriptHover.js.map