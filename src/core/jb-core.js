export function jb_run(context,parentParam,settings) {
  try {
    var profile = context.profile;
    if (context.probe && (!settings || !settings.noprobe)) {
      if (context.probe.pathToTrace.indexOf(context.path) == 0)
        return context.probe.record(context,parentParam)
    }
    if (profile === null)
      return tojstype(profile,parentParam && parentParam.as,context);
    if (profile.$debugger == 0) debugger;
    if (profile.$asIs) return profile.$asIs;
    if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
        parentParam.as = 'array';

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
      return;
    var run = prepare(context,parentParam);
    var jstype = parentParam && parentParam.as;
    context.parentParam = parentParam;
    switch (run.type) {
      case 'booleanExp': return bool_expression(profile, context);
      case 'expression': return tojstype(expression(profile, context,parentParam), jstype, context);
      case 'asIs': return profile;
      case 'object': return entriesToObject(entries(profile).map(e=>[e[0],context.runInner(e[1],null,e[0])]));
      case 'function': return tojstype(profile(context),jstype, context);
      case 'null': return tojstype(null,jstype, context);
      case 'ignore': return context.data;
      case 'list': { return profile.map((inner,i) => 
            context.runInner(inner,null,i)) };
      case 'runActions': return comps.runActions.impl(new jbCtx(context,{profile: { actions : profile },path:''}));
      case 'if': {
          var cond = jb_run(run.ifContext, run.IfParentParam);
          if (cond && cond.then) 
            return cond.then(res=>
              res ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam))
          return cond ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);
      } 
      case 'profile':
        for(var varname in profile.$vars || {})
          run.ctx.vars[varname] = run.ctx.runInner(profile.$vars[varname], null,'$vars~'+varname);
        run.preparedParams.forEach(paramObj => {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.func; break;
            case 'array': run.ctx.params[paramObj.name] = 
                paramObj.array.map((prof,i) => run.ctx.runInner(prof, paramObj.param, paramObj.name+'~'+i) )
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] = jb_run(paramObj.context, paramObj.param);
          }
        });
        var out;
        if (run.impl) {
          var args = prepareGCArgs(run.ctx,run.preparedParams);
          if (profile.$debugger) debugger;
          if (! args.then)
            out = run.impl.apply(null,args);
          else
            return args.then(args=>
              tojstype(run.impl.apply(null,args),jstype, context))
        }
        else {
          run.ctx.callerPath = context.path;
          out = jb_run(new jbCtx(run.ctx, { componentContext: run.ctx }),parentParam);
        }

        if (profile.$log)
          console.log(context.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + context.path, compName(profile),context,out,run);
          
        return tojstype(out,jstype, context);
    }
  } catch (e) {
    if (context.vars.$throw) throw e;
    logException(e,'exception while running run');
  }

  function prepareGCArgs(ctx,preparedParams) {
    var delayed = preparedParams.filter(param => {
      var v = ctx.params[param.name] || {};
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

function compParams(comp) {
  if (!comp || !comp.params) 
    return [];
  return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>extend(x[1],obj('id',x[0])));
}

function prepareParams(comp,profile,ctx) {
  return compParams(comp)
    .filter(comp=> 
      !comp.ignore)
    .map((param,index) => {
      var p = param.id;
      var val = profile[p], path =p;
      if (!val && index == 0 && sugarProp(profile)) {
        path = sugarProp(profile)[0];
        val = sugarProp(profile)[1]; 
      }
      var valOrDefault = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
      var valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
      var arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

      if (param.dynamic) {
        if (arrayParam)
          var func = (ctx2,data2) => 
            flattenArray(valOrDefaultArray.map((prof,i)=>
              ctx.extendVars(ctx2,data2).runInner(prof,param,path+'~'+i)))
        else
          var func = (ctx2,data2) => 
                valOrDefault != null ? ctx.extendVars(ctx2,data2).runInner(valOrDefault,param,path) : valOrDefault;

        Object.defineProperty(func, "name", { value: p }); // for debug
        func.profile = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
        func.srcPath = ctx.path;
        return { name: p, type: 'function', func: func };
      } 

      if (arrayParam) // array of profiles
        return { name: p, type: 'array', array: valOrDefaultArray, param: {} };
      else 
        return { name: p, type: 'run', context: new jbCtx(ctx,{profile: valOrDefault, path: p}), param: param };
  })
}

function prepare(context,parentParam) {
  var profile = context.profile;
  var profile_jstype = typeof profile;
  var parentParam_type = parentParam && parentParam.type;
  var jstype = parentParam && parentParam.as;
  var isArray = Array.isArray(profile);

  if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' };
  if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' };// native primitives
  if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' };
  if (profile_jstype === 'string') return { type: 'expression' };
  if (profile_jstype === 'function') return { type: 'function' };
  if (profile_jstype === 'object' && !isArray && entries(profile).filter(p=>p[0].indexOf('$') == 0).length == 0) return { type: 'asIs' };
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
      ifContext: new jbCtx(context,{profile: profile.$if, path: '$if'}),
      IfParentParam: { type: 'boolean', as:'boolean' },
      thenContext: new jbCtx(context,{profile: profile.then || 0 , path: '~then'}),
      thenParentParam: { type: parentParam_type, as:jstype },
      elseContext: new jbCtx(context,{profile: profile['else'] || 0 , path: '~else'}),
      elseParentParam: { type: parentParam_type, as:jstype }
    }
  var comp_name = compName(profile);
  if (!comp_name) 
    return { type: 'ignore' }
  var comp = comps[comp_name];
  if (!comp && comp_name) { logError('component ' + comp_name + ' is not defined'); return { type:'null' } }
  if (!comp.impl) { logError('component ' + comp_name + ' has no implementation'); return { type:'null' } }

  var ctx = new jbCtx(context,{});
  ctx.parentParam = parentParam;
  ctx.params = {}; // TODO: try to delete this line
  var preparedParams = prepareParams(comp,profile,ctx);
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

function calcVar(context,varname) {
  var res;
  if (context.componentContext && typeof context.componentContext.params[varname] != 'undefined') 
    res = context.componentContext.params[varname];
  else if (context.vars[varname] != null) 
    res = context.vars[varname];
  else if (context.vars.scope && context.vars.scope[varname] != null) 
    res = context.vars.scope[varname];
  else if (context.resources && context.resources[varname] != null) 
    res = context.resources[varname];
  return resolveFinishedPromise(res);
}

export function expression(expression, context, parentParam) {
  var jstype = parentParam && parentParam.as;
  expression = '' + expression;
  if (jstype == 'boolean') return bool_expression(expression, context);
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var out = expression(expression.split('$log:')[1],context,parentParam);
    comps.log.impl(context, out);
    return out;
  }
  if (expression.indexOf('%') == -1 && expression.indexOf('{') == -1) return expression;
  // if (context && !context.ngMode)
  //   expression = expression.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (expression == '{%%}' || expression == '%%')
      return expPart('',context,jstype);

  if (expression.lastIndexOf('{%') == 0 && expression.indexOf('%}') == expression.length-2) // just one expression filling all string
    return expPart(expression.substring(2,expression.length-2),context,jstype);

  expression = expression.replace(/{%(.*?)%}/g, function(match,contents) {
      return tostring(expPart(contents,context,'string'));
  })
  expression = expression.replace(/{\?(.*?)\?}/g, function(match,contents) {
      return tostring(conditionalExp(contents));
  })
  if (expression.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(expression.substring(1,expression.length-1),context,jstype);

  expression = expression.replace(/%([^%;{}\s><"']*)%/g, function(match,contents) {
      return tostring(expPart(contents,context,'string'));
  })

  function conditionalExp(expression) {
    // check variable value - if not empty return all expression, otherwise empty
    var match = expression.match(/%([^%;{}\s><"']*)%/);
    if (match && tostring(expPart(match[1],context,'string')))
      return expression(expression, context, { as: 'string' });
    else
      return '';
  }

  function expPart(expressionPart,context,jstype) {
    return resolveFinishedPromise(evalExpressionPart(expressionPart,context,jstype))
  }

  return expression;
}


function evalExpressionPart(expressionPart,context,jstype) {
  // example: {{$person.name}}.     
  if (expressionPart == ".") expressionPart = "";

  // empty primitive expression
  if (!expressionPart && (jstype == 'string' || jstype == 'boolean' || jstype == 'number')) 
    return jstypes[jstype](context.data);

  if (expressionPart.indexOf('=') == 0) { // function
    var parsed = expressionPart.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    var funcName = parsed && parsed[1];
    if (funcName && functions[funcName])
      return tojstype(functions[funcName](context,parsed[2]),jstype,context);
  }

  var parts = expressionPart.split(/[.\/]/);
  var item = context.data;

  for(var i=0;i<parts.length;i++) {
    var part = parts[i], index, match;
    if ((match = part.match(/(.*)\[([0-9]+)\]/)) != null) { // x[y]
      part = match[1];
      index = Number(match[2]);
    }
    if (part == '') ;
    else if (part == '$parent' && item.$jb_parent && i > 0) 
      item = item.$jb_parent;
    else if (part.charAt(0) == '$' && i == 0 && part.length > 1)
      item = calcVar(context,part.substr(1));

    else if (Array.isArray(item))
      item = map(item,function(inner) {
        return typeof inner === "object" ? objectProperty(inner,part,jstype,i == parts.length -1) : inner;
      });
    else if (typeof item === 'object' && typeof item[part] === 'function' && item[part].profile)
      item = item[part](context);
    else if (typeof item === 'object')
      item = item && objectProperty(item,part,jstype,i == parts.length -1);
    else if (index && Array.isArray(item)) 
      item = item[index];
    else
      item = null; // no match
    if (!item) 
      return item;	// 0 should return 0
  }
  return item;
}

export function bool_expression(expression, context) {
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var calculated = expression(expression.split('$log:')[1],context,{as: 'string'});
    var result = bool_expression(expression.split('$log:')[1], context);
    comps.log.impl(context, calculated + ':' + result);
    return result;
  }
  if (expression.indexOf('!') == 0)
    return !bool_expression(expression.substring(1), context);
  var parts = expression.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    var asString = expression(expression, context, {as: 'string'});
    return !!asString && asString != 'false';
  }
  if (parts.length != 4)
    return logError('invalid boolean expression: ' + expression);
  var op = parts[2].trim();

  if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
    var p1 = tostring(expression(trim(parts[1]), context, {as: 'string'}))
    var p2 = tostring(expression(trim(parts[3]), context, {as: 'string'}))
    // var p1 = expression(trim(parts[1]), context, {as: 'string'});
    // var p2 = expression(trim(parts[3]), context, {as: 'string'});
    p2 = (p2.match(/^["'](.*)["']/) || [,p2])[1]; // remove quotes
    if (op == '==') return p1 == p2;
    if (op == '!=') return p1 != p2;
    if (op == '^=') return p1.lastIndexOf(p2,0) == 0; // more effecient
    if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1;
  }

  var p1 = tojstype(expression(parts[1].trim(), context), {as:'number'});
  var p2 = tojstype(expression(parts[3].trim(), context), {as:'number'});

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {  // trims also " and '
    return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  }
}

export function tojstype(value,jstype,context) {
  if (!jstype) return value;
  if (typeof jstypes[jstype] != 'function') debugger;
  return jstypes[jstype](value,context);
}

export var tostring = value => tojstype(value,'string');
export var toarray = value => tojstype(value,'array');
export var toboolean = value => tojstype(value,'boolean');
export var tosingle = value => tojstype(value,'single');
export var tonumber = value => tojstype(value,'number');

export var jstypes = {
    'asIs': x => x,
    'object': x => x,
    'string': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return '';
      value = val(value,true);
      if (typeof(value) == 'undefined') return '';
      return '' + value;
    },
    'number': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null || value == undefined) return null;	// 0 is not null
      value = val(value);
      var num = Number(value,true);
      return isNaN(num) ? null : num;
    },
    'array': function(value) {
      if (typeof value == 'function' && value.profile)
        value = value();
      if (Array.isArray(value)) return value;
      if (value == null) return [];
      return [value];
    },
    'boolean': function(value) {
      if (Array.isArray(value)) value = value[0];
      return val(value,true) ? true : false;
    },
    'single': function(value) {
      if (Array.isArray(value)) return value[0];
      if (!value) return value;
      value = val(value,true);
      return value;
    },
    'ref': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return value;
      if (value && (value.$jb_parent || value.$jb_val))
        return value;
      return { $jb_val: () => value }
    }
};

export function profileType(profile) {
  if (!profile) return '';
  if (typeof profile == 'string') return 'data';
  var comp_name = compName(profile);
  return (comps[comp_name] && comps[comp_name].type) || '';
}

function sugarProp(profile) {
  return entries(profile)
    .filter(p=>p[0].indexOf('$') == 0 && p[0].length > 1)
    .filter(p=>['$vars','$debugger','$log'].indexOf(p[0]) == -1)[0]
}

export function compName(profile) {
  if (!profile) return;
  if (profile.$) return profile.$;
  var f = sugarProp(profile);
  return f && f[0].slice(1);
}

// give a name to the impl function. Used for tgp debugging
function assignNameToFunc(name, fn) {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
} 

export function compDef(compName,component) {
  comps[compName] = component;
  return function(options) { 
    if (typeof options == 'string') {
      var out = {};
      out['$'+compName] = options;
      return out;
    } else if (typeof options == 'object') {
      options.$ = compName;
      return options;
    } else
      return {$: compName}
  }
}

export function component(compName,component) {
  compDef(compName,component)
}

export function typeDef(typeName,typeObj) {
  path(jbart,['types',typeName],typeObj || {});
}

export function functionDef(funcName, func) {
  path(jbart,['functions',funcName],func);
}

export function resourceDef(widgetName,name,resource) {
  path(jbart_widgets,[widgetName,'resources',name],resource);
}

// export var jbart = { ctxCounter : 0, ctxDictionary : {}, comps: {}, resources: {}, tests: {}, styles: {} };
// if (typeof window != 'undefined') window.jbart = jbart; // for the studio and debug

var ctxCounter = 0;

export class jbCtx {
  constructor(context,ctx2) {
    this.id = ctxCounter++;
    this._parent = context;
    if (typeof context == 'undefined') {
      this.vars = {};
      this.params = {};
      this.resources = {}
    }
    else {
      if (ctx2.profile && ctx2.path == null) {
        debugger;
      ctx2.path = '?';
    }
      this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : context.profile;

      this.path = (context.path || '') + (ctx2.path ? '~' + ctx2.path : '');
      if (ctx2.comp)
        this.path = ctx2.comp;
      this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : context.data;     // allow setting of data:null
      this.vars= ctx2.vars ? extend({},context.vars,ctx2.vars) : context.vars;
      this.params= ctx2.params || context.params;
      this.resources= context.resources;
      this.componentContext= (typeof ctx2.componentContext != 'undefined') ? ctx2.componentContext : context.componentContext;
      this.probe= context.probe;
    }
  }
  run(profile,parentParam) { 
    return jb_run(new jbCtx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam) 
  }
  exp(expression,jstype) { return expression(expression, this, {as: jstype}) }
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
    return new jbCtx(this,{ vars: ctx2 ? ctx2.vars : null, data: (data2 == null) ? ctx2.data : data2 })
  }
  runItself(parentParam,settings) { return jb_run(this,parentParam,settings) }
}

var logs = {};
export function logError(errorStr,errorObj,ctx) {
  logs.error = logs.error || [];
  logs.error.push(errorStr);
  console.error(errorStr,errorObj,ctx);
}

export function logPerformance(type,text) {
  var types = ['focus','apply','check','suggestions'];
  if (type != 'focus') return; // filter. TBD take from somewhere else
  console.log(type, text == null ? '' : text);
}

export function logException(e,errorStr) {
  logError('exception: ' + errorStr + "\n" + (e.stack||''));
}

// functions
export function extend(obj,obj1,obj2,obj3) {
  if (!obj) return;
  Object.getOwnPropertyNames(obj1||{})
    .forEach(function(p) { obj[p] = obj1[p] })
  Object.getOwnPropertyNames(obj2||{})
    .forEach(function(p) { obj[p] = obj2[p] })
  Object.getOwnPropertyNames(obj3||{})
    .forEach(function(p) { obj[p] = obj3[p] })

  return obj;
}

// force path - create objects in the path if not exist
export function path(object,path,value) {
  var cur = object;

  if (typeof value == 'undefined') {  // get
    for(var i=0;i<path.length;i++) {
      cur = cur[path[i]];
      if (cur == null || typeof cur == 'undefined') return null;
    }
    return cur;
  } else { // set
    for(var i=0;i<path.length;i++)
      if (i == path.length-1)
        cur[path[i]] = value;
      else
        cur = cur[path[i]] = cur[path[i]] || {};
    return value;
  }
}

// Object.getOwnPropertyNames does not keep the order !!!
export function ownPropertyNames(obj) {
  var res = [];
  for (var i in (obj || {}))
    if (obj.hasOwnProperty(i))
      res.push(i);
  return res;
}

export function obj(k,v,base) {
  var ret = base || {};
  ret[k] = v;
  return ret;
}

export function compareArrays(arr1, arr2) {
  if (arr1 == arr2)
    return true;
  if (!Array.isArray(arr1) && !Array.isArray(arr2)) return arr1 == arr2;
  if (!arr1 || !arr2 || arr1.length != arr2.length) return false;
  for (var i = 0; i < arr1.length; i++) {
    var key1 = (arr1[i]||{}).key, key2 = (arr2[i]||{}).key;
    if (key1 && key2 && key1 == key2 && arr1[i].val == arr2[i].val)
      continue;
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

 export function range(start, count) {
    return Array.apply(0, Array(count)).map((element, index) => index + start);
}

export function entries(obj) {
  if (!obj || typeof obj != 'object') return [];
  var ret = [];
  for(var i in obj) // do not change. tend to keep definition order !!!!
      if (obj.hasOwnProperty(i)) 
        ret.push([i,obj[i]])
  return ret;
}

export function flattenArray(items) {
  var out = [];
  items.filter(i=>i).forEach(function(item) { 
    if (Array.isArray(item)) 
      out = out.concat(item);
    else 
      out.push(item);
  })
  return out;
}

export function synchArray(ar) {
  var isSynch = ar.filter(v=> v &&  (typeof v.then == 'function' || typeof v.subscribe == 'function')).length == 0;
  if (isSynch) return ar;

  var _ar = ar.filter(x=>x).map(v=>
    (typeof v.then == 'function' || typeof v.subscribe == 'function') ? v : [v])

  return Observable.from(_ar)
          .concatMap(x=>
            x)
          .flatMap(v => 
            Array.isArray(v) ? v : [v])
          .toArray()
          .toPromise()
}

export function isProfOfType(prof,type) {
  var types = ((comps[compName(prof)] || {}).type || '').split('[]')[0].split(',');
  return types.indexOf(type) != -1;
}

// usage: .filter( unique(x=>x.id) )
// simple case: [1,2,3,3].filter((x,index,self)=>self.indexOf(x) === index)
// n**2 cost !!!! use only for small arrays
export function unique(mapFunc) { 
  function onlyUnique(value, index, self) { 
      return self.map(mapFunc).indexOf(mapFunc(value)) === index;
  }
  return onlyUnique;
}

export function equals(x,y) {
  return x == y || val(x) == val(y)
}

export function writeValue(to,val) {
  if (!to) return;
  if (to.$jb_val) 
    return to.$jb_val(val(val));
  if (to.$jb_parent)
    to.$jb_parent[to.$jb_property] = val(val);
}

export function isRef(value) {
  return value && (value.$jb_parent || value.$jb_val);
}

export function objectProperty(_object,property,jstype,lastInExpression) {
  var object = val(_object);
  if (!object) return null;
  if (typeof object[property] == 'undefined') 
    object[property] = lastInExpression ? null : {};
  if (lastInExpression) {
    if (jstype == 'string' || jstype == 'boolean' || jstype == 'number')
      return jstypes[jstype](object[property]); // no need for valueByRef
    if (jstype == 'ref') {
      if (isRef(object[property]))
        return object[property];
      else
        return { $jb_parent: object, $jb_property: property };
    }
  }
  return object[property];
}

export function val(val) {
  if (val == null) return val;
  if (val.$jb_val) return val.$jb_val();
  // if (applyFunction && typeof val == 'function' && val.profile)
  //   return val();
  return (val.$jb_parent) ? val.$jb_parent[val.$jb_property] : val;
}

export function delay(mSec) {
  return new Promise(r=>{setTimeout(r,mSec)})
}

export var comps = {};
export var functions = {};
export var ui = {};
export var rx = {};
export var studio = {};
export var resources = {};
export var ctxDictionary = {};
export var testers = {};