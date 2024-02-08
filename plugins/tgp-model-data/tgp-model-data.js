extension('tgp', 'modelData', {
    pluginOfFilePath: filePath => Object.values(jb.plugins).filter(p=>p.files.find(f=>f.path == filePath)).map(p=>p.id)[0],
	tgpModelData(settings) {
		const filePath = settings.filePath && jb.tgp.shortFilePath(settings.filePath)
		const plugin = settings.plugin || jb.tgp.pluginOfFilePath(filePath)
		const pluginsAr = plugin ? [...jb.plugins[plugin].dependent,plugin] : []
		const compsAr = Object.values(jb.comps).map(c=>c[jb.core.CT]).filter(c=>c && c.fullId).filter(c=>pluginsAr.includes(c.plugin.id))
			.map(ct=>({...jb.comps[ct.fullId],id: ct.fullId, plugin: ct.plugin.id, dslType: ct.dslType, location: ct.location, 
					params: fixParams(jb.comps[ct.fullId])}))
		Object.values(compsAr).forEach(c=>{delete c.impl; delete c[jb.core.CT]})
		const comps = jb.objFromEntries(compsAr.map(comp=>[comp.id,comp]))
		const plugins = jb.objFromEntries(pluginsAr.map(id=>jb.plugins[id]).filter(p=>p.proxies)
			.map(({id,proxies,using,dsl,dslOfFiles,files})=>({id,proxies,dsl,dslOfFiles,files: files.map(({path}) => path) })).map(p=>[p.id,p]))

		return { filePath, comps, plugins }

		function fixParams(comp) {
			if (Array.isArray(comp.params))
				return comp.params.map(p=>({...p, $symbolDslType: jb.path(p[jb.core.CT],'dslType')}))
		}
	},
	shortFilePath(filePath) {
        const elems = filePath.split('/').reverse()
		return '/' + elems.slice(0,elems.findIndex(x=> x == 'plugins' || x == 'projects')+1).reverse().join('/')
	}
})

component('langService.tgpModelData', {
  params: [
	{id: 'filePath', as: 'string'}
  ],
  impl: ({},filePath) => jb.tgp.tgpModelData({filePath})
})