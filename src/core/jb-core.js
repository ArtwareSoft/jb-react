var jb = (function() {
function jb_run(context,parentParam,settings) {
  try {
    var profile = context.profile;
    if (context.probe && (!settings || !settings.noprobe)) {
      if (context.probe.pathToTrace.indexOf(context.path) == 0)
        return context.probe.record(context,parentParam)
    }
    if (profile === null || (typeof profile == 'object' && profile.$disabled))
      return castToParam(null,parentParam);

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
      case 'expression': return castToParam(expression(profile, context,parentParam), parentParam);
      case 'asIs': return profile;
      case 'object': return entriesToObject(entries(profile).map(e=>[e[0],context.runInner(e[1],null,e[0])]));
      case 'function': return castToParam(profile(context),parentParam);
      case 'null': return castToParam(null,parentParam);
      case 'ignore': return context.data;
      case 'list': { return profile.map((inner,i) => 
            context.runInner(inner,null,i)) };
      case 'runActions': return jb.comps.runActions.impl(new jbCtx(context,{profile: { actions : profile },path:''}));
      case 'if': {
          var cond = jb_run(run.ifContext, run.IfParentParam);
          if (cond && cond.then) 
            return cond.then(res=>
              res ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam))
          return cond ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);
      } 
      case 'profile':
        for(var varname in profile.$vars || {})
          run.ctx = new jbCtx(run.ctx,{ vars: jb.obj(varname,run.ctx.runInner(profile.$vars[varname], null,'$vars~'+varname)) });
        if (!run.impl) 
          run.ctx.callerPath = context.path;

        run.preparedParams.forEach(paramObj => {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.outerFunc(run.ctx) ;  break;
            case 'array': run.ctx.params[paramObj.name] = 
                paramObj.array.map((prof,i) => run.ctx.runInner(prof, paramObj.param, paramObj.path+'~'+i) )
              ; break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] = run.ctx.runInner(paramObj.prof, paramObj.param, paramObj.path)
            //jb_run(paramObj.context, paramObj.param);
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
              castToParam(run.impl.apply(null,args),parentParam))
        }
        else {
          out = jb_run(new jbCtx(run.ctx, { componentContext: run.ctx }),parentParam);
        }

        if (profile.$log)
          console.log(context.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + context.path, compName(profile),context,out,run);
          
        return castToParam(out,parentParam);
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
  return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>extend(x[1],jb.obj('id',x[0])));
}

