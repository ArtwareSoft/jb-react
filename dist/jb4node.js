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

jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,profile) => jb.prettyPrint(jb.val(profile),ctx.params)
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

jb.prettyPrintWithPositions = function(val,{colWidth=80,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
  comps = comps || jb.comps
  if (!val || typeof val !== 'object')
    return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

  const advanceLineCol = jb.prettyPrint.advanceLineCol
  return valueToMacro({path: initialPath, line:0, col: 0}, val)

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
    return Object.assign(result,{unflat})

    function newLine(offset = 0) {
      return flat ? '' : '\n' + jb.prettyPrint.spaces.slice(0,((path.match(/~/g)||'').length+offset+1)*tabSize)
    }

    function shouldNotFlat(result) {
      const val = jb.studio.valOfPath(path)
      if (path.match(/~params~[0-9]+$/)) return false
      const ctrls = path.match(/~controls$/) && Array.isArray(val) // && innerVals.length > 1// jb.studio.isOfType(path,'control') && !arrayElem
      const customStyle = jb.studio.compNameOfPath && jb.studio.compNameOfPath(path) === 'customStyle'
      const top = (path.match(/~/g)||'').length < 2
      const long = result.text.replace(/\n\s*/g,'').length > colWidth
      return result.unflat || customStyle || top || ctrls || long
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
      jb.fixByValue(profile,comp)
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
    const oneFirstParam = keys.length === 1 && params[0] && params[0].id == keys[0]
        && (typeof propOfProfile(keys[0]) !== 'object' || Array.isArray(propOfProfile(keys[0])))
    if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstParam) {
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
      if (typeof val === 'function') return val.toString();
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

jb.xml = jb.xml || {}

jb.xml.xmlToJson = xml => {
  if (xml.nodeType == 9) // document
    return jb.xml.xmlToJson(xml.firstChild);

    if (Array.from(xml.attributes || []) == 0 && xml.childElementCount == 0)
      return xml.textContent;

    var props =  Array.from(xml.attributes || []).map(att=>({ id: att.name, val: att.value})).concat(
      Array.from(xml.childNodes).filter(x=>x.nodeType == 1).map(child=>({ id: child.tagName, val: jb.xml.xmlToJson(child) }))
    );
    var res = props.reduce((obj,prop)=>{
      if (typeof obj[prop.id] == 'undefined')
        obj[prop.id] = prop.val;
      else if (Array.isArray(obj[prop.id]))
        obj[prop.id].push(prop.val)
      else
          obj[prop.id] = [obj[prop.id]].concat([prop.val])
      return obj
    }, {});
    // check for simple array
    jb.entries(res).forEach(e=>res[e[0]] = flattenArray(e[1]));

    return res;

    function flattenArray(ar) {
      if (!Array.isArray(ar)) return ar;
      var res = jb.unique(ar.map(item=>jb.entries(item).length == 1 ? jb.entries(item)[0][0] : null));
      if (res.length == 1 && res[0])
        return ar.map(item=>jb.entries(item)[0][1])
      return ar;
    }
}
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/misc/pack-jison.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/JSONSelect/src/jsonselect.js":
/*!***************************************************!*\
  !*** ./node_modules/JSONSelect/src/jsonselect.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*! Copyright (c) 2011, Lloyd Hilaiel, ISC License */\n/*\n * This is the JSONSelect reference implementation, in javascript.  This\n * code is designed to run under node.js or in a browser.  In the former\n * case, the \"public API\" is exposed as properties on the `export` object,\n * in the latter, as properties on `window.JSONSelect`.  That API is thus:\n *\n * Selector formating and parameter escaping:\n *\n * Anywhere where a string selector is selected, it may be followed by an\n * optional array of values.  When provided, they will be escaped and\n * inserted into the selector string properly escaped.  i.e.:\n *\n *   .match(':has(?)', [ 'foo' ], {}) \n * \n * would result in the seclector ':has(\"foo\")' being matched against {}.\n *\n * This feature makes dynamically generated selectors more readable.\n *\n * .match(selector, [ values ], object)\n *\n *   Parses and \"compiles\" the selector, then matches it against the object\n *   argument.  Matches are returned in an array.  Throws an error when\n *   there's a problem parsing the selector.\n *\n * .forEach(selector, [ values ], object, callback)\n *\n *   Like match, but rather than returning an array, invokes the provided\n *   callback once per match as the matches are discovered. \n * \n * .compile(selector, [ values ]) \n *\n *   Parses the selector and compiles it to an internal form, and returns\n *   an object which contains the compiled selector and has two properties:\n *   `match` and `forEach`.  These two functions work identically to the\n *   above, except they do not take a selector as an argument and instead\n *   use the compiled selector.\n *\n *   For cases where a complex selector is repeatedly used, this method\n *   should be faster as it will avoid recompiling the selector each time. \n */\n(function(exports) {\n\n    var // localize references\n    toString = Object.prototype.toString;\n\n    function jsonParse(str) {\n      try {\n          if(JSON && JSON.parse){\n              return JSON.parse(str);\n          }\n          return (new Function(\"return \" + str))();\n      } catch(e) {\n        te(\"ijs\", e.message);\n      }\n    }\n\n    // emitted error codes.\n    var errorCodes = {\n        \"bop\":  \"binary operator expected\",\n        \"ee\":   \"expression expected\",\n        \"epex\": \"closing paren expected ')'\",\n        \"ijs\":  \"invalid json string\",\n        \"mcp\":  \"missing closing paren\",\n        \"mepf\": \"malformed expression in pseudo-function\",\n        \"mexp\": \"multiple expressions not allowed\",\n        \"mpc\":  \"multiple pseudo classes (:xxx) not allowed\",\n        \"nmi\":  \"multiple ids not allowed\",\n        \"pex\":  \"opening paren expected '('\",\n        \"se\":   \"selector expected\",\n        \"sex\":  \"string expected\",\n        \"sra\":  \"string required after '.'\",\n        \"uc\":   \"unrecognized char\",\n        \"ucp\":  \"unexpected closing paren\",\n        \"ujs\":  \"unclosed json string\",\n        \"upc\":  \"unrecognized pseudo class\"\n    };\n\n    // throw an error message\n    function te(ec, context) {\n      throw new Error(errorCodes[ec] + ( context && \" in '\" + context + \"'\"));\n    }\n\n    // THE LEXER\n    var toks = {\n        psc: 1, // pseudo class\n        psf: 2, // pseudo class function\n        typ: 3, // type\n        str: 4, // string\n        ide: 5  // identifiers (or \"classes\", stuff after a dot)\n    };\n\n    // The primary lexing regular expression in jsonselect\n    var pat = new RegExp(\n        \"^(?:\" +\n        // (1) whitespace\n        \"([\\\\r\\\\n\\\\t\\\\ ]+)|\" +\n        // (2) one-char ops\n        \"([~*,>\\\\)\\\\(])|\" +\n        // (3) types names\n        \"(string|boolean|null|array|object|number)|\" +\n        // (4) pseudo classes\n        \"(:(?:root|first-child|last-child|only-child))|\" +\n        // (5) pseudo functions\n        \"(:(?:nth-child|nth-last-child|has|expr|val|contains))|\" +\n        // (6) bogusly named pseudo something or others\n        \"(:\\\\w+)|\" +\n        // (7 & 8) identifiers and JSON strings\n        \"(?:(\\\\.)?(\\\\\\\"(?:[^\\\\\\\\\\\\\\\"]|\\\\\\\\[^\\\\\\\"])*\\\\\\\"))|\" +\n        // (8) bogus JSON strings missing a trailing quote\n        \"(\\\\\\\")|\" +\n        // (9) identifiers (unquoted)\n        \"\\\\.((?:[_a-zA-Z]|[^\\\\0-\\\\0177]|\\\\\\\\[^\\\\r\\\\n\\\\f0-9a-fA-F])(?:[_a-zA-Z0-9\\\\-]|[^\\\\u0000-\\\\u0177]|(?:\\\\\\\\[^\\\\r\\\\n\\\\f0-9a-fA-F]))*)\" +\n        \")\"\n    );\n\n    // A regular expression for matching \"nth expressions\" (see grammar, what :nth-child() eats)\n    var nthPat = /^\\s*\\(\\s*(?:([+\\-]?)([0-9]*)n\\s*(?:([+\\-])\\s*([0-9]))?|(odd|even)|([+\\-]?[0-9]+))\\s*\\)/;\n    function lex(str, off) {\n        if (!off) off = 0;\n        var m = pat.exec(str.substr(off));\n        if (!m) return undefined;\n        off+=m[0].length;\n        var a;\n        if (m[1]) a = [off, \" \"];\n        else if (m[2]) a = [off, m[0]];\n        else if (m[3]) a = [off, toks.typ, m[0]];\n        else if (m[4]) a = [off, toks.psc, m[0]];\n        else if (m[5]) a = [off, toks.psf, m[0]];\n        else if (m[6]) te(\"upc\", str);\n        else if (m[8]) a = [off, m[7] ? toks.ide : toks.str, jsonParse(m[8])];\n        else if (m[9]) te(\"ujs\", str);\n        else if (m[10]) a = [off, toks.ide, m[10].replace(/\\\\([^\\r\\n\\f0-9a-fA-F])/g,\"$1\")];\n        return a;\n    }\n\n    // THE EXPRESSION SUBSYSTEM\n\n    var exprPat = new RegExp(\n            // skip and don't capture leading whitespace\n            \"^\\\\s*(?:\" +\n            // (1) simple vals\n            \"(true|false|null)|\" + \n            // (2) numbers\n            \"(-?\\\\d+(?:\\\\.\\\\d*)?(?:[eE][+\\\\-]?\\\\d+)?)|\" +\n            // (3) strings\n            \"(\\\"(?:[^\\\\]|\\\\[^\\\"])*\\\")|\" +\n            // (4) the 'x' value placeholder\n            \"(x)|\" +\n            // (5) binops\n            \"(&&|\\\\|\\\\||[\\\\$\\\\^<>!\\\\*]=|[=+\\\\-*/%<>])|\" +\n            // (6) parens\n            \"([\\\\(\\\\)])\" +\n            \")\"\n    );\n\n    function is(o, t) { return typeof o === t; }\n    var operators = {\n        '*':  [ 9, function(lhs, rhs) { return lhs * rhs; } ],\n        '/':  [ 9, function(lhs, rhs) { return lhs / rhs; } ],\n        '%':  [ 9, function(lhs, rhs) { return lhs % rhs; } ],\n        '+':  [ 7, function(lhs, rhs) { return lhs + rhs; } ],\n        '-':  [ 7, function(lhs, rhs) { return lhs - rhs; } ],\n        '<=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs <= rhs; } ],\n        '>=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs >= rhs; } ],\n        '$=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.lastIndexOf(rhs) === lhs.length - rhs.length; } ],\n        '^=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) === 0; } ],\n        '*=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) !== -1; } ],\n        '>':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs > rhs; } ],\n        '<':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs < rhs; } ],\n        '=':  [ 3, function(lhs, rhs) { return lhs === rhs; } ],\n        '!=': [ 3, function(lhs, rhs) { return lhs !== rhs; } ],\n        '&&': [ 2, function(lhs, rhs) { return lhs && rhs; } ],\n        '||': [ 1, function(lhs, rhs) { return lhs || rhs; } ]\n    };\n\n    function exprLex(str, off) {\n        var v, m = exprPat.exec(str.substr(off));\n        if (m) {\n            off += m[0].length;\n            v = m[1] || m[2] || m[3] || m[5] || m[6];\n            if (m[1] || m[2] || m[3]) return [off, 0, jsonParse(v)];\n            else if (m[4]) return [off, 0, undefined];\n            return [off, v];\n        }\n    }\n\n    function exprParse2(str, off) {\n        if (!off) off = 0;\n        // first we expect a value or a '('\n        var l = exprLex(str, off),\n            lhs;\n        if (l && l[1] === '(') {\n            lhs = exprParse2(str, l[0]);\n            var p = exprLex(str, lhs[0]);\n            if (!p || p[1] !== ')') te('epex', str);\n            off = p[0];\n            lhs = [ '(', lhs[1] ];\n        } else if (!l || (l[1] && l[1] != 'x')) {\n            te(\"ee\", str + \" - \" + ( l[1] && l[1] ));\n        } else {\n            lhs = ((l[1] === 'x') ? undefined : l[2]);\n            off = l[0];\n        }\n\n        // now we expect a binary operator or a ')'\n        var op = exprLex(str, off);\n        if (!op || op[1] == ')') return [off, lhs];\n        else if (op[1] == 'x' || !op[1]) {\n            te('bop', str + \" - \" + ( op[1] && op[1] ));\n        }\n\n        // tail recursion to fetch the rhs expression\n        var rhs = exprParse2(str, op[0]);\n        off = rhs[0];\n        rhs = rhs[1];\n\n        // and now precedence!  how shall we put everything together?\n        var v;\n        if (typeof rhs !== 'object' || rhs[0] === '(' || operators[op[1]][0] < operators[rhs[1]][0] ) {\n            v = [lhs, op[1], rhs];\n        }\n        else {\n            v = rhs;\n            while (typeof rhs[0] === 'object' && rhs[0][0] != '(' && operators[op[1]][0] >= operators[rhs[0][1]][0]) {\n                rhs = rhs[0];\n            }\n            rhs[0] = [lhs, op[1], rhs[0]];\n        }\n        return [off, v];\n    }\n\n    function exprParse(str, off) {\n        function deparen(v) {\n            if (typeof v !== 'object' || v === null) return v;\n            else if (v[0] === '(') return deparen(v[1]);\n            else return [deparen(v[0]), v[1], deparen(v[2])];\n        }\n        var e = exprParse2(str, off ? off : 0);\n        return [e[0], deparen(e[1])];\n    }\n\n    function exprEval(expr, x) {\n        if (expr === undefined) return x;\n        else if (expr === null || typeof expr !== 'object') {\n            return expr;\n        }\n        var lhs = exprEval(expr[0], x),\n            rhs = exprEval(expr[2], x);\n        return operators[expr[1]][1](lhs, rhs);\n    }\n\n    // THE PARSER\n\n    function parse(str, off, nested, hints) {\n        if (!nested) hints = {};\n\n        var a = [], am, readParen;\n        if (!off) off = 0; \n\n        while (true) {\n            var s = parse_selector(str, off, hints);\n            a.push(s[1]);\n            s = lex(str, off = s[0]);\n            if (s && s[1] === \" \") s = lex(str, off = s[0]);\n            if (!s) break;\n            // now we've parsed a selector, and have something else...\n            if (s[1] === \">\" || s[1] === \"~\") {\n                if (s[1] === \"~\") hints.usesSiblingOp = true;\n                a.push(s[1]);\n                off = s[0];\n            } else if (s[1] === \",\") {\n                if (am === undefined) am = [ \",\", a ];\n                else am.push(a);\n                a = [];\n                off = s[0];\n            } else if (s[1] === \")\") {\n                if (!nested) te(\"ucp\", s[1]);\n                readParen = 1;\n                off = s[0];\n                break;\n            }\n        }\n        if (nested && !readParen) te(\"mcp\", str);\n        if (am) am.push(a);\n        var rv;\n        if (!nested && hints.usesSiblingOp) {\n            rv = normalize(am ? am : a);\n        } else {\n            rv = am ? am : a;\n        }\n        return [off, rv];\n    }\n\n    function normalizeOne(sel) {\n        var sels = [], s;\n        for (var i = 0; i < sel.length; i++) {\n            if (sel[i] === '~') {\n                // `A ~ B` maps to `:has(:root > A) > B`\n                // `Z A ~ B` maps to `Z :has(:root > A) > B, Z:has(:root > A) > B`\n                // This first clause, takes care of the first case, and the first half of the latter case.\n                if (i < 2 || sel[i-2] != '>') {\n                    s = sel.slice(0,i-1);\n                    s = s.concat([{has:[[{pc: \":root\"}, \">\", sel[i-1]]]}, \">\"]);\n                    s = s.concat(sel.slice(i+1));\n                    sels.push(s);\n                }\n                // here we take care of the second half of above:\n                // (`Z A ~ B` maps to `Z :has(:root > A) > B, Z :has(:root > A) > B`)\n                // and a new case:\n                // Z > A ~ B maps to Z:has(:root > A) > B\n                if (i > 1) {\n                    var at = sel[i-2] === '>' ? i-3 : i-2;\n                    s = sel.slice(0,at);\n                    var z = {};\n                    for (var k in sel[at]) if (sel[at].hasOwnProperty(k)) z[k] = sel[at][k];\n                    if (!z.has) z.has = [];\n                    z.has.push([{pc: \":root\"}, \">\", sel[i-1]]);\n                    s = s.concat(z, '>', sel.slice(i+1));\n                    sels.push(s);\n                }\n                break;\n            }\n        }\n        if (i == sel.length) return sel;\n        return sels.length > 1 ? [','].concat(sels) : sels[0];\n    }\n\n    function normalize(sels) {\n        if (sels[0] === ',') {\n            var r = [\",\"];\n            for (var i = i; i < sels.length; i++) {\n                var s = normalizeOne(s[i]);\n                r = r.concat(s[0] === \",\" ? s.slice(1) : s);\n            }\n            return r;\n        } else {\n            return normalizeOne(sels);\n        }\n    }\n\n    function parse_selector(str, off, hints) {\n        var soff = off;\n        var s = { };\n        var l = lex(str, off);\n        // skip space\n        if (l && l[1] === \" \") { soff = off = l[0]; l = lex(str, off); }\n        if (l && l[1] === toks.typ) {\n            s.type = l[2];\n            l = lex(str, (off = l[0]));\n        } else if (l && l[1] === \"*\") {\n            // don't bother representing the universal sel, '*' in the\n            // parse tree, cause it's the default\n            l = lex(str, (off = l[0]));\n        }\n\n        // now support either an id or a pc\n        while (true) {\n            if (l === undefined) {\n                break;\n            } else if (l[1] === toks.ide) {\n                if (s.id) te(\"nmi\", l[1]);\n                s.id = l[2];\n            } else if (l[1] === toks.psc) {\n                if (s.pc || s.pf) te(\"mpc\", l[1]);\n                // collapse first-child and last-child into nth-child expressions\n                if (l[2] === \":first-child\") {\n                    s.pf = \":nth-child\";\n                    s.a = 0;\n                    s.b = 1;\n                } else if (l[2] === \":last-child\") {\n                    s.pf = \":nth-last-child\";\n                    s.a = 0;\n                    s.b = 1;\n                } else {\n                    s.pc = l[2];\n                }\n            } else if (l[1] === toks.psf) {\n                if (l[2] === \":val\" || l[2] === \":contains\") {\n                    s.expr = [ undefined, l[2] === \":val\" ? \"=\" : \"*=\", undefined];\n                    // any amount of whitespace, followed by paren, string, paren\n                    l = lex(str, (off = l[0]));\n                    if (l && l[1] === \" \") l = lex(str, off = l[0]);\n                    if (!l || l[1] !== \"(\") te(\"pex\", str);\n                    l = lex(str, (off = l[0]));\n                    if (l && l[1] === \" \") l = lex(str, off = l[0]);\n                    if (!l || l[1] !== toks.str) te(\"sex\", str);\n                    s.expr[2] = l[2];\n                    l = lex(str, (off = l[0]));\n                    if (l && l[1] === \" \") l = lex(str, off = l[0]);\n                    if (!l || l[1] !== \")\") te(\"epex\", str);\n                } else if (l[2] === \":has\") {\n                    // any amount of whitespace, followed by paren\n                    l = lex(str, (off = l[0]));\n                    if (l && l[1] === \" \") l = lex(str, off = l[0]);\n                    if (!l || l[1] !== \"(\") te(\"pex\", str);\n                    var h = parse(str, l[0], true);\n                    l[0] = h[0];\n                    if (!s.has) s.has = [];\n                    s.has.push(h[1]);\n                } else if (l[2] === \":expr\") {\n                    if (s.expr) te(\"mexp\", str);\n                    var e = exprParse(str, l[0]);\n                    l[0] = e[0];\n                    s.expr = e[1];\n                } else {\n                    if (s.pc || s.pf ) te(\"mpc\", str);\n                    s.pf = l[2];\n                    var m = nthPat.exec(str.substr(l[0]));\n                    if (!m) te(\"mepf\", str);\n                    if (m[5]) {\n                        s.a = 2;\n                        s.b = (m[5] === \"odd\") ? 1 : 0;\n                    } else if (m[6]) {\n                        s.a = 0;\n                        s.b = parseInt(m[6], 10);\n                    } else {\n                        s.a = parseInt((m[1] ? m[1] : \"+\") + (m[2] ? m[2] : \"1\"),10);\n                        s.b = m[3] ? parseInt(m[3] + m[4],10) : 0;\n                    }\n                    l[0] += m[0].length;\n                }\n            } else {\n                break;\n            }\n            l = lex(str, (off = l[0]));\n        }\n\n        // now if we didn't actually parse anything it's an error\n        if (soff === off) te(\"se\", str);\n\n        return [off, s];\n    }\n\n    // THE EVALUATOR\n\n    function isArray(o) {\n        return Array.isArray ? Array.isArray(o) : \n          toString.call(o) === \"[object Array]\";\n    }\n\n    function mytypeof(o) {\n        if (o === null) return \"null\";\n        var to = typeof o;\n        if (to === \"object\" && isArray(o)) to = \"array\";\n        return to;\n    }\n\n    function mn(node, sel, id, num, tot) {\n        var sels = [];\n        var cs = (sel[0] === \">\") ? sel[1] : sel[0];\n        var m = true, mod;\n        if (cs.type) m = m && (cs.type === mytypeof(node));\n        if (cs.id)   m = m && (cs.id === id);\n        if (m && cs.pf) {\n            if (cs.pf === \":nth-last-child\") num = tot - num;\n            else num++;\n            if (cs.a === 0) {\n                m = cs.b === num;\n            } else {\n                mod = ((num - cs.b) % cs.a);\n\n                m = (!mod && ((num*cs.a + cs.b) >= 0));\n            }\n        }\n        if (m && cs.has) {\n            // perhaps we should augment forEach to handle a return value\n            // that indicates \"client cancels traversal\"?\n            var bail = function() { throw 42; };\n            for (var i = 0; i < cs.has.length; i++) {\n                try {\n                    forEach(cs.has[i], node, bail);\n                } catch (e) {\n                    if (e === 42) continue;\n                }\n                m = false;\n                break;\n            }\n        }\n        if (m && cs.expr) {\n            m = exprEval(cs.expr, node);\n        }\n        // should we repeat this selector for descendants?\n        if (sel[0] !== \">\" && sel[0].pc !== \":root\") sels.push(sel);\n\n        if (m) {\n            // is there a fragment that we should pass down?\n            if (sel[0] === \">\") { if (sel.length > 2) { m = false; sels.push(sel.slice(2)); } }\n            else if (sel.length > 1) { m = false; sels.push(sel.slice(1)); }\n        }\n\n        return [m, sels];\n    }\n\n    function forEach(sel, obj, fun, id, num, tot) {\n        var a = (sel[0] === \",\") ? sel.slice(1) : [sel],\n        a0 = [],\n        call = false,\n        i = 0, j = 0, k, x;\n        for (i = 0; i < a.length; i++) {\n            x = mn(obj, a[i], id, num, tot);\n            if (x[0]) {\n                call = true;\n            }\n            for (j = 0; j < x[1].length; j++) {\n                a0.push(x[1][j]);\n            }\n        }\n        if (a0.length && typeof obj === \"object\") {\n            if (a0.length >= 1) {\n                a0.unshift(\",\");\n            }\n            if (isArray(obj)) {\n                for (i = 0; i < obj.length; i++) {\n                    forEach(a0, obj[i], fun, undefined, i, obj.length);\n                }\n            } else {\n                for (k in obj) {\n                    if (obj.hasOwnProperty(k)) {\n                        forEach(a0, obj[k], fun, k);\n                    }\n                }\n            }\n        }\n        if (call && fun) {\n            fun(obj);\n        }\n    }\n\n    function match(sel, obj) {\n        var a = [];\n        forEach(sel, obj, function(x) {\n            a.push(x);\n        });\n        return a;\n    }\n\n    function format(sel, arr) {\n        sel = sel.replace(/\\?/g, function() {\n            if (arr.length === 0) throw \"too few parameters given\";\n            var p = arr.shift();\n            return ((typeof p === 'string') ? JSON.stringify(p) : p);\n        });\n        if (arr.length) throw \"too many parameters supplied\";\n        return sel;\n    } \n\n    function compile(sel, arr) {\n        if (arr) sel = format(sel, arr);\n        return {\n            sel: parse(sel)[1],\n            match: function(obj){\n                return match(this.sel, obj);\n            },\n            forEach: function(obj, fun) {\n                return forEach(this.sel, obj, fun);\n            }\n        };\n    }\n\n    exports._lex = lex;\n    exports._parse = parse;\n    exports.match = function (sel, arr, obj) {\n        if (!obj) { obj = arr; arr = undefined; }\n        return compile(sel, arr).match(obj);\n    };\n    exports.forEach = function(sel, arr, obj, fun) {\n        if (!fun) { fun = obj;  obj = arr; arr = undefined }\n        return compile(sel, arr).forEach(obj, fun);\n    };\n    exports.compile = compile;\n})( false ? (undefined) : exports);\n\n\n//# sourceURL=webpack:///./node_modules/JSONSelect/src/jsonselect.js?");

/***/ }),

/***/ "./node_modules/ebnf-parser/ebnf-parser.js":
/*!*************************************************!*\
  !*** ./node_modules/ebnf-parser/ebnf-parser.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var bnf = __webpack_require__(/*! ./parser */ \"./node_modules/ebnf-parser/parser.js\").parser,\n    ebnf = __webpack_require__(/*! ./ebnf-transform */ \"./node_modules/ebnf-parser/ebnf-transform.js\"),\n    jisonlex = __webpack_require__(/*! lex-parser */ \"./node_modules/lex-parser/lex-parser.js\");\n\nexports.parse = function parse (grammar) { return bnf.parse(grammar); };\nexports.transform = ebnf.transform;\n\n// adds a declaration to the grammar\nbnf.yy.addDeclaration = function (grammar, decl) {\n    if (decl.start) {\n        grammar.start = decl.start;\n\n    } else if (decl.lex) {\n        grammar.lex = parseLex(decl.lex);\n\n    } else if (decl.operator) {\n        if (!grammar.operators) grammar.operators = [];\n        grammar.operators.push(decl.operator);\n\n    } else if (decl.parseParam) {\n        if (!grammar.parseParams) grammar.parseParams = [];\n        grammar.parseParams = grammar.parseParams.concat(decl.parseParam);\n\n    } else if (decl.include) {\n        if (!grammar.moduleInclude) grammar.moduleInclude = '';\n        grammar.moduleInclude += decl.include;\n\n    } else if (decl.options) {\n        if (!grammar.options) grammar.options = {};\n        for (var i=0; i < decl.options.length; i++) {\n            grammar.options[decl.options[i]] = true;\n        }\n    }\n\n};\n\n// parse an embedded lex section\nvar parseLex = function (text) {\n    return jisonlex.parse(text.replace(/(?:^%lex)|(?:\\/lex$)/g, ''));\n};\n\n\n\n//# sourceURL=webpack:///./node_modules/ebnf-parser/ebnf-parser.js?");

/***/ }),

/***/ "./node_modules/ebnf-parser/ebnf-transform.js":
/*!****************************************************!*\
  !*** ./node_modules/ebnf-parser/ebnf-transform.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var EBNF = (function(){\n    var parser = __webpack_require__(/*! ./transform-parser.js */ \"./node_modules/ebnf-parser/transform-parser.js\");\n\n    var transformExpression = function(e, opts, emit) {\n        var type = e[0], value = e[1], name = false;\n\n        if (type === 'xalias') {\n            type = e[1];\n            value = e[2]\n            name = e[3];\n            if (type) {\n                e = e.slice(1,2);\n            } else {\n                e = value;\n                type = e[0];\n                value = e[1];\n            }\n        }\n\n        if (type === 'symbol') {\n            var n;\n            if (e[1][0] === '\\\\') n = e[1][1];\n            else if (e[1][0] === '\\'') n = e[1].substring(1, e[1].length-1);\n            else n = e[1];\n            emit(n + (name ? \"[\"+name+\"]\" : \"\"));\n        } else if (type === \"+\") {\n            if (!name) {\n                name = opts.production + \"_repetition_plus\" + opts.repid++;\n            }\n            emit(name);\n\n            opts = optsForProduction(name, opts.grammar);\n            var list = transformExpressionList([value], opts);\n            opts.grammar[name] = [\n                [list, \"$$ = [$1];\"],\n                [\n                    name + \" \" + list,\n                    \"$1.push($2);\"\n                ]\n            ];\n        } else if (type === \"*\") {\n            if (!name) {\n                name = opts.production + \"_repetition\" + opts.repid++;\n            }\n            emit(name);\n\n            opts = optsForProduction(name, opts.grammar);\n            opts.grammar[name] = [\n                [\"\", \"$$ = [];\"],\n                [\n                    name + \" \" + transformExpressionList([value], opts),\n                    \"$1.push($2);\"\n                ]\n            ];\n        } else if (type ===\"?\") {\n            if (!name) {\n                name = opts.production + \"_option\" + opts.optid++;\n            }\n            emit(name);\n\n            opts = optsForProduction(name, opts.grammar);\n            opts.grammar[name] = [\n                \"\", transformExpressionList([value], opts)\n            ];\n        } else if (type === \"()\") {\n            if (value.length == 1) {\n                emit(transformExpressionList(value[0], opts));\n            } else {\n                if (!name) {\n                    name = opts.production + \"_group\" + opts.groupid++;\n                }\n                emit(name);\n\n                opts = optsForProduction(name, opts.grammar);\n                opts.grammar[name] = value.map(function(handle) {\n                    return transformExpressionList(handle, opts);\n                });\n            }\n        }\n    };\n\n    var transformExpressionList = function(list, opts) {\n        return list.reduce (function (tot, e) {\n            transformExpression (e, opts, function (i) { tot.push(i); });\n            return tot;\n        }, []).\n        join(\" \");\n    };\n\n    var optsForProduction = function(id, grammar) {\n        return {\n            production: id,\n            repid: 0,\n            groupid: 0,\n            optid: 0,\n            grammar: grammar\n        };\n    };\n\n    var transformProduction = function(id, production, grammar) {\n        var transform_opts = optsForProduction(id, grammar);\n        return production.map(function (handle) {\n            var action = null, opts = null;\n            if (typeof(handle) !== 'string')\n                action = handle[1],\n                opts = handle[2],\n                handle = handle[0];\n            var expressions = parser.parse(handle);\n\n            handle = transformExpressionList(expressions, transform_opts);\n\n            var ret = [handle];\n            if (action) ret.push(action);\n            if (opts) ret.push(opts);\n            if (ret.length == 1) return ret[0];\n            else return ret;\n        });\n    };\n\n    var transformGrammar = function(grammar) {\n        Object.keys(grammar).forEach(function(id) {\n            grammar[id] = transformProduction(id, grammar[id], grammar);\n        });\n    };\n\n    return {\n        transform: function (ebnf) {\n            transformGrammar(ebnf);\n            return ebnf;\n        }\n    };\n})();\n\nexports.transform = EBNF.transform;\n\n\n\n//# sourceURL=webpack:///./node_modules/ebnf-parser/ebnf-transform.js?");

/***/ }),

/***/ "./node_modules/ebnf-parser/parser.js":
/*!********************************************!*\
  !*** ./node_modules/ebnf-parser/parser.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.11 */\n/*\n  Returns a Parser object of the following structure:\n\n  Parser: {\n    yy: {}\n  }\n\n  Parser.prototype: {\n    yy: {},\n    trace: function(),\n    symbols_: {associative list: name ==> number},\n    terminals_: {associative list: number ==> name},\n    productions_: [...],\n    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n    table: [...],\n    defaultActions: {...},\n    parseError: function(str, hash),\n    parse: function(input),\n\n    lexer: {\n        EOF: 1,\n        parseError: function(str, hash),\n        setInput: function(input),\n        input: function(),\n        unput: function(str),\n        more: function(),\n        less: function(n),\n        pastInput: function(),\n        upcomingInput: function(),\n        showPosition: function(),\n        test_match: function(regex_match_array, rule_index),\n        next: function(),\n        lex: function(),\n        begin: function(condition),\n        popState: function(),\n        _currentRules: function(),\n        topState: function(),\n        pushState: function(condition),\n\n        options: {\n            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n        },\n\n        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n        rules: [...],\n        conditions: {associative list: name ==> set},\n    }\n  }\n\n\n  token location info (@$, _$, etc.): {\n    first_line: n,\n    last_line: n,\n    first_column: n,\n    last_column: n,\n    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n  }\n\n\n  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n    text:        (matched text)\n    token:       (the produced terminal token, if any)\n    line:        (yylineno)\n  }\n  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n    loc:         (yylloc)\n    expected:    (string describing the set of expected tokens)\n    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n  }\n*/\nvar bnf = (function(){\nvar parser = {trace: function trace() { },\nyy: {},\nsymbols_: {\"error\":2,\"spec\":3,\"declaration_list\":4,\"%%\":5,\"grammar\":6,\"optional_end_block\":7,\"EOF\":8,\"CODE\":9,\"declaration\":10,\"START\":11,\"id\":12,\"LEX_BLOCK\":13,\"operator\":14,\"ACTION\":15,\"parse_param\":16,\"options\":17,\"OPTIONS\":18,\"token_list\":19,\"PARSE_PARAM\":20,\"associativity\":21,\"LEFT\":22,\"RIGHT\":23,\"NONASSOC\":24,\"symbol\":25,\"production_list\":26,\"production\":27,\":\":28,\"handle_list\":29,\";\":30,\"|\":31,\"handle_action\":32,\"handle\":33,\"prec\":34,\"action\":35,\"expression_suffix\":36,\"handle_sublist\":37,\"expression\":38,\"suffix\":39,\"ALIAS\":40,\"ID\":41,\"STRING\":42,\"(\":43,\")\":44,\"*\":45,\"?\":46,\"+\":47,\"PREC\":48,\"{\":49,\"action_body\":50,\"}\":51,\"ARROW_ACTION\":52,\"action_comments_body\":53,\"ACTION_BODY\":54,\"$accept\":0,\"$end\":1},\nterminals_: {2:\"error\",5:\"%%\",8:\"EOF\",9:\"CODE\",11:\"START\",13:\"LEX_BLOCK\",15:\"ACTION\",18:\"OPTIONS\",20:\"PARSE_PARAM\",22:\"LEFT\",23:\"RIGHT\",24:\"NONASSOC\",28:\":\",30:\";\",31:\"|\",40:\"ALIAS\",41:\"ID\",42:\"STRING\",43:\"(\",44:\")\",45:\"*\",46:\"?\",47:\"+\",48:\"PREC\",49:\"{\",51:\"}\",52:\"ARROW_ACTION\",54:\"ACTION_BODY\"},\nproductions_: [0,[3,5],[3,6],[7,0],[7,1],[4,2],[4,0],[10,2],[10,1],[10,1],[10,1],[10,1],[10,1],[17,2],[16,2],[14,2],[21,1],[21,1],[21,1],[19,2],[19,1],[6,1],[26,2],[26,1],[27,4],[29,3],[29,1],[32,3],[33,2],[33,0],[37,3],[37,1],[36,3],[36,2],[38,1],[38,1],[38,3],[39,0],[39,1],[39,1],[39,1],[34,2],[34,0],[25,1],[25,1],[12,1],[35,3],[35,1],[35,1],[35,0],[50,0],[50,1],[50,5],[50,4],[53,1],[53,2]],\nperformAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {\n/* this == yyval */\n\nvar $0 = $$.length - 1;\nswitch (yystate) {\ncase 1:\n          this.$ = $$[$0-4];\n          return extend(this.$, $$[$0-2]);\n        \nbreak;\ncase 2:\n          this.$ = $$[$0-5];\n          yy.addDeclaration(this.$, { include: $$[$0-1] });\n          return extend(this.$, $$[$0-3]);\n        \nbreak;\ncase 5:this.$ = $$[$0-1]; yy.addDeclaration(this.$, $$[$0]);\nbreak;\ncase 6:this.$ = {};\nbreak;\ncase 7:this.$ = {start: $$[$0]};\nbreak;\ncase 8:this.$ = {lex: $$[$0]};\nbreak;\ncase 9:this.$ = {operator: $$[$0]};\nbreak;\ncase 10:this.$ = {include: $$[$0]};\nbreak;\ncase 11:this.$ = {parseParam: $$[$0]};\nbreak;\ncase 12:this.$ = {options: $$[$0]};\nbreak;\ncase 13:this.$ = $$[$0];\nbreak;\ncase 14:this.$ = $$[$0];\nbreak;\ncase 15:this.$ = [$$[$0-1]]; this.$.push.apply(this.$, $$[$0]);\nbreak;\ncase 16:this.$ = 'left';\nbreak;\ncase 17:this.$ = 'right';\nbreak;\ncase 18:this.$ = 'nonassoc';\nbreak;\ncase 19:this.$ = $$[$0-1]; this.$.push($$[$0]);\nbreak;\ncase 20:this.$ = [$$[$0]];\nbreak;\ncase 21:this.$ = $$[$0];\nbreak;\ncase 22:\n            this.$ = $$[$0-1];\n            if ($$[$0][0] in this.$) \n                this.$[$$[$0][0]] = this.$[$$[$0][0]].concat($$[$0][1]);\n            else\n                this.$[$$[$0][0]] = $$[$0][1];\n        \nbreak;\ncase 23:this.$ = {}; this.$[$$[$0][0]] = $$[$0][1];\nbreak;\ncase 24:this.$ = [$$[$0-3], $$[$0-1]];\nbreak;\ncase 25:this.$ = $$[$0-2]; this.$.push($$[$0]);\nbreak;\ncase 26:this.$ = [$$[$0]];\nbreak;\ncase 27:\n            this.$ = [($$[$0-2].length ? $$[$0-2].join(' ') : '')];\n            if($$[$0]) this.$.push($$[$0]);\n            if($$[$0-1]) this.$.push($$[$0-1]);\n            if (this.$.length === 1) this.$ = this.$[0];\n        \nbreak;\ncase 28:this.$ = $$[$0-1]; this.$.push($$[$0])\nbreak;\ncase 29:this.$ = [];\nbreak;\ncase 30:this.$ = $$[$0-2]; this.$.push($$[$0].join(' '));\nbreak;\ncase 31:this.$ = [$$[$0].join(' ')];\nbreak;\ncase 32:this.$ = $$[$0-2] + $$[$0-1] + \"[\" + $$[$0] + \"]\"; \nbreak;\ncase 33:this.$ = $$[$0-1] + $$[$0]; \nbreak;\ncase 34:this.$ = $$[$0]; \nbreak;\ncase 35:this.$ = ebnf ? \"'\" + $$[$0] + \"'\" : $$[$0]; \nbreak;\ncase 36:this.$ = '(' + $$[$0-1].join(' | ') + ')'; \nbreak;\ncase 37:this.$ = ''\nbreak;\ncase 41:this.$ = {prec: $$[$0]};\nbreak;\ncase 42:this.$ = null;\nbreak;\ncase 43:this.$ = $$[$0];\nbreak;\ncase 44:this.$ = yytext;\nbreak;\ncase 45:this.$ = yytext;\nbreak;\ncase 46:this.$ = $$[$0-1];\nbreak;\ncase 47:this.$ = $$[$0];\nbreak;\ncase 48:this.$ = '$$ =' + $$[$0] + ';';\nbreak;\ncase 49:this.$ = '';\nbreak;\ncase 50:this.$ = '';\nbreak;\ncase 51:this.$ = $$[$0];\nbreak;\ncase 52:this.$ = $$[$0-4] + $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];\nbreak;\ncase 53:this.$ = $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];\nbreak;\ncase 54: this.$ = yytext; \nbreak;\ncase 55: this.$ = $$[$0-1]+$$[$0]; \nbreak;\n}\n},\ntable: [{3:1,4:2,5:[2,6],11:[2,6],13:[2,6],15:[2,6],18:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6]},{1:[3]},{5:[1,3],10:4,11:[1,5],13:[1,6],14:7,15:[1,8],16:9,17:10,18:[1,13],20:[1,12],21:11,22:[1,14],23:[1,15],24:[1,16]},{6:17,12:20,26:18,27:19,41:[1,21]},{5:[2,5],11:[2,5],13:[2,5],15:[2,5],18:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5]},{12:22,41:[1,21]},{5:[2,8],11:[2,8],13:[2,8],15:[2,8],18:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{5:[2,9],11:[2,9],13:[2,9],15:[2,9],18:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,10],11:[2,10],13:[2,10],15:[2,10],18:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{5:[2,11],11:[2,11],13:[2,11],15:[2,11],18:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{5:[2,12],11:[2,12],13:[2,12],15:[2,12],18:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{12:25,19:23,25:24,41:[1,21],42:[1,26]},{12:25,19:27,25:24,41:[1,21],42:[1,26]},{12:25,19:28,25:24,41:[1,21],42:[1,26]},{41:[2,16],42:[2,16]},{41:[2,17],42:[2,17]},{41:[2,18],42:[2,18]},{5:[1,30],7:29,8:[2,3]},{5:[2,21],8:[2,21],12:20,27:31,41:[1,21]},{5:[2,23],8:[2,23],41:[2,23]},{28:[1,32]},{5:[2,45],11:[2,45],13:[2,45],15:[2,45],18:[2,45],20:[2,45],22:[2,45],23:[2,45],24:[2,45],28:[2,45],30:[2,45],31:[2,45],41:[2,45],42:[2,45],49:[2,45],52:[2,45]},{5:[2,7],11:[2,7],13:[2,7],15:[2,7],18:[2,7],20:[2,7],22:[2,7],23:[2,7],24:[2,7]},{5:[2,15],11:[2,15],12:25,13:[2,15],15:[2,15],18:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15],25:33,41:[1,21],42:[1,26]},{5:[2,20],11:[2,20],13:[2,20],15:[2,20],18:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20],41:[2,20],42:[2,20]},{5:[2,43],11:[2,43],13:[2,43],15:[2,43],18:[2,43],20:[2,43],22:[2,43],23:[2,43],24:[2,43],30:[2,43],31:[2,43],41:[2,43],42:[2,43],49:[2,43],52:[2,43]},{5:[2,44],11:[2,44],13:[2,44],15:[2,44],18:[2,44],20:[2,44],22:[2,44],23:[2,44],24:[2,44],30:[2,44],31:[2,44],41:[2,44],42:[2,44],49:[2,44],52:[2,44]},{5:[2,14],11:[2,14],12:25,13:[2,14],15:[2,14],18:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14],25:33,41:[1,21],42:[1,26]},{5:[2,13],11:[2,13],12:25,13:[2,13],15:[2,13],18:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13],25:33,41:[1,21],42:[1,26]},{8:[1,34]},{8:[2,4],9:[1,35]},{5:[2,22],8:[2,22],41:[2,22]},{15:[2,29],29:36,30:[2,29],31:[2,29],32:37,33:38,41:[2,29],42:[2,29],43:[2,29],48:[2,29],49:[2,29],52:[2,29]},{5:[2,19],11:[2,19],13:[2,19],15:[2,19],18:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19],41:[2,19],42:[2,19]},{1:[2,1]},{8:[1,39]},{30:[1,40],31:[1,41]},{30:[2,26],31:[2,26]},{15:[2,42],30:[2,42],31:[2,42],34:42,36:43,38:45,41:[1,46],42:[1,47],43:[1,48],48:[1,44],49:[2,42],52:[2,42]},{1:[2,2]},{5:[2,24],8:[2,24],41:[2,24]},{15:[2,29],30:[2,29],31:[2,29],32:49,33:38,41:[2,29],42:[2,29],43:[2,29],48:[2,29],49:[2,29],52:[2,29]},{15:[1,52],30:[2,49],31:[2,49],35:50,49:[1,51],52:[1,53]},{15:[2,28],30:[2,28],31:[2,28],41:[2,28],42:[2,28],43:[2,28],44:[2,28],48:[2,28],49:[2,28],52:[2,28]},{12:25,25:54,41:[1,21],42:[1,26]},{15:[2,37],30:[2,37],31:[2,37],39:55,40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[1,56],46:[1,57],47:[1,58],48:[2,37],49:[2,37],52:[2,37]},{15:[2,34],30:[2,34],31:[2,34],40:[2,34],41:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34],47:[2,34],48:[2,34],49:[2,34],52:[2,34]},{15:[2,35],30:[2,35],31:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],47:[2,35],48:[2,35],49:[2,35],52:[2,35]},{31:[2,29],33:60,37:59,41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{30:[2,25],31:[2,25]},{30:[2,27],31:[2,27]},{49:[2,50],50:61,51:[2,50],53:62,54:[1,63]},{30:[2,47],31:[2,47]},{30:[2,48],31:[2,48]},{15:[2,41],30:[2,41],31:[2,41],49:[2,41],52:[2,41]},{15:[2,33],30:[2,33],31:[2,33],40:[1,64],41:[2,33],42:[2,33],43:[2,33],44:[2,33],48:[2,33],49:[2,33],52:[2,33]},{15:[2,38],30:[2,38],31:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],48:[2,38],49:[2,38],52:[2,38]},{15:[2,39],30:[2,39],31:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],48:[2,39],49:[2,39],52:[2,39]},{15:[2,40],30:[2,40],31:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40],48:[2,40],49:[2,40],52:[2,40]},{31:[1,66],44:[1,65]},{31:[2,31],36:43,38:45,41:[1,46],42:[1,47],43:[1,48],44:[2,31]},{49:[1,68],51:[1,67]},{49:[2,51],51:[2,51],54:[1,69]},{49:[2,54],51:[2,54],54:[2,54]},{15:[2,32],30:[2,32],31:[2,32],41:[2,32],42:[2,32],43:[2,32],44:[2,32],48:[2,32],49:[2,32],52:[2,32]},{15:[2,36],30:[2,36],31:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],47:[2,36],48:[2,36],49:[2,36],52:[2,36]},{31:[2,29],33:70,41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{30:[2,46],31:[2,46]},{49:[2,50],50:71,51:[2,50],53:62,54:[1,63]},{49:[2,55],51:[2,55],54:[2,55]},{31:[2,30],36:43,38:45,41:[1,46],42:[1,47],43:[1,48],44:[2,30]},{49:[1,68],51:[1,72]},{49:[2,53],51:[2,53],53:73,54:[1,63]},{49:[2,52],51:[2,52],54:[1,69]}],\ndefaultActions: {34:[2,1],39:[2,2]},\nparseError: function parseError(str, hash) {\n    if (hash.recoverable) {\n        this.trace(str);\n    } else {\n        throw new Error(str);\n    }\n},\nparse: function parse(input) {\n    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;\n    var args = lstack.slice.call(arguments, 1);\n    this.lexer.setInput(input);\n    this.lexer.yy = this.yy;\n    this.yy.lexer = this.lexer;\n    this.yy.parser = this;\n    if (typeof this.lexer.yylloc == 'undefined') {\n        this.lexer.yylloc = {};\n    }\n    var yyloc = this.lexer.yylloc;\n    lstack.push(yyloc);\n    var ranges = this.lexer.options && this.lexer.options.ranges;\n    if (typeof this.yy.parseError === 'function') {\n        this.parseError = this.yy.parseError;\n    } else {\n        this.parseError = Object.getPrototypeOf(this).parseError;\n    }\n    function popStack(n) {\n        stack.length = stack.length - 2 * n;\n        vstack.length = vstack.length - n;\n        lstack.length = lstack.length - n;\n    }\n    function lex() {\n        var token;\n        token = self.lexer.lex() || EOF;\n        if (typeof token !== 'number') {\n            token = self.symbols_[token] || token;\n        }\n        return token;\n    }\n    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;\n    while (true) {\n        state = stack[stack.length - 1];\n        if (this.defaultActions[state]) {\n            action = this.defaultActions[state];\n        } else {\n            if (symbol === null || typeof symbol == 'undefined') {\n                symbol = lex();\n            }\n            action = table[state] && table[state][symbol];\n        }\n                    if (typeof action === 'undefined' || !action.length || !action[0]) {\n                var errStr = '';\n                expected = [];\n                for (p in table[state]) {\n                    if (this.terminals_[p] && p > TERROR) {\n                        expected.push('\\'' + this.terminals_[p] + '\\'');\n                    }\n                }\n                if (this.lexer.showPosition) {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\\n' + this.lexer.showPosition() + '\\nExpecting ' + expected.join(', ') + ', got \\'' + (this.terminals_[symbol] || symbol) + '\\'';\n                } else {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\\'' + (this.terminals_[symbol] || symbol) + '\\'');\n                }\n                this.parseError(errStr, {\n                    text: this.lexer.match,\n                    token: this.terminals_[symbol] || symbol,\n                    line: this.lexer.yylineno,\n                    loc: yyloc,\n                    expected: expected\n                });\n            }\n        if (action[0] instanceof Array && action.length > 1) {\n            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);\n        }\n        switch (action[0]) {\n        case 1:\n            stack.push(symbol);\n            vstack.push(this.lexer.yytext);\n            lstack.push(this.lexer.yylloc);\n            stack.push(action[1]);\n            symbol = null;\n            if (!preErrorSymbol) {\n                yyleng = this.lexer.yyleng;\n                yytext = this.lexer.yytext;\n                yylineno = this.lexer.yylineno;\n                yyloc = this.lexer.yylloc;\n                if (recovering > 0) {\n                    recovering--;\n                }\n            } else {\n                symbol = preErrorSymbol;\n                preErrorSymbol = null;\n            }\n            break;\n        case 2:\n            len = this.productions_[action[1]][1];\n            yyval.$ = vstack[vstack.length - len];\n            yyval._$ = {\n                first_line: lstack[lstack.length - (len || 1)].first_line,\n                last_line: lstack[lstack.length - 1].last_line,\n                first_column: lstack[lstack.length - (len || 1)].first_column,\n                last_column: lstack[lstack.length - 1].last_column\n            };\n            if (ranges) {\n                yyval._$.range = [\n                    lstack[lstack.length - (len || 1)].range[0],\n                    lstack[lstack.length - 1].range[1]\n                ];\n            }\n            r = this.performAction.apply(yyval, [\n                yytext,\n                yyleng,\n                yylineno,\n                this.yy,\n                action[1],\n                vstack,\n                lstack\n            ].concat(args));\n            if (typeof r !== 'undefined') {\n                return r;\n            }\n            if (len) {\n                stack = stack.slice(0, -1 * len * 2);\n                vstack = vstack.slice(0, -1 * len);\n                lstack = lstack.slice(0, -1 * len);\n            }\n            stack.push(this.productions_[action[1]][0]);\n            vstack.push(yyval.$);\n            lstack.push(yyval._$);\n            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];\n            stack.push(newState);\n            break;\n        case 3:\n            return true;\n        }\n    }\n    return true;\n}};\n\nvar transform = __webpack_require__(/*! ./ebnf-transform */ \"./node_modules/ebnf-parser/ebnf-transform.js\").transform;\nvar ebnf = false;\n\n\n// transform ebnf to bnf if necessary\nfunction extend (json, grammar) {\n    json.bnf = ebnf ? transform(grammar) : grammar;\n    return json;\n}\n\n/* generated by jison-lex 0.2.1 */\nvar lexer = (function(){\nvar lexer = {\n\nEOF:1,\n\nparseError:function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n// resets the lexer, sets new input\nsetInput:function (input) {\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n// consumes and returns one char from the input\ninput:function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n// unshifts one char (or a string) into the input\nunput:function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n// When called from action, caches matched text and appends it on next action\nmore:function () {\n        this._more = true;\n        return this;\n    },\n\n// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\nreject:function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n// retain first n characters of the match\nless:function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n// displays already matched input, i.e. for error messages\npastInput:function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n// displays upcoming input, i.e. for error messages\nupcomingInput:function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n// displays the character position where the lexing error occurred, i.e. for error messages\nshowPosition:function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n// test the lexed token: return FALSE when not a match, otherwise return token\ntest_match:function (match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n// return next match in input\nnext:function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n// return next match that has a token\nlex:function lex() {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\nbegin:function begin(condition) {\n        this.conditionStack.push(condition);\n    },\n\n// pop the previously active lexer condition state off the condition stack\npopState:function popState() {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n// produce the lexer rule set which is active for the currently active lexer condition state\n_currentRules:function _currentRules() {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\ntopState:function topState(n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n// alias for begin(condition)\npushState:function pushState(condition) {\n        this.begin(condition);\n    },\n\n// return the number of states currently on the stack\nstateStackSize:function stateStackSize() {\n        return this.conditionStack.length;\n    },\noptions: {},\nperformAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\nvar YYSTATE=YY_START;\nswitch($avoiding_name_collisions) {\ncase 0:this.pushState('code');return 5;\nbreak;\ncase 1:return 43;\nbreak;\ncase 2:return 44;\nbreak;\ncase 3:return 45;\nbreak;\ncase 4:return 46;\nbreak;\ncase 5:return 47;\nbreak;\ncase 6:/* skip whitespace */\nbreak;\ncase 7:/* skip comment */\nbreak;\ncase 8:/* skip comment */\nbreak;\ncase 9:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 40;\nbreak;\ncase 10:return 41;\nbreak;\ncase 11:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 42;\nbreak;\ncase 12:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 42;\nbreak;\ncase 13:return 28;\nbreak;\ncase 14:return 30;\nbreak;\ncase 15:return 31;\nbreak;\ncase 16:this.pushState(ebnf ? 'ebnf' : 'bnf'); return 5;\nbreak;\ncase 17:if (!yy.options) yy.options = {}; ebnf = yy.options.ebnf = true;\nbreak;\ncase 18:return 48;\nbreak;\ncase 19:return 11;\nbreak;\ncase 20:return 22;\nbreak;\ncase 21:return 23;\nbreak;\ncase 22:return 24;\nbreak;\ncase 23:return 20;\nbreak;\ncase 24:return 18;\nbreak;\ncase 25:return 13;\nbreak;\ncase 26:/* ignore unrecognized decl */\nbreak;\ncase 27:/* ignore type */\nbreak;\ncase 28:yy_.yytext = yy_.yytext.substr(2, yy_.yyleng-4); return 15;\nbreak;\ncase 29:yy_.yytext = yy_.yytext.substr(2, yy_.yytext.length-4); return 15;\nbreak;\ncase 30:yy.depth = 0; this.pushState('action'); return 49;\nbreak;\ncase 31:yy_.yytext = yy_.yytext.substr(2, yy_.yyleng-2); return 52;\nbreak;\ncase 32:/* ignore bad characters */\nbreak;\ncase 33:return 8;\nbreak;\ncase 34:return 54;\nbreak;\ncase 35:return 54;\nbreak;\ncase 36:return 54; // regexp with braces or quotes (and no spaces)\nbreak;\ncase 37:return 54;\nbreak;\ncase 38:return 54;\nbreak;\ncase 39:return 54;\nbreak;\ncase 40:return 54;\nbreak;\ncase 41:yy.depth++; return 49;\nbreak;\ncase 42:if (yy.depth==0) this.begin(ebnf ? 'ebnf' : 'bnf'); else yy.depth--; return 51;\nbreak;\ncase 43:return 9;\nbreak;\n}\n},\nrules: [/^(?:%%)/,/^(?:\\()/,/^(?:\\))/,/^(?:\\*)/,/^(?:\\?)/,/^(?:\\+)/,/^(?:\\s+)/,/^(?:\\/\\/.*)/,/^(?:\\/\\*(.|\\n|\\r)*?\\*\\/)/,/^(?:\\[([a-zA-Z][a-zA-Z0-9_-]*)\\])/,/^(?:([a-zA-Z][a-zA-Z0-9_-]*))/,/^(?:\"[^\"]+\")/,/^(?:'[^']+')/,/^(?::)/,/^(?:;)/,/^(?:\\|)/,/^(?:%%)/,/^(?:%ebnf\\b)/,/^(?:%prec\\b)/,/^(?:%start\\b)/,/^(?:%left\\b)/,/^(?:%right\\b)/,/^(?:%nonassoc\\b)/,/^(?:%parse-param\\b)/,/^(?:%options\\b)/,/^(?:%lex[\\w\\W]*?\\/lex\\b)/,/^(?:%[a-zA-Z]+[^\\r\\n]*)/,/^(?:<[a-zA-Z]*>)/,/^(?:\\{\\{[\\w\\W]*?\\}\\})/,/^(?:%\\{(.|\\r|\\n)*?%\\})/,/^(?:\\{)/,/^(?:->.*)/,/^(?:.)/,/^(?:$)/,/^(?:\\/\\*(.|\\n|\\r)*?\\*\\/)/,/^(?:\\/\\/.*)/,/^(?:\\/[^ /]*?['\"{}'][^ ]*?\\/)/,/^(?:\"(\\\\\\\\|\\\\\"|[^\"])*\")/,/^(?:'(\\\\\\\\|\\\\'|[^'])*')/,/^(?:[/\"'][^{}/\"']+)/,/^(?:[^{}/\"']+)/,/^(?:\\{)/,/^(?:\\})/,/^(?:(.|\\n|\\r)+)/],\nconditions: {\"bnf\":{\"rules\":[0,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],\"inclusive\":true},\"ebnf\":{\"rules\":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],\"inclusive\":true},\"action\":{\"rules\":[33,34,35,36,37,38,39,40,41,42],\"inclusive\":false},\"code\":{\"rules\":[33,43],\"inclusive\":false},\"INITIAL\":{\"rules\":[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],\"inclusive\":true}}\n};\nreturn lexer;\n})();\nparser.lexer = lexer;\nfunction Parser () {\n  this.yy = {};\n}\nParser.prototype = parser;parser.Parser = Parser;\nreturn new Parser;\n})();\n\n\nif (true) {\nexports.parser = bnf;\nexports.Parser = bnf.Parser;\nexports.parse = function () { return bnf.parse.apply(bnf, arguments); };\nexports.main = function commonjsMain(args) {\n    if (!args[1]) {\n        console.log('Usage: '+args[0]+' FILE');\n        process.exit(1);\n    }\n    var source = __webpack_require__(/*! fs */ \"./node_modules/node-libs-browser/mock/empty.js\").readFileSync(__webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\").normalize(args[1]), \"utf8\");\n    return exports.parser.parse(source);\n};\nif ( true && __webpack_require__.c[__webpack_require__.s] === module) {\n  exports.main(process.argv.slice(1));\n}\n}\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ \"./node_modules/process/browser.js\"), __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./node_modules/ebnf-parser/parser.js?");

/***/ }),

/***/ "./node_modules/ebnf-parser/transform-parser.js":
/*!******************************************************!*\
  !*** ./node_modules/ebnf-parser/transform-parser.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.11 */\n/*\n  Returns a Parser object of the following structure:\n\n  Parser: {\n    yy: {}\n  }\n\n  Parser.prototype: {\n    yy: {},\n    trace: function(),\n    symbols_: {associative list: name ==> number},\n    terminals_: {associative list: number ==> name},\n    productions_: [...],\n    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n    table: [...],\n    defaultActions: {...},\n    parseError: function(str, hash),\n    parse: function(input),\n\n    lexer: {\n        EOF: 1,\n        parseError: function(str, hash),\n        setInput: function(input),\n        input: function(),\n        unput: function(str),\n        more: function(),\n        less: function(n),\n        pastInput: function(),\n        upcomingInput: function(),\n        showPosition: function(),\n        test_match: function(regex_match_array, rule_index),\n        next: function(),\n        lex: function(),\n        begin: function(condition),\n        popState: function(),\n        _currentRules: function(),\n        topState: function(),\n        pushState: function(condition),\n\n        options: {\n            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n        },\n\n        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n        rules: [...],\n        conditions: {associative list: name ==> set},\n    }\n  }\n\n\n  token location info (@$, _$, etc.): {\n    first_line: n,\n    last_line: n,\n    first_column: n,\n    last_column: n,\n    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n  }\n\n\n  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n    text:        (matched text)\n    token:       (the produced terminal token, if any)\n    line:        (yylineno)\n  }\n  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n    loc:         (yylloc)\n    expected:    (string describing the set of expected tokens)\n    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n  }\n*/\nvar ebnf = (function(){\nvar parser = {trace: function trace() { },\nyy: {},\nsymbols_: {\"error\":2,\"production\":3,\"handle\":4,\"EOF\":5,\"handle_list\":6,\"|\":7,\"expression_suffix\":8,\"expression\":9,\"suffix\":10,\"ALIAS\":11,\"symbol\":12,\"(\":13,\")\":14,\"*\":15,\"?\":16,\"+\":17,\"$accept\":0,\"$end\":1},\nterminals_: {2:\"error\",5:\"EOF\",7:\"|\",11:\"ALIAS\",12:\"symbol\",13:\"(\",14:\")\",15:\"*\",16:\"?\",17:\"+\"},\nproductions_: [0,[3,2],[6,1],[6,3],[4,0],[4,2],[8,3],[8,2],[9,1],[9,3],[10,0],[10,1],[10,1],[10,1]],\nperformAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {\n/* this == yyval */\n\nvar $0 = $$.length - 1;\nswitch (yystate) {\ncase 1: return $$[$0-1]; \nbreak;\ncase 2: this.$ = [$$[$0]]; \nbreak;\ncase 3: $$[$0-2].push($$[$0]); \nbreak;\ncase 4: this.$ = []; \nbreak;\ncase 5: $$[$0-1].push($$[$0]); \nbreak;\ncase 6: this.$ = ['xalias', $$[$0-1], $$[$0-2], $$[$0]]; \nbreak;\ncase 7: if ($$[$0]) this.$ = [$$[$0], $$[$0-1]]; else this.$ = $$[$0-1]; \nbreak;\ncase 8: this.$ = ['symbol', $$[$0]]; \nbreak;\ncase 9: this.$ = ['()', $$[$0-1]]; \nbreak;\n}\n},\ntable: [{3:1,4:2,5:[2,4],12:[2,4],13:[2,4]},{1:[3]},{5:[1,3],8:4,9:5,12:[1,6],13:[1,7]},{1:[2,1]},{5:[2,5],7:[2,5],12:[2,5],13:[2,5],14:[2,5]},{5:[2,10],7:[2,10],10:8,11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[1,9],16:[1,10],17:[1,11]},{5:[2,8],7:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[2,8],17:[2,8]},{4:13,6:12,7:[2,4],12:[2,4],13:[2,4],14:[2,4]},{5:[2,7],7:[2,7],11:[1,14],12:[2,7],13:[2,7],14:[2,7]},{5:[2,11],7:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11]},{5:[2,12],7:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12]},{5:[2,13],7:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[2,13]},{7:[1,16],14:[1,15]},{7:[2,2],8:4,9:5,12:[1,6],13:[1,7],14:[2,2]},{5:[2,6],7:[2,6],12:[2,6],13:[2,6],14:[2,6]},{5:[2,9],7:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[2,9],17:[2,9]},{4:17,7:[2,4],12:[2,4],13:[2,4],14:[2,4]},{7:[2,3],8:4,9:5,12:[1,6],13:[1,7],14:[2,3]}],\ndefaultActions: {3:[2,1]},\nparseError: function parseError(str, hash) {\n    if (hash.recoverable) {\n        this.trace(str);\n    } else {\n        throw new Error(str);\n    }\n},\nparse: function parse(input) {\n    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;\n    var args = lstack.slice.call(arguments, 1);\n    this.lexer.setInput(input);\n    this.lexer.yy = this.yy;\n    this.yy.lexer = this.lexer;\n    this.yy.parser = this;\n    if (typeof this.lexer.yylloc == 'undefined') {\n        this.lexer.yylloc = {};\n    }\n    var yyloc = this.lexer.yylloc;\n    lstack.push(yyloc);\n    var ranges = this.lexer.options && this.lexer.options.ranges;\n    if (typeof this.yy.parseError === 'function') {\n        this.parseError = this.yy.parseError;\n    } else {\n        this.parseError = Object.getPrototypeOf(this).parseError;\n    }\n    function popStack(n) {\n        stack.length = stack.length - 2 * n;\n        vstack.length = vstack.length - n;\n        lstack.length = lstack.length - n;\n    }\n    function lex() {\n        var token;\n        token = self.lexer.lex() || EOF;\n        if (typeof token !== 'number') {\n            token = self.symbols_[token] || token;\n        }\n        return token;\n    }\n    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;\n    while (true) {\n        state = stack[stack.length - 1];\n        if (this.defaultActions[state]) {\n            action = this.defaultActions[state];\n        } else {\n            if (symbol === null || typeof symbol == 'undefined') {\n                symbol = lex();\n            }\n            action = table[state] && table[state][symbol];\n        }\n                    if (typeof action === 'undefined' || !action.length || !action[0]) {\n                var errStr = '';\n                expected = [];\n                for (p in table[state]) {\n                    if (this.terminals_[p] && p > TERROR) {\n                        expected.push('\\'' + this.terminals_[p] + '\\'');\n                    }\n                }\n                if (this.lexer.showPosition) {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\\n' + this.lexer.showPosition() + '\\nExpecting ' + expected.join(', ') + ', got \\'' + (this.terminals_[symbol] || symbol) + '\\'';\n                } else {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\\'' + (this.terminals_[symbol] || symbol) + '\\'');\n                }\n                this.parseError(errStr, {\n                    text: this.lexer.match,\n                    token: this.terminals_[symbol] || symbol,\n                    line: this.lexer.yylineno,\n                    loc: yyloc,\n                    expected: expected\n                });\n            }\n        if (action[0] instanceof Array && action.length > 1) {\n            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);\n        }\n        switch (action[0]) {\n        case 1:\n            stack.push(symbol);\n            vstack.push(this.lexer.yytext);\n            lstack.push(this.lexer.yylloc);\n            stack.push(action[1]);\n            symbol = null;\n            if (!preErrorSymbol) {\n                yyleng = this.lexer.yyleng;\n                yytext = this.lexer.yytext;\n                yylineno = this.lexer.yylineno;\n                yyloc = this.lexer.yylloc;\n                if (recovering > 0) {\n                    recovering--;\n                }\n            } else {\n                symbol = preErrorSymbol;\n                preErrorSymbol = null;\n            }\n            break;\n        case 2:\n            len = this.productions_[action[1]][1];\n            yyval.$ = vstack[vstack.length - len];\n            yyval._$ = {\n                first_line: lstack[lstack.length - (len || 1)].first_line,\n                last_line: lstack[lstack.length - 1].last_line,\n                first_column: lstack[lstack.length - (len || 1)].first_column,\n                last_column: lstack[lstack.length - 1].last_column\n            };\n            if (ranges) {\n                yyval._$.range = [\n                    lstack[lstack.length - (len || 1)].range[0],\n                    lstack[lstack.length - 1].range[1]\n                ];\n            }\n            r = this.performAction.apply(yyval, [\n                yytext,\n                yyleng,\n                yylineno,\n                this.yy,\n                action[1],\n                vstack,\n                lstack\n            ].concat(args));\n            if (typeof r !== 'undefined') {\n                return r;\n            }\n            if (len) {\n                stack = stack.slice(0, -1 * len * 2);\n                vstack = vstack.slice(0, -1 * len);\n                lstack = lstack.slice(0, -1 * len);\n            }\n            stack.push(this.productions_[action[1]][0]);\n            vstack.push(yyval.$);\n            lstack.push(yyval._$);\n            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];\n            stack.push(newState);\n            break;\n        case 3:\n            return true;\n        }\n    }\n    return true;\n}};\n/* generated by jison-lex 0.2.1 */\nvar lexer = (function(){\nvar lexer = {\n\nEOF:1,\n\nparseError:function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n// resets the lexer, sets new input\nsetInput:function (input) {\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n// consumes and returns one char from the input\ninput:function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n// unshifts one char (or a string) into the input\nunput:function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n// When called from action, caches matched text and appends it on next action\nmore:function () {\n        this._more = true;\n        return this;\n    },\n\n// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\nreject:function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n// retain first n characters of the match\nless:function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n// displays already matched input, i.e. for error messages\npastInput:function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n// displays upcoming input, i.e. for error messages\nupcomingInput:function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n// displays the character position where the lexing error occurred, i.e. for error messages\nshowPosition:function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n// test the lexed token: return FALSE when not a match, otherwise return token\ntest_match:function (match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n// return next match in input\nnext:function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n// return next match that has a token\nlex:function lex() {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\nbegin:function begin(condition) {\n        this.conditionStack.push(condition);\n    },\n\n// pop the previously active lexer condition state off the condition stack\npopState:function popState() {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n// produce the lexer rule set which is active for the currently active lexer condition state\n_currentRules:function _currentRules() {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\ntopState:function topState(n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n// alias for begin(condition)\npushState:function pushState(condition) {\n        this.begin(condition);\n    },\n\n// return the number of states currently on the stack\nstateStackSize:function stateStackSize() {\n        return this.conditionStack.length;\n    },\noptions: {},\nperformAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\nvar YYSTATE=YY_START;\nswitch($avoiding_name_collisions) {\ncase 0:/* skip whitespace */\nbreak;\ncase 1:return 12;\nbreak;\ncase 2:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 11;\nbreak;\ncase 3:return 12;\nbreak;\ncase 4:return 12;\nbreak;\ncase 5:return 'bar';\nbreak;\ncase 6:return 13;\nbreak;\ncase 7:return 14;\nbreak;\ncase 8:return 15;\nbreak;\ncase 9:return 16;\nbreak;\ncase 10:return 7;\nbreak;\ncase 11:return 17;\nbreak;\ncase 12:return 5;\nbreak;\n}\n},\nrules: [/^(?:\\s+)/,/^(?:([a-zA-Z][a-zA-Z0-9_-]*))/,/^(?:\\[([a-zA-Z][a-zA-Z0-9_-]*)\\])/,/^(?:'[^']*')/,/^(?:\\.)/,/^(?:bar\\b)/,/^(?:\\()/,/^(?:\\))/,/^(?:\\*)/,/^(?:\\?)/,/^(?:\\|)/,/^(?:\\+)/,/^(?:$)/],\nconditions: {\"INITIAL\":{\"rules\":[0,1,2,3,4,5,6,7,8,9,10,11,12],\"inclusive\":true}}\n};\nreturn lexer;\n})();\nparser.lexer = lexer;\nfunction Parser () {\n  this.yy = {};\n}\nParser.prototype = parser;parser.Parser = Parser;\nreturn new Parser;\n})();\n\n\nif (true) {\nexports.parser = ebnf;\nexports.Parser = ebnf.Parser;\nexports.parse = function () { return ebnf.parse.apply(ebnf, arguments); };\nexports.main = function commonjsMain(args) {\n    if (!args[1]) {\n        console.log('Usage: '+args[0]+' FILE');\n        process.exit(1);\n    }\n    var source = __webpack_require__(/*! fs */ \"./node_modules/node-libs-browser/mock/empty.js\").readFileSync(__webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\").normalize(args[1]), \"utf8\");\n    return exports.parser.parse(source);\n};\nif ( true && __webpack_require__.c[__webpack_require__.s] === module) {\n  exports.main(process.argv.slice(1));\n}\n}\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ \"./node_modules/process/browser.js\"), __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./node_modules/ebnf-parser/transform-parser.js?");

/***/ }),

/***/ "./node_modules/escodegen/escodegen.js":
/*!*********************************************!*\
  !*** ./node_modules/escodegen/escodegen.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(global) {/*\n  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>\n  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>\n  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>\n  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>\n  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>\n  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>\n  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>\n  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>\n  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>\n  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n/*global exports:true, generateStatement:true, generateExpression:true, require:true, global:true*/\n(function () {\n    'use strict';\n\n    var Syntax,\n        Precedence,\n        BinaryPrecedence,\n        SourceNode,\n        estraverse,\n        esutils,\n        isArray,\n        base,\n        indent,\n        json,\n        renumber,\n        hexadecimal,\n        quotes,\n        escapeless,\n        newline,\n        space,\n        parentheses,\n        semicolons,\n        safeConcatenation,\n        directive,\n        extra,\n        parse,\n        sourceMap,\n        FORMAT_MINIFY,\n        FORMAT_DEFAULTS;\n\n    estraverse = __webpack_require__(/*! estraverse */ \"./node_modules/escodegen/node_modules/estraverse/estraverse.js\");\n    esutils = __webpack_require__(/*! esutils */ \"./node_modules/escodegen/node_modules/esutils/lib/utils.js\");\n\n    Syntax = {\n        AssignmentExpression: 'AssignmentExpression',\n        ArrayExpression: 'ArrayExpression',\n        ArrayPattern: 'ArrayPattern',\n        ArrowFunctionExpression: 'ArrowFunctionExpression',\n        BlockStatement: 'BlockStatement',\n        BinaryExpression: 'BinaryExpression',\n        BreakStatement: 'BreakStatement',\n        CallExpression: 'CallExpression',\n        CatchClause: 'CatchClause',\n        ComprehensionBlock: 'ComprehensionBlock',\n        ComprehensionExpression: 'ComprehensionExpression',\n        ConditionalExpression: 'ConditionalExpression',\n        ContinueStatement: 'ContinueStatement',\n        DirectiveStatement: 'DirectiveStatement',\n        DoWhileStatement: 'DoWhileStatement',\n        DebuggerStatement: 'DebuggerStatement',\n        EmptyStatement: 'EmptyStatement',\n        ExportDeclaration: 'ExportDeclaration',\n        ExpressionStatement: 'ExpressionStatement',\n        ForStatement: 'ForStatement',\n        ForInStatement: 'ForInStatement',\n        ForOfStatement: 'ForOfStatement',\n        FunctionDeclaration: 'FunctionDeclaration',\n        FunctionExpression: 'FunctionExpression',\n        GeneratorExpression: 'GeneratorExpression',\n        Identifier: 'Identifier',\n        IfStatement: 'IfStatement',\n        ImportDeclaration: 'ImportDeclaration',\n        Literal: 'Literal',\n        LabeledStatement: 'LabeledStatement',\n        LogicalExpression: 'LogicalExpression',\n        MemberExpression: 'MemberExpression',\n        NewExpression: 'NewExpression',\n        ObjectExpression: 'ObjectExpression',\n        ObjectPattern: 'ObjectPattern',\n        Program: 'Program',\n        Property: 'Property',\n        ReturnStatement: 'ReturnStatement',\n        SequenceExpression: 'SequenceExpression',\n        SwitchStatement: 'SwitchStatement',\n        SwitchCase: 'SwitchCase',\n        ThisExpression: 'ThisExpression',\n        ThrowStatement: 'ThrowStatement',\n        TryStatement: 'TryStatement',\n        UnaryExpression: 'UnaryExpression',\n        UpdateExpression: 'UpdateExpression',\n        VariableDeclaration: 'VariableDeclaration',\n        VariableDeclarator: 'VariableDeclarator',\n        WhileStatement: 'WhileStatement',\n        WithStatement: 'WithStatement',\n        YieldExpression: 'YieldExpression'\n    };\n\n    Precedence = {\n        Sequence: 0,\n        Yield: 1,\n        Assignment: 1,\n        Conditional: 2,\n        ArrowFunction: 2,\n        LogicalOR: 3,\n        LogicalAND: 4,\n        BitwiseOR: 5,\n        BitwiseXOR: 6,\n        BitwiseAND: 7,\n        Equality: 8,\n        Relational: 9,\n        BitwiseSHIFT: 10,\n        Additive: 11,\n        Multiplicative: 12,\n        Unary: 13,\n        Postfix: 14,\n        Call: 15,\n        New: 16,\n        Member: 17,\n        Primary: 18\n    };\n\n    BinaryPrecedence = {\n        '||': Precedence.LogicalOR,\n        '&&': Precedence.LogicalAND,\n        '|': Precedence.BitwiseOR,\n        '^': Precedence.BitwiseXOR,\n        '&': Precedence.BitwiseAND,\n        '==': Precedence.Equality,\n        '!=': Precedence.Equality,\n        '===': Precedence.Equality,\n        '!==': Precedence.Equality,\n        'is': Precedence.Equality,\n        'isnt': Precedence.Equality,\n        '<': Precedence.Relational,\n        '>': Precedence.Relational,\n        '<=': Precedence.Relational,\n        '>=': Precedence.Relational,\n        'in': Precedence.Relational,\n        'instanceof': Precedence.Relational,\n        '<<': Precedence.BitwiseSHIFT,\n        '>>': Precedence.BitwiseSHIFT,\n        '>>>': Precedence.BitwiseSHIFT,\n        '+': Precedence.Additive,\n        '-': Precedence.Additive,\n        '*': Precedence.Multiplicative,\n        '%': Precedence.Multiplicative,\n        '/': Precedence.Multiplicative\n    };\n\n    function getDefaultOptions() {\n        // default options\n        return {\n            indent: null,\n            base: null,\n            parse: null,\n            comment: false,\n            format: {\n                indent: {\n                    style: '    ',\n                    base: 0,\n                    adjustMultilineComment: false\n                },\n                newline: '\\n',\n                space: ' ',\n                json: false,\n                renumber: false,\n                hexadecimal: false,\n                quotes: 'single',\n                escapeless: false,\n                compact: false,\n                parentheses: true,\n                semicolons: true,\n                safeConcatenation: false\n            },\n            moz: {\n                comprehensionExpressionStartsWithAssignment: false,\n                starlessGenerator: false,\n                parenthesizedComprehensionBlock: false\n            },\n            sourceMap: null,\n            sourceMapRoot: null,\n            sourceMapWithCode: false,\n            directive: false,\n            raw: true,\n            verbatim: null\n        };\n    }\n\n    function stringRepeat(str, num) {\n        var result = '';\n\n        for (num |= 0; num > 0; num >>>= 1, str += str) {\n            if (num & 1) {\n                result += str;\n            }\n        }\n\n        return result;\n    }\n\n    isArray = Array.isArray;\n    if (!isArray) {\n        isArray = function isArray(array) {\n            return Object.prototype.toString.call(array) === '[object Array]';\n        };\n    }\n\n    function hasLineTerminator(str) {\n        return (/[\\r\\n]/g).test(str);\n    }\n\n    function endsWithLineTerminator(str) {\n        var len = str.length;\n        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));\n    }\n\n    function updateDeeply(target, override) {\n        var key, val;\n\n        function isHashObject(target) {\n            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);\n        }\n\n        for (key in override) {\n            if (override.hasOwnProperty(key)) {\n                val = override[key];\n                if (isHashObject(val)) {\n                    if (isHashObject(target[key])) {\n                        updateDeeply(target[key], val);\n                    } else {\n                        target[key] = updateDeeply({}, val);\n                    }\n                } else {\n                    target[key] = val;\n                }\n            }\n        }\n        return target;\n    }\n\n    function generateNumber(value) {\n        var result, point, temp, exponent, pos;\n\n        if (value !== value) {\n            throw new Error('Numeric literal whose value is NaN');\n        }\n        if (value < 0 || (value === 0 && 1 / value < 0)) {\n            throw new Error('Numeric literal whose value is negative');\n        }\n\n        if (value === 1 / 0) {\n            return json ? 'null' : renumber ? '1e400' : '1e+400';\n        }\n\n        result = '' + value;\n        if (!renumber || result.length < 3) {\n            return result;\n        }\n\n        point = result.indexOf('.');\n        if (!json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {\n            point = 0;\n            result = result.slice(1);\n        }\n        temp = result;\n        result = result.replace('e+', 'e');\n        exponent = 0;\n        if ((pos = temp.indexOf('e')) > 0) {\n            exponent = +temp.slice(pos + 1);\n            temp = temp.slice(0, pos);\n        }\n        if (point >= 0) {\n            exponent -= temp.length - point - 1;\n            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';\n        }\n        pos = 0;\n        while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {\n            --pos;\n        }\n        if (pos !== 0) {\n            exponent -= pos;\n            temp = temp.slice(0, pos);\n        }\n        if (exponent !== 0) {\n            temp += 'e' + exponent;\n        }\n        if ((temp.length < result.length ||\n                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&\n                +temp === value) {\n            result = temp;\n        }\n\n        return result;\n    }\n\n    // Generate valid RegExp expression.\n    // This function is based on https://github.com/Constellation/iv Engine\n\n    function escapeRegExpCharacter(ch, previousIsBackslash) {\n        // not handling '\\' and handling \\u2028 or \\u2029 to unicode escape sequence\n        if ((ch & ~1) === 0x2028) {\n            return (previousIsBackslash ? 'u' : '\\\\u') + ((ch === 0x2028) ? '2028' : '2029');\n        } else if (ch === 10 || ch === 13) {  // \\n, \\r\n            return (previousIsBackslash ? '' : '\\\\') + ((ch === 10) ? 'n' : 'r');\n        }\n        return String.fromCharCode(ch);\n    }\n\n    function generateRegExp(reg) {\n        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;\n\n        result = reg.toString();\n\n        if (reg.source) {\n            // extract flag from toString result\n            match = result.match(/\\/([^/]*)$/);\n            if (!match) {\n                return result;\n            }\n\n            flags = match[1];\n            result = '';\n\n            characterInBrack = false;\n            previousIsBackslash = false;\n            for (i = 0, iz = reg.source.length; i < iz; ++i) {\n                ch = reg.source.charCodeAt(i);\n\n                if (!previousIsBackslash) {\n                    if (characterInBrack) {\n                        if (ch === 93) {  // ]\n                            characterInBrack = false;\n                        }\n                    } else {\n                        if (ch === 47) {  // /\n                            result += '\\\\';\n                        } else if (ch === 91) {  // [\n                            characterInBrack = true;\n                        }\n                    }\n                    result += escapeRegExpCharacter(ch, previousIsBackslash);\n                    previousIsBackslash = ch === 92;  // \\\n                } else {\n                    // if new RegExp(\"\\\\\\n') is provided, create /\\n/\n                    result += escapeRegExpCharacter(ch, previousIsBackslash);\n                    // prevent like /\\\\[/]/\n                    previousIsBackslash = false;\n                }\n            }\n\n            return '/' + result + '/' + flags;\n        }\n\n        return result;\n    }\n\n    function escapeAllowedCharacter(code, next) {\n        var hex, result = '\\\\';\n\n        switch (code) {\n        case 0x08  /* \\b */:\n            result += 'b';\n            break;\n        case 0x0C  /* \\f */:\n            result += 'f';\n            break;\n        case 0x09  /* \\t */:\n            result += 't';\n            break;\n        default:\n            hex = code.toString(16).toUpperCase();\n            if (json || code > 0xFF) {\n                result += 'u' + '0000'.slice(hex.length) + hex;\n            } else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) {\n                result += '0';\n            } else if (code === 0x000B  /* \\v */) { // '\\v'\n                result += 'x0B';\n            } else {\n                result += 'x' + '00'.slice(hex.length) + hex;\n            }\n            break;\n        }\n\n        return result;\n    }\n\n    function escapeDisallowedCharacter(code) {\n        var result = '\\\\';\n        switch (code) {\n        case 0x5C  /* \\ */:\n            result += '\\\\';\n            break;\n        case 0x0A  /* \\n */:\n            result += 'n';\n            break;\n        case 0x0D  /* \\r */:\n            result += 'r';\n            break;\n        case 0x2028:\n            result += 'u2028';\n            break;\n        case 0x2029:\n            result += 'u2029';\n            break;\n        default:\n            throw new Error('Incorrectly classified character');\n        }\n\n        return result;\n    }\n\n    function escapeDirective(str) {\n        var i, iz, code, quote;\n\n        quote = quotes === 'double' ? '\"' : '\\'';\n        for (i = 0, iz = str.length; i < iz; ++i) {\n            code = str.charCodeAt(i);\n            if (code === 0x27  /* ' */) {\n                quote = '\"';\n                break;\n            } else if (code === 0x22  /* \" */) {\n                quote = '\\'';\n                break;\n            } else if (code === 0x5C  /* \\ */) {\n                ++i;\n            }\n        }\n\n        return quote + str + quote;\n    }\n\n    function escapeString(str) {\n        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;\n\n        for (i = 0, len = str.length; i < len; ++i) {\n            code = str.charCodeAt(i);\n            if (code === 0x27  /* ' */) {\n                ++singleQuotes;\n            } else if (code === 0x22  /* \" */) {\n                ++doubleQuotes;\n            } else if (code === 0x2F  /* / */ && json) {\n                result += '\\\\';\n            } else if (esutils.code.isLineTerminator(code) || code === 0x5C  /* \\ */) {\n                result += escapeDisallowedCharacter(code);\n                continue;\n            } else if ((json && code < 0x20  /* SP */) || !(json || escapeless || (code >= 0x20  /* SP */ && code <= 0x7E  /* ~ */))) {\n                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));\n                continue;\n            }\n            result += String.fromCharCode(code);\n        }\n\n        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));\n        quote = single ? '\\'' : '\"';\n\n        if (!(single ? singleQuotes : doubleQuotes)) {\n            return quote + result + quote;\n        }\n\n        str = result;\n        result = quote;\n\n        for (i = 0, len = str.length; i < len; ++i) {\n            code = str.charCodeAt(i);\n            if ((code === 0x27  /* ' */ && single) || (code === 0x22  /* \" */ && !single)) {\n                result += '\\\\';\n            }\n            result += String.fromCharCode(code);\n        }\n\n        return result + quote;\n    }\n\n    /**\n     * flatten an array to a string, where the array can contain\n     * either strings or nested arrays\n     */\n    function flattenToString(arr) {\n        var i, iz, elem, result = '';\n        for (i = 0, iz = arr.length; i < iz; ++i) {\n            elem = arr[i];\n            result += isArray(elem) ? flattenToString(elem) : elem;\n        }\n        return result;\n    }\n\n    /**\n     * convert generated to a SourceNode when source maps are enabled.\n     */\n    function toSourceNodeWhenNeeded(generated, node) {\n        if (!sourceMap) {\n            // with no source maps, generated is either an\n            // array or a string.  if an array, flatten it.\n            // if a string, just return it\n            if (isArray(generated)) {\n                return flattenToString(generated);\n            } else {\n                return generated;\n            }\n        }\n        if (node == null) {\n            if (generated instanceof SourceNode) {\n                return generated;\n            } else {\n                node = {};\n            }\n        }\n        if (node.loc == null) {\n            return new SourceNode(null, null, sourceMap, generated, node.name || null);\n        }\n        return new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated, node.name || null);\n    }\n\n    function noEmptySpace() {\n        return (space) ? space : ' ';\n    }\n\n    function join(left, right) {\n        var leftSource = toSourceNodeWhenNeeded(left).toString(),\n            rightSource = toSourceNodeWhenNeeded(right).toString(),\n            leftCharCode = leftSource.charCodeAt(leftSource.length - 1),\n            rightCharCode = rightSource.charCodeAt(0);\n\n        if ((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode ||\n        esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode) ||\n        leftCharCode === 0x2F  /* / */ && rightCharCode === 0x69  /* i */) { // infix word operators all start with `i`\n            return [left, noEmptySpace(), right];\n        } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) ||\n                esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {\n            return [left, right];\n        }\n        return [left, space, right];\n    }\n\n    function addIndent(stmt) {\n        return [base, stmt];\n    }\n\n    function withIndent(fn) {\n        var previousBase, result;\n        previousBase = base;\n        base += indent;\n        result = fn.call(this, base);\n        base = previousBase;\n        return result;\n    }\n\n    function calculateSpaces(str) {\n        var i;\n        for (i = str.length - 1; i >= 0; --i) {\n            if (esutils.code.isLineTerminator(str.charCodeAt(i))) {\n                break;\n            }\n        }\n        return (str.length - 1) - i;\n    }\n\n    function adjustMultilineComment(value, specialBase) {\n        var array, i, len, line, j, spaces, previousBase, sn;\n\n        array = value.split(/\\r\\n|[\\r\\n]/);\n        spaces = Number.MAX_VALUE;\n\n        // first line doesn't have indentation\n        for (i = 1, len = array.length; i < len; ++i) {\n            line = array[i];\n            j = 0;\n            while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {\n                ++j;\n            }\n            if (spaces > j) {\n                spaces = j;\n            }\n        }\n\n        if (typeof specialBase !== 'undefined') {\n            // pattern like\n            // {\n            //   var t = 20;  /*\n            //                 * this is comment\n            //                 */\n            // }\n            previousBase = base;\n            if (array[1][spaces] === '*') {\n                specialBase += ' ';\n            }\n            base = specialBase;\n        } else {\n            if (spaces & 1) {\n                // /*\n                //  *\n                //  */\n                // If spaces are odd number, above pattern is considered.\n                // We waste 1 space.\n                --spaces;\n            }\n            previousBase = base;\n        }\n\n        for (i = 1, len = array.length; i < len; ++i) {\n            sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));\n            array[i] = sourceMap ? sn.join('') : sn;\n        }\n\n        base = previousBase;\n\n        return array.join('\\n');\n    }\n\n    function generateComment(comment, specialBase) {\n        if (comment.type === 'Line') {\n            if (endsWithLineTerminator(comment.value)) {\n                return '//' + comment.value;\n            } else {\n                // Always use LineTerminator\n                return '//' + comment.value + '\\n';\n            }\n        }\n        if (extra.format.indent.adjustMultilineComment && /[\\n\\r]/.test(comment.value)) {\n            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);\n        }\n        return '/*' + comment.value + '*/';\n    }\n\n    function addComments(stmt, result) {\n        var i, len, comment, save, tailingToStatement, specialBase, fragment;\n\n        if (stmt.leadingComments && stmt.leadingComments.length > 0) {\n            save = result;\n\n            comment = stmt.leadingComments[0];\n            result = [];\n            if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {\n                result.push('\\n');\n            }\n            result.push(generateComment(comment));\n            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                result.push('\\n');\n            }\n\n            for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {\n                comment = stmt.leadingComments[i];\n                fragment = [generateComment(comment)];\n                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                    fragment.push('\\n');\n                }\n                result.push(addIndent(fragment));\n            }\n\n            result.push(addIndent(save));\n        }\n\n        if (stmt.trailingComments) {\n            tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());\n            specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([base, result, indent]).toString()));\n            for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {\n                comment = stmt.trailingComments[i];\n                if (tailingToStatement) {\n                    // We assume target like following script\n                    //\n                    // var t = 20;  /**\n                    //               * This is comment of t\n                    //               */\n                    if (i === 0) {\n                        // first case\n                        result = [result, indent];\n                    } else {\n                        result = [result, specialBase];\n                    }\n                    result.push(generateComment(comment, specialBase));\n                } else {\n                    result = [result, addIndent(generateComment(comment))];\n                }\n                if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                    result = [result, '\\n'];\n                }\n            }\n        }\n\n        return result;\n    }\n\n    function parenthesize(text, current, should) {\n        if (current < should) {\n            return ['(', text, ')'];\n        }\n        return text;\n    }\n\n    function maybeBlock(stmt, semicolonOptional, functionBody) {\n        var result, noLeadingComment;\n\n        noLeadingComment = !extra.comment || !stmt.leadingComments;\n\n        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {\n            return [space, generateStatement(stmt, { functionBody: functionBody })];\n        }\n\n        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {\n            return ';';\n        }\n\n        withIndent(function () {\n            result = [newline, addIndent(generateStatement(stmt, { semicolonOptional: semicolonOptional, functionBody: functionBody }))];\n        });\n\n        return result;\n    }\n\n    function maybeBlockSuffix(stmt, result) {\n        var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());\n        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {\n            return [result, space];\n        }\n        if (ends) {\n            return [result, base];\n        }\n        return [result, newline, base];\n    }\n\n    function generateVerbatimString(string) {\n        var i, iz, result;\n        result = string.split(/\\r\\n|\\n/);\n        for (i = 1, iz = result.length; i < iz; i++) {\n            result[i] = newline + base + result[i];\n        }\n        return result;\n    }\n\n    function generateVerbatim(expr, option) {\n        var verbatim, result, prec;\n        verbatim = expr[extra.verbatim];\n\n        if (typeof verbatim === 'string') {\n            result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, option.precedence);\n        } else {\n            // verbatim is object\n            result = generateVerbatimString(verbatim.content);\n            prec = (verbatim.precedence != null) ? verbatim.precedence : Precedence.Sequence;\n            result = parenthesize(result, prec, option.precedence);\n        }\n\n        return toSourceNodeWhenNeeded(result, expr);\n    }\n\n    function generateIdentifier(node) {\n        return toSourceNodeWhenNeeded(node.name, node);\n    }\n\n    function generatePattern(node, options) {\n        var result;\n\n        if (node.type === Syntax.Identifier) {\n            result = generateIdentifier(node);\n        } else {\n            result = generateExpression(node, {\n                precedence: options.precedence,\n                allowIn: options.allowIn,\n                allowCall: true\n            });\n        }\n\n        return result;\n    }\n\n    function generateFunctionBody(node) {\n        var result, i, len, expr, arrow;\n\n        arrow = node.type === Syntax.ArrowFunctionExpression;\n\n        if (arrow && node.params.length === 1 && node.params[0].type === Syntax.Identifier) {\n            // arg => { } case\n            result = [generateIdentifier(node.params[0])];\n        } else {\n            result = ['('];\n            for (i = 0, len = node.params.length; i < len; ++i) {\n                result.push(generatePattern(node.params[i], {\n                    precedence: Precedence.Assignment,\n                    allowIn: true\n                }));\n                if (i + 1 < len) {\n                    result.push(',' + space);\n                }\n            }\n            result.push(')');\n        }\n\n        if (arrow) {\n            result.push(space);\n            result.push('=>');\n        }\n\n        if (node.expression) {\n            result.push(space);\n            expr = generateExpression(node.body, {\n                precedence: Precedence.Assignment,\n                allowIn: true,\n                allowCall: true\n            });\n            if (expr.toString().charAt(0) === '{') {\n                expr = ['(', expr, ')'];\n            }\n            result.push(expr);\n        } else {\n            result.push(maybeBlock(node.body, false, true));\n        }\n        return result;\n    }\n\n    function generateIterationForStatement(operator, stmt, semicolonIsNotNeeded) {\n        var result = ['for' + space + '('];\n        withIndent(function () {\n            if (stmt.left.type === Syntax.VariableDeclaration) {\n                withIndent(function () {\n                    result.push(stmt.left.kind + noEmptySpace());\n                    result.push(generateStatement(stmt.left.declarations[0], {\n                        allowIn: false\n                    }));\n                });\n            } else {\n                result.push(generateExpression(stmt.left, {\n                    precedence: Precedence.Call,\n                    allowIn: true,\n                    allowCall: true\n                }));\n            }\n\n            result = join(result, operator);\n            result = [join(\n                result,\n                generateExpression(stmt.right, {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: true\n                })\n            ), ')'];\n        });\n        result.push(maybeBlock(stmt.body, semicolonIsNotNeeded));\n        return result;\n    }\n\n    function generateLiteral(expr) {\n        var raw;\n        if (expr.hasOwnProperty('raw') && parse && extra.raw) {\n            try {\n                raw = parse(expr.raw).body[0].expression;\n                if (raw.type === Syntax.Literal) {\n                    if (raw.value === expr.value) {\n                        return expr.raw;\n                    }\n                }\n            } catch (e) {\n                // not use raw property\n            }\n        }\n\n        if (expr.value === null) {\n            return 'null';\n        }\n\n        if (typeof expr.value === 'string') {\n            return escapeString(expr.value);\n        }\n\n        if (typeof expr.value === 'number') {\n            return generateNumber(expr.value);\n        }\n\n        if (typeof expr.value === 'boolean') {\n            return expr.value ? 'true' : 'false';\n        }\n\n        return generateRegExp(expr.value);\n    }\n\n    function generateExpression(expr, option) {\n        var result,\n            precedence,\n            type,\n            currentPrecedence,\n            i,\n            len,\n            fragment,\n            multiline,\n            leftCharCode,\n            leftSource,\n            rightCharCode,\n            allowIn,\n            allowCall,\n            allowUnparenthesizedNew,\n            property,\n            isGenerator;\n\n        precedence = option.precedence;\n        allowIn = option.allowIn;\n        allowCall = option.allowCall;\n        type = expr.type || option.type;\n\n        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {\n            return generateVerbatim(expr, option);\n        }\n\n        switch (type) {\n        case Syntax.SequenceExpression:\n            result = [];\n            allowIn |= (Precedence.Sequence < precedence);\n            for (i = 0, len = expr.expressions.length; i < len; ++i) {\n                result.push(generateExpression(expr.expressions[i], {\n                    precedence: Precedence.Assignment,\n                    allowIn: allowIn,\n                    allowCall: true\n                }));\n                if (i + 1 < len) {\n                    result.push(',' + space);\n                }\n            }\n            result = parenthesize(result, Precedence.Sequence, precedence);\n            break;\n\n        case Syntax.AssignmentExpression:\n            allowIn |= (Precedence.Assignment < precedence);\n            result = parenthesize(\n                [\n                    generateExpression(expr.left, {\n                        precedence: Precedence.Call,\n                        allowIn: allowIn,\n                        allowCall: true\n                    }),\n                    space + expr.operator + space,\n                    generateExpression(expr.right, {\n                        precedence: Precedence.Assignment,\n                        allowIn: allowIn,\n                        allowCall: true\n                    })\n                ],\n                Precedence.Assignment,\n                precedence\n            );\n            break;\n\n        case Syntax.ArrowFunctionExpression:\n            allowIn |= (Precedence.ArrowFunction < precedence);\n            result = parenthesize(generateFunctionBody(expr), Precedence.ArrowFunction, precedence);\n            break;\n\n        case Syntax.ConditionalExpression:\n            allowIn |= (Precedence.Conditional < precedence);\n            result = parenthesize(\n                [\n                    generateExpression(expr.test, {\n                        precedence: Precedence.LogicalOR,\n                        allowIn: allowIn,\n                        allowCall: true\n                    }),\n                    space + '?' + space,\n                    generateExpression(expr.consequent, {\n                        precedence: Precedence.Assignment,\n                        allowIn: allowIn,\n                        allowCall: true\n                    }),\n                    space + ':' + space,\n                    generateExpression(expr.alternate, {\n                        precedence: Precedence.Assignment,\n                        allowIn: allowIn,\n                        allowCall: true\n                    })\n                ],\n                Precedence.Conditional,\n                precedence\n            );\n            break;\n\n        case Syntax.LogicalExpression:\n        case Syntax.BinaryExpression:\n            currentPrecedence = BinaryPrecedence[expr.operator];\n\n            allowIn |= (currentPrecedence < precedence);\n\n            fragment = generateExpression(expr.left, {\n                precedence: currentPrecedence,\n                allowIn: allowIn,\n                allowCall: true\n            });\n\n            leftSource = fragment.toString();\n\n            if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(expr.operator.charCodeAt(0))) {\n                result = [fragment, noEmptySpace(), expr.operator];\n            } else {\n                result = join(fragment, expr.operator);\n            }\n\n            fragment = generateExpression(expr.right, {\n                precedence: currentPrecedence + 1,\n                allowIn: allowIn,\n                allowCall: true\n            });\n\n            if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||\n            expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {\n                // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start\n                result.push(noEmptySpace());\n                result.push(fragment);\n            } else {\n                result = join(result, fragment);\n            }\n\n            if (expr.operator === 'in' && !allowIn) {\n                result = ['(', result, ')'];\n            } else {\n                result = parenthesize(result, currentPrecedence, precedence);\n            }\n\n            break;\n\n        case Syntax.CallExpression:\n            result = [generateExpression(expr.callee, {\n                precedence: Precedence.Call,\n                allowIn: true,\n                allowCall: true,\n                allowUnparenthesizedNew: false\n            })];\n\n            result.push('(');\n            for (i = 0, len = expr['arguments'].length; i < len; ++i) {\n                result.push(generateExpression(expr['arguments'][i], {\n                    precedence: Precedence.Assignment,\n                    allowIn: true,\n                    allowCall: true\n                }));\n                if (i + 1 < len) {\n                    result.push(',' + space);\n                }\n            }\n            result.push(')');\n\n            if (!allowCall) {\n                result = ['(', result, ')'];\n            } else {\n                result = parenthesize(result, Precedence.Call, precedence);\n            }\n            break;\n\n        case Syntax.NewExpression:\n            len = expr['arguments'].length;\n            allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;\n\n            result = join(\n                'new',\n                generateExpression(expr.callee, {\n                    precedence: Precedence.New,\n                    allowIn: true,\n                    allowCall: false,\n                    allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0\n                })\n            );\n\n            if (!allowUnparenthesizedNew || parentheses || len > 0) {\n                result.push('(');\n                for (i = 0; i < len; ++i) {\n                    result.push(generateExpression(expr['arguments'][i], {\n                        precedence: Precedence.Assignment,\n                        allowIn: true,\n                        allowCall: true\n                    }));\n                    if (i + 1 < len) {\n                        result.push(',' + space);\n                    }\n                }\n                result.push(')');\n            }\n\n            result = parenthesize(result, Precedence.New, precedence);\n            break;\n\n        case Syntax.MemberExpression:\n            result = [generateExpression(expr.object, {\n                precedence: Precedence.Call,\n                allowIn: true,\n                allowCall: allowCall,\n                allowUnparenthesizedNew: false\n            })];\n\n            if (expr.computed) {\n                result.push('[');\n                result.push(generateExpression(expr.property, {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: allowCall\n                }));\n                result.push(']');\n            } else {\n                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {\n                    fragment = toSourceNodeWhenNeeded(result).toString();\n                    // When the following conditions are all true,\n                    //   1. No floating point\n                    //   2. Don't have exponents\n                    //   3. The last character is a decimal digit\n                    //   4. Not hexadecimal OR octal number literal\n                    // we should add a floating point.\n                    if (\n                            fragment.indexOf('.') < 0 &&\n                            !/[eExX]/.test(fragment) &&\n                            esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&\n                            !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)  // '0'\n                            ) {\n                        result.push('.');\n                    }\n                }\n                result.push('.');\n                result.push(generateIdentifier(expr.property));\n            }\n\n            result = parenthesize(result, Precedence.Member, precedence);\n            break;\n\n        case Syntax.UnaryExpression:\n            fragment = generateExpression(expr.argument, {\n                precedence: Precedence.Unary,\n                allowIn: true,\n                allowCall: true\n            });\n\n            if (space === '') {\n                result = join(expr.operator, fragment);\n            } else {\n                result = [expr.operator];\n                if (expr.operator.length > 2) {\n                    // delete, void, typeof\n                    // get `typeof []`, not `typeof[]`\n                    result = join(result, fragment);\n                } else {\n                    // Prevent inserting spaces between operator and argument if it is unnecessary\n                    // like, `!cond`\n                    leftSource = toSourceNodeWhenNeeded(result).toString();\n                    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);\n                    rightCharCode = fragment.toString().charCodeAt(0);\n\n                    if (((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode) ||\n                            (esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode))) {\n                        result.push(noEmptySpace());\n                        result.push(fragment);\n                    } else {\n                        result.push(fragment);\n                    }\n                }\n            }\n            result = parenthesize(result, Precedence.Unary, precedence);\n            break;\n\n        case Syntax.YieldExpression:\n            if (expr.delegate) {\n                result = 'yield*';\n            } else {\n                result = 'yield';\n            }\n            if (expr.argument) {\n                result = join(\n                    result,\n                    generateExpression(expr.argument, {\n                        precedence: Precedence.Yield,\n                        allowIn: true,\n                        allowCall: true\n                    })\n                );\n            }\n            result = parenthesize(result, Precedence.Yield, precedence);\n            break;\n\n        case Syntax.UpdateExpression:\n            if (expr.prefix) {\n                result = parenthesize(\n                    [\n                        expr.operator,\n                        generateExpression(expr.argument, {\n                            precedence: Precedence.Unary,\n                            allowIn: true,\n                            allowCall: true\n                        })\n                    ],\n                    Precedence.Unary,\n                    precedence\n                );\n            } else {\n                result = parenthesize(\n                    [\n                        generateExpression(expr.argument, {\n                            precedence: Precedence.Postfix,\n                            allowIn: true,\n                            allowCall: true\n                        }),\n                        expr.operator\n                    ],\n                    Precedence.Postfix,\n                    precedence\n                );\n            }\n            break;\n\n        case Syntax.FunctionExpression:\n            isGenerator = expr.generator && !extra.moz.starlessGenerator;\n            result = isGenerator ? 'function*' : 'function';\n\n            if (expr.id) {\n                result = [result, (isGenerator) ? space : noEmptySpace(),\n                          generateIdentifier(expr.id),\n                          generateFunctionBody(expr)];\n            } else {\n                result = [result + space, generateFunctionBody(expr)];\n            }\n\n            break;\n\n        case Syntax.ArrayPattern:\n        case Syntax.ArrayExpression:\n            if (!expr.elements.length) {\n                result = '[]';\n                break;\n            }\n            multiline = expr.elements.length > 1;\n            result = ['[', multiline ? newline : ''];\n            withIndent(function (indent) {\n                for (i = 0, len = expr.elements.length; i < len; ++i) {\n                    if (!expr.elements[i]) {\n                        if (multiline) {\n                            result.push(indent);\n                        }\n                        if (i + 1 === len) {\n                            result.push(',');\n                        }\n                    } else {\n                        result.push(multiline ? indent : '');\n                        result.push(generateExpression(expr.elements[i], {\n                            precedence: Precedence.Assignment,\n                            allowIn: true,\n                            allowCall: true\n                        }));\n                    }\n                    if (i + 1 < len) {\n                        result.push(',' + (multiline ? newline : space));\n                    }\n                }\n            });\n            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                result.push(newline);\n            }\n            result.push(multiline ? base : '');\n            result.push(']');\n            break;\n\n        case Syntax.Property:\n            if (expr.kind === 'get' || expr.kind === 'set') {\n                result = [\n                    expr.kind, noEmptySpace(),\n                    generateExpression(expr.key, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    generateFunctionBody(expr.value)\n                ];\n            } else {\n                if (expr.shorthand) {\n                    result = generateExpression(expr.key, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    });\n                } else if (expr.method) {\n                    result = [];\n                    if (expr.value.generator) {\n                        result.push('*');\n                    }\n                    result.push(generateExpression(expr.key, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }));\n                    result.push(generateFunctionBody(expr.value));\n                } else {\n                    result = [\n                        generateExpression(expr.key, {\n                            precedence: Precedence.Sequence,\n                            allowIn: true,\n                            allowCall: true\n                        }),\n                        ':' + space,\n                        generateExpression(expr.value, {\n                            precedence: Precedence.Assignment,\n                            allowIn: true,\n                            allowCall: true\n                        })\n                    ];\n                }\n            }\n            break;\n\n        case Syntax.ObjectExpression:\n            if (!expr.properties.length) {\n                result = '{}';\n                break;\n            }\n            multiline = expr.properties.length > 1;\n\n            withIndent(function () {\n                fragment = generateExpression(expr.properties[0], {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: true,\n                    type: Syntax.Property\n                });\n            });\n\n            if (!multiline) {\n                // issues 4\n                // Do not transform from\n                //   dejavu.Class.declare({\n                //       method2: function () {}\n                //   });\n                // to\n                //   dejavu.Class.declare({method2: function () {\n                //       }});\n                if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                    result = [ '{', space, fragment, space, '}' ];\n                    break;\n                }\n            }\n\n            withIndent(function (indent) {\n                result = [ '{', newline, indent, fragment ];\n\n                if (multiline) {\n                    result.push(',' + newline);\n                    for (i = 1, len = expr.properties.length; i < len; ++i) {\n                        result.push(indent);\n                        result.push(generateExpression(expr.properties[i], {\n                            precedence: Precedence.Sequence,\n                            allowIn: true,\n                            allowCall: true,\n                            type: Syntax.Property\n                        }));\n                        if (i + 1 < len) {\n                            result.push(',' + newline);\n                        }\n                    }\n                }\n            });\n\n            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                result.push(newline);\n            }\n            result.push(base);\n            result.push('}');\n            break;\n\n        case Syntax.ObjectPattern:\n            if (!expr.properties.length) {\n                result = '{}';\n                break;\n            }\n\n            multiline = false;\n            if (expr.properties.length === 1) {\n                property = expr.properties[0];\n                if (property.value.type !== Syntax.Identifier) {\n                    multiline = true;\n                }\n            } else {\n                for (i = 0, len = expr.properties.length; i < len; ++i) {\n                    property = expr.properties[i];\n                    if (!property.shorthand) {\n                        multiline = true;\n                        break;\n                    }\n                }\n            }\n            result = ['{', multiline ? newline : '' ];\n\n            withIndent(function (indent) {\n                for (i = 0, len = expr.properties.length; i < len; ++i) {\n                    result.push(multiline ? indent : '');\n                    result.push(generateExpression(expr.properties[i], {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }));\n                    if (i + 1 < len) {\n                        result.push(',' + (multiline ? newline : space));\n                    }\n                }\n            });\n\n            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                result.push(newline);\n            }\n            result.push(multiline ? base : '');\n            result.push('}');\n            break;\n\n        case Syntax.ThisExpression:\n            result = 'this';\n            break;\n\n        case Syntax.Identifier:\n            result = generateIdentifier(expr);\n            break;\n\n        case Syntax.Literal:\n            result = generateLiteral(expr);\n            break;\n\n        case Syntax.GeneratorExpression:\n        case Syntax.ComprehensionExpression:\n            // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]\n            // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6\n            result = (type === Syntax.GeneratorExpression) ? ['('] : ['['];\n\n            if (extra.moz.comprehensionExpressionStartsWithAssignment) {\n                fragment = generateExpression(expr.body, {\n                    precedence: Precedence.Assignment,\n                    allowIn: true,\n                    allowCall: true\n                });\n\n                result.push(fragment);\n            }\n\n            if (expr.blocks) {\n                withIndent(function () {\n                    for (i = 0, len = expr.blocks.length; i < len; ++i) {\n                        fragment = generateExpression(expr.blocks[i], {\n                            precedence: Precedence.Sequence,\n                            allowIn: true,\n                            allowCall: true\n                        });\n\n                        if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {\n                            result = join(result, fragment);\n                        } else {\n                            result.push(fragment);\n                        }\n                    }\n                });\n            }\n\n            if (expr.filter) {\n                result = join(result, 'if' + space);\n                fragment = generateExpression(expr.filter, {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: true\n                });\n                if (extra.moz.parenthesizedComprehensionBlock) {\n                    result = join(result, [ '(', fragment, ')' ]);\n                } else {\n                    result = join(result, fragment);\n                }\n            }\n\n            if (!extra.moz.comprehensionExpressionStartsWithAssignment) {\n                fragment = generateExpression(expr.body, {\n                    precedence: Precedence.Assignment,\n                    allowIn: true,\n                    allowCall: true\n                });\n\n                result = join(result, fragment);\n            }\n\n            result.push((type === Syntax.GeneratorExpression) ? ')' : ']');\n            break;\n\n        case Syntax.ComprehensionBlock:\n            if (expr.left.type === Syntax.VariableDeclaration) {\n                fragment = [\n                    expr.left.kind, noEmptySpace(),\n                    generateStatement(expr.left.declarations[0], {\n                        allowIn: false\n                    })\n                ];\n            } else {\n                fragment = generateExpression(expr.left, {\n                    precedence: Precedence.Call,\n                    allowIn: true,\n                    allowCall: true\n                });\n            }\n\n            fragment = join(fragment, expr.of ? 'of' : 'in');\n            fragment = join(fragment, generateExpression(expr.right, {\n                precedence: Precedence.Sequence,\n                allowIn: true,\n                allowCall: true\n            }));\n\n            if (extra.moz.parenthesizedComprehensionBlock) {\n                result = [ 'for' + space + '(', fragment, ')' ];\n            } else {\n                result = join('for' + space, fragment);\n            }\n            break;\n\n        default:\n            throw new Error('Unknown expression type: ' + expr.type);\n        }\n\n        if (extra.comment) {\n            result = addComments(expr,result);\n        }\n        return toSourceNodeWhenNeeded(result, expr);\n    }\n\n    function generateStatement(stmt, option) {\n        var i,\n            len,\n            result,\n            node,\n            specifier,\n            allowIn,\n            functionBody,\n            directiveContext,\n            fragment,\n            semicolon,\n            isGenerator;\n\n        allowIn = true;\n        semicolon = ';';\n        functionBody = false;\n        directiveContext = false;\n        if (option) {\n            allowIn = option.allowIn === undefined || option.allowIn;\n            if (!semicolons && option.semicolonOptional === true) {\n                semicolon = '';\n            }\n            functionBody = option.functionBody;\n            directiveContext = option.directiveContext;\n        }\n\n        switch (stmt.type) {\n        case Syntax.BlockStatement:\n            result = ['{', newline];\n\n            withIndent(function () {\n                for (i = 0, len = stmt.body.length; i < len; ++i) {\n                    fragment = addIndent(generateStatement(stmt.body[i], {\n                        semicolonOptional: i === len - 1,\n                        directiveContext: functionBody\n                    }));\n                    result.push(fragment);\n                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                        result.push(newline);\n                    }\n                }\n            });\n\n            result.push(addIndent('}'));\n            break;\n\n        case Syntax.BreakStatement:\n            if (stmt.label) {\n                result = 'break ' + stmt.label.name + semicolon;\n            } else {\n                result = 'break' + semicolon;\n            }\n            break;\n\n        case Syntax.ContinueStatement:\n            if (stmt.label) {\n                result = 'continue ' + stmt.label.name + semicolon;\n            } else {\n                result = 'continue' + semicolon;\n            }\n            break;\n\n        case Syntax.DirectiveStatement:\n            if (extra.raw && stmt.raw) {\n                result = stmt.raw + semicolon;\n            } else {\n                result = escapeDirective(stmt.directive) + semicolon;\n            }\n            break;\n\n        case Syntax.DoWhileStatement:\n            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.\n            result = join('do', maybeBlock(stmt.body));\n            result = maybeBlockSuffix(stmt.body, result);\n            result = join(result, [\n                'while' + space + '(',\n                generateExpression(stmt.test, {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: true\n                }),\n                ')' + semicolon\n            ]);\n            break;\n\n        case Syntax.CatchClause:\n            withIndent(function () {\n                var guard;\n\n                result = [\n                    'catch' + space + '(',\n                    generateExpression(stmt.param, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    ')'\n                ];\n\n                if (stmt.guard) {\n                    guard = generateExpression(stmt.guard, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    });\n\n                    result.splice(2, 0, ' if ', guard);\n                }\n            });\n            result.push(maybeBlock(stmt.body));\n            break;\n\n        case Syntax.DebuggerStatement:\n            result = 'debugger' + semicolon;\n            break;\n\n        case Syntax.EmptyStatement:\n            result = ';';\n            break;\n\n        case Syntax.ExportDeclaration:\n            result = 'export ';\n            if (stmt.declaration) {\n                // FunctionDeclaration or VariableDeclaration\n                result = [result, generateStatement(stmt.declaration, { semicolonOptional: semicolon === '' })];\n                break;\n            }\n            break;\n\n        case Syntax.ExpressionStatement:\n            result = [generateExpression(stmt.expression, {\n                precedence: Precedence.Sequence,\n                allowIn: true,\n                allowCall: true\n            })];\n            // 12.4 '{', 'function' is not allowed in this position.\n            // wrap expression with parentheses\n            fragment = toSourceNodeWhenNeeded(result).toString();\n            if (fragment.charAt(0) === '{' ||  // ObjectExpression\n                    (fragment.slice(0, 8) === 'function' && '* ('.indexOf(fragment.charAt(8)) >= 0) ||  // function or generator\n                    (directive && directiveContext && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string')) {\n                result = ['(', result, ')' + semicolon];\n            } else {\n                result.push(semicolon);\n            }\n            break;\n\n        case Syntax.ImportDeclaration:\n            // ES6: 15.2.1 valid import declarations:\n            //     - import ImportClause FromClause ;\n            //     - import ModuleSpecifier ;\n            // If no ImportClause is present,\n            // this should be `import ModuleSpecifier` so skip `from`\n            //\n            // ModuleSpecifier is StringLiteral.\n            if (stmt.specifiers.length === 0) {\n                // import ModuleSpecifier ;\n                result = [\n                    'import',\n                    space,\n                    generateLiteral(stmt.source)\n                ];\n            } else {\n                // import ImportClause FromClause ;\n                if (stmt.kind === 'default') {\n                    // import ... from \"...\";\n                    result = [\n                        'import',\n                        noEmptySpace(),\n                        stmt.specifiers[0].id.name,\n                        noEmptySpace()\n                    ];\n                } else {\n                    // stmt.kind === 'named'\n                    result = [\n                        'import',\n                        space,\n                        '{',\n                    ];\n\n                    if (stmt.specifiers.length === 1) {\n                        // import { ... } from \"...\";\n                        specifier = stmt.specifiers[0];\n                        result.push(space + specifier.id.name);\n                        if (specifier.name) {\n                            result.push(noEmptySpace() + 'as' + noEmptySpace() + specifier.name.name);\n                        }\n                        result.push(space + '}' + space);\n                    } else {\n                        // import {\n                        //    ...,\n                        //    ...,\n                        // } from \"...\";\n                        withIndent(function (indent) {\n                            var i, iz;\n                            result.push(newline);\n                            for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {\n                                specifier = stmt.specifiers[i];\n                                result.push(indent + specifier.id.name);\n                                if (specifier.name) {\n                                    result.push(noEmptySpace() + 'as' + noEmptySpace() + specifier.name.name);\n                                }\n\n                                if (i + 1 < iz) {\n                                    result.push(',' + newline);\n                                }\n                            }\n                        });\n                        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                            result.push(newline);\n                        }\n                        result.push(base + '}' + space);\n                    }\n                }\n\n                result.push('from' + space);\n                result.push(generateLiteral(stmt.source));\n            }\n            result.push(semicolon);\n            break;\n\n        case Syntax.VariableDeclarator:\n            if (stmt.init) {\n                result = [\n                    generateExpression(stmt.id, {\n                        precedence: Precedence.Assignment,\n                        allowIn: allowIn,\n                        allowCall: true\n                    }),\n                    space,\n                    '=',\n                    space,\n                    generateExpression(stmt.init, {\n                        precedence: Precedence.Assignment,\n                        allowIn: allowIn,\n                        allowCall: true\n                    })\n                ];\n            } else {\n                result = generatePattern(stmt.id, {\n                    precedence: Precedence.Assignment,\n                    allowIn: allowIn\n                });\n            }\n            break;\n\n        case Syntax.VariableDeclaration:\n            result = [stmt.kind];\n            // special path for\n            // var x = function () {\n            // };\n            if (stmt.declarations.length === 1 && stmt.declarations[0].init &&\n                    stmt.declarations[0].init.type === Syntax.FunctionExpression) {\n                result.push(noEmptySpace());\n                result.push(generateStatement(stmt.declarations[0], {\n                    allowIn: allowIn\n                }));\n            } else {\n                // VariableDeclarator is typed as Statement,\n                // but joined with comma (not LineTerminator).\n                // So if comment is attached to target node, we should specialize.\n                withIndent(function () {\n                    node = stmt.declarations[0];\n                    if (extra.comment && node.leadingComments) {\n                        result.push('\\n');\n                        result.push(addIndent(generateStatement(node, {\n                            allowIn: allowIn\n                        })));\n                    } else {\n                        result.push(noEmptySpace());\n                        result.push(generateStatement(node, {\n                            allowIn: allowIn\n                        }));\n                    }\n\n                    for (i = 1, len = stmt.declarations.length; i < len; ++i) {\n                        node = stmt.declarations[i];\n                        if (extra.comment && node.leadingComments) {\n                            result.push(',' + newline);\n                            result.push(addIndent(generateStatement(node, {\n                                allowIn: allowIn\n                            })));\n                        } else {\n                            result.push(',' + space);\n                            result.push(generateStatement(node, {\n                                allowIn: allowIn\n                            }));\n                        }\n                    }\n                });\n            }\n            result.push(semicolon);\n            break;\n\n        case Syntax.ThrowStatement:\n            result = [join(\n                'throw',\n                generateExpression(stmt.argument, {\n                    precedence: Precedence.Sequence,\n                    allowIn: true,\n                    allowCall: true\n                })\n            ), semicolon];\n            break;\n\n        case Syntax.TryStatement:\n            result = ['try', maybeBlock(stmt.block)];\n            result = maybeBlockSuffix(stmt.block, result);\n\n            if (stmt.handlers) {\n                // old interface\n                for (i = 0, len = stmt.handlers.length; i < len; ++i) {\n                    result = join(result, generateStatement(stmt.handlers[i]));\n                    if (stmt.finalizer || i + 1 !== len) {\n                        result = maybeBlockSuffix(stmt.handlers[i].body, result);\n                    }\n                }\n            } else {\n                stmt.guardedHandlers = stmt.guardedHandlers || [];\n\n                for (i = 0, len = stmt.guardedHandlers.length; i < len; ++i) {\n                    result = join(result, generateStatement(stmt.guardedHandlers[i]));\n                    if (stmt.finalizer || i + 1 !== len) {\n                        result = maybeBlockSuffix(stmt.guardedHandlers[i].body, result);\n                    }\n                }\n\n                // new interface\n                if (stmt.handler) {\n                    if (isArray(stmt.handler)) {\n                        for (i = 0, len = stmt.handler.length; i < len; ++i) {\n                            result = join(result, generateStatement(stmt.handler[i]));\n                            if (stmt.finalizer || i + 1 !== len) {\n                                result = maybeBlockSuffix(stmt.handler[i].body, result);\n                            }\n                        }\n                    } else {\n                        result = join(result, generateStatement(stmt.handler));\n                        if (stmt.finalizer) {\n                            result = maybeBlockSuffix(stmt.handler.body, result);\n                        }\n                    }\n                }\n            }\n            if (stmt.finalizer) {\n                result = join(result, ['finally', maybeBlock(stmt.finalizer)]);\n            }\n            break;\n\n        case Syntax.SwitchStatement:\n            withIndent(function () {\n                result = [\n                    'switch' + space + '(',\n                    generateExpression(stmt.discriminant, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    ')' + space + '{' + newline\n                ];\n            });\n            if (stmt.cases) {\n                for (i = 0, len = stmt.cases.length; i < len; ++i) {\n                    fragment = addIndent(generateStatement(stmt.cases[i], {semicolonOptional: i === len - 1}));\n                    result.push(fragment);\n                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                        result.push(newline);\n                    }\n                }\n            }\n            result.push(addIndent('}'));\n            break;\n\n        case Syntax.SwitchCase:\n            withIndent(function () {\n                if (stmt.test) {\n                    result = [\n                        join('case', generateExpression(stmt.test, {\n                            precedence: Precedence.Sequence,\n                            allowIn: true,\n                            allowCall: true\n                        })),\n                        ':'\n                    ];\n                } else {\n                    result = ['default:'];\n                }\n\n                i = 0;\n                len = stmt.consequent.length;\n                if (len && stmt.consequent[0].type === Syntax.BlockStatement) {\n                    fragment = maybeBlock(stmt.consequent[0]);\n                    result.push(fragment);\n                    i = 1;\n                }\n\n                if (i !== len && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {\n                    result.push(newline);\n                }\n\n                for (; i < len; ++i) {\n                    fragment = addIndent(generateStatement(stmt.consequent[i], {semicolonOptional: i === len - 1 && semicolon === ''}));\n                    result.push(fragment);\n                    if (i + 1 !== len && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                        result.push(newline);\n                    }\n                }\n            });\n            break;\n\n        case Syntax.IfStatement:\n            withIndent(function () {\n                result = [\n                    'if' + space + '(',\n                    generateExpression(stmt.test, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    ')'\n                ];\n            });\n            if (stmt.alternate) {\n                result.push(maybeBlock(stmt.consequent));\n                result = maybeBlockSuffix(stmt.consequent, result);\n                if (stmt.alternate.type === Syntax.IfStatement) {\n                    result = join(result, ['else ', generateStatement(stmt.alternate, {semicolonOptional: semicolon === ''})]);\n                } else {\n                    result = join(result, join('else', maybeBlock(stmt.alternate, semicolon === '')));\n                }\n            } else {\n                result.push(maybeBlock(stmt.consequent, semicolon === ''));\n            }\n            break;\n\n        case Syntax.ForStatement:\n            withIndent(function () {\n                result = ['for' + space + '('];\n                if (stmt.init) {\n                    if (stmt.init.type === Syntax.VariableDeclaration) {\n                        result.push(generateStatement(stmt.init, {allowIn: false}));\n                    } else {\n                        result.push(generateExpression(stmt.init, {\n                            precedence: Precedence.Sequence,\n                            allowIn: false,\n                            allowCall: true\n                        }));\n                        result.push(';');\n                    }\n                } else {\n                    result.push(';');\n                }\n\n                if (stmt.test) {\n                    result.push(space);\n                    result.push(generateExpression(stmt.test, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }));\n                    result.push(';');\n                } else {\n                    result.push(';');\n                }\n\n                if (stmt.update) {\n                    result.push(space);\n                    result.push(generateExpression(stmt.update, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }));\n                    result.push(')');\n                } else {\n                    result.push(')');\n                }\n            });\n\n            result.push(maybeBlock(stmt.body, semicolon === ''));\n            break;\n\n        case Syntax.ForInStatement:\n            result = generateIterationForStatement('in', stmt, semicolon === '');\n            break;\n\n        case Syntax.ForOfStatement:\n            result = generateIterationForStatement('of', stmt, semicolon === '');\n            break;\n\n        case Syntax.LabeledStatement:\n            result = [stmt.label.name + ':', maybeBlock(stmt.body, semicolon === '')];\n            break;\n\n        case Syntax.Program:\n            len = stmt.body.length;\n            result = [safeConcatenation && len > 0 ? '\\n' : ''];\n            for (i = 0; i < len; ++i) {\n                fragment = addIndent(\n                    generateStatement(stmt.body[i], {\n                        semicolonOptional: !safeConcatenation && i === len - 1,\n                        directiveContext: true\n                    })\n                );\n                result.push(fragment);\n                if (i + 1 < len && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {\n                    result.push(newline);\n                }\n            }\n            break;\n\n        case Syntax.FunctionDeclaration:\n            isGenerator = stmt.generator && !extra.moz.starlessGenerator;\n            result = [\n                (isGenerator ? 'function*' : 'function'),\n                (isGenerator ? space : noEmptySpace()),\n                generateIdentifier(stmt.id),\n                generateFunctionBody(stmt)\n            ];\n            break;\n\n        case Syntax.ReturnStatement:\n            if (stmt.argument) {\n                result = [join(\n                    'return',\n                    generateExpression(stmt.argument, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    })\n                ), semicolon];\n            } else {\n                result = ['return' + semicolon];\n            }\n            break;\n\n        case Syntax.WhileStatement:\n            withIndent(function () {\n                result = [\n                    'while' + space + '(',\n                    generateExpression(stmt.test, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    ')'\n                ];\n            });\n            result.push(maybeBlock(stmt.body, semicolon === ''));\n            break;\n\n        case Syntax.WithStatement:\n            withIndent(function () {\n                result = [\n                    'with' + space + '(',\n                    generateExpression(stmt.object, {\n                        precedence: Precedence.Sequence,\n                        allowIn: true,\n                        allowCall: true\n                    }),\n                    ')'\n                ];\n            });\n            result.push(maybeBlock(stmt.body, semicolon === ''));\n            break;\n\n        default:\n            throw new Error('Unknown statement type: ' + stmt.type);\n        }\n\n        // Attach comments\n\n        if (extra.comment) {\n            result = addComments(stmt, result);\n        }\n\n        fragment = toSourceNodeWhenNeeded(result).toString();\n        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\\n') {\n            result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\\s+$/, '') : fragment.replace(/\\s+$/, '');\n        }\n\n        return toSourceNodeWhenNeeded(result, stmt);\n    }\n\n    function generate(node, options) {\n        var defaultOptions = getDefaultOptions(), result, pair;\n\n        if (options != null) {\n            // Obsolete options\n            //\n            //   `options.indent`\n            //   `options.base`\n            //\n            // Instead of them, we can use `option.format.indent`.\n            if (typeof options.indent === 'string') {\n                defaultOptions.format.indent.style = options.indent;\n            }\n            if (typeof options.base === 'number') {\n                defaultOptions.format.indent.base = options.base;\n            }\n            options = updateDeeply(defaultOptions, options);\n            indent = options.format.indent.style;\n            if (typeof options.base === 'string') {\n                base = options.base;\n            } else {\n                base = stringRepeat(indent, options.format.indent.base);\n            }\n        } else {\n            options = defaultOptions;\n            indent = options.format.indent.style;\n            base = stringRepeat(indent, options.format.indent.base);\n        }\n        json = options.format.json;\n        renumber = options.format.renumber;\n        hexadecimal = json ? false : options.format.hexadecimal;\n        quotes = json ? 'double' : options.format.quotes;\n        escapeless = options.format.escapeless;\n        newline = options.format.newline;\n        space = options.format.space;\n        if (options.format.compact) {\n            newline = space = indent = base = '';\n        }\n        parentheses = options.format.parentheses;\n        semicolons = options.format.semicolons;\n        safeConcatenation = options.format.safeConcatenation;\n        directive = options.directive;\n        parse = json ? null : options.parse;\n        sourceMap = options.sourceMap;\n        extra = options;\n\n        if (sourceMap) {\n            if (!exports.browser) {\n                // We assume environment is node.js\n                // And prevent from including source-map by browserify\n                SourceNode = __webpack_require__(/*! source-map */ \"./node_modules/escodegen/node_modules/source-map/lib/source-map.js\").SourceNode;\n            } else {\n                SourceNode = global.sourceMap.SourceNode;\n            }\n        }\n\n        switch (node.type) {\n        case Syntax.BlockStatement:\n        case Syntax.BreakStatement:\n        case Syntax.CatchClause:\n        case Syntax.ContinueStatement:\n        case Syntax.DirectiveStatement:\n        case Syntax.DoWhileStatement:\n        case Syntax.DebuggerStatement:\n        case Syntax.EmptyStatement:\n        case Syntax.ExpressionStatement:\n        case Syntax.ForStatement:\n        case Syntax.ForInStatement:\n        case Syntax.ForOfStatement:\n        case Syntax.FunctionDeclaration:\n        case Syntax.IfStatement:\n        case Syntax.LabeledStatement:\n        case Syntax.Program:\n        case Syntax.ReturnStatement:\n        case Syntax.SwitchStatement:\n        case Syntax.SwitchCase:\n        case Syntax.ThrowStatement:\n        case Syntax.TryStatement:\n        case Syntax.VariableDeclaration:\n        case Syntax.VariableDeclarator:\n        case Syntax.WhileStatement:\n        case Syntax.WithStatement:\n            result = generateStatement(node);\n            break;\n\n        case Syntax.AssignmentExpression:\n        case Syntax.ArrayExpression:\n        case Syntax.ArrayPattern:\n        case Syntax.BinaryExpression:\n        case Syntax.CallExpression:\n        case Syntax.ConditionalExpression:\n        case Syntax.FunctionExpression:\n        case Syntax.Identifier:\n        case Syntax.Literal:\n        case Syntax.LogicalExpression:\n        case Syntax.MemberExpression:\n        case Syntax.NewExpression:\n        case Syntax.ObjectExpression:\n        case Syntax.ObjectPattern:\n        case Syntax.Property:\n        case Syntax.SequenceExpression:\n        case Syntax.ThisExpression:\n        case Syntax.UnaryExpression:\n        case Syntax.UpdateExpression:\n        case Syntax.YieldExpression:\n\n            result = generateExpression(node, {\n                precedence: Precedence.Sequence,\n                allowIn: true,\n                allowCall: true\n            });\n            break;\n\n        default:\n            throw new Error('Unknown node type: ' + node.type);\n        }\n\n        if (!sourceMap) {\n            pair = {code: result.toString(), map: null};\n            return options.sourceMapWithCode ? pair : pair.code;\n        }\n\n\n        pair = result.toStringWithSourceMap({\n            file: options.file,\n            sourceRoot: options.sourceMapRoot\n        });\n\n        if (options.sourceContent) {\n            pair.map.setSourceContent(options.sourceMap,\n                                      options.sourceContent);\n        }\n\n        if (options.sourceMapWithCode) {\n            return pair;\n        }\n\n        return pair.map.toString();\n    }\n\n    FORMAT_MINIFY = {\n        indent: {\n            style: '',\n            base: 0\n        },\n        renumber: true,\n        hexadecimal: true,\n        quotes: 'auto',\n        escapeless: true,\n        compact: true,\n        parentheses: false,\n        semicolons: false\n    };\n\n    FORMAT_DEFAULTS = getDefaultOptions().format;\n\n    exports.version = __webpack_require__(/*! ./package.json */ \"./node_modules/escodegen/package.json\").version;\n    exports.generate = generate;\n    exports.attachComments = estraverse.attachComments;\n    exports.Precedence = updateDeeply({}, Precedence);\n    exports.browser = false;\n    exports.FORMAT_MINIFY = FORMAT_MINIFY;\n    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;\n}());\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./node_modules/escodegen/escodegen.js?");

/***/ }),

/***/ "./node_modules/escodegen/node_modules/estraverse/estraverse.js":
/*!**********************************************************************!*\
  !*** ./node_modules/escodegen/node_modules/estraverse/estraverse.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*\n  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>\n  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n/*jslint vars:false, bitwise:true*/\n/*jshint indent:4*/\n/*global exports:true, define:true*/\n(function (root, factory) {\n    'use strict';\n\n    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,\n    // and plain browser loading,\n    if (true) {\n        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n    } else {}\n}(this, function (exports) {\n    'use strict';\n\n    var Syntax,\n        isArray,\n        VisitorOption,\n        VisitorKeys,\n        BREAK,\n        SKIP;\n\n    Syntax = {\n        AssignmentExpression: 'AssignmentExpression',\n        ArrayExpression: 'ArrayExpression',\n        ArrayPattern: 'ArrayPattern',\n        ArrowFunctionExpression: 'ArrowFunctionExpression',\n        BlockStatement: 'BlockStatement',\n        BinaryExpression: 'BinaryExpression',\n        BreakStatement: 'BreakStatement',\n        CallExpression: 'CallExpression',\n        CatchClause: 'CatchClause',\n        ClassBody: 'ClassBody',\n        ClassDeclaration: 'ClassDeclaration',\n        ClassExpression: 'ClassExpression',\n        ConditionalExpression: 'ConditionalExpression',\n        ContinueStatement: 'ContinueStatement',\n        DebuggerStatement: 'DebuggerStatement',\n        DirectiveStatement: 'DirectiveStatement',\n        DoWhileStatement: 'DoWhileStatement',\n        EmptyStatement: 'EmptyStatement',\n        ExpressionStatement: 'ExpressionStatement',\n        ForStatement: 'ForStatement',\n        ForInStatement: 'ForInStatement',\n        FunctionDeclaration: 'FunctionDeclaration',\n        FunctionExpression: 'FunctionExpression',\n        Identifier: 'Identifier',\n        IfStatement: 'IfStatement',\n        Literal: 'Literal',\n        LabeledStatement: 'LabeledStatement',\n        LogicalExpression: 'LogicalExpression',\n        MemberExpression: 'MemberExpression',\n        MethodDefinition: 'MethodDefinition',\n        NewExpression: 'NewExpression',\n        ObjectExpression: 'ObjectExpression',\n        ObjectPattern: 'ObjectPattern',\n        Program: 'Program',\n        Property: 'Property',\n        ReturnStatement: 'ReturnStatement',\n        SequenceExpression: 'SequenceExpression',\n        SwitchStatement: 'SwitchStatement',\n        SwitchCase: 'SwitchCase',\n        ThisExpression: 'ThisExpression',\n        ThrowStatement: 'ThrowStatement',\n        TryStatement: 'TryStatement',\n        UnaryExpression: 'UnaryExpression',\n        UpdateExpression: 'UpdateExpression',\n        VariableDeclaration: 'VariableDeclaration',\n        VariableDeclarator: 'VariableDeclarator',\n        WhileStatement: 'WhileStatement',\n        WithStatement: 'WithStatement',\n        YieldExpression: 'YieldExpression'\n    };\n\n    function ignoreJSHintError() { }\n\n    isArray = Array.isArray;\n    if (!isArray) {\n        isArray = function isArray(array) {\n            return Object.prototype.toString.call(array) === '[object Array]';\n        };\n    }\n\n    function deepCopy(obj) {\n        var ret = {}, key, val;\n        for (key in obj) {\n            if (obj.hasOwnProperty(key)) {\n                val = obj[key];\n                if (typeof val === 'object' && val !== null) {\n                    ret[key] = deepCopy(val);\n                } else {\n                    ret[key] = val;\n                }\n            }\n        }\n        return ret;\n    }\n\n    function shallowCopy(obj) {\n        var ret = {}, key;\n        for (key in obj) {\n            if (obj.hasOwnProperty(key)) {\n                ret[key] = obj[key];\n            }\n        }\n        return ret;\n    }\n    ignoreJSHintError(shallowCopy);\n\n    // based on LLVM libc++ upper_bound / lower_bound\n    // MIT License\n\n    function upperBound(array, func) {\n        var diff, len, i, current;\n\n        len = array.length;\n        i = 0;\n\n        while (len) {\n            diff = len >>> 1;\n            current = i + diff;\n            if (func(array[current])) {\n                len = diff;\n            } else {\n                i = current + 1;\n                len -= diff + 1;\n            }\n        }\n        return i;\n    }\n\n    function lowerBound(array, func) {\n        var diff, len, i, current;\n\n        len = array.length;\n        i = 0;\n\n        while (len) {\n            diff = len >>> 1;\n            current = i + diff;\n            if (func(array[current])) {\n                i = current + 1;\n                len -= diff + 1;\n            } else {\n                len = diff;\n            }\n        }\n        return i;\n    }\n    ignoreJSHintError(lowerBound);\n\n    VisitorKeys = {\n        AssignmentExpression: ['left', 'right'],\n        ArrayExpression: ['elements'],\n        ArrayPattern: ['elements'],\n        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],\n        BlockStatement: ['body'],\n        BinaryExpression: ['left', 'right'],\n        BreakStatement: ['label'],\n        CallExpression: ['callee', 'arguments'],\n        CatchClause: ['param', 'body'],\n        ClassBody: ['body'],\n        ClassDeclaration: ['id', 'body', 'superClass'],\n        ClassExpression: ['id', 'body', 'superClass'],\n        ConditionalExpression: ['test', 'consequent', 'alternate'],\n        ContinueStatement: ['label'],\n        DebuggerStatement: [],\n        DirectiveStatement: [],\n        DoWhileStatement: ['body', 'test'],\n        EmptyStatement: [],\n        ExpressionStatement: ['expression'],\n        ForStatement: ['init', 'test', 'update', 'body'],\n        ForInStatement: ['left', 'right', 'body'],\n        ForOfStatement: ['left', 'right', 'body'],\n        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],\n        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],\n        Identifier: [],\n        IfStatement: ['test', 'consequent', 'alternate'],\n        Literal: [],\n        LabeledStatement: ['label', 'body'],\n        LogicalExpression: ['left', 'right'],\n        MemberExpression: ['object', 'property'],\n        MethodDefinition: ['key', 'value'],\n        NewExpression: ['callee', 'arguments'],\n        ObjectExpression: ['properties'],\n        ObjectPattern: ['properties'],\n        Program: ['body'],\n        Property: ['key', 'value'],\n        ReturnStatement: ['argument'],\n        SequenceExpression: ['expressions'],\n        SwitchStatement: ['discriminant', 'cases'],\n        SwitchCase: ['test', 'consequent'],\n        ThisExpression: [],\n        ThrowStatement: ['argument'],\n        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],\n        UnaryExpression: ['argument'],\n        UpdateExpression: ['argument'],\n        VariableDeclaration: ['declarations'],\n        VariableDeclarator: ['id', 'init'],\n        WhileStatement: ['test', 'body'],\n        WithStatement: ['object', 'body'],\n        YieldExpression: ['argument']\n    };\n\n    // unique id\n    BREAK = {};\n    SKIP = {};\n\n    VisitorOption = {\n        Break: BREAK,\n        Skip: SKIP\n    };\n\n    function Reference(parent, key) {\n        this.parent = parent;\n        this.key = key;\n    }\n\n    Reference.prototype.replace = function replace(node) {\n        this.parent[this.key] = node;\n    };\n\n    function Element(node, path, wrap, ref) {\n        this.node = node;\n        this.path = path;\n        this.wrap = wrap;\n        this.ref = ref;\n    }\n\n    function Controller() { }\n\n    // API:\n    // return property path array from root to current node\n    Controller.prototype.path = function path() {\n        var i, iz, j, jz, result, element;\n\n        function addToPath(result, path) {\n            if (isArray(path)) {\n                for (j = 0, jz = path.length; j < jz; ++j) {\n                    result.push(path[j]);\n                }\n            } else {\n                result.push(path);\n            }\n        }\n\n        // root node\n        if (!this.__current.path) {\n            return null;\n        }\n\n        // first node is sentinel, second node is root element\n        result = [];\n        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {\n            element = this.__leavelist[i];\n            addToPath(result, element.path);\n        }\n        addToPath(result, this.__current.path);\n        return result;\n    };\n\n    // API:\n    // return array of parent elements\n    Controller.prototype.parents = function parents() {\n        var i, iz, result;\n\n        // first node is sentinel\n        result = [];\n        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {\n            result.push(this.__leavelist[i].node);\n        }\n\n        return result;\n    };\n\n    // API:\n    // return current node\n    Controller.prototype.current = function current() {\n        return this.__current.node;\n    };\n\n    Controller.prototype.__execute = function __execute(callback, element) {\n        var previous, result;\n\n        result = undefined;\n\n        previous  = this.__current;\n        this.__current = element;\n        this.__state = null;\n        if (callback) {\n            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);\n        }\n        this.__current = previous;\n\n        return result;\n    };\n\n    // API:\n    // notify control skip / break\n    Controller.prototype.notify = function notify(flag) {\n        this.__state = flag;\n    };\n\n    // API:\n    // skip child nodes of current node\n    Controller.prototype.skip = function () {\n        this.notify(SKIP);\n    };\n\n    // API:\n    // break traversals\n    Controller.prototype['break'] = function () {\n        this.notify(BREAK);\n    };\n\n    Controller.prototype.__initialize = function(root, visitor) {\n        this.visitor = visitor;\n        this.root = root;\n        this.__worklist = [];\n        this.__leavelist = [];\n        this.__current = null;\n        this.__state = null;\n    };\n\n    Controller.prototype.traverse = function traverse(root, visitor) {\n        var worklist,\n            leavelist,\n            element,\n            node,\n            nodeType,\n            ret,\n            key,\n            current,\n            current2,\n            candidates,\n            candidate,\n            sentinel;\n\n        this.__initialize(root, visitor);\n\n        sentinel = {};\n\n        // reference\n        worklist = this.__worklist;\n        leavelist = this.__leavelist;\n\n        // initialize\n        worklist.push(new Element(root, null, null, null));\n        leavelist.push(new Element(null, null, null, null));\n\n        while (worklist.length) {\n            element = worklist.pop();\n\n            if (element === sentinel) {\n                element = leavelist.pop();\n\n                ret = this.__execute(visitor.leave, element);\n\n                if (this.__state === BREAK || ret === BREAK) {\n                    return;\n                }\n                continue;\n            }\n\n            if (element.node) {\n\n                ret = this.__execute(visitor.enter, element);\n\n                if (this.__state === BREAK || ret === BREAK) {\n                    return;\n                }\n\n                worklist.push(sentinel);\n                leavelist.push(element);\n\n                if (this.__state === SKIP || ret === SKIP) {\n                    continue;\n                }\n\n                node = element.node;\n                nodeType = element.wrap || node.type;\n                candidates = VisitorKeys[nodeType];\n\n                current = candidates.length;\n                while ((current -= 1) >= 0) {\n                    key = candidates[current];\n                    candidate = node[key];\n                    if (!candidate) {\n                        continue;\n                    }\n\n                    if (!isArray(candidate)) {\n                        worklist.push(new Element(candidate, key, null, null));\n                        continue;\n                    }\n\n                    current2 = candidate.length;\n                    while ((current2 -= 1) >= 0) {\n                        if (!candidate[current2]) {\n                            continue;\n                        }\n                        if ((nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === candidates[current]) {\n                            element = new Element(candidate[current2], [key, current2], 'Property', null);\n                        } else {\n                            element = new Element(candidate[current2], [key, current2], null, null);\n                        }\n                        worklist.push(element);\n                    }\n                }\n            }\n        }\n    };\n\n    Controller.prototype.replace = function replace(root, visitor) {\n        var worklist,\n            leavelist,\n            node,\n            nodeType,\n            target,\n            element,\n            current,\n            current2,\n            candidates,\n            candidate,\n            sentinel,\n            outer,\n            key;\n\n        this.__initialize(root, visitor);\n\n        sentinel = {};\n\n        // reference\n        worklist = this.__worklist;\n        leavelist = this.__leavelist;\n\n        // initialize\n        outer = {\n            root: root\n        };\n        element = new Element(root, null, null, new Reference(outer, 'root'));\n        worklist.push(element);\n        leavelist.push(element);\n\n        while (worklist.length) {\n            element = worklist.pop();\n\n            if (element === sentinel) {\n                element = leavelist.pop();\n\n                target = this.__execute(visitor.leave, element);\n\n                // node may be replaced with null,\n                // so distinguish between undefined and null in this place\n                if (target !== undefined && target !== BREAK && target !== SKIP) {\n                    // replace\n                    element.ref.replace(target);\n                }\n\n                if (this.__state === BREAK || target === BREAK) {\n                    return outer.root;\n                }\n                continue;\n            }\n\n            target = this.__execute(visitor.enter, element);\n\n            // node may be replaced with null,\n            // so distinguish between undefined and null in this place\n            if (target !== undefined && target !== BREAK && target !== SKIP) {\n                // replace\n                element.ref.replace(target);\n                element.node = target;\n            }\n\n            if (this.__state === BREAK || target === BREAK) {\n                return outer.root;\n            }\n\n            // node may be null\n            node = element.node;\n            if (!node) {\n                continue;\n            }\n\n            worklist.push(sentinel);\n            leavelist.push(element);\n\n            if (this.__state === SKIP || target === SKIP) {\n                continue;\n            }\n\n            nodeType = element.wrap || node.type;\n            candidates = VisitorKeys[nodeType];\n\n            current = candidates.length;\n            while ((current -= 1) >= 0) {\n                key = candidates[current];\n                candidate = node[key];\n                if (!candidate) {\n                    continue;\n                }\n\n                if (!isArray(candidate)) {\n                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));\n                    continue;\n                }\n\n                current2 = candidate.length;\n                while ((current2 -= 1) >= 0) {\n                    if (!candidate[current2]) {\n                        continue;\n                    }\n                    if (nodeType === Syntax.ObjectExpression && 'properties' === candidates[current]) {\n                        element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));\n                    } else {\n                        element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));\n                    }\n                    worklist.push(element);\n                }\n            }\n        }\n\n        return outer.root;\n    };\n\n    function traverse(root, visitor) {\n        var controller = new Controller();\n        return controller.traverse(root, visitor);\n    }\n\n    function replace(root, visitor) {\n        var controller = new Controller();\n        return controller.replace(root, visitor);\n    }\n\n    function extendCommentRange(comment, tokens) {\n        var target;\n\n        target = upperBound(tokens, function search(token) {\n            return token.range[0] > comment.range[0];\n        });\n\n        comment.extendedRange = [comment.range[0], comment.range[1]];\n\n        if (target !== tokens.length) {\n            comment.extendedRange[1] = tokens[target].range[0];\n        }\n\n        target -= 1;\n        if (target >= 0) {\n            comment.extendedRange[0] = tokens[target].range[1];\n        }\n\n        return comment;\n    }\n\n    function attachComments(tree, providedComments, tokens) {\n        // At first, we should calculate extended comment ranges.\n        var comments = [], comment, len, i, cursor;\n\n        if (!tree.range) {\n            throw new Error('attachComments needs range information');\n        }\n\n        // tokens array is empty, we attach comments to tree as 'leadingComments'\n        if (!tokens.length) {\n            if (providedComments.length) {\n                for (i = 0, len = providedComments.length; i < len; i += 1) {\n                    comment = deepCopy(providedComments[i]);\n                    comment.extendedRange = [0, tree.range[0]];\n                    comments.push(comment);\n                }\n                tree.leadingComments = comments;\n            }\n            return tree;\n        }\n\n        for (i = 0, len = providedComments.length; i < len; i += 1) {\n            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));\n        }\n\n        // This is based on John Freeman's implementation.\n        cursor = 0;\n        traverse(tree, {\n            enter: function (node) {\n                var comment;\n\n                while (cursor < comments.length) {\n                    comment = comments[cursor];\n                    if (comment.extendedRange[1] > node.range[0]) {\n                        break;\n                    }\n\n                    if (comment.extendedRange[1] === node.range[0]) {\n                        if (!node.leadingComments) {\n                            node.leadingComments = [];\n                        }\n                        node.leadingComments.push(comment);\n                        comments.splice(cursor, 1);\n                    } else {\n                        cursor += 1;\n                    }\n                }\n\n                // already out of owned node\n                if (cursor === comments.length) {\n                    return VisitorOption.Break;\n                }\n\n                if (comments[cursor].extendedRange[0] > node.range[1]) {\n                    return VisitorOption.Skip;\n                }\n            }\n        });\n\n        cursor = 0;\n        traverse(tree, {\n            leave: function (node) {\n                var comment;\n\n                while (cursor < comments.length) {\n                    comment = comments[cursor];\n                    if (node.range[1] < comment.extendedRange[0]) {\n                        break;\n                    }\n\n                    if (node.range[1] === comment.extendedRange[0]) {\n                        if (!node.trailingComments) {\n                            node.trailingComments = [];\n                        }\n                        node.trailingComments.push(comment);\n                        comments.splice(cursor, 1);\n                    } else {\n                        cursor += 1;\n                    }\n                }\n\n                // already out of owned node\n                if (cursor === comments.length) {\n                    return VisitorOption.Break;\n                }\n\n                if (comments[cursor].extendedRange[0] > node.range[1]) {\n                    return VisitorOption.Skip;\n                }\n            }\n        });\n\n        return tree;\n    }\n\n    exports.version = '1.5.1-dev';\n    exports.Syntax = Syntax;\n    exports.traverse = traverse;\n    exports.replace = replace;\n    exports.attachComments = attachComments;\n    exports.VisitorKeys = VisitorKeys;\n    exports.VisitorOption = VisitorOption;\n    exports.Controller = Controller;\n}));\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n\n//# sourceURL=webpack:///./node_modules/escodegen/node_modules/estraverse/estraverse.js?");

/***/ }),

/***/ "./node_modules/escodegen/node_modules/esutils/lib/code.js":
/*!*****************************************************************!*\
  !*** ./node_modules/escodegen/node_modules/esutils/lib/code.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n(function () {\n    'use strict';\n\n    var Regex;\n\n    // See also tools/generate-unicode-regex.py.\n    Regex = {\n        NonAsciiIdentifierStart: new RegExp('[\\xAA\\xB5\\xBA\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16EE-\\u16F0\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2160-\\u2188\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6EF\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]'),\n        NonAsciiIdentifierPart: new RegExp('[\\xAA\\xB5\\xBA\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0300-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u0483-\\u0487\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0610-\\u061A\\u0620-\\u0669\\u066E-\\u06D3\\u06D5-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06FC\\u06FF\\u0710-\\u074A\\u074D-\\u07B1\\u07C0-\\u07F5\\u07FA\\u0800-\\u082D\\u0840-\\u085B\\u08A0\\u08A2-\\u08AC\\u08E4-\\u08FE\\u0900-\\u0963\\u0966-\\u096F\\u0971-\\u0977\\u0979-\\u097F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CE\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A01-\\u0A03\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A75\\u0A81-\\u0A83\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AD0\\u0AE0-\\u0AE3\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3C-\\u0B44\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B63\\u0B66-\\u0B6F\\u0B71\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD0\\u0BD7\\u0BE6-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C58\\u0C59\\u0C60-\\u0C63\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBC-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0-\\u0CE3\\u0CE6-\\u0CEF\\u0CF1\\u0CF2\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D-\\u0D44\\u0D46-\\u0D48\\u0D4A-\\u0D4E\\u0D57\\u0D60-\\u0D63\\u0D66-\\u0D6F\\u0D7A-\\u0D7F\\u0D82\\u0D83\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0DCA\\u0DCF-\\u0DD4\\u0DD6\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0E01-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0EDC-\\u0EDF\\u0F00\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F6C\\u0F71-\\u0F84\\u0F86-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u1000-\\u1049\\u1050-\\u109D\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u135D-\\u135F\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16EE-\\u16F0\\u1700-\\u170C\\u170E-\\u1714\\u1720-\\u1734\\u1740-\\u1753\\u1760-\\u176C\\u176E-\\u1770\\u1772\\u1773\\u1780-\\u17D3\\u17D7\\u17DC\\u17DD\\u17E0-\\u17E9\\u180B-\\u180D\\u1810-\\u1819\\u1820-\\u1877\\u1880-\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1920-\\u192B\\u1930-\\u193B\\u1946-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19B0-\\u19C9\\u19D0-\\u19D9\\u1A00-\\u1A1B\\u1A20-\\u1A5E\\u1A60-\\u1A7C\\u1A7F-\\u1A89\\u1A90-\\u1A99\\u1AA7\\u1B00-\\u1B4B\\u1B50-\\u1B59\\u1B6B-\\u1B73\\u1B80-\\u1BF3\\u1C00-\\u1C37\\u1C40-\\u1C49\\u1C4D-\\u1C7D\\u1CD0-\\u1CD2\\u1CD4-\\u1CF6\\u1D00-\\u1DE6\\u1DFC-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u200C\\u200D\\u203F\\u2040\\u2054\\u2071\\u207F\\u2090-\\u209C\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2160-\\u2188\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D7F-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2DE0-\\u2DFF\\u2E2F\\u3005-\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3038-\\u303C\\u3041-\\u3096\\u3099\\u309A\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA62B\\uA640-\\uA66F\\uA674-\\uA67D\\uA67F-\\uA697\\uA69F-\\uA6F1\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA827\\uA840-\\uA873\\uA880-\\uA8C4\\uA8D0-\\uA8D9\\uA8E0-\\uA8F7\\uA8FB\\uA900-\\uA92D\\uA930-\\uA953\\uA960-\\uA97C\\uA980-\\uA9C0\\uA9CF-\\uA9D9\\uAA00-\\uAA36\\uAA40-\\uAA4D\\uAA50-\\uAA59\\uAA60-\\uAA76\\uAA7A\\uAA7B\\uAA80-\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEF\\uAAF2-\\uAAF6\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABEA\\uABEC\\uABED\\uABF0-\\uABF9\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE00-\\uFE0F\\uFE20-\\uFE26\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF3F\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]')\n    };\n\n    function isDecimalDigit(ch) {\n        return (ch >= 48 && ch <= 57);   // 0..9\n    }\n\n    function isHexDigit(ch) {\n        return isDecimalDigit(ch) || (97 <= ch && ch <= 102) || (65 <= ch && ch <= 70);\n    }\n\n    function isOctalDigit(ch) {\n        return (ch >= 48 && ch <= 55);   // 0..7\n    }\n\n    // 7.2 White Space\n\n    function isWhiteSpace(ch) {\n        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||\n            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);\n    }\n\n    // 7.3 Line Terminators\n\n    function isLineTerminator(ch) {\n        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);\n    }\n\n    // 7.6 Identifier Names and Identifiers\n\n    function isIdentifierStart(ch) {\n        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)\n            (ch >= 65 && ch <= 90) ||         // A..Z\n            (ch >= 97 && ch <= 122) ||        // a..z\n            (ch === 92) ||                    // \\ (backslash)\n            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));\n    }\n\n    function isIdentifierPart(ch) {\n        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)\n            (ch >= 65 && ch <= 90) ||         // A..Z\n            (ch >= 97 && ch <= 122) ||        // a..z\n            (ch >= 48 && ch <= 57) ||         // 0..9\n            (ch === 92) ||                    // \\ (backslash)\n            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));\n    }\n\n    module.exports = {\n        isDecimalDigit: isDecimalDigit,\n        isHexDigit: isHexDigit,\n        isOctalDigit: isOctalDigit,\n        isWhiteSpace: isWhiteSpace,\n        isLineTerminator: isLineTerminator,\n        isIdentifierStart: isIdentifierStart,\n        isIdentifierPart: isIdentifierPart\n    };\n}());\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n\n//# sourceURL=webpack:///./node_modules/escodegen/node_modules/esutils/lib/code.js?");

/***/ }),

/***/ "./node_modules/escodegen/node_modules/esutils/lib/keyword.js":
/*!********************************************************************!*\
  !*** ./node_modules/escodegen/node_modules/esutils/lib/keyword.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n(function () {\n    'use strict';\n\n    var code = __webpack_require__(/*! ./code */ \"./node_modules/escodegen/node_modules/esutils/lib/code.js\");\n\n    function isStrictModeReservedWordES6(id) {\n        switch (id) {\n        case 'implements':\n        case 'interface':\n        case 'package':\n        case 'private':\n        case 'protected':\n        case 'public':\n        case 'static':\n        case 'let':\n            return true;\n        default:\n            return false;\n        }\n    }\n\n    function isKeywordES5(id, strict) {\n        // yield should not be treated as keyword under non-strict mode.\n        if (!strict && id === 'yield') {\n            return false;\n        }\n        return isKeywordES6(id, strict);\n    }\n\n    function isKeywordES6(id, strict) {\n        if (strict && isStrictModeReservedWordES6(id)) {\n            return true;\n        }\n\n        switch (id.length) {\n        case 2:\n            return (id === 'if') || (id === 'in') || (id === 'do');\n        case 3:\n            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');\n        case 4:\n            return (id === 'this') || (id === 'else') || (id === 'case') ||\n                (id === 'void') || (id === 'with') || (id === 'enum');\n        case 5:\n            return (id === 'while') || (id === 'break') || (id === 'catch') ||\n                (id === 'throw') || (id === 'const') || (id === 'yield') ||\n                (id === 'class') || (id === 'super');\n        case 6:\n            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||\n                (id === 'switch') || (id === 'export') || (id === 'import');\n        case 7:\n            return (id === 'default') || (id === 'finally') || (id === 'extends');\n        case 8:\n            return (id === 'function') || (id === 'continue') || (id === 'debugger');\n        case 10:\n            return (id === 'instanceof');\n        default:\n            return false;\n        }\n    }\n\n    function isRestrictedWord(id) {\n        return id === 'eval' || id === 'arguments';\n    }\n\n    function isIdentifierName(id) {\n        var i, iz, ch;\n\n        if (id.length === 0) {\n            return false;\n        }\n\n        ch = id.charCodeAt(0);\n        if (!code.isIdentifierStart(ch) || ch === 92) {  // \\ (backslash)\n            return false;\n        }\n\n        for (i = 1, iz = id.length; i < iz; ++i) {\n            ch = id.charCodeAt(i);\n            if (!code.isIdentifierPart(ch) || ch === 92) {  // \\ (backslash)\n                return false;\n            }\n        }\n        return true;\n    }\n\n    module.exports = {\n        isKeywordES5: isKeywordES5,\n        isKeywordES6: isKeywordES6,\n        isRestrictedWord: isRestrictedWord,\n        isIdentifierName: isIdentifierName\n    };\n}());\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n\n//# sourceURL=webpack:///./node_modules/escodegen/node_modules/esutils/lib/keyword.js?");

/***/ }),

/***/ "./node_modules/escodegen/node_modules/esutils/lib/utils.js":
/*!******************************************************************!*\
  !*** ./node_modules/escodegen/node_modules/esutils/lib/utils.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n\n(function () {\n    'use strict';\n\n    exports.code = __webpack_require__(/*! ./code */ \"./node_modules/escodegen/node_modules/esutils/lib/code.js\");\n    exports.keyword = __webpack_require__(/*! ./keyword */ \"./node_modules/escodegen/node_modules/esutils/lib/keyword.js\");\n}());\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n\n//# sourceURL=webpack:///./node_modules/escodegen/node_modules/esutils/lib/utils.js?");

/***/ }),

/***/ "./node_modules/escodegen/node_modules/source-map/lib/source-map.js":
/*!**************************************************************************!*\
  !*** ./node_modules/escodegen/node_modules/source-map/lib/source-map.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n * Copyright 2009-2011 Mozilla Foundation and contributors\n * Licensed under the New BSD license. See LICENSE.txt or:\n * http://opensource.org/licenses/BSD-3-Clause\n */\nexports.SourceMapGenerator = __webpack_require__(!(function webpackMissingModule() { var e = new Error(\"Cannot find module './source-map/source-map-generator'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())).SourceMapGenerator;\nexports.SourceMapConsumer = __webpack_require__(!(function webpackMissingModule() { var e = new Error(\"Cannot find module './source-map/source-map-consumer'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())).SourceMapConsumer;\nexports.SourceNode = __webpack_require__(!(function webpackMissingModule() { var e = new Error(\"Cannot find module './source-map/source-node'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())).SourceNode;\n\n\n//# sourceURL=webpack:///./node_modules/escodegen/node_modules/source-map/lib/source-map.js?");

/***/ }),

/***/ "./node_modules/escodegen/package.json":
/*!*********************************************!*\
  !*** ./node_modules/escodegen/package.json ***!
  \*********************************************/
/*! exports provided: name, description, homepage, main, bin, version, engines, maintainers, repository, dependencies, optionalDependencies, devDependencies, licenses, scripts, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"name\\\":\\\"escodegen\\\",\\\"description\\\":\\\"ECMAScript code generator\\\",\\\"homepage\\\":\\\"http://github.com/Constellation/escodegen\\\",\\\"main\\\":\\\"escodegen.js\\\",\\\"bin\\\":{\\\"esgenerate\\\":\\\"./bin/esgenerate.js\\\",\\\"escodegen\\\":\\\"./bin/escodegen.js\\\"},\\\"version\\\":\\\"1.3.3\\\",\\\"engines\\\":{\\\"node\\\":\\\">=0.10.0\\\"},\\\"maintainers\\\":[{\\\"name\\\":\\\"Yusuke Suzuki\\\",\\\"email\\\":\\\"utatane.tea@gmail.com\\\",\\\"web\\\":\\\"http://github.com/Constellation\\\"}],\\\"repository\\\":{\\\"type\\\":\\\"git\\\",\\\"url\\\":\\\"http://github.com/Constellation/escodegen.git\\\"},\\\"dependencies\\\":{\\\"esutils\\\":\\\"~1.0.0\\\",\\\"estraverse\\\":\\\"~1.5.0\\\",\\\"esprima\\\":\\\"~1.1.1\\\"},\\\"optionalDependencies\\\":{\\\"source-map\\\":\\\"~0.1.33\\\"},\\\"devDependencies\\\":{\\\"esprima-moz\\\":\\\"*\\\",\\\"semver\\\":\\\"*\\\",\\\"chai\\\":\\\"~1.7.2\\\",\\\"gulp\\\":\\\"~3.5.0\\\",\\\"gulp-mocha\\\":\\\"~0.4.1\\\",\\\"gulp-eslint\\\":\\\"~0.1.2\\\",\\\"jshint-stylish\\\":\\\"~0.1.5\\\",\\\"gulp-jshint\\\":\\\"~1.4.0\\\",\\\"commonjs-everywhere\\\":\\\"~0.9.6\\\",\\\"bluebird\\\":\\\"~1.2.0\\\",\\\"bower-registry-client\\\":\\\"~0.2.0\\\"},\\\"licenses\\\":[{\\\"type\\\":\\\"BSD\\\",\\\"url\\\":\\\"http://github.com/Constellation/escodegen/raw/master/LICENSE.BSD\\\"}],\\\"scripts\\\":{\\\"test\\\":\\\"gulp travis\\\",\\\"unit-test\\\":\\\"gulp test\\\",\\\"lint\\\":\\\"gulp lint\\\",\\\"release\\\":\\\"node tools/release.js\\\",\\\"build-min\\\":\\\"./node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js\\\",\\\"build\\\":\\\"./node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js\\\"}}\");\n\n//# sourceURL=webpack:///./node_modules/escodegen/package.json?");

/***/ }),

/***/ "./node_modules/jison-lex/package.json":
/*!*********************************************!*\
  !*** ./node_modules/jison-lex/package.json ***!
  \*********************************************/
/*! exports provided: author, name, description, version, keywords, repository, bugs, main, bin, engines, dependencies, devDependencies, scripts, directories, homepage, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"author\\\":\\\"Zach Carter <zach@carter.name> (http://zaa.ch)\\\",\\\"name\\\":\\\"jison-lex\\\",\\\"description\\\":\\\"lexical analyzer generator used by jison\\\",\\\"version\\\":\\\"0.3.4\\\",\\\"keywords\\\":[\\\"jison\\\",\\\"parser\\\",\\\"generator\\\",\\\"lexer\\\",\\\"flex\\\",\\\"tokenizer\\\"],\\\"repository\\\":{\\\"type\\\":\\\"git\\\",\\\"url\\\":\\\"git://github.com/zaach/jison-lex.git\\\"},\\\"bugs\\\":{\\\"email\\\":\\\"jison@librelist.com\\\",\\\"url\\\":\\\"http://github.com/zaach/jison-lex/issues\\\"},\\\"main\\\":\\\"regexp-lexer\\\",\\\"bin\\\":\\\"cli.js\\\",\\\"engines\\\":{\\\"node\\\":\\\">=0.4\\\"},\\\"dependencies\\\":{\\\"lex-parser\\\":\\\"0.1.x\\\",\\\"nomnom\\\":\\\"1.5.2\\\"},\\\"devDependencies\\\":{\\\"test\\\":\\\"0.4.4\\\"},\\\"scripts\\\":{\\\"test\\\":\\\"node tests/all-tests.js\\\"},\\\"directories\\\":{\\\"lib\\\":\\\"lib\\\",\\\"tests\\\":\\\"tests\\\"},\\\"homepage\\\":\\\"http://jison.org\\\"}\");\n\n//# sourceURL=webpack:///./node_modules/jison-lex/package.json?");

/***/ }),

/***/ "./node_modules/jison-lex/regexp-lexer.js":
/*!************************************************!*\
  !*** ./node_modules/jison-lex/regexp-lexer.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("// Basic Lexer implemented using JavaScript regular expressions\n// MIT Licensed\n\n\n\nvar lexParser = __webpack_require__(/*! lex-parser */ \"./node_modules/lex-parser/lex-parser.js\");\nvar version = __webpack_require__(/*! ./package.json */ \"./node_modules/jison-lex/package.json\").version;\n\n// expand macros and convert matchers to RegExp's\nfunction prepareRules(rules, macros, actions, tokens, startConditions, caseless) {\n    var m,i,k,action,conditions,\n        newRules = [];\n\n    if (macros) {\n        macros = prepareMacros(macros);\n    }\n\n    function tokenNumberReplacement (str, token) {\n        return \"return \" + (tokens[token] || \"'\" + token + \"'\");\n    }\n\n    actions.push('switch($avoiding_name_collisions) {');\n\n    for (i=0;i < rules.length; i++) {\n        if (Object.prototype.toString.apply(rules[i][0]) !== '[object Array]') {\n            // implicit add to all inclusive start conditions\n            for (k in startConditions) {\n                if (startConditions[k].inclusive) {\n                    startConditions[k].rules.push(i);\n                }\n            }\n        } else if (rules[i][0][0] === '*') {\n            // Add to ALL start conditions\n            for (k in startConditions) {\n                startConditions[k].rules.push(i);\n            }\n            rules[i].shift();\n        } else {\n            // Add to explicit start conditions\n            conditions = rules[i].shift();\n            for (k=0;k<conditions.length;k++) {\n                startConditions[conditions[k]].rules.push(i);\n            }\n        }\n\n        m = rules[i][0];\n        if (typeof m === 'string') {\n            for (k in macros) {\n                if (macros.hasOwnProperty(k)) {\n                    m = m.split(\"{\" + k + \"}\").join('(' + macros[k] + ')');\n                }\n            }\n            m = new RegExp(\"^(?:\" + m + \")\", caseless ? 'i':'');\n        }\n        newRules.push(m);\n        if (typeof rules[i][1] === 'function') {\n            rules[i][1] = String(rules[i][1]).replace(/^\\s*function \\(\\)\\s?\\{/, '').replace(/\\}\\s*$/, '');\n        }\n        action = rules[i][1];\n        if (tokens && action.match(/return '[^']+'/)) {\n            action = action.replace(/return '([^']+)'/g, tokenNumberReplacement);\n        }\n        actions.push('case ' + i + ':' + action + '\\nbreak;');\n    }\n    actions.push(\"}\");\n\n    return newRules;\n}\n\n// expand macros within macros\nfunction prepareMacros (macros) {\n    var cont = true,\n        m,i,k,mnew;\n    while (cont) {\n        cont = false;\n        for (i in macros) if (macros.hasOwnProperty(i)) {\n            m = macros[i];\n            for (k in macros) if (macros.hasOwnProperty(k) && i !== k) {\n                mnew = m.split(\"{\" + k + \"}\").join('(' + macros[k] + ')');\n                if (mnew !== m) {\n                    cont = true;\n                    macros[i] = mnew;\n                }\n            }\n        }\n    }\n    return macros;\n}\n\nfunction prepareStartConditions (conditions) {\n    var sc,\n        hash = {};\n    for (sc in conditions) if (conditions.hasOwnProperty(sc)) {\n        hash[sc] = {rules:[],inclusive:!!!conditions[sc]};\n    }\n    return hash;\n}\n\nfunction buildActions (dict, tokens) {\n    var actions = [dict.actionInclude || '', \"var YYSTATE=YY_START;\"];\n    var tok;\n    var toks = {};\n\n    for (tok in tokens) {\n        toks[tokens[tok]] = tok;\n    }\n\n    if (dict.options && dict.options.flex) {\n        dict.rules.push([\".\", \"console.log(yytext);\"]);\n    }\n\n    this.rules = prepareRules(dict.rules, dict.macros, actions, tokens && toks, this.conditions, this.options[\"case-insensitive\"]);\n    var fun = actions.join(\"\\n\");\n    \"yytext yyleng yylineno yylloc\".split(' ').forEach(function (yy) {\n        fun = fun.replace(new RegExp(\"\\\\b(\" + yy + \")\\\\b\", \"g\"), \"yy_.$1\");\n    });\n\n    return \"function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\" + fun + \"\\n}\";\n}\n\nfunction RegExpLexer (dict, input, tokens) {\n    var opts = processGrammar(dict, tokens);\n    var source = generateModuleBody(opts);\n    var lexer = eval(source);\n\n    lexer.yy = {};\n    if (input) {\n        lexer.setInput(input);\n    }\n\n    lexer.generate = function () { return generateFromOpts(opts); };\n    lexer.generateModule = function () { return generateModule(opts); };\n    lexer.generateCommonJSModule = function () { return generateCommonJSModule(opts); };\n    lexer.generateAMDModule = function () { return generateAMDModule(opts); };\n\n    return lexer;\n}\n\nRegExpLexer.prototype = {\n    EOF: 1,\n    parseError: function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n    // resets the lexer, sets new input\n    setInput: function (input, yy) {\n        this.yy = yy || this.yy || {};\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n    // consumes and returns one char from the input\n    input: function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n    // unshifts one char (or a string) into the input\n    unput: function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n    // When called from action, caches matched text and appends it on next action\n    more: function () {\n        this._more = true;\n        return this;\n    },\n\n    // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\n    reject: function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n    // retain first n characters of the match\n    less: function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n    // displays already matched input, i.e. for error messages\n    pastInput: function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n    // displays upcoming input, i.e. for error messages\n    upcomingInput: function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n    // displays the character position where the lexing error occurred, i.e. for error messages\n    showPosition: function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n    // test the lexed token: return FALSE when not a match, otherwise return token\n    test_match: function(match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n    // return next match in input\n    next: function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n    // return next match that has a token\n    lex: function lex () {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n    // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\n    begin: function begin (condition) {\n        this.conditionStack.push(condition);\n    },\n\n    // pop the previously active lexer condition state off the condition stack\n    popState: function popState () {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n    // produce the lexer rule set which is active for the currently active lexer condition state\n    _currentRules: function _currentRules () {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n    // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\n    topState: function topState (n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n    // alias for begin(condition)\n    pushState: function pushState (condition) {\n        this.begin(condition);\n    },\n\n    // return the number of states pushed\n    stateStackSize: function stateStackSize() {\n        return this.conditionStack.length;\n    }\n};\n\n\n// generate lexer source from a grammar\nfunction generate (dict, tokens) {\n    var opt = processGrammar(dict, tokens);\n\n    return generateFromOpts(opt);\n}\n\n// process the grammar and build final data structures and functions\nfunction processGrammar(dict, tokens) {\n    var opts = {};\n    if (typeof dict === 'string') {\n        dict = lexParser.parse(dict);\n    }\n    dict = dict || {};\n\n    opts.options = dict.options || {};\n    opts.moduleType = opts.options.moduleType;\n    opts.moduleName = opts.options.moduleName;\n\n    opts.conditions = prepareStartConditions(dict.startConditions);\n    opts.conditions.INITIAL = {rules:[],inclusive:true};\n\n    opts.performAction = buildActions.call(opts, dict, tokens);\n    opts.conditionStack = ['INITIAL'];\n\n    opts.moduleInclude = (dict.moduleInclude || '').trim();\n    return opts;\n}\n\n// Assemble the final source from the processed grammar\nfunction generateFromOpts (opt) {\n    var code = \"\";\n\n    if (opt.moduleType === 'commonjs') {\n        code = generateCommonJSModule(opt);\n    } else if (opt.moduleType === 'amd') {\n        code = generateAMDModule(opt);\n    } else {\n        code = generateModule(opt);\n    }\n\n    return code;\n}\n\nfunction generateModuleBody (opt) {\n    var functionDescriptions = {\n        setInput: \"resets the lexer, sets new input\",\n        input: \"consumes and returns one char from the input\",\n        unput: \"unshifts one char (or a string) into the input\",\n        more: \"When called from action, caches matched text and appends it on next action\",\n        reject: \"When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\",\n        less: \"retain first n characters of the match\",\n        pastInput: \"displays already matched input, i.e. for error messages\",\n        upcomingInput: \"displays upcoming input, i.e. for error messages\",\n        showPosition: \"displays the character position where the lexing error occurred, i.e. for error messages\",\n        test_match: \"test the lexed token: return FALSE when not a match, otherwise return token\",\n        next: \"return next match in input\",\n        lex: \"return next match that has a token\",\n        begin: \"activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\",\n        popState: \"pop the previously active lexer condition state off the condition stack\",\n        _currentRules: \"produce the lexer rule set which is active for the currently active lexer condition state\",\n        topState: \"return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\",\n        pushState: \"alias for begin(condition)\",\n        stateStackSize: \"return the number of states currently on the stack\"\n    };\n    var out = \"({\\n\";\n    var p = [];\n    var descr;\n    for (var k in RegExpLexer.prototype) {\n        if (RegExpLexer.prototype.hasOwnProperty(k) && k.indexOf(\"generate\") === -1) {\n            // copy the function description as a comment before the implementation; supports multi-line descriptions\n            descr = \"\\n\";\n            if (functionDescriptions[k]) {\n                descr += \"// \" + functionDescriptions[k].replace(/\\n/g, \"\\n\\/\\/ \") + \"\\n\";\n            }\n            p.push(descr + k + \":\" + (RegExpLexer.prototype[k].toString() || '\"\"'));\n        }\n    }\n    out += p.join(\",\\n\");\n\n    if (opt.options) {\n        out += \",\\noptions: \" + JSON.stringify(opt.options);\n    }\n\n    out += \",\\nperformAction: \" + String(opt.performAction);\n    out += \",\\nrules: [\" + opt.rules + \"]\";\n    out += \",\\nconditions: \" + JSON.stringify(opt.conditions);\n    out += \"\\n})\";\n\n    return out;\n}\n\nfunction generateModule(opt) {\n    opt = opt || {};\n\n    var out = \"/* generated by jison-lex \" + version + \" */\";\n    var moduleName = opt.moduleName || \"lexer\";\n\n    out += \"\\nvar \" + moduleName + \" = (function(){\\nvar lexer = \"\n          + generateModuleBody(opt);\n\n    if (opt.moduleInclude) {\n        out += \";\\n\" + opt.moduleInclude;\n    }\n\n    out += \";\\nreturn lexer;\\n})();\";\n\n    return out;\n}\n\nfunction generateAMDModule(opt) {\n    var out = \"/* generated by jison-lex \" + version + \" */\";\n\n    out += \"define([], function(){\\nvar lexer = \"\n          + generateModuleBody(opt);\n\n    if (opt.moduleInclude) {\n        out += \";\\n\" + opt.moduleInclude;\n    }\n\n    out += \";\\nreturn lexer;\"\n         + \"\\n});\";\n\n    return out;\n}\n\nfunction generateCommonJSModule(opt) {\n    opt = opt || {};\n\n    var out = \"\";\n    var moduleName = opt.moduleName || \"lexer\";\n\n    out += generateModule(opt);\n    out += \"\\nexports.lexer = \" + moduleName;\n    out += \";\\nexports.lex = function () { return \" + moduleName + \".lex.apply(lexer, arguments); };\";\n    return out;\n}\n\nRegExpLexer.generate = generate;\n\nmodule.exports = RegExpLexer;\n\n\n\n//# sourceURL=webpack:///./node_modules/jison-lex/regexp-lexer.js?");

/***/ }),

/***/ "./node_modules/jison/lib/jison.js":
/*!*****************************************!*\
  !*** ./node_modules/jison/lib/jison.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(process) {// Jison, an LR(0), SLR(1), LARL(1), LR(1) Parser Generator\n// Zachary Carter <zach@carter.name>\n// MIT X Licensed\n\nvar typal      = __webpack_require__(/*! ./util/typal */ \"./node_modules/jison/lib/util/typal.js\").typal;\nvar Set        = __webpack_require__(/*! ./util/set */ \"./node_modules/jison/lib/util/set.js\").Set;\nvar Lexer      = __webpack_require__(/*! jison-lex */ \"./node_modules/jison-lex/regexp-lexer.js\");\nvar ebnfParser = __webpack_require__(/*! ebnf-parser */ \"./node_modules/ebnf-parser/ebnf-parser.js\");\nvar JSONSelect = __webpack_require__(/*! JSONSelect */ \"./node_modules/JSONSelect/src/jsonselect.js\");\nvar esprima    = __webpack_require__(/*! esprima */ \"./node_modules/jison/node_modules/esprima/esprima.js\");\nvar escodegen  = __webpack_require__(/*! escodegen */ \"./node_modules/escodegen/escodegen.js\");\n\n\nvar version = __webpack_require__(/*! ../package.json */ \"./node_modules/jison/package.json\").version;\n\nvar Jison = exports.Jison = exports;\nJison.version = version;\n\n// detect print\nif (typeof console !== 'undefined' && console.log) {\n    Jison.print = console.log;\n} else if (typeof puts !== 'undefined') {\n    Jison.print = function print () { puts([].join.call(arguments, ' ')); };\n} else if (typeof print !== 'undefined') {\n    Jison.print = print;\n} else {\n    Jison.print = function print () {};\n}\n\nJison.Parser = (function () {\n\n// iterator utility\nfunction each (obj, func) {\n    if (obj.forEach) {\n        obj.forEach(func);\n    } else {\n        var p;\n        for (p in obj) {\n            if (obj.hasOwnProperty(p)) {\n                func.call(obj, obj[p], p, obj);\n            }\n        }\n    }\n}\n\nvar Nonterminal = typal.construct({\n    constructor: function Nonterminal (symbol) {\n        this.symbol = symbol;\n        this.productions = new Set();\n        this.first = [];\n        this.follows = [];\n        this.nullable = false;\n    },\n    toString: function Nonterminal_toString () {\n        var str = this.symbol+\"\\n\";\n        str += (this.nullable ? 'nullable' : 'not nullable');\n        str += \"\\nFirsts: \"+this.first.join(', ');\n        str += \"\\nFollows: \"+this.first.join(', ');\n        str += \"\\nProductions:\\n  \"+this.productions.join('\\n  ');\n\n        return str;\n    }\n});\n\nvar Production = typal.construct({\n    constructor: function Production (symbol, handle, id) {\n        this.symbol = symbol;\n        this.handle = handle;\n        this.nullable = false;\n        this.id = id;\n        this.first = [];\n        this.precedence = 0;\n    },\n    toString: function Production_toString () {\n        return this.symbol+\" -> \"+this.handle.join(' ');\n    }\n});\n\nvar generator = typal.beget();\n\ngenerator.constructor = function Jison_Generator (grammar, opt) {\n    if (typeof grammar === 'string') {\n        grammar = ebnfParser.parse(grammar);\n    }\n\n    var options = typal.mix.call({}, grammar.options, opt);\n    this.terms = {};\n    this.operators = {};\n    this.productions = [];\n    this.conflicts = 0;\n    this.resolutions = [];\n    this.options = options;\n    this.parseParams = grammar.parseParams;\n    this.yy = {}; // accessed as yy free variable in the parser/lexer actions\n\n    // source included in semantic action execution scope\n    if (grammar.actionInclude) {\n        if (typeof grammar.actionInclude === 'function') {\n            grammar.actionInclude = String(grammar.actionInclude).replace(/^\\s*function \\(\\) \\{/, '').replace(/\\}\\s*$/, '');\n        }\n        this.actionInclude = grammar.actionInclude;\n    }\n    this.moduleInclude = grammar.moduleInclude || '';\n\n    this.DEBUG = options.debug || false;\n    if (this.DEBUG) this.mix(generatorDebug); // mixin debug methods\n\n    this.processGrammar(grammar);\n\n    if (grammar.lex) {\n        this.lexer = new Lexer(grammar.lex, null, this.terminals_);\n    }\n};\n\ngenerator.processGrammar = function processGrammarDef (grammar) {\n    var bnf = grammar.bnf,\n        tokens = grammar.tokens,\n        nonterminals = this.nonterminals = {},\n        productions = this.productions,\n        self = this;\n\n    if (!grammar.bnf && grammar.ebnf) {\n        bnf = grammar.bnf = ebnfParser.transform(grammar.ebnf);\n    }\n\n    if (tokens) {\n        if (typeof tokens === 'string') {\n            tokens = tokens.trim().split(' ');\n        } else {\n            tokens = tokens.slice(0);\n        }\n    }\n\n    var symbols = this.symbols = [];\n\n    // calculate precedence of operators\n    var operators = this.operators = processOperators(grammar.operators);\n\n    // build productions from cfg\n    this.buildProductions(bnf, productions, nonterminals, symbols, operators);\n\n    if (tokens && this.terminals.length !== tokens.length) {\n        self.trace(\"Warning: declared tokens differ from tokens found in rules.\");\n        self.trace(this.terminals);\n        self.trace(tokens);\n    }\n\n    // augment the grammar\n    this.augmentGrammar(grammar);\n};\n\ngenerator.augmentGrammar = function augmentGrammar (grammar) {\n    if (this.productions.length === 0) {\n        throw new Error(\"Grammar error: must have at least one rule.\");\n    }\n    // use specified start symbol, or default to first user defined production\n    this.startSymbol = grammar.start || grammar.startSymbol || this.productions[0].symbol;\n    if (!this.nonterminals[this.startSymbol]) {\n        throw new Error(\"Grammar error: startSymbol must be a non-terminal found in your grammar.\");\n    }\n    this.EOF = \"$end\";\n\n    // augment the grammar\n    var acceptProduction = new Production('$accept', [this.startSymbol, '$end'], 0);\n    this.productions.unshift(acceptProduction);\n\n    // prepend parser tokens\n    this.symbols.unshift(\"$accept\",this.EOF);\n    this.symbols_.$accept = 0;\n    this.symbols_[this.EOF] = 1;\n    this.terminals.unshift(this.EOF);\n\n    this.nonterminals.$accept = new Nonterminal(\"$accept\");\n    this.nonterminals.$accept.productions.push(acceptProduction);\n\n    // add follow $ to start symbol\n    this.nonterminals[this.startSymbol].follows.push(this.EOF);\n};\n\n// set precedence and associativity of operators\nfunction processOperators (ops) {\n    if (!ops) return {};\n    var operators = {};\n    for (var i=0,k,prec;prec=ops[i]; i++) {\n        for (k=1;k < prec.length;k++) {\n            operators[prec[k]] = {precedence: i+1, assoc: prec[0]};\n        }\n    }\n    return operators;\n}\n\n\ngenerator.buildProductions = function buildProductions(bnf, productions, nonterminals, symbols, operators) {\n    var actions = [\n      '/* this == yyval */',\n      this.actionInclude || '',\n      'var $0 = $$.length - 1;',\n      'switch (yystate) {'\n    ];\n    var actionGroups = {};\n    var prods, symbol;\n    var productions_ = [0];\n    var symbolId = 1;\n    var symbols_ = {};\n\n    var her = false; // has error recovery\n\n    function addSymbol (s) {\n        if (s && !symbols_[s]) {\n            symbols_[s] = ++symbolId;\n            symbols.push(s);\n        }\n    }\n\n    // add error symbol; will be third symbol, or \"2\" ($accept, $end, error)\n    addSymbol(\"error\");\n\n    for (symbol in bnf) {\n        if (!bnf.hasOwnProperty(symbol)) continue;\n\n        addSymbol(symbol);\n        nonterminals[symbol] = new Nonterminal(symbol);\n\n        if (typeof bnf[symbol] === 'string') {\n            prods = bnf[symbol].split(/\\s*\\|\\s*/g);\n        } else {\n            prods = bnf[symbol].slice(0);\n        }\n\n        prods.forEach(buildProduction);\n    }\n    for (var action in actionGroups)\n      actions.push(actionGroups[action].join(' '), action, 'break;');\n\n    var sym, terms = [], terms_ = {};\n    each(symbols_, function (id, sym) {\n        if (!nonterminals[sym]) {\n            terms.push(sym);\n            terms_[id] = sym;\n        }\n    });\n\n    this.hasErrorRecovery = her;\n\n    this.terminals = terms;\n    this.terminals_ = terms_;\n    this.symbols_ = symbols_;\n\n    this.productions_ = productions_;\n    actions.push('}');\n\n    actions = actions.join(\"\\n\")\n                .replace(/YYABORT/g, 'return false')\n                .replace(/YYACCEPT/g, 'return true');\n\n    var parameters = \"yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */\";\n    if (this.parseParams) parameters += ', ' + this.parseParams.join(', ');\n\n    this.performAction = \"function anonymous(\" + parameters + \") {\\n\" + actions + \"\\n}\";\n\n    function buildProduction (handle) {\n        var r, rhs, i;\n        if (handle.constructor === Array) {\n            rhs = (typeof handle[0] === 'string') ?\n                      handle[0].trim().split(' ') :\n                      handle[0].slice(0);\n\n            for (i=0; i<rhs.length; i++) {\n                if (rhs[i] === 'error') her = true;\n                if (!symbols_[rhs[i]]) {\n                    addSymbol(rhs[i]);\n                }\n            }\n\n            if (typeof handle[1] === 'string' || handle.length == 3) {\n                // semantic action specified\n                var label = 'case ' + (productions.length+1) + ':', action = handle[1];\n\n                // replace named semantic values ($nonterminal)\n                if (action.match(/[$@][a-zA-Z][a-zA-Z0-9_]*/)) {\n                    var count = {},\n                        names = {};\n                    for (i=0;i<rhs.length;i++) {\n                        // check for aliased names, e.g., id[alias]\n                        var rhs_i = rhs[i].match(/\\[[a-zA-Z][a-zA-Z0-9_-]*\\]/);\n                        if (rhs_i) {\n                            rhs_i = rhs_i[0].substr(1, rhs_i[0].length-2);\n                            rhs[i] = rhs[i].substr(0, rhs[i].indexOf('['));\n                        } else {\n                            rhs_i = rhs[i];\n                        }\n\n                        if (names[rhs_i]) {\n                            names[rhs_i + (++count[rhs_i])] = i+1;\n                        } else {\n                            names[rhs_i] = i+1;\n                            names[rhs_i + \"1\"] = i+1;\n                            count[rhs_i] = 1;\n                        }\n                    }\n                    action = action.replace(/\\$([a-zA-Z][a-zA-Z0-9_]*)/g, function (str, pl) {\n                            return names[pl] ? '$'+names[pl] : str;\n                        }).replace(/@([a-zA-Z][a-zA-Z0-9_]*)/g, function (str, pl) {\n                            return names[pl] ? '@'+names[pl] : str;\n                        });\n                }\n                action = action\n                    // replace references to $$ with this.$, and @$ with this._$\n                    .replace(/([^'\"])\\$\\$|^\\$\\$/g, '$1this.$').replace(/@[0$]/g, \"this._$\")\n\n                    // replace semantic value references ($n) with stack value (stack[n])\n                    .replace(/\\$(-?\\d+)/g, function (_, n) {\n                        return \"$$[$0\" + (parseInt(n, 10) - rhs.length || '') + \"]\";\n                    })\n                    // same as above for location references (@n)\n                    .replace(/@(-?\\d+)/g, function (_, n) {\n                        return \"_$[$0\" + (n - rhs.length || '') + \"]\";\n                    });\n                if (action in actionGroups) actionGroups[action].push(label);\n                else actionGroups[action] = [label];\n\n                // done with aliases; strip them.\n                rhs = rhs.map(function(e,i) { return e.replace(/\\[[a-zA-Z_][a-zA-Z0-9_-]*\\]/g, '') });\n                r = new Production(symbol, rhs, productions.length+1);\n                // precedence specified also\n                if (handle[2] && operators[handle[2].prec]) {\n                    r.precedence = operators[handle[2].prec].precedence;\n                }\n            } else {\n                // no action -> don't care about aliases; strip them.\n                rhs = rhs.map(function(e,i) { return e.replace(/\\[[a-zA-Z_][a-zA-Z0-9_-]*\\]/g, '') });\n                // only precedence specified\n                r = new Production(symbol, rhs, productions.length+1);\n                if (operators[handle[1].prec]) {\n                    r.precedence = operators[handle[1].prec].precedence;\n                }\n            }\n        } else {\n            // no action -> don't care about aliases; strip them.\n            handle = handle.replace(/\\[[a-zA-Z_][a-zA-Z0-9_-]*\\]/g, '');\n            rhs = handle.trim().split(' ');\n            for (i=0; i<rhs.length; i++) {\n                if (rhs[i] === 'error') her = true;\n                if (!symbols_[rhs[i]]) {\n                    addSymbol(rhs[i]);\n                }\n            }\n            r = new Production(symbol, rhs, productions.length+1);\n        }\n        if (r.precedence === 0) {\n            // set precedence\n            for (i=r.handle.length-1; i>=0; i--) {\n                if (!(r.handle[i] in nonterminals) && r.handle[i] in operators) {\n                    r.precedence = operators[r.handle[i]].precedence;\n                }\n            }\n        }\n\n        productions.push(r);\n        productions_.push([symbols_[r.symbol], r.handle[0] === '' ? 0 : r.handle.length]);\n        nonterminals[symbol].productions.push(r);\n    }\n};\n\n\n\ngenerator.createParser = function createParser () {\n    throw new Error('Calling abstract method.');\n};\n\n// noop. implemented in debug mixin\ngenerator.trace = function trace () { };\n\ngenerator.warn = function warn () {\n    var args = Array.prototype.slice.call(arguments,0);\n    Jison.print.call(null,args.join(\"\"));\n};\n\ngenerator.error = function error (msg) {\n    throw new Error(msg);\n};\n\n// Generator debug mixin\n\nvar generatorDebug = {\n    trace: function trace () {\n        Jison.print.apply(null, arguments);\n    },\n    beforeprocessGrammar: function () {\n        this.trace(\"Processing grammar.\");\n    },\n    afteraugmentGrammar: function () {\n        var trace = this.trace;\n        each(this.symbols, function (sym, i) {\n            trace(sym+\"(\"+i+\")\");\n        });\n    }\n};\n\n\n\n/*\n * Mixin for common behaviors of lookahead parsers\n * */\nvar lookaheadMixin = {};\n\nlookaheadMixin.computeLookaheads = function computeLookaheads () {\n    if (this.DEBUG) this.mix(lookaheadDebug); // mixin debug methods\n\n    this.computeLookaheads = function () {};\n    this.nullableSets();\n    this.firstSets();\n    this.followSets();\n};\n\n// calculate follow sets typald on first and nullable\nlookaheadMixin.followSets = function followSets () {\n    var productions = this.productions,\n        nonterminals = this.nonterminals,\n        self = this,\n        cont = true;\n\n    // loop until no further changes have been made\n    while(cont) {\n        cont = false;\n\n        productions.forEach(function Follow_prod_forEach (production, k) {\n            //self.trace(production.symbol,nonterminals[production.symbol].follows);\n            // q is used in Simple LALR algorithm determine follows in context\n            var q;\n            var ctx = !!self.go_;\n\n            var set = [],oldcount;\n            for (var i=0,t;t=production.handle[i];++i) {\n                if (!nonterminals[t]) continue;\n\n                // for Simple LALR algorithm, self.go_ checks if\n                if (ctx)\n                    q = self.go_(production.symbol, production.handle.slice(0, i));\n                var bool = !ctx || q === parseInt(self.nterms_[t], 10);\n\n                if (i === production.handle.length+1 && bool) {\n                    set = nonterminals[production.symbol].follows;\n                } else {\n                    var part = production.handle.slice(i+1);\n\n                    set = self.first(part);\n                    if (self.nullable(part) && bool) {\n                        set.push.apply(set, nonterminals[production.symbol].follows);\n                    }\n                }\n                oldcount = nonterminals[t].follows.length;\n                Set.union(nonterminals[t].follows, set);\n                if (oldcount !== nonterminals[t].follows.length) {\n                    cont = true;\n                }\n            }\n        });\n    }\n};\n\n// return the FIRST set of a symbol or series of symbols\nlookaheadMixin.first = function first (symbol) {\n    // epsilon\n    if (symbol === '') {\n        return [];\n    // RHS\n    } else if (symbol instanceof Array) {\n        var firsts = [];\n        for (var i=0,t;t=symbol[i];++i) {\n            if (!this.nonterminals[t]) {\n                if (firsts.indexOf(t) === -1)\n                    firsts.push(t);\n            } else {\n                Set.union(firsts, this.nonterminals[t].first);\n            }\n            if (!this.nullable(t))\n                break;\n        }\n        return firsts;\n    // terminal\n    } else if (!this.nonterminals[symbol]) {\n        return [symbol];\n    // nonterminal\n    } else {\n        return this.nonterminals[symbol].first;\n    }\n};\n\n// fixed-point calculation of FIRST sets\nlookaheadMixin.firstSets = function firstSets () {\n    var productions = this.productions,\n        nonterminals = this.nonterminals,\n        self = this,\n        cont = true,\n        symbol,firsts;\n\n    // loop until no further changes have been made\n    while(cont) {\n        cont = false;\n\n        productions.forEach(function FirstSets_forEach (production, k) {\n            var firsts = self.first(production.handle);\n            if (firsts.length !== production.first.length) {\n                production.first = firsts;\n                cont=true;\n            }\n        });\n\n        for (symbol in nonterminals) {\n            firsts = [];\n            nonterminals[symbol].productions.forEach(function (production) {\n                Set.union(firsts, production.first);\n            });\n            if (firsts.length !== nonterminals[symbol].first.length) {\n                nonterminals[symbol].first = firsts;\n                cont=true;\n            }\n        }\n    }\n};\n\n// fixed-point calculation of NULLABLE\nlookaheadMixin.nullableSets = function nullableSets () {\n    var firsts = this.firsts = {},\n        nonterminals = this.nonterminals,\n        self = this,\n        cont = true;\n\n    // loop until no further changes have been made\n    while(cont) {\n        cont = false;\n\n        // check if each production is nullable\n        this.productions.forEach(function (production, k) {\n            if (!production.nullable) {\n                for (var i=0,n=0,t;t=production.handle[i];++i) {\n                    if (self.nullable(t)) n++;\n                }\n                if (n===i) { // production is nullable if all tokens are nullable\n                    production.nullable = cont = true;\n                }\n            }\n        });\n\n        //check if each symbol is nullable\n        for (var symbol in nonterminals) {\n            if (!this.nullable(symbol)) {\n                for (var i=0,production;production=nonterminals[symbol].productions.item(i);i++) {\n                    if (production.nullable)\n                        nonterminals[symbol].nullable = cont = true;\n                }\n            }\n        }\n    }\n};\n\n// check if a token or series of tokens is nullable\nlookaheadMixin.nullable = function nullable (symbol) {\n    // epsilon\n    if (symbol === '') {\n        return true;\n    // RHS\n    } else if (symbol instanceof Array) {\n        for (var i=0,t;t=symbol[i];++i) {\n            if (!this.nullable(t))\n                return false;\n        }\n        return true;\n    // terminal\n    } else if (!this.nonterminals[symbol]) {\n        return false;\n    // nonterminal\n    } else {\n        return this.nonterminals[symbol].nullable;\n    }\n};\n\n\n// lookahead debug mixin\nvar lookaheadDebug = {\n    beforenullableSets: function () {\n        this.trace(\"Computing Nullable sets.\");\n    },\n    beforefirstSets: function () {\n        this.trace(\"Computing First sets.\");\n    },\n    beforefollowSets: function () {\n        this.trace(\"Computing Follow sets.\");\n    },\n    afterfollowSets: function () {\n        var trace = this.trace;\n        each(this.nonterminals, function (nt, t) {\n            trace(nt, '\\n');\n        });\n    }\n};\n\n/*\n * Mixin for common LR parser behavior\n * */\nvar lrGeneratorMixin = {};\n\nlrGeneratorMixin.buildTable = function buildTable () {\n    if (this.DEBUG) this.mix(lrGeneratorDebug); // mixin debug methods\n\n    this.states = this.canonicalCollection();\n    this.table = this.parseTable(this.states);\n    this.defaultActions = findDefaults(this.table);\n};\n\nlrGeneratorMixin.Item = typal.construct({\n    constructor: function Item(production, dot, f, predecessor) {\n        this.production = production;\n        this.dotPosition = dot || 0;\n        this.follows = f || [];\n        this.predecessor = predecessor;\n        this.id = parseInt(production.id+'a'+this.dotPosition, 36);\n        this.markedSymbol = this.production.handle[this.dotPosition];\n    },\n    remainingHandle: function () {\n        return this.production.handle.slice(this.dotPosition+1);\n    },\n    eq: function (e) {\n        return e.id === this.id;\n    },\n    handleToString: function () {\n        var handle = this.production.handle.slice(0);\n        handle[this.dotPosition] = '.'+(handle[this.dotPosition]||'');\n        return handle.join(' ');\n    },\n    toString: function () {\n        var temp = this.production.handle.slice(0);\n        temp[this.dotPosition] = '.'+(temp[this.dotPosition]||'');\n        return this.production.symbol+\" -> \"+temp.join(' ') +\n            (this.follows.length === 0 ? \"\" : \" #lookaheads= \"+this.follows.join(' '));\n    }\n});\n\nlrGeneratorMixin.ItemSet = Set.prototype.construct({\n    afterconstructor: function () {\n        this.reductions = [];\n        this.goes = {};\n        this.edges = {};\n        this.shifts = false;\n        this.inadequate = false;\n        this.hash_ = {};\n        for (var i=this._items.length-1;i >=0;i--) {\n            this.hash_[this._items[i].id] = true; //i;\n        }\n    },\n    concat: function concat (set) {\n        var a = set._items || set;\n        for (var i=a.length-1;i >=0;i--) {\n            this.hash_[a[i].id] = true; //i;\n        }\n        this._items.push.apply(this._items, a);\n        return this;\n    },\n    push: function (item) {\n        this.hash_[item.id] = true;\n        return this._items.push(item);\n    },\n    contains: function (item) {\n        return this.hash_[item.id];\n    },\n    valueOf: function toValue () {\n        var v = this._items.map(function (a) {return a.id;}).sort().join('|');\n        this.valueOf = function toValue_inner() {return v;};\n        return v;\n    }\n});\n\nlrGeneratorMixin.closureOperation = function closureOperation (itemSet /*, closureSet*/) {\n    var closureSet = new this.ItemSet();\n    var self = this;\n\n    var set = itemSet,\n        itemQueue, syms = {};\n\n    do {\n    itemQueue = new Set();\n    closureSet.concat(set);\n    set.forEach(function CO_set_forEach (item) {\n        var symbol = item.markedSymbol;\n\n        // if token is a non-terminal, recursively add closures\n        if (symbol && self.nonterminals[symbol]) {\n            if(!syms[symbol]) {\n                self.nonterminals[symbol].productions.forEach(function CO_nt_forEach (production) {\n                    var newItem = new self.Item(production, 0);\n                    if(!closureSet.contains(newItem))\n                        itemQueue.push(newItem);\n                });\n                syms[symbol] = true;\n            }\n        } else if (!symbol) {\n            // reduction\n            closureSet.reductions.push(item);\n            closureSet.inadequate = closureSet.reductions.length > 1 || closureSet.shifts;\n        } else {\n            // shift\n            closureSet.shifts = true;\n            closureSet.inadequate = closureSet.reductions.length > 0;\n        }\n    });\n\n    set = itemQueue;\n\n    } while (!itemQueue.isEmpty());\n\n    return closureSet;\n};\n\nlrGeneratorMixin.gotoOperation = function gotoOperation (itemSet, symbol) {\n    var gotoSet = new this.ItemSet(),\n        self = this;\n\n    itemSet.forEach(function goto_forEach(item, n) {\n        if (item.markedSymbol === symbol) {\n            gotoSet.push(new self.Item(item.production, item.dotPosition+1, item.follows, n));\n        }\n    });\n\n    return gotoSet.isEmpty() ? gotoSet : this.closureOperation(gotoSet);\n};\n\n/* Create unique set of item sets\n * */\nlrGeneratorMixin.canonicalCollection = function canonicalCollection () {\n    var item1 = new this.Item(this.productions[0], 0, [this.EOF]);\n    var firstState = this.closureOperation(new this.ItemSet(item1)),\n        states = new Set(firstState),\n        marked = 0,\n        self = this,\n        itemSet;\n\n    states.has = {};\n    states.has[firstState] = 0;\n\n    while (marked !== states.size()) {\n        itemSet = states.item(marked); marked++;\n        itemSet.forEach(function CC_itemSet_forEach (item) {\n            if (item.markedSymbol && item.markedSymbol !== self.EOF)\n                self.canonicalCollectionInsert(item.markedSymbol, itemSet, states, marked-1);\n        });\n    }\n\n    return states;\n};\n\n// Pushes a unique state into the que. Some parsing algorithms may perform additional operations\nlrGeneratorMixin.canonicalCollectionInsert = function canonicalCollectionInsert (symbol, itemSet, states, stateNum) {\n    var g = this.gotoOperation(itemSet, symbol);\n    if (!g.predecessors)\n        g.predecessors = {};\n    // add g to que if not empty or duplicate\n    if (!g.isEmpty()) {\n        var gv = g.valueOf(),\n            i = states.has[gv];\n        if (i === -1 || typeof i === 'undefined') {\n            states.has[gv] = states.size();\n            itemSet.edges[symbol] = states.size(); // store goto transition for table\n            states.push(g);\n            g.predecessors[symbol] = [stateNum];\n        } else {\n            itemSet.edges[symbol] = i; // store goto transition for table\n            states.item(i).predecessors[symbol].push(stateNum);\n        }\n    }\n};\n\nvar NONASSOC = 0;\nlrGeneratorMixin.parseTable = function parseTable (itemSets) {\n    var states = [],\n        nonterminals = this.nonterminals,\n        operators = this.operators,\n        conflictedStates = {}, // array of [state, token] tuples\n        self = this,\n        s = 1, // shift\n        r = 2, // reduce\n        a = 3; // accept\n\n    // for each item set\n    itemSets.forEach(function (itemSet, k) {\n        var state = states[k] = {};\n        var action, stackSymbol;\n\n        // set shift and goto actions\n        for (stackSymbol in itemSet.edges) {\n            itemSet.forEach(function (item, j) {\n                // find shift and goto actions\n                if (item.markedSymbol == stackSymbol) {\n                    var gotoState = itemSet.edges[stackSymbol];\n                    if (nonterminals[stackSymbol]) {\n                        // store state to go to after a reduce\n                        //self.trace(k, stackSymbol, 'g'+gotoState);\n                        state[self.symbols_[stackSymbol]] = gotoState;\n                    } else {\n                        //self.trace(k, stackSymbol, 's'+gotoState);\n                        state[self.symbols_[stackSymbol]] = [s,gotoState];\n                    }\n                }\n            });\n        }\n\n        // set accept action\n        itemSet.forEach(function (item, j) {\n            if (item.markedSymbol == self.EOF) {\n                // accept\n                state[self.symbols_[self.EOF]] = [a];\n                //self.trace(k, self.EOF, state[self.EOF]);\n            }\n        });\n\n        var allterms = self.lookAheads ? false : self.terminals;\n\n        // set reductions and resolve potential conflicts\n        itemSet.reductions.forEach(function (item, j) {\n            // if parser uses lookahead, only enumerate those terminals\n            var terminals = allterms || self.lookAheads(itemSet, item);\n\n            terminals.forEach(function (stackSymbol) {\n                action = state[self.symbols_[stackSymbol]];\n                var op = operators[stackSymbol];\n\n                // Reading a terminal and current position is at the end of a production, try to reduce\n                if (action || action && action.length) {\n                    var sol = resolveConflict(item.production, op, [r,item.production.id], action[0] instanceof Array ? action[0] : action);\n                    self.resolutions.push([k,stackSymbol,sol]);\n                    if (sol.bydefault) {\n                        self.conflicts++;\n                        if (!self.DEBUG) {\n                            self.warn('Conflict in grammar: multiple actions possible when lookahead token is ',stackSymbol,' in state ',k, \"\\n- \", printAction(sol.r, self), \"\\n- \", printAction(sol.s, self));\n                            conflictedStates[k] = true;\n                        }\n                        if (self.options.noDefaultResolve) {\n                            if (!(action[0] instanceof Array))\n                                action = [action];\n                            action.push(sol.r);\n                        }\n                    } else {\n                        action = sol.action;\n                    }\n                } else {\n                    action = [r,item.production.id];\n                }\n                if (action && action.length) {\n                    state[self.symbols_[stackSymbol]] = action;\n                } else if (action === NONASSOC) {\n                    state[self.symbols_[stackSymbol]] = undefined;\n                }\n            });\n        });\n\n    });\n\n    if (!self.DEBUG && self.conflicts > 0) {\n        self.warn(\"\\nStates with conflicts:\");\n        each(conflictedStates, function (val, state) {\n            self.warn('State '+state);\n            self.warn('  ',itemSets.item(state).join(\"\\n  \"));\n        });\n    }\n\n    return states;\n};\n\n// find states with only one action, a reduction\nfunction findDefaults (states) {\n    var defaults = {};\n    states.forEach(function (state, k) {\n        var i = 0;\n        for (var act in state) {\n             if ({}.hasOwnProperty.call(state, act)) i++;\n        }\n\n        if (i === 1 && state[act][0] === 2) {\n            // only one action in state and it's a reduction\n            defaults[k] = state[act];\n        }\n    });\n\n    return defaults;\n}\n\n// resolves shift-reduce and reduce-reduce conflicts\nfunction resolveConflict (production, op, reduce, shift) {\n    var sln = {production: production, operator: op, r: reduce, s: shift},\n        s = 1, // shift\n        r = 2, // reduce\n        a = 3; // accept\n\n    if (shift[0] === r) {\n        sln.msg = \"Resolve R/R conflict (use first production declared in grammar.)\";\n        sln.action = shift[1] < reduce[1] ? shift : reduce;\n        if (shift[1] !== reduce[1]) sln.bydefault = true;\n        return sln;\n    }\n\n    if (production.precedence === 0 || !op) {\n        sln.msg = \"Resolve S/R conflict (shift by default.)\";\n        sln.bydefault = true;\n        sln.action = shift;\n    } else if (production.precedence < op.precedence ) {\n        sln.msg = \"Resolve S/R conflict (shift for higher precedent operator.)\";\n        sln.action = shift;\n    } else if (production.precedence === op.precedence) {\n        if (op.assoc === \"right\" ) {\n            sln.msg = \"Resolve S/R conflict (shift for right associative operator.)\";\n            sln.action = shift;\n        } else if (op.assoc === \"left\" ) {\n            sln.msg = \"Resolve S/R conflict (reduce for left associative operator.)\";\n            sln.action = reduce;\n        } else if (op.assoc === \"nonassoc\" ) {\n            sln.msg = \"Resolve S/R conflict (no action for non-associative operator.)\";\n            sln.action = NONASSOC;\n        }\n    } else {\n        sln.msg = \"Resolve conflict (reduce for higher precedent production.)\";\n        sln.action = reduce;\n    }\n\n    return sln;\n}\n\nlrGeneratorMixin.generate = function parser_generate (opt) {\n    opt = typal.mix.call({}, this.options, opt);\n    var code = \"\";\n\n    // check for illegal identifier\n    if (!opt.moduleName || !opt.moduleName.match(/^[A-Za-z_$][A-Za-z0-9_$]*$/)) {\n        opt.moduleName = \"parser\";\n    }\n    switch (opt.moduleType) {\n        case \"js\":\n            code = this.generateModule(opt);\n            break;\n        case \"amd\":\n            code = this.generateAMDModule(opt);\n            break;\n        default:\n            code = this.generateCommonJSModule(opt);\n            break;\n    }\n\n    return code;\n};\n\nlrGeneratorMixin.generateAMDModule = function generateAMDModule(opt){\n    opt = typal.mix.call({}, this.options, opt);\n    var module = this.generateModule_();\n    var out = '\\n\\ndefine(function(require){\\n'\n        + module.commonCode\n        + '\\nvar parser = '+ module.moduleCode\n        + \"\\n\"+this.moduleInclude\n        + (this.lexer && this.lexer.generateModule ?\n          '\\n' + this.lexer.generateModule() +\n          '\\nparser.lexer = lexer;' : '')\n        + '\\nreturn parser;'\n        + '\\n});'\n    return out;\n};\n\nlrGeneratorMixin.generateCommonJSModule = function generateCommonJSModule (opt) {\n    opt = typal.mix.call({}, this.options, opt);\n    var moduleName = opt.moduleName || \"parser\";\n    var out = this.generateModule(opt)\n        + \"\\n\\n\\nif (typeof require !== 'undefined' && typeof exports !== 'undefined') {\"\n        + \"\\nexports.parser = \"+moduleName+\";\"\n        + \"\\nexports.Parser = \"+moduleName+\".Parser;\"\n        + \"\\nexports.parse = function () { return \"+moduleName+\".parse.apply(\"+moduleName+\", arguments); };\"\n        + \"\\nexports.main = \"+ String(opt.moduleMain || commonjsMain) + \";\"\n        + \"\\nif (typeof module !== 'undefined' && require.main === module) {\\n\"\n        + \"  exports.main(process.argv.slice(1));\\n}\"\n        + \"\\n}\";\n\n    return out;\n};\n\nlrGeneratorMixin.generateModule = function generateModule (opt) {\n    opt = typal.mix.call({}, this.options, opt);\n    var moduleName = opt.moduleName || \"parser\";\n    var out = \"/* parser generated by jison \" + version + \" */\\n\"\n        + \"/*\\n\"\n        + \"  Returns a Parser object of the following structure:\\n\"\n        + \"\\n\"\n        + \"  Parser: {\\n\"\n        + \"    yy: {}\\n\"\n        + \"  }\\n\"\n        + \"\\n\"\n        + \"  Parser.prototype: {\\n\"\n        + \"    yy: {},\\n\"\n        + \"    trace: function(),\\n\"\n        + \"    symbols_: {associative list: name ==> number},\\n\"\n        + \"    terminals_: {associative list: number ==> name},\\n\"\n        + \"    productions_: [...],\\n\"\n        + \"    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\\n\"\n        + \"    table: [...],\\n\"\n        + \"    defaultActions: {...},\\n\"\n        + \"    parseError: function(str, hash),\\n\"\n        + \"    parse: function(input),\\n\"\n        + \"\\n\"\n        + \"    lexer: {\\n\"\n        + \"        EOF: 1,\\n\"\n        + \"        parseError: function(str, hash),\\n\"\n        + \"        setInput: function(input),\\n\"\n        + \"        input: function(),\\n\"\n        + \"        unput: function(str),\\n\"\n        + \"        more: function(),\\n\"\n        + \"        less: function(n),\\n\"\n        + \"        pastInput: function(),\\n\"\n        + \"        upcomingInput: function(),\\n\"\n        + \"        showPosition: function(),\\n\"\n        + \"        test_match: function(regex_match_array, rule_index),\\n\"\n        + \"        next: function(),\\n\"\n        + \"        lex: function(),\\n\"\n        + \"        begin: function(condition),\\n\"\n        + \"        popState: function(),\\n\"\n        + \"        _currentRules: function(),\\n\"\n        + \"        topState: function(),\\n\"\n        + \"        pushState: function(condition),\\n\"\n        + \"\\n\"\n        + \"        options: {\\n\"\n        + \"            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\\n\"\n        + \"            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\\n\"\n        + \"            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\\n\"\n        + \"        },\\n\"\n        + \"\\n\"\n        + \"        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\\n\"\n        + \"        rules: [...],\\n\"\n        + \"        conditions: {associative list: name ==> set},\\n\"\n        + \"    }\\n\"\n        + \"  }\\n\"\n        + \"\\n\"\n        + \"\\n\"\n        + \"  token location info (@$, _$, etc.): {\\n\"\n        + \"    first_line: n,\\n\"\n        + \"    last_line: n,\\n\"\n        + \"    first_column: n,\\n\"\n        + \"    last_column: n,\\n\"\n        + \"    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\\n\"\n        + \"  }\\n\"\n        + \"\\n\"\n        + \"\\n\"\n        + \"  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\\n\"\n        + \"    text:        (matched text)\\n\"\n        + \"    token:       (the produced terminal token, if any)\\n\"\n        + \"    line:        (yylineno)\\n\"\n        + \"  }\\n\"\n        + \"  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\\n\"\n        + \"    loc:         (yylloc)\\n\"\n        + \"    expected:    (string describing the set of expected tokens)\\n\"\n        + \"    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\\n\"\n        + \"  }\\n\"\n        + \"*/\\n\";\n    out += (moduleName.match(/\\./) ? moduleName : \"var \"+moduleName) +\n            \" = \" + this.generateModuleExpr();\n\n    return out;\n};\n\n\nlrGeneratorMixin.generateModuleExpr = function generateModuleExpr () {\n    var out = '';\n    var module = this.generateModule_();\n\n    out += \"(function(){\\n\";\n    out += module.commonCode;\n    out += \"\\nvar parser = \"+module.moduleCode;\n    out += \"\\n\"+this.moduleInclude;\n    if (this.lexer && this.lexer.generateModule) {\n        out += this.lexer.generateModule();\n        out += \"\\nparser.lexer = lexer;\";\n    }\n    out += \"\\nfunction Parser () {\\n  this.yy = {};\\n}\\n\"\n        + \"Parser.prototype = parser;\"\n        + \"parser.Parser = Parser;\"\n        + \"\\nreturn new Parser;\\n})();\";\n\n    return out;\n};\n\nfunction addTokenStack (fn) {\n    var parseFn = fn;\n    try {\n        var ast = esprima.parse(parseFn);\n        var stackAst = esprima.parse(String(tokenStackLex)).body[0];\n        stackAst.id.name = 'lex';\n\n        var labeled = JSONSelect.match(':has(:root > .label > .name:val(\"_token_stack\"))', ast);\n\n        labeled[0].body = stackAst;\n\n        return escodegen.generate(ast).replace(/_token_stack:\\s?/,\"\").replace(/\\\\\\\\n/g,\"\\\\n\");\n    } catch (e) {\n        return parseFn;\n    }\n}\n\n// lex function that supports token stacks\nfunction tokenStackLex() {\n    var token;\n    token = tstack.pop() || lexer.lex() || EOF;\n    // if token isn't its numeric value, convert\n    if (typeof token !== 'number') {\n        if (token instanceof Array) {\n            tstack = token;\n            token = tstack.pop();\n        }\n        token = self.symbols_[token] || token;\n    }\n    return token;\n}\n\n// returns parse function without error recovery code\nfunction removeErrorRecovery (fn) {\n    var parseFn = fn;\n    try {\n        var ast = esprima.parse(parseFn);\n\n        var labeled = JSONSelect.match(':has(:root > .label > .name:val(\"_handle_error\"))', ast);\n        var reduced_code = labeled[0].body.consequent.body[3].consequent.body;\n        reduced_code[0] = labeled[0].body.consequent.body[1];     // remove the line: error_rule_depth = locateNearestErrorRecoveryRule(state);\n        reduced_code[4].expression.arguments[1].properties.pop(); // remove the line: 'recoverable: error_rule_depth !== false'\n        labeled[0].body.consequent.body = reduced_code;\n\n        return escodegen.generate(ast).replace(/_handle_error:\\s?/,\"\").replace(/\\\\\\\\n/g,\"\\\\n\");\n    } catch (e) {\n        return parseFn;\n    }\n}\n\n// Generates the code of the parser module, which consists of two parts:\n// - module.commonCode: initialization code that should be placed before the module\n// - module.moduleCode: code that creates the module object\nlrGeneratorMixin.generateModule_ = function generateModule_ () {\n    var parseFn = String(parser.parse);\n    if (!this.hasErrorRecovery) {\n      parseFn = removeErrorRecovery(parseFn);\n    }\n\n    if (this.options['token-stack']) {\n      parseFn = addTokenStack(parseFn);\n    }\n\n    // Generate code with fresh variable names\n    nextVariableId = 0;\n    var tableCode = this.generateTableCode(this.table);\n\n    // Generate the initialization code\n    var commonCode = tableCode.commonCode;\n\n    // Generate the module creation code\n    var moduleCode = \"{\";\n    moduleCode += [\n        \"trace: \" + String(this.trace || parser.trace),\n        \"yy: {}\",\n        \"symbols_: \" + JSON.stringify(this.symbols_),\n        \"terminals_: \" + JSON.stringify(this.terminals_).replace(/\"([0-9]+)\":/g,\"$1:\"),\n        \"productions_: \" + JSON.stringify(this.productions_),\n        \"performAction: \" + String(this.performAction),\n        \"table: \" + tableCode.moduleCode,\n        \"defaultActions: \" + JSON.stringify(this.defaultActions).replace(/\"([0-9]+)\":/g,\"$1:\"),\n        \"parseError: \" + String(this.parseError || (this.hasErrorRecovery ? traceParseError : parser.parseError)),\n        \"parse: \" + parseFn\n        ].join(\",\\n\");\n    moduleCode += \"};\";\n\n    return { commonCode: commonCode, moduleCode: moduleCode }\n};\n\n// Generate code that represents the specified parser table\nlrGeneratorMixin.generateTableCode = function (table) {\n    var moduleCode = JSON.stringify(table);\n    var variables = [createObjectCode];\n\n    // Don't surround numerical property name numbers in quotes\n    moduleCode = moduleCode.replace(/\"([0-9]+)\"(?=:)/g, \"$1\");\n\n    // Replace objects with several identical values by function calls\n    // e.g., { 1: [6, 7]; 3: [6, 7], 4: [6, 7], 5: 8 } = o([1, 3, 4], [6, 7], { 5: 8 })\n    moduleCode = moduleCode.replace(/\\{\\d+:[^\\}]+,\\d+:[^\\}]+\\}/g, function (object) {\n        // Find the value that occurs with the highest number of keys\n        var value, frequentValue, key, keys = {}, keyCount, maxKeyCount = 0,\n            keyValue, keyValues = [], keyValueMatcher = /(\\d+):([^:]+)(?=,\\d+:|\\})/g;\n\n        while ((keyValue = keyValueMatcher.exec(object))) {\n            // For each value, store the keys where that value occurs\n            key = keyValue[1];\n            value = keyValue[2];\n            keyCount = 1;\n\n            if (!(value in keys)) {\n                keys[value] = [key];\n            } else {\n                keyCount = keys[value].push(key);\n            }\n            // Remember this value if it is the most frequent one\n            if (keyCount > maxKeyCount) {\n                maxKeyCount = keyCount;\n                frequentValue = value;\n            }\n        }\n        // Construct the object with a function call if the most frequent value occurs multiple times\n        if (maxKeyCount > 1) {\n            // Collect all non-frequent values into a remainder object\n            for (value in keys) {\n                if (value !== frequentValue) {\n                    for (var k = keys[value], i = 0, l = k.length; i < l; i++) {\n                        keyValues.push(k[i] + ':' + value);\n                    }\n                }\n            }\n            keyValues = keyValues.length ? ',{' + keyValues.join(',') + '}' : '';\n            // Create the function call `o(keys, value, remainder)`\n            object = 'o([' + keys[frequentValue].join(',') + '],' + frequentValue + keyValues + ')';\n        }\n        return object;\n    });\n\n    // Count occurrences of number lists\n    var list;\n    var lists = {};\n    var listMatcher = /\\[[0-9,]+\\]/g;\n\n    while (list = listMatcher.exec(moduleCode)) {\n        lists[list] = (lists[list] || 0) + 1;\n    }\n\n    // Replace frequently occurring number lists with variables\n    moduleCode = moduleCode.replace(listMatcher, function (list) {\n        var listId = lists[list];\n        // If listId is a number, it represents the list's occurrence frequency\n        if (typeof listId === 'number') {\n            // If the list does not occur frequently, represent it by the list\n            if (listId === 1) {\n                lists[list] = listId = list;\n            // If the list occurs frequently, represent it by a newly assigned variable\n            } else {\n                lists[list] = listId = createVariable();\n                variables.push(listId + '=' + list);\n            }\n        }\n        return listId;\n    });\n\n    // Return the variable initialization code and the table code\n    return {\n        commonCode: 'var ' + variables.join(',') + ';',\n        moduleCode: moduleCode\n    };\n};\n// Function that extends an object with the given value for all given keys\n// e.g., o([1, 3, 4], [6, 7], { x: 1, y: 2 }) = { 1: [6, 7]; 3: [6, 7], 4: [6, 7], x: 1, y: 2 }\nvar createObjectCode = 'o=function(k,v,o,l){' +\n    'for(o=o||{},l=k.length;l--;o[k[l]]=v);' +\n    'return o}';\n\n// Creates a variable with a unique name\nfunction createVariable() {\n    var id = nextVariableId++;\n    var name = '$V';\n\n    do {\n        name += variableTokens[id % variableTokensLength];\n        id = ~~(id / variableTokensLength);\n    } while (id !== 0);\n\n    return name;\n}\n\nvar nextVariableId = 0;\nvar variableTokens = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';\nvar variableTokensLength = variableTokens.length;\n\n// default main method for generated commonjs modules\nfunction commonjsMain (args) {\n    if (!args[1]) {\n        console.log('Usage: '+args[0]+' FILE');\n        process.exit(1);\n    }\n    var source = __webpack_require__(/*! fs */ \"./node_modules/node-libs-browser/mock/empty.js\").readFileSync(__webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\").normalize(args[1]), \"utf8\");\n    return exports.parser.parse(source);\n}\n\n// debug mixin for LR parser generators\n\nfunction printAction (a, gen) {\n    var s = a[0] == 1 ? 'shift token (then go to state '+a[1]+')' :\n        a[0] == 2 ? 'reduce by rule: '+gen.productions[a[1]] :\n                    'accept' ;\n\n    return s;\n}\n\nvar lrGeneratorDebug = {\n    beforeparseTable: function () {\n        this.trace(\"Building parse table.\");\n    },\n    afterparseTable: function () {\n        var self = this;\n        if (this.conflicts > 0) {\n            this.resolutions.forEach(function (r, i) {\n                if (r[2].bydefault) {\n                    self.warn('Conflict at state: ',r[0], ', token: ',r[1], \"\\n  \", printAction(r[2].r, self), \"\\n  \", printAction(r[2].s, self));\n                }\n            });\n            this.trace(\"\\n\"+this.conflicts+\" Conflict(s) found in grammar.\");\n        }\n        this.trace(\"Done.\");\n    },\n    aftercanonicalCollection: function (states) {\n        var trace = this.trace;\n        trace(\"\\nItem sets\\n------\");\n\n        states.forEach(function (state, i) {\n            trace(\"\\nitem set\",i,\"\\n\"+state.join(\"\\n\"), '\\ntransitions -> ', JSON.stringify(state.edges));\n        });\n    }\n};\n\nvar parser = typal.beget();\n\nlrGeneratorMixin.createParser = function createParser () {\n\n    var p = eval(this.generateModuleExpr());\n\n    // for debugging\n    p.productions = this.productions;\n\n    var self = this;\n    function bind(method) {\n        return function() {\n            self.lexer = p.lexer;\n            return self[method].apply(self, arguments);\n        };\n    }\n\n    // backwards compatability\n    p.lexer = this.lexer;\n    p.generate = bind('generate');\n    p.generateAMDModule = bind('generateAMDModule');\n    p.generateModule = bind('generateModule');\n    p.generateCommonJSModule = bind('generateCommonJSModule');\n\n    return p;\n};\n\nparser.trace = generator.trace;\nparser.warn = generator.warn;\nparser.error = generator.error;\n\nfunction traceParseError (err, hash) {\n    this.trace(err);\n}\n\nfunction parseError (str, hash) {\n    if (hash.recoverable) {\n        this.trace(str);\n    } else {\n        var error = new Error(str);\n        error.hash = hash;\n        throw error;\n    }\n}\n\nparser.parseError = lrGeneratorMixin.parseError = parseError;\n\nparser.parse = function parse (input) {\n    var self = this,\n        stack = [0],\n        tstack = [], // token stack\n        vstack = [null], // semantic value stack\n        lstack = [], // location stack\n        table = this.table,\n        yytext = '',\n        yylineno = 0,\n        yyleng = 0,\n        recovering = 0,\n        TERROR = 2,\n        EOF = 1;\n\n    var args = lstack.slice.call(arguments, 1);\n\n    //this.reductionCount = this.shiftCount = 0;\n\n    var lexer = Object.create(this.lexer);\n    var sharedState = { yy: {} };\n    // copy state\n    for (var k in this.yy) {\n      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {\n        sharedState.yy[k] = this.yy[k];\n      }\n    }\n\n    lexer.setInput(input, sharedState.yy);\n    sharedState.yy.lexer = lexer;\n    sharedState.yy.parser = this;\n    if (typeof lexer.yylloc == 'undefined') {\n        lexer.yylloc = {};\n    }\n    var yyloc = lexer.yylloc;\n    lstack.push(yyloc);\n\n    var ranges = lexer.options && lexer.options.ranges;\n\n    if (typeof sharedState.yy.parseError === 'function') {\n        this.parseError = sharedState.yy.parseError;\n    } else {\n        this.parseError = Object.getPrototypeOf(this).parseError;\n    }\n\n    function popStack (n) {\n        stack.length = stack.length - 2 * n;\n        vstack.length = vstack.length - n;\n        lstack.length = lstack.length - n;\n    }\n\n_token_stack:\n    var lex = function () {\n        var token;\n        token = lexer.lex() || EOF;\n        // if token isn't its numeric value, convert\n        if (typeof token !== 'number') {\n            token = self.symbols_[token] || token;\n        }\n        return token;\n    }\n\n    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;\n    while (true) {\n        // retreive state number from top of stack\n        state = stack[stack.length - 1];\n\n        // use default actions if available\n        if (this.defaultActions[state]) {\n            action = this.defaultActions[state];\n        } else {\n            if (symbol === null || typeof symbol == 'undefined') {\n                symbol = lex();\n            }\n            // read action for current state and first input\n            action = table[state] && table[state][symbol];\n        }\n\n_handle_error:\n        // handle parse error\n        if (typeof action === 'undefined' || !action.length || !action[0]) {\n            var error_rule_depth;\n            var errStr = '';\n\n            // Return the rule stack depth where the nearest error rule can be found.\n            // Return FALSE when no error recovery rule was found.\n            function locateNearestErrorRecoveryRule(state) {\n                var stack_probe = stack.length - 1;\n                var depth = 0;\n\n                // try to recover from error\n                for(;;) {\n                    // check for error recovery rule in this state\n                    if ((TERROR.toString()) in table[state]) {\n                        return depth;\n                    }\n                    if (state === 0 || stack_probe < 2) {\n                        return false; // No suitable error recovery rule available.\n                    }\n                    stack_probe -= 2; // popStack(1): [symbol, action]\n                    state = stack[stack_probe];\n                    ++depth;\n                }\n            }\n\n            if (!recovering) {\n                // first see if there's any chance at hitting an error recovery rule:\n                error_rule_depth = locateNearestErrorRecoveryRule(state);\n\n                // Report error\n                expected = [];\n                for (p in table[state]) {\n                    if (this.terminals_[p] && p > TERROR) {\n                        expected.push(\"'\"+this.terminals_[p]+\"'\");\n                    }\n                }\n                if (lexer.showPosition) {\n                    errStr = 'Parse error on line '+(yylineno+1)+\":\\n\"+lexer.showPosition()+\"\\nExpecting \"+expected.join(', ') + \", got '\" + (this.terminals_[symbol] || symbol)+ \"'\";\n                } else {\n                    errStr = 'Parse error on line '+(yylineno+1)+\": Unexpected \" +\n                                  (symbol == EOF ? \"end of input\" :\n                                              (\"'\"+(this.terminals_[symbol] || symbol)+\"'\"));\n                }\n                this.parseError(errStr, {\n                    text: lexer.match,\n                    token: this.terminals_[symbol] || symbol,\n                    line: lexer.yylineno,\n                    loc: yyloc,\n                    expected: expected,\n                    recoverable: (error_rule_depth !== false)\n                });\n            } else if (preErrorSymbol !== EOF) {\n                error_rule_depth = locateNearestErrorRecoveryRule(state);\n            }\n\n            // just recovered from another error\n            if (recovering == 3) {\n                if (symbol === EOF || preErrorSymbol === EOF) {\n                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');\n                }\n\n                // discard current lookahead and grab another\n                yyleng = lexer.yyleng;\n                yytext = lexer.yytext;\n                yylineno = lexer.yylineno;\n                yyloc = lexer.yylloc;\n                symbol = lex();\n            }\n\n            // try to recover from error\n            if (error_rule_depth === false) {\n                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');\n            }\n            popStack(error_rule_depth);\n\n            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token\n            symbol = TERROR;         // insert generic error symbol as new lookahead\n            state = stack[stack.length-1];\n            action = table[state] && table[state][TERROR];\n            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error\n        }\n\n        // this shouldn't happen, unless resolve defaults are off\n        if (action[0] instanceof Array && action.length > 1) {\n            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);\n        }\n\n        switch (action[0]) {\n            case 1: // shift\n                //this.shiftCount++;\n\n                stack.push(symbol);\n                vstack.push(lexer.yytext);\n                lstack.push(lexer.yylloc);\n                stack.push(action[1]); // push state\n                symbol = null;\n                if (!preErrorSymbol) { // normal execution/no error\n                    yyleng = lexer.yyleng;\n                    yytext = lexer.yytext;\n                    yylineno = lexer.yylineno;\n                    yyloc = lexer.yylloc;\n                    if (recovering > 0) {\n                        recovering--;\n                    }\n                } else {\n                    // error just occurred, resume old lookahead f/ before error\n                    symbol = preErrorSymbol;\n                    preErrorSymbol = null;\n                }\n                break;\n\n            case 2:\n                // reduce\n                //this.reductionCount++;\n\n                len = this.productions_[action[1]][1];\n\n                // perform semantic action\n                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1\n                // default location, uses first token for firsts, last for lasts\n                yyval._$ = {\n                    first_line: lstack[lstack.length-(len||1)].first_line,\n                    last_line: lstack[lstack.length-1].last_line,\n                    first_column: lstack[lstack.length-(len||1)].first_column,\n                    last_column: lstack[lstack.length-1].last_column\n                };\n                if (ranges) {\n                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];\n                }\n                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));\n\n                if (typeof r !== 'undefined') {\n                    return r;\n                }\n\n                // pop off stack\n                if (len) {\n                    stack = stack.slice(0,-1*len*2);\n                    vstack = vstack.slice(0, -1*len);\n                    lstack = lstack.slice(0, -1*len);\n                }\n\n                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)\n                vstack.push(yyval.$);\n                lstack.push(yyval._$);\n                // goto new state = table[STATE][NONTERMINAL]\n                newState = table[stack[stack.length-2]][stack[stack.length-1]];\n                stack.push(newState);\n                break;\n\n            case 3:\n                // accept\n                return true;\n        }\n\n    }\n\n    return true;\n};\n\nparser.init = function parser_init (dict) {\n    this.table = dict.table;\n    this.defaultActions = dict.defaultActions;\n    this.performAction = dict.performAction;\n    this.productions_ = dict.productions_;\n    this.symbols_ = dict.symbols_;\n    this.terminals_ = dict.terminals_;\n};\n\n/*\n * LR(0) Parser\n * */\n\nvar lr0 = generator.beget(lookaheadMixin, lrGeneratorMixin, {\n    type: \"LR(0)\",\n    afterconstructor: function lr0_afterconstructor () {\n        this.buildTable();\n    }\n});\n\nvar LR0Generator = exports.LR0Generator = lr0.construct();\n\n/*\n * Simple LALR(1)\n * */\n\nvar lalr = generator.beget(lookaheadMixin, lrGeneratorMixin, {\n    type: \"LALR(1)\",\n\n    afterconstructor: function (grammar, options) {\n        if (this.DEBUG) this.mix(lrGeneratorDebug, lalrGeneratorDebug); // mixin debug methods\n\n        options = options || {};\n        this.states = this.canonicalCollection();\n        this.terms_ = {};\n\n        var newg = this.newg = typal.beget(lookaheadMixin,{\n            oldg: this,\n            trace: this.trace,\n            nterms_: {},\n            DEBUG: false,\n            go_: function (r, B) {\n                r = r.split(\":\")[0]; // grab state #\n                B = B.map(function (b) { return b.slice(b.indexOf(\":\")+1); });\n                return this.oldg.go(r, B);\n            }\n        });\n        newg.nonterminals = {};\n        newg.productions = [];\n\n        this.inadequateStates = [];\n\n        // if true, only lookaheads in inadequate states are computed (faster, larger table)\n        // if false, lookaheads for all reductions will be computed (slower, smaller table)\n        this.onDemandLookahead = options.onDemandLookahead || false;\n\n        this.buildNewGrammar();\n        newg.computeLookaheads();\n        this.unionLookaheads();\n\n        this.table = this.parseTable(this.states);\n        this.defaultActions = findDefaults(this.table);\n    },\n\n    lookAheads: function LALR_lookaheads (state, item) {\n        return (!!this.onDemandLookahead && !state.inadequate) ? this.terminals : item.follows;\n    },\n    go: function LALR_go (p, w) {\n        var q = parseInt(p, 10);\n        for (var i=0;i<w.length;i++) {\n            q = this.states.item(q).edges[w[i]] || q;\n        }\n        return q;\n    },\n    goPath: function LALR_goPath (p, w) {\n        var q = parseInt(p, 10),t,\n            path = [];\n        for (var i=0;i<w.length;i++) {\n            t = w[i] ? q+\":\"+w[i] : '';\n            if (t) this.newg.nterms_[t] = q;\n            path.push(t);\n            q = this.states.item(q).edges[w[i]] || q;\n            this.terms_[t] = w[i];\n        }\n        return {path: path, endState: q};\n    },\n    // every disjoint reduction of a nonterminal becomes a produciton in G'\n    buildNewGrammar: function LALR_buildNewGrammar () {\n        var self = this,\n            newg = this.newg;\n\n        this.states.forEach(function (state, i) {\n            state.forEach(function (item) {\n                if (item.dotPosition === 0) {\n                    // new symbols are a combination of state and transition symbol\n                    var symbol = i+\":\"+item.production.symbol;\n                    self.terms_[symbol] = item.production.symbol;\n                    newg.nterms_[symbol] = i;\n                    if (!newg.nonterminals[symbol])\n                        newg.nonterminals[symbol] = new Nonterminal(symbol);\n                    var pathInfo = self.goPath(i, item.production.handle);\n                    var p = new Production(symbol, pathInfo.path, newg.productions.length);\n                    newg.productions.push(p);\n                    newg.nonterminals[symbol].productions.push(p);\n\n                    // store the transition that get's 'backed up to' after reduction on path\n                    var handle = item.production.handle.join(' ');\n                    var goes = self.states.item(pathInfo.endState).goes;\n                    if (!goes[handle])\n                        goes[handle] = [];\n                    goes[handle].push(symbol);\n\n                    //self.trace('new production:',p);\n                }\n            });\n            if (state.inadequate)\n                self.inadequateStates.push(i);\n        });\n    },\n    unionLookaheads: function LALR_unionLookaheads () {\n        var self = this,\n            newg = this.newg,\n            states = !!this.onDemandLookahead ? this.inadequateStates : this.states;\n\n        states.forEach(function union_states_forEach (i) {\n            var state = typeof i === 'number' ? self.states.item(i) : i,\n                follows = [];\n            if (state.reductions.length)\n            state.reductions.forEach(function union_reduction_forEach (item) {\n                var follows = {};\n                for (var k=0;k<item.follows.length;k++) {\n                    follows[item.follows[k]] = true;\n                }\n                state.goes[item.production.handle.join(' ')].forEach(function reduction_goes_forEach (symbol) {\n                    newg.nonterminals[symbol].follows.forEach(function goes_follows_forEach (symbol) {\n                        var terminal = self.terms_[symbol];\n                        if (!follows[terminal]) {\n                            follows[terminal]=true;\n                            item.follows.push(terminal);\n                        }\n                    });\n                });\n                //self.trace('unioned item', item);\n            });\n        });\n    }\n});\n\nvar LALRGenerator = exports.LALRGenerator = lalr.construct();\n\n// LALR generator debug mixin\n\nvar lalrGeneratorDebug = {\n    trace: function trace () {\n        Jison.print.apply(null, arguments);\n    },\n    beforebuildNewGrammar: function () {\n        this.trace(this.states.size()+\" states.\");\n        this.trace(\"Building lookahead grammar.\");\n    },\n    beforeunionLookaheads: function () {\n        this.trace(\"Computing lookaheads.\");\n    }\n};\n\n/*\n * Lookahead parser definitions\n *\n * Define base type\n * */\nvar lrLookaheadGenerator = generator.beget(lookaheadMixin, lrGeneratorMixin, {\n    afterconstructor: function lr_aftercontructor () {\n        this.computeLookaheads();\n        this.buildTable();\n    }\n});\n\n/*\n * SLR Parser\n * */\nvar SLRGenerator = exports.SLRGenerator = lrLookaheadGenerator.construct({\n    type: \"SLR(1)\",\n\n    lookAheads: function SLR_lookAhead (state, item) {\n        return this.nonterminals[item.production.symbol].follows;\n    }\n});\n\n\n/*\n * LR(1) Parser\n * */\nvar lr1 = lrLookaheadGenerator.beget({\n    type: \"Canonical LR(1)\",\n\n    lookAheads: function LR_lookAheads (state, item) {\n        return item.follows;\n    },\n    Item: lrGeneratorMixin.Item.prototype.construct({\n        afterconstructor: function () {\n            this.id = this.production.id+'a'+this.dotPosition+'a'+this.follows.sort().join(',');\n        },\n        eq: function (e) {\n            return e.id === this.id;\n        }\n    }),\n\n    closureOperation: function LR_ClosureOperation (itemSet /*, closureSet*/) {\n        var closureSet = new this.ItemSet();\n        var self = this;\n\n        var set = itemSet,\n            itemQueue, syms = {};\n\n        do {\n        itemQueue = new Set();\n        closureSet.concat(set);\n        set.forEach(function (item) {\n            var symbol = item.markedSymbol;\n            var b, r;\n\n            // if token is a nonterminal, recursively add closures\n            if (symbol && self.nonterminals[symbol]) {\n                r = item.remainingHandle();\n                b = self.first(item.remainingHandle());\n                if (b.length === 0 || item.production.nullable || self.nullable(r)) {\n                    b = b.concat(item.follows);\n                }\n                self.nonterminals[symbol].productions.forEach(function (production) {\n                    var newItem = new self.Item(production, 0, b);\n                    if(!closureSet.contains(newItem) && !itemQueue.contains(newItem)) {\n                        itemQueue.push(newItem);\n                    }\n                });\n            } else if (!symbol) {\n                // reduction\n                closureSet.reductions.push(item);\n            }\n        });\n\n        set = itemQueue;\n        } while (!itemQueue.isEmpty());\n\n        return closureSet;\n    }\n});\n\nvar LR1Generator = exports.LR1Generator = lr1.construct();\n\n/*\n * LL Parser\n * */\nvar ll = generator.beget(lookaheadMixin, {\n    type: \"LL(1)\",\n\n    afterconstructor: function ll_aftercontructor () {\n        this.computeLookaheads();\n        this.table = this.parseTable(this.productions);\n    },\n    parseTable: function llParseTable (productions) {\n        var table = {},\n            self = this;\n        productions.forEach(function (production, i) {\n            var row = table[production.symbol] || {};\n            var tokens = production.first;\n            if (self.nullable(production.handle)) {\n                Set.union(tokens, self.nonterminals[production.symbol].follows);\n            }\n            tokens.forEach(function (token) {\n                if (row[token]) {\n                    row[token].push(i);\n                    self.conflicts++;\n                } else {\n                    row[token] = [i];\n                }\n            });\n            table[production.symbol] = row;\n        });\n\n        return table;\n    }\n});\n\nvar LLGenerator = exports.LLGenerator = ll.construct();\n\nJison.Generator = function Jison_Generator (g, options) {\n    var opt = typal.mix.call({}, g.options, options);\n    switch (opt.type) {\n        case 'lr0':\n            return new LR0Generator(g, opt);\n        case 'slr':\n            return new SLRGenerator(g, opt);\n        case 'lr':\n            return new LR1Generator(g, opt);\n        case 'll':\n            return new LLGenerator(g, opt);\n        default:\n            return new LALRGenerator(g, opt);\n    }\n};\n\nreturn function Parser (g, options) {\n        var gen = Jison.Generator(g, options);\n        return gen.createParser();\n    };\n\n})();\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ \"./node_modules/process/browser.js\")))\n\n//# sourceURL=webpack:///./node_modules/jison/lib/jison.js?");

/***/ }),

/***/ "./node_modules/jison/lib/util/set.js":
/*!********************************************!*\
  !*** ./node_modules/jison/lib/util/set.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Set class to wrap arrays\n\nvar typal = __webpack_require__(/*! ./typal */ \"./node_modules/jison/lib/util/typal.js\").typal;\n\nvar setMixin = {\n    constructor: function Set_constructor (set, raw) {\n        this._items = [];\n        if (set && set.constructor === Array)\n            this._items = raw ? set: set.slice(0);\n        else if(arguments.length)\n            this._items = [].slice.call(arguments,0);\n    },\n    concat: function concat (setB) {\n        this._items.push.apply(this._items, setB._items || setB); \n        return this;\n    },\n    eq: function eq (set) {\n        return this._items.length === set._items.length && this.subset(set); \n    },\n    indexOf: function indexOf (item) {\n        if(item && item.eq) {\n            for(var k=0; k<this._items.length;k++)\n                if(item.eq(this._items[k]))\n                    return k;\n            return -1;\n        }\n        return this._items.indexOf(item);\n    },\n    union: function union (set) {\n        return (new Set(this._items)).concat(this.complement(set));\n    },\n    intersection: function intersection (set) {\n    return this.filter(function (elm) {\n            return set.contains(elm);\n        });\n    },\n    complement: function complement (set) {\n        var that = this;\n        return set.filter(function sub_complement (elm) {\n            return !that.contains(elm);\n        });\n    },\n    subset: function subset (set) {\n        var cont = true;\n        for (var i=0; i<this._items.length && cont;i++) {\n            cont = cont && set.contains(this._items[i]);\n        }\n        return cont;\n    },\n    superset: function superset (set) {\n        return set.subset(this);\n    },\n    joinSet: function joinSet (set) {\n        return this.concat(this.complement(set));\n    },\n    contains: function contains (item) { return this.indexOf(item) !== -1; },\n    item: function item (v, val) { return this._items[v]; },\n    i: function i (v, val) { return this._items[v]; },\n    first: function first () { return this._items[0]; },\n    last: function last () { return this._items[this._items.length-1]; },\n    size: function size () { return this._items.length; },\n    isEmpty: function isEmpty () { return this._items.length === 0; },\n    copy: function copy () { return new Set(this._items); },\n    toString: function toString () { return this._items.toString(); }\n};\n\n\"push shift unshift forEach some every join sort\".split(' ').forEach(function (e,i) {\n    setMixin[e] = function () { return Array.prototype[e].apply(this._items, arguments); };\n    setMixin[e].name = e;\n});\n\"filter slice map\".split(' ').forEach(function (e,i) {\n    setMixin[e] = function () { return new Set(Array.prototype[e].apply(this._items, arguments), true); };\n    setMixin[e].name = e;\n});\n\nvar Set = typal.construct(setMixin).mix({\n    union: function (a, b) {\n        var ar = {};\n        for (var k=a.length-1;k >=0;--k) {\n            ar[a[k]] = true;\n        }\n        for (var i=b.length-1;i >= 0;--i) {\n            if (!ar[b[i]]) {\n                a.push(b[i]);\n            }\n        }\n        return a;\n    }\n});\n\nif (true)\n    exports.Set = Set;\n\n\n\n//# sourceURL=webpack:///./node_modules/jison/lib/util/set.js?");

/***/ }),

/***/ "./node_modules/jison/lib/util/typal.js":
/*!**********************************************!*\
  !*** ./node_modules/jison/lib/util/typal.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n * Introduces a typal object to make classical/prototypal patterns easier\n * Plus some AOP sugar\n *\n * By Zachary Carter <zach@carter.name>\n * MIT Licensed\n * */\n\nvar typal = (function () {\n\nvar create = Object.create || function (o) { function F(){} F.prototype = o; return new F(); };\nvar position = /^(before|after)/;\n\n// basic method layering\n// always returns original method's return value\nfunction layerMethod(k, fun) {\n    var pos = k.match(position)[0],\n        key = k.replace(position, ''),\n        prop = this[key];\n\n    if (pos === 'after') {\n        this[key] = function () {\n            var ret = prop.apply(this, arguments);\n            var args = [].slice.call(arguments);\n            args.splice(0, 0, ret);\n            fun.apply(this, args);\n            return ret;\n        };\n    } else if (pos === 'before') {\n        this[key] = function () {\n            fun.apply(this, arguments);\n            var ret = prop.apply(this, arguments);\n            return ret;\n        };\n    }\n}\n\n// mixes each argument's own properties into calling object,\n// overwriting them or layering them. i.e. an object method 'meth' is\n// layered by mixin methods 'beforemeth' or 'aftermeth'\nfunction typal_mix() {\n    var self = this;\n    for(var i=0,o,k; i<arguments.length; i++) {\n        o=arguments[i];\n        if (!o) continue;\n        if (Object.prototype.hasOwnProperty.call(o,'constructor'))\n            this.constructor = o.constructor;\n        if (Object.prototype.hasOwnProperty.call(o,'toString'))\n            this.toString = o.toString;\n        for(k in o) {\n            if (Object.prototype.hasOwnProperty.call(o, k)) {\n                if(k.match(position) && typeof this[k.replace(position, '')] === 'function')\n                    layerMethod.call(this, k, o[k]);\n                else\n                    this[k] = o[k];\n            }\n        }\n    }\n    return this;\n}\n\nreturn {\n    // extend object with own typalperties of each argument\n    mix: typal_mix,\n\n    // sugar for object begetting and mixing\n    // - Object.create(typal).mix(etc, etc);\n    // + typal.beget(etc, etc);\n    beget: function typal_beget() {\n        return arguments.length ? typal_mix.apply(create(this), arguments) : create(this);\n    },\n\n    // Creates a new Class function based on an object with a constructor method\n    construct: function typal_construct() {\n        var o = typal_mix.apply(create(this), arguments);\n        var constructor = o.constructor;\n        var Klass = o.constructor = function () { return constructor.apply(this, arguments); };\n        Klass.prototype = o;\n        Klass.mix = typal_mix; // allow for easy singleton property extension\n        return Klass;\n    },\n\n    // no op\n    constructor: function typal_constructor() { return this; }\n};\n\n})();\n\nif (true)\n    exports.typal = typal;\n\n\n//# sourceURL=webpack:///./node_modules/jison/lib/util/typal.js?");

/***/ }),

/***/ "./node_modules/jison/node_modules/esprima/esprima.js":
/*!************************************************************!*\
  !*** ./node_modules/jison/node_modules/esprima/esprima.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*\n  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>\n  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>\n  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>\n  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>\n  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>\n  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>\n  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>\n  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>\n  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>\n  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>\n\n  Redistribution and use in source and binary forms, with or without\n  modification, are permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright\n      notice, this list of conditions and the following disclaimer in the\n      documentation and/or other materials provided with the distribution.\n\n  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n/*jslint bitwise:true plusplus:true */\n/*global esprima:true, define:true, exports:true, window: true,\ncreateLocationMarker: true,\nthrowError: true, generateStatement: true, peek: true,\nparseAssignmentExpression: true, parseBlock: true, parseExpression: true,\nparseFunctionDeclaration: true, parseFunctionExpression: true,\nparseFunctionSourceElements: true, parseVariableIdentifier: true,\nparseLeftHandSideExpression: true,\nparseUnaryExpression: true,\nparseStatement: true, parseSourceElement: true */\n\n(function (root, factory) {\n    'use strict';\n\n    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,\n    // Rhino, and plain browser loading.\n    if (true) {\n        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n    } else {}\n}(this, function (exports) {\n    'use strict';\n\n    var Token,\n        TokenName,\n        FnExprTokens,\n        Syntax,\n        PropertyKind,\n        Messages,\n        Regex,\n        SyntaxTreeDelegate,\n        source,\n        strict,\n        index,\n        lineNumber,\n        lineStart,\n        length,\n        delegate,\n        lookahead,\n        state,\n        extra;\n\n    Token = {\n        BooleanLiteral: 1,\n        EOF: 2,\n        Identifier: 3,\n        Keyword: 4,\n        NullLiteral: 5,\n        NumericLiteral: 6,\n        Punctuator: 7,\n        StringLiteral: 8,\n        RegularExpression: 9\n    };\n\n    TokenName = {};\n    TokenName[Token.BooleanLiteral] = 'Boolean';\n    TokenName[Token.EOF] = '<end>';\n    TokenName[Token.Identifier] = 'Identifier';\n    TokenName[Token.Keyword] = 'Keyword';\n    TokenName[Token.NullLiteral] = 'Null';\n    TokenName[Token.NumericLiteral] = 'Numeric';\n    TokenName[Token.Punctuator] = 'Punctuator';\n    TokenName[Token.StringLiteral] = 'String';\n    TokenName[Token.RegularExpression] = 'RegularExpression';\n\n    // A function following one of those tokens is an expression.\n    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',\n                    'return', 'case', 'delete', 'throw', 'void',\n                    // assignment operators\n                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',\n                    '&=', '|=', '^=', ',',\n                    // binary/unary operators\n                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',\n                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',\n                    '<=', '<', '>', '!=', '!=='];\n\n    Syntax = {\n        AssignmentExpression: 'AssignmentExpression',\n        ArrayExpression: 'ArrayExpression',\n        BlockStatement: 'BlockStatement',\n        BinaryExpression: 'BinaryExpression',\n        BreakStatement: 'BreakStatement',\n        CallExpression: 'CallExpression',\n        CatchClause: 'CatchClause',\n        ConditionalExpression: 'ConditionalExpression',\n        ContinueStatement: 'ContinueStatement',\n        DoWhileStatement: 'DoWhileStatement',\n        DebuggerStatement: 'DebuggerStatement',\n        EmptyStatement: 'EmptyStatement',\n        ExpressionStatement: 'ExpressionStatement',\n        ForStatement: 'ForStatement',\n        ForInStatement: 'ForInStatement',\n        FunctionDeclaration: 'FunctionDeclaration',\n        FunctionExpression: 'FunctionExpression',\n        Identifier: 'Identifier',\n        IfStatement: 'IfStatement',\n        Literal: 'Literal',\n        LabeledStatement: 'LabeledStatement',\n        LogicalExpression: 'LogicalExpression',\n        MemberExpression: 'MemberExpression',\n        NewExpression: 'NewExpression',\n        ObjectExpression: 'ObjectExpression',\n        Program: 'Program',\n        Property: 'Property',\n        ReturnStatement: 'ReturnStatement',\n        SequenceExpression: 'SequenceExpression',\n        SwitchStatement: 'SwitchStatement',\n        SwitchCase: 'SwitchCase',\n        ThisExpression: 'ThisExpression',\n        ThrowStatement: 'ThrowStatement',\n        TryStatement: 'TryStatement',\n        UnaryExpression: 'UnaryExpression',\n        UpdateExpression: 'UpdateExpression',\n        VariableDeclaration: 'VariableDeclaration',\n        VariableDeclarator: 'VariableDeclarator',\n        WhileStatement: 'WhileStatement',\n        WithStatement: 'WithStatement'\n    };\n\n    PropertyKind = {\n        Data: 1,\n        Get: 2,\n        Set: 4\n    };\n\n    // Error messages should be identical to V8.\n    Messages = {\n        UnexpectedToken:  'Unexpected token %0',\n        UnexpectedNumber:  'Unexpected number',\n        UnexpectedString:  'Unexpected string',\n        UnexpectedIdentifier:  'Unexpected identifier',\n        UnexpectedReserved:  'Unexpected reserved word',\n        UnexpectedEOS:  'Unexpected end of input',\n        NewlineAfterThrow:  'Illegal newline after throw',\n        InvalidRegExp: 'Invalid regular expression',\n        UnterminatedRegExp:  'Invalid regular expression: missing /',\n        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',\n        InvalidLHSInForIn:  'Invalid left-hand side in for-in',\n        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',\n        NoCatchOrFinally:  'Missing catch or finally after try',\n        UnknownLabel: 'Undefined label \\'%0\\'',\n        Redeclaration: '%0 \\'%1\\' has already been declared',\n        IllegalContinue: 'Illegal continue statement',\n        IllegalBreak: 'Illegal break statement',\n        IllegalReturn: 'Illegal return statement',\n        StrictModeWith:  'Strict mode code may not include a with statement',\n        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',\n        StrictVarName:  'Variable name may not be eval or arguments in strict mode',\n        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',\n        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',\n        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',\n        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',\n        StrictDelete:  'Delete of an unqualified identifier in strict mode.',\n        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',\n        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',\n        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',\n        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',\n        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',\n        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',\n        StrictReservedWord:  'Use of future reserved word in strict mode'\n    };\n\n    // See also tools/generate-unicode-regex.py.\n    Regex = {\n        NonAsciiIdentifierStart: new RegExp('[\\xAA\\xB5\\xBA\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16EE-\\u16F0\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2160-\\u2188\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6EF\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]'),\n        NonAsciiIdentifierPart: new RegExp('[\\xAA\\xB5\\xBA\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0300-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u0483-\\u0487\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0610-\\u061A\\u0620-\\u0669\\u066E-\\u06D3\\u06D5-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06FC\\u06FF\\u0710-\\u074A\\u074D-\\u07B1\\u07C0-\\u07F5\\u07FA\\u0800-\\u082D\\u0840-\\u085B\\u08A0\\u08A2-\\u08AC\\u08E4-\\u08FE\\u0900-\\u0963\\u0966-\\u096F\\u0971-\\u0977\\u0979-\\u097F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CE\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A01-\\u0A03\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A75\\u0A81-\\u0A83\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AD0\\u0AE0-\\u0AE3\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3C-\\u0B44\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B63\\u0B66-\\u0B6F\\u0B71\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD0\\u0BD7\\u0BE6-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C58\\u0C59\\u0C60-\\u0C63\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBC-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0-\\u0CE3\\u0CE6-\\u0CEF\\u0CF1\\u0CF2\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D-\\u0D44\\u0D46-\\u0D48\\u0D4A-\\u0D4E\\u0D57\\u0D60-\\u0D63\\u0D66-\\u0D6F\\u0D7A-\\u0D7F\\u0D82\\u0D83\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0DCA\\u0DCF-\\u0DD4\\u0DD6\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0E01-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0EDC-\\u0EDF\\u0F00\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F6C\\u0F71-\\u0F84\\u0F86-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u1000-\\u1049\\u1050-\\u109D\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u135D-\\u135F\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16EE-\\u16F0\\u1700-\\u170C\\u170E-\\u1714\\u1720-\\u1734\\u1740-\\u1753\\u1760-\\u176C\\u176E-\\u1770\\u1772\\u1773\\u1780-\\u17D3\\u17D7\\u17DC\\u17DD\\u17E0-\\u17E9\\u180B-\\u180D\\u1810-\\u1819\\u1820-\\u1877\\u1880-\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1920-\\u192B\\u1930-\\u193B\\u1946-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19B0-\\u19C9\\u19D0-\\u19D9\\u1A00-\\u1A1B\\u1A20-\\u1A5E\\u1A60-\\u1A7C\\u1A7F-\\u1A89\\u1A90-\\u1A99\\u1AA7\\u1B00-\\u1B4B\\u1B50-\\u1B59\\u1B6B-\\u1B73\\u1B80-\\u1BF3\\u1C00-\\u1C37\\u1C40-\\u1C49\\u1C4D-\\u1C7D\\u1CD0-\\u1CD2\\u1CD4-\\u1CF6\\u1D00-\\u1DE6\\u1DFC-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u200C\\u200D\\u203F\\u2040\\u2054\\u2071\\u207F\\u2090-\\u209C\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2160-\\u2188\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D7F-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2DE0-\\u2DFF\\u2E2F\\u3005-\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3038-\\u303C\\u3041-\\u3096\\u3099\\u309A\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA62B\\uA640-\\uA66F\\uA674-\\uA67D\\uA67F-\\uA697\\uA69F-\\uA6F1\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA827\\uA840-\\uA873\\uA880-\\uA8C4\\uA8D0-\\uA8D9\\uA8E0-\\uA8F7\\uA8FB\\uA900-\\uA92D\\uA930-\\uA953\\uA960-\\uA97C\\uA980-\\uA9C0\\uA9CF-\\uA9D9\\uAA00-\\uAA36\\uAA40-\\uAA4D\\uAA50-\\uAA59\\uAA60-\\uAA76\\uAA7A\\uAA7B\\uAA80-\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEF\\uAAF2-\\uAAF6\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABEA\\uABEC\\uABED\\uABF0-\\uABF9\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE00-\\uFE0F\\uFE20-\\uFE26\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF3F\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]')\n    };\n\n    // Ensure the condition is true, otherwise throw an error.\n    // This is only to have a better contract semantic, i.e. another safety net\n    // to catch a logic error. The condition shall be fulfilled in normal case.\n    // Do NOT use this to enforce a certain condition on any user input.\n\n    function assert(condition, message) {\n        if (!condition) {\n            throw new Error('ASSERT: ' + message);\n        }\n    }\n\n    function isDecimalDigit(ch) {\n        return (ch >= 48 && ch <= 57);   // 0..9\n    }\n\n    function isHexDigit(ch) {\n        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;\n    }\n\n    function isOctalDigit(ch) {\n        return '01234567'.indexOf(ch) >= 0;\n    }\n\n\n    // 7.2 White Space\n\n    function isWhiteSpace(ch) {\n        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||\n            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);\n    }\n\n    // 7.3 Line Terminators\n\n    function isLineTerminator(ch) {\n        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);\n    }\n\n    // 7.6 Identifier Names and Identifiers\n\n    function isIdentifierStart(ch) {\n        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)\n            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z\n            (ch >= 0x61 && ch <= 0x7A) ||         // a..z\n            (ch === 0x5C) ||                      // \\ (backslash)\n            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));\n    }\n\n    function isIdentifierPart(ch) {\n        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)\n            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z\n            (ch >= 0x61 && ch <= 0x7A) ||         // a..z\n            (ch >= 0x30 && ch <= 0x39) ||         // 0..9\n            (ch === 0x5C) ||                      // \\ (backslash)\n            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));\n    }\n\n    // 7.6.1.2 Future Reserved Words\n\n    function isFutureReservedWord(id) {\n        switch (id) {\n        case 'class':\n        case 'enum':\n        case 'export':\n        case 'extends':\n        case 'import':\n        case 'super':\n            return true;\n        default:\n            return false;\n        }\n    }\n\n    function isStrictModeReservedWord(id) {\n        switch (id) {\n        case 'implements':\n        case 'interface':\n        case 'package':\n        case 'private':\n        case 'protected':\n        case 'public':\n        case 'static':\n        case 'yield':\n        case 'let':\n            return true;\n        default:\n            return false;\n        }\n    }\n\n    function isRestrictedWord(id) {\n        return id === 'eval' || id === 'arguments';\n    }\n\n    // 7.6.1.1 Keywords\n\n    function isKeyword(id) {\n        if (strict && isStrictModeReservedWord(id)) {\n            return true;\n        }\n\n        // 'const' is specialized as Keyword in V8.\n        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.\n        // Some others are from future reserved words.\n\n        switch (id.length) {\n        case 2:\n            return (id === 'if') || (id === 'in') || (id === 'do');\n        case 3:\n            return (id === 'var') || (id === 'for') || (id === 'new') ||\n                (id === 'try') || (id === 'let');\n        case 4:\n            return (id === 'this') || (id === 'else') || (id === 'case') ||\n                (id === 'void') || (id === 'with') || (id === 'enum');\n        case 5:\n            return (id === 'while') || (id === 'break') || (id === 'catch') ||\n                (id === 'throw') || (id === 'const') || (id === 'yield') ||\n                (id === 'class') || (id === 'super');\n        case 6:\n            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||\n                (id === 'switch') || (id === 'export') || (id === 'import');\n        case 7:\n            return (id === 'default') || (id === 'finally') || (id === 'extends');\n        case 8:\n            return (id === 'function') || (id === 'continue') || (id === 'debugger');\n        case 10:\n            return (id === 'instanceof');\n        default:\n            return false;\n        }\n    }\n\n    // 7.4 Comments\n\n    function addComment(type, value, start, end, loc) {\n        var comment, attacher;\n\n        assert(typeof start === 'number', 'Comment must have valid position');\n\n        // Because the way the actual token is scanned, often the comments\n        // (if any) are skipped twice during the lexical analysis.\n        // Thus, we need to skip adding a comment if the comment array already\n        // handled it.\n        if (state.lastCommentStart >= start) {\n            return;\n        }\n        state.lastCommentStart = start;\n\n        comment = {\n            type: type,\n            value: value\n        };\n        if (extra.range) {\n            comment.range = [start, end];\n        }\n        if (extra.loc) {\n            comment.loc = loc;\n        }\n        extra.comments.push(comment);\n\n        if (extra.attachComment) {\n            attacher = {\n                comment: comment,\n                leading: null,\n                trailing: null,\n                range: [start, end]\n            };\n            extra.pendingComments.push(attacher);\n        }\n    }\n\n    function skipSingleLineComment(offset) {\n        var start, loc, ch, comment;\n\n        start = index - offset;\n        loc = {\n            start: {\n                line: lineNumber,\n                column: index - lineStart - offset\n            }\n        };\n\n        while (index < length) {\n            ch = source.charCodeAt(index);\n            ++index;\n            if (isLineTerminator(ch)) {\n                if (extra.comments) {\n                    comment = source.slice(start + offset, index - 1);\n                    loc.end = {\n                        line: lineNumber,\n                        column: index - lineStart - 1\n                    };\n                    addComment('Line', comment, start, index - 1, loc);\n                }\n                if (ch === 13 && source.charCodeAt(index) === 10) {\n                    ++index;\n                }\n                ++lineNumber;\n                lineStart = index;\n                return;\n            }\n        }\n\n        if (extra.comments) {\n            comment = source.slice(start + offset, index);\n            loc.end = {\n                line: lineNumber,\n                column: index - lineStart\n            };\n            addComment('Line', comment, start, index, loc);\n        }\n    }\n\n    function skipMultiLineComment() {\n        var start, loc, ch, comment;\n\n        if (extra.comments) {\n            start = index - 2;\n            loc = {\n                start: {\n                    line: lineNumber,\n                    column: index - lineStart - 2\n                }\n            };\n        }\n\n        while (index < length) {\n            ch = source.charCodeAt(index);\n            if (isLineTerminator(ch)) {\n                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {\n                    ++index;\n                }\n                ++lineNumber;\n                ++index;\n                lineStart = index;\n                if (index >= length) {\n                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n                }\n            } else if (ch === 0x2A) {\n                // Block comment ends with '*/'.\n                if (source.charCodeAt(index + 1) === 0x2F) {\n                    ++index;\n                    ++index;\n                    if (extra.comments) {\n                        comment = source.slice(start + 2, index - 2);\n                        loc.end = {\n                            line: lineNumber,\n                            column: index - lineStart\n                        };\n                        addComment('Block', comment, start, index, loc);\n                    }\n                    return;\n                }\n                ++index;\n            } else {\n                ++index;\n            }\n        }\n\n        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n    }\n\n    function skipComment() {\n        var ch, start;\n\n        start = (index === 0);\n        while (index < length) {\n            ch = source.charCodeAt(index);\n\n            if (isWhiteSpace(ch)) {\n                ++index;\n            } else if (isLineTerminator(ch)) {\n                ++index;\n                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {\n                    ++index;\n                }\n                ++lineNumber;\n                lineStart = index;\n                start = true;\n            } else if (ch === 0x2F) { // U+002F is '/'\n                ch = source.charCodeAt(index + 1);\n                if (ch === 0x2F) {\n                    ++index;\n                    ++index;\n                    skipSingleLineComment(2);\n                    start = true;\n                } else if (ch === 0x2A) {  // U+002A is '*'\n                    ++index;\n                    ++index;\n                    skipMultiLineComment();\n                } else {\n                    break;\n                }\n            } else if (start && ch === 0x2D) { // U+002D is '-'\n                // U+003E is '>'\n                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {\n                    // '-->' is a single-line comment\n                    index += 3;\n                    skipSingleLineComment(3);\n                } else {\n                    break;\n                }\n            } else if (ch === 0x3C) { // U+003C is '<'\n                if (source.slice(index + 1, index + 4) === '!--') {\n                    ++index; // `<`\n                    ++index; // `!`\n                    ++index; // `-`\n                    ++index; // `-`\n                    skipSingleLineComment(4);\n                } else {\n                    break;\n                }\n            } else {\n                break;\n            }\n        }\n    }\n\n    function scanHexEscape(prefix) {\n        var i, len, ch, code = 0;\n\n        len = (prefix === 'u') ? 4 : 2;\n        for (i = 0; i < len; ++i) {\n            if (index < length && isHexDigit(source[index])) {\n                ch = source[index++];\n                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());\n            } else {\n                return '';\n            }\n        }\n        return String.fromCharCode(code);\n    }\n\n    function getEscapedIdentifier() {\n        var ch, id;\n\n        ch = source.charCodeAt(index++);\n        id = String.fromCharCode(ch);\n\n        // '\\u' (U+005C, U+0075) denotes an escaped character.\n        if (ch === 0x5C) {\n            if (source.charCodeAt(index) !== 0x75) {\n                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n            }\n            ++index;\n            ch = scanHexEscape('u');\n            if (!ch || ch === '\\\\' || !isIdentifierStart(ch.charCodeAt(0))) {\n                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n            }\n            id = ch;\n        }\n\n        while (index < length) {\n            ch = source.charCodeAt(index);\n            if (!isIdentifierPart(ch)) {\n                break;\n            }\n            ++index;\n            id += String.fromCharCode(ch);\n\n            // '\\u' (U+005C, U+0075) denotes an escaped character.\n            if (ch === 0x5C) {\n                id = id.substr(0, id.length - 1);\n                if (source.charCodeAt(index) !== 0x75) {\n                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n                }\n                ++index;\n                ch = scanHexEscape('u');\n                if (!ch || ch === '\\\\' || !isIdentifierPart(ch.charCodeAt(0))) {\n                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n                }\n                id += ch;\n            }\n        }\n\n        return id;\n    }\n\n    function getIdentifier() {\n        var start, ch;\n\n        start = index++;\n        while (index < length) {\n            ch = source.charCodeAt(index);\n            if (ch === 0x5C) {\n                // Blackslash (U+005C) marks Unicode escape sequence.\n                index = start;\n                return getEscapedIdentifier();\n            }\n            if (isIdentifierPart(ch)) {\n                ++index;\n            } else {\n                break;\n            }\n        }\n\n        return source.slice(start, index);\n    }\n\n    function scanIdentifier() {\n        var start, id, type;\n\n        start = index;\n\n        // Backslash (U+005C) starts an escaped character.\n        id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();\n\n        // There is no keyword or literal with only one character.\n        // Thus, it must be an identifier.\n        if (id.length === 1) {\n            type = Token.Identifier;\n        } else if (isKeyword(id)) {\n            type = Token.Keyword;\n        } else if (id === 'null') {\n            type = Token.NullLiteral;\n        } else if (id === 'true' || id === 'false') {\n            type = Token.BooleanLiteral;\n        } else {\n            type = Token.Identifier;\n        }\n\n        return {\n            type: type,\n            value: id,\n            lineNumber: lineNumber,\n            lineStart: lineStart,\n            range: [start, index]\n        };\n    }\n\n\n    // 7.7 Punctuators\n\n    function scanPunctuator() {\n        var start = index,\n            code = source.charCodeAt(index),\n            code2,\n            ch1 = source[index],\n            ch2,\n            ch3,\n            ch4;\n\n        switch (code) {\n\n        // Check for most common single-character punctuators.\n        case 0x2E:  // . dot\n        case 0x28:  // ( open bracket\n        case 0x29:  // ) close bracket\n        case 0x3B:  // ; semicolon\n        case 0x2C:  // , comma\n        case 0x7B:  // { open curly brace\n        case 0x7D:  // } close curly brace\n        case 0x5B:  // [\n        case 0x5D:  // ]\n        case 0x3A:  // :\n        case 0x3F:  // ?\n        case 0x7E:  // ~\n            ++index;\n            if (extra.tokenize) {\n                if (code === 0x28) {\n                    extra.openParenToken = extra.tokens.length;\n                } else if (code === 0x7B) {\n                    extra.openCurlyToken = extra.tokens.length;\n                }\n            }\n            return {\n                type: Token.Punctuator,\n                value: String.fromCharCode(code),\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n\n        default:\n            code2 = source.charCodeAt(index + 1);\n\n            // '=' (U+003D) marks an assignment or comparison operator.\n            if (code2 === 0x3D) {\n                switch (code) {\n                case 0x25:  // %\n                case 0x26:  // &\n                case 0x2A:  // *:\n                case 0x2B:  // +\n                case 0x2D:  // -\n                case 0x2F:  // /\n                case 0x3C:  // <\n                case 0x3E:  // >\n                case 0x5E:  // ^\n                case 0x7C:  // |\n                    index += 2;\n                    return {\n                        type: Token.Punctuator,\n                        value: String.fromCharCode(code) + String.fromCharCode(code2),\n                        lineNumber: lineNumber,\n                        lineStart: lineStart,\n                        range: [start, index]\n                    };\n\n                case 0x21: // !\n                case 0x3D: // =\n                    index += 2;\n\n                    // !== and ===\n                    if (source.charCodeAt(index) === 0x3D) {\n                        ++index;\n                    }\n                    return {\n                        type: Token.Punctuator,\n                        value: source.slice(start, index),\n                        lineNumber: lineNumber,\n                        lineStart: lineStart,\n                        range: [start, index]\n                    };\n                default:\n                    break;\n                }\n            }\n            break;\n        }\n\n        // Peek more characters.\n\n        ch2 = source[index + 1];\n        ch3 = source[index + 2];\n        ch4 = source[index + 3];\n\n        // 4-character punctuator: >>>=\n\n        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {\n            if (ch4 === '=') {\n                index += 4;\n                return {\n                    type: Token.Punctuator,\n                    value: '>>>=',\n                    lineNumber: lineNumber,\n                    lineStart: lineStart,\n                    range: [start, index]\n                };\n            }\n        }\n\n        // 3-character punctuators: === !== >>> <<= >>=\n\n        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {\n            index += 3;\n            return {\n                type: Token.Punctuator,\n                value: '>>>',\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n\n        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {\n            index += 3;\n            return {\n                type: Token.Punctuator,\n                value: '<<=',\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n\n        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {\n            index += 3;\n            return {\n                type: Token.Punctuator,\n                value: '>>=',\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n\n        // Other 2-character punctuators: ++ -- << >> && ||\n\n        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {\n            index += 2;\n            return {\n                type: Token.Punctuator,\n                value: ch1 + ch2,\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n\n        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {\n            ++index;\n            return {\n                type: Token.Punctuator,\n                value: ch1,\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n\n        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n    }\n\n    // 7.8.3 Numeric Literals\n\n    function scanHexLiteral(start) {\n        var number = '';\n\n        while (index < length) {\n            if (!isHexDigit(source[index])) {\n                break;\n            }\n            number += source[index++];\n        }\n\n        if (number.length === 0) {\n            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n        }\n\n        if (isIdentifierStart(source.charCodeAt(index))) {\n            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n        }\n\n        return {\n            type: Token.NumericLiteral,\n            value: parseInt('0x' + number, 16),\n            lineNumber: lineNumber,\n            lineStart: lineStart,\n            range: [start, index]\n        };\n    }\n\n    function scanOctalLiteral(start) {\n        var number = '0' + source[index++];\n        while (index < length) {\n            if (!isOctalDigit(source[index])) {\n                break;\n            }\n            number += source[index++];\n        }\n\n        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {\n            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n        }\n\n        return {\n            type: Token.NumericLiteral,\n            value: parseInt(number, 8),\n            octal: true,\n            lineNumber: lineNumber,\n            lineStart: lineStart,\n            range: [start, index]\n        };\n    }\n\n    function scanNumericLiteral() {\n        var number, start, ch;\n\n        ch = source[index];\n        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),\n            'Numeric literal must start with a decimal digit or a decimal point');\n\n        start = index;\n        number = '';\n        if (ch !== '.') {\n            number = source[index++];\n            ch = source[index];\n\n            // Hex number starts with '0x'.\n            // Octal number starts with '0'.\n            if (number === '0') {\n                if (ch === 'x' || ch === 'X') {\n                    ++index;\n                    return scanHexLiteral(start);\n                }\n                if (isOctalDigit(ch)) {\n                    return scanOctalLiteral(start);\n                }\n\n                // decimal number starts with '0' such as '09' is illegal.\n                if (ch && isDecimalDigit(ch.charCodeAt(0))) {\n                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n                }\n            }\n\n            while (isDecimalDigit(source.charCodeAt(index))) {\n                number += source[index++];\n            }\n            ch = source[index];\n        }\n\n        if (ch === '.') {\n            number += source[index++];\n            while (isDecimalDigit(source.charCodeAt(index))) {\n                number += source[index++];\n            }\n            ch = source[index];\n        }\n\n        if (ch === 'e' || ch === 'E') {\n            number += source[index++];\n\n            ch = source[index];\n            if (ch === '+' || ch === '-') {\n                number += source[index++];\n            }\n            if (isDecimalDigit(source.charCodeAt(index))) {\n                while (isDecimalDigit(source.charCodeAt(index))) {\n                    number += source[index++];\n                }\n            } else {\n                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n            }\n        }\n\n        if (isIdentifierStart(source.charCodeAt(index))) {\n            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n        }\n\n        return {\n            type: Token.NumericLiteral,\n            value: parseFloat(number),\n            lineNumber: lineNumber,\n            lineStart: lineStart,\n            range: [start, index]\n        };\n    }\n\n    // 7.8.4 String Literals\n\n    function scanStringLiteral() {\n        var str = '', quote, start, ch, code, unescaped, restore, octal = false;\n\n        quote = source[index];\n        assert((quote === '\\'' || quote === '\"'),\n            'String literal must starts with a quote');\n\n        start = index;\n        ++index;\n\n        while (index < length) {\n            ch = source[index++];\n\n            if (ch === quote) {\n                quote = '';\n                break;\n            } else if (ch === '\\\\') {\n                ch = source[index++];\n                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {\n                    switch (ch) {\n                    case 'n':\n                        str += '\\n';\n                        break;\n                    case 'r':\n                        str += '\\r';\n                        break;\n                    case 't':\n                        str += '\\t';\n                        break;\n                    case 'u':\n                    case 'x':\n                        restore = index;\n                        unescaped = scanHexEscape(ch);\n                        if (unescaped) {\n                            str += unescaped;\n                        } else {\n                            index = restore;\n                            str += ch;\n                        }\n                        break;\n                    case 'b':\n                        str += '\\b';\n                        break;\n                    case 'f':\n                        str += '\\f';\n                        break;\n                    case 'v':\n                        str += '\\x0B';\n                        break;\n\n                    default:\n                        if (isOctalDigit(ch)) {\n                            code = '01234567'.indexOf(ch);\n\n                            // \\0 is not octal escape sequence\n                            if (code !== 0) {\n                                octal = true;\n                            }\n\n                            if (index < length && isOctalDigit(source[index])) {\n                                octal = true;\n                                code = code * 8 + '01234567'.indexOf(source[index++]);\n\n                                // 3 digits are only allowed when string starts\n                                // with 0, 1, 2, 3\n                                if ('0123'.indexOf(ch) >= 0 &&\n                                        index < length &&\n                                        isOctalDigit(source[index])) {\n                                    code = code * 8 + '01234567'.indexOf(source[index++]);\n                                }\n                            }\n                            str += String.fromCharCode(code);\n                        } else {\n                            str += ch;\n                        }\n                        break;\n                    }\n                } else {\n                    ++lineNumber;\n                    if (ch ===  '\\r' && source[index] === '\\n') {\n                        ++index;\n                    }\n                    lineStart = index;\n                }\n            } else if (isLineTerminator(ch.charCodeAt(0))) {\n                break;\n            } else {\n                str += ch;\n            }\n        }\n\n        if (quote !== '') {\n            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');\n        }\n\n        return {\n            type: Token.StringLiteral,\n            value: str,\n            octal: octal,\n            lineNumber: lineNumber,\n            lineStart: lineStart,\n            range: [start, index]\n        };\n    }\n\n    function scanRegExp() {\n        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;\n\n        lookahead = null;\n        skipComment();\n\n        start = index;\n        ch = source[index];\n        assert(ch === '/', 'Regular expression literal must start with a slash');\n        str = source[index++];\n\n        while (index < length) {\n            ch = source[index++];\n            str += ch;\n            if (ch === '\\\\') {\n                ch = source[index++];\n                // ECMA-262 7.8.5\n                if (isLineTerminator(ch.charCodeAt(0))) {\n                    throwError({}, Messages.UnterminatedRegExp);\n                }\n                str += ch;\n            } else if (isLineTerminator(ch.charCodeAt(0))) {\n                throwError({}, Messages.UnterminatedRegExp);\n            } else if (classMarker) {\n                if (ch === ']') {\n                    classMarker = false;\n                }\n            } else {\n                if (ch === '/') {\n                    terminated = true;\n                    break;\n                } else if (ch === '[') {\n                    classMarker = true;\n                }\n            }\n        }\n\n        if (!terminated) {\n            throwError({}, Messages.UnterminatedRegExp);\n        }\n\n        // Exclude leading and trailing slash.\n        pattern = str.substr(1, str.length - 2);\n\n        flags = '';\n        while (index < length) {\n            ch = source[index];\n            if (!isIdentifierPart(ch.charCodeAt(0))) {\n                break;\n            }\n\n            ++index;\n            if (ch === '\\\\' && index < length) {\n                ch = source[index];\n                if (ch === 'u') {\n                    ++index;\n                    restore = index;\n                    ch = scanHexEscape('u');\n                    if (ch) {\n                        flags += ch;\n                        for (str += '\\\\u'; restore < index; ++restore) {\n                            str += source[restore];\n                        }\n                    } else {\n                        index = restore;\n                        flags += 'u';\n                        str += '\\\\u';\n                    }\n                } else {\n                    str += '\\\\';\n                }\n            } else {\n                flags += ch;\n                str += ch;\n            }\n        }\n\n        try {\n            value = new RegExp(pattern, flags);\n        } catch (e) {\n            throwError({}, Messages.InvalidRegExp);\n        }\n\n\n\n        if (extra.tokenize) {\n            return {\n                type: Token.RegularExpression,\n                value: value,\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [start, index]\n            };\n        }\n        return {\n            literal: str,\n            value: value,\n            range: [start, index]\n        };\n    }\n\n    function collectRegex() {\n        var pos, loc, regex, token;\n\n        skipComment();\n\n        pos = index;\n        loc = {\n            start: {\n                line: lineNumber,\n                column: index - lineStart\n            }\n        };\n\n        regex = scanRegExp();\n        loc.end = {\n            line: lineNumber,\n            column: index - lineStart\n        };\n\n        if (!extra.tokenize) {\n            // Pop the previous token, which is likely '/' or '/='\n            if (extra.tokens.length > 0) {\n                token = extra.tokens[extra.tokens.length - 1];\n                if (token.range[0] === pos && token.type === 'Punctuator') {\n                    if (token.value === '/' || token.value === '/=') {\n                        extra.tokens.pop();\n                    }\n                }\n            }\n\n            extra.tokens.push({\n                type: 'RegularExpression',\n                value: regex.literal,\n                range: [pos, index],\n                loc: loc\n            });\n        }\n\n        return regex;\n    }\n\n    function isIdentifierName(token) {\n        return token.type === Token.Identifier ||\n            token.type === Token.Keyword ||\n            token.type === Token.BooleanLiteral ||\n            token.type === Token.NullLiteral;\n    }\n\n    function advanceSlash() {\n        var prevToken,\n            checkToken;\n        // Using the following algorithm:\n        // https://github.com/mozilla/sweet.js/wiki/design\n        prevToken = extra.tokens[extra.tokens.length - 1];\n        if (!prevToken) {\n            // Nothing before that: it cannot be a division.\n            return collectRegex();\n        }\n        if (prevToken.type === 'Punctuator') {\n            if (prevToken.value === ']') {\n                return scanPunctuator();\n            }\n            if (prevToken.value === ')') {\n                checkToken = extra.tokens[extra.openParenToken - 1];\n                if (checkToken &&\n                        checkToken.type === 'Keyword' &&\n                        (checkToken.value === 'if' ||\n                         checkToken.value === 'while' ||\n                         checkToken.value === 'for' ||\n                         checkToken.value === 'with')) {\n                    return collectRegex();\n                }\n                return scanPunctuator();\n            }\n            if (prevToken.value === '}') {\n                // Dividing a function by anything makes little sense,\n                // but we have to check for that.\n                if (extra.tokens[extra.openCurlyToken - 3] &&\n                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {\n                    // Anonymous function.\n                    checkToken = extra.tokens[extra.openCurlyToken - 4];\n                    if (!checkToken) {\n                        return scanPunctuator();\n                    }\n                } else if (extra.tokens[extra.openCurlyToken - 4] &&\n                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {\n                    // Named function.\n                    checkToken = extra.tokens[extra.openCurlyToken - 5];\n                    if (!checkToken) {\n                        return collectRegex();\n                    }\n                } else {\n                    return scanPunctuator();\n                }\n                // checkToken determines whether the function is\n                // a declaration or an expression.\n                if (FnExprTokens.indexOf(checkToken.value) >= 0) {\n                    // It is an expression.\n                    return scanPunctuator();\n                }\n                // It is a declaration.\n                return collectRegex();\n            }\n            return collectRegex();\n        }\n        if (prevToken.type === 'Keyword') {\n            return collectRegex();\n        }\n        return scanPunctuator();\n    }\n\n    function advance() {\n        var ch;\n\n        skipComment();\n\n        if (index >= length) {\n            return {\n                type: Token.EOF,\n                lineNumber: lineNumber,\n                lineStart: lineStart,\n                range: [index, index]\n            };\n        }\n\n        ch = source.charCodeAt(index);\n\n        // Very common: ( and ) and ;\n        if (ch === 0x28 || ch === 0x29 || ch === 0x3A) {\n            return scanPunctuator();\n        }\n\n        // String literal starts with single quote (U+0027) or double quote (U+0022).\n        if (ch === 0x27 || ch === 0x22) {\n            return scanStringLiteral();\n        }\n\n        if (isIdentifierStart(ch)) {\n            return scanIdentifier();\n        }\n\n        // Dot (.) U+002E can also start a floating-point number, hence the need\n        // to check the next character.\n        if (ch === 0x2E) {\n            if (isDecimalDigit(source.charCodeAt(index + 1))) {\n                return scanNumericLiteral();\n            }\n            return scanPunctuator();\n        }\n\n        if (isDecimalDigit(ch)) {\n            return scanNumericLiteral();\n        }\n\n        // Slash (/) U+002F can also start a regex.\n        if (extra.tokenize && ch === 0x2F) {\n            return advanceSlash();\n        }\n\n        return scanPunctuator();\n    }\n\n    function collectToken() {\n        var start, loc, token, range, value;\n\n        skipComment();\n        start = index;\n        loc = {\n            start: {\n                line: lineNumber,\n                column: index - lineStart\n            }\n        };\n\n        token = advance();\n        loc.end = {\n            line: lineNumber,\n            column: index - lineStart\n        };\n\n        if (token.type !== Token.EOF) {\n            range = [token.range[0], token.range[1]];\n            value = source.slice(token.range[0], token.range[1]);\n            extra.tokens.push({\n                type: TokenName[token.type],\n                value: value,\n                range: range,\n                loc: loc\n            });\n        }\n\n        return token;\n    }\n\n    function lex() {\n        var token;\n\n        token = lookahead;\n        index = token.range[1];\n        lineNumber = token.lineNumber;\n        lineStart = token.lineStart;\n\n        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();\n\n        index = token.range[1];\n        lineNumber = token.lineNumber;\n        lineStart = token.lineStart;\n\n        return token;\n    }\n\n    function peek() {\n        var pos, line, start;\n\n        pos = index;\n        line = lineNumber;\n        start = lineStart;\n        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();\n        index = pos;\n        lineNumber = line;\n        lineStart = start;\n    }\n\n    SyntaxTreeDelegate = {\n\n        name: 'SyntaxTree',\n\n        markStart: function () {\n            skipComment();\n            if (extra.loc) {\n                state.markerStack.push(index - lineStart);\n                state.markerStack.push(lineNumber);\n            }\n            if (extra.range) {\n                state.markerStack.push(index);\n            }\n        },\n\n        processComment: function (node) {\n            var i, attacher, pos, len, candidate;\n\n            if (typeof node.type === 'undefined' || node.type === Syntax.Program) {\n                return;\n            }\n\n            // Check for possible additional trailing comments.\n            peek();\n\n            for (i = 0; i < extra.pendingComments.length; ++i) {\n                attacher = extra.pendingComments[i];\n                if (node.range[0] >= attacher.comment.range[1]) {\n                    candidate = attacher.leading;\n                    if (candidate) {\n                        pos = candidate.range[0];\n                        len = candidate.range[1] - pos;\n                        if (node.range[0] <= pos && (node.range[1] - node.range[0] >= len)) {\n                            attacher.leading = node;\n                        }\n                    } else {\n                        attacher.leading = node;\n                    }\n                }\n                if (node.range[1] <= attacher.comment.range[0]) {\n                    candidate = attacher.trailing;\n                    if (candidate) {\n                        pos = candidate.range[0];\n                        len = candidate.range[1] - pos;\n                        if (node.range[0] <= pos && (node.range[1] - node.range[0] >= len)) {\n                            attacher.trailing = node;\n                        }\n                    } else {\n                        attacher.trailing = node;\n                    }\n                }\n            }\n        },\n\n        markEnd: function (node) {\n            if (extra.range) {\n                node.range = [state.markerStack.pop(), index];\n            }\n            if (extra.loc) {\n                node.loc = {\n                    start: {\n                        line: state.markerStack.pop(),\n                        column: state.markerStack.pop()\n                    },\n                    end: {\n                        line: lineNumber,\n                        column: index - lineStart\n                    }\n                };\n                this.postProcess(node);\n            }\n            if (extra.attachComment) {\n                this.processComment(node);\n            }\n            return node;\n        },\n\n        markEndIf: function (node) {\n            if (node.range || node.loc) {\n                if (extra.loc) {\n                    state.markerStack.pop();\n                    state.markerStack.pop();\n                }\n                if (extra.range) {\n                    state.markerStack.pop();\n                }\n            } else {\n                this.markEnd(node);\n            }\n            return node;\n        },\n\n        postProcess: function (node) {\n            if (extra.source) {\n                node.loc.source = extra.source;\n            }\n            return node;\n        },\n\n        createArrayExpression: function (elements) {\n            return {\n                type: Syntax.ArrayExpression,\n                elements: elements\n            };\n        },\n\n        createAssignmentExpression: function (operator, left, right) {\n            return {\n                type: Syntax.AssignmentExpression,\n                operator: operator,\n                left: left,\n                right: right\n            };\n        },\n\n        createBinaryExpression: function (operator, left, right) {\n            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :\n                        Syntax.BinaryExpression;\n            return {\n                type: type,\n                operator: operator,\n                left: left,\n                right: right\n            };\n        },\n\n        createBlockStatement: function (body) {\n            return {\n                type: Syntax.BlockStatement,\n                body: body\n            };\n        },\n\n        createBreakStatement: function (label) {\n            return {\n                type: Syntax.BreakStatement,\n                label: label\n            };\n        },\n\n        createCallExpression: function (callee, args) {\n            return {\n                type: Syntax.CallExpression,\n                callee: callee,\n                'arguments': args\n            };\n        },\n\n        createCatchClause: function (param, body) {\n            return {\n                type: Syntax.CatchClause,\n                param: param,\n                body: body\n            };\n        },\n\n        createConditionalExpression: function (test, consequent, alternate) {\n            return {\n                type: Syntax.ConditionalExpression,\n                test: test,\n                consequent: consequent,\n                alternate: alternate\n            };\n        },\n\n        createContinueStatement: function (label) {\n            return {\n                type: Syntax.ContinueStatement,\n                label: label\n            };\n        },\n\n        createDebuggerStatement: function () {\n            return {\n                type: Syntax.DebuggerStatement\n            };\n        },\n\n        createDoWhileStatement: function (body, test) {\n            return {\n                type: Syntax.DoWhileStatement,\n                body: body,\n                test: test\n            };\n        },\n\n        createEmptyStatement: function () {\n            return {\n                type: Syntax.EmptyStatement\n            };\n        },\n\n        createExpressionStatement: function (expression) {\n            return {\n                type: Syntax.ExpressionStatement,\n                expression: expression\n            };\n        },\n\n        createForStatement: function (init, test, update, body) {\n            return {\n                type: Syntax.ForStatement,\n                init: init,\n                test: test,\n                update: update,\n                body: body\n            };\n        },\n\n        createForInStatement: function (left, right, body) {\n            return {\n                type: Syntax.ForInStatement,\n                left: left,\n                right: right,\n                body: body,\n                each: false\n            };\n        },\n\n        createFunctionDeclaration: function (id, params, defaults, body) {\n            return {\n                type: Syntax.FunctionDeclaration,\n                id: id,\n                params: params,\n                defaults: defaults,\n                body: body,\n                rest: null,\n                generator: false,\n                expression: false\n            };\n        },\n\n        createFunctionExpression: function (id, params, defaults, body) {\n            return {\n                type: Syntax.FunctionExpression,\n                id: id,\n                params: params,\n                defaults: defaults,\n                body: body,\n                rest: null,\n                generator: false,\n                expression: false\n            };\n        },\n\n        createIdentifier: function (name) {\n            return {\n                type: Syntax.Identifier,\n                name: name\n            };\n        },\n\n        createIfStatement: function (test, consequent, alternate) {\n            return {\n                type: Syntax.IfStatement,\n                test: test,\n                consequent: consequent,\n                alternate: alternate\n            };\n        },\n\n        createLabeledStatement: function (label, body) {\n            return {\n                type: Syntax.LabeledStatement,\n                label: label,\n                body: body\n            };\n        },\n\n        createLiteral: function (token) {\n            return {\n                type: Syntax.Literal,\n                value: token.value,\n                raw: source.slice(token.range[0], token.range[1])\n            };\n        },\n\n        createMemberExpression: function (accessor, object, property) {\n            return {\n                type: Syntax.MemberExpression,\n                computed: accessor === '[',\n                object: object,\n                property: property\n            };\n        },\n\n        createNewExpression: function (callee, args) {\n            return {\n                type: Syntax.NewExpression,\n                callee: callee,\n                'arguments': args\n            };\n        },\n\n        createObjectExpression: function (properties) {\n            return {\n                type: Syntax.ObjectExpression,\n                properties: properties\n            };\n        },\n\n        createPostfixExpression: function (operator, argument) {\n            return {\n                type: Syntax.UpdateExpression,\n                operator: operator,\n                argument: argument,\n                prefix: false\n            };\n        },\n\n        createProgram: function (body) {\n            return {\n                type: Syntax.Program,\n                body: body\n            };\n        },\n\n        createProperty: function (kind, key, value) {\n            return {\n                type: Syntax.Property,\n                key: key,\n                value: value,\n                kind: kind\n            };\n        },\n\n        createReturnStatement: function (argument) {\n            return {\n                type: Syntax.ReturnStatement,\n                argument: argument\n            };\n        },\n\n        createSequenceExpression: function (expressions) {\n            return {\n                type: Syntax.SequenceExpression,\n                expressions: expressions\n            };\n        },\n\n        createSwitchCase: function (test, consequent) {\n            return {\n                type: Syntax.SwitchCase,\n                test: test,\n                consequent: consequent\n            };\n        },\n\n        createSwitchStatement: function (discriminant, cases) {\n            return {\n                type: Syntax.SwitchStatement,\n                discriminant: discriminant,\n                cases: cases\n            };\n        },\n\n        createThisExpression: function () {\n            return {\n                type: Syntax.ThisExpression\n            };\n        },\n\n        createThrowStatement: function (argument) {\n            return {\n                type: Syntax.ThrowStatement,\n                argument: argument\n            };\n        },\n\n        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {\n            return {\n                type: Syntax.TryStatement,\n                block: block,\n                guardedHandlers: guardedHandlers,\n                handlers: handlers,\n                finalizer: finalizer\n            };\n        },\n\n        createUnaryExpression: function (operator, argument) {\n            if (operator === '++' || operator === '--') {\n                return {\n                    type: Syntax.UpdateExpression,\n                    operator: operator,\n                    argument: argument,\n                    prefix: true\n                };\n            }\n            return {\n                type: Syntax.UnaryExpression,\n                operator: operator,\n                argument: argument,\n                prefix: true\n            };\n        },\n\n        createVariableDeclaration: function (declarations, kind) {\n            return {\n                type: Syntax.VariableDeclaration,\n                declarations: declarations,\n                kind: kind\n            };\n        },\n\n        createVariableDeclarator: function (id, init) {\n            return {\n                type: Syntax.VariableDeclarator,\n                id: id,\n                init: init\n            };\n        },\n\n        createWhileStatement: function (test, body) {\n            return {\n                type: Syntax.WhileStatement,\n                test: test,\n                body: body\n            };\n        },\n\n        createWithStatement: function (object, body) {\n            return {\n                type: Syntax.WithStatement,\n                object: object,\n                body: body\n            };\n        }\n    };\n\n    // Return true if there is a line terminator before the next token.\n\n    function peekLineTerminator() {\n        var pos, line, start, found;\n\n        pos = index;\n        line = lineNumber;\n        start = lineStart;\n        skipComment();\n        found = lineNumber !== line;\n        index = pos;\n        lineNumber = line;\n        lineStart = start;\n\n        return found;\n    }\n\n    // Throw an exception\n\n    function throwError(token, messageFormat) {\n        var error,\n            args = Array.prototype.slice.call(arguments, 2),\n            msg = messageFormat.replace(\n                /%(\\d)/g,\n                function (whole, index) {\n                    assert(index < args.length, 'Message reference must be in range');\n                    return args[index];\n                }\n            );\n\n        if (typeof token.lineNumber === 'number') {\n            error = new Error('Line ' + token.lineNumber + ': ' + msg);\n            error.index = token.range[0];\n            error.lineNumber = token.lineNumber;\n            error.column = token.range[0] - lineStart + 1;\n        } else {\n            error = new Error('Line ' + lineNumber + ': ' + msg);\n            error.index = index;\n            error.lineNumber = lineNumber;\n            error.column = index - lineStart + 1;\n        }\n\n        error.description = msg;\n        throw error;\n    }\n\n    function throwErrorTolerant() {\n        try {\n            throwError.apply(null, arguments);\n        } catch (e) {\n            if (extra.errors) {\n                extra.errors.push(e);\n            } else {\n                throw e;\n            }\n        }\n    }\n\n\n    // Throw an exception because of the token.\n\n    function throwUnexpected(token) {\n        if (token.type === Token.EOF) {\n            throwError(token, Messages.UnexpectedEOS);\n        }\n\n        if (token.type === Token.NumericLiteral) {\n            throwError(token, Messages.UnexpectedNumber);\n        }\n\n        if (token.type === Token.StringLiteral) {\n            throwError(token, Messages.UnexpectedString);\n        }\n\n        if (token.type === Token.Identifier) {\n            throwError(token, Messages.UnexpectedIdentifier);\n        }\n\n        if (token.type === Token.Keyword) {\n            if (isFutureReservedWord(token.value)) {\n                throwError(token, Messages.UnexpectedReserved);\n            } else if (strict && isStrictModeReservedWord(token.value)) {\n                throwErrorTolerant(token, Messages.StrictReservedWord);\n                return;\n            }\n            throwError(token, Messages.UnexpectedToken, token.value);\n        }\n\n        // BooleanLiteral, NullLiteral, or Punctuator.\n        throwError(token, Messages.UnexpectedToken, token.value);\n    }\n\n    // Expect the next token to match the specified punctuator.\n    // If not, an exception will be thrown.\n\n    function expect(value) {\n        var token = lex();\n        if (token.type !== Token.Punctuator || token.value !== value) {\n            throwUnexpected(token);\n        }\n    }\n\n    // Expect the next token to match the specified keyword.\n    // If not, an exception will be thrown.\n\n    function expectKeyword(keyword) {\n        var token = lex();\n        if (token.type !== Token.Keyword || token.value !== keyword) {\n            throwUnexpected(token);\n        }\n    }\n\n    // Return true if the next token matches the specified punctuator.\n\n    function match(value) {\n        return lookahead.type === Token.Punctuator && lookahead.value === value;\n    }\n\n    // Return true if the next token matches the specified keyword\n\n    function matchKeyword(keyword) {\n        return lookahead.type === Token.Keyword && lookahead.value === keyword;\n    }\n\n    // Return true if the next token is an assignment operator\n\n    function matchAssign() {\n        var op;\n\n        if (lookahead.type !== Token.Punctuator) {\n            return false;\n        }\n        op = lookahead.value;\n        return op === '=' ||\n            op === '*=' ||\n            op === '/=' ||\n            op === '%=' ||\n            op === '+=' ||\n            op === '-=' ||\n            op === '<<=' ||\n            op === '>>=' ||\n            op === '>>>=' ||\n            op === '&=' ||\n            op === '^=' ||\n            op === '|=';\n    }\n\n    function consumeSemicolon() {\n        var line;\n\n        // Catch the very common case first: immediately a semicolon (U+003B).\n        if (source.charCodeAt(index) === 0x3B) {\n            lex();\n            return;\n        }\n\n        line = lineNumber;\n        skipComment();\n        if (lineNumber !== line) {\n            return;\n        }\n\n        if (match(';')) {\n            lex();\n            return;\n        }\n\n        if (lookahead.type !== Token.EOF && !match('}')) {\n            throwUnexpected(lookahead);\n        }\n    }\n\n    // Return true if provided expression is LeftHandSideExpression\n\n    function isLeftHandSide(expr) {\n        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;\n    }\n\n    // 11.1.4 Array Initialiser\n\n    function parseArrayInitialiser() {\n        var elements = [];\n\n        expect('[');\n\n        while (!match(']')) {\n            if (match(',')) {\n                lex();\n                elements.push(null);\n            } else {\n                elements.push(parseAssignmentExpression());\n\n                if (!match(']')) {\n                    expect(',');\n                }\n            }\n        }\n\n        expect(']');\n\n        return delegate.createArrayExpression(elements);\n    }\n\n    // 11.1.5 Object Initialiser\n\n    function parsePropertyFunction(param, first) {\n        var previousStrict, body;\n\n        previousStrict = strict;\n        delegate.markStart();\n        body = parseFunctionSourceElements();\n        if (first && strict && isRestrictedWord(param[0].name)) {\n            throwErrorTolerant(first, Messages.StrictParamName);\n        }\n        strict = previousStrict;\n        return delegate.markEnd(delegate.createFunctionExpression(null, param, [], body));\n    }\n\n    function parseObjectPropertyKey() {\n        var token;\n\n        delegate.markStart();\n        token = lex();\n\n        // Note: This function is called only from parseObjectProperty(), where\n        // EOF and Punctuator tokens are already filtered out.\n\n        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {\n            if (strict && token.octal) {\n                throwErrorTolerant(token, Messages.StrictOctalLiteral);\n            }\n            return delegate.markEnd(delegate.createLiteral(token));\n        }\n\n        return delegate.markEnd(delegate.createIdentifier(token.value));\n    }\n\n    function parseObjectProperty() {\n        var token, key, id, value, param;\n\n        token = lookahead;\n        delegate.markStart();\n\n        if (token.type === Token.Identifier) {\n\n            id = parseObjectPropertyKey();\n\n            // Property Assignment: Getter and Setter.\n\n            if (token.value === 'get' && !match(':')) {\n                key = parseObjectPropertyKey();\n                expect('(');\n                expect(')');\n                value = parsePropertyFunction([]);\n                return delegate.markEnd(delegate.createProperty('get', key, value));\n            }\n            if (token.value === 'set' && !match(':')) {\n                key = parseObjectPropertyKey();\n                expect('(');\n                token = lookahead;\n                if (token.type !== Token.Identifier) {\n                    expect(')');\n                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);\n                    value = parsePropertyFunction([]);\n                } else {\n                    param = [ parseVariableIdentifier() ];\n                    expect(')');\n                    value = parsePropertyFunction(param, token);\n                }\n                return delegate.markEnd(delegate.createProperty('set', key, value));\n            }\n            expect(':');\n            value = parseAssignmentExpression();\n            return delegate.markEnd(delegate.createProperty('init', id, value));\n        }\n        if (token.type === Token.EOF || token.type === Token.Punctuator) {\n            throwUnexpected(token);\n        } else {\n            key = parseObjectPropertyKey();\n            expect(':');\n            value = parseAssignmentExpression();\n            return delegate.markEnd(delegate.createProperty('init', key, value));\n        }\n    }\n\n    function parseObjectInitialiser() {\n        var properties = [], property, name, key, kind, map = {}, toString = String;\n\n        expect('{');\n\n        while (!match('}')) {\n            property = parseObjectProperty();\n\n            if (property.key.type === Syntax.Identifier) {\n                name = property.key.name;\n            } else {\n                name = toString(property.key.value);\n            }\n            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;\n\n            key = '$' + name;\n            if (Object.prototype.hasOwnProperty.call(map, key)) {\n                if (map[key] === PropertyKind.Data) {\n                    if (strict && kind === PropertyKind.Data) {\n                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);\n                    } else if (kind !== PropertyKind.Data) {\n                        throwErrorTolerant({}, Messages.AccessorDataProperty);\n                    }\n                } else {\n                    if (kind === PropertyKind.Data) {\n                        throwErrorTolerant({}, Messages.AccessorDataProperty);\n                    } else if (map[key] & kind) {\n                        throwErrorTolerant({}, Messages.AccessorGetSet);\n                    }\n                }\n                map[key] |= kind;\n            } else {\n                map[key] = kind;\n            }\n\n            properties.push(property);\n\n            if (!match('}')) {\n                expect(',');\n            }\n        }\n\n        expect('}');\n\n        return delegate.createObjectExpression(properties);\n    }\n\n    // 11.1.6 The Grouping Operator\n\n    function parseGroupExpression() {\n        var expr;\n\n        expect('(');\n\n        expr = parseExpression();\n\n        expect(')');\n\n        return expr;\n    }\n\n\n    // 11.1 Primary Expressions\n\n    function parsePrimaryExpression() {\n        var type, token, expr;\n\n        if (match('(')) {\n            return parseGroupExpression();\n        }\n\n        type = lookahead.type;\n        delegate.markStart();\n\n        if (type === Token.Identifier) {\n            expr =  delegate.createIdentifier(lex().value);\n        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {\n            if (strict && lookahead.octal) {\n                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);\n            }\n            expr = delegate.createLiteral(lex());\n        } else if (type === Token.Keyword) {\n            if (matchKeyword('this')) {\n                lex();\n                expr = delegate.createThisExpression();\n            } else if (matchKeyword('function')) {\n                expr = parseFunctionExpression();\n            }\n        } else if (type === Token.BooleanLiteral) {\n            token = lex();\n            token.value = (token.value === 'true');\n            expr = delegate.createLiteral(token);\n        } else if (type === Token.NullLiteral) {\n            token = lex();\n            token.value = null;\n            expr = delegate.createLiteral(token);\n        } else if (match('[')) {\n            expr = parseArrayInitialiser();\n        } else if (match('{')) {\n            expr = parseObjectInitialiser();\n        } else if (match('/') || match('/=')) {\n            if (typeof extra.tokens !== 'undefined') {\n                expr = delegate.createLiteral(collectRegex());\n            } else {\n                expr = delegate.createLiteral(scanRegExp());\n            }\n            peek();\n        }\n\n        if (expr) {\n            return delegate.markEnd(expr);\n        }\n\n        throwUnexpected(lex());\n    }\n\n    // 11.2 Left-Hand-Side Expressions\n\n    function parseArguments() {\n        var args = [];\n\n        expect('(');\n\n        if (!match(')')) {\n            while (index < length) {\n                args.push(parseAssignmentExpression());\n                if (match(')')) {\n                    break;\n                }\n                expect(',');\n            }\n        }\n\n        expect(')');\n\n        return args;\n    }\n\n    function parseNonComputedProperty() {\n        var token;\n\n        delegate.markStart();\n        token = lex();\n\n        if (!isIdentifierName(token)) {\n            throwUnexpected(token);\n        }\n\n        return delegate.markEnd(delegate.createIdentifier(token.value));\n    }\n\n    function parseNonComputedMember() {\n        expect('.');\n\n        return parseNonComputedProperty();\n    }\n\n    function parseComputedMember() {\n        var expr;\n\n        expect('[');\n\n        expr = parseExpression();\n\n        expect(']');\n\n        return expr;\n    }\n\n    function parseNewExpression() {\n        var callee, args;\n\n        delegate.markStart();\n        expectKeyword('new');\n        callee = parseLeftHandSideExpression();\n        args = match('(') ? parseArguments() : [];\n\n        return delegate.markEnd(delegate.createNewExpression(callee, args));\n    }\n\n    function parseLeftHandSideExpressionAllowCall() {\n        var marker, previousAllowIn, expr, args, property;\n\n        marker = createLocationMarker();\n\n        previousAllowIn = state.allowIn;\n        state.allowIn = true;\n        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();\n        state.allowIn = previousAllowIn;\n\n        while (match('.') || match('[') || match('(')) {\n            if (match('(')) {\n                args = parseArguments();\n                expr = delegate.createCallExpression(expr, args);\n            } else if (match('[')) {\n                property = parseComputedMember();\n                expr = delegate.createMemberExpression('[', expr, property);\n            } else {\n                property = parseNonComputedMember();\n                expr = delegate.createMemberExpression('.', expr, property);\n            }\n            if (marker) {\n                marker.apply(expr);\n            }\n        }\n\n        return expr;\n    }\n\n    function parseLeftHandSideExpression() {\n        var marker, previousAllowIn, expr, property;\n\n        marker = createLocationMarker();\n\n        previousAllowIn = state.allowIn;\n        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();\n        state.allowIn = previousAllowIn;\n\n        while (match('.') || match('[')) {\n            if (match('[')) {\n                property = parseComputedMember();\n                expr = delegate.createMemberExpression('[', expr, property);\n            } else {\n                property = parseNonComputedMember();\n                expr = delegate.createMemberExpression('.', expr, property);\n            }\n            if (marker) {\n                marker.apply(expr);\n            }\n        }\n\n        return expr;\n    }\n\n    // 11.3 Postfix Expressions\n\n    function parsePostfixExpression() {\n        var expr, token;\n\n        delegate.markStart();\n        expr = parseLeftHandSideExpressionAllowCall();\n\n        if (lookahead.type === Token.Punctuator) {\n            if ((match('++') || match('--')) && !peekLineTerminator()) {\n                // 11.3.1, 11.3.2\n                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {\n                    throwErrorTolerant({}, Messages.StrictLHSPostfix);\n                }\n\n                if (!isLeftHandSide(expr)) {\n                    throwErrorTolerant({}, Messages.InvalidLHSInAssignment);\n                }\n\n                token = lex();\n                expr = delegate.createPostfixExpression(token.value, expr);\n            }\n        }\n\n        return delegate.markEndIf(expr);\n    }\n\n    // 11.4 Unary Operators\n\n    function parseUnaryExpression() {\n        var token, expr;\n\n        delegate.markStart();\n\n        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {\n            expr = parsePostfixExpression();\n        } else if (match('++') || match('--')) {\n            token = lex();\n            expr = parseUnaryExpression();\n            // 11.4.4, 11.4.5\n            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {\n                throwErrorTolerant({}, Messages.StrictLHSPrefix);\n            }\n\n            if (!isLeftHandSide(expr)) {\n                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);\n            }\n\n            expr = delegate.createUnaryExpression(token.value, expr);\n        } else if (match('+') || match('-') || match('~') || match('!')) {\n            token = lex();\n            expr = parseUnaryExpression();\n            expr = delegate.createUnaryExpression(token.value, expr);\n        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {\n            token = lex();\n            expr = parseUnaryExpression();\n            expr = delegate.createUnaryExpression(token.value, expr);\n            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {\n                throwErrorTolerant({}, Messages.StrictDelete);\n            }\n        } else {\n            expr = parsePostfixExpression();\n        }\n\n        return delegate.markEndIf(expr);\n    }\n\n    function binaryPrecedence(token, allowIn) {\n        var prec = 0;\n\n        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {\n            return 0;\n        }\n\n        switch (token.value) {\n        case '||':\n            prec = 1;\n            break;\n\n        case '&&':\n            prec = 2;\n            break;\n\n        case '|':\n            prec = 3;\n            break;\n\n        case '^':\n            prec = 4;\n            break;\n\n        case '&':\n            prec = 5;\n            break;\n\n        case '==':\n        case '!=':\n        case '===':\n        case '!==':\n            prec = 6;\n            break;\n\n        case '<':\n        case '>':\n        case '<=':\n        case '>=':\n        case 'instanceof':\n            prec = 7;\n            break;\n\n        case 'in':\n            prec = allowIn ? 7 : 0;\n            break;\n\n        case '<<':\n        case '>>':\n        case '>>>':\n            prec = 8;\n            break;\n\n        case '+':\n        case '-':\n            prec = 9;\n            break;\n\n        case '*':\n        case '/':\n        case '%':\n            prec = 11;\n            break;\n\n        default:\n            break;\n        }\n\n        return prec;\n    }\n\n    // 11.5 Multiplicative Operators\n    // 11.6 Additive Operators\n    // 11.7 Bitwise Shift Operators\n    // 11.8 Relational Operators\n    // 11.9 Equality Operators\n    // 11.10 Binary Bitwise Operators\n    // 11.11 Binary Logical Operators\n\n    function parseBinaryExpression() {\n        var marker, markers, expr, token, prec, stack, right, operator, left, i;\n\n        marker = createLocationMarker();\n        left = parseUnaryExpression();\n\n        token = lookahead;\n        prec = binaryPrecedence(token, state.allowIn);\n        if (prec === 0) {\n            return left;\n        }\n        token.prec = prec;\n        lex();\n\n        markers = [marker, createLocationMarker()];\n        right = parseUnaryExpression();\n\n        stack = [left, token, right];\n\n        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {\n\n            // Reduce: make a binary expression from the three topmost entries.\n            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {\n                right = stack.pop();\n                operator = stack.pop().value;\n                left = stack.pop();\n                expr = delegate.createBinaryExpression(operator, left, right);\n                markers.pop();\n                marker = markers.pop();\n                if (marker) {\n                    marker.apply(expr);\n                }\n                stack.push(expr);\n                markers.push(marker);\n            }\n\n            // Shift.\n            token = lex();\n            token.prec = prec;\n            stack.push(token);\n            markers.push(createLocationMarker());\n            expr = parseUnaryExpression();\n            stack.push(expr);\n        }\n\n        // Final reduce to clean-up the stack.\n        i = stack.length - 1;\n        expr = stack[i];\n        markers.pop();\n        while (i > 1) {\n            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);\n            i -= 2;\n            marker = markers.pop();\n            if (marker) {\n                marker.apply(expr);\n            }\n        }\n\n        return expr;\n    }\n\n\n    // 11.12 Conditional Operator\n\n    function parseConditionalExpression() {\n        var expr, previousAllowIn, consequent, alternate;\n\n        delegate.markStart();\n        expr = parseBinaryExpression();\n\n        if (match('?')) {\n            lex();\n            previousAllowIn = state.allowIn;\n            state.allowIn = true;\n            consequent = parseAssignmentExpression();\n            state.allowIn = previousAllowIn;\n            expect(':');\n            alternate = parseAssignmentExpression();\n\n            expr = delegate.markEnd(delegate.createConditionalExpression(expr, consequent, alternate));\n        } else {\n            delegate.markEnd({});\n        }\n\n        return expr;\n    }\n\n    // 11.13 Assignment Operators\n\n    function parseAssignmentExpression() {\n        var token, left, right, node;\n\n        token = lookahead;\n        delegate.markStart();\n        node = left = parseConditionalExpression();\n\n        if (matchAssign()) {\n            // LeftHandSideExpression\n            if (!isLeftHandSide(left)) {\n                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);\n            }\n\n            // 11.13.1\n            if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {\n                throwErrorTolerant(token, Messages.StrictLHSAssignment);\n            }\n\n            token = lex();\n            right = parseAssignmentExpression();\n            node = delegate.createAssignmentExpression(token.value, left, right);\n        }\n\n        return delegate.markEndIf(node);\n    }\n\n    // 11.14 Comma Operator\n\n    function parseExpression() {\n        var expr;\n\n        delegate.markStart();\n        expr = parseAssignmentExpression();\n\n        if (match(',')) {\n            expr = delegate.createSequenceExpression([ expr ]);\n\n            while (index < length) {\n                if (!match(',')) {\n                    break;\n                }\n                lex();\n                expr.expressions.push(parseAssignmentExpression());\n            }\n        }\n\n        return delegate.markEndIf(expr);\n    }\n\n    // 12.1 Block\n\n    function parseStatementList() {\n        var list = [],\n            statement;\n\n        while (index < length) {\n            if (match('}')) {\n                break;\n            }\n            statement = parseSourceElement();\n            if (typeof statement === 'undefined') {\n                break;\n            }\n            list.push(statement);\n        }\n\n        return list;\n    }\n\n    function parseBlock() {\n        var block;\n\n        delegate.markStart();\n        expect('{');\n\n        block = parseStatementList();\n\n        expect('}');\n\n        return delegate.markEnd(delegate.createBlockStatement(block));\n    }\n\n    // 12.2 Variable Statement\n\n    function parseVariableIdentifier() {\n        var token;\n\n        delegate.markStart();\n        token = lex();\n\n        if (token.type !== Token.Identifier) {\n            throwUnexpected(token);\n        }\n\n        return delegate.markEnd(delegate.createIdentifier(token.value));\n    }\n\n    function parseVariableDeclaration(kind) {\n        var init = null, id;\n\n        delegate.markStart();\n        id = parseVariableIdentifier();\n\n        // 12.2.1\n        if (strict && isRestrictedWord(id.name)) {\n            throwErrorTolerant({}, Messages.StrictVarName);\n        }\n\n        if (kind === 'const') {\n            expect('=');\n            init = parseAssignmentExpression();\n        } else if (match('=')) {\n            lex();\n            init = parseAssignmentExpression();\n        }\n\n        return delegate.markEnd(delegate.createVariableDeclarator(id, init));\n    }\n\n    function parseVariableDeclarationList(kind) {\n        var list = [];\n\n        do {\n            list.push(parseVariableDeclaration(kind));\n            if (!match(',')) {\n                break;\n            }\n            lex();\n        } while (index < length);\n\n        return list;\n    }\n\n    function parseVariableStatement() {\n        var declarations;\n\n        expectKeyword('var');\n\n        declarations = parseVariableDeclarationList();\n\n        consumeSemicolon();\n\n        return delegate.createVariableDeclaration(declarations, 'var');\n    }\n\n    // kind may be `const` or `let`\n    // Both are experimental and not in the specification yet.\n    // see http://wiki.ecmascript.org/doku.php?id=harmony:const\n    // and http://wiki.ecmascript.org/doku.php?id=harmony:let\n    function parseConstLetDeclaration(kind) {\n        var declarations;\n\n        delegate.markStart();\n\n        expectKeyword(kind);\n\n        declarations = parseVariableDeclarationList(kind);\n\n        consumeSemicolon();\n\n        return delegate.markEnd(delegate.createVariableDeclaration(declarations, kind));\n    }\n\n    // 12.3 Empty Statement\n\n    function parseEmptyStatement() {\n        expect(';');\n        return delegate.createEmptyStatement();\n    }\n\n    // 12.4 Expression Statement\n\n    function parseExpressionStatement() {\n        var expr = parseExpression();\n        consumeSemicolon();\n        return delegate.createExpressionStatement(expr);\n    }\n\n    // 12.5 If statement\n\n    function parseIfStatement() {\n        var test, consequent, alternate;\n\n        expectKeyword('if');\n\n        expect('(');\n\n        test = parseExpression();\n\n        expect(')');\n\n        consequent = parseStatement();\n\n        if (matchKeyword('else')) {\n            lex();\n            alternate = parseStatement();\n        } else {\n            alternate = null;\n        }\n\n        return delegate.createIfStatement(test, consequent, alternate);\n    }\n\n    // 12.6 Iteration Statements\n\n    function parseDoWhileStatement() {\n        var body, test, oldInIteration;\n\n        expectKeyword('do');\n\n        oldInIteration = state.inIteration;\n        state.inIteration = true;\n\n        body = parseStatement();\n\n        state.inIteration = oldInIteration;\n\n        expectKeyword('while');\n\n        expect('(');\n\n        test = parseExpression();\n\n        expect(')');\n\n        if (match(';')) {\n            lex();\n        }\n\n        return delegate.createDoWhileStatement(body, test);\n    }\n\n    function parseWhileStatement() {\n        var test, body, oldInIteration;\n\n        expectKeyword('while');\n\n        expect('(');\n\n        test = parseExpression();\n\n        expect(')');\n\n        oldInIteration = state.inIteration;\n        state.inIteration = true;\n\n        body = parseStatement();\n\n        state.inIteration = oldInIteration;\n\n        return delegate.createWhileStatement(test, body);\n    }\n\n    function parseForVariableDeclaration() {\n        var token, declarations;\n\n        delegate.markStart();\n        token = lex();\n        declarations = parseVariableDeclarationList();\n\n        return delegate.markEnd(delegate.createVariableDeclaration(declarations, token.value));\n    }\n\n    function parseForStatement() {\n        var init, test, update, left, right, body, oldInIteration;\n\n        init = test = update = null;\n\n        expectKeyword('for');\n\n        expect('(');\n\n        if (match(';')) {\n            lex();\n        } else {\n            if (matchKeyword('var') || matchKeyword('let')) {\n                state.allowIn = false;\n                init = parseForVariableDeclaration();\n                state.allowIn = true;\n\n                if (init.declarations.length === 1 && matchKeyword('in')) {\n                    lex();\n                    left = init;\n                    right = parseExpression();\n                    init = null;\n                }\n            } else {\n                state.allowIn = false;\n                init = parseExpression();\n                state.allowIn = true;\n\n                if (matchKeyword('in')) {\n                    // LeftHandSideExpression\n                    if (!isLeftHandSide(init)) {\n                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);\n                    }\n\n                    lex();\n                    left = init;\n                    right = parseExpression();\n                    init = null;\n                }\n            }\n\n            if (typeof left === 'undefined') {\n                expect(';');\n            }\n        }\n\n        if (typeof left === 'undefined') {\n\n            if (!match(';')) {\n                test = parseExpression();\n            }\n            expect(';');\n\n            if (!match(')')) {\n                update = parseExpression();\n            }\n        }\n\n        expect(')');\n\n        oldInIteration = state.inIteration;\n        state.inIteration = true;\n\n        body = parseStatement();\n\n        state.inIteration = oldInIteration;\n\n        return (typeof left === 'undefined') ?\n                delegate.createForStatement(init, test, update, body) :\n                delegate.createForInStatement(left, right, body);\n    }\n\n    // 12.7 The continue statement\n\n    function parseContinueStatement() {\n        var label = null, key;\n\n        expectKeyword('continue');\n\n        // Optimize the most common form: 'continue;'.\n        if (source.charCodeAt(index) === 0x3B) {\n            lex();\n\n            if (!state.inIteration) {\n                throwError({}, Messages.IllegalContinue);\n            }\n\n            return delegate.createContinueStatement(null);\n        }\n\n        if (peekLineTerminator()) {\n            if (!state.inIteration) {\n                throwError({}, Messages.IllegalContinue);\n            }\n\n            return delegate.createContinueStatement(null);\n        }\n\n        if (lookahead.type === Token.Identifier) {\n            label = parseVariableIdentifier();\n\n            key = '$' + label.name;\n            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {\n                throwError({}, Messages.UnknownLabel, label.name);\n            }\n        }\n\n        consumeSemicolon();\n\n        if (label === null && !state.inIteration) {\n            throwError({}, Messages.IllegalContinue);\n        }\n\n        return delegate.createContinueStatement(label);\n    }\n\n    // 12.8 The break statement\n\n    function parseBreakStatement() {\n        var label = null, key;\n\n        expectKeyword('break');\n\n        // Catch the very common case first: immediately a semicolon (U+003B).\n        if (source.charCodeAt(index) === 0x3B) {\n            lex();\n\n            if (!(state.inIteration || state.inSwitch)) {\n                throwError({}, Messages.IllegalBreak);\n            }\n\n            return delegate.createBreakStatement(null);\n        }\n\n        if (peekLineTerminator()) {\n            if (!(state.inIteration || state.inSwitch)) {\n                throwError({}, Messages.IllegalBreak);\n            }\n\n            return delegate.createBreakStatement(null);\n        }\n\n        if (lookahead.type === Token.Identifier) {\n            label = parseVariableIdentifier();\n\n            key = '$' + label.name;\n            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {\n                throwError({}, Messages.UnknownLabel, label.name);\n            }\n        }\n\n        consumeSemicolon();\n\n        if (label === null && !(state.inIteration || state.inSwitch)) {\n            throwError({}, Messages.IllegalBreak);\n        }\n\n        return delegate.createBreakStatement(label);\n    }\n\n    // 12.9 The return statement\n\n    function parseReturnStatement() {\n        var argument = null;\n\n        expectKeyword('return');\n\n        if (!state.inFunctionBody) {\n            throwErrorTolerant({}, Messages.IllegalReturn);\n        }\n\n        // 'return' followed by a space and an identifier is very common.\n        if (source.charCodeAt(index) === 0x20) {\n            if (isIdentifierStart(source.charCodeAt(index + 1))) {\n                argument = parseExpression();\n                consumeSemicolon();\n                return delegate.createReturnStatement(argument);\n            }\n        }\n\n        if (peekLineTerminator()) {\n            return delegate.createReturnStatement(null);\n        }\n\n        if (!match(';')) {\n            if (!match('}') && lookahead.type !== Token.EOF) {\n                argument = parseExpression();\n            }\n        }\n\n        consumeSemicolon();\n\n        return delegate.createReturnStatement(argument);\n    }\n\n    // 12.10 The with statement\n\n    function parseWithStatement() {\n        var object, body;\n\n        if (strict) {\n            throwErrorTolerant({}, Messages.StrictModeWith);\n        }\n\n        expectKeyword('with');\n\n        expect('(');\n\n        object = parseExpression();\n\n        expect(')');\n\n        body = parseStatement();\n\n        return delegate.createWithStatement(object, body);\n    }\n\n    // 12.10 The swith statement\n\n    function parseSwitchCase() {\n        var test,\n            consequent = [],\n            statement;\n\n        delegate.markStart();\n        if (matchKeyword('default')) {\n            lex();\n            test = null;\n        } else {\n            expectKeyword('case');\n            test = parseExpression();\n        }\n        expect(':');\n\n        while (index < length) {\n            if (match('}') || matchKeyword('default') || matchKeyword('case')) {\n                break;\n            }\n            statement = parseStatement();\n            consequent.push(statement);\n        }\n\n        return delegate.markEnd(delegate.createSwitchCase(test, consequent));\n    }\n\n    function parseSwitchStatement() {\n        var discriminant, cases, clause, oldInSwitch, defaultFound;\n\n        expectKeyword('switch');\n\n        expect('(');\n\n        discriminant = parseExpression();\n\n        expect(')');\n\n        expect('{');\n\n        cases = [];\n\n        if (match('}')) {\n            lex();\n            return delegate.createSwitchStatement(discriminant, cases);\n        }\n\n        oldInSwitch = state.inSwitch;\n        state.inSwitch = true;\n        defaultFound = false;\n\n        while (index < length) {\n            if (match('}')) {\n                break;\n            }\n            clause = parseSwitchCase();\n            if (clause.test === null) {\n                if (defaultFound) {\n                    throwError({}, Messages.MultipleDefaultsInSwitch);\n                }\n                defaultFound = true;\n            }\n            cases.push(clause);\n        }\n\n        state.inSwitch = oldInSwitch;\n\n        expect('}');\n\n        return delegate.createSwitchStatement(discriminant, cases);\n    }\n\n    // 12.13 The throw statement\n\n    function parseThrowStatement() {\n        var argument;\n\n        expectKeyword('throw');\n\n        if (peekLineTerminator()) {\n            throwError({}, Messages.NewlineAfterThrow);\n        }\n\n        argument = parseExpression();\n\n        consumeSemicolon();\n\n        return delegate.createThrowStatement(argument);\n    }\n\n    // 12.14 The try statement\n\n    function parseCatchClause() {\n        var param, body;\n\n        delegate.markStart();\n        expectKeyword('catch');\n\n        expect('(');\n        if (match(')')) {\n            throwUnexpected(lookahead);\n        }\n\n        param = parseVariableIdentifier();\n        // 12.14.1\n        if (strict && isRestrictedWord(param.name)) {\n            throwErrorTolerant({}, Messages.StrictCatchVariable);\n        }\n\n        expect(')');\n        body = parseBlock();\n        return delegate.markEnd(delegate.createCatchClause(param, body));\n    }\n\n    function parseTryStatement() {\n        var block, handlers = [], finalizer = null;\n\n        expectKeyword('try');\n\n        block = parseBlock();\n\n        if (matchKeyword('catch')) {\n            handlers.push(parseCatchClause());\n        }\n\n        if (matchKeyword('finally')) {\n            lex();\n            finalizer = parseBlock();\n        }\n\n        if (handlers.length === 0 && !finalizer) {\n            throwError({}, Messages.NoCatchOrFinally);\n        }\n\n        return delegate.createTryStatement(block, [], handlers, finalizer);\n    }\n\n    // 12.15 The debugger statement\n\n    function parseDebuggerStatement() {\n        expectKeyword('debugger');\n\n        consumeSemicolon();\n\n        return delegate.createDebuggerStatement();\n    }\n\n    // 12 Statements\n\n    function parseStatement() {\n        var type = lookahead.type,\n            expr,\n            labeledBody,\n            key;\n\n        if (type === Token.EOF) {\n            throwUnexpected(lookahead);\n        }\n\n        delegate.markStart();\n\n        if (type === Token.Punctuator) {\n            switch (lookahead.value) {\n            case ';':\n                return delegate.markEnd(parseEmptyStatement());\n            case '{':\n                return delegate.markEnd(parseBlock());\n            case '(':\n                return delegate.markEnd(parseExpressionStatement());\n            default:\n                break;\n            }\n        }\n\n        if (type === Token.Keyword) {\n            switch (lookahead.value) {\n            case 'break':\n                return delegate.markEnd(parseBreakStatement());\n            case 'continue':\n                return delegate.markEnd(parseContinueStatement());\n            case 'debugger':\n                return delegate.markEnd(parseDebuggerStatement());\n            case 'do':\n                return delegate.markEnd(parseDoWhileStatement());\n            case 'for':\n                return delegate.markEnd(parseForStatement());\n            case 'function':\n                return delegate.markEnd(parseFunctionDeclaration());\n            case 'if':\n                return delegate.markEnd(parseIfStatement());\n            case 'return':\n                return delegate.markEnd(parseReturnStatement());\n            case 'switch':\n                return delegate.markEnd(parseSwitchStatement());\n            case 'throw':\n                return delegate.markEnd(parseThrowStatement());\n            case 'try':\n                return delegate.markEnd(parseTryStatement());\n            case 'var':\n                return delegate.markEnd(parseVariableStatement());\n            case 'while':\n                return delegate.markEnd(parseWhileStatement());\n            case 'with':\n                return delegate.markEnd(parseWithStatement());\n            default:\n                break;\n            }\n        }\n\n        expr = parseExpression();\n\n        // 12.12 Labelled Statements\n        if ((expr.type === Syntax.Identifier) && match(':')) {\n            lex();\n\n            key = '$' + expr.name;\n            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {\n                throwError({}, Messages.Redeclaration, 'Label', expr.name);\n            }\n\n            state.labelSet[key] = true;\n            labeledBody = parseStatement();\n            delete state.labelSet[key];\n            return delegate.markEnd(delegate.createLabeledStatement(expr, labeledBody));\n        }\n\n        consumeSemicolon();\n\n        return delegate.markEnd(delegate.createExpressionStatement(expr));\n    }\n\n    // 13 Function Definition\n\n    function parseFunctionSourceElements() {\n        var sourceElement, sourceElements = [], token, directive, firstRestricted,\n            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;\n\n        delegate.markStart();\n        expect('{');\n\n        while (index < length) {\n            if (lookahead.type !== Token.StringLiteral) {\n                break;\n            }\n            token = lookahead;\n\n            sourceElement = parseSourceElement();\n            sourceElements.push(sourceElement);\n            if (sourceElement.expression.type !== Syntax.Literal) {\n                // this is not directive\n                break;\n            }\n            directive = source.slice(token.range[0] + 1, token.range[1] - 1);\n            if (directive === 'use strict') {\n                strict = true;\n                if (firstRestricted) {\n                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);\n                }\n            } else {\n                if (!firstRestricted && token.octal) {\n                    firstRestricted = token;\n                }\n            }\n        }\n\n        oldLabelSet = state.labelSet;\n        oldInIteration = state.inIteration;\n        oldInSwitch = state.inSwitch;\n        oldInFunctionBody = state.inFunctionBody;\n\n        state.labelSet = {};\n        state.inIteration = false;\n        state.inSwitch = false;\n        state.inFunctionBody = true;\n\n        while (index < length) {\n            if (match('}')) {\n                break;\n            }\n            sourceElement = parseSourceElement();\n            if (typeof sourceElement === 'undefined') {\n                break;\n            }\n            sourceElements.push(sourceElement);\n        }\n\n        expect('}');\n\n        state.labelSet = oldLabelSet;\n        state.inIteration = oldInIteration;\n        state.inSwitch = oldInSwitch;\n        state.inFunctionBody = oldInFunctionBody;\n\n        return delegate.markEnd(delegate.createBlockStatement(sourceElements));\n    }\n\n    function parseParams(firstRestricted) {\n        var param, params = [], token, stricted, paramSet, key, message;\n        expect('(');\n\n        if (!match(')')) {\n            paramSet = {};\n            while (index < length) {\n                token = lookahead;\n                param = parseVariableIdentifier();\n                key = '$' + token.value;\n                if (strict) {\n                    if (isRestrictedWord(token.value)) {\n                        stricted = token;\n                        message = Messages.StrictParamName;\n                    }\n                    if (Object.prototype.hasOwnProperty.call(paramSet, key)) {\n                        stricted = token;\n                        message = Messages.StrictParamDupe;\n                    }\n                } else if (!firstRestricted) {\n                    if (isRestrictedWord(token.value)) {\n                        firstRestricted = token;\n                        message = Messages.StrictParamName;\n                    } else if (isStrictModeReservedWord(token.value)) {\n                        firstRestricted = token;\n                        message = Messages.StrictReservedWord;\n                    } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {\n                        firstRestricted = token;\n                        message = Messages.StrictParamDupe;\n                    }\n                }\n                params.push(param);\n                paramSet[key] = true;\n                if (match(')')) {\n                    break;\n                }\n                expect(',');\n            }\n        }\n\n        expect(')');\n\n        return {\n            params: params,\n            stricted: stricted,\n            firstRestricted: firstRestricted,\n            message: message\n        };\n    }\n\n    function parseFunctionDeclaration() {\n        var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;\n\n        delegate.markStart();\n\n        expectKeyword('function');\n        token = lookahead;\n        id = parseVariableIdentifier();\n        if (strict) {\n            if (isRestrictedWord(token.value)) {\n                throwErrorTolerant(token, Messages.StrictFunctionName);\n            }\n        } else {\n            if (isRestrictedWord(token.value)) {\n                firstRestricted = token;\n                message = Messages.StrictFunctionName;\n            } else if (isStrictModeReservedWord(token.value)) {\n                firstRestricted = token;\n                message = Messages.StrictReservedWord;\n            }\n        }\n\n        tmp = parseParams(firstRestricted);\n        params = tmp.params;\n        stricted = tmp.stricted;\n        firstRestricted = tmp.firstRestricted;\n        if (tmp.message) {\n            message = tmp.message;\n        }\n\n        previousStrict = strict;\n        body = parseFunctionSourceElements();\n        if (strict && firstRestricted) {\n            throwError(firstRestricted, message);\n        }\n        if (strict && stricted) {\n            throwErrorTolerant(stricted, message);\n        }\n        strict = previousStrict;\n\n        return delegate.markEnd(delegate.createFunctionDeclaration(id, params, [], body));\n    }\n\n    function parseFunctionExpression() {\n        var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict;\n\n        delegate.markStart();\n        expectKeyword('function');\n\n        if (!match('(')) {\n            token = lookahead;\n            id = parseVariableIdentifier();\n            if (strict) {\n                if (isRestrictedWord(token.value)) {\n                    throwErrorTolerant(token, Messages.StrictFunctionName);\n                }\n            } else {\n                if (isRestrictedWord(token.value)) {\n                    firstRestricted = token;\n                    message = Messages.StrictFunctionName;\n                } else if (isStrictModeReservedWord(token.value)) {\n                    firstRestricted = token;\n                    message = Messages.StrictReservedWord;\n                }\n            }\n        }\n\n        tmp = parseParams(firstRestricted);\n        params = tmp.params;\n        stricted = tmp.stricted;\n        firstRestricted = tmp.firstRestricted;\n        if (tmp.message) {\n            message = tmp.message;\n        }\n\n        previousStrict = strict;\n        body = parseFunctionSourceElements();\n        if (strict && firstRestricted) {\n            throwError(firstRestricted, message);\n        }\n        if (strict && stricted) {\n            throwErrorTolerant(stricted, message);\n        }\n        strict = previousStrict;\n\n        return delegate.markEnd(delegate.createFunctionExpression(id, params, [], body));\n    }\n\n    // 14 Program\n\n    function parseSourceElement() {\n        if (lookahead.type === Token.Keyword) {\n            switch (lookahead.value) {\n            case 'const':\n            case 'let':\n                return parseConstLetDeclaration(lookahead.value);\n            case 'function':\n                return parseFunctionDeclaration();\n            default:\n                return parseStatement();\n            }\n        }\n\n        if (lookahead.type !== Token.EOF) {\n            return parseStatement();\n        }\n    }\n\n    function parseSourceElements() {\n        var sourceElement, sourceElements = [], token, directive, firstRestricted;\n\n        while (index < length) {\n            token = lookahead;\n            if (token.type !== Token.StringLiteral) {\n                break;\n            }\n\n            sourceElement = parseSourceElement();\n            sourceElements.push(sourceElement);\n            if (sourceElement.expression.type !== Syntax.Literal) {\n                // this is not directive\n                break;\n            }\n            directive = source.slice(token.range[0] + 1, token.range[1] - 1);\n            if (directive === 'use strict') {\n                strict = true;\n                if (firstRestricted) {\n                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);\n                }\n            } else {\n                if (!firstRestricted && token.octal) {\n                    firstRestricted = token;\n                }\n            }\n        }\n\n        while (index < length) {\n            sourceElement = parseSourceElement();\n            if (typeof sourceElement === 'undefined') {\n                break;\n            }\n            sourceElements.push(sourceElement);\n        }\n        return sourceElements;\n    }\n\n    function parseProgram() {\n        var body;\n\n        delegate.markStart();\n        strict = false;\n        peek();\n        body = parseSourceElements();\n        return delegate.markEnd(delegate.createProgram(body));\n    }\n\n    function attachComments() {\n        var i, attacher, comment, leading, trailing;\n\n        for (i = 0; i < extra.pendingComments.length; ++i) {\n            attacher = extra.pendingComments[i];\n            comment = attacher.comment;\n            leading = attacher.leading;\n            if (leading) {\n                if (typeof leading.leadingComments === 'undefined') {\n                    leading.leadingComments = [];\n                }\n                leading.leadingComments.push(attacher.comment);\n            }\n            trailing = attacher.trailing;\n            if (trailing) {\n                if (typeof trailing.trailingComments === 'undefined') {\n                    trailing.trailingComments = [];\n                }\n                trailing.trailingComments.push(attacher.comment);\n            }\n        }\n        extra.pendingComments = [];\n    }\n\n    function filterTokenLocation() {\n        var i, entry, token, tokens = [];\n\n        for (i = 0; i < extra.tokens.length; ++i) {\n            entry = extra.tokens[i];\n            token = {\n                type: entry.type,\n                value: entry.value\n            };\n            if (extra.range) {\n                token.range = entry.range;\n            }\n            if (extra.loc) {\n                token.loc = entry.loc;\n            }\n            tokens.push(token);\n        }\n\n        extra.tokens = tokens;\n    }\n\n    function LocationMarker() {\n        this.startIndex = index;\n        this.startLine = lineNumber;\n        this.startColumn = index - lineStart;\n    }\n\n    LocationMarker.prototype = {\n        constructor: LocationMarker,\n\n        apply: function (node) {\n            if (extra.range) {\n                node.range = [this.startIndex, index];\n            }\n            if (extra.loc) {\n                node.loc = {\n                    start: {\n                        line: this.startLine,\n                        column: this.startColumn\n                    },\n                    end: {\n                        line: lineNumber,\n                        column: index - lineStart\n                    }\n                };\n                node = delegate.postProcess(node);\n            }\n            if (extra.attachComment) {\n                delegate.processComment(node);\n            }\n        }\n    };\n\n    function createLocationMarker() {\n        if (!extra.loc && !extra.range) {\n            return null;\n        }\n\n        skipComment();\n\n        return new LocationMarker();\n    }\n\n    function tokenize(code, options) {\n        var toString,\n            token,\n            tokens;\n\n        toString = String;\n        if (typeof code !== 'string' && !(code instanceof String)) {\n            code = toString(code);\n        }\n\n        delegate = SyntaxTreeDelegate;\n        source = code;\n        index = 0;\n        lineNumber = (source.length > 0) ? 1 : 0;\n        lineStart = 0;\n        length = source.length;\n        lookahead = null;\n        state = {\n            allowIn: true,\n            labelSet: {},\n            inFunctionBody: false,\n            inIteration: false,\n            inSwitch: false,\n            lastCommentStart: -1\n        };\n\n        extra = {};\n\n        // Options matching.\n        options = options || {};\n\n        // Of course we collect tokens here.\n        options.tokens = true;\n        extra.tokens = [];\n        extra.tokenize = true;\n        // The following two fields are necessary to compute the Regex tokens.\n        extra.openParenToken = -1;\n        extra.openCurlyToken = -1;\n\n        extra.range = (typeof options.range === 'boolean') && options.range;\n        extra.loc = (typeof options.loc === 'boolean') && options.loc;\n\n        if (typeof options.comment === 'boolean' && options.comment) {\n            extra.comments = [];\n        }\n        if (typeof options.tolerant === 'boolean' && options.tolerant) {\n            extra.errors = [];\n        }\n\n        if (length > 0) {\n            if (typeof source[0] === 'undefined') {\n                // Try first to convert to a string. This is good as fast path\n                // for old IE which understands string indexing for string\n                // literals only and not for string object.\n                if (code instanceof String) {\n                    source = code.valueOf();\n                }\n            }\n        }\n\n        try {\n            peek();\n            if (lookahead.type === Token.EOF) {\n                return extra.tokens;\n            }\n\n            token = lex();\n            while (lookahead.type !== Token.EOF) {\n                try {\n                    token = lex();\n                } catch (lexError) {\n                    token = lookahead;\n                    if (extra.errors) {\n                        extra.errors.push(lexError);\n                        // We have to break on the first error\n                        // to avoid infinite loops.\n                        break;\n                    } else {\n                        throw lexError;\n                    }\n                }\n            }\n\n            filterTokenLocation();\n            tokens = extra.tokens;\n            if (typeof extra.comments !== 'undefined') {\n                tokens.comments = extra.comments;\n            }\n            if (typeof extra.errors !== 'undefined') {\n                tokens.errors = extra.errors;\n            }\n        } catch (e) {\n            throw e;\n        } finally {\n            extra = {};\n        }\n        return tokens;\n    }\n\n    function parse(code, options) {\n        var program, toString;\n\n        toString = String;\n        if (typeof code !== 'string' && !(code instanceof String)) {\n            code = toString(code);\n        }\n\n        delegate = SyntaxTreeDelegate;\n        source = code;\n        index = 0;\n        lineNumber = (source.length > 0) ? 1 : 0;\n        lineStart = 0;\n        length = source.length;\n        lookahead = null;\n        state = {\n            allowIn: true,\n            labelSet: {},\n            inFunctionBody: false,\n            inIteration: false,\n            inSwitch: false,\n            lastCommentStart: -1,\n            markerStack: []\n        };\n\n        extra = {};\n        if (typeof options !== 'undefined') {\n            extra.range = (typeof options.range === 'boolean') && options.range;\n            extra.loc = (typeof options.loc === 'boolean') && options.loc;\n            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;\n\n            if (extra.loc && options.source !== null && options.source !== undefined) {\n                extra.source = toString(options.source);\n            }\n\n            if (typeof options.tokens === 'boolean' && options.tokens) {\n                extra.tokens = [];\n            }\n            if (typeof options.comment === 'boolean' && options.comment) {\n                extra.comments = [];\n            }\n            if (typeof options.tolerant === 'boolean' && options.tolerant) {\n                extra.errors = [];\n            }\n            if (extra.attachComment) {\n                extra.range = true;\n                extra.pendingComments = [];\n                extra.comments = [];\n            }\n        }\n\n        if (length > 0) {\n            if (typeof source[0] === 'undefined') {\n                // Try first to convert to a string. This is good as fast path\n                // for old IE which understands string indexing for string\n                // literals only and not for string object.\n                if (code instanceof String) {\n                    source = code.valueOf();\n                }\n            }\n        }\n\n        try {\n            program = parseProgram();\n            if (typeof extra.comments !== 'undefined') {\n                program.comments = extra.comments;\n            }\n            if (typeof extra.tokens !== 'undefined') {\n                filterTokenLocation();\n                program.tokens = extra.tokens;\n            }\n            if (typeof extra.errors !== 'undefined') {\n                program.errors = extra.errors;\n            }\n            if (extra.attachComment) {\n                attachComments();\n            }\n        } catch (e) {\n            throw e;\n        } finally {\n            extra = {};\n        }\n\n        return program;\n    }\n\n    // Sync with *.json manifests.\n    exports.version = '1.1.1';\n\n    exports.tokenize = tokenize;\n\n    exports.parse = parse;\n\n    // Deep copy.\n    exports.Syntax = (function () {\n        var name, types = {};\n\n        if (typeof Object.create === 'function') {\n            types = Object.create(null);\n        }\n\n        for (name in Syntax) {\n            if (Syntax.hasOwnProperty(name)) {\n                types[name] = Syntax[name];\n            }\n        }\n\n        if (typeof Object.freeze === 'function') {\n            Object.freeze(types);\n        }\n\n        return types;\n    }());\n\n}));\n/* vim: set sw=4 ts=4 et tw=80 : */\n\n\n//# sourceURL=webpack:///./node_modules/jison/node_modules/esprima/esprima.js?");

/***/ }),

/***/ "./node_modules/jison/package.json":
/*!*****************************************!*\
  !*** ./node_modules/jison/package.json ***!
  \*****************************************/
/*! exports provided: author, name, description, version, license, keywords, preferGlobal, repository, bugs, main, bin, engines, dependencies, devDependencies, scripts, homepage, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"author\\\":\\\"Zach Carter <zach@carter.name> (http://zaa.ch)\\\",\\\"name\\\":\\\"jison\\\",\\\"description\\\":\\\"A parser generator with Bison's API\\\",\\\"version\\\":\\\"0.4.18\\\",\\\"license\\\":\\\"MIT\\\",\\\"keywords\\\":[\\\"jison\\\",\\\"bison\\\",\\\"yacc\\\",\\\"parser\\\",\\\"generator\\\",\\\"lexer\\\",\\\"flex\\\",\\\"tokenizer\\\",\\\"compiler\\\"],\\\"preferGlobal\\\":true,\\\"repository\\\":{\\\"type\\\":\\\"git\\\",\\\"url\\\":\\\"git://github.com/zaach/jison.git\\\"},\\\"bugs\\\":{\\\"email\\\":\\\"jison@librelist.com\\\",\\\"url\\\":\\\"http://github.com/zaach/jison/issues\\\"},\\\"main\\\":\\\"lib/jison\\\",\\\"bin\\\":\\\"lib/cli.js\\\",\\\"engines\\\":{\\\"node\\\":\\\">=0.4\\\"},\\\"dependencies\\\":{\\\"JSONSelect\\\":\\\"0.4.0\\\",\\\"esprima\\\":\\\"1.1.x\\\",\\\"escodegen\\\":\\\"1.3.x\\\",\\\"jison-lex\\\":\\\"0.3.x\\\",\\\"ebnf-parser\\\":\\\"0.1.10\\\",\\\"lex-parser\\\":\\\"~0.1.3\\\",\\\"nomnom\\\":\\\"1.5.2\\\",\\\"cjson\\\":\\\"0.3.0\\\"},\\\"devDependencies\\\":{\\\"test\\\":\\\"0.6.x\\\",\\\"jison\\\":\\\"0.4.x\\\",\\\"uglify-js\\\":\\\"~2.4.0\\\",\\\"browserify\\\":\\\"2.x.x\\\"},\\\"scripts\\\":{\\\"test\\\":\\\"node tests/all-tests.js\\\"},\\\"homepage\\\":\\\"http://jison.org\\\"}\");\n\n//# sourceURL=webpack:///./node_modules/jison/package.json?");

/***/ }),

/***/ "./node_modules/lex-parser/lex-parser.js":
/*!***********************************************!*\
  !*** ./node_modules/lex-parser/lex-parser.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.6 */\n/*\n  Returns a Parser object of the following structure:\n\n  Parser: {\n    yy: {}\n  }\n\n  Parser.prototype: {\n    yy: {},\n    trace: function(),\n    symbols_: {associative list: name ==> number},\n    terminals_: {associative list: number ==> name},\n    productions_: [...],\n    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n    table: [...],\n    defaultActions: {...},\n    parseError: function(str, hash),\n    parse: function(input),\n\n    lexer: {\n        EOF: 1,\n        parseError: function(str, hash),\n        setInput: function(input),\n        input: function(),\n        unput: function(str),\n        more: function(),\n        less: function(n),\n        pastInput: function(),\n        upcomingInput: function(),\n        showPosition: function(),\n        test_match: function(regex_match_array, rule_index),\n        next: function(),\n        lex: function(),\n        begin: function(condition),\n        popState: function(),\n        _currentRules: function(),\n        topState: function(),\n        pushState: function(condition),\n\n        options: {\n            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n        },\n\n        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n        rules: [...],\n        conditions: {associative list: name ==> set},\n    }\n  }\n\n\n  token location info (@$, _$, etc.): {\n    first_line: n,\n    last_line: n,\n    first_column: n,\n    last_column: n,\n    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n  }\n\n\n  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n    text:        (matched text)\n    token:       (the produced terminal token, if any)\n    line:        (yylineno)\n  }\n  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n    loc:         (yylloc)\n    expected:    (string describing the set of expected tokens)\n    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n  }\n*/\nvar lex = (function(){\nvar parser = {trace: function trace() { },\nyy: {},\nsymbols_: {\"error\":2,\"lex\":3,\"definitions\":4,\"%%\":5,\"rules\":6,\"epilogue\":7,\"EOF\":8,\"CODE\":9,\"definition\":10,\"ACTION\":11,\"NAME\":12,\"regex\":13,\"START_INC\":14,\"names_inclusive\":15,\"START_EXC\":16,\"names_exclusive\":17,\"START_COND\":18,\"rule\":19,\"start_conditions\":20,\"action\":21,\"{\":22,\"action_body\":23,\"}\":24,\"action_comments_body\":25,\"ACTION_BODY\":26,\"<\":27,\"name_list\":28,\">\":29,\"*\":30,\",\":31,\"regex_list\":32,\"|\":33,\"regex_concat\":34,\"regex_base\":35,\"(\":36,\")\":37,\"SPECIAL_GROUP\":38,\"+\":39,\"?\":40,\"/\":41,\"/!\":42,\"name_expansion\":43,\"range_regex\":44,\"any_group_regex\":45,\".\":46,\"^\":47,\"$\":48,\"string\":49,\"escape_char\":50,\"NAME_BRACE\":51,\"ANY_GROUP_REGEX\":52,\"ESCAPE_CHAR\":53,\"RANGE_REGEX\":54,\"STRING_LIT\":55,\"CHARACTER_LIT\":56,\"$accept\":0,\"$end\":1},\nterminals_: {2:\"error\",5:\"%%\",8:\"EOF\",9:\"CODE\",11:\"ACTION\",12:\"NAME\",14:\"START_INC\",16:\"START_EXC\",18:\"START_COND\",22:\"{\",24:\"}\",26:\"ACTION_BODY\",27:\"<\",29:\">\",30:\"*\",31:\",\",33:\"|\",36:\"(\",37:\")\",38:\"SPECIAL_GROUP\",39:\"+\",40:\"?\",41:\"/\",42:\"/!\",46:\".\",47:\"^\",48:\"$\",51:\"NAME_BRACE\",52:\"ANY_GROUP_REGEX\",53:\"ESCAPE_CHAR\",54:\"RANGE_REGEX\",55:\"STRING_LIT\",56:\"CHARACTER_LIT\"},\nproductions_: [0,[3,4],[7,1],[7,2],[7,3],[4,2],[4,2],[4,0],[10,2],[10,2],[10,2],[15,1],[15,2],[17,1],[17,2],[6,2],[6,1],[19,3],[21,3],[21,1],[23,0],[23,1],[23,5],[23,4],[25,1],[25,2],[20,3],[20,3],[20,0],[28,1],[28,3],[13,1],[32,3],[32,2],[32,1],[32,0],[34,2],[34,1],[35,3],[35,3],[35,2],[35,2],[35,2],[35,2],[35,2],[35,1],[35,2],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[43,1],[45,1],[50,1],[44,1],[49,1],[49,1]],\nperformAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {\n/* this == yyval */\n\nvar $0 = $$.length - 1;\nswitch (yystate) {\ncase 1: \n          this.$ = { rules: $$[$0-1] };\n          if ($$[$0-3][0]) this.$.macros = $$[$0-3][0];\n          if ($$[$0-3][1]) this.$.startConditions = $$[$0-3][1];\n          if ($$[$0]) this.$.moduleInclude = $$[$0];\n          if (yy.options) this.$.options = yy.options;\n          if (yy.actionInclude) this.$.actionInclude = yy.actionInclude;\n          delete yy.options;\n          delete yy.actionInclude;\n          return this.$; \n        \nbreak;\ncase 2: this.$ = null; \nbreak;\ncase 3: this.$ = null; \nbreak;\ncase 4: this.$ = $$[$0-1]; \nbreak;\ncase 5:\n          this.$ = $$[$0];\n          if ('length' in $$[$0-1]) {\n            this.$[0] = this.$[0] || {};\n            this.$[0][$$[$0-1][0]] = $$[$0-1][1];\n          } else {\n            this.$[1] = this.$[1] || {};\n            for (var name in $$[$0-1]) {\n              this.$[1][name] = $$[$0-1][name];\n            }\n          }\n        \nbreak;\ncase 6: yy.actionInclude += $$[$0-1]; this.$ = $$[$0]; \nbreak;\ncase 7: yy.actionInclude = ''; this.$ = [null,null]; \nbreak;\ncase 8: this.$ = [$$[$0-1], $$[$0]]; \nbreak;\ncase 9: this.$ = $$[$0]; \nbreak;\ncase 10: this.$ = $$[$0]; \nbreak;\ncase 11: this.$ = {}; this.$[$$[$0]] = 0; \nbreak;\ncase 12: this.$ = $$[$0-1]; this.$[$$[$0]] = 0; \nbreak;\ncase 13: this.$ = {}; this.$[$$[$0]] = 1; \nbreak;\ncase 14: this.$ = $$[$0-1]; this.$[$$[$0]] = 1; \nbreak;\ncase 15: this.$ = $$[$0-1]; this.$.push($$[$0]); \nbreak;\ncase 16: this.$ = [$$[$0]]; \nbreak;\ncase 17: this.$ = $$[$0-2] ? [$$[$0-2], $$[$0-1], $$[$0]] : [$$[$0-1],$$[$0]]; \nbreak;\ncase 18:this.$ = $$[$0-1];\nbreak;\ncase 19:this.$ = $$[$0];\nbreak;\ncase 20:this.$ = '';\nbreak;\ncase 21:this.$ = $$[$0];\nbreak;\ncase 22:this.$ = $$[$0-4]+$$[$0-3]+$$[$0-2]+$$[$0-1]+$$[$0];\nbreak;\ncase 23:this.$ = $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];\nbreak;\ncase 24: this.$ = yytext; \nbreak;\ncase 25: this.$ = $$[$0-1]+$$[$0]; \nbreak;\ncase 26: this.$ = $$[$0-1]; \nbreak;\ncase 27: this.$ = ['*']; \nbreak;\ncase 29: this.$ = [$$[$0]]; \nbreak;\ncase 30: this.$ = $$[$0-2]; this.$.push($$[$0]); \nbreak;\ncase 31:\n          this.$ = $$[$0];\n          if (!(yy.options && yy.options.flex) && this.$.match(/[\\w\\d]$/) && !this.$.match(/\\\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) {\n              this.$ += \"\\\\b\";\n          }\n        \nbreak;\ncase 32: this.$ = $$[$0-2] + '|' + $$[$0]; \nbreak;\ncase 33: this.$ = $$[$0-1] + '|'; \nbreak;\ncase 35: this.$ = '' \nbreak;\ncase 36: this.$ = $$[$0-1] + $$[$0]; \nbreak;\ncase 38: this.$ = '(' + $$[$0-1] + ')'; \nbreak;\ncase 39: this.$ = $$[$0-2] + $$[$0-1] + ')'; \nbreak;\ncase 40: this.$ = $$[$0-1] + '+'; \nbreak;\ncase 41: this.$ = $$[$0-1] + '*'; \nbreak;\ncase 42: this.$ = $$[$0-1] + '?'; \nbreak;\ncase 43: this.$ = '(?=' + $$[$0] + ')'; \nbreak;\ncase 44: this.$ = '(?!' + $$[$0] + ')'; \nbreak;\ncase 46: this.$ = $$[$0-1] + $$[$0]; \nbreak;\ncase 48: this.$ = '.'; \nbreak;\ncase 49: this.$ = '^'; \nbreak;\ncase 50: this.$ = '$'; \nbreak;\ncase 54: this.$ = yytext; \nbreak;\ncase 55: this.$ = yytext; \nbreak;\ncase 56: this.$ = yytext; \nbreak;\ncase 57: this.$ = prepareString(yytext.substr(1, yytext.length - 2)); \nbreak;\n}\n},\ntable: [{3:1,4:2,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{1:[3]},{5:[1,8]},{4:9,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{4:10,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{5:[2,35],11:[2,35],12:[2,35],13:11,14:[2,35],16:[2,35],32:12,33:[2,35],34:13,35:14,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{15:31,18:[1,32]},{17:33,18:[1,34]},{6:35,11:[2,28],19:36,20:37,22:[2,28],27:[1,38],33:[2,28],36:[2,28],38:[2,28],41:[2,28],42:[2,28],46:[2,28],47:[2,28],48:[2,28],51:[2,28],52:[2,28],53:[2,28],55:[2,28],56:[2,28]},{5:[2,5]},{5:[2,6]},{5:[2,8],11:[2,8],12:[2,8],14:[2,8],16:[2,8]},{5:[2,31],11:[2,31],12:[2,31],14:[2,31],16:[2,31],22:[2,31],33:[1,39]},{5:[2,34],11:[2,34],12:[2,34],14:[2,34],16:[2,34],22:[2,34],33:[2,34],35:40,36:[1,15],37:[2,34],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,37],11:[2,37],12:[2,37],14:[2,37],16:[2,37],22:[2,37],30:[1,42],33:[2,37],36:[2,37],37:[2,37],38:[2,37],39:[1,41],40:[1,43],41:[2,37],42:[2,37],44:44,46:[2,37],47:[2,37],48:[2,37],51:[2,37],52:[2,37],53:[2,37],54:[1,45],55:[2,37],56:[2,37]},{32:46,33:[2,35],34:13,35:14,36:[1,15],37:[2,35],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{32:47,33:[2,35],34:13,35:14,36:[1,15],37:[2,35],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{35:48,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{35:49,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,45],11:[2,45],12:[2,45],14:[2,45],16:[2,45],22:[2,45],30:[2,45],33:[2,45],36:[2,45],37:[2,45],38:[2,45],39:[2,45],40:[2,45],41:[2,45],42:[2,45],46:[2,45],47:[2,45],48:[2,45],51:[2,45],52:[2,45],53:[2,45],54:[2,45],55:[2,45],56:[2,45]},{5:[2,47],11:[2,47],12:[2,47],14:[2,47],16:[2,47],22:[2,47],30:[2,47],33:[2,47],36:[2,47],37:[2,47],38:[2,47],39:[2,47],40:[2,47],41:[2,47],42:[2,47],46:[2,47],47:[2,47],48:[2,47],51:[2,47],52:[2,47],53:[2,47],54:[2,47],55:[2,47],56:[2,47]},{5:[2,48],11:[2,48],12:[2,48],14:[2,48],16:[2,48],22:[2,48],30:[2,48],33:[2,48],36:[2,48],37:[2,48],38:[2,48],39:[2,48],40:[2,48],41:[2,48],42:[2,48],46:[2,48],47:[2,48],48:[2,48],51:[2,48],52:[2,48],53:[2,48],54:[2,48],55:[2,48],56:[2,48]},{5:[2,49],11:[2,49],12:[2,49],14:[2,49],16:[2,49],22:[2,49],30:[2,49],33:[2,49],36:[2,49],37:[2,49],38:[2,49],39:[2,49],40:[2,49],41:[2,49],42:[2,49],46:[2,49],47:[2,49],48:[2,49],51:[2,49],52:[2,49],53:[2,49],54:[2,49],55:[2,49],56:[2,49]},{5:[2,50],11:[2,50],12:[2,50],14:[2,50],16:[2,50],22:[2,50],30:[2,50],33:[2,50],36:[2,50],37:[2,50],38:[2,50],39:[2,50],40:[2,50],41:[2,50],42:[2,50],46:[2,50],47:[2,50],48:[2,50],51:[2,50],52:[2,50],53:[2,50],54:[2,50],55:[2,50],56:[2,50]},{5:[2,51],11:[2,51],12:[2,51],14:[2,51],16:[2,51],22:[2,51],30:[2,51],33:[2,51],36:[2,51],37:[2,51],38:[2,51],39:[2,51],40:[2,51],41:[2,51],42:[2,51],46:[2,51],47:[2,51],48:[2,51],51:[2,51],52:[2,51],53:[2,51],54:[2,51],55:[2,51],56:[2,51]},{5:[2,52],11:[2,52],12:[2,52],14:[2,52],16:[2,52],22:[2,52],30:[2,52],33:[2,52],36:[2,52],37:[2,52],38:[2,52],39:[2,52],40:[2,52],41:[2,52],42:[2,52],46:[2,52],47:[2,52],48:[2,52],51:[2,52],52:[2,52],53:[2,52],54:[2,52],55:[2,52],56:[2,52]},{5:[2,53],11:[2,53],12:[2,53],14:[2,53],16:[2,53],22:[2,53],30:[2,53],33:[2,53],36:[2,53],37:[2,53],38:[2,53],39:[2,53],40:[2,53],41:[2,53],42:[2,53],46:[2,53],47:[2,53],48:[2,53],51:[2,53],52:[2,53],53:[2,53],54:[2,53],55:[2,53],56:[2,53]},{5:[2,54],11:[2,54],12:[2,54],14:[2,54],16:[2,54],22:[2,54],30:[2,54],33:[2,54],36:[2,54],37:[2,54],38:[2,54],39:[2,54],40:[2,54],41:[2,54],42:[2,54],46:[2,54],47:[2,54],48:[2,54],51:[2,54],52:[2,54],53:[2,54],54:[2,54],55:[2,54],56:[2,54]},{5:[2,57],11:[2,57],12:[2,57],14:[2,57],16:[2,57],22:[2,57],30:[2,57],33:[2,57],36:[2,57],37:[2,57],38:[2,57],39:[2,57],40:[2,57],41:[2,57],42:[2,57],46:[2,57],47:[2,57],48:[2,57],51:[2,57],52:[2,57],53:[2,57],54:[2,57],55:[2,57],56:[2,57]},{5:[2,58],11:[2,58],12:[2,58],14:[2,58],16:[2,58],22:[2,58],30:[2,58],33:[2,58],36:[2,58],37:[2,58],38:[2,58],39:[2,58],40:[2,58],41:[2,58],42:[2,58],46:[2,58],47:[2,58],48:[2,58],51:[2,58],52:[2,58],53:[2,58],54:[2,58],55:[2,58],56:[2,58]},{5:[2,55],11:[2,55],12:[2,55],14:[2,55],16:[2,55],22:[2,55],30:[2,55],33:[2,55],36:[2,55],37:[2,55],38:[2,55],39:[2,55],40:[2,55],41:[2,55],42:[2,55],46:[2,55],47:[2,55],48:[2,55],51:[2,55],52:[2,55],53:[2,55],54:[2,55],55:[2,55],56:[2,55]},{5:[2,9],11:[2,9],12:[2,9],14:[2,9],16:[2,9],18:[1,50]},{5:[2,11],11:[2,11],12:[2,11],14:[2,11],16:[2,11],18:[2,11]},{5:[2,10],11:[2,10],12:[2,10],14:[2,10],16:[2,10],18:[1,51]},{5:[2,13],11:[2,13],12:[2,13],14:[2,13],16:[2,13],18:[2,13]},{5:[1,55],7:52,8:[1,54],11:[2,28],19:53,20:37,22:[2,28],27:[1,38],33:[2,28],36:[2,28],38:[2,28],41:[2,28],42:[2,28],46:[2,28],47:[2,28],48:[2,28],51:[2,28],52:[2,28],53:[2,28],55:[2,28],56:[2,28]},{5:[2,16],8:[2,16],11:[2,16],22:[2,16],27:[2,16],33:[2,16],36:[2,16],38:[2,16],41:[2,16],42:[2,16],46:[2,16],47:[2,16],48:[2,16],51:[2,16],52:[2,16],53:[2,16],55:[2,16],56:[2,16]},{11:[2,35],13:56,22:[2,35],32:12,33:[2,35],34:13,35:14,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{12:[1,59],28:57,30:[1,58]},{5:[2,33],11:[2,33],12:[2,33],14:[2,33],16:[2,33],22:[2,33],33:[2,33],34:60,35:14,36:[1,15],37:[2,33],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,36],11:[2,36],12:[2,36],14:[2,36],16:[2,36],22:[2,36],30:[1,42],33:[2,36],36:[2,36],37:[2,36],38:[2,36],39:[1,41],40:[1,43],41:[2,36],42:[2,36],44:44,46:[2,36],47:[2,36],48:[2,36],51:[2,36],52:[2,36],53:[2,36],54:[1,45],55:[2,36],56:[2,36]},{5:[2,40],11:[2,40],12:[2,40],14:[2,40],16:[2,40],22:[2,40],30:[2,40],33:[2,40],36:[2,40],37:[2,40],38:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],46:[2,40],47:[2,40],48:[2,40],51:[2,40],52:[2,40],53:[2,40],54:[2,40],55:[2,40],56:[2,40]},{5:[2,41],11:[2,41],12:[2,41],14:[2,41],16:[2,41],22:[2,41],30:[2,41],33:[2,41],36:[2,41],37:[2,41],38:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],46:[2,41],47:[2,41],48:[2,41],51:[2,41],52:[2,41],53:[2,41],54:[2,41],55:[2,41],56:[2,41]},{5:[2,42],11:[2,42],12:[2,42],14:[2,42],16:[2,42],22:[2,42],30:[2,42],33:[2,42],36:[2,42],37:[2,42],38:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],46:[2,42],47:[2,42],48:[2,42],51:[2,42],52:[2,42],53:[2,42],54:[2,42],55:[2,42],56:[2,42]},{5:[2,46],11:[2,46],12:[2,46],14:[2,46],16:[2,46],22:[2,46],30:[2,46],33:[2,46],36:[2,46],37:[2,46],38:[2,46],39:[2,46],40:[2,46],41:[2,46],42:[2,46],46:[2,46],47:[2,46],48:[2,46],51:[2,46],52:[2,46],53:[2,46],54:[2,46],55:[2,46],56:[2,46]},{5:[2,56],11:[2,56],12:[2,56],14:[2,56],16:[2,56],22:[2,56],30:[2,56],33:[2,56],36:[2,56],37:[2,56],38:[2,56],39:[2,56],40:[2,56],41:[2,56],42:[2,56],46:[2,56],47:[2,56],48:[2,56],51:[2,56],52:[2,56],53:[2,56],54:[2,56],55:[2,56],56:[2,56]},{33:[1,39],37:[1,61]},{33:[1,39],37:[1,62]},{5:[2,43],11:[2,43],12:[2,43],14:[2,43],16:[2,43],22:[2,43],30:[1,42],33:[2,43],36:[2,43],37:[2,43],38:[2,43],39:[1,41],40:[1,43],41:[2,43],42:[2,43],44:44,46:[2,43],47:[2,43],48:[2,43],51:[2,43],52:[2,43],53:[2,43],54:[1,45],55:[2,43],56:[2,43]},{5:[2,44],11:[2,44],12:[2,44],14:[2,44],16:[2,44],22:[2,44],30:[1,42],33:[2,44],36:[2,44],37:[2,44],38:[2,44],39:[1,41],40:[1,43],41:[2,44],42:[2,44],44:44,46:[2,44],47:[2,44],48:[2,44],51:[2,44],52:[2,44],53:[2,44],54:[1,45],55:[2,44],56:[2,44]},{5:[2,12],11:[2,12],12:[2,12],14:[2,12],16:[2,12],18:[2,12]},{5:[2,14],11:[2,14],12:[2,14],14:[2,14],16:[2,14],18:[2,14]},{1:[2,1]},{5:[2,15],8:[2,15],11:[2,15],22:[2,15],27:[2,15],33:[2,15],36:[2,15],38:[2,15],41:[2,15],42:[2,15],46:[2,15],47:[2,15],48:[2,15],51:[2,15],52:[2,15],53:[2,15],55:[2,15],56:[2,15]},{1:[2,2]},{8:[1,63],9:[1,64]},{11:[1,67],21:65,22:[1,66]},{29:[1,68],31:[1,69]},{29:[1,70]},{29:[2,29],31:[2,29]},{5:[2,32],11:[2,32],12:[2,32],14:[2,32],16:[2,32],22:[2,32],33:[2,32],35:40,36:[1,15],37:[2,32],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,38],11:[2,38],12:[2,38],14:[2,38],16:[2,38],22:[2,38],30:[2,38],33:[2,38],36:[2,38],37:[2,38],38:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],46:[2,38],47:[2,38],48:[2,38],51:[2,38],52:[2,38],53:[2,38],54:[2,38],55:[2,38],56:[2,38]},{5:[2,39],11:[2,39],12:[2,39],14:[2,39],16:[2,39],22:[2,39],30:[2,39],33:[2,39],36:[2,39],37:[2,39],38:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],46:[2,39],47:[2,39],48:[2,39],51:[2,39],52:[2,39],53:[2,39],54:[2,39],55:[2,39],56:[2,39]},{1:[2,3]},{8:[1,71]},{5:[2,17],8:[2,17],11:[2,17],22:[2,17],27:[2,17],33:[2,17],36:[2,17],38:[2,17],41:[2,17],42:[2,17],46:[2,17],47:[2,17],48:[2,17],51:[2,17],52:[2,17],53:[2,17],55:[2,17],56:[2,17]},{22:[2,20],23:72,24:[2,20],25:73,26:[1,74]},{5:[2,19],8:[2,19],11:[2,19],22:[2,19],27:[2,19],33:[2,19],36:[2,19],38:[2,19],41:[2,19],42:[2,19],46:[2,19],47:[2,19],48:[2,19],51:[2,19],52:[2,19],53:[2,19],55:[2,19],56:[2,19]},{11:[2,26],22:[2,26],33:[2,26],36:[2,26],38:[2,26],41:[2,26],42:[2,26],46:[2,26],47:[2,26],48:[2,26],51:[2,26],52:[2,26],53:[2,26],55:[2,26],56:[2,26]},{12:[1,75]},{11:[2,27],22:[2,27],33:[2,27],36:[2,27],38:[2,27],41:[2,27],42:[2,27],46:[2,27],47:[2,27],48:[2,27],51:[2,27],52:[2,27],53:[2,27],55:[2,27],56:[2,27]},{1:[2,4]},{22:[1,77],24:[1,76]},{22:[2,21],24:[2,21],26:[1,78]},{22:[2,24],24:[2,24],26:[2,24]},{29:[2,30],31:[2,30]},{5:[2,18],8:[2,18],11:[2,18],22:[2,18],27:[2,18],33:[2,18],36:[2,18],38:[2,18],41:[2,18],42:[2,18],46:[2,18],47:[2,18],48:[2,18],51:[2,18],52:[2,18],53:[2,18],55:[2,18],56:[2,18]},{22:[2,20],23:79,24:[2,20],25:73,26:[1,74]},{22:[2,25],24:[2,25],26:[2,25]},{22:[1,77],24:[1,80]},{22:[2,23],24:[2,23],25:81,26:[1,74]},{22:[2,22],24:[2,22],26:[1,78]}],\ndefaultActions: {9:[2,5],10:[2,6],52:[2,1],54:[2,2],63:[2,3],71:[2,4]},\nparseError: function parseError(str, hash) {\n    if (hash.recoverable) {\n        this.trace(str);\n    } else {\n        throw new Error(str);\n    }\n},\nparse: function parse(input) {\n    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;\n    this.lexer.setInput(input);\n    this.lexer.yy = this.yy;\n    this.yy.lexer = this.lexer;\n    this.yy.parser = this;\n    if (typeof this.lexer.yylloc == 'undefined') {\n        this.lexer.yylloc = {};\n    }\n    var yyloc = this.lexer.yylloc;\n    lstack.push(yyloc);\n    var ranges = this.lexer.options && this.lexer.options.ranges;\n    if (typeof this.yy.parseError === 'function') {\n        this.parseError = this.yy.parseError;\n    } else {\n        this.parseError = Object.getPrototypeOf(this).parseError;\n    }\n    function popStack(n) {\n        stack.length = stack.length - 2 * n;\n        vstack.length = vstack.length - n;\n        lstack.length = lstack.length - n;\n    }\n    function lex() {\n        var token;\n        token = self.lexer.lex() || EOF;\n        if (typeof token !== 'number') {\n            token = self.symbols_[token] || token;\n        }\n        return token;\n    }\n    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;\n    while (true) {\n        state = stack[stack.length - 1];\n        if (this.defaultActions[state]) {\n            action = this.defaultActions[state];\n        } else {\n            if (symbol === null || typeof symbol == 'undefined') {\n                symbol = lex();\n            }\n            action = table[state] && table[state][symbol];\n        }\n                    if (typeof action === 'undefined' || !action.length || !action[0]) {\n                var errStr = '';\n                expected = [];\n                for (p in table[state]) {\n                    if (this.terminals_[p] && p > TERROR) {\n                        expected.push('\\'' + this.terminals_[p] + '\\'');\n                    }\n                }\n                if (this.lexer.showPosition) {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\\n' + this.lexer.showPosition() + '\\nExpecting ' + expected.join(', ') + ', got \\'' + (this.terminals_[symbol] || symbol) + '\\'';\n                } else {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\\'' + (this.terminals_[symbol] || symbol) + '\\'');\n                }\n                this.parseError(errStr, {\n                    text: this.lexer.match,\n                    token: this.terminals_[symbol] || symbol,\n                    line: this.lexer.yylineno,\n                    loc: yyloc,\n                    expected: expected\n                });\n            }\n        if (action[0] instanceof Array && action.length > 1) {\n            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);\n        }\n        switch (action[0]) {\n        case 1:\n            stack.push(symbol);\n            vstack.push(this.lexer.yytext);\n            lstack.push(this.lexer.yylloc);\n            stack.push(action[1]);\n            symbol = null;\n            if (!preErrorSymbol) {\n                yyleng = this.lexer.yyleng;\n                yytext = this.lexer.yytext;\n                yylineno = this.lexer.yylineno;\n                yyloc = this.lexer.yylloc;\n                if (recovering > 0) {\n                    recovering--;\n                }\n            } else {\n                symbol = preErrorSymbol;\n                preErrorSymbol = null;\n            }\n            break;\n        case 2:\n            len = this.productions_[action[1]][1];\n            yyval.$ = vstack[vstack.length - len];\n            yyval._$ = {\n                first_line: lstack[lstack.length - (len || 1)].first_line,\n                last_line: lstack[lstack.length - 1].last_line,\n                first_column: lstack[lstack.length - (len || 1)].first_column,\n                last_column: lstack[lstack.length - 1].last_column\n            };\n            if (ranges) {\n                yyval._$.range = [\n                    lstack[lstack.length - (len || 1)].range[0],\n                    lstack[lstack.length - 1].range[1]\n                ];\n            }\n            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);\n            if (typeof r !== 'undefined') {\n                return r;\n            }\n            if (len) {\n                stack = stack.slice(0, -1 * len * 2);\n                vstack = vstack.slice(0, -1 * len);\n                lstack = lstack.slice(0, -1 * len);\n            }\n            stack.push(this.productions_[action[1]][0]);\n            vstack.push(yyval.$);\n            lstack.push(yyval._$);\n            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];\n            stack.push(newState);\n            break;\n        case 3:\n            return true;\n        }\n    }\n    return true;\n}};\n\n\nfunction encodeRE (s) {\n    return s.replace(/([.*+?^${}()|[\\]\\/\\\\])/g, '\\\\$1').replace(/\\\\\\\\u([a-fA-F0-9]{4})/g,'\\\\u$1');\n}\n\nfunction prepareString (s) {\n    // unescape slashes\n    s = s.replace(/\\\\\\\\/g, \"\\\\\");\n    s = encodeRE(s);\n    return s;\n};\n\n/* generated by jison-lex 0.2.1 */\nvar lexer = (function(){\nvar lexer = {\n\nEOF:1,\n\nparseError:function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n// resets the lexer, sets new input\nsetInput:function (input) {\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n// consumes and returns one char from the input\ninput:function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n// unshifts one char (or a string) into the input\nunput:function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n// When called from action, caches matched text and appends it on next action\nmore:function () {\n        this._more = true;\n        return this;\n    },\n\n// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\nreject:function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n// retain first n characters of the match\nless:function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n// displays already matched input, i.e. for error messages\npastInput:function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n// displays upcoming input, i.e. for error messages\nupcomingInput:function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n// displays the character position where the lexing error occurred, i.e. for error messages\nshowPosition:function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n// test the lexed token: return FALSE when not a match, otherwise return token\ntest_match:function (match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n// return next match in input\nnext:function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n// return next match that has a token\nlex:function lex() {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\nbegin:function begin(condition) {\n        this.conditionStack.push(condition);\n    },\n\n// pop the previously active lexer condition state off the condition stack\npopState:function popState() {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n// produce the lexer rule set which is active for the currently active lexer condition state\n_currentRules:function _currentRules() {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\ntopState:function topState(n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n// alias for begin(condition)\npushState:function pushState(condition) {\n        this.begin(condition);\n    },\n\n// return the number of states currently on the stack\nstateStackSize:function stateStackSize() {\n        return this.conditionStack.length;\n    },\noptions: {},\nperformAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\nvar YYSTATE=YY_START;\nswitch($avoiding_name_collisions) {\ncase 0:return 26;\nbreak;\ncase 1:return 26;\nbreak;\ncase 2:return 26; // regexp with braces or quotes (and no spaces)\nbreak;\ncase 3:return 26;\nbreak;\ncase 4:return 26;\nbreak;\ncase 5:return 26;\nbreak;\ncase 6:return 26;\nbreak;\ncase 7:yy.depth++; return 22\nbreak;\ncase 8:yy.depth == 0 ? this.begin('trail') : yy.depth--; return 24\nbreak;\ncase 9:return 12;\nbreak;\ncase 10:this.popState(); return 29;\nbreak;\ncase 11:return 31;\nbreak;\ncase 12:return 30;\nbreak;\ncase 13:/* */\nbreak;\ncase 14:/* */\nbreak;\ncase 15:this.begin('indented')\nbreak;\ncase 16:this.begin('code'); return 5\nbreak;\ncase 17:return 56\nbreak;\ncase 18:yy.options[yy_.yytext] = true\nbreak;\ncase 19:this.begin('INITIAL')\nbreak;\ncase 20:this.begin('INITIAL')\nbreak;\ncase 21:/* empty */\nbreak;\ncase 22:return 18\nbreak;\ncase 23:this.begin('INITIAL')\nbreak;\ncase 24:this.begin('INITIAL')\nbreak;\ncase 25:/* empty */\nbreak;\ncase 26:this.begin('rules')\nbreak;\ncase 27:yy.depth = 0; this.begin('action'); return 22\nbreak;\ncase 28:this.begin('trail'); yy_.yytext = yy_.yytext.substr(2, yy_.yytext.length-4);return 11\nbreak;\ncase 29:yy_.yytext = yy_.yytext.substr(2, yy_.yytext.length-4); return 11\nbreak;\ncase 30:this.begin('rules'); return 11\nbreak;\ncase 31:/* ignore */\nbreak;\ncase 32:/* ignore */\nbreak;\ncase 33:/* */\nbreak;\ncase 34:/* */\nbreak;\ncase 35:return 12;\nbreak;\ncase 36:yy_.yytext = yy_.yytext.replace(/\\\\\"/g,'\"'); return 55;\nbreak;\ncase 37:yy_.yytext = yy_.yytext.replace(/\\\\'/g,\"'\"); return 55;\nbreak;\ncase 38:return 33;\nbreak;\ncase 39:return 52;\nbreak;\ncase 40:return 38;\nbreak;\ncase 41:return 38;\nbreak;\ncase 42:return 38;\nbreak;\ncase 43:return 36;\nbreak;\ncase 44:return 37;\nbreak;\ncase 45:return 39;\nbreak;\ncase 46:return 30;\nbreak;\ncase 47:return 40;\nbreak;\ncase 48:return 47;\nbreak;\ncase 49:return 31;\nbreak;\ncase 50:return 48;\nbreak;\ncase 51:this.begin('conditions'); return 27;\nbreak;\ncase 52:return 42;\nbreak;\ncase 53:return 41;\nbreak;\ncase 54:return 53;\nbreak;\ncase 55:yy_.yytext = yy_.yytext.replace(/^\\\\/g,''); return 53;\nbreak;\ncase 56:return 48;\nbreak;\ncase 57:return 46;\nbreak;\ncase 58:yy.options = {}; this.begin('options');\nbreak;\ncase 59:this.begin('start_condition'); return 14;\nbreak;\ncase 60:this.begin('start_condition'); return 16;\nbreak;\ncase 61:this.begin('rules'); return 5;\nbreak;\ncase 62:return 54;\nbreak;\ncase 63:return 51;\nbreak;\ncase 64:return 22;\nbreak;\ncase 65:return 24;\nbreak;\ncase 66:/* ignore bad characters */\nbreak;\ncase 67:return 8;\nbreak;\ncase 68:return 9;\nbreak;\n}\n},\nrules: [/^(?:\\/\\*(.|\\n|\\r)*?\\*\\/)/,/^(?:\\/\\/.*)/,/^(?:\\/[^ /]*?['\"{}'][^ ]*?\\/)/,/^(?:\"(\\\\\\\\|\\\\\"|[^\"])*\")/,/^(?:'(\\\\\\\\|\\\\'|[^'])*')/,/^(?:[/\"'][^{}/\"']+)/,/^(?:[^{}/\"']+)/,/^(?:\\{)/,/^(?:\\})/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:>)/,/^(?:,)/,/^(?:\\*)/,/^(?:(\\r\\n|\\n|\\r)+)/,/^(?:\\s+(\\r\\n|\\n|\\r)+)/,/^(?:\\s+)/,/^(?:%%)/,/^(?:[a-zA-Z0-9_]+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:(\\r\\n|\\n|\\r)+)/,/^(?:\\s+(\\r\\n|\\n|\\r)+)/,/^(?:\\s+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:(\\r\\n|\\n|\\r)+)/,/^(?:\\s+(\\r\\n|\\n|\\r)+)/,/^(?:\\s+)/,/^(?:.*(\\r\\n|\\n|\\r)+)/,/^(?:\\{)/,/^(?:%\\{(.|(\\r\\n|\\n|\\r))*?%\\})/,/^(?:%\\{(.|(\\r\\n|\\n|\\r))*?%\\})/,/^(?:.+)/,/^(?:\\/\\*(.|\\n|\\r)*?\\*\\/)/,/^(?:\\/\\/.*)/,/^(?:(\\r\\n|\\n|\\r)+)/,/^(?:\\s+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:\"(\\\\\\\\|\\\\\"|[^\"])*\")/,/^(?:'(\\\\\\\\|\\\\'|[^'])*')/,/^(?:\\|)/,/^(?:\\[(\\\\\\\\|\\\\\\]|[^\\]])*\\])/,/^(?:\\(\\?:)/,/^(?:\\(\\?=)/,/^(?:\\(\\?!)/,/^(?:\\()/,/^(?:\\))/,/^(?:\\+)/,/^(?:\\*)/,/^(?:\\?)/,/^(?:\\^)/,/^(?:,)/,/^(?:<<EOF>>)/,/^(?:<)/,/^(?:\\/!)/,/^(?:\\/)/,/^(?:\\\\([0-7]{1,3}|[rfntvsSbBwWdD\\\\*+()${}|[\\]\\/.^?]|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}))/,/^(?:\\\\.)/,/^(?:\\$)/,/^(?:\\.)/,/^(?:%options\\b)/,/^(?:%s\\b)/,/^(?:%x\\b)/,/^(?:%%)/,/^(?:\\{\\d+(,\\s?\\d+|,)?\\})/,/^(?:\\{([a-zA-Z_][a-zA-Z0-9_-]*)\\})/,/^(?:\\{)/,/^(?:\\})/,/^(?:.)/,/^(?:$)/,/^(?:(.|(\\r\\n|\\n|\\r))+)/],\nconditions: {\"code\":{\"rules\":[67,68],\"inclusive\":false},\"start_condition\":{\"rules\":[22,23,24,25,67],\"inclusive\":false},\"options\":{\"rules\":[18,19,20,21,67],\"inclusive\":false},\"conditions\":{\"rules\":[9,10,11,12,67],\"inclusive\":false},\"action\":{\"rules\":[0,1,2,3,4,5,6,7,8,67],\"inclusive\":false},\"indented\":{\"rules\":[27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],\"inclusive\":true},\"trail\":{\"rules\":[26,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],\"inclusive\":true},\"rules\":{\"rules\":[13,14,15,16,17,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],\"inclusive\":true},\"INITIAL\":{\"rules\":[29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],\"inclusive\":true}}\n};\nreturn lexer;\n})();\nparser.lexer = lexer;\nfunction Parser () {\n  this.yy = {};\n}\nParser.prototype = parser;parser.Parser = Parser;\nreturn new Parser;\n})();\n\n\nif (true) {\nexports.parser = lex;\nexports.Parser = lex.Parser;\nexports.parse = function () { return lex.parse.apply(lex, arguments); };\nexports.main = function commonjsMain(args) {\n    if (!args[1]) {\n        console.log('Usage: '+args[0]+' FILE');\n        process.exit(1);\n    }\n    var source = __webpack_require__(/*! fs */ \"./node_modules/node-libs-browser/mock/empty.js\").readFileSync(__webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\").normalize(args[1]), \"utf8\");\n    return exports.parser.parse(source);\n};\nif ( true && __webpack_require__.c[__webpack_require__.s] === module) {\n  exports.main(process.argv.slice(1));\n}\n}\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ \"./node_modules/process/browser.js\"), __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./node_modules/lex-parser/lex-parser.js?");

/***/ }),

/***/ "./node_modules/node-libs-browser/mock/empty.js":
/*!******************************************************!*\
  !*** ./node_modules/node-libs-browser/mock/empty.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\n\n//# sourceURL=webpack:///./node_modules/node-libs-browser/mock/empty.js?");

/***/ }),

/***/ "./node_modules/path-browserify/index.js":
/*!***********************************************!*\
  !*** ./node_modules/path-browserify/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,\n// backported and transplited with Babel, with backwards-compat fixes\n\n// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length - 1; i >= 0; i--) {\n    var last = parts[i];\n    if (last === '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\n  var resolvedPath = '',\n      resolvedAbsolute = false;\n\n  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {\n    var path = (i >= 0) ? arguments[i] : process.cwd();\n\n    // Skip empty and invalid entries\n    if (typeof path !== 'string') {\n      throw new TypeError('Arguments to path.resolve must be strings');\n    } else if (!path) {\n      continue;\n    }\n\n    resolvedPath = path + '/' + resolvedPath;\n    resolvedAbsolute = path.charAt(0) === '/';\n  }\n\n  // At this point the path should be resolved to a full absolute path, but\n  // handle relative paths to be safe (might happen when process.cwd() fails)\n\n  // Normalize the path\n  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\n  var isAbsolute = exports.isAbsolute(path),\n      trailingSlash = substr(path, -1) === '/';\n\n  // Normalize the path\n  path = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n\n  return (isAbsolute ? '/' : '') + path;\n};\n\n// posix version\nexports.isAbsolute = function(path) {\n  return path.charAt(0) === '/';\n};\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    if (typeof p !== 'string') {\n      throw new TypeError('Arguments to path.join must be strings');\n    }\n    return p;\n  }).join('/'));\n};\n\n\n// path.relative(from, to)\n// posix version\nexports.relative = function(from, to) {\n  from = exports.resolve(from).substr(1);\n  to = exports.resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n};\n\nexports.sep = '/';\nexports.delimiter = ':';\n\nexports.dirname = function (path) {\n  if (typeof path !== 'string') path = path + '';\n  if (path.length === 0) return '.';\n  var code = path.charCodeAt(0);\n  var hasRoot = code === 47 /*/*/;\n  var end = -1;\n  var matchedSlash = true;\n  for (var i = path.length - 1; i >= 1; --i) {\n    code = path.charCodeAt(i);\n    if (code === 47 /*/*/) {\n        if (!matchedSlash) {\n          end = i;\n          break;\n        }\n      } else {\n      // We saw the first non-path separator\n      matchedSlash = false;\n    }\n  }\n\n  if (end === -1) return hasRoot ? '/' : '.';\n  if (hasRoot && end === 1) {\n    // return '//';\n    // Backwards-compat fix:\n    return '/';\n  }\n  return path.slice(0, end);\n};\n\nfunction basename(path) {\n  if (typeof path !== 'string') path = path + '';\n\n  var start = 0;\n  var end = -1;\n  var matchedSlash = true;\n  var i;\n\n  for (i = path.length - 1; i >= 0; --i) {\n    if (path.charCodeAt(i) === 47 /*/*/) {\n        // If we reached a path separator that was not part of a set of path\n        // separators at the end of the string, stop now\n        if (!matchedSlash) {\n          start = i + 1;\n          break;\n        }\n      } else if (end === -1) {\n      // We saw the first non-path separator, mark this as the end of our\n      // path component\n      matchedSlash = false;\n      end = i + 1;\n    }\n  }\n\n  if (end === -1) return '';\n  return path.slice(start, end);\n}\n\n// Uses a mixed approach for backwards-compatibility, as ext behavior changed\n// in new Node.js versions, so only basename() above is backported here\nexports.basename = function (path, ext) {\n  var f = basename(path);\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\nexports.extname = function (path) {\n  if (typeof path !== 'string') path = path + '';\n  var startDot = -1;\n  var startPart = 0;\n  var end = -1;\n  var matchedSlash = true;\n  // Track the state of characters (if any) we see before our first dot and\n  // after any path separator we find\n  var preDotState = 0;\n  for (var i = path.length - 1; i >= 0; --i) {\n    var code = path.charCodeAt(i);\n    if (code === 47 /*/*/) {\n        // If we reached a path separator that was not part of a set of path\n        // separators at the end of the string, stop now\n        if (!matchedSlash) {\n          startPart = i + 1;\n          break;\n        }\n        continue;\n      }\n    if (end === -1) {\n      // We saw the first non-path separator, mark this as the end of our\n      // extension\n      matchedSlash = false;\n      end = i + 1;\n    }\n    if (code === 46 /*.*/) {\n        // If this is our first dot, mark it as the start of our extension\n        if (startDot === -1)\n          startDot = i;\n        else if (preDotState !== 1)\n          preDotState = 1;\n    } else if (startDot !== -1) {\n      // We saw a non-dot and non-path separator before our dot, so we should\n      // have a good chance at having a non-empty extension\n      preDotState = -1;\n    }\n  }\n\n  if (startDot === -1 || end === -1 ||\n      // We saw a non-dot character immediately before the dot\n      preDotState === 0 ||\n      // The (right-most) trimmed path component is exactly '..'\n      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {\n    return '';\n  }\n  return path.slice(startDot, end);\n};\n\nfunction filter (xs, f) {\n    if (xs.filter) return xs.filter(f);\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (f(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// String.prototype.substr - negative index don't work in IE8\nvar substr = 'ab'.substr(-1) === 'b'\n    ? function (str, start, len) { return str.substr(start, len) }\n    : function (str, start, len) {\n        if (start < 0) start = str.length + start;\n        return str.substr(start, len);\n    }\n;\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ \"./node_modules/process/browser.js\")))\n\n//# sourceURL=webpack:///./node_modules/path-browserify/index.js?");

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// shim for using process in browser\nvar process = module.exports = {};\n\n// cached from whatever global is present so that test runners that stub it\n// don't break things.  But we need to wrap it in a try catch in case it is\n// wrapped in strict mode code which doesn't define any globals.  It's inside a\n// function because try/catches deoptimize in certain engines.\n\nvar cachedSetTimeout;\nvar cachedClearTimeout;\n\nfunction defaultSetTimout() {\n    throw new Error('setTimeout has not been defined');\n}\nfunction defaultClearTimeout () {\n    throw new Error('clearTimeout has not been defined');\n}\n(function () {\n    try {\n        if (typeof setTimeout === 'function') {\n            cachedSetTimeout = setTimeout;\n        } else {\n            cachedSetTimeout = defaultSetTimout;\n        }\n    } catch (e) {\n        cachedSetTimeout = defaultSetTimout;\n    }\n    try {\n        if (typeof clearTimeout === 'function') {\n            cachedClearTimeout = clearTimeout;\n        } else {\n            cachedClearTimeout = defaultClearTimeout;\n        }\n    } catch (e) {\n        cachedClearTimeout = defaultClearTimeout;\n    }\n} ())\nfunction runTimeout(fun) {\n    if (cachedSetTimeout === setTimeout) {\n        //normal enviroments in sane situations\n        return setTimeout(fun, 0);\n    }\n    // if setTimeout wasn't available but was latter defined\n    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {\n        cachedSetTimeout = setTimeout;\n        return setTimeout(fun, 0);\n    }\n    try {\n        // when when somebody has screwed with setTimeout but no I.E. maddness\n        return cachedSetTimeout(fun, 0);\n    } catch(e){\n        try {\n            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally\n            return cachedSetTimeout.call(null, fun, 0);\n        } catch(e){\n            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error\n            return cachedSetTimeout.call(this, fun, 0);\n        }\n    }\n\n\n}\nfunction runClearTimeout(marker) {\n    if (cachedClearTimeout === clearTimeout) {\n        //normal enviroments in sane situations\n        return clearTimeout(marker);\n    }\n    // if clearTimeout wasn't available but was latter defined\n    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {\n        cachedClearTimeout = clearTimeout;\n        return clearTimeout(marker);\n    }\n    try {\n        // when when somebody has screwed with setTimeout but no I.E. maddness\n        return cachedClearTimeout(marker);\n    } catch (e){\n        try {\n            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally\n            return cachedClearTimeout.call(null, marker);\n        } catch (e){\n            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.\n            // Some versions of I.E. have different rules for clearTimeout vs setTimeout\n            return cachedClearTimeout.call(this, marker);\n        }\n    }\n\n\n\n}\nvar queue = [];\nvar draining = false;\nvar currentQueue;\nvar queueIndex = -1;\n\nfunction cleanUpNextTick() {\n    if (!draining || !currentQueue) {\n        return;\n    }\n    draining = false;\n    if (currentQueue.length) {\n        queue = currentQueue.concat(queue);\n    } else {\n        queueIndex = -1;\n    }\n    if (queue.length) {\n        drainQueue();\n    }\n}\n\nfunction drainQueue() {\n    if (draining) {\n        return;\n    }\n    var timeout = runTimeout(cleanUpNextTick);\n    draining = true;\n\n    var len = queue.length;\n    while(len) {\n        currentQueue = queue;\n        queue = [];\n        while (++queueIndex < len) {\n            if (currentQueue) {\n                currentQueue[queueIndex].run();\n            }\n        }\n        queueIndex = -1;\n        len = queue.length;\n    }\n    currentQueue = null;\n    draining = false;\n    runClearTimeout(timeout);\n}\n\nprocess.nextTick = function (fun) {\n    var args = new Array(arguments.length - 1);\n    if (arguments.length > 1) {\n        for (var i = 1; i < arguments.length; i++) {\n            args[i - 1] = arguments[i];\n        }\n    }\n    queue.push(new Item(fun, args));\n    if (queue.length === 1 && !draining) {\n        runTimeout(drainQueue);\n    }\n};\n\n// v8 likes predictible objects\nfunction Item(fun, array) {\n    this.fun = fun;\n    this.array = array;\n}\nItem.prototype.run = function () {\n    this.fun.apply(null, this.array);\n};\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\nprocess.version = ''; // empty string to avoid regexp issues\nprocess.versions = {};\n\nfunction noop() {}\n\nprocess.on = noop;\nprocess.addListener = noop;\nprocess.once = noop;\nprocess.off = noop;\nprocess.removeListener = noop;\nprocess.removeAllListeners = noop;\nprocess.emit = noop;\nprocess.prependListener = noop;\nprocess.prependOnceListener = noop;\n\nprocess.listeners = function (name) { return [] }\n\nprocess.binding = function (name) {\n    throw new Error('process.binding is not supported');\n};\n\nprocess.cwd = function () { return '/' };\nprocess.chdir = function (dir) {\n    throw new Error('process.chdir is not supported');\n};\nprocess.umask = function() { return 0; };\n\n\n//# sourceURL=webpack:///./node_modules/process/browser.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function() {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/module.js?");

/***/ }),

/***/ "./src/misc/pack-jison.js":
/*!********************************!*\
  !*** ./src/misc/pack-jison.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("jb.jisonParser = __webpack_require__(/*! jison */ \"./node_modules/jison/lib/jison.js\");\n\n//# sourceURL=webpack:///./src/misc/pack-jison.js?");

/***/ })

/******/ });;


jb.component('jison.parse', {
  type: 'data',
  params: [
    { id: 'parser', type: 'jison.parser', mandatory: true, defaultValue: {$: 'jison.parser', lex: [], bnf: [] } },
    { id: 'goal', as : 'string' },
    { id: 'text', as : 'string', defaultValue: '%%' },
    { id: 'debug', as : 'boolean' },
  ],
  impl: (ctx,parser,goal,text,debug) => {
    try {
      if (!jb.jison) { // initialize
        jb.jison = { buffer : ''};
        jb.jisonParser.print = txt => jb.jison.buffer += txt;
      }
      jb.jison.buffer = '';
      if (goal)
        parser.bnf = Object.assign({goal: [[`${goal} EOF`, 'return $1']]},parser.bnf);

      // cache parser
      jb['jison-parser-'+ctx.path] = jb['jison-parser-'+ctx.path] || jb.jisonParser.Parser(parser,{debug: debug});
          
      return  { result: jb['jison-parser-'+ctx.path].parse(text) }
    } catch (e) {
      return { error: e, message: e.message, console: jb.jison.buffer }
//      jb.logException('jison',e,ctx)
    }
  }
})

jb.component('jison.parser', {
  type: 'jison.parser', // singleInType: true,
  params: [
    { id: 'lex', type : 'lexer-rule[]', as : 'array', defaultValue: [] },
    { id: 'bnf', type : 'bnf-expression[]', as : 'array', defaultValue: [] },
    { id: 'operators', type : 'data[]', as : 'array', defaultValue: [], description: '[["left", "+", "-"]]' },
//    { id: 'basedOn', type : 'jison.parser' },
  ],
  impl: (ctx,lexRules,bnf,operators) => {
    var bnfRules = {};
    var flattenRules = [].concat.apply(lexRules.filter(x=>x).filter(x=>!Array.isArray(x[0])), lexRules.filter(x=>x).filter(x=>Array.isArray(x[0])));
    bnf.filter(x=>x).forEach(e=>bnfRules[e.id] = e.options);
    return { lex: {rules: flattenRules } , bnf: bnfRules, operators: operators};
    // var base = basedOn || { lex: {rules:[]}, bnf: {}, operators: []};
    // return { lex: {rules: flattenRules.concat(base.lex.rules) } , bnf: Object.assign({},bnfRules,base.bnf), operators: operators.concat(base.operators)};
  }
})

jb.component('lexer.tokens', {
  type: 'lexer-rule',
  params: [
    { id: 'tokens', as: 'string', mandatory: true, description: 'e.g. -,+,*,%,for,=='},
  ],
  impl: (ctx,tokens) => tokens.split(',')
    .map(x=>
      [ ('()[]{}+-*/%'.indexOf(x) == -1 ? x : `\\${x}`) ,`return '${x}';`])
})

jb.component('lexer.ignoreWhiteSpace', {
  type: 'lexer-rule',
  impl: ctx => ['\\s+','']
})

jb.component('lexer.number', {
  type: 'lexer-rule',
  impl: ctx => ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER';"]
})

jb.component('lexer.identifier', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', defaultValue: '[a-zA-Z_][a-zA-Z_0-9]*'},
  ],
  impl: (ctx,regex) => [regex, "return 'IDEN';"]
})

jb.component('lexer.EOF', {
  type: 'lexer-rule',
  impl: ctx => ["$","return 'EOF';"]
})

jb.component('lexerRule', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', mandatory: true, description: '[a-f0-9]+'},
    { id: 'result', as: 'string', mandatory: true, description: "return 'Hex';"},
  ],
  impl: (ctx,regex,result) => [regex,result]
})

jb.component('bnfExpression', {
  type: 'bnf-expression', //singleInType: true,
  params: [
    { id: 'id', as: 'string', mandatory: true},
    { id: 'options', type: 'expression-option[]', mandatory: true, as: 'array', defaultValue: [] },
  ],
  impl: ctx => ({ id: ctx.params.id, options: ctx.params.options.filter(x=>x) })
})

jb.component('expressionOption', {
  type: 'expression-option', //singleInType: true,
  params: [
    { id: 'syntax', as: 'string', mandatory: true, description: 'e + e'},
    { id: 'calculate', as: 'string', mandatory: true, description: '$$ = $1 + $2;' },
  ],
  impl: ctx => jb.entries(ctx.params).map(e=>e[1]).filter(x=>x)
})
;


//used mostley for deubgging
jb.stringWithSourceRef = function(ctx,pathToConstStr,offset,to) {
  this.ctx = ctx;this.pathToConstStr = pathToConstStr;
  this.offset = offset;this.to = to;
  this.val = ctx.exp(`%$${pathToConstStr}%`,'string').substring(offset,to);
  jb.debugInfo = jb.debugInfo || { in: [], out: []};
  jb.debugInfo.in.push(this);
}
jb.stringWithSourceRef.prototype.$jb_val = function() {
  return this.val;
}
jb.stringWithSourceRef.prototype.substring = function(from,new_to) {
  const to = typeof new_to == 'undefined' ? this.to : this.offset + new_to;
  return new jb.stringWithSourceRef(this.ctx,this.pathToConstStr,this.offset+from,to)
}
jb.stringWithSourceRef.prototype.trim = function() {
  if (this.val == this.val.trim()) return this;
  const left = (this.val.match(/^\s+/)||[''])[0].length;
  const right = (this.val.match(/\s+$/)||[''])[0].length;

  return new jb.stringWithSourceRef(this.ctx,this.pathToConstStr,this.offset+left,this.to-right)
}

jb.jstypes['string-with-source-ref'] = v => v;

jb.component('extractText', {
  description: 'text breaking according to begin/end markers',
  params: [
    {id: 'text', as: 'string-with-source-ref', defaultValue: '%%'},
    {id: 'startMarkers', type: 'data[]', as: 'array', mandatory: true},
    {id: 'endMarker', as: 'string'},
    {id: 'includingStartMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'includingEndMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'repeating', as: 'boolean', type: 'boolean', description: 'apply the markers repeatingly'},
    {id: 'noTrim', as: 'boolean', type: 'boolean'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in markers'},
    {id: 'exclude', as: 'boolean', type: 'boolean', description: 'return the inverse result. E.g. exclude remarks'}
  ],
  impl: (ctx,textRef,startMarkers,endMarker,includingStartMarker,includingEndMarker,repeating,noTrim,regex,exclude) => {
    const text = jb.tostring(textRef);
	  let findMarker = (marker, startpos) => {
      const pos = text.indexOf(marker,startpos);
      if (pos != -1)
        return { pos: pos, end: pos + marker.length}
    }
	  if (regex)
		  findMarker = (marker, startpos) => {
	  		let len = 0, pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		const str = text.substring(startpos);
		  		const marker_regex = new RegExp(marker,'m');
          pos = str.search(marker_regex);
		    	if (pos > -1) {
		    		const match = str.match(marker_regex)[0];
            len = match ? match.length : 0;
            if (len)
              return { pos: pos+startpos, end: pos+ startpos+len };
		    	}
	  		} catch(e) {} // probably regex exception
	  }

    function findStartMarkers(startpos) {
      let firstMarkerPos,markerPos;
      for(let i=0; i<startMarkers.length; i++) {
        const marker = startMarkers[i];
        markerPos = findMarker(marker,markerPos ? markerPos.end : startpos);
        if (!markerPos) return;
        if (i==0)
          firstMarkerPos = markerPos;
      }
      return firstMarkerPos && { pos: firstMarkerPos.pos, end: markerPos.end }
    }

    let out = { match: [], unmatch: []},pos =0,start=null;
    while(start = findStartMarkers(pos)) {
        let end = endMarker ? findMarker(endMarker,start.end) : findStartMarkers(start.end)
        if (!end) // if end not found use end of text
          end = { pos : text.length, end: text.length }
        const start_match = includingStartMarker ? start.pos : start.end;
        const end_match = includingEndMarker ? end.end : end.pos;
        if (pos != start_match) out.unmatch.push(textRef.substring(pos,start_match));
        out.match.push(textRef.substring(start_match,end_match));
        if (end_match != end.end) out.unmatch.push(textRef.substring(end_match,end.end));
        pos = endMarker ? end.end : end.pos;
    }
    out.unmatch.push(textRef.substring(pos));
    if (!noTrim) {
      out.match = out.match.map(x=>x.trim());
      out.unmatch = out.unmatch.map(x=>x.trim());
    }
    const res = exclude ? out.unmatch : out.match;
    return repeating ? res : res[0];
  }
})

jb.component('breakText', {
  description: 'recursive text breaking according to multi level separators',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'separators', as: 'array', mandatory: true, defaultValue: [], description: 'multi level separators'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in separators'}
  ],
  impl: (ctx,text,separators,regex) => {
	  let findMarker = (text,marker, startpos) => {
      const pos = text.indexOf(marker,startpos);
      if (pos != -1)
        return { pos: pos, end: pos + marker.length}
    }
	  if (regex)
		  findMarker = (text,marker, startpos) => {
	  		let len = 0, pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		const str = text.substring(startpos);
		  		const marker_regex = new RegExp(marker,'m');
          pos = str.search(marker_regex);
		    	if (pos > -1) {
		    		const match = str.match(marker_regex)[0];
            len = match ? match.length : 0;
            if (len)
              return { pos: pos+startpos, end: pos+ startpos+len };
		    	}
	  		} catch(e) {} // probably regex exception
    }

    var result = [text];
    separators.forEach(sep=> result = recursiveSplit(result,sep));
    return result[0];

    function recursiveSplit(input,separator) {
      if (Array.isArray(input))
        return input.map(item=>recursiveSplit(item,separator))
      if (typeof input == 'string')
        return doSplit(input,separator)
    }

    function doSplit(text,separator) {
      let out = [],pos =0,found=null;
      while(found = findMarker(text,separator,pos)) {
        out.push(text.substring(pos,found.pos));
        pos = found.end;
      }
      out.push(text.substring(pos));
      return out;
    }
  }
})


jb.component('zipArrays', {
  type: 'data',
  description: '[[1,2],[10,20],[100,200]] => [[1,10,100],[2,20,200]]',
  params: [
    {id: 'value', description: 'array of arrays', as: 'array', mandatory: true}
  ],
  impl: (ctx,value) =>
    value[0].map((x,i)=>
      value.map(line=>line[i]))
})

jb.component('removeSections', {
  description: 'remove sections between markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarker', as: 'string', mandatory: true},
    {id: 'endMarker', as: 'string', mandatory: true},
    {id: 'keepEndMarker', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,text,startMarker,endMarker,keepEndMarker) => {
    let out = text,range = null;
    if (!startMarker || !endMarker) return out;
    do {
      range = findRange(out);
      if (range)
        out = out.substring(0,range.from) + out.substring(range.to || out.length)
    } while (range && out);
    return out;

    function findRange(txt) {
      const start = txt.indexOf(startMarker);
      if (start == -1) return;
      const end = txt.indexOf(endMarker,start) + (keepEndMarker ? 0 : endMarker.length);
      if (end == -1) return;
      return { from: start, to: end}
    }
  }
})

jb.component('merge', {
  type: 'data',
  description: 'assign, merge object properties',
  params: [
    {id: 'objects', as: 'array', mandatory: true}
  ],
  impl: (ctx,objects) =>
		Object.assign.apply({},objects)
})

jb.component('dynamicObject', {
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

jb.component('filterEmptyProperties', {
  type: 'data',
  description: 'remove null or empty string properties',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,obj) => {
    if (typeof obj != 'object') return obj;
    const propsToKeep = Object.getOwnPropertyNames(obj)
      .filter(p=>obj[p] != null && obj[p] != '' && (!Array.isArray(obj[p]) || obj[p].length > 0));
    let res = {};
    propsToKeep.forEach(p=>res[p]=obj[p]);
    return res;
  }
})

jb.component('trim', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) => text.trim()
})

jb.component('removePrefixRegex', {
  params: [
    {id: 'prefix', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,prefix,text) =>
    text.replace(new RegExp('^'+prefix) ,'')
})

jb.component('wrapAsObject', {
  description: 'object from entries, map each item as a property',
  type: 'aggregator',
  params: [
    {id: 'propertyName', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,key,value,items) => {
    let out = {}
    items.forEach(item=>out[jb.tostring(key(ctx.setData(item)))] = value(ctx.setData(item)))
    return out;
  }
})

jb.component('writeValueAsynch', {
  type: 'action',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true}
  ],
  impl: (ctx,to,value) =>
		Promise.resolve(jb.val(value)).then(val=>jb.writeValue(to,val,ctx))
});

