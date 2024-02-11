using('remote')

extension('http', {
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

component('node.startRemoteHttpServer', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'port', as: 'number', mandatory: true},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true},
    {id: 'services', type: 'http-service[]', dynamic: true},
    {id: 'restart', as: 'boolean', type: 'boolean'}
  ],
  impl: remote.cmd('node.startHttpServer()', {
    context: obj(
      prop('services', ({},{},{services})=>jb.utils.prettyPrint(services.profile,{singleLine: true})),
      prop('restart', '%$restart%'),
      prop('port', '%$port%')
    ),
    sourceCode: '%$sourceCode%',
    id: '%$id%'
  })
})

component('node.startHttpServer', {
  type: 'action',
  params: [
    {id: 'port', as: 'number', mandatory: true},
    {id: 'services', type: 'http-service[]', dynamic: true},
    {id: 'restart', as: 'boolean', type: 'boolean'}
  ],
  impl: async (ctx,port,servicesF,restart) => {
    const services = [...servicesF(),jb.exec(node.terminate()),jb.exec(node.details())]
    return await start()

    async function serve(req, res) {
      jb.log('remote http server',{req,res})
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
        const server = jbHost.http.createServer(serve)
        server.once('error', async err => {
          if (err.code === 'EADDRINUSE') {
            jb.log('remote http service already up',{port})
            if (restart) {
              jb.log('remote http terminating existing service',{port})
              try {
                await (await jbHost.fetch(`http://localhost:${port}/?op=terminate`)).json()
              } catch(e) {}
              resolve(await start())
            } else { // use current server
              jb.log('remote http try to redirect to existing service',{port})
              const details = await (await jbHost.fetch(`http://localhost:${port}/?op=details`)).json()
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

component('node.terminate', {
  type: 'http-service',
  params: [],
  impl: ({}) => ({
    match: req => jb.http.getURLParam(req,'op') == 'terminate',
    serve: () => process.exit(0)
  })
})

component('node.details', {
  type: 'http-service',
  params: [],
  impl: ({}) => ({
    match: req => jb.http.getURLParam(req,'op') == 'details',
    serve: () => ({uri: jb.uri,pid:process.pid})
  })
})