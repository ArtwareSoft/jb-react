async function jbLoadPacked({uri,initSpyByUrl}={}) {
const jb = {"sourceCode":{"plugins":["ui-misc","ui-iframe-dialog"]},"loadedFiles":{},"plugins":{"common":{"id":"common","dependent":["core"],"proxies":["pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","action","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test"],"files":["/plugins/common/jb-common.js"]},"core":{"id":"core","dependent":[],"proxies":["call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test"],"files":["/plugins/core/core-components.js","/plugins/core/core-utils.js","/plugins/core/db.js","/plugins/core/jb-core.js","/plugins/core/jb-expression.js","/plugins/core/jb-macro.js","/plugins/core/spy.js"]},"loader":{"id":"loader","dependent":[],"proxies":["sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"dslOfFiles":[["/plugins/loader/source-code.js","loader"]],"files":["/plugins/loader/jb-loader.js","/plugins/loader/source-code.js"]},"rx":{"id":"rx","dependent":["watchable","common","core"],"proxies":["source","rx","sink","action","rxPipe","rxFlow","sourcePipe","data","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","Var","resource","reduce","count","joinIntoVariable","join","max","Do","doPromise","map","mapPromise","filter","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","unique","catchError","timeoutLimit","throwError","debounceTime","throttleTime","delay","replay","takeUntil","take","takeWhile","toArray","last","skip","log","consoleLog","sniffer","subscribe","writeValue","rxSubject","subjectNext","subject","rxQueue","runTransaction","pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","matchRegex","toUpperCase","toLowerCase","capitalize","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","remark","unknownCmp","runCtx","vars","isRef","asRef","test"],"dslOfFiles":[["/plugins/rx/rx.js","rx"]],"files":["/plugins/rx/jb-callbag.js","/plugins/rx/rx-comps.js","/plugins/rx/rx.js"]},"ui-common":{"id":"ui-common","dependent":["ui-core","watchable","common","core","rx"],"proxies":["button","css","editableText","field","validation","group","inlineControls","dynamicControls","controlWithCondition","controls","html","itemlist","layout","flexItem","text","defaultTheme","theme","method","watchAndCalcModelProp","calcProp","userStateProp","calcProps","feature","onDestroy","templateModifier","features","followUp","watchRef","htmlAttribute","cmpId","id","watchable","variable","hidden","refreshControlById","refreshIfNotWatchable","runFEMethod","frontEnd","action","backend","sink","source","rx","key","uiPlugin","service","customStyle","styleByControl","styleWithFeatures","controlWithFeatures","renderWidget","runTransaction","pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test","rxPipe","rxFlow","sourcePipe","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","max","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue"],"files":["/plugins/ui/common/button.js","/plugins/ui/common/css-features.js","/plugins/ui/common/editable-text.js","/plugins/ui/common/field.js","/plugins/ui/common/group.js","/plugins/ui/common/html.js","/plugins/ui/common/itemlist-selection.js","/plugins/ui/common/itemlist.js","/plugins/ui/common/layout-styles.js","/plugins/ui/common/text.js","/plugins/ui/common/theme.js"]},"ui-core":{"id":"ui-core","dependent":["watchable","common","core","rx"],"proxies":["method","watchAndCalcModelProp","calcProp","userStateProp","calcProps","feature","onDestroy","templateModifier","features","followUp","watchRef","group","htmlAttribute","cmpId","id","watchable","variable","hidden","refreshControlById","refreshIfNotWatchable","runFEMethod","css","frontEnd","action","backend","sink","source","rx","key","uiPlugin","service","customStyle","styleByControl","styleWithFeatures","controlWithFeatures","renderWidget","runTransaction","pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test","rxPipe","rxFlow","sourcePipe","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","max","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue"],"files":["/plugins/ui/core/core-features.js","/plugins/ui/core/front-end-features.js","/plugins/ui/core/jb-react.js","/plugins/ui/core/ui-comp.js","/plugins/ui/core/ui-frontend.js","/plugins/ui/core/ui-utils.js","/plugins/ui/core/ui-watchref.js","/plugins/ui/core/vdom.js"]},"ui-iframe-dialog":{"id":"ui-iframe-dialog","dependent":["ui-misc","ui-common","ui-core","watchable","common","core","rx","ui-iframe-launcher","loader"],"proxies":["renderDialogInIframe","inIframe","openDialog","dialog","inPlaceDialog","dialogs","dialogFeature","source","popup","popupLocation","divider","editableBoolean","editableNumber","editableText","control","icon","feature","image","group","itemlistContainer","filterType","search","itemlist","markdown","menu","menuStyle","menuSeparator","multiSelect","picklist","select","table","button","css","field","validation","inlineControls","dynamicControls","controlWithCondition","controls","html","layout","flexItem","text","defaultTheme","theme","method","watchAndCalcModelProp","calcProp","userStateProp","calcProps","onDestroy","templateModifier","features","followUp","watchRef","htmlAttribute","cmpId","id","watchable","variable","hidden","refreshControlById","refreshIfNotWatchable","runFEMethod","frontEnd","action","backend","sink","rx","key","uiPlugin","service","customStyle","styleByControl","styleWithFeatures","controlWithFeatures","renderWidget","runTransaction","pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test","rxPipe","rxFlow","sourcePipe","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","max","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue","renderWidgetInIframe","sourceCode","sourceCodeByTgpPath","plugins","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"files":["/plugins/ui/iframe/dialog/iframe-dialog-DD.js"]},"ui-iframe-launcher":{"id":"ui-iframe-launcher","dependent":["loader"],"proxies":["renderWidgetInIframe","sourceCode","sourceCodeByTgpPath","plugins","extend","project","sameAsParent","pluginsByPath","loadAll","packagesByPath","defaultPackage","staticViaHttp","jbStudioServer","fileSystem","zipFile"],"files":["/plugins/ui/iframe/launcher/iframe-launcher.js"]},"ui-misc":{"id":"ui-misc","dependent":["ui-common","ui-core","watchable","common","core","rx"],"proxies":["openDialog","dialog","inPlaceDialog","dialogs","dialogFeature","source","popup","popupLocation","divider","editableBoolean","editableNumber","editableText","control","icon","feature","image","group","itemlistContainer","filterType","search","itemlist","markdown","menu","menuStyle","menuSeparator","multiSelect","picklist","select","table","button","css","field","validation","inlineControls","dynamicControls","controlWithCondition","controls","html","layout","flexItem","text","defaultTheme","theme","method","watchAndCalcModelProp","calcProp","userStateProp","calcProps","onDestroy","templateModifier","features","followUp","watchRef","htmlAttribute","cmpId","id","watchable","variable","hidden","refreshControlById","refreshIfNotWatchable","runFEMethod","frontEnd","action","backend","sink","rx","key","uiPlugin","service","customStyle","styleByControl","styleWithFeatures","controlWithFeatures","renderWidget","runTransaction","pipeline","pipe","list","firstSucceeding","firstNotEmpty","keys","values","properties","objFromProperties","entries","aggregate","math","objFromEntries","evalExpression","prefix","suffix","removePrefix","removeSuffix","removeSuffixRegex","property","indexOf","writeValue","addToArray","move","splice","removeFromArray","getOrCreate","toggleBooleanValue","slice","sort","first","last","count","reverse","sample","obj","dynamicObject","extend","assign","extendWithIndex","prop","not","and","or","between","contains","notContains","startsWith","endsWith","filter","matchRegex","toUpperCase","toLowerCase","capitalize","join","unique","log","asIs","object","json","split","replace","isNull","notNull","isEmpty","notEmpty","equals","notEquals","runActions","runActionOnItem","runActionOnItems","delay","onNextTimer","extractPrefix","extractSuffix","range","typeOf","className","isOfType","inGroup","Switch","Case","formatDate","formatNumber","getSessionStorage","waitFor","addComponent","loadLibs","loadAppFiles","call","typeAdapter","If","TBD","Var","remark","unknownCmp","runCtx","vars","data","isRef","asRef","test","rxPipe","rxFlow","sourcePipe","watchableData","callbag","callback","animationFrame","event","any","promise","promises","interval","merge","mergeConcat","elems","startWith","resource","reduce","joinIntoVariable","max","Do","doPromise","map","mapPromise","flatMap","flatMapArrays","concatMap","distinctUntilChanged","distinct","catchError","timeoutLimit","throwError","debounceTime","throttleTime","replay","takeUntil","take","takeWhile","toArray","skip","consoleLog","sniffer","subscribe","rxSubject","subjectNext","subject","rxQueue"],"files":["/plugins/ui/misc/dialog.js","/plugins/ui/misc/divider.js","/plugins/ui/misc/editable-boolean.js","/plugins/ui/misc/editable-number.js","/plugins/ui/misc/editable-text-helper-popup.js","/plugins/ui/misc/icon.js","/plugins/ui/misc/image.js","/plugins/ui/misc/itemlist-container.js","/plugins/ui/misc/itemlist-dd.js","/plugins/ui/misc/itemlist-scroll.js","/plugins/ui/misc/markdown-viewer.js","/plugins/ui/misc/menu.js","/plugins/ui/misc/multi-select.js","/plugins/ui/misc/picklist.js","/plugins/ui/misc/table.js"]},"watchable":{"id":"watchable","dependent":[],"proxies":["runTransaction"],"files":["/plugins/watchable/watchable.js"]}}}
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

jb.initializeTypeRules(["ui","markdown","watchable","immutable","utils","db","core","expression","macro","syntaxConverter","spy","callbag","iframe","loader"])
await jb.initializeLibs(["ui","markdown","watchable","immutable","utils","db","core","expression","macro","syntaxConverter","spy","callbag","iframe","loader"])
jb.beforeResolveTime = new Date().getTime()
jb.utils.resolveLoadedProfiles()
jb.resolveTime = new Date().getTime()-jb.beforeResolveTime
return jb
}

function jbloadPlugins(jb,jbLoadPackedFile) {
jbLoadPackedFile({lineInPackage:43, jb, noProxies: true, path: '/plugins/core/jb-core.js',fileDsl: '', pluginId: 'core' }, 
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
        if (codePackage.loadLib) 
          return codePackage.loadLib(url)
        const code = await codePackage.fetchFile(`${jbHost.baseUrl||''}${url}`)
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
      if (ctx.probe && !ctx.probe.active) return
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
      const ctxWithVars = jb.core.extendWithVars(ctx,profile.$vars)
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
            : paramObj.type == 'array' ? paramObj.array.map(function prepareParamItem(prof,i) { 
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
              func = (ctx2,data2) => jb.utils.flattenArray(valOrDefaultArray.map((prof,i)=> runCtx.extendVars(ctx2,data2).runInner(prof, {...param, as: 'asIs'}, path+'~'+i)))
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

jbLoadPackedFile({lineInPackage:464, jb, noProxies: true, path: '/plugins/core/core-utils.js',fileDsl: '', pluginId: 'core' }, 
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
    singleInType(parentParam, tgpModel) {
        const comps = tgpModel && tgpModel.comps || jb.comps
        const _type = parentParam && parentParam.type && parentParam.type.split('[')[0]
        return _type && comps[_type] && comps[_type].singleInType && _type
    },
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
          ;(comp.moreTypes || '').split(',').filter(x=>x).forEach(t=>jb.comps[t+id] = comp)
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
    resolveUnTypedProfile(comp,id, {tgpModel, dsl} = {}) {
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
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.defaultValue, {expectedType: p.$type, topComp}))
      ;(topComp.params || []).forEach(p=> jb.utils.resolveProfile(p.templateValue, {expectedType: p.$type, topComp}))
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
  
      const allTypes = jb.utils.unique([moreTypesFromProp,byTypeRules,dynamicTypeFromParent,typeFromParent,dslType].filter(x=>x).join(',').split(',').filter(x=>x))
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
    subscribe: (source,listener) => jb.callbag.subscribe(listener)(source),  
    indexOfCompDeclarationInTextLines(lines,id) {
      return lines.findIndex(line=> {
        const index = line.indexOf(`component('${id.split('>').pop()}'`)
        return index == 0 || index == 3
      })
    },
    calcDirectory: dir => dir[0] != '/' ? `${jbHost.baseUrl}/${dir}` : dir,
})

extension('utils', 'generic', {
    isEmpty: o => Object.keys(o).length === 0,
    isObject: o => o != null && typeof o === 'object',
    isPrimitiveValue: val => ['string','boolean','number'].indexOf(typeof val) != -1,
    tryWrapper(f,msg,ctx,reqCtx) { try { return f() } catch(e) { jb.logException(e,msg,{ctx,reqCtx}) }},
    flattenArray: items => items.flatMap(x=>x),
    isPromise: v => v && v != null && typeof v.then === 'function',
    isDelayed(v) {
      if (!v || v.constructor === {}.constructor || Array.isArray(v)) return
      return typeof v === 'object' ? jb.utils.isPromise(v) : typeof v === 'function' && jb.utils.isCallbag(v)
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

    unique: (ar,f) => {
      const keys = {}, res = []
      ar.forEach(x =>{
        const key = f ? f(x) : x
        if (!keys[key]) res.push(x)
        keys[key] = true
      })
      return res
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

});

jbLoadPackedFile({lineInPackage:872, jb, noProxies: true, path: '/plugins/core/core-components.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
component('call', {
  type: 'any',
  hidden: true,
  description: 'invoke dynamic parameter',
  category: 'system:50',
  params: [
    {id: 'param', as: 'string', description: 'parameter name'}
  ],
  impl: (ctx,param) => {
 	  const paramObj = ctx.cmpCtx && ctx.cmpCtx.params[param]
      return typeof paramObj == 'function' ?
 		  paramObj(new jb.core.jbCtx(ctx, { cmpCtx: paramObj.runCtx, forcePath: paramObj.srcPath })) : paramObj
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
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  },
})

component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'text', as: 'string', mandatory: true}
  ],
  macro: (result, self) => Object.assign(result,{ $remark: self.$unresolved[0] })
})

component('unknownCmp', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'id', as: 'string', mandatory: true}
  ],
  macro: (result, self) => jb.comps[self.$unresolved[0]] = { impl: ctx => jb.logError(`comp ${self.$unresolved[0]} is not defined`,{ctx})}
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

component('Var', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

component('vars', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

component('data', {
  type: 'ctx',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
})

});

jbLoadPackedFile({lineInPackage:982, jb, noProxies: true, path: '/plugins/core/jb-expression.js',fileDsl: '', pluginId: 'core' }, 
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
      jb.comps.log.impl(ctx, out)
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
      jb.comps.log.impl(ctx, calculated + ':' + result)
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

jbLoadPackedFile({lineInPackage:1137, jb, noProxies: true, path: '/plugins/core/db.js',fileDsl: '', pluginId: 'core' }, 
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

jbLoadPackedFile({lineInPackage:1287, jb, noProxies: true, path: '/plugins/core/jb-macro.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item)),
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

extension('macro', {
    initExtension() {
        return { 
            proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro'), 
            systemProps: ['remark', 'data', '$debug', '$disabled', '$log', 'ctx' ],
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
    //isParamsByNameArgs : args => args.length == 1 && typeof args[0] == 'object' && !Array.isArray(args[0]) && !jb.utils.compName(args[0]),    
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
            args[0].remark && jb.comps.remark.macro(system, args[0])
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
        const param0 = params[0] || {}        
        const firstParamAsArray = (param0.type||'').indexOf('[]') != -1 && !param0.byName

        if (!lastArgIsByName) {
            if (firstParamAsArray)
                return { $: cmpId, [param0.id]: params.length > 1 && args.length == 1 ? args[0] : args }

            if (comp.macroByValue || params.length < 3)
                return { $: cmpId, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
        }

        const varArgs = []
        while (argsByValue[0] && argsByValue[0].$ == 'Var')
            varArgs.push(argsByValue.shift())
        const firstProps = onlyByName ? [] : firstParamAsArray ? { [param0.id] : argsByValue } : jb.objFromEntries(argsByValue.map((v,i) => [params[i].id, v]))
        return { $: cmpId,
            ...(varArgs.length ? {$vars: varArgs} : {}),
            ...firstProps, ...propsByName
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
    // if (profile.$ == 'uiFrontEndTest' && profile.$unresolved[0].action) {
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
    if (profile.remark) {
        profile.$remark = profile.remark
        delete profile.remark
    }
    
    if (profile.$ == 'object')
        return {$: 'obj', props: jb.entries(profile).filter(([x]) =>x!='$').map(([title,val]) => ({$: 'prop', title, val: jb.syntaxConverter.fixProfile(val,origin) }))}

    if (Array.isArray(profile)) 
        return profile.map(v=>jb.syntaxConverter.fixProfile(v,origin))

    return jb.objFromEntries(jb.entries(profile).map(([k,v]) => [k,jb.syntaxConverter.fixProfile(v,origin)]))
  }
})
});

jbLoadPackedFile({lineInPackage:1443, jb, noProxies: true, path: '/plugins/core/spy.js',fileDsl: '', pluginId: 'core' }, 
            function({jb,require,component,extension,using,dsl,pluginDsl}) {
extension('spy', {
	$requireFuncs: '#spy.log',
	initExtension() {
		// jb.spy.log() -- for codeLoader
		return {
			logs: [],
			enrichers: [],
			settings: { 
				includeLogs: 'error',
				stackFilter: /spy|jb_spy|Object.log|rx-comps|jb-core|node_modules/i,
				MAX_LOG_SIZE: 10000
			},
			Error: jb.frame.Error
		}
	},
	initSpyByUrl() {
		const frame = jb.frame
		const getUrl = () => { try { return frame.location && frame.location.href } catch(e) {} }
		const getParentUrl = () => { try { return frame.parent && frame.parent.location.href } catch(e) {} }
		const getSpyParam = url => (url.match('[?&]spy=([^&]+)') || ['', ''])[1]
		jb.spy.initSpy({spyParam :frame && frame.jbUri == 'studio' && (getUrl().match('[?&]sspy=([^&]+)') || ['', ''])[1] || 
			getSpyParam(getParentUrl() || '') || getSpyParam(getUrl() || '')})
		jb.spy.calcIncludeLogsFromSpyParam()
	},
	initSpy({spyParam}) {
		if (!spyParam) return
		jb.spy.spyParam = spyParam
		jb.spy.enabled = true
		if (jb.frame) jb.frame.spy = jb.spy // for console use
		jb.spy.includeLogsInitialized = false
		jb.spy._obs = jb.callbag && jb.callbag.subject()
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
		jb.spy.includeLogs = jb.spy.settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
			acc[log] = true
			return acc
		}, {})
		jb.spy.includeLogsInitialized = true
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
		if (!jb.spy.includeLogsInitialized) jb.spy.calcIncludeLogsFromSpyParam(jb.spy.spyParam)
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
jbLoadPackedFile({lineInPackage:1647, jb, noProxies: false, path: '/plugins/watchable/watchable.js',fileDsl: '', pluginId: 'watchable' }, 
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

jbLoadPackedFile({lineInPackage:2140, jb, noProxies: false, path: '/plugins/common/jb-common.js',fileDsl: '', pluginId: 'common' }, 
            function({jb,require,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,action,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
using('core')

extension('utils', 'pipe', {
  calcPipe(ctx,ptName,passRx) {
    let start = jb.toarray(ctx.data)
    if (start.length == 0) start = [null]
    if (typeof ctx.profile.items == 'string')
      return ctx.runInner(ctx.profile.items,null,'items');
    const profiles = jb.asArray(ctx.profile.items || ctx.profile[ptName]);
    const innerPath = (ctx.profile.items && ctx.profile.items.sugar) ? ''
      : (ctx.profile[ptName] ? (ptName + '~') : 'items~');

    if (ptName == '$pipe') return (async function pipe() {
      const pipeRes = await profiles.reduce( async (pr,prof,index) => {
        const data = await pr;
        const input = await jb.utils.toSynchArray(data, !passRx)
        const stepRes = await step(prof,index,input)
        return stepRes
      }, Promise.resolve(start))

        const res = await jb.utils.toSynchArray(pipeRes, !passRx)
        return res
      })()

    return profiles.reduce((data,prof,index) => step(prof,index,data), start)

    function step(profile,i,data) {
      if (!profile || profile.$disabled) return data;
      const path = innerPath+i
      const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {})
      if (jb.path(jb.comps[profile.$$],'aggregator'))
                return jb.core.run( new jb.core.jbCtx(ctx, { data, profile, path }), parentParam)
      const res = data.map(item => jb.core.run(new jb.core.jbCtx(ctx,{data: item, profile, path}), parentParam))
        .filter(x=>x!=null)
        .flatMap(x=> {
          const val = jb.val(x)
          return jb.asArray(val)
        })
        return res
    }
  }
})

component('pipeline', {
  type: 'data',
  category: 'common:100',
  description: 'map data arrays one after the other, do not wait for promises and rx',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true, description: 'chain/map data functions'}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipeline')
})

component('pipe', {
  type: 'data',
  category: 'async:100',
  description: 'synch data, wait for promises and reactive (callbag) data',
  params: [
    {id: 'items', type: 'data[]', ignore: true, mandatory: true, composite: true}
  ],
  impl: ctx => jb.utils.calcPipe(ctx,'$pipe',false)
})

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

component('objFromProperties', {
  description: 'object from entries of properties {id,val}',
  type: 'data',
  aggregator: true,
  params: [
    {id: 'properties', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},properties) => jb.objFromEntries(properties.map(({id,val}) => [id,val]))
})

component('entries', {
  description: 'object entries as array 0/1',
  type: 'data',
  params: [
    {id: 'obj', defaultValue: '%%', as: 'single'}
  ],
  impl: ({},obj) => jb.entries(obj)
})

component('aggregate', {
  type: 'data',
  aggregator: true,
  description: 'calc function on all items, rather then one by one',
  params: [
    {id: 'aggregator', type: 'data', mandatory: true, dynamic: true}
  ],
  impl: ({},aggregator) => aggregator()
})

component('math.max', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.min', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => Math.max.apply(0,ctx.data)
})

component('math.sum', {
  type: 'data',
  aggregator: true,
  category: 'math:80',
  impl: ctx => ctx.data.reduce((acc,item) => +item+acc, 0)
})

component('math.plus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x + +y
})

component('math.minus', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x - +y
})

component('math.mul', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x * +y
})

component('math.div', {
  category: 'math:80',
  params: [
    {id: 'x', as: 'number', mandatory: true},
    {id: 'y', as: 'number', mandatory: true}
  ],
  impl: ({},x,y) => +x / +y
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

component('objFromEntries', {
  description: 'object from entries',
  type: 'data',
  aggregator: true,
  params: [
    {id: 'entries', defaultValue: '%%', as: 'array'}
  ],
  impl: ({},entries) => jb.objFromEntries(entries)
})

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
  description: 'navigate/select/path property of object',
  category: 'common:70',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'obj', defaultValue: '%%'}
  ],
  impl: (ctx,prop,obj) =>	jb.db.objectProperty(obj,prop,ctx)
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

component('pipeline.var', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', mandatory: true, dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({ [Symbol.for('Var')]: true, ...ctx.params })
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
    {id: 'inOrder', defaultValue: true, as: 'boolean', type: 'boolean'}
  ],
  impl: ({},text,allText,inOrder) => {
      let prevIndex = -1
      for(let i=0;i<text.length;i++) {
      	const newIndex = allText.indexOf(jb.tostring(text[i]),prevIndex+1)
      	if (newIndex == -1) return false
      	prevIndex = inOrder ? newIndex : -1
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

component('join', {
  type: 'data',
  aggregator: true,
  params: [
    {id: 'separator', as: 'string', defaultValue: ',', mandatory: true},
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
  params: [
    {id: 'id', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'items', as: 'array', defaultValue: '%%'}
  ],
  type: 'data',
  aggregator: true,
  impl: (ctx,idFunc,items) => {
		const _idFunc = idFunc.profile == '%%' ? x=>x : x => idFunc(ctx.setData(x));
		return jb.utils.unique(items,_idFunc);
	}
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
    {id: 'text', as: 'string'}
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
    {id: 'item', as: 'single', defaultValue: '%%'}
  ],
  impl: ({}, item) => !item || (Array.isArray(item) && item.length == 0)
})

component('notEmpty', {
  type: 'boolean',
  params: [
    {id: 'item', as: 'single', defaultValue: '%%'}
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
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: (ctx,item,action) => jb.utils.isPromise(item) ? Promise.resolve(item).then(_item => action(ctx.setData(_item))) 
    : item != null && action(ctx.setData(item))
})

component('runActionOnItems', {
  type: 'action',
  macroByValue: true,
  params: [
    {id: 'items', as: 'ref[]', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,items,action,indexVariable) => {
		return (jb.val(items)||[]).reduce((def,item,i) => def.then(_ => action(ctx.setVar(indexVariable,i).setData(item))) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runActionOnItems',{item, action, ctx}))
	}
})

component('delay', {
  type: 'action',
  moreTypes: 'data<>',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1},
    {id: 'res', defaultValue: '%%'}
  ],
  impl: ({},mSec,res) => jb.delay(mSec).then(() => res)
})

component('onNextTimer', {
  description: 'run action after delay',
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'delay', type: 'number', defaultValue: 1}
  ],
  impl: (ctx,action,delay) => jb.delay(delay,ctx).then(()=>	action())
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
  description: 'returns a range of number, generator, numerator, numbers, index',
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

component('loadLibs', {
  description: 'load a list of libraries into current jbm',
  type: 'action',
  params: [
    {id: 'libs', as: 'array', mandatory: true}
  ],
  impl: ({},libs) => 
    jb_dynamicLoad(libs, Object.assign(jb, { loadFromDist: true}))
})

component('loadAppFiles', {
  description: 'load a list of app files into current jbm',
  type: 'action',
  params: [
    {id: 'jsFiles', as: 'array', mandatory: true}
  ],
  impl: ({},jsFiles) => 
    jb_loadProject({ uri: jb.uri, baseUrl: jb.baseUrl, libs: '', jsFiles })
})

});

jbLoadPackedFile({lineInPackage:3339, jb, noProxies: false, path: '/plugins/rx/jb-callbag.js',fileDsl: '', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,remark,unknownCmp,runCtx,vars,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
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
  concatMap2(_makeSource,combineResults) {
    const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))
    return source => (start, sink) => {
        if (start !== 0) return
        let queue = []
        let innerTalkback, sourceTalkback, sourceEnded
        if (!combineResults) combineResults = (input, inner) => inner

        const concatMapSink= input => function concatMap(t, d) {
          if (t === 0) {
            innerTalkback = d
            innerTalkback(1)
          } else if (t === 1) {
            sink(1, combineResults(input,d))
            innerTalkback(1)
          } else if (t === 2) {
            innerTalkback = null
            if (queue.length === 0) {
              stopOrContinue(d)
              return
            }
            const input = queue.shift()
            const src = makeSource(input)
            src(0, concatMapSink(input))
          }
        }

        source(0, function concatMap(t, d) {
          if (t === 0) {
            sourceTalkback = d
            sink(0, wrappedSink)
            return
          } else if (t === 1) {
            if (innerTalkback) 
              queue.push(d) 
            else {
              const src = makeSource(d)
              src(0, concatMapSink(d))
              src(1)
            }
          } else if (t === 2) {
            sourceEnded = true
            stopOrContinue(d)
          }
        })

        function wrappedSink(t, d) {
          if (t === 2 && innerTalkback) innerTalkback(2, d)
          sourceTalkback(t, d)
        }
    
        function stopOrContinue(d) {
          if (d != undefined) {
            queue = []
            innerTalkback = innerTalkback = null
            sink(2, d)
            return
          }
          if (sourceEnded && !innerTalkback && queue.length == 0) {
            sink(2, d)
            return
          }
          innerTalkback && innerTalkback(1)
        }
      }
  },
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
      if (!elem) return
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
  fromCallbackFunc: (register, unRegister) => (start, sink) => {
    if (start !== 0) return
    let handler = register(fromCallback)
    function fromCallback() { 
      sink(1,0)
      handler = register(fromCallback)
    }    
  
    sink(0, function fromCallback(t) {
      if (t !== 2) return
      unRegister(handler)
    })
  },  
  fromPromise: promises => (start, sink) => {
    if (start !== 0) return
    let endedBySink = false
    jb.asArray(promises).reduce( (acc, pr) =>
      acc.then(() => !endedBySink && Promise.resolve(pr).then(res => sink(1,res)).catch(err=>sink(2,err)) )
    , Promise.resolve()).then(() => !endedBySink && sink(2))

    sink(0, function fromPromises(t, d) {
        if (t === 2) endedBySink = true
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
  create: prod => (start, sink) => {
      if (start !== 0) return
      if (typeof prod !== 'function') {
        sink(0, () => {})
        sink(2)
        return
      }
      let end = false
      let clean
      sink(0, (t,d) => {
        if (!end) {
          end = t === 2
          if (end && typeof clean === 'function') clean()
        }
      })
      if (end) return
      clean = prod((v) => {
          if (!end) sink(1, v)
        }, (e) => {
          if (!end && e !== undefined) {
            end = true
            sink(2, e)
          }
        }, () => {
          if (!end) {
            end = true
            sink(2)
          }
      })
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
  takeWhile: (predicate,passtLastEvent) => source => (start, sink) => {
      if (start !== 0) return
      let talkback
      source(0, function takeWhile(t,d) {
        if (t === 0) talkback = d
        if (t === 1 && !predicate(d)) {
          if (passtLastEvent) sink(t,d)
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
  mapPromise: promiseF => source => jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d))))(source),
  doPromise: promiseF => source =>  jb.callbag.concatMap(d => jb.callbag.fromPromise(Promise.resolve().then(()=>promiseF(d)).then(()=>d)))(source),
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

jbLoadPackedFile({lineInPackage:4362, jb, noProxies: false, path: '/plugins/rx/rx-comps.js',fileDsl: '', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,remark,unknownCmp,runCtx,vars,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
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

component('source.callback', {
  type: 'rx',
  params: [
    {id: 'registerFunc', mandatory: true, description: 'receive callback function, returns handler'},
    {id: 'unRegisterFunc', mandatory: true, description: 'receive handler from register'}
  ],
  impl: (ctx,registerFunc,unRegisterFunc) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromCallbackFunc(registerFunc,unRegisterFunc))
})

component('source.animationFrame', {
  type: 'rx',
  impl: source.callback(()=>jb.frame.requestAnimationFrame, () => jb.frame.cancelAnimationFrame)
})

component('source.event', {
  type: 'rx',
  macroByValue: true,
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll,resize'},
    {id: 'elem', description: 'html element', defaultValue: () => jb.frame.document},
    {id: 'options', description: 'addEventListener options, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'}
  ],
  impl: (ctx,event,elem,options) => elem && jb.callbag.map(sourceEvent=>ctx.setVars({sourceEvent, elem}).dataObj(sourceEvent))(jb.callbag.fromEvent(event,elem,options))
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

component('source.promises', {
  type: 'rx',
  params: [
    {id: 'promises', type: 'data[]', mandatory: true}
  ],
  impl: (ctx,promises) => jb.callbag.map(x=>ctx.dataObj(x))(jb.callbag.fromPromise(promises))
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
    const val = value()
    return source(0, function Var(t, d) {
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
    {id: 'passtLastEvent', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,whileCondition,passtLastEvent) => jb.callbag.takeWhile(ctx => whileCondition(ctx), passtLastEvent)
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

jbLoadPackedFile({lineInPackage:5029, jb, noProxies: false, path: '/plugins/rx/rx.js',fileDsl: 'rx', pluginId: 'rx' }, 
            function({jb,require,source,rx,sink,action,rxPipe,rxFlow,sourcePipe,data,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,Var,resource,reduce,count,joinIntoVariable,join,max,Do,doPromise,map,mapPromise,filter,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,unique,catchError,timeoutLimit,throwError,debounceTime,throttleTime,delay,replay,takeUntil,take,takeWhile,toArray,last,skip,log,consoleLog,sniffer,subscribe,writeValue,rxSubject,subjectNext,subject,rxQueue,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,matchRegex,toUpperCase,toLowerCase,capitalize,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,remark,unknownCmp,runCtx,vars,isRef,asRef,test,component,extension,using,dsl,pluginDsl}) {
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

jbLoadPackedFile({lineInPackage:5749, jb, noProxies: false, path: '/plugins/ui/core/core-features.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('method', {
  type: 'feature',
  description: 'define backend event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'if using the pattern onXXHandler, or onKeyXXHandler automaticaly binds to UI event XX, assuming on-XX:true is defined at the template'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({method: {id, ctx}})
})

component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'defaultValue'}
  ],
  impl: ctx => ({watchAndCalcModelProp: ctx.params})
})

component('calcProp', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty, value is taken from model'},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
    {id: 'defaultValue'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.ui.propCounter++}})
})

component('userStateProp', {
  type: 'feature',
  description: 'define a user state (e.g., selection) that is passed to the FE and back to the BE via refresh calls. The first calculation is done at the BE and then the FE can change it',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, userStateProp: true, index: jb.ui.propCounter++}})
})

component('calcProps', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({
      calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.ui.propCounter++ }
    })
})

component('feature.initValue', {
  type: 'feature',
  category: 'lifecycle',
  description: 'set value if the value is empty, activated before calc properties',
  params: [
    {id: 'to', as: 'ref', mandatory: true, dynamic: true},
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'alsoWhenNotEmpty', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,_to,_value,alsoWhenNotEmpty) => ({ init: { 
    action: (_ctx,{cmp}) => {
      const value = _value(_ctx), to = _to(_ctx)
      const toAssign = jb.val(value), currentVal = jb.val(to)
      if ((alsoWhenNotEmpty || currentVal == null) && toAssign !== currentVal) {
        jb.log('init value',{cmp, ...ctx.params})
        jb.db.writeValue(to,toAssign,ctx,true)
      } else if (toAssign !== currentVal) {
        jb.logError(`feature.initValue: init non empty value ${jb.utils.prettyPrint(to.profile)}`,{toAssign,currentVal,cmp,ctx,to,value})
      }
    }, 
    phase: 10 
  }})
})

component('feature.requireService', {
  type: 'feature',
  params: [
    {id: 'service', type: 'service'},
    {id: 'condition', dynamic: true, defaultValue: true}
  ],
  impl: (_ctx,service,condition) => ({ init: { 
    action: ctx => condition(ctx) && service.init(ctx),
    phase: 10 
  }})
})

component('feature.init', {
  type: 'feature',
  category: 'lifecycle',
  description: 'activated before calc properties, use initValue or require instead',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: ({},action,phase) => ({ init: { action, phase }})
})

component('onDestroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('destroy', '%$action()%')
})

component('templateModifier', {
  type: 'feature',
  description: 'change the html template',
  params: [
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,value) => ({ templateModifier: (vdom,cmp) => value(cmp.calcCtx.setVars({vdom, ...cmp.renderProps })) })
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

component('followUp.action', {
  type: 'feature',
  description: 'runs at the backend a tick after the vdom was returned. Try to avoid it, use initValue or require instead',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ followUp: { action: ctx2 => ctx.params.action(ctx2), srcCtx: ctx } })
})

component('followUp.flow', {
  type: 'feature',
  description: 'rx flow at the backend after the vdom was sent. Try to avoid it, use watchRef instead',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: followUp.action(
    runActions(
      Var('followUpCmp', '%$cmp%'),
      Var('pipeToRun', rx.pipe('%$elems()%')),
      (ctx,{cmp,pipeToRun}) => {
        jb.ui.followUps[cmp.cmpId] = jb.ui.followUps[cmp.cmpId] || []
        jb.ui.followUps[cmp.cmpId].push({cmp, pipe: pipeToRun, srcPath: ctx.cmpCtx.callerPath})
      }
    )
  )
})

// jb.component('registerCmpFLow', {
//   type: 'action',
//   params: [
//     {id: 'cmp'},

//   ],
//   impl: 
// })

component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'},
    {id: 'delay', as: 'number', description: 'delay in activation, can be used to set priority'},
    {id: 'methodBeforeRefresh', as: 'string', description: 'cmp method to run before refreshing'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}}),
  dependencies: () => jb.ui.subscribeToRefChange()
})

component('followUp.watchObservable', {
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom observable to refresh component',
  params: [
    {id: 'toWatch', type: 'rx', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', description: 'in mSec'}
  ],
  impl: followUp.flow(
    source.data(0),
    rx.var('cmp', '%$cmp%'),
    rx.flatMap('%$toWatch()%'),
    rx.debounceTime('%$debounceTime%'),
    sink.refreshCmp()
  )
})

component('followUp.onDataChange', {
  type: 'feature',
  category: 'watch',
  description: 'watch observable data reference, subscribe and run action',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'action', type: 'action', dynamic: true, description: 'run on change'}
  ],
  impl: followUp.flow(
    source.watchableData('%$ref()%', { includeChildren: '%$includeChildren%' }),
    sink.action(call('action'))
  )
})

component('group.data', {
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'Data', mandatory: true, dynamic: true, as: 'ref'},
    {id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable'},
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'}
  ],
  impl: ({}, refF, itemVariable,watch,includeChildren) => ({
      ...(watch ? {watchRef: { refF, includeChildren }} : {}),
      extendCtx: ctx => {
          const ref = refF()
          return ctx.setData(ref).setVar(itemVariable,ref)
      },
  })
})

component('htmlAttribute', {
  type: 'feature',
  description: 'set attribute to html element and give it value',
  params: [
    {id: 'attribute', mandatory: true, as: 'string'},
    {id: 'value', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,id,value) => ({
    templateModifier: (vdom,cmp) => vdom.setAttribute(id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, value(cmp.ctx))
  })
})

component('cmpId', {
  type: 'feature',
  priority: 0,
  description: 'force cmpId',
  params: [
    {id: 'cmpId', mandatory: true, as: 'string'}
  ],
  impl: (ctx,cmpId) => {
    if (cmpId.match(/:/)) jb.logError(`cmpId: do not use ":" in cmpId ${cmpId}`,{ctx})
    return ({ cmpId})
  }
})

component('id', {
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: htmlAttribute('id', '%$id()%')
})

component('feature.hoverTitle', {
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute('title', '%$title%')
})

component('watchable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a watchable variable',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true}
  ],
  impl: ({}, name, value) => ({
    destroy: cmp => {
      const fullName = name + ':' + cmp.cmpId;
      cmp.ctx.runAction(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      if (name.match(/:/)) jb.logError(`watchable: do not use ":" in var name ${name}`,{ctx})
      const fullName = name + ':' + cmp.cmpId;
      jb.log('create watchable var',{cmp,ctx,fullName})
      const refToResource = jb.db.useResourcesHandler(h=>h.refOfPath([fullName]))
      jb.db.writeValue(refToResource,value(ctx),ctx)
      return ctx.setVar(name, refToResource);
    }
  }),
  dependencies: () => jb.ui.subscribeToRefChange()
})

component('variable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a constant passive variable',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true}
  ],
  impl: ({}, name, value) => ({ extendCtx: ctx => ctx.setVar(name,jb.val(value(ctx))) })
})

