dsl('upgrade')
using('remote')

extension('tgpTextEditor','upgrade', {
    calcHash(str) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
    },
    deltaText(oldText, newText) {
        if (oldText == newText) return
        let i=0,j=0
        while(newText[i] == oldText[i] && i < newText.length) i++
        const _oldText = oldText.slice(i), _newText = newText.slice(i)
        while(_newText[_newText.length-j] == _oldText[_oldText.length-j] && j < _newText.length) j++ // calc backwards from the end
        return {from: i, to: oldText.length-j+1, replaceBy: _newText.slice(0, _newText.length-j+1)}
    },    
})

component('upgradeCmp', {
    type: 'action<>',
    params: [
        {id: 'cmpId', type: 'string', mandatory: true },
        {id: 'path', type: 'string', mandatory: true },
        {id: 'hash', type: 'number', mandatory: true },
        {id: 'edit' },
        {id: 'lostInfo' },
    ],
    impl: (ctx,cmpId,path,expectedHash,edit,lostInfo) => {
        jb.log('upgradeCmp',{cmpId,path,expectedHash,edit,lostInfo})
        if (!ctx.vars.allowLostInfo && lostInfo)
            return jb.logError(`upgradeCmp can not loose information at ${cmpId}. use $allowLostInfo to override`, { ctx, lostInfo})
        if (!edit) return
        const fullPath = `.${path}`
        const docText = jbHost.fs.readFileSync(fullPath, 'utf-8')
        const lines = docText.split('\n')
        const compLine = jb.utils.indexOfCompDeclarationInTextLines(lines,cmpId)
        if (compLine == -1)
            return jb.logError(`upgradeCmp can not find cmp ${cmpId} in file ${path}`, { ctx })
        const linesFromComp = lines.slice(compLine)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(compLine+1).findIndex(line => line.match(/^component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
           return jb.logError(`upgradeCmp - can not find last line of cmp ${cmpId} in file ${path}`, { ctx })
        const compText = linesFromComp.slice(0,compLastLine+1).join('\n')
        const hash = jb.tgpTextEditor.calcHash(compText)
        if (hash != expectedHash)
            return jb.logError(`upgradeCmp hash mismatch at ${cmpId} in file ${path}`, { ctx, hash, expectedHash})
        debugger
        const resultCompText = compText.slice(0,edit.from) + edit.replaceBy + compText.slice(edit.to)
        const resultDocText = [...lines.slice(0,compLine), ...resultCompText.split('\n'),...lines.slice(compLine+compLastLine+1)].join('\n')
        jbHost.fs.writeFileSync(fullPath, resultDocText)
    }
})

component('createUpgradeScript', {
    type: 'data<>',
    params: [
        {id: 'upgrade', type: 'cmp-upgrade', dynamic: true },
        {id: 'scriptFile', as: 'string', defaultValue: './temp/upgrade.jb' },
        {id: 'cmps', as: 'array', defaultValue: () => Object.keys(jb.comps) },
        {id: 'slice', as: 'number' },
    ],
    impl: async (ctx,upgrade,fn,cmps,slice) => {
        const cmds = cmps.slice(slice).map(id=>upgrade(ctx.setData(id))).filter(x=>x && x.edit && !x.lostInfo).map(x=>x.cmd)
        const script = `#sourceCode { "project": ["studio"], "plugins": ["*"] }
#main 
runActions(
${cmds.join('\n')}
)`
        //jbHost.fs.writeFileSync(fn, script)
        return script
    }
})

component('upgradeMixed', {
    type: 'cmp-upgrade',
    params: [
        { id: 'cmpId', as: 'string', defaultValue: '%%'}
    ],
    impl: (ctx,cmpId) => {
        //console.log('upgradeMixed',cmpId)
        const comp = jb.comps[cmpId]
        const originalProfCode = jb.utils.prettyPrintComp(cmpId,comp)
        const mixedProfCode = jb.utils.prettyPrintComp(cmpId,comp, { mixed: true })
        const edit = jb.tgpTextEditor.deltaText(originalProfCode, mixedProfCode)
        const hash = jb.tgpTextEditor.calcHash(originalProfCode)
        const path = comp[jb.core.CT].location.path

        // deserializing - serializing the mixed code and checking it against the original profile
        // if (!edit)
        //     return { cmpId, noDiff: true}    
        const shortId = cmpId.split('>').pop()
        const mixedCmpId = cmpId + '__mixed'
        const shortMixedCmpId = shortId + '__mixed'
        const mixedCode = mixedProfCode.replace(`component('${shortId}'`,`component('${shortMixedCmpId}'`)

        const {plugin,dsl} = comp[jb.core.CT]
        jb.tgpTextEditor.evalProfileDef(mixedCode, { mixed: true, plugin, override_dsl: dsl})
        const mixedProfAfterEval = jb.utils.prettyPrintComp(mixedCmpId,jb.comps[mixedCmpId])
        const originalCodeWithMixedId = originalProfCode.replace(`component('${shortId}'`,`component('${shortMixedCmpId}'`)
        const lostInfo = jb.tgpTextEditor.deltaText(mixedProfAfterEval, originalCodeWithMixedId)
        const props = { cmpId, edit, hash, lostInfo, path }
        const cmd = jb.utils.prettyPrint({$: 'upgradeCmp', ...props}, {forceFlat: true})

        return { ...props, cmd }
    }
})

component('upgradePT', {
    type: 'cmp-upgrade',
    params: [
        {id: 'PT', as: 'string'},
        {id: 'newParams', as: 'array'},
    ],
    impl: ctx => ({
        upgradeActions(cmpId) {
            
        }
    })
})