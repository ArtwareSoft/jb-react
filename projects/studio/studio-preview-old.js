// (function() {

// const st = jb.studio;
// // var { waitFor, prettyPrint } = jb.macro

// st.changedComps = () => {
//   if (!jb.watchableComps.compsHistory || !jb.watchableComps.compsHistory.length) return []

//   const changedComps = jb.utils.unique(jb.watchableComps.compsHistory.map(e=>jb.path(e,'opEvent.path.0')))
//     .filter(id=> st.previewjb.comps[id] !== st.serverComps[id])
//   return changedComps.map(id=>[id,st.previewjb.comps[id]])
// }

// st.initStudioEditing = () => {
//   if (st.previewjb.comps['dialog.studioPickDialog']) return
//   jb.log('studio init editing service',{})
//   st.previewWindow.eval(`jb.ns('${Object.keys(jb.core.macroNs).join(',')}')`)
//   jb.entries(jb.comps)
//     .filter(e=>st.isStudioCmp(e[0]) || !st.previewjb.comps[e[0]])
//     .forEach(e=>st.copyCompFromStudioToPreview(e))
// }

// jb.component('studio.editingService',{
// 	type: 'service',
// 	impl: () => ({ init: () => st.initStudioEditing() })
// })

// jb.component('studio.fetchProjectSettings', {
//   impl: ctx => {
//     const host = ctx.run(firstSucceeding('%$queryParams/host%','studio'))
//     if (host && jb.projectHosts[host]) {
//       const project = ctx.exp('%$studio/project%')
//       document.title = `${project} with jBart`
//       const hostProjectId = ctx.exp('%$queryParams/hostProjectId%')
//       jb.log('fetch project settings using projectHost',{host,hostProjectId,project})
//       return jb.projectHosts[host].fetchProjectSettings(hostProjectId,project)
//   //      .then(x=>jb.delay(2000).then(()=>{debugger; return x})) // debug point for vscode
//         .then(projectSettings => {
//           jb.log('project settings fetched',{host,hostProjectId,projectSettings})
//           ctx.run(writeValue('%$studio/project%', projectSettings.project))
//           ctx.run(writeValue('%$studio/projectSettings%', projectSettings))
//           return projectSettings
//         })
//     }
//   }
// })

// st.copyCompFromStudioToPreview = function(e) {
//   st.previewjb.comps[e[0]] = { ...e[1], [jb.core.location] : [e[1][jb.core.location][0], e[1][jb.core.location][1]]}
// }

// jb.ui.renderWidgetInStudio = function(profile,top) {
//   let parentAccessible = !!jb.ui.parentFrameJb()
//   jb.log('render widget in studio',{profile,top,parentAccessible,frame: jb.prame})
//   if (parentAccessible && jb.frame.parent != jb.frame)
//     jb.ui.parentFrameJb().studio.initPreview(jb.frame,[Object.getPrototypeOf({}),Object.getPrototypeOf([])])

//   let currentProfile = profile
//   let lastRenderTime = 0, fixedDebounce = 500

//   const studioWin = jb.studio.studioWindow
//   if (studioWin) { // listen to script updates
//       const st = studioWin.jb.studio
//       const {project,page} = studioWin.jb.db.resources.studio
//       if (project && page)
//           currentProfile = {$: page}

//       const {pipe,debounceTime,filter,subscribe} = jb.callbag
//       pipe(st.pageChange, filter(({page})=>page != currentProfile.$), subscribe(({page})=> doRender(page)))
      
//       pipe(st.scriptChange, filter(e=>isCssChange(st,e.path)),
//         subscribe(({path}) => {
//           let featureIndex = path.lastIndexOf('features')
//           if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
//           const ctrlPath = path.slice(0,featureIndex).join('~')
//           const elems = Array.from(document.querySelectorAll('[jb-ctx]'))
//             .map(elem=>({elem, ctx: jb.ctxDictionary[elem.getAttribute('jb-ctx')] }))
//             .filter(e => e.ctx && e.ctx.path == ctrlPath)
//           elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: true}))
//       }))

