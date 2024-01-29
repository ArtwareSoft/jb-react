component('studio.compInspector', {
  params: [
    {id: 'inspectedProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      controls: [
        text({
          text: '%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%',
          title: '%$inspectedCtx/profile/$%'
        }),
        table('state', {
          items: unique({ items: list(keys('%$inspectedCmp/state%'), keys('%$elem/_component/state%')) }),
          controls: [
            text('%%', ''),
            text('%$elem/_component/state/{%%}%', 'front end'),
            text('%$inspectedCmp/state/{%%}%', 'back end')
          ],
          features: followUp.watchObservable(source.callbag('%$frameOfElem.spy.observable()%'))
        }),
        studio.eventsOfComp('%$inspectedCmp/cmpId%'),
        editableText('source', tgp.profileAsText('%$inspectedCtx/path%'), {
          style: editableText.codemirror({ height: '100' }),
          features: codemirror.fold()
        }),
        table('methods', {
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ]
        }),
        tableTree('rendering props', tree.jsonReadOnly('%$inspectedCmp/renderProps%'), {
          leafFields: text('%val%', 'value'),
          chapterHeadline: text(tree.lastPathElement('%path%'))
        })
      ],
      style: chromeDebugger.sectionsExpandCollapse()
    }),
    features: [
      variable('cmpId', firstSucceeding('%$$state.cmpId%','%$inspectedProps.cmpId%')),
      variable('frameUri', firstSucceeding('%$$state.frameUri%','%$inspectedProps.frameUri%')),
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
      )
    ]
  })
})

component('studio.eventsOfComp', {
  type: 'control',
  params: [
    {id: 'compId'}
  ],
  impl: group({
    controls: [
      group({
        controls: [
          text(pipeline(eventTracker.getParentSpy(), '%$events/length%/%logs/length%'), 'counts', { features: [css.padding('5', '5')] }),
          divider(divider.vertical()),
          button('clear', runActions(eventTracker.clearSpyLog(), refreshControlById('cmp-event-tracker')), {
            style: chromeDebugger.icon(),
            features: [
              css.color('var(--jb-menu-fg)'),
              feature.hoverTitle('clear')
            ]
          }),
          divider(divider.vertical()),
          editableText('query', '%$studio/eventTrackerCmpQuery%', {
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
        title: 'toolbar',
        layout: layout.horizontal('2'),
        features: css.color({ background: 'var(--jb-menubar-inactive-bg)' })
      }),
      table({
        items: '%$events%',
        controls: [
          text('%index%'),
          text('%logNames%', {
            features: feature.byCondition(inGroup(list('exception','error'), '%logNames%'), css.color('var(--jb-error-fg)'))
          }),
          studio.lowFootprintObj('%err%', 'err'),
          studio.objExpandedAsText('%stack%', 'stack'),
          controlWithCondition('%m%', text('%m/$%: %m/t%, %m/cbId%')),
          studio.objExpandedAsText('%m/d%', 'payload'),
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
        visualSizeLimit: 30,
        features: [
          id('event-logs'),
          itemlist.infiniteScroll(5),
          itemlist.selection({
            onSelection: runActions(({data}) => jb.frame.console.log(data), eventTracker.highlightEvent('%%'))
          }),
          itemlist.keyboardSelection(),
          css.height('200', 'scroll')
        ]
      })
    ],
    title: 'events',
    features: [
      id('cmp-event-tracker'),
      variable('events', pipeline(eventTracker.eventItems(eventTracker.getParentSpy(), '%$studio/eventTrackerCmpQuery%'), filter('%cmp/cmpId%==%$cmpId%'))),
      eventTracker.watchSpy(eventTracker.getParentSpy(), 1000)
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
  ))
})