if (typeof frame == 'undefined') frame = typeof self === 'object' ? self : typeof global === 'object' ? global : {}

var jb = (function() {
function jb_run(ctx,parentParam,settings) {
  ctx.profile && jb.log('core request', [ctx.id,...arguments])
  if (ctx.probe && ctx.probe.outOfTime)
    return
  if (jb.ctxByPath) jb.ctxByPath[ctx.path] = ctx
  let res = do_jb_run(...arguments)
  if (ctx.probe && ctx.probe.pathToTrace.indexOf(ctx.path) == 0)
      res = ctx.probe.record(ctx,res) || res
  ctx.profile && jb.log('core result', [ctx.id,res,ctx,parentParam,settings])
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
  if (!vars) return ctx
  if (Array.isArray(vars))
    return vars.reduce((_ctx,{name,val}) => _ctx.setVar(name,_ctx.runInner(val || '%%', null,`$vars~${name}`)), ctx )
  let res = ctx
  for(let varname in vars || {})
    res = new jbCtx(res,{ vars: {[varname]: res.runInner(vars[varname] || '%%', null,'$vars~'+varname)} })
  return res
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
  if (!comp.impl) { jb.logError('component ' + comp_name + ' has no implementation', {ctx}); return { type:'null' } }

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
    this.id = ctxCounter++;
    this._parent = ctx;
    if (typeof ctx == 'undefined') {
      this.vars = {};
      this.params = {};
    }
    else {
      if (ctx2.profile && ctx2.path == null) {
        debugger;
      ctx2.path = '?';
    }
      this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : ctx.profile;

      this.path = (ctx.path || '') + (ctx2.path ? '~' + ctx2.path : '');
      if (ctx2.forcePath)
        this.path = this.forcePath = ctx2.forcePath;
      if (ctx2.comp)
        this.path = ctx2.comp + '~impl';
      this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : ctx.data;     // allow setting of data:null
      this.vars= ctx2.vars ? Object.assign({},ctx.vars,ctx2.vars) : ctx.vars;
      this.params= ctx2.params || ctx.params;
      this.cmpCtx= (typeof ctx2.cmpCtx != 'undefined') ? ctx2.cmpCtx : ctx.cmpCtx;
      this.probe= ctx.probe;
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
    return frame
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

return { frame, comps: {}, ctxDictionary: {}, run: jb_run, jbCtx, jstypes, tojstype }
})()

if (typeof self != 'undefined') self.jb = jb
if (typeof module != 'undefined') module.exports = jb;

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
      frame.console && frame.console.log('%c Error: ','color: red', err, logObj && Object.values(logObj))
      jb.log('error',{err , ...logObj})
    },
    logException(e,err,logObj) {
      frame.console && frame.console.log('%c Exception: ','color: red', err, e, logObj && Object.values(logObj))
      jb.log('exception',{ err, stack: e.stack||'', ...logObj})
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
      if (subExp == 'length' && obj && typeof obj.length != 'undefined')
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
    const: (id,val) => typeof val == 'undefined' ? jb.consts[id] : (jb.consts[id] = val || {}),
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
    writeValue: (ref,value,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.writeValue(ref,value,srcCtx)),
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
          return jb.const(jb.removeDataResourcePrefix(id),comp.passiveData)
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
  
      jb.registerMacro && jb.registerMacro(id, comp)
    },    
    macroDef: Symbol('macroDef'), macroNs: {}, 
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => nsIds.split(',').forEach(nsId => jb.registerMacro(nsId + '.$dummyComp', {})),
    fixMacroByValue: (profile,comp) => {
        if (profile && profile.$byValue) {
          const params = jb.compParams(comp)
          profile.$byValue.forEach((v,i)=> Object.assign(profile,{[params[i].id]: v}))
          delete profile.$byValue
        }
    },
    registerMacro: (id, profile) => {
        const macroId = jb.macroName(id).replace(/\./g, '_')
        const nameSpace = id.indexOf('.') != -1 && jb.macroName(id.split('.')[0])

        if (checkId(macroId))
            registerProxy(macroId)
        if (nameSpace && checkId(nameSpace, true) && !jb.frame[nameSpace]) {
            registerProxy(nameSpace, true)
            jb.macroNs[nameSpace] = true
        }

        function registerProxy(proxyId) {
            jb.frame[proxyId] = new Proxy(() => 0, {
                get: (o, p) => {
                    if (typeof p === 'symbol') return true
                    return jb.frame[proxyId + '_' + p] || genericMacroProcessor(proxyId, p)
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
            if (jb.frame[macroId] !== undefined && !isNS && !jb.macroNs[macroId] && !macroId.match(/_\$dummyComp$/))
                jb.logError(macroId.replace(/_/g,'.') + ' is defined more than once, using last definition ' + id)
            return true
        }

        function processMacro(args) {
            if (args.length == 0)
                return { $: id }
            const params = profile.params || []
            const firstParamIsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
            if (params.length == 1 && firstParamIsArray) // pipeline, or, and, plus
                return { $: id, [params[0].id]: args }
            const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
                (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
            if ((profile.macroByValue || params.length < 3) && profile.macroByValue !== false && !macroByProps)
                return { $: id, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
            if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
                return { $: id, ...args[0] }
            if (args.length == 1 && params.length)
                return { $: id, [params[0].id]: args[0] }
            if (args.length == 2 && params.length > 1)
                return { $: id, [params[0].id]: args[0], [params[1].id]: args[1] }
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

(function() {
const spySettings = { 
	mutableVerbs: [
		'set','refresh','writeValue','splice',
		'focus','state','method','applyDelta','render','scrollBy'
	],
	verbOntology: [
		['startEnd','start','end'],
		['startEnd','started','completed'],
		['startEnd',['search','select'],['found','notFound']],
		['startEnd','request','result'],
		['startEnd',['create','build'], ['built','created']],
		['startEnd','set','changed'],
		['startEnd','open','close'],
		['startEnd','waitFor','arrived']
	],
	verbs: [
		'sent','received','check', 'register', 'timeout', 'objectProperty',
	],
	lifecycleVerbs: ['init', 'changed','destroyed'],
	flowLifeCycle: ['define','register','next','completed','error'],
	ontology: [
		['kindOf','uiComp', ['dialog','itemlist','tree','tabletree','editableBoolean','helperPopup']],
		['partsOf','uiComp',['frontend','backend']],
		['partsOf','widget',['headlessWidget','widgetFrontend']],
		['aspects','ui', ['watchable','keyboard','service']],
		['objects','ui', ['uiComp','field','uiDelta','vdom','var', 'calculatedVar', 'selectionKeySource']],
		['processIn','ui', ['renderVdom']],

		['subSystem','studio', ['probe','preview','picker','codeMirrorHint']],
		['objects','studio', ['script']],
		['objects','tests', ['testResult','userInput','userRequest','dataTest','uiTest','waitForCompReady','waitForSelector']],
		['processIn','tests', ['test']],
		['processIn','preview',['loadPreview']],
		['processIn','probe',['runCircuit']],
		['kindOf', 'store',['watchable','jbParent']],
		['kindOf', 'var',['calculatedVar']],
		['kindOf', 'service',['selectionKeySource']],

		['subSystem','ui', ['menu']],

		['objects','menu', ['']],
		['kindOf', 'service',['menuKeySource']],

	],
	moreLogs: 'req,res,focus,apply,check,suggestions,writeValue,render,createReactClass,renderResult,probe,setState,immutable,pathOfObject,refObservable,scriptChange,resLog,setGridAreaVals,dragableGridItemThumb,pptrStarted,pptrEmit,pptrActivity,pptrResultData', 
	groups: {
		none: '',
		methods: 'BEMethod,FEMethod',
		refresh: 'doOp,refreshElem,notifyCmpObservable,refreshCmp',
		keyboard: 'registerService,overridingService,fromSelectionKeySource,foundSelectionKeySource,selectionKeySourceNotFound,itemlistOnkeydown,selectionKeySource,itemlistOnkeydownNextSelected,BEMethod,FEMethod,FEFlow,FEProp,followUp,focus',
		puppeteer: 'pptrStarted,pptrEmit,pptrActivity,pptrResultData,pptrInfo,pptrError',
		watchable: 'doOp,writeValue,removeCmpObservable,registerCmpObservable,notifyCmpObservable,notifyObservableElems,notifyObservableElem,scriptChange',
		react: 'BEMethod,applyNewVdom,applyDeltaTop,applyDelta,unmount,render,initCmp,refreshReq,refreshElem,childDiffRes,htmlChange,appendChild,removeChild,replaceTop,calcRenderProp,followUp',
		dialog: 'addDialog,closeDialog,refreshDialogs',
		uiTest: 'userInput,remote,checkTestResult,userRequest,refresh,waitForSelector,waitForSelectorCheck,scrollBy,dataTestResult',
		remoteCallbag: 'innerCBReady,innerCBCodeSent,innerCBDataSent,innerCBMsgReceived,remoteCmdReceived,remoteSource,remoteSink,outputToRemote,inputFromRemote,inputInRemote,outputInRemote',
		menu: 'fromMenuKeySource,menuControl,initPopupMenu,isRelevantMenu,menuKeySourceNotFound,foundMenuKeySource,menuMouseEnter',
	},
	includeLogs: 'exception,error',
	stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
    MAX_LOG_SIZE: 10000
}
const frame = jb.frame
jb.spySettings = spySettings

jb.initSpy = function({Error, settings, spyParam, memoryUsage, resetSpyToNull}) {
	Error = Error || frame.Error,
	memoryUsage = memoryUsage || (() => frame.performance && performance.memory && performance.memory.usedJSHeapSize)
	settings = Object.assign(settings||{}, spySettings)

	const systemProps = ['index', 'time', '_time', 'mem', 'source','activeElem']

    const isRegex = x => Object.prototype.toString.call(x) === '[object RegExp]'
	const isString = x => typeof x === 'string' || x instanceof String
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
		parseLogsList(list, depth = 0) {
			if (depth > 3) return []
			return (list || '').split(',').filter(x => x[0] !== '-').filter(x => x)
				// .flatMap(x=> settings.groups[x] ? this.parseLogsList(settings.groups[x],depth+1) : [x])
				//.flatMap(x=> settings.groups[x] ? this.parseLogsList(settings.groups[x],depth+1) : [x])
		},
		calcIncludeLogsFromSpyParam(spyParam) {
			const includeLogsFromParam = this.parseLogsList(spyParam)
			const excludeLogsFromParam = (spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
			this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
				acc[log] = true
				return acc
			}, {})
			this.includeLogsInitialized = true
		},
		shouldLog(logNames, record) {
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
			// if (record[0] == null && typeof funcTitle === 'function') {
			// 	record[0] = funcTitle()
			// }
			// if (record[0] == null && record.source) {
			// 	record[0] = record.source[0]
			// }
			// if (typeof modifier === 'function') {
			// 	modifier(record)
			// }
			this.logs.push(record)
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
					? set.filter(rec=>!rec.logNames.match(new RegExp(`\\b${exp.slice(1)}\\b`)))
					: set.filter(rec=>rec.logNames.match(new RegExp(`\\b${exp}\\b`)))
			}
			function unify(set1,set2) {
				let res = [...set1,...set2].sort((x,y) => x.index < y.index)
				return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
			}
		}
	}
} 

function initSpyByUrl() {
	const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
	const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
	const spyParam = self.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
		getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	if (spyParam)
		jb.initSpy({spyParam})
	if (jb.frame) jb.frame.spy = jb.spy // for console use
}
initSpyByUrl()

})()
;

jb.component('call', {
  type: 'any',
  params: [
    {id: 'param', as: 'string'}
  ],
  impl: function(context,param) {
 	  const paramObj = context.cmpCtx && context.cmpCtx.params[param];
      if (typeof paramObj == 'function')
 		return paramObj(new jb.jbCtx(context, {
 			data: context.data,
 			vars: context.vars,
 			cmpCtx: context.cmpCtx.cmpCtx,
 			forcePath: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
})

jb.pipe = function(ctx,ptName,passRx) {
  let start = jb.toarray(ctx.data)
  if (start.length == 0) start = [null]
	if (typeof ctx.profile.items == 'string')
		return ctx.runInner(ctx.profile.items,null,'items');
	const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
	const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
		: (ctx.profile[ptName] ? (ptName + '~') : 'items~');

	if (ptName == '$pipe') // promise pipe
		return profiles.reduce((deferred,prof,index) =>
			deferred.then(data=>jb.toSynchArray(data, !passRx)).then(data=>step(prof,index,data))
    , Promise.resolve(start))
      .then(data=>jb.toSynchArray(data, !passRx))

	return profiles.reduce((data,prof,index) => step(prof,index,data), start)

	function step(profile,i,data) {
    if (!profile || profile.$disabled) return data;
    const path = innerPath+i
		const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {}) ;
		if (jb.profileType(profile) == 'aggregator')
			return jb.run( new jb.jbCtx(ctx, { data, profile, path }), parentParam);
		return [].concat.apply([],data.map(item =>
				jb.run(new jb.jbCtx(ctx,{data: item, profile, path}), parentParam))
			.filter(x=>x!=null)
			.map(x=> {
        const val = jb.val(x)
        return Array.isArray(val) ? val : x 
      }));
	}
}

jb.component('pipeline', {
  type: 'data',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true, description: 'click "=" for functions list'}
  ],
  impl: ctx => jb.pipe(ctx,'$pipeline')
})

jb.component('pipe', {
  type: 'data',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.pipe(ctx,'$pipe',false)
})

jb.component('pipePassRx', {
  type: 'data',
  description: 'wait for promises, do not wait for reactive data',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.pipe(ctx,'$pipe',true)
})

jb.component('data.if', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', mandatory: true, dynamic: true, composite: true},
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
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'},
  ],
  impl: ({},x,y) => x + y
})

jb.component('math.minus', {
  params: [
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'},
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
    {id: 'value', mandatory: true}
  ],
  impl: (ctx,to,value) => {
    if (!jb.isRef(to)) {
      ctx.run(ctx.profile.to,{as: 'ref'}) // for debug
      return jb.logError(`can not write to: ${ctx.profile.to}`, {ctx})
    }
    const val = jb.val(value)
    if (jb.isDelayed(val))
      return Promise.resolve().then(val=>jb.writeValue(to,val,ctx))
    else
      jb.writeValue(to,val,ctx)
  }
})

jb.component('property', {
  description: 'navigate/select/path property of object',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,prop,obj) =>	jb.objectProperty(obj,prop,ctx)
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
  impl: (ctx,array,toAdd) => jb.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
})

jb.component('move', {
  type: 'action',
  description: 'move item in tree, activated from D&D',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.move(from,_to,ctx)
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
		jb.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
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
			jb.splice(array,[[index,1]],ctx)
	}
})

jb.component('toggleBooleanValue', {
  type: 'action',
  params: [
    {id: 'of', as: 'ref'}
  ],
  impl: (ctx,_of) => jb.writeValue(_of,jb.val(_of) ? false : true,ctx)
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
    let sortFunc;
    const firstData = jb.entries(data[0]||{})[0][1]
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
  impl: ({},items) => items.reverse()
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
  impl: (ctx,properties) => jb.objFromEntries(properties.map(p=>[p.title, jb.tojstype(p.val(ctx),p.type)]))
})

jb.component('extend', {
  description: 'assign and extend with calculated properties',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) =>
		Object.assign({}, ctx.data, jb.objFromEntries(properties.map(p=>[p.title, jb.tojstype(p.val(ctx),p.type)])))
})
jb.component('assign', jb.comps.extend)

jb.component('extendWithIndex', {
  type: 'aggregator',
  description: 'extend with calculated properties. %$index% is available ',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) => jb.toarray(ctx.data).map((item,i) =>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.title, jb.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
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
  }
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
		return jb.unique(items,_idFunc);
	}
})

