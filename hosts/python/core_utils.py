from jb_lang import jb, extension, jbHost
import asyncio
from functools import reduce

class utilsInJb:
    def log(logName, record, options):
        if jb.spy and jb.spy.enabled:
            jb.spy.log(logName, record, options)

    def assert_(cond, logObj, err):
        if cond:
            return
        if jb.spy and jb.spy.enabled:
            jb.logError(err, logObj)
        return True

    def logError(err, logObj):
        ctx = jb.path(logObj, 'ctx')
        stack = ctx and jb.utils.callStack(ctx)
        if jb.frame.window:
            print('\033[91mError:\033[0m', err, stack, logObj)
        errObj = {'err': err, **logObj, 'stack': stack}
        if 'jbHost.process' in globals():
            jbHost.process.stderr.write(err)
        jb.log('error', errObj)

    def logException(e, err, logObj):
        if jb.frame.window:
            print('\033[91mException:\033[0m', err, e, logObj)
        errObj = {'e': e, 'err': err, 'stack': e.stack or '', **logObj}
        if 'jbHost.process' in globals():
            jbHost.process.stderr.write(f'{err}\n{e}')
        jb.log('exception error', errObj)

    def val(ref):
        if ref is None or not isinstance(ref, dict):
            return ref
        handler = jb.db.refHandler(ref)
        return handler.val(ref) if handler else ref

    tostring = lambda value: jb.core.tojstype(value, 'string')
    toarray = lambda value: jb.core.tojstype(value, 'array')
    toboolean = lambda value: jb.core.tojstype(value, 'boolean')
    tosingle = lambda value: jb.core.tojstype(value, 'single')
    tonumber = lambda value: jb.core.tojstype(value, 'number')

    def run(*args):
        return jb.core.jbCtx().run(*args)

    def exp(*args):
        return jb.core.jbCtx().exp(*args)
    
    def path(object, path, value=None):
        if not object:
            return object
        cur = object
        if isinstance(path, str):
            path = path.split('.')
        path = jb.asArray(path)

        if value is None:  # get
            return reduce(lambda o, k: o and o.get(k), path, object)
        else:  # set
            for i in range(len(path)):
                if i == len(path) - 1:
                    cur[path[i]] = value
                else:
                    cur = cur.setdefault(path[i], {})
            return value

    def entries(obj):
        if not obj or not isinstance(obj, dict):
            return []
        ret = []
        for i in obj.keys():
            if obj.__contains__(i) and not i.startswith('$jb_'):
                ret.append([i, obj[i]])
        return ret

    def objFromEntries(entries):
        res = {}
        for e in entries:
            res[e[0]] = e[1]
        return res

    def asArray(v):
        return [] if v is None else (v if isinstance(v, list) else [v])

    def delay(mSec, res):
        return asyncio.get_event_loop().run_until_complete(asyncio.sleep(mSec / 1000, result=res))


for k in dir(utilsInJb): jb[k] = getattr(utilsInJb, k)

class UtilsCore:
    def getComp(id, types_dsl_silent=None):
        types, dsl, silent = types_dsl_silent or (None, None, None)
        if jb.core.genericCompIds.get(id):
            return jb.comps[id]
        res = id and (types or '').split(',').map(lambda t: t.replace('<>', '[]')).map(lambda t: id if t.indexOf('<') == -1 else t + id).map(lambda fullId: jb.comps[fullId]).find(lambda x: x) or (not types and dsl and jb.utils.getCompByShortIdAndDsl(id, dsl))
        if id and not res and not silent:
            jb.logError(f"utils getComp - can not find comp for id {id}", {"id": id, "types": types, "dsl": dsl})
        return res

    def compParams(comp):
        if not comp or not comp.params:
            return []
        return comp.params if isinstance(comp.params, list) else entries(comp.params).map(lambda x: Object.assign(x[1], {"id": x[0]}))

    def isRefType(jstype):
        return jstype == 'ref' or jstype == 'ref[]'

    def calcVar(ctx, varname, jstype):
        res = None
        if ctx.cmpCtx and ctx.cmpCtx.params[varname] is not None:
            res = ctx.cmpCtx.params[varname]
        elif ctx.vars[varname] is not None:
            res = ctx.vars[varname]
        elif ctx.vars.scope and ctx.vars.scope[varname] is not None:
            res = ctx.vars.scope[varname]
        elif jb.db.resources and jb.db.resources[varname] is not None:
            jb.db.useResourcesHandler(lambda h: h.makeWatchable(varname))
            res = jb.db.useResourcesHandler(lambda h: h.refOfPath([varname])) if jb.utils.isRefType(jstype) else jb.db.resource(varname)
        elif jb.db.consts and jb.db.consts[varname] is not None:
            res = jb.db.simpleValueByRefHandler.objectProperty(jb.db.consts, varname) if jb.utils.isRefType(jstype) else jb.db.consts[varname]

        return jb.utils.resolveFinishedPromise(res)

    def callStack(ctx):
        ctxStack = []
        innerCtx = ctx
        while innerCtx:
            ctxStack.append(innerCtx)
            innerCtx = innerCtx.cmpCtx
        return [ctx.path] + [ctxStack.map(lambda ctx: ctx.callerPath).slice(1)]

    def ctxStack(ctx):
        ctxStack = []
        innerCtx = ctx
        while innerCtx:
            ctxStack.append(innerCtx)
            innerCtx = innerCtx.cmpCtx
        return ctxStack

    def addDebugInfo(f, ctx):
        f.ctx = ctx
        return f

    def assignDebugInfoToFunc(func, ctx):
        func.ctx = ctx
        debugFuncName = ctx.profile and ctx.profile["$"] or (ctx.profile if isinstance(ctx.profile, str) else "")[:10]
        setattr(func, 'name', (ctx.path.split("~").pop() + ": " + debugFuncName))

    def subscribe(source, listener):
        return jb.callbag.subscribe(listener)(source)

    def indexOfCompDeclarationInTextLines(lines, id):
        return lines.findIndex(lambda line: line.indexOf(f"component('{id}'") == 0 or line.indexOf(f"component('{id}'") == 3)

    def calcDirectory(dir):
        return f"{jbHost.baseUrl}/{dir}" if dir[0] != '/' else dir

