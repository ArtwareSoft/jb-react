if (typeof frame == 'undefined')
  frame = typeof self === 'object' ? self : typeof global === 'object' ? global : {};
var jb = (function() {
function jb_run(ctx,parentParam,settings) {
  ctx.profile && log('core request', [ctx.id,...arguments])
  if (ctx.probe && ctx.probe.outOfTime)
    return
  if (jb.ctxByPath) jb.ctxByPath[ctx.path] = ctx
  let res = do_jb_run(...arguments)
  if (ctx.probe && ctx.probe.pathToTrace.indexOf(ctx.path) == 0)
      res = ctx.probe.record(ctx,res) || res
  ctx.profile && log('core result', [ctx.id,res,ctx,parentParam,settings])
  if (typeof res == 'function') assignDebugInfoToFunc(res,ctx)
  return res
}

function do_jb_run(ctx,parentParam,settings) {
  try {
    const profile = ctx.profile;
    if (profile == null || (typeof profile == 'object' && profile.$disabled))
      return castToParam(null,parentParam);

    if (profile.$debugger == 0) debugger;
    if (profile.$asIs) return profile.$asIs;
    if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
        parentParam.as = 'array';

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
      return;
    const ctxWithVars = extendWithVars(ctx,profile.$vars);
    const run = prepare(ctxWithVars,parentParam);
    ctx.parentParam = parentParam;
    switch (run.type) {
      case 'booleanExp': return castToParam(bool_expression(profile, ctx,parentParam), parentParam);
      case 'expression': return castToParam(expression(profile, ctx,parentParam), parentParam);
      case 'asIs': return profile;
      case 'function': return castToParam(profile(ctx,ctx.vars,ctx.componentContext && ctx.componentContext.params),parentParam);
      case 'null': return castToParam(null,parentParam);
      case 'ignore': return ctx.data;
      case 'list': return profile.map((inner,i) => ctxWithVars.runInner(inner,null,i));
      case 'runActions': return jb.comps.runActions.impl(new jbCtx(ctxWithVars,{profile: { actions : profile },path:''}));
      case 'profile':
        if (!run.impl)
          run.ctx.callerPath = ctx.path;

        run.preparedParams.forEach(function prepareParam(paramObj) {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
            case 'array': run.ctx.params[paramObj.name] =
                paramObj.array.map(function prepareParamItem(prof,i) {
                  return jb_run(new jbCtx(run.ctx,{profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param)}) 
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] =
              jb_run(new jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
          }
        })
        let out
        if (profile.$debugger) debugger;
        if (run.impl) {
          const args = [run.ctx, ...run.preparedParams.map(param=>run.ctx.params[param.name])] // TODO : [run.ctx,run.ctx.vars,run.ctx.params]
          out = run.impl.apply(null,args);
        } else {
          out = jb_run(new jbCtx(run.ctx, { componentContext: run.ctx }),parentParam);
        }

        if (profile.$log)
          console.log(profile.$log === true ? out : ctxWithVars.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + ctx.path,ctx,out,run);

        return castToParam(out,parentParam);
    }
  } catch (e) {
//    log('exception', [e && e.message, e, ctx,parentParam,settings])
    if (ctx.vars.$throw) throw e;
    logException(e,'exception while running run',ctx,parentParam,settings);
  }
}

function assignDebugInfoToFunc(func, ctx) {
  func.ctx = ctx
  const debugFuncName = ctx.profile && ctx.profile.$ || typeof ctx.profile == 'string' && ctx.profile.slice(0,10) || ''
  Object.defineProperty(func, 'name', { value: (ctx.path ||'').split('~').pop() + ': ' + debugFuncName })
}

function extendWithVars(ctx,vars) {
  if (!vars) return ctx;
  if (Array.isArray(vars))
    return vars.reduce((_ctx,{name,val}) => _ctx.setVar(name,_ctx.runInner(val || '%%', null,`$vars~${name}`)), ctx )
  let res = ctx;
  for(let varname in vars || {})
    res = new jbCtx(res,{ vars: {[varname]: res.runInner(vars[varname] || '%%', null,'$vars~'+varname)} });
  return res;
}

function compParams(comp) {
  if (!comp || !comp.params)
    return [];
  return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>Object.assign(x[1],{id: x[0]}));
}

function prepareParams(comp_name,comp,profile,ctx) {
  return compParams(comp)
    .filter(param=> !param.ignore)
    .map((param,index) => {
      const p = param.id, sugar = sugarProp(profile);
      let val = profile[p], path =p;
      if (!val && index == 0 && sugar) {
        path = sugar[0];
        val = sugar[1];
      }
      const valOrDefault = val !== undefined ? val : (param.defaultValue !== undefined ? param.defaultValue : null)
      const usingDefault = val === undefined && param.defaultValue !== undefined
      const forcePath = usingDefault && [comp_name, 'params', compParams(comp).indexOf(param), 'defaultValue'].join('~')
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
          //func.profile = val !== undefined ? val : (param.defaultValue !== undefined ? param.defaultValue : null)
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

function fixByValue(profile,comp) {
  if (profile && profile.$byValue) {
    const params = compParams(comp)
    profile.$byValue.forEach((v,i)=> Object.assign(profile,{[params[i].id]: v}))
    delete profile.$byValue
  }
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
//  if (profile_jstype === 'object' && !isArray && entries(profile).filter(p=>p[0].indexOf('$') == 0).length == 0) return { type: 'asIs' };
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
  } else if (profile.$if)
  return {
      type: 'if',
      ifContext: new jbCtx(ctx,{profile: profile.$if || profile.condition, path: '$if'}),
      IfParentParam: { type: 'boolean', as:'boolean' },
      thenContext: new jbCtx(ctx,{profile: profile.then || 0 , path: '~then'}),
      thenParentParam: { type: parentParam_type, as:jstype },
      elseContext: new jbCtx(ctx,{profile: profile['else'] || 0 , path: '~else'}),
      elseParentParam: { type: parentParam_type, as:jstype }
    }
  const comp_name = compName(profile,parentParam);
  if (!comp_name)
    return { type: 'asIs' }
  // if (!comp_name)
  //   return { type: 'ignore' }
  const comp = jb.comps[comp_name];
  if (!comp && comp_name) { logError('component ' + comp_name + ' is not defined', ctx); return { type:'null' } }
  if (!comp.impl) { logError('component ' + comp_name + ' has no implementation', ctx); return { type:'null' } }

  fixByValue(profile,comp)
  const resCtx = Object.assign(new jbCtx(ctx,{}), {parentParam, params: {}})
  const preparedParams = prepareParams(comp_name,comp,profile,resCtx);
  if (typeof comp.impl === 'function') {
    Object.defineProperty(comp.impl, 'name', { value: comp_name }) // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams: preparedParams }
  } else
    return { type:'profile', ctx: new jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
}

function resolveFinishedPromise(val) {
  if (val && typeof val == 'object' && val._state == 1) // finished promise
    return val._result;
  return val;
}

function isRefType(jstype) {
  return jstype === 'ref' || jstype === 'ref[]'
}
function calcVar(ctx,varname,jstype) {
  let res;
  if (ctx.componentContext && ctx.componentContext.params[varname] !== undefined)
    res = ctx.componentContext.params[varname];
  else if (ctx.vars[varname] !== undefined)
    res = ctx.vars[varname]
  else if (ctx.vars.scope && ctx.vars.scope[varname] !== undefined)
    res = ctx.vars.scope[varname]
  else if (jb.resources && jb.resources[varname] !== undefined)
    res = isRefType(jstype) ? jb.mainWatchableHandler.refOfPath([varname]) : jb.resource(varname)
  else if (jb.consts && jb.consts[varname] !== undefined)
    res = isRefType(jstype) ? jb.simpleValueByRefHandler.objectProperty(jb.consts,varname) : res = jb.consts[varname];

  return resolveFinishedPromise(res);
}

function expression(_exp, ctx, parentParam) {
  const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as);
  let exp = '' + _exp;
  if (jstype == 'boolean') return bool_expression(exp, ctx);
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    const out = expression(exp.split('$log:')[1],ctx,parentParam);
    jb.comps.log.impl(ctx, out);
    return out;
  }
  if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp;
  // if (ctx && !ctx.ngMode)
  //   exp = exp.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (exp == '{%%}' || exp == '%%')
      return expPart('');

  if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
    return expPart(exp.substring(2,exp.length-2));

  exp = exp.replace(/{%(.*?)%}/g, (match,contents) => tostring(expPart(contents,{ as: 'string'})))
  exp = exp.replace(/{\?(.*?)\?}/g, (match,contents) => tostring(conditionalExp(contents)))
  if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(exp.substring(1,exp.length-1),parentParam);

  exp = exp.replace(/%([^%;{}\s><"']*)%/g, (match,contents) => tostring(expPart(contents,{as: 'string'})))
  return exp;

  function conditionalExp(exp) {
    // check variable value - if not empty return all exp, otherwise empty
    const match = exp.match(/%([^%;{}\s><"']*)%/);
    if (match && tostring(expPart(match[1])))
      return expression(exp, ctx, { as: 'string' });
    else
      return '';
  }

  function expPart(expressionPart,_parentParam) {
    return resolveFinishedPromise(evalExpressionPart(expressionPart,ctx,_parentParam || parentParam))
  }
}

function evalExpressionPart(expressionPart,ctx,parentParam) {
  const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as);
  // example: %$person.name%.

  const parts = expressionPart.split(/[./[]/)
  return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)

  function pipe(input,subExp,last,first,invokeFunc) {
    if (subExp == '')
       return input;
    if (subExp.match(/]$/))
      subExp = subExp.slice(0,-1)

    const refHandler = jb.objHandler(input)
    const functionCallMatch = subExp.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    if (functionCallMatch && jb.functions[functionCallMatch[1]])
        return tojstype(jb.functions[functionCallMatch[1]](ctx,functionCallMatch[2]),jstype,ctx);
    if (subExp.match(/\(\)$/))
      return pipe(input,subExp.slice(0,-2),last,first,true)
    if (first && subExp.charAt(0) == '$' && subExp.length > 1) {
      const ret = calcVar(ctx,subExp.substr(1),last ? jstype : null)
      return typeof ret === 'function' && invokeFunc ? ret(ctx) : ret
    }
    const obj = val(input)
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
      if (isRefType(jstype)) {
        if (last)
          return refHandler.objectProperty(obj,subExp,ctx);
        if (obj[subExp] === undefined)
          obj[subExp] = implicitlyCreateInnerObject(obj,subExp,refHandler);
      }
      if (last && jstype)
          return jstypes[jstype](obj[subExp]);
      return obj[subExp];
    }
  }
  function implicitlyCreateInnerObject(parent,prop,refHandler) {
    jb.log('core innerObject created',[...arguments]);
    parent[prop] = {};
    refHandler.refreshMapDown && refHandler.refreshMapDown(parent)
    return parent[prop]
  }
}

function bool_expression(exp, ctx, parentParam) {
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    const calculated = expression(exp.split('$log:')[1],ctx,{as: 'boolean'});
    const result = bool_expression(exp.split('$log:')[1], ctx, parentParam);
    jb.comps.log.impl(ctx, calculated + ':' + result);
    return result;
  }
  if (exp.indexOf('!') == 0)
    return !bool_expression(exp.substring(1), ctx);
  const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    const ref = expression(exp, ctx, parentParam)
    if (jb.isRef(ref))
      return ref
    
    const val = jb.tostring(ref);
    if (typeof val == 'boolean') return val;
    const asString = tostring(val);
    return !!asString && asString != 'false';
  }
  if (parts.length != 4)
    return logError('invalid boolean expression: ' + exp, ctx);
  const op = parts[2].trim();

  if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
    const p1 = tostring(expression(trim(parts[1]), ctx, {as: 'string'}))
    let p2 = tostring(expression(trim(parts[3]), ctx, {as: 'string'}))
    p2 = (p2.match(/^["'](.*)["']/) || ['',p2])[1]; // remove quotes
    if (op == '==') return p1 == p2;
    if (op == '!=') return p1 != p2;
    if (op == '^=') return p1.lastIndexOf(p2,0) == 0; // more effecient
    if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1;
  }

  const p1 = tonumber(expression(parts[1].trim(), ctx));
  const p2 = tonumber(expression(parts[3].trim(), ctx));

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {  // trims also " and '
    return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  }
}

function castToParam(value,param) {
  return tojstype(value,param ? param.as : null);
}

function tojstype(value,jstype) {
  if (!jstype) return value;
  if (typeof jstypes[jstype] != 'function') debugger;
  return jstypes[jstype](value);
}

const tostring = value => tojstype(value,'string');
const toarray = value => tojstype(value,'array');
const toboolean = value => tojstype(value,'boolean');
const tosingle = value => tojstype(value,'single');
const tonumber = value => tojstype(value,'number');

const jstypes = {
    asIs: x => x,
    object(value) {
      if (Array.isArray(value))
        value = value[0];
      if (value && typeof value === 'object')
        return val(value);
      return {}
    },
    string(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return '';
      value = val(value);
      if (typeof(value) == 'undefined') return '';
      return '' + value;
    },
    number(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null || value == undefined) return null; // 0 is not null
      const num = Number(val(value),true);
      return isNaN(num) ? null : num;
    },
    array(value) {
      if (typeof value == 'function' && value.profile)
        value = value();
      value = val(value);
      if (Array.isArray(value)) return value;
      if (value == null) return [];
      return [value];
    },
    boolean(value) {
      if (Array.isArray(value)) value = value[0];
      value = val(value);
      return value && value != 'false' ? true : false;
    },
    single(value) {
      if (Array.isArray(value))
        value = value[0];
      return val(value);
    },
    ref(value) {
      if (Array.isArray(value))
        value = value[0];
      return jb.asRef(value);
    },
    'ref[]': function(value) {
      return jb.asRef(value);
    },
    value(value) {
      return val(value);
    }
}

function profileType(profile) {
  if (!profile) return '';
  if (typeof profile == 'string') return 'data';
  const comp_name = compName(profile);
  return (jb.comps[comp_name] && jb.comps[comp_name].type) || '';
}

function sugarProp(profile) {
  return entries(profile)
    .filter(p=>p[0].indexOf('$') == 0 && p[0].length > 1)
    .filter(p=>p[0].indexOf('$jb_') != 0)
    .filter(p=>['$vars','$debugger','$log'].indexOf(p[0]) == -1)[0]
}

function singleInType(profile,parentParam) {
  const _type = parentParam && parentParam.type && parentParam.type.split('[')[0];
  return _type && jb.comps[_type] && jb.comps[_type].singleInType && _type;
}

function compName(profile,parentParam) {
  if (!profile || Array.isArray(profile)) return;
  if (profile.$) return profile.$;
  const f = sugarProp(profile);
  return (f && f[0].slice(1)) || singleInType(profile,parentParam);
}

// give a name to the impl function. Used for tgp debugging
// function assignNameToFunc(name, fn) {
//   Object.defineProperty(fn, "name", { value: name });
//   return fn;
// }

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
      this.componentContext= (typeof ctx2.componentContext != 'undefined') ? ctx2.componentContext : ctx.componentContext;
      this.probe= ctx.probe;
    }
  }
  run(profile,parentParam) {
    return jb_run(new jbCtx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam)
  }
  exp(exp,jstype) { return expression(exp, this, {as: jstype}) }
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
    for(let innerCtx=this; innerCtx; innerCtx = innerCtx.componentContext) 
      ctxStack.push(innerCtx)
    return ctxStack.map(ctx=>ctx.callerPath)
  }
}

const logs = {};

const profileOfPath = path => path.reduce((o,p)=>o && o[p], jb.comps) || {}

const log = (logName, record, options) => jb.spy && jb.spy.log(logName, record, { 
  modifier: record => {
    if (record[1] instanceof jbCtx)
      record.splice(1,0,pathSummary(record[1].path))
    if (record[0] instanceof jbCtx)
      record.splice(0,0,pathSummary(record[0].path))
} , ...options });

function pathSummary(path) {
  if (!path) return ''
  const _path = path.split('~');
  while(!jb.compName(profileOfPath(_path)) && _path.length > 0)
    _path.pop();
	return jb.compName(profileOfPath(_path)) + ': ' + path;
}

function logError() {
  frame.console && frame.console.log('%c Error: ','color: red', ...arguments)
  log('error',[...arguments])
}

function logException(e,errorStr,ctx, ...rest) {
  frame.console && frame.console.log('%c Exception: ','color: red', ...arguments)
  log('exception',[e.stack||'',ctx,errorStr && pathSummary(ctx && ctx.path),e, ...rest])
}

function val(ref) {
  if (ref == null || typeof ref != 'object') return ref;
  const handler = jb.refHandler(ref)
  if (handler)
    return handler.val(ref)
  return ref
}
// Object.getOwnPropertyNames does not keep the order !!!
function entries(obj) {
  if (!obj || typeof obj != 'object') return [];
  let ret = [];
  for(let i in obj) // please do not change. its keeps definition order !!!!
      if (obj.hasOwnProperty && obj.hasOwnProperty(i) && i.indexOf('$jb_') != 0)
        ret.push([i,obj[i]])
  return ret;
}
function objFromEntries(entries) {
  const res = {}
  entries.forEach(e => res[e[0]] = e[1]);
  return res;
}

const simpleValueByRefHandler = {
  val(v) {
    if (v && v.$jb_val) return v.$jb_val();
    return v && v.$jb_parent ? v.$jb_parent[v.$jb_property] : v;
  },
  writeValue(to,value,srcCtx) {
    jb.log('writeValue jbParent',[value,to,srcCtx]);
    if (!to) return;
    if (to.$jb_val)
      to.$jb_val(this.val(value))
    else if (to.$jb_parent)
      to.$jb_parent[to.$jb_property] = this.val(value);
    return to;
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
}

let types = {}, ui = {}, rx = {}, ctxDictionary = {}, testers = {};

return {
  run: jb_run,
  jbCtx, expression, bool_expression, profileType, compName, pathSummary, logs, logError, log, logException, tojstype, jstypes, tostring, toarray, toboolean,tosingle,tonumber,
  types, ui, rx, ctxDictionary, testers, compParams, singleInType, val, entries, objFromEntries, frame, fixByValue,
  ctxCounter: _ => ctxCounter, simpleValueByRefHandler
}

})();

