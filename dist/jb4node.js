var jb = (function() {
function jb_run(context,parentParam,settings) {
  try {
    const profile = context.profile;
    if (context.probe && (!settings || !settings.noprobe)) {
      if (context.probe.pathToTrace.indexOf(context.path) == 0)
        return context.probe.record(context,parentParam)
    }
    if (profile == null || (typeof profile == 'object' && profile.$disabled))
      return castToParam(null,parentParam);

    if (profile.$debugger == 0) debugger;
    if (profile.$asIs) return profile.$asIs;
    if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
        parentParam.as = 'array';

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
      return;
    const contextWithVars = extendWithVars(context,profile.$vars);
    const run = prepare(contextWithVars,parentParam);
    const jstype = parentParam && parentParam.as;
    context.parentParam = parentParam;
    switch (run.type) {
      case 'booleanExp': return bool_expression(profile, context);
      case 'expression': return castToParam(expression(profile, context,parentParam), parentParam);
      case 'asIs': return profile;
      case 'object': return entriesToObject(entries(profile).map(e=>[e[0],contextWithVars.runInner(e[1],null,e[0])]));
      case 'function': return castToParam(profile(context),parentParam);
      case 'null': return castToParam(null,parentParam);
      case 'ignore': return context.data;
      case 'list': return profile.map((inner,i) =>
            contextWithVars.runInner(inner,null,i));
      case 'runActions': return jb.comps.runActions.impl(new jbCtx(contextWithVars,{profile: { actions : profile },path:''}));
      case 'if': {
          const cond = jb_run(run.ifContext, run.IfParentParam);
          if (cond && cond.then)
            return cond.then(res=>
              res ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam))
          return cond ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);
      }
      case 'profile':
        if (!run.impl)
          run.ctx.callerPath = context.path;

        run.preparedParams.forEach(paramObj => {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
            case 'array': run.ctx.params[paramObj.name] =
                paramObj.array.map((prof,i) =>
                  jb_run(new jbCtx(run.ctx,{profile: prof, forcePath: context.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param))
                  //run.ctx.runInner(prof, paramObj.param, paramObj.path+'~'+i) )
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] =
              jb_run(new jbCtx(run.ctx,{profile: paramObj.prof, forcePath: context.path + '~' + paramObj.path, path: ''}), paramObj.param);
            //run.ctx.runInner(paramObj.prof, paramObj.param, paramObj.path)
            //jb_run(paramObj.context, paramObj.param);
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
          console.log(profile.$log === true ? out : contextWithVars.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + context.path,context,out,run);

        return castToParam(out,parentParam);
    }
  } catch (e) {
    if (context.vars.$throw) throw e;
    logException(e,'exception while running run');
  }

  function prepareGCArgs(ctx,preparedParams) {
    const delayed = preparedParams.filter(param => {
      const v = ctx.params[param.name] || {};
      return (v.then || v.subscribe ) && param.param.as != 'observable'
    });
    if (delayed.length == 0 || typeof Observable == 'undefined')
      return [ctx].concat(preparedParams.map(param=>ctx.params[param.name]))

    return Observable.from(preparedParams)
        .concatMap(param=>
          ctx.params[param.name])
        .toArray()
        .map(x=>
          [ctx].concat(x))
        .toPromise()
  }
}

function extendWithVars(context,vars) {
  if (!vars) return context;
  let res = context;
  for(let varname in vars || {})
    res = new jbCtx(res,{ vars: jb.obj(varname,res.runInner(vars[varname], null,'$vars~'+varname)) });
  return res;
}

function compParams(comp) {
  if (!comp || !comp.params)
    return [];
  return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>extend(x[1],jb.obj('id',x[0])));
}

function prepareParams(comp,profile,ctx) {
  return compParams(comp)
    .filter(comp=>
      !comp.ignore)
    .map((param,index) => {
      const p = param.id, sugar = sugarProp(profile);
      let val = profile[p], path =p;
      if (!val && index == 0 && sugar) {
        path = sugar[0];
        val = sugar[1];
      }
      const valOrDefault = (typeof val != "undefined" && val != null) ? val : (typeof param.defaultValue != 'undefined' ? param.defaultValue : null);
      const valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
      const arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

      if (param.dynamic) {
        const outerFunc = runCtx => {
          let func;
          if (arrayParam)
            func = (ctx2,data2) =>
              jb.flattenArray(valOrDefaultArray.map((prof,i)=>
                runCtx.extendVars(ctx2,data2).runInner(prof,param,path+'~'+i)))
          else
            func = (ctx2,data2) =>
                  valOrDefault != null ? runCtx.extendVars(ctx2,data2).runInner(valOrDefault,param,path) : valOrDefault;

          Object.defineProperty(func, "name", { value: p }); // for debug
          func.profile = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
          func.srcPath = ctx.path;
          return func;
        }
        return { name: p, type: 'function', outerFunc: outerFunc, path: path, param: param };
      }

      if (arrayParam) // array of profiles
        return { name: p, type: 'array', array: valOrDefaultArray, param: Object.assign({},param,{type:param.type.split('[')[0],as:null}), path: path };
      else
        return { name: p, type: 'run', prof: valOrDefault, param: param, path: path }; // context: new jbCtx(ctx,{profile: valOrDefault, path: p}),
  })
}

function prepare(context,parentParam) {
  const profile = context.profile;
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
      ifContext: new jbCtx(context,{profile: profile.$if || profile.condition, path: '$if'}),
      IfParentParam: { type: 'boolean', as:'boolean' },
      thenContext: new jbCtx(context,{profile: profile.then || 0 , path: '~then'}),
      thenParentParam: { type: parentParam_type, as:jstype },
      elseContext: new jbCtx(context,{profile: profile['else'] || 0 , path: '~else'}),
      elseParentParam: { type: parentParam_type, as:jstype }
    }
  const comp_name = compName(profile,parentParam);
  if (!comp_name)
    return { type: 'asIs' }
  // if (!comp_name)
  //   return { type: 'ignore' }
  const comp = jb.comps[comp_name];
  if (!comp && comp_name) { logError('component ' + comp_name + ' is not defined'); return { type:'null' } }
  if (!comp.impl) { logError('component ' + comp_name + ' has no implementation'); return { type:'null' } }

  const ctx = new jbCtx(context,{});
  ctx.parentParam = parentParam;
  ctx.params = {}; // TODO: try to delete this line
  const preparedParams = prepareParams(comp,profile,ctx);
  if (typeof comp.impl === 'function') {
    Object.defineProperty(comp.impl, "name", { value: comp_name }); // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: ctx, preparedParams: preparedParams }
  } else
    return { type:'profile', ctx: new jbCtx(ctx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
}

function resolveFinishedPromise(val) {
  if (!val) return val;
  if (val.$jb_parent)
    val.$jb_parent = resolveFinishedPromise(val.$jb_parent);
  if (val && typeof val == 'object' && val._state == 1) // finished promise
    return val._result;
  return val;
}

function calcVar(ctx,varname,jstype) {
  let res;
  if (ctx.componentContext && typeof ctx.componentContext.params[varname] != 'undefined')
    res = ctx.componentContext.params[varname];
  else if (ctx.vars[varname] != null)
    res = ctx.vars[varname];
  else if (ctx.vars.scope && ctx.vars.scope[varname] != null)
    res = ctx.vars.scope[varname];
  else if (jb.resources && jb.resources[varname] != null)
    res = jb.resources[varname];
  else if (jb.consts && jb.consts[varname] != null)
    res = jb.consts[varname];
  if (ctx.vars.debugSourceRef && typeof res == 'string' && jstype == 'string-with-source-ref' && jb.stringWithSourceRef)
    return new jb.stringWithSourceRef(ctx,varname,0,res.length)
  return resolveFinishedPromise(res);
}

function expression(exp, context, parentParam) {
  const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as);
  exp = '' + exp;
  if (jstype == 'boolean') return bool_expression(exp, context);
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    const out = expression(exp.split('$log:')[1],context,parentParam);
    jb.comps.log.impl(context, out);
    return out;
  }
  if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp;
  // if (context && !context.ngMode)
  //   exp = exp.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (exp == '{%%}' || exp == '%%')
      return expPart('');

  if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
    return expPart(exp.substring(2,exp.length-2));

  exp = exp.replace(/{%(.*?)%}/g, function(match,contents) {
      return tostring(expPart(contents,{ as: 'string'}));
  })
  exp = exp.replace(/{\?(.*?)\?}/g, function(match,contents) {
      return tostring(conditionalExp(contents));
  })
  if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(exp.substring(1,exp.length-1));

  exp = exp.replace(/%([^%;{}\s><"']*)%/g, function(match,contents) {
      return tostring(expPart(contents,{as: 'string'}));
  })
  return exp;

  function conditionalExp(exp) {
    // check variable value - if not empty return all exp, otherwise empty
    const match = exp.match(/%([^%;{}\s><"']*)%/);
    if (match && tostring(expPart(match[1])))
      return expression(exp, context, { as: 'string' });
    else
      return '';
  }

  function expPart(expressionPart,_parentParam) {
    return resolveFinishedPromise(evalExpressionPart(expressionPart,context,_parentParam || parentParam))
  }
}


function evalExpressionPart(expressionPart,context,parentParam) {
  const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as);
  // example: %$person.name%.

  const primitiveJsType = ['string','boolean','number'].indexOf(jstype) != -1;
  // empty primitive expression - perfomance
  // if (expressionPart == "")
  //   return context.data;

  const parts = expressionPart.split(/[.\/]/);
  return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),context.data)

  function pipe(input,subExp,last,first,refHandlerArg) {
      if (subExp == '')
          return input;

      const arrayIndexMatch = subExp.match(/(.*)\[([0-9]+)\]/); // x[y]
      const refHandler = refHandlerArg || (input && input.handler) || jb.valueByRefHandler;
      if (arrayIndexMatch) {
        const arr = arrayIndexMatch[1] == "" ? val(input) : pipe(val(input),arrayIndexMatch[1],false,first,refHandler);
        const index = arrayIndexMatch[2];
        if (!Array.isArray(arr))
            return null; //jb.logError('expecting array instead of ' + typeof arr, context);

        if (last && (jstype == 'ref' || !primitiveJsType))
           return refHandler.objectProperty(arr,index);
        if (typeof arr[index] == 'undefined')
           arr[index] = last ? null : [];
        if (last && jstype)
           return jstypes[jstype](arr[index]);
        return arr[index];
     }

      const functionCallMatch = subExp.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
      if (functionCallMatch && jb.functions[functionCallMatch[1]])
        return tojstype(jb.functions[functionCallMatch[1]](context,functionCallMatch[2]),jstype,context);

      if (first && subExp.charAt(0) == '$' && subExp.length > 1)
        return calcVar(context,subExp.substr(1),jstype)
      const obj = val(input);
      if (subExp == 'length' && obj && typeof obj.length != 'undefined')
        return obj.length;
      if (Array.isArray(obj))
        return [].concat.apply([],obj.map(item=>pipe(item,subExp,last,false,refHandler)).filter(x=>x!=null));

      if (input != null && typeof input == 'object') {
        if (obj == null) return;
        if (typeof obj[subExp] === 'function' && (parentParam.dynamic || obj[subExp].profile))
            return obj[subExp](context);
        if (last && jstype == 'ref')
           return refHandler.objectProperty(obj,subExp);
        if (typeof obj[subExp] == 'undefined')
           obj[subExp] = last ? null : {};
        if (last && jstype)
            return jstypes[jstype](obj[subExp]);
        return obj[subExp];
      }
  }
}

function bool_expression(exp, context) {
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    const calculated = expression(exp.split('$log:')[1],context,{as: 'string'});
    const result = bool_expression(exp.split('$log:')[1], context);
    jb.comps.log.impl(context, calculated + ':' + result);
    return result;
  }
  if (exp.indexOf('!') == 0)
    return !bool_expression(exp.substring(1), context);
  const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    const val = jb.val(expression(exp, context));
    if (typeof val == 'boolean') return val;
    const asString = tostring(val);
    return !!asString && asString != 'false';
  }
  if (parts.length != 4)
    return logError('invalid boolean expression: ' + exp);
  const op = parts[2].trim();

  if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
    const p1 = tostring(expression(trim(parts[1]), context, {as: 'string'}))
    let p2 = tostring(expression(trim(parts[3]), context, {as: 'string'}))
    // const p1 = expression(trim(parts[1]), context, {as: 'string'});
    // const p2 = expression(trim(parts[3]), context, {as: 'string'});
    p2 = (p2.match(/^["'](.*)["']/) || [,p2])[1]; // remove quotes
    if (op == '==') return p1 == p2;
    if (op == '!=') return p1 != p2;
    if (op == '^=') return p1.lastIndexOf(p2,0) == 0; // more effecient
    if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1;
  }

  const p1 = tonumber(expression(parts[1].trim(), context));
  const p2 = tonumber(expression(parts[3].trim(), context));

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {  // trims also " and '
    return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  }
}

function castToParam(value,param) {
  let res = tojstype(value,param ? param.as : null);
  if (param && param.as == 'ref' && param.whenNotReffable && !jb.isRef(res))
    res = tojstype(value,param.whenNotReffable);
  return res;
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
    'asIs': x => x,
    'object': x => x,
    'string': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return '';
      value = val(value);
      if (typeof(value) == 'undefined') return '';
      return '' + value;
    },
    'number': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null || value == undefined) return null; // 0 is not null
      value = val(value);
      const num = Number(value,true);
      return isNaN(num) ? null : num;
    },
    'array': function(value) {
      if (typeof value == 'function' && value.profile)
        value = value();
      value = val(value);
      if (Array.isArray(value)) return value;
      if (value == null) return [];
      return [value];
    },
    'boolean': function(value) {
      if (Array.isArray(value)) value = value[0];
      return val(value) ? true : false;
    },
    'single': function(value) {
      if (Array.isArray(value))
        value = value[0];
      return val(value);
    },
    'ref': function(value) {
//      if (Array.isArray(value)) value = value[0];
//      if (value == null) return value;
      if (Array.isArray(value) && value.length == 1)
        value = value[0];
      return jb.valueByRefHandler.asRef(value);
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
  constructor(context,ctx2) {
    this.id = ctxCounter++;
    this._parent = context;
    if (typeof context == 'undefined') {
      this.vars = {};
      this.params = {};
    }
    else {
      if (ctx2.profile && ctx2.path == null) {
        debugger;
      ctx2.path = '?';
    }
      this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : context.profile;

      this.path = (context.path || '') + (ctx2.path ? '~' + ctx2.path : '');
      if (ctx2.forcePath)
        this.path = this.forcePath = ctx2.forcePath;
      if (ctx2.comp)
        this.path = ctx2.comp + '~impl';
      this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : context.data;     // allow setting of data:null
      this.vars= ctx2.vars ? Object.assign({},context.vars,ctx2.vars) : context.vars;
      this.params= ctx2.params || context.params;
      this.componentContext= (typeof ctx2.componentContext != 'undefined') ? ctx2.componentContext : context.componentContext;
      this.probe= context.probe;
    }
  }
  run(profile,parentParam) {
    return jb_run(new jbCtx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam)
  }
  exp(exp,jstype) { return expression(exp, this, {as: jstype}) }
  setVars(vars) { return new jbCtx(this,{vars: vars}) }
  setData(data) { return new jbCtx(this,{data: data}) }
  runInner(profile,parentParam, path) { return jb_run(new jbCtx(this,{profile: profile,path: path}), parentParam) }
  bool(profile) { return this.run(profile, { as: 'boolean'}) }
  // keeps the context vm and not the caller vm - needed in studio probe
  ctx(ctx2) { return new jbCtx(this,ctx2) }
  win() { // used for multi windows apps. e.g., studio
    return window
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
  parents() {
    return this._parent ? [this._parent].concat(_this.parent.parents()) : []
  }
  isParentOf(childCtx) {
    return childCtx.parents().filter(x == this).length > 0
  }

}

let logs = {};
function logError(errorStr,p1,p2,p3) {
  logs.error = logs.error || [];
  logs.error.push(errorStr);
  console.error(errorStr,p1,p2,p3);
}

function logPerformance(type,p1,p2,p3) {
//  const types = ['focus','apply','check','suggestions','writeValue','render','probe','setState'];
  if ((jb.issuesTolog || []).indexOf(type) == -1) return; // filter. TBD take from somewhere else
  console.log(type, p1 || '', p2 || '', p3 ||'');
}

function logException(e,errorStr,p1,p2,p3) {
  logError('exception: ' + errorStr + "\n" + (e.stack||''),p1,p2,p3);
}

function val(v) {
  if (v == null) return v;
  return jb.valueByRefHandler.val(v)
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
function extend(obj,obj1,obj2,obj3) {
  if (!obj) return;
  obj1 && Object.assign(obj,obj1);
  obj2 && Object.assign(obj,obj2);
  obj3 && Object.assign(obj,obj3);
  return obj;
}

const valueByRefHandlerWithjbParent = {
  val: function(v) {
    if (v.$jb_val) return v.$jb_val();
    return (v.$jb_parent) ? v.$jb_parent[v.$jb_property] : v;
  },
  writeValue: function(to,value,srcCtx) {
    jb.logPerformance('writeValue',value,to,srcCtx);
    if (!to) return;
    if (to.$jb_val)
      to.$jb_val(this.val(value))
    else if (to.$jb_parent)
      to.$jb_parent[to.$jb_property] = this.val(value);
    return to;
  },
  asRef: function(value) {
    if (value && (value.$jb_parent || value.$jb_val))
        return value;
    return { $jb_val: () => value }
  },
  isRef: function(value) {
    return value && (value.$jb_parent || value.$jb_val);
  },
  objectProperty: function(obj,prop) {
      if (this.isRef(obj[prop]))
        return obj[prop];
      else
        return { $jb_parent: obj, $jb_property: prop };
  }
}

const valueByRefHandler = valueByRefHandlerWithjbParent;

let types = {}, ui = {}, rx = {}, ctxDictionary = {}, testers = {};

return {
  jbCtx: jbCtx,

  run: jb_run,
  expression: expression,
  bool_expression: bool_expression,
  profileType: profileType,
  compName: compName,
  logError: logError,
  logPerformance: logPerformance,
  logException: logException,

  tojstype: tojstype, jstypes: jstypes,
  tostring: tostring, toarray:toarray, toboolean: toboolean,tosingle:tosingle,tonumber:tonumber,

  valueByRefHandler: valueByRefHandler,
  types: types,
  ui: ui,
  rx: rx,
  ctxDictionary: ctxDictionary,
  testers: testers,
  compParams: compParams,
  singleInType: singleInType,
  val: val,
  entries: entries,
  extend: extend,
  ctxCounter: _ => ctxCounter
}

})();

Object.assign(jb,{
  comps: {}, functions: {}, resources: {}, consts: {},
  studio: { previewjb: jb },
  component: (id,val) => jb.comps[id] = val,
  type: (id,val) => jb.types[id] = val || {},
  resource: (id,val) => typeof val == 'undefined' ? jb.resources[id] : (jb.resources[id] = val || {}),
  const: (id,val) => typeof val == 'undefined' ? jb.consts[id] : (jb.consts[id] = val || {}),
  functionDef: (id,val) => jb.functions[id] = val,

// force path - create objects in the path if not exist
  path: (object,path,value) => {
    let cur = object;

    if (typeof value == 'undefined') {  // get
      for(let i=0;i<path.length;i++) {
        cur = cur[path[i]];
        if (cur == null || typeof cur == 'undefined') return null;
      }
      return cur;
    } else { // set
      for(let i=0;i<path.length;i++)
        if (i == path.length-1)
          cur[path[i]] = value;
        else
          cur = cur[path[i]] = cur[path[i]] || {};
      return value;
    }
  },
  ownPropertyNames: obj => {
    let res = [];
    for (let i in (obj || {}))
      if (obj.hasOwnProperty(i))
        res.push(i);
    return res;
  },
  obj: (k,v,base) => {
    let ret = base || {};
    ret[k] = v;
    return ret;
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
  range: (start, count) =>
    Array.apply(0, Array(count)).map((element, index) => index + start),

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
  synchArray: ar => {
    const isSynch = ar.filter(v=> v &&  (typeof v.then == 'function' || typeof v.subscribe == 'function')).length == 0;
    if (isSynch) return ar;

    const _ar = ar.filter(x=>x).map(v=>
      (typeof v.then == 'function' || typeof v.subscribe == 'function') ? v : [v]);

    return jb.rx.Observable.from(_ar)
          .concatMap(x=>x)
          .flatMap(v =>
            Array.isArray(v) ? v : [v])
          .toArray()
          .toPromise()
  },
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

  equals: (x,y) =>
    x == y || jb.val(x) == jb.val(y),

  delay: mSec =>
    new Promise(r=>{setTimeout(r,mSec)}),

  // valueByRef API
  refHandler: ref =>
    (ref && ref.handler) || jb.valueByRefHandler,
  writeValue: (ref,value,srcCtx) =>
    jb.refHandler(ref).writeValue(ref,value,srcCtx),
  splice: (ref,args,srcCtx) =>
    jb.refHandler(ref).splice(ref,args,srcCtx),
  move: (fromRef,toRef,srcCtx) =>
    jb.refHandler(fromRef).move(fromRef,toRef,srcCtx),
  isRef: (ref) =>
    jb.refHandler(ref).isRef(ref),
  refreshRef: (ref) =>
    jb.refHandler(ref).refresh(ref),
  asRef: (obj) =>
    jb.valueByRefHandler.asRef(obj),
  resourceChange: _ =>
    jb.valueByRefHandler.resourceChange,
})
;

jb.component('call', {
 	type: '*',
 	params: [
 		{ id: 'param', as: 'string' }
 	],
 	impl: function(context,param) {
 	  const paramObj = context.componentContext && context.componentContext.params[param];
      if (typeof(paramObj) == 'function')
 		return paramObj(new jb.jbCtx(context, {
 			data: context.data,
 			vars: context.vars,
 			componentContext: context.componentContext.componentContext,
 			forcePath: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
});

jb.pipe = function(context,items,ptName) {
	const start = [jb.toarray(context.data)[0]]; // use only one data item, the first or null
	if (typeof context.profile.items == 'string')
		return context.runInner(context.profile.items,null,'items');
	const profiles = jb.toarray(context.profile.items || context.profile[ptName]);
	const innerPath = (context.profile.items && context.profile.items.sugar) ? '' 
		: (context.profile[ptName] ? (ptName + '~') : 'items~');

	if (ptName == '$pipe') // promise pipe
		return profiles.reduce((deferred,prof,index) => {
			return deferred.then(data=>
				jb.synchArray(data))
			.then(data=>
				step(prof,index,data))
		}, Promise.resolve(start))

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

jb.component('pipeline',{
	type: 'data',
	description: 'map data arrays one after the other',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb.pipe(ctx,items,'$pipeline')
})

jb.component('pipe', { // synched pipeline
	type: 'data',
	description: 'map asynch data arrays',
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => jb.pipe(ctx,items,'$pipe')
})

jb.component('data.if', {
 	type: 'data',
 	params: [
 		{ id: 'condition', type: 'boolean', as: 'boolean', essential: true},
 		{ id: 'then', essential: true, dynamic: true },
 		{ id: 'else', dynamic: true },
 	],
 	impl: (ctx,cond,_then,_else) =>
 		cond ? _then() : _else()
});

jb.component('action.if', {
 	type: 'action',
 	description: 'if then else',
 	params: [
 		{ id: 'condition', type: 'boolean', as: 'boolean', essential: true},
 		{ id: 'then', type: 'action', essential: true, dynamic: true },
 		{ id: 'else', type: 'action', dynamic: true },
 	],
 	impl: (ctx,cond,_then,_else) =>
 		cond ? _then() : _else()
});

// jb.component('apply', {
// 	description: 'run a function',
//  	type: '*',
//  	params: [
//  		{ id: 'func', as: 'single'},
//  	],
//  	impl: (ctx,func) => {
//  		if (typeof func == 'function')
//  	  		return func(ctx);
//  	}
// });

jb.component('jb-run', {
 	type: 'action',
 	params: [
 		{ id: 'profile', as: 'string', essential: true, description: 'profile name'},
 		{ id: 'params', as: 'single' },
 	],
 	impl: (ctx,profile,params) =>
 		ctx.run(Object.assign({$:profile},params || {}))
});


jb.component('list', {
	type: 'data',
	description: 'also flatten arrays',
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		let out = [];
		items.forEach(item => {
			if (Array.isArray(item))
				out = out.concat(item);
			else
				out.push(item);
		});
		return out;
	}
});

jb.component('firstSucceeding', {
	type: 'data',
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		for(let i=0;i<items.length;i++)
			if (jb.val(items[i]))
				return items[i];
		// return last one if zero or empty string
		const last = items.slice(-1)[0];
		return (last != null) && jb.val(last);
	}
});

jb.component('property-names', {
	type: 'data',
  description: 'Object.getOwnPropertyNames',
	params: [
		{ id: 'obj', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx,obj) =>
		jb.ownPropertyNames(obj).filter(p=>p.indexOf('$jb_') != 0)
})

jb.component('properties',{
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%', as: 'single' }
	],
	impl: (context,obj) =>
		jb.ownPropertyNames(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
});

jb.component('prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(0,text.indexOf(separator))
});

jb.component('suffix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		(text||'').substring(text.lastIndexOf(separator)+separator.length)
});

jb.component('remove-prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
});

jb.component('remove-suffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: (context,separator,text) =>
		text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
});

jb.component('remove-suffix-regex',{
	type: 'data',
	params: [
		{ id: 'suffix', as: 'string', essential: true, description: 'regular expression. e.g [0-9]*' },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,suffix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp(suffix+'$');
		const m = (text||'').match(context.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
});

jb.component('write-value',{
	type: 'action',
	params: [
		{ id: 'to', as: 'ref', essential: true },
		{ id: 'value', essential: true}
	],
	impl: (ctx,to,value) =>
		jb.writeValue(to,jb.val(value),ctx)
});

jb.component('remove-from-array', {
	type: 'action',
	params: [
		{ id: 'array', as: 'ref', essential: true },
		{ id: 'itemToRemove', as: 'single', description: 'choose item or index' },
		{ id: 'index', as: 'number', description: 'choose item or index' },
	],
	impl: (ctx,array,itemToRemove,index) => {
		const ar = jb.toarray(array);
		const index = itemToRemove ? ar.indexOf(item) : index;
		if (index != -1 && ar.length > index)
			jb.splice(array,[[index,1]],ctx)
	}
});

jb.component('toggle-boolean-value',{
	type: 'action',
	params: [
		{ id: 'of', as: 'ref' },
	],
	impl: (ctx,_of) =>
		jb.writeValue(_of,jb.val(_of) ? false : true)
});


jb.component('slice', {
	type: 'aggregator',
	params: [
		{ id: 'start', as: 'number', defaultValue: 0, description: '0-based index', essential: true },
		{ id: 'end', as: 'number', essential: true, description: '0-based index of where to end the selection (not including itself)' }
	],
	impl: function(context,begin,end) {
		if (!context.data || !context.data.slice) return null;
		return end ? context.data.slice(begin,end) : context.data.slice(begin);
	}
});

jb.component('sort', { 
	type: 'aggregator',
	params: [
		{ id: 'propertyName', as: 'string', description: 'sort by property inside object' },
		{ id: 'lexical', as: 'boolean', type: 'boolean' },
		{ id: 'ascending', as: 'boolean', type: 'boolean' }, 
	],
	impl: (ctx,prop,lexical,ascending) => {
		if (!ctx.data || ! Array.isArray(ctx.data)) return null;
		let sortFunc;
		if (lexical)
			sortFunc = prop ? (x,y) => (x[prop] == y[prop] ? 0 : x[prop] < y[prop] ? -1 : 1) : (x,y) => (x == y ? 0 : x < y ? -1 : 1);
		else 
			sortFunc = prop ? (x,y) => (x[prop]-y[prop]) : (x,y) => (x-y);
		if (ascending)
			return ctx.data.slice(0).sort((x,y)=>sortFunc(y,x));
		return ctx.data.slice(0).sort((x,y)=>sortFunc(x,y));
	}
});

jb.component('first', {
	type: 'aggregator',
	impl: ctx => ctx.data[0]
});

jb.component('last', {
	type: 'aggregator',
	impl: ctx => ctx.data.slice(-1)[0]
});

jb.component('count', {
	type: 'aggregator',
	description: 'length, size of array',
	params: [{ id: 'items', as:'array', defaultValue: '%%'}],
	impl: (ctx,items) =>
		items.length
});

jb.component('reverse', {
	type: 'aggregator',
	params: [{ id: 'items', as:'array', defaultValue: '%%'}],
	impl: (ctx,items) =>
		items.reverse()
});

jb.component('sample', {
	type: 'aggregator',
	params: [
		{ id: 'size', as:'number', defaultValue: 300},
		{ id: 'items', as:'array', defaultValue: '%%'}
	],
	impl: (ctx,size,items) =>
		items.filter((x,i)=>i % (Math.floor(items.length/300) ||1) == 0)
});

jb.component('calculate-properties', { 
	type: 'aggregator',
	description: 'extend with calculated properties',
	params: [
		{ id: 'property', type: 'calculated-property[]', essential: true, defaultValue: [] },
		{ id: 'items', as:'array', defaultValue: '%%'},
	],
	impl: (ctx,properties,items) =>
		items.slice(0).map((item,i)=>
			properties.forEach(p=>item[p.title] = jb.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type) ) || item)
});

jb.component('calculated-property', { 
	type: 'calculated-property',
	params: [
		{ id: 'title', as: 'string', essential: true },
		{ id: 'val', dynamic: 'true', type: 'data', essential: true },
		{ id: 'type', as: 'string', options: 'string,number,boolean', defaultValue: 'string' },
	],
	impl: ctx => ctx.params
})


jb.component('not', {
	type: 'boolean',
	params: [
		{ id: 'of', type: 'boolean', as: 'boolean', essential: true, composite: true}
	],
	impl: (context, of) => !of
});

jb.component('and', {
	type: 'boolean',
	params: [
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true, composite: true }
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
});

jb.component('or', {
	type: 'boolean',
	params: [
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true, composite: true }
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
});

jb.component('between', {
	type: 'boolean',
	params: [
		{ id: 'from', as: 'number', essential: true },
		{ id: 'to', as: 'number', essential: true },
		{ id: 'val', as: 'number', defaultValue: '%%' },
	],
	impl: (ctx,from,to,val) => 
		val >= from && val <= to
});

jb.component('contains',{
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'string'},
		{ id: 'inOrder', defaultValue: true, as:'boolean'},
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

jb.component('not-contains', {
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'array'}
	],
	impl :{$not: {$: 'contains', text: '%$text%', allText :'%$allText%'}}
})

jb.component('starts-with', {
	type: 'boolean',
	params: [
		{ id: 'startsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: (context,startsWith,text) =>
		text.lastIndexOf(startsWith,0) == 0
})

jb.component('ends-with',{
	type: 'boolean',
	params: [
		{ id: 'endsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: (context,endsWith,text) =>
		text.indexOf(endsWith,text.length-endsWith.length) !== -1
})


jb.component('filter',{
	type: 'aggregator',
	params: [
		{ id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, essential: true }
	],
	impl: (context,filter) =>
		jb.toarray(context.data).filter(item =>
			filter(context,item))
});

jb.component('match-regex', {
  type: 'boolean',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'regex', as: 'string', essential: true, description: 'e.g: [a-zA-Z]*' },
    {id: 'fillText', as: 'boolean', essential: true, description: 'regex must match all text' },
  ],
  impl: (ctx,text,regex,fillText) =>
    text.match(new RegExp(fillText ? `^${regex}$` : regex))
})

jb.component('to-string', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%', composite: true}
	],
	impl: (ctx,text) =>	text
});

jb.component('to-uppercase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toUpperCase()
});

jb.component('to-lowercase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toLowerCase()
});

jb.component('capitalize', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.charAt(0).toUpperCase() + text.slice(1)
});

jb.component('join', {
	params: [
		{ id: 'separator', as: 'string', defaultValue:',', essential: true },
		{ id: 'prefix', as: 'string' },
		{ id: 'suffix', as: 'string' },
		{ id: 'items', as: 'array', defaultValue: '%%'},
		{ id: 'itemName', as: 'string', defaultValue: 'item'},
		{ id: 'itemText', as: 'string', dynamic:true, defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: function(context,separator,prefix,suffix,items,itemName,itemText) {
		const itemToText = (context.profile.itemText) ?
			item => itemText(new jb.jbCtx(context, {data: item, vars: jb.obj(itemName,item) })) :
			item => jb.tostring(item);	// performance

		return prefix + items.map(itemToText).join(separator) + suffix;
	}
});

jb.component('unique', {
	params: [
		{ id: 'id', as: 'string', dynamic: true, defaultValue: '%%' },
		{ id: 'items', as: 'array', defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.unique(items,_idFunc);
	}
});

jb.component('log', {
	params: [
		{ id: 'obj', as: 'single', defaultValue: '%%'}
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
});

jb.component('asIs',{ params: [{id: '$asIs'}], impl: ctx => context.profile.$asIs });

jb.component('object',{
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
});

jb.component('json.stringify', {
	params: [
		{ id: 'value', defaultValue: '%%' },
		{ id: 'space', as: 'string', description: 'use space or tab to make pretty output' }
	],
	impl: (context,value,space) =>
			JSON.stringify(value,null,space)
});

jb.component('json.parse', {
	params: [
		{ id: 'text', as: 'string' }
	],
	impl: (ctx,text) =>	{
		try {
			return JSON.parse(text)
		} catch (e) {
			jb.logException(e,'json parse');
		}
	}
});

jb.component('split', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', defaultValue: ',' },
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'part', options: ',first,second,last,but first,but last' }
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
});

jb.component('replace', {
	type: 'data',
	params: [
		{ id: 'find', as: 'string', essential: true },
		{ id: 'replace', as: 'string', essential: true  },
		{ id: 'text', as: 'string', defaultValue: '%%' },
		{ id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
		{ id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m' }
	],
	impl: function(context,find,replace,text,useRegex,regexFlags) {
		if (useRegex) {
			return text.replace(new RegExp(find,regexFlags) ,replace);
		} else
			return text.replace(find,replace);
	}
});

jb.component('touch', {
	type: 'action',
	params: [
		{ id: 'data', as: 'ref'},
	],
	impl: function(context,data_ref) {
		const val = Number(jb.val(data_ref));
		jb.writeValue(data_ref,val ? val + 1 : 1);
	}
});

jb.component('isNull', {
	type: 'boolean',
	params: [
		{ id: 'obj', defaultValue: '%%'}
	],
	impl: (ctx, obj) => jb.val(obj) == null
});

jb.component('isEmpty', {
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: (ctx, item) =>
		!item || (Array.isArray(item) && item.length == 0)
});

jb.component('notEmpty', {
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: (ctx, item) =>
		item && !(Array.isArray(item) && item.length == 0)
});

jb.component('equals', {
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx, item1, item2) => item1 == item2
});

jb.component('not-equals', {
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx, item1, item2) => item1 != item2
});

jb.component('parent', {
	type: 'data',
	params: [
		{ id: 'item', as: 'ref', defaultValue: '%%'}
	],
	impl: (ctx,item) =>
		item && item.$jb_parent
});

jb.component('runActions', {
	type: 'action',
	params: [
		{ id: 'actions', type:'action[]', ignore: true, composite: true, essential: true }
	],
	impl: function(context) {
		if (!context.profile) debugger;
		const actions = jb.toarray(context.profile.actions || context.profile['$runActions']);
		const innerPath =  (context.profile.actions && context.profile.actions.sugar) ? ''
			: (context.profile['$runActions'] ? '$runActions~' : 'items~');
		return actions.reduce((def,action,index) =>
				def.then(_ => context.runInner(action, { as: 'single'}, innerPath + index ))
			,Promise.resolve())
	}
});

// jb.component('delay', {
// 	params: [
// 		{ id: 'mSec', type: 'number', defaultValue: 1}
// 	],
// 	impl: ctx => jb.delay(ctx.params.mSec)
// })

jb.component('on-next-timer', {
	description: 'run action after delay',
	type: 'action',
	params: [
		{ id: 'action', type: 'action', dynamic: true, essential: true },
		{ id: 'delay', type: 'number', defaultValue: 1}
	],
	impl: (ctx,action,delay) =>
		jb.delay(delay,ctx).then(()=>
			action())
})

jb.component('extract-prefix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
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
});

jb.component('extract-suffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
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
});

