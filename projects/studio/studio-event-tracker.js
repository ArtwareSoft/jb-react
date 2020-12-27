jb.ns('chromeDebugger,eventTracker')

Object.assign(jb.ui, {
  getInspectedJb: ctx => {
    const st = jb.studio
    return st.inspectedJb || st.previewjb
  },
  getReachableJbs: (frame, direction) => {
    const up = frame.parent && direction != 'down' && frame.parent != frame && frame.parent.jb && jb.ui.getReachableJbs(frame.parent,'up') || []
    const down = frame.frames && direction != 'up' && Array.from(frame.frames).flatMap(fr=>jb.ui.getReachableJbs(fr,'down')) || []
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

jb.component('eventTracker.refresh', {
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
        features: feature.hoverTitle('clear')
      }),
      button({
        title: 'refresh',
        action: refreshControlById('event-tracker'),
        style: chromeDebugger.icon('165px 264px'),
        features: [feature.hoverTitle('refresh'), feature.if(eventTracker.refreshBlocked())]
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
        features: [
          chromeDebugger.colors(),
          picklist.onChange(refreshControlById('event-tracker'))
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
      eventTracker.eventTypes()
    ],
    features: [
      chromeDebugger.colors(),
      eventTracker.watchSpy(100)
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
          eventTracker.expandableComp(),
          controlWithCondition('%$cmpExpanded/{%index%}%', group({ 
            controls: eventTracker.compInspector('%cmp%'), 
            features: feature.expandToEndOfRow('%$cmpExpanded/{%index%}%')
          })),
          controlWithCondition(and('%m/d%','%m/t%==1'), group({
            controls: [
              editableBoolean({databind: '%$payloadExpanded/{%index%}%', style: chromeDebugger.toggleStyle()}),
              text('%$contentType% %$direction% %m/cbId% (%$payload/length%) %m/$%: %m/t%'),
            ],
            layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'}),
            features: [
              variable('direction', If(contains({allText: '%logNames%', text: 'received'}),'🡸','🡺')),
              variable('contentType', If('%m/d/data/css%','css', If('%m/d/data/delta%','delta','%m/d/data/$%'))),
              variable('payload', prettyPrint('%m/d%'))
            ]
          })),
          controlWithCondition('%$payloadExpanded/{%index%}%', group({ 
            controls: text({
              text: prettyPrint('%m/d%'),
              style: text.codemirror({height: '200'}),
              features: [codemirror.fold(), css('min-width: 1200px; font-size: 130%')]
            }), 
            features: feature.expandToEndOfRow('%$payloadExpanded/{%index%}%')
          })),

          text({ text: '%logNames%', features: feature.byCondition(
            inGroup(list('exception','error'), '%logNames%'),
            css.color('var(--jb-error-fg)')
          )}),
          studio.lowFootprintObj('%err%','err'),
          studio.objExpandedAsText('%stack%','stack'),

          controlWithCondition('%m%',text('%m/$%: %m/t%, %m/cbId%')),
//          studio.objExpandedAsText('%m/d%','payload'),
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
          eventTracker.watchSpy(1000),
          table.expandToEndOfRow(),
          watchRef({ref: '%$cmpExpanded%', includeChildren: 'yes' , allowSelfRefresh: true }),
          watchRef({ref: '%$payloadExpanded%', includeChildren: 'yes' , allowSelfRefresh: true })
        ]
      })
    ],
    features: [
      variable('$disableLog',true),
      id('event-tracker'),
      variable({name: 'cmpExpanded', watchable: true, value: obj() }),
      variable({name: 'payloadExpanded', watchable: true, value: obj() }),
    ]
  })
})

jb.component('eventTracker.refreshBlocked',{
  type: 'boolean',
  impl: ctx => jb.ui.getInspectedJb() == ctx.frame().jb || 
    (jb.studio.studiojb && jb.studio.studiojb.exec('%$studio/project%') == 'studio-helper')
})