jb.component('log', {
  params: [
    {id: 'logName', as: 'string', mandatory: 'true' },
    {id: 'logObj', as: 'single' }
  ],
  impl: (ctx,log,logObj) => jb.log(log,{...logObj,ctx})
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
		return actions.reduce((def,action,index) =>
				def.then(function runActions() {return ctx.runInner(action, { as: 'single'}, innerPath + index ) })
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
    {id: 'notifications', as: 'string', options: 'wait for all actions,no notifications', description: 'notification for watch-ref, default behavior is after each action'},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,items,action,notifications,indexVariable) => {
		if (notifications && jb.mainWatchableHandler) jb.mainWatchableHandler.startTransaction()
		return (jb.val(items)||[]).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runActionOnItems',{item, action, ctx}))
			.then(() => notifications && jb.mainWatchableHandler && jb.mainWatchableHandler.endTransaction(notifications === 'no notifications'));
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
  impl: ({},obj) => jb.isRef(obj)
})

jb.component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.asRef(obj)
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
  impl: ({},id) => jb.sessionStorage(id)
})

jb.component('action.setSessionStorage', {
  params: [
    { id: 'id', as: 'string' },
    { id: 'value', dynamic: true },
  ],
  impl: ({},id,value) => jb.sessionStorage(id,value())
})
;

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
          source(0, function distinctUntilChanged(type, data) {
              if (type === 0) talkback = data
              if (type !== 1) {
                  sink(type, data)
                  return
              }
              if (inited && compare(prev, data)) {
                  talkback(1)
                  return
              }
              inited = true
              prev = data
              sink(1, data)
          })
      },
      takeUntil(notifier) {
          if (jb.isPromise(notifier))
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
          return subj
      },
      replayWithTimeout: timeOut => source => { // replay the messages arrived before timeout
        timeOut = timeOut || 1000
        let store = [], done = false
      
        source(0, function replayWithTimeout(t, d) {
          if (t == 1 && d) {
            const now = new Date().getTime()
            store = store.filter(e => now < e.time + timeOut)
            store.push({ time: now, d })
          }
        })
      
        return function replayWithTimeout(start, sink) {
          if (start !== 0) return
          if (done) return sink(2)
          source(0, function replayWithTimeout(t, d) { sink(t,d) })
          const now = new Date().getTime()
          store = store.filter(e => now < e.time + timeOut)
          store.forEach(e => sink(1, e.d))
        }
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
      
          store.slice(sliceNum).forEach(entry => sink(1, entry))
      
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
      takeWhile: predicate => source => (start, sink) => {
          if (start !== 0) return
          let talkback
          source(0, function takeWhile(t,d) {
            if (t === 0) talkback = d
            if (t === 1 && !predicate(d)) {
              talkback(2)
              sink(2)
            } else {
              sink(t, d)
            }
          })
      },
      last: () => source => (start, sink) => {
          if (start !== 0) return
          let talkback
          let lastVal
          let matched = false
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
            } else {
              sink(t, d)
            }
          })
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
          const f = source && 'from' + (jb.isPromise(source) ? 'Promise'
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

jb.ns('rx,sink,source')

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
  params: [
    {id: 'ref', as: 'ref' },
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
  ],
  impl: (ctx,ref,includeChildren) => jb.ui.refObservable(ref,null,{includeChildren, srcCtx: ctx})
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
  description: 'pipeline of reactive observables',
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
  description: 'inner reactive pipeline',
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
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated var is available. E,g. %$acc%,%% ',  mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor'},
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
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
  impl: (ctx,func) => jb.callbag.map(jb.addDebugInfo(ctx2 => ({data: func(ctx2), vars: ctx2.vars || {}}),ctx))
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
  impl: (ctx,filter) => jb.callbag.filter(jb.addDebugInfo(ctx2 => filter(ctx2),ctx))
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
  impl: () => jb.callbag.distinctUntilChanged((prev,cur) => prev && cur && prev.data == cur.data)
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
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,whileCondition) => jb.callbag.takeWhile(ctx => whileCondition(ctx))
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
  description: 'subscribe',
  category: 'sink',
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
  impl: (ctx,name,extra) => ctx.run(rx.do(_ctx => jb.log(name,{data: _ctx.data,vars: _ctx.vars,ctx, ...extra(_ctx)})))
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

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/pack-immutable.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/immutability-helper/index.js":
/*!***************************************************!*\
  !*** ./node_modules/immutability-helper/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var invariant = __webpack_require__(/*! invariant */ \"./node_modules/invariant/browser.js\");\n\nvar hasOwnProperty = Object.prototype.hasOwnProperty;\nvar splice = Array.prototype.splice;\n\nvar toString = Object.prototype.toString\nvar type = function(obj) {\n  return toString.call(obj).slice(8, -1);\n}\n\nvar assign = Object.assign || /* istanbul ignore next */ function assign(target, source) {\n  getAllKeys(source).forEach(function(key) {\n    if (hasOwnProperty.call(source, key)) {\n      target[key] = source[key];\n    }\n  });\n  return target;\n};\n\nvar getAllKeys = typeof Object.getOwnPropertySymbols === 'function' ?\n  function(obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)) } :\n  /* istanbul ignore next */ function(obj) { return Object.keys(obj) };\n\n/* istanbul ignore next */\nfunction copy(object) {\n  if (Array.isArray(object)) {\n    return assign(object.constructor(object.length), object)\n  } else if (type(object) === 'Map') {\n    return new Map(object)\n  } else if (type(object) === 'Set') {\n    return new Set(object)\n  } else if (object && typeof object === 'object') {\n    var prototype = Object.getPrototypeOf(object);\n    return assign(Object.create(prototype), object);\n  } else {\n    return object;\n  }\n}\n\nfunction newContext() {\n  var commands = assign({}, defaultCommands);\n  update.extend = function(directive, fn) {\n    commands[directive] = fn;\n  };\n  update.isEquals = function(a, b) { return a === b; };\n\n  return update;\n\n  function update(object, spec) {\n    if (typeof spec === 'function') {\n      spec = { $apply: spec };\n    }\n\n    if (!(Array.isArray(object) && Array.isArray(spec))) {\n      invariant(\n        !Array.isArray(spec),\n        'update(): You provided an invalid spec to update(). The spec may ' +\n        'not contain an array except as the value of $set, $push, $unshift, ' +\n        '$splice or any custom command allowing an array value.'\n      );\n    }\n\n    invariant(\n      typeof spec === 'object' && spec !== null,\n      'update(): You provided an invalid spec to update(). The spec and ' +\n      'every included key path must be plain objects containing one of the ' +\n      'following commands: %s.',\n      Object.keys(commands).join(', ')\n    );\n\n    var nextObject = object;\n    var index, key;\n    getAllKeys(spec).forEach(function(key) {\n      if (hasOwnProperty.call(commands, key)) {\n        var objectWasNextObject = object === nextObject;\n        nextObject = commands[key](spec[key], nextObject, spec, object);\n        if (objectWasNextObject && update.isEquals(nextObject, object)) {\n          nextObject = object;\n        }\n      } else {\n        var nextValueForKey =\n          type(object) === 'Map'\n            ? update(object.get(key), spec[key])\n            : update(object[key], spec[key]);\n        var nextObjectValue =\n          type(nextObject) === 'Map'\n              ? nextObject.get(key)\n              : nextObject[key];\n        if (!update.isEquals(nextValueForKey, nextObjectValue) || typeof nextValueForKey === 'undefined' && !hasOwnProperty.call(object, key)) {\n          if (nextObject === object) {\n            nextObject = copy(object);\n          }\n          if (type(nextObject) === 'Map') {\n            nextObject.set(key, nextValueForKey);\n          } else {\n            nextObject[key] = nextValueForKey;\n          }\n        }\n      }\n    })\n    return nextObject;\n  }\n\n}\n\nvar defaultCommands = {\n  $push: function(value, nextObject, spec) {\n    invariantPushAndUnshift(nextObject, spec, '$push');\n    return value.length ? nextObject.concat(value) : nextObject;\n  },\n  $unshift: function(value, nextObject, spec) {\n    invariantPushAndUnshift(nextObject, spec, '$unshift');\n    return value.length ? value.concat(nextObject) : nextObject;\n  },\n  $splice: function(value, nextObject, spec, originalObject) {\n    invariantSplices(nextObject, spec);\n    value.forEach(function(args) {\n      invariantSplice(args);\n      if (nextObject === originalObject && args.length) nextObject = copy(originalObject);\n      splice.apply(nextObject, args);\n    });\n    return nextObject;\n  },\n  $set: function(value, nextObject, spec) {\n    invariantSet(spec);\n    return value;\n  },\n  $toggle: function(targets, nextObject) {\n    invariantSpecArray(targets, '$toggle');\n    var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;\n\n    targets.forEach(function(target) {\n      nextObjectCopy[target] = !nextObject[target];\n    });\n\n    return nextObjectCopy;\n  },\n  $unset: function(value, nextObject, spec, originalObject) {\n    invariantSpecArray(value, '$unset');\n    value.forEach(function(key) {\n      if (Object.hasOwnProperty.call(nextObject, key)) {\n        if (nextObject === originalObject) nextObject = copy(originalObject);\n        delete nextObject[key];\n      }\n    });\n    return nextObject;\n  },\n  $add: function(value, nextObject, spec, originalObject) {\n    invariantMapOrSet(nextObject, '$add');\n    invariantSpecArray(value, '$add');\n    if (type(nextObject) === 'Map') {\n      value.forEach(function(pair) {\n        var key = pair[0];\n        var value = pair[1];\n        if (nextObject === originalObject && nextObject.get(key) !== value) nextObject = copy(originalObject);\n        nextObject.set(key, value);\n      });\n    } else {\n      value.forEach(function(value) {\n        if (nextObject === originalObject && !nextObject.has(value)) nextObject = copy(originalObject);\n        nextObject.add(value);\n      });\n    }\n    return nextObject;\n  },\n  $remove: function(value, nextObject, spec, originalObject) {\n    invariantMapOrSet(nextObject, '$remove');\n    invariantSpecArray(value, '$remove');\n    value.forEach(function(key) {\n      if (nextObject === originalObject && nextObject.has(key)) nextObject = copy(originalObject);\n      nextObject.delete(key);\n    });\n    return nextObject;\n  },\n  $merge: function(value, nextObject, spec, originalObject) {\n    invariantMerge(nextObject, value);\n    getAllKeys(value).forEach(function(key) {\n      if (value[key] !== nextObject[key]) {\n        if (nextObject === originalObject) nextObject = copy(originalObject);\n        nextObject[key] = value[key];\n      }\n    });\n    return nextObject;\n  },\n  $apply: function(value, original) {\n    invariantApply(value);\n    return value(original);\n  }\n};\n\nvar contextForExport = newContext();\n\nmodule.exports = contextForExport;\nmodule.exports.default = contextForExport;\nmodule.exports.newContext = newContext;\n\n// invariants\n\nfunction invariantPushAndUnshift(value, spec, command) {\n  invariant(\n    Array.isArray(value),\n    'update(): expected target of %s to be an array; got %s.',\n    command,\n    value\n  );\n  invariantSpecArray(spec[command], command)\n}\n\nfunction invariantSpecArray(spec, command) {\n  invariant(\n    Array.isArray(spec),\n    'update(): expected spec of %s to be an array; got %s. ' +\n    'Did you forget to wrap your parameter in an array?',\n    command,\n    spec\n  );\n}\n\nfunction invariantSplices(value, spec) {\n  invariant(\n    Array.isArray(value),\n    'Expected $splice target to be an array; got %s',\n    value\n  );\n  invariantSplice(spec['$splice']);\n}\n\nfunction invariantSplice(value) {\n  invariant(\n    Array.isArray(value),\n    'update(): expected spec of $splice to be an array of arrays; got %s. ' +\n    'Did you forget to wrap your parameters in an array?',\n    value\n  );\n}\n\nfunction invariantApply(fn) {\n  invariant(\n    typeof fn === 'function',\n    'update(): expected spec of $apply to be a function; got %s.',\n    fn\n  );\n}\n\nfunction invariantSet(spec) {\n  invariant(\n    Object.keys(spec).length === 1,\n    'Cannot have more than one key in an object with $set'\n  );\n}\n\nfunction invariantMerge(target, specValue) {\n  invariant(\n    specValue && typeof specValue === 'object',\n    'update(): $merge expects a spec of type \\'object\\'; got %s',\n    specValue\n  );\n  invariant(\n    target && typeof target === 'object',\n    'update(): $merge expects a target of type \\'object\\'; got %s',\n    target\n  );\n}\n\nfunction invariantMapOrSet(target, command) {\n  var typeOfTarget = type(target);\n  invariant(\n    typeOfTarget === 'Map' || typeOfTarget === 'Set',\n    'update(): %s expects a target of type Set or Map; got %s',\n    command,\n    typeOfTarget\n  );\n}\n\n\n//# sourceURL=webpack:///./node_modules/immutability-helper/index.js?");

/***/ }),

/***/ "./node_modules/invariant/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/invariant/browser.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\n/**\n * Use invariant() to assert state which your program assumes to be true.\n *\n * Provide sprintf-style format (only %s is supported) and arguments\n * to provide information about what broke and what you were\n * expecting.\n *\n * The invariant message will be stripped in production, but the invariant\n * will remain to ensure logic does not differ in production.\n */\n\nvar invariant = function(condition, format, a, b, c, d, e, f) {\n  if (true) {\n    if (format === undefined) {\n      throw new Error('invariant requires an error message argument');\n    }\n  }\n\n  if (!condition) {\n    var error;\n    if (format === undefined) {\n      error = new Error(\n        'Minified exception occurred; use the non-minified dev environment ' +\n        'for the full error message and additional helpful warnings.'\n      );\n    } else {\n      var args = [a, b, c, d, e, f];\n      var argIndex = 0;\n      error = new Error(\n        format.replace(/%s/g, function() { return args[argIndex++]; })\n      );\n      error.name = 'Invariant Violation';\n    }\n\n    error.framesToPop = 1; // we don't care about invariant's own frame\n    throw error;\n  }\n};\n\nmodule.exports = invariant;\n\n\n//# sourceURL=webpack:///./node_modules/invariant/browser.js?");

/***/ }),

/***/ "./src/ui/pack-immutable.js":
/*!**********************************!*\
  !*** ./src/ui/pack-immutable.js ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutability-helper */ \"./node_modules/immutability-helper/index.js\");\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immutability_helper__WEBPACK_IMPORTED_MODULE_0__);\n\r\njb.ui = jb.ui || {}\r\njb.ui.update = immutability_helper__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./src/ui/pack-immutable.js?");

/***/ })

/******/ });;