jb.component('range', {
	type: 'data',
	params: [
		{ id: 'from', as: 'number', defaultValue: 1 },
		{ id: 'to', as: 'number', defaultValue: 10 },
	],
	impl: (ctx,from,to) =>
    Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

jb.component('type-of', {
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%' },
	],
	impl: (ctx,_obj) => {
	  	const obj = jb.val(_obj);
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

jb.component('class-name', {
	type: 'data',
	params: [
		{ id: 'obj', defaultValue: '%%' },
	],
	impl: (ctx,_obj) => {
	  	const obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

jb.component('is-of-type', {
  type: 'boolean',
  params: [
  	{ id: 'type', as: 'string', essential: true, description: 'string,boolean' },
  	{ id: 'obj', defaultValue: '%%' },
  ],
  impl: (ctx,_type,_obj) => {
  	const obj = jb.val(_obj);
  	const objType = Array.isArray(obj) ? 'array' : typeof obj;
  	return _type.split(',').indexOf(objType) != -1;
  }
})

jb.component('in-group', {
  type: 'boolean',
  params: [
  	{ id: 'group', as: 'array', essential: true },
  	{ id: 'item', as: 'single', defaultValue: '%%' },
  ],
  impl: (ctx,group,item) =>
  	group.indexOf(item) != -1
})

jb.component('http.get', {
	params: [
		{ id: 'url', as: 'string' },
		{ id: 'json', as: 'boolean', description: 'convert result to json' }
	],
	impl: (ctx,url,_json) => {
		if (ctx.probe)
			return jb.http_get_cache[url];
		const json = _json || url.match(/json$/);
		return fetch(url)
			  .then(r =>
			  		json ? r.json() : r.text())
				.then(res=> jb.http_get_cache ? (jb.http_get_cache[url] = res) : res)
			  .catch(e => jb.logException(e) || [])
	}
});

jb.component('http.post', {
  type: 'action',
	params: [
		{ id: 'url', as: 'string' },
    { id: 'postData', as: 'single' },
		{ id: 'jsonResult', as: 'boolean', description: 'convert result to json' }
	],
	impl: (ctx,url,postData,json) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json; charset=UTF-8");
		return fetch(url,{method: 'POST', headers: headers, body: JSON.stringify(postData) })
			  .then(r =>
			  		json ? r.json() : r.text())
			  .catch(e => jb.logException(e) || [])
	}
});

jb.component('isRef', {
	params: [
		{ id: 'obj', essential: true }
	],
	impl: (ctx,obj) => jb.isRef(obj)
})

jb.component('asRef', {
	params: [
		{ id: 'obj', essential: true }
	],
	impl: (ctx,obj) => jb.asRef(obj)
})

jb.component('data.switch', {
  params: [
  	{ id: 'cases', type: 'data.switch-case[]', as: 'array', essential: true, defaultValue: [] },
  	{ id: 'default', dynamic: true },
  ],
  impl: (ctx,cases,defaultValue) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].value(ctx)
  	return defaultValue(ctx);
  }
})

jb.component('data.switch-case', {
  type: 'data.switch-case',
  singleInType: true,
  params: [
  	{ id: 'condition', type: 'boolean', essential: true, dynamic: true },
  	{ id: 'value', essential: true, dynamic: true },
  ],
  impl: ctx => ctx.params
})

jb.component('action.switch', {
  type: 'action',
  params: [
  	{ id: 'cases', type: 'action.switch-case[]', as: 'array', essential: true, defaultValue: [] },
  	{ id: 'defaultAction', type: 'action', dynamic: true },
  ],
  impl: (ctx,cases,defaultAction) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

jb.component('action.switch-case', {
  type: 'action.switch-case',
  singleInType: true,
  params: [
  	{ id: 'condition', type: 'boolean', as: 'boolean', essential: true, dynamic: true },
  	{ id: 'action', type: 'action' ,essential: true, dynamic: true },
  ],
  impl: ctx => ctx.params
})

jb.component('newline', {
  impl: ctx => '\n'
})

jb.const('global', typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : null);

var valueByRefHandlerWithjbParent = {
  val: function(v) {
    if (v.$jb_val) return v.$jb_val();
    return (v.$jb_parent) ? v.$jb_parent[v.$jb_property] : v;
  },
  writeValue: function(to,value,srcCtx) {
    jb.logPerformance('writeValue',value,to,srcCtx);
    if (!to) return;
    if (to.$jb_val)
      to.$jb_val(this.val(value))
    else if (to.$jb_parent)
      to.$jb_parent[to.$jb_property] = this.val(value);
    return to;
  },
  asRef: function(value) {
    if (value && (value.$jb_parent || value.$jb_val))
        return value;
    return { $jb_val: () => value }
  },
  isRef: function(value) {
    return value && (value.$jb_parent || value.$jb_val);
  },
  objectProperty: function(obj,prop) {
      if (this.isRef(obj[prop]))
        return obj[prop];
      else
        return { $jb_parent: obj, $jb_property: prop };
  }
}

jb.valueByRefHandler = valueByRefHandlerWithjbParent;
;

jb.component('pretty-print', {
  params: [
    { id: 'profile', defaultValue: '%%' },
    { id: 'colWidth', as: 'number', defaultValue: 140 },
  ],
  impl: (ctx,profile,colWidth) =>
    jb.prettyPrint(profile,colWidth)
})

jb.prettyPrintComp = function(compId,comp) {
  if (comp)
    return "jb.component('" + compId + "', "
      + jb.prettyPrintWithPositions(comp).result + ')'
}

jb.prettyPrint = function(profile,colWidth,tabSize,initialPath) {
  return jb.prettyPrintWithPositions(profile,colWidth,tabSize,initialPath).result;
}

jb.prettyPrintWithPositions = function(profile,colWidth,tabSize,initialPath) {
  colWidth = colWidth || 140;
  tabSize = tabSize || 2;

  let remainedInLine = colWidth;
  let result = '';
  let depth = 0;
  let lineNum = 0;
  let positions = {};

  printValue(profile,initialPath || '');
  return { result : result, positions : positions }

  function sortedPropertyNames(obj) {
    let props = jb.entries(obj)
      .filter(p=>p[1] != null)
      .map(x=>x[0]) // try to keep the order
      .filter(p=>p.indexOf('$jb') != 0)

    const comp_name = jb.compName(obj);
    if (comp_name) { // tgp obj - sort by params def
      const params = jb.compParams(jb.comps[comp_name]).map(p=>p.id);
      props.sort((p1,p2)=>params.indexOf(p1) - params.indexOf(p2));
    }
    if (props.indexOf('$') > 0) { // make the $ first
      props.splice(props.indexOf('$'),1);
      props.unshift('$');
    }
    return props;
  }

  function printValue(val,path) {
    positions[path] = lineNum;
    if (!val) return;
    if (val.$jb_arrayShortcut)
      val = val.items;
    if (Array.isArray(val)) return printArray(val,path);
    if (typeof val === 'object') return printObj(val,path);
    if (typeof val === 'function')
      result += val.toString();
    else if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
      result += "'" + JSON.stringify(val).replace(/^"/,'').replace(/"$/,'') + "'";
    else if (typeof val === 'string' && val.indexOf('\n') != -1) {
      result += "`" + val.replace(/`/g,'\\`') + "`"
      // depth++;
      // result += "`";
      // var lines = val.split('\n');
      // lines.forEach((line,index)=>{
      //     result += line.trim();
      //     if(index<lines.length-1)
      //       newLine();
      // })
      // depth--;
      // result += "`";
    }  else
      result += JSON.stringify(val);
  }

  function printObj(obj,path) {
      var obj_str = flat_obj(obj);
      if (!printInLine(obj_str)) { // object does not fit in parent line
        depth++;
        result += '{';
        if (!printInLine(obj_str)) { // object does not fit in its own line
          sortedPropertyNames(obj).forEach(function(prop,index,array) {
              if (prop != '$')
                newLine();
              if (obj[prop] != null) {
                printProp(obj,prop,path);
                if (index < array.length -1)
                  result += ', ';//newLine();
              }
          });
        }
        depth--;
        newLine();
        result += '}';
      }
  }
  function quotePropName(p) {
    if (p.match(/^[$a-zA-Z_][$a-zA-Z0-9_]*$/))
      return p;
    else
      return `"${p}"`
  }
  function printProp(obj,prop,path) {
    if (obj[prop] && obj[prop].$jb_arrayShortcut)
      obj = obj(prop,obj[prop].items);

    if (printInLine(flat_property(obj,prop))) return;

    if (prop == '$')
      result += '$: '
    else
      result += quotePropName(prop) + (jb.compName(obj[prop]) ? ' :' : ': ');
    //depth++;
    printValue(obj[prop],path+'~'+prop);
    //depth--;
  }
  function printArray(array,path) {
    if (printInLine(flat_array(array))) return;
    result += '[';
    depth++;
    newLine();
    array.forEach(function(val,index) {
      printValue(val,path+'~'+index);
      if (index < array.length -1) {
        result += ', ';
        newLine();
      }
    })
    depth--;newLine();
    result += ']';
  }
  function printInLine(text) {
    if (remainedInLine < text.length || text.match(/:\s?{/) || text.match(/, {\$/)) return false;
    result += text;
    remainedInLine -= text.length;
    return true;
  }
  function newLine() {
    result += '\n';
    lineNum++;
    for (var i = 0; i < depth; i++) result += '               '.substr(0,tabSize);
    remainedInLine = colWidth - tabSize * depth;
  }
  function flat_obj(obj) {
    var props = sortedPropertyNames(obj)
      .filter(p=>obj[p] != null)
      .filter(x=>x!='$')
      .map(prop =>
      quotePropName(prop) + ': ' + flat_val(obj[prop]));
    if (obj && obj.$) {
      props.unshift("$: '" + obj.$+ "'");
      return '{' + props.join(', ') + ' }'
    }
    return '{ ' + props.join(', ') + ' }'
  }
  function flat_property(obj,prop) {
    if (jb.compName(obj[prop]))
      return quotePropName(prop) + ' :' + flat_val(obj[prop]);
    else
      return quotePropName(prop) + ': ' + flat_val(obj[prop]);
  }
  function flat_val(val) {
    if (Array.isArray(val)) return flat_array(val);
    if (typeof val === 'object') return flat_obj(val);
    if (typeof val === 'function') return val.toString();
    if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
      return "'" + JSON.stringify(val).replace(/^"/,'').replace(/"$/,'') + "'";
    else
      return JSON.stringify(val); // primitives
  }
  function flat_array(array) {
    return '[' + array.map(item=>flat_val(item)).join(', ') + ']';
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

!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=10)}([function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,t){var n,r,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(e){n=o}try{r="function"==typeof clearTimeout?clearTimeout:s}catch(e){r=s}}();var l,c=[],u=!1,h=-1;function p(){u&&l&&(u=!1,l.length?c=l.concat(c):h=-1,c.length&&f())}function f(){if(!u){var e=a(p);u=!0;for(var t=c.length;t;){for(l=c,c=[];++h<t;)l&&l[h].run();h=-1,t=c.length}l=null,u=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===s||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function m(e,t){this.fun=e,this.array=t}function d(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new m(e,t)),1!==c.length||u||a(f)},m.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=d,i.addListener=d,i.once=d,i.off=d,i.removeListener=d,i.removeAllListeners=d,i.emit=d,i.prependListener=d,i.prependOnceListener=d,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t){},function(e,t,n){(function(e){function n(e,t){for(var n=0,r=e.length-1;r>=0;r--){var i=e[r];"."===i?e.splice(r,1):".."===i?(e.splice(r,1),n++):n&&(e.splice(r,1),n--)}if(t)for(;n--;n)e.unshift("..");return e}var r=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,i=function(e){return r.exec(e).slice(1)};function o(e,t){if(e.filter)return e.filter(t);for(var n=[],r=0;r<e.length;r++)t(e[r],r,e)&&n.push(e[r]);return n}t.resolve=function(){for(var t="",r=!1,i=arguments.length-1;i>=-1&&!r;i--){var s=i>=0?arguments[i]:e.cwd();if("string"!=typeof s)throw new TypeError("Arguments to path.resolve must be strings");s&&(t=s+"/"+t,r="/"===s.charAt(0))}return(r?"/":"")+(t=n(o(t.split("/"),function(e){return!!e}),!r).join("/"))||"."},t.normalize=function(e){var r=t.isAbsolute(e),i="/"===s(e,-1);return(e=n(o(e.split("/"),function(e){return!!e}),!r).join("/"))||r||(e="."),e&&i&&(e+="/"),(r?"/":"")+e},t.isAbsolute=function(e){return"/"===e.charAt(0)},t.join=function(){var e=Array.prototype.slice.call(arguments,0);return t.normalize(o(e,function(e,t){if("string"!=typeof e)throw new TypeError("Arguments to path.join must be strings");return e}).join("/"))},t.relative=function(e,n){function r(e){for(var t=0;t<e.length&&""===e[t];t++);for(var n=e.length-1;n>=0&&""===e[n];n--);return t>n?[]:e.slice(t,n-t+1)}e=t.resolve(e).substr(1),n=t.resolve(n).substr(1);for(var i=r(e.split("/")),o=r(n.split("/")),s=Math.min(i.length,o.length),a=s,l=0;l<s;l++)if(i[l]!==o[l]){a=l;break}var c=[];for(l=a;l<i.length;l++)c.push("..");return(c=c.concat(o.slice(a))).join("/")},t.sep="/",t.delimiter=":",t.dirname=function(e){var t=i(e),n=t[0],r=t[1];return n||r?(r&&(r=r.substr(0,r.length-1)),n+r):"."},t.basename=function(e,t){var n=i(e)[2];return t&&n.substr(-1*t.length)===t&&(n=n.substr(0,n.length-t.length)),n},t.extname=function(e){return i(e)[3]};var s="b"==="ab".substr(-1)?function(e,t,n){return e.substr(t,n)}:function(e,t,n){return t<0&&(t=e.length+t),e.substr(t,n)}}).call(this,n(1))},function(e,t){e.exports=function(){throw new Error("define cannot be used indirect")}},function(e,t){function n(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}n.keys=function(){return[]},n.resolve=n,e.exports=n,n.id=5},function(e,t,n){var r=function(){var e=Object.create||function(e){function t(){}return t.prototype=e,new t},t=/^(before|after)/;function n(e,n){var r=e.match(t)[0],i=e.replace(t,""),o=this[i];"after"===r?this[i]=function(){var e=o.apply(this,arguments),t=[].slice.call(arguments);return t.splice(0,0,e),n.apply(this,t),e}:"before"===r&&(this[i]=function(){return n.apply(this,arguments),o.apply(this,arguments)})}function r(){for(var e,r,i=0;i<arguments.length;i++)if(e=arguments[i])for(r in Object.prototype.hasOwnProperty.call(e,"constructor")&&(this.constructor=e.constructor),Object.prototype.hasOwnProperty.call(e,"toString")&&(this.toString=e.toString),e)Object.prototype.hasOwnProperty.call(e,r)&&(r.match(t)&&"function"==typeof this[r.replace(t,"")]?n.call(this,r,e[r]):this[r]=e[r]);return this}return{mix:r,beget:function(){return arguments.length?r.apply(e(this),arguments):e(this)},construct:function(){var t=r.apply(e(this),arguments),n=t.constructor,i=t.constructor=function(){return n.apply(this,arguments)};return i.prototype=t,i.mix=r,i},constructor:function(){return this}}}();t.typal=r},function(e,t,n){(function(e,r){var i=function(){var e={trace:function(){},yy:{},symbols_:{error:2,lex:3,definitions:4,"%%":5,rules:6,epilogue:7,EOF:8,CODE:9,definition:10,ACTION:11,NAME:12,regex:13,START_INC:14,names_inclusive:15,START_EXC:16,names_exclusive:17,START_COND:18,rule:19,start_conditions:20,action:21,"{":22,action_body:23,"}":24,action_comments_body:25,ACTION_BODY:26,"<":27,name_list:28,">":29,"*":30,",":31,regex_list:32,"|":33,regex_concat:34,regex_base:35,"(":36,")":37,SPECIAL_GROUP:38,"+":39,"?":40,"/":41,"/!":42,name_expansion:43,range_regex:44,any_group_regex:45,".":46,"^":47,$:48,string:49,escape_char:50,NAME_BRACE:51,ANY_GROUP_REGEX:52,ESCAPE_CHAR:53,RANGE_REGEX:54,STRING_LIT:55,CHARACTER_LIT:56,$accept:0,$end:1},terminals_:{2:"error",5:"%%",8:"EOF",9:"CODE",11:"ACTION",12:"NAME",14:"START_INC",16:"START_EXC",18:"START_COND",22:"{",24:"}",26:"ACTION_BODY",27:"<",29:">",30:"*",31:",",33:"|",36:"(",37:")",38:"SPECIAL_GROUP",39:"+",40:"?",41:"/",42:"/!",46:".",47:"^",48:"$",51:"NAME_BRACE",52:"ANY_GROUP_REGEX",53:"ESCAPE_CHAR",54:"RANGE_REGEX",55:"STRING_LIT",56:"CHARACTER_LIT"},productions_:[0,[3,4],[7,1],[7,2],[7,3],[4,2],[4,2],[4,0],[10,2],[10,2],[10,2],[15,1],[15,2],[17,1],[17,2],[6,2],[6,1],[19,3],[21,3],[21,1],[23,0],[23,1],[23,5],[23,4],[25,1],[25,2],[20,3],[20,3],[20,0],[28,1],[28,3],[13,1],[32,3],[32,2],[32,1],[32,0],[34,2],[34,1],[35,3],[35,3],[35,2],[35,2],[35,2],[35,2],[35,2],[35,1],[35,2],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[43,1],[45,1],[50,1],[44,1],[49,1],[49,1]],performAction:function(e,t,n,r,i,o,s){var a=o.length-1;switch(i){case 1:return this.$={rules:o[a-1]},o[a-3][0]&&(this.$.macros=o[a-3][0]),o[a-3][1]&&(this.$.startConditions=o[a-3][1]),o[a]&&(this.$.moduleInclude=o[a]),r.options&&(this.$.options=r.options),r.actionInclude&&(this.$.actionInclude=r.actionInclude),delete r.options,delete r.actionInclude,this.$;case 2:case 3:this.$=null;break;case 4:this.$=o[a-1];break;case 5:if(this.$=o[a],"length"in o[a-1])this.$[0]=this.$[0]||{},this.$[0][o[a-1][0]]=o[a-1][1];else for(var l in this.$[1]=this.$[1]||{},o[a-1])this.$[1][l]=o[a-1][l];break;case 6:r.actionInclude+=o[a-1],this.$=o[a];break;case 7:r.actionInclude="",this.$=[null,null];break;case 8:this.$=[o[a-1],o[a]];break;case 9:case 10:this.$=o[a];break;case 11:this.$={},this.$[o[a]]=0;break;case 12:this.$=o[a-1],this.$[o[a]]=0;break;case 13:this.$={},this.$[o[a]]=1;break;case 14:this.$=o[a-1],this.$[o[a]]=1;break;case 15:this.$=o[a-1],this.$.push(o[a]);break;case 16:this.$=[o[a]];break;case 17:this.$=o[a-2]?[o[a-2],o[a-1],o[a]]:[o[a-1],o[a]];break;case 18:this.$=o[a-1];break;case 19:this.$=o[a];break;case 20:this.$="";break;case 21:this.$=o[a];break;case 22:this.$=o[a-4]+o[a-3]+o[a-2]+o[a-1]+o[a];break;case 23:this.$=o[a-3]+o[a-2]+o[a-1]+o[a];break;case 24:this.$=e;break;case 25:this.$=o[a-1]+o[a];break;case 26:this.$=o[a-1];break;case 27:this.$=["*"];break;case 29:this.$=[o[a]];break;case 30:this.$=o[a-2],this.$.push(o[a]);break;case 31:this.$=o[a],r.options&&r.options.flex||!this.$.match(/[\w\d]$/)||this.$.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)||(this.$+="\\b");break;case 32:this.$=o[a-2]+"|"+o[a];break;case 33:this.$=o[a-1]+"|";break;case 35:this.$="";break;case 36:this.$=o[a-1]+o[a];break;case 38:this.$="("+o[a-1]+")";break;case 39:this.$=o[a-2]+o[a-1]+")";break;case 40:this.$=o[a-1]+"+";break;case 41:this.$=o[a-1]+"*";break;case 42:this.$=o[a-1]+"?";break;case 43:this.$="(?="+o[a]+")";break;case 44:this.$="(?!"+o[a]+")";break;case 46:this.$=o[a-1]+o[a];break;case 48:this.$=".";break;case 49:this.$="^";break;case 50:this.$="$";break;case 54:case 55:case 56:this.$=e;break;case 57:this.$=function(e){return e.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1").replace(/\\\\u([a-fA-F0-9]{4})/g,"\\u$1")}(e.substr(1,e.length-2).replace(/\\\\/g,"\\"))}},table:[{3:1,4:2,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{1:[3]},{5:[1,8]},{4:9,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{4:10,5:[2,7],10:3,11:[1,4],12:[1,5],14:[1,6],16:[1,7]},{5:[2,35],11:[2,35],12:[2,35],13:11,14:[2,35],16:[2,35],32:12,33:[2,35],34:13,35:14,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{15:31,18:[1,32]},{17:33,18:[1,34]},{6:35,11:[2,28],19:36,20:37,22:[2,28],27:[1,38],33:[2,28],36:[2,28],38:[2,28],41:[2,28],42:[2,28],46:[2,28],47:[2,28],48:[2,28],51:[2,28],52:[2,28],53:[2,28],55:[2,28],56:[2,28]},{5:[2,5]},{5:[2,6]},{5:[2,8],11:[2,8],12:[2,8],14:[2,8],16:[2,8]},{5:[2,31],11:[2,31],12:[2,31],14:[2,31],16:[2,31],22:[2,31],33:[1,39]},{5:[2,34],11:[2,34],12:[2,34],14:[2,34],16:[2,34],22:[2,34],33:[2,34],35:40,36:[1,15],37:[2,34],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,37],11:[2,37],12:[2,37],14:[2,37],16:[2,37],22:[2,37],30:[1,42],33:[2,37],36:[2,37],37:[2,37],38:[2,37],39:[1,41],40:[1,43],41:[2,37],42:[2,37],44:44,46:[2,37],47:[2,37],48:[2,37],51:[2,37],52:[2,37],53:[2,37],54:[1,45],55:[2,37],56:[2,37]},{32:46,33:[2,35],34:13,35:14,36:[1,15],37:[2,35],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{32:47,33:[2,35],34:13,35:14,36:[1,15],37:[2,35],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{35:48,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{35:49,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,45],11:[2,45],12:[2,45],14:[2,45],16:[2,45],22:[2,45],30:[2,45],33:[2,45],36:[2,45],37:[2,45],38:[2,45],39:[2,45],40:[2,45],41:[2,45],42:[2,45],46:[2,45],47:[2,45],48:[2,45],51:[2,45],52:[2,45],53:[2,45],54:[2,45],55:[2,45],56:[2,45]},{5:[2,47],11:[2,47],12:[2,47],14:[2,47],16:[2,47],22:[2,47],30:[2,47],33:[2,47],36:[2,47],37:[2,47],38:[2,47],39:[2,47],40:[2,47],41:[2,47],42:[2,47],46:[2,47],47:[2,47],48:[2,47],51:[2,47],52:[2,47],53:[2,47],54:[2,47],55:[2,47],56:[2,47]},{5:[2,48],11:[2,48],12:[2,48],14:[2,48],16:[2,48],22:[2,48],30:[2,48],33:[2,48],36:[2,48],37:[2,48],38:[2,48],39:[2,48],40:[2,48],41:[2,48],42:[2,48],46:[2,48],47:[2,48],48:[2,48],51:[2,48],52:[2,48],53:[2,48],54:[2,48],55:[2,48],56:[2,48]},{5:[2,49],11:[2,49],12:[2,49],14:[2,49],16:[2,49],22:[2,49],30:[2,49],33:[2,49],36:[2,49],37:[2,49],38:[2,49],39:[2,49],40:[2,49],41:[2,49],42:[2,49],46:[2,49],47:[2,49],48:[2,49],51:[2,49],52:[2,49],53:[2,49],54:[2,49],55:[2,49],56:[2,49]},{5:[2,50],11:[2,50],12:[2,50],14:[2,50],16:[2,50],22:[2,50],30:[2,50],33:[2,50],36:[2,50],37:[2,50],38:[2,50],39:[2,50],40:[2,50],41:[2,50],42:[2,50],46:[2,50],47:[2,50],48:[2,50],51:[2,50],52:[2,50],53:[2,50],54:[2,50],55:[2,50],56:[2,50]},{5:[2,51],11:[2,51],12:[2,51],14:[2,51],16:[2,51],22:[2,51],30:[2,51],33:[2,51],36:[2,51],37:[2,51],38:[2,51],39:[2,51],40:[2,51],41:[2,51],42:[2,51],46:[2,51],47:[2,51],48:[2,51],51:[2,51],52:[2,51],53:[2,51],54:[2,51],55:[2,51],56:[2,51]},{5:[2,52],11:[2,52],12:[2,52],14:[2,52],16:[2,52],22:[2,52],30:[2,52],33:[2,52],36:[2,52],37:[2,52],38:[2,52],39:[2,52],40:[2,52],41:[2,52],42:[2,52],46:[2,52],47:[2,52],48:[2,52],51:[2,52],52:[2,52],53:[2,52],54:[2,52],55:[2,52],56:[2,52]},{5:[2,53],11:[2,53],12:[2,53],14:[2,53],16:[2,53],22:[2,53],30:[2,53],33:[2,53],36:[2,53],37:[2,53],38:[2,53],39:[2,53],40:[2,53],41:[2,53],42:[2,53],46:[2,53],47:[2,53],48:[2,53],51:[2,53],52:[2,53],53:[2,53],54:[2,53],55:[2,53],56:[2,53]},{5:[2,54],11:[2,54],12:[2,54],14:[2,54],16:[2,54],22:[2,54],30:[2,54],33:[2,54],36:[2,54],37:[2,54],38:[2,54],39:[2,54],40:[2,54],41:[2,54],42:[2,54],46:[2,54],47:[2,54],48:[2,54],51:[2,54],52:[2,54],53:[2,54],54:[2,54],55:[2,54],56:[2,54]},{5:[2,57],11:[2,57],12:[2,57],14:[2,57],16:[2,57],22:[2,57],30:[2,57],33:[2,57],36:[2,57],37:[2,57],38:[2,57],39:[2,57],40:[2,57],41:[2,57],42:[2,57],46:[2,57],47:[2,57],48:[2,57],51:[2,57],52:[2,57],53:[2,57],54:[2,57],55:[2,57],56:[2,57]},{5:[2,58],11:[2,58],12:[2,58],14:[2,58],16:[2,58],22:[2,58],30:[2,58],33:[2,58],36:[2,58],37:[2,58],38:[2,58],39:[2,58],40:[2,58],41:[2,58],42:[2,58],46:[2,58],47:[2,58],48:[2,58],51:[2,58],52:[2,58],53:[2,58],54:[2,58],55:[2,58],56:[2,58]},{5:[2,55],11:[2,55],12:[2,55],14:[2,55],16:[2,55],22:[2,55],30:[2,55],33:[2,55],36:[2,55],37:[2,55],38:[2,55],39:[2,55],40:[2,55],41:[2,55],42:[2,55],46:[2,55],47:[2,55],48:[2,55],51:[2,55],52:[2,55],53:[2,55],54:[2,55],55:[2,55],56:[2,55]},{5:[2,9],11:[2,9],12:[2,9],14:[2,9],16:[2,9],18:[1,50]},{5:[2,11],11:[2,11],12:[2,11],14:[2,11],16:[2,11],18:[2,11]},{5:[2,10],11:[2,10],12:[2,10],14:[2,10],16:[2,10],18:[1,51]},{5:[2,13],11:[2,13],12:[2,13],14:[2,13],16:[2,13],18:[2,13]},{5:[1,55],7:52,8:[1,54],11:[2,28],19:53,20:37,22:[2,28],27:[1,38],33:[2,28],36:[2,28],38:[2,28],41:[2,28],42:[2,28],46:[2,28],47:[2,28],48:[2,28],51:[2,28],52:[2,28],53:[2,28],55:[2,28],56:[2,28]},{5:[2,16],8:[2,16],11:[2,16],22:[2,16],27:[2,16],33:[2,16],36:[2,16],38:[2,16],41:[2,16],42:[2,16],46:[2,16],47:[2,16],48:[2,16],51:[2,16],52:[2,16],53:[2,16],55:[2,16],56:[2,16]},{11:[2,35],13:56,22:[2,35],32:12,33:[2,35],34:13,35:14,36:[1,15],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{12:[1,59],28:57,30:[1,58]},{5:[2,33],11:[2,33],12:[2,33],14:[2,33],16:[2,33],22:[2,33],33:[2,33],34:60,35:14,36:[1,15],37:[2,33],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,36],11:[2,36],12:[2,36],14:[2,36],16:[2,36],22:[2,36],30:[1,42],33:[2,36],36:[2,36],37:[2,36],38:[2,36],39:[1,41],40:[1,43],41:[2,36],42:[2,36],44:44,46:[2,36],47:[2,36],48:[2,36],51:[2,36],52:[2,36],53:[2,36],54:[1,45],55:[2,36],56:[2,36]},{5:[2,40],11:[2,40],12:[2,40],14:[2,40],16:[2,40],22:[2,40],30:[2,40],33:[2,40],36:[2,40],37:[2,40],38:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],46:[2,40],47:[2,40],48:[2,40],51:[2,40],52:[2,40],53:[2,40],54:[2,40],55:[2,40],56:[2,40]},{5:[2,41],11:[2,41],12:[2,41],14:[2,41],16:[2,41],22:[2,41],30:[2,41],33:[2,41],36:[2,41],37:[2,41],38:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],46:[2,41],47:[2,41],48:[2,41],51:[2,41],52:[2,41],53:[2,41],54:[2,41],55:[2,41],56:[2,41]},{5:[2,42],11:[2,42],12:[2,42],14:[2,42],16:[2,42],22:[2,42],30:[2,42],33:[2,42],36:[2,42],37:[2,42],38:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],46:[2,42],47:[2,42],48:[2,42],51:[2,42],52:[2,42],53:[2,42],54:[2,42],55:[2,42],56:[2,42]},{5:[2,46],11:[2,46],12:[2,46],14:[2,46],16:[2,46],22:[2,46],30:[2,46],33:[2,46],36:[2,46],37:[2,46],38:[2,46],39:[2,46],40:[2,46],41:[2,46],42:[2,46],46:[2,46],47:[2,46],48:[2,46],51:[2,46],52:[2,46],53:[2,46],54:[2,46],55:[2,46],56:[2,46]},{5:[2,56],11:[2,56],12:[2,56],14:[2,56],16:[2,56],22:[2,56],30:[2,56],33:[2,56],36:[2,56],37:[2,56],38:[2,56],39:[2,56],40:[2,56],41:[2,56],42:[2,56],46:[2,56],47:[2,56],48:[2,56],51:[2,56],52:[2,56],53:[2,56],54:[2,56],55:[2,56],56:[2,56]},{33:[1,39],37:[1,61]},{33:[1,39],37:[1,62]},{5:[2,43],11:[2,43],12:[2,43],14:[2,43],16:[2,43],22:[2,43],30:[1,42],33:[2,43],36:[2,43],37:[2,43],38:[2,43],39:[1,41],40:[1,43],41:[2,43],42:[2,43],44:44,46:[2,43],47:[2,43],48:[2,43],51:[2,43],52:[2,43],53:[2,43],54:[1,45],55:[2,43],56:[2,43]},{5:[2,44],11:[2,44],12:[2,44],14:[2,44],16:[2,44],22:[2,44],30:[1,42],33:[2,44],36:[2,44],37:[2,44],38:[2,44],39:[1,41],40:[1,43],41:[2,44],42:[2,44],44:44,46:[2,44],47:[2,44],48:[2,44],51:[2,44],52:[2,44],53:[2,44],54:[1,45],55:[2,44],56:[2,44]},{5:[2,12],11:[2,12],12:[2,12],14:[2,12],16:[2,12],18:[2,12]},{5:[2,14],11:[2,14],12:[2,14],14:[2,14],16:[2,14],18:[2,14]},{1:[2,1]},{5:[2,15],8:[2,15],11:[2,15],22:[2,15],27:[2,15],33:[2,15],36:[2,15],38:[2,15],41:[2,15],42:[2,15],46:[2,15],47:[2,15],48:[2,15],51:[2,15],52:[2,15],53:[2,15],55:[2,15],56:[2,15]},{1:[2,2]},{8:[1,63],9:[1,64]},{11:[1,67],21:65,22:[1,66]},{29:[1,68],31:[1,69]},{29:[1,70]},{29:[2,29],31:[2,29]},{5:[2,32],11:[2,32],12:[2,32],14:[2,32],16:[2,32],22:[2,32],33:[2,32],35:40,36:[1,15],37:[2,32],38:[1,16],41:[1,17],42:[1,18],43:19,45:20,46:[1,21],47:[1,22],48:[1,23],49:24,50:25,51:[1,26],52:[1,27],53:[1,30],55:[1,28],56:[1,29]},{5:[2,38],11:[2,38],12:[2,38],14:[2,38],16:[2,38],22:[2,38],30:[2,38],33:[2,38],36:[2,38],37:[2,38],38:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],46:[2,38],47:[2,38],48:[2,38],51:[2,38],52:[2,38],53:[2,38],54:[2,38],55:[2,38],56:[2,38]},{5:[2,39],11:[2,39],12:[2,39],14:[2,39],16:[2,39],22:[2,39],30:[2,39],33:[2,39],36:[2,39],37:[2,39],38:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],46:[2,39],47:[2,39],48:[2,39],51:[2,39],52:[2,39],53:[2,39],54:[2,39],55:[2,39],56:[2,39]},{1:[2,3]},{8:[1,71]},{5:[2,17],8:[2,17],11:[2,17],22:[2,17],27:[2,17],33:[2,17],36:[2,17],38:[2,17],41:[2,17],42:[2,17],46:[2,17],47:[2,17],48:[2,17],51:[2,17],52:[2,17],53:[2,17],55:[2,17],56:[2,17]},{22:[2,20],23:72,24:[2,20],25:73,26:[1,74]},{5:[2,19],8:[2,19],11:[2,19],22:[2,19],27:[2,19],33:[2,19],36:[2,19],38:[2,19],41:[2,19],42:[2,19],46:[2,19],47:[2,19],48:[2,19],51:[2,19],52:[2,19],53:[2,19],55:[2,19],56:[2,19]},{11:[2,26],22:[2,26],33:[2,26],36:[2,26],38:[2,26],41:[2,26],42:[2,26],46:[2,26],47:[2,26],48:[2,26],51:[2,26],52:[2,26],53:[2,26],55:[2,26],56:[2,26]},{12:[1,75]},{11:[2,27],22:[2,27],33:[2,27],36:[2,27],38:[2,27],41:[2,27],42:[2,27],46:[2,27],47:[2,27],48:[2,27],51:[2,27],52:[2,27],53:[2,27],55:[2,27],56:[2,27]},{1:[2,4]},{22:[1,77],24:[1,76]},{22:[2,21],24:[2,21],26:[1,78]},{22:[2,24],24:[2,24],26:[2,24]},{29:[2,30],31:[2,30]},{5:[2,18],8:[2,18],11:[2,18],22:[2,18],27:[2,18],33:[2,18],36:[2,18],38:[2,18],41:[2,18],42:[2,18],46:[2,18],47:[2,18],48:[2,18],51:[2,18],52:[2,18],53:[2,18],55:[2,18],56:[2,18]},{22:[2,20],23:79,24:[2,20],25:73,26:[1,74]},{22:[2,25],24:[2,25],26:[2,25]},{22:[1,77],24:[1,80]},{22:[2,23],24:[2,23],25:81,26:[1,74]},{22:[2,22],24:[2,22],26:[1,78]}],defaultActions:{9:[2,5],10:[2,6],52:[2,1],54:[2,2],63:[2,3],71:[2,4]},parseError:function(e,t){if(!t.recoverable)throw new Error(e);this.trace(e)},parse:function(e){var t=this,n=[0],r=[null],i=[],o=this.table,s="",a=0,l=0,c=0,u=1;this.lexer.setInput(e),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,void 0===this.lexer.yylloc&&(this.lexer.yylloc={});var h=this.lexer.yylloc;i.push(h);var p=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError?this.parseError=this.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var f,m,d,g,y,b,x,v,_,S,k={};;){if(d=n[n.length-1],this.defaultActions[d]?g=this.defaultActions[d]:(null==f&&(S=void 0,"number"!=typeof(S=t.lexer.lex()||u)&&(S=t.symbols_[S]||S),f=S),g=o[d]&&o[d][f]),void 0===g||!g.length||!g[0]){var w="";for(b in _=[],o[d])this.terminals_[b]&&b>2&&_.push("'"+this.terminals_[b]+"'");w=this.lexer.showPosition?"Parse error on line "+(a+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[f]||f)+"'":"Parse error on line "+(a+1)+": Unexpected "+(f==u?"end of input":"'"+(this.terminals_[f]||f)+"'"),this.parseError(w,{text:this.lexer.match,token:this.terminals_[f]||f,line:this.lexer.yylineno,loc:h,expected:_})}if(g[0]instanceof Array&&g.length>1)throw new Error("Parse Error: multiple actions possible at state: "+d+", token: "+f);switch(g[0]){case 1:n.push(f),r.push(this.lexer.yytext),i.push(this.lexer.yylloc),n.push(g[1]),f=null,m?(f=m,m=null):(l=this.lexer.yyleng,s=this.lexer.yytext,a=this.lexer.yylineno,h=this.lexer.yylloc,c>0&&c--);break;case 2:if(x=this.productions_[g[1]][1],k.$=r[r.length-x],k._$={first_line:i[i.length-(x||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(x||1)].first_column,last_column:i[i.length-1].last_column},p&&(k._$.range=[i[i.length-(x||1)].range[0],i[i.length-1].range[1]]),void 0!==(y=this.performAction.call(k,s,l,a,this.yy,g[1],r,i)))return y;x&&(n=n.slice(0,-1*x*2),r=r.slice(0,-1*x),i=i.slice(0,-1*x)),n.push(this.productions_[g[1]][0]),r.push(k.$),i.push(k._$),v=o[n[n.length-2]][n[n.length-1]],n.push(v);break;case 3:return!0}}return!0}};var t={EOF:1,parseError:function(e,t){if(!this.yy.parser)throw new Error(e);this.yy.parser.parseError(e,t)},setInput:function(e){return this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t-1),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),(r=e[0].match(/(?:\r\n?|\n).*/g))&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},next:function(){if(this.done)return this.EOF;var e,t,n,r;this._input||(this.done=!0),this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),o=0;o<i.length;o++)if((n=this._input.match(this.rules[i[o]]))&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(!1!==(e=this.test_match(n,i[o])))return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}return t?!1!==(e=this.test_match(t,i[r]))&&e:""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var e=this.next();return e||this.lex()},begin:function(e){this.conditionStack.push(e)},popState:function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(e){return(e=this.conditionStack.length-1-Math.abs(e||0))>=0?this.conditionStack[e]:"INITIAL"},pushState:function(e){this.begin(e)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(e,t,n,r){switch(n){case 0:case 1:case 2:case 3:case 4:case 5:case 6:return 26;case 7:return e.depth++,22;case 8:return 0==e.depth?this.begin("trail"):e.depth--,24;case 9:return 12;case 10:return this.popState(),29;case 11:return 31;case 12:return 30;case 13:case 14:break;case 15:this.begin("indented");break;case 16:return this.begin("code"),5;case 17:return 56;case 18:e.options[t.yytext]=!0;break;case 19:case 20:this.begin("INITIAL");break;case 21:break;case 22:return 18;case 23:case 24:this.begin("INITIAL");break;case 25:break;case 26:this.begin("rules");break;case 27:return e.depth=0,this.begin("action"),22;case 28:return this.begin("trail"),t.yytext=t.yytext.substr(2,t.yytext.length-4),11;case 29:return t.yytext=t.yytext.substr(2,t.yytext.length-4),11;case 30:return this.begin("rules"),11;case 31:case 32:case 33:case 34:break;case 35:return 12;case 36:return t.yytext=t.yytext.replace(/\\"/g,'"'),55;case 37:return t.yytext=t.yytext.replace(/\\'/g,"'"),55;case 38:return 33;case 39:return 52;case 40:case 41:case 42:return 38;case 43:return 36;case 44:return 37;case 45:return 39;case 46:return 30;case 47:return 40;case 48:return 47;case 49:return 31;case 50:return 48;case 51:return this.begin("conditions"),27;case 52:return 42;case 53:return 41;case 54:return 53;case 55:return t.yytext=t.yytext.replace(/^\\/g,""),53;case 56:return 48;case 57:return 46;case 58:e.options={},this.begin("options");break;case 59:return this.begin("start_condition"),14;case 60:return this.begin("start_condition"),16;case 61:return this.begin("rules"),5;case 62:return 54;case 63:return 51;case 64:return 22;case 65:return 24;case 66:break;case 67:return 8;case 68:return 9}},rules:[/^(?:\/\*(.|\n|\r)*?\*\/)/,/^(?:\/\/.*)/,/^(?:\/[^ \/]*?['"{}'][^ ]*?\/)/,/^(?:"(\\\\|\\"|[^"])*")/,/^(?:'(\\\\|\\'|[^'])*')/,/^(?:[\/"'][^{}\/"']+)/,/^(?:[^{}\/"']+)/,/^(?:\{)/,/^(?:\})/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:>)/,/^(?:,)/,/^(?:\*)/,/^(?:(\r\n|\n|\r)+)/,/^(?:\s+(\r\n|\n|\r)+)/,/^(?:\s+)/,/^(?:%%)/,/^(?:[a-zA-Z0-9_]+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:(\r\n|\n|\r)+)/,/^(?:\s+(\r\n|\n|\r)+)/,/^(?:\s+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:(\r\n|\n|\r)+)/,/^(?:\s+(\r\n|\n|\r)+)/,/^(?:\s+)/,/^(?:.*(\r\n|\n|\r)+)/,/^(?:\{)/,/^(?:%\{(.|(\r\n|\n|\r))*?%\})/,/^(?:%\{(.|(\r\n|\n|\r))*?%\})/,/^(?:.+)/,/^(?:\/\*(.|\n|\r)*?\*\/)/,/^(?:\/\/.*)/,/^(?:(\r\n|\n|\r)+)/,/^(?:\s+)/,/^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,/^(?:"(\\\\|\\"|[^"])*")/,/^(?:'(\\\\|\\'|[^'])*')/,/^(?:\|)/,/^(?:\[(\\\\|\\\]|[^\]])*\])/,/^(?:\(\?:)/,/^(?:\(\?=)/,/^(?:\(\?!)/,/^(?:\()/,/^(?:\))/,/^(?:\+)/,/^(?:\*)/,/^(?:\?)/,/^(?:\^)/,/^(?:,)/,/^(?:<<EOF>>)/,/^(?:<)/,/^(?:\/!)/,/^(?:\/)/,/^(?:\\([0-7]{1,3}|[rfntvsSbBwWdD\\*+()${}|[\]\/.^?]|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}))/,/^(?:\\.)/,/^(?:\$)/,/^(?:\.)/,/^(?:%options\b)/,/^(?:%s\b)/,/^(?:%x\b)/,/^(?:%%)/,/^(?:\{\d+(,\s?\d+|,)?\})/,/^(?:\{([a-zA-Z_][a-zA-Z0-9_-]*)\})/,/^(?:\{)/,/^(?:\})/,/^(?:.)/,/^(?:$)/,/^(?:(.|(\r\n|\n|\r))+)/],conditions:{code:{rules:[67,68],inclusive:!1},start_condition:{rules:[22,23,24,25,67],inclusive:!1},options:{rules:[18,19,20,21,67],inclusive:!1},conditions:{rules:[9,10,11,12,67],inclusive:!1},action:{rules:[0,1,2,3,4,5,6,7,8,67],inclusive:!1},indented:{rules:[27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],inclusive:!0},trail:{rules:[26,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],inclusive:!0},rules:{rules:[13,14,15,16,17,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],inclusive:!0},INITIAL:{rules:[29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67],inclusive:!0}}};function n(){this.yy={}}return e.lexer=t,n.prototype=e,e.Parser=n,new n}();t.parser=i,t.Parser=i.Parser,t.parse=function(){return i.parse.apply(i,arguments)},t.main=function(r){r[1]||(console.log("Usage: "+r[0]+" FILE"),e.exit(1));var i=n(2).readFileSync(n(3).normalize(r[1]),"utf8");return t.parser.parse(i)},n.c[n.s]===r&&t.main(e.argv.slice(1))}).call(this,n(1),n(0)(e))},function(e,t,n){var r,i,o,s,a=(r=n(17),i=function(e,t){return e.reduce(function(e,n){return function(e,t,n){var r=e[0],s=e[1],a=!1;if("xalias"===r&&(r=e[1],s=e[2],a=e[3],r?e=e.slice(1,2):(r=(e=s)[0],s=e[1])),"symbol"===r)n(("\\"===e[1][0]?e[1][1]:"'"===e[1][0]?e[1].substring(1,e[1].length-1):e[1])+(a?"["+a+"]":""));else if("+"===r){a||(a=t.production+"_repetition_plus"+t.repid++),n(a),t=o(a,t.grammar);var l=i([s],t);t.grammar[a]=[[l,"$$ = [$1];"],[a+" "+l,"$1.push($2);"]]}else"*"===r?(a||(a=t.production+"_repetition"+t.repid++),n(a),(t=o(a,t.grammar)).grammar[a]=[["","$$ = [];"],[a+" "+i([s],t),"$1.push($2);"]]):"?"===r?(a||(a=t.production+"_option"+t.optid++),n(a),(t=o(a,t.grammar)).grammar[a]=["",i([s],t)]):"()"===r&&(1==s.length?n(i(s[0],t)):(a||(a=t.production+"_group"+t.groupid++),n(a),(t=o(a,t.grammar)).grammar[a]=s.map(function(e){return i(e,t)})))}(n,t,function(t){e.push(t)}),e},[]).join(" ")},o=function(e,t){return{production:e,repid:0,groupid:0,optid:0,grammar:t}},s=function(e){Object.keys(e).forEach(function(t){e[t]=function(e,t,n){var s=o(e,n);return t.map(function(e){var t=null,n=null;"string"!=typeof e&&(t=e[1],n=e[2],e=e[0]);var o=r.parse(e),a=[e=i(o,s)];return t&&a.push(t),n&&a.push(n),1==a.length?a[0]:a})}(t,e[t],e)})},{transform:function(e){return s(e),e}});t.transform=a.transform},function(e,t){!function(){"use strict";var t;function n(e){return e>=48&&e<=57}t={NonAsciiIdentifierStart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),NonAsciiIdentifierPart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")},e.exports={isDecimalDigit:n,isHexDigit:function(e){return n(e)||97<=e&&e<=102||65<=e&&e<=70},isOctalDigit:function(e){return e>=48&&e<=55},isWhiteSpace:function(e){return 32===e||9===e||11===e||12===e||160===e||e>=5760&&[5760,6158,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(e)>=0},isLineTerminator:function(e){return 10===e||13===e||8232===e||8233===e},isIdentifierStart:function(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||92===e||e>=128&&t.NonAsciiIdentifierStart.test(String.fromCharCode(e))},isIdentifierPart:function(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||92===e||e>=128&&t.NonAsciiIdentifierPart.test(String.fromCharCode(e))}}}()},function(e,t,n){jb.jisonParser=n(11)},function(module,exports,__webpack_require__){(function(process){var typal=__webpack_require__(6).typal,Set=__webpack_require__(12).Set,Lexer=__webpack_require__(13),ebnfParser=__webpack_require__(15),JSONSelect=__webpack_require__(18),esprima=__webpack_require__(19),escodegen=__webpack_require__(20),version=__webpack_require__(30).version,Jison=exports.Jison=exports;Jison.version=version,"undefined"!=typeof console&&console.log?Jison.print=console.log:"undefined"!=typeof puts?Jison.print=function(){puts([].join.call(arguments," "))}:"undefined"!=typeof print?Jison.print=print:Jison.print=function(){},Jison.Parser=function(){function each(e,t){var n;if(e.forEach)e.forEach(t);else for(n in e)e.hasOwnProperty(n)&&t.call(e,e[n],n,e)}var Nonterminal=typal.construct({constructor:function(e){this.symbol=e,this.productions=new Set,this.first=[],this.follows=[],this.nullable=!1},toString:function(){var e=this.symbol+"\n";return e+=this.nullable?"nullable":"not nullable",e+="\nFirsts: "+this.first.join(", "),e+="\nFollows: "+this.first.join(", "),e+="\nProductions:\n  "+this.productions.join("\n  ")}}),Production=typal.construct({constructor:function(e,t,n){this.symbol=e,this.handle=t,this.nullable=!1,this.id=n,this.first=[],this.precedence=0},toString:function(){return this.symbol+" -> "+this.handle.join(" ")}}),generator=typal.beget();function processOperators(e){if(!e)return{};for(var t,n,r={},i=0;n=e[i];i++)for(t=1;t<n.length;t++)r[n[t]]={precedence:i+1,assoc:n[0]};return r}generator.constructor=function(e,t){"string"==typeof e&&(e=ebnfParser.parse(e));var n=typal.mix.call({},e.options,t);this.terms={},this.operators={},this.productions=[],this.conflicts=0,this.resolutions=[],this.options=n,this.parseParams=e.parseParams,this.yy={},e.actionInclude&&("function"==typeof e.actionInclude&&(e.actionInclude=String(e.actionInclude).replace(/^\s*function \(\) \{/,"").replace(/\}\s*$/,"")),this.actionInclude=e.actionInclude),this.moduleInclude=e.moduleInclude||"",this.DEBUG=n.debug||!1,this.DEBUG&&this.mix(generatorDebug),this.processGrammar(e),e.lex&&(this.lexer=new Lexer(e.lex,null,this.terminals_))},generator.processGrammar=function(e){var t=e.bnf,n=e.tokens,r=this.nonterminals={},i=this.productions;!e.bnf&&e.ebnf&&(t=e.bnf=ebnfParser.transform(e.ebnf)),n&&(n="string"==typeof n?n.trim().split(" "):n.slice(0));var o=this.symbols=[],s=this.operators=processOperators(e.operators);this.buildProductions(t,i,r,o,s),n&&this.terminals.length!==n.length&&(this.trace("Warning: declared tokens differ from tokens found in rules."),this.trace(this.terminals),this.trace(n)),this.augmentGrammar(e)},generator.augmentGrammar=function(e){if(0===this.productions.length)throw new Error("Grammar error: must have at least one rule.");if(this.startSymbol=e.start||e.startSymbol||this.productions[0].symbol,!this.nonterminals[this.startSymbol])throw new Error("Grammar error: startSymbol must be a non-terminal found in your grammar.");this.EOF="$end";var t=new Production("$accept",[this.startSymbol,"$end"],0);this.productions.unshift(t),this.symbols.unshift("$accept",this.EOF),this.symbols_.$accept=0,this.symbols_[this.EOF]=1,this.terminals.unshift(this.EOF),this.nonterminals.$accept=new Nonterminal("$accept"),this.nonterminals.$accept.productions.push(t),this.nonterminals[this.startSymbol].follows.push(this.EOF)},generator.buildProductions=function(e,t,n,r,i){var o,s=["/* this == yyval */",this.actionInclude||"","var $0 = $$.length - 1;","switch (yystate) {"],a={},l=[0],c=1,u={},h=!1;function p(e){e&&!u[e]&&(u[e]=++c,r.push(e))}for(o in p("error"),e)e.hasOwnProperty(o)&&(p(o),n[o]=new Nonterminal(o),("string"==typeof e[o]?e[o].split(/\s*\|\s*/g):e[o].slice(0)).forEach(y));for(var f in a)s.push(a[f].join(" "),f,"break;");var m=[],d={};each(u,function(e,t){n[t]||(m.push(t),d[e]=t)}),this.hasErrorRecovery=h,this.terminals=m,this.terminals_=d,this.symbols_=u,this.productions_=l,s.push("}"),s=s.join("\n").replace(/YYABORT/g,"return false").replace(/YYACCEPT/g,"return true");var g="yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */";function y(e){var r,s,c;if(e.constructor===Array){for(s="string"==typeof e[0]?e[0].trim().split(" "):e[0].slice(0),c=0;c<s.length;c++)"error"===s[c]&&(h=!0),u[s[c]]||p(s[c]);if("string"==typeof e[1]||3==e.length){var f="case "+(t.length+1)+":",m=e[1];if(m.match(/[$@][a-zA-Z][a-zA-Z0-9_]*/)){var d={},g={};for(c=0;c<s.length;c++){var y=s[c].match(/\[[a-zA-Z][a-zA-Z0-9_-]*\]/);y?(y=y[0].substr(1,y[0].length-2),s[c]=s[c].substr(0,s[c].indexOf("["))):y=s[c],g[y]?g[y+ ++d[y]]=c+1:(g[y]=c+1,g[y+"1"]=c+1,d[y]=1)}m=m.replace(/\$([a-zA-Z][a-zA-Z0-9_]*)/g,function(e,t){return g[t]?"$"+g[t]:e}).replace(/@([a-zA-Z][a-zA-Z0-9_]*)/g,function(e,t){return g[t]?"@"+g[t]:e})}(m=m.replace(/([^'"])\$\$|^\$\$/g,"$1this.$").replace(/@[0$]/g,"this._$").replace(/\$(-?\d+)/g,function(e,t){return"$$[$0"+(parseInt(t,10)-s.length||"")+"]"}).replace(/@(-?\d+)/g,function(e,t){return"_$[$0"+(t-s.length||"")+"]"}))in a?a[m].push(f):a[m]=[f],s=s.map(function(e,t){return e.replace(/\[[a-zA-Z_][a-zA-Z0-9_-]*\]/g,"")}),r=new Production(o,s,t.length+1),e[2]&&i[e[2].prec]&&(r.precedence=i[e[2].prec].precedence)}else s=s.map(function(e,t){return e.replace(/\[[a-zA-Z_][a-zA-Z0-9_-]*\]/g,"")}),r=new Production(o,s,t.length+1),i[e[1].prec]&&(r.precedence=i[e[1].prec].precedence)}else{for(e=e.replace(/\[[a-zA-Z_][a-zA-Z0-9_-]*\]/g,""),s=e.trim().split(" "),c=0;c<s.length;c++)"error"===s[c]&&(h=!0),u[s[c]]||p(s[c]);r=new Production(o,s,t.length+1)}if(0===r.precedence)for(c=r.handle.length-1;c>=0;c--)!(r.handle[c]in n)&&r.handle[c]in i&&(r.precedence=i[r.handle[c]].precedence);t.push(r),l.push([u[r.symbol],""===r.handle[0]?0:r.handle.length]),n[o].productions.push(r)}this.parseParams&&(g+=", "+this.parseParams.join(", ")),this.performAction="function anonymous("+g+") {\n"+s+"\n}"},generator.createParser=function(){throw new Error("Calling abstract method.")},generator.trace=function(){},generator.warn=function(){var e=Array.prototype.slice.call(arguments,0);Jison.print.call(null,e.join(""))},generator.error=function(e){throw new Error(e)};var generatorDebug={trace:function(){Jison.print.apply(null,arguments)},beforeprocessGrammar:function(){this.trace("Processing grammar.")},afteraugmentGrammar:function(){var e=this.trace;each(this.symbols,function(t,n){e(t+"("+n+")")})}},lookaheadMixin={computeLookaheads:function(){this.DEBUG&&this.mix(lookaheadDebug),this.computeLookaheads=function(){},this.nullableSets(),this.firstSets(),this.followSets()},followSets:function(){for(var e=this.productions,t=this.nonterminals,n=this,r=!0;r;)r=!1,e.forEach(function(e,i){for(var o,s,a,l=!!n.go_,c=[],u=0;a=e.handle[u];++u)if(t[a]){l&&(o=n.go_(e.symbol,e.handle.slice(0,u)));var h=!l||o===parseInt(n.nterms_[a],10);if(u===e.handle.length+1&&h)c=t[e.symbol].follows;else{var p=e.handle.slice(u+1);c=n.first(p),n.nullable(p)&&h&&c.push.apply(c,t[e.symbol].follows)}s=t[a].follows.length,Set.union(t[a].follows,c),s!==t[a].follows.length&&(r=!0)}})},first:function(e){if(""===e)return[];if(e instanceof Array){for(var t,n=[],r=0;(t=e[r])&&(this.nonterminals[t]?Set.union(n,this.nonterminals[t].first):-1===n.indexOf(t)&&n.push(t),this.nullable(t));++r);return n}return this.nonterminals[e]?this.nonterminals[e].first:[e]},firstSets:function(){for(var e,t,n=this.productions,r=this.nonterminals,i=this,o=!0;o;)for(e in o=!1,n.forEach(function(e,t){var n=i.first(e.handle);n.length!==e.first.length&&(e.first=n,o=!0)}),r)t=[],r[e].productions.forEach(function(e){Set.union(t,e.first)}),t.length!==r[e].first.length&&(r[e].first=t,o=!0)},nullableSets:function(){this.firsts={};for(var e=this.nonterminals,t=this,n=!0;n;)for(var r in n=!1,this.productions.forEach(function(e,r){if(!e.nullable){for(var i,o=0,s=0;i=e.handle[o];++o)t.nullable(i)&&s++;s===o&&(e.nullable=n=!0)}}),e)if(!this.nullable(r))for(var i,o=0;i=e[r].productions.item(o);o++)i.nullable&&(e[r].nullable=n=!0)},nullable:function(e){if(""===e)return!0;if(e instanceof Array){for(var t,n=0;t=e[n];++n)if(!this.nullable(t))return!1;return!0}return!!this.nonterminals[e]&&this.nonterminals[e].nullable}},lookaheadDebug={beforenullableSets:function(){this.trace("Computing Nullable sets.")},beforefirstSets:function(){this.trace("Computing First sets.")},beforefollowSets:function(){this.trace("Computing Follow sets.")},afterfollowSets:function(){var e=this.trace;each(this.nonterminals,function(t,n){e(t,"\n")})}},lrGeneratorMixin={buildTable:function(){this.DEBUG&&this.mix(lrGeneratorDebug),this.states=this.canonicalCollection(),this.table=this.parseTable(this.states),this.defaultActions=findDefaults(this.table)}};lrGeneratorMixin.Item=typal.construct({constructor:function(e,t,n,r){this.production=e,this.dotPosition=t||0,this.follows=n||[],this.predecessor=r,this.id=parseInt(e.id+"a"+this.dotPosition,36),this.markedSymbol=this.production.handle[this.dotPosition]},remainingHandle:function(){return this.production.handle.slice(this.dotPosition+1)},eq:function(e){return e.id===this.id},handleToString:function(){var e=this.production.handle.slice(0);return e[this.dotPosition]="."+(e[this.dotPosition]||""),e.join(" ")},toString:function(){var e=this.production.handle.slice(0);return e[this.dotPosition]="."+(e[this.dotPosition]||""),this.production.symbol+" -> "+e.join(" ")+(0===this.follows.length?"":" #lookaheads= "+this.follows.join(" "))}}),lrGeneratorMixin.ItemSet=Set.prototype.construct({afterconstructor:function(){this.reductions=[],this.goes={},this.edges={},this.shifts=!1,this.inadequate=!1,this.hash_={};for(var e=this._items.length-1;e>=0;e--)this.hash_[this._items[e].id]=!0},concat:function(e){for(var t=e._items||e,n=t.length-1;n>=0;n--)this.hash_[t[n].id]=!0;return this._items.push.apply(this._items,t),this},push:function(e){return this.hash_[e.id]=!0,this._items.push(e)},contains:function(e){return this.hash_[e.id]},valueOf:function(){var e=this._items.map(function(e){return e.id}).sort().join("|");return this.valueOf=function(){return e},e}}),lrGeneratorMixin.closureOperation=function(e){var t,n=new this.ItemSet,r=this,i=e,o={};do{t=new Set,n.concat(i),i.forEach(function(e){var i=e.markedSymbol;i&&r.nonterminals[i]?o[i]||(r.nonterminals[i].productions.forEach(function(e){var i=new r.Item(e,0);n.contains(i)||t.push(i)}),o[i]=!0):i?(n.shifts=!0,n.inadequate=n.reductions.length>0):(n.reductions.push(e),n.inadequate=n.reductions.length>1||n.shifts)}),i=t}while(!t.isEmpty());return n},lrGeneratorMixin.gotoOperation=function(e,t){var n=new this.ItemSet,r=this;return e.forEach(function(e,i){e.markedSymbol===t&&n.push(new r.Item(e.production,e.dotPosition+1,e.follows,i))}),n.isEmpty()?n:this.closureOperation(n)},lrGeneratorMixin.canonicalCollection=function(){var e,t=new this.Item(this.productions[0],0,[this.EOF]),n=this.closureOperation(new this.ItemSet(t)),r=new Set(n),i=0,o=this;for(r.has={},r.has[n]=0;i!==r.size();)e=r.item(i),i++,e.forEach(function(t){t.markedSymbol&&t.markedSymbol!==o.EOF&&o.canonicalCollectionInsert(t.markedSymbol,e,r,i-1)});return r},lrGeneratorMixin.canonicalCollectionInsert=function(e,t,n,r){var i=this.gotoOperation(t,e);if(i.predecessors||(i.predecessors={}),!i.isEmpty()){var o=i.valueOf(),s=n.has[o];-1===s||void 0===s?(n.has[o]=n.size(),t.edges[e]=n.size(),n.push(i),i.predecessors[e]=[r]):(t.edges[e]=s,n.item(s).predecessors[e].push(r))}};var NONASSOC=0;function findDefaults(e){var t={};return e.forEach(function(e,n){var r=0;for(var i in e)({}).hasOwnProperty.call(e,i)&&r++;1===r&&2===e[i][0]&&(t[n]=e[i])}),t}function resolveConflict(e,t,n,r){var i={production:e,operator:t,r:n,s:r};return 2===r[0]?(i.msg="Resolve R/R conflict (use first production declared in grammar.)",i.action=r[1]<n[1]?r:n,r[1]!==n[1]&&(i.bydefault=!0),i):(0!==e.precedence&&t?e.precedence<t.precedence?(i.msg="Resolve S/R conflict (shift for higher precedent operator.)",i.action=r):e.precedence===t.precedence?"right"===t.assoc?(i.msg="Resolve S/R conflict (shift for right associative operator.)",i.action=r):"left"===t.assoc?(i.msg="Resolve S/R conflict (reduce for left associative operator.)",i.action=n):"nonassoc"===t.assoc&&(i.msg="Resolve S/R conflict (no action for non-associative operator.)",i.action=NONASSOC):(i.msg="Resolve conflict (reduce for higher precedent production.)",i.action=n):(i.msg="Resolve S/R conflict (shift by default.)",i.bydefault=!0,i.action=r),i)}function addTokenStack(e){var t=e;try{var n=esprima.parse(t),r=esprima.parse(String(tokenStackLex)).body[0];return r.id.name="lex",JSONSelect.match(':has(:root > .label > .name:val("_token_stack"))',n)[0].body=r,escodegen.generate(n).replace(/_token_stack:\s?/,"").replace(/\\\\n/g,"\\n")}catch(e){return t}}function tokenStackLex(){var e;return"number"!=typeof(e=tstack.pop()||lexer.lex()||EOF)&&(e instanceof Array&&(tstack=e,e=tstack.pop()),e=self.symbols_[e]||e),e}function removeErrorRecovery(e){var t=e;try{var n=esprima.parse(t),r=JSONSelect.match(':has(:root > .label > .name:val("_handle_error"))',n),i=r[0].body.consequent.body[3].consequent.body;return i[0]=r[0].body.consequent.body[1],i[4].expression.arguments[1].properties.pop(),r[0].body.consequent.body=i,escodegen.generate(n).replace(/_handle_error:\s?/,"").replace(/\\\\n/g,"\\n")}catch(e){return t}}lrGeneratorMixin.parseTable=function(e){var t=[],n=this.nonterminals,r=this.operators,i={},o=this;return e.forEach(function(e,s){var a,l,c=t[s]={};for(l in e.edges)e.forEach(function(t,r){if(t.markedSymbol==l){var i=e.edges[l];n[l]?c[o.symbols_[l]]=i:c[o.symbols_[l]]=[1,i]}});e.forEach(function(e,t){e.markedSymbol==o.EOF&&(c[o.symbols_[o.EOF]]=[3])});var u=!o.lookAheads&&o.terminals;e.reductions.forEach(function(t,n){(u||o.lookAheads(e,t)).forEach(function(e){a=c[o.symbols_[e]];var n=r[e];if(a||a&&a.length){var l=resolveConflict(t.production,n,[2,t.production.id],a[0]instanceof Array?a[0]:a);o.resolutions.push([s,e,l]),l.bydefault?(o.conflicts++,o.DEBUG||(o.warn("Conflict in grammar: multiple actions possible when lookahead token is ",e," in state ",s,"\n- ",printAction(l.r,o),"\n- ",printAction(l.s,o)),i[s]=!0),o.options.noDefaultResolve&&(a[0]instanceof Array||(a=[a]),a.push(l.r))):a=l.action}else a=[2,t.production.id];a&&a.length?c[o.symbols_[e]]=a:a===NONASSOC&&(c[o.symbols_[e]]=void 0)})})}),!o.DEBUG&&o.conflicts>0&&(o.warn("\nStates with conflicts:"),each(i,function(t,n){o.warn("State "+n),o.warn("  ",e.item(n).join("\n  "))})),t},lrGeneratorMixin.generate=function(e){var t="";switch((e=typal.mix.call({},this.options,e)).moduleName&&e.moduleName.match(/^[A-Za-z_$][A-Za-z0-9_$]*$/)||(e.moduleName="parser"),e.moduleType){case"js":t=this.generateModule(e);break;case"amd":t=this.generateAMDModule(e);break;default:t=this.generateCommonJSModule(e)}return t},lrGeneratorMixin.generateAMDModule=function(e){e=typal.mix.call({},this.options,e);var t=this.generateModule_();return"\n\ndefine(function(require){\n"+t.commonCode+"\nvar parser = "+t.moduleCode+"\n"+this.moduleInclude+(this.lexer&&this.lexer.generateModule?"\n"+this.lexer.generateModule()+"\nparser.lexer = lexer;":"")+"\nreturn parser;\n});"},lrGeneratorMixin.generateCommonJSModule=function(e){var t=(e=typal.mix.call({},this.options,e)).moduleName||"parser";return this.generateModule(e)+"\n\n\nif (typeof require !== 'undefined' && typeof exports !== 'undefined') {\nexports.parser = "+t+";\nexports.Parser = "+t+".Parser;\nexports.parse = function () { return "+t+".parse.apply("+t+", arguments); };\nexports.main = "+String(e.moduleMain||commonjsMain)+";\nif (typeof module !== 'undefined' && require.main === module) {\n  exports.main(process.argv.slice(1));\n}\n}"},lrGeneratorMixin.generateModule=function(e){var t=(e=typal.mix.call({},this.options,e)).moduleName||"parser",n="/* parser generated by jison "+version+" */\n/*\n  Returns a Parser object of the following structure:\n\n  Parser: {\n    yy: {}\n  }\n\n  Parser.prototype: {\n    yy: {},\n    trace: function(),\n    symbols_: {associative list: name ==> number},\n    terminals_: {associative list: number ==> name},\n    productions_: [...],\n    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n    table: [...],\n    defaultActions: {...},\n    parseError: function(str, hash),\n    parse: function(input),\n\n    lexer: {\n        EOF: 1,\n        parseError: function(str, hash),\n        setInput: function(input),\n        input: function(),\n        unput: function(str),\n        more: function(),\n        less: function(n),\n        pastInput: function(),\n        upcomingInput: function(),\n        showPosition: function(),\n        test_match: function(regex_match_array, rule_index),\n        next: function(),\n        lex: function(),\n        begin: function(condition),\n        popState: function(),\n        _currentRules: function(),\n        topState: function(),\n        pushState: function(condition),\n\n        options: {\n            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n        },\n\n        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n        rules: [...],\n        conditions: {associative list: name ==> set},\n    }\n  }\n\n\n  token location info (@$, _$, etc.): {\n    first_line: n,\n    last_line: n,\n    first_column: n,\n    last_column: n,\n    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n  }\n\n\n  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n    text:        (matched text)\n    token:       (the produced terminal token, if any)\n    line:        (yylineno)\n  }\n  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n    loc:         (yylloc)\n    expected:    (string describing the set of expected tokens)\n    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n  }\n*/\n";return n+=(t.match(/\./)?t:"var "+t)+" = "+this.generateModuleExpr()},lrGeneratorMixin.generateModuleExpr=function(){var e="",t=this.generateModule_();return e+="(function(){\n",e+=t.commonCode,e+="\nvar parser = "+t.moduleCode,e+="\n"+this.moduleInclude,this.lexer&&this.lexer.generateModule&&(e+=this.lexer.generateModule(),e+="\nparser.lexer = lexer;"),e+="\nfunction Parser () {\n  this.yy = {};\n}\nParser.prototype = parser;parser.Parser = Parser;\nreturn new Parser;\n})();"},lrGeneratorMixin.generateModule_=function(){var e=String(parser.parse);this.hasErrorRecovery||(e=removeErrorRecovery(e)),this.options["token-stack"]&&(e=addTokenStack(e)),nextVariableId=0;var t=this.generateTableCode(this.table),n=t.commonCode,r="{";return r+=["trace: "+String(this.trace||parser.trace),"yy: {}","symbols_: "+JSON.stringify(this.symbols_),"terminals_: "+JSON.stringify(this.terminals_).replace(/"([0-9]+)":/g,"$1:"),"productions_: "+JSON.stringify(this.productions_),"performAction: "+String(this.performAction),"table: "+t.moduleCode,"defaultActions: "+JSON.stringify(this.defaultActions).replace(/"([0-9]+)":/g,"$1:"),"parseError: "+String(this.parseError||(this.hasErrorRecovery?traceParseError:parser.parseError)),"parse: "+e].join(",\n"),{commonCode:n,moduleCode:r+="};"}},lrGeneratorMixin.generateTableCode=function(e){var t,n=JSON.stringify(e),r=[createObjectCode];n=(n=n.replace(/"([0-9]+)"(?=:)/g,"$1")).replace(/\{\d+:[^\}]+,\d+:[^\}]+\}/g,function(e){for(var t,n,r,i,o,s={},a=0,l=[],c=/(\d+):([^:]+)(?=,\d+:|\})/g;o=c.exec(e);)r=o[1],i=1,(t=o[2])in s?i=s[t].push(r):s[t]=[r],i>a&&(a=i,n=t);if(a>1){for(t in s)if(t!==n)for(var u=s[t],h=0,p=u.length;h<p;h++)l.push(u[h]+":"+t);l=l.length?",{"+l.join(",")+"}":"",e="o(["+s[n].join(",")+"],"+n+l+")"}return e});for(var i={},o=/\[[0-9,]+\]/g;t=o.exec(n);)i[t]=(i[t]||0)+1;return n=n.replace(o,function(e){var t=i[e];return"number"==typeof t&&(1===t?i[e]=t=e:(i[e]=t=createVariable(),r.push(t+"="+e))),t}),{commonCode:"var "+r.join(",")+";",moduleCode:n}};var createObjectCode="o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o}";function createVariable(){var e=nextVariableId++,t="$V";do{t+=variableTokens[e%variableTokensLength],e=~~(e/variableTokensLength)}while(0!==e);return t}var nextVariableId=0,variableTokens="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",variableTokensLength=variableTokens.length;function commonjsMain(e){e[1]||(console.log("Usage: "+e[0]+" FILE"),process.exit(1));var t=__webpack_require__(2).readFileSync(__webpack_require__(3).normalize(e[1]),"utf8");return exports.parser.parse(t)}function printAction(e,t){return 1==e[0]?"shift token (then go to state "+e[1]+")":2==e[0]?"reduce by rule: "+t.productions[e[1]]:"accept"}var lrGeneratorDebug={beforeparseTable:function(){this.trace("Building parse table.")},afterparseTable:function(){var e=this;this.conflicts>0&&(this.resolutions.forEach(function(t,n){t[2].bydefault&&e.warn("Conflict at state: ",t[0],", token: ",t[1],"\n  ",printAction(t[2].r,e),"\n  ",printAction(t[2].s,e))}),this.trace("\n"+this.conflicts+" Conflict(s) found in grammar.")),this.trace("Done.")},aftercanonicalCollection:function(e){var t=this.trace;t("\nItem sets\n------"),e.forEach(function(e,n){t("\nitem set",n,"\n"+e.join("\n"),"\ntransitions -> ",JSON.stringify(e.edges))})}},parser=typal.beget();function traceParseError(e,t){this.trace(e)}function parseError(e,t){if(!t.recoverable){var n=new Error(e);throw n.hash=t,n}this.trace(e)}lrGeneratorMixin.createParser=function createParser(){var p=eval(this.generateModuleExpr());p.productions=this.productions;var self=this;function bind(e){return function(){return self.lexer=p.lexer,self[e].apply(self,arguments)}}return p.lexer=this.lexer,p.generate=bind("generate"),p.generateAMDModule=bind("generateAMDModule"),p.generateModule=bind("generateModule"),p.generateCommonJSModule=bind("generateCommonJSModule"),p},parser.trace=generator.trace,parser.warn=generator.warn,parser.error=generator.error,parser.parseError=lrGeneratorMixin.parseError=parseError,parser.parse=function(e){var t=this,n=[0],r=[null],i=[],o=this.table,s="",a=0,l=0,c=0,u=2,h=i.slice.call(arguments,1),p=Object.create(this.lexer),f={yy:{}};for(var m in this.yy)Object.prototype.hasOwnProperty.call(this.yy,m)&&(f.yy[m]=this.yy[m]);p.setInput(e,f.yy),f.yy.lexer=p,f.yy.parser=this,void 0===p.yylloc&&(p.yylloc={});var d=p.yylloc;i.push(d);var g=p.options&&p.options.ranges;"function"==typeof f.yy.parseError?this.parseError=f.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var y,b,x,v,_,S,k,w,E,C,A=function(){var e;return"number"!=typeof(e=p.lex()||1)&&(e=t.symbols_[e]||e),e},I={};;){if(x=n[n.length-1],this.defaultActions[x]?v=this.defaultActions[x]:(null==y&&(y=A()),v=o[x]&&o[x][y]),void 0===v||!v.length||!v[0]){var L,O="";function P(e){for(var t=n.length-1,r=0;;){if(u.toString()in o[e])return r;if(0===e||t<2)return!1;e=n[t-=2],++r}}if(c)1!==b&&(L=P(x));else{for(S in L=P(x),E=[],o[x])this.terminals_[S]&&S>u&&E.push("'"+this.terminals_[S]+"'");O=p.showPosition?"Parse error on line "+(a+1)+":\n"+p.showPosition()+"\nExpecting "+E.join(", ")+", got '"+(this.terminals_[y]||y)+"'":"Parse error on line "+(a+1)+": Unexpected "+(1==y?"end of input":"'"+(this.terminals_[y]||y)+"'"),this.parseError(O,{text:p.match,token:this.terminals_[y]||y,line:p.yylineno,loc:d,expected:E,recoverable:!1!==L})}if(3==c){if(1===y||1===b)throw new Error(O||"Parsing halted while starting to recover from another error.");l=p.yyleng,s=p.yytext,a=p.yylineno,d=p.yylloc,y=A()}if(!1===L)throw new Error(O||"Parsing halted. No suitable error recovery rule available.");C=L,n.length=n.length-2*C,r.length=r.length-C,i.length=i.length-C,b=y==u?null:y,y=u,x=n[n.length-1],v=o[x]&&o[x][u],c=3}if(v[0]instanceof Array&&v.length>1)throw new Error("Parse Error: multiple actions possible at state: "+x+", token: "+y);switch(v[0]){case 1:n.push(y),r.push(p.yytext),i.push(p.yylloc),n.push(v[1]),y=null,b?(y=b,b=null):(l=p.yyleng,s=p.yytext,a=p.yylineno,d=p.yylloc,c>0&&c--);break;case 2:if(k=this.productions_[v[1]][1],I.$=r[r.length-k],I._$={first_line:i[i.length-(k||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(k||1)].first_column,last_column:i[i.length-1].last_column},g&&(I._$.range=[i[i.length-(k||1)].range[0],i[i.length-1].range[1]]),void 0!==(_=this.performAction.apply(I,[s,l,a,f.yy,v[1],r,i].concat(h))))return _;k&&(n=n.slice(0,-1*k*2),r=r.slice(0,-1*k),i=i.slice(0,-1*k)),n.push(this.productions_[v[1]][0]),r.push(I.$),i.push(I._$),w=o[n[n.length-2]][n[n.length-1]],n.push(w);break;case 3:return!0}}return!0},parser.init=function(e){this.table=e.table,this.defaultActions=e.defaultActions,this.performAction=e.performAction,this.productions_=e.productions_,this.symbols_=e.symbols_,this.terminals_=e.terminals_};var lr0=generator.beget(lookaheadMixin,lrGeneratorMixin,{type:"LR(0)",afterconstructor:function(){this.buildTable()}}),LR0Generator=exports.LR0Generator=lr0.construct(),lalr=generator.beget(lookaheadMixin,lrGeneratorMixin,{type:"LALR(1)",afterconstructor:function(e,t){this.DEBUG&&this.mix(lrGeneratorDebug,lalrGeneratorDebug),t=t||{},this.states=this.canonicalCollection(),this.terms_={};var n=this.newg=typal.beget(lookaheadMixin,{oldg:this,trace:this.trace,nterms_:{},DEBUG:!1,go_:function(e,t){return e=e.split(":")[0],t=t.map(function(e){return e.slice(e.indexOf(":")+1)}),this.oldg.go(e,t)}});n.nonterminals={},n.productions=[],this.inadequateStates=[],this.onDemandLookahead=t.onDemandLookahead||!1,this.buildNewGrammar(),n.computeLookaheads(),this.unionLookaheads(),this.table=this.parseTable(this.states),this.defaultActions=findDefaults(this.table)},lookAheads:function(e,t){return this.onDemandLookahead&&!e.inadequate?this.terminals:t.follows},go:function(e,t){for(var n=parseInt(e,10),r=0;r<t.length;r++)n=this.states.item(n).edges[t[r]]||n;return n},goPath:function(e,t){for(var n,r=parseInt(e,10),i=[],o=0;o<t.length;o++)(n=t[o]?r+":"+t[o]:"")&&(this.newg.nterms_[n]=r),i.push(n),r=this.states.item(r).edges[t[o]]||r,this.terms_[n]=t[o];return{path:i,endState:r}},buildNewGrammar:function(){var e=this,t=this.newg;this.states.forEach(function(n,r){n.forEach(function(n){if(0===n.dotPosition){var i=r+":"+n.production.symbol;e.terms_[i]=n.production.symbol,t.nterms_[i]=r,t.nonterminals[i]||(t.nonterminals[i]=new Nonterminal(i));var o=e.goPath(r,n.production.handle),s=new Production(i,o.path,t.productions.length);t.productions.push(s),t.nonterminals[i].productions.push(s);var a=n.production.handle.join(" "),l=e.states.item(o.endState).goes;l[a]||(l[a]=[]),l[a].push(i)}}),n.inadequate&&e.inadequateStates.push(r)})},unionLookaheads:function(){var e=this,t=this.newg;(this.onDemandLookahead?this.inadequateStates:this.states).forEach(function(n){var r="number"==typeof n?e.states.item(n):n;r.reductions.length&&r.reductions.forEach(function(n){for(var i={},o=0;o<n.follows.length;o++)i[n.follows[o]]=!0;r.goes[n.production.handle.join(" ")].forEach(function(r){t.nonterminals[r].follows.forEach(function(t){var r=e.terms_[t];i[r]||(i[r]=!0,n.follows.push(r))})})})})}}),LALRGenerator=exports.LALRGenerator=lalr.construct(),lalrGeneratorDebug={trace:function(){Jison.print.apply(null,arguments)},beforebuildNewGrammar:function(){this.trace(this.states.size()+" states."),this.trace("Building lookahead grammar.")},beforeunionLookaheads:function(){this.trace("Computing lookaheads.")}},lrLookaheadGenerator=generator.beget(lookaheadMixin,lrGeneratorMixin,{afterconstructor:function(){this.computeLookaheads(),this.buildTable()}}),SLRGenerator=exports.SLRGenerator=lrLookaheadGenerator.construct({type:"SLR(1)",lookAheads:function(e,t){return this.nonterminals[t.production.symbol].follows}}),lr1=lrLookaheadGenerator.beget({type:"Canonical LR(1)",lookAheads:function(e,t){return t.follows},Item:lrGeneratorMixin.Item.prototype.construct({afterconstructor:function(){this.id=this.production.id+"a"+this.dotPosition+"a"+this.follows.sort().join(",")},eq:function(e){return e.id===this.id}}),closureOperation:function(e){var t,n=new this.ItemSet,r=this,i=e;do{t=new Set,n.concat(i),i.forEach(function(e){var i,o,s=e.markedSymbol;s&&r.nonterminals[s]?(o=e.remainingHandle(),(0===(i=r.first(e.remainingHandle())).length||e.production.nullable||r.nullable(o))&&(i=i.concat(e.follows)),r.nonterminals[s].productions.forEach(function(e){var o=new r.Item(e,0,i);n.contains(o)||t.contains(o)||t.push(o)})):s||n.reductions.push(e)}),i=t}while(!t.isEmpty());return n}}),LR1Generator=exports.LR1Generator=lr1.construct(),ll=generator.beget(lookaheadMixin,{type:"LL(1)",afterconstructor:function(){this.computeLookaheads(),this.table=this.parseTable(this.productions)},parseTable:function(e){var t={},n=this;return e.forEach(function(e,r){var i=t[e.symbol]||{},o=e.first;n.nullable(e.handle)&&Set.union(o,n.nonterminals[e.symbol].follows),o.forEach(function(e){i[e]?(i[e].push(r),n.conflicts++):i[e]=[r]}),t[e.symbol]=i}),t}}),LLGenerator=exports.LLGenerator=ll.construct();return Jison.Generator=function(e,t){var n=typal.mix.call({},e.options,t);switch(n.type){case"lr0":return new LR0Generator(e,n);case"slr":return new SLRGenerator(e,n);case"lr":return new LR1Generator(e,n);case"ll":return new LLGenerator(e,n);default:return new LALRGenerator(e,n)}},function(e,t){return Jison.Generator(e,t).createParser()}}()}).call(this,__webpack_require__(1))},function(e,t,n){var r=n(6).typal,i={constructor:function(e,t){this._items=[],e&&e.constructor===Array?this._items=t?e:e.slice(0):arguments.length&&(this._items=[].slice.call(arguments,0))},concat:function(e){return this._items.push.apply(this._items,e._items||e),this},eq:function(e){return this._items.length===e._items.length&&this.subset(e)},indexOf:function(e){if(e&&e.eq){for(var t=0;t<this._items.length;t++)if(e.eq(this._items[t]))return t;return-1}return this._items.indexOf(e)},union:function(e){return new o(this._items).concat(this.complement(e))},intersection:function(e){return this.filter(function(t){return e.contains(t)})},complement:function(e){var t=this;return e.filter(function(e){return!t.contains(e)})},subset:function(e){for(var t=!0,n=0;n<this._items.length&&t;n++)t=t&&e.contains(this._items[n]);return t},superset:function(e){return e.subset(this)},joinSet:function(e){return this.concat(this.complement(e))},contains:function(e){return-1!==this.indexOf(e)},item:function(e,t){return this._items[e]},i:function(e,t){return this._items[e]},first:function(){return this._items[0]},last:function(){return this._items[this._items.length-1]},size:function(){return this._items.length},isEmpty:function(){return 0===this._items.length},copy:function(){return new o(this._items)},toString:function(){return this._items.toString()}};"push shift unshift forEach some every join sort".split(" ").forEach(function(e,t){i[e]=function(){return Array.prototype[e].apply(this._items,arguments)},i[e].name=e}),"filter slice map".split(" ").forEach(function(e,t){i[e]=function(){return new o(Array.prototype[e].apply(this._items,arguments),!0)},i[e].name=e});var o=r.construct(i).mix({union:function(e,t){for(var n={},r=e.length-1;r>=0;--r)n[e[r]]=!0;for(var i=t.length-1;i>=0;--i)n[t[i]]||e.push(t[i]);return e}});t.Set=o},function(module,exports,__webpack_require__){"use strict";var lexParser=__webpack_require__(7),version=__webpack_require__(14).version;function prepareRules(e,t,n,r,i,o){var s,a,l,c,u,h=[];function p(e,t){return"return "+(r[t]||"'"+t+"'")}for(t&&(t=prepareMacros(t)),n.push("switch($avoiding_name_collisions) {"),a=0;a<e.length;a++){if("[object Array]"!==Object.prototype.toString.apply(e[a][0]))for(l in i)i[l].inclusive&&i[l].rules.push(a);else if("*"===e[a][0][0]){for(l in i)i[l].rules.push(a);e[a].shift()}else for(u=e[a].shift(),l=0;l<u.length;l++)i[u[l]].rules.push(a);if("string"==typeof(s=e[a][0])){for(l in t)t.hasOwnProperty(l)&&(s=s.split("{"+l+"}").join("("+t[l]+")"));s=new RegExp("^(?:"+s+")",o?"i":"")}h.push(s),"function"==typeof e[a][1]&&(e[a][1]=String(e[a][1]).replace(/^\s*function \(\)\s?\{/,"").replace(/\}\s*$/,"")),c=e[a][1],r&&c.match(/return '[^']+'/)&&(c=c.replace(/return '([^']+)'/g,p)),n.push("case "+a+":"+c+"\nbreak;")}return n.push("}"),h}function prepareMacros(e){for(var t,n,r,i,o=!0;o;)for(n in o=!1,e)if(e.hasOwnProperty(n))for(r in t=e[n],e)e.hasOwnProperty(r)&&n!==r&&(i=t.split("{"+r+"}").join("("+e[r]+")"))!==t&&(o=!0,e[n]=i);return e}function prepareStartConditions(e){var t,n={};for(t in e)e.hasOwnProperty(t)&&(n[t]={rules:[],inclusive:!e[t]});return n}function buildActions(e,t){var n,r=[e.actionInclude||"","var YYSTATE=YY_START;"],i={};for(n in t)i[t[n]]=n;e.options&&e.options.flex&&e.rules.push([".","console.log(yytext);"]),this.rules=prepareRules(e.rules,e.macros,r,t&&i,this.conditions,this.options["case-insensitive"]);var o=r.join("\n");return"yytext yyleng yylineno yylloc".split(" ").forEach(function(e){o=o.replace(new RegExp("\\b("+e+")\\b","g"),"yy_.$1")}),"function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {"+o+"\n}"}function RegExpLexer(dict,input,tokens){var opts=processGrammar(dict,tokens),source=generateModuleBody(opts),lexer=eval(source);return lexer.yy={},input&&lexer.setInput(input),lexer.generate=function(){return generateFromOpts(opts)},lexer.generateModule=function(){return generateModule(opts)},lexer.generateCommonJSModule=function(){return generateCommonJSModule(opts)},lexer.generateAMDModule=function(){return generateAMDModule(opts)},lexer}function generate(e,t){return generateFromOpts(processGrammar(e,t))}function processGrammar(e,t){var n={};return"string"==typeof e&&(e=lexParser.parse(e)),e=e||{},n.options=e.options||{},n.moduleType=n.options.moduleType,n.moduleName=n.options.moduleName,n.conditions=prepareStartConditions(e.startConditions),n.conditions.INITIAL={rules:[],inclusive:!0},n.performAction=buildActions.call(n,e,t),n.conditionStack=["INITIAL"],n.moduleInclude=(e.moduleInclude||"").trim(),n}function generateFromOpts(e){return"commonjs"===e.moduleType?generateCommonJSModule(e):"amd"===e.moduleType?generateAMDModule(e):generateModule(e)}function generateModuleBody(e){var t,n={setInput:"resets the lexer, sets new input",input:"consumes and returns one char from the input",unput:"unshifts one char (or a string) into the input",more:"When called from action, caches matched text and appends it on next action",reject:"When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.",less:"retain first n characters of the match",pastInput:"displays already matched input, i.e. for error messages",upcomingInput:"displays upcoming input, i.e. for error messages",showPosition:"displays the character position where the lexing error occurred, i.e. for error messages",test_match:"test the lexed token: return FALSE when not a match, otherwise return token",next:"return next match in input",lex:"return next match that has a token",begin:"activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)",popState:"pop the previously active lexer condition state off the condition stack",_currentRules:"produce the lexer rule set which is active for the currently active lexer condition state",topState:"return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available",pushState:"alias for begin(condition)",stateStackSize:"return the number of states currently on the stack"},r="({\n",i=[];for(var o in RegExpLexer.prototype)RegExpLexer.prototype.hasOwnProperty(o)&&-1===o.indexOf("generate")&&(t="\n",n[o]&&(t+="// "+n[o].replace(/\n/g,"\n// ")+"\n"),i.push(t+o+":"+(RegExpLexer.prototype[o].toString()||'""')));return r+=i.join(",\n"),e.options&&(r+=",\noptions: "+JSON.stringify(e.options)),r+=",\nperformAction: "+String(e.performAction),r+=",\nrules: ["+e.rules+"]",r+=",\nconditions: "+JSON.stringify(e.conditions),r+="\n})"}function generateModule(e){var t="/* generated by jison-lex "+version+" */";return t+="\nvar "+((e=e||{}).moduleName||"lexer")+" = (function(){\nvar lexer = "+generateModuleBody(e),e.moduleInclude&&(t+=";\n"+e.moduleInclude),t+=";\nreturn lexer;\n})();"}function generateAMDModule(e){var t="/* generated by jison-lex "+version+" */";return t+="define([], function(){\nvar lexer = "+generateModuleBody(e),e.moduleInclude&&(t+=";\n"+e.moduleInclude),t+=";\nreturn lexer;\n});"}function generateCommonJSModule(e){var t="",n=(e=e||{}).moduleName||"lexer";return t+=generateModule(e),t+="\nexports.lexer = "+n,t+=";\nexports.lex = function () { return "+n+".lex.apply(lexer, arguments); };"}RegExpLexer.prototype={EOF:1,parseError:function(e,t){if(!this.yy.parser)throw new Error(e);this.yy.parser.parseError(e,t)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),(r=e[0].match(/(?:\r\n?|\n).*/g))&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},next:function(){if(this.done)return this.EOF;var e,t,n,r;this._input||(this.done=!0),this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),o=0;o<i.length;o++)if((n=this._input.match(this.rules[i[o]]))&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(!1!==(e=this.test_match(n,i[o])))return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}return t?!1!==(e=this.test_match(t,i[r]))&&e:""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var e=this.next();return e||this.lex()},begin:function(e){this.conditionStack.push(e)},popState:function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(e){return(e=this.conditionStack.length-1-Math.abs(e||0))>=0?this.conditionStack[e]:"INITIAL"},pushState:function(e){this.begin(e)},stateStackSize:function(){return this.conditionStack.length}},RegExpLexer.generate=generate,module.exports=RegExpLexer},function(e){e.exports={_from:"jison-lex@0.3.x",_id:"jison-lex@0.3.4",_inBundle:!1,_integrity:"sha1-gcoo2E+ESZ36jFlNzePYo/Jux6U=",_location:"/jison-lex",_phantomChildren:{},_requested:{type:"range",registry:!0,raw:"jison-lex@0.3.x",name:"jison-lex",escapedName:"jison-lex",rawSpec:"0.3.x",saveSpec:null,fetchSpec:"0.3.x"},_requiredBy:["/jison"],_resolved:"https://registry.npmjs.org/jison-lex/-/jison-lex-0.3.4.tgz",_shasum:"81ca28d84f84499dfa8c594dcde3d8a3f26ec7a5",_spec:"jison-lex@0.3.x",_where:"/Users/shaiby/projects/jb-react/node_modules/jison",author:{name:"Zach Carter",email:"zach@carter.name",url:"http://zaa.ch"},bin:{"jison-lex":"cli.js"},bugs:{url:"http://github.com/zaach/jison-lex/issues",email:"jison@librelist.com"},bundleDependencies:!1,dependencies:{"lex-parser":"0.1.x",nomnom:"1.5.2"},deprecated:!1,description:"lexical analyzer generator used by jison",devDependencies:{test:"0.4.4"},directories:{lib:"lib",tests:"tests"},engines:{node:">=0.4"},homepage:"http://jison.org",keywords:["jison","parser","generator","lexer","flex","tokenizer"],main:"regexp-lexer",name:"jison-lex",repository:{type:"git",url:"git://github.com/zaach/jison-lex.git"},scripts:{test:"node tests/all-tests.js"},version:"0.3.4"}},function(e,t,n){var r=n(16).parser,i=n(8),o=n(7);t.parse=function(e){return r.parse(e)},t.transform=i.transform,r.yy.addDeclaration=function(e,t){if(t.start)e.start=t.start;else if(t.lex)e.lex=s(t.lex);else if(t.operator)e.operators||(e.operators=[]),e.operators.push(t.operator);else if(t.parseParam)e.parseParams||(e.parseParams=[]),e.parseParams=e.parseParams.concat(t.parseParam);else if(t.include)e.moduleInclude||(e.moduleInclude=""),e.moduleInclude+=t.include;else if(t.options){e.options||(e.options={});for(var n=0;n<t.options.length;n++)e.options[t.options[n]]=!0}};var s=function(e){return o.parse(e.replace(/(?:^%lex)|(?:\/lex$)/g,""))}},function(e,t,n){(function(e,r){var i=function(){var e={trace:function(){},yy:{},symbols_:{error:2,spec:3,declaration_list:4,"%%":5,grammar:6,optional_end_block:7,EOF:8,CODE:9,declaration:10,START:11,id:12,LEX_BLOCK:13,operator:14,ACTION:15,parse_param:16,options:17,OPTIONS:18,token_list:19,PARSE_PARAM:20,associativity:21,LEFT:22,RIGHT:23,NONASSOC:24,symbol:25,production_list:26,production:27,":":28,handle_list:29,";":30,"|":31,handle_action:32,handle:33,prec:34,action:35,expression_suffix:36,handle_sublist:37,expression:38,suffix:39,ALIAS:40,ID:41,STRING:42,"(":43,")":44,"*":45,"?":46,"+":47,PREC:48,"{":49,action_body:50,"}":51,ARROW_ACTION:52,action_comments_body:53,ACTION_BODY:54,$accept:0,$end:1},terminals_:{2:"error",5:"%%",8:"EOF",9:"CODE",11:"START",13:"LEX_BLOCK",15:"ACTION",18:"OPTIONS",20:"PARSE_PARAM",22:"LEFT",23:"RIGHT",24:"NONASSOC",28:":",30:";",31:"|",40:"ALIAS",41:"ID",42:"STRING",43:"(",44:")",45:"*",46:"?",47:"+",48:"PREC",49:"{",51:"}",52:"ARROW_ACTION",54:"ACTION_BODY"},productions_:[0,[3,5],[3,6],[7,0],[7,1],[4,2],[4,0],[10,2],[10,1],[10,1],[10,1],[10,1],[10,1],[17,2],[16,2],[14,2],[21,1],[21,1],[21,1],[19,2],[19,1],[6,1],[26,2],[26,1],[27,4],[29,3],[29,1],[32,3],[33,2],[33,0],[37,3],[37,1],[36,3],[36,2],[38,1],[38,1],[38,3],[39,0],[39,1],[39,1],[39,1],[34,2],[34,0],[25,1],[25,1],[12,1],[35,3],[35,1],[35,1],[35,0],[50,0],[50,1],[50,5],[50,4],[53,1],[53,2]],performAction:function(e,t,n,o,s,a,l){var c=a.length-1;switch(s){case 1:return this.$=a[c-4],i(this.$,a[c-2]);case 2:return this.$=a[c-5],o.addDeclaration(this.$,{include:a[c-1]}),i(this.$,a[c-3]);case 5:this.$=a[c-1],o.addDeclaration(this.$,a[c]);break;case 6:this.$={};break;case 7:this.$={start:a[c]};break;case 8:this.$={lex:a[c]};break;case 9:this.$={operator:a[c]};break;case 10:this.$={include:a[c]};break;case 11:this.$={parseParam:a[c]};break;case 12:this.$={options:a[c]};break;case 13:case 14:this.$=a[c];break;case 15:this.$=[a[c-1]],this.$.push.apply(this.$,a[c]);break;case 16:this.$="left";break;case 17:this.$="right";break;case 18:this.$="nonassoc";break;case 19:this.$=a[c-1],this.$.push(a[c]);break;case 20:this.$=[a[c]];break;case 21:this.$=a[c];break;case 22:this.$=a[c-1],a[c][0]in this.$?this.$[a[c][0]]=this.$[a[c][0]].concat(a[c][1]):this.$[a[c][0]]=a[c][1];break;case 23:this.$={},this.$[a[c][0]]=a[c][1];break;case 24:this.$=[a[c-3],a[c-1]];break;case 25:this.$=a[c-2],this.$.push(a[c]);break;case 26:this.$=[a[c]];break;case 27:this.$=[a[c-2].length?a[c-2].join(" "):""],a[c]&&this.$.push(a[c]),a[c-1]&&this.$.push(a[c-1]),1===this.$.length&&(this.$=this.$[0]);break;case 28:this.$=a[c-1],this.$.push(a[c]);break;case 29:this.$=[];break;case 30:this.$=a[c-2],this.$.push(a[c].join(" "));break;case 31:this.$=[a[c].join(" ")];break;case 32:this.$=a[c-2]+a[c-1]+"["+a[c]+"]";break;case 33:this.$=a[c-1]+a[c];break;case 34:this.$=a[c];break;case 35:this.$=r?"'"+a[c]+"'":a[c];break;case 36:this.$="("+a[c-1].join(" | ")+")";break;case 37:this.$="";break;case 41:this.$={prec:a[c]};break;case 42:this.$=null;break;case 43:this.$=a[c];break;case 44:case 45:this.$=e;break;case 46:this.$=a[c-1];break;case 47:this.$=a[c];break;case 48:this.$="$$ ="+a[c]+";";break;case 49:case 50:this.$="";break;case 51:this.$=a[c];break;case 52:this.$=a[c-4]+a[c-3]+a[c-2]+a[c-1]+a[c];break;case 53:this.$=a[c-3]+a[c-2]+a[c-1]+a[c];break;case 54:this.$=e;break;case 55:this.$=a[c-1]+a[c]}},table:[{3:1,4:2,5:[2,6],11:[2,6],13:[2,6],15:[2,6],18:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6]},{1:[3]},{5:[1,3],10:4,11:[1,5],13:[1,6],14:7,15:[1,8],16:9,17:10,18:[1,13],20:[1,12],21:11,22:[1,14],23:[1,15],24:[1,16]},{6:17,12:20,26:18,27:19,41:[1,21]},{5:[2,5],11:[2,5],13:[2,5],15:[2,5],18:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5]},{12:22,41:[1,21]},{5:[2,8],11:[2,8],13:[2,8],15:[2,8],18:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{5:[2,9],11:[2,9],13:[2,9],15:[2,9],18:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,10],11:[2,10],13:[2,10],15:[2,10],18:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{5:[2,11],11:[2,11],13:[2,11],15:[2,11],18:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{5:[2,12],11:[2,12],13:[2,12],15:[2,12],18:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{12:25,19:23,25:24,41:[1,21],42:[1,26]},{12:25,19:27,25:24,41:[1,21],42:[1,26]},{12:25,19:28,25:24,41:[1,21],42:[1,26]},{41:[2,16],42:[2,16]},{41:[2,17],42:[2,17]},{41:[2,18],42:[2,18]},{5:[1,30],7:29,8:[2,3]},{5:[2,21],8:[2,21],12:20,27:31,41:[1,21]},{5:[2,23],8:[2,23],41:[2,23]},{28:[1,32]},{5:[2,45],11:[2,45],13:[2,45],15:[2,45],18:[2,45],20:[2,45],22:[2,45],23:[2,45],24:[2,45],28:[2,45],30:[2,45],31:[2,45],41:[2,45],42:[2,45],49:[2,45],52:[2,45]},{5:[2,7],11:[2,7],13:[2,7],15:[2,7],18:[2,7],20:[2,7],22:[2,7],23:[2,7],24:[2,7]},{5:[2,15],11:[2,15],12:25,13:[2,15],15:[2,15],18:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15],25:33,41:[1,21],42:[1,26]},{5:[2,20],11:[2,20],13:[2,20],15:[2,20],18:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20],41:[2,20],42:[2,20]},{5:[2,43],11:[2,43],13:[2,43],15:[2,43],18:[2,43],20:[2,43],22:[2,43],23:[2,43],24:[2,43],30:[2,43],31:[2,43],41:[2,43],42:[2,43],49:[2,43],52:[2,43]},{5:[2,44],11:[2,44],13:[2,44],15:[2,44],18:[2,44],20:[2,44],22:[2,44],23:[2,44],24:[2,44],30:[2,44],31:[2,44],41:[2,44],42:[2,44],49:[2,44],52:[2,44]},{5:[2,14],11:[2,14],12:25,13:[2,14],15:[2,14],18:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14],25:33,41:[1,21],42:[1,26]},{5:[2,13],11:[2,13],12:25,13:[2,13],15:[2,13],18:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13],25:33,41:[1,21],42:[1,26]},{8:[1,34]},{8:[2,4],9:[1,35]},{5:[2,22],8:[2,22],41:[2,22]},{15:[2,29],29:36,30:[2,29],31:[2,29],32:37,33:38,41:[2,29],42:[2,29],43:[2,29],48:[2,29],49:[2,29],52:[2,29]},{5:[2,19],11:[2,19],13:[2,19],15:[2,19],18:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19],41:[2,19],42:[2,19]},{1:[2,1]},{8:[1,39]},{30:[1,40],31:[1,41]},{30:[2,26],31:[2,26]},{15:[2,42],30:[2,42],31:[2,42],34:42,36:43,38:45,41:[1,46],42:[1,47],43:[1,48],48:[1,44],49:[2,42],52:[2,42]},{1:[2,2]},{5:[2,24],8:[2,24],41:[2,24]},{15:[2,29],30:[2,29],31:[2,29],32:49,33:38,41:[2,29],42:[2,29],43:[2,29],48:[2,29],49:[2,29],52:[2,29]},{15:[1,52],30:[2,49],31:[2,49],35:50,49:[1,51],52:[1,53]},{15:[2,28],30:[2,28],31:[2,28],41:[2,28],42:[2,28],43:[2,28],44:[2,28],48:[2,28],49:[2,28],52:[2,28]},{12:25,25:54,41:[1,21],42:[1,26]},{15:[2,37],30:[2,37],31:[2,37],39:55,40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[1,56],46:[1,57],47:[1,58],48:[2,37],49:[2,37],52:[2,37]},{15:[2,34],30:[2,34],31:[2,34],40:[2,34],41:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34],47:[2,34],48:[2,34],49:[2,34],52:[2,34]},{15:[2,35],30:[2,35],31:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],47:[2,35],48:[2,35],49:[2,35],52:[2,35]},{31:[2,29],33:60,37:59,41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{30:[2,25],31:[2,25]},{30:[2,27],31:[2,27]},{49:[2,50],50:61,51:[2,50],53:62,54:[1,63]},{30:[2,47],31:[2,47]},{30:[2,48],31:[2,48]},{15:[2,41],30:[2,41],31:[2,41],49:[2,41],52:[2,41]},{15:[2,33],30:[2,33],31:[2,33],40:[1,64],41:[2,33],42:[2,33],43:[2,33],44:[2,33],48:[2,33],49:[2,33],52:[2,33]},{15:[2,38],30:[2,38],31:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],48:[2,38],49:[2,38],52:[2,38]},{15:[2,39],30:[2,39],31:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],48:[2,39],49:[2,39],52:[2,39]},{15:[2,40],30:[2,40],31:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40],48:[2,40],49:[2,40],52:[2,40]},{31:[1,66],44:[1,65]},{31:[2,31],36:43,38:45,41:[1,46],42:[1,47],43:[1,48],44:[2,31]},{49:[1,68],51:[1,67]},{49:[2,51],51:[2,51],54:[1,69]},{49:[2,54],51:[2,54],54:[2,54]},{15:[2,32],30:[2,32],31:[2,32],41:[2,32],42:[2,32],43:[2,32],44:[2,32],48:[2,32],49:[2,32],52:[2,32]},{15:[2,36],30:[2,36],31:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],47:[2,36],48:[2,36],49:[2,36],52:[2,36]},{31:[2,29],33:70,41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{30:[2,46],31:[2,46]},{49:[2,50],50:71,51:[2,50],53:62,54:[1,63]},{49:[2,55],51:[2,55],54:[2,55]},{31:[2,30],36:43,38:45,41:[1,46],42:[1,47],43:[1,48],44:[2,30]},{49:[1,68],51:[1,72]},{49:[2,53],51:[2,53],53:73,54:[1,63]},{49:[2,52],51:[2,52],54:[1,69]}],defaultActions:{34:[2,1],39:[2,2]},parseError:function(e,t){if(!t.recoverable)throw new Error(e);this.trace(e)},parse:function(e){var t=this,n=[0],r=[null],i=[],o=this.table,s="",a=0,l=0,c=0,u=1,h=i.slice.call(arguments,1);this.lexer.setInput(e),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,void 0===this.lexer.yylloc&&(this.lexer.yylloc={});var p=this.lexer.yylloc;i.push(p);var f=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError?this.parseError=this.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var m,d,g,y,b,x,v,_,S,k,w={};;){if(g=n[n.length-1],this.defaultActions[g]?y=this.defaultActions[g]:(null==m&&(k=void 0,"number"!=typeof(k=t.lexer.lex()||u)&&(k=t.symbols_[k]||k),m=k),y=o[g]&&o[g][m]),void 0===y||!y.length||!y[0]){var E="";for(x in S=[],o[g])this.terminals_[x]&&x>2&&S.push("'"+this.terminals_[x]+"'");E=this.lexer.showPosition?"Parse error on line "+(a+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+S.join(", ")+", got '"+(this.terminals_[m]||m)+"'":"Parse error on line "+(a+1)+": Unexpected "+(m==u?"end of input":"'"+(this.terminals_[m]||m)+"'"),this.parseError(E,{text:this.lexer.match,token:this.terminals_[m]||m,line:this.lexer.yylineno,loc:p,expected:S})}if(y[0]instanceof Array&&y.length>1)throw new Error("Parse Error: multiple actions possible at state: "+g+", token: "+m);switch(y[0]){case 1:n.push(m),r.push(this.lexer.yytext),i.push(this.lexer.yylloc),n.push(y[1]),m=null,d?(m=d,d=null):(l=this.lexer.yyleng,s=this.lexer.yytext,a=this.lexer.yylineno,p=this.lexer.yylloc,c>0&&c--);break;case 2:if(v=this.productions_[y[1]][1],w.$=r[r.length-v],w._$={first_line:i[i.length-(v||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(v||1)].first_column,last_column:i[i.length-1].last_column},f&&(w._$.range=[i[i.length-(v||1)].range[0],i[i.length-1].range[1]]),void 0!==(b=this.performAction.apply(w,[s,l,a,this.yy,y[1],r,i].concat(h))))return b;v&&(n=n.slice(0,-1*v*2),r=r.slice(0,-1*v),i=i.slice(0,-1*v)),n.push(this.productions_[y[1]][0]),r.push(w.$),i.push(w._$),_=o[n[n.length-2]][n[n.length-1]],n.push(_);break;case 3:return!0}}return!0}},t=n(8).transform,r=!1;function i(e,n){return e.bnf=r?t(n):n,e}var o={EOF:1,parseError:function(e,t){if(!this.yy.parser)throw new Error(e);this.yy.parser.parseError(e,t)},setInput:function(e){return this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t-1),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),(r=e[0].match(/(?:\r\n?|\n).*/g))&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},next:function(){if(this.done)return this.EOF;var e,t,n,r;this._input||(this.done=!0),this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),o=0;o<i.length;o++)if((n=this._input.match(this.rules[i[o]]))&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(!1!==(e=this.test_match(n,i[o])))return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}return t?!1!==(e=this.test_match(t,i[r]))&&e:""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var e=this.next();return e||this.lex()},begin:function(e){this.conditionStack.push(e)},popState:function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(e){return(e=this.conditionStack.length-1-Math.abs(e||0))>=0?this.conditionStack[e]:"INITIAL"},pushState:function(e){this.begin(e)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(e,t,n,i){switch(n){case 0:return this.pushState("code"),5;case 1:return 43;case 2:return 44;case 3:return 45;case 4:return 46;case 5:return 47;case 6:case 7:case 8:break;case 9:return t.yytext=t.yytext.substr(1,t.yyleng-2),40;case 10:return 41;case 11:case 12:return t.yytext=t.yytext.substr(1,t.yyleng-2),42;case 13:return 28;case 14:return 30;case 15:return 31;case 16:return this.pushState(r?"ebnf":"bnf"),5;case 17:e.options||(e.options={}),r=e.options.ebnf=!0;break;case 18:return 48;case 19:return 11;case 20:return 22;case 21:return 23;case 22:return 24;case 23:return 20;case 24:return 18;case 25:return 13;case 26:case 27:break;case 28:return t.yytext=t.yytext.substr(2,t.yyleng-4),15;case 29:return t.yytext=t.yytext.substr(2,t.yytext.length-4),15;case 30:return e.depth=0,this.pushState("action"),49;case 31:return t.yytext=t.yytext.substr(2,t.yyleng-2),52;case 32:break;case 33:return 8;case 34:case 35:case 36:case 37:case 38:case 39:case 40:return 54;case 41:return e.depth++,49;case 42:return 0==e.depth?this.begin(r?"ebnf":"bnf"):e.depth--,51;case 43:return 9}},rules:[/^(?:%%)/,/^(?:\()/,/^(?:\))/,/^(?:\*)/,/^(?:\?)/,/^(?:\+)/,/^(?:\s+)/,/^(?:\/\/.*)/,/^(?:\/\*(.|\n|\r)*?\*\/)/,/^(?:\[([a-zA-Z][a-zA-Z0-9_-]*)\])/,/^(?:([a-zA-Z][a-zA-Z0-9_-]*))/,/^(?:"[^"]+")/,/^(?:'[^']+')/,/^(?::)/,/^(?:;)/,/^(?:\|)/,/^(?:%%)/,/^(?:%ebnf\b)/,/^(?:%prec\b)/,/^(?:%start\b)/,/^(?:%left\b)/,/^(?:%right\b)/,/^(?:%nonassoc\b)/,/^(?:%parse-param\b)/,/^(?:%options\b)/,/^(?:%lex[\w\W]*?\/lex\b)/,/^(?:%[a-zA-Z]+[^\r\n]*)/,/^(?:<[a-zA-Z]*>)/,/^(?:\{\{[\w\W]*?\}\})/,/^(?:%\{(.|\r|\n)*?%\})/,/^(?:\{)/,/^(?:->.*)/,/^(?:.)/,/^(?:$)/,/^(?:\/\*(.|\n|\r)*?\*\/)/,/^(?:\/\/.*)/,/^(?:\/[^ \/]*?['"{}'][^ ]*?\/)/,/^(?:"(\\\\|\\"|[^"])*")/,/^(?:'(\\\\|\\'|[^'])*')/,/^(?:[\/"'][^{}\/"']+)/,/^(?:[^{}\/"']+)/,/^(?:\{)/,/^(?:\})/,/^(?:(.|\n|\r)+)/],conditions:{bnf:{rules:[0,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],inclusive:!0},ebnf:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],inclusive:!0},action:{rules:[33,34,35,36,37,38,39,40,41,42],inclusive:!1},code:{rules:[33,43],inclusive:!1},INITIAL:{rules:[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],inclusive:!0}}};function s(){this.yy={}}return e.lexer=o,s.prototype=e,e.Parser=s,new s}();t.parser=i,t.Parser=i.Parser,t.parse=function(){return i.parse.apply(i,arguments)},t.main=function(r){r[1]||(console.log("Usage: "+r[0]+" FILE"),e.exit(1));var i=n(2).readFileSync(n(3).normalize(r[1]),"utf8");return t.parser.parse(i)},n.c[n.s]===r&&t.main(e.argv.slice(1))}).call(this,n(1),n(0)(e))},function(e,t,n){(function(e,r){var i=function(){var e={trace:function(){},yy:{},symbols_:{error:2,production:3,handle:4,EOF:5,handle_list:6,"|":7,expression_suffix:8,expression:9,suffix:10,ALIAS:11,symbol:12,"(":13,")":14,"*":15,"?":16,"+":17,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",7:"|",11:"ALIAS",12:"symbol",13:"(",14:")",15:"*",16:"?",17:"+"},productions_:[0,[3,2],[6,1],[6,3],[4,0],[4,2],[8,3],[8,2],[9,1],[9,3],[10,0],[10,1],[10,1],[10,1]],performAction:function(e,t,n,r,i,o,s){var a=o.length-1;switch(i){case 1:return o[a-1];case 2:this.$=[o[a]];break;case 3:o[a-2].push(o[a]);break;case 4:this.$=[];break;case 5:o[a-1].push(o[a]);break;case 6:this.$=["xalias",o[a-1],o[a-2],o[a]];break;case 7:o[a]?this.$=[o[a],o[a-1]]:this.$=o[a-1];break;case 8:this.$=["symbol",o[a]];break;case 9:this.$=["()",o[a-1]]}},table:[{3:1,4:2,5:[2,4],12:[2,4],13:[2,4]},{1:[3]},{5:[1,3],8:4,9:5,12:[1,6],13:[1,7]},{1:[2,1]},{5:[2,5],7:[2,5],12:[2,5],13:[2,5],14:[2,5]},{5:[2,10],7:[2,10],10:8,11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[1,9],16:[1,10],17:[1,11]},{5:[2,8],7:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[2,8],17:[2,8]},{4:13,6:12,7:[2,4],12:[2,4],13:[2,4],14:[2,4]},{5:[2,7],7:[2,7],11:[1,14],12:[2,7],13:[2,7],14:[2,7]},{5:[2,11],7:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11]},{5:[2,12],7:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12]},{5:[2,13],7:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[2,13]},{7:[1,16],14:[1,15]},{7:[2,2],8:4,9:5,12:[1,6],13:[1,7],14:[2,2]},{5:[2,6],7:[2,6],12:[2,6],13:[2,6],14:[2,6]},{5:[2,9],7:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[2,9],17:[2,9]},{4:17,7:[2,4],12:[2,4],13:[2,4],14:[2,4]},{7:[2,3],8:4,9:5,12:[1,6],13:[1,7],14:[2,3]}],defaultActions:{3:[2,1]},parseError:function(e,t){if(!t.recoverable)throw new Error(e);this.trace(e)},parse:function(e){var t=this,n=[0],r=[null],i=[],o=this.table,s="",a=0,l=0,c=0,u=1,h=i.slice.call(arguments,1);this.lexer.setInput(e),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,void 0===this.lexer.yylloc&&(this.lexer.yylloc={});var p=this.lexer.yylloc;i.push(p);var f=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError?this.parseError=this.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var m,d,g,y,b,x,v,_,S,k,w={};;){if(g=n[n.length-1],this.defaultActions[g]?y=this.defaultActions[g]:(null==m&&(k=void 0,"number"!=typeof(k=t.lexer.lex()||u)&&(k=t.symbols_[k]||k),m=k),y=o[g]&&o[g][m]),void 0===y||!y.length||!y[0]){var E="";for(x in S=[],o[g])this.terminals_[x]&&x>2&&S.push("'"+this.terminals_[x]+"'");E=this.lexer.showPosition?"Parse error on line "+(a+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+S.join(", ")+", got '"+(this.terminals_[m]||m)+"'":"Parse error on line "+(a+1)+": Unexpected "+(m==u?"end of input":"'"+(this.terminals_[m]||m)+"'"),this.parseError(E,{text:this.lexer.match,token:this.terminals_[m]||m,line:this.lexer.yylineno,loc:p,expected:S})}if(y[0]instanceof Array&&y.length>1)throw new Error("Parse Error: multiple actions possible at state: "+g+", token: "+m);switch(y[0]){case 1:n.push(m),r.push(this.lexer.yytext),i.push(this.lexer.yylloc),n.push(y[1]),m=null,d?(m=d,d=null):(l=this.lexer.yyleng,s=this.lexer.yytext,a=this.lexer.yylineno,p=this.lexer.yylloc,c>0&&c--);break;case 2:if(v=this.productions_[y[1]][1],w.$=r[r.length-v],w._$={first_line:i[i.length-(v||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(v||1)].first_column,last_column:i[i.length-1].last_column},f&&(w._$.range=[i[i.length-(v||1)].range[0],i[i.length-1].range[1]]),void 0!==(b=this.performAction.apply(w,[s,l,a,this.yy,y[1],r,i].concat(h))))return b;v&&(n=n.slice(0,-1*v*2),r=r.slice(0,-1*v),i=i.slice(0,-1*v)),n.push(this.productions_[y[1]][0]),r.push(w.$),i.push(w._$),_=o[n[n.length-2]][n[n.length-1]],n.push(_);break;case 3:return!0}}return!0}},t={EOF:1,parseError:function(e,t){if(!this.yy.parser)throw new Error(e);this.yy.parser.parseError(e,t)},setInput:function(e){return this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t-1),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),(r=e[0].match(/(?:\r\n?|\n).*/g))&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},next:function(){if(this.done)return this.EOF;var e,t,n,r;this._input||(this.done=!0),this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),o=0;o<i.length;o++)if((n=this._input.match(this.rules[i[o]]))&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(!1!==(e=this.test_match(n,i[o])))return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}return t?!1!==(e=this.test_match(t,i[r]))&&e:""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var e=this.next();return e||this.lex()},begin:function(e){this.conditionStack.push(e)},popState:function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(e){return(e=this.conditionStack.length-1-Math.abs(e||0))>=0?this.conditionStack[e]:"INITIAL"},pushState:function(e){this.begin(e)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(e,t,n,r){switch(n){case 0:break;case 1:return 12;case 2:return t.yytext=t.yytext.substr(1,t.yyleng-2),11;case 3:case 4:return 12;case 5:return"bar";case 6:return 13;case 7:return 14;case 8:return 15;case 9:return 16;case 10:return 7;case 11:return 17;case 12:return 5}},rules:[/^(?:\s+)/,/^(?:([a-zA-Z][a-zA-Z0-9_-]*))/,/^(?:\[([a-zA-Z][a-zA-Z0-9_-]*)\])/,/^(?:'[^']*')/,/^(?:\.)/,/^(?:bar\b)/,/^(?:\()/,/^(?:\))/,/^(?:\*)/,/^(?:\?)/,/^(?:\|)/,/^(?:\+)/,/^(?:$)/],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12],inclusive:!0}}};function n(){this.yy={}}return e.lexer=t,n.prototype=e,e.Parser=n,new n}();t.parser=i,t.Parser=i.Parser,t.parse=function(){return i.parse.apply(i,arguments)},t.main=function(r){r[1]||(console.log("Usage: "+r[0]+" FILE"),e.exit(1));var i=n(2).readFileSync(n(3).normalize(r[1]),"utf8");return t.parser.parse(i)},n.c[n.s]===r&&t.main(e.argv.slice(1))}).call(this,n(1),n(0)(e))},function(e,t,n){
/*! Copyright (c) 2011, Lloyd Hilaiel, ISC License */
!function(e){var t=Object.prototype.toString;function n(e){try{return JSON&&JSON.parse?JSON.parse(e):new Function("return "+e)()}catch(e){i("ijs",e.message)}}var r={bop:"binary operator expected",ee:"expression expected",epex:"closing paren expected ')'",ijs:"invalid json string",mcp:"missing closing paren",mepf:"malformed expression in pseudo-function",mexp:"multiple expressions not allowed",mpc:"multiple pseudo classes (:xxx) not allowed",nmi:"multiple ids not allowed",pex:"opening paren expected '('",se:"selector expected",sex:"string expected",sra:"string required after '.'",uc:"unrecognized char",ucp:"unexpected closing paren",ujs:"unclosed json string",upc:"unrecognized pseudo class"};function i(e,t){throw new Error(r[e]+(t&&" in '"+t+"'"))}var o={psc:1,psf:2,typ:3,str:4,ide:5},s=new RegExp('^(?:([\\r\\n\\t\\ ]+)|([~*,>\\)\\(])|(string|boolean|null|array|object|number)|(:(?:root|first-child|last-child|only-child))|(:(?:nth-child|nth-last-child|has|expr|val|contains))|(:\\w+)|(?:(\\.)?(\\"(?:[^\\\\\\"]|\\\\[^\\"])*\\"))|(\\")|\\.((?:[_a-zA-Z]|[^\\0-\\0177]|\\\\[^\\r\\n\\f0-9a-fA-F])(?:[_a-zA-Z0-9\\-]|[^\\u0000-\\u0177]|(?:\\\\[^\\r\\n\\f0-9a-fA-F]))*))'),a=/^\s*\(\s*(?:([+\-]?)([0-9]*)n\s*(?:([+\-])\s*([0-9]))?|(odd|even)|([+\-]?[0-9]+))\s*\)/;function l(e,t){t||(t=0);var r,a=s.exec(e.substr(t));if(a)return t+=a[0].length,a[1]?r=[t," "]:a[2]?r=[t,a[0]]:a[3]?r=[t,o.typ,a[0]]:a[4]?r=[t,o.psc,a[0]]:a[5]?r=[t,o.psf,a[0]]:a[6]?i("upc",e):a[8]?r=[t,a[7]?o.ide:o.str,n(a[8])]:a[9]?i("ujs",e):a[10]&&(r=[t,o.ide,a[10].replace(/\\([^\r\n\f0-9a-fA-F])/g,"$1")]),r}var c=new RegExp('^\\s*(?:(true|false|null)|(-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)|("(?:[^\\]|\\[^"])*")|(x)|(&&|\\|\\||[\\$\\^<>!\\*]=|[=+\\-*/%<>])|([\\(\\)]))');function u(e,t){return typeof e===t}var h={"*":[9,function(e,t){return e*t}],"/":[9,function(e,t){return e/t}],"%":[9,function(e,t){return e%t}],"+":[7,function(e,t){return e+t}],"-":[7,function(e,t){return e-t}],"<=":[5,function(e,t){return u(e,"number")&&u(t,"number")&&e<=t}],">=":[5,function(e,t){return u(e,"number")&&u(t,"number")&&e>=t}],"$=":[5,function(e,t){return u(e,"string")&&u(t,"string")&&e.lastIndexOf(t)===e.length-t.length}],"^=":[5,function(e,t){return u(e,"string")&&u(t,"string")&&0===e.indexOf(t)}],"*=":[5,function(e,t){return u(e,"string")&&u(t,"string")&&-1!==e.indexOf(t)}],">":[5,function(e,t){return u(e,"number")&&u(t,"number")&&e>t}],"<":[5,function(e,t){return u(e,"number")&&u(t,"number")&&e<t}],"=":[3,function(e,t){return e===t}],"!=":[3,function(e,t){return e!==t}],"&&":[2,function(e,t){return e&&t}],"||":[1,function(e,t){return e||t}]};function p(e,t){var r,i=c.exec(e.substr(t));if(i)return t+=i[0].length,r=i[1]||i[2]||i[3]||i[5]||i[6],i[1]||i[2]||i[3]?[t,0,n(r)]:i[4]?[t,0,void 0]:[t,r]}function f(e,t){var n=function e(t,n){n||(n=0);var r,o=p(t,n);if(o&&"("===o[1]){var s=p(t,(r=e(t,o[0]))[0]);s&&")"===s[1]||i("epex",t),n=s[0],r=["(",r[1]]}else!o||o[1]&&"x"!=o[1]?i("ee",t+" - "+(o[1]&&o[1])):(r="x"===o[1]?void 0:o[2],n=o[0]);var a=p(t,n);if(!a||")"==a[1])return[n,r];"x"!=a[1]&&a[1]||i("bop",t+" - "+(a[1]&&a[1]));var l,c=e(t,a[0]);if(n=c[0],"object"!=typeof(c=c[1])||"("===c[0]||h[a[1]][0]<h[c[1]][0])l=[r,a[1],c];else{for(l=c;"object"==typeof c[0]&&"("!=c[0][0]&&h[a[1]][0]>=h[c[0][1]][0];)c=c[0];c[0]=[r,a[1],c[0]]}return[n,l]}(e,t||0);return[n[0],function e(t){return"object"!=typeof t||null===t?t:"("===t[0]?e(t[1]):[e(t[0]),t[1],e(t[2])]}(n[1])]}function m(e,t,n,r){n||(r={});var o,s,a=[];for(t||(t=0);;){var c=g(e,t,r);if(a.push(c[1]),(c=l(e,t=c[0]))&&" "===c[1]&&(c=l(e,t=c[0])),!c)break;if(">"===c[1]||"~"===c[1])"~"===c[1]&&(r.usesSiblingOp=!0),a.push(c[1]),t=c[0];else if(","===c[1])void 0===o?o=[",",a]:o.push(a),a=[],t=c[0];else if(")"===c[1]){n||i("ucp",c[1]),s=1,t=c[0];break}}return n&&!s&&i("mcp",e),o&&o.push(a),[t,!n&&r.usesSiblingOp?function(e){if(","===e[0]){for(var t=[","],n=n;n<e.length;n++){var r=d(r[n]);t=t.concat(","===r[0]?r.slice(1):r)}return t}return d(e)}(o||a):o||a]}function d(e){for(var t,n=[],r=0;r<e.length;r++)if("~"===e[r]){if((r<2||">"!=e[r-2])&&(t=(t=(t=e.slice(0,r-1)).concat([{has:[[{pc:":root"},">",e[r-1]]]},">"])).concat(e.slice(r+1)),n.push(t)),r>1){var i=">"===e[r-2]?r-3:r-2;t=e.slice(0,i);var o={};for(var s in e[i])e[i].hasOwnProperty(s)&&(o[s]=e[i][s]);o.has||(o.has=[]),o.has.push([{pc:":root"},">",e[r-1]]),t=t.concat(o,">",e.slice(r+1)),n.push(t)}break}return r==e.length?e:n.length>1?[","].concat(n):n[0]}function g(e,t,n){var r=t,s={},c=l(e,t);for(c&&" "===c[1]&&(r=t=c[0],c=l(e,t)),c&&c[1]===o.typ?(s.type=c[2],c=l(e,t=c[0])):c&&"*"===c[1]&&(c=l(e,t=c[0]));void 0!==c;){if(c[1]===o.ide)s.id&&i("nmi",c[1]),s.id=c[2];else if(c[1]===o.psc)(s.pc||s.pf)&&i("mpc",c[1]),":first-child"===c[2]?(s.pf=":nth-child",s.a=0,s.b=1):":last-child"===c[2]?(s.pf=":nth-last-child",s.a=0,s.b=1):s.pc=c[2];else{if(c[1]!==o.psf)break;if(":val"===c[2]||":contains"===c[2])s.expr=[void 0,":val"===c[2]?"=":"*=",void 0],(c=l(e,t=c[0]))&&" "===c[1]&&(c=l(e,t=c[0])),c&&"("===c[1]||i("pex",e),(c=l(e,t=c[0]))&&" "===c[1]&&(c=l(e,t=c[0])),c&&c[1]===o.str||i("sex",e),s.expr[2]=c[2],(c=l(e,t=c[0]))&&" "===c[1]&&(c=l(e,t=c[0])),c&&")"===c[1]||i("epex",e);else if(":has"===c[2]){(c=l(e,t=c[0]))&&" "===c[1]&&(c=l(e,t=c[0])),c&&"("===c[1]||i("pex",e);var u=m(e,c[0],!0);c[0]=u[0],s.has||(s.has=[]),s.has.push(u[1])}else if(":expr"===c[2]){s.expr&&i("mexp",e);var h=f(e,c[0]);c[0]=h[0],s.expr=h[1]}else{(s.pc||s.pf)&&i("mpc",e),s.pf=c[2];var p=a.exec(e.substr(c[0]));p||i("mepf",e),p[5]?(s.a=2,s.b="odd"===p[5]?1:0):p[6]?(s.a=0,s.b=parseInt(p[6],10)):(s.a=parseInt((p[1]?p[1]:"+")+(p[2]?p[2]:"1"),10),s.b=p[3]?parseInt(p[3]+p[4],10):0),c[0]+=p[0].length}}c=l(e,t=c[0])}return r===t&&i("se",e),[t,s]}function y(e){return Array.isArray?Array.isArray(e):"[object Array]"===t.call(e)}function b(e,t,n,r,i){var o=[],s=">"===t[0]?t[1]:t[0],a=!0;if(s.type&&(a=a&&s.type===function(e){if(null===e)return"null";var t=typeof e;return"object"===t&&y(e)&&(t="array"),t}(e)),s.id&&(a=a&&s.id===n),a&&s.pf&&(":nth-last-child"===s.pf?r=i-r:r++,a=0===s.a?s.b===r:!((r-s.b)%s.a)&&r*s.a+s.b>=0),a&&s.has)for(var l=function(){throw 42},c=0;c<s.has.length;c++){try{x(s.has[c],e,l)}catch(e){if(42===e)continue}a=!1;break}return a&&s.expr&&(a=function e(t,n){if(void 0===t)return n;if(null===t||"object"!=typeof t)return t;var r=e(t[0],n),i=e(t[2],n);return h[t[1]][1](r,i)}(s.expr,e)),">"!==t[0]&&":root"!==t[0].pc&&o.push(t),a&&(">"===t[0]?t.length>2&&(a=!1,o.push(t.slice(2))):t.length>1&&(a=!1,o.push(t.slice(1)))),[a,o]}function x(e,t,n,r,i,o){var s,a,l=","===e[0]?e.slice(1):[e],c=[],u=!1,h=0,p=0;for(h=0;h<l.length;h++)for((a=b(t,l[h],r,i,o))[0]&&(u=!0),p=0;p<a[1].length;p++)c.push(a[1][p]);if(c.length&&"object"==typeof t)if(c.length>=1&&c.unshift(","),y(t))for(h=0;h<t.length;h++)x(c,t[h],n,void 0,h,t.length);else for(s in t)t.hasOwnProperty(s)&&x(c,t[s],n,s);u&&n&&n(t)}function v(e,t){return t&&(e=function(e,t){if(e=e.replace(/\?/g,function(){if(0===t.length)throw"too few parameters given";var e=t.shift();return"string"==typeof e?JSON.stringify(e):e}),t.length)throw"too many parameters supplied";return e}(e,t)),{sel:m(e)[1],match:function(e){return function(e,t){var n=[];return x(e,t,function(e){n.push(e)}),n}(this.sel,e)},forEach:function(e,t){return x(this.sel,e,t)}}}e._lex=l,e._parse=m,e.match=function(e,t,n){return n||(n=t,t=void 0),v(e,t).match(n)},e.forEach=function(e,t,n,r){return r||(r=n,n=t,t=void 0),v(e,t).forEach(n,r)},e.compile=v}(t)},function(e,t,n){var r,i,o;!function(n,s){"use strict";i=[t],void 0===(o="function"==typeof(r=function(e){var t,n,r,i,o,s,a,l,c,u,h,p,f,m,d,g,y,b;function x(e,t){if(!e)throw new Error("ASSERT: "+t)}function v(e){return e>=48&&e<=57}function _(e){return"0123456789abcdefABCDEF".indexOf(e)>=0}function S(e){return"01234567".indexOf(e)>=0}function k(e){return 32===e||9===e||11===e||12===e||160===e||e>=5760&&[5760,6158,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(e)>=0}function w(e){return 10===e||13===e||8232===e||8233===e}function E(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||92===e||e>=128&&a.NonAsciiIdentifierStart.test(String.fromCharCode(e))}function C(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||92===e||e>=128&&a.NonAsciiIdentifierPart.test(String.fromCharCode(e))}function A(e){switch(e){case"implements":case"interface":case"package":case"private":case"protected":case"public":case"static":case"yield":case"let":return!0;default:return!1}}function I(e){return"eval"===e||"arguments"===e}function L(e,t,n,r,i){var o,s;x("number"==typeof n,"Comment must have valid position"),y.lastCommentStart>=n||(y.lastCommentStart=n,o={type:e,value:t},b.range&&(o.range=[n,r]),b.loc&&(o.loc=i),b.comments.push(o),b.attachComment&&(s={comment:o,leading:null,trailing:null,range:[n,r]},b.pendingComments.push(s)))}function O(e){var t,n,r,i;for(t=h-e,n={start:{line:p,column:h-f-e}};h<m;)if(r=c.charCodeAt(h),++h,w(r))return b.comments&&(i=c.slice(t+e,h-1),n.end={line:p,column:h-f-1},L("Line",i,t,h-1,n)),13===r&&10===c.charCodeAt(h)&&++h,++p,void(f=h);b.comments&&(i=c.slice(t+e,h),n.end={line:p,column:h-f},L("Line",i,t,h,n))}function P(){var e,t,n,r;for(b.comments&&(e=h-2,t={start:{line:p,column:h-f-2}});h<m;)if(w(n=c.charCodeAt(h)))13===n&&10===c.charCodeAt(h+1)&&++h,++p,f=++h,h>=m&&W({},s.UnexpectedToken,"ILLEGAL");else if(42===n){if(47===c.charCodeAt(h+1))return++h,++h,void(b.comments&&(r=c.slice(e+2,h-2),t.end={line:p,column:h-f},L("Block",r,e,h,t)));++h}else++h;W({},s.UnexpectedToken,"ILLEGAL")}function $(){var e,t;for(t=0===h;h<m;)if(k(e=c.charCodeAt(h)))++h;else if(w(e))++h,13===e&&10===c.charCodeAt(h)&&++h,++p,f=h,t=!0;else if(47===e)if(47===(e=c.charCodeAt(h+1)))++h,++h,O(2),t=!0;else{if(42!==e)break;++h,++h,P()}else if(t&&45===e){if(45!==c.charCodeAt(h+1)||62!==c.charCodeAt(h+2))break;h+=3,O(3)}else{if(60!==e)break;if("!--"!==c.slice(h+1,h+4))break;++h,++h,++h,++h,O(4)}}function j(e){var t,n,r,i=0;for(n="u"===e?4:2,t=0;t<n;++t){if(!(h<m&&_(c[h])))return"";r=c[h++],i=16*i+"0123456789abcdef".indexOf(r.toLowerCase())}return String.fromCharCode(i)}function R(){var e,t;for(e=c.charCodeAt(h++),t=String.fromCharCode(e),92===e&&(117!==c.charCodeAt(h)&&W({},s.UnexpectedToken,"ILLEGAL"),++h,(e=j("u"))&&"\\"!==e&&E(e.charCodeAt(0))||W({},s.UnexpectedToken,"ILLEGAL"),t=e);h<m&&C(e=c.charCodeAt(h));)++h,t+=String.fromCharCode(e),92===e&&(t=t.substr(0,t.length-1),117!==c.charCodeAt(h)&&W({},s.UnexpectedToken,"ILLEGAL"),++h,(e=j("u"))&&"\\"!==e&&C(e.charCodeAt(0))||W({},s.UnexpectedToken,"ILLEGAL"),t+=e);return t}function M(){var e,n;return e=h,n=92===c.charCodeAt(h)?R():function(){var e,t;e=h++;for(;h<m;){if(92===(t=c.charCodeAt(h)))return h=e,R();if(!C(t))break;++h}return c.slice(e,h)}(),{type:1===n.length?t.Identifier:function(e){if(u&&A(e))return!0;switch(e.length){case 2:return"if"===e||"in"===e||"do"===e;case 3:return"var"===e||"for"===e||"new"===e||"try"===e||"let"===e;case 4:return"this"===e||"else"===e||"case"===e||"void"===e||"with"===e||"enum"===e;case 5:return"while"===e||"break"===e||"catch"===e||"throw"===e||"const"===e||"yield"===e||"class"===e||"super"===e;case 6:return"return"===e||"typeof"===e||"delete"===e||"switch"===e||"export"===e||"import"===e;case 7:return"default"===e||"finally"===e||"extends"===e;case 8:return"function"===e||"continue"===e||"debugger"===e;case 10:return"instanceof"===e;default:return!1}}(n)?t.Keyword:"null"===n?t.NullLiteral:"true"===n||"false"===n?t.BooleanLiteral:t.Identifier,value:n,lineNumber:p,lineStart:f,range:[e,h]}}function N(){var e,n,r,i,o=h,a=c.charCodeAt(h),l=c[h];switch(a){case 46:case 40:case 41:case 59:case 44:case 123:case 125:case 91:case 93:case 58:case 63:case 126:return++h,b.tokenize&&(40===a?b.openParenToken=b.tokens.length:123===a&&(b.openCurlyToken=b.tokens.length)),{type:t.Punctuator,value:String.fromCharCode(a),lineNumber:p,lineStart:f,range:[o,h]};default:if(61===(e=c.charCodeAt(h+1)))switch(a){case 37:case 38:case 42:case 43:case 45:case 47:case 60:case 62:case 94:case 124:return h+=2,{type:t.Punctuator,value:String.fromCharCode(a)+String.fromCharCode(e),lineNumber:p,lineStart:f,range:[o,h]};case 33:case 61:return h+=2,61===c.charCodeAt(h)&&++h,{type:t.Punctuator,value:c.slice(o,h),lineNumber:p,lineStart:f,range:[o,h]}}}return n=c[h+1],r=c[h+2],i=c[h+3],">"===l&&">"===n&&">"===r&&"="===i?(h+=4,{type:t.Punctuator,value:">>>=",lineNumber:p,lineStart:f,range:[o,h]}):">"===l&&">"===n&&">"===r?(h+=3,{type:t.Punctuator,value:">>>",lineNumber:p,lineStart:f,range:[o,h]}):"<"===l&&"<"===n&&"="===r?(h+=3,{type:t.Punctuator,value:"<<=",lineNumber:p,lineStart:f,range:[o,h]}):">"===l&&">"===n&&"="===r?(h+=3,{type:t.Punctuator,value:">>=",lineNumber:p,lineStart:f,range:[o,h]}):l===n&&"+-<>&|".indexOf(l)>=0?(h+=2,{type:t.Punctuator,value:l+n,lineNumber:p,lineStart:f,range:[o,h]}):"<>=!+-*%&|^/".indexOf(l)>=0?(++h,{type:t.Punctuator,value:l,lineNumber:p,lineStart:f,range:[o,h]}):void W({},s.UnexpectedToken,"ILLEGAL")}function T(){var e,n,r;if(x(v((r=c[h]).charCodeAt(0))||"."===r,"Numeric literal must start with a decimal digit or a decimal point"),n=h,e="","."!==r){if(e=c[h++],r=c[h],"0"===e){if("x"===r||"X"===r)return++h,function(e){var n="";for(;h<m&&_(c[h]);)n+=c[h++];0===n.length&&W({},s.UnexpectedToken,"ILLEGAL");E(c.charCodeAt(h))&&W({},s.UnexpectedToken,"ILLEGAL");return{type:t.NumericLiteral,value:parseInt("0x"+n,16),lineNumber:p,lineStart:f,range:[e,h]}}(n);if(S(r))return function(e){var n="0"+c[h++];for(;h<m&&S(c[h]);)n+=c[h++];(E(c.charCodeAt(h))||v(c.charCodeAt(h)))&&W({},s.UnexpectedToken,"ILLEGAL");return{type:t.NumericLiteral,value:parseInt(n,8),octal:!0,lineNumber:p,lineStart:f,range:[e,h]}}(n);r&&v(r.charCodeAt(0))&&W({},s.UnexpectedToken,"ILLEGAL")}for(;v(c.charCodeAt(h));)e+=c[h++];r=c[h]}if("."===r){for(e+=c[h++];v(c.charCodeAt(h));)e+=c[h++];r=c[h]}if("e"===r||"E"===r)if(e+=c[h++],"+"!==(r=c[h])&&"-"!==r||(e+=c[h++]),v(c.charCodeAt(h)))for(;v(c.charCodeAt(h));)e+=c[h++];else W({},s.UnexpectedToken,"ILLEGAL");return E(c.charCodeAt(h))&&W({},s.UnexpectedToken,"ILLEGAL"),{type:t.NumericLiteral,value:parseFloat(e),lineNumber:p,lineStart:f,range:[n,h]}}function D(){var e,n,r,i,o,a,l,u=!1,d=!1;for(g=null,$(),r=h,x("/"===(n=c[h]),"Regular expression literal must start with a slash"),e=c[h++];h<m;)if(n=c[h++],e+=n,"\\"===n)w((n=c[h++]).charCodeAt(0))&&W({},s.UnterminatedRegExp),e+=n;else if(w(n.charCodeAt(0)))W({},s.UnterminatedRegExp);else if(u)"]"===n&&(u=!1);else{if("/"===n){d=!0;break}"["===n&&(u=!0)}for(d||W({},s.UnterminatedRegExp),i=e.substr(1,e.length-2),o="";h<m&&C((n=c[h]).charCodeAt(0));)if(++h,"\\"===n&&h<m)if("u"===(n=c[h]))if(l=++h,n=j("u"))for(o+=n,e+="\\u";l<h;++l)e+=c[l];else h=l,o+="u",e+="\\u";else e+="\\";else o+=n,e+=n;try{a=new RegExp(i,o)}catch(e){W({},s.InvalidRegExp)}return b.tokenize?{type:t.RegularExpression,value:a,lineNumber:p,lineStart:f,range:[r,h]}:{literal:e,value:a,range:[r,h]}}function F(){var e,t,n,r;return $(),e=h,t={start:{line:p,column:h-f}},n=D(),t.end={line:p,column:h-f},b.tokenize||(b.tokens.length>0&&(r=b.tokens[b.tokens.length-1]).range[0]===e&&"Punctuator"===r.type&&("/"!==r.value&&"/="!==r.value||b.tokens.pop()),b.tokens.push({type:"RegularExpression",value:n.literal,range:[e,h],loc:t})),n}function G(){var e;return $(),h>=m?{type:t.EOF,lineNumber:p,lineStart:f,range:[h,h]}:40===(e=c.charCodeAt(h))||41===e||58===e?N():39===e||34===e?function(){var e,n,r,i,o,a,l="",u=!1;x("'"===(e=c[h])||'"'===e,"String literal must starts with a quote"),n=h,++h;for(;h<m;){if((r=c[h++])===e){e="";break}if("\\"===r)if((r=c[h++])&&w(r.charCodeAt(0)))++p,"\r"===r&&"\n"===c[h]&&++h,f=h;else switch(r){case"n":l+="\n";break;case"r":l+="\r";break;case"t":l+="\t";break;case"u":case"x":a=h,(o=j(r))?l+=o:(h=a,l+=r);break;case"b":l+="\b";break;case"f":l+="\f";break;case"v":l+="\v";break;default:S(r)?(0!==(i="01234567".indexOf(r))&&(u=!0),h<m&&S(c[h])&&(u=!0,i=8*i+"01234567".indexOf(c[h++]),"0123".indexOf(r)>=0&&h<m&&S(c[h])&&(i=8*i+"01234567".indexOf(c[h++]))),l+=String.fromCharCode(i)):l+=r}else{if(w(r.charCodeAt(0)))break;l+=r}}""!==e&&W({},s.UnexpectedToken,"ILLEGAL");return{type:t.StringLiteral,value:l,octal:u,lineNumber:p,lineStart:f,range:[n,h]}}():E(e)?M():46===e?v(c.charCodeAt(h+1))?T():N():v(e)?T():b.tokenize&&47===e?function(){var e,t;if(!(e=b.tokens[b.tokens.length-1]))return F();if("Punctuator"===e.type){if("]"===e.value)return N();if(")"===e.value)return!(t=b.tokens[b.openParenToken-1])||"Keyword"!==t.type||"if"!==t.value&&"while"!==t.value&&"for"!==t.value&&"with"!==t.value?N():F();if("}"===e.value){if(b.tokens[b.openCurlyToken-3]&&"Keyword"===b.tokens[b.openCurlyToken-3].type){if(!(t=b.tokens[b.openCurlyToken-4]))return N()}else{if(!b.tokens[b.openCurlyToken-4]||"Keyword"!==b.tokens[b.openCurlyToken-4].type)return N();if(!(t=b.tokens[b.openCurlyToken-5]))return F()}return r.indexOf(t.value)>=0?N():F()}return F()}if("Keyword"===e.type)return F();return N()}():N()}function B(){var e,r,i,o;return $(),h,e={start:{line:p,column:h-f}},r=G(),e.end={line:p,column:h-f},r.type!==t.EOF&&(i=[r.range[0],r.range[1]],o=c.slice(r.range[0],r.range[1]),b.tokens.push({type:n[r.type],value:o,range:i,loc:e})),r}function q(){var e;return h=(e=g).range[1],p=e.lineNumber,f=e.lineStart,g=void 0!==b.tokens?B():G(),h=e.range[1],p=e.lineNumber,f=e.lineStart,e}function z(){var e,t,n;e=h,t=p,n=f,g=void 0!==b.tokens?B():G(),h=e,p=t,f=n}function U(){var e,t,n,r;return e=h,t=p,n=f,$(),r=p!==t,h=e,p=t,f=n,r}function W(e,t){var n,r=Array.prototype.slice.call(arguments,2),i=t.replace(/%(\d)/g,function(e,t){return x(t<r.length,"Message reference must be in range"),r[t]});throw"number"==typeof e.lineNumber?((n=new Error("Line "+e.lineNumber+": "+i)).index=e.range[0],n.lineNumber=e.lineNumber,n.column=e.range[0]-f+1):((n=new Error("Line "+p+": "+i)).index=h,n.lineNumber=p,n.column=h-f+1),n.description=i,n}function V(){try{W.apply(null,arguments)}catch(e){if(!b.errors)throw e;b.errors.push(e)}}function J(e){if(e.type===t.EOF&&W(e,s.UnexpectedEOS),e.type===t.NumericLiteral&&W(e,s.UnexpectedNumber),e.type===t.StringLiteral&&W(e,s.UnexpectedString),e.type===t.Identifier&&W(e,s.UnexpectedIdentifier),e.type===t.Keyword){if(function(e){switch(e){case"class":case"enum":case"export":case"extends":case"import":case"super":return!0;default:return!1}}(e.value))W(e,s.UnexpectedReserved);else if(u&&A(e.value))return void V(e,s.StrictReservedWord);W(e,s.UnexpectedToken,e.value)}W(e,s.UnexpectedToken,e.value)}function Z(e){var n=q();n.type===t.Punctuator&&n.value===e||J(n)}function Y(e){var n=q();n.type===t.Keyword&&n.value===e||J(n)}function H(e){return g.type===t.Punctuator&&g.value===e}function K(e){return g.type===t.Keyword&&g.value===e}function X(){var e;59!==c.charCodeAt(h)?(e=p,$(),p===e&&(H(";")?q():g.type===t.EOF||H("}")||J(g))):q()}function Q(e){return e.type===i.Identifier||e.type===i.MemberExpression}function ee(e,t){var n,r;return n=u,d.markStart(),r=ke(),t&&u&&I(e[0].name)&&V(t,s.StrictParamName),u=n,d.markEnd(d.createFunctionExpression(null,e,[],r))}function te(){var e;return d.markStart(),(e=q()).type===t.StringLiteral||e.type===t.NumericLiteral?(u&&e.octal&&V(e,s.StrictOctalLiteral),d.markEnd(d.createLiteral(e))):d.markEnd(d.createIdentifier(e.value))}function ne(){var e,n,r,i,o;return e=g,d.markStart(),e.type===t.Identifier?(r=te(),"get"!==e.value||H(":")?"set"!==e.value||H(":")?(Z(":"),i=fe(),d.markEnd(d.createProperty("init",r,i))):(n=te(),Z("("),(e=g).type!==t.Identifier?(Z(")"),V(e,s.UnexpectedToken,e.value),i=ee([])):(o=[ge()],Z(")"),i=ee(o,e)),d.markEnd(d.createProperty("set",n,i))):(n=te(),Z("("),Z(")"),i=ee([]),d.markEnd(d.createProperty("get",n,i)))):e.type!==t.EOF&&e.type!==t.Punctuator?(n=te(),Z(":"),i=fe(),d.markEnd(d.createProperty("init",n,i))):void J(e)}function re(){var e,n,r;return H("(")?function(){var e;return Z("("),e=me(),Z(")"),e}():(e=g.type,d.markStart(),e===t.Identifier?r=d.createIdentifier(q().value):e===t.StringLiteral||e===t.NumericLiteral?(u&&g.octal&&V(g,s.StrictOctalLiteral),r=d.createLiteral(q())):e===t.Keyword?K("this")?(q(),r=d.createThisExpression()):K("function")&&(r=function(){var e,t,n,r,i,o,a,l=null,c=[];d.markStart(),Y("function"),H("(")||(e=g,l=ge(),u?I(e.value)&&V(e,s.StrictFunctionName):I(e.value)?(n=e,r=s.StrictFunctionName):A(e.value)&&(n=e,r=s.StrictReservedWord));i=we(n),c=i.params,t=i.stricted,n=i.firstRestricted,i.message&&(r=i.message);a=u,o=ke(),u&&n&&W(n,r);u&&t&&V(t,r);return u=a,d.markEnd(d.createFunctionExpression(l,c,[],o))}()):e===t.BooleanLiteral?((n=q()).value="true"===n.value,r=d.createLiteral(n)):e===t.NullLiteral?((n=q()).value=null,r=d.createLiteral(n)):H("[")?r=function(){var e=[];Z("[");for(;!H("]");)H(",")?(q(),e.push(null)):(e.push(fe()),H("]")||Z(","));return Z("]"),d.createArrayExpression(e)}():H("{")?r=function(){var e,t,n,r,a=[],l={},c=String;Z("{");for(;!H("}");)e=ne(),t=e.key.type===i.Identifier?e.key.name:c(e.key.value),r="init"===e.kind?o.Data:"get"===e.kind?o.Get:o.Set,n="$"+t,Object.prototype.hasOwnProperty.call(l,n)?(l[n]===o.Data?u&&r===o.Data?V({},s.StrictDuplicateProperty):r!==o.Data&&V({},s.AccessorDataProperty):r===o.Data?V({},s.AccessorDataProperty):l[n]&r&&V({},s.AccessorGetSet),l[n]|=r):l[n]=r,a.push(e),H("}")||Z(",");return Z("}"),d.createObjectExpression(a)}():(H("/")||H("/="))&&(r=void 0!==b.tokens?d.createLiteral(F()):d.createLiteral(D()),z()),r?d.markEnd(r):void J(q()))}function ie(){var e=[];if(Z("("),!H(")"))for(;h<m&&(e.push(fe()),!H(")"));)Z(",");return Z(")"),e}function oe(){var e;return d.markStart(),function(e){return e.type===t.Identifier||e.type===t.Keyword||e.type===t.BooleanLiteral||e.type===t.NullLiteral}(e=q())||J(e),d.markEnd(d.createIdentifier(e.value))}function se(){return Z("."),oe()}function ae(){var e;return Z("["),e=me(),Z("]"),e}function le(){var e,t;return d.markStart(),Y("new"),e=function(){var e,t,n,r;e=Oe(),t=y.allowIn,n=K("new")?le():re(),y.allowIn=t;for(;H(".")||H("[");)H("[")?(r=ae(),n=d.createMemberExpression("[",n,r)):(r=se(),n=d.createMemberExpression(".",n,r)),e&&e.apply(n);return n}(),t=H("(")?ie():[],d.markEnd(d.createNewExpression(e,t))}function ce(){var e,n;return d.markStart(),e=function(){var e,t,n,r,i;e=Oe(),t=y.allowIn,y.allowIn=!0,n=K("new")?le():re(),y.allowIn=t;for(;H(".")||H("[")||H("(");)H("(")?(r=ie(),n=d.createCallExpression(n,r)):H("[")?(i=ae(),n=d.createMemberExpression("[",n,i)):(i=se(),n=d.createMemberExpression(".",n,i)),e&&e.apply(n);return n}(),g.type===t.Punctuator&&(!H("++")&&!H("--")||U()||(u&&e.type===i.Identifier&&I(e.name)&&V({},s.StrictLHSPostfix),Q(e)||V({},s.InvalidLHSInAssignment),n=q(),e=d.createPostfixExpression(n.value,e))),d.markEndIf(e)}function ue(){var e,n;return d.markStart(),g.type!==t.Punctuator&&g.type!==t.Keyword?n=ce():H("++")||H("--")?(e=q(),n=ue(),u&&n.type===i.Identifier&&I(n.name)&&V({},s.StrictLHSPrefix),Q(n)||V({},s.InvalidLHSInAssignment),n=d.createUnaryExpression(e.value,n)):H("+")||H("-")||H("~")||H("!")?(e=q(),n=ue(),n=d.createUnaryExpression(e.value,n)):K("delete")||K("void")||K("typeof")?(e=q(),n=ue(),n=d.createUnaryExpression(e.value,n),u&&"delete"===n.operator&&n.argument.type===i.Identifier&&V({},s.StrictDelete)):n=ce(),d.markEndIf(n)}function he(e,n){var r=0;if(e.type!==t.Punctuator&&e.type!==t.Keyword)return 0;switch(e.value){case"||":r=1;break;case"&&":r=2;break;case"|":r=3;break;case"^":r=4;break;case"&":r=5;break;case"==":case"!=":case"===":case"!==":r=6;break;case"<":case">":case"<=":case">=":case"instanceof":r=7;break;case"in":r=n?7:0;break;case"<<":case">>":case">>>":r=8;break;case"+":case"-":r=9;break;case"*":case"/":case"%":r=11}return r}function pe(){var e,t,n,r;return d.markStart(),e=function(){var e,t,n,r,i,o,s,a,l,c;if(e=Oe(),l=ue(),0===(i=he(r=g,y.allowIn)))return l;r.prec=i,q(),t=[e,Oe()],s=ue(),o=[l,r,s];for(;(i=he(g,y.allowIn))>0;){for(;o.length>2&&i<=o[o.length-2].prec;)s=o.pop(),a=o.pop().value,l=o.pop(),n=d.createBinaryExpression(a,l,s),t.pop(),(e=t.pop())&&e.apply(n),o.push(n),t.push(e);(r=q()).prec=i,o.push(r),t.push(Oe()),n=ue(),o.push(n)}c=o.length-1,n=o[c],t.pop();for(;c>1;)n=d.createBinaryExpression(o[c-1].value,o[c-2],n),c-=2,(e=t.pop())&&e.apply(n);return n}(),H("?")?(q(),t=y.allowIn,y.allowIn=!0,n=fe(),y.allowIn=t,Z(":"),r=fe(),e=d.markEnd(d.createConditionalExpression(e,n,r))):d.markEnd({}),e}function fe(){var e,n,r,o;return e=g,d.markStart(),o=n=pe(),function(){var e;if(g.type!==t.Punctuator)return!1;return"="===(e=g.value)||"*="===e||"/="===e||"%="===e||"+="===e||"-="===e||"<<="===e||">>="===e||">>>="===e||"&="===e||"^="===e||"|="===e}()&&(Q(n)||V({},s.InvalidLHSInAssignment),u&&n.type===i.Identifier&&I(n.name)&&V(e,s.StrictLHSAssignment),e=q(),r=fe(),o=d.createAssignmentExpression(e.value,n,r)),d.markEndIf(o)}function me(){var e;if(d.markStart(),e=fe(),H(","))for(e=d.createSequenceExpression([e]);h<m&&H(",");)q(),e.expressions.push(fe());return d.markEndIf(e)}function de(){var e;return d.markStart(),Z("{"),e=function(){var e,t=[];for(;h<m&&!H("}")&&void 0!==(e=Ce());)t.push(e);return t}(),Z("}"),d.markEnd(d.createBlockStatement(e))}function ge(){var e;return d.markStart(),(e=q()).type!==t.Identifier&&J(e),d.markEnd(d.createIdentifier(e.value))}function ye(e){var t,n=null;return d.markStart(),t=ge(),u&&I(t.name)&&V({},s.StrictVarName),"const"===e?(Z("="),n=fe()):H("=")&&(q(),n=fe()),d.markEnd(d.createVariableDeclarator(t,n))}function be(e){var t=[];do{if(t.push(ye(e)),!H(","))break;q()}while(h<m);return t}function xe(){var e,t,n,r,i,o,a,l,c;return e=t=n=null,Y("for"),Z("("),H(";")?q():(K("var")||K("let")?(y.allowIn=!1,d.markStart(),l=q(),c=be(),e=d.markEnd(d.createVariableDeclaration(c,l.value)),y.allowIn=!0,1===e.declarations.length&&K("in")&&(q(),r=e,i=me(),e=null)):(y.allowIn=!1,e=me(),y.allowIn=!0,K("in")&&(Q(e)||V({},s.InvalidLHSInForIn),q(),r=e,i=me(),e=null)),void 0===r&&Z(";")),void 0===r&&(H(";")||(t=me()),Z(";"),H(")")||(n=me())),Z(")"),a=y.inIteration,y.inIteration=!0,o=Se(),y.inIteration=a,void 0===r?d.createForStatement(e,t,n,o):d.createForInStatement(r,i,o)}function ve(){var e,t,n=[];for(d.markStart(),K("default")?(q(),e=null):(Y("case"),e=me()),Z(":");h<m&&!(H("}")||K("default")||K("case"));)t=Se(),n.push(t);return d.markEnd(d.createSwitchCase(e,n))}function _e(){var e,t=[],n=null;return Y("try"),e=de(),K("catch")&&t.push(function(){var e,t;d.markStart(),Y("catch"),Z("("),H(")")&&J(g);e=ge(),u&&I(e.name)&&V({},s.StrictCatchVariable);return Z(")"),t=de(),d.markEnd(d.createCatchClause(e,t))}()),K("finally")&&(q(),n=de()),0!==t.length||n||W({},s.NoCatchOrFinally),d.createTryStatement(e,[],t,n)}function Se(){var e,n,r,o,a,l,p,f=g.type;if(f===t.EOF&&J(g),d.markStart(),f===t.Punctuator)switch(g.value){case";":return d.markEnd((Z(";"),d.createEmptyStatement()));case"{":return d.markEnd(de());case"(":return d.markEnd(function(){var e=me();return X(),d.createExpressionStatement(e)}())}if(f===t.Keyword)switch(g.value){case"break":return d.markEnd(function(){var e,n=null;if(Y("break"),59===c.charCodeAt(h))return q(),y.inIteration||y.inSwitch||W({},s.IllegalBreak),d.createBreakStatement(null);if(U())return y.inIteration||y.inSwitch||W({},s.IllegalBreak),d.createBreakStatement(null);g.type===t.Identifier&&(n=ge(),e="$"+n.name,Object.prototype.hasOwnProperty.call(y.labelSet,e)||W({},s.UnknownLabel,n.name));X(),null!==n||y.inIteration||y.inSwitch||W({},s.IllegalBreak);return d.createBreakStatement(n)}());case"continue":return d.markEnd(function(){var e,n=null;if(Y("continue"),59===c.charCodeAt(h))return q(),y.inIteration||W({},s.IllegalContinue),d.createContinueStatement(null);if(U())return y.inIteration||W({},s.IllegalContinue),d.createContinueStatement(null);g.type===t.Identifier&&(n=ge(),e="$"+n.name,Object.prototype.hasOwnProperty.call(y.labelSet,e)||W({},s.UnknownLabel,n.name));X(),null!==n||y.inIteration||W({},s.IllegalContinue);return d.createContinueStatement(n)}());case"debugger":return d.markEnd((Y("debugger"),X(),d.createDebuggerStatement()));case"do":return d.markEnd(function(){var e,t,n;Y("do"),n=y.inIteration,y.inIteration=!0,e=Se(),y.inIteration=n,Y("while"),Z("("),t=me(),Z(")"),H(";")&&q();return d.createDoWhileStatement(e,t)}());case"for":return d.markEnd(xe());case"function":return d.markEnd(Ee());case"if":return d.markEnd(function(){var e,t,n;Y("if"),Z("("),e=me(),Z(")"),t=Se(),K("else")?(q(),n=Se()):n=null;return d.createIfStatement(e,t,n)}());case"return":return d.markEnd(function(){var e=null;Y("return"),y.inFunctionBody||V({},s.IllegalReturn);if(32===c.charCodeAt(h)&&E(c.charCodeAt(h+1)))return e=me(),X(),d.createReturnStatement(e);if(U())return d.createReturnStatement(null);H(";")||H("}")||g.type===t.EOF||(e=me());return X(),d.createReturnStatement(e)}());case"switch":return d.markEnd(function(){var e,t,n,r,i;if(Y("switch"),Z("("),e=me(),Z(")"),Z("{"),t=[],H("}"))return q(),d.createSwitchStatement(e,t);r=y.inSwitch,y.inSwitch=!0,i=!1;for(;h<m&&!H("}");)null===(n=ve()).test&&(i&&W({},s.MultipleDefaultsInSwitch),i=!0),t.push(n);return y.inSwitch=r,Z("}"),d.createSwitchStatement(e,t)}());case"throw":return d.markEnd(function(){var e;Y("throw"),U()&&W({},s.NewlineAfterThrow);return e=me(),X(),d.createThrowStatement(e)}());case"try":return d.markEnd(_e());case"var":return d.markEnd((Y("var"),p=be(),X(),d.createVariableDeclaration(p,"var")));case"while":return d.markEnd((Y("while"),Z("("),o=me(),Z(")"),l=y.inIteration,y.inIteration=!0,a=Se(),y.inIteration=l,d.createWhileStatement(o,a)));case"with":return d.markEnd(function(){var e,t;u&&V({},s.StrictModeWith);return Y("with"),Z("("),e=me(),Z(")"),t=Se(),d.createWithStatement(e,t)}())}return(e=me()).type===i.Identifier&&H(":")?(q(),r="$"+e.name,Object.prototype.hasOwnProperty.call(y.labelSet,r)&&W({},s.Redeclaration,"Label",e.name),y.labelSet[r]=!0,n=Se(),delete y.labelSet[r],d.markEnd(d.createLabeledStatement(e,n))):(X(),d.markEnd(d.createExpressionStatement(e)))}function ke(){var e,n,r,o,a,l,p,f=[];for(d.markStart(),Z("{");h<m&&g.type===t.StringLiteral&&(n=g,e=Ce(),f.push(e),e.expression.type===i.Literal);)"use strict"===c.slice(n.range[0]+1,n.range[1]-1)?(u=!0,r&&V(r,s.StrictOctalLiteral)):!r&&n.octal&&(r=n);for(o=y.labelSet,a=y.inIteration,l=y.inSwitch,p=y.inFunctionBody,y.labelSet={},y.inIteration=!1,y.inSwitch=!1,y.inFunctionBody=!0;h<m&&!H("}")&&void 0!==(e=Ce());)f.push(e);return Z("}"),y.labelSet=o,y.inIteration=a,y.inSwitch=l,y.inFunctionBody=p,d.markEnd(d.createBlockStatement(f))}function we(e){var t,n,r,i,o,a,l=[];if(Z("("),!H(")"))for(i={};h<m&&(n=g,t=ge(),o="$"+n.value,u?(I(n.value)&&(r=n,a=s.StrictParamName),Object.prototype.hasOwnProperty.call(i,o)&&(r=n,a=s.StrictParamDupe)):e||(I(n.value)?(e=n,a=s.StrictParamName):A(n.value)?(e=n,a=s.StrictReservedWord):Object.prototype.hasOwnProperty.call(i,o)&&(e=n,a=s.StrictParamDupe)),l.push(t),i[o]=!0,!H(")"));)Z(",");return Z(")"),{params:l,stricted:r,firstRestricted:e,message:a}}function Ee(){var e,t,n,r,i,o,a,l,c=[];return d.markStart(),Y("function"),n=g,e=ge(),u?I(n.value)&&V(n,s.StrictFunctionName):I(n.value)?(o=n,a=s.StrictFunctionName):A(n.value)&&(o=n,a=s.StrictReservedWord),i=we(o),c=i.params,r=i.stricted,o=i.firstRestricted,i.message&&(a=i.message),l=u,t=ke(),u&&o&&W(o,a),u&&r&&V(r,a),u=l,d.markEnd(d.createFunctionDeclaration(e,c,[],t))}function Ce(){if(g.type===t.Keyword)switch(g.value){case"const":case"let":return e=g.value,d.markStart(),Y(e),n=be(e),X(),d.markEnd(d.createVariableDeclaration(n,e));case"function":return Ee();default:return Se()}var e,n;if(g.type!==t.EOF)return Se()}function Ae(){var e;return d.markStart(),u=!1,z(),e=function(){var e,n,r,o=[];for(;h<m&&(n=g).type===t.StringLiteral&&(e=Ce(),o.push(e),e.expression.type===i.Literal);)"use strict"===c.slice(n.range[0]+1,n.range[1]-1)?(u=!0,r&&V(r,s.StrictOctalLiteral)):!r&&n.octal&&(r=n);for(;h<m&&void 0!==(e=Ce());)o.push(e);return o}(),d.markEnd(d.createProgram(e))}function Ie(){var e,t,n,r=[];for(e=0;e<b.tokens.length;++e)t=b.tokens[e],n={type:t.type,value:t.value},b.range&&(n.range=t.range),b.loc&&(n.loc=t.loc),r.push(n);b.tokens=r}function Le(){this.startIndex=h,this.startLine=p,this.startColumn=h-f}function Oe(){return b.loc||b.range?($(),new Le):null}(n={})[(t={BooleanLiteral:1,EOF:2,Identifier:3,Keyword:4,NullLiteral:5,NumericLiteral:6,Punctuator:7,StringLiteral:8,RegularExpression:9}).BooleanLiteral]="Boolean",n[t.EOF]="<end>",n[t.Identifier]="Identifier",n[t.Keyword]="Keyword",n[t.NullLiteral]="Null",n[t.NumericLiteral]="Numeric",n[t.Punctuator]="Punctuator",n[t.StringLiteral]="String",n[t.RegularExpression]="RegularExpression",r=["(","{","[","in","typeof","instanceof","new","return","case","delete","throw","void","=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","&=","|=","^=",",","+","-","*","/","%","++","--","<<",">>",">>>","&","|","^","!","~","&&","||","?",":","===","==",">=","<=","<",">","!=","!=="],i={AssignmentExpression:"AssignmentExpression",ArrayExpression:"ArrayExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DoWhileStatement:"DoWhileStatement",DebuggerStatement:"DebuggerStatement",EmptyStatement:"EmptyStatement",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",Identifier:"Identifier",IfStatement:"IfStatement",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",Program:"Program",Property:"Property",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SwitchStatement:"SwitchStatement",SwitchCase:"SwitchCase",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement"},o={Data:1,Get:2,Set:4},s={UnexpectedToken:"Unexpected token %0",UnexpectedNumber:"Unexpected number",UnexpectedString:"Unexpected string",UnexpectedIdentifier:"Unexpected identifier",UnexpectedReserved:"Unexpected reserved word",UnexpectedEOS:"Unexpected end of input",NewlineAfterThrow:"Illegal newline after throw",InvalidRegExp:"Invalid regular expression",UnterminatedRegExp:"Invalid regular expression: missing /",InvalidLHSInAssignment:"Invalid left-hand side in assignment",InvalidLHSInForIn:"Invalid left-hand side in for-in",MultipleDefaultsInSwitch:"More than one default clause in switch statement",NoCatchOrFinally:"Missing catch or finally after try",UnknownLabel:"Undefined label '%0'",Redeclaration:"%0 '%1' has already been declared",IllegalContinue:"Illegal continue statement",IllegalBreak:"Illegal break statement",IllegalReturn:"Illegal return statement",StrictModeWith:"Strict mode code may not include a with statement",StrictCatchVariable:"Catch variable may not be eval or arguments in strict mode",StrictVarName:"Variable name may not be eval or arguments in strict mode",StrictParamName:"Parameter name eval or arguments is not allowed in strict mode",StrictParamDupe:"Strict mode function may not have duplicate parameter names",StrictFunctionName:"Function name may not be eval or arguments in strict mode",StrictOctalLiteral:"Octal literals are not allowed in strict mode.",StrictDelete:"Delete of an unqualified identifier in strict mode.",StrictDuplicateProperty:"Duplicate data property in object literal not allowed in strict mode",AccessorDataProperty:"Object literal may not have data and accessor property with the same name",AccessorGetSet:"Object literal may not have multiple get/set accessors with the same name",StrictLHSAssignment:"Assignment to eval or arguments is not allowed in strict mode",StrictLHSPostfix:"Postfix increment/decrement may not have eval or arguments operand in strict mode",StrictLHSPrefix:"Prefix increment/decrement may not have eval or arguments operand in strict mode",StrictReservedWord:"Use of future reserved word in strict mode"},a={NonAsciiIdentifierStart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),NonAsciiIdentifierPart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")},l={name:"SyntaxTree",markStart:function(){$(),b.loc&&(y.markerStack.push(h-f),y.markerStack.push(p)),b.range&&y.markerStack.push(h)},processComment:function(e){var t,n,r,o,s;if(void 0!==e.type&&e.type!==i.Program)for(z(),t=0;t<b.pendingComments.length;++t)n=b.pendingComments[t],e.range[0]>=n.comment.range[1]&&((s=n.leading)?(r=s.range[0],o=s.range[1]-r,e.range[0]<=r&&e.range[1]-e.range[0]>=o&&(n.leading=e)):n.leading=e),e.range[1]<=n.comment.range[0]&&((s=n.trailing)?(r=s.range[0],o=s.range[1]-r,e.range[0]<=r&&e.range[1]-e.range[0]>=o&&(n.trailing=e)):n.trailing=e)},markEnd:function(e){return b.range&&(e.range=[y.markerStack.pop(),h]),b.loc&&(e.loc={start:{line:y.markerStack.pop(),column:y.markerStack.pop()},end:{line:p,column:h-f}},this.postProcess(e)),b.attachComment&&this.processComment(e),e},markEndIf:function(e){return e.range||e.loc?(b.loc&&(y.markerStack.pop(),y.markerStack.pop()),b.range&&y.markerStack.pop()):this.markEnd(e),e},postProcess:function(e){return b.source&&(e.loc.source=b.source),e},createArrayExpression:function(e){return{type:i.ArrayExpression,elements:e}},createAssignmentExpression:function(e,t,n){return{type:i.AssignmentExpression,operator:e,left:t,right:n}},createBinaryExpression:function(e,t,n){var r="||"===e||"&&"===e?i.LogicalExpression:i.BinaryExpression;return{type:r,operator:e,left:t,right:n}},createBlockStatement:function(e){return{type:i.BlockStatement,body:e}},createBreakStatement:function(e){return{type:i.BreakStatement,label:e}},createCallExpression:function(e,t){return{type:i.CallExpression,callee:e,arguments:t}},createCatchClause:function(e,t){return{type:i.CatchClause,param:e,body:t}},createConditionalExpression:function(e,t,n){return{type:i.ConditionalExpression,test:e,consequent:t,alternate:n}},createContinueStatement:function(e){return{type:i.ContinueStatement,label:e}},createDebuggerStatement:function(){return{type:i.DebuggerStatement}},createDoWhileStatement:function(e,t){return{type:i.DoWhileStatement,body:e,test:t}},createEmptyStatement:function(){return{type:i.EmptyStatement}},createExpressionStatement:function(e){return{type:i.ExpressionStatement,expression:e}},createForStatement:function(e,t,n,r){return{type:i.ForStatement,init:e,test:t,update:n,body:r}},createForInStatement:function(e,t,n){return{type:i.ForInStatement,left:e,right:t,body:n,each:!1}},createFunctionDeclaration:function(e,t,n,r){return{type:i.FunctionDeclaration,id:e,params:t,defaults:n,body:r,rest:null,generator:!1,expression:!1}},createFunctionExpression:function(e,t,n,r){return{type:i.FunctionExpression,id:e,params:t,defaults:n,body:r,rest:null,generator:!1,expression:!1}},createIdentifier:function(e){return{type:i.Identifier,name:e}},createIfStatement:function(e,t,n){return{type:i.IfStatement,test:e,consequent:t,alternate:n}},createLabeledStatement:function(e,t){return{type:i.LabeledStatement,label:e,body:t}},createLiteral:function(e){return{type:i.Literal,value:e.value,raw:c.slice(e.range[0],e.range[1])}},createMemberExpression:function(e,t,n){return{type:i.MemberExpression,computed:"["===e,object:t,property:n}},createNewExpression:function(e,t){return{type:i.NewExpression,callee:e,arguments:t}},createObjectExpression:function(e){return{type:i.ObjectExpression,properties:e}},createPostfixExpression:function(e,t){return{type:i.UpdateExpression,operator:e,argument:t,prefix:!1}},createProgram:function(e){return{type:i.Program,body:e}},createProperty:function(e,t,n){return{type:i.Property,key:t,value:n,kind:e}},createReturnStatement:function(e){return{type:i.ReturnStatement,argument:e}},createSequenceExpression:function(e){return{type:i.SequenceExpression,expressions:e}},createSwitchCase:function(e,t){return{type:i.SwitchCase,test:e,consequent:t}},createSwitchStatement:function(e,t){return{type:i.SwitchStatement,discriminant:e,cases:t}},createThisExpression:function(){return{type:i.ThisExpression}},createThrowStatement:function(e){return{type:i.ThrowStatement,argument:e}},createTryStatement:function(e,t,n,r){return{type:i.TryStatement,block:e,guardedHandlers:t,handlers:n,finalizer:r}},createUnaryExpression:function(e,t){return"++"===e||"--"===e?{type:i.UpdateExpression,operator:e,argument:t,prefix:!0}:{type:i.UnaryExpression,operator:e,argument:t,prefix:!0}},createVariableDeclaration:function(e,t){return{type:i.VariableDeclaration,declarations:e,kind:t}},createVariableDeclarator:function(e,t){return{type:i.VariableDeclarator,id:e,init:t}},createWhileStatement:function(e,t){return{type:i.WhileStatement,test:e,body:t}},createWithStatement:function(e,t){return{type:i.WithStatement,object:e,body:t}}},Le.prototype={constructor:Le,apply:function(e){b.range&&(e.range=[this.startIndex,h]),b.loc&&(e.loc={start:{line:this.startLine,column:this.startColumn},end:{line:p,column:h-f}},e=d.postProcess(e)),b.attachComment&&d.processComment(e)}},e.version="1.1.1",e.tokenize=function(e,n){var r,i;r=String,"string"==typeof e||e instanceof String||(e=r(e));d=l,h=0,p=(c=e).length>0?1:0,f=0,m=c.length,g=null,y={allowIn:!0,labelSet:{},inFunctionBody:!1,inIteration:!1,inSwitch:!1,lastCommentStart:-1},b={},(n=n||{}).tokens=!0,b.tokens=[],b.tokenize=!0,b.openParenToken=-1,b.openCurlyToken=-1,b.range="boolean"==typeof n.range&&n.range,b.loc="boolean"==typeof n.loc&&n.loc,"boolean"==typeof n.comment&&n.comment&&(b.comments=[]);"boolean"==typeof n.tolerant&&n.tolerant&&(b.errors=[]);m>0&&void 0===c[0]&&e instanceof String&&(c=e.valueOf());try{if(z(),g.type===t.EOF)return b.tokens;for(q();g.type!==t.EOF;)try{q()}catch(e){if(g,b.errors){b.errors.push(e);break}throw e}Ie(),i=b.tokens,void 0!==b.comments&&(i.comments=b.comments),void 0!==b.errors&&(i.errors=b.errors)}catch(e){throw e}finally{b={}}return i},e.parse=function(e,t){var n,r;r=String,"string"==typeof e||e instanceof String||(e=r(e));d=l,h=0,p=(c=e).length>0?1:0,f=0,m=c.length,g=null,y={allowIn:!0,labelSet:{},inFunctionBody:!1,inIteration:!1,inSwitch:!1,lastCommentStart:-1,markerStack:[]},b={},void 0!==t&&(b.range="boolean"==typeof t.range&&t.range,b.loc="boolean"==typeof t.loc&&t.loc,b.attachComment="boolean"==typeof t.attachComment&&t.attachComment,b.loc&&null!==t.source&&void 0!==t.source&&(b.source=r(t.source)),"boolean"==typeof t.tokens&&t.tokens&&(b.tokens=[]),"boolean"==typeof t.comment&&t.comment&&(b.comments=[]),"boolean"==typeof t.tolerant&&t.tolerant&&(b.errors=[]),b.attachComment&&(b.range=!0,b.pendingComments=[],b.comments=[]));m>0&&void 0===c[0]&&e instanceof String&&(c=e.valueOf());try{n=Ae(),void 0!==b.comments&&(n.comments=b.comments),void 0!==b.tokens&&(Ie(),n.tokens=b.tokens),void 0!==b.errors&&(n.errors=b.errors),b.attachComment&&function(){var e,t,n,r;for(e=0;e<b.pendingComments.length;++e)t=b.pendingComments[e],t.comment,(n=t.leading)&&(void 0===n.leadingComments&&(n.leadingComments=[]),n.leadingComments.push(t.comment)),(r=t.trailing)&&(void 0===r.trailingComments&&(r.trailingComments=[]),r.trailingComments.push(t.comment));b.pendingComments=[]}()}catch(e){throw e}finally{b={}}return n},e.Syntax=function(){var e,t={};for(e in"function"==typeof Object.create&&(t=Object.create(null)),i)i.hasOwnProperty(e)&&(t[e]=i[e]);return"function"==typeof Object.freeze&&Object.freeze(t),t}()})?r.apply(t,i):r)||(e.exports=o)}()},function(e,t,n){(function(e){!function(){"use strict";var r,i,o,s,a,l,c,u,h,p,f,m,d,g,y,b,x,v,_,S,k,w,E,C,A;function I(e,t){var n="";for(t|=0;t>0;t>>>=1,e+=e)1&t&&(n+=e);return n}function L(e){var t=e.length;return t&&l.code.isLineTerminator(e.charCodeAt(t-1))}function O(e,t){var n,r;function i(e){return"object"==typeof e&&e instanceof Object&&!(e instanceof RegExp)}for(n in t)t.hasOwnProperty(n)&&(i(r=t[n])?i(e[n])?O(e[n],r):e[n]=O({},r):e[n]=r);return e}function P(e,t){return 8232==(-2&e)?(t?"u":"\\u")+(8232===e?"2028":"2029"):10===e||13===e?(t?"":"\\")+(10===e?"n":"r"):String.fromCharCode(e)}function $(e,t){var n,r="\\";switch(e){case 8:r+="b";break;case 12:r+="f";break;case 9:r+="t";break;default:n=e.toString(16).toUpperCase(),p||e>255?r+="u"+"0000".slice(n.length)+n:0!==e||l.code.isDecimalDigit(t)?r+=11===e?"x0B":"x"+"00".slice(n.length)+n:r+="0"}return r}function j(e){var t="\\";switch(e){case 92:t+="\\";break;case 10:t+="n";break;case 13:t+="r";break;case 8232:t+="u2028";break;case 8233:t+="u2029";break;default:throw new Error("Incorrectly classified character")}return t}function R(e,t){if(!E)return c(e)?function e(t){var n,r,i,o="";for(n=0,r=t.length;n<r;++n)i=t[n],o+=c(i)?e(i):i;return o}(e):e;if(null==t){if(e instanceof s)return e;t={}}return null==t.loc?new s(null,null,E,e,t.name||null):new s(t.loc.start.line,t.loc.start.column,!0===E?t.loc.source||null:E,e,t.name||null)}function M(){return b||" "}function N(e,t){var n=R(e).toString(),r=R(t).toString(),i=n.charCodeAt(n.length-1),o=r.charCodeAt(0);return(43===i||45===i)&&i===o||l.code.isIdentifierPart(i)&&l.code.isIdentifierPart(o)||47===i&&105===o?[e,M(),t]:l.code.isWhiteSpace(i)||l.code.isLineTerminator(i)||l.code.isWhiteSpace(o)||l.code.isLineTerminator(o)?[e,t]:[e,b,t]}function T(e){return[u,e]}function D(e){var t,n;return t=u,u+=h,n=e.call(this,u),u=t,n}function F(e,t){return"Line"===e.type?L(e.value)?"//"+e.value:"//"+e.value+"\n":k.format.indent.adjustMultilineComment&&/[\n\r]/.test(e.value)?function(e,t){var n,r,i,o,s,a,c,h;for(n=e.split(/\r\n|[\r\n]/),a=Number.MAX_VALUE,r=1,i=n.length;r<i;++r){for(o=n[r],s=0;s<o.length&&l.code.isWhiteSpace(o.charCodeAt(s));)++s;a>s&&(a=s)}for(void 0!==t?(c=u,"*"===n[1][a]&&(t+=" "),u=t):(1&a&&--a,c=u),r=1,i=n.length;r<i;++r)h=R(T(n[r].slice(a))),n[r]=E?h.join(""):h;return u=c,n.join("\n")}("/*"+e.value+"*/",t):"/*"+e.value+"*/"}function G(e,t){var n,i,o,s,a,c,p;if(e.leadingComments&&e.leadingComments.length>0){for(s=t,o=e.leadingComments[0],t=[],_&&e.type===r.Program&&0===e.body.length&&t.push("\n"),t.push(F(o)),L(R(t).toString())||t.push("\n"),n=1,i=e.leadingComments.length;n<i;++n)L(R(p=[F(o=e.leadingComments[n])]).toString())||p.push("\n"),t.push(T(p));t.push(T(s))}if(e.trailingComments)for(a=!L(R(t).toString()),c=I(" ",function(e){var t;for(t=e.length-1;t>=0&&!l.code.isLineTerminator(e.charCodeAt(t));--t);return e.length-1-t}(R([u,t,h]).toString())),n=0,i=e.trailingComments.length;n<i;++n)o=e.trailingComments[n],a?(t=0===n?[t,h]:[t,c]).push(F(o,c)):t=[t,T(F(o))],n===i-1||L(R(t).toString())||(t=[t,"\n"]);return t}function B(e,t,n){return t<n?["(",e,")"]:e}function q(e,t,n){var i,o;return o=!k.comment||!e.leadingComments,e.type===r.BlockStatement&&o?[b,K(e,{functionBody:n})]:e.type===r.EmptyStatement&&o?";":(D(function(){i=[y,T(K(e,{semicolonOptional:t,functionBody:n}))]}),i)}function z(e,t){var n=L(R(t).toString());return e.type!==r.BlockStatement||k.comment&&e.leadingComments||n?n?[t,u]:[t,y,u]:[t,b]}function U(e){var t,n,r;for(t=1,n=(r=e.split(/\r\n|\n/)).length;t<n;t++)r[t]=y+u+r[t];return r}function W(e){return R(e.name,e)}function V(e,t){return e.type===r.Identifier?W(e):H(e,{precedence:t.precedence,allowIn:t.allowIn,allowCall:!0})}function J(e){var t,n,o,s,a;if((a=e.type===r.ArrowFunctionExpression)&&1===e.params.length&&e.params[0].type===r.Identifier)t=[W(e.params[0])];else{for(t=["("],n=0,o=e.params.length;n<o;++n)t.push(V(e.params[n],{precedence:i.Assignment,allowIn:!0})),n+1<o&&t.push(","+b);t.push(")")}return a&&(t.push(b),t.push("=>")),e.expression?(t.push(b),"{"===(s=H(e.body,{precedence:i.Assignment,allowIn:!0,allowCall:!0})).toString().charAt(0)&&(s=["(",s,")"]),t.push(s)):t.push(q(e.body,!1,!0)),t}function Z(e,t,n){var o=["for"+b+"("];return D(function(){t.left.type===r.VariableDeclaration?D(function(){o.push(t.left.kind+M()),o.push(K(t.left.declarations[0],{allowIn:!1}))}):o.push(H(t.left,{precedence:i.Call,allowIn:!0,allowCall:!0})),o=N(o,e),o=[N(o,H(t.right,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),")"]}),o.push(q(t.body,n)),o}function Y(e){var t;if(e.hasOwnProperty("raw")&&w&&k.raw)try{if((t=w(e.raw).body[0].expression).type===r.Literal&&t.value===e.value)return e.raw}catch(e){}return null===e.value?"null":"string"==typeof e.value?function(e){var t,n,r,i,o,s="",a=0,c=0;for(t=0,n=e.length;t<n;++t){if(39===(r=e.charCodeAt(t)))++a;else if(34===r)++c;else if(47===r&&p)s+="\\";else{if(l.code.isLineTerminator(r)||92===r){s+=j(r);continue}if(p&&r<32||!(p||g||r>=32&&r<=126)){s+=$(r,e.charCodeAt(t+1));continue}}s+=String.fromCharCode(r)}if(o=(i=!("double"===d||"auto"===d&&c<a))?"'":'"',!(i?a:c))return o+s+o;for(e=s,s=o,t=0,n=e.length;t<n;++t)(39===(r=e.charCodeAt(t))&&i||34===r&&!i)&&(s+="\\"),s+=String.fromCharCode(r);return s+o}(e.value):"number"==typeof e.value?function(e){var t,n,r,i,o;if(e!=e)throw new Error("Numeric literal whose value is NaN");if(e<0||0===e&&1/e<0)throw new Error("Numeric literal whose value is negative");if(e===1/0)return p?"null":f?"1e400":"1e+400";if(t=""+e,!f||t.length<3)return t;for(n=t.indexOf("."),p||48!==t.charCodeAt(0)||1!==n||(n=0,t=t.slice(1)),r=t,t=t.replace("e+","e"),i=0,(o=r.indexOf("e"))>0&&(i=+r.slice(o+1),r=r.slice(0,o)),n>=0&&(i-=r.length-n-1,r=+(r.slice(0,n)+r.slice(n+1))+""),o=0;48===r.charCodeAt(r.length+o-1);)--o;return 0!==o&&(i-=o,r=r.slice(0,o)),0!==i&&(r+="e"+i),(r.length<t.length||m&&e>1e12&&Math.floor(e)===e&&(r="0x"+e.toString(16)).length<t.length)&&+r===e&&(t=r),t}(e.value):"boolean"==typeof e.value?e.value?"true":"false":function(e){var t,n,r,i,o,s,a,l;if(n=e.toString(),e.source){if(!(t=n.match(/\/([^\/]*)$/)))return n;for(r=t[1],n="",a=!1,l=!1,i=0,o=e.source.length;i<o;++i)s=e.source.charCodeAt(i),l?(n+=P(s,l),l=!1):(a?93===s&&(a=!1):47===s?n+="\\":91===s&&(a=!0),n+=P(s,l),l=92===s);return"/"+n+"/"+r}return n}(e.value)}function H(e,t){var n,s,a,c,h,p,f,m,d,g,v,_,S,w,E,C;if(s=t.precedence,_=t.allowIn,S=t.allowCall,a=e.type||t.type,k.verbatim&&e.hasOwnProperty(k.verbatim))return function(e,t){var n;return R("string"==typeof(n=e[k.verbatim])?B(U(n),i.Sequence,t.precedence):B(U(n.content),null!=n.precedence?n.precedence:i.Sequence,t.precedence),e)}(e,t);switch(a){case r.SequenceExpression:for(n=[],_|=i.Sequence<s,h=0,p=e.expressions.length;h<p;++h)n.push(H(e.expressions[h],{precedence:i.Assignment,allowIn:_,allowCall:!0})),h+1<p&&n.push(","+b);n=B(n,i.Sequence,s);break;case r.AssignmentExpression:_|=i.Assignment<s,n=B([H(e.left,{precedence:i.Call,allowIn:_,allowCall:!0}),b+e.operator+b,H(e.right,{precedence:i.Assignment,allowIn:_,allowCall:!0})],i.Assignment,s);break;case r.ArrowFunctionExpression:_|=i.ArrowFunction<s,n=B(J(e),i.ArrowFunction,s);break;case r.ConditionalExpression:_|=i.Conditional<s,n=B([H(e.test,{precedence:i.LogicalOR,allowIn:_,allowCall:!0}),b+"?"+b,H(e.consequent,{precedence:i.Assignment,allowIn:_,allowCall:!0}),b+":"+b,H(e.alternate,{precedence:i.Assignment,allowIn:_,allowCall:!0})],i.Conditional,s);break;case r.LogicalExpression:case r.BinaryExpression:_|=(c=o[e.operator])<s,g=(f=H(e.left,{precedence:c,allowIn:_,allowCall:!0})).toString(),n=47===g.charCodeAt(g.length-1)&&l.code.isIdentifierPart(e.operator.charCodeAt(0))?[f,M(),e.operator]:N(f,e.operator),f=H(e.right,{precedence:c+1,allowIn:_,allowCall:!0}),"/"===e.operator&&"/"===f.toString().charAt(0)||"<"===e.operator.slice(-1)&&"!--"===f.toString().slice(0,3)?(n.push(M()),n.push(f)):n=N(n,f),n="in"!==e.operator||_?B(n,c,s):["(",n,")"];break;case r.CallExpression:for((n=[H(e.callee,{precedence:i.Call,allowIn:!0,allowCall:!0,allowUnparenthesizedNew:!1})]).push("("),h=0,p=e.arguments.length;h<p;++h)n.push(H(e.arguments[h],{precedence:i.Assignment,allowIn:!0,allowCall:!0})),h+1<p&&n.push(","+b);n.push(")"),n=S?B(n,i.Call,s):["(",n,")"];break;case r.NewExpression:if(p=e.arguments.length,w=void 0===t.allowUnparenthesizedNew||t.allowUnparenthesizedNew,n=N("new",H(e.callee,{precedence:i.New,allowIn:!0,allowCall:!1,allowUnparenthesizedNew:w&&!x&&0===p})),!w||x||p>0){for(n.push("("),h=0;h<p;++h)n.push(H(e.arguments[h],{precedence:i.Assignment,allowIn:!0,allowCall:!0})),h+1<p&&n.push(","+b);n.push(")")}n=B(n,i.New,s);break;case r.MemberExpression:n=[H(e.object,{precedence:i.Call,allowIn:!0,allowCall:S,allowUnparenthesizedNew:!1})],e.computed?(n.push("["),n.push(H(e.property,{precedence:i.Sequence,allowIn:!0,allowCall:S})),n.push("]")):(e.object.type===r.Literal&&"number"==typeof e.object.value&&(f=R(n).toString()).indexOf(".")<0&&!/[eExX]/.test(f)&&l.code.isDecimalDigit(f.charCodeAt(f.length-1))&&!(f.length>=2&&48===f.charCodeAt(0))&&n.push("."),n.push("."),n.push(W(e.property))),n=B(n,i.Member,s);break;case r.UnaryExpression:f=H(e.argument,{precedence:i.Unary,allowIn:!0,allowCall:!0}),""===b?n=N(e.operator,f):(n=[e.operator],e.operator.length>2?n=N(n,f):(d=(g=R(n).toString()).charCodeAt(g.length-1),v=f.toString().charCodeAt(0),(43===d||45===d)&&d===v||l.code.isIdentifierPart(d)&&l.code.isIdentifierPart(v)?(n.push(M()),n.push(f)):n.push(f))),n=B(n,i.Unary,s);break;case r.YieldExpression:n=e.delegate?"yield*":"yield",e.argument&&(n=N(n,H(e.argument,{precedence:i.Yield,allowIn:!0,allowCall:!0}))),n=B(n,i.Yield,s);break;case r.UpdateExpression:n=e.prefix?B([e.operator,H(e.argument,{precedence:i.Unary,allowIn:!0,allowCall:!0})],i.Unary,s):B([H(e.argument,{precedence:i.Postfix,allowIn:!0,allowCall:!0}),e.operator],i.Postfix,s);break;case r.FunctionExpression:E=e.generator&&!k.moz.starlessGenerator,n=E?"function*":"function",n=e.id?[n,E?b:M(),W(e.id),J(e)]:[n+b,J(e)];break;case r.ArrayPattern:case r.ArrayExpression:if(!e.elements.length){n="[]";break}m=e.elements.length>1,n=["[",m?y:""],D(function(t){for(h=0,p=e.elements.length;h<p;++h)e.elements[h]?(n.push(m?t:""),n.push(H(e.elements[h],{precedence:i.Assignment,allowIn:!0,allowCall:!0}))):(m&&n.push(t),h+1===p&&n.push(",")),h+1<p&&n.push(","+(m?y:b))}),m&&!L(R(n).toString())&&n.push(y),n.push(m?u:""),n.push("]");break;case r.Property:"get"===e.kind||"set"===e.kind?n=[e.kind,M(),H(e.key,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),J(e.value)]:e.shorthand?n=H(e.key,{precedence:i.Sequence,allowIn:!0,allowCall:!0}):e.method?(n=[],e.value.generator&&n.push("*"),n.push(H(e.key,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),n.push(J(e.value))):n=[H(e.key,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),":"+b,H(e.value,{precedence:i.Assignment,allowIn:!0,allowCall:!0})];break;case r.ObjectExpression:if(!e.properties.length){n="{}";break}if(m=e.properties.length>1,D(function(){f=H(e.properties[0],{precedence:i.Sequence,allowIn:!0,allowCall:!0,type:r.Property})}),!m&&(C=R(f).toString(),!/[\r\n]/g.test(C))){n=["{",b,f,b,"}"];break}D(function(t){if(n=["{",y,t,f],m)for(n.push(","+y),h=1,p=e.properties.length;h<p;++h)n.push(t),n.push(H(e.properties[h],{precedence:i.Sequence,allowIn:!0,allowCall:!0,type:r.Property})),h+1<p&&n.push(","+y)}),L(R(n).toString())||n.push(y),n.push(u),n.push("}");break;case r.ObjectPattern:if(!e.properties.length){n="{}";break}if(m=!1,1===e.properties.length)e.properties[0].value.type!==r.Identifier&&(m=!0);else for(h=0,p=e.properties.length;h<p;++h)if(!e.properties[h].shorthand){m=!0;break}n=["{",m?y:""],D(function(t){for(h=0,p=e.properties.length;h<p;++h)n.push(m?t:""),n.push(H(e.properties[h],{precedence:i.Sequence,allowIn:!0,allowCall:!0})),h+1<p&&n.push(","+(m?y:b))}),m&&!L(R(n).toString())&&n.push(y),n.push(m?u:""),n.push("}");break;case r.ThisExpression:n="this";break;case r.Identifier:n=W(e);break;case r.Literal:n=Y(e);break;case r.GeneratorExpression:case r.ComprehensionExpression:n=a===r.GeneratorExpression?["("]:["["],k.moz.comprehensionExpressionStartsWithAssignment&&(f=H(e.body,{precedence:i.Assignment,allowIn:!0,allowCall:!0}),n.push(f)),e.blocks&&D(function(){for(h=0,p=e.blocks.length;h<p;++h)f=H(e.blocks[h],{precedence:i.Sequence,allowIn:!0,allowCall:!0}),h>0||k.moz.comprehensionExpressionStartsWithAssignment?n=N(n,f):n.push(f)}),e.filter&&(n=N(n,"if"+b),f=H(e.filter,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),n=k.moz.parenthesizedComprehensionBlock?N(n,["(",f,")"]):N(n,f)),k.moz.comprehensionExpressionStartsWithAssignment||(f=H(e.body,{precedence:i.Assignment,allowIn:!0,allowCall:!0}),n=N(n,f)),n.push(a===r.GeneratorExpression?")":"]");break;case r.ComprehensionBlock:f=N(f=e.left.type===r.VariableDeclaration?[e.left.kind,M(),K(e.left.declarations[0],{allowIn:!1})]:H(e.left,{precedence:i.Call,allowIn:!0,allowCall:!0}),e.of?"of":"in"),f=N(f,H(e.right,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),n=k.moz.parenthesizedComprehensionBlock?["for"+b+"(",f,")"]:N("for"+b,f);break;default:throw new Error("Unknown expression type: "+e.type)}return k.comment&&(n=G(e,n)),R(n,e)}function K(e,t){var n,o,s,a,l,h,p,f,m,g,x;switch(h=!0,g=";",p=!1,f=!1,t&&(h=void 0===t.allowIn||t.allowIn,v||!0!==t.semicolonOptional||(g=""),p=t.functionBody,f=t.directiveContext),e.type){case r.BlockStatement:s=["{",y],D(function(){for(n=0,o=e.body.length;n<o;++n)m=T(K(e.body[n],{semicolonOptional:n===o-1,directiveContext:p})),s.push(m),L(R(m).toString())||s.push(y)}),s.push(T("}"));break;case r.BreakStatement:s=e.label?"break "+e.label.name+g:"break"+g;break;case r.ContinueStatement:s=e.label?"continue "+e.label.name+g:"continue"+g;break;case r.DirectiveStatement:s=k.raw&&e.raw?e.raw+g:function(e){var t,n,r,i;for(i="double"===d?'"':"'",t=0,n=e.length;t<n;++t){if(39===(r=e.charCodeAt(t))){i='"';break}if(34===r){i="'";break}92===r&&++t}return i+e+i}(e.directive)+g;break;case r.DoWhileStatement:s=N("do",q(e.body)),s=N(s=z(e.body,s),["while"+b+"(",H(e.test,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"+g]);break;case r.CatchClause:D(function(){var t;s=["catch"+b+"(",H(e.param,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"],e.guard&&(t=H(e.guard,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),s.splice(2,0," if ",t))}),s.push(q(e.body));break;case r.DebuggerStatement:s="debugger"+g;break;case r.EmptyStatement:s=";";break;case r.ExportDeclaration:if(s="export ",e.declaration){s=[s,K(e.declaration,{semicolonOptional:""===g})];break}break;case r.ExpressionStatement:s=[H(e.expression,{precedence:i.Sequence,allowIn:!0,allowCall:!0})],"{"===(m=R(s).toString()).charAt(0)||"function"===m.slice(0,8)&&"* (".indexOf(m.charAt(8))>=0||S&&f&&e.expression.type===r.Literal&&"string"==typeof e.expression.value?s=["(",s,")"+g]:s.push(g);break;case r.ImportDeclaration:0===e.specifiers.length?s=["import",b,Y(e.source)]:("default"===e.kind?s=["import",M(),e.specifiers[0].id.name,M()]:(s=["import",b,"{"],1===e.specifiers.length?(l=e.specifiers[0],s.push(b+l.id.name),l.name&&s.push(M()+"as"+M()+l.name.name),s.push(b+"}"+b)):(D(function(t){var n,r;for(s.push(y),n=0,r=e.specifiers.length;n<r;++n)l=e.specifiers[n],s.push(t+l.id.name),l.name&&s.push(M()+"as"+M()+l.name.name),n+1<r&&s.push(","+y)}),L(R(s).toString())||s.push(y),s.push(u+"}"+b))),s.push("from"+b),s.push(Y(e.source))),s.push(g);break;case r.VariableDeclarator:s=e.init?[H(e.id,{precedence:i.Assignment,allowIn:h,allowCall:!0}),b,"=",b,H(e.init,{precedence:i.Assignment,allowIn:h,allowCall:!0})]:V(e.id,{precedence:i.Assignment,allowIn:h});break;case r.VariableDeclaration:s=[e.kind],1===e.declarations.length&&e.declarations[0].init&&e.declarations[0].init.type===r.FunctionExpression?(s.push(M()),s.push(K(e.declarations[0],{allowIn:h}))):D(function(){for(a=e.declarations[0],k.comment&&a.leadingComments?(s.push("\n"),s.push(T(K(a,{allowIn:h})))):(s.push(M()),s.push(K(a,{allowIn:h}))),n=1,o=e.declarations.length;n<o;++n)a=e.declarations[n],k.comment&&a.leadingComments?(s.push(","+y),s.push(T(K(a,{allowIn:h})))):(s.push(","+b),s.push(K(a,{allowIn:h})))}),s.push(g);break;case r.ThrowStatement:s=[N("throw",H(e.argument,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),g];break;case r.TryStatement:if(s=["try",q(e.block)],s=z(e.block,s),e.handlers)for(n=0,o=e.handlers.length;n<o;++n)s=N(s,K(e.handlers[n])),(e.finalizer||n+1!==o)&&(s=z(e.handlers[n].body,s));else{for(e.guardedHandlers=e.guardedHandlers||[],n=0,o=e.guardedHandlers.length;n<o;++n)s=N(s,K(e.guardedHandlers[n])),(e.finalizer||n+1!==o)&&(s=z(e.guardedHandlers[n].body,s));if(e.handler)if(c(e.handler))for(n=0,o=e.handler.length;n<o;++n)s=N(s,K(e.handler[n])),(e.finalizer||n+1!==o)&&(s=z(e.handler[n].body,s));else s=N(s,K(e.handler)),e.finalizer&&(s=z(e.handler.body,s))}e.finalizer&&(s=N(s,["finally",q(e.finalizer)]));break;case r.SwitchStatement:if(D(function(){s=["switch"+b+"(",H(e.discriminant,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"+b+"{"+y]}),e.cases)for(n=0,o=e.cases.length;n<o;++n)m=T(K(e.cases[n],{semicolonOptional:n===o-1})),s.push(m),L(R(m).toString())||s.push(y);s.push(T("}"));break;case r.SwitchCase:D(function(){for(s=e.test?[N("case",H(e.test,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),":"]:["default:"],n=0,(o=e.consequent.length)&&e.consequent[0].type===r.BlockStatement&&(m=q(e.consequent[0]),s.push(m),n=1),n===o||L(R(s).toString())||s.push(y);n<o;++n)m=T(K(e.consequent[n],{semicolonOptional:n===o-1&&""===g})),s.push(m),n+1===o||L(R(m).toString())||s.push(y)});break;case r.IfStatement:D(function(){s=["if"+b+"(",H(e.test,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"]}),e.alternate?(s.push(q(e.consequent)),s=z(e.consequent,s),s=e.alternate.type===r.IfStatement?N(s,["else ",K(e.alternate,{semicolonOptional:""===g})]):N(s,N("else",q(e.alternate,""===g)))):s.push(q(e.consequent,""===g));break;case r.ForStatement:D(function(){s=["for"+b+"("],e.init?e.init.type===r.VariableDeclaration?s.push(K(e.init,{allowIn:!1})):(s.push(H(e.init,{precedence:i.Sequence,allowIn:!1,allowCall:!0})),s.push(";")):s.push(";"),e.test?(s.push(b),s.push(H(e.test,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),s.push(";")):s.push(";"),e.update?(s.push(b),s.push(H(e.update,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),s.push(")")):s.push(")")}),s.push(q(e.body,""===g));break;case r.ForInStatement:s=Z("in",e,""===g);break;case r.ForOfStatement:s=Z("of",e,""===g);break;case r.LabeledStatement:s=[e.label.name+":",q(e.body,""===g)];break;case r.Program:for(o=e.body.length,s=[_&&o>0?"\n":""],n=0;n<o;++n)m=T(K(e.body[n],{semicolonOptional:!_&&n===o-1,directiveContext:!0})),s.push(m),n+1<o&&!L(R(m).toString())&&s.push(y);break;case r.FunctionDeclaration:x=e.generator&&!k.moz.starlessGenerator,s=[x?"function*":"function",x?b:M(),W(e.id),J(e)];break;case r.ReturnStatement:s=e.argument?[N("return",H(e.argument,{precedence:i.Sequence,allowIn:!0,allowCall:!0})),g]:["return"+g];break;case r.WhileStatement:D(function(){s=["while"+b+"(",H(e.test,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"]}),s.push(q(e.body,""===g));break;case r.WithStatement:D(function(){s=["with"+b+"(",H(e.object,{precedence:i.Sequence,allowIn:!0,allowCall:!0}),")"]}),s.push(q(e.body,""===g));break;default:throw new Error("Unknown statement type: "+e.type)}return k.comment&&(s=G(e,s)),m=R(s).toString(),e.type!==r.Program||_||""!==y||"\n"!==m.charAt(m.length-1)||(s=E?R(s).replaceRight(/\s+$/,""):m.replace(/\s+$/,"")),R(s,e)}a=n(22),l=n(23),r={AssignmentExpression:"AssignmentExpression",ArrayExpression:"ArrayExpression",ArrayPattern:"ArrayPattern",ArrowFunctionExpression:"ArrowFunctionExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ComprehensionBlock:"ComprehensionBlock",ComprehensionExpression:"ComprehensionExpression",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DirectiveStatement:"DirectiveStatement",DoWhileStatement:"DoWhileStatement",DebuggerStatement:"DebuggerStatement",EmptyStatement:"EmptyStatement",ExportDeclaration:"ExportDeclaration",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",ForOfStatement:"ForOfStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",GeneratorExpression:"GeneratorExpression",Identifier:"Identifier",IfStatement:"IfStatement",ImportDeclaration:"ImportDeclaration",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",ObjectPattern:"ObjectPattern",Program:"Program",Property:"Property",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SwitchStatement:"SwitchStatement",SwitchCase:"SwitchCase",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement",YieldExpression:"YieldExpression"},o={"||":(i={Sequence:0,Yield:1,Assignment:1,Conditional:2,ArrowFunction:2,LogicalOR:3,LogicalAND:4,BitwiseOR:5,BitwiseXOR:6,BitwiseAND:7,Equality:8,Relational:9,BitwiseSHIFT:10,Additive:11,Multiplicative:12,Unary:13,Postfix:14,Call:15,New:16,Member:17,Primary:18}).LogicalOR,"&&":i.LogicalAND,"|":i.BitwiseOR,"^":i.BitwiseXOR,"&":i.BitwiseAND,"==":i.Equality,"!=":i.Equality,"===":i.Equality,"!==":i.Equality,is:i.Equality,isnt:i.Equality,"<":i.Relational,">":i.Relational,"<=":i.Relational,">=":i.Relational,in:i.Relational,instanceof:i.Relational,"<<":i.BitwiseSHIFT,">>":i.BitwiseSHIFT,">>>":i.BitwiseSHIFT,"+":i.Additive,"-":i.Additive,"*":i.Multiplicative,"%":i.Multiplicative,"/":i.Multiplicative},(c=Array.isArray)||(c=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),C={indent:{style:"",base:0},renumber:!0,hexadecimal:!0,quotes:"auto",escapeless:!0,compact:!0,parentheses:!1,semicolons:!1},A={indent:{style:"    ",base:0,adjustMultilineComment:!1},newline:"\n",space:" ",json:!1,renumber:!1,hexadecimal:!1,quotes:"single",escapeless:!1,compact:!1,parentheses:!0,semicolons:!0,safeConcatenation:!1},t.version=n(29).version,t.generate=function(o,a){var l,c,C={indent:null,base:null,parse:null,comment:!1,format:{indent:{style:"    ",base:0,adjustMultilineComment:!1},newline:"\n",space:" ",json:!1,renumber:!1,hexadecimal:!1,quotes:"single",escapeless:!1,compact:!1,parentheses:!0,semicolons:!0,safeConcatenation:!1},moz:{comprehensionExpressionStartsWithAssignment:!1,starlessGenerator:!1,parenthesizedComprehensionBlock:!1},sourceMap:null,sourceMapRoot:null,sourceMapWithCode:!1,directive:!1,raw:!0,verbatim:null};switch(null!=a?("string"==typeof a.indent&&(C.format.indent.style=a.indent),"number"==typeof a.base&&(C.format.indent.base=a.base),a=O(C,a),h=a.format.indent.style,u="string"==typeof a.base?a.base:I(h,a.format.indent.base)):(h=(a=C).format.indent.style,u=I(h,a.format.indent.base)),p=a.format.json,f=a.format.renumber,m=!p&&a.format.hexadecimal,d=p?"double":a.format.quotes,g=a.format.escapeless,y=a.format.newline,b=a.format.space,a.format.compact&&(y=b=h=u=""),x=a.format.parentheses,v=a.format.semicolons,_=a.format.safeConcatenation,S=a.directive,w=p?null:a.parse,E=a.sourceMap,k=a,E&&(s=t.browser?e.sourceMap.SourceNode:n(25).SourceNode),o.type){case r.BlockStatement:case r.BreakStatement:case r.CatchClause:case r.ContinueStatement:case r.DirectiveStatement:case r.DoWhileStatement:case r.DebuggerStatement:case r.EmptyStatement:case r.ExpressionStatement:case r.ForStatement:case r.ForInStatement:case r.ForOfStatement:case r.FunctionDeclaration:case r.IfStatement:case r.LabeledStatement:case r.Program:case r.ReturnStatement:case r.SwitchStatement:case r.SwitchCase:case r.ThrowStatement:case r.TryStatement:case r.VariableDeclaration:case r.VariableDeclarator:case r.WhileStatement:case r.WithStatement:l=K(o);break;case r.AssignmentExpression:case r.ArrayExpression:case r.ArrayPattern:case r.BinaryExpression:case r.CallExpression:case r.ConditionalExpression:case r.FunctionExpression:case r.Identifier:case r.Literal:case r.LogicalExpression:case r.MemberExpression:case r.NewExpression:case r.ObjectExpression:case r.ObjectPattern:case r.Property:case r.SequenceExpression:case r.ThisExpression:case r.UnaryExpression:case r.UpdateExpression:case r.YieldExpression:l=H(o,{precedence:i.Sequence,allowIn:!0,allowCall:!0});break;default:throw new Error("Unknown node type: "+o.type)}return E?(c=l.toStringWithSourceMap({file:a.file,sourceRoot:a.sourceMapRoot}),a.sourceContent&&c.map.setSourceContent(a.sourceMap,a.sourceContent),a.sourceMapWithCode?c:c.map.toString()):(c={code:l.toString(),map:null},a.sourceMapWithCode?c:c.code)},t.attachComments=a.attachComments,t.Precedence=O({},i),t.browser=!1,t.FORMAT_MINIFY=C,t.FORMAT_DEFAULTS=A}()}).call(this,n(21))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){var r,i,o;!function(n,s){"use strict";i=[t],void 0===(o="function"==typeof(r=function(e){var t,n,r,i,o,s;t={AssignmentExpression:"AssignmentExpression",ArrayExpression:"ArrayExpression",ArrayPattern:"ArrayPattern",ArrowFunctionExpression:"ArrowFunctionExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ClassBody:"ClassBody",ClassDeclaration:"ClassDeclaration",ClassExpression:"ClassExpression",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DebuggerStatement:"DebuggerStatement",DirectiveStatement:"DirectiveStatement",DoWhileStatement:"DoWhileStatement",EmptyStatement:"EmptyStatement",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",Identifier:"Identifier",IfStatement:"IfStatement",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",MethodDefinition:"MethodDefinition",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",ObjectPattern:"ObjectPattern",Program:"Program",Property:"Property",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SwitchStatement:"SwitchStatement",SwitchCase:"SwitchCase",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement",YieldExpression:"YieldExpression"},(n=Array.isArray)||(n=function(e){return"[object Array]"===Object.prototype.toString.call(e)});function a(e){var t,n,r={};for(t in e)e.hasOwnProperty(t)&&(n=e[t],r[t]="object"==typeof n&&null!==n?a(n):n);return r}function l(e,t){this.parent=e,this.key=t}function c(e,t,n,r){this.node=e,this.path=t,this.wrap=n,this.ref=r}function u(){}function h(e,t){var n=new u;return n.traverse(e,t)}function p(e,t){var n;return n=function(e,t){var n,r,i,o;r=e.length,i=0;for(;r;)t(e[o=i+(n=r>>>1)])?r=n:(i=o+1,r-=n+1);return i}(t,function(t){return t.range[0]>e.range[0]}),e.extendedRange=[e.range[0],e.range[1]],n!==t.length&&(e.extendedRange[1]=t[n].range[0]),(n-=1)>=0&&(e.extendedRange[0]=t[n].range[1]),e}i={AssignmentExpression:["left","right"],ArrayExpression:["elements"],ArrayPattern:["elements"],ArrowFunctionExpression:["params","defaults","rest","body"],BlockStatement:["body"],BinaryExpression:["left","right"],BreakStatement:["label"],CallExpression:["callee","arguments"],CatchClause:["param","body"],ClassBody:["body"],ClassDeclaration:["id","body","superClass"],ClassExpression:["id","body","superClass"],ConditionalExpression:["test","consequent","alternate"],ContinueStatement:["label"],DebuggerStatement:[],DirectiveStatement:[],DoWhileStatement:["body","test"],EmptyStatement:[],ExpressionStatement:["expression"],ForStatement:["init","test","update","body"],ForInStatement:["left","right","body"],ForOfStatement:["left","right","body"],FunctionDeclaration:["id","params","defaults","rest","body"],FunctionExpression:["id","params","defaults","rest","body"],Identifier:[],IfStatement:["test","consequent","alternate"],Literal:[],LabeledStatement:["label","body"],LogicalExpression:["left","right"],MemberExpression:["object","property"],MethodDefinition:["key","value"],NewExpression:["callee","arguments"],ObjectExpression:["properties"],ObjectPattern:["properties"],Program:["body"],Property:["key","value"],ReturnStatement:["argument"],SequenceExpression:["expressions"],SwitchStatement:["discriminant","cases"],SwitchCase:["test","consequent"],ThisExpression:[],ThrowStatement:["argument"],TryStatement:["block","handlers","handler","guardedHandlers","finalizer"],UnaryExpression:["argument"],UpdateExpression:["argument"],VariableDeclaration:["declarations"],VariableDeclarator:["id","init"],WhileStatement:["test","body"],WithStatement:["object","body"],YieldExpression:["argument"]},r={Break:o={},Skip:s={}},l.prototype.replace=function(e){this.parent[this.key]=e},u.prototype.path=function(){var e,t,r,i,o,s;function a(e,t){if(n(t))for(r=0,i=t.length;r<i;++r)e.push(t[r]);else e.push(t)}if(!this.__current.path)return null;for(o=[],e=2,t=this.__leavelist.length;e<t;++e)s=this.__leavelist[e],a(o,s.path);return a(o,this.__current.path),o},u.prototype.parents=function(){var e,t,n;for(n=[],e=1,t=this.__leavelist.length;e<t;++e)n.push(this.__leavelist[e].node);return n},u.prototype.current=function(){return this.__current.node},u.prototype.__execute=function(e,t){var n,r;return r=void 0,n=this.__current,this.__current=t,this.__state=null,e&&(r=e.call(this,t.node,this.__leavelist[this.__leavelist.length-1].node)),this.__current=n,r},u.prototype.notify=function(e){this.__state=e},u.prototype.skip=function(){this.notify(s)},u.prototype.break=function(){this.notify(o)},u.prototype.__initialize=function(e,t){this.visitor=t,this.root=e,this.__worklist=[],this.__leavelist=[],this.__current=null,this.__state=null},u.prototype.traverse=function(e,r){var a,l,u,h,p,f,m,d,g,y,b,x;for(this.__initialize(e,r),x={},a=this.__worklist,l=this.__leavelist,a.push(new c(e,null,null,null)),l.push(new c(null,null,null,null));a.length;)if((u=a.pop())!==x){if(u.node){if(f=this.__execute(r.enter,u),this.__state===o||f===o)return;if(a.push(x),l.push(u),this.__state===s||f===s)continue;for(h=u.node,p=u.wrap||h.type,d=(y=i[p]).length;(d-=1)>=0;)if(m=y[d],b=h[m])if(n(b))for(g=b.length;(g-=1)>=0;)b[g]&&(u=p!==t.ObjectExpression&&p!==t.ObjectPattern||"properties"!==y[d]?new c(b[g],[m,g],null,null):new c(b[g],[m,g],"Property",null),a.push(u));else a.push(new c(b,m,null,null))}}else if(u=l.pop(),f=this.__execute(r.leave,u),this.__state===o||f===o)return},u.prototype.replace=function(e,r){var a,u,h,p,f,m,d,g,y,b,x,v,_;for(this.__initialize(e,r),x={},a=this.__worklist,u=this.__leavelist,m=new c(e,null,null,new l(v={root:e},"root")),a.push(m),u.push(m);a.length;)if((m=a.pop())!==x){if(void 0!==(f=this.__execute(r.enter,m))&&f!==o&&f!==s&&(m.ref.replace(f),m.node=f),this.__state===o||f===o)return v.root;if((h=m.node)&&(a.push(x),u.push(m),this.__state!==s&&f!==s))for(p=m.wrap||h.type,d=(y=i[p]).length;(d-=1)>=0;)if(_=y[d],b=h[_])if(n(b))for(g=b.length;(g-=1)>=0;)b[g]&&(m=p===t.ObjectExpression&&"properties"===y[d]?new c(b[g],[_,g],"Property",new l(b,g)):new c(b[g],[_,g],null,new l(b,g)),a.push(m));else a.push(new c(b,_,null,new l(h,_)))}else if(m=u.pop(),void 0!==(f=this.__execute(r.leave,m))&&f!==o&&f!==s&&m.ref.replace(f),this.__state===o||f===o)return v.root;return v.root},e.version="1.5.1-dev",e.Syntax=t,e.traverse=h,e.replace=function(e,t){return(new u).replace(e,t)},e.attachComments=function(e,t,n){var i,o,s,l,c=[];if(!e.range)throw new Error("attachComments needs range information");if(!n.length){if(t.length){for(s=0,o=t.length;s<o;s+=1)(i=a(t[s])).extendedRange=[0,e.range[0]],c.push(i);e.leadingComments=c}return e}for(s=0,o=t.length;s<o;s+=1)c.push(p(a(t[s]),n));return l=0,h(e,{enter:function(e){for(var t;l<c.length&&!((t=c[l]).extendedRange[1]>e.range[0]);)t.extendedRange[1]===e.range[0]?(e.leadingComments||(e.leadingComments=[]),e.leadingComments.push(t),c.splice(l,1)):l+=1;return l===c.length?r.Break:c[l].extendedRange[0]>e.range[1]?r.Skip:void 0}}),l=0,h(e,{leave:function(e){for(var t;l<c.length&&(t=c[l],!(e.range[1]<t.extendedRange[0]));)e.range[1]===t.extendedRange[0]?(e.trailingComments||(e.trailingComments=[]),e.trailingComments.push(t),c.splice(l,1)):l+=1;return l===c.length?r.Break:c[l].extendedRange[0]>e.range[1]?r.Skip:void 0}}),e},e.VisitorKeys=i,e.VisitorOption=r,e.Controller=u})?r.apply(t,i):r)||(e.exports=o)}()},function(e,t,n){!function(){"use strict";t.code=n(9),t.keyword=n(24)}()},function(e,t,n){!function(){"use strict";var t=n(9);function r(e,t){if(t&&function(e){switch(e){case"implements":case"interface":case"package":case"private":case"protected":case"public":case"static":case"let":return!0;default:return!1}}(e))return!0;switch(e.length){case 2:return"if"===e||"in"===e||"do"===e;case 3:return"var"===e||"for"===e||"new"===e||"try"===e;case 4:return"this"===e||"else"===e||"case"===e||"void"===e||"with"===e||"enum"===e;case 5:return"while"===e||"break"===e||"catch"===e||"throw"===e||"const"===e||"yield"===e||"class"===e||"super"===e;case 6:return"return"===e||"typeof"===e||"delete"===e||"switch"===e||"export"===e||"import"===e;case 7:return"default"===e||"finally"===e||"extends"===e;case 8:return"function"===e||"continue"===e||"debugger"===e;case 10:return"instanceof"===e;default:return!1}}e.exports={isKeywordES5:function(e,t){return!(!t&&"yield"===e)&&r(e,t)},isKeywordES6:r,isRestrictedWord:function(e){return"eval"===e||"arguments"===e},isIdentifierName:function(e){var n,r,i;if(0===e.length)return!1;if(i=e.charCodeAt(0),!t.isIdentifierStart(i)||92===i)return!1;for(n=1,r=e.length;n<r;++n)if(i=e.charCodeAt(n),!t.isIdentifierPart(i)||92===i)return!1;return!0}}}()},function(e,t,n){t.SourceMapGenerator=n(26).SourceMapGenerator,t.SourceMapConsumer=n(27).SourceMapConsumer,t.SourceNode=n(28).SourceNode},function(e,t,n){(function(e){if("function"!=typeof t)var t=n(4)(e,n(5));t(function(e,t,n){var r=e("./base64-vlq"),i=e("./util"),o=e("./array-set").ArraySet,s=e("./mapping-list").MappingList;function a(e){e||(e={}),this._file=i.getArg(e,"file",null),this._sourceRoot=i.getArg(e,"sourceRoot",null),this._skipValidation=i.getArg(e,"skipValidation",!1),this._sources=new o,this._names=new o,this._mappings=new s,this._sourcesContents=null}a.prototype._version=3,a.fromSourceMap=function(e){var t=e.sourceRoot,n=new a({file:e.file,sourceRoot:t});return e.eachMapping(function(e){var r={generated:{line:e.generatedLine,column:e.generatedColumn}};null!=e.source&&(r.source=e.source,null!=t&&(r.source=i.relative(t,r.source)),r.original={line:e.originalLine,column:e.originalColumn},null!=e.name&&(r.name=e.name)),n.addMapping(r)}),e.sources.forEach(function(t){var r=e.sourceContentFor(t);null!=r&&n.setSourceContent(t,r)}),n},a.prototype.addMapping=function(e){var t=i.getArg(e,"generated"),n=i.getArg(e,"original",null),r=i.getArg(e,"source",null),o=i.getArg(e,"name",null);this._skipValidation||this._validateMapping(t,n,r,o),null==r||this._sources.has(r)||this._sources.add(r),null==o||this._names.has(o)||this._names.add(o),this._mappings.add({generatedLine:t.line,generatedColumn:t.column,originalLine:null!=n&&n.line,originalColumn:null!=n&&n.column,source:r,name:o})},a.prototype.setSourceContent=function(e,t){var n=e;null!=this._sourceRoot&&(n=i.relative(this._sourceRoot,n)),null!=t?(this._sourcesContents||(this._sourcesContents={}),this._sourcesContents[i.toSetString(n)]=t):this._sourcesContents&&(delete this._sourcesContents[i.toSetString(n)],0===Object.keys(this._sourcesContents).length&&(this._sourcesContents=null))},a.prototype.applySourceMap=function(e,t,n){var r=t;if(null==t){if(null==e.file)throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map\'s "file" property. Both were omitted.');r=e.file}var s=this._sourceRoot;null!=s&&(r=i.relative(s,r));var a=new o,l=new o;this._mappings.unsortedForEach(function(t){if(t.source===r&&null!=t.originalLine){var o=e.originalPositionFor({line:t.originalLine,column:t.originalColumn});null!=o.source&&(t.source=o.source,null!=n&&(t.source=i.join(n,t.source)),null!=s&&(t.source=i.relative(s,t.source)),t.originalLine=o.line,t.originalColumn=o.column,null!=o.name&&(t.name=o.name))}var c=t.source;null==c||a.has(c)||a.add(c);var u=t.name;null==u||l.has(u)||l.add(u)},this),this._sources=a,this._names=l,e.sources.forEach(function(t){var r=e.sourceContentFor(t);null!=r&&(null!=n&&(t=i.join(n,t)),null!=s&&(t=i.relative(s,t)),this.setSourceContent(t,r))},this)},a.prototype._validateMapping=function(e,t,n,r){if((!(e&&"line"in e&&"column"in e&&e.line>0&&e.column>=0)||t||n||r)&&!(e&&"line"in e&&"column"in e&&t&&"line"in t&&"column"in t&&e.line>0&&e.column>=0&&t.line>0&&t.column>=0&&n))throw new Error("Invalid mapping: "+JSON.stringify({generated:e,source:n,original:t,name:r}))},a.prototype._serializeMappings=function(){for(var e,t=0,n=1,o=0,s=0,a=0,l=0,c="",u=this._mappings.toArray(),h=0,p=u.length;h<p;h++){if((e=u[h]).generatedLine!==n)for(t=0;e.generatedLine!==n;)c+=";",n++;else if(h>0){if(!i.compareByGeneratedPositions(e,u[h-1]))continue;c+=","}c+=r.encode(e.generatedColumn-t),t=e.generatedColumn,null!=e.source&&(c+=r.encode(this._sources.indexOf(e.source)-l),l=this._sources.indexOf(e.source),c+=r.encode(e.originalLine-1-s),s=e.originalLine-1,c+=r.encode(e.originalColumn-o),o=e.originalColumn,null!=e.name&&(c+=r.encode(this._names.indexOf(e.name)-a),a=this._names.indexOf(e.name)))}return c},a.prototype._generateSourcesContent=function(e,t){return e.map(function(e){if(!this._sourcesContents)return null;null!=t&&(e=i.relative(t,e));var n=i.toSetString(e);return Object.prototype.hasOwnProperty.call(this._sourcesContents,n)?this._sourcesContents[n]:null},this)},a.prototype.toJSON=function(){var e={version:this._version,sources:this._sources.toArray(),names:this._names.toArray(),mappings:this._serializeMappings()};return null!=this._file&&(e.file=this._file),null!=this._sourceRoot&&(e.sourceRoot=this._sourceRoot),this._sourcesContents&&(e.sourcesContent=this._generateSourcesContent(e.sources,e.sourceRoot)),e},a.prototype.toString=function(){return JSON.stringify(this)},t.SourceMapGenerator=a})}).call(this,n(0)(e))},function(e,t,n){(function(e){if("function"!=typeof t)var t=n(4)(e,n(5));t(function(e,t,n){var r=e("./util"),i=e("./binary-search"),o=e("./array-set").ArraySet,s=e("./base64-vlq");function a(e){var t=e;"string"==typeof e&&(t=JSON.parse(e.replace(/^\)\]\}'/,"")));var n=r.getArg(t,"version"),i=r.getArg(t,"sources"),s=r.getArg(t,"names",[]),a=r.getArg(t,"sourceRoot",null),l=r.getArg(t,"sourcesContent",null),c=r.getArg(t,"mappings"),u=r.getArg(t,"file",null);if(n!=this._version)throw new Error("Unsupported version: "+n);i=i.map(r.normalize),this._names=o.fromArray(s,!0),this._sources=o.fromArray(i,!0),this.sourceRoot=a,this.sourcesContent=l,this._mappings=c,this.file=u}a.fromSourceMap=function(e){var t=Object.create(a.prototype);return t._names=o.fromArray(e._names.toArray(),!0),t._sources=o.fromArray(e._sources.toArray(),!0),t.sourceRoot=e._sourceRoot,t.sourcesContent=e._generateSourcesContent(t._sources.toArray(),t.sourceRoot),t.file=e._file,t.__generatedMappings=e._mappings.toArray().slice(),t.__originalMappings=e._mappings.toArray().slice().sort(r.compareByOriginalPositions),t},a.prototype._version=3,Object.defineProperty(a.prototype,"sources",{get:function(){return this._sources.toArray().map(function(e){return null!=this.sourceRoot?r.join(this.sourceRoot,e):e},this)}}),a.prototype.__generatedMappings=null,Object.defineProperty(a.prototype,"_generatedMappings",{get:function(){return this.__generatedMappings||(this.__generatedMappings=[],this.__originalMappings=[],this._parseMappings(this._mappings,this.sourceRoot)),this.__generatedMappings}}),a.prototype.__originalMappings=null,Object.defineProperty(a.prototype,"_originalMappings",{get:function(){return this.__originalMappings||(this.__generatedMappings=[],this.__originalMappings=[],this._parseMappings(this._mappings,this.sourceRoot)),this.__originalMappings}}),a.prototype._nextCharIsMappingSeparator=function(e){var t=e.charAt(0);return";"===t||","===t},a.prototype._parseMappings=function(e,t){for(var n,i=1,o=0,a=0,l=0,c=0,u=0,h=e,p={};h.length>0;)if(";"===h.charAt(0))i++,h=h.slice(1),o=0;else if(","===h.charAt(0))h=h.slice(1);else{if((n={}).generatedLine=i,s.decode(h,p),n.generatedColumn=o+p.value,o=n.generatedColumn,(h=p.rest).length>0&&!this._nextCharIsMappingSeparator(h)){if(s.decode(h,p),n.source=this._sources.at(c+p.value),c+=p.value,0===(h=p.rest).length||this._nextCharIsMappingSeparator(h))throw new Error("Found a source, but no line and column");if(s.decode(h,p),n.originalLine=a+p.value,a=n.originalLine,n.originalLine+=1,0===(h=p.rest).length||this._nextCharIsMappingSeparator(h))throw new Error("Found a source and line, but no column");s.decode(h,p),n.originalColumn=l+p.value,l=n.originalColumn,(h=p.rest).length>0&&!this._nextCharIsMappingSeparator(h)&&(s.decode(h,p),n.name=this._names.at(u+p.value),u+=p.value,h=p.rest)}this.__generatedMappings.push(n),"number"==typeof n.originalLine&&this.__originalMappings.push(n)}this.__generatedMappings.sort(r.compareByGeneratedPositions),this.__originalMappings.sort(r.compareByOriginalPositions)},a.prototype._findMapping=function(e,t,n,r,o){if(e[n]<=0)throw new TypeError("Line must be greater than or equal to 1, got "+e[n]);if(e[r]<0)throw new TypeError("Column must be greater than or equal to 0, got "+e[r]);return i.search(e,t,o)},a.prototype.computeColumnSpans=function(){for(var e=0;e<this._generatedMappings.length;++e){var t=this._generatedMappings[e];if(e+1<this._generatedMappings.length){var n=this._generatedMappings[e+1];if(t.generatedLine===n.generatedLine){t.lastGeneratedColumn=n.generatedColumn-1;continue}}t.lastGeneratedColumn=1/0}},a.prototype.originalPositionFor=function(e){var t={generatedLine:r.getArg(e,"line"),generatedColumn:r.getArg(e,"column")},n=this._findMapping(t,this._generatedMappings,"generatedLine","generatedColumn",r.compareByGeneratedPositions);if(n>=0){var i=this._generatedMappings[n];if(i.generatedLine===t.generatedLine){var o=r.getArg(i,"source",null);return null!=o&&null!=this.sourceRoot&&(o=r.join(this.sourceRoot,o)),{source:o,line:r.getArg(i,"originalLine",null),column:r.getArg(i,"originalColumn",null),name:r.getArg(i,"name",null)}}}return{source:null,line:null,column:null,name:null}},a.prototype.sourceContentFor=function(e){if(!this.sourcesContent)return null;if(null!=this.sourceRoot&&(e=r.relative(this.sourceRoot,e)),this._sources.has(e))return this.sourcesContent[this._sources.indexOf(e)];var t;if(null!=this.sourceRoot&&(t=r.urlParse(this.sourceRoot))){var n=e.replace(/^file:\/\//,"");if("file"==t.scheme&&this._sources.has(n))return this.sourcesContent[this._sources.indexOf(n)];if((!t.path||"/"==t.path)&&this._sources.has("/"+e))return this.sourcesContent[this._sources.indexOf("/"+e)]}throw new Error('"'+e+'" is not in the SourceMap.')},a.prototype.generatedPositionFor=function(e){var t={source:r.getArg(e,"source"),originalLine:r.getArg(e,"line"),originalColumn:r.getArg(e,"column")};null!=this.sourceRoot&&(t.source=r.relative(this.sourceRoot,t.source));var n=this._findMapping(t,this._originalMappings,"originalLine","originalColumn",r.compareByOriginalPositions);if(n>=0){var i=this._originalMappings[n];return{line:r.getArg(i,"generatedLine",null),column:r.getArg(i,"generatedColumn",null),lastColumn:r.getArg(i,"lastGeneratedColumn",null)}}return{line:null,column:null,lastColumn:null}},a.prototype.allGeneratedPositionsFor=function(e){var t={source:r.getArg(e,"source"),originalLine:r.getArg(e,"line"),originalColumn:1/0};null!=this.sourceRoot&&(t.source=r.relative(this.sourceRoot,t.source));var n=[],i=this._findMapping(t,this._originalMappings,"originalLine","originalColumn",r.compareByOriginalPositions);if(i>=0)for(var o=this._originalMappings[i];o&&o.originalLine===t.originalLine;)n.push({line:r.getArg(o,"generatedLine",null),column:r.getArg(o,"generatedColumn",null),lastColumn:r.getArg(o,"lastGeneratedColumn",null)}),o=this._originalMappings[--i];return n.reverse()},a.GENERATED_ORDER=1,a.ORIGINAL_ORDER=2,a.prototype.eachMapping=function(e,t,n){var i,o=t||null;switch(n||a.GENERATED_ORDER){case a.GENERATED_ORDER:i=this._generatedMappings;break;case a.ORIGINAL_ORDER:i=this._originalMappings;break;default:throw new Error("Unknown order of iteration.")}var s=this.sourceRoot;i.map(function(e){var t=e.source;return null!=t&&null!=s&&(t=r.join(s,t)),{source:t,generatedLine:e.generatedLine,generatedColumn:e.generatedColumn,originalLine:e.originalLine,originalColumn:e.originalColumn,name:e.name}}).forEach(e,o)},t.SourceMapConsumer=a})}).call(this,n(0)(e))},function(e,t,n){(function(e){if("function"!=typeof t)var t=n(4)(e,n(5));t(function(e,t,n){var r=e("./source-map-generator").SourceMapGenerator,i=e("./util"),o=/(\r?\n)/,s="$$$isSourceNode$$$";function a(e,t,n,r,i){this.children=[],this.sourceContents={},this.line=null==e?null:e,this.column=null==t?null:t,this.source=null==n?null:n,this.name=null==i?null:i,this[s]=!0,null!=r&&this.add(r)}a.fromStringWithSourceMap=function(e,t,n){var r=new a,s=e.split(o),l=function(){return s.shift()+(s.shift()||"")},c=1,u=0,h=null;return t.eachMapping(function(e){if(null!==h){if(!(c<e.generatedLine)){t=(n=s[0]).substr(0,e.generatedColumn-u);return s[0]=n.substr(e.generatedColumn-u),u=e.generatedColumn,p(h,t),void(h=e)}var t="";p(h,l()),c++,u=0}for(;c<e.generatedLine;)r.add(l()),c++;if(u<e.generatedColumn){var n=s[0];r.add(n.substr(0,e.generatedColumn)),s[0]=n.substr(e.generatedColumn),u=e.generatedColumn}h=e},this),s.length>0&&(h&&p(h,l()),r.add(s.join(""))),t.sources.forEach(function(e){var o=t.sourceContentFor(e);null!=o&&(null!=n&&(e=i.join(n,e)),r.setSourceContent(e,o))}),r;function p(e,t){if(null===e||void 0===e.source)r.add(t);else{var o=n?i.join(n,e.source):e.source;r.add(new a(e.originalLine,e.originalColumn,o,t,e.name))}}},a.prototype.add=function(e){if(Array.isArray(e))e.forEach(function(e){this.add(e)},this);else{if(!e[s]&&"string"!=typeof e)throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+e);e&&this.children.push(e)}return this},a.prototype.prepend=function(e){if(Array.isArray(e))for(var t=e.length-1;t>=0;t--)this.prepend(e[t]);else{if(!e[s]&&"string"!=typeof e)throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+e);this.children.unshift(e)}return this},a.prototype.walk=function(e){for(var t,n=0,r=this.children.length;n<r;n++)(t=this.children[n])[s]?t.walk(e):""!==t&&e(t,{source:this.source,line:this.line,column:this.column,name:this.name})},a.prototype.join=function(e){var t,n,r=this.children.length;if(r>0){for(t=[],n=0;n<r-1;n++)t.push(this.children[n]),t.push(e);t.push(this.children[n]),this.children=t}return this},a.prototype.replaceRight=function(e,t){var n=this.children[this.children.length-1];return n[s]?n.replaceRight(e,t):"string"==typeof n?this.children[this.children.length-1]=n.replace(e,t):this.children.push("".replace(e,t)),this},a.prototype.setSourceContent=function(e,t){this.sourceContents[i.toSetString(e)]=t},a.prototype.walkSourceContents=function(e){for(var t=0,n=this.children.length;t<n;t++)this.children[t][s]&&this.children[t].walkSourceContents(e);var r=Object.keys(this.sourceContents);for(t=0,n=r.length;t<n;t++)e(i.fromSetString(r[t]),this.sourceContents[r[t]])},a.prototype.toString=function(){var e="";return this.walk(function(t){e+=t}),e},a.prototype.toStringWithSourceMap=function(e){var t={code:"",line:1,column:0},n=new r(e),i=!1,o=null,s=null,a=null,l=null;return this.walk(function(e,r){t.code+=e,null!==r.source&&null!==r.line&&null!==r.column?(o===r.source&&s===r.line&&a===r.column&&l===r.name||n.addMapping({source:r.source,original:{line:r.line,column:r.column},generated:{line:t.line,column:t.column},name:r.name}),o=r.source,s=r.line,a=r.column,l=r.name,i=!0):i&&(n.addMapping({generated:{line:t.line,column:t.column}}),o=null,i=!1);for(var c=0,u=e.length;c<u;c++)10===e.charCodeAt(c)?(t.line++,t.column=0,c+1===u?(o=null,i=!1):i&&n.addMapping({source:r.source,original:{line:r.line,column:r.column},generated:{line:t.line,column:t.column},name:r.name})):t.column++}),this.walkSourceContents(function(e,t){n.setSourceContent(e,t)}),{code:t.code,map:n}},t.SourceNode=a})}).call(this,n(0)(e))},function(e){e.exports={_from:"escodegen@1.3.x",_id:"escodegen@1.3.3",_inBundle:!1,_integrity:"sha1-8CQBb1qI4Eb9EgBQVek5gC5sXyM=",_location:"/escodegen",_phantomChildren:{amdefine:"1.0.1"},_requested:{type:"range",registry:!0,raw:"escodegen@1.3.x",name:"escodegen",escapedName:"escodegen",rawSpec:"1.3.x",saveSpec:null,fetchSpec:"1.3.x"},_requiredBy:["/jison"],_resolved:"https://registry.npmjs.org/escodegen/-/escodegen-1.3.3.tgz",_shasum:"f024016f5a88e046fd12005055e939802e6c5f23",_spec:"escodegen@1.3.x",_where:"/Users/shaiby/projects/jb-react/node_modules/jison",bin:{esgenerate:"./bin/esgenerate.js",escodegen:"./bin/escodegen.js"},bugs:{url:"https://github.com/Constellation/escodegen/issues"},bundleDependencies:!1,dependencies:{esprima:"~1.1.1",estraverse:"~1.5.0",esutils:"~1.0.0","source-map":"~0.1.33"},deprecated:!1,description:"ECMAScript code generator",devDependencies:{bluebird:"~1.2.0","bower-registry-client":"~0.2.0",chai:"~1.7.2","commonjs-everywhere":"~0.9.6","esprima-moz":"*",gulp:"~3.5.0","gulp-eslint":"~0.1.2","gulp-jshint":"~1.4.0","gulp-mocha":"~0.4.1","jshint-stylish":"~0.1.5",semver:"*"},engines:{node:">=0.10.0"},homepage:"http://github.com/Constellation/escodegen",licenses:[{type:"BSD",url:"http://github.com/Constellation/escodegen/raw/master/LICENSE.BSD"}],main:"escodegen.js",maintainers:[{name:"Yusuke Suzuki",email:"utatane.tea@gmail.com",url:"http://github.com/Constellation"}],name:"escodegen",optionalDependencies:{"source-map":"~0.1.33"},repository:{type:"git",url:"git+ssh://git@github.com/Constellation/escodegen.git"},scripts:{build:"cjsify -a path: tools/entry-point.js > escodegen.browser.js","build-min":"cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",lint:"gulp lint",release:"node tools/release.js",test:"gulp travis","unit-test":"gulp test"},version:"1.3.3"}},function(e){e.exports={_from:"jison@^0.4.17",_id:"jison@0.4.18",_inBundle:!1,_integrity:"sha512-FKkCiJvozgC7VTHhMJ00a0/IApSxhlGsFIshLW6trWJ8ONX2TQJBBz6DlcO1Gffy4w9LT+uL+PA+CVnUSJMF7w==",_location:"/jison",_phantomChildren:{},_requested:{type:"range",registry:!0,raw:"jison@^0.4.17",name:"jison",escapedName:"jison",rawSpec:"^0.4.17",saveSpec:null,fetchSpec:"^0.4.17"},_requiredBy:["#DEV:/"],_resolved:"https://registry.npmjs.org/jison/-/jison-0.4.18.tgz",_shasum:"c68a6a54bfe7028fa40bcfc6cc8bbd9ed291f502",_spec:"jison@^0.4.17",_where:"/Users/shaiby/projects/jb-react",author:{name:"Zach Carter",email:"zach@carter.name",url:"http://zaa.ch"},bin:{jison:"lib/cli.js"},bugs:{url:"http://github.com/zaach/jison/issues",email:"jison@librelist.com"},bundleDependencies:!1,dependencies:{JSONSelect:"0.4.0",cjson:"0.3.0","ebnf-parser":"0.1.10",escodegen:"1.3.x",esprima:"1.1.x","jison-lex":"0.3.x","lex-parser":"~0.1.3",nomnom:"1.5.2"},deprecated:!1,description:"A parser generator with Bison's API",devDependencies:{browserify:"2.x.x",jison:"0.4.x",test:"0.6.x","uglify-js":"~2.4.0"},engines:{node:">=0.4"},homepage:"http://jison.org",keywords:["jison","bison","yacc","parser","generator","lexer","flex","tokenizer","compiler"],license:"MIT",main:"lib/jison",name:"jison",preferGlobal:!0,repository:{type:"git",url:"git://github.com/zaach/jison.git"},scripts:{test:"node tests/all-tests.js"},version:"0.4.18"}}]);;


jb.component('jison.parse', {
  type: 'data',
  params: [
    { id: 'parser', type: 'jison.parser', essential: true, defaultValue: {$: 'jison.parser', lex: [], bnf: [] } },
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
    { id: 'tokens', as: 'string', essential: true, description: 'e.g. -,+,*,%,for,=='},
  ],
  impl: (ctx,tokens) => tokens.split(',')
    .map(x=>
      [ ('()[]{}+-*/%'.indexOf(x) == -1 ? x : `\\${x}`) ,`return '${x}';`])
})

jb.component('lexer.ignore-white-space', {
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

jb.component('lexer-rule', {
  type: 'lexer-rule',
  params: [
    { id: 'regex', as: 'string', essential: true, description: '[a-f0-9]+'},
    { id: 'result', as: 'string', essential: true, description: "return 'Hex';"},
  ],
  impl: (ctx,regex,result) => [regex,result]
})

jb.component('bnf-expression', {
  type: 'bnf-expression', //singleInType: true,
  params: [
    { id: 'id', as: 'string', essential: true},
    { id: 'options', type: 'expression-option[]', essential: true, as: 'array', defaultValue: [] },
  ],
  impl: ctx => ({ id: ctx.params.id, options: ctx.params.options.filter(x=>x) })
})

jb.component('expression-option', {
  type: 'expression-option', //singleInType: true,
  params: [
    { id: 'syntax', as: 'string', essential: true, description: 'e + e'},
    { id: 'calculate', as: 'string', essential: true, description: '$$ = $1 + $2;' },
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

jb.component('extract-text', {
  description: 'text breaking according to begin/end markers',
  params: [
    {id: 'text', as: 'string-with-source-ref', defaultValue: '%%'},
    {id: 'startMarkers', as: 'array', essential: true},
    {id: 'endMarker', as: 'string'},
    {id: 'includingStartMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result' },
    {id: 'includingEndMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'repeating', as: 'boolean', type: 'boolean', description: 'apply the markers repeatingly' },
    {id: 'noTrim', as: 'boolean', type: 'boolean'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in markers' },
    {id: 'exclude', as: 'boolean', type: 'boolean', description: 'return the inverse result. E.g. exclude remarks' },
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
        const end = endMarker ? findMarker(endMarker,start.end) : findStartMarkers(start.end)
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

jb.component('break-text', {
  description: 'recursive text breaking according to multi level separators',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'separators', as: 'array', essential: true, defaultValue: [], description: 'multi level separators'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in separators' },
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


jb.component('zip-arrays', {
  description: '[[1,2],[10,20],[100,200]] => [[1,10,100],[2,20,200]]',
  params: [
    { id: 'value', description: 'array of arrays', as: 'array', essential: true },
  ],
  impl: (ctx,value) =>
    value[0].map((x,i)=>
      value.map(line=>line[i]))
})

jb.component('remove-sections', {
  description: 'remove sections between markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarker', as: 'string', essential: true },
    {id: 'endMarker', as: 'string', essential: true},
    {id: 'keepEndMarker', as: 'boolean', type: 'boolean'},
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
    { id: 'objects', as: 'array', essential: true },
	],
	impl: (ctx,objects) =>
		Object.assign.apply({},objects)
})

jb.component('dynamic-object', {
	type: 'data',
  description: 'process items into object properties',
	params: [
    { id: 'items', essential: true, as: 'array' },
		{ id: 'propertyName', essential: true, as: 'string', dynamic: true },
		{ id: 'value', essential: true, dynamic: true },
	],
	impl: (ctx,items,name,value) =>
    items.reduce((obj,item)=>Object.assign(obj,jb.obj(name(ctx.setData(item)),value(ctx.setData(item)))),{})
})

jb.component('filter-empty-properties', {
	type: 'data',
  description: 'remove null or empty string properties',
	params: [
    { id: 'obj', defaultValue: '%%' },
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
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,text) => text.trim()
})

jb.component('remove-prefix-regex', {
  params: [
    {id: 'prefix', as: 'string', essential: true },
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,prefix,text) =>
    text.replace(new RegExp('^'+prefix) ,'')
})

jb.component('remove-suffix-regex', {
  params: [
    {id: 'suffix', as: 'string', essential: true },
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,suffix,text) =>
    text.replace(new RegExp(suffix+'$') ,'')
})

jb.component('wrap-as-object-with-array', {
  type: 'aggregator',
  description: 'put all items in an array, wrapped by an object',
  params: [
      {id: 'arrayProperty', as: 'string', defaultValue: 'items'},
      {id: 'items', as: 'array', defaultValue: '%%' },
  ],
  impl: (ctx,prop,items) =>
      jb.obj(prop,items)
});

jb.component('wrap-as-object', {
  description: 'put each item in a property',
  type: 'aggregator',
  params: [
    {id: 'itemToPropName', as: 'string', dynamic: true, essential: true },
    {id: 'items', as: 'array', defaultValue: '%%' },
  ],
  impl: (ctx,key,items) => {
    let out = {}
    items.forEach(item=>out[jb.tostring(key(ctx.setData(item)))] = item)
    return out;
  }
});

