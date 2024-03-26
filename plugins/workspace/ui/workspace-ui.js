using('ui-tree','ui-misc','ui-styles','probe-preview','workspace-core','tgp-lang-server')

extension('workspace', 'ui', {
  $requireLibs: ['/dist/fuse.js']
})

component('workspace', { watchableData: { bottomViewIndex : 0 } })

component('workspace.IDE', {
  type: 'control',
  params: [
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: group({
    controls: [
      group({
        controls: dynamicControls({
          controlItems: () => Object.keys(jb.workspace.openDocs),
          genericControl: group(workspace.textEditor(({},{docUri}) => jb.workspace.openDocs[docUri].text, '%$docUri%'), {
            title: pipeline('%$docUri%', suffix('/'))
          }),
          itemVariable: 'docUri'
        }),
        style: group.tabs(),
        features: [
          followUp.watchObservable(() => jb.workspace.onOpenDoc),
          followUp.flow(
            source.callbag(() => jb.workspace.gotoOffsetRequest),
            sink.action(runFEMethodFromBackEnd('#activeEditor', 'setSelectionRange', { data: '%%' }))
          ),
          followUp.flow(
            source.callbag(() => jb.workspace.applyEditRequest),
            sink.action(runFEMethodFromBackEnd('#activeEditor', 'applyEdit', { data: '%%' }))
          )
        ]
      }),
      remote.widget(probe.inOutView(), probePreviewWorker())
    ],
    features: [
      css.height('%$height%', { minMax: 'max' }),
      group.wait(jbm.start(probePreviewWorker()))
    ]
  })
})

component('workspace.views', {
  type: 'control',
  params: [
    {id: 'height', as: 'number', defaultValue: '300'}
  ],
  impl: group(group(probe.inOutView(), { title: 'preview' }))
})

component('workspace.openDoc', {
  type: 'action',
  params: [
    {id: 'docUri', as: 'string'}
  ],
  impl: ({},docUri) => jb.workspace.openDoc(docUri)
})

component('workspace.openQuickPickMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: menu.openContextMenu('%$menu()%', {
    features: [
      nearLauncherPosition({
        offsetLeft: ({},{ev}) => ev.clientRect.width / 120 * (jb.workspace.activeTextEditor.selection.active().col +1),
        offsetTop: ({},{ev}) => -1 * ev.clientRect.height + ev.clientRect.height / 15 * (jb.workspace.activeTextEditor.selection.active().line+1)
      })
    ]
  })
})