(function() {

// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

const isProxy = Symbol.for("isProxy")
const originalVal = Symbol.for("originalVal")
const targetVal = Symbol.for("targetVal")
const jbId = Symbol("jbId")

class WatchableValueByRef {
  constructor(resources) {
    this.resources = resources
    this.objToPath = new Map()
    this.idCounter = 1
    this.opCounter = 1
    this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])]
    this.resourceChange = jb.callbag.subject()
    this.observables = []
    this.primitiveArraysDeltas = {}

    jb.ui.originalResources = jb.resources
    const resourcesObj = resources()
    resourcesObj[jbId] = this.idCounter++
    this.objToPath.set(resourcesObj[jbId],[])
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
      this.resources(jb.ui.update(this.resources(),op),opEvent)
      const newVal = (opVal != null && opVal[isProxy]) ? opVal : this.valOfPath(path);
      if (opOnRef.$push) {
        opOnRef.$push.forEach((toAdd,i)=>
          this.addObjToMap(toAdd,[...path,oldVal.length+i]))
        newVal[jbId] = oldVal[jbId]
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
        this.primitiveArraysDeltas[ref.$jb_obj[jbId]] = this.primitiveArraysDeltas[ref.$jb_obj[jbId]] || []
        this.primitiveArraysDeltas[ref.$jb_obj[jbId]].push(opOnRef.$splice)
      }
      opEvent.newVal = newVal;
      jb.log('watchable set',{opEvent,ref,opOnRef,srcCtx})
      if (this.transactionEventsLog)
        this.transactionEventsLog.push(opEvent)
      else
        this.resourceChange.next(opEvent);
      return opEvent;
    } catch(e) {
      jb.logException(e,'doOp',{srcCtx,ref,opOnRef,srcCtx})
    }
  }
  resourceReferred(resName) {
    const resource = this.resources()[resName]
    if (!this.objToPath.has(resource))
    this.addObjToMap(resource,[resName])
  }
  addJbId(path) {
    for(let i=0;i<path.length;i++) {
      const innerPath = path.slice(0,i+1)
      const val = this.valOfPath(innerPath,true)
      if (val && typeof val === 'object' && !val[jbId]) {
          val[jbId] = this.idCounter++
          this.addObjToMap(val,innerPath)
      }
    }
  }
  addObjToMap(top,path) {
    if (!top || top[isProxy] || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
    if (top[jbId]) {
        this.objToPath.set(top[jbId],path)
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
    if (top[jbId] && isInner)
        this.objToPath.delete(top[jbId])
    Object.keys(top).filter(key=>key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key],true))
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
    const path = this.isRef(ref) && (this.objToPath.get(ref.$jb_obj) || this.objToPath.get(ref.$jb_obj[jbId]))
    if (path && ref.$jb_childProp !== undefined) {
        this.refreshPrimitiveArrayRef(ref)
        return [...path, ref.$jb_childProp]
    }
    return path
  }
  urlOfRef(ref) {
    const path = this.pathOfRef(ref)
    this.addJbId(path)
    const byId = [ref.$jb_obj[jbId],ref.$jb_childProp].filter(x=>x != null).map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
    const byPath = path.map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
    return `${this.resources.id}://${byId};${byPath}`
  }
  refOfUrl(url) {
    const path = url.split(';')[0].split('~')
    return { handler: this, $jb_obj: {[jbId]: +path[0] }, ...path[1] ? {$jb_childProp: path[1]} : {} }
  }
  asRef(obj, silent) {
    if (this.isRef(obj))
      return obj
    if (!obj || typeof obj !== 'object') return obj;
    const actualObj = obj[isProxy] ? obj[targetVal] : obj
    const path = this.objToPath.get(actualObj) || this.objToPath.get(actualObj[jbId])
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
    return (val && val[isProxy] && val[originalVal]) || val
  }
  hasLinksInPath(path) {
    let val = this.resources()
    for(let i=0;i<path.length;i++) {
      if (val && val[isProxy])
        return true
      val = val && val[path[i]]
    }
  }
  removeLinksFromPath(path) {
    if (!Array.isArray(path)) return
    if (!this.hasLinksInPath(path))
      return path
    return path.reduce(({val,path} ,p) => {
      const proxy = (val && val[isProxy])
      const inner =  proxy ? val[originalVal] : val
      const newPath = proxy ? (this.objToPath.get(inner) || this.objToPath.get(inner[jbId])) : path
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
    return this.resources() === val || typeof val != 'number' && (this.objToPath.get(val) || (val && this.objToPath.get(val[jbId])))
  }
  isRef(ref) {
    return ref && ref.$jb_obj && this.watchable(ref.$jb_obj);
  }
  objectProperty(obj,prop,ctx) {
    if (!obj)
      return jb.logError('watchable objectProperty: null obj',{obj,prop,ctx})
    if (obj && obj[prop] && this.watchable(obj[prop]) && !obj[prop][isProxy])
      return this.asRef(obj[prop])
    const ref = this.asRef(obj)
    if (ref && ref.$jb_obj) {
      const ret = {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
      if (this.isPrimitiveArray(ref.$jb_obj)) {
        ret.$jb_delta_version = (this.primitiveArraysDeltas[ref.$jb_obj[jbId]] || []).length
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
      return ref.$jb_val(value);
    if (this.val(ref) === value) return;
    return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
  }
  createSecondaryLink(val) {
    if (val && typeof val === 'object' && !val[isProxy]) {
      const ref = this.asRef(val,true);
      if (ref && ref.$jb_obj)
        return new Proxy(val, {
          get: (o,p) => (p === targetVal) ? o : (p === isProxy) ? true : (p === originalVal ? val : (jb.val(this.asRef(val)))[p]),
          set: (o,p,v) => o[p] = v
        })
    }
    return val;
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
    const arrayId = ref.$jb_obj[jbId]
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
  getOrCreateObservable(req) {
      const subject = jb.callbag.subject()
      req.srcCtx = req.srcCtx || { path: ''}
      const ctx = req.cmpOrElem && req.cmpOrElem.ctx || jb.ui.ctxOfElem(req.cmpOrElem) || req.srcCtx
      const key = this.pathOfRef(req.ref).join('~') + ' : ' + ctx.path
      const recycleCounter = req.cmpOrElem && req.cmpOrElem.getAttribute && +(req.cmpOrElem.getAttribute('recycleCounter') || 0)
      const obs = { ...req, subject, key, recycleCounter, ctx }

      this.observables.push(obs)
      this.observables.sort((e1,e2) => jb.ui.comparePaths(e1.ctx.path, e2.ctx.path))
      const cmp = req.cmpOrElem && (req.cmpOrElem.ver ? req.cmpOrElem : req.cmpOrElem._component)
      jb.log('register uiComp observable',{cmp, key,obs})
      return subject
  }
  frame() {
    return this.resources.frame || jb.frame
  }
  propagateResourceChangeToObservables() {
    jb.subscribe(this.resourceChange, e=>{
      const observablesToUpdate = this.observables.slice(0) // this.observables array may change in the notification process !!
      const changed_path = this.removeLinksFromPath(this.pathOfRef(e.ref))
      if (changed_path) observablesToUpdate.forEach(obs=> {
        const isOld = jb.path(obs.cmpOrElem,'getAttribute') && (+obs.cmpOrElem.getAttribute('recycleCounter')) > obs.recycleCounter
        if (jb.path(obs.cmpOrElem,'_destroyed') || isOld) {
          if (this.observables.indexOf(obs) != -1) {
            jb.log('remove cmpObservable',{obs})
            this.observables.splice(this.observables.indexOf(obs), 1);
          }
        } else {
          this.notifyOneObserver(e,obs,changed_path)
        }
      })
    })
  }

  notifyOneObserver(e,obs,changed_path) {
      let obsPath = jb.refHandler(obs.ref).pathOfRef(obs.ref)
      obsPath = obsPath && this.removeLinksFromPath(obsPath)
      if (!obsPath)
        return jb.logError('observer ref path is empty',{obs,e})
      const diff = jb.ui.comparePaths(changed_path, obsPath)
      const isChildOfChange = diff == 1
      const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
      const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
      if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
          jb.log('notify cmpObservable',{srcCtx: e.srcCtx,obs,e})
          obs.subject.next(e)
      }
  }

  dispose() {
    this.resourceChange.complete()
  }
}

// 0- equals, -1,1 means contains -2,2 lexical
jb.ui.comparePaths = function(path1,path2) {
    path1 = path1 || ''
    path2 = path2 || ''
    let i=0;
    while(path1[i] === path2[i] && i < path1.length) i++;
    if (i == path1.length && i == path2.length) return 0;
    if (i == path1.length && i < path2.length) return -1;
    if (i == path2.length && i < path1.length) return 1;
    return path1[i] < path2[i] ? -2 : 2
}

function resourcesRef(val) {
  if (typeof val == 'undefined')
    return jb.resources;
  else
    jb.resources = val;
}
resourcesRef.id = 'resources'

jb.setMainWatchableHandler(new WatchableValueByRef(resourcesRef));
jb.rebuildRefHandler = () => {
  jb.mainWatchableHandler && jb.mainWatchableHandler.dispose()
  jb.setMainWatchableHandler(new WatchableValueByRef(resourcesRef))
}
jb.isWatchable = ref => jb.refHandler(ref) instanceof WatchableValueByRef || ref && ref.$jb_observable

jb.ui.refObservable = (ref,cmpOrElem,settings={}) => {
  if (ref && ref.$jb_observable)
    return ref.$jb_observable(cmpOrElem);
  if (!jb.isWatchable(ref)) {
    jb.logError('ref is not watchable: ', {ref, cmpOrElem})
    return jb.callbag.fromIter([])
  }
  return jb.refHandler(ref).getOrCreateObservable({ref,cmpOrElem,...settings})
  //jb.refHandler(ref).refObservable(ref,cmpOrElem,settings);
}

jb.ui.extraWatchableHandler = (resources,oldHandler) => {
  const res = jb.extraWatchableHandler(new WatchableValueByRef(resources),oldHandler)
  jb.ui.subscribeToRefChange(res)
  return res
}

jb.ui.resourceChange = () => jb.mainWatchableHandler.resourceChange;

jb.component('runTransaction', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true},
    {id: 'disableNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: ctx => {
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions'] || []).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    jb.mainWatchableHandler.startTransaction()
    return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runTransaction',{ctx}))
      .then(() => jb.mainWatchableHandler.endTransaction(ctx.params.disableNotifications))
	}
})

})()
;

(function () {

class VNode {
    constructor(cmpOrTag, _attributes, _children) {
        const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]])
            .map(([id,val])=>[id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id,val]))
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
        
        this.attributes = attributes
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('#') != -1)
            debugger
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('.') != -1) {
            this.addClass(cmpOrTag.split('.').pop().trim())
            cmpOrTag = cmpOrTag.split('.')[0]
        }
        if (children != null)
            children.forEach(ch=>ch.parentNode = this)
        Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,children})
    }
    getAttribute(att) {
        const res = (this.attributes || {})[att]
        return res == null ? res : (''+res)
    }
    setAttribute(att,val) {
        this.attributes = this.attributes || {}
        this.attributes[att.toLowerCase()] = ''+val
        return this
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
        const attEquals = selector.match(/^\[([a-zA-Z0-9_$\-]+)="([a-zA-Z0-9_\-]+)"\]$/)
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
}

function toVdomOrStr(val) {
    if (jb.isDelayed(val))
        return jb.toSynchArray(val).then(v => jb.ui.toVdomOrStr(v[0]))

    const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
    let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
    if (res && res instanceof VNode || Array.isArray(res)) return res
    if (typeof res === 'boolean' || typeof res === 'object')
        res = '' + res
    else if (typeof res === 'string')
        res = res.slice(0,1000)
    return res
}

function stripVdom(vdom) {
    if (jb.path(vdom,'constructor.name') != 'VNode') {
        jb.logError('stripVdom - not vnode', {vdom})
        return jb.ui.h('span')
    }
    return { ...vdom, parentNode: null, children: vdom.children && vdom.children.map(x=>stripVdom(x)) }
}

function _unStripVdom(vdom,parent) {
    if (!vdom) return // || typeof vdom.parentNode == 'undefined') return
    vdom.parentNode = parent
    Object.setPrototypeOf(vdom, VNode.prototype);
    ;(vdom.children || []).forEach(ch=>_unStripVdom(ch,vdom))
    return vdom
}

function unStripVdom(vdom,parent) {
    return _unStripVdom(JSON.parse(JSON.stringify(vdom)),parent)
}

function cloneVNode(vdom) {
    return unStripVdom(JSON.parse(JSON.stringify(stripVdom(vdom))))
}


function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,after) {
    const a = after instanceof ui.VNode ? ui.stripVdom(after) : after
    jb.log('vdom diff compare',{before: b,after : a})
    const attributes = jb.objectDiff(a.attributes || {}, b.attributes || {})
    const children = childDiff(b.children || [],a.children || [])
    return { 
        ...(Object.keys(attributes).length ? {attributes} : {}), 
        ...(children ? {children} : {}),
        ...(a.tag != b.tag ? { tag: a.tag} : {})
    }

    function childDiff(b,a) {
        if (b.length == 0 && a.length ==0) return
        if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
            return { 0: {...compareVdom(b[0],a[0]),__afterIndex: 0}, length: 1 }
        jb.log('vdom child diff start',{before: b,after: a})
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
                const innerDiff = { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
                if (Object.keys(innerDiff).length > 1) {
                    res[i] = innerDiff
                    res.length = i+1
                }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
        jb.log('vdom child diff result',{res,before: b,after: a})
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
    const val1 = atts1.ctxId && jb.path(jb.ui.ctxDictionary[atts1.ctxId],att)
    const val2 = atts2.ctxId && jb.path(jb.ui.ctxDictionary[atts2.ctxId],att)
    return val1 && val2 && val1 == val2
}

Object.assign(jb.ui, {VNode, cloneVNode, toVdomOrStr, stripVdom, unStripVdom })

})();

