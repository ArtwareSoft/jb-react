const fs = require('fs')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')
const { log, getProcessArgument, jbGetJSFromUrl} = require(`${jbBaseUrl}/bin/utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

process.on('message', m => {
  log('node - received from parent',m)
  if (m.$ == 'createJbm') {
    jb.ports[m.clientUri] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromNodeChildProcess(process,m.clientUri))
    log('new node ready')
    process.send({$: 'ready', serverUri: jb.uri})
  }
})

async function run() {
  global.jbInNode = true
  const uri = `node${process.pid}`
  global.jb = { uri }
  global.jbLoadingPhase = 'libs'
  await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/treeShake-client.js`)
  await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/jb-test.js?ids=-jbm.portFromNodeChildProcess`)

  spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
  global.jbLoadingPhase = 'appFiles'

  log('new node started')
  process.send({$: 'readyForInit', serverUri: uri})
}

run().then(console.log('new jbm node loaded'))