// component('calculatedVar', {
//   type: 'feature',
//   category: 'general:60',
//   description: 'defines a local variable that watches other variables with auto recalc',
//   params: [
//     {id: 'name', as: 'string', mandatory: true},
//     {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
//     {id: 'watchRefs', as: 'array', dynamic: true, mandatory: true, defaultValue: [], description: 'variable to watch. needs to be in array'}
//   ],
//   impl: features(
//     onDestroy(writeValue('%${%$name%}:{%$cmp/cmpId%}%', null)),
//     followUp.flow(
//       source.merge((ctx,{},{watchRefs}) => watchRefs(ctx).map(ref=>ctx.setData(ref).run(source.watchableData('%%')) )),
//       rx.log('check calculatedVar'),
//       rx.map('%$value()%'),
//       sink.data('%${%$name%}:{%$cmp/cmpId%}%')
//     ),
//     ctx => ({
//       extendCtx: (_ctx,cmp) => {
//         const {name,value} = ctx.cmpCtx.params
//         const fullName = name + ':' + cmp.cmpId;
//         jb.log('create watchable calculatedVar',{ctx,cmp,fullName})
//         jb.db.resource(fullName, jb.val(value(_ctx)));
//         const ref = _ctx.exp(`%$${fullName}%`,'ref')
//         return _ctx.setVar(name, ref);
//       }
//     })
//   )
// })

component('feature.if', {
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'}
  ],
  impl: (ctx, condition) => ({
    templateModifier: (vdom,cmp) =>
      jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

component('hidden', {
  type: 'feature',
  category: 'feature:85',
  description: 'display:none on element. keywords: show',
  params: [
    {id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp) => {
      jb.path(vdom,'attributes.style.display',jb.toboolean(showCondition(cmp.ctx)) ? 'inherit' : 'none')
      return vdom
    }
  })
})

component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'}
  ],
  impl: (ctx,id) => {
    const elem = jb.ui.widgetBody(ctx).querySelector('#'+id)
    if (!elem)
      return jb.logError('refreshControlById can not find elem for #'+id, {ctx})
    return jb.ui.refreshElem(elem,null,{srcCtx: ctx, ...ctx.params})
  }
})

component('group.autoFocusOnFirstInput', {
  type: 'feature',
  impl: templateModifier(({},{vdom}) => {
    const elem = vdom.querySelectorAll('input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
    if (elem)
      elem.setAttribute('$focus','autoFocusOnFirstInput')
    return vdom
  })
})

component('refreshIfNotWatchable', {
  type: 'action',
  params: [
    {id: 'Data'}
  ],
  impl: (ctx, data) => !jb.db.isWatchable(data) && ctx.vars.cmp.refresh(null,{strongRefresh: true}, ctx)
})

component('feature.byCondition', {
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

component('feature.userEventProps', {
  type: 'feature',
  description: 'add data to the event sent from the front end',
  params: [
    {id: 'props', as: 'string', description: 'comma separated props to take from the original event e.g., altKey,ctrlKey'}
  ],
  impl: (ctx, prop) => ({userEventProps: prop })
})

component('runFEMethod', {
  type: 'action',
  description: 'invoke FE Method from the backend. used with library objects like codemirror',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'method', as: 'string'},
    {id: 'Data'},
    {id: 'Vars'}
  ],
  impl: (ctx, selector, method, data, vars) => {
    const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    const delta = { attributes: { $runFEMethod: JSON.stringify({method, data, vars}) } }
    cmpElem && jb.ui.applyNewVdom(cmpElem,null,{ ctx, delta } )
  }
})

component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature',
  moreTypes: 'dialog-feature<>,layout<>',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: _ctx => jb.ui.fixCssLine(css(_ctx))})
})

component('css.class', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({class: clz})
})

});

jbLoadPackedFile({lineInPackage:6218, jb, noProxies: false, path: '/plugins/ui/core/front-end-features.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params })
})

component('frontEnd.varsFromBEProps', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'idList', as: 'array', mandatory: true}
  ],
  impl: ({},idList) => idList.map(id => ({ frontEndVar: {id, value: ctx => ctx.vars.$props[id]} }))
})

component('action.runBEMethod', {
  type: 'action',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true},
    {id: 'Data', defaultValue: '%%', dynamic: true},
    {id: 'ctxVars', dynamic: true}
  ],
  impl: (ctx,method,data,ctxVars) => jb.ui.runBEMethodByContext(ctx,method(),data(),ctxVars())
})

component('backend.dataMethod', {
  type: 'data',
  description: 'activated on BE',
  params: [
    {id: 'cmpId', as: 'string'},
    {id: 'method', as: 'string'},
    {id: 'Data', defaultValue: '%%'},
    {id: 'ctxVars'}
  ],
  impl: ({} ,cmpId,method,data,ctxVars) => jb.ui.cmps[cmpId].runBEMethod(method,data,ctxVars,{dataMethod: true})
})

component('action.runFEMethod', {
  type: 'action',
  description: 'cab be activated in frontEnd only with $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true},
    {id: 'Data', defaultValue: '%%', dynamic: true},
    {id: 'ctxVars', dynamic: true}
  ],
  impl: (ctx,method,data,ctxVars) => ctx.vars.cmp && ctx.vars.cmp.runFEMethod(method(),data(),ctxVars())
})

component('sink.BEMethod', {
  type: 'rx',
  category: 'sink',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true},
    {id: 'Data', defaultValue: ({data}) => jb.frame.Event && data instanceof jb.frame.Event ? null : data, dynamic: true},
    {id: 'ctxVars', dynamic: true}
  ],
  impl: sink.action((ctx,{},{method,Data,ctxVars}) => jb.ui.runBEMethodByContext(ctx,method(ctx),Data(ctx),ctxVars(ctx)))
})

component('sink.FEMethod', {
  type: 'rx',
  category: 'sink',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true},
    {id: 'Data', defaultValue: '%%', dynamic: true},
    {id: 'ctxVars', dynamic: true}
  ],
  impl: sink.action((ctx,{cmp},{method,Data,ctxVars}) => cmp && cmp.runFEMethod(method(ctx),Data(ctx),ctxVars(ctx)))
})

component('action.refreshCmp', {
  type: 'action',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true},
    {id: 'options', dynamic: true}
  ],
  impl: (ctx,stateF,optionsF) => {
    const cmp = ctx.vars.cmp, options = optionsF(ctx), state = stateF(ctx)
    jb.log('refresh uiComp',{cmp,ctx,state,options})
    cmp && cmp.refresh(state,{srcCtx: ctx, ...options},ctx)
    const tx = ctx.vars.userReqTx
    tx && tx.complete(`refresh cmp ${cmp.cmpId}`)
  }
})

component('sink.refreshCmp', {
  type: 'rx',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true},
    {id: 'options', dynamic: true}
  ],
  impl: sink.action(action.refreshCmp('%$state()%', '%$options()%'))
})

component('frontEnd.method', {
  type: 'feature',
  category: 'front-end',
  description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
  params: [
    {id: 'method', as: 'string'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,method,action) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile} })
})

component('frontEnd.coLocation', {
  type: 'feature',
  category: 'front-end',
  description: 'front end can use backend variables',
  impl: () => ({ coLocation: true })
})

component('frontEnd.requireExternalLibrary', {
  type: 'feature',
  category: 'front-end',
  description: 'url or name of external library in dist path, js or css',
  params: [
    {id: 'libs', type: 'data[]', as: 'array'}
  ],
  impl: ({},libs) => libs.map(frontEndLib =>({ frontEndLib }))
})


component('frontEnd.enrichUserEvent', {
  type: 'feature',
  category: 'front-end',
  description: 'the result is assigned to userEvent, can use %$cmp%, %$ev%, %$userEvent%',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'enrichUserEvent', path: ctx.path, action: action.profile} })
})

component('frontEnd.onRefresh', {
  type: 'feature',
  category: 'front-end',
  description: 'rerun on frontend when after refresh is activated',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'onRefresh', path: ctx.path, action: action.profile} })
})

component('frontEnd.init', {
  type: 'feature',
  category: 'front-end',
  description: 'initializes the front end, mount, component did update. runs after props',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile} })
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

component('frontEnd.onDestroy', {
  type: 'feature',
  description: 'destructs the front end',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'destroy', path: ctx.path, action: action.profile } })
})

component('source.frontEndEvent', {
  type: 'rx',
  category: 'source',
  description: 'assumes cmp in context',
  params: [
    {id: 'event', as: 'string', options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'}
  ],
  impl: rx.pipe(source.event('%$event%', '%$cmp.base%'), rx.takeUntil('%$cmp.destroyed%'))
})

component('rx.userEventVar', {
  type: 'rx',
  impl: rx.var('ev', ({data}) => jb.ui.buildUserEvent(data, jb.ui.closestCmpElem(data.currentTarget || data.target)))
})

component('frontEnd.flow', {
  type: 'feature',
  category: 'front-end',
  description: 'rx flow at front end',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', dynamic: true, mandatory: true, templateValue: []}
  ],
  impl: (ctx, elems) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, _flow: elems.profile,
      action: { $: 'action<>rx.pipe', elems: _ctx => elems(_ctx) }
    }})
})

component('feature.onHover', {
  type: 'feature',
  description: 'on mouse enter',
  category: 'events',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'onLeave', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: features(
    method('onHover', '%$action()%'),
    method('onLeave', '%$onLeave()%'),
    frontEnd.flow(source.frontEndEvent('mouseenter'), sink.BEMethod('onHover')),
    frontEnd.flow(source.frontEndEvent('mouseleave'), sink.BEMethod('onLeave'))
  )
})
  