//       pipe(st.scriptChange, filter(e=>!isCssChange(st,e.path)),
//           filter(e=>(jb.path(e,'path.0') || '').indexOf('dataResource.') != 0), // do not update on data change
//           debounceTime(() => Math.min(2000,lastRenderTime*3 + fixedDebounce)),
//           subscribe(() =>{
//               doRender()
// //              jb.ui.dialogs.reRenderAll()
//       }))
//   }
//   const elem = top.ownerDocument.createElement('div')
//   top.appendChild(elem)

//   doRender()

//   function isCssChange(st,path) {
//     const compPath = pathOfCssFeature(st,path)
//     return compPath && (st.compNameOfPath(compPath) || '').match(/^(css|layout)/)
//   }

//   function pathOfCssFeature(st,path) {
//     const featureIndex = path.lastIndexOf('features')
//     if (featureIndex == -1) {
//       const layoutIndex = path.lastIndexOf('layout')
//       return layoutIndex != -1 && path.slice(0,layoutIndex+1).join('~')
//     }
//     const array = Array.isArray(st.valOfPath(path.slice(0,featureIndex+1).join('~')))
//     return path.slice(0,featureIndex+(array?2:1)).join('~')
//   }

//   function doRender(page) {
//         if (page) currentProfile = {$: page}
//         const profileToRun = ['dataTest','uiTest'].indexOf(jb.path(jb.comps[currentProfile.$],'impl.$')) != -1 ? { $: 'test.showTestInStudio', testId: currentProfile.$} : currentProfile
//         const cmp = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx()).run(profileToRun)
//         const start = new Date().getTime()
//         jb.ui.unmount(top)
//         top.innerHTML = ''
//         jb.ui.render(jb.ui.h(cmp),top)
//         lastRenderTime = new Date().getTime() - start
//   }
// }

// st.initPreview = function(preview_window,allowedTypes) {
//   jb.log('start load preview',{})
//   const changedComps = st.changedComps()

//   st.previewWindow = preview_window
//   st.previewWindow.jbUri = 'preview'
//   st.previewjb = preview_window.jb;
//   ['jbComponent','jbParam','feature.contentEditable'].forEach(id=> st.copyCompFromStudioToPreview([id,jb.comps[id]]))
//   st.serverComps = st.previewjb.comps
//   st.previewjb.studio.studioWindow = window
//   st.previewjb.studio.previewjb = st.previewjb
//   st.previewjb.studio.studiojb = jb
//   st.previewjb.lastRun = {}

//   ;(jb.frame.jbDocsDiffFromFiles || []).forEach(doc=> {
//       try {
//         st.previewWindow.eval(doc) // used by vscode to reload the content of unsaved doc
//       } catch (e) {}
//   })

//   st.initReplaceableCompsRefHandler(st.compsRefOfjbm(st.previewjb), {allowedTypes})

//   changedComps.forEach(e=>{
//     st.compsRefHandler.makeWatchable(e[0])
//     st.writeValue(st.compsRefHandler.refOfPath([e[0]]), eval(`(${jb.utils.prettyPrint(e[1],{noMacros: true})})`), new jb.core.jbCtx()) // update the history for future save
//     jb.val(st.compsRefHandler.refOfPath([e[0]]))[jb.core.location] = e[1][jb.core.location]
//   })
//   jb.entries(st.previewWindow.JSON.parse(st.resourcesFromPrevRun || '{}')).forEach(e=>st.previewjb.db.resource(e[0],e[1]))

//   st.previewjb.http_get_cache = {}
//   st.previewjb.ctxByPath = {}
//   st.previewjb.cbLogByPath = {}

//   jb.exp('%$studio/settings/activateWatchRefViewer%','boolean') && st.activateWatchRefViewer();

