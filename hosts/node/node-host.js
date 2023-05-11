const fs = require('fs')
function findjbReact() {
    const underJbReact = (__dirname.match(/projects\/jb-react(.*)$/) || [''])[1]
    if (underJbReact)
        return __dirname.slice(0,-1*underJbReact.length)
    const dir2 = [...__dirname.split('/').slice(0,__dirname.split('/').indexOf('projects')), 'jb-react'].join('/')
    if (fs.statSync(dir2).isDirectory())
        return dir2
}

function codePackageNodeFS(baseDir) { return {
    fetchFile(url) {
        try {
            return require('util').promisify(fs.readFile)(baseDir+url)
        } catch (e) {
            globalThis.jb ? jb.logException(e,'node utils load file', {url}) : process.stderr(`node utils - error loading ${url}`)
        }
        return Promise.resolve()
    },
    fetchJSON(url) { 
        return this.fetchFile(url).then(x=>JSON.parse(x))
    },        
    async fileSymbols (path) {
        try {
            return getFilesInDir(path).filter(f => f.match(/\.js/)).map(path => fileContent(path))
        } catch(e) {
            return []
        }
    
        function getFilesInDir(dirPath) {
            return fs.readdirSync(`${baseDir}/${dirPath}`).sort((x, y) => x == y ? 0 : x < y ? -1 : 1).reduce((acc, file) => {
                const path = `${dirPath}/${file}`
                return fs.statSync(`${baseDir}/${path}`).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
            }, [])
        }
        function fileContent(path) {
            const content = fs.readFileSync(`${baseDir}/${path}`, 'utf-8')
            return {
                dsl: unique(content.split('\n').map(l=>(l.match(/^jb.dsl\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0]))[0],
                path: '/' + path,
                ns: unique(content.split('\n').map(l => (l.match(/^(jb.)?component\('([^']+)/) || ['', ''])[2]).filter(x => x).map(x => x.split('.')[0])),
                libs: unique(content.split('\n').map(l => (l.match(/^jb.extension\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0])),
                using: unique(content.split('\n').map(l=>(l.match(/^jb.using\('([^']+)/) || ['',''])[1]).filter(x=>x).flatMap(x=>x.split(',').map(x=>x.trim()))),
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
    jbReactDir: findjbReact(), 
    http: require('http'),
    child_process: require('child_process'),
    fetch(url,_options) {
        return new Promise((resolve,reject) => {
            try {
                const body = _options && _options.body
                const headers = {'Content-Type': 'application/json' }
                if (body)
                    Object.assign(headers,{ 'Content-Length': Buffer.byteLength(body) })

                const options = _options ? { ..._options, headers} : { method: 'GET', headers  }

                const req = jbHost.http.request(url,options, res => {
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
    },
    defaultCodePackage: codePackageNodeFS(findjbReact()),
    getProcessArgument(argName) {
        for (let i = 0; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.indexOf('-' + argName + ':') == 0) 
            return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
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
        const vm = require('vm'), fetch = require('node-fetch')
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
    runShell: cmd => require('child_process').exec(cmd) 
}

module.exports = { jbHost, codePackageNodeFS }


// globalThis.jbFetchFile = url => util.promisify(fs.readFile)(url)
// globalThis.jbFetchJson = url => (util.promisify(fs.readFile)(url)).then(x=>JSON.parse(x))


// global.jbFetchFile = url => {
//     try {
//         return require('util').promisify(fs.readFile)(url)
//     } catch (e) {
//         globalThis.jb ? jb.logException(e,'node utils load file', {url}) : process.stderr(`node utils - error loading ${url}`)
//     }
//     return Promise.resolve()
// }
// global.jbFetchJson = url => jbFetchFile(url).then(x=>JSON.parse(x))

// globalThis.jbFetchUrl = (url,_options) => {
//     return new Promise((resolve,reject) => {
//         try {
//             const body = _options && _options.body
//             const headers = {'Content-Type': 'application/json' }
//             if (body)
//                 Object.assign(headers,{ 'Content-Length': Buffer.byteLength(body) })

//             const options = _options ? { ..._options, headers} : { method: 'GET', headers  }

//             const req = (globalThis.vsHttp || require('http')).request(url,options, res => {
//                 let data = ''
//                 res.on('data', chunk => data += chunk)
//                 res.on('end', () => resolve({text: () => ''+data, json: () => JSON.parse(data)}))
//                 req.on('error', error => reject({error}))
//             })
//             body && req.write(body)
//             req.end()
//         } catch(e) {
//             reject(e)
//         }
//     })
// }

// global.jbFileSymbols = async (path, _include, _exclude) => {
//     const include = _include && new RegExp(_include)
//     const exclude = _exclude && new RegExp(_exclude)
//     try {
//         return getFilesInDir(path).filter(f => f.match(/\.js/)).map(path => fileContent(path))
//     } catch(e) {
//         return []
//     }

//     function getFilesInDir(dirPath) {
//         return fs.readdirSync(`${jbHost.jbReactDir}/${dirPath}`).sort((x, y) => x == y ? 0 : x < y ? -1 : 1).reduce((acc, file) => {
//             const path = `${dirPath}/${file}`
//             if (include && !include.test(path) || exclude && exclude.test(path)) return acc
//             return fs.statSync(`${jbHost.jbReactDir}/${path}`).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
//         }, [])
//     }
//     function fileContent(path) {
//         const content = fs.readFileSync(`${jbHost.jbReactDir}/${path}`, 'utf-8')
//         return {
//             dsl: unique(content.split('\n').map(l=>(l.match(/^jb.dsl\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split('.')[0]))[0],
//             path: '/' + path,
//             ns: unique(content.split('\n').map(l => (l.match(/^(jb.)?component\('([^']+)/) || ['', ''])[2]).filter(x => x).map(x => x.split('.')[0])),
//             libs: unique(content.split('\n').map(l => (l.match(/^jb.extension\('([^']+)/) || ['', ''])[1]).filter(x => x).map(x => x.split('.')[0])),
//             using: unique(content.split('\n').map(l=>(l.match(/^jb.using\('([^']+)/) || ['',''])[1]).filter(x=>x).map(x=>x.split(',').map(x=>x.trim()))),
//         }
//     }
//     function unique(list) {
//         const ret = {}
//         list.forEach(x => ret[x] = true)
//         return Object.keys(ret)
//     }
// }

