(function() {
var st = jb.studio;

st.modified = {};

st.scriptChange.subscribe(e=>{
	var comp = e.path[0];
	if (!st.modified[comp]) {
		st.modified[comp] = { original : e.before || '' }
	}
})

jb.component('studio.save-components', {
	params: [
		{ id: 'force',as: 'boolean', type: 'boolean' }
	],
	impl : (ctx,force) => 
		jb.rx.Observable.from(jb.entries(st.modified))
			.filter(x=>x)
			.concatMap(toSave=>{
				var comp = toSave[0], val = toSave[1];
				st.message('saving ' + comp);
				if (force && !val.original)
					val.original = `jb.component('${comp}', {`;

				return $.ajax({ 
					url: `/?op=saveComp&comp=${comp}&project=${ctx.exp('%$studio/project%')}&force=${force}`, 
					type: 'POST', 
					data: JSON.stringify({ original: val && val.original, toSave: st.compAsStr(comp) }),
					headers: { 'Content-Type': 'application/json; charset=UTF-8' } 
				}).then(
					res=>({ res: res , comp: comp }),
					e=> { throw { e: e , comp: comp } }
				)

				// return fetch(`/?op=saveComp&comp=${comp}&project=${ctx.exp('%$studio/project%')}&force=${force}`, {
				// 	method: 'post',  
				// 	body: JSON.stringify({ original: val && val.original, toSave: st.compAsStr(comp) }),
				//     headers: { 'Content-type': 'application/json; charset=UTF-8' },  
				// })
			})
			.catch(e=>{
				st.message('error saving: ' + e.e);
				jb.logException(e,'error while saving ' + e.comp)
			})
			.subscribe(entry=>{
				var result = entry.res;
				st.message((result.type || '') + ': ' + (result.desc || '') + (result.message || ''), result.type != 'success');
				if (result.type == 'success')
					delete st.modified[entry.comp];
			})
});

})();