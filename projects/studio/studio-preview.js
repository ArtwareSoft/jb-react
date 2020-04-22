(function() {

const st = jb.studio;

st.changedComps = function() {
  if (!st.compsHistory || !st.compsHistory.length) return []

  const changedComps = jb.unique(st.compsHistory.map(e=>jb.path(e,'opEvent.path.0')))
    .filter(id=> st.previewjb.comps[id] !== st.serverComps[id])
  return changedComps.map(id=>[id,st.previewjb.comps[id]])
}

st.initStudioEditing = function() {
  if (st.previewjb.comps['dialog.studioPickDialog']) return
  jb.entries(jb.comps).filter(e=>st.isStudioCmp(e[0]) || !st.previewjb.comps[e[0]]).forEach(e=>
    st.previewjb.comps[e[0]] = { ...e[1], [jb.location] : [e[1][jb.location][0].replace(/!st!/,''), e[1][jb.location][1]]})
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
      ['jbComponent','jbParam','feature.contentEditable'].forEach(comp=>st.previewjb.component(comp,jb.comps[comp]));
      st.serverComps = st.previewjb.comps;
      st.previewjb.studio.studioWindow = window;
      st.previewjb.studio.previewjb = st.previewjb;
      st.previewjb.studio.studiojb = jb;
      st.previewjb.lastRun = {}

      ;(jb.frame.jbDocsDiffFromFiles || []).forEach(doc=> st.previewWindow.eval(doc)) // used by vscode to reload the content of unsaved doc

      st.initCompsRefHandler(st.previewjb, allowedTypes)
      changedComps.forEach(e=>{
        st.compsRefHandler.resourceReferred(e[0])
        st.writeValue(st.compsRefHandler.refOfPath([e[0]]), eval(`(${jb.prettyPrint(e[1],{noMacros: true})})`), new jb.jbCtx()) // update the history for future save
        jb.val(st.compsRefHandler.refOfPath([e[0]]))[jb.location] = e[1][jb.location]
      })
      jb.entries(st.previewWindow.JSON.parse(st.resourcesFromPrevRun || '{}')).forEach(e=>st.previewjb.resource(e[0],e[1]))

      st.previewjb.http_get_cache = {}
      st.previewjb.ctxByPath = {}

      jb.exp('%$studio/settings/activateWatchRefViewer%','boolean') && st.activateWatchRefViewer();
      jb.exec(writeValue('%$studio/projectSettings%',() => JSON.parse(JSON.stringify(preview_window.jbProjectSettings)) ))
      writeValue('%$studio/preview%', () => ({width: 1280, height: 520 })),

      st.previewWindow.workerId = ctx => ctx && ctx.vars.$runAsWorker

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

jb.component('studio.refreshPreview', {
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

jb.component('studio.setPreviewSize', {
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

jb.component('studio.waitForPreviewIframe', {
  impl: () => jb.ui.waitFor(()=> jb.studio.previewWindow)
})

const {pipe,startWith,filter,flatMap} = jb.callbag
jb.studio.pageChange = pipe(jb.ui.resourceChange(), filter(e=>e.path.join('/') == 'studio/page'),
      startWith(1),
      flatMap(e=> {
        const page = jb.exec(studio.currentPagePath())
        return jb.resources.studio.page ? [{page}] : []
}))

jb.component('studio.previewWidget', {
  type: 'control',
  params: [
    {id: 'style', type: 'preview-style', dynamic: true, defaultValue: studio.previewWidgetImpl()},
    {id: 'width', as: 'number'},
    {id: 'height', as: 'number'}
  ],
  impl: ctx => jb.ui.ctrl(ctx, features(
      calcProp('width'),
      calcProp('height'),
      calcProp('host', firstSucceeding('%$queryParams/host%','studio')),
      calcProp('loadingMessage', '{? loading project from %$$props/host%::%$queryParams/hostProjectId% ?}'),
      interactive( (ctx,{cmp}) => {
          const host = ctx.run(firstSucceeding('%$queryParams/host%','studio'))
          if (!ctx.vars.$state.projectLoaded && host && st.projectHosts[host]) {
            const project = ctx.exp('%$studio/project%')
            document.title = `${project} with jBart`;
            return st.projectHosts[host].fetchProject(ctx.exp('%$queryParams/hostProjectId%'),project)
//              .then(x=>jb.delay(5000).then(()=>x))
              .then(projectSettings => {
                console.log(jb.exec('%$studio/project%'),projectSettings.project)
                jb.exec(writeValue('%$studio/project%', projectSettings.project))
                cmp.refresh({ projectLoaded: true, projectSettings },{srcCtx: ctx})
            })
          }
        })
  ))
})

jb.component('studio.previewWidgetImpl', {
  type: 'preview-style',
  impl: customStyle({
    template: (cmp,{width,height, loadingMessage, src, host },h) => {
      if (host && !cmp.state.projectLoaded)
        return h('p',{class: 'loading-message'}, loadingMessage)
      return h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width, height,
          src: cmp.state.projectLoaded ? 
            `javascript: parent.jb.studio.injectProjectToPreview(this,${JSON.stringify(cmp.state.projectSettings)})` : 'javascript: '
        })
    },
    css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; }'
  })
})

st.injectProjectToPreview = function(previewWin,projectSettings) {
const baseProjUrl = jb.frame.jbBaseProjUrl ? `jbBaseProjUrl = '${jbBaseProjUrl}'` : ''
const moduleUrl = jb.frame.jbModuleUrl ? `jbModuleUrl = '${jbModuleUrl}'` : ''
const baseUrl = jb.frame.jbModuleUrl ? { baseUrl: jbBaseProjUrl } : {}

const vscodeZoomFix = jb.frame.jbInvscode? 'style="zoom: 0.8"' : ''
const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="text/javascript">
    ${baseProjUrl}
    ${moduleUrl}
    jbProjectSettings = ${JSON.stringify({...projectSettings,...baseUrl})}
  </script>
  <script type="text/javascript" src="${st.host.jbLoader}"></script>
</head>
<body ${vscodeZoomFix}>
  <script>
    window.jb_initWidget && jb_initWidget()
  </script>
</body>
</html>`
  previewWin.document.write(html)
}

})()