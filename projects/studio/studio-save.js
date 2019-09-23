(function() {
const st = jb.studio;

const jbDevHost = {
  getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
  locationToPath: path => path.split('/').slice(1).join('/'),
  saveFile: (path, contents) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json; charset=UTF-8");
    return fetch(`/?op=saveFile&path=${path}`,
      {method: 'POST', headers: headers, body: JSON.stringify({ Path: path, Contents: contents }) })
      .then(res=>res.json())
  }
}
st.host = st.host || jbDevHost

jb.component('studio.save-components', { /* studio.saveComponents */
  type: 'action,has-side-effects',
  impl: (ctx,force) => {
    const messages = []
    const location = (st.previewjb || jb).location
    const filesToUpdate = jb.unique(st.changedComps().map(e=>e[1][location] && e[1][location][0]).filter(x=>x))
      .map(fn=>({fn, path: st.host.locationToPath(fn), comps: st.changedComps().filter(e=>e[1][location][0] == fn)}))
    jb.rx.Observable.from(filesToUpdate)
      .concatMap(e =>
        st.host.getFile(e.path)
          .then(fileContent=> Object.assign(e,{fileContent}))
      )
			.concatMap(e => {
          const contents = newFileContent(e.fileContent, e.comps)
          return st.host.saveFile(e.path,contents)
            .then(saveResult => Object.assign(e,{saveResult, contents}))
        }
			)
			.catch(e=> {
        messages.push({ text: 'error saving: ' + (typeof e == 'string' ? e : e.message || e.e), error: true })
				st.showMultiMessages(messages)
				return jb.logException(e,'error while saving ' + e.id,ctx) || []
			})
			.subscribe(e=> {
        messages.push({text: 'file ' + e.path + ' updated with components :' + e.comps.map(e=>e[0]).join(', ') })
				st.showMultiMessages(messages)
        e.comps.forEach(([id]) => st.serverComps[id] = st.previewjb.comps[id])
      })
    }
})

function newFileContent(fileContent, comps) {
  const lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
  const compsToUpdate = comps.filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) != -1)
  const compsToAdd = comps.filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) == -1)
  compsToUpdate.forEach(([id,comp])=>{
    const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0)
    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError(['can not find end of component', fn,id, linesFromComp])
    const newComp = jb.prettyPrintComp(id,comp,{depth: 1, initialPath: id}).split('\n')
    if (JSON.stringify(linesFromComp.slice(0,compLastLine+1)) === JSON.stringify(newComp))
        return
    lines.splice(lineOfComp,compLastLine+1,...newComp)
  })
  compsToAdd.forEach(([id,comp])=>{
    const newComp = jb.prettyPrintComp(id,comp,{depth: 1, initialPath: id}).split('\n')
    lines.concat(newComp)
  })
  return lines.join('\n')
}


})();