Object.assign(jb,{
  comps: {}, resources: {}, consts: {}, location: Symbol.for('location'), studio: { previewjb: jb },
  removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
  addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,

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
  type: (id,val) => jb.types[id] = val || {},
  resource: (id,val) => { 
    if (typeof val !== 'undefined')
      jb.resources[id] = val
    jb.mainWatchableHandler && jb.mainWatchableHandler.resourceReferred(id)
    return jb.resources[id]
  },
  const: (id,val) => typeof val == 'undefined' ? jb.consts[id] : (jb.consts[id] = val || {}),
  functionDef: (id,val) => jb.functions[id] = val,
// force path - create objects in the path if not exist
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

  // valueByRef API
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
      return jb.logError('invalid ref', ref)
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
  objHandler: obj => obj && jb.refHandler(obj) || jb.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.simpleValueByRefHandler,
  asRef: obj => {
    const watchableHanlder = jb.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
    if (watchableHanlder)
      return watchableHanlder.asRef(obj)
    return jb.simpleValueByRefHandler.asRef(obj)
  },
  writeValue: (ref,value,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.writeValue(ref,value,srcCtx)),
  objectProperty: (obj,prop,srcCtx) => jb.objHandler(obj).objectProperty(obj,prop,srcCtx),
  splice: (ref,args,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
  move: (ref,toRef,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
  push: (ref,toAdd,srcCtx) => !srcCtx.probe && jb.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
  isRef: ref => jb.refHandler(ref),
  isWatchable: () => false, // overriden by the watchable-ref.js (if loaded)
  isValid: ref => jb.safeRefCall(ref, h=>h.isValid(ref)),
  refreshRef: ref => jb.safeRefCall(ref, h=>h.refresh(ref)),
  sessionStorage: (id,val) => val == undefined ? JSON.parse(jb.frame.sessionStorage.getItem(id)) : jb.frame.sessionStorage.setItem(id,JSON.stringify(val)),
  exec: (...args) => new jb.jbCtx().run(...args),
  exp: (...args) => new jb.jbCtx().exp(...args),
  execInStudio: (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.jbCtx().run(...args),
  eval: (str,frame) => { try { return (frame || jb.frame).eval('('+str+')') } catch (e) { return Symbol.for('parseError') } },
  iframeAccessible(iframe) { try { return Boolean(iframe.contentDocument) } catch(e) { return false } },
  addDebugInfo(f,ctx) { f.ctx = ctx; return f}
})

if (typeof self != 'undefined')
  self.jb = jb
if (typeof module != 'undefined')
  module.exports = jb;

Object.assign(jb, {
    macroDef: Symbol('macroDef'), macroNs: {}, 
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => nsIds.split(',').forEach(nsId => jb.registerMacro(nsId + '.$dummyComp', {})),
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
            return true;
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
    }
})
;

jb.component('call', {
  type: 'any',
  params: [
    {id: 'param', as: 'string'}
  ],
  impl: function(context,param) {
 	  const paramObj = context.componentContext && context.componentContext.params[param];
      if (typeof paramObj == 'function')
 		return paramObj(new jb.jbCtx(context, {
 			data: context.data,
 			vars: context.vars,
 			componentContext: context.componentContext.componentContext,
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
      return jb.logError(`can not write to: ${ctx.profile.to}`, ctx)
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
    {id: 'dataArray', as: 'array', defaultValue: []}
  ],
  impl: (ctx,log,array) => jb.log(log,[...array,ctx])
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
			jb.logException(e,'json parse',ctx);
		}
	}
})

jb.component('split', {
  description: 'breaks string using separator',
  type: 'data',
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', description: 'E.g., \",\" or \"<a>\"'},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'part', options: ',first,second,last,but first,but last'}
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
			.catch((e) => jb.logException(e,ctx))
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
			  .catch(e => jb.logException(e,'http.get',ctx) || [])
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
			  .catch(e => jb.logException(e,'http.fetch',ctx) || [])
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
  singleInType: true,
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
  singleInType: true,
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
      
        return function replay(start, sink) {
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
          let talkback
          sinkSrc(0, function subscribe(t, d) {
            if (t === 0) talkback = d
            if (t === 1 && next) next(d)
            if (t === 1 || t === 0) talkback(1)  // Pull
            if (t === 2 && !d && complete) complete()
            if (t === 2 && !!d && error) error( d )
            if (t === 2 && listener.finally) listener.finally( d )
          })
          return () => talkback && talkback(2) // dispose
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
      // talkbackNotifier: notify => source => (start, sink) => {
      //   if (start !== 0) return
      //   let talkback
      //   source(0, function talkbackNotifier(t, d) {
      //     if (t == 0)
      //       talkback = d
      //     sink(0, function talkbackNotifier(t, d) {
      //       if (t == 1 && !d || t == 2) {
      //         notify(t,d)
      //         talkback && talkback(t,d)
      //       }
      //     })
      //     sink(t, d)
      //   })
      // },
      // talkbackSrc: tbSrc => source => (start, sink) => { // generates talkback events in a pipe
      //   if (start !== 0) return
      //   let talkback
      //   source(0, function talkbackSrc(t, d) {
      //     if (t == 0) {
      //       talkback = d
      //       tbSrc(0, function talkbackSrc(t, d) { // d contains talkback type and data
      //         if (t == 1 && d && d.t && talkback)
      //           talkback(d.t,d.d)
      //       })
      //     }
      //     sink(t, d)
      //   })
      // },       
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
        Object.defineProperty(sniffer, 'name', { value: source.name + '-sniffer' })

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
      jbLog: (name,...params) => jb.callbag.Do(x=>jb.log(name,[x,...params])),
}
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
	stackFilter: /spy|jb_spy|Object.log|node_modules/i,
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
		init() {
			const includeLogsFromParam = this.parseLogsList(this.spyParam)
			const excludeLogsFromParam = (this.spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
			this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
				acc[log] = true
				return acc
			}, {})
			this.initialized = true
		},
		shouldLog(logNames, record) {
			return this.spyParam === 'all' || Array.isArray(record) && 
				logNames.split(' ').reduce( (acc,logName)=>acc || this.includeLogs[logName],false)
		},
		log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
			if (!this.initialized) this.init()
			this.updateCounters(logNames)
			if (!this.shouldLog(logNames, _record)) return
			const record = [logNames,..._record]
			record.index = this.logs.length
			record.source = this.source(takeFrom)
			const now = new Date()
			record._time = `${now.getSeconds()}:${now.getMilliseconds()}`
			record.time = now.getTime()
			record.mem = memoryUsage() / 1000000
			record.activeElem = typeof jb != 'undefined' && jb.path && jb.path(jb.frame.document,'activeElement')
			if (record[0] == null && typeof funcTitle === 'function') {
				record[0] = funcTitle()
			}
			if (record[0] == null && record.source) {
				record[0] = record.source[0]
			}
			if (typeof modifier === 'function') {
				modifier(record)
			}
			this.logs.push(record)
			this._obs && this._obs.next({logNames,record})
		},
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const frames = [frame]
			while (frames[0].parent && frames[0] !== frames[0].parent) {
				frames.unshift(frames[0].parent)
			}
			let stackTrace = frames.reverse().filter(f=>jb.iframeAccessible(f)).map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !settings.stackFilter.test(line))
			if (takeFrom) {
				const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
				stackTrace = stackTrace.slice(firstIndex + 1)
			}
			const line = stackTrace[0] || ''
			return [
				line.split(/at |as /).pop().split(/ |]/)[0],
				line.split('/').pop().slice(0, -1).trim(),
				...stackTrace
			]
		},
        
        // browsing methods
		resetParam: spyParam => {
			this.spyParam = spyParam;
			this.includeLogs = null;
		},
		setLogs(logs) {
			if (logs === 'all')
				this.spyParam = 'all'
			this.includeLogs = (logs||'').split(',').reduce((acc,log) => {acc[log] = true; return acc },{})
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
		count(query) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc,	exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), jb.entries(this.counters))) 
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
		search(query) { // dialog core | menu !keyboard  
			const _or = query.split(/,|\|/)
			return _or.reduce((acc,exp) => 
				unify(acc,	exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), this.logs)) 
			,[])

			function filter(set,exp) {
				return (exp[0] == '!') 
					? set.filter(rec=>!rec[0].match(new RegExp(`\\b${exp.slice(1)}\\b`)))
					: set.filter(rec=>rec[0].match(new RegExp(`\\b${exp}\\b`)))
			}
			function unify(set1,set2) {
				let res = [...set1,...set2].sort((x,y) => x.index < y.index)
				return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
			}
	
		},
	}
} 

function initSpyByUrl() {
	const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
	const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
	const spyParam = getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	if (spyParam)
		jb.initSpy({spyParam})
	if (jb.frame) jb.frame.spy = jb.spy // for console use
}
initSpyByUrl()

})()
;

