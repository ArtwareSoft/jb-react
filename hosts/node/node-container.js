const fs = require('fs')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')
const { log, getProcessArgument} = require(`${jbBaseUrl}/bin/utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

global.jbInNode = true
const uri = `node${pid}`
global.jb = { uri }
global.jbLoadingPhase = 'libs'
require(`http:${settings.ports.codeLoader}/codeloader-client.js`)

process.on('message', (m, socket) => {
  if (m.$ != 'initSocket') return
  jb.jbm.extendPortToJbmProxy(jb.jbm.portFromNodeSocket(socket,m.clientUri))
  socket.send({$: 'ready', serverUri: uri})
})

spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
global.jbLoadingPhase = 'appFiles'


