using('common')

extension('fs','main', {
    ls(dir, recursive) {
        const fs = jbHost.fs
        return fs.readdirSync(dir).flatMap( file => {
            const full_path = dir + '/' + file
            return recursive && fs.statSync(full_path).isDirectory() ? jb.fs.ls(full_path,recursive) : [full_path]
        })
    }
})

component('filesOfPath', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    if (!jbHost.fs) return []
    try {
        const stat = jbHost.fs.statSync(path)
        if (stat && stat.isFile()) 
            return [path]
        if (stat && stat.isDirectory())
            return jb.fs.ls(path,true)
    } catch (e) {
        //jb.logException(e,'filesOfPath',{ctx,path})
        return []
    }
  }
})

component('readFile', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
    if (!jbHost.fs) return ''
    try {
        return jbHost.fs.readFileSync(path)
    } catch(e) {
        jb.logException(e,'readFile',{ctx,path})
        return ''
    }
  }
})

component('writeFile', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'content', as: 'string'}
  ],
  impl: (ctx,path,content) => {
    if (!jbHost.fs) return
    try {
        return jbHost.fs.writeFileSync(path,content)
    } catch(e) {
        //jb.logException(e,'writeFile',{ctx,path})
    }
  }
})

component('writeFilesContent', {
  type: 'action',
  params: [
    {id: 'items', as: 'array'}
  ],
  impl: runActionOnItems('%$items%', writeFile('%path%', '%content%'))
})

