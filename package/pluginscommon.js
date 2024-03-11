async function jbLoadPacked({uri,initSpyByUrl}={}) {
const jb = {"sourceCode":{"plugins":["common"]},"loadedFiles":{},"plugins":{"common":{"id":"common","dependent":["core"],"proxies":["pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test"],"files":["/plugins/common/jb-common.js"]},"core":{"id":"core","dependent":[],"proxies":["call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test"],"files":["/plugins/core/core-components.js","/plugins/core/core-utils.js","/plugins/core/db.js","/plugins/core/jb-core.js","/plugins/core/jb-expression.js","/plugins/core/jb-macro.js","/plugins/core/spy.js"]}}}
jb.uri = uri || 'main'
jb.startTime = new Date().getTime()
function jbCreatePlugins(jb,plugins) {
  jbHost.defaultCodePackage = jbHost.defaultCodePackage || jbHost.codePackageFromJson()
  plugins.forEach(plugin=> {
    jb.plugins[plugin.id] = jb.plugins[plugin.id] || { ...plugin, codePackage : jbHost.defaultCodePackage }
  })
}
function jbLoadPackedFile({lineInPackage, jb, noProxies, path,fileDsl,pluginId}, loadFunc) {
  if (jb.loadedFiles[path]) return
  const plugin = jb.plugins[pluginId]
  const proxies = noProxies ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
  const context = { jb, 
    ...(typeof require != 'undefined' ? {require} : {}),
    ...proxies,
    component:(id,comp) => jb.component(id,comp,{plugin,fileDsl,path,lineInPackage}),
    extension:(libId, p1 , p2) => jb.extension(libId, p1 , p2,{plugin,path,lineInPackage}),
    using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
  }
  try {
      loadFunc(context)
      jb.loadedFiles[path] = true
  } catch (e) {
  }
}

jbloadPlugins(jb,jbLoadPackedFile)
if (initSpyByUrl) jb.spy.initSpyByUrl()

jb.initializeTypeRules(["utils","db","core","expression","macro","syntaxConverter","spy"])
await jb.initializeLibs(["utils","db","core","expression","macro","syntaxConverter","spy"])
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}