component('feature.classOnHover', {
  type: 'feature',
  description: 'set css class on mouse enter',
  category: 'events',
  params: [
    {id: 'clz', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
  ],
  impl: features(
    frontEnd.flow(
      source.frontEndEvent('mouseenter'),
      sink.action(({},{cmp},{clz}) => jb.ui.addClass(cmp.base,clz))
    ),
    frontEnd.flow(
      source.frontEndEvent('mouseleave'),
      sink.action(({},{cmp},{clz}) => jb.ui.removeClass(cmp.base,clz))
    )
  )
})

component('key.eventMatchKey', {
  type: 'boolean',
  params: [
    {id: 'event'},
    {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'}
  ],
  impl: (ctx, e, key) => {
      jb.log('keyboard search eventMatchKey',{e,key})
      if (!key) return;
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
    
      key = key.replace(/-/,'+');
      const keyWithoutPrefix = key.split('+').pop()
      let keyCode = dict[keyWithoutPrefix.toLowerCase()]
      if (+keyWithoutPrefix)
        keyCode = +keyWithoutPrefix
      if (keyWithoutPrefix.length == 1)
        keyCode = keyWithoutPrefix.charCodeAt(0)
    
      if (key.match(/^[Cc]trl/) && !e.ctrlKey) return
      if (key.match(/^[Aa]lt/) && !e.altKey) return
      jb.log(`keyboard ${e.keyCode == keyCode ? 'found': 'notFound'} eventMatchKey`,{e,key,eventKey: e.keyCode,keyCode})
      return e.keyCode == keyCode
  }
})

component('key.eventToMethod', {
  params: [
    {id: 'event'},
    {id: 'elem'}
  ],
  impl: (ctx, event, elem) => {
      elem = elem || ctx.vars.elem
      if (!jb.path(elem,'getAttribute'))
        return

      elem.keysHash = elem.keysHash || calcKeysHash()
          
      jb.log('keyboard search eventToMethod',{elem,event})
      const res = elem.keysHash.find(key=>key.keyCode == event.keyCode && event.ctrlKey == key.ctrl && event.altKey == key.alt)
      const resMethod = res && res.methodName
      jb.log(`keyboard ${res ? 'found': 'notFound'} eventToMethod`,{resMethod,elem,event})
      return resMethod

      function calcKeysHash() {
        const keys = elem.getAttribute('methods').split(',').map(x=>x.split('-')[0])
        .filter(x=>x.indexOf('onKey') == 0).map(x=>x.slice(5).slice(0,-7))
        const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
    
        return keys.map(_key=>{
          const key = _key.replace(/-/,'+');
          const keyWithoutPrefix = key.split('+').pop()
          let keyCode = dict[keyWithoutPrefix.toLowerCase()]
          if (+keyWithoutPrefix)
            keyCode = +keyWithoutPrefix
          if (keyWithoutPrefix.length == 1)
            keyCode = keyWithoutPrefix.charCodeAt(0)
          return { keyCode, ctrl: !!key.match(/^[Cc]trl/), alt: !!key.match(/^[Aa]lt/), methodName: `onKey${_key}Handler` }
        })
      }
  }
})

component('feature.onKey', {
  type: 'feature',
  description: 'on keydown',
  category: 'events',
  params: [
    {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: features(
    method(replace('-', '+', { text: 'onKey%$key%Handler', useRegex: true }), call('action')),
    frontEnd.init(If(not('%$cmp.hasOnKeyHanlder%'), runActions(
      ({},{cmp}) => cmp.hasOnKeyHanlder = true,
      rx.pipe(
        source.frontEndEvent('keydown'),
        rx.userEventVar(),
        rx.map(key.eventToMethod('%%')),
        rx.filter('%%'),
        rx.log('keyboard uiComp onKey %$key%'),
        sink.BEMethod('%%')
      )
    )))
  )
})

component('feature.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: features(
    method(replace('-', '+', { text: 'onKey%$key%Handler', useRegex: true }), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.calc(rx.pipe(
          source.frontEndEvent('keydown'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

component('feature.globalKeyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: features(
    method(replace('-', '+', { text: 'onKey%$key%Handler', useRegex: true }), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.calc(rx.pipe(
          source.event('keydown','%$cmp.base.ownerDocument%'), 
          rx.takeUntil('%$cmp.destroyed%'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

component('feature.onEnter', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey('Enter', call('action'))
})
  
component('feature.onEsc', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey('Esc', call('action'))
})

component('frontEnd.selectionKeySourceService', {
  type: 'feature',
  description: 'assign cmp.selectionKeySource with observable for meta-keys, also stops propagation !!!',
  params: [
    {id: 'autoFocs', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    service.registerBackEndService('selectionKeySource', obj(prop('cmpId', '%$cmp/cmpId%')), {
      allowOverride: true
    }),
    frontEnd.var('autoFocs', '%$autoFocs%'),
    frontEnd.prop('selectionKeySource', (ctx,{cmp,el,autoFocs}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          jb.log('key source',{ctx, e})
          el.keydown_src.next((ctx.cmpCtx || ctx).dataObj(e))
          return false // stop propagation
        }
        return true
      }
      if (autoFocs)
        jb.ui.focus(el,'selectionKeySource',ctx)
      jb.log('register selectionKeySource',{cmp,cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
  )
})

component('frontEnd.passSelectionKeySource', {
  type: 'feature',
  impl: frontEnd.var('selectionKeySourceCmpId', '%$$serviceRegistry/services/selectionKeySource/cmpId%')
})

component('source.findSelectionKeySource', {
  type: 'rx',
  category: 'source',
  description: 'used in front end, works with "selectionKeySourceService" and "passSelectionKeySource"',
  impl: rx.pipe(
    Var('clientCmp', '%$cmp%'),
    source.merge(
      source.data([]),
      (ctx,{cmp,selectionKeySourceCmpId}) => {
        jb.log('keyboard search selectionKeySource',{cmp,selectionKeySourceCmpId,ctx})
        const el = jb.ui.elemOfCmp(ctx,selectionKeySourceCmpId)
        const ret = jb.path(el, '_component.selectionKeySource')
        if (!ret)
          jb.log('keyboard selectionKeySource notFound',{cmp,selectionKeySourceCmpId,el,ctx})
        else
          jb.log('keyboard found selectionKeySource',{cmp,el,selectionKeySourceCmpId,ctx})
        return ret
      }
    ),
    rx.takeUntil('%$clientCmp.destroyed%'),
    rx.var('cmp', '%$clientCmp%'),
    rx.log('keyboard from selectionKeySource')
  )
})

});

jbLoadPackedFile({lineInPackage:6686, jb, noProxies: false, path: '/plugins/ui/core/jb-react.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui', 'react', {
    initExtension() {
        Object.assign(this,{
            BECmpsDestroyNotification: jb.callbag.subject(),
            refreshNotification: jb.callbag.subject(),
            renderingUpdates: jb.callbag.subject(),
            widgetUserRequests: jb.callbag.subject(),
            widgetEventCounter: {},
            followUps: {},
        })

        // subscribe for widget renderingUpdates
        jb.callbag.subscribe(e=> {
            if (!e.widgetId && e.cmpId && typeof document != 'undefined') {
                const elem = document.querySelector(`[cmp-id="${e.cmpId}"]`)
                if (elem) {
                    jb.ui.applyDeltaToDom(elem, e.delta, e.ctx)
                    jb.ui.refreshFrontEnd(elem, {content: e.delta})
                }
            }
        })(jb.ui.renderingUpdates)

        // subscribe for destroy notification
        jb.callbag.subscribe(e=> {
            const {widgetId,destroyLocally,cmps} = e
            
            cmps.forEach(_cmp => {
                const fus = jb.ui.followUps[_cmp.cmpId]
                if (!fus) return
                const index = fus.findIndex(({cmp}) => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)
                if (index != -1) {
                    fus[index].pipe.dispose()
                    fus.splice(index,1)
                }
                if (!fus.length)
                    delete jb.ui.followUps[_cmp.cmpId]
            })

            // destroy BE
            if (widgetId && !destroyLocally)
                jb.ui.sendUserReq({$$:'destroy', ...e })
            else
                cmps.forEach(cmp=> jb.ui.cmps[cmp.cmpId] && jb.ui.cmps[cmp.cmpId].destroy())

        })(jb.ui.BECmpsDestroyNotification)

        jb.spy.registerEnrichers([
            r => jb.spy.findProp(r,'delta') && ({ props: {delta: jb.ui.beautifyDelta(jb.spy.findProp(r,'delta')) }})
        ])   
    },
    elemToVdom(elem) {
        if (elem instanceof jb.ui.VNode) return elem
        if (elem.getAttribute('jb_external')) return
        const textNode = Array.from(elem.children).filter(x=>x.tagName != 'BR').length == 0
        return {
            tag: elem.tagName.toLowerCase(),
            attributes: jb.objFromEntries([
                ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
                ...(textNode ? [['$text',elem.innerText]] : [])
                //...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
            ]),
            ...( elem.childElementCount && !textNode && { children: Array.from(elem.children).map(el=> jb.ui.elemToVdom(el)).filter(x=>x) })
        }
    },
    applyNewVdom(elem,vdomAfter,{strongRefresh, ctx, delta, srcCtx} = {}) {
        const widgetId = jb.ui.headlessWidgetId(elem)
        jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
        if (delta) { // used only by $runFEMethod
            const cmpId = elem.getAttribute('cmp-id')
            jb.log('applyNew vdom runFEMethod',{elem,cmpId,delta, ctx})
            if (widgetId)
                jb.ui.sendRenderingUpdate(ctx,{delta,cmpId,widgetId})
            else
                jb.ui.applyDeltaToDom(elem,delta, ctx)
            return
        }
        if (widgetId) {
            const cmpId = elem.getAttribute('cmp-id')
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            //const assumedVdom = JSON.parse(JSON.stringify(jb.ui.stripVdom(elem)))
            if (elem != vdomAfter) { // update the elem
                ;(elem.children ||[]).forEach(ch=>ch.parentNode = null)
                Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
                Object.assign(elem,vdomAfter)
                ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
            }
            const id = elem.getAttribute('id')
            jb.ui.sendRenderingUpdate(ctx,{id, delta,cmpId,widgetId, src_evCounter: jb.path(srcCtx,'vars.evCounter') })
            return
        }
        const active = jb.ui.activeElement() === elem
        if (vdomAfter.tag != (elem.tagName || elem.tag).toLowerCase() || strongRefresh) {
            jb.ui.unmount(elem)
            const newElem = jb.ui.render(vdomAfter,elem.parentElement,{ctx})
            elem.parentElement.replaceChild(newElem,elem)
            jb.log('replaceTop vdom',{newElem,elem})
            elem = newElem
        } else {
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            const cmpId = elem.getAttribute('cmp-id')
            jb.log('applyDeltaTop apply delta top dom',{cmpId, vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
            jb.ui.applyDeltaToDom(elem,delta,ctx)
        }
        if (!(elem instanceof jb.ui.VNode) || ctx.vars.useFrontEndInTest) {
            if (elem instanceof jb.ui.VNode)
                jb.ui.setAttToVdom(elem,ctx)
            jb.ui.refreshFrontEnd(elem, {content: vdomAfter})
        }
        if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
        jb.ui.garbageCollectUiComps({ctx})
    },

    applyDeltaToDom(elem,delta,ctx) {
        if (elem instanceof jb.ui.VNode)
            return jb.ui.applyDeltaToVDom(elem,delta,ctx)
        jb.log('applyDelta dom',{elem,delta,ctx})
        const children = delta.children
        if (children) {
            const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
            const childElems = Array.from(elem.children)
            const {toAppend,deleteCmp,sameOrder,resetAll} = children
            if (resetAll) 
                Array.from(elem.children).forEach(toDelete=>removeChild(toDelete))
            if (deleteCmp) 
                Array.from(elem.children)
                    .filter(ch=>ch.getAttribute('cmp-id') == deleteCmp)
                    .forEach(toDelete=>removeChild(toDelete))

            childrenArr.forEach((e,i) => {
                if (!e) {
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',''+i))
                } else if (e.$$ == 'delete') {
                    jb.ui.unmount(childElems[i])
                    elem.removeChild(childElems[i])
                    jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta,ctx})
                } else {
                    jb.ui.applyDeltaToDom(childElems[i],e,ctx)
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
                }
            })
            ;(toAppend||[]).forEach(e=>{
                const newElem = jb.ui.render(e,elem,{ctx})
                jb.log('appendChild dom',{newElem,e,elem,delta,ctx})
                !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
            })
            if (sameOrder === false) {
                Array.from(elem.children)
                    .sort((x,y) => Number(x.getAttribute('__afterIndex')) - Number(y.getAttribute('__afterIndex')))
                    .forEach(el=> {
                        const index = Number(el.getAttribute('__afterIndex'))
                        if (elem.children[index] != el)
                            elem.insertBefore(el, elem.children[index])
                        el.removeAttribute('__afterIndex')
                    })
            }
            // remove leftover text nodes in mixed
            if (elem.childElementCount)
                Array.from(elem.childNodes).filter(ch=>ch.nodeName == '#text')
                    .forEach(ch=>{
                        elem.removeChild(ch)
                        jb.log('removeChild dom leftover',{ch,elem,delta,ctx})
                    })
        }
        jb.entries(delta.attributes)
            .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
            .forEach(e=> jb.ui.setAtt(elem,e[0],e[1]),ctx)
        
        function removeChild(toDelete) {
            jb.ui.unmount(toDelete)
            elem.removeChild(toDelete)
            jb.log('removeChild dom',{toDelete,elem,delta,ctx})
        }
    },
    applyDeltaToVDom(elem,delta,ctx) {
        if (!elem) return
        jb.log('applyDelta vdom',{elem,delta,ctx})
        const children = delta.children
        if (children) {
            const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
            let childElems = elem.children || []
            const {toAppend,deleteCmp,sameOrder,resetAll} = children

            if (resetAll) {
                childElems.forEach(ch => {
                    jb.ui.unmount(ch)
                    ch.parentNode = null
                })
                childElems = []
            }
            if (deleteCmp) {
                while ((index = childElems.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)) != -1) {
                    childElems[index] && (childElems[index].parentNode = null)
                    jb.ui.unmount(childElems.splice(index,1)[0])
                }
            }
            childrenArr.forEach((e,i) => {
                if (!e) {
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',''+i))
                } else if (e.$$ == 'delete') {
                    jb.ui.unmount(childElems.splice(i,1)[0])
                    jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta,ctx})
                } else {
                    jb.ui.applyDeltaToVDom(childElems[i],e)
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
                }
            })
            ;(toAppend||[]).forEach(e=>{
                const newElem = jb.ui.unStripVdom(e,elem)
                jb.log('appendChild dom',{newElem,e,elem,delta,ctx})
                !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
                childElems.push(newElem)
            })
            if (sameOrder === false) {
                childElems.sort((x,y) => Number(x.getAttribute('__afterIndex')) - Number(y.getAttribute('__afterIndex')))
                    .forEach(el=> {
                        const index = Number(el.getAttribute('__afterIndex'))
                        if (childElems[index] != el)
                            childElems.splice(index,0,el) //childElems.insertBefore(el, childElems[index])
                        el.removeAttribute('__afterIndex')
                    })
            }   
            // remove leftover text nodes in mixed
            elem.children = childElems.filter(ch=>ch.tag != '#text')
        }
        Object.assign(elem.attributes,delta.attributes)
    },
    setAtt(elem,att,val,ctx) {
        const activeElem = jb.path(jb.frame.document,'activeElement')
        if (val == '__undefined') val = null
        if (att[0] !== '$' && val == null) {
            elem.removeAttribute(att)
            jb.log('dom change remove',{elem,att,val,ctx})
        } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
            elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val,ctx))
            elem[`registeredTo-${att}`] = true
        } else if (att.indexOf('on-') == 0 && val == null) {
            elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val,ctx))
            elem[`registeredTo-${att}`] = false
        } else if (att === 'checked' && (elem.tagName || elem.tag).toLowerCase() === 'input') {
            elem.setAttribute(att,val)
            jb.delay(1).then(()=> { // browser bug?
                elem.checked = true
                jb.log('dom set checked',{elem,att,val,ctx})
            })
        } else if (att.indexOf('$__input') === 0) {
            try {
                setInput(JSON.parse(val),ctx)
            } catch(e) {}
        } else if (att.indexOf('$__') === 0) {
            const id = att.slice(3)
            try {
                elem[id] = JSON.parse(val) || ''
            } catch (e) {}
            jb.log(`dom set data ${id}`,{elem,att,val,ctx})
        } else if (att === '$runFEMethod') {
            const {method, data, vars} = JSON.parse(val)
            elem._component && elem._component.runFEMethod(method,data,vars)
        } else if (att === '$focus') {
            elem.setAttribute('__focus',val || 'no source')
            jb.ui.focus(elem,val,ctx)
        } else if (att === '$scrollDown' && val) {
            elem.__appScroll = true
            elem.scrollTop = elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1
        } else if (att === '$scrollDown' && val == null) {
            delete elem.__appScroll
        } else if (att === '$text') {
            elem.innerText = val || ''
            jb.log('dom set text',{elem,att,val,ctx})
        } else if (att === '$html') {
            elem.innerHTML = val || ''
            jb.log('dom set html',{elem,att,val,ctx})
        } else if (att === 'style' && typeof val === 'object') {
            elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
            jb.log('dom set style',{elem,att,val,ctx})
        } else if (att == 'value' && elem.tagName && elem.tagName.match(/select|input|textarea/i) ) {
            const active = activeElem === elem
            if (elem.value == val) return
            elem.value = val
            if (active && activeElem !== elem) { debugger; elem.focus() }
            jb.log('dom set elem value',{elem,att,val,ctx})
        } else {
            elem.setAttribute(att,val)
            //jb.log('dom set att',{elem,att,val,ctx}) too many calls
        }

        function setInput({assumedVal,newVal,selectionStart},ctx) {
            const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
            jb.log('dom set input check',{el, assumedVal,newVal,selectionStart,ctx})
            if (!el)
                return jb.logError('setInput: can not find input under elem',{elem,ctx})
            if (assumedVal != el.value) 
                return jb.logError('setInput: assumed val is not as expected',{ assumedVal, value: el.value, el,ctx })
            const active = activeElem === el
            jb.log('dom set input',{el, assumedVal,newVal,selectionStart,ctx})
            el.value = newVal
            if (typeof selectionStart == 'number') 
                el.selectionStart = selectionStart
            if (active && activeElem !== el) { debugger; el.focus() }
        }
    },

    unmount(elem) {
        if (!elem || !elem.setAttribute) return

        const groupByWidgets = {}
        jb.ui.findIncludeSelf(elem,'[cmp-id]').forEach(el => {
            el._component && el._component.destroyFE()
            const FEWidgetId = jb.ui.frontendWidgetId(elem)
            if (FEWidgetId && FEWidgetId != 'client') return
            const widgetId = jb.ui.headlessWidgetId(el) || '_local_'
            groupByWidgets[widgetId] = groupByWidgets[widgetId] || { cmps: []}
            const cmpId = el.getAttribute('cmp-id'), ver = el.getAttribute('cmp-ver')
            groupByWidgets[widgetId].cmps.push({cmpId,ver,el})
        })
        jb.log('unmount',{elem,groupByWidgets})
        jb.entries(groupByWidgets).forEach(([widgetId,val])=>
            jb.ui.BECmpsDestroyNotification.next({
                widgetId, cmps: val.cmps,
                destroyLocally: widgetId == '_local_',
                destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
        }))
    },
    render(vdom,parentElem,{prepend,ctx,doNotRefreshFrontEnd} = {}) {
        jb.log('render',{vdom,parentElem,prepend})
        if (parentElem instanceof jb.ui.VNode) {
            parentElem.appendChild(vdom)
            if (ctx.vars.useFrontEndInTest) {
                jb.ui.setAttToVdom(vdom,ctx)
                jb.ui.refreshFrontEnd(vdom, {content: vdom})
            }
            return
        }

        const res = doRender(vdom,parentElem)
        vdomDiffCheckForDebug()
        !doNotRefreshFrontEnd && jb.ui.refreshFrontEnd(res, {content: vdom })
        return res

        function doRender(vdom,parentElem) {
            jb.log('dom createElement',{tag: vdom.tag, vdom,parentElem})
            const elem = createElement(parentElem.ownerDocument, vdom.tag)
            jb.entries(vdom.attributes).forEach(e=>jb.ui.setAtt(elem,e[0],e[1],ctx))
            jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
            prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
            return elem
        }
        function vdomDiffCheckForDebug() {
            const checkResultingVdom = jb.ui.elemToVdom(res)
            const diff = jb.ui.vdomDiff(checkResultingVdom,vdom)
            if (checkResultingVdom && Object.keys(diff).length)
                jb.logError('render diff',{diff,checkResultingVdom,vdom})
        }
        function createElement(doc,tag) {
            tag = tag || 'div'
            return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
                doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
        }
    },
    handleCmpEvent(ev, specificMethod,ctx) {
        specificMethod = specificMethod == 'true' ? `on${ev.type}Handler` : specificMethod
        const userReq = jb.ui.rawEventToUserRequest(ev,{specificMethod,ctx})
        jb.log('handle cmp event',{ev,specificMethod,userReq})
        if (!userReq) return true
        if (userReq.widgetId && userReq.widgetId != 'client')
            jb.ui.sendUserReq(userReq)
        else {
            const cmp = jb.ui.cmps[userReq.cmpId]
            if (!cmp)
                return jb.logError(`handleCmpEvent - no cmp in dictionary for id ${userReq.cmpId}`,{ev,specificMethod})
            if (userReq.method)
                cmp.runBEMethod(userReq.method,userReq.data,userReq.vars)
            else {
                return jb.logError(`handleCmpEvent - no method in request`,{ev,specificMethod})
            }
        }
    },
    sendUserReq(userReq) {
        jb.ui.widgetUserRequests.next(userReq)
    },
    rawEventToUserRequest(ev, {specificMethod, ctx} = {}) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('rawEventToUserRequest can not find closest elem with jb-ctx',{ctx, ev})
        const cmpId = elem.getAttribute('cmp-id')
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        //const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.widgetId
        jb.ui.widgetEventCounter[widgetId] = (jb.ui.widgetEventCounter[widgetId] || 0) + 1
        if (!cmpId)
            return jb.logError(`no cmpId in element`,{ctx, elem, method, widgetId })

        return {$:'userRequest', method, widgetId, cmpId, vars: 
            { evCounter: jb.ui.widgetEventCounter[widgetId], ev: jb.ui.buildUserEvent(ev, elem, ctx)} }
    },
    calcElemProps(elem) {
        return elem instanceof jb.ui.VNode ? {} : { 
            outerHeight: jb.ui.outerHeight(elem), outerWidth: jb.ui.outerWidth(elem), 
            clientRect: elem.getBoundingClientRect() 
        }
    },
    buildUserEvent(ev, elem, ctx) {
        if (!ev) return null
        const userEvent = {
            value: ev.value || (ev.target || {}).value || jb.path(ev,'target.attributes.value'), 
            elem: jb.ui.calcElemProps(elem),
            ev: {},
        }
        const evProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','altKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        jb.path(elem,'_component.enrichUserEvent') && elem._component.enrichUserEvent(ev,{userEvent, ctx})
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runBEMethodByContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp.isBEComp)
            return cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            return jb.ui.runBEMethodByElem(cmp.base,method,data,
                    {$updateCmpState: {state: cmp.state, cmpId: cmp.cmpId}, $state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethodByElem(elem,method,data,vars) {
        if (!elem)
            return jb.logError(`runBEMethod, no elem provided: ${method}`, {elem, data, vars})
        const FEWidgetId = jb.ui.frontendWidgetId(elem)
        const cmpId = elem.getAttribute('cmp-id')

        if (FEWidgetId && FEWidgetId != 'client') {
            jb.log(`frontEnd method send request: ${method}`,{ elem, FEWidgetId, cmpId, data, vars})
            jb.ui.sendUserReq({$:'userRequest', method, widgetId: FEWidgetId, cmpId, data, vars })
        } else {
            return jb.ui.cmps[cmpId].runBEMethod(method,data,vars,{})
        }
    },
    applyDeltaToCmp({delta, ctx, cmpId, elem, assumedVdom}) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (!elem || delta._$prevVersion && delta._$prevVersion != elem.getAttribute('cmp-ver')) {
            jb.ui.elemOfCmp(ctx,cmpId) // for debug
            const reason = elem ? 'unexpected version' : 'elem not found'
            jb.logError(`applyDeltaToCmp: ${reason}`,{reason, delta, ctx, cmpId, elem})
            return // { recover: true, reason }
        }
        if (assumedVdom) {
            const actualVdom = jb.ui.elemToVdom(elem)
            const diff = jb.ui.vdomDiff(assumedVdom,actualVdom)
            if (Object.keys(diff).length) {
                const actual = jb.ui.vdomToHtml(actualVdom),assumed = jb.ui.vdomToHtml(assumedVdom),dif = diff // jb.utils.prettyPrint(diff)
                jb.logError('wrong assumed vdom',{actual, assumed, dif, actualVdom, assumedVdom, diff, delta, ctx, cmpId, elem})
                return { recover: true, reason: { diff, description: 'wrong assumed vdom'} }
            }
        }
        const bySelector = delta._$bySelector && Object.keys(delta._$bySelector)[0]
        const actualElem = bySelector ? jb.ui.find(elem,bySelector)[0] : elem
        const actualdelta = bySelector ? delta._$bySelector[bySelector] : delta
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem, bySelector, actualElem})
        if (actualElem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(actualElem, actualdelta,ctx)
            const { headlessWidgetId, headlessWidget, useFrontEndInTest } = ctx.vars
            headlessWidget && jb.ui.sendRenderingUpdate(ctx,{delta,cmpId,widgetId: headlessWidgetId,ctx})
            if (useFrontEndInTest) {
                jb.ui.setAttToVdom(actualElem,ctx)
                jb.ui.refreshFrontEnd(actualElem, {content: delta})
            }
            // if (uiTest && jb.path(jb,'parent.uri') == 'tests' && jb.path(jb,'parent.ui.renderingUpdates')) // used for distributedWidget tests
            //     jb.parent.ui.sendRenderingUpdate(ctx,{delta,ctx})
        } else if (actualElem) {
            jb.ui.applyDeltaToDom(actualElem, actualdelta, ctx)
            jb.ui.refreshFrontEnd(actualElem, {content: delta})
        }
    },
    setAttToVdom(elem,ctx) {
        jb.entries(elem.attributes).forEach(e=>jb.ui.setAtt(elem,e[0],e[1],ctx))
        ;(elem.children || []).forEach(el => jb.ui.setAttToVdom(el,ctx))
    },
    sendRenderingUpdate(ctx,renderingUpdate) {
        const tx = ctx.vars.userReqTx
        if (tx) tx.next(renderingUpdate)
        if (!tx) jb.ui.renderingUpdates.next(renderingUpdate)
        return renderingUpdate
    },
})

});

jbLoadPackedFile({lineInPackage:7184, jb, noProxies: false, path: '/plugins/ui/core/ui-comp.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui','comp', {
    initExtension() {
        jb.core.jstypes.renderable = value => {
            if (value == null) return '';
            if (value instanceof jb.ui.VNode) return value;
            if (value.isBEComp) return jb.ui.h(value)
            if (Array.isArray(value))
                return jb.ui.h('div',{},value.map(item=>jb.core.jstypes.renderable(item)));
            return '' + jb.val(value,true);
        }
        return {
            lifeCycle: new Set('init,extendCtx,templateModifier,followUp,destroy'.split(',')),
            arrayProps: new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,frontEndLib,frontEndVar'.split(',')),
            singular: new Set('template,calcRenderProps,toolbar,styleParams,pathForPick,coLocation'.split(',')),
            cmpCounter: 1,
            cssHashCounter: 0,
            cssElemCounter: 0,
            propCounter: 0,
            cssHashMap: {},
            cmps: {},
            headless: {}              
        }
    },
    typeRules: [
        { isOfWhenEndsWith: ['feature<>','feature<>'] },
        { isOfWhenEndsWith: ['style<>',['feature<>', 'style<>' ]] }
    ],
    h(cmpOrTag,attributes,children) {
        if (cmpOrTag instanceof jb.ui.VNode) return cmpOrTag // Vdom
        if (cmpOrTag && cmpOrTag.renderVdom)
            return cmpOrTag.renderVdomAndFollowUp()
    
        return new jb.ui.VNode(cmpOrTag,attributes,children)
    },
    ctrl(origCtx,options) {
        const styleByControl = jb.path(origCtx,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (origCtx.vars.$refreshElemCall || styleByControl) ? origCtx.vars.$state : {}
        const cmpId = origCtx.vars.$cmpId, cmpVer = origCtx.vars.$cmpVer
        if (!origCtx.vars.$serviceRegistry) {
            //debugger
            jb.logError('no serviceRegistry',{ctx: origCtx})
        }
        const ctx = origCtx.setVars({
            $model: { ctx: origCtx, ...origCtx.params},
            $state,
            $serviceRegistry: origCtx.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions.isBEComp)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new jb.ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = origCtx.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && origCtx.vars[defaultVar])
                return ctx.run({$:origCtx.vars[defaultVar]})
            return origCtx.params.style ? origCtx.params.style(ctx) : {}
        }
    },
    garbageCollectUiComps({forceNow,clearAll,ctx}) {
        if (!forceNow)
            return jb.delay(1000).then(()=>jb.ui.garbageCollectUiComps({forceNow: true, clearAll, ctx}))
   
        // remove unused cmps from dictionary
        const usedCmps = new Map(querySelectAllWithWidgets(`[cmp-id]`).map(el=>[el.getAttribute('cmp-id'),el.getAttribute('ctx-id')]))
        const maxUsed = Object.values(usedCmps).map(x=> +x || 0).sort((x,y)=>x-y)[0] || (clearAll ? Number.MAX_SAFE_INTEGER : 0)
        const removedCmps = []
        Object.keys(jb.ui.cmps).filter(id=> (usedCmps.get(id) || 0) < maxUsed && !usedCmps.get(id)).forEach(id=> {removedCmps.push(id); delete jb.ui.cmps[id] })

        // remove unused vars from resources
        const removedResources = []
        // const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.db.isWatchable(v)).map(v => jb.db.asRef(v))
        //     .map(ref=>jb.db.refHandler(ref).pathOfRef(ref)).flat()
        // const globalVarsUsed = jb.utils.unique(Object.keys(usedCmps).map(id=>jb.path(jb.ui.cmps[id],'calcCtx')).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.db.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>{
                const cmpId = id.split(':').pop() // no ':' in cmpID or var name
                return (usedCmps.get(cmpId) || 0) < maxUsed && !usedCmps.get(cmpId)
            })
            .forEach(id => { removedResources.push(id); delete jb.db.resources[id]})

        // remove front-end widgets
        const usedWidgets = jb.objFromEntries(
            Array.from(querySelectAllWithWidgets(`[widgetid]`)).filter(el => el.getAttribute('frontend')).map(el => [el.getAttribute('widgetid'),1]))
        const removeWidgets = Object.keys(jb.ui.frontendWidgets||{}).filter(id=>!usedWidgets[id])

        removeWidgets.forEach(widgetId => {
            jb.ui.sendUserReq({$$:'destroy', widgetId, destroyWidget: true, cmps: [] })
            if (jb.ui.frontendWidgets) delete jb.ui.frontendWidgets[widgetId]
        })
        
        // remove component follow ups
        const removeFollowUps = Object.keys(jb.ui.followUps).flatMap(cmpId=> {
            const curVer = Array.from(querySelectAllWithWidgets(`[cmp-id="${cmpId}"]`)).map(el=>+el.getAttribute('cmp-ver'))[0]
            return jb.ui.followUps[cmpId].flatMap(({cmp})=>cmp).filter(cmp => !curVer || cmp.ver > curVer)
        })
        if (removeFollowUps.length)
            jb.ui.BECmpsDestroyNotification.next({ cmps: removeFollowUps})

        jb.log('garbageCollect',{maxUsed,removedCmps,removedResources,removeWidgets,removeFollowUps,ctx})

        function querySelectAllWithWidgets(query) {
            return jb.ui.headless ? [...Object.values(jb.ui.headless).filter(x=>x.body).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), 
                ...Array.from(jb.frame.document && document.querySelectorAll(query) || [])].filter(x=>x) : []
        }
    },    
    hashCss(_cssLines,ctx,{existingClass, existingElemId} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
        const classPrefix = widgetId || 'jb'
        const cssMap = this.cssHashMap[classPrefix] = this.cssHashMap[classPrefix] || {}

        if (!cssMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(cssMap).filter(k=>cssMap[k].classId == existingClass)[0]
                existingKey && delete cssMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}⦾${this.cssHashCounter}`
            const elemId = existingElemId || `${classPrefix}⦾${(++jb.ui.cssElemCounter)}`
            cssMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            jb.ui.insertOrUpdateStyleElem(ctx,cssContent,elemId,{classId})
        }
        Object.assign(cssMap[cssKey].paths, {[ctx.path] : true})
        return cssMap[cssKey].classId

        function linesToCssStyle(classId) {
            const cssStyle = cssLines.map(selectorPlusExp=>{
                const selector = selectorPlusExp.split('{')[0];
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.${classId}${x}` : x.replace('~',`.${classId}`));
                return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
            }).join('\n');
            return `${cssStyle} /* ${ctx.path} */`
        }
    },
    refreshElem(elem, state, options = {}) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing' || jb.ui.findIncludeSelf(elem,'[__refreshing]')[0]) 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const cmpBefore = jb.ui.cmps[cmpId]
        if (!cmpBefore)
            return jb.logError('refresh elem. can not find former cmp',{cmpId})
        const _ctx = cmpBefore.originatingCtx()
        const {methodBeforeRefresh, opVal} = options
        methodBeforeRefresh && cmpBefore && methodBeforeRefresh.split(',').forEach(m=>cmpBefore.runBEMethod(m,opVal))
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        const newState = strongRefresh ? {refresh: true } 
            : { ...jb.path(elem._component,'state'), refreshSource: jb.path(options,'refreshSource'), refresh: true, ...state} // strongRefresh kills state
        let ctx = _ctx.setVars({$model: null, $state: newState, $refreshElemCall: true, $cmpId: cmpId, $cmpVer: cmpVer+1})
        ctx._parent = null
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
//        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (ctx.vars.$previewMode && jb.watchableComps && jb.watchableComps.handler) // updating to latest version of profile - todo: moveto studio
            ctx.profile = jb.watchableComps.handler.valOfPath(ctx.path.split('~')) || ctx.profile
        elem.setAttribute('__refreshing','')
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.calc({ $$: 'data<>dialog.buildComp' }) : ctx.runItself()
        jb.log('refresh elem start',{cmp,ctx,newState ,elem, state, options})

        const className = elem.className != null ? elem.className : jb.path(elem.attributes.class) || ''
        const existingClass = (className.match(/[•a-zA-Z0-9_-]+⦾[0-9]*/)||[''])[0]
        if (jb.path(options,'cssOnly') && existingClass) {
            const { headlessWidget, headlessWidgetId } = ctx.vars
            if (headlessWidget) {
                const existingElemId = jb.entries(jb.ui.headless[headlessWidgetId].styles||{}).find(([id,text])=>text.indexOf(existingClass) != -1)[0]
                jb.log('css only refresh headelss element',{existingElemId, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            } else {
                const existingElem = Array.from(document.querySelectorAll('style')).find(el=>el.innerText.indexOf(existingClass) != -1)
                const existingElemId = existingElem.getAttribute('elemId')
                jb.log('css only refresh element',{existingElemId, existingElem, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            }
        } else {
            jb.log('do refresh element',{cmp,ctx,elem, state, options})
            cmp && jb.ui.applyNewVdom(elem, jb.ui.h(cmp), {strongRefresh, ctx, srcCtx: options.srcCtx})
        }
        elem.removeAttribute('__refreshing')
        jb.ui.refreshNotification.next({cmp,ctx,elem, state, options})
        //jb .studio.execInStudio({ $$:'animate.refreshElem', elem: () => elem })
    },
    JbComponent : class JbComponent {
        constructor(ctx,id,ver) {
            this.ctx = ctx // used to calc features
            this.cmpId = id || `${jb.uri}-${jb.ui.cmpCounter++}`
            //const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId || ''
            //id || (widgetId ? (widgetId+'-'+(jb.ui.cmpCounter++)) : ''+(jb.ui.cmpCounter++))
            this.ver = ver || 1
            this.eventObservables = []
            this.cssLines = []
            this.contexts = []
            this.originators = [ctx]
            this.isBEComp = true
        }
        init() {
            if (this.initialized) return
            jb.log('init uiComp',{cmp: this})
            const baseVars = this.ctx.vars
            this.ctx = (this.extendCtxFuncs||[])
                .reduce((acc,extendCtx) => jb.utils.tryWrapper(() => extendCtx(acc,this),'extendCtx',this.ctx), this.ctx.setVar('cmp',this))
            this.newVars = jb.objFromEntries(jb.entries(this.ctx.vars).filter(([k,v]) => baseVars[k] != v))
            this.renderProps = {}
            this.state = this.ctx.vars.$state
            this.calcCtx = this.ctx.setVars({$props: this.renderProps, cmp: this})
            this.initialized = true
        }
    
        calcRenderProps() {
            this.init()
            ;(this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
                .forEach(f => jb.utils.tryWrapper(() => f.action(this.calcCtx, this.calcCtx.vars), 'init',this.ctx));
    
            this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.db.isWatchable(obs.ref)) : []
            this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
                if (this.state[e.prop] != undefined) return // we have the value in the state, probably asynch value so do not calc again
                const modelProp = this.ctx.vars.$model[e.prop]
                if (!modelProp)
                    return jb.logError(`calcRenderProps: missing model prop for watchAndCalc "${e.prop}"`, {cmp: this, model: this.ctx.vars.$model, ctx: this.ctx})
                const ref = modelProp(this.ctx)
                if (jb.db.isWatchable(ref))
                    this.toObserve.push({id: e.prop, cmp: this, ref,...e})
                const val = jb.val(ref)
                this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? e.defaultValue : val))
            })

            ;[...(this.calcProp || []),...(this.method || [])].forEach(
                p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))
            ;(this.calcProp || []).forEach(prop=> 
                prop._priority = jb.utils.tryWrapper(() => prop.priority ? prop.priority(this.calcCtx) : 1, `renderPropPriority:${prop.id}`,this.ctx) )

            const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                    this.calcProp.filter(p=>p.id == toFilter.id && p._priority > toFilter._priority).length == 0)
            filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
                .forEach(prop=> { 
                    const val = jb.val( jb.utils.tryWrapper(() => 
                        prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                    `renderProp:${prop.id}`,this.ctx))
                    const value = val == null ? prop.defaultValue : val
                    Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
                })
            ;(this.calcProp || []).filter(p => p.userStateProp && !this.state.refresh).forEach(p => this.state[p.id] = this.renderProps[p.id])
            Object.assign(this.renderProps,this.styleParams, this.state)
            return this.renderProps
        }

        renderVdom() {
            jb.log('uiComp start renderVdom', {cmp: this})
            this.calcRenderProps()
            if (this.ctx.probe && this.ctx.probe.outOfTime) return
            this.template = this.template || (() => '')
            const initialVdom = jb.utils.tryWrapper(() => this.template(this,this.renderProps,jb.ui.h), 'template',this.ctx) || {}
            const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                    (vd && typeof vd === 'object') ? jb.utils.tryWrapper(() => modifier(vd,this,this.renderProps,jb.ui.h) || vd, 'templateModifier',this.ctx) 
                        : vd ,initialVdom)

            const observe = this.toObserve.map(x=>[
                x.ref.handler.urlOfRef(x.ref),
                x.includeChildren && `includeChildren=${x.includeChildren}`,
                x.methodBeforeRefresh && `methodBeforeRefresh=${x.methodBeforeRefresh}`,
                x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`, x.delay && `delay=${x.delay}`] 
                .filter(x=>x).join(';')).join(',')
                this.calcCtx
            const methods = (this.method||[]).map(h=>h.id).join(',')
            const usereventprops = (this.userEventProps||[]).join(',')
            const colocation = this.coLocation
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndLibs = (this.frontEndLib || [])
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(this.calcCtx))]))
            const passive = (frontEndMethods.length + frontEndLibs.length) == 0 && !this.followUpFuncs && !observe && !methods
            const hasAtts = (!passive) || this.ctx.vars.$previewMode || jb.path(vdom.attributes.id)
            if (vdom instanceof jb.ui.VNode) {
                vdom.addClass(this.jbCssClass())
                vdom.attributes = Object.assign(vdom.attributes || {}, Object.keys(this.state||{}).length && { $__state : JSON.stringify(this.state)})
                vdom.attributes = Object.assign(vdom.attributes,  {
                        'ctx-id': ''+ this.ctx.id,
                        'cmp-id': this.cmpId, 
                        'cmp-ver': ''+this.ver,
                        'cmp-pt': this.ctx.profile.$,
            //            'full-cmp-ctx': jb.ui .preserveCtx(this.calcCtx),
                })
                if (hasAtts) Object.assign(vdom.attributes,
                    observe && {observe}, 
                    methods && {methods},
                    this.ctx.vars.uiTest && {uiTest: this.ctx.vars.uiTest},
                    usereventprops && {usereventprops},
                    colocation && {colocation},
                    frontEndLibs.length && {$__frontEndLibs : JSON.stringify(frontEndLibs)},
                    frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                    (frontEndMethods.length + frontEndLibs.length)  && {interactive : 'true'}, 
                    frontEndVars && { $__vars : JSON.stringify(frontEndVars)},                    
                    (this.ctx.vars.$previewMode || this.pathForPick) && { $__debug: JSON.stringify({ 
                        path: this.pathForPick || this.originatingCtx().path,
                        callStack: jb.utils.callStack(this.calcCtx) 
                    }) },
                )
            }
            if (this.ctx.vars.$previewMode)
                this.callStack = jb.utils.callStack(this.calcCtx)
        
            jb.log('uiComp end renderVdom',{cmp: this, vdom})
            this.afterFirstRendering = true
            jb.ui.cmps[this.cmpId] = this
            return vdom
        }
        renderVdomAndFollowUp() {
            const vdom = this.renderVdom()
            jb.delay(1).then(() => (this.followUpFuncs||[]).forEach(fu=> jb.utils.tryWrapper(() => { 
                jb.log(`backend uiComp followUp`, {cmp: this, fu, srcCtx: fu.srcCtx})
                fu.action(this.calcCtx)
                if (this.ver>1)
                    jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver-1}]})
            }, 'followUp',this.ctx) ) ).then(()=> this.ready = true)
            this.ready = false
            return vdom
        }
        hasBEMethod(method) {
            return (this.method||[]).filter(h=> h.id == method)[0]
        }
        runBEMethod(method, data, vars, options = {}) {
            const {doNotUseUserReqTx, dataMethod, userReqTx} = options
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars,doNotUseUserReqTx, dataMethod, userReqTx})
            if (jb.path(vars,'$state'))
                Object.assign(this.state,vars.$state)
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
        refresh(state,options,ctx) {
            const elem = jb.ui.elemOfCmp(ctx,this.cmpId)
            jb.log('backend uiComp refresh request',{ctx, cmp: this,elem,state,options})
            jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver, destroyCtxs: [] }] })
            elem && jb.ui.refreshElem(elem,state,options) // cmpId may be deleted
        }
        runMethodObject(methodObj,data, vars) {
            return methodObj.ctx.setData(data).setVars({
                cmp: this,$state: this.state, $props: this.renderProps, ...vars, ...this.newVars, $model: this.calcCtx.vars.$model
            }).runInner(methodObj.ctx.profile.action,'action','action')
        }
        destroy(reqCtx = {}) {
            (this.method||[]).filter(h=> h.id == 'destroy').forEach(h => this.runMethodObject(h,null,reqCtx.vars))
        }
        calcCssLines() {
            return jb.utils.unique((this.css || []).map(l=> typeof l == 'function' ? l(this.calcCtx): l)
            .flatMap(css=>css.split(/}\s*/m)
                .map(x=>x.trim()).filter(x=>x)
                .map(x=>x+'}')
                .map(x=>x.replace(/^!/,' '))))
        }
        jbCssClass() {
            return jb.ui.hashCss(this.calcCssLines() ,this.ctx)
        }
        originatingCtx() {
            return this.originators[this.originators.length-1]
        }

        field() {
            if (this._field) return this._field
            const ctx = this.originatingCtx()
            this._field = {
                class: '',
                // ctxId: jb.ui .preserveCtx(ctx),
                control: (item,index,noCache) => this.getOrCreateItemField(item, () => ctx.setData(item).setVars({index: (index||0)+1}).runItself(),noCache),
            }
            this.enrichField && this.enrichField.forEach(enrichField=>enrichField(this._field))
            let title = jb.tosingle(jb.val(ctx.params.title)) || (() => '');
            if (this._field.title !== undefined)
                title = this._field.title
            // make it always a function 
            this._field.title = typeof title == 'function' ? title : () => ''+title;
            this.itemfieldCache = new Map()
            return this._field
        }
        getOrCreateItemField(item,factory,noCache) {
            if (noCache)
                return factory()
            if (!this.itemfieldCache.get(item))
                this.itemfieldCache.set(item,factory())
            return this.itemfieldCache.get(item)
        }
        orig(ctx) {
            const comp = ctx.profile && ctx.profile.$ && jb.comps[ctx.profile.$]
            if (comp && (comp.type || '').split(/,|-/).indexOf('control') == -1)
                debugger
            this.originators.push(ctx)
            return this
        }
        applyParamFeatures(ctx) {
            (ctx.params.features && ctx.params.features(ctx) || []).forEach(f => this.jbExtend(f,ctx))
            return this
        }

        jbExtend(_options,ctx) {
            if (!_options) return this;
            if (!ctx) debugger
            ctx = ctx || this.ctx;
            if (!ctx)
                jb.logError('uiComp: no ctx provided for jbExtend',{_options,ctx})
            if (typeof _options != 'object')
                jb.logError('uiComp: _options should be an object',{_options,ctx})
            const options = _options.$ ? ctx.run(_options, 'feature<>') : _options
            if (Array.isArray(options)) {
                options.forEach(o=>this.jbExtend(o,ctx))
                return this
            }

            if (options.afterViewInit) 
                options.frontEnd = options.afterViewInit
            if (typeof options.class == 'string') 
                options.templateModifier = vdom => vdom.addClass(options.class)

            Object.keys(options).forEach(key=>{
                if (typeof options[key] == 'function')
                    Object.defineProperty(options[key], 'name', { value: key })

                if (jb.ui.lifeCycle.has(key)) {
                    this[key+'Funcs'] = this[key+'Funcs'] || []
                    this[key+'Funcs'].push(options[key])
                }
                if (jb.ui.arrayProps.has(key)) {
                    this[key] = this[key] || []
                    this[key].push(options[key])
                }
                if (jb.ui.singular.has(key))
                    this[key] = this[key] || options[key]
            })
            if (options.watchRef) {
                this.watchRef = this.watchRef || []
                this.watchRef.push({cmp: this,...options.watchRef});
            }
            if (options.cmpId)
                this.cmpId = options.cmpId

            // eventObservables
            this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

            jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f, 'feature<>') : f , ctx))
            jb.asArray(jb.ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f, 'feature<>'), ctx))
            return this;
        }
    }
})

component('uiPlugin.dslDeclarations', {
  type: 'dslDeclaration',
  impl: () => jb.ui.initDslDeclarations()
})

});

jbLoadPackedFile({lineInPackage:7659, jb, noProxies: false, path: '/plugins/ui/core/ui-frontend.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui', 'frontend', {
    async refreshFrontEnd(elem, {content} = {}) {
        if (!(elem instanceof jb.ui.VNode)) {
            const libs = jb.ui.feLibs(content)
            if (libs.length) {
                jb.ui.addClass(elem,'jb-loading-libs')
                await jb.ui.loadFELibsDirectly(libs)
                jb.ui.removeClass(elem,'jb-loading-libs')
            }
        }
        jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> {
            const coLocation = jb.ui.parents(el,{includeSelf: true}).find(_elem=>_elem.getAttribute && _elem.getAttribute('colocation') == 'true')
            const coLocationCtx = coLocation && jb.ui.cmps[el.getAttribute('cmp-id')].calcCtx
            return el._component ? el._component.newVDomApplied() : new jb.ui.frontEndCmp(el,coLocationCtx) 
        })
    },
    feLibs(obj) {
        if (!obj || typeof obj != 'object') return []
        if (obj.attributes && obj.attributes.$__frontEndLibs) 
            return JSON.parse(obj.attributes.$__frontEndLibs)
        return Object.keys(obj).filter(k=> ['parentNode','attributes'].indexOf(k) == -1).flatMap(k =>jb.ui.feLibs(obj[k]))
    },
    frontEndCmp: class frontEndCmp {
        constructor(elem, coLocationCtx) {
            this.ctx = coLocationCtx || jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.core.jbCtx()
            if (elem.getAttribute('uiTest'))
                this.ctx = this.ctx.setVars({uiTest: true})
            this.state = { ...elem.state, frontEndStatus: 'initializing' }
            this.base = elem
            this.cmpId = elem.getAttribute('cmp-id')
            this.ver= elem.getAttribute('cmp-ver')
            this.pt = elem.getAttribute('cmp-pt')
            this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
            this.flows= []
            elem._component = this
            this.runFEMethod('calcProps',null,null,true)
            this.runFEMethod('init',null,null,true)
            this.state.frontEndStatus = 'ready'
            this.props = coLocationCtx && this.ctx.vars.$props
        }
        runFEMethod(method,data,_vars,silent) {
            if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
                return jb.logError('frontEnd - running method before init', {cmp: {...this}, method,data,_vars})
            const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method)
            if (toRun.length == 0 && !silent)
                return jb.logError(`frontEnd - no method ${method}`,{cmp: {...this}})
            toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
                const profile = path.split('~').reduce((o,p)=>o && o[p],jb.comps)
                if (!profile)
                    return jb.logError('runFEMethod - can not get profile',{method, path})
                const srcCtx = new jb.core.jbCtx(this.ctx, { profile, path, forcePath: path })
                const feMEthod = jb.core.run(srcCtx)
                const el = this.base
                const vars = {cmp: this, $state: this.state, el, ...this.base.vars, ..._vars }
                const ctxToUse = this.ctx.setData(data).setVars(vars)
                const {_prop, _flow } = feMEthod.frontEndMethod
                if (_prop)
                    jb.log(`frontend uiComp before calc prop ${_prop}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
                else if (_flow)
                    jb.log(`frontend uiComp start flow ${jb.ui.rxPipeName(_flow)}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
                else 
                    jb.log(`frontend uiComp run method ${method}`,{cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
                const res = ctxToUse.run(feMEthod.frontEndMethod.action, jb.utils.dslType(profile.$$))
                if (_prop)
                    jb.log(`frontend prop ${_prop} value`,{res, cmp: {...this}})
                if (_flow && res) this.flows.push(res)
            }, `frontEnd-${method}`,this.ctx))
        }
        enrichUserEvent(ev, {userEvent , ctx}) {
            (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => jb.utils.tryWrapper(() => {
                const actionPath = path+'~action'
                const profile = actionPath.split('~').reduce((o,p)=>o && o[p],jb.comps)
                if (!profile)
                    return jb.logError('enrichUserEvent - can not get profile',{method, path})
                const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
                Object.assign(userEvent, jb.core.run( new jb.core.jbCtx(ctx || this.ctx, { vars, profile, path: actionPath })))
            }, 'enrichUserEvent', ctx || this.ctx))
        }
        refresh(state, options) {
            jb.log('frontend uiComp refresh request',{cmp: {...this} , state, options})
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            jb.ui.refreshElem(this.base,this.state,options)
        }
        refreshFE(state) {
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            this.runFEMethod('onRefresh',null,null,true)
        }    
        newVDomApplied() {
            Object.assign(this.state,{...this.base.state}) // update state from BE
            this.ver= this.base.getAttribute('cmp-ver')
            this.runFEMethod('onRefresh',null,null,true)
        }
        destroyFE() {
            this._deleted = true
            this.flows.forEach(flow=>flow.dispose())
            this.runFEMethod('destroy',null,null,true)
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
        }
    }
})


});

jbLoadPackedFile({lineInPackage:7769, jb, noProxies: false, path: '/plugins/ui/core/ui-utils.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui', 'api', {
  renderWidget: (profile, topElem, ctx) => 
    jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry(ctx).run(profile)), topElem, { ctx }),
})

extension('ui', 'utils', {
  initExtension() {
    return {
      FELibLoaderPromises: {}
    }
  },
  focus(elem, logTxt, ctx) {
    if (!elem) debugger
    // block the preview from stealing the studio focus
    const now = new Date().getTime()
    const lastStudioActivity = jb.path(jb, ['studio', 'lastStudioActivity']) || jb.path(jb, ['studio', 'studioWindow', 'jb', 'studio', 'lastStudioActivity']) || 0

    jb.log('focus request', { ctx, logTxt, timeDiff: now - lastStudioActivity, elem })
    // if (jb.studio.previewjb == jb && jb.path(jb.ui.parentFrameJb(),'resources.studio.project') != 'studio-helper' && lastStudioActivity && now - lastStudioActivity < 1000)
    //     return
    jb.log('focus dom', { elem, ctx, logTxt })
    jb.delay(1).then(() => elem.focus())
  },
  withUnits: v => (v === '' || v === undefined) ? '' : ('' + v || '').match(/[^0-9]$/) ? v : `${v}px`,
  propWithUnits: (prop, v) => (v === '' || v === undefined) ? '' : `${prop}: ` + (('' + v || '').match(/[^0-9]$/) ? v : `${v}px`) + ';',
  fixCssLine: css => css.indexOf('\n') == -1 && !css.match(/}\s*/) ? `{ ${css} }` : css,
  // preserveCtx(ctx) {
  //   jb.ctxDictionary[ctx.id] = ctx
  //   return '' + ctx.id
  // },
  inStudio() { return jb.studio && jb.studio.studioWindow },
  isMobile: () => typeof navigator != 'undefined' && /Mobi|Android/i.test(navigator.userAgent),
  parentFrameJb() {
    try {
      return jb.frame.parent && jb.frame.parent.jb
    } catch (e) { }
  },
  //    inPreview: () => !jb.ui.inStudio() && jb.ui.parentFrameJb() && jb.ui.parentFrameJb().studio.initPreview,
  widgetBody(ctx) {
    const { elemToTest, widgetId, headlessWidget, FEwidgetId, headlessWidgetId, uiTest, useFrontEndInTest, FEEMulator } = ctx.vars
    const top = elemToTest ||
      FEEMulator && jb.path(jb, `ui.FEEmulator.${headlessWidgetId}.body`) ||
      uiTest && headlessWidget && jb.path(jb, `ui.headless.${headlessWidgetId}.body`) ||
      uiTest && jb.path(jb, `ui.FEEmulator.${headlessWidgetId}.body`) ||
      uiTest && jb.path(jb, `parent.ui.headless.${headlessWidgetId}.body`) ||
      widgetId && jb.path(jb, `ui.headless.${widgetId}.body`) ||
      headlessWidget && jb.path(jb, `ui.headless.${headlessWidgetId}.body`) ||
      jb.path(jb.frame.document, 'body')
    return FEwidgetId ? jb.ui.findIncludeSelf(top, `[widgetid="${FEwidgetId}"]`)[0] : top
  },
  cmpCtxOfElem: (elem) => elem && elem.getAttribute && jb.path(jb.ui.cmps[elem.getAttribute('cmp-id')],'calcCtx'),
  parentCmps: el => jb.ui.parents(el).map(el => el._component).filter(x => x),
  closestCmpElem: elem => jb.ui.parents(elem, { includeSelf: true }).find(el => el.getAttribute && el.getAttribute('cmp-id') != null),
  headlessWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('headless'))
    .map(el => el.getAttribute('widgetid'))[0],
  frontendWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('frontend'))
    .map(el => el.getAttribute('widgetid'))[0],
  parentWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop'))
    .map(el => el.getAttribute('widgetid'))[0],
  elemOfCmp: (ctx, cmpId) => jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx), `[cmp-id="${cmpId}"]`)[0],
  fromEvent: (cmp, event, elem, options) => jb.callbag.pipe(
    jb.callbag.fromEvent(event, elem || cmp.base, options),
    jb.callbag.takeUntil(cmp.destroyed)
  ),
  extendWithServiceRegistry(_ctx) {
    const ctx = _ctx || new jb.core.jbCtx()
    return ctx.setVar('$serviceRegistry', { baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {} })
  },
  //cmpV: cmp => cmp ? `${cmp.cmpId};${cmp.ver}` : '',
  rxPipeName: profile => (jb.path(profile, '0.event') || jb.path(profile, '0.$') || '') + '...' + jb.path(profile, 'length')
})

// ***************** inter-cmp services

component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({ extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

component('service.registerBackEndService', {
  type: 'feature',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'service', mandatory: true, dynamic: true},
    {id: 'allowOverride', as: 'boolean', type: 'boolean'}
  ],
  impl: feature.init((ctx, { $serviceRegistry }, { id, service, allowOverride }) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('register service', { id: _id, service: _service, ctx: ctx.cmpCtx })
    if ($serviceRegistry.services[_id] && !allowOverride)
      jb.logError('overridingService ${_id}', { id: _id, service: $serviceRegistry.services[_id], service: _service, ctx })
    $serviceRegistry.services[_id] = _service
  })
})


// ****************** html utils ***************
extension('ui', 'html', {
  outerWidth(el) {
    const style = getComputedStyle(el)
    return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight)
  },
  outerHeight(el) {
    const style = getComputedStyle(el)
    return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
  },
  offset: el => el.getBoundingClientRect(),
  parents(el, { includeSelf } = {}) {
    const res = []
    el = includeSelf ? el : el && el.parentNode
    while (el) {
      res.push(el)
      el = el.parentNode
    }
    return res
  },
  closest(el, query) {
    while (el) {
      if (jb.ui.matches(el, query)) return el
      el = el.parentNode
    }
  },
  scrollIntoView: el => el.scrollIntoViewIfNeeded && el.scrollIntoViewIfNeeded(),
  activeElement: () => jb.path(jb.frame.document,'activeElement'),
  find(el, selector, options) {
    if (!el) return []
    if (jb.path(el, 'constructor.name') == 'jbCtx')
      el = jb.ui.widgetBody(el)
    if (!el) return []
    return el instanceof jb.ui.VNode ? el.querySelectorAll(selector, options) :
      [... (options && options.includeSelf && jb.ui.matches(el, selector) ? [el] : []),
      ...Array.from(el.querySelectorAll(selector))]
  },
  findIncludeSelf: (el, selector) => jb.ui.find(el, selector, { includeSelf: true }),
  addClass: (el, clz) => el && el.addClass ? el.addClass(clz) : el.classList && el.classList.add(clz),
  removeClass: (el, clz) => el && el.removeClass ? el.removeClass(clz) : el.classList && el.classList.remove(clz),
  hasClass: (el, clz) => el && el.hasClass ? el.hasClass(clz) : el.classList && el.classList.contains(clz),
  getStyle: (el, prop) => el && el.getStyle ? el.getStyle(prop) : el.style[prop],
  setStyle: (el, prop,val) => el && el.setStyle ? el.setStyle(prop,val) : el.style[prop] = val,
  matches: (el, query) => el && el.matches && el.matches(query),
  indexOfElement: el => Array.from(el.parentNode.children).indexOf(el),
  limitStringLength: (str, maxLength) =>
    (typeof str == 'string' && str.length > maxLength - 3) ? str.substring(0, maxLength) + '...' : str,
  addHTML(el, html) {
    const elem = document.createElement('div')
    elem.innerHTML = html
    el.appendChild(elem.firstChild)
  },
  insertOrUpdateStyleElem(ctx, innerText, elemId, { classId } = {}) {
    const { headlessWidget, headlessWidgetId, previewOverlay, FEwidgetId, useFrontEndInTest} = ctx.vars

    if (useFrontEndInTest && !headlessWidget && FEwidgetId) {
      const widgetId = headlessWidgetId
      const widget = jb.ui.FEEmulator[widgetId]
      if (!widget)
        return
      widget.styles = widget.styles || {}
      widget.styles[elemId] = innerText
    } else if (headlessWidget && !previewOverlay) { // headless
      const widgetId = headlessWidgetId
      if (!jb.ui.headless[widgetId])
        return
      jb.ui.headless[widgetId].styles = jb.ui.headless[widgetId].styles || {}
      jb.ui.headless[widgetId].styles[elemId] = innerText
      jb.ui.sendRenderingUpdate(ctx, { widgetId, css: innerText, elemId, classId })
    } else if (jb.frame.document) { // FE or local
      let elem = document.querySelector(`head>style[elemId="${elemId}"]`)
      if (!elem) {
        elem = document.createElement('style')
        elem.setAttribute('elemId', elemId)
        document.head.appendChild(elem)
      }
      elem.setAttribute('src', `${classId || ''} ${ctx.path}`)
      jb.log('css update', { innerText, elemId })
      elem.textContent = innerText
    }
  },
  valueOfCssVar(varName, parent) {
    parent = parent || document.body
    if (!parent) {
      jb.logError('valueOfCssVar: no parent')
      return 'red'
    }
    el = parent.ownerDocument.createElement('div')
    el.style.display = 'none'
    el.style.color = `var(--${varName})`
    parent.appendChild(el)
    const ret = getComputedStyle(el).color
    parent.removeChild(el)
    return ret
  },
  async loadFELibsDirectly(libs) {
      if (!libs.length) return
      if (typeof document == 'undefined') {
          return jb.logError('can not load front end libs to a frame without a document')
      }
      const libsToLoad = jb.utils.unique(libs)
      libsToLoad.forEach(lib=> jb.ui.FELibLoaderPromises[lib] = jb.ui.FELibLoaderPromises[lib] || loadFELib(lib) )
      jb.log('FELibs toLoad',{libsToLoad})
      return libsToLoad.reduce((pr,lib) => pr.then(()=> jb.ui.FELibLoaderPromises[lib]), Promise.resolve())

      async function loadFELib(lib) {
        if (jbHost.loadFELib) return jbHost.loadFELib(lib)
          if (lib.match(/js$/)) {
            const code = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${lib}`).then(x=>x.text())
            eval(code)
          } else if (lib.match(/css$/)) {
              const code = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${lib}`).then(x=>x.text())
              const style = document.createElement('style')
              style.type = 'text/css'
              style.innerHTML = code
              document.head.appendChild(style)
          } else if (lib.match(/woff2$/)) {
            const [fontName,_lib] = lib.split(':')
            const arrayBuffer = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${_lib}`).then(x=>x.arrayBuffer())
            const base64Font = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
            const fontFace = `
            @font-face {
                font-family: '${fontName}';
                src: url(data:font/woff2;base64,${base64Font}) format('woff2');
            }`;
    
            const style = document.createElement('style');
            style.textContent = fontFace;
            document.head.appendChild(style);    
          }
        }
    }
})

