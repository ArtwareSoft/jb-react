(function() {
const st = jb.studio;

jb.component('studio.save-components', { /* studio.saveComponents */
  type: 'action,has-side-effects',
  impl: ctx => {
    const messages = []
    const loc = (st.previewjb || jb).location
    const filesToUpdate = jb.unique(st.changedComps().map(e=>e[1][loc] && e[1][loc][0]).filter(x=>x))
      .map(fn=>({fn, path: st.host.locationToPath(fn), comps: st.changedComps().filter(e=>e[1][loc][0] == fn)}))
    if (st.inMemoryProject) {
      const project = st.inMemoryProject.project, baseDir = st.inMemoryProject.baseDir
      const files = jb.objFromEntries(jb.entries(st.inMemoryProject.files)
        .map(file=>[file[0],newFileContent(file[1], 
            st.changedComps().filter(comp=>comp[1][loc][0].indexOf(file[0]) != -1))
        ]))
      
      const jsToInject = jb.entries(files).filter(e=>e[0].match(/js$/))
        .map(e => `<script type="text/javascript" src="${st.host.pathToJsFile(project,e[0],baseDir)}"></script>`).join('\n')
      const cssToInject = jb.entries(files).filter(e=>e[0].match(/css$/))
        .map(e => `<link rel="stylesheet" href="${st.host.pathToJsFile(project,e[0],baseDir)}" charset="utf-8">`).join('\n')
    
      jb.entries(files).forEach(e=>
        files[e[0]] = e[1].replace(/<!-- load-jb-scripts-here -->/, [st.host.scriptForLoadLibraries(st.inMemoryProject.libs),jsToInject,cssToInject].join('\n'))
          .replace(/\/\/# sourceURL=.*/g,''))
      if (!files['index.html'])
        files['index.html'] = st.host.htmlAsCloud(jb.entries(files).filter(e=>e[0].match(/html$/))[0][1])
    
      return jb.studio.host.createProject({project, files, baseDir})
        .then(r => r.json())
        .catch(e => {
          jb.studio.message(`error saving project ${project}: ` + (e && e.desc));
          jb.logException(e,'',ctx)
        })
        .then(res=>{
          if (res.type == 'error')
              return jb.studio.message(`error saving project ${project}: ` + (res && jb.prettyPrint(res.desc)));
          location.reload()
        })
    }

    return jb.rx.Observable.from(filesToUpdate)
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
      .toPromise().then(e=> {
        if (!e) return;
        messages.push({text: 'file ' + e.path + ' updated with components :' + e.comps.map(e=>e[0]).join(', ') })
				st.showMultiMessages(messages)
        e.comps.forEach(([id]) => st.serverComps[id] = st.previewjb.comps[id])
      })
      
    }
})

function newFileContent(fileContent, comps) {
  let lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
  const compsToUpdate = comps.filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) != -1)
  const compsToAdd = comps.filter(([id])=>lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0) == -1)
  compsToUpdate.forEach(([id,comp])=>{
    const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0)
    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError(['can not find end of component', fn,id, linesFromComp])
    const newComp = jb.prettyPrintComp(id,comp,{depth: 1, initialPath: id, comps: st.previewjb.comps}).split('\n')
    if (JSON.stringify(linesFromComp.slice(0,compLastLine+1)) === JSON.stringify(newComp))
        return
    lines.splice(lineOfComp,compLastLine+1,...newComp)
  })
  compsToAdd.forEach(([id,comp])=>{
    const newComp = jb.prettyPrintComp(id,comp,{depth: 1, initialPath: id, comps: st.previewjb.comps}).split('\n')
    lines = lines.concat(newComp).concat('')
  })
  return lines.join('\n')
}

jb.component('studio.file-after-changes', {
  params: [
    {id: 'fileName', as: 'string'},
    {id: 'fileContent', as: 'string'},
  ],
  impl: (ctx, fileName, fileContent) => {
    const location = (st.previewjb || jb).location
    const comps = st.changedComps().filter(e=>e[1][location] && e[1][location][0].indexOf(fileName) != -1)
    return newFileContent(fileContent, comps)
  }
})

})();
