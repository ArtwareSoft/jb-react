if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['vDebugger'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
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
    if (!initFuncImpl) return

    lib[initFunc] = initFuncImpl    
    funcs.forEach(k=>lib[k].__initFuncs = [initFunc].map(x=>`#${libId}.${x}`))
    if (jb.noCodeLoader)
      Object.assign(lib, lib[initFunc]())
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
  },
  noCodeLoader: true
})

// if (initFuncImpl) {
//   lib[initFunc] = initFuncImpl
//   if (! lib.__initialized[initFunc]) {
//     lib.__initialized[initFunc] = true
//     Object.assign(lib, lib[initFunc](extension))
//   }
// }
// jb.core.dependentInit = [...(jb.core.dependentInit || []), 
//   ...dependentInitFuncs.map(k=>({libId, func: k, extension, dependentOn: [...k.matchAll(/_([A-Za-z0-9]+)/g)].map(x=>x[1]) }))]
// const initToRun = jb.core.dependentInit.filter(x=>x.dependentOn.every(m=>jb[m]))
// jb.core.dependentInit = jb.core.dependentInit.filter(x=>! x.dependentOn.every(m=>jb[m]))
// initToRun.forEach(x=>{
//   const lib = jb[x.libId], initFunc = x.func
//   if (! lib.__initialized[initFunc]) {
//     lib.__initialized[initFunc] = true
//     Object.assign(lib, lib[initFunc](extension))
//   }
// })


jb.extension('core', {
  initExtension() {
    Object.assign(jb, { 
      frame: (typeof frame == 'object') ? frame : typeof self === 'object' ? self : typeof global === 'object' ? global : {},
      comps: {}, ctxDictionary: {}, macro: {},
      jstypes: jb.core.jsTypes()
    })
    return { 
      ctxCounter: 0, 
      project: Symbol.for('project'),
      location: Symbol.for('location'),
      loadingPhase: Symbol.for('loadingPhase'),
      macroNs: {},
      macroDef: Symbol('macroDef'), 
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
  
    jb.core.fixMacroByValue(profile,comp)
    const resCtx = Object.assign(new jb.core.jbCtx(ctx,{}), {parentParam, params: {}})
    const preparedParams = jb.core.prepareParams(comp_name,comp,profile,resCtx);
    if (typeof comp.impl === 'function') {
      Object.defineProperty(comp.impl, 'name', { value: comp_name }) // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
      return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams: preparedParams }
    } else
      return { type:'profile', ctx: new jb.core.jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
  },
  castToParam: (value,param) => jb.core.tojstype(value,param ? param.as : null),
  tojstype(value,jstype) {
    if (!jstype) return value;
    if (typeof jb.jstypes[jstype] != 'function') debugger;
    return jb.jstypes[jstype](value);
  },
  fixMacroByValue(profile,comp) {
    if (profile && profile.$byValue) {
      const params = jb.utils.compParams(comp)
      profile.$byValue.forEach((v,i)=> Object.assign(profile,{[params[i].id]: v}))
      delete profile.$byValue
    }
  },
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
    setVar(name,val) { return name ? new jb.core.jbCtx(this,{vars: {[name]: val}}) : this }
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
  callStack(ctx) {
    const ctxStack=[]; 
    for(let innerCtx=ctx; innerCtx; innerCtx = innerCtx.cmpCtx) 
      ctxStack.push(innerCtx)
    return ctxStack.map(ctx=>ctx.callerPath)
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
;

// core utils promoted for easy usage
Object.assign(jb, {
    log(logName, record, options) { jb.spy && jb.spy.log && jb.spy.log(logName, record, options) },
    logError(err,logObj) {
      jb.frame.console && jb.frame.console.log('%c Error: ','color: red', err, logObj)
      jb.log('error',{err , ...logObj})
    },
    logException(e,err,logObj) {
      jb.frame.console && jb.frame.console.log('%c Exception: ','color: red', err, e, logObj)
      jb.log('exception error',{ e, err, stack: e.stack||'', ...logObj})
    },
    val(ref) {
      if (ref == null || typeof ref != 'object') return ref
      const handler = jb.db.refHandler(ref)
      if (handler)
        return handler.val(ref)
      return ref
    },
    tostring: value => jb.core.tojstype(value,'string'),
    toarray: value => jb.core.tojstype(value,'array'),
    toboolean: value => jb.core.tojstype(value,'boolean'),
    tosingle: value => jb.core.tojstype(value,'single'),
    tonumber: value => jb.core.tojstype(value,'number'),
    exec: (...args) => new jb.core.jbCtx().run(...args),
    exp: (...args) => new jb.core.jbCtx().exp(...args),

    // todo - move to studio
    studio: { previewjb: jb },
    execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.core.jbCtx().run(...args),
})

jb.extension('utils', { // jb core utils
    profileType(profile) {
        if (!profile) return ''
        if (typeof profile == 'string') return 'data'
        const comp_name = jb.utils.compName(profile)
        return (jb.comps[comp_name] && jb.comps[comp_name].type) || ''
    },
    singleInType(parentParam) {
        const _type = parentParam && parentParam.type && parentParam.type.split('[')[0]
        return _type && jb.comps[_type] && jb.comps[_type].singleInType && _type
    },
    compName(profile,parentParam) {
        if (!profile || Array.isArray(profile)) return
        return profile.$ || jb.utils.singleInType(parentParam)
    },  
    compParams(comp) {
      if (!comp || !comp.params)
        return []
      return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>Object.assign(x[1],{id: x[0]}))
    },
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
      else if (jb.db.resources && jb.db.resources[varname] !== undefined)
        res = jb.utils.isRefType(jstype) ? jb.db.useResourcesHandler(h=>h.refOfPath([varname])) : jb.db.resource(varname)
      else if (jb.db.consts && jb.db.consts[varname] !== undefined)
        res = jb.utils.isRefType(jstype) ? jb.db.simpleValueByRefHandler.objectProperty(jb.db.consts,varname) : res = jb.db.consts[varname]
    
      return jb.utils.resolveFinishedPromise(res)
    },
    addDebugInfo(f,ctx) { f.ctx = ctx; return f},
    assignDebugInfoToFunc(func, ctx) {
      func.ctx = ctx
      const debugFuncName = ctx.profile && ctx.profile.$ || typeof ctx.profile == 'string' && ctx.profile.slice(0,10) || ''
      Object.defineProperty(func, 'name', { value: (ctx.path ||'').split('~').pop() + ': ' + debugFuncName })
    },
    subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),
})

jb.extension('utils', { // generic utils
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    tryWrapper(f,msg,ctx) { try { return f() } catch(e) { jb.logException(e,msg,{ctx}) }},
    flattenArray(items) {
      let out = [];
      items.filter(i=>i).forEach(function(item) {
        if (Array.isArray(item))
          out = out.concat(item);
        else
          out.push(item);
      })
      return out;
    },
    isPromise: v => v && Object.prototype.toString.call(v) === '[object Promise]',
    isDelayed(v) {
      if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
      else if (typeof v === 'object')
        return jb.utils.isPromise(v)
      else if (typeof v === 'function')
        return jb.callbag.isCallbag(v)
    },
    toSynchArray(item, synchCallbag) {
      if (jb.utils.isPromise(item))
        return item.then(x=>[x])

      if (! jb.asArray(item).find(v=> jb.callbag.isCallbag(v) || jb.utils.isPromise(v))) return item
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
      f = f || (x=>x);
      const keys = {}, res = [];
      ar.forEach(e=>{
        if (!keys[f(e)]) {
          keys[f(e)] = true;
          res.push(e)
        }
      })
      return res;
    },
    sessionStorage: (id,val) => val == undefined ? JSON.parse(jb.frame.sessionStorage.getItem(id)) : jb.frame.sessionStorage.setItem(id,JSON.stringify(val)),
    eval: (str,frame) => { try { return (frame || jb.frame).eval('('+str+')') } catch (e) { return Symbol.for('parseError') } },

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
;

jb.extension('expression', {
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
        return typeof ret === 'function' && invokeFunc ? ret(ctx) : ret
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
            return jb.jstypes[jstype](obj[subExp])
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
;

jb.extension('db', {
    initExtension() {
      Object.assign(this, { 
        passiveSym: Symbol.for('passive'),
        resources: {}, consts: {}, 
        watchableHandlers: [],
        isWatchableFunc: [], // assigned by watchable module, if loaded - must be put in array so the code loader will not pack it.
        simpleValueByRefHandler: jb.db._simpleValueByRefHandler()
      })
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
    writeValue: (ref,value,srcCtx,noNotifications) => !srcCtx.probe && jb.db.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.db.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    doOp: (ref,op,srcCtx) => !srcCtx.probe && jb.db.safeRefCall(ref, h=>h.doOp(ref,op,srcCtx)),
    isRef: ref => jb.db.refHandler(ref),
    isWatchable: ref => jb.db.isWatchableFunc[0] && jb.db.isWatchableFunc[0](ref), // see remark at initExtension
    isValid: ref => jb.db.safeRefCall(ref, h=>h.isValid(ref)),
    pathOfRef: ref => jb.db.safeRefCall(ref, h=>h.pathOfRef(ref)),
    refOfPath: path => jb.db.watchableHandlers.reduce((res,h) => res || h.refOfPath(path),null),
    removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
    addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,
})

;

Object.assign(jb, {
    component(_id,comp) {
      if (!jb.core.location) jb.initializeLibs(['core'])
      const id = jb.macroName(_id)
      try {
        const errStack = new Error().stack.split(/\r|\n/)
        const line = errStack.filter(x=>x && x != 'Error' && !x.match(/at Object.component/)).shift()
        comp[jb.core.location] = line ? (line.split('at eval (').pop().match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        comp[jb.core.project] = comp[jb.core.location][0].split('?')[1]
        comp[jb.core.location][0] = comp[jb.core.location][0].split('?')[0]
      
        if (comp.watchableData !== undefined) {
          jb.comps[jb.db.addDataResourcePrefix(id)] = comp
          return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)
        }
        if (comp.passiveData !== undefined) {
          jb.comps[jb.db.addDataResourcePrefix(id)] = comp
          return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)
        }
      } catch(e) {
        console.log(e)
      }
  
      jb.comps[id] = comp;
  
      // fix as boolean params to have type: 'boolean'
      (comp.params || []).forEach(p=> {
        if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1)
          p.type = 'boolean'
      })
      comp[jb.core.loadingPhase] = jb.frame.jbLoadingPhase
      jb.registerMacro && jb.registerMacro(id)
    },    
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => {
        nsIds.split(',').forEach(nsId => jb.registerMacro(nsId))
        return jb.macro
    },
    importAllMacros: () => ['var { ',
        jb.utils.unique(Object.keys(jb.macro).map(x=>x.split('_')[0])).join(', '), 
    '} = jb.macro;'].join(''),
    registerMacro: id => {
        const macroId = jb.macroName(id).replace(/\./g, '_')
        const nameSpace = id.indexOf('.') != -1 && jb.macroName(id.split('.')[0])

        if (checkId(macroId))
            registerProxy(macroId)
        if (nameSpace && checkId(nameSpace, true) && !jb.macro[nameSpace]) {
            registerProxy(nameSpace, true)
            jb.core.macroNs[nameSpace] = true
        }

        function registerProxy(proxyId) {
            jb.macro[proxyId] = new Proxy(() => 0, {
                get: (o, p) => {
                    if (typeof p === 'symbol') return true
                    return jb.macro[proxyId + '_' + p] || genericMacroProcessor(proxyId, p)
                },
                apply: function (target, thisArg, allArgs) {
                    const { args, system } = splitSystemArgs(allArgs)
                    return Object.assign(processMacro(args), system)
                }
            })
        }

        function splitSystemArgs(allArgs) {
            const args = [], system = {} // system props: constVar, remark
            allArgs.forEach(arg => {
                if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isSystem)
                    jb.comps[arg.$].macro(system, arg)
                else
                    args.push(arg)
            })
            if (args.length == 1 && typeof args[0] === 'object') {
                jb.asArray(args[0].vars).forEach(arg => jb.comps[arg.$].macro(system, arg))
                args[0].remark && jb.comps.remark.macro(system, args[0])
            }
            return { args, system }
        }

        function checkId(macroId, isNS) {
            if (jb.frame[macroId] && !jb.frame[macroId][jb.core.macroDef]) {
                jb.logError(macroId + ' is reserved by system or libs. please use a different name')
                return false
            }
            if (Object.keys(jb.macro[macroId] ||{}).length && !isNS && !jb.core.macroNs[macroId])
                jb.logError(macroId.replace(/_/g,'.') + ' is defined more than once, using last definition ' + id)
            return true
        }

        function processMacro(args) {
            const _id = id; //.replace(/\.\$forwardDef$/,'')
            const _profile = jb.comps[_id]
            if (!_profile) {
                jb.logError('forward def ' + _id + ' was not implemented')
                return { $: _id }
            }
            if (args.length == 0)
                return { $: _id }
            const params = _profile.params || []
            const firstParamIsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
            if (params.length == 1 && firstParamIsArray) // pipeline, or, and, plus
                return { $: _id, [params[0].id]: args }
            const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
                (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
            if ((_profile.macroByValue || params.length < 3) && _profile.macroByValue !== false && !macroByProps)
                return { $: _id, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
            if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
                return { $: _id, ...args[0] }
            if (args.length == 1 && params.length)
                return { $: _id, [params[0].id]: args[0] }
            if (args.length == 2 && params.length > 1)
                return { $: _id, [params[0].id]: args[0], [params[1].id]: args[1] }
            debugger;
        }
        //const unMacro = macroId => macroId.replace(/([A-Z])/g, (all, s) => '-' + s.toLowerCase())
        function genericMacroProcessor(ns, macroId) {
            return (...allArgs) => {
                const { args, system } = splitSystemArgs(allArgs)
                const out = { $: `${ns}.${macroId}` }
                if (args.length == 1 && typeof args[0] == 'object' && !jb.utils.compName(args[0]))
                    Object.assign(out, args[0])
                else
                    Object.assign(out, { $byValue: args })
                return Object.assign(out, system)
            }
        }
    }
})
;


jb.extension('codeLoader', {
    initExtension() {
        return {
            coreComps: ['#extension','#core.run','#component','#jbm.extendPortToJbmProxy','#jbm.portFromFrame','#spy.initSpy','#codeLoader.getCodeFromRemote','codeLoader.getCode','waitFor'],
            existingFEPaths: {},
            loadedFElibs: {}
        }
    },
    existing() {
        const jbFuncs = Object.keys(jb).filter(x=> typeof jb[x] == 'function').map(x=>`#${x}`)
        const libs = Object.keys(jb).filter(x=> typeof jb[x] == 'object' && jb[x].__initialized)
        const funcs = libs.flatMap(lib=>Object.keys(jb[lib]).filter(x => typeof jb[lib][x] == 'function').map(x=>`#${lib}.${x}`) )
        return [...Object.keys(jb.comps), ...jbFuncs, ...funcs]
    },
    treeShake(ids, existing) {
        const _ids = ids.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_ids.flatMap(id => jb.codeLoader.dependent(id).filter(x=>!existing[x])))
        const idsWithoutPartial = jb.utils.unique(_ids.map(id=>id.split('~')[0]))
        if (!dependent.length) return idsWithoutPartial
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._ids ].map(x=>[x,true]) )
        return [ ...idsWithoutPartial, ...jb.codeLoader.treeShake(dependent, existingExtended)]
    },
    dependent(id) {
        const func = id[0] == '#' && id.slice(1)
        if (func && jb.path(jb,func) !== undefined)
            return jb.codeLoader.dependentOnFunc(jb.path(jb,func))
        else if (jb.comps[id])
            return jb.codeLoader.dependentOnObj(jb.comps[id])
        else if (id.match(/~/)) 
            return [jb.path(jb.comps,id.split('~'))].filter(x=>x)
                .flatMap(obj=> typeof obj === 'function' ? jb.codeLoader.dependentOnFunc(obj) : jb.codeLoader.dependentOnObj(obj))
        else
            jb.logError('codeLoader: can not find comp', {id})
        return []
    },
    dependentOnObj(obj, onlyMissing) {
        const isRemote = 'source.remote:rx,remote.operator:rx,remote.action:action,remote.data:data' // code run in remote is not dependent
        const vals = Object.keys(obj).filter(k=>!obj.$ || isRemote.indexOf(`${obj.$}:${k}`) == -1).map(k=>obj[k])
        return [
            ...(obj.$ ? [obj.$] : []),
            ...vals.filter(x=> x && typeof x == 'object').flatMap(x => jb.codeLoader.dependentOnObj(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'function').flatMap(x => jb.codeLoader.dependentOnFunc(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('__JBART_FUNC') == 0).flatMap(x => jb.codeLoader.dependentOnFunc(x, onlyMissing)),
        ].filter(id=> !onlyMissing || jb.codeLoader.missing(id)).filter(x=> x!= 'runCtx')
    },
    dependentOnFunc(func, onlyMissing) {
        if (!func) debugger
        const funcStr = typeof func == 'string' ? func : func.toString()
        const funcDefs = [...funcStr.matchAll(/{([a-zA-Z0-9_ ,]+)}\s*=\s*jb\.([a-zA-Z0-9_]+)\b/g)] // {...} = jb.xx
            .map(line=>({ lib: line[2], funcs: line[1].split(',')}))
            .flatMap(({lib,funcs}) => funcs.map(f=>`#${lib}.${f.trim()}`))
        const funcUsage = [...funcStr.matchAll(/\bjb\.([a-zA-Z0-9_]+)\.?([a-zA-Z0-9_]*)\(/g)].map(e=>e[2] ? `#${e[1]}.${e[2]}` : `#${e[1]}`)
        //jb.log('codeLoader dependent on func',{f: func.name || funcStr, funcDefs, funcUsage})

        return [ ...(func.__initFuncs || []), ...funcDefs, ...funcUsage]
            .filter(x=>!x.match(/^#frame\./)).filter(id=> !onlyMissing || jb.codeLoader.missing(id))
    },
    code(ids) {
        jb.log('codeLoader code',{ids})
        const funcs = ids.filter(cmpId => !jb.comps[cmpId])
        const cmps = ids.filter(cmpId => jb.comps[cmpId])
        const topLevel = jb.utils.unique(funcs.filter(x=>x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
        const topLevelCode = topLevel.length && `Object.assign(jb, ${jb.utils.prettyPrint(jb.objFromEntries(topLevel.map(x=>[x,jb.path(jb,x)])))}\n)` || ''
        const libs = jb.utils.unique(funcs.map(x=> (x.match(/#([a-zA-Z0-9_]+)\./) || ['',''])[1] ).filter(x=>x)) // group by
        const libsCode = libs.map(lib => {
            const funcsCode = jb.utils.prettyPrint(jb.objFromEntries(funcs.filter(x=>x.indexOf(lib) == 1).map(x=>[x.split('.').pop(),jb.path(jb,x.slice(1))])))
            return `jb.extension('${lib}', ${funcsCode})`
        }).join('\n\n')

        const compsCode = cmps.map(cmpId =>jb.codeLoader.compToStr(cmpId)).join('\n\n')
            //jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId],{noMacros: true})).join('\n\n')
        return [topLevelCode,libsCode,compsCode,`jb.initializeLibs([${libs.map(l=>"'"+l+"'").join(',')}])`].join(';\n\n')
    },
    compToStr(cmpId) {
        const content = JSON.stringify(jb.comps[cmpId],
            (k,v) => typeof v === 'function' ? '@@FUNC'+v.toString()+'FUNC@@' : v,2)
                .replace(/"@@FUNC([^@]+)FUNC@@"/g, (_,str) => str.replace(/\\\\n/g,'@@__N').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\t/g,'').replace(/@@__N/g,'\\\\n') )
        return `jb.component('${cmpId}', ${content})`
    },
    bringMissingCode(obj) {
        const missing = getMissingProfiles(obj)
        if (missing.length) 
            jb.log('codeLoader bring missing code',{obj, missing})
        return Promise.resolve(jb.codeLoader.getCodeFromRemote(missing))

        function getMissingProfiles(obj) {
            if (obj && typeof obj == 'object') 
                return jb.codeLoader.dependentOnObj(obj,true)
            else if (typeof obj == 'function') 
                return jb.codeLoader.dependentOnFunc(obj,true)
            return []
        }
    },
    missing(id) {
        return !(jb.comps[id] || id[0] == '#' && jb.path(jb, id.slice(1)))
    },
    getCodeFromRemote(ids) {
        if (!ids.length) return
        const stripedCode = {
            $: 'runCtx', path: '',
            profile: {$: 'codeLoader.getCode'},
            vars: { ids: ids.join(','), existing: jb.codeLoader.existing().join(',') }
        }
        jb.log('codeLoader request code from remote',{ids, stripedCode})
        return jb.codeLoaderJbm && jb.codeLoaderJbm['remoteExec'](stripedCode)
            .then(code=> {
                jb.log('codeLoader code arrived from remote',{ids, stripedCode, length: code.length, url: `${jb.uri}-${ids[0]}-x.js`, lines: 1+(code.match(/\n/g) || []).length })
                try {
                    jb.codeLoader.totalCodeSize = (jb.codeLoader.totalCodeSize || 0) + code.length
                    eval(`(function(jb) {${code}})(jb)\n//# sourceURL=${jb.uri}-${ids[0]}-x.js` )
                } catch(error) {
                    jb.log('codeLoader eval error from remote',{error, ids, stripedCode})
                }
            })
    },
    startupCode: () => jb.codeLoader.code(jb.codeLoader.treeShake(jb.codeLoader.coreComps,{})),
    treeShakeFrontendFeatures(paths) { // treeshake the code of the FRONTEND features without the backend part
        const _paths = paths.filter(path=>! jb.codeLoader.existingFEPaths[path]) // performance - avoid tree shake if paths were processed before 
        if (!_paths.length) return []
        paths.forEach(path=>jb.codeLoader.existingFEPaths[path] = true)
        return jb.utils.unique(jb.codeLoader.treeShake(_paths,jb.codeLoader.existing()).map(path=>path.split('~')[0]).filter(id=>jb.codeLoader.missing(id)))
    },
    loadFELibsDirectly(libs) {
        if (typeof document == 'undefined') 
            return jb.logError('can not load front end libs to a frame without a document')
        const _libs = libs.filter(lib=>! jb.codeLoader.loadedFElibs[lib])
        if (!_libs.length) return []
        return _libs.reduce((pr,lib) => pr.then(loadFile(lib)).then(()=> jb.codeLoader.loadedFElibs[lib] = true), Promise.resolve())

        function loadFile(lib) {
            return new Promise(resolve => {
                const type = lib.indexOf('.css') == -1 ? 'script' : 'link'
                var s = document.createElement(type)
                s.setAttribute(type == 'script' ? 'src' : 'href',`/dist/${lib}`)
                if (type == 'script') 
                    s.setAttribute('charset','utf8') 
                else 
                    s.setAttribute('rel','stylesheet')
                s.onload = s.onerror = resolve
                document.head.appendChild(s);
            })
        }        
    },
})

jb.component('codeLoader.getCode',{
    impl: ({vars}) => {
        const treeShake = jb.codeLoader.treeShake(vars.ids.split(','),jb.objFromEntries(vars.existing.split(',').map(x=>[x,true])))
        jb.log('codeLoader treeshake',{...vars, treeShake})
        return jb.codeLoader.code(treeShake)
    }
});

jb.extension('spy', {
	initExtension() {
		// jb.spy._log() -- for codeLoader
		Object.assign(this, {
			logs: [],
			settings: { 
				includeLogs: 'exception,error',
				stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
				MAX_LOG_SIZE: 10000
			},
			Error: jb.frame.Error
		})
	},
	initSpyByUrl() {
		const frame = jb.frame
		const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
		const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
		const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
		jb.spy.initSpy({spyParam :frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
			getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')})
	},
	initSpy({spyParam}) {
		if (!spyParam) return
		jb.spy.spyParam = spyParam
		jb.spy.log = jb.spy._log // actually enables logging
		if (jb.frame) jb.frame.spy = jb.spy // for console use
		jb.spy.includeLogsInitialized = false
		jb.spy._obs = jb.callbag.subject()
		return jb.spy
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
	_log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
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
			$attsOrder: _record && Object.keys(_record)
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
	frameAccessible(frame) { try { return Boolean(frame.document || frame.contentDocument) } catch(e) { return false } },
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
	search(query,{ slice, spy } = {slice: -1000, spy: jb.spy}) { // e.g., dialog core | menu !keyboard  
		const _or = query.split(/,|\|/)
		return _or.reduce((acc,exp) => 
			unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), spy.logs.slice(slice))) 
		,[])

		function filter(set,exp) {
			return (exp[0] == '!') 
				? set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp.slice(1)) == -1)
				: set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp) != -1)
		}
		function unify(set1,set2) {
			let res = [...set1,...set2].sort((x,y) => x.index < y.index)
			return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
		}
	}
})

;

var { not,contains,writeValue,obj,prop } = jb.ns('not,contains,writeValue,obj,prop') // use in module

jb.component('call', {
  type: 'any',
  params: [
    {id: 'param', as: 'string'}
  ],
  impl: function(context,param) {
 	  const paramObj = context.cmpCtx && context.cmpCtx.params[param];
      if (typeof paramObj == 'function')
 		return paramObj(new jb.core.jbCtx(context, {
 			data: context.data,
 			vars: context.vars,
 			cmpCtx: context.cmpCtx.cmpCtx,
 			forcePath: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
})

jb.extension('utils', {
  calcPipe(ctx,ptName,passRx) {
    let start = jb.toarray(ctx.data)
    if (start.length == 0) start = [null]
    if (typeof ctx.profile.items == 'string')
      return ctx.runInner(ctx.profile.items,null,'items');
    const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
    const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
      : (ctx.profile[ptName] ? (ptName + '~') : 'items~');

    if (ptName == '$pipe') // promise pipe
      return profiles.reduce((deferred,prof,index) =>
        deferred.then(data=>jb.utils.toSynchArray(data, !passRx)).then(data=>step(prof,index,data))
      , Promise.resolve(start))
        .then(data=>jb.utils.toSynchArray(data, !passRx))

    return profiles.reduce((data,prof,index) => step(prof,index,data), start)

    function step(profile,i,data) {
      if (!profile || profile.$disabled) return data;
      const path = innerPath+i
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {}) ;
      if (jb.utils.profileType(profile) == 'aggregator')
        return jb.core.run( new jb.core.jbCtx(ctx, { data, profile, path }), parentParam);
      return [].concat.apply([],data.map(item =>
          jb.core.run(new jb.core.jbCtx(ctx,{data: item, profile, path}), parentParam))
        .filter(x=>x!=null)
        .map(x=> {
          const val = jb.val(x)
          return Array.isArray(val) ? val : x 
        }));
    }
  }
})

jb.component('pipeline', {
  type: 'data',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true, description: 'click "=" for functions list'}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipeline')
})

jb.component('pipe', {
  type: 'data',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipe',false)
})

jb.component('data.if', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', mandatory: true, dynamic: true },
    {id: 'else', dynamic: true, defaultValue: '%%'}
  ],
  impl: ({},cond,_then,_else) =>	cond() ? _then() : _else()
})

jb.component('action.if', {
  type: 'action',
  description: 'if then else',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'action', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'action', dynamic: true}
  ],
  impl: ({},cond,_then,_else) =>	cond ? _then() : _else()
})

jb.component('jbRun', {
  type: 'action',
  params: [
    {id: 'profile', as: 'string', mandatory: true, description: 'profile name'},
    {id: 'params', as: 'single'}
  ],
  impl: (ctx,profile,params) =>	ctx.run(Object.assign({$:profile},params || {}))
})

jb.component('list', {
  type: 'data',
  description: 'also flatten arrays',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
})

jb.component('firstSucceeding', {
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

jb.component('keys', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj && typeof obj === 'object' ? obj : {})
})

jb.component('properties', {
  description: 'object entries as id,val',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
})

jb.component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => jb.entries(obj)
})

jb.component('aggregate', {
  type: 'aggregator',
  description: 'calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'aggregator', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

jb.ns('math')

jb.component('math.max', {
  type: 'aggregator',
  impl: ctx => Math.max.apply(0,ctx.data)
})

jb.component('math.min', {
  type: 'aggregator',
  impl: ctx => Math.max.apply(0,ctx.data)
})

jb.component('math.sum', {
  type: 'aggregator',
  impl: ctx => ctx.data.reduce((acc,item) => +item+acc, 0)
})

jb.component('math.plus', {
  params: [
    {id: 'x', as: 'number', mandatory: true },
    {id: 'y', as: 'number', mandatory: true },
  ],
  impl: ({},x,y) => x + y
})

jb.component('math.minus', {
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true},
  ],
  impl: ({},x,y) => x - y
})

'abs,acos,acosh,asin,asinh,atan,atan2,atanh,cbrt,ceil,clz32,cos,cosh,exp,expm1,floor,fround,hypot,log2,random,round,sign,sin,sinh,sqrt,tan,tanh,trunc'
  .split(',').forEach(f=>jb.component(`math.${f}`, {
    impl: ctx => Math[f](ctx.data)
  })
)

jb.component('objFromEntries', {
  description: 'object from entries',
  type: 'aggregator',
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

jb.component('evalExpression', {
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

jb.component('prefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(0,text.indexOf(separator))
})

jb.component('suffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(text.lastIndexOf(separator)+separator.length)
})

jb.component('removePrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
})

jb.component('removeSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
})

jb.component('removeSuffixRegex', {
  type: 'data',
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

jb.component('writeValue', {
  type: 'action',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true},
    {id: 'noNotifications', as: 'boolean'}
  ],
  impl: (ctx,to,value,noNotifications) => {
    if (!jb.db.isRef(to)) {
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

jb.component('property', {
  description: 'navigate/select/path property of object',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,prop,obj) =>	jb.db.objectProperty(obj,prop,ctx)
})

jb.component('indexOf', {
  params: [
    {id: 'array', as: 'array', mandatory: true},
    {id: 'item', as: 'single', mandatory: true}
  ],
  impl: ({},array,item) => array.indexOf(item)
})

jb.component('addToArray', {
  type: 'action',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'toAdd', as: 'array', mandatory: true}
  ],
  impl: (ctx,array,toAdd) => jb.db.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
})

jb.component('move', {
  type: 'action',
  description: 'move item in tree, activated from D&D',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.db.move(from,_to,ctx)
})

jb.component('splice', {
  type: 'action',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'fromIndex', as: 'number', mandatory: true},
    {id: 'noOfItemsToRemove', as: 'number', defaultValue: 0},
    {id: 'itemsToAdd', as: 'array', defaultValue: []}
  ],
  impl: (ctx,array,fromIndex,noOfItemsToRemove,itemsToAdd) =>
		jb.db.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
})

jb.component('removeFromArray', {
  type: 'action',
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

jb.component('toggleBooleanValue', {
  type: 'action',
  params: [
    {id: 'of', as: 'ref'}
  ],
  impl: (ctx,_of) => jb.db.writeValue(_of,jb.val(_of) ? false : true,ctx)
})

jb.component('slice', {
  type: 'aggregator',
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {id: 'end', as: 'number', mandatory: true, description: '0-based index of where to end the selection (not including itself)'}
  ],
  impl: ({data},start,end) => {
		if (!data || !data.slice) return null
		return end ? data.slice(start,end) : data.slice(start)
	}
})

jb.component('sort', {
  type: 'aggregator',
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

jb.component('first', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items[0]
})

jb.component('last', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(-1)[0]
})

jb.component('count', {
  type: 'aggregator',
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.length
})

jb.component('reverse', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(0).reverse()
})

jb.component('sample', {
  type: 'aggregator',
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

jb.component('obj', {
  description: 'build object (dictionary) from props',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, sugar: true}
  ],
  impl: (ctx,properties) => jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx),p.type)]))
})

jb.component('extend', {
  description: 'assign and extend with calculated properties',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) =>
		Object.assign({}, ctx.data, jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx),p.type)])))
})
jb.component('assign', jb.comps.extend)

jb.component('extendWithIndex', {
  type: 'aggregator',
  description: 'extend with calculated properties. %$index% is available ',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) => jb.toarray(ctx.data).map((item,i) =>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.title, jb.core.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
})

jb.component('prop', {
  type: 'prop',
  macroByValue: true,
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'}
  ],
  impl: ctx => ctx.params
})

// jb.component('objMethod', {
//   type: 'prop',
//   macroByValue: true,
//   params: [
//     {id: 'title', as: 'string', mandatory: true},
//     {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
//     {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'}
//   ],
//   impl: ({},title,val,type) => ({title,val: () => () => ctx2 => val(ctx2) ,type})
// })

jb.component('refProp', {
  type: 'prop',
  description: 'value by reference allows to change or watch the value',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, as: 'ref', mandatory: true}
  ],
  impl: ctx => ({ ...ctx.params, type: 'ref' })
})


jb.component('pipeline.var', {
  type: 'aggregator',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', mandatory: true, dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({ [Symbol.for('Var')]: true, ...ctx.params })
})


jb.component('Var', {
  type: 'var,system',
  isSystem: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  },
  impl: '' // for inteliscript
//  Object.assign(result,{ $vars: Object.assign(result.$vars || {}, { [self.name]: self.val }) })
})

jb.component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'remark', as: 'string', mandatory: true}
  ],
  macro: (result, self) => Object.assign(result,{ remark: self.remark })
})

jb.component('If', {
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', dynamic: true},
    {id: 'Else', dynamic: true}
  ],
  impl: ({},cond,_then,_else) => cond() ? _then() : _else()
})

jb.component('not', {
  type: 'boolean',
  params: [
    {id: 'of', type: 'boolean', as: 'boolean', mandatory: true, composite: true}
  ],
  impl: ({}, of) => !of
})

jb.component('and', {
  description: 'logical and',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: function(context) {
		const items = context.profile.$and || context.profile.items || [];
		const innerPath =  context.profile.$and ? '$and~' : 'items~';
		for(let i=0;i<items.length;i++) {
			if (!context.runInner(items[i], { type: 'boolean' }, innerPath + i))
				return false;
		}
		return true;
	}
})

jb.component('or', {
  description: 'logical or',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: function(context) {
		const items = context.profile.$or || context.profile.items || [];
		const innerPath =  context.profile.$or ? '$or~' : 'items~';
		for(let i=0;i<items.length;i++) {
			if (context.runInner(items[i],{ type: 'boolean' },innerPath+i))
				return true;
		}
		return false;
	}
})

jb.component('between', {
  description: 'checks if number is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', mandatory: true},
    {id: 'to', as: 'number', mandatory: true},
    {id: 'val', as: 'number', defaultValue: '%%'}
  ],
  impl: ({},from,to,val) => val >= from && val <= to
})

jb.component('contains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'string'},
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

jb.component('notContains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'array'}
  ],
  impl: not(
    contains({text: '%$text%', allText: '%$allText%'})
  )
})

jb.component('startsWith', {
  description: 'begins with, includes, contains',
  type: 'boolean',
  params: [
    {id: 'startsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: ({},startsWith,text) => text.indexOf(startsWith) == 0
})

jb.component('endsWith', {
  description: 'includes, contains',
  type: 'boolean',
  params: [
    {id: 'endsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: ({},endsWith,text) => text.indexOf(endsWith,text.length-endsWith.length) !== -1
})


jb.component('filter', {
  type: 'aggregator',
  params: [
    {id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) =>	jb.toarray(ctx.data).filter(item =>	filter(ctx,item))
})

jb.component('matchRegex', {
  description: 'validation with regular expression',
  type: 'boolean',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: 'e.g: [a-zA-Z]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},regex,text) => text.match(new RegExp(regex))
})

jb.component('toUpperCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) =>	text.toUpperCase()
})

jb.component('toLowerCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.toLowerCase()
})

jb.component('capitalize', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.charAt(0).toUpperCase() + text.slice(1)
})

jb.component('join', {
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', mandatory: true},
    {id: 'prefix', as: 'string'},
    {id: 'suffix', as: 'string'},
    {id: 'items', as: 'array', defaultValue: '%%'},
    {id: 'itemText', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  type: 'aggregator',
  impl: (ctx,separator,prefix,suffix,items,itemText) => {
		const itemToText = ctx.profile.itemText ?	item => itemText(ctx.setData(item)) :	item => jb.tostring(item);	// performance
		return prefix + items.map(itemToText).join(separator) + suffix;
	}
})

jb.component('unique', {
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  type: 'aggregator',
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
})

jb.component('log', {
  params: [
    {id: 'logName', as: 'string', mandatory: 'true' },
    {id: 'logObj', as: 'single' }
  ],
  impl: (ctx,log,logObj) => { jb.log(log,{...logObj,ctx}); return ctx.data }
})

jb.component('asIs', {
  params: [
    {id: '$asIs', ignore: true}
  ],
  impl: () => context.profile.$asIs
})

jb.component('object', {
  impl: function(context) {
		let result = {};
		const obj = context.profile.$object || context.profile;
		if (Array.isArray(obj)) return obj;
		for(let prop in obj) {
			if ((prop == '$' && obj[prop] == 'object') || obj[prop] == null)
				continue;
			result[prop] = context.runInner(obj[prop],null,prop);
		}
		return result;
	}
})

jb.component('json.stringify', {
  params: [
    {id: 'value', defaultValue: '%%'},
    {id: 'space', as: 'string', description: 'use space or tab to make pretty output'}
  ],
  impl: ({},value,space) => JSON.stringify(jb.val(value),null,space)
})

jb.component('json.parse', {
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

jb.component('split', {
  description: 'breaks string using separator',
  type: 'data',
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', description: 'E.g., \",\" or \"<a>\"'},
    {id: 'text', as: 'string', defaultValue: '%%'},
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

jb.component('replace', {
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

jb.component('touch', {
  description: 'change the value of a watchable variable to acticate its watchers',
  type: 'action',
  params: [
    {id: 'dataRef', as: 'ref'}
  ],
  impl: writeValue('%$dataRef%',not('%$dataRef%'))
})

jb.component('isNull', {
  description: 'is null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) == null
})

jb.component('notNull', {
  description: 'not null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) != null
})

jb.component('isEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => !item || (Array.isArray(item) && item.length == 0)
})

jb.component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => item && !(Array.isArray(item) && item.length == 0)
})

jb.component('equals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 == item2
})

jb.component('notEquals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 != item2
})

jb.component('runActions', {
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

jb.component('runActionOnItem', {
  type: 'action',
  params: [
    {id: 'item', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,item,action) => item != null && action(ctx.setData(item))
})

jb.component('runActionOnItems', {
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

jb.component('delay', {
  type: 'action,data',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1}
  ],
  impl: (ctx,mSec) => jb.delay(mSec).then(() => ctx.data)
})

jb.component('onNextTimer', {
  description: 'run action after delay',
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'delay', type: 'number', defaultValue: 1}
  ],
  impl: (ctx,action,delay) => jb.delay(delay,ctx).then(()=>	action())
})

jb.component('extractPrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%'},
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

jb.component('extractSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%'},
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

jb.component('range', {
  description: 'returns a range of number, generator, numerator, numbers, index',
  type: 'data',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({},from,to) => Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

jb.component('typeOf', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj)
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

jb.component('className', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

jb.component('isOfType', {
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

jb.component('inGroup', {
  description: 'is in list, contains in array',
  type: 'boolean',
  params: [
    {id: 'group', as: 'array', mandatory: true},
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({},group,item) =>	group.indexOf(item) != -1
})

jb.urlProxy = (typeof window !== 'undefined' && location.href.match(/^[^:]*/)[0] || 'http') + '://jbartdb.appspot.com/jbart_db.js?op=proxy&url='
jb.cacheKiller = 0
jb.component('http.get', {
  type: 'data,action',
  description: 'fetch data from external url',
  params: [
    {id: 'url', as: 'string'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean'},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud'}
  ],
  impl: (ctx,_url,_json,useProxy) => {
		if (ctx.probe)
			return jb.http_get_cache[_url];
    const json = _json || _url.match(/json$/);
    let url = _url
    if (useProxy == 'localhost-server')
      url = `/?op=fetch&req=${JSON.stringify({url})}&cacheKiller=${jb.cacheKiller++}`
    else if (useProxy == 'cloud')
      url = `//jbart5-server.appspot.com/?op=fetch&req={url:"${url}"}&cacheKiller=${jb.cacheKiller++}`

		return fetch(url, {mode: 'cors'})
			  .then(r => json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[url] = res) : res)
			  .catch(e => jb.logException(e,'http.get',{ctx}) || [])
	}
})

jb.component('http.fetch', {
  type: 'data,action',
  description: 'fetch, get or post data from external url',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'method', as: 'string', options: 'GET,POST', defaultValue: 'GET'},
    {id: 'headers', as: 'single', templateValue: obj(prop('Content-Type', 'application/json; charset=UTF-8'))},
    {id: 'body', as: 'single'},
    {id: 'json', as: 'boolean', description: 'convert result to json', type: 'boolean'},
    {id: 'useProxy', as: 'string', options: ',localhost-server,cloud,cloud-test-local'}
  ],
  impl: (ctx,url,method,headers,body,json,proxy) => {
    const reqObj = {
      url,
      method,
      headers: headers || {},
      mode: 'cors',
      body: (typeof body == 'string' || body == null) ? body : JSON.stringify(body)
    }

    const reqStr = encodeURIComponent(JSON.stringify(reqObj))
		if (ctx.probe)
			return jb.http_get_cache[reqStr];

    if (proxy == 'localhost-server')
      reqObj.url = `/?op=fetch&req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud')
      reqObj.url = `//jbart5-server.appspot.com/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`
    else if (proxy == 'cloud-test-local')
      reqObj.url = `http://localhost:8080/fetch?req=${reqStr}&cacheKiller=${jb.cacheKiller++}`

    return fetch(reqObj.url, proxy ? {mode: 'cors'} : reqObj)
			  .then(r => json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[reqStr] = res) : res)
			  .catch(e => jb.logException(e,'http.fetch',{ctx}) || [])
	}
})

jb.component('isRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.isRef(obj)
})

jb.component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.asRef(obj)
})

jb.component('data.switch', {
  macroByValue: false,
  params: [
    {id: 'cases', type: 'data.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'default', dynamic: true}
  ],
  impl: (ctx,cases,defaultValue) => {
		for(let i=0;i<cases.length;i++)
			if (cases[i].condition(ctx))
				return cases[i].value(ctx)
		return defaultValue(ctx)
	}
})

jb.component('data.case', {
  type: 'data.switch-case',
//  singleInType: true,
  params: [
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

jb.component('action.switch', {
  type: 'action',
  params: [
    {id: 'cases', type: 'action.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'defaultAction', type: 'action', dynamic: true}
  ],
  impl: (ctx,cases,defaultAction) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

jb.component('action.switchCase', {
  type: 'action.switch-case',
//  singleInType: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true, dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

jb.component('formatDate', {
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

jb.component('getSessionStorage', {
  params: [
    { id: 'id', as: 'string' }
  ],
  impl: ({},id) => jb.utils.sessionStorage(id)
})

jb.component('action.setSessionStorage', {
  params: [
    { id: 'id', as: 'string' },
    { id: 'value', dynamic: true },
  ],
  impl: ({},id,value) => jb.utils.sessionStorage(id,value())
})

jb.component('waitFor',{
  params: [
    {id: 'check', dynamic: true},
    {id: 'interval', as: 'number', defaultValue: 14},
    {id: 'timeout', as: 'number', defaultValue: 5000},
  ],
  impl: (ctx,check,interval,timeout) => {
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

jb.component('addComponent', {
  description: 'add a component or data resource',
  type: 'action',
  params: [
    {id: 'id', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'type', options:'watchableData,passiveData,comp', mandatory: true },
  ],
  impl: (ctx,id,value,type) => jb.component(id(), type == 'comp' ? value() : {[type]: value() } )
})

jb.component('loadLibs', {
  description: 'load a list of libraries into current jbm',
  type: 'action',
  params: [
    {id: 'libs', as: 'array', mandatory: true},
  ],
  impl: ({},libs) => 
    jb_dynamicLoad(libs, Object.assign(jb, { loadFromDist: true}))
})

jb.component('loadAppFiles', {
  description: 'load a list of app files into current jbm',
  type: 'action',
  params: [
    {id: 'jsFiles', as: 'array', mandatory: true},
  ],
  impl: ({},jsFiles) => 
    jb_loadProject({ uri: jb.uri, baseUrl: jb.baseUrl, libs: '', jsFiles })
})

// widely used in system code
var { Var,remark,not,and,or,contains,writeValue,obj,prop,log,pipeline,filter,firstSucceeding,runActions,list,waitFor } = jb.macro;

jb.callbag = {
      fromIter: iter => (start, sink) => {
          if (start !== 0) return
          const iterator =
              typeof Symbol !== 'undefined' && iter[Symbol.iterator]
              ? iter[Symbol.iterator]()
              : iter
          let inloop = false
          let got1 = false
          let res
          function loop() {
              inloop = true
              while (got1) {
                  got1 = false
                  res = iterator.next()
                  if (res.done) sink(2)
                  else sink(1, res.value)
              }
              inloop = false
          }
          sink(0, function fromIter(t, d) {
              if (t === 1) {
                  got1 = true
                  if (!inloop && !(res && res.done)) loop()
              }
          })
      },
      pipe(..._cbs) {
        const cbs = _cbs.filter(x=>x)
        if (!cbs[0]) return
        let res = cbs[0]
        for (let i = 1, n = cbs.length; i < n; i++) {
          const newRes = cbs[i](res)
          if (!newRes) debugger
          newRes.ctx = cbs[i].ctx
          Object.defineProperty(newRes, 'name',{value: 'register ' + cbs[i].name})

          res = newRes
        }
        return res
      },
      Do: f => source => (start, sink) => {
          if (start !== 0) return
          source(0, function Do(t, d) {
              if (t == 1) f(d)
              sink(t, d)
          })
      },
      filter: condition => source => (start, sink) => {
          if (start !== 0) return
          let talkback
          source(0, function filter(t, d) {
            if (t === 0) {
              talkback = d
              sink(t, d)
            } else if (t === 1) {
              if (condition(d)) sink(t, d)
              else talkback(1)
            }
            else sink(t, d)
          })
      },
      map: f => source => (start, sink) => {
          if (start !== 0) return
          source(0, function map(t, d) {
              sink(t, t === 1 ? f(d) : d)
          })
      },
      throwError: (condition,err) => source => (start, sink) => {
        let talkback
        if (start !== 0) return
        source(0, function throwError(t, d) {
          if (t === 0) talkback = d
          if (t == 1 && condition(d)) {
            talkback && talkback(2)
            sink(2,err)
          } else {
            sink(t, d)
          }
        })
      },
      distinctUntilChanged: compare => source => (start, sink) => {
          compare = compare || ((prev, cur) => prev === cur)
          if (start !== 0) return
          let inited = false, prev, talkback
          source(0, function distinctUntilChanged(t,d) {
              if (t === 0) {
                talkback = d
                sink(t, d)
              } else if (t == 1) {
                if (inited && compare(prev, d)) {
                    talkback(1)
                    return
                }
                inited = true
                prev = d
                sink(1, d)
              } else {
                  sink(t, d)
                  return
              }
          })
      },  
      takeUntil(notifier) {
          if (jb.utils.isPromise(notifier))
              notifier = jb.callbag.fromPromise(notifier)
          const UNIQUE = {}
          return source => (start, sink) => {
              if (start !== 0) return
              let sourceTalkback, notifierTalkback, inited = false, done = UNIQUE
  
              source(0, function takeUntil(t, d) {
                  if (t === 0) {
                      sourceTalkback = d
  
                      notifier(0, function takeUntilNotifier(t, d) {
                          if (t === 0) {
                              notifierTalkback = d
                              notifierTalkback(1)
                              return
                          }
                          if (t === 1) {
                              done = void 0
                              notifierTalkback(2)
                              sourceTalkback(2)
                              if (inited) sink(2)
                              return
                          }
                          if (t === 2) {
                              //notifierTalkback = null
                              done = d
                              if (d != null) {
                                  sourceTalkback(2)
                                  if (inited) sink(t, d)
                              }
                          }
                      })
                      inited = true
  
                      sink(0, function takeUntilSink(t, d) {
                          if (done !== UNIQUE) return
                          if (t === 2 && notifierTalkback) notifierTalkback(2)
                          sourceTalkback(t, d)
                      })
  
                      if (done !== UNIQUE) sink(2, done)
                      return
                  }
                  if (t === 2) notifierTalkback(2)
                  if (done === UNIQUE) sink(t, d)
              })
          }
      },
      concatMap(_makeSource,combineResults) {
        const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
        if (!combineResults) combineResults = (input, inner) => inner
        return source => (start, sink) => {
            if (start !== 0) return
            let queue = [], activeCb, sourceEnded, allEnded, sourceTalkback, activecbTalkBack
            source(0, function concatMap(t,d) {
              if (t == 0)
                sourceTalkback = d
              else if (t == 1)
                queue.push(d)
              else if (t ==2)
                sourceEnded = true
              tick()
            })
            sink(0, function concatMap(t,d) {
              if (t == 1) {
                activecbTalkBack && activecbTalkBack(1)
                sourceTalkback && sourceTalkback(1)
              } else if (t == 2) {
                allEnded = true
                queue = []
                sourceTalkback && sourceTalkback(2)
              }
            })
            
            function tick() {
              if (allEnded) return
              if (!activeCb && queue.length) {
                const input = queue.shift()
                activeCb = makeSource(input)
                activeCb(0, function concatMap(t,d) {
                  if (t == 0) {
                    activecbTalkBack = d
                    activecbTalkBack && activecbTalkBack(1)
                  } else if (t == 1) {
                    sink(1, combineResults(input,d))
                    activecbTalkBack && activecbTalkBack(1)
                  } else if (t == 2 && d) {
                    allEnded = true
                    queue = []
                    sink(2,d)
                    sourceTalkback && sourceTalkback(2)
                  } else if (t == 2) {
                    activecbTalkBack = activeCb = null
                    tick()
                  }
                })
              }
              if (sourceEnded && !activeCb && !queue.length) {
                allEnded = true
                sink(2)
              }
            }
        }
      },
      concatMap2(_makeSource,combineResults) {
        const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
        return source => (start, sink) => {
            if (start !== 0) return
            let queue = []
            let innerTalkback, sourceTalkback, sourceEnded
            if (!combineResults) combineResults = (input, inner) => inner

            const concatMapSink= input => function concatMap(t, d) {
              if (t === 0) {
                innerTalkback = d
                innerTalkback(1)
              } else if (t === 1) {
                sink(1, combineResults(input,d))
                innerTalkback(1)
              } else if (t === 2) {
                innerTalkback = null
                if (queue.length === 0) {
                  stopOrContinue(d)
                  return
                }
                const input = queue.shift()
                const src = makeSource(input)
                src(0, concatMapSink(input))
              }
            }

            source(0, function concatMap(t, d) {
              if (t === 0) {
                sourceTalkback = d
                sink(0, wrappedSink)
                return
              } else if (t === 1) {
                if (innerTalkback) 
                  queue.push(d) 
                else {
                  const src = makeSource(d)
                  src(0, concatMapSink(d))
                  src(1)
                }
              } else if (t === 2) {
                sourceEnded = true
                stopOrContinue(d)
              }
            })

            function wrappedSink(t, d) {
              if (t === 2 && innerTalkback) innerTalkback(2, d)
              sourceTalkback(t, d)
            }
        
            function stopOrContinue(d) {
              if (d != undefined) {
                queue = []
                innerTalkback = innerTalkback = null
                sink(2, d)
                return
              }
              if (sourceEnded && !innerTalkback && queue.length == 0) {
                sink(2, d)
                return
              }
              innerTalkback && innerTalkback(1)
            }
          }
      },
      flatMap: (_makeSource, combineResults) => source => (start, sink) => {
          if (start !== 0) return
          const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
          if (!combineResults) combineResults = (input, inner) => inner
  
          let index = 0
          const talkbacks = {}
          let sourceEnded = false
          let inputSourceTalkback = null

          source(0, function flatMap(t, d) {
            if (t === 0) {
                inputSourceTalkback = d
                sink(0, pullHandle)
            }
            if (t === 1) {
                makeSource(d)(0, makeSink(index++, d))
            }
            if (t === 2) {
                sourceEnded = true
                stopOrContinue(d)
            }
          })

          function makeSink(i, input) { 
            return (t, d) => {
              if (t === 0) {talkbacks[i] = d; talkbacks[i](1)}
              if (t === 1)
                sink(1, d == null ? null : combineResults(input, d))
              if (t === 2) {
                  delete talkbacks[i]
                  stopOrContinue(d)
              }
          }}

          function stopOrContinue(d) {
            if (sourceEnded && Object.keys(talkbacks).length === 0) 
              sink(2, d)
            else 
              !sourceEnded && inputSourceTalkback && inputSourceTalkback(1)
          }

          function pullHandle(t, d) {
            const currTalkback = Object.values(talkbacks).pop()
            if (t === 1) {
              currTalkback && currTalkback(1)
              if (!sourceEnded) inputSourceTalkback(1)
            }
            if (t === 2) {
              stopOrContinue(d)
            }
          }
      },
      merge(..._sources) {
          const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
          return function merge(start, sink) {
            if (start !== 0) return
            const n = sources.length
            const sourceTalkbacks = new Array(n)
            let startCount = 0
            let endCount = 0
            let ended = false
            const talkback = (t, d) => {
              if (t === 2) ended = true
              for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
            }
            for (let i = 0; i < n; i++) {
              if (ended) return
              sources[i](0, (t, d) => {
                if (t === 0) {
                  sourceTalkbacks[i] = d
                  sink(0, talkback) // if (++startCount === 1) 
                } else if (t === 2 && d) {
                  ended = true
                  for (let j = 0; j < n; j++) if (j !== i && sourceTalkbacks[j]) sourceTalkbacks[j](2)
                  sink(2, d)
                } else if (t === 2) {
                  sourceTalkbacks[i] = void 0
                  if (++endCount === n) sink(2)
                } else sink(t, d)
              })
            }
          }
      },
      race(..._sources) { // take only the first result including errors and complete
        const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
        return function race(start, sink) {
          if (start !== 0) return
          const n = sources.length
          const sourceTalkbacks = new Array(n)
          let endCount = 0
          let ended = false
          const talkback = (t, d) => {
            if (t === 2) ended = true
            for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
          }
          for (let i = 0; i < n; i++) {
            if (ended) return
            sources[i](0, function race(t, d) {
              if (t === 0) {
                sourceTalkbacks[i] = d
                sink(0, talkback)
              } else {
                ended = true
                for (let j = 0; j < n; j++) 
                  if (j !== i && sourceTalkbacks[j]) sourceTalkbacks[j](2)
                sink(1,d)
                sink(2)
              }
            })
          }
      }},
      fromEvent: (event, elem, options) => (start, sink) => {
          if (!elem) return
          if (start !== 0) return
          let disposed = false
          const handler = ev => sink(1, ev)
        
          sink(0, function fromEvent(t, d) {
            if (t !== 2) {
              return
            }
            disposed = true
            if (elem.removeEventListener) elem.removeEventListener(event, handler, options)
            else if (elem.removeListener) elem.removeListener(event, handler, options)
            else throw new Error('cannot remove listener from elem. No method found.')
          })
        
          if (disposed) return
        
          if (elem.addEventListener) elem.addEventListener(event, handler, options)
          else if (elem.addListener) elem.addListener(event, handler, options)
          else throw new Error('cannot add listener to elem. No method found.')
      },
      fromPromise: promise => (start, sink) => {
          if (start !== 0) return
          let ended = false
          const onfulfilled = val => {
            if (ended) return
            sink(1, val)
            if (ended) return
            sink(2)
          }
          const onrejected = (err = new Error()) => {
            if (ended) return
            sink(2, err)
          }
          Promise.resolve(promise).then(onfulfilled, onrejected)
          sink(0, function fromPromise(t, d) {
            if (t === 2) ended = true
          })
      },
      subject() {
          let sinks = []
          function subj(t, d) {
              if (t === 0) {
                  const sink = d
                  sinks.push(sink)
                  sink(0, function subject(t,d) {
                      if (t === 2) {
                          const i = sinks.indexOf(sink)
                          if (i > -1) sinks.splice(i, 1)
                      }
                  })
              } else {
                      const zinkz = sinks.slice(0)
                      for (let i = 0, n = zinkz.length, sink; i < n; i++) {
                          sink = zinkz[i]
                          if (sinks.indexOf(sink) > -1) sink(t, d)
                  }
              }
          }
          subj.next = data => subj(1,data)
          subj.complete = () => subj(2)
          subj.error = err => subj(2,err)
          subj.sinks = sinks
          return subj
      },
      replay: keep => source => {
        keep = keep || 0
        let store = [], sinks = [], talkback, done = false
      
        const sliceNum = keep > 0 ? -1 * keep : 0;
      
        source(0, function replay(t, d) {
          if (t == 0) {
            talkback = d
            return
          }
          if (t == 1) {
            store.push(d)
            store = store.slice(sliceNum)
            sinks.forEach(sink => sink(1, d))
          }
          if (t == 2) {
            done = true
            sinks.forEach(sink => sink(2))
            sinks = []
          }
        })

        replay.sinks = sinks
        return replay
      
        function replay(start, sink) {
          if (start !== 0) return
          sinks.push(sink)
          sink(0, function replay(t, d) {
            if (t == 0) return
            if (t == 1) {
              talkback(1)
              return
            }
            if (t == 2)
              sinks = sinks.filter(s => s !== sink)
          })
      
          store.forEach(entry => sink(1, entry))
      
          if (done) sink(2)
        }
      },
      catchError: fn => source => (start, sink) => {
          if (start !== 0) return
          let done
          source(0, function catchError(t, d) {
            if (done) return
            if (t === 2 && d !== undefined) { done= true; sink(1, fn(d)); sink(2) } 
            else sink(t, d) 
          }
        )
      },
      create: prod => (start, sink) => {
          if (start !== 0) return
          if (typeof prod !== 'function') {
            sink(0, () => {})
            sink(2)
            return
          }
          let end = false
          let clean
          sink(0, (t,d) => {
            if (!end) {
              end = t === 2
              if (end && typeof clean === 'function') clean()
            }
          })
          if (end) return
          clean = prod((v) => {
              if (!end) sink(1, v)
            }, (e) => {
              if (!end && e !== undefined) {
                end = true
                sink(2, e)
              }
            }, () => {
              if (!end) {
                end = true
                sink(2)
              }
          })
      },
      // swallow events. When new event arrives wait for a duration to spit it, if another event arrived when waiting, the original event is 'deleted'
      // 'immediate' means that the first event is spitted immediately
      debounceTime: (duration,immediate = true) => source => (start, sink) => {
          if (start !== 0) return
          let timeout
          source(0, function debounceTime(t, d) {
            let immediateEventSent = false
            if (!timeout && immediate) { sink(t,d); immediateEventSent = true }
            if (timeout) clearTimeout(timeout)
            if (t === 1) timeout = setTimeout(() => { 
              timeout = null; 
              if (!immediateEventSent) sink(1, d)
            }, typeof duration == 'function' ? duration() : duration)
            else sink(t, d)
          })
      },
      throttleTime: (duration,emitLast) => source => (start, sink) => {
        if (start !== 0) return
        let talkbackToSource, sourceTerminated = false, sinkTerminated = false, last, timeout
        sink(0, function throttle(t, d) {
          if (t === 2) sinkTerminated = true
        })
        source(0, function throttle(t, d) {
          if (t === 0) {
            talkbackToSource = d
            talkbackToSource(1)
          } else if (sinkTerminated) {
            return
          } else if (t === 1) {
            if (!timeout) {
              sink(t, d)
              last = null
              timeout = setTimeout(() => {
                timeout = null
                if (!sourceTerminated) talkbackToSource(1)
                if ((emitLast === undefined || emitLast) && last != null)
                  sink(t,d)
              }, typeof duration == 'function' ? duration() : duration)
            } else {
              last = d
            }
          } else if (t === 2) {
            sourceTerminated = true
            sink(t, d)
          }
        })
      },      
      take: max => source => (start, sink) => {
          if (start !== 0) return
          let taken = 0, sourceTalkback, end
          function talkback(t, d) {
            if (t === 2) end = true
            sourceTalkback(t, d)
          }
          source(0, function take(t, d) {
            if (t === 0) {
              sourceTalkback = d
              sink(0, talkback)
            } else if (t === 1) {
              if (taken < max) {
                taken++
                sink(t, d)
                if (taken === max && !end) {
                  end = true
                  sourceTalkback(2)
                  sink(2)
                }
              }
            } else {
              sink(t, d)
            }
          })
      },
      takeWhile: (predicate,passtLastEvent) => source => (start, sink) => {
          if (start !== 0) return
          let talkback
          source(0, function takeWhile(t,d) {
            if (t === 0) talkback = d
            if (t === 1 && !predicate(d)) {
              if (passtLastEvent) sink(t,d)
              talkback(2)
              sink(2)
            } else {
              sink(t, d)
            }
          })
      },
      last: () => source => (start, sink) => {
          if (start !== 0) return
          let talkback, lastVal, matched = false
          source(0, function last(t, d) {
            if (t === 0) {
              talkback = d
              sink(t, d)
            } else if (t === 1) {
              lastVal = d
              matched = true
              talkback(1)
            } else if (t === 2) {
              if (matched) sink(1, lastVal)
              sink(2)
            }
          })
      },
      toArray: () => source => (start, sink) => {
        if (start !== 0) return
        let talkback, res = [], ended
        source(0, function toArray(t, d) {
          if (t === 0) {
            talkback = d
            sink(t, (t,d) => {
              if (t == 2) end()
              talkback(t,d)
            })
          } else if (t === 1) {
            res.push(d)
            talkback && talkback(1)
          } else if (t === 2) {
            if (!d) end()
            sink(2,d)
          }
        })
        function end() {
          if (!ended && res.length) sink(1, res)
          ended = true
        }
      },      
      forEach: operation => sinkSrc => {
        let talkback
        sinkSrc(0, function forEach(t, d) {
            if (t === 0) talkback = d
            if (t === 1) operation(d)
            if (t === 1 || t === 0) talkback(1)
        })
      },
      subscribe: (listener = {}) => sinkSrc => {
          if (typeof listener === "function") listener = { next: listener }
          let { next, error, complete } = listener
          let talkback, done
          sinkSrc(0, function subscribe(t, d) {
            if (t === 0) talkback = d
            if (t === 1 && next) next(d)
            if (t === 1 || t === 0) talkback(1)  // Pull
            if (t === 2) done = true
            if (t === 2 && !d && complete) complete()
            if (t === 2 && !!d && error) error( d )
            if (t === 2 && listener.finally) listener.finally( d )
          })
          return {
            dispose: () => talkback && !done && talkback(2),
            isDone: () => done,
            isActive: () => talkback && !done
          }
      },
      toPromise: sinkSrc => {
          return new Promise((resolve, reject) => {
            jb.callbag.subscribe({
              next: resolve,
              error: reject,
              complete: () => {
                const err = new Error('No elements in sequence.')
                err.code = 'NO_ELEMENTS'
                reject(err)
              },
            })(jb.callbag.last(sinkSrc))
          })
      },
      toPromiseArray: sinkSrc => {
          const res = []
          let talkback
          return new Promise((resolve, reject) => {
                  sinkSrc(0, function toPromiseArray(t, d) {
                      if (t === 0) talkback = d
                      if (t === 1) res.push(d)
                      if (t === 1 || t === 0) talkback(1)  // Pull
                      if (t === 2 && !d) resolve(res)
                      if (t === 2 && !!d) reject( d )
              })
          })
      },
      mapPromise: promiseF => source => jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d))))(source),
      doPromise: promiseF => source =>  jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d)).then(()=>d)))(source),
      interval: period => (start, sink) => {
        if (start !== 0) return
        let i = 0
        const id = setInterval(function set_interval() {
          sink(1, i++)
        }, period)
        sink(0, t => t === 2 && clearInterval(id))
      },
      startWith: (...xs) => source => (start, sink) => {
          if (start !== 0) return
          let disposed = false
          let inputTalkback
          let trackPull = false
          let lastPull
        
          sink(0, function startWith(t, d) {
            if (trackPull && t === 1) {
              lastPull = [1, d]
            }
        
            if (t === 2) {
              disposed = true
              xs.length = 0
            }
        
            if (!inputTalkback) return
            inputTalkback(t, d)
          })
        
          while (xs.length !== 0) {
            if (xs.length === 1) {
              trackPull = true
            }
            sink(1, xs.shift())
          }
        
          if (disposed) return
        
          source(0, function startWith(t, d) {
            if (t === 0) {
              inputTalkback = d
              trackPull = false
        
              if (lastPull) {
                inputTalkback(...lastPull)
                lastPull = null
              }
              return
            }
            sink(t, d)
          })
      },
      delay: duration => source => (start, sink) => {
          if (start !== 0) return
          let waiting = 0, end, endD, endSent
          source(0, function delay(t,d) {
              if (t == 1 && d && !end) {
                let id = setTimeout(()=> {
                  waiting--
                  clearTimeout(id)
                  sink(1,d)
                  if (end && !endSent) {
                    endSent = true
                    sink(2,endD)
                  }
                }, typeof duration == 'function' ? duration() : duration)
                waiting++
              } else if (t == 2) {
                end = true
                endD = d
                if (!waiting) sink (t,d)
              } else {
                sink(t,d)
              }
          })
      },
      skip: max => source => (start, sink) => {
          if (start !== 0) return
          let skipped = 0, talkback
          source(0, function skip(t, d) {
            if (t === 0) talkback = d
            if (t === 1 && skipped < max) {
                skipped++
                talkback(1)
                return
            }
            sink(t, d)
          })
      },
      sniffer: (source, snifferSubject) => (start, sink) => {
        if (start !== 0) return
        let talkback
        const talkbackWrapper = (t,d) => { report('talkback',t,d); talkback(t,d) }
        const sniffer = (t,d) => {
          report('out',t,d)
          if (t == 0) {
            talkback = d
            Object.defineProperty(talkbackWrapper, 'name', { value: talkback.name + '-sniffer' })
            sink(0, talkbackWrapper)
            return
          }
          sink(t,d)
        }
        sniffer.ctx = source.ctx    
        Object.defineProperty(sniffer, 'name', { value: source.name + '-sniffer' })
        sniffer.dispose = () => { console.log('dispose', sink,talkback); debugger }

        source(0,sniffer)
        
        function report(dir,t,d) {
          const now = new Date()
          const time = `${now.getSeconds()}:${now.getMilliseconds()}`
          snifferSubject.next({dir, t, d, time})
          if (t == 2)
            snifferSubject.complete && snifferSubject.complete(d)
        }
      },
      timeoutLimit: (timeout,err) => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        let timeoutId = setTimeout(()=> {
          talkback && talkback(2)
          sink(2, typeof err == 'function' ? err() : err || 'timeout')
        }, typeof timeout == 'function' ? timeout() : timeout)

        source(0, function timeoutLimit(t, d) {
          if (t === 2) clearTimeout(timeoutId)
          if (t === 0) talkback = d
          sink(t, d)
        })        
      },
      fromCallBag: source => source,
      fromAny: (source, name, options) => {
          const f = source && 'from' + (jb.utils.isPromise(source) ? 'Promise'
              : source.addEventListener ? 'Event'
              : typeof source[Symbol.iterator] === 'function' ? 'Iter'
              : '')
          if (jb.callbag[f]) 
              return jb.callbag[f](source, name, options)
          else if (jb.callbag.isCallbag(source))
              return source
          else
              return jb.callbag.fromIter([source])
      },
      isSink: cb => typeof cb == 'function' && cb.toString().match(/sinkSrc/),
      isCallbag: cb => typeof cb == 'function' && cb.toString().split('=>')[0].split('{')[0].replace(/\s/g,'').match(/start,sink|t,d/),

      injectSniffers(cbs,ctx) {
        return cbs
        const _jb = ctx.frame().jb
        if (!_jb) return cbs
        return cbs.reduce((acc,cb) => [...acc,cb, ...injectSniffer(cb) ] ,[])

        function injectSniffer(cb) {
          if (!cb.ctx || cb.sniffer || jb.callbag.isSink(cb)) return []
          _jb.cbLogByPath =  _jb.cbLogByPath || {}
          const log = _jb.cbLogByPath[cb.ctx.path] = { callbagLog: true, result: [] }
          const listener = {
            next(r) { log.result.push(r) },
            complete() { log.complete = true }
          }
          const res = source => _jb.callbag.sniffer(source, listener)
          res.sniffer = true
          res.ctx = cb.ctx
          Object.defineProperty(res, 'name', { value: 'sniffer' })
          return [res]
        }
      },  
      log: name => jb.callbag.Do(x=>console.log(name,x)),
      jbLog: (name,...params) => jb.callbag.Do(data => jb.log(name,{data,...params})),
}
;

var { If, call, rx,sink,source } = jb.ns('rx,sink,source')
// ************ sources

jb.component('source.data', {
  type: 'rx',
  params: [
    {id: 'data', mandatory: true },
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

jb.component('source.watchableData', {
  type: 'rx',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref' },
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x=>ctx.dataObj(x))(jb.watchable.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

jb.component('source.callbag', {
  type: 'rx',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'},
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})
  
jb.component('source.event', {
  type: 'rx',
  macroByValue: true,
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document },
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' },
  ],
  impl: (ctx,event,elem,options) => elem && jb.callbag.map(ev=>ctx.setVar('sourceEvent',ev).dataObj(ev))(jb.callbag.fromEvent(event,elem,options))
})

jb.component('source.any', {
  type: 'rx',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'},
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

jb.component('source.promise', {
  type: 'rx',
  params: [
    {id: 'promise', mandatory: true},
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

jb.component('source.interval', {
  type: 'rx',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

jb.component('rx.pipe', {
  type: 'rx,data,action',
  category: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: (ctx,elems) => jb.callbag.pipe(...jb.callbag.injectSniffers(elems(ctx).filter(x=>x),ctx))
})

jb.component('rx.merge', {
    type: 'rx',
    category: 'source',
    description: 'merge callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [] },
    ],
    impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

// ******** operators *****

jb.component('rx.innerPipe', {
  type: 'rx',
  category: 'operator',
  description: 'inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []},
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

jb.component('rx.startWith', {
    type: 'rx',
    category: 'operator',
    description: 'startWith callbags sources (or any)',
    params: [
      {id: 'sources', type: 'rx[]', as: 'array' },
    ],
    impl: (ctx,sources) => jb.callbag.startWith(...sources)
})

jb.component('rx.var', {
  type: 'rx',
  category: 'operator',
  description: 'define a variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true},
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
    if (start != 0) return 
    return source(0, function Var(t, d) {
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: value(d)}} : d)
    })
  }, null)
})

jb.component('rx.reduce', {
  type: 'rx',
  category: 'operator',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc'},
    {id: 'initialValue', dynamic: true, description: 'receives first value as input', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated value use %$acc%,%% %$prev%',  mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor'},
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, prev, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, prev, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
        prev = d.data
      } else {
        sink(t, d)
      }
    })
  }
})

jb.component('rx.count', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: rx.reduce({
    varName: '%$varName%',
    initialValue: 0,
    value: (ctx,{},{varName}) => ctx.vars[varName]+1
  })
})

jb.component('rx.join', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: rx.reduce({
    varName: '%$varName%',
    initialValue: '%%',
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

jb.component('rx.max', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%' },
  ],
  impl: rx.reduce({
    varName: '%$varName%', initialValue: Number.NEGATIVE_INFINITY, value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})

jb.component('rx.do', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

jb.component('rx.doPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

jb.component('rx.map', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ({data: func(ctx2), vars: ctx2.vars || {}}),ctx))
})

jb.component('rx.mapPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ({vars: ctx2.vars || {}, data})))
})

jb.component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true},
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.utils.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

jb.component('rx.flatMap', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'source', type: 'rx', category: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'},
  ],
  impl: (ctx,sourceGenerator) => source => (start, sink) => {
    if (start !== 0) return
    let sourceTalkback, innerSources = [], sourceEnded

    source(0, function flatMap(t, d) {
      if (t === 0) 
        sourceTalkback = d
      if (t === 1 && d != null)
        createInnerSrc(d)
      if (t === 2) {
          sourceEnded = true
          stopOrContinue(d)
      }
    })

    sink(0, function flatMap(t,d) {
      if (t == 1 && d == null || t == 2) {
        sourceTalkback(t,d)
        innerSources.forEach(src=>src.talkback && src.talkback(t,d))
      }
    })

    function createInnerSrc(d) {
      const newSrc = sourceGenerator(ctx.setData(d.data).setVars(d.vars))
      innerSources.push(newSrc)
      newSrc(0, function flatMap(t,d) {
        if (t == 0) newSrc.talkback = d
        if (t == 1) sink(t,d)
        if (t != 2 && newSrc.talkback) newSrc.talkback(1)
        if (t == 2) {
          innerSources.splice(innerSources.indexOf(newSrc),1)
          stopOrContinue(d)
        }
      })
    }

    function stopOrContinue(d) {
      if (sourceEnded && innerSources.length == 0)
        sink(2,d)
    }
  }
})

jb.component('rx.flatMapArrays', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'},
  ],
  impl: rx.flatMap(source.data(call('func')))
})

jb.component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines %$input% with the inner result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

jb.component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream', 
  category: 'filter',
  params: [
    {id: 'equalsFunc', dynamic: true, mandatory: true, defaultValue: ({data},{prev}) => data === prev, description: 'e.g. %% == %$prev%'},
  ],
  impl: (ctx,equalsFunc) => jb.callbag.distinctUntilChanged((prev,cur) => equalsFunc(ctx.setData(cur.data).setVar('prev',prev.data)))
  //prev && cur && prev.data == cur.data)
})

jb.component('rx.catchError', {
    type: 'rx',
    category: 'error',
    impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

jb.component('rx.timeoutLimit', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic' },
    {id: 'error', dynamic: true, defaultValue: 'timeout'},
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

jb.component('rx.throwError', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

jb.component('rx.debounceTime', {
    type: 'rx',
    description: 'waits for a cooldown period, them emits the last arrived',
    category: 'operator',
    params: [
      {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic' },
      {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true' },
    ],
    impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

jb.component('rx.throttleTime', {
  type: 'rx',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic' },
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true' },
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
})

jb.component('rx.delay', {
    type: 'rx',
    category: 'operator',
    params: [
      {id: 'time', dynamic: true, description: 'can be dynamic' },
    ],
    impl: (ctx,time) => jb.callbag.delay(time)
})

jb.component('rx.replay', {
  type: 'rx',
  description: 'stores messages and replay them for later subscription', 
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'},
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

jb.component('rx.takeUntil', {
    type: 'rx',
    description: 'closes the stream when events comes from notifier', 
    category: 'terminate',
    params: [
      {id: 'notifier', type: 'rx', description: 'can be also promise or any other' },
    ],
    impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

jb.component('rx.take', {
  type: 'rx',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count())
})

jb.component('rx.takeWhile', {
  type: 'rx',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true},
    {id: 'passtLastEvent', as: 'boolean'}
  ],
  impl: (ctx,whileCondition,passtLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passtLastEvent)
})

jb.component('rx.toArray', {
  type: 'rx',
  category: 'operator',
  description: 'wait for all and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
})

jb.component('rx.last', {
    type: 'rx',
    category: 'filter',
    impl: () => jb.callbag.last()
})

jb.component('rx.skip', {
    type: 'rx',
    category: 'filter',
    params: [
        {id: 'count', as: 'number', dynamic: true},
    ],    
    impl: (ctx,count) => jb.callbag.skip(count())
})

jb.component('rx.subscribe', {
    type: 'rx',
    description: 'forEach action for all items',
    category: 'sink',
    params: [
      {id: 'next', type: 'action', dynamic: true, mandatory: true},
      {id: 'error', type: 'action', dynamic: true},
      {id: 'complete', type: 'action', dynamic: true},
    ],
    impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

jb.component('sink.action', {
  type: 'rx',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

jb.component('sink.data', {
  type: 'rx',
  params: [
    {id: 'data', as: 'ref', dynamic: true, mandatory: true},
  ],
  impl: sink.action(writeValue('%$data()%','%%'))
})

jb.component('rx.log', {
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'},
    {id: 'extra', as: 'single', dynamic: true},
  ],
  impl: rx.do((ctx,vars,{name,extra}) => jb.log(name,{data: ctx.data,vars,...extra(ctx), ctx: ctx.cmpCtx}))
  //(ctx,name,extra) => ctx.run({$: 'rx.do', action: _ctx => jb.log(name,{data: _ctx.data,vars: _ctx.vars,ctx, ...extra(_ctx)}) })
})

jb.component('rx.clog', {
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'},
  ],
  impl: rx.do((x,{},{name}) => console.log(name,x))
})

jb.component('rx.sniffer', {
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'},
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
})

// ********** subject 
jb.component('rx.subject', {
    type: 'data',
    description: 'callbag "variable" that you can write or listen to', 
    category: 'variable',
    params: [
      {id: 'replay', as: 'boolean', description: 'keep pushed items for late subscription'},
      {id: 'itemsToKeep', as: 'number', description: 'relevant for replay, empty for unlimited'},
    ],
    impl: (ctx,replay,itemsToKeep) => {
      const trigger = jb.callbag.subject()
      const source = replay ? jb.callbag.replay(itemsToKeep)(trigger): trigger
      source.ctx = trigger.ctx = ctx
      return { trigger, source } 
    }
})

jb.component('sink.subjectNext', {
  type: 'rx',
  params: [
      {id: 'subject', mandatory: true },
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

jb.component('source.subject', {
    type: 'rx',
    params: [
        {id: 'subject', mandatory: true },
      ],
    impl: (ctx,subj) => subj.source
})

jb.component('action.subjectNext', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'data', dynamic: true, defaultValue: '%%' },
    ],
    impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
})

jb.component('action.subjectComplete', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
    ],
    impl: (ctx,subject) => subject.trigger.complete()
})

jb.component('action.subjectError', {
    type: 'action',
    params: [
        {id: 'subject', mandatory: true },
        {id: 'error', dynamic: true, mandatory: true },
    ],
    impl: (ctx,subject,error) => subject.trigger.error(error())
})
;

// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

jb.extension('watchable', {
  initExtension() {
    jb.watchable.jbId = Symbol("jbId") // used in constructor
    jb.watchable.resourcesRef.id = 'resources' // for loader: jb.watchable.resourcesRef()
    jb.db.watchableHandlers.push(new jb.watchable.WatchableValueByRef(jb.watchable.resourcesRef))
    jb.db.isWatchableFunc[0] = jb.watchable.isWatchable // for loader: jb.db.isWatchable(), jb.watchable.isWatchable()
    return {isProxy: Symbol.for("isProxy"), originalVal: Symbol.for("originalVal"), targetVal: Symbol.for("targetVal") }
  },
  WatchableValueByRef: class WatchableValueByRef {
    constructor(resources) {
      this.resources = resources
      this.objToPath = new Map()
      this.idCounter = 1
      this.opCounter = 1
      this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])]
      this.resourceChange = jb.callbag.subject()
      this.observables = []
      this.primitiveArraysDeltas = {}

      const resourcesObj = resources()
      resourcesObj[jb.watchable.jbId] = this.idCounter++
      this.objToPath.set(resourcesObj[jb.watchable.jbId],[])
      this.propagateResourceChangeToObservables()
    }
    doOp(ref,opOnRef,srcCtx) {
      try {
        const opVal = opOnRef.$merge || opOnRef.$push || opOnRef.$splice || opOnRef.$set
        if (!this.isRef(ref))
          ref = this.asRef(ref);

        const path = this.removeLinksFromPath(this.pathOfRef(ref)), op = {}, oldVal = this.valOfPath(path);
        if (!path || ref.$jb_val) return;
        if (opOnRef.$set !== undefined && opOnRef.$set === oldVal) return;
        if (opOnRef.$push) opOnRef.$push = jb.asArray(opOnRef.$push)
        this.addJbId(path) // hash ancestors with jbId because the objects will be re-generated by redux
        jb.path(op,path,opOnRef) // create op as nested object
        const insertedIndex = jb.path(opOnRef.$splice,[0,2]) && jb.path(opOnRef.$splice,[0,0]) || opOnRef.$push && opVal.length
        const insertedPath = insertedIndex != null && path.concat(insertedIndex)
        const opEvent = {op: opOnRef, path, insertedPath, ref, srcCtx, oldVal, opVal, timeStamp: new Date().getTime(), opCounter: this.opCounter++}
        this.resources(jb.immutable.update(this.resources(),op),opEvent)
        const newVal = (opVal != null && opVal[jb.watchable.isProxy]) ? opVal : this.valOfPath(path);
        if (opOnRef.$push) {
          opOnRef.$push.forEach((toAdd,i)=>
            this.addObjToMap(toAdd,[...path,oldVal.length+i]))
          newVal[jb.watchable.jbId] = oldVal[jb.watchable.jbId]
          //opEvent.path.push(oldVal.length)
          opEvent.ref = this.refOfPath(opEvent.path)
        } else if (opOnRef.$set === null && typeof oldVal === 'object') { // delete object should return the path that was deleted
          this.removeObjFromMap(oldVal)
          this.addObjToMap(newVal,path)
          opEvent.ref.$jb_path = () => path
        } else if (opOnRef.$splice) {
          opOnRef.$splice.forEach(ar=> {
            this.fixSplicedPaths(path,ar)
            oldVal.slice(ar[0],ar[0]+ar[1]).forEach(toRemove=>this.removeObjFromMap(toRemove))
            jb.asArray(ar[2]).forEach(toAdd=>this.addObjToMap(toAdd,path.concat(newVal.indexOf(toAdd))))
          })
        } else {
            this.removeObjFromMap(oldVal)
            this.addObjToMap(newVal,path)
        }
        if (opOnRef.$splice) {
          this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] = this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] || []
          this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]].push(opOnRef.$splice)
        }
        opEvent.newVal = newVal;
        jb.log('watchable notify doOp',{opEvent,ref,opOnRef,srcCtx})
        if (this.transactionEventsLog)
          this.transactionEventsLog.push(opEvent)
        else
          this.resourceChange.next(opEvent)
        return opEvent
      } catch(e) {
        jb.logException(e,'doOp',{srcCtx,ref,opOnRef,srcCtx})
      }
    }
    makeWatchable(resName) {
      const resource = this.resources()[resName]
      if (!this.objToPath.has(resource))
        this.addObjToMap(resource,[resName])
    }
    addJbId(path) {
      for(let i=0;i<path.length;i++) {
        const innerPath = path.slice(0,i+1)
        const val = this.valOfPath(innerPath,true)
        if (val && typeof val === 'object' && !val[jb.watchable.jbId]) {
            val[jb.watchable.jbId] = this.idCounter++
            this.addObjToMap(val,innerPath)
        }
      }
    }
    addObjToMap(top,path) {
      if (!top || top[jb.watchable.isProxy] || top[jb.db.passiveSym] || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
      if (top[jb.watchable.jbId]) {
          this.objToPath.set(top[jb.watchable.jbId],path)
          this.objToPath.delete(top)
      } else {
          this.objToPath.set(top,path)
      }
      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0)
          .forEach(key => this.addObjToMap(top[key],[...path,key]))
    }
    removeObjFromMap(top,isInner) {
      if (!top || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
      this.objToPath.delete(top)
      if (top[jb.watchable.jbId] && isInner)
          this.objToPath.delete(top[jb.watchable.jbId])
      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key],true))
    }
    fixSplicedPaths(path,spliceOp) {
      const propDepth = path.length
      Array.from(this.objToPath.keys())
        .filter(k=>startsWithPath(this.objToPath.get(k)))
  //      .filter(k=>! spliceOp.reduce((res,ar) => res || jb.asArray(ar[2]).indexOf(k) != -1, false)) // do not touch the moved elem itslef
        .forEach(k=>{
          const newPath = this.objToPath.get(k)
          newPath[propDepth] = fixIndexProp(+newPath[propDepth])
          if (newPath[propDepth] >= 0)
            this.objToPath.set(k,newPath)
        })

      function startsWithPath(toCompare) {
        if (toCompare.length <= propDepth) return
        for(let i=0;i<propDepth;i++)
          if (toCompare[i] != path[i]) return
        return true
      }
      function fixIndexProp(oldIndex) {
        return oldIndex + (oldIndex < spliceOp[0] ? 0 : jb.asArray(spliceOp[2]).length - spliceOp[1])
        //return oldIndex + spliceOp.reduce((delta,ar) => delta + (oldIndex < ar[0]) ? 0 : jb.asArray(ar[2]).length - ar[1],0)
      }
    }
    pathOfRef(ref) {
      if (ref.$jb_path)
        return ref.$jb_path()
      const path = this.isRef(ref) && (this.objToPath.get(ref.$jb_obj) || this.objToPath.get(ref.$jb_obj[jb.watchable.jbId]))
      if (path && ref.$jb_childProp !== undefined) {
          this.refreshPrimitiveArrayRef(ref)
          return [...path, ref.$jb_childProp]
      }
      return path
    }
    urlOfRef(ref) {
      const path = this.pathOfRef(ref)
      this.addJbId(path)
      const byId = [ref.$jb_obj[jb.watchable.jbId],ref.$jb_childProp].filter(x=>x != null).map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      const byPath = path.map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      return `${this.resources.id}://${byId};${byPath}`
    }
    refOfUrl(url) {
      const path = url.split(';')[0].split('~')
      return { handler: this, $jb_obj: {[jb.watchable.jbId]: +path[0] }, ...path[1] ? {$jb_childProp: path[1]} : {} }
    }
    asRef(obj, silent) {
      if (this.isRef(obj))
        return obj
      if (!obj || typeof obj !== 'object') return obj;
      const actualObj = obj[jb.watchable.isProxy] ? obj[jb.watchable.targetVal] : obj
      const path = this.objToPath.get(actualObj) || this.objToPath.get(actualObj[jb.watchable.jbId])
      if (path)
          return { $jb_obj: this.valOfPath(path), handler: this, path: function() { return this.handler.pathOfRef(this)} }
      if (!silent)
        jb.logError('asRef can not make a watchable ref of obj',{obj})
      return null;
    }
    valOfPath(path) {
      return path.reduce((o,p)=>this.noProxy(o && o[p]),this.resources())
    }
    noProxy(val) {
      return (val && val[jb.watchable.isProxy] && val[jb.watchable.originalVal]) || val
    }
    hasLinksInPath(path) {
      let val = this.resources()
      for(let i=0;i<path.length;i++) {
        if (val && val[jb.watchable.isProxy])
          return true
        val = val && val[path[i]]
      }
    }
    removeLinksFromPath(path) {
      if (!Array.isArray(path)) return
      if (!this.hasLinksInPath(path))
        return path
      return path.reduce(({val,path} ,p) => {
        const proxy = (val && val[jb.watchable.isProxy])
        const inner =  proxy ? val[jb.watchable.originalVal] : val
        const newPath = proxy ? (this.objToPath.get(inner) || this.objToPath.get(inner[jb.watchable.jbId])) : path
        return { val: inner && inner[p], path: [newPath,p].join('~') }
      }, {val: this.resources(), path: ''}).path
    }
    refOfPath(path) {
      const val = this.valOfPath(path);
      if (!val || typeof val !== 'object' && path.length > 0) {
        const parent = this.asRef(this.valOfPath(path.slice(0,-1)), true);
        if (path.length == 1)
          return {$jb_obj: this.resources(), $jb_childProp: path[0], handler: this, $jb_path: () => path }
        return this.objectProperty(parent,path.slice(-1)[0])
      }
      return this.asRef(val)
    }
    asStr(ref) { // for logs
      return this.pathOfRef(ref).join('~')
    }
    isValid(ref) {
      return this.isRef(ref) && this.pathOfRef(ref)
    }
    val(ref) {
      if (ref == null) return ref;
      if (ref.$jb_val) return ref.$jb_val();

      if (!ref.$jb_obj) return ref;
      if (ref.handler != this) {
        if (typeof ref.handler.val != 'function') debugger
        return ref.handler.val(ref)
      }
      this.refreshPrimitiveArrayRef(ref)
      const path = this.pathOfRef(ref);
      if (!path) {
        debugger
        this.pathOfRef(ref)
      }
      return this.valOfPath(path)
    }
    watchable(val) {
      return this.resources() === val || typeof val != 'number' && (this.objToPath.get(val) || (val && this.objToPath.get(val[jb.watchable.jbId])))
    }
    isRef(ref) {
      return ref && ref.$jb_obj && this.watchable(ref.$jb_obj);
    }
    objectProperty(obj,prop,ctx) {
      if (!obj)
        return jb.logError('watchable objectProperty: null obj',{obj,prop,ctx})
      if (obj && obj[prop] && this.watchable(obj[prop]) && !obj[prop][jb.watchable.isProxy])
        return this.asRef(obj[prop])
      const ref = this.asRef(obj)
      if (ref && ref.$jb_obj) {
        const ret = {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
        if (this.isPrimitiveArray(ref.$jb_obj)) {
          ret.$jb_delta_version = (this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] || []).length
          ret.$jb_childProp = +prop
        }
        return ret
      } else {
        return obj[prop]; // not reffable
      }
    }
    writeValue(ref,value,srcCtx) {
      if (!ref || !this.isRef(ref) || !this.pathOfRef(ref))
        return jb.logError('writeValue: err in ref', {srcCtx, ref, value})

      jb.log('watchable writeValue',{ref,value,ref,srcCtx})
      if (ref.$jb_val)
        return ref.$jb_val(value)
      if (this.val(ref) === value) return
      return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
    }
    createSecondaryLink(val) {
      if (val && typeof val === 'object' && !val[jb.watchable.isProxy]) {
        const ref = this.asRef(val,true);
        if (ref && ref.$jb_obj)
          return new Proxy(val, {
            get: (o,p) => (p === jb.watchable.targetVal) ? o : (p === jb.watchable.isProxy) ? true : (p === jb.watchable.originalVal ? val : (jb.val(this.asRef(val)))[p]),
            set: (o,p,v) => o[p] = v
          })
      }
      return val
    }
    splice(ref,args,srcCtx) {
      return this.doOp(ref,{$splice: args },srcCtx)
    }
    move(fromRef,toRef,srcCtx) {
      const fromPath = this.pathOfRef(fromRef), toPath = this.pathOfRef(toRef);
      const sameArray = fromPath.slice(0,-1).join('~') == toPath.slice(0,-1).join('~');
      const fromIndex = Number(fromPath.slice(-1));
      let toIndex = Number(toPath.slice(-1));
      const fromArray = this.refOfPath(fromPath.slice(0,-1)),toArray = this.refOfPath(toPath.slice(0,-1));
      if (isNaN(fromIndex) || isNaN(toIndex))
          return jb.logError('move: not array element',{srcCtx,fromRef,toRef})

      var valToMove = jb.val(fromRef);
      if (sameArray) {
          //if (fromIndex < toIndex) toIndex--; // the deletion changes the index
          const spliceParam = [[fromIndex,1],[toIndex,0,valToMove]]
          spliceParam.fromIndex = fromIndex
          spliceParam.toIndex = toIndex
          return this.doOp(fromArray,{$splice: spliceParam },srcCtx)
      }
      this.startTransaction()
      const spliceParam = [[fromIndex,1]]
      spliceParam.fromIndex = fromIndex
      spliceParam.toIndex = toIndex
      spliceParam.toArray = toArray
      this.doOp(fromArray,{$splice: spliceParam },srcCtx),
      this.doOp(toArray,{$splice: [[toIndex,0,valToMove]] },srcCtx),
      this.endTransaction()
    }
    isPrimitiveArray(arr) {
      return Array.isArray(arr) && arr.some(x=> x != null && typeof x != 'object')
    }
    refreshPrimitiveArrayRef(ref) {
      if (!this.isPrimitiveArray(ref.$jb_obj)) return
      const arrayId = ref.$jb_obj[jb.watchable.jbId]
      const deltas = this.primitiveArraysDeltas[arrayId] || []
      deltas.slice(ref.$jb_delta_version).forEach(group => {
          if (group.fromIndex != undefined && group.fromIndex === ref.$jb_childProp) { // move
            ref.$jb_childProp = group.toIndex
            if (group.toArray)
              ref.$jb_obj = group.toArray.$jb_obj
            return
          }
          group.forEach(([from,toDelete,toAdd]) => { // splice
            if (ref.$jb_childProp == -1) return
            if (ref.$jb_childProp >= from && ref.$jb_childProp < from+toDelete) {
              ref.$jb_childProp = -1
            } else if (ref.$jb_childProp >= from) {
              ref.$jb_childProp = ref.$jb_childProp - toDelete + (toAdd != null) ? 1 : 0
            }
          })
      })
      ref.$jb_delta_version = deltas.length
    }

    startTransaction() {
      this.transactionEventsLog = []
    }
    endTransaction(doNotNotify) {
      if (!doNotNotify)
        (this.transactionEventsLog || []).forEach(opEvent=>this.resourceChange.next(opEvent))
      delete this.transactionEventsLog
    }
    push(ref,value,srcCtx) {
      return this.doOp(ref,{$push: this.createSecondaryLink(value)},srcCtx)
    }
    merge(ref,value,srcCtx) {
      return this.doOp(ref,{$merge: this.createSecondaryLink(value)},srcCtx)
    }
    getOrCreateObservable({ref,srcCtx,includeChildren,cmp}) {
        const subject = jb.callbag.subject()
        const ctx = cmp && cmp.ctx || srcCtx || { path: ''}
        const key = this.pathOfRef(ref).join('~') + ' : ' + ctx.path
        //const recycleCounter = cmp && cmp.getAttribute && +(cmp.getAttribute('recycleCounter') || 0)
        const obs = { key, ref,srcCtx,includeChildren, cmp, subject, ctx }

        this.observables.push(obs)
        this.observables.sort((e1,e2) => jb.utils.comparePaths(e1.ctx.path, e2.ctx.path))
        jb.log('register watchable observable',obs)
        return subject
    }
    frame() {
      return this.resources.frame || jb.frame
    }
    propagateResourceChangeToObservables() {
      jb.utils.subscribe(this.resourceChange, e=>{
        const observablesToUpdate = this.observables.slice(0) // this.observables array may change in the notification process !!
        const changed_path = this.removeLinksFromPath(this.pathOfRef(e.ref))
        if (changed_path) observablesToUpdate.forEach(obs=> {
          if (jb.path(obs,'cmp._destroyed')) {
            if (this.observables.indexOf(obs) != -1) {
              obs.subject.complete()
              this.observables.splice(this.observables.indexOf(obs), 1);
              jb.log('watchable observable removed',{obs})
            }
          } else {
            this.notifyOneObserver(e,obs,changed_path)
          }
        })
      })
    }

    notifyOneObserver(e,obs,changed_path) {
        let obsPath = jb.db.refHandler(obs.ref).pathOfRef(obs.ref)
        obsPath = obsPath && this.removeLinksFromPath(obsPath)
        if (!obsPath)
          return jb.logError('watchable observable ref path is empty',{obs,e})
        const diff = jb.utils.comparePaths(changed_path, obsPath)
        const isChildOfChange = diff == 1
        const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
        const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
        if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
            jb.log('notify watchable observable',{srcCtx: e.srcCtx,obs,e})
            obs.subject.next(e)
        }
    }

    dispose() {
      this.resourceChange.complete()
    }
  },

  resourcesRef: val => typeof val == 'undefined' ? jb.db.resources : (jb.db.resources = val),
  isWatchable: ref => jb.db.refHandler(ref) instanceof jb.watchable.WatchableValueByRef || ref && ref.$jb_observable,
  refObservable(ref,{cmp,includeChildren,srcCtx} = {}) { // cmp._destroyed is checked before notification
      if (ref && ref.$jb_observable)
        return ref.$jb_observable(cmp)
      if (!jb.watchable.isWatchable(ref)) {
        jb.logError('ref is not watchable: ', {ref, cmp,srcCtx})
        return jb.callbag.fromIter([])
      }
      return jb.db.refHandler(ref).getOrCreateObservable({ref,cmp,includeChildren,srcCtx})
  },

})

jb.extension('immutable', {
  initExtension() {
    jb.immutable._commands = jb.immutable.commands()
  },
  update(object, spec) {
    var nextObject = object
    Object.keys(spec).forEach(key => {
      if (jb.immutable._commands[key]) {
        var objectWasNextObject = object === nextObject
        nextObject = jb.immutable._commands[key](spec[key], nextObject, object)
        if (objectWasNextObject && nextObject === object)
          nextObject = object
      } else {
        var nextValueForKey = jb.immutable.update(object[key], spec[key])
        var nextObjectValue = nextObject[key]
        if (nextValueForKey !== nextObjectValue || typeof nextValueForKey === 'undefined' && !object.hasOwnProperty(key)) {
          if (nextObject === object)
            nextObject = jb.immutable.copy(object)
          nextObject[key] = nextValueForKey;
        }
      }
    })
    return nextObject
  },
  copy(obj) {
    res = Array.isArray(obj) ? obj.slice(0) : (obj && typeof obj === 'object') ? Object.assign({}, obj) : obj
    res[jb.watchable.jbId] = obj[jb.watchable.jbId]
    return res
  },
  commands: () => ({ 
    $push: (value, nextObject) => value.length ? nextObject.concat(value) : nextObject,
    $splice(value, nextObject, originalObject) {
      value.forEach(args => {
        if (nextObject === originalObject && args.length) nextObject = jb.immutable.copy(originalObject)
        nextObject.splice(...args)
      })
      return nextObject
    },
    $set: x => x,
    $merge(value, nextObject, originalObject) {
      Object.keys(value).forEach(key => {
        if (value[key] !== nextObject[key]) {
          if (nextObject === originalObject) nextObject = jb.immutable.copy(originalObject);
          nextObject[key] = value[key]
        }
      })
      return nextObject
    }
  })
})

jb.component('runTransaction', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'},
    {id: 'handler', defaultValue: () => jb.db.watchableHandlers.find(x=>x.resources.id == 'resources')}
  ],
  impl: (ctx,noNotifications,handler) => {
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions'] || []).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    handler && handler.startTransaction()
    return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runTransaction',{ctx}))
      .then(() => handler && handler.endTransaction(noNotifications))
	}
})
;

jb.extension('ui', 'react', {
    initExtension() {
        Object.assign(this,{
            BECmpsDestroyNotification: jb.callbag.subject(),
            refreshNotification: jb.callbag.subject(),
            renderingUpdates: jb.callbag.subject(),
            widgetUserRequests: jb.callbag.subject(),
            followUps: {},
        })

        // subscribe for widget renderingUpdates
        jb.callbag.subscribe(e=> {
            if (!e.widgetId && e.cmpId && typeof document != 'undefined') {
                const elem = document.querySelector(`[cmp-id="${e.cmpId}"]`)
                if (elem) {
                    jb.ui.applyDeltaToDom(elem, e.delta)
                    jb.ui.refreshFrontEnd(elem)
                }
            }
        })(jb.ui.renderingUpdates)

        // subscribe for destroy notification
        jb.callbag.subscribe(e=> {
            const {widgetId,destroyLocally,cmps} = e
            
            cmps.forEach(_cmp => {
                const fus = jb.ui.followUps[_cmp.cmpId]
                if (!fus) return
                const index = fus.findIndex(({cmp}) => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)
                if (index != -1) {
                    fus[index].pipe.dispose()
                    fus.splice(index,1)
                }
                if (!fus.length)
                    delete jb.ui.followUps[_cmp.cmpId]
            })

            if (widgetId && !destroyLocally)
                jb.ui.widgetUserRequests.next({$:'destroy', ...e })
            else 
                cmps.forEach(cmp=> (cmp.destroyCtxs || []).forEach(ctxIdToRun => {
                    jb.log('backend method destroy uiComp',{cmp, el: cmp.el})
                    jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun])
                } ))
        })(jb.ui.BECmpsDestroyNotification)
    },
    h(cmpOrTag,attributes,children) {
        if (cmpOrTag instanceof jb.ui.VNode) return cmpOrTag // Vdom
        if (cmpOrTag && cmpOrTag.renderVdom)
            return cmpOrTag.renderVdomAndFollowUp()
    
        return new jb.ui.VNode(cmpOrTag,attributes,children)
    },
    compareVdom(b,after,ctx) {
        const a = after instanceof jb.ui.VNode ? jb.ui.stripVdom(after) : after
        jb.log('vdom diff compare',{before: b,after : a,ctx})
        const attributes = jb.utils.objectDiff(a.attributes || {}, b.attributes || {})
        const children = childDiff(b.children || [],a.children || [])
        return { 
            ...(Object.keys(attributes).length ? {attributes} : {}), 
            ...(children ? {children} : {}),
            ...(a.tag != b.tag ? { tag: a.tag} : {})
        }

        function childDiff(b,a) {
            if (b.length == 0 && a.length ==0) return
            if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
                return { 0: {...jb.ui.compareVdom(b[0],a[0],ctx),__afterIndex: 0}, length: 1 }
            jb.log('vdom child diff start',{before: b,after: a,ctx})
            const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
            let remainingBefore = beforeWithIndex.slice(0)
            // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
            const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
            a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

            const reused = []
            const res = { length: 0, sameOrder: true }
            beforeWithIndex.forEach( (e,i) => {
                const __afterIndex = afterToBeforeMap.indexOf(e)
                if (__afterIndex != i) res.sameOrder = false
                if (__afterIndex == -1) {
                    res.length = i+1
                    res[i] =  {$: 'delete' } //, __afterIndex: i }
                } else {
                    reused[__afterIndex] = true
                    const innerDiff = { __afterIndex, ...jb.ui.compareVdom(e, a[__afterIndex],ctx), ...(e.$remount ? {remount: true}: {}) }
                    if (Object.keys(innerDiff).length > 1) {
                        res[i] = innerDiff
                        res.length = i+1
                    }
                }
            })
            res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
            jb.log('vdom child diff result',{res,before: b,after: a,ctx})
            if (!res.length && !res.toAppend.length) return null
            return res

            function locateVdom(toLocate,remainingBefore) {
                const found = remainingBefore.findIndex(before=>sameSource(before,toLocate))
                if (found != -1)                
                    return remainingBefore.splice(found,1)[0]
            }
            function sameIndexSameTag(toLocate,index,remainingBefore) {
                const found = remainingBefore.findIndex(before=>before.tag && before.i == index && before.tag === toLocate.tag)
                if (found != -1) {
                    const ret = remainingBefore.splice(found,1)[0]
                    if (ret.attributes.ctxId && !sameSource(ret,toLocate))
                        ret.$remount = true
                    return ret
                }
            }
            function sameSource(vdomBefore,vdomAfter) {
                if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
                const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
                if (atts1['cmp-id'] && atts1['cmp-id'] === atts2['cmp-id'] || atts1['jb-ctx'] && atts1['jb-ctx'] === atts2['jb-ctx']) return true
                if (compareCtxAtt('path',atts1,atts2) && compareCtxAtt('data',atts1,atts2)) return true
                if (compareAtts(['id','path','name'],atts1,atts2)) return true
            }
            function compareAtts(attsToCompare,atts1,atts2) {
                for(let i=0;i<attsToCompare.length;i++)
                    if (atts1[attsToCompare[i]] && atts1[attsToCompare[i]] == atts2[attsToCompare[i]])
                        return true
            }
            function compareCtxAtt(att,atts1,atts2) {
                const val1 = atts1.ctxId && jb.path(jb.ctxDictionary[atts1.ctxId],att)
                const val2 = atts2.ctxId && jb.path(jb.ctxDictionary[atts2.ctxId],att)
                return val1 && val2 && val1 == val2
            }            
        }
    },

    applyNewVdom(elem,vdomAfter,{strongRefresh, ctx} = {}) {
        const widgetId = jb.ui.headlessWidgetId(elem)
        jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
        if (widgetId) {
            const cmpId = elem.getAttribute('cmp-id')
            const delta = jb.ui.compareVdom(elem,vdomAfter,ctx)
            const assumedVdom = JSON.parse(JSON.stringify(jb.ui.stripVdom(elem)))
            if (elem != vdomAfter) { // update the elem
                ;(elem.children ||[]).forEach(ch=>ch.parentNode = null)
                Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
                Object.assign(elem,vdomAfter)
                ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
            }
            jb.ui.renderingUpdates.next({assumedVdom, delta,cmpId,widgetId})
            return
        }
        const active = jb.ui.activeElement() === elem
        if (vdomAfter.tag != elem.tagName.toLowerCase() || strongRefresh) {
            jb.ui.unmount(elem)
            const newElem = jb.ui.render(vdomAfter,elem.parentElement)
            elem.parentElement.replaceChild(newElem,elem)
            jb.log('replaceTop vdom',{newElem,elem})
            elem = newElem
        } else {
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            jb.log('apply delta top dom',{vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
            jb.ui.applyDeltaToDom(elem,delta)
        }
        jb.ui.refreshFrontEnd(elem)
        if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
        jb.ui.garbageCollectCtxDictionary()
    },
    elemToVdom(elem) {
        if (elem instanceof jb.ui.VNode) return elem
        if (elem.getAttribute('jb_external')) return
        return {
            tag: elem.tagName.toLowerCase(),
            attributes: jb.objFromEntries([
                ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
                ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
            ]),
            ...( elem.childElementCount && { children: Array.from(elem.children).map(el=> jb.ui.elemToVdom(el)).filter(x=>x) })
        }
    },

    applyDeltaToDom(elem,delta) {
        jb.log('applyDelta dom',{elem,delta})
        const children = delta.children
        if (children) {
            const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
            const childElems = Array.from(elem.children)
            const {toAppend,deleteCmp,sameOrder,resetAll} = children
            if (resetAll) 
                Array.from(elem.children).forEach(toDelete=>removeChild(toDelete))
            if (deleteCmp) 
                Array.from(elem.children)
                    .filter(ch=>ch.getAttribute('cmp-id') == deleteCmp)
                    .forEach(toDelete=>removeChild(toDelete))

            childrenArr.forEach((e,i) => {
                if (!e) {
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',''+i))
                } else if (e.$ == 'delete') {
                    jb.ui.unmount(childElems[i])
                    elem.removeChild(childElems[i])
                    jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta})
                } else {
                    jb.ui.applyDeltaToDom(childElems[i],e)
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
                }
            })
            ;(toAppend||[]).forEach(e=>{
                const newElem = jb.ui.render(e,elem)
                jb.log('appendChild dom',{newElem,e,elem,delta})
                !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
            })
            if (sameOrder === false) {
                Array.from(elem.children)
                    .sort((x,y) => Number(x.getAttribute('__afterIndex')) - Number(y.getAttribute('__afterIndex')))
                    .forEach(el=> {
                        const index = Number(el.getAttribute('__afterIndex'))
                        if (elem.children[index] != el)
                            elem.insertBefore(el, elem.children[index])
                        el.removeAttribute('__afterIndex')
                    })
            }
            // remove leftover text nodes in mixed
            if (elem.childElementCount)
                Array.from(elem.childNodes).filter(ch=>ch.nodeName == '#text')
                    .forEach(ch=>{
                        elem.removeChild(ch)
                        jb.log('removeChild dom leftover',{ch,elem,delta})
                    })
        }
        jb.entries(delta.attributes)
            .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
            .forEach(e=> jb.ui.setAtt(elem,e[0],e[1]))
        
        function removeChild(toDelete) {
            jb.ui.unmount(toDelete)
            elem.removeChild(toDelete)
            jb.log('removeChild dom',{toDelete,elem,delta})
        }
    },
    applyDeltaToVDom(elem,delta) {
        if (!elem) return
        jb.log('applyDelta vdom',{elem,delta})
        // supports only append/delete
        if (delta.children) {
            const toAppend = delta.children.toAppend || []
            const {resetAll, deleteCmp} = delta.children
            if (resetAll) {
                elem.children && elem.children.forEach(ch => ch.parentNode = null)
                elem.children = []
            }
            if (deleteCmp) {
                const index = elem.children.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)
                if (index != -1) {
                    elem.children[index] && (elem.children[index].parentNode = null)
                    elem.children.splice(index,1)
                }
            }
            toAppend.forEach(ch => { 
                elem.children = elem.children || []
                elem.children.push(jb.ui.unStripVdom(ch,elem))
            })
            Object.keys(delta.children).filter(x=>!isNaN(x)).forEach(index=>
                    jb.ui.applyDeltaToVDom(elem.children[+index],delta.children[index]))
        }

        Object.assign(elem.attributes,delta.attributes)
    },
    setAtt(elem,att,val) {
        if (val == '__undefined') val = null
        if (att[0] !== '$' && val == null) {
            elem.removeAttribute(att)
            jb.log('dom change remove',{elem,att,val})
        } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
            elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
            elem[`registeredTo-${att}`] = true
        } else if (att.indexOf('on-') == 0 && val == null) {
            elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
            elem[`registeredTo-${att}`] = false
        } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
            elem.setAttribute(att,val)
            jb.delay(1).then(()=> { // browser bug?
                elem.checked = true
                jb.log('dom set checked',{elem,att,val})
            })
        } else if (att.indexOf('$__input') === 0) {
            try {
                setInput(JSON.parse(val))
            } catch(e) {}
        } else if (att.indexOf('$__') === 0) {
            const id = att.slice(3)
            try {
                elem[id] = JSON.parse(val) || ''
            } catch (e) {}
            jb.log(`dom set data ${id}`,{elem,att,val})
        } else if (att === '$focus' && val) {
            elem.setAttribute('__focus',val)
            jb.ui.focus(elem,val)
        } else if (att === '$scrollDown' && val) {
            elem.__appScroll = true
            elem.scrollTop = elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1
        } else if (att === '$scrollDown' && val == null) {
            delete elem.__appScroll
        } else if (att === '$text') {
            elem.innerText = val || ''
            jb.log('dom set text',{elem,att,val})
        } else if (att === '$html') {
            elem.innerHTML = val || ''
            jb.log('dom set html',{elem,att,val})
        } else if (att === 'style' && typeof val === 'object') {
            elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
            jb.log('dom set style',{elem,att,val})
        } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
            const active = document.activeElement === elem
            if (elem.value == val) return
            elem.value = val
            if (active && document.activeElement !== elem) { debugger; elem.focus() }
            jb.log('dom set elem value',{elem,att,val})
        } else {
            elem.setAttribute(att,val)
            //jb.log('dom set att',{elem,att,val}) to many calls
        }

        function setInput({assumedVal,newVal,selectionStart}) {
            const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
            jb.log('dom set input check',{el, assumedVal,newVal,selectionStart})
            if (!el)
                return jb.logError('setInput: can not find input under elem',{elem})
            if (assumedVal != el.value) 
                return jb.logError('setInput: assumed val is not as expected',{ assumedVal, value: el.value, el })
            const active = document.activeElement === el
            jb.log('dom set input',{el, assumedVal,newVal,selectionStart})
            el.value = newVal
            if (typeof selectionStart == 'number') 
                el.selectionStart = selectionStart
            if (active && document.activeElement !== el) { debugger; el.focus() }
        }
    },

    unmount(elem) {
        if (!elem || !elem.setAttribute) return

        const groupByWidgets = {}
        jb.ui.findIncludeSelf(elem,'[cmp-id]').forEach(el => {
            el._component && el._component.destroyFE()
            if (jb.ui.frontendWidgetId(elem)) return
            const widgetId = jb.ui.headlessWidgetId(el) || '_local_'
            groupByWidgets[widgetId] = groupByWidgets[widgetId] || { cmps: []}
            const destroyCtxs = (el.getAttribute('methods')||'').split(',').filter(x=>x.indexOf('destroy-') == 0).map(x=>x.split('destroy-').pop())
            const cmpId = el.getAttribute('cmp-id'), ver = el.getAttribute('cmp-ver')
            groupByWidgets[widgetId].cmps.push({cmpId,ver,el,destroyCtxs})
        })
        jb.log('unmount',{elem,groupByWidgets})
        jb.entries(groupByWidgets).forEach(([widgetId,val])=>
            jb.ui.BECmpsDestroyNotification.next({
                widgetId, cmps: val.cmps,
                destroyLocally: widgetId == '_local_',
                destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
        }))
    },
    render(vdom,parentElem,prepend) {
        jb.log('render',{vdom,parentElem,prepend})
        function doRender(vdom,parentElem) {
            jb.log('dom createElement',{tag: vdom.tag, vdom,parentElem})
            const elem = jb.ui.createElement(parentElem.ownerDocument, vdom.tag)
            jb.entries(vdom.attributes).forEach(e=>jb.ui.setAtt(elem,e[0],e[1]))
            jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
            prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
            return elem
        }
        const res = doRender(vdom,parentElem)
        jb.ui.findIncludeSelf(res,'[interactive]').forEach(el=> jb.ui.mountFrontEnd(el))
        // check
        const checkResultingVdom = jb.ui.elemToVdom(res)
        const diff = jb.ui.vdomDiff(checkResultingVdom,vdom)
        if (checkResultingVdom && Object.keys(diff).length)
            jb.logError('render diff',{diff,checkResultingVdom,vdom})

        return res
    },
    createElement(doc,tag) {
        tag = tag || 'div'
        return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
            doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
    },
    handleCmpEvent(ev, specificMethod) {
        specificMethod = specificMethod == 'true' ? true : specificMethod
        const userReq = jb.ui.rawEventToUserRequest(ev,specificMethod)
        jb.log('handle cmp event',{ev,specificMethod,userReq})
        if (!userReq) return
        if (userReq.widgetId)
            jb.ui.widgetUserRequests.next(userReq)
        else {
            const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
            if (!ctx)
                jb.logError(`handleCmpEvent - no ctx in dictionary for id ${userReq.ctxIdToRun}`,{ev,specificMethod})
            ctx && jb.ui.runCtxAction(ctx,userReq.data,userReq.vars)
        }
    },
    rawEventToUserRequest(ev, specificMethod) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('rawEventToUserRequest can not find closest elem with jb-ctx',{ev})
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.tstWidgetId
        return ctxIdToRun && {$:'runCtxAction', method, widgetId, ctxIdToRun, vars: {ev: jb.ui.buildUserEvent(ev, elem)} }
    },
    calcElemProps(elem) {
        return elem instanceof jb.ui.VNode ? {} : { 
            outerHeight: jb.ui.outerHeight(elem), outerWidth: jb.ui.outerWidth(elem), 
            clientRect: elem.getBoundingClientRect() 
        }
    },
    buildUserEvent(ev, elem) {
        if (!ev) return null
        const userEvent = {
            value: (ev.target || {}).value, 
            elem: jb.ui.calcElemProps(elem),
            ev: {},
        }
        const evProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','altKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        jb.path(elem,'_component.enrichUserEvent') && elem._component.enrichUserEvent(ev,userEvent)
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runCtxActionAndUdateCmpState(ctx,data,vars) {
        if (jb.path(vars,'$updateCmpState.cmpId') == jb.path(ctx.vars,'cmp.cmpId') && jb.path(vars,'$updateCmpState.state'))
            Object.assign(ctx.vars.cmp.state,vars.$updateCmpState.state)
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },    
    runCtxAction(ctx,data,vars) {
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },
    runBEMethodInAnyContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp instanceof jb.ui.JbComponent)
            cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            jb.ui.runBEMethod(cmp.base,method,data,
                    {$updateCmpState: {state: cmp.state, cmpId: cmp.cmpId}, $state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethod(elem,method,data,vars) {
        if (!elem)
            return jb.logError(`runBEMethod, no elem provided: ${method}`, {elem, data, vars})
        const widgetId = jb.ui.frontendWidgetId(elem)
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        if (!ctxIdToRun)
            return jb.logError(`no method in cmp: ${method}`, {elem, data, vars})

        if (widgetId)
            jb.ui.widgetUserRequests.next({$:'runCtxAction', method, widgetId, ctxIdToRun, data, vars })
        else {
            const ctx = jb.ctxDictionary[ctxIdToRun]
            if (!ctx)
                return jb.logError(`no ctx found for method: ${method}`, {ctxIdToRun, elem, data, vars})
    
            jb.log(`backend method request: ${method}`,{cmp: ctx.vars.cmp, method,ctx,elem,data,vars})
            jb.ui.runCtxActionAndUdateCmpState(ctx,data,vars)
        }
    },
    resourceChange: () => jb.db.useResourcesHandler(h=>h.resourceChange),
    ctrl(origCtx,options) {
        const styleByControl = jb.path(origCtx,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (origCtx.vars.$refreshElemCall || styleByControl) ? origCtx.vars.$state : {}
        const cmpId = origCtx.vars.$cmpId, cmpVer = origCtx.vars.$cmpVer
        if (!origCtx.vars.$serviceRegistry)
            jb.logError('no serviceRegistry',{ctx: origCtx})
        const ctx = origCtx.setVars({
            $model: { ctx: origCtx, ...origCtx.params},
            $state,
            $serviceRegistry: origCtx.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions instanceof jb.ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new jb.ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = origCtx.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && origCtx.vars[defaultVar])
                return ctx.run({$:origCtx.vars[defaultVar]})
            return origCtx.params.style ? origCtx.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(forceNow,clearAll) {
        if (!forceNow)
            return jb.delay(1000).then(()=>jb.ui.garbageCollectCtxDictionary(true))
   
        const used = 'jb-ctx,full-cmp-ctx,pick-ctx,props-ctx,methods,frontEnd,originators'.split(',')
            .flatMap(att=>querySelectAllWithWidgets(`[${att}]`)
                .flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop())).filter(x=>x)))
                    .sort((x,y)=>x-y)

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y)
        let lastUsedIndex = 0;
        const removedCtxs = [], removedResources = [], maxUsed = used.slice(-1)[0] || (clearAll ? Number.MAX_SAFE_INTEGER : 0)
        for(let i=0;i<dict.length && dict[i] < maxUsed;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i]) {
                removedCtxs.push(dict[i])
                delete jb.ctxDictionary[''+dict[i]]
            }
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.db.isWatchable(v)).map(v => jb.db.asRef(v))
            .map(ref=>jb.db.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.utils.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.db.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .filter(id=>+id.split(':').pop < maxUsed)
            .forEach(id => { removedResources.push(id); delete jb.db.resources[id]})

        // remove front-end widgets
        const usedWidgets = jb.objFromEntries(
            Array.from(querySelectAllWithWidgets(`[widgetid]`)).filter(el => el.getAttribute('frontend')).map(el => [el.getAttribute('widgetid'),1]))
        const removeWidgets = Object.keys(jb.ui.frontendWidgets||{}).filter(id=>!usedWidgets[id])

        removeWidgets.forEach(widgetId => {
            jb.ui.widgetUserRequests.next({$:'destroy', widgetId, destroyWidget: true, cmps: [] })
            if (jb.ui.frontendWidgets) delete jb.ui.frontendWidgets[widgetId]
        })
        
        // remove component follow ups
        const removeFollowUps = Object.keys(jb.ui.followUps).flatMap(cmpId=> {
            const curVer = Array.from(querySelectAllWithWidgets(`[cmp-id="${cmpId}"]`)).map(el=>+el.getAttribute('cmp-ver'))[0]
            return jb.ui.followUps[cmpId].flatMap(({cmp})=>cmp).filter(cmp => !curVer || cmp.ver > curVer)
        })
        if (removeFollowUps.length)
            jb.ui.BECmpsDestroyNotification.next({ cmps: removeFollowUps})

        jb.log('garbageCollect',{maxUsed,removedCtxs,removedResources,removeWidgets,removeFollowUps})

        function querySelectAllWithWidgets(query) {
            return jb.ui.headless ? [...Object.values(jb.ui.headless).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), ...Array.from(document.querySelectorAll(query))] : []
        }
    },
    applyDeltaToCmp({delta, ctx, cmpId, elem, assumedVdom}) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (!elem || delta._$prevVersion && delta._$prevVersion != elem.getAttribute('cmp-ver')) {
            const reason = elem ? 'unexpected version' : 'elem not found'
            jb.logError(`applyDeltaToCmp: ${reason}`,{reason, delta, ctx, cmpId, elem})
            return // { recover: true, reason }
        }
        if (assumedVdom) {
            const actualVdom = jb.ui.elemToVdom(elem)
            const diff = jb.ui.vdomDiff(assumedVdom,actualVdom)
            if (Object.keys(diff).length) {
                jb.logError('wrong assumed vdom',{actualVdom, assumedVdom, diff, delta, ctx, cmpId, elem})
                return { recover: true, reason: { diff, description: 'wrong assumed vdom'} }
            }
        }
        const bySelector = delta._$bySelector && Object.keys(delta._$bySelector)[0]
        const actualElem = bySelector ? jb.ui.find(elem,bySelector)[0] : elem
        const actualdelta = bySelector ? delta._$bySelector[bySelector] : delta
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem, bySelector, actualElem})
        if (actualElem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(actualElem, actualdelta)
            jb.ui.renderingUpdates.next({delta,cmpId,widgetId: ctx.vars.headlessWidgetId})
        } else if (actualElem) {
            jb.ui.applyDeltaToDom(actualElem, actualdelta)
            jb.ui.refreshFrontEnd(actualElem)
        }
    },
    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing' || jb.ui.findIncludeSelf(elem,'[__refreshing]')[0]) 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const _ctx = jb.ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$model',null).setVar('$state', strongRefresh ? {refresh: true } : 
            {refresh: true, ...jb.path(elem._component,'state'), ...state}) // strongRefresh kills state
        ctx._parent = null

        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path}) || ctx.profile
        elem.setAttribute('__refreshing','')
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.run(dialog.buildComp()) : ctx.runItself()
        jb.log('refresh elem start',{cmp,ctx,elem, state, options})

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/[a-zA-Z0-9_-]+⦾[0-9]*/)||[''])[0]
            if (!existingClass)
                jb.logError('refresh css only - can not find existing class',{elem,ctx})
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass) != -1)[0].el
            jb.log('refresh element css only',{cmp, lines: cmp.cssLines,ctx,elem, state, options})
            jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, cssStyleElem})
        } else {
            jb.log('do refresh element',{cmp,ctx,elem, state, options})
            cmp && jb.ui.applyNewVdom(elem, jb.ui.h(cmp), {strongRefresh, ctx})
        }
        elem.removeAttribute('__refreshing')
        jb.ui.refreshNotification.next({cmp,ctx,elem, state, options})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    }
})
;

jb.extension('ui', {
    VNode: class VNode {
        constructor(cmpOrTag, _attributes, _children) {
            const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]])
                .map(([id,val])=>[id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, typeof val == 'object' ? val : ''+val]))
            let children = (_children === '') ? null : _children
            if (['string','boolean','number'].indexOf(typeof children) !== -1) {
                attributes.$text = ''+children
                children = null
            }
            if (children && typeof children.then == 'function') {
                attributes.$text = '...'
                children = null
            }
            if (children != null && !Array.isArray(children)) children = [children]
            if (children != null)
                children = children.filter(x=>x).map(item=> typeof item == 'string' ? jb.ui.h('span',{$text: item}) : item)
            if (children && children.length == 0) children = null
            
            this.attributes = attributes
                
            if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('#') != -1)
                debugger
            if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('.') != -1) {
                this.addClass(cmpOrTag.split('.').pop().trim())
                cmpOrTag = cmpOrTag.split('.')[0]
            }
            if (children != null)
                children.forEach(ch=>ch.parentNode = this)
            Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,...(children && {children}) })
        }
        getAttribute(att) {
            const res = (this.attributes || {})[att]
            return res == null ? res : (''+res)
        }
        setAttribute(att,val) {
            if (val == null) return
            this.attributes = this.attributes || {}
            this.attributes[att.toLowerCase()] = ''+val
            return this
        }
        removeAttribute(att) {
            this.attributes && delete this.attributes[att.toLowerCase()]
        }
        addClass(clz) {
            if (clz.indexOf(' ') != -1) {
                clz.split(' ').filter(x=>x).forEach(cl=>this.addClass(cl))
                return this
            }
            this.attributes = this.attributes || {};
            if (this.attributes.class === undefined) this.attributes.class = ''
            if (clz && this.attributes.class.split(' ').indexOf(clz) == -1) {
                this.attributes.class = [this.attributes.class,clz].filter(x=>x).join(' ');
            }
            return this;
        }
        hasClass(clz) {
            return (jb.path(this,'attributes.class') || '').split(' ').indexOf(clz) != -1
        }
        querySelector(...args) {
            return this.querySelectorAll(...args)[0]
        }
        querySelectorAll(selector,{includeSelf}={}) {
            let maxDepth = 50
            if (selector.match(/^:scope>/)) {
                maxDepth = 1
                selector = selector.slice(7)
            }
            if (selector == '' || selector == ':scope') return [this]
            if (selector.indexOf(',') != -1)
                return selector.split(',').map(x=>x.trim()).reduce((res,sel) => [...res, ...this.querySelectorAll(sel,{includeSelf})], [])
            const hasAtt = selector.match(/^\[([a-zA-Z0-9_$\-]+)\]$/)
            const attEquals = selector.match(/^\[([a-zA-Z0-9_$\-]+)="([a-zA-Z0-9_\-→•]+)"\]$/)
            const hasClass = selector.match(/^\.([a-zA-Z0-9_$\-]+)$/)
            const hasTag = selector.match(/^[a-zA-Z0-9_\-]+$/)
            const idEquals = selector.match(/^#([a-zA-Z0-9_$\-]+)$/)
            const selectorMatcher = hasAtt ? el => el.attributes && el.attributes[hasAtt[1]]
                : hasClass ? el => el.hasClass(hasClass[1])
                : hasTag ? el => el.tag === hasTag[0]
                : attEquals ? el => el.attributes && el.attributes[attEquals[1]] == attEquals[2]
                : idEquals ? el => el.attributes && el.attributes.id == idEquals[1]
                : null

            return selectorMatcher && doFind(this,selectorMatcher,!includeSelf,0)

            function doFind(vdom,selectorMatcher,excludeSelf,depth) {
                return depth >= maxDepth ? [] : [ ...(!excludeSelf && selectorMatcher(vdom) ? [vdom] : []), 
                    ...(vdom.children||[]).flatMap(ch=> doFind(ch,selectorMatcher,false,depth+1))
                ]
            }
        }
    },
    toVdomOrStr(val) {
        if (jb.utils.isDelayed(val))
            return jb.utils.toSynchArray(val).then(v => jb.ui.toVdomOrStr(v[0]))

        const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
        let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
        if (res && res instanceof jb.ui.VNode || Array.isArray(res)) return res
        if (typeof res === 'boolean' || typeof res === 'object')
            res = '' + res
        else if (typeof res === 'string')
            res = res.slice(0,1000)
        return res
    },
    stripVdom(vdom) {
        if (jb.path(vdom,'constructor.name') != 'VNode') {
            jb.logError('stripVdom - not vnode', {vdom})
            return jb.ui.h('span')
        }
        return { 
            ...(vdom.attributes && {attributes: vdom.attributes}), 
            ...(vdom.children && vdom.children.length && {children: vdom.children.map(x=>jb.ui.stripVdom(x))}),
            tag: vdom.tag
        }
    },
    unStripVdom(vdom,parent) {
        return _unStripVdom(JSON.parse(JSON.stringify(vdom)),parent)

        function _unStripVdom(vdom,parent) {
            if (!vdom) return // || typeof vdom.parentNode == 'undefined') return
            vdom.parentNode = parent
            Object.setPrototypeOf(vdom, jb.ui.VNode.prototype);
            ;(vdom.children || []).forEach(ch=>_unStripVdom(ch,vdom))
            return vdom
        }
    },
    cloneVNode(vdom) {
        return jb.ui.unStripVdom(JSON.parse(JSON.stringify(jb.ui.stripVdom(vdom))))
    },
    vdomDiff(newObj,orig) {
        const ignoreRegExp = /\$|checked|style|value|parentNode|frontend|__|widget|on-|remoteuri|width|height|top|left|aria-|tabindex/
        const ignoreValue = /__undefined/
        const ignoreClasses = /selected|mdc-tab-[0-9]+/
        return doDiff(newObj,orig)
        function doDiff(newObj,orig,attName) {
            if (Array.isArray(orig) && orig.length == 0) orig = null
            if (Array.isArray(newObj) && newObj.length == 0) newObj = null
            if (orig === newObj) return {}
    //        if (jb.path(newObj,'attributes.jb_external') || jb.path(orig,'attributes.jb_external')) return {}
            if (typeof orig == 'string' && ignoreValue.test(orig) || typeof newObj == 'string' && ignoreValue.test(newObj)) return {}
            if (attName == 'class' && 
                (typeof orig == 'string' && ignoreClasses.test(orig) || typeof newObj == 'string' && ignoreClasses.test(newObj))) return {}
            if (!jb.utils.isObject(orig) || !jb.utils.isObject(newObj)) return newObj
            const deletedValues = Object.keys(orig)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof orig[k] == 'string' && ignoreValue.test(orig[k])))
                .filter(k => !(Array.isArray(orig[k]) && orig[k].length == 0))
    //            .filter(k => !(typeof orig[k] == 'object' && jb.path(orig[k],'attributes.jb_external')))
                .reduce((acc, key) => newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: '__undefined'}, {})

            return Object.keys(newObj)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof newObj[k] == 'string' && ignoreValue.test(newObj[k])))
                .filter(k => !(Array.isArray(newObj[k]) && newObj[k].length == 0))
    //            .filter(k => !(typeof newObj[k] == 'object' && jb.path(newObj[k],'attributes.jb_external')))
                .reduce((acc, key) => {
                    if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
                    const difference = doDiff(newObj[key], orig[key],key)
                    if (jb.utils.isObject(difference) && jb.utils.isEmpty(difference)) return acc // return no diff
                    return { ...acc, [key]: difference } // return updated key
            }, deletedValues)    
        }
    }
});

jb.extension('ui','comp', {
    initExtension() {
        Object.assign(this, {
            lifeCycle: new Set('init,extendCtx,templateModifier,followUp,destroy'.split(',')),
            arrayProps: new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,frontEndLib,frontEndVar,eventHandler'.split(',')),
            singular: new Set('template,calcRenderProps,toolbar,styleParams,ctxForPick'.split(',')),
            cmpCounter: 1,
            cssHashCounter: 0,
            propCounter: 0,
            cssHashMap: {},                
        })
    },
    hashCss(_cssLines,ctx,{existingClass, cssStyleElem} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
        const classPrefix = widgetId || 'jb'
        const cssMap = this.cssHashMap[classPrefix] = this.cssHashMap[classPrefix] || {}

        if (!cssMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(cssMap).filter(k=>cssMap[k].classId == existingClass)[0]
                existingKey && delete cssMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}⦾${this.cssHashCounter}`
            cssMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            if (cssStyleElem)
                cssStyleElem.innerText = cssContent
            else
                jb.ui.addStyleElem(ctx,cssContent,widgetId)
        }
        Object.assign(cssMap[cssKey].paths, {[ctx.path] : true})
        return cssMap[cssKey].classId

        function linesToCssStyle(classId) {
            const cssStyle = cssLines.map(selectorPlusExp=>{
                const selector = selectorPlusExp.split('{')[0];
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.${classId}${x}` : x.replace('~',`.${classId}`));
                return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
            }).join('\n');
            return `${cssStyle} /* ${ctx.path} */`
        }
    },
    JbComponent : class JbComponent {
        constructor(ctx,id,ver) {
            this.ctx = ctx // used to calc features
            const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId || ''
            this.cmpId = id || (widgetId ? (widgetId+'-'+(jb.ui.cmpCounter++)) : ''+(jb.ui.cmpCounter++))
            this.ver = ver || 1
            this.eventObservables = []
            this.cssLines = []
            this.contexts = []
            this.originators = [ctx]
        }
        init() {
            if (this.initialized) return
            jb.log('init uiComp',{cmp: this})
            const baseVars = this.ctx.vars
            this.ctx = (this.extendCtxFuncs||[])
                .reduce((acc,extendCtx) => jb.utils.tryWrapper(() => extendCtx(acc,this),'extendCtx',this.ctx), this.ctx.setVar('cmp',this))
            this.newVars = jb.objFromEntries(jb.entries(this.ctx.vars).filter(([k,v]) => baseVars[k] != v))
            this.renderProps = {}
            this.state = this.ctx.vars.$state
            this.calcCtx = this.ctx.setVar('$props',this.renderProps).setVar('cmp',this)
            this.initialized = true
        }
    
        calcRenderProps() {
            this.init()
            ;(this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
                .forEach(f => jb.utils.tryWrapper(() => f.action(this.calcCtx, this.calcCtx.vars), 'init',this.ctx));
    
            this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.db.isWatchable(obs.ref)) : []
            this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
                if (this.state[e.prop] != undefined) return // we have the value in the state, probably asynch value so do not calc again
                const modelProp = this.ctx.vars.$model[e.prop]
                if (!modelProp)
                    return jb.logError('calcRenderProps',`missing model prop "${e.prop}"`, {cmp: this, model: this.ctx.vars.$model, ctx: this.ctx})
                const ref = modelProp(this.ctx)
                if (jb.db.isWatchable(ref))
                    this.toObserve.push({id: e.prop, cmp: this, ref,...e})
                const val = jb.val(ref)
                this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? e.defaultValue : val))
            })

            ;[...(this.calcProp || []),...(this.method || [])].forEach(
                p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))
            const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                    this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
            filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
                .forEach(prop=> { 
                    const val = jb.val( jb.utils.tryWrapper(() => 
                        prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                    `renderProp:${prop.id}`,this.ctx))
                    const value = val == null ? prop.defaultValue : val
                    Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
                })
            ;(this.calcProp || []).filter(p => p.userStateProp && !this.state.refresh).forEach(p => this.state[p.id] = this.renderProps[p.id])
            Object.assign(this.renderProps,this.styleParams, this.state)
            return this.renderProps
        }

        renderVdom() {
            jb.log('uiComp start renderVdom', {cmp: this})
            this.calcRenderProps()
            if (this.ctx.probe && this.ctx.probe.outOfTime) return
            this.template = this.template || (() => '')
            const initialVdom = jb.utils.tryWrapper(() => this.template(this,this.renderProps,jb.ui.h), 'template',this.ctx) || {}
            const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                    (vd && typeof vd === 'object') ? jb.utils.tryWrapper(() => modifier(vd,this,this.renderProps,jb.ui.h) || vd, 'templateModifier',this.ctx) 
                        : vd ,initialVdom)

            const observe = this.toObserve.map(x=>[
                x.ref.handler.urlOfRef(x.ref),
                x.includeChildren && `includeChildren=${x.includeChildren}`,
                x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`, x.delay && `delay=${x.delay}`] 
                .filter(x=>x).join(';')).join(',')
            const methods = (this.method||[]).map(h=>`${h.id}-${jb.ui.preserveCtx(h.ctx.setVars({cmp: this, $props: this.renderProps, ...this.newVars}))}`).join(',')
            const eventhandlers = (this.eventHandler||[]).map(h=>`${h.event}-${jb.ui.preserveCtx(h.ctx.setVars({cmp: this}))}`).join(',')
            const originators = this.originators.map(ctx=>jb.ui.preserveCtx(ctx)).join(',')
            const usereventprops = (this.userEventProps||[]).join(',')
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndLibs = (this.frontEndLib || [])
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(this.calcCtx))]))
            if (vdom instanceof jb.ui.VNode) {
                vdom.addClass(this.jbCssClass())
                vdom.attributes = Object.assign(vdom.attributes || {}, {
                        'jb-ctx': jb.ui.preserveCtx(this.originatingCtx()),
                        'cmp-id': this.cmpId, 
                        'cmp-ver': ''+this.ver,
                        'cmp-pt': this.ctx.profile.$,
                        'full-cmp-ctx': jb.ui.preserveCtx(this.calcCtx),
                    },
                    observe && {observe}, 
                    methods && {methods}, 
                    eventhandlers && {eventhandlers},
                    originators && {originators},
                    usereventprops && {usereventprops},
                    frontEndLibs.length && {$__frontEndLibs : JSON.stringify(frontEndLibs)},
                    frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                    frontEndMethods.length && {interactive : 'true'}, 
                    frontEndVars && { $__vars : JSON.stringify(frontEndVars)},
                    this.state && { $__state : JSON.stringify(this.state)},
                    this.ctxForPick && { 'pick-ctx': jb.ui.preserveCtx(this.ctxForPick) },
                )
            }
            jb.log('uiComp end renderVdom',{cmp: this, vdom})
            this.afterFirstRendering = true
            return vdom
        }
        renderVdomAndFollowUp() {
            const vdom = this.renderVdom()
            jb.delay(1).then(() => (this.followUpFuncs||[]).forEach(fu=> jb.utils.tryWrapper(() => { 
                jb.log(`backend uiComp followUp`, {cmp: this, fu, srcCtx: fu.srcCtx})
                fu.action(this.calcCtx)
                if (this.ver>1)
                    jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver-1}]})
            }, 'followUp',this.ctx) ) ).then(()=> this.ready = true)
            this.ready = false
            return vdom
        }
        hasBEMethod(method) {
            return (this.method||[]).filter(h=> h.id == method)[0]
        }
        runBEMethod(method, data, vars) {
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars})
            if (jb.path(vars,'$state'))
                Object.assign(this.state,vars.$state)
            const methodImpls = (this.method||[]).filter(h=> h.id == method)
            methodImpls.forEach(h=> jb.ui.runCtxAction(h.ctx,data,{cmp: this,$state: this.state, $props: this.renderProps, ...vars}))
            if (methodImpls.length == 0)
                jb.logError(`no method ${method} in cmp`, {cmp: this, data, vars})
        }
        refresh(state,options) {
            const elem = jb.ui.elemOfCmp(this.ctx,this.cmpId)
            jb.log('backend uiComp refresh request',{cmp: this,elem,state,options})
            jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver, destroyCtxs: [] }] })
            elem && jb.ui.refreshElem(elem,state,options) // cmpId may be deleted
        }
        calcCssLines() {
            return jb.utils.unique((this.css || []).map(l=> typeof l == 'function' ? l(this.calcCtx): l)
            .flatMap(css=>css.split(/}\s*/m)
                .map(x=>x.trim()).filter(x=>x)
                .map(x=>x+'}')
                .map(x=>x.replace(/^!/,' '))))
        }
        jbCssClass() {
            return jb.ui.hashCss(this.calcCssLines() ,this.ctx)
        }
        originatingCtx() {
            return this.originators[this.originators.length-1]
        }

        field() {
            if (this._field) return this._field
            const ctx = this.originatingCtx()
            this._field = {
                class: '',
                ctxId: jb.ui.preserveCtx(ctx),
                control: (item,index,noCache) => this.getOrCreateItemField(item, () => ctx.setData(item).setVars({index: (index||0)+1}).runItself(),noCache),
            }
            this.enrichField && this.enrichField.forEach(enrichField=>enrichField(this._field))
            let title = jb.tosingle(jb.val(ctx.params.title)) || (() => '');
            if (this._field.title !== undefined)
                title = this._field.title
            // make it always a function 
            this._field.title = typeof title == 'function' ? title : () => ''+title;
            this.itemfieldCache = new Map()
            return this._field
        }
        getOrCreateItemField(item,factory,noCache) {
            if (noCache)
                return factory()
            if (!this.itemfieldCache.get(item))
                this.itemfieldCache.set(item,factory())
            return this.itemfieldCache.get(item)
        }
        orig(ctx) {
            if (jb.comps[ctx.profile && ctx.profile.$].type.split(/,|-/).indexOf('control') == -1)
                debugger
            this.originators.push(ctx)
            return this
        }
        applyParamFeatures(ctx) {
            (ctx.params.features && ctx.params.features(ctx) || []).forEach(f => this.jbExtend(f,ctx))
            return this
        }

        jbExtend(_options,ctx) {
            if (!_options) return this;
            if (!ctx) debugger
            ctx = ctx || this.ctx;
            if (!ctx)
                console.logError('uiComp: no ctx provided for jbExtend',{_options,ctx})
            if (typeof _options != 'object')
                console.logError('uiComp: _options should be an object',{_options,ctx})
            const options = _options.$ ? ctx.run(_options) : _options
            if (Array.isArray(options)) {
                options.forEach(o=>this.jbExtend(o,ctx))
                return this
            }

            if (options.afterViewInit) 
                options.frontEnd = options.afterViewInit
            if (typeof options.class == 'string') 
                options.templateModifier = vdom => vdom.addClass(options.class)

            Object.keys(options).forEach(key=>{
                if (typeof options[key] == 'function')
                    Object.defineProperty(options[key], 'name', { value: key })

                if (jb.ui.lifeCycle.has(key)) {
                    this[key+'Funcs'] = this[key+'Funcs'] || []
                    this[key+'Funcs'].push(options[key])
                }
                if (jb.ui.arrayProps.has(key)) {
                    this[key] = this[key] || []
                    this[key].push(options[key])
                }
                if (jb.ui.singular.has(key))
                    this[key] = this[key] || options[key]
            })
            if (options.watchRef) {
                this.watchRef = this.watchRef || []
                this.watchRef.push({cmp: this,...options.watchRef});
            }

            // eventObservables
            this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

            jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
            jb.asArray(jb.ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f), ctx))
            return this;
        }
    }
})

jb.extension('jstypes', {
    renderable(value) {
        if (value == null) return '';
        if (value instanceof jb.ui.VNode) return value;
        if (value instanceof jb.ui.JbComponent) return jb.ui.h(value)
        if (Array.isArray(value))
            return jb.ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
        return '' + jb.val(value,true);
    }
});

jb.extension('ui', {
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger
        // block the preview from stealing the studio focus
        const now = new Date().getTime()
        const lastStudioActivity = jb.studio.lastStudioActivity 
          || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity'])

        jb.log('focus request',{srcCtx, logTxt, timeDiff: now - lastStudioActivity, elem,srcCtx})
        if (jb.studio.previewjb == jb && jb.path(jb.ui.parentFrameJb(),'resources.studio.project') != 'studio-helper' && lastStudioActivity && now - lastStudioActivity < 1000)
            return
        jb.log('focus dom',{elem,srcCtx,logTxt})
        jb.delay(1).then(() => elem.focus())
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ''+ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    parentFrameJb() {
      try {
        return jb.frame.parent && jb.frame.parent.jb
      } catch(e) {}
    },
    inPreview: () => !jb.ui.inStudio() && jb.ui.parentFrameJb() && jb.ui.parentFrameJb().studio.initPreview,
    previewOverlayDocument: ctx => (jb.path(ctx.frame(),'document.body') || jb.path(ctx.frame(),'parent.document.body')).ownerDocument,
    widgetBody(ctx) {
      const {elemToTest,previewOverlay,tstWidgetId,headlessWidget,FEwidgetId, headlessWidgetId} = ctx.vars
      const top = elemToTest ||
        previewOverlay && jb.path(this.previewOverlayDocument(ctx),'body') ||
        tstWidgetId && jb.path(jb.ui.headless[tstWidgetId],'body') ||
        headlessWidget && jb.path(jb.ui.headless[headlessWidgetId],'body') ||
        jb.path(ctx.frame().document,'body')
      return FEwidgetId ? jb.ui.findIncludeSelf(top,`[widgetid="${FEwidgetId}"]`)[0] : top
    },
    ctxOfElem: (elem,att) => elem && elem.getAttribute && jb.ctxDictionary[elem.getAttribute(att || 'jb-ctx')],
    parentCmps: el => jb.ui.parents(el).map(el=>el._component).filter(x=>x),
    closestCmpElem: elem => jb.ui.parents(elem,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('cmp-id') != null),
    headlessWidgetId: elem => jb.ui.parents(elem,{includeSelf: true})
        .filter(el=>el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('headless'))
        .map(el=>el.getAttribute('widgetid'))[0],
    frontendWidgetId: elem => jb.ui.parents(elem,{includeSelf: true})
        .filter(el=>el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('frontend'))
        .map(el=>el.getAttribute('widgetid'))[0],
    elemOfCmp: (ctx,cmpId) => jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx),`[cmp-id="${cmpId}"]`)[0],
    fromEvent: (cmp,event,elem,options) => jb.callbag.pipe(
          jb.callbag.fromEvent(event, elem || cmp.base, options),
          jb.callbag.takeUntil(cmp.destroyed)
    ),
    renderWidget(profile,topElem,ctx) {
      if (!jb.ui.renderWidgetInStudio && jb.path(jb.ui.parentFrameJb(),'ui.renderWidgetInStudio'))
        eval('jb.ui.renderWidgetInStudio= ' + jb.ui.parentFrameJb().ui.renderWidgetInStudio.toString())
      if (jb.frame.parent != jb.frame && jb.ui.renderWidgetInStudio)
        return jb.ui.renderWidgetInStudio(profile,topElem)
      else
        return jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry(ctx).run(profile)),topElem)    
    },
    extendWithServiceRegistry(_ctx) {
      const ctx = _ctx || new jb.core.jbCtx()
      return ctx.setVar('$serviceRegistry',{baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {}})
    },
    //cmpV: cmp => cmp ? `${cmp.cmpId};${cmp.ver}` : '',
    rxPipeName: profile => (jb.path(profile,'0.event') || jb.path(profile,'0.$') || '') + '...'+jb.path(profile,'length')
})

// ***************** inter-cmp services

var { feature, action } = jb.ns('feature')

jb.component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

jb.component('service.registerBackEndService', {
  type: 'data',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true },
    {id: 'service', mandatory: true, dynamic: true },
    {id: 'allowOverride', as: 'boolean' },
  ],
  impl: feature.init((ctx,{$serviceRegistry},{id,service,allowOverride}) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('register service',{id: _id, service: _service, ctx: ctx.cmpCtx})
    if ($serviceRegistry.services[_id] && !allowOverride)
      jb.logError('overridingService ${_id}',{id: _id, service: $serviceRegistry.services[_id], service: _service,ctx})
    $serviceRegistry.services[_id] = _service
  })
  // feature.initValue({to: '%$$serviceRegistry/services/{%$id()%}%', value: '%$service()%', alsoWhenNotEmpty: true}),
})


// ****************** html utils ***************
jb.extension('ui', {
    outerWidth(el) {
        const style = getComputedStyle(el)
        return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight)
    },
    outerHeight(el) {
        const style = getComputedStyle(el)
        return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
    },
    offset: el => el.getBoundingClientRect(),
    parents(el,{includeSelf} = {}) {
        const res = []
        el = includeSelf ? el : el && el.parentNode
        while(el) {
          res.push(el)
          el = el.parentNode
        }
        return res
    },
    closest(el,query) {
        while(el) {
          if (jb.ui.matches(el,query)) return el
          el = el.parentNode
        }
    },
    activeElement: () => document.activeElement,
    find(el,selector,options) {
      if (!el) return []
      if (jb.path(el,'constructor.name') == 'jbCtx')
          el = jb.ui.widgetBody(el)
      if (!el) return []
      return el instanceof jb.ui.VNode ? el.querySelectorAll(selector,options) :
          [... (options && options.includeSelf && jb.ui.matches(el,selector) ? [el] : []),
            ...Array.from(el.querySelectorAll(selector))]
    },
    findIncludeSelf: (el,selector) => jb.ui.find(el,selector,{includeSelf: true}),
    addClass: (el,clz) => el && el.classList && el.classList.add(clz),
    removeClass: (el,clz) => el && el.classList && el.classList.remove(clz),
    hasClass: (el,clz) => el && el.classList && el.classList.contains(clz),
    matches: (el,query) => el && el.matches && el.matches(query),
    indexOfElement: el => Array.from(el.parentNode.children).indexOf(el),
    limitStringLength: (str,maxLength) => 
      (typeof str == 'string' && str.length > maxLength-3) ? str.substring(0,maxLength) + '...' : str,
    addHTML(el,html) {
        const elem = document.createElement('div')
        elem.innerHTML = html
        el.appendChild(elem.firstChild)
    },
    addStyleElem(ctx,innerHtml,widgetId) {
      if (widgetId && !ctx.vars.previewOverlay) {
        jb.ui.renderingUpdates.next({widgetId, css: innerHtml})
      } else {
        const style_elem = document.createElement('style')
        style_elem.innerHTML = innerHtml
        this.previewOverlayDocument(ctx).head.appendChild(style_elem)
        return style_elem
      }
    },
    valueOfCssVar(varName,parent) {
      parent = parent || document.body
      if (!parent) {
        jb.logError('valueOfCssVar: no parent')
        return 'red'
      }
      el = parent.ownerDocument.createElement('div')
      el.style.display = 'none'
      el.style.color = `var(--${varName})`
      parent.appendChild(el)
      const ret = getComputedStyle(el).color
      parent.removeChild(el)
      return ret
    }
})

// ****************** components ****************

jb.component('action.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true },
    {id: 'cmpId', as: 'string', mandatory: true },
    {id: 'assumedVdom' },
  ],
  impl: (ctx,delta,cmpId,assumedVdom) => jb.ui.applyDeltaToCmp({ctx,delta,cmpId,assumedVdom})
})

jb.component('sink.applyDeltaToCmp', {
  type: 'rx',
  params: [
    {id: 'delta', dynamic: true, mandatory: true},
    {id: 'cmpId', as: 'string', mandatory: true },
  ],
  impl: sink.action(action.applyDeltaToCmp('%$delta()%','%$cmpId%'))
})

jb.component('action.focusOnCmp', {
  description: 'runs both in FE and BE',
  type: 'action',
  params: [
    {id: 'description', as: 'string'},
    {id: 'cmpId', as: 'string', defaultValue: '%$cmp/cmpId%' },
  ],
  impl: (ctx,desc,cmpId) => {
    const frontEndElem = jb.path(ctx.vars.cmp,'base')
    if (frontEndElem) {
      jb.log('frontend focus on cmp',{frontEndElem,ctx,desc,cmpId})
      return jb.ui.focus(frontEndElem,desc,ctx)
    } else {
      jb.log('backend focus on cmp',{frontEndElem,ctx,desc,cmpId})
      const delta = {attributes: {$focus: desc}}
      jb.ui.applyDeltaToCmp({delta,ctx,cmpId})
    }
  }
})

jb.component('customStyle', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:10',
  params: [
    {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true},
    {id: 'css', as: 'string'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: (ctx,css,features) => ({
          template: ctx.profile.template,
          css: css,
          featuresOptions: features(),
          styleParams: ctx.cmpCtx.params
    })
})

jb.component('styleByControl', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx,control,modelVar) => control(ctx.setVar(modelVar,ctx.vars.$model))
})

jb.component('styleWithFeatures', {
  typePattern: t => /\.style$/.test(t),
  description: 'customize, add more features to style',
  category: 'advanced:10,all:20',
  params: [
    {id: 'style', type: '$asParent', mandatory: true, composite: true},
    {id: 'features', type: 'feature[]', templateValue: [], dynamic: true, mandatory: true}
  ],
  impl: (ctx,style,features) => {
    if (style instanceof jb.ui.JbComponent)
      return style.jbExtend(features(),ctx)
    return style && {...style,featuresOptions: (style.featuresOptions || []).concat(features())}
  }
})

jb.component('controlWithFeatures', {
  type: 'control',
  description: 'customize, add more features to control',
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true},
    {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
  ],
  impl: (ctx,control,features) => control.jbExtend(features,ctx).orig(ctx)
})

// widely used
var { customStyle, styleByControl, styleWithFeatures, controlWithFeatures } = jb.macro
;

jb.extension('ui', 'frontend', {
    refreshFrontEnd(elem) {
        jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component ? el._component.newVDomApplied() : jb.ui.mountFrontEnd(el))
    },
    mountFrontEnd(elem, keepState) {
        new jb.ui.frontEndCmp(elem, keepState)
    },
    frontEndCmp: class frontEndCmp {
        constructor(elem, keepState) {
            this.ctx = jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.core.jbCtx()
            this.state = { ...elem.state, ...(keepState && jb.path(elem._component,'state')), frontEndStatus: 'initializing' }
            this.base = elem
            this.cmpId = elem.getAttribute('cmp-id')
            this.ver= elem.getAttribute('cmp-ver')
            this.pt = elem.getAttribute('cmp-pt')
            this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
            this.flows= []
            elem._component = this
            this.runFEMethod('calcProps',null,null,true)
            this.runFEMethod('init',null,null,true)
            ;(elem.getAttribute('eventhandlers') || '').split(',').forEach(h=>{
                const [event,ctxId] = h.split('-')
                elem.addEventListener(event, ev => jb.ui.handleCmpEvent(ev,ctxId))
            })
            this.state.frontEndStatus = 'ready'
        }
        runFEMethod(method,data,_vars,silent) {
            if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
                return jb.logError('frontEnd - running method before init', {cmp: {...this}, method,data,_vars})
            const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method)
            if (toRun.length == 0 && !silent)
                return jb.logError(`frontEnd - no method ${method}`,{cmp: {...this}})
            toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
                const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
                const srcCtx = new jb.core.jbCtx(this.ctx, { profile, path, forcePath: path })
                const feMEthod = jb.core.run(srcCtx)
                const el = this.base
                const vars = {cmp: this, $state: this.state, el, ...this.base.vars, ..._vars }
                const ctxToUse = this.ctx.setData(data).setVars(vars)
                const {_prop, _flow } = feMEthod.frontEndMethod
                if (_prop)
                    jb.log(`frontend uiComp calc prop ${_prop}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
                else if (_flow)
                    jb.log(`frontend uiComp start flow ${jb.ui.rxPipeName(_flow)}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
                else 
                    jb.log(`frontend uiComp run method ${method}`,{cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
                const res = ctxToUse.run(feMEthod.frontEndMethod.action)
                if (_flow) this.flows.push(res)
            }, `frontEnd-${method}`,this.ctx))
        }
        enrichUserEvent(ev, userEvent) {
            (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => jb.utils.tryWrapper(() => {
                const actionPath = path+'~action'
                const profile = actionPath.split('~').reduce((o,p)=>o[p],jb.comps)
                const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
                Object.assign(userEvent, jb.core.run( new jb.core.jbCtx(this.ctx, { vars, profile, path: actionPath })))
            }, 'enrichUserEvent',this.ctx))
        }
        refresh(state, options) {
            jb.log('frontend uiComp refresh request',{cmp: {...this} , state, options})
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            ui.refreshElem(this.base,this.state,options)
        }
        refreshFE(state) {
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            this.runFEMethod('onRefresh',null,null,true)
        }    
        newVDomApplied() {
            Object.assign(this.state,{...this.base.state}) // update state from BE
            this.ver= this.base.getAttribute('cmp-ver')
            this.runFEMethod('onRefresh',null,null,true)
        }
        destroyFE() {
            this._deleted = true
            this.flows.forEach(flow=>flow.dispose())
            this.runFEMethod('destroy',null,null,true)
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
        }
    }
})

;

jb.extension('ui', 'watchRef', {
    initExtension() {
        // subscribe for watchable change
        const resourcesHanlder = jb.db.watchableHandlers.find(x=>x.resources.id == 'resources')
        resourcesHanlder && jb.ui.subscribeToRefChange(resourcesHanlder)
        // jb.watchable.WatchableValueByRef() - for loader
    },
    subscribeToRefChange: watchHandler => jb.utils.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const body = !jb.frame.document || jb.path(e,'srcCtx.vars.headlessWidgetId') || jb.path(e,'srcCtx.vars.testID') ? jb.ui.widgetBody(e.srcCtx) : jb.frame.document.body
        const elemsToCheck = jb.ui.find(body,'[observe]') // top down order
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        const originatingCmpId = jb.path(e.srcCtx, 'vars.cmp.cmpId')
        jb.log('refresh check observable elements',{originatingCmpId,elemsToCheck,e,srcCtx:e.srcCtx})
        elemsToCheck.forEach((elem,i) => {
            const cmpId = elem.getAttribute('cmp-id')
            if (!jb.ui.parents(elem).find(el=>el == body))
                return jb.log('observable elem was detached in refresh process',{originatingCmpId,cmpId,elem})
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) 
                return jb.log('observable elem was refreshed from top in refresh process',{originatingCmpId,cmpId,elem})
            let refresh = false, strongRefresh = false, cssOnly = true, delay = 0
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${originatingCmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',{cmpId,originatingCmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',{originatingCmpId,cmpId,obs,e})
                strongRefresh = strongRefresh || obs.strongRefresh
                delay = delay || obs.delay
                cssOnly = cssOnly && obs.cssOnly
                const diff = jb.utils.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure)
                    refresh = true
            })
            if (refresh) {
                jb.log('refresh from observable elements',{cmpId,originatingCmpId,elem,ctx: e.srcCtx,e})
                if (delay) 
                    jb.delay(delay).then(()=> jb.ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly}))
                else
                    jb.ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
            }
        })

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const delay = +((parts[1].match(/delay=([0-9]+)/) || ['',''])[1])
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh, cssOnly, allowSelfRefresh, delay }
        }
    })
});


var { variable,watchable,followUp,backEnd,method,features,onDestroy,htmlAttribute,templateModifier,watchAndCalcModelProp,calcProp,watchRef } 
  = jb.ns('variable,watchable,followUp,backEnd,method,htmlAttribute,features,onDestroy,templateModifier,watchAndCalcModelProp,calcProp,watchRef,group')

jb.component('method', {
  type: 'feature',
  description: 'define backend event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'to be used in html, e.g. onclick=\"myMethod\" '},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({method: {id, ctx}})
})

jb.component('feature.onEvent', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,event) => ({eventHandler: {event, ctx}})
})

jb.component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'defaultValue' },
  ],
  impl: ctx => ({watchAndCalcModelProp: ctx.params})
})

jb.component('calcProp', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
    {id: 'defaultValue' },
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.ui.propCounter++}})
})

jb.component('userStateProp', {
  type: 'feature',
  description: 'define a user state (e.g., selection) that is passed to the FE and back to the BE via refresh calls. The first calculation is done at the BE and then the FE can change it',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, userStateProp: true, index: jb.ui.propCounter++}})
})

jb.component('calcProps', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({
      calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.ui.propCounter++ }
    })
})

jb.component('feature.initValue', {
  type: 'feature',
  category: 'lifecycle',
  description: 'set value if the value is empty, activated before calc properties',
  params: [
    {id: 'to', as: 'ref', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'alsoWhenNotEmpty', as: 'boolean'}
  ],
  impl: (ctx,_to,_value,alsoWhenNotEmpty) => ({ init: { 
    action: (_ctx,{cmp}) => {
      const value = _value(_ctx), to = _to(_ctx)
      const toAssign = jb.val(value), currentVal = jb.val(to)
      if ((alsoWhenNotEmpty || currentVal == null) && toAssign !== currentVal) {
        jb.log('init value',{cmp, ...ctx.params})
        jb.db.writeValue(to,toAssign,ctx,true)
      } else if (toAssign !== currentVal) {
        jb.logError(`feature.initValue: init non empty value ${jb.utils.prettyPrint(to.profile)}`,{toAssign,currentVal,cmp,ctx,to,value})
      }
    }, 
    phase: 10 
  }})
})

jb.component('feature.requireService',{
  params: [
    {id: 'service', type: 'service'},
    {id: 'condition', dynamic: true, defaultValue: true},
  ],
  impl: (_ctx,service,condition) => ({ init: { 
    action: ctx => condition(ctx) && service.init(ctx),
    phase: 10 
  }})
})

jb.component('feature.init', {
  type: 'feature:0',
  category: 'lifecycle',
  description: 'activated before calc properties, use initValue or require instead',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: ({},action,phase) => ({ init: { action, phase }})
})

jb.component('onDestroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('destroy', '%$action()%')
})

jb.component('templateModifier', {
  type: 'feature',
  description: 'change the html template',
  params: [
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,value) => ({ templateModifier: (vdom,cmp) => value(cmp.calcCtx.setVars({vdom, ...cmp.renderProps })) })
})

jb.component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params })
})

jb.component('features', {
  type: 'feature',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('followUp.action', {
  type: 'feature',
  description: 'runs at the backend a tick after the vdom was returned. Try to avoid it, use initValue or require instead',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ followUp: { action: ctx2 => ctx.params.action(ctx2), srcCtx: ctx } })
})

jb.component('followUp.flow', {
  type: 'feature',
  description: 'rx flow at the backend after the vdom was sent. Try to avoid it, use watchRef instead',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: followUp.action(
    runActions(
      Var('followUpCmp', '%$cmp%'),
      Var('pipeToRun', rx.pipe('%$elems()%')),
      (ctx,{cmp,pipeToRun}) => {
        jb.ui.followUps[cmp.cmpId] = jb.ui.followUps[cmp.cmpId] || []
        jb.ui.followUps[cmp.cmpId].push({cmp, pipe: pipeToRun, srcPath: ctx.cmpCtx.callerPath})
      },
    )
  )
})

jb.component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'},
    {id: 'delay', as: 'number', description: 'delay in activation, can be used to set priority'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}}),
  dependencies: () => jb.ui.subscribeToRefChange()
})

jb.component('followUp.watchObservable', {
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', description: 'in mSec'}
  ],
  impl: followUp.flow(
    source.data(0),
    rx.var('cmp', '%$cmp%'),
    rx.flatMap('%$toWatch()%'),
    rx.debounceTime('%$debounceTime%'),
    sink.refreshCmp()
  )
})

jb.component('followUp.onDataChange', {
  type: 'feature',
  category: 'watch',
  description: 'watch observable data reference, subscribe and run action',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'action', type: 'action', dynamic: true, description: 'run on change'}
  ],
  impl: followUp.flow(source.watchableData('%$ref()%', '%$includeChildren%'), sink.action(call('action')))
})

jb.component('group.data', {
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'data', mandatory: true, dynamic: true, as: 'ref'},
    {id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable'},
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'}
  ],
  impl: ({}, refF, itemVariable,watch,includeChildren) => ({
      ...(watch ? {watchRef: { refF, includeChildren }} : {}),
      extendCtx: ctx => {
          const ref = refF()
          return ctx.setData(ref).setVar(itemVariable,ref)
      },
  })
})

jb.component('htmlAttribute', {
  type: 'feature',
  description: 'set attribute to html element and give it value',
  params: [
    {id: 'attribute', mandatory: true, as: 'string'},
    {id: 'value', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,id,value) => ({
    templateModifier: (vdom,cmp) => vdom.setAttribute(id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, value(cmp.ctx))
  })
})

jb.component('id', {
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: htmlAttribute('id', '%$id()%')
})

jb.component('feature.hoverTitle', {
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute('title', '%$title%')
})

jb.component('watchable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a watchable variable',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
  ],
  impl: ({}, name, value) => ({
    destroy: cmp => {
      const fullName = name + ':' + cmp.ctx.id;
      cmp.ctx.run(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      const fullName = name + ':' + cmp.ctx.id;
      jb.log('create watchable var',{cmp,ctx,fullName})
      const refToResource = jb.db.useResourcesHandler(h=>h.refOfPath([fullName]))
      jb.db.writeValue(refToResource,value(ctx),ctx)
      return ctx.setVar(name, refToResource);
    }
  }),
  dependencies: () => jb.ui.subscribeToRefChange()
})

jb.component('variable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a constant passive variable',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
  ],
  impl: ({}, name, value) => ({ extendCtx: ctx => ctx.setVar(name,jb.val(value(ctx))) })
})

jb.component('calculatedVar', {
  type: 'feature',
  category: 'general:60',
  description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchRefs', as: 'array', dynamic: true, mandatory: true, defaultValue: [], description: 'variable to watch. needs to be in array'}
  ],
  impl: features(
    onDestroy(writeValue('%${%$name%}:{%$cmp/cmpId%}%', null)),
    followUp.flow(
      rx.merge((ctx,{},{watchRefs}) => watchRefs(ctx).map(ref=>ctx.setData(ref).run(source.watchableData('%%')) )),
      rx.log('check calculatedVar'),
      rx.map('%$value()%'),
      sink.data('%${%$name%}:{%$cmp/cmpId%}%')
    ),
    ctx => ({
      extendCtx: (_ctx,cmp) => {
        const {name,value} = ctx.cmpCtx.params
        const fullName = name + ':' + cmp.cmpId;
        jb.log('create watchable calculatedVar',{ctx,cmp,fullName})
        jb.db.resource(fullName, jb.val(value(_ctx)));
        const ref = _ctx.exp(`%$${fullName}%`,'ref')
        return _ctx.setVar(name, ref);
      }
    })
  )
})

jb.component('feature.if', {
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'}
  ],
  impl: (ctx, condition) => ({
    templateModifier: (vdom,cmp) =>
      jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature',
  category: 'feature:85',
  description: 'display:none on element. keywords: show',
  params: [
    {id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp) => {
      jb.path(vdom,'attributes.style.display',jb.toboolean(showCondition(cmp.ctx)) ? 'inherit' : 'none')
      return vdom
    }
  })
})

jb.component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'}
  ],
  impl: (ctx,id) => {
    const elem = jb.ui.widgetBody(ctx).querySelector('#'+id)
    if (!elem)
      return jb.logError('refreshControlById can not find elem for #'+id, {ctx})
    return jb.ui.refreshElem(elem,null,{srcCtx: ctx, ...ctx.params})
  }
})

jb.component('group.autoFocusOnFirstInput', {
  type: 'feature',
  impl: templateModifier(({},{vdom}) => {
    const elem = vdom.querySelectorAll('input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
    if (elem)
      elem.setAttribute('$focus','autoFocusOnFirstInput')
    return vdom
  })
})

jb.component('refreshIfNotWatchable', {
  type: 'action',
  params: [
    {id: 'data'}
  ],
  impl: (ctx, data) => !jb.db.isWatchable(data) && ctx.vars.cmp.refresh(null,{strongRefresh: true})
})

jb.component('feature.byCondition', {
  type: 'feature',
  description: 'conditional feature, define feature if then else condition',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'feature', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'feature', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
})

jb.component('feature.userEventProps', {
  type: 'feature',
  description: 'add data to the event sent from the front end',
  params: [
    {id: 'props', as: 'string', description: 'comma separated props to take from the original event e.g., altKey,ctrlKey'}
  ],
  impl: (ctx, prop) => ({userEventProps: prop })
})
;

var { rx,key,frontEnd,sink,service, replace } = jb.ns('rx,key,frontEnd,sink,service')

jb.component('action.runBEMethod', {
    type: 'action',
    description: 'can be activated on both FE & BE, assuming $cmp variable',
    macroByValue: true,
    params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'vars', dynamic: true },
    ],
    impl: (ctx,method,data,vars) => jb.ui.runBEMethodInAnyContext(ctx,method(),data(),vars())
})

jb.component('action.runFEMethod', {
  type: 'action',
  description: 'cab be activated in frontEnd only with $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true },
    {id: 'data', defaultValue: '%%', dynamic: true },
    {id: 'vars', dynamic: true },
  ],
  impl: (ctx,method,data,vars) => ctx.vars.cmp && ctx.vars.cmp.runFEMethod(method(),data(),vars())
})

jb.component('sink.BEMethod', {
    type: 'rx',
    category: 'sink',
    macroByValue: true,
    params: [
        {id: 'method', as: 'string', dynamic: true },
        {id: 'data', defaultValue: ({data}) => data instanceof Event ? null : data, dynamic: true },
        {id: 'vars', dynamic: true },
    ],
    impl: sink.action((ctx,{},{method,data,vars}) => jb.ui.runBEMethodInAnyContext(ctx,method(ctx),data(ctx),vars(ctx)))
})

jb.component('sink.FEMethod', {
  type: 'rx',
  category: 'sink',
  macroByValue: true,
  params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'vars', dynamic: true },
  ],
  impl: sink.action((ctx,{cmp},{method,data,vars}) => cmp && cmp.runFEMethod(method(ctx),data(ctx),vars(ctx)))
})

jb.component('action.refreshCmp', {
  type: 'action',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true },
    {id: 'options', dynamic: true },
  ],
  impl: (ctx,stateF,optionsF) => {
    const cmp = ctx.vars.cmp, options = optionsF(ctx), state = stateF(ctx)
    jb.log('refresh uiComp',{cmp,ctx,state,options})
    cmp && cmp.refresh(state,{srcCtx: ctx, ...options})
  }
})

jb.component('sink.refreshCmp', {
  type: 'rx',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true },
    {id: 'options', dynamic: true },
  ],
  impl: sink.action(action.refreshCmp('%$state()%','%$options()%'))
})

jb.component('frontEnd.method', {
    type: 'feature',
    category: 'front-end',
    description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
    params: [
        {id: 'method', as: 'string' },
        {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,method,action) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.requireExternalLibrary', {
  type: 'feature',
  category: 'front-end',
  description: 'url or name of external library in dist path, js or css',
  params: [
      {id: 'libs', as: 'array' },
  ],
  impl: ({},libs) => libs.map(frontEndLib =>({ frontEndLib }))
})


jb.component('frontEnd.enrichUserEvent', {
  type: 'feature',
  category: 'front-end',
  description: 'the result is assigned to userEvent, can use %$cmp%, %$ev%, %$userEvent%',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'enrichUserEvent', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.onRefresh', {
  type: 'feature',
  category: 'front-end',
  description: 'rerun on frontend when after refresh is activated',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'onRefresh', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.init', {
    type: 'feature',
    category: 'front-end',
    description: 'initializes the front end, mount, component did update. runs after props',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.prop', {
    type: 'feature',
    category: 'front-end',
    description: 'assign front end property (calculated using the limited FE context). runs before init',
    params: [
      {id: 'id', as: 'string', mandatory: true },
      {id: 'value', mandatory: true, dynamic: true}
    ],
    impl: (ctx,id,value) => ({ frontEndMethod: { method: 'calcProps', path: ctx.path, _prop: id,
      action: (_ctx,{cmp}) => cmp[id] = value(_ctx) } })
})

jb.component('frontEnd.onDestroy', {
    type: 'feature',
    description: 'destructs the front end',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'destroy', path: ctx.path, action: action.profile } })
})

jb.component('source.frontEndEvent', {
    type: 'rx',
    category: 'source',
    description: 'assumes cmp in context',
    params: [
        {id: 'event', as: 'string', options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    ],
    impl: //source.event('%$event%','%$cmp.base%')
    rx.pipe(source.event('%$event%','%$cmp.base%'), rx.takeUntil('%$cmp.destroyed%'))
})

jb.component('frontEnd.addUserEvent', {
  type: 'rx',
  impl: rx.var('ev', ({data}) => jb.ui.buildUserEvent(data, jb.ui.closestCmpElem(data.currentTarget || data.target))),
})

jb.component('frontEnd.flow', {
    type: 'feature',
    category: 'front-end',
    description: 'rx flow at front end',
    params: [
        {id: 'elems', type: 'rx[]', as: 'array', dynamic: true, mandatory: true, templateValue: []}
    ],
    impl: (ctx, elems) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, _flow: elems.profile,
      action: { $: 'rx.pipe', elems: _ctx => elems(_ctx) }
    }})
})

jb.component('feature.onHover', {
    type: 'feature',
    description: 'on mouse enter',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
      {id: 'onLeave', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method('onHover','%$action()%'),
        method('onLeave','%$onLeave()%'),
        frontEnd.flow(source.frontEndEvent('mouseenter'), sink.BEMethod('onHover')),
        frontEnd.flow(source.frontEndEvent('mouseleave'), sink.BEMethod('onLeave'))
    )
})
  
jb.component('feature.classOnHover', {
    type: 'feature',
    description: 'set css class on mouse enter',
    category: 'events',
    params: [
      {id: 'clz', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
    ],
    impl: features(
        frontEnd.flow(source.frontEndEvent('mouseenter'), sink.action(({},{cmp},{clz}) => jb.ui.addClass(cmp.base,clz))),
        frontEnd.flow(source.frontEndEvent('mouseleave'), sink.action(({},{cmp},{clz}) => jb.ui.removeClass(cmp.base,clz))),
    )
})

jb.component('key.eventMatchKey', {
    type: 'boolean',
    params: [
        {id: 'event'},
        {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V' },
    ],
    impl: (ctx, e, key) => {
      jb.log('keyboard search eventMatchKey',{e,key})
      if (!key) return;
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
    
      key = key.replace(/-/,'+');
      const keyWithoutPrefix = key.split('+').pop()
      let keyCode = dict[keyWithoutPrefix.toLowerCase()]
      if (+keyWithoutPrefix)
        keyCode = +keyWithoutPrefix
      if (keyWithoutPrefix.length == 1)
        keyCode = keyWithoutPrefix.charCodeAt(0)
    
      if (key.match(/^[Cc]trl/) && !e.ctrlKey) return
      if (key.match(/^[Aa]lt/) && !e.altKey) return
      jb.log(`keyboard ${e.keyCode == keyCode ? 'found': 'notFound'} eventMatchKey`,{e,key,eventKey: e.keyCode,keyCode})
      return e.keyCode == keyCode
  }
})

jb.component('key.eventToMethod', {
  type: 'boolean',
  params: [
      {id: 'event'},
      {id: 'elem' },
  ],
  impl: (ctx, event, elem) => {
    elem.keysHash = elem.keysHash || calcKeysHash()
        
    jb.log('keyboard search eventToMethod',{elem,event})
    const res = elem.keysHash.find(key=>key.keyCode == event.keyCode && event.ctrlKey == key.ctrl && event.altKey == key.alt)
    const resMethod = res && res.methodName
    jb.log(`keyboard ${res ? 'found': 'notFound'} eventToMethod`,{resMethod,elem,event})
    return resMethod

    function calcKeysHash() {
      const keys = elem.getAttribute('methods').split(',').map(x=>x.split('-')[0])
      .filter(x=>x.indexOf('onKey') == 0).map(x=>x.slice(5).slice(0,-7))
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
  
      return keys.map(_key=>{
        const key = _key.replace(/-/,'+');
        const keyWithoutPrefix = key.split('+').pop()
        let keyCode = dict[keyWithoutPrefix.toLowerCase()]
        if (+keyWithoutPrefix)
          keyCode = +keyWithoutPrefix
        if (keyWithoutPrefix.length == 1)
          keyCode = keyWithoutPrefix.charCodeAt(0)
        return { keyCode, ctrl: !!key.match(/^[Cc]trl/), alt: !!key.match(/^[Aa]lt/), methodName: `onKey${_key}Handler` }
      })
    }
}
})

jb.component('feature.onKey', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
        frontEnd.init((ctx,{cmp,el}) => {
          if (! cmp.hasOnKeyHanlder) {
            cmp.hasOnKeyHanlder = true
            ctx.run(rx.pipe(source.frontEndEvent('keydown'), frontEnd.addUserEvent(), 
              rx.map(key.eventToMethod('%%',el)), rx.filter('%%'), rx.log('keyboard uiComp onKey %$key%'), sink.BEMethod('%%')))
          }
      })
    )
})

jb.component('feature.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true},
  ],
  impl: features(
    method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.run(rx.pipe(
          source.frontEndEvent('keydown'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

jb.component('feature.globalKeyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true},
  ],
  impl: features(
    method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.run(rx.pipe(
          source.event('keydown','%$cmp.base.ownerDocument%'), 
          rx.takeUntil('%$cmp.destroyed%'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

jb.component('feature.onEnter', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Enter', call('action'))
})
  
jb.component('feature.onEsc', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Esc',call('action'))
})

jb.component('frontEnd.selectionKeySourceService', {
  type: 'feature',
  description: 'assign cmp.selectionKeySource with observable for meta-keys, also stops propagation !!!',
  params: [
    {id: 'autoFocs', as: 'boolean' },
  ],
  impl: features(
    service.registerBackEndService({
      id: 'selectionKeySource',
      service: obj(prop('cmpId', '%$cmp/cmpId%')), 
      allowOverride: true 
    }),
    frontEnd.var('autoFocs','%$autoFocs%'),
    frontEnd.prop('selectionKeySource', (ctx,{cmp,el,autoFocs}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          console.log('key source',e)
          el.keydown_src.next(ctx.dataObj(e))
          return false // stop propagation
        }
        return true
      }
      if (autoFocs)
        jb.ui.focus(el,'selectionKeySource')
      jb.log('register selectionKeySource',{cmp,cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
  )
})

jb.component('frontEnd.passSelectionKeySource', {
  type: 'feature',
  impl: frontEnd.var('selectionKeySourceCmpId', '%$$serviceRegistry/services/selectionKeySource/cmpId%')
})

jb.component('source.findSelectionKeySource', {
  type: 'rx',
  category: 'source',
  description: 'used in front end, works with "selectionKeySourceService" and "passSelectionKeySource"',
  impl: rx.pipe(
    Var('clientCmp','%$cmp%'),
    rx.merge( 
      source.data([]),
      (ctx,{cmp,selectionKeySourceCmpId}) => {
        jb.log('keyboard search selectionKeySource',{cmp,selectionKeySourceCmpId,ctx})
        const el = jb.ui.elemOfCmp(ctx,selectionKeySourceCmpId)
        const ret = jb.path(el, '_component.selectionKeySource')
        if (!ret)
          jb.log('keyboard selectionKeySource notFound',{cmp,selectionKeySourceCmpId,el,ctx})
        else
          jb.log('keyboard found selectionKeySource',{cmp,el,selectionKeySourceCmpId,ctx})
        return ret
      }
    ),
    rx.takeUntil('%$clientCmp.destroyed%'),
    rx.var('cmp','%$clientCmp%'),
    rx.log('keyboard from selectionKeySource')
  )
})
;

var { css } = jb.ns('css')

jb.component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: _ctx => jb.ui.fixCssLine(css(_ctx))})
})

jb.component('css.class', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({class: clz})
})

jb.component('css.width', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${jb.ui.withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'height', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${jb.ui.withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.opacity', {
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

jb.component('css.padding', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != '')
      .map(x=> `padding-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em, -20'},
    {id: 'left', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.marginAllSides', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'value', as: 'string', mandatory: true, description: 'e.g. 20, 20%, 0.4em'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,value,selector) => ({css: `${selector} margin: ${jb.ui.withUnits(value)}`})
})

jb.component('css.marginVerticalHorizontal', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'vertical', as: 'string', mandatory: true},
    {id: 'horizontal', as: 'string', mandatory: true},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,vertical,horizontal,selector) =>
    ({css: `${selector} margin: ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(horizontal)}`})
})

jb.component('css.transformRotate', {
  type: 'feature',
  params: [
    {id: 'angle', as: 'string', description: '0-360'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,angle,selector) => ({css: `${selector} {transform:rotate(${angle}deg)}`})
})

jb.component('css.color', {
  type: 'feature',
  params: [
    {id: 'color', as: 'string', dynamic: true},
    {id: 'background', as: 'string', editAs: 'color', dynamic: true},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
		const css = ['color','background']
      .filter(x=>ctx.params[x](ctx))
      .map(x=> `${x}: ${ctx.params[x](ctx)}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

jb.component('css.transformScale', {
  type: 'feature',
  params: [
    {id: 'x', as: 'string', description: '0-1'},
    {id: 'y', as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:scale(${ctx.params.x},${ctx.params.y})}`})
})

jb.component('css.transformTranslate', {
  type: 'feature',
  description: 'margin, move, shift, offset',
  params: [
    {id: 'x', as: 'string', description: '10px', defaultValue: '0'},
    {id: 'y', as: 'string', description: '20px', defaultValue: '0'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:translate(${jb.ui.withUnits(ctx.params.x)},${jb.ui.withUnits(ctx.params.y)})}`})
})

jb.component('css.bold', {
  type: 'feature',
  impl: ctx => ({css: `{font-weight: bold}`})
})

jb.component('css.underline', {
  type: 'feature',
  impl: ctx => ({css: `{text-decoration: underline}`})
})

jb.component('css.boxShadow', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'blurRadius', as: 'string', templateValue: '5'},
    {id: 'spreadRadius', as: 'string', templateValue: '0'},
    {id: 'shadowColor', as: 'string', templateValue: '#000000'},
    {id: 'opacity', as: 'string', templateValue: 0.5, description: '0-1'},
    {id: 'horizontal', as: 'string', templateValue: '10'},
    {id: 'vertical', as: 'string', templateValue: '10'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    const color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${jb.ui.withUnits(horizontal)} ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(blurRadius)} ${jb.ui.withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', as: 'string', defaultValue: '1'},
    {id: 'side', as: 'string', options: 'top,left,bottom,right'},
    {id: 'style', as: 'string', options: 'solid,dotted,dashed,double,groove,ridge,inset,outset', defaultValue: 'solid'},
    {id: 'color', as: 'string', defaultValue: 'black'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${jb.ui.withUnits(width)} ${style} ${color} }`})
})

jb.component('css.borderRadius', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'radius', as: 'string', defaultValue: '5'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,radius,selector) => ({css: `${selector} { border-radius: ${jb.ui.withUnits(radius)}}`})
})

jb.component('css.lineClamp', {
  type: 'feature',
  description: 'ellipsis after X lines',
  params: [
    {id: 'lines', mandatory: true, as: 'string', templateValue: 3, description: 'no of lines to clump'},
    {id: 'selector', as: 'string'}
  ],
  impl: css(
    '%$selector% { overflow: hidden; text-overflow: ellipsis; -webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: %$lines% }'
  )
})

jb.component('css.valueOfCssVar',{
  description: 'value of css variable --var under element',
  params: [
    {id: 'varName', description: 'without the -- prefix'},
    {id: 'parent', description: 'html element under which to check the var, default is document.body' }
  ],
  impl: (ctx,varName,parent) => jb.ui.valueOfCssVar(varName,parent)
})

jb.component('css.conditionalClass', {
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        vdom.addClass(cssClass())
      return vdom
    }
  })
})

;['layout','typography','detailedBorder','detailedColor','gridArea'].forEach(f=>
jb.component(`css.${f}`, {
  type: 'feature:0',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: jb.ui.fixCssLine(css)})
}))
;

var { text, firstSucceeding, customStyle, styleByControl, controlWithFeatures } = jb.ns('text')

jb.component('text', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'my title', dynamic: true},
    {id: 'style', type: 'text.style', defaultValue: text.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('label', {...jb.comps.text,type: 'depricated-control'} )

jb.component('text.bindText', {
  type: 'feature',
  category: 'text:0',
  impl: features(
    watchAndCalcModelProp({prop: 'text', transformValue: ({data}) => jb.ui.toVdomOrStr(data)}),
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'text' }})
  )
})

jb.component('text.allowAsynchValue', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  params: [
    { id: 'propId', defaultValue: 'text'},
    { id: 'waitingValue', defaultValue: ''},
  ],
  impl: features(
    calcProp('%$propId%', firstSucceeding('%$$state/{%$propId%}%','%$$props/{%$propId%}%' )),
    followUp.flow(
      source.any(If('%$$state/{%$propId%}%','','%$$props/{%$propId%}%')),
      rx.log('followUp allowAsynchValue'),
      rx.map(({data}) => jb.ui.toVdomOrStr(data)),
      sink.refreshCmp( ctx => ctx.run(obj(prop('%$propId%','%%'))))
    ),
  )
})

jb.component('text.highlight', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--deep-purple-A700'}
  ],
  impl: (ctx,base,highlightF,cssClass) => {
    const h = highlightF(), b = base();
    if (!h || !b) return b;
    const highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return jb.ui.h('div',{},[  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)])
  }
})
;

var {group,layout,tabs,controlWithCondition} = jb.ns('group,layout,tabs,controlWithCondition')

jb.component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group.style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp('ctrls',(ctx,{$model}) => $model.controls(ctx).filter(x=>x).flatMap(x=>x.segment ? x : [x]))
})

jb.component('inlineControls', {
  type: 'control',
  description: 'controls without a wrapping group',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true}
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamicControls', {
  type: 'control',
  description: 'calculated controls by data items without a wrapping group',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,controlItems,genericControl,itemVariable,indexVariable) => (controlItems() || [])
      .map((controlItem,i) => jb.tosingle(genericControl(
        ctx.setVar(itemVariable,controlItem).setVar(indexVariable,i).setData(controlItem))))
})

jb.component('group.firstSucceeding', {
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: calcProp({
      id: 'ctrls',
      value: (ctx,{$model}) => {
        const runCtx = $model.controls.runCtx.setVars(ctx.vars)
        return [jb.asArray($model.controls.profile).reduce((res,prof,i) => 
          res || runCtx.runInner(prof, {}, `controls~${i}`), null )]
      },
      priority: 5
  })
})

jb.component('controlWithCondition', {
  type: 'control',
  description: 'Used with group.firstSucceeding',
  category: 'group:10',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition(ctx) ? ctrl(ctx) : null
})

jb.component('group.wait', {
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true, description: 'a promise or rx'},
    {id: 'loadingControl', type: 'control', defaultValue: text('loading ...'), dynamic: true},
    {id: 'error', type: 'control', defaultValue: text('error: %$error%'), dynamic: true},
    {id: 'varName', as: 'string', description: 'variable for the promise result'},
    {id: 'passRx', as: 'boolean', description: 'do not wait for reactive data to end, and pass it as is' },
  ],
  impl: features(
    calcProp({
        id: 'ctrls',
        value: (ctx,{cmp},{loadingControl,error}) => {
          const ctrl = cmp.state.error ? error() : loadingControl(ctx)
          return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
        },
        priority: ctx => jb.path(ctx.vars.$state,'dataArrived') ? 0: 10
    }),
    followUp.action((ctx,{cmp},{varName,passRx}) => !cmp.state.dataArrived && !cmp.state.error &&
        Promise.resolve(jb.utils.toSynchArray(ctx.cmpCtx.params.for(),!passRx))
        .then(data => cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.cmpCtx,
            extendCtx: ctx => ctx.setVar(varName,data).setData(data)
          }))
          .catch(e=> cmp.refresh({error: JSON.stringify(e)}))
      )
  )
})

jb.component('group.eliminateRecursion', {
  type: 'feature',
  description: 'can be put on a global top group',
  params: [
    { id: 'maxDepth', as: 'number' }
  ],
  impl: (ctx,maxDepth) => {
    const protectedComp = ctx.cmpCtx.cmpCtx.path
    const timesInStack = jb.core.callStack(ctx).filter(x=>x && x.indexOf(protectedComp) != -1).length
    if (timesInStack > maxDepth)
      return ctx.run( calcProp({id: 'ctrls', value: () => [], phase: 1, priority: 100 }))
  }
})

jb.component('controls', {
  type: 'control',
  description: 'list of controls to be put inline, flatten inplace. E.g., set of table fields',
  category: 'group:20',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true},
  ],
  impl: (ctx,controls) => {
    const res = controls(ctx)
    res.segment = true
    return res
  }
});

var { html } = jb.ns('html')

jb.component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
    {id: 'title', as: 'string', mandatory: true, templateValue: 'html', dynamic: true},
    {id: 'style', type: 'html.style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('html.plain', {
  type: 'html.style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: (html||'').replace(/^(<[a-z0-9]*)/,'$1 jb_external="true"') } ),
    features: [
      watchAndCalcModelProp('html'),
      () => ({ studioFeatures :{$: 'feature.contentEditable', param: 'html' } })
    ]
  })
})

jb.component('html.inIframe', {
  type: 'html.style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'}
  ],
  impl: customStyle({
    template: (cmp,{width,height},h) => h('iframe', {
        sandbox: 'allow-same-origin allow-forms allow-scripts',
        frameborder: 0, width, height,
        src: 'javascript: document.write(parent.contentForIframe)'
    }),
    features: [
      frontEnd.var('html','%$$model/html()%'),
      frontEnd.init(({},{html}) => window.contentForIframe = html)
    ]
  })
})
;

var { image, pipeline } = jb.ns('image,css')

jb.component('image', {
  type: 'control,image',
  category: 'control:50,common:70',
  params: [
    {id: 'url', as: 'string', mandatory: true, templateValue: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png'},
    {id: 'width', as: 'string', mandatory: true, templateValue: '100', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', mandatory: true, description: 'e.g: 100, 20%'},
    {id: 'resize', type: 'image.resize', description: 'background-size, resize the image', defaultValue: image.fullyVisible()},
    {id: 'position', type: 'image.position', description: 'move/shift image'},
    {id: 'style', type: 'image.style', dynamic: true, defaultValue: image.background()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, {
    studioFeatures :{$: 'feature.contentEditable' },
  })
})

jb.component('image.widthHeight', {
  type: 'image.resize',
  description: 'fixed size or precentage of the original',
  params: [
    {id: 'width', as: 'string', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', description: 'e.g: 100, 20%'}
  ],
  impl: (ctx,width,height) => [ jb.ui.withUnits(width) ||'auto',jb.ui.withUnits(height)||'auto'].join(' ')
})

jb.component('image.cover', {
  description: 'auto resize or crop to cover all area',
  type: 'image.resize',
  impl: 'cover'
})

jb.component('image.fullyVisible', {
  description: 'contain, auto resize to ensure the image is fully visible',
  type: 'image.resize',
  impl: 'contain'
})

jb.component('image.position', {
  description: 'offset move shift original image',
  type: 'image.position',
  params: [
    {id: 'x', as: 'string', description: 'e.g. 7, 50%, right'},
    {id: 'y', as: 'string', description: 'e.g. 10, 50%, bottom'}
  ],
  impl: (ctx,x,y) => [x && `x: ${jb.ui.withUnits(x)}`,y && `y: ${jb.ui.withUnits(y)}`]
    .filter(x=>x).map(x=>`background-position-${x}`).join(';')
})

jb.component('image.background', {
  type: 'image.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: pipeline(
      Var(
          'url',
          (ctx,{$model}) => $model.url.replace(/__WIDTH__/,$model.width).replace(/__HEIGHT__/,$model.height)
        ),
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      {
          background-image: url('%$url%');
          {? background-size: %$$model/resize%; ?}
          {? %$$model/position%; ?}
          background-repeat: no-repeat;
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    )
  })
})

jb.component('image.img', {
  type: 'image.style',
  impl: customStyle({
    template: ({},{url},h) => h('img', { src: url}),
    css: pipeline(
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      { 
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    ),
    features: calcProp('url')
  })
});

var { icon, control } = jb.ns('icon,control')

jb.component('control.icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'size', as: 'number', defaultValue: 24},
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('icon.init', {
  type: 'feature',
  category: 'icon:0',
  impl: features(calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'))
})

jb.component('icon', {
  type: 'icon',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ctx.params
})

jb.component('icon.material', {
  type: 'icon.style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), onclick: true, style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(), onclick: true,
        $html: `<svg width="24" height="24" jb_external="true" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.ui,['MDIcons',icon])}"/></svg>`}),
    features: icon.init()
  })
})

jb.component('feature.icon', {
  type: 'feature',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'position', as: 'string', options: ',pre,post,raised', defaultValue: '' },
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'size', as: 'number', defaultValue: 24 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ({ // todo - fix for remote
    icon: jb.ui.ctrl(ctx, features(
      calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'),
      calcProp('iconPosition','%$$model/position%')
    ))
  })
})

;

var { button } = jb.ns('button')

jb.component('button', {
  type: 'control,clickable',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button.style', defaultValue: button.mdc(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('button.initAction', {
  type: 'feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    method('onclickHandler', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
  )
})

jb.component('button.ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

jb.component('button.altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

;

var { field, validation  } = jb.ns('field,validation');

jb.extension('ui', 'field', {
  initExtension: () => ({field_id_counter : 0 }),
  writeFieldData(ctx,cmp,value,oneWay) {
    if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == value) return
    jb.db.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx)
    jb.ui.checkValidationError(cmp,value,ctx)
    cmp.hasBEMethod('onValueChange') && cmp.runBEMethod('onValueChange',value,ctx.vars)
    !oneWay && cmp.refresh({},{srcCtx: ctx.cmpCtx})
  },
  checkValidationError(cmp,val,ctx) {
    const err = validationError()
    if (cmp.state.error != err) {
      jb.log('field validation set error state',{cmp,err})
      cmp.refresh({valid: !err, error:err}, {srcCtx: ctx.cmpCtx})
    }
  
    function validationError() {
      if (!cmp.validations) return
      const ctx = cmp.ctx.setData(val)
      const err = (cmp.validations || [])
        .filter(validator=>!validator.validCondition(ctx))
        .map(validator=>validator.errorMessage(ctx))[0]
      if (ctx.exp('%$formContainer%'))
        ctx.run(writeValue('%$formContainer/err%',err))
      return err
    }
  },
  checkFormValidation(elem) {
    jb.ui.find(elem,'[jb-ctx]').map(el=>el._component).filter(cmp => cmp && cmp.validations).forEach(cmp => 
      jb.ui.checkValidationError(cmp,jb.val(cmp.ctx.vars.$model.databind(cmp.ctx)), cmp.ctx))
  },
  fieldTitle(cmp,fieldOrCtrl,h) {
    let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
    field = typeof field === 'function' ? field() : field
    if (field.titleCtrl) {
      const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
      const jbComp = field.titleCtrl(ctx);
      return jbComp && h(jbComp,{'jb-ctx': jb.ui.preserveCtx(ctx) })
    }
    return field.title(cmp.ctx)
  },
  preserveFieldCtxWithItem(field,item) {
    const ctx = jb.ctxDictionary[field.ctxId]
    return ctx && jb.ui.preserveCtx(ctx.setData(item))
  }
})

jb.component('field.databind', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', as: 'boolean'}
  ],
  impl: features(
    If(
        '%$oneWay%',
        calcProp({id: 'databind', value: '%$$model/databind()%', defaultValue: ''}),
        watchAndCalcModelProp({prop: 'databind', allowSelfRefresh: true, defaultValue: ''})
      ),
    calcProp('title'),
    calcProp({id: 'fieldId', value: () => jb.ui.field_id_counter++}),
    method(
      'writeFieldValue',
      (ctx,{cmp},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ctx.data,oneWay)
    ),
    method(
        'onblurHandler',
        (ctx,{cmp, ev},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onchangeHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onkeyupHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onkeydownHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    // frontEndProp(
    //     'jbModel',
    //     (ctx,{cmp}) => value =>
    //       value == null ? ctx.exp('%$$model/databind%','number') : jb.ui.writeFieldData(ctx,cmp,value,true)
    //   ),
    
    feature.byCondition('%$$dialog%', feature.initValue('%$$dialog/hasFields%',true))
    //feature.init((ctx,{$dialog})=> $dialog && ($dialog.hasFields = true))
  )
})

jb.component('field.onChange', {
  type: 'feature',
  category: 'field:100',
  description: 'on picklist selection, text or boolean value change',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: followUp.onDataChange({ref: '%$$model/databind%', action: call('action') })
})

jb.component('field.databindText', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: field.databind(
    '%$debounceTime%',
    '%$oneWay%'
  )
})

// jb.component('field.keyboardShortcut', {
//   type: 'feature',
//   category: 'events',
//   description: 'listen to events at the document level even when the component is not active',
//   params: [
//     {id: 'key', as: 'string', description: 'e.g. Alt+C'},
//     {id: 'action', type: 'action', dynamic: true}
//   ],
//   frontEnd.init((ctx,{cmp},{key,action}) => {
//         const elem = cmp.base.querySelector('input') || cmp.base
//         if (elem.tabIndex === undefined) elem.tabIndex = -1
//         jb.utils.subscribe(jb.ui.fromEvent(cmp,'keydown',elem),event=>{
//               const keyStr = key.split('+').slice(1).join('+');
//               const keyCode = keyStr.charCodeAt(0);
//               if (key == 'Delete') keyCode = 46;

//               const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
//               if (helper == 'Ctrl' && !event.ctrlKey) return
//               if (helper == 'Alt' && !event.altKey) return
//               if (event.keyCode == keyCode || (event.key && event.key == keyStr))
//                 action();
//         })
//     }
//   )
// })

// ***** validation

jb.component('validation', {
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,validCondition,errorMessage) => ({validations: {validCondition, errorMessage }})
})

jb.component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true}
  ],
  impl: (ctx,title) => ({
      enrichField: field => field.title = ctx => title(ctx)
  })
})

jb.component('field.titleCtrl', {
  description: 'title as control, buttons are usefull',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'titleCtrl', type: 'control', mandatory: true, dynamic: true, templateValue: button({title: '%title%', style: button.href()})}
  ],
  impl: (ctx,titleCtrl) => ({
      enrichField: field => field.titleCtrl = ctx => titleCtrl(ctx)
  })
})

jb.component('field.columnWidth', {
  description: 'used in itemlist fields',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'width', as: 'number', mandatory: true}
  ],
  impl: (ctx,width) => ({
      enrichField: field => field.width = width
  })
});

var {editableText} = jb.ns('editableText')

jb.component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editableText.xButton', {
  type: 'feature',
  impl: features(
    method('cleanValue', writeValue('%$$model/databind()%', '')),
    templateModifier(({},{vdom,databind}) => jb.ui.h('div', {},[
        vdom,
        ...(databind ? [jb.ui.h('button', { class: 'delete', onclick: 'cleanValue' } ,'×')]  : [])
    ])),
    css(
        `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
      )
  )
})
;

var {editableBoolean, refreshIfNotWatchable} = jb.ns('editableBoolean')

jb.component('editableBoolean', {
  type: 'control',
  category: 'input:20',
  params: [
    {id: 'databind', as: 'ref', type: 'boolean', mandaroy: true, dynamic: true },
    {id: 'style', type: 'editable-boolean.style', defaultValue: editableBoolean.checkbox(), dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true},
    {id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editableBoolean.initToggle', {
  type: 'feature',
  category: 'editableBoolean:0',
  impl: features(
    calcProp('toggleText',If('%$$model/databind()%','%$$model/textForTrue()%','%$$model/textForFalse()%' )),
    watchRef({ref: '%$$model/databind()%', allowSelfRefresh: true, strongRefresh: true}),
    method('toggle', runActions(
        writeValue('%$$model/databind()%',not('%$$model/databind()%')),
        refreshIfNotWatchable('%$$model/databind()%')
    )),
    method('toggleByKey', (ctx,{cmp, ev}) => 
      ev.keyCode != 27 && cmp.runBEMethod('toggle')
    )
  )
})
;

var {editableNumber} = jb.ns('editableNumber')

jb.component('editableNumber', {
  type: 'control',
  category: 'input:30',
  params: [
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'editable-number.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'symbol', as: 'string', description: 'leave empty to parse symbol from value'},
    {id: 'min', as: 'number', defaultValue: 0},
    {id: 'max', as: 'number', defaultValue: 10},
    {id: 'displayString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'dataString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'autoScale', as: 'boolean', defaultValue: true, description: 'adjust its scale if at edges', type: 'boolean'},
    {id: 'step', as: 'number', defaultValue: 1, description: 'used by slider'},
    {id: 'initialPixelsPerUnit', as: 'number', description: 'used by slider'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
      class editableNumber {
        constructor(params) {
          Object.assign(this,params);
          if (this.min == null) this.min = NaN;
          if (this.max == null) this.max = NaN;
        }
        numericPart(dataString) {
          if (typeof dataString == 'number') return dataString
          if (dataString == '') return NaN;
          var parts = (''+dataString).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/); // prefix-number-suffix
          if (parts)
            this.symbol = parts[1] || parts[3]
          return +(parts && parts[2])
        }

        calcDisplayString(number,ctx) {
          if (isNaN(number)) return this.placeholder || '';
          return this.displayString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }

        calcDataString(number,ctx) {
          if (isNaN(number)) return '';
          return this.dataString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }
        keepInDomain(val) {
          return Math.min(this.max, Math.max(this.min,val))
        }
      }
      return jb.ui.ctrl(ctx.setVars({ editableNumber: new editableNumber(ctx.params) }))
  }
})


;

var {openDialog, dialog,dialogs, dialogFeature, and, or, runActionOnItems, getSessionStorage, userStateProp } 
	= jb.ns('dialog,dialogs,openDialog,dialogFeature')

jb.component('openDialog', {
  type: 'action,has-side-effects',
  params: [
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'content', type: 'control', dynamic: true, templateValue: group(), defaultValue: text('')},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
	{id: 'onOK', type: 'action', dynamic: true},
	{id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: ctx => {
	const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
	const ctxWithDialog = ctx.setVars({
		$dialog,
		dialogData: {},
		formContainer: { err: ''},
	})
	$dialog.ctx = ctxWithDialog
	ctxWithDialog.run(runActions(
		dialog.createDialogTopIfNeeded(),
		action.subjectNext(dialogs.changeEmitter(), obj(prop('open',true), prop('dialog', '%$$dialog%')))
	))
}
  
//   runActions(
// 	Var('$dlg',(ctx,{},{id}) => {
// 		const dialog = { id: id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
// 		const ctxWithDialog = ctx.cmpCtx._parent.setVars({
// 			$dialog: dialog,
// 			dialogData: {},
// 			formContainer: { err: ''},
// 		})
// 		dialog.ctx = ctxWithDialog
// 		return dialog
// 	}),
// 	dialog.createDialogTopIfNeeded(),
// 	action.subjectNext(dialogs.changeEmitter(), obj(prop('open',true), prop('dialog','%$$dlg%')))
//   )
})

jb.component('openDialog.probe', {
	type: 'control:0',
	params: jb.comps.openDialog.params,
	impl: ctx => jb.ui.ctrl(ctx.setVar('$dialog',{}), dialog.init()).renderVdom()
})

jb.component('dialog.init', {
	type: 'feature',
	impl: features(
		calcProp('dummy',ctx => jb.log('dialog init uiComp', {dialog: ctx.vars.$dialog, cmp: ctx.vars.cmp,ctx})),
		calcProp('title', '%$$model/title()%'),
		calcProp('contentComp', '%$$model/content%'),
		calcProp('hasMenu', '%$$model/menu/profile%'),
		calcProp('menuComp', '%$$model/menu%'),
		feature.initValue('%$$dialog/cmpId%','%$cmp/cmpId%'),
		htmlAttribute('id','%$$dialog/id%'),

		method('dialogCloseOK', dialog.closeDialog(true)),
		method('dialogClose', dialog.closeDialog(false)),
		css('z-index: 100'),
	)
})

jb.component('dialog.buildComp', {
	type: 'control:0',
	params: [
		{id: 'dialog', defaultValue: '%$$dialog%' },
	],
	impl: (ctx,dlg) => jb.ui.ctrl(dlg.ctx, dialog.init())
})

jb.component('dialog.createDialogTopIfNeeded', {
	type: 'action',
	impl: (ctx) => {
		const widgetBody = jb.ui.widgetBody(ctx)
		if (widgetBody.querySelector(':scope>.jb-dialogs')) return
		const vdom = ctx.run(dialog.dialogTop()).renderVdomAndFollowUp()
		if (ctx.vars.headlessWidget && widgetBody instanceof jb.ui.VNode) {
			widgetBody.children.push(vdom)
			vdom.parentNode = widgetBody
			jb.log('dialog headless createTop',{vdom,widgetBody})
		} else {
			jb.ui.render(vdom,widgetBody)
			jb.log('dialog dom createTop',{vdom,widgetBody})
		}
	}
})

jb.component('dialog.closeDialog', {
	type: 'action',
	description: 'close parent dialog',
	params: [
		{id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true},
	],
	impl: action.if('%$$dialog%' , runActions(
		action.if(and('%$OK%','%$$dialog.hasFields%', (ctx,{$dialog}) => 
			jb.ui.checkFormValidation && jb.ui.checkFormValidation(jb.ui.elemOfCmp(ctx, $dialog.cmpId)))),
		action.if(and('%$OK%', not('%$formContainer.err%')), (ctx,{$dialog}) => {
			jb.log('dialog onOK',{$dialog,ctx})
			$dialog.ctx.params.onOK(ctx)
		}),
		action.if(or(not('%$OK%'), not('%$formContainer.err%')),
			action.subjectNext(dialogs.changeEmitter(), obj(prop('close',true), prop('dialogId','%$$dialog/id%'))))
	))
})

jb.component('dialog.closeDialogById', {
	type: 'action',
	description: 'close dialog fast without checking validations and running onOK',
	params: [
	  {id: 'id', as: 'string'},
	],
	impl: action.subjectNext(dialogs.changeEmitter(), obj(prop('close',true), prop('dialogId','%$id%')))
})
  
jb.component('dialog.closeAll', {
	type: 'action',
	impl: runActionOnItems(dialog.shownDialogs(), dialog.closeDialogById('%%'))
})

jb.component('dialog.closeAllPopups', {
	type: 'action',
	impl: runActionOnItems(dialogs.shownPopups(), dialog.closeDialogById('%%'))
})

jb.component('dialog.shownDialogs', {
	impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog').map(el=> el.getAttribute('id'))
})

jb.component('dialog.isOpen', {
	params: [
		{id: 'id', as: 'string'},
  	],
	impl: dialogs.cmpIdOfDialog('%$id%')
})

jb.component('dialogs.cmpIdOfDialog', {
	params: [
		{id: 'id', as: 'string'},
  	],
	impl: (ctx,id) => jb.ui.find(jb.ui.widgetBody(ctx),`[id="${id}"]`).map(el=> el.getAttribute('cmp-id'))[0]
})

jb.component('dialogs.shownPopups', {
	impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-popup').map(el=>el.getAttribute('id'))
})

jb.component('dialogFeature.modal', {
	description: 'blocks all other screen elements',
	type: 'dialog-feature',
	impl: features(
		frontEnd.init(() =>	jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>')),
		frontEnd.onDestroy(() => Array.from(document.body.querySelectorAll('>.modal-overlay'))
			.forEach(el=>document.body.removeChild(el)))
	)
})

jb.component('dialogFeature.uniqueDialog', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	],
	impl: If('%$id%', features(
		feature.initValue({to: '%$$dialog/id%',value: '%$id%', alsoWhenNotEmpty: true}),
		followUp.flow(
			source.data(ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog')),
			rx.filter(({data},{cmp},{id}) => data.getAttribute('id') == id && data.getAttribute('cmp-id') != cmp.cmpId ),
			rx.map(({data}) => data.getAttribute('cmp-id')),
			rx.map(obj(prop('closeByCmpId',true), prop('cmpId','%%'), prop('dialogId','%$id%'))),
			rx.log('dialog close uniqueDialog'),
			sink.subjectNext(dialogs.changeEmitter())
		)
	))
})

jb.component('source.eventIncludingPreview', {
	type: 'rx',
	params: [
		{ id: 'event', as: 'string'}],
	impl: rx.merge(
		source.event('%$event%', () => document),
		source.event('%$event%', () => jb.path(jb.studio, 'previewWindow.document'))
	)
})

jb.component('dialogFeature.dragTitle', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	  {id: 'useSessionStorage', as: 'boolean'},
	  {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
	],
	impl: features(
		calcProp('sessionStorageId','dialogPos-%$id%'),
		calcProp('posFromSessionStorage', If('%$useSessionStorage%', getSessionStorage('%$$props/sessionStorageId%'))),
		css('%$selector% { cursor: pointer; user-select: none }'),
		frontEnd.method('setPos',({data},{el}) => { 
			el.style.top = data.top + 'px'
			el.style.left = data.left +'px' 
		}),
		frontEnd.var('selector','%$selector%'),
		frontEnd.var('useSessionStorage','%$useSessionStorage%'),
		frontEnd.var('sessionStorageId','%$$props/sessionStorageId%'),
		frontEnd.var('posFromSessionStorage','%$$props/posFromSessionStorage%'),
		frontEnd.init(({},{el,posFromSessionStorage}) => {
			if (posFromSessionStorage) {
				el.style.top = posFromSessionStorage.top + 'px'
				el.style.left = posFromSessionStorage.left +'px'
			}
		}),
		frontEnd.prop('titleElem',({},{el,selector}) => el.querySelector(selector)),
		frontEnd.flow(
			source.event('mousedown','%$cmp/titleElem%'), 
			rx.takeUntil('%$cmp/destroyed%'),
			rx.var('offset',({data},{el}) => ({
				left: data.clientX - el.getBoundingClientRect().left,
				top:  data.clientY - el.getBoundingClientRect().top
			})),
			rx.flatMap(rx.pipe(
				source.eventIncludingPreview('mousemove'),
				rx.takeWhile('%buttons%!=0'),
				rx.var('ev'),
				rx.map(({data},{offset}) => ({
					left: Math.max(0, data.clientX - offset.left),
					top: Math.max(0, data.clientY - offset.top),
				})),
			)),
			sink.action(runActions(
				action.runFEMethod('setPos'),
				If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%','%%'))
			))
		)
	)
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl: customStyle({
	  template: ({},{title,contentComp},h) => h('div.jb-dialog jb-default-dialog',{},[
			  h('div.dialog-title',{},title),
			  h('button.dialog-close', {onclick: 'dialogClose' },'×'),
			  h(contentComp),
		  ]),
	  features: dialogFeature.dragTitle()
	})
})

jb.component('dialogFeature.nearLauncherPosition', {
  type: 'dialog-feature',
  params: [
    {id: 'offsetLeft', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'offsetTop', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'rightSide', as: 'boolean' }
  ],
  impl: features(
	  calcProp('launcherRectangle','%$ev/elem/clientRect%'),
	  frontEnd.var('launcherRectangle','%$$props/launcherRectangle%'),
	  frontEnd.var('launcherCmpId','%$$dialog/launcherCmpId%'),
	  frontEnd.var('pos',({},{},{offsetLeft,offsetTop,rightSide}) => ({offsetLeft: offsetLeft() || 0, offsetTop: offsetTop() || 0,rightSide})),
	  userStateProp('dialogPos', ({},{ev,$props},{offsetLeft,offsetTop,rightSide}) => {
		if (!ev) return { left: 0, top: 0}
		const _offsetLeft = offsetLeft() || 0, _offsetTop = offsetTop() || 0
		if (!$props.launcherRectangle)
			return { left: _offsetLeft + ev.clientX || 0, top: _offsetTop + ev.clientY || 0}
		return {
			left: $props.launcherRectangle.left + _offsetLeft  + (rightSide ? ev.elem.outerWidth : 0), 
			top:  $props.launcherRectangle.top  + _offsetTop   + ev.elem.outerHeight
		}
	  }),
	  frontEnd.onRefresh( ({},{$state,el}) => { 
		const {top,left} = $state.dialogPos || { top: 0, left: 0}
		el.style.top = `${top}px`
		el.style.left = `${left}px`
	  }),
	  frontEnd.init((ctx,{cmp,pos,launcherCmpId,elemToTest}) => { // handle launcherCmpId
		  if (!elemToTest && launcherCmpId && cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) {
			  const el = jb.ui.elemOfCmp(ctx,launcherCmpId)
			  if (!el) return
			  const launcherRectangle = el.getBoundingClientRect()
			  const dialogPos = {
				left: launcherRectangle.left + pos.offsetLeft + (pos.rightSide ? jb.ui.outerWidth(el) : 0), 
				top:  launcherRectangle.top  + pos.offsetTop  + jb.ui.outerHeight(el)
			  }
			  if (dialogPos.left != 0 || dialogPos.top != 0)
			  	cmp.refreshFE({ dialogPos })
		  }
	  }),
	  frontEnd.init(({},{cmp,elemToTest}) => { // fixDialogPositionAtScreenEdges
		if (elemToTest || cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) return
		const dialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0]
		const dialogPos = cmp.state.dialogPos
		let top,left
		const padding = 2, dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
		if (dialogPos.top > dialog_height && dialogPos.top + dialog_height + padding > window.innerHeight + window.pageYOffset)
			top = dialogPos.top - dialog_height
		if (dialogPos.left > dialog_width && dialogPos.left + dialog_width + padding > window.innerWidth + window.pageXOffset)
			left = dialogPos.left - dialog_width
		if (left || top)
			cmp.refreshFE({ dialogPos: { top: top || dialogPos.top , left: left || dialogPos.left} })
	  }),
  )
})

jb.component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: onDestroy(call('action'))
})

jb.component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  impl: features(
	  feature.initValue('%$$dialog.isPopup%',true),
	  frontEnd.flow(
		source.data(0), rx.delay(100), // wait before start listening
		rx.flatMap(source.eventIncludingPreview('mousedown')),
		// 	rx.merge(
		// 	source.event('mousedown','%$cmp.base.ownerDocument%'),
		// 	source.event('mousedown', () => jb.path(jb.studio,'previewWindow.document')),
		// )),
		rx.takeUntil('%$cmp.destroyed%'),
		rx.filter(({data}) => jb.ui.closest(data.target,'.jb-dialog') == null),
		rx.var('dialogId', ({},{cmp}) => cmp.base.getAttribute('id')),
		sink.action(dialog.closeDialogById('%$dialogId%'))
	))
})

jb.component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
	  frontEnd.var('selectText','%$selectText%'),
	  frontEnd.init( (ctx,{el,selectText}) => {
	    const elem = jb.ui.find(el,'input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
		if (elem)
			jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
		if (selectText)
			elem.select()
	  })
  )
})

jb.component('dialogFeature.cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  description: 'launching element toggles class "dialog-open" if the dialog is open',
  impl: features(
	  frontEnd.prop('launchingElement', (ctx,{cmp}) => cmp.launchingCmp && jb.ui.elemOfCmp(ctx,cmp.launchingCmp)),
	  frontEnd.init( ({},{cmp}) => cmp.launchingElement && jb.ui.addClass(cmp.launchingElement,'dialog-open')),
	  frontEnd.onDestroy( ({},{cmp}) => cmp.launchingElement && jb.ui.removeClass(cmp.launchingElement,'dialog-open'))
  )
})

jb.component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number', defaultValue: 100}
  ],
  impl: features(
	  frontEnd.var('minZIndex','%$minZIndex%'),
	  frontEnd.method('setAsMaxZIndex', ({},{el,minZIndex}) => {
		  	const dialogs = Array.from(document.querySelectorAll('.jb-dialog')).filter(dl=>!jb.ui.hasClass(dl, 'jb-popup'))
			const calcMaxIndex = dialogs.reduce((max, _el) => 
				Math.max(max,(_el && parseInt(_el.style.zIndex || 100)+1) || 100), minZIndex || 100)
			el.style.zIndex = calcMaxIndex
	  }),
	  frontEnd.init(({},{cmp}) => { cmp.state.frontEndStatus = 'ready'; cmp.runFEMethod('setAsMaxZIndex') }),
	  frontEnd.flow(source.frontEndEvent('mousedown'), sink.FEMethod('setAsMaxZIndex'))
  )
})

jb.component('dialog.dialogOkCancel', {
  type: 'dialog.style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div.jb-dialog jb-default-dialog',{},[
			h('div.dialog-title',{},title),
			h('button.dialog-close', { onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div.dialog-buttons',{},[
				h('button.mdc-button', {onclick: 'dialogClose' }, [h('div.mdc-button__ripple'), h('span.mdc-button__label',{},cancelLabel)]),
				h('button.mdc-button', {onclick: 'dialogCloseOK' },[h('div.mdc-button__ripple'), h('span.mdc-button__label',{},okLabel)]),
			]),
		]),
	css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }',
	features: dialogFeature.maxZIndexOnClick()
  })
})

jb.component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'autoResizeInnerElement', as: 'boolean', description: 'effective element with "autoResizeInDialog" class', type: 'boolean'}
  ],
  impl: features(
	  templateModifier( ({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
	  css('>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }'),
	  frontEnd.var('autoResizeInnerElement','%$autoResizeInnerElement%'),
	  frontEnd.method('setSize',({data},{cmp,el,autoResizeInnerElement}) => { 
		el.style.height = data.top + 'px'
		el.style.width = data.left + 'px'
		const innerElemToResize = el.querySelector('.autoResizeInDialog')
		if (!autoResizeInnerElement || !innerElemToResize) return
		cmp.innerElemOffset = cmp.innerElemOffset || innerElemToResize.getBoundingClientRect().top - el.getBoundingClientRect().top
				  + (el.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)
		innerElemToResize.style.height = (data.top - cmp.innerElemOffset) + 'px'
	  }),
	  frontEnd.prop('resizerElem',({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
	  frontEnd.flow(
		source.event('mousedown','%$cmp.resizerElem%'), 
		rx.takeUntil('%$cmp.destroyed%'),
		rx.var('offset',({},{el}) => ({
			left: el.getBoundingClientRect().left,
			top:  el.getBoundingClientRect().top
		})),
		rx.flatMap(rx.pipe(
			source.eventIncludingPreview('mousemove'),
			rx.takeWhile('%buttons%!=0'),
			rx.map(({data},{offset}) => ({
				left: Math.max(0, data.clientX - offset.left),
				top: Math.max(0, data.clientY - offset.top),
			})),
		)),
		sink.FEMethod('setSize')
	))
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl: customStyle({
	template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; background: var(--jb-dropdown-bg); box-shadow: 2px 2px 3px var(--jb-dropdown-shadow); padding: 3px 0; border: 1px solid var(--jb-dropdown-border) }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition()
    ]
  })
})

jb.component('dialog.transparent-popup', {
	type: 'dialog.style',
	impl: customStyle({
	  template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
	  css: '{ position: absolute; padding: 3px 0; }',
	  features: [
		dialogFeature.maxZIndexOnClick(),
		dialogFeature.closeWhenClickingOutside(),
		dialogFeature.cssClassOnLaunchingElement(),
		dialogFeature.nearLauncherPosition()
	  ]
	})
})
  
jb.component('dialog.div', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute }'
  })
})

jb.component('dialogs.changeEmitter', {
	type: 'rx',
	params: [
		{id: 'widgetId', defaultValue: '%$headlessWidgetId%'},
	],
	category: 'source',
	impl: (ctx,_widgetId) => {
		const widgetId = !ctx.vars.previewOverlay && _widgetId || 'default'
		jb.ui.dlgEmitters = jb.ui.dlgEmitters || {}
		jb.ui.dlgEmitters[widgetId] = jb.ui.dlgEmitters[widgetId] || ctx.run(rx.subject({replay: true}))
		return jb.ui.dlgEmitters[widgetId]
	}
})

jb.component('dialogs.destroyAllEmitters', {
	type: 'action',
	impl: () => Object.keys(jb.ui.dlgEmitters||{}).forEach(k=>{
		jb.ui.dlgEmitters[k].trigger.complete()
		delete jb.ui.dlgEmitters[k]
	})
})

jb.component('dialog.dialogTop', {
	type: 'control',
	params: [
		{id: 'style', type: 'dialogs.style', defaultValue: dialogs.defaultStyle(), dynamic: true},
	],
	impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('dialogs.defaultStyle', {
	type: 'dialogs.style',
	impl: customStyle({
		template: ({},{},h) => h('div.jb-dialogs'),
		features: [
			followUp.flow(
				source.subject(dialogs.changeEmitter()),
				rx.filter('%open%'),
				rx.var('dialogVdom', pipeline(dialog.buildComp('%dialog%'),'%renderVdomAndFollowUp()%')),
				rx.var('delta', obj(prop('children', obj(prop('toAppend', pipeline('%$dialogVdom%', ({data}) => jb.ui.stripVdom(data))))))),
				rx.log('open dialog',obj(prop('dialogId','%dialog/id%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			),
			followUp.flow(source.subject(dialogs.changeEmitter()), 
				rx.filter('%close%'),
				rx.var('dlgCmpId', dialogs.cmpIdOfDialog('%dialogId%')),
				rx.filter('%$dlgCmpId%'),
				rx.var('delta', obj(prop('children', obj(prop('deleteCmp','%$dlgCmpId%'))))),
				rx.log('close dialog',obj(prop('dialogId','%dialogId%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			),
			followUp.flow(source.subject(dialogs.changeEmitter()), 
				rx.filter('%closeByCmpId%'),
				rx.var('delta', obj(prop('children', obj(prop('deleteCmp','%cmpId%'))))),
				rx.log('close dialog', obj(prop('dialogId','%dialogId%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			)			
		]
	})
})
;

var {itemlist} = jb.ns('itemlist,itemlistContainer')

jb.component('itemlist', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'layout', type: 'layout'},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('itemlist.noContainer', {
  type: 'feature',
  category: 'group:20',
  impl: () => ({ extendCtx: ctx => ctx.setVars({itemlistCntr: null}) })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('visualSizeLimit', ({},{$model,$state}) => Math.max($model.visualSizeLimit,$state.visualSizeLimit ||0)),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('ctrls', (ctx,{$model,$props}) => {
      const controlsOfItem = (item,index) => $model.controls(ctx.setVars({index: index + (ctx.vars.$baseIndex || 0)}).setVar($model.itemVariable,item).setData(item)).filter(x=>x)
      return $props.items.map((item,i)=> controlsOfItem(item,i+1)).filter(x=>x.length > 0)
    }),
    calcProp({
      id: 'updateItemlistCntr',
      value: action.if('%$itemlistCntr%', writeValue('%$itemlistCntr.items%', '%$$props.items%')),
      phase: 100
    })
  )
})
;

var {runActionOnItem, isRef, inGroup, list } = jb.macro

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%', dynamic: true},
    {id: 'selectedToDatabind', dynamic: true, defaultValue: '%%'},
    {id: 'databindToSelected', dynamic: true, defaultValue: '%%'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onDoubleClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {id: 'cssForSelected', as: 'string', defaultValue: 'color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg)'}
  ],
  impl: features(
    css(
      ({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')
    ),
    userStateProp({
      id: 'selected',
      value: (ctx,{$props,$state},{databind, autoSelectFirst, databindToSelected}) => {
        const currentVal = $state.selected && jb.path(jb.ctxDictionary[$state.selected],'data')
        const databindVal = jb.val(databind()) 
        const val = jb.val( databindVal != null && databindToSelected(ctx.setData(databindVal)) || currentVal || (autoSelectFirst && $props.items[0]))
        return $props.items.findIndex(item => jb.val(item) == val)
      },
      phase: 20
    }),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method(
      'onSelection',
      runActionOnItem(
        itemlist.indexToData(),
        runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')), call('onSelection'))
      )
    ),
    method(
      'onDoubleClick',
      runActionOnItem(
        itemlist.indexToData(),
        runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')), call('onDoubleClick'))
      )
    ),
    followUp.flow(
      source.data('%$$props/selected%'),
      rx.filter(and('%$autoSelectFirst%', not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        elem.classList.add('selected')
        elem.scrollIntoViewIfNeeded()
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('dblclick'),
      rx.map(itemlist.indexOfElem('%target%')),
      rx.filter('%%'),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
      rx.merge(
        rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.indexOfElem('%target%')), rx.filter('%%')),
        source.subject('%$cmp/selectionEmitter%')
      ),
      rx.distinctUntilChanged(),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
    )
  )
})

jb.component('itemlist.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: features(
    htmlAttribute('tabIndex', 0),
    method('onEnter', runActionOnItem(itemlist.indexToData(), call('onEnter'))),
    frontEnd.passSelectionKeySource(),
    frontEnd.prop('onkeydown', rx.merge(source.frontEndEvent('keydown'), source.findSelectionKeySource())),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter('%keyCode%==13'),
      rx.filter('%$cmp.state.selected%'),
      sink.BEMethod('onEnter', '%$cmp.state.selected%')
    ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38, 40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1))),
      rx.log('itemlist frontend nextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.var('autoFocus', '%$autoFocus%'),
    frontEnd.init(If(and('%$autoFocus%', '%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus')))
  )
})

jb.component('itemlist.indexOfElem', {
  type: 'data:0',
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: ({},el) => {
      const elem = jb.ui.closest(el,'.jb-item')
      return elem && jb.ui.indexOfElement(elem)
  }
})

jb.component('itemlist.indexToData', {
  type: 'data:0',
  params: [
    {id: 'index', as: 'number', defaultValue: '%%'}
  ],
  impl: (ctx,index) => jb.val(jb.path(ctx.vars.cmp,'renderProps.items') || [])[index]
})

jb.component('itemlist.findSelectionSource', {
  type: 'data:0',
  impl: ctx => {
    const {cmp,itemlistCntr} = ctx.vars
    const srcCtxId = itemlistCntr && itemlistCntr.selectionKeySourceCmp
    return [jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource), document.querySelector(`[ctxId="${srcCtxId}"]`)]
      .map(el => el && el._component && el._component.selectionKeySource).filter(x=>x)[0]
  }
})

jb.component('itemlist.nextSelected', {
  type: 'data:0',
  params: [
    {id: 'diff', as: 'number'},
    {id: 'elementFilter', dynamic: 'true', defaultValue: true}
  ],
  impl: (ctx,diff,elementFilter) => {
    const {cmp} = ctx.vars
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map((el,i) => [el,i])
      .filter(([el]) => elementFilter(ctx.setData(el))).map(([el,i]) => i)

    const selectedIndex = indeces.indexOf(+cmp.state.selected) + diff
    return indeces[Math.min(indeces.length-1,Math.max(0,selectedIndex))]
  }
});

var { move } = jb.macro

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    method('moveItem', runActions(move(itemlist.indexToData('%from%'), itemlist.indexToData('%to%')), action.refreshCmp())),
    frontEnd.prop('drake', ({},{cmp}) => {
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-items-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(
      source.dragulaEvent('drag', list('el')),
      rx.map(itemlist.indexOfElem('%el%')),
      rx.do(({},{cmp}) => 
        Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(el=>el.setAttribute('jb-original-index',jb.ui.indexOfElement(el)))
      ),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(
      source.dragulaEvent('drop', list('dropElm', 'target', 'source', 'sibling')),
      rx.map(obj(prop('from', itemlist.indexOfElem('%dropElm%')), prop('to', itemlist.orignialIndexFromSibling('%sibling%')))),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38, 40), '%keyCode%')),
      rx.map(obj(prop('from', itemlist.nextSelected(0)), prop('to', itemlist.nextSelected(If('%keyCode%==40', 1, -1))))),
      sink.BEMethod('moveItem')
    )
  )
})

jb.component('source.dragulaEvent', {
  type: 'rx:0',
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: "e.g., ['dropElm', 'target', 'source']"}
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) =>
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
})

jb.component('itemlist.orignialIndexFromSibling', {
  type: 'data:0',
  params: [
    {id: 'sibling', defaultValue: '%%'}
  ],
  impl: (ctx,sibling) => {
    const cmp = ctx.vars.cmp
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map(el => +el.getAttribute('jb-original-index'))
    const targetIndex = sibling ? jb.ui.indexOfElement(sibling) : indeces.length
    const result = indeces[targetIndex-1]
    jb.log('itemlist DD orignialIndexFromSibling',{sibling, indeces,targetIndex, result,ctx})
    return result
  }
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(css.class('drag-handle'), css('{cursor: pointer}'))
})
;

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', itemlist.applyDeltaOfNextPage('%$pageSize%')),
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      rx.merge(
        source.frontEndEvent('scroll'),
        source.frontEndEvent('wheel')
      ),
      rx.var('applicative','%target/__appScroll%'),
      rx.do(action.if('%$applicative%', runActions(
        log('itemlist applicative scroll terminated'),
        ({data}) => data.target.__appScroll = null
      ))),
      rx.filter(not('%$applicative%')),
      rx.var('scrollPercentFromTop',({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.log('itemlist frontend infiniteScroll'),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      sink.BEMethod('fetchNextPage')
    )
  )
})

jb.component('itemlist.applyDeltaOfNextPage', {
  type: 'action',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: (ctx,pageSize) => {
    const $props = ctx.vars.$props, cmp = ctx.vars.cmp, $state = cmp.state, cmpId = cmp.cmpId
    $state.visualSizeLimit = $state.visualSizeLimit || $props.visualSizeLimit
    const nextPageItems = $props.allItems.slice($state.visualSizeLimit, $state.visualSizeLimit + pageSize)
    $state.visualSizeLimit = $state.visualSizeLimit + nextPageItems.length
    if (nextPageItems.length == 0) return null
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true)
      .setVars({$cmpId: cmpId, $cmpVer: cmp.ver+1, $baseIndex: $state.visualSizeLimit - nextPageItems.length})
      .ctx({profile: {...cmp.ctx.profile, items: () => nextPageItems}, path: ''}) // change the profile to return itemsToAppend
    const deltaCmp = deltaCalcCtx.runItself()
    const vdomOfDeltaItems = deltaCmp.renderVdom()
    cmp.renderProps.items = [...cmp.renderProps.items, ...deltaCmp.renderProps.items]
    cmp.renderProps.ctrls = [...cmp.renderProps.ctrls, ...deltaCmp.renderProps.ctrls]
    const itemsParent = jb.ui.find(vdomOfDeltaItems,'.jb-items-parent')[0] || vdomOfDeltaItems
    const appendDelta = { children: {toAppend: jb.ui.stripVdom(itemsParent).children } }
    const deltaOfItems = itemsParent == vdomOfDeltaItems ? appendDelta : { _$bySelector: {'.jb-items-parent': appendDelta} }
    const deltaOfCmp = { attributes: { $scrollDown: true, $__state : JSON.stringify($state) } }

    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfItems,cmpId,assumedVdom: jb.ui.elemToVdom(jb.ui.elemOfCmp(ctx,cmpId))})
    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfCmp,cmpId})
  }
})

jb.component('itemlist.deltaOfItems', {
  impl: ctx => {
    const cmp = ctx.vars.cmp
    const newVdom = cmp.renderVdom(), oldVdom = cmp.oldVdom || {}
    const delta = jb.ui.compareVdom(oldVdom,newVdom,ctx)
    cmp.oldVdom = newVdom
    jb.log('uiComp itemlist delta incrementalFromRx', {cmp, newVdom, oldVdom, delta})
    return delta
  }
})

jb.component('itemlist.incrementalFromRx', {
  type: 'feature',
  params: [
    {id: 'prepend', as: 'boolean', boolean: 'last at top' }
  ],
  impl: followUp.flow(
      source.callbag(ctx => ctx.exp('%$$props.items%').callbag || jb.callbag.fromIter([])),
      rx.map(If('%vars%','%data%','%%')), // rx/cb compatible ...
      rx.do(({data},{$props}) => $props.items.push(data)),
      rx.var('delta', itemlist.deltaOfItems()),
      sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
    )
})

jb.component('itemlist.calcSlicedItems', {
  impl: ctx => {
    const {allItems, visualSizeLimit, items} = ctx.vars.$props
    if (items) return items
    const firstItem = allItems[0]
    if (jb.callbag.isCallbag(firstItem)) {
      const res = []
      res.callbag = firstItem
      return res
    }
    const slicedItems = allItems.length > visualSizeLimit ? allItems.slice(0, visualSizeLimit) : allItems
    const itemsRefs = jb.db.isRef(jb.db.asRef(slicedItems)) ? Object.keys(slicedItems).map(i=> jb.db.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs
  }
})
;

var { search, itemlistContainer } = jb.ns('search,itemlistContainer')

jb.component('group.itemlistContainer', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature',
  category: 'itemlist:80,group:70',
  params: [
    {id: 'initialSelection', as: 'single'}
  ],
  impl: features(
	feature.serviceRegistey(),
    watchable('itemlistCntrData',{'$': 'object', search_pattern: '', selected: '%$initialSelection%'}),
    variable({ // not watchable
		name: 'itemlistCntr',
		value: {'$': 'object', filters: () => []},
    })
  )
})

jb.component('itemlistContainer.filter', {
  type: 'aggregator',
  category: 'itemlist-filter:100',
  requireService: 'dataFilters',
  params: [
    {id: 'updateCounters', as: 'boolean'},
  ],
  impl: (ctx,updateCounters) => {
			if (!ctx.vars.itemlistCntr) return;
			const res = ctx.vars.itemlistCntr.filters.reduce((items,f) => f.filter(items), ctx.data || []);
			if (updateCounters) { // use merge
					jb.delay(1).then(_=>{
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),(ctx.data || []).length, ctx);
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','ref'),resBeforeMaxFilter.length, ctx);
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length, ctx);
			}) } else {
				ctx.vars.itemlistCntrData.countAfterFilter = res.length
			}
			return res;
	}
})

jb.component('itemlistContainer.search', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'Search'},
    {id: 'searchIn', type: 'search-in', dynamic: true, defaultValue: search.searchInAllProperties()},
    {id: 'databind', as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcSearch(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: controlWithFeatures(ctx => jb.ui.ctrl(ctx.cmpCtx), features(
		calcProp('init', (ctx,{cmp, itemlistCntr},{searchIn,databind}) => {
				if (!itemlistCntr) return
				itemlistCntr.filters.push( {
					filter: items => {
						const toSearch = jb.val(databind()) || '';
						if (jb.frame.Fuse && jb.path(searchIn,'profile.$') == 'search.fuse')
							return toSearch ? new jb.frame.Fuse(items, searchIn()).search(toSearch).map(x=>x.item) : items
						if (typeof searchIn.profile == 'function') // improved performance
							return items.filter(item=>toSearch == '' || searchIn.profile(item).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)

						return items.filter(item=>toSearch == '' || searchIn(ctx.setData(item)).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
				}})
		}),
		frontEnd.selectionKeySourceService(),
  	))
})

jb.component('itemlistContainer.moreItemsButton', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeMaxFilter%)'},
    {id: 'delta', as: 'number', defaultValue: 200},
    {id: 'style', type: 'button.style', defaultValue: button.href(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: controlWithFeatures(ctx => jb.ui.ctrl(ctx.cmpCtx), features(
      watchRef('%$itemlistCntrData/maxItems%'),
      method(
        'onclickHandler',
        writeValue(
          '%$itemlistCntrData/maxItems%',
          (ctx,{itemlistCntrData},{delta}) => delta + itemlistCntrData.maxItems
        )
      ),
      calcProp({
        id: 'title',
        value: (ctx,{},{title,delta}) => title(ctx.setVar('delta',delta))
      }),
      ctx => ({
		templateModifier: (vdom,cmp,state) => { // hide the button when not needed
			if (cmp.ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','number') == cmp.ctx.exp('%$itemlistCntrData/countAfterFilter%','number'))
				return '';
			return vdom;
		}
	  }))
  )
})

jb.ui.extractPropFromExpression = exp => { // performance for simple cases such as %prop1%
	if (exp.match(/^%.*%$/) && !exp.match(/[./[]/))
		return exp.match(/^%(.*)%$/)[1]
}

// match fields in pattern itemlistCntrData/FLDNAME_filter to data
jb.component('itemlistContainer.filterField', {
  type: 'feature',
  category: 'itemlist:80',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'fieldData', dynamic: true, mandatory: true},
    {id: 'filterType', type: 'filter-type'}
  ],
  impl: feature.init((ctx,{cmp,itemlistCntr},{fieldData,filterType}) => {
	  if (!itemlistCntr) return
	  if (!itemlistCntr.filters.find(f=>f.cmpId == cmp.cmpId)) 
			itemlistCntr.filters.push({
				cmpId: cmp.cmpId,
				filter: items=> {
					const filterValue = jb.val(ctx.vars.$model.databind())
					if (!filterValue) return items
					const res = items.filter(item=>filterType.filter(filterValue, fieldData(ctx.setData(item))))
					if (filterType.sort && (!cmp.state.sortOptions || cmp.state.sortOptions.length == 0) )
						filterType.sort(res,item => fieldData(ctx.setData(item)),filterValue)
					return res
					}
			})
	})
})

jb.component('filterType.text', {
  type: 'filter-type',
  params: [
    {id: 'ignoreCase', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: (ctx,ignoreCase) => ignoreCase ? ({
		filter: (filter,data) => (data||'').toLowerCase().indexOf((filter||'').toLowerCase()) != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b','i');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.toLowerCase().indexOf(filter.toLowerCase()) == 0 ? 3 : 0); // higher score for wholeWord or beginsWith
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	}) : ({
		filter: (filter,data) => (data||'').indexOf(filter||'') != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.indexOf(filter) == 0 ? 3 : 0);
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	})
})

jb.component('filterType.exactMatch', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) =>  {
			const _filter = (filter||'').trim(), _data = (data||'').trim();
			return _data.indexOf(_filter) == 0 && _data.length == _filter.length;
		}
	})
})

jb.component('filterType.numeric', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) => Number(data) >= Number(filter),
		sort: (items,itemToData) => items.sort((item1,item2)=> Number(itemToData(item1)) - Number(itemToData(item2)))
	})
})

jb.component('search.searchInAllProperties', {
  type: 'search-in',
  impl: ctx => {
		if (typeof ctx.data == 'string') return ctx.data;
		if (typeof ctx.data != 'object') return '';
		return jb.entries(ctx.data).map(e=>e[1]).filter(v=>typeof v == 'string').join('#');
	}
})

jb.component('search.fuse', {
	type: 'search-in',
	description: 'fuse.js search https://fusejs.io/api/options.html#basic-options',
	params: [
		{ id: 'keys', as: 'array', defaultValue: list('id','name'), description: 'List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects' },
		{ id: 'findAllMatches', as: 'boolean', defaultValue: false, description: 'When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string' },
		{ id: 'isCaseSensitive', as: 'boolean', defaultValue: false },
		{ id: 'minMatchCharLength', as: 'number', defaultValue: 1, description: 'Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2)' },
		{ id: 'shouldSort', as: 'boolean', defaultValue: true, description: 'Whether to sort the result list, by score' },
		{ id: 'location', as: 'number', defaultValue: 0, description: 'Determines approximately where in the text is the pattern expected to be found' },
		{ id: 'threshold', as: 'number', defaultValue: 0.6, description: 'At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything' },
		{ id: 'distance', as: 'number', defaultValue: 100, description: 'Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch' },
//		{ id: 'includeScore', as: 'boolean', defaultValue: false },
//		{ id: 'includeMatches', as: 'boolean', defaultValue: false },
	],
	impl: ctx => ({ fuseOptions: true, ...ctx.params})
})
;

var { mdcStyle,table } = jb.ns('mdcStyle,table')

jb.component('table', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'table.style', defaultValue: table.plain()},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true},
    {id: 'lineFeatures', type: 'feature[]', dynamic: true, flattenArray: true},
  ],
  impl: itemlist({
    vars: Var('$tableModel', ({},{},params) => params),
    items: '%$items()%', style: '%$style.itemlistStyle()%', itemVariable: '%$itemVariable%', visualSizeLimit: '%$visualSizeLimit%', features: '%$features()%',
    controls: group({
      controls: '%$controls()%',
      style: '%$style.lineStyle()%',
      features: '%$lineFeatures()%'
    })
  })
})

jb.component('table.style', {
    type: 'table.style',
    params: [
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true},
      {id: 'lineStyle', type: 'group.style', dynamic: true, defaultValue: table.trTd() },
    ],
    impl: ctx => ctx.params
})

jb.component('table.plain', { // todo change to table.plain after itemlist => table refactor
  type: 'table.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  impl: table.style(customStyle({
    template: (cmp,{ctrls,hideHeaders,headerFields},h) => h('div.jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
        headerFields.map(f=>h('th',{'jb-ctx': f.ctxId, ...(f.width &&  { style: `width: ${f.width}px` }) }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-items-parent',{}, ctrls.map( ctrl=> h(ctrl[0]))),
        ctrls.length == 0 ? 'no items' : ''            
    ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: [
      itemlist.init(), 
      calcProp('headerFields', '%$$tableModel/controls()/field()%')
    ]
  }))
})

jb.component('table.mdc', {
  type: 'table.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}    
  ],
  impl: table.style({ itemlistStyle: customStyle({
    template: (cmp,{ctrls,sortOptions,hideHeaders,classForTable,headerFields},h) => 
      h('div.jb-itemlist mdc-data-table',{}, h('table',{class: classForTable}, [
        ...(hideHeaders ? [] : [h('thead',{},h('tr.mdc-data-table__header-row',{},
            headerFields.map((f,i) =>h('th.mdc-data-table__header-cell',{
            'jb-ctx': f.ctxId, 
            class: [ 
                (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdc-data-table__header--sorted-ascending': '',
                (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdc-data-table__header--sorted-descending': '',
              ].filter(x=>x).join(' '), 
            style: { width: f.width ? f.width + 'px' : ''},
            onclick: 'toggleSort',
            fieldIndex: i
            }
            ,jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-items-parent mdc-data-table__content',{},ctrls.map( ctrl=> h(ctrl[0]))),
        ctrls.length == 0 ? 'no items' : ''            
    ])),
    css: `{width: 100%}  
    ~ .mdc-data-table__header-cell, ~ .mdc-data-table__cell {color: var(--jb-fg)}`,
    features: [
      itemlist.init(), mdcStyle.initDynamic(), 
      calcProp('headerFields', '%$$tableModel/controls()/field()%')
    ]
  }), 
  lineStyle: customStyle({
        template: ({},{ctrls},h) => h('tr.jb-item mdc-data-table__row',{}, ctrls.map(ctrl=> h('td.mdc-data-table__cell',{}, h(ctrl)))),
        features: group.initGroup()
    })
  })
})

jb.component('table.trTd', {
    type: 'group.style',
    impl: customStyle({
      template: ({},{ctrls},h) => h('tr.jb-item',{}, ctrls.map(ctrl=> h('td',{}, h(ctrl)))),
      features: group.initGroup()
    })
})

jb.component('table.enableExpandToEndOfRow', {
  type: 'feature',
  category: 'line-feature',
  description: 'allows expandToEndOfRow in table, set as lineFeatures',
  impl: templateModifier( ({},{$props,vdom}) => {
    const expandIndex = $props.ctrls.findIndex(ctrl=> ctrl.renderProps.expandToEndOfRow)
    if (expandIndex != -1) {
        const colspan = vdom.children.length - expandIndex
        vdom.children = vdom.children.slice(0,expandIndex+1)
        vdom.children[expandIndex].setAttribute('colspan',''+colspan)
    }
  }),
})

jb.component('feature.expandToEndOfRow', {
    type: 'feature',
    category: 'table-field',
    description: 'requires table.enableExpandToEndOfRow as lineFeature. Put on a field to expandToEndOfRow by condition',
    params: [
        {id: 'condition', as: 'boolean', dynamic: true}
    ],
    impl: calcProp('expandToEndOfRow','%$condition()%')
});

var { menu,menuStyle,menuSeparator,icon,key} = jb.ns('menu,menuStyle,menuSeparator,icon,key')

jb.component('menu.menu', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true, defaultValue: []},
    {id: 'icon', type: 'icon' },
    {id: 'optionsFilter', type: 'data', dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({
		options: function(ctx2) {
      const ctxWithDepth = ctx.setVars({...ctx.vars, ...(ctx2 && ctx2.vars), menuDepth: this.ctx.vars.menuDepth })
      return ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctxWithDepth)))
    },
    title: ctx.params.title(),
    icon: ctx.params.icon,
		runShortcut: function(event) {
			return this.options().reduce((res,o)=> res || (o.runShortcut && o.runShortcut(event)),false)
		},
		ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
	})
})

jb.component('menu.dynamicOptions', {
  type: 'menu.option',
  params: [
    {id: 'items', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericOption', type: 'menu.option', mandatory: true, dynamic: true}
  ],
  impl: pipeline('%$items()%', call('genericOption'))
})

jb.component('menu.endWithSeparator', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true},
    {id: 'separator', type: 'menu.option', defaultValue: menu.separator()},
    {id: 'title', as: 'string'}
  ],
  impl: pipeline(
      Var('opts','%$options()%'), 
      If('%$opts/length%>0', list('%$opts%','%$separator%'))
  )
})

jb.component('menu.separator', {
  type: 'menu.option',
  impl: obj(prop('separator',true))
})

jb.component('menu.action', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'icon', type: 'icon' },
    {id: 'shortcut', as: 'string'},
    {id: 'showCondition', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: ctx => ctx.params.showCondition && ({
			leaf : ctx.params,
			action: _ => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
      title: ctx.params.title(ctx),
      shortcut: ctx.params.shortcut,
			runShortcut: event => {
				if (ctx.run(key.eventMatchKey(() => event.ev, () => ctx.params.shortcut)))
					ctx.params.action()
			},
			ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
		})
})

// ********* actions / controls ************

jb.component('menu.control', {
  type: 'control,clickable,menu',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'style', type: 'menu.style', defaultValue: menuStyle.contextMenu(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
    const model = ctx.params.menu()
    if (!model) debugger
    const menuModel = model || { options: [], ctx, title: ''}
    const ctxWithModel = ctx.setVars({menuModel})
    const ctxToUse = ctx.vars.topMenu ? ctxWithModel : jb.ui.extendWithServiceRegistry(ctxWithModel.setVar('topMenu',{}))
    jb.log('menu create uiComp',{topMenu: ctx.vars.topMenu, menuModel,ctx,ctxToUse})
    return jb.ui.ctrl(ctxToUse, features(
      () => ({ctxForPick: menuModel.ctx }),
      calcProp('title','%$menuModel.title%'),
      htmlAttribute('menuDepth', '%$menuModel/ctx/vars/menuDepth%'),
    ))
	}
})

jb.component('menu.openContextMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()},
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.contextMenu()},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'id', as: 'string' } 
  ],
  impl: openDialog({
    id: '%$id%',
    style: call('popupStyle'),
    content: menu.control({menu: call('menu'), style: call('menuStyle')}),
    features: call('features')
  })
})

// ********* styles ************

jb.component('menuStyle.pulldown', {
  type: 'menu.style',
  params: [
    {id: 'innerMenuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'layout', type: 'group.style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('innerMenuStyle', '%$innerMenuStyle%'),
    Var('leafOptionStyle', '%$leafOptionStyle%'),
    itemlist({
      items: '%$menuModel.options()%',
      controls: menu.control({menu: '%$item%', style: menuStyle.popupThumb()}),
      style: call('layout'),
      features: menu.selection()
    })
  )
})

jb.component('menuStyle.contextMenu', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', '%$leafOptionStyle%'),
    itemlist({
      items: '%$menuModel.options()%',
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({})}),
      features: menu.selection()
    })
  )
})

jb.component('menu.initPopupMenu', {
  type: 'feature',
  params: [
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()}
  ],
  impl: features(
    calcProp('title', '%$menuModel.title%'),
    method('openPopup', runActions(
      parentCtx => parentCtx.run(menu.openContextMenu({
        popupStyle: call('popupStyle'),
        menu: () => parentCtx.run(If('%$innerMenu%','%$innerMenu.menu()%', '%$$model.menu()%')),
      }))
    )),
    method('closePopup', dialog.closeDialogById('%$optionsParentId%')),
    method('openNewPopup', runActions(action.runBEMethod('closePopup'), action.runBEMethod('openPopup'))),
    frontEnd.onDestroy(action.runBEMethod('closePopup')),
    menu.passMenuKeySource(),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==39'), sink.BEMethod('openPopup')),
    frontEnd.flow(source.findMenuKeySource(), rx.filter(inGroup(list(37,27),'%keyCode%')), sink.BEMethod('closePopup')),
  )
})

jb.component('menu.initMenuOption', {
  type: 'feature',
  impl: features(
    calcProp({id: 'title', value: '%$menuModel.leaf.title%'}),
    calcProp({id: 'icon', value: '%$menuModel.leaf.icon%'}),
    calcProp({id: 'shortcut', value: '%$menuModel.leaf.shortcut%'}),
    method('closeAndActivate', //action.if(equals('%$topMenu.selected%','%$menuModel%'),
      runActions(
        dialog.closeAllPopups(),
        '%$menuModel.action()%'
    )),
    menu.passMenuKeySource(),
    frontEnd.flow( source.findMenuKeySource(), rx.filter('%keyCode%==13'), sink.BEMethod('closeAndActivate'))
  )
})

jb.component('menuStyle.applyMultiLevel', {
  type: 'menu.style',
  params: [
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'separatorStyle', type: 'menu-separator.style', defaultValue: menuSeparator.line()}
  ],
  impl: (ctx,menuStyle,leafStyle,separatorStyle) => {
    const {menuModel,leafOptionStyle, innerMenuStyle } = ctx.vars
			if (menuModel.leaf)
				return leafOptionStyle ? leafOptionStyle(ctx) : leafStyle();
			else if (menuModel.separator)
				return separatorStyle
			else if (innerMenuStyle)
				return innerMenuStyle(ctx)
			else
				return menuStyle()
		}
})

// jb.component('menu.apply-context-menu-shortcuts', {
//   type: 'feature',
//   impl: ctx => ({
//   	 onkeydown: true,
//      afterViewInit: cmp => {
//         cmp.base.setAttribute('tabIndex','0');
//         if (!ctx.vars.topMenu.keydown) {
//   	        ctx.vars.topMenu.keydown = cmp.onkeydown;
//             jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
//       	};
//         const keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.runShortcut(e))
//       }
//     })
// })

jb.component('menu.selection', {
  type: 'feature',
  impl: features(
    htmlAttribute('tabIndex',0),
    css('>.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }'),
    userStateProp('selected',0),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method('closeMenu',dialog.closeDialog()),
    menu.selectionKeySourceService(),
    menu.passMenuKeySource(),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        elem.classList.add('selected')
        elem.scrollIntoViewIfNeeded()
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.flow(source.findMenuKeySource(), 
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40),'%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40',1,-1), menu.notSeparator('%%') )),
      sink.FEMethod('setSelected')
    ),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==27'), sink.BEMethod('closeMenu')),
    frontEnd.flow(source.frontEndEvent('mousemove'),
      rx.filter(menu.notSeparator('%target%')),
      rx.var('elem',({data}) => data.target.ownerDocument.elementsFromPoint(data.pageX, data.pageY)[0]),
      rx.var('ctxId',itemlist.indexOfElem('%$elem%')),
      rx.map('%$ctxId%'),
      rx.distinctUntilChanged(),
      sink.FEMethod('setSelected')
    ),
  )
})
  
jb.component('menu.selectionKeySourceService', {
  type: 'feature',
  impl: If('%$$serviceRegistry/services/menuKeySource%', [], features( // regiter service only for top ctrl
    service.registerBackEndService('menuKeySource', '%$cmp/cmpId%'),
    frontEnd.prop('menuKeySource', (ctx,{cmp,el}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([37,38,39,40,13,27].indexOf(e.keyCode) != -1) {
          jb.log('menuKeySource',{ctx,cmp,e})
          el.keydown_src.next(ctx.dataObj(e))
          return false // stop propagation
        }
        return true
      }
      jb.ui.focus(el,'menu.selectionKeySourceService',ctx)
      jb.log('menuKeySource register',{cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
  ))
})

jb.component('menu.passMenuKeySource', {
  type: 'feature',
  impl: frontEnd.var('menuKeySourceCmpId', '%$$serviceRegistry/services/menuKeySource%'),
})

jb.component('source.findMenuKeySource', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'clientCmp', defaultValue: '%$cmp%' }    
  ],
  impl: rx.pipe(
    rx.merge( 
      source.data([]),
      (ctx,{menuKeySourceCmpId},{clientCmp}) => {
        jb.log('search menuKeySource',{menuKeySourceCmpId,clientCmp,ctx})
        const el = jb.ui.elemOfCmp(ctx,menuKeySourceCmpId)
        const ret = jb.path(el, '_component.menuKeySource')
        if (!ret)
          jb.log('menuKeySource notFound',{menuKeySourceCmpId,clientCmp,el,ctx})
        else
          jb.log('found menuKeySource',{menuKeySourceCmpId,clientCmp,el,ctx})
        return ret
      }
    ),
    rx.var('cmp','%$clientCmp%'),
    rx.takeUntil('%$cmp.destroyed%'),
    rx.filter(menu.isRelevantMenu()),
    rx.log('from menuKeySource')
  )
})

jb.component('menu.isRelevantMenu', {
  impl: ctx => {
    const key = ctx.data.keyCode
    const el = ctx.vars.cmp.base
    const menus = jb.ui.find(ctx,'[menuDepth]').filter(el=>jb.ui.hasClass(el,'jb-itemlist'))
    const maxDepth = menus.reduce((max,el) => Math.max(max,+el.getAttribute('menudepth')),0)
    const depth = +el.getAttribute('menudepth') || 0
    const isSelected = jb.ui.parents(el,{includeSelf: true}).find(el=>jb.ui.hasClass(el,'selected'))
    const isMenu = jb.ui.hasClass(el,'jb-itemlist')
    const upDownInMenu = isMenu && (key == 40 || key == 38 || key == 27) && depth == maxDepth
    const leftArrowEntryBefore = isSelected && (key == 37 || key == 27) && depth == maxDepth 
    const rightArrowCurrentEntry = isSelected && (key == 39 || key == 13) && depth == maxDepth + 1
    const res = upDownInMenu || leftArrowEntryBefore || rightArrowCurrentEntry
    jb.log('check isRelevantMenu',{res,key,el,isMenu,isSelected,depth,maxDepth,upDownInMenu,leftArrowEntryBefore,rightArrowCurrentEntry,menus})
    return res
  }
})


jb.component('menuStyle.optionLine', {
  type: 'menu-option.style',
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20})),
				h('span.title',{},title),
				h('span.shortcut',{},shortcut),
        h('div.mdc-line-ripple'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }
				>i { padding: 3px 8px 0 3px }
				>span { padding-top: 3px }
				>.title { display: block; text-align: left; white-space: nowrap; }
				>.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
    features: [menu.initMenuOption(), feature.mdcRippleEffect()]
  })
})

jb.component('menuStyle.popupAsOption', {
  type: 'menu.style',
  impl: customStyle({
    template: (cmp,{title},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
				h('span.title',{},title),
				h('i.material-icons', { onmouseenter: 'openPopup' },'play_arrow'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				>i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
						>.title { display: block; text-align: left; padding-top: 3px; padding-left: 32px; white-space: nowrap; }
			`,
    features: menu.initPopupMenu(dialog.contextMenuPopup(-24, true))
  })
})

jb.component('menuStyle.popupThumb', {
  type: 'menu.style',
  description: 'used for pulldown',
  impl: customStyle({
    template: ({},{title},h) => h('div.pulldown-top-menu-item',{ onclick: 'openPopup'}, title),
    features: [
      menu.initPopupMenu(), 
      feature.mdcRippleEffect(),
      frontEnd.flow(source.frontEndEvent('mouseenter'), 
        rx.filter(ctx => jb.ui.find(ctx,'.pulldown-mainmenu-popup')[0]), // the first 'open popup' needs a click
        sink.BEMethod('openNewPopup')
      )
    ]
  })
})

jb.component('dialog.contextMenuPopup', {
  type: 'dialog.style',
  params: [
    {id: 'offsetTop', as: 'number'},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'toolbar', as: 'boolean', type: 'boolean'},
  ],
  impl: customStyle({
    template: ({},{contentComp,toolbar},h) => h('div.jb-dialog jb-popup context-menu-popup', 
      { class: toolbar ? 'toolbar-popup' : 'pulldown-mainmenu-popup'}, h(contentComp)),
    features: [
      dialogFeature.uniqueDialog('%$optionsParentId%', false),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({
        offsetTop: '%$offsetTop%',
        rightSide: '%$rightSide%'
      })
    ]
  })
})

jb.component('menuSeparator.line', {
  type: 'menu-separator.style',
  impl: customStyle({
    template: ({},{},h) => h('div', {separator: true}),
    css: '{ margin: 6px 0; border-bottom: 1px solid var(--jb-menu-separator-fg);}',
  })
})

jb.component('menu.notSeparator',{
  type: 'boolean',
  params: [
    { id: 'elem' }
  ],
  impl: (ctx,elem) => elem.firstElementChild && !elem.firstElementChild.getAttribute('separator')
})

/***** icon menus */

jb.component('menuStyle.toolbar', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.icon()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal(5)},
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', '%$leafOptionStyle%'),
    itemlist({
      style: call('itemlistStyle'),
      items: '%$menuModel/options()%',
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({
        menuStyle: menuStyle.iconMenu(), leafStyle: menuStyle.icon()
      })}),
    })
  )
})

jb.component('menuStyle.icon', {
  type: 'menu-option.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 20 },
  ],
  impl: styleWithFeatures(
      button.mdcIcon('%$menuModel/leaf/icon%','%$buttonSize%'),
      feature.onEvent('click', '%$menuModel.action()%')
  )
})

jb.component('menuStyle.iconMenu', {
  type: 'menu.style',
  impl: styleByControl(
      button({
        title: '%title%',
        action: action.runBEMethod('openPopup'),
        style: button.mdcIcon(
          icon({
            icon: '%icon/icon%',
            type: '%icon/type%',
            features: css('transform: translate(7px,0px) !important')
          }), 16),
        features: [feature.icon({
          icon: 'more_vert',
          type: 'mdc',
          features: css('transform: translate(-3px,0px) !important')
        }),
          menu.initPopupMenu(dialog.contextMenuPopup({toolbar: true, rightSide: true}))
        ]
      }),
    'innerMenu'),
})
;

var {picklist} = jb.ns('picklist')

jb.component('picklist', {
  type: 'control',
  description: 'select, choose, pick, choice',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, templateValue: picklist.optionsByComma()},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'picklist.style', defaultValue: picklist.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('picklist.init', {
  type: 'feature',
  impl: features(
    calcProp('options', '%$$model/options()%'),
    calcProp('hasEmptyOption', (ctx,{$props}) => $props.options.filter(x=>!x.text)[0]),
  )
})

jb.component('picklist.allowAsynchOptions', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  impl: features(
    calcProp({
      id: 'options', 
      priority: 5, phase: 5,
      value: ({},{$state,$model},{}) => {
        const val = $state.options || $model.options()
        if (Array.isArray(val)) return val
        const res = []
        res.delayed = val
        return res
      },
    }),
    followUp.flow(
      source.any(({},{$state,$props}) => {
        if ($state.options) return []
        return $props.options.delayed || $props.options
      }),
      rx.log('followUp allowAsynchValue'),
      sink.refreshCmp(firstSucceeding('%data%','%%'))
    ),
  )
})

jb.component('picklist.onChange', {
  category: 'picklist:100',
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: method('onValueChange', call('action'))
})

// ********* options

jb.component('picklist.optionsByComma', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'string', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.options', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'data', as: 'array', dynamic: true, mandatory: true},
    {id: 'code', as: 'string', dynamic: true, defaultValue: '%%' },
    {id: 'text', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'icon', type: 'icon', dynamic: true },
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,code,text,icon,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat(options().map(option => ({ code: code(ctx.setData(option)), text: text(ctx.setData(option)), icon: icon(ctx.setData(option)) })));
  }
})

jb.component('picklist.sortedOptions', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, composite: true},
    {id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50'}
  ],
  impl: (ctx,optionsFunc,marks) => {
    let options = optionsFunc() || [];
    marks.forEach(mark=> {
        const option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

jb.component('picklist.promote', {
  type: 'picklist.promote',
  params: [
    {id: 'groups', as: 'array'},
    {id: 'options', as: 'array'}
  ],
  impl: ctx => ctx.params
})

jb.component('picklist.initGroups', {
  type: 'feature',
  impl: calcProp({id: 'groups', phase: 20, value: (ctx,{$model, $props}) => {
    const options = $props.options;
    const groupsHash = {};
    const promotedGroups = ($model.promote() || {}).groups || [];
    const groups = [];
    options.filter(x=>x.text).forEach(o=>{
      const groupId = groupOfOpt(o);
      const group = groupsHash[groupId] || { options: [], text: groupId};
      if (!groupsHash[groupId]) {
        groups.push(group);
        groupsHash[groupId] = group;
      }
      group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
    })
    groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
    return groups

    function groupOfOpt(opt) {
      if (!opt.group && opt.text.indexOf('.') == -1)
        return '---';
      return opt.group || opt.text.split('.').shift();
    }
  }}),
})
;

var {multiSelect, removeFromArray, addToArray } = jb.ns('multiSelect')

jb.component('multiSelect', {
    type: 'control',
    description: 'select list of options, check multiple',
    category: 'input:80',
    params: [
      {id: 'title', as: 'string', dynamic: true},
      {id: 'databind', as: 'ref', mandaroy: true, dynamic: true },
      {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true },
      {id: 'promote', type: 'picklist.promote', dynamic: true},
      {id: 'style', type: 'multiSelect.style', defaultValue: picklist.native(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiSelect.modelAsBooleanRef',{
    params: [
        {id: 'multiSelectModel'},
        {id: 'code'},
    ],
    impl: (ctx,multiSelectModel,code) => {
        const ref = multiSelectModel.databind()
        return { $jb_val: val => val === undefined ? has() : val === true ? add() : remove() }

        function has() { return jb.val(ref).indexOf(code) != -1 }
        function add() { if (!has(code)) jb.push(ref, code,ctx) }
        function remove() { 
            const index = jb.val(ref).indexOf(code)
            index != -1 && jb.db.splice(ref,[[index,1]],ctx)
        }
    }
})

jb.component('multiSelect.choiceList', {
    type: 'multiSelect.style',
    params: [
      {id: 'choiceStyle', type: 'editable-boolean.style', dynamic: true, defaultValue: editableBoolean.checkboxWithLabel()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    ],
    impl: styleByControl(
      itemlist({
        items: '%$multiSelectModel/options%',
        controls: editableBoolean({
            textForTrue: '%text%',
            textForFalse: '%text%',
            databind: multiSelect.modelAsBooleanRef('%$multiSelectModel%','%code%'),
            style: call('choiceStyle')
        }),
        style: call('itemlistStyle'),
        features: watchRef({ref: '%$multiSelectModel/databind%', includeChildren: 'yes'})
      }),
      'multiSelectModel'
    )
})

jb.component('multiSelect.chips', {
    type: 'multiSelect.style',
    params: [
      {id: 'chipStyle', type: 'text.style', dynamic: true, defaultValue: text.chip()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    ],
    type: 'multiSelect.style',
    impl: styleByControl(group({
        layout: layout.horizontal(),
        controls: [
            itemlist({
                items: '%$multiSelectModel/databind%',
                style: call('itemlistStyle'),
                controls: group({
                    layout: layout.flex({wrap: 'wrap', spacing: '4'}),
                    controls: [
                        text({
                            text: '%% ', 
                            style: call('chipStyle'),
                            features: itemlist.dragHandle()
                        }),
                        button({
                            title: 'delete',
                            style: button.x(),
                            action: removeFromArray('%$multiSelectModel/databind%','%%'),
                            features: [
                                css('z-index: 1000;margin-left: -25px'),
                                itemlist.shownOnlyOnItemHover()
                            ]
                        })
                ]}),
                features: itemlist.dragAndDrop()
            }),
            picklist({
                options: pipeline('%$multiSelectModel/options%',filter(not(inGroup('%$multiSelectModel/databind%','%code%')))),
                features: [
                    picklist.onChange(addToArray('%$multiSelectModel/databind%','%%')),
                    picklist.plusIcon(),
                ]
            }),
        ],
        features: watchRef({
            ref: '%$multiSelectModel/databind%', includeChildren: 'yes', allowSelfRefresh: true, strongRefresh: false
        })
    }), 'multiSelectModel')
})
;

jb.component('defaultTheme', {
  impl: ctx => jb.ui.addStyleElem(ctx,`
    body {
      /* vscode compatible with light theme */
      --jb-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
      --jb-font-size: 13px;
      --jb-font-weight: normal;
      --jb-fg: #616161;
    
      --jb-menu-bg: #ffffff;
      --jb-menu-fg: #616161;
      --jb-menu-selection-bg: #006ab1;
      --jb-menu-selection-fg: #ffffff;
      --jb-menu-separator-fg: #888888;
      --jb-menubar-selection-bg: rgba(0, 0, 0, 0.1);
      --jb-menubar-selection-fg: #333333;
      --jb-menubar-active-bg: #dddddd;
      --jb-menubar-active-fg: #333333;
      --jb-menubar-inactive-bg: rgba(221, 221, 221, 0.6);
      --jb-dropdown-bg: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-error-fg: #a1260d;
      --jb-success-fg: #4BB543;
      --jb-warning-fg: #ffcc00;
          
      --jb-input-bg: #ffffff;
      --jb-input-fg: #616161;
      --jb-textLink-active-fg: #034775;
      --jb-textLink-fg: #006ab1;

      --jb-on-primary: #ffffff;
      --jb-on-secondary: #616161;
      
      --jb-icon-fg: #424242;
    
      --jb-list-active-selection-bg: #0074e8;
      --jb-list-active-selection-fg: #ffffff;
    
    
    /* mdc mappaing */
      --mdc-theme-primary: #616161; /* The theme primary color*/
      --mdc-theme-secondary: var(--jb-menubar-active-bg);
      --mdc-theme-background: var(--jb-input-bg);
      --mdc-theme-surface: var(--jb-input-bg);
      --mdc-theme-error: var(--jb-error-fg);
    
      --mdc-theme-on-primary: var(--jb-on-primary); /* Primary text on top of a theme primary color background */
      --mdc-theme-on-secondary: var(--jb-on-secondary);
      --mdc-theme-on-surface: var(--jb-input-fg);
      --mdc-theme-on-error: var(--jb-input-bg);
    
      --mdc-theme-text-primary-on-background: var(--jb-input-fg); /* Primary text on top of the theme background color. */
      --mdc-theme-text-secondary-on-background: var(--jb-input-fg);
      --mdc-theme-text-hint-on-background: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-background: var(--jb-input-fg);
      --mdc-theme-text-icon-on-background: var(--jb-input-fg);
      
      --mdc-theme-text-primary-on-light: var(--jb-input-fg); /* Primary text on top of a light-colored background */
      --mdc-theme-text-secondary-on-light: var(--jb-input-fg);
      --mdc-theme-text-hint-on-light: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-light: var(--jb-input-fg);
      --mdc-theme-text-icon-on-light: var(--jb-input-fg);
                                
      --mdc-theme-text-primary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-secondary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-hint-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-disabled-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-icon-on-dark: var(--jb-menu-selection-fg);

    /* jBart only */
      --jb-dropdown-shadow: #a8a8a8;
      --jb-tree-value: red;
      --jb-expandbox-bg: green;
 `)
})

jb.component('group.theme', {
  type: 'feature',
  params: [
    {id: 'theme', type: 'theme'}
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => ctx.setVars(theme)
  })
})

jb.component('theme.materialDesign', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdc-input'
  })
})
;

var { slider, editableNumber, mdcStyle } = jb.ns('slider,mdcStyle')

jb.component('editableNumber.sliderNoText', {
  type: 'editable-number.style',
  impl: customStyle({
      template: (cmp,{min,max,step,numbericVal},h) => h('input', { 
        type: 'range', value: numbericVal, mouseup: 'onblurHandler', tabindex: -1, min,max,step
      }),
      features: [ field.databind(0,true), slider.init(), slider.drag()]
  })
})

jb.component('editableNumber.slider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind()%',
            style: editableText.input(),
            features: [
              slider.init(),
              css(
                'width: 30px; padding-left: 3px; border: 0; border-bottom: 1px solid var(--jb-menubar-inactive-bg);'
              ),
              css('color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background)'),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind()%',
            style: editableNumber.sliderNoText(),
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',            
            features: [css.width(80), css.class('slider-input')]
          })
        ],
        features: watchRef({ref: '%$editableNumberModel/databind()%', allowSelfRefresh: true})
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSlider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind()%',
            style: editableText.input(),
            features: [
              slider.init(),
              css(
                'width: 40px; height: 20px; padding-top: 14px; padding-left: 3px; border: 0; border-bottom: 1px solid black; background: transparent;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind()%',
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',
            style: editableNumber.mdcSliderNoText({}),
          })
        ],
        features: watchRef({ref: '%$editableNumberModel/databind()%', allowSelfRefresh: true})
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSliderNoText', {
  type: 'editable-number.style',
  params: [
    { id: 'thumbSize', as: 'number', defaultValue: 21 },
    { id: 'cx', as: 'number', defaultValue: 10.5 },
    { id: 'cy', as: 'number', defaultValue: 10.5 },
    { id: 'r', as: 'number', defaultValue: 7.875 },
  ],
  impl: customStyle({
    template: (cmp,{title,min,max,step,numbericVal,thumbSize,cx,cy,r},h) =>
      h('div.mdc-slider mdc-slider--discrete',{tabIndex: -1, role: 'slider', 'data-step': step,
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': numbericVal, 'aria-label': title()}, [
        h('div.mdc-slider__track-container',{}, h('div.mdc-slider__track')),
        h('div.mdc-slider__thumb-container',{},[
          h('div.mdc-slider__pin',{},h('span.mdc-slider__pin-value-marker')),
          h('svg.mdc-slider__thumb',{ width: thumbSize, height: thumbSize}, h('circle',{cx,cy,r})),
          h('div.mdc-slider__focus-ring')
        ])
      ]),
    features: [
      field.databind(),
      slider.init(),
      frontEnd.init((ctx,{cmp}) => {
        cmp.mdcSlider = new jb.ui.material.MDCSlider(cmp.base)
        cmp.mdcSlider.listen('MDCSlider:change', () => ctx.run(action.runBEMethod('assignIgnoringUnits', ()=> cmp.mdcSlider.value)))
      }),
      frontEnd.onRefresh((ctx,{cmp,el}) => {
        if (!cmp.mdcSlider) return 
        cmp.mdcSlider.value = +el.getAttribute('aria-valuenow')
        cmp.mdcSlider.min = +el.getAttribute('aria-valuemin')
        cmp.mdcSlider.max = +el.getAttribute('aria-valuemax')
        cmp.mdcSlider.step = +el.getAttribute('data-step')
      }),
      frontEnd.onDestroy((ctx,{cmp}) => cmp.mdcSlider && cmp.mdcSlider.destroy()),
    ]
  })
})

jb.component('slider.init', {
  type: 'feature',
  impl: features(
    calcProp('numbericVal',({},{editableNumber,$model}) => editableNumber.numericPart(jb.val( $model.databind()))),
    calcProp('min'),
    calcProp('step'),      
    calcProp('max', (ctx,{$model,$props}) => {
        const val = $props.numbericVal
        if (val >= +$model.max && $model.autoScale)
          return val * 1.2
        return +$model.max
    }),
    method('delete',writeValue('%$$model/databind()%',() => null)),
    method('assignIgnoringUnits', (ctx,{editableNumber,$model}) => {
      const curVal = editableNumber.numericPart(jb.val($model.databind()))
      if (curVal === undefined) return
      jb.db.writeValue($model.databind(),editableNumber.calcDataString(ctx.data,ctx),ctx)
    }),
    method('incIgnoringUnits', (ctx,{editableNumber,$model,$props}) => {
      const curVal = editableNumber.numericPart(jb.val($model.databind()))
      if (curVal === undefined) return
      const nVal = curVal + ctx.data*$props.step
      const newVal = editableNumber.autoScale ? nVal : editableNumber.keepInDomain(nVal)
      jb.db.writeValue($model.databind(), editableNumber.calcDataString(newVal, ctx),ctx)
    }),
    frontEnd.flow(source.frontEndEvent('keydown'), rx.filter('%keyCode%==46'), sink.BEMethod('delete')),
    frontEnd.flow(source.frontEndEvent('keydown'), rx.filter('%keyCode%==39'), rx.map(If('%shiftKey%',9,1)), sink.BEMethod('incIgnoringUnits')),
    frontEnd.flow(source.frontEndEvent('keydown'), rx.filter('%keyCode%==37'), rx.map(If('%shiftKey%',-9,-1)), sink.BEMethod('incIgnoringUnits')),
  )
})

jb.component('slider.drag', {
  type: 'feature',
  impl: features(
    frontEnd.flow(source.frontEndEvent('mousemove'), rx.filter('%buttons%!=0'), sink.BEMethod('assignIgnoringUnits','%$cmp.base.value%')),
    frontEnd.flow(source.frontEndEvent('click'), sink.BEMethod('assignIgnoringUnits','%$cmp.base.value%'))
  )
})

;

jb.component('winUtils.gotoUrl', {
  type: 'action',
  description: 'navigate/open a new web page, change href location',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'target', type: 'enum', values: ['new tab', 'self'], defaultValue: 'new tab', as: 'string'}
  ],
  impl: (ctx,url,target) => {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		if (!ctx.probe)
			window.open(url,_target);
	}
})

;

var { divider } = jb.ns('divider')

jb.component('divider', {
    type: 'control',
    params: [
        { id: 'style', type: 'divider.style', defaultValue: divider.br() , dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'divider' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('divider.br', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: `{ border-top-color: var(--jb-menu-separator-fg); display: block; border-top-width: 1px; border-top-style: solid;margin-top: 10px; margin-bottom: 10px;} `
    })
})

jb.component('divider.vertical', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: `{ border-left-color: var(--jb-menu-separator-fg); display: block; border-left-width: 1px; border-left-style: solid;margin-left: 10px; margin: 5px 5px;} `
    })
})

jb.component('divider.flexAutoGrow', {
    type: 'divider.style',
    impl: customStyle({
        template: (cmp,state,h) => h('div'),
        css: '{ flex-grow: 10 }'
    })
})
;

var {notEmpty, touch} = jb.macro

jb.component('editableText.picklistHelper', {
  type: 'feature',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true},
    {id: 'picklistStyle', type: 'picklist.style', dynamic: true, defaultValue: picklist.labelList()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true, defaultValue: writeValue('%$$model/databind%','%$selectedOption%')},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper'}
  ],
  impl: features(
    watchable('selectedOption'),
    watchable('watchableInput', obj(prop('value',''))),
    variable('helperCmp', '%$cmp%'),
    method('openPopup', openDialog({
        style: dialog.popup(), content: picklist({
          options: pipeline('%$watchableInput%',call('options')),
          databind: '%$selectedOption%',
          features: watchRef('%$watchableInput%'),
          style: call('picklistStyle')
        }),
        features: [
          dialogFeature.maxZIndexOnClick(),
          dialogFeature.uniqueDialog('%$popupId%'),
        ]
    })),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', runActions(
      writeValue('%$watchableInput%','%%'),
      If(call('showHelper'),
        If(not(dialog.isOpen('%$popupId%')), action.runBEMethod('openPopup')),
        action.runBEMethod('closePopup')
      )
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', action.if(ctx => ctx.run(dialog.isOpen('%$popupId%')), runActions(call('onEnter'),dialog.closeDialogById('%$popupId%')))),
    method('onEsc', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEsc'),dialog.closeDialogById('%$popupId%')))),
    feature.serviceRegistey(),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow('%$cmp/keyUp%', rx.log('editableTextHelper keyup'), rx.filter('%keyCode% == 13'), editableText.addUserEvent(), 
      sink.BEMethod('onEnter')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter(not(inGroup(list(13,27,38,40),'%keyCode%'))), editableText.addUserEvent(),
      sink.BEMethod('refresh')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),

    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(action.if('%$autoOpen%', runActions(
      writeValue('%$watchableInput%',obj(prop('value','%$helperCmp/renderProps/databind%'))), action.runBEMethod('openPopup'))))
  )
})

jb.component('editableText.setInputState', {
  type: 'action',
  params: [
    {id: 'newVal', as: 'string' },
    {id: 'assumedVal', description: 'contains value and selectionStart, the action is not performed if the not in this state'},
    {id: 'selectionStart', as: 'number'},
    {id: 'cmp', defaultValue: '%$cmp%'},
  ],
  impl: action.applyDeltaToCmp((ctx,{cmp},{newVal,selectionStart,assumedVal}) => {
    jb.log('dom set input create userRequest',{cmp,newVal,ctx})
    return {attributes: { $__input: JSON.stringify({ assumedVal: assumedVal, newVal,selectionStart })}}
  } ,'%$cmp/cmpId%')
})

jb.component('editableText.addUserEvent', {
  type: 'rx',
  impl: rx.innerPipe(frontEnd.addUserEvent(), rx.map('%$ev/input%'))
})

jb.component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper' },
  ],
  impl: features(
    method('openPopup', openDialog({
      style: call('popupStyle'), content: call('control'),
      features: [
        dialogFeature.maxZIndexOnClick(),
        dialogFeature.uniqueDialog('%$popupId%'),
        group.data(firstSucceeding('%$ev/input%', obj(prop('value','%$helperCmp/renderProps/databind%')))),
      ]
    })),
    variable('helperCmp', '%$cmp%'),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', If(call('showHelper'),
      If(dialog.isOpen('%$popupId%'), touch('%$watchableInput%'), action.runBEMethod('openPopup')),
      action.runBEMethod('closePopup')
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEnter'),dialog.closeDialogById('%$popupId%')))),
    method('onEsc', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEsc'),dialog.closeDialogById('%$popupId%')))),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow('%$cmp/keyUp%', rx.log('editableTextHelper keyup'), rx.filter('%keyCode% == 13'), 
      editableText.addUserEvent(), sink.BEMethod('onEnter')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter(not(inGroup(list(13,27,38,40),'%keyCode%'))), editableText.addUserEvent(),
      sink.BEMethod('refresh')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),

    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(action.if('%$autoOpen%', action.runBEMethod('openPopup')))
 )
});

var {mdcStyle} = jb.ns('mdcStyle')

jb.component('mdcStyle.initDynamic', {
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: features(
    frontEnd.requireExternalLibrary(['material-components-web.js','css/material-components-web.css','css/font.css']),
    frontEnd.init( async ({},{cmp}) => {
      if (!jb.ui.material) await jb.exec(waitFor(() => jb.frame.mdc))
      const mdc = jb.frame.mdc
      //if (!mdc) return jb.logError('please load mdc library')
      cmp.mdc_comps = cmp.mdc_comps || [];
      //;['switch','chip-set','tab-bar','slider','select','text-field']
      //Object.keys(mdc)
      ['switch','chip-set','tab-bar','slider','select','text-field'].forEach(cmpName => {
        const elm = jb.ui.findIncludeSelf(cmp.base,`.mdc-${cmpName}`)[0]
        if (elm) {
          const name1 = cmpName.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
          const name = name1[0].toUpperCase() + name1.slice(1)
          cmp.mdc_comps.push({mdc_cmp: new (jb.ui.material || mdc[cmpName])[`MDC${name}`](elm), cmpName})
          jb.log(`mdc frontend init ${cmpName}`,{cmp})
        }
      })
      if (cmp.base.classList.contains('mdc-button') || cmp.base.classList.contains('mdc-fab')) {
        cmp.mdc_comps.push({mdc_cmp: new (jb.ui.material || mdc.ripple).MDCRipple(cmp.base), cmpName: 'ripple' })
        jb.log('mdc frontend init ripple',{cmp})
      }
    }),
    frontEnd.onDestroy(({},{cmp}) => (cmp.mdc_comps || []).forEach(({mdc_cmp,cmpName}) => {
      mdc_cmp.destroy()
      jb.log(`mdc frontend destroy ${cmpName}`,{cmp})
    }))
  )
})

jb.component('feature.mdcRippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: () => ({
      templateModifier: vdom => vdom.addClass('mdc-ripple-surface mdc-ripple-radius-bounded mdc-states mdc-states-base-color(red)')
   })
})

jb.component('label.mdcRippleEffect', {
  type: 'text.style',
  impl: customStyle({
    template: ({},{text},h) => h('button.mdc-button',{},[
      h('div.mdc-button__ripple'),
      h('span.mdc-button__label',{}, text),
    ]),
    css: '>span { text-transform: none; }',
    features: [text.bindText(), mdcStyle.initDynamic()]
  })
})
;

jb.component('text.htmlTag', {
    type: 'text.style',
    params: [
      {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
      {id: 'cssClass', as: 'string'}
    ],
    impl: customStyle({
      template: (cmp,{text,htmlTag,cssClass},h) => h(`${htmlTag}.${cssClass}`,{},text),
      features: text.bindText()
    })
})
  
jb.component('text.noWrappingTag', {
    type: 'text.style',
    category: 'text:0',
    impl: customStyle({
      template: (cmp,{text},h) => text,
      features: text.bindText()
    })
})
  
jb.component('text.span', {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('span',{},text),
      features: text.bindText()
    })
})

jb.component('text.chip', {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('div.jb-chip',{},h('span',{},text)),
      features: text.bindText()
    })
})
  
;[1,2,3,4,5,6].map(level=>jb.component(`header.h${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h(`h${level}`,{},text),
      features: text.bindText()
    })
}))
  
  
;[1,2,3,4,5,6].map(level=>jb.component(`header.mdcHeadline${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--headline${level}`},text),
      features: text.bindText()
    })
}))
  
;[1,2].map(level=>jb.component(`header.mdcSubtitle${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--subtitle${level}`},text),
      features: text.bindText()
    })
}))

jb.component('header.mdcHeaderWithIcon', {
  type: 'text.style',
  params: [
    {id: 'level', options: '1,2,3,4,5,6', as: 'string', defaultValue: '1'}
  ],
  impl: customStyle({
    template: (cmp,{text,level},h) =>
          h(`h${level}`,{ class: 'mdc-tab__content'}, [
            ...jb.ui.chooseIconWithRaised(cmp.icon).map(h),
            h('span',{ class: 'mdc-tab__text-label'},text),
            ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
          ]),
    css: '{justify-content: initial}',
    features: text.bindText()
  })
})

jb.component('text.alignToBottom', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,{text},h) => h('div',{},h('span',{},text)),
    css: '{position: relative } ~>span { position: absolute; left: 0; bottom: 0 }',
    features: text.bindText()
  })
})

;[1,2].map(level=>jb.component(`text.mdcBody${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--body${level}`},text),
      features: text.bindText()
    })
}))
;

jb.ui.chooseIconWithRaised = (icons,raised) => {
  if (!icons) return []
  const raisedIcon = icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'raised')[0]
  const otherIcons = (raisedIcon && icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'raised') || icons)
    .filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'post')
  if (raised)
    return raisedIcon ? [raisedIcon] : otherIcons
  return otherIcons
}

jb.component('button.href', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-textLink-fg)} .raised { color: var(--jb-textLink-active-fg) }',
    features: button.initAction()
  })
})

jb.component('button.hrefText', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-input-fg) ; text-decoration: none }     ~.hover, ~.active: { text-decoration: underline }',
    features: button.initAction()
  })
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    {id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true },'×'),
    css: `{
            padding: 0;
            cursor: pointer;
            font: %$size%px sans-serif;
            border: none;
            background: transparent;
            color: var(--mdc-theme-text-primary-on-background);
            text-shadow: 0 1px 0 var(--jb-dropdown-shadow);
            font-weight: 700;
        }
        :hover { color: var(--jb-menubar-active-fg) }`,
    features: button.initAction()
  })
})

jb.component('button.native', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}',
    features: button.initAction()
  })
})

jb.component('button.mdc', {
  type: 'button.style',
  params: [
    {id: 'noRipple', as: 'boolean'},
    {id: 'noTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised,noRipple,noTitle},h) => h('button',{
      class: ['mdc-button',raised && 'raised mdc-button--raised'].filter(x=>x).join(' '), onclick: true},[
      ...[!noRipple && h('div.mdc-button__ripple')],
      ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
      ...[!noTitle && h('span.mdc-button__label',{},title)],
      ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
    ]),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

jb.component('button.mdcChipAction', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
    h('div.mdc-chip-set mdc-chip-set--filter', {onclick: true},
      h('div.mdc-chip',{ class: [raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div.mdc-chip__ripple'),
        ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--leading')),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
        ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--trailing')),
    ])),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

jb.component('button.plainIcon', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=> vdom.setAttribute('title',vdom.getAttribute('title') || title))[0],
    features: button.initAction()
  })
})

jb.component('button.mdcIcon', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', type: 'icon' },
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcFloatingAction({withTitle: false, buttonSize: '%$buttonSize%'}), features(
      ((ctx,{},{icon}) => icon && ctx.run({$: 'feature.icon', ...icon, title: '%$model.title%',
        size: ({},{},{buttonSize}) => buttonSize * 24/40 })),
    ))
})

jb.component('button.mdcFloatingAction', {
  type: 'button.style,icon.style',
  description: 'fab icon',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 60, description: 'mini is 40'},
    {id: 'withTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,withTitle,raised},h) =>
      h('button',{ class: ['mdc-fab',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick:  true}, [
            h('div',{ class: 'mdc-fab__ripple'}),
            ...jb.ui.chooseIconWithRaised(cmp.icon,raised).filter(x=>x).map(h).map(vdom=>
                vdom.addClass('mdc-fab__icon').setAttribute('title',vdom.getAttribute('title') || title)),
            ...[withTitle && h('span',{ class: 'mdc-fab__label'},title)].filter(x=>x)
      ]),
    css: '{width: %$buttonSize%px; height: %$buttonSize%px;}',
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

jb.component('button.mdcTab', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button.mdc-tab',{ class: raised ? 'mdc-tab--active' : '',tabIndex: -1, role: 'tab', onclick: true}, [
        h('span.mdc-tab__content',{}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-tab__icon')),
          h('span.mdc-tab__text-label',{},title),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span.mdc-tab__ripple'),
      ]),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

jb.component('button.mdcHeader', {
  type: 'button.style',
  params: [
    {id: 'stretch', as: 'boolean'},
  ],
  impl: styleWithFeatures(button.mdcTab(), css(pipeline(
    Var('contentWidth',If('%$stretch%', 'width: 100%;','')),
    `
    {width: 100%; border-bottom: 1px solid black; margin-bottom: 7px; padding: 0}
    ~ .mdc-tab__content { %$contentWidth% display: flex; align-content: space-between;}
    ~ .mdc-tab__text-label { width: 100% }
  `)))
})


;

var {hidden} = jb.ns('mdc-style')

jb.component('editableText.input', {
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

jb.component('editableText.textarea', {
  type: 'editable-text.style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: customStyle({
    template: (cmp,{databind,rows,cols},h) => h('textarea', {
        rows: rows, cols: cols, value: databind, onchange: true, onkeyup: true, onblur: true  }),
    features: field.databindText(0, '%$oneWay%')
  })
})

jb.component('editableText.mdcInput', {
  type: 'editable-text.style,editable-number.style',
  params: [
    {id: 'width', as: 'number'},
    {id: 'noLabel', as: 'boolean'},
    {id: 'noRipple', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title,noLabel,noRipple,error},h) => h('div',{}, [
      h('div.mdc-text-field',{class: [ 
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre')[0] && 'mdc-text-field--with-leading-icon',
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post')[0] && 'mdc-text-field--with-trailing-icon'
        ].filter(x=>x).join(' ') },[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('input.mdc-text-field__input', { type: 'text', id: 'input_' + fieldId, name: 'input_' + fieldId,
              value: databind, onchange: true, onkeyup: true, onblur: true, autocomplete: 'off'
          }),
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--trailing')),
          ...[!noLabel && h('label.mdc-floating-label', { class: databind ? 'mdc-floating-label--float-above' : '', for: 'input_' + fieldId},title() )].filter(x=>x),
          ...[!noRipple && h('div.mdc-line-ripple')].filter(x=>x)
        ]),
        h('div.mdc-text-field-helper-line', {}, error || '')
      ]),
    css: `~ .mdc-text-field-helper-line { color: var(--jb-error-fg) }
    ~ .mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input { color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background); border-color: var(--jb-menubar-inactive-bg); }
    ~ .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label { color: var(--mdc-theme-primary) }
    `,
    features: [
      field.databindText(),
      mdcStyle.initDynamic(),
      css(
        ({},{},{width}) => `>.mdc-text-field { ${jb.ui.propWithUnits('width', width)} }`
      )
    ]
  })
})

jb.component('editableText.mdcNoLabel', {
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: editableText.mdcInput({width:'%$width%', noLabel: true})
})

jb.component('editableText.mdcSearch', {
  params: [
    {id: 'width', as: 'number'}
  ],
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl: styleWithFeatures(editableText.mdcInput({width:'%$width%', noLabel: true}), feature.icon({icon: 'search', position: 'post'}))
})

jb.component('editableText.expandable', {
  description: 'label that changes to editable class on double click',
  type: 'editable-text.style',
  params: [
    {id: 'buttonFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'editableFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'buttonStyle', type: 'button.style', dynamic: true, defaultValue: button.href()},
    {id: 'editableStyle', type: 'editable-text.style', dynamic: true, defaultValue: editableText.input()},
    {id: 'onToggle', type: 'action', dynamic: true}
  ],
  impl: styleByControl(
    group({
      controls: [
        editableText({
          databind: '%$editableTextModel/databind%',
          style: call('editableStyle'),
          features: [
            watchRef({ref: '%$editable%', allowSelfRefresh: true}),
            hidden('%$editable%'),
            method('exitEditable',runActions(writeValue('%$editable%',false), call('onToggle'))),
            method('regainFocus', action.focusOnCmp()),
            frontEnd.flow(source.frontEndEvent('blur'),sink.BEMethod('exitEditable')),
            frontEnd.flow(source.frontEndEvent('keyup'),rx.filter(or('%keyCode%==13','%keyCode%==27')), sink.BEMethod('exitEditable')),
            (ctx,{},{editableFeatures}) => editableFeatures(ctx)
          ]
        }),
        button({
          title: '%$editableTextModel/databind%',
          action: runActions(
            writeValue('%$editable%', true),
            (ctx,{expandableContext}) => expandableContext.regainFocus && expandableContext.regainFocus(),
            call('onToggle')
          ),
          style: call('buttonStyle'),
          features: [
            watchRef({ref: '%$editable%', allowSelfRefresh: true}),
            hidden(not('%$editable%')),
            (ctx,{},{buttonFeatures}) => buttonFeatures(ctx)
          ]
        })
      ],
      features: [
        watchable('editable'),
        variable({name: 'expandableContext', value: obj()})
      ]
    }),
    'editableTextModel'
  )
});

jb.component('layout.vertical', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(
    ({},{},{spacing}) =>  `{display: flex; flex-direction: column}
          >* { ${jb.ui.propWithUnits('margin-bottom',spacing)} }
          >*:last-child { margin-bottom:0 }`
  )
})

jb.component('layout.horizontal', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex}
        >* { ${jb.ui.propWithUnits('margin-right', spacing)} }
        >*:last-child { margin-right:0 }`
  )
})

jb.component('layout.horizontalFixedSplit', {
  type: 'layout,feature',
  params: [
    {id: 'leftWidth', as: 'string', defaultValue: '200px', mandatory: true},
    {id: 'rightWidth', as: 'string', defaultValue: '100%', mandatory: true},
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >*:first-child { ${jb.ui.propWithUnits('margin-right',ctx.params.spacing)}
        ${jb.ui.propWithUnits('width',ctx.params.leftWidth)} }
        >*:last-child { margin-right:0; ${jb.ui.propWithUnits('width',ctx.params.rightWidth)} }`,
  })
})

jb.component('layout.horizontalWrapped', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* {${jb.ui.propWithUnits('margin-right',ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

jb.component('layout.flex', {
  type: 'layout,feature',
  params: [
    {id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse'},
    {id: 'justifyContent', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around'},
    {id: 'alignItems', as: 'string', options: ',normal,stretch,center,start,end,flex-start,flex-end,baseline,first baseline,last baseline,safe center,unsafe center'},
    {id: 'wrap', as: 'string', options: ',wrap,wrap-reverse,nowrap'},
    {id: 'spacing', as: 'string'}
  ],
  impl: ctx => ({
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), marginSpacing: ctx.params.direction.match(/col/) ? 'bottom' : 'right' , ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
      {?>* { margin-%$marginSpacing%: %$spacingWithUnits% }?}
    ${ctx.params.spacing ? '>*:last-child { margin-%$marginSpacing%:0 }' : ''}`),
  })
})

jb.component('layout.grid', {
  type: 'layout,feature',
  params: [
    {id: 'columnSizes', as: 'array', templateValue: list('auto', 'auto'), description: 'grid-template-columns, list of lengths'},
    {id: 'rowSizes', as: 'array', description: 'grid-template-rows, list of lengths'},
    {id: 'columnGap', as: 'string', description: 'grid-column-gap'},
    {id: 'rowGap', as: 'string', description: 'grid-row-gap'}
  ],
  impl: ctx => ({
    css: ctx.setVars({...ctx.params,
          colSizes: ctx.params.columnSizes.map(x=>jb.ui.withUnits(x)).join(' ') , rowSizes: ctx.params.rowSizes.map(x=>jb.ui.withUnits(x)).join(' ')
         }).exp(`{ display: grid; {?grid-template-columns:%$colSizes%;?} {?grid-template-rows:%$rowSizes%;?}
            {?grid-column-gap:%$columnGap%;?} {?grid-row-gap:%$rowGap%;?} }`)
  })
})

jb.component('flexItem.grow', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['flex-grow: %$factor%']
  }
})

jb.component('flexItem.basis', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['flex-basis: %$factor%']
  }
})

jb.component('flexItem.alignSelf', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['align-self: %$align%']
  }
})

;

var { dynamicControls, css, header } = jb.ns('css')

jb.component('group.htmlTag', {
  type: 'group.style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'section', options: 'div,ul,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label,form'},
    {id: 'groupClass', as: 'string'},
    {id: 'itemClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{htmlTag,groupClass,itemClass,ctrls},h) => h(htmlTag,{ class: groupClass },
        ctrls.map(ctrl=> h(ctrl,{class: itemClass}))),
    features: group.initGroup()
  })
})

jb.component('group.div', {
  type: 'group.style',
  impl: group.htmlTag('div')
})

jb.component('group.section', {
  type: 'group.style',
  impl: group.htmlTag('section')
})

jb.component('group.ulLi', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul.jb-itemlist',{},
        ctrls.map(ctrl=> h('li', {class: 'jb-item'} ,h(ctrl)))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: group.initGroup()
  })
})

jb.component('group.card', {
  type: 'feature',
  category: 'card:100',
  params: [
    {id: 'padding', as: 'string', defaultValue: 10},
    {id: 'width', as: 'string', defaultValue: 320},
    {id: 'outlined', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    css.class(
        ({},{},{outlined}) => ['mdc-card', ...(outlined ? ['mdc-card--outlined']: [])].join(' ')
      ),
    css(
        ({},{},{padding,width}) => [jb.ui.propWithUnits('padding',padding), jb.ui.propWithUnits('width',width)].filter(x=>x).join(';')
      )
  )
})

jb.component('group.chipSet', {
  type: 'feature',
  category: 'chip:100',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: features(
    css.class('mdc-chip-set'),
    mdcStyle.initDynamic()
  )
})

jb.component('group.tabs', {
  type: 'group.style',
  params: [
    {id: 'tabStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcTab()},
    {id: 'barStyle', type: 'group.style', dynamic: true, defaultValue: group.mdcTabBar()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
  ],
  impl: styleByControl(
    group({
      controls: [
        group({
          style: call('barStyle'),
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button({
              title: '%$tab/field()/title%',
              action: writeValue('%$selectedTab%', '%$tabIndex%'),
              style: call('tabStyle'),
              raised: '%$tabIndex% == %$selectedTab%',
              // watchRef breaks mdcTabBar animation
              features: [
                ctx => ctx.cmpCtx.params.barStyle.profile.$ !== 'group.mdcTabBar' && watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.tab.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            itemVariable: 'tab',
            indexVariable: 'tabIndex'
          })
        }),
        group({
          style: call('innerGroupStyle'),
          controls: '%$tabsModel/controls[{%$selectedTab%}]%',
          features: watchRef('%$selectedTab%')
        })
      ],
      features: watchable('selectedTab', 0),
    }),
    'tabsModel'
  )
})

jb.component('group.mdcTabBar', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) =>
      h('div',{class: 'mdc-tab-bar', role: 'tablist'},
        h('div',{class: 'mdc-tab-scroller'},
          h('div',{class: 'mdc-tab-scroller__scroll-area mdc-tab-scroller__scroll-area--scroll'},
            h('div',{class: 'mdc-tab-scroller__scroll-content'}, ctrls.map(ctrl=>h(ctrl)))))),
    features: [group.initGroup(), mdcStyle.initDynamic()]
  })
})

jb.component('group.accordion', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcHeader(true)},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.section()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          style: call('sectionStyle'),
          controls: [
            button({
              title: '%$section/field()/title()%',
              action: writeValue('%$selectedTab%', '%$sectionIndex%'),
              style: call('titleStyle'),
              raised: '%$sectionIndex% == %$selectedTab%',
              features: [
                css.width('%$width%'),
                css('{justify-content: left}'),
                watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            group({
              style: call('innerGroupStyle'),
              controls: '%$sectionsModel/controls[{%$sectionIndex%}]%',
              features: [feature.if('%$sectionIndex% == %$selectedTab%'), watchRef('%$selectedTab%')]
            })
          ]
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      }),
      features: watchable('selectedTab',0)
    }),
    'sectionsModel'
  )
})

jb.component('group.sections', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', dynamic: true, defaultValue: header.mdcHeaderWithIcon()},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          title: '',
          style: call('sectionStyle'),
          controls: [
            text({
              text: '%$section/field()/title()%',
              style: call('titleStyle'),
              features: ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
            }),
            group({style: call('innerGroupStyle'), controls: '%$section%'})
          ]
        }),
        itemVariable: 'section'
      })
    }),
    'sectionsModel'
  )
})

jb.component('group.sectionExpandCollapse', {
  type: 'group.style',
  params: [
    {id: 'titleCtrl', type: 'control', dynamic: true, defaultValue: text({text: '%$sectionsModel.title()%', style: header.h2() }) },
    {id: 'toggleStyle', type: 'editable-boolean.style', defaultValue: editableBoolean.expandCollapse() },
    {id: 'autoExpand', as: 'boolean' }
  ],
  impl: styleByControl(
    group({
      controls: [
        group({
          controls: [
            editableBoolean({databind: '%$sectionExpanded%', style: call('toggleStyle')}),
            call('titleCtrl'),
          ],
          layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'})
        }),
        group({
          controls: controlWithCondition('%$sectionExpanded%','%$sectionsModel/controls%'),
          features: watchRef('%$sectionExpanded%')
        })
      ],
      features: watchable('sectionExpanded','%$autoExpand%'),
    }),
    'sectionsModel'
  )
})

jb.component('group.sectionsExpandCollapse', {
  type: 'group.style',
  params: [
    {id: 'autoExpand', as: 'boolean' },
    {id: 'titleStyle', type: 'text.style', dynamic: true, defaultValue: header.h2() },
    {id: 'toggleStyle', type: 'editable-boolean.style', defaultValue: editableBoolean.expandCollapse() },
    {id: 'titleGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          controls: [
            group({
              style: call('titleGroupStyle'),
              controls: [
                editableBoolean({databind: '%$sectionExpanded%', style: call('toggleStyle')}),
                text({text: '%$section/field()/title()%', style: call('titleStyle') }),
              ],
              layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'})
            }),
            group({
              style: call('innerGroupStyle'),
              controls: controlWithCondition('%$sectionExpanded%','%$sectionsModel/controls[{%$sectionIndex%}]%'),
              features: watchRef('%$sectionExpanded%')
            })
          ],
          features: watchable('sectionExpanded','%$autoExpand%'),
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      }),
    }),
    'sectionsModel'
  )
})
;

jb.component('itemlist.shownOnlyOnItemHover', {
  type: 'feature',
  category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: css.class('jb-shown-on-item-hover')
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    {id: 'space', as: 'number', defaultValue: 5}
  ],
  impl: css('>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: %$space%px }')
})

jb.component('itemlist.ulLi', {
  type: 'itemlist.style',
  impl: customStyle({
    template: ({},{ctrls},h) => h('ul.jb-itemlist',{},
        ctrls.map((ctrl) => h('li.jb-item', {}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

jb.component('itemlist.div', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls},h) => h('div.jb-itemlist',{},
        ctrls.map((ctrl) => h('div.jb-item', {}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls},h) => h('div.jb-itemlist',{},
        ctrls.map((ctrl) => h('div.jb-item', {}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})
;

jb.component('picklist.native', {
  type: 'picklist.style',
  impl: customStyle({
    template: ({},{databind,options},h) => h('select', { onchange: true }, 
      options.map(option=>h('option', {value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))),
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.nativePlus', {
  type: 'picklist.style',
  impl: customStyle({
    template: ({},{databind,options},h) => h('select', { onchange: true }, 
      options.map(option=>h('option', {value: option.code, ...(databind == option.code && {selected:  '' }) } ,option.text))),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; 
  color: var(--jb-menu-fg); background: var(--jb-menu-bg); 
  background-image: none; border: 1px solid var(--jb-menubar-inactive-bg); border-radius: 4px; box-shadow: inset 0 1px 1px var(--jb-dropdown-shadow);
}
:focus { border-color: border-color: var(--jb-menubar-active-bg); outline: 0; box-shadow: inset 0 1px 1px var(--jb-dropdown-shadow); }
::input-placeholder { color: var(--jb-menu-fg) }`,
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.nativeMdLookOpen', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
        h('input', { type: 'text', value: state.databind, list: 'list_' + cmp.ctx.id, onchange: true }),
        h('datalist', {id: 'list_' + cmp.ctx.id}, state.options.map(option=>h('option',{},option.text)))
    ]),
    css: `>input {  appearance: none; -webkit-appearance: none;
  padding: 6px 0;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid var(--jb-menubar-inactive-bg);
  color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background);
}
  { position: relative;}
  >input:focus { border-color: var(--jb-menubar-active-bg); border-width: 2px}

  :after1 { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid var(--mdc-theme-text-primary-on-background);
        pointer-events: none; }`,
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.plusIcon', {
  type: 'feature',
  categories: 'feature:0,picklist:50',
  impl: features(
    Var('color',css.valueOfCssVar('--mdc-theme-text-primary-on-background')),
    css('-webkit-appearance: none; appearance: none; width: 6px; height: 23px; background-repeat: no-repeat; background-position-y: -1px;'),
    css(`background-image: url("data:image/svg+xml;utf8,<svg fill='%$color%' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M17,13 H13 V17 H11 V13 H7 V11 H11 V7 H13 V11 H17 V13 Z'/></svg>");`),
  )
})

jb.component('picklist.radio', {
  type: 'picklist.style',
  params: [
    {id: 'radioCss', as: 'string', defaultValue: '', description: 'e.g. display: none'},
    {id: 'text', defaultValue: '%text%', dynamic: true}
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div', {},
          options.flatMap((option,i)=> [h('input', {
              type: 'radio', name: fieldId, id: i, ...(databind == option.code && {checked:  '' }), value: option.code, onchange: true
            }), h('label',{for: i}, text(cmp.ctx.setData(option))) ] )),
    css: '>input { %$radioCss% }',
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.mdcRadio', {
  type: 'picklist.style',
  params: [
    {id: 'text', defaultValue: '%text%', dynamic: true}
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div.mdc-form-field', {},
          options.flatMap((option,i)=> [
              h('div.mdc-radio',{},[
                h('input.mdc-radio__native-control', {
                  type: 'radio', name: fieldId, id: i, ...(databind == option.code && {checked:  '' }), value: option.code, onchange: true
                }),
                h('div.mdc-radio__background',{},[
                  h('div.mdc-radio__outer-circle'),
                  h('div.mdc-radio__inner-circle'),
                ]),
                h('div.mdc-radio__ripple')
              ]),
              h('label',{for: i}, text(cmp.ctx.setData(option))),
    ])),
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.radioVertical', {
  type: 'picklist.style',
  impl: styleWithFeatures(
    picklist.radio(),
    layout.grid({columnSizes: list('30px', 'auto')})
  )
})

jb.component('picklist.mdcSelect', {
  type: 'picklist.style',
  params: [
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'noLabel', as: 'boolean', type: 'boolean'},
    {id: 'noRipple', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{databind,options,title,noLabel,noRipple,hasEmptyOption},h) => h('div.mdc-select',{}, [
      h('div.mdc-select__anchor',{},[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('i.mdc-select__dropdown-icon', {}),
          h('div.mdc-select__selected-text',{'aria-required': !hasEmptyOption},databind),
          ...[!noLabel && h('label.mdc-floating-label',{ class: databind ? 'mdc-floating-label--float-above' : ''},title() )].filter(x=>x),
          ...[!noRipple && h('div.mdc-line-ripple')].filter(x=>x)
      ]),
      h('div.mdc-select__menu mdc-menu mdc-menu-surface demo-width-class',{},[
        h('ul.mdc-list',{},options.map(option=>h('li.mdc-list-item',{'data-value': option.code, 
          class: option.code == databind ? 'mdc-list-item--selected': ''},    
          h('span.mdc-list-item__text', {}, option.text))))
      ])
    ]),
    features: [
      field.databind(),
      picklist.init(),
      mdcStyle.initDynamic(),
      css(({},{},{width}) => `>* { ${jb.ui.propWithUnits('width', width)} }`),
      frontEnd.flow(
        source.callbag(({},{cmp}) => jb.callbag.create(obs=> 
          cmp.mdc_comps.forEach(({mdc_cmp}) => mdc_cmp.listen('MDCSelect:change', () => obs(mdc_cmp.value))))),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('writeFieldValue','%%')
      ),  
      css(
        `~.mdc-select:not(.mdc-select--disabled) .mdc-select__selected-text { color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background); border-color: var(--jb-menubar-inactive-bg); }
        ~.mdc-select:not(.mdc-select--disabled) .mdc-floating-label { color: var(--mdc-theme-primary) }`
      )
    ]
  })
})

jb.component('picklist.labelList', {
  type: 'picklist.style',
  params: [
    {id: 'labelStyle', type: 'text.style', dynamic: true, defaultValue: text.span()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red OR >a { color: red }', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: text({text: '%text%', style: call('labelStyle')}),
      style: call('itemlistStyle'),
      features: [
        itemlist.selection({
          databind: '%$picklistModel/databind%',
          selectedToDatabind: '%code%',
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        itemlist.keyboardSelection(),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    'picklistModel'
  )
})

jb.component('picklist.buttonList', {
  type: 'picklist.style',
  params: [
    {id: 'buttonStyle', type: 'button.style', dynamic: true, defaultValue: button.mdc()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red;color: blue;font-weight: bold;', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: button({title: '%text%', style: call('buttonStyle')}),
      style: call('itemlistStyle'),
      features: [
          itemlist.selection({
          databind: '%$picklistModel/databind%',
          selectedToDatabind: '%code%',
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    'picklistModel'
  )
})

jb.component('picklist.hyperlinks', {
  type: 'picklist.style',
  impl: picklist.buttonList({
    buttonStyle: button.href(),
    itemlistStyle: itemlist.horizontal('10'),
    cssForSelected: '>a { color: red }'
  })
})

jb.component('picklist.groups', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,{databind,hasEmptyOption,groups},h) => h('select', { onchange: true },
          (hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(
                option=>h('option',{value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))))
      )),
    features: [field.databind(), picklist.init(),  picklist.initGroups()]
  })
})

;

jb.component('propertySheet.titlesLeft', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', defaultValue: styleWithFeatures(text.span(), css.bold()), dynamic: true},
    {id: 'titleText', defaultValue: '%%:', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{}, ctrls.flatMap(ctrl=>[
        h(cmp.ctx.run(text({text: ctx => titleText(ctx.setData(ctrl.field().title())), style: ctx => titleStyle(ctx)}))),
        h(ctrl)
      ])
    ),
    css: '{ display: grid; grid-template-columns: auto auto; grid-column-gap:%$spacing%}',
    features: group.initGroup()
  })
})

jb.component('propertySheet.titlesAbove', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', defaultValue: styleWithFeatures(text.span(), css.bold()), dynamic: true},
    {id: 'titleText', defaultValue: '%%', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{ style: {'grid-template-columns': ctrls.map(()=>'auto').join(' ')}}, [
        ...ctrls.map(ctrl=>
          h(cmp.ctx.run(text({
            text: ctx => titleText(ctx.setData(ctrl.field().title())), 
            style: ctx => titleStyle(ctx)})))), 
        ...ctrls.map(ctrl=>h(ctrl))
      ]
    ),
    css: '{ display: grid; grid-column-gap:%$spacing% }',
    features: group.initGroup()
  })
})
;

jb.component('editableBoolean.checkbox', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: ({},{databind},h) => h('input', { type: 'checkbox', ...(databind && {checked: ''}) , 
      onclick: 'toggle', onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

jb.component('editableBoolean.checkboxWithLabel', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: ({},{title,databind,fieldId},h) => h('div',{},[ 
      h('input', { type: 'checkbox', ...(databind && {checked: ''}), id: "switch_"+fieldId, onchange: 'toggle', onkeyup: 'toggleByKey' }),
      h('label',{for: "switch_"+fieldId },title())
     ]),
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

jb.component('editableBoolean.expandCollapseWithUnicodeChars', {
  type: 'editable-boolean.style',
  params: [
    {id: 'toExpandSign', as: 'string', defaultValue: '⯈'},
    {id: 'toCollapseSign', as: 'string', defaultValue: '⯆'},
  ],
  impl: customStyle({
    template: ({},{databind,toExpandSign,toCollapseSign},h) => 
      h('span',{ onclick: 'toggle' }, databind ? toCollapseSign : toExpandSign),
    css: '{cursor: pointer; opacity: 0.6; user-select: none}',
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

jb.component('editableBoolean.expandCollapse', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: ({},{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer }',
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

jb.component('editableBoolean.mdcXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', as: 'string', mandatory: true, defaultValue: 'check'},
    {id: 'noIcon', as: 'string', mandatory: true, defaultValue: 'close'}
  ],
  impl: customStyle({
    template: ({},{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title: title(), tabIndex: -1, onclick: 'toggle', onkeyup: 'toggleByKey'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [editableBoolean.initToggle(), field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editableBoolean.buttonXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', type: 'icon', mandatory: true, defaultValue: icon('check')},
    {id: 'noIcon', type: 'icon', mandatory: true, defaultValue: icon('close') },
    {id: 'buttonStyle', type: 'button.style', mandatory: true, defaultValue: button.mdcFloatingAction() }
  ],
  impl: styleWithFeatures(call('buttonStyle'), features(
      editableBoolean.initToggle(),
      htmlAttribute('onclick','toggle'),
      ctx => ctx.run({...ctx.cmpCtx.params[jb.toboolean(ctx.vars.$model.databind()) ? 'yesIcon' : 'noIcon' ], 
        title: ctx.exp('%$$model/title%'), $: 'feature.icon'}),
    ))
})

jb.component('editableBoolean.iconWithSlash', {
  type: 'editable-boolean.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcIcon({buttonSize: '%$buttonSize%'}), features(
      Var('strokeColor', css.valueOfCssVar('mdc-theme-on-secondary')),
      editableBoolean.initToggle(),
      htmlAttribute('onclick','toggle'),
      htmlAttribute('title','%$$model/title%'),
      css(If('%$$model/databind%','',`background-repeat: no-repeat; background-image: url("data:image/svg+xml;utf8,<svg width='%$buttonSize%' height='%$buttonSize%' viewBox='0 0 %$buttonSize% %$buttonSize%' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='%$buttonSize%' y2='%$buttonSize%' style='stroke:%$strokeColor%;stroke-width:2' /></svg>")`))
    ))
})

jb.component('editableBoolean.mdcSlideToggle', {
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: ({},{databind,fieldId,toggleText},h) => h('div.mdc-switch',{class: databind ? 'mdc-switch--checked': '' },[
      h('div.mdc-switch__track'),
      h('div.mdc-switch__thumb-underlay',{},
        h('div.mdc-switch__thumb',{},
          h('input.mdc-switch__native-control', { type: 'checkbox', role: 'switch', id: 'switch_' + fieldId, 
            'aria-checked': 'false', ...(databind && {checked: '', 'aria-checked' : 'true' }), 
            onchange: 'toggle', onkeyup: 'toggleByKey' }
      ))),
      h('label',{for: 'switch_' + fieldId},toggleText)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [editableBoolean.initToggle(), field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editableBoolean.mdcCheckBox', {
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title},h) => h('div.mdc-form-field', {},[
        h('div.mdc-checkbox',{}, [
          h('input.mdc-checkbox__native-control', { type: 'checkbox', id: 'checkbox_' + fieldId,
            ...(databind && {checked: ''}), onchange: 'toggle', onkeyup: 'toggleByKey' }),
          h('div.mdc-checkbox__background',{}, [
            h('svg.mdc-checkbox__checkmark',{viewBox: '0 0 24 24'},
              h('path.mdc-checkbox__checkmark-path', { fill: 'none', d: 'M1.73,12.91 8.1,19.28 22.79,4.59' }
            )),
            h('div.mdc-checkbox__mixedmark')
          ]),
          h('div.mdc-checkbox__ripple')
        ]),
        h('label',{for: 'checkbox_' + fieldId},title())
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [
      editableBoolean.initToggle(),
      field.databind(), 
      css('~ .mdc-checkbox__checkmark { top: -9px}')
      // frontEnd((ctx,{cmp}) => {
      //   // svg refresh bug (maybe a jb-react bug)
      //   const bck = cmp.base.querySelector('.mdc-checkbox__background')
      //   bck.outerHTML = ''+ bck.outerHTML
      // })
    ]
  })
})

jb.component('editableBoolean.picklist', {
  type: 'editable-boolean.style',
  params: [
    {id: 'picklistStyle', type: 'picklist.style', defaultValue: picklist.native(), dynamic: true },
  ],
  impl: styleByControl(
    picklist({
      databind: '%$editableBooleanModel/databind%',
      options: list(
        obj(prop('text','%$editableBooleanModel/textForTrue()%'),prop('code',true)),
        obj(prop('text','%$editableBooleanModel/textForFalse()%'),prop('code',false))),
      style: call('picklistStyle'),
      features: picklist.onChange(writeValue('%$editableBooleanModel/databind()%',If('%%==true',true,false))) // convert to boolean
    }),
    'editableBooleanModel'
  )
});

(function() {
var { tree } = jb.ns('tree')

jb.component('tree', {
  type: 'control',
  params: [
    {id: 'title', as: 'string'},
    {id: 'nodeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'style', type: 'tree.style', defaultValue: tree.expandBox(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.noHead',{
	type: 'feature',
	impl: features(calcProp('noHead',true))
})

jb.component('tree.initTree', {
	type: 'feature',
	impl: features(
		variable('treeCmp','%$cmp%'),
		calcProp('model','%$$model/nodeModel()%'),
		method('flipExpandCollapse', runActions(
			({},{$state,ev}) => $state.expanded[ev.path] = !$state.expanded[ev.path],
			action.refreshCmp('%$$state%')
		)),
		userStateProp('expanded', ({},{$state,$props}) => ({
			 ...$state.expanded, 
			 ...(!$state.refresh && {[$props.model.rootPath]: true}) 
		})),
		frontEnd.enrichUserEvent(({},{cmp,ev}) => {
			const el = jb.ui.find(ev.target,'.selected')[0] || ev.target
			const labelEl = jb.ui.find(el,'.treenode-label')[0] || el
			ev.fixedTarget = labelEl
			return { path: cmp.elemToPath(el) }
		}),
		frontEnd.prop('elemToPath',() => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'))),
		css('{user-select: none}')
	)
})

jb.component('tree.expandPath', {
	type: 'feature',
	params: [
	  {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
	],
	impl: feature.init(({},{$state},{paths}) => {
//		if ($state.refresh) return
		$state.expanded = $state.expanded || {}
		;(paths || []).forEach( path=> path.split('~').reduce((base, x, i) => {
			const inner = i ? (base + '~' + x) : x
			$state.expanded[inner] = true
			return inner
		},''))
	})
})

// **** styles ***
jb.component('tree.plain', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
  ],
  impl: customStyle({
	template: (cmp,{showIcon,noHead,expanded,model,selected},h) => {
		function renderLine(path) {
			const _icon = model.icon(path) || 'radio_button_unchecked'
			return h('div',{ class: `treenode-line`},[
				model.isArray(path) ? h('i.material-icons noselect flip-icon', { onclick: 'flipExpandCollapse', path },
					expanded[path] ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : h('span',{class: 'no-children-holder'}),
				...(showIcon ? [h('i',{class: 'material-icons treenode-icon'}, _icon)] : []),
				h('span',{class: 'treenode-label'}, model.title(path,!expanded[path])),
			])
		}
		return new TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	},
	css: `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -1px }

	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; padding-bottom: 3px; align-items: center }

	|>.treenode { display: block }
	|>.flip-icon { font-size: 16px; margin-right: 2px;}
	|>.treenode-icon { font-size: 16px; margin-right: 2px; }

	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  { 
		color: var(--jb-menu-selection-fg); background: var(--jb-menu-selection-bg)}
	`,
	features: tree.initTree()
  })
})

jb.component('tree.expandBox', {
  type: 'tree.style',
  params: [
    {id: 'showIcon', as: 'boolean', type: 'boolean'},
    {id: 'lineWidth', as: 'string', defaultValue: '300px'}
  ],
  impl: customStyle({
	  template: (cmp,{showIcon,noHead,expanded,model,selected},h) => {
		function renderLine(path) {
			const _icon = model.icon(path) || 'radio_button_unchecked';
			const nochildren = model.isArray(path) ? '' : ' nochildren'
			const collapsed = expanded[path] ? '' : ' collapsed';
			const showIconClass = showIcon ? ' showIcon' : '';

			return h('div',{ class: `treenode-line${collapsed}`},[
				h('button',{class: `treenode-expandbox${nochildren}${showIconClass}`, onclick: 'flipExpandCollapse', path },
					[ 
						h('div.frame'),h('div.line-lr'),h('div.line-tb')
					]
				),
				...(showIcon ? [h('i.material-icons treenode-icon',{}, _icon)] : []),
				h('span.treenode-label',{}, model.title(path,!expanded[path])),
			])
		}
		return new TreeRenderer({model,expanded,h,showIcon,noHead,renderLine,selected}).renderTree(cmp.renderProps.model.rootPath)
	  },
	  css: ({},{},{lineWidth}) => `|>.treenode-children { padding-left: 10px; min-height: 7px }
	|>.treenode-label { margin-top: -2px }
	|>.treenode-label .treenode-val { color: var(--jb-tree-value); padding-left: 4px; display: inline-block;}
	|>.treenode-line { display: flex; box-orient: horizontal; width: ${lineWidth}; padding-bottom: 3px;}

	|>.treenode { display: block }
	|>.treenode.selected>*>.treenode-label,.treenode.selected>*>.treenode-label  
		{ color: var(--jb-menu-selection-fg); background: var(--jb-menu-selection-bg)}

	|>.treenode-icon { font-size: 16px; margin-right: 2px; }
	|>.treenode-expandbox { border: none; background: none; position: relative; width:9px; height:9px; padding: 0; vertical-align: top;
		margin-top: 5px;  margin-right: 5px;  cursor: pointer;}
	|>.treenode-expandbox.showIcon { margin-top: 3px }
	|>.treenode-expandbox div { position: absolute; }
	|>.treenode-expandbox .frame { background: var(--jb-menu-bg); border-radius: 3px; border: 1px solid var(--jb-expandbox-bg); top: 0; left: 0; right: 0; bottom: 0; }
	|>.treenode-expandbox .line-lr { background: var(--jb-expandbox-bg); top: 4px; left: 2px; width: 5px; height: 1px; }
	|>.treenode-expandbox .line-tb { background: var(--jb-expandbox-bg); left: 4px; top: 2px; height: 5px; width: 1px; display: none;}
	|>.treenode-line.collapsed .line-tb { display: block; }
	|>.treenode.collapsed .line-tb { display: block; }
	|>.treenode-expandbox.nochildren .frame { display: none; }
	|>.treenode-expandbox.nochildren .line-lr { display: none; }
	|>.treenode-expandbox.nochildren .line-tb { display: none;}`,
		features: tree.initTree()
	}),
})

// helper for styles
class TreeRenderer {
	constructor(args) {
		Object.assign(this,args)
	}
	renderTree() {
		const {model,h} = this
		if (this.noHead)
			return h('div',{}, model.children(model.rootPath).map(childPath=> this.renderNode(childPath)))
		return this.renderNode(model.rootPath)
	}
	renderNode(path) {
		const {expanded,model,h} = this
		const disabled = model.disabled && model.disabled(path) ? 'jb-disabled' : ''
		const selected = path == this.selected ? 'selected' : ''
		const clz = ['treenode', model.isArray(path) ? 'jb-array-node': '',disabled, selected].filter(x=>x).join(' ')
		const children = expanded[path] && model.children(path).length ? [h('div.treenode-children', {} ,
			model.children(path).map(childPath=>this.renderNode(childPath)))] : []

		return h('div',{class: clz, path, ...expanded[path] ? {expanded: true} :{} }, [ this.renderLine(path), ...children ] )
	}
}

// ******** tree features

jb.component('tree.selection', {
	type: 'feature',
	params: [
	  {id: 'databind', as: 'ref', dynamic: true},
	  {id: 'onSelection', type: 'action', dynamic: true},
	  {id: 'onRightClick', type: 'action', dynamic: true},
	  {id: 'autoSelectFirst', type: 'boolean'},
	],
	impl: features(
	  tree.expandPath(tree.parentPath('%$databind()%')),
	  method('onSelection', runActions( If(isRef('%$databind()%'),writeValue('%$databind()%','%%')), call('onSelection'))),
	  method('onRightClick', runActions( If(isRef('%$databind()%'),writeValue('%$databind()%','%%')), call('onRightClick'))),
	  userStateProp({
		  id: 'selected',
		  phase: 20, // after other props
		  value: (ctx,{$props,$state},{databind, autoSelectFirst}) => jb.val(databind()) || $state.selected || 
			(autoSelectFirst && $props.noHead ? $props.model.children($props.model.rootPath)[0] : $props.model.rootPath )
	  }),
	  followUp.flow(source.data('%$$props/selected%'),
	  	rx.filter(and('%$autoSelectFirst%',not('%$$state/refresh%'))),
		sink.BEMethod('onSelection')
	  ),
	  frontEnd.method('applyState', ({},{cmp}) => {
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode.selected'))
		  .forEach(elem=>elem.classList.remove('selected'))
		Array.from(jb.ui.findIncludeSelf(cmp.base,'.treenode'))
		  .filter(elem=> elem.getAttribute('path') == cmp.state.selected)
		  .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
	  }),
	  frontEnd.method('setSelected', ({data},{cmp}) => {
		cmp.base.state.selected = cmp.state.selected = data
		cmp.runFEMethod('applyState')
	  }),
  
	  frontEnd.prop('selectionEmitter', rx.subject()),
	  frontEnd.flow(
		source.frontEndEvent('contextmenu'), 
		rx.map(tree.pathOfElem('%target%')), rx.filter('%%'), 
		sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
	  ),
	  frontEnd.flow(
		  rx.merge( 
			rx.pipe(source.frontEndEvent('click'), rx.map(tree.pathOfElem('%target%')), rx.filter('%%')),
			source.subject('%$cmp.selectionEmitter%')
		  ),
		  rx.filter('%%'),
		  rx.filter(({data},{cmp}) => cmp.state.selected != data),
		  rx.distinctUntilChanged(),
		  sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
	  )
	)
})
  
jb.component('tree.keyboardSelection', {
	type: 'feature',
	macroByValue: false,
	params: [
		{id: 'onKeyboardSelection', type: 'action', dynamic: true},
		{id: 'onEnter', type: 'action', dynamic: true},
		{id: 'onRightClickOfExpanded', type: 'action', dynamic: true},
		{id: 'autoFocus', type: 'boolean'},
		{id: 'applyMenuShortcuts', type: 'menu.option', dynamic: true}
	],
	impl: features(
	  htmlAttribute('tabIndex',0),
	  method('onEnter', call('onEnter')),
	  method('runShortcut', (ctx,{path},{applyMenuShortcuts}) => {
		  const shortCut = applyMenuShortcuts(ctx.setData(path))
		  shortCut && shortCut.runShortcut(ctx.data) 
	  }),
	  method('expand', (ctx,{cmp,$props,$state},{onRightClickOfExpanded}) => {
		const {expanded} = $state, selected = ctx.data
		$state.selected = selected
		if ($props.model.isArray(selected) && !expanded[selected]) {
			expanded[selected] = true
			cmp.refresh($state)
		} else {
			onRightClickOfExpanded(ctx.setData(selected))
		}
	  }),
	  method('collapse', ({data},{cmp,$state}) => {
		const {expanded} = $state, selected = data
		$state.selected = selected
		if (expanded[selected]) {
			delete expanded[selected]
			cmp.refresh($state)
		}
	  }),
	  frontEnd.prop('onkeydown', rx.pipe(
		  source.frontEndEvent('keydown'), rx.filter(not('%ctrlKey%')), rx.filter(not('%altKey%')), frontEnd.addUserEvent() )),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==13'), rx.filter('%$cmp.state.selected%'), sink.BEMethod('onEnter','%$cmp.state.selected%') ),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter(inGroup(list(38,40),'%keyCode%')),
		rx.map(tree.nextSelected(If('%keyCode%==40',1,-1))), 
		sink.subjectNext('%$cmp.selectionEmitter%')
	  ),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==39'), sink.BEMethod('expand','%$cmp.state.selected%')),
	  frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==37'), sink.BEMethod('collapse','%$cmp.state.selected%')),
	  frontEnd.flow(
		source.callbag(({},{cmp}) => 
		  	jb.callbag.create(obs=> cmp.base.onkeydown = ev => { obs(ev); return false } // stop propagation
		)),
		rx.filter(({data}) => (data.ctrlKey || data.altKey || data.keyCode == 46) // Delete
			  && (data.keyCode != 17 && data.keyCode != 18)), // ctrl or alt alone
		frontEnd.addUserEvent(),
		sink.BEMethod('runShortcut','%$ev%',obj(prop('path','%$cmp.state.selected%')))
	  ),
	  frontEnd.flow(source.frontEndEvent('click'), sink.FEMethod('regainFocus')),

	  frontEnd.method('regainFocus', action.focusOnCmp('tree regain focus')),
	  frontEnd.var('autoFocus','%$autoFocus%'),
	  frontEnd.init(If('%$autoFocus%', action.focusOnCmp('tree autofocus') )),
	)
})

jb.component('tree.dragAndDrop', {
  type: 'feature',
  impl: features(
		htmlAttribute('tabIndex',0),
		method('moveItem', tree.moveItem('%from%','%to%')),
	  	frontEnd.flow(
			source.frontEndEvent('keydown'), 
			rx.filter('%ctrlKey%'),
			rx.filter(inGroup(list(38,40),'%keyCode%')),
			rx.map(obj(
				prop('from', tree.nextSelected(0)),
				prop('to', tree.nextSelected(If('%keyCode%==40',1,-1)))
			)),
			rx.filter(tree.sameParent('%from%','%to%')),     
			sink.BEMethod('moveItem','%%')
		),
		frontEnd.onRefresh( (ctx,{cmp}) => cmp.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children')),
		frontEnd.init( (ctx,{cmp}) => {
        	const drake = cmp.drake = dragula([], {
				moves: el => jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
	    	})
          	drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
			drake.on('drag', function(el) {
				const path = cmp.elemToPath(el.firstElementChild)
				el.dragged = { path, expanded: cmp.state.expanded[path]}
				delete cmp.state.expanded[path]; // collapse when dragging
			})

			drake.on('drop', (dropElm, target, source,_targetSibling) => {
				if (!dropElm.dragged) return;
				dropElm.parentNode.removeChild(dropElm);
				cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
				const targetSibling = _targetSibling; // || target.lastElementChild == dropElm && target.previousElementSibling
				let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : 
					target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
				// strange dragula behavior fix
				const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
				const targetIndex = Number(targetPath.split('~').pop()) || 0;
				if (target === source && targetIndex > draggedIndex)
					targetPath = addToIndex(targetPath,-1)
				ctx.run(action.runBEMethod('moveItem',() => ({from: dropElm.dragged.path, to: targetPath})))

				function addToIndex(path,toAdd) {
					if (!path) debugger;
					if (isNaN(Number(path.slice(-1)))) return path
					const index = Number(path.slice(-1)) + toAdd;
					return path.split('~').slice(0,-1).concat([index]).join('~')
				}
		    })
      	})
  	)
})

jb.component('tree.nextSelected', {
	type: 'data:0',
	descrition: 'FE action',
	params: [
	  {id: 'diff', as: 'number'}
	],
	impl: (ctx,diff) => {
	  	const {cmp} = ctx.vars
		const nodes = jb.ui.findIncludeSelf(cmp.base,'.treenode')
		const selectedEl = jb.ui.findIncludeSelf(cmp.base,'.treenode.selected')[0]
		return cmp.elemToPath(nodes[nodes.indexOf(selectedEl) + diff])
	}
})

jb.component('tree.pathOfInteractiveItem', {
	type: 'data',
	descrition: 'path of the clicked/dragged item using event.target',
	impl: tree.pathOfElem('%$ev/target%')
})

jb.component('tree.pathOfElem', {
	type: 'data:0',
	descrition: 'FE action',
	params: [
		{id: 'elem'}
	],
	impl: (ctx,el) => ctx.vars.cmp && ctx.vars.cmp.elemToPath && ctx.vars.cmp.elemToPath(el)
})

jb.component('tree.parentPath', {
	params: [
		{id: 'path', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,path) => path.split('~').slice(0,-1).join('~'),
})

jb.component('tree.lastPathElement', {
	params: [
		{id: 'path', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,path) => path.split('~').pop(),
})

jb.component('tree.sameParent', { 
	descrition: 'check if two paths have the same parent',
	type: 'boolean',
	params: [
		{id: 'path1', as: 'string'},
		{id: 'path2', as: 'string'}
	],
	impl: (ctx,path1,path2) => (path1.match(/(.*?)~[0-9]*$/)||[])[1] == (path2.match(/(.*?)~[0-9]*$/)||[])[1]
})

jb.component('tree.regainFocus', {
	type: 'action',
	impl: action.focusOnCmp('regain focus','%$treeCmp/cmpId%')
})
  
jb.component('tree.redraw', {
	type: 'action',
	params: [
	  {id: 'strong', type: 'boolean', as: 'boolean'}
	],
	impl: (ctx,strong) => {
		jb.log('tree redraw',{ cmpId: jb.path(ctx.vars,'$tree.cmpId'), ctx, strong})
		return ctx.vars.$tree && ctx.vars.$tree.redraw && ctx.vars.$tree.redraw(strong)
	}
})
  
jb.component('tree.moveItem', {
	type: 'action',
	descrition: 'move item in backend, changing also the state of selected and expanded',
	params: [
		{id: 'from', as: 'string'},
		{id: 'to', as: 'string'},
	],
	impl: (ctx,from,to) => {
		const {cmp,$state} = ctx.vars
		const model = cmp.renderProps.model
		const stateAsRefs = pathsToRefs($state)
		model.move(from,to,ctx)
		const state = refsToPaths(stateAsRefs)
		cmp.refresh(state)

		function pathsToRefs({selected,expanded}) {
			return {
				selected: pathToRef(selected),
				expanded: jb.entries(expanded).filter(e=>e[1]).map(e=>pathToRef(e[0]))
		}}
		
		function refsToPaths({selected,expanded}) {
			return {
				selected: refToPath(selected),
				expanded: jb.objFromEntries(expanded.map(ref=>[refToPath(ref), true]))
		}}
		
		function pathToRef(path) { return  path && model.refHandler && model.refHandler.refOfPath(path.split('~')) }
		function refToPath(ref) { return ref && ref.path ? ref.path().join('~') : '' }
	}
})

})()
;

var { tableTree, tree } = jb.ns('tableTree,tree')

jb.component('tableTree', {
  type: 'control',
  params: [
    {id: 'title', as: 'string'},
    {id: 'treeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'leafFields', type: 'control[]', dynamic: true},
    {id: 'commonFields', type: 'control[]', dynamic: true, as: 'array'},
    {id: 'chapterHeadline', type: 'control', dynamic: true, defaultValue: text(''), description: '$collapsed as parameter'},
    {id: 'style', type: 'table-tree.style', defaultValue: tableTree.plain({}), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.modelFilter', {
  type: 'tree.node-model',
  description: 'filters a model by path filter predicate',
  params: [
    {id: 'model', type: 'tree.node-model', mandatory: true},
    {id: 'pathFilter', type: 'boolean', dynamic: true, mandatory: true, description: 'input is path. e.g a~b~c'}
  ],
  impl: (ctx, model, pathFilter) => Object.assign(Object.create(model), {
        children: path => model.children(path).filter(childPath => pathFilter(ctx.setData(childPath)))
    })
})

jb.component('tableTree.init', {
  type: 'feature',
  impl: features(
		calcProp('model','%$$model/treeModel()%'),
		method('flip', runActions(
      ({},{$state,ev}) => {
        $state.expanded = $state.expanded || {}
        $state.expanded[ev.path] = !$state.expanded[ev.path]
      },
			action.refreshCmp('%$$state%')
    )),
    calcProp('expanded', ({},{$state,$props}) => ({ ...$state.expanded, ...$props.expanded, [$props.model.rootPath]: true })),
    //     ...(!$state.refresh && {[$props.model.rootPath]: true})
    // })),
    frontEnd.prop('elemToPath',() => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.jb-item') && jb.ui.closest(el,'.jb-item').getAttribute('path'))),
		frontEnd.enrichUserEvent(({},{cmp,ev}) => ({ path: cmp.elemToPath(ev.target)})),
    calcProp({
        id: 'itemsCtxs',
        value: (ctx,{$props,$model}) => {
            const ctxOfItem = (item,index) => ctx.setData({path: item.path, val: $props.model.val(item.path)}).setVars({index, item})

            const rootPath = $props.model.rootPath, expanded = $props.expanded, model = $props.model
            const items = $model.includeRoot ? calcItems(rootPath, 0) : calcItems(rootPath, -1).filter(x=>x.depth > -1)
            const itemsCtxs = items.map((item,i) => ctxOfItem(item,i))
            itemsCtxs.forEach(iCtx => jb.ui.preserveCtx(iCtx))
            return itemsCtxs

            function calcItems(top, depth) {
                const item = [{path: top, depth, val: model.val(top), expanded: expanded[top]}]
                if (expanded[top])
                    return model.children(top).reduce((acc,child) =>
                        depth >= model.maxDepth ? acc : acc = acc.concat(calcItems(child, depth+1)),item)
                return item
            }
        }
    }),
    calcProp('maxDepth',firstSucceeding('%$$model/maxDepth%',5)),
    calcProp('headerFields',list('%$$model/leafFields()/field()%','%$$model/commonFields()/field()%')),
    calcProp('ctrlsMatrix', (ctx,{$model,$props}) => {
        const model = $props.model, maxDepth = $props.maxDepth
        const maxDepthAr = Array.from(new Array(maxDepth))
        const expandingFields = path => {
              const depthOfItem = (path.match(/~/g) || []).length - (model.rootPath.match(/~/g) || []).length - 1
                // return tds until depth and then the '>' sign, and then the headline
              return maxDepthAr.filter((e,i) => i < depthOfItem+3)
                    .map((e,i) => {
                        if (i < depthOfItem || i == depthOfItem && !model.isArray(path))
                            return { empty: true }
                        if (i == depthOfItem) return {
                            expanded: $props.expanded[path],
                            toggle: true
                        }
                        if (i == depthOfItem+1) return {
                            headline: true,
                            colSpan: maxDepth-i+1
                        }
                        if (i == depthOfItem+2) return {
                            resizer: true
                        }                        
                        debugger
                    }
               )
        }
        return $props.itemsCtxs.map(iCtx => ({
            headlineCtrl: $model.chapterHeadline(iCtx),
            expandingFields: expandingFields(iCtx.data.path),
            ctrls: [
              ...($props.model.isArray(iCtx.data.path) ? [] : $model.leafFields(iCtx) ), 
              ...$model.commonFields(iCtx)
            ]
        }))
    })
  )
})

jb.component('tableTree.expandFirstLevel', {
	type: 'feature',
	impl: calcProp({phase: 5, id: 'before calcProps', value: ({},{$state,$props}) => {
      if ($state.refresh) return
      const pathsAsObj = jb.objFromEntries($props.model.children($props.model.rootPath) || []).map(path=>[path,true])
      $props.expanded = Object.assign($props.expanded || {}, pathsAsObj)
    }}) 
})

jb.component('tableTree.plain', {
  type: 'table-tree.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'gapWidth', as: 'number', defaultValue: 30},
    {id: 'expColWidth', as: 'number', defaultValue: 16},
    {id: 'noItemsCtrl', type: 'control', dynamic: true, defaultValue: text('no items')}
  ],
  impl: customStyle({
    template: (cmp,{headerFields, ctrlsMatrix, itemsCtxs, expanded, maxDepth, hideHeaders, gapWidth, expColWidth, noItemsCtrl},h) => h('table',{},[
        ...Array.from(new Array(maxDepth)).map(()=>h('col',{width: expColWidth + 'px'})),
        h('col.gapCol',{width: gapWidth + 'px'}),
        h('col.resizerCol',{width: '5px'}),
        ...headerFields.map(f=>h('col',{width: f.width || '200px'})),
        ...(hideHeaders ? [] : [ h('thead',{},h('tr',{},
          [ ...Array.from(new Array(maxDepth+2)).map(f=>h('th.th-expand-collapse',{})),
            ...headerFields.map(f=>h('th',{'jb-ctx': f.ctxId}, jb.ui.fieldTitle(cmp,f,h)))
          ]
        ))]),
        h('tbody.jb-items-parent',{},
          itemsCtxs.map((iCtx,index)=> h('tr.jb-item', {path: iCtx.data.path, expanded: expanded[iCtx.data.path] },
            [...ctrlsMatrix[index].expandingFields.map(f=>h('td.drag-handle',
                f.empty ? { class: 'empty-expand-collapse'} :
                f.resizer ? {class: 'tt-resizer' } : 
                f.toggle ? {class: 'expandbox' } : {class: 'headline', colSpan: f.colSpan, onclick: 'flip' },
              (f.empty || f.resizer) ? '' :
              f.toggle ? h('span',{}, h('i',{class:'material-icons noselect', onclick: 'flip' },
                f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right')) : h(ctrlsMatrix[index].headlineCtrl)
              )),
              ...ctrlsMatrix[index].ctrls.map(ctrl=>h('td.tree-field', {'jb-ctx': iCtx.id}, h(ctrl,{index})))
            ]
        ))),
        itemsCtxs.length == 0 ? h(noItemsCtrl()) : ''
      ]),
    css: `{border-spacing: 0; text-align: left;width: 100%; table-layout:fixed;}
      >tbody>tr>td { vertical-align: bottom; height: 30px; }
      >tbody>tr>td>span { font-size:16px; cursor: pointer; border: 1px solid transparent }
      >tbody>tr>td>span>i { font-size: 16px; vertical-align: middle;}
      `,
    features: tableTree.init()
  })
})

jb.component('tableTree.expandPath', {
  type: 'feature',
  params: [
	  {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
  ],
  impl: tree.expandPath('%$paths%')
})

jb.component('tableTree.resizer', {
  type: 'feature',
  impl: features(
    css('>tbody>tr>td.tt-resizer { cursor: col-resize }'),
	  frontEnd.method('setSize', ({data},{el}) => el.querySelector('.gapCol').width = data + 'px'),
    frontEnd.flow(
      source.frontEndEvent('mousedown'),
      rx.filter(ctx => jb.ui.hasClass(ctx.data.target,'tt-resizer')),
      rx.var('offset',({data},{el}) => data.clientX - (+el.querySelector('.gapCol').width.slice(0,-2))),
      rx.flatMap(rx.pipe(
        source.frontEndEvent('mousemove'), 
        rx.takeWhile('%buttons%!=0'),
        rx.map(({data},{offset}) => Math.max(0, data.clientX - offset)),
      )),
      sink.FEMethod('setSize')
    )
  )
})

jb.component('tableTree.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.onRefresh( (ctx,{cmp}) => cmp.drake.containers = jb.ui.find(cmp.base,'.jb-items-parent')),
    method('moveItem', (ctx,{$props}) => $props.model.move(ctx.data.from,ctx.data.to,ctx)),
		frontEnd.init( (ctx,{cmp}) => {
        const drake = cmp.drake = dragula([], {
          moves: (el, source, handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle')) && (el.getAttribute('path') || '').match(/[0-9]$/)
        })
        drake.containers = jb.ui.find(cmp.base,'.jb-items-parent')
        drake.on('drag', function(el, source) {
          const path = cmp.elemToPath(el)
          el.dragged = { path, expanded: cmp.state.expanded[path]}
          delete cmp.state.expanded[path]; // collapse when dragging
        })

        drake.on('drop', (dropElm, target, source,_targetSibling) => {
          if (!dropElm.dragged) return;
          dropElm.parentNode.removeChild(dropElm);
          cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded // restore expanded state
          const targetSibling = _targetSibling
          let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
          // strange dragule behavior fix
          const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
          const targetIndex = Number(targetPath.split('~').pop()) || 0;
          if (target === source && targetIndex > draggedIndex)
            targetPath = addToIndex(targetPath,-1)
          const from = dropElm.dragged.path
          const sameParent = dropElm.dragged.path.split('~').slice(0,-1).join('~') == targetPath.split('~').slice(0,-1).join('~')
          dropElm.dragged = null;
          if (sameParent)
            ctx.run(action.runBEMethod('moveItem',() => ({from, to: targetPath})))
        })
    }))
})

;

jb.extension('tree', {
	ROjson: class ROjson {
		constructor(json,rootPath) {
			this.json = json
			this.rootPath = rootPath
		}
		children(path) {
			const val = this.val(path)
			const out = (typeof val == 'object') ? Object.keys(val || {}) : []
			return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p)
		}
		val(path) {
			if (path.indexOf('~') == -1)
				return jb.val(this.json)
			return jb.val(path.split('~').slice(1).reduce((o,p) =>o[p], this.json))
		}
		isArray(path) {
			const val = this.val(path)
			return typeof val == 'object' && val !== null
		}
		icon() {
			return ''
		}
		title(path,collapsed) {
			const val = this.val(path)
			const prop = path.split('~').pop()
			const h = jb.ui.h
			if (val == null)
				return h('div',{},prop + ': null')
			if (!collapsed && typeof val == 'object')
				return h('div',{},prop)
	
			if (typeof val != 'object')
				return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: ''+val},jb.ui.limitStringLength(''+val,20))])
	
			return h('div',{},[h('span',{},prop + ': ')].concat(
				Object.keys(val).filter(p=>p.indexOf('$jb_') != 0).filter(p=> ['string','boolean','number'].indexOf(typeof val[p]) != -1)
				.map(p=> h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)))))
		}
	},
	Json: class Json {
		constructor(jsonRef,rootPath) {
			this.json = jsonRef;
			this.rootPath = rootPath;
			this.refHandler = jb.db.refHandler(jsonRef)
		}
		children(path) {
			const val = this.val(path)
			const out = (typeof val == 'object') ? Object.keys(val || {}) : [];
			return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p);
		}
		val(path) {
			if (path.indexOf('~') == -1)
				return jb.val(this.json)
			return jb.val(path.split('~').slice(1).reduce((o,p) => o[p], jb.val(this.json)))
	
			function clean(v) {
				const cls = jb.path(v,'constructor.name')
				return ['Object','Array','Boolean','Number','String'].indexOf(cls) == -1 ? cls : v
			}
		}
		isArray(path) {
			var val = this.val(path);
			return typeof val == 'object' && val !== null;
		}
		icon() {
			return ''
		}
		title(path,collapsed) {
			var val = this.val(path);
			var prop = path.split('~').pop();
			var h = jb.ui.h;
			if (val == null)
				return prop + ': null';
			if (!collapsed && typeof val == 'object')
				return prop
	
			if (typeof val != 'object')
				return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: val},jb.ui.limitStringLength(val,20))]);
	
			return h('div',{},[h('span',{},prop + ': ')].concat(
				Object.keys(val).filter(p=> typeof val[p] == 'string' || typeof val[p] == 'number' || typeof val[p] == 'boolean')
				.map(p=> h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)))))
		}
		modify(op,path,args,ctx) {
			op.call(this,path,args);
		}
		move(dragged,_target,ctx) { // drag & drop
			const draggedArr = this.val(dragged.split('~').slice(0,-1).join('~'));
			const target = isNaN(Number(_target.split('~').slice(-1))) ? _target + '~0' : _target
			const targetArr = this.val(target.split('~').slice(0,-1).join('~'));
			if (Array.isArray(draggedArr) && Array.isArray(targetArr))
				jb.db.move(jb.db.asRef(this.val(dragged)), this.val(target) ? jb.db.asRef(this.val(target)) : this.extraArrayRef(target) ,ctx)
		}
		extraArrayRef(target) {
			const targetArr = this.val(target.split('~').slice(0,-1).join('~'));
			const targetArrayRef = jb.db.asRef(targetArr)
			const handler = targetArrayRef.handler
			return handler && handler.refOfPath(handler.pathOfRef(targetArrayRef).concat(target.split('~').slice(-1)))
		}
	}	
})

jb.component('tree.jsonReadOnly', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'single', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: ({}, json, rootPath) => new jb.tree.ROjson(json,rootPath)
})

jb.component('tree.json', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'ref', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: ({}, json, rootPath) => new jb.tree.Json(json,rootPath)
});

jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'},
  ],
  impl: (ctx,profile) => jb.utils.prettyPrint(jb.val(profile),{ ...ctx.params, comps: jb.studio.previewjb.comps})
})

jb.extension('utils', {
  initExtension() {
    return {
      emptyLineWithSpaces: Array.from(new Array(200)).map(_=>' ').join(''),
      fixedNLRegExp: new RegExp(`__fixedNL${''}__`,'g'), // avoid self replacement
      fixedNL: `__fixedNL${''}__`, // avoid self replacement
    }
  },
  prettyPrintComp(compId,comp,settings={}) {
    if (comp) {
      return `jb.component('${compId}', ${jb.utils.prettyPrint(comp,{ initialPath: compId, ...settings })})`
    }
  },
  
  prettyPrint(val,settings = {}) {
    if (val == null) return ''
    return jb.utils.prettyPrintWithPositions(val,settings).text;
  },
  
  advanceLineCol({line,col},text) {
    const noOfLines = (text.match(/\n/g) || '').length
    const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
    return { line: line + noOfLines, col: newCol }
  },

  prettyPrintWithPositions(val,{colWidth=120,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
    comps = comps || jb.comps
    if (!val || typeof val !== 'object')
      return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

    const res = valueToMacro({path: initialPath, line:0, col: 0, depth :1}, val)
    res.text = res.text.replace(jb.utils.fixedNLRegExp,'\n')
    return res

    function processList(ctx,items) {
      const res = items.reduce((acc,{prop, item}) => {
        const toAdd = typeof item === 'function' ? item(acc) : item
        const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
        const startPos = jb.utils.advanceLineCol(acc,''), endPos = jb.utils.advanceLineCol(acc,toAddStr)
        const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
        return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
      }, {text: '', map: {}, ...ctx})
      return {...ctx, ...res}
    }

    function joinVals(ctx, innerVals, open, close, flat, isArray) {
      const {path, depth} = ctx
      const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
      const openResult = processList(ctx,[..._open, {prop: '!open-newline', item: () => newLine()}])
      const arrayOrObj = isArray? 'array' : 'obj'

      const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) => {
        const noColon = valueToMacro(ctx, val, flat).noColon // used to serialize function memeber
        return processList(acc,[
          {prop: `!${arrayOrObj}-prefix-${index}`, item: isArray ? '' : fixPropName(innerPath) + (noColon ? '' : ': ')},
          {prop: '!value', item: ctx => {
              const ctxWithPath = { ...ctx, path: [path,innerPath].join('~'), depth: depth +1 }
              return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
            }
          },
          {prop: `!${arrayOrObj}-separator-${index}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
        ])}
      , {...openResult, unflat: false} )
      const _close = typeof close === 'string' ? [{prop: '!close', item: close}] : close
      const result = processList(beforeClose, [{prop: '!close-newline', item: () => newLine(-1)}, ..._close])

      const unflat = shouldNotFlat(result)
      if ((forceFlat || !unflat) && !flat)
        return joinVals(ctx, innerVals, open, close, true, isArray)
      return {...result, unflat}

      function newLine(offset = 0) {
        return flat ? '' : '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth+offset)*tabSize)
      }

      function shouldNotFlat(result) {
        const long = result.text.replace(/\n\s*/g,'').split(jb.utils.fixedNL)[0].length > colWidth
        if (!jb.path(jb,'studio.valOfPath'))
          return result.unflat || long
        const val = jb.path(comps,path.split('~')) 
        const paramProps = path.match(/~params~[0-9]+$/)
        const paramsParent = path.match(/~params$/)
        const ctrls = path.match(/~controls$/) && Array.isArray(val)
        const moreThanTwoVals = innerVals.length > 2 && !isArray
        const top = !path.match(/~/g)
        return !paramProps && (result.unflat || paramsParent || moreThanTwoVals || top || ctrls || long)
      }
      function fixPropName(prop) {
        return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
      }
    }

    function profileToMacro(ctx, profile,flat) {
      const id = [jb.utils.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
      const comp = comps[id]
      if (comp)
        jb.core.fixMacroByValue(profile,comp)
      if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
        const props = Object.keys(profile)
        if (props.indexOf('$') > 0) { // make the $ first
          props.splice(props.indexOf('$'),1);
          props.unshift('$');
        }
        return joinVals(ctx, props.map(prop=>({innerPath: prop, val: profile[prop]})), '{', '}', flat, false)
      }
      const macro = jb.macroName(id)

      const params = comp.params || []
      const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
      const vars = (profile.$vars || []).map(({name,val},i) => ({innerPath: `$vars~${i}`, val: {$: 'Var', name, val }}))
      const remark = profile.remark ? [{innerPath: 'remark', val: {$remark: profile.remark}} ] : []
      const systemProps = vars.concat(remark)
      const openProfileByValueGroup = [{prop: '!profile', item: macro}, {prop:'!open-by-value', item:'('}]
      const closeProfileByValueGroup = [{prop:'!close-by-value', item:')'}]
      const openProfileSugarGroup = [{prop: '!profile', item: macro}, {prop:'!open-sugar', item:'('}]
      const closeProfileSugarGroup = [{prop:'!close-sugar', item: ')'}]
      const openProfileGroup = [{prop: '!profile', item: macro}, {prop:'!open-profile', item:'({'}]
      const closeProfileGroup = [{prop:'!close-profile', item:'})'}]

      if (firstParamIsArray) { // pipeline, or, and, plus
        const vars = (profile.$vars || []).map(({name,val}) => ({$: 'Var', name, val }))
        const args = vars.concat(jb.asArray(profile[params[0].id]))
          .map((val,i) => ({innerPath: params[0].id + '~' + i, val}))
        return joinVals(ctx, args, openProfileSugarGroup, closeProfileSugarGroup, flat, true)
      }
      const keys = Object.keys(profile).filter(x=>x != '$')
      const oneFirstArg = keys.length === 1 && params[0] && params[0].id == keys[0]
      const twoFirstArgs = keys.length == 2 && params.length >= 2 && profile[params[0].id] && profile[params[1].id]
      if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstArg || twoFirstArgs) {
        const args = systemProps.concat(params.map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
        for(let i=0;i<5;i++)
          if (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop()
        return joinVals(ctx, args, openProfileByValueGroup, closeProfileByValueGroup, flat, true)
      }
      const remarkProp = profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : []
      const systemPropsInObj = remarkProp.concat(vars.length ? [{innerPath: 'vars', val: vars.map(x=>x.val)}] : [])
      const args = systemPropsInObj.concat(params.filter(param=>propOfProfile(param.id) !== undefined)
          .map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
      const open = args.length ? openProfileGroup : openProfileByValueGroup
      const close = args.length ? closeProfileGroup : closeProfileByValueGroup
      return joinVals(ctx, args, open, close, flat, false)

      function propOfProfile(paramId) {
        const isFirst = params[0] && params[0].id == paramId
        return isFirst && profile['$'+id] || profile[paramId]
      }
    }

    function valueToMacro({path, line, col, depth}, val, flat) {
      const ctx = {path, line, col, depth}
      let result = doValueToMacro()
      if (typeof result === 'string')
        result = { text: result, map: {}}
      return result

      function doValueToMacro() {
        if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
        if (val === null) return 'null';
        if (val === undefined) return 'undefined';
        if (typeof val === 'object') return profileToMacro(ctx, val, flat);
        if (typeof val === 'function') {
          const asStr = val.toString().trim().replace(/^'([a-zA-Z_\-0-9]+)'/,'$1')
          const header = asStr.indexOf(`${val.name}(`) == 0 ? val.name : asStr.indexOf(`function ${val.name}(`) == 0 ? `function ${val.name}` : ''
          return { text: asStr.slice(header.length).replace(/\n/g,jb.utils.fixedNL), noColon: header ? true : false, map: {} }
        }
        if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
          return processList(ctx,[
            {prop: '!value-text-start', item: "'"},
            {prop: '!value-text', item: JSON.stringify(val).slice(1,-1)},
            {prop: '!value-text-end', item: "'"},
          ])
        else if (typeof val === 'string' && val.indexOf('\n') != -1)
          return processList(ctx,[
            {prop: '!value-text-start', item: "`"},
            {prop: '!value-text', item: val.replace(/`/g,'\\`')},
            {prop: '!value-text-end', item: "`"},
          ])
        else
          return JSON.stringify(val) || 'undefined'; // primitives or symbol
      }
    }

    function arrayToMacro(ctx, array, flat) {
      const vals = array.map((val,i) => ({innerPath: i, val}))
      const openArray = [{prop:'!open-array', item:'['}]
      const closeArray = [{prop:'!close-array', item:']'}]

      return joinVals(ctx, vals, openArray, closeArray, flat, true)
    }
  }
})
;

jb.extension('remoteCtx', {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.utils.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const data = profText.match(/({data})|(ctx.data)|(%%)/) && jb.remoteCtx.stripData(ctx.data) 
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data) {
        if (data == null) return
        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return jb.remoteCtx.stripFunction(data)
        if (data instanceof jb.core.jbCtx)
             return jb.remoteCtx.stripCtx(data)
        if (Array.isArray(data))
             return data.slice(0,100).map(x=>jb.remoteCtx.stripData(x))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object' && data.comps)
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data).filter(e=> typeof e[1] != 'function').map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
    },
    stripFunction(f) {
        const {profile,runCtx,path,param,srcPath} = f
        if (!profile || !runCtx) return jb.remoteCtx.stripJS(f)
        const profText = jb.utils.prettyPrint(profile)
        const profNoJS = jb.remoteCtx.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].filter(x=>x).join('~'), param, profile: profNoJS, data: jb.remoteCtx.stripData(runCtx.data), vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(jb.remoteCtx.stripCtx(ctx)) },
    deStrip(data) {
        if (typeof data == 'string' && data.match(/^__JBART_FUNC:/))
            return eval(data.slice(14))
        const stripedObj = typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],jb.remoteCtx.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.core.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>jb.remoteCtx.deStrip(x))
        return stripedObj || data
    },
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
    stripJSFromProfile(profile) {
        if (typeof profile == 'function')
            return `__JBART_FUNC: ${profile.toString()}`
        else if (Array.isArray(profile))
            return profile.map(val => jb.remoteCtx.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, jb.remoteCtx.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : jb.remoteCtx.stripData(val)
    },
    serializeCmp(compId) {
        if (!jb.comps[compId])
            return jb.logError('no component of id ',{compId}),''
        return jb.utils.prettyPrint({compId, ...jb.comps[compId],
            location: jb.comps[compId][jb.core.location], loadingPhase: jb.comps[compId][jb.core.loadingPhase]} )
    },
    deSerializeCmp(code) {
        if (!code) return
        try {
            const cmp = eval(`(function() { ${jb.importAllMacros()}; return ${code} })()`)
            const res = {...cmp, [jb.core.location]: cmp.location, [jb.core.loadingPhase]: cmp.loadingPhase }
            delete res.location
            delete res.loadingPhase
            jb.comps[res.compId] = res
        } catch (e) {
            jb.logException(e,'eval profile',{code})
        }        
    },
})

;

/* jbm - a virtual jBart machine - can be implemented in same frame/sub frames/workers over the network
interface jbm : {
     uri : string // devtools•logPanel, studio•preview•debugView, •debugView
     parent : jbm // null means root
     remoteExec(profile: any, ,{timeout,oneway}) : Promise | void
     createCallbagSource(stripped ctx of cb_source) : cb
     createCalllbagOperator(stripped ctx of cb_operator) : (source => cb)
}
jbm interface can be implemented on the actual jb object or a jbm proxy via port

// port is used to send messages between two jbms
interface port {
     from: uri
     to: uri
     postMessage(m)
     onMessage({addListener(handler(m))})
     onDisconnect({addListener(handler)})
}
implementatios over frame(window,worker), websocket, connection 

Routing is implemented by remoteRoutingPort, first calclating the routing path, and sending to the message hop by hop to the destination.
The routing path is reversed to create response message
*/

var { rx,source,jbm,remote,net,pipe, aggregate } = jb.ns('rx,source,jbm,remote,net')

jb.extension('cbHandler', {
    initExtension() {
        Object.assign(this, { counter: 0, map: {}, })
    },
    newId: () => jb.uri + ':' + (jb.cbHandler.counter++),
    get: id => jb.cbHandler.map[id],
    getAsPromise(id,t) { 
        return jb.exec({$: 'waitFor', check: ()=> jb.cbHandler.map[id], interval: 5, times: 10})
            .catch(err => jb.logError('cbLookUp - can not find cb',{id, in: jb.uri}))
            .then(cb => {
                if (t == 2) jb.cbHandler.removeEntry(id)
                return cb
            })
    },
    addToLookup(cb) { 
        const id = jb.cbHandler.newId()
        jb.cbHandler.map[id] = cb
        return id 
    },
    removeEntry(ids,m) {
        jb.log(`remote remove cb handlers at ${jb.uri}`,{ids,m})
        jb.delay(1000).then(()=>
            jb.asArray(ids).filter(x=>x).forEach(id => delete jb.cbHandler.map[id]))
    }
}),

jb.extension('net', {
    reverseRoutingProps(routingMsg) {
        if (!routingMsg) return
        const rPath = routingMsg.routingPath && {
            routingPath: routingMsg.routingPath.slice(0).reverse(),
            from: routingMsg.to,
            to: routingMsg.from,
            $disableLog: jb.path(routingMsg,'remoteRun.vars.$disableLog')
        }
        const diableLog = jb.path(routingMsg,'remoteRun.vars.$disableLog') && {$disableLog: true}
        return { ...rPath, ...diableLog}
    },
    handleOrRouteMsg(from,to,handler,m, {blockContentScriptLoop} = {}) {
//            jb.log(`remote handle or route at ${from}`,{m})
        if (blockContentScriptLoop && m.routingPath && m.routingPath.join(',').indexOf([from,to].join(',')) != -1) return
        const arrivedToDest = m.routingPath && m.routingPath.slice(-1)[0] === jb.uri || (m.to == from && m.from == to)
        if (arrivedToDest) {
            jb.log(`remote received at ${from} from ${m.from} to ${m.to}`,{m})
            handler && handler(m)
        } else if (m.routingPath) {
            const path = m.routingPath
            const indexOfNextPort = path.indexOf(jb.uri)+1
            let nextPort = indexOfNextPort && jb.ports[path[indexOfNextPort]]
            if (!nextPort && jb.jbm.gateway) {
                path.splice(path.indexOf(jb.uri),0,jb.jbm.gateway.uri)
                nextPort = jb.jbm.gateway
                jb.log(`remote gateway injected to routingPath at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
            }
            if (!nextPort)
                return jb.logError(`remote - no destination found and no gateway at ${from} from ${m.from} to ${m.to}`,{ m })
            jb.log(`remote forward at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
            nextPort.postMessage(m)
        }            
    }
})

jb.extension('jbm', {
    initExtension() {
        Object.assign(this, { childJbms: {}, networkPeers: {} })
        Object.assign(jb, {
            uri: jb.uri || jb.frame.jbUri,
            ports: {},
            remoteExec: sctx => jb.codeLoader.bringMissingCode(sctx).then(()=>jb.remoteCtx.deStrip(sctx)()),
            createCallbagSource: sctx => jb.remoteCtx.deStrip(sctx)(),
            createCalllbagOperator: sctx => jb.remoteCtx.deStrip(sctx)(),
        })        
    },
    portFromFrame(frame,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            frame, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`remote sent from ${from} to ${to}`,{m})
                frame.postMessage(m) 
            },
            onMessage: { addListener: handler => frame.addEventListener('message', m => jb.net.handleOrRouteMsg(from,to,handler,m.data,options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    extendPortToJbmProxy(port,{doNotinitCommandListener} = {}) {
        if (port && !port.createCalllbagSource) {
            Object.assign(port, {
                uri: port.to,
                createCallbagSource(remoteRun) {
                    const cbId = jb.cbHandler.newId()
                    port.postMessage({$:'CB.createSource', remoteRun, cbId })
                    return (t,d) => outboundMsg({cbId,t,d})
                },
                createCalllbagOperator(remoteRun) {
                    return source => {
                        const sourceId = jb.cbHandler.addToLookup(Object.assign(source,{remoteRun}))
                        const cbId = jb.cbHandler.newId()
                        port.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                        return (t,d) => {
                            if (t == 2) console.log('send 2',cbId,sourceId)
                            outboundMsg({cbId,t,d})
                        }
                    }
                },
                remoteExec(remoteRun, {oneway, timeout = 3000, isAction} = {}) {
                    if (oneway)
                        return port.postMessage({$:'CB.execOneWay', remoteRun, timeout })
                    return new Promise((resolve,reject) => {
                        const handlers = jb.cbHandler.map
                        const cbId = jb.cbHandler.newId()
                        const timer = setTimeout(() => {
                            const err = { type: 'error', desc: 'remote exec timeout', remoteRun, timeout }
                            jb.logError('remote exec timeout',err)
                            handlers[cbId] && reject(err)
                        }, timeout)
                        handlers[cbId] = {resolve,reject,remoteRun, timer}
                        jb.log('remote exec request',{remoteRun,port,oneway})
                        port.postMessage({$:'CB.exec', remoteRun, cbId, isAction, timeout })
                    })
                }
            })
            if (!doNotinitCommandListener)
                initCommandListener()
        }
        return port

        function initCommandListener() {
            port.onMessage.addListener(m => {
                jb.log('remote command listener',{m})
                if ((m.$ || '').indexOf('CB.') == 0)
                    handleCBCommnad(m)
                else if (m.$ == 'CB')
                    inboundMsg(m)
                else if (m.$ == 'execResult')
                    inboundExecResult(m)
            })
        }

        function outboundMsg({cbId,t,d}) { 
            port.postMessage({$:'CB', cbId,t, d: t == 0 ? jb.cbHandler.addToLookup(d) : d })
        }
        function inboundMsg(m) { 
            const {cbId,t,d} = m
            if (t == 2) jb.cbHandler.removeEntry(cbId,m)
            return jb.cbHandler.getAsPromise(cbId,t).then(cb=> cb && cb(t, t == 0 ? remoteCB(d,cbId,m) : d)) 
        }
        function inboundExecResult(m) { 
            jb.cbHandler.getAsPromise(m.cbId).then(h=>{
                if (!h) 
                    return jb.logError('remote exec result arrived with no handler',{cbId:m.cbId, m})
                clearTimeout(h.timer)
                if (m.type == 'error') {
                    jb.logError('remote remoteExec', {m, h})
                    h.reject(m)
                } else {
                    h.resolve(m.result)
                }
                jb.cbHandler.removeEntry(m.cbId,m)
            })
        }            
        function remoteCB(cbId, localCbId, routingMsg) { 
            let talkback
            return (t,d) => {
                if (t==2) jb.cbHandler.removeEntry([localCbId,talkback],routingMsg)
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = jb.cbHandler.addToLookup(d)) : jb.remoteCtx.stripCBVars(d), ...jb.net.reverseRoutingProps(routingMsg) }) 
            }
        }
        function handleCBCommnad(cmd) {
            const {$,sourceId,cbId,isAction} = cmd
            jb.codeLoader.bringMissingCode(cmd.remoteRun)
                .then(()=>{
                    jb.log('run cmd from remote',{cmd})
                    return jb.remoteCtx.deStrip(cmd.remoteRun)()
                })
                .then( result => {
                    if ($ == 'CB.createSource' && typeof result == 'function')
                        jb.cbHandler.map[cbId] = result
                    else if ($ == 'CB.createOperator' && typeof result == 'function')
                        jb.cbHandler.map[cbId] = result(remoteCB(sourceId, cbId,cmd) )
                    else if ($ == 'CB.exec')
                        port.postMessage({$:'execResult', cbId, result: isAction ? {} : jb.remoteCtx.stripData(result) , ...jb.net.reverseRoutingProps(cmd) })

            }).catch(err=> $ == 'CB.exec' && 
                port.postMessage({$:'execResult', cbId, result: { type: 'error', err}, ...jb.net.reverseRoutingProps(cmd) }))
        }
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    initDevToolsDebugge() {
        if (self.jbRunningTests && !self.jbSingleTest) return
        if (!jb.jbm.networkPeers['devtools']) {
            jb.jbm.connectToPanel = panelUri => new jb.core.jbCtx().setVar('$disableLog',true).run(remote.action({
                    action: {$: 'jbm.connectToPanel', panelUri}, 
                    jbm: jbm.byUri('devtools'),
                    oneway: true
                })) // called directly by initPanel
            jb.jbm.networkPeers['devtools'] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'devtools',{blockContentScriptLoop: true}))
            self.postMessage({initDevToolsPeerOnDebugge: {uri: jb.uri, distPath: jb.jbm.pathOfDistFolder(), spyParam: jb.path(jb,'spy.spyParam')}}, '*')
        }
    }            
})

jb.component('jbm.worker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', defaultValue: 'w1' },
        {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
    ],    
    impl: ({},name,networkPeer) => {
        const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
        if (childsOrNet[name]) return childsOrNet[name]
        const workerUri = networkPeer ? name : `${jb.uri}•${name}`
        const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
        const workerCode = `
jb = { uri: '${workerUri}'}
jbLoadingPhase = 'libs'
${jb.codeLoader.startupCode()};
spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
jb.codeLoaderJbm = ${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
jbLoadingPhase = 'appFiles'
//# sourceURL=${workerUri}-startup.js
`
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        return childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
    }
})

jb.component('jbm.child', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', mandatory: true},
        {id: 'codeLoaderUri', as: 'string', description: 'default is parent codeLoaderJbm'},
    ],    
    impl: ({},name) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const childUri = `${jb.uri}•${name}`
        const child = jb.frame.eval(`(function () {
const jb = { uri: '${childUri}'}
self.jbLoadingPhase = 'libs'
${jb.codeLoader.startupCode()};
self.jbLoadingPhase = 'appFiles'
return jb
})()
//# sourceURL=${childUri}-startup.js
`)
        jb.jbm.childJbms[name] = child
        child.parent = jb
        child.codeLoaderJbm = jb.codeLoaderJbm || jb // TODO: use codeLoaderUri
        child.ports[jb.uri] = {
            from: child.uri, to: jb.uri,
            postMessage: m => 
                jb.net.handleOrRouteMsg(jb.uri,child.uri,jb.ports[child.uri].handler,m),
            onMessage: { addListener: handler => child.ports[jb.uri].handler = handler }, // only one handler
        }
        child.jbm.extendPortToJbmProxy(child.ports[jb.uri])
        jb.ports[child.uri] = {
            from: jb.uri,to: child.uri,
            postMessage: m => 
                child.net.handleOrRouteMsg(child.uri,jb.uri,child.ports[jb.uri].handler ,m),
            onMessage: { addListener: handler => jb.ports[child.uri].handler = handler }, // only one handler
        }
        jb.jbm.extendPortToJbmProxy(jb.ports[child.uri])
        jb.spy && child.spy.initSpy({spyParam: jb.spy.spyParam})
        return child
    }
})

jb.component('jbm.byUri', {
    type: 'jbm',
    params: [
        { id: 'uri', as: 'string', dynamic: true}
    ],
    impl: ({},_uri) => {
        const uri = _uri()
        if (uri == jb.uri) return jb
        return calcNeighbourJbm(uri) || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri),{doNotinitCommandListener: true})

        function remoteRoutingPort(from,to) {
            if (jb.ports[to]) return jb.ports[to]
            const routingPath = calcRoutingPath(from,to)
            if (routingPath.length == 2 && jb.ports[routingPath[1]])
                return jb.ports[routingPath[1]]
            let nextPort = jb.ports[routingPath[1]]
            if (!nextPort && jb.jbm.gateway) {
                routingPath.splice(1,0,jb.jbm.gateway.uri)
                nextPort = jb.jbm.gateway
            }
            if (!nextPort)
                return jb.logError(`routing - can not find next port`,{routingPath, uri: jb.uri, from,to})
    
            const port = {
                from, to,
                postMessage: _m => { 
                    const m = {from, to,routingPath,..._m}
                    jb.log(`remote routing sent from ${from} to ${to}`,{m})
                    nextPort.postMessage(m)
                },
                onMessage: { addListener: handler => nextPort.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
                onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
            }
            jb.ports[to] = port
            return port
        }

        function calcRoutingPath(from,to) {
            const pp1 = from.split('•'), pp2 = to.split('•')
            const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('•'))
            const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('•'))
            let i =0;
            while (p1[i] === p2[i] && i < p1.length) i++;
            const path_to_shared_parent = i ? p1.slice(i-1) : p1.slice(i) // i == 0 means there is no shared parent, so network is used
            return [...path_to_shared_parent.reverse(),...p2.slice(i)]
        }
        function calcNeighbourJbm(uri) {
            return [jb.parent, ...Object.values(jb.jbm.childJbms), ...Object.values(jb.jbm.networkPeers)].filter(x=>x).find(x=>x.uri == uri)
        }
    }
})

jb.component('jbm.same', {
    type: 'jbm',
    impl: () => jb
})
;

jb.component('source.remote', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same() },
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('source.remote - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        if (jb.utils.isPromise(jbm))
            return jb.callbag.pipe(jb.callbag.fromPromise(jbm), jb.callbag.concatMap(_jbm=> _jbm.createCallbagSource(stripedRx)))
        return jbm.createCallbagSource(stripedRx)
    }        
})

jb.component('remote.operator', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('remote.operator - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        if (jb.utils.isPromise(jbm)) {
            jb.log('jbm as promise in remote operator, adding request buffer', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
            return source => {
                const buffer = jb.callbag.replay(5)(source)
                return jb.callbag.pipe(jb.callbag.fromPromise(jbm),jb.callbag.concatMap(_jbm=> _jbm.createCalllbagOperator(stripedRx)(buffer)))
            }
        }
        return jbm.createCalllbagOperator(stripedRx)
    }
})

jb.component('remote.action', {
    type: 'action',
    description: 'exec a script on a remote node and returns a promise if not oneWay',
    params: [
      {id: 'action', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
      {id: 'oneway', as: 'boolean', description: 'do not wait for the respone' },
      {id: 'timeout', as: 'number', defaultValue: 10000 },
    ],
    impl: (ctx,action,jbm,oneway,timeout) => {
        if (!jbm)
            return jb.logError('remote.action - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        return Promise.resolve(jbm).then(_jbm => _jbm.remoteExec(jb.remoteCtx.stripFunction(action),{timeout,oneway,isAction: true}))
    }
})

jb.component('remote.data', {
    description: 'calc a script on a remote node and returns a promise',
    macroByValue: true,
    params: [
      {id: 'data', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
      {id: 'timeout', as: 'number', defaultValue: 10000 },
    ],
    impl: (ctx,data,jbm,timeout) => {
        if (!jbm)
            return jb.logError('remote.data - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        return Promise.resolve(jbm).then(_jbm=> _jbm.remoteExec(jb.remoteCtx.stripFunction(data),{timeout}))
    }
})

jb.component('remote.initShadowData', {
    type: 'action',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'src', as: 'ref' },
      {id: 'jbm', type: 'jbm'},
    ],
    impl: rx.pipe(
        source.watchableData({ref: '%$src%', includeChildren: 'yes'}),
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
        rx.log('test op'),
        sink.action(remote.action( 
            ctx => jb.db.doOp(jb.db.refOfPath(ctx.data.path), ctx.data.op, ctx),
            '%$jbm%')
        )
    )
})

/*** net comps */

jb.component('net.listSubJbms', {
    type: 'rx',
    category: 'source',
    impl: pipe(
        () => Object.values(jb.jbm.childJbms || {}),
        log('test listSubJbms 1'),
        remote.data(net.listSubJbms(),'%%'),
        log('test listSubJbms 2'),
        aggregate(list(() => jb.uri,'%%'))
    )
})

jb.component('net.getRootParentUri', {
    impl: () => jb.uri.split('•')[0]
})

jb.component('net.listAll', {
    impl: remote.data(
        pipe(
            () => Object.values(jb.jbm.networkPeers || {}),
            remote.data(net.listSubJbms(),'%%'),
            aggregate(list(net.listSubJbms() ,'%%'))
        )
        ,jbm.byUri(net.getRootParentUri())
    )
});

var {rx, remote, widget, jbm} = jb.ns('remote,rx,widget,jbm')

jb.component('widget.frontEndCtrl', {
    type: 'control',
    params: [
      {id: 'widgetId', as: 'string'},
    ],
    impl: group({
        features: [
            htmlAttribute('widgetId','%$widgetId%'),
            htmlAttribute('remoteUri','%$remoteUri%'),
            htmlAttribute('widgetTop','true'),
            htmlAttribute('frontend','true'),
        ]
    })
})

jb.component('widget.newId', {
    params: [
        {id: 'jbm', type: 'jbm', defaultValue: () => jb },
    ],
    impl: (ctx, jbm) => {
        const id = jbm.uri + '-' + ctx.id
        jb.ui.frontendWidgets = jb.ui.frontendWidgets || {}
        jb.ui.frontendWidgets[id] = jbm
        return id
    }
})

jb.component('action.frontEndDelta', {
    type: 'action',
    impl: async ctx => {
        const {delta,css,widgetId,cmpId,assumedVdom} = ctx.data
        if (css) 
            return !ctx.vars.headlessWidget && jb.ui.addStyleElem(ctx,css)
        await jb.codeLoader.getCodeFromRemote(jb.codeLoader.treeShakeFrontendFeatures(pathsOfFEFeatures(delta)))
        await jb.codeLoader.loadFELibsDirectly(feLibs(delta))
        const ctxToUse = ctx.setVars({headlessWidget: false, FEwidgetId: widgetId})
        const elem = cmpId ? jb.ui.find(jb.ui.widgetBody(ctxToUse),`[cmp-id="${cmpId}"]`)[0] : jb.ui.widgetBody(ctxToUse)
        try {
            const res = elem && jb.ui.applyDeltaToCmp({delta,ctx: ctxToUse,cmpId,elem,assumedVdom})
            if (jb.path(res,'recover')) {
                jb.log('headless frontend recover widget request',{widgetId,ctx,elem,cmpId, ...res})
                jb.ui.widgetUserRequests.next({$: 'recoverWidget', widgetId, ...res })
            }
        } catch(e) {
            jb.logException(e,'headless frontend apply delta',{ctx,elem,cmpId})
        }

        function pathsOfFEFeatures(obj) {
            if (!obj || typeof obj != 'object') return []
            if (obj.$__frontEndMethods) 
                return JSON.parse(obj.$__frontEndMethods).map(x=>x.path)
            return Object.values(obj).flatMap(x=>pathsOfFEFeatures(x))
        }
        function feLibs(obj) {
            if (!obj || typeof obj != 'object') return []
            if (obj.$__frontEndLibs) 
                return JSON.parse(obj.$__frontEndLibs)
            return Object.values(obj).flatMap(x=>feLibs(x))
        }        
    }
})

jb.component('remote.widget', {
    type: 'control',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'jbm', type: 'jbm' },
    ],
    impl: controlWithFeatures({
        vars: Var('widgetId', widget.newId('%$jbm%')),
        control: widget.frontEndCtrl('%$widgetId%'),
        features: followUp.flow(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('remote widget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile(({data}) => data.$ != 'destroy',true),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('remote widget sent to headless'),
            remote.operator(widget.headless(call('control'),'%$widgetId%'), '%$jbm%'),
            rx.log('remote widget arrived from headless'),
            sink.action(action.frontEndDelta('%$widgetId%')),
        )
    })
})

jb.component('action.renderXwidget', {
    type: 'action',
    params: [
        {id: 'selector', as: 'string', defaultValue: 'body' },
        {id: 'widgetId', as: 'string' },
    ],
    impl: ({},selector,widgetId) => 
        jb.ui.renderWidget({$: 'widget.frontEndCtrl', widgetId: widgetId}, document.querySelector(selector)),
    dependency: widget.frontEndCtrl()
})

jb.component('remote.widgetFrontEnd', {
    type: 'action',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'jbm', type: 'jbm' },
      {id: 'selector', as: 'string', defaultValue: 'body', description: 'root selector to put widget in. e.g. #main' },
    ],
    impl: runActions(
        Var('widgetId', widget.newId()),
        remote.action(action.renderXwidget('%$selector%','%$widgetId%'), '%$jbm%' ),
        rx.pipe(
            source.remote(
                rx.pipe(
                    source.callbag(() => jb.ui.widgetUserRequests),
                    rx.log('remote widget userReq'),
                    rx.filter('%widgetId% == %$widgetId%'),
                    rx.takeWhile(({data}) => data.$ != 'destroy',true),
             ), '%$jbm%' ),
            widget.headless('%$control()%','%$widgetId%'),
            sink.action(remote.action(action.frontEndDelta('%$widgetId%'),'%$jbm%'))
        )
    )
})

jb.extension('ui','headless', {
    initExtension_phase1100() { // 1100 is after ui phase (100)
        return {
            widgetRenderingSrc: jb.callbag.replay(10)(jb.ui.renderingUpdates),
            headless: {},
        }
    },
    createHeadlessWidget(widgetId, ctrl,ctx,{recover} = {}) {
        const ctxToUse = jb.ui.extendWithServiceRegistry(ctx.setVars(
            {...(recover && { recover: true}), headlessWidget: true, headlessWidgetId: widgetId }))
        const cmp = ctrl(ctxToUse)
        const top = jb.ui.h(cmp)
        const body = jb.ui.h('div',{ widgetTop: true, headless: true, widgetId, ...(ctx.vars.remoteUri && { remoteUri: ctx.vars.remoteUri })},top)
        if (jb.ui.headless[widgetId]) {
            if (!recover) jb.logError('headless widgetId already exists',{widgetId,ctx})
            jb.ui.unmount(jb.ui.headless[widgetId])
        }
        if (recover && !jb.ui.headless[widgetId])
            jb.logError('headless recover no existing widget',{widgetId,ctx})
        jb.ui.headless[widgetId] = { body }
        jb.log('headless widget created',{widgetId,body})
        const delta = { children: {resetAll : true, toAppend: [jb.ui.stripVdom(top)]} }
        jb.ui.renderingUpdates.next({widgetId, delta })
    },
    handleUserReq(userReq, sink) {
        jb.log('headless widget handle userRequset',{widgetId: userReq.widgetId,userReq})
        if (userReq.$ == 'runCtxAction') {
            const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
            if (!ctx)
                return jb.logError(`headless widget runCtxAction. no ctxId ${userReq.ctxIdToRun}`,{userReq})
            jb.ui.runCtxActionAndUdateCmpState(ctx,userReq.data,userReq.vars)
        } else if (userReq.$ == 'recoverWidget') {
            jb.log('recover headless widget',{userReq})
            //createHeadlessWidget({ recover: true })
        } else if (userReq.$ == 'destroy') {
            jb.log('destroy headless widget request',{widgetId: userReq.widgetId,userReq})
            jb.ui.BECmpsDestroyNotification.next({cmps: userReq.cmps, destroyLocally: true})
            if (userReq.destroyWidget) jb.delay(1).then(()=> {
                    jb.log('destroy headless widget',{widgetId: userReq.widgetId,userReq})
                    delete jb.ui.headless[userReq.widgetId]
                }) // the delay is needed for tests
            sink(2)
        }
    }
})

jb.component('widget.headless', {
    type: 'rx',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'widgetId', as: 'string'},
    ],
    impl: (ctx,ctrl,widgetId) => {
        const filteredSrc = jb.callbag.filter(m=>m.widgetId == widgetId)(jb.ui.widgetRenderingSrc)
        jb.ui.createHeadlessWidget(widgetId,ctrl,ctx)
        return userReqIn => (start, sink) => {
            if (start !== 0) return
            const talkback = []
            sink(0, function headless(t, d) {
                if (t == 1 && d == null)
                    talkback.forEach(tb=>tb(1))
            })
            filteredSrc(0, function headless(t, d) {
                jb.log('headless widget delta out',{widgetId,t,d,ctx})
                if (t == 0) talkback.push(d)
                if (t === 2) sink(t,d)
                if (t === 1 && d) sink(t,ctx.dataObj(d))
            })
    
            userReqIn(0, function headless(t, d) {
              jb.log('headless widget userRequset in',{widgetId,t,d,ctx})
              if (t == 0) talkback.push(d)
              if (t === 2) sink(t,d)
              if (t === 1 && d && d.data.widgetId == widgetId) jb.ui.handleUserReq(d.data,sink)
            })
        }
    }
})

jb.component('widget.headlessWidgets', {
    impl: () => Object.keys(jb.ui.headless)
});

(function() {
var {textEditor} = jb.ns('textEditor')

const posToCM = pos => pos && ({line: pos.line, ch: pos.col})
const posFromCM = pos => pos && ({line: pos.line, col: pos.ch})

jb.component('editableText.codemirror', {
  type: 'editable-text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'height', as: 'string', defaultValue: 300},
    {id: 'mode', as: 'string'},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'},
    {id: 'lineNumbers', as: 'boolean', type: 'boolean'},
    {id: 'readOnly', options: ',true,nocursor'},
    {id: 'onCtrlEnter', type: 'action', dynamic: true},
    {id: 'hint', as: 'boolean', type: 'boolean'},
    {id: 'maxLength', as: 'number', defaultValue: 5000}
  ],
  impl: features(
	calcProp('text','%$$model/databind()%'),
	frontEnd.var('text', '%$$props/text%'),
    calcProp('textAreaAlternative',({},{$props},{maxLength}) => ($props.text || '').length > maxLength),
    () => ({
		  template: ({},{text,textAreaAlternative},h) => textAreaAlternative ? 
		  		h('textarea.jb-textarea-alternative-for-codemirror autoResizeInDialog', {value: text }) :
				h('div'),
	}),
	frontEnd.var('cm_settings', ({},{},{cm_settings,lineWrapping, mode, lineNumbers, readOnly}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
	method('onCtrlEnter', call('onCtrlEnter')),
	textEditor.cmEnrichUserEvent(),
    frontEnd.init( (ctx,vars) => ! jb.ui.hasClass(vars.el, 'jb-textarea-alternative-for-codemirror')
		 && injectCodeMirror(ctx,vars)),
	frontEnd.onRefresh(({},{text,cmp}) => cmp.editor.setValue(text)),
	method('writeText',writeValue('%$$model/databind()%','%%')),
	frontEnd.flow(
			source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('change', () => obs(cmp.editor.getValue()))) ),
			rx.takeUntil('%$cmp/destroyed%'),
			rx.debounceTime('%$debounceTime%'),
			rx.distinctUntilChanged(),
			sink.BEMethod('writeText','%%')
	),
    css(({},{},{height}) => `{width: 100% }
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

jb.component('codemirror.textEditorKeys', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp,el}) => ({...cmp.extraCmSettings, ...{
		extraKeys: {
			'Ctrl-Space': 'autocomplete',
			'Ctrl-Enter': () => jb.ui.runBEMethod(el,'onCtrlEnter'),
		},
	}})),
})

jb.component('codemirror.fold', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp}) => ({...cmp.extraCmSettings, ...{
		extraKeys: {
			'Ctrl-Q': () => cmp.editor.foldCode(cmp.editor.getCursor())
		},
		lineWrapping: true,
		foldGutter: true,			
		gutters: [ 'CodeMirror-foldgutter' ]
	}})),
})

jb.component('codemirror.lineNumbers', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp}) => ({...cmp.extraCmSettings, ...{
		lineNumbers: true,
		gutters: ['CodeMirror-linenumbers' ]
	}})),
})

jb.component('textEditor.cmEnrichUserEvent', {
    type: 'feature',
    params: [
      {id: 'cmSelector', as: 'string', description: 'used for external buttons'}
    ],
    impl: features(
		frontEnd.var('cmSelector','%$cmSelector%'),
        frontEnd.enrichUserEvent((ctx,{cmp,cmSelector}) => {
			const elem = cmSelector ? jb.ui.widgetBody(ctx).querySelector(cmSelector) : cmp.base
			const editor = elem && elem.editor
            return editor && {
                outerHeight: jb.ui.outerHeight(elem), 
                outerWidth: jb.ui.outerWidth(elem), 
                clientRect: elem.getBoundingClientRect(),
                text: editor.getValue(),
                selectionStart: posFromCM(editor.getCursor()),
            }
        })
    )
})

function injectCodeMirror(ctx,{text,cmp,el,cm_settings,_enableFullScreen,formatText}) {
	if (cmp.editor) return
	if (text == null)
		return jb.logError('codemirror - no binding to text',{ctx, cmp})
	const _extraKeys = { ...cm_settings.extraKeys, ...jb.path(cmp.extraCmSettings,'extraKeys')}
	const extraKeys = jb.objFromEntries(jb.entries(_extraKeys).map(e=>[
		e[0], (''+e[1]).replace(/\s/g,'').indexOf('()=>') == 0 ? e[1]
			: _ => ctx.setVar('ev',jb.ui.buildUserEvent({},el)).run(action.runBEMethod(e[1]))
	]))
	const gutters = [ ...(cm_settings.gutters || []), ...(jb.path(cmp.extraCmSettings,'gutters') || []) ]
	const settings = {...cm_settings, ...cmp.extraCmSettings, value: text || '', autofocus: false, extraKeys, gutters }
	cmp.editor = CodeMirror(el, settings)
	cmp.editor.getWrapperElement().setAttribute('jb_external','true')
	jb.ui.addClass(cmp.editor.getWrapperElement(),'autoResizeInDialog')
	if (formatText) {
		CodeMirror.commands.selectAll(cmp.editor)
		cmp.editor.autoFormatRange(cmp.editor.getCursor(true), cmp.editor.getCursor(false));
		cmp.editor.setSelection({line:0, ch:0})
	}
	//cmp.editor.refresh()
	_enableFullScreen && jb.delay(1).then(() => enableFullScreen(ctx,cmp,el))
}

function enableFullScreen(ctx,cmp,el) {
	const width = jb.ui.outerWidth(el), height = jb.ui.outerHeight(el), editor = cmp.editor
	const fullScreenBtnHtml = '<div class="jb-codemirror-fullScreenBtnCss hidden"><img title="Full Screen (F11)" src="http://png-1.findicons.com/files/icons/1150/tango/22/view_fullscreen.png"/></div>'
	const escText = '<span class="jb-codemirror-escCss">Press ESC or F11 to exit full screen</span>'
	const lineNumbers = true
	const css = `
		.jb-codemirror-escCss { cursor:default; text-align: center; width: 100%; position:absolute; top:0px; left:0px; font-family: arial; font-size: 11px; color: #a00; padding: 2px 5px 3px; }
		.jb-codemirror-escCss:hover { text-decoration: underline; }
		.jb-codemirror-fullScreenBtnCss { position:absolute; bottom:5px; right:15px; -webkit-transition: opacity 1s; z-index: 20; }
		.jb-codemirror-fullScreenBtnCss.hidden { opacity:0; }
		.jb-codemirror-editorCss { position:relative; }
		.jb-codemirror-fullScreenEditorCss { padding-top: 20px, display: block; position: fixed !important; top: 0; left: 0; z-index: 99999999; }
	`;
	if (!jb.ui.find(document,'#jb_codemirror_fullscreen')[0])
    	jb.ui.addHTML(document.head,`<style id="jb_codemirror_fullscreen" type="text/css">${css}</style>`)

	const jEditorElem = editor.getWrapperElement()
  	jb.ui.addClass(jEditorElem,'jb-codemirror-editorCss')
	const prevLineNumbers = editor.getOption('lineNumbers')
  	jb.ui.addHTML(jEditorElem,fullScreenBtnHtml)
	const fullScreenButton =jb.ui.find(jEditorElem,'.jb-codemirror-fullScreenBtnCss')[0]
	fullScreenButton.onclick = _ => switchMode()
	fullScreenButton.onmouseenter = _ => jb.ui.removeClass(fullScreenButton,'hidden')
	fullScreenButton.onmouseleave = _ => jb.ui.addClass(fullScreenButton,'hidden')

	const fullScreenClass = 'jb-codemirror-fullScreenEditorCss'

	function onresize() {
		const wrapper = editor.getWrapperElement()
		wrapper.style.width = window.innerWidth + 'px'
		wrapper.style.height = window.innerHeight + 'px'
		editor.setSize(window.innerWidth, window.innerHeight - 20)
		jEditorElem.style.height = document.body.innerHeight + 'px' //Math.max( document.body.innerHeight, $(window).height()) + 'px' );
	}

	function switchMode(onlyBackToNormal) {
		cmp.innerElemOffset = null
		if (jb.ui.hasClass(jEditorElem,fullScreenClass)) {
			jb.ui.removeClass(jEditorElem,fullScreenClass)
			window.removeEventListener('resize', onresize)
			editor.setOption('lineNumbers', prevLineNumbers)
			editor.setSize(width, height)
			editor.refresh()
			jEditorElem.removeChild(jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0])
			jEditorElem.style.width = null
		} else if (!onlyBackToNormal) {
			jb.ui.addClass(jEditorElem,fullScreenClass)
			window.addEventListener('resize', onresize)
			onresize()
			document.documentElement.style.overflow = 'hidden'
			if (lineNumbers) editor.setOption('lineNumbers', true)
			editor.refresh()
			jb.ui.addHTML(jEditorElem,escText)
      		jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0].onclick = _ => switchMode(true)
			jb.ui.focus(editor,'code mirror',ctx)
		}
	}

	editor.addKeyMap({
		'F11': () => switchMode(),
		'Esc': () => switchMode(true)
	})
}

jb.component('text.codemirror', {
  type: 'text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
	{id: 'height', as: 'number'},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'},
	{id: 'lineNumbers', as: 'boolean', type: 'boolean'},
	{id: 'formatText', as: 'boolean', type: 'boolean'},
    {id: 'mode', as: 'string', options: 'htmlmixed,javascript,css'},
  ],
  impl: features(
	frontEnd.var('text', '%$$model/text()%'),
    () => ({ template: ({},{},h) => h('div') }),
	frontEnd.var('cm_settings', ({},{},{cm_settings,lineWrapping, mode, lineNumbers}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly: true, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
	frontEnd.var('formatText', '%$formatText%'),
    frontEnd.init( (ctx,vars) => injectCodeMirror(ctx,vars)),
//	frontEnd.onRefresh((ctx,vars) => { injectCodeMirror(ctx,vars); vars.cmp.editor.setValue(vars.text) }),	
    css(({},{},{height}) => `{width: 100%}
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

})();

var { tableTree, tree } = jb.ns('tableTree,tree')

jb.component('tableTree', {
  type: 'control',
  params: [
    {id: 'title', as: 'string'},
    {id: 'treeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'leafFields', type: 'control[]', dynamic: true},
    {id: 'commonFields', type: 'control[]', dynamic: true, as: 'array'},
    {id: 'chapterHeadline', type: 'control', dynamic: true, defaultValue: text(''), description: '$collapsed as parameter'},
    {id: 'style', type: 'table-tree.style', defaultValue: tableTree.plain({}), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.modelFilter', {
  type: 'tree.node-model',
  description: 'filters a model by path filter predicate',
  params: [
    {id: 'model', type: 'tree.node-model', mandatory: true},
    {id: 'pathFilter', type: 'boolean', dynamic: true, mandatory: true, description: 'input is path. e.g a~b~c'}
  ],
  impl: (ctx, model, pathFilter) => Object.assign(Object.create(model), {
        children: path => model.children(path).filter(childPath => pathFilter(ctx.setData(childPath)))
    })
})

jb.component('tableTree.init', {
  type: 'feature',
  impl: features(
		calcProp('model','%$$model/treeModel()%'),
		method('flip', runActions(
      ({},{$state,ev}) => {
        $state.expanded = $state.expanded || {}
        $state.expanded[ev.path] = !$state.expanded[ev.path]
      },
			action.refreshCmp('%$$state%')
    )),
    calcProp('expanded', ({},{$state,$props}) => ({ ...$state.expanded, ...$props.expanded, [$props.model.rootPath]: true })),
    //     ...(!$state.refresh && {[$props.model.rootPath]: true})
    // })),
    frontEnd.prop('elemToPath',() => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.jb-item') && jb.ui.closest(el,'.jb-item').getAttribute('path'))),
		frontEnd.enrichUserEvent(({},{cmp,ev}) => ({ path: cmp.elemToPath(ev.target)})),
    calcProp({
        id: 'itemsCtxs',
        value: (ctx,{$props,$model}) => {
            const ctxOfItem = (item,index) => ctx.setData({path: item.path, val: $props.model.val(item.path)}).setVars({index, item})

            const rootPath = $props.model.rootPath, expanded = $props.expanded, model = $props.model
            const items = $model.includeRoot ? calcItems(rootPath, 0) : calcItems(rootPath, -1).filter(x=>x.depth > -1)
            const itemsCtxs = items.map((item,i) => ctxOfItem(item,i))
            itemsCtxs.forEach(iCtx => jb.ui.preserveCtx(iCtx))
            return itemsCtxs

            function calcItems(top, depth) {
                const item = [{path: top, depth, val: model.val(top), expanded: expanded[top]}]
                if (expanded[top])
                    return model.children(top).reduce((acc,child) =>
                        depth >= model.maxDepth ? acc : acc = acc.concat(calcItems(child, depth+1)),item)
                return item
            }
        }
    }),
    calcProp('maxDepth',firstSucceeding('%$$model/maxDepth%',5)),
    calcProp('headerFields',list('%$$model/leafFields()/field()%','%$$model/commonFields()/field()%')),
    calcProp('ctrlsMatrix', (ctx,{$model,$props}) => {
        const model = $props.model, maxDepth = $props.maxDepth
        const maxDepthAr = Array.from(new Array(maxDepth))
        const expandingFields = path => {
              const depthOfItem = (path.match(/~/g) || []).length - (model.rootPath.match(/~/g) || []).length - 1
                // return tds until depth and then the '>' sign, and then the headline
              return maxDepthAr.filter((e,i) => i < depthOfItem+3)
                    .map((e,i) => {
                        if (i < depthOfItem || i == depthOfItem && !model.isArray(path))
                            return { empty: true }
                        if (i == depthOfItem) return {
                            expanded: $props.expanded[path],
                            toggle: true
                        }
                        if (i == depthOfItem+1) return {
                            headline: true,
                            colSpan: maxDepth-i+1
                        }
                        if (i == depthOfItem+2) return {
                            resizer: true
                        }                        
                        debugger
                    }
               )
        }
        return $props.itemsCtxs.map(iCtx => ({
            headlineCtrl: $model.chapterHeadline(iCtx),
            expandingFields: expandingFields(iCtx.data.path),
            ctrls: [
              ...($props.model.isArray(iCtx.data.path) ? [] : $model.leafFields(iCtx) ), 
              ...$model.commonFields(iCtx)
            ]
        }))
    })
  )
})

jb.component('tableTree.expandFirstLevel', {
	type: 'feature',
	impl: calcProp({phase: 5, id: 'before calcProps', value: ({},{$state,$props}) => {
      if ($state.refresh) return
      const pathsAsObj = jb.objFromEntries($props.model.children($props.model.rootPath) || []).map(path=>[path,true])
      $props.expanded = Object.assign($props.expanded || {}, pathsAsObj)
    }}) 
})

jb.component('tableTree.plain', {
  type: 'table-tree.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'gapWidth', as: 'number', defaultValue: 30},
    {id: 'expColWidth', as: 'number', defaultValue: 16},
    {id: 'noItemsCtrl', type: 'control', dynamic: true, defaultValue: text('no items')}
  ],
  impl: customStyle({
    template: (cmp,{headerFields, ctrlsMatrix, itemsCtxs, expanded, maxDepth, hideHeaders, gapWidth, expColWidth, noItemsCtrl},h) => h('table',{},[
        ...Array.from(new Array(maxDepth)).map(()=>h('col',{width: expColWidth + 'px'})),
        h('col.gapCol',{width: gapWidth + 'px'}),
        h('col.resizerCol',{width: '5px'}),
        ...headerFields.map(f=>h('col',{width: f.width || '200px'})),
        ...(hideHeaders ? [] : [ h('thead',{},h('tr',{},
          [ ...Array.from(new Array(maxDepth+2)).map(f=>h('th.th-expand-collapse',{})),
            ...headerFields.map(f=>h('th',{'jb-ctx': f.ctxId}, jb.ui.fieldTitle(cmp,f,h)))
          ]
        ))]),
        h('tbody.jb-items-parent',{},
          itemsCtxs.map((iCtx,index)=> h('tr.jb-item', {path: iCtx.data.path, expanded: expanded[iCtx.data.path] },
            [...ctrlsMatrix[index].expandingFields.map(f=>h('td.drag-handle',
                f.empty ? { class: 'empty-expand-collapse'} :
                f.resizer ? {class: 'tt-resizer' } : 
                f.toggle ? {class: 'expandbox' } : {class: 'headline', colSpan: f.colSpan, onclick: 'flip' },
              (f.empty || f.resizer) ? '' :
              f.toggle ? h('span',{}, h('i',{class:'material-icons noselect', onclick: 'flip' },
                f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right')) : h(ctrlsMatrix[index].headlineCtrl)
              )),
              ...ctrlsMatrix[index].ctrls.map(ctrl=>h('td.tree-field', {'jb-ctx': iCtx.id}, h(ctrl,{index})))
            ]
        ))),
        itemsCtxs.length == 0 ? h(noItemsCtrl()) : ''
      ]),
    css: `{border-spacing: 0; text-align: left;width: 100%; table-layout:fixed;}
      >tbody>tr>td { vertical-align: bottom; height: 30px; }
      >tbody>tr>td>span { font-size:16px; cursor: pointer; border: 1px solid transparent }
      >tbody>tr>td>span>i { font-size: 16px; vertical-align: middle;}
      `,
    features: tableTree.init()
  })
})

jb.component('tableTree.expandPath', {
  type: 'feature',
  params: [
	  {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
  ],
  impl: tree.expandPath('%$paths%')
})

jb.component('tableTree.resizer', {
  type: 'feature',
  impl: features(
    css('>tbody>tr>td.tt-resizer { cursor: col-resize }'),
	  frontEnd.method('setSize', ({data},{el}) => el.querySelector('.gapCol').width = data + 'px'),
    frontEnd.flow(
      source.frontEndEvent('mousedown'),
      rx.filter(ctx => jb.ui.hasClass(ctx.data.target,'tt-resizer')),
      rx.var('offset',({data},{el}) => data.clientX - (+el.querySelector('.gapCol').width.slice(0,-2))),
      rx.flatMap(rx.pipe(
        source.frontEndEvent('mousemove'), 
        rx.takeWhile('%buttons%!=0'),
        rx.map(({data},{offset}) => Math.max(0, data.clientX - offset)),
      )),
      sink.FEMethod('setSize')
    )
  )
})

jb.component('tableTree.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.onRefresh( (ctx,{cmp}) => cmp.drake.containers = jb.ui.find(cmp.base,'.jb-items-parent')),
    method('moveItem', (ctx,{$props}) => $props.model.move(ctx.data.from,ctx.data.to,ctx)),
		frontEnd.init( (ctx,{cmp}) => {
        const drake = cmp.drake = dragula([], {
          moves: (el, source, handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle')) && (el.getAttribute('path') || '').match(/[0-9]$/)
        })
        drake.containers = jb.ui.find(cmp.base,'.jb-items-parent')
        drake.on('drag', function(el, source) {
          const path = cmp.elemToPath(el)
          el.dragged = { path, expanded: cmp.state.expanded[path]}
          delete cmp.state.expanded[path]; // collapse when dragging
        })

        drake.on('drop', (dropElm, target, source,_targetSibling) => {
          if (!dropElm.dragged) return;
          dropElm.parentNode.removeChild(dropElm);
          cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded // restore expanded state
          const targetSibling = _targetSibling
          let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
          // strange dragule behavior fix
          const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
          const targetIndex = Number(targetPath.split('~').pop()) || 0;
          if (target === source && targetIndex > draggedIndex)
            targetPath = addToIndex(targetPath,-1)
          const from = dropElm.dragged.path
          const sameParent = dropElm.dragged.path.split('~').slice(0,-1).join('~') == targetPath.split('~').slice(0,-1).join('~')
          dropElm.dragged = null;
          if (sameParent)
            ctx.run(action.runBEMethod('moveItem',() => ({from, to: targetPath})))
        })
    }))
})

;

var { textEditor} = jb.ns('textEditor');

jb.extension('textEditor', {
    getSinglePathChange(diff, currentVal) {
        return pathAndValueOfSingleChange(diff,'',currentVal)
    
        function pathAndValueOfSingleChange(obj, pathSoFar, currentVal) {
            if (currentVal === undefined || (typeof obj !== 'object' && obj !== undefined))
                return { innerPath: pathSoFar, innerValue: obj }
            const entries = jb.entries(obj)
            if (entries.length != 1) // if not single returns empty answer
                return {}
            return pathAndValueOfSingleChange(entries[0][1],pathSoFar+'~'+entries[0][0],currentVal[entries[0][0]])
        }
    },
    setStrValue(value, ref, ctx) {
        const notPrimitive = value.match(/^\s*[a-zA-Z0-9\._]*\(/) || value.match(/^\s*(\(|{|\[)/) || value.match(/^\s*ctx\s*=>/) || value.match(/^function/);
        const newVal = notPrimitive ? jb.utils.eval(value,ref.handler.frame()) : value;
        if (newVal === Symbol.for('parseError'))
            return
        // I had a guess that ',' at the end of line means editing, YET, THIS GUESS DID NOT WORK WELL ...
        // if (typeof newVal === 'object' && value.match(/,\s*}/m))
        //     return
        const currentVal = jb.val(ref)
        if (newVal && typeof newVal === 'object' && typeof currentVal === 'object') {
            const diff = jb.utils.objectDiff(newVal,currentVal)
            if (Object.keys(diff).length == 0) return // no diffs
            const {innerPath, innerValue} = jb.textEditor.getSinglePathChange(diff,currentVal) // one diff
            if (innerPath) {
                const fullInnerPath = ref.handler.pathOfRef(ref).concat(innerPath.slice(1).split('~'))
                return jb.db.writeValue(ref.handler.refOfPath(fullInnerPath),innerValue,ctx)
            }
        }
        if (newVal !== undefined) { // many diffs
            currentVal && currentVal[jb.core.location] && typeof newVal == 'object' && (newVal[jb.core.location] = currentVal[jb.core.location])
            jb.db.writeValue(ref,newVal,ctx)
        }
    },
    lineColToOffset(text,{line,col}) {
        return text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
    },
    offsetToLineCol(text,offset) {
        return { line: (text.slice(0,offset).match(/\n/g) || []).length || 0,
            col: offset - text.slice(0,offset).lastIndexOf('\n') }
    },
    pathOfPosition(ref,_pos) {
        const offset = !Number(_pos) ? jb.textEditor.lineColToOffset(ref.text, _pos) : _pos
        const found = jb.entries(ref.locationMap).find(e=> e[1].offset_from <= offset && offset < e[1].offset_to)
        if (found)
            return {path: found[0], offset: offset - found[1].offset_from}
    },
    enrichMapWithOffsets(text,locationMap) {
        const lines = text.split('\n')
        const accLines = []
        lines.reduce((acc,line) => {
            accLines.push(acc)
            return acc + line.length+1;
        }, 0)
        return Object.keys(locationMap).reduce((acc,k) => Object.assign(acc, {[k] : {
            positions: locationMap[k],
            offset_from: accLines[locationMap[k][0]] + locationMap[k][1],
            offset_to: accLines[locationMap[k][2]] + locationMap[k][3]
        }}), {})
    },
    refreshEditor(cmp,_path) {
        const editor = cmp.editor
        const data_ref = cmp.ctx.vars.$model.databind()
        const text = jb.tostring(data_ref)
        const pathWithOffset = _path ? {path: _path+'~!value',offset:1} : this.pathOfPosition(data_ref, editor.getCursorPos())
        editor.setValue(text)
        if (pathWithOffset) {
            const _pos = data_ref.locationMap[pathWithOffset.path]
            const pos = _pos && _pos.positions
            if (pos)
                editor.setSelectionRange({line: pos[0], col: pos[1] + (pathWithOffset.offset || 0)})
        }
        editor.focus && jb.delay(10).then(()=>editor.focus())
    },
    getSuggestions(fileContent, pos, jbToUse = jb) {
        const lines = fileContent.split('\n')
        const closestComp = lines.slice(0,pos.line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return []
        const componentHeaderIndex = pos.line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        if (!compId) return []
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(componentHeaderIndex+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
          return jb.logError('textEditor - can not find end of component', {compId, linesFromComp})
        const linesOfComp = linesFromComp.slice(0,compLastLine+1)
        const compSrc = linesOfComp.join('\n')
        if (jb.utils.eval(compSrc,jbToUse.frame) === Symbol.for('parseError'))
            return []
        const {text, map} = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        const locationMap = jb.textEditor.enrichMapWithOffsets(text, map)
        const srcForImpl = '{\n'+compSrc.slice((/^  /m.exec(compSrc) || {}).index,-1)
        const cursorOffset = jb.textEditor.lineColToOffset(srcForImpl, {line: pos.line - componentHeaderIndex, col: pos.col})
        const path = pathOfPosition({text, locationMap}, cursorOffset)
        return { path, suggestions: new jbToUse.jbCtx().run(sourceEditor.suggestions(path.path)) }
    },
    getPosOfPath(path,jbToUse = jb) {
        const compId = path.split('~')[0]
        const {map} = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        return map[path]
    },
    getPathOfPos(compId,pos,jbToUse = jb) {
        const { text, map } = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        map.cursor = [pos.line,pos.col,pos.line,pos.col]
        const locationMap = jb.textEditor.enrichMapWithOffsets(text, map)
        const res = pathOfPosition({text, locationMap}, locationMap.cursor.offset_from )
        return res && res.path.split('~!')[0]
    },
    closestComp(fileContent, pos) {
        const lines = fileContent.split('\n')
        const closestComp = lines.slice(0,pos.line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = pos.line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(componentHeaderIndex+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine) {
          jb.logError('textEditor - can not find end of component', { compId, linesFromComp })
          return {}
        }
        const compSrc = linesFromComp.slice(0,compLastLine+1).join('\n')
        return {compId, compSrc, componentHeaderIndex, compLastLine}
    },
    formatComponent(fileContent, pos, jbToUse = jb) {
        const {compId, compSrc, componentHeaderIndex, compLastLine} = jb.textEditor.closestComp(fileContent, pos)
        if (!compId) return {}
        if (jb.utils.eval(compSrc,jbToUse.frame) === Symbol.for('parseError'))
            return []
        return {text: jb.utils.prettyPrintComp(compId,jbToUse.comps[compId],{comps: jbToUse.comps}) + '\n',
            from: {line: componentHeaderIndex, col: 0}, to: {line: componentHeaderIndex+compLastLine+1, col: 0} }
    },
    posFromCM: pos => pos && ({line: pos.line, col: pos.ch}),
    cm_hint(cmEditor) {
        const cursor = cmEditor.getDoc().getCursor()
        return {
            from: cursor, to: cursor,
            list: jb.textEditor.getSuggestions(cmEditor.getValue(),posFromCM(cursor)).suggestions
        }
    }    
})

jb.component('watchableAsText', {
  type: 'data',
  params: [
    {id: 'ref', as: 'ref', dynamic: true},
    {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: (ctx,refF,oneWay) => ({
        oneWay,
        getRef() {
            return this.ref || (this.ref = refF())
        },
        handler: jb.db.simpleValueByRefHandler,
        getVal() {
            return jb.val(this.getRef())
        },
        prettyPrintWithPositions() {
            const ref = this.getRef()
            if (!ref) {
                jb.logError('no ref at watchableAsText',{ctx})
                this.text = ''
                this.locationMap = {}
                return
            }
            const initialPath = ref.handler.pathOfRef(ref).join('~')
            const res = jb.utils.prettyPrintWithPositions(this.getVal() || '',{initialPath, comps: ref.jbToUse && ref.jbToUse.comps})
            this.locationMap = jb.textEditor.enrichMapWithOffsets(res.text, res.map)
            this.text = res.text.replace(/\s*(\]|\})$/,'\n$1')
        },
        writeFullValue(newVal) {
            jb.db.writeValue(this.getRef(),newVal,ctx)
            this.prettyPrintWithPositions()
        },
        $jb_val(value) { try {
            if (value === undefined) {
                this.prettyPrintWithPositions()
                return this.text
            } else {
                jb.textEditor.setStrValue(value,this.getRef(),ctx)
                this.prettyPrintWithPositions() // refreshing location map
            }
        } catch(e) {
            jb.logException(e,'watchable-obj-as-text-ref',{ctx})
        }},

        $jb_observable(cmp) {
            return jb.watchable.refObservable(this.getRef(),{cmp, includeChildren: 'yes'})
        }
    })
})

// jb.component('textEditor.withCursorPath', {
//   type: 'action',
//   params: [
//     {id: 'action', type: 'action', dynamic: true, mandatory: true},
//     {id: 'selector', as: 'string', defaultValue: '#editor'}
//   ],
//   impl: (ctx,action,selector) => {
//         let editor = ctx.vars.editor
//         if (!editor) {
//             const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx);
//             editor = jb.path(elem,'_component.editor')
//         }
//         if (editor && editor.getCursorPos)
//             action(editor.ctx().setVars({
//                 cursorPath: pathOfPosition(editor.data_ref, editor.getCursorPos()).path,
//                 cursorCoord: editor.cursorCoords()
//             }))
//     }
// })

jb.component('textEditor.isDirty', {
  impl: ctx => {
        try {
            return ctx.vars.editor().isDirty()
        } catch (e) {}
    }
})

// jb.component('text-editor.watch-source-changes', { /* textEditor.watchSourceChanges */
//   type: 'feature',
//   params: [

//   ],
//   impl: ctx => ({ init: cmp => {
//       try {
//         const text_ref = cmp.state.databindRef
//         const data_ref = text_ref.getRef()
//         jb.db.isWatchable(data_ref) && jb.watchable.refObservable(data_ref,{cmp,srcCtx: cmp.ctx, includeChildren: 'yes'})
//             .subscribe(e => {
//             const path = e.path
//             const editor = cmp.editor
//             const locations = cmp.state.databindRef.locationMap
//             const loc = locations[path.concat('!value').join('~')]
//             const newVal = jb.utils.prettyPrint(e.newVal)
//             editor.replaceRange(newVal, {line: loc[0], col:loc[1]}, {line: loc[2], col: loc[3]})
//             const newEndPos = jb.utils.advanceLineCol({line: loc[0], col:loc[1]}, newVal)
//             editor.markText({line: loc[0], col:loc[1]}, {line: newEndPos.line, col: newEndPos.col},{
//                 className: 'jb-highlight-comp-changed'
//             })
//             })
//         } catch (e) {}
//     }})
// })

jb.component('textEditor.cursorPath', {
    params: [
        {id: 'watchableAsText', as: 'ref', mandatory: true, description: 'the same that was used for databind'},
        {id: 'cursorPos', dynamic: true, defaultValue: '%$ev/selectionStart%'},
    ],  
    impl: (ctx,ref,pos) => jb.path(pathOfPosition(ref, pos()),'path') || ''
})

jb.component('textarea.initTextareaEditor', {
  type: 'feature',
  impl: features(
      textEditor.enrichUserEvent(),
      frontEnd.method('replaceRange',({data},{cmp}) => {
          const {text, from, to} = data
          const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
          const _to = jb.textEditor.lineColToOffset(cmp.base.value,to)
          cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
      }),
      frontEnd.method('setSelectionRange',({data},{cmp}) => {
        const from = data.from || data
        const to = data.to || from
        const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
        const _to = to && jb.textEditor.lineColToOffset(cmp.base.value,to) || _from
        cmp.base.setSelectionRange(_from,_to)
      })
    )
})

jb.component('textEditor.enrichUserEvent', {
    type: 'feature',
    params: [
      {id: 'textEditorSelector', as: 'string', description: 'used for external buttons'}
    ],
    impl: features(
		frontEnd.var('textEditorSelector','%$textEditorSelector%'),
        frontEnd.enrichUserEvent((ctx,{cmp,textEditorSelector}) => {
            const elem = textEditorSelector ? jb.ui.widgetBody(ctx).querySelector(textEditorSelector) : cmp.base
            return elem && {
                outerHeight: jb.ui.outerHeight(elem), 
                outerWidth: jb.ui.outerWidth(elem), 
                clientRect: elem.getBoundingClientRect(),
                text: elem.value,
                selectionStart: offsetToLineCol(elem.value,elem.selectionStart)
            }
        })
    )
})
  

//   frontEnd.init((ctx,{cmp}) => {
//         const data_ref = ctx.vars.$model.databind()
//         jb.val(data_ref) // calc text
//         cmp.editor = {
//             ctx: () => cmp.ctx,
//             data_ref,
//             getCursorPos: () => offsetToLineCol(cmp.base.value,cmp.base.selectionStart),
//             cursorCoords: () => {},
//             markText: () => {},
//             replaceRange: (text, from, to) => {
//                 const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
//                 const _to = jb.textEditor.lineColToOffset(cmp.base.value,to)
//                 cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
//             },
//             setSelectionRange: (from, to) => {
//                 const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
//                 const _to = to && jb.textEditor.lineColToOffset(cmp.base.value,to) || _from
//                 cmp.base.setSelectionRange(_from,_to)
//             },
//         }
//         if (cmp.ctx.vars.editorContainer)
//             cmp.ctx.vars.editorContainer.editorCmp = cmp
//     }
//   )
// });

var { studio } = jb.ns('studio');
eval(jb.importAllMacros());

jb.extension('studio', {
	initExtension() {
		return {
			compsHistory: [],
			scriptChange: jb.callbag.subject(),
		}
   },
  compsRefOfjbm(jbm, {historyWin, compsRefId} = {historyWin: 5, compsRefId: 'comps'}) {
	function compsRef(val,opEvent,{source}= {}) {
		if (typeof val == 'undefined')
			return jbm.comps
		else {
			if (historyWin) updateHistory(val,opEvent,source)
			jbm.comps = val
		}
	}
	compsRef.id = compsRefId
	return compsRef

	function updateHistory(val, opEvent, source) {
		const history = jb.studio.compsHistory
		val.$jb_selectionPreview = opEvent && opEvent.srcCtx && opEvent.srcCtx.vars.selectionPreview
		if (!val.$jb_selectionPreview && source != 'probe') {
			history.push({before: jbm.comps, after: val, opEvent: opEvent, undoIndex: jb.studio.undoIndex})
			if (history.length > historyWin)
			jb.studio.compsHistory = history.slice(-1*historyWin)
		}
		if (opEvent)
			jb.studio.undoIndex = history.length
	}
  },
  scriptChangeHandler(e) {
	jb.log('watchable studio script changed',{ctx: e.srcCtx,e})
	jb.studio.scriptChange.next(e)
	writeValueToDataResource(e.path,e.newVal)
	if (jb.studio.isStudioCmp(e.path[0]))
		jb.studio.refreshStudioComponent(e.path)
	jb.studio.lastStudioActivity = new Date().getTime()
	e.srcCtx.run(writeValue('%$studio/lastStudioActivity%',() => jb.studio.lastStudioActivity))

	jb.studio.highlightByScriptPath && jb.studio.highlightByScriptPath(e.path)

	function writeValueToDataResource(path,value) {
		if (path.length > 1 && ['watchableData','passiveData'].indexOf(path[1]) != -1) {
			const resource = jb.db.removeDataResourcePrefix(path[0])
			const dataPath = '%$' + [resource, ...path.slice(2)].map(x=>isNaN(+x) ? x : `[${x}]`).join('/') + '%'
			return jb.studio.previewjb.exec(writeValue(dataPath,_=>value))
		}
	}		
  },

  initLocalCompsRefHandler(compsRef,{ compIdAsReferred, initUIObserver } = {}) {
	if (jb.studio.compsRefHandler) return
    jb.studio.compsRefHandler = new jb.watchable.WatchableValueByRef(compsRef)
	jb.db.addWatchableHandler(jb.studio.compsRefHandler)
	initUIObserver && jb.ui.subscribeToRefChange(compsRef)
    compIdAsReferred && jb.studio.compsRefHandler.makeWatchable(compIdAsReferred)
	jb.callbag.subscribe(e=>jb.studio.scriptChangeHandler(e))(jb.studio.compsRefHandler.resourceChange)
  },
  
  initReplaceableCompsRefHandler(compsRef, {allowedTypes}) {
  	// CompsRefHandler may need to be replaced when reloading the preview iframe
 	const {pipe,subscribe,takeUntil} = jb.callbag
	const oldHandler = jb.studio.compsRefHandler
	jb.db.removeWatchableHandler(oldHandler)	
	oldHandler && oldHandler.stopListening.next(1)
	jb.studio.compsRefHandler = new jb.watchable.WatchableValueByRef(compsRef)
	jb.db.addWatchableHandler(jb.studio.compsRefHandler)
	jb.ui.subscribeToRefChange(jb.studio.compsRefHandler)
	jb.studio.compsRefHandler.allowedTypes = jb.studio.compsRefHandler.allowedTypes.concat(allowedTypes)
	jb.studio.compsRefHandler.stopListening = jb.callbag.subject()

	pipe(jb.studio.compsRefHandler.resourceChange,
		takeUntil(jb.studio.compsRefHandler.stopListening),
		subscribe(e=>jb.studio.scriptChangeHandler(e))
	)
  },

  // adaptors
  val: v => jb.studio.compsRefHandler.val(v),
  writeValue: (ref,value,ctx) => jb.studio.compsRefHandler.writeValue(ref,value,ctx),
  objectProperty: (obj,prop) => jb.studio.compsRefHandler.objectProperty(obj,prop),
  splice: (ref,args,ctx) => jb.studio.compsRefHandler.splice(ref,args,ctx),
  push: (ref,value,ctx) => jb.studio.compsRefHandler.push(ref,value,ctx),
  merge: (ref,value,ctx) => jb.studio.compsRefHandler.merge(ref,value,ctx),
  isRef: ref => jb.studio.compsRefHandler.isRef(ref),
  asRef: obj => jb.studio.compsRefHandler.asRef(obj),
  //refreshRef: ref => jb.studio.compsRefHandler.refresh(ref),
  refOfPath: (path,silent) => {
		const _path = path.split('~')
		jb.studio.compsRefHandler.makeWatchable && jb.studio.compsRefHandler.makeWatchable(_path[0])
		const ref = jb.studio.compsRefHandler.refOfPath(_path,silent)
		if (!ref) return
		ref.jbToUse = jb.studio.previewjb
		return ref
  },
  parentPath: path => path.split('~').slice(0,-1).join('~'),
  parents: path => path.split('~').reduce((acc,last,i) => acc.concat(i ? [acc[acc.length-1],last].join('~') : last),[]).reverse(),
  valOfPath: path => jb.path(jb.studio.previewjb.comps,path.split('~')),
  compNameOfPath: (path,silent) => {
    if (path.indexOf('~') == -1)
      return 'jbComponent'
    if (path.match(/~\$vars$/)) return
    const prof = jb.studio.valOfPath(path,silent)
  	return jb.utils.compName(prof) || jb.utils.compName(prof,jb.studio.paramDef(path))
  },
  paramDef: path => {
	if (!jb.studio.parentPath(path)) // no param def for root
		return;
	if (!isNaN(Number(path.split('~').pop()))) // array elements
		path = jb.studio.parentPath(path);
	// const parent_prof = jb.studio.valOfPath(jb.studio.parentPath(path),true);
	// const comp = parent_prof && jb.studio.getComp(jb.utils.compName(parent_prof));
	const comp = jb.studio.compOfPath(jb.studio.parentPath(path),true);
	const params = jb.utils.compParams(comp);
	const paramName = path.split('~').pop();
	if (paramName.indexOf('$') == 0) // sugar
		return params[0];
	return params.filter(p=>p.id==paramName)[0];
  },
  compOfPath: (path,silent) => jb.studio.getComp(jb.studio.compNameOfPath(path,silent)),
  paramsOfPath: (path,silent) => jb.utils.compParams(jb.studio.compOfPath(path,silent)),
  writeValueOfPath: (path,value,ctx) => jb.studio.writeValue(jb.studio.refOfPath(path),value,ctx),
  getComp: id => jb.studio.previewjb.comps[id],
  compAsStr: id => jb.utils.prettyPrintComp(id,jb.studio.getComp(id),{comps: jb.studio.previewjb.comps}),
  isStudioCmp: id => jb.path(jb.comps,[id,jb.core.project]) == 'studio'
})

// write operations with logic

jb.extension('studio', {
	_delete(path,srcCtx) {
		if (path.match(/\$vars~[0-9]+~val$/) && !jb.studio.valOfPath(path)) // delete empty variable if deleting the value
			path = jb.studio.parentPath(path)
		const prop = path.split('~').pop()
		const parent = jb.studio.valOfPath(jb.studio.parentPath(path))
		if (Array.isArray(parent)) {
			const index = Number(prop)
			jb.studio.splice(jb.studio.refOfPath(jb.studio.parentPath(path)),[[index, 1]],srcCtx)
		} else {
			jb.studio.writeValueOfPath(path,undefined,srcCtx)
		}
	},
	wrapWithGroup: (path,srcCtx) => jb.studio.writeValueOfPath(path,{ $: 'group', controls: [ jb.studio.valOfPath(path) ] },srcCtx),
	wrap(path,compName,srcCtx) {
		const comp = jb.studio.getComp(compName)
		const compositeParam = jb.utils.compParams(comp).filter(p=>p.composite)[0]
		if (compositeParam) {
			const singleOrArray = compositeParam.type.indexOf('[') == -1 ? jb.studio.valOfPath(path) : [jb.studio.valOfPath(path)]
			const result = { $: compName, [compositeParam.id]: singleOrArray}
			jb.studio.writeValueOfPath(path,result,srcCtx)
		}
	},
	addProperty(path,srcCtx) {
		// if (jb.studio.paramTypeOfPath(path) == 'data')
		// 	return jb.studio.writeValueOfPath(path,'')
		const param = jb.studio.paramDef(path)
		let result = param.defaultValue || {$: ''}
		if (jb.studio.paramTypeOfPath(path).indexOf('data') != -1)
			result = ''
		if ((param.type ||'').indexOf('[') != -1)
			result = []
		jb.studio.writeValueOfPath(path,result,srcCtx)
	},
	clone(profile) {
		if (typeof profile !== 'object') return profile
		return jb.studio.evalProfile(jb.utils.prettyPrint(profile,{noMacros: true}))
	},
	duplicateControl(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = jb.studio.valOfPath(path)
		const parent_ref = jb.studio.getOrCreateControlArrayRef(jb.studio.parentPath(jb.studio.parentPath(path)))
		if (parent_ref)
			jb.studio.splice(parent_ref,[[Number(prop), 0,jb.studio.clone(val)]],srcCtx)
	},
	duplicateArrayItem(path,srcCtx) {
		const prop = path.split('~').pop()
		const val = jb.studio.valOfPath(path)
		const parent_ref = jb.studio.refOfPath(jb.studio.parentPath(path))
		if (parent_ref && Array.isArray(jb.studio.val(parent_ref)))
			jb.studio.splice(parent_ref,[[Number(prop), 0,jb.studio.clone(val)]],srcCtx)
	},
	disabled(path) {
		const prof = jb.studio.valOfPath(path)
		return prof && typeof prof == 'object' && prof.$disabled
	},
	toggleDisabled(path,srcCtx) {
		const prof = jb.studio.valOfPath(path)
		if (prof && typeof prof == 'object' && !Array.isArray(prof))
			jb.studio.writeValue(jb.studio.refOfPath(path+'~$disabled'),prof.$disabled ? null : true,srcCtx)
	},
	newProfile(comp,compName) {
		const result = { $: compName }
		jb.utils.compParams(comp).forEach(p=>{
			if (p.composite)
				result[p.id] = []
			if (p.templateValue)
				result[p.id] = JSON.parse(JSON.stringify(p.templateValue))
		})
		return result
	},
	setComp(path,compName,srcCtx) {
		const comp = compName && jb.studio.getComp(compName)
		if (!compName || !comp) return
		const params = jb.utils.compParams(comp)

		const result = jb.studio.newProfile(comp,compName)
		const currentVal = jb.studio.valOfPath(path)
		params.forEach(p=>{
			if (currentVal && currentVal[p.id] !== undefined)
				result[p.id] = currentVal[p.id]
		})
		jb.studio.writeValue(jb.studio.refOfPath(path),result,srcCtx)
	},

	insertControl(path,compToInsert,srcCtx) {
		let newCtrl = compToInsert
		if (typeof compToInsert == 'string') {
			const comp = compToInsert && jb.studio.getComp(compToInsert)
			if (!compToInsert || !comp) return
			newCtrl = jb.studio.newProfile(comp,compToInsert)
		}

		// find group parent that can insert the control
		if (path.indexOf('~') == -1)
			path = path + '~impl'
		let group_path = path
		while (jb.studio.controlParams(group_path).length == 0 && group_path)
			group_path = jb.studio.parentPath(group_path)
		const group_ref = jb.studio.getOrCreateControlArrayRef(group_path,srcCtx)
		if (group_path == jb.studio.parentPath(jb.studio.parentPath(path)))
			jb.studio.splice(group_ref,[[Number(path.split('~').pop())+1, 0,newCtrl]],srcCtx)
		else if (group_ref)
			jb.studio.push(group_ref,[newCtrl],srcCtx)
	},
    // if drop destination is not an array item, fix it
   	moveFixDestination(from,to,srcCtx) {
		if (isNaN(Number(to.split('~').slice(-1)))) {
            if (jb.studio.valOfPath(to) === undefined)
				jb.db.writeValue(jb.studio.refOfPath(to),[],srcCtx)
			if (!Array.isArray(jb.studio.valOfPath(to)))
				jb.db.writeValue(jb.studio.refOfPath(to),[jb.studio.valOfPath(to)],srcCtx)

            to += '~' + jb.studio.valOfPath(to).length
		}
		return jb.db.move(jb.studio.refOfPath(from),jb.studio.refOfPath(to),srcCtx)
	},

	addArrayItem(path,{toAdd,srcCtx, index} = {}) {
		const val = jb.studio.valOfPath(path)
		toAdd = toAdd === undefined ? {$:''} : toAdd
		if (Array.isArray(val)) {
			if (index === undefined)
				jb.studio.push(jb.studio.refOfPath(path),[toAdd],srcCtx)
			else
				jb.studio.splice(jb.studio.refOfPath(path),[[val.length,0,toAdd]],srcCtx)
		}
		else if (!val) {
			jb.studio.writeValueOfPath(path,toAdd,srcCtx)
		} else {
			jb.studio.writeValueOfPath(path,[val].concat(toAdd),srcCtx)
		}
	},

	wrapWithArray(path,srcCtx) {
		const val = jb.studio.valOfPath(path)
		if (val && !Array.isArray(val))
			jb.studio.writeValueOfPath(path,[val],srcCtx)
	},

	getOrCreateControlArrayRef(path,srcCtx) {
		const val = jb.studio.valOfPath(path)
		const prop = jb.studio.controlParams(path)[0]
		if (!prop)
			return jb.logError('getOrCreateControlArrayRef: no control param',{path,srcCtx})
		let ref = jb.studio.refOfPath(path+'~'+prop)
		if (val[prop] === undefined)
			jb.db.writeValue(ref,[],srcCtx)
		else if (!Array.isArray(val[prop])) // wrap
			jb.db.writeValue(ref,[val[prop]],srcCtx)
		ref = jb.studio.refOfPath(path+'~'+prop)
		return ref
	},

	evalProfile(prof_str) {
		try {
			return (jb.studio.previewWindow || window).eval('('+prof_str+')')
		} catch (e) {
			jb.logException(e,'eval profile',{prof_str})
		}
	},

  	pathOfRef: ref => ref && ref.path().join('~'),
	nameOfRef: ref => ref.path().slice(-1)[0].split(':')[0],
	valSummaryOfRef: ref => jb.studio.valSummary(jb.val(ref)),
	valSummary: val => {
		if (val && typeof val == 'object')
			return val.id || val.name
		return '' + val
	},
	pathSummary: path => path.replace(/~controls~/g,'~').replace(/~impl~/g,'~').replace(/^[^\.]*./,''),
	isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
})

// ******* components ***************

jb.component('studio.ref', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jb.studio.refOfPath(path)
})

jb.component('studio.pathOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => jb.studio.pathOfRef(ref)
})

jb.component('studio.nameOfRef', {
  params: [
    {id: 'ref', defaultValue: '%%', mandatory: true}
  ],
  impl: (ctx,ref) => jb.studio.nameOfRef(ref)
})

jb.component('studio.scriptChange', {
	type: 'rx',
	impl: source.callbag(() => jb.studio.scriptChange)
})

jb.component('studio.boolRef', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => ({
        $jb_val(value) {
            if (value === undefined)
                return jb.toboolean(jb.studio.refOfPath(path))
            else
				jb.db.writeValue(jb.studio.refOfPath(path),!!value,ctx)
        }
	})
})

jb.component('studio.getOrCreateCompInArray', {
	type: 'data',
	params: [
		{id: 'path', as: 'string', mandatory: true},
		{id: 'compName', as: 'string', mandatory: true}
	],
	impl: (ctx,path,compName) => {
		let arrayRef = jb.studio.refOfPath(path)
		let arrayVal = jb.val(arrayRef)
		if (!arrayVal) {
		  jb.db.writeValue(arrayRef,{$: compName},ctx)
		  return path
		} else if (!Array.isArray(arrayVal) && arrayVal.$ == compName) {
		  return path
		} else {
		  if (!Array.isArray(arrayVal)) { // If a different comp, wrap with array
			jb.db.writeValue(arrayRef,[arrayVal],ctx)
			arrayRef = jb.studio.refOfPath(path)
			arrayVal = jb.val(arrayRef)
		  }
		  const existingFeature = arrayVal.findIndex(f=>f.$ == compName)
		  if (existingFeature != -1) {
			return `${path}~${existingFeature}`
		  } else {
			const length = arrayVal.length
			jb.push(arrayRef,{$: compName},ctx)
			return `${path}~${length}`
		  }
		}
	}
})

jb.component('studio.initLocalCompsRefHandler', {
  type: 'action',
  params: [
    {id: 'compIdAsReferred', as: 'string', description: 'comp to make watchable' },
    {id: 'initUIObserver', as: 'boolean', description: 'enable watchRef on comps' },
    {id: 'compsRefId', as: 'string', defaultValue: 'comps'},
  ],
  impl: ({}, compIdAsReferred,initUIObserver,compsRefId) =>
	jb.studio.initLocalCompsRefHandler(jb.studio.compsRefOfjbm(jb, {historyWin: 5, compsRefId }), {compIdAsReferred, initUIObserver} )
})

jb.component('jbm.vDebugger', {
    type: 'jbm',
    impl: pipe(
        remote.action(runActions(
			studio.initLocalCompsRefHandler(),
			() => jb.studio.previewjb = jb.parent
		), jbm.child('vDebugger')),
        jbm.child('vDebugger')
    )
})
;

var { sourceEditor, textEditor } = jb.ns('sourceEditor');

(function() {
var st = jb.studio;

jb.component('studio.val', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => st.valOfPath(path)
})

jb.component('studio.isPrimitiveValue', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) =>	st.isPrimitiveValue(st.valOfPath(path))
})

jb.component('studio.isOfType', {
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'type', as: 'string', mandatory: true}
  ],
  impl: (ctx,path,_type) =>	st.isOfType(path,_type)
})

jb.component('studio.isArrayType', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) =>	st.isArrayType(path)
})

jb.component('studio.parentPath', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => st.parentPath(path)
})

jb.component('studio.paramType', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) =>	st.paramTypeOfPath(path)
})

jb.component('studio.PTsOfType', {
  params: [
    {id: 'type', as: 'string', mandatory: true}
  ],
  impl: (ctx,_type) => st.PTsOfType(_type)
})

jb.component('studio.profilesOfPT', {
  params: [
    {id: 'PT', as: 'string', mandatory: true}
  ],
  impl: (ctx, pt) => st.profilesOfPT(pt)
})

jb.component('studio.categoriesOfType', {
  params: [
    {id: 'type', as: 'string', mandatory: true},
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,_type,path) => {
		var comps = st.previewjb.comps;
		var pts = st.PTsOfType(_type);
		var categories = jb.utils.unique([].concat.apply([],pts.map(pt=>
			(comps[pt].category||'').split(',').map(c=>c.split(':')[0])
				.concat(pt.indexOf('.') != -1 ? pt.split('.')[0] : [])
				.filter(x=>x).filter(c=>c!='all')
			))).map(c=>({
					code: c,
					pts: ptsOfCategory(c)
				}));
		var res = categories.concat({code: 'all', pts: ptsOfCategory('all') });
		return res;

		function ptsOfCategory(category) {
			var pts_with_marks = pts.filter(pt=>
					category == 'all' || pt.split('.')[0] == category ||
					(comps[pt].category||'').split(',').map(x=>x.split(':')[0]).indexOf(category) != -1)
				.map(pt=>({
					pt: pt,
					mark: (comps[pt].category||'').split(',')
						.filter(c=>c.indexOf(category) == 0)
						.map(c=>Number(c.split(':')[1] || 50))[0]
				}))
				.map(x=> {
					if (x.mark == null)
						x.mark = 50;
					return x;
				})
				.filter(x=>x.mark != 0);
			pts_with_marks.sort((c1,c2)=>c2.mark-c1.mark);
			var out = pts_with_marks.map(pt=>pt.pt);
			return out;
		}
	}
})

jb.component('studio.shortTitle', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.shortTitle(path)
})

jb.component('studio.summary', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.summary(path)
})

jb.component('studio.hasParam', {
  params: [
    {id: 'path', as: 'string'},
    {id: 'param', as: 'string'}
  ],
  impl: (ctx,path,param) =>	st.paramDef(path+'~'+param)
})

jb.component('studio.nonControlChildren', {
  params: [
    {id: 'path', as: 'string'},
    {id: 'includeFeatures', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,path,includeFeatures) =>	st.nonControlChildren(path,includeFeatures)
})

jb.component('studio.asArrayChildren', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.asArrayChildren(path)
})

jb.component('studio.compName', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st.compNameOfPath(path) || ''
})

jb.component('studio.paramDef', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st.paramDef(path)
})

jb.component('studio.enumOptions', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>
		((st.paramDef(path) || {}).options ||'').split(',').map(x=> ({code: x.split(':')[0],text: x.split(':')[0]}))
})

jb.component('studio.propName', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.propName(path)
})

jb.component('studio.moreParams', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.jbEditorMoreParams(path)
})


jb.component('studio.compNameRef', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => ({
			$jb_path: () => path.split('~'),
			$jb_val: function(value) {
				if (typeof value == 'undefined')
					return st.compNameOfPath(path);
				else
					st.setComp(path,value,ctx)
			},
			$jb_observable: cmp =>
				jb.watchable.refObservable(st.refOfPath(path),{cmp, includeChildren: 'yes'})
	})
})

jb.component('studio.profileAsText', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'},
    {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'},
  ],
  impl: watchableAsText(studio.ref('%$path%'),'%$oneWay%')
})

jb.component('studio.profileAsStringByref', {
  type: 'data',
  params: [
    {id: 'path', as: 'string', dynamic: true}
  ],
  impl: ctx => ({
		$jb_path: () => path.split('~'),
		$jb_val: function(value) {
			var path = ctx.params.path();
			if (!path) return '';
			if (typeof value == 'undefined') {
				return st.valOfPath(path) || '';
			} else {
				st.writeValueOfPath(path, value,ctx);
			}
		},
		$jb_observable: cmp =>
			jb.watchable.refObservable(st.refOfPath(ctx.params.path()),{cmp})
	})
})

jb.component('studio.profileValueAsText', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => ({
		$jb_path: () => path.split('~'),
			$jb_val: function(value) {
				if (value == undefined) {
					const val = st.valOfPath(path);
					if (val == null)
						return '';
					if (st.isPrimitiveValue(val))
						return '' + val
					if (st.compNameOfPath(path))
						return '=' + st.compNameOfPath(path)
				}
				else if (value.indexOf('=') != 0)
					st.writeValueOfPath(path, valToWrite(value),ctx);

        function valToWrite(val) {
          const type = (st.paramDef(path) || {}).as
          if (type == 'number' && Number(val)) return +val
          if (type == 'boolean')
            return val === 'true' ? true : val === 'false' ? false : '' + val
          return '' + val
        }
      }
    })
})

jb.component('studio.insertControl', {
  type: 'action',
  params: [
    {id: 'comp', mandatory: true, description: 'comp name or comp json'},
    {id: 'path', as: 'string', defaultValue: studio.currentProfilePath()}
  ],
  impl: (ctx,comp,path) =>	st.insertControl(path, comp,ctx)
})

jb.component('studio.wrap', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'comp', as: 'string'}
  ],
  impl: (ctx,path,comp) => st.wrap(path,comp,ctx)
})

jb.component('studio.wrapWithGroup', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>		st.wrapWithGroup(path,ctx)
})

jb.component('studio.addProperty', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.addProperty(path,ctx)
})

jb.component('studio.duplicateControl', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.duplicateControl(path,ctx)
})

jb.component('studio.duplicateArrayItem', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.duplicateArrayItem(path,ctx)
})

jb.component('studio.newArrayItem', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.addArrayItem(path,{srcCtx: ctx})
})

jb.component('studio.addArrayItem', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'toAdd', as: 'single'},
    {id: 'index', as: 'number', defaultValue: -1}
  ],
  impl: (ctx,path,toAdd,index) =>
    index == -1 ? st.addArrayItem(path, {srcCtx: ctx, toAdd})
      : st.addArrayItem(path, {srcCtx: ctx, toAdd, index})
})

jb.component('studio.wrapWithArray', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path,toAdd) =>
		st.wrapWithArray(path,ctx)
})

jb.component('studio.canWrapWithArray', {
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.paramDef(path) && (st.paramDef(path).type || '').indexOf('[') != -1 && !Array.isArray(st.valOfPath(path))
})

jb.component('studio.isArrayItem', {
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	Array.isArray(st.valOfPath(st.parentPath(path)))
})


jb.component('studio.setComp', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'comp', as: 'single'}
  ],
  impl: (ctx,path,comp) => st.setComp(path, comp,ctx)
})

jb.component('studio.delete', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st._delete(path,ctx)
})

jb.component('studio.disabled', {
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st.disabled(path,ctx)
})

jb.component('studio.toggleDisabled', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st.toggleDisabled(path,ctx)
})

jb.component('studio.jbEditorNodes', {
  type: 'tree.node-model',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	new st.jbEditorTree(path,true)
})

jb.component('studio.iconOfType', {
  type: 'data',
  params: [
    {id: 'type', as: 'string'}
  ],
  impl: (ctx,type) => {
		if (type.match(/.style$/))
			type = 'style';
		return ({
			action: 'play_arrow',
			data: 'data_usage',
			aggregator: 'data_usage',
			control: 'airplay',
			style: 'format_paint',
			feature: 'brush'
		}[type] || 'extension')
	}
})

jb.component('studio.isDisabled', {
  type: 'boolean',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) =>	st.disabled(path)
})

jb.component('studio.disabledSupport', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  type: 'feature',
  impl: css.conditionalClass(
    'jb-disabled',
    studio.isDisabled('%$path%')
  )
})

jb.component('studio.paramsOfPath', {
  type: 'tree.node-model',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => st.paramsOfPath(path)
})

jb.component('studio.macroName', {
  type: 'data',
  params: [
    {id: 'name', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,name) => jb.macroName(name)
})

jb.component('studio.cmpsOfProject', {
  type: 'data',
  impl: () => 
    st.projectCompsAsEntries().filter(e=>e[1].impl).map(e=>e[0]),
  testData: 'sampleData'
})


})();

;

var { chromeDebugger,eventTracker } = jb.ns('chromeDebugger,eventTracker')

Object.assign(jb.ui, {
  getSpy: () => jb.path(jb.parent,'spy') || {}
})

jb.component('studio.openEventTracker', {
  type: 'action',
  impl: openDialog({
    style: dialog.studioFloating({id: 'event-tracker', width: '700', height: '400'}),
    content: studio.eventTracker(),
    title: 'Spy',
    features: dialogFeature.resizer()
  })
})

jb.component('eventTracker.getSpy', {
  impl: () => jb.ui.getSpy()
})

jb.component('eventTracker.codeSize', {
  impl: ()=> jb.parent.codeLoader.totalCodeSize ? Math.floor(jb.parent.codeLoader.totalCodeSize/1000) + 'k' : ''
})

jb.component('eventTracker.clearSpyLog', {
  type: 'action',
  impl: runActions(
    Var('items', eventTracker.eventItems()),
    (ctx, {items}) => {
      const lastGroupIndex = items.length - items.reverse().findIndex(x=>x.index == '---')
      if (lastGroupIndex >= items.length)
        jb.spy.clear(jb.ui.getSpy(ctx))
      else
        jb.ui.getSpy(ctx).logs.splice(0,lastGroupIndex-1)
  })
})

jb.component('eventTracker.toolbar', {
  type: 'control',
  impl: group({
    layout: layout.horizontal('2'),
    controls: [
      text({
        text: eventTracker.codeSize(),
        features: [
          feature.hoverTitle('code size'),
          css('cursor: default'),
          css.padding({top: '5'})
        ]
      }),
      divider({style: divider.vertical()}),
      text({
        title: 'counts',
        text: pipeline(
            Var('logs', pipeline(
              eventTracker.getSpy(),
              '%logs%',
              //filter(eventTracker.isNotDebuggerEvent())
            )),
           '%$events/length%/%$logs/length%'
        ),
        features: [
          variable('events', eventTracker.eventItems('%$eventTracker/eventTrackerQuery%')),
          feature.hoverTitle('filtered events / total'),
          css('cursor: default'),
          css.padding({top: '5', left: '5'})
        ]
      }),
      divider({style: divider.vertical()}),
      button({
        title: 'clear',
        action: runActions(eventTracker.clearSpyLog(), refreshControlById('event-tracker')),
        style: chromeDebugger.icon(),
        features: feature.hoverTitle('clear')
      }),
      button({
        title: 'refresh',
        action: refreshControlById('event-tracker'),
        style: chromeDebugger.icon('165px 264px'),
        features: feature.hoverTitle('refresh')
      }),      
      divider({style: divider.vertical()}),
      editableText({
        title: 'query',
        databind: '%$eventTracker/eventTrackerQuery%',
        style: editableText.input(),
        features: [
          htmlAttribute('placeholder', 'query'),
          feature.onEnter(refreshControlById('event-tracker')),
          css.class('toolbar-input'),
          css.height('10'),
          css.margin('4'),
          css.width('300')
        ]
      }),
      eventTracker.eventTypes()
    ],
    features: [
      chromeDebugger.colors(),
      eventTracker.watchSpy(100)
    ]
  }),
})

jb.component('eventTracker.uiComp', {
  type: 'control',
  impl: controls(
    controlWithCondition(or('%cmp%','%elem%', '%parentElem%'), group({
      controls: [
        controlWithCondition('%cmp/ctx/profile/$%', group({
          controls: [
            editableBoolean({databind: '%$cmpExpanded/{%$index%}%', style: chromeDebugger.toggleStyle()}),
            text('%cmp/ctx/profile/$% %cmp/cmpId%;%cmp/ver%'),
          ],
          layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'})
        })),
        controlWithCondition('%cmp/pt%',text('%cmp/pt% %cmp/cmpId%;%cmp/ver%')),
        controlWithCondition('%$cmpElem%',text('%$cmpElem/@cmp-pt% %$cmpElem/@cmp-id%;%$cmpElem/@cmp-ver%')),
      ],
      features: [
        group.firstSucceeding(),
        variable('cmpElem', ({data}) => jb.ui.closestCmpElem(data.elem || data.parentElem))
      ]
    })),
    controlWithCondition('%$cmpExpanded/{%$index%}%', group({ 
      controls: eventTracker.compInspector('%cmp%'), 
      features: feature.expandToEndOfRow('%$cmpExpanded/{%$index%}%')
    })),
  )
})

jb.component('eventTracker.callbagMessage', {
  type: 'control',
  impl: controls(
    controlWithCondition(and('%m/d%','%m/t%==1'), group({
      controls: [
        editableBoolean({databind: '%$payloadExpanded/{%$index%}%', style: chromeDebugger.toggleStyle()}),
        text('%$contentType% %$direction% %m/cbId% (%$payload/length%) %m/$%: %m/t%'),
      ],
      layout: layout.flex({justifyContent: 'start', direction: 'row', alignItems: 'center'}),
      features: [
        variable('direction', If(contains({allText: '%logNames%', text: 'received'}),'🡸','🡺')),
        variable('contentType', If('%m/d/data/css%','css', If('%m/d/data/delta%','delta','%m/d/data/$%'))),
        variable('payload', prettyPrint('%m/d%'))
      ]
    })),
    controlWithCondition('%$payloadExpanded/{%$index%}%', group({ 
      controls: text({
        text: prettyPrint('%m/d%'),
        style: text.codemirror({height: '200'}),
        features: [codemirror.fold(), css('min-width: 1200px; font-size: 130%')]
      }), 
      features: feature.expandToEndOfRow('%$payloadExpanded/{%$index%}%')
    })),
  )
})

jb.component('eventTracker.testResult', {
  type: 'control',
  impl: controls(
    controlWithCondition('%logNames%==check test result', group({
      controls: [
        editableBoolean({databind: '%$testResultExpanded/{%$index%}%', style: chromeDebugger.toggleStyle()}),
        text({
          vars: Var('color',If('%success%','--jb-success-fg','--jb-error-fg')),
          text: If('%success%','✓ check test reuslt','⚠ check test reuslt'),
          features: css.color('var(%$color%)')
        }),
      ]
    })),
    controlWithCondition('%$testResultExpanded/{%$index%}%', group({ 
      layout: layout.horizontal(20),
      controls: [
        controlWithCondition('%expectedResultCtx/data%', text(prettyPrint('%expectedResultCtx.profile.expectedResult%',true))),
        controlWithCondition('%expectedResultCtx/data%', text('%expectedResultCtx/data%')),              
        text({
          text: '%html%',
          style: text.codemirror({height: '200', mode: 'htmlmixed', formatText: true}),
          features: [codemirror.fold(), css('min-width: 1200px; font-size: 130%')]
      })],
      features: feature.expandToEndOfRow('%$testResultExpanded/{%$index%}%')
    })),
  )
})

jb.component('studio.eventTracker', {
  type: 'control',
  impl: group({
    controls: group({
      controls: [
        eventTracker.toolbar(),
        table({
          items: eventTracker.eventItems('%$eventTracker/eventTrackerQuery%'),
          controls: [
            text('%index%'),
            eventTracker.uiComp(),
            eventTracker.callbagMessage(),
            eventTracker.testResult(),
            text({ text: '%logNames%', features: feature.byCondition(
              inGroup(list('exception','error'), '%logNames%'),
              css.color('var(--jb-error-fg)')
            )}),
            studio.lowFootprintObj('%err%','err'),
            studio.objExpandedAsText('%stack%','stack'),

            controlWithCondition('%m%',text('%m/$%: %m/t%, %m/cbId%')),
  //          studio.objExpandedAsText('%m/d%','payload'),
            studio.lowFootprintObj('%delta%','delta'),
            studio.lowFootprintObj('%vdom%','vdom'),
            studio.lowFootprintObj('%ref%','ref'),
            studio.lowFootprintObj('%value%','value'),
            studio.lowFootprintObj('%val%','val'),
            studio.lowFootprintObj('%focusChanged%','focusChanged'),
            studio.sourceCtxView('%srcCtx%'),
            studio.sourceCtxView('%cmp/ctx%'),
            studio.sourceCtxView('%ctx%'),
          ],
          style: table.plain(true),
          visualSizeLimit: 80,
          lineFeatures: [
            watchRef({ref: '%$cmpExpanded/{%$index%}%', allowSelfRefresh: true}),
            watchRef({ref: '%$payloadExpanded/{%$index%}%', allowSelfRefresh: true}),
            watchRef({ref: '%$testResultExpanded/{%$index%}%', allowSelfRefresh: true}),
            table.enableExpandToEndOfRow()
          ],               
          features: [
            watchable('cmpExpanded', obj()),
            watchable('payloadExpanded', obj()),
            watchable('testResultExpanded', obj()),
            itemlist.infiniteScroll(5),
            itemlist.selection({
              onSelection: runActions(({data}) => jb.frame.console.log(data), eventTracker.highlightEvent('%%'))
            }),
            itemlist.keyboardSelection({}),
            eventTracker.watchSpy(500),
          ]
        })
      ],
      features: id('event-tracker'),
    }),
    features: [
      variable('$disableLog',true),
      watchable('eventTracker',obj())
    ]
  })
})

jb.component('eventTracker.watchSpy',{
  type: 'feature',
  params: [
    { id: 'delay', defaultValue: 3000}
  ],
  impl: followUp.watchObservable(source.callbag(ctx => jb.ui.getSpy(ctx)._obs),'%$delay%')
})

jb.component('eventTracker.eventTypes', {
  type: 'control',
  impl: picklist({
    databind: '%$eventTracker/spyLogs%',
    options: picklist.options({
      options: ctx => jb.entries(jb.ui.getSpy(ctx).counters),
      code: '%0%',
      text: '%0% (%1%)'
    }),
    features: [
      chromeDebugger.colors(),
      picklist.onChange(
        ctx => {
        const loc = jb.ui.getSpy(ctx).locations[ctx.data].split(':')
        const col = +loc.pop()
        const line = (+loc.pop())-1
        const location = [loc.join(':'),line,col]
        jb.log('eventTracker openResource',{ctx,loc: jb.ui.getSpy(ctx).locations[ctx.data], location})
        loc && parent.postMessage({ runProfile: {$: 'chromeDebugger.openResource', location }})
      }
      )
    ]
  })
})

jb.component('studio.objExpandedAsText', {
  params: [
    {id: 'obj', mandatory: true },
    {id: 'title', as: 'string', mandatory: true},
  ],
  impl: controlWithCondition('%$obj%',group({
    controls: [
      controlWithCondition('%$asText/length% < 20', text('%$asText%')),
      controlWithCondition('%$asText/length% > 19', group({
        style: group.sectionExpandCollapse(text('%$title%')),
        controls: text({
          text: '%$asText%',
          style: text.codemirror({height: '200'}),
          features: codemirror.fold()
        }),    
      }))
    ],
    features: variable('asText',prettyPrint('%$obj%'))
  }))
})


jb.component('studio.lowFootprintObj', {
  type: 'control',
  params: [
    {id: 'obj', mandatory: true },
    {id: 'title', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 20 },
  ],
  impl: controlWithCondition('%$obj%', group({
    layout: layout.horizontal(4),
    controls: [
      controlWithCondition(
        '%$obj/cmpCtx%',
        studio.slicedString('%$obj/profile/$%: %$obj/path%')
      ),
      controlWithCondition(
        ({},{},{obj}) => jb.db.isRef(obj),
        studio.slicedString(({},{},{obj}) => obj.handler.pathOfRef(obj).join('/'))
      ),
      controlWithCondition(
        '%$obj/opEvent/newVal%',
        studio.slicedString('%$obj/opEvent/newVal%')
      ),
      controlWithCondition(
        isOfType('boolean', '%$obj%'),
        studio.slicedString('%$title%')
      ),
      controlWithCondition(
        isOfType('string,number', '%$obj%'),
        studio.slicedString('%$title%: %$obj%')
      ),
    ]
  }))
})

jb.component('studio.slicedString', {
  params: [
    {id: 'data', mandatory: true },
    {id: 'length', as: 'number', defaultValue: 30 },
  ],
  impl: controlWithCondition(
        isOfType('string', '%$data%'),
        text(({},{},{length,data}) => data.replace(/\n/g,'').slice(0,length))
    )
})

// jb.component('eventTracker.isNotDebuggerEvent', {
//   impl: ({data}) => !(jb.path(data,'m.routingPath') && jb.path(data,'m.routingPath').find(y=>y.match(/vDebugger/))
//     || (jb.path(data,'m.result.uri') || '').match(/vDebugger/)
//   )
// })

jb.component('eventTracker.eventItems', {
  params: [
    {id: 'query', as: 'string' },
  ],
  impl: (ctx,query) => {
    const spy = jb.ui.getSpy(ctx)
    if (!spy) return []
    //const checkEv = jb.comps['eventTracker.isNotDebuggerEvent'].impl // efficiency syntax
    //spy.logs = spy.logs.filter(data=> checkEv({data}))
    const items = jb.spy.search(query,{spy})
      
    jb.log('eventTracker items',{ctx,spy,query,items})
    const itemsWithTimeBreak = items.reduce((acc,item,i) => i && item.time - items[i-1].time > 100 ? 
      [...acc,{index: '---', logNames: `----- ${item.time - items[i-1].time} mSec gap ------`},item] : 
      [...acc,item] ,[])
    return itemsWithTimeBreak
  }
})

jb.component('eventTracker.elemOfCmp', {
  params: [
    {id: 'cmp' }
  ],
  impl: eventTracker.elemInInspectedJb('[cmp-id="%$cmp/cmpId%"]')
})

jb.component('eventTracker.elemInInspectedJb', {
  params: [
    {id: 'selector' }
  ],
  impl: (ctx,selector) => {
    const elem = selector != '#' && jb.ui.find(jb.frame.document,selector)[0]
    jb.log('eventTracker elemInInspectedJb',{ctx,selector,elem})
    return elem
  }
})

jb.component('eventTracker.highlightEvent', {
  type: 'action',
  params: [
    {id: 'event', defaultValue: '%%'}
  ],
  impl: runActions(
    Var('elem', firstSucceeding(eventTracker.elemOfCmp('%$event/cmp%'), eventTracker.elemInInspectedJb('#%$event/dialogId%'))),
    If('%$elem%', eventTracker.highlightElem('%$elem%')),
    If('%$event/elem%',eventTracker.highlightElem('%$event/elem%')),
    If('%$event/parentElem%',eventTracker.highlightElem('%$event/parentElem%'))
  )
})

jb.component('eventTracker.highlightElem', {
  type: 'action',
  params: [
    {id: 'elem'},
    {id: 'css', as: 'string', defaultValue: 'border: 1px dashed grey'}
  ],
  impl: runActions(
    Var('previewOverlay',true),
    log('eventTracker highlightElem'),
    openDialog({
        id: 'highlight-dialog',
        style: eventTracker.highlightDialogStyle(),
        content: text(''),
        features: [
          css(({},{},{elem}) => {
            if (!elem || !elem.getBoundingClientRect || !jb.ui.studioFixXPos) return ''
            const elemRect = elem.getBoundingClientRect()
            const left = jb.ui.studioFixXPos(elem) + elemRect.left + 'px'
            const top = jb.ui.studioFixYPos(elem) + elemRect.top + 'px'
            const width = Math.max(10,elemRect.width), height = Math.max(10,elemRect.height)
            return `left: ${left}; top: ${top}; width: ${width}px; height: ${height}px;`
          }),
          css('%$css%')
        ]
    }),
    delay(500),
    dialog.closeDialogById('highlight-dialog')
  )
})

jb.component('eventTracker.highlightDialogStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ display: block; position: absolute; background: transparent}',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
  })
})

jb.component('studio.sourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'},
  ],
  impl: controlWithCondition('%$srcCtx/cmpCtx%', group({
    controls: [
      controlWithCondition('%$stackItems/length% == 0',studio.singleSourceCtxView('%$srcCtx%')),
      controlWithCondition('%$stackItems/length% > 0', group({
          style: group.sectionExpandCollapse(studio.singleSourceCtxView('%$srcCtx%')),
          controls: itemlist({items: '%$stackItems%', controls: studio.singleSourceCtxView('%%')}),
      }))
    ],
    features: variable('stackItems', studio.stackItems('%$srcCtx%'))
  }))
})

jb.component('studio.singleSourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'},
  ],
  impl: button({
          title: ({},{},{srcCtx}) => {
            if (!srcCtx) return ''
            const path = srcCtx.path || ''
            const profile = path && jb.studio.valOfPath(path)
            const pt = profile && profile.$ || ''
            const ret = `${path.split('~')[0]}:${pt}`
            return ret.replace(/feature\./g,'').replace(/front.nd\./g,'').replace(/\.action/g,'')
          },
          action: eventTracker.highlightEvent('%%'),
          style: button.hrefText(),
          features: [
            feature.hoverTitle('%$srcCtx/path%'),
            button.ctrlAction(studio.gotoSource('%$srcCtx/path%', true))
          ]
    }),
})

jb.component('studio.stackItems', {
  params: [
    {id: 'srcCtx' },
  ],
  impl: (ctx,srcCtx) => {
          const stack=[];
          for(let innerCtx= srcCtx; innerCtx; innerCtx = innerCtx.cmpCtx)
            stack.push(innerCtx)
          return stack.slice(2)
      },
})

jb.component('chromeDebugger.colors',{
  type: 'feature',
  impl: features(
    css.color({background: 'var(--jb-menubar-inactive-bg)', color: 'var(--jb-menu-fg)'}),
    css('border: 0px;'),
    css('~ option { background: white}')
  )
})

jb.component('eventTracker.compInspector', {
  params: [
    {id: 'cmp'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: chromeDebugger.sectionsExpandCollapse(),
      controls: [
        text('%$cmp/cmpId%;%$cmp/ver% -- %$cmp/ctx/path%', '%$cmp/ctx/profile/$%'),
        table({
            title: 'state',
            items: unique({items: list(keys('%$cmp/state%'),keys('%$elem/_component/state%'))}),
            controls: [
             text('%%', ''),
             text('%$elem/_component/state/{%%}%', 'front end'),
             text('%$cmp/state/{%%}%', 'back end'),
            ],
        }),
        editableText({
            title: 'source',
            databind: studio.profileAsText('%$cmp/ctx/path%'),
            style: editableText.codemirror({height: '100'}),
            features: codemirror.fold()            
        }),
        table({
          title: 'methods',
          items: '%$cmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
        }),
        tableTree({
            title: 'rendering props',
            treeModel: tree.jsonReadOnly('%$cmp/renderProps%'),
            leafFields: text('%val%', 'value'),
            chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        //tree('raw', tree.jsonReadOnly('%$cmp%'))
      ]
    }),
    features: [
      variable('elem', eventTracker.elemOfCmp('%$cmp%')),
    ]
  })
})

jb.component('chromeDebugger.icon', {
  type: 'button.style',
  params: [
      {id: 'position', as: 'string', defaultValue: '0px 144px'}
  ],
  impl: customStyle({
    template: (cmp,{title},h) => h('div',{onclick: true, title}),
    css: `{ -webkit-mask-image: url(http://localhost:8082/hosts/chrome-debugger/largeIcons.svg); -webkit-mask-position: %$position%; 
      cursor: pointer; min-width: 24px; max-width: 24px;  height: 24px; background-color: #333; opacity: 0.7 }
      ~:hover { opacity: 1 }
      ~:active { opacity: 0.5 }`,
    features: button.initAction()
  })
})

jb.component('chromeDebugger.sectionsExpandCollapse', {
  type: 'group.style',
  impl: group.sectionsExpandCollapse({
      autoExpand: true,
      titleStyle: text.span(),
      toggleStyle: editableBoolean.expandCollapseWithUnicodeChars(),
      titleGroupStyle: styleWithFeatures(group.div(), features(
        css.class('expandable-view-title'),
        css('~ i { margin-top: 5px }'),
        css('text-transform: capitalize')
      )),
      innerGroupStyle: styleWithFeatures(group.div(), features(
        css.margin({bottom: 5}),
      ))
  })
})

jb.component('chromeDebugger.toggleStyle', {
  type: 'editable-boolean.style',
  impl: editableBoolean.expandCollapseWithUnicodeChars()
})
;

jb.ns('chromeDebugger')

jb.component('studio.compInspector', {
  params: [
    {id: 'inspectedProps'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      style: chromeDebugger.sectionsExpandCollapse(),
      controls: [
        text('%$inspectedCmp/cmpId%;%$inspectedCmp/ver% -- %$inspectedCtx/path%', '%$inspectedCtx/profile/$%'),
        table({
            title: 'state',
            items: unique({items: list(keys('%$inspectedCmp/state%'),keys('%$elem/_component/state%'))}),
            controls: [
             text('%%', ''),
             text('%$elem/_component/state/{%%}%', 'front end'),
             text('%$inspectedCmp/state/{%%}%', 'back end'),
            ],
            features: followUp.watchObservable(source.callbag('%$frameOfElem.spy.observable()%', 100))
        }),
        studio.eventsOfComp('%$inspectedCmp/cmpId%'),
        editableText({
            title: 'source',
            databind: studio.profileAsText('%$inspectedCtx/path%'),
            style: editableText.codemirror({height: '100'}),
            features: codemirror.fold()
        }),
        table({
          title: 'methods',
          items: '%$inspectedCmp/method%',
          controls: [
            text('%id%', 'method'),
            studio.sourceCtxView('%ctx%')
          ],
        }),
        tableTree({
            title: 'rendering props',
            treeModel: tree.jsonReadOnly('%$inspectedCmp/renderProps%'),
            leafFields: text('%val%', 'value'),
            chapterHeadline: text(tree.lastPathElement('%path%'))
        }),
        //tree('raw', tree.jsonReadOnly('%$inspectedCmp%'))
      ]
    }),
    features: [
      variable('cmpId', firstSucceeding('%$$state.cmpId%', '%$inspectedProps.cmpId%')),
      variable('frameUri', firstSucceeding('%$$state.frameUri%', '%$inspectedProps.frameUri%')),
      variable('frameOfElem', ({},{frameUri}) => [self,self.parent,...Array.from(frames)].filter(x=>x.jb.uri == frameUri)[0]),
      variable('elem', ({},{cmpId,frameOfElem}) => frameOfElem && frameOfElem.document.querySelector(`[cmp-id="${cmpId}"]`)),
      variable('inspectedCmp', ({},{frameOfElem, elem}) => 
            jb.path(elem && frameOfElem && frameOfElem.jb.ctxDictionary[elem.getAttribute('full-cmp-ctx')],'vars.cmp')),
      variable('inspectedCtx', '%$inspectedCmp/ctx%'),
      chromeDebugger.refreshAfterSelection(),
      followUp.flow(
        source.callbag(({},{frameOfElem}) => frameOfElem && frameOfElem.jb.ui.refreshNotification),
        rx.debounceTime(300),
        sink.refreshCmp('%$$state%')
      ),
    ]
  })
})

jb.component('studio.eventsOfComp', {
    type: 'control',
    params: [
        {id: 'compId'}
    ],
    impl: group({ title: 'events',
      controls: [
        group({
          title: 'toolbar',
          layout: layout.horizontal('2'),
          controls: [
            text({
                text: pipeline(eventTracker.getSpy(), '%$events/length%/%logs/length%'),
                title: 'counts',
                features: [css.padding({top: '5', left: '5'})]
            }),              
            divider({style: divider.vertical()}),
            button({
              title: 'clear',
              action: runActions(eventTracker.clearSpyLog(), refreshControlById('cmp-event-tracker')),
              style: chromeDebugger.icon(),
              features: [css.color('var(--jb-menu-fg)'), feature.hoverTitle('clear')]
            }),
            divider({style: divider.vertical()}),
            editableText({
              title: 'query',
              databind: '%$studio/eventTrackerCmpQuery%',
              style: editableText.input(),
              features: [
                htmlAttribute('placeholder', 'query'),
                feature.onEnter(refreshControlById('cmp-event-tracker')),
                css.class('toolbar-input'),
                css.height('10'),
                css.margin('4'),
                css.width('300')
              ]
            }),
            eventTracker.eventTypes()
          ],
          features: css.color({background: 'var(--jb-menubar-inactive-bg)'})
        }),
        table({
          items: '%$events%',
          controls: [
            text('%index%'),
            text({ text: '%logNames%', features: feature.byCondition(
              inGroup(list('exception','error'), '%logNames%'),
              css.color('var(--jb-error-fg)')
            )}),
            studio.lowFootprintObj('%err%','err'),
            studio.objExpandedAsText('%stack%','stack'),
  
            controlWithCondition('%m%',text('%m/$%: %m/t%, %m/cbId%')),
            studio.objExpandedAsText('%m/d%','payload'),
            studio.lowFootprintObj('%delta%','delta'),
            studio.lowFootprintObj('%vdom%','vdom'),
            studio.lowFootprintObj('%ref%','ref'),
            studio.lowFootprintObj('%value%','value'),
            studio.lowFootprintObj('%val%','val'),
            studio.lowFootprintObj('%focusChanged%','focusChanged'),
            studio.sourceCtxView('%srcCtx%'),
            studio.sourceCtxView('%cmp/ctx%'),
            studio.sourceCtxView('%ctx%'),
          ],
          style: table.plain(true),
          visualSizeLimit: 30,
          features: [
            id('event-logs'),
            itemlist.infiniteScroll(5),
            itemlist.selection({
              onSelection: runActions(({data}) => jb.frame.console.log(data), eventTracker.highlightEvent('%%'))
            }),
            itemlist.keyboardSelection(),
            css.height({height: '200', overflow: 'scroll'}),
          ]
        })
      ],
      features: [
        id('cmp-event-tracker'),
        variable({
          name: 'events',
          value: pipeline(eventTracker.eventItems('%$studio/eventTrackerCmpQuery%'),filter('%cmp/cmpId%==%$cmpId%'))
        }),
        eventTracker.watchSpy(1000),
      ]
    })
})

jb.component('chromeDebugger.refreshAfterSelection', {
  type: 'feature',
  impl: method('refreshAfterDebuggerSelection', runActions(
      () => {
          const sorted = Array.from(parent.document.querySelectorAll('[jb-selected-by-debugger]'))
              .sort((x,y) => (+y.getAttribute('jb-selected-by-debugger')) - (+x.getAttribute('jb-selected-by-debugger')))
          sorted.slice(1).forEach(el=>el.removeAttribute('jb-selected-by-debugger'))
      },
      action.refreshCmp('%%')
  )),
});


};