(function() { var st = jb.studio;

st.message = function(message,error) {
  const el = document.querySelector('.studio-message');
  el.innerHTML = ''
	el.textContent = message;
  el.style.background = error ? 'red' : '#327DC8';
  el.style.animation = '';
	jb.delay(100).then(()=>	el.style.animation = 'slide_from_top 5s ease')
}

st.showMultiMessages = function(messages) {
  const el = document.querySelector('.studio-message');
  el.innerHTML = ''
  messages.forEach(m=>{
    const inner = document.createElement('div')
    inner.style.background = m.error ? 'red' : '#327DC8';
    inner.textContent = m.text;
    el.appendChild(inner)
  })
  el.style.animation = '';
	jb.delay(100).then(()=>	el.style.animation = 'slide_from_top 5s ease')
}


// ********* Components ************

jb.component('studio.currentProfilePath', { /* studio.currentProfilePath */
  impl: firstSucceeding(
    '%$simulateProfilePath%',
    '%$studio/profile_path%',
    '%$studio/project%.%$studio/page%'
  )
})

jb.component('studio.message', { /* studio.message */
  type: 'action',
  params: [
    {id: 'message', as: 'string'}
  ],
  impl: (ctx,message) =>
		st.message(message)
})

jb.component('studio.redraw-studio', { /* studio.redrawStudio */
  type: 'action',
  impl: ctx =>
    	st.redrawStudio && st.redrawStudio()
})

jb.component('studio.last-edit', { /* studio.lastEdit */
  type: 'data',
  params: [
    {id: 'justNow', as: 'boolean', type: 'boolean', defaultValue: true}
  ],
  impl: (ctx,justNow) => {
		const now = new Date().getTime();
		const lastEvent = st.compsHistory.slice(-1).map(x=>x.opEvent).filter(x=>x)
			.filter(r=>
				!justNow || now - r.timeStamp < 1000)[0];
		const res = lastEvent && (lastEvent.insertedPath || lastEvent.path);
		if (res)
			return res.join('~')
	}
})

jb.component('studio.goto-last-edit', { /* studio.gotoLastEdit */
  type: 'action',
  impl: ctx=>{
		const lastEdit = ctx.run({$: 'studio.last-edit'})
		if (lastEdit)
			ctx.setData(lastEdit).run({$: 'studio.goto-path', path: '%%'})
	}
})

jb.component('studio.project-source', { /* studio.projectSource */
  params: [
    {id: 'project', as: 'string', defaultValue: '%$studio/project%'}
  ],
  impl: (context,project) => {
		if (!project) return;
		var comps = jb.entries(st.previewjb.comps).map(x=>x[0]).filter(x=>x.indexOf(project) == 0);
		return comps.map(comp=>st.compAsStr(comp)).join('\n\n')
	}
})

jb.component('studio.comp-source', { /* studio.compSource */
  params: [
    {id: 'comp', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: (context,comp) =>
		st.compAsStr(comp.split('~')[0])
})

jb.component('studio.dynamic-options-watch-new-comp', { /* studio.dynamicOptionsWatchNewComp */ 
  type: 'feature',
  impl: picklist.dynamicOptions(
    () =>
          st.scriptChange.filter(e => e.path.length == 1)
  )
})


})();
