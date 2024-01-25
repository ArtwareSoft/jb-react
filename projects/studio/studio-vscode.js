
component('studio.inVscode', {
  type: 'boolean',
  impl: () => jb.frame.jbInvscode
})

// jb.component('vscode.openPreviewPanelOld', {
//   type: 'jbm<jbm>',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'panel'}
//   ],
//   impl: vscodeWebView({
//       id: '%$id%', 
//       panel: '%$panel%', 
//       init: runActions(
//           remote.useYellowPages(),
//           studio.initPreview(),
//           remote.action(renderWidget(vscode.previewCtrl(),'#main'), '%$jbm%')
//         )
//     })
// })

// component('vscode.openLogsPanel', {
//   type: 'action',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'panel'}
//   ],
//   impl: vscode.showInXWebView({
//       id: '%$id%', 
//       panel: '%$panel%', 
//       backend: cast('jbm<jbm>', pipe(
//         remote.data(jbm.start(child('logs')), preview()),
//         jbm.start(byUri('%uri%')),
//         first())
//     )})
// })

// component('vscode.previewCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('circuit: %$studio/circuit%'),
//       preview.control()
//     ],
//     features: watchRef('%$studio/circuit%')
//   })
// })

    // updatePosVariables(docProps) {
    //     const { compId, path, semanticPath } = jb.tgpTextEditor.calcActiveEditorPath(docProps)
    //     if (!path) return
    //     console.log('update pos', semanticPath)
    //     vscodeNS.commands.executeCommand('setContext', 'jbart.inComponent', !!(compId || path))
    //     const fixedPath = path || compId && `${compId}~impl`
    //     if (fixedPath) {
    //         const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromVsCode: true}})
    //         jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), fixedPath ,ctx)
    //         semanticPath && jb.db.writeValue(ctx.exp('%$studio/semanticPath%','ref'), semanticPath.path ,ctx)

    //         const circuitOptions = jb.tgp.circuitOptions(fixedPath.split('~')[0])
    //         if (circuitOptions && circuitOptions[0])
    //             jb.db.writeValue(ctx.exp('%$studio/circuit%','ref'), circuitOptions[0] ,ctx)
    //         const profilePath = (fixedPath.match(/^[^~]+~impl/) || [])[0]
    //         if (profilePath)
    //             jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
    //     }
    // },

// DO NOT DELETE - vscode views should be fixed and moved
// jb.component('vscode.jbEditorCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('profile path: %$studio/profile_path%'),
//       text(' selected: %$studio/jbEditor/selected%'),
//       text(' semantic: %$studio/semanticPath%'),
//       studio.jbEditorInteliTree('%$studio/profile_path%')
//     ],
//     features: [watchRef('%$studio/profile_path%'), watchRef('%$studio/scriptChangeCounter%')]
//   })
// })

// jb.component('vscode.previewCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('circuit: %$studio/circuit%'),
//       preview.control()
//     ],
//     features: watchRef('%$studio/circuit%')
//   })
// })

// jb.component('vscode.logsCtrl', {
//   type: 'control',
//   impl: group({
//     controls: [
//       text('logs'),
//       studio.eventTracker()
//     ]
//   })
// })
