const fs = require('fs')
const vm = require('vm')
const path = require('path')

function findjbReact() {
    const underJbReactMatch =  (__dirname.replace(/\\/g,'/').match(/projects\/jb-react(.*)$/) || [''])[1]
    if (underJbReactMatch)
        return __dirname.slice(0, -1 * underJbReactMatch.length)

    const dirParts = __dirname.split(path.sep)
    const projectsIndex = dirParts.indexOf('projects')

    if (projectsIndex !== -1) {
        const jbReactPath = path.join(...dirParts.slice(0, projectsIndex), 'jb-react');
        if (fs.existsSync(jbReactPath) && fs.statSync(jbReactPath).isDirectory())
            return jbReactPath
    }
}

function codePackageNodeFS(baseDir) { return {
    repo: baseDir.split(path.sep).pop(),
    fetchFile(url) {
        try {
            return require('util').promisify(fs.readFile)(baseDir+url).then(x=>''+x)
        } catch (e) {
            globalThis.jb ? jb.logException(e,'node utils load file', {url}) : process.stderr(`node utils - error loading ${url}`)
        }
        return Promise.resolve()
    },
    fetchJSON(url) { 
        return this.fetchFile(url).then(x=>JSON.parse(''+x))
    },
    loadLib(libPath) { 
        const code = '' + fs.readFileSync(`${baseDir}${libPath}`)
        vm.runInThisContext(code)
    },
    loadFELib(lib) {
        jb.logError(`loadFELib is not allowed in nodejs host ${lib}`,{})
    },
    async fileSymbols(topPath) {
        try {
            return getFilesInDir(topPath).filter(f => f.match(/\.js$/)).map(f => fileContent('/'+f))
        } catch(e) {
            return []
        }
    
        function getFilesInDir(dirPath) {
            return fs.readdirSync(`${baseDir}/${dirPath}`).sort((x, y) => x == y ? 0 : x < y ? -1 : 1).reduce((acc, file) => {
                const subPath = `${dirPath}/${file}`
                return fs.statSync(`${baseDir}/${subPath}`).isDirectory() ? [...acc, ...getFilesInDir(subPath)] : [...acc, subPath]
            }, [])
        }
        function fileContent(path) {
            const content = fs.readFileSync(`${baseDir}${path}`, 'utf-8')
            const lines = content.split('\n')
            return {
                path,
                dsl: unique(lines.map(l=>(l.match(/^(jb.)?dsl\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0]))[0],
                pluginDsl: unique(lines.map(l=>(l.match(/^(jb.)?pluginDsl\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0]))[0],
                ns: unique(lines.map(l=>(l.match(/^(jb.)?component\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0])),
                libs: unique(lines.map(l=>(l.match(/^(jb.)?extension\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0])),
                using: unique(lines.map(l=>(l.match(/^(jb.)?using\('([^)]+)/) || ['',''])[2]).filter(x=>x).map(x=>x.replace(/'/g,''))
                .flatMap(x=>x.split(',').map(x=>x.trim()))),
            }
        }
        function unique(list) {
            const ret = {}
            list.forEach(x => ret[x] = true)
            return Object.keys(ret)
        }
   }}
}

globalThis.jbHost = globalThis.jbHost || {
    require,
    process: process,
    isNode: true,
    jbReactDir: findjbReact(), 
    http: require('http'),
    fs: require('fs'),
    child_process: require('child_process'),
    fetch(url,_options) {
        return new Promise((resolve,reject) => {
            try {
                const body = _options && _options.body
                const headers = {'Content-Type': 'application/json', ...(_options && _options.headers ? _options.headers : {}) }
                if (body)
                    Object.assign(headers,{ 'Content-Length': Buffer.byteLength(body) })

                const options = _options ? { ..._options, headers} : { method: 'GET', headers  }
                const base = (url.match(/^https/)) ? require('https') : require('http')
                const req = base.request(url,options, res => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => resolve({text: () => ''+data, json: () => JSON.parse(data)}))
                })
                req.on('error', error => reject({ error }))
                body && req.write(body)
                req.end()
            } catch(e) {
                reject(e)
            }
        })
    },
    getProcessArgument(argName) {
        for (let i = 0; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.indexOf('-' + argName + ':') == 0) 
            return arg.substring(arg.indexOf(':') + 1);
        if (arg == '-' + argName) return true;
        }
        return '';
    },
    getURLParam(req,name) {
        try {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
        } catch(e) {}
    },
    log(...args) { console.log(...args) },
    getJSFromUrl: async url => { 
        const vm = require('vm')
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
        const response = await fetch(url)
        const code = await response.text()
        const context = vm.createContext({ require, process, __filename: url })
        vm.runInThisContext(code, context)
    },
    spawn: async (args, {doNotWaitForEnd} = {}) => {
        return new Promise((resolve) => {
            const command = `node --inspect-brk ../hosts/node/jb.js ${args.map(x=>`'${x}'`).join(' ')}`
            const proc = require('child_process').spawn('node', [`jb.js`, ...args] ,{cwd: `${jbHost.jbReactDir}/hosts/node`})
            let res = ''
            proc.stdout.on('error', err => resolve({err}))
            proc.stdout.on('data', data => doNotWaitForEnd ? resolve(''+data) : (res +=data))
            proc.stdout.on('end', data => {
                if (data)
                    res +=data
                resolve(res)
            })
        })
    },
    runShell: cmd => require('child_process').exec(cmd),
    codePackageFromJson(package) {
        if (package == null || package.$ == 'defaultPackage') return codePackageNodeFS(findjbReact())
        if (package.$ == 'fileSystem')
            return codePackageNodeFS(package.baseDir)
    }
}

module.exports = { jbHost: globalThis.jbHost, codePackageNodeFS }


