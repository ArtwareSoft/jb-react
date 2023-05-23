component('remote.cmd', {
  description: 'calc a script with jb.js',
  params: [
      {id: 'main', type: 'any<>', dynamic: true, description:'e.g pipeline("hello","%% -- %$v1%")'},
      {id: 'wrap', as: 'string', description:'e.g prune(MAIN)'},
      {id: 'context', description:'e.g {v1: "xx", param1: prof1("yy") }'}, 
      {id: 'sourceCode', type: 'source-code', mandatory: true },
      {id: 'id', as: 'string', description: 'jb.uri of cmd, default is main'},
      {id: 'nodeContainerUrl', as: 'string', defaultValue: 'http://localhost:8082'},
  ],
  impl: async (ctx,main,wrap,context,sourceCode,id,nodeContainerUrl) => {
        const args = [
            ['-main', jb.utils.prettyPrint(main.profile,{forceFlat: true})],
            ['-wrap', wrap],
            ['-uri', id],
            ['-sourceCode', JSON.stringify(sourceCode)],
            ...Object.keys(context).map(k=>[`%${k}`,context[k]]),
        ].filter(x=>x[1])
        const body = JSON.stringify(args.map(([k,v])=>`${k}:${v}`))
        const url = `${nodeContainerUrl}/?op=jb`

        return jbHost.fetch(url,{method: 'POST', body}).then(r => r.json()).then(x=>x.result)
    }
})