function jbloadPlugins(jb,jbLoadPackedFile) {
jbLoadPackedFile({lineInPackage:43, jb, noProxies: true, path: '/plugins/core/jb-core.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
Object.assign(jb, {
  extension(libId, p1 , p2,{plugin,path,lineInPackage}={}) {
    const extId = typeof p1 == 'string' ? p1 : 'main'
    const extension = p2 || p1
    const lib = jb[libId] = jb[libId] || {__extensions: {} }
    const funcs = Object.keys(extension).filter(k=>typeof extension[k] == 'function').filter(k=>!k.match(/^initExtension/))
    const initialized = !!lib.__extensions[extId]
    funcs.forEach(k=> {
      extension[k].extId = extId
      extension[k].__initFunc = extension.initExtension && `#${libId}.__extensions.${extId}.init`
    })
    funcs.forEach(k=>lib[k] = extension[k])
    const location = jb.calcSourceLocation(new Error().stack.split(/\r|\n/).slice(2), plugin,path,lineInPackage)
    const phase =  extension.$phase || { core: 1, utils: 5, db: 10, watchable: 20}[libId] || 100
    if (extension.initExtension) 
      extension.initExtension.requireFuncs = extension.$requireFuncs
    lib.__extensions[extId] = { plugin, libId, phase, init: extension.initExtension, initialized, typeRules: extension.typeRules,
      requireLibs: extension.$requireLibs, requireFuncs: extension.$requireFuncs, funcs, location }

    if (jb.noSupervisedLoad && extension.initExtension) {
      Object.assign(lib, extension.initExtension.apply(lib))
      lib.__extensions[extId].initialized = true
    }
  },
  async initializeLibs(_libs) {
    const jb = this
    const unknownLibs = _libs.filter(l=>!jb[l]).join(',')
    unknownLibs && jb.logError('initializeLibs: unknownLibs',{unknownLibs})
    const libs = _libs.filter(l=>jb[l])
    try {
    libs.flatMap(l => Object.values(jb[l].__extensions)).sort((x,y) => x.phase - y.phase )
      .filter(ext => ext.init && !ext.initialized)
      .forEach(ext => {          
          Object.assign(jb[ext.libId], ext.init.apply(jb[ext.libId]))
          ext.initialized = true
      })
    } catch (e) {
      jb.logException(e,'initializeLibs: error initializing libs', {libs})
    }
    const libsToLoad = libs.flatMap(l => Object.values(jb[l].__extensions))
      .flatMap(ext => (ext.requireLibs || []).filter(url => !jb.__requiredLoaded[url]).map(url=>({url,plugin: ext.plugin})) )
    try {
      await Promise.all(libsToLoad.map( ({url,plugin}) => Promise.resolve(loadLib(url,plugin))
        .then(() => jb.__requiredLoaded[url] = true) ))
    } catch (e) {
      jb.logException(e,'initializeLibs: error loading external library', {libsToLoad, libs})
    }

    async function loadLib(url,plugin) {
      const codePackage = plugin.codePackage || jbHost.codePackageFromJson()
      try {
        const code = await codePackage.fetchFile(`${jbHost.baseUrl||''}${url}`)
        eval(code)
      } catch(e) {
        jb.logError('error loading library',{url,plugin})
      }
    }
  },
  initializeTypeRules(libs) {
    jb.macro.initializedTypeRules = jb.macro.initializedTypeRules || {}
    jb.macro.typeRules = [...(jb.macro.typeRules||[]), ...libs.filter(l=>jb[l]).flatMap(l => Object.entries(jb[l].__extensions))
      .flatMap(([extId,ext])=>{
        const key = `${ext.libId}--${extId}`
        if (jb.macro.initializedTypeRules[key]) return []
        jb.macro.initializedTypeRules[key] = true
        return ext.typeRules||[]
      })]
  },
  calcSourceLocation(errStack,plugin,_path,lineInPackage) {
    try {
        const line = errStack.map(x=>x.trim()).filter(x=>x && !x.match(/^Error/) && !x.match(/at Object.component|at component|at extension/)).shift()
        const location = line ? (line.split('at ').pop().split('eval (').pop().split(' (').pop().match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        location[0] = location[0].split('?')[0]
        if (location[0].match(/jb-loader.js/)) debugger
        const path = _path || location[0]
        return { repo: ((plugin || {}).codePackage || {}).repo||'', path, line: location[1] - (lineInPackage || 0) }
    } catch(e) {
      console.log(e)
    }      
  },
  component(id,comp,{plugin, fileDsl,path,lineInPackage} = {}) {
    if (!jb.core.CT) jb.initializeLibs(['core']) // this line must be first
    plugin = plugin || jb.plugins[comp.$plugin] || {}
    comp.$comp = true
    comp.$fileDsl = comp.$fileDsl || fileDsl || ''
    comp.$plugin = comp.$plugin || plugin.id || ''
    comp.$dsl = comp.$dsl || fileDsl || plugin.dsl || ''
    // const line = (comp_locations && comp_locations.find(x=>x[0] == id) || [])[1]
    // if (line !== null) comp.$location = {line, path}
    comp.$location = comp.$location || jb.calcSourceLocation(new Error().stack.split(/\r|\n/), plugin,path,lineInPackage) || ''

    if (comp.type == 'any')
      jb.core.genericCompIds[id] = true

    comp.impl = comp.impl || (({params}) => params) // maybe we need $impl ...
    const h = jb.core.onAddComponent.find(x=>x.match(id,comp))
    if (h && h.register)
      return h.register(id,comp)

    jb.core.unresolvedProfiles.push({id,comp})
    if (comp.isSystem || comp.isMacro)
      jb.comps[id] = comp
    return comp
  },
  dsl() {},
  pluginDsl() {},
  using() {},
  noSupervisedLoad: true
})

extension('core', {
  initExtension() {
    Object.assign(jb, {
      [Symbol.for('jb-version')]: '4.1.0beta',
      frame: globalThis,
      comps: {}, ctxDictionary: {},
      __requiredLoaded: {},
    })
    return {
      ctxCounter: 0,
      VERSION: Symbol.for('jb-version'),
      CT: Symbol.for('CT'), // compile time
      jstypes: jb.core._jsTypes(),
      onAddComponent: [],
      unresolvedProfiles: [],
      genericCompIds: {}
    }
  },
  run(ctx,parentParam,settings) {
    //  ctx.profile && jb.log('core request', [ctx.id,...arguments])
      if (ctx.probe && !ctx.probe.active) return
      const runner = () => jb.core.doRun(...arguments)
      Object.defineProperty(runner, 'name', { value: `${ctx.path} ${ctx.profile && ctx.profile.$ ||''}-run` })
      // if (ctx.probe)
      //   ctx.profile = ctx.probe.alternateProfile(ctx)
      let res = runner(...arguments)
      if (ctx.probe)
          res = jb.probe.record(ctx,res) || res
      
    //  ctx.profile && jb.log('core result', [ctx.id,res,ctx,parentParam,settings])
      if (typeof res == 'function') jb.utils.assignDebugInfoToFunc(res,ctx)
      return res
  },
  doRun(ctx,parentParam,settings) {
    try {
      const profile = ctx.profile
      if (profile == null || (typeof profile == 'object' && profile.$disabled))
        return jb.core.castToParam(null,parentParam)
      //if (ctx.path == 'test<>dataTest.join~impl~calculate') debugger
      if (profile.data && ! jb.path(settings, 'dataUsed')) {
          const data = ctx.setData(ctx.runInner(profile.data, {}, 'data'))
          // if (jb.utils.isPromise(data))
          //   return data.then(_data=>jb.core.doRun(_data,parentParam,{...(settings||{}), dataUsed: true}))
          return jb.core.doRun(data,parentParam,{...(settings||{}), dataUsed: true})
      }

      if (profile.$asIs) return profile.$asIs
      if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
          parentParam.as = 'array'

      if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
        return
      const ctxWithVars = jb.core.extendWithVars(ctx,profile.$vars)
      const run = jb.core.prepare(ctxWithVars,parentParam)
      ctx.parentParam = parentParam
      const {castToParam } = jb.core
      if (profile.$debug) debugger
      switch (run.type) {
        case 'booleanExp': return castToParam(jb.expression.calcBool(profile, ctx,parentParam), parentParam)
        case 'expression': return castToParam(jb.expression.calc(profile, ctx,parentParam), parentParam)
        case 'asIs': return profile
        case 'function': return castToParam(profile(ctx,ctx.vars,ctx.cmpCtx && ctx.cmpCtx.params),parentParam)
        case 'null': return castToParam(null,parentParam)
        case 'ignore': return ctx.data
        case 'list': return profile.map((inner,i) => ctxWithVars.runInner(inner,null,i))
        case 'runActions': return jb.comps['action<>runActions'].impl(new jb.core.jbCtx(ctxWithVars,{profile: { actions : profile },path:''}))
        case 'profile':
          if (!run.impl)
            run.ctx.callerPath = ctx.path;
          const calcParam = paramObj => {
            const paramVal = paramObj.type == 'function' ? paramObj.outerFunc(run.ctx) 
            : paramObj.type == 'primitive' ? paramObj.val
            : paramObj.type == 'array' ? paramObj.array.map(function prepareParamItem(prof,i) { 
                  return prof != null && jb.core.run(new jb.core.jbCtx(run.ctx,{
                        profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param)
                  })
            : jb.core.run(new jb.core.jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
            return paramVal
          }

          Object.defineProperty(calcParam, 'name', { value: `${run.ctx.path} ${profile.$ ||''}-calc param` })

          run.preparedParams.forEach(paramObj => run.ctx.params[paramObj.name] = calcParam(paramObj))
          const out = run.impl ? run.impl.call(null,run.ctx,...run.preparedParams.map(param=>run.ctx.params[param.name]))
            : jb.core.run(new jb.core.jbCtx(run.ctx, { cmpCtx: run.ctx }),parentParam)
          return castToParam(out,parentParam)
      }
    } catch (e) {
      if (ctx.vars.$throw || e == 'probe tails') throw e
      jb.logException(e,'exception while running run',{ctx,parentParam,settings})
    }
  },
  extendWithVars(ctx,vars) {
    if (Array.isArray(vars))
      return vars.reduce((_ctx,{name,val},i) => _ctx.setVar(name,_ctx.runInner(val || '%%', null,`$vars~${i}~val`)), ctx )
    if (vars)
      jb.logError('$vars should be array',{ctx,vars})
    return ctx
  },
  prepareParams(comp_name,comp,profile,ctx) {
    return jb.utils.compParams(comp)
      .filter(param=> !param.ignore)
      .map(param => {
        const p = param.id
        let val = profile[p], path =p
        const nullValueOfParam = typeof val == 'string' && val == `%$${p}%` && ctx.cmpCtx && ctx.cmpCtx.params[p] === null
        const defaultValue = param.defaultValue
        const defaultValuePath = defaultValue !== undefined && [comp_name, 'params', jb.utils.compParams(comp).indexOf(param), 'defaultValue'].join('~')
        const isNullValue = val === undefined || nullValueOfParam
        const valOrDefault = isNullValue ? (defaultValue !== undefined ? defaultValue : null) : val
      //  const isNullValueOld = val === undefined // || nullValueOfParam
      //  const valOrDefaultOld = isNullValueOld ? (defaultValue !== undefined ? defaultValue : null) : val
      //  if (valOrDefault !== valOrDefaultOld) debugger

        const usingDefault = isNullValue && defaultValue !== undefined
        const forcePath = usingDefault && defaultValuePath
        if (forcePath) path = ''

        const valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
        const arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray)
        //if (param.type && param.type.indexOf('[]') > -1 && !Array.isArray(valOrDefaultArray)) debugger

        if (param.dynamic) {
          const outerFunc = runCtx => {
            let func;
            if (arrayParam)
              func = (ctx2,data2) => jb.utils.flattenArray(valOrDefaultArray.map((prof,i)=> runCtx.extendVars(ctx2,data2).runInner(prof, {...param, as: 'asIs'}, path+'~'+i)))
            else
              func = (ctx2,data2) => jb.core.run(new jb.core.jbCtx(runCtx.extendVars(ctx2,data2),{ profile: valOrDefault, forcePath, path } ),param)

            const debugFuncName = valOrDefault && valOrDefault.$ || typeof valOrDefault == 'string' && valOrDefault.slice(0,10) || ''
            Object.defineProperty(func, 'name', { value: p + ': ' + debugFuncName })
            Object.assign(func,{profile: valOrDefault,runCtx,path,srcPath: ctx.path,forcePath,param})
            return func
          }
          return { name: p, type: 'function', outerFunc, path, param, forcePath };
        }

        if (arrayParam) // array of profiles
          return { name: p, type: 'array', array: valOrDefaultArray, param: Object.assign({},param,{type:param.type.split('[')[0],as:null}), forcePath, path };
        if (param.as == 'string' && typeof valOrDefault == 'string' && valOrDefault.indexOf('%') == -1)
          return { name: p, type: 'primitive', val: valOrDefault }
        return { name: p, type: 'run', prof: valOrDefault, param, forcePath, path };
    })
  },
  prepare(ctx,parentParam) {
    const profile = ctx.profile
    const profile_jstype = typeof profile
    const parentParam_type = parentParam && parentParam.type
        const jstype = parentParam && parentParam.as
    const isArray = Array.isArray(profile)

    if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' }
    if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' }// native primitives
    if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' }
    if (profile_jstype === 'string') return { type: 'expression' }
    if (profile_jstype === 'function') return { type: 'function' }
    if (profile_jstype === 'object' && (profile instanceof RegExp)) return { type: 'asIs' }
    if (profile == null) return { type: 'asIs' }

    if (isArray) {
      if (!profile.length) return { type: 'null' }
      if (!parentParam || !parentParam.type || parentParam.type === 'data' ) //  as default for array
        return { type: 'list' }
      if (parentParam_type === 'action' || parentParam_type === 'action[]' && profile.isArray) {
        profile.sugar = true
        return { type: 'runActions' }
      }
    }
    const comp_name = profile.$$
    if (!comp_name)
      return { type: 'asIs' }
    if (profile.$unresolved)
      jb.logError(`core: prepare - unresolved profile at ${ctx.path}`, {profile, ctx})

    const comp = jb.comps[comp_name]
    if (!comp && comp_name) { jb.logError('component ' + comp_name + ' is not defined', {ctx}); return { type:'null' } }
    if (comp.impl == null) { jb.logError('component ' + comp_name + ' has no implementation', {ctx}); return { type:'null' } }

    const resCtx = Object.assign(new jb.core.jbCtx(ctx,{}), {parentParam, params: {}})
    const preparedParams = jb.core.prepareParams(comp_name,comp,profile,resCtx)
    if (typeof comp.impl === 'function') {
      Object.defineProperty(comp.impl, 'name', { value: comp_name })
      return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams }
    } else
      return { type:'profile', ctx: new jb.core.jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams }
  },
  castToParam: (value,param) => jb.core.tojstype(value,param ? param.as : null),
  tojstype: (v,jstype) => (!jstype || !jb.core.jstypes[jstype]) ? v : jb.core.jstypes[jstype](v),
  jbCtx: class jbCtx {
    constructor(ctx,ctx2) {
      this.id = jb.core.ctxCounter++
  //    this._parent = ctx
      if (typeof ctx == 'undefined') {
        this.vars = {}
        this.params = {}
      } else {
        if (ctx2.profile && ctx2.path == null) {
          debugger
          ctx2.path = '?'
        }
        this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : ctx.profile

        this.path = (ctx.path || '') + (ctx2.path ? '~' + ctx2.path : '')
        if (ctx2.forcePath)
          this.path = this.forcePath = ctx2.forcePath
        if (ctx2.comp)
          this.path = ctx2.comp + '~impl'
        this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : ctx.data     // allow setting of data:null
        this.vars= ctx2.vars ? Object.assign({},ctx.vars,ctx2.vars) : ctx.vars
        this.params= ctx2.params || ctx.params
        this.cmpCtx= (typeof ctx2.cmpCtx != 'undefined') ? ctx2.cmpCtx : ctx.cmpCtx
        this.probe= ctx.probe
      }
    }
    run(profile,parentParam) {
      const expectedType = typeof parentParam == 'string' ? parentParam : jb.path(parentParam,'$type') || jb.path(parentParam,'type')
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType}), comp: profile.$ , path: ''}), parentParam)
    }
    calc(profile) {
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType: 'data<>'}), comp: profile.$ , path: ''}))
    }
    runAction(profile) {
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType: 'action<>'}), comp: profile.$ , path: ''}))
    }
    exp(exp,jstype) { return jb.expression.calc(exp, this, {as: jstype}) }
    setVars(vars) { return new jb.core.jbCtx(this,{vars: vars}) }
    setVar(name,val) { return name ? (name == 'datum' ? new jb.core.jbCtx(this,{data:val}) : new jb.core.jbCtx(this,{vars: {[name]: val}})) : this }
    setData(data) { return new jb.core.jbCtx(this,{data: data}) }
    runInner(profile,parentParam, path) { return jb.core.run(new jb.core.jbCtx(this,{profile: profile,path}), parentParam) }
    bool(profile) { return this.run(profile, { as: 'boolean'}) }
    // keeps the ctx vm and not the caller vm - needed in studio probe
    ctx(ctx2) { return new jb.core.jbCtx(this,ctx2) }
    frame() { // used for multi windows apps. e.g., studio
      return jb.frame
    }
    extendVars(ctx2,data2) {
      if (ctx2 == null && data2 == null)
        return this;
      return new jb.core.jbCtx(this, {
        vars: ctx2 ? ctx2.vars : null,
        data: (data2 == null) ? ctx2.data : data2,
        forcePath: (ctx2 && ctx2.forcePath) ? ctx2.forcePath : null
      })
    }
    runItself(parentParam,settings) { return jb.core.run(this,parentParam,settings) }
    dataObj(out,vars,input) { 
      this.probe && jb.probe.record(this,out,input||out,vars)
      return {data: out, vars: vars || this.vars} 
    }
  },
  _jsTypes() { return {
    asIs: x => x,
    object(value) {
      if (Array.isArray(value))
        value = value[0]
      if (value && typeof value === 'object')
        return jb.val(value)
      return {}
    },
    string(value) {
      if (Array.isArray(value)) value = value[0]
      if (value == null) return ''
      value = jb.val(value)
      if (typeof(value) == 'undefined') return ''
      return '' + value
    },
    number(value) {
      if (Array.isArray(value)) value = value[0]
      if (value == null || value == undefined) return null // 0 is not null
      const num = Number(jb.val(value),true)
      return isNaN(num) ? null : num
    },
    array(value) {
      if (typeof value == 'function' && value.profile)
        value = value()
      value = jb.val(value)
      if (Array.isArray(value)) return value
      if (value == null) return []
      return [value]
    },
    boolean(value) {
      if (Array.isArray(value)) value = value[0]
      value = jb.val(value)
      return value && value != 'false' ? true : false
    },
    single(value) {
      if (Array.isArray(value))
        value = value[0]
      return jb.val(value)
    },
    ref(value) {
      if (Array.isArray(value))
        value = value[0]
      return jb.db.asRef(value)
    },
    'ref[]': function(value) {
      return jb.db.asRef(value)
    },
    value(value) {
      return jb.val(value)
    }
  }}
})

});

