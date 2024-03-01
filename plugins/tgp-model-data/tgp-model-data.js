using('loader')

extension('tgp', 'modelData', {
	tgpModelData(settings) {
		const filePath = settings.filePath && jb.loader.shortFilePath(settings.filePath)
		const plugin = settings.plugin || settings.filePath && jb.loader.pluginOfFilePath(filePath)
		const pluginsSource = settings.plugins || plugin && [...jb.plugins[plugin].dependent,plugin] || []
		const compsAr = jb.entries(jb.comps).filter(([k,comp]) => pluginsSource.includes(comp.$plugin) && !comp.$db).map(([id,comp]) => ({id, ...comp}))
		Object.values(compsAr).forEach(c=>{delete c.impl})
		const comps = jb.objFromEntries(compsAr.map(comp=>[comp.id,comp]))
		const plugins = jb.objFromEntries(pluginsSource.map(id=>jb.plugins[id]).filter(p=>p.proxies)
			.map(({id,proxies,using,dsl,dslOfFiles,files})=>({id,proxies,dsl,dslOfFiles,files: files.map(({path}) => path) })).map(p=>[p.id,p]))
		const typeRules = jb.macro.typeRules
		
		return { filePath, comps, plugins, typeRules }
	},
})

component('tgpModelData.byFilePath', {
  params: [
	{id: 'filePath', as: 'string'}
  ],
  impl: ({},filePath) => jb.tgp.tgpModelData({filePath})
})
