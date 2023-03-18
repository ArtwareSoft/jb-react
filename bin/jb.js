// const fs = require('fs')
// const util = require('util')

const [main,_plugins,_projects,wrap,base_dir,spy,uri,dsl,libsToinit,verbose] = 
    ['main','plugins','projects','wrap','base_dir','spy','uri','dsl','libsToinit','verbose']
        .map(x=>getProcessArgument(x))

if (!main) {
    console.log(`usage: jb.js 
    -main:button("hello") // mandatory. profile to run
    -wrap:pipeline(MAIN,prune()) // optional. profile that wraps the 'main' profile and will be run instead
    -plugins:zui,ui  // optional. plugins to use. default is all stable plugins
    -projects:studio,test  // optional
    -base_dir: // base dir under which to look for /plugins and /projects . defualt is '.' or projects/jb-react
    -spy:uiComp // optional. log events to spy
    -uri:main // optional. jbm uri default is "main"
    -dsl:myDsl // optional. dsl of the main profile default is ""
    -libsToinit:lib1,lib2 // optional. default is to init all libs in loaded projects/plugins
    -verbose // show params, vars, and generated tgp code
    %v1:val // variable values
    %p1:val||script // param values
`)
    process.exit(1)
}
if (verbose)
    console.log(JSON.stringify(process.argv))

const underJbReact = (__dirname.match(/projects\/jb-react(.*)$/) || [''])[1]
global.jbBaseUrl = base_dir || underJbReact != null ? __dirname.slice(0,-1*underJbReact.length) : '.'
require(jbBaseUrl+ '/hosts/node/node-utils.js')

const { jbInit, jb_plugins } = require(jbBaseUrl+ '/src/loader/jb-loader.js')
globalThis.jbInit = jbInit
globalThis.jb_plugins = jb_plugins

;(async () => {
    const projects = _projects ? _projects.split(',') : null
    const plugins = _plugins ? _plugins.split(',') : null
    globalThis.jb = await jbInit(uri||'main', {
        projects, plugins: plugins || jb_plugins, doNoInitLibs: libsToinit ? true: false //, useFileSymbolsFromBuild: true
    })
    try {
        await libsToinit && jb.initializeLibs(libsToinit.split(','))
    } catch(err) {
        return console.log(JSON.stringify({error: { desc: 'error while initializing libraries', libsToinit, err }}))
    }

    globalThis.spy = spy && jb.spy.initSpy({spyParam: spy})
    const {params, vars} = calcParamsAndVars()
    if (verbose)
        console.log(JSON.stringify({params, vars}))

    const wrapperCode = wrap ? `jb.component('wrapperToRun', { impl: ${wrap.replace(/MAIN/g,"{$: 'mainToRun'}")} })` : ''
    const code = `
    const params = {${params.map(p=>`${p[0]}: ${p[1].match(/\(/) ? p[1] : `"${p[1]}"` }`).join(', ')} }
    jb.component('mainToRun', { impl: ${main} })
    Object.assign(jb.core.unresolvedProfiles[0].comp.impl,params)
    ${wrapperCode}
`
    if (verbose) console.log(JSON.stringify({code}))

    const {compId, err} = evalProfileDef(code,dsl)
    if (err)
        return console.log(JSON.stringify({error: { desc: 'can not resolve profile', main, wrap, err }}))

    const result = await jb.utils.resolveDelayed(new jb.core.jbCtx().setVars(vars).run({$: compId}))
    try {
        console.log(JSON.stringify(jb.remoteCtx.stripData(result)))
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

function getProcessArgument(argName) {
    for (let i = 0; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.indexOf('-' + argName + ':') == 0) 
        return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
      if (arg == '-' + argName) return true;
    }
    return '';
}

function evalProfileDef(code, dsl) { 
    try {
        jb.core.unresolvedProfiles = []
        const funcId = dsl ? `$$dsl_${dsl}$` : ''
        jb.frame.eval(`(function ${funcId}() { ${jb.macro.importAll()}; ${code} })()`)
        const compId = jb.core.unresolvedProfiles.slice(-1)[0].id
        jb.utils.resolveLoadedProfiles()
        return { compId }
    } 
    catch (e) { 
        return {err: e}
    } 
}  

function resolveMacros(code, dsl) { 
    try {
        const funcId = dsl ? `$$dsl_${dsl}$` : ''
        return { profile: jb.frame.eval(`(function ${funcId}() { ${jb.macro.importAll()}; return ${code} })()`) }
    } 
    catch (e) { 
        return {err: e}
    } 
}