(function(){
jb.ui = jb.ui || {}
const ui = jb.ui
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,{ f, ctx: this && this.ctx }) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,after) {
    const a = after instanceof ui.VNode ? ui.stripVdom(after) : after
    jb.log('vdom diff compare',{before: b,after : a})
    const attributes = jb.objectDiff(a.attributes || {}, b.attributes || {})
    const children = childDiff(b.children || [],a.children || [])
    return { 
        ...(Object.keys(attributes).length ? {attributes} : {}), 
        ...(children ? {children} : {}),
        ...(a.tag != b.tag ? { tag: a.tag} : {})
    }

    function childDiff(b,a) {
        if (b.length == 0 && a.length ==0) return
        if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
            return { 0: {...compareVdom(b[0],a[0]),__afterIndex: 0}, length: 1 }
        jb.log('vdom child diff start',{before: b,after: a})
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
                const innerDiff = { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
                if (Object.keys(innerDiff).length > 1) {
                    res[i] = innerDiff
                    res.length = i+1
                }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
        jb.log('vdom child diff result',{res,before: b,after: a})
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
    const val1 = atts1.ctxId && jb.path(jb.ui.ctxDictionary[atts1.ctxId],att)
    const val2 = atts2.ctxId && jb.path(jb.ui.ctxDictionary[atts2.ctxId],att)
    return val1 && val2 && val1 == val2
}

// dom related functions

function applyNewVdom(elem,vdomAfter,{strongRefresh, ctx} = {}) {
    const widgetId = jb.ui.headlessWidgetId(elem)
    jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
    if (widgetId) {
        const cmpId = elem.getAttribute('cmp-id')
        const delta = compareVdom(elem,vdomAfter)
        if (elem != vdomAfter) { // update the elem
            Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
            ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
        }
        jb.ui.renderingUpdates.next({delta,cmpId,widgetId})
        return
    }
    const active = jb.ui.activeElement() === elem
    if (vdomAfter.tag != elem.tagName.toLowerCase() || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop vdom',{newElem,elem})
        elem = newElem
    } else {
        const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
        const delta = compareVdom(vdomBefore,vdomAfter)
        //jb.log('applyDeltaTop dom',{vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
        applyDeltaToDom(elem,delta)
    }
    ui.refreshFrontEnd(elem)
    if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
    ui.garbageCollectCtxDictionary()
}

function refreshFrontEnd(elem) {
    ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component ? el._component.newVDomApplied() : mountFrontEnd(el))
}

function elemToVdom(elem) {
    return {
        tag: elem.tagName.toLowerCase(),
        attributes: jb.objFromEntries([
            ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
            ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
        ]),
        ...( elem.childElementCount && !elem.getAttribute('jb_external') 
            ? { children: Array.from(elem.children).map(el=> elemToVdom(el)) } : {})
    }
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta dom',{elem,delta})
    const children = delta.children
    if (children) {
        const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children)
        const {toAppend,deleteCmp,sameOrder} = children
        if (deleteCmp) {
            const toDelete = Array.from(elem.children).find(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (toDelete) {
                unmount(toDelete)
                elem.removeChild(toDelete)
                jb.log('removeChild dom',{toDelete,elem,delta})
            }
        }
        childrenArr.forEach((e,i) => {
            if (!e) return
            if (e.$ == 'delete') {
                unmount(childElems[i])
                elem.removeChild(childElems[i])
                jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta})
            } else {
                applyDeltaToDom(childElems[i],e)
                !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
            }
        })
        ;(toAppend||[]).forEach(e=>{
            const newElem = render(e,elem)
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
        .forEach(e=> setAtt(elem,e[0],e[1]))
}

function applyDeltaToVDom(elem,delta) {
    if (!elem) return
    jb.log('applyDelta vdom',{elem,delta})
    // supports only append/delete
    if (delta.children) {
        const toAppend = delta.children.toAppend || []
        toAppend.forEach(ch => elem.children.push(jb.ui.unStripVdom(ch,elem)))
        const deleteCmp = delta.children.deleteCmp
        if (deleteCmp) {
            const index = elem.children.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (index != -1)
                elem.children.splice(index,1)
        }
        Object.keys(delta.children).filter(x=>!isNaN(x)).forEach(index=>
                applyDeltaToVDom(elem.children[+index],delta.children[index]))
    }

    Object.assign(elem.attributes,delta.attributes)
}

function setAtt(elem,att,val) {
    if (val == '__undefined') return
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
        jb.delay(1).then(()=> elem.checked = !!val)
        jb.log('dom set checked',{elem,att,val})
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
        elem.setAttribute('_focus',val)
        jb.ui.focus(elem,val)
    } else if (att === '$scrollDown' && val) {
        elem.__appScroll = true
        elem.scrollTop = elem.scrollHeight
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
}

function unmount(elem) {
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
}

function render(vdom,parentElem,prepend) {
    jb.log('render',{vdom,parentElem,prepend})
    function doRender(vdom,parentElem) {
        jb.log('dom createElement',{tag: vdom.tag, vdom,parentElem})
        const elem = createElement(parentElem.ownerDocument, vdom.tag)
        jb.entries(vdom.attributes).forEach(e=>setAtt(elem,e[0],e[1]))
        jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
        prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
        return elem
    }
    const res = doRender(vdom,parentElem)
    ui.findIncludeSelf(res,'[interactive]').forEach(el=> mountFrontEnd(el))
    return res
}

function createElement(doc,tag) {
    tag = tag || 'div'
    return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
        doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
}

// raw event enriched to userEvent and wrapped with userRequest
Object.assign(jb.ui, {
    handleCmpEvent(ev, specificMethod) {
        specificMethod = specificMethod == 'true' ? true : specificMethod
        const userReq = jb.ui.rawEventToUserRequest(ev,specificMethod)
        if (!userReq) return
        if (userReq.widgetId)
            jb.ui.widgetUserRequests.next(userReq)
        else
            jb.ui.runCtxAction(jb.ctxDictionary[userReq.ctxIdToRun],userReq.data,userReq.vars)
    },
    rawEventToUserRequest(ev, specificMethod) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('rawEventToUserRequest can not find closest elem with jb-ctx',{ev})
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.tstWidgetId
        return ctxIdToRun && {$:'runCtxAction', widgetId, ctxIdToRun, vars: {ev: jb.ui.buildUserEvent(ev, elem)} }
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
        const evProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','altKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        elem._component && elem._component.enrichUserEvent(ev,userEvent)
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runCtxAction(ctx,data,vars) {
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },
    runBEMethodInAnyContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp instanceof jb.ui.JbComponent)
            cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            jb.ui.runBEMethod(cmp.base,method,data,{$state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethod(elem,method,data,vars) {
        const widgetId = jb.ui.frontendWidgetId(elem)
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        if (!ctxIdToRun)
            return jb.logError(`no method in cmp: ${method}`, {elem, data, vars})

        if (widgetId)
            jb.ui.widgetUserRequests.next({$:'runCtxAction', widgetId, ctxIdToRun, data, vars })
        else {
            if (!jb.ctxDictionary[ctxIdToRun])
                return jb.logError(`no ctx found for method: ${method}`, {ctxIdToRun, elem, data, vars})
            jb.log('backend method',{method,elem,data,vars})
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun],data,vars)
        }
    },
})

Object.assign(jb.ui, {
    h, render, unmount, applyNewVdom, applyDeltaToDom, applyDeltaToVDom, elemToVdom, mountFrontEnd, compareVdom, refreshFrontEnd,
    BECmpsDestroyNotification: jb.callbag.subject(),
    renderingUpdates: jb.callbag.subject(),
    ctrl(context,options) {
        const styleByControl = jb.path(context,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (context.vars.$refreshElemCall || styleByControl) ? context.vars.$state : {}
        const cmpId = context.vars.$cmpId, cmpVer = context.vars.$cmpVer
        if (!context.vars.$serviceRegistry)
            jb.logError('no serviceRegistry',{ctx: context})
        const ctx = context.setVars({
            $model: { ctx: context, ...context.params},
            $state,
            $serviceRegistry: context.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions instanceof ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = context.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(forceNow,clearAll) {
        if (!forceNow)
            return jb.delay(1000).then(()=>ui.garbageCollectCtxDictionary(true))
   
        const used = 'jb-ctx,full-cmp-ctx,pick-ctx,props-ctx,methods,frontEnd,originators'.split(',')
            .flatMap(att=>querySelectAllWithWidgets(`[${att}]`).flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop()))))
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
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v))
            .map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .filter(id=>+id.split(':').pop < maxUsed)
            .forEach(id => { removedResources.push(id); delete jb.resources[id]})

        jb.log('garbageCollect',{maxUsed,removedCtxs,removedResources})

        function querySelectAllWithWidgets(query) {
            return jb.ui.headless ? [...Object.values(jb.ui.headless).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), ...Array.from(document.querySelectorAll(query))] : []
        }
    },
    applyDeltaToCmp(delta, ctx, cmpId, elem) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (!elem || delta.$prevVersion && delta.$prevVersion != elem.getAttribute('cmp-ver')) {
            jb.logError('trying to apply delta to unexpected verson',{delta, ctx, cmpId, elem})
            return
        }
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem})
        if (delta.$bySelector)
            jb.entries(delta.$bySelector).forEach(([selector,innerDelta]) => applyDeltaToElem(jb.ui.findIncludeSelf(elem,selector)[0],innerDelta))
        else
            applyDeltaToElem(elem,delta)

        function applyDeltaToElem(elem,delta) {
            if (elem instanceof jb.ui.VNode) {
                jb.ui.applyDeltaToVDom(elem, delta)
                jb.ui.renderingUpdates.next({delta,cmpId,widgetId: ctx.vars.headlessWidgetId})
            } else if (elem) {
                jb.ui.applyDeltaToDom(elem, delta)
                jb.ui.refreshFrontEnd(elem)
            }
        }
    },
    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing') 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$state', strongRefresh ? {refresh: true } : 
            {refresh: true, ...jb.path(elem._component,'state'), ...state}) // strongRefresh kills state

        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path}) || ctx.profile
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.run(dialog.buildComp()) : ctx.runItself()
        jb.log('dom refresh check',{cmp,ctx,elem, state, options})

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('dom refresh css',{cmp, lines: cmp.cssLines,ctx,elem, state, options})
            return jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, cssStyleElem})
        }
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refresh dom stopped by hash',{hash, elem, state, options})
        jb.log('dom refresh',{cmp,ctx,elem, state, options})
        cmp && applyNewVdom(elem, h(cmp), {strongRefresh, ctx})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const findIn = jb.path(e,'srcCtx.vars.headlessWidgetId') || jb.path(e,'srcCtx.vars.testID') ? e.srcCtx : jb.frame.document
        const elemsToCheck = jb.ui.find(findIn,'[observe]')
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('check observableElems',{elemsToCheck,e})
        elemsToCheck.forEach((elem,i) => {
            //.map((elem,i) => ({elem,i, phase: phaseOfElem(elem,i) })).sort((x1,x2)=>x1.phase-x2.phase).forEach(({elem,i}) => {
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) return // the elem was already refreshed during this process, probably by its parent
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                const cmpId = jb.path(e.srcCtx, 'vars.cmp.cmpId')
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${cmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',{cmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',cmpId,obs,e)
                strongRefresh = strongRefresh || obs.strongRefresh
                cssOnly = cssOnly && obs.cssOnly
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                    jb.log('refresh from observableElems',{cmpId,elem,ctx: e.srcCtx,obs,e})
                    refresh = true
                }
            })
            refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
        })

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh, cssOnly, allowSelfRefresh }
        }
    })
})

class frontEndCmp {
    constructor(elem, keepState) {
        this.ctx = jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.jbCtx()
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
        ;(elem.getAttribute('eventHandlers') || '').split(',').forEach(h=>{
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
        toRun.forEach(({path}) => tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
            const srcCtx = new jb.jbCtx(this.ctx, { profile, path, forcePath: path })
            const feMEthod = jb.run(srcCtx)
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
        }, `frontEnd-${method}`))
    }
    enrichUserEvent(ev, userEvent) {
        (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => tryWrapper(() => {
            const actionPath = path+'~action'
            const profile = actionPath.split('~').reduce((o,p)=>o[p],jb.comps)
            const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
            Object.assign(userEvent, jb.run( new jb.jbCtx(this.ctx, { vars, profile, path: actionPath })))
        }, 'enrichUserEvent'))
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

// interactive handlers like onmousemove and onkeyXX are handled in the frontEnd with and not varsed to the backend headless widgets
function mountFrontEnd(elem, keepState) {
    new frontEndCmp(elem, keepState)
}

// subscribe for watchable change
ui.subscribeToRefChange(jb.mainWatchableHandler)

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

jb.callbag.subscribe(e=> {
    const {widgetId,destroyLocally,cmps} = e
    if (widgetId && !destroyLocally)
        jb.ui.widgetUserRequests.next({$:'destroy', ...e })
    else 
        cmps.forEach(cmp=>cmp.destroyCtxs.forEach(ctxIdToRun => {
            jb.log('backend method destroy uiComp',{cmp, el: cmp.el})
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun])
        } ))
})(jb.ui.BECmpsDestroyNotification)

})();

(function(){
const ui = jb.ui
let cmpId = 1;
ui.propCounter = 0
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,{ctx: this.ctx}) }}
const lifeCycle = new Set('init,extendCtx,templateModifier,followUp,destroy'.split(','))
const arrayProps = new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,frontEndVar,eventHandler'.split(','))
const singular = new Set('template,calcRenderProps,toolbar,styleParams,calcHash,ctxForPick'.split(','))

