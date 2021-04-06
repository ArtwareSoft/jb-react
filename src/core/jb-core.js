Object.assign(jb, { 
  extension(libId, p1 , p2) {
    const extId = typeof p1 == 'string' ? p1 : 'main'
    const extension = p2 || p1
    const lib = jb[libId] = jb[libId] || {__initialized: {} }
    const funcs = Object.keys(extension).filter(k=>typeof extension[k] == 'function').filter(k=>!k.match(/^initExtension/))
    funcs.forEach(k=>lib[k] = extension[k])

    const initFuncId = Object.keys(extension).filter(k=>typeof extension[k] == 'function').filter(k=>k.match(/^initExtension/))[0]
    const phaseFromFunc = ((initFuncId||'').match(/_phase([0-9]+)/)||[,0])[1]
    const initFuncPhase = phaseFromFunc || { core: 1, utils: 5, db: 10, watchable: 20}[libId] || 100
    const initFunc = `init_${libId}-${extId}-phase${initFuncPhase}`
    const initFuncImpl = extension[initFuncId] || extension[initFunc]
    if (initFuncImpl) {
      lib[initFunc] = initFuncImpl    
      funcs.forEach(k=>lib[k].__initFuncs = [`#${libId}.${initFunc}`]) // [initFunc].map(x=>`#${libId}.${x}`))
      if (jb.noCodeLoader) {
        Object.assign(lib, lib[initFunc]())
        lib.__initialized[initFunc] = true
      }
    }
    const require = ['require',...Object.keys(extension).filter(k=>k.indexOf('__require_') == 0)]
      .filter(k =>extension[k]).forEach(k => {
        const k2 = k == 'require' ? `__require_${extId}` : k
        lib[k2] = extension[k]
        funcs.forEach(k=>lib[k].__require = [`#${libId}.${k2}`])
      })
  },
  initializeLibs(libs) {
    libs.flatMap(l => Object.keys(jb[l]).filter(x=>x.match(/^init_/)))
      .sort((x,y) => Number(x.match(/-phase([0-9]+)/)[1]) - Number(y.match(/-phase([0-9]+)/)[1]) )
      .forEach(initFunc=> {
        const lib = jb[initFunc.match(/init_([^-]+)/)[1]]
        if (! lib.__initialized[initFunc]) {
          lib.__initialized[initFunc] = true
          Object.assign(lib, lib[initFunc]())
        }
      })
    const baseUrl = jb.path(jb.codeLoader,'baseUrl')
    return libs.flatMap(l => Object.keys(jb[l]).filter(x=>x.match(/^__require_/)).flatMap(ext => jb[l][ext]||[]))
      .filter(url => !jb.frame.jb.__requiredLoaded[url])
      .reduce((pr,url) => pr.then(() => jb_loadFile(url,baseUrl,jb)).then(() => jb.frame.jb.__requiredLoaded[url] = true), Promise.resolve())
  },  
  component(id,comp) {
    // todo: move functionality to onAddComponent hook
    if (!jb.core.location) jb.initializeLibs(['core'])
    if (comp.location) {
        comp[jb.core.location] =  comp.location
        delete comp.location
    } else {
      try {
        const errStack = new Error().stack.split(/\r|\n/)
        const line = errStack.filter(x=>x && x != 'Error' && !x.match(/at Object.component/)).shift()
        comp[jb.core.location] = line ? (line.split('at eval (').pop().match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        comp[jb.core.project] = comp[jb.core.location][0].split('?')[1]
        comp[jb.core.location][0] = comp[jb.core.location][0].split('?')[0]      
      } catch(e) {
        console.log(e)
      }
    }

    if (comp.watchableData !== undefined) {
      jb.comps[jb.db.addDataResourcePrefix(id)] = comp
      return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)
    }
    if (comp.passiveData !== undefined) {
      jb.comps[jb.db.addDataResourcePrefix(id)] = comp
      return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)
    }
    jb.comps[id] = comp;

    // fix as boolean params to have type: 'boolean'
    (comp.params || []).forEach(p=> {
      if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1)
        p.type = 'boolean'
    })
    comp[jb.core.loadingPhase] = jb.frame.jbLoadingPhase
  },
  noCodeLoader: true
})