jbLoadPackedFile({lineInPackage:462, jb, noProxies: true, path: '/plugins/core/core-utils.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
// core utils promoted for easy usage
Object.assign(jb, {
    log(logName, record, options) { jb.spy && jb.spy.enabled && jb.spy.log(logName, record, options) },
    logError(err,logObj) {
      const ctx = jb.path(logObj,'ctx')
      const stack = ctx && jb.utils.callStack(ctx)
      jb.frame.window && jb.frame.console.error('%c Error: ','color: red', err, stack, logObj)
      const errObj = { err , ...logObj, stack}
      globalThis.jbHost.process && globalThis.jbHost.process.stderr.write(err)
      jb.spy && jb.spy.log('error', errObj)
    },
    logException(e,err,logObj) {
      jb.frame.window && jb.frame.console.log('%c Exception: ','color: red', err, e, logObj)
      const errObj = { e, err, stack: e.stack||'', ...logObj}
      globalThis.jbHost.process && globalThis.jbHost.process.stderr.write(`${err}\n${e}`)
      jb.spy && jb.spy.log('exception error', errObj)
    },
    tostring: value => jb.core.tojstype(value,'string'),
    toarray: value => jb.core.tojstype(value,'array'),
    toboolean: value => jb.core.tojstype(value,'boolean'),
    tosingle: value => jb.core.tojstype(value,'single'),
    tonumber: value => jb.core.tojstype(value,'number'),
    exec: (profile,parentParam='action<>') => new jb.core.jbCtx().run(profile,parentParam),
    calc: profile => new jb.core.jbCtx().calc(profile)
})

extension('utils', 'core', {
    singleInType(parentParam, tgpModel) {
        const comps = tgpModel && tgpModel.comps || jb.comps
        const _type = parentParam && parentParam.type && parentParam.type.split('[')[0]
        return _type && comps[_type] && comps[_type].singleInType && _type
    },
    dslType(fullId) {
      if (fullId.indexOf('<') == -1)
        jb.logError(`util dslType not fullId ${fullId}`,{})
      return (fullId || '').split('>')[0] + '>'
    },
    compName(profile) {
        return profile && profile.$$
    },
    resolveSingleComp(comp,id,{ tgpModel, dsl} = {}) {
      jb.utils.resolveProfileTop(id,comp, { tgpModel})
      jb.utils.resolveUnTypedProfile(comp,id, {tgpModel, dsl })
      jb.utils.resolveComp(comp, {tgpModel})
      return comp.$$
    },
    resolveLoadedProfiles() {
      const profiles = jb.core.unresolvedProfiles
      profiles.forEach(({comp,id}) => jb.utils.resolveProfileTop(id,comp))
      profiles.forEach(({comp,id}) => { 
        if (comp.$$)  {
          jb.comps[comp.$$] = comp
          ;(comp.moreTypes || '').split(',').filter(x=>x).forEach(t=>jb.comps[t+id] = comp)
        }
      })
      profiles.forEach(({comp,id}) => jb.utils.resolveUnTypedProfile(comp,id))
      profiles.forEach(({comp}) => { 
        if (comp.$$)
          jb.comps[comp.$$] = comp
        else
          jb.logError('can not resolve profile type',{comp})
      })
      jb.core.unresolvedProfiles = []
              profiles.forEach(({comp}) => jb.utils.resolveComp(comp))
      return profiles
    },
    resolveProfileTop(id, comp, {tgpModel} = {}) {
      const comps = tgpModel && tgpModel.comps || jb.comps
      ;(comp.params || []).forEach(p=> {
        if (jb.macro.systemProps.includes(p.id))
          return jb.logError(`resolveProfileTop - can not use system prop ${p.id} as param name in ${id}`,{comp})
        // fix as boolean params to have type: 'boolean'
        if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1) p.type = 'boolean<>'
        const t1 = (p.type || '').replace(/\[\]/g,'') || 'data<>'
        if (t1.indexOf(',') != -1)
          return jb.logError(`resolveProfileTop - ${p.id} param in ${id} can not have multiple types`,{t1})
        p.$type = t1.indexOf('<') == -1 ? `${t1}<${comp.$dsl}>` : t1
      })

      const type = comp.type || (jb.utils.isPrimitiveValue(comp.impl) || typeof comp.impl == 'function') && 'data<>'
      if (type) {
        comp.$type = type.indexOf('<') == -1 ? `${type}<${comp.$dsl}>` : type
        const fullId = comp.$$ = `${comp.$type}${id}`
        const existingComp = comps[fullId]
        if (existingComp && existingComp != comp) {
          jb.logError(`comp ${fullId} at ${ JSON.stringify(comp.$location)} already defined at ${JSON.stringify(existingComp.$location)}`,
            {existingComp, oldLocation: existingComp.$location, newLocation: comp.$location})
        }
      } 
      return comp     
    },
    resolveUnTypedProfile(comp,id, {tgpModel, dsl} = {}) {
      if (comp.$$ || !comp) return
      const comps = tgpModel && tgpModel.comps || jb.comps
      //if(id=='jbmTest.child') debugger
      let resolvedType = ''
      if (!comp.$$ && comp.impl && typeof comp.impl.$) {
        let nextCompId = comp.impl.$
        while(nextCompId && !resolvedType) {
            resolvedType = lookForUnknownTypeInDsl(nextCompId, comp.$dsl) || lookForUnknownTypeInDsl(nextCompId, dsl || '')
            if (!resolvedType) {
              const e = jb.core.unresolvedProfiles.find(({id}) => id == nextCompId)
              nextCompId = jb.path(e,'comp.impl.$')
            }
        }
      }
      if (resolvedType) {
        comp.$$ =`${resolvedType}${id}`
        comp.$type = resolvedType
      }
      else
        jb.logError(`can not resolve profile type for ${id}`,{comp})

      function lookForUnknownTypeInDsl(id, dsl) {
        const pattern = `<${dsl}>${id}`
        let options = jb.utils.unique(Object.keys(comps).filter(fullId =>fullId.endsWith(pattern)), x=>comps[x].$type)
        if (options.length == 0)
          options = jb.utils.unique(Object.keys(comps).filter(fullId =>fullId.endsWith(`<>${id}`)), x=>comps[x].$type)
        if (options.length == 1)
          return jb.utils.dslType(options[0])
        else if (options.length > 1 && !silent)
          jb.logError('getComp - several options for unknown type', {dsl,id,options})
      }
    },

    resolveComp(topComp, {tgpModel} = {}) {
      if (!topComp) return
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.defaultValue, {expectedType: p.$type, topComp}))
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.templateValue, {expectedType: p.$type, topComp}))
      //if (topcomp.$$ =='test<>dataTest.join') debugger
      jb.utils.resolveProfile(topComp.impl, {expectedType: topComp.$type, tgpModel, topComp, parent: topComp})
    },
    resolveProfile(prof, { expectedType, parent, parentProp, tgpModel, topComp, parentType, remoteCode} = {}) {
      if (!prof || !prof.constructor || ['Object','Array'].indexOf(prof.constructor.name) == -1) return prof
      const typeFromParent = expectedType == '$asParent<>' ? parentType || jb.utils.dslType(jb.path(parent,'$$')) : expectedType
      const typeFromAdapter = parent && parent.$ == 'typeAdapter' && parent.fromType
      const fromFullId = prof.$$ && jb.utils.dslType(prof.$$)
      const dslType = typeFromAdapter || typeFromParent || fromFullId
      if (dslType && dslType.indexOf('<') == -1) debugger
      const comp = jb.utils.resolveCompWithId(prof.$$ || prof.$, { dslType, parent, parentProp, tgpModel, topComp, parentType, remoteCode })
      if (comp)
        prof.$$ = comp.$$
      remoteCode = remoteCode || (prof.$$ || '').match(/>remote/) || (prof.$$ || '').match(/remote$/)
  
      if (prof.$unresolved && comp) {
          Object.assign(prof, jb.macro.argsToProfile(prof.$, comp, prof.$unresolved, topComp))
          if (jb.core.OrigValues) prof[jb.core.OrigValues] = prof.$unresolved
          delete prof.$unresolved
      }
      if (Array.isArray(prof)) {
        prof.forEach(v=>jb.utils.resolveProfile(v, { expectedType: dslType, parent, parentProp, topComp, tgpModel, parentType, remoteCode}))
      } else if (comp && prof.$ != 'asIs') {
        ;[...(comp.params || []), ...jb.macro.richSystemProps].forEach(p=> 
            jb.utils.resolveProfile(prof[p.id], { expectedType: p.$type, parentType: dslType, parent: prof, parentProp: p, topComp, tgpModel, remoteCode}))
        jb.utils.resolveProfile(prof.$vars, {tgpModel, topComp, expectedType: 'var<>', remoteCode})
        if (prof.$ == 'object')
          Object.values(prof).forEach(v=>jb.utils.resolveProfile(v, {tgpModel, topComp, expectedType: 'data<>', remoteCode}))
      } else if (!comp && prof.$) {
          jb.logError(`resolveProfile - can not resolve ${prof.$} at ${topComp && topComp.$$} expected type ${dslType || 'unknown'}`, 
              {compId: prof.$, prof, expectedType, dslType, topComp, parentType})
      }
      return prof
    },
    resolveCompWithId(id, {dslType, silent, tgpModel, parentProp, parent, topComp, parentType, remoteCode, dsl} = {}) {
      if (!id) return
      const comps = tgpModel && tgpModel.comps || jb.comps
      //if (id == 'css' && parent && parent.$ == 'text') debugger
      if (jb.core.genericCompIds[id])
        return comps['any<>'+id]
      if (comps[id]) return comps[id]
      if (comps[(dslType||'')+id]) return comps[(dslType||'')+id]

      const moreTypesFromProp = jb.path(parentProp,'moreTypes') || ''
      const typeFromParent = parentProp && parentProp.typeAsParent === true && parentType
      const dynamicTypeFromParent = parentProp && typeof parentProp.typeAsParent == 'function' 
        && parentProp.typeAsParent(parentType)
      const byTypeRules = [dynamicTypeFromParent,typeFromParent,dslType].filter(x=>x).join(',').split(',').filter(x=>x)
        .flatMap(t=>moreTypesByTypeRules(t)).join(',')
  
      const allTypes = jb.utils.unique([moreTypesFromProp,byTypeRules,dynamicTypeFromParent,typeFromParent,dslType].filter(x=>x).join(',').split(',').filter(x=>x))
      const byFullId = allTypes.map(t=>comps[t+id]).find(x=>x)
      if (byFullId)
        return byFullId
      const shortId = id.split('>').pop()
      const plugin = jb.path(topComp,'plugin')
      const cmps = Object.values(comps).filter(x=>x.$$)
      const bySamePlugin = plugin && cmps.find(c=> jb.path(c,'plugin') == plugin && c.$$.split('>').pop() == shortId )
      if (bySamePlugin)
        return bySamePlugin
      const byNoDsl = cmps.find(c=> c.$$.indexOf('<>') != -1 && c.$$.split('>').pop() == shortId )
      if (byNoDsl) {
         if (!silent) jb.logError('resolveCompWithId',{byNoDsl,id, topComp, parent, parentType, allTypes, dslType})
         return byNoDsl
      }
    
      //const byUnkownType = cmps.find(c=> c.$$.split('>').pop() == shortId )
      //_otherTypeInPlugin || ((!dslType || dslType == '$asParent<>') && (lookForUnknownTypeInDsl(dsl) || lookForUnknownTypeInDsl('')))
      if (id && !silent && !remoteCode) {
        debugger
        jb.logError(`utils getComp - can not find comp for id ${id}`,{id, topComp, parent, parentType, allTypes, dslType})
      }

      // function otherTypeInPlugin() {
      //   const plugin = jb.path(topComp,'plugin')
      //   const shortId = id.split('>').pop()
      //   return plugin && Object.values(comps).find(c=> jb.path(c,'plugin') == plugin && (c.$$||'').split('>').pop() == shortId )
      // }
      function moreTypesByTypeRules(type) {
        // isOf: ['boolean<>','data<>'] data -> boolean
        // same: ['data<>', 'data<llm>']
        // isOfWhenEndsWith: ['-feature<>','feature<>']
        // isOfWhenEndsWith: ['-style<>',[ 'feature<>', 'style<>' ]]
        const typeRules = tgpModel && tgpModel.typeRules || jb.macro.typeRules

        return typeRules.flatMap(rule=> jb.asArray(
            rule.isOf && type == rule.isOf[0] ? rule.isOf[1]
            : rule.same && type == rule.same[0] ? rule.same[1]
            : rule.same && type == rule.same[1] ? rule.same[0]
            : rule.isOfWhenEndsWith && type.endsWith(rule.isOfWhenEndsWith[0]) && rule.isOfWhenEndsWith[0] != type ? rule.isOfWhenEndsWith[1]
            : []))          
      }
    },
    compParams(comp) {
      return (!comp || !comp.params) ? [] : comp.params
    },
    getUnresolvedProfile: (_id, type) => (jb.core.unresolvedProfiles.find(({id, comp}) => id == _id && comp.type == type) || {}).comp,
    resolveFinishedPromise(val) {
      if (val && typeof val == 'object' && val._state == 1) // finished promise
        return val._result
      return val
    },
    isRefType: jstype => jstype === 'ref' || jstype === 'ref[]',
    calcVar(ctx,varname,jstype) {
      let res
      if (ctx.cmpCtx && ctx.cmpCtx.params[varname] !== undefined)
        res = ctx.cmpCtx.params[varname]
      else if (ctx.vars[varname] !== undefined)
        res = ctx.vars[varname]
      else if (ctx.vars.scope && ctx.vars.scope[varname] !== undefined)
        res = ctx.vars.scope[varname]
      else if (jb.db.resources && jb.db.resources[varname] !== undefined) {
        jb.db.useResourcesHandler(h => h.makeWatchable(varname))
        res = jb.utils.isRefType(jstype) ? jb.db.useResourcesHandler(h=>h.refOfPath([varname])) : jb.db.resource(varname)
      } else if (jb.db.consts && jb.db.consts[varname] !== undefined)
        res = jb.utils.isRefType(jstype) ? jb.db.simpleValueByRefHandler.objectProperty(jb.db.consts,varname) : res = jb.db.consts[varname]
    
      return jb.utils.resolveFinishedPromise(res)
    },
    callStack(ctx) {
      const ctxStack=[]; 
      for(let innerCtx=ctx; innerCtx; innerCtx = innerCtx.cmpCtx) 
        ctxStack.push(innerCtx)
      return [ctx.path, ...ctxStack.map(ctx=>ctx.callerPath).slice(1)]
    },
    ctxStack(ctx) {
      const ctxStack=[]; 
      for(let innerCtx=ctx; innerCtx; innerCtx = innerCtx.cmpCtx) 
        ctxStack.push(innerCtx)
      return ctxStack
    },
    addDebugInfo(f,ctx) { f.ctx = ctx; return f},
    assignDebugInfoToFunc(func, ctx) {
      func.ctx = ctx
      const debugFuncName = ctx.profile && ctx.profile.$ || typeof ctx.profile == 'string' && ctx.profile.slice(0,10) || ''
      Object.defineProperty(func, 'name', { value: (ctx.path ||'').split('~').pop() + ': ' + debugFuncName })
    },
    subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),  
    indexOfCompDeclarationInTextLines(lines,id) {
      return lines.findIndex(line=> {
        const index = line.indexOf(`component('${id.split('>').pop()}'`)
        return index == 0 || index == 3
      })
    },
    calcDirectory: dir => dir[0] != '/' ? `${jbHost.baseUrl}/${dir}` : dir,
})

