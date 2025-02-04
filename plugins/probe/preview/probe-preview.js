using('probe-core,watchable-comps,tree-shake,remote-widget,testing,ui-misc,probe-result-ui,testing-ui')

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

component('circuit', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', true), plugins('probe,tree-shake,tgp'), {
    pluginPackages: packagesByPath('%$filePath%', 'studio')
  })
})

//    {id: 'sourceCode', type: 'source-code<loader>', defaultValue: treeShakeClient()},
    //{id: 'sourceCode', type: 'source-code<loader>', defaultValue: sourceCode(plugins(() => jb.sourceCode.plugins.join(',')))},

component('probePreviewWorker', {
  type: 'jbm<jbm>',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', defaultValue: sourceCodeByTgpPath('%$probe/defaultMainCircuit%')},
    {id: 'id', defaultValue: 'wProbe'}
  ],
  impl: worker(probe.idOfSourceCode('%$sourceCode%'), { sourceCode: '%$sourceCode%', init: probe.initPreview() })
})

component('probe.idOfSourceCode', {
  type: 'data<>',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>'},
  ],
  impl: (ctx,sourceCode) => JSON.stringify(sourceCode).replace(/\*/g,'ALL').replace(/[^a-zA-Z\-]/g,'')
})

component('probe.restartPreviewWorker', {
  type: 'action<>',
  impl: runActions(jbm.terminateChild('wProbe'), refreshControlById('preview'))
})

component('suggestions.calcFromProbePreview', {
  type: 'data<>',
  moreTypes: 'picklist.options<>',
  params: [
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean', byName: true},
    {id: 'input', defaultValue: '%%'},
    {id: 'sessionId', as: 'string', defaultValue: '%$$dialog.cmpId%', description: 'run probe only once per session'},
    {id: 'circuitPath', as: 'string', defaultValue: '%$probe/defaultMainCircuit%'},
  ],
  impl: remote.data({
    calc: probe.suggestions('%$probePath%', '%$expressionOnly%', '%$input%', '%$sessionId%'),
    jbm: If({
      condition: ({},{},{input,forceLocal}) => forceLocal  || !new jb.probe.suggestions(jb.val(input)).inExpression(),
      then: jbm.self(),
      Else: probePreviewWorker(sourceCodeByTgpPath('%$circuitPath%'))
    })
  })
})

component('probe.remoteCircuitPreview', {
  params: [
    {id: 'circuitPath', as: 'string', mandatory: 'true', defaultValue: '%$probe/defaultMainCircuit%'}
  ],
  type: 'control',
  impl: If({
    condition: probe.circuitPreviewRequiresMainThread('%$circuitPath%'),
    then: probe.circuitPreview('%$circuitPath%'),
    Else: remote.widget(probe.circuitPreview('%$circuitPath%'), probePreviewWorker(sourceCodeByTgpPath('%$circuitPath%')))
  })
})

component('probe.circuitPreviewRequiresMainThread', {
  type: 'boolean',
  params: [
    {id: 'circuitPath', as: 'string', mandatory: 'true'}
  ],  
  impl: (ctx,circuitPath) => {
    const _circuit = circuitPath
    return jb.utils.prettyPrint(jb.utils.resolveCompWithId(_circuit ),{noMacros: true})
      .indexOf('browserTest') != -1
  }
})