//   fixInvalidUrl()
//   jb.frame.jbStartCommand && jb.ui.extendWithServiceRegistry().run(jb.frame.jbStartCommand) // used by vscode to open jbEditor
//   jb.log('end load preview',{project: jb.exp('%$studio/projectSettings/project%')})

//   function fixInvalidUrl() {
//     if (location.pathname.indexOf('/project/studio/') != 0) return;
//     var profile_path = location.pathname.split('/project/studio/').pop().split('/')[2] || '';
//     if (!profile_path || jb.studio.valOfPath(profile_path,true) != null) return;
//     while (profile_path && jb.studio.valOfPath(profile_path,true) == null)
//       profile_path = jb.studio.parentPath(profile_path);
//     window.location.pathname = location.pathname.split('/').slice(0,-1).concat([profile_path]).join('/')
//   }
// }

// jb.component('studio.refreshPreview', {
//   type: 'action',
//   impl: ctx => {
//     if (jb.frame.jbInvscode)
//       return ctx.run(studio.reOpenStudio())
//     jb.ui.garbageCollectCtxDictionary(true,true)
//     jb.studio.previewjb.ui.garbageCollectCtxDictionary(true,true)
//     jb.studio.resourcesFromPrevRun = st.previewWindow.JSON.stringify(jb.studio.previewjb.db.resources)
//     //jb.studio.refreshPreviewWidget && jb.studio.refreshPreviewWidget()
//     //jb.ui.dialogs.reRenderAll(ctx)
//     ctx.run(refreshControlById('preview-parent'))
//   }
// })

// jb.component('studio.setPreviewSize', {
//   type: 'action',
//   params: [
//     {id: 'width', as: 'string'},
//     {id: 'height', as: 'string'},
//     {id: 'zoom', as: 'number'}
//   ],
//   impl: (ctx,width,height,zoom) => {
//     ['html','body','#studio','#studio>div','#preview-parent'].map(s => document.querySelector(s)).filter(x=>x)
//       .forEach(el => {el.style.height = '100%'; el.style.width = '100%'} )
    
//     const zoomRatio = zoom <= 10 ? zoom / 10 : Math.pow(1.2, zoom-10)

//     document.querySelector('.preview-iframe').style.width = jb.ui.withUnits(width)
//     if (width) {
//       document.querySelector('.preview-iframe').style.width = jb.ui.withUnits(width)
//       document.querySelector('.preview-iframe').setAttribute('width',width);
//     }
//     if (height) {
//       document.querySelector('.preview-iframe').style.height = jb.ui.withUnits(height)
//       document.querySelector('.preview-iframe').setAttribute('height',height);
//     }
//     if (zoomRatio)
//       document.querySelector('#jb-preview').contentDocument.body.style.zoom = zoomRatio
//   }
// })

// jb.component('studio.waitForPreviewIframe', {
//   impl: waitFor(()=> jb.path(jb.studio,'previewWindow.jb.widgetInitialized'))
// })

// const {pipe,startWith,filter,flatMap} = jb.callbag
// jb.studio.pageChange = pipe(jb.ui.resourceChange(), filter(e=>e.path.join('/') == 'studio/page'),
//       startWith(1),
//       flatMap(e=> {
//         const page = jb.db.resources.studio.page
//         return page ? [{page}] : []
// }))

// jb.component('studio.previewWidget', {
//   type: 'control',
//   params: [
//     {id: 'style', type: 'preview-style', dynamic: true, defaultValue: studio.previewWidgetImpl()}
//   ],
//   impl: ctx => jb.ui.ctrl(ctx)
// })

