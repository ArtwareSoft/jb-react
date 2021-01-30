var jbFrame = (typeof frame == 'object') ? frame : typeof self === 'object' ? self : typeof global === 'object' ? global : {}

function newJbm() {
let jb = {}
function jb_run(ctx,parentParam,settings) {
//  ctx.profile && jb.log('core request', [ctx.id,...arguments])
  if (ctx.probe && ctx.probe.outOfTime)
    return
  if (jb.ctxByPath) jb.ctxByPath[ctx.path] = ctx
  let res = do_jb_run(...arguments)
  if (ctx.probe && ctx.probe.pathToTrace.indexOf(ctx.path) == 0)
      res = ctx.probe.record(ctx,res) || res
//  ctx.profile && jb.log('core result', [ctx.id,res,ctx,parentParam,settings])
  if (typeof res == 'function') jb.assignDebugInfoToFunc(res,ctx)
  return res
}

function do_jb_run(ctx,parentParam,settings) {
  try {
    const profile = ctx.profile
    if (profile == null || (typeof profile == 'object' && profile.$disabled))
      return castToParam(null,parentParam)

    if (profile.$debugger == 0) debugger
    if (profile.$asIs) return profile.$asIs
    if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
        parentParam.as = 'array'

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
      return
    const ctxWithVars = extendWithVars(ctx,profile.$vars)
    const run = prepare(ctxWithVars,parentParam)
    ctx.parentParam = parentParam
    switch (run.type) {      
      case 'booleanExp': return castToParam(jb.bool_expression(profile, ctx,parentParam), parentParam)
      case 'expression': return castToParam(jb.expression(profile, ctx,parentParam), parentParam)
      case 'asIs': return profile
      case 'function': return castToParam(profile(ctx,ctx.vars,ctx.cmpCtx && ctx.cmpCtx.params),parentParam)
      case 'null': return castToParam(null,parentParam)
      case 'ignore': return ctx.data
      case 'list': return profile.map((inner,i) => ctxWithVars.runInner(inner,null,i))
      case 'runActions': return jb.comps.runActions.impl(new jbCtx(ctxWithVars,{profile: { actions : profile },path:''}))
      case 'profile':
        if (!run.impl)
          run.ctx.callerPath = ctx.path;

        run.preparedParams.forEach(function prepareParam(paramObj) {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
            case 'array': run.ctx.params[paramObj.name] =
                paramObj.array.map(function prepareParamItem(prof,i) { return prof != null && jb_run(new jbCtx(run.ctx,{
                      profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param)})
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] =
              jb_run(new jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
          }
        })
        const out = run.impl ? run.impl.call(null,run.ctx,...run.preparedParams.map(param=>run.ctx.params[param.name])) 
          : jb_run(new jbCtx(run.ctx, { cmpCtx: run.ctx }),parentParam)
        return castToParam(out,parentParam)
    }
  } catch (e) {
    if (ctx.vars.$throw) throw e
    jb.logException(e,'exception while running run',{ctx,parentParam,settings})
  }
}

function extendWithVars(ctx,vars) {
  if (Array.isArray(vars))
    return vars.reduce((_ctx,{name,val},i) => _ctx.setVar(name,_ctx.runInner(val || '%%', null,`$vars~${i}~val`)), ctx )
  if (vars)
    jb.logError('$vars should be array',{ctx,vars})
  return ctx
  // let res = ctx
  // for(let varname in vars || {})
  //   res = new jbCtx(res,{ vars: {[varname]: res.runInner(vars[varname] || '%%', null,'$vars~'+varname)} })
  // return res
}

function prepareParams(comp_name,comp,profile,ctx) {
  return jb.compParams(comp)
    .filter(param=> !param.ignore)
    .map((param) => {
      const p = param.id
      let val = profile[p], path =p
      const valOrDefault = val !== undefined ? val : (param.defaultValue !== undefined ? param.defaultValue : null)
      const usingDefault = val === undefined && param.defaultValue !== undefined
      const forcePath = usingDefault && [comp_name, 'params', jb.compParams(comp).indexOf(param), 'defaultValue'].join('~')
      if (forcePath) path = ''

      const valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
      const arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

      if (param.dynamic) {
        const outerFunc = runCtx => {
          let func;
          if (arrayParam)
            func = (ctx2,data2) => jb.flattenArray(valOrDefaultArray.map((prof,i)=> runCtx.extendVars(ctx2,data2).runInner(prof, {...param, as: 'asIs'}, path+'~'+i)))
          else
            func = (ctx2,data2) => jb_run(new jb.jbCtx(runCtx.extendVars(ctx2,data2),{ profile: valOrDefault, forcePath, path } ),param)

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
}

function prepare(ctx,parentParam) {
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
  const comp_name = jb.compName(profile,parentParam)
  if (!comp_name)
    return { type: 'asIs' }
  const comp = jb.comps[comp_name];
  if (!comp && comp_name) { jb.logError('component ' + comp_name + ' is not defined', {ctx}); return { type:'null' } }
  if (comp.impl == null) { jb.logError('component ' + comp_name + ' has no implementation', {ctx}); return { type:'null' } }

  jb.fixMacroByValue && jb.fixMacroByValue(profile,comp)
  const resCtx = Object.assign(new jbCtx(ctx,{}), {parentParam, params: {}})
  const preparedParams = prepareParams(comp_name,comp,profile,resCtx);
  if (typeof comp.impl === 'function') {
    Object.defineProperty(comp.impl, 'name', { value: comp_name }) // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams: preparedParams }
  } else
    return { type:'profile', ctx: new jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
}


function castToParam(value,param) {
  return tojstype(value,param ? param.as : null);
}

function tojstype(value,jstype) {
  if (!jstype) return value;
  if (typeof jstypes[jstype] != 'function') debugger;
  return jstypes[jstype](value);
}

const jstypes = {
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
      return jb.asRef(value)
    },
    'ref[]': function(value) {
      return jb.asRef(value)
    },
    value(value) {
      return jb.val(value)
    }
}

let ctxCounter = 0;

class jbCtx {
  constructor(ctx,ctx2) {
    this.id = ctxCounter++
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
    return jb_run(new jbCtx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam)
  }
  exp(exp,jstype) { return jb.expression(exp, this, {as: jstype}) }
  setVars(vars) { return new jbCtx(this,{vars: vars}) }
  setVar(name,val) { return name ? new jbCtx(this,{vars: {[name]: val}}) : this }
  setData(data) { return new jbCtx(this,{data: data}) }
  runInner(profile,parentParam, path) { return jb_run(new jbCtx(this,{profile: profile,path}), parentParam) }
  bool(profile) { return this.run(profile, { as: 'boolean'}) }
  // keeps the ctx vm and not the caller vm - needed in studio probe
  ctx(ctx2) { return new jbCtx(this,ctx2) }
  frame() { // used for multi windows apps. e.g., studio
    return jb.frame
  }
  extendVars(ctx2,data2) {
    if (ctx2 == null && data2 == null)
      return this;
    return new jbCtx(this,{
      vars: ctx2 ? ctx2.vars : null,
      data: (data2 == null) ? ctx2.data : data2,
      forcePath: (ctx2 && ctx2.forcePath) ? ctx2.forcePath : null
    })
  }
  runItself(parentParam,settings) { return jb_run(this,parentParam,settings) }
  dataObj(data) { return {data, vars: this.vars} }
  callStack() {
    const ctxStack=[]; 
    for(let innerCtx=this; innerCtx; innerCtx = innerCtx.cmpCtx) 
      ctxStack.push(innerCtx)
    return ctxStack.map(ctx=>ctx.callerPath)
  }
}

Object.assign(jb, { 
  frame: jbFrame, 
  comps: {}, ctxDictionary: {}, run: jb_run, jbCtx, jstypes, tojstype 
})
return jb
}

if (typeof jb == 'undefined' && typeof jbDoNotInvoke_newJbm == 'undefined') jbFrame.jb = newJbm();

//if (typeof module != 'undefined') module.exports = jbFrame.jb;

Object.assign(jb, {
    compParams(comp) {
        if (!comp || !comp.params)
          return []
        return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>Object.assign(x[1],{id: x[0]}))
    },
    profileType(profile) {
        if (!profile) return ''
        if (typeof profile == 'string') return 'data'
        const comp_name = jb.compName(profile)
        return (jb.comps[comp_name] && jb.comps[comp_name].type) || ''
    },
    singleInType(parentParam) {
        const _type = parentParam && parentParam.type && parentParam.type.split('[')[0]
        return _type && jb.comps[_type] && jb.comps[_type].singleInType && _type
    },
    compName(profile,parentParam) {
        if (!profile || Array.isArray(profile)) return
        return profile.$ || jb.singleInType(parentParam)
    },
    path: (object,path,value) => {
        let cur = object;
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
    isDelayed: v => {
        if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
        else if (typeof v === 'object')
          return jb.isPromise(v)
        else if (typeof v === 'function')
          return jb.callbag.isCallbag(v)
    },
    toSynchArray: (item, synchCallbag) => {
        if (! jb.asArray(item).find(v=> jb.callbag.isCallbag(v) || jb.isPromise(v))) return item;
        const {pipe, fromIter, toPromiseArray, mapPromise,flatMap, map, isCallbag} = jb.callbag
        if (isCallbag(item)) return synchCallbag ? toPromiseArray(pipe(item,map(x=> x && x.vars ? x.data : x ))) : item
        if (Array.isArray(item) && isCallbag(item[0])) return synchCallbag ? toPromiseArray(pipe(item[0], map(x=> x && x.vars ? x.data : x ))) : item
    
        return pipe( // array of promises
              fromIter(jb.asArray(item)),
              mapPromise(x=> Promise.resolve(x)),
              flatMap(v => Array.isArray(v) ? v : [v]),
              toPromiseArray)
    },
    subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),
    log(logName, record, options) { jb.spy && jb.spy.log(logName, record, options) },
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
      const handler = jb.refHandler(ref)
      if (handler)
        return handler.val(ref)
      return ref
    },
    tostring: value => jb.tojstype(value,'string'),
    toarray: value => jb.tojstype(value,'array'),
    toboolean: value => jb.tojstype(value,'boolean'),
    tosingle: value => jb.tojstype(value,'single'),
    tonumber: value => jb.tojstype(value,'number'),
    assignDebugInfoToFunc(func, ctx) {
        func.ctx = ctx
        const debugFuncName = ctx.profile && ctx.profile.$ || typeof ctx.profile == 'string' && ctx.profile.slice(0,10) || ''
        Object.defineProperty(func, 'name', { value: (ctx.path ||'').split('~').pop() + ': ' + debugFuncName })
    },
    sessionStorage: (id,val) => val == undefined ? JSON.parse(jb.frame.sessionStorage.getItem(id)) : jb.frame.sessionStorage.setItem(id,JSON.stringify(val)),
    exec: (...args) => new jb.jbCtx().run(...args),
    exp: (...args) => new jb.jbCtx().exp(...args),
    eval: (str,frame) => { try { return (frame || jb.frame).eval('('+str+')') } catch (e) { return Symbol.for('parseError') } },
    addDebugInfo(f,ctx) { f.ctx = ctx; return f},

    studio: { previewjb: jb },    
    execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.jbCtx().run(...args),
})

// generic
Object.assign(jb, {
    entries(obj) {
        if (!obj || typeof obj != 'object') return [];
        let ret = [];
        for(let i in obj) // please do not change. its keeps definition order !!!!
            if (obj.hasOwnProperty && obj.hasOwnProperty(i) && i.indexOf('$jb_') != 0)
              ret.push([i,obj[i]])
        return ret
    },
    objFromEntries(entries) {
        const res = {}
        entries.forEach(e => res[e[0]] = e[1])
        return res
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
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    asArray: v => v == null ? [] : (Array.isArray(v) ? v : [v]),
    filterEmpty: obj => Object.entries(obj).reduce((a,[k,v]) => (v == null ? a : {...a, [k]:v}), {}),
    equals: (x,y) => x == y || jb.val(x) == jb.val(y),
    delay: (mSec,res) => new Promise(r=>setTimeout(()=>r(res),mSec)),
    compareArrays: (arr1, arr2) => {
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
    range: (start, count) => Array.apply(0, Array(count)).map((element, index) => index + start),
    flattenArray: items => {
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
});

(function() {
function resolveFinishedPromise(val) {
    if (val && typeof val == 'object' && val._state == 1) // finished promise
      return val._result
    return val
  }
  
function isRefType(jstype) {
    return jstype === 'ref' || jstype === 'ref[]'
}

function calcVar(ctx,varname,jstype) {
    let res
    if (ctx.cmpCtx && ctx.cmpCtx.params[varname] !== undefined)
      res = ctx.cmpCtx.params[varname]
    else if (ctx.vars[varname] !== undefined)
      res = ctx.vars[varname]
    else if (ctx.vars.scope && ctx.vars.scope[varname] !== undefined)
      res = ctx.vars.scope[varname]
    else if (jb.resources && jb.resources[varname] !== undefined)
      res = isRefType(jstype) ? jb.mainWatchableHandler.refOfPath([varname]) : jb.resource(varname)
    else if (jb.consts && jb.consts[varname] !== undefined)
      res = isRefType(jstype) ? jb.simpleValueByRefHandler.objectProperty(jb.consts,varname) : res = jb.consts[varname]
  
    return resolveFinishedPromise(res)
}
  
function expression(_exp, ctx, parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    let exp = '' + _exp
    if (jstype == 'boolean') return bool_expression(exp, ctx)
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const out = expression(exp.split('$log:')[1],ctx,parentParam)
      jb.comps.log.impl(ctx, out)
      return out
    }
    if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp
    // if (ctx && !ctx.ngMode)
    //   exp = exp.replace(/{{/g,'{%').replace(/}}/g,'%}')
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
  
    function conditionalExp(exp) {
      // check variable value - if not empty return all exp, otherwise empty
      const match = exp.match(/%([^%;{}\s><"']*)%/)
      if (match && jb.tostring(expPart(match[1])))
        return expression(exp, ctx, { as: 'string' })
      else
        return ''
    }
  
    function expPart(expressionPart,_parentParam) {
      return resolveFinishedPromise(evalExpressionPart(expressionPart,ctx,_parentParam || parentParam))
    }
}
  
function evalExpressionPart(expressionPart,ctx,parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    // example: %$person.name%.
  
    const parts = expressionPart.split(/[./[]/)
    return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)
  
    function pipe(input,subExp,last,first,invokeFunc) {
      if (subExp == '')
         return input
      if (subExp.match(/]$/))
        subExp = subExp.slice(0,-1)
  
      const refHandler = jb.objHandler(input)
      const functionCallMatch = subExp.match(/=([a-zA-Z]*)\(?([^)]*)\)?/)
      if (functionCallMatch && jb.functions[functionCallMatch[1]])
          return tojstype(jb.functions[functionCallMatch[1]](ctx,functionCallMatch[2]),jstype,ctx)
      if (subExp.match(/\(\)$/))
        return pipe(input,subExp.slice(0,-2),last,first,true)
      if (first && subExp.charAt(0) == '$' && subExp.length > 1) {
        const ret = calcVar(ctx,subExp.substr(1),last ? jstype : null)
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
        if (isRefType(jstype)) {
          if (last)
            return refHandler.objectProperty(obj,subExp,ctx)
          if (obj[subExp] === undefined)
            obj[subExp] = implicitlyCreateInnerObject(obj,subExp,refHandler)
        }
        if (last && jstype)
            return jb.jstypes[jstype](obj[subExp])
        return obj[subExp]
      }
    }
    function implicitlyCreateInnerObject(parent,prop,refHandler) {
      jb.log('core innerObject created',{parent,prop,refHandler})
      parent[prop] = {}
      refHandler.refreshMapDown && refHandler.refreshMapDown(parent)
      return parent[prop]
    }
}
  
function bool_expression(exp, ctx, parentParam) {
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const calculated = expression(exp.split('$log:')[1],ctx,{as: 'boolean'})
      const result = bool_expression(exp.split('$log:')[1], ctx, parentParam)
      jb.comps.log.impl(ctx, calculated + ':' + result)
      return result
    }
    if (exp.indexOf('!') == 0)
      return !bool_expression(exp.substring(1), ctx)
    const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/)
    if (!parts) {
      const ref = expression(exp, ctx, parentParam)
      if (jb.isRef(ref))
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
      const p1 = jb.tostring(expression(trim(parts[1]), ctx, {as: 'string'}))
      let p2 = jb.tostring(expression(trim(parts[3]), ctx, {as: 'string'}))
      p2 = (p2.match(/^["'](.*)["']/) || ['',p2])[1] // remove quotes
      if (op == '==') return p1 == p2
      if (op == '!=') return p1 != p2
      if (op == '^=') return p1.lastIndexOf(p2,0) == 0 // more effecient
      if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1
    }
  
    const p1 = jb.tonumber(expression(parts[1].trim(), ctx))
    const p2 = jb.tonumber(expression(parts[3].trim(), ctx))
  
    if (op == '>') return p1 > p2
    if (op == '<') return p1 < p2
    if (op == '>=') return p1 >= p2
    if (op == '<=') return p1 <= p2
  
    function trim(str) {  // trims also " and '
      return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1')
    }
}

Object.assign(jb,{bool_expression,expression})
})();

Object.assign(jb, {
    resources: {}, consts: {},
    simpleValueByRefHandler: {
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
        pathOfRef: () => []
    },
    resource: (id,val) => { 
        if (typeof val !== 'undefined')
          jb.resources[id] = val
        jb.mainWatchableHandler && jb.mainWatchableHandler.resourceReferred(id)
        return jb.resources[id]
    },
    passiveSym: Symbol.for('passive'),
    passive: (id,val) => typeof val == 'undefined' ? jb.consts[id] : (jb.consts[id] = jb.markAsPassive(val || {})),
    markAsPassive: obj => {
      if (obj && typeof obj == 'object') {
        obj[jb.passiveSym] = true
        Object.values(obj).forEach(v=>jb.markAsPassive(v))
      }
      return obj
    },
    extraWatchableHandlers: [],
    extraWatchableHandler: (handler,oldHandler) => { 
      jb.extraWatchableHandlers.push(handler)
      const oldHandlerIndex = jb.extraWatchableHandlers.indexOf(oldHandler)
      if (oldHandlerIndex != -1)
        jb.extraWatchableHandlers.splice(oldHandlerIndex,1)
      jb.watchableHandlers = [jb.mainWatchableHandler, ...jb.extraWatchableHandlers].map(x=>x)
      return handler
    },
    setMainWatchableHandler: handler => { 
      jb.mainWatchableHandler = handler
      jb.watchableHandlers = [jb.mainWatchableHandler, ...jb.extraWatchableHandlers].map(x=>x)
    },
    watchableHandlers: [],
    safeRefCall: (ref,f) => {
      const handler = jb.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler: ref => {
      if (ref && ref.handler) return ref.handler
      if (jb.simpleValueByRefHandler.isRef(ref)) 
        return jb.simpleValueByRefHandler
      return jb.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.refHandler(obj) || jb.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.simpleValueByRefHandler,
    asRef: obj => {
      const watchableHanlder = jb.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx,noNotifications) => !srcCtx.probe && jb.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    isRef: ref => jb.refHandler(ref),
    isWatchable: () => false, // overriden by the watchable-ref.js (if loaded)
    isValid: ref => jb.safeRefCall(ref, h=>h.isValid(ref)),
    refreshRef: ref => jb.safeRefCall(ref, h=>h.refresh(ref)),    
})

;

Object.assign(jb, {
    location: Symbol.for('location'),
    loadingPhase: Symbol.for('loadingPhase'),
    component: (_id,comp) => {
      const id = jb.macroName(_id)
      try {
        const errStack = new Error().stack.split(/\r|\n/)
        const line = errStack.filter(x=>x && x != 'Error' && !x.match(/at Object.component/)).shift()
        comp[jb.location] = line ? (line.match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        comp[jb.location][0] = comp[jb.location][0].split('?')[0]
      
        if (comp.watchableData !== undefined) {
          jb.comps[jb.addDataResourcePrefix(id)] = comp
          return jb.resource(jb.removeDataResourcePrefix(id),comp.watchableData)
        }
        if (comp.passiveData !== undefined) {
          jb.comps[jb.addDataResourcePrefix(id)] = comp
          return jb.passive(jb.removeDataResourcePrefix(id),comp.passiveData)
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
      comp[jb.loadingPhase] = jb.frame.jbLoadingPhase
      jb.registerMacro && jb.registerMacro(id, comp)
    },    
    macroDef: Symbol('macroDef'), macroNs: {}, macro: {},
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => {
        nsIds.split(',').forEach(nsId => jb.registerMacro(nsId + '.$forwardDef', {}))
        return jb.macro
    },
    fixMacroByValue: (profile,comp) => {
        if (profile && profile.$byValue) {
          const params = jb.compParams(comp)
          profile.$byValue.forEach((v,i)=> Object.assign(profile,{[params[i].id]: v}))
          delete profile.$byValue
        }
    },
    importAllMacros: () => ['var { ',
        jb.unique(Object.keys(jb.macro).map(x=>x.split('_')[0])).join(', '), 
    '} = jb.macro;'].join(''),
    registerMacro: (id, profile) => {
        const macroId = jb.macroName(id).replace(/\./g, '_')
        const nameSpace = id.indexOf('.') != -1 && jb.macroName(id.split('.')[0])

        if (checkId(macroId))
            registerProxy(macroId)
        if (nameSpace && checkId(nameSpace, true) && !jb.macro[nameSpace]) {
            registerProxy(nameSpace, true)
            jb.macroNs[nameSpace] = true
        }

        function registerProxy(proxyId) {
            //jb.frame[proxyId] = 
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
            if (jb.frame[macroId] && !jb.frame[macroId][jb.macroDef]) {
                jb.logError(macroId + ' is reserved by system or libs. please use a different name')
                return false
            }
            if (jb.macro[macroId] !== undefined && !isNS && !jb.macroNs[macroId] && !macroId.match(/_\$forwardDef$/))
                jb.logError(macroId.replace(/_/g,'.') + ' is defined more than once, using last definition ' + id)
            return true
        }

        function processMacro(args) {
            const _id = id.replace(/\.\$forwardDef$/,'')
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
                if (args.length == 1 && typeof args[0] == 'object' && !jb.compName(args[0]))
                    Object.assign(out, args[0])
                else
                    Object.assign(out, { $byValue: args })
                return Object.assign(out, system)
            }
        }
    },
    removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
    addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,

})
;

Object.assign(jb, {
spySettings: { 
	includeLogs: 'exception,error',
	stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
    MAX_LOG_SIZE: 10000
},

initSpy({Error, settings, spyParam, memoryUsage, resetSpyToNull}) {
	const frame = jb.frame
	Error = Error || frame.Error,
	memoryUsage = memoryUsage || (() => frame.performance && performance.memory && performance.memory.usedJSHeapSize)
	settings = Object.assign(settings||{}, jb.spySettings)
	if (resetSpyToNull)
		return jb.spy = null
    
    return jb.spy = {
		logs: [],
		spyParam,
		otherSpies: [],
		observable() { 
			const _jb = jb.path(jb,'studio.studiojb') || jb
			this._obs = this._obs || _jb.callbag.subject()
			return this._obs
		},
		enabled: () => true,
		calcIncludeLogsFromSpyParam(spyParam) {
			const includeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
			const excludeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
			this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
				acc[log] = true
				return acc
			}, {})
			this.includeLogsInitialized = true
		},
		shouldLog(logNames, record) {
			const ctx = record && (record.ctx || record.srcCtx || record.cmp && record.cmp.ctx)
			if (ctx && ctx.vars.$disableLog) return false
			if (!logNames) debugger
			return this.spyParam === 'all' || typeof record == 'object' && 
				logNames.split(' ').reduce( (acc,logName)=>acc || this.includeLogs[logName],false)
		},
		log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
			if (!this.includeLogsInitialized) this.calcIncludeLogsFromSpyParam(this.spyParam)
			this.updateCounters(logNames)
			this.updateLocations(logNames,takeFrom)
			if (!this.shouldLog(logNames, _record)) return
			const now = new Date()
			const index = this.logs.length
			const record = {
				logNames,
				..._record,
				index,
				source: this.source(takeFrom),
				_time: `${now.getSeconds()}:${now.getMilliseconds()}`,
				time: now.getTime(),
				mem: memoryUsage() / 1000000,
				activeElem: jb.path(jb.frame.document,'activeElement'),
				$attsOrder: _record && Object.keys(_record)
			}
			if (this.logs.length > 0 && jb.path(jb.frame.document,'activeElement') != this.logs[index-1].activeElem) {
				this.logs[index-1].logNames += ' focus'
				this.logs[index-1].activeElemAfter = record.activeElem
				this.logs[index-1].focusChanged = true
			}

			this.logs.push(record)
			if (this.logs.length > settings.MAX_LOG_SIZE *1.1)
				this.logs = this.logs.slice(-1* settings.MAX_LOG_SIZE)
			this._obs && this._obs.next(record)
		},
		frameAccessible(frame) { try { return Boolean(frame.document || frame.contentDocument) } catch(e) { return false } },
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const frames = [frame]
			// while (frames[0].parent && frames[0] !== frames[0].parent) {
			// 	frames.unshift(frames[0].parent)
			// }
			let stackTrace = frames.reverse().filter(f=>this.frameAccessible(f)).map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !settings.stackFilter.test(line))
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
        
        // browsing methods
		resetParam: spyParam => {
			this.spyParam = spyParam;
			this.includeLogs = null;
		},
		setLogs(spyParam) {
			if (spyParam === 'all')	this.spyParam = 'all'
			this.calcIncludeLogsFromSpyParam(spyParam)
		},
		clear() {
			this.logs = []
			this.counters = {}
		},
		updateCounters(logNames) {
			this.counters = this.counters || {}
			this.counters[logNames] = this.counters[logNames] || 0
			this.counters[logNames]++
		},
		updateLocations(logNames) {
			this.locations = this.locations || {}
			this.locations[logNames] = this.locations[logNames] || this.source().location
		},
		count(query) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), jb.entries(this.counters))) 
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
		search(query,slice= -1000) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), this.logs.slice(slice))) 
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
	}
},

initSpyByUrl() {
	const frame = jb.frame
	const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
	const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
	const spyParam = frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
		getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	if (spyParam)
		jb.initSpy({spyParam})
	if (frame) frame.spy = jb.spy // for console use
},

injectDebuggerJbm() {
	jb.jbms.visualDebugger = jb.createChildjbm(`${distPath}/jb-debugger.js?${parentUri}`)
},
injectVisualDebugger(debuggerUri, debuggerClientUri) {
	const distPath = jb.remote.pathOfDistFolder()
	const parentUri = jb.frame.jbUri || ''
	if (debuggerUri.indexOf('->') == -1 && typeof jb_loadFile != 'undefined' && typeof jbDebugger == 'undefined') {
		jb_loadFile(`${distPath}/jb-debugger.js?${parentUri}`)
		jbDebugger.remote.cbPortFromFrame(jb.frame,`${parentUri}-debugger`, debuggerClientUri)
	} else {
		jb.exec(rx.pipe(
			source.data(() => jb.remote.servers[debuggerUri.split('->').pop()]),
			rx.var('worker','%%'),
			rx.var('distPath',() => jb.remote.pathOfDistFolder()),
			rx.var('debuggerUri',() => debuggerUri),
			rx.var('debuggerClientUri',() => debuggerClientUri),
			remote.operator( ({},{distPath,debuggerUri,debuggerClientUri}) => { // runs in worker
				if (!self.jbDebugger) {
					importScripts(`${distPath}/jb-debugger.js?${self.jbUri}`)
					jbDebugger.remote.cbPortFromFrame(self,debuggerUri,debuggerClientUri)
				}
			}, '%$worker%'),
		))
	}

},

getDebugVms() {
	return [jb.frame.jbUri, ...Object.values(jb.remote.servers).map(worker=>worker.jbUri)].map(x => `${x}-debugger`)
},

})
jb.initSpyByUrl()
;