Object.assign(jb.ui,{
    cssHashCounter: 0,
    cssHashMap: {},
    hashCss(_cssLines,ctx,{existingClass, cssStyleElem} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
        const classPrefix = widgetId || 'jb-'
        const cssMap = this.cssHashMap[classPrefix] = this.cssHashMap[classPrefix] || {}

        if (!cssMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(cssMap).filter(k=>cssMap[k].classId == existingClass)[0]
                existingKey && delete cssMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}${this.cssHashCounter}`
            cssMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            if (cssStyleElem)
                cssStyleElem.innerText = cssContent
            else
                ui.addStyleElem(ctx,cssContent,widgetId)
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
            const remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
            return remark + cssStyle
        }
    },
})

class JbComponent {
    constructor(ctx,id,ver) {
        this.ctx = ctx // used to calc features
        this.cmpId = id || cmpId++
        this.ver = ver || 1
        this.eventObservables = []
        this.cssLines = []
        this.contexts = []
        this.originators = [ctx]
    }
    init() {
        jb.log('init uiComp',{cmp: this})
        const baseVars = this.ctx.vars
        this.ctx = (this.extendCtxFuncs||[])
            .reduce((acc,extendCtx) => tryWrapper(() => extendCtx(acc,this),'extendCtx'), this.ctx.setVar('cmp',this))
        this.newVars = jb.objFromEntries(jb.entries(this.ctx.vars).filter(([k,v]) => baseVars[k] != v))
        this.renderProps = {}
        this.state = this.ctx.vars.$state
        this.calcCtx = this.ctx.setVar('$props',this.renderProps).setVar('cmp',this)

        this.renderProps.cmpHash = this.calcHash && tryWrapper(() => this.calcHash(this.calcCtx))
        this.initialized = true
        return this.renderProps.cmpHash
    }
 
    calcRenderProps() {
        if (!this.initialized)
            this.init();
        (this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
            .forEach(f =>  tryWrapper(() => f.action(this.calcCtx), 'init'));
   
        this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.isWatchable(obs.ref)) : []
        this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
            if (this.state[e.prop] != undefined) return // we have the value in the state, probably asynch value so do not calc again
            const modelProp = this.ctx.vars.$model[e.prop]
            if (!modelProp)
                return jb.logError('calcRenderProps',`missing model prop "${e.prop}"`, {cmp: this, model: this.ctx.vars.$model, ctx: this.ctx})
            const ref = modelProp(this.ctx)
            if (jb.isWatchable(ref))
                this.toObserve.push({id: e.prop, cmp: this, ref,...e})
            const val = jb.val(ref)
            this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? '' : val))
        })

        ;[...(this.calcProp || []),...(this.method || [])].forEach(p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))
        const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
        filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .forEach(prop=> { 
                const value = jb.val( tryWrapper(() => 
                    prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                `renderProp:${prop.id}`))
                Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
            })
        ;(this.calcProp || []).filter(p => p.userStateProp).forEach(p => this.state[p.id] = this.renderProps[p.id])
        Object.assign(this.renderProps,this.styleParams, this.state)
        return this.renderProps
    }

    renderVdom() {
        jb.log('uiComp start renderVdom', {cmp: this})
        this.calcRenderProps()
        if (this.ctx.probe && this.ctx.probe.outOfTime) return
        this.template = this.template || (() => '')
        const initialVdom = tryWrapper(() => this.template(this,this.renderProps,ui.h), 'template') || {}
        const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                (vd && typeof vd === 'object') ? tryWrapper(() => modifier(vd,this,this.renderProps,ui.h) || vd, 'templateModifier') 
                    : vd ,initialVdom)

        const observe = this.toObserve.map(x=>[
            x.ref.handler.urlOfRef(x.ref),
            x.includeChildren && `includeChildren=${x.includeChildren}`,
            x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`,  
            x.phase && `phase=${x.phase}`].filter(x=>x).join(';')).join(',')
        const methods = (this.method||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx.setVars({cmp: this, $props: this.renderProps, ...this.newVars}))}`).join(',')
        const eventHandlers = (this.eventHandler||[]).map(h=>`${h.event}-${ui.preserveCtx(h.ctx.setVars({cmp: this}))}`).join(',')
        const originators = this.originators.map(ctx=>ui.preserveCtx(ctx)).join(',')
        const userEventProps = (this.userEventProps||[]).join(',')
        const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
        const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, h.value(this.calcCtx)]))
        if (vdom instanceof jb.ui.VNode) {
            vdom.addClass(this.jbCssClass())
            vdom.attributes = Object.assign(vdom.attributes || {}, {
                    'jb-ctx': ui.preserveCtx(this.originatingCtx()),
                    'cmp-id': this.cmpId, 
                    'cmp-ver': this.ver,
                    'cmp-pt': this.ctx.profile.$,
                    'full-cmp-ctx': ui.preserveCtx(this.calcCtx),
                },
                observe && {observe}, 
                methods && {methods}, 
                eventHandlers && {eventHandlers},
                originators && {originators},
                userEventProps && {userEventProps},
                frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                frontEndMethods.length && {interactive : true}, 
                frontEndVars && { $__vars : JSON.stringify(frontEndVars)},
                this.state && { $__state : JSON.stringify(this.state)},
                this.ctxForPick && { 'pick-ctx': ui.preserveCtx(this.ctxForPick) },
                this.renderProps.cmpHash != null && {cmpHash: this.renderProps.cmpHash}
            )
        }
        jb.log('uiComp end renderVdom',{cmp: this, vdom})
        this.afterFirstRendering = true
        return vdom
    }
    renderVdomAndFollowUp() {
        const vdom = this.renderVdom()
        jb.delay(1).then(() => (this.followUpFuncs||[]).forEach(fu=> tryWrapper(() => { 
            jb.log(`backend uiComp followUp`, {cmp: this, fu, srcCtx: fu.srcCtx})
            fu.action(this.calcCtx)
        }, 'followUp') ) ).then(()=> this.ready = true)
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
        return jb.unique(this.css.map(l=> typeof l == 'function' ? l(this.calcCtx): l)
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
            ctxId: ui.preserveCtx(ctx),
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
            console.log('no ctx provided for jbExtend');
        if (typeof _options != 'object')
            debugger;
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

            if (lifeCycle.has(key)) {
                this[key+'Funcs'] = this[key+'Funcs'] || []
                this[key+'Funcs'].push(options[key])
            }
            if (arrayProps.has(key)) {
                this[key] = this[key] || []
                this[key].push(options[key])
            }
            if (singular.has(key))
                this[key] = this[key] || options[key]
        })
        if (options.watchRef) {
            this.watchRef = this.watchRef || []
            this.watchRef.push({cmp: this,...options.watchRef});
        }

        // eventObservables
        this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

        jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
        jb.asArray(ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f), ctx))
        return this;
    }
}

ui.JbComponent = JbComponent

jb.jstypes.renderable = value => {
    if (value == null) return '';
    if (value instanceof ui.VNode) return value;
    if (value instanceof JbComponent) return ui.h(value)
    if (Array.isArray(value))
        return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
    return '' + jb.val(value,true);
}

})();

Object.assign(jb.ui,{
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger
        // block the preview from stealing the studio focus
        const now = new Date().getTime()
        const lastStudioActivity = jb.studio.lastStudioActivity 
          || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity'])
        jb.log('focus request',{srcCtx, logTxt, timeDiff: now - lastStudioActivity, elem,srcCtx})
        if (jb.studio.previewjb == jb && jb.path(jb.frame.parent,'jb.resources.studio.project') != 'studio-helper' && lastStudioActivity && now - lastStudioActivity < 1000)
            return
        jb.delay(1).then(_=> {
          jb.log('focus dom',{elem,srcCtx,logTxt})
          elem.focus()
        })
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    inPreview() {
        try {
            return !jb.ui.inStudio() && jb.frame.parent && jb.frame.parent.jb.studio.initPreview
        } catch(e) {}
    },
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
    renderWidget(profile,topElem) {
      if (!jb.ui.renderWidgetInStudio && jb.path(jb.frame,'parent.jb.ui.renderWidgetInStudio'))
        eval('jb.ui.renderWidgetInStudio= ' + jb.frame.parent.jb.ui.renderWidgetInStudio.toString())
      if (jb.frame.parent != jb.frame && jb.ui.renderWidgetInStudio)
        return jb.ui.renderWidgetInStudio(profile,topElem)
      else
        return jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().run(profile)),topElem)    
    },
    extendWithServiceRegistry(_ctx) {
      const ctx = _ctx || new jb.jbCtx()
      return ctx.setVar('$serviceRegistry',{baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {}})
    },
    //cmpV: cmp => cmp ? `${cmp.cmpId};${cmp.ver}` : '',
    rxPipeName: profile => jb.path(profile,'0.event') + '...'+jb.path(profile,'length')
})

// ***************** inter-cmp services

jb.component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

jb.component('service.registerBackEndService', {
  type: 'data',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true },
    {id: 'service', mandatory: true, dynamic: true },
  ],
  impl: feature.init((ctx,{$serviceRegistry},{id,service}) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('register service',{id: _id, service: _service, ctx: ctx.cmpCtx})
    if ($serviceRegistry.services[_id])
      jb.logError('overridingService',{id: _id, service: $serviceRegistry.services[_id], service: _service,ctx})
    $serviceRegistry.services[_id] = _service
  })
})


// ****************** html utils ***************
Object.assign(jb.ui, {
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
    index: el => Array.from(el.parentNode.children).indexOf(el),
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

jb.objectDiff = function(newObj, orig) {
    if (orig === newObj) return {}
    if (!jb.isObject(orig) || !jb.isObject(newObj)) return newObj
    const deletedValues = Object.keys(orig).reduce((acc, key) =>
        newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: '__undefined'}
    , {})

    return Object.keys(newObj).reduce((acc, key) => {
      if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
      const difference = jb.objectDiff(newObj[key], orig[key])
      if (jb.isObject(difference) && jb.isEmpty(difference)) return acc // return no diff
      return { ...acc, [key]: difference } // return updated key
    }, deletedValues)
}

// ****************** components ****************

jb.component('action.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true },
    {id: 'cmpId', as: 'string', mandatory: true },
  ],
  impl: (ctx,delta,cmpId) => jb.ui.applyDeltaToCmp(delta,ctx,cmpId)
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
    const elem = jb.path(ctx.vars.cmp,'base')
    if (elem)
      return jb.ui.focus(elem,desc,ctx)
    const delta = {attributes: {$focus: desc}}
    jb.ui.applyDeltaToCmp(delta,ctx,cmpId)
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
;

jb.ns('followUp,backEnd')

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
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
  ],
  impl: (ctx,event) => ({eventHandler: {event, ctx}})
})

jb.component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
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
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
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

jb.component('feature.init', {
  type: 'feature',
  category: 'lifecycle',
  description: 'activated before calc properties',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,action,phase) => ({ init: { action, phase }})
})

jb.component('onDestroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
  ],
  impl: method('destroy','%$action()%')
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
    {id: 'value', mandatory: true, dynamic: true},
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
  description: 'runs at the backend a tick after the vdom was returned',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ followUp: { action: ctx2 => ctx.params.action(ctx2), srcCtx: ctx } })
})

jb.component('followUp.flow', {
  type: 'feature',
  description: 'rx flow at the backend after the vdom was sent',
  params: [
      {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: followUp.action(runActions(
      Var('followUpCmp','%$cmp%'),
      Var('pipeToRun', rx.pipe('%$elems()%')),
      Var('followUpStatus', (ctx,{cmp,pipeToRun}) => {
        cmp.followUpStatus = cmp.followUpStatus || {}
        cmp.followUpStatus[ctx.cmpCtx.path] = pipeToRun
      }),
      Var('closingPipe', rx.pipe(
        source.callbag(() => jb.ui.BECmpsDestroyNotification),
        rx.filter( ({data},{followUpCmp}) => data.cmps.find(_cmp => _cmp.cmpId == followUpCmp.cmpId && _cmp.ver == followUpCmp.ver)),
        rx.take(1),
        sink.action(({},{pipeToRun}) => pipeToRun.dispose())
      ))
  ))
})

jb.component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
    {id: 'phase', as: 'number', description: 'controls the order of updates on the same event. default is 0'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}})
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
      rx.var('cmp','%$cmp%'),
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
  impl: followUp.flow(
    source.watchableData('%$ref()%','%$includeChildren%'), 
    sink.action(call('action')))
})

// jb.component('followUp.takeUntilCmpDestroyed', {
//     type: 'rx',
//     category: 'operator',
//     params: [
//       {id: 'cmp' }
//     ],
//     impl: rx.takeUntil(rx.pipe(
//           source.callbag(() => jb.ui.BECmpsDestroyNotification),
//           rx.filter( ({data},{},{cmp}) => data.cmps.find(_cmp => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)),
//           rx.take(1),
//           rx.log('uiComp backend takeUntil destroy', obj(prop('cmp','%$cmp%'))),
//     ))
// })

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
  impl: htmlAttribute('title','%$title%')
})

jb.component('variable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a variable. watchable or passive, local or global',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
  ],
  impl: ({}, name, value, watchable) => ({
    destroy: cmp => {
      if (!watchable) return
      const fullName = name + ':' + cmp.ctx.id;
      cmp.ctx.run(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      if (!watchable)
        return ctx.setVar(name,jb.val(value(ctx)))

      const fullName = name + ':' + cmp.ctx.id;
      if (fullName == 'items') debugger
      jb.log('create watchable var',{cmp,ctx,fullName})
      const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
      jb.writeValue(refToResource,value(ctx),ctx)
      return ctx.setVar(name, refToResource);
    }
  })
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
      rx.merge(
        (ctx,{},{watchRefs}) => watchRefs(ctx).map(ref=>ctx.setData(ref).run(source.watchableData('%%')) )
      ),
      rx.log('check calculatedVar'),
      rx.map('%$value()%'),
      sink.data('%${%$name%}:{%$cmp/cmpId%}%')
    ),
    ctx => ({
      extendCtx: (_ctx,cmp) => {
        const {name,value} = ctx.cmpCtx.params
        const fullName = name + ':' + cmp.cmpId;
        jb.log('create watchable calculatedVar',{ctx,cmp,fullName})
        jb.resource(fullName, jb.val(value(_ctx)));
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
      jb.path(vdom,['attributes','style','display'],jb.toboolean(showCondition(cmp.ctx)) ? 'inherit' : 'none')
      return vdom
    }
  })
})

jb.component('conditionalClass', {
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

jb.component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
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
    {id: 'data' }
  ],
  impl: (ctx, data) => !jb.isWatchable(data) && ctx.vars.cmp.refresh()
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
    {id: 'props', as: 'string', description: 'comma separated props to take from the original event e.g., altKey,ctrlKey' },
  ],
  impl: (ctx, prop) => ({userEventProps: prop })
})
;

jb.ns('rx,key,frontEnd,sink')

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
    description: 'initializes the front end, mount, component did update',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.prop', {
    type: 'feature',
    category: 'front-end',
    description: 'assign front end property (calculated using the limited FE context)',
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
      action: rx.pipe(_ctx => elems(_ctx))
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

// jb.component('frontEnd.updateState', {
//   type: 'rx',
//   category: 'operator',
//   description: 'set state for FE',
//   params: [
//     {id: 'prop', as: 'string', dynamic: true},
//     {id: 'value', dynamic: true},
//   ],
//   impl: rx.do((ctx,{cmp},{prop,value}) => cmp.state[prop(ctx)] = value(ctx))
// })

jb.component('frontEnd.selectionKeySourceService', {
  type: 'feature',
  description: 'assign cmp.selectionKeySource with observable for meta-keys, also stops propagation !!!',
  params: [
    {id: 'autoFocs', as: 'boolean' },
  ],
  impl: features(
    service.registerBackEndService('selectionKeySource', obj(prop('cmpId', '%$cmp/cmpId%'))),
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

(function() {
const withUnits = jb.ui.withUnits
const fixCssLine = jb.ui.fixCssLine

jb.component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: _ctx => fixCssLine(css(_ctx))})
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
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
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
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
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
      .map(x=> `padding-${x}: ${withUnits(ctx.params[x])}`)
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
      .map(x=> `margin-${x}: ${withUnits(ctx.params[x])}`)
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
  impl: (ctx,value,selector) => ({css: `${selector} margin: ${withUnits(value)}`})
})

jb.component('css.marginVerticalHorizontal', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'vertical', as: 'string', mandatory: true},
    {id: 'horizontal', as: 'string', mandatory: true},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,vertical,horizontal,selector) =>
    ({css: `${selector} margin: ${withUnits(vertical)+ ' ' +withUnits(horizontal)}`})
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
  impl: ctx => ({css: `${ctx.params.selector} {transform:translate(${withUnits(ctx.params.x)},${withUnits(ctx.params.y)})}`})
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
    return ({css: `${selector} { box-shadow: ${withUnits(horizontal)} ${withUnits(vertical)} ${withUnits(blurRadius)} ${withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
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
    ({css: `${selector} { border${side?'-'+side:''}: ${withUnits(width)} ${style} ${color} }`})
})

jb.component('css.borderRadius', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'radius', as: 'string', defaultValue: '5'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,radius,selector) => ({css: `${selector} { border-radius: ${withUnits(radius)}}`})
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

;['layout','typography','detailedBorder','detailedColor','gridArea'].forEach(f=>
jb.component(`css.${f}`, {
  type: 'feature:0',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: fixCssLine(css)})
}))


})();

jb.ns('text')

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
    { id: 'propId', defaultValue: 'text'}
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

jb.ns('group,layout,tabs')

jb.component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group.style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp({
    id: 'ctrls',
    value: '%$$model.controls()%'
  })
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
  impl: features(
    () => ({calcHash: ctx => jb.asArray(ctx.vars.$model.controls.profile).reduce((res,prof,i) => {
        if (res) return res
        const found = prof.condition == undefined || ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof.condition,{ as: 'boolean'},`controls~${i}~condition`)
        if (found)
          return i + 1 // avoid index 0
      }, null),
    }),
    calcProp({
        id: 'ctrls',
        value: ctx => {
      const index = ctx.vars.$props.cmpHash-1
      if (isNaN(index)) return []
      const prof = jb.asArray(ctx.vars.$model.controls.profile)[index]
      return [ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof,{type: 'control'},`controls~${index}`)]
     },
        priority: 5
      })
  )
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
  impl: (ctx,condition,ctrl) => condition(ctx) && ctrl(ctx)
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
        Promise.resolve(jb.toSynchArray(ctx.cmpCtx.params.for(),!passRx))
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
    const timesInStack = ctx.callStack().filter(x=>x && x.indexOf(protectedComp) != -1).length
    if (timesInStack > maxDepth)
      return ctx.run( calcProp({id: 'ctrls', value: () => [], phase: 1, priority: 100 }))
  }
})
;

jb.ns('html')

jb.component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'html', dynamic: true},
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
    {id: 'style', type: 'html.style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('html.plain', {
  type: 'html.style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: html, jb_external: true } ),
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

jb.ns('image,css')

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

jb.ns('icon,control')

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
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size')
  ))
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
        $html: `<svg width="24" height="24" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.frame,['MDIcons',icon])}"/></svg>`}),
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
  impl: ctx => ({
    icon: jb.ui.ctrl(ctx, features(
      calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'),
      calcProp('iconPosition','%$$model/position%')
    ))
  })
})

;

jb.ns('button')

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
  impl: ctx => jb.ui.ctrl(ctx, features(
      watchAndCalcModelProp('title'),
      watchAndCalcModelProp('raised'),
      method('onclickHandler', (_ctx,{cmp, ev}) => {
        if (jb.path(ev,'ev.ctrlKey'))
          cmp.runBEMethod('ctrlAction',_ctx.data,_ctx.vars)
        else if (jb.path(ev,'ev.alyKey'))
          cmp.runBEMethod('altAction',_ctx.data,_ctx.vars)
        else
          ctx.params.action(_ctx)
      }),
      feature.userEventProps('ctrlKey,altKey'),
      () => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
    ))
})

