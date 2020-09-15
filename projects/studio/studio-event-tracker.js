jb.ns('chromeDebugger')

jb.ui.getSpy = ctx => {
  const st = jb.studio
  const spy = (st.studiojb && st.studiojb.exec('%$studio/project%') == 'studio-helper') ? st.studiojb.spy : jb.path(st,'previewjb.spy')
  if (!spy)
    jb.logError('studio.eventItems - can not locate spy',{ctx})
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
        title: 'toolbar',
        layout: layout.horizontal('2'),
        controls: [
          text({
            text: pipeline(studio.getSpy(), '%$events/length%/%logs/length%'),
            title: 'counts',
            features: [
              css.padding({top: '5', left: '5'}),
            ]
          }),
          divider({style: divider.vertical()}),
          button({
            title: 'block',
            action: runActions(studio.clearSpyLog(), refreshControlById('event-tracker')),
            style: chromeDebugger.icon(),
            features: [
              feature.icon({
                icon: 'BlockHelper',
                type: 'mdi',
                size: '12',
                features: css.transformRotate('-90')
              }),
              css.color('var(--jb-menu-fg)'),
              feature.hoverTitle('clear console')
            ]
          }),
          divider({style: divider.vertical()}),
          editableText({
            title: 'query',
            databind: '%$studio/eventTrackerQuery%',
            style: editableText.input(),
            features: [
              htmlAttribute('placeholder', 'query'),
              feature.onEnter(refreshControlById('event-tracker')),
              css.class('toolbar-input'),
              css.height('10'),
              css.margin('4'),
              css.width('300')
            ]
          }),
          multiSelect({
            title: 'counters',
            databind: '%$studio/spyLogs%',
            options: picklist.options(ctx => jb.entries(jb.ui.getSpy(ctx).counters).map(([id,val]) => `${id} (${val})`) ),
            features: css.margin('15'),
          })
        ],
        features: css.color({background: 'var(--jb-menubar-inactive-bg)'})
      }),
      itemlist({
        items: '%$events%',
        controls: [
          text('%index%'),
          text('%logNames%'),
          studio.eventView()
        ],
        style: table.plain(true),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'}),
          itemlist.selection({onSelection: ({data}) => jb.frame.console.log(data)}),
          itemlist.keyboardSelection({}),
          feature.byCondition('%logNames% == error', css.color('var(--jb-error-fg)'))
        ]
      })
    ],
    features: [
      id('event-tracker'),
      variable({
        name: 'events',
        value: studio.eventItems('%$studio/eventTrackerQuery%', '%$studio/eventTrackerPattern%')
      }),
      followUp.watchObservable(source.callbag(ctx => jb.ui.getSpy(ctx).observable()), 1000)
    ]
  })
})

jb.component('studio.eventView', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('4'),
    controls: [
      studio.showLowFootprintObj('%cmp%','cmp'),
      studio.showLowFootprintObj('%ctx%','ctx'),
      studio.showLowFootprintObj('%delta%','delta'),
      studio.showLowFootprintObj('%vdom%','vdom'),
      studio.showLowFootprintObj('%err%','err'),
      studio.showLowFootprintObj('%ref%','ref'),
      studio.showLowFootprintObj('%value%','value'),

      // controlWithCondition(
      //   '%opPath%',
      //   button({
      //     title: last('%opPath%'),
      //     style: button.href(),
      //     features: feature.hoverTitle(join({separator: '/', items: '%opPath%'}))
      //   })
      // ),
      // controlWithCondition(({data}) => data.opValue != null, text('<- %opValue%')),
      // controlWithCondition(
      //   '%path%',
      //   button({
      //     title: '%compName%',
      //     action: studio.showStack('%ctx%'),
      //     style: button.href(),
      //     features: [
      //       feature.hoverTitle('%path%'),
      //       feature.onHover({action: studio.highlightByPath('%path%')}),
      //       ctrlAction(studio.openComponentInJbEditor('%path%'))
      //     ]
      //   })
      // ),
      // controlWithCondition(
      //   '%srcCompName%',
      //   group({
      //     layout: layout.horizontal(),
      //     controls: [
      //       text('activated by:'),
      //       button({
      //         title: '%srcCompName%',
      //         action: studio.showStack('%srcCtx%'),
      //         style: button.href(),
      //         features: [
      //           feature.hoverTitle('%srcPath%'),
      //           feature.onHover({action: studio.highlightByPath('%srcPath%')})
      //         ]
      //       })
      //     ]
      //   })
      // ),
      // studio.showLowFootprintObj('%ctx/data%','data'),
      // studio.showLowFootprintObj('%ctx/vars%','vars'),
      // studio.showLowFootprintObj('%data%','data'),
      // studio.showLowFootprintObj('%jbComp%','jbComp'),
      // studio.showLowFootprintObj('%delta%','delta'),
      // studio.showLowFootprintObj('%vdom%','vdom'),
      // studio.slicedString('%description%'),
      // studio.slicedString('%error/message%'),
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
    layout: layout.horizontal(4),
    controls: [
      controlWithCondition(
        '%$obj/cmpId%',
        studio.slicedString('%$obj/ctx/profile/$% - %$obj/cmpId%;%$obj/ver%')
      ),
      controlWithCondition(
        '%$obj/_parent%',
        studio.slicedString('%$obj/profile/$%: %$obj/path%')
      ),
      controlWithCondition(
        ({},{},{obj}) => jb.isRef(obj),
        studio.slicedString(({},{},{obj}) => obj.handler.pathOfRef(obj).join('/'))
      ),      
      controlWithCondition(
        '%$obj/opEvent/newVal%',
        studio.slicedString('%$obj/opEvent/newVal%')
      ),      
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
    const spy = jb.ui.getSpy(ctx)
    if (!spy) return []
    const ret = spy.search(query); //.map(x=>enrich(x)).filter(x=>!(x.path || '').match(/studio.eventTracker/))
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

