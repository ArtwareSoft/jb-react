using('tgp-text-editor')

component('probeUI.probeResViewForVSCode', {
  type: 'control',
  params: [
    {id: 'probeRes', defaultValue: '%%'}
  ],
  impl: group({
    controls: [
      dynamicControls(pipeline('%badFormat%', filter('%%')), text('bad format', 'bad format')),
      dynamicControls(pipeline('%noCircuit%', filter('%%')), text('no circuit', 'no circuit')),
      dynamicControls(pipeline(list('%$errCount%'), filter('%%!=0')), group({
        controls: [
          text({
            text: pipeline(
              '%$probeRes/errors%',
              prettyPrint(probeUI.stripData('%%', true), { noMacros: true }),
              join(`
---
`)
            ),
            style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
            features: [codemirror.fold(), codemirror.lineNumbers()]
          })
        ],
        title: 'error: %$errCount%'
      })),
      dynamicControls({
        controlItems: pipeline(list('%$logsCount%'), filter('%%!=0')),
        genericControl: group(logsView.main('%$probeRes/logs%'), { title: 'logs: %$logsCount%' })
      }),
      table('in->out', {
        items: '%$probeRes/result%',
        controls: [
          group(ui.dataBrowse('%in%'), {
            title: 'in (%in/length%)',
            features: css.width(300, { minMax: 'max' })
          }),
          group(ui.dataBrowse('%out%'), { title: 'out', features: field.columnWidth(100) })
        ],
        style: table.mdc(),
        visualSizeLimit: 7,
        features: [
          itemlist.infiniteScroll(),
          css.height('100%', { minMax: 'max' }),
          field.columnWidth(100),
          css('{white-space: normal}')
        ]
      }),
      group({
        controls: [
          text({
            text: pipeline('%$probeRes/result/in%', prettyPrint('%data%', { noMacros: true }), join(`
---
`)),
            style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
            features: [codemirror.fold(), codemirror.lineNumbers()]
          })
        ],
        title: 'in:%$probeRes/simpleVisits%'
      }),
      group({
        controls: [
          text(prettyPrint('%$probeRes/result/out%', { noMacros: true }), {
            style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
            features: [codemirror.fold(), codemirror.lineNumbers()]
          })
        ],
        title: 'out'
      }),
      group({
        controls: [
          text(prettyPrint('%$probeRes%', { noMacros: true }), {
            style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
            features: [codemirror.fold(), codemirror.lineNumbers()]
          })
        ],
        title: 'probeRes'
      }),
      If('%$probeRes/circuitRes/html%', group(html('<style>%$probeRes/circuitRes/css%</style>%$probeRes/circuitRes/html%', { style: html.inIframe() }), {
        title: 'preview'
      }))
    ],
    style: group.tabs(button.href(), group.div(), { barLayout: layout.horizontal(30) }),
    features: [
      variable('errCount', count('%$probeRes/errors%')),
      variable('logsCount', count('%$probeRes/logs%')),
      variable('color', If('%$probeRes/circuitRes/success%', 'green', 'red')),
      css('>div>a:first-child { color: %$color%}')
    ]
  })
})

extension('probeUI', 'ui', {
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
    if (depth > jb.probeUI.MAX_OBJ_DEPTH)
      return '...'

    const slicedArray = (Array.isArray(data) && data.length > jb.probeUI.MAX_ARRAY_LENGTH)
    if (Array.isArray(data))
      return [...data.slice(0, jb.probeUI.MAX_ARRAY_LENGTH).map((x, i) => jb.probeUI.stripData(x, innerDepthAndPath(i)))
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
        .map(e => [e[0], jb.probeUI.stripData(e[1], innerDepthAndPath(e[0]))]))
  },
})