component('probe.circuitPreview', {
  type: 'control',
  params: [
    {id: 'circuitPath', as: 'string', mandatory: 'true'}
  ],  
  impl: group({
    controls: (ctx,{},{circuitPath}) => { 
        const _circuit = circuitPath
        const circuit = (jb.path(jb.utils.resolveCompWithId(_circuit,{silent: true}),'impl.$') || '').match(/Test/) 
          ? { $: 'control<>test.showTestInStudio', testId: _circuit, controlOnly: true} : { $: _circuit }
        jb.log('running probe preview circuit from control',{circuit, ctx})
        return circuit && circuit.$ && ctx.run(circuit)
    },
    features: [
      // If({
      //   condition: ctx => !jb.utils.resolveCompWithId(ctx.exp('%$probe/defaultMainCircuit%'),{silent: true}),
      //   then: group.wait(treeShake.getCodeFromRemote('%$probe/defaultMainCircuit%'))
      // }),
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
    log('probe init preview'),
    rx.pipe(
      watchableComps.scriptChange(),
      rx.log('preview probe change script'),
      rx.map(obj(prop('op', '%op%'), prop('path', '%path%'))),
      rx.var('cssOnlyChange', tgp.isCssPath('%path%')),
      sink.action(remote.action(probe.handleScriptChangeOnPreview('%$cssOnlyChange%'), '%$jbm%', {
        oneway: true
      }))
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
        if (!jb.ui.headless) return
        if (!jb.comps[path[0]])
            return jb.logError(`handleScriptChangeOnPreview - missing comp ${path[0]}`, {path, ctx})
        handler.makeWatchable(path[0])
        jb.log('probe preview handleScriptChangeOnPreview doOp',{ctx,op,path})
        if (op.$set) jb.utils.resolveProfile(op.$set)
        handler.doOp(handler.refOfPath(path), op, ctx)
        //jb.utils.resolveProfile(jb.comps[path[0]])

        const headlessWidgetId = Object.keys(jb.ui.headless)[0]
        const headless = jb.ui.headless[headlessWidgetId]
        if (!headless)
            return jb.logError(`probe preview handleScriptChangeOnPreview - missing headless ${headlessWidgetId} at ${jb.uri}`, {path, ctx})
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
            jb.log('probe preview handleScriptChangeOnPreview increaseScriptChangeCounter',{ctx,newVal})
            jb.db.writeValue(ref, newVal ,ctx.setVars({headlessWidgetId }))
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
      feature.onKey('Right', suggestions.applyOption({ addSuffix: '/' })),
      editableText.picklistHelper({
        options: suggestions.calcFromProbePreview('%$path%', { expressionOnly: true }),
        picklistFeatures: picklist.allowAsynchOptions(),
        showHelper: suggestions.shouldShow({ expressionOnly: true }),
        onEnter: suggestions.applyOption()
      })
    ]
  })
})

// ** jbm
component('jbm.restartChildJbm', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>'}
  ],
})

// ** watchable code
component('watchableCode.applyNewCode', {
  type: 'action<>',
  params: [
    {id: 'codeChange' }
  ],
})
component('source.codeChangeEvent', {
  type: 'rx'
})

// ** remote widget
component('controlBySctx', {
  type: 'control',
  params: [
    {id: 'sctx' }
  ],  
})
component('source.FEUserRequests', {
  type: 'rx',
  params: [
    {id: 'widgetId' }
  ],  
})

component('preview.createNewFrontEndWidget', {
  impl: async ctx => {
    // clean up of existing and FE, create widget with new id and return the new id
    const wrapper = jb.ui.querySelectorAll('#preview_wrapper')[0]
    if (!wrapper)
      return jb.logError('preview createNewFrontEndWidget can not find wrapper',{ctx})
    await jb.ui.unmount(wrapper)
    wrapper.querySelectorAll('>*').forEach(el=>wrapper.removeChild(el))
    const widgetId = 'preview' + (ctx.vars.previewState.counter++)
    await jb.ui.renderWidget({ $: 'control<>widget.frontEndCtrl', widgetId }, wrapper, {widgetId})
    return widgetId
  }
})

component('preview', {
  type: 'control',
  params: [
    {id: 'previewSctx'},
    {id: 'previewJbm', type: 'jbm<jbm>'}
  ],
  impl: group({
    controls: [
      button('refresh preview', action.subjectNext('%$previewButtonClick%', '1')),
      html('<div id="preview_wrapper"></div>')
    ],
    features: [
      variable('previewState', obj(prop('counter',0))),
      variable('previewButtonClick', rx.subject('previewButtonClick')),
      followUp.flow(
        source.merge(source.subject('%$previewButtonClick%'), source.data(0)),
        rx.mapPromise(jbm.restartChildJbm('%$previewJbm%')),
        rx.mapPromise(preview.createNewFrontEndWidget),
        rx.var('previewWidgetId'),
        rx.takeUntil('%$cmp/destroyed%'),
        rx.flatMap(rx.pipe(
          source.FEUserRequests('%$previewWidgetId%'),
          remote.operator({
            rx: rx.pipe(
              source.merge(source.codeChangeEvent(), source.data(0)),
              rx.doPromise(watchableCode.applyNewCode()),
              rx.flatMap(widget.headless({ control: controlBySctx('%$previewSctx%'), widgetId: '%$previewWidgetId%' }))
            ),
            jbm: '%$previewJbm%'
          })
        )),
        sink.action(action.updateFrontEnd())
      )
    ]
  })
})
