(function() {
const st = jb.studio;

jb.component('studio.saveComponents', {
  type: 'action,has-side-effects',
  impl: ctx => {
    const {pipe, fromIter, catchError,toPromiseArray,concatMap,fromPromise,Do} = jb.callbag
    const messages = []
    const filesToUpdate = jb.unique(st.changedComps().map(e=>locationOfComp(e)).filter(x=>x))
      .map(fn=>({fn, path: st.host.locationToPath(fn), comps: st.changedComps().filter(e=>locationOfComp(e) == fn)}))

    return pipe(
      fromIter(filesToUpdate),
      concatMap(e => fromPromise(st.host.getFile(e.path).then(fileContent=>
        st.host.saveFile(e.path,newFileContent(fileContent, e.comps)).then(() => e)
      ))),
      Do(e=>{
        messages.push({text: 'file ' + e.path + ' updated with components :' + e.comps.map(e=>e[0]).join(', ') })
        e.comps.forEach(([id]) => st.serverComps[id] = st.previewjb.comps[id])
      }),
			catchError(e=> {
        messages.push({ text: 'error saving: ' + (typeof e == 'string' ? e : e.message || e.e), error: true })
				jb.logException(e,'error while saving ' + e.id,ctx) || []
      }),
      Do(() => st.showMultiMessages(messages)),
      toPromiseArray
    )
  }
})

jb.component('studio.initAutoSave', {
  type: 'action,has-side-effects',
  impl: ctx => {
    if (!jb.frame.jbInvscode || jb.studio.autoSaveInitialized) return
    jb.studio.autoSaveInitialized = true
    const {pipe, catchError,subscribe,concatMap,fromPromise,fromIter,map} = jb.callbag
    const messages = []
    const st = jb.studio

    return pipe(
      st.scriptChange,
      concatMap(e => pipe(
        fromIter([e]),
        map(e=>({...e, compId: e.path[0]})), 
        map(e=>({...e, comp: st.previewjb.comps[e.compId]})), 
        map(e=>({...e, loc: e.comp[jb.location]})),
        map(e=>({...e, fn: st.host.locationToPath(e.loc[0])})),

        concatMap(e => fromPromise(st.host.getFile(e.fn).then(fileContent=>({...e, fileContent})))),
        map(e=>({...e, edits: [e.fileContent && deltaFileContent(e.fileContent,e)].filter(x=>x) })),
        concatMap(e => e.fileContent ? fromPromise(st.host.saveDelta(e.fn,e.edits).then(()=>e)) : [e]),
      )),
			catchError(e=> {
        messages.push({ text: 'error saving: ' + (typeof e == 'string' ? e : e.message || e.e), error: true })
				jb.logException(e,'error while saving ' + e.id,ctx) || []
      }),
      subscribe(()=>{})
    )
  }
})

jb.component('studio.saveProjectSettings', {
  type: 'action,has-side-effects',
  impl: ctx => {
    const path = st.host.pathOfJsFile(ctx.exp('%$studio/project%'), 'index.html')
    return st.host.getFile(path).then( fileContent =>
      st.host.saveFile(path, newIndexHtmlContent(fileContent, ctx.exp('%$studio/projectSettings%'))))
      .then(()=>st.showMultiMessages([{text: 'index.html saved with new settings'}]))
      .catch(e=>st.showMultiMessages([{text: 'error saving index.html '+ (typeof e == 'string' ? e : e.message || e.e), error: true}]))
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
  lines.splice(lineOfComp,compLastLine+1,'jbProjectSettings = ' + jb.prettyPrint(jbProjectSettings))
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
  const linesFromComp = lines.slice(lineOfComp)
  const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
  const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
  if (nextjbComponent != -1 && nextjbComponent < compLastLine)
    return jb.logError(['can not find end of component', compId, linesFromComp])
  const newCompLines = comp ? jb.prettyPrintComp(compId,comp,{initialPath: compId, comps: st.previewjb.comps}).split('\n') : []
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
    while(newText[newText.length-j] == oldText[oldText.length-j] && i < newText.length) j++
    return {firstDiff: i, common: oldText.slice(0,i), oldText: oldText.slice(i,-j+1), newText: newText.slice(i,-j+1)}
  }
}

jb.component('studio.fileAfterChanges', {
  params: [
    {id: 'fileName', as: 'string'},
    {id: 'fileContent', as: 'string'}
  ],
  impl: (ctx, fileName, fileContent) => {
    const location = jb.location
    const comps = st.changedComps().filter(e=>e[1][location] && e[1][location][0].indexOf(fileName) != -1)
    return newFileContent(fileContent, comps)
  }
})

})();
