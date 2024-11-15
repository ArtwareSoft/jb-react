component('urlHistory.mapStudioUrlToResource', {
  type: 'service',
  params: [
    {id: 'resource', as: 'string', mandatory: true},
    {id: 'onUrlChange', type: 'action', dynamic: true}
  ],
  impl: (ctx,resource) => ({ init: () => {
        if (jb.ui.location || !jb.frame.History || typeof window == 'undefined' || jb.frame.jbInvscode || jb.studio.urlHistoryInitialized) return
        jb.studio.urlHistoryInitialized = true
        const location = jb.frame.location
        const base = location.pathname.indexOf('studio-bin') != -1 ? 'studio-bin' : 'studio'

        const urlFormat = location.pathname.match(/\.html$/) ? {
            urlToObj({search}) {
                const _search = search.substring(1);
                return _search ? JSON.parse('{"' + decodeURI(_search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}') : {}
            },
            objToUrl(obj) {
                const search = '?' + params.map(p=>({p,val: obj[p] !== undefined && jb.tostring(obj[p])}))
                    .filter(e=>e.val)
                    .map(({p,val})=>`${p}=${val}`)
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
        const params = ['project','circuit','profile_path'].concat( hasSearchUrl ? ['host','hostProjectId'] : [])

        const _search = location.search.substring(1);
        if (_search)
            Object.assign(ctx.exp('%$queryParams%'),JSON.parse('{"' + decodeURI(_search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'))

        const {pipe, fromIter, subscribe,merge,fromEvent,map,filter} = jb.callbag
        const browserUrlEm = fromEvent('popstate',jb.frame.window)

        const databindEm = pipe(jb.db.useResourcesHandler(h=>h.resourceChange),
            filter(e=> e.path[0] == resource && params.indexOf(e.path[1]) != -1),
            map(_=> jb.db.resource(resource)),
            filter(obj=> obj[params[0]]),
            map(obj=> urlFormat.objToUrl(obj)))

        pipe(
            merge(fromIter([location]),browserUrlEm,databindEm),
            subscribe(loc => {
                const obj = urlFormat.urlToObj(loc);
                params.forEach(p=>
                    jb.db.writeValue(ctx.exp(`%$${resource}/${p}%`,'ref'), jb.tostring(obj[p]) ,ctx) );
                // change the url if needed
                if (loc.pathname && loc.pathname === location.pathname) return
                if (loc.search && loc.search === location.search) return
                jb.path(jb.frame.window, history) && history.pushState({}, "", loc);
                ctx.params.onUrlChange(ctx.setData(loc));
        }))
  }})
})

component('dataResource.queryParams', {
  passiveData: {}
})
