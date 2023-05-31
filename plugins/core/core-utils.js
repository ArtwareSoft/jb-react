// core utils promoted for easy usage
Object.assign(jb, {
    log(logName, record, options) { jb.spy && jb.spy.enabled && jb.spy.log(logName, record, options) },
    assert(cond, logObj, err) { 
      if (cond) return
      jb.spy && jb.spy.enabled && jb.logError(err,logObj);
      return true
    },
    logError(err,logObj) {
      const ctx = jb.path(logObj,'ctx')
      const stack = ctx && jb.utils.callStack(ctx)
      jb.frame.console && jb.frame.console.error('%c Error: ','color: red', err, stack, logObj)
      jb.log('error',{err , ...logObj, stack })
    },
    logException(e,err,logObj) {
      jb.frame.console && jb.frame.console.log('%c Exception: ','color: red', err, e, logObj)
      jb.log('exception error',{ e, err, stack: e.stack||'', ...logObj})
    },
    val(ref) {
      if (ref == null || typeof ref != 'object') return ref
      const handler = jb.db.refHandler(ref)
      return handler ? handler.val(ref) : ref
    },
    tostring: value => jb.core.tojstype(value,'string'),
    toarray: value => jb.core.tojstype(value,'array'),
    toboolean: value => jb.core.tojstype(value,'boolean'),
    tosingle: value => jb.core.tojstype(value,'single'),
    tonumber: value => jb.core.tojstype(value,'number'),
    exec: (...args) => new jb.core.jbCtx().run(...args),
    exp: (...args) => new jb.core.jbCtx().exp(...args),
})

