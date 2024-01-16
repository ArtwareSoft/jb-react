from jb import jb
from js_obj import JSObj

def extension(libId, extId, extensionClass, plugin= None):
    extension = JSObj()
    for k in dir(extensionClass): 
        if not k.startswith('__'): extension[k] = getattr(extensionClass, k)
    funcs = [k for k, v in extension.items() if callable(v) and not k.startswith("initExtension")]
    lib = jb.setdefault(libId, JSObj(__extensions= JSObj()))
        
    initialized = bool(lib.__extensions[extId])
    
    for k in funcs:
        extension[k].extId = extId
        extension[k].__initFunc = extension.initExtension and f"#{libId}.__extensions.{extId}.init"
    
    for k in funcs:
        lib[k] = extension[k]
    
    #stack_trace = traceback.extract_stack()
    #location = stack_trace[-3][0] if len(stack_trace) > 2 else None  # Assumes that the source location can be extracted this way; further logic might be required.
    location = 0
    
    phase_mapping = {"core": 1, "utils": 5, "db": 10, "watchable": 20}
    phase = extension.get("$phase", phase_mapping.get(libId, 100))
    
    if extension.initExtension:
        extension.initExtension.requireFuncs = extension.get("$requireFuncs")
    
    lib.__extensions[extId] = JSObj(
        plugin= plugin,
        libId= libId,
        phase= phase,
        init= extension.initExtension,
        initialized= initialized,
        requireLibs= extension.get('$requireLibs'),
        requireFuncs= extension.get('$requireFuncs'),
        funcs= funcs,
        location= location
    )
    
    initFunc = extension.initExtension
    if initFunc and jb.noSupervisedLoad:
        lib.update((initFunc() if initFunc.__code__.co_argcount == 0 else initFunc(lib)))
        lib.__extensions[extId].initialized = True


def component(comp): return { 'jbComp': comp }
jb.component = component
jb.extension = extension