// jb.component('studio.previewWidgetImpl', {
//   type: 'preview-style',
//   impl: customStyle({
//     template: ({},{width,height,projSettingsStr },h) => {
//       return h('iframe', {
//           id:'jb-preview',
//           sandbox: 'allow-same-origin allow-forms allow-scripts',
//           frameborder: 0,
//           class: 'preview-iframe',
//           width, height,
//           src: `javascript: parent.jb.studio.injectProjectToPreview(this,${projSettingsStr})`
//         })
//     },
//     features: [
//       calcProp('width','%$studio/preview/width%'),
//       calcProp('height','%$studio/preview/height%'),
//       calcProp('projSettingsStr',prettyPrint('%$studio/projectSettings%'))
//     ],
//     css: '{box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px; background: var(--jb-preview-background) }'
//   })
// })

// st.injectProjectToPreview = function(previewWin,projectSettings) {
//   const baseProjUrl = jb.frame.jbBaseProjUrl ? `jbBaseProjUrl = '${jbBaseProjUrl}'` : ''
//   const moduleUrl = jb.frame.jbModuleUrl ? `jbModuleUrl = '${jbModuleUrl}'` : ''
//   const baseUrl = jb.frame.jbModuleUrl ? { baseUrl: jbBaseProjUrl } : {}

//   const vscodeZoomFix = jb.frame.jbInvscode? 'style="zoom: 0.8"' : ''
//   const html = `<!DOCTYPE html>
// <html>
// <head>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <script type="text/javascript">
//     ${baseProjUrl}
//     ${moduleUrl}
//     jbProjectSettings = ${JSON.stringify({...projectSettings,...baseUrl, prefix: '!preview!'})}
//   </script>
//   <script type="text/javascript" src="${st.host.jbLoader}"></script>
// </head>
// <body ${vscodeZoomFix}>
//   <div id="main"></div>
//   <script>
//     window.jb_initWidget && jb_initWidget().then(()=> jb.spy.initSpyByUrl && jb.spy.initSpyByUrl())
//   </script>
// </body>
// </html>`
//     jb.log('inject project into preview',{html,projectSettings,baseProjUrl,moduleUrl,baseUrl})
//     previewWin.document.write(html)
// }

// jb.component('jbm.iframe', {
//   type: 'jbm',
//   params: [
//       {id: 'name', as: 'string', mandatory: true},
//       {id: 'libs', as: 'array' },
//       {id: 'jsFiles', as: 'array' },
//   ],    
//   impl: (ctx,name,libs,jsFiles) => {
//       if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
//       if (typeof document == 'undefined') 
//           return jb.logError('can not create iframe under current frame',{frame: jb.frame, jb, ctx})
//       const childUri = `${jb.uri}•${name}`
//       const distPath = jb.jbm.pathOfDistFolder()
//       const spyParam = ((jb.path(jb.frame,'location.href')||'').match('[?&]spy=([^&]+)') || ['', ''])[1]
//       const baseUrl = jb.path(jb.frame,'location.origin') || jb.baseUrl || ''
//       const settings = { uri: childUri, libs: libs.join(','), baseUrl, distPath, jsFiles }
//       const jbObj = { uri: childUri, baseUrl, distPath }
//       const jb_loader_code = [jb_dynamicLoad.toString(),jb_loadProject.toString(),jbm_create.toString(),
//           jb_modules ? `self.jb_modules= ${JSON.stringify(jb_modules)}` : ''
//       ].join(';\n\n')
//       const iframeCode = `
//       ${jb_loader_code};
//       jb = ${JSON.stringify(jbObj)}
//       jb_loadProject(${JSON.stringify(settings)}).then(() => {
//           self.spy = jb.spy.initSpy({spyParam: '${spyParam}'})
//           self.jb.parent = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
//           self.loaded = true
//       })`        

//       const iframe = document.createElement('iframe')
//       iframe.src = `data:text/html;charset=utf-8,<script>${encodeURI(iframeCode)}</script>;`
//       document.body.appendChild(iframe)
//       jb.jbm.childJbms[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(iframe,childUri))
//       const promise = jb.exec(pipe(waitFor(() => jb.path(iframe,'contentWindow.loaded'))))
//       promise.uri = workerJbm.uri
//       return promise
//   }
// })

// })()