component('probeUI.stripData', {
  params: [
    {id: 'datum', defaultValue: '%%'},
    {id: 'systemVars', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,data,systemVars) => jb.probeUI.stripData(data,{systemVars})
})

component('probeUI.detailedInput', {
  params: [
    {id: 'input'}
  ],
  type: 'control',
  impl: group({
    controls: [
      text({
        text: pipeline('%$input/in%', prettyPrint('%data%', { noMacros: true }), join(`
---
`)),
        title: 'data',
        style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
        features: [codemirror.fold(), codemirror.lineNumbers()]
      }),
      text({
        text: pipeline(
          '%$input/in%',
          prettyPrint(probeUI.stripData('%vars%'), { noMacros: true }),
          join(`
---
`)
        ),
        title: 'vars',
        style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
        features: [codemirror.fold(), codemirror.lineNumbers()]
      }),
      text({
        text: pipeline(
          '%$input/in%',
          prettyPrint(probeUI.stripData('%vars%', true), { noMacros: true }),
          join(`
---
`)
        ),
        title: 'system vars',
        style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
        features: [codemirror.fold(), codemirror.lineNumbers()]
      })
    ],
    style: group.tabs(button.href(), group.div(), { barLayout: layout.horizontal() })
  })
})

component('probeUI.probeResView', {
  description: 'using probeResult variable',
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition('%$probeResult/0/callbagLog%', probeUI.showRxSniffer('%$probeResult/0%')),
      table({
        items: '%$probeResult%',
        controls: [
          group(ui.dataBrowse('%in%'), {
            title: 'in (%in/length%)',
            features: [
              field.titleCtrl(
                button({
                  title: 'in (%$input/in/length%)',
                  action: openDialog('in (%$input/in/length%)', probeUI.detailedInput('%$input%'), {
                    style: dialog.showSourceStyle('show-data')
                  }),
                  style: button.href()
                })
              ),
              css.width('300', { minMax: 'max' })
            ]
          }),
          group(ui.dataBrowse('%out%'), {
            title: 'out',
            features: [
              field.titleCtrl(
                button({
                  title: 'out (%$input/out/length%)',
                  action: openDialog({
                    title: 'out (%$input/out/length%)',
                    content: text(prettyPrint('%$input/out%', { noMacros: true }), 'system vars', {
                      style: text.codemirror({ enableFullScreen: true, height: '600', mode: 'javascript' }),
                      features: [codemirror.fold(), codemirror.lineNumbers()]
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
          css.height('100%', { minMax: 'max' }),
          field.columnWidth(100),
          css('{white-space: normal}')
        ]
      })
    ],
    features: [
      group.firstSucceeding(),
    ]
  })
})

component('probeUI.browseRx', {
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
      css.height('100%', 'scroll', { minMax: 'max' })
    ]
  })
})

component('probeUI.showRxSniffer', {
  type: 'control',
  params: [
    {id: 'snifferLog'}
  ],
  impl: itemlist({
    items: typeAdapter('rx<>', source.data('%$snifferLog/result%')),
    controls: group({
      controls: [
        group(ui.dataBrowse('%d%'), {
          title: 'data',
          layout: layout.flex({ justifyContent: If('%dir%==in', 'flex-start', 'flex-end') }),
          features: [
            css.width('100%'),
            css.margin({ left: '10' })
          ]
        }),
        button({
          title: '%dir%',
          action: openDialog('variables', group(ui.dataBrowse('%d/vars%')), {
            style: dialog.popup(),
            id: '',
            features: dialogFeature.uniqueDialog('variables')
          }),
          style: button.href(),
          features: [
            css.margin({ left: '10' }),
            feature.hoverTitle('show variables')
          ]
        }),
        text('%t%', 't', { style: text.span(), features: [
          css.opacity('0.5'),
          css.margin({ left: '10' })
        ] }),
        text('%time%', 'time', { style: text.span(), features: [
          css.opacity('0.5'),
          css.margin({ left: '10' })
        ] })
      ],
      layout: layout.flex({ spacing: '0' }),
      features: feature.byCondition('%dir%==out', css.color({ background: 'var(--jb-menubar-inactive-bg)' }))
    }),
    style: itemlist.ulLi(),
    visualSizeLimit: 7,
    features: [
      itemlist.incrementalFromRx(),
      css.height('100%', 'scroll', { minMax: 'max' })
    ]
  })
})