class CoreMain:
    def initExtension():
        jb.update(JSObj(frame = {}, comps= {}, ctxDictionary= {}, __requiredLoaded= {}))
        js_types = {
        'asIs': lambda x: x,
        'object': lambda value: value[0] if isinstance(value, list) else (jb.val(value) if value and isinstance(value, dict) else {}),
        'string': lambda value: str(value[0]) if isinstance(value, list) else ('' if value is None else str(jb.val(value))),
        'number': lambda value: float(value[0]) if isinstance(value, list) else (0.0 if value is None else float(jb.val(value))),
        'array': lambda value: value if isinstance(value, list) else [value],
        'boolean': lambda value: bool(value[0]) if isinstance(value, list) else (False if value is None or value == 'false' else bool(jb.val(value))),
        'single': lambda value: value[0] if isinstance(value, list) else jb.val(value),
        'ref': lambda value: jb.db.asRef(value[0] if isinstance(value, list) else value),
        'ref[]': lambda value: jb.db.asRef(value)
        }
        return {
            'ctxCounter': 0,
            'CT': object(),
            'OnlyData': object(),
            'jstypes': js_types,
            'onAddComponent': [],
            'unresolvedProfiles': [],
            'genericCompIds': {}
        }
    
    def run(ctx, parent_param, settings):
        if hasattr(ctx, 'probe') and not getattr(ctx.probe, 'active', False): return
        
        def runner(): return jb.core.do_run(ctx, parent_param, settings)
        
        runner.__name__ = f"{ctx.path} {getattr(ctx.profile, '$', '')}-run"
        
        if hasattr(ctx, 'probe'): ctx.profile = ctx.probe.alternateProfile(ctx)
        
        res = runner()
        if hasattr(ctx, 'probe'): res = ctx.probe.record(ctx, res) or res
        if callable(res): jb.utils.assignDebugInfoToFunc(res, ctx)
        
        return res
    
    def doRun(ctx, parentParam, settings):
        try:
            profile = ctx.profile
            if profile is None or (isinstance(profile, dict) and profile.get('$disabled')):
                return jb.core.castToParam(None, parentParam)

            if profile.get('$debugger') == 0:
                # Python does not have a direct equivalent to JavaScript's debugger statement.
                pass
            
            if profile.get('$asIs'):
                return profile.get('$asIs')
            
            if parentParam and (parentParam.get('type') or '').find('[]') > -1 and not parentParam.get('as'):
                parentParam['as'] = 'array'

            if isinstance(profile, dict) and not profile:
                return

            ctxWithVars = jb.core.extendWithVars(ctx, profile.get('$vars', {}))
            run = jb.core.prepare(ctxWithVars, parentParam)
            ctx['parentParam'] = parentParam

            switch_type = run['type']
            castToParam = jb.core.castToParam

            if switch_type == 'booleanExp':
                return castToParam(jb.expression.calcBool(profile, ctx, parentParam), parentParam)
            elif switch_type == 'expression':
                return castToParam(jb.expression.calc(profile, ctx, parentParam), parentParam)
            elif switch_type == 'asIs':
                return profile
            elif switch_type == 'function':
                return castToParam(profile(ctx, ctx['vars'], ctx.get('cmpCtx', {}).get('params')), parentParam)
            elif switch_type == 'null':
                return castToParam(None, parentParam)
            elif switch_type == 'ignore':
                return ctx.get('data')
            elif switch_type == 'list':
                return [ctxWithVars.runInner(inner, None, i) for i, inner in enumerate(profile)]
            elif switch_type == 'runActions':
                return jb.comps.runActions.impl(jb.core.jbCtx(ctxWithVars, {'profile': {'actions': profile}, 'path': ''}))
            elif switch_type == 'profile':
                if not run.get('impl'):
                    run['ctx']['callerPath'] = ctx['path']

                def calcParam(paramObj):
                    if paramObj['type'] == 'function':
                        return paramObj['outerFunc'](run['ctx'])
                    elif paramObj['type'] == 'primitive':
                        return paramObj['val']
                    elif paramObj['type'] == 'array':
                        return [prof for i, prof in enumerate(paramObj['array']) if prof is not None and jb.core.run(
                            jb.core.jbCtx(run['ctx'], {
                                'profile': prof,
                                'forcePath': paramObj.get('forcePath', ctx['path'] + f'~{paramObj["path"]}~{i}'),
                                'path': ''
                            }), paramObj['param']
                        )]
                    else:
                        return jb.core.run(jb.core.jbCtx(run['ctx'], {
                            'profile': paramObj['prof'],
                            'forcePath': paramObj.get('forcePath', ctx['path'] + f'~{paramObj["path"]}'),
                            'path': ''
                        }), paramObj['param'])

                setattr(calcParam, 'name', f"{run['ctx']['path']} {profile.get('$', '')}-calc param")

                for paramObj in run['preparedParams']:
                    run['ctx']['params'][paramObj['name']] = calcParam(paramObj)

                out = run['impl'](run['ctx'], *[run['ctx']['params'][param['name']] for param in run['preparedParams']]) if run.get('impl') else jb.core.run(jb.core.jbCtx(run['ctx'], {'cmpCtx': run['ctx']}), parentParam)
                return castToParam(out, parentParam)

        except Exception as e:
            if ctx['vars'].get('$throw') or e == 'probe tails':
                raise e
            jb.logException(e, 'exception while running run', {'ctx': ctx, 'parentParam': parentParam, 'settings': settings})

    def extendWithVars(ctx, vars):
        if isinstance(vars, list):
            for i, var_dict in enumerate(vars):
                name = var_dict.get('name')
                val = var_dict.get('val', '%%')
                ctx = ctx.setVar(name, ctx.runInner(val, None, f"$vars~{i}~val"))
        elif vars:
            jb.logError('$vars should be array', {'ctx': ctx, 'vars': vars})
        return ctx
    
    def prepareParams(comp_name, comp, profile, ctx):
        comp_params = jb.utils.compParams(comp)
        prepared_params = []
        
        for param in comp_params:
            if not param.get('ignore'):
                p = param.get('id')
                val = profile.get(p)
                path = p
                
                null_value_of_param = isinstance(val, str) and val == f"%${p}%" and ctx.get('cmpCtx') and ctx['cmpCtx'].get('params', {}).get(p) is None
                default_value = param.get('defaultValue')
                default_value_path = f"{comp_name}~params~{comp_params.index(param)}~defaultValue" if default_value is not None else None
                is_null_value = val is None or null_value_of_param
                val_or_default = default_value if is_null_value else val
                
                using_default = is_null_value and default_value is not None
                force_path = default_value_path if using_default else None
                if force_path:
                    path = ''
                
                val_or_default_array = val_or_default if val_or_default is not None else []
                array_param = param.get('type') and '[]' in param['type'] and isinstance(val_or_default_array, list)
                
                if param.get('dynamic'):
                    def outer_func(run_ctx):
                        def func(ctx2, data2):
                            nonlocal val_or_default_array
                            if array_param:
                                return jb.utils.flattenArray([
                                    run_ctx.extendVars(ctx2, data2).runInner(
                                        prof, 
                                        {**param, 'as': 'asIs'}, 
                                        f"{path}~{i}"
                                    ) for i, prof in enumerate(val_or_default_array)
                                ])
                            else:
                                return jb.core.run(
                                    jb.core.jbCtx(
                                        run_ctx.extendVars(ctx2, data2),
                                        {
                                            'profile': val_or_default,
                                            'forcePath': force_path,
                                            'path': path
                                        }
                                    ), 
                                    param
                                )
                        
                        debug_func_name = val_or_default.get('$') if val_or_default and '$' in val_or_default else (val_or_default[:10] if isinstance(val_or_default, str) else '')
                        func.__name__ = f"{p}: {debug_func_name}"
                        func.profile = val_or_default
                        func.run_ctx = run_ctx
                        func.path = path
                        func.srcPath = ctx['path']
                        func.force_path = force_path
                        func.param = param
                        return func
                    
                    prepared_params.append({
                        'name': p,
                        'type': 'function',
                        'outerFunc': outer_func,
                        'path': path,
                        'param': param,
                        'forcePath': force_path
                    })
                
                elif array_param:
                    prepared_params.append({
                        'name': p,
                        'type': 'array',
                        'array': val_or_default_array,
                        'param': {**param, 'type': param['type'].split('[')[0], 'as': None},
                        'forcePath': force_path,
                        'path': path
                    })
                
                elif param.get('as') == 'string' and isinstance(val_or_default, str) and '%' not in val_or_default:
                    prepared_params.append({
                        'name': p,
                        'type': 'primitive',
                        'val': val_or_default
                    })
                
                else:
                    prepared_params.append({
                        'name': p,
                        'type': 'run',
                        'prof': val_or_default,
                        'param': param,
                        'forcePath': force_path,
                        'path': path
                    })

        return prepared_params

    def prepare(ctx, parentParam):
        profile = ctx.get('profile')
        profile_jstype = type(profile)
        parentParam_type = parentParam.get('type') if parentParam else None
        jstype = parentParam.get('as') if parentParam else None
        is_array = isinstance(profile, list)

        if profile_jstype == 'str' and parentParam_type == 'boolean':
            return {'type': 'booleanExp'}
        if profile_jstype in ['bool', 'int', 'float'] or parentParam_type == 'asIs':
            return {'type': 'asIs'}
        if profile_jstype == 'dict' and jstype == 'dict':
            return {'type': 'object'}
        if profile_jstype == 'str':
            return {'type': 'expression'}
        if profile_jstype == 'function':
            return {'type': 'function'}
        if profile is None:
            return {'type': 'asIs'}

        if is_array:
            if not profile:
                return {'type': 'null'}
            if not parentParam or not parentParam_type or parentParam_type == 'data':
                return {'type': 'list'}
            if parentParam_type in ['action', 'action[]'] and is_array:
                profile['sugar'] = True
                return {'type': 'runActions'}

        comp_name = jb.utils.compName(profile, parentParam)
        if not comp_name:
            return {'type': 'asIs'}

        if profile.get('$byValue'):
            jb.logError(f"core: prepare - unresolved profile at {ctx['path']}", {'profile': profile, 'ctx': ctx})

        comp = jb.path(profile[jb.core.CT], 'comp')
        if not comp and comp_name:
            jb.logError(f"component {comp_name} is not defined", {'ctx': ctx})
            return {'type': 'null'}
        if comp.get('impl') is None:
            jb.logError(f"component {comp_name} has no implementation", {'ctx': ctx})
            return {'type': 'null'}

        res_ctx = jb.core.jbCtx(ctx, {})
        res_ctx.update({'parentParam': parentParam, 'params': {}})
        prepared_params = jb.core.prepareParams(comp_name, comp, profile, res_ctx)
        
        if callable(comp.get('impl')):
            comp.get('impl').__name__ = comp_name
            return {
                'type': 'profile',
                'impl': comp.get('impl'),
                'ctx': res_ctx,
                'preparedParams': prepared_params
            }
        else:
            return {
                'type': 'profile',
                'ctx': jb.core.jbCtx(res_ctx, {'profile': comp.get('impl'), 'comp': comp_name, 'path': ''}),
                'preparedParams': prepared_params
            }

    def cast_to_param(value, param):
        return jb.core.to_jstype(value, param.get('as') if param else None)

    def to_jstype(v, jstype):
        if not jstype or jstype not in jb.core.jstypes:
            return v
        return jb.core.jstypes[jstype](v)
    
