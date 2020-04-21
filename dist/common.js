const frame = typeof self === 'object' ? self : typeof global === 'object' ? global : {};
const jb = (function() {
function jb_run(ctx,parentParam,settings) {
  log('req', [ctx,parentParam,settings])
  if (ctx.probe && ctx.probe.outOfTime)
    return
  if (jb.ctxByPath) jb.ctxByPath[ctx.path] = ctx
  const res = do_jb_run(...arguments);
  if (ctx.probe && ctx.probe.pathToTrace.indexOf(ctx.path) == 0)
      ctx.probe.record(ctx,res)
  log('res', [ctx,res,parentParam,settings])
  return res;
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
      case 'list': return profile.map((inner,i) =>
            ctxWithVars.runInner(inner,null,i));
      case 'runActions': return jb.comps.runActions.impl(new jbCtx(ctxWithVars,{profile: { actions : profile },path:''}));
      case 'if': {
          const cond = jb_run(run.ifContext, run.IfParentParam);
          if (cond && cond.then)
            return cond.then(res=>
              res ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam))
          return cond ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);
      }
      case 'profile':
        if (!run.impl)
          run.ctx.callerPath = ctx.path;

        run.preparedParams.forEach(paramObj => {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
            case 'array': run.ctx.params[paramObj.name] =
                paramObj.array.map((prof,i) =>
                  jb_run(new jbCtx(run.ctx,{profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param))
                  //run.ctx.runInner(prof, paramObj.param, paramObj.path+'~'+i) )
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] =
              jb_run(new jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
            //run.ctx.runInner(paramObj.prof, paramObj.param, paramObj.path)
            //jb_run(paramObj.ctx, paramObj.param);
          }
        });
        let out;
        if (run.impl) {
          const args = prepareGCArgs(run.ctx,run.preparedParams);
          if (profile.$debugger) debugger;
          if (! args.then)
            out = run.impl.apply(null,args);
          else
            return args.then(args=>
              castToParam(run.impl.apply(null,args),parentParam))
        }
        else {
          out = jb_run(new jbCtx(run.ctx, { componentContext: run.ctx }),parentParam);
        }

        if (profile.$log)
          console.log(profile.$log === true ? out : ctxWithVars.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + ctx.path,ctx,out,run);

        return castToParam(out,parentParam);
    }
  } catch (e) {
//    log('exception', [e && e.message, e, ctx,parentParam,settings])
    logException(e,'exception while running run',ctx,parentParam,settings);
    //if (ctx.vars.$throw) throw e;
  }

  function prepareGCArgs(ctx,preparedParams) {
    const delayed = preparedParams.filter(param => {
      const v = ctx.params[param.name] || {};
      return jb.isDelayed(v) && param.param.as != 'observable'
    });
    if (delayed.length == 0)
      return [ctx, ...preparedParams.map(param=>ctx.params[param.name])]

    const {pipe,concatMap,fromIter,toPromiseArray} = jb.callbag
    return pipe(fromIter(preparedParams), concatMap(param=> ctx.params[param.name]), toPromiseArray)
            .then(ar => [ctx, ...ar])
  }
}

function extendWithVars(ctx,vars) {
  if (!vars) return ctx;
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
            func = (ctx2,data2) =>
              jb.flattenArray(valOrDefaultArray.map((prof,i)=> runCtx.extendVars(ctx2,data2).runInner(prof,param,path+'~'+i)))
          else
            func = (ctx2,data2) => jb_run(new jb.jbCtx(runCtx.extendVars(ctx2,data2),{ profile: valOrDefault, forcePath, path } ),param)

          Object.defineProperty(func, "name", { value: p }); // for debug
          func.profile = val !== undefined ? val : (param.defaultValue !== undefined ? param.defaultValue : null)
          func.srcPath = ctx.path;
          return func;
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
    Object.defineProperty(comp.impl, 'name', { value: comp_name }); // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams: preparedParams }
  } else
    return { type:'profile', ctx: new jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
}

