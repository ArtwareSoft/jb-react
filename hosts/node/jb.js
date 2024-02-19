const { jbHost } = require('./node-host.js')
const { getProcessArgument } = jbHost

const scriptFN = getProcessArgument('script')
const argsFromScript = {}
if (scriptFN) {
    try {
        const script = jbHost.fs.readFileSync(scriptFN)
        ;('\n'+script).split('\n//#').filter(x=>x).forEach(p=>argsFromScript[p.slice(0,p.indexOf(' '))] = p.slice(p.indexOf(' ')+1).trim())
    } catch(err) {
        console.log(JSON.stringify({ desc: `can not read script file ${scriptFN}`, err: JSON.stringify(err) }))
        process.exit(1)
    }
}

function doGetProcessArgument(p) {
    return argsFromScript[p] || getProcessArgument(p)
}

const _params = 
      ['main','plugins','project','wrap','uri','dsl','verbose','runCtx','spy','text','doNotStripResult']
const [main,_plugins,project,wrap,uri,dsl,verbose,runCtx,spy,resultAsText,doNotStripResult] = _params.map(p=>doGetProcessArgument(p))

if (!main && !runCtx) {
    console.log(`usage: jb.js - example: jb.js -main:pipeline(list(1,2),join()) -plugins:common -text
    -script:dist/myScript.jb // script file with all the params string with #
    -main:button("hello") // profile to run. mandatory or use runCtx.
    -wrap:prune(MAIN) // optional. profile that wraps the 'main' profile
    -sourceCode:{ "project": ["studio"], "plugins": ["*"] } // "libsToinit" :"lib1,lib2"
    -spy: 'remote' // optional default is 'error'
    -plugins:zui,ui  // optional (shortcut for sourceCode.plugins)
    -project:studio  // optional (shortcut for sourceCode.project)
    -uri:main // optional. jbm uri default is "main"
    -dsl:myDsl // optional. dsl of the main profile default is ""
    -verbose // show params, vars, and generated tgp code
    -text // result as text
    -doNotStripResult // result as Is
    %v1:val // variable values
    %p1:val||script // param values
    -runCtx:... // json of runCtx instead of main/wrap/vars and params 
`)
    process.exit(1)
}
if (verbose)
    console.log(JSON.stringify(process.argv))

const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')

;(async () => {
    const cmd = ['node --inspect-brk ../hosts/node/jb.js', 
        ...process.argv.slice(2).map(arg=> (arg.indexOf("'") != -1 ? `"${arg.replace(/"/g,`\\"`).replace(/\$/g,'\\$')}"` : `'${arg}'`))].join(' ')
    const sourceCodeStr = doGetProcessArgument('sourceCode')
    const sourceCode = sourceCodeStr ? JSON.parse(sourceCodeStr) 
        : { plugins:_plugins ? _plugins.split(',') : [], project, pluginPackages: {$:'defaultPackage'} }

    globalThis.jb = await jbInit(uri||'main', sourceCode)
    jb.spy.initSpy({spyParam: [spy,'error'].filter(x=>x).join(',')})
    // loading remote-context.js
    const plugin = jb.plugins.remote
    const fileSymbols = plugin.files.find(x=>x.path.match(/remote-context/))
    await jb.loadjbFile(fileSymbols.path,jb,{fileSymbols,plugin})
    await jb.initializeLibs(fileSymbols.libs)

    if (runCtx)
        return await runAndEmitResult(jb.remoteCtx.deStrip(JSON.parse(runCtx)))

    const {params, vars} = calcParamsAndVars()
    if (verbose)
        console.log(JSON.stringify({params, vars}))

    const wrapperCode = wrap ? `component('wrapperToRun', { impl: ${wrap.replace(/MAIN/g,"{$: 'data<>mainToRun'}")} })` : ''
    const mainCmpId = main.split('(')[0]
    const mainShortId = mainCmpId.split('>').pop()
    const dslType = mainCmpId.indexOf('<') != -1 ? mainCmpId.split('>')[0] + '>'
        : jb.comps[`data<>${mainShortId}`] ? 'data<>'
        : jb.comps[`action<>${mainShortId}`] ? 'action<>' : ''
    const fixedMain = main.match(/^[a-zA-Z_\.]+$/) ? `${main}()` : main
    const withTypeAdapter = `typeAdapter('${dslType}',${fixedMain})`
    const code = `
    const params = {${params.map(p=>`${p[0]}: ${p[1].match(/\(|{|"/) ? p[1] : `"${p[1]}"` }`).join(', ')} }
    component('mainToRun', { impl: ${withTypeAdapter} })
    Object.assign(jb.core.unresolvedProfiles[0].comp.impl,params)
    ${wrapperCode}
`
    if (verbose) console.log(JSON.stringify({code}))

    const {compId, err} = evalProfileDef(code,dsl)
    if (err)
        return console.log(JSON.stringify({error: { desc: 'can not resolve profile', err }}))
    
    await runAndEmitResult(() => jb.utils.resolveDelayed(new jb.core.jbCtx().setVars(vars).run({$: compId})))

    async function runAndEmitResult(f) {
        let res = null, exception = null
        try {
            res = await f()
        } catch(e) {
            exception = e
        }
        const result = { result: res, exception, errors: [...jb.spy.search('error')], logs: [...jb.spy.logs], main }
        try {
            const res1 = resultAsText ? res : {...result}
            const res2 = doNotStripResult ? res1 : jb.remoteCtx.stripData(res1)
            const resStr = res2 ? JSON.stringify(res2) : ''
            process.stdout.write(resStr)
            process.stdout.end()
            process.stdout.on('finish', () => process.exit(0))
        } catch(err) {
            return console.log(JSON.stringify({ desc: 'can not stringify result', err }))
        }
    }
})()


function calcParamsAndVars() {
    const params = jb.path(jb.utils.getCompById(main.split('(')[0],{dsl}),'params') || []
    const all = process.argv.filter(arg=>arg.indexOf('%') == 0).map(x=>splitColon(x.slice(1)))
    let vars = {}
    all.filter(p=>!isParam(p[0])).forEach(v=>{
        const ctx = new jb.core.jbCtx().setVars(vars)
        const { profile } = evalInContext(v[1])
        vars[v[0]] = profile && ctx.run(profile) || jb.expression.calc(v[1],ctx)
    })

    return { vars, params: all.filter(p=>isParam(p[0])) }

    function isParam(paramId) {
        return params.find(p=>p.id == paramId)
    }
    function splitColon(str) {
        const index = str.indexOf(':')
        if (index == -1) return [str]
        return [str.slice(0,index), str.slice(index+1)]
    }
}

function evalProfileDef(code, fileDsl) { 
    try {
      jb.core.unresolvedProfiles = []
      const context = { jb, ...jb.macro.proxies, component: (...args) => jb.component(...args,{fileDsl}) }
      const res = new Function(Object.keys(context), `${code}`).apply(null, Object.values(context))
      const compId = jb.core.unresolvedProfiles.slice(-1)[0].id
      jb.utils.resolveLoadedProfiles()
      return { compId }
    } catch (e) { 
      return {err: e}
    } 
}

function evalInContext(code, fileDsl) { 
    try {
        const context = { jb, ...jb.macro.proxies, component: (...args) => jb.component(...args,{fileDsl}) }
        return new Function(Object.keys(context), `return ${code}`).apply(null, Object.values(context))
    } catch (e) { 
        return {err: e}
    } 
}