jb.extension('core', {
  initExtension() {
    Object.assign(jb, { 
      frame: (typeof frame == 'object') ? frame : typeof self === 'object' ? self : typeof global === 'object' ? global : {},
      comps: {}, ctxDictionary: {},
      __requiredLoaded: {},
      jstypes: jb.core.jsTypes()
    })
    return { 
      ctxCounter: 0, 
      project: Symbol.for('project'),
      location: Symbol.for('location'),
      loadingPhase: Symbol.for('loadingPhase'),
    }
  },
  run(ctx,parentParam,settings) {
    //  ctx.profile && jb.log('core request', [ctx.id,...arguments])
      if (ctx.probe && ctx.probe.outOfTime)
        return
      if (jb.ctxByPath) jb.ctxByPath[ctx.path] = ctx
      const runner = () => jb.core.doRun(...arguments)
      Object.defineProperty(runner, 'name', { value: `${ctx.path} ${ctx.profile && ctx.profile.$ ||''}-prepare param` })        
      let res = runner(...arguments)
      if (ctx.probe && ctx.probe.pathToTrace.indexOf(ctx.path) == 0)
          res = ctx.probe.record(ctx,res) || res
    //  ctx.profile && jb.log('core result', [ctx.id,res,ctx,parentParam,settings])
      if (typeof res == 'function') jb.utils.assignDebugInfoToFunc(res,ctx)
      return res
  },
  doRun(ctx,parentParam,settings) {
    try {
      const profile = ctx.profile
      if (profile == null || (typeof profile == 'object' && profile.$disabled))
        return jb.core.castToParam(null,parentParam)
  
      if (profile.$debugger == 0) debugger
      if (profile.$asIs) return profile.$asIs
      if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
          parentParam.as = 'array'
  
      if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
        return
      const ctxWithVars = jb.core.extendWithVars(ctx,profile.$vars)
      const run = jb.core.prepare(ctxWithVars,parentParam)
      ctx.parentParam = parentParam
      const {castToParam } = jb.core
      switch (run.type) {      
        case 'booleanExp': return castToParam(jb.expression.calcBool(profile, ctx,parentParam), parentParam)
        case 'expression': return castToParam(jb.expression.calc(profile, ctx,parentParam), parentParam)
        case 'asIs': return profile
        case 'function': return castToParam(profile(ctx,ctx.vars,ctx.cmpCtx && ctx.cmpCtx.params),parentParam)
        case 'null': return castToParam(null,parentParam)
        case 'ignore': return ctx.data
        case 'list': return profile.map((inner,i) => ctxWithVars.runInner(inner,null,i))
        case 'runActions': return jb.comps.runActions.impl(new jb.core.jbCtx(ctxWithVars,{profile: { actions : profile },path:''}))
        case 'profile':
          if (!run.impl)
            run.ctx.callerPath = ctx.path;
          const prepareParam = paramObj => {
            switch (paramObj.type) {
              case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
              case 'array': run.ctx.params[paramObj.name] =
                  paramObj.array.map(function prepareParamItem(prof,i) { return prof != null && jb.core.run(new jb.core.jbCtx(run.ctx,{
                        profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param)})
                ; break;  // maybe we should [].concat and handle nulls
              default: run.ctx.params[paramObj.name] =
                jb.core.run(new jb.core.jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
            }
          }
          Object.defineProperty(prepareParam, 'name', { value: `${run.ctx.path} ${profile.$ ||''}-prepare param` })        
    
          run.preparedParams.forEach(paramObj => prepareParam(paramObj))
          const out = run.impl ? run.impl.call(null,run.ctx,...run.preparedParams.map(param=>run.ctx.params[param.name])) 
            : jb.core.run(new jb.core.jbCtx(run.ctx, { cmpCtx: run.ctx }),parentParam)
          return castToParam(out,parentParam)
      }
    } catch (e) {
      if (ctx.vars.$throw) throw e
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
      .map((param) => {
        const p = param.id
        let val = profile[p], path =p
        const valOrDefault = val !== undefined ? val : (param.defaultValue !== undefined ? param.defaultValue : null)
        const usingDefault = val === undefined && param.defaultValue !== undefined
        const forcePath = usingDefault && [comp_name, 'params', jb.utils.compParams(comp).indexOf(param), 'defaultValue'].join('~')
        if (forcePath) path = ''
  
        const valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
        const arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);
  
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
        else
          return { name: p, type: 'run', prof: valOrDefault, param, forcePath, path };
    })
  },
  prepare(ctx,parentParam) {
    const profile = ctx.profile;
    const profile_jstype = typeof profile;
    const parentParam_type = parentParam && parentParam.type;
    const jstype = parentParam && parentParam.as;
    const isArray = Array.isArray(profile);
  
    if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' };
    if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' };// native primitives
    if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' };
    if (profile_jstype === 'string') return { type: 'expression' };
    if (profile_jstype === 'function') return { type: 'function' };
    if (profile_jstype === 'object' && (profile instanceof RegExp)) return { type: 'asIs' };
    if (profile == null) return { type: 'asIs' };
  
    if (isArray) {
      if (!profile.length) return { type: 'null' };
      if (!parentParam || !parentParam.type || parentParam.type === 'data' ) //  as default for array
        return { type: 'list' };
      if (parentParam_type === 'action' || parentParam_type === 'action[]' && profile.isArray) {
        profile.sugar = true;
        return { type: 'runActions' };
      }
    } 
    const comp_name = jb.utils.compName(profile,parentParam)
    if (!comp_name)
      return { type: 'asIs' }
    const comp = jb.comps[comp_name];
    if (!comp && comp_name) { jb.logError('component ' + comp_name + ' is not defined', {ctx}); return { type:'null' } }
    if (comp.impl == null) { jb.logError('component ' + comp_name + ' has no implementation', {ctx}); return { type:'null' } }
  
    jb.macro.fixProfile(profile)
    const resCtx = Object.assign(new jb.core.jbCtx(ctx,{}), {parentParam, params: {}})
    const preparedParams = jb.core.prepareParams(comp_name,comp,profile,resCtx);
    if (typeof comp.impl === 'function') {
      Object.defineProperty(comp.impl, 'name', { value: comp_name }) // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
      return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams: preparedParams }
    } else
      return { type:'profile', ctx: new jb.core.jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
  },
  castToParam: (value,param) => jb.core.tojstype(value,param ? param.as : null),
  tojstype: (v,jstype) => (!jstype || !jb.jstypes[jstype]) ? v : jb.jstypes[jstype](v),
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
      return jb.core.run(new jb.core.jbCtx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam)
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
      return new jb.core.jbCtx(this,{
        vars: ctx2 ? ctx2.vars : null,
        data: (data2 == null) ? ctx2.data : data2,
        forcePath: (ctx2 && ctx2.forcePath) ? ctx2.forcePath : null
      })
    }
    runItself(parentParam,settings) { return jb.core.run(this,parentParam,settings) }
    dataObj(data) { return {data, vars: this.vars} }
  },
  jsTypes() { return {
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
