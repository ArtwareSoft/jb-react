using('data-browser,pretty-print')

extension('probe', 'ui', {
  initExtension() {
    return { MAX_OBJ_DEPTH: 10, MAX_ARRAY_LENGTH: 1000}
  },
  stripData(data, { top, depth, path, systemVars } = {}) {
    if (data == null) return
    const innerDepthAndPath = key => ({ systemVars, depth: (depth || 0) + 1, top: top || data, path: [path, key].filter(x => x).join('~') })

    if (['string', 'boolean', 'number'].indexOf(typeof data) != -1) return data
    if (typeof data == 'function')
      return 'function'
    if (data instanceof jb.core.jbCtx)
      return jb.remoteCtx.stripFunction(data)
      //return { id: data.id, data: data.data, path: data.path, $: 'ctx'}
    if (depth > jb.probe.MAX_OBJ_DEPTH)
      return '...'

    const slicedArray = (Array.isArray(data) && data.length > jb.probe.MAX_ARRAY_LENGTH)
    if (Array.isArray(data))
      return [...data.slice(0, jb.probe.MAX_ARRAY_LENGTH).map((x, i) => jb.probe.stripData(x, innerDepthAndPath(i)))
        , ...slicedArray ? ['...'] : []]
    if (typeof data == 'object' && ['DOMRect'].indexOf(data.constructor.name) != -1)
      return jb.objFromEntries(Object.keys(data.__proto__).map(k => [k, data[k]]))
    if (typeof data == 'object' && (jb.path(data.constructor,'name') || '').match(/Error$/))
      return data.toString()
    if (typeof data == 'object' && ['VNode', 'Object', 'Array'].indexOf(data.constructor.name) == -1)
      return { $$: data.constructor.name }
    if (typeof data == 'object' && data.comps)
      return { uri: data.uri }
    if (typeof data == 'object')
      return jb.objFromEntries(jb.entries(data)
        .filter(e => systemVars || e[0][0] != '$')
        .filter(e => data.$ || typeof e[1] != 'function') // if not a profile, block functions
        .map(e => [e[0], jb.probe.stripData(e[1], innerDepthAndPath(e[0]))]))
  },
})

component('probe.stripData', {
  params: [
    {id: 'data', defaultValue: '%%'},
    {id: 'systemVars', as: 'boolean'},
  ],
  impl: (ctx,data,systemVars) => jb.probe.stripData(data,{systemVars})
})

component('probe.detailedInput', {
  params: [
    {id: 'input'}
  ],
  type: 'control',
  impl: group({
    style: group.tabs({tabStyle: button.href(), barStyle: group.div(), barLayout: layout.horizontal()}),
    controls: [
      text({
        text: pipeline('%$input/in%', prettyPrint({profile: '%data%', noMacros: true}), join(`
---
`)),
        title: 'data',
        style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
        features: [
          codemirror.fold(),
          codemirror.lineNumbers()
        ]
      }),
      text({
        text: pipeline('%$input/in%', prettyPrint({profile: probe.stripData('%vars%'), noMacros: true}), join(`
---
`)),
        title: 'vars',
        style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
        features: [
          codemirror.fold(),
          codemirror.lineNumbers()
        ]
      }),
      text({
        text: pipeline(
          '%$input/in%',
          prettyPrint({profile: probe.stripData('%vars%', true), noMacros: true}),
          join(`
---
`)
        ),
        title: 'system vars',
        style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
        features: [
          codemirror.fold(),
          codemirror.lineNumbers()
        ]
      })
    ]
  })
})