class jbCtx:
    def __init__(self, ctx, ctx2=None):
        self.id = jb.core.ctxCounter
        jb.core.ctxCounter += 1

        if ctx is None:
            self.vars = {}
            self.params = {}
        else:
            if ctx2 and ctx2.get('profile') and ctx2.get('path') is None:
                ctx2['path'] = '?'
            self.profile = ctx2.get('profile', ctx.get('profile'))
            self.path = (ctx.get('path') or '') + (ctx2.get('path') or '')
            
            if ctx2.get('forcePath'):
                self.path = self.forcePath = ctx2.get('forcePath')
            if ctx2.get('comp'):
                self.path = ctx2.get('comp') + '~impl'

            self.data = ctx2.get('data', ctx.get('data'))
            self.vars = {**ctx.get('vars', {}), **ctx2.get('vars', {})}
            self.params = ctx2.get('params', ctx.get('params'))
            self.cmpCtx = ctx2.get('cmpCtx', ctx.get('cmpCtx'))
            self.probe = ctx.get('probe')

    def run(self, profile, parent_param):
        return jb.core.run(jbCtx(self, {
            'profile': jb.utils.resolveDetachedProfile(profile, jb.path(parent_param, 'type')),
            'comp': profile.get('$'),
            'path': ''
        }), parent_param)

    def exp(self, exp, jstype):
        return jb.expression.calc(exp, self, {'as': jstype})

    def setVars(self, vars):
        return jbCtx(self, {'vars': vars})

    def setVar(self, name, val):
        if name:
            if name == 'datum':
                return jbCtx(self, {'data': val})
            else:
                return jbCtx(self, {'vars': {name: val}})
        else:
            return self

    def setData(self, data):
        return jbCtx(self, {'data': data})

    def runInner(self, profile, parent_param, path):
        return jb.core.run(jbCtx(self, {'profile': profile, 'path': path}), parent_param)

    def bool(self, profile):
        return self.run(profile, {'as': 'boolean'})

    def ctx(self, ctx2):
        return jbCtx(self, ctx2)

    def frame(self):
        return jb.frame

    def extendVars(self, ctx2=None, data2=None):
        if ctx2 is None and data2 is None:
            return self
        return jbCtx(self, {
            'vars': ctx2.get('vars') if ctx2 else None,
            'data': ctx2.get('data') if data2 is None else data2,
            'forcePath': ctx2.get('forcePath') if ctx2 else None
        })

    def runItself(self, parent_param, settings=None):
        return jb.core.run(self, parent_param, settings)

    def dataObj(self, data):
        return {'data': data, 'vars': self.vars}

CoreMain.jbCtx = jbCtx
jb.extension('core','main', CoreMain)
