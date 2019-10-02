(function() {

const st = jb.studio;

st.changedComps = function() {
  if (!st.compsHistory || !st.compsHistory.length) return []

  const changedComps = jb.entries(st.compsHistory.slice(-1)[0].after).filter(e=>e[1] != st.serverComps[e[0]])
  if (changedComps.map(e=>e[0]).indexOf('call') != -1) {
    jb.logError('bug. servers comps differ from history')
    return []
  }
  return changedComps
}

jb.ui.waitFor = function(check,times,interval) {
  if (check())
    return Promise.resolve(1);

  times = times || 300;
  interval = interval || 50;

  return new Promise((resolve,fail)=>{
    function wait_and_check(counter) {
      if (counter < 1)
        return fail();
      setTimeout(() => {
      	const v = check();
        if (v)
          resolve(v);
        else
          wait_and_check(counter-1)
      }, interval);
    }
    return wait_and_check(times);
  })
}

st.initPreview = function(preview_window,allowedTypes) {
      const changedComps = st.changedComps()

      st.previewWindow = preview_window;
      st.previewjb = preview_window.jb;
      ['jb-component','jb-param'].forEach(comp=>st.previewjb.component(comp,jb.comps[comp]));
      st.serverComps = st.previewjb.comps;
      st.previewjb.studio.studioWindow = window;
      st.previewjb.studio.previewjb = st.previewjb;

      // reload the changed components and rebuild the history
      st.initCompsRefHandler(st.previewjb, allowedTypes)
      changedComps.forEach(e=>{
        //st.reloadCompInPreviewWindow && st.reloadCompInPreviewWindow(e[0],jb.prettyPrint(e[1]))
        st.compsRefHandler.resourceReferred(e[0])
        st.writeValue(st.compsRefHandler.refOfPath([e[0]]), eval(`(${jb.prettyPrint(e[1])})`)) // update the history for future save
      })

      st.previewjb.http_get_cache = {}
      st.previewjb.ctxByPath = {}
      //jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()

      st.initEventTracker();
      if (preview_window.location.href.match(/\/studio-helper/))
        st.previewjb.studio.initEventTracker();

			fixInvalidUrl()

			function fixInvalidUrl() {
        if (location.pathname.indexOf('/project/studio/') != 0) return;
				var profile_path = location.pathname.split('/project/studio/').pop().split('/')[2] || '';
        if (!profile_path || jb.studio.valOfPath(profile_path,true) != null) return;
				while (profile_path && jb.studio.valOfPath(profile_path,true) == null)
					profile_path = jb.studio.parentPath(profile_path);
				window.location.pathname = location.pathname.split('/').slice(0,-1).concat([profile_path]).join('/')
			}
}

jb.component('studio.preview-widget-impl', { /* studio.previewWidgetImpl */
  type: 'preview-style',
  impl: customStyle({
    template: (cmp,state,h) => {
      if (!state.entry_file && !state.project)
        state.entry_file = './hello-jbart-cloud.html'
      return h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width: cmp.ctx.vars.$model.width,
          height: cmp.ctx.vars.$model.height,
          src: (state.entry_file ? `${state.entry_file}` : `/project/${state.project}`) + `?${state.cacheKiller}&wspy=preview`
      })
    },
    css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; }'
  })
})

jb.component('studio.refresh-preview', { /* studio.refreshPreview */
  type: 'action',
  impl: ctx => {
    jb.ui.garbageCollectCtxDictionary(true);
    jb.studio.previewjb.ui.garbageCollectCtxDictionary(true);
    //jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()
    ctx.run(refreshControlById('preview-parent'))
  }
})

jb.component('studio.set-preview-size', { /* studio.setPreviewSize */
  type: 'action',
  params: [
    {id: 'width', as: 'number'},
    {id: 'height', as: 'number'}
  ],
  impl: (ctx,width,height) => {
    document.querySelector('.preview-iframe').style.width = `${width}px`
    if (width) {
      document.querySelector('.preview-iframe').style.width = `${width}px`
      document.querySelector('.preview-iframe').setAttribute('width',width);
    }
    if (height) {
      document.querySelector('.preview-iframe').style.height = `${height}px`
      document.querySelector('.preview-iframe').setAttribute('height',height);
    }
  }
})

jb.component('studio.wait-for-preview-iframe', { /* studio.waitForPreviewIframe */
  impl: _ =>
    jb.ui.waitFor(()=>
      jb.studio.previewWindow)
})

jb.studio.pageChange = jb.ui.resourceChange.filter(e=>e.path.join('/') == 'studio/page')
      .startWith(1)
      .flatMap(e=> {
        const page = jb.resources.studio.project + '.' + jb.resources.studio.page;
        return jb.resources.studio.page ? [{page}] : []
      });

jb.component('studio.preview-widget', { /* studio.previewWidget */
  type: 'control',
  params: [
    {
      id: 'style',
      type: 'preview-style',
      dynamic: true,
      defaultValue: studio.previewWidgetImpl()
    },
    {id: 'width', as: 'number'},
    {id: 'height', as: 'number'}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      init: cmp => {
        Object.assign(cmp.state,ctx.exp('%$studio%'));
        cmp.state.cacheKiller = 'cacheKiller='+(''+Math.random()).slice(10);
        document.title = cmp.state.project + ' with jBart';
      },
    })
})

})()