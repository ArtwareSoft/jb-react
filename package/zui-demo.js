async function jbLoadPacked({uri,initSpyByUrl,multipleInFrame}={}) {
const jb = {"sourceCode":{"plugins":["zui-demo"]},"loadedFiles":{},"plugins":{"common":{"id":"common","dependent":["core"],"proxies":["list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test"],"files":["/plugins/common/jb-common.js","/plugins/common/pipeline.js"]},"core":{"id":"core","dependent":[],"proxies":["call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test"],"files":["/plugins/core/core-components.js","/plugins/core/core-utils.js","/plugins/core/db.js","/plugins/core/jb-core.js","/plugins/core/jb-expression.js","/plugins/core/jb-macro.js","/plugins/core/spy.js"]},"llm-api":{"id":"llm-api","dependent":["common","core","parsing"],"proxies":["llmViaApi","system","assistant","user","llm","source","list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test","extractText","breakText","zipArrays","removeSections","merge","clone","filterEmptyProperties","trim","splitToLines","newLine","removePrefixRegex","wrapAsObject","substring","Undefined","switchByArraySize","asString"],"dslOfFiles":[["/plugins/llm/api/llm-via-api.js","llm"]],"files":["/plugins/llm/api/llm-via-api.js"]},"loader":{"id":"loader","dependent":[],"proxies":["sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"dslOfFiles":[["/plugins/loader/source-code.js","loader"]],"files":["/plugins/loader/jb-loader.js","/plugins/loader/source-code.js"]},"parsing":{"id":"parsing","dependent":["common","core"],"proxies":["extractText","breakText","zipArrays","removeSections","merge","clone","filterEmptyProperties","trim","splitToLines","newLine","removePrefixRegex","wrapAsObject","substring","Undefined","switchByArraySize","asString","list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test"],"files":["/plugins/parsing/parsing.js"]},"remote-jbm":{"id":"remote-jbm","dependent":["loader","tree-shake","common","core","tgp-formatter","rx","watchable"],"proxies":["stateless","worker","webWorker","child","cmd","byUri","jbm","parent","isNode","isVscode","nodeOnly","remoteNodeWorker","nodeWorker","remote","remoteCtx","source","sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile","treeShake","treeShakeClientWithPlugins","treeShakeClient","list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test","prettyPrint","rx","sink","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue","runTransaction"],"dsl":"jbm","files":["/plugins/remote/jbm/jbm-utils.js","/plugins/remote/jbm/jbm.js","/plugins/remote/jbm/node-worker.js","/plugins/remote/jbm/remote-cmd.js","/plugins/remote/jbm/remote-context.js","/plugins/remote/jbm/remote.js"]},"rx":{"id":"rx","dependent":["watchable","common","core"],"proxies":["source","rx","sink","action","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","Var","resource","reduce","count","joinIntoVariable","join","max","Do","doPromise","map","mapPromise","filter","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","unique","catchError","timeoutLimit","throwError","debounceTime","throttleTime","delay","replay","takeUntil","take","takeWhile","toArray","last","skip","log","consoleLog","sniffer","subscribe","writeValue","rxSubject","subjectNext","subject","rxQueue","runTransaction","list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","min","sum","slice","sort","first","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","unknownCmp","runCtx","asIs","isRef","asRef","test"],"dslOfFiles":[["/plugins/rx/rx.js","rx"]],"files":["/plugins/rx/jb-callbag.js","/plugins/rx/rx-comps.js","/plugins/rx/rx.js"]},"testing":{"id":"testing","dependent":["remote-jbm","loader","tree-shake","common","core","tgp-formatter","rx","watchable"],"proxies":["globals","watchablePeople","person","personWithAddress","personWithPrimitiveChildren","personWithChildren","emptyArray","people","peopleWithChildren","stringArray","stringTree","city","village","state","israel","israel2","jerusalem","eilat","nokdim","pipeline","nameOfCity","phones","dataTest","source","tests","test","tester","testServer","pluginTest","PROJECTS_PATH","stateless","worker","webWorker","child","cmd","byUri","jbm","parent","isNode","isVscode","nodeOnly","remoteNodeWorker","nodeWorker","remote","remoteCtx","sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile","treeShake","treeShakeClientWithPlugins","treeShakeClient","list","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","assign","extendWithObj","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","If","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","prettyPrint","rx","sink","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue","runTransaction"],"dslOfFiles":[["/plugins/testing/location-dsl-for-testing.js","location"]],"files":["/plugins/testing/generic-tests-data.js","/plugins/testing/location-dsl-for-testing.js","/plugins/testing/phones-tests-data.js","/plugins/testing/testers.js"]},"tgp-formatter":{"id":"tgp-formatter","dependent":[],"proxies":["prettyPrint"],"files":["/plugins/tgp/formatter/pretty-print.js"]},"tree-shake":{"id":"tree-shake","dependent":["loader"],"proxies":["treeShake","treeShakeClientWithPlugins","treeShakeClient","sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"files":["/plugins/tree-shake/tree-shake.js"]},"watchable":{"id":"watchable","dependent":[],"proxies":["runTransaction"],"files":["/plugins/watchable/watchable.js"]},"zui-demo":{"id":"zui-demo","dependent":["zui","llm-api","common","core","parsing","testing","remote-jbm","loader","tree-shake","tgp-formatter","rx","watchable"],"proxies":["healthCare","prop","init","props","variable","variableForChildren","features","method","If","html","htmlOfItem","css","zoomingCss","frontEnd","source","group","allOrNone","firstToFit","children","vertical","horizontal","iconBox","card","itemlist","grid","spiral","zoomingGridElem","xyByProps","xyByIndex","groupByScatter","zoomingSize","fixed","fill","session","zui","model","o1","o1-mini","gpt35","itemColor","colorByItemValue","Case","borderStyle","borderStyleScale3","opacity","opacityScale","symbol","symbolByItemValue","list","success3","unitScale","index","severity5","good5","success5","distinct5","distinct10","green10","gray5","gray10","coolToWarm10","zuiTest","zuiControlRunner","animationEvent","zoomEvent","widget","app","widgetFE","llmViaApi","system","assistant","user","llm","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test","extractText","breakText","zipArrays","removeSections","merge","clone","filterEmptyProperties","trim","splitToLines","newLine","removePrefixRegex","wrapAsObject","substring","Undefined","switchByArraySize","asString","globals","watchablePeople","person","personWithAddress","personWithPrimitiveChildren","personWithChildren","emptyArray","people","peopleWithChildren","stringArray","stringTree","city","village","state","israel","israel2","jerusalem","eilat","nokdim","nameOfCity","phones","dataTest","tests","tester","testServer","pluginTest","PROJECTS_PATH","stateless","worker","webWorker","child","cmd","byUri","jbm","parent","isNode","isVscode","nodeOnly","remoteNodeWorker","nodeWorker","remote","remoteCtx","sourceCode","sourceCodeByTgpPath","plugins","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile","treeShake","treeShakeClientWithPlugins","treeShakeClient","prettyPrint","rx","sink","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue","runTransaction"],"dslOfFiles":[["/plugins/zui/demo/health-care-comps.js","zui"]],"files":["/plugins/zui/demo/health-care-comps.js","/plugins/zui/demo/health-care-data.js"]},"zui":{"id":"zui","dependent":["llm-api","common","core","parsing","testing","remote-jbm","loader","tree-shake","tgp-formatter","rx","watchable"],"proxies":["prop","init","props","variable","variableForChildren","features","method","If","html","htmlOfItem","css","zoomingCss","frontEnd","source","group","allOrNone","firstToFit","children","vertical","horizontal","iconBox","card","itemlist","grid","spiral","zoomingGridElem","xyByProps","xyByIndex","groupByScatter","zoomingSize","fixed","fill","session","zui","model","o1","o1-mini","gpt35","itemColor","colorByItemValue","Case","borderStyle","borderStyleScale3","opacity","opacityScale","symbol","symbolByItemValue","list","success3","unitScale","index","severity5","good5","success5","distinct5","distinct10","green10","gray5","gray10","coolToWarm10","zuiTest","zuiControlRunner","animationEvent","zoomEvent","widget","app","widgetFE","llmViaApi","system","assistant","user","llm","firstSucceeding","firstNotEmpty","keys","values","properties","mapValues","entries","plus","minus","mul","div","math","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","obj","dynamicObject","objFromVars","selectProps","transformProp","extend","assign","extendWithObj","extendWithIndex","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","removeProps","delay","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","fileContent","calcDirectory","pipeline","pipe","aggregate","objFromProperties","objFromEntries","join","unique","max","min","sum","slice","sort","first","last","count","reverse","sample","splitByPivot","groupBy","groupProps","call","typeAdapter","TBD","Var","unknownCmp","runCtx","log","asIs","isRef","asRef","test","extractText","breakText","zipArrays","removeSections","merge","clone","filterEmptyProperties","trim","splitToLines","newLine","removePrefixRegex","wrapAsObject","substring","Undefined","switchByArraySize","asString","globals","watchablePeople","person","personWithAddress","personWithPrimitiveChildren","personWithChildren","emptyArray","people","peopleWithChildren","stringArray","stringTree","city","village","state","israel","israel2","jerusalem","eilat","nokdim","nameOfCity","phones","dataTest","tests","tester","testServer","pluginTest","PROJECTS_PATH","stateless","worker","webWorker","child","cmd","byUri","jbm","parent","isNode","isVscode","nodeOnly","remoteNodeWorker","nodeWorker","remote","remoteCtx","sourceCode","sourceCodeByTgpPath","plugins","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile","treeShake","treeShakeClientWithPlugins","treeShakeClient","prettyPrint","rx","sink","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue","runTransaction"],"dslOfFiles":[["/plugins/zui/zui-features.js","zui"],["/plugins/zui/zui-group.js","zui"],["/plugins/zui/zui-icon-box.js","zui"],["/plugins/zui/zui-itemlist.js","zui"],["/plugins/zui/zui-items-layout.js","zui"],["/plugins/zui/zui-layout.js","zui"],["/plugins/zui/zui-llm.js","zui"],["/plugins/zui/zui-scale.js","zui"],["/plugins/zui/zui-tester.js","zui"],["/plugins/zui/zui-widget.js","zui"],["/plugins/zui/zui-zoom.js","zui"]],"files":["/plugins/zui/zui-card.js","/plugins/zui/zui-control.js","/plugins/zui/zui-features.js","/plugins/zui/zui-group.js","/plugins/zui/zui-icon-box.js","/plugins/zui/zui-itemlist.js","/plugins/zui/zui-items-layout.js","/plugins/zui/zui-layout.js","/plugins/zui/zui-llm.js","/plugins/zui/zui-scale.js","/plugins/zui/zui-tester.js","/plugins/zui/zui-widget.js","/plugins/zui/zui-zoom.js"]}}}
if (!multipleInFrame) globalThis.jb = jb
jb.uri = uri || 'main'
jb.startTime = new Date().getTime()
function jbCreatePlugins(jb,plugins) {
  jbHost.defaultCodePackage = jbHost.defaultCodePackage || jbHost.codePackageFromJson()
  plugins.forEach(plugin=> {
    jb.plugins[plugin.id] = jb.plugins[plugin.id] || { ...plugin, codePackage : jbHost.defaultCodePackage }
  })
}
function jbLoadPackedFile({lineInPackage, jb, noProxies, path,fileDsl,pluginId}, loadFunc) {
  if (jb.loadedFiles[path]) return
  const plugin = jb.plugins[pluginId]
  const proxies = noProxies ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
  const context = { jb, 
    ...(typeof require != 'undefined' ? {require} : {}),
    ...proxies,
    component:(id,comp) => jb.component(id,comp,{plugin,fileDsl,path,lineInPackage}),
    extension:(libId, p1 , p2) => jb.extension(libId, p1 , p2,{plugin,path,lineInPackage}),
    using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
  }
  try {
      loadFunc(context)
      jb.loadedFiles[path] = true
  } catch (e) {
  }
}

jbloadPlugins(jb,jbLoadPackedFile)
if (initSpyByUrl) jb.spy.initSpyByUrl()

jb.initializeTypeRules(["zui","test","common","utils","db","core","expression","macro","syntaxConverter","spy","location","cbHandler","net","jbm","webSocket","remoteCtx","loader","treeShake","callbag","watchable","immutable"])
await jb.initializeLibs(["zui","test","common","utils","db","core","expression","macro","syntaxConverter","spy","location","cbHandler","net","jbm","webSocket","remoteCtx","loader","treeShake","callbag","watchable","immutable"])
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}

function jbloadPlugins(jb,jbLoadPackedFile) {
jbLoadPackedFile({lineInPackage:44, jb, noProxies: true, path: '/plugins/core/jb-core.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
Object.assign(jb, {
  extension(libId, p1 , p2,{plugin,path,lineInPackage}={}) {
    const extId = typeof p1 == 'string' ? p1 : 'main'
    const extension = p2 || p1
    const lib = jb[libId] = jb[libId] || {__extensions: {} }
    const funcs = Object.keys(extension).filter(k=>typeof extension[k] == 'function').filter(k=>!k.match(/^initExtension/))
    const initialized = !!lib.__extensions[extId]
    funcs.forEach(k=> {
      extension[k].extId = extId
      extension[k].__initFunc = extension.initExtension && `#${libId}.__extensions.${extId}.init`
    })
    funcs.forEach(k=>lib[k] = extension[k])
    const location = jb.calcSourceLocation(new Error().stack.split(/\r|\n/).slice(2), plugin,path,lineInPackage)
    const phase =  extension.$phase || { core: 1, utils: 5, db: 10, watchable: 20}[libId] || 100
    if (extension.initExtension) 
      extension.initExtension.requireFuncs = extension.$requireFuncs
    lib.__extensions[extId] = { plugin, libId, phase, init: extension.initExtension, initialized, typeRules: extension.typeRules,
      requireLibs: extension.$requireLibs, requireFuncs: extension.$requireFuncs, funcs, location }

    if (jb.noSupervisedLoad && extension.initExtension) {
      Object.assign(lib, extension.initExtension.apply(lib))
      lib.__extensions[extId].initialized = true
    }
  },
  async initializeLibs(_libs) {
    const jb = this
    const unknownLibs = _libs.filter(l=>!jb[l]).join(',')
    unknownLibs && jb.logError('initializeLibs: unknownLibs',{unknownLibs})
    const libs = _libs.filter(l=>jb[l])
    try {
    libs.flatMap(l => Object.values(jb[l].__extensions)).sort((x,y) => x.phase - y.phase )
      .filter(ext => ext.init && !ext.initialized)
      .forEach(ext => {          
          Object.assign(jb[ext.libId], ext.init.apply(jb[ext.libId]))
          ext.initialized = true
      })
    } catch (e) {
      jb.logException(e,'initializeLibs: error initializing libs', {libs})
    }
    const libsToLoad = libs.flatMap(l => Object.values(jb[l].__extensions))
      .flatMap(ext => (ext.requireLibs || []).filter(url => !jb.__requiredLoaded[url]).map(url=>({url,plugin: ext.plugin})) )
    try {
      await Promise.all(libsToLoad.map( ({url,plugin}) => Promise.resolve(loadLib(url,plugin))
        .then(() => jb.__requiredLoaded[url] = true) ))
    } catch (e) {
      jb.logException(e,'initializeLibs: error loading external library', {libsToLoad, libs})
    }

    async function loadLib(url,plugin) {
      const codePackage = plugin.codePackage || jbHost.codePackageFromJson()
      try {
        jb.log(`loading library ${url}`,{plugin})
        if (codePackage.loadLib) 
          return codePackage.loadLib(url)
        const code = '' + await codePackage.fetchFile(`${jbHost.baseUrl||''}${url}`)
        eval(code)
      } catch(e) {
        jb.logError('error loading library',{url,plugin})
      }
    }
  },
  initializeTypeRules(libs) {
    jb.macro.initializedTypeRules = jb.macro.initializedTypeRules || {}
    jb.macro.typeRules = [...(jb.macro.typeRules||[]), ...libs.filter(l=>jb[l]).flatMap(l => Object.entries(jb[l].__extensions))
      .flatMap(([extId,ext])=>{
        const key = `${ext.libId}--${extId}`
        if (jb.macro.initializedTypeRules[key]) return []
        jb.macro.initializedTypeRules[key] = true
        return ext.typeRules||[]
      })]
  },
  calcSourceLocation(errStack,plugin,_path,lineInPackage) {
    try {
        const line = errStack.map(x=>x.trim()).filter(x=>x && !x.match(/^Error/) && !x.match(/at Object.component|at component|at extension/)).shift()
        const location = line ? (line.split('at ').pop().split('eval (').pop().split(' (').pop().match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        location[0] = location[0].split('?')[0]
        if (location[0].match(/jb-loader.js/)) debugger
        const path = _path || location[0]
        return { repo: ((plugin || {}).codePackage || {}).repo||'', path, line: location[1] - (lineInPackage || 0) }
    } catch(e) {
      console.log(e)
    }      
  },
  component(id,comp,{plugin, fileDsl,path,lineInPackage} = {}) {
    if (!jb.core.CT) jb.initializeLibs(['core']) // this line must be first
    plugin = plugin || jb.plugins[comp.$plugin] || {}
    comp.$comp = true
    comp.$fileDsl = comp.$fileDsl || fileDsl || ''
    comp.$plugin = comp.$plugin || plugin.id || ''
    comp.$dsl = comp.$dsl || fileDsl || plugin.dsl || ''
    // const line = (comp_locations && comp_locations.find(x=>x[0] == id) || [])[1]
    // if (line !== null) comp.$location = {line, path}
    comp.$location = comp.$location || jb.calcSourceLocation(new Error().stack.split(/\r|\n/), plugin,path,lineInPackage) || ''

    if (comp.type == 'any')
      jb.core.genericCompIds[id] = true

    comp.impl = comp.impl || (({params}) => params) // maybe we need $impl ...
    const h = jb.core.onAddComponent.find(x=>x.match(id,comp))
    if (h && h.register)
      return h.register(id,comp)

    jb.core.unresolvedProfiles.push({id,comp})
    if (comp.isSystem || comp.isMacro)
      jb.comps[id] = comp
    return comp
  },
  dsl() {},
  pluginDsl() {},
  using() {},
  noSupervisedLoad: true
})

extension('core', {
  initExtension() {
    Object.assign(jb, {
      [Symbol.for('jb-version')]: '4.1.0beta',
      frame: globalThis,
      comps: {}, ctxDictionary: {},
      __requiredLoaded: {},
    })
    return {
      ctxCounter: 0,
      VERSION: Symbol.for('jb-version'),
      CT: Symbol.for('CT'), // compile time
      jstypes: jb.core._jsTypes(),
      onAddComponent: [],
      unresolvedProfiles: [],
      genericCompIds: {}
    }
  },
  run(ctx,parentParam,settings) {
    //  ctx.profile && jb.log('core request', [ctx.id,...arguments])
      if (ctx.probe && !ctx.probe.active)
        ctx.probe = null
      const runner = () => jb.core.doRun(...arguments)
      Object.defineProperty(runner, 'name', { value: `${ctx.path} ${ctx.profile && ctx.profile.$ ||''}-run` })
      // if (ctx.probe)
      //   ctx.profile = ctx.probe.alternateProfile(ctx)
      let res = runner(...arguments)
      if (ctx.probe)
          res = jb.probe.record(ctx,res) || res
      
    //  ctx.profile && jb.log('core result', [ctx.id,res,ctx,parentParam,settings])
      if (typeof res == 'function') jb.utils.assignDebugInfoToFunc(res,ctx)
      return res
  },
  doRun(ctx,parentParam,settings) {
    try {
      const profile = ctx.profile
      if (profile == null || (typeof profile == 'object' && profile.$disabled))
        return jb.core.castToParam(null,parentParam)
      //if (ctx.path == 'test<>dataTest.join~impl~calculate') debugger
      if (profile.data && ! jb.path(settings, 'dataUsed')) {
          const data = ctx.setData(ctx.runInner(profile.data, {}, 'data'))
          // if (jb.utils.isPromise(data))
          //   return data.then(_data=>jb.core.doRun(_data,parentParam,{...(settings||{}), dataUsed: true}))
          return jb.core.doRun(data,parentParam,{...(settings||{}), dataUsed: true})
      }

      if (profile.$asIs) return profile.$asIs
      if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
          parentParam.as = 'array'

      if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
        return
      const ctxWithVars = jb.path(settings, 'resolvedCtxWithVars') ? ctx : jb.core.extendWithVars(ctx,profile.$vars)
      if (jb.utils.isPromise(ctxWithVars))
        return ctxWithVars.then(resolvedCtxWithVars => jb.core.doRun(resolvedCtxWithVars,parentParam,{...(settings||{}), resolvedCtxWithVars: true}))
      const run = jb.core.prepare(ctxWithVars,parentParam)
      ctx.parentParam = parentParam
      const {castToParam } = jb.core
      if (profile.$debug) debugger
      switch (run.type) {
        case 'booleanExp': return castToParam(jb.expression.calcBool(profile, ctx,parentParam), parentParam)
        case 'expression': return castToParam(jb.expression.calc(profile, ctx,parentParam), parentParam)
        case 'asIs': return profile
        case 'function': return castToParam(profile(ctx,ctx.vars,ctx.cmpCtx && ctx.cmpCtx.params),parentParam)
        case 'null': return castToParam(null,parentParam)
        case 'ignore': return ctx.data
        case 'list': return profile.map((inner,i) => ctxWithVars.runInner(inner,null,i))
        case 'runActions': return jb.comps['action<>runActions'].impl(new jb.core.jbCtx(ctxWithVars,{profile: { actions : profile },path:''}))
        case 'profile':
          if (!run.impl)
            run.ctx.callerPath = ctx.path;
          const calcParam = paramObj => {
            const paramVal = paramObj.type == 'function' ? paramObj.outerFunc(run.ctx) 
            : paramObj.type == 'primitive' ? paramObj.val
            : paramObj.type == 'array' ? paramObj.array.flatMap(function prepareParamItem(prof,i) { 
                  return prof != null && jb.core.run(new jb.core.jbCtx(run.ctx,{
                        profile: prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path+ '~' + i, path: ''}), paramObj.param)
                  })
            : jb.core.run(new jb.core.jbCtx(run.ctx,{profile: paramObj.prof, forcePath: paramObj.forcePath || ctx.path + '~' + paramObj.path, path: ''}), paramObj.param);
            return paramVal
          }

          Object.defineProperty(calcParam, 'name', { value: `${run.ctx.path} ${profile.$ ||''}-calc param` })

          run.preparedParams.forEach(paramObj => run.ctx.params[paramObj.name] = calcParam(paramObj))
          const out = run.impl ? run.impl.call(null,run.ctx,...run.preparedParams.map(param=>run.ctx.params[param.name]))
            : jb.core.run(new jb.core.jbCtx(run.ctx, { cmpCtx: run.ctx }),parentParam)
          return castToParam(out,parentParam)
      }
    } catch (e) {
      if (ctx.vars.$throw || e == 'probe tails') throw e
      jb.logException(e,'exception while running run',{ctx,parentParam,settings})
    }
  },
  extendWithVars(ctx,vars) {
    if (Array.isArray(vars) && vars.find(x=>x.async))
        return vars.reduce( async (_ctx,{name,val},i) => {
          const ctx = await _ctx
          return ctx.setVar(name, await ctx.runInner(val || '%%', null,`$vars~${i}~val`))
        } , ctx)
    if (Array.isArray(vars))
      return vars.reduce((_ctx,{name,val},i) => _ctx.setVar(name,_ctx.runInner(val || '%%', null,`$vars~${i}~val`)), ctx )
    if (vars)
      jb.logError('$vars should be array',{ctx,vars})
    return ctx
  },
  prepareParams(comp_name,comp,profile,ctx) {
    return jb.utils.compParams(comp)
      .filter(param=> !param.ignore)
      .map(param => {
        const p = param.id
        let val = profile[p], path =p
        const nullValueOfParam = typeof val == 'string' && val == `%$${p}%` && ctx.cmpCtx && ctx.cmpCtx.params[p] === null
        const defaultValue = param.defaultValue
        const defaultValuePath = defaultValue !== undefined && [comp_name, 'params', jb.utils.compParams(comp).indexOf(param), 'defaultValue'].join('~')
        const isNullValue = val === undefined || nullValueOfParam
        const valOrDefault = isNullValue ? (defaultValue !== undefined ? defaultValue : null) : val
      //  const isNullValueOld = val === undefined // || nullValueOfParam
      //  const valOrDefaultOld = isNullValueOld ? (defaultValue !== undefined ? defaultValue : null) : val
      //  if (valOrDefault !== valOrDefaultOld) debugger

        const usingDefault = isNullValue && defaultValue !== undefined
        const forcePath = usingDefault && defaultValuePath
        if (forcePath) path = ''

        const valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
        const arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray)
        //if (param.type && param.type.indexOf('[]') > -1 && !Array.isArray(valOrDefaultArray)) debugger

        if (param.dynamic) {
          const outerFunc = runCtx => {
            let func;
            if (arrayParam)
              func = (ctx2,data2) => valOrDefaultArray.flatMap((prof,i)=> runCtx.extendVars(ctx2,data2).runInner(prof, {...param, as: 'asIs'}, path+'~'+i))
            else
              func = (ctx2,data2) => jb.core.run(new jb.core.jbCtx(runCtx.extendVars(ctx2,data2),{ profile: valOrDefault, forcePath, path } ),param)

            const debugFuncName = valOrDefault && valOrDefault.$ || typeof valOrDefault == 'string' && valOrDefault.slice(0,10) || ''
            Object.defineProperty(func, 'name', { value: p + ': ' + debugFuncName })
            Object.assign(func,{profile: valOrDefault,runCtx,path,srcPath: ctx.path,forcePath,param})
            return func
          }
          return { name: p, type: 'function', outerFunc, path, param, forcePath };
        }

        if (arrayParam) // array of profiles
          return { name: p, type: 'array', array: valOrDefaultArray, param: Object.assign({},param,{type:param.type.split('[')[0],as:null}), forcePath, path };
        if (param.as == 'string' && typeof valOrDefault == 'string' && valOrDefault.indexOf('%') == -1)
          return { name: p, type: 'primitive', val: valOrDefault }
        return { name: p, type: 'run', prof: valOrDefault, param, forcePath, path };
    })
  },
  prepare(ctx,parentParam) {
    const profile = ctx.profile
    const profile_jstype = typeof profile
    const parentParam_type = parentParam && parentParam.type
    const jstype = parentParam && parentParam.as
    const isArray = Array.isArray(profile)

    if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' }
    if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' }// native primitives
    if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' }
    if (profile_jstype === 'string') return { type: 'expression' }
    if (profile_jstype === 'function') return { type: 'function' }
    if (profile_jstype === 'object' && (profile instanceof RegExp)) return { type: 'asIs' }
    if (profile == null) return { type: 'asIs' }

    if (isArray) {
      if (!profile.length) return { type: 'null' }
      if (!parentParam || !parentParam.type || parentParam.type === 'data' ) //  as default for array
        return { type: 'list' }
      if (parentParam_type === 'action' || parentParam_type === 'action[]' && profile.isArray) {
        profile.sugar = true
        return { type: 'runActions' }
      }
    }
    const comp_name = profile.$$
    if (!comp_name)
      return { type: 'asIs' }
    if (profile.$unresolved)
      jb.logError(`core: prepare - unresolved profile at ${ctx.path}`, {profile, ctx})

    const comp = jb.comps[comp_name]
    if (!comp && comp_name) { jb.logError('component ' + comp_name + ' is not defined', {ctx}); return { type:'null' } }
    if (comp.impl == null) { jb.logError('component ' + comp_name + ' has no implementation', {ctx}); return { type:'null' } }

    const resCtx = Object.assign(new jb.core.jbCtx(ctx,{}), {parentParam, params: {}})
    const preparedParams = jb.core.prepareParams(comp_name,comp,profile,resCtx)
    if (typeof comp.impl === 'function') {
      Object.defineProperty(comp.impl, 'name', { value: comp_name })
      return { type: 'profile', impl: comp.impl, ctx: resCtx, preparedParams }
    } else
      return { type:'profile', ctx: new jb.core.jbCtx(resCtx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams }
  },
  castToParam: (value,param) => jb.core.tojstype(value,param ? param.as : null),
  tojstype: (v,jstype) => (!jstype || !jb.core.jstypes[jstype]) ? v : jb.core.jstypes[jstype](v),
  jbCtx: class jbCtx {
    constructor(ctx,ctx2) {
      this.id = jb.core.ctxCounter++
  //    this._parent = ctx
      if (typeof ctx == 'undefined') {
        this.vars = {}
        this.params = {}
      } else {
        if (ctx2.profile && ctx2.path == null) {
          debugger
          ctx2.path = '?'
        }
        this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : ctx.profile

        this.path = (ctx.path || '') + (ctx2.path ? '~' + ctx2.path : '')
        if (ctx2.forcePath)
          this.path = this.forcePath = ctx2.forcePath
        if (ctx2.comp)
          this.path = ctx2.comp + '~impl'
        this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : ctx.data     // allow setting of data:null
        this.vars= ctx2.vars ? Object.assign({},ctx.vars,ctx2.vars) : ctx.vars
        this.params= ctx2.params || ctx.params
        this.cmpCtx= (typeof ctx2.cmpCtx != 'undefined') ? ctx2.cmpCtx : ctx.cmpCtx
        this.probe= ctx.probe
      }
    }
    run(profile,parentParam) {
      const expectedType = typeof parentParam == 'string' ? parentParam : jb.path(parentParam,'$type') || jb.path(parentParam,'type')
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType}), comp: profile.$ , path: ''}), parentParam)
    }
    calc(profile) {
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType: 'data<>'}), comp: profile.$ , path: ''}))
    }
    runAction(profile) {
      return jb.core.run(new jb.core.jbCtx(this,{ profile: jb.utils.resolveProfile(profile, {expectedType: 'action<>'}), comp: profile.$ , path: ''}))
    }
    exp(exp,jstype) { return jb.expression.calc(exp, this, {as: jstype}) }
    setVars(vars) { return new jb.core.jbCtx(this,{vars: vars}) }
    setVar(name,val) { return name ? (name == 'datum' ? new jb.core.jbCtx(this,{data:val}) : new jb.core.jbCtx(this,{vars: {[name]: val}})) : this }
    setData(data) { return new jb.core.jbCtx(this,{data: data}) }
    runInner(profile,parentParam, path) { return jb.core.run(new jb.core.jbCtx(this,{profile: profile,path}), parentParam) }
    bool(profile) { return this.run(profile, { as: 'boolean'}) }
    // keeps the ctx vm and not the caller vm - needed in studio probe
    ctx(ctx2) { return new jb.core.jbCtx(this,ctx2) }
    frame() { // used for multi windows apps. e.g., studio
      return jb.frame
    }
    extendVars(ctx2,data2) {
      if (ctx2 == null && data2 == null)
        return this;
      return new jb.core.jbCtx(this, {
        vars: ctx2 ? ctx2.vars : null,
        data: (data2 == null) ? ctx2.data : data2,
        forcePath: (ctx2 && ctx2.forcePath) ? ctx2.forcePath : null
      })
    }
    runItself(parentParam,settings) { return jb.core.run(this,parentParam,settings) }
    dataObj(out,vars,input) { 
      this.probe && jb.probe.record(this,out,input||out,vars)
      return {data: out, vars: vars || this.vars} 
    }
  },
  _jsTypes() { return {
    asIs: x => x,
    object(value) {
      if (Array.isArray(value))
        value = value[0]
      if (value && typeof value === 'object')
        return jb.val(value)
      return {}
    },
    string(value) {
      if (Array.isArray(value)) value = value[0]
      if (value == null) return ''
      value = jb.val(value)
      if (typeof(value) == 'undefined') return ''
      return '' + value
    },
    number(value) {
      if (Array.isArray(value)) value = value[0]
      if (value == null || value == undefined) return null // 0 is not null
      const num = Number(jb.val(value),true)
      return isNaN(num) ? null : num
    },
    array(value) {
      if (typeof value == 'function' && value.profile)
        value = value()
      value = jb.val(value)
      if (Array.isArray(value)) return value
      if (value == null) return []
      return [value]
    },
    boolean(value) {
      if (Array.isArray(value)) value = value[0]
      value = jb.val(value)
      return value && value != 'false' ? true : false
    },
    single(value) {
      if (Array.isArray(value))
        value = value[0]
      return jb.val(value)
    },
    ref(value) {
      if (Array.isArray(value))
        value = value[0]
      return jb.db.asRef(value)
    },
    'ref[]': function(value) {
      return jb.db.asRef(value)
    },
    value(value) {
      return jb.val(value)
    }
  }}
})

});

jbLoadPackedFile({lineInPackage:474, jb, noProxies: true, path: '/plugins/core/core-utils.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
// core utils promoted for easy usage
Object.assign(jb, {
    log(logName, record, options) { jb.spy && jb.spy.enabled && jb.spy.log(logName, record, options) },
    logError(err,logObj) {
      const ctx = jb.path(logObj,'ctx')
      const stack = ctx && jb.utils.callStack(ctx)
      jb.frame.window && jb.frame.console.error('%c Error: ','color: red', err, stack, logObj)
      const errObj = { err , ...logObj, stack}
      globalThis.jbHost.process && globalThis.jbHost.process.stderr.write(err)
      jb.spy && jb.spy.log('error', errObj)
    },
    logException(e,err,logObj) {
      jb.frame.window && jb.frame.console.log('%c Exception: ','color: red', err, e, logObj)
      const errObj = { e, err, stack: e.stack||'', ...logObj}
      globalThis.jbHost.process && globalThis.jbHost.process.stderr.write(`${err}\n${e}`)
      jb.spy && jb.spy.log('exception error', errObj)
    },
    tostring: value => jb.core.tojstype(value,'string'),
    toarray: value => jb.core.tojstype(value,'array'),
    toboolean: value => jb.core.tojstype(value,'boolean'),
    tosingle: value => jb.core.tojstype(value,'single'),
    tonumber: value => jb.core.tojstype(value,'number'),
    exec: (profile,parentParam='action<>') => new jb.core.jbCtx().run(profile,parentParam),
    calc: profile => new jb.core.jbCtx().calc(profile)
})

extension('utils', 'core', {
    // singleInType(parentParam, tgpModel) {
    //     const comps = tgpModel && tgpModel.comps || jb.comps
    //     const _type = parentParam && parentParam.type && parentParam.type.split('[')[0]
    //     return _type && comps[_type] && comps[_type].singleInType && _type
    // },
    dslType(fullId) {
      if (fullId.indexOf('<') == -1)
        jb.logError(`util dslType not fullId ${fullId}`,{})
      return (fullId || '').split('>')[0] + '>'
    },
    compName(profile) {
        return profile && profile.$$
    },
    resolveSingleComp(comp,id,{ tgpModel, dsl} = {}) {
      jb.utils.resolveProfileTop(id,comp, { tgpModel})
      jb.utils.resolveUnTypedProfile(comp,id, {tgpModel, dsl })
      jb.utils.resolveComp(comp, {tgpModel})
      return comp.$$
    },
    resolveLoadedProfiles() {
      const profiles = jb.core.unresolvedProfiles
      profiles.forEach(({comp,id}) => jb.utils.resolveProfileTop(id,comp))
      profiles.forEach(({comp,id}) => { 
        if (comp.$$)  {
          jb.comps[comp.$$] = comp
          jb.utils.handleMoreTypes(id,comp)
          //;(comp.moreTypes || '').split(',').filter(x=>x).map(t=>(t.indexOf('<') != -1) ? t : `${t}<${dsl}>`).forEach(t=>jb.comps[t+id] = comp)
        }
      })
      profiles.forEach(({comp,id}) => jb.utils.resolveUnTypedProfile(comp,id))
      profiles.forEach(({comp}) => { 
        if (comp.$$)
          jb.comps[comp.$$] = comp
        else
          jb.logError('can not resolve profile type',{comp})
      })
      jb.core.unresolvedProfiles = []
              profiles.forEach(({comp}) => jb.utils.resolveComp(comp))
      return profiles
    },
    handleMoreTypes(id,comp) {
      ;(comp.moreTypes || '').split(',').filter(x=>x).map(t=>(t.indexOf('<') != -1) ? t : `${t}<${comp.$dsl}>`).forEach(t=>jb.comps[t+id] = comp)
    },
    resolveProfileTop(id, comp, {tgpModel} = {}) {
      const comps = tgpModel && tgpModel.comps || jb.comps
      ;(comp.params || []).forEach(p=> {
        if (jb.macro.systemProps.includes(p.id))
          return jb.logError(`resolveProfileTop - can not use system prop ${p.id} as param name in ${id}`,{comp})
        // fix as boolean params to have type: 'boolean'
        if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1) p.type = 'boolean<>'
        const t1 = (p.type || '').replace(/\[\]/g,'') || 'data<>'
        if (t1.indexOf(',') != -1)
          return jb.logError(`resolveProfileTop - ${p.id} param in ${id} can not have multiple types`,{t1})
        p.$type = t1.indexOf('<') == -1 ? `${t1}<${comp.$dsl}>` : t1
      })

      const type = comp.type || (jb.utils.isPrimitiveValue(comp.impl) || typeof comp.impl == 'function') && 'data<>'
      if (type) {
        comp.$type = type.indexOf('<') == -1 ? `${type}<${comp.$dsl}>` : type
        const fullId = comp.$$ = `${comp.$type}${id}`
        const existingComp = comps[fullId]
        if (existingComp && existingComp != comp) {
          jb.logError(`comp ${fullId} at ${ JSON.stringify(comp.$location)} already defined at ${JSON.stringify(existingComp.$location)}`,
            {existingComp, oldLocation: existingComp.$location, newLocation: comp.$location})
        }
      } 
      return comp     
    },
    resolveUnTypedProfile(comp,id, {tgpModel, dsl, silent} = {}) {
      if (comp.$$ || !comp) return
      const comps = tgpModel && tgpModel.comps || jb.comps
      //if(id=='jbmTest.child') debugger
      let resolvedType = ''
      if (!comp.$$ && comp.impl && typeof comp.impl.$) {
        let nextCompId = comp.impl.$
        while(nextCompId && !resolvedType) {
            resolvedType = lookForUnknownTypeInDsl(nextCompId, comp.$dsl) || lookForUnknownTypeInDsl(nextCompId, dsl || '')
            if (!resolvedType) {
              const e = jb.core.unresolvedProfiles.find(({id}) => id == nextCompId)
              nextCompId = jb.path(e,'comp.impl.$')
            }
        }
      }
      if (resolvedType) {
        comp.$$ =`${resolvedType}${id}`
        comp.$type = resolvedType
        jb.utils.handleMoreTypes(id,comp)
      }
      else
        jb.logError(`can not resolve profile type for ${id}`,{comp})

      function lookForUnknownTypeInDsl(id, dsl) {
        const pattern = `<${dsl}>${id}`
        let options = jb.utils.unique(Object.keys(comps).filter(fullId =>fullId.endsWith(pattern)), x=>comps[x].$type)
        if (options.length == 0)
          options = jb.utils.unique(Object.keys(comps).filter(fullId =>fullId.endsWith(`<>${id}`)), x=>comps[x].$type)
        if (options.length == 1)
          return jb.utils.dslType(options[0])
        else if (options.length > 1 && !silent)
          jb.logError('getComp - several options for unknown type', {dsl,id,options})
      }
    },

    resolveComp(topComp, {tgpModel} = {}) {
      if (!topComp) return
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.defaultValue, {expectedType: p.$type, topComp, tgpModel}))
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.templateValue, {expectedType: p.$type, topComp, tgpModel}))
      //if (topcomp.$$ =='test<>dataTest.join') debugger
      jb.utils.resolveProfile(topComp.impl, {expectedType: topComp.$type, tgpModel, topComp, parent: topComp})
    },
    resolveProfile(prof, { expectedType, parent, parentProp, tgpModel, topComp, parentType, remoteCode} = {}) {
      if (!prof || !prof.constructor || ['Object','Array'].indexOf(prof.constructor.name) == -1) return prof
      const typeFromParent = expectedType == '$asParent<>' ? parentType || jb.utils.dslType(jb.path(parent,'$$')) : expectedType
      const typeFromAdapter = parent && parent.$ == 'typeAdapter' && parent.fromType
      const fromFullId = prof.$$ && jb.utils.dslType(prof.$$)
      const dslType = typeFromAdapter || typeFromParent || fromFullId
      if (dslType && dslType.indexOf('<') == -1) debugger
      const comp = jb.utils.resolveCompWithId(prof.$$ || prof.$, { dslType, parent, parentProp, tgpModel, topComp, parentType, remoteCode })
      if (comp)
        prof.$$ = comp.$$
      remoteCode = remoteCode || (prof.$$ || '').match(/>remote/) || (prof.$$ || '').match(/remote$/)
  
      if (prof.$unresolved && comp) {
          Object.assign(prof, jb.macro.argsToProfile(prof.$, comp, prof.$unresolved, topComp))
          if (jb.core.OrigValues) prof[jb.core.OrigValues] = prof.$unresolved
          delete prof.$unresolved
      }
      if (Array.isArray(prof)) {
        prof.forEach(v=>jb.utils.resolveProfile(v, { expectedType: dslType, parent, parentProp, topComp, tgpModel, parentType, remoteCode}))
      } else if (comp && prof.$ != 'asIs') {
        ;[...(comp.params || []), ...jb.macro.richSystemProps].forEach(p=> 
            jb.utils.resolveProfile(prof[p.id], { expectedType: p.$type, parentType: dslType, parent: prof, parentProp: p, topComp, tgpModel, remoteCode}))
        jb.utils.resolveProfile(prof.$vars, {tgpModel, topComp, expectedType: 'var<>', remoteCode})
        if (prof.$ == 'object')
          Object.values(prof).forEach(v=>jb.utils.resolveProfile(v, {tgpModel, topComp, expectedType: 'data<>', remoteCode}))
      } else if (!comp && prof.$) {
          jb.logError(`resolveProfile - can not resolve ${prof.$} at ${topComp && topComp.$$} expected type ${dslType || 'unknown'}`, 
              {compId: prof.$, prof, expectedType, dslType, topComp, parentType})
      }
      return prof
    },
    resolveCompWithId(id, {dslType, silent, tgpModel, parentProp, parent, topComp, parentType, remoteCode, dsl} = {}) {
      if (!id) return
      const comps = tgpModel && tgpModel.comps || jb.comps
      //if (id == 'css' && parent && parent.$ == 'text') debugger
      if (jb.core.genericCompIds[id])
        return comps['any<>'+id]
      if (comps[id]) return comps[id]
      if (comps[(dslType||'')+id]) return comps[(dslType||'')+id]

      const moreTypesFromProp = jb.path(parentProp,'moreTypes') || ''
      const typeFromParent = parentProp && parentProp.typeAsParent === true && parentType
      const dynamicTypeFromParent = parentProp && typeof parentProp.typeAsParent == 'function' 
        && parentProp.typeAsParent(parentType)
      const byTypeRules = [dynamicTypeFromParent,typeFromParent,dslType].filter(x=>x).join(',').split(',').filter(x=>x)
        .flatMap(t=>moreTypesByTypeRules(t)).join(',')
  
      const allTypes = jb.utils.unique([moreTypesFromProp,byTypeRules,dynamicTypeFromParent,typeFromParent,dslType,'test<>','data<>','action<>'].filter(x=>x).join(',').split(',').filter(x=>x))
      const byFullId = allTypes.map(t=>comps[t+id]).find(x=>x)
      if (byFullId)
        return byFullId
      const shortId = id.split('>').pop()
      const plugin = jb.path(topComp,'plugin')
      const cmps = Object.values(comps).filter(x=>x.$$)
      const bySamePlugin = plugin && cmps.find(c=> jb.path(c,'plugin') == plugin && c.$$.split('>').pop() == shortId )
      if (bySamePlugin)
        return bySamePlugin
      const byNoDsl = cmps.find(c=> c.$$.indexOf('<>') != -1 && c.$$.split('>').pop() == shortId )
      if (byNoDsl) {
         if (!silent) jb.logError('resolveCompWithId',{byNoDsl,id, topComp, parent, parentType, allTypes, dslType})
         return byNoDsl
      }
    
      //const byUnkownType = cmps.find(c=> c.$$.split('>').pop() == shortId )
      //_otherTypeInPlugin || ((!dslType || dslType == '$asParent<>') && (lookForUnknownTypeInDsl(dsl) || lookForUnknownTypeInDsl('')))
      if (id && !silent && !remoteCode) {
        debugger
        jb.logError(`utils getComp - can not find comp for id ${id}`,{id, topComp, parent, parentType, allTypes, dslType})
      }

      // function otherTypeInPlugin() {
      //   const plugin = jb.path(topComp,'plugin')
      //   const shortId = id.split('>').pop()
      //   return plugin && Object.values(comps).find(c=> jb.path(c,'plugin') == plugin && (c.$$||'').split('>').pop() == shortId )
      // }
      function moreTypesByTypeRules(type) {
        // isOf: ['boolean<>','data<>'] data -> boolean
        // same: ['data<>', 'data<llm>']
        // isOfWhenEndsWith: ['-feature<>','feature<>']
        // isOfWhenEndsWith: ['-style<>',[ 'feature<>', 'style<>' ]]
        const typeRules = tgpModel && tgpModel.typeRules || jb.macro.typeRules

        return typeRules.flatMap(rule=> jb.asArray(
            rule.isOf && type == rule.isOf[0] ? rule.isOf[1]
            : rule.same && type == rule.same[0] ? rule.same[1]
            : rule.same && type == rule.same[1] ? rule.same[0]
            : rule.isOfWhenEndsWith && type.endsWith(rule.isOfWhenEndsWith[0]) && rule.isOfWhenEndsWith[0] != type ? rule.isOfWhenEndsWith[1]
            : []))          
      }
    },
    compParams(comp) {
      return (!comp || !comp.params) ? [] : comp.params
    },
    getUnresolvedProfile: (_id, type) => (jb.core.unresolvedProfiles.find(({id, comp}) => id == _id && comp.type == type) || {}).comp,
    isRefType: jstype => jstype === 'ref' || jstype === 'ref[]',
    calcVar(ctx,varname,jstype) {
      let res
      if (ctx.cmpCtx && ctx.cmpCtx.params[varname] !== undefined)
        res = ctx.cmpCtx.params[varname]
      else if (ctx.vars[varname] !== undefined)
        res = ctx.vars[varname]
      else if (ctx.vars.scope && ctx.vars.scope[varname] !== undefined)
        res = ctx.vars.scope[varname]
      else if (jb.db.resources && jb.db.resources[varname] !== undefined) {
        jb.db.useResourcesHandler(h => h.makeWatchable(varname))
        res = jb.utils.isRefType(jstype) ? jb.db.useResourcesHandler(h=>h.refOfPath([varname])) : jb.db.resource(varname)
      } else if (jb.db.consts && jb.db.consts[varname] !== undefined)
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
    indexOfCompDeclarationInTextLines(lines,id) {
      return lines.findIndex(line=> {
        const index = line.indexOf(`component('${id.split('>').pop()}'`)
        return index == 0 || index == 3
      })
    }
})

extension('utils', 'generic', {
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
    tryWrapper(f,msg,ctx,reqCtx) { try { return f() } catch(e) { jb.logException(e,msg,{ctx,reqCtx}) }},
    isPromise: v => v && v != null && typeof v.then === 'function',
    isDelayed(v) {
      if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
      return typeof v === 'object' ? jb.utils.isPromise(v) : typeof v === 'function' && jb.utils.isCallbag(v)
    },
    waitForInnerElements(item, {passRx} = {}) { // resolve promises in array and double promise (via array), passRx - do not wait for reactive data to end, and pass it as is
      if (jb.utils.isPromise(item))
        return item.then(r=>jb.utils.waitForInnerElements(r,{passRx}))
      if (!passRx &&jb.utils.isCallbag(item))
        return jb.utils.callbagToPromiseArray(item)

      if (Array.isArray(item)) {
        if (! item.find(v=> jb.utils.isCallbag(v) || jb.utils.isPromise(v))) return item
        return Promise.all(item.map(x=>jb.utils.waitForInnerElements(x,{passRx}))).then(items=>items.flatMap(x=>x))
      }
      return item
    },
    resolveFinishedPromise(val) {
      if (val && typeof val == 'object' && val._state == 1) // finished promise
        return val._result
      return val
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

    unique: (ar,f) => {
      const keys = {}, res = []
      ar.forEach(x =>{
        const key = f ? f(x) : x
        if (!keys[key]) res.push(x)
        keys[key] = true
      })
      return res
    },
    uniqueObjects: array => {
      const seen = new Set()
      return array.filter(item => {
          if (seen.has(item)) return false
          seen.add(item)
          return true
      })
    },
    sessionStorage(id,val) {
      if (!jb.frame.sessionStorage) return
      const curVal = JSON.parse(jb.frame.sessionStorage.getItem(id))
      if (val == undefined) return curVal
      const cleanedVal = typeof val == 'object' ? Object.fromEntries(Object.entries(val).filter(([_, v]) => v != null)) : val
      const newVal = typeof val == 'object' ? {...(curVal||{}), ...cleanedVal } : val
      jb.frame.sessionStorage.setItem(id, JSON.stringify(newVal))
    }
})

extension('utils', 'callbag', {
  isCallbag: cb => typeof cb == 'function' && cb.toString().split('=>')[0].split('{')[0].replace(/\s/g,'').match(/start,sink|t,d/),
  callbagToPromiseArray: source => new Promise(resolve => {
    let talkback
    const res = []
    source(0, function toPromiseArray(t, d) {
      if (t === 0) talkback = d
      if (t === 1) res.push(d && d.vars ? d.data : d)
      if (t === 2) resolve(res)
      if (t === 1 || t === 0) talkback(1)  // Pull
    })
  }),
  subscribe: (source, callback) => {
    let talkback
    source(0, function subscribe(t, d) {
      if (t === 0) talkback = d
      if (t === 1) callback(d)
      if (t === 1 || t === 0) talkback(1)  // Pull
    })
  },
  subscribe: (source,listener) => jb.callbag.subscribe(listener)(source), 
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
      if (!obj || typeof obj != 'object') return []
      if (Object.entries) return Object.entries(obj) 
      let ret = []
      for(let i in obj) // please do not change. it keeps the definition order !!!!
        if (obj.hasOwnProperty && obj.hasOwnProperty(i) && i.indexOf('$jb_') != 0)
          ret.push([i,obj[i]])
      return ret
  },
  objFromEntries(entries) {
      if (Object.fromEntries) return Object.fromEntries(entries) 
      const res = {}
      entries.forEach(e => res[e[0]] = e[1])
      return res
  },
  asArray: v => v == null ? [] : (Array.isArray(v) ? v : [v]),
  delay: (mSec,res) => new Promise(r=>setTimeout(()=>r(res),mSec)),
})

});

jbLoadPackedFile({lineInPackage:905, jb, noProxies: true, path: '/plugins/core/core-components.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {

component('call', {
  type: 'any',
  hidden: true,
  description: 'invoke dynamic parameter',
  category: 'system:50',
  params: [
    {id: 'param', as: 'string', description: 'parameter name'},
    {id: 'array', as: 'boolean', description: 'array of profiles', byName: true}
  ],
  impl: (ctx,param,array) => {
 	  const paramObj = ctx.cmpCtx && ctx.cmpCtx.params[param]
    if (array)
      return jb.asArray(paramObj.profile).map((profile,index) => ctx.runInner(profile, { as: 'single'}, `${param}~${index}` ) )
    return typeof paramObj == 'function' ? paramObj(new jb.core.jbCtx(ctx, { cmpCtx: paramObj.runCtx, forcePath: paramObj.srcPath })) : paramObj
 	}
})

component('typeAdapter', {
  type: 'any',
  params: [
    {id: 'fromType', as: 'string', mandatory: true, description: 'e.g. type1<myDsl>'},
    {id: 'val'}
  ],
  impl: ctx => ctx.params.val
})

component('If', {
  type: 'any',
  macroByValue: true,
  params: [
    {id: 'condition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'},
    {id: 'then', type: '$asParent', dynamic: true, composite: true},
    {id: 'Else', type: '$asParent', dynamic: true}
  ],
  impl: ({},cond,_then,_else) => cond() ? _then() : _else()
})

component('TBD', {
  type: 'any',
  hidden: true,
  impl: 'TBD'
})

component('Var', {
  type: 'var',
  isSystem: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'},
    {id: 'async', as: 'boolean', type: 'boolean<>'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  }
})

// component('remark', {
//   type: 'system',
//   isSystem: true,
//   params: [
//     {id: 'text', as: 'string', mandatory: true}
//   ],
//   macro: (result, self) => Object.assign(result,{ $remark: self.remark }) //  || jb.path(self.$unresolved,'0')
// })

component('unknownCmp', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'id', as: 'string', mandatory: true}
  ],
  macro: (result, self) => jb.comps[self.id] = { impl: ctx => jb.logError(`comp ${self.id} is not defined`,{ctx})}
})

component('runCtx', {
  type: 'any',
  hidden: true,
  params: [
    {id: 'path', as: 'string'},
    {id: 'vars'},
    {id: 'profile'}
  ]
})

component('log', {
  type: 'data',
  moreTypes: 'action<>',
  params: [
    {id: 'logName', as: 'string', mandatory: 'true'},
    {id: 'logObj', as: 'single', defaultValue: '%%'}
  ],
  impl: (ctx,log,logObj) => { jb.log(log,{...logObj,ctx}); return ctx.data }
})

component('asIs', {
  params: [
    {id: '$asIs', ignore: true}
  ],
  impl: ctx => ctx.profile.$asIs
})
});

jbLoadPackedFile({lineInPackage:1011, jb, noProxies: true, path: '/plugins/core/jb-expression.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('expression', {
  calc(_exp, ctx, parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    let exp = '' + _exp
    if (jstype == 'boolean') return jb.expression.calcBool(exp, ctx)
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const out = jb.expression.calc(exp.split('$log:')[1],ctx,parentParam)
      console.log(out, ctx)
      return out
    }
    if (exp.indexOf('%') == -1 && exp.indexOf('{') == -1) return exp
    if (exp == '{%%}' || exp == '%%')
        return expPart('')
  
    if (exp.lastIndexOf('{%') == 0 && exp.indexOf('%}') == exp.length-2) // just one exp filling all string
      return expPart(exp.substring(2,exp.length-2))
  
    exp = exp.replace(/{%(.*?)%}/g, (match,contents) => jb.tostring(expPart(contents,{ as: 'string'})))
    exp = exp.replace(/{\?(.*?)\?}/g, (match,contents) => jb.tostring(conditionalExp(contents)))
    if (exp.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
      return expPart(exp.substring(1,exp.length-1),parentParam)
  
    exp = exp.replace(/%([^%;{}\s><"']*)%/g, (match,contents) => jb.tostring(expPart(contents,{as: 'string'})))
    return exp

    function expPart(expressionPart,_parentParam) {
      return jb.utils.resolveFinishedPromise(jb.expression.evalExpressionPart(expressionPart,ctx,_parentParam || parentParam))
    }
    function conditionalExp(exp) {
      // check variable value - if not empty return all exp, otherwise empty
      const match = exp.match(/%([^%;{}\s><"']*)%/)
      if (match && jb.tostring(expPart(match[1])))
        return jb.expression.calc(exp, ctx, { as: 'string' })
      else
        return ''
    }

  },
  evalExpressionPart(expressionPart,ctx,parentParam) {
    const jstype = parentParam && (parentParam.ref ? 'ref' : parentParam.as)
    // example: %$person.name%.
  
    const parts = expressionPart.split(/[./[]/)
    return parts.reduce((input,subExp,index)=>pipe(input,subExp,index == parts.length-1,index == 0),ctx.data)
  
    function pipe(input,subExp,last,first,invokeFunc) {
      if (subExp == '')
         return input
      if (subExp.match(/]$/))
        subExp = subExp.slice(0,-1)
  
      const refHandler = jb.db.objHandler(input)
      if (subExp.match(/\(\)$/))
        return pipe(input,subExp.slice(0,-2),last,first,true)
      if (first && subExp.charAt(0) == '$' && subExp.length > 1) {
        const ret = jb.utils.calcVar(ctx,subExp.substr(1),last ? jstype : null)
        const _ctx = ret && ret.runCtx ? new jb.core.jbCtx(ctx, { cmpCtx: ret.runCtx, forcePath: ret.srcPath}) : ctx
        return typeof ret === 'function' && invokeFunc ? ret(_ctx) : ret
      }
      const obj = jb.val(input)
      if (subExp == 'length' && obj && typeof obj.length == 'number')
        return obj.length
      if (Array.isArray(obj) && isNaN(Number(subExp)))
        return [].concat.apply([],obj.map(item=>pipe(item,subExp,last,false,refHandler)).filter(x=>x!=null))
  
      if (input != null && typeof input == 'object') {
        if (obj == null) return
        if (typeof obj[subExp] === 'function' && (invokeFunc || obj[subExp].profile && parentParam && parentParam.dynamic)) {
          //console.log('func',obj[subExp],ctx.profile)
          return obj[subExp](ctx)
        }
        if (subExp.match(/\(\)$/)) {
          const method = subExp.slice(0,-2)
          return typeof obj[method] == 'function' && obj[method]()
        }
        if (subExp.match(/^@/) && obj.getAttribute)
            return obj.getAttribute(subExp.slice(1))
        if (jb.utils.isRefType(jstype)) {
          if (last)
            return refHandler.objectProperty(obj,subExp,ctx)
          if (obj[subExp] === undefined)
            obj[subExp] = jb.expression.implicitlyCreateInnerObject(obj,subExp,refHandler)
        }
        if (last && jstype)
            return jb.core.jstypes[jstype](obj[subExp])
        return obj[subExp]
      }
    }
  },
  implicitlyCreateInnerObject(parent,prop,refHandler) {
    jb.log('core innerObject created',{parent,prop,refHandler})
    parent[prop] = {}
    refHandler.refreshMapDown && refHandler.refreshMapDown(parent)
    return parent[prop]
  },
  calcBool(exp, ctx, parentParam) {
    if (exp.indexOf('$debugger:') == 0) {
      debugger
      exp = exp.split('$debugger:')[1]
    }
    if (exp.indexOf('$log:') == 0) {
      const calculated = jb.expression.calc(exp.split('$log:')[1],ctx,{as: 'boolean'})
      const result = jb.expression.calcBool(exp.split('$log:')[1], ctx, parentParam)
      console.log(result, calculated, ctx)
      return result
    }
    if (exp.indexOf('!') == 0)
      return !jb.expression.calcBool(exp.substring(1), ctx)
    const parts = exp.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/)
    if (!parts) {
      const ref = jb.expression.calc(exp, ctx, parentParam)
      if (jb.db.isRef(ref))
        return ref
      
      const val = jb.tostring(ref)
      if (typeof val == 'boolean') return val
      const asString = jb.tostring(val)
      return !!asString && asString != 'false'
    }
    if (parts.length != 4)
      return jb.logError('invalid boolean expression: ' + exp, {ctx})
    const op = parts[2].trim()
  
    if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
      const p1 = jb.tostring(jb.expression.calc(trim(parts[1]), ctx, {as: 'string'}))
      let p2 = jb.tostring(jb.expression.calc(trim(parts[3]), ctx, {as: 'string'}))
      p2 = (p2.match(/^["'](.*)["']/) || ['',p2])[1] // remove quotes
      if (op == '==') return p1 == p2
      if (op == '!=') return p1 != p2
      if (op == '^=') return p1.lastIndexOf(p2,0) == 0 // more effecient
      if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1
    }
  
    const p1 = jb.tonumber(jb.expression.calc(parts[1].trim(), ctx))
    const p2 = jb.tonumber(jb.expression.calc(parts[3].trim(), ctx))
  
    if (op == '>') return p1 > p2
    if (op == '<') return p1 < p2
    if (op == '>=') return p1 >= p2
    if (op == '<=') return p1 <= p2
  
    function trim(str) {  // trims also " and '
      return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1')
    }
  }
})

});

jbLoadPackedFile({lineInPackage:1166, jb, noProxies: true, path: '/plugins/core/db.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('db', 'onAddComponent', {
  $phase :2,
  initExtension() { 
    jb.val = ref => {
      if (ref == null || typeof ref != 'object') return ref
      const handler = jb.db.refHandler(ref)
      return handler ? handler.val(ref) : ref
    }
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.watchableData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)  
      }
    })
    jb.core.onAddComponent.push({ 
      match:(id,comp) => comp.passiveData !== undefined,
      register: (id,comp) => {
        jb.comps[jb.db.addDataResourcePrefix(id)] = comp
        comp.$db = true
        return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)  
      }
    })
  },
  removeDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id.slice('dataResource.'.length) : id,
  addDataResourcePrefix: id => id.indexOf('dataResource.') == 0 ? id : 'dataResource.' + id,
})

extension('db', {
    initExtension() { return {
        passiveSym: Symbol.for('passive'),
        resources: {}, consts: {}, 
        watchableHandlers: [],
        isWatchableFunc: [], // assigned by watchable module, if loaded - must be put in array so the code loader will not pack it.
        simpleValueByRefHandler: jb.db._simpleValueByRefHandler()
      }
    },
    // two refs mechnism
    // { $jb_val: val => val == null ? value : setValue(val) }
    // { $jb_parent: obj, $jb_property: 'prop' }
    _simpleValueByRefHandler() { return {
        val(v) {
          if (v && v.$jb_val) return v.$jb_val()
          return v && v.$jb_parent ? v.$jb_parent[v.$jb_property] : v
        },
        writeValue(to,value,srcCtx) {
          jb.log('writeValue jbParent',{value,to,srcCtx})
          if (!to) return
          if (to.$jb_val)
            to.$jb_val(this.val(value))
          else if (to.$jb_parent)
            to.$jb_parent[to.$jb_property] = this.val(value)
          return to
        },
        push(ref,toAdd) {
          const arr = jb.asArray(jb.val(ref))
          jb.toarray(toAdd).forEach(item => arr.push(item))
        },
        asRef(value) {
          return value
        },
        isRef(value) {
          return value && (value.$jb_parent || value.$jb_val || value.$jb_obj)
        },
        objectProperty(obj,prop) {
            if (this.isRef(obj[prop]))
              return obj[prop];
            else
              return { $jb_parent: obj, $jb_property: prop };
        },
        pathOfRef: () => [],
        doOp() {},
    }},
    resource(id,val) { 
        if (typeof val !== 'undefined')
          jb.db.resources[id] = val
        jb.db.useResourcesHandler(h => h.makeWatchable(id))
        return jb.db.resources[id]
    },
    useResourcesHandler: f => jb.db.watchableHandlers.filter(x=>x.resources.id == 'resources').map(h=>f(h))[0],
    passive: (id,val) => typeof val == 'undefined' ? jb.db.consts[id] : (jb.db.consts[id] = jb.db.markAsPassive(val || {})),
    markAsPassive(obj) {
      if (obj && typeof obj == 'object') {
        obj[jb.db.passiveSym] = true
        Object.values(obj).forEach(v=>jb.db.markAsPassive(v))
      }
      return obj
    },
    addWatchableHandler: h => h && jb.db.watchableHandlers.push(h) ,
    removeWatchableHandler: h => jb.db.watchableHandlers = jb.db.watchableHandlers.filter(x=>x!=h),
    
    safeRefCall(ref,f) {
      const handler = jb.db.refHandler(ref)
      if (!handler || !handler.isRef(ref))
        return jb.logError('invalid ref', {ref})
      return f(handler)
    },
   
    // handler for ref
    refHandler(ref) {
      if (ref && ref.handler) return ref.handler
      if (jb.db.simpleValueByRefHandler.isRef(ref)) 
        return jb.db.simpleValueByRefHandler
      return jb.db.watchableHandlers.find(handler => handler.isRef(ref))
    },
    // handler for object (including the case of ref)
    objHandler: obj => 
        obj && jb.db.refHandler(obj) || jb.db.watchableHandlers.find(handler=> handler.watchable(obj)) || jb.db.simpleValueByRefHandler,
    asRef(obj) {
      const watchableHanlder = jb.db.watchableHandlers.find(handler => handler.watchable(obj) || handler.isRef(obj))
      if (watchableHanlder)
        return watchableHanlder.asRef(obj)
      return jb.db.simpleValueByRefHandler.asRef(obj)
    },
    // the !srcCtx.probe blocks data change in probe
    writeValue: (ref,value,srcCtx,noNotifications) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h => {
      noNotifications && h.startTransaction && h.startTransaction()
      h.writeValue(ref,value,srcCtx)
      noNotifications && h.endTransaction && h.endTransaction(true)
    }),
    objectProperty: (obj,prop,srcCtx) => jb.db.objHandler(obj).objectProperty(obj,prop,srcCtx),
    splice: (ref,args,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.splice(ref,args,srcCtx)),
    move: (ref,toRef,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.move(ref,toRef,srcCtx)),
    push: (ref,toAdd,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.push(ref,toAdd,srcCtx)),
    doOp: (ref,op,srcCtx) => jb.db.canChangeDB(srcCtx) && jb.db.safeRefCall(ref, h=>h.doOp(ref,op,srcCtx)),
    isRef: ref => jb.db.refHandler(ref),
    isWatchable: ref => jb.db.isWatchableFunc[0] && jb.db.isWatchableFunc[0](ref), // see remark at initExtension
    isValid: ref => jb.db.safeRefCall(ref, h=>h.isValid(ref)),
    pathOfRef: ref => jb.db.safeRefCall(ref, h=>h.pathOfRef(ref)),
    refOfPath: path => jb.db.watchableHandlers.reduce((res,h) => res || h.refOfPath(path),null),
    canChangeDB: ctx => !ctx.probe || ctx.vars.testID
})

component('isRef', {
  type: 'boolean',
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.isRef(obj)
})

component('asRef', {
  params: [
    {id: 'obj', mandatory: true}
  ],
  impl: ({},obj) => jb.db.asRef(obj)
})

});

jbLoadPackedFile({lineInPackage:1319, jb, noProxies: true, path: '/plugins/core/jb-macro.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item)),
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

extension('macro', {
    initExtension() {
        return { 
            proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro'), 
            systemProps: ['data', '$debug', '$disabled', '$log', 'ctx', '//' ],
            richSystemProps: [ {id: 'data', $type: 'data<>'}] 
        }
    },
    typeRules: [{ isOf: ['data<>','boolean<>'] }],
    titleToId: id => id.replace(/-([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    newProxy: id => new Proxy(() => 0, {
        get: (o, p) => p === jb.macro.isMacro? true : jb.macro.getInnerMacro(id, p),
        apply: function (target, thisArg, allArgs) {
            const actualId = id[0] == '_' ? id.slice(1) : id
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return { $: actualId, $unresolved: args, ...system, ...(id[0] == '_' ? {$disabled:true} : {} ) }
        }
    }),   
    getInnerMacro(ns, innerId) {
        return (...allArgs) => {
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return { $: `${ns}.${innerId}`, 
                ...(args.length == 0 ? {} : { $unresolved: args }),
                ...system
            }
        }
    },
    splitSystemArgs(allArgs) {
        const args = [], system = {}
        allArgs.forEach(arg => {
            if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isSystem)
                jb.comps[arg.$].macro(system, arg)
            else if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isMacro)
                args.push(jb.comps[arg.$].macro(arg))
            else
                args.push(arg)
        })
        if (args.length == 1 && typeof args[0] === 'object') {
            jb.asArray(args[0].vars).forEach(arg => jb.comps[arg.$].macro(system, arg))
            delete args[0].vars
        }
        return { args, system }
    },
    argsToProfile(cmpId, comp, args, topComp) {
        if (args.length == 0)
            return { $: cmpId }        
        if (!comp)
            return { $: cmpId, $unresolved: args }
        if (cmpId == 'asIs') return { $: 'asIs', $asIs: args[0] }
        const lastArg = args[args.length-1]
        const lastArgIsByName = lastArg && typeof lastArg == 'object' && !Array.isArray(lastArg) && !lastArg.$
        const argsByValue = lastArgIsByName ? args.slice(0,-1) : args
        const propsByName = lastArgIsByName ? lastArg : {}
        const onlyByName = lastArgIsByName && args.length == 1
        const params = comp.params || []
        const param0 = params[0] || {}, param1 = params[1] || {}
        const firstParamAsArray = (param0.type||'').indexOf('[]') != -1 && !param0.byName
        const secondParamAsArray = param1.secondParamAsArray

        if (!lastArgIsByName) {
            if (firstParamAsArray)
                return { $: cmpId, [param0.id]: params.length > 1 && args.length == 1 ? args[0] : args }
            if (secondParamAsArray)
                return { $: cmpId, [param0.id]: args[0], [param1.id] : args.slice(1) }

            if (comp.macroByValue || params.length < 3)
                return { $: cmpId, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
        }

        const varArgs = []
        while (argsByValue[0] && argsByValue[0].$ == 'Var')
            varArgs.push(argsByValue.shift())
        const propsByValue = onlyByName ? []
            : firstParamAsArray ? { [param0.id] : argsByValue }
            : secondParamAsArray ? { [param0.id] : argsByValue[0], [param1.id] : argsByValue.slice(1) } 
            : jb.objFromEntries(argsByValue.map((v,i) => [params[i].id, v]))
        return { $: cmpId,
            ...(varArgs.length ? {$vars: varArgs} : {}),
            ...propsByValue, ...propsByName
        }
    },
    registerProxy: id => {
        const proxyId = jb.macro.titleToId(id.split('.')[0])
        return [proxyId, jb.macro.proxies[proxyId] = jb.macro.proxies[proxyId] || jb.macro.newProxy(proxyId)]
    }
})

extension('syntaxConverter', 'onAddComponent', {
  initExtension() { 
    jb.core.onAddComponent.push({ 
      match:(id,comp) => false,
      register: (_id,_comp,dsl) => {
        //if (_id == 'amta.aa') debugger
        const comp = jb.syntaxConverter.fixProfile(_comp,_comp,_id)
        const id = jb.macro.titleToId(_id)
        jb.core.unresolvedProfiles.push({id,comp,dsl})
        return comp
      }
    })    
  },
  fixProfile(profile,origin,id) {
    if (profile === null) return
    if (!profile || jb.utils.isPrimitiveValue(profile) || typeof profile == 'function') return profile
    // if (profile.$ == 'uiTest') {
    //     if ((jb.path(profile.$unresolved[0].userInput,'$') || '').indexOf('userInput.') == 0) {
    //         profile.$unresolved[0].uiAction = profile.$unresolved[0].userInput
    //         profile.$unresolved[0].uiAction.$ = profile.$unresolved[0].uiAction.$.slice('userInput.'.length)
    //     }
    // }
    // if (profile.$ == 'browserTest' && profile.$unresolved[0].action) {
    //     profile.$unresolved[0].uiAction = profile.$unresolved[0].action
    //     delete profile.$unresolved[0].action
    // }

    // ;['pipeline','list','firstSucceeding','concat','and','or'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.items = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    // ;['not'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.of = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    if (jb.syntaxConverter.amtaFix)
        profile = jb.syntaxConverter.amtaFix(profile)

    const $vars = profile.$vars
    if ($vars && !Array.isArray($vars))
        profile.$vars = jb.entries($vars).map(([name,val]) => ({name,val}))

    if (profile.$)
        profile.$ = jb.macro.titleToId(profile.$)
    // if (profile.remark) {
    //     profile.$remark = profile.remark
    //     delete profile.remark
    // }
    
    if (profile.$ == 'object')
        return {$: 'obj', props: jb.entries(profile).filter(([x]) =>x!='$').map(([title,val]) => ({$: 'prop', title, val: jb.syntaxConverter.fixProfile(val,origin) }))}

    if (Array.isArray(profile)) 
        return profile.map(v=>jb.syntaxConverter.fixProfile(v,origin))

    return jb.objFromEntries(jb.entries(profile).map(([k,v]) => [k,jb.syntaxConverter.fixProfile(v,origin)]))
  }
})
});

jbLoadPackedFile({lineInPackage:1479, jb, noProxies: true, path: '/plugins/core/spy.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('spy', 'main', {
	$requireFuncs: '#spy.log',
	initExtension() {
		// jb.spy.log() -- for codeLoader
		return {
			logs: [],
			enrichers: [],
			includeLogs: {error: true},
			settings: { 
				stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
				MAX_LOG_SIZE: 10000
			},
			Error: jb.frame.Error
		}
	},
	initSpyByUrl() {
		jb.spy.initSpy({spyParam : jb.spy.spyParamInUrl() })
	},
	spyParamInUrl() {
		const frame = jb.frame
		const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
		const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
		const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
		return frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
			getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')
	},
	initSpy({spyParam}) {
		if (!spyParam) return
		jb.spy.spyParam = spyParam
		jb.spy.enabled = true
		if (jb.frame) jb.frame.spy = jb.spy // for console use
		jb.spy._obs = jb.spy._obs || jb.callbag && jb.callbag.subject()
		jb.spy.calcIncludeLogsFromSpyParam()
		return jb.spy
		// for loader - jb.spy.clear(), jb.spy.search()
	},
	registerEnrichers(enrichers) {
		jb.spy.enrichers = [...jb.spy.enrichers, ...jb.asArray(enrichers)]
	},
	findProp(o,prop,maxDepth=1) {
		if (maxDepth < 1) return o[prop]
		return o[prop] 
			|| Object.keys(o).reduce((found,k) => found || (o[k] && typeof o[k] == 'object' && jb.spy.findProp(o[k],prop,maxDepth-1)), false)
	},
	memoryUsage: () => jb.path(jb.frame,'performance.memory.usedJSHeapSize'),
	// observable() { 
	// 	const _jb = jb.path(jb,'studio.studiojb') || jb
	// 	jb.spy._obs = jb.spy._obs || _jb.callbag.subject()
	// 	return jb.spy._obs
	// },
	calcIncludeLogsFromSpyParam() {
		const includeLogsFromParam = (jb.spy.spyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
		const excludeLogsFromParam = (jb.spy.spyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
		jb.spy.includeLogs = includeLogsFromParam.filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
			acc[log] = true
			return acc
		}, {})
		jb.spy.includeLogs.error = true
	},
	shouldLog(logNames, record) {
		// disable debugging events
		const ctx = record && (record.ctx || record.srcCtx || record.cmp && record.cmp.ctx)
		if (ctx && ctx.vars.$disableLog || jb.path(record,'m.$disableLog') || jb.path(record,'m.remoteRun.vars.$disableLog')) return false
		if (jb.path(record,'m.routingPath') && jb.path(record,'m.routingPath').find(y=>y.match(/vDebugger/))
			|| (jb.path(record,'m.result.uri') || '').match(/vDebugger/)) return false
		if (!logNames) debugger
		return jb.spy.spyParam === 'all' || typeof record == 'object' && 
			logNames.split(' ').reduce( (acc,logName)=>acc || jb.spy.includeLogs[logName],false)
	},
	log(logNames, _record, {takeFrom, funcTitle, modifier} = {}) {
		jb.spy.updateCounters(logNames)
		jb.spy.updateLocations(logNames,takeFrom)
		if (!jb.spy.shouldLog(logNames, _record)) return
		const now = new Date()
		const index = jb.spy.logs.length
		const record = {
			logNames,
			..._record,
			index,
			source: jb.spy.source(takeFrom),
			_time: `${now.getSeconds()}:${now.getMilliseconds()}`,
			time: now.getTime(),
			mem: jb.spy.memoryUsage() / 1000000,
			activeElem: jb.path(jb.frame.document,'activeElement'),
			$attsOrder: _record && Object.keys(_record),
			stack: _record.ctx && jb.utils.callStack(_record.ctx)
		}
		if (jb.spy.logs.length > 0 && jb.path(jb.frame.document,'activeElement') != jb.spy.logs[index-1].activeElem) {
			jb.spy.logs[index-1].logNames += ' focus'
			jb.spy.logs[index-1].activeElemAfter = record.activeElem
			jb.spy.logs[index-1].focusChanged = true
		}

		jb.spy.logs.push(record)
		if (jb.spy.logs.length > jb.spy.settings.MAX_LOG_SIZE *1.1)
			jb.spy.logs = jb.spy.logs.slice(-1* jb.spy.settings.MAX_LOG_SIZE)
		jb.spy._obs && jb.spy._obs.next(record)
	},
	frameAccessible(frame) { try { return Boolean(frame.document || frame.contentDocument || frame.global) } catch(e) { return false } },
	source(takeFrom) {
		jb.spy.Error.stackTraceLimit = 50
		const frames = [jb.frame]
		// while (frames[0].parent && frames[0] !== frames[0].parent) {
		// 	frames.unshift(frames[0].parent)
		// }
		let stackTrace = frames.reverse().filter(f=>jb.spy.frameAccessible(f)).map(frame => new frame.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
			filter(line => line !== 'Error').
			filter(line => !jb.spy.settings.stackFilter.test(line))
		if (takeFrom) {
			const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
			stackTrace = stackTrace.slice(firstIndex + 1)
		}
		const line = stackTrace[0] || ''
		const res = [
			line.split(/at |as /).pop().split(/ |]/)[0],
			line.split('/').pop().slice(0, -1).trim(),
			...stackTrace
		]
		res.location = line.split(' ').slice(-1)[0].split('(').pop().split(')')[0]
		return res
	},
	updateCounters(logNames) {
		jb.spy.counters = jb.spy.counters || {}
		jb.spy.counters[logNames] = jb.spy.counters[logNames] || 0
		jb.spy.counters[logNames]++
	},
	updateLocations(logNames) {
		jb.spy.locations = jb.spy.locations || {}
		jb.spy.locations[logNames] = jb.spy.locations[logNames] || jb.spy.source().location
	},	
	
	// browsing methods
	setLogs(spyParam) {
		jb.spy.spyParam = spyParam
		jb.spy.calcIncludeLogsFromSpyParam(spyParam)
	},
	clear(spy = jb.spy) {
		spy.logs = []
		spy.counters = {}
	},
	count(query) { // dialog core | menu !keyboard  
		const _or = query.split(/,|\|/)
		return _or.reduce((acc,exp) => 
			unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), jb.entries(jb.spy.counters))) 
		,[]).reduce((acc,e) => acc+e[1], 0)

		function filter(set,exp) {
			return (exp[0] == '!') 
				? set.filter(rec=>!rec[0].match(new RegExp(`\\b${exp.slice(1)}\\b`)))
				: set.filter(rec=>rec[0].match(new RegExp(`\\b${exp}\\b`)))
		}
		function unify(set1,set2) {
			return [...set1,...set2]
		}
	},
	noPing() {
		return this.logs.filter(x=>![x.remoteRun, jb.path(x.m,'remoteRun'),jb.path(x.m,'result')].find(t => t == 'ping'))
	},
	search(query = '',{ slice, spy, enrich } = {slice: -1000, spy: jb.spy, enrich: true}) { // e.g., dialog core | menu !keyboard  
		const _or = query.toLowerCase().split(/,|\|/)
		return _or.reduce((acc,exp) => 
			unify(acc, exp.split(' ').reduce((acc,logNameExp) => filter(acc,logNameExp), spy.logs.slice(slice))) 
		,[]).map(x=>enrich ? jb.spy.enrichRecord(x) : x)

		function filter(set,exp) {
			return (exp[0] == '!') 
				? set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp.slice(1)) == -1)
				: set.filter(rec=>rec.logNames.toLowerCase().indexOf(exp) != -1)
		}
		function unify(set1,set2) {
			let res = [...set1,...set2].sort((x,y) => x.index < y.index)
			return res.filter((r,i) => i == 0 || res[i-1].index != r.index) // unique
		}
	},
	enrichRecord(rec) {
		if (!rec.$ext) {
			rec.$ext = { sections: [], props: {}}
			;(jb.spy.enrichers||[]).forEach(f=> {
				const ext = f(rec)
				if (ext) {
					ext.sections && (rec.$ext.sections = [...rec.$ext.sections, ...ext.sections])
					ext.props && Object.assign(rec.$ext.props, ext.props)
				}
			})
		}
		return {log: rec.logNames, ...rec.$ext.props, 
			...jb.objFromEntries(Object.keys(rec).filter(k=>!rec.$ext.props[k]).map(k=>[k,rec[k]])) }
	},
	spyParamForTest(testID) {
		return testID.match(/uiTest|[Ww]idget/) ? 'test,uiTest,headless' : 'test'
	}
})

component('test.calcSpyParamForTest', {
  params: [
    {id: 'testID' }
  ],
  impl: (ctx,testID) => jb.spy.spyParamForTest(testID || ctx.vars.testID)
})

});

jb.noSupervisedLoad = false
jbLoadPackedFile({lineInPackage:1684, jb, noProxies: false, path: '/plugins/common/pipeline.js',fileDsl: '', pluginId: 'common' }, 
            function({jb,require,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
extension('common', 'pipe', {
    runAsAggregator(ctx, profile,i, dataArray,profiles) {
      if (!profile || profile.$disabled) return dataArray
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {}) // use parent param for last element to convert to client needs
      if (jb.path(jb.comps[profile.$$],'aggregator'))
        return ctx.setData(jb.asArray(dataArray)).runInner(profile, parentParam, `items~${i}`)
      return jb.asArray(dataArray)
        .map(item => ctx.setData(item).runInner(profile, parentParam, `items~${i}`))
        .filter(x=>x!=null)
        .flatMap(x=> jb.asArray(jb.val(x)))
    }
})

component('pipeline', {
  type: 'data',
  category: 'common:100',
  description: 'flat map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'source', type: 'data', dynamic: true, mandatory: true, templateValue: '', composite: true },
    {id: 'items', type: 'data[]', dynamic: true, mandatory: true, secondParamAsArray: true, description: 'chain/map data functions'}
  ],
  impl: (ctx,source,items) => jb.asArray(ctx.profile.items).reduce( (dataArray,prof,index) => 
    jb.common.runAsAggregator(ctx, prof,index,dataArray, jb.asArray(ctx.profile.items)), source())
})

// component('pipeline', {
  //   type: 'data',
//   category: 'common:100',
//   description: 'flat map data arrays one after the other, do not wait for promises and rx',
//   params: [
//     {id: 'items', type: 'data[]', dynamic: true, mandatory: true, composite: true, description: 'chain/map data functions'}
//   ],
//   impl: (ctx,items) => {
//     const profiles = jb.asArray(ctx.profile.items)
//     const source = ctx.runInner(profiles[0], profiles.length == 1 ? ctx.parentParam : null, `items~0`)
//     return profiles.slice(1).reduce( (dataArray,prof,index) => jb.common.runAsAggregator(ctx, prof,index+1,dataArray, profiles), source)
//   }
// })

component('pipe', {
  type: 'data',
  category: 'async:100',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data[]', dynamic: true, mandatory: true, composite: true}
  ],
  impl: async ctx => {
    const profiles = jb.asArray(ctx.profile.items)
    const source = ctx.runInner(profiles[0], profiles.length == 1 ? ctx.parentParam : null, `items~0`)
    const _res = profiles.slice(1).reduce( async (pr,prof,index) => {
      const dataArray = await jb.utils.waitForInnerElements(pr)
      jb.log(`pipe elem resolved input for ${index+1}`,{dataArray,ctx})
      return jb.common.runAsAggregator(ctx, prof,index+1,dataArray, profiles)
    }, source)
    const res = await jb.utils.waitForInnerElements(_res)
    jb.log(`pipe result`,{res,ctx})
    return res
  }
})

component('aggregate', {
  type: 'data',
  aggregator: true,
  description: 'in pipeline, calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'data', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

component('objFromProperties', {
  type: 'data',
  aggregator: true,
  description: 'object from entries of properties {id,val}',
  params: [
    {id: 'properties', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},properties) => jb.objFromEntries(properties.map(({id,val}) => [id,val]))
})

component('objFromEntries', {
  type: 'data',
  aggregator: true,
  description: 'object from entries',
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

component('join', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'separator', as: 'string', defaultValue: ','},
    {id: 'prefix', as: 'string', byName: true },
    {id: 'suffix', as: 'string'},
    {id: 'items', as: 'array', defaultValue: '%%'},
    {id: 'itemText', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,separator,prefix,suffix,items,itemText) => {
		const itemToText = ctx.profile.itemText ?	item => itemText(ctx.setData(item)) :	item => jb.tostring(item);	// performance
		return prefix + items.map(itemToText).join(separator) + suffix;
	}
})

component('unique', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
})

component('max', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,jb.asArray(ctx.data))
})

component('min', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.min.apply(0,jb.asArray(ctx.data))
})

component('sum', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => jb.asArray(ctx.data).reduce((acc,item) => +item+acc, 0)
})

component('slice', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {id: 'end', as: 'number', mandatory: true, description: '0-based index of where to end the selection (not including itself)'}
  ],
  impl: ({data},start,end) => {
		if (!data || !data.slice) return null
		return end ? data.slice(start,end) : data.slice(start)
	}
})

component('sort', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'propertyName', as: 'string', description: 'sort by property inside object'},
    {id: 'lexical', as: 'boolean', type: 'boolean'},
    {id: 'ascending', as: 'boolean', type: 'boolean'}
  ],
  impl: ({data},prop,lexical,ascending) => {
    if (!data || ! Array.isArray(data)) return null;
    let sortFunc
    const firstData = data[0] //jb.entries(data[0]||{})[0][1]
		if (lexical || isNaN(firstData))
			sortFunc = prop ? (x,y) => (x[prop] == y[prop] ? 0 : x[prop] < y[prop] ? -1 : 1) : (x,y) => (x == y ? 0 : x < y ? -1 : 1);
		else
			sortFunc = prop ? (x,y) => (x[prop]-y[prop]) : (x,y) => (x-y);
		if (ascending)
  		return data.slice(0).sort((x,y)=>sortFunc(x,y));
		return data.slice(0).sort((x,y)=>sortFunc(y,x));
	}
})

component('first', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items[0]
})

component('last', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(-1)[0]
})

component('count', {
  type: 'data',
  aggregator: true,
  description: 'length, size of array',
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.length
})

component('reverse', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},items) => items.slice(0).reverse()
})

component('sample', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'size', as: 'number', defaultValue: 300},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: ({},size,items) =>	items.filter((x,i)=>i % (Math.floor(items.length/size) ||1) == 0)
})

component('prop', {
  type: 'data',
  description: 'assign, extend obj with a single prop',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,name,val,type,obj) => ({...obj, [name]: jb.core.tojstype(val(),type)})
})

component('removeProps', {
  type: 'data',
  description: 'remove properties from object',
  params: [
    {id: 'names', type: 'data[]', mandatory: true},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,names,obj) => names.reduce((obj,name) => { const{ [name]: _, ...rest } = obj; return rest }, obj)
})

component('splitByPivot', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'pivot', as: 'string', description: 'prop name', mandatory: true},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,pivot,items) => {
      const keys = jb.utils.unique(items.map(item=>item[pivot]))
      const groups = Object.fromEntries(keys.map(key=> [key,[]]))
      items.forEach(item => groups[item[pivot]].push(item))
      return keys.map(key => ({[pivot]: key, items: groups[key]}))
  }
})

component('groupBy', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'pivot', as: 'string', description: 'new prop name', mandatory: true},
    {id: 'calcPivot', dynamic: true, mandatory: true, byName: true},
    {id: 'aggregate', type: 'group-prop[]', mandatory: true},
    {id: 'inputItems', defaultValue: '%%'},
  ],
  impl: pipeline(
    '%$inputItems%',
    prop('%$pivot%', '%$calcPivot()%'),
    splitByPivot('%$pivot%'),
    groupProps('%$aggregate%'),
    removeProps('items'),
  )
})

component('groupProps', {
  type: 'data',
  description: 'aggregate, extend group obj with a group props',
  params: [
    {id: 'props', type: 'group-prop[]', mandatory: true},
  ],
  impl: ({data},props) => props.flatMap(x=>jb.asArray(x)).reduce((item,prop) => ({...item, ...prop.enrichGroupItem(item)}), data )
})

component('prop', {
  type: 'group-prop',
  description: 'assign, extend group obj with a single prop, input is items',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true, defaultValue: '', description: 'input is group items'},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'},
  ],
  impl: (ctx,name,val,type) => ({ enrichGroupItem: item => ({...item, [name]: jb.core.tojstype(val(ctx.setData(item.items)),type)}) })
})

component('count', {
  type: 'group-prop',
  params: [
    {id: 'as', as: 'string', defaultValue: 'count'},
  ],
  impl: prop('%$as%', count())
})

component('join', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', mandatory: true, byName: true},
    {id: 'separator', as: 'string', defaultValue: ','},
  ],
  impl: prop('%$as%', join({data: '%{%$prop%}%', separator: '%$separator%'}))
})

component('max', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', defaultValue: 'max', byName: true}
  ],
  impl: prop('%$as%', max({data: '%{%$prop%}%'}))
})

component('min', {
  type: 'group-prop',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'as', as: 'string', defaultValue: 'min', byName: true}
  ],
  impl: prop('%$as%', min({data: '%{%$prop%}%'}))
})

});

jbLoadPackedFile({lineInPackage:2021, jb, noProxies: false, path: '/plugins/common/jb-common.js',fileDsl: '', pluginId: 'common' }, 
            function({jb,require,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
using('core')

component('list', {
  type: 'data',
  description: 'list definition, flatten internal arrays',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => items.flatMap(item=>Array.isArray(item) ? item : [item])
})

component('firstSucceeding', {
  type: 'data',
  params: [
    {id: 'items', type: 'data[]', as: 'array', composite: true}
  ],
  impl: ({},items) => {
    for(let i=0;i<items.length;i++) {
      const val = jb.val(items[i])
      const isNumber = typeof val === 'number'
      if (val !== '' && val != null && (!isNumber || (!isNaN(val)) && val !== Infinity && val !== -Infinity))
        return items[i]
    }
		return items.slice(-1)[0];
	}
})

component('firstNotEmpty', {
  type: 'any',
  params: [
    {id: 'first', type: '$asParent', dynamic: true, mandatory: true},
    {id: 'second', type: '$asParent', dynamic: true, mandatory: true}
  ],
  impl: If('%$first()%', '%$first()%', '%$second()%')
})

component('keys', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj && typeof obj === 'object' ? obj : {})
})

component('values', {
  type: 'data',
  description: 'Object.keys',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.values(obj && typeof obj === 'object' ? obj : {})
})

component('properties', {
  description: 'object entries as id,val',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => Object.keys(obj).filter(p=>p.indexOf('$jb_') != 0).map((id,index) =>
			({id: id, val: obj[id], index: index}))
})

component('mapValues', {
  description: 'change each value of properties',
  type: 'data',
  params: [
    {id: 'map', dynamic: true, mandatory: true},
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: (ctx,map,obj) => jb.objFromEntries(Object.keys(obj).map(k=>[k, map(ctx.setData(obj[k]))]))
})

component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => jb.entries(obj)
})

component('plus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x + +y
})

component('minus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x - +y
})

component('mul', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x * +y
})

component('div', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x / +y
})

component('math.fakeNS', {
})

 jb.defComponents('abs,acos,acosh,asin,asinh,atan,atan2,atanh,cbrt,ceil,clz32,cos,cosh,exp,expm1,floor,fround,hypot,log2,random,round,sign,sin,sinh,sqrt,tan,tanh,trunc'
  .split(','), f => component(`math.${f}`, {
    autoGen: true,
    category: 'math:70',
    params: [
      {id: 'func', as: 'string', defaultValue: f}
    ],
    impl: ({data},f) => Math[f](data)
  })
)

component('evalExpression', {
  description: 'evaluate javascript expression',
  type: 'data',
  params: [
    {id: 'expression', as: 'string', defaultValue: '%%', expression: 'e.g. 1+2'}
  ],
  impl: ({},expression) => {
    try {
      return eval('('+expression+')')
    } catch(e) {}
  }
})

component('prefix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(0,text.indexOf(separator))
})

component('suffix', {
  type: 'data',
  category: 'string:90',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => (text||'').substring(text.lastIndexOf(separator)+separator.length)
})

component('removePrefix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) =>
		text.indexOf(separator) == -1 ? text : text.substring(text.indexOf(separator)+separator.length)
})

component('removeSuffix', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'separator', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},separator,text) => text.lastIndexOf(separator) == -1 ? text : text.substring(0,text.lastIndexOf(separator))
})

component('removeSuffixRegex', {
  type: 'data',
  category: 'string:80',
  params: [
    {id: 'suffix', as: 'string', mandatory: true, description: 'regular expression. e.g [0-9]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,suffix,text) => {
		ctx.profile.prefixRegexp = ctx.profile.prefixRegexp || new RegExp(suffix+'$');
		const m = (text||'').match(ctx.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
})

component('property', {
  description: 'navigate/select/path property of object as ref object',
  category: 'common:70',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'ofObj', defaultValue: '%%'},
    {id: 'useRef', as: 'boolean', type: 'boolean<>'}
  ],
  impl: (ctx,prop,obj,useRef) =>	useRef ? jb.db.objectProperty(obj,prop,ctx) : obj[prop]
})

component('indexOf', {
  category: 'common:70',
  params: [
    {id: 'array', as: 'array', mandatory: true},
    {id: 'item', as: 'single', mandatory: true}
  ],
  impl: ({},array,item) => array.indexOf(item)
})

component('writeValue', {
  type: 'action',
  category: 'mutable:100',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,to,value,noNotifications) => {
    if (!jb.db.isRef(to)) {
      debugger
      ctx.run(ctx.profile.to,{as: 'ref'}) // for debug
      return jb.logError(`can not write to: ${ctx.profile.to}`, {ctx})
    }
    const val = jb.val(value)
    if (jb.utils.isPromise(val))
      return Promise.resolve(val).then(_val=>jb.db.writeValue(to,_val,ctx,noNotifications))
    else
      jb.db.writeValue(to,val,ctx,noNotifications)
  }
})

component('addToArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'toAdd', as: 'array', mandatory: true}
  ],
  impl: (ctx,array,toAdd) => jb.db.push(array, JSON.parse(JSON.stringify(toAdd)),ctx)
})

component('move', {
  type: 'action',
  category: 'mutable:80',
  description: 'move item in tree, activated from D&D',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.db.move(from,_to,ctx)
})

component('splice', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'fromIndex', as: 'number', mandatory: true},
    {id: 'noOfItemsToRemove', as: 'number', defaultValue: 0},
    {id: 'itemsToAdd', as: 'array', defaultValue: []}
  ],
  impl: (ctx,array,fromIndex,noOfItemsToRemove,itemsToAdd) =>
		jb.db.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
})

component('removeFromArray', {
  type: 'action',
  category: 'mutable:80',
  params: [
    {id: 'array', as: 'ref', mandatory: true},
    {id: 'itemToRemove', as: 'single', description: 'choose item or index'},
    {id: 'index', as: 'number', description: 'choose item or index'}
  ],
  impl: (ctx,array,itemToRemove,_index) => {
		const index = itemToRemove ? jb.toarray(array).indexOf(itemToRemove) : _index;
		if (index != -1)
			jb.db.splice(array,[[index,1]],ctx)
	}
})

component('getOrCreate', {
  type: 'data',
  description: 'memoize, cache, calculate value if empty and assign for next time',
  category: 'mutable:80',
  params: [
    {id: 'writeTo', as: 'ref', mandatory: true},
    {id: 'calcValue', dynamic: true}
  ],
  impl: async (ctx,writeTo,calcValue) => {
    let val = jb.val(writeTo)
    if (val == null) {
      val = await calcValue()
      jb.db.writeValue(writeTo,val,ctx)
    }
    return val
	}
})

component('toggleBooleanValue', {
  type: 'action',
  params: [
    {id: 'of', as: 'ref'}
  ],
  impl: (ctx,_of) => jb.db.writeValue(_of,jb.val(_of) ? false : true,ctx)
})

component('obj', {
  description: 'build object (dictionary) from props',
  category: 'common:100',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, sugar: true}
  ],
  impl: (ctx,properties) => jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx),p.type)]))
})

component('dynamicObject', {
  type: 'data',
  description: 'process items into object properties',
  params: [
    {id: 'items', mandatory: true, as: 'array'},
    {id: 'propertyName', mandatory: true, as: 'string', dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,items,name,value) =>
    items.reduce((obj,item)=>({ ...obj, [name(ctx.setData(item))]: value(ctx.setData(item)) }),{})
})

component('objFromVars', {
  type: 'data',
  params: [
    {id: 'vars', type: 'data[]', mandatory: true, as: 'array', description: 'names of vars'},
  ],
  impl: (ctx, vars) => vars.reduce((acc,id)=>({ ...acc, [id]: ctx.vars[id] }),{})
})

component('selectProps', {
  type: 'data',
  description: 'pick, extract properties from object',
  params: [
    {id: 'propNames', type: 'data[]', mandatory: true, as: 'array', description: 'names of properties'},
    {id: 'ofObj', type: 'data', defaultValue: '%%'},
  ],
  impl: (ctx, propNames, obj) => propNames.reduce((acc,id)=>({ ...acc, [id]: obj[id] }),{})
})

component('transformProp', {
  type: 'data',
  description: 'make transformation on a single prop, leave the other props alone',
  params: [
    {id: 'prop', as: 'string', mandatory: true, description: 'property to work on'},
    {id: 'transform', as: 'string', dynamic: true, mandatory: true, description: 'prop value as input', composite: true},
    {id: 'ofObj', type: 'data', defaultValue: '%%'},
  ],
  impl: (ctx, prop, transform, obj) => (typeof obj == 'object' && prop) ? {...obj, [prop]: transform(ctx.setData(obj[prop])) } : obj
})

component('extend', {
  type: 'data',
  description: 'assign and extend with calculated properties',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,properties,obj) =>
		Object.assign({}, obj, jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx),p.type)])))
})
component('assign', { autoGen: true, ...jb.utils.getUnresolvedProfile('extend', 'data')})

component('extendWithObj', {
  type: 'data',
  description: 'assign to extend with another obj',
  params: [
    {id: 'obj', mandatory: true },
    {id: 'withObj', defaultValue: '%%'}
  ],
  impl: (ctx,obj,withObj) => Object.assign({}, withObj, obj)
})
//component('merge', { autoGen: true, ...jb.utils.getUnresolvedProfile('extendWithObj', 'data')})

component('extendWithIndex', {
  type: 'data',
  aggregator: true,
  description: 'extend with calculated properties. %$index% is available ',
  params: [
    {id: 'props', type: 'prop[]', mandatory: true, defaultValue: []}
  ],
  impl: (ctx,properties) => jb.toarray(ctx.data).map((item,i) =>
			Object.assign({}, item, jb.objFromEntries(properties.map(p=>[p.name, jb.core.tojstype(p.val(ctx.setData(item).setVars({index:i})),p.type)]))))
})

component('prop', {
  type: 'prop',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: ''},
    {id: 'type', as: 'string', options: 'string,number,boolean,object,array,asIs', defaultValue: 'asIs'}
  ]
})

component('not', {
  type: 'boolean',
  params: [
    {id: 'of', type: 'boolean', as: 'boolean', mandatory: true, composite: true}
  ],
  impl: ({}, of) => !of
})

component('and', {
  description: 'logical and',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
      (res,item,i) => res && ctx.runInner(item, { type: 'boolean' }, `items~${i}`), true)
})

component('or', {
  description: 'logical or',
  type: 'boolean',
  params: [
    {id: 'items', type: 'boolean[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => (ctx.profile.items || []).reduce(
    (res,item,i) => res || ctx.runInner(item, { type: 'boolean' }, `items~${i}`), false)
})

component('between', {
  description: 'checks if number is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', mandatory: true},
    {id: 'to', as: 'number', mandatory: true},
    {id: 'val', as: 'number', defaultValue: '%%'}
  ],
  impl: ({},from,to,val) => val >= from && val <= to
})

component('contains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'string', byName: true},
    {id: 'anyOrder', as: 'boolean', type: 'boolean'}
  ],
  impl: ({},text,allText,anyOrder) => {
      let prevIndex = -1
      for(let i=0;i<text.length;i++) {
      	const newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1)
      	if (newIndex == -1) return false
      	prevIndex = anyOrder ? -1 : newIndex
      }
      return true
	}
})

component('notContains', {
  type: 'boolean',
  params: [
    {id: 'text', type: 'data[]', as: 'array', mandatory: true},
    {id: 'allText', defaultValue: '%%', as: 'array', byName: true}
  ],
  impl: not(contains('%$text%', { allText: '%$allText%' }))
})

component('startsWith', {
  description: 'begins with, includes, contains',
  type: 'boolean',
  params: [
    {id: 'startsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string', byName: true}
  ],
  impl: ({},startsWith,text) => text.startsWith(startsWith)
})

component('endsWith', {
  description: 'includes, contains',
  type: 'boolean',
  params: [
    {id: 'endsWith', as: 'string', mandatory: true},
    {id: 'text', defaultValue: '%%', as: 'string'}
  ],
  impl: ({},endsWith,text) => text.endsWith(endsWith)
})

component('filter', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) =>	jb.toarray(ctx.data).filter(item =>	filter(ctx,item))
})

component('matchRegex', {
  description: 'validation with regular expression',
  type: 'boolean',
  params: [
    {id: 'regex', as: 'string', mandatory: true, description: 'e.g: [a-zA-Z]*'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},regex,text) => text.match(new RegExp(regex))
})

component('toUpperCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) =>	text.toUpperCase()
})

component('toLowerCase', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.toLowerCase()
})

component('capitalize', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text.charAt(0).toUpperCase() + text.slice(1)
})

component('object', {
  impl: ctx => {
		const obj = ctx.profile.$object || ctx.profile
		if (Array.isArray(obj)) return obj

    const result = {}
		for(let prop in obj) {
			if ((prop == '$' && obj[prop] == 'object') || obj[prop] == null)
				continue
			result[prop] = ctx.runInner(obj[prop],null,prop)
		}
		return result
	}
})

component('json.stringify', {
  params: [
    {id: 'value', defaultValue: '%%'},
    {id: 'space', as: 'string', description: 'use space or tab to make pretty output'}
  ],
  impl: ({},value,space) => JSON.stringify(jb.val(value),null,space)
})

component('json.parse', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) =>	{
		try {
			return JSON.parse(text)
		} catch (e) {
			jb.logException(e,'json parse',{text, ctx})
		}
	}
})

component('split', {
  description: 'breaks string using separator',
  type: 'data',
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', description: 'E.g., "," or "<a>"'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'part', options: 'all,first,second,last,but first,but last', defaultValue: 'all'}
  ],
  impl: ({},separator,text,part) => {
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
})

component('replace', {
  type: 'data',
  params: [
    {id: 'find', as: 'string', mandatory: true},
    {id: 'replace', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m'}
  ],
  impl: ({},find,replace,text,useRegex,regexFlags) =>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    useRegex ? text.replace(new RegExp(find,regexFlags) ,replace) : text.replace(find,replace)
})

component('isNull', {
  description: 'is null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) == null
})

component('notNull', {
  description: 'not null or undefined',
  type: 'boolean',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({}, obj) => jb.val(obj) != null
})

component('isEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%', composite: true}
  ],
  impl: ({}, item) => !item || (Array.isArray(item) && item.length == 0)
})

component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%', composite: true}
  ],
  impl: ({}, item) => item && !(Array.isArray(item) && item.length == 0)
})

component('equals', {
  type: 'boolean',
  params: [
    {id: 'item1', mandatory: true},
    {id: 'item2', defaultValue: '%%'}
  ],
  impl: ({}, item1, item2) => {
    return typeof item1 == 'object' && typeof item1 == 'object' ? Object.keys(jb.utils.objectDiff(item1,item2)||[]).length == 0 
      : jb.tosingle(item1) == jb.tosingle(item2)
  }
})

component('notEquals', {
  type: 'boolean',
  params: [
    {id: 'item1', as: 'single', mandatory: true},
    {id: 'item2', defaultValue: '%%', as: 'single'}
  ],
  impl: ({}, item1, item2) => item1 != item2
})

component('runActions', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true}
  ],
  impl: ctx => {
		if (!ctx.profile) debugger;
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions']).filter(x=>x)
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    
		return actions.reduce((pr,action,index) =>
				pr.finally(function runActions() {return ctx.runInner(action, { as: 'single'}, innerPath + index ) })
			,Promise.resolve())
	}
})

component('runActionOnItem', {
  type: 'action',
  params: [
    {id: 'item', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true, composite: true}
  ],
  impl: (ctx,item,action) => jb.utils.isPromise(item) ? Promise.resolve(item).then(_item => action(ctx.setData(_item))) 
    : item != null && action(ctx.setData(item))
})

component('runActionOnItems', {
  type: 'action',
  description: 'forEach',
  params: [
    {id: 'items', as: 'ref[]', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'indexVariable', as: 'string' }
  ],
  impl: (ctx,items,action,indexVariable) => {
		return (jb.val(items)||[]).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runActionOnItems',{item, action, ctx}))
	}
})

component('removeProps', {
  type: 'action',
  description: 'remove properties from object',
  params: [
    {id: 'names', type: 'data[]', mandatory: true},
    {id: 'obj', byName: true, defaultValue: '%%'}
  ],
  impl: (ctx,names,obj) => obj && names.forEach(name=> delete obj[name])
})

component('delay', {
  type: 'action',
  moreTypes: 'data<>',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1},
    {id: 'res', defaultValue: '%%'}
  ],
  impl: ({},mSec,res) => jb.delay(mSec,res)
})

component('extractPrefix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '')
		} else { // regex
			const match = text.match(separator)
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '')
		}
	}
})

component('extractSuffix', {
  type: 'data',
  params: [
    {id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
    {id: 'text', as: 'string', defaultValue: '%%', byName: true},
    {id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex'},
    {id: 'keepSeparator', type: 'boolean', as: 'boolean'}
  ],
  impl: ({},separator,text,regex,keepSeparator) => {
		if (!regex) {
			return text.substring(text.lastIndexOf(separator) + (keepSeparator ? 0 : separator.length));
		} else { // regex
			const match = text.match(separator+'(?![\\s\\S]*' + separator +')'); // (?!) means not after, [\\s\\S]* means any char including new lines
			if (match)
				return text.substring(match.index + (keepSeparator ? 0 : match[0].length));
		}
	}
})

component('range', {
  description: '1-10, returns a range of numbers, generator, numerator, numbers, index',
  type: 'data',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({},from,to) => Array.from(Array(to-from+1).keys()).map(x=>x+from)
})

component('typeOf', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj)
		return Array.isArray(obj) ? 'array' : typeof obj
	}
})

component('className', {
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_obj) => {
	  const obj = jb.val(_obj);
		return obj && obj.constructor && obj.constructor.name
	}
})

component('isOfType', {
  type: 'boolean',
  params: [
    {id: 'type', as: 'string', mandatory: true, description: 'e.g., string,boolean,array'},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},_type,_obj) => {
  	const obj = jb.val(_obj)
  	const objType = Array.isArray(obj) ? 'array' : typeof obj
  	return _type.split(',').indexOf(objType) != -1
  }
})

component('inGroup', {
  description: 'is in list, contains in array',
  type: 'boolean',
  params: [
    {id: 'group', as: 'array', mandatory: true},
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({},group,item) =>	group.indexOf(item) != -1
})

component('range', {
  description: 'is in range',
  type: 'boolean',
  params: [
    {id: 'from', as: 'number', defaultValue: 1},
    {id: 'to', as: 'number', defaultValue: 10}
  ],
  impl: ({data},from,to) => +data >= +from && +data <= +to
})

component('Switch', {
  type: 'data',
  macroByValue: false,
  params: [
    {id: 'cases', type: 'switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'default', dynamic: true}
  ],
  impl: (ctx,cases,defaultValue) => {
		for(let i=0;i<cases.length;i++)
			if (cases[i].condition(ctx))
				return cases[i].value(ctx)
		return defaultValue(ctx)
	}
})

component('Case', {
  type: 'switch-case',
  params: [
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('action.switch', {
  type: 'action',
  params: [
    {id: 'cases', type: 'action.switch-case[]', as: 'array', mandatory: true, defaultValue: []},
    {id: 'defaultAction', type: 'action', dynamic: true}
  ],
  macroByValue: false,
  impl: (ctx,cases,defaultAction) => {
  	for(let i=0;i<cases.length;i++)
  		if (cases[i].condition(ctx))
  			return cases[i].action(ctx)
  	return defaultAction(ctx);
  }
})

component('action.switchCase', {
  type: 'action.switch-case',
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true, dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('formatDate', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'date', defaultValue: '%%', description: 'Date value'},
    {id: 'dateStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'timeStyle', as: 'string', options: 'full,long,medium,short'},
    {id: 'weekday', as: 'string', options: 'long,short,narrow'},
    {id: 'year', as: 'string', options: 'numeric,2-digit'},
    {id: 'month', as: 'string', options: 'numeric,2-digit,long,short,narrow'},
    {id: 'day', as: 'string', options: 'numeric,2-digit'},
    {id: 'hour', as: 'string', options: 'numeric,2-digit'},
    {id: 'minute', as: 'string', options: 'numeric,2-digit'},
    {id: 'second', as: 'string', options: 'numeric,2-digit'},
    {id: 'timeZoneName', as: 'string', options: 'long,short'}
  ],
  impl: (ctx,date) => new Date(date).toLocaleDateString(undefined, jb.objFromEntries(jb.entries(ctx.params).filter(e=>e[1])))
})

component('formatNumber', {
  description: 'using toLocaleDateString',
  params: [
    {id: 'precision', as: 'number', defaultValue: '2', description: '10.33'},
    {id: 'num', defaultValue: '%%'}
  ],
  impl: (ctx,precision,x) => typeof x == 'number' ? +x.toFixed(+precision) : x
})

component('getSessionStorage', {
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: ({},id) => jb.utils.sessionStorage(id)
})

component('action.setSessionStorage', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'value', dynamic: true}
  ],
  impl: ({},id,value) => jb.utils.sessionStorage(id,value())
})

component('waitFor', {
  type: 'action',
  params: [
    {id: 'check', dynamic: true},
    {id: 'interval', as: 'number', defaultValue: 14, byName: true},
    {id: 'timeout', as: 'number', defaultValue: 3000},
    {id: 'logOnError', as: 'string', dynamic: true}
  ],
  impl: (ctx,check,interval,timeout,logOnError) => {
    if (!timeout) 
      return jb.logError('waitFor no timeout',{ctx})
    // const res1 = check()
    // if (!jb.utils.isPromise(res1))
    //   return Promise.resolve(res1)
    let waitingForPromise, timesoFar = 0
    return new Promise((resolve,reject) => {
        const toRelease = setInterval(() => {
            timesoFar += interval
            if (timesoFar >= timeout) {
              clearInterval(toRelease)
              jb.log('waitFor timeout',{ctx})
              logOnError() && jb.logError(logOnError() + ` timeout: ${timeout}, waitingTime: ${timesoFar}`,{ctx})
              reject('timeout')
            }
            if (waitingForPromise) return
            const v = check()
            jb.log('waitFor check',{v, ctx})
            if (jb.utils.isPromise(v)) {
              waitingForPromise = true
              v.then(_v=> {
                waitingForPromise = false
                handleResult(_v)
              })
            } else {
              handleResult(v)
            }

            function handleResult(res) {
              if (res) {
                clearInterval(toRelease)
                resolve(res)
              }
            }
        }, interval)
    })
  }
})

component('addComponent', {
  description: 'add a component or data resource',
  type: 'action',
  params: [
    {id: 'id', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'type', options: 'watchableData,passiveData,comp', mandatory: true}
  ],
  impl: (ctx,id,value,type) => jb.component(id(), type == 'comp' ? value() : {[type]: value() } ),
  require: () => jb.db.addDataResourcePrefix()
})

component('fileContent', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => jbHost.codePackageFromJson().fetchFile(`${jbHost.baseUrl||''}${path}`)
})

component('calcDirectory', {
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: (ctx,path) => path[0] != '/' ? `${jbHost.baseUrl}/${path}` : path
})

});

jbLoadPackedFile({lineInPackage:3016, jb, noProxies: false, path: '/plugins/parsing/parsing.js',fileDsl: '', pluginId: 'parsing' }, 
            function({jb,require,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
using('common')

component('extractText', {
  description: 'text breaking according to begin/end markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarkers', type: 'data[]', as: 'array', mandatory: true},
    {id: 'endMarker', as: 'string'},
    {id: 'includingStartMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'includingEndMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'repeating', as: 'boolean', type: 'boolean', description: 'apply the markers repeatingly'},
    {id: 'noTrim', as: 'boolean', type: 'boolean'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in markers'},
    {id: 'exclude', as: 'boolean', type: 'boolean', description: 'return the inverse result. E.g. exclude remarks'}
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
        let end = endMarker ? findMarker(endMarker,start.end) : findStartMarkers(start.end)
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

component('breakText', {
  description: 'recursive text breaking according to multi level separators',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'separators', as: 'array', mandatory: true, defaultValue: [], description: 'multi level separators'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in separators'}
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

component('zipArrays', {
  type: 'data',
  description: '[[1,2],[10,20],[100,200]] => [[1,10,100],[2,20,200]]',
  params: [
    {id: 'value', description: 'array of arrays', as: 'array', mandatory: true}
  ],
  impl: (ctx,value) => value[0].map((x,i)=> value.map(line=>line[i]))
})

component('removeSections', {
  description: 'remove sections between markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarker', as: 'string', mandatory: true},
    {id: 'endMarker', as: 'string', mandatory: true},
    {id: 'keepEndMarker', as: 'boolean', type: 'boolean'}
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

component('merge', {
  type: 'data',
  description: 'assign, merge object properties',
  params: [
    {id: 'objects', type: 'data[]', as: 'array', mandatory: true}
  ],
  impl: ({}, objects) => Object.assign({},...objects)
})

component('clone', {
  params: [
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: ({},obj) => JSON.parse(JSON.stringify(obj))
})

component('filterEmptyProperties', {
  type: 'data',
  description: 'remove null or empty string properties',
  params: [
    {id: 'obj', defaultValue: '%%'}
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

component('trim', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) => text.trim()
})

component('splitToLines', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) => text.split('\n')
})

component('newLine', {
  impl: `
`
})

component('removePrefixRegex', {
  params: [
    {id: 'prefix', as: 'string', mandatory: true},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,prefix,text) =>
    text.replace(new RegExp('^'+prefix) ,'')
})

component('wrapAsObject', {
  description: 'object from entries, map each item as a property',
  type: 'data',
  aggregator: true,
  params: [
    {id: 'propertyName', as: 'string', dynamic: true, mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  impl: (ctx,key,value,items) => items.reduce((acc,item) => ({...acc, [jb.tostring(key(ctx.setData(item)))] : value(ctx.setData(item))}),{})
})

component('substring', {
  params: [
    {id: 'start', as: 'number', defaultValue: 0, description: '0-based index', mandatory: true},
    {id: 'end', as: 'number', mandatory: true, description: '0-based index of where to end the selection (not including itself)'},
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},start,end, text) => {
		if (!text || !text.substring) return ''
		return end ? text.substring(start,end) : text.substring(start)
	}
})

component('Undefined', {
  impl: () => undefined
})

component('switchByArraySize', {
  description: 'return different output by array size',
  params: [
    {id: 'array', as: 'array', mandatory: true},
    {id: 'zero', dynamic: true, mandatory: true},
    {id: 'one', dynamic: true, mandatory: true},
    {id: 'moreThanOne', dynamic: true, mandatory: true}
  ],
  impl: (ctx,array,zero,one,moreThanOne) => {
    if (!Array.isArray(array))
      return jb.logError('switchByArraySize - non array as input', {ctx,array})
    if (array.length == 0) return zero()
    if (array.length == 1) return one()
    return moreThanOne()
	}
})

component('asString', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: ({},text) => text
})

});

jbLoadPackedFile({lineInPackage:3295, jb, noProxies: false, path: '/plugins/llm/api/llm-via-api.js',fileDsl: 'llm', pluginId: 'llm-api' }, 
            function({jb,require,llmViaApi,system,assistant,user,llm,source,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,component,extension,using,dsl,pluginDsl}) {
dsl('llm')
using('common,parsing')

component('llmViaApi.completions', {
  type: 'data<>',
  params: [
    {id: 'chat', type: 'message[]', dynamic: true},
    {id: 'model', as: 'string', options: 'gpt-4o-mini,o1-preview,gpt-3.5-turbo,gpt-3.5-turbo-0125', defaultValue: 'gpt-3.5-turbo-0125', byName: true},
    {id: 'maxTokens', defaultValue: 100},
    {id: 'includeSystemMessages', as: 'boolean', type: 'boolean<>'}
  ],
  impl: async (ctx,chat,model,max_completion_tokens,includeSystemMessages) => {
        const settings = !jbHost.isNode && await fetch(`/?op=settings`).then(res=>res.json())
        const apiKey = jbHost.isNode ? process.env.OPENAI_API_KEY: settings.OPENAI_API_KEY
        const ret = await jbHost.fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                max_completion_tokens,
                model, top_p: 1, frequency_penalty: 0, presence_penalty: 0,
                messages: chat()                
              })
            }
          )
        const res = await ret.json()
        return includeSystemMessages ? res: (jb.path(res,'choices.0.message.content') || res)
    }
})

component('system', {
  type: 'message',
  params: [
    {id: 'content', as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,content) => ({role: 'system', content})
})

component('assistant', {
    type: 'message',
    params: [
        {id: 'content', as: 'string', newLinesInCode: true}
    ],
    impl: (ctx,content) => ({role: 'assistant', content})
})

component('user', {
  type: 'message',
  params: [
    {id: 'content', as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,content) => ({role: 'user', content})
})

component('llm.HtmlAndCssForJson', {
  type: 'data<>',
  params: [
    {id: 'json', as: 'string'}
  ],
  impl: pipe(
    llmViaApi.completions(
      system(
        `"Given the following JSON data representing a mobile device, decide which fields are important and should be presented in a widget. Then, generate the widget HTML to display the selected information and provide the relevant CSS to style the widget.

JSON Data:
{json_data}

Stage 1: Field Selection
- Determine which fields are important and should be included in the small widget. Consider factors such as relevance to the target audience, space constraints, and the overall goal of the widget. 

Stage 2: Field Sorting
- Determine the importance of the fields and sort them accordingly.

Stage 3: HTML Generation
- Based on the selected fields, create the HTML structure for the widget. Ensure that it is easy to read and maintain.

Stage 4: CSS Styling
- Provide CSS to style the widget in a visually appealing and responsive manner. Ensure that the styling complements the content and layout of the widget.
`
      ),
      user('%$json%')
    ),
    obj(
      prop('html', extractText({ startMarkers: '```html', endMarker: '```' })),
      prop('css', extractText({ startMarkers: '```css', endMarker: '```' }))
    )
  )
})


// rx

component('source.llmCompletions', {
  type: 'rx<>',
  params: [
    {id: 'chat', type: 'message[]', dynamic: true},
    {id: 'model', as: 'string', options: 'o1-preview,gpt-3.5-turbo-16k,gpt-4', defaultValue: 'gpt-3.5-turbo', byName: true},
    {id: 'maxTokens', defaultValue: 100},
    {id: 'includeSystemMessages', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,chat,model,max_completion_tokens,includeSystemMessages) => (start, sink) => {
      if (start !== 0) return
      let controller = null, connection, connectionAborted
      sink(0, (t,d) => {
        if (t == 2) {
          const aborted = controller && controller.signal.aborted
          jb.log('llm source connection abort request', {aborted, ctx})
          jb.delay(1).then(()=> controller && controller.signal.aborted && controller.abort())
          connectionAborted = true
        }
      })
      ;(async ()=>{
        const settings = !jbHost.isNode && await fetch(`/?op=settings`).then(res=>res.json())
        const apiKey = jbHost.isNode ? process.env.OPENAI_API_KEY: settings.OPENAI_API_KEY
        controller = new AbortController()
        connection = await jbHost.fetch('https://api.openai.com/v1/chat/completions', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model, max_completion_tokens, top_p: 1, frequency_penalty: 0, presence_penalty: 0, stream: true,
                messages: chat()                
              })
            }
          ).catch(e => {
            if (e instanceof DOMException && e.name == "AbortError") {
              jb.log('llm source done from app logic', {ctx})
            } else {
              jb.logException(e, 'llm connection', {ctx})
            }
          })

        const reader = connection.body.getReader()
        let chunkLeft = ''
        return reader.read().then(function processResp({ done, value }) {
          if (done) {
            jb.log('llm source done from reader', {ctx})
            sink(2)
            return
          }
          const fullStr = chunkLeft + String.fromCharCode(...value)
          chunkLeftForLog = chunkLeft
          chunkLeft = ''
          fullStr.split('\n\n').forEach(_line => {
            try {
              line = _line.trim()
              if (!line) return
              const val = line == 'data: [DONE]' ? 'done' : (line.startsWith('data: ') && line.endsWith('}]}') ? JSON.parse(line.slice(6)) : line)
              jb.log('llm processing val', {val, ctx})
              if (val == 'done') {
                jb.log('llm source done from content', {ctx})
                sink(2)
                return
              }
              if (typeof val == 'string') {
                chunkLeft = val
                jb.log('llm chunkLeft', {chunkLeft, ctx})
              }
              if (typeof val == 'object') {
                const content = jb.path(val,'choices.0.delta.content')
                const toSend = includeSystemMessages ? val : content
                toSend && sink(1,ctx.dataObj(toSend))  
              }
            } catch (e) {
              jb.logError('llm can not parse line',{chunkLeftForLog, line, sourceStr: String.fromCharCode(...value), ctx})
            }
          })
          return !connectionAborted && reader.read().then(processResp)
      })      
    })()
  }
})


});

jbLoadPackedFile({lineInPackage:3480, jb, noProxies: false, path: '/plugins/loader/jb-loader.js',fileDsl: '', pluginId: 'loader' }, 
            function({jb,require,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {

function jbBrowserCodePackage(repo = '', fetchOptions= {}, useFileSymbolsFromBuild) {
  return {
    repo: repo.split('/')[0],
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path) { return useFileSymbolsFromBuild ? this._fileSymbolsFromStaticFileServer(path) 
      : this._fileSymbolsFromStudioServer(path) },

    _fetch(path) { 
      const hasBase = path && path.match(/\/\//)
      return fetch(hasBase ? path: jbHost.baseUrl + path) //, fetchOptions) 
    },      
    _fileSymbolsFromStudioServer(path) {
      return this.fetchJSON(`${jbHost.baseUrl||''}?op=fileSymbols&path=${repo}${path}`)
    },
    async _fileSymbolsFromStaticFileServer(path) {
      if (!this.loadedSymbols) {
        this.loadedSymbols = [
          ...await this.fetchJSON(`/dist/symbols/plugins.json`),
          ...await this.fetchJSON(`/dist/symbols/projects.json`),
        ];
      }
      return this.loadedSymbols.filter(e=>e.path.indexOf(path+'/') == 1)
    },
  }
}

globalThis.jbHost = globalThis.jbHost || { // browserHost - studioServer,worker and static
  fetch: (...args) => globalThis.fetch(...args),
  baseUrl: '',
  fetchOptions: {},
  log(...args) { console.log (...args) },
  WebSocket_Browser: globalThis.WebSocket,
  codePackageFromJson(package) {
    if (package == null || package.$ == 'defaultPackage') return jbBrowserCodePackage('',{})
    if (package.$ == 'jbStudioServer' || package.$ == 'fileSystem')
        return jbBrowserCodePackage(`${package.repo}/`)
    if (package.$ == 'staticViaHttp')
        return jbBrowserCodePackage(`${package.repo}/`,{mode: 'cores'}, true)
  }
}

async function jbInitFromPacked(uri, sourceCode , {initSpyByUrl} ={}) {
  const code = await fetch(`${jbHost.baseUrl}/package/${sourceCode.plugins.join(',')}.js`).then(x=>x.text())
  await eval(code)
  const jb = await jbLoadPacked("${id}");
  jb.uri = uri
  return jb
}

async function jbInit(uri, sourceCode , {multipleInFrame, initSpyByUrl, baseUrl, packOnly} ={}) {
  if (baseUrl) jbHost.baseUrl = baseUrl // used for extension content script
  const packedCode = []
  const loadErrors = []
  const jb = { 
    uri,
    sourceCode,
    loadedFiles: {},
    plugins: {},
    loadjbFile, pathToPluginId
  }
  if (!multipleInFrame) globalThis.jb = jb // multipleInFrame is used in jbm.child
  if (sourceCode.actualCode) {
    const f = eval(`(async function (jb) {${sourceCode.actualCode}\n})//# sourceURL=treeShakeClient?${jb.uri}`)
    await f(jb)
    return jb
  }

  const pluginPackages = Array.isArray(sourceCode.pluginPackages) ? sourceCode.pluginPackages : [sourceCode.pluginPackages]
  await pluginPackages.reduce( async (pr,codePackage)=> pr.then(() =>
    loadPluginSymbols(jbHost.codePackageFromJson(codePackage),{loadProjects: sourceCode.projects && sourceCode.projects.length})), Promise.resolve());
  calcPluginDependencies(jb.plugins,jb)
  const topPlugins = unique([
    ...((sourceCode.projects||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.projects || [])),
    ...((sourceCode.plugins||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>!x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.plugins || [])) 
    ]).filter(x=>jb.plugins[x])

  await ['jb-core','core-utils','core-components','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`).reduce((pr,path) => 
    pr.then(()=> loadjbFile(path,{noProxies: true, plugin: jb.plugins.core, fileSymbols: jb.plugins.core.files.find(x=>x.path == path)})), Promise.resolve())
  if (initSpyByUrl)
    jb.spy.initSpyByUrl()
  jb.noSupervisedLoad = false
  if (packOnly)
    packedCode.push({code: 'jb.noSupervisedLoad = false'})
  if (jb.jbm && treeShakeServerUri) jb.jbm.treeShakeServerUri = sourceCode.treeShakeServerUri

  await loadPlugins(topPlugins)
  const libs = unique(topPlugins.flatMap(id=>jb.plugins[id].requiredLibs))
  const libsToInit = sourceCode.libsToInit ? sourceCode.libsToInit.split(','): libs
  jb.initializeTypeRules(libs)
  if (packOnly)
    return [packedCodePrefix(jb,libs,libsToInit), ...packedCode , {code:'}'}]

  await jb.initializeLibs(libsToInit)
  jb.utils.resolveLoadedProfiles()
  loadErrors.forEach(({err,logObj}) => jb.logError(err,logObj))

  return jb

  function unique(ar,f = (x=>x) ) {
    const keys = {}, res = []
    ar.forEach(e=>{ if (!keys[f(e)]) { keys[f(e)] = true; res.push(e) } })
    return res
  }
  function pathToPluginId(path,addTests) {
    const innerPath = (path.match(/(plugins|projects)\/(.+)/) || ['','',''])[2].split('/').slice(0,-1)
    const testFile = path.match(/-(tests|testers).js$/)
    const testFolder = path.match(/\/tests\//)
    const tests = addTests || testFile || (testFolder && innerPath[innerPath.length-1] != 'tests')  ? '-tests': ''
    if (testFile && testFolder)
      return innerPath.slice(0,-1).join('-') + tests
    return innerPath.join('-') + tests
  }
  async function loadPluginSymbols(codePackage,{loadProjects} = {}) {
    const pluginsSymbols = await codePackage.fileSymbols('plugins')
    const projectSymbols = loadProjects ? await codePackage.fileSymbols('projects') : []
    ;[...pluginsSymbols,...projectSymbols.map(x=>({...x, isProject: true}))].map(entry =>{
      const id = pathToPluginId(entry.path)
      jb.plugins[id] = jb.plugins[id] || { id, codePackage, files: [], isProject: entry.isProject }
      jb.plugins[id].files.push(entry)
    })
  }
  async function loadPlugins(plugins) {
    await plugins.reduce( (pr,id) => pr.then( async ()=> {
      const plugin = jb.plugins[id]
      if (!plugin || plugin.loadingReq) return
      plugin.loadingReq = true
      await loadPlugins(plugin.dependent)
      await Promise.all(plugin.files.map(fileSymbols =>loadjbFile(fileSymbols.path,{fileSymbols,plugin})))
    }), Promise.resolve() )
  }
  async function loadjbFile(path,{noProxies, fileSymbols, plugin} = {}) {
    if (jb.loadedFiles[path]) return
    const _code = await plugin.codePackage.fetchFile(path)
    const sourceUrl = `${path}?${jb.uri}`.replace(/#/g,'')
    const code = `${_code}\n//# sourceURL=${sourceUrl}`
    const fileDsl = fileSymbols && fileSymbols.dsl
    const proxies = noProxies ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
    const context = { jb, 
      ...(typeof require != 'undefined' ? {require} : {}),
      ...proxies,
      component:(id,comp) => jb.component(id,comp,{plugin,fileDsl}),
      extension:(libId, p1 , p2) => jb.extension(libId, p1 , p2,{plugin}),
      using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
    }
    try {
      //console.log(`loading ${path}`)
      const wCode = `(function({${Object.keys(context)}}) {${code}\n})`
      if (packOnly) packedCode.push({ path,
          code: `jbLoadPackedFile({lineInPackage: 0, jb, noProxies: ${noProxies ? true: false}, path: '${path}',fileDsl: '${fileDsl||''}', pluginId: '${plugin.id||''}' }, 
            function({${Object.keys(context)}}) {\n${_code}\n});\n`
      })
      if (noProxies || !packOnly) {
        const f = eval(wCode)
        f(context)
        jb.loadedFiles[path] = true
      }
    } catch (e) {
      if (!handleUnknownComp((e.message.match(/^(.*) is not defined$/)||['',''])[1]))
        return jb.logException(e,`loadjbFile lib ${path}`,{context, code})
    }

    function handleUnknownComp(unknownCmp) {
      if (!unknownCmp) return
      try {
        const fixed = code.replace(new RegExp(`${unknownCmp}\\(`,'g'),`unknownCmp('${unknownCmp}',`)
        const f = eval(`(function(${Object.keys(context)}) {${fixed}\n})`)
        f(...Object.values(context))
        jb.loadedFiles[path] = true
        jb.logError(`loader unknown comp ${unknownCmp} in file ${sourceUrl}`,{})
        return true
      } catch(e) {}
    }
  }
  function calcPluginDependencies(plugins) {
    Object.keys(plugins).map(id=>calcDependency(id))
    Object.values(plugins).map(plugin=>{
      const pluginDsls = unique(plugin.files.map(e=>e.pluginDsl).filter(x=>x))
      if (pluginDsls.length > 1)
        jb.logError(`plugin ${plugin.id} has more than one dsl`,{pluginDsls})
      plugin.dsl = pluginDsls[0]
    })
    // the virtual xx-tests plugin must have the same dsl as the plugin
    Object.values(plugins).filter(plugin=>plugin.id.match(/-tests$/)).forEach(plugin=>
      plugin.dsl = (jb.plugins[plugin.id.slice(0,-6)] || {}).dsl)

    function calcDependency(id,history={}) {
      const plugin = plugins[id]
      if (!plugin) {
        loadErrors.push({err: 'calcDependency: can not find plugin', logObj: {id, history}})
        return []
      }
      if (plugin.dependent) return [id, ...plugin.dependent]
      if (history[id])
        return [`$circular:${id}`]
      const baseOfTest = (id.match(/-tests$/) ? [id.slice(0,-6),'testing'] : []).filter(x=>plugins[x])
      plugin.using = unique(plugin.files.flatMap(e=> unique(e.using)))
      const dslOfFiles = plugin.files.filter(fileSymbols=>fileSymbols.dsl && fileSymbols.dsl != plugin.dsl).map(({path,dsl}) => [path,dsl])
      if (dslOfFiles.length)
        plugin.dslOfFiles = dslOfFiles

      const dependent = unique([
        ...plugin.files.flatMap(e=> unique(e.using.flatMap(dep=>calcDependency(dep,{...history, [id]: true})))),
        ...baseOfTest.flatMap(dep=>calcDependency(dep,{...history, [id]: true}))]
      ).filter(x=>x !=`$circular:${id}`)

      plugin.circular = dependent.find(x=>x.match(/^\$circular:/))
      const ret = [id, ...dependent]
      if(!plugin.circular) {
        plugin.dependent = dependent
        plugin.requiredFiles = unique(ret.flatMap(_id=>plugins[_id].files), x=>x.path)
        plugin.requiredLibs = unique(ret.flatMap(_id=>plugins[_id].files).flatMap(x=>x.libs || []))
        plugin.proxies = unique(plugin.requiredFiles.flatMap(x=>x.ns))
      }
      return ret
    }
  }
}

// jb-pack
function packedCodePrefix(jb,libs,libsToInit) {
  const plugins = Object.fromEntries(Object.values(jb.plugins).filter(x=>x.loadingReq)
    .map(({id,dependent,proxies,using,dsl,dslOfFiles,files})=>({id,dependent,proxies,dsl,dslOfFiles,files: files.map(({path}) => path) })).map(p=>[p.id,p]))

  const _jb = { sourceCode: jb.sourceCode, loadedFiles: {}, plugins}
  return { code: [
    'async function jbLoadPacked({uri,initSpyByUrl,multipleInFrame}={}) {',
    `const jb = ${JSON.stringify(_jb)}`,
    `if (!multipleInFrame) globalThis.jb = jb`,
    `jb.uri = uri || 'main'`,
    `jb.startTime = new Date().getTime()`,
    jbCreatePlugins.toString(),
    jbLoadPackedFile.toString(),
    `\njbloadPlugins(jb,jbLoadPackedFile)`,
    `if (initSpyByUrl) jb.spy.initSpyByUrl()`,
    `\njb.initializeTypeRules(${JSON.stringify(libs||[])})
await jb.initializeLibs(${JSON.stringify(libsToInit||[])})
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}`,
'\nfunction jbloadPlugins(jb,jbLoadPackedFile) {'
].join('\n') 
  }
}

function jbLoadPackedFile({lineInPackage, jb, noProxies, path,fileDsl,pluginId}, loadFunc) {
  if (jb.loadedFiles[path]) return
  const plugin = jb.plugins[pluginId]
  const proxies = noProxies ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
  const context = { jb, 
    ...(typeof require != 'undefined' ? {require} : {}),
    ...proxies,
    component:(id,comp) => jb.component(id,comp,{plugin,fileDsl,path,lineInPackage}),
    extension:(libId, p1 , p2) => jb.extension(libId, p1 , p2,{plugin,path,lineInPackage}),
    using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
  }
  try {
      loadFunc(context)
      jb.loadedFiles[path] = true
  } catch (e) {
  }
}

function jbCreatePlugins(jb,plugins) {
  jbHost.defaultCodePackage = jbHost.defaultCodePackage || jbHost.codePackageFromJson()
  plugins.forEach(plugin=> {
    jb.plugins[plugin.id] = jb.plugins[plugin.id] || { ...plugin, codePackage : jbHost.defaultCodePackage }
  })
}

if (typeof module != 'undefined') module.exports = { jbInit };

});

jbLoadPackedFile({lineInPackage:3759, jb, noProxies: false, path: '/plugins/loader/source-code.js',fileDsl: 'loader', pluginId: 'loader' }, 
            function({jb,require,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
dsl('loader')

extension('loader','main' , {
    shortFilePath(fullFilePath) {
        const elems = fullFilePath.split('/').reverse()
        return '/' + elems.slice(0,elems.findIndex(x=> x == 'plugins' || x == 'projects')+1).reverse().join('/')
    },
    unifyPluginsToLoad(pluginsToLoad, plugins) {
        return jb.asArray(pluginsToLoad).reduce((acc,item) => {
            const plugins = jb.utils.unique([...(acc.plugins || []), ...(item.plugins || [])])
            return {...acc, ...item, plugins}
        } , { plugins })
    },
    pluginOfFilePath(fullFilePath, addTests) {
      return jb.pathToPluginId(jb.loader.shortFilePath(fullFilePath),addTests)
    },
    pluginsByCtx(ctx) {
      return ctx.probe ? ['probe-core','tgp-formatter'] : []
    },
    mergeSourceCodes(sc1,sc2) {
      if (!sc1) return sc2
      if (!sc2) return sc1
      const plugins = jb.utils.unique([...(sc1.plugins || []), ...(sc2.plugins || [])])
      const projects = jb.utils.unique([...(sc1.projects || []), ...(sc2.projects || [])])
      const pluginPackages = jb.utils.unique([...(sc1.pluginPackages || []), ...(sc2.pluginPackages || [])], package => package.repo || 'default')
      return {plugins, projects, pluginPackages}
    },
    pluginsOfProfile(prof, comps = jb.comps) {
        if (!prof || typeof prof != 'object') return []
        if (!prof.$$)
            return jb.utils.unique(Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x)))
        const comp = comps[prof.$$]
        if (!comp) {
            debugger
            jb.logError(`cmd - can not find comp ${prof.$$} please provide sourceCode`,{ctx})
            return []
        }
        return jb.utils.unique([comp.$plugin,...Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x))]).filter(x=>x)
    }    
})

// source-code
component('sourceCode', {
  type: 'source-code',
  params: [
    {id: 'pluginsToLoad', type: 'plugins-to-load[]'},
    {id: 'pluginPackages', type: 'plugin-package[]'}, // , defaultValue: defaultPackage()
    {id: 'libsToInit', as: 'string', description: 'empty means load all libraries'},
    {id: 'actualCode', as: 'string', description: 'alternative to plugins'}
  ],
  impl: (ctx,pluginsToLoad,pluginPackages,libsToInit,actualCode) => ({ 
    ...(pluginPackages.filter(x=>x).length ? { pluginPackages : pluginPackages.filter(x=>x)} : {}),
    ...jb.loader.unifyPluginsToLoad(pluginsToLoad, jb.loader.pluginsByCtx(ctx)),
    ...(libsToInit ? {libsToInit} : {}),
    ...(actualCode ? {actualCode} : {}),
  })
})

component('sourceCodeByTgpPath', {
  type: 'source-code',
  params: [
    {id: 'tgpPath', as: 'string', mandatory: true},
    {id: 'tgpModel'}
  ],
  impl: sourceCode(
    plugins(({},{},{tgpModel, tgpPath}) => {
    const comps = tgpModel ? tgpModel.comps : jb.comps
    return jb.path(comps[tgpPath.split('~')[0]],'$plugin') || ''
  })
  )
})

component('plugins', {
  type: 'source-code',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: sourceCode(plugins('%$plugins%'))
})

component('extend', {
  type: 'source-code',
  params: [
    {id: 'sourceCode', type: 'source-code', mandatory: true},
    {id: 'with', type: 'source-code', mandatory: true},
  ],
  impl: (ctx,sc1,sc2) => jb.loader.mergeSourceCodes(sc1,sc2)
})

component('project', {
  type: 'source-code',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: sourceCode(project('%$project%'))
})

component('sameAsParent', {
  type: 'source-code',
  impl: () => jb.sourceCode
})
// plugins-to-load

component('pluginsByPath', {
  type: 'plugins-to-load',
  params: [
    {id: 'filePath', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/mycode.js'},
    {id: 'addTests', as: 'boolean', description: 'add plugin-tests', type: 'boolean', byName: true}
  ],
  impl: (ctx,fullFilePath,addTests) => {
    const filePath = jb.loader.shortFilePath(fullFilePath)
    const plugins = [jb.loader.pluginOfFilePath(fullFilePath,addTests)]
    const project = jb.path(filePath.match(/projects\/([^\/]+)/),'1')
    return { plugins, ...(project ? {projects: [project]} : {}) }
  }
})

component('loadAll', {
  type: 'plugins-to-load',
  impl: ctx => ({ plugins: ['*'] })
})

component('plugins', {
  type: 'plugins-to-load',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: (ctx,plugins) => ({ plugins: Array.isArray(plugins) ? plugins : plugins.split(',') })
})

component('project', {
  type: 'plugins-to-load',
  params: [
    {id: 'project', as: 'string', mandatory: true, description: '* for all'}
  ],
  impl: (ctx,project) => ({projects: [project]})
})


// plugin packages

component('packagesByPath', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/xx-tests.js'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: (ctx,path,host) => {
    const repo = (path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
    if (repo && repo != 'jb-react') {
      const repsBase = path.split('projects/')[0] + 'projects/'
      const package = (!host || host == 'node') ? { $: 'fileSystem', repo, baseDir: repsBase + repo} 
        : host == 'studio' ? { $: 'jbStudioServer', repo }
        : host == 'static' ? { $: 'staticViaHttp', repo } : null
      return [{ $: 'defaultPackage' }, package]
    }
  }
})

component('defaultPackage', {
  type: 'plugin-package',
  impl: () => ({ $: 'defaultPackage' })
})

component('staticViaHttp', {
  type: 'plugin-package',
  params: [
    {id: 'baseUrl', as: 'string', mandatory: true}
  ],
  impl: ctx => ({ $: 'staticViaHttp', ...ctx.params, useFileSymbolsFromBuild: true })
})

component('jbStudioServer', {
  type: 'plugin-package',
  params: [
    {id: 'repo', as: 'string'}
  ],
  impl: (ctx,repo) => repo && ({ $: 'jbStudioServer', ...ctx.params })
})

component('fileSystem', {
  type: 'plugin-package',
  params: [
    {id: 'baseDir', as: 'string'}
  ],
  impl: ctx => ({ $: 'fileSystem', ...ctx.params })
})

component('zipFile', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: ctx => ({ $: 'zipFile',  ...ctx.params })
})

component('sourceCode.encodeUri', {
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true}
  ],
  impl: (ctx,source) => jb.frame.encodeURIComponent(JSON.stringify(source))
})

});

jbLoadPackedFile({lineInPackage:3966, jb, noProxies: false, path: '/plugins/tree-shake/tree-shake.js',fileDsl: '', pluginId: 'tree-shake' }, 
            function({jb,require,treeShake,treeShakeClientWithPlugins,treeShakeClient,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
using('loader')

component('treeShake', {
  type: 'source-code<loader>',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true },
    {id: 'treeShakeServerUri', as: 'string', defaultValue: () => jb.uri },
  ],
  impl: (ctx,sourceCode,treeShakeServerUri) => ({ ...sourceCode, treeShakeServerUri })
})

component('treeShakeClientWithPlugins', {
  type: 'source-code<loader>',
  impl: treeShake(sourceCode(plugins('remote-jbm','tree-shake')))
})

component('treeShakeClient', {
  type: 'source-code<loader>',
  impl: treeShake(sourceCode({ actualCode: () => jb.treeShake.clientCode() }))
})

extension('treeShake', {
    initExtension() {
        return {
            clientComps: ['#extension','#core.run','#component',
                '#jbm.extendPortToJbmProxy','#jbm.portFromFrame',
                '#db.addDataResourcePrefix','#db.removeDataResourcePrefix',
                '#spy.initSpy','#treeShake.getCodeFromRemote','#cbHandler.terminate','data<>treeShake.getCode','action<>waitFor',
                'any<>call','any<>runCtx','any<>If','any<>firstNotEmpty','any<>typeAdapter'],
            existingFEPaths: {},
            loadingCode: {},
            defaultPlugin: { codePackage: jbHost.codePackageFromJson()},
//            server: jb.frame.jbInit,
            serverUrl: jb.frame.jbTreeShakeServerUrl,
            getJSFromUrl: jb.frame.jbGetJSFromUrl,
        }
    },
    existing() {
        const jbFuncs = Object.keys(jb).filter(x=> typeof jb[x] == 'function').map(x=>`#${x}`)
        const libs = Object.keys(jb).filter(x=> typeof jb[x] == 'object' && jb[x].__extensions)
        const funcs = libs.flatMap(lib=>Object.keys(jb[lib]).filter(x => typeof jb[lib][x] == 'function').map(x=>`#${lib}.${x}`) )
        return [...Object.keys(jb.comps), ...jbFuncs, ...funcs]
    },
    treeShake(ids, existing) {
        const _ids = ids.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_ids.flatMap(id => jb.treeShake.dependent(id).filter(x=>!existing[x])))
        const idsWithoutPartial = jb.utils.unique(_ids.map(id=>id.split('~')[0]))
        if (!dependent.length) return idsWithoutPartial
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._ids ].map(x=>[x,true]) )
        return [ ...idsWithoutPartial, ...jb.treeShake.treeShake(dependent, existingExtended)]
    },
    dependent(id) {
        const func = id[0] == '#' && id.slice(1)
        if (func && jb.path(jb,func) !== undefined)
            return jb.treeShake.dependentOnFunc(jb.path(jb,func))
        else if (jb.comps[id])
            return jb.treeShake.dependentOnObj(jb.comps[id])
        else if (id.match(/~/)) 
            return [jb.path(jb.comps,id.split('~'))].filter(x=>x)
                .flatMap(obj=> typeof obj === 'function' ? jb.treeShake.dependentOnFunc(obj) : jb.treeShake.dependentOnObj(obj))
        else {
            debugger
            jb.logError(`treeShake can not find comp ${id}`, {id})
        }
        return []
    },
    dependentOnObj(obj, onlyMissing) {
        //if (obj[jb.core.OnlyData]) return []
        const isRemote = 'source.remote:rx,remote.operator:rx,remote.action:action,remote.data:calc' // code run in remote is not dependent
        const vals = Object.keys(obj).filter(k=>!obj.$ || isRemote.indexOf(`${obj.$}:${k}`) == -1).map(k=>obj[k])
        // const dslType = obj.$ && (obj.$.indexOf('<') != -1 ? '' 
        //     : jb.core.genericCompIds[obj.$] ? 'any<>' 
        //     : (obj.$dslType || jb.path(obj,[jb.core.CT,'dslType']) || ''))
        // if (obj.$ && obj.$ != 'Var' && obj.$.indexOf('<') == -1 && obj.$ != 'runCtx' && !dslType)
        //     debugger
        //     //jb.logError('treeshake comp without a type', {obj})
        // const fullId = obj.$$ && (jb.path(jb.comps[obj.$$],'$$') || `${dslType}${obj.$}`)
        return [
            ...(obj.$$ ? [obj.$$] : []),
            ...vals.filter(x=> x && typeof x == 'object').flatMap(x => jb.treeShake.dependentOnObj(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'function').flatMap(x => jb.treeShake.dependentOnFunc(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('%$') != -1).flatMap(x => jb.treeShake.dependentResources(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('@js@') == 0).flatMap(x => jb.treeShake.dependentOnFunc(x, onlyMissing)),
        ].filter(id=> !onlyMissing || jb.treeShake.missing(id)).filter(x=> x!= 'runCtx')
    },
    dependentOnFunc(func, onlyMissing) {
        if (!func) { 
            return []
            //debugger
        }
        const funcStr = typeof func == 'string' ? func : func.toString()
        const funcDefs = [...funcStr.matchAll(/{([a-zA-Z0-9_ ,]+)}\s*=\s*jb\.([a-zA-Z0-9_]+)\b[^\.]/g)] // {...} = jb.xx
            .map(line=>({ lib: line[2], funcs: line[1].split(',')}))
            .flatMap(({lib,funcs}) => funcs.map(f=>`#${lib}.${f.trim()}`))
        const funcUsage = [...funcStr.matchAll(/\bjb\.([a-zA-Z0-9_]+)\.?([a-zA-Z0-9_]*)\(/g)].map(e=>e[2] ? `#${e[1]}.${e[2]}` : `#${e[1]}`)
        const extraComps = [...funcStr.matchAll(/\/\/.?#jbLoadComponents:([ ,\.\-#a-zA-Z0-9_<>]*)/g)].map(e=>e[1]).flatMap(x=>x.split(',')).map(x=>x.trim()).filter(x=>x)
        const inCodeComps = [...funcStr.matchAll(/{\s*\$: '([^']+)'/g)].map(x=>x[1])
            .filter(x=> !['recoverWidget','defaultPackage','Var','feature<>feature.contentEditable','updates', 'asIs', 'withProbeResult', 'createHeadlessWidget', 'runCtx'].includes(x))
        inCodeComps.forEach(x=> { if (!x.match(/</)) jb.logError(`treeshake missing type ${x}`,{func,funcStr})})

        //jb.log('treeshake dependent on func',{f: func.name || funcStr, funcDefs, funcUsage})
        const required = (func.requireFuncs||'').split(',').filter(x=>x)
        const res = [ ...(func.__initFunc ? [func.__initFunc] : []), ...funcDefs, ...funcUsage, ...extraComps,...inCodeComps, ...required]
            .filter(x=>!x.match(/^#frame\./)).filter(id=> !onlyMissing || jb.treeShake.missing(id))

        return res
    },
    dependentResources(str, onlyMissing) {
        return Array.from(str.matchAll(/%\$([^%\.\/]*)/g)).map(x=>`dataResource.${x[1]}`)
            .filter(id => jb.comps[id])
            .filter(id=> !onlyMissing || jb.treeShake.missing(id))
    },
    code(ids) {
        jb.log('treeshake code',{ids})
        const funcs = ids.filter(cmpId => !jb.comps[cmpId])
        const cmps = ids.filter(cmpId => jb.comps[cmpId])
        const topLevel = jb.utils.unique(funcs.filter(x=>x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
        const topLevelCode = topLevel.length && `Object.assign(jb, ${jb.utils.prettyPrint(jb.objFromEntries(topLevel.map(x=>[x,jb.path(jb,x)])))}\n)` || ''
        const libsFuncs1 = jb.utils.unique(funcs.filter(x=>!x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
            .filter(x=>jb.path(jb,x)).map(funcId =>({funcId, lib: funcId.split('.')[0], ext: jb.path(jb,funcId).extId}))
            .filter(x=>!x.funcId.match(/\.__extensions/))
        const libsFuncs = libsFuncs1.filter(x=>x.ext)
        const withoutExt = libsFuncs1.filter(x=>!x.ext).map(x=>x.funcId).join(', ')
        if (withoutExt)
            jb.log('treeshake lib functions defined out of extension', {withoutExt})
        const extensions = jb.utils.unique(libsFuncs.map(x=>`${x.lib}#${x.ext}`)).map(x=>x.split('#'))
        const libsCode = extensions.map(([lib,ext]) => {
            const extObj = {
                ...jb.objFromEntries(libsFuncs.filter(x=>x.lib == lib && x.ext == ext)
                    .map(x=>[x.funcId.split('.').pop(), jb.path(jb,x.funcId)]) ),
                $phase: jb.path(jb,`${lib}.__extensions.${ext}.phase`),
                $requireLibs: jb.path(jb,`${lib}.__extensions.${ext}.requireLibs`),
                $requireFuncs: jb.path(jb,`${lib}.__extensions.${ext}.requireFuncs`),
                initExtension: jb.path(jb,`${lib}.__extensions.${ext}.init`),
                typeRules: jb.path(jb,`${lib}.__extensions.${ext}.typeRules`),
            }
            const extCode = jb.utils.prettyPrint(Object.fromEntries(Object.entries(extObj).filter(([_, v]) => v != null)))
            const pluginId = jb[lib].__extensions[ext].plugin.id
            return `jb.extension('${lib}', '${ext}', ${extCode}, {plugin: jb.plugins['${pluginId}']})`
        }).join('\n\n')

        const compsCode = cmps.map(cmpId =>jb.treeShake.compToStr(cmpId)).join('\n\n')
        const plugins = jb.utils.unique([...cmps.map(cmpId => jb.comps[cmpId].$plugin),
            ...extensions.map(([lib,ext]) => jb[lib].__extensions[ext].plugin.id)
            ]).map(id =>({id, dsl: jb.plugins[id].dsl}))
            //jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId],{noMacros: true})).join('\n\n')
        const libs = jb.utils.unique(libsFuncs.map(x=>x.lib)).map(l=>"'"+l+"'").join(',')
        return [
            `jbCreatePlugins(jb, ${JSON.stringify(plugins)})`,
            topLevelCode,libsCode,compsCode,
            `jb.initializeTypeRules([${libs}])`,
            `await jb.initializeLibs([${libs}])`,
            'jb.utils.resolveLoadedProfiles()'
        ].join(';\n')
    },
    compToStr(cmpId) {
        //const comp = jb.comps[cmpId]
        //const compWithCTData = { ...jb.comps[cmpId], $location : comp.$location, $plugin: comp.$plugin, $fileDsl: comp.$fileDsl, $dsl: comp.$dsl }
        const content = JSON.stringify(jb.comps[cmpId],
            (k,v) => typeof v === 'function' ? '@@FUNC'+v.toString()+'FUNC@@' : v,2)
                .replace(/"@@FUNC([^@]+)FUNC@@"/g, (_,str) => str.replace(/\\\\n/g,'@@__N').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\t/g,'')
                    .replace(/@@__N/g,'\\\\n').replace(/\\\\/g,'\\') )
        return `jb.component('${cmpId.split('>').pop()}', ${content})`
    },
    async bringMissingCode(obj) {
        const missing = getMissingProfiles(obj)
        if (jb.path(obj,'probe'))
            missing.push('data<>probe.runCircuit')
        if (missing.length) 
            jb.log('treeshake bring missing code',{obj, missing})
        return Promise.resolve(jb.treeShake.getCodeFromRemote(missing))

        function getMissingProfiles(obj) {
            if (obj && typeof obj == 'object') 
                return jb.treeShake.dependentOnObj(obj,true)
            else if (typeof obj == 'function') 
                return jb.treeShake.dependentOnFunc(obj,true)
            return []
        }
    },
    missing(id) {
        return !(jb.comps[id] || id[0] == '#' && jb.path(jb, id.slice(1)))
    },
    async getCodeFromRemote(_ids) {
        const ids = _ids.filter(id => jb.treeShake.missing(id))
        if (!ids.length) return
        const vars = { ids: ids.join(','), existing: jb.treeShake.existing().join(',') }
        if (jb.treeShake.serverUrl) {
            const url = `${jbTreeShakeServerUrl}/jb-${ids[0]}-x.js?ids=${vars.ids}&existing=${vars.existing}`.replace(/#/g,'-')
            console.log(`treeShake: ${url}`)
            jb.log('treeshake getCode',{url,ids})
            return await jb['treeShake'].getJSFromUrl(url)
        }

        const stripedCode = {
            $: 'runCtx', path: '', vars,
            profile: {$: 'data<>treeShake.getCode'}
        }
        jb.log('treeshake request code from remote',{ids, stripedCode})
        jb.treeShake.loadingCode[vars.ids] = true
        if (!jb.treeShake.codeServerJbm && jb.jbm.codeServerUri)
            jb.treeShake.codeServerJbm = await ctx.run({$: 'jbm<jbm>byUri', uri: jb.jbm.codeServerUri})

        if (!jb.treeShake.codeServerJbm)
            jb.logError(`treeShake - missing codeServer jbm at ${jb.uri}`,{ids})
        return jb.treeShake.codeServerJbm && jb.treeShake.codeServerJbm['remoteExec'](stripedCode)
            .then(async code=> {
                jb.log('treeshake code arrived from remote',{ids, stripedCode, length: code.length, url: `${jb.uri}-${ids[0]}-x.js`, lines: 1+(code.match(/\n/g) || []).length })
                try {
                    jb.treeShake.totalCodeSize = (jb.treeShake.totalCodeSize || 0) + code.length
                    await eval(`(async function(jb) {${code}})(jb)\n//# sourceURL=${jb.uri}-${ids[0]}-x.js` )
                } catch(error) {
                    jb.log('treeshake eval error from remote',{error, ids, stripedCode})
                } finally {
                    delete jb.treeShake.loadingCode[vars.ids]
                }
            })
    },
    clientCode() {
        jb.treeShake._clientCode = jb.treeShake._clientCode || jb.treeShake.code(jb.treeShake.treeShake(jb.treeShake.clientComps,{}))
        return jb.treeShake._clientCode
    },
    treeShakeFrontendFeatures(paths) { // treeshake the code of the FRONTEND features without the backend part
        const _paths = paths.filter(path=>! jb.treeShake.existingFEPaths[path]) // performance - avoid tree shake if paths were processed before 
        if (!_paths.length) return []
        paths.forEach(path=>jb.treeShake.existingFEPaths[path] = true)
        return jb.utils.unique(jb.treeShake.treeShake(_paths,jb.treeShake.existing()).map(path=>path.split('~')[0]).filter(id=>jb.treeShake.missing(id)))
    }
})

component('treeShake.getCode', {
    type: 'data',
  impl: ({vars}) => {
        const treeShake = jb.treeShake.treeShake(vars.ids.split(','),jb.objFromEntries(vars.existing.split(',').map(x=>[x,true])))
        jb.log('treeshake treeshake',{...vars, treeShake})
        return jb.treeShake.code(treeShake)
    }
})

// code loader client

component('treeShake.getCodeFromRemote', {
    type: 'data',
    moreTypes: 'action<>',
  params: [
    {id: 'ids'}
  ],
  impl: async (ctx,ids) => ids && jb.treeShake.getCodeFromRemote(ids.split(','))
})

// jb.component('treeShake.settreeShakeJbm', {
//     params: [
//         {id: 'treeShakeUri' }
//     ],
//     impl: (ctx, uri) => jb.treeShake.codeServerJbm = ctx.run({$: 'byUri(', uri}),
//     require: {$ : 'byUri('}
// })
});

jbLoadPackedFile({lineInPackage:4227, jb, noProxies: false, path: '/plugins/tgp/formatter/pretty-print.js',fileDsl: '', pluginId: 'tgp-formatter' }, 
            function({jb,require,prettyPrint,component,extension,using,dsl,pluginDsl}) {
component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'singleLine', as: 'boolean', type: 'boolean', byName: true},
    {id: 'noMacros', as: 'boolean', type: 'boolean'},
    {id: 'type', as: 'string'}
  ],
  impl: (ctx,profile) => jb.utils.prettyPrint(jb.val(profile),{ ...ctx.params })
})

extension('utils', 'prettyPrint', {
  initExtension() {
    return {
      emptyLineWithSpaces: Array.from(new Array(200)).map(_=>' ').join(''),
    }
  },
  prettyPrintComp(compId,comp,settings={}) {
    if (comp) {
      return `${jb.utils.compHeader(compId)}${jb.utils.prettyPrint(comp,{ initialPath: compId, ...settings })})`
    }
  },
  
  prettyPrint(val,settings = {}) {
    if (val == null) return ''
    return jb.utils.prettyPrintWithPositions(val,settings).text;
  },
  
  compHeader(compId) {
    return `component('${compId.split('>').pop()}', `
  },

  prettyPrintWithPositions(val,{colWidth=100,tabSize=2,initialPath='',noMacros,singleLine, depth, tgpModel, type} = {}) {
    const props = {}
    const startOffset = val.$comp ? jb.utils.compHeader(val.$$).length : 0

    if (!val || typeof val !== 'object')
      return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }
    if (type)
      val.$type = type
    if (val.$unresolved)
      val.$comp ? jb.utils.resolveComp(val,{tgpModel}) : jb.utils.resolveProfile(val,{tgpModel, expectedType: type})

    // first phase - fill the props[path] dictionary with shortest lengths. also composite with innerVals, primitives with tokens(token,action)
    calcValueProps(val,initialPath) 
    // second phase - build list of tokens
    const tokens = calcTokens(initialPath, { depth: depth || 1, useSingleLine: singleLine })
    const res = aggregateTokens(tokens)
    return res

    function aggregateTokens(tokens) {
      const actionMap = []
      let pos = startOffset
      const text = tokens.reduce((acc,{action, token}) => {
        action && actionMap.push({from: pos, to: pos+token.length ,action})
        pos = pos+ token.length
        return acc + token
      }, '')
      return { text, actionMap, tokens, startOffset}
    }

    function calcTokens(path, { depth = 1, useSingleLine }) {
      if (depth > 100) throw `prettyprint structure too deep ${path}`

      const tokens = props[path].token != null ? [props[path]] : props[path].tokens
      if (props[path].indentWithParent && tokens)  { // used by asIs - indent all token lines after the the first line
        const splitWithLines = tokens.flatMap(x => x.token.split('\n').map((line,i)=>({...x, token: line, startWithNewLine: i !=0 })))
        if (splitWithLines.length == tokens.length) 
          return tokens.map(x=>({...x, path}))
        const lastLine = splitWithLines.length - splitWithLines.slice(0).reverse().findIndex(x=>x.startWithNewLine) -1
        splitWithLines[lastLine].lastLine = true

        const fullIndent = '\n' + jb.utils.emptyLineWithSpaces.slice(0,depth*tabSize)
        const lastIndent = '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth-1)*tabSize)
        return splitWithLines.map((x,i) => ({...x,path,
          token: (x.lastLine ? lastIndent : x.startWithNewLine ? fullIndent : '') + x.token
        }))
      }
      if (tokens)
        return tokens

      const { open, close, isArray, len, singleParamAsArray, primitiveArray, longInnerValInArray, singleFunc, nameValuePattern, token, mixed } = props[path]
      
      const paramProp = path.match(/~params~[0-9]+$/)
      const singleLine = paramProp || useSingleLine || singleFunc || nameValuePattern || primitiveArray || (len < colWidth && !multiLine())
      const separatorWS = primitiveArray ? '' : singleLine ? ' ' : newLine()

      if (!mixed) {
        const innerVals = props[path].innerVals || []
        const vals = innerVals.reduce((acc,{innerPath}, index) => {
          const fullInnerPath = [path,innerPath].join('~')
          const fixedPropName = props[fullInnerPath].fixedPropName
          const propName = isArray ? [] : [{ token: fixedPropName || (fixPropName(innerPath) + ': ')}]
          const separator = index === innerVals.length-1 ? [] : [{token: ',' + separatorWS, action: `insertPT!${fullInnerPath}`}]
          return [
            ...acc,
            ...propName,
            ...calcTokens(fullInnerPath, { depth: singleLine ? depth : depth +1, singleLine}),
            ...separator
          ]
        }, [])

        return [
          ...jb.asArray(open).map(x=>({...x, path, action: `propInfo!${path}`})),
          {token: newLine(), action: `prependPT!${path}`},
          ...vals,
          {token:'', action: `end!${path}`},
          {token: newLine(-1), action: `appendPT!${path}`},
          ...jb.asArray(close).map(x=>({...x, path, action: `appendPT!${path}`})),
        ]
      }

      return calcMixedTokens()

      function newLine(offset = 0) {
        return singleLine ? '' : '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth+offset)*tabSize)
      }

      function multiLine() {
        const paramsParent = path.match(/~params$/)
        //const manyVals = innerVals.length > 4 && !isArray
        const top = !path.match(/~/g) && !noMacros
        const _longInnerValInArray = !singleParamAsArray && longInnerValInArray
        return paramsParent || top || _longInnerValInArray
      }

      function fixPropName(prop) {
        if (prop == '$vars') return 'vars'
        return prop.match(/^[$a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
      }

      function calcMixedTokens() {
        const { lenOfValues, macro, argsByValue, propsByName, nameValueFold, singleArgAsArray, singleInArray, singleVal, hasParamAsArray } = props[path]
        const mixedFold = nameValueFold || singleVal || !singleLine && lenOfValues && lenOfValues < colWidth
        const valueSeparatorWS = (singleLine || mixedFold) ? primitiveArray ? '' : ' ' : newLine()

        const _argsByValue = argsByValue.reduce((acc,{innerPath, posInArray, isLast}, index) => {
          const fullInnerPath = [path,innerPath].join('~')
          const paramAsArrayPath = [path,hasParamAsArray].join('~')
          const separatorAction = hasParamAsArray && posInArray == null ? `prependPT!${paramAsArrayPath}` 
            : hasParamAsArray && isLast ? `appendPT!${paramAsArrayPath}`
            : hasParamAsArray ? `insertPT!${fullInnerPath}`
            : `addProp!${path}`
          const separator = { token: ',' + valueSeparatorWS, action: separatorAction }
          return [
            ...acc,
            ...calcTokens(fullInnerPath, { depth: (singleLine || mixedFold) ? depth : depth +1, singleLine }),
            ...(index !== argsByValue.length-1 ? [separator] : [])
          ]
        }, [])
        const _propsByName = propsByName.reduce((acc,{innerPath}, index) => {
          const fullInnerPath = [path,innerPath].join('~')
          const fixedPropName = props[fullInnerPath].fixedPropName
          const separator = index != propsByName.length-1 ? [{token: ',' + separatorWS, action: `addProp!${path}`}] : []
          return [
            ...acc,
            {token: fixedPropName || (fixPropName(innerPath) + ': '), action: `propInfo!${fullInnerPath}`},
            ...calcTokens(fullInnerPath, { depth: singleLine ? depth : depth +1, singleLine}),
            ...separator
          ]
        }, [])

        const nameValueSectionsSeparator = {token: ',' + valueSeparatorWS, action: hasParamAsArray ? `appendPT!${path}~${hasParamAsArray}` : `addProp!${path}` }
        const propsByNameSection = propsByName.length ? [
          ...(argsByValue.length ? [nameValueSectionsSeparator] : []),
          {token: '{'+ (newLine() || ' '), action: `addProp!${path}`},
          ..._propsByName,
          {token: (newLine(-1) || ' ') + '}', action: `addProp!${path}`}
        ] : []

        const singleArgAsArrayPath = singleArgAsArray ? `${path}~${singleArgAsArray}` : path
        const actionForFirstArgByValue = !singleArgAsArray || singleLine ? `addProp!${path}` : `prependPT!${singleArgAsArrayPath}`
        const firstInArray = path.match(/~0$/)
        const parentPath = path.split('~').slice(0,-1).join('~')
        return [
            {token: '', action: `begin!${path}`},
            {token: '', action: `beginToken!${path}`},
            {token: macro + '(', action: singleInArray ? `prependPT!${path}` : firstInArray ? `prependPT!${parentPath}` : `setPT!${path}`},
            {token: '', action: `endToken!${path}`},
            {token: '', action: `edit!${path}`},
            {token: '', action: `addProp!${path}`},
            ...(argsByValue.length && !mixedFold ? [{token: newLine(), action: actionForFirstArgByValue}] : []),
            ..._argsByValue,
            ...propsByNameSection,
            {token: argsByValue.length && !mixedFold ? newLine(-1) : '', 
              action: hasParamAsArray && propsByName.length == 0 ? `appendPT!${path}~${hasParamAsArray}` : ``},
            {token: ')', action: `addProp!${path}`},
            {token: '', action: `end!${path}`}
          ]
      }
    }

    function calcProfileProps(profile, path, settings = {}) {
      const {forceByName, parentParam, posInArray} = settings
      if (noMacros)
        return asIsProps(profile,path)
      if (profile.$ == 'asIs') {
        jb.utils.resolveProfile(profile)
        const content = jb.utils.prettyPrint(profile.$asIs,{noMacros: true})
        const tokens = [ 
          {token: 'asIs(', action: `begin!${path}`}, {token: '', action: `edit!${path}`},
          {token: content, action: `asIs!${path}`}, {token: ')', action: `end!${path}`}]
        return props[path] = {tokens, len: content.length + 6, indentWithParent: true }
      }
      if (profile.$comp) {
        const cleaned = {...profile }
        if (profile.params)
          cleaned.params = JSON.parse(JSON.stringify(profile.params))
        Object.keys(cleaned).forEach(k=> (k == '$$' || k.match(/^\$.+/)) && delete cleaned[k])
        ;(cleaned.params||[]).forEach(p => delete p.$type)
        return asIsProps(cleaned,path)
      }
      if (!profile.$$)
        return asIsProps(profile,path)
      const comp = tgpModel ? tgpModel.comps[profile.$$] : jb.comps[profile.$$]
      const id = profile.$$.split('>').pop()                
      const macro = jb.macro.titleToId(id)

      const params = (comp.params || []).slice(0)
      const param0 = params[0] || {}
      const param1 = params[1] || {}
      let firstParamAsArray = (param0.type||'').indexOf('[]') != -1 && !param0.byName && param0.id
      let secondParamAsArray = param1.secondParamAsArray && param1.id
      let hasParamAsArray = firstParamAsArray || secondParamAsArray

      let paramsByValue = param0.byName ? [] : params.slice(0,2)
      let paramsByName = param0.byName ? params.slice(0) 
        : firstParamAsArray ? params.slice(1) 
        : params.slice(2)
      if (param1.byName && paramsByValue.length)
        paramsByName.unshift(paramsByValue.pop())
      if (comp.macroByValue) {
        paramsByValue = params
        paramsByName = []
      }
      if (profile[param0.id] === undefined || profile.$vars && !hasParamAsArray) {
        paramsByValue = []
        paramsByName = params.slice(0)
      }
      if (forceByName) {
        hasParamAsArray = secondParamAsArray = firstParamAsArray = false
        paramsByValue = []
        paramsByName = params.slice(0)
      }

      const varArgs = (profile.$vars || []).map(({name, val, async},i) => ({innerPath: `$vars~${i}`, val: {$$: 'var<>Var', name, val,async, ...calcArrayPos(i,profile.$vars) }}))
      const varsByValue = hasParamAsArray ? varArgs : []
      const varsByName = hasParamAsArray ? [] : ['$vars']
      const systemProps = [...varsByName, ...jb.macro.systemProps].flatMap(p=>profile[p] ? [{innerPath: p, val: profile[p]}] : [])

      const propsByName = systemProps.concat(paramsByName.map(param=>({innerPath: param.id, val: profile[param.id], newLinesInCode: param.newLinesInCode }))).filter(({val})=>val !== undefined)
      const propsByValue = paramsByValue.map(param=>({innerPath: param.id, val: profile[param.id], newLinesInCode: param.newLinesInCode})).filter(({val})=>val !== undefined)
      const firstParamVal = profile[param0.id]
      const secondParamVal = jb.asArray(profile[param1.id])
      const singleFirstParamAsArray = firstParamAsArray && !Array.isArray(firstParamVal) && firstParamVal != null

      const argsOfSingleFirstParam = [{innerPath: param0.id, val: firstParamVal}]
      const argsOfParamAsArray = singleFirstParamAsArray ? argsOfSingleFirstParam
        : firstParamAsArray && firstParamVal ? firstParamVal.map((val,i) => ({innerPath: param0.id + '~' + i, val, ...calcArrayPos(i,firstParamVal)})) 
        : secondParamAsArray ? secondParamVal.map((val,i) => ({innerPath: param1.id + '~' + i, val, ...calcArrayPos(i,secondParamVal)}))
        : []

      const varsLength = varsByValue.length ? calcArrayProps(varsByValue.map(x=>x.val),`${path}~$vars`).len : 0
      const paramsAsArrayLength = singleFirstParamAsArray ? calcValueProps(firstParamVal,`${path}~${param0.id}`, {parentParam: param0}).len
        : firstParamAsArray ? calcArrayProps(argsOfParamAsArray.map(x=>x.val),`${path}~${param0.id}`).len 
        : secondParamAsArray ? calcValueProps(firstParamVal,`${path}~${param0.id}`, {parentParam: param0}).len
            + calcArrayProps(argsOfParamAsArray.map(x=>x.val),`${path}~${param1.id}`).len 
        : 0
      const restPropsByValueLength = hasParamAsArray ? 0 :
        propsByValue.reduce((len,elem) => len + calcValueProps(elem.val,`${path}~${elem.innerPath}`,{newLinesInCode: elem.newLinesInCode}).len, 0) + sepLen(propsByValue)
      const propsByNameLength = propsByName.reduce((len,elem) => len + calcValueProps(elem.val,`${path}~${elem.innerPath}`,
        {newLinesInCode: elem.newLinesInCode}).len + elem.innerPath.length+2, 0) + sepLen(propsByName) + (propsByName.length ? 4 : 0)
      const argsByValue = [...varsByValue, ...(secondParamAsArray ? argsOfSingleFirstParam : []), ...(hasParamAsArray ? argsOfParamAsArray: propsByValue)]
      const lenOfValues = varsLength + paramsAsArrayLength + restPropsByValueLength
      const singleArgAsArray = propsByName.length == 0 && firstParamAsArray
      const argsAsArrayOnly = propsByName.length == 0 && hasParamAsArray
      const singleProp = propsByName.length == 0 && propsByValue.length == 1

      const valuePair = propsByName.length == 0 && !varArgs.length && !systemProps.length && propsByValue.length == 2 
        && props[`${path}~${propsByValue[0].innerPath}`].len < colWidth/2
      const nameValuePattern = valuePair && (typeof propsByValue[1].val == 'function' || lenOfValues < colWidth *1.2)
      const nameValueFold = valuePair && !nameValuePattern && propsByValue[1].val && propsByValue[1].val.$ 
        && props[`${path}~${propsByValue[1].innerPath}`].len >= colWidth
      if (lenOfValues >= colWidth && !argsAsArrayOnly && !nameValuePattern &&!nameValueFold && !singleProp)
        return calcProfileProps(profile, path, {...settings, forceByName: true})

      const len = macro.length + 2 + lenOfValues + propsByNameLength + (lenOfValues && propsByNameLength ? 2 : 0)
      const singleFunc =  propsByName.length == 0 && !varArgs.length && !systemProps.length && argsByValue.length == 1 && typeof argsByValue[0].val == 'function'
      const singleVal =  propsByName.length == 0 && !varArgs.length && !systemProps.length && argsByValue.length == 1
      const primitiveArray =  propsByName.length == 0 && !varArgs.length && firstParamAsArray && 
        argsByValue.reduce((acc,item)=> acc && jb.utils.isPrimitiveValue(item.val), true)
      const singleInArray = (jb.path(parentParam,'type') || '').indexOf('[]') != -1 && !path.match(/[0-9]$/)
      return props[path] = { len, macro, posInArray, argsByValue, propsByName, nameValuePattern, nameValueFold, singleVal, singleFunc, primitiveArray, singleInArray, singleArgAsArray, hasParamAsArray, lenOfValues, mixed: true}
    }

    function calcArrayPos(index,array) {
      return { posInArray: index, isLast: index == array.length -1 }
    }
    function sepLen(array) {
      return Math.max(0,array.length-1)*2
    }

    function asIsProps(profile,path) {
      const defaultImpl = (profile.impl && typeof profile.impl == 'function' && profile.impl.toString() == '({params}) => params')
      const objProps = Object.keys(profile).filter(x=>x!= 'impl' || !defaultImpl).filter(p=>!p.startsWith('$symbol'))
      if (objProps.indexOf('$') > 0) { // make the $ first
        objProps.splice(objProps.indexOf('$'),1);
        objProps.unshift('$');
      }
      const len = objProps.reduce((len,key) => len 
        + calcValueProps(profile[key],`${path}~${key}`).len + key.length + 3,2,{asIs: true})
      const innerVals = objProps.map(prop=>({innerPath: prop}))
      return openCloseProps(path, {token:'{'},{ token:'}'}, { len, simpleObj: true, innerVals})
    }

    function calcArrayProps(array, path) {
      const primitiveArray = array.reduce((acc,item)=> acc && jb.utils.isPrimitiveValue(item), true)
      let longInnerValInArray = false
//      const len = Array.from(array.keys()).map(x=>array[x]).reduce((len,val,i) => {
      const _arr = Object.values(array) 
      const len = _arr.reduce((len,val,i) => {
        const innerLen = calcValueProps(val,`${path}~${i}`, calcArrayPos(i,_arr)).len
        longInnerValInArray = longInnerValInArray || innerLen > 20
        return len + innerLen + 2 
      }, 2)
      return {len, longInnerValInArray, primitiveArray}
    }

    function calcValueProps(val,path,settings) {
      const posInArray = jb.path(settings,'posInArray')
      const parentPath = path.split('~').slice(0,-1).join('~')
      if (Array.isArray(val)) 
        return openCloseProps(path, 
          [{token:'[', action: `addProp!${parentPath}`}, {token:'', action: `begin!${path}`}], 
          [{token:'', action: `end!${path}`}, {token:']', action: `appendPT!${path}`}]
          , {...calcArrayProps(val, path), isArray: true, innerVals: Array.from(val.keys()).map((innerPath,i)=>({innerPath, ...calcArrayPos(i,val)})) }
        )
        
      if (val === null) return tokenProps('null', path)
      if (val == globalThis) return tokenProps('err', path)
      if (val === undefined) return tokenProps('undefined', path)

      if (typeof val === 'object') return calcProfileProps(val, path,settings)
      if (typeof val === 'function' && val[jb.macro.isMacro]) return '' //calcObjProps(val(), path)
      if (typeof val === 'function') return funcProps(val, path)
  
      const putNewLinesInString = typeof val === 'string' && val.match(/\n/) && jb.path(settings,'newLinesInCode')
      if (typeof val === 'string' && val.indexOf("'") == -1 && !putNewLinesInString)
        return stringValProps(JSON.stringify(val).slice(1,-1).replace(/\\"/g,'"'), "'", path)
      else if (typeof val === 'string')
        return stringValProps(val.replace(/`/g,'\\`').replace(/\$\{/g, '\\${'), "`", path, {putNewLinesInString})
      else if (typeof val === 'boolean')
        return tokenProps(val ? 'true' : 'false',path)
      else if (typeof val === 'number')
        return tokenProps('' + val,path)
      else
        return tokenProps(JSON.stringify(val) || 'undefined', path) // primitives or symbol      
    }

    function openCloseProps(path, open,close, _props) {
      return props[path] = {open,close, ..._props}
    }
    function stringValProps(_str, delim, path, {putNewLinesInString} = {}) {
      const str = putNewLinesInString ? _str : _str.replace(/\n/g,'\\n')

      const parentPath = path.split('~').slice(0,-1).join('~')
      const listBegin = [ {token: '', action: `begin!${path}`}, {token: delim, action: `addProp!${parentPath}`}, {token: '', action: `edit!${path}`} ]
      const listEnd = str.length == 0 ? [ {token: delim, action: `setPT!${path}`}]
        : [ {token: str.slice(0,1), action: `setPT!${path}`}, {token: str.slice(1) + delim, action: `insideText!${path}`}]
      const tokens = [ 
        {token: '', action: `beginToken!${path}`}, 
        ...listBegin, ...listEnd, 
        {token: '', action: `endToken!${path}`},
        {token: '', action: `end!${path}`}
      ]
      return props[path] = {tokens, len: str.length + 2}
    }    
    function tokenProps(str, path) {
      const tokens = [ 
        {token: '', action: `beginToken!${path}`},
        {token: '', action: `begin!${path}`}, 
        {token: '', action: `edit!${path}`},
        {token: str.slice(0,1), action: `setPT!${path}`}, {token: str.slice(1), action: `insideToken!${path}`},
        {token: '', action: `endToken!${path}`},
        {token: '', action: `end!${path}`}
      ]
      return props[path] = {tokens, len: str.length }
    }
    function funcProps(func,path) {
      let asStr = func.toString().trim().replace(/^'([a-zA-Z_\-0-9]+)'/,'$1')
      if (func.fixedName)
        asStr = asStr.replace(/initExtension[^(]*\(/,`${func.fixedName}(`)
      const asynch = asStr.indexOf('async') == 0 ? 'async ' : ''
      const noPrefix = asStr.slice(asynch.length)
      const funcName = func.fixedName || func.name
      const header = noPrefix.indexOf(`${funcName}(`) == 0 ? funcName : noPrefix.indexOf(`function ${funcName}(`) == 0 ? `function ${funcName}` : ''
      const fixedPropName = header ? `${asynch}${header}` : ''
      const text = (fixedPropName ? '' : asynch) + asStr.slice(header.length+asynch.length)
      return props[path] = { token: text, fixedPropName, len: text.length, action: `function!${path}` }
    }
  }
})

});

jbLoadPackedFile({lineInPackage:4633, jb, noProxies: false, path: '/plugins/watchable/watchable.js',fileDsl: '', pluginId: 'watchable' }, 
            function({jb,require,runTransaction,component,extension,using,dsl,pluginDsl}) {
// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

extension('watchable', 'main', {
  $requireFuncs: '#watchable.resourcesRef,#db.isWatchable,#watchable.isWatchable',

  initExtension() {
    jb.watchable.jbId = Symbol("jbId") // used in constructor
    jb.watchable.initResourcesRef()
    return {isProxy: Symbol.for("isProxy"), originalVal: Symbol.for("originalVal"), targetVal: Symbol.for("targetVal") }
  },
  initResourcesRef() {
    jb.watchable.resourcesRef.id = 'resources'
    jb.db.watchableHandlers.push(new jb.watchable.WatchableValueByRef(jb.watchable.resourcesRef))
    jb.db.isWatchableFunc[0] = jb.watchable.isWatchable
  },
  WatchableValueByRef: class WatchableValueByRef {
    constructor(resources) {
      this.resources = resources
      this.objToPath = []
      this.idCounter = 1
      this.opCounter = 1
      this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])]
      this.resourceChange = jb.callbag.subject()
      this.observables = []
      this.primitiveArraysDeltas = {}

      const resourcesObj = resources()
      resourcesObj[jb.watchable.jbId] = this.idCounter++
      this.objToPath[resourcesObj[jb.watchable.jbId]] = []
      this.propagateResourceChangeToObservables()
    }
    doOp(ref,opOnRef,srcCtx) {
      try {
        const opVal = opOnRef.$merge || opOnRef.$push || opOnRef.$splice || opOnRef.$set
        if (!this.isRef(ref))
          ref = this.asRef(ref);

        const path = this.removeLinksFromPath(this.pathOfRef(ref)), op = {}, oldVal = this.valOfPath(path);
        if (!path || ref.$jb_val) return;
        if (opOnRef.$set !== undefined && opOnRef.$set === oldVal) return;
        if (opOnRef.$push) opOnRef.$push = jb.asArray(opOnRef.$push)
        this.addJbId(path) // hash ancestors with jbId because the objects will be re-generated by redux
        jb.path(op,path,opOnRef) // create op as nested object
        const insertedIndex = jb.path(opOnRef.$splice,[0,2]) && jb.path(opOnRef.$splice,[0,0]) || opOnRef.$push && opVal.length
        const insertedPath = insertedIndex != null && path.concat(insertedIndex)
        const opEvent = {before: this.resources(), op: opOnRef, path, insertedPath, ref, srcCtx, oldVal, opVal, 
            timeStamp: new Date().getTime(), opCounter: this.opCounter++ }
        this.resources(jb.immutable.update(this.resources(),op))
        opEvent.after = this.resources() 
        const newVal = (opVal != null && opVal[jb.watchable.isProxy]) ? opVal : this.valOfPath(path);
        if (opOnRef.$push) {
          opOnRef.$push.forEach((toAdd,i)=>
            this.addObjToMap(toAdd,[...path,oldVal.length+i]))
          newVal[jb.watchable.jbId] = oldVal[jb.watchable.jbId]
          //opEvent.path.push(oldVal.length)
          opEvent.ref = this.refOfPath(opEvent.path)
        } else if (opOnRef.$set === null && typeof oldVal === 'object') { // delete object should return the path that was deleted
          this.removeObjFromMap(oldVal)
          this.addObjToMap(newVal,path)
          opEvent.ref.$jb_path = () => path
        } else if (opOnRef.$splice) {
          opOnRef.$splice.forEach(ar=> {
            this.fixSplicedPaths(path,ar)
            oldVal.slice(ar[0],ar[0]+ar[1]).forEach(toRemove=>this.removeObjFromMap(toRemove))
            jb.asArray(ar[2]).forEach(toAdd=>this.addObjToMap(toAdd,path.concat(newVal.indexOf(toAdd))))
          })
        } else {
            this.removeObjFromMap(oldVal)
            this.addObjToMap(newVal,path)
        }
        if (opOnRef.$splice) {
          this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] = this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] || []
          this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]].push(opOnRef.$splice)
        }
        opEvent.newVal = newVal
        jb.log('watchable notify doOp',{opEvent,ref,opOnRef,srcCtx})
        if (this.transactionEventsLog)
          this.transactionEventsLog.push(opEvent)
        else
          this.resourceChange.next(opEvent)
        return opEvent
      } catch(e) {
        jb.logException(e,'doOp',{srcCtx,ref,opOnRef,srcCtx})
      }
    }
    makeWatchable(resName) {
      if (!resName) return
      const resource = this.resources()[resName]
      if (!resource)
        return jb.logError(`makeWatchable - can not find ${resName} in resources`,{})
      if (!this.objToPath[resource[jb.watchable.jbId]]) {
        jb.log('make watchable',{resName})
        this.addObjToMap(resource,[resName])
      }
    }
    addJbId(path) {
      for(let i=0;i<path.length;i++) {
        const innerPath = path.slice(0,i+1)
        const val = this.valOfPath(innerPath,true)
        if (val && typeof val === 'object' && !val[jb.watchable.jbId]) {
            val[jb.watchable.jbId] = this.idCounter++
            this.addObjToMap(val,innerPath)
        }
      }
    }
    addObjToMap(top,path) {
      if (!top || top[jb.watchable.isProxy] || top[jb.db.passiveSym] || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
      if (!top[jb.watchable.jbId])
          top[jb.watchable.jbId] = this.idCounter++
      this.objToPath[top[jb.watchable.jbId]] = path

      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0)
          .forEach(key => this.addObjToMap(top[key],[...path,key]))
    }
    removeObjFromMap(top,isInner) {
      if (!top || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
//      this.objToPath.delete(top)
      if (top[jb.watchable.jbId] && isInner)
          this.objToPath[top[jb.watchable.jbId]] = null
      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key],true))
    }
    fixSplicedPaths(path,spliceOp) {
      const propDepth = path.length
      Array.from(this.objToPath.keys())
        .filter(k=>startsWithPath(this.objToPath[k]))
  //      .filter(k=>! spliceOp.reduce((res,ar) => res || jb.asArray(ar[2]).indexOf(k) != -1, false)) // do not touch the moved elem itslef
        .forEach(k=>{
          const newPath = this.objToPath[k]
          newPath[propDepth] = fixIndexProp(+newPath[propDepth])
          if (newPath[propDepth] >= 0)
            this.objToPath[k] = newPath
        })

      function startsWithPath(toCompare) {
        if (!toCompare || toCompare.length <= propDepth) return
        for(let i=0;i<propDepth;i++)
          if (toCompare[i] != path[i]) return
        return true
      }
      function fixIndexProp(oldIndex) {
        return oldIndex + (oldIndex < spliceOp[0] ? 0 : jb.asArray(spliceOp[2]).length - spliceOp[1])
        //return oldIndex + spliceOp.reduce((delta,ar) => delta + (oldIndex < ar[0]) ? 0 : jb.asArray(ar[2]).length - ar[1],0)
      }
    }
    pathOfRef(ref) {
      if (ref.$jb_path)
        return ref.$jb_path()
      const path = this.isRef(ref) && this.objToPath[ref.$jb_obj[jb.watchable.jbId]]
      if (path && ref.$jb_childProp !== undefined) {
          this.refreshPrimitiveArrayRef(ref)
          return [...path, ref.$jb_childProp]
      }
      return path
    }
    urlOfRef(ref) {
      const path = this.pathOfRef(ref)
      this.addJbId(path)
      const byId = [ref.$jb_obj[jb.watchable.jbId],ref.$jb_childProp].filter(x=>x != null).map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      const byPath = path.map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      return `${this.resources.id}://${byId};${byPath}`
    }
    refOfUrl(url) {
      const path = url.split(';')[0].split('~')
      return { handler: this, $jb_obj: {[jb.watchable.jbId]: +path[0] }, ...path[1] ? {$jb_childProp: path[1]} : {} }
    }
    asRef(obj, silent) {
      if (this.isRef(obj))
        return obj
      if (!obj || typeof obj !== 'object') return obj;
      const actualObj = obj[jb.watchable.isProxy] ? obj[jb.watchable.targetVal] : obj
      const path = this.objToPath[actualObj[jb.watchable.jbId]]
      if (path)
          return { $jb_obj: this.valOfPath(path), handler: this, path: function() { return this.handler.pathOfRef(this)} }
      if (!silent)
        jb.logError('asRef can not make a watchable ref of obj',{obj})
      return null;
    }
    valOfPath(path) {
      return path.reduce((o,p)=>this.noProxy(o && o[p]),this.resources())
    }
    noProxy(val) {
      return (val && val[jb.watchable.isProxy] && val[jb.watchable.originalVal]) || val
    }
    hasLinksInPath(path) {
      let val = this.resources()
      for(let i=0;i<path.length;i++) {
        if (val && val[jb.watchable.isProxy])
          return true
        val = val && val[path[i]]
      }
    }
    removeLinksFromPath(path) {
      if (!Array.isArray(path)) return
      if (!this.hasLinksInPath(path))
        return path
      return path.reduce(({val,path} ,p) => {
        const proxy = (val && val[jb.watchable.isProxy])
        const inner =  proxy ? val[jb.watchable.originalVal] : val
        const newPath = proxy ? this.objToPath[inner[jb.watchable.jbId]] : path
        return { val: inner && inner[p], path: [newPath,p].join('~') }
      }, {val: this.resources(), path: ''}).path
    }
    refOfPath(path) {
      const val = this.valOfPath(path);
      if (!val || typeof val !== 'object' && path.length > 0) {
        const parent = this.asRef(this.valOfPath(path.slice(0,-1)), true);
        if (path.length == 1)
          return {$jb_obj: this.resources(), $jb_childProp: path[0], handler: this, $jb_path: () => path }
        return this.objectProperty(parent,path.slice(-1)[0])
      }
      return this.asRef(val)
    }
    asStr(ref) { // for logs
      return this.pathOfRef(ref).join('~')
    }
    isValid(ref) {
      return this.isRef(ref) && this.pathOfRef(ref)
    }
    val(ref) {
      if (ref == null) return ref;
      if (ref.$jb_val) return ref.$jb_val();

      if (!ref.$jb_obj) return ref;
      if (ref.handler != this) {
        if (typeof ref.handler.val != 'function') debugger
        return ref.handler.val(ref)
      }
      this.refreshPrimitiveArrayRef(ref)
      const path = this.pathOfRef(ref);
      if (!path) {
        debugger
        this.pathOfRef(ref)
      }
      return this.valOfPath(path)
    }
    watchable(val) {
      return this.resources() === val || val && typeof val == 'object' && this.objToPath[val[jb.watchable.jbId]]
    }
    isRef(ref) {
      return ref && ref.$jb_obj && this.watchable(ref.$jb_obj);
    }
    objectProperty(obj,prop,ctx) {
      if (!obj)
        return jb.logError('watchable objectProperty: null obj',{obj,prop,ctx})
      if (obj && obj[prop] && this.watchable(obj[prop]) && !obj[prop][jb.watchable.isProxy])
        return this.asRef(obj[prop])
      const ref = this.asRef(obj)
      if (ref && ref.$jb_obj) {
        const ret = {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
        if (this.isPrimitiveArray(ref.$jb_obj)) {
          ret.$jb_delta_version = (this.primitiveArraysDeltas[ref.$jb_obj[jb.watchable.jbId]] || []).length
          ret.$jb_childProp = +prop
        }
        return ret
      } else {
        return obj[prop]; // not reffable
      }
    }
    createSecondaryLink(val) {
      if (val && typeof val === 'object' && !val[jb.watchable.isProxy]) {
        const ref = this.asRef(val,true);
        if (ref && ref.$jb_obj)
          return new Proxy(val, {
            get: (o,p) => (p === jb.watchable.targetVal) ? o : (p === jb.watchable.isProxy) ? true : (p === jb.watchable.originalVal ? val : (jb.val(this.asRef(val)))[p]),
            set: (o,p,v) => o[p] = v
          })
      }
      return val
    }
    // operation API    
    writeValue(ref,value,srcCtx) {
      if (!ref || !this.isRef(ref) || !this.pathOfRef(ref))
        return jb.logError('writeValue: err in ref', {srcCtx, ref, value})

      jb.log('watchable writeValue',{ref,value,ref,srcCtx})
      if (ref.$jb_val)
        return ref.$jb_val(value)
      if (this.val(ref) === value) return
      return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
    }
    splice(ref,args,srcCtx) {
      return this.doOp(ref,{$splice: args },srcCtx)
    }
    push(ref,value,srcCtx) {
      return this.doOp(ref,{$push: this.createSecondaryLink(value)},srcCtx)
    }
    merge(ref,value,srcCtx) {
      return this.doOp(ref,{$merge: this.createSecondaryLink(value)},srcCtx)
    }    
    move(fromRef,toRef,srcCtx) {
      const fromPath = this.pathOfRef(fromRef), toPath = this.pathOfRef(toRef);
      const sameArray = fromPath.slice(0,-1).join('~') == toPath.slice(0,-1).join('~');
      const fromIndex = Number(fromPath.slice(-1));
      let toIndex = Number(toPath.slice(-1));
      const fromArray = this.refOfPath(fromPath.slice(0,-1)),toArray = this.refOfPath(toPath.slice(0,-1));
      if (isNaN(fromIndex) || isNaN(toIndex))
          return jb.logError('move: not array element',{srcCtx,fromRef,toRef})

      var valToMove = jb.val(fromRef);
      if (sameArray) {
          //if (fromIndex < toIndex) toIndex--; // the deletion changes the index
          const spliceParam = [[fromIndex,1],[toIndex,0,valToMove]]
          spliceParam.fromIndex = fromIndex
          spliceParam.toIndex = toIndex
          return this.doOp(fromArray,{$splice: spliceParam },srcCtx)
      }
      this.startTransaction()
      const spliceParam = [[fromIndex,1]]
      spliceParam.fromIndex = fromIndex
      spliceParam.toIndex = toIndex
      spliceParam.toArray = toArray
      this.doOp(fromArray,{$splice: spliceParam },srcCtx),
      this.doOp(toArray,{$splice: [[toIndex,0,valToMove]] },srcCtx),
      this.endTransaction()
    }
    isPrimitiveArray(arr) {
      return Array.isArray(arr) && arr.some(x=> x != null && typeof x != 'object')
    }
    refreshPrimitiveArrayRef(ref) {
      if (!this.isPrimitiveArray(ref.$jb_obj)) return
      const arrayId = ref.$jb_obj[jb.watchable.jbId]
      const deltas = this.primitiveArraysDeltas[arrayId] || []
      deltas.slice(ref.$jb_delta_version).forEach(group => {
          if (group.fromIndex != undefined && group.fromIndex === ref.$jb_childProp) { // move
            ref.$jb_childProp = group.toIndex
            if (group.toArray)
              ref.$jb_obj = group.toArray.$jb_obj
            return
          }
          group.forEach(([from,toDelete,toAdd]) => { // splice
            if (ref.$jb_childProp == -1) return
            if (ref.$jb_childProp >= from && ref.$jb_childProp < from+toDelete) {
              ref.$jb_childProp = -1
            } else if (ref.$jb_childProp >= from) {
              ref.$jb_childProp = ref.$jb_childProp - toDelete + (toAdd != null) ? 1 : 0
            }
          })
      })
      ref.$jb_delta_version = deltas.length
    }

    startTransaction() {
      this.transactionEventsLog = []
    }
    endTransaction(doNotNotify) {
      if (!doNotNotify)
        (this.transactionEventsLog || []).forEach(opEvent=>this.resourceChange.next(opEvent))
      delete this.transactionEventsLog
    }

    getOrCreateObservable({ref,srcCtx,includeChildren,cmp}) {
        const subject = jb.callbag.subject()
        const ctx = cmp && cmp.ctx || srcCtx || { path: ''}
        const key = this.pathOfRef(ref).join('~') + ' : ' + ctx.path
        //const recycleCounter = cmp && cmp.getAttribute && +(cmp.getAttribute('recycleCounter') || 0)
        const obs = { key, ref,srcCtx,includeChildren, cmp, subject, ctx }

        this.observables.push(obs)
        this.observables.sort((e1,e2) => jb.utils.comparePaths(e1.ctx.path, e2.ctx.path))
        jb.log('register watchable observable',obs)
        return subject
    }
    frame() {
      return this.resources.frame || jb.frame
    }
    propagateResourceChangeToObservables() {
      jb.utils.subscribe(this.resourceChange, e=>{
        const observablesToUpdate = this.observables.slice(0) // this.observables array may change in the notification process !!
        const changed_path = this.removeLinksFromPath(this.pathOfRef(e.ref))
        if (changed_path) observablesToUpdate.forEach(obs=> {
          if (jb.path(obs,'cmp._destroyed')) {
            if (this.observables.indexOf(obs) != -1) {
              obs.subject.complete()
              this.observables.splice(this.observables.indexOf(obs), 1);
              jb.log('watchable observable removed',{obs})
            }
          } else {
            this.notifyOneObserver(e,obs,changed_path)
          }
        })
      })
    }

    notifyOneObserver(e,obs,changed_path) {
        let obsPath = jb.db.refHandler(obs.ref).pathOfRef(obs.ref)
        obsPath = obsPath && this.removeLinksFromPath(obsPath)
        if (!obsPath)
          return jb.logError('watchable observable ref path is empty',{obs,e})
        const diff = jb.utils.comparePaths(changed_path, obsPath)
        const isChildOfChange = diff == 1
        const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
        const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
        if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
            jb.log('notify watchable observable',{srcCtx: e.srcCtx,obs,e})
            obs.subject.next(e)
        }
    }

    dispose() {
      this.resourceChange.complete()
    }
  },

  resourcesRef: val => typeof val == 'undefined' ? jb.db.resources : (jb.db.resources = val),
  isWatchable: ref => jb.db.refHandler(ref) instanceof jb.watchable.WatchableValueByRef || ref && ref.$jb_observable,
  refObservable(ref,{cmp,includeChildren,srcCtx} = {}) { // cmp._destroyed is checked before notification
      if (ref && ref.$jb_observable)
        return ref.$jb_observable(cmp)
      if (!jb.watchable.isWatchable(ref)) {
        jb.logError('ref is not watchable: ', {ref, cmp,srcCtx})
        return jb.callbag.fromIter([])
      }
      return jb.db.refHandler(ref).getOrCreateObservable({ref,cmp,includeChildren,srcCtx})
  }
})

extension('immutable', {
  initExtension() {
    jb.immutable._commands = jb.immutable.commands()
  },
  update(object, spec) {
    var nextObject = object
    Object.keys(spec).forEach(key => {
      if (jb.immutable._commands[key]) {
        var objectWasNextObject = object === nextObject
        nextObject = jb.immutable._commands[key](spec[key], nextObject, object)
        if (objectWasNextObject && nextObject === object)
          nextObject = object
      } else {
        var nextValueForKey = jb.immutable.update(object[key], spec[key])
        var nextObjectValue = nextObject[key]
        if (nextValueForKey !== nextObjectValue || typeof nextValueForKey === 'undefined' && !object.hasOwnProperty(key)) {
          if (nextObject === object)
            nextObject = jb.immutable.copy(object)
          nextObject[key] = nextValueForKey;
        }
      }
    })
    return nextObject
  },
  copy(obj) {
    const res = Array.isArray(obj) ? obj.slice(0) : (obj && typeof obj === 'object') ? Object.assign({}, obj) : obj
    res[jb.watchable.jbId] = obj[jb.watchable.jbId]
    return res
  },
  commands: () => ({ 
    $push: (value, nextObject) => value.length ? nextObject.concat(value) : nextObject,
    $splice(value, nextObject, originalObject) {
      value.forEach(args => {
        if (nextObject === originalObject && args.length) nextObject = jb.immutable.copy(originalObject)
        nextObject.splice(...args)
      })
      return nextObject
    },
    $set: x => x,
    $merge(value, nextObject, originalObject) {
      Object.keys(value).forEach(key => {
        if (value[key] !== nextObject[key]) {
          if (nextObject === originalObject) nextObject = jb.immutable.copy(originalObject);
          nextObject[key] = value[key]
        }
      })
      return nextObject
    }
  })
})

component('runTransaction', {
  type: 'action',
  params: [
    {id: 'action', type: 'action', ignore: true, composite: true, mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'},
    {id: 'handler', defaultValue: () => jb.db.watchableHandlers.find(x=>x.resources.id == 'resources')}
  ],
  impl: (ctx,noNotifications,handler) => {
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions'] || []).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    handler && handler.startTransaction()
    return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runTransaction',{ctx}))
      .then(() => handler && handler.endTransaction(noNotifications))
	}
})

});

jbLoadPackedFile({lineInPackage:5126, jb, noProxies: false, path: '/plugins/rx/rx.js',fileDsl: 'rx', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,min,sum,slice,sort,first,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,unknownCmp,runCtx,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
dsl('rx')

using('watchable,common')

// --- pipes
component('rxPipe', {
  type: 'data<>',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true},
    {id: 'elems', type: 'operator', dynamic: true}
  ],
  impl: (ctx,source,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx))].filter(x=>x),ctx))
})

component('rxFlow', {
  type: 'action<>',
  macroByValue: true,
  description: 'pipeline of reactive observables with source, operators, and sink',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true, mandatory: true},
    {id: 'elems', type: 'operator', dynamic: true, mandatory: true},
    {id: 'sink', type: 'sink', dynamic: true, mandatory: true},
  ],
  impl: (ctx,source,elems,sink) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx)), sink(ctx)].filter(x=>x),ctx))
})

component('sourcePipe', {
  type: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'source', type: 'source', dynamic: true, composite: true},
    {id: 'elems', type: 'operator', dynamic: true}
  ],
  impl: (ctx,source,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers([source(ctx), ...jb.asArray(elems(ctx))].filter(x=>x),ctx))
})

component('data', {
  type: 'source',
  params: [
    {id: 'Data', mandatory: true}
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

component('watchableData', {
  type: 'source',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', byName: true, description: 'watch childern change as well'}
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x=>ctx.dataObj(x))(jb.watchable.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

component('callbag', {
  type: 'source',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'}
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})

component('callback', {
  type: 'source',
  params: [
    {id: 'registerFunc', mandatory: true, description: 'receive callback function, returns handler'},
    {id: 'unRegisterFunc', mandatory: true, description: 'receive handler from register'}
  ],
  impl: (ctx,registerFunc,unRegisterFunc) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromCallbackFunc(registerFunc,unRegisterFunc))
})

component('animationFrame', {
  type: 'source',
  impl: callback(()=>jb.frame.requestAnimationFrame, () => jb.frame.cancelAnimationFrame)
})

component('event', {
  type: 'source',
  macroByValue: true,
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll,resize'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document},
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'}
  ],
  impl: (ctx,event,elem,options) => elem && jb.callbag.map(sourceEvent=>ctx.setVars({sourceEvent, elem}).dataObj(sourceEvent))(jb.callbag.fromEvent(event,elem,options))
})

component('any', {
  type: 'source',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'}
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

component('promise', {
  type: 'source',
  params: [
    {id: 'promise', mandatory: true}
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

component('promises', {
  type: 'source',
  params: [
    {id: 'promises', type: 'data[]', mandatory: true}
  ],
  impl: (ctx,promises) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promises))
})

component('interval', {
  type: 'source',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

component('merge', {
  type: 'source',
  description: 'merge callbags sources (or any)',
  params: [
    {id: 'sources', type: 'source[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

component('mergeConcat', {
  type: 'source',
  description: 'merge sources while keeping the order of sources',
  params: [
    {id: 'sources', type: 'source[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: sourcePipe(
    data(ctx => ctx.cmpCtx.params.sources.profile),
    concatMap(ctx => ctx.run(ctx.data))
  )
})

// ******** operators *****

component('elems', {
  type: 'operator',
  description: 'composite operator, inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'operator[]', as: 'array', mandatory: true, composite: true}
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

component('startWith', {
  type: 'operator',
  description: 'startWith callbags sources (or any)',
  params: [
    {id: 'source', type: 'source', as: 'array'}
  ],
  impl: (ctx,source) => jb.callbag.startWith([source])
})

component('Var', {
  type: 'operator', 
  description: 'define an immutable variable that can be used later in the pipe. recalculated for each input',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true}
  ],
  impl: If('%$name%', ({},{},{name,value}) => source => (start, sink) => {
        if (start != 0) return
        return source(0, function Var(t, d) {
            sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: value(d)}} : d)
        })
    })
})

component('resource', {
  type: 'operator',
  description: 'define a static mutable variable that can be used later in the pipe. unlike Var it is calculated once',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, mandatory: true}
  ],
  impl: If('%$name%', ({},{},{name,value}) => source => (start, sink) => {
    if (start != 0) return
    const val = value()
    return source(0, function Var(t, d) {
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: val}} : d)
    })
  })
})

component('reduce', {
  type: 'operator',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc', byName: true},
    {id: 'initialValue', dynamic: true, description: 'receives first value as input', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated value use %$acc%,%% %$prev%', mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor', type: 'boolean'}
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, prev, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, prev, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
        prev = d.data
      } else {
        sink(t, d)
      }
    })
  }
})

component('count', {
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: reduce({ varName: '%$varName%', initialValue: 0, value: (ctx,{},{varName}) => ctx.vars[varName]+1 })
})

component('joinIntoVariable', {
  description: 'join vals into a variable',
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: reduce({
    varName: '%$varName%',
    initialValue: '%%',
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

component('join', {
  description: 'wait for all, and join vals',
  type: 'operator',
  params: [
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: elems(toArray(), map(join('%$separator%')))
})

component('max', {
  type: 'operator',
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%'}
  ],
  impl: reduce({
    varName: '%$varName%',
    initialValue: -Infinity,
    value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})

component('Do', {
  type: 'operator',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

component('doPromise', {
  type: 'operator',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

component('map', {
  type: 'operator',
  params: [
    {id: 'func', type: 'data<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ({data: func(ctx2), vars: ctx2.vars || {}}),ctx))
})

component('mapPromise', {
  type: 'operator',
  params: [
    {id: 'func', type: 'data<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ({vars: ctx2.vars || {}, data}))
    .catch(err => ({vars: {...ctx2.vars, err }, data: err})) )
})

component('filter', {
  type: 'operator',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.utils.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

component('flatMap', {
  type: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'sourceGenerator', type: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'}
  ],
  impl: (ctx,sourceGenerator) => source => (start, sink) => {
    if (start !== 0) return
    let sourceTalkback, innerSources = [], sourceEnded

    source(0, function flatMap(t, d) {
      if (t === 0) 
        sourceTalkback = d
      if (t === 1 && d != null)
        createInnerSrc(d)
      if (t === 2) {
          sourceEnded = true
          stopOrContinue(d)
      }
    })

    sink(0, function flatMap(t,d) {
      if (t == 1 && d == null || t == 2) {
        sourceTalkback && sourceTalkback(t,d)
        innerSources.forEach(src=>src.talkback && src.talkback(t,d))
      }
    })

    function createInnerSrc(d) {
      const newSrc = sourceGenerator(ctx.setData(d.data).setVars(d.vars))
      innerSources.push(newSrc)
      newSrc(0, function flatMap(t,d) {
        if (t == 0) newSrc.talkback = d
        if (t == 1) sink(t,d)
        if (t != 2 && newSrc.talkback) newSrc.talkback(1)
        if (t == 2) {
          innerSources.splice(innerSources.indexOf(newSrc),1)
          stopOrContinue(d)
        }
      })
    }

    function stopOrContinue(d) {
      if (sourceEnded && innerSources.length == 0)
        sink(2,d)
    }
  }
})

component('flatMapArrays', {
  type: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'}
  ],
  impl: flatMap(data('%$func()%'))
})

component('concatMap', {
  type: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines original %$input% with the inner func result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

component('distinctUntilChanged', {
  type: 'operator',
  description: 'filters adjacent items in stream',
  category: 'filter',
  params: [
    {id: 'equalsFunc', dynamic: true, mandatory: true, defaultValue: ({data},{prev}) => data === prev, description: 'e.g. %% == %$prev%'}
  ],
  impl: (ctx,equalsFunc) => jb.callbag.distinctUntilChanged((prev,cur) => equalsFunc(ctx.setData(cur.data).setVar('prev',prev.data)), ctx)
})

component('distinct', {
  type: 'operator',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('unique', {
  type: 'operator',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('catchError', {
  type: 'operator',
  category: 'error',
  impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

component('timeoutLimit', {
  type: 'operator',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic'},
    {id: 'error', dynamic: true, defaultValue: 'timeout'}
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

component('throwError', {
  type: 'operator',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

component('debounceTime', {
  type: 'operator',
  description: 'waits for a cooldown period, them emits the last arrived',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

component('throttleTime', {
  type: 'operator',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
})

component('delay', {
  type: 'operator',
  params: [
    {id: 'time', dynamic: true, description: 'can be dynamic'}
  ],
  impl: (ctx,time) => jb.callbag.delay(time)
})

component('replay', {
  type: 'operator',
  description: 'stores messages and replay them for later subscription',
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'}
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

component('takeUntil', {
  type: 'operator',
  description: 'closes the stream when events comes from notifier',
  category: 'terminate',
  params: [
    {id: 'notifier', type: 'source', description: 'can be also promise or any other'}
  ],
  impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

component('take', {
  type: 'operator',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count())
})

component('takeWhile', {
  type: 'operator',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'passtLastEvent', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,whileCondition,passtLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passtLastEvent)
})

component('toArray', {
  type: 'operator',
  description: 'wait for all to end, and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
})

component('last', {
  description: 'wait for all to end, and returns the last item',
  type: 'operator',
  category: 'filter',
  impl: () => jb.callbag.last()
})

component('skip', {
  type: 'operator',
  category: 'filter',
  params: [
    {id: 'count', as: 'number', dynamic: true}
  ],
  impl: (ctx,count) => jb.callbag.skip(count())
})

component('log', {
  type: 'operator',
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string', dynamic: true, description: 'log names'},
    {id: 'extra', as: 'single', dynamic: true, description: 'object. more properties to log'}
  ],
  impl: Do((ctx,vars,{name,extra}) => jb.log(name(ctx),{data: ctx.data,vars,...extra(ctx), ctx: ctx.cmpCtx}))
})

component('consoleLog', {
  type: 'operator',
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: Do((x,{},{name}) => console.log(name,x))
})

component('sniffer', {
  type: 'operator',
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
})

// component('Switch', {
//   type: 'operator',
//   description: 'like if, separate between cases',
//   params: [
//     {id: 'case', type: 'case[]', mandatory: true}
//   ]
// })

// component('sourceCase', {
//   type: 'case',
//   params: [
//     {id: 'condition', type: 'boolean', dynamic: true, mandatory: true},
//     {id: 'source', type: 'source', mandatory: true},
//   ]
// })

// component('operatorCase', {
//   type: 'case',
//   params: [
//     {id: 'condition', type: 'boolean', dynamic: true, mandatory: true},
//     {id: 'elems', type: 'operator', mandatory: true},
//   ]
// })

// ** sink

component('subscribe', {
  type: 'sink',
  description: 'forEach action for all items',
  params: [
    {id: 'next', type: 'action<>', dynamic: true, mandatory: true},
    {id: 'error', type: 'action<>', dynamic: true},
    {id: 'complete', type: 'action<>', dynamic: true}
  ],
  impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

component('action', {
  type: 'sink',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

component('writeValue', {
  type: 'sink',
  params: [
    {id: 'Data', as: 'ref', dynamic: true, mandatory: true}
  ],
  impl: action(writeValue('%$Data()%', '%%'))
})

// // ********** subject 
component('rxSubject', {
  type: 'data<>',
  description: 'callbag "variable" that you can write or listen to. use with Var',
  category: 'variable',
  params: [
    {id: 'id', as: 'string', description: 'can be used for logging'},
    {id: 'replay', as: 'boolean', description: 'keep pushed items for late subscription', type: 'boolean'},
    {id: 'itemsToKeep', as: 'number', description: 'relevant for replay, empty for unlimited'}
  ],
  impl: (ctx,id, replay,itemsToKeep) => {
      const trigger = jb.callbag.subject(id)
      const source = replay ? jb.callbag.replay(itemsToKeep)(trigger): trigger
      source.ctx = trigger.ctx = ctx
      return { trigger, source } 
    }
})

component('subjectNext', {
  type: 'sink',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

component('subject', {
  type: 'source',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subj) => subj.source
})

// component('action.subjectNext', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true},
//     {id: 'Data', dynamic: true, defaultValue: '%%'}
//   ],
//   impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
// })

// component('action.subjectComplete', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true}
//   ],
//   impl: (ctx,subject) => subject.trigger.complete()
// })

// component('action.subjectError', {
//   type: 'action<>',
//   params: [
//     {id: 'subject', mandatory: true},
//     {id: 'error', dynamic: true, mandatory: true}
//   ],
//   impl: (ctx,subject,error) => subject.trigger.error(error())
// })

// // ********** queue 
component('rxQueue', {
    type: 'data<>',
    description: 'message queue',
    category: 'variable',
    params: [
      {id: 'items', as: 'array'}
    ],
    impl: (ctx,items) => ({ items: items.slice(0), subject: jb.callbag.subject(), mkmk: 5 })
  })
  
  component('queue', {
    type: 'source',
    params: [
      {id: 'queue', mandatory: true}
    ],
    impl: merge(data('%$queue/items%'), '%$queue/subject%')
  })
  
  // component('action.addToQueue', {
  //   type: 'action',
  //   params: [
  //     {id: 'queue', mandatory: true},
  //     {id: 'item', dynamic: true, defaultValue: '%%'}
  //   ],
  //   impl: (ctx,queue,item) => {
  //     const toAdd = item(ctx)
  //     queue.items.push(toAdd)
  //     queue.subject.next(ctx.dataObj(toAdd)) 
  //   }
  // })
  
  // component('action.removeFromQueue', {
  //   type: 'action',
  //   params: [
  //     {id: 'queue', mandatory: true},
  //     {id: 'item', dynamic: true, defaultValue: '%%'}
  //   ],
  //   impl: (ctx,queue,item) => {
  // 		const index = queue.items.indexOf(item(ctx))
  // 		if (index != -1)
  //       queue.items.splice(index,1)
  //   }
  // })

});

jbLoadPackedFile({lineInPackage:5846, jb, noProxies: false, path: '/plugins/rx/jb-callbag.js',fileDsl: '', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,min,sum,slice,sort,first,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,unknownCmp,runCtx,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
extension('callbag', {
  fromIter: iter => (start, sink) => {
      if (start !== 0) return
      const iterator =
          typeof Symbol !== 'undefined' && iter[Symbol.iterator]
          ? iter[Symbol.iterator]()
          : iter
      let inloop = false
      let got1 = false
      let res
      function loop() {
          inloop = true
          while (got1) {
              got1 = false
              res = iterator.next()
              if (res.done) sink(2)
              else sink(1, res.value)
          }
          inloop = false
      }
      sink(0, function fromIter(t, d) {
          if (t === 1) {
              got1 = true
              if (!inloop && !(res && res.done)) loop()
          }
      })
  },
  pipe(..._cbs) {
    const cbs = _cbs.filter(x=>x)
    if (!cbs[0]) return
    let res = cbs[0]
    for (let i = 1, n = cbs.length; i < n; i++) {
      const newRes = cbs[i](res)
      if (!newRes) debugger
      newRes.ctx = cbs[i].ctx
      Object.defineProperty(newRes, 'name',{value: 'register ' + cbs[i].name})

      res = newRes
    }
    return res
  },
  Do: f => source => (start, sink) => {
      if (start !== 0) return
      source(0, function Do(t, d) {
          if (t == 1) f(d)
          sink(t, d)
      })
  },
  filter: condition => source => (start, sink) => {
      if (start !== 0) return
      let talkback
      source(0, function filter(t, d) {
        if (t === 0) {
          talkback = d
          sink(t, d)
        } else if (t === 1) {
          if (condition(d)) sink(t, d)
          else talkback(1)
        }
        else sink(t, d)
      })
  },
  map: f => source => (start, sink) => {
      if (start !== 0) return
      source(0, function map(t, d) {
        if (t == 1 && d != null) 
          sink(1,f(d))
        else
          sink(t, d)
      })
  },
  throwError: (condition,err) => source => (start, sink) => {
    let talkback
    if (start !== 0) return
    source(0, function throwError(t, d) {
      if (t === 0) talkback = d
      if (t == 1 && condition(d)) {
        talkback && talkback(2)
        sink(2,err)
      } else {
        sink(t, d)
      }
    })
  },
  distinct: keyFunc => source => (start, sink) => {
    if (start !== 0) return
    let prev = {}, talkback
    source(0, function distinct(t,d) {
        if (t === 0) talkback = d
        if (t == 1) {
          const key = keyFunc(d)
          if (typeof key == 'string') {
            if (prev[key]) {
                talkback && talkback(1)
                return
            }
            prev[key] = true
          }
        }
        sink(t, d)
    })
  },  
  distinctUntilChanged: (compare,ctx) => source => (start, sink) => {
      compare = compare || ((prev, cur) => prev === cur)
      if (start !== 0) return
      let inited = false, prev, talkback
      source(0, function distinctUntilChanged(t,d) {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t == 1) {
            if (inited && compare(prev, d)) {
                talkback(1)
                ctx && ctx.dataObj('same as prev',null,d)
                return
            }
            inited = true
            prev = d
            ctx && ctx.dataObj(d,null,d)
            sink(1, d)
          } else {
              sink(t, d)
              return
          }
      })
  },  
  takeUntil(notifier) {
      if (jb.utils.isPromise(notifier))
          notifier = jb.callbag.fromPromise(notifier)
      const UNIQUE = {}
      return source => (start, sink) => {
          if (start !== 0) return
          let sourceTalkback, notifierTalkback, inited = false, done = UNIQUE

          source(0, function takeUntil(t, d) {
              if (t === 0) {
                  sourceTalkback = d

                  notifier(0, function takeUntilNotifier(t, d) {
                      if (t === 0) {
                          notifierTalkback = d
                          notifierTalkback(1)
                          return
                      }
                      if (t === 1) {
                          done = void 0
                          notifierTalkback(2)
                          sourceTalkback(2)
                          if (inited) sink(2)
                          return
                      }
                      if (t === 2) {
                          //notifierTalkback = null
                          done = d
                          if (d != null) {
                              sourceTalkback(2)
                              if (inited) sink(t, d)
                          }
                      }
                  })
                  inited = true

                  sink(0, function takeUntilSink(t, d) {
                      if (done !== UNIQUE) return
                      if (t === 2 && notifierTalkback) notifierTalkback(2)
                      sourceTalkback(t, d)
                  })

                  if (done !== UNIQUE) sink(2, done)
                  return
              }
              if (t === 2) notifierTalkback(2)
              if (done === UNIQUE) sink(t, d)
          })
      }
  },
  concatMap(_makeSource,combineResults) {
    const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
    if (!combineResults) combineResults = (input, inner) => inner
    return source => (start, sink) => {
        if (start !== 0) return
        let queue = [], activeCb, sourceEnded, allEnded, sourceTalkback, activecbTalkBack, waitingForNext = false
        source(0, function concatMap(t,d) {
          if (t == 0)
            sourceTalkback = d
          else if (t == 1)
            queue.push(d)
          else if (t ==2)
            sourceEnded = true
          tick()
        })
        sink(0, function concatMap(t,d) {
          if (t == 1) {
            waitingForNext = true
            tick()
          } else if (t == 2) {
            allEnded = true
            queue = []
            sourceTalkback && sourceTalkback(2)
          }
        })
        
        function tick() {
          if (allEnded) return
          if (!activeCb && queue.length) {
            const input = queue.shift()
            activeCb = makeSource(input)
            activeCb(0, function concatMap(t,d) {
              if (t == 0) {
                activecbTalkBack = d
                tick()
                //waitingForNext && activecbTalkBack && activecbTalkBack(1)
              } else if (t == 1) {
                waitingForNext = false
                sink(1, combineResults(input,d))
                //activecbTalkBack && activecbTalkBack(1)
              } else if (t == 2 && d) {
                allEnded = true
                queue = []
                sink(2,d)
                sourceTalkback && sourceTalkback(2)
              } else if (t == 2) {
                waitingForNext = true
                activecbTalkBack = activeCb = null
                tick()
              }
            })
          }
          if (sourceEnded && !activeCb && !queue.length) {
            allEnded = true
            sink(2)
          }
          if (waitingForNext) {
            if (activecbTalkBack) activecbTalkBack(1);
            if (!activeCb) sourceTalkback && sourceTalkback(1)
          }
        }
    }
  },
  // concatMap2(_makeSource,combineResults) {
  //   const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
  //   return source => (start, sink) => {
  //       if (start !== 0) return
  //       let queue = []
  //       let innerTalkback, sourceTalkback, sourceEnded
  //       if (!combineResults) combineResults = (input, inner) => inner

  //       const concatMapSink= input => function concatMap(t, d) {
  //         if (t === 0) {
  //           innerTalkback = d
  //           innerTalkback(1)
  //         } else if (t === 1) {
  //           sink(1, combineResults(input,d))
  //           innerTalkback(1)
  //         } else if (t === 2) {
  //           innerTalkback = null
  //           if (queue.length === 0) {
  //             stopOrContinue(d)
  //             return
  //           }
  //           const input = queue.shift()
  //           const src = makeSource(input)
  //           src(0, concatMapSink(input))
  //         }
  //       }

  //       source(0, function concatMap(t, d) {
  //         if (t === 0) {
  //           sourceTalkback = d
  //           sink(0, wrappedSink)
  //           return
  //         } else if (t === 1) {
  //           if (innerTalkback) 
  //             queue.push(d) 
  //           else {
  //             const src = makeSource(d)
  //             src(0, concatMapSink(d))
  //             src(1)
  //           }
  //         } else if (t === 2) {
  //           sourceEnded = true
  //           stopOrContinue(d)
  //         }
  //       })

  //       function wrappedSink(t, d) {
  //         if (t === 2 && innerTalkback) innerTalkback(2, d)
  //         sourceTalkback(t, d)
  //       }
    
  //       function stopOrContinue(d) {
  //         if (d != undefined) {
  //           queue = []
  //           innerTalkback = innerTalkback = null
  //           sink(2, d)
  //           return
  //         }
  //         if (sourceEnded && !innerTalkback && queue.length == 0) {
  //           sink(2, d)
  //           return
  //         }
  //         innerTalkback && innerTalkback(1)
  //       }
  //     }
  // },
  flatMap: (_makeSource, combineResults) => source => (start, sink) => {
      if (start !== 0) return
      const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
      if (!combineResults) combineResults = (input, inner) => inner

      let index = 0
      const talkbacks = {}
      let sourceEnded = false
      let inputSourceTalkback = null

      source(0, function flatMap(t, d) {
        if (t === 0) {
            inputSourceTalkback = d
            sink(0, pullHandle)
        }
        if (t === 1) {
            makeSource(d)(0, makeSink(index++, d))
        }
        if (t === 2) {
            sourceEnded = true
            stopOrContinue(d)
        }
      })

      function makeSink(i, input) { 
        return (t, d) => {
          if (t === 0) {talkbacks[i] = d; talkbacks[i](1)}
          if (t === 1)
            sink(1, d == null ? null : combineResults(input, d))
          if (t === 2) {
              delete talkbacks[i]
              stopOrContinue(d)
          }
      }}

      function stopOrContinue(d) {
        if (sourceEnded && Object.keys(talkbacks).length === 0) 
          sink(2, d)
        else 
          !sourceEnded && inputSourceTalkback && inputSourceTalkback(1)
      }

      function pullHandle(t, d) {
        const currTalkback = Object.values(talkbacks).pop()
        if (t === 1) {
          currTalkback && currTalkback(1)
          if (!sourceEnded) inputSourceTalkback(1)
        }
        if (t === 2) {
          stopOrContinue(d)
        }
      }
  },
  merge(..._sources) {
      const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
      return function merge(start, sink) {
        if (start !== 0) return
        const n = sources.length
        const sourceTalkbacks = new Array(n)
        let startCount = 0
        let endCount = 0
        let ended = false
        const talkback = (t, d) => {
          if (t === 2) ended = true
          for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
        }
        for (let i = 0; i < n; i++) {
          if (ended) return
          sources[i](0, (t, d) => {
            if (t === 0) {
              sourceTalkbacks[i] = d
              sink(0, talkback) // if (++startCount === 1) 
            } else if (t === 2 && d) {
              ended = true
              for (let j = 0; j < n; j++) if (j !== i && sourceTalkbacks[j]) sourceTalkbacks[j](2)
              sink(2, d)
            } else if (t === 2) {
              sourceTalkbacks[i] = void 0
              if (++endCount === n) sink(2)
            } else sink(t, d)
          })
        }
      }
  },
  fork: (...cbs) => source => (start, sink) => {
    if (start != 0) return
    let sinks = []
    let talkback = null

    registerSink(sink)
    jb.callbag.pipe(forkSource, ...cbs)

    source(0, function mainForkSource(t, d) {
      if (t == 0) {
        talkback = d
        talkback(1)
      } else {
        const zinkz = sinks.slice(0)
        for (let i = 0, n = zinkz.length, sink; i < n; i++) {
            sink = zinkz[i]
            if (sinks.indexOf(sink) > -1) sink(t, d)
        }
      }
    })

    function forkSource(start, forkSink) {
      if (start == 0) registerSink(forkSink)
    }

    function registerSink(sink) {
      sinks.push(sink)
      sink(0, function fork(t,d) {
          if (t === 2) {
              const i = sinks.indexOf(sink)
              if (i > -1) sinks.splice(i, 1)
              if (!sinks.length)
                talkback && talkback(2)
          }
          if (t == 1 && !d) // talkback
            talkback && talkback(1)
      })
    }
  },
  race(..._sources) { // take only the first result including errors and complete
    const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
    return function race(start, sink) {
      if (start !== 0) return
      const n = sources.length
      const sourceTalkbacks = new Array(n)
      let ended = false
      const talkback = (t, d) => {
        if (t === 2) ended = true
        for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
      }
      for (let i = 0; i < n; i++) {
        if (ended) return
        sources[i](0, function race(t, d) {
          if (t === 0) {
            sourceTalkbacks[i] = d
            sink(0, talkback)
          } else {
            ended = true
            for (let j = 0; j < n; j++) 
              if (j !== i && sourceTalkbacks[j]) sourceTalkbacks[j](2)
            sink(1,d)
            sink(2)
          }
        })
      }
  }},
  fromEvent: (event, elem, options) => (start, sink) => {
      if (!elem || !elem.addEventListener) return
      if (start !== 0) return
      let disposed = false
      const handler = ev => sink(1, ev)
    
      sink(0, function fromEvent(t, d) {
        if (t !== 2) {
          return
        }
        disposed = true
        if (elem.removeEventListener) elem.removeEventListener(event, handler, options)
        else if (elem.removeListener) elem.removeListener(event, handler, options)
        else throw new Error('cannot remove listener from elem. No method found.')
      })
    
      if (disposed) return
    
      if (elem.addEventListener) elem.addEventListener(event, handler, options)
      else if (elem.addListener) elem.addListener(event, handler, options)
      else throw new Error('cannot add listener to elem. No method found.')
  },
  fromCallbackLoop: register => (start, sink) => {
    if (start !== 0) return
    let sinkDone
    let handler = register(callbackLoop)
    function callbackLoop(d) { 
      if (sinkDone) return
      sink(1,d || 0)
      handler = register(callbackLoop)
    }
  
    sink(0, t => sinkDone = t == 2 )
  },
  fromProducer: producer => (start, sink) => {
    if (start !== 0) return
    if (typeof producer !== 'function') {
      jb.logError('producer must be a function',{producer})
      sink(2,'non function producer')
      return
    }
    let sinkDone
    const cleanFunc = producer(function fromProducer(d) { return !sinkDone && sink(1,d) })
    sink(0, (t,d) => {
      if (!sinkDone) {
        sinkDone = t == 2
        if (sinkDone && typeof cleanFunc === 'function') cleanFunc()
      }
    })
  },
  subject(id) {
      let sinks = []
      function subj(t, d, transactive) {
          if (t === 0) {
              const sink = d
              id && jb.log(`${id} subject sink registered`,{sink})
              sinks.push(sink)
              sink(0, function subject(t,d) {
                  if (t === 2) {
                      const i = sinks.indexOf(sink)
                      if (i > -1) {
                        const sink = sinks.splice(i, 1)
                        id && jb.log(`${id} subject sink unregistered`,{sink})
                      }
                  }
              })
          } else {
            id && t == 1 && jb.log(`${id} subject next`,{d, sinks: sinks.slice(0)})
            id && t == 2 && jb.log(`${id} subject complete`,{d, sinks: sinks.slice(0)})
            sinks.slice(0).forEach(sink=> {
              const td = transactive ? jb.callbag.childTxInData(d,sinks.length) : d
              sinks.indexOf(sink) > -1 && sink(t, td)
            })
          }
      }
      subj.next = (data,transactive) => subj(1,data,transactive)
      subj.complete = () => subj(2)
      subj.error = err => subj(2,err)
      subj.sinks = sinks
      return subj
  },
  replay: keep => source => {
    keep = keep || 0
    let store = [], sinks = [], talkback, done = false
  
    const sliceNum = keep > 0 ? -1 * keep : 0;
  
    source(0, function replay(t, d) {
      if (t == 0) {
        talkback = d
        return
      }
      if (t == 1) {
        store.push(d)
        store = store.slice(sliceNum)
        sinks.forEach(sink => sink(1, d))
      }
      if (t == 2) {
        done = true
        sinks.forEach(sink => sink(2))
        sinks = []
      }
    })

    replay.sinks = sinks
    return replay
  
    function replay(start, sink) {
      if (start !== 0) return
      sinks.push(sink)
      sink(0, function replay(t, d) {
        if (t == 0) return
        if (t == 1) {
          talkback(1)
          return
        }
        if (t == 2)
          sinks = sinks.filter(s => s !== sink)
      })
  
      store.forEach(entry => sink(1, entry))
  
      if (done) sink(2)
    }
  },
  catchError: fn => source => (start, sink) => {
      if (start !== 0) return
      let done
      source(0, function catchError(t, d) {
        if (done) return
        if (t === 2 && d !== undefined) { done= true; sink(1, fn(d)); sink(2) } 
        else sink(t, d) 
      }
    )
  },
  // swallow events. When new event arrives wait for a duration to spit it, if another event arrived when waiting, the original event is 'deleted'
  // 'immediate' means that the first event is spitted immediately
  debounceTime: (duration,immediate = true) => source => (start, sink) => {
      if (start !== 0) return
      let timeout
      source(0, function debounceTime(t, d) {
        let immediateEventSent = false
        if (!timeout && immediate) { sink(t,d); immediateEventSent = true }
        if (timeout) clearTimeout(timeout)
        if (t === 1) timeout = setTimeout(() => { 
          timeout = null; 
          if (!immediateEventSent) sink(1, d)
        }, typeof duration == 'function' ? duration() : duration)
        else sink(t, d)
      })
  },
  throttleTime: (duration,emitLast) => source => (start, sink) => {
    if (start !== 0) return
    let talkbackToSource, sourceTerminated = false, sinkTerminated = false, last, timeout
    sink(0, function throttle(t, d) {
      if (t === 2) sinkTerminated = true
    })
    source(0, function throttle(t, d) {
      if (t === 0) {
        talkbackToSource = d
        talkbackToSource(1)
      } else if (sinkTerminated) {
        return
      } else if (t === 1) {
        if (!timeout) {
          sink(t, d)
          last = null
          timeout = setTimeout(() => {
            timeout = null
            if (!sourceTerminated) talkbackToSource(1)
            if ((emitLast === undefined || emitLast) && last != null)
              sink(t,d)
          }, typeof duration == 'function' ? duration() : duration)
        } else {
          last = d
        }
      } else if (t === 2) {
        sourceTerminated = true
        sink(t, d)
      }
    })
  },      
  take: (max,ctx) => source => (start, sink) => {
      if (start !== 0) return
      let taken = 0, sourceTalkback, end
      function talkback(t, d) {
        if (t === 2) end = true
        sourceTalkback(t, d)
      }
      source(0, function take(t, d) {
        if (t === 0) {
          sourceTalkback = d
          sink(0, talkback)
        } else if (t === 1) {
          if (taken < max) {
            taken++
            sink(t, d)
            ctx && ctx.dataObj(d)
            if (taken === max && !end) {
              end = true
              sourceTalkback(2)
              sink(2)
            }
          }
        } else {
          sink(t, d)
        }
      })
  },
  takeWhile: (predicate,passLastEvent) => source => (start, sink) => {
      if (start !== 0) return
      let talkback
      source(0, function takeWhile(t,d) {
        if (t === 0) talkback = d
        if (t === 1 && !predicate(d)) {
          if (passLastEvent) sink(t,d)
          talkback(2)
          sink(2)
        } else {
          sink(t, d)
        }
      })
  },
  last: () => source => (start, sink) => {
      if (start !== 0) return
      let talkback, lastVal, matched = false
      source(0, function last(t, d) {
        if (t === 0) {
          talkback = d
          sink(t, d)
        } else if (t === 1) {
          lastVal = d
          matched = true
          talkback(1)
        } else if (t === 2) {
          if (matched) sink(1, lastVal)
          sink(2)
        }
      })
  },
  toArray: () => source => (start, sink) => {
    if (start !== 0) return
    let talkback, res = [], ended
    source(0, function toArray(t, d) {
      if (t === 0) {
        talkback = d
        sink(t, (t,d) => {
          if (t == 2) end()
          talkback(t,d)
        })
      } else if (t === 1) {
        res.push(d)
        talkback && talkback(1)
      } else if (t === 2) {
        if (!d) end()
        sink(2,d)
      }
    })
    function end() {
      if (!ended && res.length) sink(1, res)
      ended = true
    }
  },      
  forEach: operation => source => {
    let talkback
    source(0, function forEach(t, d) {
        if (t === 0) talkback = d
        if (t === 1) operation(d)
        if (t === 1 || t === 0) talkback(1)
    })
  },
  subscribe: (listener = {}) => source => {
      if (typeof listener === "function") listener = { next: listener }
      let { next, error, complete } = listener
      let talkback, done
      source(0, function subscribe(t, d) {
        if (t === 0) talkback = d
        if (t === 1 && next) next(d)
        if (t === 1 || t === 0) talkback(1)  // Pull
        if (t === 2) done = true
        if (t === 2 && !d && complete) complete()
        if (t === 2 && !!d && error) error( d )
        if (t === 2 && listener.finally) listener.finally( d )
      })
      return {
        dispose: () => talkback && !done && talkback(2),
        isDone: () => done,
        isActive: () => talkback && !done
      }
  },
  // toPromise: source => {
  //     return new Promise((resolve, reject) => {
  //       jb.callbag.subscribe({
  //         next: resolve,
  //         error: reject,
  //         complete: () => {
  //           const err = new Error('No elements in sequence.')
  //           err.code = 'NO_ELEMENTS'
  //           reject(err)
  //         },
  //       })(jb.callbag.last(source))
  //     })
  // },
  toPromiseArray: source => {
      const res = []
      let talkback
      return new Promise((resolve, reject) => {
              source(0, function toPromiseArray(t, d) {
                  if (t === 0) talkback = d
                  if (t === 1) res.push(d)
                  if (t === 1 || t === 0) talkback && talkback(1)  // Pull
                  if (t === 2 && !d) resolve(res)
                  if (t === 2 && !!d) reject( d )
          })
      })
  },
  // fromPromises: promises => (start, sink) => {
  //   if (start !== 0) return
  //   let endedBySink = false
  //   jb.asArray(promises).reduce( (acc, pr) =>
  //     acc.then(() => !endedBySink && Promise.resolve(pr).then(res => sink(1,res)).catch(err=>sink(2,err)) )
  //   , Promise.resolve()).then(() => !endedBySink && sink(2))

  //   sink(0, function fromPromises(t, d) {
  //       if (t === 2) endedBySink = true
  //   })
  // },
  fromPromise: pr => (start, sink) => {
    let sinkDone
    if (start !== 0) return
    Promise.resolve(pr).then(d =>{ 
      jb.log('callbag promise resolved',{d, sinkDone})
      if (!sinkDone) {
        sink(1,d)
        sink(2) 
      }
    }).catch(err => sink(2,err))

    sink(0, function mapPromiseTB(t,d) {
      jb.log('callbag promise talkback',{t,d})
      if (t == 2) sinkDone = true
    })
  },
  // doPromise: (promiseF,{map} = {}) => source => (start, sink) => {
  //   let talkback, sourceDone, noOfWaitingPromises = 0, sinkDone
  //   source(0, function mapPromise(t,d) {
  //     jb.log('callbag promise from source',{t,d})
  //     if (t== 0)
  //       talkback = d
  //     else if (t == 1 && d != null) {
  //       if (sinkDone) return
  //       noOfWaitingPromises++
  //       try {
  //         Promise.resolve(promiseF(d)).then(res => {
  //           noOfWaitingPromises--
  //           jb.log('callbag promise resolved',{res})
  //           !sinkDone && sink(1, map? res:d)
  //           if (sourceDone && noOfWaitingPromises == 0)
  //             sink(2)
  //         }).catch(handleErr)
  //       } catch (e) {
  //         handleErr(e)
  //       }
  //     }
  //     else if (t==2) {
  //       sourceDone = true
  //       noOfWaitingPromises == 0 && sink(t,d)
  //     }
  //   })
  //   sink(0, function mapPromiseTB(t,d) {
  //     jb.log('callbag promise sink',{t,d})
  //     if (t == 2) sinkDone = true
  //     talkback && talkback(t,d)
  //   })

  //   function handleErr(err) {
  //     noOfWaitingPromises--
  //     jb.log('callbag fromPromise rejected',{err, sinkDone})
  //     if (!sinkDone)
  //       sink(2,err)
  //   }
  // },
  // mapPromise: promiseF => jb.callbag.doPromise(promiseF,{map: true}),
  mapPromise: promiseF => jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d)))),
  doPromise: promiseF => jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d)).then(()=>d))),
  interval: period => (start, sink) => {
    if (start !== 0) return
    let i = 0
    const id = setInterval(function set_interval() {
      sink(1, i++)
    }, period)
    sink(0, t => t === 2 && clearInterval(id))
  },
  startWith: (...xs) => source => (start, sink) => {
      if (start !== 0) return
      let disposed = false
      let inputTalkback
      let trackPull = false
      let lastPull
    
      sink(0, function startWith(t, d) {
        if (trackPull && t === 1) {
          lastPull = [1, d]
        }
    
        if (t === 2) {
          disposed = true
          xs.length = 0
        }
    
        if (!inputTalkback) return
        inputTalkback(t, d)
      })
    
      while (xs.length !== 0) {
        if (xs.length === 1) {
          trackPull = true
        }
        sink(1, xs.shift())
      }
    
      if (disposed) return
    
      source(0, function startWith(t, d) {
        if (t === 0) {
          inputTalkback = d
          trackPull = false
    
          if (lastPull) {
            inputTalkback(...lastPull)
            lastPull = null
          }
          return
        }
        sink(t, d)
      })
  },
  delay: duration => source => (start, sink) => {
      if (start !== 0) return
      let working = false, talkback
      const queue = []
      source(0, function delay(t,d) {
        if (t === 0) talkback = d
        if (t > 0) {
          queue.push({t,d})
          workOnQueue()
        }
      })
      sink(0, function delay(t,d) {
        if (t == 1 && !d && talkback)
          talkback(1)
        if (t == 2) {
          queue.splice(0,queue.length)
          talkback && talkback(t,d)
        }
      })

      function workOnQueue() {
        if (!working && queue.length > 0)
          workOnInput(queue.splice(0,1)[0])
      }

      function workOnInput({t,d}) {
        const id = setTimeout(()=> {
          clearTimeout(id)
          sink(t,d)
          working = false
          workOnQueue()
        }, jb.callbag.valueFromfunctionOrConstant(duration,d))
        working = true
      }
  },
  skip: max => source => (start, sink) => {
      if (start !== 0) return
      let skipped = 0, talkback
      source(0, function skip(t, d) {
        if (t === 0) talkback = d
        if (t === 1 && skipped < max) {
            skipped++
            talkback(1)
            return
        }
        sink(t, d)
      })
  },
  sniffer: (source, snifferSubject) => (start, sink) => {
    if (start !== 0) return
    let talkback
    const talkbackWrapper = (t,d) => { report('talkback',t,d); talkback(t,d) }
    const sniffer = (t,d) => {
      report('out',t,d)
      if (t == 0) {
        talkback = d
        Object.defineProperty(talkbackWrapper, 'name', { value: talkback.name + '-sniffer' })
        sink(0, talkbackWrapper)
        return
      }
      sink(t,d)
    }
    sniffer.ctx = source.ctx    
    Object.defineProperty(sniffer, 'name', { value: source.name + '-sniffer' })
    sniffer.dispose = () => { console.log('dispose', sink,talkback); debugger }

    source(0,sniffer)
    
    function report(dir,t,d) {
      const now = new Date()
      const time = `${now.getSeconds()}:${now.getMilliseconds()}`
      snifferSubject.next({dir, t, d, time})
      if (t == 2)
        snifferSubject.complete && snifferSubject.complete(d)
    }
  },
  timeoutLimit: (timeout,err) => source => (start, sink) => {
    if (start !== 0) return
    let talkback
    let timeoutId = setTimeout(()=> {
      talkback && talkback(2)
      sink(2, typeof err == 'function' ? err() : err || 'timeout')
    }, typeof timeout == 'function' ? timeout() : timeout)

    source(0, function timeoutLimit(t, d) {
      if (t === 2) clearTimeout(timeoutId)
      if (t === 0) talkback = d
      sink(t, d)
    })        
  },
  fromCallBag: source => source,
  fromAny: (source, name, options) => {
      const f = source && 'from' + (jb.utils.isPromise(source) ? 'Promise'
          : source.addEventListener ? 'Event'
          : typeof source[Symbol.iterator] === 'function' ? 'Iter'
          : '')
      if (jb.callbag[f]) 
          return jb.callbag[f](source, name, options)
      else if (jb.callbag.isCallbag(source))
          return source
      else
          return jb.callbag.fromIter([source])
  },
//  isSink: cb => typeof cb == 'function' && cb.toString().match(/source/),
  isCallbag: cb => typeof cb == 'function' && cb.toString().split('=>')[0].split('{')[0].replace(/\s/g,'').match(/start,sink|t,d/),
  isCallbagOperator: cb => typeof cb == 'function' && cb.toString().match(/^\s*source\s*=>/),
  injectSniffers(cbs,ctx) {
    return cbs
    // const _jb = ctx.frame().jb
    // if (!_jb) return cbs
    // return cbs.reduce((acc,cb) => [...acc,cb, ...injectSniffer(cb) ] ,[])

    // function injectSniffer(cb) {
    //   if (!cb.ctx || cb.sniffer || jb.callbag. isSink(cb)) return []
    //   _jb.cbLogByPath =  _jb.cbLogByPath || {}
    //   const log = _jb.cbLogByPath[cb.ctx.path] = { callbagLog: true, result: [] }
    //   const listener = {
    //     next(r) { log.result.push(r) },
    //     complete() { log.complete = true }
    //   }
    //   const res = source => _jb.callbag.sniffer(source, listener)
    //   res.sniffer = true
    //   res.ctx = cb.ctx
    //   Object.defineProperty(res, 'name', { value: 'sniffer' })
    //   return [res]
    // }
  },  
  log: name => jb.callbag.Do(x=>console.log(name,x)),
  jbLog: (name,...params) => jb.callbag.Do(data => jb.log(name,{data,...params})),
  valueFromfunctionOrConstant(val,data) {
    return typeof val == 'function' ? val(val.runCtx && val.runCtx.setData(data)) : val
  },
  childTxInCtx(ctx,noOfChildren) {
    const tx = jb.path(ctx,'vars.tx')
    if (noOfChildren < 2 || !tx) return ctx
    return ctx.setVars({tx: jb.callbag.transaction(tx)})
  },
  childTxInData(data,noOfChildren) {
    const ctx = jb.path(data,'srcCtx')
    const ctxWithRx = ctx && jb.callbag.childTxInCtx(ctx,noOfChildren)
    return (!ctxWithRx || ctxWithRx == ctx) ? data : { ...data, srcCtx: ctxWithRx}
  },
  transaction(parent) { 
    const tx = {
      parent,
      children: [],
      isComplete() { 
        return this.done = this.done || this.children.reduce((acc,t) => acc && t.isDone() , true)
      },
      next(d) { this.cb.next(d) },
      complete() { 
        this.done = true
        this.cb.complete()
      },
      addChild(childTx) {
        this.children.push(childTx)
        childTx.cb(0, function tx(t,d) { 
          if (t == 1) this.cb(1,d)
          if (t == 2) this.isComplete() && this.cb(2)
        })
      },
      cb: jb.callbag.subject()
    }
    parent && parent.addChild(tx)
    return tx
  }
})

});

jbLoadPackedFile({lineInPackage:6910, jb, noProxies: false, path: '/plugins/rx/rx-comps.js',fileDsl: '', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,min,sum,slice,sort,first,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,unknownCmp,runCtx,asIs,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
using('watchable,common')

component('source.data', {
  type: 'rx',
  params: [
    {id: 'Data', mandatory: true}
  ],
  impl: (ctx,data) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromIter(jb.toarray(data)))
})

component('source.watchableData', {
  type: 'rx',
  description: 'wait for data change and returns {op, newVal,oldVal}',
  params: [
    {id: 'ref', as: 'ref'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', byName: true, description: 'watch childern change as well'}
  ],
  impl: (ctx,ref,includeChildren) => jb.callbag.map(x => ctx.dataObj({...x, before: null, after: null}))(jb.watchable.refObservable(ref,{includeChildren, srcCtx: ctx}))
})

component('source.callbag', {
  type: 'rx',
  params: [
    {id: 'callbag', mandatory: true, description: 'callbag source function'}
  ],
  impl: (ctx,callbag) => jb.callbag.map(x=>ctx.dataObj(x))(callbag || jb.callbag.fromIter([]))
})

component('source.callbackLoop', {
  type: 'rx',
  params: [
    {id: 'registerFunc', mandatory: true, description: 'receive callback function. needs to be recalled for next event'},
  ],
  impl: (ctx,registerFunc) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromCallbackLoop(registerFunc))
})

component('source.animationFrame', {
  type: 'rx',
  impl: source.callbackLoop(({},{uiTest})=> (uiTest ? jb.test : jb.frame).requestAnimationFrame || (() => {}))
})

/*
producer interface: obs => {
  bind('myBind', handler)
  return () => unbind('myBind',handler)
  function handler(x) { obs(x) }
}
*/
component('source.producer', {
  type: 'rx',
  params: [
    {id: 'producer', dynamic: true, mandatory: true, description: 'producer function'},
  ],
  impl: (ctx,producer) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromProducer(producer))
})

component('source.event', {
  type: 'rx',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll,resize'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document},
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'},
    {id: 'selector', as: 'string', description: 'optional, including the elem', byName: true}
  ],
  impl: (ctx,event,_elem,options,selector) => {
    const elem = selector ? jb.ui.findIncludeSelf(_elem,selector)[0]: _elem
    return elem && jb.callbag.map(sourceEvent=>ctx.setVars({sourceEvent, elem}).dataObj(sourceEvent))(jb.callbag.fromEvent(event,elem,options))
  }
})

component('source.any', {
  type: 'rx',
  params: [
    {id: 'source', mandatory: true, description: 'the source is detected by its type: promise, iterable, single, callbag element, etc..'}
  ],
  impl: (ctx,source) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromAny(source || []))
})

component('source.promise', {
  type: 'rx',
  params: [
    {id: 'promise', mandatory: true}
  ],
  impl: (ctx,promise) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promise))
})

component('source.interval', {
  type: 'rx',
  params: [
    {id: 'interval', as: 'number', templateValue: '1000', description: 'time in mSec'}
  ],
  impl: (ctx,interval) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.interval(interval))
})

component('rx.pipe', {
  type: 'rx',
  moreTypes: 'data<>,action<>',
  category: 'source',
  description: 'pipeline of reactive observables with source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: (ctx,elems) => 
    jb.callbag.pipe(...jb.callbag.injectSniffers(elems(ctx).filter(x=>x),ctx))
})

component('source.merge', {
  type: 'rx',
  category: 'source',
  description: 'merge callbags sources (or any)',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: (ctx,sources) => jb.callbag.merge(...sources(ctx))
})

component('source.mergeConcat', {
  type: 'rx',
  category: 'source',
  description: 'merge sources while keeping the order of sources',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: [], composite: true}
  ],
  impl: rx.pipe(
    source.data(ctx => ctx.cmpCtx.params.sources.profile),
    rx.concatMap(ctx => ctx.run(ctx.data))
  )
})

// ******** operators *****

component('rx.innerPipe', {
  type: 'rx',
  category: 'operator',
  description: 'composite operator, inner reactive pipeline without source',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []}
  ],
  impl: (ctx,elems) => source => jb.callbag.pipe(source, ...elems)
})

component('rx.fork', {
  type: 'rx',
  category: 'operator',
  description: 'separate operator with same source data',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, templateValue: []}
  ],
  impl: (ctx,elems) => jb.callbag.fork(...elems)
})

component('rx.startWith', {
  type: 'rx',
  category: 'operator',
  description: 'startWith callbags sources (or any)',
  params: [
    {id: 'sources', type: 'rx[]', as: 'array'}
  ],
  impl: (ctx,sources) => jb.callbag.startWith(...sources)
})

component('rx.var', {
  type: 'rx',
  category: 'operator',
  description: 'define an immutable variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, defaultValue: '%%', mandatory: true}
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
      if (start != 0) return 
      return source(0, function Var(t, d) {
        const vars = t == 1 && d && {...d.vars, [name()]: value(d)}
        t == 1 && d && ctx.cmpCtx.dataObj(d.data,vars)
        sink(t, t === 1 ? d && {data: d.data, vars } : d)
      })
    })
})

component('rx.resource', {
  type: 'rx',
  category: 'operator',
  description: 'define a static mutable variable that can be used later in the pipe',
  params: [
    {id: 'name', as: 'string', dynamic: true, mandatory: true, description: 'if empty, does nothing'},
    {id: 'value', dynamic: true, mandatory: true}
  ],
  impl: If('%$name%', (ctx,{},{name,value}) => source => (start, sink) => {
    if (start != 0) return
    let val, calculated
    return source(0, function Var(t, d) {
      val = calculated ? val : value()
      calculated = true
      sink(t, t === 1 ? d && {data: d.data, vars: {...d.vars, [name()]: val}} : d)
    })
  })
})

component('rx.reduce', {
  type: 'rx',
  category: 'operator',
  description: 'incrementally aggregates/accumulates data in a variable, e.g. count, concat, max, etc',
  params: [
    {id: 'varName', as: 'string', mandatory: true, description: 'the result is accumulated in this var', templateValue: 'acc'},
    {id: 'initialValue', dynamic: true, description: 'receives first value as input', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '%%', description: 'the accumulated value use %$acc%,%% %$prev%', mandatory: true},
    {id: 'avoidFirst', as: 'boolean', description: 'used for join with separators, initialValue uses the first value without adding the separtor', type: 'boolean'}
  ],
  impl: (ctx,varName,initialValue,value,avoidFirst) => source => (start, sink) => {
    if (start !== 0) return
    let acc, prev, first = true
    source(0, function reduce(t, d) {
      if (t == 1) {
        if (first) {
          acc = initialValue(d)
          first = false
          if (!avoidFirst)
            acc = value({data: d.data, vars: {...d.vars, [varName]: acc}})
        } else {
          acc = value({data: d.data, vars: {...d.vars, prev, [varName]: acc}})
        }
        sink(t, acc == null ? d : {data: d.data, vars: {...d.vars, [varName]: acc}})
        prev = d.data
      } else {
        sink(t, d)
      }
    })
  }
})

component('rx.count', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'count'}
  ],
  impl: rx.reduce('%$varName%', 0, { value: (ctx,{},{varName}) => ctx.vars[varName]+1 })
})

component('rx.join', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'join'},
    {id: 'separator', as: 'string', defaultValue: ','}
  ],
  impl: rx.reduce('%$varName%', '%%', {
    value: (ctx,{},{varName,separator}) => [ctx.vars[varName],ctx.data].join(separator),
    avoidFirst: true
  })
})

component('rx.max', {
  params: [
    {id: 'varName', as: 'string', mandatory: true, defaultValue: 'max'},
    {id: 'value', dynamic: true, defaultValue: '%%'}
  ],
  impl: rx.reduce('%$varName%', -Infinity, {
    value: (ctx,{},{varName,value}) => Math.max(ctx.vars[varName],value(ctx))
  })
})

component('rx.do', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.Do(ctx2 => action(ctx2))
})

component('rx.doPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.doPromise(ctx2 => action(ctx2))
})

component('rx.map', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ctx.dataObj(func(ctx2), ctx2.vars || {},ctx2.data),ctx))
})

component('rx.mapPromise', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'func', type: 'data', moreTypes: 'action<>', dynamic: true, mandatory: true}
  ],
  impl: (ctx,func) => jb.callbag.mapPromise(ctx2 => Promise.resolve(func(ctx2)).then(data => ctx.dataObj(data, ctx2.vars || {}, ctx2.data))
    .catch(err => ({vars: {...ctx2.vars, err }, data: err})) )
})

component('rx.filter', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'filter', type: 'boolean', dynamic: true, mandatory: true}
  ],
  impl: (ctx,filter) => jb.callbag.filter(jb.utils.addDebugInfo(ctx2 => filter(ctx2),ctx))
})

component('rx.flatMap', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs the callbags or promises',
  params: [
    {id: 'source', type: 'rx', category: 'source', dynamic: true, mandatory: true, description: 'map each input to source callbag'}
  ],
  impl: (ctx,sourceGenerator) => source => (start, sink) => {
    if (start !== 0) return
    let sourceTalkback, innerSources = [], sourceEnded

    source(0, function flatMap(t, d) {
      if (t === 0) 
        sourceTalkback = d
      if (t === 1 && d != null)
        createInnerSrc(d)
      if (t === 2) {
          sourceEnded = true
          stopOrContinue(d)
      }
    })

    sink(0, function flatMap(t,d) {
      if (t == 1 && d == null || t == 2) {
        sourceTalkback && sourceTalkback(t,d)
        innerSources.forEach(src=>src.talkback && src.talkback(t,d))
      }
    })

    function createInnerSrc(d) {
      const newSrc = sourceGenerator(ctx.setData(d.data).setVars(d.vars))
      innerSources.push(newSrc)
      newSrc(0, function flatMap(t,d) {
        if (t == 0) newSrc.talkback = d
        if (t == 1) sink(t,d)
        if (t != 2 && newSrc.talkback) newSrc.talkback(1)
        if (t == 2) {
          innerSources.splice(innerSources.indexOf(newSrc),1)
          stopOrContinue(d)
        }
      })
    }

    function stopOrContinue(d) {
      if (sourceEnded && innerSources.length == 0)
        sink(2,d)
    }
  }
})

component('rx.flatMapArrays', {
  type: 'rx',
  category: 'operator',
  description: 'match inputs to data arrays',
  params: [
    {id: 'func', dynamic: true, defaultValue: '%%', description: 'should return array, items will be passed one by one'}
  ],
  impl: rx.flatMap(source.data(call('func')))
})

component('rx.concatMap', {
  type: 'rx',
  category: 'operator,combine',
  params: [
    {id: 'func', type: 'rx', dynamic: true, mandatory: true, description: 'keeps the order of the results, can return array, promise or callbag'},
    {id: 'combineResultWithInput', dynamic: true, description: 'combines %$input% with the inner result %%'}
  ],
  impl: (ctx,func,combine) => combine.profile ? jb.callbag.concatMap(ctx2 => func(ctx2), (input,{data}) => combine({data,vars: {...input.vars, input: input.data} }))
    : jb.callbag.concatMap(ctx2 => func(ctx2))
})

component('rx.distinctUntilChanged', {
  type: 'rx',
  description: 'filters adjacent items in stream',
  category: 'filter',
  params: [
    {id: 'equalsFunc', dynamic: true, mandatory: true, defaultValue: ({data},{prev}) => data === prev, description: 'e.g. %% == %$prev%'}
  ],
  impl: (ctx,equalsFunc) => jb.callbag.distinctUntilChanged((prev,cur) => equalsFunc(ctx.setData(cur.data).setVar('prev',prev.data)), ctx)
})

component('rx.distinct', {
  type: 'rx',
  description: 'filters unique values',
  category: 'filter',
  params: [
    {id: 'key', as: 'string', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,keyFunc) => jb.callbag.distinct(jb.utils.addDebugInfo(ctx2 => keyFunc(ctx2),ctx))
})

component('rx.catchError', {
  type: 'rx',
  category: 'error',
  impl: ctx => jb.callbag.catchError(err => ctx.dataObj(err))
})

component('rx.timeoutLimit', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'timeout', dynamic: true, defaultValue: '3000', description: 'can be dynamic'},
    {id: 'error', dynamic: true, defaultValue: 'timeout'}
  ],
  impl: (ctx,timeout,error) => jb.callbag.timeoutLimit(timeout,error)
})

component('rx.throwError', {
  type: 'rx',
  category: 'error',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'error', mandatory: true}
  ],
  impl: (ctx,condition,error) => jb.callbag.throwError(ctx2=>condition(ctx2), error)
})

component('rx.debounceTime', {
  type: 'rx',
  description: 'waits for a cooldown period, them emits the last arrived',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'immediate', as: 'boolean', description: 'emits the first event immediately, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,immediate) => jb.callbag.debounceTime(cooldownPeriod,immediate)
})

component('rx.throttleTime', {
  type: 'rx',
  description: 'enforces a cooldown period. Any data that arrives during the quiet time is ignored',
  category: 'operator',
  params: [
    {id: 'cooldownPeriod', dynamic: true, description: 'can be dynamic'},
    {id: 'emitLast', as: 'boolean', description: 'emits the last event arrived at the end of the cooldown, default is true', type: 'boolean'}
  ],
  impl: (ctx,cooldownPeriod,emitLast) => jb.callbag.throttleTime(cooldownPeriod,emitLast)
})

component('rx.delay', {
  type: 'rx',
  category: 'operator',
  params: [
    {id: 'time', dynamic: true, description: 'can be dynamic'}
  ],
  impl: (ctx,time) => jb.callbag.delay(time)
})

component('rx.replay', {
  type: 'rx',
  description: 'stores messages and replay them for later subscription',
  params: [
    {id: 'itemsToKeep', as: 'number', description: 'empty for unlimited'}
  ],
  impl: (ctx,keep) => jb.callbag.replay(keep)
})

component('rx.takeUntil', {
  type: 'rx',
  description: 'closes the stream when events comes from notifier',
  category: 'terminate',
  params: [
    {id: 'notifier', type: 'rx', description: 'can be also promise or any other'}
  ],
  impl: (ctx,notifier) => jb.callbag.takeUntil(notifier)
})

component('rx.take', {
  type: 'rx',
  description: 'closes the stream after taking some items',
  category: 'terminate',
  params: [
    {id: 'count', as: 'number', dynamic: true, mandatory: true}
  ],
  impl: (ctx,count) => jb.callbag.take(count(),ctx)
})

component('rx.takeWhile', {
  type: 'rx',
  description: 'closes the stream on condition',
  category: 'terminate',
  params: [
    {id: 'whileCondition', as: 'boolean', dynamic: true, mandatory: true, type: 'boolean'},
    {id: 'passLastEvent', as: 'boolean', type: 'boolean', byName: true}
  ],
  impl: (ctx,whileCondition,passLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passLastEvent)
})

component('rx.toArray', {
  type: 'rx',
  category: 'operator',
  description: 'wait for all and returns next item as array',
  impl: ctx => source => jb.callbag.pipe(source, jb.callbag.toArray(), jb.callbag.map(arr=> ctx.dataObj(arr.map(x=>x.data))))
})

component('rx.last', {
  type: 'rx',
  category: 'filter',
  impl: () => jb.callbag.last()
})

component('rx.skip', {
  type: 'rx',
  category: 'filter',
  params: [
    {id: 'count', as: 'number', dynamic: true}
  ],
  impl: (ctx,count) => jb.callbag.skip(count())
})

component('rx.subscribe', {
  type: 'rx',
  description: 'forEach action for all items',
  category: 'sink',
  params: [
    {id: 'next', type: 'action', dynamic: true, mandatory: true},
    {id: 'error', type: 'action', dynamic: true},
    {id: 'complete', type: 'action', dynamic: true}
  ],
  impl: (ctx,next, error, complete) => jb.callbag.subscribe(ctx2 => next(ctx2), ctx2 => error(ctx2), () => complete())
})

component('sink.action', {
  type: 'rx',
  category: 'sink',
  description: 'subscribe',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,action) => jb.callbag.subscribe(ctx2 => { ctx; return action(ctx2) })
})

component('sink.data', {
  type: 'rx',
  params: [
    {id: 'Data', as: 'ref', dynamic: true, mandatory: true}
  ],
  impl: sink.action(writeValue('%$Data()%', '%%'))
})

component('rx.log', {
  description: 'jb.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string', dynamic: true, description: 'log names'},
    {id: 'extra', as: 'single', dynamic: true, description: 'object. more properties to log'}
  ],
  impl: rx.do((ctx,vars,{name,extra}) => jb.log(name(ctx),{data: ctx.data,vars,...extra(ctx), ctx: ctx.cmpCtx}))
})

component('rx.clog', {
  description: 'console.log flow data, used for debug',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: rx.do((x,{},{name}) => console.log(name,x))
})

component('rx.sniffer', {
  description: 'console.log data & control',
  params: [
    {id: 'name', as: 'string'}
  ],
  impl: (ctx,name) => source => jb.callbag.sniffer(source, {next: x => console.log(name,x)})
})

// ********** subject 
component('rx.subject', {
  type: 'data',
  description: 'callbag "variable" that you can write or listen to',
  category: 'variable',
  params: [
    {id: 'id', as: 'string', description: 'can be used for logging'},
    {id: 'replay', as: 'boolean', description: 'keep pushed items for late subscription', type: 'boolean'},
    {id: 'itemsToKeep', as: 'number', description: 'relevant for replay, empty for unlimited'}
  ],
  impl: (ctx,id, replay,itemsToKeep) => {
      const trigger = jb.callbag.subject(id)
      const source = replay ? jb.callbag.replay(itemsToKeep)(trigger): trigger
      source.ctx = trigger.ctx = ctx
      return { trigger, source } 
    }
})

component('sink.subjectNext', {
  type: 'rx',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => jb.callbag.subscribe(e => subject.trigger.next(e))
})

component('source.subject', {
  type: 'rx',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subj) => subj.source
})

component('action.subjectNext', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true},
    {id: 'Data', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,subject,data) => subject.trigger.next(ctx.dataObj(data(ctx)))
})

component('action.subjectComplete', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true}
  ],
  impl: (ctx,subject) => subject.trigger.complete()
})

component('action.subjectError', {
  type: 'action',
  params: [
    {id: 'subject', mandatory: true},
    {id: 'error', dynamic: true, mandatory: true}
  ],
  impl: (ctx,subject,error) => subject.trigger.error(error())
})

// ********** queue 
component('rx.queue', {
  type: 'data',
  description: 'message queue',
  category: 'variable',
  params: [
    {id: 'items', as: 'array'}
  ],
  impl: (ctx,items) => ({ items: items.slice(0), subject: jb.callbag.subject(), mkmk: 5 })
})

component('source.queue', {
  type: 'rx',
  params: [
    {id: 'queue', mandatory: true}
  ],
  impl: source.merge(source.data('%$queue/items%'), '%$queue/subject%')
})

component('action.addToQueue', {
  type: 'action',
  params: [
    {id: 'queue', mandatory: true},
    {id: 'item', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,queue,item) => {
    const toAdd = item(ctx)
    queue.items.push(toAdd)
    queue.subject.next(ctx.dataObj(toAdd)) 
  }
})

component('action.removeFromQueue', {
  type: 'action',
  params: [
    {id: 'queue', mandatory: true},
    {id: 'item', dynamic: true, defaultValue: '%%'}
  ],
  impl: (ctx,queue,item) => {
		const index = queue.items.indexOf(item(ctx))
		if (index != -1)
      queue.items.splice(index,1)
  }
})

});

jbLoadPackedFile({lineInPackage:7588, jb, noProxies: false, path: '/plugins/remote/jbm/jbm-utils.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
/* jbm - a virtual jBart machine - can be implemented in same frame/sub frames/workers over the network
interface jbm : {
     uri : string // devtools•logPanel, studio•preview•debugView, •debugView
     parent : jbm // null means root
     remoteExec(profile: any ,{timeout,oneway}) : Promise | void
     createCallbagSource(stripped ctx of cb_source) : cb
     createCallbagOperator(stripped ctx of cb_operator, {profText}) : (source => cb)
}
jbm interface can be implemented on the actual jb object or a jbm proxy via port

// port is used to send messages between two jbms
interface port {
     from: uri
     to: uri
     postMessage(m)
     onMessage({addListener(handler(m))})
     onDisconnect({addListener(handler)})
}
implementatios over frame(window,worker), websocket, connection 

Routing is implemented by remoteRoutingPort, first calclating the routing path, and sending to the message hop by hop to the destination.
The routing path is reversed to create response message
*/

extension('cbHandler', {
    initExtension() {
        return { counter: 0, map: {} }
    },
    newId: () => jb.uri + ':' + (jb.cbHandler.counter++),
    get: id => jb.cbHandler.map[id],
    getAsPromise(id,t) { 
        if (jb.cbHandler.map[id] && jb.cbHandler.map[id].terminated)
            return Promise.resolve(() => () => {})
        return jb.exec({$: 'action<>waitFor', check: ()=> jb.cbHandler.map[id], interval: 5, times: 10})
            .catch(err => {
                if (!jb.terminated)
                    jb.logError('cbLookUp - can not find cb',{id, in: jb.uri})
                return () => {}
            })
            .then(cb => {
                if (t == 2) jb.cbHandler.removeEntry(id)
                return cb
            })
    },
    addToLookup(cb) { 
        const id = jb.cbHandler.newId()
        jb.cbHandler.map[id] = cb
        return id 
    },
    removeEntry(ids,m,delay=10) {
        jb.log(`remote remove cb handlers at ${jb.uri}`,{ids,m})
        jb.delay(delay).then(()=> // TODO: BUGGY delay - keep alive as sink talkback may want to send 1. think how to know when sink got 2.
            jb.asArray(ids).filter(x=>x).forEach(id => {
                jb.cbHandler.map[id].terminated = true
            } )
        )
    },
    terminate() {
        Object.keys(jb.cbHandler.map).forEach(k=>delete jb.cbHandler[k])
    }
})

extension('net', {
    reverseRoutingProps(routingMsg) {
        if (!routingMsg) return
        const rPath = routingMsg.routingPath && {
            routingPath: routingMsg.routingPath.slice(0).reverse(),
            from: routingMsg.to,
            to: routingMsg.from,
            $disableLog: jb.path(routingMsg,'remoteRun.vars.$disableLog')
        }
        const diableLog = jb.path(routingMsg,'remoteRun.vars.$disableLog') && {$disableLog: true}
        return { ...rPath, ...diableLog}
    },
    handleOrRouteMsg(from,to,handler,m, {blockContentScriptLoop} = {}) {
        if (jb.terminated) {
            jb.log(`remote messsage arrived to terminated ${from}`,{from,to, m})
            return
        }
//            jb.log(`remote handle or route at ${from}`,{m})
        if (blockContentScriptLoop && m.routingPath && m.routingPath.join(',').indexOf([from,to].join(',')) != -1) return
        const arrivedToDest = m.routingPath && m.routingPath.slice(-1)[0] === jb.uri || (m.to == from && m.from == to)
        if (arrivedToDest) {
            jb.log(`transmit remote received at ${from} from ${m.from} to ${m.to}`,{m})
            handler && handler(m)
        } else if (m.routingPath) {
            const path = m.routingPath
            const indexOfNextPort = path.indexOf(jb.uri)+1
            let nextPort = indexOfNextPort && jb.ports[path[indexOfNextPort]]
            if (!nextPort && jb.jbm.gateway) {
                path.splice(path.indexOf(jb.uri),0,jb.jbm.gateway.uri)
                nextPort = jb.jbm.gateway
                jb.log(`remote gateway injected to routingPath at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
            }
            if (!nextPort)
                return jb.logError(`remote - no destination found and no gateway at ${from} from ${m.from} to ${m.to}`,{ m })
            jb.log(`remote forward at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
            nextPort.postMessage(m)
        }            
    }
})

extension('jbm', 'main', {
    initExtension() {
        Object.assign(jb, {
            uri: jb.uri || jb.frame.jbUri,
            ports: {},
            remoteExec,
            createCallbagSource: remoteExec,
            createCallbagOperator: remoteExec,
        })
        return { childJbms: {}, networkPeers: {}, notifyChildReady: {} }

        async function remoteExec(sctx) {
            // used by child jbm
            await jb.treeShake.codeServerJbm && jb.treeShake.bringMissingCode(sctx)
            return jb.utils.waitForInnerElements(jb.remoteCtx.deStrip(sctx)())
        }
    },
    portFromFrame(frame,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            frame, from, to, handlers: [],
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                frame.postMessage(m) 
            },
            onMessage: { addListener: handler => { 
                function h(m) { jb.net.handleOrRouteMsg(from,to,handler,m.data,options) }
                port.handlers.push(h); 
                return frame.addEventListener('message', h) 
            }},
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} },
            terminate() {
                port.handlers.forEach(h=>frame.removeEventListener('message',h))
            }
        }
        jb.ports[to] = port
        return port
    },
    extendPortToJbmProxy(port,{doNotinitCommandListener} = {}) {
        if (port && !port.createCalllbagSource) {
            Object.assign(port, {
                uri: port.to,
                rjbm() { return this },
                createCallbagSource(remoteRun) {
                    const cbId = jb.cbHandler.newId()
                    port.postMessage({$:'CB.createSource', remoteRun, cbId })
                    return (t,d) => outboundMsg({cbId,t,d})
                },
                createCallbagOperator(remoteRun) {
                    return source => {
                        const sourceId = jb.cbHandler.addToLookup(Object.assign(source,{remoteRun}))
                        const cbId = jb.cbHandler.newId()
                        port.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                        return (t,d) => {
                            jb.log('remote callbag operator send',{t,d, remoteRun, cbId})
                            if (t == 2) console.log('send 2',cbId,sourceId)
                            outboundMsg({cbId,t,d})
                        }
                    }
                },
                remoteExec(remoteRun, {oneway, timeout = 5000, isAction, ctx} = {}) {
                    if (oneway)
                        return port.postMessage({$:'CB.execOneWay', remoteRun, timeout })
                    return new Promise((resolve,reject) => {
                        const handlers = jb.cbHandler.map
                        const cbId = jb.cbHandler.newId()
                        const timer = setTimeout(() => {
                            if (!handlers[cbId] || handlers[cbId].terminated) return
                            const err = { type: 'error', desc: 'remote exec timeout', remoteRun, timeout }
                            jb.logError('remote exec timeout',{timeout, uri: jb.uri, h: handlers[cbId]})
                            handlers[cbId] && reject(err)
                        }, timeout)
                        handlers[cbId] = {resolve,reject,remoteRun, timer}
                        jb.log('remote exec request',{remoteRun,port,oneway,cbId})
                        port.postMessage({$:'CB.exec', remoteRun, cbId, isAction, timeout })
                    })
                }
            })
            if (!doNotinitCommandListener)
                initCommandListener()
        }
        return port

        function initCommandListener() {
            port.onMessage.addListener(m => {
                if (jb.terminated) return // TODO: removeEventListener
                jb.log(`remote command from ${m.from} ${m.$}`,{m})
                if ((m.$ || '').indexOf('CB.') == 0)
                    handleCBCommand(m)
                else if (m.$ == 'CB')
                    inboundMsg(m)
                else if (m.$ == 'execResult')
                    inboundExecResult(m)
            })
        }

        function outboundMsg({cbId,t,d}) {
            port.postMessage({$:'CB', cbId,t, d: t == 0 ? jb.cbHandler.addToLookup(d) : d })
        }
        function inboundMsg(m) { 
            const {cbId,t,d} = m
            jb.log('remote callbag source/operator',{t,d, cbId})
            if (t == 2) jb.cbHandler.removeEntry(cbId,m)
            return jb.cbHandler.getAsPromise(cbId,t).then(cb=> !jb.terminated && cb && cb(t, t == 0 ? remoteCB(d,cbId,m) : d)) 
        }
        function inboundExecResult(m) { 
            jb.cbHandler.getAsPromise(m.cbId).then(h=>{
                if (jb.terminated) return
                if (!h) 
                    return jb.logError('remote exec result arrived with no handler',{cbId:m.cbId, m})
                clearTimeout(h.timer)
                if (m.type == 'error') {
                    jb.logError('remote remoteExec', {m, h})
                    h.reject(m)
                } else {
                    h.resolve(m.result)
                }
                jb.cbHandler.removeEntry(m.cbId,m)
            })
        }            
        function remoteCB(cbId, localCbId, routingMsg) { 
            let talkback
            return (t,d) => {
                if (t==2) jb.cbHandler.removeEntry([localCbId,talkback],routingMsg)
                //if (t == 1 && !d) return
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = jb.cbHandler.addToLookup(d)) : jb.remoteCtx.stripCBVars(d), ...jb.net.reverseRoutingProps(routingMsg) }) 
            }
        }
        async function handleCBCommand(cmd) {
            const {$,sourceId,cbId,isAction} = cmd
            try {
                if (jb.treeShake.codeServerJbm) {
                    if (Object.keys(jb.treeShake.loadingCode || {}).length) {
                        jb.log('remote waiting for loadingCode',{cmd, loading: Object.keys(jb.treeShake.loadingCode)})
                        await jb.exec({$: 'action<>waitFor', timeout: 100, check: () => !Object.keys(jb.treeShake.loadingCode).length })
                    }
                    await jb.treeShake.bringMissingCode(cmd.remoteRun)
                }
                jb.log('remote handleCBCommand',{cmd})
                const deStrip = jb.remoteCtx.deStrip(cmd.remoteRun)
                const deStripResult = await (typeof deStrip == 'function' ? deStrip() : deStrip)
                const {result, actualResult, probe} = await waitForResult(deStripResult)
                if ($ == 'CB.createSource' && typeof actualResult == 'function') {
                    jb.remoteCtx.markProbeRecords(probe, 'initSource')
                    jb.cbHandler.map[cbId] = actualResult
                } else if ($ == 'CB.createOperator' && typeof actualResult == 'function') {
                    jb.remoteCtx.markProbeRecords(probe, 'initOperator')
                    jb.cbHandler.map[cbId] = actualResult(remoteCB(sourceId, cbId,cmd) ) // bind to source
                } else if ($ == 'CB.exec') {
                    const resultToReturn = isAction ? (probe ? {$: 'withProbeResult', probe} : {}) : jb.remoteCtx.stripData(result)
                    port.postMessage({$:'execResult', cbId, result: resultToReturn , ...jb.net.reverseRoutingProps(cmd) })
                }
            } catch(err) { 
                jb.logException(err,'remote handleCBCommand',{cmd})
                $ == 'CB.exec' && port.postMessage({$:'execResult', cbId, result: { type: 'error', err}, ...jb.net.reverseRoutingProps(cmd) })
            }
            async function waitForResult(result) {
                const res = jb.path(result,'$') ? result.res : result
                const actualResult = $ == 'CB.exec' ? await jb.utils.waitForInnerElements(res) : res
                const probe = jb.path(result,'$') ? result.probe : null
                return {result: probe ? {...result, res: actualResult } : actualResult, actualResult, probe}
            }
        }
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    async initDevToolsDebugge() {
        if (jb.test && jb.test.runningTests && !jb.test.singleTest) 
            return jb.logError('jbart devtools is disables for multiple tests')
        if (!jb.jbm.networkPeers['devtools']) {
            jb.jbm.networkPeers['devtools'] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(globalThis,'devtools',{blockContentScriptLoop: true}))
            globalThis.postMessage({initDevToolsPeerOnDebugge: {uri: jb.uri, distPath: jb.jbm.pathOfDistFolder(), spyParam: jb.path(jb,'spy.spyParam')}}, '*')
            await jb.exec({$: 'action<>waitFor', check: ()=> jb.jbm.devtoolsInitialized, interval: 500, times: 10})
            jb.log(`chromeDebugger devtools initialized. adding connectToPanel func on debugee`,{uri: jb.uri})
            jb.jbm.connectToPanel = panelUri => {
                jb.log(`chromeDebugger invoking connectToPanel comp ${panelUri} on devltools`,{uri: jb.uri})
                new jb.core.jbCtx().setVar('$disableLog',true).run(remote.action({
                    action: {$: 'jbm.connectToPanel', panelUri}, 
                    jbm: byUri('devtools'),
                    oneway: true
                })) } // will be called directly by initPanel using eval
        }
    },
    async terminateChild(id,ctx,childsOrNet=jb.jbm.childJbms) {
        if (!childsOrNet[id]) return
        const childJbm = await childsOrNet[id]
        if (!childJbm) return
        const rjbm = await childJbm.rjbm()
        rjbm.terminated = childJbm.terminated = true
        jb.log('remote terminate child', {id})
        Object.keys(jb.ports).filter(x=>x.indexOf(childJbm.uri) == 0).forEach(uri=>{
                if (jb.ports[uri].terminate)
                    jb.ports[uri].terminate()
                delete jb.ports[uri]
            })
        delete childsOrNet[id]
        rjbm.remoteExec(jb.remoteCtx.stripJS(() => {jb.cbHandler.terminate(); terminated = true; if (typeof close1 == 'function') close() } ), {oneway: true, ctx} )
        return rjbm.remoteExec(jb.remoteCtx.stripJS(async () => {
            jb.cbHandler.terminate()
            jb.terminated = true
            if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
                jb.delay(100).then(() => close()) // close worker
            return 'terminated' 
        }), { oneway: true, ctx} )
    },
    terminateAllChildren(ctx) {
        return Promise.all([
            ...Object.keys(jb.jbm.childJbms||{}).map(id=>jb.jbm.terminateChild(id,ctx,jb.jbm.childJbms)),
            ...Object.keys(jb.jbm.networkPeers||{}).map(id=>jb.jbm.terminateChild(id,ctx,jb.jbm.networkPeers)),
        ])
    }
})

});

jbLoadPackedFile({lineInPackage:7912, jb, noProxies: false, path: '/plugins/remote/jbm/remote-cmd.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
component('remote.cmd', {
  type: 'data<>',
  moreTypes: 'action<>',
  description: 'calc a script with jb.js',
  params: [
    {id: 'main', type: 'data<>', dynamic: true, moreTypes: 'action<>', description: 'e.g pipeline("hello","%% -- %$v1%")'},
    {id: 'wrap', as: 'string', description: 'e.g prune(MAIN)'},
    {id: 'context', description: 'e.g {v1: "xx", param1: prof1("yy") }'},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true},
    {id: 'id', as: 'string', description: 'jb.uri of cmd, default is main'},
    {id: 'viaHttpServer', as: 'string', defaultValue: 'http://localhost:8082'}
  ],
  impl: async (ctx, main, wrap, context, sourceCode, id, viaHttpServer) => {
        const args = [
            ['-main', jb.utils.prettyPrint(main.profile, { singleLine: true })],
            ['-wrap', wrap],
            ['-uri', id],
            ['-sourceCode', JSON.stringify(sourceCode)],
            ...Object.keys(context).map(k => [`%${k}`, context[k]]),
        ].filter(x => x[1])
        const body = JSON.stringify(args.map(([k, v]) => `${k}:${v}`))
        const url = `${viaHttpServer}/?op=jb`

        return jbHost.fetch(url, { method: 'POST', body }).then(r => r.json()).then(x => x.result)

        function serializeContextVal(val) {
            if (val && typeof val == 'object')
                return `() => ${JSON.stringify(val)}`
            return val
        }
    }
})

});

jbLoadPackedFile({lineInPackage:7949, jb, noProxies: false, path: '/plugins/remote/jbm/jbm.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
pluginDsl('jbm')
using('loader,tree-shake')

component('stateless', {
  type: 'jbm',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>'}
  ],
  impl: If(isNode(), cmd('%$sourceCode%'), webWorker({ sourceCode: '%$sourceCode%', stateless: true }))
})

component('worker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'networkPeer', as: 'boolean', description: 'used for testing', type: 'boolean'}
  ],
  impl: If({
    condition: isNode(),
    then: If({
      condition: isVscode(),
      then: remoteNodeWorker('%$id%', { sourceCode: '%$sourceCode%', init: '%$init()%' }),
      Else: nodeWorker('%$id%', { sourceCode: '%$sourceCode%', init: '%$init()%' })
    }),
    Else: webWorker('%$id%', {
      sourceCode: '%$sourceCode%',
      init: '%$init()%',
      networkPeer: '%$networkPeer%'
    })
  })
})

component('webWorker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClient()},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'networkPeer', as: 'boolean', description: 'used for testing', type: 'boolean'},
    {id: 'stateless', as: 'boolean', description: 'can not be rx data source, or remote widget', type: 'boolean'}
  ],
  impl: (ctx,_id,sourceCode,init,networkPeer) => {
      const id = (_id || 'w1').replace(/-/g,'__')
      const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
      if (childsOrNet[id]) return childsOrNet[id]
      const workerUri = networkPeer ? id : `${jb.uri}•${id}`
      const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
      sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote-jbm','tree-shake'])

      const workerCode = `
importScripts(location.origin+'/plugins/loader/jb-loader.js');
//importScripts(location.origin+'/package/${sourceCode.plugins.join(',')}.js'); // 
jbHost.baseUrl = location.origin || '';
Promise.resolve(jbInit('${workerUri}', ${JSON.stringify(sourceCode)})).then(jb => {
//jbLoadPacked({uri:'${workerUri}'}).then(jb => {
  globalThis.jb = jb;
  jb.spy.initSpy({spyParam: "${jb.spy.spyParam}"});
  jb.treeShake.codeServerJbm = ${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
  self.postMessage({ $: 'workerReady' })
})
//# sourceURL=${workerUri}-initJb.js`

      return childsOrNet[id] = {
          uri: workerUri,
          rjbm() {
                if (this._rjbm) return this._rjbm
                if (this.waitingForPromise) return this.waitingForPromise
                const self = this
                return this.waitingForPromise = new Promise(resolve => {
                  const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
                  worker.addEventListener('message', async function f1(m) {
                      if (m.data.$ == 'workerReady') {
                          if (self._rjbm) {
                              resolve(self._rjbm) // race condition
                          } else {
                              worker.removeEventListener('message',f1)
                              const rjbm = self._rjbm = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
                              rjbm.worker = worker
                              await init(ctx.setVar('jbm',childsOrNet[id]))
                              resolve(rjbm)
                          }
                      }
                  })
              })
          }
      }
  }
})

component('child', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClient()},
    {id: 'init', type: 'action<>', dynamic: true}
  ],
  impl: (ctx,_id,sourceCode,init) => {
        const id = _id || 'child1'
        if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
        const childUri = `${jb.uri}•${id}`
        sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote-jbm','tree-shake'])

        return jb.jbm.childJbms[id] = {
            uri: childUri,
            async rjbm() {
                if (this._rjbm) return this._rjbm
                const child = this.child = await jbInit(childUri, sourceCode, {multipleInFrame: true})
                //child.spy.initSpy({spyParam: jb.spy.spyParam})
                child.rjbm = () => this._rjbm
                this._rjbm = initChild(child)
                await init(ctx.setVar('jbm',child))
                return this._rjbm
            }
        }

        function initChild(child) {
            child.spy.initSpy({spyParam: jb.spy.spyParam})
            child.parent = jb
            child.treeShake.codeServerJbm = jb.treeShake.codeServerJbm || jb // TODO: use codeLoaderUri
            child.ports[jb.uri] = {
                from: child.uri, to: jb.uri,
                postMessage: m => 
                    jb.net.handleOrRouteMsg(jb.uri,child.uri,jb.ports[child.uri].handler, {from: child.uri, to: jb.uri,...m}),
                onMessage: { addListener: handler => child.ports[jb.uri].handler = handler }, // only one handler
            }
            child.jbm.extendPortToJbmProxy(child.ports[jb.uri])
            jb.ports[child.uri] = {
                from: jb.uri,to: child.uri,
                postMessage: m => 
                    child.net.handleOrRouteMsg(child.uri,jb.uri,child.ports[jb.uri].handler , {from: jb.uri, to: child.uri,...m}),
                onMessage: { addListener: handler => jb.ports[child.uri].handler = handler }, // only one handler
            }
            return jb.jbm.extendPortToJbmProxy(jb.ports[child.uri])
        }
    }
})

component('cmd', {
  type: 'jbm',
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true},
    {id: 'viaHttpServer', as: 'string', defaultValue: 'http://localhost:8082'},
    {id: 'doNotStripResult', as: 'boolean', type: 'boolean'},
    {id: 'id', as: 'string'},
    {id: 'spy', as: 'string'},
    {id: 'includeLogs', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,_sourceCode,viaHttpServer,doNotStripResult,id,spy,includeLogs) => ({
        uri: id || 'main',
        remoteExec: async (sctx,{data, action} = {}) => {
            const plugins = !_sourceCode ? jb.loader.pluginsOfProfile([(data || action).profile, jb.path(sctx,'cmpCtx.params')]) : []
            const sourceCode = _sourceCode || { plugins , pluginPackages: [{$:'defaultPackage'}] }
            sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []), ...plugins])
    
            const args = [
                ['-runCtx', JSON.stringify(sctx)],
                ['-uri', id || `main`],
                ['-sourceCode', JSON.stringify(sourceCode)],
                spy ? ['-spy', spy]: [],
                doNotStripResult ? ['-doNotStripResult',''+doNotStripResult] : []
            ].filter(x=>x[1])
            const command = `node --inspect-brk ../hosts/node/jb.js ${args.map(arg=> `${arg[0]}:` + 
                (arg[1].indexOf("'") != -1 ? `"${arg[1].replace(/"/g,`\\"`).replace(/\$/g,'\\$')}"` : `'${arg[1]}'`)).join(' ')}`
            let cmdResult = null
            if (viaHttpServer) {
                const body = JSON.stringify(args.map(([k,v])=>`${k}:${v}`))
                const url = `${viaHttpServer}/?op=jb`
                jb.log('remote cmd activated via http server',{url,body,ctx})
                cmdResult = await jbHost.fetch(url,{method: 'POST', body}).then(r => r.text())
            } else if (jbHost.spawn) {
                try {
                   cmdResult = await jbHost.spawn(args)
                } catch (e) {
                  jb.logException(e,'cmd',{command})
                }
            }
            try {
                const resultWithLogs = JSON.parse(cmdResult)
                jb.log('remote cmd result',{resultWithLogs, ctx})
                return includeLogs ? resultWithLogs : resultWithLogs.result
            } catch (err) {
                debugger
                jb.logError('remote cmd: can not parse result returned from jb.js',{cmdResult, command, err})
            }
        },
        createCallbagSource: () => jb.logError('callbag is not supported in single run jbm'),
        createCallbagOperator: () => jb.logError('callbag is not supported in single run jbm'),

        async rjbm() { return this }
    })
})

component('byUri', {
  type: 'jbm',
  params: [
    {id: 'uri', as: 'string', dynamic: true}
  ],
  impl: ({},_uri) => {
      const uri = _uri()
      return findNeighbourJbm(uri) || {
          uri,
          rjbm() {
              this._rjbm = this._rjbm || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri),{doNotinitCommandListener: true})
              return this._rjbm
          }
      }

      function remoteRoutingPort(from,to) {
          if (jb.ports[to]) return jb.ports[to]
          const routingPath = calcRoutingPath(from,to)
          if (routingPath.length == 2 && jb.ports[routingPath[1]])
              return jb.ports[routingPath[1]]
          let nextPort = jb.ports[routingPath[1]]
          if (!nextPort && jb.jbm.gateway) {
              routingPath.splice(1,0,jb.jbm.gateway.uri)
              nextPort = jb.jbm.gateway
          }
          if (!nextPort) {
              return jb.logError(`routing - can not find next port`,{routingPath, uri: jb.uri, from,to})
          }
  
          const port = {
              from, to,
              postMessage: _m => { 
                  const m = {from, to,routingPath,..._m}
                  jb.log(`remote routing sent from ${from} to ${to}`,{m})
                  nextPort.postMessage(m)
              },
              onMessage: { addListener: handler => nextPort.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
              onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
          }
          jb.ports[to] = port
          return port
      }

      function calcRoutingPath(from,to) {
          const pp1 = from.split('•'), pp2 = to.split('•')
          const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('•'))
          const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('•'))
          let i =0;
          while (p1[i] === p2[i] && i < p1.length) i++;
          const path_to_shared_parent = i ? p1.slice(i-1) : p1.slice(i) // i == 0 means there is no shared parent, so network is used
          return [...path_to_shared_parent.reverse(),...p2.slice(i)]
      }
      function findNeighbourJbm(uri) {
          return [jb, jb.parent, ...Object.values(jb.jbm.childJbms), ...Object.values(jb.jbm.networkPeers)].filter(x=>x).find(x=>x.uri == uri)
      }
  }
})

component('jbm.self', {
  type: 'jbm',
  impl: () => {
      jb.rjbm = jb.rjbm || (() => jb)
      return jb
  }
})

component('jbm.isSelf', {
  params: [
    {id: 'jbm', type: 'jbm', mandatory: true}
  ],
  type: 'boolean<>',
  impl: (ctx,jbm) => jbm == jb
})

component('parent', {
  type: 'jbm',
  impl: () => ({
    uri: jb.parent.uri,
    rjbm: () => jb.parent
  })
})

component('jbm.start', {
  type: 'data<>',
  moreTypes: 'action<>',
  params: [
    {id: 'jbm', type: 'jbm', mandatory: true}
  ],
  impl: pipe('%$jbm%', '%rjbm()%', '%$jbm%', first())
})

component('jbm.terminateChild', {
  type: 'action<>',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: (ctx,id) => jb.jbm.terminateChild(id,ctx)
})

component('isNode', {
  type: 'boolean<>',
  impl: () => globalThis.jbHost.isNode
})

component('isVscode', {
  type: 'boolean<>',
  impl: () => globalThis.jbHost.isVscode
})

component('nodeOnly', {
  type: 'data<>',
  params: [
    {id: 'calc', dynamic: true, mandatory: true},
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true}
  ],
  impl: If(and(isNode(), not(isVscode())), '%$calc()%', remote.data('%$calc()%', cmd('%$sourceCode%')))
})
});

jbLoadPackedFile({lineInPackage:8264, jb, noProxies: false, path: '/plugins/remote/jbm/node-worker.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {

extension('webSocket', 'client', {
    initExtension() { return { toRestart: [], servers: {} } },
    connectFromBrowser: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const socket = new jbHost.WebSocket_Browser(wsUrl,'echo-protocol')
        jb.log('remote web socket connect request',{wsUrl,serverUri,ctx})
        socket.onopen = () => resolve(jb.webSocket.portFromBrowserWebSocket(socket,serverUri))
        socket.onerror = err => { jb.logError('websocket error',{err,ctx}); resolve() }
    }),
    connectFromNodeClient: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const W3CWebSocket = jbHost.require('websocket').w3cwebsocket
        const socket = new W3CWebSocket(wsUrl, 'echo-protocol')
        jb.log('remote web socket connect request',{wsUrl,serverUri,ctx})
        socket.onopen = () => { resolve(jb.webSocket.portFromW3CSocket(socket,serverUri)) }
        socket.onerror = err => { jb.logError('websocket error',{err,socket,ctx}); resolve() }
    }),
    connectFromVSCodeClient: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const client = new jbHost.WebSocket_WS(wsUrl)
        client.on('error', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
        client.on('open', () => resolve(jb.webSocket.portFromVSCodeWebSocket(client,serverUri)))
    }),
    portFromW3CSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.onmessage = m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.data),options) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },    
    portFromVSCodeWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.utf8Data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromNodeWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.sendUTF(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.utf8Data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromBrowserWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.addEventListener('message',m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromNodeChildProcess(proc,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            proc, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                proc.send(m) 
            },
            onMessage: { addListener: handler => proc.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m,options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
})    

extension('jbm', 'worker', {
    portFromWorkerToParent(parentPort,from,to) { return {
        parentPort, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            parentPort.postMessage(m) 
        },
        onMessage: { addListener: handler => parentPort.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromParentToWorker(worker,from,to) { return {
        worker, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            worker.postMessage(m) 
        },
        onMessage: { addListener: handler => worker.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},    
})

component('remoteNodeWorker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClientWithPlugins()},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'initiatorUrl', as: 'string', defaultValue: 'http://localhost:8082'},
    {id: 'workerDetails'}
  ],
  impl: async (ctx,_id,sourceCode,init,initiatorUrl,workerDetails) => {
        const id = (_id || 'nodeWorker1').replace(/-/g,'__')
        const vscode = jbHost.isVscode ? 'vscode ' : ''
        jb.log(`${vscode}remote node worker`,{ctx,id})
        const nodeWorkerUri = `${jb.uri}__${id}`
        const restart = (jb.webSocket.toRestart||[]).indexOf(id)
        if (jb.jbm.childJbms[id] && restart == -1) return jb.jbm.childJbms[id]
        if (restart != -1) {
            jb.jbm.childJbms[id].remoteExec(jb.remoteCtx.stripJS(() => process.exit(0)), { oneway: true} )
            delete jb.jbm.childJbms[id]
            delete jb.ports[nodeWorkerUri]
            jb.webSocket.toRestart.splice(restart,1)
        }
        const args = [
            ['-uri',id],
            ['-clientUri', jb.uri],
            ['-sourceCode', JSON.stringify(sourceCode)],
        ].filter(x=>x[1])

        if (!workerDetails) {
            workerDetails = await startNodeWorker(args)
            if (!workerDetails.uri && args[0][0] == 'inspect') // inspect may cause problems
                workerDetails = await startNodeWorker(args.slice(1))
        }
        jb.log(`${vscode}remote jbm details`,{ctx,workerDetails})

        if (!workerDetails.uri)
            return jb.logError('jbm webSocket bad response from server',{ctx, workerDetails})
        
        const method = 'connectFrom' + (jbHost.WebSocket_WS ? 'VSCodeClient' 
            : jbHost.WebSocket_Browser ? 'Browser' : 'NodeClient')
        const port = await jb.webSocket[method](workerDetails.wsUrl, workerDetails.uri,ctx)
        jb.log(`${vscode}remote connected to port`,{ctx,workerDetails})

        const jbm = jb.jbm.childJbms[id] = {
            ...workerDetails,
            async rjbm() {
                if (this._rjbm) return this._rjbm
                this._rjbm = jb.ports[nodeWorkerUri] = jb.jbm.extendPortToJbmProxy(port)
                await init(ctx.setVar('jbm',jb.jbm.childJbms[id]))
                return this._rjbm
            }
        }
        return jbm

        function startNodeWorker(args) {
            const url = `${initiatorUrl}/?op=createNodeWorker&args=${encodeURIComponent(JSON.stringify(args.map(([k,v])=>`${k}:${v}`)))}`
            return jbHost.fetch(url).then(r => r.json())
        }
    }
})

component('nodeWorker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClientWithPlugins()},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'usePackedCode', as: 'boolean', type: 'boolean<>'}
  ],
  impl: async (ctx,_id,sourceCode,init,usePackedCode) => {
    const id = (_id || 'w1').replace(/-/g,'__')
    if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
    if (!jbHost.isNode || jbHost.isVscode)
        return jb.logError(`nodeWorker ${id} can only run on pure nodejs`, {ctx})

    const { Worker } = require('worker_threads')
    const workerUri = `${jb.uri}•${id}`
    sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote-jbm','tree-shake'])
    const baseDir = jbHost.jbReactDir
    const initJb = usePackedCode ? `jbLoadPacked({uri:'${workerUri}'})` : `Promise.resolve(jbInit('${workerUri}', ${JSON.stringify(sourceCode)}))`

    const workerCode = `
const fs = require('fs')
const { jbHost } = require('${jbHost.jbReactDir}/hosts/node/node-host.js')
const inspector = require('inspector')
const { parentPort } = require('worker_threads')
// inspector.open()
// inspector.waitForDebugger()

const { jbInit } = require('${jbHost.jbReactDir}/plugins/loader/jb-loader.js')

${initJb}.then(jb => {
globalThis.jb = jb;
jb.spy.initSpy({spyParam: "${jb.spy.spyParam}"});
jb.treeShake.codeServerJbm = jb.parent = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromWorkerToParent(parentPort,'${workerUri}','${jb.uri}'))
parentPort.postMessage({ $: 'workerReady' })
 })
//# sourceURL=${workerUri}-initJb.js`

    return jb.jbm.childJbms[id] = {
        uri: workerUri,
        rjbm() {
            if (this._rjbm) return this._rjbm
            if (this.waitingForPromise) return this.waitingForPromise
            const self = this
            return this.waitingForPromise = new Promise(resolve => {
              debugger
              const worker = new Worker(workerCode, { eval: true, execArgv: ["--inspect"] })
              worker.on('message', async function f1(m) {
                debugger
                if (m.$ == 'workerReady') {
                    if (self._rjbm) {
                        resolve(self._rjbm) // race condition
                    } else {
                        worker.off('message',f1)
                        const rjbm = self._rjbm = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromParentToWorker(worker,jb.uri,workerUri))
                        rjbm.worker = worker
                        await init(ctx.setVar('jbm',jb.jbm.childJbms[id]))
                        resolve(rjbm)
                    }
                }
              })
        })
      }
    }
  }
})

// component('spawn', {
//     type: 'jbm',
//     params: [
//         {id: 'id', as: 'string', mandatory: true},
//         {id: 'projects', as: 'array'},
//         {id: 'init', type: 'action', dynamic: true},
//         {id: 'inspect', as: 'number'},
//         // {id: 'completionServer', as: 'boolean'},
//     ],
//     impl: async (ctx,name,projects,init,inspect) => {
//         jb.log('vscode jbm spawn',{ctx,name})
//         if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
//         const childUri = `${jb.uri}__${name}`
//         // if (jb.webSocket.toRestart.indexOf(name) != -1) {
//         //     if (jb.path(jb.jbm.childJbms[name],'kill'))
//         //       jb.jbm.childJbms[name].kill()
//         //     delete jb.jbm.childJbms[name]
//         //     delete jb.ports[forkUri]
//         //     jb.webSocket.toRestart.splice(indexOf(name),1)
//         // }

//         const args = [
//             ...(inspect ? [`--inspect=${inspect}`] : []),            
//             './node-servlet.js',
//             `-uri:${childUri}`,
//             `-clientUri:${jb.uri}`,
//             `-projects:${projects.join(',')}`,
// //            ...(completionServer ? [`-completionServer:true`] : []),
//             `-spyParam:${jb.spy.spyParam}`]
//         const child = jbHost.child_process.spawn('node', args, {cwd: jbHost.jbReactDir+'/hosts/node'})

//         const command = `node --inspect-brk jb.js ${args.map(x=>`'${x}'`).join(' ')}`
//         jb.vscode.stdout && jb.vscode.log(command)

//         const childDetailsStr = await new Promise(resolve => child.stdout.on('data', data => resolve('' + data)))
//         let childDetails
//         try {
//             childDetails = JSON.parse(childDetailsStr)
//         } catch(e) {
//             jb.logError('jbm spawn can not parse child Conf', {childDetailsStr})
//         }
//         const port = await jb.webSocket.connectFromNodeClient(`ws://localhost:${childDetails.port}`, childDetails.uri,ctx)
//         const jbm = jb.jbm.childJbms[childDetails.uri] = jb.jbm.extendPortToJbmProxy(port)
//         jbm.kill = child.kill
//         jbm.pid = child.pid 
//         await init(ctx.setVar('jbm',jbm))
//         return jbm
//   }
// })


});

jbLoadPackedFile({lineInPackage:8571, jb, noProxies: false, path: '/plugins/remote/jbm/remote-context.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
extension('remoteCtx', {
    initExtension() {
        return { allwaysPassVars: ['widgetId','disableLog','uiTest'], MAX_ARRAY_LENGTH: 10000, MAX_OBJ_DEPTH: 100}
    },
    stripFunction(f, {require} = {}) {
        const {profile,runCtx,path,param,srcPath} = f
        if (!profile || !runCtx) return jb.remoteCtx.stripJS(f)
        const profText = [jb.utils.prettyPrint(profile, {noMacros: true}),require].filter(x=>x).join(';')
        const profNoJS = jb.remoteCtx.stripJSFromProfile(profile)
        if (require) profNoJS.require = require.split(',').map(x=>x[0] == '#' ? `jb.${x.slice(1)}()` : {$: x})
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        let probe = null
        if (runCtx.probe && runCtx.probe.active && runCtx.probe.probePath.indexOf(srcPath) == 0) {
            const { probePath, maxTime, id } = runCtx.probe
            probe = { probePath, startTime: 0, maxTime, id, records: {}, visits: {}, active: true }
        }
        const usingData = jb.remoteCtx.usingData(profText)
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].filter(x=>x).join('~'), param, probe, profile: profNoJS, data: usingData ? jb.remoteCtx.stripData(runCtx.data) : null, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})

    },    
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.utils.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars)
            .filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const data = jb.remoteCtx.usingData(profText) && jb.remoteCtx.stripData(ctx.data)
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data, { top, depth, path} = {}) {
        if (data == null || (path||'').match(/parentNode$/)) return
        const innerDepthAndPath = key => ({depth: (depth || 0) +1, top: top || data, path: [path,key].filter(x=>x).join('~') })

        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return jb.remoteCtx.stripFunction(data)
        if (data instanceof jb.core.jbCtx)
             return jb.remoteCtx.stripCtx(data)
        if (depth > jb.remoteCtx.MAX_OBJ_DEPTH) {
             jb.logError('stripData too deep object, maybe recursive',{top, path, depth, data})
             return
        }
 
        if (Array.isArray(data) && data.length > jb.remoteCtx.MAX_ARRAY_LENGTH)
            jb.logError('stripData slicing large array',{data})
        if (Array.isArray(data))
             return data.slice(0,jb.remoteCtx.MAX_ARRAY_LENGTH).map((x,i)=>jb.remoteCtx.stripData(x, innerDepthAndPath(i)))
        if (typeof data == 'object' && ['DOMRect'].indexOf(data.constructor.name) != -1)
            return jb.objFromEntries(Object.keys(data.__proto__).map(k=>[k,data[k]]))
        if (typeof data == 'object' && (jb.path(data.constructor,'name') || '').match(/Error$/))
            return {$$: 'Error', message: data.toString() }
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name }
        if (typeof data == 'object' && data[jb.core.VERSION])
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data)
                .filter(e=> data.$ || typeof e[1] != 'function') // if not a profile, block functions
//                .map(e=>e[0] == '$' ? [e[0], jb.path(data,[jb.core.CT,'comp',jb.core.CT,'fullId']) || e[1]] : e)
                .map(e=>[e[0],jb.remoteCtx.stripData(e[1], innerDepthAndPath(e[0]) )]))
    },
    deStrip(data, _asIs) {
        if (typeof data == 'string' && data.match(/^@js@/))
            return eval(data.slice(4))
        const asIs = _asIs || (data && typeof data == 'object' && data.$$asIs)
        const stripedObj = data && typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],jb.remoteCtx.deStrip(e[1],asIs)]))
        if (stripedObj && data.$ == 'runCtx' && !asIs)
            return (ctx2,data2) => {
                const ctx = new jb.core.jbCtx(jb.utils.resolveProfile(stripedObj, {topComp: stripedObj}),{}).extendVars(ctx2,data2)
                const res = ctx.runItself()
                if (ctx.probe) {
                    if (jb.utils.isCallbag(res))
                        return jb.callbag.pipe(res, jb.callbag.mapPromise(r=>jb.remoteCtx.waitAndWrapProbeResult(r,ctx.probe,ctx)))
                    if (jb.callbag.isCallbagOperator(res))
                        return source => jb.callbag.pipe(res(source), jb.callbag.mapPromise(r=>jb.remoteCtx.waitAndWrapProbeResult(r,ctx.probe,ctx)))

                    return jb.remoteCtx.waitAndWrapProbeResult(res,ctx.probe,ctx)
                }
                return res
            }
        if (Array.isArray(data))
            return data.map(x=>jb.remoteCtx.deStrip(x,asIs))
        return stripedObj || data
    },
    async waitAndWrapProbeResult(_res,probe,ctx) {
        const res = await _res
        await Object.values(probe.records).reduce((pr,valAr) => pr.then(
            () => valAr.reduce( async (pr,item,i) => { await pr; valAr[i].out = await valAr[i].out }, Promise.resolve())
        ), Promise.resolve())
        const filteredProbe = { ...probe, records: jb.objFromEntries(jb.entries(probe.records).map(([k,v])=>[k,v.filter(x=>!x.sent)])) }
        Object.values(probe.records).forEach(arr=>arr.forEach(r => r.sent = true))
        const originalRecords = Object.fromEntries(Object.entries(probe.records).map(([k,v]) => [k,[...v]]))
        jb.log('remote context wrapping probe result',{probe, originalRecords, filteredProbe, res, ctx})
        return { $: 'withProbeResult', res, probe: filteredProbe }
    },    
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
    stripJSFromProfile(profile) {
        if (typeof profile == 'function')
            return `@js@${profile.toString()}`
        else if (Array.isArray(profile))
            return profile.map(val => jb.remoteCtx.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, jb.remoteCtx.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `@js@${val.toString()}` : jb.remoteCtx.stripData(val)
    },
    shouldPassVar: (varName, profText) => jb.remoteCtx.allwaysPassVars.indexOf(varName) != -1 || profText.match(new RegExp(`\\b${varName.split(':')[0]}\\b`)),
    usingData: profText => profText.match(/({data})|(ctx.data)|(%[^$])/),

    mergeProbeResult(ctx,res,from) {
        if (jb.path(res,'$') == 'withProbeResult') {
            if (ctx.probe && res.probe) {
              Object.keys(res.probe.records||{}).forEach(k=>ctx.probe.records[k] = res.probe.records[k].map(x =>({...x, from})) )
              Object.keys(res.probe.visits||{}).forEach(k=>ctx.probe.visits[k] = res.probe.visits[k] )
            }
            jb.log('merged probe result', {from, remoteProbeRes: res, records: res.probe.records})
            return res.res
        }
        return res
    },
    markProbeRecords(probe,prop) {
        probe && Object.values(probe.records||{}).forEach(x => x[prop] = true)
    },
})

component('remoteCtx.mergeProbeResult', {
    promote: 0,
    params: [
        {id: 'remoteResult', byName: true },
        {id: 'from', as: 'string'}
    ],
    impl: (ctx,remoteResult,from) => {
        if (jb.path(remoteResult,'$') == 'withProbeResult') {
            const { records, visits } = remoteResult.probe
            if (ctx.probe) {
              Object.keys(records||{}).forEach(k=>ctx.probe.records[k] = records[k].map(x =>({...x, from})) )
              Object.keys(visits||{}).forEach(k=>ctx.probe.visits[k] = visits[k] )
            }
            jb.log('merged probe result', {from, remoteResult, records })
            return remoteResult.res
        }
        return remoteResult
    }
})

component('remoteCtx.varsUsed', {
  promote: 0,
  params: [
    {id: 'profile' }
  ],
  impl: (ctx,profile) => {
    const profText = jb.utils.prettyPrint(profile||'', {noMacros: true})
    return (profText.match(/%\$[a-zA-Z0-9_]+/g) || []).map(x=>x.slice(2))
  }
})

});

jbLoadPackedFile({lineInPackage:8749, jb, noProxies: false, path: '/plugins/remote/jbm/remote.js',fileDsl: '', pluginId: 'remote-jbm' }, 
            function({jb,require,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,source,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
using('common,tgp-formatter,rx')

component('source.remote', {
  type: 'rx<>',
  params: [
    {id: 'rx', type: 'rx<>', dynamic: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'require', as: 'string'}
  ],
  impl: If({
    condition: jbm.isSelf('%$jbm%'),
    then: '%$rx()%',
    Else: rx.pipe(
      source.promise('%$jbm%'),
      rx.mapPromise('%rjbm()%'),
      rx.concatMap((ctx,{},{rx,require}) => {
        const rjbm = ctx.data
        const { pipe, map } = jb.callbag
        return pipe(rjbm.createCallbagSource(jb.remoteCtx.stripFunction(rx,{require})), 
          map(res => jb.remoteCtx.mergeProbeResult(ctx,res,rjbm.uri)) )
      })
    )
  })
})

// component('remote.operator', {
//   type: 'rx<>',
//   params: [
//     {id: 'rx', type: 'rx<>', dynamic: true},
//     {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
//     {id: 'passVars', as: 'array'}
//   ],
//   impl: If({
//     condition: jbm.isSelf('%$jbm%'),
//     then: '%$rx()%',
//     Else: rx.innerPipe(
//       rx.mapPromise('%$jbm%'),
//       rx.mapPromise('%rjbm()%'),
//       rx.resource('varStorage', obj(prop('counter', 0))),
//       rx.resource('varsToPass', list('%$passVars%', remoteCtx.varsUsed(({cmpCtx}) => cmpCtx.params.rx.profile), 'messageId')),
//       rx.do(({data, vars},{varStorage}) => varStorage[++varStorage.counter] = vars),
//       rx.var('messageId', '%$varStorage/counter%'),
//       rx.map(transformProp('vars', selectProps('%$varsToPass%'))),
//       rx.do(ctx=>{debugger}),
//       rx.concatMap(({data},{},{rx, require}) => data.createCallbagOperator(jb.remoteCtx.stripFunction(rx,{require}))),
//       rx.map(transformProp('vars', pipeline(extendWithObj('%$varStorage/{%$messageId%}%'), removeProps('messageId')))),
//       rx.do(removeProps('%$messageId%', { obj: '%$varStorage%' }))
//     )
//   }),
//   circuit: 'remoteTest.remoteOperator.remoteVar'
// })

component('remote.operator', {
  type: 'rx<>',
  params: [
    {id: 'rx', type: 'rx<>', dynamic: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'require', as: 'string'}
  ],
  impl: (ctx,rx,jbm,require) => {
        const { map, mapPromise, pipe, fromPromise, concatMap, replay} = jb.callbag
        if (!jbm)
            return jb.logError('remote.operator - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        if (jbm == jb) return rx()
        const stripedRx = jb.remoteCtx.stripFunction(rx,{require})
        const profText = jb.utils.prettyPrint(rx.profile)
        let counter = 0
        const varsMap = {}
        const cleanDataObjVars = map(dataObj => {
            if (typeof dataObj != 'object' || !dataObj.vars) return dataObj
            const vars = { ...jb.objFromEntries(jb.entries(dataObj.vars).filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))), messageId: ++counter } 
            varsMap[counter] = dataObj.vars
            return { data: dataObj.data, vars}
        })
        const restoreDataObjVars = map(dataObj => {
            const origVars = varsMap[dataObj.vars.messageId] 
            varsMap[dataObj.messageId] = null
            return origVars ? {data: dataObj.data, vars: Object.assign(origVars,dataObj.vars) } : dataObj
        })
        return source => pipe( fromPromise(jbm), mapPromise(_jbm=>_jbm.rjbm()),
            concatMap(rjbm => pipe(
              source, replay(5), cleanDataObjVars, rjbm.createCallbagOperator(stripedRx), 
              map(res => jb.remoteCtx.mergeProbeResult(ctx,res,rjbm.uri)), 
              restoreDataObjVars
            )))
    }
})

component('remote.waitForJbm', {
  description: 'wait for jbm to be available',
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
  ],
  impl: async (ctx,jbm) => {
        if (!jbm)
            return jb.logError('remote waitForJbm - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, ctx})
        if (jbm == jb) return
        const rjbm = await (await jbm).rjbm()
        if (!rjbm || !rjbm.remoteExec)
            return jb.logError('remote waitForJbm - can not resolve jbm', {in: jb.uri, jbm, rjbm, jbmProfile: ctx.profile.jbm, ctx})
    }
})

component('remote.action', {
  type: 'action<>',
  description: 'exec a script on a remote node and returns a promise if not oneWay',
  params: [
    {id: 'action', type: 'action<>', dynamic: true, composite: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'oneway', as: 'boolean', description: 'do not wait for the respone', type: 'boolean'},
    {id: 'timeout', as: 'number', defaultValue: 10000},
    {id: 'require', as: 'string'}
  ],
  impl: async (ctx,action,jbm,oneway,timeout,require) => {
        if (!jbm)
            return jb.logError('remote.action - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        if (jbm == jb) return action()
        const rjbm = await (await jbm).rjbm()
        if (!rjbm || !rjbm.remoteExec)
            return jb.logError('remote.action - can not resolve jbm', {in: jb.uri, jbm, rjbm, jbmProfile: ctx.profile.jbm, jb, ctx})
        const res = await rjbm.remoteExec(jb.remoteCtx.stripFunction(action,{require}),{timeout,oneway,isAction: true,action,ctx})
        return jb.remoteCtx.mergeProbeResult(ctx,res,rjbm.uri)
    }
})

component('remote.data', {
  description: 'calc a script on a remote node and returns a promise',
  params: [
    {id: 'calc', dynamic: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'timeout', as: 'number', defaultValue: 10000},
    {id: 'require', as: 'string'}
  ],
  impl: async (ctx,data,jbm,timeout,require) => {
        if (jbm == jb)
            return data()
        if (!jbm)
            return jb.logError('remote.data - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const rjbm = await (await jbm).rjbm()
        if (!rjbm || !rjbm.remoteExec)
            return jb.logError('remote.data - can not resolve jbm', {in: jb.uri, jbm, rjbm, jbmProfile: ctx.profile.jbm, jb, ctx})
                
        const res = await rjbm.remoteExec(jb.remoteCtx.stripFunction(data,{require}),{timeout,data,ctx})
        return jb.remoteCtx.mergeProbeResult(ctx,res,rjbm.uri)
    }
})

component('remote.initShadowData', {
  type: 'action<>',
  description: 'shadow watchable data on remote jbm',
  params: [
    {id: 'src', as: 'ref'},
    {id: 'jbm', type: 'jbm<jbm>'}
  ],
  impl: rx.pipe(
    source.watchableData('%$src%', { includeChildren: 'yes' }),
    rx.map(obj(prop('op', '%op%'), prop('path', ({data}) => jb.db.pathOfRef(data.ref)))),
    sink.action(remote.action(remote.updateShadowData('%%'), '%$jbm%'))
  )
})

component('remote.copyPassiveData', {
  type: 'action<>',
  description: 'shadow watchable data on remote jbm',
  params: [
    {id: 'resourceId', as: 'string'},
    {id: 'jbm', type: 'jbm<jbm>'}
  ],
  impl: runActions(
    Var('resourceCopy', '%${%$resourceId%}%'),
    remote.action({
      action: addComponent('%$resourceId%', '%$resourceCopy%', { type: 'passiveData' }),
      jbm: '%$jbm%'
    })
  )
})

component('remote.shadowResource', {
  type: 'action<>',
  description: 'shadow watchable data on remote jbm',
  params: [
    {id: 'resourceId', as: 'string'},
    {id: 'jbm', type: 'jbm<jbm>'}
  ],
  impl: runActions(
    Var('resourceCopy', '%${%$resourceId%}%'),
    remote.action({
      action: runActions(
        () => 'for loader - jb.watchable.initResourcesRef()',
        addComponent('%$resourceId%', '%$resourceCopy%', { type: 'watchableData' })
      ),
      jbm: '%$jbm%'
    }),
    rx.pipe(
      source.watchableData('%${%$resourceId%}%', { includeChildren: 'yes' }),
      rx.map(obj(prop('op', '%op%'), prop('path', ({data}) => jb.db.pathOfRef(data.ref)))),
      sink.action(remote.action(remote.updateShadowData('%%'), '%$jbm%'))
    )
  )
})

component('remote.updateShadowData', {
  type: 'action<>',
  description: 'internal - update shadow on remote jbm',
  params: [
    {id: 'entry'}
  ],
  impl: (ctx,{path,op}) => {
        jb.log('shadowData update',{op, ctx})
        const ref = jb.db.refOfPath(path)
        if (!ref)
            jb.logError('shadowData path not found at destination',{path, ctx})
        else
            jb.db.doOp(ref, op, ctx)
    }
})

/*** net comps */

component('remote.listSubJbms', {
  type: 'data<>',
  impl: pipe(
    () => Object.values(jb.jbm.childJbms || {}),
    remote.data(remote.listSubJbms(), '%%'),
    aggregate(list(() => jb.uri, '%%'))
  )
})

component('remote.getRootextentionUri', {
  impl: () => jb.uri.split('•')[0]
})

component('remote.listAll', {
  type: 'data<>',
  impl: remote.data({
    calc: pipe(
      Var('subJbms', remote.listSubJbms(), { async: true }),
      () => Object.values(jb.jbm.networkPeers || {}),
      remote.data(remote.listSubJbms(), '%%'),
      aggregate(list('%$subJbms%','%%'))
    ),
    jbm: byUri(remote.getRootextentionUri())
  })
})

// component('dataResource.yellowPages', { watchableData: {}})

// component('remote.useYellowPages', {
//     type: 'action<>',
//     impl: runActions(
//         Var('yp','%$yellowPages%'),
//         remote.action(({},{yp}) => component('dataResource.yellowPages', { watchableData: yp }), '%$jbm%'),
//         remote.initShadowData('%$yellowPages%', '%$jbm%'),
//     )
// })

});

jbLoadPackedFile({lineInPackage:9009, jb, noProxies: false, path: '/plugins/testing/generic-tests-data.js',fileDsl: '', pluginId: 'testing' }, 
            function({jb,require,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,pipeline,nameOfCity,phones,dataTest,source,tests,test,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
component('globals', {
  watchableData: {}
})

component('watchablePeople', {
  watchableData: [
    {name: 'Homer Simpson - watchable', age: 42, male: true},
    {name: 'Marge Simpson - watchable', age: 38, male: false},
    {name: 'Bart Simpson - watchable', age: 12, male: true}
  ]
})

component('person', {
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

component('personWithAddress', {
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

component('personWithPrimitiveChildren', {
  watchableData: {
    childrenNames: ['Bart','Lisa','Maggie'],
  }
})

component('personWithChildren', { watchableData: {
    name: "Homer Simpson",
    children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ],
    friends: [{ name: 'Barnie' } ],
}})
  
component('emptyArray', {
  watchableData: []
})

component('people', {
    passiveData: [
      {name: 'Homer Simpson', age: 42, male: true},
      {name: 'Marge Simpson', age: 38, male: false},
      {name: 'Bart Simpson', age: 12, male: true}
    ]
})

component('peopleWithChildren', { watchableData: [
  {
    name: 'Homer',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  },
  {
    name: 'Marge',
    children: [{name: 'Bart'}, {name: 'Lisa'}],
  }
]})

component('stringArray', { watchableData: ['a','b','c']})
component('stringTree', { watchableData: { node1: ['a','b','c'], node2: ['1','2','3']}})

});

jbLoadPackedFile({lineInPackage:9079, jb, noProxies: false, path: '/plugins/testing/testers.js',fileDsl: '', pluginId: 'testing' }, 
            function({jb,require,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,pipeline,nameOfCity,phones,dataTest,source,tests,test,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
using('remote-jbm')

component('dataTest', {
  type: 'test',
  params: [
    {id: 'calculate', type:'data', dynamic: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'spy', as: 'string'},
    {id: 'includeTestRes', as: 'boolean', type: 'boolean'},
    {id: 'covers', as: 'array'},
  ],
  impl: async function(ctx,calculate,expectedResult,runBefore,timeout,allowError,cleanUp,expectedCounters,spy,includeTestRes) {
		const ctxToUse = ctx.vars.testID ? ctx : ctx.setVars({testID:'unknown'})
		const {testID,singleTest,uiTest}  = ctxToUse.vars
		const remoteTimeout = testID.match(/([rR]emote)|([wW]orker)|(jbm)/) ? 5000 : null
		const _timeout = singleTest ? Math.max(1000,timeout) : (remoteTimeout || timeout)
		if (spy) jb.spy.setLogs(spy+',error')
		let result = null
		try {
			const testRes = await Promise.race([ 
				(async() => {
					await jb.delay(_timeout)
					return {testFailure: `timeout ${_timeout}mSec`}
				})(),
				(async() => {
					await runBefore(ctxToUse)
					const res = await calculate(ctxToUse)
					const _res = await jb.utils.waitForInnerElements(res)
					return _res
				})()
			])
			let testFailure = jb.path(testRes,'0.testFailure') || jb.path(testRes,'testFailure')
			const countersErr = jb.test.countersErrors(expectedCounters,allowError)
			const expectedResultCtx = new jb.core.jbCtx(ctxToUse,{ data: testRes })
			const expectedResultRes = !testFailure && await expectedResult(expectedResultCtx)
			testFailure = jb.path(expectedResultRes,'testFailure')
			const success = !! (expectedResultRes && !countersErr && !testFailure)
			jb.log('check test result',{testRes, success,expectedResultRes, testFailure, countersErr, expectedResultCtx})
			result = { id: testID, success, reason: countersErr || testFailure, ...(includeTestRes ? testRes : {})}
		} catch (e) {
			jb.logException(e,'error in test',{ctx})
			result = { testID, success: false, reason: 'Exception ' + e}
		} finally {
			if (spy) jb.spy.setLogs('error')
			if (uiTest && result.elem && jb.ui)
				jb.ui.unmount(result.elem)
			const doNotClean = ctx.probe || singleTest
			if (!doNotClean) await (!singleTest && cleanUp())
		} 
		return result
	}
})

extension('test', {
	initExtension() { 
		jb.test.initSpyEnrichers()
		return { success_counter: 0, fail_counter: 0, startTime: new Date().getTime() } 
	},
	goto_editor: (id,repo) => fetch(`/?op=gotoSource&comp=${id}&repo=${repo}`),
	hide_success_lines: () => jb.frame.document.querySelectorAll('.success').forEach(e=>e.style.display = 'none'),
	profileSingleTest: fullTestId => new jb.core.jbCtx().setVars({fullTestId, testID: fullTestId.split('>').pop()}).run({$: fullTestId}),
	initSpyEnrichers() {
		jb.spy.registerEnrichers([
			r => r.logNames == 'check test result' && ({ props: {success: r.success, data: r.expectedResultCtx.data, id: r.expectedResultCtx.vars.testId }}),
			r => r.logNames == 'check ui test result' && ({ props: {success: r.success, html: jb.ui.beautifyXml(r.html), data: r.data, id: r.testId }})
		])
	},
	runInner(propName, ctx) {
		const profile = ctx.profile
		return profile[propName] && ctx.runInner(profile[propName],{type: 'data'}, propName)
	},
	dataTestResult(ctx) {
		return Promise.resolve(jb.test.runInner('runBefore',ctx))
		.then(_ => jb.test.runInner('calculate',ctx))
		.then(v => jb.utils.waitForInnerElements(v))
		.then(value => {
			const success = !! jb.test.runInner('expectedResult',ctx.setData(value))
			return { success, value}
		})
	},
	runInStudio(profile) {
		return profile && jb.ui.parentFrameJb().exec(profile)
	},
	addHTML(el,html,{beforeResult} = {}) {
        const elem = document.createElement('div')
        elem.innerHTML = html
		const toAdd = elem.firstChild
		if (beforeResult && document.querySelector('#jb-testResult'))
			el.insertBefore(toAdd, document.querySelector('#jb-testResult'))
		else
        	el.appendChild(toAdd)
    },
	async cleanBeforeRun() {
		jb.db.watchableHandlers.forEach(h=>h.dispose())
		jb.db.watchableHandlers = [new jb.watchable.WatchableValueByRef(jb.watchable.resourcesRef)];
		jb.entries(JSON.parse(jb.test.initial_resources || '{}')).filter(e=>e[0] != 'studio').forEach(e=>jb.db.resource(e[0],e[1]))
		jb.ui && jb.ui.subscribeToRefChange(jb.db.watchableHandlers[0])

		if (jb.watchableComps && jb.watchableComps.handler) {
			jb.watchableComps.handler.resources(jb.test.initial_comps)
			jb.db.watchableHandlers.push(jb.watchableComps.handler)
		}
		if (!jb.spy.enabled && !jb.spy.spyParamInUrl()) jb.spy.initSpy({spyParam: 'test'})
		jb.spy.clear()
		// await jb.jbm.terminateAllChildren()
		// jb.ui.garbageCollectUiComps({forceNow: true,clearAll: true})
	},
	countersErrors(expectedCounters,allowError) {
		if (!jb.spy.enabled) return ''
		const exception = jb.spy.logs.find(r=>r.logNames.indexOf('exception') != -1)
		const error = jb.spy.logs.find(r=>r.logNames.indexOf('error') != -1)
		if (exception) return exception.err
		if (!allowError() && error) return error.err

		return Object.keys(expectedCounters || {}).map(
			exp => expectedCounters[exp] != jb.spy.count(exp)
				? `${exp}: ${jb.spy.count(exp)} instead of ${expectedCounters[exp]}` : '')
			.filter(x=>x)
			.join(', ')
  	},
	isCompNameOfType(name,type) {
		const comp = name && jb.comps[name]
		if (comp) {
			while (jb.comps[name] && !jb.comps[name].type && typeof jb.comps[name].impl == 'object' && jb.utils.compName(jb.comps[name].impl))
				name = jb.utils.compName(jb.comps[name].impl)
			return (jb.comps[name] && jb.comps[name].type || '').indexOf(type) == 0
		}
	},
	async runSingleTest(testID,{doNotcleanBeforeRun, showOnlyTest,fullTestId, quiet} = {}) {
		const profile = jb.comps[fullTestId]
		const singleTest = jb.test.singleTest
		const tstCtx = (jb.ui ? jb.ui.extendWithServiceRegistry() : new jb.core.jbCtx())
			.setVars({ testID, fullTestId,singleTest })
		const start = new Date().getTime()
		await !doNotcleanBeforeRun && !singleTest && jb.test.cleanBeforeRun()
		jb.log('start test',{testID})
		const res = quiet ? {} : await tstCtx.run({$:fullTestId})
		res.duration = new Date().getTime() - start
		jb.log('end test',{testID,res})
		if (!singleTest && !profile.doNotTerminateWorkers)
			await jb.jbm.terminateAllChildren(tstCtx)
		jb.ui && jb.ui.garbageCollectUiComps({forceNow: true,clearAll: true ,ctx: tstCtx})
		//await jb.delay(200)

		res.show = () => {
			if (!profile.impl.control) return
			const doc = jb.frame.document
			if (!doc) return
			const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx(tstCtx,{ vars:{quiet}, profile: profile.impl.control , forcePath: fullTestId+ '~impl~control', path: '' } ))
			const elem = doc.createElement('div')
			elem.className = 'show elemToTest'
			if (showOnlyTest)
				doc.body.innerHTML = ''
			doc.body.appendChild(elem)
			if (profile.impl.$ == 'zuiTest') {
				profile.impl.$$ = 'action<>zuiControlRunner'
				const ctxToRun = new jb.core.jbCtx(tstCtx,{ vars:{quiet}, profile: profile.impl , forcePath: fullTestId+ '~impl', path: '' } )
				return ctxToRun.runItself()
			}
			jb.ui.render(jb.ui.h(ctxToRun.runItself()),elem)    
		}		
		return res
	},
	async runTests({testType,specificTest,show,pattern,notPattern,take,remoteTests,repo,showOnlyTest,top,coveredTestsOf,quiet}) {
		const {pipe, fromIter, subscribe,concatMap, fromPromise } = jb.callbag 
		let index = 1
		specificTest = specificTest && decodeURIComponent(specificTest).split('>').pop()

		jb.test.initial_resources = JSON.stringify(jb.db.resources) //.replace(/\"\$jb_id":[0-9]*,/g,'')
		jb.test.initial_comps = jb.watchableComps && jb.watchableComps.handler && jb.watchableComps.handler.resources()
		jb.test.coveredTests = {}
		const testComps = jb.entries(jb.comps).filter(e=>e[1] && e[1].type != 'test' && e[0].startsWith('test<>')).map(([id,comp]) => [id.split('test<>').pop(),comp,id])
		testComps.forEach(([id,comp])=>{
			(jb.path(comp.impl,'covers') || []).forEach(test=>{
				jb.test.coveredTests[test] = jb.test.coveredTests[test] || []
				jb.test.coveredTests[test].push(id)
			})
		})

		let tests = testComps
			.filter(e=>!testType || e[1].impl.$ == testType)
			.filter(e=>!specificTest || e[0] == specificTest)
	//		.filter(e=> !e[0].match(/throw/)) // tests that throw exceptions and stop the debugger
			.filter(e=>!pattern || e[0].match(pattern))
			.filter(e=>!notPattern || !e[0].match(notPattern))
			.filter(e => e[0] == specificTest || (
				(coveredTestsOf || !jb.test.coveredTests[e[0]])
				&& (!coveredTestsOf || (jb.comps[`test<>${coveredTestsOf}`].impl.covers || []).includes(e[0]) || e[0] == coveredTestsOf)
				&& jb.path(e[1].impl,'expectedResult') !== true
				&& !jb.path(e[1],'doNotRunInTests')
			))
	//		.filter(e=>!e[0].match(/^remoteTest|inPlaceEditTest|patternsTest/) && ['uiTest','dataTest'].indexOf(e[1].impl.$) != -1) // || includeHeavy || specificTest || !e[1].impl.heavy )
	//		.sort((a,b) => (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0))
		tests.forEach(e => e.group = e[0].split('.')[0].split('Test')[0])
		const priority = 'net,data,ui,rx,suggestionsTest,remote,studio'.split(',').reverse().join(',')
		const groups = jb.utils.unique(tests.map(e=>e.group)).sort((x,y) => priority.indexOf(x) - priority.indexOf(y))
		tests.sort((y,x) => groups.indexOf(x.group) - groups.indexOf(y.group))
		tests = tests.slice(0,take)
		jb.test.singleTest = tests.length == 1	
		jb.test.runningTests = true

		if (remoteTests) {
			jb.exec({$: 'tests.runner', 
				jbm: worker({sourceCode: project('studio')}), 
				tests: () => tests.map(e=>e[0]), rootElemId: 'remoteTests'})
			return
		}

		document.body.innerHTML = quiet ? '': `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`;
		let counter = 0
		return pipe(
			fromIter(tests),
			concatMap(e => fromPromise((async () => {
				counter++
				if (counter % 100 == 0)
					await jb.delay(5) // gc
				// if (e[1].impl.timeout && e[1].impl.timeout > 1000)
				// 	await jb.delay(5)
				const testID = e[0], fullTestId = e[2]
				if (!quiet) {
					document.getElementById('progress').innerHTML = `<div id=${testID}>${index++}: ${testID} started</div>`
					console.log('starting ' + testID )
				}
				const res = await jb.test.runSingleTest(testID,{showOnlyTest, fullTestId,quiet })
				if (!quiet) {
					console.log('end      ' + testID, res)
					document.getElementById('progress').innerHTML = `<div id=${testID}>${testID} finished</div>`
				}
				return { ...res, fullTestId, testID}
			})() )),
			subscribe(res=> {
				res.success ? jb.test.success_counter++ : jb.test.fail_counter++;
				jb.test.usedJSHeapSize = (jb.path(jb.frame,'performance.memory.usedJSHeapSize' || 0) / 1000000)
				if (quiet || (!res.renderDOM && show)) res.show()
				if (quiet) return
				jb.test.updateTestHeader(jb.frame.document, jb.test)

				jb.test.addHTML(document.body, jb.test.testResultHtml(res, repo), {beforeResult: jb.test.singleTest && res.renderDOM});
				if (jb.ui && tests.length >1) {
					jb.cbLogByPath = {}
					jb.frame.scrollTo(0,0)
				}
		}))
  	},
	testResultHtml(res, repo) {
		const baseUrl = jb.frame.location.href.split('/tests.html')[0]
		const {fullTestId, success, duration, reason, testID} = res
		const testComp = jb.comps[fullTestId]
		const location = testComp.$location || {}
		const sourceCode = JSON.stringify(jb.exec(typeAdapter('source-code<loader>', test({
			filePath: () => location.path, repo: () => location.repo
		}))))
		const studioUrl = `http://localhost:8082/project/studio/${fullTestId}/${fullTestId}?sourceCode=${encodeURIComponent(sourceCode)}`
		const _repo = repo ? `&repo=${repo}` : ''
		const coveredTests = testComp.impl.covers ? `<a href="${baseUrl}/tests.html?coveredTestsOf=${testID}${_repo}">${testComp.impl.covers.length} dependent tests</a>` : ''
		return `<div class="${success ? 'success' : 'failure'}">
			<a href="${baseUrl}/tests.html?test=${testID}${_repo}&show&spy=${jb.spy.spyParamForTest(testID)}" style="color:${success ? 'green' : 'red'}">${testID}</a>
			<span> ${duration}mSec</span> 
			${coveredTests}
			<a class="test-button" href="javascript:jb.test.goto_editor('${testID}','${repo||''}')">src</a>
			<a class="test-button" href="${studioUrl}">studio</a>
			<a class="test-button" href="javascript:jb.test.profileSingleTest('${fullTestId}')">profile</a>
			<span>${reason||''}</span>
			</div>`;
	},
	updateTestHeader(topElem,{success_counter,fail_counter,usedJSHeapSize,startTime}) {
		topElem.querySelector('#success-counter').innerHTML = ', success ' + success_counter;
		topElem.querySelector('#fail-counter').innerHTML = 'failures ' + fail_counter;
		topElem.querySelector('#fail-counter').style.color = fail_counter ? 'red' : 'green';
		topElem.querySelector('#fail-counter').style.cursor = 'pointer';
		topElem.querySelector('#memory-usage').innerHTML = ', ' + usedJSHeapSize + 'M memory used';
		topElem.querySelector('#time').innerHTML = ', ' + (new Date().getTime() - startTime) +' mSec';
	}
})

component('source.testsResults', {
  type: 'rx<>',
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()}
  ],
  impl: source.remote({
    rx: rx.pipe(
      source.data('%$tests%'),
	  rx.var('fullTestId','test<>%%'),
      rx.var('testID'),
      rx.concatMap(
        source.merge(
          source.data(obj(prop('id', '%%'), prop('started', 'true'))),
          rx.pipe(source.promise(({},{testID,fullTestId}) => jb.test.runSingleTest(testID,{fullTestId})))
        )
      )
    ),
    jbm: '%$jbm%'
  })
})

component('tests.batchRunner', {
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()}
  ],
  impl: pipe(rx.pipe(source.testsResults('%$tests%', '%$jbm%')))
})

component('tests.runner', {
  type: 'action<>',
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'rootElemId', as: 'string'}
  ],
  impl: runActions(
    Var('rootElem', ({},{},{rootElemId}) => jb.frame.document.getElementById(rootElemId)),
    ({},{rootElem},{tests}) => rootElem.innerHTML = `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`,
    rx.pipe(
      source.testsResults('%$tests%', '%$jbm%'),
      rx.resource('acc', () => ({ index: 0, success_counter: 0, fail_counter: 0, startTime: new Date().getTime() })),
      rx.var('testID', '%id%'),
      rx.do(({data},{acc, testID, rootElem}) => {
				rootElem.querySelector('#progress').innerHTML = `<div id=${testID}>${acc.index++}: ${testID} ${data.started?'started':'finished'}</div>`
				if (!data.started) {
					data.success ? acc.success_counter++ : acc.fail_counter++;
					jb.test.addHTML(rootElem, jb.test.testResultHtml(data))
					jb.test.updateTestHeader(rootElem,acc)
				}
			}),
      sink.action(()=>{})
    )
  )
})

component('test', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'},
    {id: 'repo', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', true), plugins('testing,probe-preview,tree-shake,tgp,workspace'), {
    pluginPackages: [
      defaultPackage(),
      jbStudioServer('%$repo%')
    ]
  })
})

component('tester.runTestsOfPlugin', {
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'tests', as: 'array', description: 'empty means all'},
  ],
  impl: async (ctx,plugin,test) => {
	const tests = jb.entries(jb.comps)
		.filter(([id,comp]) => comp.$plugin == plugin+'-tests' && jb.utils.dslType(id) == 'test' && comp.type != 'test')
		.filter(([id,comp]) => jb.path(comp,'impl.$') != 'browserTest').map(([id]) => id)
	const testResults = []
	await tests.reduce(async (pr,testID) => {
		await pr
		console.log(`starting test ${testID}`)
		const res = await jb.test.runSingleTest(testID)
		console.log(`test ${testID} ${res.success}`)
		testResults.push(res)
	}, Promise.resolve())
	testResults.forEach(t=>delete t.show)
	return { tests, testResults }
  }
})

component('testServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'repo', as: 'string'}
  ],
  impl: sourceCode(plugins('%$plugin%,%$plugin%-tests,testing'), {
    pluginPackages: [
      defaultPackage(),
      jbStudioServer('%$repo%')
    ]
  })
})

component('testServer.runTestsOfPlugin', {
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'tests', as: 'array', description: 'empty means all'},
  ],
  impl: remote.data(tester.runTestsOfPlugin('%$plugin%','%$test%'), cmd(testServer('%$plugin%'),{doNotStripResult: true}))
})

component('pluginTest.common', {
	doNotRunInTests: true,
	impl: dataTest(tester.runTestsOfPlugin('common'), equals('1,2'))
})

component('testServer.ui', {
	doNotRunInTests: true,
	impl: dataTest(testServer.runTestsOfPlugin('ui'), equals('1,2'))
})

component('PROJECTS_PATH', { passiveData : '/home/shaiby/projects' // 'c:/projects' 
})
});

jbLoadPackedFile({lineInPackage:9490, jb, noProxies: false, path: '/plugins/testing/location-dsl-for-testing.js',fileDsl: 'location', pluginId: 'testing' }, 
            function({jb,require,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,pipeline,nameOfCity,phones,dataTest,source,tests,test,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('location')
extension('location', 'main', {
  typeRules: [ { same: ['data<location>','data<>']} ]
})

component('city', {
  type: 'settlement',
  params: [
    {id: 'name', as: 'string'}
  ]
})

component('village', {
  type: 'settlement',
  params: [
    {id: 'name', as: 'string'}
  ]
})

component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'settlement'},
    {id: 'cities', type: 'settlement[]'}
  ]
})

component('israel', {
  impl: state(jerusalem(), { cities: [eilat(), city('Tel Aviv')] })
})

component('israel2', {
  impl: state()
})

component('jerusalem', {
  impl: city('Jerusalem')
})

component('eilat', {
  impl: city('Eilat')
})

component('nokdim', {
  impl: village('Nokdim')
})

component('pipeline', {
  params: [
    {id: 'checkNameOverride'},
    {id: 'state', type: 'state'},
  ],
  impl: village()
})

component('nameOfCity', {
  type: 'data<>',
  params: [
    {id: 'city', type: 'settlement'}
  ],
  impl: '%$city/name%'
})

});

jbLoadPackedFile({lineInPackage:9557, jb, noProxies: false, path: '/plugins/testing/phones-tests-data.js',fileDsl: '', pluginId: 'testing' }, 
            function({jb,require,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,pipeline,nameOfCity,phones,dataTest,source,tests,test,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,list,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,assign,extendWithObj,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,If,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
component('phones', 
})
});

jbLoadPackedFile({lineInPackage:9564, jb, noProxies: false, path: '/plugins/zui/zui-card.js',fileDsl: '', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {

});

jbLoadPackedFile({lineInPackage:9569, jb, noProxies: false, path: '/plugins/zui/zui-control.js',fileDsl: '', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
extension('zui','control' , {
    initExtension() { return {  fCounter: 0, cmpCounter: 1,  } },
    typeRules: [
        { isOfWhenEndsWith: ['feature<zui>','feature<zui>'] },
        { isOfWhenEndsWith: ['style<zui>',['feature<zui>', 'style<zui>' ]] }
    ],    
    ctrl(origCtx,featuresProfile) {
        const ctxBefore = origCtx.setVars({ $model: { ctx: origCtx, ...origCtx.params} })
        const cmp = new jb.zui.BeComp(ctxBefore)
        const ctx = ctxBefore.setVars({cmp})
        cmp.ctx = ctx
        applyFeatures(featuresProfile)
        applyFeatures(origCtx.params.style && origCtx.params.style(ctx))
        jb.path(ctx.params.features,'profile') && applyFeatures(ctx.params.features(ctx), 10)
        cmp.applyFeatures = applyFeatures
        return cmp

        function applyFeatures(featuresProfile, priority = 0) {
            if (!featuresProfile) return cmp
            if (typeof featuresProfile != 'object')
                jb.logError('zui comp: featuresProfile should be an object',{featuresProfile,ctx})
            const feature = featuresProfile.$ ? ctx.run(featuresProfile, 'feature<>') : featuresProfile
            if (Array.isArray(feature)) {
                feature.forEach(f=>applyFeatures(f,priority))
                return cmp
            }

            const categories = jb.zui.featureCategories || (jb.zui.featureCategories = {
                lifeCycle: new Set('init,extendCtx,extendChildrenCtx,destroy'.split(',')),
                arrayProps: new Set('calcProp,frontEndMethod,frontEndVar,css,cssClass,layoutProp'.split(',')),
                singular: new Set('calcMoreItemsData,zoomingSize,zoomingCss,styleParams,children,html,htmlOfItem'.split(',')),
            })
    
            Object.keys(feature).filter(key=>key!='srcPath').forEach(key=>{
                if (typeof feature[key] == 'function')
                    Object.defineProperty(feature[key], 'name', { value: key })
                if (feature.srcPath) feature[key].srcPath = feature.srcPath
                feature[key].priority = Math.max(feature[key].priority || 0, priority)
    
                if (categories.lifeCycle.has(key)) {
                    cmp[key+'Funcs'] = cmp[key+'Funcs'] || []
                    cmp[key+'Funcs'].push(feature[key])
                } else if (categories.arrayProps.has(key)) {
                    cmp[key] = cmp[key] || []
                    cmp[key].push(feature[key])
                } else if (categories.singular.has(key)) {
                    cmp[key] && jb.logError(`zui applyFeatures - redefine singular feature ${key}`, {feature, ctx})
                    cmp[key] = feature[key] || cmp[key]
                } else {
                    jb.logError(`zui applyFeatures - unknown feature ${key}`, {feature, ctx})
                }
            })
    
            applyFeatures(feature.featuresOptions,priority)
            return cmp
        }
    },
    BeComp : class BeComp {
        constructor(ctx) {
            this.id = '' + jb.zui.cmpCounter++
            this.title = `${ctx.profile.$}-${this.id}`
            this.clz = this.title
        }
        init(settings) {
            Object.assign(this,settings || {}) 
            const sortedExtendCtx = (this.extendCtxFuncs || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            this.ctx = sortedExtendCtx.reduce((accCtx,extendCtx) => jb.utils.tryWrapper(() => 
                extendCtx.setVar(accCtx),'extendCtx',this.ctx), this.ctx)
            this.props = {}
            this.calcCtx = this.ctx.setVars({$props: this.props })
            const { inZoomingGrid, renderRole } = this.ctx.vars
            ;['inZoomingGrid', 'renderRole'].forEach(p=>this[p]=this.ctx.vars[p])

            const sortedInit = (this.initFuncs || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            sortedInit.forEach(init=>jb.utils.tryWrapper(() => init.action(this.calcCtx),'init', this.ctx))
            
            // assign all layout props directly into cmp
            this.layoutProps = (this.layoutProp||[]).reduce((acc,obj) => ({...acc,...obj}), {})
            //Object.assign(this, this.zoomingSize || {}, this.layoutProps, {zoomingSizeProfile: jb.path(this.zoomingSize,'profile')})
            this.zoomingSizeProfile = jb.path(this.zoomingSize,'profile')
            const childrenCtx = (this.extendChildrenCtxFuncs || []).reduce((accCtx,extendChildrenCtx) => jb.utils.tryWrapper(() => 
                extendChildrenCtx.setVar(accCtx),'extendChildrenCtx',this.ctx), this.ctx)

            if (!Array.isArray(this.children) && this.children)
                this.children = this.children(childrenCtx).map(cmp =>cmp.init())

            return this
        }
        descendantsTillGrid() {
            return (this.children||[]).filter(cmp=>!cmp.extendedPayloadWithDescendants).reduce((acc,cmp) => [...acc,cmp,...cmp.descendantsTillGrid()], [])
        }
        allDescendants() {
            return (this.children||[]).reduce((acc,cmp) => [...acc,cmp,...cmp.allDescendants()], [])
        }
        valByScale(pivotId,item) {
            return this.pivot.find(({id}) => id == pivotId).scale(item)
        }
        
        async calcPayload(vars) {
            if (this.ctx.probe && this.ctx.probe.outOfTime) return {}
            if (!this.props)
                return jb.logError(`glPayload - cmp ${this.title} not initialized`,{cmp: this, ctx: cmp.ctx})
            if (this.enrichPropsFromDecendents)
                vars = {...vars, ...await this.enrichPropsFromDecendents(this.descendantsTillGrid())}
            if (this.enrichCtxFromDecendents)
                vars = {...vars, ...await this.enrichCtxFromDecendents(this.descendantsTillGrid()) }

            const ctxToUse = vars ? this.calcCtx.setVars(vars) : this.calcCtx
            ;[...(this.calcProp || []),...(this.method || [])].forEach(p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))    
            const sortedProps = (this.calcProp || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            await sortedProps.reduce((pr,prop)=> pr.then(async () => {
                    const val = jb.val( await jb.utils.tryWrapper(async () => 
                        prop.value.profile === null ? ctxToUse.vars.$model[prop.id] : await prop.value(ctxToUse),`prop:${prop.id}`,this.ctx))
                    const value = val == null ? prop.defaultValue : val
                    Object.assign(this.props, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
                }), Promise.resolve())
            Object.assign(this.props, this.styleParams)
            
            const methods = (this.method||[]).map(h=>h.id).join(',')
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(ctxToUse))]))
            const noOfItems = (ctxToUse.vars.items||[]).length

            const zoomingCssProfile = jb.path(this.zoomingCss,'profile')
            this.calcHtmlOfItem = item => this.htmlOfItem ? this.htmlOfItem(ctxToUse.setVars({item}).setData(item)) : ''
            const html = this.html && this.html(ctxToUse)
            const css = (this.css || []).flatMap(x=>x(ctxToUse))

            const { id , title, layoutProps, inZoomingGrid, renderRole, zoomingSizeProfile, topOfWidget, clz } = this
            let res = { id, title, frontEndMethods, frontEndVars, topOfWidget, noOfItems, methods, zoomingCssProfile,  html, css, clz,
                zoomingSizeProfile, layoutProps, inZoomingGrid, renderRole }
            if (JSON.stringify(res).indexOf('null') != -1)
                jb.logError(`cmp ${this.title} has nulls in payload`, {cmp: this, ctx: this.ctx})
            if (this.children)
                res.childrenIds = this.children.map(({id})=>id).join(',')

            return this.extendedPayloadWithDescendants ? this.extendedPayloadWithDescendants(res,this.descendantsTillGrid()) : res
        }
        runBEMethod(method, data, vars, options = {}) {
            const {doNotUseUserReqTx, dataMethod, userReqTx} = options
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars,doNotUseUserReqTx, dataMethod, userReqTx})
            const tActions = (this.method||[]).filter(h=> h.id == method).map(h => ctx => {
                const _vars = { ...vars, userReqTx: userReqTx || (!doNotUseUserReqTx && ctx.vars.userReqTx) }
                this.runMethodObject(h,data,_vars)
                userReqTx && userReqTx.complete(`method ${method}`)                        
            })
            if (dataMethod && tActions[0])
                return this.runMethodObject((this.method||[]).filter(h=> h.id == method)[0],data,vars)

            const tx = this.calcCtx.vars.userReqTx
            if (tx)
                tx.completeByChildren(tActions, this.calcCtx)
            else
                tActions.forEach(action => action(this.calcCtx))
    
            if (tActions.length == 0)
                jb.logError(`no method ${method} in cmp`, {cmp: this, data, vars})
        }
        runMethodObject(methodObj,data, vars) {
            return methodObj.ctx.setData(data).setVars({
                cmp: this, $props: this.props, ...vars, ...this.newVars, $model: this.calcCtx.vars.$model
            }).runInner(methodObj.ctx.profile.action,'action','action')
        }
    }
})
});

jbLoadPackedFile({lineInPackage:9738, jb, noProxies: false, path: '/plugins/zui/zui-features.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('prop', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty, value is taken from model'},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
    {id: 'defaultValue'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.zui.fCounter++}, srcPath: ctx.path})
})

component('init', {
  type: 'feature',
  category: 'lifecycle',
  description: 'activated after variables and before calc properties',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10}
  ],
  impl: ctx => ({ init: { ... ctx.params, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('props', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({ calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.zui.fCounter++ } , srcPath: ctx.path})
})

component('variable', {
  type: 'feature',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'phase', as: 'number', defaultValue: 10 }
  ],
  impl: (ctx, name, value, phase) => ({ extendCtx: {setVar: ctx => ctx.setVar(name,jb.val(value(ctx))), phase, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('variableForChildren', {
  type: 'feature',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'phase', as: 'number', defaultValue: 10}
  ],
  impl: (ctx, name, value, phase) => ({ extendChildrenCtx: {setVar: ctx => ctx.setVar(name,jb.val(value(ctx))), phase, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('features', {
  type: 'feature',
  moreTypes: 'style',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', typeAsParent: t=>t.replace(/style/,'feature'), composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

component('method', {
  type: 'feature',
  description: 'define backend event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'if using the pattern onXXHandler, or onKeyXXHandler automaticaly binds to UI event XX, assuming on-XX:true is defined at the template'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({method: {id, ctx}, srcPath: ctx.path})
})

component('If', {
  type: 'feature',
  description: 'conditional feature, define feature if then else condition',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'feature', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'feature', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
})

component('html', {
  type: 'feature',
  params: [
    {id: 'html', mandatory: true, dynamic: true, as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,html) => ({html})
})

component('htmlOfItem', {
  type: 'feature',
  params: [
    {id: 'html', mandatory: true, dynamic: true, as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,htmlOfItem) => ({htmlOfItem})
})

component('css', {
  type: 'feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'array', newLinesInCode: true}
  ],
  impl: (ctx,css) => ({css})
})

component('zoomingCss', {
  type: 'feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'array', newLinesInCode: true}
  ],
  impl: (ctx,zoomingCss) => ({ frontEndMethod: { method: 'zoomingCss', path: ctx.path, action: zoomingCss.profile} })
})

component('frontEnd.init', {
  type: 'feature',
  category: 'front-end',
  description: 'initializes the front end, mount, component did update. runs after props',
  params: [
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: (ctx,action,phase) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile, phase} })
})

component('frontEnd.prop', {
  type: 'feature',
  category: 'front-end',
  description: 'assign front end property (calculated using the limited FE context). runs before init',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id,value) => ({ frontEndMethod: { method: 'calcProps', path: ctx.path, _prop: id,
      action: (_ctx,{cmp}) => cmp[id] = value(_ctx) } })
})

component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params , srcPath: ctx.path})
})

component('frontEnd.method', {
  type: 'feature',
  category: 'front-end',
  description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
  params: [
    {id: 'method', as: 'string'},
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init methods can register many times'},
  ],
  impl: (ctx,method,action,phase) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile, phase} })
})

component('frontEnd.flow', {
  type: 'feature',
  category: 'front-end',
  description: 'rx flow at front end',
  params: [
    {id: 'elems', type: 'rx<>[]', as: 'array', dynamic: true, mandatory: true, templateValue: []},
    {id: 'phase', as: 'number', defaultValue: 20},
  ],
  impl: (ctx, elems, phase) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, _flow: elems.profile, phase,
      action: { $: 'action<>rx.pipe', elems: _ctx => elems(_ctx) }
    }})
})

component('source.frontEndEvent', {
  type: 'rx<>',
  category: 'source',
  description: 'assumes cmp in context',
  params: [
    {id: 'event', as: 'string', options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'selector', as: 'string', description: 'optional including the elem', byName: true}
  ],
  impl: rx.pipe(
    source.event('%$event%', '%$cmp.base%', { selector: '%$selector%' }),
    rx.takeUntil('%$cmp.destroyed%')
  )
})



});

jbLoadPackedFile({lineInPackage:9937, jb, noProxies: false, path: '/plugins/zui/zui-group.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('group', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('group', {
  type: 'group-style',
  impl: features(
    children('%$$model/controls()%'),
    '%$$model/layout%',
  )
})

component('allOrNone', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { allOrNone: true } })
})

component('firstToFit', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { firstToFit: true } })
})

component('children', {
  type: 'feature',
  params: [
    {id: 'children', as: 'array', dynamic: true}
  ],
  impl: (ctx,children) => ({children})
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  1 }})
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  0 }})
})
});

jbLoadPackedFile({lineInPackage:9998, jb, noProxies: false, path: '/plugins/zui/zui-itemlist.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('itemlist', {
  type: 'control',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true, defaultValue: spiral()},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: grid()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('grid', {
  type: 'itemlist-style',
  impl: features(
    variable('items', '%$$model/items()%'),
    variable('itemsLayout', '%$$model/itemsLayout()%'),
    frontEnd.var('gridSize', '%$itemsLayout/gridSize%'),
    frontEnd.var('itemsXyPos', ({},{items}) => items.map(i=>i.xyPos)),
    frontEnd.var('initialZoomCenter', ['%$itemsLayout/initialZoom%','%$itemsLayout/center%']),
    variable('inZoomingGrid', true),
    html((ctx,{cmp}) => `<div class="zui-items ${cmp.clz}">`),
    css('.%$cmp.clz% {position: relative; width: 100%; height: 100%}'),
    zui.canvasZoom(),
    init((ctx,{cmp, itemsLayout, widget, $model}) => {
      const ctxForChildren = ctx.setVars({renderRole: 'zoomingGridElem', itemlistCmp: cmp}) // variableForChildren does not work with init
      cmp.children = [$model.itemControl(ctxForChildren).init()]
      cmp.extendedPayloadWithDescendants = async (res,descendants) => {
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {shownCmps} = layoutCalculator.calcItemLayout(itemsLayout.itemSize, ctx)
        const pack = { [res.id]: res }
        await descendants.filter(cmp=>!cmp.dynamicFlowElem).reduce((pr,cmp)=>pr.then(async ()=> {
          const { id , title, layoutProps, zoomingSizeProfile } = cmp

          pack[id] = cmp.children || shownCmps.indexOf(id) != -1 ? await cmp.calcPayload()
              : {id, title, zoomingSizeProfile, layoutProps, notReady: true } 
        }), Promise.resolve())
        return pack
      }
    }),
    frontEnd.init((ctx,{cmp,widget,initialZoomCenter}) => {
      widget.state.zoom = widget.state.tZoom = initialZoomCenter[0]
      widget.state.center = widget.state.tCenter = initialZoomCenter[1]
    }),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize,widget,itemsXyPos}) => {
      const center = widget.state.center, canvasSize = widget.canvasSize
      jb.zui.setCss(`sizePos-${cmp.clz}`, [ // todo - move to vars
        `.${cmp.clz} .zui-item { width: ${itemSize[0]}px; height: ${itemSize[1]}px }`,
        ...itemsXyPos.map(xyPos => {
          const pos = xyPos.map((v,axis)=>(v- center[axis]+1)*itemSize[axis]+ canvasSize[axis]/2)
          const visible = pos[0]+itemSize[0] > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1] > 0 && pos[1] <= canvasSize[1]
          return `.${cmp.clz} .pos_${xyPos.join('-')} { ${visible ? `top: ${canvasSize[1] - pos[1]}px; left: ${pos[0]}px` : 'display:none'} }`
        })].join('\n')
      )
    }),
    frontEnd.method('buildLayoutCalculator', (ctx,{cmp,widget}) => {
      cmp.layoutCalculator = jb.zui.initLayoutCalculator(buildNode(cmp.id,0))

      function buildNode(id) {
        const cmpData = widget.cmpsData[id]
        const zoomingSize = cmpData.zoomingSizeProfile ? ctx.run(cmpData.zoomingSizeProfile) : {}
        const layoutProps = cmpData.layoutProps || {}
        const children = cmpData.childrenIds && cmpData.childrenIds.split(',').map((ch,i)=>buildNode(ch,i))
        return { id, children, zoomingSize, layoutProps, title: cmpData.title}
      }
    }),
    frontEnd.flow(
      source.animationFrame(),
      rx.flatMap(source.data('%$cmp.animationStep()%')),
      rx.do(({},{widget}) => widget.renderCounter++),
      //rx.var('itemSize', (ctx,{widget}) => [0,1].map(axis=>widget.canvasSize[0]/widget.state.zoom)),
      sink.action('%$widget.renderCmps()%')
    ),
    frontEnd.method('render', (ctx,{cmp,widget}) => {
      const itemSize = [0,1].map(axis=>widget.canvasSize[0]/widget.state.zoom)
      const {shownCmps, elemsLayout} = cmp.layoutCalculator.calcItemLayout(itemSize,ctx)
      widget.cmpsData[cmp.id].itemLayoutforTest = {shownCmps, elemsLayout}
      const toRender = Object.values(widget.cmps).filter(cmp=>shownCmps.indexOf(cmp.id) != -1)
      const notReady = toRender.filter(cmp=>cmp.notReady).map(cmp=>cmp.id)
      if (notReady.length) 
        widget.beProxy.beUpdateRequest(notReady)
      jb.log('zui itemlist render',{elemsLayout, shownCmps, toRender, notReady, ctx})
      if (!widget.canvas.querySelector(`.${cmp.clz}`)) widget.canvas.appendChild(cmp.el)
      const itemlistCmp = cmp
      const ctxWithItemSize = ctx.setVars({itemSize})
      itemlistCmp.zoomingCss && itemlistCmp.zoomingCss(ctxWithItemSize)
      Object.values(widget.cmps).filter(cmp=>cmp.el && cmp.renderRole == 'zoomingGridElem')
        .forEach(cmp=> cmp.el.style.display = shownCmps.indexOf(cmp.id) == -1 ? 'none' : 'block')
      toRender.filter(cmp=>!cmp.notReady)
          .forEach(cmp=>widget.renderCmp(cmp,ctx.setVars({itemlistCmp, itemSize, elemLayout: elemsLayout[cmp.id]})))
    })
  )
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => jb.zui.spiral(pivot,ctx)
})

component('zoomingGridElem', {
  type: 'feature',
  params: [],
  impl: features(
    html((ctx,{cmp,items}) => `<div class="${cmp.clz}">
  ${items.map(item=>`<div class="zui-item pos_${item.xyPos.join('-')}">${cmp.calcHtmlOfItem(item)}</div>`).join('\n')}
</div>`),
    css(`.%$cmp.clz% {width: 100%; height: 100%}
        .%$cmp.clz%>.zui-item {overflow: hidden; text-overflow: ellipsis; pointer-events: none; position: absolute; border1: 1px solid gray}`)
  )
})
});

jbLoadPackedFile({lineInPackage:10117, jb, noProxies: false, path: '/plugins/zui/zui-icon-box.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('iconBox', {
  type: 'control',
  params: [
    {id: 'abrv', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'iconBox-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('card', {
  type: 'control',
  params: [
    {id: 'title', dynamic: true, as: 'string', mandatory: true},
    {id: 'description', dynamic: true, as: 'string', mandatory: true},
    {id: 'style', type: 'card-style', dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})


});

jbLoadPackedFile({lineInPackage:10145, jb, noProxies: false, path: '/plugins/zui/zui-items-layout.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('xyByProps', {
  type: 'grid_pivot',
  params: [
    {id: 'xAtt', as: 'string', defaultValue: 'x'},
    {id: 'yAtt', as: 'string', defaultValue: 'y'},
    {id: 'normalized', as: 'boolean', type: 'boolean<>'},
  ],
  impl: (ctx,xAtt,yAtt,normalized) => {
    const {items,gridSize } = ctx.vars
    ;[xAtt,yAtt].forEach((att,axis)=>{
      const numericAtt = `n_${att}`
      items.forEach(item => item[numericAtt] = +item[att])
      items.sort((i1,i2) => +i1[numericAtt] - +i2[numericAtt])
      const from = normalized ? items[0][numericAtt] : 0
      const range = normalized ? ((items[items.length-1][numericAtt] - from) || 1) : gridSize[axis]
      items.forEach(item => item[`scale_${att}`] = (item[numericAtt] - from) / range)
    })
//    const spaceFactor = 0.999
    return {
        scaleX: item => item[`scale_${xAtt}`],
        scaleY: item => item[`scale_${yAtt}`]
    }
  }
})

component('xyByIndex', {
  type: 'grid_pivot',
  params: [
  ],
  impl: ctx => {
    const {items}  = ctx.vars
    const dim = Math.ceil(Math.sqrt(items.length))
    items.map((item,i) => {item.x = (i % dim)/dim; item.y = Math.floor(i / dim)/dim })
    const spaceFactor = 0.999
    return {
      scaleX: item => item.x/dim,
      scaleY: item => item.y/dim
    }
  }
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => {
    const { items, canvasSize } = ctx.vars
    const numericAtt = `n_${pivot}`
    items.forEach(item => (item[numericAtt] = +item[pivot]))
    items.sort((i1, i2) => i1[numericAtt] - i2[numericAtt])

    const aspectRatio = canvasSize[0] / canvasSize[1]
    const itemsPerRow = Math.ceil(Math.sqrt(items.length / aspectRatio))
    const gridSize = [itemsPerRow,Math.ceil(items.length / itemsPerRow)]
    const center = [0, 1].map(axis => Math.floor(gridSize[axis] / 2))
    let x = center[0], y = center[1]
    let step = 1 // Step size
    let direction = 0 // 0 = right, 1 = down, 2 = left, 3 = up
    let stepsRemaining = 1 // Number of items to place in the current direction

    items.forEach(item => {
        item.xyPos = [x, y]
        if (direction === 0) x++
        else if (direction === 1) y++
        else if (direction === 2) x--
        else if (direction === 3) y--

        stepsRemaining--
        if (stepsRemaining === 0) {
            direction = (direction + 1) % 4 // Change direction
            if (direction === 0 || direction === 2) step++ // Increase step size every two turns
            stepsRemaining = step
        }
    })
    
    const initialZoom = Math.max(...gridSize)
    const itemSize = [0, 1].map(axis => canvasSize[axis] / initialZoom) // Item size in canvas units
    return { initialZoom, center, gridSize, itemSize }
  }
})

component('groupByScatter', {
  type: 'items_layout',
  params: [
    {id: 'groupBy', as: 'string', description: 'property used for grouping'},
    {id: 'sort', as: 'string', description: 'property used for sorting inside group', byName: true},
    {id: 'groupGap', as: 'number', defaultValue: 1}
  ],
  impl: (ctx, groupBy, sortAtt, groupGap) => {
    const { items, canvasSize } = ctx.vars
    const groups = {}
    if (sortAtt) {
      const numericAtt = `n_${sortAtt}`
      items.forEach(item => (item[numericAtt] = +item[sortAtt]))
      items.sort((i1, i2) => i1[numericAtt] - i2[numericAtt])
    }
    items.forEach(item => {
      const groupKey = item[groupBy]
      groups[groupKey] = groups[groupKey] || []
      groups[groupKey].push(item)
    })

    const sortedGroups = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length)

    const groupCenters = [], groupLayouts = {}
    let gridBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }

    sortedGroups.forEach((groupKey, index) => {
      const groupItems = groups[groupKey]

      const itemsPerRow = Math.ceil(Math.sqrt(groupItems.length))
      const gridSize = [itemsPerRow, Math.ceil(groupItems.length / itemsPerRow)]
      const groupBoxSize = Math.max(...gridSize)
      let x = 0, y = 0

      if (index === 0) {
        x = 0
        y = 0
      } else {
        // Place subsequent groups around existing groups
        let placed = false
        for (const [cx, cy, otherSize] of groupCenters) {
          const candidates = [
            [cx + otherSize / 2 + groupBoxSize / 2 + groupGap, cy], // Right
            [cx - otherSize / 2 - groupBoxSize / 2 - groupGap, cy], // Left
            [cx, cy + otherSize / 2 + groupBoxSize / 2 + groupGap], // Top
            [cx, cy - otherSize / 2 - groupBoxSize / 2 - groupGap]  // Bottom
          ]

          for (const [candidateX, candidateY] of candidates) {
            const noOverlap = !groupCenters.some(([ox, oy, oSize]) => {
              const distance = Math.hypot(candidateX - ox, candidateY - oy)
              const combinedSize = (groupBoxSize + oSize) / 2 + groupGap
              return distance < combinedSize
            })
            if (noOverlap) {
              x = candidateX; y = candidateY; placed = true; break
            }
          }
          if (placed) break
        }

        if (!placed) {
          // If no valid position is found, expand the bounds and place
          x = gridBounds.maxX + groupBoxSize / 2 + groupGap
          y = gridBounds.maxY + groupBoxSize / 2 + groupGap
        }
      }

      gridBounds.minX = Math.min(gridBounds.minX, x - groupBoxSize / 2)
      gridBounds.maxX = Math.max(gridBounds.maxX, x + groupBoxSize / 2)
      gridBounds.minY = Math.min(gridBounds.minY, y - groupBoxSize / 2)
      gridBounds.maxY = Math.max(gridBounds.maxY, y + groupBoxSize / 2)

      groupCenters.push([x, y, groupBoxSize])
      groupLayouts[groupKey] = { gridSize, center: [x, y] }

      const center = [x,y].map((v,axis)=>Math.floor(v-gridSize[axis]/2))
      spiral(groupItems, center)
      // groupItems.forEach((item, idx) => {
      //   const pos = [idx % gridSize[0], Math.floor(idx / gridSize[0])]
      //   item.xyPos = [0,1].map(axis=>center[axis] + pos[axis])
      // })
    })


    items.forEach(item => item.xyPos = [item.xyPos[0] -gridBounds.minX, item.xyPos[1] -gridBounds.minY])
    const gridSize = [gridBounds.maxX - gridBounds.minX, gridBounds.maxY - gridBounds.minY]
    const center = [0, 1].map(axis => Math.floor(gridSize[axis] / 2))
    const initialZoom = Math.max(...gridSize)
    const itemSize = [0, 1].map(axis => canvasSize[axis] / initialZoom)
    return { initialZoom, center, gridSize, itemSize }

    function spiral(groupItems, center) {
      let x = center[0], y = center[1]
      let step = 1 // Step size
      let direction = 0 // 0 = right, 1 = down, 2 = left, 3 = up
      let stepsRemaining = 1 // Number of items to place in the current direction
  
      groupItems.forEach(item => {
          item.xyPos = [x, y]
          if (direction === 0) x++
          else if (direction === 1) y++
          else if (direction === 2) x--
          else if (direction === 3) y--
  
          stepsRemaining--
          if (stepsRemaining === 0) {
              direction = (direction + 1) % 4 // Change direction
              if (direction === 0 || direction === 2) step++ // Increase step size every two turns
              stepsRemaining = step
          }
      })
    }
  }
})

extension('zui','gridItemsLayout', {
  gridItemsLayout({gridSize,xyPivots, initialZoom, center}, ctx) {
    const {scaleX, scaleY} = xyPivots(ctx.setVars({gridSize}))
    const [X,Y] = gridSize.length == 1 ? [gridSize,gridSize] : gridSize
    const {items, canvasSize} = ctx.vars
    if (!scaleX || !scaleY)
      return jb.logError('no xyPivots for position calculation',{scaleX, scaleY, ctx})

    const spaceFactor = 0.999
    const mat = Array(X*Y)
    items.forEach(item => {
      const [x,y] = [Math.floor(X*scaleX(item)*spaceFactor), Math.floor(Y*scaleY(item)*spaceFactor)]
      mat[X*y + x] = mat[X*y + x] || []
      mat[X*y + x].push(item)
      item._beforeRepulsion = [x,y].join(',') // for debug
    })      
    repulsion()
    Array.from(Array(X*Y).keys()).filter(i=>mat[i]).map(i=> {
      const item = mat[i][0]
      const [xPos,yPos] = item.xyPos = [i%X, Math.floor(i/Y)]
      item.xyPosStr = [xPos,yPos].join(',')
    })

    jb.log('zui gridItemsLayout',{mat})

    const itemSize = [0,1].map(axis=>canvasSize[axis]/initialZoom) // *gridSize[axis]))
    return { mat, initialZoom, center, gridSize: [X,Y], itemSize }

    function repulsion() {
        for (let i=0;i<X*Y;i++)
            if (mat[i] && mat[i].length > 1)
                spreadItems(i)

        function spreadItems(i) {
            const items = mat[i]
            mat[i] = [items.pop()]
            const [x,y] = [i%X, Math.floor(i/Y)]

            for (const [_x,_y,distance] of areaIterator(x,y)) {
                if (! mat[X*_y+ _x]) {
                    mat[X*_y+ _x] = [items.pop()]
                    if (items.length == 0) return
                }
            }
        }    
    }

    function* areaIterator(x,y) {
        let distance = 2, tooFar = false
        while (!tooFar) {
            tooFar = true
            const n = noOfNeighbours(distance)
            for(_w=0;_w<n;_w++) {
                const w = _w*2*3.14/n || 0.001
                const nx = x + floor(distance*(Math.cos(w))), ny = y + floor(distance*(Math.sin(w)))
                if (nx > -1 && nx < X && ny > -1 && ny < Y) {
                    tooFar = false
                    yield [nx,ny,distance]
                }
            }
            distance++
        }
        function noOfNeighbours(distance) {
            return 4*distance
        }
        function floor(num) {
            return Math.sign(num) == -1 ? Math.floor(num+1) : Math.floor(num)
        }
    }
  }
})
});

jbLoadPackedFile({lineInPackage:10420, jb, noProxies: false, path: '/plugins/zui/zui-llm.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')
using('llm-api')

component('session', {
  type: 'session',
  params: [
    {id: 'query', as: 'string'},
    {id: 'contextCrums', as: 'array'},
    {id: 'budget', type: 'budget'},
    {id: 'usage', type: 'usage' }
  ]
})

component('zui.itemsFromLlm', {
  params: [
    {id: 'session', type: 'session' },
    {id: 'exampleItem', type: 'item-data' },
    {id: 'titles', as: 'array' },
    {id: 'llmModel', type: 'llm_model'}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system. presenting items.
      Based on the following **query**: "%$query%"
      return a list of 2 **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
    ---
         provide the response as javascript array of strings            
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('model', {
  type: 'llm_model',
  params: [
    {id: 'name', as: 'string'},
    {id: 'cost', as: 'number', description: '$/M tokens'},
    {id: 'reasoning', as: 'boolean', type: 'boolean<>'},
    {id: 'estimatedDuration', as: 'number', description: 'item/sec'}
  ]
})

component('o1', {
  type: 'llm_model',
  impl: model('o1-preview', 60, { reasoning: true, estimatedDuration: 50 })
})
component('o1-mini', {
  type: 'llm_model',
  impl: model('o1-mini', 20, { reasoning: true, estimatedDuration: 20 })
})
component('gpt35', {
  type: 'llm_model',
  impl: model('gpt-3.5-turbo-0125', 20, { estimatedDuration: 20 })
})

component('zui.smartMetadata', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system. presenting items.
      Based on the following **query**: "%$query%"
      return a list of 2 **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
    ---
         provide the response as javascript array of strings            
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartMetaIconLevel', {
  params: [
    //{id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are LLM prompt expert, helping building a Zoomable User Interface (ZUI) system. presenting items.
      We need to build a prompt (or set of prompts) that based on artbitrary query in any domain will suggest the properties, and html/css templates 
        for the icon level of the zui system.
      The first zoomable level, called icon level, can grow from 8x8 to 64x64 pixels. it generaly uses item initialis, colors and shapers that reprenet the item.

      Please help to improve the prompt below or suggest a different prompt(s) for this purpose
      ----
      You are a both metadata discovery assistant and html/css developer working on a Zoomable User Interface (ZUI) system. presenting items.

      Now you are working on the first zoomable level. It can grow from 8x8 to 64x64 pixels. it generaly uses item initialis, colors and shapers that reprenet the item.
      The item width/height is set by the framework and can get any value in this range. the html/css can also be replaced according to levels. 
        yet can also keep the same html and change only the css, or define single css using relative(responsive) terms

      Based on the following **query**: "{{query}}"

      return a list of 5 **most relevant** metadata properties for **presenting** items of this type/category at the icon level
      1. provide sample data for 2 items,
      2. suggest levels (8,16,32,32), and html template, css, and data binding to the item. 
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartMetaCardLevel', {
  params: [
    //{id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are LLM prompt expert, helping building a Zoomable User Interface (ZUI) system. presenting items.
      We need to build a prompt (or set of prompts) that based on artbitrary query in any domain will suggest the properties, and html/css templates 
        for the icon level of the zui system.
      The second zoomable level, called card level, is 64x64 - 320*320 pixels. it usually uses item title, description, 4-8 properties and colors and shapes that represent the item.

      Please help to improve the prompt below or suggest a different prompt(s) for this purpose
      ----
      You are a both metadata discovery assistant and html/css developer working on a Zoomable User Interface (ZUI) system. presenting items.

      Now you are working on the second zoomable level. It can grow from 64x64 to 320x400 pixels. it usually uses item title, description, 4-8 properties and colors and shapes that represent the item.
      The item width/height is set by the framework and can get any value in this range. the html/css can also be replaced according to levels. 
        yet can also keep the same html and change only the css, or define single css using relative(responsive) terms

      Based on the following **query**: "{{query}}"

      return a list of 10 **most relevant** metadata properties for **presenting** items of this type/category at the card level
      provide sample data for 2 items,
      suggest html/css code in this format
      ---      
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    includeSystemMessages: true
  })
})

component('zui.smartIconCode', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user(`You are acting as both a metadata discovery assistant and an HTML/CSS developer working on a Zoomable User Interface (ZUI) system that presents items.
      ---
      ### **Task Overview:**
      Your task is to generate appropriate metadata properties and design elements for presenting items at the icon level of a ZUI system, based on a given query.
      ---
      ### **Icon Level Details:**
      - **Size Range:** The icon level can scale from **8x8 to 64x64 pixels**.
      - **Design Elements:** Icons generally use **item initials**, **colors**, and **shapes** that represent the item.
      - **Responsive Design:** The HTML/CSS can be adjusted according to different levels. You may:
        - Replace the HTML/CSS based on levels.
        - Keep the same HTML and modify only the CSS.
        - Define a single CSS using relative (responsive) units.
      ---
      ### **Instructions:**
      Based on the following **query**: **"%$query%"**
      Please perform the following steps:
      1. **Metadata Properties:**
         - Identify and list the **5 most relevant metadata properties** for presenting items of this type/category at the icon level.
      2. **Sample Data:**
         - Provide sample data for **2 example items**, using the identified metadata properties.
      3. **Design Suggestions:**
         - For icon sizes at **levels 8, 16, 32, and 64 pixels**, suggest:
           - **HTML Template**: Provide the minimal HTML structure for the icon.
           - **CSS Styles**: Provide the CSS styling for the icon, ensuring it is responsive to the different sizes.
           - **Data Binding**: Explain how the sample data binds to the HTML template (e.g., which data populates which part of the template).
      ---
      ### **Notes:**
      - **Simplicity:** Be concise and focus on elements that are visually meaningful at small icon sizes.
      - **Legibility:** Ensure that text and shapes remain clear and legible at all specified sizes.
      - **Representativeness:** Choose colors and shapes that effectively represent the items based on the query.
      - **Consistency:** Maintain a consistent design language across different icon sizes.
      `)
    ],
    model: 'o1-preview',
    maxTokens: 25000,
    //includeSystemMessages: true
  })
})

component('zui.firstItemsNames', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true},
    {id: 'noOfItems', as: 'number', defaultValue: 5}
  ],
  impl: llmViaApi.completions({
    chat: [
      system('You are a data provider for a Zoomable User Interface (ZUI) system'),
      user(`please provide the names of the first %$noOfItems% items for this query "%$query%" 
      --
      provide the response as javascript array of strings
      `)
    ],
    model: 'gpt-3.5-turbo-0125',
    maxTokens: 300
  })
})

component('zui.itemsShortDescription', {
  params: [
    {id: 'itemName', as: 'string' },
  ],
  impl: llmViaApi.completions({
    chat: [
      system('You are a data provider for a Zoomable User Interface (ZUI) system'),
      user(`please provide short description for this item "%$itemName%" in the context of this query "%$query%" 
      --
      provide the description as a javascript string with double quotes ""
      `)
    ],
    maxTokens: 300
  })
})

// user(`Based on the following **query**: "%$query%"
// ---
// return a list of 5-10 items with most relevant 5-10 properties in json lines format
// `)


component('zui.metadataForQuery', {
  params: [
    {id: 'query', as: 'string', newLinesInCode: true}
  ],
  impl: llmViaApi.completions({
    chat: [
      user('You are a metadata discovery assistant for a Zoomable User Interface (ZUI) system of items'),
      user(`**Task**: 
      Based on the following **query**: "%$query%"
      First decide what is the **item type** or **item category** resulting from this query
      Then, Return a list of the **most relevant** metadata properties for **positining** items of this type/category
         on x/y axes of a 2D canvas. For example: price/performance
            
      **Rules**: 
      - Provide 10-20 metadata fields that could apply to items resulting from this query. 
      - Each field must include: 
        - **name** (property name) 
        - **type** (string, number, date, boolean, array, or object) 
        - **example_value** (example of what the data might look like) 
        - **explanation**
        - **can_be_used_on_an_quantitive_axis**
        - **can_be_used_in_2D_clustering**
        - **priority_score** (score from 1-10, with 10 being the most useful for visualization) 
      - sort by can_be_used_on_an_quantitive_axis
      
      **Response format (JSON)**
      \`\`\`json
      {
        "item_type": "e.g. smart phone product",
        "fields": [
            {
            "name": "string (name of the property)",
            "type": "string, number, date, boolean, array, or object",
            "explanation": "string",
            "example_value": "example value for this property",
            "can_be_used_on_an_quantitive_axis": 1-10,
            "can_be_used_in_2D_clustering": 1-10,
            "priority_score": 1-10
            }
        ]
    }
      
      `)
    ],
    model: 'o1-preview',
    maxTokens: 1000
  })
})

// Then, Return a list of the most relevant metadata properties for **positining** items of this type/category
// on x/y axes of a 2D canvas. For example: price/performance



});

jbLoadPackedFile({lineInPackage:10707, jb, noProxies: false, path: '/plugins/zui/zui-scale.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('itemColor', {
  type: 'item_color',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: distinct10()}
  ],
  impl: (ctx,unitScale,colorScale) => ctx => {
        const index = Math.floor(unitScale(ctx.data) * colorScale.length *0.9999)
        const color = colorScale[index] ? colorScale[index] : 'white'
        return Array.isArray(color) ? `rgb(${color.join(',')})` : color
    }
})

component('colorByItemValue', {
  type: 'item_color',
  params: [
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'case', type: 'item_color_case[]'},
    {id: 'defaultColor', type: 'static_color', defaultValue: [255,255,255]}
  ],
  impl: (ctx,valF,cases,defaultColor) => {
    const casesHash = jb.objFromEntries(cases.map(x=>x.entry))
    return ctx => {
      const color = casesHash[valF(ctx)] || defaultColor
      return Array.isArray(color) ? `rgb(${color.join(',')})` : color
    }
  }
})

component('Case', {
  type: 'item_color_case',
  params: [
    {id: 'val', as: 'string', mandatory: true},
    {id: 'color', type: 'static_color'}
  ],
  impl: (ctx,val,color) => ({entry: [val,color]})
})

component('borderStyle', {
  type: 'item_border_style',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'borderStyleScale', mandatory: true, type: 'border_style_scale', defaultValue: borderStyleScale3()}
  ],
  impl: (ctx,unitScaleF,borderStyleScale) => {
    const unitScale = unitScaleF()
    return ctx => {
            const index = Math.floor(unitScale(ctx.data) * borderStyleScale.length *0.9999)
            return borderStyleScale[index] ? borderStyleScale[index] : 'solid'
        }
    }
})

component('borderStyleScale3', {
  type: 'border_style_scale',
  impl: () => ['solid','dashed','dotted']
})

component('opacity', {
  type: 'item_opacity',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'opacityScale', mandatory: true, type: 'opacity_scale', defaultValue: opacityScale()}
  ],
  impl: (ctx,unitScaleF,opacityScale) => {
    const unitScale = unitScaleF()
    return ctx => {
            const index = Math.floor(unitScale(ctx.data) * opacityScale.length *0.9999)
            return opacityScale[index] ? opacityScale[index] : 1
        }
    }
})

component('opacityScale', {
  type: 'opacity_scale',
  impl: () => [1.0,0.8,0.6,0.4,0.2]
})

component('symbol', {
  type: 'item_symbol',
  params: [
    {id: 'unitScale', mandatory: true, dynamic: true, type: 'unit_scale'},
    {id: 'symbolScale', mandatory: true, type: 'symbol_scale'}
  ],
  impl: (ctx,unitScaleF,symbolScale) => {
        const unitScale = unitScaleF()
        return ctx => {
            const index = Math.floor(unitScale(ctx.data) * symbolScale.length *0.9999)
            return symbolScale[index] ? symbolScale[index] : ''
        }
    }
})

component('symbolByItemValue', {
  type: 'item_symbol',
  params: [
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'case', type: 'item_symbol_case[]'}
  ],
  impl: (ctx,valF,cases) => {
    const casesHash = jb.objFromEntries(cases.map(x=>x.entry))
    return ctx => casesHash[valF(ctx)] || '❓'
  }
})

component('Case', {
  type: 'item_symbol_case',
  params: [
    {id: 'val', as: 'string', mandatory: true},
    {id: 'symbol', mandatory: true, as: 'string'}
  ],
  impl: (ctx,val,symbol) => ({entry: [val,symbol]})
})



component('list', {
  type: 'symbol_scale',
  params: [
    {id: 'list', type: 'data<>[]', as: 'array'}
  ],
  impl: '%$list%'
})

component('success3', {
  type: 'symbol_scale',
  impl: list('✔️', '➖', '❌')
})

component('unitScale', {
  type: 'unit_scale',
  params: [
    {id: 'att', as: 'string', defaultValue: 'index' },
    {id: 'calc', dynamic: true, description: 'optional. When empty, item property with same name is used'},
  ],
  impl: (ctx, _att, calc) => {
    const items = ctx.vars.items || []
    const att = `fixed_${_att}`
    items.forEach((item,i) => item[att] = calc.profile ? calc(ctx.setData(item)) : _att == 'index' ? i : +item[_att] )
    items.sort((i1,i2) => i1[att] - i2[att])
    const range = [items[0][att] || 0,items.slice(-1)[0][att] || 0]
    if (range[0] == range[1]) {
        jb.logError(`zui empty range for ${att}`,{ctx})
        return () => 0
    }
    return item=> ((+item[att] || 0)-range[0])/(range[1]-range[0])
  }
})

component('index', {
    type: 'unit_scale',
    impl: unitScale('index')
})

component('severity5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60], description: 'very bad' }, // Bright red
    { from: 0.2, color: [230, 126, 34], description: 'bad' },    // Orange
    { from: 0.4, color: [244, 208, 63], description: 'neutral' }, // Yellow
    { from: 0.6, color: [169, 223, 191], description: 'good' },   // Light green
    { from: 0.8, color: [46, 204, 113], description: 'very good' } // Bright green
  ]
})

component('good5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60], description: 'very bad' }, // Bright red
    { from: 0.2, color: [230, 126, 34], description: 'bad' },    // Orange
    { from: 0.4, color: [244, 208, 63], description: 'neutral' }, // Yellow
    { from: 0.6, color: [169, 223, 191], description: 'good' },   // Light green
    { from: 0.8, color: [46, 204, 113], description: 'very good' } // Bright green
  ]
})

component('success5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [192, 57, 43], description: 'failure' },  // Dark red
    { from: 0.25, color: [211, 84, 0], description: 'partial failure' }, // Dark orange
    { from: 0.5, color: [244, 208, 63], description: 'neutral' },// Yellow
    { from: 0.75, color: [40, 180, 99], description: 'success' },// Green
    { from: 1, color: [29, 131, 72], description: 'full success' } // Dark green
  ]
})

component('distinct5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] }, // Red
    { from: 0.2, color: [52, 152, 219] }, // Blue
    { from: 0.4, color: [46, 204, 113] }, // Green
    { from: 0.6, color: [241, 196, 15] }, // Yellow
    { from: 0.8, color: [155, 89, 182] }  // Purple
  ]
})

component('distinct10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [231, 76, 60] },  // Red
    { from: 0.1, color: [52, 152, 219] }, // Blue
    { from: 0.2, color: [46, 204, 113] }, // Green
    { from: 0.3, color: [241, 196, 15] }, // Yellow
    { from: 0.4, color: [155, 89, 182] }, // Purple
    { from: 0.5, color: [230, 126, 34] }, // Orange
    { from: 0.6, color: [26, 188, 156] }, // Teal
    { from: 0.7, color: [52, 73, 94] }, // Dark Gray
    { from: 0.8, color: [189, 195, 199] }, // Light Gray
    { from: 0.9, color: [142, 68, 173] }  // Violet
  ]
})

component('green10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [208, 240, 192] },  // Tea Green
    { from: 0.1, color: [152, 255, 152] }, // Mint Green
    { from: 0.2, color: [163, 230, 53] }, // Lime Green
    { from: 0.3, color: [119, 221, 119] }, // Pastel Green
    { from: 0.4, color: [46, 204, 113] }, // Bright Green
    { from: 0.5, color: [46, 204, 64] }, // Emerald Green
    { from: 0.6, color: [0, 255, 127] }, // Spring Green
    { from: 0.7, color: [46, 139, 87] }, // Sea Green
    { from: 0.8, color: [34, 139, 34] }, // Forest Green
    { from: 0.9, color: [0, 100, 0] }  // Dark Green
  ]
})

component('gray5', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [224, 224, 224] }, // Very Light Gray
    { from: 0.25, color: [189, 189, 189] }, // Light Gray
    { from: 0.5, color: [158, 158, 158] }, // Medium Gray
    { from: 0.75, color: [97, 97, 97] }, // Dark Gray
    { from: 1, color: [33, 33, 33] }  // Very Dark Gray
  ]
})

component('gray10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [245, 245, 245] }, // Very Light Gray
    { from: 0.1, color: [224, 224, 224] },
    { from: 0.2, color: [204, 204, 204] },
    { from: 0.3, color: [189, 189, 189] },
    { from: 0.4, color: [158, 158, 158] },
    { from: 0.5, color: [125, 125, 125] }, // Medium Gray
    { from: 0.6, color: [97, 97, 97] },
    { from: 0.7, color: [66, 66, 66] },
    { from: 0.8, color: [48, 48, 48] },
    { from: 0.9, color: [33, 33, 33] }  // Very Dark Gray
  ]
})

component('coolToWarm10', {
  type: 'color_scale',
  impl: () => [
    { from: 0, color: [44, 123, 182] }, // Deep Blue
    { from: 0.1, color: [83, 158, 204] }, // Blue
    { from: 0.2, color: [137, 196, 210] }, // Light Blue
    { from: 0.3, color: [171, 217, 233] }, // Very Light Blue
    { from: 0.4, color: [225, 238, 241] }, // Pale Cool
    { from: 0.5, color: [254, 224, 144] }, // Yellow
    { from: 0.6, color: [253, 174, 97] }, // Orange
    { from: 0.7, color: [244, 109, 67] }, // Light Red-Orange
    { from: 0.8, color: [215, 48, 39] }, // Red
    { from: 0.9, color: [165, 0, 38] }  // Deep Red
  ]
})

});

jbLoadPackedFile({lineInPackage:10986, jb, noProxies: false, path: '/plugins/zui/zui-layout.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('zoomingSize', {
  type: 'feature',
  params: [
    {id: 'size', type: 'zooming_size', mandatory: true},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'}
  ],
  impl: (ctx,size,priority) => ({ zoomingSize: { path: ctx.path + '~size', profile : size.profile, ...size, priority } })
})

component('fixed', {
  type: 'zooming_size',
  params: [
    {id: 'base', mandatory: true, as: 'array', defaultValue: [5,5]},
  ],
  impl: (ctx,base) => ({
      layoutRounds: 1,
      sizeNeeds: ({round, available }) => base,
      profile: { $$: 'zooming_size<zui>fixed', base }
  })
})

component('fill', {
  type: 'zooming_size',
  params: [
    {id: 'min', as: 'number', defaultValue: 1, byName: true}
  ],
  impl: (ctx,min) => ({
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => round ? available : [min,min],
      profile: { $$: 'zooming_size<zui>fill', min }
  })
})

extension('zui','layout', {
  initLayoutCalculator(layoutCalculator) {
    layoutCalculator.layoutProps.layoutAxis = layoutCalculator.layoutProps.layoutAxis || 0
    const axes = [0,1]
    const minRecords = axes.map(axis => calcMinRecord(layoutCalculator, axis).sort((r1,r2) => r1.p - r2.p))
    layoutCalculator.calcItemLayout = calcItemLayout
    setTopChildIndex(layoutCalculator, 0, 0)
    return layoutCalculator

    function setTopChildIndex(cmp, depth, topChildIndex) {
      cmp.topChildIndex = topChildIndex
      ;(cmp.children||[]).forEach((ch,i) => setTopChildIndex(ch,depth+1,depth ? topChildIndex : i))
    }

    function calcMinRecord(cmp, layoutAxis,minSize = 0) {
      if (!cmp.children) {
        return [{
          p: cmp.priority || 10000, id: cmp.id,
          axis: layoutAxis, title: cmp.title,
          min: Math.max(minSize, sizeNeeds(cmp, {round: 0, available:[0,0]})[layoutAxis]) }]
        }
      const minSizeForChildren = jb.asArray(cmp.minSize)[layoutAxis]
      return cmp.children.flatMap(childView => calcMinRecord(childView,layoutAxis,minSizeForChildren))
    }

    function sizeNeeds(cmp,args) {
      if (jb.path(cmp.zoomingSize,'sizeNeeds')) return cmp.zoomingSize.sizeNeeds(args)
      const { minWidth, minHeight } = cmp.layoutProps
      if (!minWidth || !minHeight)
        jb.logError(`missing size needs for cmp ${cmp.title}`,{cmp,ctx:cmp.ctx})
      return [minWidth, minHeight]
    }

    function calcItemLayout(itemSize, ctx) {
      const spaceSize = 10
      const elemsLayout = {}
      const topCmp = layoutCalculator

      // build data strucuture - TODO: recycle for better performance
      initSizes(topCmp)
      topCmp.sizeVec = axes.map(axis => buildSizeVec(topCmp,axis))

      const filteredOut = {}
      axes.map(axis => allocMinSizes(axis,itemSize))
      calcGroupsSize(topCmp)
      filterAllOrNone(topCmp)
      axes.map(axis => allocMinSizes(axis,itemSize))
      calcGroupsSize(topCmp)
      filterFirstToFit(topCmp)

      const shownCmps = calcShownViews(topCmp).sort((v1,v2) => (v1.priority || 10000) - (v2.priority || 10000))
      shownCmps.map(v=> {
        jb.path(elemsLayout,[v.id,'title'],v.title)
        jb.path(elemsLayout,[v.id,'visible'],true)
      })
      const primitiveShownCmps = shownCmps.filter(v=>!v.children)
      if (itemSize) {
        calcRounds(primitiveShownCmps,itemSize)
        calcGroupsSize(topCmp)
      }
      assignPositions(topCmp,[0,0],itemSize || elemsLayout[topCmp.id].size)
      if (Object.values(elemsLayout).flatMap(x=>[...(x.pos||[]), ...x.size]).filter(x=>isNaN(x)).length)
        jb.logError('bad layout result',{elemsLayout,ctx})

      return { elemsLayout, shownCmps: primitiveShownCmps.map(v=>v.id) }

      function allocMinSizes(axis,itemSize) {
        minRecords[axis].map(r=>{
          const allocatedSize = elemsLayout[r.id].size
          const currentTotal = calcTotalSize(axis)
          allocatedSize[axis] = filteredOut[r.id] ? 0 : r.min
          if (itemSize) {
            const requestedTotal = calcTotalSize(axis)
            if (requestedTotal > itemSize[axis]) {
              jb.log('zui layout min alloc rejected',{axis, requested: r.min, available: itemSize[axis], cmp: r.id, requestedTotal, currentTotal, r})
              allocatedSize[axis] = 0
            } else {
              jb.log('zui layout min alloc accepted',{axis, requested: r.min, available: itemSize[axis], cmp: r.id, requestedTotal, currentTotal, r})
              r.alloc = r.min
            }
          } else {
            r.alloc = r.min
          }
        })
      }

      function calcGroupsSize(cmp) { // bottom up
        if (!cmp.children) return
        cmp.children.map(ch=>calcGroupsSize(ch))
        const rProps = elemsLayout[cmp.id]
        rProps.size = axes.map(axis=> calcSizeOfVec(rProps.sizeVec[axis],axis))
      }

      function assignPositions(cmp,basePos,availableSize) {
        elemsLayout[cmp.id].pos = basePos
        if (!cmp.children || !availableSize) return
        const main = cmp.layoutProps.layoutAxis || 0
        const other = main == 0 ? 1: 0
        const visibleChildren = cmp.children.filter(v=>jb.path(elemsLayout,[v.id,'visible']))
        visibleChildren.reduce((posInMain, child,i) => {
          const childSize = elemsLayout[child.id].size
          const childPos = []
          childPos[main] = posInMain + (i ? 0 : (availableSize[main] - elemsLayout[cmp.id].size[main]) / 2)
          childPos[other] = basePos[other] + (availableSize[other] - childSize[other]) / 2
          assignPositions(child,childPos,childSize)
          const res = childPos[main] + childSize[main] + spaceSize
          if (isNaN(res)) debugger
          return res
        },basePos[main])
      }

      function fixVal(v) {
        return typeof v == 'number' ? v.toFixed(2) : v
      }
      function calcSizeOfVec(sizeVec,axis) {
        return sizeVec.sumMax ? sumMax(sizeVec) : maxSum(sizeVec)
        function sumMax(v) {
          let firstView = true
          return v.elems.reduce((sum,elem) => {
              const size = typeof elem[axis] == 'number' ? elem[axis] : calcSizeOfVec(elem,axis)
              const space = (firstView || !size) ? 0 : spaceSize
              if (size) firstView=false
              return sum + size + space
            },0)
        }
        function maxSum(v) {
          return v.elems.reduce((max,elem) => Math.max(max, typeof elem[axis] == 'number' ? elem[axis] : calcSizeOfVec(elem,axis)),0)
        }
      }
      function initSizes(v) {
        jb.path(elemsLayout,[v.id,'title'], v.title)
        jb.path(elemsLayout,[v.id,'sizeVec'], [])
        v.children.map(ch=> ch.children ? initSizes(ch) : jb.path(elemsLayout,[ch.id,'size'],[0,0]))
      }
      function buildSizeVec(v,axis) {
        const sumMax = (axis == v.layoutProps.layoutAxis) && !v.layoutProps.firstToFit
        return elemsLayout[v.id].sizeVec[axis] = {
          sumMax, elems: v.children.map(ch=> ch.children ? buildSizeVec(ch,axis) : elemsLayout[ch.id].size)
        }
        // keeping the size vec and not size[axis] beacuse it is used "by reference"
      }
      function calcTotalSize(axis) {
        return calcSizeOfVec(layoutCalculator.sizeVec[axis],axis)
      }
      function filterFirstToFit(cmp) {
        if (!cmp.children) return
        const res = cmp.children.map(ch =>filterFirstToFit(ch))
        if (!cmp.layoutProps.firstToFit) return res
        cmp.children.reduce((foundFit, ch) => {
          if (foundFit) 
            return filteredOutView(ch)
          const size = elemsLayout[ch.id].size
          return foundFit || size[0] != 0 && size[1] != 0
        } ,false)
      }
      function filterAllOrNone(cmp) {
        if (!cmp.children) return
        cmp.children.map(ch =>filterAllOrNone(ch))
        if (cmp.layoutProps.allOrNone) {
          const notAllShown = cmp.children.reduce((acc, ch) => 
            acc || filteredOut[ch.id] || elemsLayout[ch.id].size.reduce((acc,s) => acc*s,1) == 0, false)
          if (notAllShown)
            filteredOutView(cmp)
        }
      }
      function calcShownViews(cmp) {
        const size = elemsLayout[cmp.id].size
        if (filteredOut[cmp.id] || size[0] == 0 || size[1] == 0) return []
        if (cmp.children)
          return [cmp, ...cmp.children.flatMap(ch=>calcShownViews(ch))]
        return [cmp]
      }
      function calcRounds(primitiveShownCmps,itemSize) {
        const topAxis = layoutCalculator.layoutProps.layoutAxis
        const rounds = primitiveShownCmps.reduce((max,v) => Math.max(max,v.zoomingSize.layoutRounds),0)
        for(let round=1;round<rounds;round++) {
          const otherAxis = topAxis ? 0 : 1
          const childsResidu = topCmp.children.map(ch=> itemSize[otherAxis] - elemsLayout[ch.id].size[otherAxis])
          let resideInLayoutAxis = itemSize[topAxis] - calcTotalSize(topAxis)

          primitiveShownCmps.map(cmp=>{
            if (cmp.layoutRounds <= round) return
            const currentSize = elemsLayout[cmp.id].size
            const available = []
            available[otherAxis] = currentSize[otherAxis] + childsResidu[cmp.topChildIndex]
            available[topAxis] = currentSize[topAxis] + resideInLayoutAxis
            const newSize = sizeNeeds(cmp,{round, available }).map((v,axis)=>Math.min(v, available[axis]))
            const noChange = (newSize[0] == 0 && newSize[1] == 0 || newSize[0] == currentSize[0] && newSize[1] == currentSize[1])
            if (noChange) return
            const oldSize = [currentSize[0],currentSize[1]]
            axes.map(axis=>elemsLayout[cmp.id].size[axis] = newSize[axis])
            const newTotalSize = axes.map(axis=>calcTotalSize(axis))
            if (newTotalSize[0] > itemSize[0] || newTotalSize[1] > itemSize[1])
              axes.map(axis=>elemsLayout[cmp.id].size[axis] = oldSize[axis]) // revert
            else
              resideInLayoutAxis = itemSize[topAxis] - newTotalSize[topAxis]
          })
        }
      }
      function filteredOutView(cmp) {
        filteredOut[cmp.id] = true
        ;(cmp.children||[]).map(ch => filteredOutView(ch))
        return true
      }
    }
  },
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  }
})

});

jbLoadPackedFile({lineInPackage:11236, jb, noProxies: false, path: '/plugins/zui/zui-tester.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')
using('testing')

extension('test', 'zui', {
	initExtension() {
		return { animationFuncs: [] } 
	},
    requestAnimationFrame(func) {
        jb.test.animationFuncs.push(func)
    },
    triggerAnimationEvent(ctx) {
        const funcs = jb.test.animationFuncs
        jb.log(`zui activate animation events ${funcs.length}`, {funcs, ctx})
        funcs.forEach(f=>f())
    }
})

component('zuiTest', {
  type: 'test<>',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'expectedResult', type: 'boolean<>', dynamic: true, mandatory: true},
    {id: 'runBefore', type: 'action<>', dynamic: true},
    {id: 'userEvents', type: 'animation_event<zui>[]'},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean<>'},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'cleanUp', type: 'action<>', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'testData', dynamic: true},
    {id: 'spy'},
    {id: 'covers'}
  ],
  impl: dataTest({
    vars: [
      Var('uiTest', true),
      Var('testData', '%$testData()%', { async: true }),
      Var('widget', pipeline(
        '%$testData%',
        typeAdapter('widget<zui>', widget('%$control()%', { frontEnd: widgetFE() }))
      )),
      Var('initwidget', '%$widget.init()%', { async: true })
    ],
    calculate: pipe('%$userEvents%','%$widget.be_cmp.processFEReq()%'),
    expectedResult: typeAdapter('data<>', pipeline('%$widget.frontEnd.cmpsData%', prettyPrint({ noMacros: true }), '%$expectedResult()%', first())),
    timeout: If(equals('%$backEndJbm%', () => jb), '%$timeout%', 5000),
    allowError: '%$allowError()%',
    expectedCounters: '%$expectedCounters%',
    spy: ({},{},{spy}) => spy === '' ? 'test,zui' : spy,
    includeTestRes: true
  })
})

component('zuiControlRunner', {
  type: 'action<>',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'testData', dynamic: true},
    {id: 'styleSheet', as: 'string', newLinesInCode: true}
  ],
  impl: runActions(
    Var('testData', '%$testData()%', { async: true }),
    Var('widget', pipeline(
      '%$testData%',
      typeAdapter('widget<zui>', widget('%$control()%', { frontEnd: widgetFE() }))
    )),
    '%$widget.init()%'
  )
})

component('animationEvent', {
  type: 'animation_event',
  params: [
    {id: 'event', defaultValue: obj()},
  ],
  impl: (ctx,event) => jb.test.triggerAnimationEvent(ctx.setData(event))
})

component('zoomEvent', {
    type: 'animation_event',
    params: [
      {id: 'zoom', as: 'number'},
      {id: 'center', as: 'array'},
    ],
    impl: animationEvent(({},{},{zoom,center}) => ({
        ...(isNaN(zoom) ? {} : { zoom, tZoom: zoom}),
        ...(center ? {}: { center, tCenter: center})
    }))
})
 
});

jbLoadPackedFile({lineInPackage:11329, jb, noProxies: false, path: '/plugins/zui/zui-widget.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')

component('widget', {
  type: 'widget',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'canvasSizeForTest', as: 'array', defaultValue: [600,600]},
    {id: 'frontEnd', type: 'widget_frontend'},
    {id: 'features', type: 'feature' }
  ],
  impl: ctx => {
        const {canvasSizeForTest, control, frontEnd, features} = ctx.params
        frontEnd.initFE(canvasSizeForTest)
        
        const widget = {
            frontEnd,
            async init() {
                const ctxForBe = ctx.setVars({canvasSize: frontEnd.canvasSize, widget: this, renderRole: 'fixed'})
                const beCmp = this.be_cmp = control(ctxForBe).applyFeatures(features,20)
                beCmp.init({topOfWidget: true})

                const _payload = await beCmp.calcPayload(beCmp)
                const payload = _payload.id ? {[_payload.id] : _payload }: _payload
                const beCmps = beCmp.allDescendants()
                await frontEnd.handlePayload(payload)
                frontEnd.beProxy = {
                    async beUpdateRequest(cmpIds) {
                        const updatePayload = {}
                        await cmpIds.reduce((pr,id) => pr.then(
                            async () => updatePayload[id] = await beCmps.find(cmp=>cmp.id==id).calcPayload()), Promise.resolve())
                        await frontEnd.handlePayload(updatePayload)
                    }
                }
            },
        }
        return widget
    }
})

component('app', {
    type: 'application',
    params: [
      {id: 'selector', as: 'string', defaultValue: 'body'},
    ],
    impl: (ctx, selector) => ({
        init(appSize) {
            if (!ctx.vars.uiTest && jb.frame.document) {
                jb.zui.setCss('app',`html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }`)
                const doc = jb.frame.document
                // const appElem = jb.frame.document.createElement('div')
                // app.innerHtml = 
                const canvas = doc.createElement('div')
                canvas.classList.add('widget-top')
                canvas.style.width = '100vw'
                canvas.style.height = '100vh'
                doc.querySelector(selector).appendChild(canvas)
                const rect = canvas.getBoundingClientRect()
                return { canvas, canvasSize: [rect.width, rect.height] }
            }
        }
        
    })
})

component('widgetFE', {
  type: 'widget_frontend',
  params: [
    {id: 'app', type: 'application', defaultValue: app() },
  ],
  impl: (ctx, app) => ({
        cmps: {},
        cmpsData: {},
        renderCounter: 1,
        state: {tCenter: [1,1], tZoom : 2, zoom: 2, center: [1,1]},

        initFE(canvasSizeForTest) {
            if (!ctx.vars.uiTest && jb.frame.document) {
                const {canvas,canvasSize} = app.init()
                this.canvas = canvas
                this.canvasSize = canvasSize
            } else {
                this.canvasSize = canvasSizeForTest
            }
            this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, uiTest: ctx.vars.uiTest})
            this.ctx.probe = ctx.probe
        },
        async handlePayload(payload) {
            const ctx = this.ctx
            Object.entries(payload).map(([cmpId,be_data]) => {
                const cmp = this.cmps[cmpId] = newFECmp(cmpId, be_data, this.canvas, this.canvas)
                this.cmpsData[cmpId] = { ...(this.cmpsData[cmpId] || {}), ...be_data }
                if (cmp.html && jb.frame.document) {
                    const temp = jb.frame.document.createElement('div')
                    temp.innerHTML = cmp.html
                    cmp.el = temp.children[0]
                }
                if (cmp.css)
                    jb.zui.setCmpCss(cmp)
            })
            jb.log('zui handlePayload loaded in FE',{cmpsData: this.cmpsData, payload,ctx})
            // dirty - build itemlist layout calculator only after loading its ancestors
            const layoutTop =  Object.values(this.cmps).find(cmp => cmp.buildLayoutCalculator)
            layoutTop && layoutTop.buildLayoutCalculator(ctx)

            this.renderRequest = true

            function newFECmp(cmpId, be_data, canvas) {
                const cmp = new (class FECmp {}) // used for serialization filtering
                const fromBeData = { notReady, title, gridElem, frontEndMethods, layoutProps, renderRole, clz, html, css } = be_data
                Object.assign(cmp, { id: cmpId, state: {}, flows: [], base: canvas, vars: be_data.frontEndVars || {}, ...fromBeData })
                if (cmp.notReady) return cmp
                cmp.destroyed = new Promise(resolve=> cmp.resolveDestroyed = resolve)
                jb.zui.runFEMethod(cmp,'calcProps',{silent:true,ctx})
                jb.zui.runFEMethod(cmp,'init',{silent:true,ctx})
                ;(be_data.frontEndMethods ||[]).map(m=>m.method).filter(m=>['init','calcProps'].indexOf(m) == -1)
                    .forEach(method=> cmp[method] = ctx => jb.zui.runFEMethod(cmp,method,{silent:true,ctx}))

                cmp.state.frontEndStatus = 'ready'
                return cmp
            }
        },
        renderCmps(ctx) {
            if (this.ctx.vars.canUseConsole) console.log(this.state.zoom, ...this.state.center)
            Object.values(this.cmps).filter(cmp=>!cmp.notReady && !cmp.flowElem && cmp.renderRole !='zoomingGridElem')
                .forEach(cmp=>cmp.render ? cmp.render(this.ctx) : this.renderCmp(cmp,this.ctx))
        },        
        renderCmp(cmp,ctx) {
            const { itemlistCmp } = ctx.vars
            if (cmp.el && itemlistCmp) {
                if (!itemlistCmp.el.querySelector(`.${cmp.clz}`)) itemlistCmp.el.appendChild(cmp.el)
                cmp.zoomingCss && cmp.zoomingCss(ctx)
                cmp.el.style.display = 'block'
            }
        }
    })
})

extension('zui','html', {
    setCmpCss(cmp) {
        jb.zui.setCss(cmp.clz, cmp.css.join('\n'))
    },
    setCssVars(cssClass,cssVars) {
        const cssVarRules = Object.entries(cssVars).map(([key, value]) => `--${key}: ${value};`).join('\n')
        const content = `.${cssClass} { ${cssVarRules} }`
        jb.zui.setCss(`vars-${cssClass}`,content)
    },
    setCss(id,content) {
        const document = jb.frame.document
        if (!document) return
        let styleTag = document.getElementById(id)
        if (!styleTag) {
          styleTag = document.createElement('style')
          styleTag.id = id
          document.head.appendChild(styleTag)
        }
        styleTag.textContent = Array.isArray(content)? content.join('\n') : content
    },
})

extension('zui', 'frontend', {
    runFEMethod(cmp,method,{data,_vars,silent,ctx} = {}) {
        if (cmp.state.frontEndStatus != 'ready' && ['onRefresh','initOrRefresh','init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontend - running method before init', {cmp, method,data,_vars})
        const toRun = (cmp.frontEndMethods || []).filter(x=>x.method == method).sort((p1,p2) => (p1.phase || 0) - (p2.phase ||0))
        if (toRun.length == 0 && !silent)
            return jb.logError(`frontend - no method ${method}`,{cmp})
        toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o && o[p],jb.comps)
            if (!profile)
                return jb.logError('runFEMethod - can not get profile',{method, path})
            const srcCtx = new jb.core.jbCtx(ctx, { profile, path, forcePath: path })
            const feMEthod = jb.core.run(srcCtx)
            const vars = {cmp, $state: cmp.state, ...cmp.vars, ..._vars }
            const ctxToUse = ctx.setData(data).setVars(vars)
            const {_prop, _flow } = feMEthod.frontEndMethod
            if (_prop)
                jb.log(`frontend before calc prop ${_prop}`,{data, vars, cmp, srcCtx, ...feMEthod.frontEndMethod, ctxToUse})
            else if (_flow)
                jb.log(`frontend start flow ${jb.ui.rxPipeName(_flow)}`,{data, vars, cmp, srcCtx, ...feMEthod.frontEndMethod,  ctxToUse})
            else 
                jb.log(`frontend run method ${method}`,{data, vars, cmp, srcCtx , ...feMEthod.frontEndMethod,ctxToUse})
            const res = ctxToUse.run(feMEthod.frontEndMethod.action, jb.utils.dslType(profile.$$))
            if (_prop)
                jb.log(`frontend prop ${_prop} value`,{res, cmp})
            if (_flow && res) cmp.flows.unshift({flow: res, profile: _flow})
        }, `frontEnd-${method}`,ctx))
    }
})

component('session', {
    type: 'session',
    params: [
      {id: 'query', as: 'string'},
      {id: 'contextCrums', as: 'array'},
      {id: 'budget', type: 'budget'},
      {id: 'usage', type: 'usage' }
    ]
})
});

jbLoadPackedFile({lineInPackage:11531, jb, noProxies: false, path: '/plugins/zui/zui-zoom.js',fileDsl: 'zui', pluginId: 'zui' }, 
            function({jb,require,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')
using('rx')

component('zui.canvasZoom', {
  type: 'feature',
  impl: features(
    frontEnd.init((ctx,{uiTest}) => {
      jb.zui.initZoom(ctx)
      !uiTest && ctx.vars.cmp.updateZoomState({ dz :1, dp:0 })
    }),
    frontEnd.prop('zuiEvents', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('pointerdown'),
      rx.log('zui pointerdown'),
      rx.var('pid', '%pointerId%'),
      rx.do(({},{cmp,pid}) => cmp.addPointer(pid)),
      rx.flatMap(source.mergeConcat(
        rx.pipe(
          source.merge(source.event('pointermove'), source.frontEndEvent('pointerup')),
          rx.filter('%$pid%==%pointerId%'),
          rx.do(({data},{cmp,pid}) => cmp.updatePointer(pid,data)),
          rx.takeWhile('%type%==pointermove'),
          rx.flatMap(source.data(({},{cmp}) => cmp.zoomEventFromPointers()))
        ),
        rx.pipe(
          source.data(({},{cmp,pid}) => cmp.momentumEvents(pid)),
          rx.var('delay', '%delay%'),
          rx.flatMap(rx.pipe(source.data('%events%'))),
          rx.delay('%$delay%'),
          rx.log('momentum zui')
        ),
        rx.pipe(source.data(1), rx.do(({},{cmp,pid}) => cmp.removePointer(pid)))
      )),
      rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
      sink.subjectNext('%$cmp.zuiEvents%')
    ),
    frontEnd.flow(
      source.event('wheel', () => jb.frame.document, { options: obj(prop('capture', true)) }),
      rx.log('zui wheel'),
      rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 1/1.1 : 1 })),
      rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
      sink.subjectNext('%$cmp.zuiEvents%')
    )
  )
})

extension('zui','zoom', {
    initZoom(ctx) {
        const vars = ctx.vars
        const {widget, cmp, uiTest } =  vars
        if (uiTest) return
        const {state, canvas} = widget
        const w = canvas.offsetWidth, h = canvas.offsetHeight
        if (canvas.addEventListener && canvas.style) {
          canvas.style.touchAction = 'none'
          canvas.oncontextmenu = e => (e.preventDefault(), false)

          ;['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend']
              .forEach(event => canvas.addEventListener(event, e => e.preventDefault()))
        }
  
      Object.assign(cmp, {
        updatePointer(pid,sourceEvent) {
          const pointer = this.pointers.find(x=>x.pid == pid)
          if (!pointer) return
          const dt = pointer.dt = sourceEvent.timeStamp - (pointer.time || 0)
          const [x,y] = [sourceEvent.offsetX, sourceEvent.offsetY];
          const dp = (!pointer.p) ? [0,0] : [x - pointer.p[0], y - pointer.p[1]]
          const v = dt == 0 ? [0,0] : [0,1].map(axis => dp[axis]/dt)
          Object.assign(pointer, {
              time: sourceEvent.timeStamp,
              vAvg: pointer.v ? [0,1].map(axis=> pointer.v[axis] * 0.8 + v[axis] *0.2) : v,
              p: [x,y], v, dp, sourceEvent
          })
          const otherPointer = this.pointers.length > 1 && this.pointers.find(x=>x.pid != pid)
          if (otherPointer && otherPointer.p) {
              const gap = Math.hypot(...[0,1].map(axis => Math.abs(pointer.p[axis] - otherPointer.p[axis])))
              const dscale = (gap == 0  || pointer.gap == 0) ? 1 : pointer.gap / gap
              otherPointer.dscale = pointer.dscale = dscale
              otherPointer.gap = pointer.gap = gap
          }
          jb.log('zui update pointers', {v: `[${pointer.v[0]},${pointer.v[1]}]` , pointer, otherPointer, cmp, widget})
          if (this.pointers.length > 2) {
              jb.logError('zui more than 2 pointers', {pointers: this.pointers})
              this.pointers = this.pointers.slice(-2)
          }
        },      
        zoomEventFromPointers() {
          const pointers = this.pointers
          return pointers.length == 0 ? [] : pointers[1] 
              ? [{ p: avg('p'), dp: avg('dp'), v: avg('v'), dz: pointers[0].dscale }]
              : [{ v: pointers[0].v, dp: pointers[0].dp }]
      
          function avg(att) {
            return [0,1].map(axis => pointers.filter(p=>p[att]!=null).reduce((sum,p) => sum + p[att][axis], 0) / pointers.length)
          }
        },
        updateZoomState({ dz, dp }) {
          let {tZoom, tCenter} =  state
          const factor = jb.ui.isMobile() ? 2 : 3
          if (dz)
            tZoom *= dz**factor
          const tZoomF = Math.floor(tZoom)
          if (dp)
            tCenter = [tCenter[0] - dp[0]/w*tZoomF, tCenter[1] + dp[1]/h*tZoomF]
  
          const gridSize  = cmp.vars.gridSize
          const maxDim = Math.max(gridSize[0],gridSize[1])
          const ZOOM_LIMIT = [1, jb.ui.isMobile() ? maxDim: maxDim]
          ;[0,1].forEach(axis=>tCenter[axis] = Math.min(gridSize[axis],Math.max(0,tCenter[axis])))
  
          tZoom = Math.max(ZOOM_LIMIT[0],Math.min(tZoom, ZOOM_LIMIT[1]))
          state.tZoom = tZoom
          state.tCenter = tCenter
  
          jb.log('zui event',{dz, dp, tZoom, tCenter, cmp, widget})
        },      
        animationStep() {
          let { tZoom, tCenter, zoom, center } = state
          if ( zoom == tZoom && center[0] == tCenter[0] && center[1] == tCenter[1] && !this.renderRequest) 
            return [] // no rendering
          // used at initialiation
          zoom = zoom || tZoom
          ;[0,1].forEach(axis=>center[axis] = center[axis] == null ? tCenter[axis] : center[axis])
  
          // zoom gets closer to targetZoom, when 1% close assign its value
          const SPEED = jb.ui.isMobile() ? 1 : 4
          zoom = zoom + (tZoom - zoom) / SPEED
          if (!tZoom || Math.abs((zoom-tZoom)/tZoom) < 0.01) 
            zoom = tZoom
          ;[0,1].forEach(axis=> {
            center[axis] = center[axis] + (tCenter[axis] - center[axis]) / SPEED
            if (!tCenter[axis] || Math.abs((center[axis]-tCenter[axis])/tCenter[axis]) < 0.01) 
              center[axis] = tCenter[axis]
          })
          
          state.zoom = zoom
          this.renderRequest = false
          return [state]
        },            
        pointers: [],
        findPointer(pid) { return this.pointers.find(x=>x.pid == pid) },
        removeOldPointers() {
          const now = new Date().getTime()
          this.pointers = this.pointers.filter(pointer => now - pointer.time < 2000)
        },
        addPointer(pid) { 
          if (this.findPointer(pid))
            return jb.logError('zui pointer already exists', {pid})
          if (this.pointers.length > 1)
            this.removeOldPointers()
          if (this.pointers.length > 1)
            return jb.logError('zui pointer tring to add thirs pointer', {pid})
  
          this.pointers.push({pid})
        },
        removePointer(pid) {
          //console.log('removePointer',pid,this.pointers)
          const found = this.pointers.findIndex(x=>x.pid == pid)
          //console.log(found)
          if (found != -1)
            this.pointers.splice(found, 1)
        } ,
        momentumEvents(pid) {
          const pointer = this.pointers.find(x=>x.pid == pid)
          if (!pointer) return { delay: 0, events: [] }
          const target = [limitJump(w,500*pointer.vAvg[0]), limitJump(h,500*pointer.vAvg[1])]
          const n = 50
          const dps = Array.from(new Array(n).keys()).map( i => smoth(i,n))
          return { delay: 5, events: dps.map(dp=>({dp})) }
  
          function limitJump(limit,value) {
            return Math.sign(value) * Math.min(Math.abs(value),limit)
          }
          function smoth(i,n) {
            return [0,1].map(axis => target[axis] * (Math.sin((i+1)/n*Math.PI/2) - Math.sin(i/n*Math.PI/2)))
          }
        }
      })
    },
})
});

jbLoadPackedFile({lineInPackage:11716, jb, noProxies: false, path: '/plugins/zui/demo/health-care-comps.js',fileDsl: 'zui', pluginId: 'zui-demo' }, 
            function({jb,require,healthCare,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
dsl('zui')
using('zui')

component('healthCare.conditionCard', {
  type: 'control',
  impl: card('%title%', '%description%', {
    style: healthCare.conditionCardStyle({
      categorySymbol: healthCare.categorySymbol(),
      urgencySymbol: symbol(unitScale('urgency'), list('','❗','⚠️')),
      borderStyle: borderStyle(unitScale('likelihood')),
      borderColor: itemColor(unitScale('urgency'), list('green','orange','red')),
      categoryColor: healthCare.categoryColor()
    })
  })
})

component('healthCare.conditionCardStyle', {
  type: 'card-style',
  params: [
    {id: 'categorySymbol', type: 'item_symbol', byName: true},
    {id: 'urgencySymbol', type: 'item_symbol', byName: true},
    {id: 'borderStyle', type: 'item_border_style'},
    {id: 'borderColor', type: 'item_color'},
    {id: 'categoryColor', type: 'item_color'}
  ],
  impl: features(
    zoomingSize(fill({ min: 133 })),
    zoomingGridElem(),
    frontEnd.var('fontSizeMap', () => ({
        64: { title: 12, description: 10 },
        128: { title: 12, description: 10 },
        256: { title: 12, description: 12 },
        320: { title: 14, description: 12 },
    })),
    frontEnd.method('zoomingCss', (ctx, {fontSizeMap, cmp, itemSize}) => {
        const cssVars = {}
        const baseSize = itemSize[0]
        const closestSize = Object.keys(fontSizeMap).map(Number).reduce((prev, curr) => (baseSize <= curr ? curr : prev), 320)
        const fontSizes = fontSizeMap[closestSize]
        
        cssVars['title-font-size'] = `${fontSizes.title}px`
        cssVars['description-font-size'] = `${fontSizes.description}px`
        
        jb.zui.setCssVars(`card-${cmp.id}`, cssVars)
    }),
    htmlOfItem((ctx,{cmp, item},{categorySymbol,urgencySymbol,borderStyle,borderColor,categoryColor}) => `
        <div class="card-${cmp.id}" style="font-family: Arial, sans-serif;">
          <div class="icon" style="border-style: ${borderStyle(ctx)}; border-color: ${borderColor(ctx)};">
            <div class="icon-background" style="background-color: ${categoryColor(ctx)}"></div>
            <div class="icon-content">
                <div class="icon-main-symbol">${categorySymbol(ctx)}</div>
            </div>
          </div>
          <div class="icon-urgencySymbol">${urgencySymbol(ctx)}</div>
          <div class="title">${item.title}</div>
          <div class="category">${item.category}</div>
          <div class="description">${item.description}</div>
          <div class="urgency">Urgency: ${item.urgency}</div>
          <div class="likelihood">Likelihood: ${item.likelihood}</div>
          <div class="symptoms">Symptoms: ${jb.asArray(item.symptoms).join(', ')}</div>
          <div class="riskFactors">
            Risk Factors:
            <ul>
                ${jb.asArray(item.riskFactors).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
          <div class="treatments">
            Treatments:
            <ul>
                ${jb.asArray(item.recommendedTreatments).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
          <div class="tests">
            Tests:
            <ul>
                ${jb.asArray(item.diagnosticTests).map(x => `<li>${x}</li>`).join('')}
            </ul>
          </div>
        </div>
      `),
    css(`
        .card-%$cmp/id% {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 10px;
          overflow: hidden;
          box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        .card-%$cmp/id% .icon { position: relative; width: 32px; min-height: 32px;}
        .card-%$cmp/id% .icon-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
        .card-%$cmp/id% .icon-content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .card-%$cmp/id% .icon-urgencySymbol { font-size: 32px; line-height: 1; position: absolute; top: 10px; right: 2px; }
        .card-%$cmp/id% .icon-main-symbol { font-size: 32px; line-height: 1; }

        .card-%$cmp/id% > .title { font-size: var(--title-font-size); font-weight: bold; margin-bottom: 8px; color: #333; }
        .card-%$cmp/id% > .category { font-size: var(--description-font-size); margin-bottom: 5px; font-weight: bold; }
        .card-%$cmp/id% > .description { font-size: var(--description-font-size); margin-bottom: 10px; font-style: italic; color: #666; }
        .card-%$cmp/id% > .urgency,
        .card-%$cmp/id% > .likelihood,
        .card-%$cmp/id% > .symptoms,
        .card-%$cmp/id% > .riskFactors,
        .card-%$cmp/id% > .treatments,
        .card-%$cmp/id% > .tests {font-size: var(--description-font-size);margin-bottom: 8px;color: #444; }

        .card-%$cmp/id% .riskFactors ul,
        .card-%$cmp/id% .treatments ul,
        .card-%$cmp/id% .tests ul {list-style-type: disc;padding-left: 20px;margin: 0;}

        .card-%$cmp/id% .riskFactors ul li,
        .card-%$cmp/id% .treatments ul li,
        .card-%$cmp/id% .tests ul li {margin-bottom: 4px; }
      `)
  )
})

component('healthCare.conditionIconBox', {
  type: 'control',
  impl: iconBox('%abrv%', healthCare.conditionIconBoxStyle({
    categorySymbol: healthCare.categorySymbol(),
    urgencySymbol: symbol(unitScale('urgency'), list('','❗','⚠️')),
    borderStyle: borderStyle(unitScale('likelihood')),
    opacity: opacity(unitScale('likelihood')),
    borderColor: itemColor(unitScale('urgency'), list('green','orange','red')),
    categoryColor: healthCare.categoryColor()
  }))
})

component('healthCare.conditionIconBoxStyle', {
  type: 'iconBox-style',
  params: [
    {id: 'categorySymbol', type: 'item_symbol', byName: true},
    {id: 'urgencySymbol', type: 'item_symbol'},
    {id: 'borderStyle', type: 'item_border_style'},
    {id: 'opacity', type: 'item_opacity'},
    {id: 'borderColor', type: 'item_color'},
    {id: 'categoryColor', type: 'item_color'}
  ],
  impl: features(
    zoomingSize(fill()),
    zoomingGridElem(),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
      const boxSize = 2 ** Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
      const cssVars = {}
      cssVars['border-width'] = `${Math.min(2,Math.max(0,jb.zui.floorLog2(boxSize)-3))}px`
      cssVars['box-size'] = `${boxSize}px`
      if (boxSize >= 16) {
        cssVars['symbol-font-size'] = `${boxSize * 0.5}px`
        cssVars['urgency-symbol-font-size'] = `${boxSize * 0.25}px`
        cssVars['urgency-symbol-offset'] = `${boxSize / 16}px`
        cssVars['abrv-font-size'] = `${boxSize * 0.25}px`
        cssVars['abrv-margin'] = `${boxSize / 16}px`
      } else {
        cssVars['symbol-font-size'] = `0px`
        cssVars['urgency-symbol-font-size'] = `0px`
        cssVars['urgency-symbol-offset'] = `0px`
        cssVars['abrv-font-size'] = `0px`
        cssVars['abrv-margin'] = `0px`
      }
      jb.zui.setCssVars(`icon-${cmp.id}`,cssVars)
    }),
    htmlOfItem(`<div class="icon-%$cmp/id%" style="opacity: %$opacity()%; border-style: %$borderStyle()%; border-color: %$borderColor()%; font-family: Arial, sans-serif;">
      <div class="icon-background-%$cmp/id%" style="background-color: %$categoryColor()%"></div>
      <div class="icon-content-%$cmp/id%">
        <div class="icon-urgencySymbol-%$cmp/id%">%$urgencySymbol()%</div>
        <div class="icon-main-symbol-%$cmp/id%">%$categorySymbol()%</div>
        <div class="icon-abrv-%$cmp/id%">%$$model/abrv()%</div>
      </div>
    </div>`),
    css(`
      .icon-%$cmp/id% { position: relative; border-width: var(--border-width); width: var(--box-size); height: var(--box-size);}
      .icon-background-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
      .icon-content-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .icon-urgencySymbol-%$cmp/id% { position: absolute; top: var(--urgency-symbol-offset); right: var(--urgency-symbol-offset); font-size: var(--urgency-symbol-font-size); }
      .icon-main-symbol-%$cmp/id% { font-size: var(--symbol-font-size); line-height: 1; }
      .icon-abrv-%$cmp/id% { font-size: var(--abrv-font-size); margin: var(--abrv-margin); line-height: 1; }
    `)
  )
})

component('healthCare.categorySymbol', {
  type: 'item_symbol',
  impl: symbolByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', '🫀'),
      Case('Neurological', '🧠'),
      Case('Respiratory', '🌬️'),
      Case('Gastrointestinal', '🍴'),
      Case('Musculoskeletal', '🦴'),
      Case('Endocrine', '🕰️'),
      Case('Infectious Disease', '🦠'),
      Case('Dermatological', '🩹'),
      Case('Psychiatric', '💭'),
      Case('Hematological', '🩸'),
      Case('Nephrological', '🚰'),
      Case('Oncological', '🎗️'),
      Case('Ophthalmological', '👁️'),
      Case('Otolaryngological', '👂'),
      Case('Immunological', '🛡️'),
      Case('Rheumatological', '🤲'),
      Case('Gynecological', '👩‍⚕️'),
      Case('Urological', '🚽'),
      Case('Pediatric', '🧸'),
      Case('Geriatric', '👴👵'),
      Case('Emergency Medicine', '🚨'),
      Case('Allergy', '🤧'),
      Case('Psychological', '🧘'),
      Case('Dental', '🦷'),
      Case('Radiological', '📡')
    ]
  })
})

component('healthCare.categoryColor', {
  type: 'item_color',
  impl: colorByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', 'red'),
      Case('Neurological', 'blue'),
      Case('Respiratory', 'green'),
      Case('Gastrointestinal', 'orange'),
      Case('Musculoskeletal', 'purple'),
      Case('Endocrine', 'yellow'),
      Case('Infectious Disease', 'darkred'),
      Case('Dermatological', 'pink'),
      Case('Psychiatric', 'brown'),
      Case('Hematological', 'maroon'),
      Case('Nephrological', 'teal'),
      Case('Oncological', 'black'),
      Case('Ophthalmological', 'lightblue'),
      Case('Otolaryngological', 'navy'),
      Case('Immunological', 'olive'),
      Case('Rheumatological', 'violet'),
      Case('Gynecological', 'magenta'),
      Case('Urological', 'cyan'),
      Case('Pediatric', 'lightgreen'),
      Case('Geriatric', 'slategray'),
      Case('Emergency Medicine', 'crimson'),
      Case('Allergy', 'gold'),
      Case('Psychological', 'saddlebrown'),
      Case('Dental', 'tan'),
      Case('Radiological', 'silver')
    ],
    defaultColor: 'gray'
  })
})
});

jbLoadPackedFile({lineInPackage:11968, jb, noProxies: false, path: '/plugins/zui/demo/health-care-data.js',fileDsl: '', pluginId: 'zui-demo' }, 
            function({jb,require,healthCare,prop,init,props,variable,variableForChildren,features,method,If,html,htmlOfItem,css,zoomingCss,frontEnd,source,group,allOrNone,firstToFit,children,vertical,horizontal,iconBox,card,itemlist,grid,spiral,zoomingGridElem,xyByProps,xyByIndex,groupByScatter,zoomingSize,fixed,fill,session,zui,model,o1,o1Mini,gpt35,itemColor,colorByItemValue,Case,borderStyle,borderStyleScale3,opacity,opacityScale,symbol,symbolByItemValue,list,success3,unitScale,index,severity5,good5,success5,distinct5,distinct10,green10,gray5,gray10,coolToWarm10,zuiTest,zuiControlRunner,animationEvent,zoomEvent,widget,app,widgetFE,llmViaApi,system,assistant,user,llm,firstSucceeding,firstNotEmpty,keys,values,properties,mapValues,entries,plus,minus,mul,div,math,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,obj,dynamicObject,objFromVars,selectProps,transformProp,extend,assign,extendWithObj,extendWithIndex,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,removeProps,delay,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,fileContent,calcDirectory,pipeline,pipe,aggregate,objFromProperties,objFromEntries,join,unique,max,min,sum,slice,sort,first,last,count,reverse,sample,splitByPivot,groupBy,groupProps,call,typeAdapter,TBD,Var,unknownCmp,runCtx,log,asIs,isRef,asRef,test,extractText,breakText,zipArrays,removeSections,merge,clone,filterEmptyProperties,trim,splitToLines,newLine,removePrefixRegex,wrapAsObject,substring,Undefined,switchByArraySize,asString,globals,watchablePeople,person,personWithAddress,personWithPrimitiveChildren,personWithChildren,emptyArray,people,peopleWithChildren,stringArray,stringTree,city,village,state,israel,israel2,jerusalem,eilat,nokdim,nameOfCity,phones,dataTest,tests,tester,testServer,pluginTest,PROJECTS_PATH,stateless,worker,webWorker,child,cmd,byUri,jbm,parent,isNode,isVscode,nodeOnly,remoteNodeWorker,nodeWorker,remote,remoteCtx,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,treeShake,treeShakeClientWithPlugins,treeShakeClient,prettyPrint,rx,sink,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,runTransaction,component,extension,using,dsl,pluginDsl}) {
component('healthCare.conditionDataSample', {
  impl: () => [
    {
      "title": "Appendicitis",
      "category": "Gastrointestinal",
      "urgency": 9,
      "likelihood": 6,
      "abrv": "APN",
      "description": "A condition in which the appendix becomes inflamed and filled with pus.",
      "symptoms": ["Abdominal pain", "Nausea"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Critical",
      "riskFactors": ["Family history", "Infection"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Peritonitis", "Sepsis"],
      "diagnosticTests": ["Ultrasound", "CT scan"],
      "recommendedTreatments": ["Surgery", "Antibiotics"],
      "prevalenceRate": "Moderate",
    },
    {
      "title": "Diverticulitis",
      "category": "Gastrointestinal",
      "urgency": 7,
      "likelihood": 5,
      "abrv": "DVRT",
      "description": "Inflammation or infection of small pouches in the digestive tract.",
      "symptoms": ["Lower abdominal pain", "Fever"],
      "ageGroupAffected": "Adults",
      "severityLevel": "Severe",
      "riskFactors": ["Low fiber diet", "Aging"],
      "treatmentUrgency": "Moderate",
      "possibleComplications": ["Abscess", "Perforation"],
      "diagnosticTests": ["CT scan", "Colonoscopy"],
      "recommendedTreatments": ["Antibiotics", "Dietary changes"],
      "prevalenceRate": "Common",
    },
    {
      "title": "Myocardial Infarction",
      "category": "Cardiovascular",
      "urgency": 10,
      "likelihood": 8,
      "abrv": "MI",
      "description": "Commonly known as a heart attack, caused by reduced blood flow to the heart.",
      "symptoms": ["Chest pain", "Shortness of breath"],
      "ageGroupAffected": "Adults",
      "severityLevel": "Critical",
      "riskFactors": ["Smoking", "High cholesterol"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Heart failure", "Arrhythmia"],
      "diagnosticTests": ["ECG", "Troponin test"],
      "recommendedTreatments": ["Angioplasty", "Medications"],
      "prevalenceRate": "Moderate",
    },
    {
      "title": "Migraine Headache",
      "category": "Neurological",
      "urgency": 6,
      "likelihood": 7,
      "abrv": "MH",
      "description": "A neurological condition causing intense headaches, often with nausea and sensitivity to light.",
      "symptoms": ["Throbbing headache", "Sensitivity to light"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Moderate",
      "riskFactors": ["Stress", "Sleep deprivation"],
      "treatmentUrgency": "Low",
      "possibleComplications": ["Chronic migraines", "Medication overuse"],
      "diagnosticTests": ["Neurological exam", "Imaging (if needed)"],
      "recommendedTreatments": ["Pain relievers", "Preventive medications"],
      "prevalenceRate": "High",
    },
    {
      "title": "Pneumonia",
      "category": "Respiratory",
      "urgency": 6,
      "likelihood": 6,
      "abrv": "PNU",
      "description": "Infection that inflames air sacs in one or both lungs, which may fill with fluid.",
      "symptoms": ["Cough", "Fever"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Severe",
      "riskFactors": ["Smoking", "Weakened immune system"],
      "treatmentUrgency": "Moderate",
      "possibleComplications": ["Respiratory failure", "Sepsis"],
      "diagnosticTests": ["Chest X-ray", "Blood tests"],
      "recommendedTreatments": ["Antibiotics", "Oxygen therapy"],
      "prevalenceRate": "Common",
    },
    {
      "title": "Asthma Exacerbation",
      "category": "Respiratory",
      "urgency": 7,
      "likelihood": 5,
      "abrv": "ASTH",
      "description": "A worsening of asthma symptoms due to triggers such as allergens or stress.",
      "symptoms": ["Shortness of breath", "Wheezing"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Severe",
      "riskFactors": ["Allergies", "Air pollution"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Respiratory failure", "Pneumothorax"],
      "diagnosticTests": ["Spirometry", "Peak flow measurement"],
      "recommendedTreatments": ["Bronchodilators", "Corticosteroids"],
      "prevalenceRate": "High",
    },
    {
      "title": "Stroke",
      "category": "Neurological",
      "urgency": 10,
      "likelihood": 7,
      "abrv": "STRK",
      "description": "Occurs when blood supply to part of the brain is interrupted or reduced.",
      "symptoms": ["Sudden weakness", "Slurred speech"],
      "ageGroupAffected": "Adults",
      "severityLevel": "Critical",
      "riskFactors": ["Hypertension", "Diabetes"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Paralysis", "Cognitive impairment"],
      "diagnosticTests": ["CT scan", "MRI"],
      "recommendedTreatments": ["Thrombolysis", "Rehabilitation"],
      "prevalenceRate": "Moderate",
    },
    {
      "title": "Hypertensive Crisis",
      "category": "Cardiovascular",
      "urgency": 9,
      "likelihood": 6,
      "abrv": "HTNC",
      "description": "A severe increase in blood pressure that can lead to stroke or other complications.",
      "symptoms": ["Severe headache", "High blood pressure"],
      "ageGroupAffected": "Adults",
      "severityLevel": "Critical",
      "riskFactors": ["Hypertension", "Stress"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Stroke", "Heart attack"],
      "diagnosticTests": ["Blood pressure measurement", "ECG"],
      "recommendedTreatments": ["IV antihypertensives", "Monitoring"],
      "prevalenceRate": "Moderate",
    },
    {
      "title": "Gallstones",
      "category": "Gastrointestinal",
      "urgency": 5,
      "likelihood": 4,
      "abrv": "GLST",
      "description": "Hardened deposits of digestive fluid that can form in your gallbladder.",
      "symptoms": ["Abdominal pain", "Nausea"],
      "ageGroupAffected": "Adults",
      "severityLevel": "Moderate",
      "riskFactors": ["Obesity", "High-fat diet"],
      "treatmentUrgency": "Low",
      "possibleComplications": ["Cholecystitis", "Pancreatitis"],
      "diagnosticTests": ["Ultrasound", "CT scan"],
      "recommendedTreatments": ["Surgery", "Dietary changes"],
      "prevalenceRate": "Common",
    },
    {
      "title": "Seizure",
      "category": "Neurological",
      "urgency": 8,
      "likelihood": 5,
      "abrv": "SZR",
      "description": "A sudden, uncontrolled electrical disturbance in the brain.",
      "symptoms": ["Uncontrolled movements", "Loss of consciousness"],
      "ageGroupAffected": "All ages",
      "severityLevel": "Severe",
      "riskFactors": ["Epilepsy", "Brain injury"],
      "treatmentUrgency": "Immediate",
      "possibleComplications": ["Brain damage", "Injury during seizure"],
      "diagnosticTests": ["EEG", "MRI"],
      "recommendedTreatments": ["Anticonvulsants", "Lifestyle adjustments"],
      "prevalenceRate": "Moderate",
    }
  ]
})

component('healthCare.conditionDataSample300', {
  impl: () => [
        { "title": "Appendicitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 6, "abrv": "APN" },
        { "title": "Diverticulitis", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "DVRT" },
        { "title": "Myocardial Infarction", "category": "Cardiovascular", "urgency": 10, "likelihood": 8, "abrv": "MI" },
        { "title": "Migraine Headache", "category": "Neurological", "urgency": 6, "likelihood": 7, "abrv": "MH" },
        { "title": "Pneumonia", "category": "Respiratory", "urgency": 6, "likelihood": 6, "abrv": "PNU" },
        { "title": "Asthma Exacerbation", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "ASTH" },
        { "title": "Stroke", "category": "Neurological", "urgency": 10, "likelihood": 7, "abrv": "STRK" },
        { "title": "Hypertensive Crisis", "category": "Cardiovascular", "urgency": 9, "likelihood": 6, "abrv": "HTNC" },
        { "title": "Gallstones", "category": "Gastrointestinal", "urgency": 5, "likelihood": 4, "abrv": "GLST" },
        { "title": "Seizure", "category": "Neurological", "urgency": 8, "likelihood": 5, "abrv": "SZR" },
        { "title": "Deep Vein Thrombosis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "DVT" },
        { "title": "Cholecystitis", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "CHOLC" },
        { "title": "Epilepsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "EPI" },
        { "title": "Chronic Obstructive Pulmonary Disease", "category": "Respiratory", "urgency": 6, "likelihood": 7, "abrv": "COPD" },
        { "title": "Hypertension", "category": "Cardiovascular", "urgency": 4, "likelihood": 9, "abrv": "HTN" },
        { "title": "Peptic Ulcer Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 7, "abrv": "PUD" },
        { "title": "Multiple Sclerosis", "category": "Neurological", "urgency": 5, "likelihood": 4, "abrv": "MS" },
        { "title": "Bronchitis", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "BRN" },
        { "title": "Atrial Fibrillation", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "AFib" },
        { "title": "Irritable Bowel Syndrome", "category": "Gastrointestinal", "urgency": 3, "likelihood": 8, "abrv": "IBS" },
        { "title": "Parkinson's Disease", "category": "Neurological", "urgency": 5, "likelihood": 3, "abrv": "PD" },
        { "title": "Acute Bronchiolitis", "category": "Respiratory", "urgency": 6, "likelihood": 5, "abrv": "ABR" },
        { "title": "Heart Failure", "category": "Cardiovascular", "urgency": 8, "likelihood": 7, "abrv": "HF" },
        { "title": "Gastritis", "category": "Gastrointestinal", "urgency": 4, "likelihood": 6, "abrv": "GSTR" },
        { "title": "Alzheimer's Disease", "category": "Neurological", "urgency": 3, "likelihood": 4, "abrv": "AD" },
        { "title": "Upper Respiratory Tract Infection", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "URTI" },
        { "title": "Coronary Artery Disease", "category": "Cardiovascular", "urgency": 7, "likelihood": 7, "abrv": "CAD" },
        { "title": "Liver Cirrhosis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "LC" },
        { "title": "Epiglottitis", "category": "Respiratory", "urgency": 9, "likelihood": 4, "abrv": "EPI" },
        { "title": "Hypertension Stage 2", "category": "Cardiovascular", "urgency": 5, "likelihood": 8, "abrv": "HTN2" },
        { "title": "Appendicitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 6, "abrv": "APN" },
        { "title": "Migraine Headache", "category": "Neurological", "urgency": 6, "likelihood": 7, "abrv": "MH" },
        { "title": "Pneumonia", "category": "Respiratory", "urgency": 6, "likelihood": 6, "abrv": "PNU" },
        { "title": "Asthma Exacerbation", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "ASTH" },
        { "title": "Stroke", "category": "Neurological", "urgency": 10, "likelihood": 7, "abrv": "STRK" },
        { "title": "Hypertensive Crisis", "category": "Cardiovascular", "urgency": 9, "likelihood": 6, "abrv": "HTNC" },
        { "title": "Gallstones", "category": "Gastrointestinal", "urgency": 5, "likelihood": 4, "abrv": "GLST" },
        { "title": "Seizure", "category": "Neurological", "urgency": 8, "likelihood": 5, "abrv": "SZR" },
        { "title": "Deep Vein Thrombosis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "DVT" },
        { "title": "Cholecystitis", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "CHOLC" },
        { "title": "Epilepsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "EPI" },
        { "title": "Chronic Obstructive Pulmonary Disease", "category": "Respiratory", "urgency": 6, "likelihood": 7, "abrv": "COPD" },
        { "title": "Hypertension", "category": "Cardiovascular", "urgency": 4, "likelihood": 9, "abrv": "HTN" },
        { "title": "Peptic Ulcer Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 7, "abrv": "PUD" },
        { "title": "Multiple Sclerosis", "category": "Neurological", "urgency": 5, "likelihood": 4, "abrv": "MS" },
        { "title": "Bronchitis", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "BRN" },
        { "title": "Atrial Fibrillation", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "AFib" },
        { "title": "Irritable Bowel Syndrome", "category": "Gastrointestinal", "urgency": 3, "likelihood": 8, "abrv": "IBS" },
        { "title": "Parkinson's Disease", "category": "Neurological", "urgency": 5, "likelihood": 3, "abrv": "PD" },
        { "title": "Acute Bronchiolitis", "category": "Respiratory", "urgency": 6, "likelihood": 5, "abrv": "ABR" },
        { "title": "Heart Failure", "category": "Cardiovascular", "urgency": 8, "likelihood": 7, "abrv": "HF" },
        { "title": "Gastritis", "category": "Gastrointestinal", "urgency": 4, "likelihood": 6, "abrv": "GSTR" },
        { "title": "Alzheimer's Disease", "category": "Neurological", "urgency": 3, "likelihood": 4, "abrv": "AD" },
        { "title": "Upper Respiratory Tract Infection", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "URTI" },
        { "title": "Coronary Artery Disease", "category": "Cardiovascular", "urgency": 7, "likelihood": 7, "abrv": "CAD" },
        { "title": "Liver Cirrhosis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "LC" },
        { "title": "Epiglottitis", "category": "Respiratory", "urgency": 9, "likelihood": 4, "abrv": "EPI" },
        { "title": "Hypertension Stage 2", "category": "Cardiovascular", "urgency": 5, "likelihood": 8, "abrv": "HTN2" },
        { "title": "Anemia", "category": "Hematological", "urgency": 4, "likelihood": 7, "abrv": "ANA" },
        { "title": "Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "LEU" },
        { "title": "Rheumatoid Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "RA" },
        { "title": "Urinary Tract Infection", "category": "Urological", "urgency": 5, "likelihood": 8, "abrv": "UTI" },
        { "title": "Diabetes Mellitus Type 2", "category": "Endocrine", "urgency": 5, "likelihood": 9, "abrv": "DM2" },
        { "title": "Hyperthyroidism", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "HTH" },
        { "title": "Hypothyroidism", "category": "Endocrine", "urgency": 4, "likelihood": 7, "abrv": "HTH" },
        { "title": "Sepsis", "category": "Infectious Disease", "urgency": 10, "likelihood": 5, "abrv": "SPS" },
        { "title": "Cellulitis", "category": "Dermatological", "urgency": 7, "likelihood": 6, "abrv": "CLLS" },
        { "title": "Psoriasis", "category": "Dermatological", "urgency": 4, "likelihood": 7, "abrv": "PSOR" },
        { "title": "Depression", "category": "Psychiatric", "urgency": 5, "likelihood": 8, "abrv": "DEPR" },
        { "title": "Bipolar Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "BPD" },
        { "title": "Hemophilia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HEMO" },
        { "title": "Chronic Kidney Disease", "category": "Nephrological", "urgency": 6, "likelihood": 7, "abrv": "CKD" },
        { "title": "Urinary Incontinence", "category": "Urological", "urgency": 4, "likelihood": 6, "abrv": "UI" },
        { "title": "Prostate Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "PCAN" },
        { "title": "Breast Cancer", "category": "Oncological", "urgency": 8, "likelihood": 5, "abrv": "BCAN" },
        { "title": "Cataract", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CAT" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Otitis Media", "category": "Otolaryngological", "urgency": 5, "likelihood": 8, "abrv": "OMI" },
        { "title": "Sinusitis", "category": "Otolaryngological", "urgency": 4, "likelihood": 7, "abrv": "SNST" },
        { "title": "Allergic Rhinitis", "category": "Allergy", "urgency": 4, "likelihood": 8, "abrv": "AR" },
        { "title": "Anaphylaxis", "category": "Allergy", "urgency": 10, "likelihood": 3, "abrv": "ANA" },
        { "title": "Immune Thrombocytopenic Purpura", "category": "Immunological", "urgency": 7, "likelihood": 4, "abrv": "ITP" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "Ankylosing Spondylitis", "category": "Rheumatological", "urgency": 5, "likelihood": 4, "abrv": "AS" },
        { "title": "Gout", "category": "Rheumatological", "urgency": 7, "likelihood": 5, "abrv": "GOUT" },
        { "title": "Osteoarthritis", "category": "Musculoskeletal", "urgency": 4, "likelihood": 8, "abrv": "OA" },
        { "title": "Osteoporosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "OPH" },
        { "title": "Type 1 Diabetes Mellitus", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "T1DM" },
        { "title": "Adrenal Insufficiency", "category": "Endocrine", "urgency": 7, "likelihood": 3, "abrv": "AI" },
        { "title": "HIV/AIDS", "category": "Infectious Disease", "urgency": 8, "likelihood": 4, "abrv": "HIV" },
        { "title": "Tuberculosis", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "TB" },
        { "title": "Psoriatic Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "PsA" },
        { "title": "Fibromyalgia", "category": "Musculoskeletal", "urgency": 4, "likelihood": 6, "abrv": "FM" },
        { "title": "Chronic Migraine", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "CM" },
        { "title": "Tension Headache", "category": "Neurological", "urgency": 3, "likelihood": 8, "abrv": "TH" },
        { "title": "Sinus Headache", "category": "Neurological", "urgency": 4, "likelihood": 7, "abrv": "SH" },
        { "title": "COVID-19", "category": "Infectious Disease", "urgency": 9, "likelihood": 6, "abrv": "COVID" },
        { "title": "Influenza", "category": "Infectious Disease", "urgency": 7, "likelihood": 7, "abrv": "FLU" },
        { "title": "Bacterial Meningitis", "category": "Infectious Disease", "urgency": 10, "likelihood": 3, "abrv": "BMN" },
        { "title": "Viral Hepatitis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "VH" },
        { "title": "Celiac Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 6, "abrv": "CELD" },
        { "title": "Hemorrhoids", "category": "Gastrointestinal", "urgency": 4, "likelihood": 7, "abrv": "HEM" },
        { "title": "Liver Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "LCAN" },
        { "title": "Colon Cancer", "category": "Oncological", "urgency": 8, "likelihood": 5, "abrv": "CCAN" },
        { "title": "Skin Infection", "category": "Dermatological", "urgency": 6, "likelihood": 7, "abrv": "SKINF" },
        { "title": "Eczema", "category": "Dermatological", "urgency": 4, "likelihood": 7, "abrv": "ECZ" },
        { "title": "Schizophrenia", "category": "Psychiatric", "urgency": 7, "likelihood": 4, "abrv": "SCHZ" },
        { "title": "Obsessive-Compulsive Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 6, "abrv": "OCD" },
        { "title": "Anxiety Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 9, "abrv": "ADIS" },
        { "title": "Post-Traumatic Stress Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "PTSD" },
        { "title": "Schizophreniform Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 3, "abrv": "SFD" },
        { "title": "Bipolar I Disorder", "category": "Psychiatric", "urgency": 7, "likelihood": 4, "abrv": "BPD1" },
        { "title": "Bipolar II Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 4, "abrv": "BPD2" },
        { "title": "Attention Deficit Hyperactivity Disorder", "category": "Psychiatric", "urgency": 4, "likelihood": 7, "abrv": "ADHD" },
        { "title": "Nightmare Disorder", "category": "Psychiatric", "urgency": 3, "likelihood": 6, "abrv": "NMD" },
        { "title": "Panic Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 7, "abrv": "PD" },
        { "title": "Bulimia Nervosa", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "BN" },
        { "title": "Anorexia Nervosa", "category": "Psychiatric", "urgency": 8, "likelihood": 4, "abrv": "AN" },
        { "title": "Dementia", "category": "Neurological", "urgency": 7, "likelihood": 5, "abrv": "DEM" },
        { "title": "Peripheral Neuropathy", "category": "Neurological", "urgency": 6, "likelihood": 6, "abrv": "PNP" },
        { "title": "Guillain-Barré Syndrome", "category": "Neurological", "urgency": 8, "likelihood": 3, "abrv": "GBS" },
        { "title": "Amyotrophic Lateral Sclerosis", "category": "Neurological", "urgency": 9, "likelihood": 2, "abrv": "ALS" },
        { "title": "Bell's Palsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "BP" },
        { "title": "Toxic Epidermal Necrolysis", "category": "Dermatological", "urgency": 10, "likelihood": 2, "abrv": "TEN" },
        { "title": "Stevens-Johnson Syndrome", "category": "Dermatological", "urgency": 10, "likelihood": 2, "abrv": "SJS" },
        { "title": "Vitiligo", "category": "Dermatological", "urgency": 3, "likelihood": 6, "abrv": "VTG" },
        { "title": "Erythroderma", "category": "Dermatological", "urgency": 7, "likelihood": 3, "abrv": "ERY" },
        { "title": "Atopic Dermatitis", "category": "Dermatological", "urgency": 5, "likelihood": 7, "abrv": "AD" },
        { "title": "Basal Cell Carcinoma", "category": "Oncological", "urgency": 6, "likelihood": 5, "abrv": "BCC" },
        { "title": "Squamous Cell Carcinoma", "category": "Oncological", "urgency": 7, "likelihood": 5, "abrv": "SCC" },
        { "title": "Malignant Melanoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "MM" },
        { "title": "Leukoplakia", "category": "Dental", "urgency": 5, "likelihood": 5, "abrv": "LEUK" },
        { "title": "Periodontitis", "category": "Dental", "urgency": 6, "likelihood": 6, "abrv": "PERIO" },
        { "title": "Dental Caries", "category": "Dental", "urgency": 4, "likelihood": 8, "abrv": "DC" },
        { "title": "Oral Thrush", "category": "Dental", "urgency": 5, "likelihood": 7, "abrv": "OT" },
        { "title": "Temporomandibular Joint Disorder", "category": "Dental", "urgency": 5, "likelihood": 5, "abrv": "TMJ" },
        { "title": "Dental Abscess", "category": "Dental", "urgency": 7, "likelihood": 6, "abrv": "DA" },
        { "title": "Halitosis", "category": "Dental", "urgency": 3, "likelihood": 7, "abrv": "HAL" },
        { "title": "Tooth Sensitivity", "category": "Dental", "urgency": 2, "likelihood": 8, "abrv": "TS" },
        { "title": "Enamel Erosion", "category": "Dental", "urgency": 4, "likelihood": 6, "abrv": "EE" },
        { "title": "Cavities", "category": "Dental", "urgency": 4, "likelihood": 8, "abrv": "CAV" },
        { "title": "Impacted Wisdom Tooth", "category": "Dental", "urgency": 6, "likelihood": 5, "abrv": "IWT" },
        { "title": "Orthodontic Malocclusion", "category": "Dental", "urgency": 3, "likelihood": 7, "abrv": "OML" },
        { "title": "Temporomandibular Joint Dysfunction", "category": "Dental", "urgency": 5, "likelihood": 6, "abrv": "TMJD" },
        { "title": "Xerostomia", "category": "Dental", "urgency": 4, "likelihood": 7, "abrv": "XERO" },
        { "title": "Dental Erosion", "category": "Dental", "urgency": 4, "likelihood": 6, "abrv": "DEN" },
        { "title": "Radiological Fracture", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "RAD-FX" },
        { "title": "Pulmonary Embolism", "category": "Cardiovascular", "urgency": 10, "likelihood": 4, "abrv": "PE" },
        { "title": "Acute Respiratory Distress Syndrome", "category": "Respiratory", "urgency": 10, "likelihood": 3, "abrv": "ARDS" },
        { "title": "Bronchopneumonia", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "BPN" },
        { "title": "Chronic Kidney Disease Stage 3", "category": "Nephrological", "urgency": 5, "likelihood": 6, "abrv": "CKD3" },
        { "title": "Nephrolithiasis", "category": "Nephrological", "urgency": 7, "likelihood": 5, "abrv": "NL" },
        { "title": "Urinary Retention", "category": "Urological", "urgency": 8, "likelihood": 4, "abrv": "UR" },
        { "title": "Testicular Torsion", "category": "Urological", "urgency": 10, "likelihood": 2, "abrv": "TT" },
        { "title": "Benign Prostatic Hyperplasia", "category": "Urological", "urgency": 5, "likelihood": 7, "abrv": "BPH" },
        { "title": "Prostatitis", "category": "Urological", "urgency": 6, "likelihood": 5, "abrv": "PROC" },
        { "title": "Interstitial Cystitis", "category": "Urological", "urgency": 5, "likelihood": 4, "abrv": "IC" },
        { "title": "Kidney Stones", "category": "Nephrological", "urgency": 8, "likelihood": 6, "abrv": "KS" },
        { "title": "Polycystic Kidney Disease", "category": "Nephrological", "urgency": 6, "likelihood": 4, "abrv": "PKD" },
        { "title": "Chronic Liver Disease", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "CLD" },
        { "title": "Hepatic Encephalopathy", "category": "Gastrointestinal", "urgency": 9, "likelihood": 3, "abrv": "HE" },
        { "title": "Portal Hypertension", "category": "Gastrointestinal", "urgency": 8, "likelihood": 4, "abrv": "PH" },
        { "title": "Esophageal Varices", "category": "Gastrointestinal", "urgency": 9, "likelihood": 3, "abrv": "EV" },
        { "title": "Hepatitis C", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "HCV" },
        { "title": "Lymphoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "LYMP" },
        { "title": "Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "LEU" },
        { "title": "Multiple Myeloma", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "MM" },
        { "title": "Sepsis", "category": "Infectious Disease", "urgency": 10, "likelihood": 5, "abrv": "SEP" },
        { "title": "Meningitis", "category": "Infectious Disease", "urgency": 10, "likelihood": 3, "abrv": "MEN" },
        { "title": "Endocarditis", "category": "Cardiovascular", "urgency": 8, "likelihood": 4, "abrv": "ENDO" },
        { "title": "Pericarditis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PERI" },
        { "title": "Cardiomyopathy", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "CMP" },
        { "title": "Valvular Heart Disease", "category": "Cardiovascular", "urgency": 6, "likelihood": 6, "abrv": "VHD" },
        { "title": "Aortic Dissection", "category": "Cardiovascular", "urgency": 10, "likelihood": 3, "abrv": "ADIS" },
        { "title": "Pericardial Effusion", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PEFF" },
        { "title": "Hypertrophic Cardiomyopathy", "category": "Cardiovascular", "urgency": 8, "likelihood": 4, "abrv": "HCM" },
        { "title": "Atherosclerosis", "category": "Cardiovascular", "urgency": 6, "likelihood": 7, "abrv": "ATH" },
        { "title": "Pulmonary Hypertension", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PH" },
        { "title": "Endometriosis", "category": "Gynecological", "urgency": 6, "likelihood": 5, "abrv": "ENDO" },
        { "title": "Polycystic Ovary Syndrome", "category": "Gynecological", "urgency": 5, "likelihood": 7, "abrv": "PCOS" },
        { "title": "Menorrhagia", "category": "Gynecological", "urgency": 6, "likelihood": 6, "abrv": "MENR" },
        { "title": "Ovarian Cyst", "category": "Gynecological", "urgency": 5, "likelihood": 6, "abrv": "OCY" },
        { "title": "Uterine Fibroids", "category": "Gynecological", "urgency": 5, "likelihood": 7, "abrv": "UF" },
        { "title": "Preeclampsia", "category": "Gynecological", "urgency": 9, "likelihood": 4, "abrv": "PREC" },
        { "title": "Ectopic Pregnancy", "category": "Gynecological", "urgency": 10, "likelihood": 3, "abrv": "ECP" },
        { "title": "Endometrial Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "ECAN" },
        { "title": "Breast Fibroadenoma", "category": "Oncological", "urgency": 6, "likelihood": 5, "abrv": "BFA" },
        { "title": "Thyroid Nodule", "category": "Endocrine", "urgency": 5, "likelihood": 7, "abrv": "THN" },
        { "title": "Hyperparathyroidism", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "HPTH" },
        { "title": "Pheochromocytoma", "category": "Endocrine", "urgency": 9, "likelihood": 3, "abrv": "PHEO" },
        { "title": "Addison's Disease", "category": "Endocrine", "urgency": 7, "likelihood": 4, "abrv": "ADD" },
        { "title": "Cushing's Syndrome", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "CUSH" },
        { "title": "Diabetic Ketoacidosis", "category": "Endocrine", "urgency": 9, "likelihood": 5, "abrv": "DKA" },
        { "title": "Hyperglycemic Hyperosmolar State", "category": "Endocrine", "urgency": 10, "likelihood": 4, "abrv": "HHS" },
        { "title": "Graves' Disease", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "GD" },
        { "title": "Hashimoto's Thyroiditis", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "HT" },
        { "title": "Adrenal Tumor", "category": "Endocrine", "urgency": 8, "likelihood": 3, "abrv": "ADTM" },
        { "title": "Thyroid Storm", "category": "Endocrine", "urgency": 10, "likelihood": 2, "abrv": "TS" },
        { "title": "Cushing's Disease", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "CD" },
        { "title": "Primary Hyperaldosteronism", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "PHA" },
        { "title": "Hypogonadism", "category": "Endocrine", "urgency": 5, "likelihood": 6, "abrv": "HYPOG" },
        { "title": "Osteoporosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "OPH" },
        { "title": "Rheumatoid Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "RA" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "Type 1 Diabetes Mellitus", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "T1DM" },
        { "title": "Hemophilia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HEMO" },
        { "title": "Gout", "category": "Rheumatological", "urgency": 7, "likelihood": 5, "abrv": "GOUT" },
        { "title": "Mononucleosis", "category": "Infectious Disease", "urgency": 5, "likelihood": 6, "abrv": "MONO" },
        { "title": "Lyme Disease", "category": "Infectious Disease", "urgency": 7, "likelihood": 4, "abrv": "LYME" },
        { "title": "Scarlet Fever", "category": "Infectious Disease", "urgency": 6, "likelihood": 5, "abrv": "SCF" },
        { "title": "Dengue Fever", "category": "Infectious Disease", "urgency": 8, "likelihood": 3, "abrv": "DENF" },
        { "title": "Yellow Fever", "category": "Infectious Disease", "urgency": 9, "likelihood": 2, "abrv": "YFEV" },
        { "title": "Zika Virus Infection", "category": "Infectious Disease", "urgency": 7, "likelihood": 3, "abrv": "ZIKA" },
        { "title": "Chikungunya", "category": "Infectious Disease", "urgency": 7, "likelihood": 3, "abrv": "CHK" },
        { "title": "Hepatitis B", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "HBV" },
        { "title": "Gonorrhea", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "GONO" },
        { "title": "Chlamydia", "category": "Infectious Disease", "urgency": 5, "likelihood": 7, "abrv": "CHML" },
        { "title": "Syphilis", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "SYPH" },
        { "title": "Herpes Simplex Virus", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "HSV" },
        { "title": "Varicella-Zoster Virus", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "VZV" },
        { "title": "Hepatitis A", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "HAV" },
        { "title": "Rotavirus Infection", "category": "Infectious Disease", "urgency": 5, "likelihood": 7, "abrv": "RV" },
        { "title": "Norovirus Infection", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "NV" },
        { "title": "AIDS-Related Complex", "category": "Infectious Disease", "urgency": 8, "likelihood": 3, "abrv": "ARC" },
        { "title": "Acute Lymphoblastic Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "ALL" },
        { "title": "Acute Myeloid Leukemia", "category": "Hematological", "urgency": 9, "likelihood": 3, "abrv": "AML" },
        { "title": "Chronic Lymphocytic Leukemia", "category": "Hematological", "urgency": 7, "likelihood": 4, "abrv": "CLL" },
        { "title": "Hairy Cell Leukemia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HCL" },
        { "title": "Essential Thrombocythemia", "category": "Hematological", "urgency": 6, "likelihood": 4, "abrv": "ET" },
        { "title": "Polycythemia Vera", "category": "Hematological", "urgency": 7, "likelihood": 4, "abrv": "PV" },
        { "title": "Chronic Myeloid Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 3, "abrv": "CML" },
        { "title": "Thrombocytopenia", "category": "Hematological", "urgency": 7, "likelihood": 5, "abrv": "TCP" },
        { "title": "Hemochromatosis", "category": "Hematological", "urgency": 6, "likelihood": 6, "abrv": "HCH" },
        { "title": "Sickle Cell Disease", "category": "Hematological", "urgency": 8, "likelihood": 3, "abrv": "SCD" },
        { "title": "Chronic Fatigue Syndrome", "category": "Psychological", "urgency": 5, "likelihood": 6, "abrv": "CFS" },
        { "title": "Insomnia", "category": "Psychological", "urgency": 4, "likelihood": 8, "abrv": "INS" },
        { "title": "Restless Legs Syndrome", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "RLS" },
        { "title": "Narcolepsy", "category": "Neurological", "urgency": 6, "likelihood": 4, "abrv": "NARCO" },
        { "title": "Vertigo", "category": "Neurological", "urgency": 5, "likelihood": 7, "abrv": "VERT" },
        { "title": "Bell's Palsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "BP" },
        { "title": "Myasthenia Gravis", "category": "Neurological", "urgency": 7, "likelihood": 4, "abrv": "MG" },
        { "title": "Carpal Tunnel Syndrome", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "CTS" },
        { "title": "Tendonitis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "TEND" },
        { "title": "Bursitis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "BUR" },
        { "title": "Scoliosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "SCOL" },
        { "title": "Fibromyalgia", "category": "Musculoskeletal", "urgency": 4, "likelihood": 6, "abrv": "FM" },
        { "title": "Osteomyelitis", "category": "Musculoskeletal", "urgency": 8, "likelihood": 4, "abrv": "OSTM" },
        { "title": "Lumbago", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "LUM" },
        { "title": "Sciatica", "category": "Musculoskeletal", "urgency": 6, "likelihood": 6, "abrv": "SCIAT" },
        { "title": "Ankylosing Spondylitis", "category": "Rheumatological", "urgency": 5, "likelihood": 4, "abrv": "AS" },
        { "title": "Temporomandibular Joint Disorder", "category": "Dental", "urgency": 5, "likelihood": 6, "abrv": "TMJ-DS" },
        { "title": "Carcinoid Syndrome", "category": "Oncological", "urgency": 7, "likelihood": 3, "abrv": "CS" },
        { "title": "Lung Cancer", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "LCAN" },
        { "title": "Pancreatic Cancer", "category": "Oncological", "urgency": 10, "likelihood": 3, "abrv": "PCAN" },
        { "title": "Renal Cell Carcinoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "RCC" },
        { "title": "Bladder Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "BLCA" },
        { "title": "Testicular Cancer", "category": "Oncological", "urgency": 9, "likelihood": 3, "abrv": "TC" },
        { "title": "Klinefelter Syndrome", "category": "Endocrine", "urgency": 5, "likelihood": 3, "abrv": "KSY" },
        { "title": "Turner Syndrome", "category": "Endocrine", "urgency": 5, "likelihood": 3, "abrv": "TSY" },
        { "title": "Kallmann Syndrome", "category": "Endocrine", "urgency": 6, "likelihood": 2, "abrv": "KLS" },
        { "title": "Prader-Willi Syndrome", "category": "Pediatric", "urgency": 7, "likelihood": 2, "abrv": "PWS" },
        { "title": "Williams Syndrome", "category": "Pediatric", "urgency": 6, "likelihood": 2, "abrv": "WLS" },
        { "title": "Autism Spectrum Disorder", "category": "Psychological", "urgency": 5, "likelihood": 7, "abrv": "ASD" },
        { "title": "Down Syndrome", "category": "Pediatric", "urgency": 6, "likelihood": 3, "abrv": "DS" },
        { "title": "Attention Deficit Disorder", "category": "Psychological", "urgency": 4, "likelihood": 8, "abrv": "ADD" },
        { "title": "Tourette Syndrome", "category": "Neurological", "urgency": 6, "likelihood": 4, "abrv": "TS" },
        { "title": "Fragile X Syndrome", "category": "Pediatric", "urgency": 5, "likelihood": 3, "abrv": "FXS" },
        { "title": "Marfan Syndrome", "category": "Musculoskeletal", "urgency": 7, "likelihood": 3, "abrv": "MFS" },
        { "title": "Ehlers-Danlos Syndrome", "category": "Musculoskeletal", "urgency": 7, "likelihood": 3, "abrv": "EDS" },
        { "title": "Hemangioma", "category": "Dermatological", "urgency": 4, "likelihood": 5, "abrv": "HGM" },
        { "title": "Vasculitis", "category": "Immunological", "urgency": 7, "likelihood": 4, "abrv": "VASC" },
        { "title": "Goodpasture Syndrome", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPS" },
        { "title": "Dermatomyositis", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "DM" },
        { "title": "Granulomatosis with Polyangiitis", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPA" },
        { "title": "Systemic Sclerosis", "category": "Immunological", "urgency": 7, "likelihood": 3, "abrv": "SS" },
        { "title": "Churg-Strauss Syndrome", "category": "Immunological", "urgency": 8, "likelihood": 2, "abrv": "CSS" },
        { "title": "Henoch-Schönlein Purpura", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "HSP" },
        { "title": "Lupus Nephritis", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "LN" },
        { "title": "Behçet's Disease", "category": "Immunological", "urgency": 7, "likelihood": 3, "abrv": "BD" },
        { "title": "IgA Nephropathy", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IgAN" },
        { "title": "Nephrotic Syndrome", "category": "Nephrological", "urgency": 7, "likelihood": 5, "abrv": "NS" },
        { "title": "Polycystic Liver Disease", "category": "Nephrological", "urgency": 5, "likelihood": 3, "abrv": "PLD" },
        { "title": "Acute Glomerulonephritis", "category": "Nephrological", "urgency": 8, "likelihood": 3, "abrv": "AGN" },
        { "title": "Chronic Glomerulonephritis", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "CGN" },
        { "title": "Renal Artery Stenosis", "category": "Nephrological", "urgency": 8, "likelihood": 3, "abrv": "RAS" },
        { "title": "Renal Vein Thrombosis", "category": "Nephrological", "urgency": 9, "likelihood": 2, "abrv": "RVT" },
        { "title": "Nephrogenic Systemic Fibrosis", "category": "Nephrological", "urgency": 9, "likelihood": 2, "abrv": "NSF" },
        { "title": "Neurogenic Bladder", "category": "Urological", "urgency": 6, "likelihood": 4, "abrv": "NB" },
        { "title": "Interstitial Nephritis", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IN" },
        { "title": "Urethritis", "category": "Urological", "urgency": 6, "likelihood": 6, "abrv": "URETH" },
        { "title": "Prostatitis", "category": "Urological", "urgency": 6, "likelihood": 5, "abrv": "PROC" },
        { "title": "Nephroblastoma", "category": "Nephrological", "urgency": 8, "likelihood": 2, "abrv": "NW" },
        { "title": "Goodpasture Syndrome", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPS" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "IgA Nephropathy", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IgAN" },
        { "title": "Xerophthalmia", "category": "Ophthalmological", "urgency": 6, "likelihood": 5, "abrv": "XTO" },
        { "title": "Retinopathy of Prematurity", "category": "Ophthalmological", "urgency": 8, "likelihood": 3, "abrv": "ROP" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Macular Degeneration", "category": "Ophthalmological", "urgency": 7, "likelihood": 5, "abrv": "MD" },
        { "title": "Conjunctivitis", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CONJ" },
        { "title": "Uveitis", "category": "Ophthalmological", "urgency": 7, "likelihood": 4, "abrv": "UVEI" },
        { "title": "Keratitis", "category": "Ophthalmological", "urgency": 8, "likelihood": 4, "abrv": "KER" },
        { "title": "Blepharitis", "category": "Ophthalmological", "urgency": 4, "likelihood": 6, "abrv": "BLEP" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Retinal Detachment", "category": "Ophthalmological", "urgency": 9, "likelihood": 3, "abrv": "RD" },
        { "title": "Optic Neuritis", "category": "Ophthalmological", "urgency": 8, "likelihood": 4, "abrv": "ON" },
        { "title": "Cataract", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CAT" },
        { "title": "Hyperopia", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "HYP" },
        { "title": "Myopia", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "MYO" },
        { "title": "Astigmatism", "category": "Ophthalmological", "urgency": 2, "likelihood": 9, "abrv": "ASTG" },
        { "title": "Presbyopia", "category": "Ophthalmological", "urgency": 2, "likelihood": 9, "abrv": "PRSP" },
        { "title": "Blepharoptosis", "category": "Ophthalmological", "urgency": 5, "likelihood": 6, "abrv": "BLEP-O" },
        { "title": "Strabismus", "category": "Ophthalmological", "urgency": 4, "likelihood": 7, "abrv": "STRB" },
        { "title": "Color Blindness", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "CB" },
        { "title": "Amblyopia", "category": "Ophthalmological", "urgency": 6, "likelihood": 5, "abrv": "AMB" },
        { "title": "Flashes and Floaters", "category": "Ophthalmological", "urgency": 7, "likelihood": 5, "abrv": "FF" },
        { "title": "Ocular Hypertension", "category": "Ophthalmological", "urgency": 6, "likelihood": 6, "abrv": "OH" },
        { "title": "Dry Eye Syndrome", "category": "Ophthalmological", "urgency": 4, "likelihood": 7, "abrv": "DES" },
        { "title": "Biopsy Findings", "category": "Radiological", "urgency": 5, "likelihood": 5, "abrv": "BIOF" },
        { "title": "Fracture Detection", "category": "Radiological", "urgency": 7, "likelihood": 6, "abrv": "FRD" },
        { "title": "Radiological Osteoporosis", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "RAD-OPO" },
        { "title": "MRI Findings", "category": "Radiological", "urgency": 5, "likelihood": 5, "abrv": "MRI-F" },
        { "title": "CT Scan Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "CT-F" },
        { "title": "Ultrasound Detection", "category": "Radiological", "urgency": 5, "likelihood": 7, "abrv": "US-D" },
        { "title": "X-Ray Abnormality", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "XRAY-A" },
        { "title": "Bone Density Low", "category": "Radiological", "urgency": 5, "likelihood": 7, "abrv": "BMD-LOW" },
        { "title": "Chest X-Ray Pneumonia", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "CXR-P" },
        { "title": "CT Angiography Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "CT-A" },
        { "title": "Mammography Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "MM-F" },
        { "title": "Echocardiogram Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "ECHO-F" },
        { "title": "PET Scan Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "PET-F" },
        { "title": "Spinal MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "SMRI-F" },
        { "title": "Doppler Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "DOP-F" },
        { "title": "Neck CT Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "NCT-F" },
        { "title": "Abdominal Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "ABDU-F" },
        { "title": "Cardiac MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "C-MRI-F" },
        { "title": "Brain CT Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "BCT-F" },
        { "title": "Lumbar X-Ray Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "LX-F" },
        { "title": "Skull X-Ray Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "SX-F" },
        { "title": "Chest CT Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "CHCT-F" },
        { "title": "Pelvic Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "P-UL-F" },
        { "title": "Thoracic MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "T-MRI-F" },
        { "title": "Whole Body Scan Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "WB-F" },
        { "title": "Chest X-Ray Cardiomegaly", "category": "Radiological", "urgency": 8, "likelihood": 5, "abrv": "CXR-CM" },
        { "title": "Hepatic Steatosis on Ultrasound", "category": "Radiological", "urgency": 6, "likelihood": 5, "abrv": "HS-U" },
        { "title": "Right Lower Lobe Pneumonia on X-Ray", "category": "Radiological", "urgency": 7, "likelihood": 6, "abrv": "RLLP-X" },
        { "title": "Left Ventricular Hypertrophy on ECG", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "LVH-ECG" },
        { "title": "Echocardiogram Reveals Mitral Valve Prolapse", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "MVP-ECHO" },
        { "title": "Chest CT Shows Pulmonary Embolism", "category": "Radiological", "urgency": 9, "likelihood": 4, "abrv": "PE-CT" },
        { "title": "Brain MRI Shows Multiple Sclerosis Lesions", "category": "Neurological", "urgency": 8, "likelihood": 4, "abrv": "MS-MRI" },
        { "title": "Abdominal CT Reveals Acute Pancreatitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 5, "abrv": "AP-CT" },
        { "title": "Chest X-Ray Negative for Pneumonia", "category": "Radiological", "urgency": 4, "likelihood": 7, "abrv": "CXR-NP" },
        { "title": "Ultrasound Detects Kidney Stones", "category": "Nephrological", "urgency": 8, "likelihood": 6, "abrv": "KS-US" },
        { "title": "Echocardiogram Shows Left Atrial Enlargement", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "LAE-ECHO" },
        { "title": "Bone Scan Indicates Metastasis", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "BS-MET" },
        { "title": "CT Scan Reveals Aortic Aneurysm", "category": "Cardiovascular", "urgency": 10, "likelihood": 3, "abrv": "AA-CT" },
        { "title": "MRI Shows Spinal Cord Compression", "category": "Neurological", "urgency": 10, "likelihood": 3, "abrv": "SCC-MRI" },
        { "title": "Ultrasound Shows Biliary Obstruction", "category": "Gastrointestinal", "urgency": 8, "likelihood": 4, "abrv": "BO-UL" },
        { "title": "Pelvic MRI Detects Ovarian Cysts", "category": "Gynecological", "urgency": 6, "likelihood": 5, "abrv": "OC-PMRI" },
        { "title": "Chest MRI Identifies Cardiac Mass", "category": "Cardiovascular", "urgency": 9, "likelihood": 4, "abrv": "CM-MRI" },
        { "title": "Spinal X-Ray Shows Herniated Disc", "category": "Musculoskeletal", "urgency": 7, "likelihood": 5, "abrv": "HD-SXR" },
        { "title": "Thyroid Ultrasound Reveals Nodule", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "TN-US" },
        { "title": "Occipital Lobe Seizure Detected on EEG", "category": "Neurological", "urgency": 8, "likelihood": 4, "abrv": "OLS-EEG" },
        { "title": "Abdominal MRI Detects Liver Tumor", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "LT-MRI" },
        { "title": "Chest X-Ray Shows Enlarged Heart", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "EH-CXR" },
        { "title": "Ultrasound Detects Gallbladder Inflammation", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "GI-US" },
        { "title": "Knee X-Ray Shows Osteoarthritis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "OA-KXR" },
        { "title": "Axial Spondylitis Detected on MRI", "category": "Rheumatological", "urgency": 7, "likelihood": 4, "abrv": "AS-MRI" },
        { "title": "Brain CT Reveals Hemorrhage", "category": "Neurological", "urgency": 10, "likelihood": 4, "abrv": "BRH-CT" }
    ]
})
});

}