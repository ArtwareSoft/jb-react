jb.ns('chromeDebugger')

jb.component('studio.compInspector', {
  params: [
    {id: 'inspectedProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: group.sectionsExpandCollopase({
        autoExpand: true,
        titleStyle: text.span(),
        titleGroupStyle: styleWithFeatures(group.div(), features(
          css.class('expandable-view-title'),
          css('~ i { margin-top: 5px }'),
          css('text-transform: capitalize')
        )),
        innerGroupStyle: styleWithFeatures(group.div(), features(
          css.margin({bottom: 5}),
        ))
      }),
      controls: [
        text('%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%', '%$inspectedCtx/profile/$%'),
        itemlist({
            title: 'state',
            items: unique({items: list(keys('%$inspectedCmp/state%'),keys('%$elem/_component/state%'))}),
            controls: [
             text('%%', ''),
             text('%$elem/_component/state/{%%}%', 'front end'),
             text('%$inspectedCmp/state/{%%}%', 'back end'),
            ],
            style: table.plain(),
            features: followUp.watchObservable(source.callbag('%$frameOfElem.spy.observable()%', 100))
        }),
        studio.eventsOfComp('%$inspectedCmp/cmpId%'),
        editableText({
            title: 'source',
            databind: studio.profileAsText('%$inspectedCtx/path%'),
            style: editableText.codemirror({height: '100'})
        }),
        itemlist({
          title: 'methods',
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
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
      variable('frameOfElem', ({},{frameUri}) => [self,self.parent,...Array.from(frames)].filter(x=>x.jbUri == frameUri)[0]),
      variable('elem', ({},{cmpId,frameOfElem}) => frameOfElem && frameOfElem.document.querySelector(`[cmp-id="${cmpId}"]`)),
      variable('inspectedCmp', ({},{frameOfElem, elem}) => 
            jb.path(elem && frameOfElem && frameOfElem.jb.ctxDictionary[elem.getAttribute('full-cmp-ctx')],'vars.cmp')),
      variable('inspectedCtx', '%$inspectedCmp/ctx%'),
      feature.requireService(studio.editingService(),'%$frameUri%==studio'),
      chromeDebugger.refreshAfterSelection(),
      followUp.flow(
        source.callbag(({},{frameOfElem}) => frameOfElem && frameOfElem.jb.ui.refreshNotification),
        rx.debounceTime(300),
        sink.refreshCmp('%$$state%')
      ),
    ]
  })
})

jb.component('studio.eventsOfComp', {
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
                text: pipeline(eventTracker.getSpy(), '%$events/length%/%logs/length%'),
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
            eventTracker.eventTypes()
          ],
          features: css.color({background: 'var(--jb-menubar-inactive-bg)'})
        }),
        itemlist({
          items: '%$events%',
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
          value: pipeline(eventTracker.eventItems('%$studio/eventTrackerCmpQuery%'),filter('%cmp/cmpId%==%$cmpId%'))
        }),
        followUp.watchObservable(source.callbag(ctx => jb.ui.getSpy(ctx).observable()), 1000)
      ]
    })
})