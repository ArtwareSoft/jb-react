jb.ns('chromeDebugger,editableBoolean,eventTracker')

Object.assign(jb.ui, {
  getInspectedJb: ctx => {
    const st = jb.studio
    return st.inspectedJb || st.previewjb
  },
  getReachableJbs: (frame, direction) => {
    const up = direction != 'down' && frame.parent != frame && frame.parent.jb && jb.ui.getReachableJbs(frame.parent,'up') || []
    const down = direction != 'up' && Array.from(frame.frames).flatMap(fr=>jb.ui.getReachableJbs(fr,'down')) || []
    return [frame.jb, ...up, ...down].filter(x=>x)
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

jb.component('eventTracker.getSpy', {
  impl: ctx => jb.ui.getSpy(ctx)
})

jb.component('eventTracker.clearSpyLog', {
  type: 'action',
  impl: ctx => {
    const items = ctx.run(eventTracker.eventItems())
    const lastGroupIndex = items.length - items.reverse().findIndex(x=>x.index == '---')
    if (lastGroupIndex >= items.length)
      jb.ui.getSpy(ctx).clear()
    else
      jb.ui.getSpy(ctx).logs.splice(0,lastGroupIndex-1)
  }
})

jb.component('studio.refreshSpy', {
  type: 'action',
  params: [
    {id: 'clear', as: 'boolean'}
  ],
  impl: refreshControlById('event-tracker')
})

jb.component('studio.eventTrackerToolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('2'),
    controls: [
      text({
        text: pipeline(eventTracker.getSpy(), '%$events/length%/%logs/length%'),
        title: 'counts',
        features: [
          variable('events', eventTracker.eventItems('%$studio/eventTrackerQuery%')),
          css.padding({top: '5', left: '5'})
        ]
      }),
      divider({style: divider.vertical()}),
      button({
        title: 'clear',
        action: runActions(eventTracker.clearSpyLog(), refreshControlById('event-tracker')),
        style: chromeDebugger.icon(),
        features: [css.color('var(--jb-menu-fg)'), feature.hoverTitle('clear')]
      }),
      picklist({
        title: 'frame',
        databind: ctx => ({
            $jb_val: val => {
              jb.studio.inspectedJb = jb.studio.inspectedJb || jb.ui.getInspectedJb()
              if (val === undefined)
                  return jb.path(jb.studio.inspectedJb,'frame.jbUri')
              jb.studio.inspectedJb = jb.ui.getReachableJbs(ctx.frame()).filter(x=>x.frame.jbUri == val)[0]
            }
        }),           
        options: picklist.options({
          options: ctx => jb.ui.getReachableJbs(ctx.frame()),
          code: '%frame/jbUri%',
          text: '%frame/jbUri% (%spy/logs/length%)',
        }),
        features: chromeDebugger.colors(),
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
      eventTracker.eventTypes()
    ],
    features: [
      chromeDebugger.colors(),
      followUp.watchObservable(
        source.callbag(ctx => jb.ui.getSpy(ctx).observable()),
        100
      ),
    ]
  }),
})

jb.component('studio.eventTracker', {
  type: 'control',
  impl: group({
    controls: [
      studio.eventTrackerToolbar(),
      itemlist({
        items: eventTracker.eventItems('%$studio/eventTrackerQuery%'),
        controls: [
          text('%index%'),
          eventTracker.ptNameOfUiComp(),
          text({ text: '%logNames%', features: feature.byCondition(
            inGroup(list('exception','error'), '%logNames%'),
            css.color('var(--jb-error-fg)')
          )}),
          studio.lowFootprintObj('%err%','err'),
          studio.objExpandedAsText('%stack%','stack'),

          controlWithCondition('%m%',text('%m/$%: %m/t%, %m/cbId%')),
          studio.objExpandedAsText('%m/d%','payload'),
          studio.lowFootprintObj('%delta%','delta'),
          studio.lowFootprintObj('%vdom%','vdom'),
          studio.lowFootprintObj('%ref%','ref'),
          studio.lowFootprintObj('%value%','value'),
          studio.lowFootprintObj('%val%','val'),
          studio.lowFootprintObj('%focusChanged%','focusChanged'),
          studio.sourceCtxView('%srcCtx%'),
          studio.sourceCtxView('%cmp/ctx%'),
          studio.sourceCtxView('%ctx%'),
        ],
        style: table.plain(true),
        visualSizeLimit: 30,
        features: [
          itemlist.infiniteScroll(5),
          itemlist.selection({
            onSelection: runActions(({data}) => jb.frame.console.log(data), eventTracker.highlightEvent('%%'))
          }),
          itemlist.keyboardSelection({}),
        ]
      })
    ],
    features: [
      id('event-tracker'),
      If(
        ctx => jb.ui.getInspectedJb() != ctx.frame().jb
           && (!jb.studio.studiojb || jb.studio.studiojb.exec('%$studio/project%') != 'studio-helper'),
        followUp.watchObservable(
          source.callbag(ctx => jb.ui.getSpy(ctx).observable()),
          1000
        )
      )
    ]
  })
})

jb.component('eventTracker.eventTypes', {
  type: 'control',
  impl: picklist({
    databind: '%$studio/spyLogs%',
    options: picklist.options({
      options: ctx => jb.entries(jb.ui.getSpy(ctx).counters),
      code: '%0%',
      text: '%0% (%1%)'
    }),
    features: [
      chromeDebugger.colors(),
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
})

jb.component('eventTracker.ptNameOfUiComp', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition('%cmp/ctx/profile/$%', group({
        style: group.sectionExpandCollopase(text('%cmp/ctx/profile/$% %cmp/cmpId%;%cmp/ver%')),
        controls: editableText({
          databind: studio.profileAsText('%cmp/ctx/path%'),
          style: editableText.codemirror({height: '60'}),
        })
      })),
      controlWithCondition('%cmp/pt%',text('%cmp/pt% %cmp/cmpId%;%cmp/ver%')),
      controlWithCondition('%$cmpElem%',text('%$cmpElem/@cmp-pt% %$cmpElem/@cmp-id%;%$cmpElem/@cmp-ver%')),
    ],
    features: [
      group.firstSucceeding(),
      variable('cmpElem', ({data}) => jb.ui.closestCmpElem(data.elem || data.parentElem))
    ]
  })
})

jb.component('studio.objExpandedAsText', {
  params: [
    {id: 'obj', mandatory: true },
    {id: 'title', as: 'string', mandatory: true},
  ],
  impl: controlWithCondition('%$obj%',group({
    controls: [
      controlWithCondition('%$asText/length% < 20', text('%$asText%')),
      controlWithCondition('%$asText/length% > 19', group({
        style: group.sectionExpandCollopase(text('%$title%')),
        controls: text({
          text: '%$asText%',
          style: text.codemirror({height: '200'}),
        }),    
      }))
    ],
    features: variable('asText',prettyPrint('%$obj%'))
  }))
})


jb.component('studio.lowFootprintObj', {
  type: 'control',
  params: [
    {id: 'obj', mandatory: true },
    {id: 'title', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 20 },
  ],
  impl: controlWithCondition('%$obj%', group({
    layout: layout.horizontal(4),
    controls: [
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
        isOfType('string,number', '%$obj%'),
        studio.slicedString('%$title%: %$obj%')
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
        text(({},{},{length,data}) => data.replace(/\n/g,'').slice(0,length))
    )
})

jb.component('eventTracker.eventItems', {
  params: [
    {id: 'query', as: 'string' },
    {id: 'pattern', as: 'string' },
  ],
  impl: (ctx,query,pattern) => {
    const spy = jb.ui.getSpy(ctx)
    if (!spy) return []
    const ret = spy.search(query).filter(x=> !(jb.path(x.ctx,'path') || '').match(/eventTracker/))
    const regexp = new RegExp(pattern)
    const items = pattern ? ret.filter(x=>regexp.test(Array.from(x.values()).filter(x=> typeof x == 'string').join(','))) : ret
    jb.log('eventTracker items',{ctx,spy,query,items})
    const itemsWithTimeBreak = items.reduce((acc,item,i) => i && item.time - items[i-1].time > 100 ? 
      [...acc,{index: '---', logNames: `----- ${item.time - items[i-1].time} mSec gap ------`},item] : 
      [...acc,item] ,[])
    return itemsWithTimeBreak
  }
})

jb.component('eventTracker.elemOfCmp', {
  params: [
    {id: 'cmp' }
  ],
  impl: eventTracker.elemInInspectedJb('[cmp-id="%$cmp/cmpId%"]')
})

jb.component('eventTracker.elemInInspectedJb', {
  params: [
    {id: 'selector' }
  ],
  impl: (ctx,selector) => {
    const elem = selector != '#' && jb.ui.find(jb.ui.getInspectedJb(ctx).frame.document,selector)[0]
    jb.log('eventTracker elemInInspectedJb',{ctx,selector,elem})
    return elem
  }
})

jb.component('eventTracker.highlightEvent', {
  type: 'action',
  params: [
    {id: 'event', defaultValue: '%%'}
  ],
  impl: runActions(
    Var('elem', firstSucceeding(eventTracker.elemOfCmp('%$event/cmp%'), eventTracker.elemInInspectedJb('#%$event/dialogId%'))),
    If('%$elem%', eventTracker.highlightElem('%$elem%')),
    If('%$event/elem%',eventTracker.highlightElem('%$event/elem%')),
    If('%$event/parentElem%',eventTracker.highlightElem('%$event/parentElem%'))
  )
})

jb.component('eventTracker.highlightElem', {
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
        style: eventTracker.highlightDialogStyle(),
        content: text(''),
        features: [
          css(({},{},{elem}) => {
            if (!elem || !elem.getBoundingClientRect) return ''
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

jb.component('eventTracker.highlightDialogStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ display: block; position: absolute; background: transparent}',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
  })
})

jb.component('studio.sourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'},
  ],
  impl: controlWithCondition('%$srcCtx/_parent%', group({
    controls: [
      controlWithCondition('%$stackItems/length% == 0',studio.singleSourceCtxView('%$srcCtx%')),
      controlWithCondition('%$stackItems/length% > 0', group({
          style: group.sectionExpandCollopase(studio.singleSourceCtxView('%$srcCtx%')),
          controls: itemlist({items: '%$stackItems%', controls: studio.singleSourceCtxView('%%')}),
      }))
    ],
    features: variable('stackItems', studio.stackItems('%$srcCtx%'))
  }))
})

jb.component('studio.singleSourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'},
  ],
  impl: button({
          title: ({},{},{srcCtx}) => {
            if (!srcCtx) return ''
            const path = srcCtx.path || ''
            const profile = path && jb.studio.valOfPath(path)
            const pt = profile && profile.$ || ''
            const ret = `${path.split('~')[0]}:${pt}`
            return ret.replace(/feature\./g,'').replace(/front.nd\./g,'').replace(/\.action/g,'')
          },
          action: eventTracker.highlightEvent('%%'),
          style: button.hrefText(),
          features: [
            feature.hoverTitle('%$srcCtx/path%'),
            ctrlAction(studio.gotoSource('%$srcCtx/path%', true))
          ]
    }),
})

jb.component('studio.stackItems', {
  params: [
    {id: 'srcCtx' },
  ],
  impl: (ctx,srcCtx) => {
          const stack=[];
          for(let innerCtx= srcCtx; innerCtx; innerCtx = innerCtx.cmpCtx)
            stack.push(innerCtx)
          return stack.slice(2)
      },
})

jb.component('chromeDebugger.colors',{
  type: 'feature',
  impl: features(
    css.color({background: 'var(--jb-menubar-inactive-bg)', color: 'var(--jb-menu-fg)'}),
    css('border: 0px;'),
    css('~ option { background: white}')
  )
})