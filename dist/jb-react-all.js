(function() {
'use strict'
const spySettings = { 
    moreLogs: 'req,res,focus,apply,check,suggestions,writeValue,render,createReactClass,renderResult,probe,setState,immutable,pathOfObject,refObservable,scriptChange,resLog', 
	includeLogs: 'exception,error',
	stackFilter: /wSpy|jb_spy|Object.log|node_modules/i,
    extraIgnoredEvents: [], MAX_LOG_SIZE: 10000, DEFAULT_LOGS_COUNT: 300, GROUP_MIN_LEN: 5
}
const frame = typeof window === 'object' ? window : typeof self === 'object' ? self : typeof global === 'object' ? global : {};

function initSpy({Error, settings, wSpyParam, memoryUsage}) {
    const systemProps = ['index', 'time', '_time', 'mem', 'source']

    const isRegex = x => Object.prototype.toString.call(x) === '[object RegExp]'
    const isString = x => typeof x === 'string' || x instanceof String
    
    return {
		ver: 7,
		logs: {},
		wSpyParam,
		otherSpies: [],
		enabled: () => true,
		log(logName, record, {takeFrom, funcTitle, modifier} = {}) {
			const init = () => {
				if (!this.includeLogs) {
					const includeLogsFromParam = (this.wSpyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
					const excludeLogsFromParam = (this.wSpyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
					this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
						acc[log] = true
						return acc
					}, {})
				}
			}
			const shouldLog = (logName, record) =>
				this.wSpyParam === 'all' || Array.isArray(record) && this.includeLogs[logName] && !settings.extraIgnoredEvents.includes(record[0])

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
		},
		getCallbackName(cb, takeFrom) {
			if (!cb) {
				return
			}
			if (!cb.name || isString(cb.name) && cb.name.startsWith('bound ')) {
				if (Array.isArray(cb.source)) {
					return cb.source[0]
				}
				const nameFromSource = this.source(takeFrom)
				if (Array.isArray(nameFromSource)) {
					return nameFromSource
				}
			}
			return cb.name.trim()
		},
		logCallBackRegistration(cb, logName, record, takeFrom) {
			cb.source = this.source(takeFrom)
			this.log(logName, [this.getCallbackName(cb, takeFrom), ...record], takeFrom)
		},
		logCallBackExecution(cb, logName, record, takeFrom) {
			this.log(logName, [this.getCallbackName(cb, takeFrom), cb.source, ...record], takeFrom)
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
		resetParam: wSpyParam => {
			this.wSpyParam = wSpyParam;
			this.includeLogs = null;
		},
		purge(count) {
			const countFromEnd = -1 * (count || settings.DEFAULT_LOGS_COUNT)
			Object.keys(this.logs).forEach(log => this.logs[log] = this.logs[log].slice(countFromEnd))
		},
		setLogs(logs) {
			this.includeLogs = (logs||'').split(',').reduce((acc,log) => {acc[log] = true; return acc },{})
		},
		clear(logs) {
			Object.keys(this.logs).forEach(log => delete this.logs[log])
		},
        search(pattern) {
			if (isRegex(pattern)) {
				return this.merged(x => pattern.test(x.join(' ')))
			} else if (isString(pattern)) {
				return this.merged(x => x.join(' ').indexOf(pattern) !== -1)
			} else if (Number.isInteger(pattern)) {
				return this.merged().slice(-1 * pattern)
			}
		},
		merged(filter) {
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
		},
		all(filter) {
			return this.merged(filter)
		},
		grouped(filter) {
			const merged = this.merged(filter)
			const countFromEnd = -1 * settings.DEFAULT_LOGS_COUNT
			return [].concat.apply([], merged.reduce((acc, curr, i, arr) => {
				const group = acc[acc.length - 1]
				if (!group) {
					return [newGroup(curr)]
				}
				if (curr[1] === group[0][1]) {
					group.push(curr)
				} else {
					if (group.length > settings.GROUP_MIN_LEN) {
						group.unshift(`[${group.length}] ${group[0][1]}`)
					}
					acc.push(newGroup(curr))
				}
				if (i === arr.length - 1 && group.length > settings.GROUP_MIN_LEN) {
					group.unshift(`[${group.length}] ${group[0][1]}`)
				}
				return acc
			}, []).map(e => e.length > settings.GROUP_MIN_LEN ? [e] : e)).
				slice(countFromEnd).
				map((x, i, arr) => {
					const delay = i === 0 ? 0 : x.time - arr[i - 1].time
					x[0] = `${x[0]} +${delay}`
					return x
				})
			function newGroup(rec) {
				const res = [rec]
				res.time = rec.time
				return res
			}
		}
	}
} 

const noop = () => false;
const noopSpy = {
    log: noop, getCallbackName: noop, logCallBackRegistration: noop, logCallBackExecution: noop, enabled: noop
}

frame.initwSpy = function(settings = {}) {
	const getParentUrl = () => { try { return frame.parent.location.href } catch(e) {} }
	const getUrl = () => { try { return frame.location.href } catch(e) {} }
	const getSpyParam = url => (url.match('[?&]w[sS]py=([^&]+)') || ['', ''])[1]
	const getFirstLoadedSpy = () => { try { return frame.parent && frame.parent.wSpy || frame.wSpy } catch(e) {} }
	function saveOnFrame(wSpy) { 
		try { 
			frame.wSpy = wSpy;  
			if (frame.parent)
				frame.parent.wSpy = wSpy
		} catch(e) {} 
		return wSpy
	}

	function doInit() {
		try {
			if (settings.forceNoop)
				return noopSpy
			const existingSpy = getFirstLoadedSpy();
			if (existingSpy && existingSpy.enabled())
				return existingSpy;
	
			const wSpyParam = settings.wSpyParam || getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
			if (wSpyParam) return initSpy({
				Error: frame.Error,
				memoryUsage: () => frame.performance && performance.memory && performance.memory.usedJSHeapSize,
				wSpyParam,
				settings: Object.assign(settings, spySettings)
			});
		} catch (e) {}
		return noopSpy
	}

	return saveOnFrame(doInit())
}

if (typeof window == 'object') {
	frame.initwSpy()
}

})()
;

const jb = (function() {
const frame = typeof window === 'object' ? window : typeof self === 'object' ? self : typeof global === 'object' ? global : {};
const pathsToLog = new Set()

function jb_run(ctx,parentParam,settings) {
  log('req', [ctx,parentParam,settings])
  const res = do_jb_run(...arguments);
  
  log(pathsToLog.has(ctx.path) ? 'resLog' : 'res', [ctx,res,parentParam,settings])
  return res;
}

function do_jb_run(context,parentParam,settings) {
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
//    log('exception', [e && e.message, e, context,parentParam,settings])
    logException(e,'exception while running run',context,parentParam,settings);
    //if (context.vars.$throw) throw e;
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
  if (!comp && comp_name) { logError('component ' + comp_name + ' is not defined', context); return { type:'null' } }
  if (!comp.impl) { logError('component ' + comp_name + ' has no implementation', context); return { type:'null' } }

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
    res = jb.resource(varname);
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
            return jb.logError('expecting array instead of ' + typeof arr, context, arr);

        if (last && (jstype == 'ref' || !primitiveJsType))
           return refHandler.objectProperty(arr,index,context);
        if (typeof arr[index] == 'undefined')
           arr[index] = last ? null : implicitlyCreateInnerObject(arr,index,refHandler);
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
        if (jstype == 'ref') {
          if (last)
            return refHandler.objectProperty(obj,subExp);
          if (typeof obj[subExp] === 'undefined')
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
    return logError('invalid boolean expression: ' + exp, context);
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
  if (param && param.as == 'ref' && param.whenNotRefferable && !jb.isRef(res))
    res = tojstype(value,param.whenNotRefferable);
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
  parents() {
    return this._parent ? [this._parent].concat(_this.parent.parents()) : []
  }
  isParentOf(childCtx) {
    return childCtx.parents().filter(x == this).length > 0
  }

}

const logs = {};

const profileOfPath = path => path.reduce((o,p)=>o && o[p], jb.comps) || {}

const log = (logName, record) => frame.wSpy && frame.wSpy.log(logName, record, {
  modifier: record => {
    if (record[1] instanceof jbCtx)
      record.splice(1,0,pathSummary(record[1].path))
    if (record[0] instanceof jbCtx)
      record.splice(0,0,pathSummary(record[0].path))
}});

function pathSummary(path) {
  const _path = path.split('~');
  while(!jb.compName(profileOfPath(_path)) && _path.length > 0)
    _path.pop();
	return jb.compName(profileOfPath(_path)) + ':' + path;
}

function logError() {
  log('error',[...arguments])
}

function logException(e,errorStr,ctx, ...rest) {
  log('exception',[e.stack||'',ctx,errorStr && pathSummary(ctx.path),e, ...rest])
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
function objFromEntries(entries) {
  const res = {}
  entries.forEach(e => res[e[0]] = e[1]);
  return res;
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
    jb.log('writeValue',['valueByRefWithjbParent',value,to,srcCtx]);
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
    return { $jb_val: () => value, $jb_path: () => [] }
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
  run: jb_run,
  jbCtx, expression, bool_expression, profileType, compName, pathSummary, logs, logError, log, logException, tojstype, jstypes, tostring, toarray, toboolean,tosingle,tonumber,
  valueByRefHandler, types, ui, rx, ctxDictionary, testers, compParams, singleInType, val, entries, objFromEntries, extend, pathsToLog, frame,
  ctxCounter: _ => ctxCounter
}

})();

Object.assign(jb,{
  comps: {}, functions: {}, resources: {}, consts: {},
  studio: { previewjb: jb },
  component: (id,val) => jb.comps[id] = val,
  type: (id,val) => jb.types[id] = val || {},
  resource: (id,val) => { 
    if (typeof val !== 'undefined')
      jb.resources[id] = val || {}
    jb.valueByRefHandler && jb.valueByRefHandler.resourceReferred && jb.valueByRefHandler.resourceReferred(id);
    return jb.resources[id];
  },
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
    jb.valueByRefHandler.resourceChange
})
if (typeof window != 'undefined')
  window.jb = jb
if (typeof self != 'undefined')
  self.jb = jb
if (typeof module != 'undefined')
  module.exports = jb;

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
	impl: (ctx,array,itemToRemove,_index) => {
		const ar = jb.toarray(array);
		const index = itemToRemove ? ar.indexOf(item) : _index;
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
			jb.logException(e,'json parse',ctx);
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
			  .catch(e => jb.logException(e,'',ctx) || [])
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
			  .catch(e => jb.logException(e,'',ctx) || [])
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

;(function() {
"use strict";

/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A component handler interface using the revealing module design pattern.
 * More details on this design pattern here:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @author Jason Mayes.
 */
/* exported componentHandler */

// Pre-defining the componentHandler interface, for closure documentation and
// static verification.
var componentHandler = {
  /**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */
  upgradeDom: function(optJsClass, optCssClass) {},
  /**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */
  upgradeElement: function(element, optJsClass) {},
  /**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */
  upgradeElements: function(elements) {},
  /**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */
  upgradeAllRegistered: function() {},
  /**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */
  registerUpgradedCallback: function(jsClass, callback) {},
  /**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config the registration configuration
   */
  register: function(config) {},
  /**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */
  downgradeElements: function(nodes) {}
};

componentHandler = (function() {
  'use strict';

  /** @type {!Array<componentHandler.ComponentConfig>} */
  var registeredComponents_ = [];

  /** @type {!Array<componentHandler.Component>} */
  var createdComponents_ = [];

  var componentConfigProperty_ = 'mdlComponentConfigInternal_';

  /**
   * Searches registered components for a class we are interested in using.
   * Optionally replaces a match with passed object if specified.
   *
   * @param {string} name The name of a class we want to use.
   * @param {componentHandler.ComponentConfig=} optReplace Optional object to replace match with.
   * @return {!Object|boolean}
   * @private
   */
  function findRegisteredClass_(name, optReplace) {
    for (var i = 0; i < registeredComponents_.length; i++) {
      if (registeredComponents_[i].className === name) {
        if (typeof optReplace !== 'undefined') {
          registeredComponents_[i] = optReplace;
        }
        return registeredComponents_[i];
      }
    }
    return false;
  }

  /**
   * Returns an array of the classNames of the upgraded classes on the element.
   *
   * @param {!Element} element The element to fetch data from.
   * @return {!Array<string>}
   * @private
   */
  function getUpgradedListOfElement_(element) {
    var dataUpgraded = element.getAttribute('data-upgraded');
    // Use `['']` as default value to conform the `,name,name...` style.
    return dataUpgraded === null ? [''] : dataUpgraded.split(',');
  }

  /**
   * Returns true if the given element has already been upgraded for the given
   * class.
   *
   * @param {!Element} element The element we want to check.
   * @param {string} jsClass The class to check for.
   * @returns {boolean}
   * @private
   */
  function isElementUpgraded_(element, jsClass) {
    var upgradedList = getUpgradedListOfElement_(element);
    return upgradedList.indexOf(jsClass) !== -1;
  }

  /**
   * Create an event object.
   *
   * @param {string} eventType The type name of the event.
   * @param {boolean} bubbles Whether the event should bubble up the DOM.
   * @param {boolean} cancelable Whether the event can be canceled.
   * @returns {!Event}
   */
  function createEvent_(eventType, bubbles, cancelable) {
    if ('CustomEvent' in window && typeof window.CustomEvent === 'function') {
      return new CustomEvent(eventType, {
        bubbles: bubbles,
        cancelable: cancelable
      });
    } else {
      var ev = document.createEvent('Events');
      ev.initEvent(eventType, bubbles, cancelable);
      return ev;
    }
  }

  /**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */
  function upgradeDomInternal(optJsClass, optCssClass) {
    if (typeof optJsClass === 'undefined' &&
        typeof optCssClass === 'undefined') {
      for (var i = 0; i < registeredComponents_.length; i++) {
        upgradeDomInternal(registeredComponents_[i].className,
            registeredComponents_[i].cssClass);
      }
    } else {
      var jsClass = /** @type {string} */ (optJsClass);
      if (typeof optCssClass === 'undefined') {
        var registeredClass = findRegisteredClass_(jsClass);
        if (registeredClass) {
          optCssClass = registeredClass.cssClass;
        }
      }

      var elements = document.querySelectorAll('.' + optCssClass);
      for (var n = 0; n < elements.length; n++) {
        upgradeElementInternal(elements[n], jsClass);
      }
    }
  }

  /**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */
  function upgradeElementInternal(element, optJsClass) {
    // Verify argument type.
    if (!(typeof element === 'object' && element instanceof Element)) {
      throw new Error('Invalid argument provided to upgrade MDL element.');
    }
    // Allow upgrade to be canceled by canceling emitted event.
    var upgradingEv = createEvent_('mdl-componentupgrading', true, true);
    element.dispatchEvent(upgradingEv);
    if (upgradingEv.defaultPrevented) {
      return;
    }

    var upgradedList = getUpgradedListOfElement_(element);
    var classesToUpgrade = [];
    // If jsClass is not provided scan the registered components to find the
    // ones matching the element's CSS classList.
    if (!optJsClass) {
      var classList = element.classList;
      registeredComponents_.forEach(function(component) {
        // Match CSS & Not to be upgraded & Not upgraded.
        if (classList.contains(component.cssClass) &&
            classesToUpgrade.indexOf(component) === -1 &&
            !isElementUpgraded_(element, component.className)) {
          classesToUpgrade.push(component);
        }
      });
    } else if (!isElementUpgraded_(element, optJsClass)) {
      classesToUpgrade.push(findRegisteredClass_(optJsClass));
    }

    // Upgrade the element for each classes.
    for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
      registeredClass = classesToUpgrade[i];
      if (registeredClass) {
        // Mark element as upgraded.
        upgradedList.push(registeredClass.className);
        element.setAttribute('data-upgraded', upgradedList.join(','));
        var instance = new registeredClass.classConstructor(element);
        instance[componentConfigProperty_] = registeredClass;
        createdComponents_.push(instance);
        // Call any callbacks the user has registered with this component type.
        for (var j = 0, m = registeredClass.callbacks.length; j < m; j++) {
          registeredClass.callbacks[j](element);
        }

        if (registeredClass.widget) {
          // Assign per element instance for control over API
          element[registeredClass.className] = instance;
        }
      } else {
        throw new Error(
          'Unable to find a registered component for the given class.');
      }

      var upgradedEv = createEvent_('mdl-componentupgraded', true, false);
      element.dispatchEvent(upgradedEv);
    }
  }

  /**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */
  function upgradeElementsInternal(elements) {
    if (!Array.isArray(elements)) {
      if (elements instanceof Element) {
        elements = [elements];
      } else {
        elements = Array.prototype.slice.call(elements);
      }
    }
    for (var i = 0, n = elements.length, element; i < n; i++) {
      element = elements[i];
      if (element instanceof HTMLElement) {
        upgradeElementInternal(element);
        if (element.children.length > 0) {
          upgradeElementsInternal(element.children);
        }
      }
    }
  }

  /**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config
   */
  function registerInternal(config) {
    // In order to support both Closure-compiled and uncompiled code accessing
    // this method, we need to allow for both the dot and array syntax for
    // property access. You'll therefore see the `foo.bar || foo['bar']`
    // pattern repeated across this method.
    var widgetMissing = (typeof config.widget === 'undefined' &&
        typeof config['widget'] === 'undefined');
    var widget = true;

    if (!widgetMissing) {
      widget = config.widget || config['widget'];
    }

    var newConfig = /** @type {componentHandler.ComponentConfig} */ ({
      classConstructor: config.constructor || config['constructor'],
      className: config.classAsString || config['classAsString'],
      cssClass: config.cssClass || config['cssClass'],
      widget: widget,
      callbacks: []
    });

    registeredComponents_.forEach(function(item) {
      if (item.cssClass === newConfig.cssClass) {
        throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
      }
      if (item.className === newConfig.className) {
        throw new Error('The provided className has already been registered');
      }
    });

    if (config.constructor.prototype
        .hasOwnProperty(componentConfigProperty_)) {
      throw new Error(
          'MDL component classes must not have ' + componentConfigProperty_ +
          ' defined as a property.');
    }

    var found = findRegisteredClass_(config.classAsString, newConfig);

    if (!found) {
      registeredComponents_.push(newConfig);
    }
  }

  /**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */
  function registerUpgradedCallbackInternal(jsClass, callback) {
    var regClass = findRegisteredClass_(jsClass);
    if (regClass) {
      regClass.callbacks.push(callback);
    }
  }

  /**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */
  function upgradeAllRegisteredInternal() {
    for (var n = 0; n < registeredComponents_.length; n++) {
      upgradeDomInternal(registeredComponents_[n].className);
    }
  }

  /**
   * Check the component for the downgrade method.
   * Execute if found.
   * Remove component from createdComponents list.
   *
   * @param {?componentHandler.Component} component
   */
  function deconstructComponentInternal(component) {
    if (component) {
      var componentIndex = createdComponents_.indexOf(component);
      createdComponents_.splice(componentIndex, 1);

      var upgrades = component.element_.getAttribute('data-upgraded').split(',');
      var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
      upgrades.splice(componentPlace, 1);
      component.element_.setAttribute('data-upgraded', upgrades.join(','));

      var ev = createEvent_('mdl-componentdowngraded', true, false);
      component.element_.dispatchEvent(ev);
    }
  }

  /**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */
  function downgradeNodesInternal(nodes) {
    /**
     * Auxiliary function to downgrade a single node.
     * @param  {!Node} node the node to be downgraded
     */
    var downgradeNode = function(node) {
      createdComponents_.filter(function(item) {
        return item.element_ === node;
      }).forEach(deconstructComponentInternal);
    };
    if (nodes instanceof Array || nodes instanceof NodeList) {
      for (var n = 0; n < nodes.length; n++) {
        downgradeNode(nodes[n]);
      }
    } else if (nodes instanceof Node) {
      downgradeNode(nodes);
    } else {
      throw new Error('Invalid argument provided to downgrade MDL nodes.');
    }
  }

  // Now return the functions that should be made public with their publicly
  // facing names...
  return {
    upgradeDom: upgradeDomInternal,
    upgradeElement: upgradeElementInternal,
    upgradeElements: upgradeElementsInternal,
    upgradeAllRegistered: upgradeAllRegisteredInternal,
    registerUpgradedCallback: registerUpgradedCallbackInternal,
    register: registerInternal,
    downgradeElements: downgradeNodesInternal
  };
})();

/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: Function,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: (string|boolean|undefined)
 * }}
 */
componentHandler.ComponentConfigPublic;  // jshint ignore:line

/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: !Function,
 *   className: string,
 *   cssClass: string,
 *   widget: (string|boolean),
 *   callbacks: !Array<function(!HTMLElement)>
 * }}
 */
componentHandler.ComponentConfig;  // jshint ignore:line

/**
 * Created component (i.e., upgraded element) type as managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   element_: !HTMLElement,
 *   className: string,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: string
 * }}
 */
componentHandler.Component;  // jshint ignore:line

// Export all symbols, for the benefit of Closure compiler.
// No effect on uncompiled code.
componentHandler['upgradeDom'] = componentHandler.upgradeDom;
componentHandler['upgradeElement'] = componentHandler.upgradeElement;
componentHandler['upgradeElements'] = componentHandler.upgradeElements;
componentHandler['upgradeAllRegistered'] =
    componentHandler.upgradeAllRegistered;
componentHandler['registerUpgradedCallback'] =
    componentHandler.registerUpgradedCallback;
componentHandler['register'] = componentHandler.register;
componentHandler['downgradeElements'] = componentHandler.downgradeElements;
window.componentHandler = componentHandler;
window['componentHandler'] = componentHandler;

window.addEventListener('load', function() {
  'use strict';

  /**
   * Performs a "Cutting the mustard" test. If the browser supports the features
   * tested, adds a mdl-js class to the <html> element. It then upgrades all MDL
   * components requiring JavaScript.
   */
  if ('classList' in document.createElement('div') &&
      'querySelector' in document &&
      'addEventListener' in window && Array.prototype.forEach) {
    document.documentElement.classList.add('mdl-js');
    componentHandler.upgradeAllRegistered();
  } else {
    /**
     * Dummy function to avoid JS errors.
     */
    componentHandler.upgradeElement = function() {};
    /**
     * Dummy function to avoid JS errors.
     */
    componentHandler.register = function() {};
  }
});

// Source: https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
// MIT license
if (!Date.now) {
    /**
     * Date.now polyfill.
     * @return {number} the current Date
     */
    Date.now = function () {
        return new Date().getTime();
    };
    Date['now'] = Date.now;
}
var vendors = [
    'webkit',
    'moz'
];
for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    window['requestAnimationFrame'] = window.requestAnimationFrame;
    window['cancelAnimationFrame'] = window.cancelAnimationFrame;
}
if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    /**
     * requestAnimationFrame polyfill.
     * @param  {!Function} callback the callback function.
     */
    window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
            callback(lastTime = nextTime);
        }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
    window['requestAnimationFrame'] = window.requestAnimationFrame;
    window['cancelAnimationFrame'] = window.cancelAnimationFrame;
}
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Button MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialButton = function MaterialButton(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialButton'] = MaterialButton;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialButton.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialButton.prototype.CssClasses_ = {
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-button__ripple-container',
    RIPPLE: 'mdl-ripple'
};
/**
   * Handle blur of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialButton.prototype.blurHandler_ = function (event) {
    if (event) {
        this.element_.blur();
    }
};
// Public methods.
/**
   * Disable button.
   *
   * @public
   */
MaterialButton.prototype.disable = function () {
    this.element_.disabled = true;
};
MaterialButton.prototype['disable'] = MaterialButton.prototype.disable;
/**
   * Enable button.
   *
   * @public
   */
MaterialButton.prototype.enable = function () {
    this.element_.disabled = false;
};
MaterialButton.prototype['enable'] = MaterialButton.prototype.enable;
/**
   * Initialize element.
   */
MaterialButton.prototype.init = function () {
    if (this.element_) {
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleElement_ = document.createElement('span');
            this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
            rippleContainer.appendChild(this.rippleElement_);
            this.boundRippleBlurHandler = this.blurHandler_.bind(this);
            this.rippleElement_.addEventListener('mouseup', this.boundRippleBlurHandler);
            this.element_.appendChild(rippleContainer);
        }
        this.boundButtonBlurHandler = this.blurHandler_.bind(this);
        this.element_.addEventListener('mouseup', this.boundButtonBlurHandler);
        this.element_.addEventListener('mouseleave', this.boundButtonBlurHandler);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialButton,
    classAsString: 'MaterialButton',
    cssClass: 'mdl-js-button',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialCheckbox = function MaterialCheckbox(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialCheckbox'] = MaterialCheckbox;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialCheckbox.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialCheckbox.prototype.CssClasses_ = {
    INPUT: 'mdl-checkbox__input',
    BOX_OUTLINE: 'mdl-checkbox__box-outline',
    FOCUS_HELPER: 'mdl-checkbox__focus-helper',
    TICK_OUTLINE: 'mdl-checkbox__tick-outline',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-checkbox__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialCheckbox.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialCheckbox.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */
MaterialCheckbox.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialCheckbox.prototype['checkToggleState'] = MaterialCheckbox.prototype.checkToggleState;
/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */
MaterialCheckbox.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialCheckbox.prototype['checkDisabled'] = MaterialCheckbox.prototype.checkDisabled;
/**
   * Disable checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialCheckbox.prototype['disable'] = MaterialCheckbox.prototype.disable;
/**
   * Enable checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialCheckbox.prototype['enable'] = MaterialCheckbox.prototype.enable;
/**
   * Check checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.check = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialCheckbox.prototype['check'] = MaterialCheckbox.prototype.check;
/**
   * Uncheck checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.uncheck = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialCheckbox.prototype['uncheck'] = MaterialCheckbox.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialCheckbox.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        var boxOutline = document.createElement('span');
        boxOutline.classList.add(this.CssClasses_.BOX_OUTLINE);
        var tickContainer = document.createElement('span');
        tickContainer.classList.add(this.CssClasses_.FOCUS_HELPER);
        var tickOutline = document.createElement('span');
        tickOutline.classList.add(this.CssClasses_.TICK_OUTLINE);
        boxOutline.appendChild(tickOutline);
        this.element_.appendChild(tickContainer);
        this.element_.appendChild(boxOutline);
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.boundRippleMouseUp = this.onMouseUp_.bind(this);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundInputOnChange = this.onChange_.bind(this);
        this.boundInputOnFocus = this.onFocus_.bind(this);
        this.boundInputOnBlur = this.onBlur_.bind(this);
        this.boundElementMouseUp = this.onMouseUp_.bind(this);
        this.inputElement_.addEventListener('change', this.boundInputOnChange);
        this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
        this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
        this.element_.addEventListener('mouseup', this.boundElementMouseUp);
        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialCheckbox,
    classAsString: 'MaterialCheckbox',
    cssClass: 'mdl-js-checkbox',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for icon toggle MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialIconToggle = function MaterialIconToggle(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialIconToggle'] = MaterialIconToggle;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialIconToggle.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialIconToggle.prototype.CssClasses_ = {
    INPUT: 'mdl-icon-toggle__input',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-icon-toggle__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialIconToggle.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialIconToggle.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */
MaterialIconToggle.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialIconToggle.prototype['checkToggleState'] = MaterialIconToggle.prototype.checkToggleState;
/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */
MaterialIconToggle.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialIconToggle.prototype['checkDisabled'] = MaterialIconToggle.prototype.checkDisabled;
/**
   * Disable icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialIconToggle.prototype['disable'] = MaterialIconToggle.prototype.disable;
/**
   * Enable icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialIconToggle.prototype['enable'] = MaterialIconToggle.prototype.enable;
/**
   * Check icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.check = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialIconToggle.prototype['check'] = MaterialIconToggle.prototype.check;
/**
   * Uncheck icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.uncheck = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialIconToggle.prototype['uncheck'] = MaterialIconToggle.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialIconToggle.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        if (this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.boundRippleMouseUp = this.onMouseUp_.bind(this);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundInputOnChange = this.onChange_.bind(this);
        this.boundInputOnFocus = this.onFocus_.bind(this);
        this.boundInputOnBlur = this.onBlur_.bind(this);
        this.boundElementOnMouseUp = this.onMouseUp_.bind(this);
        this.inputElement_.addEventListener('change', this.boundInputOnChange);
        this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
        this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
        this.element_.addEventListener('mouseup', this.boundElementOnMouseUp);
        this.updateClasses_();
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialIconToggle,
    classAsString: 'MaterialIconToggle',
    cssClass: 'mdl-js-icon-toggle',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for dropdown MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialMenu = function MaterialMenu(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialMenu'] = MaterialMenu;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialMenu.prototype.Constant_ = {
    // Total duration of the menu animation.
    TRANSITION_DURATION_SECONDS: 0.3,
    // The fraction of the total duration we want to use for menu item animations.
    TRANSITION_DURATION_FRACTION: 0.8,
    // How long the menu stays open after choosing an option (so the user can see
    // the ripple).
    CLOSE_TIMEOUT: 150
};
/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
MaterialMenu.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP_ARROW: 38,
    DOWN_ARROW: 40
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialMenu.prototype.CssClasses_ = {
    CONTAINER: 'mdl-menu__container',
    OUTLINE: 'mdl-menu__outline',
    ITEM: 'mdl-menu__item',
    ITEM_RIPPLE_CONTAINER: 'mdl-menu__item-ripple-container',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    // Statuses
    IS_UPGRADED: 'is-upgraded',
    IS_VISIBLE: 'is-visible',
    IS_ANIMATING: 'is-animating',
    // Alignment options
    BOTTOM_LEFT: 'mdl-menu--bottom-left',
    // This is the default.
    BOTTOM_RIGHT: 'mdl-menu--bottom-right',
    TOP_LEFT: 'mdl-menu--top-left',
    TOP_RIGHT: 'mdl-menu--top-right',
    UNALIGNED: 'mdl-menu--unaligned'
};
/**
   * Initialize element.
   */
MaterialMenu.prototype.init = function () {
    if (this.element_) {
        // Create container for the menu.
        var container = document.createElement('div');
        container.classList.add(this.CssClasses_.CONTAINER);
        this.element_.parentElement.insertBefore(container, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        container.appendChild(this.element_);
        this.container_ = container;
        // Create outline for the menu (shadow and background).
        var outline = document.createElement('div');
        outline.classList.add(this.CssClasses_.OUTLINE);
        this.outline_ = outline;
        container.insertBefore(outline, this.element_);
        // Find the "for" element and bind events to it.
        var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
        var forEl = null;
        if (forElId) {
            forEl = document.getElementById(forElId);
            if (forEl) {
                this.forElement_ = forEl;
                forEl.addEventListener('click', this.handleForClick_.bind(this));
                forEl.addEventListener('keydown', this.handleForKeyboardEvent_.bind(this));
            }
        }
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        this.boundItemKeydown_ = this.handleItemKeyboardEvent_.bind(this);
        this.boundItemClick_ = this.handleItemClick_.bind(this);
        for (var i = 0; i < items.length; i++) {
            // Add a listener to each menu item.
            items[i].addEventListener('click', this.boundItemClick_);
            // Add a tab index to each menu item.
            items[i].tabIndex = '-1';
            // Add a keyboard listener to each menu item.
            items[i].addEventListener('keydown', this.boundItemKeydown_);
        }
        // Add ripple classes to each item, if the user has enabled ripples.
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            for (i = 0; i < items.length; i++) {
                var item = items[i];
                var rippleContainer = document.createElement('span');
                rippleContainer.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                rippleContainer.appendChild(ripple);
                item.appendChild(rippleContainer);
                item.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            }
        }
        // Copy alignment classes to the container, so the outline can use them.
        if (this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)) {
            this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT);
        }
        if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
            this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT);
        }
        if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
            this.outline_.classList.add(this.CssClasses_.TOP_LEFT);
        }
        if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
            this.outline_.classList.add(this.CssClasses_.TOP_RIGHT);
        }
        if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
            this.outline_.classList.add(this.CssClasses_.UNALIGNED);
        }
        container.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
/**
   * Handles a click on the "for" element, by positioning the menu and then
   * toggling it.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleForClick_ = function (evt) {
    if (this.element_ && this.forElement_) {
        var rect = this.forElement_.getBoundingClientRect();
        var forRect = this.forElement_.parentElement.getBoundingClientRect();
        if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
        } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
            // Position below the "for" element, aligned to its right.
            this.container_.style.right = forRect.right - rect.right + 'px';
            this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
            // Position above the "for" element, aligned to its left.
            this.container_.style.left = this.forElement_.offsetLeft + 'px';
            this.container_.style.bottom = forRect.bottom - rect.top + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
            // Position above the "for" element, aligned to its right.
            this.container_.style.right = forRect.right - rect.right + 'px';
            this.container_.style.bottom = forRect.bottom - rect.top + 'px';
        } else {
            // Default: position below the "for" element, aligned to its left.
            this.container_.style.left = this.forElement_.offsetLeft + 'px';
            this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
        }
    }
    this.toggle(evt);
};
/**
   * Handles a keyboard event on the "for" element.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleForKeyboardEvent_ = function (evt) {
    if (this.element_ && this.container_ && this.forElement_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
        if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
            if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                evt.preventDefault();
                items[items.length - 1].focus();
            } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                evt.preventDefault();
                items[0].focus();
            }
        }
    }
};
/**
   * Handles a keyboard event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleItemKeyboardEvent_ = function (evt) {
    if (this.element_ && this.container_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
        if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
            var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);
            if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                evt.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                } else {
                    items[items.length - 1].focus();
                }
            } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                evt.preventDefault();
                if (items.length > currentIndex + 1) {
                    items[currentIndex + 1].focus();
                } else {
                    items[0].focus();
                }
            } else if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
                evt.preventDefault();
                // Send mousedown and mouseup to trigger ripple.
                var e = new MouseEvent('mousedown');
                evt.target.dispatchEvent(e);
                e = new MouseEvent('mouseup');
                evt.target.dispatchEvent(e);
                // Send click.
                evt.target.click();
            } else if (evt.keyCode === this.Keycodes_.ESCAPE) {
                evt.preventDefault();
                this.hide();
            }
        }
    }
};
/**
   * Handles a click event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleItemClick_ = function (evt) {
    if (evt.target.hasAttribute('disabled')) {
        evt.stopPropagation();
    } else {
        // Wait some time before closing menu, so the user can see the ripple.
        this.closing_ = true;
        window.setTimeout(function (evt) {
            this.hide();
            this.closing_ = false;
        }.bind(this), this.Constant_.CLOSE_TIMEOUT);
    }
};
/**
   * Calculates the initial clip (for opening the menu) or final clip (for closing
   * it), and applies it. This allows us to animate from or to the correct point,
   * that is, the point it's aligned to in the "for" element.
   *
   * @param {number} height Height of the clip rectangle
   * @param {number} width Width of the clip rectangle
   * @private
   */
MaterialMenu.prototype.applyClip_ = function (height, width) {
    if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
        // Do not clip.
        this.element_.style.clip = '';
    } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
        // Clip to the top right corner of the menu.
        this.element_.style.clip = 'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
        // Clip to the bottom left corner of the menu.
        this.element_.style.clip = 'rect(' + height + 'px 0 ' + height + 'px 0)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
        // Clip to the bottom right corner of the menu.
        this.element_.style.clip = 'rect(' + height + 'px ' + width + 'px ' + height + 'px ' + width + 'px)';
    } else {
        // Default: do not clip (same as clipping to the top left corner).
        this.element_.style.clip = '';
    }
};
/**
   * Cleanup function to remove animation listeners.
   *
   * @param {Event} evt
   * @private
   */
MaterialMenu.prototype.removeAnimationEndListener_ = function (evt) {
    evt.target.classList.remove(MaterialMenu.prototype.CssClasses_.IS_ANIMATING);
};
/**
   * Adds an event listener to clean up after the animation ends.
   *
   * @private
   */
MaterialMenu.prototype.addAnimationEndListener_ = function () {
    this.element_.addEventListener('transitionend', this.removeAnimationEndListener_);
    this.element_.addEventListener('webkitTransitionEnd', this.removeAnimationEndListener_);
};
/**
   * Displays the menu.
   *
   * @public
   */
MaterialMenu.prototype.show = function (evt) {
    if (this.element_ && this.container_ && this.outline_) {
        // Measure the inner element.
        var height = this.element_.getBoundingClientRect().height;
        var width = this.element_.getBoundingClientRect().width;
        // Apply the inner element's size to the container and outline.
        this.container_.style.width = width + 'px';
        this.container_.style.height = height + 'px';
        this.outline_.style.width = width + 'px';
        this.outline_.style.height = height + 'px';
        var transitionDuration = this.Constant_.TRANSITION_DURATION_SECONDS * this.Constant_.TRANSITION_DURATION_FRACTION;
        // Calculate transition delays for individual menu items, so that they fade
        // in one at a time.
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        for (var i = 0; i < items.length; i++) {
            var itemDelay = null;
            if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT) || this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
                itemDelay = (height - items[i].offsetTop - items[i].offsetHeight) / height * transitionDuration + 's';
            } else {
                itemDelay = items[i].offsetTop / height * transitionDuration + 's';
            }
            items[i].style.transitionDelay = itemDelay;
        }
        // Apply the initial clip to the text before we start animating.
        this.applyClip_(height, width);
        // Wait for the next frame, turn on animation, and apply the final clip.
        // Also make it visible. This triggers the transitions.
        window.requestAnimationFrame(function () {
            this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
            this.element_.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
            this.container_.classList.add(this.CssClasses_.IS_VISIBLE);
        }.bind(this));
        // Clean up after the animation is complete.
        this.addAnimationEndListener_();
        // Add a click listener to the document, to close the menu.
        var callback = function (e) {
            // Check to see if the document is processing the same event that
            // displayed the menu in the first place. If so, do nothing.
            // Also check to see if the menu is in the process of closing itself, and
            // do nothing in that case.
            // Also check if the clicked element is a menu item
            // if so, do nothing.
            if (e !== evt && !this.closing_ && e.target.parentNode !== this.element_) {
                document.removeEventListener('click', callback);
                this.hide();
            }
        }.bind(this);
        document.addEventListener('click', callback);
    }
};
MaterialMenu.prototype['show'] = MaterialMenu.prototype.show;
/**
   * Hides the menu.
   *
   * @public
   */
MaterialMenu.prototype.hide = function () {
    if (this.element_ && this.container_ && this.outline_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        // Remove all transition delays; menu items fade out concurrently.
        for (var i = 0; i < items.length; i++) {
            items[i].style.removeProperty('transition-delay');
        }
        // Measure the inner element.
        var rect = this.element_.getBoundingClientRect();
        var height = rect.height;
        var width = rect.width;
        // Turn on animation, and apply the final clip. Also make invisible.
        // This triggers the transitions.
        this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
        this.applyClip_(height, width);
        this.container_.classList.remove(this.CssClasses_.IS_VISIBLE);
        // Clean up after the animation is complete.
        this.addAnimationEndListener_();
    }
};
MaterialMenu.prototype['hide'] = MaterialMenu.prototype.hide;
/**
   * Displays or hides the menu, depending on current state.
   *
   * @public
   */
MaterialMenu.prototype.toggle = function (evt) {
    if (this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
        this.hide();
    } else {
        this.show(evt);
    }
};
MaterialMenu.prototype['toggle'] = MaterialMenu.prototype.toggle;
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialMenu,
    classAsString: 'MaterialMenu',
    cssClass: 'mdl-js-menu',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Progress MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialProgress = function MaterialProgress(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialProgress'] = MaterialProgress;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialProgress.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialProgress.prototype.CssClasses_ = { INDETERMINATE_CLASS: 'mdl-progress__indeterminate' };
/**
   * Set the current progress of the progressbar.
   *
   * @param {number} p Percentage of the progress (0-100)
   * @public
   */
MaterialProgress.prototype.setProgress = function (p) {
    if (this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)) {
        return;
    }
    this.progressbar_.style.width = p + '%';
};
MaterialProgress.prototype['setProgress'] = MaterialProgress.prototype.setProgress;
/**
   * Set the current progress of the buffer.
   *
   * @param {number} p Percentage of the buffer (0-100)
   * @public
   */
MaterialProgress.prototype.setBuffer = function (p) {
    this.bufferbar_.style.width = p + '%';
    this.auxbar_.style.width = 100 - p + '%';
};
MaterialProgress.prototype['setBuffer'] = MaterialProgress.prototype.setBuffer;
/**
   * Initialize element.
   */
MaterialProgress.prototype.init = function () {
    if (this.element_) {
        var el = document.createElement('div');
        el.className = 'progressbar bar bar1';
        this.element_.appendChild(el);
        this.progressbar_ = el;
        el = document.createElement('div');
        el.className = 'bufferbar bar bar2';
        this.element_.appendChild(el);
        this.bufferbar_ = el;
        el = document.createElement('div');
        el.className = 'auxbar bar bar3';
        this.element_.appendChild(el);
        this.auxbar_ = el;
        this.progressbar_.style.width = '0%';
        this.bufferbar_.style.width = '100%';
        this.auxbar_.style.width = '0%';
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialProgress,
    classAsString: 'MaterialProgress',
    cssClass: 'mdl-js-progress',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Radio MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialRadio = function MaterialRadio(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialRadio'] = MaterialRadio;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialRadio.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialRadio.prototype.CssClasses_ = {
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded',
    JS_RADIO: 'mdl-js-radio',
    RADIO_BTN: 'mdl-radio__button',
    RADIO_OUTER_CIRCLE: 'mdl-radio__outer-circle',
    RADIO_INNER_CIRCLE: 'mdl-radio__inner-circle',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-radio__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onChange_ = function (event) {
    // Since other radio buttons don't get change events, we need to look for
    // them to update their classes.
    var radios = document.getElementsByClassName(this.CssClasses_.JS_RADIO);
    for (var i = 0; i < radios.length; i++) {
        var button = radios[i].querySelector('.' + this.CssClasses_.RADIO_BTN);
        // Different name == different group, so no point updating those.
        if (button.getAttribute('name') === this.btnElement_.getAttribute('name')) {
            if (typeof radios[i]['MaterialRadio'] !== 'undefined') {
                radios[i]['MaterialRadio'].updateClasses_();
            }
        }
    }
};
/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onMouseup_ = function (event) {
    this.blur_();
};
/**
   * Update classes.
   *
   * @private
   */
MaterialRadio.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialRadio.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.btnElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */
MaterialRadio.prototype.checkDisabled = function () {
    if (this.btnElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialRadio.prototype['checkDisabled'] = MaterialRadio.prototype.checkDisabled;
/**
   * Check the components toggled state.
   *
   * @public
   */
MaterialRadio.prototype.checkToggleState = function () {
    if (this.btnElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialRadio.prototype['checkToggleState'] = MaterialRadio.prototype.checkToggleState;
/**
   * Disable radio.
   *
   * @public
   */
MaterialRadio.prototype.disable = function () {
    this.btnElement_.disabled = true;
    this.updateClasses_();
};
MaterialRadio.prototype['disable'] = MaterialRadio.prototype.disable;
/**
   * Enable radio.
   *
   * @public
   */
MaterialRadio.prototype.enable = function () {
    this.btnElement_.disabled = false;
    this.updateClasses_();
};
MaterialRadio.prototype['enable'] = MaterialRadio.prototype.enable;
/**
   * Check radio.
   *
   * @public
   */
MaterialRadio.prototype.check = function () {
    this.btnElement_.checked = true;
    this.onChange_(null);
};
MaterialRadio.prototype['check'] = MaterialRadio.prototype.check;
/**
   * Uncheck radio.
   *
   * @public
   */
MaterialRadio.prototype.uncheck = function () {
    this.btnElement_.checked = false;
    this.onChange_(null);
};
MaterialRadio.prototype['uncheck'] = MaterialRadio.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialRadio.prototype.init = function () {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector('.' + this.CssClasses_.RADIO_BTN);
        this.boundChangeHandler_ = this.onChange_.bind(this);
        this.boundFocusHandler_ = this.onChange_.bind(this);
        this.boundBlurHandler_ = this.onBlur_.bind(this);
        this.boundMouseUpHandler_ = this.onMouseup_.bind(this);
        var outerCircle = document.createElement('span');
        outerCircle.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);
        var innerCircle = document.createElement('span');
        innerCircle.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE);
        this.element_.appendChild(outerCircle);
        this.element_.appendChild(innerCircle);
        var rippleContainer;
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            rippleContainer = document.createElement('span');
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CENTER);
            rippleContainer.addEventListener('mouseup', this.boundMouseUpHandler_);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            rippleContainer.appendChild(ripple);
            this.element_.appendChild(rippleContainer);
        }
        this.btnElement_.addEventListener('change', this.boundChangeHandler_);
        this.btnElement_.addEventListener('focus', this.boundFocusHandler_);
        this.btnElement_.addEventListener('blur', this.boundBlurHandler_);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler_);
        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialRadio,
    classAsString: 'MaterialRadio',
    cssClass: 'mdl-js-radio',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Slider MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSlider = function MaterialSlider(element) {
    this.element_ = element;
    // Browser feature detection.
    this.isIE_ = window.navigator.msPointerEnabled;
    // Initialize instance.
    this.init();
};
window['MaterialSlider'] = MaterialSlider;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSlider.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSlider.prototype.CssClasses_ = {
    IE_CONTAINER: 'mdl-slider__ie-container',
    SLIDER_CONTAINER: 'mdl-slider__container',
    BACKGROUND_FLEX: 'mdl-slider__background-flex',
    BACKGROUND_LOWER: 'mdl-slider__background-lower',
    BACKGROUND_UPPER: 'mdl-slider__background-upper',
    IS_LOWEST_VALUE: 'is-lowest-value',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Handle input on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onInput_ = function (event) {
    this.updateValueStyles_();
};
/**
   * Handle change on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onChange_ = function (event) {
    this.updateValueStyles_();
};
/**
   * Handle mouseup on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onMouseUp_ = function (event) {
    event.target.blur();
};
/**
   * Handle mousedown on container element.
   * This handler is purpose is to not require the use to click
   * exactly on the 2px slider element, as FireFox seems to be very
   * strict about this.
   *
   * @param {Event} event The event that fired.
   * @private
   * @suppress {missingProperties}
   */
MaterialSlider.prototype.onContainerMouseDown_ = function (event) {
    // If this click is not on the parent element (but rather some child)
    // ignore. It may still bubble up.
    if (event.target !== this.element_.parentElement) {
        return;
    }
    // Discard the original event and create a new event that
    // is on the slider element.
    event.preventDefault();
    var newEvent = new MouseEvent('mousedown', {
        target: event.target,
        buttons: event.buttons,
        clientX: event.clientX,
        clientY: this.element_.getBoundingClientRect().y
    });
    this.element_.dispatchEvent(newEvent);
};
/**
   * Handle updating of values.
   *
   * @private
   */
MaterialSlider.prototype.updateValueStyles_ = function () {
    // Calculate and apply percentages to div structure behind slider.
    var fraction = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
    if (fraction === 0) {
        this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);
    }
    if (!this.isIE_) {
        this.backgroundLower_.style.flex = fraction;
        this.backgroundLower_.style.webkitFlex = fraction;
        this.backgroundUpper_.style.flex = 1 - fraction;
        this.backgroundUpper_.style.webkitFlex = 1 - fraction;
    }
};
// Public methods.
/**
   * Disable slider.
   *
   * @public
   */
MaterialSlider.prototype.disable = function () {
    this.element_.disabled = true;
};
MaterialSlider.prototype['disable'] = MaterialSlider.prototype.disable;
/**
   * Enable slider.
   *
   * @public
   */
MaterialSlider.prototype.enable = function () {
    this.element_.disabled = false;
};
MaterialSlider.prototype['enable'] = MaterialSlider.prototype.enable;
/**
   * Update slider value.
   *
   * @param {number} value The value to which to set the control (optional).
   * @public
   */
MaterialSlider.prototype.change = function (value) {
    if (typeof value !== 'undefined') {
        this.element_.value = value;
    }
    this.updateValueStyles_();
};
MaterialSlider.prototype['change'] = MaterialSlider.prototype.change;
/**
   * Initialize element.
   */
MaterialSlider.prototype.init = function () {
    if (this.element_) {
        if (this.isIE_) {
            // Since we need to specify a very large height in IE due to
            // implementation limitations, we add a parent here that trims it down to
            // a reasonable size.
            var containerIE = document.createElement('div');
            containerIE.classList.add(this.CssClasses_.IE_CONTAINER);
            this.element_.parentElement.insertBefore(containerIE, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            containerIE.appendChild(this.element_);
        } else {
            // For non-IE browsers, we need a div structure that sits behind the
            // slider and allows us to style the left and right sides of it with
            // different colors.
            var container = document.createElement('div');
            container.classList.add(this.CssClasses_.SLIDER_CONTAINER);
            this.element_.parentElement.insertBefore(container, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            container.appendChild(this.element_);
            var backgroundFlex = document.createElement('div');
            backgroundFlex.classList.add(this.CssClasses_.BACKGROUND_FLEX);
            container.appendChild(backgroundFlex);
            this.backgroundLower_ = document.createElement('div');
            this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER);
            backgroundFlex.appendChild(this.backgroundLower_);
            this.backgroundUpper_ = document.createElement('div');
            this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER);
            backgroundFlex.appendChild(this.backgroundUpper_);
        }
        this.boundInputHandler = this.onInput_.bind(this);
        this.boundChangeHandler = this.onChange_.bind(this);
        this.boundMouseUpHandler = this.onMouseUp_.bind(this);
        this.boundContainerMouseDownHandler = this.onContainerMouseDown_.bind(this);
        this.element_.addEventListener('input', this.boundInputHandler);
        this.element_.addEventListener('change', this.boundChangeHandler);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
        this.element_.parentElement.addEventListener('mousedown', this.boundContainerMouseDownHandler);
        this.updateValueStyles_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSlider,
    classAsString: 'MaterialSlider',
    cssClass: 'mdl-js-slider',
    widget: true
});
/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Snackbar MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSnackbar = function MaterialSnackbar(element) {
    this.element_ = element;
    this.textElement_ = this.element_.querySelector('.' + this.cssClasses_.MESSAGE);
    this.actionElement_ = this.element_.querySelector('.' + this.cssClasses_.ACTION);
    if (!this.textElement_) {
        throw new Error('There must be a message element for a snackbar.');
    }
    if (!this.actionElement_) {
        throw new Error('There must be an action element for a snackbar.');
    }
    this.active = false;
    this.actionHandler_ = undefined;
    this.message_ = undefined;
    this.actionText_ = undefined;
    this.queuedNotifications_ = [];
    this.setActionHidden_(true);
};
window['MaterialSnackbar'] = MaterialSnackbar;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSnackbar.prototype.Constant_ = {
    // The duration of the snackbar show/hide animation, in ms.
    ANIMATION_LENGTH: 250
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSnackbar.prototype.cssClasses_ = {
    SNACKBAR: 'mdl-snackbar',
    MESSAGE: 'mdl-snackbar__text',
    ACTION: 'mdl-snackbar__action',
    ACTIVE: 'mdl-snackbar--active'
};
/**
   * Display the snackbar.
   *
   * @private
   */
MaterialSnackbar.prototype.displaySnackbar_ = function () {
    this.element_.setAttribute('aria-hidden', 'true');
    if (this.actionHandler_) {
        this.actionElement_.textContent = this.actionText_;
        this.actionElement_.addEventListener('click', this.actionHandler_);
        this.setActionHidden_(false);
    }
    this.textElement_.textContent = this.message_;
    this.element_.classList.add(this.cssClasses_.ACTIVE);
    this.element_.setAttribute('aria-hidden', 'false');
    setTimeout(this.cleanup_.bind(this), this.timeout_);
};
/**
   * Show the snackbar.
   *
   * @param {Object} data The data for the notification.
   * @public
   */
MaterialSnackbar.prototype.showSnackbar = function (data) {
    if (data === undefined) {
        throw new Error('Please provide a data object with at least a message to display.');
    }
    if (data['message'] === undefined) {
        throw new Error('Please provide a message to be displayed.');
    }
    if (data['actionHandler'] && !data['actionText']) {
        throw new Error('Please provide action text with the handler.');
    }
    if (this.active) {
        this.queuedNotifications_.push(data);
    } else {
        this.active = true;
        this.message_ = data['message'];
        if (data['timeout']) {
            this.timeout_ = data['timeout'];
        } else {
            this.timeout_ = 2750;
        }
        if (data['actionHandler']) {
            this.actionHandler_ = data['actionHandler'];
        }
        if (data['actionText']) {
            this.actionText_ = data['actionText'];
        }
        this.displaySnackbar_();
    }
};
MaterialSnackbar.prototype['showSnackbar'] = MaterialSnackbar.prototype.showSnackbar;
/**
   * Check if the queue has items within it.
   * If it does, display the next entry.
   *
   * @private
   */
MaterialSnackbar.prototype.checkQueue_ = function () {
    if (this.queuedNotifications_.length > 0) {
        this.showSnackbar(this.queuedNotifications_.shift());
    }
};
/**
   * Cleanup the snackbar event listeners and accessiblity attributes.
   *
   * @private
   */
MaterialSnackbar.prototype.cleanup_ = function () {
    this.element_.classList.remove(this.cssClasses_.ACTIVE);
    setTimeout(function () {
        this.element_.setAttribute('aria-hidden', 'true');
        this.textElement_.textContent = '';
        if (!Boolean(this.actionElement_.getAttribute('aria-hidden'))) {
            this.setActionHidden_(true);
            this.actionElement_.textContent = '';
            this.actionElement_.removeEventListener('click', this.actionHandler_);
        }
        this.actionHandler_ = undefined;
        this.message_ = undefined;
        this.actionText_ = undefined;
        this.active = false;
        this.checkQueue_();
    }.bind(this), this.Constant_.ANIMATION_LENGTH);
};
/**
   * Set the action handler hidden state.
   *
   * @param {boolean} value
   * @private
   */
MaterialSnackbar.prototype.setActionHidden_ = function (value) {
    if (value) {
        this.actionElement_.setAttribute('aria-hidden', 'true');
    } else {
        this.actionElement_.removeAttribute('aria-hidden');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSnackbar,
    classAsString: 'MaterialSnackbar',
    cssClass: 'mdl-js-snackbar',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Spinner MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   * @constructor
   */
var MaterialSpinner = function MaterialSpinner(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialSpinner'] = MaterialSpinner;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSpinner.prototype.Constant_ = { MDL_SPINNER_LAYER_COUNT: 4 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSpinner.prototype.CssClasses_ = {
    MDL_SPINNER_LAYER: 'mdl-spinner__layer',
    MDL_SPINNER_CIRCLE_CLIPPER: 'mdl-spinner__circle-clipper',
    MDL_SPINNER_CIRCLE: 'mdl-spinner__circle',
    MDL_SPINNER_GAP_PATCH: 'mdl-spinner__gap-patch',
    MDL_SPINNER_LEFT: 'mdl-spinner__left',
    MDL_SPINNER_RIGHT: 'mdl-spinner__right'
};
/**
   * Auxiliary method to create a spinner layer.
   *
   * @param {number} index Index of the layer to be created.
   * @public
   */
MaterialSpinner.prototype.createLayer = function (index) {
    var layer = document.createElement('div');
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER + '-' + index);
    var leftClipper = document.createElement('div');
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);
    var gapPatch = document.createElement('div');
    gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);
    var rightClipper = document.createElement('div');
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);
    var circleOwners = [
        leftClipper,
        gapPatch,
        rightClipper
    ];
    for (var i = 0; i < circleOwners.length; i++) {
        var circle = document.createElement('div');
        circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);
        circleOwners[i].appendChild(circle);
    }
    layer.appendChild(leftClipper);
    layer.appendChild(gapPatch);
    layer.appendChild(rightClipper);
    this.element_.appendChild(layer);
};
MaterialSpinner.prototype['createLayer'] = MaterialSpinner.prototype.createLayer;
/**
   * Stops the spinner animation.
   * Public method for users who need to stop the spinner for any reason.
   *
   * @public
   */
MaterialSpinner.prototype.stop = function () {
    this.element_.classList.remove('is-active');
};
MaterialSpinner.prototype['stop'] = MaterialSpinner.prototype.stop;
/**
   * Starts the spinner animation.
   * Public method for users who need to manually start the spinner for any reason
   * (instead of just adding the 'is-active' class to their markup).
   *
   * @public
   */
MaterialSpinner.prototype.start = function () {
    this.element_.classList.add('is-active');
};
MaterialSpinner.prototype['start'] = MaterialSpinner.prototype.start;
/**
   * Initialize element.
   */
MaterialSpinner.prototype.init = function () {
    if (this.element_) {
        for (var i = 1; i <= this.Constant_.MDL_SPINNER_LAYER_COUNT; i++) {
            this.createLayer(i);
        }
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSpinner,
    classAsString: 'MaterialSpinner',
    cssClass: 'mdl-js-spinner',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSwitch = function MaterialSwitch(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialSwitch'] = MaterialSwitch;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSwitch.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSwitch.prototype.CssClasses_ = {
    INPUT: 'mdl-switch__input',
    TRACK: 'mdl-switch__track',
    THUMB: 'mdl-switch__thumb',
    FOCUS_HELPER: 'mdl-switch__focus-helper',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-switch__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialSwitch.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialSwitch.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */
MaterialSwitch.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialSwitch.prototype['checkDisabled'] = MaterialSwitch.prototype.checkDisabled;
/**
   * Check the components toggled state.
   *
   * @public
   */
MaterialSwitch.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialSwitch.prototype['checkToggleState'] = MaterialSwitch.prototype.checkToggleState;
/**
   * Disable switch.
   *
   * @public
   */
MaterialSwitch.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialSwitch.prototype['disable'] = MaterialSwitch.prototype.disable;
/**
   * Enable switch.
   *
   * @public
   */
MaterialSwitch.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialSwitch.prototype['enable'] = MaterialSwitch.prototype.enable;
/**
   * Activate switch.
   *
   * @public
   */
MaterialSwitch.prototype.on = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialSwitch.prototype['on'] = MaterialSwitch.prototype.on;
/**
   * Deactivate switch.
   *
   * @public
   */
MaterialSwitch.prototype.off = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialSwitch.prototype['off'] = MaterialSwitch.prototype.off;
/**
   * Initialize element.
   */
MaterialSwitch.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        var track = document.createElement('div');
        track.classList.add(this.CssClasses_.TRACK);
        var thumb = document.createElement('div');
        thumb.classList.add(this.CssClasses_.THUMB);
        var focusHelper = document.createElement('span');
        focusHelper.classList.add(this.CssClasses_.FOCUS_HELPER);
        thumb.appendChild(focusHelper);
        this.element_.appendChild(track);
        this.element_.appendChild(thumb);
        this.boundMouseUpHandler = this.onMouseUp_.bind(this);
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundMouseUpHandler);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundChangeHandler = this.onChange_.bind(this);
        this.boundFocusHandler = this.onFocus_.bind(this);
        this.boundBlurHandler = this.onBlur_.bind(this);
        this.inputElement_.addEventListener('change', this.boundChangeHandler);
        this.inputElement_.addEventListener('focus', this.boundFocusHandler);
        this.inputElement_.addEventListener('blur', this.boundBlurHandler);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
        this.updateClasses_();
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSwitch,
    classAsString: 'MaterialSwitch',
    cssClass: 'mdl-js-switch',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Tabs MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
var MaterialTabs = function MaterialTabs(element) {
    // Stores the HTML element.
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialTabs'] = MaterialTabs;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string}
   * @private
   */
MaterialTabs.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTabs.prototype.CssClasses_ = {
    TAB_CLASS: 'mdl-tabs__tab',
    PANEL_CLASS: 'mdl-tabs__panel',
    ACTIVE_CLASS: 'is-active',
    UPGRADED_CLASS: 'is-upgraded',
    MDL_JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    MDL_RIPPLE_CONTAINER: 'mdl-tabs__ripple-container',
    MDL_RIPPLE: 'mdl-ripple',
    MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events'
};
/**
   * Handle clicks to a tabs component
   *
   * @private
   */
MaterialTabs.prototype.initTabs_ = function () {
    if (this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);
    }
    // Select element tabs, document panels
    this.tabs_ = this.element_.querySelectorAll('.' + this.CssClasses_.TAB_CLASS);
    this.panels_ = this.element_.querySelectorAll('.' + this.CssClasses_.PANEL_CLASS);
    // Create new tabs for each tab element
    for (var i = 0; i < this.tabs_.length; i++) {
        new MaterialTab(this.tabs_[i], this);
    }
    this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS);
};
/**
   * Reset tab state, dropping active classes
   *
   * @private
   */
MaterialTabs.prototype.resetTabState_ = function () {
    for (var k = 0; k < this.tabs_.length; k++) {
        this.tabs_[k].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
};
/**
   * Reset panel state, droping active classes
   *
   * @private
   */
MaterialTabs.prototype.resetPanelState_ = function () {
    for (var j = 0; j < this.panels_.length; j++) {
        this.panels_[j].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
};
/**
   * Initialize element.
   */
MaterialTabs.prototype.init = function () {
    if (this.element_) {
        this.initTabs_();
    }
};
/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {Element} tab The HTML element for the tab.
   * @param {MaterialTabs} ctx The MaterialTabs object that owns the tab.
   */
function MaterialTab(tab, ctx) {
    if (tab) {
        if (ctx.element_.classList.contains(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(ctx.CssClasses_.MDL_RIPPLE_CONTAINER);
            rippleContainer.classList.add(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT);
            var ripple = document.createElement('span');
            ripple.classList.add(ctx.CssClasses_.MDL_RIPPLE);
            rippleContainer.appendChild(ripple);
            tab.appendChild(rippleContainer);
        }
        tab.addEventListener('click', function (e) {
            if (tab.getAttribute('href').charAt(0) === '#') {
                e.preventDefault();
                var href = tab.href.split('#')[1];
                var panel = ctx.element_.querySelector('#' + href);
                ctx.resetTabState_();
                ctx.resetPanelState_();
                tab.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
                panel.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
            }
        });
    }
}
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTabs,
    classAsString: 'MaterialTabs',
    cssClass: 'mdl-js-tabs'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Textfield MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialTextfield = function MaterialTextfield(element) {
    this.element_ = element;
    this.maxRows = this.Constant_.NO_MAX_ROWS;
    // Initialize instance.
    this.init();
};
window['MaterialTextfield'] = MaterialTextfield;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialTextfield.prototype.Constant_ = {
    NO_MAX_ROWS: -1,
    MAX_ROWS_ATTRIBUTE: 'maxrows'
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTextfield.prototype.CssClasses_ = {
    LABEL: 'mdl-textfield__label',
    INPUT: 'mdl-textfield__input',
    IS_DIRTY: 'is-dirty',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_INVALID: 'is-invalid',
    IS_UPGRADED: 'is-upgraded',
    HAS_PLACEHOLDER: 'has-placeholder'
};
/**
   * Handle input being entered.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onKeyDown_ = function (event) {
    var currentRowCount = event.target.value.split('\n').length;
    if (event.keyCode === 13) {
        if (currentRowCount >= this.maxRows) {
            event.preventDefault();
        }
    }
};
/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle reset event from out side.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onReset_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialTextfield.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkValidity();
    this.checkDirty();
    this.checkFocus();
};
// Public methods.
/**
   * Check the disabled state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkDisabled = function () {
    if (this.input_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialTextfield.prototype['checkDisabled'] = MaterialTextfield.prototype.checkDisabled;
/**
  * Check the focus state and update field accordingly.
  *
  * @public
  */
MaterialTextfield.prototype.checkFocus = function () {
    if (Boolean(this.element_.querySelector(':focus'))) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    }
};
MaterialTextfield.prototype['checkFocus'] = MaterialTextfield.prototype.checkFocus;
/**
   * Check the validity state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkValidity = function () {
    if (this.input_.validity) {
        if (this.input_.validity.valid) {
            this.element_.classList.remove(this.CssClasses_.IS_INVALID);
        } else {
            this.element_.classList.add(this.CssClasses_.IS_INVALID);
        }
    }
};
MaterialTextfield.prototype['checkValidity'] = MaterialTextfield.prototype.checkValidity;
/**
   * Check the dirty state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkDirty = function () {
    if (this.input_.value && this.input_.value.length > 0) {
        this.element_.classList.add(this.CssClasses_.IS_DIRTY);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
    }
};
MaterialTextfield.prototype['checkDirty'] = MaterialTextfield.prototype.checkDirty;
/**
   * Disable text field.
   *
   * @public
   */
MaterialTextfield.prototype.disable = function () {
    this.input_.disabled = true;
    this.updateClasses_();
};
MaterialTextfield.prototype['disable'] = MaterialTextfield.prototype.disable;
/**
   * Enable text field.
   *
   * @public
   */
MaterialTextfield.prototype.enable = function () {
    this.input_.disabled = false;
    this.updateClasses_();
};
MaterialTextfield.prototype['enable'] = MaterialTextfield.prototype.enable;
/**
   * Update text field value.
   *
   * @param {string} value The value to which to set the control (optional).
   * @public
   */
MaterialTextfield.prototype.change = function (value) {
    this.input_.value = value || '';
    this.updateClasses_();
};
MaterialTextfield.prototype['change'] = MaterialTextfield.prototype.change;
/**
   * Initialize element.
   */
MaterialTextfield.prototype.init = function () {
    if (this.element_) {
        this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
        this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        if (this.input_) {
            if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
                this.maxRows = parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
                if (isNaN(this.maxRows)) {
                    this.maxRows = this.Constant_.NO_MAX_ROWS;
                }
            }
            if (this.input_.hasAttribute('placeholder')) {
                this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);
            }
            this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
            this.boundFocusHandler = this.onFocus_.bind(this);
            this.boundBlurHandler = this.onBlur_.bind(this);
            this.boundResetHandler = this.onReset_.bind(this);
            this.input_.addEventListener('input', this.boundUpdateClassesHandler);
            this.input_.addEventListener('focus', this.boundFocusHandler);
            this.input_.addEventListener('blur', this.boundBlurHandler);
            this.input_.addEventListener('reset', this.boundResetHandler);
            if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
                // TODO: This should handle pasting multi line text.
                // Currently doesn't.
                this.boundKeyDownHandler = this.onKeyDown_.bind(this);
                this.input_.addEventListener('keydown', this.boundKeyDownHandler);
            }
            var invalid = this.element_.classList.contains(this.CssClasses_.IS_INVALID);
            this.updateClasses_();
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
            if (invalid) {
                this.element_.classList.add(this.CssClasses_.IS_INVALID);
            }
            if (this.input_.hasAttribute('autofocus')) {
                this.element_.focus();
                this.checkFocus();
            }
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTextfield,
    classAsString: 'MaterialTextfield',
    cssClass: 'mdl-js-textfield',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Tooltip MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialTooltip = function MaterialTooltip(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialTooltip'] = MaterialTooltip;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialTooltip.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTooltip.prototype.CssClasses_ = {
    IS_ACTIVE: 'is-active',
    BOTTOM: 'mdl-tooltip--bottom',
    LEFT: 'mdl-tooltip--left',
    RIGHT: 'mdl-tooltip--right',
    TOP: 'mdl-tooltip--top'
};
/**
   * Handle mouseenter for tooltip.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTooltip.prototype.handleMouseEnter_ = function (event) {
    var props = event.target.getBoundingClientRect();
    var left = props.left + props.width / 2;
    var top = props.top + props.height / 2;
    var marginLeft = -1 * (this.element_.offsetWidth / 2);
    var marginTop = -1 * (this.element_.offsetHeight / 2);
    if (this.element_.classList.contains(this.CssClasses_.LEFT) || this.element_.classList.contains(this.CssClasses_.RIGHT)) {
        left = props.width / 2;
        if (top + marginTop < 0) {
            this.element_.style.top = '0';
            this.element_.style.marginTop = '0';
        } else {
            this.element_.style.top = top + 'px';
            this.element_.style.marginTop = marginTop + 'px';
        }
    } else {
        if (left + marginLeft < 0) {
            this.element_.style.left = '0';
            this.element_.style.marginLeft = '0';
        } else {
            this.element_.style.left = left + 'px';
            this.element_.style.marginLeft = marginLeft + 'px';
        }
    }
    if (this.element_.classList.contains(this.CssClasses_.TOP)) {
        this.element_.style.top = props.top - this.element_.offsetHeight - 10 + 'px';
    } else if (this.element_.classList.contains(this.CssClasses_.RIGHT)) {
        this.element_.style.left = props.left + props.width + 10 + 'px';
    } else if (this.element_.classList.contains(this.CssClasses_.LEFT)) {
        this.element_.style.left = props.left - this.element_.offsetWidth - 10 + 'px';
    } else {
        this.element_.style.top = props.top + props.height + 10 + 'px';
    }
    this.element_.classList.add(this.CssClasses_.IS_ACTIVE);
};
/**
   * Hide tooltip on mouseleave or scroll
   *
   * @private
   */
MaterialTooltip.prototype.hideTooltip_ = function () {
    this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);
};
/**
   * Initialize element.
   */
MaterialTooltip.prototype.init = function () {
    if (this.element_) {
        var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
        if (forElId) {
            this.forElement_ = document.getElementById(forElId);
        }
        if (this.forElement_) {
            // It's left here because it prevents accidental text selection on Android
            if (!this.forElement_.hasAttribute('tabindex')) {
                this.forElement_.setAttribute('tabindex', '0');
            }
            this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
            this.boundMouseLeaveAndScrollHandler = this.hideTooltip_.bind(this);
            this.forElement_.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
            this.forElement_.addEventListener('touchend', this.boundMouseEnterHandler, false);
            this.forElement_.addEventListener('mouseleave', this.boundMouseLeaveAndScrollHandler, false);
            window.addEventListener('scroll', this.boundMouseLeaveAndScrollHandler, true);
            window.addEventListener('touchstart', this.boundMouseLeaveAndScrollHandler);
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTooltip,
    classAsString: 'MaterialTooltip',
    cssClass: 'mdl-tooltip'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Layout MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialLayout = function MaterialLayout(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialLayout'] = MaterialLayout;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialLayout.prototype.Constant_ = {
    MAX_WIDTH: '(max-width: 1024px)',
    TAB_SCROLL_PIXELS: 100,
    RESIZE_TIMEOUT: 100,
    MENU_ICON: '&#xE5D2;',
    CHEVRON_LEFT: 'chevron_left',
    CHEVRON_RIGHT: 'chevron_right'
};
/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
MaterialLayout.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32
};
/**
   * Modes.
   *
   * @enum {number}
   * @private
   */
MaterialLayout.prototype.Mode_ = {
    STANDARD: 0,
    SEAMED: 1,
    WATERFALL: 2,
    SCROLL: 3
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialLayout.prototype.CssClasses_ = {
    CONTAINER: 'mdl-layout__container',
    HEADER: 'mdl-layout__header',
    DRAWER: 'mdl-layout__drawer',
    CONTENT: 'mdl-layout__content',
    DRAWER_BTN: 'mdl-layout__drawer-button',
    ICON: 'material-icons',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-layout__tab-ripple-container',
    RIPPLE: 'mdl-ripple',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    HEADER_SEAMED: 'mdl-layout__header--seamed',
    HEADER_WATERFALL: 'mdl-layout__header--waterfall',
    HEADER_SCROLL: 'mdl-layout__header--scroll',
    FIXED_HEADER: 'mdl-layout--fixed-header',
    OBFUSCATOR: 'mdl-layout__obfuscator',
    TAB_BAR: 'mdl-layout__tab-bar',
    TAB_CONTAINER: 'mdl-layout__tab-bar-container',
    TAB: 'mdl-layout__tab',
    TAB_BAR_BUTTON: 'mdl-layout__tab-bar-button',
    TAB_BAR_LEFT_BUTTON: 'mdl-layout__tab-bar-left-button',
    TAB_BAR_RIGHT_BUTTON: 'mdl-layout__tab-bar-right-button',
    TAB_MANUAL_SWITCH: 'mdl-layout__tab-manual-switch',
    PANEL: 'mdl-layout__tab-panel',
    HAS_DRAWER: 'has-drawer',
    HAS_TABS: 'has-tabs',
    HAS_SCROLLING_HEADER: 'has-scrolling-header',
    CASTING_SHADOW: 'is-casting-shadow',
    IS_COMPACT: 'is-compact',
    IS_SMALL_SCREEN: 'is-small-screen',
    IS_DRAWER_OPEN: 'is-visible',
    IS_ACTIVE: 'is-active',
    IS_UPGRADED: 'is-upgraded',
    IS_ANIMATING: 'is-animating',
    ON_LARGE_SCREEN: 'mdl-layout--large-screen-only',
    ON_SMALL_SCREEN: 'mdl-layout--small-screen-only'
};
/**
   * Handles scrolling on the content.
   *
   * @private
   */
MaterialLayout.prototype.contentScrollHandler_ = function () {
    if (this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)) {
        return;
    }
    var headerVisible = !this.element_.classList.contains(this.CssClasses_.IS_SMALL_SCREEN) || this.element_.classList.contains(this.CssClasses_.FIXED_HEADER);
    if (this.content_.scrollTop > 0 && !this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
        this.header_.classList.add(this.CssClasses_.IS_COMPACT);
        if (headerVisible) {
            this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
        }
    } else if (this.content_.scrollTop <= 0 && this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
        this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
        if (headerVisible) {
            this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
        }
    }
};
/**
   * Handles a keyboard event on the drawer.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialLayout.prototype.keyboardEventHandler_ = function (evt) {
    // Only react when the drawer is open.
    if (evt.keyCode === this.Keycodes_.ESCAPE && this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
        this.toggleDrawer();
    }
};
/**
   * Handles changes in screen size.
   *
   * @private
   */
MaterialLayout.prototype.screenSizeHandler_ = function () {
    if (this.screenSizeMediaQuery_.matches) {
        this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);
        // Collapse drawer (if any) when moving to a large screen size.
        if (this.drawer_) {
            this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
            this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
        }
    }
};
/**
   * Handles events of drawer button.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialLayout.prototype.drawerToggleHandler_ = function (evt) {
    if (evt && evt.type === 'keydown') {
        if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
            // prevent scrolling in drawer nav
            evt.preventDefault();
        } else {
            // prevent other keys
            return;
        }
    }
    this.toggleDrawer();
};
/**
   * Handles (un)setting the `is-animating` class
   *
   * @private
   */
MaterialLayout.prototype.headerTransitionEndHandler_ = function () {
    this.header_.classList.remove(this.CssClasses_.IS_ANIMATING);
};
/**
   * Handles expanding the header on click
   *
   * @private
   */
MaterialLayout.prototype.headerClickHandler_ = function () {
    if (this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
        this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
    }
};
/**
   * Reset tab state, dropping active classes
   *
   * @private
   */
MaterialLayout.prototype.resetTabState_ = function (tabBar) {
    for (var k = 0; k < tabBar.length; k++) {
        tabBar[k].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
};
/**
   * Reset panel state, droping active classes
   *
   * @private
   */
MaterialLayout.prototype.resetPanelState_ = function (panels) {
    for (var j = 0; j < panels.length; j++) {
        panels[j].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
};
/**
  * Toggle drawer state
  *
  * @public
  */
MaterialLayout.prototype.toggleDrawer = function () {
    var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
    this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
    this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
    // Set accessibility properties.
    if (this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
        this.drawer_.setAttribute('aria-hidden', 'false');
        drawerButton.setAttribute('aria-expanded', 'true');
    } else {
        this.drawer_.setAttribute('aria-hidden', 'true');
        drawerButton.setAttribute('aria-expanded', 'false');
    }
};
MaterialLayout.prototype['toggleDrawer'] = MaterialLayout.prototype.toggleDrawer;
/**
   * Initialize element.
   */
MaterialLayout.prototype.init = function () {
    if (this.element_) {
        var container = document.createElement('div');
        container.classList.add(this.CssClasses_.CONTAINER);
        var focusedElement = this.element_.querySelector(':focus');
        this.element_.parentElement.insertBefore(container, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        container.appendChild(this.element_);
        if (focusedElement) {
            focusedElement.focus();
        }
        var directChildren = this.element_.childNodes;
        var numChildren = directChildren.length;
        for (var c = 0; c < numChildren; c++) {
            var child = directChildren[c];
            if (child.classList && child.classList.contains(this.CssClasses_.HEADER)) {
                this.header_ = child;
            }
            if (child.classList && child.classList.contains(this.CssClasses_.DRAWER)) {
                this.drawer_ = child;
            }
            if (child.classList && child.classList.contains(this.CssClasses_.CONTENT)) {
                this.content_ = child;
            }
        }
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                // when page is loaded from back/forward cache
                // trigger repaint to let layout scroll in safari
                this.element_.style.overflowY = 'hidden';
                requestAnimationFrame(function () {
                    this.element_.style.overflowY = '';
                }.bind(this));
            }
        }.bind(this), false);
        if (this.header_) {
            this.tabBar_ = this.header_.querySelector('.' + this.CssClasses_.TAB_BAR);
        }
        var mode = this.Mode_.STANDARD;
        if (this.header_) {
            if (this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)) {
                mode = this.Mode_.SEAMED;
            } else if (this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)) {
                mode = this.Mode_.WATERFALL;
                this.header_.addEventListener('transitionend', this.headerTransitionEndHandler_.bind(this));
                this.header_.addEventListener('click', this.headerClickHandler_.bind(this));
            } else if (this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)) {
                mode = this.Mode_.SCROLL;
                container.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER);
            }
            if (mode === this.Mode_.STANDARD) {
                this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
                if (this.tabBar_) {
                    this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW);
                }
            } else if (mode === this.Mode_.SEAMED || mode === this.Mode_.SCROLL) {
                this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                if (this.tabBar_) {
                    this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                }
            } else if (mode === this.Mode_.WATERFALL) {
                // Add and remove shadows depending on scroll position.
                // Also add/remove auxiliary class for styling of the compact version of
                // the header.
                this.content_.addEventListener('scroll', this.contentScrollHandler_.bind(this));
                this.contentScrollHandler_();
            }
        }
        // Add drawer toggling button to our layout, if we have an openable drawer.
        if (this.drawer_) {
            var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
            if (!drawerButton) {
                drawerButton = document.createElement('div');
                drawerButton.setAttribute('aria-expanded', 'false');
                drawerButton.setAttribute('role', 'button');
                drawerButton.setAttribute('tabindex', '0');
                drawerButton.classList.add(this.CssClasses_.DRAWER_BTN);
                var drawerButtonIcon = document.createElement('i');
                drawerButtonIcon.classList.add(this.CssClasses_.ICON);
                drawerButtonIcon.innerHTML = this.Constant_.MENU_ICON;
                drawerButton.appendChild(drawerButtonIcon);
            }
            if (this.drawer_.classList.contains(this.CssClasses_.ON_LARGE_SCREEN)) {
                //If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
                drawerButton.classList.add(this.CssClasses_.ON_LARGE_SCREEN);
            } else if (this.drawer_.classList.contains(this.CssClasses_.ON_SMALL_SCREEN)) {
                //If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
                drawerButton.classList.add(this.CssClasses_.ON_SMALL_SCREEN);
            }
            drawerButton.addEventListener('click', this.drawerToggleHandler_.bind(this));
            drawerButton.addEventListener('keydown', this.drawerToggleHandler_.bind(this));
            // Add a class if the layout has a drawer, for altering the left padding.
            // Adds the HAS_DRAWER to the elements since this.header_ may or may
            // not be present.
            this.element_.classList.add(this.CssClasses_.HAS_DRAWER);
            // If we have a fixed header, add the button to the header rather than
            // the layout.
            if (this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)) {
                this.header_.insertBefore(drawerButton, this.header_.firstChild);
            } else {
                this.element_.insertBefore(drawerButton, this.content_);
            }
            var obfuscator = document.createElement('div');
            obfuscator.classList.add(this.CssClasses_.OBFUSCATOR);
            this.element_.appendChild(obfuscator);
            obfuscator.addEventListener('click', this.drawerToggleHandler_.bind(this));
            this.obfuscator_ = obfuscator;
            this.drawer_.addEventListener('keydown', this.keyboardEventHandler_.bind(this));
            this.drawer_.setAttribute('aria-hidden', 'true');
        }
        // Keep an eye on screen size, and add/remove auxiliary class for styling
        // of small screens.
        this.screenSizeMediaQuery_ = window.matchMedia(this.Constant_.MAX_WIDTH);
        this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));
        this.screenSizeHandler_();
        // Initialize tabs, if any.
        if (this.header_ && this.tabBar_) {
            this.element_.classList.add(this.CssClasses_.HAS_TABS);
            var tabContainer = document.createElement('div');
            tabContainer.classList.add(this.CssClasses_.TAB_CONTAINER);
            this.header_.insertBefore(tabContainer, this.tabBar_);
            this.header_.removeChild(this.tabBar_);
            var leftButton = document.createElement('div');
            leftButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
            leftButton.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);
            var leftButtonIcon = document.createElement('i');
            leftButtonIcon.classList.add(this.CssClasses_.ICON);
            leftButtonIcon.textContent = this.Constant_.CHEVRON_LEFT;
            leftButton.appendChild(leftButtonIcon);
            leftButton.addEventListener('click', function () {
                this.tabBar_.scrollLeft -= this.Constant_.TAB_SCROLL_PIXELS;
            }.bind(this));
            var rightButton = document.createElement('div');
            rightButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
            rightButton.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);
            var rightButtonIcon = document.createElement('i');
            rightButtonIcon.classList.add(this.CssClasses_.ICON);
            rightButtonIcon.textContent = this.Constant_.CHEVRON_RIGHT;
            rightButton.appendChild(rightButtonIcon);
            rightButton.addEventListener('click', function () {
                this.tabBar_.scrollLeft += this.Constant_.TAB_SCROLL_PIXELS;
            }.bind(this));
            tabContainer.appendChild(leftButton);
            tabContainer.appendChild(this.tabBar_);
            tabContainer.appendChild(rightButton);
            // Add and remove tab buttons depending on scroll position and total
            // window size.
            var tabUpdateHandler = function () {
                if (this.tabBar_.scrollLeft > 0) {
                    leftButton.classList.add(this.CssClasses_.IS_ACTIVE);
                } else {
                    leftButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                }
                if (this.tabBar_.scrollLeft < this.tabBar_.scrollWidth - this.tabBar_.offsetWidth) {
                    rightButton.classList.add(this.CssClasses_.IS_ACTIVE);
                } else {
                    rightButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                }
            }.bind(this);
            this.tabBar_.addEventListener('scroll', tabUpdateHandler);
            tabUpdateHandler();
            // Update tabs when the window resizes.
            var windowResizeHandler = function () {
                // Use timeouts to make sure it doesn't happen too often.
                if (this.resizeTimeoutId_) {
                    clearTimeout(this.resizeTimeoutId_);
                }
                this.resizeTimeoutId_ = setTimeout(function () {
                    tabUpdateHandler();
                    this.resizeTimeoutId_ = null;
                }.bind(this), this.Constant_.RESIZE_TIMEOUT);
            }.bind(this);
            window.addEventListener('resize', windowResizeHandler);
            if (this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
                this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            }
            // Select element tabs, document panels
            var tabs = this.tabBar_.querySelectorAll('.' + this.CssClasses_.TAB);
            var panels = this.content_.querySelectorAll('.' + this.CssClasses_.PANEL);
            // Create new tabs for each tab element
            for (var i = 0; i < tabs.length; i++) {
                new MaterialLayoutTab(tabs[i], tabs, panels, this);
            }
        }
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {HTMLElement} tab The HTML element for the tab.
   * @param {!Array<HTMLElement>} tabs Array with HTML elements for all tabs.
   * @param {!Array<HTMLElement>} panels Array with HTML elements for all panels.
   * @param {MaterialLayout} layout The MaterialLayout object that owns the tab.
   */
function MaterialLayoutTab(tab, tabs, panels, layout) {
    /**
     * Auxiliary method to programmatically select a tab in the UI.
     */
    function selectTab() {
        var href = tab.href.split('#')[1];
        var panel = layout.content_.querySelector('#' + href);
        layout.resetTabState_(tabs);
        layout.resetPanelState_(panels);
        tab.classList.add(layout.CssClasses_.IS_ACTIVE);
        panel.classList.add(layout.CssClasses_.IS_ACTIVE);
    }
    if (layout.tabBar_.classList.contains(layout.CssClasses_.JS_RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(layout.CssClasses_.RIPPLE_CONTAINER);
        rippleContainer.classList.add(layout.CssClasses_.JS_RIPPLE_EFFECT);
        var ripple = document.createElement('span');
        ripple.classList.add(layout.CssClasses_.RIPPLE);
        rippleContainer.appendChild(ripple);
        tab.appendChild(rippleContainer);
    }
    if (!layout.tabBar_.classList.contains(layout.CssClasses_.TAB_MANUAL_SWITCH)) {
        tab.addEventListener('click', function (e) {
            if (tab.getAttribute('href').charAt(0) === '#') {
                e.preventDefault();
                selectTab();
            }
        });
    }
    tab.show = selectTab;
}
window['MaterialLayoutTab'] = MaterialLayoutTab;
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialLayout,
    classAsString: 'MaterialLayout',
    cssClass: 'mdl-js-layout'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Data Table Card MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
var MaterialDataTable = function MaterialDataTable(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialDataTable'] = MaterialDataTable;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialDataTable.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialDataTable.prototype.CssClasses_ = {
    DATA_TABLE: 'mdl-data-table',
    SELECTABLE: 'mdl-data-table--selectable',
    SELECT_ELEMENT: 'mdl-data-table__select',
    IS_SELECTED: 'is-selected',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Generates and returns a function that toggles the selection state of a
   * single row (or multiple rows).
   *
   * @param {Element} checkbox Checkbox that toggles the selection state.
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */
MaterialDataTable.prototype.selectRow_ = function (checkbox, row, opt_rows) {
    if (row) {
        return function () {
            if (checkbox.checked) {
                row.classList.add(this.CssClasses_.IS_SELECTED);
            } else {
                row.classList.remove(this.CssClasses_.IS_SELECTED);
            }
        }.bind(this);
    }
    if (opt_rows) {
        return function () {
            var i;
            var el;
            if (checkbox.checked) {
                for (i = 0; i < opt_rows.length; i++) {
                    el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                    el['MaterialCheckbox'].check();
                    opt_rows[i].classList.add(this.CssClasses_.IS_SELECTED);
                }
            } else {
                for (i = 0; i < opt_rows.length; i++) {
                    el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                    el['MaterialCheckbox'].uncheck();
                    opt_rows[i].classList.remove(this.CssClasses_.IS_SELECTED);
                }
            }
        }.bind(this);
    }
};
/**
   * Creates a checkbox for a single or or multiple rows and hooks up the
   * event handling.
   *
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */
MaterialDataTable.prototype.createCheckbox_ = function (row, opt_rows) {
    var label = document.createElement('label');
    var labelClasses = [
        'mdl-checkbox',
        'mdl-js-checkbox',
        'mdl-js-ripple-effect',
        this.CssClasses_.SELECT_ELEMENT
    ];
    label.className = labelClasses.join(' ');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('mdl-checkbox__input');
    if (row) {
        checkbox.checked = row.classList.contains(this.CssClasses_.IS_SELECTED);
        checkbox.addEventListener('change', this.selectRow_(checkbox, row));
    } else if (opt_rows) {
        checkbox.addEventListener('change', this.selectRow_(checkbox, null, opt_rows));
    }
    label.appendChild(checkbox);
    componentHandler.upgradeElement(label, 'MaterialCheckbox');
    return label;
};
/**
   * Initialize element.
   */
MaterialDataTable.prototype.init = function () {
    if (this.element_) {
        var firstHeader = this.element_.querySelector('th');
        var bodyRows = Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));
        var footRows = Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));
        var rows = bodyRows.concat(footRows);
        if (this.element_.classList.contains(this.CssClasses_.SELECTABLE)) {
            var th = document.createElement('th');
            var headerCheckbox = this.createCheckbox_(null, rows);
            th.appendChild(headerCheckbox);
            firstHeader.parentElement.insertBefore(th, firstHeader);
            for (var i = 0; i < rows.length; i++) {
                var firstCell = rows[i].querySelector('td');
                if (firstCell) {
                    var td = document.createElement('td');
                    if (rows[i].parentNode.nodeName.toUpperCase() === 'TBODY') {
                        var rowCheckbox = this.createCheckbox_(rows[i]);
                        td.appendChild(rowCheckbox);
                    }
                    rows[i].insertBefore(td, firstCell);
                }
            }
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialDataTable,
    classAsString: 'MaterialDataTable',
    cssClass: 'mdl-js-data-table'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Ripple MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialRipple = function MaterialRipple(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialRipple'] = MaterialRipple;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialRipple.prototype.Constant_ = {
    INITIAL_SCALE: 'scale(0.0001, 0.0001)',
    INITIAL_SIZE: '1px',
    INITIAL_OPACITY: '0.4',
    FINAL_OPACITY: '0',
    FINAL_SCALE: ''
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialRipple.prototype.CssClasses_ = {
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    IS_ANIMATING: 'is-animating',
    IS_VISIBLE: 'is-visible'
};
/**
   * Handle mouse / finger down on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRipple.prototype.downHandler_ = function (event) {
    if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
        var rect = this.element_.getBoundingClientRect();
        this.boundHeight = rect.height;
        this.boundWidth = rect.width;
        this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
        this.rippleElement_.style.width = this.rippleSize_ + 'px';
        this.rippleElement_.style.height = this.rippleSize_ + 'px';
    }
    this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE);
    if (event.type === 'mousedown' && this.ignoringMouseDown_) {
        this.ignoringMouseDown_ = false;
    } else {
        if (event.type === 'touchstart') {
            this.ignoringMouseDown_ = true;
        }
        var frameCount = this.getFrameCount();
        if (frameCount > 0) {
            return;
        }
        this.setFrameCount(1);
        var bound = event.currentTarget.getBoundingClientRect();
        var x;
        var y;
        // Check if we are handling a keyboard click.
        if (event.clientX === 0 && event.clientY === 0) {
            x = Math.round(bound.width / 2);
            y = Math.round(bound.height / 2);
        } else {
            var clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
            var clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
            x = Math.round(clientX - bound.left);
            y = Math.round(clientY - bound.top);
        }
        this.setRippleXY(x, y);
        this.setRippleStyles(true);
        window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
};
/**
   * Handle mouse / finger up on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRipple.prototype.upHandler_ = function (event) {
    // Don't fire for the artificial "mouseup" generated by a double-click.
    if (event && event.detail !== 2) {
        // Allow a repaint to occur before removing this class, so the animation
        // shows for tap events, which seem to trigger a mouseup too soon after
        // mousedown.
        window.setTimeout(function () {
            this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE);
        }.bind(this), 0);
    }
};
/**
   * Initialize element.
   */
MaterialRipple.prototype.init = function () {
    if (this.element_) {
        var recentering = this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);
        if (!this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
            this.rippleElement_ = this.element_.querySelector('.' + this.CssClasses_.RIPPLE);
            this.frameCount_ = 0;
            this.rippleSize_ = 0;
            this.x_ = 0;
            this.y_ = 0;
            // Touch start produces a compat mouse down event, which would cause a
            // second ripples. To avoid that, we use this property to ignore the first
            // mouse down after a touch start.
            this.ignoringMouseDown_ = false;
            this.boundDownHandler = this.downHandler_.bind(this);
            this.element_.addEventListener('mousedown', this.boundDownHandler);
            this.element_.addEventListener('touchstart', this.boundDownHandler);
            this.boundUpHandler = this.upHandler_.bind(this);
            this.element_.addEventListener('mouseup', this.boundUpHandler);
            this.element_.addEventListener('mouseleave', this.boundUpHandler);
            this.element_.addEventListener('touchend', this.boundUpHandler);
            this.element_.addEventListener('blur', this.boundUpHandler);
            /**
         * Getter for frameCount_.
         * @return {number} the frame count.
         */
            this.getFrameCount = function () {
                return this.frameCount_;
            };
            /**
         * Setter for frameCount_.
         * @param {number} fC the frame count.
         */
            this.setFrameCount = function (fC) {
                this.frameCount_ = fC;
            };
            /**
         * Getter for rippleElement_.
         * @return {Element} the ripple element.
         */
            this.getRippleElement = function () {
                return this.rippleElement_;
            };
            /**
         * Sets the ripple X and Y coordinates.
         * @param  {number} newX the new X coordinate
         * @param  {number} newY the new Y coordinate
         */
            this.setRippleXY = function (newX, newY) {
                this.x_ = newX;
                this.y_ = newY;
            };
            /**
         * Sets the ripple styles.
         * @param  {boolean} start whether or not this is the start frame.
         */
            this.setRippleStyles = function (start) {
                if (this.rippleElement_ !== null) {
                    var transformString;
                    var scale;
                    var size;
                    var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';
                    if (start) {
                        scale = this.Constant_.INITIAL_SCALE;
                        size = this.Constant_.INITIAL_SIZE;
                    } else {
                        scale = this.Constant_.FINAL_SCALE;
                        size = this.rippleSize_ + 'px';
                        if (recentering) {
                            offset = 'translate(' + this.boundWidth / 2 + 'px, ' + this.boundHeight / 2 + 'px)';
                        }
                    }
                    transformString = 'translate(-50%, -50%) ' + offset + scale;
                    this.rippleElement_.style.webkitTransform = transformString;
                    this.rippleElement_.style.msTransform = transformString;
                    this.rippleElement_.style.transform = transformString;
                    if (start) {
                        this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);
                    } else {
                        this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);
                    }
                }
            };
            /**
         * Handles an animation frame.
         */
            this.animFrameHandler = function () {
                if (this.frameCount_-- > 0) {
                    window.requestAnimationFrame(this.animFrameHandler.bind(this));
                } else {
                    this.setRippleStyles(false);
                }
            };
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialRipple,
    classAsString: 'MaterialRipple',
    cssClass: 'mdl-js-ripple-effect',
    widget: false
});
}());
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/jb-preact.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/preact/dist/preact.mjs":
/*!*********************************************!*\
  !*** ./node_modules/preact/dist/preact.mjs ***!
  \*********************************************/
/*! exports provided: default, h, createElement, cloneElement, createRef, Component, render, rerender, options */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"h\", function() { return h; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createElement\", function() { return h; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cloneElement\", function() { return cloneElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createRef\", function() { return createRef; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Component\", function() { return Component; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"rerender\", function() { return rerender; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"options\", function() { return options; });\nvar VNode = function VNode() {};\n\nvar options = {};\n\nvar stack = [];\n\nvar EMPTY_CHILDREN = [];\n\nfunction h(nodeName, attributes) {\n\tvar children = EMPTY_CHILDREN,\n\t    lastSimple,\n\t    child,\n\t    simple,\n\t    i;\n\tfor (i = arguments.length; i-- > 2;) {\n\t\tstack.push(arguments[i]);\n\t}\n\tif (attributes && attributes.children != null) {\n\t\tif (!stack.length) stack.push(attributes.children);\n\t\tdelete attributes.children;\n\t}\n\twhile (stack.length) {\n\t\tif ((child = stack.pop()) && child.pop !== undefined) {\n\t\t\tfor (i = child.length; i--;) {\n\t\t\t\tstack.push(child[i]);\n\t\t\t}\n\t\t} else {\n\t\t\tif (typeof child === 'boolean') child = null;\n\n\t\t\tif (simple = typeof nodeName !== 'function') {\n\t\t\t\tif (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;\n\t\t\t}\n\n\t\t\tif (simple && lastSimple) {\n\t\t\t\tchildren[children.length - 1] += child;\n\t\t\t} else if (children === EMPTY_CHILDREN) {\n\t\t\t\tchildren = [child];\n\t\t\t} else {\n\t\t\t\tchildren.push(child);\n\t\t\t}\n\n\t\t\tlastSimple = simple;\n\t\t}\n\t}\n\n\tvar p = new VNode();\n\tp.nodeName = nodeName;\n\tp.children = children;\n\tp.attributes = attributes == null ? undefined : attributes;\n\tp.key = attributes == null ? undefined : attributes.key;\n\n\tif (options.vnode !== undefined) options.vnode(p);\n\n\treturn p;\n}\n\nfunction extend(obj, props) {\n  for (var i in props) {\n    obj[i] = props[i];\n  }return obj;\n}\n\nfunction applyRef(ref, value) {\n  if (ref != null) {\n    if (typeof ref == 'function') ref(value);else ref.current = value;\n  }\n}\n\nvar defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;\n\nfunction cloneElement(vnode, props) {\n  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);\n}\n\nvar IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;\n\nvar items = [];\n\nfunction enqueueRender(component) {\n\tif (!component._dirty && (component._dirty = true) && items.push(component) == 1) {\n\t\t(options.debounceRendering || defer)(rerender);\n\t}\n}\n\nfunction rerender() {\n\tvar p;\n\twhile (p = items.pop()) {\n\t\tif (p._dirty) renderComponent(p);\n\t}\n}\n\nfunction isSameNodeType(node, vnode, hydrating) {\n\tif (typeof vnode === 'string' || typeof vnode === 'number') {\n\t\treturn node.splitText !== undefined;\n\t}\n\tif (typeof vnode.nodeName === 'string') {\n\t\treturn !node._componentConstructor && isNamedNode(node, vnode.nodeName);\n\t}\n\treturn hydrating || node._componentConstructor === vnode.nodeName;\n}\n\nfunction isNamedNode(node, nodeName) {\n\treturn node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();\n}\n\nfunction getNodeProps(vnode) {\n\tvar props = extend({}, vnode.attributes);\n\tprops.children = vnode.children;\n\n\tvar defaultProps = vnode.nodeName.defaultProps;\n\tif (defaultProps !== undefined) {\n\t\tfor (var i in defaultProps) {\n\t\t\tif (props[i] === undefined) {\n\t\t\t\tprops[i] = defaultProps[i];\n\t\t\t}\n\t\t}\n\t}\n\n\treturn props;\n}\n\nfunction createNode(nodeName, isSvg) {\n\tvar node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);\n\tnode.normalizedNodeName = nodeName;\n\treturn node;\n}\n\nfunction removeNode(node) {\n\tvar parentNode = node.parentNode;\n\tif (parentNode) parentNode.removeChild(node);\n}\n\nfunction setAccessor(node, name, old, value, isSvg) {\n\tif (name === 'className') name = 'class';\n\n\tif (name === 'key') {} else if (name === 'ref') {\n\t\tapplyRef(old, null);\n\t\tapplyRef(value, node);\n\t} else if (name === 'class' && !isSvg) {\n\t\tnode.className = value || '';\n\t} else if (name === 'style') {\n\t\tif (!value || typeof value === 'string' || typeof old === 'string') {\n\t\t\tnode.style.cssText = value || '';\n\t\t}\n\t\tif (value && typeof value === 'object') {\n\t\t\tif (typeof old !== 'string') {\n\t\t\t\tfor (var i in old) {\n\t\t\t\t\tif (!(i in value)) node.style[i] = '';\n\t\t\t\t}\n\t\t\t}\n\t\t\tfor (var i in value) {\n\t\t\t\tnode.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];\n\t\t\t}\n\t\t}\n\t} else if (name === 'dangerouslySetInnerHTML') {\n\t\tif (value) node.innerHTML = value.__html || '';\n\t} else if (name[0] == 'o' && name[1] == 'n') {\n\t\tvar useCapture = name !== (name = name.replace(/Capture$/, ''));\n\t\tname = name.toLowerCase().substring(2);\n\t\tif (value) {\n\t\t\tif (!old) node.addEventListener(name, eventProxy, useCapture);\n\t\t} else {\n\t\t\tnode.removeEventListener(name, eventProxy, useCapture);\n\t\t}\n\t\t(node._listeners || (node._listeners = {}))[name] = value;\n\t} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {\n\t\ttry {\n\t\t\tnode[name] = value == null ? '' : value;\n\t\t} catch (e) {}\n\t\tif ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);\n\t} else {\n\t\tvar ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));\n\n\t\tif (value == null || value === false) {\n\t\t\tif (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);\n\t\t} else if (typeof value !== 'function') {\n\t\t\tif (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);\n\t\t}\n\t}\n}\n\nfunction eventProxy(e) {\n\treturn this._listeners[e.type](options.event && options.event(e) || e);\n}\n\nvar mounts = [];\n\nvar diffLevel = 0;\n\nvar isSvgMode = false;\n\nvar hydrating = false;\n\nfunction flushMounts() {\n\tvar c;\n\twhile (c = mounts.shift()) {\n\t\tif (options.afterMount) options.afterMount(c);\n\t\tif (c.componentDidMount) c.componentDidMount();\n\t}\n}\n\nfunction diff(dom, vnode, context, mountAll, parent, componentRoot) {\n\tif (!diffLevel++) {\n\t\tisSvgMode = parent != null && parent.ownerSVGElement !== undefined;\n\n\t\thydrating = dom != null && !('__preactattr_' in dom);\n\t}\n\n\tvar ret = idiff(dom, vnode, context, mountAll, componentRoot);\n\n\tif (parent && ret.parentNode !== parent) parent.appendChild(ret);\n\n\tif (! --diffLevel) {\n\t\thydrating = false;\n\n\t\tif (!componentRoot) flushMounts();\n\t}\n\n\treturn ret;\n}\n\nfunction idiff(dom, vnode, context, mountAll, componentRoot) {\n\tvar out = dom,\n\t    prevSvgMode = isSvgMode;\n\n\tif (vnode == null || typeof vnode === 'boolean') vnode = '';\n\n\tif (typeof vnode === 'string' || typeof vnode === 'number') {\n\t\tif (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {\n\t\t\tif (dom.nodeValue != vnode) {\n\t\t\t\tdom.nodeValue = vnode;\n\t\t\t}\n\t\t} else {\n\t\t\tout = document.createTextNode(vnode);\n\t\t\tif (dom) {\n\t\t\t\tif (dom.parentNode) dom.parentNode.replaceChild(out, dom);\n\t\t\t\trecollectNodeTree(dom, true);\n\t\t\t}\n\t\t}\n\n\t\tout['__preactattr_'] = true;\n\n\t\treturn out;\n\t}\n\n\tvar vnodeName = vnode.nodeName;\n\tif (typeof vnodeName === 'function') {\n\t\treturn buildComponentFromVNode(dom, vnode, context, mountAll);\n\t}\n\n\tisSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;\n\n\tvnodeName = String(vnodeName);\n\tif (!dom || !isNamedNode(dom, vnodeName)) {\n\t\tout = createNode(vnodeName, isSvgMode);\n\n\t\tif (dom) {\n\t\t\twhile (dom.firstChild) {\n\t\t\t\tout.appendChild(dom.firstChild);\n\t\t\t}\n\t\t\tif (dom.parentNode) dom.parentNode.replaceChild(out, dom);\n\n\t\t\trecollectNodeTree(dom, true);\n\t\t}\n\t}\n\n\tvar fc = out.firstChild,\n\t    props = out['__preactattr_'],\n\t    vchildren = vnode.children;\n\n\tif (props == null) {\n\t\tprops = out['__preactattr_'] = {};\n\t\tfor (var a = out.attributes, i = a.length; i--;) {\n\t\t\tprops[a[i].name] = a[i].value;\n\t\t}\n\t}\n\n\tif (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {\n\t\tif (fc.nodeValue != vchildren[0]) {\n\t\t\tfc.nodeValue = vchildren[0];\n\t\t}\n\t} else if (vchildren && vchildren.length || fc != null) {\n\t\t\tinnerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);\n\t\t}\n\n\tdiffAttributes(out, vnode.attributes, props);\n\n\tisSvgMode = prevSvgMode;\n\n\treturn out;\n}\n\nfunction innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {\n\tvar originalChildren = dom.childNodes,\n\t    children = [],\n\t    keyed = {},\n\t    keyedLen = 0,\n\t    min = 0,\n\t    len = originalChildren.length,\n\t    childrenLen = 0,\n\t    vlen = vchildren ? vchildren.length : 0,\n\t    j,\n\t    c,\n\t    f,\n\t    vchild,\n\t    child;\n\n\tif (len !== 0) {\n\t\tfor (var i = 0; i < len; i++) {\n\t\t\tvar _child = originalChildren[i],\n\t\t\t    props = _child['__preactattr_'],\n\t\t\t    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;\n\t\t\tif (key != null) {\n\t\t\t\tkeyedLen++;\n\t\t\t\tkeyed[key] = _child;\n\t\t\t} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {\n\t\t\t\tchildren[childrenLen++] = _child;\n\t\t\t}\n\t\t}\n\t}\n\n\tif (vlen !== 0) {\n\t\tfor (var i = 0; i < vlen; i++) {\n\t\t\tvchild = vchildren[i];\n\t\t\tchild = null;\n\n\t\t\tvar key = vchild.key;\n\t\t\tif (key != null) {\n\t\t\t\tif (keyedLen && keyed[key] !== undefined) {\n\t\t\t\t\tchild = keyed[key];\n\t\t\t\t\tkeyed[key] = undefined;\n\t\t\t\t\tkeyedLen--;\n\t\t\t\t}\n\t\t\t} else if (min < childrenLen) {\n\t\t\t\t\tfor (j = min; j < childrenLen; j++) {\n\t\t\t\t\t\tif (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {\n\t\t\t\t\t\t\tchild = c;\n\t\t\t\t\t\t\tchildren[j] = undefined;\n\t\t\t\t\t\t\tif (j === childrenLen - 1) childrenLen--;\n\t\t\t\t\t\t\tif (j === min) min++;\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\tchild = idiff(child, vchild, context, mountAll);\n\n\t\t\tf = originalChildren[i];\n\t\t\tif (child && child !== dom && child !== f) {\n\t\t\t\tif (f == null) {\n\t\t\t\t\tdom.appendChild(child);\n\t\t\t\t} else if (child === f.nextSibling) {\n\t\t\t\t\tremoveNode(f);\n\t\t\t\t} else {\n\t\t\t\t\tdom.insertBefore(child, f);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\n\tif (keyedLen) {\n\t\tfor (var i in keyed) {\n\t\t\tif (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);\n\t\t}\n\t}\n\n\twhile (min <= childrenLen) {\n\t\tif ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);\n\t}\n}\n\nfunction recollectNodeTree(node, unmountOnly) {\n\tvar component = node._component;\n\tif (component) {\n\t\tunmountComponent(component);\n\t} else {\n\t\tif (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);\n\n\t\tif (unmountOnly === false || node['__preactattr_'] == null) {\n\t\t\tremoveNode(node);\n\t\t}\n\n\t\tremoveChildren(node);\n\t}\n}\n\nfunction removeChildren(node) {\n\tnode = node.lastChild;\n\twhile (node) {\n\t\tvar next = node.previousSibling;\n\t\trecollectNodeTree(node, true);\n\t\tnode = next;\n\t}\n}\n\nfunction diffAttributes(dom, attrs, old) {\n\tvar name;\n\n\tfor (name in old) {\n\t\tif (!(attrs && attrs[name] != null) && old[name] != null) {\n\t\t\tsetAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);\n\t\t}\n\t}\n\n\tfor (name in attrs) {\n\t\tif (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {\n\t\t\tsetAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);\n\t\t}\n\t}\n}\n\nvar recyclerComponents = [];\n\nfunction createComponent(Ctor, props, context) {\n\tvar inst,\n\t    i = recyclerComponents.length;\n\n\tif (Ctor.prototype && Ctor.prototype.render) {\n\t\tinst = new Ctor(props, context);\n\t\tComponent.call(inst, props, context);\n\t} else {\n\t\tinst = new Component(props, context);\n\t\tinst.constructor = Ctor;\n\t\tinst.render = doRender;\n\t}\n\n\twhile (i--) {\n\t\tif (recyclerComponents[i].constructor === Ctor) {\n\t\t\tinst.nextBase = recyclerComponents[i].nextBase;\n\t\t\trecyclerComponents.splice(i, 1);\n\t\t\treturn inst;\n\t\t}\n\t}\n\n\treturn inst;\n}\n\nfunction doRender(props, state, context) {\n\treturn this.constructor(props, context);\n}\n\nfunction setComponentProps(component, props, renderMode, context, mountAll) {\n\tif (component._disable) return;\n\tcomponent._disable = true;\n\n\tcomponent.__ref = props.ref;\n\tcomponent.__key = props.key;\n\tdelete props.ref;\n\tdelete props.key;\n\n\tif (typeof component.constructor.getDerivedStateFromProps === 'undefined') {\n\t\tif (!component.base || mountAll) {\n\t\t\tif (component.componentWillMount) component.componentWillMount();\n\t\t} else if (component.componentWillReceiveProps) {\n\t\t\tcomponent.componentWillReceiveProps(props, context);\n\t\t}\n\t}\n\n\tif (context && context !== component.context) {\n\t\tif (!component.prevContext) component.prevContext = component.context;\n\t\tcomponent.context = context;\n\t}\n\n\tif (!component.prevProps) component.prevProps = component.props;\n\tcomponent.props = props;\n\n\tcomponent._disable = false;\n\n\tif (renderMode !== 0) {\n\t\tif (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {\n\t\t\trenderComponent(component, 1, mountAll);\n\t\t} else {\n\t\t\tenqueueRender(component);\n\t\t}\n\t}\n\n\tapplyRef(component.__ref, component);\n}\n\nfunction renderComponent(component, renderMode, mountAll, isChild) {\n\tif (component._disable) return;\n\n\tvar props = component.props,\n\t    state = component.state,\n\t    context = component.context,\n\t    previousProps = component.prevProps || props,\n\t    previousState = component.prevState || state,\n\t    previousContext = component.prevContext || context,\n\t    isUpdate = component.base,\n\t    nextBase = component.nextBase,\n\t    initialBase = isUpdate || nextBase,\n\t    initialChildComponent = component._component,\n\t    skip = false,\n\t    snapshot = previousContext,\n\t    rendered,\n\t    inst,\n\t    cbase;\n\n\tif (component.constructor.getDerivedStateFromProps) {\n\t\tstate = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));\n\t\tcomponent.state = state;\n\t}\n\n\tif (isUpdate) {\n\t\tcomponent.props = previousProps;\n\t\tcomponent.state = previousState;\n\t\tcomponent.context = previousContext;\n\t\tif (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {\n\t\t\tskip = true;\n\t\t} else if (component.componentWillUpdate) {\n\t\t\tcomponent.componentWillUpdate(props, state, context);\n\t\t}\n\t\tcomponent.props = props;\n\t\tcomponent.state = state;\n\t\tcomponent.context = context;\n\t}\n\n\tcomponent.prevProps = component.prevState = component.prevContext = component.nextBase = null;\n\tcomponent._dirty = false;\n\n\tif (!skip) {\n\t\trendered = component.render(props, state, context);\n\n\t\tif (component.getChildContext) {\n\t\t\tcontext = extend(extend({}, context), component.getChildContext());\n\t\t}\n\n\t\tif (isUpdate && component.getSnapshotBeforeUpdate) {\n\t\t\tsnapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);\n\t\t}\n\n\t\tvar childComponent = rendered && rendered.nodeName,\n\t\t    toUnmount,\n\t\t    base;\n\n\t\tif (typeof childComponent === 'function') {\n\n\t\t\tvar childProps = getNodeProps(rendered);\n\t\t\tinst = initialChildComponent;\n\n\t\t\tif (inst && inst.constructor === childComponent && childProps.key == inst.__key) {\n\t\t\t\tsetComponentProps(inst, childProps, 1, context, false);\n\t\t\t} else {\n\t\t\t\ttoUnmount = inst;\n\n\t\t\t\tcomponent._component = inst = createComponent(childComponent, childProps, context);\n\t\t\t\tinst.nextBase = inst.nextBase || nextBase;\n\t\t\t\tinst._parentComponent = component;\n\t\t\t\tsetComponentProps(inst, childProps, 0, context, false);\n\t\t\t\trenderComponent(inst, 1, mountAll, true);\n\t\t\t}\n\n\t\t\tbase = inst.base;\n\t\t} else {\n\t\t\tcbase = initialBase;\n\n\t\t\ttoUnmount = initialChildComponent;\n\t\t\tif (toUnmount) {\n\t\t\t\tcbase = component._component = null;\n\t\t\t}\n\n\t\t\tif (initialBase || renderMode === 1) {\n\t\t\t\tif (cbase) cbase._component = null;\n\t\t\t\tbase = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);\n\t\t\t}\n\t\t}\n\n\t\tif (initialBase && base !== initialBase && inst !== initialChildComponent) {\n\t\t\tvar baseParent = initialBase.parentNode;\n\t\t\tif (baseParent && base !== baseParent) {\n\t\t\t\tbaseParent.replaceChild(base, initialBase);\n\n\t\t\t\tif (!toUnmount) {\n\t\t\t\t\tinitialBase._component = null;\n\t\t\t\t\trecollectNodeTree(initialBase, false);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\tif (toUnmount) {\n\t\t\tunmountComponent(toUnmount);\n\t\t}\n\n\t\tcomponent.base = base;\n\t\tif (base && !isChild) {\n\t\t\tvar componentRef = component,\n\t\t\t    t = component;\n\t\t\twhile (t = t._parentComponent) {\n\t\t\t\t(componentRef = t).base = base;\n\t\t\t}\n\t\t\tbase._component = componentRef;\n\t\t\tbase._componentConstructor = componentRef.constructor;\n\t\t}\n\t}\n\n\tif (!isUpdate || mountAll) {\n\t\tmounts.push(component);\n\t} else if (!skip) {\n\n\t\tif (component.componentDidUpdate) {\n\t\t\tcomponent.componentDidUpdate(previousProps, previousState, snapshot);\n\t\t}\n\t\tif (options.afterUpdate) options.afterUpdate(component);\n\t}\n\n\twhile (component._renderCallbacks.length) {\n\t\tcomponent._renderCallbacks.pop().call(component);\n\t}if (!diffLevel && !isChild) flushMounts();\n}\n\nfunction buildComponentFromVNode(dom, vnode, context, mountAll) {\n\tvar c = dom && dom._component,\n\t    originalComponent = c,\n\t    oldDom = dom,\n\t    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,\n\t    isOwner = isDirectOwner,\n\t    props = getNodeProps(vnode);\n\twhile (c && !isOwner && (c = c._parentComponent)) {\n\t\tisOwner = c.constructor === vnode.nodeName;\n\t}\n\n\tif (c && isOwner && (!mountAll || c._component)) {\n\t\tsetComponentProps(c, props, 3, context, mountAll);\n\t\tdom = c.base;\n\t} else {\n\t\tif (originalComponent && !isDirectOwner) {\n\t\t\tunmountComponent(originalComponent);\n\t\t\tdom = oldDom = null;\n\t\t}\n\n\t\tc = createComponent(vnode.nodeName, props, context);\n\t\tif (dom && !c.nextBase) {\n\t\t\tc.nextBase = dom;\n\n\t\t\toldDom = null;\n\t\t}\n\t\tsetComponentProps(c, props, 1, context, mountAll);\n\t\tdom = c.base;\n\n\t\tif (oldDom && dom !== oldDom) {\n\t\t\toldDom._component = null;\n\t\t\trecollectNodeTree(oldDom, false);\n\t\t}\n\t}\n\n\treturn dom;\n}\n\nfunction unmountComponent(component) {\n\tif (options.beforeUnmount) options.beforeUnmount(component);\n\n\tvar base = component.base;\n\n\tcomponent._disable = true;\n\n\tif (component.componentWillUnmount) component.componentWillUnmount();\n\n\tcomponent.base = null;\n\n\tvar inner = component._component;\n\tif (inner) {\n\t\tunmountComponent(inner);\n\t} else if (base) {\n\t\tif (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);\n\n\t\tcomponent.nextBase = base;\n\n\t\tremoveNode(base);\n\t\trecyclerComponents.push(component);\n\n\t\tremoveChildren(base);\n\t}\n\n\tapplyRef(component.__ref, null);\n}\n\nfunction Component(props, context) {\n\tthis._dirty = true;\n\n\tthis.context = context;\n\n\tthis.props = props;\n\n\tthis.state = this.state || {};\n\n\tthis._renderCallbacks = [];\n}\n\nextend(Component.prototype, {\n\tsetState: function setState(state, callback) {\n\t\tif (!this.prevState) this.prevState = this.state;\n\t\tthis.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);\n\t\tif (callback) this._renderCallbacks.push(callback);\n\t\tenqueueRender(this);\n\t},\n\tforceUpdate: function forceUpdate(callback) {\n\t\tif (callback) this._renderCallbacks.push(callback);\n\t\trenderComponent(this, 2);\n\t},\n\trender: function render() {}\n});\n\nfunction render(vnode, parent, merge) {\n  return diff(merge, vnode, {}, false, parent, false);\n}\n\nfunction createRef() {\n\treturn {};\n}\n\nvar preact = {\n\th: h,\n\tcreateElement: h,\n\tcloneElement: cloneElement,\n\tcreateRef: createRef,\n\tComponent: Component,\n\trender: render,\n\trerender: rerender,\n\toptions: options\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (preact);\n\n//# sourceMappingURL=preact.mjs.map\n\n\n//# sourceURL=webpack:///./node_modules/preact/dist/preact.mjs?");

/***/ }),

/***/ "./src/ui/jb-preact.js":
/*!*****************************!*\
  !*** ./src/ui/jb-preact.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ \"./node_modules/preact/dist/preact.mjs\");\n\r\n\r\njb.ui.render = preact__WEBPACK_IMPORTED_MODULE_0__[\"render\"];\r\njb.ui.h = preact__WEBPACK_IMPORTED_MODULE_0__[\"h\"];\r\njb.ui.Component = preact__WEBPACK_IMPORTED_MODULE_0__[\"Component\"];\r\n\n\n//# sourceURL=webpack:///./src/ui/jb-preact.js?");

/***/ })

/******/ });;

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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/jb-immutable.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/immutability-helper/index.js":
/*!***************************************************!*\
  !*** ./node_modules/immutability-helper/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar invariant = __webpack_require__(/*! invariant */ \"./node_modules/invariant/browser.js\");\nvar hasOwnProperty = Object.prototype.hasOwnProperty;\nvar splice = Array.prototype.splice;\nvar toString = Object.prototype.toString;\nfunction type(obj) {\n    return toString.call(obj).slice(8, -1);\n}\nvar assign = Object.assign || /* istanbul ignore next */ (function (target, source) {\n    getAllKeys(source).forEach(function (key) {\n        if (hasOwnProperty.call(source, key)) {\n            target[key] = source[key];\n        }\n    });\n    return target;\n});\nvar getAllKeys = typeof Object.getOwnPropertySymbols === 'function'\n    ? function (obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)); }\n    /* istanbul ignore next */\n    : function (obj) { return Object.keys(obj); };\nfunction copy(object) {\n    return Array.isArray(object)\n        ? assign(object.constructor(object.length), object)\n        : (type(object) === 'Map')\n            ? new Map(object)\n            : (type(object) === 'Set')\n                ? new Set(object)\n                : (object && typeof object === 'object')\n                    ? assign(Object.create(Object.getPrototypeOf(object)), object)\n                    /* istanbul ignore next */\n                    : object;\n}\nvar Context = /** @class */ (function () {\n    function Context() {\n        this.commands = assign({}, defaultCommands);\n        this.update = this.update.bind(this);\n        // Deprecated: update.extend, update.isEquals and update.newContext\n        this.update.extend = this.extend = this.extend.bind(this);\n        this.update.isEquals = function (x, y) { return x === y; };\n        this.update.newContext = function () { return new Context().update; };\n    }\n    Object.defineProperty(Context.prototype, \"isEquals\", {\n        get: function () {\n            return this.update.isEquals;\n        },\n        set: function (value) {\n            this.update.isEquals = value;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Context.prototype.extend = function (directive, fn) {\n        this.commands[directive] = fn;\n    };\n    Context.prototype.update = function (object, $spec) {\n        var _this = this;\n        var spec = (typeof $spec === 'function') ? { $apply: $spec } : $spec;\n        if (!(Array.isArray(object) && Array.isArray(spec))) {\n            invariant(!Array.isArray(spec), 'update(): You provided an invalid spec to update(). The spec may ' +\n                'not contain an array except as the value of $set, $push, $unshift, ' +\n                '$splice or any custom command allowing an array value.');\n        }\n        invariant(typeof spec === 'object' && spec !== null, 'update(): You provided an invalid spec to update(). The spec and ' +\n            'every included key path must be plain objects containing one of the ' +\n            'following commands: %s.', Object.keys(this.commands).join(', '));\n        var nextObject = object;\n        getAllKeys(spec).forEach(function (key) {\n            if (hasOwnProperty.call(_this.commands, key)) {\n                var objectWasNextObject = object === nextObject;\n                nextObject = _this.commands[key](spec[key], nextObject, spec, object);\n                if (objectWasNextObject && _this.isEquals(nextObject, object)) {\n                    nextObject = object;\n                }\n            }\n            else {\n                var nextValueForKey = type(object) === 'Map'\n                    ? _this.update(object.get(key), spec[key])\n                    : _this.update(object[key], spec[key]);\n                var nextObjectValue = type(nextObject) === 'Map'\n                    ? nextObject.get(key)\n                    : nextObject[key];\n                if (!_this.isEquals(nextValueForKey, nextObjectValue)\n                    || typeof nextValueForKey === 'undefined'\n                        && !hasOwnProperty.call(object, key)) {\n                    if (nextObject === object) {\n                        nextObject = copy(object);\n                    }\n                    if (type(nextObject) === 'Map') {\n                        nextObject.set(key, nextValueForKey);\n                    }\n                    else {\n                        nextObject[key] = nextValueForKey;\n                    }\n                }\n            }\n        });\n        return nextObject;\n    };\n    return Context;\n}());\nexports.Context = Context;\nvar defaultCommands = {\n    $push: function (value, nextObject, spec) {\n        invariantPushAndUnshift(nextObject, spec, '$push');\n        return value.length ? nextObject.concat(value) : nextObject;\n    },\n    $unshift: function (value, nextObject, spec) {\n        invariantPushAndUnshift(nextObject, spec, '$unshift');\n        return value.length ? value.concat(nextObject) : nextObject;\n    },\n    $splice: function (value, nextObject, spec, originalObject) {\n        invariantSplices(nextObject, spec);\n        value.forEach(function (args) {\n            invariantSplice(args);\n            if (nextObject === originalObject && args.length) {\n                nextObject = copy(originalObject);\n            }\n            splice.apply(nextObject, args);\n        });\n        return nextObject;\n    },\n    $set: function (value, _nextObject, spec) {\n        invariantSet(spec);\n        return value;\n    },\n    $toggle: function (targets, nextObject) {\n        invariantSpecArray(targets, '$toggle');\n        var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;\n        targets.forEach(function (target) {\n            nextObjectCopy[target] = !nextObject[target];\n        });\n        return nextObjectCopy;\n    },\n    $unset: function (value, nextObject, _spec, originalObject) {\n        invariantSpecArray(value, '$unset');\n        value.forEach(function (key) {\n            if (Object.hasOwnProperty.call(nextObject, key)) {\n                if (nextObject === originalObject) {\n                    nextObject = copy(originalObject);\n                }\n                delete nextObject[key];\n            }\n        });\n        return nextObject;\n    },\n    $add: function (values, nextObject, _spec, originalObject) {\n        invariantMapOrSet(nextObject, '$add');\n        invariantSpecArray(values, '$add');\n        if (type(nextObject) === 'Map') {\n            values.forEach(function (_a) {\n                var key = _a[0], value = _a[1];\n                if (nextObject === originalObject && nextObject.get(key) !== value) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject.set(key, value);\n            });\n        }\n        else {\n            values.forEach(function (value) {\n                if (nextObject === originalObject && !nextObject.has(value)) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject.add(value);\n            });\n        }\n        return nextObject;\n    },\n    $remove: function (value, nextObject, _spec, originalObject) {\n        invariantMapOrSet(nextObject, '$remove');\n        invariantSpecArray(value, '$remove');\n        value.forEach(function (key) {\n            if (nextObject === originalObject && nextObject.has(key)) {\n                nextObject = copy(originalObject);\n            }\n            nextObject.delete(key);\n        });\n        return nextObject;\n    },\n    $merge: function (value, nextObject, _spec, originalObject) {\n        invariantMerge(nextObject, value);\n        getAllKeys(value).forEach(function (key) {\n            if (value[key] !== nextObject[key]) {\n                if (nextObject === originalObject) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject[key] = value[key];\n            }\n        });\n        return nextObject;\n    },\n    $apply: function (value, original) {\n        invariantApply(value);\n        return value(original);\n    },\n};\nvar defaultContext = new Context();\nexports.isEquals = defaultContext.update.isEquals;\nexports.extend = defaultContext.extend;\nexports.default = defaultContext.update;\n// @ts-ignore\nexports.default.default = module.exports = assign(exports.default, exports);\n// invariants\nfunction invariantPushAndUnshift(value, spec, command) {\n    invariant(Array.isArray(value), 'update(): expected target of %s to be an array; got %s.', command, value);\n    invariantSpecArray(spec[command], command);\n}\nfunction invariantSpecArray(spec, command) {\n    invariant(Array.isArray(spec), 'update(): expected spec of %s to be an array; got %s. ' +\n        'Did you forget to wrap your parameter in an array?', command, spec);\n}\nfunction invariantSplices(value, spec) {\n    invariant(Array.isArray(value), 'Expected $splice target to be an array; got %s', value);\n    invariantSplice(spec.$splice);\n}\nfunction invariantSplice(value) {\n    invariant(Array.isArray(value), 'update(): expected spec of $splice to be an array of arrays; got %s. ' +\n        'Did you forget to wrap your parameters in an array?', value);\n}\nfunction invariantApply(fn) {\n    invariant(typeof fn === 'function', 'update(): expected spec of $apply to be a function; got %s.', fn);\n}\nfunction invariantSet(spec) {\n    invariant(Object.keys(spec).length === 1, 'Cannot have more than one key in an object with $set');\n}\nfunction invariantMerge(target, specValue) {\n    invariant(specValue && typeof specValue === 'object', 'update(): $merge expects a spec of type \\'object\\'; got %s', specValue);\n    invariant(target && typeof target === 'object', 'update(): $merge expects a target of type \\'object\\'; got %s', target);\n}\nfunction invariantMapOrSet(target, command) {\n    var typeOfTarget = type(target);\n    invariant(typeOfTarget === 'Map' || typeOfTarget === 'Set', 'update(): %s expects a target of type Set or Map; got %s', command, typeOfTarget);\n}\n\n\n//# sourceURL=webpack:///./node_modules/immutability-helper/index.js?");

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

/***/ "./src/ui/jb-immutable.js":
/*!********************************!*\
  !*** ./src/ui/jb-immutable.js ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutability-helper */ \"./node_modules/immutability-helper/index.js\");\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immutability_helper__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\njb.ui.update = immutability_helper__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./src/ui/jb-immutable.js?");

/***/ })

/******/ });;

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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/jb-rx.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/rxjs/InnerSubscriber.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/InnerSubscriber.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar InnerSubscriber = (function (_super) {\n    __extends(InnerSubscriber, _super);\n    function InnerSubscriber(parent, outerValue, outerIndex) {\n        _super.call(this);\n        this.parent = parent;\n        this.outerValue = outerValue;\n        this.outerIndex = outerIndex;\n        this.index = 0;\n    }\n    InnerSubscriber.prototype._next = function (value) {\n        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);\n    };\n    InnerSubscriber.prototype._error = function (error) {\n        this.parent.notifyError(error, this);\n        this.unsubscribe();\n    };\n    InnerSubscriber.prototype._complete = function () {\n        this.parent.notifyComplete(this);\n        this.unsubscribe();\n    };\n    return InnerSubscriber;\n}(Subscriber_1.Subscriber));\nexports.InnerSubscriber = InnerSubscriber;\n//# sourceMappingURL=InnerSubscriber.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/InnerSubscriber.js?");

/***/ }),

/***/ "./node_modules/rxjs/Notification.js":
/*!*******************************************!*\
  !*** ./node_modules/rxjs/Notification.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ./Observable */ \"./node_modules/rxjs/Observable.js\");\n/**\n * Represents a push-based event or value that an {@link Observable} can emit.\n * This class is particularly useful for operators that manage notifications,\n * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and\n * others. Besides wrapping the actual delivered value, it also annotates it\n * with metadata of, for instance, what type of push message it is (`next`,\n * `error`, or `complete`).\n *\n * @see {@link materialize}\n * @see {@link dematerialize}\n * @see {@link observeOn}\n *\n * @class Notification<T>\n */\nvar Notification = (function () {\n    function Notification(kind, value, error) {\n        this.kind = kind;\n        this.value = value;\n        this.error = error;\n        this.hasValue = kind === 'N';\n    }\n    /**\n     * Delivers to the given `observer` the value wrapped by this Notification.\n     * @param {Observer} observer\n     * @return\n     */\n    Notification.prototype.observe = function (observer) {\n        switch (this.kind) {\n            case 'N':\n                return observer.next && observer.next(this.value);\n            case 'E':\n                return observer.error && observer.error(this.error);\n            case 'C':\n                return observer.complete && observer.complete();\n        }\n    };\n    /**\n     * Given some {@link Observer} callbacks, deliver the value represented by the\n     * current Notification to the correctly corresponding callback.\n     * @param {function(value: T): void} next An Observer `next` callback.\n     * @param {function(err: any): void} [error] An Observer `error` callback.\n     * @param {function(): void} [complete] An Observer `complete` callback.\n     * @return {any}\n     */\n    Notification.prototype.do = function (next, error, complete) {\n        var kind = this.kind;\n        switch (kind) {\n            case 'N':\n                return next && next(this.value);\n            case 'E':\n                return error && error(this.error);\n            case 'C':\n                return complete && complete();\n        }\n    };\n    /**\n     * Takes an Observer or its individual callback functions, and calls `observe`\n     * or `do` methods accordingly.\n     * @param {Observer|function(value: T): void} nextOrObserver An Observer or\n     * the `next` callback.\n     * @param {function(err: any): void} [error] An Observer `error` callback.\n     * @param {function(): void} [complete] An Observer `complete` callback.\n     * @return {any}\n     */\n    Notification.prototype.accept = function (nextOrObserver, error, complete) {\n        if (nextOrObserver && typeof nextOrObserver.next === 'function') {\n            return this.observe(nextOrObserver);\n        }\n        else {\n            return this.do(nextOrObserver, error, complete);\n        }\n    };\n    /**\n     * Returns a simple Observable that just delivers the notification represented\n     * by this Notification instance.\n     * @return {any}\n     */\n    Notification.prototype.toObservable = function () {\n        var kind = this.kind;\n        switch (kind) {\n            case 'N':\n                return Observable_1.Observable.of(this.value);\n            case 'E':\n                return Observable_1.Observable.throw(this.error);\n            case 'C':\n                return Observable_1.Observable.empty();\n        }\n        throw new Error('unexpected notification kind value');\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `next` from a\n     * given value.\n     * @param {T} value The `next` value.\n     * @return {Notification<T>} The \"next\" Notification representing the\n     * argument.\n     */\n    Notification.createNext = function (value) {\n        if (typeof value !== 'undefined') {\n            return new Notification('N', value);\n        }\n        return Notification.undefinedValueNotification;\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `error` from a\n     * given error.\n     * @param {any} [err] The `error` error.\n     * @return {Notification<T>} The \"error\" Notification representing the\n     * argument.\n     */\n    Notification.createError = function (err) {\n        return new Notification('E', undefined, err);\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `complete`.\n     * @return {Notification<any>} The valueless \"complete\" Notification.\n     */\n    Notification.createComplete = function () {\n        return Notification.completeNotification;\n    };\n    Notification.completeNotification = new Notification('C');\n    Notification.undefinedValueNotification = new Notification('N', undefined);\n    return Notification;\n}());\nexports.Notification = Notification;\n//# sourceMappingURL=Notification.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Notification.js?");

/***/ }),

/***/ "./node_modules/rxjs/Observable.js":
/*!*****************************************!*\
  !*** ./node_modules/rxjs/Observable.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar root_1 = __webpack_require__(/*! ./util/root */ \"./node_modules/rxjs/util/root.js\");\nvar toSubscriber_1 = __webpack_require__(/*! ./util/toSubscriber */ \"./node_modules/rxjs/util/toSubscriber.js\");\nvar observable_1 = __webpack_require__(/*! ./symbol/observable */ \"./node_modules/rxjs/symbol/observable.js\");\nvar pipe_1 = __webpack_require__(/*! ./util/pipe */ \"./node_modules/rxjs/util/pipe.js\");\n/**\n * A representation of any set of values over any amount of time. This is the most basic building block\n * of RxJS.\n *\n * @class Observable<T>\n */\nvar Observable = (function () {\n    /**\n     * @constructor\n     * @param {Function} subscribe the function that is called when the Observable is\n     * initially subscribed to. This function is given a Subscriber, to which new values\n     * can be `next`ed, or an `error` method can be called to raise an error, or\n     * `complete` can be called to notify of a successful completion.\n     */\n    function Observable(subscribe) {\n        this._isScalar = false;\n        if (subscribe) {\n            this._subscribe = subscribe;\n        }\n    }\n    /**\n     * Creates a new Observable, with this Observable as the source, and the passed\n     * operator defined as the new observable's operator.\n     * @method lift\n     * @param {Operator} operator the operator defining the operation to take on the observable\n     * @return {Observable} a new observable with the Operator applied\n     */\n    Observable.prototype.lift = function (operator) {\n        var observable = new Observable();\n        observable.source = this;\n        observable.operator = operator;\n        return observable;\n    };\n    /**\n     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.\n     *\n     * <span class=\"informal\">Use it when you have all these Observables, but still nothing is happening.</span>\n     *\n     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It\n     * might be for example a function that you passed to a {@link create} static factory, but most of the time it is\n     * a library implementation, which defines what and when will be emitted by an Observable. This means that calling\n     * `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often\n     * thought.\n     *\n     * Apart from starting the execution of an Observable, this method allows you to listen for values\n     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two\n     * following ways.\n     *\n     * The first way is creating an object that implements {@link Observer} interface. It should have methods\n     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create\n     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do\n     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also\n     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't\n     * do anything, you can simply omit it. Note however, that if `error` method is not provided, all errors will\n     * be left uncaught.\n     *\n     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.\n     * This means you can provide three functions as arguments to `subscribe`, where first function is equivalent\n     * of a `next` method, second of an `error` method and third of a `complete` method. Just as in case of Observer,\n     * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,\n     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes\n     * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.\n     *\n     * Whatever style of calling `subscribe` you use, in both cases it returns a Subscription object.\n     * This object allows you to call `unsubscribe` on it, which in turn will stop work that an Observable does and will clean\n     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback\n     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.\n     *\n     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.\n     * It is an Observable itself that decides when these functions will be called. For example {@link of}\n     * by default emits all its values synchronously. Always check documentation for how given Observable\n     * will behave when subscribed and if its default behavior can be modified with a {@link Scheduler}.\n     *\n     * @example <caption>Subscribe with an Observer</caption>\n     * const sumObserver = {\n     *   sum: 0,\n     *   next(value) {\n     *     console.log('Adding: ' + value);\n     *     this.sum = this.sum + value;\n     *   },\n     *   error() { // We actually could just remove this method,\n     *   },        // since we do not really care about errors right now.\n     *   complete() {\n     *     console.log('Sum equals: ' + this.sum);\n     *   }\n     * };\n     *\n     * Rx.Observable.of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.\n     * .subscribe(sumObserver);\n     *\n     * // Logs:\n     * // \"Adding: 1\"\n     * // \"Adding: 2\"\n     * // \"Adding: 3\"\n     * // \"Sum equals: 6\"\n     *\n     *\n     * @example <caption>Subscribe with functions</caption>\n     * let sum = 0;\n     *\n     * Rx.Observable.of(1, 2, 3)\n     * .subscribe(\n     *   function(value) {\n     *     console.log('Adding: ' + value);\n     *     sum = sum + value;\n     *   },\n     *   undefined,\n     *   function() {\n     *     console.log('Sum equals: ' + sum);\n     *   }\n     * );\n     *\n     * // Logs:\n     * // \"Adding: 1\"\n     * // \"Adding: 2\"\n     * // \"Adding: 3\"\n     * // \"Sum equals: 6\"\n     *\n     *\n     * @example <caption>Cancel a subscription</caption>\n     * const subscription = Rx.Observable.interval(1000).subscribe(\n     *   num => console.log(num),\n     *   undefined,\n     *   () => console.log('completed!') // Will not be called, even\n     * );                                // when cancelling subscription\n     *\n     *\n     * setTimeout(() => {\n     *   subscription.unsubscribe();\n     *   console.log('unsubscribed!');\n     * }, 2500);\n     *\n     * // Logs:\n     * // 0 after 1s\n     * // 1 after 2s\n     * // \"unsubscribed!\" after 2.5s\n     *\n     *\n     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,\n     *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed\n     *  Observable.\n     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,\n     *  the error will be thrown as unhandled.\n     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.\n     * @return {ISubscription} a subscription reference to the registered handlers\n     * @method subscribe\n     */\n    Observable.prototype.subscribe = function (observerOrNext, error, complete) {\n        var operator = this.operator;\n        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);\n        if (operator) {\n            operator.call(sink, this.source);\n        }\n        else {\n            sink.add(this.source || !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));\n        }\n        if (sink.syncErrorThrowable) {\n            sink.syncErrorThrowable = false;\n            if (sink.syncErrorThrown) {\n                throw sink.syncErrorValue;\n            }\n        }\n        return sink;\n    };\n    Observable.prototype._trySubscribe = function (sink) {\n        try {\n            return this._subscribe(sink);\n        }\n        catch (err) {\n            sink.syncErrorThrown = true;\n            sink.syncErrorValue = err;\n            sink.error(err);\n        }\n    };\n    /**\n     * @method forEach\n     * @param {Function} next a handler for each value emitted by the observable\n     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise\n     * @return {Promise} a promise that either resolves on observable completion or\n     *  rejects with the handled error\n     */\n    Observable.prototype.forEach = function (next, PromiseCtor) {\n        var _this = this;\n        if (!PromiseCtor) {\n            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {\n                PromiseCtor = root_1.root.Rx.config.Promise;\n            }\n            else if (root_1.root.Promise) {\n                PromiseCtor = root_1.root.Promise;\n            }\n        }\n        if (!PromiseCtor) {\n            throw new Error('no Promise impl found');\n        }\n        return new PromiseCtor(function (resolve, reject) {\n            // Must be declared in a separate statement to avoid a RefernceError when\n            // accessing subscription below in the closure due to Temporal Dead Zone.\n            var subscription;\n            subscription = _this.subscribe(function (value) {\n                if (subscription) {\n                    // if there is a subscription, then we can surmise\n                    // the next handling is asynchronous. Any errors thrown\n                    // need to be rejected explicitly and unsubscribe must be\n                    // called manually\n                    try {\n                        next(value);\n                    }\n                    catch (err) {\n                        reject(err);\n                        subscription.unsubscribe();\n                    }\n                }\n                else {\n                    // if there is NO subscription, then we're getting a nexted\n                    // value synchronously during subscription. We can just call it.\n                    // If it errors, Observable's `subscribe` will ensure the\n                    // unsubscription logic is called, then synchronously rethrow the error.\n                    // After that, Promise will trap the error and send it\n                    // down the rejection path.\n                    next(value);\n                }\n            }, reject, resolve);\n        });\n    };\n    /** @deprecated internal use only */ Observable.prototype._subscribe = function (subscriber) {\n        return this.source.subscribe(subscriber);\n    };\n    /**\n     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable\n     * @method Symbol.observable\n     * @return {Observable} this instance of the observable\n     */\n    Observable.prototype[observable_1.observable] = function () {\n        return this;\n    };\n    /* tslint:enable:max-line-length */\n    /**\n     * Used to stitch together functional operators into a chain.\n     * @method pipe\n     * @return {Observable} the Observable result of all of the operators having\n     * been called in the order they were passed in.\n     *\n     * @example\n     *\n     * import { map, filter, scan } from 'rxjs/operators';\n     *\n     * Rx.Observable.interval(1000)\n     *   .pipe(\n     *     filter(x => x % 2 === 0),\n     *     map(x => x + x),\n     *     scan((acc, x) => acc + x)\n     *   )\n     *   .subscribe(x => console.log(x))\n     */\n    Observable.prototype.pipe = function () {\n        var operations = [];\n        for (var _i = 0; _i < arguments.length; _i++) {\n            operations[_i - 0] = arguments[_i];\n        }\n        if (operations.length === 0) {\n            return this;\n        }\n        return pipe_1.pipeFromArray(operations)(this);\n    };\n    /* tslint:enable:max-line-length */\n    Observable.prototype.toPromise = function (PromiseCtor) {\n        var _this = this;\n        if (!PromiseCtor) {\n            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {\n                PromiseCtor = root_1.root.Rx.config.Promise;\n            }\n            else if (root_1.root.Promise) {\n                PromiseCtor = root_1.root.Promise;\n            }\n        }\n        if (!PromiseCtor) {\n            throw new Error('no Promise impl found');\n        }\n        return new PromiseCtor(function (resolve, reject) {\n            var value;\n            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });\n        });\n    };\n    // HACK: Since TypeScript inherits static properties too, we have to\n    // fight against TypeScript here so Subject can have a different static create signature\n    /**\n     * Creates a new cold Observable by calling the Observable constructor\n     * @static true\n     * @owner Observable\n     * @method create\n     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor\n     * @return {Observable} a new cold observable\n     */\n    Observable.create = function (subscribe) {\n        return new Observable(subscribe);\n    };\n    return Observable;\n}());\nexports.Observable = Observable;\n//# sourceMappingURL=Observable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Observable.js?");

/***/ }),

/***/ "./node_modules/rxjs/Observer.js":
/*!***************************************!*\
  !*** ./node_modules/rxjs/Observer.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nexports.empty = {\n    closed: true,\n    next: function (value) { },\n    error: function (err) { throw err; },\n    complete: function () { }\n};\n//# sourceMappingURL=Observer.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Observer.js?");

/***/ }),

/***/ "./node_modules/rxjs/OuterSubscriber.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/OuterSubscriber.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar OuterSubscriber = (function (_super) {\n    __extends(OuterSubscriber, _super);\n    function OuterSubscriber() {\n        _super.apply(this, arguments);\n    }\n    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        this.destination.next(innerValue);\n    };\n    OuterSubscriber.prototype.notifyError = function (error, innerSub) {\n        this.destination.error(error);\n    };\n    OuterSubscriber.prototype.notifyComplete = function (innerSub) {\n        this.destination.complete();\n    };\n    return OuterSubscriber;\n}(Subscriber_1.Subscriber));\nexports.OuterSubscriber = OuterSubscriber;\n//# sourceMappingURL=OuterSubscriber.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/OuterSubscriber.js?");

/***/ }),

/***/ "./node_modules/rxjs/Scheduler.js":
/*!****************************************!*\
  !*** ./node_modules/rxjs/Scheduler.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/**\n * An execution context and a data structure to order tasks and schedule their\n * execution. Provides a notion of (potentially virtual) time, through the\n * `now()` getter method.\n *\n * Each unit of work in a Scheduler is called an {@link Action}.\n *\n * ```ts\n * class Scheduler {\n *   now(): number;\n *   schedule(work, delay?, state?): Subscription;\n * }\n * ```\n *\n * @class Scheduler\n */\nvar Scheduler = (function () {\n    function Scheduler(SchedulerAction, now) {\n        if (now === void 0) { now = Scheduler.now; }\n        this.SchedulerAction = SchedulerAction;\n        this.now = now;\n    }\n    /**\n     * Schedules a function, `work`, for execution. May happen at some point in\n     * the future, according to the `delay` parameter, if specified. May be passed\n     * some context object, `state`, which will be passed to the `work` function.\n     *\n     * The given arguments will be processed an stored as an Action object in a\n     * queue of actions.\n     *\n     * @param {function(state: ?T): ?Subscription} work A function representing a\n     * task, or some unit of work to be executed by the Scheduler.\n     * @param {number} [delay] Time to wait before executing the work, where the\n     * time unit is implicit and defined by the Scheduler itself.\n     * @param {T} [state] Some contextual data that the `work` function uses when\n     * called by the Scheduler.\n     * @return {Subscription} A subscription in order to be able to unsubscribe\n     * the scheduled work.\n     */\n    Scheduler.prototype.schedule = function (work, delay, state) {\n        if (delay === void 0) { delay = 0; }\n        return new this.SchedulerAction(this, work).schedule(state, delay);\n    };\n    Scheduler.now = Date.now ? Date.now : function () { return +new Date(); };\n    return Scheduler;\n}());\nexports.Scheduler = Scheduler;\n//# sourceMappingURL=Scheduler.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Scheduler.js?");

/***/ }),

/***/ "./node_modules/rxjs/Subject.js":
/*!**************************************!*\
  !*** ./node_modules/rxjs/Subject.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ./Observable */ \"./node_modules/rxjs/Observable.js\");\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ \"./node_modules/rxjs/Subscription.js\");\nvar ObjectUnsubscribedError_1 = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ \"./node_modules/rxjs/util/ObjectUnsubscribedError.js\");\nvar SubjectSubscription_1 = __webpack_require__(/*! ./SubjectSubscription */ \"./node_modules/rxjs/SubjectSubscription.js\");\nvar rxSubscriber_1 = __webpack_require__(/*! ./symbol/rxSubscriber */ \"./node_modules/rxjs/symbol/rxSubscriber.js\");\n/**\n * @class SubjectSubscriber<T>\n */\nvar SubjectSubscriber = (function (_super) {\n    __extends(SubjectSubscriber, _super);\n    function SubjectSubscriber(destination) {\n        _super.call(this, destination);\n        this.destination = destination;\n    }\n    return SubjectSubscriber;\n}(Subscriber_1.Subscriber));\nexports.SubjectSubscriber = SubjectSubscriber;\n/**\n * @class Subject<T>\n */\nvar Subject = (function (_super) {\n    __extends(Subject, _super);\n    function Subject() {\n        _super.call(this);\n        this.observers = [];\n        this.closed = false;\n        this.isStopped = false;\n        this.hasError = false;\n        this.thrownError = null;\n    }\n    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {\n        return new SubjectSubscriber(this);\n    };\n    Subject.prototype.lift = function (operator) {\n        var subject = new AnonymousSubject(this, this);\n        subject.operator = operator;\n        return subject;\n    };\n    Subject.prototype.next = function (value) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        if (!this.isStopped) {\n            var observers = this.observers;\n            var len = observers.length;\n            var copy = observers.slice();\n            for (var i = 0; i < len; i++) {\n                copy[i].next(value);\n            }\n        }\n    };\n    Subject.prototype.error = function (err) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        this.hasError = true;\n        this.thrownError = err;\n        this.isStopped = true;\n        var observers = this.observers;\n        var len = observers.length;\n        var copy = observers.slice();\n        for (var i = 0; i < len; i++) {\n            copy[i].error(err);\n        }\n        this.observers.length = 0;\n    };\n    Subject.prototype.complete = function () {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        this.isStopped = true;\n        var observers = this.observers;\n        var len = observers.length;\n        var copy = observers.slice();\n        for (var i = 0; i < len; i++) {\n            copy[i].complete();\n        }\n        this.observers.length = 0;\n    };\n    Subject.prototype.unsubscribe = function () {\n        this.isStopped = true;\n        this.closed = true;\n        this.observers = null;\n    };\n    Subject.prototype._trySubscribe = function (subscriber) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        else {\n            return _super.prototype._trySubscribe.call(this, subscriber);\n        }\n    };\n    /** @deprecated internal use only */ Subject.prototype._subscribe = function (subscriber) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        else if (this.hasError) {\n            subscriber.error(this.thrownError);\n            return Subscription_1.Subscription.EMPTY;\n        }\n        else if (this.isStopped) {\n            subscriber.complete();\n            return Subscription_1.Subscription.EMPTY;\n        }\n        else {\n            this.observers.push(subscriber);\n            return new SubjectSubscription_1.SubjectSubscription(this, subscriber);\n        }\n    };\n    Subject.prototype.asObservable = function () {\n        var observable = new Observable_1.Observable();\n        observable.source = this;\n        return observable;\n    };\n    Subject.create = function (destination, source) {\n        return new AnonymousSubject(destination, source);\n    };\n    return Subject;\n}(Observable_1.Observable));\nexports.Subject = Subject;\n/**\n * @class AnonymousSubject<T>\n */\nvar AnonymousSubject = (function (_super) {\n    __extends(AnonymousSubject, _super);\n    function AnonymousSubject(destination, source) {\n        _super.call(this);\n        this.destination = destination;\n        this.source = source;\n    }\n    AnonymousSubject.prototype.next = function (value) {\n        var destination = this.destination;\n        if (destination && destination.next) {\n            destination.next(value);\n        }\n    };\n    AnonymousSubject.prototype.error = function (err) {\n        var destination = this.destination;\n        if (destination && destination.error) {\n            this.destination.error(err);\n        }\n    };\n    AnonymousSubject.prototype.complete = function () {\n        var destination = this.destination;\n        if (destination && destination.complete) {\n            this.destination.complete();\n        }\n    };\n    /** @deprecated internal use only */ AnonymousSubject.prototype._subscribe = function (subscriber) {\n        var source = this.source;\n        if (source) {\n            return this.source.subscribe(subscriber);\n        }\n        else {\n            return Subscription_1.Subscription.EMPTY;\n        }\n    };\n    return AnonymousSubject;\n}(Subject));\nexports.AnonymousSubject = AnonymousSubject;\n//# sourceMappingURL=Subject.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subject.js?");

/***/ }),

/***/ "./node_modules/rxjs/SubjectSubscription.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/SubjectSubscription.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ \"./node_modules/rxjs/Subscription.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SubjectSubscription = (function (_super) {\n    __extends(SubjectSubscription, _super);\n    function SubjectSubscription(subject, subscriber) {\n        _super.call(this);\n        this.subject = subject;\n        this.subscriber = subscriber;\n        this.closed = false;\n    }\n    SubjectSubscription.prototype.unsubscribe = function () {\n        if (this.closed) {\n            return;\n        }\n        this.closed = true;\n        var subject = this.subject;\n        var observers = subject.observers;\n        this.subject = null;\n        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {\n            return;\n        }\n        var subscriberIndex = observers.indexOf(this.subscriber);\n        if (subscriberIndex !== -1) {\n            observers.splice(subscriberIndex, 1);\n        }\n    };\n    return SubjectSubscription;\n}(Subscription_1.Subscription));\nexports.SubjectSubscription = SubjectSubscription;\n//# sourceMappingURL=SubjectSubscription.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/SubjectSubscription.js?");

/***/ }),

/***/ "./node_modules/rxjs/Subscriber.js":
/*!*****************************************!*\
  !*** ./node_modules/rxjs/Subscriber.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar isFunction_1 = __webpack_require__(/*! ./util/isFunction */ \"./node_modules/rxjs/util/isFunction.js\");\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ \"./node_modules/rxjs/Subscription.js\");\nvar Observer_1 = __webpack_require__(/*! ./Observer */ \"./node_modules/rxjs/Observer.js\");\nvar rxSubscriber_1 = __webpack_require__(/*! ./symbol/rxSubscriber */ \"./node_modules/rxjs/symbol/rxSubscriber.js\");\n/**\n * Implements the {@link Observer} interface and extends the\n * {@link Subscription} class. While the {@link Observer} is the public API for\n * consuming the values of an {@link Observable}, all Observers get converted to\n * a Subscriber, in order to provide Subscription-like capabilities such as\n * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for\n * implementing operators, but it is rarely used as a public API.\n *\n * @class Subscriber<T>\n */\nvar Subscriber = (function (_super) {\n    __extends(Subscriber, _super);\n    /**\n     * @param {Observer|function(value: T): void} [destinationOrNext] A partially\n     * defined Observer or a `next` callback function.\n     * @param {function(e: ?any): void} [error] The `error` callback of an\n     * Observer.\n     * @param {function(): void} [complete] The `complete` callback of an\n     * Observer.\n     */\n    function Subscriber(destinationOrNext, error, complete) {\n        _super.call(this);\n        this.syncErrorValue = null;\n        this.syncErrorThrown = false;\n        this.syncErrorThrowable = false;\n        this.isStopped = false;\n        switch (arguments.length) {\n            case 0:\n                this.destination = Observer_1.empty;\n                break;\n            case 1:\n                if (!destinationOrNext) {\n                    this.destination = Observer_1.empty;\n                    break;\n                }\n                if (typeof destinationOrNext === 'object') {\n                    // HACK(benlesh): To resolve an issue where Node users may have multiple\n                    // copies of rxjs in their node_modules directory.\n                    if (isTrustedSubscriber(destinationOrNext)) {\n                        var trustedSubscriber = destinationOrNext[rxSubscriber_1.rxSubscriber]();\n                        this.syncErrorThrowable = trustedSubscriber.syncErrorThrowable;\n                        this.destination = trustedSubscriber;\n                        trustedSubscriber.add(this);\n                    }\n                    else {\n                        this.syncErrorThrowable = true;\n                        this.destination = new SafeSubscriber(this, destinationOrNext);\n                    }\n                    break;\n                }\n            default:\n                this.syncErrorThrowable = true;\n                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);\n                break;\n        }\n    }\n    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () { return this; };\n    /**\n     * A static factory for a Subscriber, given a (potentially partial) definition\n     * of an Observer.\n     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.\n     * @param {function(e: ?any): void} [error] The `error` callback of an\n     * Observer.\n     * @param {function(): void} [complete] The `complete` callback of an\n     * Observer.\n     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)\n     * Observer represented by the given arguments.\n     */\n    Subscriber.create = function (next, error, complete) {\n        var subscriber = new Subscriber(next, error, complete);\n        subscriber.syncErrorThrowable = false;\n        return subscriber;\n    };\n    /**\n     * The {@link Observer} callback to receive notifications of type `next` from\n     * the Observable, with a value. The Observable may call this method 0 or more\n     * times.\n     * @param {T} [value] The `next` value.\n     * @return {void}\n     */\n    Subscriber.prototype.next = function (value) {\n        if (!this.isStopped) {\n            this._next(value);\n        }\n    };\n    /**\n     * The {@link Observer} callback to receive notifications of type `error` from\n     * the Observable, with an attached {@link Error}. Notifies the Observer that\n     * the Observable has experienced an error condition.\n     * @param {any} [err] The `error` exception.\n     * @return {void}\n     */\n    Subscriber.prototype.error = function (err) {\n        if (!this.isStopped) {\n            this.isStopped = true;\n            this._error(err);\n        }\n    };\n    /**\n     * The {@link Observer} callback to receive a valueless notification of type\n     * `complete` from the Observable. Notifies the Observer that the Observable\n     * has finished sending push-based notifications.\n     * @return {void}\n     */\n    Subscriber.prototype.complete = function () {\n        if (!this.isStopped) {\n            this.isStopped = true;\n            this._complete();\n        }\n    };\n    Subscriber.prototype.unsubscribe = function () {\n        if (this.closed) {\n            return;\n        }\n        this.isStopped = true;\n        _super.prototype.unsubscribe.call(this);\n    };\n    Subscriber.prototype._next = function (value) {\n        this.destination.next(value);\n    };\n    Subscriber.prototype._error = function (err) {\n        this.destination.error(err);\n        this.unsubscribe();\n    };\n    Subscriber.prototype._complete = function () {\n        this.destination.complete();\n        this.unsubscribe();\n    };\n    /** @deprecated internal use only */ Subscriber.prototype._unsubscribeAndRecycle = function () {\n        var _a = this, _parent = _a._parent, _parents = _a._parents;\n        this._parent = null;\n        this._parents = null;\n        this.unsubscribe();\n        this.closed = false;\n        this.isStopped = false;\n        this._parent = _parent;\n        this._parents = _parents;\n        return this;\n    };\n    return Subscriber;\n}(Subscription_1.Subscription));\nexports.Subscriber = Subscriber;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SafeSubscriber = (function (_super) {\n    __extends(SafeSubscriber, _super);\n    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {\n        _super.call(this);\n        this._parentSubscriber = _parentSubscriber;\n        var next;\n        var context = this;\n        if (isFunction_1.isFunction(observerOrNext)) {\n            next = observerOrNext;\n        }\n        else if (observerOrNext) {\n            next = observerOrNext.next;\n            error = observerOrNext.error;\n            complete = observerOrNext.complete;\n            if (observerOrNext !== Observer_1.empty) {\n                context = Object.create(observerOrNext);\n                if (isFunction_1.isFunction(context.unsubscribe)) {\n                    this.add(context.unsubscribe.bind(context));\n                }\n                context.unsubscribe = this.unsubscribe.bind(this);\n            }\n        }\n        this._context = context;\n        this._next = next;\n        this._error = error;\n        this._complete = complete;\n    }\n    SafeSubscriber.prototype.next = function (value) {\n        if (!this.isStopped && this._next) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (!_parentSubscriber.syncErrorThrowable) {\n                this.__tryOrUnsub(this._next, value);\n            }\n            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.error = function (err) {\n        if (!this.isStopped) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (this._error) {\n                if (!_parentSubscriber.syncErrorThrowable) {\n                    this.__tryOrUnsub(this._error, err);\n                    this.unsubscribe();\n                }\n                else {\n                    this.__tryOrSetError(_parentSubscriber, this._error, err);\n                    this.unsubscribe();\n                }\n            }\n            else if (!_parentSubscriber.syncErrorThrowable) {\n                this.unsubscribe();\n                throw err;\n            }\n            else {\n                _parentSubscriber.syncErrorValue = err;\n                _parentSubscriber.syncErrorThrown = true;\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.complete = function () {\n        var _this = this;\n        if (!this.isStopped) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (this._complete) {\n                var wrappedComplete = function () { return _this._complete.call(_this._context); };\n                if (!_parentSubscriber.syncErrorThrowable) {\n                    this.__tryOrUnsub(wrappedComplete);\n                    this.unsubscribe();\n                }\n                else {\n                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);\n                    this.unsubscribe();\n                }\n            }\n            else {\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {\n        try {\n            fn.call(this._context, value);\n        }\n        catch (err) {\n            this.unsubscribe();\n            throw err;\n        }\n    };\n    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {\n        try {\n            fn.call(this._context, value);\n        }\n        catch (err) {\n            parent.syncErrorValue = err;\n            parent.syncErrorThrown = true;\n            return true;\n        }\n        return false;\n    };\n    /** @deprecated internal use only */ SafeSubscriber.prototype._unsubscribe = function () {\n        var _parentSubscriber = this._parentSubscriber;\n        this._context = null;\n        this._parentSubscriber = null;\n        _parentSubscriber.unsubscribe();\n    };\n    return SafeSubscriber;\n}(Subscriber));\nfunction isTrustedSubscriber(obj) {\n    return obj instanceof Subscriber || ('syncErrorThrowable' in obj && obj[rxSubscriber_1.rxSubscriber]);\n}\n//# sourceMappingURL=Subscriber.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subscriber.js?");

/***/ }),

/***/ "./node_modules/rxjs/Subscription.js":
/*!*******************************************!*\
  !*** ./node_modules/rxjs/Subscription.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar isArray_1 = __webpack_require__(/*! ./util/isArray */ \"./node_modules/rxjs/util/isArray.js\");\nvar isObject_1 = __webpack_require__(/*! ./util/isObject */ \"./node_modules/rxjs/util/isObject.js\");\nvar isFunction_1 = __webpack_require__(/*! ./util/isFunction */ \"./node_modules/rxjs/util/isFunction.js\");\nvar tryCatch_1 = __webpack_require__(/*! ./util/tryCatch */ \"./node_modules/rxjs/util/tryCatch.js\");\nvar errorObject_1 = __webpack_require__(/*! ./util/errorObject */ \"./node_modules/rxjs/util/errorObject.js\");\nvar UnsubscriptionError_1 = __webpack_require__(/*! ./util/UnsubscriptionError */ \"./node_modules/rxjs/util/UnsubscriptionError.js\");\n/**\n * Represents a disposable resource, such as the execution of an Observable. A\n * Subscription has one important method, `unsubscribe`, that takes no argument\n * and just disposes the resource held by the subscription.\n *\n * Additionally, subscriptions may be grouped together through the `add()`\n * method, which will attach a child Subscription to the current Subscription.\n * When a Subscription is unsubscribed, all its children (and its grandchildren)\n * will be unsubscribed as well.\n *\n * @class Subscription\n */\nvar Subscription = (function () {\n    /**\n     * @param {function(): void} [unsubscribe] A function describing how to\n     * perform the disposal of resources when the `unsubscribe` method is called.\n     */\n    function Subscription(unsubscribe) {\n        /**\n         * A flag to indicate whether this Subscription has already been unsubscribed.\n         * @type {boolean}\n         */\n        this.closed = false;\n        this._parent = null;\n        this._parents = null;\n        this._subscriptions = null;\n        if (unsubscribe) {\n            this._unsubscribe = unsubscribe;\n        }\n    }\n    /**\n     * Disposes the resources held by the subscription. May, for instance, cancel\n     * an ongoing Observable execution or cancel any other type of work that\n     * started when the Subscription was created.\n     * @return {void}\n     */\n    Subscription.prototype.unsubscribe = function () {\n        var hasErrors = false;\n        var errors;\n        if (this.closed) {\n            return;\n        }\n        var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;\n        this.closed = true;\n        this._parent = null;\n        this._parents = null;\n        // null out _subscriptions first so any child subscriptions that attempt\n        // to remove themselves from this subscription will noop\n        this._subscriptions = null;\n        var index = -1;\n        var len = _parents ? _parents.length : 0;\n        // if this._parent is null, then so is this._parents, and we\n        // don't have to remove ourselves from any parent subscriptions.\n        while (_parent) {\n            _parent.remove(this);\n            // if this._parents is null or index >= len,\n            // then _parent is set to null, and the loop exits\n            _parent = ++index < len && _parents[index] || null;\n        }\n        if (isFunction_1.isFunction(_unsubscribe)) {\n            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);\n            if (trial === errorObject_1.errorObject) {\n                hasErrors = true;\n                errors = errors || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ?\n                    flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);\n            }\n        }\n        if (isArray_1.isArray(_subscriptions)) {\n            index = -1;\n            len = _subscriptions.length;\n            while (++index < len) {\n                var sub = _subscriptions[index];\n                if (isObject_1.isObject(sub)) {\n                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);\n                    if (trial === errorObject_1.errorObject) {\n                        hasErrors = true;\n                        errors = errors || [];\n                        var err = errorObject_1.errorObject.e;\n                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {\n                            errors = errors.concat(flattenUnsubscriptionErrors(err.errors));\n                        }\n                        else {\n                            errors.push(err);\n                        }\n                    }\n                }\n            }\n        }\n        if (hasErrors) {\n            throw new UnsubscriptionError_1.UnsubscriptionError(errors);\n        }\n    };\n    /**\n     * Adds a tear down to be called during the unsubscribe() of this\n     * Subscription.\n     *\n     * If the tear down being added is a subscription that is already\n     * unsubscribed, is the same reference `add` is being called on, or is\n     * `Subscription.EMPTY`, it will not be added.\n     *\n     * If this subscription is already in an `closed` state, the passed\n     * tear down logic will be executed immediately.\n     *\n     * @param {TeardownLogic} teardown The additional logic to execute on\n     * teardown.\n     * @return {Subscription} Returns the Subscription used or created to be\n     * added to the inner subscriptions list. This Subscription can be used with\n     * `remove()` to remove the passed teardown logic from the inner subscriptions\n     * list.\n     */\n    Subscription.prototype.add = function (teardown) {\n        if (!teardown || (teardown === Subscription.EMPTY)) {\n            return Subscription.EMPTY;\n        }\n        if (teardown === this) {\n            return this;\n        }\n        var subscription = teardown;\n        switch (typeof teardown) {\n            case 'function':\n                subscription = new Subscription(teardown);\n            case 'object':\n                if (subscription.closed || typeof subscription.unsubscribe !== 'function') {\n                    return subscription;\n                }\n                else if (this.closed) {\n                    subscription.unsubscribe();\n                    return subscription;\n                }\n                else if (typeof subscription._addParent !== 'function' /* quack quack */) {\n                    var tmp = subscription;\n                    subscription = new Subscription();\n                    subscription._subscriptions = [tmp];\n                }\n                break;\n            default:\n                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');\n        }\n        var subscriptions = this._subscriptions || (this._subscriptions = []);\n        subscriptions.push(subscription);\n        subscription._addParent(this);\n        return subscription;\n    };\n    /**\n     * Removes a Subscription from the internal list of subscriptions that will\n     * unsubscribe during the unsubscribe process of this Subscription.\n     * @param {Subscription} subscription The subscription to remove.\n     * @return {void}\n     */\n    Subscription.prototype.remove = function (subscription) {\n        var subscriptions = this._subscriptions;\n        if (subscriptions) {\n            var subscriptionIndex = subscriptions.indexOf(subscription);\n            if (subscriptionIndex !== -1) {\n                subscriptions.splice(subscriptionIndex, 1);\n            }\n        }\n    };\n    Subscription.prototype._addParent = function (parent) {\n        var _a = this, _parent = _a._parent, _parents = _a._parents;\n        if (!_parent || _parent === parent) {\n            // If we don't have a parent, or the new parent is the same as the\n            // current parent, then set this._parent to the new parent.\n            this._parent = parent;\n        }\n        else if (!_parents) {\n            // If there's already one parent, but not multiple, allocate an Array to\n            // store the rest of the parent Subscriptions.\n            this._parents = [parent];\n        }\n        else if (_parents.indexOf(parent) === -1) {\n            // Only add the new parent to the _parents list if it's not already there.\n            _parents.push(parent);\n        }\n    };\n    Subscription.EMPTY = (function (empty) {\n        empty.closed = true;\n        return empty;\n    }(new Subscription()));\n    return Subscription;\n}());\nexports.Subscription = Subscription;\nfunction flattenUnsubscriptionErrors(errors) {\n    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError_1.UnsubscriptionError) ? err.errors : err); }, []);\n}\n//# sourceMappingURL=Subscription.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subscription.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/observable/from.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/observable/from.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar from_1 = __webpack_require__(/*! ../../observable/from */ \"./node_modules/rxjs/observable/from.js\");\nObservable_1.Observable.from = from_1.from;\n//# sourceMappingURL=from.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/from.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/observable/fromEvent.js":
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/add/observable/fromEvent.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar fromEvent_1 = __webpack_require__(/*! ../../observable/fromEvent */ \"./node_modules/rxjs/observable/fromEvent.js\");\nObservable_1.Observable.fromEvent = fromEvent_1.fromEvent;\n//# sourceMappingURL=fromEvent.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/fromEvent.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/observable/fromPromise.js":
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/add/observable/fromPromise.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar fromPromise_1 = __webpack_require__(/*! ../../observable/fromPromise */ \"./node_modules/rxjs/observable/fromPromise.js\");\nObservable_1.Observable.fromPromise = fromPromise_1.fromPromise;\n//# sourceMappingURL=fromPromise.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/fromPromise.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/observable/interval.js":
/*!******************************************************!*\
  !*** ./node_modules/rxjs/add/observable/interval.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar interval_1 = __webpack_require__(/*! ../../observable/interval */ \"./node_modules/rxjs/observable/interval.js\");\nObservable_1.Observable.interval = interval_1.interval;\n//# sourceMappingURL=interval.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/interval.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/observable/of.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/observable/of.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar of_1 = __webpack_require__(/*! ../../observable/of */ \"./node_modules/rxjs/observable/of.js\");\nObservable_1.Observable.of = of_1.of;\n//# sourceMappingURL=of.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/of.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/buffer.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/operator/buffer.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar buffer_1 = __webpack_require__(/*! ../../operator/buffer */ \"./node_modules/rxjs/operator/buffer.js\");\nObservable_1.Observable.prototype.buffer = buffer_1.buffer;\n//# sourceMappingURL=buffer.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/buffer.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/catch.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/add/operator/catch.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar catch_1 = __webpack_require__(/*! ../../operator/catch */ \"./node_modules/rxjs/operator/catch.js\");\nObservable_1.Observable.prototype.catch = catch_1._catch;\nObservable_1.Observable.prototype._catch = catch_1._catch;\n//# sourceMappingURL=catch.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/catch.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/concat.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/operator/concat.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar concat_1 = __webpack_require__(/*! ../../operator/concat */ \"./node_modules/rxjs/operator/concat.js\");\nObservable_1.Observable.prototype.concat = concat_1.concat;\n//# sourceMappingURL=concat.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/concat.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/concatMap.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/concatMap.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar concatMap_1 = __webpack_require__(/*! ../../operator/concatMap */ \"./node_modules/rxjs/operator/concatMap.js\");\nObservable_1.Observable.prototype.concatMap = concatMap_1.concatMap;\n//# sourceMappingURL=concatMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/concatMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/debounceTime.js":
/*!********************************************************!*\
  !*** ./node_modules/rxjs/add/operator/debounceTime.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar debounceTime_1 = __webpack_require__(/*! ../../operator/debounceTime */ \"./node_modules/rxjs/operator/debounceTime.js\");\nObservable_1.Observable.prototype.debounceTime = debounceTime_1.debounceTime;\n//# sourceMappingURL=debounceTime.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/debounceTime.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/delay.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/add/operator/delay.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar delay_1 = __webpack_require__(/*! ../../operator/delay */ \"./node_modules/rxjs/operator/delay.js\");\nObservable_1.Observable.prototype.delay = delay_1.delay;\n//# sourceMappingURL=delay.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/delay.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/distinctUntilChanged.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/add/operator/distinctUntilChanged.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar distinctUntilChanged_1 = __webpack_require__(/*! ../../operator/distinctUntilChanged */ \"./node_modules/rxjs/operator/distinctUntilChanged.js\");\nObservable_1.Observable.prototype.distinctUntilChanged = distinctUntilChanged_1.distinctUntilChanged;\n//# sourceMappingURL=distinctUntilChanged.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/distinctUntilChanged.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/do.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/add/operator/do.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar do_1 = __webpack_require__(/*! ../../operator/do */ \"./node_modules/rxjs/operator/do.js\");\nObservable_1.Observable.prototype.do = do_1._do;\nObservable_1.Observable.prototype._do = do_1._do;\n//# sourceMappingURL=do.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/do.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/filter.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/operator/filter.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar filter_1 = __webpack_require__(/*! ../../operator/filter */ \"./node_modules/rxjs/operator/filter.js\");\nObservable_1.Observable.prototype.filter = filter_1.filter;\n//# sourceMappingURL=filter.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/filter.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/finally.js":
/*!***************************************************!*\
  !*** ./node_modules/rxjs/add/operator/finally.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar finally_1 = __webpack_require__(/*! ../../operator/finally */ \"./node_modules/rxjs/operator/finally.js\");\nObservable_1.Observable.prototype.finally = finally_1._finally;\nObservable_1.Observable.prototype._finally = finally_1._finally;\n//# sourceMappingURL=finally.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/finally.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/last.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/operator/last.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar last_1 = __webpack_require__(/*! ../../operator/last */ \"./node_modules/rxjs/operator/last.js\");\nObservable_1.Observable.prototype.last = last_1.last;\n//# sourceMappingURL=last.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/last.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/map.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/add/operator/map.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar map_1 = __webpack_require__(/*! ../../operator/map */ \"./node_modules/rxjs/operator/map.js\");\nObservable_1.Observable.prototype.map = map_1.map;\n//# sourceMappingURL=map.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/map.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/merge.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/add/operator/merge.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar merge_1 = __webpack_require__(/*! ../../operator/merge */ \"./node_modules/rxjs/operator/merge.js\");\nObservable_1.Observable.prototype.merge = merge_1.merge;\n//# sourceMappingURL=merge.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/merge.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/mergeMap.js":
/*!****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/mergeMap.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar mergeMap_1 = __webpack_require__(/*! ../../operator/mergeMap */ \"./node_modules/rxjs/operator/mergeMap.js\");\nObservable_1.Observable.prototype.mergeMap = mergeMap_1.mergeMap;\nObservable_1.Observable.prototype.flatMap = mergeMap_1.mergeMap;\n//# sourceMappingURL=mergeMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/mergeMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/race.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/operator/race.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar race_1 = __webpack_require__(/*! ../../operator/race */ \"./node_modules/rxjs/operator/race.js\");\nObservable_1.Observable.prototype.race = race_1.race;\n//# sourceMappingURL=race.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/race.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/skip.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/operator/skip.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar skip_1 = __webpack_require__(/*! ../../operator/skip */ \"./node_modules/rxjs/operator/skip.js\");\nObservable_1.Observable.prototype.skip = skip_1.skip;\n//# sourceMappingURL=skip.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/skip.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/startWith.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/startWith.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar startWith_1 = __webpack_require__(/*! ../../operator/startWith */ \"./node_modules/rxjs/operator/startWith.js\");\nObservable_1.Observable.prototype.startWith = startWith_1.startWith;\n//# sourceMappingURL=startWith.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/startWith.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/take.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/operator/take.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar take_1 = __webpack_require__(/*! ../../operator/take */ \"./node_modules/rxjs/operator/take.js\");\nObservable_1.Observable.prototype.take = take_1.take;\n//# sourceMappingURL=take.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/take.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/takeUntil.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/takeUntil.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar takeUntil_1 = __webpack_require__(/*! ../../operator/takeUntil */ \"./node_modules/rxjs/operator/takeUntil.js\");\nObservable_1.Observable.prototype.takeUntil = takeUntil_1.takeUntil;\n//# sourceMappingURL=takeUntil.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/takeUntil.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/toArray.js":
/*!***************************************************!*\
  !*** ./node_modules/rxjs/add/operator/toArray.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar toArray_1 = __webpack_require__(/*! ../../operator/toArray */ \"./node_modules/rxjs/operator/toArray.js\");\nObservable_1.Observable.prototype.toArray = toArray_1.toArray;\n//# sourceMappingURL=toArray.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/toArray.js?");

/***/ }),

/***/ "./node_modules/rxjs/add/operator/toPromise.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/toPromise.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// HACK: does nothing, because `toPromise` now lives on the `Observable` itself.\n// leaving this module here to prevent breakage.\n//# sourceMappingURL=toPromise.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/toPromise.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/ArrayLikeObservable.js":
/*!*************************************************************!*\
  !*** ./node_modules/rxjs/observable/ArrayLikeObservable.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar ScalarObservable_1 = __webpack_require__(/*! ./ScalarObservable */ \"./node_modules/rxjs/observable/ScalarObservable.js\");\nvar EmptyObservable_1 = __webpack_require__(/*! ./EmptyObservable */ \"./node_modules/rxjs/observable/EmptyObservable.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar ArrayLikeObservable = (function (_super) {\n    __extends(ArrayLikeObservable, _super);\n    function ArrayLikeObservable(arrayLike, scheduler) {\n        _super.call(this);\n        this.arrayLike = arrayLike;\n        this.scheduler = scheduler;\n        if (!scheduler && arrayLike.length === 1) {\n            this._isScalar = true;\n            this.value = arrayLike[0];\n        }\n    }\n    ArrayLikeObservable.create = function (arrayLike, scheduler) {\n        var length = arrayLike.length;\n        if (length === 0) {\n            return new EmptyObservable_1.EmptyObservable();\n        }\n        else if (length === 1) {\n            return new ScalarObservable_1.ScalarObservable(arrayLike[0], scheduler);\n        }\n        else {\n            return new ArrayLikeObservable(arrayLike, scheduler);\n        }\n    };\n    ArrayLikeObservable.dispatch = function (state) {\n        var arrayLike = state.arrayLike, index = state.index, length = state.length, subscriber = state.subscriber;\n        if (subscriber.closed) {\n            return;\n        }\n        if (index >= length) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(arrayLike[index]);\n        state.index = index + 1;\n        this.schedule(state);\n    };\n    /** @deprecated internal use only */ ArrayLikeObservable.prototype._subscribe = function (subscriber) {\n        var index = 0;\n        var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;\n        var length = arrayLike.length;\n        if (scheduler) {\n            return scheduler.schedule(ArrayLikeObservable.dispatch, 0, {\n                arrayLike: arrayLike, index: index, length: length, subscriber: subscriber\n            });\n        }\n        else {\n            for (var i = 0; i < length && !subscriber.closed; i++) {\n                subscriber.next(arrayLike[i]);\n            }\n            subscriber.complete();\n        }\n    };\n    return ArrayLikeObservable;\n}(Observable_1.Observable));\nexports.ArrayLikeObservable = ArrayLikeObservable;\n//# sourceMappingURL=ArrayLikeObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ArrayLikeObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/ArrayObservable.js":
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/observable/ArrayObservable.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar ScalarObservable_1 = __webpack_require__(/*! ./ScalarObservable */ \"./node_modules/rxjs/observable/ScalarObservable.js\");\nvar EmptyObservable_1 = __webpack_require__(/*! ./EmptyObservable */ \"./node_modules/rxjs/observable/EmptyObservable.js\");\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ \"./node_modules/rxjs/util/isScheduler.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar ArrayObservable = (function (_super) {\n    __extends(ArrayObservable, _super);\n    function ArrayObservable(array, scheduler) {\n        _super.call(this);\n        this.array = array;\n        this.scheduler = scheduler;\n        if (!scheduler && array.length === 1) {\n            this._isScalar = true;\n            this.value = array[0];\n        }\n    }\n    ArrayObservable.create = function (array, scheduler) {\n        return new ArrayObservable(array, scheduler);\n    };\n    /**\n     * Creates an Observable that emits some values you specify as arguments,\n     * immediately one after the other, and then emits a complete notification.\n     *\n     * <span class=\"informal\">Emits the arguments you provide, then completes.\n     * </span>\n     *\n     * <img src=\"./img/of.png\" width=\"100%\">\n     *\n     * This static operator is useful for creating a simple Observable that only\n     * emits the arguments given, and the complete notification thereafter. It can\n     * be used for composing with other Observables, such as with {@link concat}.\n     * By default, it uses a `null` IScheduler, which means the `next`\n     * notifications are sent synchronously, although with a different IScheduler\n     * it is possible to determine when those notifications will be delivered.\n     *\n     * @example <caption>Emit 10, 20, 30, then 'a', 'b', 'c', then start ticking every second.</caption>\n     * var numbers = Rx.Observable.of(10, 20, 30);\n     * var letters = Rx.Observable.of('a', 'b', 'c');\n     * var interval = Rx.Observable.interval(1000);\n     * var result = numbers.concat(letters).concat(interval);\n     * result.subscribe(x => console.log(x));\n     *\n     * @see {@link create}\n     * @see {@link empty}\n     * @see {@link never}\n     * @see {@link throw}\n     *\n     * @param {...T} values Arguments that represent `next` values to be emitted.\n     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling\n     * the emissions of the `next` notifications.\n     * @return {Observable<T>} An Observable that emits each given input value.\n     * @static true\n     * @name of\n     * @owner Observable\n     */\n    ArrayObservable.of = function () {\n        var array = [];\n        for (var _i = 0; _i < arguments.length; _i++) {\n            array[_i - 0] = arguments[_i];\n        }\n        var scheduler = array[array.length - 1];\n        if (isScheduler_1.isScheduler(scheduler)) {\n            array.pop();\n        }\n        else {\n            scheduler = null;\n        }\n        var len = array.length;\n        if (len > 1) {\n            return new ArrayObservable(array, scheduler);\n        }\n        else if (len === 1) {\n            return new ScalarObservable_1.ScalarObservable(array[0], scheduler);\n        }\n        else {\n            return new EmptyObservable_1.EmptyObservable(scheduler);\n        }\n    };\n    ArrayObservable.dispatch = function (state) {\n        var array = state.array, index = state.index, count = state.count, subscriber = state.subscriber;\n        if (index >= count) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(array[index]);\n        if (subscriber.closed) {\n            return;\n        }\n        state.index = index + 1;\n        this.schedule(state);\n    };\n    /** @deprecated internal use only */ ArrayObservable.prototype._subscribe = function (subscriber) {\n        var index = 0;\n        var array = this.array;\n        var count = array.length;\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(ArrayObservable.dispatch, 0, {\n                array: array, index: index, count: count, subscriber: subscriber\n            });\n        }\n        else {\n            for (var i = 0; i < count && !subscriber.closed; i++) {\n                subscriber.next(array[i]);\n            }\n            subscriber.complete();\n        }\n    };\n    return ArrayObservable;\n}(Observable_1.Observable));\nexports.ArrayObservable = ArrayObservable;\n//# sourceMappingURL=ArrayObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ArrayObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/EmptyObservable.js":
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/observable/EmptyObservable.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar EmptyObservable = (function (_super) {\n    __extends(EmptyObservable, _super);\n    function EmptyObservable(scheduler) {\n        _super.call(this);\n        this.scheduler = scheduler;\n    }\n    /**\n     * Creates an Observable that emits no items to the Observer and immediately\n     * emits a complete notification.\n     *\n     * <span class=\"informal\">Just emits 'complete', and nothing else.\n     * </span>\n     *\n     * <img src=\"./img/empty.png\" width=\"100%\">\n     *\n     * This static operator is useful for creating a simple Observable that only\n     * emits the complete notification. It can be used for composing with other\n     * Observables, such as in a {@link mergeMap}.\n     *\n     * @example <caption>Emit the number 7, then complete.</caption>\n     * var result = Rx.Observable.empty().startWith(7);\n     * result.subscribe(x => console.log(x));\n     *\n     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>\n     * var interval = Rx.Observable.interval(1000);\n     * var result = interval.mergeMap(x =>\n     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()\n     * );\n     * result.subscribe(x => console.log(x));\n     *\n     * // Results in the following to the console:\n     * // x is equal to the count on the interval eg(0,1,2,3,...)\n     * // x will occur every 1000ms\n     * // if x % 2 is equal to 1 print abc\n     * // if x % 2 is not equal to 1 nothing will be output\n     *\n     * @see {@link create}\n     * @see {@link never}\n     * @see {@link of}\n     * @see {@link throw}\n     *\n     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling\n     * the emission of the complete notification.\n     * @return {Observable} An \"empty\" Observable: emits only the complete\n     * notification.\n     * @static true\n     * @name empty\n     * @owner Observable\n     */\n    EmptyObservable.create = function (scheduler) {\n        return new EmptyObservable(scheduler);\n    };\n    EmptyObservable.dispatch = function (arg) {\n        var subscriber = arg.subscriber;\n        subscriber.complete();\n    };\n    /** @deprecated internal use only */ EmptyObservable.prototype._subscribe = function (subscriber) {\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber: subscriber });\n        }\n        else {\n            subscriber.complete();\n        }\n    };\n    return EmptyObservable;\n}(Observable_1.Observable));\nexports.EmptyObservable = EmptyObservable;\n//# sourceMappingURL=EmptyObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/EmptyObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/FromEventObservable.js":
/*!*************************************************************!*\
  !*** ./node_modules/rxjs/observable/FromEventObservable.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar tryCatch_1 = __webpack_require__(/*! ../util/tryCatch */ \"./node_modules/rxjs/util/tryCatch.js\");\nvar isFunction_1 = __webpack_require__(/*! ../util/isFunction */ \"./node_modules/rxjs/util/isFunction.js\");\nvar errorObject_1 = __webpack_require__(/*! ../util/errorObject */ \"./node_modules/rxjs/util/errorObject.js\");\nvar Subscription_1 = __webpack_require__(/*! ../Subscription */ \"./node_modules/rxjs/Subscription.js\");\nvar toString = Object.prototype.toString;\nfunction isNodeStyleEventEmitter(sourceObj) {\n    return !!sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';\n}\nfunction isJQueryStyleEventEmitter(sourceObj) {\n    return !!sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';\n}\nfunction isNodeList(sourceObj) {\n    return !!sourceObj && toString.call(sourceObj) === '[object NodeList]';\n}\nfunction isHTMLCollection(sourceObj) {\n    return !!sourceObj && toString.call(sourceObj) === '[object HTMLCollection]';\n}\nfunction isEventTarget(sourceObj) {\n    return !!sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';\n}\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar FromEventObservable = (function (_super) {\n    __extends(FromEventObservable, _super);\n    function FromEventObservable(sourceObj, eventName, selector, options) {\n        _super.call(this);\n        this.sourceObj = sourceObj;\n        this.eventName = eventName;\n        this.selector = selector;\n        this.options = options;\n    }\n    /* tslint:enable:max-line-length */\n    /**\n     * Creates an Observable that emits events of a specific type coming from the\n     * given event target.\n     *\n     * <span class=\"informal\">Creates an Observable from DOM events, or Node.js\n     * EventEmitter events or others.</span>\n     *\n     * <img src=\"./img/fromEvent.png\" width=\"100%\">\n     *\n     * `fromEvent` accepts as a first argument event target, which is an object with methods\n     * for registering event handler functions. As a second argument it takes string that indicates\n     * type of event we want to listen for. `fromEvent` supports selected types of event targets,\n     * which are described in detail below. If your event target does not match any of the ones listed,\n     * you should use {@link fromEventPattern}, which can be used on arbitrary APIs.\n     * When it comes to APIs supported by `fromEvent`, their methods for adding and removing event\n     * handler functions have different names, but they all accept a string describing event type\n     * and function itself, which will be called whenever said event happens.\n     *\n     * Every time resulting Observable is subscribed, event handler function will be registered\n     * to event target on given event type. When that event fires, value\n     * passed as a first argument to registered function will be emitted by output Observable.\n     * When Observable is unsubscribed, function will be unregistered from event target.\n     *\n     * Note that if event target calls registered function with more than one argument, second\n     * and following arguments will not appear in resulting stream. In order to get access to them,\n     * you can pass to `fromEvent` optional project function, which will be called with all arguments\n     * passed to event handler. Output Observable will then emit value returned by project function,\n     * instead of the usual value.\n     *\n     * Remember that event targets listed below are checked via duck typing. It means that\n     * no matter what kind of object you have and no matter what environment you work in,\n     * you can safely use `fromEvent` on that object if it exposes described methods (provided\n     * of course they behave as was described above). So for example if Node.js library exposes\n     * event target which has the same method names as DOM EventTarget, `fromEvent` is still\n     * a good choice.\n     *\n     * If the API you use is more callback then event handler oriented (subscribed\n     * callback function fires only once and thus there is no need to manually\n     * unregister it), you should use {@link bindCallback} or {@link bindNodeCallback}\n     * instead.\n     *\n     * `fromEvent` supports following types of event targets:\n     *\n     * **DOM EventTarget**\n     *\n     * This is an object with `addEventListener` and `removeEventListener` methods.\n     *\n     * In the browser, `addEventListener` accepts - apart from event type string and event\n     * handler function arguments - optional third parameter, which is either an object or boolean,\n     * both used for additional configuration how and when passed function will be called. When\n     * `fromEvent` is used with event target of that type, you can provide this values\n     * as third parameter as well.\n     *\n     * **Node.js EventEmitter**\n     *\n     * An object with `addListener` and `removeListener` methods.\n     *\n     * **JQuery-style event target**\n     *\n     * An object with `on` and `off` methods\n     *\n     * **DOM NodeList**\n     *\n     * List of DOM Nodes, returned for example by `document.querySelectorAll` or `Node.childNodes`.\n     *\n     * Although this collection is not event target in itself, `fromEvent` will iterate over all Nodes\n     * it contains and install event handler function in every of them. When returned Observable\n     * is unsubscribed, function will be removed from all Nodes.\n     *\n     * **DOM HtmlCollection**\n     *\n     * Just as in case of NodeList it is a collection of DOM nodes. Here as well event handler function is\n     * installed and removed in each of elements.\n     *\n     *\n     * @example <caption>Emits clicks happening on the DOM document</caption>\n     * var clicks = Rx.Observable.fromEvent(document, 'click');\n     * clicks.subscribe(x => console.log(x));\n     *\n     * // Results in:\n     * // MouseEvent object logged to console every time a click\n     * // occurs on the document.\n     *\n     *\n     * @example <caption>Use addEventListener with capture option</caption>\n     * var clicksInDocument = Rx.Observable.fromEvent(document, 'click', true); // note optional configuration parameter\n     *                                                                          // which will be passed to addEventListener\n     * var clicksInDiv = Rx.Observable.fromEvent(someDivInDocument, 'click');\n     *\n     * clicksInDocument.subscribe(() => console.log('document'));\n     * clicksInDiv.subscribe(() => console.log('div'));\n     *\n     * // By default events bubble UP in DOM tree, so normally\n     * // when we would click on div in document\n     * // \"div\" would be logged first and then \"document\".\n     * // Since we specified optional `capture` option, document\n     * // will catch event when it goes DOWN DOM tree, so console\n     * // will log \"document\" and then \"div\".\n     *\n     * @see {@link bindCallback}\n     * @see {@link bindNodeCallback}\n     * @see {@link fromEventPattern}\n     *\n     * @param {EventTargetLike} target The DOM EventTarget, Node.js\n     * EventEmitter, JQuery-like event target, NodeList or HTMLCollection to attach the event handler to.\n     * @param {string} eventName The event name of interest, being emitted by the\n     * `target`.\n     * @param {EventListenerOptions} [options] Options to pass through to addEventListener\n     * @param {SelectorMethodSignature<T>} [selector] An optional function to\n     * post-process results. It takes the arguments from the event handler and\n     * should return a single value.\n     * @return {Observable<T>}\n     * @static true\n     * @name fromEvent\n     * @owner Observable\n     */\n    FromEventObservable.create = function (target, eventName, options, selector) {\n        if (isFunction_1.isFunction(options)) {\n            selector = options;\n            options = undefined;\n        }\n        return new FromEventObservable(target, eventName, selector, options);\n    };\n    FromEventObservable.setupSubscription = function (sourceObj, eventName, handler, subscriber, options) {\n        var unsubscribe;\n        if (isNodeList(sourceObj) || isHTMLCollection(sourceObj)) {\n            for (var i = 0, len = sourceObj.length; i < len; i++) {\n                FromEventObservable.setupSubscription(sourceObj[i], eventName, handler, subscriber, options);\n            }\n        }\n        else if (isEventTarget(sourceObj)) {\n            var source_1 = sourceObj;\n            sourceObj.addEventListener(eventName, handler, options);\n            unsubscribe = function () { return source_1.removeEventListener(eventName, handler, options); };\n        }\n        else if (isJQueryStyleEventEmitter(sourceObj)) {\n            var source_2 = sourceObj;\n            sourceObj.on(eventName, handler);\n            unsubscribe = function () { return source_2.off(eventName, handler); };\n        }\n        else if (isNodeStyleEventEmitter(sourceObj)) {\n            var source_3 = sourceObj;\n            sourceObj.addListener(eventName, handler);\n            unsubscribe = function () { return source_3.removeListener(eventName, handler); };\n        }\n        else {\n            throw new TypeError('Invalid event target');\n        }\n        subscriber.add(new Subscription_1.Subscription(unsubscribe));\n    };\n    /** @deprecated internal use only */ FromEventObservable.prototype._subscribe = function (subscriber) {\n        var sourceObj = this.sourceObj;\n        var eventName = this.eventName;\n        var options = this.options;\n        var selector = this.selector;\n        var handler = selector ? function () {\n            var args = [];\n            for (var _i = 0; _i < arguments.length; _i++) {\n                args[_i - 0] = arguments[_i];\n            }\n            var result = tryCatch_1.tryCatch(selector).apply(void 0, args);\n            if (result === errorObject_1.errorObject) {\n                subscriber.error(errorObject_1.errorObject.e);\n            }\n            else {\n                subscriber.next(result);\n            }\n        } : function (e) { return subscriber.next(e); };\n        FromEventObservable.setupSubscription(sourceObj, eventName, handler, subscriber, options);\n    };\n    return FromEventObservable;\n}(Observable_1.Observable));\nexports.FromEventObservable = FromEventObservable;\n//# sourceMappingURL=FromEventObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/FromEventObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/FromObservable.js":
/*!********************************************************!*\
  !*** ./node_modules/rxjs/observable/FromObservable.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ \"./node_modules/rxjs/util/isArray.js\");\nvar isArrayLike_1 = __webpack_require__(/*! ../util/isArrayLike */ \"./node_modules/rxjs/util/isArrayLike.js\");\nvar isPromise_1 = __webpack_require__(/*! ../util/isPromise */ \"./node_modules/rxjs/util/isPromise.js\");\nvar PromiseObservable_1 = __webpack_require__(/*! ./PromiseObservable */ \"./node_modules/rxjs/observable/PromiseObservable.js\");\nvar IteratorObservable_1 = __webpack_require__(/*! ./IteratorObservable */ \"./node_modules/rxjs/observable/IteratorObservable.js\");\nvar ArrayObservable_1 = __webpack_require__(/*! ./ArrayObservable */ \"./node_modules/rxjs/observable/ArrayObservable.js\");\nvar ArrayLikeObservable_1 = __webpack_require__(/*! ./ArrayLikeObservable */ \"./node_modules/rxjs/observable/ArrayLikeObservable.js\");\nvar iterator_1 = __webpack_require__(/*! ../symbol/iterator */ \"./node_modules/rxjs/symbol/iterator.js\");\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar observeOn_1 = __webpack_require__(/*! ../operators/observeOn */ \"./node_modules/rxjs/operators/observeOn.js\");\nvar observable_1 = __webpack_require__(/*! ../symbol/observable */ \"./node_modules/rxjs/symbol/observable.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar FromObservable = (function (_super) {\n    __extends(FromObservable, _super);\n    function FromObservable(ish, scheduler) {\n        _super.call(this, null);\n        this.ish = ish;\n        this.scheduler = scheduler;\n    }\n    /**\n     * Creates an Observable from an Array, an array-like object, a Promise, an\n     * iterable object, or an Observable-like object.\n     *\n     * <span class=\"informal\">Converts almost anything to an Observable.</span>\n     *\n     * <img src=\"./img/from.png\" width=\"100%\">\n     *\n     * Convert various other objects and data types into Observables. `from`\n     * converts a Promise or an array-like or an\n     * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)\n     * object into an Observable that emits the items in that promise or array or\n     * iterable. A String, in this context, is treated as an array of characters.\n     * Observable-like objects (contains a function named with the ES2015 Symbol\n     * for Observable) can also be converted through this operator.\n     *\n     * @example <caption>Converts an array to an Observable</caption>\n     * var array = [10, 20, 30];\n     * var result = Rx.Observable.from(array);\n     * result.subscribe(x => console.log(x));\n     *\n     * // Results in the following:\n     * // 10 20 30\n     *\n     * @example <caption>Convert an infinite iterable (from a generator) to an Observable</caption>\n     * function* generateDoubles(seed) {\n     *   var i = seed;\n     *   while (true) {\n     *     yield i;\n     *     i = 2 * i; // double it\n     *   }\n     * }\n     *\n     * var iterator = generateDoubles(3);\n     * var result = Rx.Observable.from(iterator).take(10);\n     * result.subscribe(x => console.log(x));\n     *\n     * // Results in the following:\n     * // 3 6 12 24 48 96 192 384 768 1536\n     *\n     * @see {@link create}\n     * @see {@link fromEvent}\n     * @see {@link fromEventPattern}\n     * @see {@link fromPromise}\n     *\n     * @param {ObservableInput<T>} ish A subscribable object, a Promise, an\n     * Observable-like, an Array, an iterable or an array-like object to be\n     * converted.\n     * @param {Scheduler} [scheduler] The scheduler on which to schedule the\n     * emissions of values.\n     * @return {Observable<T>} The Observable whose values are originally from the\n     * input object that was converted.\n     * @static true\n     * @name from\n     * @owner Observable\n     */\n    FromObservable.create = function (ish, scheduler) {\n        if (ish != null) {\n            if (typeof ish[observable_1.observable] === 'function') {\n                if (ish instanceof Observable_1.Observable && !scheduler) {\n                    return ish;\n                }\n                return new FromObservable(ish, scheduler);\n            }\n            else if (isArray_1.isArray(ish)) {\n                return new ArrayObservable_1.ArrayObservable(ish, scheduler);\n            }\n            else if (isPromise_1.isPromise(ish)) {\n                return new PromiseObservable_1.PromiseObservable(ish, scheduler);\n            }\n            else if (typeof ish[iterator_1.iterator] === 'function' || typeof ish === 'string') {\n                return new IteratorObservable_1.IteratorObservable(ish, scheduler);\n            }\n            else if (isArrayLike_1.isArrayLike(ish)) {\n                return new ArrayLikeObservable_1.ArrayLikeObservable(ish, scheduler);\n            }\n        }\n        throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');\n    };\n    /** @deprecated internal use only */ FromObservable.prototype._subscribe = function (subscriber) {\n        var ish = this.ish;\n        var scheduler = this.scheduler;\n        if (scheduler == null) {\n            return ish[observable_1.observable]().subscribe(subscriber);\n        }\n        else {\n            return ish[observable_1.observable]().subscribe(new observeOn_1.ObserveOnSubscriber(subscriber, scheduler, 0));\n        }\n    };\n    return FromObservable;\n}(Observable_1.Observable));\nexports.FromObservable = FromObservable;\n//# sourceMappingURL=FromObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/FromObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/IntervalObservable.js":
/*!************************************************************!*\
  !*** ./node_modules/rxjs/observable/IntervalObservable.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar isNumeric_1 = __webpack_require__(/*! ../util/isNumeric */ \"./node_modules/rxjs/util/isNumeric.js\");\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar async_1 = __webpack_require__(/*! ../scheduler/async */ \"./node_modules/rxjs/scheduler/async.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar IntervalObservable = (function (_super) {\n    __extends(IntervalObservable, _super);\n    function IntervalObservable(period, scheduler) {\n        if (period === void 0) { period = 0; }\n        if (scheduler === void 0) { scheduler = async_1.async; }\n        _super.call(this);\n        this.period = period;\n        this.scheduler = scheduler;\n        if (!isNumeric_1.isNumeric(period) || period < 0) {\n            this.period = 0;\n        }\n        if (!scheduler || typeof scheduler.schedule !== 'function') {\n            this.scheduler = async_1.async;\n        }\n    }\n    /**\n     * Creates an Observable that emits sequential numbers every specified\n     * interval of time, on a specified IScheduler.\n     *\n     * <span class=\"informal\">Emits incremental numbers periodically in time.\n     * </span>\n     *\n     * <img src=\"./img/interval.png\" width=\"100%\">\n     *\n     * `interval` returns an Observable that emits an infinite sequence of\n     * ascending integers, with a constant interval of time of your choosing\n     * between those emissions. The first emission is not sent immediately, but\n     * only after the first period has passed. By default, this operator uses the\n     * `async` IScheduler to provide a notion of time, but you may pass any\n     * IScheduler to it.\n     *\n     * @example <caption>Emits ascending numbers, one every second (1000ms)</caption>\n     * var numbers = Rx.Observable.interval(1000);\n     * numbers.subscribe(x => console.log(x));\n     *\n     * @see {@link timer}\n     * @see {@link delay}\n     *\n     * @param {number} [period=0] The interval size in milliseconds (by default)\n     * or the time unit determined by the scheduler's clock.\n     * @param {Scheduler} [scheduler=async] The IScheduler to use for scheduling\n     * the emission of values, and providing a notion of \"time\".\n     * @return {Observable} An Observable that emits a sequential number each time\n     * interval.\n     * @static true\n     * @name interval\n     * @owner Observable\n     */\n    IntervalObservable.create = function (period, scheduler) {\n        if (period === void 0) { period = 0; }\n        if (scheduler === void 0) { scheduler = async_1.async; }\n        return new IntervalObservable(period, scheduler);\n    };\n    IntervalObservable.dispatch = function (state) {\n        var index = state.index, subscriber = state.subscriber, period = state.period;\n        subscriber.next(index);\n        if (subscriber.closed) {\n            return;\n        }\n        state.index += 1;\n        this.schedule(state, period);\n    };\n    /** @deprecated internal use only */ IntervalObservable.prototype._subscribe = function (subscriber) {\n        var index = 0;\n        var period = this.period;\n        var scheduler = this.scheduler;\n        subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {\n            index: index, subscriber: subscriber, period: period\n        }));\n    };\n    return IntervalObservable;\n}(Observable_1.Observable));\nexports.IntervalObservable = IntervalObservable;\n//# sourceMappingURL=IntervalObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/IntervalObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/IteratorObservable.js":
/*!************************************************************!*\
  !*** ./node_modules/rxjs/observable/IteratorObservable.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar iterator_1 = __webpack_require__(/*! ../symbol/iterator */ \"./node_modules/rxjs/symbol/iterator.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar IteratorObservable = (function (_super) {\n    __extends(IteratorObservable, _super);\n    function IteratorObservable(iterator, scheduler) {\n        _super.call(this);\n        this.scheduler = scheduler;\n        if (iterator == null) {\n            throw new Error('iterator cannot be null.');\n        }\n        this.iterator = getIterator(iterator);\n    }\n    IteratorObservable.create = function (iterator, scheduler) {\n        return new IteratorObservable(iterator, scheduler);\n    };\n    IteratorObservable.dispatch = function (state) {\n        var index = state.index, hasError = state.hasError, iterator = state.iterator, subscriber = state.subscriber;\n        if (hasError) {\n            subscriber.error(state.error);\n            return;\n        }\n        var result = iterator.next();\n        if (result.done) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(result.value);\n        state.index = index + 1;\n        if (subscriber.closed) {\n            if (typeof iterator.return === 'function') {\n                iterator.return();\n            }\n            return;\n        }\n        this.schedule(state);\n    };\n    /** @deprecated internal use only */ IteratorObservable.prototype._subscribe = function (subscriber) {\n        var index = 0;\n        var _a = this, iterator = _a.iterator, scheduler = _a.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(IteratorObservable.dispatch, 0, {\n                index: index, iterator: iterator, subscriber: subscriber\n            });\n        }\n        else {\n            do {\n                var result = iterator.next();\n                if (result.done) {\n                    subscriber.complete();\n                    break;\n                }\n                else {\n                    subscriber.next(result.value);\n                }\n                if (subscriber.closed) {\n                    if (typeof iterator.return === 'function') {\n                        iterator.return();\n                    }\n                    break;\n                }\n            } while (true);\n        }\n    };\n    return IteratorObservable;\n}(Observable_1.Observable));\nexports.IteratorObservable = IteratorObservable;\nvar StringIterator = (function () {\n    function StringIterator(str, idx, len) {\n        if (idx === void 0) { idx = 0; }\n        if (len === void 0) { len = str.length; }\n        this.str = str;\n        this.idx = idx;\n        this.len = len;\n    }\n    StringIterator.prototype[iterator_1.iterator] = function () { return (this); };\n    StringIterator.prototype.next = function () {\n        return this.idx < this.len ? {\n            done: false,\n            value: this.str.charAt(this.idx++)\n        } : {\n            done: true,\n            value: undefined\n        };\n    };\n    return StringIterator;\n}());\nvar ArrayIterator = (function () {\n    function ArrayIterator(arr, idx, len) {\n        if (idx === void 0) { idx = 0; }\n        if (len === void 0) { len = toLength(arr); }\n        this.arr = arr;\n        this.idx = idx;\n        this.len = len;\n    }\n    ArrayIterator.prototype[iterator_1.iterator] = function () { return this; };\n    ArrayIterator.prototype.next = function () {\n        return this.idx < this.len ? {\n            done: false,\n            value: this.arr[this.idx++]\n        } : {\n            done: true,\n            value: undefined\n        };\n    };\n    return ArrayIterator;\n}());\nfunction getIterator(obj) {\n    var i = obj[iterator_1.iterator];\n    if (!i && typeof obj === 'string') {\n        return new StringIterator(obj);\n    }\n    if (!i && obj.length !== undefined) {\n        return new ArrayIterator(obj);\n    }\n    if (!i) {\n        throw new TypeError('object is not iterable');\n    }\n    return obj[iterator_1.iterator]();\n}\nvar maxSafeInteger = Math.pow(2, 53) - 1;\nfunction toLength(o) {\n    var len = +o.length;\n    if (isNaN(len)) {\n        return 0;\n    }\n    if (len === 0 || !numberIsFinite(len)) {\n        return len;\n    }\n    len = sign(len) * Math.floor(Math.abs(len));\n    if (len <= 0) {\n        return 0;\n    }\n    if (len > maxSafeInteger) {\n        return maxSafeInteger;\n    }\n    return len;\n}\nfunction numberIsFinite(value) {\n    return typeof value === 'number' && root_1.root.isFinite(value);\n}\nfunction sign(value) {\n    var valueAsNumber = +value;\n    if (valueAsNumber === 0) {\n        return valueAsNumber;\n    }\n    if (isNaN(valueAsNumber)) {\n        return valueAsNumber;\n    }\n    return valueAsNumber < 0 ? -1 : 1;\n}\n//# sourceMappingURL=IteratorObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/IteratorObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/PromiseObservable.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/observable/PromiseObservable.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar PromiseObservable = (function (_super) {\n    __extends(PromiseObservable, _super);\n    function PromiseObservable(promise, scheduler) {\n        _super.call(this);\n        this.promise = promise;\n        this.scheduler = scheduler;\n    }\n    /**\n     * Converts a Promise to an Observable.\n     *\n     * <span class=\"informal\">Returns an Observable that just emits the Promise's\n     * resolved value, then completes.</span>\n     *\n     * Converts an ES2015 Promise or a Promises/A+ spec compliant Promise to an\n     * Observable. If the Promise resolves with a value, the output Observable\n     * emits that resolved value as a `next`, and then completes. If the Promise\n     * is rejected, then the output Observable emits the corresponding Error.\n     *\n     * @example <caption>Convert the Promise returned by Fetch to an Observable</caption>\n     * var result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));\n     * result.subscribe(x => console.log(x), e => console.error(e));\n     *\n     * @see {@link bindCallback}\n     * @see {@link from}\n     *\n     * @param {PromiseLike<T>} promise The promise to be converted.\n     * @param {Scheduler} [scheduler] An optional IScheduler to use for scheduling\n     * the delivery of the resolved value (or the rejection).\n     * @return {Observable<T>} An Observable which wraps the Promise.\n     * @static true\n     * @name fromPromise\n     * @owner Observable\n     */\n    PromiseObservable.create = function (promise, scheduler) {\n        return new PromiseObservable(promise, scheduler);\n    };\n    /** @deprecated internal use only */ PromiseObservable.prototype._subscribe = function (subscriber) {\n        var _this = this;\n        var promise = this.promise;\n        var scheduler = this.scheduler;\n        if (scheduler == null) {\n            if (this._isScalar) {\n                if (!subscriber.closed) {\n                    subscriber.next(this.value);\n                    subscriber.complete();\n                }\n            }\n            else {\n                promise.then(function (value) {\n                    _this.value = value;\n                    _this._isScalar = true;\n                    if (!subscriber.closed) {\n                        subscriber.next(value);\n                        subscriber.complete();\n                    }\n                }, function (err) {\n                    if (!subscriber.closed) {\n                        subscriber.error(err);\n                    }\n                })\n                    .then(null, function (err) {\n                    // escape the promise trap, throw unhandled errors\n                    root_1.root.setTimeout(function () { throw err; });\n                });\n            }\n        }\n        else {\n            if (this._isScalar) {\n                if (!subscriber.closed) {\n                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });\n                }\n            }\n            else {\n                promise.then(function (value) {\n                    _this.value = value;\n                    _this._isScalar = true;\n                    if (!subscriber.closed) {\n                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));\n                    }\n                }, function (err) {\n                    if (!subscriber.closed) {\n                        subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));\n                    }\n                })\n                    .then(null, function (err) {\n                    // escape the promise trap, throw unhandled errors\n                    root_1.root.setTimeout(function () { throw err; });\n                });\n            }\n        }\n    };\n    return PromiseObservable;\n}(Observable_1.Observable));\nexports.PromiseObservable = PromiseObservable;\nfunction dispatchNext(arg) {\n    var value = arg.value, subscriber = arg.subscriber;\n    if (!subscriber.closed) {\n        subscriber.next(value);\n        subscriber.complete();\n    }\n}\nfunction dispatchError(arg) {\n    var err = arg.err, subscriber = arg.subscriber;\n    if (!subscriber.closed) {\n        subscriber.error(err);\n    }\n}\n//# sourceMappingURL=PromiseObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/PromiseObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/ScalarObservable.js":
/*!**********************************************************!*\
  !*** ./node_modules/rxjs/observable/ScalarObservable.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar ScalarObservable = (function (_super) {\n    __extends(ScalarObservable, _super);\n    function ScalarObservable(value, scheduler) {\n        _super.call(this);\n        this.value = value;\n        this.scheduler = scheduler;\n        this._isScalar = true;\n        if (scheduler) {\n            this._isScalar = false;\n        }\n    }\n    ScalarObservable.create = function (value, scheduler) {\n        return new ScalarObservable(value, scheduler);\n    };\n    ScalarObservable.dispatch = function (state) {\n        var done = state.done, value = state.value, subscriber = state.subscriber;\n        if (done) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(value);\n        if (subscriber.closed) {\n            return;\n        }\n        state.done = true;\n        this.schedule(state);\n    };\n    /** @deprecated internal use only */ ScalarObservable.prototype._subscribe = function (subscriber) {\n        var value = this.value;\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(ScalarObservable.dispatch, 0, {\n                done: false, value: value, subscriber: subscriber\n            });\n        }\n        else {\n            subscriber.next(value);\n            if (!subscriber.closed) {\n                subscriber.complete();\n            }\n        }\n    };\n    return ScalarObservable;\n}(Observable_1.Observable));\nexports.ScalarObservable = ScalarObservable;\n//# sourceMappingURL=ScalarObservable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ScalarObservable.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/concat.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/observable/concat.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ \"./node_modules/rxjs/util/isScheduler.js\");\nvar of_1 = __webpack_require__(/*! ./of */ \"./node_modules/rxjs/observable/of.js\");\nvar from_1 = __webpack_require__(/*! ./from */ \"./node_modules/rxjs/observable/from.js\");\nvar concatAll_1 = __webpack_require__(/*! ../operators/concatAll */ \"./node_modules/rxjs/operators/concatAll.js\");\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which sequentially emits all values from given\n * Observable and then moves on to the next.\n *\n * <span class=\"informal\">Concatenates multiple Observables together by\n * sequentially emitting their values, one Observable after the other.</span>\n *\n * <img src=\"./img/concat.png\" width=\"100%\">\n *\n * `concat` joins multiple Observables together, by subscribing to them one at a time and\n * merging their results into the output Observable. You can pass either an array of\n * Observables, or put them directly as arguments. Passing an empty array will result\n * in Observable that completes immediately.\n *\n * `concat` will subscribe to first input Observable and emit all its values, without\n * changing or affecting them in any way. When that Observable completes, it will\n * subscribe to then next Observable passed and, again, emit its values. This will be\n * repeated, until the operator runs out of Observables. When last input Observable completes,\n * `concat` will complete as well. At any given moment only one Observable passed to operator\n * emits values. If you would like to emit values from passed Observables concurrently, check out\n * {@link merge} instead, especially with optional `concurrent` parameter. As a matter of fact,\n * `concat` is an equivalent of `merge` operator with `concurrent` parameter set to `1`.\n *\n * Note that if some input Observable never completes, `concat` will also never complete\n * and Observables following the one that did not complete will never be subscribed. On the other\n * hand, if some Observable simply completes immediately after it is subscribed, it will be\n * invisible for `concat`, which will just move on to the next Observable.\n *\n * If any Observable in chain errors, instead of passing control to the next Observable,\n * `concat` will error immediately as well. Observables that would be subscribed after\n * the one that emitted error, never will.\n *\n * If you pass to `concat` the same Observable many times, its stream of values\n * will be \"replayed\" on every subscription, which means you can repeat given Observable\n * as many times as you like. If passing the same Observable to `concat` 1000 times becomes tedious,\n * you can always use {@link repeat}.\n *\n * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>\n * var timer = Rx.Observable.interval(1000).take(4);\n * var sequence = Rx.Observable.range(1, 10);\n * var result = Rx.Observable.concat(timer, sequence);\n * result.subscribe(x => console.log(x));\n *\n * // results in:\n * // 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10\n *\n *\n * @example <caption>Concatenate an array of 3 Observables</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var result = Rx.Observable.concat([timer1, timer2, timer3]); // note that array is passed\n * result.subscribe(x => console.log(x));\n *\n * // results in the following:\n * // (Prints to console sequentially)\n * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9\n * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5\n * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9\n *\n *\n * @example <caption>Concatenate the same Observable to repeat it</caption>\n * const timer = Rx.Observable.interval(1000).take(2);\n *\n * Rx.Observable.concat(timer, timer) // concating the same Observable!\n * .subscribe(\n *   value => console.log(value),\n *   err => {},\n *   () => console.log('...and it is done!')\n * );\n *\n * // Logs:\n * // 0 after 1s\n * // 1 after 2s\n * // 0 after 3s\n * // 1 after 4s\n * // \"...and it is done!\" also after 4s\n *\n * @see {@link concatAll}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n *\n * @param {ObservableInput} input1 An input Observable to concatenate with others.\n * @param {ObservableInput} input2 An input Observable to concatenate with others.\n * More than one input Observables may be given as argument.\n * @param {Scheduler} [scheduler=null] An optional IScheduler to schedule each\n * Observable subscription on.\n * @return {Observable} All values of each passed Observable merged into a\n * single Observable, in order, in serial fashion.\n * @static true\n * @name concat\n * @owner Observable\n */\nfunction concat() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    if (observables.length === 1 || (observables.length === 2 && isScheduler_1.isScheduler(observables[1]))) {\n        return from_1.from(observables[0]);\n    }\n    return concatAll_1.concatAll()(of_1.of.apply(void 0, observables));\n}\nexports.concat = concat;\n//# sourceMappingURL=concat.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/concat.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/from.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/observable/from.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar FromObservable_1 = __webpack_require__(/*! ./FromObservable */ \"./node_modules/rxjs/observable/FromObservable.js\");\nexports.from = FromObservable_1.FromObservable.create;\n//# sourceMappingURL=from.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/from.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/fromEvent.js":
/*!***************************************************!*\
  !*** ./node_modules/rxjs/observable/fromEvent.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar FromEventObservable_1 = __webpack_require__(/*! ./FromEventObservable */ \"./node_modules/rxjs/observable/FromEventObservable.js\");\nexports.fromEvent = FromEventObservable_1.FromEventObservable.create;\n//# sourceMappingURL=fromEvent.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/fromEvent.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/fromPromise.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/observable/fromPromise.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar PromiseObservable_1 = __webpack_require__(/*! ./PromiseObservable */ \"./node_modules/rxjs/observable/PromiseObservable.js\");\nexports.fromPromise = PromiseObservable_1.PromiseObservable.create;\n//# sourceMappingURL=fromPromise.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/fromPromise.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/interval.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/observable/interval.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar IntervalObservable_1 = __webpack_require__(/*! ./IntervalObservable */ \"./node_modules/rxjs/observable/IntervalObservable.js\");\nexports.interval = IntervalObservable_1.IntervalObservable.create;\n//# sourceMappingURL=interval.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/interval.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/merge.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/observable/merge.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar ArrayObservable_1 = __webpack_require__(/*! ./ArrayObservable */ \"./node_modules/rxjs/observable/ArrayObservable.js\");\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ \"./node_modules/rxjs/util/isScheduler.js\");\nvar mergeAll_1 = __webpack_require__(/*! ../operators/mergeAll */ \"./node_modules/rxjs/operators/mergeAll.js\");\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which concurrently emits all values from every\n * given input Observable.\n *\n * <span class=\"informal\">Flattens multiple Observables together by blending\n * their values into one Observable.</span>\n *\n * <img src=\"./img/merge.png\" width=\"100%\">\n *\n * `merge` subscribes to each given input Observable (as arguments), and simply\n * forwards (without doing any transformation) all the values from all the input\n * Observables to the output Observable. The output Observable only completes\n * once all input Observables have completed. Any error delivered by an input\n * Observable will be immediately emitted on the output Observable.\n *\n * @example <caption>Merge together two Observables: 1s interval and clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var clicksOrTimer = Rx.Observable.merge(clicks, timer);\n * clicksOrTimer.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // timer will emit ascending values, one every second(1000ms) to console\n * // clicks logs MouseEvents to console everytime the \"document\" is clicked\n * // Since the two streams are merged you see these happening\n * // as they occur.\n *\n * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var concurrent = 2; // the argument\n * var merged = Rx.Observable.merge(timer1, timer2, timer3, concurrent);\n * merged.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // - First timer1 and timer2 will run concurrently\n * // - timer1 will emit a value every 1000ms for 10 iterations\n * // - timer2 will emit a value every 2000ms for 6 iterations\n * // - after timer1 hits it's max iteration, timer2 will\n * //   continue, and timer3 will start to run concurrently with timer2\n * // - when timer2 hits it's max iteration it terminates, and\n * //   timer3 will continue to emit a value every 500ms until it is complete\n *\n * @see {@link mergeAll}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n *\n * @param {...ObservableInput} observables Input Observables to merge together.\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for managing\n * concurrency of input Observables.\n * @return {Observable} an Observable that emits items that are the result of\n * every input Observable.\n * @static true\n * @name merge\n * @owner Observable\n */\nfunction merge() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    var concurrent = Number.POSITIVE_INFINITY;\n    var scheduler = null;\n    var last = observables[observables.length - 1];\n    if (isScheduler_1.isScheduler(last)) {\n        scheduler = observables.pop();\n        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {\n            concurrent = observables.pop();\n        }\n    }\n    else if (typeof last === 'number') {\n        concurrent = observables.pop();\n    }\n    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable_1.Observable) {\n        return observables[0];\n    }\n    return mergeAll_1.mergeAll(concurrent)(new ArrayObservable_1.ArrayObservable(observables, scheduler));\n}\nexports.merge = merge;\n//# sourceMappingURL=merge.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/merge.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/of.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/observable/of.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar ArrayObservable_1 = __webpack_require__(/*! ./ArrayObservable */ \"./node_modules/rxjs/observable/ArrayObservable.js\");\nexports.of = ArrayObservable_1.ArrayObservable.of;\n//# sourceMappingURL=of.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/of.js?");

/***/ }),

/***/ "./node_modules/rxjs/observable/race.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/observable/race.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ \"./node_modules/rxjs/util/isArray.js\");\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ \"./node_modules/rxjs/observable/ArrayObservable.js\");\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ \"./node_modules/rxjs/OuterSubscriber.js\");\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ \"./node_modules/rxjs/util/subscribeToResult.js\");\nfunction race() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    // if the only argument is an array, it was most likely called with\n    // `race([obs1, obs2, ...])`\n    if (observables.length === 1) {\n        if (isArray_1.isArray(observables[0])) {\n            observables = observables[0];\n        }\n        else {\n            return observables[0];\n        }\n    }\n    return new ArrayObservable_1.ArrayObservable(observables).lift(new RaceOperator());\n}\nexports.race = race;\nvar RaceOperator = (function () {\n    function RaceOperator() {\n    }\n    RaceOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new RaceSubscriber(subscriber));\n    };\n    return RaceOperator;\n}());\nexports.RaceOperator = RaceOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar RaceSubscriber = (function (_super) {\n    __extends(RaceSubscriber, _super);\n    function RaceSubscriber(destination) {\n        _super.call(this, destination);\n        this.hasFirst = false;\n        this.observables = [];\n        this.subscriptions = [];\n    }\n    RaceSubscriber.prototype._next = function (observable) {\n        this.observables.push(observable);\n    };\n    RaceSubscriber.prototype._complete = function () {\n        var observables = this.observables;\n        var len = observables.length;\n        if (len === 0) {\n            this.destination.complete();\n        }\n        else {\n            for (var i = 0; i < len && !this.hasFirst; i++) {\n                var observable = observables[i];\n                var subscription = subscribeToResult_1.subscribeToResult(this, observable, observable, i);\n                if (this.subscriptions) {\n                    this.subscriptions.push(subscription);\n                }\n                this.add(subscription);\n            }\n            this.observables = null;\n        }\n    };\n    RaceSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        if (!this.hasFirst) {\n            this.hasFirst = true;\n            for (var i = 0; i < this.subscriptions.length; i++) {\n                if (i !== outerIndex) {\n                    var subscription = this.subscriptions[i];\n                    subscription.unsubscribe();\n                    this.remove(subscription);\n                }\n            }\n            this.subscriptions = null;\n        }\n        this.destination.next(innerValue);\n    };\n    return RaceSubscriber;\n}(OuterSubscriber_1.OuterSubscriber));\nexports.RaceSubscriber = RaceSubscriber;\n//# sourceMappingURL=race.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/race.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/buffer.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/buffer.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar buffer_1 = __webpack_require__(/*! ../operators/buffer */ \"./node_modules/rxjs/operators/buffer.js\");\n/**\n * Buffers the source Observable values until `closingNotifier` emits.\n *\n * <span class=\"informal\">Collects values from the past as an array, and emits\n * that array only when another Observable emits.</span>\n *\n * <img src=\"./img/buffer.png\" width=\"100%\">\n *\n * Buffers the incoming Observable values until the given `closingNotifier`\n * Observable emits a value, at which point it emits the buffer on the output\n * Observable and starts a new buffer internally, awaiting the next time\n * `closingNotifier` emits.\n *\n * @example <caption>On every click, emit array of most recent interval events</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var interval = Rx.Observable.interval(1000);\n * var buffered = interval.buffer(clicks);\n * buffered.subscribe(x => console.log(x));\n *\n * @see {@link bufferCount}\n * @see {@link bufferTime}\n * @see {@link bufferToggle}\n * @see {@link bufferWhen}\n * @see {@link window}\n *\n * @param {Observable<any>} closingNotifier An Observable that signals the\n * buffer to be emitted on the output Observable.\n * @return {Observable<T[]>} An Observable of buffers, which are arrays of\n * values.\n * @method buffer\n * @owner Observable\n */\nfunction buffer(closingNotifier) {\n    return buffer_1.buffer(closingNotifier)(this);\n}\nexports.buffer = buffer;\n//# sourceMappingURL=buffer.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/buffer.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/catch.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operator/catch.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar catchError_1 = __webpack_require__(/*! ../operators/catchError */ \"./node_modules/rxjs/operators/catchError.js\");\n/**\n * Catches errors on the observable to be handled by returning a new observable or throwing an error.\n *\n * <img src=\"./img/catch.png\" width=\"100%\">\n *\n * @example <caption>Continues with a different Observable when there's an error</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n * \t   if (n == 4) {\n * \t     throw 'four!';\n *     }\n *\t   return n;\n *   })\n *   .catch(err => Observable.of('I', 'II', 'III', 'IV', 'V'))\n *   .subscribe(x => console.log(x));\n *   // 1, 2, 3, I, II, III, IV, V\n *\n * @example <caption>Retries the caught source Observable again in case of error, similar to retry() operator</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n * \t   if (n === 4) {\n * \t     throw 'four!';\n *     }\n * \t   return n;\n *   })\n *   .catch((err, caught) => caught)\n *   .take(30)\n *   .subscribe(x => console.log(x));\n *   // 1, 2, 3, 1, 2, 3, ...\n *\n * @example <caption>Throws a new error when the source Observable throws an error</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n *     if (n == 4) {\n *       throw 'four!';\n *     }\n *     return n;\n *   })\n *   .catch(err => {\n *     throw 'error in source. Details: ' + err;\n *   })\n *   .subscribe(\n *     x => console.log(x),\n *     err => console.log(err)\n *   );\n *   // 1, 2, 3, error in source. Details: four!\n *\n * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which\n *  is the source observable, in case you'd like to \"retry\" that observable by returning it again. Whatever observable\n *  is returned by the `selector` will be used to continue the observable chain.\n * @return {Observable} An observable that originates from either the source or the observable returned by the\n *  catch `selector` function.\n * @method catch\n * @name catch\n * @owner Observable\n */\nfunction _catch(selector) {\n    return catchError_1.catchError(selector)(this);\n}\nexports._catch = _catch;\n//# sourceMappingURL=catch.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/catch.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/concat.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/concat.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar concat_1 = __webpack_require__(/*! ../operators/concat */ \"./node_modules/rxjs/operators/concat.js\");\nvar concat_2 = __webpack_require__(/*! ../observable/concat */ \"./node_modules/rxjs/observable/concat.js\");\nexports.concatStatic = concat_2.concat;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which sequentially emits all values from every\n * given input Observable after the current Observable.\n *\n * <span class=\"informal\">Concatenates multiple Observables together by\n * sequentially emitting their values, one Observable after the other.</span>\n *\n * <img src=\"./img/concat.png\" width=\"100%\">\n *\n * Joins this Observable with multiple other Observables by subscribing to them\n * one at a time, starting with the source, and merging their results into the\n * output Observable. Will wait for each Observable to complete before moving\n * on to the next.\n *\n * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>\n * var timer = Rx.Observable.interval(1000).take(4);\n * var sequence = Rx.Observable.range(1, 10);\n * var result = timer.concat(sequence);\n * result.subscribe(x => console.log(x));\n *\n * // results in:\n * // 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10\n *\n * @example <caption>Concatenate 3 Observables</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var result = timer1.concat(timer2, timer3);\n * result.subscribe(x => console.log(x));\n *\n * // results in the following:\n * // (Prints to console sequentially)\n * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9\n * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5\n * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9\n *\n * @see {@link concatAll}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n *\n * @param {ObservableInput} other An input Observable to concatenate after the source\n * Observable. More than one input Observables may be given as argument.\n * @param {Scheduler} [scheduler=null] An optional IScheduler to schedule each\n * Observable subscription on.\n * @return {Observable} All values of each passed Observable merged into a\n * single Observable, in order, in serial fashion.\n * @method concat\n * @owner Observable\n */\nfunction concat() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return concat_1.concat.apply(void 0, observables)(this);\n}\nexports.concat = concat;\n//# sourceMappingURL=concat.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/concat.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/concatMap.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/concatMap.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar concatMap_1 = __webpack_require__(/*! ../operators/concatMap */ \"./node_modules/rxjs/operators/concatMap.js\");\n/* tslint:enable:max-line-length */\n/**\n * Projects each source value to an Observable which is merged in the output\n * Observable, in a serialized fashion waiting for each one to complete before\n * merging the next.\n *\n * <span class=\"informal\">Maps each value to an Observable, then flattens all of\n * these inner Observables using {@link concatAll}.</span>\n *\n * <img src=\"./img/concatMap.png\" width=\"100%\">\n *\n * Returns an Observable that emits items based on applying a function that you\n * supply to each item emitted by the source Observable, where that function\n * returns an (so-called \"inner\") Observable. Each new inner Observable is\n * concatenated with the previous inner Observable.\n *\n * __Warning:__ if source values arrive endlessly and faster than their\n * corresponding inner Observables can complete, it will result in memory issues\n * as inner Observables amass in an unbounded buffer waiting for their turn to\n * be subscribed to.\n *\n * Note: `concatMap` is equivalent to `mergeMap` with concurrency parameter set\n * to `1`.\n *\n * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.concatMap(ev => Rx.Observable.interval(1000).take(4));\n * result.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // (results are not concurrent)\n * // For every click on the \"document\" it will emit values 0 to 3 spaced\n * // on a 1000ms interval\n * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3\n *\n * @see {@link concat}\n * @see {@link concatAll}\n * @see {@link concatMapTo}\n * @see {@link exhaustMap}\n * @see {@link mergeMap}\n * @see {@link switchMap}\n *\n * @param {function(value: T, ?index: number): ObservableInput} project A function\n * that, when applied to an item emitted by the source Observable, returns an\n * Observable.\n * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]\n * A function to produce the value on the output Observable based on the values\n * and the indices of the source (outer) emission and the inner Observable\n * emission. The arguments passed to this function are:\n * - `outerValue`: the value that came from the source\n * - `innerValue`: the value that came from the projected Observable\n * - `outerIndex`: the \"index\" of the value that came from the source\n * - `innerIndex`: the \"index\" of the value from the projected Observable\n * @return {Observable} An Observable that emits the result of applying the\n * projection function (and the optional `resultSelector`) to each item emitted\n * by the source Observable and taking values from each projected inner\n * Observable sequentially.\n * @method concatMap\n * @owner Observable\n */\nfunction concatMap(project, resultSelector) {\n    return concatMap_1.concatMap(project, resultSelector)(this);\n}\nexports.concatMap = concatMap;\n//# sourceMappingURL=concatMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/concatMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/debounceTime.js":
/*!****************************************************!*\
  !*** ./node_modules/rxjs/operator/debounceTime.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar async_1 = __webpack_require__(/*! ../scheduler/async */ \"./node_modules/rxjs/scheduler/async.js\");\nvar debounceTime_1 = __webpack_require__(/*! ../operators/debounceTime */ \"./node_modules/rxjs/operators/debounceTime.js\");\n/**\n * Emits a value from the source Observable only after a particular time span\n * has passed without another source emission.\n *\n * <span class=\"informal\">It's like {@link delay}, but passes only the most\n * recent value from each burst of emissions.</span>\n *\n * <img src=\"./img/debounceTime.png\" width=\"100%\">\n *\n * `debounceTime` delays values emitted by the source Observable, but drops\n * previous pending delayed emissions if a new value arrives on the source\n * Observable. This operator keeps track of the most recent value from the\n * source Observable, and emits that only when `dueTime` enough time has passed\n * without any other value appearing on the source Observable. If a new value\n * appears before `dueTime` silence occurs, the previous value will be dropped\n * and will not be emitted on the output Observable.\n *\n * This is a rate-limiting operator, because it is impossible for more than one\n * value to be emitted in any time window of duration `dueTime`, but it is also\n * a delay-like operator since output emissions do not occur at the same time as\n * they did on the source Observable. Optionally takes a {@link IScheduler} for\n * managing timers.\n *\n * @example <caption>Emit the most recent click after a burst of clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.debounceTime(1000);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link auditTime}\n * @see {@link debounce}\n * @see {@link delay}\n * @see {@link sampleTime}\n * @see {@link throttleTime}\n *\n * @param {number} dueTime The timeout duration in milliseconds (or the time\n * unit determined internally by the optional `scheduler`) for the window of\n * time required to wait for emission silence before emitting the most recent\n * source value.\n * @param {Scheduler} [scheduler=async] The {@link IScheduler} to use for\n * managing the timers that handle the timeout for each value.\n * @return {Observable} An Observable that delays the emissions of the source\n * Observable by the specified `dueTime`, and may drop some values if they occur\n * too frequently.\n * @method debounceTime\n * @owner Observable\n */\nfunction debounceTime(dueTime, scheduler) {\n    if (scheduler === void 0) { scheduler = async_1.async; }\n    return debounceTime_1.debounceTime(dueTime, scheduler)(this);\n}\nexports.debounceTime = debounceTime;\n//# sourceMappingURL=debounceTime.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/debounceTime.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/delay.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operator/delay.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar async_1 = __webpack_require__(/*! ../scheduler/async */ \"./node_modules/rxjs/scheduler/async.js\");\nvar delay_1 = __webpack_require__(/*! ../operators/delay */ \"./node_modules/rxjs/operators/delay.js\");\n/**\n * Delays the emission of items from the source Observable by a given timeout or\n * until a given Date.\n *\n * <span class=\"informal\">Time shifts each item by some specified amount of\n * milliseconds.</span>\n *\n * <img src=\"./img/delay.png\" width=\"100%\">\n *\n * If the delay argument is a Number, this operator time shifts the source\n * Observable by that amount of time expressed in milliseconds. The relative\n * time intervals between the values are preserved.\n *\n * If the delay argument is a Date, this operator time shifts the start of the\n * Observable execution until the given date occurs.\n *\n * @example <caption>Delay each click by one second</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var delayedClicks = clicks.delay(1000); // each click emitted after 1 second\n * delayedClicks.subscribe(x => console.log(x));\n *\n * @example <caption>Delay all clicks until a future date happens</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var date = new Date('March 15, 2050 12:00:00'); // in the future\n * var delayedClicks = clicks.delay(date); // click emitted only after that date\n * delayedClicks.subscribe(x => console.log(x));\n *\n * @see {@link debounceTime}\n * @see {@link delayWhen}\n *\n * @param {number|Date} delay The delay duration in milliseconds (a `number`) or\n * a `Date` until which the emission of the source items is delayed.\n * @param {Scheduler} [scheduler=async] The IScheduler to use for\n * managing the timers that handle the time-shift for each item.\n * @return {Observable} An Observable that delays the emissions of the source\n * Observable by the specified timeout or Date.\n * @method delay\n * @owner Observable\n */\nfunction delay(delay, scheduler) {\n    if (scheduler === void 0) { scheduler = async_1.async; }\n    return delay_1.delay(delay, scheduler)(this);\n}\nexports.delay = delay;\n//# sourceMappingURL=delay.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/delay.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/distinctUntilChanged.js":
/*!************************************************************!*\
  !*** ./node_modules/rxjs/operator/distinctUntilChanged.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar distinctUntilChanged_1 = __webpack_require__(/*! ../operators/distinctUntilChanged */ \"./node_modules/rxjs/operators/distinctUntilChanged.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.\n *\n * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.\n *\n * If a comparator function is not provided, an equality check is used by default.\n *\n * @example <caption>A simple example with numbers</caption>\n * Observable.of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4)\n *   .distinctUntilChanged()\n *   .subscribe(x => console.log(x)); // 1, 2, 1, 2, 3, 4\n *\n * @example <caption>An example using a compare function</caption>\n * interface Person {\n *    age: number,\n *    name: string\n * }\n *\n * Observable.of<Person>(\n *     { age: 4, name: 'Foo'},\n *     { age: 7, name: 'Bar'},\n *     { age: 5, name: 'Foo'})\n *     { age: 6, name: 'Foo'})\n *     .distinctUntilChanged((p: Person, q: Person) => p.name === q.name)\n *     .subscribe(x => console.log(x));\n *\n * // displays:\n * // { age: 4, name: 'Foo' }\n * // { age: 7, name: 'Bar' }\n * // { age: 5, name: 'Foo' }\n *\n * @see {@link distinct}\n * @see {@link distinctUntilKeyChanged}\n *\n * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.\n * @return {Observable} An Observable that emits items from the source Observable with distinct values.\n * @method distinctUntilChanged\n * @owner Observable\n */\nfunction distinctUntilChanged(compare, keySelector) {\n    return distinctUntilChanged_1.distinctUntilChanged(compare, keySelector)(this);\n}\nexports.distinctUntilChanged = distinctUntilChanged;\n//# sourceMappingURL=distinctUntilChanged.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/distinctUntilChanged.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/do.js":
/*!******************************************!*\
  !*** ./node_modules/rxjs/operator/do.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar tap_1 = __webpack_require__(/*! ../operators/tap */ \"./node_modules/rxjs/operators/tap.js\");\n/* tslint:enable:max-line-length */\n/**\n * Perform a side effect for every emission on the source Observable, but return\n * an Observable that is identical to the source.\n *\n * <span class=\"informal\">Intercepts each emission on the source and runs a\n * function, but returns an output which is identical to the source as long as errors don't occur.</span>\n *\n * <img src=\"./img/do.png\" width=\"100%\">\n *\n * Returns a mirrored Observable of the source Observable, but modified so that\n * the provided Observer is called to perform a side effect for every value,\n * error, and completion emitted by the source. Any errors that are thrown in\n * the aforementioned Observer or handlers are safely sent down the error path\n * of the output Observable.\n *\n * This operator is useful for debugging your Observables for the correct values\n * or performing other side effects.\n *\n * Note: this is different to a `subscribe` on the Observable. If the Observable\n * returned by `do` is not subscribed, the side effects specified by the\n * Observer will never happen. `do` therefore simply spies on existing\n * execution, it does not trigger an execution to happen like `subscribe` does.\n *\n * @example <caption>Map every click to the clientX position of that click, while also logging the click event</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks\n *   .do(ev => console.log(ev))\n *   .map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link map}\n * @see {@link subscribe}\n *\n * @param {Observer|function} [nextOrObserver] A normal Observer object or a\n * callback for `next`.\n * @param {function} [error] Callback for errors in the source.\n * @param {function} [complete] Callback for the completion of the source.\n * @return {Observable} An Observable identical to the source, but runs the\n * specified Observer or callback(s) for each item.\n * @method do\n * @name do\n * @owner Observable\n */\nfunction _do(nextOrObserver, error, complete) {\n    return tap_1.tap(nextOrObserver, error, complete)(this);\n}\nexports._do = _do;\n//# sourceMappingURL=do.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/do.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/filter.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/filter.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar filter_1 = __webpack_require__(/*! ../operators/filter */ \"./node_modules/rxjs/operators/filter.js\");\n/* tslint:enable:max-line-length */\n/**\n * Filter items emitted by the source Observable by only emitting those that\n * satisfy a specified predicate.\n *\n * <span class=\"informal\">Like\n * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),\n * it only emits a value from the source if it passes a criterion function.</span>\n *\n * <img src=\"./img/filter.png\" width=\"100%\">\n *\n * Similar to the well-known `Array.prototype.filter` method, this operator\n * takes values from the source Observable, passes them through a `predicate`\n * function and only emits those values that yielded `true`.\n *\n * @example <caption>Emit only click events whose target was a DIV element</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');\n * clicksOnDivs.subscribe(x => console.log(x));\n *\n * @see {@link distinct}\n * @see {@link distinctUntilChanged}\n * @see {@link distinctUntilKeyChanged}\n * @see {@link ignoreElements}\n * @see {@link partition}\n * @see {@link skip}\n *\n * @param {function(value: T, index: number): boolean} predicate A function that\n * evaluates each value emitted by the source Observable. If it returns `true`,\n * the value is emitted, if `false` the value is not passed to the output\n * Observable. The `index` parameter is the number `i` for the i-th source\n * emission that has happened since the subscription, starting from the number\n * `0`.\n * @param {any} [thisArg] An optional argument to determine the value of `this`\n * in the `predicate` function.\n * @return {Observable} An Observable of values from the source that were\n * allowed by the `predicate` function.\n * @method filter\n * @owner Observable\n */\nfunction filter(predicate, thisArg) {\n    return filter_1.filter(predicate, thisArg)(this);\n}\nexports.filter = filter;\n//# sourceMappingURL=filter.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/filter.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/finally.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operator/finally.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar finalize_1 = __webpack_require__(/*! ../operators/finalize */ \"./node_modules/rxjs/operators/finalize.js\");\n/**\n * Returns an Observable that mirrors the source Observable, but will call a specified function when\n * the source terminates on complete or error.\n * @param {function} callback Function to be called when source terminates.\n * @return {Observable} An Observable that mirrors the source, but will call the specified function on termination.\n * @method finally\n * @owner Observable\n */\nfunction _finally(callback) {\n    return finalize_1.finalize(callback)(this);\n}\nexports._finally = _finally;\n//# sourceMappingURL=finally.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/finally.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/last.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operator/last.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar last_1 = __webpack_require__(/*! ../operators/last */ \"./node_modules/rxjs/operators/last.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits only the last item emitted by the source Observable.\n * It optionally takes a predicate function as a parameter, in which case, rather than emitting\n * the last item from the source Observable, the resulting Observable will emit the last item\n * from the source Observable that satisfies the predicate.\n *\n * <img src=\"./img/last.png\" width=\"100%\">\n *\n * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`\n * callback if the Observable completes before any `next` notification was sent.\n * @param {function} predicate - The condition any source emitted item has to satisfy.\n * @return {Observable} An Observable that emits only the last item satisfying the given condition\n * from the source, or an NoSuchElementException if no such items are emitted.\n * @throws - Throws if no items that match the predicate are emitted by the source Observable.\n * @method last\n * @owner Observable\n */\nfunction last(predicate, resultSelector, defaultValue) {\n    return last_1.last(predicate, resultSelector, defaultValue)(this);\n}\nexports.last = last;\n//# sourceMappingURL=last.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/last.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/map.js":
/*!*******************************************!*\
  !*** ./node_modules/rxjs/operator/map.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar map_1 = __webpack_require__(/*! ../operators/map */ \"./node_modules/rxjs/operators/map.js\");\n/**\n * Applies a given `project` function to each value emitted by the source\n * Observable, and emits the resulting values as an Observable.\n *\n * <span class=\"informal\">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),\n * it passes each source value through a transformation function to get\n * corresponding output values.</span>\n *\n * <img src=\"./img/map.png\" width=\"100%\">\n *\n * Similar to the well known `Array.prototype.map` function, this operator\n * applies a projection to each value and emits that projection in the output\n * Observable.\n *\n * @example <caption>Map every click to the clientX position of that click</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks.map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link mapTo}\n * @see {@link pluck}\n *\n * @param {function(value: T, index: number): R} project The function to apply\n * to each `value` emitted by the source Observable. The `index` parameter is\n * the number `i` for the i-th emission that has happened since the\n * subscription, starting from the number `0`.\n * @param {any} [thisArg] An optional argument to define what `this` is in the\n * `project` function.\n * @return {Observable<R>} An Observable that emits the values from the source\n * Observable transformed by the given `project` function.\n * @method map\n * @owner Observable\n */\nfunction map(project, thisArg) {\n    return map_1.map(project, thisArg)(this);\n}\nexports.map = map;\n//# sourceMappingURL=map.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/map.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/merge.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operator/merge.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar merge_1 = __webpack_require__(/*! ../operators/merge */ \"./node_modules/rxjs/operators/merge.js\");\nvar merge_2 = __webpack_require__(/*! ../observable/merge */ \"./node_modules/rxjs/observable/merge.js\");\nexports.mergeStatic = merge_2.merge;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which concurrently emits all values from every\n * given input Observable.\n *\n * <span class=\"informal\">Flattens multiple Observables together by blending\n * their values into one Observable.</span>\n *\n * <img src=\"./img/merge.png\" width=\"100%\">\n *\n * `merge` subscribes to each given input Observable (either the source or an\n * Observable given as argument), and simply forwards (without doing any\n * transformation) all the values from all the input Observables to the output\n * Observable. The output Observable only completes once all input Observables\n * have completed. Any error delivered by an input Observable will be immediately\n * emitted on the output Observable.\n *\n * @example <caption>Merge together two Observables: 1s interval and clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var clicksOrTimer = clicks.merge(timer);\n * clicksOrTimer.subscribe(x => console.log(x));\n *\n * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var concurrent = 2; // the argument\n * var merged = timer1.merge(timer2, timer3, concurrent);\n * merged.subscribe(x => console.log(x));\n *\n * @see {@link mergeAll}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n *\n * @param {ObservableInput} other An input Observable to merge with the source\n * Observable. More than one input Observables may be given as argument.\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for managing\n * concurrency of input Observables.\n * @return {Observable} An Observable that emits items that are the result of\n * every input Observable.\n * @method merge\n * @owner Observable\n */\nfunction merge() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return merge_1.merge.apply(void 0, observables)(this);\n}\nexports.merge = merge;\n//# sourceMappingURL=merge.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/merge.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/mergeMap.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/operator/mergeMap.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar mergeMap_1 = __webpack_require__(/*! ../operators/mergeMap */ \"./node_modules/rxjs/operators/mergeMap.js\");\n/* tslint:enable:max-line-length */\n/**\n * Projects each source value to an Observable which is merged in the output\n * Observable.\n *\n * <span class=\"informal\">Maps each value to an Observable, then flattens all of\n * these inner Observables using {@link mergeAll}.</span>\n *\n * <img src=\"./img/mergeMap.png\" width=\"100%\">\n *\n * Returns an Observable that emits items based on applying a function that you\n * supply to each item emitted by the source Observable, where that function\n * returns an Observable, and then merging those resulting Observables and\n * emitting the results of this merger.\n *\n * @example <caption>Map and flatten each letter to an Observable ticking every 1 second</caption>\n * var letters = Rx.Observable.of('a', 'b', 'c');\n * var result = letters.mergeMap(x =>\n *   Rx.Observable.interval(1000).map(i => x+i)\n * );\n * result.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // a0\n * // b0\n * // c0\n * // a1\n * // b1\n * // c1\n * // continues to list a,b,c with respective ascending integers\n *\n * @see {@link concatMap}\n * @see {@link exhaustMap}\n * @see {@link merge}\n * @see {@link mergeAll}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n * @see {@link switchMap}\n *\n * @param {function(value: T, ?index: number): ObservableInput} project A function\n * that, when applied to an item emitted by the source Observable, returns an\n * Observable.\n * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]\n * A function to produce the value on the output Observable based on the values\n * and the indices of the source (outer) emission and the inner Observable\n * emission. The arguments passed to this function are:\n * - `outerValue`: the value that came from the source\n * - `innerValue`: the value that came from the projected Observable\n * - `outerIndex`: the \"index\" of the value that came from the source\n * - `innerIndex`: the \"index\" of the value from the projected Observable\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @return {Observable} An Observable that emits the result of applying the\n * projection function (and the optional `resultSelector`) to each item emitted\n * by the source Observable and merging the results of the Observables obtained\n * from this transformation.\n * @method mergeMap\n * @owner Observable\n */\nfunction mergeMap(project, resultSelector, concurrent) {\n    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }\n    return mergeMap_1.mergeMap(project, resultSelector, concurrent)(this);\n}\nexports.mergeMap = mergeMap;\n//# sourceMappingURL=mergeMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/mergeMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/race.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operator/race.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar race_1 = __webpack_require__(/*! ../operators/race */ \"./node_modules/rxjs/operators/race.js\");\n// NOTE: to support backwards compatability with 5.4.* and lower\nvar race_2 = __webpack_require__(/*! ../observable/race */ \"./node_modules/rxjs/observable/race.js\");\nexports.raceStatic = race_2.race;\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that mirrors the first source Observable to emit an item\n * from the combination of this Observable and supplied Observables.\n * @param {...Observables} ...observables Sources used to race for which Observable emits first.\n * @return {Observable} An Observable that mirrors the output of the first Observable to emit an item.\n * @method race\n * @owner Observable\n */\nfunction race() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return race_1.race.apply(void 0, observables)(this);\n}\nexports.race = race;\n//# sourceMappingURL=race.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/race.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/skip.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operator/skip.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar skip_1 = __webpack_require__(/*! ../operators/skip */ \"./node_modules/rxjs/operators/skip.js\");\n/**\n * Returns an Observable that skips the first `count` items emitted by the source Observable.\n *\n * <img src=\"./img/skip.png\" width=\"100%\">\n *\n * @param {Number} count - The number of times, items emitted by source Observable should be skipped.\n * @return {Observable} An Observable that skips values emitted by the source Observable.\n *\n * @method skip\n * @owner Observable\n */\nfunction skip(count) {\n    return skip_1.skip(count)(this);\n}\nexports.skip = skip;\n//# sourceMappingURL=skip.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/skip.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/startWith.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/startWith.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar startWith_1 = __webpack_require__(/*! ../operators/startWith */ \"./node_modules/rxjs/operators/startWith.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits the items you specify as arguments before it begins to emit\n * items emitted by the source Observable.\n *\n * <img src=\"./img/startWith.png\" width=\"100%\">\n *\n * @param {...T} values - Items you want the modified Observable to emit first.\n * @param {Scheduler} [scheduler] - A {@link IScheduler} to use for scheduling\n * the emissions of the `next` notifications.\n * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items\n * emitted by the source Observable.\n * @method startWith\n * @owner Observable\n */\nfunction startWith() {\n    var array = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        array[_i - 0] = arguments[_i];\n    }\n    return startWith_1.startWith.apply(void 0, array)(this);\n}\nexports.startWith = startWith;\n//# sourceMappingURL=startWith.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/startWith.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/take.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operator/take.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar take_1 = __webpack_require__(/*! ../operators/take */ \"./node_modules/rxjs/operators/take.js\");\n/**\n * Emits only the first `count` values emitted by the source Observable.\n *\n * <span class=\"informal\">Takes the first `count` values from the source, then\n * completes.</span>\n *\n * <img src=\"./img/take.png\" width=\"100%\">\n *\n * `take` returns an Observable that emits only the first `count` values emitted\n * by the source Observable. If the source emits fewer than `count` values then\n * all of its values are emitted. After that, it completes, regardless if the\n * source completes.\n *\n * @example <caption>Take the first 5 seconds of an infinite 1-second interval Observable</caption>\n * var interval = Rx.Observable.interval(1000);\n * var five = interval.take(5);\n * five.subscribe(x => console.log(x));\n *\n * @see {@link takeLast}\n * @see {@link takeUntil}\n * @see {@link takeWhile}\n * @see {@link skip}\n *\n * @throws {ArgumentOutOfRangeError} When using `take(i)`, it delivers an\n * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.\n *\n * @param {number} count The maximum number of `next` values to emit.\n * @return {Observable<T>} An Observable that emits only the first `count`\n * values emitted by the source Observable, or all of the values from the source\n * if the source emits fewer than `count` values.\n * @method take\n * @owner Observable\n */\nfunction take(count) {\n    return take_1.take(count)(this);\n}\nexports.take = take;\n//# sourceMappingURL=take.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/take.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/takeUntil.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/takeUntil.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar takeUntil_1 = __webpack_require__(/*! ../operators/takeUntil */ \"./node_modules/rxjs/operators/takeUntil.js\");\n/**\n * Emits the values emitted by the source Observable until a `notifier`\n * Observable emits a value.\n *\n * <span class=\"informal\">Lets values pass until a second Observable,\n * `notifier`, emits something. Then, it completes.</span>\n *\n * <img src=\"./img/takeUntil.png\" width=\"100%\">\n *\n * `takeUntil` subscribes and begins mirroring the source Observable. It also\n * monitors a second Observable, `notifier` that you provide. If the `notifier`\n * emits a value, the output Observable stops mirroring the source Observable\n * and completes.\n *\n * @example <caption>Tick every second until the first click happens</caption>\n * var interval = Rx.Observable.interval(1000);\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = interval.takeUntil(clicks);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link take}\n * @see {@link takeLast}\n * @see {@link takeWhile}\n * @see {@link skip}\n *\n * @param {Observable} notifier The Observable whose first emitted value will\n * cause the output Observable of `takeUntil` to stop emitting values from the\n * source Observable.\n * @return {Observable<T>} An Observable that emits the values from the source\n * Observable until such time as `notifier` emits its first value.\n * @method takeUntil\n * @owner Observable\n */\nfunction takeUntil(notifier) {\n    return takeUntil_1.takeUntil(notifier)(this);\n}\nexports.takeUntil = takeUntil;\n//# sourceMappingURL=takeUntil.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/takeUntil.js?");

/***/ }),

/***/ "./node_modules/rxjs/operator/toArray.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operator/toArray.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar toArray_1 = __webpack_require__(/*! ../operators/toArray */ \"./node_modules/rxjs/operators/toArray.js\");\n/**\n * Collects all source emissions and emits them as an array when the source completes.\n *\n * <span class=\"informal\">Get all values inside an array when the source completes</span>\n *\n * <img src=\"./img/toArray.png\" width=\"100%\">\n *\n * `toArray` will wait until the source Observable completes\n * before emitting the array containing all emissions.\n * When the source Observable errors no array will be emitted.\n *\n * @example <caption>Create array from input</caption>\n * const input = Rx.Observable.interval(100).take(4);\n *\n * input.toArray()\n *   .subscribe(arr => console.log(arr)); // [0,1,2,3]\n *\n * @see {@link buffer}\n *\n * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}\n * @method toArray\n * @owner Observable\n */\nfunction toArray() {\n    return toArray_1.toArray()(this);\n}\nexports.toArray = toArray;\n//# sourceMappingURL=toArray.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/toArray.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/buffer.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operators/buffer.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ \"./node_modules/rxjs/OuterSubscriber.js\");\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ \"./node_modules/rxjs/util/subscribeToResult.js\");\n/**\n * Buffers the source Observable values until `closingNotifier` emits.\n *\n * <span class=\"informal\">Collects values from the past as an array, and emits\n * that array only when another Observable emits.</span>\n *\n * <img src=\"./img/buffer.png\" width=\"100%\">\n *\n * Buffers the incoming Observable values until the given `closingNotifier`\n * Observable emits a value, at which point it emits the buffer on the output\n * Observable and starts a new buffer internally, awaiting the next time\n * `closingNotifier` emits.\n *\n * @example <caption>On every click, emit array of most recent interval events</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var interval = Rx.Observable.interval(1000);\n * var buffered = interval.buffer(clicks);\n * buffered.subscribe(x => console.log(x));\n *\n * @see {@link bufferCount}\n * @see {@link bufferTime}\n * @see {@link bufferToggle}\n * @see {@link bufferWhen}\n * @see {@link window}\n *\n * @param {Observable<any>} closingNotifier An Observable that signals the\n * buffer to be emitted on the output Observable.\n * @return {Observable<T[]>} An Observable of buffers, which are arrays of\n * values.\n * @method buffer\n * @owner Observable\n */\nfunction buffer(closingNotifier) {\n    return function bufferOperatorFunction(source) {\n        return source.lift(new BufferOperator(closingNotifier));\n    };\n}\nexports.buffer = buffer;\nvar BufferOperator = (function () {\n    function BufferOperator(closingNotifier) {\n        this.closingNotifier = closingNotifier;\n    }\n    BufferOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new BufferSubscriber(subscriber, this.closingNotifier));\n    };\n    return BufferOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar BufferSubscriber = (function (_super) {\n    __extends(BufferSubscriber, _super);\n    function BufferSubscriber(destination, closingNotifier) {\n        _super.call(this, destination);\n        this.buffer = [];\n        this.add(subscribeToResult_1.subscribeToResult(this, closingNotifier));\n    }\n    BufferSubscriber.prototype._next = function (value) {\n        this.buffer.push(value);\n    };\n    BufferSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        var buffer = this.buffer;\n        this.buffer = [];\n        this.destination.next(buffer);\n    };\n    return BufferSubscriber;\n}(OuterSubscriber_1.OuterSubscriber));\n//# sourceMappingURL=buffer.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/buffer.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/catchError.js":
/*!***************************************************!*\
  !*** ./node_modules/rxjs/operators/catchError.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ \"./node_modules/rxjs/OuterSubscriber.js\");\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ \"./node_modules/rxjs/util/subscribeToResult.js\");\n/**\n * Catches errors on the observable to be handled by returning a new observable or throwing an error.\n *\n * <img src=\"./img/catch.png\" width=\"100%\">\n *\n * @example <caption>Continues with a different Observable when there's an error</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n * \t   if (n == 4) {\n * \t     throw 'four!';\n *     }\n *\t   return n;\n *   })\n *   .catch(err => Observable.of('I', 'II', 'III', 'IV', 'V'))\n *   .subscribe(x => console.log(x));\n *   // 1, 2, 3, I, II, III, IV, V\n *\n * @example <caption>Retries the caught source Observable again in case of error, similar to retry() operator</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n * \t   if (n === 4) {\n * \t     throw 'four!';\n *     }\n * \t   return n;\n *   })\n *   .catch((err, caught) => caught)\n *   .take(30)\n *   .subscribe(x => console.log(x));\n *   // 1, 2, 3, 1, 2, 3, ...\n *\n * @example <caption>Throws a new error when the source Observable throws an error</caption>\n *\n * Observable.of(1, 2, 3, 4, 5)\n *   .map(n => {\n *     if (n == 4) {\n *       throw 'four!';\n *     }\n *     return n;\n *   })\n *   .catch(err => {\n *     throw 'error in source. Details: ' + err;\n *   })\n *   .subscribe(\n *     x => console.log(x),\n *     err => console.log(err)\n *   );\n *   // 1, 2, 3, error in source. Details: four!\n *\n * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which\n *  is the source observable, in case you'd like to \"retry\" that observable by returning it again. Whatever observable\n *  is returned by the `selector` will be used to continue the observable chain.\n * @return {Observable} An observable that originates from either the source or the observable returned by the\n *  catch `selector` function.\n * @name catchError\n */\nfunction catchError(selector) {\n    return function catchErrorOperatorFunction(source) {\n        var operator = new CatchOperator(selector);\n        var caught = source.lift(operator);\n        return (operator.caught = caught);\n    };\n}\nexports.catchError = catchError;\nvar CatchOperator = (function () {\n    function CatchOperator(selector) {\n        this.selector = selector;\n    }\n    CatchOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));\n    };\n    return CatchOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar CatchSubscriber = (function (_super) {\n    __extends(CatchSubscriber, _super);\n    function CatchSubscriber(destination, selector, caught) {\n        _super.call(this, destination);\n        this.selector = selector;\n        this.caught = caught;\n    }\n    // NOTE: overriding `error` instead of `_error` because we don't want\n    // to have this flag this subscriber as `isStopped`. We can mimic the\n    // behavior of the RetrySubscriber (from the `retry` operator), where\n    // we unsubscribe from our source chain, reset our Subscriber flags,\n    // then subscribe to the selector result.\n    CatchSubscriber.prototype.error = function (err) {\n        if (!this.isStopped) {\n            var result = void 0;\n            try {\n                result = this.selector(err, this.caught);\n            }\n            catch (err2) {\n                _super.prototype.error.call(this, err2);\n                return;\n            }\n            this._unsubscribeAndRecycle();\n            this.add(subscribeToResult_1.subscribeToResult(this, result));\n        }\n    };\n    return CatchSubscriber;\n}(OuterSubscriber_1.OuterSubscriber));\n//# sourceMappingURL=catchError.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/catchError.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/concat.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operators/concat.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar concat_1 = __webpack_require__(/*! ../observable/concat */ \"./node_modules/rxjs/observable/concat.js\");\nvar concat_2 = __webpack_require__(/*! ../observable/concat */ \"./node_modules/rxjs/observable/concat.js\");\nexports.concatStatic = concat_2.concat;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which sequentially emits all values from every\n * given input Observable after the current Observable.\n *\n * <span class=\"informal\">Concatenates multiple Observables together by\n * sequentially emitting their values, one Observable after the other.</span>\n *\n * <img src=\"./img/concat.png\" width=\"100%\">\n *\n * Joins this Observable with multiple other Observables by subscribing to them\n * one at a time, starting with the source, and merging their results into the\n * output Observable. Will wait for each Observable to complete before moving\n * on to the next.\n *\n * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>\n * var timer = Rx.Observable.interval(1000).take(4);\n * var sequence = Rx.Observable.range(1, 10);\n * var result = timer.concat(sequence);\n * result.subscribe(x => console.log(x));\n *\n * // results in:\n * // 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10\n *\n * @example <caption>Concatenate 3 Observables</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var result = timer1.concat(timer2, timer3);\n * result.subscribe(x => console.log(x));\n *\n * // results in the following:\n * // (Prints to console sequentially)\n * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9\n * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5\n * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9\n *\n * @see {@link concatAll}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n *\n * @param {ObservableInput} other An input Observable to concatenate after the source\n * Observable. More than one input Observables may be given as argument.\n * @param {Scheduler} [scheduler=null] An optional IScheduler to schedule each\n * Observable subscription on.\n * @return {Observable} All values of each passed Observable merged into a\n * single Observable, in order, in serial fashion.\n * @method concat\n * @owner Observable\n */\nfunction concat() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return function (source) { return source.lift.call(concat_1.concat.apply(void 0, [source].concat(observables))); };\n}\nexports.concat = concat;\n//# sourceMappingURL=concat.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/concat.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/concatAll.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/operators/concatAll.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar mergeAll_1 = __webpack_require__(/*! ./mergeAll */ \"./node_modules/rxjs/operators/mergeAll.js\");\n/**\n * Converts a higher-order Observable into a first-order Observable by\n * concatenating the inner Observables in order.\n *\n * <span class=\"informal\">Flattens an Observable-of-Observables by putting one\n * inner Observable after the other.</span>\n *\n * <img src=\"./img/concatAll.png\" width=\"100%\">\n *\n * Joins every Observable emitted by the source (a higher-order Observable), in\n * a serial fashion. It subscribes to each inner Observable only after the\n * previous inner Observable has completed, and merges all of their values into\n * the returned observable.\n *\n * __Warning:__ If the source Observable emits Observables quickly and\n * endlessly, and the inner Observables it emits generally complete slower than\n * the source emits, you can run into memory issues as the incoming Observables\n * collect in an unbounded buffer.\n *\n * Note: `concatAll` is equivalent to `mergeAll` with concurrency parameter set\n * to `1`.\n *\n * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var higherOrder = clicks.map(ev => Rx.Observable.interval(1000).take(4));\n * var firstOrder = higherOrder.concatAll();\n * firstOrder.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // (results are not concurrent)\n * // For every click on the \"document\" it will emit values 0 to 3 spaced\n * // on a 1000ms interval\n * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3\n *\n * @see {@link combineAll}\n * @see {@link concat}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n * @see {@link exhaust}\n * @see {@link mergeAll}\n * @see {@link switch}\n * @see {@link zipAll}\n *\n * @return {Observable} An Observable emitting values from all the inner\n * Observables concatenated.\n * @method concatAll\n * @owner Observable\n */\nfunction concatAll() {\n    return mergeAll_1.mergeAll(1);\n}\nexports.concatAll = concatAll;\n//# sourceMappingURL=concatAll.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/concatAll.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/concatMap.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/operators/concatMap.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar mergeMap_1 = __webpack_require__(/*! ./mergeMap */ \"./node_modules/rxjs/operators/mergeMap.js\");\n/* tslint:enable:max-line-length */\n/**\n * Projects each source value to an Observable which is merged in the output\n * Observable, in a serialized fashion waiting for each one to complete before\n * merging the next.\n *\n * <span class=\"informal\">Maps each value to an Observable, then flattens all of\n * these inner Observables using {@link concatAll}.</span>\n *\n * <img src=\"./img/concatMap.png\" width=\"100%\">\n *\n * Returns an Observable that emits items based on applying a function that you\n * supply to each item emitted by the source Observable, where that function\n * returns an (so-called \"inner\") Observable. Each new inner Observable is\n * concatenated with the previous inner Observable.\n *\n * __Warning:__ if source values arrive endlessly and faster than their\n * corresponding inner Observables can complete, it will result in memory issues\n * as inner Observables amass in an unbounded buffer waiting for their turn to\n * be subscribed to.\n *\n * Note: `concatMap` is equivalent to `mergeMap` with concurrency parameter set\n * to `1`.\n *\n * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.concatMap(ev => Rx.Observable.interval(1000).take(4));\n * result.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // (results are not concurrent)\n * // For every click on the \"document\" it will emit values 0 to 3 spaced\n * // on a 1000ms interval\n * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3\n *\n * @see {@link concat}\n * @see {@link concatAll}\n * @see {@link concatMapTo}\n * @see {@link exhaustMap}\n * @see {@link mergeMap}\n * @see {@link switchMap}\n *\n * @param {function(value: T, ?index: number): ObservableInput} project A function\n * that, when applied to an item emitted by the source Observable, returns an\n * Observable.\n * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]\n * A function to produce the value on the output Observable based on the values\n * and the indices of the source (outer) emission and the inner Observable\n * emission. The arguments passed to this function are:\n * - `outerValue`: the value that came from the source\n * - `innerValue`: the value that came from the projected Observable\n * - `outerIndex`: the \"index\" of the value that came from the source\n * - `innerIndex`: the \"index\" of the value from the projected Observable\n * @return {Observable} An Observable that emits the result of applying the\n * projection function (and the optional `resultSelector`) to each item emitted\n * by the source Observable and taking values from each projected inner\n * Observable sequentially.\n * @method concatMap\n * @owner Observable\n */\nfunction concatMap(project, resultSelector) {\n    return mergeMap_1.mergeMap(project, resultSelector, 1);\n}\nexports.concatMap = concatMap;\n//# sourceMappingURL=concatMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/concatMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/debounceTime.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/operators/debounceTime.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar async_1 = __webpack_require__(/*! ../scheduler/async */ \"./node_modules/rxjs/scheduler/async.js\");\n/**\n * Emits a value from the source Observable only after a particular time span\n * has passed without another source emission.\n *\n * <span class=\"informal\">It's like {@link delay}, but passes only the most\n * recent value from each burst of emissions.</span>\n *\n * <img src=\"./img/debounceTime.png\" width=\"100%\">\n *\n * `debounceTime` delays values emitted by the source Observable, but drops\n * previous pending delayed emissions if a new value arrives on the source\n * Observable. This operator keeps track of the most recent value from the\n * source Observable, and emits that only when `dueTime` enough time has passed\n * without any other value appearing on the source Observable. If a new value\n * appears before `dueTime` silence occurs, the previous value will be dropped\n * and will not be emitted on the output Observable.\n *\n * This is a rate-limiting operator, because it is impossible for more than one\n * value to be emitted in any time window of duration `dueTime`, but it is also\n * a delay-like operator since output emissions do not occur at the same time as\n * they did on the source Observable. Optionally takes a {@link IScheduler} for\n * managing timers.\n *\n * @example <caption>Emit the most recent click after a burst of clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.debounceTime(1000);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link auditTime}\n * @see {@link debounce}\n * @see {@link delay}\n * @see {@link sampleTime}\n * @see {@link throttleTime}\n *\n * @param {number} dueTime The timeout duration in milliseconds (or the time\n * unit determined internally by the optional `scheduler`) for the window of\n * time required to wait for emission silence before emitting the most recent\n * source value.\n * @param {Scheduler} [scheduler=async] The {@link IScheduler} to use for\n * managing the timers that handle the timeout for each value.\n * @return {Observable} An Observable that delays the emissions of the source\n * Observable by the specified `dueTime`, and may drop some values if they occur\n * too frequently.\n * @method debounceTime\n * @owner Observable\n */\nfunction debounceTime(dueTime, scheduler) {\n    if (scheduler === void 0) { scheduler = async_1.async; }\n    return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };\n}\nexports.debounceTime = debounceTime;\nvar DebounceTimeOperator = (function () {\n    function DebounceTimeOperator(dueTime, scheduler) {\n        this.dueTime = dueTime;\n        this.scheduler = scheduler;\n    }\n    DebounceTimeOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));\n    };\n    return DebounceTimeOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DebounceTimeSubscriber = (function (_super) {\n    __extends(DebounceTimeSubscriber, _super);\n    function DebounceTimeSubscriber(destination, dueTime, scheduler) {\n        _super.call(this, destination);\n        this.dueTime = dueTime;\n        this.scheduler = scheduler;\n        this.debouncedSubscription = null;\n        this.lastValue = null;\n        this.hasValue = false;\n    }\n    DebounceTimeSubscriber.prototype._next = function (value) {\n        this.clearDebounce();\n        this.lastValue = value;\n        this.hasValue = true;\n        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));\n    };\n    DebounceTimeSubscriber.prototype._complete = function () {\n        this.debouncedNext();\n        this.destination.complete();\n    };\n    DebounceTimeSubscriber.prototype.debouncedNext = function () {\n        this.clearDebounce();\n        if (this.hasValue) {\n            this.destination.next(this.lastValue);\n            this.lastValue = null;\n            this.hasValue = false;\n        }\n    };\n    DebounceTimeSubscriber.prototype.clearDebounce = function () {\n        var debouncedSubscription = this.debouncedSubscription;\n        if (debouncedSubscription !== null) {\n            this.remove(debouncedSubscription);\n            debouncedSubscription.unsubscribe();\n            this.debouncedSubscription = null;\n        }\n    };\n    return DebounceTimeSubscriber;\n}(Subscriber_1.Subscriber));\nfunction dispatchNext(subscriber) {\n    subscriber.debouncedNext();\n}\n//# sourceMappingURL=debounceTime.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/debounceTime.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/defaultIfEmpty.js":
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/operators/defaultIfEmpty.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/* tslint:enable:max-line-length */\n/**\n * Emits a given value if the source Observable completes without emitting any\n * `next` value, otherwise mirrors the source Observable.\n *\n * <span class=\"informal\">If the source Observable turns out to be empty, then\n * this operator will emit a default value.</span>\n *\n * <img src=\"./img/defaultIfEmpty.png\" width=\"100%\">\n *\n * `defaultIfEmpty` emits the values emitted by the source Observable or a\n * specified default value if the source Observable is empty (completes without\n * having emitted any `next` value).\n *\n * @example <caption>If no clicks happen in 5 seconds, then emit \"no clicks\"</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var clicksBeforeFive = clicks.takeUntil(Rx.Observable.interval(5000));\n * var result = clicksBeforeFive.defaultIfEmpty('no clicks');\n * result.subscribe(x => console.log(x));\n *\n * @see {@link empty}\n * @see {@link last}\n *\n * @param {any} [defaultValue=null] The default value used if the source\n * Observable is empty.\n * @return {Observable} An Observable that emits either the specified\n * `defaultValue` if the source Observable emits no items, or the values emitted\n * by the source Observable.\n * @method defaultIfEmpty\n * @owner Observable\n */\nfunction defaultIfEmpty(defaultValue) {\n    if (defaultValue === void 0) { defaultValue = null; }\n    return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };\n}\nexports.defaultIfEmpty = defaultIfEmpty;\nvar DefaultIfEmptyOperator = (function () {\n    function DefaultIfEmptyOperator(defaultValue) {\n        this.defaultValue = defaultValue;\n    }\n    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));\n    };\n    return DefaultIfEmptyOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DefaultIfEmptySubscriber = (function (_super) {\n    __extends(DefaultIfEmptySubscriber, _super);\n    function DefaultIfEmptySubscriber(destination, defaultValue) {\n        _super.call(this, destination);\n        this.defaultValue = defaultValue;\n        this.isEmpty = true;\n    }\n    DefaultIfEmptySubscriber.prototype._next = function (value) {\n        this.isEmpty = false;\n        this.destination.next(value);\n    };\n    DefaultIfEmptySubscriber.prototype._complete = function () {\n        if (this.isEmpty) {\n            this.destination.next(this.defaultValue);\n        }\n        this.destination.complete();\n    };\n    return DefaultIfEmptySubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=defaultIfEmpty.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/defaultIfEmpty.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/delay.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operators/delay.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar async_1 = __webpack_require__(/*! ../scheduler/async */ \"./node_modules/rxjs/scheduler/async.js\");\nvar isDate_1 = __webpack_require__(/*! ../util/isDate */ \"./node_modules/rxjs/util/isDate.js\");\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar Notification_1 = __webpack_require__(/*! ../Notification */ \"./node_modules/rxjs/Notification.js\");\n/**\n * Delays the emission of items from the source Observable by a given timeout or\n * until a given Date.\n *\n * <span class=\"informal\">Time shifts each item by some specified amount of\n * milliseconds.</span>\n *\n * <img src=\"./img/delay.png\" width=\"100%\">\n *\n * If the delay argument is a Number, this operator time shifts the source\n * Observable by that amount of time expressed in milliseconds. The relative\n * time intervals between the values are preserved.\n *\n * If the delay argument is a Date, this operator time shifts the start of the\n * Observable execution until the given date occurs.\n *\n * @example <caption>Delay each click by one second</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var delayedClicks = clicks.delay(1000); // each click emitted after 1 second\n * delayedClicks.subscribe(x => console.log(x));\n *\n * @example <caption>Delay all clicks until a future date happens</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var date = new Date('March 15, 2050 12:00:00'); // in the future\n * var delayedClicks = clicks.delay(date); // click emitted only after that date\n * delayedClicks.subscribe(x => console.log(x));\n *\n * @see {@link debounceTime}\n * @see {@link delayWhen}\n *\n * @param {number|Date} delay The delay duration in milliseconds (a `number`) or\n * a `Date` until which the emission of the source items is delayed.\n * @param {Scheduler} [scheduler=async] The IScheduler to use for\n * managing the timers that handle the time-shift for each item.\n * @return {Observable} An Observable that delays the emissions of the source\n * Observable by the specified timeout or Date.\n * @method delay\n * @owner Observable\n */\nfunction delay(delay, scheduler) {\n    if (scheduler === void 0) { scheduler = async_1.async; }\n    var absoluteDelay = isDate_1.isDate(delay);\n    var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);\n    return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };\n}\nexports.delay = delay;\nvar DelayOperator = (function () {\n    function DelayOperator(delay, scheduler) {\n        this.delay = delay;\n        this.scheduler = scheduler;\n    }\n    DelayOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));\n    };\n    return DelayOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DelaySubscriber = (function (_super) {\n    __extends(DelaySubscriber, _super);\n    function DelaySubscriber(destination, delay, scheduler) {\n        _super.call(this, destination);\n        this.delay = delay;\n        this.scheduler = scheduler;\n        this.queue = [];\n        this.active = false;\n        this.errored = false;\n    }\n    DelaySubscriber.dispatch = function (state) {\n        var source = state.source;\n        var queue = source.queue;\n        var scheduler = state.scheduler;\n        var destination = state.destination;\n        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {\n            queue.shift().notification.observe(destination);\n        }\n        if (queue.length > 0) {\n            var delay_1 = Math.max(0, queue[0].time - scheduler.now());\n            this.schedule(state, delay_1);\n        }\n        else {\n            this.unsubscribe();\n            source.active = false;\n        }\n    };\n    DelaySubscriber.prototype._schedule = function (scheduler) {\n        this.active = true;\n        this.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {\n            source: this, destination: this.destination, scheduler: scheduler\n        }));\n    };\n    DelaySubscriber.prototype.scheduleNotification = function (notification) {\n        if (this.errored === true) {\n            return;\n        }\n        var scheduler = this.scheduler;\n        var message = new DelayMessage(scheduler.now() + this.delay, notification);\n        this.queue.push(message);\n        if (this.active === false) {\n            this._schedule(scheduler);\n        }\n    };\n    DelaySubscriber.prototype._next = function (value) {\n        this.scheduleNotification(Notification_1.Notification.createNext(value));\n    };\n    DelaySubscriber.prototype._error = function (err) {\n        this.errored = true;\n        this.queue = [];\n        this.destination.error(err);\n    };\n    DelaySubscriber.prototype._complete = function () {\n        this.scheduleNotification(Notification_1.Notification.createComplete());\n    };\n    return DelaySubscriber;\n}(Subscriber_1.Subscriber));\nvar DelayMessage = (function () {\n    function DelayMessage(time, notification) {\n        this.time = time;\n        this.notification = notification;\n    }\n    return DelayMessage;\n}());\n//# sourceMappingURL=delay.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/delay.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/distinctUntilChanged.js":
/*!*************************************************************!*\
  !*** ./node_modules/rxjs/operators/distinctUntilChanged.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar tryCatch_1 = __webpack_require__(/*! ../util/tryCatch */ \"./node_modules/rxjs/util/tryCatch.js\");\nvar errorObject_1 = __webpack_require__(/*! ../util/errorObject */ \"./node_modules/rxjs/util/errorObject.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.\n *\n * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.\n *\n * If a comparator function is not provided, an equality check is used by default.\n *\n * @example <caption>A simple example with numbers</caption>\n * Observable.of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4)\n *   .distinctUntilChanged()\n *   .subscribe(x => console.log(x)); // 1, 2, 1, 2, 3, 4\n *\n * @example <caption>An example using a compare function</caption>\n * interface Person {\n *    age: number,\n *    name: string\n * }\n *\n * Observable.of<Person>(\n *     { age: 4, name: 'Foo'},\n *     { age: 7, name: 'Bar'},\n *     { age: 5, name: 'Foo'})\n *     { age: 6, name: 'Foo'})\n *     .distinctUntilChanged((p: Person, q: Person) => p.name === q.name)\n *     .subscribe(x => console.log(x));\n *\n * // displays:\n * // { age: 4, name: 'Foo' }\n * // { age: 7, name: 'Bar' }\n * // { age: 5, name: 'Foo' }\n *\n * @see {@link distinct}\n * @see {@link distinctUntilKeyChanged}\n *\n * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.\n * @return {Observable} An Observable that emits items from the source Observable with distinct values.\n * @method distinctUntilChanged\n * @owner Observable\n */\nfunction distinctUntilChanged(compare, keySelector) {\n    return function (source) { return source.lift(new DistinctUntilChangedOperator(compare, keySelector)); };\n}\nexports.distinctUntilChanged = distinctUntilChanged;\nvar DistinctUntilChangedOperator = (function () {\n    function DistinctUntilChangedOperator(compare, keySelector) {\n        this.compare = compare;\n        this.keySelector = keySelector;\n    }\n    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));\n    };\n    return DistinctUntilChangedOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DistinctUntilChangedSubscriber = (function (_super) {\n    __extends(DistinctUntilChangedSubscriber, _super);\n    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {\n        _super.call(this, destination);\n        this.keySelector = keySelector;\n        this.hasKey = false;\n        if (typeof compare === 'function') {\n            this.compare = compare;\n        }\n    }\n    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {\n        return x === y;\n    };\n    DistinctUntilChangedSubscriber.prototype._next = function (value) {\n        var keySelector = this.keySelector;\n        var key = value;\n        if (keySelector) {\n            key = tryCatch_1.tryCatch(this.keySelector)(value);\n            if (key === errorObject_1.errorObject) {\n                return this.destination.error(errorObject_1.errorObject.e);\n            }\n        }\n        var result = false;\n        if (this.hasKey) {\n            result = tryCatch_1.tryCatch(this.compare)(this.key, key);\n            if (result === errorObject_1.errorObject) {\n                return this.destination.error(errorObject_1.errorObject.e);\n            }\n        }\n        else {\n            this.hasKey = true;\n        }\n        if (Boolean(result) === false) {\n            this.key = key;\n            this.destination.next(value);\n        }\n    };\n    return DistinctUntilChangedSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=distinctUntilChanged.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/distinctUntilChanged.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/filter.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operators/filter.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/* tslint:enable:max-line-length */\n/**\n * Filter items emitted by the source Observable by only emitting those that\n * satisfy a specified predicate.\n *\n * <span class=\"informal\">Like\n * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),\n * it only emits a value from the source if it passes a criterion function.</span>\n *\n * <img src=\"./img/filter.png\" width=\"100%\">\n *\n * Similar to the well-known `Array.prototype.filter` method, this operator\n * takes values from the source Observable, passes them through a `predicate`\n * function and only emits those values that yielded `true`.\n *\n * @example <caption>Emit only click events whose target was a DIV element</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');\n * clicksOnDivs.subscribe(x => console.log(x));\n *\n * @see {@link distinct}\n * @see {@link distinctUntilChanged}\n * @see {@link distinctUntilKeyChanged}\n * @see {@link ignoreElements}\n * @see {@link partition}\n * @see {@link skip}\n *\n * @param {function(value: T, index: number): boolean} predicate A function that\n * evaluates each value emitted by the source Observable. If it returns `true`,\n * the value is emitted, if `false` the value is not passed to the output\n * Observable. The `index` parameter is the number `i` for the i-th source\n * emission that has happened since the subscription, starting from the number\n * `0`.\n * @param {any} [thisArg] An optional argument to determine the value of `this`\n * in the `predicate` function.\n * @return {Observable} An Observable of values from the source that were\n * allowed by the `predicate` function.\n * @method filter\n * @owner Observable\n */\nfunction filter(predicate, thisArg) {\n    return function filterOperatorFunction(source) {\n        return source.lift(new FilterOperator(predicate, thisArg));\n    };\n}\nexports.filter = filter;\nvar FilterOperator = (function () {\n    function FilterOperator(predicate, thisArg) {\n        this.predicate = predicate;\n        this.thisArg = thisArg;\n    }\n    FilterOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));\n    };\n    return FilterOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar FilterSubscriber = (function (_super) {\n    __extends(FilterSubscriber, _super);\n    function FilterSubscriber(destination, predicate, thisArg) {\n        _super.call(this, destination);\n        this.predicate = predicate;\n        this.thisArg = thisArg;\n        this.count = 0;\n    }\n    // the try catch block below is left specifically for\n    // optimization and perf reasons. a tryCatcher is not necessary here.\n    FilterSubscriber.prototype._next = function (value) {\n        var result;\n        try {\n            result = this.predicate.call(this.thisArg, value, this.count++);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        if (result) {\n            this.destination.next(value);\n        }\n    };\n    return FilterSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=filter.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/filter.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/finalize.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operators/finalize.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar Subscription_1 = __webpack_require__(/*! ../Subscription */ \"./node_modules/rxjs/Subscription.js\");\n/**\n * Returns an Observable that mirrors the source Observable, but will call a specified function when\n * the source terminates on complete or error.\n * @param {function} callback Function to be called when source terminates.\n * @return {Observable} An Observable that mirrors the source, but will call the specified function on termination.\n * @method finally\n * @owner Observable\n */\nfunction finalize(callback) {\n    return function (source) { return source.lift(new FinallyOperator(callback)); };\n}\nexports.finalize = finalize;\nvar FinallyOperator = (function () {\n    function FinallyOperator(callback) {\n        this.callback = callback;\n    }\n    FinallyOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new FinallySubscriber(subscriber, this.callback));\n    };\n    return FinallyOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar FinallySubscriber = (function (_super) {\n    __extends(FinallySubscriber, _super);\n    function FinallySubscriber(destination, callback) {\n        _super.call(this, destination);\n        this.add(new Subscription_1.Subscription(callback));\n    }\n    return FinallySubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=finalize.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/finalize.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/last.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operators/last.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar EmptyError_1 = __webpack_require__(/*! ../util/EmptyError */ \"./node_modules/rxjs/util/EmptyError.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits only the last item emitted by the source Observable.\n * It optionally takes a predicate function as a parameter, in which case, rather than emitting\n * the last item from the source Observable, the resulting Observable will emit the last item\n * from the source Observable that satisfies the predicate.\n *\n * <img src=\"./img/last.png\" width=\"100%\">\n *\n * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`\n * callback if the Observable completes before any `next` notification was sent.\n * @param {function} predicate - The condition any source emitted item has to satisfy.\n * @return {Observable} An Observable that emits only the last item satisfying the given condition\n * from the source, or an NoSuchElementException if no such items are emitted.\n * @throws - Throws if no items that match the predicate are emitted by the source Observable.\n * @method last\n * @owner Observable\n */\nfunction last(predicate, resultSelector, defaultValue) {\n    return function (source) { return source.lift(new LastOperator(predicate, resultSelector, defaultValue, source)); };\n}\nexports.last = last;\nvar LastOperator = (function () {\n    function LastOperator(predicate, resultSelector, defaultValue, source) {\n        this.predicate = predicate;\n        this.resultSelector = resultSelector;\n        this.defaultValue = defaultValue;\n        this.source = source;\n    }\n    LastOperator.prototype.call = function (observer, source) {\n        return source.subscribe(new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source));\n    };\n    return LastOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar LastSubscriber = (function (_super) {\n    __extends(LastSubscriber, _super);\n    function LastSubscriber(destination, predicate, resultSelector, defaultValue, source) {\n        _super.call(this, destination);\n        this.predicate = predicate;\n        this.resultSelector = resultSelector;\n        this.defaultValue = defaultValue;\n        this.source = source;\n        this.hasValue = false;\n        this.index = 0;\n        if (typeof defaultValue !== 'undefined') {\n            this.lastValue = defaultValue;\n            this.hasValue = true;\n        }\n    }\n    LastSubscriber.prototype._next = function (value) {\n        var index = this.index++;\n        if (this.predicate) {\n            this._tryPredicate(value, index);\n        }\n        else {\n            if (this.resultSelector) {\n                this._tryResultSelector(value, index);\n                return;\n            }\n            this.lastValue = value;\n            this.hasValue = true;\n        }\n    };\n    LastSubscriber.prototype._tryPredicate = function (value, index) {\n        var result;\n        try {\n            result = this.predicate(value, index, this.source);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        if (result) {\n            if (this.resultSelector) {\n                this._tryResultSelector(value, index);\n                return;\n            }\n            this.lastValue = value;\n            this.hasValue = true;\n        }\n    };\n    LastSubscriber.prototype._tryResultSelector = function (value, index) {\n        var result;\n        try {\n            result = this.resultSelector(value, index);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.lastValue = result;\n        this.hasValue = true;\n    };\n    LastSubscriber.prototype._complete = function () {\n        var destination = this.destination;\n        if (this.hasValue) {\n            destination.next(this.lastValue);\n            destination.complete();\n        }\n        else {\n            destination.error(new EmptyError_1.EmptyError);\n        }\n    };\n    return LastSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=last.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/last.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/map.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operators/map.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/**\n * Applies a given `project` function to each value emitted by the source\n * Observable, and emits the resulting values as an Observable.\n *\n * <span class=\"informal\">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),\n * it passes each source value through a transformation function to get\n * corresponding output values.</span>\n *\n * <img src=\"./img/map.png\" width=\"100%\">\n *\n * Similar to the well known `Array.prototype.map` function, this operator\n * applies a projection to each value and emits that projection in the output\n * Observable.\n *\n * @example <caption>Map every click to the clientX position of that click</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks.map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link mapTo}\n * @see {@link pluck}\n *\n * @param {function(value: T, index: number): R} project The function to apply\n * to each `value` emitted by the source Observable. The `index` parameter is\n * the number `i` for the i-th emission that has happened since the\n * subscription, starting from the number `0`.\n * @param {any} [thisArg] An optional argument to define what `this` is in the\n * `project` function.\n * @return {Observable<R>} An Observable that emits the values from the source\n * Observable transformed by the given `project` function.\n * @method map\n * @owner Observable\n */\nfunction map(project, thisArg) {\n    return function mapOperation(source) {\n        if (typeof project !== 'function') {\n            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');\n        }\n        return source.lift(new MapOperator(project, thisArg));\n    };\n}\nexports.map = map;\nvar MapOperator = (function () {\n    function MapOperator(project, thisArg) {\n        this.project = project;\n        this.thisArg = thisArg;\n    }\n    MapOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));\n    };\n    return MapOperator;\n}());\nexports.MapOperator = MapOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar MapSubscriber = (function (_super) {\n    __extends(MapSubscriber, _super);\n    function MapSubscriber(destination, project, thisArg) {\n        _super.call(this, destination);\n        this.project = project;\n        this.count = 0;\n        this.thisArg = thisArg || this;\n    }\n    // NOTE: This looks unoptimized, but it's actually purposefully NOT\n    // using try/catch optimizations.\n    MapSubscriber.prototype._next = function (value) {\n        var result;\n        try {\n            result = this.project.call(this.thisArg, value, this.count++);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.destination.next(result);\n    };\n    return MapSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=map.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/map.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/merge.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operators/merge.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar merge_1 = __webpack_require__(/*! ../observable/merge */ \"./node_modules/rxjs/observable/merge.js\");\nvar merge_2 = __webpack_require__(/*! ../observable/merge */ \"./node_modules/rxjs/observable/merge.js\");\nexports.mergeStatic = merge_2.merge;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which concurrently emits all values from every\n * given input Observable.\n *\n * <span class=\"informal\">Flattens multiple Observables together by blending\n * their values into one Observable.</span>\n *\n * <img src=\"./img/merge.png\" width=\"100%\">\n *\n * `merge` subscribes to each given input Observable (either the source or an\n * Observable given as argument), and simply forwards (without doing any\n * transformation) all the values from all the input Observables to the output\n * Observable. The output Observable only completes once all input Observables\n * have completed. Any error delivered by an input Observable will be immediately\n * emitted on the output Observable.\n *\n * @example <caption>Merge together two Observables: 1s interval and clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var clicksOrTimer = clicks.merge(timer);\n * clicksOrTimer.subscribe(x => console.log(x));\n *\n * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var concurrent = 2; // the argument\n * var merged = timer1.merge(timer2, timer3, concurrent);\n * merged.subscribe(x => console.log(x));\n *\n * @see {@link mergeAll}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n *\n * @param {ObservableInput} other An input Observable to merge with the source\n * Observable. More than one input Observables may be given as argument.\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for managing\n * concurrency of input Observables.\n * @return {Observable} An Observable that emits items that are the result of\n * every input Observable.\n * @method merge\n * @owner Observable\n */\nfunction merge() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return function (source) { return source.lift.call(merge_1.merge.apply(void 0, [source].concat(observables))); };\n}\nexports.merge = merge;\n//# sourceMappingURL=merge.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/merge.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/mergeAll.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operators/mergeAll.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar mergeMap_1 = __webpack_require__(/*! ./mergeMap */ \"./node_modules/rxjs/operators/mergeMap.js\");\nvar identity_1 = __webpack_require__(/*! ../util/identity */ \"./node_modules/rxjs/util/identity.js\");\n/**\n * Converts a higher-order Observable into a first-order Observable which\n * concurrently delivers all values that are emitted on the inner Observables.\n *\n * <span class=\"informal\">Flattens an Observable-of-Observables.</span>\n *\n * <img src=\"./img/mergeAll.png\" width=\"100%\">\n *\n * `mergeAll` subscribes to an Observable that emits Observables, also known as\n * a higher-order Observable. Each time it observes one of these emitted inner\n * Observables, it subscribes to that and delivers all the values from the\n * inner Observable on the output Observable. The output Observable only\n * completes once all inner Observables have completed. Any error delivered by\n * a inner Observable will be immediately emitted on the output Observable.\n *\n * @example <caption>Spawn a new interval Observable for each click event, and blend their outputs as one Observable</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));\n * var firstOrder = higherOrder.mergeAll();\n * firstOrder.subscribe(x => console.log(x));\n *\n * @example <caption>Count from 0 to 9 every second for each click, but only allow 2 concurrent timers</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));\n * var firstOrder = higherOrder.mergeAll(2);\n * firstOrder.subscribe(x => console.log(x));\n *\n * @see {@link combineAll}\n * @see {@link concatAll}\n * @see {@link exhaust}\n * @see {@link merge}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n * @see {@link switch}\n * @see {@link zipAll}\n *\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of inner\n * Observables being subscribed to concurrently.\n * @return {Observable} An Observable that emits values coming from all the\n * inner Observables emitted by the source Observable.\n * @method mergeAll\n * @owner Observable\n */\nfunction mergeAll(concurrent) {\n    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }\n    return mergeMap_1.mergeMap(identity_1.identity, null, concurrent);\n}\nexports.mergeAll = mergeAll;\n//# sourceMappingURL=mergeAll.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/mergeAll.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/mergeMap.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operators/mergeMap.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ \"./node_modules/rxjs/util/subscribeToResult.js\");\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ \"./node_modules/rxjs/OuterSubscriber.js\");\n/* tslint:enable:max-line-length */\n/**\n * Projects each source value to an Observable which is merged in the output\n * Observable.\n *\n * <span class=\"informal\">Maps each value to an Observable, then flattens all of\n * these inner Observables using {@link mergeAll}.</span>\n *\n * <img src=\"./img/mergeMap.png\" width=\"100%\">\n *\n * Returns an Observable that emits items based on applying a function that you\n * supply to each item emitted by the source Observable, where that function\n * returns an Observable, and then merging those resulting Observables and\n * emitting the results of this merger.\n *\n * @example <caption>Map and flatten each letter to an Observable ticking every 1 second</caption>\n * var letters = Rx.Observable.of('a', 'b', 'c');\n * var result = letters.mergeMap(x =>\n *   Rx.Observable.interval(1000).map(i => x+i)\n * );\n * result.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // a0\n * // b0\n * // c0\n * // a1\n * // b1\n * // c1\n * // continues to list a,b,c with respective ascending integers\n *\n * @see {@link concatMap}\n * @see {@link exhaustMap}\n * @see {@link merge}\n * @see {@link mergeAll}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n * @see {@link switchMap}\n *\n * @param {function(value: T, ?index: number): ObservableInput} project A function\n * that, when applied to an item emitted by the source Observable, returns an\n * Observable.\n * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]\n * A function to produce the value on the output Observable based on the values\n * and the indices of the source (outer) emission and the inner Observable\n * emission. The arguments passed to this function are:\n * - `outerValue`: the value that came from the source\n * - `innerValue`: the value that came from the projected Observable\n * - `outerIndex`: the \"index\" of the value that came from the source\n * - `innerIndex`: the \"index\" of the value from the projected Observable\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @return {Observable} An Observable that emits the result of applying the\n * projection function (and the optional `resultSelector`) to each item emitted\n * by the source Observable and merging the results of the Observables obtained\n * from this transformation.\n * @method mergeMap\n * @owner Observable\n */\nfunction mergeMap(project, resultSelector, concurrent) {\n    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }\n    return function mergeMapOperatorFunction(source) {\n        if (typeof resultSelector === 'number') {\n            concurrent = resultSelector;\n            resultSelector = null;\n        }\n        return source.lift(new MergeMapOperator(project, resultSelector, concurrent));\n    };\n}\nexports.mergeMap = mergeMap;\nvar MergeMapOperator = (function () {\n    function MergeMapOperator(project, resultSelector, concurrent) {\n        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }\n        this.project = project;\n        this.resultSelector = resultSelector;\n        this.concurrent = concurrent;\n    }\n    MergeMapOperator.prototype.call = function (observer, source) {\n        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.resultSelector, this.concurrent));\n    };\n    return MergeMapOperator;\n}());\nexports.MergeMapOperator = MergeMapOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar MergeMapSubscriber = (function (_super) {\n    __extends(MergeMapSubscriber, _super);\n    function MergeMapSubscriber(destination, project, resultSelector, concurrent) {\n        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }\n        _super.call(this, destination);\n        this.project = project;\n        this.resultSelector = resultSelector;\n        this.concurrent = concurrent;\n        this.hasCompleted = false;\n        this.buffer = [];\n        this.active = 0;\n        this.index = 0;\n    }\n    MergeMapSubscriber.prototype._next = function (value) {\n        if (this.active < this.concurrent) {\n            this._tryNext(value);\n        }\n        else {\n            this.buffer.push(value);\n        }\n    };\n    MergeMapSubscriber.prototype._tryNext = function (value) {\n        var result;\n        var index = this.index++;\n        try {\n            result = this.project(value, index);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.active++;\n        this._innerSub(result, value, index);\n    };\n    MergeMapSubscriber.prototype._innerSub = function (ish, value, index) {\n        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));\n    };\n    MergeMapSubscriber.prototype._complete = function () {\n        this.hasCompleted = true;\n        if (this.active === 0 && this.buffer.length === 0) {\n            this.destination.complete();\n        }\n    };\n    MergeMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        if (this.resultSelector) {\n            this._notifyResultSelector(outerValue, innerValue, outerIndex, innerIndex);\n        }\n        else {\n            this.destination.next(innerValue);\n        }\n    };\n    MergeMapSubscriber.prototype._notifyResultSelector = function (outerValue, innerValue, outerIndex, innerIndex) {\n        var result;\n        try {\n            result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);\n        }\n        catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.destination.next(result);\n    };\n    MergeMapSubscriber.prototype.notifyComplete = function (innerSub) {\n        var buffer = this.buffer;\n        this.remove(innerSub);\n        this.active--;\n        if (buffer.length > 0) {\n            this._next(buffer.shift());\n        }\n        else if (this.active === 0 && this.hasCompleted) {\n            this.destination.complete();\n        }\n    };\n    return MergeMapSubscriber;\n}(OuterSubscriber_1.OuterSubscriber));\nexports.MergeMapSubscriber = MergeMapSubscriber;\n//# sourceMappingURL=mergeMap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/mergeMap.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/observeOn.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/operators/observeOn.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar Notification_1 = __webpack_require__(/*! ../Notification */ \"./node_modules/rxjs/Notification.js\");\n/**\n *\n * Re-emits all notifications from source Observable with specified scheduler.\n *\n * <span class=\"informal\">Ensure a specific scheduler is used, from outside of an Observable.</span>\n *\n * `observeOn` is an operator that accepts a scheduler as a first parameter, which will be used to reschedule\n * notifications emitted by the source Observable. It might be useful, if you do not have control over\n * internal scheduler of a given Observable, but want to control when its values are emitted nevertheless.\n *\n * Returned Observable emits the same notifications (nexted values, complete and error events) as the source Observable,\n * but rescheduled with provided scheduler. Note that this doesn't mean that source Observables internal\n * scheduler will be replaced in any way. Original scheduler still will be used, but when the source Observable emits\n * notification, it will be immediately scheduled again - this time with scheduler passed to `observeOn`.\n * An anti-pattern would be calling `observeOn` on Observable that emits lots of values synchronously, to split\n * that emissions into asynchronous chunks. For this to happen, scheduler would have to be passed into the source\n * Observable directly (usually into the operator that creates it). `observeOn` simply delays notifications a\n * little bit more, to ensure that they are emitted at expected moments.\n *\n * As a matter of fact, `observeOn` accepts second parameter, which specifies in milliseconds with what delay notifications\n * will be emitted. The main difference between {@link delay} operator and `observeOn` is that `observeOn`\n * will delay all notifications - including error notifications - while `delay` will pass through error\n * from source Observable immediately when it is emitted. In general it is highly recommended to use `delay` operator\n * for any kind of delaying of values in the stream, while using `observeOn` to specify which scheduler should be used\n * for notification emissions in general.\n *\n * @example <caption>Ensure values in subscribe are called just before browser repaint.</caption>\n * const intervals = Rx.Observable.interval(10); // Intervals are scheduled\n *                                               // with async scheduler by default...\n *\n * intervals\n * .observeOn(Rx.Scheduler.animationFrame)       // ...but we will observe on animationFrame\n * .subscribe(val => {                           // scheduler to ensure smooth animation.\n *   someDiv.style.height = val + 'px';\n * });\n *\n * @see {@link delay}\n *\n * @param {IScheduler} scheduler Scheduler that will be used to reschedule notifications from source Observable.\n * @param {number} [delay] Number of milliseconds that states with what delay every notification should be rescheduled.\n * @return {Observable<T>} Observable that emits the same notifications as the source Observable,\n * but with provided scheduler.\n *\n * @method observeOn\n * @owner Observable\n */\nfunction observeOn(scheduler, delay) {\n    if (delay === void 0) { delay = 0; }\n    return function observeOnOperatorFunction(source) {\n        return source.lift(new ObserveOnOperator(scheduler, delay));\n    };\n}\nexports.observeOn = observeOn;\nvar ObserveOnOperator = (function () {\n    function ObserveOnOperator(scheduler, delay) {\n        if (delay === void 0) { delay = 0; }\n        this.scheduler = scheduler;\n        this.delay = delay;\n    }\n    ObserveOnOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));\n    };\n    return ObserveOnOperator;\n}());\nexports.ObserveOnOperator = ObserveOnOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar ObserveOnSubscriber = (function (_super) {\n    __extends(ObserveOnSubscriber, _super);\n    function ObserveOnSubscriber(destination, scheduler, delay) {\n        if (delay === void 0) { delay = 0; }\n        _super.call(this, destination);\n        this.scheduler = scheduler;\n        this.delay = delay;\n    }\n    ObserveOnSubscriber.dispatch = function (arg) {\n        var notification = arg.notification, destination = arg.destination;\n        notification.observe(destination);\n        this.unsubscribe();\n    };\n    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {\n        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));\n    };\n    ObserveOnSubscriber.prototype._next = function (value) {\n        this.scheduleMessage(Notification_1.Notification.createNext(value));\n    };\n    ObserveOnSubscriber.prototype._error = function (err) {\n        this.scheduleMessage(Notification_1.Notification.createError(err));\n    };\n    ObserveOnSubscriber.prototype._complete = function () {\n        this.scheduleMessage(Notification_1.Notification.createComplete());\n    };\n    return ObserveOnSubscriber;\n}(Subscriber_1.Subscriber));\nexports.ObserveOnSubscriber = ObserveOnSubscriber;\nvar ObserveOnMessage = (function () {\n    function ObserveOnMessage(notification, destination) {\n        this.notification = notification;\n        this.destination = destination;\n    }\n    return ObserveOnMessage;\n}());\nexports.ObserveOnMessage = ObserveOnMessage;\n//# sourceMappingURL=observeOn.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/observeOn.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/race.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operators/race.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ \"./node_modules/rxjs/util/isArray.js\");\nvar race_1 = __webpack_require__(/*! ../observable/race */ \"./node_modules/rxjs/observable/race.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that mirrors the first source Observable to emit an item\n * from the combination of this Observable and supplied Observables.\n * @param {...Observables} ...observables Sources used to race for which Observable emits first.\n * @return {Observable} An Observable that mirrors the output of the first Observable to emit an item.\n * @method race\n * @owner Observable\n */\nfunction race() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return function raceOperatorFunction(source) {\n        // if the only argument is an array, it was most likely called with\n        // `pair([obs1, obs2, ...])`\n        if (observables.length === 1 && isArray_1.isArray(observables[0])) {\n            observables = observables[0];\n        }\n        return source.lift.call(race_1.race.apply(void 0, [source].concat(observables)));\n    };\n}\nexports.race = race;\n//# sourceMappingURL=race.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/race.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/reduce.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/operators/reduce.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar scan_1 = __webpack_require__(/*! ./scan */ \"./node_modules/rxjs/operators/scan.js\");\nvar takeLast_1 = __webpack_require__(/*! ./takeLast */ \"./node_modules/rxjs/operators/takeLast.js\");\nvar defaultIfEmpty_1 = __webpack_require__(/*! ./defaultIfEmpty */ \"./node_modules/rxjs/operators/defaultIfEmpty.js\");\nvar pipe_1 = __webpack_require__(/*! ../util/pipe */ \"./node_modules/rxjs/util/pipe.js\");\n/* tslint:enable:max-line-length */\n/**\n * Applies an accumulator function over the source Observable, and returns the\n * accumulated result when the source completes, given an optional seed value.\n *\n * <span class=\"informal\">Combines together all values emitted on the source,\n * using an accumulator function that knows how to join a new source value into\n * the accumulation from the past.</span>\n *\n * <img src=\"./img/reduce.png\" width=\"100%\">\n *\n * Like\n * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),\n * `reduce` applies an `accumulator` function against an accumulation and each\n * value of the source Observable (from the past) to reduce it to a single\n * value, emitted on the output Observable. Note that `reduce` will only emit\n * one value, only when the source Observable completes. It is equivalent to\n * applying operator {@link scan} followed by operator {@link last}.\n *\n * Returns an Observable that applies a specified `accumulator` function to each\n * item emitted by the source Observable. If a `seed` value is specified, then\n * that value will be used as the initial value for the accumulator. If no seed\n * value is specified, the first item of the source is used as the seed.\n *\n * @example <caption>Count the number of click events that happened in 5 seconds</caption>\n * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')\n *   .takeUntil(Rx.Observable.interval(5000));\n * var ones = clicksInFiveSeconds.mapTo(1);\n * var seed = 0;\n * var count = ones.reduce((acc, one) => acc + one, seed);\n * count.subscribe(x => console.log(x));\n *\n * @see {@link count}\n * @see {@link expand}\n * @see {@link mergeScan}\n * @see {@link scan}\n *\n * @param {function(acc: R, value: T, index: number): R} accumulator The accumulator function\n * called on each source value.\n * @param {R} [seed] The initial accumulation value.\n * @return {Observable<R>} An Observable that emits a single value that is the\n * result of accumulating the values emitted by the source Observable.\n * @method reduce\n * @owner Observable\n */\nfunction reduce(accumulator, seed) {\n    // providing a seed of `undefined` *should* be valid and trigger\n    // hasSeed! so don't use `seed !== undefined` checks!\n    // For this reason, we have to check it here at the original call site\n    // otherwise inside Operator/Subscriber we won't know if `undefined`\n    // means they didn't provide anything or if they literally provided `undefined`\n    if (arguments.length >= 2) {\n        return function reduceOperatorFunctionWithSeed(source) {\n            return pipe_1.pipe(scan_1.scan(accumulator, seed), takeLast_1.takeLast(1), defaultIfEmpty_1.defaultIfEmpty(seed))(source);\n        };\n    }\n    return function reduceOperatorFunction(source) {\n        return pipe_1.pipe(scan_1.scan(function (acc, value, index) {\n            return accumulator(acc, value, index + 1);\n        }), takeLast_1.takeLast(1))(source);\n    };\n}\nexports.reduce = reduce;\n//# sourceMappingURL=reduce.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/reduce.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/scan.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operators/scan.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/* tslint:enable:max-line-length */\n/**\n * Applies an accumulator function over the source Observable, and returns each\n * intermediate result, with an optional seed value.\n *\n * <span class=\"informal\">It's like {@link reduce}, but emits the current\n * accumulation whenever the source emits a value.</span>\n *\n * <img src=\"./img/scan.png\" width=\"100%\">\n *\n * Combines together all values emitted on the source, using an accumulator\n * function that knows how to join a new source value into the accumulation from\n * the past. Is similar to {@link reduce}, but emits the intermediate\n * accumulations.\n *\n * Returns an Observable that applies a specified `accumulator` function to each\n * item emitted by the source Observable. If a `seed` value is specified, then\n * that value will be used as the initial value for the accumulator. If no seed\n * value is specified, the first item of the source is used as the seed.\n *\n * @example <caption>Count the number of click events</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var ones = clicks.mapTo(1);\n * var seed = 0;\n * var count = ones.scan((acc, one) => acc + one, seed);\n * count.subscribe(x => console.log(x));\n *\n * @see {@link expand}\n * @see {@link mergeScan}\n * @see {@link reduce}\n *\n * @param {function(acc: R, value: T, index: number): R} accumulator\n * The accumulator function called on each source value.\n * @param {T|R} [seed] The initial accumulation value.\n * @return {Observable<R>} An observable of the accumulated values.\n * @method scan\n * @owner Observable\n */\nfunction scan(accumulator, seed) {\n    var hasSeed = false;\n    // providing a seed of `undefined` *should* be valid and trigger\n    // hasSeed! so don't use `seed !== undefined` checks!\n    // For this reason, we have to check it here at the original call site\n    // otherwise inside Operator/Subscriber we won't know if `undefined`\n    // means they didn't provide anything or if they literally provided `undefined`\n    if (arguments.length >= 2) {\n        hasSeed = true;\n    }\n    return function scanOperatorFunction(source) {\n        return source.lift(new ScanOperator(accumulator, seed, hasSeed));\n    };\n}\nexports.scan = scan;\nvar ScanOperator = (function () {\n    function ScanOperator(accumulator, seed, hasSeed) {\n        if (hasSeed === void 0) { hasSeed = false; }\n        this.accumulator = accumulator;\n        this.seed = seed;\n        this.hasSeed = hasSeed;\n    }\n    ScanOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));\n    };\n    return ScanOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar ScanSubscriber = (function (_super) {\n    __extends(ScanSubscriber, _super);\n    function ScanSubscriber(destination, accumulator, _seed, hasSeed) {\n        _super.call(this, destination);\n        this.accumulator = accumulator;\n        this._seed = _seed;\n        this.hasSeed = hasSeed;\n        this.index = 0;\n    }\n    Object.defineProperty(ScanSubscriber.prototype, \"seed\", {\n        get: function () {\n            return this._seed;\n        },\n        set: function (value) {\n            this.hasSeed = true;\n            this._seed = value;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    ScanSubscriber.prototype._next = function (value) {\n        if (!this.hasSeed) {\n            this.seed = value;\n            this.destination.next(value);\n        }\n        else {\n            return this._tryNext(value);\n        }\n    };\n    ScanSubscriber.prototype._tryNext = function (value) {\n        var index = this.index++;\n        var result;\n        try {\n            result = this.accumulator(this.seed, value, index);\n        }\n        catch (err) {\n            this.destination.error(err);\n        }\n        this.seed = result;\n        this.destination.next(result);\n    };\n    return ScanSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=scan.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/scan.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/skip.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operators/skip.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/**\n * Returns an Observable that skips the first `count` items emitted by the source Observable.\n *\n * <img src=\"./img/skip.png\" width=\"100%\">\n *\n * @param {Number} count - The number of times, items emitted by source Observable should be skipped.\n * @return {Observable} An Observable that skips values emitted by the source Observable.\n *\n * @method skip\n * @owner Observable\n */\nfunction skip(count) {\n    return function (source) { return source.lift(new SkipOperator(count)); };\n}\nexports.skip = skip;\nvar SkipOperator = (function () {\n    function SkipOperator(total) {\n        this.total = total;\n    }\n    SkipOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new SkipSubscriber(subscriber, this.total));\n    };\n    return SkipOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SkipSubscriber = (function (_super) {\n    __extends(SkipSubscriber, _super);\n    function SkipSubscriber(destination, total) {\n        _super.call(this, destination);\n        this.total = total;\n        this.count = 0;\n    }\n    SkipSubscriber.prototype._next = function (x) {\n        if (++this.count > this.total) {\n            this.destination.next(x);\n        }\n    };\n    return SkipSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=skip.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/skip.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/startWith.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/operators/startWith.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ \"./node_modules/rxjs/observable/ArrayObservable.js\");\nvar ScalarObservable_1 = __webpack_require__(/*! ../observable/ScalarObservable */ \"./node_modules/rxjs/observable/ScalarObservable.js\");\nvar EmptyObservable_1 = __webpack_require__(/*! ../observable/EmptyObservable */ \"./node_modules/rxjs/observable/EmptyObservable.js\");\nvar concat_1 = __webpack_require__(/*! ../observable/concat */ \"./node_modules/rxjs/observable/concat.js\");\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ \"./node_modules/rxjs/util/isScheduler.js\");\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits the items you specify as arguments before it begins to emit\n * items emitted by the source Observable.\n *\n * <img src=\"./img/startWith.png\" width=\"100%\">\n *\n * @param {...T} values - Items you want the modified Observable to emit first.\n * @param {Scheduler} [scheduler] - A {@link IScheduler} to use for scheduling\n * the emissions of the `next` notifications.\n * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items\n * emitted by the source Observable.\n * @method startWith\n * @owner Observable\n */\nfunction startWith() {\n    var array = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        array[_i - 0] = arguments[_i];\n    }\n    return function (source) {\n        var scheduler = array[array.length - 1];\n        if (isScheduler_1.isScheduler(scheduler)) {\n            array.pop();\n        }\n        else {\n            scheduler = null;\n        }\n        var len = array.length;\n        if (len === 1) {\n            return concat_1.concat(new ScalarObservable_1.ScalarObservable(array[0], scheduler), source);\n        }\n        else if (len > 1) {\n            return concat_1.concat(new ArrayObservable_1.ArrayObservable(array, scheduler), source);\n        }\n        else {\n            return concat_1.concat(new EmptyObservable_1.EmptyObservable(scheduler), source);\n        }\n    };\n}\nexports.startWith = startWith;\n//# sourceMappingURL=startWith.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/startWith.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/take.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operators/take.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar ArgumentOutOfRangeError_1 = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ \"./node_modules/rxjs/util/ArgumentOutOfRangeError.js\");\nvar EmptyObservable_1 = __webpack_require__(/*! ../observable/EmptyObservable */ \"./node_modules/rxjs/observable/EmptyObservable.js\");\n/**\n * Emits only the first `count` values emitted by the source Observable.\n *\n * <span class=\"informal\">Takes the first `count` values from the source, then\n * completes.</span>\n *\n * <img src=\"./img/take.png\" width=\"100%\">\n *\n * `take` returns an Observable that emits only the first `count` values emitted\n * by the source Observable. If the source emits fewer than `count` values then\n * all of its values are emitted. After that, it completes, regardless if the\n * source completes.\n *\n * @example <caption>Take the first 5 seconds of an infinite 1-second interval Observable</caption>\n * var interval = Rx.Observable.interval(1000);\n * var five = interval.take(5);\n * five.subscribe(x => console.log(x));\n *\n * @see {@link takeLast}\n * @see {@link takeUntil}\n * @see {@link takeWhile}\n * @see {@link skip}\n *\n * @throws {ArgumentOutOfRangeError} When using `take(i)`, it delivers an\n * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.\n *\n * @param {number} count The maximum number of `next` values to emit.\n * @return {Observable<T>} An Observable that emits only the first `count`\n * values emitted by the source Observable, or all of the values from the source\n * if the source emits fewer than `count` values.\n * @method take\n * @owner Observable\n */\nfunction take(count) {\n    return function (source) {\n        if (count === 0) {\n            return new EmptyObservable_1.EmptyObservable();\n        }\n        else {\n            return source.lift(new TakeOperator(count));\n        }\n    };\n}\nexports.take = take;\nvar TakeOperator = (function () {\n    function TakeOperator(total) {\n        this.total = total;\n        if (this.total < 0) {\n            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;\n        }\n    }\n    TakeOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new TakeSubscriber(subscriber, this.total));\n    };\n    return TakeOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar TakeSubscriber = (function (_super) {\n    __extends(TakeSubscriber, _super);\n    function TakeSubscriber(destination, total) {\n        _super.call(this, destination);\n        this.total = total;\n        this.count = 0;\n    }\n    TakeSubscriber.prototype._next = function (value) {\n        var total = this.total;\n        var count = ++this.count;\n        if (count <= total) {\n            this.destination.next(value);\n            if (count === total) {\n                this.destination.complete();\n                this.unsubscribe();\n            }\n        }\n    };\n    return TakeSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=take.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/take.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/takeLast.js":
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operators/takeLast.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar ArgumentOutOfRangeError_1 = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ \"./node_modules/rxjs/util/ArgumentOutOfRangeError.js\");\nvar EmptyObservable_1 = __webpack_require__(/*! ../observable/EmptyObservable */ \"./node_modules/rxjs/observable/EmptyObservable.js\");\n/**\n * Emits only the last `count` values emitted by the source Observable.\n *\n * <span class=\"informal\">Remembers the latest `count` values, then emits those\n * only when the source completes.</span>\n *\n * <img src=\"./img/takeLast.png\" width=\"100%\">\n *\n * `takeLast` returns an Observable that emits at most the last `count` values\n * emitted by the source Observable. If the source emits fewer than `count`\n * values then all of its values are emitted. This operator must wait until the\n * `complete` notification emission from the source in order to emit the `next`\n * values on the output Observable, because otherwise it is impossible to know\n * whether or not more values will be emitted on the source. For this reason,\n * all values are emitted synchronously, followed by the complete notification.\n *\n * @example <caption>Take the last 3 values of an Observable with many values</caption>\n * var many = Rx.Observable.range(1, 100);\n * var lastThree = many.takeLast(3);\n * lastThree.subscribe(x => console.log(x));\n *\n * @see {@link take}\n * @see {@link takeUntil}\n * @see {@link takeWhile}\n * @see {@link skip}\n *\n * @throws {ArgumentOutOfRangeError} When using `takeLast(i)`, it delivers an\n * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.\n *\n * @param {number} count The maximum number of values to emit from the end of\n * the sequence of values emitted by the source Observable.\n * @return {Observable<T>} An Observable that emits at most the last count\n * values emitted by the source Observable.\n * @method takeLast\n * @owner Observable\n */\nfunction takeLast(count) {\n    return function takeLastOperatorFunction(source) {\n        if (count === 0) {\n            return new EmptyObservable_1.EmptyObservable();\n        }\n        else {\n            return source.lift(new TakeLastOperator(count));\n        }\n    };\n}\nexports.takeLast = takeLast;\nvar TakeLastOperator = (function () {\n    function TakeLastOperator(total) {\n        this.total = total;\n        if (this.total < 0) {\n            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;\n        }\n    }\n    TakeLastOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new TakeLastSubscriber(subscriber, this.total));\n    };\n    return TakeLastOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar TakeLastSubscriber = (function (_super) {\n    __extends(TakeLastSubscriber, _super);\n    function TakeLastSubscriber(destination, total) {\n        _super.call(this, destination);\n        this.total = total;\n        this.ring = new Array();\n        this.count = 0;\n    }\n    TakeLastSubscriber.prototype._next = function (value) {\n        var ring = this.ring;\n        var total = this.total;\n        var count = this.count++;\n        if (ring.length < total) {\n            ring.push(value);\n        }\n        else {\n            var index = count % total;\n            ring[index] = value;\n        }\n    };\n    TakeLastSubscriber.prototype._complete = function () {\n        var destination = this.destination;\n        var count = this.count;\n        if (count > 0) {\n            var total = this.count >= this.total ? this.total : this.count;\n            var ring = this.ring;\n            for (var i = 0; i < total; i++) {\n                var idx = (count++) % total;\n                destination.next(ring[idx]);\n            }\n        }\n        destination.complete();\n    };\n    return TakeLastSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=takeLast.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/takeLast.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/takeUntil.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/operators/takeUntil.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ \"./node_modules/rxjs/OuterSubscriber.js\");\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ \"./node_modules/rxjs/util/subscribeToResult.js\");\n/**\n * Emits the values emitted by the source Observable until a `notifier`\n * Observable emits a value.\n *\n * <span class=\"informal\">Lets values pass until a second Observable,\n * `notifier`, emits something. Then, it completes.</span>\n *\n * <img src=\"./img/takeUntil.png\" width=\"100%\">\n *\n * `takeUntil` subscribes and begins mirroring the source Observable. It also\n * monitors a second Observable, `notifier` that you provide. If the `notifier`\n * emits a value or a complete notification, the output Observable stops\n * mirroring the source Observable and completes.\n *\n * @example <caption>Tick every second until the first click happens</caption>\n * var interval = Rx.Observable.interval(1000);\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = interval.takeUntil(clicks);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link take}\n * @see {@link takeLast}\n * @see {@link takeWhile}\n * @see {@link skip}\n *\n * @param {Observable} notifier The Observable whose first emitted value will\n * cause the output Observable of `takeUntil` to stop emitting values from the\n * source Observable.\n * @return {Observable<T>} An Observable that emits the values from the source\n * Observable until such time as `notifier` emits its first value.\n * @method takeUntil\n * @owner Observable\n */\nfunction takeUntil(notifier) {\n    return function (source) { return source.lift(new TakeUntilOperator(notifier)); };\n}\nexports.takeUntil = takeUntil;\nvar TakeUntilOperator = (function () {\n    function TakeUntilOperator(notifier) {\n        this.notifier = notifier;\n    }\n    TakeUntilOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new TakeUntilSubscriber(subscriber, this.notifier));\n    };\n    return TakeUntilOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar TakeUntilSubscriber = (function (_super) {\n    __extends(TakeUntilSubscriber, _super);\n    function TakeUntilSubscriber(destination, notifier) {\n        _super.call(this, destination);\n        this.notifier = notifier;\n        this.add(subscribeToResult_1.subscribeToResult(this, notifier));\n    }\n    TakeUntilSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        this.complete();\n    };\n    TakeUntilSubscriber.prototype.notifyComplete = function () {\n        // noop\n    };\n    return TakeUntilSubscriber;\n}(OuterSubscriber_1.OuterSubscriber));\n//# sourceMappingURL=takeUntil.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/takeUntil.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/tap.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/operators/tap.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\n/* tslint:enable:max-line-length */\n/**\n * Perform a side effect for every emission on the source Observable, but return\n * an Observable that is identical to the source.\n *\n * <span class=\"informal\">Intercepts each emission on the source and runs a\n * function, but returns an output which is identical to the source as long as errors don't occur.</span>\n *\n * <img src=\"./img/do.png\" width=\"100%\">\n *\n * Returns a mirrored Observable of the source Observable, but modified so that\n * the provided Observer is called to perform a side effect for every value,\n * error, and completion emitted by the source. Any errors that are thrown in\n * the aforementioned Observer or handlers are safely sent down the error path\n * of the output Observable.\n *\n * This operator is useful for debugging your Observables for the correct values\n * or performing other side effects.\n *\n * Note: this is different to a `subscribe` on the Observable. If the Observable\n * returned by `do` is not subscribed, the side effects specified by the\n * Observer will never happen. `do` therefore simply spies on existing\n * execution, it does not trigger an execution to happen like `subscribe` does.\n *\n * @example <caption>Map every click to the clientX position of that click, while also logging the click event</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks\n *   .do(ev => console.log(ev))\n *   .map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link map}\n * @see {@link subscribe}\n *\n * @param {Observer|function} [nextOrObserver] A normal Observer object or a\n * callback for `next`.\n * @param {function} [error] Callback for errors in the source.\n * @param {function} [complete] Callback for the completion of the source.\n * @return {Observable} An Observable identical to the source, but runs the\n * specified Observer or callback(s) for each item.\n * @name tap\n */\nfunction tap(nextOrObserver, error, complete) {\n    return function tapOperatorFunction(source) {\n        return source.lift(new DoOperator(nextOrObserver, error, complete));\n    };\n}\nexports.tap = tap;\nvar DoOperator = (function () {\n    function DoOperator(nextOrObserver, error, complete) {\n        this.nextOrObserver = nextOrObserver;\n        this.error = error;\n        this.complete = complete;\n    }\n    DoOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));\n    };\n    return DoOperator;\n}());\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DoSubscriber = (function (_super) {\n    __extends(DoSubscriber, _super);\n    function DoSubscriber(destination, nextOrObserver, error, complete) {\n        _super.call(this, destination);\n        var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error, complete);\n        safeSubscriber.syncErrorThrowable = true;\n        this.add(safeSubscriber);\n        this.safeSubscriber = safeSubscriber;\n    }\n    DoSubscriber.prototype._next = function (value) {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.next(value);\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        }\n        else {\n            this.destination.next(value);\n        }\n    };\n    DoSubscriber.prototype._error = function (err) {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.error(err);\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        }\n        else {\n            this.destination.error(err);\n        }\n    };\n    DoSubscriber.prototype._complete = function () {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.complete();\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        }\n        else {\n            this.destination.complete();\n        }\n    };\n    return DoSubscriber;\n}(Subscriber_1.Subscriber));\n//# sourceMappingURL=tap.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/tap.js?");

/***/ }),

/***/ "./node_modules/rxjs/operators/toArray.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/operators/toArray.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar reduce_1 = __webpack_require__(/*! ./reduce */ \"./node_modules/rxjs/operators/reduce.js\");\nfunction toArrayReducer(arr, item, index) {\n    if (index === 0) {\n        return [item];\n    }\n    arr.push(item);\n    return arr;\n}\nfunction toArray() {\n    return reduce_1.reduce(toArrayReducer, []);\n}\nexports.toArray = toArray;\n//# sourceMappingURL=toArray.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/operators/toArray.js?");

/***/ }),

/***/ "./node_modules/rxjs/scheduler/Action.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/scheduler/Action.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscription_1 = __webpack_require__(/*! ../Subscription */ \"./node_modules/rxjs/Subscription.js\");\n/**\n * A unit of work to be executed in a {@link Scheduler}. An action is typically\n * created from within a Scheduler and an RxJS user does not need to concern\n * themselves about creating and manipulating an Action.\n *\n * ```ts\n * class Action<T> extends Subscription {\n *   new (scheduler: Scheduler, work: (state?: T) => void);\n *   schedule(state?: T, delay: number = 0): Subscription;\n * }\n * ```\n *\n * @class Action<T>\n */\nvar Action = (function (_super) {\n    __extends(Action, _super);\n    function Action(scheduler, work) {\n        _super.call(this);\n    }\n    /**\n     * Schedules this action on its parent Scheduler for execution. May be passed\n     * some context object, `state`. May happen at some point in the future,\n     * according to the `delay` parameter, if specified.\n     * @param {T} [state] Some contextual data that the `work` function uses when\n     * called by the Scheduler.\n     * @param {number} [delay] Time to wait before executing the work, where the\n     * time unit is implicit and defined by the Scheduler.\n     * @return {void}\n     */\n    Action.prototype.schedule = function (state, delay) {\n        if (delay === void 0) { delay = 0; }\n        return this;\n    };\n    return Action;\n}(Subscription_1.Subscription));\nexports.Action = Action;\n//# sourceMappingURL=Action.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/Action.js?");

/***/ }),

/***/ "./node_modules/rxjs/scheduler/AsyncAction.js":
/*!****************************************************!*\
  !*** ./node_modules/rxjs/scheduler/AsyncAction.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nvar Action_1 = __webpack_require__(/*! ./Action */ \"./node_modules/rxjs/scheduler/Action.js\");\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar AsyncAction = (function (_super) {\n    __extends(AsyncAction, _super);\n    function AsyncAction(scheduler, work) {\n        _super.call(this, scheduler, work);\n        this.scheduler = scheduler;\n        this.pending = false;\n        this.work = work;\n    }\n    AsyncAction.prototype.schedule = function (state, delay) {\n        if (delay === void 0) { delay = 0; }\n        if (this.closed) {\n            return this;\n        }\n        // Always replace the current state with the new state.\n        this.state = state;\n        // Set the pending flag indicating that this action has been scheduled, or\n        // has recursively rescheduled itself.\n        this.pending = true;\n        var id = this.id;\n        var scheduler = this.scheduler;\n        //\n        // Important implementation note:\n        //\n        // Actions only execute once by default, unless rescheduled from within the\n        // scheduled callback. This allows us to implement single and repeat\n        // actions via the same code path, without adding API surface area, as well\n        // as mimic traditional recursion but across asynchronous boundaries.\n        //\n        // However, JS runtimes and timers distinguish between intervals achieved by\n        // serial `setTimeout` calls vs. a single `setInterval` call. An interval of\n        // serial `setTimeout` calls can be individually delayed, which delays\n        // scheduling the next `setTimeout`, and so on. `setInterval` attempts to\n        // guarantee the interval callback will be invoked more precisely to the\n        // interval period, regardless of load.\n        //\n        // Therefore, we use `setInterval` to schedule single and repeat actions.\n        // If the action reschedules itself with the same delay, the interval is not\n        // canceled. If the action doesn't reschedule, or reschedules with a\n        // different delay, the interval will be canceled after scheduled callback\n        // execution.\n        //\n        if (id != null) {\n            this.id = this.recycleAsyncId(scheduler, id, delay);\n        }\n        this.delay = delay;\n        // If this action has already an async Id, don't request a new one.\n        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);\n        return this;\n    };\n    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {\n        if (delay === void 0) { delay = 0; }\n        return root_1.root.setInterval(scheduler.flush.bind(scheduler, this), delay);\n    };\n    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {\n        if (delay === void 0) { delay = 0; }\n        // If this action is rescheduled with the same delay time, don't clear the interval id.\n        if (delay !== null && this.delay === delay && this.pending === false) {\n            return id;\n        }\n        // Otherwise, if the action's delay time is different from the current delay,\n        // or the action has been rescheduled before it's executed, clear the interval id\n        return root_1.root.clearInterval(id) && undefined || undefined;\n    };\n    /**\n     * Immediately executes this action and the `work` it contains.\n     * @return {any}\n     */\n    AsyncAction.prototype.execute = function (state, delay) {\n        if (this.closed) {\n            return new Error('executing a cancelled action');\n        }\n        this.pending = false;\n        var error = this._execute(state, delay);\n        if (error) {\n            return error;\n        }\n        else if (this.pending === false && this.id != null) {\n            // Dequeue if the action didn't reschedule itself. Don't call\n            // unsubscribe(), because the action could reschedule later.\n            // For example:\n            // ```\n            // scheduler.schedule(function doWork(counter) {\n            //   /* ... I'm a busy worker bee ... */\n            //   var originalAction = this;\n            //   /* wait 100ms before rescheduling the action */\n            //   setTimeout(function () {\n            //     originalAction.schedule(counter + 1);\n            //   }, 100);\n            // }, 1000);\n            // ```\n            this.id = this.recycleAsyncId(this.scheduler, this.id, null);\n        }\n    };\n    AsyncAction.prototype._execute = function (state, delay) {\n        var errored = false;\n        var errorValue = undefined;\n        try {\n            this.work(state);\n        }\n        catch (e) {\n            errored = true;\n            errorValue = !!e && e || new Error(e);\n        }\n        if (errored) {\n            this.unsubscribe();\n            return errorValue;\n        }\n    };\n    /** @deprecated internal use only */ AsyncAction.prototype._unsubscribe = function () {\n        var id = this.id;\n        var scheduler = this.scheduler;\n        var actions = scheduler.actions;\n        var index = actions.indexOf(this);\n        this.work = null;\n        this.state = null;\n        this.pending = false;\n        this.scheduler = null;\n        if (index !== -1) {\n            actions.splice(index, 1);\n        }\n        if (id != null) {\n            this.id = this.recycleAsyncId(scheduler, id, null);\n        }\n        this.delay = null;\n    };\n    return AsyncAction;\n}(Action_1.Action));\nexports.AsyncAction = AsyncAction;\n//# sourceMappingURL=AsyncAction.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/AsyncAction.js?");

/***/ }),

/***/ "./node_modules/rxjs/scheduler/AsyncScheduler.js":
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/scheduler/AsyncScheduler.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Scheduler_1 = __webpack_require__(/*! ../Scheduler */ \"./node_modules/rxjs/Scheduler.js\");\nvar AsyncScheduler = (function (_super) {\n    __extends(AsyncScheduler, _super);\n    function AsyncScheduler() {\n        _super.apply(this, arguments);\n        this.actions = [];\n        /**\n         * A flag to indicate whether the Scheduler is currently executing a batch of\n         * queued actions.\n         * @type {boolean}\n         */\n        this.active = false;\n        /**\n         * An internal ID used to track the latest asynchronous task such as those\n         * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and\n         * others.\n         * @type {any}\n         */\n        this.scheduled = undefined;\n    }\n    AsyncScheduler.prototype.flush = function (action) {\n        var actions = this.actions;\n        if (this.active) {\n            actions.push(action);\n            return;\n        }\n        var error;\n        this.active = true;\n        do {\n            if (error = action.execute(action.state, action.delay)) {\n                break;\n            }\n        } while (action = actions.shift()); // exhaust the scheduler queue\n        this.active = false;\n        if (error) {\n            while (action = actions.shift()) {\n                action.unsubscribe();\n            }\n            throw error;\n        }\n    };\n    return AsyncScheduler;\n}(Scheduler_1.Scheduler));\nexports.AsyncScheduler = AsyncScheduler;\n//# sourceMappingURL=AsyncScheduler.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/AsyncScheduler.js?");

/***/ }),

/***/ "./node_modules/rxjs/scheduler/async.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/scheduler/async.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar AsyncAction_1 = __webpack_require__(/*! ./AsyncAction */ \"./node_modules/rxjs/scheduler/AsyncAction.js\");\nvar AsyncScheduler_1 = __webpack_require__(/*! ./AsyncScheduler */ \"./node_modules/rxjs/scheduler/AsyncScheduler.js\");\n/**\n *\n * Async Scheduler\n *\n * <span class=\"informal\">Schedule task as if you used setTimeout(task, duration)</span>\n *\n * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript\n * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating\n * in intervals.\n *\n * If you just want to \"defer\" task, that is to perform it right after currently\n * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),\n * better choice will be the {@link asap} scheduler.\n *\n * @example <caption>Use async scheduler to delay task</caption>\n * const task = () => console.log('it works!');\n *\n * Rx.Scheduler.async.schedule(task, 2000);\n *\n * // After 2 seconds logs:\n * // \"it works!\"\n *\n *\n * @example <caption>Use async scheduler to repeat task in intervals</caption>\n * function task(state) {\n *   console.log(state);\n *   this.schedule(state + 1, 1000); // `this` references currently executing Action,\n *                                   // which we reschedule with new state and delay\n * }\n *\n * Rx.Scheduler.async.schedule(task, 3000, 0);\n *\n * // Logs:\n * // 0 after 3s\n * // 1 after 4s\n * // 2 after 5s\n * // 3 after 6s\n *\n * @static true\n * @name async\n * @owner Scheduler\n */\nexports.async = new AsyncScheduler_1.AsyncScheduler(AsyncAction_1.AsyncAction);\n//# sourceMappingURL=async.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/async.js?");

/***/ }),

/***/ "./node_modules/rxjs/symbol/iterator.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/symbol/iterator.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nfunction symbolIteratorPonyfill(root) {\n    var Symbol = root.Symbol;\n    if (typeof Symbol === 'function') {\n        if (!Symbol.iterator) {\n            Symbol.iterator = Symbol('iterator polyfill');\n        }\n        return Symbol.iterator;\n    }\n    else {\n        // [for Mozilla Gecko 27-35:](https://mzl.la/2ewE1zC)\n        var Set_1 = root.Set;\n        if (Set_1 && typeof new Set_1()['@@iterator'] === 'function') {\n            return '@@iterator';\n        }\n        var Map_1 = root.Map;\n        // required for compatability with es6-shim\n        if (Map_1) {\n            var keys = Object.getOwnPropertyNames(Map_1.prototype);\n            for (var i = 0; i < keys.length; ++i) {\n                var key = keys[i];\n                // according to spec, Map.prototype[@@iterator] and Map.orototype.entries must be equal.\n                if (key !== 'entries' && key !== 'size' && Map_1.prototype[key] === Map_1.prototype['entries']) {\n                    return key;\n                }\n            }\n        }\n        return '@@iterator';\n    }\n}\nexports.symbolIteratorPonyfill = symbolIteratorPonyfill;\nexports.iterator = symbolIteratorPonyfill(root_1.root);\n/**\n * @deprecated use iterator instead\n */\nexports.$$iterator = exports.iterator;\n//# sourceMappingURL=iterator.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/iterator.js?");

/***/ }),

/***/ "./node_modules/rxjs/symbol/observable.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/symbol/observable.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nfunction getSymbolObservable(context) {\n    var $$observable;\n    var Symbol = context.Symbol;\n    if (typeof Symbol === 'function') {\n        if (Symbol.observable) {\n            $$observable = Symbol.observable;\n        }\n        else {\n            $$observable = Symbol('observable');\n            Symbol.observable = $$observable;\n        }\n    }\n    else {\n        $$observable = '@@observable';\n    }\n    return $$observable;\n}\nexports.getSymbolObservable = getSymbolObservable;\nexports.observable = getSymbolObservable(root_1.root);\n/**\n * @deprecated use observable instead\n */\nexports.$$observable = exports.observable;\n//# sourceMappingURL=observable.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/observable.js?");

/***/ }),

/***/ "./node_modules/rxjs/symbol/rxSubscriber.js":
/*!**************************************************!*\
  !*** ./node_modules/rxjs/symbol/rxSubscriber.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar root_1 = __webpack_require__(/*! ../util/root */ \"./node_modules/rxjs/util/root.js\");\nvar Symbol = root_1.root.Symbol;\nexports.rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?\n    Symbol.for('rxSubscriber') : '@@rxSubscriber';\n/**\n * @deprecated use rxSubscriber instead\n */\nexports.$$rxSubscriber = exports.rxSubscriber;\n//# sourceMappingURL=rxSubscriber.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/rxSubscriber.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/ArgumentOutOfRangeError.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/util/ArgumentOutOfRangeError.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when an element was queried at a certain index of an\n * Observable, but no such index or position exists in that sequence.\n *\n * @see {@link elementAt}\n * @see {@link take}\n * @see {@link takeLast}\n *\n * @class ArgumentOutOfRangeError\n */\nvar ArgumentOutOfRangeError = (function (_super) {\n    __extends(ArgumentOutOfRangeError, _super);\n    function ArgumentOutOfRangeError() {\n        var err = _super.call(this, 'argument out of range');\n        this.name = err.name = 'ArgumentOutOfRangeError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return ArgumentOutOfRangeError;\n}(Error));\nexports.ArgumentOutOfRangeError = ArgumentOutOfRangeError;\n//# sourceMappingURL=ArgumentOutOfRangeError.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/ArgumentOutOfRangeError.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/EmptyError.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/util/EmptyError.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when an Observable or a sequence was queried but has no\n * elements.\n *\n * @see {@link first}\n * @see {@link last}\n * @see {@link single}\n *\n * @class EmptyError\n */\nvar EmptyError = (function (_super) {\n    __extends(EmptyError, _super);\n    function EmptyError() {\n        var err = _super.call(this, 'no elements in sequence');\n        this.name = err.name = 'EmptyError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return EmptyError;\n}(Error));\nexports.EmptyError = EmptyError;\n//# sourceMappingURL=EmptyError.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/EmptyError.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/ObjectUnsubscribedError.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/util/ObjectUnsubscribedError.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when an action is invalid because the object has been\n * unsubscribed.\n *\n * @see {@link Subject}\n * @see {@link BehaviorSubject}\n *\n * @class ObjectUnsubscribedError\n */\nvar ObjectUnsubscribedError = (function (_super) {\n    __extends(ObjectUnsubscribedError, _super);\n    function ObjectUnsubscribedError() {\n        var err = _super.call(this, 'object unsubscribed');\n        this.name = err.name = 'ObjectUnsubscribedError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return ObjectUnsubscribedError;\n}(Error));\nexports.ObjectUnsubscribedError = ObjectUnsubscribedError;\n//# sourceMappingURL=ObjectUnsubscribedError.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/ObjectUnsubscribedError.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/UnsubscriptionError.js":
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/util/UnsubscriptionError.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when one or more errors have occurred during the\n * `unsubscribe` of a {@link Subscription}.\n */\nvar UnsubscriptionError = (function (_super) {\n    __extends(UnsubscriptionError, _super);\n    function UnsubscriptionError(errors) {\n        _super.call(this);\n        this.errors = errors;\n        var err = Error.call(this, errors ?\n            errors.length + \" errors occurred during unsubscription:\\n  \" + errors.map(function (err, i) { return ((i + 1) + \") \" + err.toString()); }).join('\\n  ') : '');\n        this.name = err.name = 'UnsubscriptionError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return UnsubscriptionError;\n}(Error));\nexports.UnsubscriptionError = UnsubscriptionError;\n//# sourceMappingURL=UnsubscriptionError.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/UnsubscriptionError.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/errorObject.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/errorObject.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// typeof any so that it we don't have to cast when comparing a result to the error object\nexports.errorObject = { e: {} };\n//# sourceMappingURL=errorObject.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/errorObject.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/identity.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/util/identity.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction identity(x) {\n    return x;\n}\nexports.identity = identity;\n//# sourceMappingURL=identity.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/identity.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isArray.js":
/*!*******************************************!*\
  !*** ./node_modules/rxjs/util/isArray.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nexports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });\n//# sourceMappingURL=isArray.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isArray.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isArrayLike.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/isArrayLike.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nexports.isArrayLike = (function (x) { return x && typeof x.length === 'number'; });\n//# sourceMappingURL=isArrayLike.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isArrayLike.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isDate.js":
/*!******************************************!*\
  !*** ./node_modules/rxjs/util/isDate.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction isDate(value) {\n    return value instanceof Date && !isNaN(+value);\n}\nexports.isDate = isDate;\n//# sourceMappingURL=isDate.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isDate.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isFunction.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/util/isFunction.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction isFunction(x) {\n    return typeof x === 'function';\n}\nexports.isFunction = isFunction;\n//# sourceMappingURL=isFunction.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isFunction.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isNumeric.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/util/isNumeric.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ \"./node_modules/rxjs/util/isArray.js\");\nfunction isNumeric(val) {\n    // parseFloat NaNs numeric-cast false positives (null|true|false|\"\")\n    // ...but misinterprets leading-number strings, particularly hex literals (\"0x...\")\n    // subtraction forces infinities to NaN\n    // adding 1 corrects loss of precision from parseFloat (#15100)\n    return !isArray_1.isArray(val) && (val - parseFloat(val) + 1) >= 0;\n}\nexports.isNumeric = isNumeric;\n;\n//# sourceMappingURL=isNumeric.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isNumeric.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isObject.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/util/isObject.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction isObject(x) {\n    return x != null && typeof x === 'object';\n}\nexports.isObject = isObject;\n//# sourceMappingURL=isObject.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isObject.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isPromise.js":
/*!*********************************************!*\
  !*** ./node_modules/rxjs/util/isPromise.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction isPromise(value) {\n    return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';\n}\nexports.isPromise = isPromise;\n//# sourceMappingURL=isPromise.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isPromise.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/isScheduler.js":
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/isScheduler.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction isScheduler(value) {\n    return value && typeof value.schedule === 'function';\n}\nexports.isScheduler = isScheduler;\n//# sourceMappingURL=isScheduler.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isScheduler.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/noop.js":
/*!****************************************!*\
  !*** ./node_modules/rxjs/util/noop.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/* tslint:disable:no-empty */\nfunction noop() { }\nexports.noop = noop;\n//# sourceMappingURL=noop.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/noop.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/pipe.js":
/*!****************************************!*\
  !*** ./node_modules/rxjs/util/pipe.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar noop_1 = __webpack_require__(/*! ./noop */ \"./node_modules/rxjs/util/noop.js\");\n/* tslint:enable:max-line-length */\nfunction pipe() {\n    var fns = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        fns[_i - 0] = arguments[_i];\n    }\n    return pipeFromArray(fns);\n}\nexports.pipe = pipe;\n/* @internal */\nfunction pipeFromArray(fns) {\n    if (!fns) {\n        return noop_1.noop;\n    }\n    if (fns.length === 1) {\n        return fns[0];\n    }\n    return function piped(input) {\n        return fns.reduce(function (prev, fn) { return fn(prev); }, input);\n    };\n}\nexports.pipeFromArray = pipeFromArray;\n//# sourceMappingURL=pipe.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/pipe.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/root.js":
/*!****************************************!*\
  !*** ./node_modules/rxjs/util/root.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(global) {\n// CommonJS / Node have global context exposed as \"global\" variable.\n// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake\n// the global \"global\" var for now.\nvar __window = typeof window !== 'undefined' && window;\nvar __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&\n    self instanceof WorkerGlobalScope && self;\nvar __global = typeof global !== 'undefined' && global;\nvar _root = __window || __global || __self;\nexports.root = _root;\n// Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.\n// This is needed when used with angular/tsickle which inserts a goog.module statement.\n// Wrap in IIFE\n(function () {\n    if (!_root) {\n        throw new Error('RxJS could not find any global context (window, self, global)');\n    }\n})();\n//# sourceMappingURL=root.js.map\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/root.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/subscribeToResult.js":
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/util/subscribeToResult.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar root_1 = __webpack_require__(/*! ./root */ \"./node_modules/rxjs/util/root.js\");\nvar isArrayLike_1 = __webpack_require__(/*! ./isArrayLike */ \"./node_modules/rxjs/util/isArrayLike.js\");\nvar isPromise_1 = __webpack_require__(/*! ./isPromise */ \"./node_modules/rxjs/util/isPromise.js\");\nvar isObject_1 = __webpack_require__(/*! ./isObject */ \"./node_modules/rxjs/util/isObject.js\");\nvar Observable_1 = __webpack_require__(/*! ../Observable */ \"./node_modules/rxjs/Observable.js\");\nvar iterator_1 = __webpack_require__(/*! ../symbol/iterator */ \"./node_modules/rxjs/symbol/iterator.js\");\nvar InnerSubscriber_1 = __webpack_require__(/*! ../InnerSubscriber */ \"./node_modules/rxjs/InnerSubscriber.js\");\nvar observable_1 = __webpack_require__(/*! ../symbol/observable */ \"./node_modules/rxjs/symbol/observable.js\");\nfunction subscribeToResult(outerSubscriber, result, outerValue, outerIndex) {\n    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);\n    if (destination.closed) {\n        return null;\n    }\n    if (result instanceof Observable_1.Observable) {\n        if (result._isScalar) {\n            destination.next(result.value);\n            destination.complete();\n            return null;\n        }\n        else {\n            destination.syncErrorThrowable = true;\n            return result.subscribe(destination);\n        }\n    }\n    else if (isArrayLike_1.isArrayLike(result)) {\n        for (var i = 0, len = result.length; i < len && !destination.closed; i++) {\n            destination.next(result[i]);\n        }\n        if (!destination.closed) {\n            destination.complete();\n        }\n    }\n    else if (isPromise_1.isPromise(result)) {\n        result.then(function (value) {\n            if (!destination.closed) {\n                destination.next(value);\n                destination.complete();\n            }\n        }, function (err) { return destination.error(err); })\n            .then(null, function (err) {\n            // Escaping the Promise trap: globally throw unhandled errors\n            root_1.root.setTimeout(function () { throw err; });\n        });\n        return destination;\n    }\n    else if (result && typeof result[iterator_1.iterator] === 'function') {\n        var iterator = result[iterator_1.iterator]();\n        do {\n            var item = iterator.next();\n            if (item.done) {\n                destination.complete();\n                break;\n            }\n            destination.next(item.value);\n            if (destination.closed) {\n                break;\n            }\n        } while (true);\n    }\n    else if (result && typeof result[observable_1.observable] === 'function') {\n        var obs = result[observable_1.observable]();\n        if (typeof obs.subscribe !== 'function') {\n            destination.error(new TypeError('Provided object does not correctly implement Symbol.observable'));\n        }\n        else {\n            return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));\n        }\n    }\n    else {\n        var value = isObject_1.isObject(result) ? 'an invalid object' : \"'\" + result + \"'\";\n        var msg = (\"You provided \" + value + \" where a stream was expected.\")\n            + ' You can provide an Observable, Promise, Array, or Iterable.';\n        destination.error(new TypeError(msg));\n    }\n    return null;\n}\nexports.subscribeToResult = subscribeToResult;\n//# sourceMappingURL=subscribeToResult.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/subscribeToResult.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/toSubscriber.js":
/*!************************************************!*\
  !*** ./node_modules/rxjs/util/toSubscriber.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ \"./node_modules/rxjs/Subscriber.js\");\nvar rxSubscriber_1 = __webpack_require__(/*! ../symbol/rxSubscriber */ \"./node_modules/rxjs/symbol/rxSubscriber.js\");\nvar Observer_1 = __webpack_require__(/*! ../Observer */ \"./node_modules/rxjs/Observer.js\");\nfunction toSubscriber(nextOrObserver, error, complete) {\n    if (nextOrObserver) {\n        if (nextOrObserver instanceof Subscriber_1.Subscriber) {\n            return nextOrObserver;\n        }\n        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {\n            return nextOrObserver[rxSubscriber_1.rxSubscriber]();\n        }\n    }\n    if (!nextOrObserver && !error && !complete) {\n        return new Subscriber_1.Subscriber(Observer_1.empty);\n    }\n    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);\n}\nexports.toSubscriber = toSubscriber;\n//# sourceMappingURL=toSubscriber.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/toSubscriber.js?");

/***/ }),

/***/ "./node_modules/rxjs/util/tryCatch.js":
/*!********************************************!*\
  !*** ./node_modules/rxjs/util/tryCatch.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar errorObject_1 = __webpack_require__(/*! ./errorObject */ \"./node_modules/rxjs/util/errorObject.js\");\nvar tryCatchTarget;\nfunction tryCatcher() {\n    try {\n        return tryCatchTarget.apply(this, arguments);\n    }\n    catch (e) {\n        errorObject_1.errorObject.e = e;\n        return errorObject_1.errorObject;\n    }\n}\nfunction tryCatch(fn) {\n    tryCatchTarget = fn;\n    return tryCatcher;\n}\nexports.tryCatch = tryCatch;\n;\n//# sourceMappingURL=tryCatch.js.map\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/tryCatch.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ }),

/***/ "./src/ui/jb-rx.js":
/*!*************************!*\
  !*** ./src/ui/jb-rx.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var rxjs_Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/Subject */ \"./node_modules/rxjs/Subject.js\");\n/* harmony import */ var rxjs_Subject__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs_Subject__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/Observable */ \"./node_modules/rxjs/Observable.js\");\n/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs_Observable__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var rxjs_observable_FromObservable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/observable/FromObservable */ \"./node_modules/rxjs/observable/FromObservable.js\");\n/* harmony import */ var rxjs_observable_FromObservable__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(rxjs_observable_FromObservable__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/operator/map */ \"./node_modules/rxjs/add/operator/map.js\");\n/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var rxjs_add_operator_filter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/operator/filter */ \"./node_modules/rxjs/add/operator/filter.js\");\n/* harmony import */ var rxjs_add_operator_filter__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_filter__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ \"./node_modules/rxjs/add/operator/catch.js\");\n/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/add/operator/do */ \"./node_modules/rxjs/add/operator/do.js\");\n/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var rxjs_add_operator_merge__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/add/operator/merge */ \"./node_modules/rxjs/add/operator/merge.js\");\n/* harmony import */ var rxjs_add_operator_merge__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_merge__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var rxjs_add_operator_concat__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/add/operator/concat */ \"./node_modules/rxjs/add/operator/concat.js\");\n/* harmony import */ var rxjs_add_operator_concat__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_concat__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var rxjs_add_operator_mergeMap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/add/operator/mergeMap */ \"./node_modules/rxjs/add/operator/mergeMap.js\");\n/* harmony import */ var rxjs_add_operator_mergeMap__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_mergeMap__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var rxjs_add_operator_concatMap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs/add/operator/concatMap */ \"./node_modules/rxjs/add/operator/concatMap.js\");\n/* harmony import */ var rxjs_add_operator_concatMap__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_concatMap__WEBPACK_IMPORTED_MODULE_10__);\n/* harmony import */ var rxjs_add_operator_startWith__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs/add/operator/startWith */ \"./node_modules/rxjs/add/operator/startWith.js\");\n/* harmony import */ var rxjs_add_operator_startWith__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_startWith__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var rxjs_add_operator_takeUntil__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs/add/operator/takeUntil */ \"./node_modules/rxjs/add/operator/takeUntil.js\");\n/* harmony import */ var rxjs_add_operator_takeUntil__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_takeUntil__WEBPACK_IMPORTED_MODULE_12__);\n/* harmony import */ var rxjs_add_observable_fromPromise__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs/add/observable/fromPromise */ \"./node_modules/rxjs/add/observable/fromPromise.js\");\n/* harmony import */ var rxjs_add_observable_fromPromise__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_fromPromise__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var rxjs_add_observable_fromEvent__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! rxjs/add/observable/fromEvent */ \"./node_modules/rxjs/add/observable/fromEvent.js\");\n/* harmony import */ var rxjs_add_observable_fromEvent__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_fromEvent__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! rxjs/add/observable/from */ \"./node_modules/rxjs/add/observable/from.js\");\n/* harmony import */ var rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! rxjs/add/observable/of */ \"./node_modules/rxjs/add/observable/of.js\");\n/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_16__);\n/* harmony import */ var rxjs_add_observable_interval__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! rxjs/add/observable/interval */ \"./node_modules/rxjs/add/observable/interval.js\");\n/* harmony import */ var rxjs_add_observable_interval__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_interval__WEBPACK_IMPORTED_MODULE_17__);\n/* harmony import */ var rxjs_add_operator_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! rxjs/add/operator/distinctUntilChanged */ \"./node_modules/rxjs/add/operator/distinctUntilChanged.js\");\n/* harmony import */ var rxjs_add_operator_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_18__);\n/* harmony import */ var rxjs_add_operator_debounceTime__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! rxjs/add/operator/debounceTime */ \"./node_modules/rxjs/add/operator/debounceTime.js\");\n/* harmony import */ var rxjs_add_operator_debounceTime__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_debounceTime__WEBPACK_IMPORTED_MODULE_19__);\n/* harmony import */ var rxjs_add_operator_buffer__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! rxjs/add/operator/buffer */ \"./node_modules/rxjs/add/operator/buffer.js\");\n/* harmony import */ var rxjs_add_operator_buffer__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_buffer__WEBPACK_IMPORTED_MODULE_20__);\n/* harmony import */ var rxjs_add_operator_skip__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! rxjs/add/operator/skip */ \"./node_modules/rxjs/add/operator/skip.js\");\n/* harmony import */ var rxjs_add_operator_skip__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_skip__WEBPACK_IMPORTED_MODULE_21__);\n/* harmony import */ var rxjs_add_operator_last__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! rxjs/add/operator/last */ \"./node_modules/rxjs/add/operator/last.js\");\n/* harmony import */ var rxjs_add_operator_last__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_last__WEBPACK_IMPORTED_MODULE_22__);\n/* harmony import */ var rxjs_add_operator_delay__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! rxjs/add/operator/delay */ \"./node_modules/rxjs/add/operator/delay.js\");\n/* harmony import */ var rxjs_add_operator_delay__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_delay__WEBPACK_IMPORTED_MODULE_23__);\n/* harmony import */ var rxjs_add_operator_take__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! rxjs/add/operator/take */ \"./node_modules/rxjs/add/operator/take.js\");\n/* harmony import */ var rxjs_add_operator_take__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_take__WEBPACK_IMPORTED_MODULE_24__);\n/* harmony import */ var rxjs_add_operator_toArray__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! rxjs/add/operator/toArray */ \"./node_modules/rxjs/add/operator/toArray.js\");\n/* harmony import */ var rxjs_add_operator_toArray__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_toArray__WEBPACK_IMPORTED_MODULE_25__);\n/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! rxjs/add/operator/toPromise */ \"./node_modules/rxjs/add/operator/toPromise.js\");\n/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_26__);\n/* harmony import */ var rxjs_add_operator_race__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! rxjs/add/operator/race */ \"./node_modules/rxjs/add/operator/race.js\");\n/* harmony import */ var rxjs_add_operator_race__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_race__WEBPACK_IMPORTED_MODULE_27__);\n/* harmony import */ var rxjs_add_operator_finally__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! rxjs/add/operator/finally */ \"./node_modules/rxjs/add/operator/finally.js\");\n/* harmony import */ var rxjs_add_operator_finally__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_finally__WEBPACK_IMPORTED_MODULE_28__);\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\njb.rx.Observable = rxjs_Observable__WEBPACK_IMPORTED_MODULE_1__[\"Observable\"];\r\njb.rx.Subject = rxjs_Subject__WEBPACK_IMPORTED_MODULE_0__[\"Subject\"];\r\n\n\n//# sourceURL=webpack:///./src/ui/jb-rx.js?");

/***/ })

/******/ });;

(function(){

var ui = jb.ui;

ui.ctrl = function(context,options) {
	var ctx = context.setVars({ $model: context.params });
	var styleOptions = defaultStyle(ctx) || {};
	if (styleOptions.jbExtend)  {// style by control
		styleOptions.ctxForPick = ctx;
		return styleOptions.jbExtend(options).applyFeatures(ctx);
	}
	return new JbComponent(ctx).jbExtend(options).jbExtend(styleOptions).applyFeatures(ctx);

	function defaultStyle(ctx) {
		var profile = context.profile;
		var defaultVar = '$theme.' + (profile.$ || '');
		if (!profile.style && context.vars[defaultVar])
			return ctx.run({$:context.vars[defaultVar]})
		return context.params.style ? context.params.style(ctx) : {};
	}
}

var cssId = 0;
var cssSelectors_hash = {};

class JbComponent {
	constructor(ctx) {
		this.ctx = ctx;
		Object.assign(this, {jbInitFuncs: [], jbBeforeInitFuncs: [], jbRegisterEventsFuncs:[], jbAfterViewInitFuncs: [],
			jbComponentDidUpdateFuncs: [], jbCheckFuncs: [],jbDestroyFuncs: [], extendCtxOnceFuncs: [], modifierFuncs: [], extendItemFuncs: [] });
		this.cssSelectors = [];

		this.jb_profile = ctx.profile;
		var title = jb.tosingle(jb.val(this.ctx.params.title)) || (() => '');
		this.jb_title = (typeof title == 'function') ? title : () => ''+title;
//		this.jb$title = (typeof title == 'function') ? title() : title; // for debug
	}

	reactComp() {
		jb.log('createReactClass',[this.ctx, this]);
		var jbComp = this;
		class ReactComp extends ui.Component {
			constructor(props) {
				super();
				this.jbComp = jbComp;
				this.ctx = this.originalCtx = jbComp.ctx; // this.ctx is re-calculated
				this.ctxForPick = jbComp.ctxForPick || jbComp.ctx;
				this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve);
				try {
					jbComp.extendCtxOnceFuncs.forEach(extendCtx =>
		    			this.ctx = extendCtx(this.ctx,this) || this.ctx);
					Object.assign(this,(jbComp.styleCtx || {}).params); // assign style params to cmp
					jbComp.jbBeforeInitFuncs.forEach(init=> init(this,props));
					jbComp.jbInitFuncs.forEach(init=> init(this,props));
			    } catch(e) { jb.logException(e,'createReactClass',this.ctx) }
			}
			render(props,state) {
				jb.log('render',[this.ctx, state,props,this]);
				if (!jbComp.template || typeof jbComp.template != 'function')
					return ui.h('span',{display: 'none'});
				//console.log('render',jb.studio.shortTitle(this.ctx.path));
				try {
					var vdom = jbComp.template(this,state,ui.h);
					jbComp.modifierFuncs.forEach(modifier=> {
						if (typeof vdom == 'object')
							vdom = modifier(vdom,this,state,ui.h) || vdom
					});
					jb.log('renRes',[this.ctx, vdom, state,props,this]);
					return vdom;
				} catch (e) {
					jb.logException(e,'render',ctx,props,state);
					return ui.h('span',{display: 'none'});
				}
			}
    	componentDidMount() {
				jbComp.injectCss(this);
				jbComp.jbRegisterEventsFuncs.forEach(init=> {
					try { init(this) } catch(e) { jb.logException(e,'init',jbComp.ctx) }});
				jbComp.jbAfterViewInitFuncs.forEach(init=> {
					try { init(this) } catch(e) { jb.logException(e,'AfterViewInit',jbComp.ctx); }});
			}
			componentDidUpdate() {
				jbComp.jbComponentDidUpdateFuncs.forEach(f=> {
					try { f(this) } catch(e) { jb.logException(e,'componentDidUpdate',jbComp.ctx); }});
			}
	  	componentWillUnmount() {
				jbComp.jbDestroyFuncs.forEach(f=> {
					try { f(this) } catch(e) { jb.logException(e,'destroy',jbComp.ctx); }});
				this.resolveDestroyed();
			}
		};
		injectLifeCycleMethods(ReactComp,this);
		ReactComp.ctx = this.ctx;
		ReactComp.title = this.jb_title();
		ReactComp.jbComp = jbComp;
		return ReactComp;
	}

	injectCss(cmp) {
		var elem = cmp.base;
		if (!elem || !elem.setAttribute)
			return;
		var ctx = this.ctx;
	  	while (ctx.profile.__innerImplementation)
	  		ctx = ctx.componentContext._parent;
	  	var attachedCtx = this.ctxForPick || ctx;
	  	elem.setAttribute('jb-ctx',attachedCtx.id);
		ui.garbageCollectCtxDictionary();
		jb.ctxDictionary[attachedCtx.id] = attachedCtx;

		if (this.cssSelectors && this.cssSelectors.length > 0) {
			var cssKey = this.cssSelectors.join('\n');
			if (!cssSelectors_hash[cssKey]) {
				cssId++;
				cssSelectors_hash[cssKey] = cssId;
				var cssStyle = this.cssSelectors.map(selectorPlusExp=>{
					var selector = selectorPlusExp.split('{')[0];
					var fixed_selector = selector.split(',').map(x=>x.trim()).map(x=>`.jb-${cssId}${x}`);
					return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
				}).join('\n');
				var remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
        var style_elem = document.createElement('style');
        style_elem.innerHTML = remark + cssStyle;
        document.head.appendChild(style_elem);
			}
			elem.classList.add(`jb-${cssSelectors_hash[cssKey]}`);
		}
	}

	applyFeatures(context) {
		var features = (context.params.features && context.params.features(context) || []);
		features.forEach(f => this.jbExtend(f,context));
		if (context.params.style && context.params.style.profile && context.params.style.profile.features) {
			jb.toarray(context.params.style.profile.features)
				.forEach((f,i)=>
					this.jbExtend(context.runInner(f,{type:'feature'},context.path+'~features~'+i),context))
		}
		return this;
	}

	jbExtend(options,context) {
    	if (!options) return this;
    	context = context || this.ctx;
    	if (!context)
    		console.log('no context provided for jbExtend');
    	if (typeof options != 'object')
    		debugger;

    	this.template = this.template || options.template;

		if (options.beforeInit) this.jbBeforeInitFuncs.push(options.beforeInit);
		if (options.init) this.jbInitFuncs.push(options.init);
		if (options.afterViewInit) this.jbAfterViewInitFuncs.push(options.afterViewInit);
		if (options.doCheck) this.jbCheckFuncs.push(options.doCheck);
		if (options.destroy) this.jbDestroyFuncs.push(options.destroy);
		if (options.componentDidUpdate) this.jbComponentDidUpdateFuncs.push(options.componentDidUpdate);
		if (options.templateModifier) this.modifierFuncs.push(options.templateModifier);
		if (typeof options.class == 'string')
			this.modifierFuncs.push(vdom=> ui.addClassToVdom(vdom,options.class));
		if (typeof options.class == 'function')
			this.modifierFuncs.push(vdom=> ui.addClassToVdom(vdom,options.class()));
		// events
		var events = Object.getOwnPropertyNames(options).filter(op=>op.indexOf('on') == 0);
		events.forEach(op=>
			this.jbRegisterEventsFuncs.push(cmp=>
		       	  cmp[op] = cmp[op] || jb.rx.Observable.fromEvent(cmp.base, op.slice(2))
		       	  	.takeUntil( cmp.destroyed )));

		if (options.ctxForPick) this.ctxForPick=options.ctxForPick;
//		if (options.extendCtx) this.extendCtxFuncs.push(options.extendCtx);
		if (options.extendCtxOnce) this.extendCtxOnceFuncs.push(options.extendCtxOnce);
		if (options.extendItem)
			this.extendItemFuncs.push(options.extendItem);
		this.styleCtx = this.styleCtx || options.styleCtx;
		this.toolbar = this.toolbar || options.toolbar;
		this.noUpdates = this.noUpdates || options.noUpdates;

	   	if (options.css)
    		this.cssSelectors = (this.cssSelectors || [])
    			.concat(options.css.split(/}\s*/m)
    				.map(x=>x.trim())
    				.filter(x=>x)
    				.map(x=>x+'}')
    				.map(x=>x.replace(/^!/,' '))
    			);

		(options.featuresOptions || []).forEach(f =>
			this.jbExtend(f, context))
		return this;
	}
}

function injectLifeCycleMethods(Comp,jbComp) {
	if (jbComp.jbCheckFuncs.length)
	  Comp.prototype.componentWillUpdate = function() {
		jbComp.jbCheckFuncs.forEach(f=>
			f(this));
	}
	if (jbComp.noUpdates)
		Comp.prototype.shouldComponentUpdate = _ => false;
}

ui.garbageCollectCtxDictionary = function(force) {
	var now = new Date().getTime();
	ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now;
	var timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp;
	if (!force && timeSinceLastCleanUp < 10000)
		return;
	ui.ctxDictionaryLastCleanUp = now;

	var used = Array.from(document.querySelectorAll('[jb-ctx]')).map(e=>Number(e.getAttribute('jb-ctx'))).sort((x,y)=>x-y);
	var dict = Object.getOwnPropertyNames(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
	var lastUsedIndex = 0;
	for(var i=0;i<dict.length;i++) {
		while (used[lastUsedIndex] < dict[i])
			lastUsedIndex++;
		if (used[lastUsedIndex] != dict[i])
			delete jb.ctxDictionary[''+dict[i]];
	}
}

ui.focus = function(elem,logTxt,srcCtx) {
	if (!elem) debugger;
	// block the preview from stealing the studio focus
	const now = new Date().getTime();
	const lastStudioActivity = jb.studio.lastStudioActivity || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity']);
	jb.log('focus',['request',srcCtx, logTxt, now - lastStudioActivity, elem,srcCtx]);
  if (jb.studio.previewjb == jb && lastStudioActivity && now - lastStudioActivity < 1000)
    	return;
  jb.delay(1).then(_=> {
   	jb.log('focus',['apply',srcCtx,logTxt,elem,srcCtx]);
    elem.focus()
  })
}

ui.wrapWithLauchingElement = (f,context,elem) =>
	ctx2 => {
		if (!elem) debugger;
		return f(context.extendVars(ctx2).setVars({ $launchingElement: { el : elem }}));
	}


// ****************** generic utils ***************

if (typeof $ != 'undefined' && $.fn)
    $.fn.findIncludeSelf = function(selector) {
			return this.find(selector).addBack(selector); }

jb.jstypes.renderable = value => {
  if (value == null) return '';
  if (Array.isArray(value))
  	return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
  value = jb.val(value,true);
  if (typeof(value) == 'undefined') return '';
  if (value.reactComp)
  	return ui.h(value.reactComp())
  else if (value.constructor && value.constructor.name == 'VNode')
  	return value;
  return '' + value;
}

ui.renderable = ctrl =>
	ctrl && ctrl.reactComp && ctrl.reactComp();

// prevent garbadge collection and preserve the ctx as long as it is in the dom
ui.preserveCtx = ctx => {
  jb.ctxDictionary[ctx.id] = ctx;
  return ctx.id;
}

ui.renderWidget = function(profile,elem) {
	var previewElem;
	try {
		if (window.parent != window && window.parent.jb)
			window.parent.jb.studio.initPreview(window,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
	} catch(e) {}
	class R extends jb.ui.Component {
		constructor(props) {
			super();
			this.state.profile = profile;
			if (jb.studio.studioWindow) {
				var st = jb.studio.studioWindow.jb.studio;
				st.refreshPreviewWidget = _ => {
					jb.resources = jb.ui.originalResources || jb.resources;
					previewElem = ui.render(ui.h(R),elem,previewElem);
				}
				st.pageChange.debounceTime(500)
					.filter(({page})=>page != this.state.profile.$)
					.subscribe(({page,ctrl})=>
						this.setState({profile: {$: ctrl || page, $vars: {DataToDebug: page }} }));
				st.scriptChange.debounceTime(500).subscribe(_=>
						this.setState(null));
			}
		}
		render(pros,state) {
			var profToRun = state.profile;
			if (!jb.comps[profToRun.$]) return '';
			return ui.h(new jb.jbCtx().run(profToRun).reactComp())
		}
	}
	previewElem = ui.render(ui.h(R),elem);
}

ui.cachedMap = mapFunc => {
	const cache = new Map();
	return item => {
		if (cache.has(item))
			return cache.get(item)
		const val = mapFunc(item);
		cache.set(item, val);
		return val;
	}
}

ui.applyAfter = function(promise,ctx) {
	// should refresh all after promise
}

ui.waitFor = function(check,times,interval) {
  if (check())
    return Promise.resolve(1);

  times = times || 300;
  interval = interval || 50;

  return new Promise((resolve,fail)=>{
    function wait_and_check(counter) {
      if (counter < 1)
        return fail();
      setTimeout(() => {
      	var v = check();
        if (v)
          resolve(v);
        else
          wait_and_check(counter-1)
      }, interval);
    }
    return wait_and_check(times);
  })
}

ui.limitStringLength = function(str,maxLength) {
  if (typeof str == 'string' && str.length > maxLength-3)
    return str.substring(0,maxLength) + '...';
  return str;
}
// ****************** vdom utils ***************

ui.stateChangeEm = new jb.rx.Subject();

ui.setState = function(cmp,state,opEvent,watchedAt) {
	jb.log('setState',[cmp.ctx,state, ...arguments]);
	if (state == null && cmp.refresh)
		cmp.refresh();
	else
		cmp.setState(state || {});
	ui.stateChangeEm.next({cmp: cmp, opEvent: opEvent, watchedAt: watchedAt });
}

ui.addClassToVdom = function(vdom,clz) {
	vdom.attributes = vdom.attributes || {};
	vdom.attributes.class = [vdom.attributes.class,clz].filter(x=>x).join(' ');
	return vdom;
}

ui.toggleClassInVdom = function(vdom,clz,add) {
  vdom.attributes = vdom.attributes || {};
  var classes = (vdom.attributes.class || '').split(' ').map(x=>x.trim()).filter(x=>x);
  if (add && classes.indexOf(clz) == -1)
    vdom.attributes.class = classes.concat([clz]).join(' ');
  if (!add)
    vdom.attributes.class = classes.filter(x=>x==clz).join(' ');
  return vdom;
}

ui.item = function(cmp,vdom,data) {
	cmp.jbComp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
	return vdom;
}

ui.watchRef = function(ctx,cmp,ref,includeChildren) {
		if (!ref)
			jb.logError('null ref for watch ref',...arguments);
    ref && ui.refObservable(ref,cmp,{includeChildren})
			.subscribe(e=>{
        if (ctx && ctx.profile && ctx.profile.$trace)
          console.log('ref change watched: ' + (ref && ref.path && ref.path().join('~')),e,cmp,ref,ctx);
        return ui.setState(cmp,null,e,ctx);
      })
}

ui.toVdomOrStr = val => {
	var res = jb.val((Array.isArray(val) && val.length == 1) ? val[0] : val);
	if (typeof res == 'boolean')
		res = '' + res;
  if (res && res.slice)
    res = res.slice(0,1000);
	return res;
}

ui.refreshComp = (ctx,el) => {
	var nextElem = el.nextElementSibling;
	var newElem = ui.render(ui.h(ctx.runItself().reactComp()),el.parentElement,el);
	if (nextElem)
		newElem.parentElement.insertBefore(newElem,nextElem);
}

ui.outerWidth  = el => {
  var style = getComputedStyle(el);
  return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
}
ui.outerHeight = el => {
  var style = getComputedStyle(el);
  return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
}
ui.offset = el => {
  var rect = el.getBoundingClientRect();
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  }
}
ui.parents = el => {
  var res = [];
  el = el.parentNode;
  while(el) {
    res.push(el);
    el = el.parentNode;
  }
  return res;
}
ui.closest = (el,query) => {
  while(el) {
    if (ui.matches(el,query)) return el;
    el = el.parentNode;
  }
}
ui.find = (el,query) => typeof el == 'string' ? Array.from(document.querySelectorAll(el)) : Array.from(el.querySelectorAll(query))
ui.findIncludeSelf = (el,query) => (ui.matches(el,query) ? [el] : []).concat(Array.from(el.querySelectorAll(query)))
ui.addClass = (el,clz) => el.classList.add(clz);
ui.removeClass = (el,clz) => el.classList.remove(clz);
ui.hasClass = (el,clz) => el.classList.contains(clz);
ui.matches = (el,query) => el && el.matches && el.matches(query)
ui.index = el => Array.from(el.parentNode.children).indexOf(el)
ui.inDocument = el => el && (ui.parents(el).slice(-1)[0]||{}).nodeType == 9
ui.addHTML = (el,html) => {
  var elem = document.createElement('div');
  elem.innerHTML = html;
  el.appendChild(elem.firstChild)
}

// ****************** components ****************

jb.component('custom-style', {
	typePattern: /.*-style/, category: 'advanced:10,all:10',
	params: [
		{ id: 'template', as: 'single', essential: true, dynamic: true, ignore: true },
		{ id: 'css', as: 'string' },
    	{ id: 'features', type: 'feature[]', dynamic: true },
	],
	impl: (context,css,features) => ({
		template: context.profile.template,
		css: css,
		featuresOptions: features(),
		styleCtx: context._parent
	})
})

jb.component('style-by-control', {
	typePattern: /.*-style/,category: 'advanced:10,all:20',
	params: [
		{ id: 'control', type: 'control', essential: true, dynamic: true },
		{ id: 'modelVar', as: 'string', essential: true }
	],
	impl: (ctx,control,modelVar) =>
		control(ctx.setVars( jb.obj(modelVar,ctx.vars.$model)))
})

})()
;

(function() {

// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

class ImmutableWithJbId {
  constructor(resources) {
    this.resources = resources;
    this.objToPath = new Map();
    this.idCounter = 0;
    this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])];
    this.resourceChange = new jb.rx.Subject();
    this.observables = [];
    jb.delay(1).then(_=>{
        jb.ui.originalResources = jb.resources;
        this.objToPath.set(resources(),[])
        resources().$jb_id = this.idCounter++
        this.propagateResourceChangeToObservables();
    })
  }
  resourceReferred(resName) {
    const resource = this.resources()[resName]
    if (!this.objToPath.has(resource))
    this.addObjToMap(resource,[resName])
  }
  doOp(ref,opOnRef,srcCtx,doNotNotify) {
    const opVal = opOnRef.$set || opOnRef.$merge || opOnRef.$push || opOnRef.$splice;
    if (!this.isRef(ref))
      ref = this.asRef(ref);
    jb.log('doOp',[this.asStr(ref),opVal,...arguments]);

    const path = this.pathOfRef(ref), op = {}, oldVal = this.valOfPath(path);
    if (!path || ref.$jb_val) return;
    if (opOnRef.$set && opOnRef.$set == oldVal) return;
    path.forEach((p,i)=> { // hash ancestors with $jb_id because the objects will be re-generated by redux
        const innerPath = path.slice(0,i+1)
        const val = this.valOfPath(innerPath)
        if (val && typeof val === 'object' && !val.$jb_id) {
            val.$jb_id = this.idCounter++
            this.objToPath.delete(val)
            this.objToPath.set(val.$jb_id,innerPath)
        }
    })
    jb.path(op,path,opOnRef); // create op as nested object
    const opEvent = {op: opOnRef, path, ref, srcCtx, oldVal, opVal, timeStamp: new Date().getTime()};
    this.resources(jb.ui.update(this.resources(),op),opEvent);
    const newVal = this.valOfPath(path);
    if (opOnRef.$push) {
        this.addObjToMap(opOnRef.$push,[...path,oldVal.length])
    } else {
        // TODO: make is more effecient in case of $merge, $splice
        this.removeObjFromMap(oldVal)
        this.addObjToMap(newVal,path)
    }
    opEvent.newVal = newVal;
    if (!doNotNotify)
        this.resourceChange.next(opEvent);
    return opEvent;
  }
  addObjToMap(top,path) {
    if (!top || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
    if (top.$jb_id) {
        this.objToPath.set(top.$jb_id,path)
        this.objToPath.delete(top)
    } else {
        this.objToPath.set(top,path)
    }
    Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0)
        .forEach(key => this.addObjToMap(top[key],[...path,key]))
  }
  removeObjFromMap(top) {
    if (!top || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
    this.objToPath.delete(top)
    if (top.$jb_id)
        this.objToPath.delete(top.$jb_id)
    Object.keys(top).filter(key=>key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key]))
  }
  refreshMapDown(top) {
    const ref = this.asRef(top)
    const path = ref && ref.path && ref.path()
    if (path)
      this.addObjToMap(top,path)
  }
  pathOfRef(ref) {
    if (ref.$jb_path)
      return ref.$jb_path()
    const path = this.isRef(ref) && (this.objToPath.get(ref.$jb_obj) || this.objToPath.get(ref.$jb_obj.$jb_id))
    if (path && ref.$jb_childProp)
        return [...path, ref.$jb_childProp]
    return path
  }
  asRef(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const path = this.objToPath.get(obj) || this.objToPath.get(obj.$jb_id)
    if (path)
        return { $jb_obj: this.valOfPath(path), handler: this, path: function() { return this.handler.pathOfRef(this)} }
    return obj;
  }
  valOfPath(path) {
    return this.cleanVal(path.reduce((o,p)=>o && o[p],this.resources()))
  }
  refOfPath(path) {
    const val = this.valOfPath(path);
    if (!val || typeof val !== 'object' && path.length > 0) {
      const parent = this.asRef(this.valOfPath(path.slice(0,-1)));
      if (this.isRef(parent)) 
        return Object.assign({},parent,{$jb_childProp: path.slice(-1)})
      jb.logError('reOfPath can not find parent ref',path.join('~'))
    }
    return this.asRef(val)
  }
  asStr(ref) { // for logs
    return this.pathOfRef(ref).join('~')
  }
  val(ref) {
    if (ref == null) return ref;
    if (ref.$jb_val) return ref.$jb_val();

    if (!ref.$jb_obj) return ref;
    if (ref.handler != this) {
      if (typeof ref.handler.val != 'function') debugger
      return ref.handler.val(ref)
    }
    return this.valOfPath(this.pathOfRef(ref))
  }
  isRef(ref) {
    return ref && (ref.$jb_obj || ref.$jb_val);
  }
  objectProperty(obj,prop,ctx) {
    jb.log('immutable',['objectProperty',...arguments]);
    if (!obj)
      return jb.logError('objectProperty: null obj',ctx);
    var ref = this.asRef(obj);
    if (ref && ref.$jb_obj) {
      return {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
    } else {
      return obj[prop]; // not reffable
    }
  }
  writeValue(ref,value,srcCtx) {
    if (!ref || !this.isRef(ref))
      return jb.logError('writeValue: err in ref', srcCtx);

    if (this.val(ref) === value) return;
    jb.log('writeValue',['immutable',this.asStr(ref),value,ref,srcCtx]);
    if (ref.$jb_val)
      return ref.$jb_val(value);
    return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
  }
  createSecondaryLink(val) {
    if (val && typeof val === 'object' && !val.$jb_secondaryLink) {
      const ref = this.asRef(val);
      if (ref.$jb_obj)
        return new Proxy(val, {
          get: (o,p) => p === '$jb_secondaryLink' ? {val} : o[p],
          set: (o,p,v) => o[p] = v
        })
    }
    return val;
  }
  cleanVal(val) {
    return val && val.$jb_secondaryLink && val.$jb_secondaryLink.val || val
  }
  splice(ref,args,srcCtx) {
    return this.doOp(ref,{$splice: args },srcCtx)
  }
  move(fromRef,toRef,srcCtx) {
    const fromPath = this.pathOfRef(fromRef), toPath = this.pathOfRef(toRef);
    const sameArray = fromPath.slice(0,-1).join('~') == toPath.slice(0,-1).join('~');
    const fromIndex = Number(fromPath.slice(-1));
    const toIndex = Number(toPath.slice(-1));
    const fromArray = this.refOfPath(fromPath.slice(0,-1)),toArray = this.refOfPath(toPath.slice(0,-1));
    if (isNaN(fromIndex) || isNaN(toIndex))
        return jb.logError('move: not array element',srcCtx,fromRef,toRef);

    var valToMove = jb.val(fromRef);
    if (sameArray) {
        if (fromIndex < toIndex) toIndex--; // the deletion changes the index
        return this.doOp(fromArray,{$splice: [[fromIndex,1],[toIndex,0,valToMove]] },srcCtx)
    }
    var events = [
        this.doOp(fromArray,{$splice: [[fromIndex,1]] },srcCtx,true),
        this.doOp(toArray,{$splice: [[toIndex,0,valToMove]] },srcCtx,true),
    ]
    events.forEach(opEvent=>this.resourceChange.next(opEvent))
  }
  push(ref,value,srcCtx) {
    return this.doOp(ref,{$push: this.createSecondaryLink(value)},srcCtx)
  }
  merge(ref,value,srcCtx) {
    return this.doOp(ref,{$merge: this.createSecondaryLink(value)},srcCtx)
  }
  getOrCreateObservable(req) {
      const subject = new jb.rx.Subject()
      const entry = {...req, subject}
      this.observables.push(entry);
      this.observables.sort((e1,e2) => comparePaths(e1.cmp && e1.cmp.ctx.path, e2.cmp && e2.cmp.ctx.path))
      req.cmp.destroyed.then(_=> {
          this.observables.splice(this.observables.indexOf(entry), 1);
          subject.complete()
      });
      return subject
  }
  refObservable(ref,cmp,{includeChildren}={}) {
    jb.log('registerCmpObservable',[cmp.ctx, ...arguments])
    if (ref && ref.$jb_observable)
      return ref.$jb_observable(cmp);
    if (!ref || !this.isRef(ref))
      return jb.rx.Observable.of().takeUntil(cmp.destroyed);

    return this.getOrCreateObservable({ref,cmp,includeChildren})
  }

  propagateResourceChangeToObservables() {
      this.resourceChange.subscribe(e=>{
          const changed_path = this.pathOfRef(e.ref);
          if (changed_path)
            this.observables.forEach(obs=>{
                const diff = comparePaths(changed_path, this.pathOfRef(obs.ref))
                if (diff == -1 || diff == 0 || diff == 1 && obs.includeChildren) {
                    jb.log('notifyCmpObservable',['notify change',e.srcCtx,obs,e])
                    obs.subject.next(e)
                }
            })
      })
    }
}

// 0- equals, -1,1 means contains -2,2 lexical
function comparePaths(path1,path2) {
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
jb.valueByRefHandler = new ImmutableWithJbId(resourcesRef);

jb.ui.refObservable = (ref,cmp,settings) =>
  jb.refHandler(ref).refObservable(ref,cmp,settings);

jb.ui.ImmutableWithJbId = ImmutableWithJbId;
jb.ui.resourceChange = jb.valueByRefHandler.resourceChange;


})()
;

jb.component('group', {
  type: 'control', category: 'group:100,common:90',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'group.style', defaultValue: { $: 'layout.vertical' }, essential: true , dynamic: true },
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('group.init-group', {
  type: 'feature', category: 'group:0',
  impl: ctx => ({
    init: cmp => {
      cmp.calcCtrls = cmp.calcCtrls || (_ =>
        ctx.vars.$model.controls(cmp.ctx).map(c=>jb.ui.renderable(c)).filter(x=>x))
      if (!cmp.state.ctrls)
        cmp.state.ctrls = cmp.calcCtrls()
      cmp.refresh = cmp.refresh || (_ =>
          cmp.setState({ctrls: cmp.calcCtrls() }))

      if (cmp.ctrlEmitter)
        cmp.ctrlEmitter.subscribe(ctrls=>
              jb.ui.setState(cmp,{ctrls:ctrls.map(c=>jb.ui.renderable(c)).filter(x=>x)},null,ctx))
    }
  })
})

jb.component('dynamic-controls', {
  type: 'control',
  params: [
    { id: 'controlItems', type: 'data', as: 'array', essential: true, dynamic: true },
    { id: 'genericControl', type: 'control', essential: true, dynamic: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: (context,controlItems,genericControl,itemVariable) =>
    controlItems()
      .map(jb.ui.cachedMap(controlItem => jb.tosingle(genericControl(
        new jb.jbCtx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      ))
})

jb.component('group.dynamic-titles', {
  type: 'feature', category: 'group:30',
  description: 'dynamic titles for sub controls',
  impl: ctx => ({
    doCheck: cmp =>
      (cmp.state.ctrls || []).forEach(ctrl=>
        ctrl.title = ctrl.jbComp.jb_title ? ctrl.jbComp.jb_title() : '')
  })
})

jb.component('control.first-succeeding', {
  type: 'control', category: 'common:30',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'first-succeeding.style', defaultValue :{$: 'first-succeeding.style' }, essential: true , dynamic: true },
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('control-with-condition', {
  type: 'control',
  params: [
    { id: 'condition', type: 'boolean', essential: true, as: 'boolean' },
    { id: 'control', type: 'control', essential: true, dynamic: true },
    { id: 'title', as: 'string' },
  ],
  impl: (ctx,condition,ctrl) =>
    condition && ctrl(ctx)
})
;

jb.component('label', {
    type: 'control', category: 'control:100,common:80',
    params: [
        { id: 'title', as: 'ref', essential: true, defaultValue: 'my label', dynamic: true },
        { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ui.ctrl(ctx)
})

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => {
      var ref = ctx.vars.$model.title(cmp.ctx);
      cmp.state.title = fixTitleVal(ref);
      if (jb.isRef(ref))
        jb.ui.refObservable(ref,cmp)
            .subscribe(e=>jb.ui.setState(cmp,{title: fixTitleVal(ref)},e,ctx));

      cmp.refresh = _ =>
        cmp.setState({title: fixTitleVal(ctx.vars.$model.title(cmp.ctx))})

      function fixTitleVal(titleRef) {
        if (titleRef  == null|| titleRef.$jb_invalid)
            return 'ref error';
        return jb.ui.toVdomOrStr(titleRef);
      }
    }
  })
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('span',{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.p', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('p',{},state.title),
        features :{$: 'label.bind-title' }
    }
})


jb.component('label.h1', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('h1',{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.heading', {
    type: 'label.style',
    params: [{ id: 'level', as: 'string', defaultValue: 'h1', options: 'h1,h2,h3,h4,h5'}],
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h(cmp.level,{},state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.card-title', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{ class: 'mdl-card__title' },
    				h('h2',{ class: 'mdl-card__title-text' },	state.title)),
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.card-supporting-text', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{ class: 'mdl-card__supporting-text' },	state.title),
        features :{$: 'label.bind-title' }
    }
})

jb.component('highlight', {
  params: [
    { id: 'base', as: 'string', dynamic: true },
    { id: 'highlight', as: 'string', dynamic: true },
    { id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--indigo-A700'},
  ],
  impl: (ctx,base,highlight,cssClass) => {
    var h = highlight(), b = base();
    if (!h || !b) return b;
    var highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return [
        b.split(highlight)[0],
        jb.ui.h('span',{class: cssClass},highlight),
        b.split(highlight).slice(1).join(highlight)]
  }
})
;

jb.component('image', {
	type: 'control,image', category: 'control:50',
	params: [
		{ id: 'url', as: 'string', essential: true },
		{ id: 'imageWidth', as: 'number' },
		{ id: 'imageHeight', as: 'number' },
		{ id: 'width', as: 'number' },
		{ id: 'height', as: 'number' },
		{ id: 'units', as: 'string', defaultValue : 'px'},
		{ id: 'style', type: 'image.style', dynamic: true, defaultValue: { $: 'image.default' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: ctx => {
			['imageWidth','imageHeight','width','height'].forEach(prop=>
					ctx.params[prop] = ctx.params[prop] || null);
			return jb.ui.ctrl(ctx, {
				init: cmp =>
					cmp.state.url = ctx.params.url
			})
		}
})

jb.component('image.default', {
	type: 'image.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) =>
			h('div',{}, h('img', {src: state.url})),

		css: `{ {? width: %$$model/width%%$$model/units%; ?} {? height: %$$model/height%%$$model/units%; ?} }
			>img{ {? width: %$$model/imageWidth%%$$model/units%; ?} {? height: %$$model/imageHeight%%$$model/units%; ?} }`
	}
})
;

jb.type('button.style')

jb.component('button', {
  type: 'control,clickable', category: 'control:100,common:100',
  params: [
    { id: 'title', as: 'ref', essential: true, defaultTValue: 'click me', dynamic: true },
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.mdl-raised' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      beforeInit: cmp => {
        cmp.state.title = jb.val(ctx.params.title());
        cmp.refresh = _ =>
          cmp.setState({title: jb.val(ctx.params.title(cmp.ctx))});

        cmp.clicked = ev => {
          if (ev && ev.ctrlKey && cmp.ctrlAction)
            cmp.ctrlAction()
          else if (ev && ev.altKey && cmp.altAction)
            cmp.altAction()
          else
            cmp.action();
        }
      },
      afterViewInit: cmp =>
          cmp.action = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})

jb.component('ctrl-action', {
  type: 'feature', category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    { id: 'action', type: 'action', essential: true, dynamic: true },
  ],
  impl: (ctx,action) => ({
      afterViewInit: cmp =>
        cmp.ctrlAction = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
  })
})

jb.component('alt-action', {
  type: 'feature', category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    { id: 'action', type: 'action', essential: true, dynamic: true },
  ],
  impl: (ctx,action) => ({
      afterViewInit: cmp =>
        cmp.altAction = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
  })
})

jb.component('button-disabled', {
  type: 'feature', category: 'button:70',
  description: 'define condition when button is enabled',
  params: [
    { id: 'enabledCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,cond) => ({
      init: cmp =>
        cmp.state.isEnabled = ctx2 => cond(ctx.extendVars(ctx2))
  })
})

jb.component('icon-with-action', {
  type: 'control,clickable', category: 'control:30',
  params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'title', as: 'string' },
		{ id: 'action', type: 'action', essential: true, dynamic: true },
		{ id: 'style', type: 'icon-with-action.style', dynamic: true, defaultValue :{$: 'button.mdl-icon' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx, {
			init: cmp=>  {
					cmp.icon = ctx.params.icon;
					cmp.state.title = ctx.params.title;
			},
      afterViewInit: cmp =>
          cmp.clicked = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})
;

jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

jb.component('field.databind', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        if (!ctx.vars.$model || !ctx.vars.$model.databind)
          return jb.logError('bind-field: No databind in model', ctx, ctx.vars.$model);
        cmp.state.title = ctx.vars.$model.title();
        cmp.state.fieldId = jb.ui.field_id_counter++;
        cmp.state.model = jb.val(ctx.vars.$model.databind);

        cmp.refresh = _ => {
          cmp.setState({model: cmp.jbModel()});
          cmp.refreshMdl && cmp.refreshMdl();
          cmp.extendRefresh && cmp.extendRefresh();
        }

        cmp.jbModel = (val,source) => {
          if (val === undefined)
            return jb.val(ctx.vars.$model.databind);
          else { // write
              jb.ui.checkValidationError(cmp);
              jb.writeValue(ctx.vars.$model.databind,val,ctx);
          }
        }

        jb.ui.refObservable(ctx.vars.$model.databind,cmp)
            .subscribe(e=>jb.ui.setState(cmp,null,e,ctx))
      }
  })
})

jb.component('field.databind-text', {
  type: 'feature',
  params: [
    { id: 'debounceTime', as: 'number', defaultValue: 0 },
    { id: 'oneWay', type: 'boolean', as: 'boolean'}
  ],
  impl: (ctx,debounceTime,oneWay) => ({
      beforeInit: cmp => {
        if (debounceTime) {
          cmp.debouncer = new jb.rx.Subject();
          cmp.debouncer.takeUntil( cmp.destroyed )
          .distinctUntilChanged()
          .debounceTime(debounceTime)
          .subscribe(val=>cmp.jbModel(val))
        }

        if (!ctx.vars.$model || !ctx.vars.$model.databind)
          return jb.logError('bind-field: No databind in model', ctx, ctx.vars.$model);
        cmp.state.title = ctx.vars.$model.title();
        cmp.state.fieldId = jb.ui.field_id_counter++;
        cmp.state.model = jb.val(ctx.vars.$model.databind);

        cmp.jbModel = (val,source) => {
          if (source == 'keyup') {
            if (cmp.debouncer)
              return cmp.debouncer.next(val);
            return jb.delay(1).then(_=>cmp.jbModel(val)); // make sure the input is inside the value
          }

          if (val === undefined)
            return jb.val(ctx.vars.$model.databind);
          else { // write
              if (!oneWay)
                cmp.setState({model: val});
              jb.ui.checkValidationError(cmp);
              jb.writeValue(ctx.vars.$model.databind,val,ctx);
          }
        }

        var srcCtx = cmp.ctxForPick || cmp.ctx;
        if (!oneWay) jb.ui.refObservable(ctx.vars.$model.databind,cmp,{ onError: _ => cmp.setState({model: null}) })
            .filter(e=>!e || !e.srcCtx || e.srcCtx.path != srcCtx.path) // block self refresh
            .subscribe(e=>jb.ui.setState(cmp,{model: cmp.jbModel()},e,ctx))
      }
  })
})

jb.component('field.databind-range', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        if (!ctx.vars.$model || !ctx.vars.$model.databind)
          return jb.logError('bind-field: No databind in model', ctx, ctx.vars.$model);
        cmp.state.title = ctx.vars.$model.title();
        cmp.state.fieldId = jb.ui.field_id_counter++;
        cmp.state.model = jb.val(ctx.vars.$model.databind);

        cmp.jbModel = (val,source) => {
          if (val === undefined)
            return jb.val(ctx.vars.$model.databind);
          else { // write
            jb.ui.checkValidationError(cmp);
            jb.writeValue(ctx.vars.$model.databind,val,ctx);
          }
        }

        var srcCtx = cmp.ctxForPick || cmp.ctx;
        jb.ui.refObservable(ctx.vars.$model.databind,cmp)
            .filter(e=>!e || !e.srcCtx || e.srcCtx.path != srcCtx.path) // block self refresh
            .subscribe(e=>jb.ui.setState(cmp,{model: cmp.jbModel()},e,ctx))
      }
  })
})

jb.component('field.data', {
  type: 'data',
  impl: ctx =>
    ctx.vars.$model.databind
})

jb.component('field.default', {
  type: 'feature',
  params: [
    { id: 'value', type: 'data'},
  ],
  impl: function(context,defaultValue) {
    var data_ref = context.vars.$model.databind;
    if (data_ref && jb.val(data_ref) == null)
      jb.writeValue(data_ref,defaultValue)
  }
})

jb.component('field.subscribe', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'includeFirst', type: 'boolean', as: 'boolean'},
  ],
  impl: (context,action,includeFirst) => ({
    init: cmp => {
      var data_ref = context.vars.$model && context.vars.$model.databind;
      if (!data_ref) return;
      var includeFirstEm = includeFirst ? jb.rx.Observable.of(jb.val(data_ref)) : jb.rx.Observable.of();
      jb.ui.refObservable(data_ref,cmp)
            .map(e=>jb.val(e.ref))
            .merge(includeFirstEm)
            .filter(x=>x)
            .subscribe(x=>
              action(context.setData(x)));
    }
  })
})

jb.component('field.toolbar', {
  type: 'feature',
  params: [
    { id: 'toolbar', type: 'control', essential: true, dynamic: true },
  ],
  impl: (context,toolbar) => ({
    toolbar: toolbar().reactComp()
  })
})

// ***** validation 

jb.component('validation', {
  type: 'feature', category: 'validation:100',
  params: [
    { id: 'validCondition', essential: true, type: 'boolean', as: 'boolean', dynamic: true },
    { id: 'errorMessage', essential: true, as: 'string', dynamic: true },
  ],
  impl: (ctx,validCondition,errorMessage) => ({
      init: cmp =>
        cmp.validations = (cmp.validations || []).concat([ctx.params]),
      afterViewInit: cmp =>  { // for preview
          var _ctx = ctx.setData(cmp.state.model);
          validCondition(_ctx); errorMessage(_ctx);
      }
  })
})

jb.ui.checkValidationError = cmp => {
  var err = validationError(cmp);
  if (cmp.state.error != err) {
    jb.log('field',['setErrState',ctx,err])
    cmp.setState({valid: !err, error:err});
  }

  function validationError() {
    if (!cmp.validations) return;
    var ctx = cmp.ctx.setData(cmp.state.model);
    var err = (cmp.validations || [])
      .filter(validator=>!validator.validCondition(ctx))
      .map(validator=>validator.errorMessage(ctx))[0];
    if (ctx.vars.formContainer)
      ctx.vars.formContainer.err = err;
    return err;
  }  
}
;

jb.type('editable-text.style');

jb.component('editable-text', {
  type: 'control', category: 'input:100,common:80',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref', essential: true},
    { id: 'updateOnBlur', as: 'boolean', type: 'boolean' },
    { id: 'style', type: 'editable-text.style', defaultValue: { $: 'editable-text.mdl-input' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
});

jb.component('editable-text.x-button', {
  type: 'feature',
  impl : ctx =>({
    templateModifier: (vdom,cmp,state) =>
      jb.ui.h('div', {},[vdom].concat(cmp.jbModel() ? [jb.ui.h('button', { class: 'delete', onclick: e => cmp.jbModel(null)} ,'×')]  : []) ),
    css: `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
  })
})

jb.component('editable-text.helper-popup', {
  type: 'feature',
  params: [
    { id: 'control', type: 'control', dynamic: true, essential: true },
    { id: 'popupId', as: 'string', essential: true },
    { id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.popup' } },
    { id: 'showHelper', as: 'boolean', dynamic: true, defaultValue :{$notEmpty: '%value%' }, description: 'show/hide helper according to input content' },
    { id: 'onEnter', type: 'action', dynamic: true },
    { id: 'onEsc', type: 'action', dynamic: true },
  ],
  impl : ctx =>({
    onkeyup: true,
    onkeydown: true, // used for arrows
    extendCtxOnce: (ctx,cmp) =>
      ctx.setVars({selectionKeySource: {}}),

    afterViewInit: cmp => {
      var input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
      if (!input) return;

      cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 =>
            ctx2.run( {$: 'open-dialog',
              id: ctx.params.popupId,
              style: _ctx => ctx.params.popupStyle(_ctx),
              content: _ctx => ctx.params.control(_ctx),
              features: {$: 'dialog-feature.unique-dialog', id: ctx.params.popupId}
            })
          , cmp.ctx, cmp.base );

      cmp.popup = _ =>
        jb.ui.dialogs.dialogs.filter(d=>d.id == ctx.params.popupId)[0];
      cmp.closePopup = _ =>
        cmp.popup() && cmp.popup().close();
      cmp.refreshSuggestionPopupOpenClose = _ => {
          const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
          jb.log('helper-popup', ['refreshSuggestionPopupOpenClose', showHelper,input.value,cmp.ctx,cmp,ctx] );
          if (!showHelper) {
            jb.log('helper-popup', ['close popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.closePopup();
          } else if (!cmp.popup()) {
            jb.log('helper-popup', ['open popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.openPopup(cmp.ctx)
          }
      }

      cmp.ctx.vars.selectionKeySource.input = input;
      var keyup = cmp.ctx.vars.selectionKeySource.keyup = cmp.onkeyup.delay(1); // delay to have input updated
      cmp.ctx.vars.selectionKeySource.keydown = cmp.onkeydown;
      cmp.ctx.vars.selectionKeySource.cmp = cmp;

      jb.delay(500).then(_=>{
        cmp.onkeydown.filter(e=> e.keyCode == 13).subscribe(_=>{
          const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
          jb.log('helper-popup', ['onEnter', showHelper, input.value,cmp.ctx,cmp,ctx])
          if (!showHelper)
            ctx.params.onEnter(cmp.ctx)
        });
        cmp.onkeydown.filter(e=> e.keyCode == 27 ).subscribe(_=>
          ctx.params.onEsc(cmp.ctx));
      })

      keyup.filter(e=> [13,27,37,38,39,40].indexOf(e.keyCode) == -1)
        .subscribe(_=>cmp.refreshSuggestionPopupOpenClose())

      keyup.filter(e=>e.keyCode == 27) // ESC
          .subscribe(_=>cmp.closePopup())
    },
    destroy: cmp =>
        cmp.closePopup(),
  })
})
;

jb.type('editable-boolean.style');

jb.component('editable-boolean',{
  type: 'control', category: 'input:20',
  params: [
    { id: 'databind', as: 'ref'},
    { id: 'style', type: 'editable-boolean.style', defaultValue: { $: 'editable-boolean.checkbox' }, dynamic: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true },
    { id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true  },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => jb.ui.ctrl(ctx,{
  		init: cmp => {
        cmp.toggle = () =>
          cmp.jbModel(!cmp.jbModel());

  			cmp.text = () => {
          if (!cmp.jbModel) return '';
          return cmp.jbModel() ? ctx.params.textForTrue(cmp.ctx) : ctx.params.textForFalse(cmp.ctx);
        }
        cmp.extendRefresh = _ =>
          cmp.setState({text: cmp.text()})
          
        cmp.refresh();
  		},
  	})
})

jb.component('editable-boolean.keyboard-support', {
  type: 'feature',
  impl: ctx => ({
      onkeydown: true,
      afterViewInit: cmp => {
        cmp.onkeydown.filter(e=> 
            e.keyCode == 37 || e.keyCode == 39)
          .subscribe(x=> {
            cmp.toggle();
            cmp.refreshMdl && cmp.refreshMdl();
          })
      },
    })
})
;

jb.component('editable-number', {
  type: 'control', category: 'input:30',
  params: [
    { id: 'databind', as: 'ref'},
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'editable-number.style', defaultValue: { $: 'editable-number.input' }, dynamic: true },
    { id: 'symbol', as: 'string', description: 'leave empty to parse symbol from value' },
    { id: 'min', as: 'number', defaultValue: 0 },
    { id: 'max', as: 'number', defaultValue: 100 },
    { id: 'displayString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%' },
    { id: 'dataString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%' },
    { id: 'autoScale', as: 'boolean', defaultValue: true, description: 'adjust its scale if at edges' },

    { id: 'step', as: 'number', defaultValue: 1, description: 'used by slider' },
    { id: 'initialPixelsPerUnit', as: 'number', description: 'used by slider' },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
      class editableNumber {
        constructor(params) {
          Object.assign(this,params);
          if (this.min == null) this.min = NaN;
          if (this.max == null) this.max = NaN;
        }
        numericPart(dataString) {
          if (!dataString) return NaN;
          var parts = (''+dataString).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/); // prefix-number-suffix
          if ((!this.symbol) && parts)
            this.symbol = parts[1] || parts[3] || this.symbol;
          return (parts && parts[2]) || '';
        }

        calcDisplayString(number,ctx) {
          if (isNaN(number)) return this.placeholder || '';
          return this.displayString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }

        calcDataString(number,ctx) {
          if (isNaN(number)) return '';
          return this.dataString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }
      }
      return jb.ui.ctrl(ctx.setVars({ editableNumber: new editableNumber(ctx.params) })) 
  }
})

jb.component('editable-number.input',{
  type: 'editable-number.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', { 
        value: state.model, 
        onchange: e => cmp.jbModel(e.target.value), 
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
  }
})


;

jb.component('group.wait', {
  type: 'feature', category: 'group:70',
	description: 'wait for asynch data before showing the control',
  params: [
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'varName', as: 'string' },
  ],
  impl: (context,waitFor,loading,error,varName) => ({
      beforeInit : cmp =>
        cmp.state.ctrls = [loading(context)].map(c=>c.reactComp()),

      afterViewInit: cmp => {
        jb.rx.Observable.from(waitFor()).takeUntil(cmp.destroyed).take(1)
          .catch(e=> {
              cmp.setState( { ctrls: [error(context.setVars({error:e}))].map(c=>c.reactComp()) }) 
              return []
          })
          .subscribe(data => {
              cmp.ctx = cmp.ctx.setData(data);
              if (varName)
                cmp.ctx = cmp.ctx.setVars(jb.obj(varName,data));
              // strong refresh
              cmp.setState({ctrls: []});
              jb.delay(1).then(
                _=>cmp.refresh())
            })
      },
  })
})

jb.component('watch-ref', {
  type: 'feature', category: 'watch:100',
	description: 'subscribes to data changes to refresh component',
  params: [
    { id: 'ref', essential: true, as: 'ref', description: 'reference to data' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
    { id: 'delay', as: 'number', description: 'delay in activation, can be used to set priority' },
  ],
  impl: (ctx,ref,includeChildren,delay) => ({
      init: cmp =>
        jb.ui.watchRef(ctx,cmp,ref,includeChildren,delay)
  })
})

jb.component('watch-observable', {
  type: 'feature', category: 'watch',
	description: 'subscribes to a custom rx.observable to refresh component',
  params: [
    { id: 'toWatch', essential: true },
  ],
  impl: (ctx,toWatch) => ({
      init: cmp => {
        if (!toWatch.subscribe)
          return jb.logError('watch-observable: non obsevable parameter', ctx);
        var virtualRef = { $jb_observable: cmp =>
          toWatch
        };
        jb.ui.watchRef(ctx,cmp,virtualRef)
      }
  })
})

jb.component('group.data', {
  type: 'feature', category: 'general:100,watch:80',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable' },
    { id: 'watch', as: 'boolean' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx, data_ref, itemVariable,watch,includeChildren) => ({
      init: cmp => {
        if (watch)
          jb.ui.watchRef(ctx,cmp,data_ref(),includeChildren)
      },
      extendCtxOnce: ctx => {
          var val = data_ref();
          var res = ctx.setData(val);
          if (itemVariable)
            res = res.setVars(jb.obj(itemVariable,val));
          return res;
      },
  })
})

jb.component('id', {
  type: 'feature',
	description: 'adds id to html element',
  params: [
    { id: 'id', essential: true, as: 'string' },
  ],
  impl: (ctx,id) => ({
    templateModifier: (vdom,cmp,state) => {
        vdom.attributes.id = id
        return vdom;
      }
  })
})

jb.component('var', {
  type: 'feature', category: 'general:90',
	description: 'define a variable. mutable or const, local or global',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, defaultValue: '', essential: true },
    { id: 'mutable', as: 'boolean', description: 'E.g., selected item variable' },
    { id: 'globalId', as: 'string', description: 'If specified, the var will be defined as global with this id' },
  ],
  impl: (context, name, value, mutable, globalId) => ({
      destroy: cmp => {
        if (mutable)
          jb.writeValue(jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
        if (!mutable) {
          return ctx.setVars(jb.obj(name, value(ctx)))
        } else {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          const fullName = globalId || (name + ':' + cmp.resourceId);
          jb.log('var',['new-resource',ctx,fullName])
          jb.resource(fullName, jb.val(value(ctx)));
          var refToResource = jb.valueByRefHandler.refOfPath([fullName]);
          //jb.writeValue(refToResource,value(ctx.setData(cmp)),context);
          //jb.writeValue(refToResource, jb.val(value(ctx)), context);
          return ctx.setVars(jb.obj(name, refToResource));
        }
      }
  })
})

jb.component('bind-refs', {
  type: 'feature', category: 'watch',
  description: 'automatically updates a mutual variable when other value is changing',
  params: [
    { id: 'watchRef', essential: true, as: 'ref' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
    { id: 'updateRef', essential: true, as: 'ref' },
    { id: 'value', essential: true, as: 'single', dynamic: true },
  ],
  impl: (ctx,ref,includeChildren,updateRef,value) => ({
      init: cmp =>
        jb.ui.refObservable(ref,cmp,{includeChildren:includeChildren}).subscribe(e=>
          jb.writeValue(updateRef,value(cmp.ctx),ctx))
  })
})

jb.component('calculated-var', {
  type: 'feature', category: 'general:60',
	description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, defaultValue: '', essential: true },
    { id: 'globalId', as: 'string', description: 'If specified, the var will be defined as global with this id' },
    { id: 'watchRefs', as: 'array', dynamic: true, essential: true, defaultValue: [], description: 'variable to watch. needs to be in array' },
  ],
  impl: (context, name, value,globalId, watchRefs) => ({
      destroy: cmp => {
        jb.writeValue(jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
        cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
        const fullName = globalId || (name + ':' + cmp.resourceId);
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(ctx)));
        var refToResource = jb.valueByRefHandler.refOfPath([fullName]);
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
            jb.ui.refObservable(ref,cmp,{includeChildren:true}).subscribe(e=>
              jb.writeValue(refToResource,value(cmp.ctx),context))
          )
        return ctx.setVars(jb.obj(name, refToResource));
      }
  })
})

jb.component('features', {
  type: 'feature',
	description: 'list of features',
  params: [
    { id: 'features', type: 'feature[]', flattenArray: true, dynamic: true },
  ],
  impl: (ctx,features) =>
    features()
})


jb.component('feature.init', {
  type: 'feature', category: 'lifecycle',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,action) => ({ init: cmp =>
      action(cmp.ctx)
  })
})

jb.component('feature.after-load', {
  type: 'feature', category: 'lifecycle',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ afterViewInit: cmp =>
      jb.delay(1).then(_ => ctx.params.action(cmp.ctx))
    })
})

jb.component('feature.if', {
  type: 'feature', category: 'feature:85',
	description: 'adds element to dom by condition. no watch',
  params: [
    { id: 'showCondition', essential: true, dynamic: true },
  ],
  impl: (ctx, condition,watch) => ({
    templateModifier: (vdom,cmp,state) =>
        jb.toboolean(condition()) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
	description: 'adds display:none to element by condition. no watch',
  params: [
    { id: 'showCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp,state) => {
      if (!showCondition(cmp.ctx))
        jb.path(vdom,['attributes','style','display'],'none')
      return vdom;
    }
  })
})

jb.component('conditional-class', {
  type: 'feature',
	description: 'toggle class by condition',
  params: [
    { id: 'cssClass', as: 'string', essential: true, dynamic: true },
    { id: 'condition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp,state) => {
      if (cond())
        jb.ui.addClassToVdom(vdom,cssClass())
    }
  })
})

jb.component('feature.hover-title', {
  type: 'feature',
	description: 'set element title, usually shown by browser on hover',
  params: [
    { id: 'title', as: 'string', dynamic: true },
  ],
  impl: (ctx, title) => ({
    templateModifier: (vdom,cmp,state) => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.title = title()
      return vdom;
    }
  })
})

jb.component('feature.keyboard-shortcut', {
  type: 'feature', category: 'events',
	description: 'listen to events at the document level even when the component is not active',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true }
  ],
  impl: (context,key,action) => ({
      afterViewInit: cmp =>
        jb.rx.Observable.fromEvent(cmp.base.ownerDocument, 'keydown')
            .takeUntil( cmp.destroyed )
            .subscribe(event=>{
              var keyStr = key.split('+').slice(1).join('+');
              var keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              var helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
            })
      })
})

jb.component('feature.onHover', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,code) => ({
      onmouseenter: true,
      afterViewInit: cmp=>
        cmp.onmouseenter.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)())
  })
})

jb.component('feature.onKey', {
  type: 'feature', category: 'events',
  params: [
    { id: 'code', as: 'number' },
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,code) => ({
      onkeydown: true,
      afterViewInit: cmp=> {
        cmp.base.setAttribute('tabIndex','0');
        cmp.onkeydown.filter(e=> e.keyCode == code).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)())
      }
  })
})

jb.component('feature.onEnter', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 13, action :{$call: 'action'}}
})

jb.component('feature.onEsc', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 27, action :{$call: 'action'}}
})

jb.component('feature.onDelete', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 46, action :{$call: 'action'}}
})


jb.component('group.auto-focus-on-first-input', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          var elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          elem && jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx);
        }
  })
})
;

jb.component('css', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'css', essential: true, as: 'string' },
  ],
  impl: (context,css) =>
    ({css:css})
})

jb.component('css.class', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'class', essential: true, as: 'string' },
  ],
  impl: (context,clz) =>
    ({class :clz})
})

jb.component('css.width', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'width', essential: true, as: 'number' },
    { id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    { id: 'minMax', as: 'string', options: ',min,max'},
    { id: 'selector', as: 'string' },
],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${width}px ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'height', essential: true, as: 'number' },
    { id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    { id: 'minMax', as: 'string', options: ',min,max'},
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${height}px ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.opacity', {
  type: 'feature',
  params: [
    { id: 'opacity', essential: true, as: 'number', min:0, max:1, step: 0.1 },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

jb.component('css.padding', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'top', as: 'number' },
    { id: 'left', as: 'number' },
    { id: 'right', as: 'number' },
    { id: 'bottom', as: 'number' },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `padding-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'top', as: 'number' },
    { id: 'left', as: 'number' },
    { id: 'right', as: 'number' },
    { id: 'bottom', as: 'number' },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.transform-rotate', {
  type: 'feature',
  params: [
    { id: 'angle', as: 'number', defaultValue: 0, from: 0, to: 360 },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:rotate(${ctx.params.angle}deg)}`};
  }
})

jb.component('css.color', {
  type: 'feature',
  params: [
		{ id: 'color', as: 'string' },
		{ id: 'background', as: 'string' },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx,color) => {
		var css = ['color','background']
      .filter(x=>ctx.params[x])
      .map(x=> `${x}: ${ctx.params[x]}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

jb.component('css.transform-scale', {
  type: 'feature',
  params: [
    { id: 'x', as: 'number', defaultValue: 100 },
    { id: 'y', as: 'number', defaultValue: 100 },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:scale(${ctx.params.x/100},${ctx.params.y/100})}`};
  }
})

jb.component('css.box-shadow', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'blurRadius', as: 'number', defaultValue: 5 },
    { id: 'spreadRadius', as: 'number', defaultValue: 0 },
    { id: 'shadowColor', as: 'string', defaultValue: '#000000'},
    { id: 'opacity', as: 'number', min: 0, max: 1, defaultValue: 0.75, step: 0.01 },
    { id: 'horizontal', as: 'number', defaultValue: 10},
    { id: 'vertical', as: 'number', defaultValue: 10},
    { id: 'selector', as: 'string' },
  ],
  impl: (context,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    var color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${horizontal}px ${vertical}px ${blurRadius}px ${spreadRadius}px rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'width',as: 'number', defaultValue: 1},
    { id: 'side', as: 'string', options: 'top,left,bottom,right' },
    { id: 'style', as: 'string', options: 'solid,dotted,dashed,double,groove,ridge,inset,outset', defaultValue: 'solid'},
    { id: 'color', as: 'string', defaultValue: 'black' },
    { id: 'selector', as: 'string' },
  ],
  impl: (context,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${width}px ${style} ${color} }`})
})
;

jb.component('open-dialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'style', type: 'dialog.style', dynamic: true, defaultValue: { $:'dialog.default' } },
		{ id: 'content', type: 'control', dynamic: true, defaultValue :{$: 'group'}, forceDefaultCreation: true },
		{ id: 'menu', type: 'control', dynamic: true },
		{ id: 'title', as: 'renderable', dynamic: true  },
		{ id: 'onOK', type: 'action', dynamic: true },
		{ id: 'modal', type: 'boolean', as: 'boolean' },
		{ id: 'features', type: 'dialog-feature[]', dynamic: true }
	],
	impl: function(context,id) {
		var modal = context.params.modal;
		var dialog = {
			id: id,
      instanceId: context.id,
			modal: modal,
			em: new jb.rx.Subject(),
		};

		var ctx = context.setVars({
			$dialog: dialog,
			formContainer: { err: ''}
		});
		dialog.comp = jb.ui.ctrl(ctx,{
			beforeInit: cmp => {
				cmp.dialog = dialog;

				cmp.state.title = ctx.params.title(ctx);
				try {
					cmp.state.contentComp = ctx.params.content(cmp.ctx).reactComp();
					cmp.hasMenu = !!ctx.params.menu.profile;
					if (cmp.hasMenu)
						cmp.menuComp = ctx.params.menu(cmp.ctx).reactComp();
				} catch (e) {
					jb.logException(e,'dialog',ctx);
				}
				dialog.onOK = ctx2 =>
					context.params.onOK(cmp.ctx.extendVars(ctx2));
				cmp.dialogClose = args =>
					dialog.close(args);
				cmp.recalcTitle = (e,srcCtx) =>
					jb.ui.setState(cmp,{title: ctx.params.title(ctx)},e,srcCtx)
			},
			afterViewInit: cmp => {
				cmp.dialog.el = cmp.base;
				cmp.dialog.el.style.zIndex = 100;
			},
		}).reactComp();

		if (!context.probe)
			jb.ui.dialogs.addDialog(dialog,ctx);
		else
			jb.studio.probeResEl = jb.ui.render(jb.ui.h(dialog.comp), jb.studio.probeEl || document.createElement('div'), jb.studio.probeResEl);

		return dialog;
	}
})

jb.component('dialog.close-containing-popup', {
	type: 'action',
	params: [
		{ id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
	],
	impl: (context,OK) =>
		context.vars.$dialog && context.vars.$dialog.close({OK:OK})
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},state.title),
			h('button',{class: 'dialog-close', onclick:
				_=> cmp.dialogClose() },'×'),
			h(state.contentComp),
		]),
		features:{$:'dialog-feature.drag-title'}
	}
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},[
			h(state.contentComp),
		]),
      features: [
       { $: 'dialog-feature.max-zIndex-on-click' },
       { $: 'dialog-feature.close-when-clicking-outside' },
       { $: 'dialog-feature.css-class-on-launching-element' },
       { $: 'dialog-feature.near-launcher-position' }
      ],
      css: '{ position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }'
  }
})


jb.component('dialog-feature.unique-dialog', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'remeberLastLocation', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,id,remeberLastLocation) {
		if (!id) return;
		var dialog = context.vars.$dialog;
		dialog.id = id;
		dialog.em.filter(e=>
			e.type == 'new-dialog')
			.subscribe(e=> {
				if (e.dialog != dialog && e.dialog.id == id )
					dialog.close();
		})
	}
})

jb.component('dialog-feature.keyboard-shortcut', {
  type: 'dialog-feature',
  params: [
    { id: 'shortcut', as: 'string', description: 'Ctrl+C or Alt+V' },
    { id: 'action', type: 'action', dynamic: true },
  ],
  impl: (ctx,key,action) => ({
  	  onkeydown : true,
      afterViewInit: cmp=> {
		var dialog = ctx.vars.$dialog;
		dialog.applyShortcut = e=> {
			var key = ctx.params.shortcut;
			if (!key) return;
			if (key.indexOf('-') > 0)
				key = key.replace(/-/,'+');
            var keyCode = key.split('+').pop().charCodeAt(0);
            if (key == 'Delete') keyCode = 46;
            if (key.match(/\+[Uu]p$/)) keyCode = 38;
            if (key.match(/\+[Dd]own$/)) keyCode = 40;
            if (key.match(/\+Right$/)) keyCode = 39;
            if (key.match(/\+Left$/)) keyCode = 37;

            if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
            if (key.match(/^[Aa]lt/) && !e.altKey) return;
            if (e.keyCode == keyCode)
                return ctx.params.action();
		};

	    cmp.onkeydown.filter(e=> e.keyCode != 17 && e.keyCode != 18) // ctrl ot alt alone
   	  		.subscribe(e=>
   	  			dialog.applyShortcut(e))

	}})
})

jb.component('dialog-feature.near-launcher-position', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number', defaultValue: 0 },
		{ id: 'offsetTop', as: 'number' , defaultValue: 0 },
		{ id: 'rightSide', as: 'boolean' },
	],
	impl: function(context,offsetLeft,offsetTop,rightSide) {
		return {
			afterViewInit: function(cmp) {
				offsetLeft = offsetLeft || 0; offsetTop = offsetTop || 0;
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				var control = context.vars.$launchingElement.el;
				var pos = jb.ui.offset(control);
				var jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
				offsetLeft += rightSide ? jb.ui.outerWidth(control) : 0;
				var fixedPosition = fixDialogOverflow(control,jbDialog,offsetLeft,offsetTop);
        jbDialog.style.display = 'block';
        jbDialog.style.left = (fixedPosition ? fixedPosition.left : pos.left + offsetLeft) + 'px';
        jbDialog.style.top = (fixedPosition ? fixedPosition.top : pos.top + jb.ui.outerHeight(control) + offsetTop) + 'px';
			}
		}

		function fixDialogOverflow(control,dialog,offsetLeft,offsetTop) {
			var padding = 2,top,left,control_offset = jb.ui.offset(control), dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
			if (control_offset.top > dialog_height && control_offset.top + dialog_height + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
				top = control_offset.top - dialog_height;
			if (control_offset.left > dialog_width && control_offset.left + dialog_width + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
				left = control_offset.left - dialog_width;
			if (top || left)
				return { top: top || control_offset.top , left: left || control_offset.left}
		}
	}
})

jb.component('dialog-feature.onClose', {
	type: 'dialog-feature',
	params: [
		{ id: 'action', type: 'action', dynamic: true}
	],
	impl: (ctx,action) =>
		ctx.vars.$dialog.em
			.filter(e => e.type == 'close')
			.take(1)
			.subscribe(e=>
				action(ctx.setData(e.OK)))
})

jb.component('dialog-feature.close-when-clicking-outside', {
	type: 'dialog-feature',
	params: [
		{ id: 'delay', as: 'number', defaultValue: 100 }
	],
	impl: function(context,delay) {
		var dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before
			var clickoutEm = jb.rx.Observable.fromEvent(document, 'mousedown');
			if (jb.studio.previewWindow)
				clickoutEm = clickoutEm.merge(jb.rx.Observable.fromEvent(
			      				(jb.studio.previewWindow || {}).document, 'mousedown'));

		 	clickoutEm.filter(e => jb.ui.closest(e.target,'.jb-dialog') == null)
   				.takeUntil(dialog.em.filter(e => e.type == 'close'))
   				.take(1).delay(delay).subscribe(()=>
		  			dialog.close())
  		})
	}
})

jb.component('dialog.close-dialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'delay', as: 'number', defaultValue: 200 },
	],
	impl: (ctx,id,delay) =>
		jb.ui.dialogs.dialogs.filter(d=>d.id == id)
  			.forEach(d=>jb.delay(delay).then(d.close()))
})

jb.component('dialog.close-all-popups', {
	type: 'action',
	impl: ctx =>
		jb.ui.dialogs.dialogs.filter(d=>d.isPopup)
  			.forEach(d=>d.close())
})

jb.component('dialog.close-all', {
	type: 'action',
	impl: ctx =>
		jb.ui.dialogs.dialogs.forEach(d=>d.close())
})

jb.component('dialog-feature.auto-focus-on-first-input', {
	type: 'dialog-feature',
	params: [
		{ id: 'selectText', as: 'boolean' }
	],
	impl: (ctx,selectText) => ({
		afterViewInit: cmp => {
			jb.delay(1).then(_=> {
				var elem = ctx.vars.$dialog.el.querySelector('input,textarea,select');
				if (elem)
					jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
				if (selectText)
					elem.select();
			})
		}
	})
})

jb.component('dialog-feature.css-class-on-launching-element', {
	type: 'dialog-feature',
	impl: context => ({
		afterViewInit: cmp => {
			var dialog = context.vars.$dialog;
			var control = context.vars.$launchingElement.el;
			jb.ui.addClass(control,'dialog-open');
			dialog.em.filter(e=>
				e.type == 'close')
				.take(1)
				.subscribe(()=>
          jb.ui.removeClass(control,'dialog-open'))
		}
	})
})

jb.component('dialog-feature.max-zIndex-on-click', {
	type: 'dialog-feature',
	params: [
		{ id: 'minZIndex', as: 'number'}
	],
	impl: function(context,minZIndex) {
		var dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.el.onmousedown = setAsMaxZIndex;
			}
		})

		function setAsMaxZIndex() {
			var maxIndex = jb.ui.dialogs.dialogs.reduce(function(max,d) {
				return Math.max(max,(d.el && parseInt(d.el.style.zIndex || 100)+1))
			}, minZIndex || 100)
			dialog.el.style.zIndex = maxIndex;
		}
	}
})

jb.component('dialog-feature.drag-title', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' }
	],
	impl: function(context, id) {
		var dialog = context.vars.$dialog;
		return {
		       css: '>.dialog-title { cursor: pointer }',
		       afterViewInit: function(cmp) {
		       	  var titleElem = cmp.base.querySelector('.dialog-title');
		       	  cmp.mousedownEm = jb.rx.Observable.fromEvent(titleElem, 'mousedown')
		       	  	.takeUntil( cmp.destroyed );

				  if (id && sessionStorage.getItem(id)) {
						var pos = JSON.parse(sessionStorage.getItem(id));
					    dialog.el.style.top  = pos.top  + 'px';
					    dialog.el.style.left = pos.left + 'px';
				  }

				  var mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
				  var mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );

				  if (jb.studio.previewWindow) {
				  	mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
				  		.takeUntil( cmp.destroyed );
				  	mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
				  		.takeUntil( cmp.destroyed );
				  }

				  var mousedrag = cmp.mousedownEm
				  		.do(e =>
				  			e.preventDefault())
				  		.map(e =>  ({
				          left: e.clientX - dialog.el.getBoundingClientRect().left,
				          top:  e.clientY - dialog.el.getBoundingClientRect().top
				        }))
				      	.flatMap(imageOffset =>
			      			 mouseMoveEm.takeUntil(mouseUpEm)
			      			 .map(pos => ({
						        top:  Math.max(0,pos.clientY - imageOffset.top),
						        left: Math.max(0,pos.clientX - imageOffset.left)
						     }))
				      	);

				  mousedrag.distinctUntilChanged().subscribe(pos => {
			        dialog.el.style.top  = pos.top  + 'px';
			        dialog.el.style.left = pos.left + 'px';
			        if (id) sessionStorage.setItem(id, JSON.stringify(pos))
			      });
			  }
	       }
	}
});

jb.component('dialog.dialog-ok-cancel', {
	type: 'dialog.style',
	params: [
		{ id: 'okLabel', as: 'string', defaultValue: 'OK' },
		{ id: 'cancelLabel', as: 'string', defaultValue: 'Cancel' },
	],
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},state.title),
			h('button',{class: 'dialog-close', onclick: _=> cmp.dialogClose() },'×'),
			h(state.contentComp),
			h('div',{class: 'dialog-buttons'},[
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: false}) },cmp.cancelLabel),
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: true}) },cmp.okLabel),
			]),
		]),
	  css: `>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }`,
	}
})

jb.component('dialog-feature.resizer', {
	type: 'dialog-feature',
  params: [
    { id: 'resizeInnerCodemirror', as: 'boolean', description: 'effective only for dialog with a single codemirror element' }
  ],
	impl: (ctx,codeMirror) => ({
					templateModifier: (vdom,cmp,state) => {
            if (vdom && vdom.nodeName != 'div') return vdom;
						vdom.children.push(jb.ui.h('img', {src: '/css/resizer.gif', class: 'resizer'}));
			      return vdom;
			    },
		      css: '>.resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }',

		      afterViewInit: function(cmp) {
		       	  var resizerElem = cmp.base.querySelector('.resizer');
		       	  cmp.mousedownEm = jb.rx.Observable.fromEvent(resizerElem, 'mousedown')
		       	  	.takeUntil( cmp.destroyed );

						  var mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
						  var mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );

						  if (jb.studio.previewWindow) {
						  	mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
						  		.takeUntil( cmp.destroyed );
						  	mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
						  		.takeUntil( cmp.destroyed );
						  }

              var codeMirrorElem,codeMirrorSizeDiff;
              if (codeMirror) {
                codeMirrorElem = cmp.base.querySelector('.CodeMirror');
                if (codeMirrorElem)
                  codeMirrorSizeDiff = codeMirrorElem.getBoundingClientRect().top - cmp.base.getBoundingClientRect().top
                    + (cmp.base.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom);
              }

						  var mousedrag = cmp.mousedownEm
						  		.map(e =>  ({
						          left: cmp.base.getBoundingClientRect().left,
						          top:  cmp.base.getBoundingClientRect().top
						        }))
						      	.flatMap(imageOffset =>
					      			 mouseMoveEm.takeUntil(mouseUpEm)
					      			 .map(pos => ({
								        top:  pos.clientY - imageOffset.top,
								        left: pos.clientX - imageOffset.left
								     }))
						      	);

						  mousedrag.distinctUntilChanged().subscribe(pos => {
					        cmp.base.style.height  = pos.top  + 'px';
					        cmp.base.style.width = pos.left + 'px';
                  if (codeMirrorElem)
                    codeMirrorElem.style.height  = (pos.top - codeMirrorSizeDiff) + 'px';
					      });
					  }
	     })
})

jb.ui.dialogs = {
 	dialogs: [],
	addDialog: function(dialog,context) {
		var self = this;
		dialog.context = context;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal && !document.querySelector('.modal-overlay'))
			jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>');

		dialog.close = function(args) {
			if (dialog.context.vars.formContainer.err && args.OK) // not closing dialog with errors
				return;
			return Promise.resolve().then(_=>{
				if (dialog.closing) return;
				dialog.closing = true;
				if (dialog.onOK && args && args.OK)
					return dialog.onOK(context)
			}).then( _ => {
				dialog.em.next({type: 'close', OK: args && args.OK});
				dialog.em.complete();

				var index = self.dialogs.indexOf(dialog);
				if (index != -1)
					self.dialogs.splice(index, 1);
				if (dialog.modal && document.querySelector('.modal-overlay'))
					document.body.removeChild(document.querySelector('.modal-overlay'));
				jb.ui.dialogs.remove(dialog);
			})
		},
		dialog.closed = _ =>
			self.dialogs.indexOf(dialog) == -1;

		this.render(dialog);
	},
	closeAll: function() {
		this.dialogs.forEach(d=>
			d.close());
	},
  getOrCreateDialogsElem() {
    if (!document.querySelector('.jb-dialogs'))
      jb.ui.addHTML(document.body,'<div class="jb-dialogs"/>');
    return document.querySelector('.jb-dialogs');
  },
  render(dialog) {
    jb.ui.addHTML(this.getOrCreateDialogsElem(),`<div id="${dialog.instanceId}"/>`);
    var elem = document.querySelector(`.jb-dialogs>[id="${dialog.instanceId}"]`);
    jb.ui.render(jb.ui.h(dialog.comp),elem);
  },
  remove(dialog) {
    var elem = document.querySelector(`.jb-dialogs>[id="${dialog.instanceId}"]`);
    if (!elem) return; // already closed due to asynch request handling and multiple requests to close
    jb.ui.render('', elem, elem.firstElementChild);// react - remove
    // jb.ui.unmountComponent(elem.firstElementChild._component);
    this.getOrCreateDialogsElem().removeChild(elem);
  }
}
;


jb.component('menu.menu', {
	type: 'menu.option',
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
		{ id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true, defaultValue: [] },
		{ id: 'optionsFilter', type: 'data', dynamic: true, defaultValue: '%%' },
	],
	impl: ctx => ({
		options: ctx2 => ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctx2))),
		title: ctx.params.title(),
		applyShortcut: function(e) {
			return this.options().reduce((res,o)=> res || (o.applyShortcut && o.applyShortcut(e)),false)
		},
		ctx: ctx
	})
})

jb.component('menu.options-group', {
	type: 'menu.option',
	params: [
		{ id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true },
	],
	impl: (ctx,options) =>
    	options()
})

jb.component('menu.dynamic-options', {
  type: 'menu.option',
  params: [
    { id: 'items', type: 'data', as: 'array', essential: true, dynamic: true },
    { id: 'genericOption', type: 'menu.option', essential: true, dynamic: true },
  ],
  impl: (ctx,items,generic) =>
    items().map(item =>
      	generic(ctx.setVars({menuData: item}).setData(item)))
})

jb.component('menu.end-with-separator', {
  type: 'menu.option',
  params: [
    { id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true },
    { id: 'separator', type: 'menu.option', as: 'array', defaultValue :{$: 'menu.separator' } },
    { id: 'title', as: 'string' }
  ],
  impl: (ctx) => {
  	var options = ctx.params.options();
  	if (options.length > 0)
  		return options.concat(ctx.params.separator)
  	return []
  }
})


jb.component('menu.separator', {
	type: 'menu.option',
	impl: ctx => ({ separator: true })
})

jb.component('menu.action', {
	type: 'menu.option',
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
		{ id: 'action', type: 'action', dynamic: true, essential: true },
		{ id: 'icon', as: 'string' },
		{ id: 'shortcut', as: 'string' },
		{ id: 'showCondition', type:'boolean', as: 'boolean', defaultValue: true }
	],
	impl: ctx =>
		ctx.params.showCondition ? ({
			leaf : ctx.params,
			action: _ => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
			title: ctx.params.title(ctx),
			applyShortcut: e=> {
				var key = ctx.params.shortcut;
				if (!key) return;
				if (key.indexOf('-') > 0)
					key = key.replace(/-/,'+');
	            var keyCode = key.split('+').pop().charCodeAt(0);
	            if (key == 'Delete') keyCode = 46;
	            if (key.match(/\+[Uu]p$/)) keyCode = 38;
	            if (key.match(/\+[Dd]own$/)) keyCode = 40;
	            if (key.match(/\+Right$/)) keyCode = 39;
	            if (key.match(/\+Left$/)) keyCode = 37;

	            if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
	            if (key.match(/^[Aa]lt/) && !e.altKey) return;
	            if (e.keyCode == keyCode) {
	            		e.stopPropagation();
	                ctx.params.action();
									return true;
	            }
			},
			ctx: ctx
		}) : null
})

// ********* actions / controls ************

jb.component('menu.control', {
  type: 'control,clickable,menu',
  params: [
  	{id: 'menu', type: 'menu.option', dynamic: true, essential: true },
    {id: 'style', type: 'menu.style', defaultValue :{$: 'menu-style.context-menu' }, dynamic: true },
		{id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
  	var menuModel = ctx.params.menu() || { options: [], ctx: ctx, title: ''};
  	return jb.ui.ctrl(ctx.setVars({
  		topMenu: ctx.vars.topMenu || { popups: []},
  		menuModel: menuModel,
  	}),{ctxForPick: menuModel.ctx })
  }
})

jb.component('menu.open-context-menu', {
  type: 'action',
  params: [
  	{id: 'menu', type: 'menu.option', dynamic: true, essential: true },
  	{id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.context-menu-popup'}  },
	{ id: 'features', type: 'dialog-feature[]', dynamic: true }
  ],
  impl :{$: 'open-dialog',
  	  style :{$call: 'popupStyle' },
      content :{$: 'menu.control' , menu :{$call: 'menu'}, style :{$: 'menu-style.context-menu'} },
  	  features :{$call: 'features' },
  }
})

// ********* styles ************

jb.component('menu-style.pulldown', {
	type: 'menu.style',
	params: [
	    { id: 'innerMenuStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.popup-as-option'}},
	    { id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	    { id: 'layout', type: 'group.style', dynamic: true, defaultValue :{$: 'itemlist.horizontal'}},
	],
  	impl :{$: 'style-by-control', __innerImplementation: true,
    	control :{$: 'itemlist',
	    	$vars: {
	    		optionsParentId: ctx => ctx.id,
	    		innerMenuStyle: ctx => ctx.componentContext.params.innerMenuStyle,
	    		leafOptionStyle: ctx => ctx.componentContext.params.leafOptionStyle,
	    	},
	    	watchItems: false,
	    	style :{$call: 'layout' },
    		items: '%$menuModel/options%',
			controls :{$: 'menu.control', menu: '%$item%', style :{$: 'menu-style.popup-thumb'} },
    		features :{$: 'menu.selection'},
		}
	}
})

jb.component('menu-style.context-menu', {
	type: 'menu.style',
	params: [
	    { id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	],
  	impl :{$: 'style-by-control', __innerImplementation: true,
    	control :{$: 'itemlist',
			$vars: {
				optionsParentId: ctx => ctx.id,
        leafOptionStyle: ctx => ctx.componentContext.params.leafOptionStyle,
			},
	    	watchItems: false,
    		items: '%$menuModel/options%',
        controls :{$: 'menu.control', menu: '%$item%', style :{$: 'menu-style.apply-multi-level'} },
    		features :{$: 'menu.selection', autoSelectFirst: true},
		}
	}
})


jb.component('menu.init-popup-menu', {
	type: 'feature',
	params: [
	    { id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.context-menu-popup' } },
	],
  	impl: ctx =>
  	({
  		destroy: cmp =>
  			cmp.closePopup()
  		,
 		afterViewInit: cmp => {
 			cmp.setState({title: ctx.vars.menuModel.title});

			cmp.mouseEnter = _ => {
				if (jb.ui.find('.context-menu-popup')[0])
					cmp.openPopup()
			};
			cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 => {
	 			cmp.ctx.vars.topMenu.popups.push(ctx.vars.menuModel);
	        	ctx2.run( {$: 'menu.open-context-menu',
	        		popupStyle: _ctx => ctx.params.popupStyle(_ctx),
	        		menu: _ctx =>
	        			ctx.vars.$model.menu()
	        	})
	        } , cmp.ctx, cmp.base );

			cmp.closePopup = _ => {
	  			jb.ui.dialogs.dialogs
	  				.filter(d=>d.id == ctx.vars.optionsParentId)
	  				.forEach(d=>d.close());
	  			cmp.ctx.vars.topMenu.popups.pop();
			};

      jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
  			if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
  				var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );

  			    keydown.filter(e=>e.keyCode == 39) // right arrow
  		    	    .subscribe(x=>{
  		        		if (ctx.vars.topMenu.selected == ctx.vars.menuModel && cmp.openPopup)
  		        			cmp.openPopup();
  		        	})
  			    keydown.filter(e=>e.keyCode == 37) // left arrow
  		    	    .subscribe(x=>{
  		        		if (cmp.ctx.vars.topMenu.popups.slice(-1)[0] == ctx.vars.menuModel) {
  		        			ctx.vars.topMenu.selected = ctx.vars.menuModel;
  		        			cmp.closePopup();
  		        		}
  		        	})
          }
      })
		}
  	})
})

jb.component('menu.init-menu-option', {
	type: 'feature',
  	impl: ctx =>
  	({
 		afterViewInit: cmp => {
			var leafParams = ctx.vars.menuModel.leaf;
	        cmp.setState({title:  leafParams.title() ,icon : leafParams.icon ,shortcut: leafParams.shortcut});
	        cmp.action = jb.ui.wrapWithLauchingElement( _ => {
				jb.ui.dialogs.dialogs.filter(d=>d.isPopup)
		  			.forEach(d=>d.close());
		  		jb.delay(50).then(_=>
	        		jb.ui.applyAfter(ctx.vars.menuModel.action(),ctx))
	        }, ctx, cmp.base);

	  		jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
				if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
					var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
				    keydown.filter(e=>e.keyCode == 13 && ctx.vars.topMenu.selected == ctx.vars.menuModel) // Enter
			    	    .subscribe(_=>
			    	    	cmp.action())
			    }
			})
		}
  	})
})

jb.component('menu-style.apply-multi-level', {
	type: 'menu.style',
	params: [
	    { id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.popup-as-option'}},
	    { id: 'leafStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	    { id: 'separatorStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-separator.line'}},
	],
  	impl: ctx => {
  		if (ctx.vars.menuModel.leaf)
  			return ctx.vars.leafOptionStyle ? ctx.vars.leafOptionStyle(ctx) : ctx.params.leafStyle();
  		else if (ctx.vars.menuModel.separator)
  			return ctx.params.separatorStyle()
  		else if (ctx.vars.innerMenuStyle)
  			return ctx.vars.innerMenuStyle(ctx)
  		else
  			return ctx.params.menuStyle();
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
//         var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.applyShortcut(e))
//       }
//     })
// })

jb.component('menu.selection', {
  type: 'feature',
  params: [
    { id: 'autoSelectFirst', type: 'boolean'},
  ],
  impl: ctx => ({
  	 onkeydown: true,
     afterViewInit: cmp => {
        cmp.base.setAttribute('tabIndex','0');
     	// putting the emitter at the top-menu only and listen at all sub menus

     	if (!ctx.vars.topMenu.keydown) {
	        ctx.vars.topMenu.keydown = cmp.onkeydown;
            jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
      	};

        var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );

        keydown.filter(e=>
              e.keyCode == 38 || e.keyCode == 40 )
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items.filter(item=>!item.separator);
              var selectedIndex = items.indexOf(ctx.vars.topMenu.selected);
              if (selectedIndex != -1)
              	return items[(selectedIndex + diff + items.length) % items.length];
	        }).subscribe(x=>{
	        	if (x)
	        		cmp.select(x);
	        })
	    keydown.filter(e=>e.keyCode == 27) // close all popups
    	    .subscribe(_=>{
		  			jb.ui.dialogs.dialogs
		  				.filter(d=>d.isPopup)
		  				.forEach(d=>d.close())
		  			cmp.ctx.vars.topMenu.popups = [];
		  			cmp.ctx.run({$:'tree.regain-focus'});
	    	})
	    cmp.select = item => {
	    	if (ctx.vars.topMenu.selected != item)
	    		cmp.setState({selected: ctx.vars.topMenu.selected = item})
	    }
	    cmp.selected = _ =>
	    	ctx.vars.topMenu.selected;

        if (ctx.params.autoSelectFirst && cmp.items[0])
            cmp.select(cmp.items[0]);
      },
	  extendItem: (cmp,vdom,data) => {
	      jb.ui.toggleClassInVdom(vdom,'selected', ctx.vars.topMenu.selected == data);
	      vdom.attributes.onmouseenter = _ =>
	      	cmp.select(data)
	  },
	  css: '>.selected { background: #bbb !important; color: #fff !important }',
    })
})

jb.component('menu-style.option-line', {
	type: 'menu-option.style',
  	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{
				class: 'line noselect', onmousedown: _ => cmp.action && cmp.action()
			},[
				h('i',{class:'material-icons'},state.icon),
				h('span',{class:'title'},state.title),
				h('span',{class:'shortcut'},state.shortcut),
		]),
		css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
			  .selected { background: #d8d8d8 }
			  >i { width: 24px; padding-left: 3px; padding-top: 3px; font-size:16px; }
			  >span { padding-top: 3px }
	          >.title { display: block; text-align: left; white-space: nowrap; }
			  >.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
        features: [
        	{$: 'mdl.ripple-effect'},
    		{$: 'menu.init-menu-option'}
        ]
	}
})

jb.component('menu.option-as-icon24', {
	type: 'menu-option.style',
  	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{
				class: 'line noselect', onclick: _ => cmp.clicked(), title: state.title
			},[
				h('i',{class:'material-icons'},state.icon),
		]),
		css: `{ display: flex; cursor: pointer; height: 24px}
			  >i { width: 24px; padding-left: 3px; padding-top: 3px; font-size:16px; }`
	}
})

jb.component('menu-style.popup-as-option', {
	type: 'menu.style',
  	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{
				class: 'line noselect', onmousedown: _ => cmp.action()
			},[
				h('span',{class:'title'},state.title),
				h('i',{class:'material-icons', onmouseenter: e => cmp.openPopup(e) },'play_arrow'),
		]),
		css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
			  >i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
	          >.title { display: block; text-align: left; padding-top: 3px; padding-left: 26px; white-space: nowrap; }
			`,
        features :{$: 'menu.init-popup-menu', popupStyle :{$: 'dialog.context-menu-popup', rightSide: true, offsetTop: -24 } },
    }
})

jb.component('menu-style.popup-thumb', {
	type: 'menu.style',
	description: 'used for pulldown',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{
				class: 'pulldown-top-menu-item',
				onmouseenter: _ =>
					cmp.mouseEnter(),
				onclick: _ => cmp.openPopup()
		},state.title),
        features :[
          {$: 'menu.init-popup-menu' },
          {$: 'mdl.ripple-effect'}
        ],
	}
})


jb.component('menu-style.toolbar', {
	type: 'menu.style',
	impl :{$: 'menu.multi-level',
		leafOptionStyle :{$: 'menu.option-as-icon24' }
	}
})

jb.component('dialog.context-menu-popup',{
	type: 'dialog.style',
	params: [
		{ id: 'offsetTop', as: 'number' },
		{ id: 'rightSide', as: 'boolean' },
	],
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup context-menu-popup pulldown-mainmenu-popup'},
				h(state.contentComp)),
			features: [
				{ $: 'dialog-feature.unique-dialog', id: '%$optionsParentId%', remeberLastLocation: false },
				{ $: 'dialog-feature.max-zIndex-on-click' },
				{ $: 'dialog-feature.close-when-clicking-outside' },
				{ $: 'dialog-feature.css-class-on-launching-element' },
				{ $: 'dialog-feature.near-launcher-position', rightSide: '%$rightSide%', offsetTop: '%$offsetTop%' }
			]
	}
})

jb.component('menu-separator.line', {
	type: 'menu-separator.style',
  	impl :{$: 'custom-style',
      template: (cmp,state,h) => h('div'),
      css: '{ margin: 6px 0; border-bottom: 1px solid #EBEBEB;}'
  }
})
;

jb.component('itemlist', {
  type: 'control', category: 'group:80,common:80',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'ref', whenNotRefferable: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('itemlist.no-container', {
  type: 'feature', category: 'group:20',
  impl: ctx => ({
    extendCtxOnce: (ctx,cmp) =>
      ctx.setVars({itemlistCntr: null})
    })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.refresh = _ =>
            cmp.setState({ctrls: cmp.calcCtrls()})

        if (ctx.vars.$model.watchItems && ctx.vars.$model.items)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        cmp.calcCtrls = _ => {
            var _items = ctx.vars.$model.items ? jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx))) : [];
            if (jb.compareArrays(_items,cmp.items))
              return cmp.state.ctrls;
            if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = _items;
            cmp.items = _items;
            return _items.slice(0,100).map(item=>
              Object.assign(controlsOfItem(item),{item:item})).filter(x=>x.length > 0);
        }

        const controlsOfItem = jb.ui.cachedMap(item =>
          ctx.vars.$model.controls(cmp.ctx.setData(item).setVars(jb.obj(ctx.vars.$model.itemVariable,item)))
            .filter(x=>x).map(c=>jb.ui.renderable(c)).filter(x=>x));
        
      },
      init: cmp => {
        cmp.state.ctrls = cmp.calcCtrls();
      },
  })
})

jb.component('itemlist.ul-li', {
  type: 'itemlist.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li',
          {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))),ctrl.item))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features:{$: 'itemlist.init'},
  },
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 0 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: 'jb-drag-parent'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('div', {class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))),ctrl.item))),

    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features:{$: 'itemlist.init'},
  }
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    { id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%' },
    { id: 'selectedToDatabind', dynamic: true ,defaultValue: '%%' },
    { id: 'databindToSelected', dynamic: true ,defaultValue: '%%' },
    { id: 'onSelection', type: 'action', dynamic: true },
    { id: 'onDoubleClick', type: 'action', dynamic: true },
    { id: 'autoSelectFirst', type: 'boolean'},
    { id: 'cssForSelected', as: 'string', defaultValue: 'background: #bbb !important; color: #fff !important' },
  ],
  impl: ctx => ({
    onclick: true,
    afterViewInit: cmp => {
        cmp.selectionEmitter = new jb.rx.Subject();
        cmp.clickEmitter = new jb.rx.Subject();

        cmp.selectionEmitter
          .merge(cmp.clickEmitter)
          .distinctUntilChanged()
          .filter(x=>x)
          .subscribe( selected => {
              writeSelectedToDatabind(selected);
              cmp.setState({selected: selected});
              ctx.params.onSelection(cmp.ctx.setData(selected));
          });

        jb.ui.refObservable(ctx.params.databind,cmp,{throw: true})
          .catch(e=>jb.ui.setState(cmp,{selected: null }) || [])
          .subscribe(e=>
            jb.ui.setState(cmp,{selected: selectedOfDatabind() },e))

        // double click
        var clickEm = cmp.clickEmitter.takeUntil( cmp.destroyed );
        clickEm.buffer(clickEm.debounceTime(250))
          .filter(buff => buff.length === 2)
          .subscribe(buff=>
            ctx.params.onDoubleClick(cmp.ctx.setData(buff[1])));

     //    cmp.jbEmitter.filter(x=> x =='after-update').startWith(jb.delay(1)).subscribe(x=>{
     //      if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1)
     //        cmp.state.selected = null;
		 // if (jb.val(ctx.params.databind))
		 // 	cmp.setState({selected: selectedOfDatabind()});
     //      if (!cmp.state.selected)
     //        autoSelectFirst()
     //    })

        function autoSelectFirst() {
          if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(ctx.params.databind))
              return cmp.selectionEmitter.next(cmp.items[0])
        }
        function writeSelectedToDatabind(selected) {
          return ctx.params.databind && jb.writeValue(ctx.params.databind,ctx.params.selectedToDatabind(ctx.setData(selected)))
        }
        function selectedOfDatabind() {
          return ctx.params.databind && jb.val(ctx.params.databindToSelected(ctx.setData(jb.val(ctx.params.databind))))
        }
        jb.delay(1).then(_=>{
           if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1)
              cmp.state.selected = null;
           if (jb.val(ctx.params.databind))
             cmp.setState({selected: selectedOfDatabind()});
           if (!cmp.state.selected)
                  autoSelectFirst()
        })
    },
    extendItem: (cmp,vdom,data) => {
      jb.ui.toggleClassInVdom(vdom,'selected',cmp.state.selected == data);
      vdom.attributes.onclick = _ =>
        cmp.clickEmitter.next(data)
    },
    css: '>.selected , >*>.selected { ' + ctx.params.cssForSelected + ' }',
  })
})

jb.component('itemlist.keyboard-selection', {
  type: 'feature',
  params: [
    { id: 'onEnter', type: 'action', dynamic: true },
    { id: 'autoFocus', type: 'boolean' }
  ],
  impl: ctx => ({
      afterViewInit: function(cmp) {
        var onkeydown = (cmp.ctx.vars.itemlistCntr && cmp.ctx.vars.itemlistCntr.keydown) || (cmp.ctx.vars.selectionKeySource && cmp.ctx.vars.selectionKeySource.keydown);
        if (!onkeydown) {
          cmp.base.setAttribute('tabIndex','0');
          onkeydown = jb.rx.Observable.fromEvent(cmp.base, 'keydown')

          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus',ctx)
        }
        cmp.onkeydown = onkeydown.takeUntil( cmp.destroyed );

        cmp.onkeydown.filter(e=> e.keyCode == 13 && cmp.state.selected)
          .subscribe(x=>
            ctx.params.onEnter(cmp.ctx.setData(cmp.state.selected)));

        cmp.onkeydown.filter(e=> !e.ctrlKey &&
              (e.keyCode == 38 || e.keyCode == 40))
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items;
              return items[(items.indexOf(cmp.state.selected) + diff + items.length) % items.length] || cmp.state.selected;
        }).subscribe(x=>
          cmp.selectionEmitter && cmp.selectionEmitter.next(x)
        )
      },
    })
})

jb.component('itemlist.drag-and-drop', {
  type: 'feature',
  params: [
  ],
  impl: ctx => ({
      afterViewInit: function(cmp) {
        var drake = dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) =>
            jb.ui.hasClass(handle,'drag-handle')
        });

        drake.on('drag', function(el, source) {
          var item = el.getAttribute('jb-ctx') && jb.ctxDictionary[el.getAttribute('jb-ctx')].data;
          if (!item) {
            var item_comp = el._component || (el.firstElementChild && el.firstElementChild._component);
            item = item_comp && item_comp.ctx.data;
          }
          el.dragged = {
            item: item,
            remove: item => cmp.items.splice(cmp.items.indexOf(item), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.item);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            var draggedIndex = cmp.items.indexOf(dropElm.dragged.item);
            var targetIndex = sibling ? jb.ui.index(sibling) : cmp.items.length;
            jb.splice(cmp.items,[[draggedIndex,1],[targetIndex-1,0,dropElm.dragged.item]],ctx);

            dropElm.dragged = null;
        });

        // ctrl + Up/Down
//        jb.delay(1).then(_=>{ // wait for the keyboard selection to register keydown
          if (!cmp.onkeydown) return;
          cmp.onkeydown.filter(e=>
            e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
            .subscribe(e=> {
              var diff = e.keyCode == 40 ? 1 : -1;
              var selectedIndex = cmp.items.indexOf(cmp.state.selected);
              if (selectedIndex == -1) return;
              var index = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
              jb.splice(cmp.items,[[selectedIndex,1],[index,0,cmp.state.selected]],ctx);
          })
//        })
      }
    })
})

jb.component('itemlist.drag-handle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: {$list: [ {$: 'css.class', class: 'drag-handle' }, {$: 'css', css:'{cursor: pointer}'} ] }
})

jb.component('itemlist.shown-only-on-item-hover', {
  type: 'feature', category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: (ctx,cssClass,cond) => ({
    class: 'jb-shown-on-item-hover',
    css: '{ display: none }'
  })
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    { id: 'space', as: 'number', defaultValue: 5}
  ],
  impl : (ctx,space) =>
    ({css: `>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})
;

(function() {

createItemlistCntr = (ctx,params) => ({
  id: params.id,
  defaultItem: params.defaultItem,
  filter_data: {},
  filters: [],
  selectedRef: ctx.exp('%$itemlistCntrData/selected%','ref'),
  selected: function(selected) {
    return (typeof selected != 'undefined') ?
      jb.writeValue(this.selectedRef,selected,this.ctx) : jb.val(this.selectedRef)
  },
  add: function(item) {
    var newItem = item || JSON.parse(JSON.stringify(this.defaultItem || {}));
    if (this.items) {
      jb.splice(this.items,[[this.items.length,0,newItem]]);
      this.selected(newItem);
    }
  },
  delete: function(item) {
    if (this.items && this.items.indexOf(item) != -1) {
      this.changeSelectionBeforeDelete();
      jb.splice(this.items,[[this.items.indexOf(item),1]]);
    }
  },
  reSelectAfterFilter: function(filteredItems) {
		if (filteredItems.indexOf(this.selected()) == -1)
      this.selected(filteredItems[0])
  },
  changeSelectionBeforeDelete: function() {
    if (this.items && this.selected) {
      var curIndex = this.items.indexOf(this.selected);
      if (curIndex == -1)
        this.selected = null;
      else if (curIndex == 0 && this.items.length > 0)
        this.selected = this.items[1];
      else if (this.items.length > 0)
        this.selected = this.items[curIndex -1];
      else
        this.selected = null;
    }
  }
})

jb.component('group.itemlist-container', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature', category: 'itemlist:80,group:70',
  params: [
    { id: 'id', as: 'string', essential: true },
    { id: 'defaultItem', as: 'single' },
    { id: 'maxItems', as: 'number' , defaultValue: 100 },
		{ id: 'initialSelection', as: 'single' },
  ],
  impl :{$list : [
    {$: 'var', name: 'itemlistCntrData', value: {$: 'object', search_pattern: '', selected: '%$initialSelection%', maxItems: '%$maxItems%' } , 
        mutable: true, globalId: 'itemlistCntrData:%$id%'},
    {$: 'var', name: 'itemlistCntr', value: ctx => createItemlistCntr(ctx,ctx.componentContext.params) },
    ctx => ({
      init: cmp => {
        var maxItemsRef = cmp.ctx.exp('%$itemlistCntrData/maxItems%','ref');
//        jb.writeValue(maxItemsRef,ctx.componentContext.params.maxItems);
        cmp.ctx.vars.itemlistCntr.maxItemsFilter = items =>
          items.slice(0,jb.tonumber(maxItemsRef));
      },
    })
  ]}
})

jb.component('itemlist.itemlist-selected', {
  type: 'feature',   category: 'itemlist:20,group:0',
  impl :{ $list : [
  			{$: 'group.data', data : '%$itemlistCntrData/selected%'},
  			{$: 'hidden', showCondition: {$notEmpty: '%$itemlistCntrData/selected%' } }
  		]}
})

jb.component('itemlist-container.add', {
  type: 'action',
  impl: ctx =>
  		ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.add()
})

jb.component('itemlist-container.delete', {
  type: 'action',
  params: [{ id: 'item', as: 'single', defaultValue: '%%'} ],
  impl: (ctx,item) =>
      ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.delete(item)
})

jb.component('itemlist-container.filter', {
  type: 'aggregator', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [{ id: 'updateCounters', as: 'boolean'} ],
  impl: (ctx,updateCounters) => {
      if (!ctx.vars.itemlistCntr) return;
      const resBeforeMaxFilter = ctx.vars.itemlistCntr.filters.reduce((items,filter) =>
                  filter(items), ctx.data || []);
      const res = ctx.vars.itemlistCntr.maxItemsFilter(resBeforeMaxFilter);
      if (ctx.vars.itemlistCntrData.countAfterFilter != res.length)
        jb.delay(1).then(_=>ctx.vars.itemlistCntr.reSelectAfterFilter(res));
      if (updateCounters) {
          jb.delay(1).then(_=>{
          jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),(ctx.data || []).length);
          jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','ref'),resBeforeMaxFilter.length);
          jb.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length);
      }) } else {
        ctx.vars.itemlistCntrData.countAfterFilter = res.length
      }
      return res;
   }
})

jb.component('itemlist-container.search', {
  type: 'control', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'title', as: 'string' , dynamic: true, defaultValue: 'Search' },
    { id: 'searchIn', as: 'string' , dynamic: true, defaultValue: {$: 'itemlist-container.search-in-all-properties'} },
    { id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/search_pattern%'},
    { id: 'style', type: 'editable-text.style', defaultValue: { $: 'editable-text.mdl-search' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx,title,searchIn,databind) =>
    jb.ui.ctrl(ctx,{
      afterViewInit: cmp => {
        if (!ctx.vars.itemlistCntr) return;

        ctx.vars.itemlistCntr.filters.push( items => {
          var toSearch = jb.val(databind) || '';
          if (typeof searchIn.profile == 'function') { // improved performance
            return items.filter(item=>toSearch == '' || searchIn.profile(item).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
          }

          return items.filter(item=>toSearch == '' || searchIn(ctx.setData(item)).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
        });
        var keydown_src = new jb.rx.Subject();
        cmp.base.onkeydown = e => {
          if ([38,40,13,27].indexOf(e.keyCode) != -1) { // stop propagation for up down arrows
            keydown_src.next(e);
            return false;  
          }
          return true;
        }
        ctx.vars.itemlistCntr.keydown = keydown_src.takeUntil(cmp.destroyed);
      }
    })
});

jb.component('itemlist-container.more-items-button', {
  type: 'control', category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'title', as: 'string' , dynamic: true, defaultValue: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeMaxFilter%)' },
    { id: 'delta', as: 'number' , defaultValue: 200 },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.href' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx,title,delta) => {
    return jb.ui.ctrl(ctx,{
      beforeInit: cmp => {
        if (!ctx.vars.itemlistCntr) return;
        var maxItemsRef = cmp.ctx.exp('%$itemlistCntrData/maxItems%','ref');
        cmp.clicked = _ =>
          jb.writeValue(maxItemsRef,jb.tonumber(maxItemsRef) + delta);
        cmp.refresh = _ =>
          cmp.setState({title: jb.val(ctx.params.title(cmp.ctx.setVars({delta: delta})))});
        jb.ui.watchRef(ctx,cmp,maxItemsRef);
      },
      init: cmp =>
        cmp.state.title = jb.val(ctx.params.title(cmp.ctx.setVars({delta: delta}))),

      templateModifier: (vdom,cmp,state) => { // hide the button when not needed
        if (cmp.ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','number') == cmp.ctx.exp('%$itemlistCntrData/countAfterFilter%','number'))
          return jb.ui.h('span');
        return vdom;
      }
    })
  }
});

jb.ui.extractPropFromExpression = exp => { // performance for simple cases such as %prop1%
  if (exp.match(/^%.*%$/) && !exp.match(/[./[]/))
    return exp.match(/^%(.*)%$/)[1]
}

// match fields in pattern itemlistCntrData/FLDNAME_filter to data
jb.component('itemlist-container.filter-field', {
  type: 'feature', category: 'itemlist-filter:80',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    { id: 'fieldData', dynamic: true, essential: true },
    { id: 'filterType', type: 'filter-type' },
  ],
  impl: (ctx,fieldData,filterType) => ({
      afterViewInit: cmp => {
        var propToFilter = jb.ui.extractPropFromExpression(ctx.params.fieldData.profile);
        if (propToFilter)
          cmp.itemToFilterData = item => item[propToFilter];
        else
          cmp.itemToFilterData = item => fieldData(ctx.setData(item));

        ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.filters.push(items=>{
            var filterValue = cmp.jbModel();
            if (!filterValue) return items;
            var res = items.filter(item=>filterType.filter(filterValue,cmp.itemToFilterData(item)) );
            if (filterType.sort && (!cmp.state.sortOptions || cmp.state.sortOptions.length == 0) )
              filterType.sort(res,cmp.itemToFilterData,filterValue);
            return res;
        })
    }
  })
});

jb.component('filter-type.text', {
  type: 'filter-type',
  params: [
    { id: 'ignoreCase', as: 'boolean', defaultValue: true }
  ],
  impl: (ctx,ignoreCase) => ignoreCase ? ({
    filter: (filter,data) => (data||'').toLowerCase().indexOf((filter||'').toLowerCase()) != -1,
    sort: (items,itemToData,filter) =>  {
      var asWord = new RegExp('\\b' + filter + '\\b','i');
      var score = txt => (asWord.test(txt) ? 5 : 0) + (txt.toLowerCase().indexOf(filter.toLowerCase()) == 0 ? 3 : 0); // higher score for wholeWord or beginsWith
      items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
    }
  }) : ({
    filter: (filter,data) => (data||'').indexOf(filter||'') != -1,
    sort: (items,itemToData,filter) =>  {
      var asWord = new RegExp('\\b' + filter + '\\b');
      var score = txt => (asWord.test(txt) ? 5 : 0) + (txt.indexOf(filter) == 0 ? 3 : 0);
      items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
    }
  })
})

jb.component('filter-type.exact-match', {
  type: 'filter-type',
  impl: ctx => ({
    filter: (filter,data) =>  {
      var _filter = (filter||'').trim(), _data = (data||'').trim();
      return _data.indexOf(_filter) == 0 && _data.length == _filter.length;
    }
  })
})

jb.component('filter-type.numeric', {
  type: 'filter-type',
  impl: ctx => ({
    filter: (filter,data) => Number(data) >= Number(filter),
    sort: (items,itemToData) => items.sort((item1,item2)=> Number(itemToData(item1)) - Number(itemToData(item2)))
  })
})

jb.component('itemlist-container.search-in-all-properties', {
  type: 'data', category: 'itemlist-filter:40',
  impl: ctx => {
    if (typeof ctx.data == 'string') return ctx.data;
    if (typeof ctx.data != 'object') return '';
    return jb.entries(ctx.data).map(e=>e[1]).filter(v=>typeof v == 'string').join('#');
   }
})


})()
;

jb.component('picklist', {
  type: 'control', category: 'input:80',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref'},
    { id: 'options', type: 'picklist.options', dynamic: true, essential: true, defaultValue: {$ : 'picklist.optionsByComma'} },
    { id: 'promote', type: 'picklist.promote', dynamic: true },
    { id: 'style', type: 'picklist.style', defaultValue: { $: 'picklist.native' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      beforeInit: function(cmp) {
        cmp.recalcOptions = function() {
          var options = ctx.params.options(ctx);
          var groupsHash = {};
          var promotedGroups = (ctx.params.promote() || {}).groups || [];
          var groups = [];
          options.filter(x=>x.text).forEach(o=>{
            var groupId = groupOfOpt(o);
            var group = groupsHash[groupId] || { options: [], text: groupId};
            if (!groupsHash[groupId]) {
              groups.push(group);
              groupsHash[groupId] = group;
            }
            group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
          })
          groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
          jb.ui.setState(cmp,{
            groups: groups,
            options: options,
            hasEmptyOption: options.filter(x=>!x.text)[0]
          })
        }
        cmp.recalcOptions();
        jb.ui.refObservable(ctx.params.databind,cmp).subscribe(e=>
          cmp.onChange && cmp.onChange(jb.val(e.ref)))
      },
    })
})

function groupOfOpt(opt) {
  if (!opt.group && opt.text.indexOf('.') == -1)
    return '---';
  return opt.group || opt.text.split('.').shift();
}

jb.component('picklist.dynamic-options', {
  type: 'feature',
  params: [
    { id: 'recalcEm', as: 'single'}
  ],
  impl: (ctx,recalcEm) => ({
    init: cmp =>
      recalcEm && recalcEm.subscribe &&
        recalcEm.takeUntil( cmp.destroyed )
        .subscribe(e=>
            cmp.recalcOptions())
  })
})

jb.component('picklist.onChange', {
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    { id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,action) => ({
    init: cmp =>
      cmp.onChange = val => action(ctx.setData(val))
  })
})

// ********* options

jb.component('picklist.optionsByComma',{
  type: 'picklist.options',
  params: [
    { id: 'options', as: 'string', essential: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
});

jb.component('picklist.options',{
  type: 'picklist.options',
  params: [
    { id: 'options', type: 'data', as: 'array', essential: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.coded-options',{
  type: 'picklist.options',
  params: [
    { id: 'options', as: 'array',essential: true },
    { id: 'code', as: 'string', dynamic:true , essential: true },
    { id: 'text', as: 'string', dynamic:true, essential: true } ,
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,code,text,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(function(option) {
      return {
        code: code(null,option), text: text(null,option)
      }
    }))
  }
})

jb.component('picklist.sorted-options', {
  type: 'picklist.options',
  params: [
    { id: 'options', type: 'picklist.options', dynamic: true, essential: true, composite: true },
    { id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50' },
  ],
  impl: (ctx,optionsFunc,marks) => {
    var options = optionsFunc() || [];
    marks.forEach(mark=> {
        var option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

jb.component('picklist.promote',{
  type: 'picklist.promote',
  params: [
    { id: 'groups', as: 'array'},
    { id: 'options', as: 'array'},
  ],
  impl: (context,groups,options) =>
    ({ groups: groups, options: options})
});
;

jb.type('theme');

jb.component('group.theme', {
  type: 'feature',
  params: [
    { id: 'theme', type: 'theme' },
  ],
  impl: (context,theme) => ({
    extendCtxOnce: (ctx,cmp) => 
      ctx.setVars(theme)
  })
})

jb.component('theme.material-design', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdl-input'
  })
})
;


jb.component('material-icon', {
	type: 'control', category: 'control:50',
	params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'title', as: 'string' },
		{ id: 'style', type: 'icon.style', dynamic: true, defaultValue :{$: 'icon.material' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: ctx =>
		jb.ui.ctrl(ctx,{init: cmp=> cmp.state.icon = ctx.params.icon})
})

jb.component('icon.icon-in-button', {
    type: 'icon-with-action.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('button',{ class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect', onclick: ev => cmp.clicked(ev) },
		      h('i',{ class: 'material-icons' }, state.icon)),
    }
})

jb.component('icon.material', {
    type: 'icon-with-action.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('i',{ class: 'material-icons' }, state.icon),
    }
})
;

jb.component('editable-number.slider-no-text', {
  type: 'editable-number.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('input',{ type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: -1}),
      features :[
          {$: 'field.databind-range' },
          {$: 'slider.init'},
      ],
  }
})

jb.component('editable-number.slider', {
  type: 'editable-number.style',
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'editableNumberModel',
    control :{$: 'group',
      title: '%$editableNumberModel/title%',
      controls :{$: 'group',
        style: {$: 'layout.horizontal', spacing: 20},
        controls: [
          {$: 'editable-text',
              databind: '%$editableNumberModel/databind%',
              style: {$: 'editable-text.mdl-input-no-floating-label', width: 36 },
              features: [
                {$: 'slider-text.handleArrowKeys' },
                { $: 'css.margin', top : -3}
              ],
          },
          {$: 'editable-number',
              databind: '%$editableNumberModel/databind%',
              style :{$: 'editable-number.slider-no-text'},
              features: {$: 'css.width', width: 80},
          },
        ],
        features: {$: 'var', name: 'sliderCtx', value: {$: 'object'}}
      }
    }
  }
})

jb.component('slider.init', {
  type: 'feature',
  impl: ctx => ({
      onkeyup: true,
      onkeydown: true,
      onmouseup: true,
      onmousedown: true,
      onmousemove: true,
      init: cmp =>
        cmp.refresh =  _=> {
          var val = cmp.jbModel() !=null && Number(cmp.jbModel());
          cmp.max = Math.max.apply(0,[ctx.vars.$model.max,val,cmp.max].filter(x=>x!=null));
          cmp.min = Math.min.apply(0,[ctx.vars.$model.min,val,cmp.min].filter(x=>x!=null));
          if (val == cmp.max && ctx.vars.$model.autoScale)
            cmp.max += cmp.max - cmp.min;
          if (val == cmp.min && ctx.vars.$model.autoScale)
            cmp.min -= cmp.max - cmp.min;

          jb.ui.setState(cmp,{ min: cmp.min, max: cmp.max, step: ctx.vars.$model.step, val: cmp.jbModel() },null,ctx);
        },

      afterViewInit: cmp => {
          cmp.refresh();

          cmp.handleArrowKey = e => {
              var val = Number(cmp.jbModel()) || 0;
              if (e.keyCode == 46) // delete
                jb.writeValue(ctx.vars.$model.databind,null);
              if ([37,39].indexOf(e.keyCode) != -1) {
                var inc = e.shiftKey ? 9 : 1;
                if (val !=null && e.keyCode == 39)
                  cmp.jbModel(Math.min(cmp.max,val+inc));
                if (val !=null && e.keyCode == 37)
                  cmp.jbModel(Math.max(cmp.min,val-inc));
              }
          }

          cmp.onkeydown.subscribe(e=>
              cmp.handleArrowKey(e));

          // drag
          cmp.onmousedown.flatMap(e=>
            cmp.onmousemove.takeUntil(cmp.onmouseup)
            ).subscribe(e=>cmp.jbModel(cmp.base.value))

          if (ctx.vars.sliderCtx) // supporting left/right arrow keys in the text field as well
            ctx.vars.sliderCtx.handleArrowKey = e => cmp.handleArrowKey(e);
        }
    })
})

jb.component('slider-text.handleArrowKeys', {
  type: 'feature',
  impl: ctx => ({
      onkeyup: true,
      onkeydown: true,
      afterViewInit: cmp => {
          jb.delay(1).then(_=>{
            var sliderCtx = ctx.vars.sliderCtx;
            if (sliderCtx)
              cmp.onkeydown.subscribe(e=>
                  sliderCtx.handleArrowKey(e));
          })
      }
    })
})

jb.component('slider.edit-as-text-popup', {
  type: 'feature',
  impl :{$: 'open-dialog',
    style :{$: 'dialog.popup' },
    content :{$: 'group',
      title: 'data-settings',
      style :{$: 'layout.vertical', spacing: 3 },
      controls: [
        {$: 'editable-text',
          title: '%title%',
          databind: '%databind%',
          style :{$: 'editable-text.mdl-input', width: '270' },
          features :{$: 'feature.onEnter',
            action :{$: 'dialog.close-containing-popup' }
          },
        },
      ],
      features: [
        {$: 'group.data', data: '%$editableNumber%' },
        {$: 'css.padding', left: '10', right: '10' }
      ]
    },
    features: [
        { $: 'dialog-feature.unique-dialog', id: 'slider', remeberLastLocation: false },
        { $: 'dialog-feature.max-zIndex-on-click' },
        { $: 'dialog-feature.close-when-clicking-outside' },
        { $: 'dialog-feature.css-class-on-launching-element' },
        { $: 'dialog-feature.near-launcher-position' },
        {$: 'dialog-feature.auto-focus-on-first-input', selectText: true },
      ]
  },
})


jb.component('editable-number.mdl-slider', {
  type: 'editable-number.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('input',{class:'mdl-slider mdl-js-slider', type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: 0}),
      features :[
          {$: 'field.databind' },
          {$: 'slider.init'},
          {$: 'mdl-style.init-dynamic' }
      ],
  }
})
;

jb.component('table', {
  type: 'control,table', category: 'group:80,common:70',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'ref', whenNotRefferable: 'array' , dynamic: true, essential: true },
    { id: 'fields', type: 'table-field[]', essential: true, dynamic: true },
    { id: 'style', type: 'table.style', dynamic: true , defaultValue: { $: 'table.with-headers' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default table is limmited to 100 shown items' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('field', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'data', as: 'string', essential: true, dynamic: true },
    { id: 'width', as: 'number' },
    { id: 'numeric', as: 'boolean', type: 'boolean' },
    { id: 'extendItems', as: 'boolean', type: 'boolean', description: 'extend the items with the calculated field using the title as field name' },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,data,width,numeric,extendItems,_class) => ({
    title: title,
    fieldData: row => extendItems ? row[title] : data(ctx.setData(row)),
    calcFieldData: row => data(ctx.setData(row)),
    class: _class,
    width: width,
    numeric: numeric, 
    extendItems: extendItems,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.index', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', defaultValue: 'index' },
    { id: 'width', as: 'number', defaultValue: 10 },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,propName,width_class) => ({
    title: title,
    fieldData: (row,index) => index,
    class: _class,
    width: width,
    numeric: true, 
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.control', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'control', type: 'control' , dynamic: true, essential: true, defaultValue: {$: 'label', title: ''} },
    { id: 'width', as: 'number' },
    { id: 'dataForSort', dynamic: true },
    { id: 'numeric', as: 'boolean', type: 'boolean' },
  ],
  impl: (ctx,title,control,width,dataForSort,numeric) => ({
    title: title,
    control: row => control(ctx.setData(row)).reactComp(),
    width: width,
    fieldData: row => dataForSort(ctx.setData(row)),
    numeric: numeric, 
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.button', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'buttonText', as: 'string', essential: true, dynamic: true },
    { id: 'action', type: 'action', essential: true, dynamic: true },

    { id: 'width', as: 'number' },
    { id: 'dataForSort', dynamic: true },
    { id: 'numeric', as: 'boolean', type: 'boolean' },

    { id: 'style', type: 'table-button.style', defaultValue: { $: 'table-button.href' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
    var ctrl = jb.ui.ctrl(ctx,{
      beforeInit: (cmp,props) => {
        cmp.state.title = ctx.params.buttonText(ctx.setData(props.row));
      },
      afterViewInit : cmp=>
        cmp.clicked = _ => ctx.params.action(cmp.ctx.setData(cmp.props.row).setVars({ $launchingElement: { el : cmp.base }}))
    }).reactComp();

    return {
      title: ctx.params.title,
      control: _ => ctrl,
      width: ctx.params.width,
      fieldData: row => dataForSort(ctx.setData(row)),
      numeric: ctx.params.numeric, 
      ctxId: jb.ui.preserveCtx(ctx)
    }
  }
})

// todo - move to styles

jb.component('table-button.href', {
  type: 'button.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: ev => cmp.clicked(ev)}, state.title),
        css: `{color: grey}`
    }
})

jb.component('table.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {

        cmp.fields = ctx.vars.$model.fields();
        cmp.state.items = calcItems();

        cmp.refresh = _ =>
            cmp.setState({items: calcItems()})

        if (ctx.vars.$model.watchItems)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          extendItemsWithCalculatedFields();
          cmp.sortItems && cmp.sortItems();
          return cmp.items.slice(0,ctx.vars.$model.visualSizeLimit || 100);
        }

        function extendItemsWithCalculatedFields() {
          if (!cmp.fields || !cmp.items) return;
          cmp.fields.filter(f=>f.extendItems).forEach(f=>
            cmp.items.forEach(item=>item[f.title] = f.calcFieldData(item)))
        }
      },
  })
})

jb.component('table.init-sort', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.toggleSort = function(field) {
          var sortOptions = cmp.state.sortOptions || [];
          var option = sortOptions.filter(o=>o.field == field)[0];
          if (!option)
            sortOptions = [{field: field,dir: 'none'}].concat(sortOptions).slice(0,2);
          option = sortOptions.filter(o=>o.field == field)[0];

          var directions = ['none','asc','des'];
          option.dir = directions[(directions.indexOf(option.dir)+1)%directions.length];
          if (option.dir == 'none')
            sortOptions.splice(sortOptions.indexOf(option),1);
          cmp.setState({sortOptions: sortOptions});
          cmp.refresh();
        }
        cmp.sortItems = function() {
          if (!cmp.items || !cmp.state.sortOptions || cmp.state.sortOptions.length == 0) return;
          cmp.items.forEach((item,index)=>cmp.state.sortOptions.forEach(o=> 
              item['$jb_$sort_'+o.field.title] = o.field.fieldData(item,index)));
          var major = cmp.state.sortOptions[0], minor = cmp.state.sortOptions[1];
          if (!minor)
            cmp.items.sort(sortFunc(major))
          else {
            var compareMajor = sortFunc(major), compareMinor = sortFunc(minor);
            var majorProp = '$jb_$sort_'+ major.field.title;
            cmp.items.sort((x,y)=> x[majorProp] == y[majorProp] ? compareMinor(x,y) : compareMajor(x,y) );
          }

          function sortFunc(option) {
            var prop = '$jb_$sort_'+ option.field.title;
            if (option.field.numeric)
              var SortFunc = (x,y) => x[prop] - y[prop]
            else
              var SortFunc = (x,y) => 
                x[prop] == y[prop] ? 0 : (x[prop] < y[prop] ? -1 : 1);
            if (option.dir == 'asc') 
              return SortFunc;
            return (x,y) => SortFunc(y,x);
          }

        }
      },
  })
})
;

jb.component('tabs', {
	type: 'control', category: 'group:80',
	params: [
		{ id: 'tabs', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
		{ id: 'style', type: 'tabs.style', dynamic: true, defaultValue: { $: 'tabs.simple' } },
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('group.init-tabs', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'keyboardSupport', as: 'boolean' },
    { id: 'autoFocus', as: 'boolean' }
  ],
  impl: ctx => ({
    init: cmp => {
			cmp.tabs = ctx.vars.$model.tabs();
      cmp.titles = cmp.tabs.map(tab=>tab && tab.jb_title(ctx));
			cmp.state.shown = 0;

      cmp.show = index =>
        jb.ui.setState(cmp,{shown: index},null,ctx);

      cmp.next = diff =>
        cmp.setState({shown: (cmp.state.index + diff + cmp.ctrls.length) % cmp.ctrls.length});
    },
  })
})

jb.component('tabs.simple', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{}, [
			  h('div',{class: 'tabs-header'}, cmp.titles.map((title,index)=>
					h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect' + (index == state.shown ? ' selected-tab': ''),
						onclick: ev=>cmp.show(index)},title))),
				h('div',{class: 'tabs-content'}, h(jb.ui.renderable(cmp.tabs[state.shown]) )) ,
				]),
		css : `>.tabs-header>.selected-tab { border-bottom: 2px solid #66afe9 }
		`,
    features :[{$: 'group.init-tabs'}, {$: 'mdl-style.init-dynamic', query: '.mdl-js-button'}]
  }
})
;

jb.component('goto-url', {
	type: 'action',
	description: 'navigate/open a new web page, change href location',
	params: [
		{ id: 'url', as:'string', essential: true },
		{ id: 'target', type:'enum', values: ['new tab','self'], defaultValue:'new tab', as:'string'}
	],
	impl: (ctx,url,target) => {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		if (!ctx.probe)
			window.open(url,_target);
	}
})

jb.component('reset-wspy', {
	type: 'action',
	description: 'initalize logger',
	params: [
		{ id: 'param', as: 'string' },
	],
	impl: (ctx,param) => {
		const wspy = jb.frame.initwSpy && frame.initwSpy()
		if (wspy && wspy.enabled()) {
			wspy.resetParam(param)
			wspy.clear()
		}
	}
})
;

jb.component('mdl-style.init-dynamic', {
  type: 'feature',
  params: [
  	{id: 'query', as: 'string'}
  ],
  impl: (ctx,query) =>
    ({
      afterViewInit: cmp => {
        var elems = query ? cmp.base.querySelectorAll(query) : [cmp.base];
        cmp.refreshMdl = _ => {
          jb.delay(1).then(_ => elems.forEach(el=> {
            if (!jb.ui.inDocument(el))
              return;
            componentHandler.downgradeElements(el);
            componentHandler.upgradeElement(el);
          }))
        };
        jb.delay(1).catch(e=>{}).then(_ =>
      	 elems.forEach(el=>
      	 	jb.ui.inDocument(el) && componentHandler.upgradeElement(el))).catch(e=>{})
      },
      componentDidUpdate: cmp => {
       var input = cmp.base.querySelector('input');
       input && input.setCustomValidity && input.setCustomValidity(cmp.state.error||'');
       input && input.dispatchEvent(new Event('input'));
      },
      destroy: cmp => {
        try {
      	 typeof $ !== 'undefined' && $.contains(document.documentElement, cmp.base) &&
          (query ? cmp.base.querySelectorAll(query) : [cmp.base]).forEach(el=>
      	 	   jb.ui.inDocument(el) && componentHandler.downgradeElements(el))
        } catch(e) {}
       }
    })
})

jb.component('mdl.ripple-effect', {
  type: 'feature',
  description: 'add ripple effect to buttons',
  impl: ctx => ({
      templateModifier: (vdom,cmp,state) => {
        vdom.children.push(jb.ui.h('span',{class:'mdl-ripple'}));
        return vdom;
      },
      css: '{ position: relative; overflow:hidden }',
      afterViewInit: cmp => {
          cmp.base.classList.add('mdl-js-ripple-effect');
          jb.ui.inDocument(cmp.base) && componentHandler.upgradeElement(cmp.base);
      },
      destroy: cmp =>
          jb.ui.inDocument(cmp.base) && componentHandler.downgradeElements(cmp.base)
   }),
})


// ****** label styles

jb.component('label.mdl-ripple-effect', {
    type: 'label.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{class:'mdl-button mdl-js-button mdl-js-ripple-effect'},state.title),
        features :[
          {$: 'label.bind-title' },
          {$: 'mdl-style.init-dynamic'}
        ],
    }
});

jb.component('label.mdl-button', {
    type: 'label.style',
    params: [
      {id: 'width', as: 'number' }
    ],
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('div',{class:'mdl-button mdl-js-button'},state.title),
        features :[
          {$: 'label.bind-title' },
          {$: 'mdl-style.init-dynamic'}
        ],
        css: '{? {width:%$width%px} ?}'
    }
});
;

jb.component('button.href', {
  type: 'button.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: ev => cmp.clicked(ev)}, state.title),
        css: `{color: grey}`
    }
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    { id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{title: state.title, onclick: ev => cmp.clicked(ev)},'×'),
      css: `{
            padding: 0;
            cursor: pointer;
            font: %$size%px sans-serif;
            border: none;
            background: transparent;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            font-weight: 700;
            opacity: .2;
        }
        :hover { opacity: .5 }`
  }
})

jb.component('button.mdl-raised', {
  type: 'button.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{class: 'mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect', onclick: ev => cmp.clicked(ev)},state.title),
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-flat-ripple', {
  type: 'button.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: ev=>cmp.clicked(ev)},state.title),
      features :{$: 'mdl-style.init-dynamic'},
      css: '{ text-transform: none }'
  }
})

jb.component('button.mdl-icon', {
  type: 'button.style,icon-with-action.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1,
          onclick:  ev => cmp.clicked(ev) },
        h('i',{class: 'material-icons'},cmp.icon)
      ),
      css: `{ border-radius: 2px}
      >i {border-radius: 2px}`,
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-round-icon', {
  type: 'button.style,icon-with-action.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1,
          onclick:  ev => cmp.clicked(ev) },
        h('i',{class: 'material-icons'},cmp.icon)
      ),
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-icon-12-with-ripple', {
  type: 'button.style,icon-with-action.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1,
          onclick: ev => cmp.clicked(ev) },
        h('i',{class: 'material-icons'},cmp.icon)
      ),
      css: `>.material-icons { font-size:12px;  }`,
      features:{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-icon-12', {
  type: 'button.style,icon-with-action.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('i',{class: 'material-icons',
        onclick: ev => cmp.clicked(ev)
      },cmp.icon),
      css: `{ font-size:12px; cursor: pointer }`,
  }
})

jb.component('button.mdl-card-flat', {
  type: 'button.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('a',{class:'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect', onclick: ev=>cmp.clicked(ev)},state.title),
      features :{$: 'mdl-style.init-dynamic'},
  }
})
;

jb.component('editable-text.input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', {
        value: state.model,
        onchange: e => cmp.jbModel(e.target.value),
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
    css: '{height: 16px}'
  }
})

jb.component('editable-text.textarea', {
	type: 'editable-text.style',
  params: [
    { id: 'rows', as: 'number', defaultValue: 4 },
    { id: 'cols', as: 'number', defaultValue: 120 },
  ],
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('textarea', {
        rows: cmp.rows, cols: cmp.cols,
        value: state.model, onchange: e => cmp.jbModel(e.target.value), onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
	}
})

jb.component('editable-text.mdl-input', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style',
   template: (cmp,state,h) => h('div',{class: ['mdl-textfield','mdl-js-textfield','mdl-textfield--floating-label',state.error ? 'is-invalid' : ''].join(' ') },[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title),
        h('span',{class: 'mdl-textfield__error' }, state.error || '')
      ]),
      css: '{ {?width: %$width%px?} }',
      features :[
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-input-no-floating-label', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style',
   template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
      css: '{ {?width: %$width%px?} } :focus { border-color: #3F51B5; border-width: 2px}',
      features :[
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-search', {
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      template: (cmp,{model, fieldId, title},h) => h('div',{class:'mdl-textfield mdl-js-textfield'},[
        h('input', { class: 'mdl-textfield__input', id: 'search_' + fieldId, type: 'text',
            value: model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'search_' + fieldId}, model ? '' : title)
      ]),
      features: [
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'},
      ],
  }
})
;

jb.component('layout.vertical', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('div', {} ,h(ctrl)), ctrl.ctx.data) )),
    css: `>div { margin-bottom: %$spacing%px; display: block }
          >div:last-child { margin-bottom:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal', {
  type: 'group.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal-fixed-split', {
  type: 'group.style',
  params: [,
    { id: 'leftWidth', as: 'number', defaultValue: 200, essential: true },
    { id: 'rightWidth', as: 'number', defaultValue: 200, essential: true },
    { id: 'spacing', as: 'number', defaultValue: 3 },
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: `{display: flex}
        >*:first-child { margin-right: %$spacing%px; flex: 0 0 %$leftWidth%px; width: %$leftWidth%px; }
        >*:last-child { margin-right:0; flex: 0 0 %$rightWidth%px; width: %$rightWidth%px; }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal-wrapped', {
  type: 'group.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('span', {} ,h(ctrl)),ctrl.ctx.data) )),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.flex', {
  type: 'group.style',
  params: [
      { id: 'align', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around' },
      { id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse' },
      { id: 'wrap', as: 'string', options:',wrap' },
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: '{ display: flex; {?justify-content:%$align%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }',
    features :{$: 'group.init-group'}
  }
})

jb.component('flex-layout-container.align-main-axis', {
    type: 'feature',
    params: [
      { id: 'align', as: 'string', options: 'flex-start,flex-end,center,space-between,space-around', defaultValue: 'flex-start' }
    ],
    impl : (ctx,factor) => ({
      css: `{ justify-content: ${align} }`
    })
})

jb.component('flex-item.grow', {
    type: 'feature',
    params: [
      { id: 'factor', as: 'number', defaultValue: '1' }
    ],
    impl : (ctx,factor) => ({
      css: `{ flex-grow: ${factor} }`
    })
})

jb.component('flex-item.basis', {
    type: 'feature',
    params: [
      { id: 'factor', as: 'number', defaultValue: '1' }
    ],
    impl : (ctx,factor) => ({
      css: `{ flex-basis: ${factor} }`
    })
})

jb.component('flex-item.align-self', {
    type: 'feature',
    params: [
      { id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto' }
    ],
    impl : (ctx,align) => ({
      css: `{ align-self: ${align} }`
    })
})

// jb.component('flex-filler', {
//     type: 'control',
//     params: [
//         { id: 'title', as: 'string', defaultValue: 'flex filler' },
//         { id: 'basis', as: 'number', defaultValue: '1' },
//         { id: 'grow', as: 'number', defaultValue: '1' },
//         { id: 'shrink', as: 'number', defaultValue: '0' },
//     ],
//     impl: (ctx,title,basis,grow,shrink) => {
//       var css = [
//         `flex-basis: ${basis}`,
//         `flex-grow: ${grow}`,
//         `flex-shrink: ${shrink}`,
//       ].join('; ');

//       return jb_ui.Comp({ template: `<div style="${css}"></div>`},ctx)
//     }
// })


jb.component('responsive.only-for-phone', {
    type: 'feature',
    impl : () => ({
      cssClass: 'only-for-phone'
    })
})

jb.component('responsive.not-for-phone', {
    type: 'feature',
    impl : () => ({
      cssClass: 'not-for-phone'
    })
})
;

jb.component('group.section', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('section',{class:'jb-group'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    features:{$: 'group.init-group'}
  }
})


jb.component('group.div', {
  type: 'group.style',
	params: [
		{ id: 'groupClass', as: 'string' },
		{ id: 'itemClass', as: 'string' },
	],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: cmp.groupClass },
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl,{class: cmp.itemClass}),ctrl.ctx.data))),
    features :{$: 'group.init-group'}
  }
})

jb.component('first-succeeding.style', {
  type: 'first-succeeding.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => {
      var ctrl = state.ctrls.filter(x=>x)[0];
      return ctrl && h(ctrl)
    },
    features :{$: 'group.init-group'}
  }
})

jb.component('group.ul-li', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li', {class: 'jb-item'} ,h(ctrl)),ctrl.ctx.data))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`
  },
})

jb.component('group.expandable', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('section',{ class: 'jb-group'},[
        h('div',{ class: 'header'},[
          h('div',{ class: 'title'}, state.title),
          h('button',{ class: 'mdl-button mdl-button--icon', onclick: _=> cmp.toggle(), title: cmp.expand_title() },
            h('i',{ class: 'material-icons'}, state.show ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          )
        ])
      ].concat(state.show ? state.ctrls.map(ctrl=> h('div',{ },h(ctrl))): [])
    ),
    css: `>.header { display: flex; flex-direction: row; }
        >.header>button:hover { background: none }
        >.header>button { margin-left: auto }
        >.header.title { margin: 5px }`,
    features :[
        {$: 'group.init-group' },
        {$: 'group.init-expandable' },
      ]
    },
})

jb.component('group.init-expandable', {
  type: 'feature', category: 'group:0',
  impl: ctx => ({
        init: cmp => {
            cmp.state.show = true;
            cmp.expand_title = () => cmp.show ? 'collapse' : 'expand';
            cmp.toggle = function () { cmp.show = !cmp.show; };
        },
  })
})

jb.component('group.accordion', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('section',{ class: 'jb-group'},
        state.ctrls.map((ctrl,index)=> jb.ui.item(cmp,h('div',{ class: 'accordion-section' },[
          h('div',{ class: 'header', onclick: _=> cmp.show(index) },[
            h('div',{ class: 'title'}, ctrl.title),
            h('button',{ class: 'mdl-button mdl-button--icon', title: cmp.expand_title(ctrl) },
              h('i',{ class: 'material-icons'}, state.shown == index ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
            )
          ])].concat(state.shown == index ? [h(ctrl)] : [])),ctrl.ctx.data)
    )),
    css: `>.accordion-section>.header { display: flex; flex-direction: row; }
        >.accordion-section>.header>button:hover { background: none }
        >.accordion-section>.header>button { margin-left: auto }
        >.accordion-section>.header>.title { margin: 5px }`,
      features : [
        {$: 'group.init-group' },
        {$: 'group.init-accordion' },
      ]
    },
})

jb.component('group.init-accordion', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'keyboardSupport', as: 'boolean' },
    { id: 'autoFocus', as: 'boolean' }
  ],
  impl: ctx => ({
    onkeydown: ctx.params.keyboardSupport,
    init: cmp => {
      cmp.state.shown = 0;
      cmp.expand_title = index =>
        index == cmp.state.shown ? 'collapse' : 'expand';

      cmp.show = index =>
        cmp.setState({shown: index});

      cmp.next = diff =>
        cmp.setState({shown: (cmp.state.index + diff + cmp.ctrls.length) % cmp.ctrls.length});
    },
    afterViewInit: cmp => {
      if (ctx.params.keyboardSupport) {
        cmp.onkeydown.filter(e=> e.keyCode == 33 || e.keyCode == 34) // pageUp/Down
            .subscribe(e=>
              cmp.next(e.keyCode == 33 ? -1 : 1))
      }
    }
  })
})

jb.component('group.tabs', {
  type: 'group.style',
  params: [
    { id: 'width', as : 'number' },
  ],
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'tabsModel',
    control :{$: 'group', controls: [
      {$: 'group', title: 'thumbs',
        features :{$: 'group.init-group'},
        style :{$: 'layout.horizontal' },
        controls :{$: 'dynamic-controls',
          itemVariable: 'tab',
          controlItems : '%$tabsModel/controls%',
          genericControl: {$: 'button',
            title: '%$tab/jb_title%',
            action :{$: 'write-value', value: '%$tab%', to: '%$selectedTab%' },
            style :{$: 'button.mdl-flat-ripple' },
            features: [
              {$: 'css.width', width: '%$width%' },
              {$: 'css', css: '{text-align: left}' }
            ]
          },
        },
      },
      ctx =>
        jb.val(ctx.exp('%$selectedTab%')),
    ],
    features : [
        {$: 'var', name: 'selectedTab', value: '%$tabsModel/controls[0]%', mutable: true },
        {$: 'group.init-group'},
    ]
  }}
})

jb.component('toolbar.simple', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{class:'toolbar'},
        state.ctrls.map(ctrl=> h(ctrl))),
    css: `{
            display: flex;
            background: #F5F5F5;
            height: 33px;
            width: 100%;
            border-bottom: 1px solid #D9D9D9;
            border-top: 1px solid #fff;
        }
        >* { margin-right: 0 }`,
    features :{$: 'group.init-group'}
  }
})
;

jb.component('table.with-headers', {
  type: 'table.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('table',{},[
        h('thead',{},h('tr',{},cmp.fields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} },f.title)) )),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', { 'jb-ctx': f.ctxId, class: f.class }, f.control ? h(f.control(item),{row:item, index: index}) : f.fieldData(item,index))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ]),
    features:{$: 'table.init'},
    css: `{border-spacing: 0; text-align: left}
    >tbody>tr>td { padding-right: 5px }
    {width: 100%}
    `
  }
})

jb.component('table.mdl', {
  type: 'table.style',
  params: [
    { id: 'classForTable', as: 'string', defaultValue: 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp'},
    { id: 'classForTd', as: 'string', defaultValue: 'mdl-data-table__cell--non-numeric'},
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('table',{ class: cmp.classForTable },[
        h('thead',{},h('tr',{},cmp.fields.map(f=>h('th',{
          'jb-ctx': f.ctxId, 
          class: [cmp.classForTd]
            .concat([ 
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdl-data-table__header--sorted-ascending': '',
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdl-data-table__header--sorted-descending': '',
            ]).filter(x=>x).join(' '), 
          style: { width: f.width ? f.width + 'px' : ''},
          onclick: ev => cmp.toggleSort(f),
          }
          ,f.title)) )),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', { 'jb-ctx': f.ctxId, class: (f.class + ' ' + cmp.classForTd).trim() }, f.control ? h(f.control(item),{row:item, index: index}) : f.fieldData(item,index))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ]),
    features: [
      {$: 'table.init'},
      {$: 'table.init-sort'}
    ],
    css: `{width: 100%}`
  }
})
;


jb.component('picklist.native', {
  type: 'picklist.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('select', { value: state.model, onchange: e => cmp.jbModel(e.target.value) },
          state.options.map(option=>h('option',{value: option.code},option.text))
        ),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
::-webkit-input-placeholder { color: #999; }`
  }
})

jb.component('picklist.native-md-look', {
  type: 'picklist.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{},h('select', { value: state.model, onchange: e => cmp.jbModel(e.target.value) },
          state.options.map(option=>h('option',{value: option.code},option.text)))),
    css: `>select {  appearance: none; -webkit-appearance: none; font-family: inherit;
  background-color: transparent;
  padding: 6px 0;
  font-size: 14px;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid rgba(0,0,0, 0.12); }

  {
    font-family: 'Roboto','Helvetica','Arial',sans-serif;
    position: relative;
  }
  >select:focus { border-color: #3F51B5; border-width: 2px}

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
        border-top: .375em solid rgba(0,0,0, 0.12);
        pointer-events: none; }`
  }
})


jb.component('picklist.mdl', {
  type: 'picklist.style',
  params: [
    {id: 'noLabel', type: 'boolean', as: 'boolean'},
  ],
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('div',{ class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height'},[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model,
            readonly: true,
            tabIndex: -1
        }),
        h('label',{for: 'input_' + state.fieldId},
          h('i',{class: 'mdl-icon-toggle__label material-icons'},'keyboard_arrow_down')
        ),
//        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title),
        h('ul',{for: 'input_' + state.fieldId, class: 'mdl-menu mdl-menu--bottom-left mdl-js-menu',
            onclick: e =>
              cmp.jbModel(e.target.getAttribute('code'))
          },
          state.options.map(option=>h('li',{class: 'mdl-menu__item', code: option.code},option.text))
        )
      ]),
      css: '>label>i {float: right; margin-top: -30px;}',
      features : [ 
        {$: 'field.databind' },
        {$: 'mdl-style.init-dynamic'},
      ],
  }
})

jb.component('picklist.selection-list', {
  type: 'picklist.style',
  params: [
    { id: 'width', as : 'number' },
  ],
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'picklistModel',
    control :{$: 'itemlist',
      watchItems: false, 
      items: '%$picklistModel/options%',
      style :{ $: 'itemlist.ul-li' },
      controls :{$: 'label', 
        title: '%text%', 
        style :{$: 'label.mdl-ripple-effect' }, 
        features: [
          {$: 'css.width', width: '%$width%' }, 
          {$: 'css', css: '{text-align: left}' }
        ]
      },
      features :{$: 'itemlist.selection', 
        onSelection :{$: 'write-value', value: '%code%', to: '%$picklistModel/databind%' } 
      }
    }
  }
})

jb.component('picklist.groups', {
  type: 'picklist.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('select', { value: state.model, onchange: e => cmp.jbModel(e.target.value) },
          (state.hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            state.groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(option=>h('option',{value: option.code},option.text))
              ))
      )),
    css: `
 { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
select:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
select::-webkit-input-placeholder { color: #999; }`
  }
})
;

jb.component('property-sheet.titles-above', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 20 }
  ],
  impl :{$: 'custom-style', 
    features :{$: 'group.init-group'},
    template: (cmp,state,h) => h('div',{}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property'},[
            h('label',{ class: 'property-title'},ctrl.title),
            h(ctrl)
    ]))),
    css: `>.property { margin-bottom: %$spacing%px }
      >.property:last-child { margin-bottom:0 }
      >.property>.property-title {
        width:100px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
      }
      >.property>div { display:inline-block }`
  }
})

jb.component('property-sheet.titles-above-float-left', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 20 },
    { id: 'fieldWidth', as: 'number', defaultValue: 200 },
  ],
  impl :{$: 'custom-style', 
    features :{$: 'group.init-group'},
    template: (cmp,state,h) => h('div',{ class: 'clearfix'}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property clearfix'},[
          h('label',{ class: 'property-title'},ctrl.title),
          h(ctrl)
    ]))),
    css: `>.property { 
          float: left;
          width: %$fieldWidth%px;
          margin-right: %$spacing%px;
        }
      .clearfix:after {
        content: "";
        clear: both;
      }
      >.property:last-child { margin-right:0 }
      >.property>.property-title {
        margin-bottom: 3px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        font-size:14px;
      }`,
  }
})

jb.component('property-sheet.titles-left', {
  type: 'group.style',
  params: [
    { id: 'vSpacing', as: 'number', defaultValue: 20 },
    { id: 'hSpacing', as: 'number', defaultValue: 20 },
    { id: 'titleWidth', as: 'number', defaultValue: 100 },
  ],
  impl :{$: 'custom-style', 
    features :{$: 'group.init-group'},
    template: (cmp,state,h) => h('div',{}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property'},[
          h('label',{ class: 'property-title'}, ctrl.title),
          h(ctrl)
    ]))),
    css: `>.property { margin-bottom: %$vSpacing%px; display: flex }
      >.property:last-child { margin-bottom:0px }
      >.property>.property-title {
        width: %$titleWidth%px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
        margin-right: %$hSpacing%px;
      }
      >.property>*:last-child { margin-right:0 }`
  }
})
;

jb.component('editable-boolean.checkbox', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('input', { type: 'checkbox',
        checked: state.model, 
        onchange: e => cmp.jbModel(e.target.checked), 
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  })
    }
})

jb.component('editable-boolean.checkbox-with-title', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: state.model, 
        onchange: e => cmp.jbModel(e.target.checked), 
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }), state.text])
  }
})


jb.component('editable-boolean.expand-collapse', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{},[
          h('input', { type: 'checkbox',
            checked: state.model, 
            onchange: e => cmp.jbModel(e.target.checked), 
            onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }, state.text),
          h('i',{class:'material-icons noselect', onclick: _=> cmp.toggle() }, state.model ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
      ]),
      css: `>i { font-size:16px; cursor: pointer; }
          >input { display: none }`
  }
})

jb.component('editable-boolean.mdl-slide-toggle', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('label',{class:'mdl-switch mdl-js-switch mdl-js-ripple-effect', for: 'switch_' + state.fieldId },[
        h('input', { type: 'checkbox', class: 'mdl-switch__input', id: 'switch_' + state.fieldId,
          checked: state.model, onchange: e => cmp.jbModel(e.target.checked) }),
        h('span',{class:'mdl-switch__label'},state.text)
      ]),
      features :[
          {$: 'field.databind' },
          {$: 'editable-boolean.keyboard-support' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})
;

jb.component('card.card', {
  type: 'group.style',
	params: [
    { id: 'width', as: 'number', defaultValue: 320 },
		{ id: 'shadow', as: 'string', options: '2,3,4,6,8,16', defaultValue: '2' }
	],
	impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: `mdl-card mdl-shadow--${cmp.shadow}dp` },
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl,{class: cmp.itemClass}),ctrl.ctx.data))),
    features :{$: 'group.init-group'},
		css: '{ width: %$width%px }'
  }
})

jb.component('card.media-group', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__media' },
})

jb.component('card.actions-group', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__actions mdl-card--border' },
})

jb.component('card.menu', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__menu' },
})
;

(function() {

class NodeLine extends jb.ui.Component {
	constructor(props) {
		super();
		this.state.expanded = props.tree.expanded[props.path];
		var tree = props.tree, path = props.path;
		var model = tree.nodeModel;

		this.state.flip = _ => {
			tree.expanded[path] = !(tree.expanded[path]);
			this.setState({expanded:tree.expanded[path]});
			tree.redraw();
		};
	}

	render(props,state) {
		var h = jb.ui.h, tree= props.tree, model = props.tree.nodeModel;

		const path = props.path;
		const collapsed = tree.expanded[path] ? '' : ' collapsed';
		const nochildren = model.isArray(path) ? '' : ' nochildren';
		const title = model.title(path,!tree.expanded[path]);
		const icon = model.icon ? model.icon(path) : 'radio_button_unchecked';

		return h('div',{ class: `treenode-line${collapsed}`},[
			h('button',{class: `treenode-expandbox${nochildren}`, onclick: _=> state.flip() },[
				h('div',{ class: 'frame'}),
				h('div',{ class: 'line-lr'}),
				h('div',{ class: 'line-tb'}),
			]),
			h('i',{class: 'material-icons', style: 'font-size: 16px; margin-left: -4px; padding-right:2px'}, icon),
			h('span',{class: 'treenode-label'}, title),
		])
	}
}

class TreeNode extends jb.ui.Component {
	constructor() {
		super();
	}
	render(props,state) {
		var h = jb.ui.h, tree = props.tree, path = props.path, model = props.tree.nodeModel;
		var disabled = model.disabled && model.disabled(props.path) ? 'jb-disabled' : '';
		var clz = [props.class, model.isArray(path) ? 'jb-array-node': '',disabled].filter(x=>x).join(' ');
		jb.log('render-tree',['Node',props.path,...arguments])

		return h('div',{class: clz, path: props.path},
			[h(NodeLine,{ tree: tree, path: path })].concat(!tree.expanded[path] ? [] : h('div',{ class: 'treenode-children'} ,
					tree.nodeModel.children(path).map(childPath=>
						h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') })
					))
			))

	}
}

 //********************* jBart Components

jb.component('tree', {
	type: 'control',
	params: [
		{ id: 'nodeModel', type: 'tree.nodeModel', dynamic: true, essential: true },
		{ id: 'style', type: "tree.style", defaultValue: { $: "tree.ul-li" }, dynamic: true },
		{ id: 'features', type: "feature[]", dynamic: true }
	],
	impl: ctx => {
		var nodeModel = ctx.params.nodeModel();
		if (!nodeModel)
			return jb.logError('missing nodeModel in tree',ctx);
		var tree = { nodeModel: nodeModel };
		var ctx = ctx.setVars({$tree: tree});
		return jb.ui.ctrl(ctx, {
			class: 'jb-tree', // define host element to keep the wrapper
			beforeInit: (cmp,props) => {
				cmp.tree = Object.assign( tree, {
					redraw: strong => { // needed after dragula that changes the DOM
						cmp.setState({empty: strong});
						if (strong)
							jb.delay(1).then(_=>
								cmp.setState({empty: false}))
					},
					expanded: jb.obj(tree.nodeModel.rootPath, true),
					elemToPath: el =>
						jb.ui.closest(el,'.treenode') && jb.ui.closest(el,'.treenode').getAttribute('path'),
					selectionEmitter: new jb.rx.Subject(),
				})
			},
			afterViewInit: cmp =>
				tree.el = cmp.base
		})
	}
})

jb.component('tree.ul-li', {
	type: 'tree.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => {
			var tree = cmp.tree;
			return h('div',{},
				state.empty ? h('span') : h(TreeNode,{ tree: tree, path: tree.nodeModel.rootPath,
				class: 'jb-control-tree treenode' + (tree.selected == tree.nodeModel.rootPath ? ' selected': '') })
			)
		}
	}
})

jb.component('tree.no-head', {
	type: 'tree.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => {
		var tree = cmp.tree, path = tree.nodeModel.rootPath;
		return h('div',{},tree.nodeModel.children(path).map(childPath=>
				 h(TreeNode,{ tree: tree, path: childPath, class: 'treenode' + (tree.selected == childPath ? ' selected' : '') }))
		)}
	}
})

jb.component('tree.selection', {
  type: 'feature',
  params: [
	  { id: 'databind', as: 'ref' },
	  { id: 'autoSelectFirst', type: 'boolean' },
	  { id: 'onSelection', type: 'action', dynamic: true },
	  { id: 'onRightClick', type: 'action', dynamic: true },
  ],
  impl: context=> ({
	    onclick: true,
  		afterViewInit: cmp => {
  		  var tree = cmp.tree;

  		  var databindObs = jb.ui.refObservable(context.params.databind,cmp).map(e=>jb.val(e.ref));

		  tree.selectionEmitter
		  	.merge(databindObs)
		  	.merge(cmp.onclick.map(event =>
		  		tree.elemToPath(event.target)))
		  	.filter(x=>x)
		  	.map(x=>
		  		jb.val(x))
//	  		.distinctUntilChanged()
		  	.subscribe(selected=> {
		  	  if (tree.selected == selected)
		  	  	return;
			  tree.selected = selected;
			  selected.split('~').slice(0,-1).reduce(function(base, x) {
				  var path = base ? (base + '~' + x) : x;
				  tree.expanded[path] = true;
				  return path;
			  },'')
			  if (context.params.databind)
				  jb.writeValue(context.params.databind, selected);
			  context.params.onSelection(cmp.ctx.setData(selected));
			  tree.redraw();
		  });

		  cmp.onclick.subscribe(_=>
		  	tree.regainFocus && tree.regainFocus()
		  );

		if (context.params.onRightClick.profile)
			cmp.base.oncontextmenu = (e=> {
				jb.ui.wrapWithLauchingElement(context.params.onRightClick,
					context.setData(tree.elemToPath(e.target)), e.target)();
				return false;
			});

		  // first auto selection selection
		  var first_selected = jb.val(context.params.databind);
		  if (!first_selected && context.params.autoSelectFirst) {
			  var first = jb.ui.find(tree.el.parentNode,'.treenode')[0];
			  first_selected = tree.elemToPath(first);
		  }
		  if (first_selected)
  			jb.delay(1).then(() =>
  				tree.selectionEmitter.next(first_selected))
  		},
  	})
})

jb.component('tree.keyboard-selection', {
	type: 'feature',
	params: [
		{ id: 'onKeyboardSelection', type: 'action', dynamic: true },
		{ id: 'onEnter', type: 'action', dynamic: true },
		{ id: 'onRightClickOfExpanded', type: 'action', dynamic: true },
		{ id: 'autoFocus', type: 'boolean' },
		{ id: 'applyMenuShortcuts', type: 'menu.option', dynamic: true },
	],
	impl: context => ({
			onkeydown: true,
			afterViewInit: cmp=> {
				var tree = cmp.tree;
				cmp.base.setAttribute('tabIndex','0');

				var keyDownNoAlts = cmp.onkeydown.filter(e=>
					!e.ctrlKey && !e.altKey);

				tree.regainFocus = cmp.getKeyboardFocus = cmp.getKeyboardFocus || (_ => {
					jb.ui.focus(cmp.base,'tree.keyboard-selection regain focus',context);
					return false;
				});

				if (context.params.autoFocus)
					jb.ui.focus(cmp.base,'tree.keyboard-selection init autofocus',context);

				keyDownNoAlts
					.filter(e=> e.keyCode == 13)
						.subscribe(e =>
							runActionInTreeContext(context.params.onEnter))

				keyDownNoAlts.filter(e=> e.keyCode == 38 || e.keyCode == 40)
					.map(event => {
						var diff = event.keyCode == 40 ? 1 : -1;
						var nodes = jb.ui.findIncludeSelf(tree.el,'.treenode');
						var selected = jb.ui.findIncludeSelf(tree.el,'.treenode.selected')[0];
						return tree.elemToPath(nodes[nodes.indexOf(selected) + diff]) || tree.selected;
					}).subscribe(x=>
						tree.selectionEmitter.next(x))
				// expand collapse
				keyDownNoAlts
					.filter(e=> e.keyCode == 37 || e.keyCode == 39)
					.subscribe(event => {
						var isArray = tree.nodeModel.isArray(tree.selected);
						if (!isArray || (tree.expanded[tree.selected] && event.keyCode == 39))
							runActionInTreeContext(context.params.onRightClickOfExpanded);
						if (isArray && tree.selected) {
							tree.expanded[tree.selected] = (event.keyCode == 39);
							tree.redraw()
						}
					});

				function runActionInTreeContext(action) {
					jb.ui.wrapWithLauchingElement(action,
						context.setData(tree.selected), jb.ui.findIncludeSelf(tree.el,'.treenode.selected>.treenode-line')[0])()
				}
				// menu shortcuts - delay in order not to block registration of other features
		    jb.delay(1).then(_=> cmp.base && (cmp.base.onkeydown = e => {
					if ((e.ctrlKey || e.altKey || e.keyCode == 46) // also Delete
					 && (e.keyCode != 17 && e.keyCode != 18)) { // ctrl or alt alone
						var menu = context.params.applyMenuShortcuts(context.setData(tree.selected));
						if (menu && menu.applyShortcut && menu.applyShortcut(e))
							return false;  // stop propagation
					}
					return false;  // stop propagation always
				}))
			}
		})
})

jb.component('tree.regain-focus', {
	type: 'action',
	impl : ctx =>
		ctx.vars.$tree && ctx.vars.$tree.regainFocus && ctx.vars.$tree.regainFocus()
})

jb.component('tree.redraw', {
	type: 'action',
  params: [
    { id: 'strong', type: 'boolean', as: 'boolean' }
  ],
	impl : (ctx,strong) => {
		jb.log('tree',['redraw',ctx.path, ...arguments]);
		return ctx.vars.$tree && ctx.vars.$tree.redraw && ctx.vars.$tree.redraw(strong)
	}
})

jb.component('tree.drag-and-drop', {
  type: 'feature',
  params: [
//	  { id: 'afterDrop', type: 'action', dynamic: true, essential: true },
  ],
  impl: ctx => ({
  		onkeydown: true,
  		afterViewInit: cmp => {
  			var tree = cmp.tree;
        var drake = tree.drake = dragula([], {
				      moves: el =>
					         jb.ui.matches(el,'.jb-array-node>.treenode-children>div')
	      });
        drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
          //jb.ui.findIncludeSelf(cmp.base,'.jb-array-node').map(el=>el.children()).filter('.treenode-children').get();

	      drake.on('drag', function(el, source) {
	          var path = tree.elemToPath(el.firstElementChild)
	          el.dragged = { path: path, expanded: tree.expanded[path]}
	          delete tree.expanded[path]; // collapse when dragging
	        })

	      drake.on('drop', (dropElm, target, source,targetSibling) => {
	            if (!dropElm.dragged) return;
				      dropElm.parentNode.removeChild(dropElm);
	            tree.expanded[dropElm.dragged.path] = dropElm.dragged.expanded; // restore expanded state
      				var state = treeStateAsVals(tree);
      				var targetPath = targetSibling ? tree.elemToPath(targetSibling) : addOneToIndex(tree.elemToPath(target.lastElementChild));
      				if (!targetPath)
      					debugger;
      				tree.nodeModel.move(dropElm.dragged.path,targetPath);
      				restoreTreeStateFromVals(tree,state);
      				dropElm.dragged = null;
      				tree.redraw(true);
	      });

	        // ctrl up and down
    		cmp.onkeydown.filter(e=>
    				e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40))
    				.subscribe(e=> {
      					var diff = e.keyCode == 40 ? 2 : -1;
      					var selectedIndex = Number(tree.selected.split('~').pop());
      					if (isNaN(selectedIndex)) return;
      					var no_of_siblings = Array.from(cmp.base.querySelector('.treenode.selected').parentNode.children).length;
                //$($('.treenode.selected').parents('.treenode-children')[0]).children().length;
      					var index = (selectedIndex + diff+ no_of_siblings+1) % (no_of_siblings + 1);
      					var path = tree.selected.split('~').slice(0,-1).join('~');
      					var state = treeStateAsVals(tree);
      					tree.nodeModel.move(tree.selected, tree.selected.split('~').slice(0,-1).concat([index]).join('~'))
      					restoreTreeStateFromVals(tree,state);
      			})
      		},
      		doCheck: function(cmp) {
      			var tree = cmp.tree;
    		  	if (tree.drake)
    			     tree.drake.containers = jb.ui.find(cmp.base,'.jb-array-node>.treenode-children');
    				       //$(cmp.base).findIncludeSelf('.jb-array-node').children().filter('.treenode-children').get();
      		}
  	})
})


treeStateAsVals = tree => ({
	selected: pathToVal(tree.nodeModel,tree.selected),
	expanded: jb.entries(tree.expanded).filter(e=>e[1]).map(e=>pathToVal(tree.nodeModel,e[0]))
})

restoreTreeStateFromVals = (tree,vals) => {
	tree.selected = valToPath(tree.nodeModel,vals.selected);
	tree.expanded = {};
	vals.expanded.forEach(v=>tree.expanded[valToPath(tree.nodeModel,v)] = true)
}

pathToVal = (model,path) =>
	model.refHandler.val(model.refHandler.refOfPath(path.split('~')))

valToPath = (model,val) => {
	var ref = model.refHandler.asRef(val);
	return ref ? ref.path().join('~') : ''
}

addOneToIndex = path => {
	if (!path) debugger;
	var index = Number(path.slice(-1)) + 1;
	return path.split('~').slice(0,-1).concat([index]).join('~')
}


})()
;

jb.component('tree.json-read-only',{
	type: 'tree.nodeModel',
	params: [
		{ id: 'object' },
		{ id: 'rootPath', as: 'string'}
	],
	impl: function(context, json, rootPath) {
		return new ROjson(json,rootPath)
	}
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
			.map(p=> [h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)) ])))
	}
}

jb.component('tree.json',{
	type: 'tree.nodeModel',
	params: [
		{ id: 'object'},
		{ id: 'rootPath', as: 'string'}
	],
	impl: function(context, json, rootPath) {
		return new Json(json,rootPath)
	}
})

class Json {
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
			return h(prop + ': null');
		if (!collapsed && typeof val == 'object')
			return h('div',{},prop);

		if (typeof val != 'object')
			return h('div',{},[prop + ': ',h('span',{class:'treenode-val', title: val},jb.ui.limitStringLength(val,20))]);

		return h('div',{},[h('span',{},prop + ': ')].concat(
			Object.keys(val).filter(p=> typeof val[p] == 'string' || typeof val[p] == 'number' || typeof val[p] == 'boolean')
			.map(p=> [h('span',{class:'treenode-val', title: ''+val[p]},jb.ui.limitStringLength(''+val[p],20)) ])))
	}
	modify(op,path,args,ctx) {
		op.call(this,path,args);
	}
	move(path,args) { // drag & drop
		var pathElems = args.dragged.split('~');
		pathElems.shift();
		var dragged = pathElems.reduce((o,p)=>o[p],this.json);
		var arr = this.val(path);
		if (Array.isArray(arr)) {
			var draggedIndex = Number(args.dragged.split('~').pop());
			arr.splice(draggedIndex,1);
			var index = (args.index == -1) ? arr.length : args.index;
			arr.splice(index,0,dragged);
		}
	}
}
;

if (typeof module !== 'undefined')
    module.exports = jb;;

