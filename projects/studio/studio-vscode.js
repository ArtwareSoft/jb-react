jb.component('studio.initVscodeAdapter', {
  type: 'action',
  params: [
    {id: 'resource', as: 'string', mandatory: true, description: 'mapped to state' },
  ],
  impl: function(ctx,resource) {
        if (! jb.frame.jbInvscode || jb.VscodeAdapterInitialized) return
        jb.VscodeAdapterInitialized = true
        const vscode = jb.studio.vsCodeApi
        const params = ['project','page','profile_path']

        const {pipe, subscribe,create,filter} = jb.callbag
        jb.studio.vscodeEm = create(obs=> jb.frame.addEventListener('message', e => obs(e)))

        const state = {...jb.frame.jbPreviewProjectSettings, ...vscode.getState()}
        params.forEach(p => state[p] != null && ctx.run(writeValue(`%${resource}/${p}%`,state[p]) ))

        pipe(jb.ui.resourceChange(), 
            filter(e=> e.path[0] == resource && params.indexOf(e.path[1]) != -1),
            subscribe(e =>
                vscode.setState(jb.objFromEntries(params.map(p=>[p,ctx.exp(`%${resource}/${p}%`)])))
        ))

        jb.sessionStorage = function(id,val) {
            return val == undefined ? (vscode.getState() ||{})[id] : vscode.setState({...vscode.getState(),id: val})
        }

        let messageID = 0
        const promises = {}
        jb.frame.addEventListener('message', event => {
            const message = event.data
            console.log('get response ', message.messageID, message)
            if (message && message.messageID) {
                const req = promises[message.messageID].req // for debug
                promises[message.messageID].resolve(message.result)
                delete promises[message.messageID]
            }
            if (message.$)
                ctx.run(message)
        })

        jb.studio.vscodeService = req => new Promise((resolve,reject) => {
            messageID++
            promises[messageID] = {resolve,reject,req}
            console.log('send req ',messageID,req)
            vscode.postMessage({...req, messageID})
        })
    }
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