extension('ui', 'beautify', {
  beautifyXml(xml) {
    return xml.trim().split(/>\s*</).reduce((acc, node) => {
      const pad = Math.max(0, acc[1] + (node.match(/^\w[^>]*[^\/]/) ? 1 : node.match(/^\/\w/) ? -1 : 0))
      return [acc[0] + new Array(pad).join('  ') + '<' + node + '>\n', pad]
    }, ['', 0])[0].slice(1, -2)
  },
  beautifyDelta(delta) {
    const childs = delta.children || []
    const childrenAtts = childs && ['sameOrder', 'resetAll', 'deleteCmp'].filter(p => childs[p]).map(p => p + '="' + childs[p] + '"').join(' ')
    const childrenArr = childs.length ? Array.from(Array(childs.length).keys()).map(i => childs[i]) : []
    const children = (childrenAtts || childrenArr.length) && `<children ${childrenAtts || ''}>${childrenArr.map(ch => jb.ui.vdomToHtml(ch)).join('')}</children>`
    const toAppend = childs && childs.toAppend && `<toAppend>${childs.toAppend.map(ch => jb.ui.vdomToHtml(ch)).join('')}</toAppend>`
    return jb.ui.beautifyXml(`<delta ${jb.entries(delta.attributes).map(([k, v]) => k + '="' + v + '"').join(' ')}>
            ${[children, toAppend].filter(x => x).join('')}</delta>`)
  },
})

// ****************** components ****************

component('action.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true},
    {id: 'cmpId', as: 'string', mandatory: true},
    {id: 'assumedVdom'}
  ],
  impl: (ctx, delta, cmpId, assumedVdom) => jb.ui.applyDeltaToCmp({ ctx, delta, cmpId, assumedVdom })
})

component('sink.applyDeltaToCmp', {
  type: 'rx',
  params: [
    {id: 'delta', dynamic: true, mandatory: true},
    {id: 'cmpId', as: 'string', mandatory: true}
  ],
  impl: sink.action(action.applyDeltaToCmp('%$delta()%', '%$cmpId%'))
})

component('action.focusOnCmp', {
  description: 'runs both in FE and BE',
  type: 'action',
  params: [
    {id: 'description', as: 'string'},
    {id: 'cmpId', as: 'string', defaultValue: '%$cmp/cmpId%'}
  ],
  impl: (ctx, desc, cmpId) => {
    const frontEndElem = jb.path(ctx.vars.cmp, 'base')
    if (frontEndElem) {
      jb.log('frontend focus on cmp', { frontEndElem, ctx, desc, cmpId })
      return jb.ui.focus(frontEndElem, desc, ctx)
    } else {
      jb.log('backend focus on cmp', { frontEndElem, ctx, desc, cmpId })
      const delta = { attributes: { $focus: desc } }
      jb.ui.applyDeltaToCmp({ delta, ctx, cmpId })
    }
  }
})

component('customStyle', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:10',
  params: [
    {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true, byName: true},
    {id: 'css', as: 'string'},
    {id: 'features', type: 'feature[]', typeAsParent: t=>t.replace(/style/,'feature'), dynamic: true}
  ],
  impl: (ctx, css, features) => ({
    template: ctx.profile.template,
    css: css,
    featuresOptions: features(),
    styleParams: ctx.cmpCtx.params
  })
})

component('styleByControl', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx, control, modelVar) => control(ctx.setVar(modelVar, ctx.vars.$model))
})

component('styleWithFeatures', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  description: 'customize, add more features to style',
  category: 'advanced:10,all:20',
  params: [
    {id: 'style', type: '$asParent', mandatory: true, composite: true},
    {id: 'features', type: 'feature[]', templateValue: [], typeAsParent: t=>t.replace(/style/,'feature'), dynamic: true, mandatory: true}
  ],
  impl: (ctx, style, features) => {
    if (style.isBEComp)
      return style.jbExtend(features(), ctx)
    return style && { ...style, featuresOptions: (style.featuresOptions || []).concat(features()) }
  }
})

component('controlWithFeatures', {
  type: 'control',
  description: 'customize, add more features to control',
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true},
    {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
  ],
  impl: (ctx, control, features) => control.jbExtend(features, ctx).orig(ctx)
})

component('renderWidget', {
  type: 'action',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'body'}
  ],
  impl: (ctx, control, selector) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidget can not find element for selector', { selector })
    jb.ui.unmount(el)
    el.innerHTML = ''
    jb.ui.render(jb.ui.h(control(jb.ui.extendWithServiceRegistry(ctx))), el, { ctx })
  }
})


});

jbLoadPackedFile({lineInPackage:8138, jb, noProxies: false, path: '/plugins/ui/core/ui-watchref.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
using('watchable,common,rx')

extension('ui', 'watchRef', {
    $phase: 100,
    $requireFuncs: '#watchable.WatchableValueByRef',
    initExtension() {
        jb.db.watchableHandlers.forEach(h=> jb.ui.subscribeToRefChange(h))
    },
    subscribeToRefChange: watchHandler => jb.utils.subscribe(watchHandler.resourceChange, e=> {
        const {opVal, srcCtx } = e
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const testTop = jb.path(e,'srcCtx.vars.testID') && jb.ui.widgetBody(srcCtx)
        const tops = [testTop, jb.path(jb.frame.document,'body'), ...Object.values(jb.ui.headless).map(x=>x && x.body) ].filter(x=>x)
        const elemsToCheck = tops.flatMap(top=> jb.ui.find(top,'[observe]').map(elem=>({top, elem})))

        const elemsToCheckCtxIdBefore = elemsToCheck.map(({elem}) =>elem.getAttribute('cmp-ver'))
        const originatingCmpId = jb.path(srcCtx, 'vars.cmp.cmpId')
        jb.log(`refresh check observable elements : ${changed_path.join('~')}`,{originatingCmpId,elemsToCheck,e,srcCtx })
        const refreshActions = elemsToCheck.map(({elem, top},i) => {
            const FEWidgetId = jb.ui.frontendWidgetId(elem)
            if (FEWidgetId && FEWidgetId != 'client') return

            const cmpId = elem.getAttribute('cmp-id')
            if (cmpId.indexOf('-') != -1 && cmpId.split('-')[0] != jb.uri)
                return
            let refresh = false, strongRefresh = false, cssOnly = true, delay = 0, methodBeforeRefresh = ''
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${originatingCmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observable',{cmpId,originatingCmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',{originatingCmpId,cmpId,obs,e})
                strongRefresh = strongRefresh || obs.strongRefresh
                delay = delay || obs.delay
                cssOnly = cssOnly && obs.cssOnly
                methodBeforeRefresh = [methodBeforeRefresh,obs.methodBeforeRefresh || ''].filter(x=>x).join(',')
                const diff = jb.utils.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure)
                    refresh = true
            })
            if (refresh)
                return ctx => applyRefreshAstAction({ctx, delay,elem, methodBeforeRefresh, strongRefresh, cssOnly, cmpId, originatingCmpId, top, i})
        }).filter(x=>x)
        const tx = srcCtx.vars.userReqTx
        if (tx)
            tx.completeByChildren(refreshActions, srcCtx)
        else
            refreshActions.forEach(action => action(srcCtx))

        async function applyRefreshAstAction({ctx, delay,elem, methodBeforeRefresh, strongRefresh, cssOnly,cmpId, originatingCmpId, top, i}) {
            await doApply()
            const tx = ctx.vars.userReqTx
            tx && tx.complete(`refresh cmp ${cmpId}`)

            function doApply() {
                if (!jb.ui.parents(elem).find(el=>el == top))
                    return jb.log('observable elem was detached in refresh process',{originatingCmpId,cmpId,elem})
                if (elemsToCheckCtxIdBefore[i] != elem.getAttribute('cmp-ver'))
                    return jb.log('observable elem was refreshed from top in refresh process',{originatingCmpId,cmpId,elem})
                jb.log('refresh from observable elements',{cmpId,originatingCmpId,elem,ctx,e})
                if (delay)
                    jb.delay(delay).then(()=> jb.ui.refreshElem(elem,null,{srcCtx : ctx, strongRefresh, methodBeforeRefresh, opVal, cssOnly}))
                else
                    jb.ui.refreshElem(elem,null,{srcCtx: ctx, methodBeforeRefresh, opVal, strongRefresh, cssOnly})
            }
        }

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const delay = +((parts[1].match(/delay=([0-9]+)/) || ['',''])[1])
            const methodBeforeRefresh = (parts[1].match(/methodBeforeRefresh=([a-zA-Z0-9_]+)/) || ['',''])[1]
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, methodBeforeRefresh, strongRefresh, cssOnly, allowSelfRefresh, delay }
        }
    })
})
});

jbLoadPackedFile({lineInPackage:8229, jb, noProxies: false, path: '/plugins/ui/core/vdom.js',fileDsl: '', pluginId: 'ui-core' }, 
            function({jb,require,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,group,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,css,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui','vdom', {
    VNode: class VNode {
        constructor(cmpOrTag, _attributes, _children) {
            const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]]).filter(e=>e[1] != null)
                .map(([id,val])=>[id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, typeof val == 'object' ? val : ''+val]))
            let children = (_children === '') ? null : _children
            if (['string','boolean','number'].indexOf(typeof children) !== -1) {
                attributes.$text = ''+children
                children = null
            }
            if (children && typeof children.then == 'function') {
                attributes.$text = '...'
                children = null
            }
            if (children != null && !Array.isArray(children)) children = [children]
            if (children != null)
                children = children.filter(x=>x).map(item=> typeof item == 'string' ? jb.ui.h('span',{$text: item}) : item)
            if (children && children.length == 0) children = null
            if (!Array.isArray(children || []))
                jb.logError('vdom - children must be array',{cmpOrTag, _attributes, _children})
            
            this.attributes = attributes
                
            if (typeof cmpOrTag == 'string' && cmpOrTag.indexOf('.') != -1) {
                this.addClass(cmpOrTag.split('.').pop().trim())
                cmpOrTag = cmpOrTag.split('.')[0]
            }
            if (typeof cmpOrTag == 'string' && cmpOrTag.indexOf('#') != -1)
                debugger
            if (typeof cmpOrTag != 'string' && !jb.path(cmpOrTag,'$'))
                debugger
            if (cmpOrTag == '[object Object]') {
                debugger
                cmpOrTag = 'div'
            }

            if (children != null)
                children.forEach(ch=>ch.parentNode = this)
            Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,...(children && {children}) })
        }
        getAttribute(att) {
            const res = (this.attributes || {})[att.toLowerCase()]
            return res == null ? res : (''+res)
        }
        setAttribute(att,val) {
            if (val == null) return
            this.attributes = this.attributes || {}
            this.attributes[att.toLowerCase()] = ''+val
            return this
        }
        removeAttribute(att) {
            this.attributes && delete this.attributes[att.toLowerCase()]
        }
        addClass(clz) {
            if (!clz) return
            if (clz.indexOf(' ') != -1) {
                clz.split(' ').filter(x=>x).forEach(cl=>this.addClass(cl))
                return this
            }
            this.attributes = this.attributes || {}
            if (this.attributes.class === undefined) this.attributes.class = ''
            if (clz && this.attributes.class.split(' ').indexOf(clz) == -1)
                this.attributes.class = [this.attributes.class,clz].filter(x=>x).join(' ')
            return this
        }
        removeClass(clz) {
            this.attributes = this.attributes || {}
            this.attributes.class = (this.attributes.class || '').split(' ').filter(x=>x!=clz).join(' ') || ''
            return this
        }        
        hasClass(clzs) {
            return clzs.split('.').filter(x=>x).reduce((acc,clz) => 
                acc && (jb.path(this,'attributes.class') || '').split(' ').indexOf(clz) != -1, true)
            //return (jb.path(this,'attributes.class') || '').split(' ').indexOf(clz) != -1
        }
        getStyle(prop) {
            this.attributes = this.attributes || {}
            return (this.attributes.style || '').split(';').filter(x=>x.indexOf(`${prop}:`) == 0).map(x=>x.split(':').pop().trim())[0]
        }
        setStyle(prop,val) {
            this.attributes = this.attributes || {}
            this.attributes.style = 
                [...(this.attributes.style || '').split(';').filter(x=>x.indexOf(`${prop}:`) == 0), `${prop}: ${val}`].join(';')
        }
        appendChild(vdom) {
            this.children = this.children || []
            this.children.push(vdom)
            vdom.parentNode = this
            return this
        }
        querySelector(...args) {
            return this.querySelectorAll(...args)[0]
        }
        querySelectorAll(selector,{includeSelf}={}) {
            let maxDepth = 50
            if (!selector) debugger
            if (selector.match(/>/)) {
                const parts = selector.split('>')
                const first = this.querySelectorAll(parts[0])
                return parts.slice(1).reduce((acc,part) => acc.flatMap(el=>el.children).filter(el=>el.matches(part)), first)
            }
            if (selector == '*') return this.children
            if (selector == '' || selector == ':scope') return [this]
            if (selector.indexOf(' ') != -1)
                return selector.split(' ').map(x=>x.trim()).reduce(
                    (res,sel) => res.flatMap(r=>r.querySelectorAll(sel,{includeSelf})), jb.asArray(this))
            if (selector.indexOf(',') != -1)
                return selector.split(',').map(x=>x.trim()).reduce((res,sel) => [...res, ...this.querySelectorAll(sel,{includeSelf})], [])
            const selectorMatcher = jb.ui.selectorMatcher(selector)
            if (selectorMatcher)
                return doFind(this,selectorMatcher,!includeSelf,0)
            jb.logError(`vdom selector is not supported ${selector}`,{vdom: this})
            return []

            function doFind(vdom,selectorMatcher,excludeSelf,depth) {
                return depth >= maxDepth ? [] : [ ...(!excludeSelf && selectorMatcher(vdom) ? [vdom] : []), 
                    ...(vdom.children||[]).flatMap(ch=> doFind(ch,selectorMatcher,false,depth+1))
                ]
            }
        }
        matches(selector) {
            const selectorMatcher = jb.ui.selectorMatcher(selector)
            return selectorMatcher && selectorMatcher(this)
        }
        outerHTML(depth) { // for tests
            const styleVal = jb.entries(jb.path(this.attributes,'style')).map(e=>`${e[0]}:${e[1]}`).join(';')
            const styleAtt = styleVal ? ` style="${styleVal}" ` : ''
            const lPrefix = '                      '.slice(0,depth||0)
            const atts = jb.entries(this.attributes).filter(e=>! ['$text','$html'].includes(e[0])).map(([att,val]) => att+'="'+val+'"').join(' ').replace(/\$focus/g,'__focus')
            const text = jb.path(this.attributes,'$text') || jb.path(this.attributes,'$html') || ''
            const children = text + (this.children || []).map(x=>x.outerHTML((depth||0)+1)).join('\n')
            const childrenwithNL = (this.children || []).length ? `\n${lPrefix}${children}\n${lPrefix}` : text
            return `${lPrefix}<${this.tag} ${styleAtt}${atts}${children?'':'/'}>${children? `${childrenwithNL}</${this.tag}>`:''}`
        }
        addEventListener(event, handler, options) {
            this.handlers = this.handlers || {}
            this.handlers[event] = this.handlers[event] || []
            this.handlers[event].push(handler)
        }
        removeEventListener(event, handler, options) {
            const handlers = jb.path(this.handlers,event)
            handlers.splice(handlers.indexOf(handler),1)
        }
        focus() { // for tests 
        }
    },
    selectorMatcher(selector) {
        const hasAtt = selector.match(/^\[([a-zA-Z0-9_$\-]+)\]$/)
        const attEquals = selector.match(/^\[([a-zA-Z0-9_$\-]+)="([a-zA-Z0-9_\-→•]+)"\]$/)
        const hasClass = selector.match(/^(\.[a-zA-Z0-9_$\-]+)+$/)
        const hasTag = selector.match(/^[a-zA-Z0-9_\-]+$/)
        const idEquals = selector.match(/^#([a-zA-Z0-9_$\-]+)$/)
        const nthChild = selector.match(/^([a-zA-Z0-9_\-]+):nth-child\(([0-9]+)\)$/)
        const selectorMatcher = hasAtt ? el => el.attributes && el.attributes[hasAtt[1]]
            : hasClass ? el => el.hasClass(hasClass[1])
            : hasTag ? el => el.tag === hasTag[0]
            : attEquals ? el => el.attributes && el.attributes[attEquals[1]] == attEquals[2]
            : idEquals ? el => el.attributes && el.attributes.id == idEquals[1]
            : nthChild ? el => el.parentNode && el.tag === nthChild[1] && el.parentNode.children.indexOf(el) == (nthChild[2]-1)
            : null

        return selectorMatcher
    },
    toVdomOrStr(val) {
        if (jb.utils.isDelayed(val))
            return jb.utils.toSynchArray(val).then(v => jb.ui.toVdomOrStr(v[0]))

        const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
        let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
        if (res && res instanceof jb.ui.VNode || Array.isArray(res)) return res
        if (typeof res === 'boolean' || typeof res === 'object')
            res = '' + res
        else if (typeof res === 'string')
            res = res.slice(0,1000)
        return res
    },
    compareVdom(b,after,ctx) {
        const a = jb.ui.stripVdom(after)
        jb.log('vdom diff compare',{before: b,after : a,ctx})
        const attributes = jb.utils.objectDiff(a.attributes || {}, b.attributes || {})
        const children = childDiff(b.children || [],a.children || [])
        return { 
            ...(Object.keys(attributes).length ? {attributes} : {}), 
            ...(children ? {children} : {}),
            ...(a.tag != b.tag ? { tag: a.tag} : {})
        }

        function childDiff(b,a) {
            if (b.length == 0 && a.length ==0) return
            if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
                return { 0: {...jb.ui.compareVdom(b[0],a[0],ctx),__afterIndex: 0}, length: 1 }
            jb.log('vdom child diff start',{before: b,after: a,ctx})
            const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
            let remainingBefore = beforeWithIndex.slice(0)
            // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
            const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
            a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

            const reused = []
            const res = { length: 0, sameOrder: true }
            beforeWithIndex.forEach( (e,i) => {
                const __afterIndex = afterToBeforeMap.indexOf(e)
                if (__afterIndex != i) res.sameOrder = false
                if (__afterIndex == -1) {
                    res.length = i+1
                    res[i] =  {$$: 'delete' } //, __afterIndex: i }
                } else {
                    reused[__afterIndex] = true
                    const innerDiff = { __afterIndex, ...jb.ui.compareVdom(e, a[__afterIndex],ctx), ...(e.$remount ? {remount: true}: {}) }
                    if (Object.keys(innerDiff).length > 1) {
                        res[i] = innerDiff
                        res.length = i+1
                    }
                }
            })
            res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
            jb.log('vdom child diff result',{res,before: b,after: a,ctx})
            if (!res.length && !res.toAppend.length) return null
            return res

            function locateVdom(toLocate,remainingBefore) {
                const found = remainingBefore.findIndex(before=>sameSource(before,toLocate))
                if (found != -1)                
                    return remainingBefore.splice(found,1)[0]
            }
            function sameIndexSameTag(toLocate,index,remainingBefore) {
                const found = remainingBefore.findIndex(before=>before.tag && before.i == index && before.tag === toLocate.tag)
                if (found != -1) {
                    const ret = remainingBefore.splice(found,1)[0]
                    if (ret.attributes.ctxId && !sameSource(ret,toLocate))
                        ret.$remount = true
                    return ret
                }
            }
            function sameSource(vdomBefore,vdomAfter) {
                if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
                const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
                if (atts1['cmp-id'] && atts1['cmp-id'] === atts2['cmp-id']) return true
                if (compareAtts(['id','path','name'],atts1,atts2)) return true
            }
            function compareAtts(attsToCompare,atts1,atts2) {
                for(let i=0;i<attsToCompare.length;i++)
                    if (atts1[attsToCompare[i]] && atts1[attsToCompare[i]] == atts2[attsToCompare[i]])
                        return true
            }        
        }
    },
    stripVdom(vdom) {
        if (jb.path(vdom,'constructor.name') != 'VNode') {
            if (vdom && vdom.tag) return vdom
            jb.logError('stripVdom - not vnode', {vdom})
            return jb.ui.h('span')
        }
        return { 
            ...(vdom.attributes && {attributes: vdom.attributes}), 
            ...(vdom.children && vdom.children.length && {children: vdom.children.map(x=>jb.ui.stripVdom(x))}),
            tag: vdom.tag
        }
    },
    unStripVdom(vdom,parent) {
        return _unStripVdom(JSON.parse(JSON.stringify(vdom)),parent)

        function _unStripVdom(vdom,parent) {
            if (!vdom) return // || typeof vdom.parentNode == 'undefined') return
            vdom.parentNode = parent
            Object.setPrototypeOf(vdom, jb.ui.VNode.prototype);
            ;(vdom.children || []).forEach(ch=>_unStripVdom(ch,vdom))
            return vdom
        }
    },
    vdomToHtml(vdom) {
        if (!vdom) return ''
        let childs = (vdom.children || [])
        if (!Array.isArray(childs))
            childs = childs.length ? Array.from(Array(childs.length).keys()).map(i=>childs[i]) : []
        const childern = childs.map(x=>jb.ui.vdomToHtml(x)).join('')
        return `<${vdom.tag} ${jb.entries(vdom.attributes).map(([k,v]) => k+'="' +v + '"').join(' ')} ${childern?'':'/'}>
            ${childern ? childern + '</' + vdom.tag +'>' :''}`
    },
    cloneVNode(vdom) {
        return jb.ui.unStripVdom(JSON.parse(JSON.stringify(jb.ui.stripVdom(vdom))))
    },
    vdomDiff(newObj,orig) {
        const ignoreRegExp = /\$|checked|style|value|parentNode|frontend|__|widget|on-|remoteuri|width|height|top|left|aria-|tabindex|colocation/
        const ignoreValue = /__undefined/
        const ignoreClasses = /selected|mdc-[a-z\-0-9]+/
        return doDiff(newObj,orig)
        function doDiff(newObj,orig,attName) {
            if (Array.isArray(orig) && orig.length == 0) orig = null
            if (Array.isArray(newObj) && newObj.length == 0) newObj = null
            if (orig === newObj) return {}
    //        if (jb.path(newObj,'attributes.jb_external') || jb.path(orig,'attributes.jb_external')) return {}
            if (typeof orig == 'string' && ignoreValue.test(orig) || typeof newObj == 'string' && ignoreValue.test(newObj)) return {}
            if (attName == 'class' && 
                (typeof orig == 'string' && ignoreClasses.test(orig) || typeof newObj == 'string' && ignoreClasses.test(newObj))) return {}
            if (!jb.utils.isObject(orig) || !jb.utils.isObject(newObj)) return newObj
            const deletedValues = Object.keys(orig)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof orig[k] == 'string' && ignoreValue.test(orig[k])))
                .filter(k => !(Array.isArray(orig[k]) && orig[k].length == 0))
    //            .filter(k => !(typeof orig[k] == 'object' && jb.path(orig[k],'attributes.jb_external')))
                .reduce((acc, key) => newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: '__undefined'}, {})

            return Object.keys(newObj)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof newObj[k] == 'string' && ignoreValue.test(newObj[k])))
                .filter(k => !(Array.isArray(newObj[k]) && newObj[k].length == 0))
    //            .filter(k => !(typeof newObj[k] == 'object' && jb.path(newObj[k],'attributes.jb_external')))
                .reduce((acc, key) => {
                    if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
                    const difference = doDiff(newObj[key], orig[key],key)
                    if (jb.utils.isObject(difference) && jb.utils.isEmpty(difference)) return acc // return no diff
                    return { ...acc, [key]: difference } // return updated key
            }, deletedValues)    
        }
    }
})
});