jb.component('eventTracker.watchSpy',{
  type: 'feature',
  params: [
    { id: 'delay', defaultValue: 100}
  ],
  impl: If(not(eventTracker.refreshBlocked()),
    followUp.watchObservable(
      source.callbag(ctx => jb.ui.getSpy(ctx).observable()),
      '%$delay%'
  ))
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

jb.component('eventTracker.expandableComp', {
  type: 'control',
  impl: group({
    controls: [
      controlWithCondition('%cmp/ctx/profile/$%', group({
        controls: [
          editableBoolean({databind: '%$cmpExpanded/{%index%}%', style: chromeDebugger.toggleStyle()}),
          text('%cmp/ctx/profile/$% %cmp/cmpId%;%cmp/ver%'),
        ],
        layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'})
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
        style: group.sectionExpandCollapse(text('%$title%')),
        controls: text({
          text: '%$asText%',
          style: text.codemirror({height: '200'}),
          features: codemirror.fold()
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
    const ret = spy.search(query).filter(x=> !(jb.path(x,'cmp.ctx.path') || '').match(/eventTracker/))
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
          style: group.sectionExpandCollapse(studio.singleSourceCtxView('%$srcCtx%')),
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

jb.component('eventTracker.compInspector', {
  params: [
    {id: 'cmp'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: chromeDebugger.sectionsExpandCollapse(),
      controls: [
        text('%$cmp/cmpId%;%$cmp/ver% -- %$cmp/ctx/path%', '%$cmp/ctx/profile/$%'),
        itemlist({
            title: 'state',
            items: unique({items: list(keys('%$cmp/state%'),keys('%$elem/_component/state%'))}),
            controls: [
             text('%%', ''),
             text('%$elem/_component/state/{%%}%', 'front end'),
             text('%$cmp/state/{%%}%', 'back end'),
            ],
            style: table.plain(),
        }),
        editableText({
            title: 'source',
            databind: studio.profileAsText('%$cmp/ctx/path%'),
            style: editableText.codemirror({height: '100'}),
            features: codemirror.fold()            
        }),
        itemlist({
          title: 'methods',
          items: '%$cmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
        }),
        tableTree({
            title: 'rendering props',
            treeModel: tree.jsonReadOnly('%$cmp/renderProps%'),
            leafFields: text('%val%', 'value'),
            chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        //tree('raw', tree.jsonReadOnly('%$cmp%'))
      ]
    }),
    features: [
      variable('elem', eventTracker.elemOfCmp('%$cmp%')),
    ]
  })
})

jb.component('chromeDebugger.icon', {
  type: 'button.style',
  params: [
      {id: 'position', as: 'string', defaultValue: '0px 144px'}
  ],
  impl: customStyle({
    template: (cmp,{title},h) => h('div',{onclick: true, title}),
    css: `{ -webkit-mask-image: url(largeIcons.svg); -webkit-mask-position: %$position%; width: 28px;  height: 24px; background-color: var(--jb-menu-fg); opacity: 0.7}
      ~:hover { opacity: 1}`,
  })
})

jb.component('chromeDebugger.sectionsExpandCollapse', {
  type: 'group.style',
  impl: group.sectionsExpandCollapse({
      autoExpand: true,
      titleStyle: text.span(),
      toggleStyle: editableBoolean.expandCollapseWithUnicodeChars(),
      titleGroupStyle: styleWithFeatures(group.div(), features(
        css.class('expandable-view-title'),
        css('~ i { margin-top: 5px }'),
        css('text-transform: capitalize')
      )),
      innerGroupStyle: styleWithFeatures(group.div(), features(
        css.margin({bottom: 5}),
      ))
  })
})

jb.component('chromeDebugger.toggleStyle', {
  type: 'editable-boolean.style',
  impl: editableBoolean.expandCollapseWithUnicodeChars()
})
