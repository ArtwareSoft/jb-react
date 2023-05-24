using('common,net,remote')

component('langServer', {
  type: 'source-code<jbm>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode({
    pluginsToLoad: [
      pluginsByPath('%$filePath%'),
      plugins('tgp,vscode,tree-shake')
    ],
    pluginPackages: packagesByPath('%$filePath%'),
    libsToInit: 'utils,watchable,immutable,watchableComps,tgp,tgpTextEditor,vscode,jbm,cbHandler,treeShake'
  })
})

component('tgp.getCompletionItemsFromCmd', {
  params: [
    {id: 'docProps'}
  ],
  impl: remote.cmd({
    main: tgp.provideCompletionItems(),
    context: obj(prop('docProps', json.stringify(obj(prop('$asIs','%$docProps%'))))),
    sourceCode: langServer('%$docProps/filePath%'),
    id: 'langServer'
  })
})
component('tgp.provideCompletionItems', {
  params: [
    {id: 'docProps'},
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.provideCompletionItems(docProps,ctx)
})

component('tgp.getDefinitionFromCmd', {
  params: [
    {id: 'docProps'},
  ],
  impl: remote.cmd({
    id: 'langServer',main: tgp.provideDefinition(), context: obj(prop('docProps',json.stringify('%$docProps%'))), sourceCode: langServer('%$docProps/filePath%')
  })
})
component('tgp.provideDefinition', {
  params: [
    {id: 'docProps'},
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.provideDefinition(docProps,ctx)
})

component('tgp.getPathFromCmd', {
  params: [
    {id: 'docProps'},
  ],
  impl: remote.cmd({
    id: 'langServer',main: tgp.providePath(), context: obj(prop('docProps',json.stringify('%$docProps%'))), sourceCode:langServer('%$docProps/filePath%')
  })
})
component('tgp.providePath', {
  params: [
    {id: 'docProps'},
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.providePath(docProps,ctx)
})

component('tgp.moveInArrayEditsFromCmd', {
  params: [
    {id: 'docProps'},
  ],
  impl: remote.cmd({
    id: 'langServer',main: tgp.moveInArrayEdits(), context: obj(prop('docProps',json.stringify('%$docProps%'))), sourceCode: langServer('%$docProps/filePath%')
  })
})
component('tgp.moveInArrayEdits', {
  params: [
    {id: 'docProps'},
  ],
  impl: (ctx,docProps) => jb.tgpTextEditor.moveInArrayEdits(docProps,ctx)
})

component('tgp.editsAndCursorPosFromCmd', {
  params: [
    {id: 'docProps', defaultValue: '%docProps%' },
    {id: 'item', defaultValue: '%item%'},
  ],
  impl: remote.cmd({
    id: 'langServer',
    main: tgp.editsAndCursorPos(), 
    context: obj(prop('docProps',json.stringify('%$docProps%')), prop('item',json.stringify('%$item%'))), 
    sourceCode: langServer('%$docProps/filePath%')
  })
})
component('tgp.editsAndCursorPos', {
  params: [
    {id: 'docProps' },
    {id: 'item' },
  ],
  impl: (ctx,docProps,item) => jb.tgpTextEditor.editsAndCursorPos({docProps,item},ctx)
})