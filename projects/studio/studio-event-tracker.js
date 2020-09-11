jb.ui.getSpy = ctx => {
  const spy = jb.path(jb.studio,'previewjb.spy')
  if (!spy)
    jb.logError('studio.eventItems - can not locate spy')
  return spy
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

jb.component('studio.getSpy', {
  impl: ctx => jb.ui.getSpy(ctx)
})

jb.component('studio.clearSpyLog', {
  type: 'action',
  impl: ctx => jb.ui.getSpy(ctx).clear()
})

jb.component('studio.refreshSpy', {
  type: 'action',
  params: [
    {id: 'clear', as: 'boolean'}
  ],
  impl: refreshControlById('event-tracker')
})

jb.component('studio.eventTracker', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: '',
        layout: layout.horizontal('14'),
        controls: [
          text({text: pipeline(studio.getSpy(), '%logs/length%'), title: 'count'}),
          button({
            title: 'clear',
            action: studio.clearSpyLog(),
            style: button.mdcIcon(icon({icon: 'clear'}), '20')
          }),
          button({
            title: 'refresh',
            action: refreshControlById('event-tracker'),
            style: button.mdcIcon(icon({icon: 'refresh'}), '20')
          }),
          editableText({
            title: 'query',
            databind: '%$studio/eventTrackerQuery%',
            style: editableText.input(),
            features: htmlAttribute('placeholder', 'query')
          }),
          editableText({
            title: 'pattern',
            databind: '%$studio/eventTrackerPattern%',
            style: editableText.input(),
            features: htmlAttribute('placeholder', 'pattern')
          }),
          multiSelect({
            title: 'logs',
            databind: '%$studio/spyLogs%',
            options: picklist.options(() => jb.studio.previewjb.spySettings.moreLogs.split(',')),
            style: multiSelect.chips(),
            features: [css.margin('15'), hidden()]
          })
        ]
      }),
      html({title: 'hr', html: '<hr/>'}),
      itemlist({
        items: studio.eventItems('%$studio/eventTrackerQuery%','%$studio/eventTrackerPattern%'),
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
              feature.byCondition('%log% == error', css.color('var(--jb-errorForeground)')),
              feature.icon({
                icon: data.switch({
                  cases: [
                    data.case('%log% == error', 'error'),
                    data.case('%log% == refreshElem', 'CircleOutline'),
                    data.case('%log% == doOp', 'Database')
                  ],
                  default: 'RectangleOutline'
                }),
                type: data.switch({cases: [data.case('%log% == error', 'mdc')], default: 'mdi'}),
                size: '16'
              })
            ]
          }),
          text({
            text: '%index% %log%',
            title: 'event',
            features: feature.onHover(studio.highlightLogItem(), dialog.closeDialogById('elem-marker'))
          }),
          studio.eventView()
        ],
        style: table.plain(),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'}),
          itemlist.selection({onSelection: ({data}) => jb.frame.console.log(data)}),
          itemlist.keyboardSelection({})
        ]
      })
    ],
    features: [
      id('event-tracker'),
      variable({name: 'eventTracker', value: obj()}),
    ]
  })
})

jb.component('studio.eventView', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('4'),
    controls: [
      studio.slicedString('%title%',20),
      studio.showLowFootprintObj('%val%','val'),
      controlWithCondition(
        '%opPath%',
        button({
          title: last('%opPath%'),
          style: button.href(),
          features: feature.hoverTitle(join({separator: '/', items: '%opPath%'}))
        })
      ),
      controlWithCondition(({data}) => data.opValue != null, text('<- %opValue%')),
      controlWithCondition(
        '%path%',
        button({
          title: '%compName%',
          action: studio.showStack('%ctx%'),
          style: button.href(),
          features: [
            feature.hoverTitle('%path%'),
            feature.onHover({action: studio.highlightByPath('%path%')}),
            ctrlAction(studio.openComponentInJbEditor('%path%'))
          ]
        })
      ),
      controlWithCondition(
        '%srcCompName%',
        group({
          layout: layout.horizontal(),
          controls: [
            text('activated by:'),
            button({
              title: '%srcCompName%',
              action: studio.showStack('%srcCtx%'),
              style: button.href(),
              features: [
                feature.hoverTitle('%srcPath%'),
                feature.onHover({action: studio.highlightByPath('%srcPath%')})
              ]
            })
          ]
        })
      ),
      studio.showLowFootprintObj('%ctx/data%','data'),
      studio.showLowFootprintObj('%ctx/vars%','vars'),
      studio.showLowFootprintObj('%data%','data'),
      studio.showLowFootprintObj('%jbComp%','jbComp'),
      studio.showLowFootprintObj('%delta%','delta'),
      studio.showLowFootprintObj('%vdom%','vdom'),
      studio.slicedString('%description%'),
      studio.slicedString('%error/message%'),
    ]
  })
})

