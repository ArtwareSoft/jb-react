using('common')

component('http.get', {
  type: 'data',
  moreTypes: 'action<>',
  description: 'fetch data from external url',
  params: [
    {id: 'url', as: 'string'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean', byName: true},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud'}
  ],
  impl: (ctx,_url,_json,useProxy) => {
    jb.urlProxy = jb.urlProxy || (typeof window !== 'undefined' && jb.frame.location.href.match(/^[^:]*/)[0] || 'http') + '://jbartdb.appspot.com/jbart_db.js?op=proxy&url='
    jb.cacheKiller = jb.cacheKiller || 1
    if (jb.path(jb.probe,['http_get_cache',_url]))
			return jb.probe.http_get_cache[_url]
    const json = _json || _url.match(/json$/)
    let url = _url
    if (useProxy == 'localhost-server')
      url = `/?op=fetch&req=${JSON.stringify({url})}&cacheKiller=${jb.cacheKiller++}`
    else if (useProxy == 'cloud')
      url = `//jbart5-server.appspot.com/?op=fetch&req={url:"${url}"}&cacheKiller=${jb.cacheKiller++}`

		return jb.frame.fetch(url, {mode: 'cors'})
			  .then(r => json ? r.json() : r.text())
				.then(res=> jb.path(jb.probe,'http_get_cache') ? (jb.probe.http_get_cache[_url] = res) : res)
			  .catch(e => jb.logException(e,'http.get',{ctx}) || [])
	}
})

component('http.fetch', {
  type: 'data',
  moreTypes: 'action<>',
  description: 'fetch, get or post data from external url',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'method', as: 'string', options: 'GET,POST', defaultValue: 'GET'},
    {id: 'headers', as: 'single', templateValue: obj(prop('Content-Type', 'application/json; charset=UTF-8'))},
    {id: 'body', as: 'single'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean'},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud,cloud-test-local'}
  ],
  impl: async (ctx,url,method,headers,body,json,proxy) => {
    const reqObj = {
      url,
      method,
      headers: headers || {},
      mode: 'cors',
      body: (typeof body == 'string' || body == null) ? body : JSON.stringify(body)
    }

    const reqStr = jb.frame.encodeURIComponent(JSON.stringify(reqObj))
		if (jb.path(jb.probe,['http_get_cache',reqStr]))
			return jb.probe.http_get_cache[reqStr]

    if (proxy == 'localhost-server')
      reqObj.url = `/?op=fetch&req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud')
      reqObj.url = `//jbart5-server.appspot.com/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud-test-local')
      reqObj.url = `http://localhost:8080/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`

    try {
      const r = await fetch(reqObj.url, proxy ? {mode: 'cors'} : reqObj)
      const res = json ? await r.json() : await r.text()
      if (jb.path(jb.probe,['http_get_cache',reqStr]))
        jb.probe.http_get_cache[reqStr] = res
      return res
    } catch(e) {
      debugger
      jb.logException('http.fetch', e)
    }
	}
})
