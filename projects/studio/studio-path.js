jb.extension('studio', 'path', {
  $phase: 40,
  initExtension() { 
	jb.watchableComps.startWatch()
	  return { 
		previewjb: jb,
  }},
  execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.core.jbCtx().run(...args),
  isStudioCmp: id => (jb.path(jb.comps,[id,jb.core.CT,'location',0]) || '').indexOf('projects/studio') != -1,
})

jb.component('jbm.vDebugger', {
  type: 'jbm',
  impl: jbm.child('vDebugger', initJb.usingProjects('studio'))
})
