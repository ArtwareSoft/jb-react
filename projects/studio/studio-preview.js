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
    {id: 'style', type: 'preview-style', dynamic: true, defaultValue: studio.previewWidgetImpl()},
    {id: 'width', as: 'number'},
    {id: 'height', as: 'number'}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      init: cmp => {
        const host = ctx.exp('%$studio/host%')
        if (host && st.projectHosts[host]) {
          cmp.state.loadingMessage = 'loading project from ' + host + '::' + ctx.exp('%$studio/hostProjectId%')
          return st.projectHosts[host].projectFiles(ctx.exp('%$studio/hostProjectId%'))
            .then(res => cmp.setState({projectHostResult: res}))
        }
        let entry_file = ctx.exp('%$studio/entry_file%'), project = ctx.exp('%$studio/project%')
        if (!entry_file && !project) {
          project = 'hello-jbart'
          cmp.ctx.run(writeValue('%$studio/project%',project))
          const entryFolder = location.href.indexOf('studio-cloud.html') != -1 ? './' : '/bin/studio/'
          entry_file = `${entryFolder}hello-jbart-cloud.html`
        }
        const cacheKiller =  'cacheKiller='+(''+Math.random()).slice(10)
        const src = (entry_file ? `${entry_file}` : `/project/${project}`) + `?${cacheKiller}&wspy=preview`
        cmp.state.src = src
        document.title = project + ' with jBart';
      },
    })
})

jb.component('studio.preview-widget-impl', { /* studio.previewWidgetImpl */
  type: 'preview-style',
  impl: customStyle({
    template: (cmp,{loadingMessage, src,projectHostResult},h) => {
      if (loadingMessage)
        return h('p',{class: 'loading-message'},loadingMessage)
      if (projectHostResult) {
        h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width: cmp.ctx.vars.$model.width,
          height: cmp.ctx.vars.$model.height,
          src: "javascript:'"+projectHostResult.html+"'"
        })
      }
      return h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width: cmp.ctx.vars.$model.width,
          height: cmp.ctx.vars.$model.height,
          src
    })
  },
    css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; }'
  })
})

})()