extension('utils', 'core', {
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
        const dslType = profile.$dslType || jb.path(profile,[jb.core.CT, 'comp', jb.core.CT, 'dslType']) || ''
        const id = profile.$ || jb.utils.singleInType(parentParam) || ''
        return id && (!dslType.match(/</) || dslType.match(/<>/) ? '' : dslType) + id
    },
    resolveLoadedProfiles({keepLocation} = {}) {
      const profiles = jb.core.unresolvedProfiles
      profiles.forEach(({comp,id,dsl}) => jb.utils.resolveProfileTop(id,comp,dsl, keepLocation))
      profiles.forEach(({comp}) => jb.utils.resolveUnTypedProfile(comp, 10))
      jb.core.unresolvedProfiles = []
      profiles.forEach(({comp}) => jb.utils.resolveProfileInnerElements(comp))
      return profiles
    },
    resolveProfileTop(id, comp, dslFromContext, keepLocation) {
      if (id == 'a-b') debugger

      const CT = jb.core.CT
      if (!comp[CT]) comp[CT] = comp[CT] || { id }
      const type = comp.type || ''
      const dslOfType = type.indexOf('<') != -1 ? type.split(/<|>/)[1] : undefined // to cover t1<> dsl == ''
      const dsl = comp[CT].dsl = dslOfType !== undefined ? dslOfType : (comp.dsl || dslFromContext)
      const unresolvedType = comp[CT].idOfUnresolvedType = ! type && id
      if (comp.impl && typeof comp.impl == 'object')
        comp.impl[CT] = { dsl }
      if (!unresolvedType) {
        const dslType = comp[CT].dslType = (dsl && type.indexOf('<') == -1 ? `${type}<${dsl}>` : type).replace(/\<\>/g,'')
        comp[CT].fullId = (dsl ? dslType : '') + id
        const oldComp = jb.comps[comp[CT].fullId]
        if (jb.comps[comp[CT].fullId] && jb.comps[comp[CT].fullId] != comp)
          jb.logError(`comp ${comp[CT].fullId} at ${ JSON.stringify(comp[CT].location || {})} already defined at ${JSON.stringify((jb.comps[comp[CT].fullId][CT].location || {}))}`,
            {oldComp: jb.comps[comp[CT].fullId], oldLocation: jb.comps[comp[CT].fullId][CT].location, newLocation: comp[CT].location})
        jb.comps[comp[CT].fullId] = comp
        
        if (keepLocation && jb.path(oldComp,[CT,'location']))
          comp[CT].location = jb.path(oldComp,[CT,'location'])

        jb.path(comp,['impl',CT,'dslType'], dslType)
      } else {
        if (keepLocation)
          comp[CT].keepLocation = true
      }

      ;(comp.params || []).forEach(p=> {
        const _dsl = dslFromContext || dsl
        // fix as boolean params to have type: 'boolean'
        if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1)
          p.type = 'boolean';
        const dslType = (p.type || '').split(',')
          .map(t => t || 'data')
          .map(t=> _dsl && t.indexOf('<') == -1 && ['data','action'].indexOf(t) == -1 ? `${t}<${_dsl}>` : t)
          .join(',')
        p[CT] = { dslType, originalType: p.type}
        if (p.defaultValue && typeof p.defaultValue == 'object')
          p.defaultValue[CT] = { ...p[CT] }
      })
      return comp
    },
    resolveUnTypedProfile(comp, depth) {
      const CT = jb.core.CT
//      if (comp[CT].idOfUnresolvedType == 'israel') debugger
      if (! comp)
        return 'data'
      if (depth < 1) 
        return registerWithType('data')
      if (comp[CT].dslType) 
        return registerWithType(comp[CT].dslType)
      if (!comp.impl || typeof comp.impl != 'object')
        return registerWithType('data')

      resolveImpl(comp.impl)
      const compFromImpl = jb.path(comp.impl,[CT,'comp'])
      const dslType = compFromImpl && jb.path(compFromImpl,[CT,'dslType'])
      if (dslType) {
        comp.impl[CT].dslType = dslType.replace(/\<\>/g,'')
        return registerWithType(dslType)
      }
      return 'unknown'

      function resolveImpl(prof) {
        const dslType = prof.$typeCast || jb.path(prof,[CT,'dslType'])
        let comp = jb.utils.getComp(prof.$, { types: dslType, dsl: jb.path(prof,[CT,'dsl']), silent: true })
        if (!comp) {
          jb.utils.resolveUnTypedProfile(jb.utils.getUnresolvedProfile(prof.$), depth-1)
          comp = jb.utils.getComp(prof.$, { types: dslType, dsl: jb.path(prof,[CT,'dsl']) })
        }
        if (!comp)
          return jb.logError(`resolveUnTypedProfile - can not resolve profile ${prof.$}`, {prof})
        prof[CT] = prof[CT] || {}
        Object.assign(prof[CT], {comp, dslType})
      }
      function registerWithType(dslType) {
        if (!comp[CT].idOfUnresolvedType) return dslType
        const typePrefix = comp[CT].dsl && dslType.indexOf('<') != -1 ? dslType : ''
        comp[CT].fullId = typePrefix + comp[CT].idOfUnresolvedType
        const oldComp = jb.comps[comp[CT].fullId]

        jb.comps[comp[CT].fullId] = comp
        if (comp[CT].keepLocation && jb.path(oldComp,[CT,'location']))
          comp[CT].location = jb.path(oldComp,[CT,'location'])
        Object.assign(comp[CT], {idOfUnresolvedType: null, keepLocation: null, dslType })

        return dslType
      }
    },

    resolveProfileInnerElements(topComp) {
      const CT = jb.core.CT
      if (!topComp) return
      ;(topComp.params || []).forEach(p=> doResolve(p.defaultValue))
      //if (topComp[CT].fullId =='state<loc>israel') debugger
      doResolve(topComp.impl)

      function doResolve(prof, _expectedType,parent) {
          if (!prof || !prof.constructor || ['Object','Array'].indexOf(prof.constructor.name) == -1) return
          const expectedType = _expectedType == '$asParent' ? jb.path(parent,[CT,'dslType']) : _expectedType
          const dslType = prof.$typeCast || jb.path(prof,[CT,'dslType']) ||  expectedType
          const comp = jb.utils.getComp(prof.$, { types: dslType, dsl: jb.path(prof,[CT,'dsl']) })
          prof[CT] = prof[CT] || {}
          Object.assign(prof[CT], {comp, dslType})
          if (prof.$byValue && comp) {
              Object.assign(prof, jb.macro.argsToProfile(prof.$, comp, prof.$byValue))
              delete prof.$byValue
          }
          if (Array.isArray(prof)) {
            prof.forEach(v=>doResolve(v, expectedType))
          } else if (comp && prof.$ != 'asIs') {
            ;(comp.params || []).forEach(p=> doResolve(prof[p.id], (jb.path(p,[CT,'dslType']) ||'').replace(/\[\]/g,''),prof ))
            doResolve(prof.$vars)
            if (prof.$ == 'object')
              Object.values(prof).forEach(v=>doResolve(v))
          } else if (!comp && prof.$) {
              return jb.logError(`resolveProfile - can not resolve ${prof.$} at ${topComp[CT].fullId} expected type ${dslType || 'unknown'}`, 
                  {compId: prof.$, prof, expectedType, dslType, topComp})
          }
      }
    },    
    resolveDetachedProfile(prof, expectedType) {
      const CT = jb.core.CT
      if (!prof || !prof.constructor || ['Object','Array'].indexOf(prof.constructor.name) == -1) 
        return prof
      if (Array.isArray(prof)) {
          prof.forEach(v=>jb.utils.resolveDetachedProfile(v, expectedType))
          return prof
      }
      const dslType = prof.$typeCast || expectedType
      const comp = jb.utils.getComp(prof.$, { types: dslType })
      prof[CT] = {comp, dslType}
      if (prof.$byValue && comp) {
          Object.assign(prof, jb.macro.argsToProfile(prof.$, comp, prof.$byValue))
          delete prof.$byValue
          ;(comp.params || []).forEach(p=> jb.utils.resolveDetachedProfile(prof[p.id], jb.path(p,[CT,'dslType'])))
          jb.utils.resolveDetachedProfile(prof.$vars)
      } else if (prof.$byValue && !comp) {
          return jb.logError(`resolveDetachedProfile - can not resolve ${prof.$} expected type ${dslType || 'unknown'}`, 
              {compId: prof.$, prof, expectedType, dslType })
      } else {
        Object.keys(prof).forEach(key=> {
          const p = (comp && comp.params || []).find(p=>p.id == key)
          const type = p && (jb.path(p,[CT,'dslType']) ||'').replace(/\[\]/g,'')
          jb.utils.resolveDetachedProfile(prof[key],  type)
        })
      }
      return prof
    },
    getCompByShortIdAndDsl(shortId,dsl) {
      const pattern = `<${dsl}>${shortId}`
      const options = Object.keys(jb.comps).filter(fullId =>fullId.indexOf(pattern) != -1)
      if (options.length == 1)
        return jb.comps[options[0]]
      else if (options.length > 1)
        jb.logError('getCompByShortIdAndDsl - several options', {dsl,shortId,options})
    },
    getComp(id, {types, dsl, silent} = {}) {
      if (jb.core.genericCompIds[id]) return jb.comps[id]
      const res = id && (types || '').split(',')
        .map(t=>t.replace(/<>|\[\]/g,''))
        .map(t => t.indexOf('<') == -1 ? id : t+id)
        .map(fullId => jb.comps[fullId]).find(x=>x) || (!types && dsl && jb.utils.getCompByShortIdAndDsl(id,dsl))
      
      if (id && !res && !silent)
        jb.logError(`utils getComp - can not find comp for id ${id}`,{id, types, dsl})
      return res
    },
    compParams(comp) {
      if (!comp || !comp.params)
        return []
      return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x=>Object.assign(x[1],{id: x[0]}))
    },
    getUnresolvedProfile: _id => (jb.core.unresolvedProfiles.find(({id}) => id == _id) || {}).comp,
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
    callStack(ctx) {
      const ctxStack=[]; 
      for(let innerCtx=ctx; innerCtx; innerCtx = innerCtx.cmpCtx) 
        ctxStack.push(innerCtx)
      return [ctx.path, ...ctxStack.map(ctx=>ctx.callerPath).slice(1)]
    },
    ctxStack(ctx) {
      const ctxStack=[]; 
      for(let innerCtx=ctx; innerCtx; innerCtx = innerCtx.cmpCtx) 
        ctxStack.push(innerCtx)
      return ctxStack
    },
    addDebugInfo(f,ctx) { f.ctx = ctx; return f},
    assignDebugInfoToFunc(func, ctx) {
      func.ctx = ctx
      const debugFuncName = ctx.profile && ctx.profile.$ || typeof ctx.profile == 'string' && ctx.profile.slice(0,10) || ''
      Object.defineProperty(func, 'name', { value: (ctx.path ||'').split('~').pop() + ': ' + debugFuncName })
    },
    subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),  
    indexOfCompDeclarationInTextLines(lines,id) {
      return lines.findIndex(line=> {
        const index = line.indexOf(`component('${id}'`)
        return index == 0 || index == 3
      })
    },
    calcDirectory: dir => dir[0] != '/' ? `${jbHost.baseUrl}/${dir}` : dir,
})