jb.component('studio.showLowFootprintObj', {
  params: [
    {id: 'obj', mandatory: true },
    {id: 'title', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 20 },
  ],
  impl: controlWithCondition('%$obj%', group({
    controls: [
      controlWithCondition(
        isOfType('object,array', '%$obj%'),
        button({
          vars: Var('count', pipeline('%$obj%',keys(),count())),
          title: If(isOfType('array', '%$obj%'), '%$title%[%$obj/length%]','%$title% (%$count%)'),
          action: openDialog({
            style: dialog.popup(),
            content: studio.dataBrowse('%$obj%'),
            title: 'data',
            features: dialogFeature.uniqueDialog('showObj')
          }),
          style: button.href(),
          features: [css.margin({left: '10'}), feature.hoverTitle('open')]
        })
      ),
      controlWithCondition(
        isOfType('string,number,boolean', '%$obj%'),
        text({text: pipeline('%$obj%', slice(0, 20))})
      ),
      controlWithCondition(
        isOfType('function', '%$obj%'),
        text(({},{},{obj}) => obj.name)
      ),
    ]
  }))
})

jb.component('studio.slicedString', {
  params: [
    {id: 'data', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 30 },
  ],
  impl: controlWithCondition(
        isOfType('string', '%$data%'),
        text({text: pipeline('%$data%', slice(0, '%$length%'))})
    )
})


