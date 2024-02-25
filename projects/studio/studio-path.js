extension('studio', 'path', {
  $phase: 40,
  initExtension() { 
	  jb.watchableComps.startWatch()
	  return { previewjb: jb}
  },
  execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.core.jbCtx().run(...args),
  isStudioCmp: id => (jb.path(jb.comps[id],['$location','path']) || '').match(/studio|testers-ui|probe|data-browse/),
})

component('jbm.vDebugger', {
  type: 'jbm<jbm>',
  impl: child('vDebugger', { sourceCode: project('studio') })
})
