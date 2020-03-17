(function() {
const st = jb.studio;

jb.component('studio.save-components', { /* studio.saveComponents */
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

function locationOfComp(compE) {
  try {
    return (compE[1] || st.compsHistory[0].before[compE[0]])[jb.location][0]
  } catch (e) {
    return ''
  }
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

jb.component('studio.file-after-changes', { /* studio.fileAfterChanges */
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
