const { jbHost } = require('./node-host.js')
const { getProcessArgument } = jbHost
const _params = 
      ['main','plugins','project','wrap','uri','dsl','verbose']
const [main,_plugins,project,wrap,uri,dsl,verbose] = _params.map(p=>getProcessArgument(p))

if (!main) {
    console.log(`usage: jb.js 
    -main:button("hello") // mandatory. profile to run
    -wrap:prune(MAIN) // optional. profile that wraps the 'main' profile and will be run instead
    -sourceCode:{plugins: ['*'], spyParam: 'remote', libsToinit:'lib1,lib2' }
    -plugins:zui,ui  // optional (shortcut for sourceCode.plugins)
    -project:studio  // optional (shortcut for sourceCode.project)
    -uri:main // optional. jbm uri default is "main"
    -dsl:myDsl // optional. dsl of the main profile default is ""
    -verbose // show params, vars, and generated tgp code
    %v1:val // variable values
    %p1:val||script // param values
`)
    process.exit(1)
}
if (verbose)
    console.log(JSON.stringify(process.argv))

const { jbInit } = require(jbHost.jbReactDir + '/plugins/loader/jb-loader.js')

;(async () => {
    const cmd = ['node --inspect-brk ../hosts/node/jb.js', 
        ...process.argv.slice(2).map(arg=> (arg.indexOf("'") != -1 ? `"${arg.replace(/"/g,`\\"`).replace(/\$/g,'\\$')}"` : `'${arg}'`))].join(' ')
    const sourceCodeStr = getProcessArgument('sourceCode')
    const sourceCode = sourceCodeStr ? JSON.parse(sourceCodeStr) 
        : { plugins:_plugins ? _plugins.split(',') : [], project, pluginPackages: {$:'defaultPackage'} }
    //sourceCode.plugins.push('remote') // used for jb.remoteCtx.stripData

    globalThis.jb = await jbInit(uri||'main', sourceCode)

    const {params, vars} = calcParamsAndVars()
    if (verbose)
        console.log(JSON.stringify({params, vars}))

    const wrapperCode = wrap ? `component('wrapperToRun', { impl: ${wrap.replace(/MAIN/g,"{$: 'mainToRun'}")} })` : ''
    const code = `
    const params = {${params.map(p=>`${p[0]}: ${p[1].match(/\(|{|"/) ? p[1] : `"${p[1]}"` }`).join(', ')} }
    component('mainToRun', { impl: ${main} })
    Object.assign(jb.core.unresolvedProfiles[0].comp.impl,params)
    ${wrapperCode}
`
    if (verbose) console.log(JSON.stringify({code}))

    const {compId, err} = evalProfileDef(code,dsl)
    if (err)
        return console.log(JSON.stringify({error: { desc: 'can not resolve profile', cmd, err }}))

    const res = await jb.utils.resolveDelayed(new jb.core.jbCtx().setVars(vars).run({$: compId}))
    const result = { result: res, cmd }
    try {
        console.log(JSON.stringify(stripData({...result})))
    } catch(err) {
        return console.log(JSON.stringify({error: { desc: 'can not stringify result', err }}))
    }
})()

function calcParamsAndVars() {
    const params = jb.path(jb.utils.getComp(main.split('(')[0],{dsl}),'params') || []
    const all = process.argv.filter(arg=>arg.indexOf('%') == 0).map(x=>splitColon(x.slice(1)))
    let vars = {}
    all.filter(p=>!isParam(p[0])).forEach(v=>{
        const ctx = new jb.core.jbCtx().setVars(vars)
        const { profile } = resolveMacros(v[1])
        vars[v[0]] = profile ? ctx.run(profile) : jb.expression.calc(v[1],ctx)
    })

    return {
        params: all.filter(p=>isParam(p[0])),
        vars
    }

    function isParam(paramId) {
        return params.find(p=>p.id == paramId)
    }
    function splitColon(str) {
        const index = str.indexOf(':')
        if (index == -1) return [str]
        return [str.slice(0,index), str.slice(index+1)]
    }
}

// function getProcessArgument(argName) {
//     for (let i = 0; i < process.argv.length; i++) {
//       const arg = process.argv[i];
//       if (arg.indexOf('-' + argName + ':') == 0) 
//         return arg.substring(arg.indexOf(':') + 1);
//       if (arg == '-' + argName) return true;
//     }
//     return '';
// }

function evalProfileDef(code, dsl) { 
    try {
      jb.core.unresolvedProfiles = []
      const context = { jb, ...jb.macro.proxies, component: (...args) => jb.component({},dsl,...args) }
      const res = new Function(Object.keys(context), `${code}`).apply(null, Object.values(context))
      const compId = jb.core.unresolvedProfiles.slice(-1)[0].id
      jb.utils.resolveLoadedProfiles()
      return { compId }
    } catch (e) { 
      return {err: e}
    } 
}

function resolveMacros(code, dsl) { 
    try {
        const context = { jb, ...jb.macro.proxies, component: (...args) => jb.component({},dsl,...args) }
        return new Function(Object.keys(context), `return ${code}`).apply(null, Object.values(context))
    } catch (e) { 
        return {err: e}
    } 
}

function stripData(data, { top, depth, path} = {}) {
    if (data == null) return
    const innerDepthAndPath = key => ({depth: (depth || 0) +1, top: top || data, path: [path,key].filter(x=>x).join('~') })

    if (['string','boolean','number'].indexOf(typeof data) != -1) return data
    if (typeof data == 'function')
         return
    if (data instanceof jb.core.jbCtx)
         return
    if (depth > 10) {
         jb.logError('stripData too deep object, maybe recursive',{top, path, depth, data})
         return
    }

    if (Array.isArray(data))
         return data.slice(0,30).map((x,i)=> stripData(x, innerDepthAndPath(i)))
    if (typeof data == 'object' && ['DOMRect'].indexOf(data.constructor.name) != -1)
        return jb.objFromEntries(Object.keys(data.__proto__).map(k=>[k,data[k]]))
    if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
        return { $$: data.constructor.name }
    if (typeof data == 'object' && data.comps)
        return { uri : data.uri}
    if (typeof data == 'object')
         return jb.objFromEntries(jb.entries(data)
            .filter(e=> data.$ || typeof e[1] != 'function') // if not a profile, block functions
//                .map(e=>e[0] == '$' ? [e[0], jb.path(data,[jb.core.CT,'comp',jb.core.CT,'fullId']) || e[1]] : e)
            .map(e=>[e[0],stripData(e[1], innerDepthAndPath(e[0]) )]))
}