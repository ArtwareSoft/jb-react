using('common,net,remote')

component('langServer', {
  type: 'source-code<jbm>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%'), plugins('tgp,vscode,tree-shake'), {
    pluginPackages: packagesByPath('%$filePath%'),
    libsToInit: 'utils,watchable,immutable,watchableComps,tgp,tgpTextEditor,vscode,jbm,cbHandler,treeShake'
  })
})

component('tgp.provideCompletionItems', {
  params: [
    {id: 'docProps'}
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.provideCompletionItems(docProps,ctx)
})

component('tgp.editsAndCursorPos', {
  params: [
    {id: 'docProps'},
    {id: 'item'}
  ],
  impl: (ctx,docProps,item) => jb.tgpTextEditor.editsAndCursorPos({docProps,item},ctx)
})

component('tgp.provideDefinition', {
  params: [
    {id: 'docProps'}
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.provideDefinition(docProps,ctx)
})

component('tgp.moveInArrayEdits', {
  params: [
    {id: 'docProps'}
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.moveInArrayEdits(docProps,ctx)
})

// remote

component('tgp.completionItemsByDocProps', {
  params: [
    {id: 'docProps'}
  ],
  impl: remote.data(tgp.provideCompletionItems('%$docProps%'), cmd(langServer('%$docProps/filePath%'), { id: 'langServer' }))
})

component('tgp.editsAndCursorPosByDocProps', {
  params: [
    {id: 'docProps', defaultValue: '%docProps%'},
    {id: 'item', defaultValue: '%item%'}
  ],
  impl: remote.data(tgp.editsAndCursorPos('%$docProps%', '%$item%'), cmd(langServer('%$docProps/filePath%')))
})

component('tgp.definitionByDocProps', {
  params: [
    {id: 'docProps'}
  ],
  impl: remote.data(tgp.provideDefinition('%$docProps%'), cmd(langServer('%$docProps/filePath%')))
})

component('tgp.moveInArrayEditsByDocProps', {
  params: [
    {id: 'docProps'}
  ],
  impl: remote.data(tgp.moveInArrayEdits('%$docProps%'), cmd(langServer('%$docProps/filePath%')))
})