jbLoadPackedFile({lineInPackage:8550, jb, noProxies: false, path: '/plugins/ui/common/editable-text.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text-style', defaultValue: editableText.input(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('editableText.input', {
  type: 'editable-text-style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

});

jbLoadPackedFile({lineInPackage:8575, jb, noProxies: false, path: '/plugins/ui/common/button.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('button', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button-style', defaultValue: button.native(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'disabledTillActionFinished', as: 'boolean', type: 'boolean'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('button.initAction', {
  type: 'feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    method('onclickHandler', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'title' }})
  )
})

component('button.initDisabled', {
  type: 'feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    frontEnd.method('disable', ({data},{el}) => { 
      const btn = jb.ui.findIncludeSelf(el,'button')[0]
      if (btn)
        data ? btn.setAttribute('disabled',data) : btn.removeAttribute('disabled')
    }),
    frontEnd.flow(
      source.event('click'),
      rx.do(action.runFEMethod('disable', true)),
      rx.mapPromise(action.runBEMethod('handleClick')),
      rx.do(action.runFEMethod('disable', false)),
      sink.action()
    ),
    method('handleClick', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'title' }})
  )
})

component('button.ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

component('button.altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

component('button.native', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}',
    features: button.initAction()
  })
})

component('button.href', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-textLink-fg)} .raised { color: var(--jb-textLink-active-fg) }',
    features: button.initAction()
  })
})
});

jbLoadPackedFile({lineInPackage:8680, jb, noProxies: false, path: '/plugins/ui/common/css-features.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('css.width', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'width', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${jb.ui.withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

component('css.height', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'height', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${jb.ui.withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

component('css.opacity', {
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

component('css.padding', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != '')
      .map(x=> `padding-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

component('css.margin', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em, -20'},
    {id: 'left', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${jb.ui.withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

component('css.marginAllSides', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'value', as: 'string', mandatory: true, description: 'e.g. 20, 20%, 0.4em'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,value,selector) => ({css: `${selector} margin: ${jb.ui.withUnits(value)}`})
})

component('css.marginVerticalHorizontal', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'vertical', as: 'string', mandatory: true},
    {id: 'horizontal', as: 'string', mandatory: true},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,vertical,horizontal,selector) =>
    ({css: `${selector} margin: ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(horizontal)}`})
})

component('css.transformRotate', {
  type: 'feature',
  params: [
    {id: 'angle', as: 'string', description: '0-360'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,angle,selector) => ({css: `${selector} {transform:rotate(${angle}deg)}`})
})

component('css.color', {
  type: 'feature',
  params: [
    {id: 'color', as: 'string', dynamic: true},
    {id: 'background', as: 'string', editAs: 'color', dynamic: true},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
		const css = ['color','background']
      .filter(x=>ctx.params[x](ctx))
      .map(x=> `${x}: ${ctx.params[x](ctx)}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

component('css.transformScale', {
  type: 'feature',
  params: [
    {id: 'x', as: 'string', description: '0-1'},
    {id: 'y', as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:scale(${ctx.params.x},${ctx.params.y})}`})
})

component('css.transformTranslate', {
  type: 'feature',
  description: 'margin, move, shift, offset',
  params: [
    {id: 'x', as: 'string', description: '10px', defaultValue: '0'},
    {id: 'y', as: 'string', description: '20px', defaultValue: '0'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:translate(${jb.ui.withUnits(ctx.params.x)},${jb.ui.withUnits(ctx.params.y)})}`})
})

component('css.bold', {
  type: 'feature',
  impl: ctx => ({css: `{font-weight: bold}`})
})

component('css.underline', {
  type: 'feature',
  impl: ctx => ({css: `{text-decoration: underline}`})
})

component('css.boxShadow', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'inset', as: 'boolean', description: 'the box is raised or content is depressed inside the box', type: 'boolean'},
    {id: 'blurRadius', as: 'string', defaultValue: '5', description: 'bigger and lighter shadow'},
    {id: 'spreadRadius', as: 'string', defaultValue: '0', description: 'just bigger shadow'},
    {id: 'shadowColor', as: 'string', defaultValue: '#000000'},
    {id: 'opacity', as: 'string', defaultValue: 0.5, description: '0-1'},
    {id: 'horizontal', as: 'string', defaultValue: '10', description: 'offset-x'},
    {id: 'vertical', as: 'string', defaultValue: '10', description: 'offset-y'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,inset, blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    const color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${inset?'inset ':''}${jb.ui.withUnits(horizontal)} ${jb.ui.withUnits(vertical)} ${jb.ui.withUnits(blurRadius)} ${jb.ui.withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
  }
})

component('css.border', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'width', as: 'string', defaultValue: '1'},
    {id: 'side', as: 'string', options: 'top,left,bottom,right'},
    {id: 'style', as: 'string', options: 'solid,dotted,dashed,double,groove,ridge,inset,outset', defaultValue: 'solid'},
    {id: 'color', as: 'string', defaultValue: 'black'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${jb.ui.withUnits(width)} ${style} ${color} }`})
})

component('css.borderRadius', {
  type: 'feature',
  moreTypes: 'dialog-feature<>',
  params: [
    {id: 'radius', as: 'string', defaultValue: '5'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,radius,selector) => ({css: `${selector} { border-radius: ${jb.ui.withUnits(radius)}}`})
})

component('css.lineClamp', {
  type: 'feature',
  description: 'ellipsis after X lines',
  params: [
    {id: 'lines', mandatory: true, as: 'string', templateValue: 3, description: 'no of lines to clump'},
    {id: 'selector', as: 'string'}
  ],
  impl: css(
    '%$selector% { overflow: hidden; text-overflow: ellipsis; -webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: %$lines% }'
  )
})

component('css.valueOfCssVar', {
  description: 'value of css variable --var under element',
  params: [
    {id: 'varName', description: 'without the -- prefix'},
    {id: 'parent', description: 'html element under which to check the var, default is document.body'}
  ],
  impl: (ctx,varName,parent) => jb.ui.valueOfCssVar(varName,parent)
})

component('css.conditionalClass', {
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        vdom.addClass(cssClass())
      return vdom
    }
  })
})

 jb.defComponents('layout,typography,detailedBorder,detailedColor,gridArea'.split(','), 
  id => component(`css.${id}`, ({
    autoGen: true,
    type: 'feature',
    hidden: true,
    params: [
      {id: 'css', mandatory: true, as: 'string'}
    ],
    impl: (ctx,css) => ({css: jb.ui.fixCssLine(css)})
})))


});

jbLoadPackedFile({lineInPackage:8930, jb, noProxies: false, path: '/plugins/ui/common/field.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('ui', 'field', {
  initExtension: () => ({field_id_counter : 0 }),
  writeFieldData(ctx,cmp,value,oneWay) {
    if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == value) return
    jb.db.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx)
    jb.ui.checkValidationError(cmp,value,ctx)
    cmp.hasBEMethod('onValueChange') && cmp.runBEMethod('onValueChange',value,ctx.vars)
    !oneWay && cmp.refresh({},{srcCtx: ctx.cmpCtx},ctx)
  },
  checkValidationError(cmp,val,ctx) {
    const err = validationError()
    if (cmp.state.error != err) {
      jb.log('field validation set error state',{cmp,err})
      cmp.refresh({valid: !err, error:err}, {srcCtx: ctx.cmpCtx},ctx)
    }
  
    function validationError() {
      if (!cmp.validations) return
      const ctx = cmp.ctx.setData(val)
      const err = (cmp.validations || [])
        .filter(validator=>!validator.validCondition(ctx))
        .map(validator=>validator.errorMessage(ctx))[0]
      if (ctx.exp('%$formContainer%'))
        ctx.run(writeValue('%$formContainer/err%',err))
      return err
    }
  },
  checkFormValidation(elem) {
    jb.ui.find(elem,'[jb-ctx]').map(el=>el._component).filter(cmp => cmp && cmp.validations).forEach(cmp => 
      jb.ui.checkValidationError(cmp,jb.val(cmp.ctx.vars.$model.databind(cmp.ctx)), cmp.ctx))
  },
  fieldTitle(cmp,fieldOrCtrl,h) {
    let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
    field = typeof field === 'function' ? field() : field
    if (field.titleCtrl) {
      const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
      const jbComp = field.titleCtrl(ctx);
      return jbComp && h(jbComp,{'cmp-id': jbComp.cmpId })
    }
    return field.title(cmp.ctx)
  }
})

component('field.databind', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    If({
      condition: '%$oneWay%',
      then: calcProp('databind', '%$$model/databind()%', { defaultValue: '' }),
      Else: watchAndCalcModelProp('databind', { allowSelfRefresh: true, defaultValue: '' })
    }),
    calcProp('title'),
    calcProp('fieldId', () => jb.ui.field_id_counter++),
    method('writeFieldValue', (ctx,{cmp},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ctx.data,oneWay)),
    method('onblurHandler', (ctx,{cmp, ev},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onchangeHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onkeyupHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onkeydownHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    feature.byCondition('%$$dialog%', feature.initValue('%$$dialog/hasFields%', true))
  )
})

component('field.onChange', {
  type: 'feature',
  category: 'field:100',
  description: 'on picklist selection, text or boolean value change',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: followUp.onDataChange('%$$model/databind%', { action: call('action') })
})

component('field.databindText', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: field.databind('%$debounceTime%', '%$oneWay%')
})

// jb.component('field.keyboardShortcut', {
//   type: 'feature',
//   category: 'events',
//   description: 'listen to events at the document level even when the component is not active',
//   params: [
//     {id: 'key', as: 'string', description: 'e.g. Alt+C'},
//     {id: 'action', type: 'action', dynamic: true}
//   ],
//   frontEnd.init((ctx,{cmp},{key,action}) => {
//         const elem = cmp.base.querySelector('input') || cmp.base
//         if (elem.tabIndex === undefined) elem.tabIndex = -1
//         jb.utils.subscribe(jb.ui.fromEvent(cmp,'keydown',elem),event=>{
//               const keyStr = key.split('+').slice(1).join('+');
//               const keyCode = keyStr.charCodeAt(0);
//               if (key == 'Delete') keyCode = 46;

//               const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
//               if (helper == 'Ctrl' && !event.ctrlKey) return
//               if (helper == 'Alt' && !event.altKey) return
//               if (event.keyCode == keyCode || (event.key && event.key == keyStr))
//                 action();
//         })
//     }
//   )
// })

// ***** validation

component('validation', {
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,validCondition,errorMessage) => ({validations: {validCondition, errorMessage }})
})

component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true}
  ],
  impl: (ctx,title) => ({
      enrichField: field => field.title = ctx => title(ctx)
  })
})

component('field.titleCtrl', {
  description: 'title as control, buttons are usefull',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'titleCtrl', type: 'control', mandatory: true, dynamic: true} // templateValue: button('%title%', { style: button.href() })
  ],
  impl: (ctx,titleCtrl) => ({
      enrichField: field => field.titleCtrl = ctx => titleCtrl(ctx)
  })
})

component('field.columnWidth', {
  description: 'used in itemlist fields',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'width', as: 'number', mandatory: true}
  ],
  impl: (ctx,width) => ({
      enrichField: field => field.width = width
  })
})
});

jbLoadPackedFile({lineInPackage:9094, jb, noProxies: false, path: '/plugins/ui/common/group.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
using('ui-core')

component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true},
    {id: 'title', as: 'string', dynamic: true, byName: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group-style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp('ctrls', (ctx,{$model}) => $model.controls(ctx).filter(x=>x).flatMap(x=>x.segment ? x : [x]))
})

component('inlineControls', {
  type: 'control',
  description: 'controls without a wrapping group',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true}
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

component('dynamicControls', {
  type: 'control',
  description: 'calculated controls by data items without a wrapping group',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,controlItems,genericControl,itemVariable,indexVariable) => (controlItems() || [])
      .map((controlItem,i) => jb.tosingle(genericControl(
        ctx.setVar(itemVariable,controlItem).setVar(indexVariable,i).setData(controlItem))))
})

component('group.firstSucceeding', {
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: calcProp({
    id: 'ctrls',
    value: (ctx,{$model}) => {
        const runCtx = $model.controls.runCtx.setVars(ctx.vars)
        return [jb.asArray($model.controls.profile).reduce((res,prof,i) => 
          res || runCtx.runInner(prof, {}, `controls~${i}`), null )]
      },
    priority: 5
  })
})

component('controlWithCondition', {
  type: 'control',
  description: 'Used with group.firstSucceeding',
  category: 'group:10',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true, composite: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition(ctx) ? ctrl(ctx) : null
})

component('group.wait', {
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true, description: 'a promise or rx'},
    {id: 'loadingControl', type: 'control', defaultValue: text('loading ...'), dynamic: true},
    {id: 'error', type: 'control', defaultValue: text('error: %$error%'), dynamic: true},
    {id: 'varName', as: 'string', description: 'variable for the promise result'},
    {id: 'passRx', as: 'boolean', description: 'do not wait for reactive data to end, and pass it as is', type: 'boolean'}
  ],
  impl: features(
    calcProp({
      id: 'ctrls',
      value: (ctx,{cmp},{loadingControl,error}) => {
          const ctrl = cmp.state.error ? error() : loadingControl(ctx)
          return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
        },
      priority: (ctx,{},{varName}) => {
        if (jb.path(ctx.vars.$state,'dataArrived')) return 0
        const cmp = ctx.vars.cmp
        // not well behaved - calculating the "waitFor" prop not via calcProp
        const waitFor = cmp.renderProps.waitFor = ctx.cmpCtx.params.for()
        if (!jb.utils.isDelayed(waitFor)) {
          cmp.state.dataArrived = true
          if (varName)
            cmp.calcCtx = cmp.calcCtx.setVar(varName,waitFor)
          return 0
        }
        return 10
      }
    }),
    followUp.action(async (ctx,{cmp,$props},{varName,passRx}) => {
      try {
        if (!cmp.state.dataArrived && !cmp.state.error) {
          const data = await jb.utils.resolveDelayed($props.waitFor, !passRx)
          jb.log('group wait dataArrived', {ctx,data})
          cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.cmpCtx,
            extendCtx: ctx => ctx.setVar(varName,data).setData(data)
          }, ctx)
        }
      } catch(e) {
        jb.logException(e,'group.wait',{ctx,cmp}) 
        cmp.refresh({error: JSON.stringify(e)},{},ctx)
      }
    })
  )
})

component('group.eliminateRecursion', {
  type: 'feature',
  description: 'can be put on a global top group',
  params: [
    {id: 'maxDepth', as: 'number'}
  ],
  impl: (ctx,maxDepth) => {
    const protectedComp = jb.path(ctx.cmpCtx,'cmpCtx.path')
    const timesInStack = jb.utils.callStack(ctx).filter(x=>x && x.indexOf(protectedComp) != -1).length
    if (timesInStack > maxDepth)
      return ctx.run( calcProp({id: 'ctrls', value: () => [], phase: 1, priority: 100 }), 'feature<>')
  }
})

component('controls', {
  type: 'control',
  description: 'list of controls to be put inline, flatten inplace. E.g., set of table fields',
  category: 'group:20',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true}
  ],
  impl: (ctx,controls) => {
    const res = controls(ctx)
    res.segment = true
    return res
  }
})

component('group.htmlTag', {
  type: 'group-style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'section', options: 'div,ul,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label,form'},
    {id: 'groupClass', as: 'string'},
    {id: 'itemClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{htmlTag,groupClass,itemClass,ctrls},h) => h(htmlTag,{ class: groupClass },
        ctrls.map(ctrl=> h(ctrl,{class: itemClass}))),
    features: group.initGroup()
  })
})

component('group.div', {
  type: 'group-style',
  impl: group.htmlTag('div')
})
});

jbLoadPackedFile({lineInPackage:9266, jb, noProxies: false, path: '/plugins/ui/common/html.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'html-style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('html.plain', {
  type: 'html-style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: (html||'').replace(/^(<[a-z0-9]*)/,'$1 jb_external="true"') } ),
    features: [
      watchAndCalcModelProp('html'),
      () => ({ studioFeatures :{$: 'feature<>feature.contentEditable', param: 'html' } })
    ]
  })
})

component('html.inIframe', {
  type: 'html-style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'},
    {id: 'id', as: 'string', defaultValue: 'jbart-iframe'}
  ],
  impl: customStyle({
    template: (cmp,{width,height,id},h) => h('iframe', { id, 
        sandbox: 'allow-same-origin allow-forms allow-scripts',
        frameborder: 0, width, height,
        src: 'javascript: document.write(parent.contentForIframe)'
    }),
    features: [
      frontEnd.var('html', '%$$model/html()%'),
      frontEnd.init(({},{html}) => window.contentForIframe = html)
    ]
  })
})

});

jbLoadPackedFile({lineInPackage:9314, jb, noProxies: false, path: '/plugins/ui/common/itemlist-selection.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('itemlist.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%', dynamic: true},
    {id: 'selectedToDatabind', dynamic: true, defaultValue: '%%'},
    {id: 'databindToSelected', dynamic: true, defaultValue: '%%'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onDoubleClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {id: 'cssForSelected', as: 'string', defaultValue: 'color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg)'}
  ],
  impl: features(
    css(({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')),
    userStateProp({
      id: 'selected',
      value: (ctx,{$props,$state},{databind, autoSelectFirst, databindToSelected}) => {
        const currentVal = $state.selected != null && jb.path(jb.ui.cmps[$state.selected],'ctx.data')
        const databindVal = jb.val(databind()) 
        const val = jb.val( databindVal != null && databindToSelected(ctx.setData(databindVal)) || currentVal || (autoSelectFirst && $props.items[0]))
        return $props.items.findIndex(item => jb.val(item) == val)
      },
      phase: 20
    }),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method('onSelection', runActionOnItem(itemlist.indexToData(), runActions(
      log('itemlist onSelection'),
      If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')),
      call('onSelection')
    ))),
    method('onDoubleClick', runActionOnItem(itemlist.indexToData(), runActions(
      If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')),
      call('onDoubleClick')
    ))),
    followUp.flow(
      source.data('%$$props/selected%'),
      rx.filter(and('%$autoSelectFirst%', not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>jb.ui.removeClass(elem,'selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        jb.ui.addClass(elem,'selected')
        jb.ui.scrollIntoView(elem)
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('dblclick'),
      rx.map(itemlist.indexOfElem('%target%')),
      rx.filter('%%'),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
      source.merge(
        rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.indexOfElem('%target%')), rx.filter('%%')),
        source.subject('%$cmp/selectionEmitter%')
      ),
      rx.distinctUntilChanged(),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
    )
  )
})

component('itemlist.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean', byName: true},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: features(
    htmlAttribute('tabIndex', 0),
    method('onEnter', runActionOnItem(itemlist.indexToData(), call('onEnter'))),
    frontEnd.passSelectionKeySource(),
    frontEnd.prop('onkeydown', rx.pipe(source.merge(source.frontEndEvent('keydown'), source.findSelectionKeySource()))),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.log('test onkeydown keyboardSelection'),
      rx.filter('%keyCode%==13'),
      rx.filter(notNull('%$cmp.state.selected%')),
      sink.BEMethod('onEnter', '%$cmp.state.selected%')
    ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1))),
      rx.log('itemlist frontend nextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.var('autoFocus', '%$autoFocus%'),
    frontEnd.init(
      If(and('%$autoFocus%','%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus'))
    )
  )
})

component('itemlist.indexOfElem', {
  type: 'data',
  hidden: true,
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,el) => {
      const elemOfItem = jb.ui.closest(el,'.jb-item')
      const index = elemOfItem && jb.ui.indexOfElement(elemOfItem)
      jb.log('itemlist selection index of elem', {el,elemOfItem,ctx})
      return index
  }
})

component('itemlist.indexToData', {
  type: 'data',
  hidden: true,
  params: [
    {id: 'index', as: 'number', defaultValue: '%%'}
  ],
  impl: (ctx,index) => jb.val(jb.path(ctx.vars.cmp,'renderProps.items') || [])[index]
})

component('itemlist.findSelectionSource', {
  type: 'data',
  hidden: true,
  impl: ctx => {
    const {cmp,itemlistCntr} = ctx.vars
    const srcCtxId = itemlistCntr && itemlistCntr.selectionKeySourceCmp
    return [jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource), document.querySelector(`[ctxId="${srcCtxId}"]`)]
      .map(el => el && el._component && el._component.selectionKeySource).filter(x=>x)[0]
  }
})

component('itemlist.nextSelected', {
  type: 'data',
  hidden: true,
  params: [
    {id: 'diff', as: 'number'},
    {id: 'elementFilter', dynamic: 'true', defaultValue: true}
  ],
  impl: (ctx,diff,elementFilter) => {
    const {cmp} = ctx.vars
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map((el,i) => [el,i])
      .filter(([el]) => elementFilter(ctx.setData(el))).map(([el,i]) => i)

    const selectedIndex = indeces.indexOf(+cmp.state.selected) + diff
    return indeces[Math.min(indeces.length-1,Math.max(0,selectedIndex))]
  }
})
});

jbLoadPackedFile({lineInPackage:9479, jb, noProxies: false, path: '/plugins/ui/common/itemlist.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('itemlist', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'items', as: 'array', type: 'data', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'layout', type: 'layout'},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

component('itemlist.noContainer', {
  type: 'feature',
  category: 'group:20',
  impl: () => ({ extendCtx: ctx => ctx.setVars({itemlistCntr: null}) })
})

component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('visualSizeLimit', ({},{$model,$state}) => Math.max($model.visualSizeLimit,$state.visualSizeLimit ||0)),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('ctrls', (ctx,{$model,$props}) => {
      const controlsOfItem = (item,index) => $model.controls(ctx.setVars({index: index + (ctx.vars.$baseIndex || 0)}).setVar($model.itemVariable,item).setData(item)).filter(x=>x)
      return $props.items.map((item,i)=> controlsOfItem(item,i+1)).filter(x=>x.length > 0)
    }),
    calcProp({
      id: 'updateItemlistCntr',
      value: If('%$itemlistCntr%', typeAdapter('action<>',writeValue('%$itemlistCntr.items%', '%$$props.items%'))),
      phase: 100
    })
  )
})

component('itemlist.ulLi', {
  type: 'itemlist-style',
  impl: customStyle({
    template: ({},{ctrls},h) => h('ul.jb-itemlist',{},
        ctrls.map((ctrl) => h('li.jb-item', {}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

component('itemlist.horizontal', {
  type: 'itemlist-style',
  moreTypes: 'group-style<>',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls},h) => h('div.jb-itemlist',{},
        ctrls.map((ctrl) => h('div.jb-item', {}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})
});

jbLoadPackedFile({lineInPackage:9550, jb, noProxies: false, path: '/plugins/ui/common/layout-styles.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('layout.vertical', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex; flex-direction: column}
          >* { ${jb.ui.propWithUnits('margin-bottom',spacing)} }
          >*:last-child { margin-bottom:0 }`)
})

component('layout.horizontal', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex}
        >* { ${jb.ui.propWithUnits('margin-right', spacing)} }
        >*:last-child { margin-right:0 }`)
})

component('layout.horizontalFixedSplit', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'leftWidth', as: 'string', defaultValue: '200px', mandatory: true},
    {id: 'rightWidth', as: 'string', defaultValue: '100%', mandatory: true},
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >*:first-child { ${jb.ui.propWithUnits('margin-right',ctx.params.spacing)}
        ${jb.ui.propWithUnits('width',ctx.params.leftWidth)} }
        >*:last-child { margin-right:0; ${jb.ui.propWithUnits('width',ctx.params.rightWidth)} }`,
  })
})