extension('utils','core',UtilsCore)

class UtilsGeneric:
    def isEmpty(o):
        return len(o.keys()) == 0

    def isObject(o):
        return o is not None and isinstance(o, dict)

    def isPrimitiveValue(val):
        return isinstance(val, (str, bool, int, float))

    def tryWrapper(f, msg, ctx, reqCtx):
        try:
            return f()
        except Exception as e:
            jb.logException(e, msg, {"ctx": ctx, "reqCtx": reqCtx})

    def flattenArray(items):
        return [x for sublist in items for x in sublist]

    def isPromise(v):
        return v and isinstance(v, type(asyncio.Future()))

    def isDelayed(v):
        if not v or isinstance(v, type({}.constructor)) or isinstance(v, list):
            return
        elif isinstance(v, dict):
            return jb.utils.isPromise(v)
        elif isinstance(v, (function)):
            return jb.utils.isCallbag(v)

    def isCallbag(v):
        if hasattr(jb, "callbag"):
            return jb.callbag.isCallbag(v)

    def resolveDelayed(delayed, synchCallbag):
        if jb.utils.isPromise(delayed):
            return asyncio.get_event_loop().run_until_complete(delayed)
        if not any(jb.utils.isCallbag(v) or jb.utils.isPromise(v) for v in jb.asArray(delayed)):
            return delayed
        return jb.utils.toSynchArray(delayed, synchCallbag)

    def toSynchArray(item, synchCallbag):
        if jb.utils.isPromise(item):
            return asyncio.get_event_loop().run_until_complete(item)

        if not any(jb.utils.isCallbag(v) or jb.utils.isPromise(v) for v in jb.asArray(item)):
            return item
        if not hasattr(jb, "callbag"):
            return asyncio.get_event_loop().run_until_complete(asyncio.gather(*jb.asArray(item)))

        # from jb.callbag import pipe, fromIter, toPromiseArray, mapPromise, flatMap, map, isCallbag

        # if isCallbag(item):
        #     return toPromiseArray(pipe(item, map(lambda x: x and x.vars if x.data else x)))
        # if isinstance(item, list) and isCallbag(item[0]):
        #     return toPromiseArray(pipe(item[0], map(lambda x: x and x.vars if x.data else x)))

        # return toPromiseArray(pipe(
        #     fromIter(jb.asArray(item)),
        #     mapPromise(lambda x: asyncio.get_event_loop().run_until_complete(asyncio.to_thread(lambda: x))),
        #     flatMap(lambda v: v if isinstance(v, list) else [v])
        # ))

    def compareArrays(arr1, arr2):
        if arr1 is arr2:
            return True
        if not isinstance(arr1, list) and not isinstance(arr2, list):
            return arr1 == arr2
        if not arr1 or not arr2 or len(arr1) != len(arr2):
            return False
        for i in range(len(arr1)):
            key1 = arr1[i].get('key') if arr1[i] else None
            key2 = arr2[i].get('key') if arr2[i] else None
            if key1 and key2 and key1 == key2 and arr1[i].get('val') == arr2[i].get('val'):
                continue
            if arr1[i] != arr2[i]:
                return False
        return True

    def objectDiff(newObj, orig):
        if orig is newObj:
            return {}
        if not jb.utils.isObject(orig) or not jb.utils.isObject(newObj):
            return newObj
        deletedValues = {key: '__undefined' for key in orig.keys() if key not in newObj}
        return {key: jb.utils.objectDiff(newObj[key], orig[key]) if key in orig and key in newObj else newObj[key] for key in newObj.keys()}

    def comparePaths(path1, path2):
        path1 = path1 or ''
        path2 = path2 or ''
        i = 0
        while i < len(path1) and path1[i] == path2[i]:
            i += 1
        if i == len(path1) and i == len(path2):
            return 0
        if i == len(path1) and i < len(path2):
            return -1
        if i == len(path2) and i < len(path1):
            return 1
        return -2 if path1[i] < path2[i] else 2

    def unique(ar, f=lambda x: x):
        keys = {}
        res = []
        for e in ar:
            if not keys.get(f(e)):
                keys[f(e)] = True
                res.append(e)
        return res

    def sessionStorage(id, val=None):
        if not hasattr(jb.frame, "sessionStorage"):
            return
        if val is None:
            return json.loads(jb.frame.sessionStorage.getItem(id))
        else:
            jb.frame.sessionStorage.setItem(id, json.dumps(val))


extension('utils','generic',UtilsGeneric)
