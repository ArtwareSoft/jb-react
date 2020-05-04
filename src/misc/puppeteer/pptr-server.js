const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });
const vm = require('vm')
global.hasPptrServer = true

wss.on('connection', ws => {
  ws.send(JSON.stringify({res: typeof jb == 'undefined' ? 'loadCodeReq' : 'ready'}))
  ws.on('message', _message => {
    try {
        const message = JSON.parse(_message)
        if (message.loadCode) {
            vm.runInThisContext(message.loadCode, message.moduleFileName)
            global.jb = jb
        }
        if (message.require) {
            jb.path(global, message.writeTo, require(message.require))
        }
        if (message.run && typeof jb != 'undefined') { 
            new jb.jbCtx().setVar('clientSocket',ws).run(message.run)
        }
      } catch(error) {
        ws.send(JSON.stringify({error}))
        console.log(error)
      }
  })
})
console.log('opened WS server on', wss.address().port)