extension('utils', 'generic', {
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
    tryWrapper(f,msg,ctx) { try { return f() } catch(e) { jb.logException(e,msg,{ctx}) }},
    flattenArray: items => items.flatMap(x=>x),
    //  {
    //   let out = [];
    //   items.filter(i=>i).forEach(function(item) {
    //     if (Array.isArray(item))
    //       out = out.concat(item);
    //     else
    //       out.push(item);
    //   })
    //   return out;
    // },
    isPromise: v => v && Object.prototype.toString.call(v) === '[object Promise]',
    isDelayed(v) {
      if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
      else if (typeof v === 'object')
        return jb.utils.isPromise(v)
      else if (typeof v === 'function')
        return jb.utils.isCallbag(v)
    },
    isCallbag: v => jb.callbag && jb.callbag.isCallbag(v),
    resolveDelayed(delayed, synchCallbag) {
      if (jb.utils.isPromise(delayed))
        return Promise.resolve(delayed)
      if (! jb.asArray(delayed).find(v=> jb.utils.isCallbag(v) || jb.utils.isPromise(v))) return delayed
      return jb.utils.toSynchArray(delayed, synchCallbag)
    },
    toSynchArray(item, synchCallbag) {
      if (jb.utils.isPromise(item))
        return item.then(x=>[x])

      if (! jb.asArray(item).find(v=> jb.utils.isCallbag(v) || jb.utils.isPromise(v))) return item
      if (!jb.callbag) return Promise.all(jb.asArray(item))

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

    unique: (ar,f = (x=>x)) => {
      const keys = {}, res = []
      ar.forEach(e=>{ if (!keys[f(e)]) { keys[f(e)] = true; res.push(e) } })
      return res
    },
    sessionStorage(id,val) {
      if (!jb.frame.sessionStorage) return
      return val == undefined ? JSON.parse(jb.frame.sessionStorage.getItem(id)) : jb.frame.sessionStorage.setItem(id,JSON.stringify(val))
    }
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