jb.component('ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

jb.component('altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

;

(function() {
jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

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
        calcProp('databind','%$$model/databind()%'),
        watchAndCalcModelProp({prop: 'databind', allowSelfRefresh: true})
      ),
    calcProp('title'),
    calcProp({id: 'fieldId', value: () => jb.ui.field_id_counter++}),
    method(
      'writeFieldValue',
      (ctx,{cmp,value},{oneWay}) => writeFieldData(ctx,cmp,value,oneWay)
    ),
    method(
        'onblurHandler',
        (ctx,{cmp, ev},{oneWay}) => writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onchangeHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onkeyupHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    method(
        'onkeydownHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.value,oneWay)
      ),
    // frontEndProp(
    //     'jbModel',
    //     (ctx,{cmp}) => value =>
    //       value == null ? ctx.exp('%$$model/databind%','number') : writeFieldData(ctx,cmp,value,true)
    //   ),
    feature.init((ctx,{$dialog})=> $dialog && ($dialog.hasFields = true))
  )
})

function writeFieldData(ctx,cmp,value,oneWay) {
  if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == value) return
  jb.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx)
  jb.ui.checkValidationError(cmp,value,ctx)
  cmp.hasBEMethod('onValueChange') && cmp.runBEMethod('onValueChange',value,ctx.vars)
  !oneWay && cmp.refresh({},{srcCtx: ctx.cmpCtx})
}

jb.ui.checkValidationError = (cmp,val,ctx) => {
  const err = validationError()
  if (cmp.state.error != err) {
    jb.log('field validation set error state',{cmp,err})
    cmp.refresh({valid: !err, error:err}, {srcCtx: ctx.cmpCtx})
  }

  function validationError() {
    if (!cmp.validations) return;
    const ctx = cmp.ctx.setData(val);
    const err = (cmp.validations || [])
      .filter(validator=>!validator.validCondition(ctx))
      .map(validator=>validator.errorMessage(ctx))[0];
    if (ctx.exp('%$formContainer%'))
      ctx.run(writeValue('%$formContainer/err%',err));
    return err;
  }
}

jb.ui.checkFormValidation = function(elem) {
  jb.ui.find(elem,'[jb-ctx]').map(el=>el._component).filter(cmp => cmp && cmp.validations).forEach(cmp => 
    jb.ui.checkValidationError(cmp,jb.val(cmp.ctx.vars.$model.databind(cmp.ctx)), cmp.ctx))
}

jb.ui.fieldTitle = function(cmp,fieldOrCtrl,h) {
  let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
  field = typeof field === 'function' ? field() : field
	if (field.titleCtrl) {
		const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
		const jbComp = field.titleCtrl(ctx);
		return jbComp && h(jbComp,{'jb-ctx': jb.ui.preserveCtx(ctx) })
	}
	return field.title(cmp.ctx)
}

jb.ui.preserveFieldCtxWithItem = (field,item) => {
	const ctx = jb.ctxDictionary[field.ctxId]
	return ctx && jb.ui.preserveCtx(ctx.setData(item))
}
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
//         jb.subscribe(jb.ui.fromEvent(cmp,'keydown',elem),event=>{
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
})


})();

jb.ns('editableText')

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

jb.ns('editableBoolean')

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
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('toggleText',If('%$$model/databind()%','%$$model/textForTrue()%','%$$model/textForFalse()%' )),
    watchRef({ref: '%$$model/databind()%', allowSelfRefresh: true}),
    method('toggle', runActions(
        writeValue('%$$model/databind()%',not('%$$model/databind()%')),
        refreshIfNotWatchable('%$$model/databind()%')
    )),
    method('toggleByKey', (ctx,{cmp, ev}) => 
      ev.keyCode != 27 && cmp.runBEMethod('toggle')
    ))
  )
})
;

jb.ns('editableNumber')

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

jb.ns('dialog,dialogs')

jb.component('openDialog', {
  type: 'action,has-side-effects',
  params: [
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'content', type: 'control', dynamic: true, templateValue: group()},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
	{id: 'onOK', type: 'action', dynamic: true},
	{id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: runActions(
	Var('$dlg',(ctx,{},{id}) => {
		const dialog = { id: id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
		const ctxWithDialog = ctx.cmpCtx._parent.setVars({
			$dialog: dialog,
			dialogData: {},
			formContainer: { err: ''},
		})
		dialog.ctx = ctxWithDialog
		return dialog
	}),
	dialog.createDialogTopIfNeeded(),
	action.subjectNext(dialogs.changeEmitter(), obj(prop('open',true), prop('dialog','%$$dlg%')))
  )
})

jb.component('openDialog.probe', {
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
		feature.init(writeValue('%$$dialog/cmpId%','%$cmp/cmpId%')),
		htmlAttribute('id','%$$dialog/id%'),

		method('dialogCloseOK', dialog.closeDialog(true)),
		method('dialogClose', dialog.closeDialog(false)),
		css('z-index: 100'),
	)
})

jb.component('dialog.buildComp', {
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
		feature.init(writeValue('%$$dialog/id%','%$id%')),
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
	  feature.init(writeValue('%$$dialog.isPopup%',true)),
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
	impl: () => Object.keys(jb.ui.dlgEmitters).forEach(k=>{
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
		template: ({},{},h) => h('div.jb-dialogs',{},[]),
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

jb.ns('itemlist,itemlistContainer')

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

jb.component('itemlist.initContainerWithItems', {
  type: 'feature',
  category: 'itemlist:20',
  impl: calcProp({
    id: 'updateItemlistCntr',
    value: action.if('%$itemlistCntr%',writeValue('%$itemlistCntr.items%', '%$$props.items%')),
    phase: 100
  })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('visualSizeLimit', ({},{$model,$state}) => Math.max($model.visualSizeLimit,$state.visualSizeLimit ||0)),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('itemsCtxs', (ctx,{$model,$props}) => $props.items.map((item,index) => 
      jb.ui.preserveCtx(ctx.setVars({index}).setVar($model.itemVariable,item).setData(item)))),
    calcProp({
        id: 'ctrls',
        value: (ctx,{$model,$props}) => {
          const controlsOfItem = (item,index) => $model.controls(ctx.setVars({index}).setVar($model.itemVariable,item).setData(item)).filter(x=>x)
          return $props.items.map((item,i)=> controlsOfItem(item,i+1)).filter(x=>x.length > 0)
        }
      }),
    itemlist.initContainerWithItems()
  )
})

// ****************** Selection ******************

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
    css(({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')),
    userStateProp({
      id: 'selected', // selected represented as ctxId of selected data
      phase: 20, // after 'ctrls'
      value: (ctx,{$props,$state},{databind, autoSelectFirst}) => {
        const currentVal = $state.selected && jb.path(jb.ctxDictionary[$state.selected],'data')
        const val = jb.val(jb.val(databind()) || currentVal || (autoSelectFirst && $props.items[0]))
        const itemsCtxs = $props.itemsCtxs || $props.ctrls.map(ctrl=> ctrl[0].ctxId)
        return itemsCtxs.filter(ctxId => jb.val(ctx.run(itemlist.ctxIdToData(() => ctxId))) == val)[0]
      }
    }),
    templateModifier(({},{vdom, selected}) => vdom.querySelectorAll('.jb-item')
        .filter(el => selected == el.getAttribute('jb-ctx'))
        .forEach(el => el.addClass('selected'))
    ),
    method('onSelection', runActionOnItem(itemlist.ctxIdToData(),
      runActions(
        If(isRef('%$databind()%'),writeValue('%$databind()%','%$selectedToDatabind()%')),
        call('onSelection'))
    )),
    method('onDoubleClick', runActionOnItem(itemlist.ctxIdToData(),
      runActions(
        If(isRef('%$databind()%'),writeValue('%$databind()%','%$selectedToDatabind()%')),
        call('onDoubleClick'))
    )),
    followUp.flow(source.data('%$$props/selected%'),
		  rx.filter(and('%$autoSelectFirst%',not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
        .filter(elem=> elem.getAttribute('jb-ctx') == cmp.state.selected)
        .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),

    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('dblclick'), 
      rx.map(itemlist.ctxIdOfElem('%target%')), rx.filter('%%'), 
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
        rx.merge( 
          rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.ctxIdOfElem('%target%')), rx.filter('%%')),
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
    htmlAttribute('tabIndex',0),
    method('onEnter', runActionOnItem(itemlist.ctxIdToData(),call('onEnter'))),
    frontEnd.passSelectionKeySource(),
    frontEnd.prop('onkeydown', rx.merge(
        source.frontEndEvent('keydown'), 
        source.findSelectionKeySource()
      ), 
      frontEnd.addUserEvent(),
      rx.log('itemlist frontend onkeydown')
    ),
    frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==13'), rx.filter('%$cmp.state.selected%'), sink.BEMethod('onEnter','%$cmp.state.selected%') ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40),'%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40',1,-1))), 
      rx.log('itemlist frontend nextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.var('autoFocus','%$autoFocus%'),
    frontEnd.init(If(and('%$autoFocus%','%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus') ))
  )
})

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    method('moveItem', runActions(
      move(itemlist.ctxIdToData('%from%'),itemlist.ctxIdToData('%to%') ),
      action.refreshCmp()
    )),
    frontEnd.prop('drake', ({},{cmp}) => {
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(source.dragulaEvent('drag',list('el')), 
      rx.map(itemlist.ctxIdOfElem('%el%')),
      rx.do(({},{cmp}) => cmp.ctxsOnDrag = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).map(el=>el.getAttribute('jb-ctx'))),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(source.dragulaEvent('drop',list('dropElm','target','source','sibling')), 
      rx.map(obj(
        prop('from', itemlist.ctxIdOfElem('%dropElm%')),
        prop('to', itemlist.ctxIdFromSibling('%sibling%'))
      )),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38,40),'%keyCode%')),
      rx.map(obj(
        prop('from', itemlist.nextSelected(0)),
        prop('to', itemlist.nextSelected(If('%keyCode%==40',1,-1)))
      )),          
      sink.BEMethod('moveItem')
    )
  )
})

jb.component('source.dragulaEvent',{
  type: 'rx:0',
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: "e.g., ['dropElm', 'target', 'source']" }
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) => 
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
})

jb.component('itemlist.ctxIdFromSibling', {
  type: 'data:0',
  params: [
    {id: 'sibling', defaultValue: '%%'}
  ],
  impl: (ctx,sibling) => {
    const ctxs = ctx.vars.cmp.ctxsOnDrag
    const targetIndex = sibling ? jb.ui.index(sibling) : ctxs.length
    return ctxs[targetIndex-1];
  }
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(
    css.class('drag-handle'),
    css('{cursor: pointer}')
  )
})

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

jb.component('itemlist.ctxIdOfElem', {
  type: 'data:0',
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,el) => {
      const itemElem = jb.ui.closest(el,'.jb-item')
      return itemElem && itemElem.getAttribute('jb-ctx')
  }
})

jb.component('itemlist.ctxIdsOfElems', {
  type: 'data:0',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,elem) => jb.asArray(elem).find(el=> {
      const itemElem = jb.ui.closest(el,'.jb-item')
      return itemElem && itemElem.getAttribute('jb-ctx')
  })
})

jb.component('itemlist.ctxIdToData', {
  type: 'data:0',
  params: [
    {id: 'ctxId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,ctxId) => jb.path(jb.ctxDictionary[ctxId],'data')
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
    {id: 'elementFilter', dynamic: 'true', defaultValue: true }
  ],
  impl: (ctx,diff,elementFilter) => {
    const {cmp} = ctx.vars
    const ctxs = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).filter(el=>elementFilter(ctx.setData(el)))
      .map(el=>+el.getAttribute('jb-ctx'))
    const selectedIndex = ctxs.indexOf(+cmp.state.selected) + diff
    return ctxs[Math.min(ctxs.length-1,Math.max(0,selectedIndex))]
  }
});

// jb.component('itemlist.infiniteScroll', {
//   type: 'feature',
//   params: [
//     {id: 'pageSize', as: 'number', defaultValue: 2}
//   ],
//   impl: features(
//     frontEnd.var('pageSize','%$pageSize%'),
//     method('fetchMoreItems', runActions(
//       Var('itemsToAppend', ({data},{$props}) => $props.allItems.slice(data.from,data.from+data.noOfItems)),
//       Var('updateState1', writeValue('%$$state/visualLimit/shownItems%', math.plus('%$$state/visualLimit/shownItems%','%noOfItems%'))),
//       Var('updateState2', writeValue('%$$state/visualLimit/waitingForServer%', false)),
//       Var('delta', itemlist.deltaOfItems('%$itemsToAppend%', '%$$state%')),
//       action.applyDeltaToCmp('%$delta%','%$cmp/cmpId%')
//     )),
//     feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
//     frontEnd.flow(
//       rx.merge(
//         source.frontEndEvent('scroll'),
//         source.frontEndEvent('wheel')
//       ),
//       rx.var('applicative','%target/__appScroll%'),
//       rx.do(({data}) => data.target.__appScroll = null),
//       rx.var('scrollPercentFromTop',({data}) => 
//         (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
//       rx.var('fetchItems', ({},{$state,pageSize}) => ({ 
//         from: $state.visualLimit.shownItems,
//         noOfItems: Math.min($state.visualLimit.totalItems,$state.visualLimit.shownItems + pageSize) - $state.visualLimit.shownItems
//       })),
//       rx.log('itemlist frontend infiniteScroll'),
//       rx.filter(and('%$scrollPercentFromTop%>0.9','%$fetchItems/noOfItems%!=0',not('%$applicative%'),not('%$$state/visualLimit/waitingForServer%'))),
//       rx.do(writeValue('%$$state/visualLimit/waitingForServer%','true')),
//       sink.BEMethod('fetchMoreItems','%$fetchItems%')
//     )
//   )
// })

// jb.component('itemlist.deltaOfItems', {
//   params: [
//     {id: 'items', defaultValue: '%%', as: 'array' },
//     {id: 'newState' }
//   ],
//   impl: (ctx,items,state) => {
//     if (items.length == 0) return null
//     const deltaCalcCtx = ctx.vars.cmp.ctx
//     const vdomWithDeltaItems = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => items}), path: ''}).runItself().renderVdom() // change the profile to return itemsToAppend
//     const delta = {
//         $prevVersion = ctx.vars.cmp.ver,
//         $bySelector: {
//             '.jb-drag-parent': jb.ui.compareVdom({},jb.ui.findIncludeSelf(vdomWithDeltaItems,'.jb-drag-parent')[0]),
//             '': {$__state : JSON.stringify(state), $scrollDown: true }
//     }}
//     return delta
//   }
// })

// jb.component('itemlist.incrementalFromRx', {
//   type: 'feature',
//   params: [
//     {id: 'prepend', as: 'boolean', boolean: 'last at top' }
//   ],
//   impl: followUp.flow(
//       source.callbag(ctx => ctx.exp('%$$props.items%').callbag || jb.callbag.fromIter([])),
//       rx.map(If('%vars%','%data%','%%')), // rx/cb compatible ...
//       rx.var('delta', itemlist.deltaOfItems('%%')),
//       sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
//     )
// })

// jb.component('itemlist.calcSlicedItems', {
//   impl: ctx => {
//     const {$props, $model, cmp} = ctx.vars
//     const firstItem = $props.allItems[0]
//     if (jb.callbag.isCallbag(firstItem)) {
//       const res = []
//       res.callbag = firstItem
//       return res
//     }
//     const slicedItems = addSlicedState(cmp, $props.allItems, $model.visualSizeLimit)
//     const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? 
//         Object.keys(slicedItems).map(i=> jb.objectProperty(slicedItems,i)) : slicedItems
//     return itemsRefs

