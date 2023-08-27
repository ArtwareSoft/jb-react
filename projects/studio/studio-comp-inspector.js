component('studio.compInspector', {
  params: [
    {id: 'inspectedProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: chromeDebugger.sectionsExpandCollapse(),
      controls: [
        text('%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%', '%$inspectedCtx/profile/$%'),
        table({
            title: 'state',
            items: unique({items: list(keys('%$inspectedCmp/state%'),keys('%$elem/_component/state%'))}),
            controls: [
             text('%%', ''),
             text('%$elem/_component/state/{%%}%', 'front end'),
             text('%$inspectedCmp/state/{%%}%', 'back end'),
            ],
            features: followUp.watchObservable(source.callbag('%$frameOfElem.spy.observable()%', 100))
        }),
        studio.eventsOfComp('%$inspectedCmp/cmpId%'),
        editableText({
            title: 'source',
            databind: tgp.profileAsText('%$inspectedCtx/path%'),
            style: editableText.codemirror({height: '100'}),
            features: codemirror.fold()
        }),
        table({
          title: 'methods',
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
        }),
        tableTree({
            title: 'rendering props',
            treeModel: tree.jsonReadOnly('%$inspectedCmp/renderProps%'),
            leafFields: text('%val%', 'value'),
            chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        //tree('raw', tree.jsonReadOnly('%$inspectedCmp%'))
      ]
    }),
    features: [
      variable('cmpId', firstSucceeding('%$$state.cmpId%', '%$inspectedProps.cmpId%')),
      variable('frameUri', firstSucceeding('%$$state.frameUri%', '%$inspectedProps.frameUri%')),
      variable('frameOfElem', ({},{frameUri}) => [globalThis,globalThis.parent,...Array.from(frames)].filter(x=>x.jb.uri == frameUri)[0]),
      variable('elem', ({},{cmpId,frameOfElem}) => frameOfElem && frameOfElem.document.querySelector(`[cmp-id="${cmpId}"]`)),
      variable('inspectedCmp', ({},{frameOfElem, elem}) => 
            elem && frameOfElem && frameOfElem.jb.ui.cmps[elem.getAttribute('cmp-id')]),
      variable('inspectedCtx', '%$inspectedCmp/ctx%'),
      chromeDebugger.refreshAfterSelection(),
      followUp.flow(
        source.callbag(({},{frameOfElem}) => frameOfElem && frameOfElem.jb.ui.refreshNotification),
        rx.debounceTime(300),
        sink.refreshCmp('%$$state%')
      ),
    ]
  })
})

component('studio.eventsOfComp', {
    type: 'control',
    params: [
        {id: 'compId'}
    ],
    impl: group({ title: 'events',
      controls: [
        group({
          title: 'toolbar',
          layout: layout.horizontal('2'),
          controls: [
            text({
                text: pipeline(eventTracker.getParentSpy(), '%$events/length%/%logs/length%'),
                title: 'counts',
                features: [css.padding({top: '5', left: '5'})]
            }),              
            divider({style: divider.vertical()}),
            button({
              title: 'clear',
              action: runActions(eventTracker.clearSpyLog(), refreshControlById('cmp-event-tracker')),
              style: chromeDebugger.icon(),
              features: [css.color('var(--jb-menu-fg)'), feature.hoverTitle('clear')]
            }),
            divider({style: divider.vertical()}),
            editableText({
              title: 'query',
              databind: '%$studio/eventTrackerCmpQuery%',
              style: editableText.input(),
              features: [
                htmlAttribute('placeholder', 'query'),
                feature.onEnter(refreshControlById('cmp-event-tracker')),
                css.class('toolbar-input'),
                css.height('10'),
                css.margin('4'),
                css.width('300')
              ]
            }),
            eventTracker.eventTypes(eventTracker.getParentSpy())
          ],
          features: css.color({background: 'var(--jb-menubar-inactive-bg)'})
        }),
        table({
          items: '%$events%',
          controls: [
            text('%index%'),
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
            id('event-logs'),
            itemlist.infiniteScroll(5),
            itemlist.selection({
              onSelection: runActions(({data}) => jb.frame.console.log(data), eventTracker.highlightEvent('%%'))
            }),
            itemlist.keyboardSelection(),
            css.height({height: '200', overflow: 'scroll'}),
          ]
        })
      ],
      features: [
        id('cmp-event-tracker'),
        variable({
          name: 'events',
          value: pipeline(eventTracker.eventItems(eventTracker.getParentSpy(),'%$studio/eventTrackerCmpQuery%'),filter('%cmp/cmpId%==%$cmpId%'))
        }),
        eventTracker.watchSpy(eventTracker.getParentSpy(), 1000),
      ]
    })
})

component('chromeDebugger.refreshAfterSelection', {
  type: 'feature',
  impl: method('refreshAfterDebuggerSelection', runActions(
      () => {
          const sorted = Array.from(parent.document.querySelectorAll('[jb-selected-by-debugger]'))
              .sort((x,y) => (+y.getAttribute('jb-selected-by-debugger')) - (+x.getAttribute('jb-selected-by-debugger')))
          sorted.slice(1).forEach(el=>el.removeAttribute('jb-selected-by-debugger'))
      },
      action.refreshCmp('%%')
  )),
})