component('layout.horizontalWrapped', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* {${jb.ui.propWithUnits('margin-right',ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

component('layout.flex', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse'},
    {id: 'justifyContent', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around'},
    {id: 'alignItems', as: 'string', options: ',normal,stretch,center,start,end,flex-start,flex-end,baseline,first baseline,last baseline,safe center,unsafe center'},
    {id: 'wrap', as: 'string', options: ',wrap,wrap-reverse,nowrap'},
    {id: 'spacing', as: 'string'}
  ],
  impl: ctx => ({
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), marginSpacing: ctx.params.direction.match(/col/) ? 'bottom' : 'right' , ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
      {?>* { margin-%$marginSpacing%: %$spacingWithUnits% }?}
    ${ctx.params.spacing ? '>*:last-child { margin-%$marginSpacing%:0 }' : ''}`),
  })
})

component('layout.grid', {
  type: 'layout',
  moreTypes: 'feature<>',
  params: [
    {id: 'columnSizes', as: 'array', templateValue: list('auto','auto'), description: 'grid-template-columns, list of lengths'},
    {id: 'rowSizes', as: 'array', description: 'grid-template-rows, list of lengths'},
    {id: 'columnGap', as: 'string', description: 'grid-column-gap'},
    {id: 'rowGap', as: 'string', description: 'grid-row-gap'}
  ],
  impl: ctx => ({
    css: ctx.setVars({...ctx.params,
          colSizes: ctx.params.columnSizes.map(x=>jb.ui.withUnits(x)).join(' ') , rowSizes: ctx.params.rowSizes.map(x=>jb.ui.withUnits(x)).join(' ')
         }).exp(`{ display: grid; {?grid-template-columns:%$colSizes%;?} {?grid-template-rows:%$rowSizes%;?}
            {?grid-column-gap:%$columnGap%;?} {?grid-row-gap:%$rowGap%;?} }`)
  })
})

component('flexItem.grow', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: css('flex-grow: %$factor%')
})

component('flexItem.basis', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: css('flex-basis: %$factor%')
})

component('flexItem.alignSelf', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto'}
  ],
  impl: css('align-self: %$align%')
})


});

jbLoadPackedFile({lineInPackage:9668, jb, noProxies: false, path: '/plugins/ui/common/text.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('text', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', dynamic: true},
    {id: 'style', type: 'text-style', defaultValue: text.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('text.bindText', {
  type: 'feature',
  category: 'text:0',
  impl: features(
    watchAndCalcModelProp('text', ({data}) => jb.ui.toVdomOrStr(data)),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'text' }})
  )
})

component('text.allowAsynchValue', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  params: [
    {id: 'propId', defaultValue: 'text'},
    {id: 'waitingValue', defaultValue: ''}
  ],
  impl: features(
    calcProp('%$propId%', firstSucceeding('%$$state/{%$propId%}%','%$$props/{%$propId%}%')),
    followUp.flow(
      source.any(If('%$$state/{%$propId%}%', '', '%$$props/{%$propId%}%')),
      rx.log('followUp allowAsynchValue'),
      rx.map(({data}) => jb.ui.toVdomOrStr(data)),
      sink.refreshCmp(obj(prop('%$propId%', '%%')))
    )
  )
})

component('text.highlight', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--deep-purple-A700'}
  ],
  impl: (ctx,base,highlightF,cssClass) => {
    const h = highlightF(), b = base();
    if (!h || !b) return b;
    const highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return jb.ui.h('div',{},[  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)])
  }
})

component('text.htmlTag', {
  type: 'text-style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
    {id: 'cssClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{text,htmlTag,cssClass},h) => h(`${htmlTag}.${cssClass}`,{},text),
    features: text.bindText()
  })
})

component('text.span', {
  type: 'text-style',
  impl: customStyle({ template: (cmp,{text},h) => h('span',{},text), features: text.bindText() })
})
});

jbLoadPackedFile({lineInPackage:9747, jb, noProxies: false, path: '/plugins/ui/common/theme.js',fileDsl: '', pluginId: 'ui-common' }, 
            function({jb,require,button,css,editableText,field,validation,group,inlineControls,dynamicControls,controlWithCondition,controls,html,itemlist,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,feature,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,source,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('defaultTheme', {
  impl: ctx => jb.ui.insertOrUpdateStyleElem(ctx,`
    body {
      /* vscode compatible with light theme */
      --jb-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
      --jb-font-size: 16px;
      --jb-font-weight: normal;
      --jb-fg: #616161;
    
      --jb-menu-bg: #ffffff;
      --jb-menu-fg: #616161;
      --jb-menu-selection-bg: #0076b18a;
      --jb-menu-selection-fg: #ffffff;
      --jb-menu-separator-fg: #888888;
      --jb-menubar-selection-bg: rgba(0, 0, 0, 0.1);
      --jb-menubar-selection-fg: #333333;
      --jb-menubar-active-bg: #dddddd;
      --jb-menubar-active-fg: #333333;
      --jb-menubar-inactive-bg: rgba(221, 221, 221, 0.6);
      --jb-dropdown-bg: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-error-fg: #a1260d;
      --jb-success-fg: #4BB543;
      --jb-warning-fg: #ffcc00;
          
      --jb-input-bg: #ffffff;
      --jb-input-fg: #616161;
      --jb-textLink-active-fg: #034775;
      --jb-textLink-fg: #006ab1;

      --jb-on-primary: #ffffff;
      --jb-on-secondary: #616161;
      
      --jb-icon-fg: #424242;
    
      --jb-list-active-selection-bg: #0074e8;
      --jb-list-active-selection-fg: #ffffff;
    
    
    /* mdc mappaing */
      --mdc-theme-primary: #616161; /* The theme primary color*/
      --mdc-theme-secondary: var(--jb-menubar-active-bg);
      --mdc-theme-background: var(--jb-input-bg);
      --mdc-theme-surface: var(--jb-input-bg);
      --mdc-theme-error: var(--jb-error-fg);
    
      --mdc-theme-on-primary: var(--jb-on-primary); /* Primary text on top of a theme primary color background */
      --mdc-theme-on-secondary: var(--jb-on-secondary);
      --mdc-theme-on-surface: var(--jb-input-fg);
      --mdc-theme-on-error: var(--jb-input-bg);
    
      --mdc-theme-text-primary-on-background: var(--jb-input-fg); /* Primary text on top of the theme background color. */
      --mdc-theme-text-secondary-on-background: var(--jb-input-fg);
      --mdc-theme-text-hint-on-background: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-background: var(--jb-input-fg);
      --mdc-theme-text-icon-on-background: var(--jb-input-fg);
      
      --mdc-theme-text-primary-on-light: var(--jb-input-fg); /* Primary text on top of a light-colored background */
      --mdc-theme-text-secondary-on-light: var(--jb-input-fg);
      --mdc-theme-text-hint-on-light: var(--jb-input-fg);
      --mdc-theme-text-disabled-on-light: var(--jb-input-fg);
      --mdc-theme-text-icon-on-light: var(--jb-input-fg);
                                
      --mdc-theme-text-primary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-secondary-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-hint-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-disabled-on-dark: var(--jb-menu-selection-fg);
      --mdc-theme-text-icon-on-dark: var(--jb-menu-selection-fg);

    /* jBart only */
      --jb-dropdown-shadow: #a8a8a8;
      --jb-tree-value: red;
      --jb-expandbox-bg: green;
 `,'__defaultTheme')
})

component('group.theme', {
  type: 'feature',
  params: [
    {id: 'theme', type: 'theme'}
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => ctx.setVars(theme)
  })
})

component('theme.materialDesign', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdc-input'
  })
})

});

jbLoadPackedFile({lineInPackage:9844, jb, noProxies: false, path: '/plugins/ui/misc/editable-boolean.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('editableBoolean', {
  type: 'control',
  category: 'input:20',
  params: [
    {id: 'databind', as: 'ref', type: 'boolean', mandaroy: true, dynamic: true},
    {id: 'style', type: 'editable-boolean-style', defaultValue: editableBoolean.checkbox(), dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true},
    {id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('editableBoolean.initToggle', {
  type: 'feature',
  category: 'editableBoolean:0',
  impl: features(
    calcProp('toggleText', If('%$$model/databind()%', '%$$model/textForTrue()%', '%$$model/textForFalse()%')),
    watchRef('%$$model/databind()%', { allowSelfRefresh: true, strongRefresh: true }),
    method('toggle', runActions(
      writeValue('%$$model/databind()%', typeAdapter('boolean<>',not('%$$model/databind()%'))),
      refreshIfNotWatchable('%$$model/databind()%')
    )),
    method('toggleByKey', (ctx,{cmp, ev}) => 
      ev.keyCode != 27 && cmp.runBEMethod('toggle'))
  )
})

component('editableBoolean.checkbox', {
  type: 'editable-boolean-style',
  impl: customStyle({
    template: ({},{databind},h) => h('input', { type: 'checkbox', ...(databind && {checked: ''}) , 
      onclick: 'toggle', onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: [editableBoolean.initToggle(), field.databind()]
  })
})
});

jbLoadPackedFile({lineInPackage:9885, jb, noProxies: false, path: '/plugins/ui/misc/dialog.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('openDialog', {
  type: 'action<>',
  hasSideEffect: true,
  params: [
    {id: 'title', type: 'data', moreTypes: 'control<>', as: 'renderable', dynamic: true },
    {id: 'content', type: 'control', dynamic: true, templateValue: {$: 'group' }, defaultValue: { $ : 'text' } },
    {id: 'style', type: 'dialog-style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'doOpen', type: 'action', dynamic: true, defaultValue: runActions(dialog.createDialogTopIfNeeded(), action.subjectNext(dialogs.changeEmitter(), obj(prop('open', true), prop('dialog', '%$$dialog%'))))}
  ],
  impl: ctx => {
	const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
	const ctxWithDialog = ctx.setVars({
		$dialog,
		dialogData: {},
		formContainer: { err: ''},
	})
	$dialog.ctx = ctxWithDialog
	ctx.params.doOpen(ctxWithDialog)
  }
})

component('openDialog.probe', {
	autoGen: true,
	type: 'action<>',
  hidden: true,
	params: jb.utils.getUnresolvedProfile('openDialog','action<>').params,
	impl: ctx => jb.ui.ctrl(ctx.setVar('$dialog',{}), {$: 'feature<>dialog.init'}).renderVdom(),
})

component('dialog.init', {
  type: 'feature',
  impl: features(
    calcProp('dummy', ctx => jb.log('dialog init uiComp', {dialog: ctx.vars.$dialog, cmp: ctx.vars.cmp,ctx})),
    calcProp('title', '%$$model/title()%'),
    calcProp('contentComp', '%$$model/content%'),
    calcProp('hasMenu', '%$$model/menu/profile%'),
    calcProp('menuComp', '%$$model/menu%'),
    feature.initValue('%$$dialog/cmpId%', '%$cmp/cmpId%', { alsoWhenNotEmpty: true }),
    htmlAttribute('id', '%$$dialog/id%'),
    method('dialogCloseOK', dialog.closeDialog(true)),
    method('dialogClose', dialog.closeDialog(false)),
    css('z-index: 100')
  )
})

component('dialog.buildComp', {
  type: 'data<>',
  params: [
    {id: 'dialog', defaultValue: '%$$dialog%'}
  ],
  impl: (ctx,dlg) => jb.ui.ctrl(dlg.ctx, {$: 'feature<>dialog.init'}),
})

component('inPlaceDialog', {
  type: 'control<>',
  params: [
    {id: 'title', type: 'data', moreTypes: 'control<>', as: 'renderable', dynamic: true },
    {id: 'content', type: 'control', dynamic: true, templateValue: {$: 'group' }, defaultValue: { $ : 'text' } },
    {id: 'style', type: 'dialog-style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
  ],
  impl: ctx => {
	  const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
    const ctxWithDialog = ctx.setVars({
      $dialog,
      dialogData: {},
      formContainer: { err: ''},
    })
    $dialog.ctx = ctxWithDialog
    return jb.ui.ctrl(ctxWithDialog, {$: 'feature<>dialog.init'})
  }
})


component('dialog.createDialogTopIfNeeded', {
  type: 'action',
  impl: ctx => {
		const widgetBody = jb.ui.widgetBody(ctx)
		const {headlessWidget, headlessWidgetId, useFrontEndInTest} = ctx.vars
		if (!widgetBody || widgetBody.querySelector(':scope>.jb-dialogs')) return
		const vdom = ctx.run({$: 'control<>dialog.dialogTop'}).renderVdomAndFollowUp()
		if ((headlessWidget || useFrontEndInTest )&& widgetBody instanceof jb.ui.VNode) {
			jb.log('dialog headless createTop',{vdom,widgetBody})
			widgetBody.children.push(vdom)
			vdom.parentNode = widgetBody
			const delta = { children: { toAppend: [jb.ui.stripVdom(vdom)] }}
			jb.ui.sendRenderingUpdate(ctx,{delta ,widgetId: headlessWidgetId})
		} else {
			jb.ui.render(vdom,widgetBody)
			jb.log('dialog dom createTop',{vdom,widgetBody})
		}
	},
})

component('dialog.closeDialog', {
  type: 'action',
  description: 'close parent dialog',
  params: [
    {id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: If('%$$dialog%', runActions(
    If(and('%$OK%','%$$dialog.hasFields%'), (ctx,{$dialog}) => 
			jb.ui.checkFormValidation && jb.ui.checkFormValidation(jb.ui.elemOfCmp(ctx, $dialog.cmpId))),
    If(and('%$OK%', not('%$formContainer.err%')), (ctx,{$dialog}) => {
			jb.log('dialog onOK',{$dialog,ctx})
			$dialog.ctx.params.onOK(ctx)
		}),
    If({
      condition: or(not('%$OK%'), not('%$formContainer.err%')),
      then: action.subjectNext(dialogs.changeEmitter(), obj(prop('close', true), prop('dialogId', '%$$dialog/id%')))
    })
  ))
})

component('dialog.closeDialogById', {
  type: 'action',
  description: 'close dialog fast without checking validations and running onOK',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: action.subjectNext(dialogs.changeEmitter(), obj(prop('close', true), prop('dialogId', '%$id%')))
})
  
component('dialog.closeAll', {
  type: 'action',
  impl: runActionOnItems(dialog.shownDialogs(), dialog.closeDialogById('%%'))
})

component('dialog.closeAllPopups', {
  type: 'action',
  impl: runActionOnItems(dialogs.shownPopups(), dialog.closeDialogById('%%'))
})

component('dialog.shownDialogs', {
  impl: ctx =>jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog').map(el=> el.getAttribute('id'))
})

component('dialog.isOpen', {
  type: 'boolean',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: typeAdapter('data<>', dialogs.cmpIdOfDialog('%$id%'))
})

component('dialogs.cmpIdOfDialog', {
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: (ctx,id) => jb.ui.find(jb.ui.widgetBody(ctx),`[id="${id}"]`).map(el=> el.getAttribute('cmp-id'))[0]
})

component('dialogs.shownPopups', {
  impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-popup').map(el=>el.getAttribute('id'))
})

component('dialogFeature.modal', {
  description: 'blocks all other screen elements',
  type: 'dialog-feature',
  impl: features(
    frontEnd.init(() =>	jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>')),
    frontEnd.onDestroy(() => Array.from(document.body.querySelectorAll('>.modal-overlay'))
			.forEach(el=>document.body.removeChild(el)))
  )
})

component('dialogFeature.uniqueDialog', {
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: If('%$id%', features(
    feature.initValue('%$$dialog/id%', '%$id%', { alsoWhenNotEmpty: true }),
    followUp.flow(
      source.data(ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog')),
      rx.filter(({data},{cmp},{id}) => data.getAttribute('id') == id && data.getAttribute('cmp-id') != cmp.cmpId),
      rx.map(({data}) => data.getAttribute('cmp-id')),
      rx.map(obj(prop('closeByCmpId', true), prop('cmpId', '%%'), prop('dialogId', '%$id%'))),
      rx.log('dialog close uniqueDialog'),
      sink.subjectNext(dialogs.changeEmitter())
    )
  ))
})

component('source.eventIncludingPreview', {
  type: 'rx',
  params: [
    {id: 'event', as: 'string'}
  ],
  impl: source.merge(
    source.event('%$event%', () => jb.frame.document),
    source.event('%$event%', () => jb.path(jb.studio, 'previewWindow.document'))
  )
})

component('dialogFeature.dragTitle', {
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'},
    {id: 'useSessionStorage', as: 'boolean', type: 'boolean'},
    {id: 'selector', as: 'string', defaultValue: '.dialog-title'}
  ],
  impl: features(
    calcProp('sessionStorageId', 'dialogPos-%$id%'),
    calcProp('posFromSessionStorage', If('%$useSessionStorage%', getSessionStorage('%$$props/sessionStorageId%'))),
    css('%$selector% { cursor: pointer; user-select: none }'),
    frontEnd.method('setPos', ({data},{el}) => { 
      el.style.top = data.top + 'px'
			el.style.left = data.left +'px' 
		}),
    frontEnd.var('selector', '%$selector%'),
    frontEnd.var('useSessionStorage', '%$useSessionStorage%'),
        frontEnd.var('sessionStorageId', '%$$props/sessionStorageId%'),
    frontEnd.var('posFromSessionStorage', '%$$props/posFromSessionStorage%'),
    frontEnd.init(({},{el,posFromSessionStorage}) => {
			if (posFromSessionStorage) {
				el.style.top = posFromSessionStorage.top + 'px'
				el.style.left = posFromSessionStorage.left +'px'
			}
		}),
    frontEnd.prop('titleElem', ({},{el,selector}) => el.querySelector(selector)),
        frontEnd.flow(
      source.event('mousedown', '%$cmp/titleElem%'),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.var('offset', ({data},{el}) => ({
          left: data.clientX - el.getBoundingClientRect().left,
          top:  data.clientY - el.getBoundingClientRect().top
			})),
      rx.flatMap(
        rx.pipe(
        source.eventIncludingPreview('mousemove'),
        rx.takeWhile('%buttons%!=0'),
        rx.var('ev'),
                rx.map(({data},{offset}) => ({
            left: Math.max(0, data.clientX - offset.left),
            top: Math.max(0, data.clientY - offset.top),
  				}))
      )
      ),
      sink.action(
        runActions(
        action.runFEMethod('setPos'),
        If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%', '%%'))
      )
      )
    )
  )
})

component('dialog.default', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{title,contentComp},h) => h('div.jb-dialog jb-default-dialog',{},[
			  h('div.dialog-title',{},title),
			  h('button.dialog-close', {onclick: 'dialogClose' },'×'),
			  h(contentComp),
		  ]),
    features: dialogFeature.dragTitle()
  })
})

component('dialogFeature.nearLauncherPosition', {
  type: 'dialog-feature',
  params: [
    {id: 'offsetLeft', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'offsetTop', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'rightSide', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    calcProp('launcherRectangle', '%$ev/elem/clientRect%'),
    frontEnd.var('launcherRectangle', '%$$props/launcherRectangle%'),
    frontEnd.var('launcherCmpId', '%$$dialog/launcherCmpId%'),
    frontEnd.var('pos', ({},{},{offsetLeft,offsetTop,rightSide}) => ({offsetLeft: offsetLeft() || 0, offsetTop: offsetTop() || 0,rightSide})),
    userStateProp('dialogPos', ({},{ev,$props},{offsetLeft,offsetTop,rightSide}) => {
		if (!ev) return { left: 0, top: 0}
		const _offsetLeft = offsetLeft() || 0, _offsetTop = offsetTop() || 0
		if (!$props.launcherRectangle)
			return { left: _offsetLeft + ev.clientX || 0, top: _offsetTop + ev.clientY || 0}
		return {
			left: $props.launcherRectangle.x + _offsetLeft  + (rightSide ? ev.elem.outerWidth : 0), 
			top:  $props.launcherRectangle.y  + _offsetTop   + ev.elem.outerHeight
		}
	  }),
    frontEnd.onRefresh(({},{$state,el}) => { 
		const {top,left} = $state.dialogPos || { top: 0, left: 0}
		jb.ui.setStyle(el,'top',`${top}px`)
		jb.ui.setStyle(el,'left',`${left}px`)
	  }),
    frontEnd.init((ctx,{cmp,pos,launcherCmpId,elemToTest}) => { // handle launcherCmpId
		  if (!elemToTest && launcherCmpId && cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) {
			  const el = jb.ui.elemOfCmp(ctx,launcherCmpId)
			  if (!el) return
			  const launcherRectangle = el.getBoundingClientRect()
			  const dialogPos = {
				left: launcherRectangle.x + pos.offsetLeft + (pos.rightSide ? jb.ui.outerWidth(el) : 0), 
				top:  launcherRectangle.y  + pos.offsetTop  + jb.ui.outerHeight(el)
			  }
			  if (dialogPos.left != 0 || dialogPos.top != 0)
			  	cmp.refreshFE({ dialogPos })
		  }
	  }),
    frontEnd.init(({},{cmp,elemToTest}) => { // fixDialogPositionAtScreenEdges
		if (elemToTest || cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) return
		const dialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0]
		const dialogPos = cmp.state.dialogPos
		let top,left
		const padding = 2, dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
		if (dialogPos.top > dialog_height && dialogPos.top + dialog_height + padding > window.innerHeight + window.pageYOffset)
			top = dialogPos.top - dialog_height
		if (dialogPos.left > dialog_width && dialogPos.left + dialog_width + padding > window.innerWidth + window.pageXOffset)
			left = dialogPos.left - dialog_width
		if (left || top)
			cmp.refreshFE({ dialogPos: { top: top || dialogPos.top , left: left || dialogPos.left} })
	  })
  )
})

component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: onDestroy(call('action'))
})

component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  impl: features(
    feature.initValue('%$$dialog.isPopup%', true),
    frontEnd.flow(
      source.data(0),
      rx.delay(100),
      rx.flatMap(source.eventIncludingPreview('mousedown')),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.filter(({data}) => jb.ui.closest(data.target,'.jb-dialog') == null),
      rx.var('dialogId', ({},{cmp}) => cmp.base.getAttribute('id')),
      sink.action(dialog.closeDialogById('%$dialogId%'))
    )
  )
})

component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    frontEnd.var('selectText', '%$selectText%'),
    frontEnd.init((ctx,{el,selectText}) => {
	    const elem = jb.ui.find(el,'input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
		if (elem)
			jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
		if (selectText)
			elem.select()
	  })
  )
})

component('popup.regainCanvasFocus', {
  type: 'action',
  impl: action.focusOnCmp('regain focus', '%$popupLauncherCanvas/cmpId%')
})

component('dialogFeature.cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  description: 'launching element toggles class "dialog-open" if the dialog is open',
  impl: features(
    frontEnd.prop('launchingElement', (ctx,{cmp}) => cmp.launchingCmp && jb.ui.elemOfCmp(ctx,cmp.launchingCmp)),
    frontEnd.init(({},{cmp}) => cmp.launchingElement && jb.ui.addClass(cmp.launchingElement,'dialog-open')),
    frontEnd.onDestroy(({},{cmp}) => cmp.launchingElement && jb.ui.removeClass(cmp.launchingElement,'dialog-open'))
  )
})

component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number', defaultValue: 100}
  ],
  impl: features(
    frontEnd.var('minZIndex', '%$minZIndex%'),
    frontEnd.method('setAsMaxZIndex', (ctx,{el,minZIndex}) => {
			const dialogs = jb.frame.document && Array.from(document.querySelectorAll('.jb-dialog')) || jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog')
			const calcMaxIndex = dialogs.filter(dl=>!jb.ui.hasClass(dl, 'jb-popup')).reduce((max, _el) => 
				Math.max(max,(_el && parseInt(jb.ui.getStyle(_el,'zIndex') || 100)+1) || 100), minZIndex || 100)
			jb.ui.setStyle(el,'zIndex',calcMaxIndex)
	  }),
    frontEnd.init(({},{cmp}) => { cmp.state.frontEndStatus = 'ready'; cmp.runFEMethod('setAsMaxZIndex') }),
    frontEnd.flow(source.frontEndEvent('mousedown'), sink.FEMethod('setAsMaxZIndex'))
  )
})

component('dialog.dialogOkCancel', {
  type: 'dialog-style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div.jb-dialog jb-default-dialog',{},[
			h('div.dialog-title',{},title),
			h('button.dialog-close', { onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div.dialog-buttons',{},[
				h('button.mdc-button', {class: 'dialog-cancel', onclick: 'dialogClose' }, [h('div.mdc-button__ripple'), h('span.mdc-button__label',{},cancelLabel)]),
				h('button.mdc-button', {class: 'dialog-ok', onclick: 'dialogCloseOK' },[h('div.mdc-button__ripple'), h('span.mdc-button__label',{},okLabel)]),
			]),
		]),
    css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }',
    features: dialogFeature.maxZIndexOnClick()
  })
})

component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'autoResizeInnerElement', as: 'boolean', description: 'effective element with "autoResizeInDialog" class', type: 'boolean'}
  ],
  impl: features(
    templateModifier(({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
    css('>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }'),
    frontEnd.var('autoResizeInnerElement', '%$autoResizeInnerElement%'),
    frontEnd.method('setSize', ({data},{cmp,el,autoResizeInnerElement}) => { 
		el.style.height = data.top + 'px'
		el.style.width = data.left + 'px'
		const innerElemToResize = el.querySelector('.autoResizeInDialog')
		if (!autoResizeInnerElement || !innerElemToResize) return
		cmp.innerElemOffset = cmp.innerElemOffset || innerElemToResize.getBoundingClientRect().top - el.getBoundingClientRect().top
				  + (el.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)
		innerElemToResize.style.height = (data.top - cmp.innerElemOffset) + 'px'
	  }),
    frontEnd.prop('resizerElem', ({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
    frontEnd.flow(
      source.event('mousedown', '%$cmp.resizerElem%'),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.var('offset', ({},{el}) => ({
			left: el.getBoundingClientRect().left,
			top:  el.getBoundingClientRect().top
		})),
      rx.flatMap(
        rx.pipe(
          source.eventIncludingPreview('mousemove'),
          rx.takeWhile('%buttons%!=0'),
          rx.map(({data},{offset}) => ({
				left: Math.max(0, data.clientX - offset.left),
				top: Math.max(0, data.clientY - offset.top),
			}))
        )
      ),
      sink.FEMethod('setSize')
    )
  )
})

component('dialog.popup', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; background: var(--jb-dropdown-bg); box-shadow: 2px 2px 3px var(--jb-dropdown-shadow); padding: 3px 0; border: 1px solid var(--jb-dropdown-border) }',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside(), dialogFeature.cssClassOnLaunchingElement(), dialogFeature.nearLauncherPosition()]
  })
})

component('dialog.transparentPopup', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; padding: 3px 0; }',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside(), dialogFeature.cssClassOnLaunchingElement(), dialogFeature.nearLauncherPosition()]
  })
})
  
component('dialog.div', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute }'
  })
})

component('dialogs.changeEmitter', {
  params: [
    {id: 'widgetId', defaultValue: '%$headlessWidgetId%'}
  ],
  category: 'source',
  impl: (ctx,_widgetId) => {
		const widgetId = !ctx.vars.previewOverlay && _widgetId || 'default'
		jb.ui.dlgEmitters = jb.ui.dlgEmitters || {}
    const existing = jb.ui.dlgEmitters[widgetId]
    if (existing) return existing
    jb.log(`creating dialog subject emitter for widgetId ${widgetId}`, {existing: jb.ui.dlgEmitters[widgetId], ctx})
		jb.ui.dlgEmitters[widgetId] = ctx.run({$: 'data<>rx.subject', id: `dialog emitter ${widgetId}`, replay: true})
		return jb.ui.dlgEmitters[widgetId]
	}
})

component('dialog.dialogTop', {
  type: 'control',
  params: [
    {id: 'style', type: 'dialogs-style', defaultValue: dialogs.defaultStyle(), dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('dialogs.defaultStyle', {
  type: 'dialogs-style',
  impl: customStyle({
    template: ({},{},h) => h('div.jb-dialogs'),
    features: [
      followUp.flow(
        source.subject(dialogs.changeEmitter()),
        rx.filter('%open%'),
        rx.var('dialogVdom', pipeline(dialog.buildComp('%dialog%'), '%renderVdomAndFollowUp()%')),
        rx.var('delta', obj(prop('children', obj(prop('toAppend', pipeline('%$dialogVdom%', ({data}) => jb.ui.stripVdom(data))))))),
        rx.log('open dialog', obj(prop('dialogId', '%dialog/id%'))),
        sink.applyDeltaToCmp('%$delta%', '%$followUpCmp/cmpId%')
      ),
      followUp.flow(
        source.subject(dialogs.changeEmitter()),
        rx.filter('%close%'),
        rx.log('close dialog', obj(prop('dialogId', '%dialogId%'))),
        rx.var('dlgCmpId', dialogs.cmpIdOfDialog('%dialogId%')),
        rx.filter('%$dlgCmpId%'),
        rx.var('delta', obj(prop('children', obj(prop('deleteCmp', '%$dlgCmpId%'))))),
        rx.log('close dialog', obj(prop('dialogId', '%dialogId%'))),
        sink.applyDeltaToCmp('%$delta%', '%$followUpCmp/cmpId%')
      ),
      followUp.flow(
        source.subject(dialogs.changeEmitter()),
        rx.filter('%closeByCmpId%'),
        rx.var('delta', obj(prop('children', obj(prop('deleteCmp', '%cmpId%'))))),
        rx.log('close dialog', obj(prop('dialogId', '%dialogId%'))),
        sink.applyDeltaToCmp('%$delta%', '%$followUpCmp/cmpId%')
      )
    ]
  })
})

component('popupLocation', {
  type: 'dialog-feature<>',
  impl: templateModifier(({},{vdom}) => { 
    const id = (vdom.getAttribute('id')||'').replace(/\s/g,'_')
    if (id && !jb.utils.sessionStorage(id))
      vdom.addClass(`default-location ${id}`)
  })
})

extension('ui','dialog' , {
	destroyAllDialogEmitters: () => {
		Object.keys(jb.ui.dlgEmitters||{}).forEach(k=>{
			jb.ui.dlgEmitters[k].trigger.complete()
			delete jb.ui.dlgEmitters[k]
		})
	}
})
});

jbLoadPackedFile({lineInPackage:10450, jb, noProxies: false, path: '/plugins/ui/misc/editable-number.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('editableNumber', {
  type: 'control',
  category: 'input:30',
  params: [
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'editable-number-style', dynamic: true, defaultValue: editableNumber.input() },
    {id: 'symbol', as: 'string', description: 'leave empty to parse symbol from value'},
    {id: 'min', as: 'number', defaultValue: 0},
    {id: 'max', as: 'number', defaultValue: 10},
    {id: 'displayString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'dataString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'autoScale', as: 'boolean', defaultValue: true, description: 'adjust its scale if at edges', type: 'boolean'},
    {id: 'step', as: 'number', defaultValue: 1, description: 'used by slider'},
    {id: 'initialPixelsPerUnit', as: 'number', description: 'used by slider'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
      class editableNumber {
        constructor(params) {
          Object.assign(this,params);
          if (this.min == null) this.min = NaN;
          if (this.max == null) this.max = NaN;
        }
        numericPart(dataString) {
          if (typeof dataString == 'number') return dataString
          if (dataString == '') return NaN;
          var parts = (''+dataString).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/); // prefix-number-suffix
          if (parts)
            this.symbol = parts[1] || parts[3]
          return +(parts && parts[2])
        }

        calcDisplayString(number,ctx) {
          if (isNaN(number)) return this.placeholder || '';
          return this.displayString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }

        calcDataString(number,ctx) {
          if (isNaN(number)) return '';
          return this.dataString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }
        keepInDomain(val) {
          return Math.min(this.max, Math.max(this.min,val))
        }
      }
      return jb.ui.ctrl(ctx.setVars({ editableNumber: new editableNumber(ctx.params) }))
  }
})

component('editableNumber.input', {
  type: 'editable-number-style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

});

jbLoadPackedFile({lineInPackage:10512, jb, noProxies: false, path: '/plugins/ui/misc/editable-text-helper-popup.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('editableText.picklistHelper', {
  type: 'feature',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true},
    {id: 'picklistStyle', type: 'picklist-style', dynamic: true, defaultValue: picklist.labelList()},
    {id: 'picklistFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'popupFeatures', type: 'dialog-feature[]', flattenArray: true, dynamic: true},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true, defaultValue: writeValue('%$$model/databind%', '%$selectedOption%')},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper'}
  ],
  impl: features(
    watchable('selectedOption'),
    watchable('watchableInput', obj(prop('value', ''))),
    variable('helperCmp', '%$cmp%'),
    method('openPopup', openDialog({
      content: picklist({
        databind: '%$selectedOption%',
        options: (ctx,{watchableInput},{options}) => options(ctx.setData(jb.val(watchableInput))),
        style: call('picklistStyle'),
        features: [
          watchRef('%$watchableInput%'),
          '%$picklistFeatures()%'
        ]
      }),
      style: dialog.popup(),
      features: [
        dialogFeature.maxZIndexOnClick(),
        dialogFeature.uniqueDialog('%$popupId%'),
        '%$popupFeatures()%'
      ]
    })),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', runActions(
      writeValue('%$watchableInput%', '%%'),
      If({
        condition: call('showHelper'),
        then: If(not(dialog.isOpen('%$popupId%')), action.runBEMethod('openPopup')),
        Else: action.runBEMethod('closePopup')
      })
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', If(dialog.isOpen('%$popupId%'), runActions(call('onEnter'), dialog.closeDialogById('%$popupId%')))),
    method('onEsc', If(dialog.isOpen('%$popupId%'), runActions(call('onEsc'), dialog.closeDialogById('%$popupId%')))),
    feature.serviceRegistey(),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow(
      '%$cmp/keyUp%',
      rx.log('editableTextHelper keyup'),
      rx.filter('%keyCode% == 13'),
      editableText.addUserEvent(),
      sink.BEMethod('onEnter')
    ),
    frontEnd.flow(
      '%$cmp/keyUp%',
      rx.filter(not(inGroup(list(13,27,38,40), '%keyCode%'))),
      editableText.addUserEvent(),
      sink.BEMethod('refresh')
    ),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),
    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(If('%$autoOpen%', runActions(
      writeValue('%$watchableInput%', obj(prop('value', '%$helperCmp/renderProps/databind%'))),
      action.runBEMethod('openPopup')
    )))
  )
})

component('editableText.setInputState', {
  type: 'action',
  params: [
    {id: 'newVal', as: 'string'},
    {id: 'assumedVal', description: 'contains value and selectionStart, the action is not performed if the not in this state'},
    {id: 'selectionStart', as: 'number'},
    {id: 'cmp', defaultValue: '%$cmp%'}
  ],
  impl: action.applyDeltaToCmp({
    delta: (ctx,{cmp},{newVal,selectionStart,assumedVal}) => {
    jb.log('dom set input create userRequest',{cmp,newVal,ctx})
    return {attributes: { $__input: JSON.stringify({ assumedVal: assumedVal, newVal,selectionStart })}}
  },
    cmpId: '%$cmp/cmpId%'
  })
})

component('editableText.addUserEvent', {
  type: 'rx',
  impl: rx.innerPipe(rx.userEventVar(), rx.map('%$ev/input%'))
})

component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog-style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper'}
  ],
  impl: features(
    method('openPopup', openDialog({
      content: call('control'),
      style: call('popupStyle'),
      features: [
        dialogFeature.maxZIndexOnClick(),
        dialogFeature.uniqueDialog('%$popupId%'),
        group.data(firstSucceeding('%$ev/input%', obj(prop('value', '%$helperCmp/renderProps/databind%'))))
      ]
    })),
    variable('helperCmp', '%$cmp%'),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', runActions(
      If({
        condition: call('showHelper'),
        then: If(not(dialog.isOpen('%$popupId%')), action.runBEMethod('openPopup')),
        Else: action.runBEMethod('closePopup')
      })
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', If(dialog.isOpen('%$popupId%'), runActions(call('onEnter'), dialog.closeDialogById('%$popupId%')))),
    method('onEsc', If(dialog.isOpen('%$popupId%'), runActions(call('onEsc'), dialog.closeDialogById('%$popupId%')))),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow(
      '%$cmp/keyUp%',
      rx.log('editableTextHelper keyup'),
      rx.filter('%keyCode% == 13'),
      editableText.addUserEvent(),
      sink.BEMethod('onEnter')
    ),
    frontEnd.flow(
      '%$cmp/keyUp%',
      rx.filter(not(inGroup(list(13,27,38,40), '%keyCode%'))),
      editableText.addUserEvent(),
      sink.BEMethod('refresh')
    ),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),
    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(If('%$autoOpen%', action.runBEMethod('openPopup')))
  )
})
});

jbLoadPackedFile({lineInPackage:10669, jb, noProxies: false, path: '/plugins/ui/misc/divider.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('divider', {
  type: 'control',
  params: [
    {id: 'style', type: 'divider-style', defaultValue: divider.br(), dynamic: true},
    {id: 'title', as: 'string', defaultValue: 'divider'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('divider.br', {
  type: 'divider-style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: '{ border-top-color: var(--jb-menu-separator-fg); display: block; border-top-width: 1px; border-top-style: solid;margin-top: 10px; margin-bottom: 10px;} '
  })
})

component('divider.vertical', {
  type: 'divider-style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: '{ border-left-color: var(--jb-menu-separator-fg); display: block; border-left-width: 1px; border-left-style: solid;margin-left: 10px; margin: 5px 5px;} '
  })
})

component('divider.flexAutoGrow', {
  type: 'divider-style',
  impl: customStyle({ template: (cmp,state,h) => h('div'), css: '{ flex-grow: 10 }' })
})

});

jbLoadPackedFile({lineInPackage:10704, jb, noProxies: false, path: '/plugins/ui/misc/icon.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('control.icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'size', as: 'number', defaultValue: 24},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('icon.init', {
  type: 'feature',
  category: 'icon:0',
  impl: features(calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'))
})

component('icon', {
  type: 'icon',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.materialNoClick()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ctx.params
})

component('icon.material', {
  type: 'icon-style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), onclick: true, style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(), onclick: true,
        $html: `<svg width="24" height="24" jb_external="true" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.ui,['MDIcons',icon])}"/></svg>`}),
    features: icon.init()
  })
})

component('icon.materialNoClick', {
  type: 'icon-style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(),
        $html: `<svg width="24" height="24" jb_external="true" fill="currentColor" transform="scale(${size/24})"><path d="${jb.path(jb.ui,['MDIcons',icon])}"/></svg>`}),
    features: icon.init()
  })
})