function prepareParams(comp,profile,ctx) {
  return compParams(comp)
    .filter(comp=> 
      !comp.ignore)
    .map((param,index) => {
      var p = param.id;
      var val = profile[p], path =p, sugar = sugarProp(profile);
      if (!val && index == 0 && sugar) {
        path = sugar[0];
        val = sugar[1]; 
      }
      var valOrDefault = (typeof val != "undefined" && val != null) ? val : (typeof param.defaultValue != 'undefined' ? param.defaultValue : null);
      var valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
      var arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

      if (param.dynamic) {
        var outerFunc = runCtx => {
          if (arrayParam)
            var func = (ctx2,data2) => 
              jb.flattenArray(valOrDefaultArray.map((prof,i)=>
                runCtx.extendVars(ctx2,data2).runInner(prof,param,path+'~'+i)))
          else
            var func = (ctx2,data2) => 
                  valOrDefault != null ? runCtx.extendVars(ctx2,data2).runInner(valOrDefault,param,path) : valOrDefault;

          Object.defineProperty(func, "name", { value: p }); // for debug
          func.profile = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
          func.srcPath = ctx.path;
          return func;
        }
        return { name: p, type: 'function', outerFunc: outerFunc, path: path };
      } 

      if (arrayParam) // array of profiles
        return { name: p, type: 'array', array: valOrDefaultArray, param: {}, path: path };
      else 
        return { name: p, type: 'run', prof: valOrDefault, param: param, path: path }; // context: new jbCtx(ctx,{profile: valOrDefault, path: p}),
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
      ifContext: new jbCtx(context,{profile: profile.$if || profile.condition, path: '$if'}),
      IfParentParam: { type: 'boolean', as:'boolean' },
      thenContext: new jbCtx(context,{profile: profile.then || 0 , path: '~then'}),
      thenParentParam: { type: parentParam_type, as:jstype },
      elseContext: new jbCtx(context,{profile: profile['else'] || 0 , path: '~else'}),
      elseParentParam: { type: parentParam_type, as:jstype }
    }
  var comp_name = compName(profile);
  if (!comp_name) 
    return { type: 'ignore' }
  var comp = jb.comps[comp_name];
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
  else if (jb.resources && jb.resources[varname] != null) 
    res = jb.resources[varname];
  return resolveFinishedPromise(res);
}

function expression(exp, context, parentParam) {
  var jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as);
  exp = '' + exp;
  if (jstype == 'boolean') return bool_expression(exp, context);
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    var out = expression(exp.split('$log:')[1],context,parentParam);
    jb.comps.log.impl(context, out);
    return out;
  }
  if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp;
  // if (context && !context.ngMode)
  //   exp = exp.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (exp == '{%%}' || exp == '%%')
      return expPart('',context,jstype);

  if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
    return expPart(exp.substring(2,exp.length-2),context,jstype);

  exp = exp.replace(/{%(.*?)%}/g, function(match,contents) {
      return tostring(expPart(contents,context,'string'));
  })
  exp = exp.replace(/{\?(.*?)\?}/g, function(match,contents) {
      return tostring(conditionalExp(contents));
  })
  if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(exp.substring(1,exp.length-1),context,jstype);

  exp = exp.replace(/%([^%;{}\s><"']*)%/g, function(match,contents) {
      return tostring(expPart(contents,context,'string'));
  })
  return exp;

  function conditionalExp(exp) {
    // check variable value - if not empty return all exp, otherwise empty
    var match = exp.match(/%([^%;{}\s><"']*)%/);
    if (match && tostring(expPart(match[1],context,'string')))
      return expression(exp, context, { as: 'string' });
    else
      return '';
  }

  function expPart(expressionPart,context,jstype) {
    return resolveFinishedPromise(evalExpressionPart(expressionPart,context,jstype))
  }
}


function evalExpressionPart(expressionPart,context,jstype) {
  // example: %$person.name%.     
  if (expressionPart == ".") expressionPart = "";

  // empty primitive expression
  if (!expressionPart && (jstype == 'string' || jstype == 'boolean' || jstype == 'number')) 
    return jstypes[jstype](context.data);

  if (expressionPart.indexOf('=') == 0) { // function
    var parsed = expressionPart.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    var funcName = parsed && parsed[1];
    if (funcName && jb.functions[funcName])
      return tojstype(jb.functions[funcName](context,parsed[2]),jstype,context);
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
      item = item.$jb_parent
    else if (part.charAt(0) == '$' && i == 0 && part.length > 1)
      item = calcVar(context,part.substr(1))
    else if (Array.isArray(item))
      item = item.map(inner =>
        typeof inner === "object" ? objectProperty(inner,part,jstype,i == parts.length -1) : inner)
        .filter(x=>x != null)
    else if (item && typeof item === 'object' && typeof item[part] === 'function' && item[part].profile)
      item = item[part](context)
    else if (item && typeof item === 'object')
      item = item && objectProperty(item,part,jstype,i == parts.length -1)
    else
      item = null; // no match

    if (!isNaN(index) && Array.isArray(item)) 
      item = item[index];

    if (!item) 
      return item;	// 0 should return 0
  }
  return item;
}

function bool_expression(exp, context) {
  if (exp.indexOf('$debugger:') == 0) {
    debugger;
    exp = exp.split('$debugger:')[1];
  }
  if (exp.indexOf('$log:') == 0) {
    var calculated = expression(exp.split('$log:')[1],context,{as: 'string'});
    var result = bool_expression(exp.split('$log:')[1], context);
    jb.comps.log.impl(context, calculated + ':' + result);
    return result;
  }
  if (exp.indexOf('!') == 0)
    return !bool_expression(exp.substring(1), context);
  var parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    var val = jb.val(expression(exp, context));
    if (typeof val == 'boolean') return val;
    var asString = tostring(val);
    return !!asString && asString != 'false';
  }
  if (parts.length != 4)
    return logError('invalid boolean expression: ' + exp);
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

  var p1 = tonumber(expression(parts[1].trim(), context));
  var p2 = tonumber(expression(parts[3].trim(), context));

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {  // trims also " and '
    return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  }
}

function castToParam(value,param) {
  var res = tojstype(value,param ? param.as : null);
  if (param && param.as == 'ref' && param.whenNotReffable && !jb.isRef(res))
    res = tojstype(value,param.whenNotReffable);
  return res;
}

function tojstype(value,jstype) {
  if (!jstype) return value;
  if (typeof jstypes[jstype] != 'function') debugger;
  return jstypes[jstype](value);
}

var tostring = value => tojstype(value,'string');
var toarray = value => tojstype(value,'array');
var toboolean = value => tojstype(value,'boolean');
var tosingle = value => tojstype(value,'single');
var tonumber = value => tojstype(value,'number');

var jstypes = {
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
      if (value == null || value == undefined) return null;	// 0 is not null
      value = val(value);
      var num = Number(value,true);
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

function objectProperty(_object,property,jstype,lastInExpression) {
  var object = val(_object);
  if (!object) return null;
  if (typeof object[property] == 'undefined') 
    object[property] = lastInExpression ? null : {};
  if (lastInExpression) {
    if (jstype == 'string' || jstype == 'boolean' || jstype == 'number')
      return jstypes[jstype](object[property]); // no need for valueByRef
    if (jstype == 'ref') 
      return jb.valueByRefHandler.objectProperty(object,property)
  }
  return object[property];
}


function profileType(profile) {
  if (!profile) return '';
  if (typeof profile == 'string') return 'data';
  var comp_name = compName(profile);
  return (jb.comps[comp_name] && jb.comps[comp_name].type) || '';
}

function sugarProp(profile) {
  return entries(profile)
    .filter(p=>p[0].indexOf('$') == 0 && p[0].length > 1)
    .filter(p=>p[0].indexOf('$jb_') != 0)
    .filter(p=>['$vars','$debugger','$log'].indexOf(p[0]) == -1)[0]
}

function compName(profile) {
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

var ctxCounter = 0;

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

var logs = {};
function logError(errorStr,errorObj,ctx) {
  logs.error = logs.error || [];
  logs.error.push(errorStr);
  console.error(errorStr,errorObj,ctx);
}

function logPerformance(type,p1,p2,p3) {
  var types = ['focus','apply','check','suggestions','writeValue','render','probe','setState'];
  if ([].indexOf(type) == -1) return; // filter. TBD take from somewhere else
  console.log(type, p1 || '', p2 || '', p3 ||'');
}

function logException(e,errorStr) {
  logError('exception: ' + errorStr + "\n" + (e.stack||''));
}

function val(v) {
  if (v == null) return v;
  return jb.valueByRefHandler.val(v)
}
// Object.getOwnPropertyNames does not keep the order !!!
function entries(obj) {
  if (!obj || typeof obj != 'object') return [];
  var ret = [];
  for(var i in obj) // please do not change. its keeps definition order !!!!
      if (obj.hasOwnProperty(i)) 
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

var valueByRefHandler = valueByRefHandlerWithjbParent;
var types = {}, ui = {}, rx = {}, ctxDictionary = {}, testers = {};

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
  val: val,
  entries: entries,
  extend: extend,
  objectProperty: objectProperty
}

})();

Object.assign(jb,{
  comps: {}, functions: {}, resources: {},
  studio: { previewjb: jb }, 
  component: (id,val) => jb.comps[id] = val,
  type: (id,val) => jb.types[id] = val || {},
  resource: (id,val) => typeof val == 'undefined' ? jb.resources[id] : (jb.resources[id] = val || {}),
  functionDef: (id,val) => jb.functions[id] = val,

// force path - create objects in the path if not exist
  path: (object,path,value) => {
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
  },
  ownPropertyNames: obj => {
    var res = [];
    for (var i in (obj || {}))
      if (obj.hasOwnProperty(i))
        res.push(i);
    return res;
  },
  obj: (k,v,base) => {
    var ret = base || {};
    ret[k] = v;
    return ret;
  },
  compareArrays: (arr1, arr2) => {
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
  },
  range: (start, count) => 
    Array.apply(0, Array(count)).map((element, index) => index + start),

  flattenArray: items => {
    var out = [];
    items.filter(i=>i).forEach(function(item) { 
      if (Array.isArray(item)) 
        out = out.concat(item);
      else 
        out.push(item);
    })
    return out;
  },
  synchArray: ar => {
    var isSynch = ar.filter(v=> v &&  (typeof v.then == 'function' || typeof v.subscribe == 'function')).length == 0;
    if (isSynch) return ar;

    var _ar = ar.filter(x=>x).map(v=>
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
    var keys = {}, res = [];
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
  isRef: (ref) =>
    jb.refHandler(ref).isRef(ref),
  refreshRef: (ref) =>
    jb.refHandler(ref).refresh(ref),
  asRef: (obj) =>
    jb.valueByRefHandler.asRef(obj),
  resourceChange: _ => 
    jb.valueByRefHandler.resourceChange,
})



