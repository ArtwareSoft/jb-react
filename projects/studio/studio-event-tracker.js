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
                  action: runActions(() => jb.spy && jb.spy.clear(), refreshControlById('event-logs')),
                  icon: icon({icon: 'block', type: 'mdc'})
                }),
                menu.action({
                  title: 'start',
                  action: runActions(() => jb.spy && jb.spy.clear(), refreshControlById('event-logs')),
                  icon: icon({icon: 'hearing', type: 'mdc', features: [css.transformRotate('90')]})
                }),
                menu.action({
                  title: 'stop',
                  action: runActions(() => jb.spy && jb.spy.clear(), refreshControlById('event-logs')),
                  icon: icon({icon: 'stop', type: 'mdc', features: [css.transformRotate('90')]})
                }),
                menu.action({
                  title: 'refresh',
                  action: refreshControlById('event-logs', true),
                  icon: icon({icon: 'refresh', type: 'mdc', features: [css.transformRotate('90')]})
                })
              ]
            }),
            style: menuStyle.toolbar({scale: '0.6'})
          }),
          group({
            title: 'logs',
            layout: layout.horizontal(),
            controls: [
              group({
                title: 'chips',
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
        ]
      }),
      itemlist({
        items: studio.eventItems(),
        controls: [
          button({
            title: '%1%',
            style: button.mdcFloatingAction(true, true),
            features: [field.title('log'), feature.icon('linear_scale', undefined)]
          }),
          studio.eventView(),
          button({title: 'console.log', action: ({data}) => jb.frame.console.log(data)})
        ],
        style: table.plain(),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'})
        ]
      })
    ]
  })
})

jb.component('studio.eventView', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition('%path%', text('%compName%')),
      controlWithCondition('%opEvent%', text('%op%: %opEvent/opVal%')),
      controlWithCondition('%srcCtx%', text({
        features: [
          variable('path', '%srcCtx/path%' ),
          variable('compName', studio.compName('%path%') )
        ],
        text: 'activated by: %compName%'
      })),
    ],
  })
})

jb.component('studio.eventItems', {
  type: 'action',
  impl: ctx => {
    const events = jb.spy && jb.spy.all() || []
    const st = jb.studio
    return events.map(x=>enrich(x))

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

