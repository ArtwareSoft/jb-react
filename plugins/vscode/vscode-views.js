using('remote,ui')
// component('vscode.liveProbe', {
//   type: 'control',
//   params: [
//   ],
//   impl: probe.inOutView()
// })

// jb.component('vscode.openPreviewPanel', {
//   type: 'jbm<jbm>',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'panel'}
//   ],
//   impl: vscodeWebView({
//     id: '%$id%',
//     panel: '%$panel%',
//     init: remote.action(renderWidget(text('preview'), '#main'), '%$jbm%')
//   })
// })

// jb.component('vscode.openProbeResultPanel', {
//   type: 'jbm<jbm>',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'panel'}
//   ],
//   impl: vscodeWebView({
//     id: '%$id%',
//     panel: '%$panel%',
//     init: remote.action(renderWidget(text('probeResult'), '#main'), '%$jbm%')
//   })
// })

// component('vscode.showInXWebView', {
//   type: 'action',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'panel'},
//     {id: 'backend', type: 'jbm<jbm>', defaultValue: jbm.self()}
//   ],
//   impl: runActionOnItem(
//     Var('profToRun', obj(prop('$', 'vscode.%$id%Ctrl'))),
//     jbm.start(vscodeWebView({
//       id: '%$id%',
//       panel: '%$panel%',
//       init: runActions(remote.useYellowPages(), remote.action(defaultTheme(), '%$jbm%'))
//     })),
//     remote.distributedWidget({
//       control: (ctx,{profToRun}) => ctx.run(profToRun),
//       backend: '%$backend%',
//       frontend: '%%',
//       selector: '#main'
//     })
//   )
// })
