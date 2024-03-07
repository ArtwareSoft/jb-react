const fs = require('fs')
const path = require('path')
const { SourceMapGenerator } = require('source-map');

const { jbHost } = require('./node-host.js')
const { getProcessArgument } = jbHost
const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')
const plugins = getProcessArgument('plugins')
const sourceCodeStr = getProcessArgument('sourcecode') || plugins && `{"plugins": ${JSON.stringify(plugins.split(','))} }`
if (!sourceCodeStr) {
    console.log(`usage: jb-pack.js -plugins:common,probe -sourcecode:<sourceCode as json> -text`)
    process.exit(1)
}

make()

async function make() {

    const baseDir = `${jbHost.jbReactDir}/plugins`
    const latestModTime = getLatestModTime(baseDir)
    const fn = sourceCodeStr.replace(/\*/g,'ALL').replace(/[^a-zA-Z\-]/g,'')
    const tempFilePath = `${jbHost.jbReactDir}/temp/pack-${fn}.js`

    const tempIsValid = fs.existsSync(tempFilePath) && fs.statSync(tempFilePath).mtime.getTime() > latestModTime
    const sourceCode = JSON.parse(sourceCodeStr)
    try {
        let packedCode = ''
        if (!tempIsValid) {
            const map = new SourceMapGenerator({ file: `package/${plugins}.js` })
            const codeParts = await jbInit('jb-packer', sourceCode, {packOnly: true})
            ;[line,strArr] = codeParts.reduce(([line,strArr], {path,code}) => {
                code = code.replace(/^jbLoadPackedFile\({lineInPackage: 0/,'jbLoadPackedFile({lineInPackage:'+(line+3))
                if (path) {
                    ;(code.match(/\n/g)||[]).forEach( (_,i) =>{
                    const mapping = { source: path, original: { line: 1+i, column: 1 }, generated: { line: line + i + 3, column: 1 } } 
                    map.addMapping(mapping)
                })}
                return [line + (code.match(/\n/g)||[]).length + 1, [...strArr, code]]
            }, [0,[]])
            const mapBase64 = Buffer.from(map.toString()).toString('base64')
            packedCode = [...strArr,`//` + `# source` + `MappingURL=data:application/json;charset=utf-8;base64,${mapBase64}`].join('\n')
        } else {
            packedCode = '' + fs.readFileSync(tempFilePath)
        }
        if (!tempIsValid)
            fs.writeFileSync(tempFilePath, packedCode)
        if (getProcessArgument('text')) {
            process.stdout.write(packedCode)
        } else {
            process.stdout.write(`/temp/pack-${fn}.js`)
        }
        process.stdout.end()
        process.stdout.on('finish', () => process.exit(0))
    } catch(err) {
        process.stderr.write('error')
        process.stderr.write(err.toString && err.toString())
    }
}

function getLatestModTime(dir) {
    return fs.readdirSync(dir).reduce((latest, file) => {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)
        return Math.max(latest, stats.isDirectory() ? getLatestModTime(filePath) : stats.mtime.getTime())
    }, 0)
}
