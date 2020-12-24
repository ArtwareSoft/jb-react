jb.ns('vscode')

jb.component('studio.vsCodeAdapterService', {
  type: 'service',
  params: [
    {id: 'resource', as: 'string', mandatory: true, description: 'mapped to state' },
  ],
  impl: (_ctx,resource) => ({ init: ctx => {
        if (! jb.frame.jbInvscode || jb.VscodeAdapterInitialized) return
        jb.VscodeAdapterInitialized = true
        const vscode = jb.studio.vsCodeApi
        const params = ['project','page','profile_path','vscode']

        const {pipe, subscribe,create,filter} = jb.callbag
        jb.studio.vscodeEm = create(obs=> jb.frame.addEventListener('message', e => obs(e)))

        vscode.setState({...vscode.getState(), ...jb.frame.jbWorkspaceState})
        const state = {...jb.frame.jbPreviewProjectSettings, ...vscode.getState(), vscode: true}
        params.forEach(p => state[p] != null && ctx.run(writeValue(`%$${resource}/${p}%`,state[p]) ))

        pipe(jb.ui.resourceChange(), 
            filter(e=> e.path[0] == resource && params.indexOf(e.path[1]) != -1),
            subscribe(e => {
                vscode.setState({...vscode.getState(),...jb.objFromEntries(params.map(p=>[p,ctx.exp(`%$${resource}/${p}%`)]))})
                jb.studio.vscodeService({$: 'storeWorkspaceState', state})
            }
        ))

        jb.sessionStorage = function(id,val) {
            const state = val == undefined ? (vscode.getState() ||{})[id] : vscode.setState({...vscode.getState(),[id]: val})
            val && jb.studio.vscodeService({$: 'storeWorkspaceState', state})
            return state
        }

        let messageID = 0
        const promises = {}
        jb.frame.addEventListener('message', event => {
            const message = event.data
            if (message && message.messageID) {
                jb.log('vscode service response', { id: message.messageID, message })
                const req = promises[message.messageID].req
                clearTimeout(promises[message.messageID].timer)
                if (message.type == 'error') {
                    jb.logError('vscode', {message, req})
                    promises[message.messageID].reject(message)
                } else {
                    promises[message.messageID].resolve(message)
                }
                delete promises[message.messageID]
            }
            if (message.$) {
                jb.log('vscode command', { message, ctx })
                ctx.run(message)
            }
        })

        jb.studio.vscodeService = (req,timeout) => new Promise((resolve,reject) => {
            timeout = timeout || 3000
            messageID++
            const timer = setTimeout(() => {
                promises[messageID] && reject({ type: 'error', desc: 'timeout' })
                jb.logError('vscode service timeout', {promise: promises[messageID]})
            }, timeout);
            promises[messageID] = {resolve,reject,req, timer}
            jb.log(`vscode service ${req.$}`,{messageID,req})
            vscode.postMessage({...req, messageID})
        })
    }})
})

jb.component('studio.profileChanged', {
    type: 'action',
    params: [
        { id: 'fileContent', as: 'string'},
        { id: 'line', as: 'number'},
        { id: 'col', as: 'number'},
    ],
    impl: (ctx,fileContent,line,col) => {
        const {compId, compSrc} = jb.textEditor.closestComp(fileContent, {line,col})
        if (!compId) return
        const compRef = jb.studio.refOfPath(compId)
        const newVal = '({' + compSrc.split('\n').slice(1).join('\n')
        jb.textEditor.setStrValue(newVal, compRef, ctx)
    }
})

jb.component('vscode.openjbEditor', {
    type: 'action',
    params: [
        { id: 'activeEditorPosition'}
    ],
    impl: If( (ctx,{},{activeEditorPosition}) => activeEditorPosition && activeEditorPosition.compId 
                && jb.studio.previewjb && jb.studio.previewjb.comps[activeEditorPosition.compId], 
        runActions(
            writeValue('%$studio/page%','%$activeEditorPosition/compId%'),
            studio.openComponentInJbEditor(vscode.pathByActiveEditor('%$activeEditorPosition%'))
        )
    )
})

jb.component('vscode.pathByActiveEditor', {
    params: [
        { id: 'activeEditorPosition'}
    ],
    impl: (ctx,activeEditorPosition) => {
        const {compId, componentHeaderIndex, line, col } = activeEditorPosition
        const path = jb.studio.previewjb.comps[compId] && jb.textEditor.getPathOfPos(compId, {line: line-componentHeaderIndex,col},jb.studio.previewjb) || ''
        jb.log('vscode path of active editor',{path,compId, componentHeaderIndex, line, col})
        return path
    }
})

jb.component('studio.inVscode',{
    type: 'boolean',
    impl: () => jb.frame.jbInvscode
})