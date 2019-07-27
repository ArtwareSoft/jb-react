jb.component('url-history.map-studio-url-to-resource', {
    type: 'action',
    // /project/studio/${project}/${page}/${profile_path}
    // /studio/${entry_file}/${shown_comp}/${profile_path}
    // http://localhost:8082/studio/projects%2Fhello-world%2Fhello-world.html/hello-world.main/hello-world.main~impl
    params: [
        { id: 'resource', as: 'string' , mandatory: true },
        { id: 'onUrlChange', type: 'action', dynamic: true }
    ],
    impl: function(context,resource) {
        if (jb.ui.location || typeof window == 'undefined') return;
        const base = 'studio'
        const isProject = location.pathname.indexOf('/project') == 0;
        const params = isProject ? ['project','page','profile_path'] : ['entry_file','shown_comp','profile_path']

        jb.ui.location = History.createBrowserHistory();
        jb.ui.location.path = _ => location.pathname;
        const browserUrlEm = jb.rx.Observable.create(obs=>
            jb.ui.location.listen(x=>
                obs.next(x.pathname)));

        function urlToObj(path) {
            const vals = path.substring(path.indexOf(base) + base.length).split('/')
                    .map(x=>decodeURIComponent(x))
            let res = {};
            params.forEach((p,i) =>
                res[p] = (vals[i+1] || ''));
            if (!isProject) {
                res.project = res.shown_comp.split('.')[0]
                res.page = res.shown_comp.split('.').pop()
            }
            return res;
        }
        function objToUrl(obj) {
            const split_base = jb.ui.location.path().split(`/${base}`);
            const url = split_base[0] + `/${base}/` +
                params.map(p=>encodeURIComponent(jb.tostring(obj[p])||''))
                .join('/');
            return url.replace(/\/*$/,'');
        }

        const databindEm = jb.ui.resourceChange
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
