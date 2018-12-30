import '../../dist/jb-react-all'

jb.component('aa', {
    type: 'data',
    params: [
        { id: 'mm', as: 'string' }
    ],
    impl: ctx => ctx.run({$:'button', action: {$:'goto-url', url: ''}})
})

const aa: profile = { $: '' }

var xx = {
	paramTypeOfPath: path => {
		var res = ((st.paramDef(path) || {}).type || 'data').split(',')[0].split('[')[0];
		if (res == '*')
			return st.paramTypeOfPath(st.parentPath(path));
		return res;
	},
	PTsOfPath: path =>
		st.PTsOfType(st.paramTypeOfPath(path)),

	PTsOfType: type => {
		var single = /([^\[]*)([])?/;
		var types = [].concat.apply([],(type||'').split(',')
			.map(x=>
				x.match(single)[1])
			.map(x=>
				x=='data' ? ['data','aggregator','boolean'] : [x]));
		var comp_arr = types.map(t=>
			jb.entries(st.previewjb.comps)
				.filter(c=>
					(c[1].type||'data').split(',').indexOf(t) != -1
					|| (c[1].typePattern && t.match(c[1].typePattern))
				)
				.map(c=>c[0]));
		return comp_arr.reduce((all,ar)=>all.concat(ar),[]);
	},
}

const types = {}
jb.entries(jb.comps).forEach(c=>
    (c[1].type||'').split(',').forEach(t=>types[t] = true))
