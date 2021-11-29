const fs = require('fs')
const vm = require('vm')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')

module.exports = { 
    loadCodeLoaderServer(uri, projects = []) {
        try {
            const loaderCode = fs.readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
            vm.runInThisContext(loaderCode)
            return jbInit(uri, { projects, loadFileFunc, fileSymbolsFunc })
        } catch (e) {
            console.log('error loading jb-loader',e)
        }
    }
}

function loadFileFunc(url) {
    try {
        // console.log(`loading ${url}`)
        require(jbBaseUrl+url)
    } catch (e) {
        //console.log(`error loading ${url}`,e)
    }
}

function fileSymbolsFunc(path, _include, _exclude) {
    const include = _include && new RegExp(_include)
    const exclude = _exclude && new RegExp(_exclude)
    return Promise.resolve(getFilesInDir(path).filter(f => f.match(/\.js/)).map(path => fileContent(path)))

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