extension('utils', 'generic', {
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
    tryWrapper(f,msg,ctx,reqCtx) { try { return f() } catch(e) { jb.logException(e,msg,{ctx,reqCtx}) }},
    flattenArray: items => items.flatMap(x=>x),
    isPromise: v => v && v != null && typeof v.then === 'function',
    isDelayed(v) {
      if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
      return typeof v === 'object' ? jb.utils.isPromise(v) : typeof v === 'function' && jb.utils.isCallbag(v)
    },
    isCallbag: v => jb.callbag && jb.callbag.isCallbag(v),
    resolveDelayed(delayed, synchCallbag) {
      if (jb.utils.isPromise(delayed))
        return Promise.resolve(delayed)
      if (! jb.asArray(delayed).find(v=> jb.utils.isCallbag(v) || jb.utils.isPromise(v))) return delayed
      return jb.utils.toSynchArray(delayed, synchCallbag)
    },
    toSynchArray(item, synchCallbag) {
      if (jb.utils.isPromise(item))
        return item.then(x=>[x])

      if (! jb.asArray(item).find(v=> jb.utils.isCallbag(v) || jb.utils.isPromise(v))) return item
      if (!jb.callbag) return Promise.all(jb.asArray(item))

      const {pipe, fromIter, toPromiseArray, mapPromise,flatMap, map, isCallbag} = jb.callbag
      if (isCallbag(item)) return synchCallbag ? toPromiseArray(pipe(item,map(x=> x && x.vars ? x.data : x ))) : item
      if (Array.isArray(item) && isCallbag(item[0])) return synchCallbag ? toPromiseArray(pipe(item[0], map(x=> x && x.vars ? x.data : x ))) : item
  
      return pipe( // array of promises
              fromIter(jb.asArray(item)),
              mapPromise(x=> Promise.resolve(x)),
              flatMap(v => Array.isArray(v) ? v : [v]),
              toPromiseArray)
    },    
    compareArrays(arr1, arr2) {
        if (arr1 === arr2)
          return true;
        if (!Array.isArray(arr1) && !Array.isArray(arr2)) return arr1 === arr2;
        if (!arr1 || !arr2 || arr1.length != arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
          const key1 = (arr1[i]||{}).key, key2 = (arr2[i]||{}).key;
          if (key1 && key2 && key1 === key2 && arr1[i].val === arr2[i].val)
            continue;
          if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    },
    objectDiff(newObj, orig) {
      if (orig === newObj) return {}
      if (!jb.utils.isObject(orig) || !jb.utils.isObject(newObj)) return newObj
      const deletedValues = Object.keys(orig).reduce((acc, key) =>
          newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: '__undefined'}
      , {})
  
      return Object.keys(newObj).reduce((acc, key) => {
        if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
        const difference = jb.utils.objectDiff(newObj[key], orig[key])
        if (jb.utils.isObject(difference) && jb.utils.isEmpty(difference)) return acc // return no diff
        return { ...acc, [key]: difference } // return updated key
      }, deletedValues)
    },
    comparePaths(path1,path2) { // 0- equals, -1,1 means contains -2,2 lexical
      path1 = path1 || ''
      path2 = path2 || ''
      let i=0;
      while(path1[i] === path2[i] && i < path1.length) i++;
      if (i == path1.length && i == path2.length) return 0;
      if (i == path1.length && i < path2.length) return -1;
      if (i == path2.length && i < path1.length) return 1;
      return path1[i] < path2[i] ? -2 : 2
    },    

    unique: (ar,f) => {
      const keys = {}, res = []
      ar.forEach(x =>{
        const key = f ? f(x) : x
        if (!keys[key]) res.push(x)
        keys[key] = true
      })
      return res
    },
    sessionStorage(id,val) {
      if (!jb.frame.sessionStorage) return
      const currentValue = JSON.parse(jb.frame.sessionStorage.getItem(id))
      return val == undefined ? currentValue : 
        jb.frame.sessionStorage.setItem(id, JSON.stringify(val && typeof val == 'object' ? {...(currentValue||{}),...val} : val))
    }
})

// common generic promoted for easy usage
Object.assign(jb, {
  path: (object,path,value) => {
        if (!object) return object
        let cur = object
        if (typeof path === 'string') path = path.split('.')
        path = jb.asArray(path)
    
        if (typeof value == 'undefined') {  // get
          return path.reduce((o,k)=>o && o[k], object)
        } else { // set
          for(let i=0;i<path.length;i++)
            if (i == path.length-1)
              cur[path[i]] = value;
            else
              cur = cur[path[i]] = cur[path[i]] || {};
          return value;
        }
  },  
  entries(obj) {
      if (!obj || typeof obj != 'object') return [];
      let ret = [];
      for(let i in obj) // please do not change. it keeps the definition order !!!!
          if (obj.hasOwnProperty && obj.hasOwnProperty(i) && i.indexOf('$jb_') != 0)
            ret.push([i,obj[i]])
      return ret
  },
  objFromEntries(entries) {
      const res = {}
      entries.forEach(e => res[e[0]] = e[1])
      return res
  },
  asArray: v => v == null ? [] : (Array.isArray(v) ? v : [v]),
  delay: (mSec,res) => new Promise(r=>setTimeout(()=>r(res),mSec)),
})

});

jbLoadPackedFile({lineInPackage:868, jb, noProxies: true, path: '/plugins/core/core-components.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
component('call', {
  type: 'any',
  hidden: true,
  description: 'invoke dynamic parameter',
  category: 'system:50',
  params: [
    {id: 'param', as: 'string', description: 'parameter name'}
  ],
  impl: (ctx,param) => {
 	  const paramObj = ctx.cmpCtx && ctx.cmpCtx.params[param]
      return typeof paramObj == 'function' ?
 		  paramObj(new jb.core.jbCtx(ctx, { cmpCtx: paramObj.runCtx, forcePath: paramObj.srcPath })) : paramObj
 	}
})

component('typeAdapter', {
  type: 'any',
  params: [
    {id: 'fromType', as: 'string', mandatory: true, description: 'e.g. type1<myDsl>'},
    {id: 'val'}
  ],
  impl: ctx => ctx.params.val
})

component('If', {
  type: 'any',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', type: '$asParent', dynamic: true, composite: true},
    {id: 'Else', type: '$asParent', dynamic: true}
  ],
  impl: ({},cond,_then,_else) => cond() ? _then() : _else()
})

component('TBD', {
  type: 'any',
  hidden: true,
  impl: 'TBD'
})

component('Var', {
  type: 'var',
  isSystem: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  },
})

component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'text', as: 'string', mandatory: true}
  ],
  macro: (result, self) => Object.assign(result,{ $remark: self.$unresolved[0] })
})

component('unknownCmp', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'id', as: 'string', mandatory: true}
  ],
  macro: (result, self) => jb.comps[self.$unresolved[0]] = { impl: ctx => jb.logError(`comp ${self.$unresolved[0]} is not defined`,{ctx})}
})

component('runCtx', {
  type: 'any',
  hidden: true,
  params: [
    {id: 'path', as: 'string'},
    {id: 'vars'},
    {id: 'profile'}
  ]
})

