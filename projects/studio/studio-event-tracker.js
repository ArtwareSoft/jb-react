jb.ns('chromeDebugger,editableBoolean')

Object.assign(jb.ui, {
  getInspectedJb: ctx => {
    const st = jb.studio
    return st.inspectedJb || st.previewjb
  },
  getSpy: ctx => {
    const ret = jb.ui.getInspectedJb(ctx).spy
    if (!ret) debugger
    return ret || {}
  }
})

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
            features: [css.padding({top: '5', left: '5'})]
          }),
          divider({style: divider.vertical()}),
          button({
            title: 'clear',
            action: runActions(studio.clearSpyLog(), refreshControlById('event-tracker')),
            style: chromeDebugger.icon(),
            features: [css.color('var(--jb-menu-fg)'), feature.hoverTitle('clear')]
          }),
          editableBoolean({
            databind: ctx => ({
              $jb_val(val) {
                  if (val === undefined)
                      return jb.studio.inspectedJb != null
                  else {
                      jb.studio.inspectedJb = val ? (jb.studio.studiojb || jb) : jb.studio.previewjb
                      ctx.run(refreshControlById('event-tracker'))
                  }
              }
            }),
            style: editableBoolean.checkboxWithLabel(),
            title: 'studio',
            features: [layout.horizontal(), css.margin('3')]
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
            options: picklist.options({
              options: ctx => jb.entries(jb.ui.getSpy(ctx).counters),
              code: '%0%',
              text: '%0% (%1%)'
            }),
            features: [
              picklist.onChange(
                ctx => {
                const loc = jb.ui.getSpy(ctx).locations[ctx.data].split(':')
                const col = +loc.pop()
                const line = (+loc.pop())-1
                const location = [loc.join(':'),line,col]
                jb.log('eventTracker openResource',{ctx,loc: jb.ui.getSpy(ctx).locations[ctx.data], location})
                loc && parent.postMessage({ runProfile: {$: 'chromeDebugger.openResource', location }})
              }
              )
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
          studio.eventSourceScriptLink(),
          studio.eventView()
        ],
        style: table.plain(true),
        visualSizeLimit: '30',
        features: [
          id('event-logs'),
          itemlist.infiniteScroll('5'),
          css.height({height: '400', overflow: 'scroll'}),
          itemlist.selection({
            onSelection: runActions(({data}) => jb.frame.console.log(data), studio.highlightEvent('%%'))
          }),
          itemlist.keyboardSelection({}),
          feature.byCondition(
            inGroup(list('exception,error'), '%logNames%'),
            css.color('var(--jb-error-fg)')
          )
        ]
      })
    ],
    features: [
      id('event-tracker'),
      variable({
        name: 'events',
        value: studio.eventItems('%$studio/eventTrackerQuery%', '%$studio/eventTrackerPattern%')
      }),
      If(
        ctx => jb.ui.getInspectedJb() != ctx.frame().jb && 
          (!jb.studio.studiojb || jb.studio.studiojb.exec('%$studio/project%') != 'studio-helper'),
        followUp.watchObservable(
          source.callbag(ctx => jb.ui.getSpy(ctx).observable()),
          1000
        )
      )
    ]
  })
})

jb.component('studio.eventSourceScriptLink', {
  type: 'control',
  params: [
    {id: 'event', defaultValue: '%%'}
  ],
  impl: controlWithCondition('%$event/scriptPath%',
        button({
          title: '%logNames%',
          action: studio.gotoEventSource('%$event/scriptPath%'),
          style: button.hrefText()
        })
    ),
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
      studio.showLowFootprintObj('%focusChanged%','focusChanged'),

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
        studio.slicedString('%$obj/ctx/profile/$%%$obj/pt% - %$obj/cmpId%;%$obj/ver%')
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
        isOfType('boolean', '%$obj%'),
        studio.slicedString('%$title%')
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
        text(({},{},{obj}) => obj.name) // can not use '%$obj/name%'
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
    const spy = jb.ui.getSpy(ctx)
    if (!spy) return []
    const ret = spy.search(query).filter(x=> !(jb.path(x.ctx,'path') || '').match(/studio.eventTracker/))
    const regexp = new RegExp(pattern)
    const items = pattern ? ret.filter(x=>regexp.test(Array.from(x.values()).filter(x=> typeof x == 'string').join(','))) : ret
    jb.log('eventTracker items',{ctx,spy,query,items})
    return items
  }
})

jb.component('studio.gotoEventSource', {
  type: 'action',
  params: [
    {id: 'event'}
  ],
  impl: If('%$event/path%',studio.gotoSource('%$event/path%',true))
})

jb.component('studio.elemOfCmp', {
  params: [
    {id: 'cmp' }
  ],
  impl: studio.elemInInspectedJb('[cmp-id="%$cmp/cmpId%"]')
})

jb.component('studio.elemInInspectedJb', {
  params: [
    {id: 'selector' }
  ],
  impl: (ctx,selector) => {
    const elem = selector != '#' && jb.ui.find(jb.ui.getInspectedJb(ctx).frame.document,selector)[0]
    jb.log('eventTracker elemInInspectedJb',{ctx,selector,elem})
    return elem
  }
})

jb.component('studio.highlightEvent', {
  type: 'action',
  params: [
    {id: 'event', defaultValue: '%%'}
  ],
  impl: runActions(
    Var('elem', firstSucceeding(studio.elemOfCmp('%$event/cmp%'), studio.elemInInspectedJb('#%$event/dialogId%'))),
    If('%$elem%', studio.highlightElem('%$elem%')),
    If('%$event/elem%',studio.highlightElem('%$event/elem%')),
    If('%$event/parentElem%',studio.highlightElem('%$event/parentElem%'))
  )
})

jb.component('studio.highlightElem', {
  type: 'action',
  params: [
    {id: 'elem'},
    {id: 'css', as: 'string', defaultValue: 'border: 1px dashed grey'}
  ],
  impl: runActions(
    Var('previewOverlay',true),
    log('eventTracker highlightElem'),
    openDialog({
        id: 'highlight-dialog',
        style: studio.highlightDialogStyle(),
        content: text(''),
        features: [
          css(({},{},{elem}) => {
                const elemRect = elem.getBoundingClientRect()
                const left = jb.ui.studioFixXPos(elem) + elemRect.left + 'px'
                const top = jb.ui.studioFixYPos(elem) + elemRect.top + 'px'
                const width = Math.max(10,elemRect.width), height = Math.max(10,elemRect.height)
                return `left: ${left}; top: ${top}; width: ${width}px; height: ${height}px;`
          }),
          css('%$css%')
        ]
    }),
    delay(500),
    dialog.closeDialogById('highlight-dialog')
  )
})

jb.component('studio.highlightDialogStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div#jb-dialog jb-popup',{},h(contentComp)),
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

