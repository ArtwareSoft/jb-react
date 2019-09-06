(function() {
const st = jb.studio;

st.initEventTracker = _ => {
	// debug the preview
	st.stateChangeEvents = [];
	st.previewjb.ui.stateChangeEm.subscribe(e=>{
		var curTime = e.timeStamp = new Date().getTime();
		st.stateChangeEvents.unshift(e);
		st.stateChangeEvents = st.stateChangeEvents.filter(ev=>ev.timeStamp > curTime - 2000)
	})
	// debug the studio
	st.studioStateChangeEvents = [];
	jb.ui.stateChangeEm.subscribe(e=>{
		var curTime = e.timeStamp = new Date().getTime();
		st.studioStateChangeEvents.unshift(e);
		st.studioStateChangeEvents = st.studioStateChangeEvents.filter(ev=>ev.timeStamp > curTime - 2000)
	})
}

//ui.stateChangeEm.next({cmp: cmp, opEvent: opEvent})
//({op: op, ref: ref, srcCtx: srcCtx, oldRef: oldRef, oldResources: oldResources})

jb.component('studio.event-title', { /* studio.eventTitle */
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cmp', { /* studio.eventCmp */
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cause', { /* studio.eventCause */
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		(event && event.opEvent) ? st.nameOfRef(event.opEvent.ref) + ' changed to "' + st.valSummary(event.opEvent.newVal) + '"' : ''
})

jb.component('studio.state-change-events', { /* studio.stateChangeEvents */
  type: 'data',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,studio) =>
		(studio ? st.studioStateChangeEvents : st.stateChangeEvents) || []
})

jb.component('studio.highlight-event', { /* studio.highlightEvent */
  type: 'action',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: studio.highlightInPreview(
    '%$event/cmp/ctx/path%'
  )
})

jb.component('studio.event-tracker', { /* studio.eventTracker */
  type: 'control',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: [
      table({
        items: studio.stateChangeEvents('%$studio%'),
        fields: [
          field.control({
            title: 'changed',
            control: button({
              title: studio.nameOfRef('%opEvent/ref%'),
              action: studio.gotoPath(studio.pathOfRef('%opEvent/ref%')),
              style: button.href(),
              features: feature.hoverTitle(studio.pathOfRef('%opEvent/ref%'))
            }),
            width: '100'
          }),
          field({title: 'from', data: prettyPrint('%opEvent/oldVal%'), width: '200'}),
          field({title: 'to', data: prettyPrint('%opEvent/newVal%'), width: '200'}),
          field.control({
            title: 'action',
            control: button({
              title: '%opEvent/srcCtx/path%',
              action: studio.gotoPath('%opEvent/srcCtx/path%'),
              style: button.href()
            }),
            width: '100'
          }),
          field.control({
            title: 'refreshing',
            control: button({
              title: studio.eventCmp(),
              action: studio.gotoPath('%cmp/ctxForPick/path%'),
              style: button.href(),
              features: [feature.onHover(studio.highlightEvent())]
            }),
            width: '200'
          }),
          field.control({
            title: 'watched at',
            control: button({
              title: '%watchedAt/path%',
              action: studio.gotoPath('%watchedAt/path%'),
              style: button.href()
            }),
            width: '100'
          })
        ],
        style: table.withHeaders()
      })
    ],
    features: [
      {
        '$if': '%$studio%',
        then: watchObservable(ctx => jb.ui.stateChangeEm.debounceTime(500)),
        else: watchObservable(ctx => st.previewjb.ui.stateChangeEm.debounceTime(500))
      }
    ]
  })
})


jb.component('studio.open-event-tracker', { /* studio.openEventTracker */ 
  type: 'action',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: openDialog({
    style: dialog.studioFloating({id: 'event-tracker', width: '700', height: '400'}),
    content: studio.eventTracker('%$studio%'),
    title: {'$if': '%$studio%', then: 'Studio Event Tracking', else: 'Event Tracking'},
    features: [dialogFeature.resizer()]
  })
})

})()