component('Var', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

component('vars', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

component('data', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

});

jbLoadPackedFile({lineInPackage:978, jb, noProxies: true, path: '/plugins/core/jb-expression.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('expression', {
  calc(_exp, ctx, parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    let exp = '' + _exp
    if (jstype == 'boolean') return jb.expression.calcBool(exp, ctx)
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const out = jb.expression.calc(exp.split('$log:')[1],ctx,parentParam)
      jb.comps.log.impl(ctx, out)
      return out
    }
    if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp
    if (exp == '{%%}' || exp == '%%')
        return expPart('')
  
    if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
      return expPart(exp.substring(2,exp.length-2))
  
    exp = exp.replace(/{%(.*?)%}/g, (match,contents) => jb.tostring(expPart(contents,{ as: 'string'})))
    exp = exp.replace(/{\?(.*?)\?}/g, (match,contents) => jb.tostring(conditionalExp(contents)))
    if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
      return expPart(exp.substring(1,exp.length-1),parentParam)
  
    exp = exp.replace(/%([^%;{}\s><"']*)%/g, (match,contents) => jb.tostring(expPart(contents,{as: 'string'})))
    return exp

    function expPart(expressionPart,_parentParam) {
      return jb.utils.resolveFinishedPromise(jb.expression.evalExpressionPart(expressionPart,ctx,_parentParam || parentParam))
    }
    function conditionalExp(exp) {
      // check variable value - if not empty return all exp, otherwise empty
      const match = exp.match(/%([^%;{}\s><"']*)%/)
      if (match && jb.tostring(expPart(match[1])))
        return jb.expression.calc(exp, ctx, { as: 'string' })
      else
        return ''
    }

  },
  evalExpressionPart(expressionPart,ctx,parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    // example: %$person.name%.
  
    const parts = expressionPart.split(/[./[]/)
    return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)
  
    function pipe(input,subExp,last,first,invokeFunc) {
      if (subExp == '')
         return input
      if (subExp.match(/]$/))
        subExp = subExp.slice(0,-1)
  
      const refHandler = jb.db.objHandler(input)
      if (subExp.match(/\(\)$/))
        return pipe(input,subExp.slice(0,-2),last,first,true)
      if (first && subExp.charAt(0) == '$' && subExp.length > 1) {
        const ret = jb.utils.calcVar(ctx,subExp.substr(1),last ? jstype : null)
        const _ctx = ret && ret.runCtx ? new jb.core.jbCtx(ctx, { cmpCtx: ret.runCtx, forcePath: ret.srcPath}) : ctx
        return typeof ret === 'function' && invokeFunc ? ret(_ctx) : ret
      }
      const obj = jb.val(input)
      if (subExp == 'length' && obj && typeof obj.length == 'number')
        return obj.length
      if (Array.isArray(obj) && isNaN(Number(subExp)))
        return [].concat.apply([],obj.map(item=>pipe(item,subExp,last,false,refHandler)).filter(x=>x!=null))
  
      if (input != null && typeof input == 'object') {
        if (obj == null) return
        if (typeof obj[subExp] === 'function' && (invokeFunc || obj[subExp].profile && parentParam && parentParam.dynamic)) {
          //console.log('func',obj[subExp],ctx.profile)
          return obj[subExp](ctx)
        }
        if (subExp.match(/\(\)$/)) {
          const method = subExp.slice(0,-2)
          return typeof obj[method] == 'function' && obj[method]()
        }
        if (subExp.match(/^@/) && obj.getAttribute)
            return obj.getAttribute(subExp.slice(1))
        if (jb.utils.isRefType(jstype)) {
          if (last)
            return refHandler.objectProperty(obj,subExp,ctx)
          if (obj[subExp] === undefined)
            obj[subExp] = jb.expression.implicitlyCreateInnerObject(obj,subExp,refHandler)
        }
        if (last && jstype)
            return jb.core.jstypes[jstype](obj[subExp])
        return obj[subExp]
      }
    }
  },
  implicitlyCreateInnerObject(parent,prop,refHandler) {
    jb.log('core innerObject created',{parent,prop,refHandler})
    parent[prop] = {}
    refHandler.refreshMapDown && refHandler.refreshMapDown(parent)
    return parent[prop]
  },
  calcBool(exp, ctx, parentParam) {
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const calculated = jb.expression.calc(exp.split('$log:')[1],ctx,{as: 'boolean'})
      const result = jb.expression.calcBool(exp.split('$log:')[1], ctx, parentParam)
      jb.comps.log.impl(ctx, calculated + ':' + result)
      return result
    }
    if (exp.indexOf('!') == 0)
      return !jb.expression.calcBool(exp.substring(1), ctx)
    const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/)
    if (!parts) {
      const ref = jb.expression.calc(exp, ctx, parentParam)
      if (jb.db.isRef(ref))
        return ref
      
      const val = jb.tostring(ref)
      if (typeof val == 'boolean') return val
      const asString = jb.tostring(val)
      return !!asString && asString != 'false'
    }
    if (parts.length != 4)
      return jb.logError('invalid boolean expression: ' + exp, {ctx})
    const op = parts[2].trim()
  
    if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
      const p1 = jb.tostring(jb.expression.calc(trim(parts[1]), ctx, {as: 'string'}))
      let p2 = jb.tostring(jb.expression.calc(trim(parts[3]), ctx, {as: 'string'}))
      p2 = (p2.match(/^["'](.*)["']/) || ['',p2])[1] // remove quotes
      if (op == '==') return p1 == p2
      if (op == '!=') return p1 != p2
      if (op == '^=') return p1.lastIndexOf(p2,0) == 0 // more effecient
      if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1
    }
  
    const p1 = jb.tonumber(jb.expression.calc(parts[1].trim(), ctx))
    const p2 = jb.tonumber(jb.expression.calc(parts[3].trim(), ctx))
  
    if (op == '>') return p1 > p2
    if (op == '<') return p1 < p2
    if (op == '>=') return p1 >= p2
    if (op == '<=') return p1 <= p2
  
    function trim(str) {  // trims also " and '
      return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1')
    }
  }
})

});

jbLoadPackedFile({lineInPackage:1133, jb, noProxies: true, path: '/plugins/core/db.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('db', 'onAddComponent', {
  $phase :2,
  initExtension() { 
    jb.val = ref => {
      if (ref == null || typeof ref != 'object') return ref
      const handler = jb.db.refHandler(ref)
      return handler ? handler.val(ref) : ref
    }
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.watchableData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)  
      }
    })
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.passiveData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)  
      }
    })
  },
  removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
  addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,
})

extension('db', {
    initExtension() { return { 
        passiveSym: Symbol.for('passive'),
        resources: {}, consts: {}, 
        watchableHandlers: [],
        isWatchableFunc: [], // assigned by watchable module, if loaded - must be put in array so the code loader will not pack it.
        simpleValueByRefHandler: jb.db._simpleValueByRefHandler()
      }
    },
    _simpleValueByRefHandler() { return {
        val(v) {
          if (v && v.$jb_val) return v.$jb_val()
          return v && v.$jb_parent ? v.$jb_parent[v.$jb_property] : v
        },
        writeValue(to,value,srcCtx) {
          jb.log('writeValue jbParent',{value,to,srcCtx})
          if (!to) return
          if (to.$jb_val)
            to.$jb_val(this.val(value))
          else if (to.$jb_parent)
            to.$jb_parent[to.$jb_property] = this.val(value)
          return to
        },
        push(ref,toAdd) {
          const arr = jb.asArray(jb.val(ref))
          jb.toarray(toAdd).forEach(item => arr.push(item))
        },
        asRef(value) {
          return value
        },
        isRef(value) {
          return value && (value.$jb_parent || value.$jb_val || value.$jb_obj)
        },
        objectProperty(obj,prop) {
            if (this.isRef(obj[prop]))
              return obj[prop];
            else
              return { $jb_parent: obj, $jb_property: prop };
        },
        pathOfRef: () => [],
        doOp() {},
    }},
    resource(id,val) { 
        if (typeof val !== 'undefined')
          jb.db.resources[id] = val
        jb.db.useResourcesHandler(h => h.makeWatchable(id))
        return jb.db.resources[id]
    },
    useResourcesHandler: f => jb.db.watchableHandlers.filter(x=>x.resources.id == 'resources').map(h=>f(h))[0],
    passive: (id,val) => typeof val == 'undefined' ? jb.db.consts[id] : (jb.db.consts[id] = jb.db.markAsPassive(val || {})),
    markAsPassive(obj) {
      if (obj && typeof obj == 'object') {
        obj[jb.db.passiveSym] = true
        Object.values(obj).forEach(v=>jb.db.markAsPassive(v))
      }
      return obj
    },
    addWatchableHandler: h => h && jb.db.watchableHandlers.push(h) ,
    removeWatchableHandler: h => jb.db.watchableHandlers = jb.db.watchableHandlers.filter(x=>x!=h),
    
    safeRefCall(ref,f) {
      const handler = jb.db.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler(ref) {
      if (ref && ref.handler) return ref.handler
      if (jb.db.simpleValueByRefHandler.isRef(ref)) 
        return jb.db.simpleValueByRefHandler
      return jb.db.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.db.refHandler(obj) || jb.db.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.db.simpleValueByRefHandler,
    asRef(obj) {
      const watchableHanlder = jb.db.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.db.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx,noNotifications) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.db.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    doOp: (ref,op,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.doOp(ref,op,srcCtx)),
    isRef: ref => jb.db.refHandler(ref),
    isWatchable: ref => jb.db.isWatchableFunc[0] && jb.db.isWatchableFunc[0](ref), // see remark at initExtension
    isValid: ref => jb.db.safeRefCall(ref, h=>h.isValid(ref)),
    pathOfRef: ref => jb.db.safeRefCall(ref, h=>h.pathOfRef(ref)),
    refOfPath: path => jb.db.watchableHandlers.reduce((res,h) => res || h.refOfPath(path),null),
    canChangeDB: ctx => !ctx.probe || ctx.vars.testID
})

component('isRef', {
  type: 'boolean',
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.isRef(obj)
})

component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.asRef(obj)
})

});

