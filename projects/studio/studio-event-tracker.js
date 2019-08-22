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

jb.component('studio.event-title',  /* studio_eventTitle */ {
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cmp',  /* studio_eventCmp */ {
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cause',  /* studio_eventCause */ {
  type: 'data',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: (context,event) =>
		(event && event.opEvent) ? st.nameOfRef(event.opEvent.ref) + ' changed to "' + st.valSummary(event.opEvent.newVal) + '"' : ''
})

jb.component('studio.state-change-events',  /* studio_stateChangeEvents */ {
  type: 'data',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,studio) =>
		(studio ? st.studioStateChangeEvents : st.stateChangeEvents) || []
})

jb.component('studio.highlight-event',  /* studio_highlightEvent */ {
  type: 'action',
  params: [
    {id: 'event', as: 'single', defaultValue: '%%'}
  ],
  impl: studio_highlightInPreview(
    '%$event/cmp/ctx/path%'
  )
})

jb.component('studio.event-tracker',  /* studio_eventTracker */ {
  type: 'control',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: [
      table({
        items: studio_stateChangeEvents('%$studio%'),
        fields: [
          field_control({
            title: 'changed',
            control: button({
              title: studio_nameOfRef('%opEvent/ref%'),
              action: studio_gotoPath(studio_pathOfRef('%opEvent/ref%')),
              style: button_href(),
              features: feature_hoverTitle(studio_pathOfRef('%opEvent/ref%'))
            }),
            width: '100'
          }),
          field({title: 'from', data: prettyPrint('%opEvent/oldVal%'), width: '200'}),
          field({title: 'to', data: prettyPrint('%opEvent/newVal%'), width: '200'}),
          field_control({
            title: 'action',
            control: button({
              title: '%opEvent/srcCtx/path%',
              action: studio_gotoPath('%opEvent/srcCtx/path%'),
              style: button_href()
            }),
            width: '100'
          }),
          field_control({
            title: 'refreshing',
            control: button({
              title: studio_eventCmp(),
              action: studio_gotoPath('%cmp/ctxForPick/path%'),
              style: button_href(),
              features: [feature_onHover(studio_highlightEvent())]
            }),
            width: '200'
          }),
          field_control({
            title: 'watched at',
            control: button({
              title: '%watchedAt/path%',
              action: studio_gotoPath('%watchedAt/path%'),
              style: button_href()
            }),
            width: '100'
          })
        ],
        style: table_withHeaders()
      })
    ],
    features: [
      {
        $if: '%$studio%',
        then: watchObservable(ctx => jb.ui.stateChangeEm.debounceTime(500)),
        else: watchObservable(ctx => st.previewjb.ui.stateChangeEm.debounceTime(500))
      }
    ]
  })
})


jb.component('studio.open-event-tracker',  /* studio_openEventTracker */ {
  type: 'action',
  params: [
    {id: 'studio', as: 'boolean', type: 'boolean'}
  ],
  impl: openDialog({
    style: dialog_studioFloating({id: 'event-tracker', width: '700', height: '400'}),
    content: studio_eventTracker('%$studio%'),
    title: {$if: '%$studio%', then: 'Studio Event Tracking', else: 'Event Tracking'},
    features: [dialogFeature_resizer()]
  })
})

})()