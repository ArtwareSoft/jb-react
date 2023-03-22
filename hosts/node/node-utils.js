const fs = require('fs')
globalThis.jbNet = require('net')
globalThis.jbHttp = require('http')
if (!global.jbBaseUrl) {
    const underJbReact = (__dirname.match(/projects\/jb-react(.*)$/) || [''])[1]
    global.jbBaseUrl = underJbReact != null ? __dirname.slice(0,-1*underJbReact.length) : '.'
}
globalThis.jbFetchFile = url => util.promisify(fs.readFile)(url)
globalThis.jbFetchJson = url => (util.promisify(fs.readFile)(url)).then(x=>JSON.parse(x))

module.exports = { getProcessArgument, getURLParam, log}

global.jbFetchFile = url => {
    try {
        return require('util').promisify(fs.readFile)(url)
    } catch (e) {
        globalThis.jb ? jb.logException(e,'node utils load file', {url}) : process.stderr(`node utils - error loading ${url}`)
    }
    return Promise.resolve()
}
global.jbFetchJson = url => jbFetchFile(url).then(x=>JSON.parse(x))

globalThis.jbFetchUrl = (url,_options) => {
    return new Promise((resolve,reject) => {
        try {
            const body = _options && _options.body
            const headers = {'Content-Type': 'application/json' }
            if (body)
                Object.assign(headers,{ 'Content-Length': Buffer.byteLength(body) })

            const options = _options ? { ..._options, headers} : { method: 'GET', headers  }

            const req = (globalThis.vsHttp || require('http')).request(url,options, res => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => resolve({text: () => ''+data, json: () => JSON.parse(data)}))
                req.on('error', error => reject({error}))
            })
            body && req.write(body)
            req.end()
        } catch(e) {
            reject(e)
        }
    })
}

global.jbFileSymbols = async (path, _include, _exclude) => {
    const include = _include && new RegExp(_include)
    const exclude = _exclude && new RegExp(_exclude)
    try {
        return getFilesInDir(path).filter(f => f.match(/\.js/)).map(path => fileContent(path))
    } catch(e) {
        return []
    }

    function getFilesInDir(dirPath) {
        return fs.readdirSync(`${jbBaseUrl}/${dirPath}`).sort((x, y) => x == y ? 0 : x < y ? -1 : 1).reduce((acc, file) => {
            const path = `${dirPath}/${file}`
            if (include && !include.test(path) || exclude && exclude.test(path)) return acc
            return fs.statSync(`${jbBaseUrl}/${path}`).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
        }, [])
    }
    function fileContent(path) {
        const content = fs.readFileSync(`${jbBaseUrl}/${path}`, 'utf-8')
        return {
            dsl: unique(content.split('\n').map(l=>(l.match(/^jb.dsl\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0]))[0],
            path: '/' + path,
            ns: unique(content.split('\n').map(l => (l.match(/^jb.component\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0])),
            libs: unique(content.split('\n').map(l => (l.match(/^jb.extension\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0]))
        }
    }
    function unique(list) {
        const ret = {}
        list.forEach(x => ret[x] = true)
        return Object.keys(ret)
    }
}

function getProcessArgument(argName) {
    for (let i = 0; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.indexOf('-' + argName + ':') == 0) 
        return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
      if (arg == '-' + argName) return true;
    }
    return '';
}

function getURLParam(req,name) {
  try {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
  } catch(e) {}
}

function log(...args) { console.log(...args) }

global.jbGetJSFromUrl = async url => { 
    const vm = require('vm'), fetch = require('node-fetch')
    const response = await fetch(url)
    const code = await response.text()
    vm.runInThisContext(code, url)
}

global.jbSpawn = async (args, {doNotWaitForEnd} = {}) => {
    return new Promise((resolve) => {
        const command = `node --inspect-brk jb.js ${args.map(x=>`'${x}'`).join(' ')}`
        const proc = require('child_process').spawn('node',[`${jbBaseUrl}/bin/jb.js`, ...args] ,{cwd: jbBaseUrl})
        let res = ''
        proc.stdout.on('error', err => resolve({err}))
        proc.stdout.on('data', data => doNotWaitForEnd ? resolve(''+data) : (res +=data))
        proc.stdout.on('end', data => {
            if (data)
                res +=data
            resolve(res)
        })
    })
}

global.jbRunShell = cmd => require('child_process').exec(cmd) 
