using('probe,watchable-comps,tree-shake,remote-widget,testing,probe-result-ui')

component('circuit', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', true), plugins('probe,tree-shake,tgp'), {
    pluginPackages: packagesByPath('%$filePath%', 'studio')
  })
})

// '%$studio/sourceCode%'
component('probePreviewWorker', {
  type: 'jbm<jbm>',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', defaultValue: treeShakeClient()},
    {id: 'id', defaultValue: 'wProbe'}
  ],
  impl: worker('%$id%', { sourceCode: '%$sourceCode%', init: probe.initPreview() })
})

component('suggestions.calcFromProbePreview', {
  type: 'data<>',
  moreTypes: 'picklist.options<>',
  params: [
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean'},
    {id: 'input', defaultValue: '%%'},
    {id: 'forceLocal', as: 'boolean', description: 'do not use remote preview', type: 'boolean'},
    {id: 'sessionId', as: 'string', defaultValue: '%$$dialog.cmpId%', description: 'run probe only once per session'},
    {id: 'require', as: 'string'}
  ],
  impl: remote.data({
    calc: probe.suggestions('%$probePath%', '%$expressionOnly%', '%$input%', '%$sessionId%'),
    jbm: If({
      condition: ({},{},{input,forceLocal}) => forceLocal  || !new jb.probe.suggestions(jb.val(input)).inExpression(),
      then: jbm.self(),
      Else: probePreviewWorker()
    }),
    //require: '%$require%'
  })
})

component('probe.remoteCircuitPreview2', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: probePreviewWorker()}
  ],
  type: 'control',
  impl: probe.circuitPreview()
})

component('probe.remoteCircuitPreview', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: probePreviewWorker()}
  ],
  type: 'control',
  impl: If(probe.circuitPreviewRequiresMainThread(), probe.circuitPreview(), remote.widget(probe.circuitPreview(), '%$jbm%'))
})

component('probe.circuitPreviewRequiresMainThread', {
  type: 'boolean',
  impl: ctx => {
    const _circuit = ctx.exp('%$probe/defaultMainCircuit%')
    return jb.utils.prettyPrint(jb.utils.getCompById(_circuit,{silent: true}),{noMacros: true})
      .indexOf('uiFrontEndTest') != -1
  }
})

component('probe.circuitPreview', {
  type: 'control',
  impl: group({
    controls: ctx => { 
        const _circuit = ctx.exp('%$probe/defaultMainCircuit%')
        const circuit = (jb.path(jb.utils.getCompById(_circuit,{silent: true}),'impl.$') || '').match(/Test/) 
          ? { $: 'control<>test.showTestInStudio', testId: _circuit, controlOnly: true} : { $: _circuit }
        jb.log('probe circuit',{circuit, ctx})
        return circuit && circuit.$ && ctx.run(circuit)
    },
    features: [
      If({
        condition: ctx => !jb.utils.getCompById(ctx.exp('%$probe/defaultMainCircuit%'),{silent: true}),
        then: group.wait(treeShake.getCodeFromRemote('%$probe/defaultMainCircuit%'))
      }),
      watchRef('%$probe/scriptChangeCounter%'),
      variable('$previewMode', true)
    ]
  }),
  require: [{$: 'control<>test.showTestInStudio'}]
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
        remote.action(probe.handleScriptChangeOnPreview('%$cssOnlyChange%'), '%$jbm%', {
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
        if (!jb.utils.getCompById(path[0]))
            return jb.logError(`handleScriptChangeOnPreview - missing comp ${path[0]}`, {path, ctx})
        handler.makeWatchable(path[0])
        jb.log('probe handleScriptChangeOnPreview doOp',{ctx,op,path})
        if (op.$set) jb.utils.resolveProfile(op.$set)
        handler.doOp(handler.refOfPath(path), op, ctx)
        //jb.utils.resolveProfile(jb.comps[path[0]])

        const headlessWidgetId = Object.keys(jb.ui.headless)[0]
        const headless = jb.ui.headless[headlessWidgetId]
        if (!headless)
            return jb.logError(`handleScriptChangeOnPreview - missing headless ${headlessWidgetId} at ${jb.uri}`, {path, ctx})
        if (cssOnlyChange) {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0, featureIndex).join('~')
            const elems = headless.body.querySelectorAll('[cmp-id]')
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

component('probe.propertyPrimitive', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableText({
    databind: tgp.ref('%$path%'),
    features: [
      feature.onKey('Right', suggestions.applyOption('/')),
      editableText.picklistHelper(suggestions.calcFromProbePreview('%$path%', true), {
        picklistFeatures: picklist.allowAsynchOptions(),
        showHelper: suggestions.shouldShow(true),
        onEnter: suggestions.applyOption()
      })
    ]
  })
})

component('probe.inOutView', {
  type: 'control',
  impl: group({
    controls: [
      group({
        controls: probeUI.probeResView(),
        features: [
          feature.if('%$probe/path%'),
          group.wait(pipe(probe.runCircuit('%$probe/path%'), '%result%'), text('...'), {
            varName: 'probeResult',
            passRx: true
          })
        ]
      })
    ],
    layout: layout.horizontal(),
    features: [
      watchRef('%$probe%', 'yes', { strongRefresh: true })
    ]
  })
})