jb.studio.initPreview = function(preview_window,allowedTypes) {
      var st = jb.studio;
      st.previewWindow = preview_window;
      st.previewjb = preview_window.jb;
      if (jb.studio.compsHistory.length) {
        const compsStr = jb.entries(jb.studio.compsHistory.slice(-1)[0].after)
          .filter(e=>e[1] != st.serverComps[e[0]]).map(e=>[e[0], jb.prettyPrint(e[1])])
        jb.studio.copyComps && jb.studio.copyComps(compsStr)
      } else {
        st.serverComps = st.previewjb.comps;
      }
      st.compsRefHandler.allowedTypes = jb.studio.compsRefHandler.allowedTypes.concat(allowedTypes);

      st.previewjb.studio.studioWindow = window;
      st.previewjb.studio.previewjb = st.previewjb;
      st.previewjb.http_get_cache = {}
      st.previewjb.ctxByPath = {}
      jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()

      st.initEventTracker();
      if (preview_window.location.href.match(/\/studio-helper/))
        st.previewjb.studio.initEventTracker();
      ['jb-component','jb-param','studio.data-comp-inspector'].forEach(comp=>st.previewjb.component(comp,jb.comps[comp]));

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
    template: (cmp,state,h) => h('iframe', {
          id:'jb-preview',
          sandbox: 'allow-same-origin allow-forms allow-scripts',
          frameborder: 0,
          class: 'preview-iframe',
          width: cmp.ctx.vars.$model.width,
          height: cmp.ctx.vars.$model.height,
          src: (state.entry_file ? `/${state.entry_file}` : `/project/${state.project}`) + `?${state.cacheKiller}&wspy=preview`
      }),
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
        const ctrl = jb.studio.previewjb.comps[page] && jb.studio.previewjb.comps[page].type == 'data' ? 'studio.data-comp-inspector' : null;
        return jb.resources.studio.page ? [{page, ctrl}] : []
      });

jb.component('studio.data-comp-inspector', { /* studio.dataCompInspector */
  type: 'control',
  impl: group({
    controls: [
      label(ctx => {debugger; return 'hello'})
    ],
    features: variable({
      name: 'activateDataToDebug',
      value: ctx => {
        var _jb = jb.studio.previewjb;
        var dataCompToDebug = ctx.vars.DataToDebug;
        var debugCtx = ctx.setVars({debugSourceRef: true});
        var inputData = _jb.comps[dataCompToDebug] && debugCtx.exp(_jb.comps[dataCompToDebug].sampleInput || '');
        debugCtx.setData(inputData)
          .run({$: dataCompToDebug })
    }
    })
  })
})

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

