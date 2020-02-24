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
      ['jb-component','jb-param','feature.content-editable'].forEach(comp=>st.previewjb.component(comp,jb.comps[comp]));
      st.serverComps = st.previewjb.comps;
      st.previewjb.studio.studioWindow = window;
      st.previewjb.studio.previewjb = st.previewjb;
      st.previewjb.studio.studiojb = jb;
      st.previewjb.lastRun = {}

      // reload the changed components and rebuild the history
      st.initCompsRefHandler(st.previewjb, allowedTypes)
      changedComps.forEach(e=>{
        st.compsRefHandler.resourceReferred(e[0])
        st.writeValue(st.compsRefHandler.refOfPath([e[0]]), eval(`(${jb.prettyPrint(e[1])})`), new jb.jbCtx()) // update the history for future save
        jb.val(st.compsRefHandler.refOfPath([e[0]]))[jb.location] = e[1][jb.location]
      })
      jb.entries(st.previewWindow.JSON.parse(st.resourcesFromPrevRun || '{}')).forEach(e=>st.previewjb.resource(e[0],e[1]))

      st.previewjb.http_get_cache = {}
      st.previewjb.ctxByPath = {}
      //jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()

      // st.initEventTracker();
      // if (preview_window.location.href.match(/\/studio-helper/))
      //   st.previewjb.studio.initEventTracker();

      jb.exp('%$studio/settings/activateWatchRefViewer%','boolean') && st.activateWatchRefViewer();

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
    jb.ui.garbageCollectCtxDictionary(jb.frame.document.body,true);
    jb.studio.previewjb.ui.garbageCollectCtxDictionary(jb.studio.previewjb.frame.document.body, true);
    jb.studio.resourcesFromPrevRun = st.previewWindow.JSON.stringify(jb.studio.previewjb.resources)
    //jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()
    jb.ui.dialogs.reRenderAll(ctx)
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
    jb.ui.waitFor(()=> jb.studio.previewWindow)
})

jb.studio.pageChange = jb.ui.resourceChange().filter(e=>e.path.join('/') == 'studio/page')
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
  impl: ctx => jb.ui.ctrl(ctx, features(
      calcProp('width','%$$model/width%'),
      calcProp('height','%$$model/height%'),
      calcProp('cacheKiller', () => 'cacheKiller='+(''+Math.random()).slice(10)),
      calcProp('rootName','%$studio/settings/rootName%'),
      calcProp('project','%$studio/project%'),
      calcProp('src', '/project/%$$props/project%?%$$props/cacheKiller%&spy=preview'),
      calcProp('inMemoryProject', () => st.inMemoryProject),
      calcProp('host', '%$queryParams/host%'),
      calcProp('hasHost', ctx => ctx.vars.host && st.projectHosts[ctx.vars.host]),
      calcProp('loadingMessage', data.if('%$$props/inMemoryProject%', '',
        '{? loading project from %$$props/host%::%$queryParams/hostProjectId% ?}')),
      interactive( (ctx,{cmp}) => {
          const host = ctx.exp('%$queryParams/host%')
          if (!st.inMemoryProject && host && st.projectHosts[host]) {
            const project = ctx.exp('%$studio/project%')
            document.title = `${project} with jBart`;
            return st.projectHosts[host].fetchProject(ctx.exp('%$queryParams/hostProjectId%'),project)
              .then(inMemoryProject => cmp.refresh({ inMemoryProject })) 
          }
        })
  ))
})


jb.component('studio.preview-widget-impl', { /* studio.previewWidgetImpl */
  type: 'preview-style',
  impl: customStyle({
    template: (cmp,{width,height, loadingMessage, src },h) => {
      if (!cmp.state.inMemoryProject)
        return h('p',{class: 'loading-message'}, loadingMessage)
      return h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width, height,
          src: cmp.state.inMemoryProject ? "javascript: parent.jb.studio.injectImMemoryProjectToPreview(this)" : src
        })
    },
    css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; }'
  })
})

st.injectImMemoryProjectToPreview = function(previewWin) {
const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="text/javascript">
    jbProjectSettings = ${JSON.stringify(st.inMemoryProject)}
  </script>
  <script type="text/javascript" src="/src/loader/jb-loader.js"></script>
</head>
<body>
  <script>
    window.jb_initWidget && jb_initWidget()
  </script>
</body>
</html>`
  previewWin.document.write(html)
}

})()