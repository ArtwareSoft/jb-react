const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });
const vm = require('vm')
global.hasPptrServer = true

wss.on('connection', ws => {
  ws.send(JSON.stringify({res: typeof jb == 'undefined' ? 'loadCodeReq' : 'ready'}))
  ws.on('message', _data => {
    try {
        const data = JSON.parse(_data)
        if (data.loadCode) {
            vm.runInThisContext(data.loadCode,data.moduleFileName)
            global.jb = jb
        }
        if (data.require) {
            jb.path(global, data.writeTo, require(data.require))
        }
        if (data.profile && typeof jb != 'undefined') { 
            const result = jb.exec(data.profile)
            const {pipe,fromAny,subscribe} = jb.callbag
            pipe(fromAny(result && result.em || result), subscribe( { 
                next: res => ws.send(toJson(res)),
                complete: () => ws.close()
            }))
        }
      } catch(error) {
        ws.send(JSON.stringify({error}))
        console.log(error)
      }
  })
})
console.log('opened WS server on', wss.address().port)

function toJson(res,depth) {
    try {
        return JSON.stringify({res}) 
    } catch (error) { // recursive error - return on level down
        return !depth && 
            toJson(Object.keys(res).reduce((acc,k) => ({...acc, [k]: res[k].toString() }), {}), 1)
    }
}