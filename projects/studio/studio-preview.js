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
      st.previewjb.lastRun = {}
    
      // reload the changed components and rebuild the history
      st.initCompsRefHandler(st.previewjb, allowedTypes)
      changedComps.forEach(e=>{
        st.compsRefHandler.resourceReferred(e[0])
        st.writeValue(st.compsRefHandler.refOfPath([e[0]]), eval(`(${jb.prettyPrint(e[1])})`)) // update the history for future save
        jb.val(st.compsRefHandler.refOfPath([e[0]]))[jb.location] = e[1][jb.location]
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
        const host = ctx.exp('%$queryParams/host%')
        if (host && st.projectHosts[host]) {
          const project = ctx.exp('%$studio/project%')
          document.title = `${project} with jBart`;
          cmp.state.loadingMessage = 'loading project from ' + host + '::' + ctx.exp('%$queryParams/hostProjectId%')
          return st.projectHosts[host].fetchProject(ctx.exp('%$queryParams/hostProjectId%'),project)
            .then(inMemoryProject => {
              st.inMemoryProject = inMemoryProject
              cmp.setState({loadingMessage: '', inMemoryProject}) 
            })
        }
        let project = ctx.exp('%$studio/project%')
        const rootName = ctx.exp('%$studio/rootName%')
        if (!project) {
          project = rootName
          cmp.ctx.run(writeValue('%$studio/project%',project))
          return st.host.rootExists().then(exists=> {
              if (exists)
                location.reload()
              cmp.state.inMemoryProject = st.inMemoryProject = ctx.run(studio.newInMemoryProject(project,'./'))
              if (st.host.canNotSave) 
                return cmp.setState({})
              return jb.delay(100).then(()=>ctx.run(studio.saveComponents()))
          })
        }
        if (st.inMemoryProject) {
          cmp.state.inMemoryProject = st.inMemoryProject
          document.title = project + ' with jBart';
          return
        }
        const cacheKiller =  'cacheKiller='+(''+Math.random()).slice(10)
        const src = `/project/${project}?${cacheKiller}&wspy=preview`
        cmp.state.src = src
        document.title = project + ' with jBart';
      },
    })
})

st.injectImMemoryProjectToPreview = function(previewWin) {
  const jsToInject = jb.entries(st.inMemoryProject.files).filter(e=>e[0].match(/js$/))
    .map(e => 'eval(' + '`'+ e[1].replace(/`/g,'\\`').replace(/<\/script>/gi,'`+`</`+`script>`+`')  + '`)'
     ).join('\n')
  const injectWithSrc = (st.inMemoryProject.js ||[]).map(jsFile => `<script type="text/javascript" src="${st.inMemoryProject.baseUrl}/${jsFile}"></script>`)
  const cssToInject = jb.entries(st.inMemoryProject.files).filter(e=>e[0].match(/css$/))
    .map(e => `<style>${e[1]}</style>` ).join('\n')
  let html = jb.entries(st.inMemoryProject.files).filter(e=>e[0].match(/html$/))[0][1]
  if (html.match(/<!-- load-jb-scripts-here -->/)) {
    // replace did not work here beacuse of '$'
    const pos = html.indexOf('<!-- load-jb-scripts-here -->'), len = '<!-- load-jb-scripts-here -->'.length
    html = html.slice(0,pos) + [
        st.host.scriptForLoadLibraries(st.inMemoryProject.libs),
        ...injectWithSrc,
        `<script>${jsToInject}</script>`,
        cssToInject].join('\n')
     + html.slice(pos+len)
  }
  
  previewWin.document.write(html)
}

jb.component('studio.preview-widget-impl', { /* studio.previewWidgetImpl */
  type: 'preview-style',
  impl: customStyle({
    template: (cmp,{loadingMessage, src, inMemoryProject},h) => {
      if (loadingMessage)
        return h('p',{class: 'loading-message'}, loadingMessage)
      return h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width: cmp.ctx.vars.$model.width,
          height: cmp.ctx.vars.$model.height,
          src: inMemoryProject ? "javascript: parent.jb.studio.injectImMemoryProjectToPreview(this)" : src
        })
    },
    css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; }'
  })
})

})()