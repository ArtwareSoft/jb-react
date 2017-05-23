(function() { var st = jb.studio;

st.initEventTracker = _ => {
	st.stateChangeEvents = [];
	st.stateChangeClusterEm = st.previewjb.ui.stateChangeEm.bufferTime(100).filter(x=>x.length> 0);
	st.stateChangeClusterEm.subscribe(events=>{
		st.stateChangeEvents.unshift(events);
		st.stateChangeEvents = st.stateChangeEvents.slice(0,5);
	})
}

//ui.stateChangeEm.next({cmp: cmp, opEvent: opEvent});
//({op: op, ref: ref, srcCtx: srcCtx, oldRef: oldRef, oldResources: oldResources});

jb.component('studio.state-change-title', {
	type: 'data',
	params: [ {id: 'event', as: 'single' } ],
	impl: (context,event) => {
		if (event.opEvent && event.opEvent.ref)
			var cause = 'caused by change value to ' + st.valSummaryOfRef(event.opEvent.ref) + ' of ' + st.nameOfRef(event.opEvent.ref)
		else 
			var cause = ''
		return 'refresh at ' + (event.cmp.ctxForPick || event.cmp.ctx).path.replace(/~/g,'/') + ' ' + cause;
	}
});

jb.component('studio.state-change-events', {
	type: 'data',
	impl: ctx => 
		st.stateChangeEvents[0] || []
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
		{id: 'event' }
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
    	items: {$: 'studio.state-change-events'},
    	controls: {$: 'label', title:{$: 'studio.state-change-title', event: '%%'} },
        features: [
          {$: 'itemlist.selection', 
            onSelection :{$: 'studio.highlight-event' }
          }
        ],
    	features:{$: 'watch-observable', toWatch: ctx => st.stateChangeClusterEm.delay(1) , strongRefresh: true } 
	}
})


})()