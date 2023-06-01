using('data-browser,pretty-print')

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
                          content: editableText({
                            title: 'codemirror',
                            databind: prettyPrint({profile: '%$input/in/data%', noMacros: true}),
                            style: editableText.codemirror({
                              enableFullScreen: true,
                              height: '',
                              mode: 'text',
                              debounceTime: 300,
                              lineWrapping: false,
                              lineNumbers: true,
                              readOnly: true,
                              maxLength: ''
                            })
                          }),
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
                          content: editableText({
                            title: 'codemirror',
                            databind: prettyPrint({profile: '%$input/out%', noMacros: true}),
                            style: editableText.codemirror({
                              enableFullScreen: true,
                              height: '',
                              mode: 'text',
                              debounceTime: 300,
                              lineWrapping: false,
                              lineNumbers: true,
                              readOnly: true,
                              maxLength: ''
                            })
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
    controls: [
      group({
        style: propertySheet.titlesAbove(),
        controls: [
          text('%$probeRes/simpleVisits%', 'visits'),
          text('%$probeRes/circuitCtx.path%', 'circuit')
        ]
      }),
      table({
        items: '%$probeRes/result%',
        controls: [
          group({
            title: 'in (%in/length%)',
            controls: ui.dataBrowse('%in%'),
            features: css.width({width: 300, minMax: 'max'})
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
    ]
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