function resolveFinishedPromise(val) {
  if (!val) return val;
  if (val.$jb_parent)
    val.$jb_parent = resolveFinishedPromise(val.$jb_parent);
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

  const parts = expressionPart.split(/[./[]/);
  return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)

  function pipe(input,subExp,last,first) {
    if (subExp == '')
       return input;
    if (subExp.match(/]$/))
      subExp = subExp.slice(0,-1)

    const refHandler = jb.objHandler(input)
    const functionCallMatch = subExp.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    if (functionCallMatch && jb.functions[functionCallMatch[1]])
        return tojstype(jb.functions[functionCallMatch[1]](ctx,functionCallMatch[2]),jstype,ctx);

    if (subExp.match(/\(\)$/)) {
      const func = pipe(input,subExp.slice(0,-2),last,first)
      return typeof func == 'function' ? func(ctx) : func
    }

    if (first && subExp.charAt(0) == '$' && subExp.length > 1)
      return calcVar(ctx,subExp.substr(1),last ? jstype : null)
    const obj = val(input);
    if (subExp == 'length' && obj && typeof obj.length != 'undefined')
      return obj.length;
    if (Array.isArray(obj) && isNaN(Number(subExp)))
      return [].concat.apply([],obj.map(item=>pipe(item,subExp,last,false,refHandler)).filter(x=>x!=null));

    if (input != null && typeof input == 'object') {
      if (obj === null || obj === undefined) return;
      if (typeof obj[subExp] === 'function' && (parentParam && parentParam.dynamic || obj[subExp].profile))
          return obj[subExp](ctx);
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
    jb.log('implicitlyCreateInnerObject',[...arguments]);
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
function assignNameToFunc(name, fn) {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
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
      if (obj.hasOwnProperty(i) && i.indexOf('$jb_') != 0)
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
    jb.log('writeValue',['valueByRefWithjbParent',value,to,srcCtx]);
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
  }
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
      const line = errStack.filter(x=>x && !x.match(/<anonymous>|about:blank|tgp-pretty.js|internal\/modules\/cjs|at jb_initWidget|at Object.ui.renderWidget/)).pop()
      comp[jb.location] = (line.match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3)
    
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
    jb.mainWatchableHandler && jb.mainWatchableHandler.resourceReferred(id);
    return jb.resources[id];
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
  isDelayed: v => {
    if (!v || v.constructor === {}.constructor) return
    else if (typeof v === 'object')
      return Object.prototype.toString.call(v) === "[object Promise]"
    else if (typeof v === 'function')
      return jb.callbag.isCallbag(v)
  },
  toSynchArray: __ar => {
    const ar = jb.asArray(__ar)
    const isSynch = ar.filter(v=> jb.isDelayed(v)).length == 0;
    if (isSynch) return ar;

    const {pipe, fromIter, toPromiseArray, concatMap,flatMap} = jb.callbag
    return pipe(
          fromIter(ar),
          concatMap(x=>x),
          flatMap(v => Array.isArray(v) ? v : [v]),
          toPromiseArray)
  },
  subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),
  unique: (ar,f) => {
    f = f || (x=>x);
    let keys = {}, res = [];
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
  delay: mSec => new Promise(r=>{setTimeout(r,mSec)}),

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
  sessionStorage: (id,val) => val == undefined ? jb.frame.sessionStorage[id] : jb.frame.sessionStorage[id] = val
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

jb.pipe = function(context,ptName) {
	const start = [jb.toarray(context.data)[0]]; // use only one data item, the first or null
	if (typeof context.profile.items == 'string')
		return context.runInner(context.profile.items,null,'items');
	const profiles = jb.asArray(context.profile.items || context.profile[ptName]);
	const innerPath = (context.profile.items && context.profile.items.sugar) ? ''
		: (context.profile[ptName] ? (ptName + '~') : 'items~');

	if (ptName == '$pipe') // promise pipe
		return profiles.reduce((deferred,prof,index) =>
			deferred.then(data=>jb.toSynchArray(data)).then(data=>step(prof,index,data))
    , Promise.resolve(start))
      .then(data=>jb.toSynchArray(data))

	return profiles.reduce((data,prof,index) =>
		step(prof,index,data), start)


	function step(profile,i,data) {
    	if (!profile || profile.$disabled) return data;
		const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (context.parentParam || {}) ;
		if (jb.profileType(profile) == 'aggregator')
			return jb.run( new jb.jbCtx(context, { data: data, profile: profile, path: innerPath+i }), parentParam);
		return [].concat.apply([],data.map(item =>
				jb.run(new jb.jbCtx(context,{data: item, profile: profile, path: innerPath+i}), parentParam))
			.filter(x=>x!=null)
			.map(x=> Array.isArray(jb.val(x)) ? jb.val(x) : x ));
	}
}

jb.component('pipeline', {
  type: 'data',
  description: 'map data arrays one after the other',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true, description: 'click "=" for functions list'}
  ],
  impl: ctx => jb.pipe(ctx,'$pipeline')
})

