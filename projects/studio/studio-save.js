(function() {
const st = jb.studio;

jb.component('studio.saveComponents', {
  type: 'action,has-side-effects',
  impl: ctx => {
    const {pipe, fromIter, catchError,toPromiseArray,concatMap,fromPromise,Do} = jb.callbag
    const filesToUpdate = jb.unique(st.changedComps().map(e=>locationOfComp(e)).filter(x=>x))
      .map(fn=>({fn, path: st.host.locationToPath(fn), comps: st.changedComps().filter(e=>locationOfComp(e) == fn)}))

    return pipe(
      fromIter(filesToUpdate),
      concatMap(e => fromPromise(st.host.getFile(e.path).then(fileContent=>
        st.host.saveFile(e.path,newFileContent(fileContent, e.comps)).then(() => e)
      ))),
      Do(e=>{
        st.host.showInformationMessage('file ' + e.path + ' updated with components :' + e.comps.map(e=>e[0]).join(', '))
        e.comps.forEach(([id]) => st.serverComps[id] = st.previewjb.comps[id])
      }),
			catchError(e=> {
        st.host.showError('error saving: ' + (typeof e == 'string' ? e : e.message || e.e))
				jb.logException(e,'error while saving ' + e.id,ctx) || []
      }),
      toPromiseArray
    )
  }
})

jb.component('studio.initAutoSave', {
  type: 'action,has-side-effects',
  impl: ctx => {
    if (!jb.frame.jbInvscode || jb.studio.autoSaveInitialized) return
    jb.studio.autoSaveInitialized = true
    const {pipe, subscribe} = jb.callbag
    pipe(st.scriptChange, subscribe(async e => {
        try {
          const compId = e.path[0]
          const comp = st.previewjb.comps[compId]
          const fn = st.host.locationToPath(comp[jb.location][0])
          const fileContent = await st.host.getFile(fn)
          if (fileContent == null) return
          const edits = [deltaFileContent(fileContent, {compId,comp})].filter(x=>x)
          await st.host.saveDelta(fn,edits)
        } catch (e) {
          st.host.showError('error saving: ' + (typeof e == 'string' ? e : e.message || e.e))
          jb.logException(e,'error while saving ' + e.id,ctx) || []
        }
      })
    )
  }
})

jb.component('studio.saveProjectSettings', {
  type: 'action,has-side-effects',
  impl: ctx => {
    if (!ctx.exp('%$studio/projectFolder%')) return
    const path = ctx.run(studio.projectBaseDir()) + '/index.html'
    return st.host.getFile(path).then( fileContent =>
      st.host.saveFile(path, newIndexHtmlContent(fileContent, ctx.exp('%$studio/projectSettings%'))))
      .then(()=> st.host.showInformationMessage('index.html saved with new settings'))
      .catch(e=> st.host.showError('error saving index.html '+ (typeof e == 'string' ? e : e.message || e.e)))
  }
})

function locationOfComp(compE) {
  try {
    return (compE[1] || st.compsHistory[0].before[compE[0]])[jb.location][0]
  } catch (e) {
    return ''
  }
}

function newIndexHtmlContent(fileContent,jbProjectSettings) {
  let lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
  const lineOfComp = lines.findIndex(line=> line.match(/^\s*jbProjectSettings/))
  const compLastLine = lines.slice(lineOfComp).findIndex(line => line.match(/^\s*}/))
  lines.splice(lineOfComp,compLastLine+1,'jbProjectSettings = ' + jb.prettyPrint(jbProjectSettings,{noMacros: true}))
  return lines.join('\n')
}

function newFileContent(fileContent, comps) {
  let lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
  const compsToUpdate = comps.filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) != -1)
  const compsToAdd = comps.filter(e=>e[1]).filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) == -1)
  compsToUpdate.forEach(([id,comp])=>{
    const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0)
    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError(['can not find end of component', fn,id, linesFromComp])
    const newComp = comp ? jb.prettyPrintComp(id,comp,{initialPath: id, comps: st.previewjb.comps}).split('\n') : []
    if (JSON.stringify(linesFromComp.slice(0,compLastLine+1)) === JSON.stringify(newComp))
        return
    lines.splice(lineOfComp,compLastLine+1,...newComp)
  })
  compsToAdd.forEach(([id,comp])=>{
    const newComp = jb.prettyPrintComp(id,comp,{initialPath: id, comps: st.previewjb.comps}).split('\n')
    lines = lines.concat(newComp).concat('')
  })
  return lines.join('\n')
}

function deltaFileContent(fileContent, {compId,comp}) {
  const lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
  const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${compId}'`) == 0)
  const newCompLines = comp ? jb.prettyPrintComp(compId,comp,{initialPath: compId, comps: st.previewjb.comps}).split('\n') : []
  const justCreatedComp = lineOfComp == -1 && comp[jb.location][1] == 'new'
  if (justCreatedComp) {
    comp[jb.location][1] == lines.length
    return { range: {start: { line: lines.length, character: 0}, end: {line: lines.length, character: 0} } , newText: '\n\n' + newCompLines.join('\n') }
  }
  const linesFromComp = lines.slice(lineOfComp)
  const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
  const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
  if (nextjbComponent != -1 && nextjbComponent < compLastLine)
    return jb.logError(['can not find end of component', compId, linesFromComp])
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

})();
