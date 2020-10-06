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
      jb.frame.console && jb.frame.console.log('%c Error: ','color: red', err, logObj && Object.values(logObj))
      jb.log('error',{err , ...logObj})
    },
    logException(e,err,logObj) {
      jb.frame.console && jb.frame.console.log('%c Exception: ','color: red', err, e, logObj && Object.values(logObj))
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
})