jb.component('studio.eventItems', {
  params: [
    {id: 'query', as: 'string' },
    {id: 'pattern', as: 'string' },
  ],
  impl: (ctx,query,pattern) => {
    const st = jb.studio
    const spy = jb.path(jb.studio,'previewjb.spy')
    if (!spy) {
      jb.logError('studio.eventItems - can not locate spy')
      return []
    }
    const ret = spy.search(query).map(x=>enrich(x)).filter(x=>!(x.path || '').match(/studio.eventTracker/))
    const regexp = new RegExp(pattern)
    return pattern ? ret.filter(x=>regexp.test(Array.from(x.values()).filter(x=> typeof x == 'string').join(','))) : ret

    function enrich(event) {
      const ev = { event, log: event[0], index: event.index }
      if (ev.log == 'pptrError') {
        ev.log = 'error'
        ev.error = event[1].err
      }
      ev.title = typeof event[1] == 'string' && event[1]
      ev.ctx = (event || []).filter(x=>x && x.cmpCtx && x.profile)[0]
      ev.ctx = ev.ctx || (event || []).filter(x=>x && x.path && x.profile)[0]
      ev.jbComp = (event || []).filter(x=> jb.path(x,'constructor.name') == 'JbComponent')[0]
      ev.ctx = ev.ctx || ev.jbComp && ev.jbComp.ctx

      ev.path = ev.ctx && ev.ctx.path
      if (Array.isArray(ev.path)) ev.path = ev.path.join('~')
      if (typeof ev.path != 'string') ev.path = null
      ev.compName = ev.path && st.compNameOfPath(ev.path)
      ev.cmp = (event || []).filter(x=>x && x.base && x.refresh)[0]
      ev.elem = ev.cmp && ev.cmp.base || (event || []).filter(x=>x && x.nodeType)[0]
      ev.opEvent = (event || []).filter(x=>x && x.opVal != null)[0]
      ev.opPath = ev.opEvent && ev.opEvent.path
      const op = ev.opEvent && ev.opEvent.op
      ev.opValue = op && op.$set != null && op.$set
      if (ev.opValue == null && op)
        ev.opValue = jb.prettyPrint(op,{forceFlat: true}).replace(/{|}|\$/g,'').replace("'set': ",'')
      ev.srcCtx = (event || []).filter(x=>x && x.srcCtx).map(x=>x.srcCtx)[0]
      ev.srcElem = jb.path(ev.srcCtx, 'vars.cmp.base')
      ev.srcPath = jb.path(ev.srcCtx, 'vars.cmp.ctx.path')
      ev.srcCompName = ev.srcPath && st.compNameOfPath(ev.srcPath)
//       const isPptr = typeof event[1] == 'string' && event[1].indexOf('pptr') == 0
//       ev.description = ev.description || event[1] == 'pptrActivity' && [event[1].activity, event[1].description].join(': ')
//       ev.description = ev.description || isPptr && jb.path(event[1],'data.description')
//       ev.description = ev.description || event[1] == 'setGridAreaVals' && jb.asArray(event[4]).join('/')
//       ev.description = ev.description || event[1] == 'htmlChange' && [event[4],event[5]].join(' <- ')
//       ev.description = ev.description || event[1] == 'pptrError' && event[1].message
//       ev.description = ev.description || event[1] == 'pptrError' && typeof event[1].err == 'string' && event[1].err
// //      ev.description = ev.description || event[1].match(/ToRemote|FromRemote/) && `${event[1].dir}:${event[1].t} channel:${event[3].channel}`
//       ev.description = ev.description || event[1] == 'innerCBDataSent' && `channel:${event[3].sinkId}`

//       ev.elem = event[1] == 'applyDelta' && event[1]
//       ev.delta = event[1] == 'applyDelta' && event[3]

//       ev.delta = ev.delta || event[1] == 'applyDeltaTop' && event[1] == 'apply' && event[5]
//       ev.elem = ev.elem || event[1] == 'applyDeltaTop' && event[1] == 'start' && event[3]
//       ev.vdom = ev.vdom || event[1] == 'applyDeltaTop' && event[1] == 'start' && event[4]

//       ev.val = event[1] == 'calcRenderProp' && event[3]
// //      ev.val = ev.val || event[1].match(/ToRemote|FromRemote/) && event[1].d
//       ev.val = ev.val || event[1] == 'innerCBDataSent' && event[1].data

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
              const left = jb.ui.studioFixXPos(elem) + elemRect.left + 'px'
              const top = jb.ui.studioFixYPos(elem) + elemRect.top + 'px'
              const width = Math.max(10,elemRect.width), height = Math.max(10,elemRect.height)
              return `left: ${left}; top: ${top}; width: ${width}px; height: ${height}px;`
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

jb.component('studio.showStack', {
  type: 'action',
  params: [
    {id: 'ctx'},
    {id: 'onSelect', type: 'action', dynamic: true, defaultValue: studio.openJbEditor('%path%') }
  ],
  impl: openDialog({
    id: 'show-stack',
    style: dialog.popup(),
    content: itemlist({
      items: ({},{},{ctx}) => {
          const ctxStack=[];
          for(let innerCtx= ctx; innerCtx; innerCtx = innerCtx.cmpCtx)
            ctxStack.push(innerCtx)
          return jb.unique([...ctxStack.slice(1).map(ctx=> ({ctx, path: ctx.callerPath})),
            ...ctxStack.filter(ctx => ctx.vars.cmp).map(ctx=>({ctx, path: ctx.vars.cmp.ctx.path}))])
      },
      controls: button({
        title: studio.compName('%path%'),
        action: runActions(call('onSelect'),dialog.closeDialogById('show-stack')),
        style: button.href(),
        features: feature.hoverTitle('%path%')
      }),
      features: css.padding({left: '4', right: '4'})
    }),
  })
})

