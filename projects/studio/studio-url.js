jb.component('url-history.map-studio-url-to-resource', { /* urlHistory.mapStudioUrlToResource */
  type: 'action',
  params: [
    {id: 'resource', as: 'string', mandatory: true},
    {id: 'onUrlChange', type: 'action', dynamic: true}
  ],
  impl: function(context,resource) {
        if (jb.ui.location || typeof window == 'undefined') return;
        const base = location.pathname.indexOf('studio-bin') != -1 ? 'studio-bin' : 'studio'

        const urlFormat = location.pathname.match(/\.html$/) ? {
            urlToObj({search}) {
                const _search = search.substring(1);
                return JSON.parse('{"' + decodeURI(_search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
            },
            objToUrl(obj) {
                const search = '?' + params.map(p=>({p,val: obj[p] !== undefined && jb.tostring(obj[p])}))
                    .filter(e=>e.val)
                    .map(({p,val})=>`${p}=${encodeURIComponent(val)}`)
                    .join('&');
                return {search} 
            }
        } : {
            urlToObj({pathname}) {
                const vals = pathname.substring(pathname.indexOf(base) + base.length).split('/')
                        .map(x=>decodeURIComponent(x))
                const res = {};
                params.forEach((p,i) =>
                    res[p] = (vals[i+1] || ''));
                return res;
            },
            objToUrl(obj) {
                const split_base = location.pathname.split(`/${base}`);
                const pathname = split_base[0] + `/${base}/` +
                    params.map(p=>encodeURIComponent(jb.tostring(obj[p])||''))
                    .join('/').replace(/\/*$/,'');
                return {pathname} 
            }
        }

        const hasSearchUrl = location.pathname.match(/\.html$/);
        const params = ['project','page','profile_path'].concat( hasSearchUrl ? ['host','hostProjectId'] : [])

        jb.ui.location = History.createBrowserHistory();
        const browserUrlEm = jb.rx.Observable.create(obs=>
            jb.ui.location.listen(x=> obs.next(x)));

        const databindEm = jb.ui.resourceChange
            .filter(e=> e.path[0] == resource)
              .map(_=> jb.resource(resource))
            .filter(obj=>
                obj[params[0]])
            .map(obj=>
                urlFormat.objToUrl(obj));

        browserUrlEm.merge(databindEm)
            .startWith(location)
            .subscribe(loc => {
                const obj = urlFormat.urlToObj(loc);
                params.forEach(p=>
                    jb.writeValue(context.exp(`%$${resource}/${p}%`,'ref'),jb.tostring(obj[p])));
                // change the url if needed
                if (loc.pathname && loc.pathname === location.pathname) return
                if (loc.search && loc.search === location.search) return
                jb.ui.location.push(Object.assign({},jb.ui.location.location, loc));
                context.params.onUrlChange(context.setData(loc));
            })
    }
})
