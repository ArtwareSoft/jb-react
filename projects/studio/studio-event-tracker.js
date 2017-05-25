(function() { var st = jb.studio;

st.initEventTracker = _ => {
	st.stateChangeEvents = [];
	st.previewjb.ui.stateChangeEm.subscribe(e=>{
		var curTime = e.timeStamp = new Date().getTime();
		st.stateChangeEvents.unshift(e);
		st.stateChangeEvents = st.stateChangeEvents.filter(e=>e.timeStamp > curTime - 2000)
	})
}

//ui.stateChangeEm.next({cmp: cmp, opEvent: opEvent});
//({op: op, ref: ref, srcCtx: srcCtx, oldRef: oldRef, oldResources: oldResources});

jb.component('studio.event-title', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		event ? st.pathSummary((event.cmp.ctxForPick || event.cmp.ctx).path).replace(/~/g,'/') : ''
});

jb.component('studio.event-cmp', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		event ? st.pathSummary((event.cmp.ctxForPick || event.cmp.ctx).path).replace(/~/g,'/') : ''
});

jb.component('studio.event-cause', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		(event && event.opEvent) ? st.nameOfRef(event.opEvent.ref) + ' changed to "' + st.valSummaryOfRef(event.opEvent.ref) + '"' : ''
});

jb.component('studio.state-change-events', {
	type: 'data',
	impl: ctx => 
		st.stateChangeEvents || []
})

jb.component('studio.events-of-opeation', {
	type: 'data',
	params: [ {id: 'op', as: 'single' } ],
	impl: (ctx,op) => 
		jb.unique(t.stateChangeEvents.map(e=>e.opEvent))
})

jb.component('studio.opeations-of-events', {
	type: 'data',
	impl: ctx => 
		t.stateChangeEvents.map(e=>e.opEvent == op)
})


jb.component('studio.highlight-event', {
	type: 'action',
	params: [
		{id: 'event', as: 'single', defaultValue: '%%' }
	],
	impl :{$: 'studio.highlight-in-preview', path: '%$event/cmp/ctx/path%' }
})


jb.component('studio.open-event-tracker', {
  type: 'action', 
  impl :{$: 'open-dialog', 
      content :{$: 'studio.event-tracker' }, 
      style :{$: 'dialog.studio-floating', 
        id: 'event-tracker', 
        width: '700', 
        height: '400'
      }, 
      title: 'Event Tracking'
  }
}) 

jb.component('studio.event-tracker', {
  type: 'control', 
  impl :{$: 'itemlist', 
    items :{$: 'studio.state-change-events' }, 
    controls :{$: 'group', 
      style :{$: 'layout.horizontal', spacing: '3' }, 
      controls: [
        {$: 'label', 
          title :{$: 'studio.event-cmp' }, 
          style :{$: 'label.span' }, 
          features: [
            {$: 'css.width', width: '180' }, 
            {$: 'feature.onHover', 
              action :{$: 'studio.highlight-event' }
            }
          ]
        }, 
        {$: 'label', 
          title :{$: 'studio.event-cause', event: '%%' }, 
          style :{$: 'label.span' }
        }
      ]
    }, 
    features :{$: 'watch-observable', 
      toWatch: ctx => st.previewjb.ui.stateChangeEm.debounceTime(500), 
      strongRefresh: true
    }
  }
})


})()