jb.component('pipe', {
  type: 'data',
  description: 'map asynch data arrays',
  params: [
    {id: 'items', type: 'data,aggregator[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.pipe(ctx,'$pipe')
})

jb.component('data.if', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', mandatory: true, dynamic: true},
    {id: 'else', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,cond,_then,_else) =>	cond() ? _then() : _else()
})

jb.component('action.if', {
  type: 'action',
  description: 'if then else',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'action', mandatory: true, dynamic: true},
    {id: 'else', type: 'action', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
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
  impl: (ctx,items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
})

jb.component('firstSucceeding', {
  type: 'data',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: (ctx,items) => {
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
  impl: (ctx,obj) => Object.keys(obj && typeof obj === 'object' ? obj : {})
})

jb.component('properties', {
  description: 'object entries as id,val',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: (ctx,obj) => Object.keys(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
})

jb.component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: (ctx,obj) => jb.entries(obj)
})

jb.component('aggregate', {
  type: 'aggregator',
  description: 'calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'aggregator', mandatory: true, dynamic: true}
  ],
  impl: (ctx,aggregator) => aggregator()
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
  impl: (ctx,entries) => jb.objFromEntries(entries)
})

jb.component('evalExpression', {
  description: 'evaluate javascript expression',
  type: 'data',
  params: [
    {id: 'expression', as: 'string', defaultValue: '%%', expression: 'e.g. 1+2'}
  ],
  impl: (ctx,expression) => {
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
  impl: (ctx,separator,text) =>
		(text||'').substring(0,text.indexOf(separator))
})

jb.component('suffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (context,separator,text) =>
		(text||'').substring(text.lastIndexOf(separator)+separator.length)
})

jb.component('removePrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (context,separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
})

jb.component('removeSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (context,separator,text) =>
		text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
})

jb.component('removeSuffixRegex', {
  type: 'data',
  params: [
    {id: 'suffix', as: 'string', mandatory: true, description: 'regular expression. e.g [0-9]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: function(context,suffix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp(suffix+'$');
		const m = (text||'').match(context.profile.prefixRegexp);
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
  impl: (ctx,array,item) => array.indexOf(item)
})

jb.component('addToArray', {
  type: 'action',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'toAdd', as: 'array', mandatory: true}
  ],
  impl: (ctx,array,toAdd) => jb.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
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
  impl: function({data},start,end) {
		if (!data || !data.slice) return null;
		return end ? data.slice(start,end) : data.slice(start);
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
  impl: (ctx,items) => items[0]
})

jb.component('last', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,items) => items.slice(-1)[0]
})

jb.component('count', {
  type: 'aggregator',
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,items) => items.length
})

jb.component('reverse', {
  type: 'aggregator',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,items) => items.reverse()
})

jb.component('sample', {
  type: 'aggregator',
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

jb.component('obj', {
  description: 'build object (dictionary) from props',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, sugar: true}
  ],
  impl: (ctx,properties) =>
		jb.objFromEntries(properties.map(p=>[p.title, jb.tojstype(p.val(ctx),p.type)]))
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
  impl: (ctx,properties) =>
		jb.toarray(ctx.data).map((item,i)=>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.title, jb.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
})

jb.component('prop', {
  type: 'prop',
  macroByValue: true,
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array', defaultValue: 'string'}
  ],
  impl: ctx => ctx.params
})

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
  macro: (result, self) =>
		Object.assign(result,{ $vars: Object.assign(result.$vars || {}, { [self.name]: self.val }) })
})

jb.component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'remark', as: 'string', mandatory: true}
  ],
  macro: (result, self) =>
		Object.assign(result,{ remark: self.remark })
})

jb.component('If', {
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', dynamic: true},
    {id: 'Else', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond() ? _then() : _else()
})

jb.component('not', {
  type: 'boolean',
  params: [
    {id: 'of', type: 'boolean', as: 'boolean', mandatory: true, composite: true}
  ],
  impl: (context, of) => !of
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
  impl: (ctx,from,to,val) => val >= from && val <= to
})

jb.component('contains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'string'},
    {id: 'inOrder', defaultValue: true, as: 'boolean', type: 'boolean'}
  ],
  impl: function(context,text,allText,inOrder) {
      let prevIndex = -1;
      for(let i=0;i<text.length;i++) {
      	const newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1);
      	if (newIndex == -1) return false;
      	prevIndex = inOrder ? newIndex : -1;
      }
      return true;
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
  impl: (context,startsWith,text) => text.indexOf(startsWith) == 0
})

