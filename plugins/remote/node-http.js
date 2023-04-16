
jb.extension('http', {
    endWithFailure(res,desc) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({type:'error', desc:desc }))
        console.log(desc)
    },
    endWithSuccess(res, result) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({type:'success', result}))
    },
    getURLParam(req,name) {
        try {
          return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
        } catch(e) {}
    },
    waitForBody(req) {
      return new Promise(resolve=>{
        let body = '';
        req.on('data', data => body += '' + data )
        req.on('end', () => resolve(body))  
      })
    }
})

jb.component('node.startRemoteHttpServer', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'port', as: 'number', mandatory: true },
    {id: 'plugins', as: 'array'},
    {id: 'projects', as: 'array'},
    {id: 'services', type: 'http-service[]', dynamic: true},
    {id: 'inspect', as: 'number'},
    {id: 'libsToinit', as: 'array', description: 'advanced. initlialize only part of the libs, used by lang server'},
    {id: 'spyParam', as: 'string'},
    {id: 'restart', as: 'boolean'},
  ],
  impl: async (ctx,id,port,plugins,projects,services,inspect,libsToinit,spyParam, restart) => {
      const args = [
            ...(inspect ? [`-inspect=${inspect}`] : []),
            '-main:node.startHttpServer()',
            `%services:${jb.utils.prettyPrint(services.profile,{forceFlat: true})}`,
            `-uri:${id}`, `%port:${port}`,
            ...(restart? [`%restart:true`] : []),
            ...(plugins ? [`-plugins:${plugins.join(',')}`] : []),
            ...(projects ? [`-projects:${projects.join(',')}`] : []),
            ...(libsToinit ? [`-libsToinit:${libsToinit.join(',')}`] : []),
            `-spyParam:${spyParam}`]

      const command = `node --inspect-brk jb.js ${args.map(x=>`'${x}'`).join(' ')}`
      debugger
      let spawnRes = null
      if (globalThis.jbSpawn) { // node or vscode
        const resText = await jbSpawn(args,{doNotWaitForEnd: true})
        try {
          spawnRes = await JSON.parse(resText) 
        } catch(e) {
          jb.logError('remote http - can not parse json',{resText})
        }
      } else { // browser
        const url = `/?op=jb&args=${encodeURIComponent(JSON.stringify(args))}`
        spawnRes = await jb.frame.fetch(url, {mode: 'cors'}).then(r => r.json())
      }
      if (!spawnRes.pid)
        jb.logError('remote http - can not start server',{id,port,spawnRes})
      else
        jb.nodeContainer.servers[id] = spawnRes
    }
})

jb.component('node.startHttpServer', {
  type: 'action',
  params: [
    {id: 'port', as: 'number', mandatory: true },
    {id: 'services', type: 'http-service[]', dynamic: true},
    {id: 'restart', as: 'boolean'},
  ],
  impl: async (ctx,port,servicesF,restart) => {
    const services = [...servicesF(),jb.exec(node.terminate()),jb.exec(node.details())]
    return await start()

    async function serve(req, res) {
      jb.log('remote http serve',{req,res})
      res.setHeader("Access-Control-Allow-Origin", "*")
      const service = services.find(s=>s.match(req))
      if (service) {
        const body = service.usePostData && await jb.http.waitForBody(req)
        const result = await service.serve(req,body,res)
        jb.log('remote http service result',{service, result})
        jb.http.endWithSuccess(res, result)
      } else {
        jb.logError('can not find service',{url: req.url, req,res,services})
        jb.http.endWithFailure(res,'no service for this request')
      }
    }

    function start() {
      return new Promise(resolve=> {
        const server = (globalThis.vsHttp || globalThis.jbHttp).createServer(serve)
        server.once('error', async err => {
          if (err.code === 'EADDRINUSE') {
            jb.log('remote http service already up',{port})
            if (restart) {
              jb.log('remote http terminating existing service',{port})
              try {
                await (await globalThis.jbFetchUrl(`http://localhost:${port}/?op=terminate`)).json()
              } catch(e) {}
              resolve(await start())
            } else { // use current server
              jb.log('remote http try to redirect to existing service',{port})
              const details = await (await globalThis.jbFetchUrl(`http://localhost:${port}/?op=details`)).json()
              jb.log('remote http redirect to existing service',{port, ...details})
              resolve(details.result)
            }
          }
        })
        server.listen(port, () => resolve({port,uri: jb.uri,pid:process.pid}))
      })
    }
  }
})

jb.component('node.terminate', {
  type: 'http-service',
  params: [
  ],
  impl: ({}) => ({
    match: req => jb.http.getURLParam(req,'op') == 'terminate',
    serve: () => process.exit(0)
  })
})

jb.component('node.details', {
  type: 'http-service',
  params: [
  ],
  impl: ({}) => ({
    match: req => jb.http.getURLParam(req,'op') == 'details',
    serve: () => ({uri: jb.uri,pid:process.pid})
  })
})