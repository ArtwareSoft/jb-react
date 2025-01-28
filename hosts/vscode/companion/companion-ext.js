globalThis.vscodeNS = require('vscode')
globalThis.jbVSCodeLog = vscodeNS.window.createOutputChannel('companion').appendLine

function findjbReact() {
    const _dirname = __dirname.replace(/\\/g,'/')
    const workspaceDir = (vscodeNS.workspace.workspaceFolders || []).map(ws=>ws.uri.fsPath.replace(/\\/g,'/'))[0] || ''
    const rep = (workspaceDir.match(/projects\/([^/]*)$/) || [])[1]
    jbVSCodeLog('rep:' + rep)
    if (rep)
        return workspaceDir.split('projects/')[0] + 'projects/jb-react'
  
    if (_dirname.match(/\/hosts\/vscode\/companion$/)) // debugger case
        return _dirname.replace(/\/hosts\/vscode\/companion$/,'')
    jbVSCodeLog('can not locate jbReact dir')
    jbVSCodeLog('_dirname:' + _dirname)
    jbVSCodeLog('workspaceDir:' + workspaceDir)
}

const { jbHost } = require(findjbReact() + '/hosts/node/node-host.js')
const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')
jbHost.isVscode = true
 
async function activate(context) {
    globalThis.jb = await jbInit('companion_ext', { plugins: ['companion', 'vscode']})
    jb.spy.initSpy({spyParam: 'companion,vscode'})
    await jb.vscode.initVscodeAsHost({context})
    await jb.companion.initCompanion({context})

    ;['fixComponent','openView'].forEach(cmd => vscodeNS.commands.registerCommand(`companion.${cmd}`, jb.companion[cmd]))
    
}

module.exports = { activate }