jb.component('endsWith', {
  description: 'includes, contains',
  type: 'boolean',
  params: [
    {id: 'endsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: (context,endsWith,text) => text.indexOf(endsWith,text.length-endsWith.length) !== -1
})


jb.component('filter', {
  type: 'aggregator',
  params: [
    {id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (context,filter) =>	jb.toarray(context.data).filter(item =>	filter(context,item))
})

jb.component('matchRegex', {
  description: 'validation with regular expression',
  type: 'boolean',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: 'e.g: [a-zA-Z]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,regex,text) => text.match(new RegExp(regex))
})

jb.component('toUpperCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) =>	text.toUpperCase()
})

jb.component('toLowerCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) =>	text.toLowerCase()
})

jb.component('capitalize', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) =>	text.charAt(0).toUpperCase() + text.slice(1)
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
    {id: 'obj', as: 'single', defaultValue: '%%'}
  ],
  impl: function(context,obj) {
		let out = obj;
		if (typeof GLOBAL != 'undefined' && typeof(obj) == 'object')
			out = JSON.stringify(obj,null," ");
		if (typeof window != 'undefined')
			(window.parent || window).console.log(out);
		else
			console.log(out);
		return out;
	}
})

jb.component('asIs', {
  params: [
    {id: '$asIs', ignore: true}
  ],
  impl: ctx => context.profile.$asIs
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
  impl: (context,value,space) => JSON.stringify(jb.val(value),null,space)
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
  impl: function(context,separator,text,part) {
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
  impl: function(context,find,replace,text,useRegex,regexFlags) {
		if (useRegex) {
			return text.replace(new RegExp(find,regexFlags) ,replace);
		} else
			return text.replace(find,replace);
	}
})

jb.component('touch', {
  description: 'change the value of a watchable variable to acticate its watchers',
  type: 'action',
  params: [
    {id: 'data', as: 'ref'}
  ],
  impl: function(context,data_ref) {
		const val = Number(jb.val(data_ref));
		jb.writeValue(data_ref,val ? val + 1 : 1,ctx);
	}
})

jb.component('isNull', {
  description: 'is null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx, obj) => jb.val(obj) == null
})

jb.component('isEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: (ctx, item) => !item || (Array.isArray(item) && item.length == 0)
})

jb.component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: (ctx, item) => item && !(Array.isArray(item) && item.length == 0)
})

jb.component('equals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: (ctx, item1, item2) => item1 == item2
})

jb.component('notEquals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: (ctx, item1, item2) => item1 != item2
})

jb.component('runActions', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true}
  ],
  impl: ctx => {
		if (!ctx.profile) debugger;
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions']).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
		return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index ))
			,Promise.resolve())
	}
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
		return jb.val(items).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
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
  impl: (ctx,action,delay) =>
		jb.delay(delay,ctx).then(()=>
			action())
})

