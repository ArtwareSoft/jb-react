
jb.component('probe.inOutView', {
  type: 'control',
  impl: group({ 
    controls: remote.widget( group({
        layout: layout.horizontal(),
        controls: [
            text({
                text: prettyPrint('%$probe%'), 
                style: text.textarea({rows: 20}),
            }),           
            group({
            controls: group({
                controls: [
                controlWithCondition(
                    '%$probeResult/0/callbagLog%',
                    probe.showRxSniffer('%$probeResult/0%')
                ),
                table({
                    items: '%$probeResult%',
                    controls: [
                    group({
                        title: 'in (%in/length%)',
                        controls: ui.dataBrowse('%in%'), //({data}) => jb.val(jb.path(data, '0.in.data'))),
                        features: [css.width({width: '300', minMax: 'max'})]
                    }),
                    group({
                        title: 'out',
                        controls: ui.dataBrowse('%out%'),
                        features: field.columnWidth(100)
                    })
                    ],
                    style: table.mdc(),
                    visualSizeLimit: 7,
                    features: [
                    itemlist.infiniteScroll(),
                    css.height({height: '100%', minMax: 'max'}),
                    field.columnWidth(100),
                    css('{white-space: normal}')
                    ]
                })
                ],
                features: [group.firstSucceeding(), log('probe result',obj(prop('res','%$probeResult%'))) ]
            }),
            features: [
                feature.if('%$probe/path%'),
                group.wait({
                    for: pipe(probe.runCircuit('%$probe/path%'), '%result%'),
                    loadingControl: text('...'),
                    varName: 'probeResult',
                    passRx: true
                })
            ]
            }),             
        ],
        features: [
              watchRef({ref: '%$probe%', strongRefresh: true, includeChildren: 'yes'}),

//            watchRef({ref: '%$probe/path%', strongRefresh: true}),
//            watchRef({ref: '%$studio/pickSelectionCtxId%', strongRefresh: true}),
//            watchRef({ref: '%$studio/refreshProbe%', strongRefresh: true})
        ]
        }), jbm.wProbe() ),
    //features: feature.if('%$probe/path%') // TODO: fix in ui-comp
  })
})

jb.component('probe.browseRx', {
  type: 'control',
  params: [
    {id: 'rx'}
  ],
  impl: itemlist({
        items: '%$rx%',
        controls: ui.dataBrowse('%d/vars%'),
        style: itemlist.ulLi(),
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
  })
})

jb.component('probe.showRxSniffer', {
  type: 'control',
  params: [
    {id: 'snifferLog'}
  ],
  impl: itemlist({
        items: source.data('%$snifferLog/result%'),
        controls: group({
          layout: layout.flex({spacing: '0'}),
          controls: [
            group({
              title: 'data',
              layout: layout.flex({justifyContent: data.if('%dir%==in', 'flex-start', 'flex-end')}),
              controls: ui.dataBrowse('%d%'),
              features: [css.width('100%'), css.margin({left: '10'})]
            }),
            button({
              title: '%dir%',
              action: openDialog({
                id: '',
                style: dialog.popup(),
                content: group({
                  controls: [
                    ui.dataBrowse('%d/vars%')
                  ]
                }),
                title: 'variables',
                features: dialogFeature.uniqueDialog('variables')
              }),
              style: button.href(),
              features: [css.margin({left: '10'}), feature.hoverTitle('show variables')]
            }),
            text({
              text: '%t%',
              title: 't',
              style: text.span(),
              features: [css.opacity('0.5'), css.margin({left: '10'})]
            }),
            text({
              text: '%time%',
              title: 'time',
              style: text.span(),
              features: [css.opacity('0.5'), css.margin({left: '10'})]
            })
          ],
          features: feature.byCondition('%dir%==out', css.color({background: 'var(--jb-menubar-inactive-bg)'}))
        }),
        style: itemlist.ulLi(),
        visualSizeLimit: 7,
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
   })
})

jb.component('probe.mainCircuitView', {
    type: 'control',
    impl: group({
        controls: ctx => { 
            const _circuit = ctx.exp('%$probe/defaultMainCircuit%')
            const circuit = (jb.path(jb.comps[_circuit],'impl.$') || '').match(/Test/) ? { $: 'test.showTestInStudio', testId: _circuit} : { $: _circuit }
            jb.log('probe circuit',{circuit, ctx})
            return circuit && circuit.$ && ctx.run(circuit)
        },
        features: [ 
            If(ctx => !jb.comps[ctx.exp('%$probe/defaultMainCircuit%')], group.wait(treeShake.getCodeFromRemote('%$probe/defaultMainCircuit%'))),
            watchRef('%$probe/scriptChangeCounter%'),
            variable('$previewMode',true)
        ]
    }),
    require: {$: 'test.showTestInStudio'}
})

jb.component('probe.remoteMainCircuitView', {
    params: [
        {id: 'jbm', defaultValue: jbm.wProbe() }
    ],    
    type: 'control',
    impl: remote.widget( probe.mainCircuitView(), '%$jbm%' )
})