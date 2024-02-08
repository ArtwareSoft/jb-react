dsl('upgrade')
using('tgp-lang-server')

extension('upgrade','main', {
    initExtension() { 
        jb.core.OrigValues = Symbol.for('OrigValues')
    },
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
    fixPath(path) {
        return path.replace('[JB_BASE]',jbHost.jbReactDir || '')
          .replace(/\[REPO\]\/([^/]+)\//, (x,repo) => `${jbHost.jbReactDir}/../${repo}/`)
    },
    async compTextFromFile(cmpId, location, ctx) {
        const path = '[JB_BASE]' + location.path
        const fullPath = jb.upgrade.fixPath(path)
        const docText = jbHost.fs ? jbHost.fs.readFileSync(fullPath, 'utf-8') : await (await jbHost.fetch(fullPath)).text()
        const lines = docText.split('\n')
        const compLine = location.line-1
        if (!lines[compLine] || lines[compLine].indexOf(`component('${cmpId}',`) != 0) {
            jb.logError(`compTextFromFile can not find cmp ${cmpId} in file ${path} ${location.line}`, { ctx })
            return { notFound : true }
        }
        const linesFromComp = lines.slice(compLine)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(compLine+1).findIndex(line => line.match(/^component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
           return jb.logError(`compTextFromFile can not find last line of cmp ${cmpId} in file ${path}`, { ctx })
        return { originalProfCode: linesFromComp.slice(0,compLastLine+1).join('\n') }
    }
})

component('upgradeCmp', {
  type: 'action<>',
  params: [
    {id: 'cmpId', as: 'string', mandatory: true},
    {id: 'path', as: 'string', mandatory: true},
    {id: 'repo', as: 'string'},
    {id: 'hash', as: 'number', mandatory: true},
    {id: 'edit'},
    {id: 'lostInfo'}
  ],
  impl: (ctx,cmpId,path,repo,expectedHash,edit,lostInfo) => {
        if (!ctx.vars.allowLostInfo && lostInfo)
            return jb.logError(`upgradeCmp can not loose information at ${cmpId}`, { ctx, lostInfo})
        if (!edit) return
        const fullPath = jb.upgrade.fixPath((repo ? '[REPO]' : '[JB_BASE]') + path)
        const docText = jbHost.fs.readFileSync(fullPath, 'utf-8')
        const lines = docText.split('\n')
        const compLine = jb.utils.indexOfCompDeclarationInTextLines(lines,cmpId)
        if (compLine == -1)
            return jb.logError(`upgradeCmp can not find cmp ${cmpId} in file ${path}`, { ctx })
        const linesFromComp = lines.slice(compLine)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(compLine+1).findIndex(line => line.match(/^component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
           return jb.logError(`upgradeCmp - can not find last line of cmp ${cmpId} in file ${fullPath}`, { ctx })
        const compText = linesFromComp.slice(0,compLastLine+1).join('\n')
        const hash = jb.upgrade.calcHash(compText)
        if (hash != expectedHash)
            return jb.logError(`upgradeCmp hash mismatch at ${cmpId} in file ${fullPath}`, { ctx, hash, expectedHash})
        const resultCompText = compText.slice(0,edit.from) + edit.replaceBy + compText.slice(edit.to)
        const resultDocText = [...lines.slice(0,compLine), ...resultCompText.split('\n'),...lines.slice(compLine+compLastLine+1)].join('\n')
        jbHost.fs && jbHost.fs.writeFileSync(fullPath, resultDocText)
    }
})

component('createUpgradeScript', {
  type: 'data<>',
  params: [
    {id: 'upgrade', type: 'upgrade', dynamic: true},
    {id: 'scriptFile', as: 'string', defaultValue: '[JB_BASE]/temp/upgrade-cmps.js'},
    {id: 'cmps', as: 'array', defaultValue: () => Object.keys(jb.comps)},
    {id: 'slice', as: 'number'}
  ],
  impl: async (ctx,upgrade,fn,cmps,slice) => {
        const upgrades = []
        let i=0
        const _cmps = cmps.filter(id=>!id.match(/^dataResource\./))
        if (jbHost.fs) {
            while (upgrades.length < slice && i < cmps.length) { 
                const up = upgrade(ctx.setData(_cmps[i]))
                up && upgrades.push(up)
                i++
            }
        } else await _cmps.reduce(
            (pr,id) => pr.then(() => upgrades.length < slice && upgrade(ctx.setData(id)).then(x=> x && upgrades.push(x))) , Promise.resolve())
            
        const cmds = upgrades.filter(x=>x && x.edit && !x.lostInfo).map(x=>x.cmd)
        const script = `//#sourceCode { "project": ["studio"], "plugins": ["*"] }
//#main 
runActions(
${cmds.join(',\n')}
)`
        jbHost.fs && jbHost.fs.writeFileSync(jb.upgrade.fixPath(fn), script)
        return script
    }
})

// component('upgradeMixed', {
//   type: 'upgrade',
//   params: [
//     {id: 'cmpId', as: 'string', defaultValue: '%%'}
//   ],
//   impl: (ctx,cmpId) => {
//         //console.log('upgradeMixed',cmpId)
//         const comp = jb.comps[cmpId]
//         const originalProfCode = jb.utils.prettyPrintComp(cmpId,comp, {noMixed: true})
//         const mixedProfCode = jb.utils.prettyPrintComp(cmpId,comp)
//         const edit = jb.upgrade.deltaText(originalProfCode, mixedProfCode)
//         const hash = jb.upgrade.calcHash(originalProfCode)
//         const {path, line} = comp[jb.core.CT].location

//         // deserializing - serializing the mixed code and checking it against the original profile
//         // if (!edit)
//         //     return { cmpId, noDiff: true}    
//         const shortId = cmpId.split('>').pop()
//         const mixedCmpId = cmpId + '__mixed'
//         const shortMixedCmpId = shortId + '__mixed'
//         const mixedCode = mixedProfCode.replace(`component('${shortId}'`,`component('${shortMixedCmpId}'`)

//         const {plugin,dsl} = comp[jb.core.CT]
//         jb.upgrade.evalProfileDef(mixedCode, { plugin, fileDsl: dsl})
//         const mixedProfAfterEval = jb.utils.prettyPrintComp(mixedCmpId,jb.comps[mixedCmpId], {noMixed: true})
//         const originalCodeWithMixedId = originalProfCode.replace(`component('${shortId}'`,`component('${shortMixedCmpId}'`)
//         const lostInfo = jb.upgrade.deltaText(mixedProfAfterEval, originalCodeWithMixedId)
//         const props = { cmpId, edit, hash, lostInfo, path, line }
//         const cmd = jb.utils.prettyPrint({$: 'upgradeCmp', ...props, cmpId: shortId}, {singleLine: true})

//         return { ...props, cmd }
//     }
// })

component('upgradePT', {
  type: 'upgrade',
  params: [
    {id: 'PT', as: 'string', mandatory: true},
    {id: 'oldPT', as: 'string', mandatory: true},
    {id: 'cmpUpgrade', type: 'cmp-upgrade', mandatory: true, dynamic: true}
  ],
  impl: async (ctx,PT,oldPT,cmpUpgrade) => {
    const PTplugin = jb.path(jb.comps[PT],[jb.core.CT,'plugin','id'])
    const cmpId = ctx.data
    const comp = jb.comps[cmpId]
    const ct = comp[jb.core.CT] || {}
    const plugin = ct.plugin || {}
    const dsl = ct.dsl
    const shortPTName = PT.split('>').pop()
    const workingId = `${cmpId}__working__`
    const shortId = cmpId.split('>').pop()
    const location = ct.location
    const { path } = location

    // check if relevant for upgrade 
    if (comp.autoGen) return
    if ( plugin.id != PTplugin && !(plugin.dependent || []).includes(PTplugin))
        return
    if (!findProfilesOfPT(comp.impl).length) 
        return

    if (jb.core.unresolvedProfiles.length)
        return jb.logError('upgradePT - resolved profiles in not empty', {})
    const newComp = {...comp, [jb.core.CT]: {plugin, location}, impl: buildOrigProfileWithOldPT(comp.impl),}
    jb.core.unresolvedProfiles.push({comp: newComp,id: workingId, dsl})
    jb.utils.resolveLoadedProfiles()
    const workingComp = jb.comps[workingId]
    findProfilesOfPT(workingComp.impl).forEach(prof=>{ cmpUpgrade(ctx.setData(prof)); prof.$ = shortPTName})

    const { originalProfCode, notFound } = await jb.upgrade.compTextFromFile(shortId, location, ctx)
    if (notFound) return
    const newCode = jb.utils.prettyPrintComp(cmpId, workingComp)
    if (originalProfCode == newCode) return
    const edit = jb.upgrade.deltaText(originalProfCode, newCode)
    const hash = jb.upgrade.calcHash(originalProfCode)

    const props = { cmpId, edit, hash, path }
    const cmd = jb.utils.prettyPrint({$: 'upgradeCmp', ...props, cmpId: shortId}, {singleLine: true})
    return { ...props, cmd }

    function buildOrigProfileWithOldPT(prof) {
        if (prof.$)
            return {$: oldPT && fullPTName(prof) == PT ? oldPT : prof.$, $byValue: prof[jb.core.OrigValues].map(x=>buildOrigProfileWithOldPT(x))}
        return prof
    }
    function fullPTName(prof) {
        const dslType = jb.path(prof,[jb.core.CT,'dslType']) || ''
        return (dslType.indexOf('<') != -1) ? dslType + prof.$ : prof.$
    }
    function findProfilesOfPT(prof) {
        if (!prof) return []
        const inner = (prof[jb.core.OrigValues] || []).filter(x=>x.$)
        const res = (prof.$ == PT || `${jb.path(prof,[jb.core.CT,'dslType'])}${prof.$}` == PT) ? [prof] : []
        return [...res,...inner]
    }
  }
})

component('renameProp', {
  type: 'cmp-upgrade',
  params: [
    {id: 'oldMame', as: 'string', mandatory: true},
    {id: 'newName', as: 'string', mandatory: true}
  ],
  impl: (ctx,oldMame,newName) => {
    const prof = ctx.data
    prof[newName] = prof[oldMame]
    delete prof[oldMame]
  }
})

component('reformat', {
  type: 'upgrade',
  params: [
    {id: 'repo', as: 'string'},
    {id: 'cmpId', as: 'string', defaultValue: '%%', byName: true}
  ],
  impl: async (ctx,_repo,cmpId) => {
        const comp = jb.comps[cmpId]
        if (comp.autoGen) return
        const shortId = cmpId.split('>').pop()
        const location = comp[jb.core.CT].location
        const { path, repo } = location
        if (_repo && _repo != repo) return
        const { originalProfCode, notFound } = await jb.upgrade.compTextFromFile(shortId, location, ctx)
        if (notFound) return
        const newCode = jb.utils.prettyPrintComp(cmpId,comp)
        if (originalProfCode == newCode) return
        const edit = jb.upgrade.deltaText(originalProfCode, newCode)
        const hash = jb.upgrade.calcHash(originalProfCode)

        const props = { cmpId, edit, hash, path, repo }
        const cmd = jb.utils.prettyPrint({$: 'upgradeCmp', ...props, cmpId: shortId}, {singleLine: true})
        return { ...props, cmd }
    }
})
