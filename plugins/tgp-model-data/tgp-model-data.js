using('loader')

extension('tgp', 'modelData', {
	tgpModelData(settings) {
		const filePath = settings.filePath && jb.loader.shortFilePath(settings.filePath)
		const plugin = settings.plugin || settings.filePath && jb.loader.pluginOfFilePath(filePath)
		const pluginsSource = settings.plugins || plugin && [...jb.plugins[plugin].dependent,plugin] || []
		const compsAr = jb.entries(jb.comps).map(([k,c]) => [k,c[jb.core.CT]])
			.filter(([k,ct]) => ct && ct.fullId && pluginsSource.includes(ct.plugin.id))
			.map(([id,ct]) => ({id, ...jb.comps[id], plugin: ct.plugin.id, dslType: ct.dslType, location: ct.location, 
					params: fixParams(jb.comps[ct.fullId])}))
		Object.values(compsAr).forEach(c=>{delete c.impl; delete c[jb.core.CT]})
		const comps = jb.objFromEntries(compsAr.map(comp=>[comp.id,comp]))
		const plugins = jb.objFromEntries(pluginsSource.map(id=>jb.plugins[id]).filter(p=>p.proxies)
			.map(({id,proxies,using,dsl,dslOfFiles,files})=>({id,proxies,dsl,dslOfFiles,files: files.map(({path}) => path) })).map(p=>[p.id,p]))
		const typeRules = jb.macro.typeRules
		
		return { filePath, comps, plugins, typeRules }

		function fixParams(comp) {
			if (Array.isArray(comp.params))
				return comp.params.map(p=>({...p, $symbolDslType: jb.path(p[jb.core.CT],'dslType')}))
		}
	},
})

component('tgpModelData.byFilePath', {
  params: [
	{id: 'filePath', as: 'string'}
  ],
  impl: ({},filePath) => jb.tgp.tgpModelData({filePath})
})