jbLoadPackedFile({lineInPackage:1283, jb, noProxies: true, path: '/plugins/core/jb-macro.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item)),
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

extension('macro', {
    initExtension() {
        return { 
            proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro'), 
            systemProps: ['remark', 'data', '$debug', '$disabled', '$log', 'ctx' ],
            richSystemProps: [ {id: 'data', $type: 'data<>'}] 
        }
    },
    typeRules: [{ isOf: ['data<>','boolean<>'] }],
    titleToId: id => id.replace(/-([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    newProxy: id => new Proxy(() => 0, {
        get: (o, p) => p === jb.macro.isMacro? true : jb.macro.getInnerMacro(id, p),
        apply: function (target, thisArg, allArgs) {
            const actualId = id[0] == '_' ? id.slice(1) : id
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return { $: actualId, $unresolved: args, ...system, ...(id[0] == '_' ? {$disabled:true} : {} ) }
        }
    }),   
    getInnerMacro(ns, innerId) {
        return (...allArgs) => {
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return { $: `${ns}.${innerId}`, 
                ...(args.length == 0 ? {} : { $unresolved: args }),
                ...system
            }
        }
    },
    //isParamsByNameArgs : args => args.length == 1 && typeof args[0] == 'object' && !Array.isArray(args[0]) && !jb.utils.compName(args[0]),    
    splitSystemArgs(allArgs) {
        const args = [], system = {}
        allArgs.forEach(arg => {
            if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isSystem)
                jb.comps[arg.$].macro(system, arg)
            else if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isMacro)
                args.push(jb.comps[arg.$].macro(arg))
            else
                args.push(arg)
        })
        if (args.length == 1 && typeof args[0] === 'object') {
            jb.asArray(args[0].vars).forEach(arg => jb.comps[arg.$].macro(system, arg))
            delete args[0].vars
            args[0].remark && jb.comps.remark.macro(system, args[0])
        }
        return { args, system }
    },
    argsToProfile(cmpId, comp, args, topComp) {
        if (args.length == 0)
            return { $: cmpId }        
        if (!comp)
            return { $: cmpId, $unresolved: args }
        if (cmpId == 'asIs') return { $: 'asIs', $asIs: args[0] }
        const lastArg = args[args.length-1]
        const lastArgIsByName = lastArg && typeof lastArg == 'object' && !Array.isArray(lastArg) && !lastArg.$
        const argsByValue = lastArgIsByName ? args.slice(0,-1) : args
        const propsByName = lastArgIsByName ? lastArg : {}
        const onlyByName = lastArgIsByName && args.length == 1
        const params = comp.params || []
        const param0 = params[0] || {}        
        const firstParamAsArray = (param0.type||'').indexOf('[]') != -1 && !param0.byName

        if (!lastArgIsByName) {
            if (firstParamAsArray)
                return { $: cmpId, [param0.id]: params.length > 1 && args.length == 1 ? args[0] : args }

            if (comp.macroByValue || params.length < 3)
                return { $: cmpId, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
        }

        const varArgs = []
        while (argsByValue[0] && argsByValue[0].$ == 'Var')
            varArgs.push(argsByValue.shift())
        const firstProps = onlyByName ? [] : firstParamAsArray ? { [param0.id] : argsByValue } : jb.objFromEntries(argsByValue.map((v,i) => [params[i].id, v]))
        return { $: cmpId,
            ...(varArgs.length ? {$vars: varArgs} : {}),
            ...firstProps, ...propsByName
        }
    },
    registerProxy: id => {
        const proxyId = jb.macro.titleToId(id.split('.')[0])
        return [proxyId, jb.macro.proxies[proxyId] = jb.macro.proxies[proxyId] || jb.macro.newProxy(proxyId)]
    }
})

extension('syntaxConverter', 'onAddComponent', {
  initExtension() { 
    jb.core.onAddComponent.push({ 
      match:(id,comp) => false,
      register: (_id,_comp,dsl) => {
        //if (_id == 'amta.aa') debugger
        const comp = jb.syntaxConverter.fixProfile(_comp,_comp,_id)
        const id = jb.macro.titleToId(_id)
        jb.core.unresolvedProfiles.push({id,comp,dsl})
        return comp
      }
    })    
  },
  fixProfile(profile,origin,id) {
    if (profile === null) return
    if (!profile || jb.utils.isPrimitiveValue(profile) || typeof profile == 'function') return profile
    // if (profile.$ == 'uiTest') {
    //     if ((jb.path(profile.$unresolved[0].userInput,'$') || '').indexOf('userInput.') == 0) {
    //         profile.$unresolved[0].uiAction = profile.$unresolved[0].userInput
    //         profile.$unresolved[0].uiAction.$ = profile.$unresolved[0].uiAction.$.slice('userInput.'.length)
    //     }
    // }
    // if (profile.$ == 'uiFrontEndTest' && profile.$unresolved[0].action) {
    //     profile.$unresolved[0].uiAction = profile.$unresolved[0].action
    //     delete profile.$unresolved[0].action
    // }

    // ;['pipeline','list','firstSucceeding','concat','and','or'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.items = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    // ;['not'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.of = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    if (jb.syntaxConverter.amtaFix)
        profile = jb.syntaxConverter.amtaFix(profile)

    const $vars = profile.$vars
    if ($vars && !Array.isArray($vars))
        profile.$vars = jb.entries($vars).map(([name,val]) => ({name,val}))

    if (profile.$)
        profile.$ = jb.macro.titleToId(profile.$)
    if (profile.remark) {
        profile.$remark = profile.remark
        delete profile.remark
    }
    
    if (profile.$ == 'object')
        return {$: 'obj', props: jb.entries(profile).filter(([x]) =>x!='$').map(([title,val]) => ({$: 'prop', title, val: jb.syntaxConverter.fixProfile(val,origin) }))}

    if (Array.isArray(profile)) 
        return profile.map(v=>jb.syntaxConverter.fixProfile(v,origin))

    return jb.objFromEntries(jb.entries(profile).map(([k,v]) => [k,jb.syntaxConverter.fixProfile(v,origin)]))
  }
})
});

jbLoadPackedFile({lineInPackage:1439, jb, noProxies: true, path: '/plugins/core/spy.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('spy', {
	$requireFuncs: '#spy.log',
	initExtension() {
		// jb.spy.log() -- for codeLoader
		return {
			logs: [],
			enrichers: [],
			settings: { 
				includeLogs: 'error',
				stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
				MAX_LOG_SIZE: 10000
			},
			Error: jb.frame.Error
		}
	},
	initSpyByUrl() {
		const frame = jb.frame
		const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
		const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
		const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
		jb.spy.initSpy({spyParam :frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
			getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')})
		jb.spy.calcIncludeLogsFromSpyParam()
	},
	initSpy({spyParam}) {
		if (!spyParam) return
		jb.spy.spyParam = spyParam
		jb.spy.enabled = true
		if (jb.frame) jb.frame.spy = jb.spy // for console use
		jb.spy.includeLogsInitialized = false
		jb.spy._obs = jb.callbag && jb.callbag.subject()
		return jb.spy
		// for loader - jb.spy.clear(), jb.spy.search()
	},
	registerEnrichers(enrichers) {
		jb.spy.enrichers = [...jb.spy.enrichers, ...jb.asArray(enrichers)]
	},
	findProp(o,prop,maxDepth=1) {
		if (maxDepth < 1) return o[prop]
		return o[prop] 
			|| Object.keys(o).reduce((found,k) => found || (o[k] && typeof o[k] == 'object' && jb.spy.findProp(o[k],prop,maxDepth-1)), false)
	},
	memoryUsage: () => jb.path(jb.frame,'performance.memory.usedJSHeapSize'),
	// observable() { 
	// 	const _jb = jb.path(jb,'studio.studiojb') || jb
	// 	jb.spy._obs = jb.spy._obs || _jb.callbag.subject()
	// 	return jb.spy._obs
	// },
	calcIncludeLogsFromSpyParam() {
		const includeLogsFromParam = (jb.spy.spyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
		const excludeLogsFromParam = (jb.spy.spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
		jb.spy.includeLogs = jb.spy.settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
			acc[log] = true
			return acc
		}, {})
		jb.spy.includeLogsInitialized = true
	},
	shouldLog(logNames, record) {
		// disable debugging events
		const ctx = record && (record.ctx || record.srcCtx || record.cmp && record.cmp.ctx)
		if (ctx && ctx.vars.$disableLog || jb.path(record,'m.$disableLog') || jb.path(record,'m.remoteRun.vars.$disableLog')) return false
		if (jb.path(record,'m.routingPath') && jb.path(record,'m.routingPath').find(y=>y.match(/vDebugger/))
			|| (jb.path(record,'m.result.uri') || '').match(/vDebugger/)) return false
		if (!logNames) debugger
		return jb.spy.spyParam === 'all' || typeof record == 'object' && 
			logNames.split(' ').reduce( (acc,logName)=>acc || jb.spy.includeLogs[logName],false)
	},
	log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
		if (!jb.spy.includeLogsInitialized) jb.spy.calcIncludeLogsFromSpyParam(jb.spy.spyParam)
		jb.spy.updateCounters(logNames)
		jb.spy.updateLocations(logNames,takeFrom)
		if (!jb.spy.shouldLog(logNames, _record)) return
		const now = new Date()
		const index = jb.spy.logs.length
		const record = {
			logNames,
			..._record,
			index,
			source: jb.spy.source(takeFrom),
			_time: `${now.getSeconds()}:${now.getMilliseconds()}`,
			time: now.getTime(),
			mem: jb.spy.memoryUsage() / 1000000,
			activeElem: jb.path(jb.frame.document,'activeElement'),
			$attsOrder: _record && Object.keys(_record),
			stack: _record.ctx && jb.utils.callStack(_record.ctx)
		}
		if (jb.spy.logs.length > 0 && jb.path(jb.frame.document,'activeElement') != jb.spy.logs[index-1].activeElem) {
			jb.spy.logs[index-1].logNames += ' focus'
			jb.spy.logs[index-1].activeElemAfter = record.activeElem
			jb.spy.logs[index-1].focusChanged = true
		}

		jb.spy.logs.push(record)
		if (jb.spy.logs.length > jb.spy.settings.MAX_LOG_SIZE *1.1)
			jb.spy.logs = jb.spy.logs.slice(-1* jb.spy.settings.MAX_LOG_SIZE)
		jb.spy._obs && jb.spy._obs.next(record)
	},
	frameAccessible(frame) { try { return Boolean(frame.document || frame.contentDocument || frame.global) } catch(e) { return false } },
	source(takeFrom) {
		jb.spy.Error.stackTraceLimit = 50
		const frames = [jb.frame]
		// while (frames[0].parent && frames[0] !== frames[0].parent) {
		// 	frames.unshift(frames[0].parent)
		// }
		let stackTrace = frames.reverse().filter(f=>jb.spy.frameAccessible(f)).map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
			filter(line => line !== 'Error').
			filter(line => !jb.spy.settings.stackFilter.test(line))
		if (takeFrom) {
			const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
			stackTrace = stackTrace.slice(firstIndex + 1)
		}
		const line = stackTrace[0] || ''
		const res = [
			line.split(/at |as /).pop().split(/ |]/)[0],
			line.split('/').pop().slice(0, -1).trim(),
			...stackTrace
		]
		res.location = line.split(' ').slice(-1)[0].split('(').pop().split(')')[0]
		return res
	},
	updateCounters(logNames) {
		jb.spy.counters = jb.spy.counters || {}
		jb.spy.counters[logNames] = jb.spy.counters[logNames] || 0
		jb.spy.counters[logNames]++
	},
	updateLocations(logNames) {
		jb.spy.locations = jb.spy.locations || {}
		jb.spy.locations[logNames] = jb.spy.locations[logNames] || jb.spy.source().location
	},	
	
	// browsing methods
	setLogs(spyParam) {
		jb.spy.spyParam = spyParam
		jb.spy.calcIncludeLogsFromSpyParam(spyParam)
	},
	clear(spy = jb.spy) {
		spy.logs = []
		spy.counters = {}
	},
	count(query) { // dialog core | menu !keyboard  
		const _or = query.split(/,|\|/)
		return _or.reduce((acc,exp) => 
			unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), jb.entries(jb.spy.counters))) 
		,[]).reduce((acc,e) => acc+e[1], 0)

		function filter(set,exp) {
			return (exp[0] == '!') 
				? set.filter(rec=>!rec[0].match(new RegExp(`\\b${exp.slice(1)}\\b`)))
				: set.filter(rec=>rec[0].match(new RegExp(`\\b${exp}\\b`)))
		}
		function unify(set1,set2) {
			return [...set1,...set2]
		}
	},
	noPing() {
		return this.logs.filter(x=>![x.remoteRun, jb.path(x.m,'remoteRun'),jb.path(x.m,'result')].find(t => t == 'ping'))
	},
	search(query = '',{ slice, spy, enrich } = {slice: -1000, spy: jb.spy, enrich: true}) { // e.g., dialog core | menu !keyboard  
		const _or = query.toLowerCase().split(/,|\|/)
		return _or.reduce((acc,exp) => 
			unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), spy.logs.slice(slice))) 
		,[]).map(x=>enrich ? jb.spy.enrichRecord(x) : x)

		function filter(set,exp) {
			return (exp[0] == '!') 
				? set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp.slice(1)) == -1)
				: set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp) != -1)
		}
		function unify(set1,set2) {
			let res = [...set1,...set2].sort((x,y) => x.index < y.index)
			return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
		}
	},
	enrichRecord(rec) {
		if (!rec.$ext) {
			rec.$ext = { sections: [], props: {}}
			;(jb.spy.enrichers||[]).forEach(f=> {
				const ext = f(rec)
				if (ext) {
					ext.sections && (rec.$ext.sections = [...rec.$ext.sections, ...ext.sections])
					ext.props && Object.assign(rec.$ext.props, ext.props)
				}
			})
		}
		return {log: rec.logNames, ...rec.$ext.props, 
			...jb.objFromEntries(Object.keys(rec).filter(k=>!rec.$ext.props[k]).map(k=>[k,rec[k]])) }
	},
	spyParamForTest(testID) {
		return testID.match(/uiTest|[Ww]idget/) ? 'test,uiTest,headless' : 'test'
	}
})

component('test.calcSpyParamForTest', {
  params: [
    {id: 'testID' }
  ],
  impl: (ctx,testID) => jb.spy.spyParamForTest(testID || ctx.vars.testID)
})

});

