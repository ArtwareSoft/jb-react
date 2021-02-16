(function() { var st = jb.studio;

st.message = function(message,error) {
  const el = document.querySelector('.studio-message');
  el.innerHTML = ''
	el.textContent = message;
  el.style.background = error ? 'red' : '#327DC8';
  st.animateMessage(el)
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
  st.animateMessage(el)
}

st.animateMessage = function (el) {
  el.style.marginTop = 0;
  // el.style.animation = '';
  // jb.delay(100).then(()=>	el.style.animation = 'slide_from_top 5s ease')
  jb.delay(6000).then(()=> el.style.marginTop = '-50px')
}

// ********* Components ************
jb.component('studio.projectId', {
  impl: ctx => jb.macroName(ctx.exp('%$studio/project%'))
})

jb.component('studio.currentPagePath', {
  impl: '%$studio/page%'
})

jb.component('studio.currentProfilePath', {
  impl: firstSucceeding(
    '%$simulateProfilePath%',
    '%$studio/profile_path%',
    studio.currentPagePath()
  )
})

jb.component('studio.message', {
  type: 'action',
  params: [
    {id: 'message', as: 'string'}
  ],
  impl: (ctx,message) => st.message(message)
})

jb.component('studio.redrawStudio', {
  type: 'action',
  impl: ctx => st.redrawStudio && st.redrawStudio()
})

jb.component('studio.lastEdit', {
  description: 'latest edited path',
  type: 'data',
  params: [
    {id: 'justNow', as: 'boolean', type: 'boolean', defaultValue: true}
  ],
  impl: (ctx,justNow) => {
		const now = new Date().getTime();
		const lastEvent = st.compsHistory.slice(-1).map(x=>x.opEvent).filter(x=>x)
      .filter(r=>	!justNow || now - r.timeStamp < 1000)[0]
    if (!lastEvent) return
    const insertedIndex = jb.path(lastEvent.op.$splice,'0.2') && jb.path(lastEvent.op.$splice,'0.0')
      || jb.path(lastEvent.op.$push) && lastEvent.oldVal.length
		const res = [...lastEvent.path, insertedIndex].filter(x=>x != null)
		if (res)
			return res.join('~')
	}
})

jb.component('studio.gotoLastEdit', {
  type: 'action',
  impl: runActions(jb.delay(10), studio.gotoPath(studio.lastEdit()))
})

jb.component('studio.compSource', {
  params: [
    {id: 'comp', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: (context,comp) =>	st.compAsStr(comp.split('~')[0])
})

jb.component('studio.unMacro', {
  impl: ({data}) => data && data.replace(/([A-Z])/g, (all, s) => ' ' + s.toLowerCase()),
})

jb.component('studio.watchPath', {
  type: 'feature',
  category: 'group:0',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component, including all features and variables', type: 'boolean'},
    {id: 'delay', as: 'number', description: 'delay in activation, can be used to set priority'}
  ],
  impl: (ctx,path) => ({
	  watchRef: {refF: () => st.refOfPath(path), ...ctx.params},
  })
})

jb.component('studio.watchScriptChanges', {
  type: 'feature',
  params: [
    {id: 'path', as: 'string', description: 'under this path, empty means any path'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
  ],
  impl: watchRef({ref: '%$studio/lastStudioActivity%', allowSelfRefresh: '%$allowSelfRefresh%'}) //followUp.flow(studio.scriptChange(), rx.log('watch script refresh'), sink.refreshCmp())
})

jb.component('studio.watchComponents', {
  type: 'feature',
  impl: followUp.flow(studio.scriptChange(), rx.filter('%path/length%==1'), sink.refreshCmp())
})


})();
