jb.ui.getSpy = ctx => {
  const _jb = ctx.exp('%$studio/spyStudio%') ? jb : jb.studio.previewjb
  return _jb.spy || _jb.initSpy({spyParam: ctx.exp('%$studio/spyLogs%').join(',')})
}

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

jb.component('studio.highlightLogItem', {
  type: 'action',
  params: [
    {id: 'item', defaultValue: '%%'}
  ],
  impl: runActions(
    If('%$item/srcElem%',studio.openElemMarker('%$item/srcElem%','border: 1px solid green')),
    If('%$item/elem%',studio.openElemMarker('%$item/elem%','border: 1px solid blue'))
  )
})

jb.component('studio.refreshSpy', {
  type: 'action',
  params: [
    {id: 'clear', as: 'boolean'}
  ],
  impl: (ctx,clear) => {
    const spy = jb.ui.getSpy(ctx)
    clear && spy.clear();
    spy._all = null;
    spy.setLogs(ctx.exp('%$studio/spyLogs%').join(','))
    ctx.run(refreshControlById({id: 'event-logs', strongRefresh: true}))
  }
})

jb.component('studio.eventTracker', {
  type: 'control',
  impl: group({
    controls: [
      group({
        layout: layout.horizontal('14'),
        controls: [
          menu.control({
            menu: menu.menu({
              options: [
                menu.action({
                  title: 'reset',
                  action: studio.refreshSpy(true),
                  icon: icon({icon: 'block', type: 'mdc'})
                }),
                menu.action({
                  title: 'refresh',
                  action: studio.refreshSpy(),
                  icon: icon('refresh')
                })
              ]
            }),
            style: menuStyle.toolbar(menuStyle.icon('30')),
            features: css.margin('9')
          }),
          editableBoolean({
            databind: '%$studio/spyStudio%',
            style: editableBoolean.iconWithSlash('30'),
            title: 'spy studio',
            textForTrue: 'spy studio',
            textForFalse: 'spy preview',
            features: [
              feature.icon({icon: 'AndroidStudio', type: 'mdi', size: '20'}),
              css.margin({top: '9', left: '-10'})
            ]
          }),
          editableBoolean({
            databind: '%$studio/spyWatchLogs%',
            style: editableBoolean.iconWithSlash('30'),
            title: 'auto refresh (slow)',
            textForTrue: 'on',
            textForFalse: 'off',
            features: [
              feature.icon({icon: 'Autorenew', type: 'mdi', size: '20'}),
              css.margin({top: '9', left: '-10', right: ''}),
              field.onChange(studio.refreshSpy())
            ]
          }),
          multiSelect({
            title: 'logs',
            databind: '%$studio/spyLogs%',
            options: picklist.options(() => jb.studio.previewjb.spySettings.moreLogs.split(',')),
            style: multiSelect.chips(),
            features: css.margin('9')
          })
        ]
      }),
      html({title: 'hr', html: '<hr/>'}),
      itemlist({
        items: studio.eventItems(),
        controls: [
          button({
            title: '%index%: %log%',
            action: menu.openContextMenu({
              menu: menu.menu({
                options: [
                  menu.action({
                    title: 'show in console',
                    action: ({data}) => jb.frame.console.log(data)
                  }),
                  menu.action('group by %log%'),
                  menu.action('filter only %log%'),
                  menu.action('filter out %log%'),
                  menu.action('remove items before'),
                  menu.action('remove items after')
                ]
              })
            }),
            style: button.plainIcon(),
            features: [
              field.title('log'),
              field.columnWidth('20'),
              feature.byCondition('%log% == error', css.color({background: 'red'})),
              feature.icon({
                icon: data.switch({
                  cases: [
                    data.case('%log% == error', 'error'),
                    data.case('%log% == refreshElem', 'CircleOutline'),
                    data.case('%log% == doOp', 'Database')
                  ],
                  default: 'RectangleOutline'
                }),
                type: 'mdi',
                size: '16'
              }),
              css('background-color: transparent; color: grey;')
            ]
          }),
          text({text: '%log%', title: 'event'}),
          studio.eventView()
        ],
        style: table.plain(),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'}),
          itemlist.selection({
            onSelection: ({data}) => { 
            jb.studio.highlightElems([data.srcElem, data.elem].filter(x=>x))
          }
          }),
          itemlist.keyboardSelection({}),
          watchObservable(
            ctx => ctx.exp('%$studio/spyWatchLogs%') && jb.ui.getSpy(ctx).observable()
          ),
        ]
      })
    ],
    features: [
      variable({name: 'eventTracker', value: obj()}),
      feature.init(
        runActions(
          action.if(
              not('%$studio/spyLogs%'),
              writeValue('%$studio/spyLogs%', list('doOp', 'refreshElem'))
            ),
          studio.refreshSpy(true)
        )
      )
    ]
  })
})