jb.noSupervisedLoad = false
jbLoadPackedFile({lineInPackage:1643, jb, noProxies: false, path: '/plugins/common/jb-common.js',fileDsl: '', pluginId: 'common' }, 
            function({jb,require,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
using('core')

extension('utils', 'pipe', {
  calcPipe(ctx,ptName,passRx) {
    let start = jb.toarray(ctx.data)
    if (start.length == 0) start = [null]
    if (typeof ctx.profile.items == 'string')
      return ctx.runInner(ctx.profile.items,null,'items');
    const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
    const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
      : (ctx.profile[ptName] ? (ptName + '~') : 'items~');

    if (ptName == '$pipe') return (async function pipe() {
      const pipeRes = await profiles.reduce( async (pr,prof,index) => {
        const data = await pr;
        const input = await jb.utils.toSynchArray(data, !passRx)
        const stepRes = await step(prof,index,input)
        return stepRes
      }, Promise.resolve(start))

        const res = await jb.utils.toSynchArray(pipeRes, !passRx)
        return res
      })()

    return profiles.reduce((data,prof,index) => step(prof,index,data), start)

    function step(profile,i,data) {
      if (!profile || profile.$disabled) return data;
      const path = innerPath+i
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {})
      if (jb.path(jb.comps[profile.$$],'aggregator'))
                return jb.core.run( new jb.core.jbCtx(ctx, { data, profile, path }), parentParam)
      const res = data.map(item => jb.core.run(new jb.core.jbCtx(ctx,{data: item, profile, path}), parentParam))
        .filter(x=>x!=null)
        .flatMap(x=> {
          const val = jb.val(x)
          return jb.asArray(val)
        })
        return res
    }
  }
})

component('pipeline', {
  type: 'data',
  category: 'common:100',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true, description: 'chain/map data functions'}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipeline')
})

component('pipe', {
  type: 'data',
  category: 'async:100',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipe',false)
})

component('list', {
  type: 'data',
  description: 'list definition, flatten internal arrays',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
})

component('firstSucceeding', {
  type: 'data',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => {
    for(let i=0;i<items.length;i++) {
      const val = jb.val(items[i])
      const isNumber = typeof val === 'number'
      if (val !== '' && val != null && (!isNumber || (!isNaN(val)) && val !== Infinity && val !== -Infinity))
        return items[i]
    }
		return items.slice(-1)[0];
	}
})

component('firstNotEmpty', {
  type: 'any',
  params: [
    {id: 'first', type: '$asParent', dynamic: true, mandatory: true},
    {id: 'second', type: '$asParent', dynamic: true, mandatory: true}
  ],
  impl: If('%$first()%', '%$first()%', '%$second()%')
})

component('keys', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj && typeof obj === 'object' ? obj : {})
})

component('values', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.values(obj && typeof obj === 'object' ? obj : {})
})

component('properties', {
  description: 'object entries as id,val',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
})

component('objFromProperties', {
  description: 'object from entries of properties {id,val}',
  type: 'data',
  aggregator: true,
  params: [
    {id: 'properties', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},properties) => jb.objFromEntries(properties.map(({id,val}) => [id,val]))
})

component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => jb.entries(obj)
})

component('aggregate', {
  type: 'data',
  aggregator: true,
  description: 'calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'data', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

component('math.max', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.min', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.sum', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => ctx.data.reduce((acc,item) => +item+acc, 0)
})

component('math.plus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x + +y
})

component('math.minus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x - +y
})

component('math.mul', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x * +y
})

component('math.div', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x / +y
})


 jb.defComponents('abs,acos,acosh,asin,asinh,atan,atan2,atanh,cbrt,ceil,clz32,cos,cosh,exp,expm1,floor,fround,hypot,log2,random,round,sign,sin,sinh,sqrt,tan,tanh,trunc'
  .split(','), f => component(`math.${f}`, {
    autoGen: true,
    category: 'math:70',
    params: [
      {id: 'func', as: 'string', defaultValue: f}
    ],
    impl: ({data},f) => Math[f](data)
  })
)

component('objFromEntries', {
  description: 'object from entries',
  type: 'data',
  aggregator: true,
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

component('evalExpression', {
  description: 'evaluate javascript expression',
  type: 'data',
  params: [
    {id: 'expression', as: 'string', defaultValue: '%%', expression: 'e.g. 1+2'}
  ],
  impl: ({},expression) => {
    try {
      return eval('('+expression+')')
    } catch(e) {}
  }
})

component('prefix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(0,text.indexOf(separator))
})

component('suffix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(text.lastIndexOf(separator)+separator.length)
})

component('removePrefix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
})

component('removeSuffix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
})

component('removeSuffixRegex', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'suffix', as: 'string', mandatory: true, description: 'regular expression. e.g [0-9]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,suffix,text) => {
		ctx.profile.prefixRegexp = ctx.profile.prefixRegexp || new RegExp(suffix+'$');
		const m = (text||'').match(ctx.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
})

component('property', {
  description: 'navigate/select/path property of object',
  category: 'common:70',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,prop,obj) =>	jb.db.objectProperty(obj,prop,ctx)
})

component('indexOf', {
  category: 'common:70',
  params: [
    {id: 'array', as: 'array', mandatory: true},
    {id: 'item', as: 'single', mandatory: true}
  ],
  impl: ({},array,item) => array.indexOf(item)
})

component('writeValue', {
  type: 'action',
  category: 'mutable:100',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,to,value,noNotifications) => {
    if (!jb.db.isRef(to)) {
      debugger
      ctx.run(ctx.profile.to,{as: 'ref'}) // for debug
      return jb.logError(`can not write to: ${ctx.profile.to}`, {ctx})
    }
    const val = jb.val(value)
    if (jb.utils.isPromise(val))
      return Promise.resolve(val).then(_val=>jb.db.writeValue(to,_val,ctx,noNotifications))
    else
      jb.db.writeValue(to,val,ctx,noNotifications)
  }
})

component('addToArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'toAdd', as: 'array', mandatory: true}
  ],
  impl: (ctx,array,toAdd) => jb.db.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
})

component('move', {
  type: 'action',
  category: 'mutable:80',
  description: 'move item in tree, activated from D&D',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.db.move(from,_to,ctx)
})

component('splice', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'fromIndex', as: 'number', mandatory: true},
    {id: 'noOfItemsToRemove', as: 'number', defaultValue: 0},
    {id: 'itemsToAdd', as: 'array', defaultValue: []}
  ],
  impl: (ctx,array,fromIndex,noOfItemsToRemove,itemsToAdd) =>
		jb.db.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
})

component('removeFromArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'itemToRemove', as: 'single', description: 'choose item or index'},
    {id: 'index', as: 'number', description: 'choose item or index'}
  ],
  impl: (ctx,array,itemToRemove,_index) => {
		const index = itemToRemove ? jb.toarray(array).indexOf(itemToRemove) : _index;
		if (index != -1)
			jb.db.splice(array,[[index,1]],ctx)
	}
})

component('getOrCreate', {
  type: 'data',
  description: 'memoize, cache, calculate value if empty and assign for next time',
  category: 'mutable:80',
  params: [
    {id: 'writeTo', as: 'ref', mandatory: true},
    {id: 'calcValue', dynamic: true}
  ],
  impl: async (ctx,writeTo,calcValue) => {
    let val = jb.val(writeTo)
    if (val == null) {
      val = await calcValue()
      jb.db.writeValue(writeTo,val,ctx)
    }
    return val
	}
})

component('toggleBooleanValue', {
  type: 'action',
  params: [
    {id: 'of', as: 'ref'}
  ],
  impl: (ctx,_of) => jb.db.writeValue(_of,jb.val(_of) ? false : true,ctx)
})

component('slice', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {id: 'end', as: 'number', mandatory: true, description: '0-based index of where to end the selection (not including itself)'}
  ],
  impl: ({data},start,end) => {
		if (!data || !data.slice) return null
		return end ? data.slice(start,end) : data.slice(start)
	}
})

component('sort', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'propertyName', as: 'string', description: 'sort by property inside object'},
    {id: 'lexical', as: 'boolean', type: 'boolean'},
    {id: 'ascending', as: 'boolean', type: 'boolean'}
  ],
  impl: ({data},prop,lexical,ascending) => {
    if (!data || ! Array.isArray(data)) return null;
    let sortFunc
    const firstData = data[0] //jb.entries(data[0]||{})[0][1]
		if (lexical || isNaN(firstData))
			sortFunc = prop ? (x,y) => (x[prop] == y[prop] ? 0 : x[prop] < y[prop] ? -1 : 1) : (x,y) => (x == y ? 0 : x < y ? -1 : 1);
		else
			sortFunc = prop ? (x,y) => (x[prop]-y[prop]) : (x,y) => (x-y);
		if (ascending)
  		return data.slice(0).sort((x,y)=>sortFunc(x,y));
		return data.slice(0).sort((x,y)=>sortFunc(y,x));
	}
})

component('first', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items[0]
})

component('last', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(-1)[0]
})

component('count', {
  type: 'data',
  aggregator: true,
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.length
})

component('reverse', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(0).reverse()
})

component('sample', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

component('obj', {
  description: 'build object (dictionary) from props',
  category: 'common:100',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, sugar: true}
  ],
  impl: (ctx,properties) => jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx),p.type)]))
})

component('dynamicObject', {
  type: 'data',
  description: 'process items into object properties',
  params: [
    {id: 'items', mandatory: true, as: 'array'},
    {id: 'propertyName', mandatory: true, as: 'string', dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,items,name,value) =>
    items.reduce((obj,item)=>({ ...obj, [name(ctx.setData(item))]: value(ctx.setData(item)) }),{})
})

component('extend', {
  type: 'data',
  description: 'assign and extend with calculated properties',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,properties,obj) =>
		Object.assign({}, obj, jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx),p.type)])))
})
component('assign', { autoGen: true, ...jb.utils.getUnresolvedProfile('extend', 'data')})

component('extendWithIndex', {
  type: 'data',
  aggregator: true,
  description: 'extend with calculated properties. %$index% is available ',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) => jb.toarray(ctx.data).map((item,i) =>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
})

component('prop', {
  type: 'prop',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'}
  ]
})

component('pipeline.var', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', mandatory: true, dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({ [Symbol.for('Var')]: true, ...ctx.params })
})

component('not', {
  type: 'boolean',
  params: [
    {id: 'of', type: 'boolean', as: 'boolean', mandatory: true, composite: true}
  ],
  impl: ({}, of) => !of
})

component('and', {
  description: 'logical and',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
      (res,item,i) => res && ctx.runInner(item, { type: 'boolean' }, `items~${i}`), true)
})

component('or', {
  description: 'logical or',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
    (res,item,i) => res || ctx.runInner(item, { type: 'boolean' }, `items~${i}`), false)
})

component('between', {
  description: 'checks if number is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', mandatory: true},
    {id: 'to', as: 'number', mandatory: true},
    {id: 'val', as: 'number', defaultValue: '%%'}
  ],
  impl: ({},from,to,val) => val >= from && val <= to
})

component('contains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'string', byName: true},
    {id: 'inOrder', defaultValue: true, as: 'boolean', type: 'boolean'}
  ],
  impl: ({},text,allText,inOrder) => {
      let prevIndex = -1
      for(let i=0;i<text.length;i++) {
      	const newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1)
      	if (newIndex == -1) return false
      	prevIndex = inOrder ? newIndex : -1
      }
      return true
	}
})

component('notContains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'array', byName: true}
  ],
  impl: not(contains('%$text%', { allText: '%$allText%' }))
})

