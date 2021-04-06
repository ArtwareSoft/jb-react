jb.component('studio.saveComponents', {
  type: 'action,has-side-effects',
  impl: rx.pipe(
    source.data(pipeline(watchableComps.changedComps(), studio.filePathOfComp('%comp%'), unique())),
    rx.var('fn','%%'),
    rx.var('comps', pipeline(watchableComps.changedComps(), filter(equals('%$fn%', studio.filePathOfComp('%comp%'))))),
    rx.mapPromise(studio.getFileContent('%$fn%')),
    rx.var('fileContent','%%'),
    rx.doPromise( studio.saveFile('%$fn%', studio.newFileContent('%$fileContent%','%$comps%'))),
    rx.catchError(),
    sink.action(({},{fn,fileContent,comps}) => {
      if (fileContent) {
        jb.studio.host.showInformationMessage('file ' + fn + ' updated with components :' + comps.map(e=>e[0]).join(', '))
        jb.watchableComps.updateLastSave()
      } else {
        jb.studio.host.showError('error saving: ' + (typeof e == 'string' ? e : e.message || e.e || e.desc))
        jb.logException(e,'error while saving ' + e.id,{ctx}) || []  
      }
    })
  )
})

jb.component('studio.filePathOfComp', {
  params: [
    { id: 'comp' }
  ],
  impl: (ctx,comp) => jb.studio.host.locationToPath(comp[jb.core.location][0])
})

jb.component('studio.getFileContent', {
  params: [
    { id: 'filePath', as: 'string' }
  ],
  impl: (ctx,filePath) => jb.studio.host.getFile(filePath)
})

jb.component('studio.saveFile', {
  params: [
    { id: 'filePath', as: 'string' },
    { id: 'content', as: 'string' }
  ],
  impl: (ctx,filePath,content) => jb.studio.host.saveFile(filePath, content)
})

jb.component('studio.newFileContent', {
  params: [
    { id: 'fileContent', as: 'string' },
    { id: 'comps' }
  ],
  impl: (ctx, fileContent, comps) => {
    let lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
    const compsToUpdate = comps.filter(({id})=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) != -1)
    const compsToAdd = comps.filter(e=>e[1]).filter(({id})=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) == -1)
    compsToUpdate.forEach(({id,comp})=>{
      const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0)
      const linesFromComp = lines.slice(lineOfComp)
      const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
      const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
      if (nextjbComponent != -1 && nextjbComponent < compLastLine)
        return jb.logError('can not find end of component', {fn,id, linesFromComp})
      const newComp = comp ? jb.utils.prettyPrintComp(id,comp,{comps: jb.comps}).split('\n') : []
      if (JSON.stringify(linesFromComp.slice(0,compLastLine+1)) === JSON.stringify(newComp))
          return
      lines.splice(lineOfComp,compLastLine+1,...newComp)
    })
    compsToAdd.forEach(({id,comp})=>{
      const newComp = jb.utils.prettyPrintComp(id,comp,{comps: jb.comps}).split('\n')
      lines = lines.concat(newComp).concat('')
    })
    return lines.join('\n')
  }
})

jb.component('studio.autoSaveService', {
  type: 'service',
  impl: ctx => ({ init: () => {
    if (!jb.frame.jbInvscode || jb.studio.autoSaveInitialized) return
    jb.log('studio init autosave service',{})
    jb.studio.autoSaveInitialized = true
    const {pipe, subscribe} = jb.callbag
    pipe(st.scriptChange, subscribe(async e => {
        try {
          const compId = e.path[0]
          const comp = jb.comps[compId]
          const fn = jb.studio.host.locationToPath(comp[jb.core.location][0])
          const fileContent = await jb.studio.host.getFile(fn)
          if (fileContent == null) return
          const edits = [jb.save.deltaFileContent(fileContent, {compId,comp})].filter(x=>x)
          await jb.studio.host.saveDelta(fn,edits)
        } catch (e) {
          jb.studio.host.showError('error saving: ' + (typeof e == 'string' ? e : e.message || e.e || e.desc))
          jb.logException(e,'error while saving ' + e.id,{ctx}) || []
        }
      })
    )
  }
  })
})

jb.component('studio.saveProjectSettings', {
  type: 'action,has-side-effects',
  impl: ctx => {
//    if (!ctx.exp('%$studio/projectFolder%')) return
    const path = ctx.run(pipeline(studio.projectsDir(),'%%/%$studio/project%/index.html'))[0]
    return path && jb.studio.host.getFile(path).then( fileContent =>
      fileContent && jb.studio.host.saveFile(path, newIndexHtmlContent(fileContent, ctx.exp('%$studio/projectSettings%'))))
      .then(()=> jb.studio.host.showInformationMessage('index.html saved with new settings'))
      .catch(e=> jb.studio.host.showError('error saving index.html '+ (typeof e == 'string' ? e : e.message || e.e)))

    function newIndexHtmlContent(fileContent,jbProjectSettings) {
        let lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
        const lineOfComp = lines.findIndex(line=> line.match(/^\s*jbProjectSettings/))
        const compLastLine = lines.slice(lineOfComp).findIndex(line => line.match(/^\s*}/))
        lines.splice(lineOfComp,compLastLine+1,'jbProjectSettings = ' + jb.utils.prettyPrint(jbProjectSettings,{noMacros: true}))
        return lines.join('\n')
    }    
  }
})

jb.extension('save', {
  deltaFileContent(fileContent, {compId,comp}) {
    const lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
    const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${compId}'`) == 0)
    const newCompLines = comp ? jb.utils.prettyPrintComp(compId,comp,{comps: jb.comps}).split('\n') : []
    const justCreatedComp = lineOfComp == -1 && comp[jb.core.location][1] == 'new'
    if (justCreatedComp) {
      comp[jb.core.location][1] == lines.length
      return { range: {start: { line: lines.length, character: 0}, end: {line: lines.length, character: 0} } , newText: '\n\n' + newCompLines.join('\n') }
    }
    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError('can not find end of component', {compId, linesFromComp})
    const oldlines = linesFromComp.slice(0,compLastLine+1)
    const {common, oldText, newText} = calcDiff(oldlines.join('\n'), newCompLines.join('\n'))
    const commonStartSplit = common.split('\n')
    // using vscode terminology
    const start = {line: lineOfComp + commonStartSplit.length - 1, character: commonStartSplit.slice(-1)[0].length }
    const end = { line: start.line + oldText.split('\n').length -1, 
      character : (oldText.split('\n').length-1 ? 0 : start.character) + oldText.split('\n').pop().length }
    return { range: {start, end} , newText }
  
    // the diff is continuous, so we cut the common parts at the begining and end 
    function calcDiff(oldText,newText)  {
      let i=0;j=0;
      while(newText[i] == oldText[i] && i < newText.length) i++
      const common = oldText.slice(0,i)
      oldText = oldText.slice(i); newText = newText.slice(i);
      while(newText[newText.length-j] == oldText[oldText.length-j] && j < newText.length) j++
      return {firstDiff: i, common, oldText: oldText.slice(0,-j+1), newText: newText.slice(0,-j+1)}
    }
  }  
})