jb.component('studio.eventView', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('4'),
    features: feature.onHover({
      action: studio.highlightLogItem(),
      onLeave: dialog.closeDialog('elem-marker'), 
    }),
    controls: [
      controlWithCondition(isOfType('string', '%event/2%'), text('%event/2%')),
      controlWithCondition('%path%', text('%compName%')),
      controlWithCondition('%op%', text('%op%')),
      controlWithCondition(
        '%srcCompName%',
        group({
          layout: layout.horizontal(),
          controls: [
            text('activated by:'),
            button({
              title: '%srcCompName%',
              action: studio.openJbEditor('%srcPath%'),
              style: button.href(),
              features: feature.hoverTitle('%srcPath%')
            })
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
    const spy = jb.ui.getSpy(ctx)
    const events = (spy._all = ctx.vars.eventTracker.lastIndex == spy.logs.$index ? spy._all : spy.all().map(x=>enrich(x)))
    ctx.vars.eventTracker.lastIndex = spy.logs.$index
    return events

    function enrich(event) {
      const ev = { event, log: event[1], index: event[0] }
      ev.ctx = (event || []).filter(x=>x && x.componentContext)[0]
      ev.path = ev.ctx && ev.ctx.path
      ev.compName = ev.path && st.compNameOfPath(ev.path)
      ev.cmp = (event || []).filter(x=>x && x.base && x.refresh)[0]
      ev.elem = ev.cmp && ev.cmp.base || (event || []).filter(x=>x && x.nodeType)[0]
      ev.opEvent = (event || []).filter(x=>x && x.opVal)[0]
      ev.op = ev.opEvent && jb.prettyPrint(ev.opEvent.op,{forceFlat: true}).replace(/{|}|\$/g,'')
      ev.srcCtx = (event || []).filter(x=>x && x.srcCtx).map(x=>x.srcCtx)[0]
      ev.srcElem = jb.path(ev.srcCtx, 'vars.cmp.base')
      ev.srcPath = jb.path(ev.srcCtx, 'vars.cmp.ctx.path')
      ev.srcCompName = ev.srcPath && st.compNameOfPath(ev.srcPath)
      return ev
    }
  }
})

jb.component('studio.openElemMarker', {
  type: 'action',
  params: [
    {id: 'elem'},
    {id: 'css', as: 'string'}
  ],
  impl: openDialog({
      id: 'elem-marker',
      style: studio.elemMarkerDialog(),
      content: text(''),
      features: [
        css((ctx,{},{elem}) => {
              const elemRect = elem.getBoundingClientRect()
              const left = elemRect.left + 'px'
              const top = jb.ui.studioFixYPos() + elemRect.top + 'px'
              return `left: ${left}; top: ${top}; width: ${elemRect.width}px; height: ${elemRect.height}px;`
        }),
        css((ctx,{},{css}) => css)
      ]
    })
})

jb.component('studio.elemMarkerDialog', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: '{ display: block; position: absolute; background: transparent}',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
  })
})