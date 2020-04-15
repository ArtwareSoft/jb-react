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
  impl: pipeline(
    list(studio.projectId(), '%$studio/page%'),
    join('.')
  )
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
			.filter(r=>	!justNow || now - r.timeStamp < 1000)[0];
		const res = lastEvent && (lastEvent.insertedPath || lastEvent.path);
		if (res)
			return res.join('~')
	}
})

jb.component('studio.gotoLastEdit', {
  type: 'action',
  impl: studio.gotoPath(
    studio.lastEdit()
  )
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

})();