component('startsWith', {
  description: 'begins with, includes, contains',
  type: 'boolean',
  params: [
    {id: 'startsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string', byName: true}
  ],
  impl: ({},startsWith,text) => text.startsWith(startsWith)
})

component('endsWith', {
  description: 'includes, contains',
  type: 'boolean',
  params: [
    {id: 'endsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: ({},endsWith,text) => text.endsWith(endsWith)
})


component('filter', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) =>	jb.toarray(ctx.data).filter(item =>	filter(ctx,item))
})

component('matchRegex', {
  description: 'validation with regular expression',
  type: 'boolean',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: 'e.g: [a-zA-Z]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},regex,text) => text.match(new RegExp(regex))
})

component('toUpperCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) =>	text.toUpperCase()
})

component('toLowerCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.toLowerCase()
})

component('capitalize', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.charAt(0).toUpperCase() + text.slice(1)
})

component('join', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', mandatory: true},
    {id: 'prefix', as: 'string', byName: true },
    {id: 'suffix', as: 'string'},
    {id: 'items', as: 'array', defaultValue: '%%'},
    {id: 'itemText', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,separator,prefix,suffix,items,itemText) => {
		const itemToText = ctx.profile.itemText ?	item => itemText(ctx.setData(item)) :	item => jb.tostring(item);	// performance
		return prefix + items.map(itemToText).join(separator) + suffix;
	}
})

component('unique', {
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  type: 'data',
  aggregator: true,
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
})

component('log', {
  type: 'data',
  moreTypes: 'action<>',
  params: [
    {id: 'logName', as: 'string', mandatory: 'true'},
    {id: 'logObj', as: 'single', defaultValue: '%%'}
  ],
  impl: (ctx,log,logObj) => { jb.log(log,{...logObj,ctx}); return ctx.data }
})

component('asIs', {
  params: [
    {id: '$asIs', ignore: true}
  ],
  impl: ctx => ctx.profile.$asIs
})

component('object', {
  impl: ctx => {
		const obj = ctx.profile.$object || ctx.profile
		if (Array.isArray(obj)) return obj

    const result = {}
		for(let prop in obj) {
			if ((prop == '$' && obj[prop] == 'object') || obj[prop] == null)
				continue
			result[prop] = ctx.runInner(obj[prop],null,prop)
		}
		return result
	}
})

component('json.stringify', {
  params: [
    {id: 'value', defaultValue: '%%'},
    {id: 'space', as: 'string', description: 'use space or tab to make pretty output'}
  ],
  impl: ({},value,space) => JSON.stringify(jb.val(value),null,space)
})

component('json.parse', {
  params: [
    {id: 'text', as: 'string'}
  ],
  impl: (ctx,text) =>	{
		try {
			return JSON.parse(text)
		} catch (e) {
			jb.logException(e,'json parse',{text, ctx})
		}
	}
})

component('split', {
  description: 'breaks string using separator',
  type: 'data',
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', description: 'E.g., "," or "<a>"'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'part', options: 'all,first,second,last,but first,but last', defaultValue: 'all'}
  ],
  impl: ({},separator,text,part) => {
		const out = text.split(separator.replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n'));
		switch (part) {
			case 'first': return out[0];
			case 'second': return out[1];
			case 'last': return out.pop();
			case 'but first': return out.slice(1);
			case 'but last': return out.slice(0,-1);
			default: return out;
		}
	}
})

component('replace', {
  type: 'data',
  params: [
    {id: 'find', as: 'string', mandatory: true},
    {id: 'replace', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m'}
  ],
  impl: ({},find,replace,text,useRegex,regexFlags) =>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    useRegex ? text.replace(new RegExp(find,regexFlags) ,replace) : text.replace(find,replace)
})

component('isNull', {
  description: 'is null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) == null
})

component('notNull', {
  description: 'not null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) != null
})

component('isEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => !item || (Array.isArray(item) && item.length == 0)
})

component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => item && !(Array.isArray(item) && item.length == 0)
})

component('equals', {
  type: 'boolean',
  params: [
    {id: 'item1', mandatory: true},
    {id: 'item2', defaultValue: '%%'}
  ],
  impl: ({}, item1, item2) => {
    return typeof item1 == 'object' && typeof item1 == 'object' ? Object.keys(jb.utils.objectDiff(item1,item2)||[]).length == 0 
      : jb.tosingle(item1) == jb.tosingle(item2)
  }
})

component('notEquals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 != item2
})

component('runActions', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true}
  ],
  impl: ctx => {
		if (!ctx.profile) debugger;
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions']).filter(x=>x)
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    
		return actions.reduce((pr,action,index) =>
				pr.finally(function runActions() {return ctx.runInner(action, { as: 'single'}, innerPath + index ) })
			,Promise.resolve())
	}
})

component('runActionOnItem', {
  type: 'action',
  params: [
    {id: 'item', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,item,action) => jb.utils.isPromise(item) ? Promise.resolve(item).then(_item => action(ctx.setData(_item))) 
    : item != null && action(ctx.setData(item))
})

component('runActionOnItems', {
  type: 'action',
  macroByValue: true,
  params: [
    {id: 'items', as: 'ref[]', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,items,action,indexVariable) => {
		return (jb.val(items)||[]).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runActionOnItems',{item, action, ctx}))
	}
})

component('delay', {
  type: 'action',
  moreTypes: 'data<>',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1},
    {id: 'res', defaultValue: '%%'}
  ],
  impl: ({},mSec,res) => jb.delay(mSec).then(() => res)
})

component('onNextTimer', {
  description: 'run action after delay',
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'delay', type: 'number', defaultValue: 1}
  ],
  impl: (ctx,action,delay) => jb.delay(delay,ctx).then(()=>	action())
})

component('extractPrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '')
		} else { // regex
			const match = text.match(separator)
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '')
		}
	}
})

component('extractSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(text.lastIndexOf(separator) + (keepSeparator ? 0 : separator.length));
		} else { // regex
			const match = text.match(separator+'(?![\\s\\S]*' + separator +')'); // (?!) means not after, [\\s\\S]* means any char including new lines
			if (match)
				return text.substring(match.index + (keepSeparator ? 0 : match[0].length));
		}
	}
})

component('range', {
  description: 'returns a range of number, generator, numerator, numbers, index',
  type: 'data',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({},from,to) => Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

component('typeOf', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj)
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

component('className', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

component('isOfType', {
  type: 'boolean',
  params: [
    {id: 'type', as: 'string', mandatory: true, description: 'e.g., string,boolean,array'},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_type,_obj) => {
  	const obj = jb.val(_obj)
  	const objType = Array.isArray(obj) ? 'array' : typeof obj
  	return _type.split(',').indexOf(objType) != -1
  }
})

component('inGroup', {
  description: 'is in list, contains in array',
  type: 'boolean',
  params: [
    {id: 'group', as: 'array', mandatory: true},
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({},group,item) =>	group.indexOf(item) != -1
})

component('range', {
  description: 'is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({data},from,to) => +data >= +from && +data <= +to
})

component('Switch', {
  type: 'data',
  macroByValue: false,
  params: [
    {id: 'cases', type: 'switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'default', dynamic: true}
  ],
  impl: (ctx,cases,defaultValue) => {
		for(let i=0;i<cases.length;i++)
			if (cases[i].condition(ctx))
				return cases[i].value(ctx)
		return defaultValue(ctx)
	}
})

component('Case', {
  type: 'switch-case',
  params: [
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('action.switch', {
  type: 'action',
  params: [
    {id: 'cases', type: 'action.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'defaultAction', type: 'action', dynamic: true}
  ],
  macroByValue: false,
  impl: (ctx,cases,defaultAction) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

component('action.switchCase', {
  type: 'action.switch-case',
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true, dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('formatDate', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'date', defaultValue: '%%', description: 'Date value'},
    {id: 'dateStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'timeStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'weekday', as: 'string', options: 'long,short,narrow'},
    {id: 'year', as: 'string', options: 'numeric,2-digit'},
    {id: 'month', as: 'string', options: 'numeric,2-digit,long,short,narrow'},
    {id: 'day', as: 'string', options: 'numeric,2-digit'},
    {id: 'hour', as: 'string', options: 'numeric,2-digit'},
    {id: 'minute', as: 'string', options: 'numeric,2-digit'},
    {id: 'second', as: 'string', options: 'numeric,2-digit'},
    {id: 'timeZoneName', as: 'string', options: 'long,short'}
  ],
  impl: (ctx,date) => new Date(date).toLocaleDateString(undefined, jb.objFromEntries(jb.entries(ctx.params).filter(e=>e[1])))
})

component('formatNumber', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'precision', as: 'number', defaultValue: '2', description: '10.33'},
    {id: 'num', defaultValue: '%%'}
  ],
  impl: (ctx,precision,x) => typeof x == 'number' ? +x.toFixed(+precision) : x
})

component('getSessionStorage', {
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: ({},id) => jb.utils.sessionStorage(id)
})

component('action.setSessionStorage', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'value', dynamic: true}
  ],
  impl: ({},id,value) => jb.utils.sessionStorage(id,value())
})

component('waitFor', {
  type: 'action',
  params: [
    {id: 'check', dynamic: true},
    {id: 'interval', as: 'number', defaultValue: 14, byName: true},
    {id: 'timeout', as: 'number', defaultValue: 3000},
    {id: 'logOnError', as: 'string', dynamic: true}
  ],
  impl: (ctx,check,interval,timeout,logOnError) => {
    if (!timeout) 
      return jb.logError('waitFor no timeout',{ctx})
    // const res1 = check()
    // if (!jb.utils.isPromise(res1))
    //   return Promise.resolve(res1)
    let waitingForPromise, timesoFar = 0
    return new Promise((resolve,reject) => {
        const toRelease = setInterval(() => {
            timesoFar += interval
            if (timesoFar >= timeout) {
              clearInterval(toRelease)
              jb.log('waitFor timeout',{ctx})
              logOnError() && jb.logError(logOnError() + ` timeout: ${timeout}, waitingTime: ${timesoFar}`,{ctx})
              reject('timeout')
            }
            if (waitingForPromise) return
            const v = check()
            jb.log('waitFor check',{v, ctx})
            if (jb.utils.isPromise(v)) {
              waitingForPromise = true
              v.then(_v=> {
                waitingForPromise = false
                handleResult(_v)
              })
            } else {
              handleResult(v)
            }

            function handleResult(res) {
              if (res) {
                clearInterval(toRelease)
                resolve(res)
              }
            }
        }, interval)
    })
  }
})

component('addComponent', {
  description: 'add a component or data resource',
  type: 'action',
  params: [
    {id: 'id', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'type', options: 'watchableData,passiveData,comp', mandatory: true}
  ],
  impl: (ctx,id,value,type) => jb.component(id(), type == 'comp' ? value() : {[type]: value() } ),
  require: () => jb.db.addDataResourcePrefix()
})

component('loadLibs', {
  description: 'load a list of libraries into current jbm',
  type: 'action',
  params: [
    {id: 'libs', as: 'array', mandatory: true}
  ],
  impl: ({},libs) => 
    jb_dynamicLoad(libs, Object.assign(jb, { loadFromDist: true}))
})

component('loadAppFiles', {
  description: 'load a list of app files into current jbm',
  type: 'action',
  params: [
    {id: 'jsFiles', as: 'array', mandatory: true}
  ],
  impl: ({},jsFiles) => 
    jb_loadProject({ uri: jb.uri, baseUrl: jb.baseUrl, libs: '', jsFiles })
})

});

}