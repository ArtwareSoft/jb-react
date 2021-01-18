jb.component('studio.initProjectSandbox', {
    type: 'action',
    params: [
        {id: 'projectSettings', defaultValue: '%$studio/projectSettings%' },
    ],
    impl: (ctx, projectSettings) => {
        const uri = 'notebook-worker'
        const st = jb.studio
        if (st.notebookWorker) return st.notebookWorker
        const spyParam = ((jb.path(jb.frame,'location.href')||'').match('[?&]spy=([^&]+)') || ['', ''])[1]
        const settings = JSON.parse(JSON.stringify({...projectSettings,suffix:'?nb',spyParam: projectSettings.spyParam || spyParam}))
        const distPath = jb.remote.pathOfDistFolder()

        settings.libs = 'common,ui-common,remote,two-tier-widget,markdown,notebook,pretty-print' + settings.libs
        const workerCode = `
jbUri = '${uri}'
jbProjectSettings = ${JSON.stringify(settings)}
importScripts('${st.host.jbLoader}')
importScripts('${location.origin}/projects/studio/studio-path.js') // To be fixed - maybe moved to dist
jb.cbLogByPath = {}
if (jbProjectSettings.spyParam)
    self.spy = self.spy || jb.initSpy({spyParam: jbProjectSettings.spyParam})
portToStudio = jb.remote.cbPortFromFrame(self,'${uri}','studio')
jb.notebookId = '${projectSettings.project}.notebook'
jb.component('studio', { watchableData: {}})
jb.studio.initCompsRefHandler(jb)

${jb.prettyPrintComp('sink.refreshNotebook',jb.comps['sink.refreshNotebook'])}

jb.studio.evalProfile = prof_str => {
    if (!prof_str) return prof_str
    try {
        return eval('('+prof_str+')')
    } catch (e) {
        jb.logException(e,'eval profile',{prof_str})
    }
}

importScripts('${distPath}/jb-debugger.js?nb')
jbDebugger.remote.cbPortFromFrame(self,'${uri}-spy','studio')

jb.exec(rx.pipe(
    source.data(() => jb.prettyPrint({...jb.comps[jb.notebookId],
        location: jb.comps[jb.notebookId][jb.location], loadingPhase: jb.comps[jb.notebookId][jb.loadingPhase]} )),
    remote.operator({$: 'sink.initNotebookStudio'}, () => ({port: portToStudio, uri: '${uri}'})),
))
`
        const worker = st.notebookWorker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.port = jb.remote.cbPortFromFrame(worker,'studio',uri)
        worker.spyPort = jb.remote.cbPortFromFrame(worker,'studio',`${uri}-spy`)
        worker.uri = worker.jbUri = uri
        return worker
    }
})

jb.component('sink.initNotebookStudio', {
    type: 'rx',
    category: 'sink',
    impl: rx.innerPipe(
        rx.map(({data}) => jb.studio.evalProfile(data)),
        rx.map(({data}) => {
            res = {...data, [jb.location]: data.location, [jb.loadingPhase]: data.loadingPhase }
            delete res.location
            delete res.loadingPhase
            return res
        }),
        sink.action( ctx => {
            jb.comps[ctx.exp('%$studio/project%.notebook')] = ctx.data
            jb.studio.initCompsRefHandler(jb)
        }),
    )
})

jb.component('sink.refreshNotebook', {
    type: 'rx',
    category: 'sink',
    description: 'runs on worker',
    params: [
        {id: 'change' }
    ],
    impl: rx.innerPipe(
        rx.var('parsedProfile', ({},{profile}) => jb.studio.evalProfile(profile)),
        rx.var('path', '%$change/path%'),
        rx.do(({ctx},{parsedProfile}) => jb.comps['%$studio/project%.notebook'].impl = parsedProfile.impl),
        sink.action(({},{path}) => jb.studio.scriptChange.next({path}))
    )
})

jb.component('sink.doOp', {
    type: 'rx',
    category: 'sink',
    description: 'runs on worker',
    params: [
        {id: 'change' }
    ],
    impl: sink.action(({data}) => {
        const {path,opOnRef} = data
    })
})

jb.component('remote.notebookWorker', {
    type: 'remote',
    impl: () => ({uri: 'notebook-worker', port: jb.studio.notebookWorker.port})
})

jb.component('remote.notebookWorkerSpy', {
    type: 'remote',
    impl: () => ({uri: 'notebook-worker-spy', port: jb.studio.notebookWorker.spyPort})
})

