
jb.component('studio.dataBrowse', {
  type: 'control',
  params: [
    {id: 'objToShow', mandatory: true, as: 'value', defaultValue: '%%'},
    {id: 'width', as: 'number', defaultValue: 200},
    {id: 'depth', as: 'number' },
  ],
  impl: group({
    controls: [
      group({
        controls: [
          controlWithCondition(isNull('%$obj%'), text('null')),
          controlWithCondition(({},{obj}) => obj == null, text('null')),
          controlWithCondition(({},{obj}) => Array.isArray(obj) && obj.length == 1 && obj[0] == null, text('[null]')),
          controlWithCondition(isOfType('string,boolean,number', '%$obj%'), text('%$obj%')),
          controlWithCondition(isOfType('function', '%$obj%'), text( ({data}) => data.name || 'func' )),
          // controlWithCondition('%$obj.snifferResult%', studio.showRxSniffer('%$obj%')),
          // controlWithCondition(
          //   (ctx,{obj}) => jb.callbag.isCallbag(obj),
          //   studio.browseRx('%$obj%')
          // ),

          controlWithCondition(
            isOfType('array', '%$obj%'),
            table({
              items: '%$obj%',
              controls: group({title: '%$obj/length% items', controls: studio.dataBrowse('%%', 200)}),
              style: table.mdc(),
              visualSizeLimit: 7,
              features: [itemlist.infiniteScroll(), css.height({height: '400', minMax: 'max'})]
            })
          ),
          controlWithCondition(
            '%$obj/vars%',
            group({
              layout: layout.flex({spacing: '10'}),
              controls: [
                studio.dataBrowse('%$obj/data%')
              ]
            })
          ),
          tree({
            nodeModel: tree.jsonReadOnly('%$obj%', '%$title%'),
            style: tree.expandBox({}),
            features: [
              css.class('jb-editor'),
              tree.selection({}),
              tree.keyboardSelection({}),
              css.width({width: '%$width%', minMax: 'max'})
            ]
          })
        ],
        features: group.firstSucceeding()
      }),
      controlWithCondition(
        and('%$obj/length% > 100', isOfType('string', '%$obj%')),
        button({
          title: 'open (%$obj/length%)',
          action: openDialog({
            style: dialog.showSourceStyle('show-data'),
            content: group({
              style: group.tabs({}),
              controls: [
                editableText({
                  title: 'codemirror',
                  databind: '%$obj%',
                  style: editableText.codemirror({
                    enableFullScreen: true,
                    resizer: true,
                    height: '',
                    mode: 'text',
                    debounceTime: 300,
                    lineWrapping: false,
                    lineNumbers: true,
                    readOnly: true,
                    maxLength: ''
                  })
                }),
                html({title: 'html', html: '%$obj%', style: html.inIframe()})
              ],
              features: css('{height: 100%} >div:last-child {height: 100%}')
            })
          }),
          style: button.href()
        }),
        'long text'
      )
    ],
    features: [
      variable('obj','%$objToShow%'),
      // group.wait({
      //   for: '%$objToShow%',
      //   loadingControl: text('...'),
      //   varName: 'obj',
      //   passRx: true
      // }),
      css.height({height: '400', overflow: 'auto', minMax: 'max'}),
      css.width({overflow: 'auto', minMax: 'max'}),
      group.eliminateRecursion(5)
    ]
  })
})

jb.component('studio.browseRx', {
  type: 'control',
  params: [
    {id: 'rx'}
  ],
  impl: itemlist({
        items: '%$rx%',
        controls: studio.dataBrowse('%d/vars%'),
        style: itemlist.ulLi(),
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
  })
})

jb.component('studio.showRxSniffer', {
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
              controls: studio.dataBrowse('%d%'),
              features: [css.width('100%'), css.margin({left: '10'})]
            }),
            button({
              title: '%dir%',
              action: openDialog({
                id: '',
                style: dialog.popup(),
                content: group({
                  controls: [
                    studio.dataBrowse('%d/vars%')
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

jb.component('studio.probeDataView', {
  params: [
    { id: 'circuitPath', as: 'string'}
  ],
  type: 'control',
  impl: remote.widget( group({
    controls: group({
      controls: group({
        controls: [
          controlWithCondition(
            '%$probeResult/0/callbagLog%',
            studio.showRxSniffer('%$probeResult/0%')
          ),
          table({
            items: '%$probeResult%',
            controls: [
              group({
                title: 'in (%in/length%)',
                controls: studio.dataBrowse('%in%'), //({data}) => jb.val(jb.path(data, '0.in.data'))),
                features: [css.width({width: '300', minMax: 'max'})]
              }),
              group({
                title: 'out',
                controls: studio.dataBrowse('%out%'),
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
        feature.if('%$studio/jbEditor/selected%'),
        group.wait({
          for: studio.probeResults('%$circuitPath%','%$studio/jbEditor/selected%'),
          loadingControl: text('...'),
          varName: 'probeResult',
          passRx: true
        })
      ]
    }),
    features: [
      watchRef({ref: '%$studio/jbEditor/selected%', strongRefresh: true}),
      watchRef({ref: '%$studio/pickSelectionCtxId%', strongRefresh: true}),
      watchRef({ref: '%$studio/refreshProbe%', strongRefresh: true})
    ]
  }), jbm.preview() )
})

jb.component('studio.probeResults', {
  params: [
    { id: 'circuitPath', as: 'string'},
    { id: 'probePath', as: 'string'}
  ],
  impl: pipe(probe.runCircuit('%$circuitPath%','%$probePath%'), '%result%')
})