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
          picklist({
            title: 'counters',
            databind: '%$studio/spyLogs%',
            options: picklist.options({ options: ctx => jb.entries(jb.ui.getSpy(ctx).counters), code: '%0%', text: '%0% (%1%)'}),
            features: [
              picklist.onChange(ctx=> {
                const loc = jb.ui.getSpy(ctx).locations[ctx.data].split(':')
                const col = +loc.pop()
                const line = (+loc.pop())-1
                const location = [loc.join(':'),line,col]
                loc && parent.postMessage({ runProfile: {$: 'chromeDebugger.openResource', location }} , '*')
              })
            ]
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
          itemlist.selection({onSelection: runActions(
            ({data}) => jb.frame.console.log(data),
            studio.highlightLogItem('%%')
          )}),
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
  }
})

jb.component('studio.highlightEvent', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: studio.highlightByPath('%$path%')
})

jb.component('studio.elemOfCmp', {
  params: [
    {id: 'cmp' }
  ],
  impl: (ctx,cmp) => cmp.base || jb.ui.find(self.parent.document,`[cmp-id="${cmp.cmpId}"]`)[0]
})

jb.component('studio.highlightLogItem', {
  type: 'action',
  params: [
    {id: 'item', defaultValue: '%%'}
  ],
  impl: runActions(
    If('%$item/cmp%', studio.openElemMarker(studio.elemOfCmp('%$item/cmp%'),'border: 1px solid green')),
    If('%$item/elem%',studio.openElemMarker('%$item/elem%','border: 1px solid blue'))
  )
})

jb.component('studio.openElemMarker', {
  type: 'action',
  params: [
    {id: 'elem'},
    {id: 'css', as: 'string'}
  ],
  impl: If('%$elem%', openDialog({
      studioOverlay: true,
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
        css('%$css%')
        //css((ctx,{},{css}) => css)
      ]
    }))
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

