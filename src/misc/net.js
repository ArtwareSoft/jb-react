jb.component('http.get', {
  type: 'data,action',
  description: 'fetch data from external url',
  params: [
    {id: 'url', as: 'string'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean'},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud'}
  ],
  impl: (ctx,_url,_json,useProxy) => {
    jb.urlProxy = jb.urlProxy || (typeof window !== 'undefined' && location.href.match(/^[^:]*/)[0] || 'http') + '://jbartdb.appspot.com/jbart_db.js?op=proxy&url='
    jb.cacheKiller = jb.cacheKiller || 1
    if (ctx.probe)
			return jb.http_get_cache[_url];
    const json = _json || _url.match(/json$/);
    let url = _url
    if (useProxy == 'localhost-server')
      url = `/?op=fetch&req=${JSON.stringify({url})}&cacheKiller=${jb.cacheKiller++}`
    else if (useProxy == 'cloud')
      url = `//jbart5-server.appspot.com/?op=fetch&req={url:"${url}"}&cacheKiller=${jb.cacheKiller++}`

		return fetch(url, {mode: 'cors'})
			  .then(r => json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[url] = res) : res)
			  .catch(e => jb.logException(e,'http.get',{ctx}) || [])
	}
})

jb.component('http.fetch', {
  type: 'data,action',
  description: 'fetch, get or post data from external url',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'method', as: 'string', options: 'GET,POST', defaultValue: 'GET'},
    {id: 'headers', as: 'single', templateValue: obj(prop('Content-Type', 'application/json; charset=UTF-8'))},
    {id: 'body', as: 'single'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean'},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud,cloud-test-local'}
  ],
  impl: (ctx,url,method,headers,body,json,proxy) => {
    const reqObj = {
      url,
      method,
      headers: headers || {},
      mode: 'cors',
      body: (typeof body == 'string' || body == null) ? body : JSON.stringify(body)
    }

    const reqStr = encodeURIComponent(JSON.stringify(reqObj))
		if (ctx.probe)
			return jb.http_get_cache[reqStr];

    if (proxy == 'localhost-server')
      reqObj.url = `/?op=fetch&req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud')
      reqObj.url = `//jbart5-server.appspot.com/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud-test-local')
      reqObj.url = `http://localhost:8080/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`

    return fetch(reqObj.url, proxy ? {mode: 'cors'} : reqObj)
			  .then(r => json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[reqStr] = res) : res)
			  .catch(e => jb.logException(e,'http.fetch',{ctx}) || [])
	}
})

jb.extension('websocket', {
    connect(service,host,handler) {
        if (jb.frame.jbInNode) {
            const webSocketClient = new jb.frame.require('websocket').client()
            webSocketClient.on('connectFailed', err => log(`webSocketClient connectFailed : ${err.toString() }`))
            webSocketClient.on('connect', socket => handler(jb.jbm. jb.jbm.portFromNodeSocket(socket,'')))
            webSocketClient.connect(`ws://${host}:${settings.ports[service]}`, 'echo-protocol')    
        }
    }
})