component('feature.icon', {
  type: 'feature',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'position', as: 'string', options: ',pre,post,raised', defaultValue: ''},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc'},
    {id: 'size', as: 'number', defaultValue: 24},
    {id: 'style', type: 'icon-style', dynamic: true, defaultValue: icon.materialNoClick()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ({ 
    icon: jb.ui.ctrl(ctx, typeAdapter('feature<>', 
        features(calcProp('icon'), calcProp('type'),calcProp('title'), calcProp('size'), calcProp('iconPosition','%$$model/position%')
      )))
    })
})


});

jbLoadPackedFile({lineInPackage:10785, jb, noProxies: false, path: '/plugins/ui/misc/image.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('image', {
  type: 'control',
  moreTypes: 'image<>',
  category: 'control:50,common:70',
  params: [
    {id: 'url', as: 'string', mandatory: true, templateValue: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png'},
    {id: 'width', as: 'string', mandatory: true, templateValue: '100', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', mandatory: true, description: 'e.g: 100, 20%'},
    {id: 'resize', type: 'image.resize', description: 'background-size, resize the image', defaultValue: image.fullyVisible()},
    {id: 'position', type: 'image.position', description: 'move/shift image'},
    {id: 'style', type: 'image-style', dynamic: true, defaultValue: image.background()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, {
    studioFeatures :{$: 'feature<>feature.contentEditable' },
  })
})

component('image.widthHeight', {
  type: 'image.resize',
  description: 'fixed size or precentage of the original',
  params: [
    {id: 'width', as: 'string', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', description: 'e.g: 100, 20%'}
  ],
  impl: (ctx,width,height) => [ jb.ui.withUnits(width) ||'auto',jb.ui.withUnits(height)||'auto'].join(' ')
})

component('image.cover', {
  description: 'auto resize or crop to cover all area',
  type: 'image.resize',
  impl: 'cover'
})

component('image.fullyVisible', {
  description: 'contain, auto resize to ensure the image is fully visible',
  type: 'image.resize',
  impl: 'contain'
})

component('image.position', {
  description: 'offset move shift original image',
  type: 'image.position',
  params: [
    {id: 'x', as: 'string', description: 'e.g. 7, 50%, right'},
    {id: 'y', as: 'string', description: 'e.g. 10, 50%, bottom'}
  ],
  impl: (ctx,x,y) => [x && `x: ${jb.ui.withUnits(x)}`,y && `y: ${jb.ui.withUnits(y)}`]
    .filter(x=>x).map(x=>`background-position-${x}`).join(';')
})

component('image.background', {
  type: 'image-style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: pipeline(
      Var('url', (ctx,{$model}) => $model.url.replace(/__WIDTH__/,$model.width).replace(/__HEIGHT__/,$model.height)),
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      {
          background-image: url('%$url%');
          {? background-size: %$$model/resize%; ?}
          {? %$$model/position%; ?}
          background-repeat: no-repeat;
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    )
  })
})

component('image.img', {
  type: 'image-style',
  impl: customStyle({
    template: ({},{url},h) => h('img', { src: url}),
    css: pipeline(
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      { 
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    ),
    features: calcProp('url')
  })
})
});

jbLoadPackedFile({lineInPackage:10877, jb, noProxies: false, path: '/plugins/ui/misc/itemlist-dd.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
// var { move } = jb.macro

component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.requireExternalLibrary('dragula.js','css/dragula.css'),
    method('moveItem', runActions(move(itemlist.indexToData('%from%'), itemlist.indexToData('%to%')), action.refreshCmp())),
    frontEnd.prop('drake', ({},{cmp,uiTest}) => {
        if (uiTest) return { on: () => {}}
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-items-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(
      source.dragulaEvent('drag', { argNames: list('el') }),
      rx.map(itemlist.indexOfElem('%el%')),
      rx.do(({},{cmp}) => 
        Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(el=>el.setAttribute('jb-original-index',jb.ui.indexOfElement(el)))),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(
      source.dragulaEvent('drop', { argNames: list('dropElm','target','source','sibling') }),
      rx.map(
        obj(
          prop('from', itemlist.indexOfElem('%dropElm%')),
          prop('to', itemlist.orignialIndexFromSibling('%sibling%'))
        )
      ),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(
        obj(
          prop('from', itemlist.nextSelected(0)),
          prop('to', itemlist.nextSelected(If('%keyCode%==40', 1, -1)))
        )
      ),
      sink.BEMethod('moveItem')
    )
  )
})

component('source.dragulaEvent', {
  type: 'rx',
  hidden: true,
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: `e.g., ['dropElm', 'target', 'source']`}
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) =>
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
})

component('itemlist.orignialIndexFromSibling', {
  type: 'data',
  hidden: true,
  params: [
    {id: 'sibling', defaultValue: '%%'}
  ],
  impl: (ctx,sibling) => {
    const cmp = ctx.vars.cmp
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map(el => +el.getAttribute('jb-original-index'))
    const targetIndex = sibling ? jb.ui.indexOfElement(sibling) : indeces.length
    const result = indeces[targetIndex-1]
    jb.log('itemlist DD orignialIndexFromSibling',{sibling, indeces,targetIndex, result,ctx})
    return result
  }
})

component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(css.class('drag-handle'), css('{cursor: pointer}'))
})

});

jbLoadPackedFile({lineInPackage:10961, jb, noProxies: false, path: '/plugins/ui/misc/itemlist-container.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('group.itemlistContainer', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature',
  category: 'itemlist:80,group:70',
  params: [
    {id: 'initialSelection', as: 'single'}
  ],
  impl: features(
    feature.serviceRegistey(),
    watchable('itemlistCntrData', {'$': 'object', search_pattern: '', selected: '%$initialSelection%'}),
    variable('itemlistCntr', {'$': 'object', filters: () => []})
  )
})

component('itemlistContainer.filter', {
  type: 'data',
  aggregator: true,
  category: 'itemlist-filter:100',
  requireService: 'dataFilters',
  params: [
    {id: 'updateCounters', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,updateCounters) => {
			if (!ctx.vars.itemlistCntr) return;
			const res = ctx.vars.itemlistCntr.filters.reduce((items,f) => f.filter(items), ctx.data || []);
			if (updateCounters) { // use merge
					jb.delay(1).then(_=>{
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),(ctx.data || []).length, ctx);
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','ref'),resBeforeMaxFilter.length, ctx);
					jb.db.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length, ctx);
			}) } else {
				ctx.vars.itemlistCntrData.countAfterFilter = res.length
			}
			return res;
	}
})

component('itemlistContainer.search', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'Search'},
    {id: 'searchIn', type: 'search-in', dynamic: true, defaultValue: search.searchInAllProperties()},
    {id: 'databind', as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'},
    {id: 'style', type: 'editable-text-style', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: controlWithFeatures(ctx => jb.ui.ctrl(ctx.cmpCtx), {
    features: features(
      calcProp('init', (ctx,{cmp, itemlistCntr},{searchIn,databind}) => {
				if (!itemlistCntr) return
				itemlistCntr.filters.push( {
					filter: items => {
						const toSearch = jb.val(databind()) || '';
						if (jb.frame.Fuse && jb.path(searchIn,'profile.$') == 'search.fuse')
							return toSearch ? new jb.frame.Fuse(items, searchIn()).search(toSearch).map(x=>x.item) : items
						if (typeof searchIn.profile == 'function') // improved performance
							return items.filter(item=>toSearch == '' || searchIn.profile(item).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)

						return items.filter(item=>toSearch == '' || searchIn(ctx.setData(item)).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
				}})
		}),
      frontEnd.selectionKeySourceService()
    )
  })
})

component('itemlistContainer.moreItemsButton', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeMaxFilter%)'},
    {id: 'delta', as: 'number', defaultValue: 200},
    {id: 'style', type: 'button-style', defaultValue: button.href(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: controlWithFeatures(ctx => jb.ui.ctrl(ctx.cmpCtx), {
    features: features(
      watchRef('%$itemlistCntrData/maxItems%'),
      method('onclickHandler', writeValue('%$itemlistCntrData/maxItems%', (ctx,{itemlistCntrData},{delta}) => delta + itemlistCntrData.maxItems)),
      calcProp('title', (ctx,{},{title,delta}) => title(ctx.setVar('delta',delta))),
      ctx => ({
		templateModifier: (vdom,cmp,state) => { // hide the button when not needed
			if (cmp.ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','number') == cmp.ctx.exp('%$itemlistCntrData/countAfterFilter%','number'))
				return '';
			return vdom;
		}
	  })
    )
  })
})

extension('ui','itemlistCtr', {
  extractPropFromExpression: exp => { // performance for simple cases such as %prop1%
    if (exp.match(/^%.*%$/) && !exp.match(/[./[]/))
      return exp.match(/^%(.*)%$/)[1]
  }
})

// match fields in pattern itemlistCntrData/FLDNAME_filter to data
component('itemlistContainer.filterField', {
  type: 'feature',
  category: 'itemlist:80',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'fieldData', dynamic: true, mandatory: true},
    {id: 'filterType', type: 'filter-type'}
  ],
  impl: feature.init((ctx,{cmp,itemlistCntr},{fieldData,filterType}) => {
	  if (!itemlistCntr) return
	  if (!itemlistCntr.filters.find(f=>f.cmpId == cmp.cmpId)) 
			itemlistCntr.filters.push({
				cmpId: cmp.cmpId,
				filter: items=> {
					const filterValue = jb.val(ctx.vars.$model.databind())
					if (!filterValue) return items
					const res = items.filter(item=>filterType.filter(filterValue, fieldData(ctx.setData(item))))
					if (filterType.sort && (!cmp.state.sortOptions || cmp.state.sortOptions.length == 0) )
						filterType.sort(res,item => fieldData(ctx.setData(item)),filterValue)
					return res
					}
			})
	})
})

component('filterType.text', {
  type: 'filter-type',
  params: [
    {id: 'ignoreCase', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: (ctx,ignoreCase) => ignoreCase ? ({
		filter: (filter,data) => (data||'').toLowerCase().indexOf((filter||'').toLowerCase()) != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b','i');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.toLowerCase().indexOf(filter.toLowerCase()) == 0 ? 3 : 0); // higher score for wholeWord or beginsWith
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	}) : ({
		filter: (filter,data) => (data||'').indexOf(filter||'') != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.indexOf(filter) == 0 ? 3 : 0);
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	})
})

component('filterType.exactMatch', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) =>  {
			const _filter = (filter||'').trim(), _data = (data||'').trim();
			return _data.indexOf(_filter) == 0 && _data.length == _filter.length;
		}
	})
})

component('filterType.numeric', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) => Number(data) >= Number(filter),
		sort: (items,itemToData) => items.sort((item1,item2)=> Number(itemToData(item1)) - Number(itemToData(item2)))
	})
})

component('search.searchInAllProperties', {
  type: 'search-in',
  impl: ctx => {
		if (typeof ctx.data == 'string') return ctx.data;
		if (typeof ctx.data != 'object') return '';
		return jb.entries(ctx.data).map(e=>e[1]).filter(v=>typeof v == 'string').join('#');
	}
})

component('search.fuse', {
  type: 'search-in',
  description: 'fuse.js search https://fusejs.io/api/options.html#basic-options',
  params: [
    {id: 'keys', as: 'array', defaultValue: list('id','name'), description: 'List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects'},
    {id: 'findAllMatches', as: 'boolean', defaultValue: false, description: 'When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string', type: 'boolean'},
    {id: 'isCaseSensitive', as: 'boolean', defaultValue: false, type: 'boolean'},
    {id: 'minMatchCharLength', as: 'number', defaultValue: 1, description: 'Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2)'},
    {id: 'shouldSort', as: 'boolean', defaultValue: true, description: 'Whether to sort the result list, by score', type: 'boolean'},
    {id: 'location', as: 'number', defaultValue: 0, description: 'Determines approximately where in the text is the pattern expected to be found'},
    {id: 'threshold', as: 'number', defaultValue: 0.6, description: 'At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything'},
    {id: 'distance', as: 'number', defaultValue: 100, description: 'Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch'}
  ],
  impl: ctx => ({ fuseOptions: true, ...ctx.params})
})

});

jbLoadPackedFile({lineInPackage:11158, jb, noProxies: false, path: '/plugins/ui/misc/itemlist-scroll.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', itemlist.applyDeltaOfNextPage('%$pageSize%')),
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      source.merge(source.frontEndEvent('scroll'), source.frontEndEvent('wheel')),
      rx.var('applicative', '%target/__appScroll%'),
      rx.do(
        If('%$applicative%', runActions(log('itemlist applicative scroll terminated'), ({data}) => data.target.__appScroll = null))
      ),
      rx.filter(not('%$applicative%')),
      rx.var('scrollPercentFromTop', ({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.log('itemlist frontend infiniteScroll'),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      sink.BEMethod('fetchNextPage')
    )
  )
})

component('itemlist.applyDeltaOfNextPage', {
  type: 'action',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: (ctx,pageSize) => {
    const $props = ctx.vars.$props, cmp = ctx.vars.cmp, $state = cmp.state, cmpId = cmp.cmpId
    jb.log('itemlist applyDeltaOfNextPage',{ctx,pageSize,$props,$state,cmpId})
    $state.visualSizeLimit = $state.visualSizeLimit || $props.visualSizeLimit
    const nextPageItems = $props.allItems.slice($state.visualSizeLimit, $state.visualSizeLimit + pageSize)
    $state.visualSizeLimit = $state.visualSizeLimit + nextPageItems.length
    if (nextPageItems.length == 0) return null
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true)
      .setVars({$cmpId: cmpId, $cmpVer: cmp.ver+1, $baseIndex: $state.visualSizeLimit - nextPageItems.length})
      .ctx({profile: {...cmp.ctx.profile, items: () => nextPageItems}, path: ''}) // change the profile to return itemsToAppend
    const deltaCmp = deltaCalcCtx.runItself()
    const oldCmp = jb.ui.cmps[cmpId]
    const vdomOfDeltaItems = deltaCmp.renderVdom()
    jb.ui.cmps[cmpId] = oldCmp
    cmp.renderProps.items = [...cmp.renderProps.items, ...deltaCmp.renderProps.items]
    cmp.renderProps.ctrls = [...cmp.renderProps.ctrls, ...deltaCmp.renderProps.ctrls]
    const itemsParent = jb.ui.find(vdomOfDeltaItems,'.jb-items-parent')[0] || vdomOfDeltaItems
    const appendDelta = { children: {toAppend: jb.ui.stripVdom(itemsParent).children } }
    const deltaOfItems = itemsParent == vdomOfDeltaItems ? appendDelta : { _$bySelector: {'.jb-items-parent': appendDelta} }
    const deltaOfCmp = { attributes: { $scrollDown: true, $__state : JSON.stringify($state) } }

    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfItems,cmpId,assumedVdom: jb.ui.elemToVdom(jb.ui.elemOfCmp(ctx,cmpId))})
    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfCmp,cmpId})
  }
})

component('itemlist.deltaOfItems', {
  impl: ctx => {
    const cmp = ctx.vars.cmp
    const newVdom = cmp.renderVdom(), oldVdom = cmp.oldVdom || {}
    const delta = jb.ui.compareVdom(oldVdom,newVdom,ctx)
    cmp.oldVdom = newVdom
    jb.log('uiComp itemlist delta incrementalFromRx', {cmp, newVdom, oldVdom, delta})
    return delta
  }
})

component('itemlist.incrementalFromRx', {
  type: 'feature',
  params: [
    {id: 'prepend', as: 'boolean', boolean: 'last at top', type: 'boolean'}
  ],
  impl: followUp.flow(
    source.callbag(ctx => ctx.exp('%$$props.items%').callbag || jb.callbag.fromIter([])),
    rx.map(If('%vars%', '%data%', '%%')),
    rx.var('delta', itemlist.deltaOfNextItem()),
    sink.applyDeltaToCmp('%$delta%', '%$followUpCmp/cmpId%')
  )
})

component('itemlist.deltaOfNextItem', {
  type: 'data',
  impl: (ctx) => {
    const { $props, cmp } = ctx.vars
    const { state, cmpId } = cmp
    jb.log('itemlist deltaOfNextItem',{ctx,$props,state,cmpId})
    state.visualSizeLimit = state.visualSizeLimit || $props.visualSizeLimit
    state.visualSizeLimit = state.visualSizeLimit + 1
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true)
      .setVars({$cmpId: cmpId, $cmpVer: cmp.ver+1, $baseIndex: state.visualSizeLimit - 1 })
      .ctx({profile: {...cmp.ctx.profile, items: () => [ctx.data]}, path: ''}) // change the profile to return itemsToAppend
    const deltaCmp = deltaCalcCtx.runItself()
    const oldCmp = jb.ui.cmps[cmpId]
    const vdomOfDeltaItems = deltaCmp.renderVdom()
    jb.ui.cmps[cmpId] = oldCmp
    cmp.renderProps.items = [...cmp.renderProps.items, ...deltaCmp.renderProps.items]
    cmp.renderProps.ctrls = [...cmp.renderProps.ctrls, ...deltaCmp.renderProps.ctrls]
    const itemsParent = jb.ui.find(vdomOfDeltaItems,'.jb-items-parent')[0] || vdomOfDeltaItems
    const appendDelta = { children: {toAppend: jb.ui.stripVdom(itemsParent).children } }
    const deltaOfItems = itemsParent == vdomOfDeltaItems ? appendDelta : { _$bySelector: {'.jb-items-parent': appendDelta} }
    const deltaOfCmp = { attributes: { $scrollDown: true, $__state : JSON.stringify(state) } }

    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfItems,cmpId,assumedVdom: jb.ui.elemToVdom(jb.ui.elemOfCmp(ctx,cmpId))})
    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfCmp,cmpId})
  }
})

component('itemlist.calcSlicedItems', {
  impl: ctx => {
    const {allItems, visualSizeLimit, items} = ctx.vars.$props
    if (items) return items
    const firstItem = allItems[0]
    if (jb.callbag.isCallbag(firstItem)) {
      const res = []
      res.callbag = firstItem
      return res
    }
    const slicedItems = allItems.length > visualSizeLimit ? allItems.slice(0, visualSizeLimit) : allItems
    const itemsRefs = jb.db.isRef(jb.db.asRef(slicedItems)) ? Object.keys(slicedItems).map(i=> jb.db.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs
  }
})

});

jbLoadPackedFile({lineInPackage:11284, jb, noProxies: false, path: '/plugins/ui/misc/markdown-viewer.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
extension('markdown', {
  $requireLibs: ['/dist/mark.js'],
})

component('markdown', {
  type: 'control',
  category: 'control:20',
  description: 'md markdown viewer',
  params: [
    {id: 'markdown', as: 'string', mandatory: true, dynamic: true},
    {id: 'style', type: 'markdown-style', defaultValue: markdown.mark(), dynamic: true},
    {id: 'title', as: 'string', defaultValue: 'markdown', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('markdown.mark', {
  type: 'markdown-style',
  impl: customStyle({
    template: ({},{html},h) => h('div', {jb_external: true}, h('div', {$html: html})),
    features: [
      calcProp('html', (ctx,{$model}) => jb.frame.marked && jb.frame.marked($model.markdown(ctx)) || '')
    ]
  })
})

});

jbLoadPackedFile({lineInPackage:11315, jb, noProxies: false, path: '/plugins/ui/misc/multi-select.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('multiSelect', {
  type: 'control',
  description: 'select list of options, check multiple',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'multiSelect-style', defaultValue: select.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('multiSelect.modelAsBooleanRef', {
  type: 'boolean',
  params: [
    {id: 'multiSelectModel'},
    {id: 'code'}
  ],
  impl: (ctx,multiSelectModel,code) => {
        const ref = multiSelectModel.databind()
        return { $jb_val: val => val === undefined ? has() : val === true ? add() : remove() }

        function has() { return jb.val(ref).indexOf(code) != -1 }
        function add() { if (!has(code)) jb.db.push(ref, code,ctx) }
        function remove() { 
            const index = jb.val(ref).indexOf(code)
            index != -1 && jb.db.splice(ref,[[index,1]],ctx)
        }
    }
})


});

jbLoadPackedFile({lineInPackage:11354, jb, noProxies: false, path: '/plugins/ui/misc/menu.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
using('ui-common')

component('menu.menu', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true, defaultValue: []},
    {id: 'icon', type: 'icon'}
  ],
  impl: ctx => ({
		options: function(ctx2) {
      const ctxWithDepth = ctx.setVars({...ctx.vars, ...(ctx2 && ctx2.vars), menuDepth: this.ctx.vars.menuDepth })
      return ctx.params.options(ctxWithDepth).filter(x=>x)
      //return ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctxWithDepth)))
    },
    title: ctx.params.title(),
    icon: ctx.params.icon,
		runShortcut: function(event) {
			return this.options().reduce((res,o)=> res || (o.runShortcut && o.runShortcut(event)),false)
		},
		ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
	})
})

component('menu.dynamicOptions', {
  type: 'menu.option',
  params: [
    {id: 'items', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericOption', type: 'menu.option', mandatory: true, dynamic: true}
  ],
  impl: typeAdapter('data<>', pipeline('%$items()%', '%$genericOption()%'))
})

component('menu.endWithSeparator', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true},
    {id: 'separator', type: 'menu.option', defaultValue: menu.separator()},
    {id: 'title', as: 'string'}
  ],
  impl: typeAdapter('data<>', pipeline(Var('opts', '%$options()%'), If('%$opts/length%>0', list('%$opts%','%$separator%'))))
})

component('menu.separator', {
  type: 'menu.option',
  impl: typeAdapter('data<>', obj(prop('separator', true)))
})

component('menu.action', {
  type: 'menu.option',
  moreTypes: 'control<>',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'description', as: 'string', dynamic: true, mandatory: true},
    {id: 'icon', type: 'icon'},
    {id: 'shortcut', as: 'string'},
    {id: 'showCondition', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: ctx => ctx.params.showCondition && ({
			leaf : ctx.params,
			action: () => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
      title: ctx.params.title(ctx),
      description: ctx.params.description(ctx),
      shortcut: ctx.params.shortcut,
			runShortcut: event => {
				if (ctx.calc({$: 'key.eventMatchKey', event: () => event.ev, key: () => ctx.params.shortcut}))
					ctx.params.action()
			},
			ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
		}),
  require: key.eventMatchKey()
})

// ********* controls ************

component('menu.control', {
  type: 'control',
  moreTypes: 'menu<>',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'style', type: 'menu-style', defaultValue: menuStyle.contextMenu(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
    const model = ctx.params.menu()
    const menuModel = model || { options: [], ctx, title: ''}
    const ctxWithModel = ctx.setVars({menuModel})
    const ctxToUse = ctx.vars.topMenu ? ctxWithModel : jb.ui.extendWithServiceRegistry(ctxWithModel.setVar('topMenu',{}))
    jb.log('menu create uiComp',{topMenu: ctx.vars.topMenu, menuModel,ctx,ctxToUse})
    return jb.ui.ctrl(ctxToUse, {$: 'features', features: [
      () => ({pathForPick: jb.path(menuModel,'ctx.path') }),
      {$: 'calcProp', id: 'title', value: '%$menuModel.title%' },
      {$: 'htmlAttribute', attribute: 'menuDepth', value: '%$menuModel/ctx/vars/menuDepth%' },
    ]}, 'feature<>')
	},
  require: [features(), calcProp(), htmlAttribute()]
})

component('menu.openContextMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog-style', dynamic: true, defaultValue: dialog.contextMenuPopup()},
    {id: 'menuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.contextMenu()},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'id', as: 'string'}
  ],
  impl: openDialog({
    content: menu.control(call('menu'), call('menuStyle')),
    style: call('popupStyle'),
    id: '%$id%',
    features: call('features')
  })
})

// ********* styles ************

component('menuStyle.pulldown', {
  type: 'menu-style',
  params: [
    {id: 'innerMenuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafOptionStyle', type: 'menu-option-style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'layout', type: 'group-style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl({
    vars: [
      Var('optionsParentId', ctx => ctx.id),
      Var('innerMenuStyle', '%$innerMenuStyle%'),
      Var('leafOptionStyle', '%$leafOptionStyle%')
    ],
    control: itemlist({
      items: '%$menuModel.options()%',
      controls: menu.control('%$item%', menuStyle.popupThumb()),
      style: call('layout'),
      features: menu.selection()
    })
  })
})

component('menuStyle.contextMenu', {
  type: 'menu-style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option-style', dynamic: true, defaultValue: menuStyle.optionLine()}
  ],
  impl: styleByControl({
    vars: [
      Var('optionsParentId', ctx => ctx.id),
      Var('leafOptionStyle', '%$leafOptionStyle%')
    ],
    control: itemlist({ items: '%$menuModel.options()%', controls: menu.control('%$item%', menuStyle.applyMultiLevel()), features: menu.selection() })
  })
})

component('menu.initPopupMenu', {
  type: 'feature',
  params: [
    {id: 'popupStyle', type: 'dialog-style', dynamic: true, defaultValue: dialog.contextMenuPopup()}
  ],
  impl: features(
    calcProp('title', '%$menuModel.title%'),
    method('openPopup', parentCtx => parentCtx.runAction({$: 'menu.openContextMenu',
        popupStyle: {$: 'call', param: 'popupStyle'},
        menu: () => parentCtx.run({$: 'If', condition: '%$innerMenu%', then: '%$innerMenu.menu()%', Else: '%$$model.menu()%'} ,'menu.option<>'),
      })),
    method('closePopup', dialog.closeDialogById('%$optionsParentId%')),
    method('openNewPopup', runActions(action.runBEMethod('closePopup'), action.runBEMethod('openPopup'))),
    frontEnd.onDestroy(action.runBEMethod('closePopup')),
    menu.passMenuKeySource(),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==39'), sink.BEMethod('openPopup')),
    frontEnd.flow(source.findMenuKeySource(), rx.filter(inGroup(list(37,27), '%keyCode%')), sink.BEMethod('closePopup'))
  ),
  require: [menu.openContextMenu(), call(), If()]
})

component('menu.initMenuOption', {
  type: 'feature',
  impl: features(
    calcProp('title', '%$menuModel.leaf.title%'),
    calcProp('icon', '%$menuModel.leaf.icon%'),
    calcProp('shortcut', '%$menuModel.leaf.shortcut%'),
    method('closeAndActivate', runActions(dialog.closeAllPopups(), '%$menuModel.action()%')),
    menu.passMenuKeySource(),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==13'), sink.BEMethod('closeAndActivate'))
  )
})

