jb.component('studio.openEventTracker', {
  type: 'action',
  impl: openDialog({
    style: dialog.studioFloating({id: 'event-tracker', width: '700', height: '400'}),
    content: studio.eventTracker(),
    title: 'Spy',
    features: dialogFeature.resizer()
  })
})

jb.component('studio.highlightEvent', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: studio.highlightByPath('%$path%')
})

jb.component('studio.eventTracker', {
  type: 'control',
  impl: group({
    controls: [
      group({
        layout: layout.horizontal(),
        controls: [
          menu.control({
            menu: menu.menu({
              options: [
                menu.action({
                  title: 'clear',
                  action: runActions(() => {
                    jb.spy.clear(); jb.spy._all = null
                  }, refreshControlById('event-logs')),
                  icon: icon('block')
                }),
                menu.action({ // TODO: move to dialog close
                  title: 'stop',
                  action: runActions(() => jb.spy && jb.spy.clear(), refreshControlById('event-logs')),
                  icon: icon('stop')
                }),
                menu.action({
                  title: 'refresh',
                  action: refreshControlById('event-logs', true),
                  icon: icon('refresh')
                })
              ]
            }),
            style: menuStyle.toolbar(menuStyle.icon('30')),
            features: css.margin('9')
          }),
          studio.selectSpyLogs()
        ]
      }),
      itemlist({
        items: studio.eventItems(),
        controls: [
          button({
            title: '%0%: %1%',
            action: menu.openContextMenu({
              menu: menu.menu({
                options: [
                  menu.action({
                    title: 'show in console',
                    action: ({data}) => jb.frame.console.log(data)
                  }),
                  menu.action('group by %1%'),
                  menu.action('filter only %1%'),
                  menu.action('filter out %1%'),
                  menu.action('remove items before'),
                  menu.action('remove items after')
                ]
              })
            }),
            style: button.mdcIcon(undefined, '24'),
            features: [
              field.title('log'),
              field.columnWidth('20'),
              feature.byCondition('%1% == error', [css.color({background: 'red'})]),
              feature.icon({
                icon: data.switch({
                  cases: [data.case('%1% == error', 'error')],
                  default: 'linear_scale'
                })
              })
            ]
          }),
          text({text: '%1%', title: 'event'}),
          studio.eventView()
        ],
        style: table.plain(),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'}),
          itemlist.selection({}),
          itemlist.keyboardSelection({})
        ]
      })
    ]
  })
})

jb.component('studio.selectSpyLogs', {
  type: 'control',
  impl: group({
    title: 'logs',
    layout: layout.horizontal(),
    controls: [
      group({
        title: 'logs',
        layout: layout.flex({wrap: 'wrap'}),
        controls: [
          dynamicControls({
            controlItems: '%$studio/spyLogs%',
            genericControl: group({
              title: 'chip',
              layout: layout.flex({wrap: 'wrap', spacing: '0'}),
              controls: [
                button({title: '%% ', style: button.mdcChipAction(), raised: 'false'}),
                button({
                  title: 'delete',
                  style: button.x(),
                  features: [
                    css('color: black; z-index: 1000;margin-left: -30px'),
                    itemlist.shownOnlyOnItemHover()
                  ]
                })
              ],
              features: [
                css('color: black; z-index: 1000'),
                feature.onEvent({
                  event: 'click',
                  action: removeFromArray({array: '%$studio/spyLogs%', itemToRemove: '%%'})
                }),
                css.class('jb-item')
              ]
            })
          })
        ],
        features: watchRef({
          ref: '%$studio/spyLogs%',
          includeChildren: 'yes',
          allowSelfRefresh: true,
          strongRefresh: false
        })
      }),
      group({
        title: 'add log',
        layout: layout.horizontal('20'),
        controls: [
          picklist({
            options: picklist.options(
              list(keys(() => jb.spySettings.groups), () => jb.spySettings.moreLogs.split(','))
            ),
            features: [
              picklist.onChange(
                runActions(ctx => ctx.run(addToArray('%$studio/spyLogs%', '%%')))
              ),
              css.margin('6')
            ]
          })
        ],
        features: css.margin({left: '10'})
      })
    ],
    features: feature.init(
      ctx=> ctx.run(writeValue('%$studio/spyLogs%', split({text: 'doOp,refreshElem'})))
    )
  })
})

jb.component('studio.eventView', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition('%path%', text('%compName%')),
      controlWithCondition('%opEvent%', text('%op%: %opEvent/opVal%')),
      controlWithCondition(
        '%srcCtx%',
        text({
          text: 'activated by: %compName%',
          features: [
            variable({name: 'path', value: '%srcCtx/path%'}),
            variable({name: 'compName', value: studio.compName('%path%')})
          ]
        })
      ),
      controlWithCondition(
        isOfType('string', '%2%'),
        text({
          text: '%2%',
          features: [
            variable({name: 'path', value: '%srcCtx/path%'}),
            variable({name: 'compName', value: studio.compName('%path%')})
          ]
        })
      )
    ]
  })
})

jb.component('studio.eventItems', {
  type: 'action',
  impl: ctx => {
    const st = jb.studio
    const spy = st.previewjb.spy || st.previewWindow.initSpy({spyParam: ctx.exp('%$studio/spyLogs%').join(',')})
    const events = (spy._all = spy._all || spy.all().map(x=>enrich(x)))
    return events

    function enrich(ev) {
      if (ev.enriched) return ev
      ev.enriched = true
      ev.ctx = (ev || []).filter(x=>x && x.componentContext)[0]
      ev.path = ev.ctx && ev.ctx.path
      ev.compName = ev.path && st.compNameOfPath(ev.path)
      ev.cmp = (ev || []).filter(x=>x && x.base && x.refresh)[0]
      ev.elem = ev.cmp && ev.cmp.base || (ev || []).filter(x=>x && x.nodeType)[0]
      ev.opEvent = (ev || []).filter(x=>x && x.opVal)[0]
      ev.op = ev.opEvent && Object.keys(ev.opEvent.op).filter(x=>x.match(/^$/))[0]
      ev.srcCtx = (ev || []).filter(x=>x && x.srcCtx).map(x=>x.srcCtx)[0]
      return ev
    }
  }
})

