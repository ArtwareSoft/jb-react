(function() { var st = jb.studio;

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

jb.component('studio.event-title', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cmp', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		event ? st.pathSummary(event.cmp.ctxForPick.path).replace(/~/g,'/') : ''
})

jb.component('studio.event-cause', {
	type: 'data',
	params: [ {id: 'event', as: 'single', defaultValue: '%%' } ],
	impl: (context,event) =>
		(event && event.opEvent) ? st.nameOfRef(event.opEvent.ref) + ' changed to "' + st.valSummary(event.opEvent.newVal) + '"' : ''
})

jb.component('studio.state-change-events', {
	type: 'data',
	params: [ {id: 'studio', as: 'boolean' } ],
	impl: (ctx,studio) => 
		(studio ? st.studioStateChangeEvents : st.stateChangeEvents) || []
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
  params: [ {id: 'studio', as: 'boolean' } ],
  impl :{$: 'open-dialog', 
      content :{$: 'studio.event-tracker', studio: '%$studio%' }, 
      style :{$: 'dialog.studio-floating', 
        id: 'event-tracker', 
        width: '700', 
        height: '400'
      }, 
      title: {$if: '%$studio%', then: 'Studio Event Tracking', else: 'Event Tracking'},
      features: [
        {$: 'dialog-feature.resizer' }, 
      ]      
  }
}) 

jb.component('studio.event-tracker', {
  type: 'control', 
  params: [ {id: 'studio', as: 'boolean' } ],
  impl :{$: 'group', 
    controls: [
      {$: 'table', 
        items :{$: 'studio.state-change-events', studio: '%$studio%' }, 
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
    features : [
      {$if: '%$studio%',
	    then: {$: 'watch-observable', 
	      toWatch: ctx => jb.ui.stateChangeEm.debounceTime(500), 
	    },
	    else: {$: 'watch-observable', 
	      toWatch: ctx => st.previewjb.ui.stateChangeEm.debounceTime(500), 
	    }
	}]
  }
})

})()