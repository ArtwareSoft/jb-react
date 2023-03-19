
jb.component('vscode.openPreviewPanel', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'}
  ],
  impl: jbm.vscodeWebView({
    id: '%$id%',
    panel: '%$panel%',
    init: remote.action(renderWidget(text('preview'), '#main'), '%$jbm%')
  })
})

jb.component('vscode.openProbeResultPanel', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'}
  ],
  impl: jbm.vscodeWebView({
    id: '%$id%',
    panel: '%$panel%',
    init: remote.action(renderWidget(text('probeResult'), '#main'), '%$jbm%')
  })
})

jb.component('vscode.showInXWebView', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'panel'},
    {id: 'backend', type: 'jbm', defaultValue: jbm.self() }
  ],
  impl: runActionOnItem(
    Var('profToRun', obj(prop('$', 'vscode.%$id%Ctrl'))),
    jbm.vscodeWebView({
      id: '%$id%',
      panel: '%$panel%',
      init: runActions(remote.useYellowPages(), remote.action(defaultTheme(), '%$jbm%'))
    }),
    remote.distributedWidget({
      control: (ctx,{profToRun}) => ctx.run(profToRun),
      backend: '%$backend%',
      frontend: '%%',
      selector: '#main'
    })
  )
})