component('menuStyle.applyMultiLevel', {
  type: 'menu-style',
  params: [
    {id: 'menuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'separatorStyle', type: 'menu-separator-style', defaultValue: menuSeparator.line()}
  ],
  impl: (ctx,menuStyle,leafStyle,separatorStyle) => {
    const {menuModel,leafOptionStyle, innerMenuStyle } = ctx.vars
			if (menuModel.leaf)
				return leafOptionStyle ? leafOptionStyle(ctx) : leafStyle();
			else if (menuModel.separator)
				return separatorStyle
			else if (innerMenuStyle)
				return innerMenuStyle(ctx)
			else
				return menuStyle()
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
//         const keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.runShortcut(e))
//       }
//     })
// })

component('menu.selection', {
  type: 'feature',
  impl: features(
    htmlAttribute('tabIndex', 0),
    css(
      '>.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }'
    ),
    userStateProp('selected', 0),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method('closeMenu', dialog.closeDialog()),
    menu.selectionKeySourceService(),
    menu.passMenuKeySource(),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>jb.ui.removeClass(elem,'selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        jb.ui.addClass(elem,'selected')
        jb.ui.scrollIntoView(elem)
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.flow(
      source.findMenuKeySource(),
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1), menu.notSeparator('%%'))),
      sink.FEMethod('setSelected')
    ),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==27'), sink.BEMethod('closeMenu')),
    frontEnd.flow(
      source.frontEndEvent('mousemove'),
      rx.filter(menu.notSeparator('%target%')),
      rx.var('elem', ({data}) => data.target.ownerDocument.elementsFromPoint(data.pageX, data.pageY)[0]),
      rx.var('ctxId', itemlist.indexOfElem('%$elem%')),
      rx.map('%$ctxId%'),
      rx.distinctUntilChanged(),
      sink.FEMethod('setSelected')
    )
  )
})
  
component('menu.selectionKeySourceService', {
  type: 'feature',
  impl: If({
    condition: '%$$serviceRegistry/services/menuKeySource%',
    then: [],
    Else: features(
      service.registerBackEndService('menuKeySource', '%$cmp/cmpId%'),
      frontEnd.prop('menuKeySource', (ctx,{cmp,el}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([37,38,39,40,13,27].indexOf(e.keyCode) != -1) {
          jb.log('menuKeySource',{ctx,cmp,e})
          el.keydown_src.next((ctx.cmpCtx || ctx).dataObj(e))
          return false // stop propagation
        }
        return true
      }
      jb.ui.focus(el,'menu.selectionKeySourceService',ctx)
      jb.log('menuKeySource register',{cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
    )
  })
})

component('menu.passMenuKeySource', {
  type: 'feature',
  impl: frontEnd.var('menuKeySourceCmpId', '%$$serviceRegistry/services/menuKeySource%')
})

component('source.findMenuKeySource', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'clientCmp', defaultValue: '%$cmp%'}
  ],
  impl: rx.pipe(
    source.merge(
      source.data([]),
      (ctx,{menuKeySourceCmpId},{clientCmp}) => {
        jb.log('search menuKeySource',{menuKeySourceCmpId,clientCmp,ctx})
        const el = jb.ui.elemOfCmp(ctx,menuKeySourceCmpId)
        const ret = jb.path(el, '_component.menuKeySource')
        if (!ret)
          jb.log('menuKeySource notFound',{menuKeySourceCmpId,clientCmp,el,ctx})
        else
          jb.log('found menuKeySource',{menuKeySourceCmpId,clientCmp,el,ctx})
        return ret
      }
    ),
    rx.var('cmp', '%$clientCmp%'),
    rx.takeUntil('%$cmp.destroyed%'),
    rx.filter(menu.isRelevantMenu()),
    rx.log('from menuKeySource')
  )
})

component('menu.isRelevantMenu', {
  type: 'boolean',
  impl: ctx => {
    const key = ctx.data.keyCode
    const el = ctx.vars.cmp.base
    const menus = jb.ui.find(ctx,'[menuDepth]').filter(el=>jb.ui.hasClass(el,'jb-itemlist'))
    const maxDepth = menus.reduce((max,el) => Math.max(max,+el.getAttribute('menudepth')),0)
    const depth = +el.getAttribute('menudepth') || 0
    const isSelected = jb.ui.parents(el,{includeSelf: true}).find(el=>jb.ui.hasClass(el,'selected'))
    const isMenu = jb.ui.hasClass(el,'jb-itemlist')
    const upDownInMenu = isMenu && (key == 40 || key == 38 || key == 27) && depth == maxDepth
    const leftArrowEntryBefore = isSelected && (key == 37 || key == 27) && depth == maxDepth 
    const rightArrowCurrentEntry = isSelected && (key == 39 || key == 13) && depth == maxDepth + 1
    const res = upDownInMenu || leftArrowEntryBefore || rightArrowCurrentEntry
    jb.log('check isRelevantMenu',{res,key,el,isMenu,isSelected,depth,maxDepth,upDownInMenu,leftArrowEntryBefore,rightArrowCurrentEntry,menus})
    return res
  }
})

component('menuStyle.optionLine', {
  type: 'menu-option-style',
  moreTypes: 'menu-style<>',
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20}, 'control<>')),
				h('span.title',{},title),
				h('span.shortcut',{},shortcut),
        h('div.mdc-line-ripple'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }
				>i { padding: 3px 8px 0 3px }
				>span { padding-top: 3px }
				>.title { display: block; text-align: left; white-space: nowrap; }
				>.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
    features: [menu.initMenuOption(), menu.mdcRippleEffect()]
  })
})

component('menuStyle.popupAsOption', {
  type: 'menu-style',
  impl: customStyle({
    template: (cmp,{title},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
				h('span.title',{},title),
				h('i.material-icons', { onmouseenter: 'openPopup' },'play_arrow'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				>i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
						>.title { display: block; text-align: left; padding-top: 3px; padding-left: 32px; white-space: nowrap; }
			`,
    features: menu.initPopupMenu(dialog.contextMenuPopup(-24, true))
  })
})

component('menuStyle.popupThumb', {
  type: 'menu-style',
  description: 'used for pulldown',
  impl: customStyle({
    template: ({},{title},h) => h('div.pulldown-top-menu-item',{ onclick: 'openPopup'}, title),
    features: [
      menu.initPopupMenu(),
      menu.mdcRippleEffect(),
      frontEnd.flow(
        source.frontEndEvent('mouseenter'),
        rx.filter(ctx => jb.ui.find(ctx,'.pulldown-mainmenu-popup')[0]),
        sink.BEMethod('openNewPopup')
      )
    ]
  })
})

component('dialog.contextMenuPopup', {
  type: 'dialog-style',
  params: [
    {id: 'offsetTop', as: 'number'},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'toolbar', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: ({},{contentComp,toolbar},h) => h('div.jb-dialog jb-popup context-menu-popup', 
      { class: toolbar ? 'toolbar-popup' : 'pulldown-mainmenu-popup'}, h(contentComp)),
    features: [
      dialogFeature.uniqueDialog('%$optionsParentId%'),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({ offsetTop: '%$offsetTop%', rightSide: '%$rightSide%' })
    ]
  })
})

component('menuSeparator.line', {
  type: 'menu-separator-style',
  impl: customStyle({
    template: ({},{},h) => h('div', {separator: true}),
    css: '{ margin: 6px 0; border-bottom: 1px solid var(--jb-menu-separator-fg);}'
  })
})

component('menu.notSeparator', {
  type: 'boolean',
  moreTypes: 'data<>',
  params: [
    {id: 'elem'}
  ],
  impl: (ctx,elem) => elem.firstElementChild && !elem.firstElementChild.getAttribute('separator')
})

component('menu.mdcRippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: () => ({
      templateModifier: vdom => vdom.addClass('mdc-ripple-surface mdc-ripple-radius-bounded mdc-states mdc-states-base-color(red)')
   })
})
});

jbLoadPackedFile({lineInPackage:11805, jb, noProxies: false, path: '/plugins/ui/misc/picklist.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {
component('picklist', {
  type: 'control',
  description: 'select, choose, pick, choice',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, templateValue: picklist.optionsByComma()},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'picklist-style', defaultValue: select.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('picklist.init', {
  type: 'feature',
  impl: features(
    calcProp('options', '%$$model/options()%'),
    calcProp('hasEmptyOption', (ctx,{$props}) => $props.options.filter(x=>!x.text)[0])
  )
})

component('select.native', {
  type: 'picklist-style',
  moreTypes: 'multiSelect-style<>',
  impl: customStyle({
    template: ({},{databind,options},h) => h('select', { onchange: true }, 
      options.map(option=>h('option', {value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))),
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.labelList', {
  type: 'picklist-style',
  params: [
    {id: 'labelStyle', type: 'text-style', dynamic: true, defaultValue: text.span()},
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red OR >a { color: red }', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl({
    control: itemlist({
      items: '%$picklistModel/options%',
      controls: text('%text%', { style: call('labelStyle') }),
      style: call('itemlistStyle'),
      features: [
        itemlist.selection('%$picklistModel/databind%', '%code%', {
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        itemlist.keyboardSelection(),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    modelVar: 'picklistModel'
  })
})

component('picklist.allowAsynchOptions', {
  type: 'feature',
  description: 'allows a text value to be reactive or promise',
  impl: features(
    calcProp({
      id: 'options',
      value: (ctx,{$state,$model,picklistModel},{}) => {
        const model = picklistModel || $model
        let res
        if ($state.refresh && $state.options && $state.refreshSource == 'dataArrived') {
          //console.log('state dataArrived',$state)
          res = $state.options
          jb.log('picklist options using state',{res,ctx,$state})
        } else if ($state.refresh && $state.options) { 
          // could not write test to cover it - suggestions.selectPopup does not cover it
          //console.log('state no dataArrived',$state)
          res = $state.options // show these options while recalcing model options
          const options = model.options() // recalc options
          if (jb.utils.isPromise(options) || jb.callbag.isCallbag(options))
            res.delayed = options
          jb.log('picklist options use state and recalc asynch options',{res,ctx,$state}) // avoid flickering
        } else {
          const options = model.options()
          if (jb.utils.isPromise(options) || jb.callbag.isCallbag(options)) {
            res = []
            res.delayed = options
          } else {
            res = options
          }
          jb.log('picklist options calc options',{res,ctx,$state})
        }
        if (picklistModel) // support styleByControl
          picklistModel.options = res
        return res
      },
      priority: 5,
      phase: 5
    }),
    followUp.flow(
      source.any(({},{$state,$props}) => $props.options.delayed || []),
      rx.log('picklist followUp allowAsynchValue data arrived'),
      sink.refreshCmp({
        state: ({data}) => data.data || jb.path(data,'0.options') && data[0] || data,
        options: obj(prop('refreshSource', 'dataArrived'))
      })
    )
  )
})

component('picklist.onChange', {
  category: 'picklist:100',
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: method('onValueChange', call('action'))
})

// ********* options

component('picklist.optionsByComma', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'string', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
})

component('picklist.options', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'data', as: 'array', dynamic: true, mandatory: true},
    {id: 'code', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'text', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'icon', type: 'icon', dynamic: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,code,text,icon,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',text:''}] : [];
    return emptyValue.concat(options().map(option => ({ code: code(ctx.setData(option)), text: text(ctx.setData(option)), icon: icon(ctx.setData(option)) })));
  }
})

component('picklist.sortedOptions', {
  type: 'picklist.options',
  moreTypes: 'data<>',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, composite: true},
    {id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50'}
  ],
  impl: (ctx,optionsFunc,marks) => {
    let options = optionsFunc() || [];
    marks.forEach(mark=> {
        const option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

component('picklist.promote', {
  type: 'picklist.promote',
  params: [
    {id: 'groups', as: 'array'},
    {id: 'options', as: 'array'}
  ],
  impl: ctx => ctx.params
})

component('picklist.initGroups', {
  type: 'feature',
  impl: calcProp({
    id: 'groups',
    value: (ctx,{$model, $props}) => {
    const options = $props.options;
    const groupsHash = {};
    const promotedGroups = ($model.promote() || {}).groups || [];
    const groups = [];
    options.filter(x=>x.text).forEach(o=>{
      const groupId = groupOfOpt(o);
      const group = groupsHash[groupId] || { options: [], text: groupId};
      if (!groupsHash[groupId]) {
        groups.push(group);
        groupsHash[groupId] = group;
      }
      group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
    })
    groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
    return groups

    function groupOfOpt(opt) {
      if (!opt.group && opt.text.indexOf('.') == -1)
        return '---';
      return opt.group || opt.text.split('.').shift();
    }
  },
    phase: 20
  })
})

});

jbLoadPackedFile({lineInPackage:12015, jb, noProxies: false, path: '/plugins/ui/misc/table.js',fileDsl: '', pluginId: 'ui-misc' }, 
            function({jb,require,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,component,extension,using,dsl,pluginDsl}) {

component('table', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', description: 'fields', mandatory: true, dynamic: true},
    {id: 'style', type: 'table-style', defaultValue: table.plain()},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true},
    {id: 'lineFeatures', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: itemlist({
    vars: [
      Var('$tableModel', ({},{},params) => params)
    ],
    title: '%$title()%',
    items: '%$items()%',
    controls: group('%$controls()%', { style: '%$style.lineStyle()%', features: '%$lineFeatures()%' }),
    style: '%$style.itemlistStyle()%',
    itemVariable: '%$itemVariable%',
    visualSizeLimit: '%$visualSizeLimit%',
    features: '%$features()%'
  })
})

component('table.style', {
  type: 'table-style',
  params: [
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true},
    {id: 'lineStyle', type: 'group-style', dynamic: true, defaultValue: table.trTd()}
  ]
})

component('table.plain', {
  type: 'table-style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  impl: table.style(
    customStyle({
      template: (cmp,{ctrls,hideHeaders,headerFields},h) => h('div.jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
        headerFields.map(f=>h('th',{'jb-ctx': f.ctxId, ...(f.width &&  { style: `width: ${f.width}px` }) }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-items-parent',{}, ctrls.map( ctrl=> h(ctrl[0]))),
        ctrls.length == 0 ? 'no items' : ''            
    ])),
      css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
      features: [
        itemlist.init(),
        calcProp('headerFields', '%$$tableModel/controls()/field()%')
      ]
    })
  )
})

component('table.trTd', {
  type: 'group-style',
  impl: customStyle({
    template: ({},{ctrls},h) => h('tr.jb-item',{}, ctrls.map(ctrl=> h('td',{}, h(ctrl)))),
    features: group.initGroup()
  })
})

component('table.enableExpandToEndOfRow', {
  type: 'feature',
  category: 'line-feature',
  description: 'allows expandToEndOfRow in table, set as lineFeatures',
  impl: templateModifier(({},{$props,vdom}) => {
    const expandIndex = $props.ctrls.findIndex(ctrl=> ctrl.renderProps.expandToEndOfRow)
    if (expandIndex != -1) {
        const colspan = vdom.children.length - expandIndex
        vdom.children = vdom.children.slice(0,expandIndex+1)
        vdom.children[expandIndex].setAttribute('colspan',''+colspan)
    }
  })
})

component('feature.expandToEndOfRow', {
  type: 'feature',
  category: 'table-field',
  description: 'requires table.enableExpandToEndOfRow as lineFeature. Put on a field to expandToEndOfRow by condition',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, type: 'boolean'}
  ],
  impl: calcProp('expandToEndOfRow', '%$condition()%')
})
});

jbLoadPackedFile({lineInPackage:12111, jb, noProxies: false, path: '/plugins/loader/source-code.js',fileDsl: 'loader', pluginId: 'loader' }, 
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
    {id: 'pluginsToLoad', type: 'plugins-to-load[]', flattenArray: true},
    {id: 'pluginPackages', type: 'plugin-package[]', flattenArray: true}, // , defaultValue: defaultPackage()
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

jbLoadPackedFile({lineInPackage:12318, jb, noProxies: false, path: '/plugins/loader/jb-loader.js',fileDsl: '', pluginId: 'loader' }, 
            function({jb,require,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {

function jbBrowserCodePackage(repo = '', fetchOptions= {}, useFileSymbolsFromBuild) {
  return {
    repo: repo.split('/')[0],
    _fetch(path) { 
      const hasBase = path && path.match(/\/\//)
      return fetch(hasBase ? path: jbHost.baseUrl + path, fetchOptions) 
    },
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path) { return useFileSymbolsFromBuild ? this.fileSymbolsFromStaticFileServer(path) 
      : this.fileSymbolsFromStudioServer(path) },
    fileSymbolsFromStudioServer(path) {
      return this.fetchJSON(`${jbHost.baseUrl||''}?op=fileSymbols&path=${repo}${path}`)
    },
    async fileSymbolsFromStaticFileServer(path) {
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

async function jbInit(uri, sourceCode , {multipleInFrame, initSpyByUrl, baseUrl, packOnly} ={}) {
  if (baseUrl) jbHost.baseUrl = baseUrl // used for extension content script
  const packedCode = []
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
        console.log('calcDependency: can not find plugin',{id, history})
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
    'async function jbLoadPacked({uri,initSpyByUrl}={}) {',
    `const jb = ${JSON.stringify(_jb)}`,
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

jbLoadPackedFile({lineInPackage:12585, jb, noProxies: false, path: '/plugins/ui/iframe/launcher/iframe-launcher.js',fileDsl: '', pluginId: 'ui-iframe-launcher' }, 
            function({jb,require,renderWidgetInIframe,sourceCode,sourceCodeByTgpPath,plugins,extend,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
using('loader')

extension('iframe','inIframe', {
    renderWidgetInIframe({id, profile, el, sourceCode, htmlAtts, baseUrl} = {}) {
        baseUrl = baseUrl || 'http://localhost:8082'
        const _plugins = sourceCode && sourceCode.plugins || jb.loader.pluginsOfProfile(profile)
        const plugins = jb.utils.unique(_plugins)
        const html = `<!DOCTYPE html>
<html ${htmlAtts}>
<head>
    <meta charset="UTF-8">
    <!-- 
    <script type="text/javascript" src="${baseUrl}/plugins/loader/jb-loader.js"></script>
    <script type="text/javascript" src="${baseUrl}/package/${plugins.join(',')}.js"></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/dist/css/styles.css"/>
    -->
    <style>
        html, body {
            height: 100%; /* Set height for html and body */
            margin: 0; /* Remove default margin */
        }
    </style>    
</head>
<body>
    <div id="main"></div>
    <script>
    ;(async () => {
        let res = await fetch('${baseUrl}/plugins/loader/jb-loader.js')
        await eval(await res.text())
        jbHost.baseUrl = "${baseUrl}";
        document.iframeId = "${id}"
        res = await fetch('${baseUrl}/package/${plugins.join(',')}.js')
        await eval(await res.text())
    
        globalThis.jb = await jbLoadPacked("${id}");
        jb.baseUrl = "${baseUrl}";
        const ctx = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx());
        console.log('profile',${JSON.stringify(profile)})
        const vdom = await ctx.run(${JSON.stringify(profile)},'control<>');
        console.log('vdom',vdom)
        await jb.ui.render(jb.ui.h(vdom), main, { ctx });
        window.parent.postMessage('jbart is up', '*');
    })()
    </script>

</body>
</html>`
        const iframe = document.createElement('iframe')
        iframe.setAttribute('id',id)
        iframe.setAttribute('sandbox', 'allow-same-origin allow-forms allow-scripts')
        iframe.setAttribute('style', 'position: fixed;border: none;z-index:5000')
        iframe.setAttribute('frameBorder', '0')
        if (jbHost.chromeExtV3) {
          iframe.src = chrome.runtime.getURL('iframe.html')  
        } else {
          iframe.src = 'about:blank'
          iframe.onload = () => {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              iframeDocument.open();
              iframeDocument.write(html);
              iframeDocument.close();
          }
        }
        window.addEventListener('message', ev => {
          if (ev.data && ev.data.$ == 'getInfo') {
            iframe.contentWindow.postMessage({$: 'parentInfo', height: window.innerHeight, width: window.innerWidth, domain: document.domain})
          } else if (ev.data && ev.data.$ == 'setIframeRect') {
            console.log('setIframeRect',ev.data)
            let {top, left, width, height} =  ev.data
            height != null && (iframe.style.height = height +'px');
            width != null && (iframe.style.width = width +'px');
            top != null && (iframe.style.top = top + 'px');
            left != null && (iframe.style.left = left +'px');
          }
        })
        const res = new Promise(resolve => window.addEventListener('message', ev => (ev.data == 'jbart is up') && resolve()))
        document.body.prepend(iframe)
        return res
    }
})

component('renderWidgetInIframe', {
  type: 'action',
  params: [
    {id: 'profile', byName: true},
    {id: 'selector', as: 'string', defaultValue: 'body'},
    {id: 'id', as: 'string', defaultValue: 'main'},
    {id: 'sourceCode', type: 'source-code<loader>'},
    {id: 'htmlAtts', as: 'string', defaultValue: 'style="font-size:12px"'}
  ],
  impl: (ctx, profile, selector, id) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidgetInIframe can not find element for selector', { selector })
    return jb.iframe.renderWidgetInIframe({id, profile, el, ...ctx.params})
  }
})

});

jbLoadPackedFile({lineInPackage:12687, jb, noProxies: false, path: '/plugins/ui/iframe/dialog/iframe-dialog-DD.js',fileDsl: '', pluginId: 'ui-iframe-dialog' }, 
            function({jb,require,renderDialogInIframe,inIframe,openDialog,dialog,inPlaceDialog,dialogs,dialogFeature,source,popup,popupLocation,divider,editableBoolean,editableNumber,editableText,control,icon,feature,image,group,itemlistContainer,filterType,search,itemlist,markdown,menu,menuStyle,menuSeparator,multiSelect,picklist,select,table,button,css,field,validation,inlineControls,dynamicControls,controlWithCondition,controls,html,layout,flexItem,text,defaultTheme,theme,method,watchAndCalcModelProp,calcProp,userStateProp,calcProps,onDestroy,templateModifier,features,followUp,watchRef,htmlAttribute,cmpId,id,watchable,variable,hidden,refreshControlById,refreshIfNotWatchable,runFEMethod,frontEnd,action,backend,sink,rx,key,uiPlugin,service,customStyle,styleByControl,styleWithFeatures,controlWithFeatures,renderWidget,runTransaction,pipeline,pipe,list,firstSucceeding,firstNotEmpty,keys,values,properties,objFromProperties,entries,aggregate,math,objFromEntries,evalExpression,prefix,suffix,removePrefix,removeSuffix,removeSuffixRegex,property,indexOf,writeValue,addToArray,move,splice,removeFromArray,getOrCreate,toggleBooleanValue,slice,sort,first,last,count,reverse,sample,obj,dynamicObject,extend,assign,extendWithIndex,prop,not,and,or,between,contains,notContains,startsWith,endsWith,filter,matchRegex,toUpperCase,toLowerCase,capitalize,join,unique,log,asIs,object,json,split,replace,isNull,notNull,isEmpty,notEmpty,equals,notEquals,runActions,runActionOnItem,runActionOnItems,delay,onNextTimer,extractPrefix,extractSuffix,range,typeOf,className,isOfType,inGroup,Switch,Case,formatDate,formatNumber,getSessionStorage,waitFor,addComponent,loadLibs,loadAppFiles,call,typeAdapter,If,TBD,Var,remark,unknownCmp,runCtx,vars,data,isRef,asRef,test,rxPipe,rxFlow,sourcePipe,watchableData,callbag,callback,animationFrame,event,any,promise,promises,interval,merge,mergeConcat,elems,startWith,resource,reduce,joinIntoVariable,max,Do,doPromise,map,mapPromise,flatMap,flatMapArrays,concatMap,distinctUntilChanged,distinct,catchError,timeoutLimit,throwError,debounceTime,throttleTime,replay,takeUntil,take,takeWhile,toArray,skip,consoleLog,sniffer,subscribe,rxSubject,subjectNext,subject,rxQueue,renderWidgetInIframe,sourceCode,sourceCodeByTgpPath,plugins,project,sameAsParent,pluginsByPath,loadAll,packagesByPath,defaultPackage,staticViaHttp,jbStudioServer,fileSystem,zipFile,component,extension,using,dsl,pluginDsl}) {
using('ui-misc','ui-iframe-launcher')

component('renderDialogInIframe', {
  type: 'action',
  params: [
    {id: 'dialog', type: 'control', dynamic: true, byName: true},
    {id: 'selector', as: 'string', defaultValue: 'body'},
    {id: 'id', as: 'string', defaultValue: 'main'},
    {id: 'sourceCode', type: 'source-code<loader>'},
    {id: 'htmlAtts', as: 'string', defaultValue: 'style="font-size:12px"'}
  ],
  impl: renderWidgetInIframe({
    profile: ({},{},{dialog}) => dialog.profile,
    selector: '%$selector%',
    id: '%$id%',
    sourceCode: '%$sourceCode%',
    htmlAtts: '%$htmlAtts%'
  })
})

component('inIframe.dragTitle', {
  type: 'dialog-feature',
  params: [
    {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
  ],
  impl: features(
    css('>%$selector% { cursor: pointer; user-select: none }'),
    frontEnd.var('selector', '%$selector%'),
    frontEnd.prop('titleElem', ({},{el,selector}) => el.querySelector(selector)),
    frontEnd.flow(
      source.event('mousedown', '%$cmp/titleElem%'),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.var('offsetFromDialog', ({data},{cmp, el}) => ({
          left: data.clientX - el.getBoundingClientRect().left,
          top:  data.clientY - el.getBoundingClientRect().top
	  })),
      rx.flatMap(rx.pipe(
        source.event('mousemove'),
        rx.takeWhile('%buttons%!=0'),
        rx.var('ev'),
        rx.map(({data},{offsetFromDialog,cmp}) => { 
            const {top, left } = jb.utils.sessionStorage('dialog')
            return {
                left: Math.max(0, data.clientX - offsetFromDialog.left + left),
                top: Math.max(0, data.clientY - offsetFromDialog.top + top),
  		  }})
      )),
      sink.FEMethod('setRect')
    )
  )
})

component('inIframe.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'padding', as: 'number', defaultValue: 0}
  ],
  impl: features(
    variable('baseUrl',() => jbHost.baseUrl),
    templateModifier(({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
    css('>.jb-resizer { cursor: pointer; position: absolute; right: %$padding%px; bottom: %$padding%px; content:url("%$baseUrl%/dist/css/resizer.gif") }'),
    frontEnd.var('padding', '%$padding%'),
    frontEnd.init(({},{cmp, padding, el}) => // wait for libs to load
        jb.delay(100).then(() => cmp.runFEMethod('setRect',{height: el.getBoundingClientRect().height+padding*2},{cmp,padding}))),
    frontEnd.prop('resizerElem', ({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
    frontEnd.flow(
      source.event('mousedown', '%$cmp.resizerElem%'),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.var('offset', ({},{el}) => ({ left: el.getBoundingClientRect().left,	top:  el.getBoundingClientRect().top })),
      rx.flatMap(rx.pipe(
        source.event('mousemove'),
        rx.takeWhile('%buttons%!=0'),
        rx.map(({data},{offset}) => ({ width: Math.max(0, data.clientX - offset.left),	height: Math.max(0, data.clientY - offset.top) }))
      )),
      sink.FEMethod('setRect')
    )
  )
})

component('inIframe.Floating', {
  type: 'dialog-style<>',
  params: [
    {id: 'id', as: 'string'},
    {id: 'width', as: 'number', defaultValue: 300, byName: true},
    {id: 'height', as: 'number', defaultValue: 100},
    {id: 'padding', as: 'number', defaultValue: 10},
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,id},h) => h('div',{ class: 'jb-dialog', id},[
				h('div',{class: 'dialog-title noselect'},title),
				h('div',{class: 'dialog-menu'}, [
				h('button', { id: 'backToSize', title: 'back to last size' },'‾'),
				h('button', { id: 'shrink', title: 'shrink' },'–'),
				h('button', { id: 'fullScreen', title: 'full screen' },'🗖'),
      ]),
				h('div',{class: 'jb-dialog-content-parent'},h(contentComp)),
			]),
    css: '{ overflow: auto; border-radius: 4px; padding1: 0 12px 12px 12px;background: white;box-shadow: 0px 0px 7px 8px gray; }',
    features: [
      css('>.dialog-title { background: white !important;  padding: 10px 5px;}'),
      css('>.jb-dialog-content-parent { padding: 0; overflow-y: auto; overflow-x: hidden; }'),
      css(`>.dialog-menu {position: absolute; height: 10px;font: 12px sans-serif;border: none; font-weight: 700; cursor: pointer; 
        width: 60px;
        display: flex;
        margin-top: -30px;
        z-index: 10;
        right: 16px;
        justify-content: space-between;
        flex-direction: row; } `),
      css('>.dialog-menu>button { border: none; background: white; }'),
      css('>.dialog-menu>button:hover { opacity: .5 }'),
      inIframe.dragTitle(),
      frontEnd.var('width', '%$width%'),
      frontEnd.var('height', '%$height%'),
      frontEnd.var('padding', '%$padding%'),
      frontEnd.method('setRect', ({data},{cmp,padding}) => {
          let {top, left, width, height, doNotSetStorage,backToSize} =  data
          if (cmp.iframe) {
            height != null && (cmp.iframe.style.height = height +'px');
            width != null && (cmp.iframe.style.width = width +'px');
            top != null && (cmp.iframe.style.top = top + 'px');
            left != null && (cmp.iframe.style.left = left +'px'); 
          } else {
            window.parent.postMessage({$: 'setIframeRect', top, left, width, height }, '*');
          }
          jb.delay(1).then(() => {
            if (!doNotSetStorage)
              jb.utils.sessionStorage('dialog',{top, left, width, height})
            const autoResizeOffsets = [...document.querySelectorAll('.autoResizeInDialog')].map(innerElemToResize=>({
              elem: innerElemToResize,
              offset: innerElemToResize.getBoundingClientRect().top - cmp.main.getBoundingClientRect().top
                + (cmp.main.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)}))

            autoResizeOffsets.forEach(({elem,offset}) => elem.style.height = (height-offset-padding*2) +'px')
          })
      }),
      frontEnd.init(({},{cmp, width, height, padding, el}) => {
        jb.ui.parents(el).forEach(el=>el.style && (el.style.overflow = 'hidden'))
        cmp.main = jb.ui.parents(el)[0]
        cmp.main.style.padding = padding + 'px'
        const session = jb.utils.sessionStorage('dialog')
        const rect = { height: session.height || height, width: session.width || width, top: session.top || 0, left: session.left || 0}
        jb.delay(1).then(()=> cmp.runFEMethod('setRect',rect,{cmp,padding}))
        window.addEventListener('message', ev => {
          debugger
          if (ev.data && ev.data.$ == 'parentInfo') {
            cmp.fullScreen = {width: ev.data.width, height: ev.data.height, top: 0, left: 0 }
            cmp.parentDomain = ev.data.domain
            if (cmp.parentDomain == document.domain)
              cmp.iframe = window.parent.document.getElementById(jb.ui.parents(el).pop().iframeId)
          }
        })
        window.parent.postMessage({$: 'getInfo' }, '*')

        el.querySelector('#shrink').addEventListener('click', () =>
          cmp.runFEMethod('setRect',{top: 0, left: 0, height: 45, width: 167, doNotSetStorage: true},{cmp,padding}))
        el.querySelector('#backToSize').addEventListener('click', () => 
          cmp.runFEMethod('setRect',{...jb.utils.sessionStorage('dialog'), backToSize: true},{cmp,padding}))
        el.querySelector('#fullScreen').addEventListener('click', () => 
          cmp.runFEMethod('setRect',{...cmp.fullScreen, doNotSetStorage: true},{cmp,padding}))
      }),      
      dialogFeature.uniqueDialog('%$id%'),
      dialogFeature.maxZIndexOnClick(5000),
      popupLocation(),
      inIframe.resizer('%$padding%')
    ]
  })
})
});

}