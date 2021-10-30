const fs = require('fs')
const http = require('http')
const WebSocketServer = require('websocket').server
const child = require('child_process')
global.jbInNode = true
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'');
const { log, getProcessArgument} = require(`${jbBaseUrl}/bin/utils.js`)
const nodeContainerUrl = `${jbBaseUrl}/hosts/node/node-container.js`

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

/** codeLoader
 * start with as http://localhost:26100/codeloader-client.js
 * and then get relevant code with http://localhost:26100/jb-button.js?ids=button&existing=t,z&modules=path=src/ui!checkId=button!forceReload=true
 * http://localhost:26100/jb-test.js?ids=-test.runOneTest,dataTest.delayedObj&modules=path=src/testing,path=projects/tests
**/
let jbCodeLoaderServer
async function initCodeLoaderServer() {
    if (jbCodeLoaderServer) return
    jbCodeLoaderServer = require(`${jbBaseUrl}/hosts/node/dev-codelLoader.js`)
    await jbCodeLoaderServer.loadCodeLoaderServer('codeLoader',['studio'])
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
}

async function calcContent(req) {
    if (req.url.match(/codeloader-client.js$/)) 
        return jb.codeLoader.clientCode()
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
        await jb.codeLoader.loadModules(toLoad)
    } 
    const treeShake = jb.codeLoader.treeShake(ids.split(',').map(x=>x.replace(/^-/,'#')),
        jb.objFromEntries(existing.split(',').map(x => [x.replace(/^-/,'#'),true])))
    return jb.codeLoader.code(treeShake)
}

const codeLoader = http.createServer( async (req, res) => {
    await initCodeLoaderServer()
    const content = await calcContent(req)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader('Cache-Control','max-age: 0, must-revalidate,no-cache')
    res.setHeader('Content-Type', 'application/javascript; charset=utf8')
    res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'))
    res.setHeader('ETag', new Date().getTime())
    res.statusCode = 200
    res.end(content)
}).listen(settings.ports.codeLoader, () => log(`codeLoader at: http://localhost:${codeLoader.address().port}`))


// ** nodeContainer
const processes = {}
const nodeContainer = http.createServer()
nodeContainer.listen(settings.ports.nodeContainer, () => log(`nodeContainer at: http://localhost:${nodeContainer.address().port}`))
new WebSocketServer({ httpServer: nodeContainer }).on('request', function(request) {
    const connection = request.accept('echo-protocol', request.origin)
    log((new Date()) + ' nodeContainer Connection accepted.')
    connection.on('message', createJbmReq => {
        if (createJbmReq.type === 'utf8') {
            log('Received createJbmReq: ' + createJbmReq.utf8Data)
            if (createJbmReq.$ == 'createJbm') {
                // TODO: check finished process for reuse
                const proc = child.fork(nodeContainerUrl);
                processes[proc.pid] = { createJbmReq, proc }
                proc.on('message', m => processes[proc.pid].finished = m.$ == 'finished')
                proc.send({$: 'initSocket', clientUri: createJbmReq.clientUri }, connection);
            }
        }
    })
    connection.on('close', () => log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.'))
})

/** utils */
function getURLParam(req,name) {
  try {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
  } catch(e) {}
}