component('probe.inOutView', {
  type: 'control',
  impl: group({
    layout: layout.horizontal(),
    controls: [
      group({
        controls: group({
          controls: [
            controlWithCondition('%$probeResult/0/callbagLog%', probe.showRxSniffer('%$probeResult/0%')),
            table({
              items: '%$probeResult%',
              controls: [
                group({
                  title: 'in (%in/length%)',
                  controls: ui.dataBrowse('%in%'),
                  features: [
                    field.titleCtrl(
                      button({
                        title: 'in (%$input/in/length%)',
                        action: openDialog({
                          title: 'in (%$input/in/length%)',
                          content: probe.detailedInput('%$input%'),
                          style: dialog.showSourceStyle('show-data')
                        }),
                        style: button.href()
                      })
                    ),
                    css.width({width: '300', minMax: 'max'})
                  ]
                }),
                group({
                  title: 'out',
                  controls: ui.dataBrowse('%out%'),
                  features: [
                    field.titleCtrl(
                      button({
                        title: 'out (%$input/out/length%)',
                        action: openDialog({
                          title: 'out (%$input/out/length%)',
                          content: text({
                            text: prettyPrint({profile: '%$input/out%', noMacros: true}),
                            title: 'system vars',
                            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
                            features: [
                              codemirror.fold(),
                              codemirror.lineNumbers()
                            ]
                          }),
                          style: dialog.showSourceStyle('show-data')
                        }),
                        style: button.href()
                      })
                    ),
                    field.columnWidth(100)
                  ]
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
          features: [
            group.firstSucceeding(),
            log('probe result', obj(prop('res', '%$probeResult%')))
          ]
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
      })
    ],
    features: [
      watchRef({ref: '%$probe%', includeChildren: 'yes', strongRefresh: true})
    ]
  })
})

component('probe.probeResView', {
  type: 'control',
  params: [
    {id: 'probeRes', defaultValue: '%%'}
  ],
  impl: group({
    style: group.tabs({tabStyle: button.href(), barStyle: group.div(), barLayout: layout.horizontal(30)}),
    controls: [
      dynamicControls(pipeline('%badFormat%', filter('%%')), text('bad format', 'bad format')),
      dynamicControls(pipeline('%noCircuit%', filter('%%')), text('no circuit', 'no circuit')),
      dynamicControls(
        pipeline(list('%$errCount%'), filter('%%!=0')),
        group({
          title: 'error: %$errCount%',
          controls: [
            text({
              text: pipeline(
                '%$probeRes/errors%',
                prettyPrint({profile: probe.stripData('%%', true), noMacros: true}),
                join(`
---
`)
              ),
              style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
              features: [
                codemirror.fold(),
                codemirror.lineNumbers()
              ]
            })
          ]
        })
      ),
      table({
        title: 'in->out',
        items: '%$probeRes/result%',
        controls: [
          group({
            title: 'in (%in/length%)',
            controls: ui.dataBrowse('%in%'),
            features: css.width({width: 300, minMax: 'max'})
          }),
          group({title: 'out', controls: ui.dataBrowse('%out%'), features: field.columnWidth(100)})
        ],
        style: table.mdc(),
        visualSizeLimit: 7,
        features: [
          itemlist.infiniteScroll(),
          css.height({height: '100%', minMax: 'max'}),
          field.columnWidth(100),
          css('{white-space: normal}')
        ]
      }),
      group({
        title: 'in',
        controls: [
          text({
            text: pipeline('%$probeRes/result/in%', prettyPrint({profile: '%data%', noMacros: true}), join(`
---
`)),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      }),
      group({
        title: 'out',
        controls: [
          text({
            text: prettyPrint({profile: '%$probeRes/result/out%', noMacros: true}),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      }),
      group({
        title: 'vars',
        controls: [
          text({
            text: pipeline(
              '%$probeRes/result/in%',
              prettyPrint({profile: probe.stripData('%vars%'), noMacros: true}),
              join(`
---
`)
            ),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      }),
      group({
        title: 'params',
        controls: [
          text({
            text: pipeline(
              '%$probeRes/result/in%',
              prettyPrint({profile: probe.stripData('%params%'), noMacros: true}),
              join(`
---
`)
            ),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      }),
      group({
        title: 'visits: %$probeRes/simpleVisits%',
        controls: [
          text({
            text: pipeline(
              '%$probeRes/result/in%',
              prettyPrint({profile: probe.stripData('%varsvars%', true), noMacros: true}),
              join(`
---
`)
            ),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      }),
      text({title: 'circuit: %$probeRes/circuitPath%'}),
      group({
        title: 'probeRes',
        controls: [
          text({
            text: prettyPrint({profile: '%$probeRes%', noMacros: true}),
            style: text.codemirror({enableFullScreen: true, height: '600', mode: 'javascript'}),
            features: [
              codemirror.fold(),
              codemirror.lineNumbers()
            ]
          })
        ]
      })
    ],
    features: variable('errCount', count('%$probeRes/errors%'))
  })
})

component('probe.browseRx', {
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

component('probe.showRxSniffer', {
  type: 'control',
  params: [
    { id: 'snifferLog' }
  ],
  impl: itemlist({
    items: source.data('%$snifferLog/result%'),
    controls: group({
      layout: layout.flex({ spacing: '0' }),
      controls: [
        group({
          title: 'data',
          layout: layout.flex({ justifyContent: data.if('%dir%==in', 'flex-start', 'flex-end') }),
          controls: ui.dataBrowse('%d%'),
          features: [css.width('100%'), css.margin({ left: '10' })]
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
          features: [css.margin({ left: '10' }), feature.hoverTitle('show variables')]
        }),
        text({
          text: '%t%',
          title: 't',
          style: text.span(),
          features: [css.opacity('0.5'), css.margin({ left: '10' })]
        }),
        text({
          text: '%time%',
          title: 'time',
          style: text.span(),
          features: [css.opacity('0.5'), css.margin({ left: '10' })]
        })
      ],
      features: feature.byCondition('%dir%==out', css.color({ background: 'var(--jb-menubar-inactive-bg)' }))
    }),
    style: itemlist.ulLi(),
    visualSizeLimit: 7,
    features: [
      itemlist.incrementalFromRx(),
      css.height({ height: '100%', overflow: 'scroll', minMax: 'max' })
    ]
  })
})