jb.component('extractPrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: function(context,separator,text,regex,keepSeparator) {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '');
		} else { // regex
			const match = text.match(separator);
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '');
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
  impl: function(context,separator,text,regex,keepSeparator) {
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
  impl: (ctx,from,to) => Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

jb.component('typeOf', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,_obj) => {
	  const obj = jb.val(_obj)
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

jb.component('className', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,_obj) => {
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
  impl: (ctx,_type,_obj) => {
  	const obj = jb.val(_obj);
  	const objType = Array.isArray(obj) ? 'array' : typeof obj;
  	return _type.split(',').indexOf(objType) != -1;
  }
})

jb.component('inGroup', {
  description: 'is in list, contains in array',
  type: 'boolean',
  params: [
    {id: 'group', as: 'array', mandatory: true},
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: (ctx,group,item) =>	group.indexOf(item) != -1
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
  impl: (ctx,obj) => jb.isRef(obj)
})

jb.component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: (ctx,obj) => jb.asRef(obj)
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

jb.exec = (...args) => new jb.jbCtx().run(...args)
jb.execInStudio = (...args) => jb.studio.studioWindow && new jb.studio.studioWindow.jb.jbCtx().run(...args)
jb.exp = (...args) => new jb.jbCtx().exp(...args);

(function() {
const spySettings = { 
	moreLogs: 'req,res,focus,apply,check,suggestions,writeValue,render,createReactClass,renderResult,probe,setState,immutable,pathOfObject,refObservable,scriptChange,resLog,setGridAreaVals,dragableGridItemThumb', 
	groups: {
		watchable: 'doOp,writeValue,removeCmpObservable,registerCmpObservable,notifyCmpObservable,notifyObservableElems,notifyObservableElem,scriptChange',
		react: 'applyDeltaTop,applyDelta,unmount,render,initCmp,refreshReq,refreshElem,childDiffRes,htmlChange,appendChild,removeChild,replaceTop',
		dialog: 'addDialog,closeDialog,refreshDialogs'
	},
	includeLogs: 'exception,error',
	stackFilter: /spy|jb_spy|Object.log|node_modules/i,
    extraIgnoredEvents: [], MAX_LOG_SIZE: 10000
}
const frame = jb.frame
jb.spySettings = spySettings

jb.initSpy = function({Error, settings, spyParam, memoryUsage, resetSpyToNull}) {
	Error = Error || frame.Error,
	memoryUsage = memoryUsage || (() => frame.performance && performance.memory && performance.memory.usedJSHeapSize)
	settings = Object.assign(settings||{}, spySettings)

	const systemProps = ['index', 'time', '_time', 'mem', 'source']

    const isRegex = x => Object.prototype.toString.call(x) === '[object RegExp]'
	const isString = x => typeof x === 'string' || x instanceof String
	if (resetSpyToNull)
		return jb.spy = null
    
    return jb.spy = {
		logs: {},
		spyParam,
		otherSpies: [],
		observable() { 
			const _jb = jb.path(jb,'studio.studiojb') || jb
			this._obs = this._obs || _jb.callbag.subject()
			return this._obs
		},
		enabled: () => true,
		log(logName, record, {takeFrom, funcTitle, modifier} = {}) {
			const init = () => {
				if (!this.initialized) {
					const includeLogsFromParam = (this.spyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
						.flatMap(x=>Object.keys(settings.groups).indexOf(x) == -1 ? [x] : settings.groups[x].split(','))
					const excludeLogsFromParam = (this.spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
					this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
						acc[log] = true
						return acc
					}, {})
				}
				this.initialized = true
			}
			const shouldLog = (logName, record) =>
				this.spyParam === 'all' || Array.isArray(record) && this.includeLogs[logName] && !settings.extraIgnoredEvents.includes(record[0])

			init()
			this.logs[logName] = this.logs[logName] || []
			this.logs.$counters = this.logs.$counters || {}
			this.logs.$counters[logName] = this.logs.$counters[logName] || 0
			this.logs.$counters[logName]++
			if (!shouldLog(logName, record)) {
				return
			}
			this.logs.$index = this.logs.$index || 0
			record.index = this.logs.$index++
			record.source = this.source(takeFrom)
			const now = new Date()
			record._time = `${now.getSeconds()}:${now.getMilliseconds()}`
			record.time = now.getTime()
			record.mem = memoryUsage() / 1000000
			if (this.logs[logName].length > settings.MAX_LOG_SIZE) {
				this.logs[logName] = this.logs[logName].slice(-1 * Math.floor(settings.MAX_LOG_SIZE / 2))
			}
			if (!record[0] && typeof funcTitle === 'function') {
				record[0] = funcTitle()
			}
			if (!record[0] && record.source) {
				record[0] = record.source[0]
			}
			if (typeof modifier === 'function') {
				modifier(record)
			}
			this.logs[logName].push(record)
			this._obs && this._obs.next({logName,record})
		},
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const frames = [frame]
			while (frames[0].parent && frames[0] !== frames[0].parent) {
				frames.unshift(frames[0].parent)
			}
			let stackTrace = frames.reverse().map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
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
			Object.keys(this.logs).forEach(log => delete this.logs[log])
		},
        search(pattern) {
			if (isRegex(pattern)) {
				return this.all(x => pattern.test(x.join(' ')))
			} else if (isString(pattern)) {
				return this.all(x => x.join(' ').indexOf(pattern) !== -1)
			} else if (Number.isInteger(pattern)) {
				return this.all().slice(-1 * pattern)
			}
		},
		all(filter) {
			return [].concat.apply([], Object.keys(this.logs).filter(log => Array.isArray(this.logs[log])).map(module =>
				this.logs[module].map(arr => {
					const res = [arr.index, module, ...arr]
					systemProps.forEach(p => {
						res[p] = arr[p]
					})
					return res
				}))).
				filter((e, i, src) => !filter || filter(e, i, src)).
				sort((x, y) => x.index - y.index)
		}
	}
} 

function initSpyByUrl() {
	const getUrl = () => { try { return frame.location.href } catch(e) {} }
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

