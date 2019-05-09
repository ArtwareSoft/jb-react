jb.component('url-history.map-url-to-resource', {
	type: 'action',
	params: [
		{ id: 'params', type: 'data[]', as: 'array'},
		{ id: 'resource', as: 'string' , essential: true },
		{ id: 'base', as: 'string', description: 'base string to add/ingnore in url'},
		{ id: 'onUrlChange', type: 'action', dynamic: true }
	],
	impl: function(context,params,resource,base) {
		if (jb.ui.location) return;

		jb.ui.location = History.createBrowserHistory();
		jb.ui.location.path = _ => location.pathname;
			var browserUrlEm = jb.rx.Observable.create(obs=>
			jb.ui.location.listen(x=>
				obs.next(x.pathname)));

			function urlToObj(path) {
				var vals = path.substring(path.indexOf(base) + base.length).split('/')
						.map(x=>decodeURIComponent(x))
				var res = {};
				params.forEach((p,i) =>
					res[p] = (vals[i+1] || ''));
				return res;
			}
			function objToUrl(obj) {
				var split_base = jb.ui.location.path().split(`/${base}`);
				var url = split_base[0] + `/${base}/` +
					params.map(p=>jb.tostring(obj[p])||'')
					.join('/');
				return url.replace(/\/*$/,'');
		}

		var databindEm = jb.ui.resourceChange
			.filter(e=> e.path[0] == resource)
				.map(_=> jb.resource(resource))
				.filter(obj=>
					obj[params[0]])
				.map(obj=>
					objToUrl(obj));

		browserUrlEm.merge(databindEm)
				.startWith(jb.ui.location.path())
				.distinctUntilChanged()
				.subscribe(url => {
					jb.ui.location.push(Object.assign({},jb.ui.location.location, {pathname: url}));
					var obj = urlToObj(url);
					params.forEach(p=>
						jb.writeValue(context.exp(`%$${resource}/${p}%`,'ref'),jb.tostring(obj[p])));
					context.params.onUrlChange(context.setData(url));
				})
	}
})
