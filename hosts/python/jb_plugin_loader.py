from python_host import jbHost
import re
from jb import jb
from jb_core import extension

def unique(arr, func=lambda x: x):
    keys = {}
    res = []
    for e in arr:
        if not keys.get(func(e)):
            keys[func(e)] = True
            res.append(e)
    return res

class pluginLoader:
    def initExtension():
        jb.loadedFiles = {}
        jb.plugins = {}

    def createPlugins(plugins):
        jbHost.defaultCodePackage = jbHost.defaultCodePackage if hasattr(jbHost, 'defaultCodePackage') else jbHost.codePackageFromJson()
        for plugin in plugins:
            jb.plugins[plugin['id']] = jb.plugins.get(plugin['id'], {'codePackage': jbHost.defaultCodePackage}).update(plugin)

    def loadPluginSymbols(codePackage, loadProjects):
        def pathToPluginId(path):
            tests = '-tests' if re.search(r'-tests|testers\.js$', path) or re.search(r'/tests/', path) else ''
            pluginId = (match := re.search(r"(plugins|projects)/([^/]+)", path)) and match.group(2) or ''
            return pluginId + tests   

        pluginsSymbols = codePackage.fileSymbols('plugins')
        projectSymbols = codePackage.fileSymbols('projects') if loadProjects else []
        for entry in pluginsSymbols + [dict(x, project=True) for x in projectSymbols]:
            id = pathToPluginId(entry['path'])
            if id not in jb.plugins:
                jb.plugins[id] = {'id': id, 'codePackage': codePackage, 'files': [], 'project': entry.get('project', False)}
            jb.plugins[id]['files'].append(entry)


    def loadPlugins(plugins):
        for id in plugins:
            plugin = jb.plugins.get(id)
            if not plugin or plugin.get('loadingReq'):
                continue
            plugin['loadingReq'] = True
            jb.pluginLoader.loadPlugins(plugin.get('dependent', []))
            for fileSymbol in plugin.get('files', []):
                jb.pluginLoader.loadjbFile(fileSymbol['path'], {'fileSymbols': fileSymbol, 'plugin': plugin})

    def calcPluginDependencies(plugins):
        def pathToPluginId(path):
            tests = '-tests' if '-tests.js' in path or '/tests/' in path else ''
            return path.split('plugins/')[-1].split('/')[0] + tests

        def calcDependency(id, history=None):
            history = history or {}
            plugin = plugins.get(id)
            if not plugin:
                print('calcDependency: can not find plugin', {'id': id, 'history': history})
                return []

            if id in history:
                return []
            if plugin.get('dependent'):
                return [id] + plugin['dependent']
            
            #base_of_test = [id[:-6], 'testing'] if id.endswith('-tests') else []
            base_of_test = [id[:-6]] if id.endswith('-tests') else []
            plugin['dependent'] = unique(
                [dep for e in plugin.get('files', []) for f in e['using'] for dep in calcDependency(f, {**history, id: True})] + 
                [dep for f in base_of_test for dep in calcDependency(f, {**history, id: True})] 
            )
            
            ret = [id] + plugin['dependent']
            plugin['requiredFiles'] = unique([x for x in (plugins.get(_id, {}.get('files', [])) for _id in ret)], 
                                             lambda x : x.get('path'))
            plugin['requiredLibs'] = unique([lib for libs in (file.get('libs', []) for _id in ret for file in plugins.get(_id, {}).get('files', [])) for lib in libs])
            return ret

        for id in plugins.keys():
            calcDependency(id)

        for plugin in plugins.values():
            plugin_dsls = unique([dsl for dsls in (e.get('pluginDsl') for e in plugin.get('files', []) if e.get('pluginDsl')) for dsl in dsls])
            if len(plugin_dsls) > 1:
                print(f"plugin {plugin['id']} has more than one dsl", {'pluginDsls': plugin_dsls})
            plugin['dsl'] = plugin_dsls[0] if plugin_dsls else None

        for plugin in [p for p in plugins.values() if pathToPluginId(p['id']).endswith('-tests')]:
            base_id = plugin['id'][:-6]
            plugin['dsl'] = plugins.get(base_id, {}).get('dsl')

        for id in plugins.keys():
            calcDependency(id)

    def loadjbFile(path, options=None):
        if jb.loadedFiles.get(path):
            return

        _code = options['plugin']['codePackage'].fetchFile(path)
        sourceUrl = f"{path}?{jb.uri}".replace("#", "")
        code = f"{_code}\n//# sourceURL={sourceUrl}"

        dsl = options.get('fileSymbols', {}).get('dsl') if options and 'fileSymbols' in options else options['plugin'].get('dsl')

        if options and options.get('noSymbols'):
            proxies = {}
        else:
            required_files_ns = [x['ns'] for x in options['plugin'].get('requiredFiles', [])]
            unique_ns = set(sum(required_files_ns, []))
            proxies = {}
            for id in unique_ns:
                proxies.update(jb.macro.registerProxy(id))

        context = {
            'jb': jb,
            **proxies,
            'component': lambda *args: jb.component(options['plugin'], dsl, *args),
            'extension': lambda *args: jb.extension(options['plugin'], *args),
            'using': lambda x: jb.using(x),
            'dsl': lambda x: jb.dsl(x),
            'pluginDsl': lambda x: jb.pluginDsl(x)
        }

        try:
            exec(code, {}, context)
            jb.loadedFiles[path] = True
        except Exception as e:
            return jb.logException(e, f"loadjbFile lib {path}", {'context': context, 'code': code})
        
    def initSourceCode(uri, source_code):
        jb.update(uri=uri, source_code = source_code)
        if not source_code: return
        for code_package in source_code.get('pluginPackages', [None]):
            jb.pluginLoader.loadPluginSymbols(jbHost.codePackageFromJson(code_package), source_code['project'])

        jb.pluginLoader.calcPluginDependencies(jb.plugins)

        core_plugins = ['jb-core', 'core-utils', 'jb-expression', 'db', 'jb-macro', 'spy']
        for path in [f"/plugins/core/{x}.js" for x in core_plugins]:
            jb.loadjbFile(path, jb, {'noSymbols': True, 'plugin': jb.plugins['core']})

        jb.no_supervised_load = False

        source_plugins = source_code['plugins']
        top_plugins = unique(jb.as_array(source_code['project']) + 
                                  (list(jb.plugins.values()) if '*' in source_plugins else source_plugins))

        jb.loadPlugins(top_plugins)
        libs = unique([plugin for id, plugin in jb.plugins.items() for plugin_id in top_plugins if id == plugin_id]['requiredLibs'])

        libs_to_init = source_code.get('libsToInit', ",".join(libs)).split(',')
        jb.initialize_libs(libs_to_init)
        jb.utils.resolve_loaded_profiles()

extension('pluginLoader','main', pluginLoader)

def _profile_factory(id): return lambda *args, **kwargs: (id, args, kwargs)
def registerComps(globs):
    comps = [x for x in globs.items() if isinstance(x[1], dict) and 'jbComp' in x[1] ]
    jb.comps.update(dict((x[0], x[1]['jbComp']) for x in comps))
    factories = dict((x[0], _profile_factory(x[0])) for x in comps)
    globs.update(factories)
    return list(factories)