//     function addSlicedState(cmp,items,visualLimit) {
//       cmp.state.visualLimit = { totalItems: items.length, shownItems: visualLimit }
//       return visualLimit < items.length ? items.slice(0,visualLimit) : items
//     }
//   }
// })

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', runActions(
      Var('delta', itemlist.deltaOfNextPage('%$pageSize%')),
      action.applyDeltaToCmp('%$delta%','%$cmp/cmpId%')
    )),    
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      rx.merge(
        source.frontEndEvent('scroll'),
        source.frontEndEvent('wheel')
      ),
      rx.var('applicative','%target/__appScroll%'),
      rx.do(({data}) => data.target.__appScroll = null),
      rx.var('scrollPercentFromTop',({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.log('itemlist frontend infiniteScroll'),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      rx.filter(not('%$applicative%')),
      sink.BEMethod('fetchNextPage')
    )
  )
})

jb.component('itemlist.deltaOfItems', {
  impl: ctx => {
    const cmp = ctx.vars.cmp
    const newVdom = cmp.renderVdom(), oldVdom = cmp.oldVdom || {}
    const delta = jb.ui.compareVdom(oldVdom,newVdom)
    cmp.oldVdom = newVdom
    jb.log('uiComp itemlist delta incrementalFromRx', {cmp, newVdom, oldVdom, delta})
    return delta
  }
})

jb.component('itemlist.deltaOfNextPage', {
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: (ctx,pageSize) => {
    const $props = ctx.vars.$props, cmp = ctx.vars.cmp, $state = cmp.state
    $state.visualSizeLimit = $state.visualSizeLimit || $props.visualSizeLimit
    const nextPageItems = $props.allItems.slice($state.visualSizeLimit, $state.visualSizeLimit + pageSize)
    $state.visualSizeLimit = $state.visualSizeLimit + nextPageItems.length
    if (nextPageItems.length == 0) return null
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmp.cmpId).setVar('$cmpVer', cmp.ver+1)
    const vdomOfDeltaItems = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => nextPageItems}), path: ''}).runItself().renderVdom() // change the profile to return itemsToAppend
    const delta = {
        $prevVersion: cmp.ver,
        $bySelector: {
            '.jb-drag-parent': jb.ui.compareVdom({},jb.ui.findIncludeSelf(vdomOfDeltaItems,'.jb-drag-parent')[0]),
            ':scope': { attributes: { $scrollDown: true }}
    }}
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
    const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? Object.keys(slicedItems).map(i=> jb.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs
  }
})
;

jb.ns('search')

jb.component('group.itemlistContainer', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature',
  category: 'itemlist:80,group:70',
  params: [
    {id: 'initialSelection', as: 'single'}
  ],
  impl: features(
	feature.serviceRegistey(),
    variable({
        name: 'itemlistCntrData',
        value: {'$': 'object', search_pattern: '', selected: '%$initialSelection%'},
        watchable: true
    }),
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
					jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),(ctx.data || []).length, ctx);
					jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','ref'),resBeforeMaxFilter.length, ctx);
					jb.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length, ctx);
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

jb.ns('menuStyle,menuSeparator,mdc,icon,key')

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
      If('%$opts/length%', list('%$opts%','%$separator%'))
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
      features: menu.selection(true)
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
  params: [
    {id: 'autoSelectFirst', type: 'boolean'}
  ],
  impl: features(
    htmlAttribute('tabIndex',0),
    css('>.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }'),
    calcProp({
      id: 'selected', // selected represented as ctxId of selected data
      phase: 20, // after 'ctrls'
      value: ({},{$props},{autoSelectFirst}) => {
        const itemsCtxs = $props.itemsCtxs || $props.ctrls.map(ctrl=> ctrl[0].ctxId)
        return autoSelectFirst && itemsCtxs[0]
      }
    }),
    templateModifier(({},{vdom, $props}) => vdom.querySelectorAll('.jb-item')
        .filter(el => $props.selected == el.getAttribute('jb-ctx'))
        .forEach(el => el.addClass('selected'))
    ),
    method('closeMenu',dialog.closeDialog()),
    frontEnd.init(({},{cmp,el}) => cmp.state.selected = jb.ui.find(el,'.jb-item,*>.jb-item,*>*>.jb-item')
      .filter(el=>jb.ui.hasClass(el,'selected')).map(el=>+el.getAttribute('jb-ctx'))[0]
    ),
    menu.selectionKeySourceService(),
    menu.passMenuKeySource(),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
        .filter(elem=> elem.getAttribute('jb-ctx') == cmp.state.selected)
        .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
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
      rx.var('ctxId',itemlist.ctxIdOfElem('%$elem%')),
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
      jb.ui.focus(el,'menu.selectionKeySourceService',ctx.cmpCtx)
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
    features: [menu.initMenuOption(), mdc.rippleEffect()]
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
      mdc.rippleEffect(),
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

jb.ns('picklist')

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
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
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
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
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
;

jb.ns('multiSelect')

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
            index != -1 && jb.splice(ref,[[index,1]],ctx)
        }
    }
})

jb.component('multiSelect.choiceList', {
    type: 'multiSelect.style',
    params: [
      {id: 'choiceStyle', type: 'editable-boolean.style', dynamic: true, defaultValue: editableBoolean.checkboxWithTitle()},
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
      --jb-menu-selection-bg: #eee;
      --jb-menu-selection-fg: #111;
      --jb-menu-separator-fg: #888888;
      --jb-menubar-selection-bg: rgba(0, 0, 0, 0.1);
      --jb-menubar-selection-fg: #333333;
      --jb-menubar-active-bg: #dddddd;
      --jb-menubar-active-fg: #333333;
      --jb-menubar-inactive-bg: rgba(221, 221, 221, 0.6);
      --jb-dropdown-bg: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-error-fg: #a1260d;
    
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

jb.ns('slider,mdcStyle')

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
      jb.writeValue($model.databind(),editableNumber.calcDataString(ctx.data,ctx),ctx)
    }),
    method('incIgnoringUnits', (ctx,{editableNumber,$model,$props}) => {
      const curVal = editableNumber.numericPart(jb.val($model.databind()))
      if (curVal === undefined) return
      const nVal = curVal + ctx.data*$props.step
      const newVal = editableNumber.autoScale ? nVal : editableNumber.keepInDomain(nVal)
      jb.writeValue($model.databind(), editableNumber.calcDataString(newVal, ctx),ctx)
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

jb.component('gotoUrl', {
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

jb.ns('divider');

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
    variable({name: 'selectedOption', watchable: true}),
    variable({name: 'watchableInput', watchable: true, value: obj(prop('value','')) }),
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

jb.ns('mdc,mdc-style')

jb.component('mdcStyle.initDynamic', {
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: features(
    frontEnd.init(({},{cmp}) => {
      if (!jb.ui.material) return jb.logError('please load mdc library')
      cmp.mdc_comps = cmp.mdc_comps || []
      const txtElm = jb.ui.findIncludeSelf(cmp.base,'.mdc-text-field')[0]
      if (txtElm) {
        cmp.mdc_comps.push(new jb.ui.material.MDCTextField(txtElm))
        cmp.onValueChange = value => (cmp.mdc_comps||[]).forEach(x=> x.label_ && x.label_.float(!!value))
      } else if (cmp.base.classList.contains('mdc-button') || cmp.base.classList.contains('mdc-fab'))
        cmp.mdc_comps.push(new jb.ui.material.MDCRipple(cmp.base))
      else if (cmp.base.classList.contains('mdc-switch'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSwitch(cmp.base))
      else if (cmp.base.classList.contains('mdc-chip-set'))
        cmp.mdc_comps.push(new jb.ui.material.MDCChipSet(cmp.base))
      else if (cmp.base.classList.contains('mdc-tab-bar'))
        cmp.mdc_comps.push(new jb.ui.material.MDCTabBar(cmp.base))
      else if (cmp.base.classList.contains('mdc-slider'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSlider(cmp.base))
      else if (cmp.base.classList.contains('mdc-select'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSelect(cmp.base))
    }),
    frontEnd.onDestroy(({},{cmp}) => (cmp.mdc_comps || []).forEach(mdc_cmp=>mdc_cmp.destroy()))
  )
})

jb.component('mdc.rippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: ctx => ({
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
    css: '{color: var(--jb-textLink-fg)} .raised { color: var(--jb-textLink-active-fg) }'
  })
})

jb.component('button.hrefText', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-input-fg) ; text-decoration: none }     ~.hover, ~.active: { text-decoration: underline }'
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
  })
})

jb.component('button.native', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}'
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
    features: mdcStyle.initDynamic()
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
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.plainIcon', {
  type: 'button.style',
  impl: customStyle(
    (cmp,{title,raised},h) =>
      jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=> vdom.setAttribute('title',vdom.getAttribute('title') || title))[0]
  )
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
    features: mdcStyle.initDynamic(),
  })
})

jb.component('button.mdcTab', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button',{ class: ['mdc-tab', raised && 'mdc-tab--active'].filter(x=>x).join(' '),tabIndex: -1, role: 'tab', onclick:  true}, [
        h('span.mdc-tab__content',{}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-tab__icon')),
          h('span.mdc-tab__text-label',{},title),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span.mdc-tab__ripple'),
      ]),
    features: mdcStyle.initDynamic()
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

