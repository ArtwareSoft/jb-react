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
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
});

jb.component('studio.event-cmp', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
});

jb.component('studio.event-cause', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		(event && event.opEvent) ? st.nameOfRef(event.opEvent.ref) + ' changed to "' + st.valSummary(event.opEvent.newVal) + '"' : ''
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
  impl :{$: 'group', 
    controls: [
      {$: 'table', 
        items :{$: 'studio.state-change-events' }, 
        fields: [
          {$: 'field.control', 
            title: 'changed', 
            control :{$: 'button', 
              title :{$: 'studio.name-of-ref', ref: '%opEvent/ref%' }, 
              action :{$: 'studio.goto-path', 
                path :{$: 'studio.path-of-ref', ref: '%opEvent/ref%' }
              }, 
              style :{$: 'button.href' }, 
              features :{$: 'feature.hover-title', 
                title :{$: 'studio.path-of-ref', ref: '%opEvent/ref%' }
              }
            }, 
            width: '100'
          }, 
          {$: 'field', 
            title: 'from', 
            data :{$: 'pretty-print', profile: '%opEvent/oldVal%' }, 
            width: '200'
          }, 
          {$: 'field', 
            title: 'to', 
            data :{$: 'pretty-print', profile: '%opEvent/newVal%' }, 
            width: '200'
          }, 
          {$: 'field.control', 
            title: 'action', 
            control :{$: 'button', 
              title: '%opEvent/srcCtx/path%', 
              action :{$: 'studio.goto-path', path: '%opEvent/srcCtx/path%' }, 
              style :{$: 'button.href' }
            }, 
            width: '100'
          }, 
          {$: 'field.control', 
            title: 'refreshing', 
            control :{$: 'button', 
              title :{$: 'studio.event-cmp' }, 
              action :{$: 'studio.goto-path', 
                target: 'new tab', 
                path: '%cmp/ctxForPick/path%'
              }, 
              style :{$: 'button.href' }, 
              features: [
                {$: 'feature.onHover', 
                  action :{$: 'studio.highlight-event' }
                }
              ]
            }, 
            width: '200'
          }, 
          {$: 'field.control', 
            title: 'watched at', 
            control :{$: 'button', 
              title: '%watchedAt/path%', 
              action :{$: 'studio.goto-path', path: '%watchedAt/path%' }, 
              style :{$: 'button.href' }
            }, 
            width: '100'
          }
        ], 
        style :{$: 'table.with-headers' }
      }
    ], 
    features :{$: 'watch-observable', 
      toWatch: ctx => st.previewjb.ui.stateChangeEm.debounceTime(500), 
      strongRefresh: true
    }
  }
})

})()