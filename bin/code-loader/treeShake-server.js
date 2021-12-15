/** treeShake
 * start with as http://localhost:26100/treeShake-client.js
 * and then get relevant code with http://localhost:26100/jb-button.js?ids=button&existing=t,z&modules=path=src/ui!checkId=button!forceReload=true
 * http://localhost:26100/jb-test.js?ids=-test.runOneTest,dataTest.delayedObj&modules=path=src/testing,path=projects/tests
**/

const fs = require('fs')
const http = require('http')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/bin\/code-loader$/,'');
const { log, getProcessArgument, getURLParam} = require(`${jbBaseUrl}/hosts/node/node-utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

const treeShake = http.createServer( async (req, res) => {
    console.log(req.url)
    const { jbInit } = require(`${jbBaseUrl}/src/loader/jb-loader.js`)
    const { loadFileFunc, fileSymbolsFunc } = require(`${jbBaseUrl}/hosts/node/node-utils.js`)
    const modules = (getProcessArgument('modules') || '').split(',').filter(x=>x)
    const jb = await jbInit('treeShakeWorking',{ projects: modules, loadFileFunc, fileSymbolsFunc})
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})

    const content = await calcContent(jb, req)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader('Cache-Control','max-age: 0, must-revalidate,no-cache')
    res.setHeader('Content-Type', 'application/javascript; charset=utf8')
    res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'))
    res.setHeader('ETag', new Date().getTime())
    res.statusCode = 200
    res.end(content)
}).listen(settings.ports.treeShake, () => log(`treeShake at: http://localhost:${treeShake.address().port}`))


async function calcContent(jb, req) {
    if (req.url.match(/treeShake-client.js$/)) 
        return jb.treeShake.clientCode()
    const ids = getURLParam(req,'ids') || '', existing = getURLParam(req,'existing') || '', modules=getURLParam(req,'modules')
    if (modules) {
        const toLoad = modules.split(',').map(m=>({
            path: m.split('!').map(p=>(p.match(/^path=(.*)/)||[])[1]).filter(x=>x)[0],
            checkId: m.split('!').map(p=>(p.match(/^checkId=(.*)/)||[])[1]).filter(x=>x)[0],
            forceReload: m.split('!').map(p=>(p.match(/^forceReload=(.*)/)||[])[1]).filter(x=>x)[0]
        })).map(m=>({...m, func: m.checkId && m.checkId[0] == '-' && checkId.slice(1) }))
            .filter( m=> !m.forceReload || m.func && jb.path(jb,m.func) == undefined)
            .filter( m=> !m.forceReload || !m.func && !jb.comps[m.checkId])
            .map(m=> m.path)
        await jb.treeShake.loadModules(toLoad)
    } 
    const treeShake = jb.treeShake.treeShake(ids.split(',').map(x=>x.replace(/^-/,'#')),
        jb.objFromEntries(existing.split(',').map(x => [x.replace(/^-/,'#'),true])))
    return jb.treeShake.code(treeShake)
}
