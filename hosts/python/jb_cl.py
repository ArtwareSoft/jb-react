import sys, json
from python_host import jbHost
from hosts.python.jb_plugin_loader import JBInit

getProcessArgument = jbHost.getProcessArgument
def calcParamsAndVars(): pass

_params = ['main', 'plugins', 'project', 'wrap', 'uri', 'dsl', 'verbose', 'runCtx', 'spy']
main, _plugins, project, wrap, uri, dsl, verbose, runCtx, spy = map(getProcessArgument, _params)

if not main and not runCtx:
    print("""usage: jb.py 
    -main:button("hello") // profile to run. mandatory or use runCtx.
    -wrap:prune(MAIN) // optional. profile that wraps the 'main' profile and will be run instead
    -sourceCode:{plugins: ['*'], libsToinit:'lib1,lib2' }
    -spy: 'remote' // optional default is 'error'
    -plugins:zui,ui  // optional (shortcut for sourceCode.plugins)
    -project:studio  // optional (shortcut for sourceCode.project)
    -uri:main // optional. jbm uri default is "main"
    -dsl:myDsl // optional. dsl of the main profile default is ""
    -verbose // show params, vars, and generated tgp code
    %v1:val // variable values
    %p1:val||script // param values
    -runCtx:... // json of runCtx instead of main/wrap/vars and params 
""")
    exit(1)

if verbose:
    import sys
    print(sys.argv)

source_code_str = getProcessArgument('sourceCode')
source_code = json.loads(source_code_str) if source_code_str else {
    'plugins': _plugins.split(',') if _plugins else [],
    'project': project,
    'pluginPackages': [{'$': 'defaultPackage'}]
}

jb = JBInit(uri or 'main', source_code)
jb.spy.init_spy({'spyParam': spy or 'error'})

# Loading remote-context.py (equivalent to remote-context.js)
plugin = jb.plugins.remote
file_symbols = next(filter(lambda x: x['path'].match(r'remote-context'), plugin['files']))
jb.load_jb_file(file_symbols['path'], jb, {'fileSymbols': file_symbols, 'plugin': plugin})
jb.initialize_libs(file_symbols['libs'])

params, vars = calcParamsAndVars()
if verbose:
    print(json.dumps({'params': params, 'vars': vars}))

wrapper_code = f"component('wrapperToRun', {{ impl: {wrap.replace('MAIN', '{{$: mainToRun}}')}}})" if wrap else ''
code = wrapper_code
# code = f"""
# params = {{ {', '.join([f"{p[0]}: {p[1] if '(' in p[1] or '{' in p[1] or '"' in p[1] else f'"{p[1]}"'}" for p in params])} }}
# component('mainToRun', {{ impl: {main} }})
# debugger
# jb.core.unresolved_profiles[0].comp.impl.update(params)
# {wrapper_code}
# """

if verbose:
    print(json.dumps({'code': code}))

comp_id, err = evalProfileDef(code, dsl)  # Assuming eval_profile_def is defined
if err:
    print(json.dumps({'error': {'desc': 'cannot resolve profile', 'err': err}}))
else:
    run_and_emit_result(lambda: jb.utils.resolve_delayed(jb.core.jb_ctx().set_vars(vars).run({'$': comp_id})))  # Assuming run_and_emit_result is defined


def calcParamsAndVars():
    global jb
    params = jb.path(jb.utils.getComp(main.split('(')[0], {'dsl': dsl}), 'params') or []
    all_args = [splitColon(arg[1:]) for arg in sys.argv[1:] if arg.startswith('%')]
    varsDict = {}
    
    for var in filter(lambda p: not isParam(p[0], params), all_args):
        ctx = jb.core.jbCtx().setVars(varsDict)
        result = evalInContext(var[1], dsl)
        profile = result['profile']
        varsDict[var[0]] = profile.run(ctx) if profile else jb.expression.calc(var[1], ctx)

    return {'vars': varsDict, 'params': list(filter(lambda p: isParam(p[0], params), all_args))}

def isParam(paramId, params):
    return any(param['id'] == paramId for param in params)

def splitColon(string):
    index = string.find(':')
    if index == -1:
        return [string]
    return [string[:index], string[index+1:]]

def evalProfileDef(code, dsl):
    try:
        jb.core.unresolvedProfiles = []
        context = {'jb': jb, **jb.macro.proxies, 'component': lambda *args: jb.component({}, dsl, *args)}
        result = eval(code,{}, context)
        compId = jb.core.unresolvedProfiles[-1]['id']
        jb.utils.resolveLoadedProfiles()
        return {'compId': compId}
    except Exception as e:
        return {'err': str(e)}

def evalInContext(code, dsl):
    try:
        context = {'jb': jb, **jb.macro.proxies, 'component': lambda *args: jb.component({}, dsl, *args)}
        return {'profile': eval(code, context)}
    except Exception as e:
        return {'err': str(e)}

