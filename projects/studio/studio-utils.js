(function() { var st = jb.studio;

st.message = function(message,error) {
	$('.studio-message').text(message); // add animation
	$('.studio-message').css('background', error ? 'red' : '#327DC8');
	$('.studio-message').css('animation','');
	jb.delay(1).then(()=>
		$('.studio-message').css('animation','slide_from_top 5s ease')
	)
}

// st.jbart_base = function() {
// 	return jb.studio.previewjb || jb;
// }

// st.findjBartToLook = function(path) {
// 	var id = path.split('~')[0];
// 	if (st.jbart_base().comps[id])
// 		return st.jbart_base();
// 	if (jb.comps[id])
// 		return jb;
// }

// ********* Components ************

jb.component('studio.message', {
	type: 'action',
	params: [ { id: 'message', as: 'string' } ],
	impl: (ctx,message) =>
		st.message(message)
})

jb.component('studio.redraw-studio', {
	type: 'action',
	impl: ctx =>
    	st.redrawStudio && st.redrawStudio()
})

jb.component('studio.last-edit', {
	type: 'data',
	params: [
		{ id: 'justNow', as: 'boolean', type: 'boolean', defaultValue: true },
	],
	impl: (ctx,justNow) => {
		var now = new Date().getTime();
		var lastEvent = st.compsHistory.slice(-1).map(x=>x.opEvent).filter(x=>x)
			.filter(r=>
				!justNow || now - r.timeStamp < 1000)[0];
		return lastEvent && (lastEvent.insertedPath || lastEvent.path).join('~');
	}
})

jb.component('studio.goto-last-edit', {
	type: 'action',
	impl: {$:'action.if', condition: {$: 'studio.last-edit'}, then: {$: 'studio.goto-path', path: {$: 'studio.last-edit'}} }
})

jb.component('studio.goto-path', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string' },
	],
	impl :{$runActions: [
		{$: 'dialog.close-containing-popup' },
		{$: 'write-value', to: '%$studio/profile_path%', value: '%$path%' },
		{$if :{$: 'studio.is-of-type', type: 'control', path: '%$path%'},
			then: {$runActions: [
				{$: 'studio.open-control-tree'},
//				{$: 'studio.open-properties', focus: true}
			]},
			else :{$: 'studio.open-component-in-jb-editor', path: '%$path%' }
		}
	]}
})

jb.component('studio.project-source',{
	params: [
		{ id: 'project', as: 'string', defaultValue: '%$studio/project%' }
	],
	impl: (context,project) => {
		if (!project) return;
		var comps = jb.entries(st.previewjb.comps).map(x=>x[0]).filter(x=>x.indexOf(project) == 0);
		return comps.map(comp=>st.compAsStr(comp)).join('\n\n')
	}
})

jb.component('studio.comp-source',{
	params: [
		{ id: 'comp', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } }
	],
	impl: (context,comp) =>
		st.compAsStr(comp.split('~')[0])
})

jb.component('studio.dynamic-options-watch-new-comp', {
  type: 'feature',
  impl :{$: 'picklist.dynamic-options',
        recalcEm: () =>
          st.scriptChange.filter(e => e.path.length == 1)
  }
})


})();