jb.ns('mdc,mdc-style')

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
        variable({name: 'editable', watchable: true}),
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
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
      {?>* { margin-right: %$spacingWithUnits% }?}
    ${ctx.params.spacing ? '>*:last-child { margin-right:0 }' : ''}`),
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

jb.ns('css')

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
      features: variable({name: 'selectedTab', value: 0, watchable: true}),
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
      features: variable({name: 'selectedTab', value: 0, watchable: true})
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

jb.component('group.sectionExpandCollopase', {
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
      features: variable({name: 'sectionExpanded', watchable: true, value: '%$autoExpand%'}),
    }),
    'sectionsModel'
  )
})
;

jb.ns('mdcStyle,table')

jb.component('itemlist.ulLi', {
  type: 'itemlist.style',
  impl: customStyle({
    template: ({},{ctrls,itemsCtxs},h) => h('ul.jb-itemlist jb-drag-parent',{},
        ctrls.map((ctrl,index) => h('li.jb-item', {'jb-ctx': itemsCtxs[index] }, ctrl.map(singleCtrl=>h(singleCtrl))))),
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
    template: ({},{ctrls,itemsCtxs},h) => h('div.jb-itemlist jb-drag-parent',{},
        ctrls.map((ctrl,index) => h('div.jb-item', {'jb-ctx': itemsCtxs[index]}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls,itemsCtxs},h) => h('div.jb-itemlist jb-drag-parent',{},
        ctrls.map((ctrl,index) => h('div.jb-item', {'jb-ctx': itemsCtxs[index]}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})

jb.component('table.plain', {
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  type: 'itemlist.style',
  impl: customStyle({
    template: (cmp,{itemsCtxs,ctrls,hideHeaders,headerFields},h) => h('div.jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
        headerFields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-drag-parent',{},
          ctrls.map((ctrl,index)=> h('tr.jb-item',{ 'jb-ctx': itemsCtxs[index]}, ctrl.map( singleCtrl => h('td',{}, h(singleCtrl)))))),
        itemsCtxs.length == 0 ? 'no items' : ''            
    ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: [
      itemlist.init(), 
      calcProp('headerFields', '%$$model/controls()/field()%')
    ]
  })
})

jb.component('table.mdc', {
  type: 'itemlist.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}    
  ],
  impl: customStyle({
    template: (cmp,{ctrls,itemsCtxs,sortOptions,hideHeaders,classForTable,headerFields},h) => 
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
        h('tbody.jb-drag-parent mdc-data-table__content',{},
            ctrls.map((ctrl,index)=> h('tr.jb-item mdc-data-table__row',{ 'jb-ctx': itemsCtxs[index]}, ctrl.map( singleCtrl => 
              h('td.mdc-data-table__cell', {}, h(singleCtrl)))))),
        itemsCtxs.length == 0 ? 'no items' : ''            
    ])),
    css: `{width: 100%}  
    ~ .mdc-data-table__header-cell, ~ .mdc-data-table__cell {color: var(--jb-fg)}`,
    features: [
      itemlist.init(), mdcStyle.initDynamic(), 
      calcProp('headerFields', '%$$model/controls()/field()%')
    ]
  })
})
;

jb.component('picklist.native', {
  type: 'picklist.style',
  impl: customStyle({
    template: ({},{databind,options},h) => 
      h('select', { value: databind, onchange: true }, options.map(option=>h('option',{value: option.code},option.text))),
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.nativePlus', {
  type: 'picklist.style',
  impl: customStyle({
    template: ({},{databind,options},h) => 
      h('select', { value: databind, onchange: true }, options.map(option=>h('option',{value: option.code},option.text))),
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

  :after { position: absolute;
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
              type: 'radio', name: fieldId, id: i, checked: databind === option.code, value: option.code, onchange: true
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
                  type: 'radio', name: fieldId, id: i, checked: databind === option.code, value: option.code, onchange: true
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
      h('div.mdc-select__anchor',{onclick: true},[
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
          cmp.mdc_comps.forEach(mdcCmp => mdcCmp.listen('MDCSelect:change', () => obs(mdcCmp.value))))),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('writeFieldValue')
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
          databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
          cssForSelected: '%$cssForSelected%'
        }),
        itemlist.keyboardSelection()
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
      features: itemlist.selection({
        databind: '%$picklistModel/databind%',
        selectedToDatabind: '%code%',
        databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
        cssForSelected: '%$cssForSelected%'
      })
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
    template: (cmp,{databind,hasEmptyOption,groups},h) => h('select', { value: databind, onchange: true },
          (hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(option=>h('option',{value: option.code},option.text))
              ))
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
    template: (cmp,state,h) => h('input', { type: 'checkbox', checked: state.databind, onclick: 'toggle', onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithTitle', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{title,databind},h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey'  }), title()]),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithLabel', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{title,databind,fieldId},h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+fieldId,
          checked: databind,
          onchange: 'toggle',
          onkeyup: 'toggleByKey'  },),
        h('label',{for: "switch_"+fieldId },title())
    ]),
    features: field.databind()
  })
})

jb.component('editableBoolean.expandCollapse', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer; }',
    features: field.databind()
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
    template: (cmp,{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title: title(), tabIndex: -1, onclick: 'toggle', onkeyup: 'toggleByKey'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [field.databind(), mdcStyle.initDynamic()]
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
    template: (cmp,{databind,fieldId,toggleText},h) => h('div.mdc-switch',{class: databind ? 'mdc-switch--checked': '' },[
      h('div.mdc-switch__track'),
      h('div.mdc-switch__thumb-underlay',{},
        h('div.mdc-switch__thumb',{},
          h('input.mdc-switch__native-control', { type: 'checkbox', role: 'switch', id: 'switch_' + fieldId,
            checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey' }
      ))),
      h('label',{for: 'switch_' + fieldId},toggleText)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [field.databind(), mdcStyle.initDynamic()]
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
            checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey' }),
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
    {id: 'picklistStyle', type: 'picklist.style', dynamic: true },
  ],
  impl: styleByControl(
    picklist({
      databind: '%$editableBooleanModel/databind%',
      options: list(
        obj(prop('text','%$editableBooleanModel/textForTrue()%'),prop('code',true)),
        obj(prop('text','%$editableBooleanModel/textForFalse()%'),prop('code',false))),
      style: call('picklistStyle'),
    }),
    'editableBooleanModel'
  )
});

jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'},
  ],
  impl: (ctx,profile) => jb.prettyPrint(jb.val(profile),{ ...ctx.params, comps: jb.studio.previewjb.comps})
})

jb.prettyPrintComp = function(compId,comp,settings={}) {
  if (comp) {
    const macroRemark = ''; //` /* ${jb.macroName(compId)} */`
    const res = "jb.component('" + compId + "', " + jb.prettyPrint(comp,settings) + ')'
    const withMacroName = res.replace(/\n/, macroRemark + '\n')
    return withMacroName
  }
}

jb.prettyPrint = function(val,settings = {}) {
  return jb.prettyPrintWithPositions(val,settings).text;
}

jb.prettyPrint.advanceLineCol = function({line,col},text) {
  const noOfLines = (text.match(/\n/g) || '').length
  const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
  return { line: line + noOfLines, col: newCol }
}
jb.prettyPrint.spaces = Array.from(new Array(200)).map(_=>' ').join('');

jb.prettyPrintWithPositions = function(val,{colWidth=120,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
  comps = comps || jb.comps
  if (!val || typeof val !== 'object')
    return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

  const advanceLineCol = jb.prettyPrint.advanceLineCol
  const res = valueToMacro({path: initialPath, line:0, col: 0}, val)
  res.text = res.text.replace(/__fixedNL__/g,'\n')
  return res

  function processList(ctx,items) {
    const res = items.reduce((acc,{prop, item}) => {
      const toAdd = typeof item === 'function' ? item(acc) : item
      const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
      const startPos = advanceLineCol(acc,''), endPos = advanceLineCol(acc,toAddStr)
      const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
      return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
    }, {text: '', map: {}, ...ctx})
    return {...ctx, ...res}
  }

  function joinVals({path, line, col}, innerVals, open, close, flat, isArray) {
    const ctx = {path, line, col}
    const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
    const openResult = processList(ctx,[..._open, {prop: '!open-newline', item: () => newLine()}])
    const arrayOrObj = isArray? 'array' : 'obj'

    const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) =>
      processList(acc,[
        {prop: `!${arrayOrObj}-prefix-${index}`, item: isArray ? '' : fixPropName(innerPath) + ': '},
        {prop: '!value', item: ctx => {
            const ctxWithPath = { ...ctx, path: [path,innerPath].join('~') }
            return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
          }
        },
        {prop: `!${arrayOrObj}-separator-${index}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
      ])
    , {...openResult, unflat: false} )
    const _close = typeof close === 'string' ? [{prop: '!close', item: close}] : close
    const result = processList(beforeClose, [{prop: '!close-newline', item: () => newLine(-1)}, ..._close])

    const unflat = shouldNotFlat(result)
    if ((forceFlat || !unflat) && !flat)
      return joinVals(ctx, innerVals, open, close, true, isArray)
    return {...result, unflat}

    function newLine(offset = 0) {
      return flat ? '' : '\n' + jb.prettyPrint.spaces.slice(0,((path.match(/~/g)||'').length+offset+1)*tabSize)
    }

    function shouldNotFlat(result) {
      const long = result.text.replace(/\n\s*/g,'').split('__fixedNL__')[0].length > colWidth
      if (!jb.studio.valOfPath)
        return result.unflat || long
      const val = jb.studio.valOfPath(path)
      if (path.match(/~params~[0-9]+$/)) return false
      const ctrls = path.match(/~controls$/) && Array.isArray(val) // && innerVals.length > 1// jb.studio.isOfType(path,'control') && !arrayElem
      const customStyle = jb.studio.compNameOfPath && jb.studio.compNameOfPath(path) === 'customStyle'
      const moreThanTwoVals = innerVals.length > 2 && !isArray
      const top = (path.match(/~/g)||'').length < 2
      return result.unflat || customStyle || moreThanTwoVals || top || ctrls || long
    }
    function fixPropName(prop) {
      return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
    }
  }

  function profileToMacro({path, line, col}, profile,flat) {
    const ctx = {path, line, col}

    const id = [jb.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
    const comp = comps[id]
    if (comp)
      jb.fixMacroByValue(profile,comp)
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
    const firstParamIsArray = (params[0] && params[0].type||'').indexOf('[]') != -1
    const vars = Object.keys(profile.$vars || {})
      .map(name => ({innerPath: `$vars~${name}`, val: {$: 'Var', name, val: profile.$vars[name]}}))
    const remark = profile.remark ? [{innerPath: 'remark', val: {$remark: profile.remark}} ] : []
    const systemProps = vars.concat(remark)
    const openProfileByValueGroup = [{prop: '!profile', item: macro}, {prop:'!open-by-value', item:'('}]
    const closeProfileByValueGroup = [{prop:'!close-by-value', item:')'}]
    const openProfileSugarGroup = [{prop: '!profile', item: macro}, {prop:'!open-sugar', item:'('}]
    const closeProfileSugarGroup = [{prop:'!close-sugar', item:')'}]
    const openProfileGroup = [{prop: '!profile', item: macro}, {prop:'!open-profile', item:'({'}]
    const closeProfileGroup = [{prop:'!close-profile', item:'})'}]

    if (params.length == 1 && firstParamIsArray) { // pipeline, or, and, plus
      const args = systemProps.concat(jb.asArray(profile['$'+id] || profile[params[0].id]).map((val,i) => ({innerPath: params[0].id + '~' + i, val})))
      return joinVals(ctx, args, openProfileSugarGroup, closeProfileSugarGroup, flat, true)
    }
    const keys = Object.keys(profile).filter(x=>x != '$')
    const oneFirstArg = keys.length === 1 && params[0] && params[0].id == keys[0]
        //&& (typeof propOfProfile(keys[0]) !== 'object' || Array.isArray(propOfProfile(keys[0])))
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
      return joinVals(ctx, args,openProfileGroup, closeProfileGroup, flat, false)

    function propOfProfile(paramId) {
      const isFirst = params[0] && params[0].id == paramId
      return isFirst && profile['$'+id] || profile[paramId]
    }
  }

  function valueToMacro({path, line, col}, val, flat) {
    const ctx = {path, line, col}
    let result = doValueToMacro()
    if (typeof result === 'string')
      result = { text: result, map: {}}
    return result

    function doValueToMacro() {
      if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
      if (val === null) return 'null';
      if (val === undefined) return 'undefined';
      if (typeof val === 'object') return profileToMacro(ctx, val, flat);
      if (typeof val === 'function') return val.toString().replace(/\n/g,'__fixedNL__')
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
        return JSON.stringify(val); // primitives
    }
  }

  function arrayToMacro({path, line, col}, array, flat) {
    const ctx = {path, line, col}
    const vals = array.map((val,i) => ({innerPath: i, val}))
    const openArray = [{prop:'!open-array', item:'['}]
    const closeArray = [{prop:'!close-array', item:']'}]

    return joinVals(ctx, vals, openArray, closeArray, flat, true)
  }
}

;

(function() {
jb.ns('tree')

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

jb.ns('table-tree,tree')

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
        h('tbody.jb-drag-parent',{},
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
    {id: 'path', as: 'string'}
  ],
  impl: tree.expandPath('%$path%')
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
    frontEnd.onRefresh( (ctx,{cmp}) => cmp.drake.containers = jb.ui.find(cmp.base,'.jb-drag-parent')),
    method('moveItem', (ctx,{$props}) => $props.model.move(ctx.data.from,ctx.data.to,ctx)),
		frontEnd.init( (ctx,{cmp}) => {
        const drake = cmp.drake = dragula([], {
          moves: (el, source, handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle')) && (el.getAttribute('path') || '').match(/[0-9]$/)
        })
        drake.containers = jb.ui.find(cmp.base,'.jb-drag-parent')
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

(function() {
jb.component('tree.jsonReadOnly', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'single', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: (ctx, json, rootPath) => new ROjson(json,rootPath)
})

class ROjson {
	constructor(json,rootPath) {
		this.json = json;
		this.rootPath = rootPath;
	}
	children(path) {
		var val = this.val(path);
		const out = (typeof val == 'object') ? Object.keys(val || {}) : [];
		return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p);
	}
	val(path) {
		if (path.indexOf('~') == -1)
			return jb.val(this.json);
		return jb.val(path.split('~').slice(1).reduce((o,p) =>o[p], this.json))
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
			return h('div',{},prop + ': null');
		if (!collapsed && typeof val == 'object')
			return h('div',{},prop);

		if (typeof val != 'object')
			return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: ''+val},jb.ui.limitStringLength(''+val,20))]);

		return h('div',{},[h('span',{},prop + ': ')].concat(
			Object.keys(val).filter(p=>p.indexOf('$jb_') != 0).filter(p=> ['string','boolean','number'].indexOf(typeof val[p]) != -1)
			.map(p=> h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)))))
	}
}

jb.component('tree.json', {
  type: 'tree.node-model',
  params: [
    {id: 'object', as: 'ref', mandatory: true},
    {id: 'rootPath', as: 'string'}
  ],
  impl: function(ctx, json, rootPath) {
		return new Json(json,rootPath)
	}
})

class Json {
	constructor(jsonRef,rootPath) {
		this.json = jsonRef;
		this.rootPath = rootPath;
		this.refHandler = jb.refHandler(jsonRef)
	}
	children(path) {
		var val = this.val(path);
		const out = (typeof val == 'object') ? Object.keys(val || {}) : [];
		return out.filter(p=>p.indexOf('$jb_') != 0).map(p=>path+'~'+p);
	}
	val(path) {
		if (path.indexOf('~') == -1)
			return jb.val(this.json);
		return jb.val(path.split('~').slice(1).reduce((o,p) =>o[p], jb.val(this.json)))
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
			jb.move(jb.asRef(this.val(dragged)), this.val(target) ? jb.asRef(this.val(target)) : this.extraArrayRef(target) ,ctx)
	}
	extraArrayRef(target) {
		const targetArr = this.val(target.split('~').slice(0,-1).join('~'));
		const targetArrayRef = jb.asRef(targetArr)
		const handler = targetArrayRef.handler
		return handler && handler.refOfPath(handler.pathOfRef(targetArrayRef).concat(target.split('~').slice(-1)))
	}
}

})();

jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data) {
        if (data == null) return
        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return this.stripFunction(data)
        if (data instanceof jb.jbCtx)
             return this.stripCtx(data)
        if (Array.isArray(data))
             return data.map(x=>this.stripData(x))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.stripData(e[1])]))
    },
    stripFunction({profile,runCtx,path, forcePath, param}) {
        if (!profile || !runCtx) return
        const profText = jb.prettyPrint(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path, forcePath, param, profile, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(this.stripCtx(ctx)) },
    deStrip(data) {
        const stripedObj = typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>this.deStrip(x))
        return stripedObj || data
    },
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
}

;

jb.waitFor = jb.waitFor || ((check,interval = 50 ,times = 300) => {
    let count = 0
    return new Promise((resolve,reject) => {
        const toRelease = setInterval(() => {
            count++
            const v = check()
            if (v || count >= times) clearInterval(toRelease)
            if (v) resolve(v)
            if (count >= times) reject('timeout')
        }, interval)
    })
})

jb.remote = {
    servers: {},
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    cbPortFromFrame(frame,from,to) {
        return this.extendPortWithCbHandler(this.portFromFrame(frame,from,to)).initCommandListener()
    },
    portFromFrame(frame,from,to) {
        return {
            from,to,
            postMessage: m => { 
                jb.log(`remote sent from ${from} to ${to}`,{m})
                frame.postMessage({from: from, to: to,...m}) 
            },
            onMessage: { addListener: handler => frame.addEventListener('message', m => {
                jb.log(`remote received at ${from} from ${m.data.from} to ${m.data.to}`,{m: m.data})
                m.data.to == from && handler(m.data)
            })},
            onDisconnect: { addListener: handler => {} }
        }
    },
    extendPortWithCbHandler: port => Object.assign(port, {
        cbHandler: {
            counter: 0,
            map: {},
            newId() { return port.from + ':' + (this.counter++) },
            get(id) { return this.map[id] },
            getAsPromise(id,t) { 
                if (t == 2) this.removeEntry(id)
                    
                return jb.waitFor(()=> this.map[id],5,10).then(cb => {
                    if (!cb)
                        jb.logError('cbLookUp - can not find cb',{id})
                    return cb
                })
            },
            addToLookup(cb) { 
                const id = this.newId()
                this.map[id] = cb
                return id 
            },
            removeEntry(id) {
                jb.delay(100).then(()=> delete this.map[id])
            },
            inboundMsg({cbId,t,d}) { return this.getAsPromise(cbId,t).then(cb=> cb(t, t == 0 ? this.remoteCB(d) : d)) },
            outboundMsg({cbId,t,d}) { 
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d })
                if (t == 2) this.removeEntry(cbId)
            },
            remoteCB(cbId) { return (t,d) => port.postMessage({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : jb.remoteCtx.stripCBVars(d) }) },
            handleCBCommnad(cmd) {
                const {$,sourceId,cbId} = cmd
                const cbElem = jb.remoteCtx.deStrip(cmd.remoteRun)() // actually runs the ctx
                if ($ == 'CB.createSource')
                    this.map[cbId] = cbElem
                else if ($ == 'CB.createOperator')
                    this.map[cbId] = cbElem(this.remoteCB(sourceId) )
            },
        },        
        initCommandListener() {
            this.onMessage.addListener(m => {
                if ((m.$ || '').indexOf('CB.') == 0)
                    this.cbHandler.handleCBCommnad(m)
                else if (m.$ == 'CB')
                    this.cbHandler.inboundMsg(m)
            })
            return this
        },
        createRemoteSource(remoteRun) {
            const cbId = this.cbHandler.newId()
            this.postMessage({$:'CB.createSource', remoteRun, cbId })
            return (t,d) => this.cbHandler.outboundMsg({cbId,t,d})
        },
        createRemoteOperator(remoteRun) {
            return source => {
                const sourceId = this.cbHandler.addToLookup(source)
                const cbId = this.cbHandler.newId()
                this.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                return (t,d) => this.cbHandler.outboundMsg({cbId,t,d})
            }
        },
    })
}

jb.component('remote.worker', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: '1' },
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,id,libs) => {
        const uri = `worker-${id}`
        if (jb.remote.servers[uri]) return jb.remote.servers[uri]
        const distPath = jb.remote.pathOfDistFolder()
        const spyParam = ((jb.path(jb.frame,'location.href')||'').match('[?&]spy=([^&]+)') || ['', ''])[1]
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/!${uri}!${lib}.js')`),`
                //self.uri = '${uri}'
                //self.isWorker = true
                jb.cbLogByPath = {}
                jb.initSpy({spyParam: '${spyParam}'})
                self.spy = jb.spy
                self.portToMaster = jb.remote.cbPortFromFrame(self,'${uri}','master')
            `
        ].join('\n')
        const worker = jb.remote.servers[uri] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.port = jb.remote.cbPortFromFrame(worker,'master',uri)
        worker.uri = uri
        return worker
    }
})

jb.component('remote.local', {
    type: 'remote',
    impl: () => ({ uri: 'local'})
})

jb.component('source.remote', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local() },
    ],
    impl: (ctx,rx,remote) => remote.port ? remote.port.createRemoteSource(jb.remoteCtx.stripFunction(rx)) : rx()
})

jb.component('remote.operator', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local()},
    ],
    impl: (ctx,rx,remote) => remote.port ? remote.port.createRemoteOperator(jb.remoteCtx.stripFunction(rx)) : rx()
});

