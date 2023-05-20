using('probe,watchable-comps,tree-shake,remote-widget')

component('probePreviewWorker', {
  type: 'jbm<jbm>',
  params: [
    {id: 'id', defaultValue: 'wProbe'}
  ],
  impl: worker('%$id%', probe.initPreview())
})

component('suggestions.calcFromProbePreview', {
  params: [
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean'},
    {id: 'input', defaultValue: '%%'},
    {id: 'forceLocal', as: 'boolean', description: 'do not use remote preview', type: 'boolean'},
    {id: 'sessionId', as: 'string', defaultValue: '%$$dialog.cmpId%', description: 'run probe only once per session'},
    {id: 'require', as: 'string' }
  ],
  impl: remote.data({
    data: probe.suggestions('%$probePath%', '%$expressionOnly%', '%$input%', '%$sessionId%'),
    jbm: If(
      ({},{},{input,forceLocal}) => forceLocal  || !new jb.probe.suggestions(jb.val(input)).inExpression(),
      jbm.self(),
      probePreviewWorker()
    ),
    require: '%$require%'
  })
})

component('probe.remoteCircuitPreview', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: probePreviewWorker()}
  ],
  type: 'control',
  impl: remote.widget(probe.circuitPreview(), '%$jbm%')
})

component('probe.circuitPreview', {
  type: 'control',
  impl: group({
    controls: ctx => { 
        const _circuit = ctx.exp('%$probe/defaultMainCircuit%')
        const circuit = (jb.path(jb.utils.getComp(_circuit),'impl.$') || '').match(/Test/) ? { $: 'test.showTestInStudio', testId: _circuit} : { $: _circuit }
        jb.log('probe circuit',{circuit, ctx})
        return circuit && circuit.$ && ctx.run(circuit)
    },
    features: [
      If(
        ctx => !jb.utils.getComp(ctx.exp('%$probe/defaultMainCircuit%')),
        group.wait(treeShake.getCodeFromRemote('%$probe/defaultMainCircuit%'))
      ),
      watchRef('%$probe/scriptChangeCounter%'),
      variable('$previewMode', true)
    ]
  }),
  require: [
    {$: 'test.showTestInStudio' },
    {$: 'sampleProject.main' }
  ]
})

component('probe.initPreview', {
  type: 'action',
  impl: runActions(
    Var('dataResources', () => jb.studio && jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).join(',')),
    remote.action(treeShake.getCodeFromRemote('%$dataResources%'), '%$jbm%'),
    remote.shadowResource('probe', '%$jbm%'),
    rx.pipe(
      watchableComps.scriptChange(),
      rx.log('preview probe change script'),
      rx.map(obj(prop('op', '%op%'), prop('path', '%path%'))),
      rx.var('cssOnlyChange', tgp.isCssPath('%path%')),
      sink.action(
        remote.action({
          action: probe.handleScriptChangeOnPreview('%$cssOnlyChange%'),
          jbm: '%$jbm%',
          oneway: true
        })
      )
    )
  )
})

component('probe.handleScriptChangeOnPreview', {
  type: 'action',
  description: 'preview script change handler',
  params: [
    {id: 'cssOnlyChange', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx, cssOnlyChange) => {
        const {op, path} = ctx.data
        const handler = jb.watchableComps.startWatch()
        if (path[0] == 'probeTest.label1' || !jb.ui.headless) return
        if (!jb.utils.getComp(path[0]))
            return jb.logError(`handleScriptChangeOnPreview - missing comp ${path[0]}`, {path, ctx})
        handler.makeWatchable(path[0])
        jb.log('probe handleScriptChangeOnPreview doOp',{ctx,op,path})
        handler.doOp(handler.refOfPath(path), op, ctx)

        const headlessWidgetId = Object.keys(jb.ui.headless)[0]
        const headless = jb.ui.headless[headlessWidgetId]
        if (!headless)
            return jb.logError(`handleScriptChangeOnPreview - missing headless ${headlessWidgetId} at ${jb.uri}`, {path, ctx})
        if (cssOnlyChange) {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0, featureIndex).join('~')
            const elems = headless.body.querySelectorAll('[jb-ctx]')
                .map(elem=>({elem, path: jb.path(JSON.parse(elem.attributes.$__debug),'path') }))
                .filter(e => e.path == ctrlPath)
            elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: e.elem.attributes.class ? true : false}))           
        } else {
            const ref = ctx.exp('%$probe/scriptChangeCounter%','ref')
            const newVal = +jb.val(ref)+1
            jb.db.writeValue(ref, newVal ,ctx.setVars({headlessWidget: true}))
            jb.log('probe handleScriptChangeOnPreview increaseScriptChangeCounter',{ctx,newVal})
        }
    }
})
