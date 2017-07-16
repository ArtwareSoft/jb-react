(function() {
var st = jb.studio;

jb.component('studio.save-components', {
	type: 'action',
	params: [
		{ id: 'force',as: 'boolean', type: 'boolean' }
	],
	impl : (ctx,force) =>
		jb.rx.Observable.from(Object.getOwnPropertyNames(st.previewjb.comps))
			.filter(id=>id.indexOf('$jb') != 0)
			.filter(id=>st.previewjb.comps[id] != st.serverComps[id])
			.concatMap(id=>{
				var original = st.serverComps[id] ? st.prettyPrintComp(id,st.serverComps[id]) : '';
				st.message('saving ' + id);
				if (force && !original)
					original = `jb.component('${id}', {`;

				return $.ajax({
					url: `/?op=saveComp&comp=${id}&project=${ctx.exp('%$studio/project%')}&force=${force}`,
					type: 'POST',
					data: JSON.stringify({ original: original, toSave: st.compAsStr(id) }),
					headers: { 'Content-Type': 'application/json; charset=UTF-8' }
				}).then(
					res=>({ res: res , id: id }),
					e=> { throw { e: e , id: id } }
				)
			})
			.catch(e=>{
				st.message('error saving: ' + e.e);
				return jb.logException(e,'error while saving ' + e.id) || []
			})
			.subscribe(entry=>{
				var result = entry.res;
				st.message((result.type || '') + ': ' + (result.desc || '') + (result.message || ''), result.type != 'success');
				if (result.type == 'success')
					st.serverComps[entry.id] = st.previewjb.comps[entry.id];
			})
});

})();
