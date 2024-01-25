component('studio.eventTracker', {
  params: [
    {id: 'spy', dynamic: true, defaultValue: () => jb.path(jb.parent,'spy')}
  ],
  type: 'control',
  impl: group({
    controls: group({
      controls: [
        eventTracker.toolbar('%$spy()%'),
        table({
          items: eventTracker.eventItems('%$spy()%', '%$eventTracker/eventTrackerQuery%'),
          controls: [
            text('%index%'),
            eventTracker.uiComp(),
            eventTracker.callbagMessage(),
            eventTracker.testResult(),
            text('%logNames%', {
              features: feature.byCondition({
              condition: inGroup(list('exception','error'), { item: '%logNames%' }),
              then: css.color('var(--jb-error-fg)')
            })
            }),
            studio.lowFootprintObj('%err%', 'err'),
            studio.objExpandedAsText('%stack%', 'stack'),
            controlWithCondition('%m%', text('%m/$%: %m/t%, %m/cbId%')),
            studio.lowFootprintObj('%delta%', 'delta'),
            studio.lowFootprintObj('%vdom%', 'vdom'),
            studio.lowFootprintObj('%ref%', 'ref'),
            studio.lowFootprintObj('%value%', 'value'),
            studio.lowFootprintObj('%val%', 'val'),
            studio.lowFootprintObj('%focusChanged%', 'focusChanged'),
            studio.sourceCtxView('%srcCtx%'),
            studio.sourceCtxView('%cmp/ctx%'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true),
          visualSizeLimit: 80,
          features: [
            watchable('cmpExpanded', obj()),
            watchable('payloadExpanded', obj()),
            watchable('testResultExpanded', obj()),
            itemlist.infiniteScroll(5),
            itemlist.selection({
              onSelection: runActions(({data}) => { jb.frame.console.log(data) }, eventTracker.highlightEvent('%%'))
            }),
            itemlist.keyboardSelection(),
            eventTracker.watchSpy('%$spy()%', 500)
          ],
          lineFeatures: [
            watchRef('%$cmpExpanded/{%$index%}%', { allowSelfRefresh: true }),
            watchRef('%$payloadExpanded/{%$index%}%', { allowSelfRefresh: true }),
            watchRef('%$testResultExpanded/{%$index%}%', { allowSelfRefresh: true }),
            table.enableExpandToEndOfRow()
          ]
        })
      ],
      features: id('event-tracker')
    }),
    features: [
      variable('$disableLog', true),
      watchable('eventTracker', obj())
    ]
  })
})

component('eventTracker.toolbar', {
  params: [
    {id: 'spy'}
  ],
  type: 'control',
  impl: group({
    layout: layout.horizontal('2'),
    controls: [
      text(eventTracker.codeSize(), {
        features: [
        feature.hoverTitle('code size'),
        css('cursor: default'),
        css.padding('5')
      ]
      }),
      divider(divider.vertical()),
      text('%$events/length%/%$spy/logs/length%', 'counts', {
        features: [
        variable('events', eventTracker.eventItems('%$spy%', '%$eventTracker/eventTrackerQuery%')),
        feature.hoverTitle('filtered events / total'),
        css('cursor: default'),
        css.padding('5', '5')
      ]
      }),
      divider(divider.vertical()),
      button('clear', runActions(eventTracker.clearSpyLog('%$spy%'), refreshControlById('event-tracker')), {
        style: chromeDebugger.icon(),
        features: feature.hoverTitle('clear')
      }),
      button('refresh', refreshControlById('event-tracker'), {
        style: chromeDebugger.icon('165px 264px'),
        features: feature.hoverTitle('refresh')
      }),
      divider(divider.vertical()),
      editableText('query', '%$eventTracker/eventTrackerQuery%', {
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
      eventTracker.eventTypes('%$spy%')
    ],
    features: [
      chromeDebugger.colors(),
      eventTracker.watchSpy('%$spy%', 100)
    ]
  })
})

component('eventTracker.uiComp', {
  type: 'control',
  impl: controls(
    controlWithCondition({
      condition: or('%cmp%','%elem%','%parentElem%'),
      control: group({
        controls: [
          controlWithCondition('%cmp/ctx/profile/$%', group({
            layout: layout.flex('row', 'start', { alignItems: 'center' }),
            controls: [
              editableBoolean('%$cmpExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
              text('%cmp/ctx/profile/$% %cmp/cmpId%;%cmp/ver%')
            ]
          })),
          controlWithCondition('%cmp/pt%', text('%cmp/pt% %cmp/cmpId%;%cmp/ver%')),
          controlWithCondition('%$cmpElem%', text('%$cmpElem/@cmp-pt% %$cmpElem/@cmp-id%;%$cmpElem/@cmp-ver%'))
        ],
        features: [
          group.firstSucceeding(),
          variable('cmpElem', ({data}) => jb.ui.closestCmpElem(data.elem || data.parentElem))
        ]
      })
    }),
    controlWithCondition('%$cmpExpanded/{%$index%}%', group({
      controls: eventTracker.compInspector('%cmp%'),
      features: feature.expandToEndOfRow('%$cmpExpanded/{%$index%}%')
    }))
  )
})

component('eventTracker.callbagMessage', {
  type: 'control',
  impl: controls(
    controlWithCondition({
      condition: and('%m/d%','%m/t%==1'),
      control: group({
        layout: layout.flex('row', 'start', { alignItems: 'center' }),
        controls: [
          editableBoolean('%$payloadExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
          text('%$contentType% %$direction% %m/cbId% (%$payload/length%) %m/$%: %m/t%')
        ],
        features: [
          variable('direction', If(contains('received', { allText: '%logNames%' }), '🡸', '🡺')),
          variable('contentType', If('%m/d/data/css%', 'css', If('%m/d/data/delta%', 'delta', '%m/d/data/$%'))),
          variable('payload', prettyPrint('%m/d%'))
        ]
      })
    }),
    controlWithCondition('%$payloadExpanded/{%$index%}%', group({
      controls: text(prettyPrint('%m/d%'), {
        style: text.codemirror({ height: '200' }),
        features: [
        codemirror.fold(),
        css('min-width: 1200px; font-size: 130%')
      ]
      }),
      features: feature.expandToEndOfRow('%$payloadExpanded/{%$index%}%')
    }))
  )
})

component('eventTracker.testResult', {
  type: 'control',
  impl: controls(
    controlWithCondition('%logNames%==check test result', group({
      controls: [
        editableBoolean('%$testResultExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
        text({
          vars: [
            Var('color', If('%success%', '--jb-success-fg', '--jb-error-fg'))
          ],
          text: If('%success%', '✓ check test result', '⚠ check test result'),
          features: css.color('var(%$color%)')
        })
      ]
    })),
    controlWithCondition('%$testResultExpanded/{%$index%}%', group({
      layout: layout.horizontal(20),
      controls: [
        controlWithCondition('%expectedResultCtx/data%', text(prettyPrint('%expectedResultCtx.profile.expectedResult%', true))),
        controlWithCondition('%expectedResultCtx/data%', text('%expectedResultCtx/data%')),
        text('%html%', {
          style: text.codemirror({ height: '200', formatText: true, mode: 'htmlmixed' }),
          features: [
          codemirror.fold(),
          css('min-width: 1200px; font-size: 130%')
        ]
        })
      ],
      features: feature.expandToEndOfRow('%$testResultExpanded/{%$index%}%')
    }))
  )
})

component('eventTracker.watchSpy', {
  type: 'feature',
  params: [
    {id: 'spy'},
    {id: 'delay', defaultValue: 3000}
  ],
  impl: followUp.watchObservable(source.callbag('%$spy/_obs%'))
})

component('eventTracker.eventTypes', {
  params: [
    {id: 'spy'}
  ],
  type: 'control',
  impl: picklist({
    databind: '%$eventTracker/spyLogs%',
    options: picklist.options(properties('%$spy/counters%'), { code: '%id%', text: '%id% (%val%)' }),
    features: [
      chromeDebugger.colors(),
      picklist.onChange((ctx,{},{spy}) => {
        const loc = spy.locations[ctx.data].split(':')
        const col = +loc.pop()
        const line = (+loc.pop())-1
        const location = [loc.join(':'),line,col]
        jb.log('eventTracker openResource',{ctx,loc: spy.locations[ctx.data], location})
        loc && parent.postMessage({ runProfile: {$: 'chromeDebugger.openResource', location }})
      })
    ]
  })
})

component('studio.objExpandedAsText', {
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


component('studio.lowFootprintObj', {
  type: 'control',
  params: [
    {id: 'obj', mandatory: true},
    {id: 'title', mandatory: true},
    {id: 'length', as: 'number', defaultValue: 20}
  ],
  impl: controlWithCondition('%$obj%', group({
    layout: layout.horizontal(4),
    controls: [
      controlWithCondition('%$obj/cmpCtx%', studio.slicedString('%$obj/profile/$%: %$obj/path%')),
      controlWithCondition({
        condition: ({},{},{obj}) => jb.db.isRef(obj),
        control: studio.slicedString(({},{},{obj}) => obj.handler.pathOfRef(obj).join('/'))
      }),
      controlWithCondition('%$obj/opEvent/newVal%', studio.slicedString('%$obj/opEvent/newVal%')),
      controlWithCondition(isOfType('boolean', '%$obj%'), studio.slicedString('%$title%')),
      controlWithCondition(isOfType('string,number', '%$obj%'), studio.slicedString('%$title%: %$obj%'))
    ]
  }))
})

component('studio.slicedString', {
  params: [
    {id: 'data', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 30 },
  ],
  impl: controlWithCondition(
        isOfType('string', '%$data%'),
        text(({},{},{length,data}) => data.replace(/\n/g,'').slice(0,length))
    )
})

// jb.component('eventTracker.isNotDebuggerEvent', {
//   impl: ({data}) => !(jb.path(data,'m.routingPath') && jb.path(data,'m.routingPath').find(y=>y.match(/vDebugger/))
//     || (jb.path(data,'m.result.uri') || '').match(/vDebugger/)
//   )
// })

component('eventTracker.eventItems', {
  params: [
    {id: 'spy', dynamic: true},
    {id: 'query', as: 'string' },
  ],
  impl: (ctx,_spy, query) => {
    const spy = _spy()
    if (!spy) return []
    //const checkEv = jb.comps['eventTracker.isNotDebuggerEvent'].impl // efficiency syntax
    //spy.logs = spy.logs.filter(data=> checkEv({data}))
    const items = jb.spy.search(query,{spy, enrich: false})
      
    jb.log('eventTracker items',{ctx,spy,query,items})
    const itemsWithTimeBreak = items.reduce((acc,item,i) => i && item.time - items[i-1].time > 100 ? 
      [...acc,{index: '---', logNames: `----- ${item.time - items[i-1].time} mSec gap ------`},item] : 
      [...acc,item] ,[])
    return itemsWithTimeBreak
  }
})

component('eventTracker.elemOfCmp', {
  params: [
    {id: 'cmp' }
  ],
  impl: eventTracker.elemInInspectedJb('[cmp-id="%$cmp/cmpId%"]')
})

component('eventTracker.elemInInspectedJb', {
  params: [
    {id: 'selector' }
  ],
  impl: (ctx,selector) => {
    const elem = selector != '#' && jb.ui.find(jb.frame.document,selector)[0]
    jb.log('eventTracker elemInInspectedJb',{ctx,selector,elem})
    return elem
  }
})

component('eventTracker.highlightEvent', {
  type: 'action',
  params: [
    {id: 'event', defaultValue: '%%'}
  ],
  impl: runActions(
    Var('elem', firstSucceeding(eventTracker.elemOfCmp('%$event/cmp%'), eventTracker.elemInInspectedJb('#%$event/dialogId%'))),
    If('%$elem%', eventTracker.highlightElem('%$elem%')),
    If('%$event/elem%', eventTracker.highlightElem('%$event/elem%')),
    If('%$event/parentElem%', eventTracker.highlightElem('%$event/parentElem%'))
  )
})

component('eventTracker.highlightElem', {
  type: 'action',
  params: [
    {id: 'elem'},
    {id: 'css', as: 'string', defaultValue: 'border: 1px dashed grey'}
  ],
  impl: runActions(
    Var('previewOverlay', true),
    log('eventTracker highlightElem'),
    openDialog({
      content: text(''),
      style: eventTracker.highlightDialogStyle(),
      id: 'highlight-dialog',
      features: [
        css(({},{},{elem}) => {
            if (!elem || !elem.getBoundingClientRect || !jb.ui.studioFixXPos) return ''
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

component('eventTracker.highlightDialogStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ display: block; position: absolute; background: transparent}',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
  })
})

component('studio.sourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'}
  ],
  impl: controlWithCondition('%$srcCtx/cmpCtx%', group({
    controls: [
      controlWithCondition('%$stackItems/length% == 0', studio.singleSourceCtxView('%$srcCtx%')),
      controlWithCondition('%$stackItems/length% > 0', group({
        style: group.sectionExpandCollapse(studio.singleSourceCtxView('%$srcCtx%')),
        controls: itemlist({ items: '%$stackItems%', controls: studio.singleSourceCtxView('%%') })
      }))
    ],
    features: variable('stackItems', studio.stackItems('%$srcCtx%'))
  }))
})

component('studio.singleSourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'}
  ],
  impl: button({
    title: ({},{},{srcCtx}) => {
            if (!srcCtx) return ''
            const path = srcCtx.path || ''
            const profile = path && jb.tgp.valOfPath(path)
            const pt = profile && profile.$ || ''
            const ret = `${path.split('~')[0]}:${pt}`
            return ret.replace(/feature./g,'').replace(/front.nd./g,'').replace(/.action/g,'')
          },
    action: eventTracker.highlightEvent('%%'),
    style: button.hrefText(),
    features: [
      feature.hoverTitle('%$srcCtx/path%'),
      button.ctrlAction(studio.gotoSource('%$srcCtx/path%', true))
    ]
  })
})

component('studio.stackItems', {
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

component('chromeDebugger.colors', {
  type: 'feature',
  impl: features(
    css.color('var(--jb-menu-fg)', 'var(--jb-menubar-inactive-bg)'),
    css('border: 0px;'),
    css('~ option { background: white}')
  )
})

component('eventTracker.compInspector', {
  params: [
    {id: 'cmp'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: chromeDebugger.sectionsExpandCollapse(),
      controls: [
        text('%$cmp/cmpId%;%$cmp/ver% -- %$cmp/ctx/path%', '%$cmp/ctx/profile/$%'),
        table('state', {
          items: unique({ items: list(keys('%$cmp/state%'), keys('%$elem/_component/state%')) }),
          controls: [
          text('%%', ''),
          text('%$elem/_component/state/{%%}%', 'front end'),
          text('%$cmp/state/{%%}%', 'back end')
        ]
        }),
        editableText('source', tgp.profileAsText('%$cmp/ctx/path%'), {
          style: editableText.codemirror({ height: '100' }),
          features: codemirror.fold()
        }),
        table('methods', {
          items: '%$cmp/method%',
          controls: [
          text('%id%', 'method'),
          studio.sourceCtxView('%ctx%')
        ],
          style: table.plain(true)
        }),
        tableTree('rendering props', tree.jsonReadOnly('%$cmp/renderProps%'), {
          leafFields: text('%val%', 'value'),
          chapterHeadline: text(tree.lastPathElement('%path%'))
        })
      ]
    }),
    features: [
      variable('elem', eventTracker.elemOfCmp('%$cmp%'))
    ]
  })
})

component('chromeDebugger.icon', {
  type: 'button.style',
  params: [
    {id: 'position', as: 'string', defaultValue: '0px 144px'}
  ],
  impl: customStyle({
    template: (cmp,{title},h) => h('div',{onclick: true, title}),
    css: `{ -webkit-mask-image: url(http://localhost:8082/hosts/chrome-debugger/largeIcons.svg); -webkit-mask-position: %$position%; 
      cursor: pointer; min-width: 24px; max-width: 24px;  height: 24px; background-color: #333; opacity: 0.7 }
      ~:hover { opacity: 1 }
      ~:active { opacity: 0.5 }`,
    features: button.initAction()
  })
})

component('chromeDebugger.sectionsExpandCollapse', {
  type: 'group.style',
  impl: group.sectionsExpandCollapse(true, text.span(), {
    toggleStyle: editableBoolean.expandCollapseWithUnicodeChars(),
    titleGroupStyle: styleWithFeatures(group.div(), {
    features: features(
    css.class('expandable-view-title'),
    css('~ i { margin-top: 5px }'),
    css('text-transform: capitalize')
  )
  }),
    innerGroupStyle: styleWithFeatures(group.div(), { features: features(css.margin({ bottom: 5 })) })
  })
})

component('chromeDebugger.toggleStyle', {
  type: 'editable-boolean.style',
  impl: editableBoolean.expandCollapseWithUnicodeChars()
})

component('studio.openEventTracker', {
  type: 'action',
  impl: openDialog('Spy', studio.eventTracker(), {
    style: dialog.studioFloating('event-tracker', '700', { height: '400' }),
    features: dialogFeature.resizer()
  })
})

component('eventTracker.getParentSpy', {
  impl: () => jb.path(jb.parent,'spy') || {}
})

component('eventTracker.codeSize', {
  impl: ()=> {
    const _jb = jb.parent || jb
    return _jb.treeShake.totalCodeSize ? Math.floor(_jb.treeShake.totalCodeSize/1000) + 'k' : ''
  }
})

component('eventTracker.clearSpyLog', {
  type: 'action',
  params: [
    {id: 'spy'}
  ],
  impl: runActions(
    Var('items', eventTracker.eventItems('%$spy%')),
    (ctx, {items}, {spy}) => {
      const lastGroupIndex = items.length - items.reverse().findIndex(x=>x.index == '---')
      if (lastGroupIndex >= items.length)
        jb.spy.clear(spy)
      else
        spy.logs.splice(0,lastGroupIndex-1)
  }
  )
})