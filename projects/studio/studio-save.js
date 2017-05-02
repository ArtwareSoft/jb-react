
jb.studio.modified = {};

jb.studio.modifyOperationsEm.subscribe(e=>{
	var comp = e.comp;
	if (!jb.studio.modified[comp]) {
		jb.studio.modified[comp] = { original : e.before || '' }
	}
})

jb.component('studio.save-components', {
	params: [
		{ id: 'force',as: 'boolean', type: 'boolean' }
	],
	impl : (ctx,force) => 
		jb.rx.Observable.from(jb.entries(jb.studio.modified))
			.filter(x=>x)
			.concatMap(toSave=>{
				var comp = toSave[0], val = toSave[1];
				jb.studio.message('saving ' + comp);
				if (force && !val.original)
					val.original = `jb.component('${comp}', {`;

				return $.ajax({ 
					url: `/?op=saveComp&comp=${comp}&project=${ctx.exp('%$studio/project%')}&force=${force}`, 
					type: 'POST', 
					data: JSON.stringify({ original: val && val.original, toSave: jb.studio.compAsStr(comp) }),
					headers: { 'Content-Type': 'application/json; charset=UTF-8' } 
				}).then(
					res=>({ res: res , comp: comp }),
					e=> { throw { e: e , comp: comp } }
				)

				// return fetch(`/?op=saveComp&comp=${comp}&project=${ctx.exp('%$studio/project%')}&force=${force}`, {
				// 	method: 'post',  
				// 	body: JSON.stringify({ original: val && val.original, toSave: jb.studio.compAsStr(comp) }),
				//     headers: { 'Content-type': 'application/json; charset=UTF-8' },  
				// })
			})
			.catch(e=>{
				jb.studio.message('error saving: ' + e.e);
				jb.logException(e,'error while saving ' + e.comp)
			})
			.subscribe(entry=>{
				var result = entry.res;
				jb.studio.message((result.type || '') + ': ' + (result.desc || '') + (result.jb.studio.message || ''), result.type != 'success');
				if (result.type == 'success')
					delete jb.studio.modified[entry.comp];
			})
});
