async function jbLoadPacked({uri,initSpyByUrl,multipleInFrame}={}) {
const jb = {"sourceCode":{"plugins":["ui-iframe-launcher"]},"loadedFiles":{},"plugins":{"loader":{"id":"loader","dependent":[],"proxies":["sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"dslOfFiles":[["/plugins/loader/source-code.js","loader"]],"files":["/plugins/loader/jb-loader.js","/plugins/loader/source-code.js"]},"ui-iframe-launcher":{"id":"ui-iframe-launcher","dependent":["loader"],"proxies":["renderWidgetInIframe","sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"files":["/plugins/ui/iframe/launcher/iframe-launcher.js"]}}}
if (!multipleInFrame) globalThis.jb = jb
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

jb.initializeTypeRules(["iframe","loader"])
await jb.initializeLibs(["iframe","loader"])
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}

function jbloadPlugins(jb,jbLoadPackedFile) {
jbLoadPackedFile({lineInPackage:44, jb, noProxies: true, path: '/plugins/core/jb-core.js',fileDsl: '', pluginId: 'core' }, 
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
        if (codePackage.loadLib) 
          return codePackage.loadLib(url)
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

jbLoadPackedFile({lineInPackage:465, jb, noProxies: true, path: '/plugins/core/core-utils.js',fileDsl: '', pluginId: 'core' }, 
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
      const curVal = JSON.parse(jb.frame.sessionStorage.getItem(id))
      if (val == undefined) return curVal
      const cleanedVal = typeof val == 'object' ? Object.fromEntries(Object.entries(val).filter(([_, v]) => v != null)) : val
      const newVal = typeof val == 'object' ? {...(curVal||{}), ...cleanedVal } : val
      jb.frame.sessionStorage.setItem(id, JSON.stringify(newVal))
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

jbLoadPackedFile({lineInPackage:873, jb, noProxies: true, path: '/plugins/core/core-components.js',fileDsl: '', pluginId: 'core' }, 
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

jbLoadPackedFile({lineInPackage:983, jb, noProxies: true, path: '/plugins/core/jb-expression.js',fileDsl: '', pluginId: 'core' }, 
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

jbLoadPackedFile({lineInPackage:1138, jb, noProxies: true, path: '/plugins/core/db.js',fileDsl: '', pluginId: 'core' }, 
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

jbLoadPackedFile({lineInPackage:1288, jb, noProxies: true, path: '/plugins/core/jb-macro.js',fileDsl: '', pluginId: 'core' }, 
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

jbLoadPackedFile({lineInPackage:1444, jb, noProxies: true, path: '/plugins/core/spy.js',fileDsl: '', pluginId: 'core' }, 
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
jbLoadPackedFile({lineInPackage:1648, jb, noProxies: false, path: '/plugins/loader/jb-loader.js',fileDsl: '', pluginId: 'loader' }, 
            function({jb,require,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {

function jbBrowserCodePackage(repo = '', fetchOptions= {}, useFileSymbolsFromBuild) {
  return {
    repo: repo.split('/')[0],
    _fetch(path) { 
      const hasBase = path && path.match(/\/\//)
      return fetch(hasBase ? path: jbHost.baseUrl + path, fetchOptions) 
    },
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path) { return useFileSymbolsFromBuild ? this.fileSymbolsFromStaticFileServer(path) 
      : this.fileSymbolsFromStudioServer(path) },
    fileSymbolsFromStudioServer(path) {
      return this.fetchJSON(`${jbHost.baseUrl||''}?op=fileSymbols&path=${repo}${path}`)
    },
    async fileSymbolsFromStaticFileServer(path) {
      if (!this.loadedSymbols) {
        this.loadedSymbols = [
          ...await this.fetchJSON(`/dist/symbols/plugins.json`),
          ...await this.fetchJSON(`/dist/symbols/projects.json`),
        ];
      }
      return this.loadedSymbols.filter(e=>e.path.indexOf(path+'/') == 1)
    },
  }
}

globalThis.jbHost = globalThis.jbHost || { // browserHost - studioServer,worker and static
  fetch: (...args) => globalThis.fetch(...args),
  baseUrl: '',
  fetchOptions: {},
  log(...args) { console.log (...args) },
  WebSocket_Browser: globalThis.WebSocket,
  codePackageFromJson(package) {
    if (package == null || package.$ == 'defaultPackage') return jbBrowserCodePackage('',{})
    if (package.$ == 'jbStudioServer' || package.$ == 'fileSystem')
        return jbBrowserCodePackage(`${package.repo}/`)
    if (package.$ == 'staticViaHttp')
        return jbBrowserCodePackage(`${package.repo}/`,{mode: 'cores'}, true)
  }
}

async function jbInit(uri, sourceCode , {multipleInFrame, initSpyByUrl, baseUrl, packOnly} ={}) {
  if (baseUrl) jbHost.baseUrl = baseUrl // used for extension content script
  const packedCode = []
  const jb = { 
    uri,
    sourceCode,
    loadedFiles: {},
    plugins: {},
    loadjbFile, pathToPluginId
  }
  if (!multipleInFrame) globalThis.jb = jb // multipleInFrame is used in jbm.child
  if (sourceCode.actualCode) {
    const f = eval(`(async function (jb) {${sourceCode.actualCode}\n})//# sourceURL=treeShakeClient?${jb.uri}`)
    await f(jb)
    return jb
  }

  const pluginPackages = Array.isArray(sourceCode.pluginPackages) ? sourceCode.pluginPackages : [sourceCode.pluginPackages]
  await pluginPackages.reduce( async (pr,codePackage)=> pr.then(() =>
    loadPluginSymbols(jbHost.codePackageFromJson(codePackage),{loadProjects: sourceCode.projects && sourceCode.projects.length})), Promise.resolve());
  calcPluginDependencies(jb.plugins,jb)
  const topPlugins = unique([
    ...((sourceCode.projects||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.projects || [])),
    ...((sourceCode.plugins||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>!x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.plugins || [])) 
    ]).filter(x=>jb.plugins[x])

  await ['jb-core','core-utils','core-components','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`).reduce((pr,path) => 
    pr.then(()=> loadjbFile(path,{noProxies: true, plugin: jb.plugins.core, fileSymbols: jb.plugins.core.files.find(x=>x.path == path)})), Promise.resolve())
  if (initSpyByUrl)
    jb.spy.initSpyByUrl()
  jb.noSupervisedLoad = false
  if (packOnly)
    packedCode.push({code: 'jb.noSupervisedLoad = false'})
  if (jb.jbm && treeShakeServerUri) jb.jbm.treeShakeServerUri = sourceCode.treeShakeServerUri

  await loadPlugins(topPlugins)
  const libs = unique(topPlugins.flatMap(id=>jb.plugins[id].requiredLibs))
  const libsToInit = sourceCode.libsToInit ? sourceCode.libsToInit.split(','): libs
  jb.initializeTypeRules(libs)
  if (packOnly)
    return [packedCodePrefix(jb,libs,libsToInit), ...packedCode , {code:'}'}]

  await jb.initializeLibs(libsToInit)
  jb.utils.resolveLoadedProfiles()

  return jb

  function unique(ar,f = (x=>x) ) {
    const keys = {}, res = []
    ar.forEach(e=>{ if (!keys[f(e)]) { keys[f(e)] = true; res.push(e) } })
    return res
  }
  function pathToPluginId(path,addTests) {
    const innerPath = (path.match(/(plugins|projects)\/(.+)/) || ['','',''])[2].split('/').slice(0,-1)
    const testFile = path.match(/-(tests|testers).js$/)
    const testFolder = path.match(/\/tests\//)
    const tests = addTests || testFile || (testFolder && innerPath[innerPath.length-1] != 'tests')  ? '-tests': ''
    if (testFile && testFolder)
      return innerPath.slice(0,-1).join('-') + tests
    return innerPath.join('-') + tests
  }
  async function loadPluginSymbols(codePackage,{loadProjects} = {}) {
    const pluginsSymbols = await codePackage.fileSymbols('plugins')
    const projectSymbols = loadProjects ? await codePackage.fileSymbols('projects') : []
    ;[...pluginsSymbols,...projectSymbols.map(x=>({...x, isProject: true}))].map(entry =>{
      const id = pathToPluginId(entry.path)
      jb.plugins[id] = jb.plugins[id] || { id, codePackage, files: [], isProject: entry.isProject }
      jb.plugins[id].files.push(entry)
    })
  }
  async function loadPlugins(plugins) {
    await plugins.reduce( (pr,id) => pr.then( async ()=> {
      const plugin = jb.plugins[id]
      if (!plugin || plugin.loadingReq) return
      plugin.loadingReq = true
      await loadPlugins(plugin.dependent)
      await Promise.all(plugin.files.map(fileSymbols =>loadjbFile(fileSymbols.path,{fileSymbols,plugin})))
    }), Promise.resolve() )
  }
  async function loadjbFile(path,{noProxies, fileSymbols, plugin} = {}) {
    if (jb.loadedFiles[path]) return
    const _code = await plugin.codePackage.fetchFile(path)
    const sourceUrl = `${path}?${jb.uri}`.replace(/#/g,'')
    const code = `${_code}\n//# sourceURL=${sourceUrl}`
    const fileDsl = fileSymbols && fileSymbols.dsl
    const proxies = noProxies ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
    const context = { jb, 
      ...(typeof require != 'undefined' ? {require} : {}),
      ...proxies,
      component:(id,comp) => jb.component(id,comp,{plugin,fileDsl}),
      extension:(libId, p1 , p2) => jb.extension(libId, p1 , p2,{plugin}),
      using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
    }
    try {
      //console.log(`loading ${path}`)
      const wCode = `(function({${Object.keys(context)}}) {${code}\n})`
      if (packOnly) packedCode.push({ path,
          code: `jbLoadPackedFile({lineInPackage: 0, jb, noProxies: ${noProxies ? true: false}, path: '${path}',fileDsl: '${fileDsl||''}', pluginId: '${plugin.id||''}' }, 
            function({${Object.keys(context)}}) {\n${_code}\n});\n`
      })
      if (noProxies || !packOnly) {
        const f = eval(wCode)
        f(context)
        jb.loadedFiles[path] = true
      }
    } catch (e) {
      if (!handleUnknownComp((e.message.match(/^(.*) is not defined$/)||['',''])[1]))
        return jb.logException(e,`loadjbFile lib ${path}`,{context, code})
    }

    function handleUnknownComp(unknownCmp) {
      if (!unknownCmp) return
      try {
        const fixed = code.replace(new RegExp(`${unknownCmp}\\(`,'g'),`unknownCmp('${unknownCmp}',`)
        const f = eval(`(function(${Object.keys(context)}) {${fixed}\n})`)
        f(...Object.values(context))
        jb.loadedFiles[path] = true
        jb.logError(`loader unknown comp ${unknownCmp} in file ${sourceUrl}`,{})
        return true
      } catch(e) {}
    }
  }
  function calcPluginDependencies(plugins) {
    Object.keys(plugins).map(id=>calcDependency(id))
    Object.values(plugins).map(plugin=>{
      const pluginDsls = unique(plugin.files.map(e=>e.pluginDsl).filter(x=>x))
      if (pluginDsls.length > 1)
        jb.logError(`plugin ${plugin.id} has more than one dsl`,{pluginDsls})
      plugin.dsl = pluginDsls[0]
    })
    // the virtual xx-tests plugin must have the same dsl as the plugin
    Object.values(plugins).filter(plugin=>plugin.id.match(/-tests$/)).forEach(plugin=>
      plugin.dsl = (jb.plugins[plugin.id.slice(0,-6)] || {}).dsl)

    function calcDependency(id,history={}) {
      const plugin = plugins[id]
      if (!plugin) {
        console.log('calcDependency: can not find plugin',{id, history})
        return []
      }
      if (plugin.dependent) return [id, ...plugin.dependent]
      if (history[id])
        return [`$circular:${id}`]
      const baseOfTest = (id.match(/-tests$/) ? [id.slice(0,-6),'testing'] : []).filter(x=>plugins[x])
      plugin.using = unique(plugin.files.flatMap(e=> unique(e.using)))
      const dslOfFiles = plugin.files.filter(fileSymbols=>fileSymbols.dsl && fileSymbols.dsl != plugin.dsl).map(({path,dsl}) => [path,dsl])
      if (dslOfFiles.length)
        plugin.dslOfFiles = dslOfFiles

      const dependent = unique([
        ...plugin.files.flatMap(e=> unique(e.using.flatMap(dep=>calcDependency(dep,{...history, [id]: true})))),
        ...baseOfTest.flatMap(dep=>calcDependency(dep,{...history, [id]: true}))]
      ).filter(x=>x !=`$circular:${id}`)

      plugin.circular = dependent.find(x=>x.match(/^\$circular:/))
      const ret = [id, ...dependent]
      if(!plugin.circular) {
        plugin.dependent = dependent
        plugin.requiredFiles = unique(ret.flatMap(_id=>plugins[_id].files), x=>x.path)
        plugin.requiredLibs = unique(ret.flatMap(_id=>plugins[_id].files).flatMap(x=>x.libs || []))
        plugin.proxies = unique(plugin.requiredFiles.flatMap(x=>x.ns))
      }
      return ret
    }
  }
}

// jb-pack
function packedCodePrefix(jb,libs,libsToInit) {
  const plugins = Object.fromEntries(Object.values(jb.plugins).filter(x=>x.loadingReq)
    .map(({id,dependent,proxies,using,dsl,dslOfFiles,files})=>({id,dependent,proxies,dsl,dslOfFiles,files: files.map(({path}) => path) })).map(p=>[p.id,p]))

  const _jb = { sourceCode: jb.sourceCode, loadedFiles: {}, plugins}
  return { code: [
    'async function jbLoadPacked({uri,initSpyByUrl,multipleInFrame}={}) {',
    `const jb = ${JSON.stringify(_jb)}`,
    `if (!multipleInFrame) globalThis.jb = jb`,
    `jb.uri = uri || 'main'`,
    `jb.startTime = new Date().getTime()`,
    jbCreatePlugins.toString(),
    jbLoadPackedFile.toString(),
    `\njbloadPlugins(jb,jbLoadPackedFile)`,
    `if (initSpyByUrl) jb.spy.initSpyByUrl()`,
    `\njb.initializeTypeRules(${JSON.stringify(libs||[])})
await jb.initializeLibs(${JSON.stringify(libsToInit||[])})
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}`,
'\nfunction jbloadPlugins(jb,jbLoadPackedFile) {'
].join('\n') 
  }
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

function jbCreatePlugins(jb,plugins) {
  jbHost.defaultCodePackage = jbHost.defaultCodePackage || jbHost.codePackageFromJson()
  plugins.forEach(plugin=> {
    jb.plugins[plugin.id] = jb.plugins[plugin.id] || { ...plugin, codePackage : jbHost.defaultCodePackage }
  })
}

if (typeof module != 'undefined') module.exports = { jbInit };

});

jbLoadPackedFile({lineInPackage:1916, jb, noProxies: false, path: '/plugins/loader/source-code.js',fileDsl: 'loader', pluginId: 'loader' }, 
            function({jb,require,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
dsl('loader')

extension('loader','main' , {
    shortFilePath(fullFilePath) {
        const elems = fullFilePath.split('/').reverse()
        return '/' + elems.slice(0,elems.findIndex(x=> x == 'plugins' || x == 'projects')+1).reverse().join('/')
    },
    unifyPluginsToLoad(pluginsToLoad, plugins) {
        return jb.asArray(pluginsToLoad).reduce((acc,item) => {
            const plugins = jb.utils.unique([...(acc.plugins || []), ...(item.plugins || [])])
            return {...acc, ...item, plugins}
        } , { plugins })
    },
    pluginOfFilePath(fullFilePath, addTests) {
      return jb.pathToPluginId(jb.loader.shortFilePath(fullFilePath),addTests)
    },
    pluginsByCtx(ctx) {
      return ctx.probe ? ['probe-core','tgp-formatter'] : []
    },
    mergeSourceCodes(sc1,sc2) {
      if (!sc1) return sc2
      if (!sc2) return sc1
      const plugins = jb.utils.unique([...(sc1.plugins || []), ...(sc2.plugins || [])])
      const projects = jb.utils.unique([...(sc1.projects || []), ...(sc2.projects || [])])
      const pluginPackages = jb.utils.unique([...(sc1.pluginPackages || []), ...(sc2.pluginPackages || [])], package => package.repo || 'default')
      return {plugins, projects, pluginPackages}
    },
    pluginsOfProfile(prof, comps = jb.comps) {
        if (!prof || typeof prof != 'object') return []
        if (!prof.$$)
            return jb.utils.unique(Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x)))
        const comp = comps[prof.$$]
        if (!comp) {
            debugger
            jb.logError(`cmd - can not find comp ${prof.$$} please provide sourceCode`,{ctx})
            return []
        }
        return jb.utils.unique([comp.$plugin,...Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x))]).filter(x=>x)
    }    
})

// source-code
component('sourceCode', {
  type: 'source-code',
  params: [
    {id: 'pluginsToLoad', type: 'plugins-to-load[]', flattenArray: true},
    {id: 'pluginPackages', type: 'plugin-package[]', flattenArray: true}, // , defaultValue: defaultPackage()
    {id: 'libsToInit', as: 'string', description: 'empty means load all libraries'},
    {id: 'actualCode', as: 'string', description: 'alternative to plugins'}
  ],
  impl: (ctx,pluginsToLoad,pluginPackages,libsToInit,actualCode) => ({ 
    ...(pluginPackages.filter(x=>x).length ? { pluginPackages : pluginPackages.filter(x=>x)} : {}),
    ...jb.loader.unifyPluginsToLoad(pluginsToLoad, jb.loader.pluginsByCtx(ctx)),
    ...(libsToInit ? {libsToInit} : {}),
    ...(actualCode ? {actualCode} : {}),
  })
})

component('sourceCodeByTgpPath', {
  type: 'source-code',
  params: [
    {id: 'tgpPath', as: 'string', mandatory: true},
    {id: 'tgpModel'}
  ],
  impl: sourceCode(
    plugins(({},{},{tgpModel, tgpPath}) => {
    const comps = tgpModel ? tgpModel.comps : jb.comps
    return jb.path(comps[tgpPath.split('~')[0]],'$plugin') || ''
  })
  )
})

component('plugins', {
  type: 'source-code',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: sourceCode(plugins('%$plugins%'))
})

component('extend', {
  type: 'source-code',
  params: [
    {id: 'sourceCode', type: 'source-code', mandatory: true},
    {id: 'with', type: 'source-code', mandatory: true},
  ],
  impl: (ctx,sc1,sc2) => jb.loader.mergeSourceCodes(sc1,sc2)
})

component('project', {
  type: 'source-code',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: sourceCode(project('%$project%'))
})

component('sameAsParent', {
  type: 'source-code',
  impl: () => jb.sourceCode
})
// plugins-to-load

component('pluginsByPath', {
  type: 'plugins-to-load',
  params: [
    {id: 'filePath', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/mycode.js'},
    {id: 'addTests', as: 'boolean', description: 'add plugin-tests', type: 'boolean', byName: true}
  ],
  impl: (ctx,fullFilePath,addTests) => {
    const filePath = jb.loader.shortFilePath(fullFilePath)
    const plugins = [jb.loader.pluginOfFilePath(fullFilePath,addTests)]
    const project = jb.path(filePath.match(/projects\/([^\/]+)/),'1')
    return { plugins, ...(project ? {projects: [project]} : {}) }
  }
})

component('loadAll', {
  type: 'plugins-to-load',
  impl: ctx => ({ plugins: ['*'] })
})

component('plugins', {
  type: 'plugins-to-load',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: (ctx,plugins) => ({ plugins: Array.isArray(plugins) ? plugins : plugins.split(',') })
})

component('project', {
  type: 'plugins-to-load',
  params: [
    {id: 'project', as: 'string', mandatory: true, description: '* for all'}
  ],
  impl: (ctx,project) => ({projects: [project]})
})


// plugin packages

component('packagesByPath', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/xx-tests.js'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: (ctx,path,host) => {
    const repo = (path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
    if (repo && repo != 'jb-react') {
      const repsBase = path.split('projects/')[0] + 'projects/'
      const package = (!host || host == 'node') ? { $: 'fileSystem', repo, baseDir: repsBase + repo} 
        : host == 'studio' ? { $: 'jbStudioServer', repo }
        : host == 'static' ? { $: 'staticViaHttp', repo } : null
      return [{ $: 'defaultPackage' }, package]
    }
  }
})

component('defaultPackage', {
  type: 'plugin-package',
  impl: () => ({ $: 'defaultPackage' })
})

component('staticViaHttp', {
  type: 'plugin-package',
  params: [
    {id: 'baseUrl', as: 'string', mandatory: true}
  ],
  impl: ctx => ({ $: 'staticViaHttp', ...ctx.params, useFileSymbolsFromBuild: true })
})

component('jbStudioServer', {
  type: 'plugin-package',
  params: [
    {id: 'repo', as: 'string'}
  ],
  impl: (ctx,repo) => repo && ({ $: 'jbStudioServer', ...ctx.params })
})

component('fileSystem', {
  type: 'plugin-package',
  params: [
    {id: 'baseDir', as: 'string'}
  ],
  impl: ctx => ({ $: 'fileSystem', ...ctx.params })
})

component('zipFile', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: ctx => ({ $: 'zipFile',  ...ctx.params })
})

component('sourceCode.encodeUri', {
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true}
  ],
  impl: (ctx,source) => jb.frame.encodeURIComponent(JSON.stringify(source))
})

});

jbLoadPackedFile({lineInPackage:2123, jb, noProxies: false, path: '/plugins/ui/iframe/launcher/iframe-launcher.js',fileDsl: '', pluginId: 'ui-iframe-launcher' }, 
            function({jb,require,renderWidgetInIframe,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
using('loader')

extension('iframe','inIframe', {
    renderWidgetInIframe({id, profile, el, sourceCode, htmlAtts, baseUrl} = {}) {
        baseUrl = baseUrl || 'http://localhost:8082'
        const _plugins = sourceCode && sourceCode.plugins || jb.loader.pluginsOfProfile(profile)
        const plugins = jb.utils.unique(_plugins)
        const html = `<!DOCTYPE html>
<html ${htmlAtts}>
<head>
    <meta charset="UTF-8">
    <!-- 
    <script type="text/javascript" src="${baseUrl}/plugins/loader/jb-loader.js"></script>
    <script type="text/javascript" src="${baseUrl}/package/${plugins.join(',')}.js"></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/dist/css/styles.css"/>
    -->
    <style>
        html, body {
            height: 100%; /* Set height for html and body */
            margin: 0; /* Remove default margin */
        }
    </style>    
</head>
<body>
    <div id="main"></div>
    <script>
    ;(async () => {
        let res = await fetch('${baseUrl}/plugins/loader/jb-loader.js')
        await eval(await res.text())
        jbHost.baseUrl = "${baseUrl}";
        document.iframeId = "${id}"
        res = await fetch('${baseUrl}/package/${plugins.join(',')}.js')
        await eval(await res.text())
    
        globalThis.jb = await jbLoadPacked("${id}");
        jb.baseUrl = "${baseUrl}";
        const ctx = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx());
        console.log('profile',${JSON.stringify(profile)})
        const vdom = await ctx.run(${JSON.stringify(profile)},'control<>');
        console.log('vdom',vdom)
        await jb.ui.render(jb.ui.h(vdom), main, { ctx });
        window.parent.postMessage('jbart is up', '*');
    })()
    </script>

</body>
</html>`
        const iframe = document.createElement('iframe')
        iframe.setAttribute('id',id)
        iframe.setAttribute('sandbox', 'allow-same-origin allow-forms allow-scripts')
        iframe.setAttribute('style', 'position: fixed;border: none;z-index:5000')
        iframe.setAttribute('frameBorder', '0')
        if (jbHost.chromeExtV3) {
          iframe.src = chrome.runtime.getURL('iframe.html')  
        } else {
          iframe.src = 'about:blank'
          iframe.onload = () => {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              iframeDocument.open();
              iframeDocument.write(html);
              iframeDocument.close();
          }
        }
        window.addEventListener('message', ev => {
          if (ev.data && ev.data.$ == 'getInfo') {
            iframe.contentWindow.postMessage({$: 'parentInfo', height: window.innerHeight, width: window.innerWidth, domain: document.domain}, ev.data.origin)
          } else if (ev.data && ev.data.$ == 'setIframeRect') {
            let {top, left, width, height} =  ev.data
            height != null && (iframe.style.height = height +'px');
            width != null && (iframe.style.width = width +'px');
            top != null && (iframe.style.top = top + 'px');
            left != null && (iframe.style.left = left +'px');
          }
        })
        const res = new Promise(resolve => window.addEventListener('message', ev => (ev.data == 'jbart is up') && resolve()))
        document.body.prepend(iframe)
        return res
    }
})

component('renderWidgetInIframe', {
  type: 'action',
  params: [
    {id: 'profile', byName: true},
    {id: 'selector', as: 'string', defaultValue: 'body'},
    {id: 'id', as: 'string', defaultValue: 'main'},
    {id: 'sourceCode', type: 'source-code<loader>'},
    {id: 'htmlAtts', as: 'string', defaultValue: 'style="font-size:12px"'}
  ],
  impl: (ctx, profile, selector, id) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidgetInIframe can not find element for selector', { selector })
    return jb.iframe.renderWidgetInIframe({id, profile, el, ...ctx.params})
  }
})

});

}