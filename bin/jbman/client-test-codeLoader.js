const fs = require('fs')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')
const { log, getProcessArgument, jbGetJSFromUrl} = require(`${jbBaseUrl}/hosts/node/node-utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

const uri = `node${process.pid}`
global.jb = { uri }
async function run() {
    await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/treeShake-client.js`)
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})

    await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/jb-test.js?ids=-test.runOneTest,dataTest.datum&modules=path=projects/tests,path=projects/tests`)
    const res = await jb.test.runOneTest('dataTest.datum')
    console.log(res)
}
run().then(()=>console.log('finished'))
