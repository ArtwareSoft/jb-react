using('ui-common')

component('probeOverlayTest', {
  type: 'test',
  params: [
    {id: 'overlay', type: 'overlay', dynamic: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'},
    {id: 'compId', as: 'string', byName: true},
    {id: 'line', as: 'number'},
    {id: 'col', as: 'number'}
  ],
  impl: dataTest({
    calculate: pipe(Var('forceLocalSuggestions', true), langServer.calcProbeOverlay('%$overlay()%')),
    expectedResult: '%$expectedResult()%',
    runBefore: async (ctx,{},{compId, line, col}) => {
        jb.workspace.initJbWorkspaceAsHost()
        const loc = jb.comps[compId].$location
        const docContent = await jbHost.codePackageFromJson().fetchFile(loc.path)
        jb.tgpTextEditor.host.initDoc(loc.path, docContent)
        jb.tgpTextEditor.host.selectRange({line: loc.line + line,col})
        jb.langService.tgpModels[loc.path] = 
            new jb.langService.tgpModelForLangService(jb.tgp.tgpModelData({plugin: jb.comps[compId].$plugin}))
    },
    includeTestRes: true
  })
})


