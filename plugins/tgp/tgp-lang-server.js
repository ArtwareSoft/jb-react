using('common,net')

component('tgp.langServices', {
  type: 'http-service',
  params: [
  ],
  impl: ctx => ({
    match: req => ['provideCompletionItems','editsAndCursorPos','provideDefinition','providePath','moveInArrayEdits'].indexOf(jb.http.getURLParam(req,'op')) != -1,
    usePostData: true,
    serve: async (req,body,res) => jb.tgpTextEditor[jb.http.getURLParam(req,'op')](JSON.parse(body), ctx)
  })
})

component('tgp.getCompletionItemsFromServer', {
  params: [
    {id: 'docProps'},
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8085/'},
  ],
  impl: pipe(http.fetch({url:'%$baseUrl%?op=provideCompletionItems', method: 'POST', body: '%$docProps%', json: true}), '%result%')
})

component('tgp.getDefinitionFromServer', {
  params: [
    {id: 'docProps'},
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8085/'}
  ],
  impl: pipe(http.fetch({
    url: '%$baseUrl%?op=provideDefinition',
    method: 'POST',
    body: '%$docProps%',
    json: true
  }), '%result%')
})

component('tgp.getPathFromServer', {
  params: [
    {id: 'docProps'},
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8085/'},
  ],
  impl: pipe(http.fetch({url:'%$baseUrl%?op=providePath', method: 'POST', body: '%$docProps%', json: true}), '%result%', first())
})

component('tgp.moveInArrayEditsFromServer', {
  params: [
    {id: 'docProps'},
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8085/'},
  ],
  impl: pipe(http.fetch({url:'%$baseUrl%?op=moveInArrayEdits', method: 'POST', body: '%$docProps%', json: true}), '%result%', first())
})

component('tgp.editsAndCursorPosFromServer', {
  params: [
    {id: 'docText', defaultValue: '%docText%' },
    {id: 'item', defaultValue: '%item%'},
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8085/'},
  ],
  impl: pipe(
    http.fetch({url:'%$baseUrl%?op=editsAndCursorPos', method: 'POST', body: ({cmpCtx}) => cmpCtx.params, json: true}),
    '%result%',first())
})

component('tgp.startLangServer', {
    type: 'action',
    params: [
        {id: 'restart', as: 'boolean'},
    ],
    impl: node.startRemoteHttpServer({
        id: 'langServer',port:'8085',
        services: [tgp.langServices()],inspect: '7015', 
        libsToinit: list('utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode','jbm','cbHandler','treeShake'),
        spyParam: 'vscode,tgpEditor,completion,remote',
        restart: '%$restart%'
    })
})