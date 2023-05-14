jb.extension('chromeDebugger', {
    initPanelPortListenser(panelId, panelFrame) {
        jb.log('chromeDebugger initPanelPortListenser',{panelId})
        panelFrame.chrome.runtime.onConnect.addListener(port => {
            if (port.name != 'devtools') return
            jb.log('chromeDebugger panel on connect',{port})
            const from = jb.uri, to = 'devtools'
            const jbPort = {
                dtport: port, from, to,
                postMessage: _m => { 
                    const m = {from, to,..._m}
                    if (jbPort.disconnected)
                        return jb.log(`chromeDebugger sending to disconnected ${from} to ${to}`,{m})
                    jb.log(`chromeDebugger remote sent from ${from} to ${to}`,{m})
                    port.postMessage(m) 
                },
                onMessage: { addListener: handler => { 
                    jb.log('chromeDebugger addListener to port',{panelId, port})
                    port.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) }  
                },
            }
            port.onDisconnect.addListener(()=> jb.delay(2000).then(() => jb.frame.location.reload()))

            jb.jbm.gateway = jb.ports['devtools'] = jb.parent = jb.jbm.extendPortToJbmProxy(jbPort)
            jb.log('chromeDebugger panel connected to devtools',{jbPort})
        })
    },
    async initPanel(panelId, panelFrame) {
        try {
            const {initPanelPortListenser, evalAsPromise, renderOnPanel} = jb.chromeDebugger
            const spyParam = await evalAsPromise(`self.jb && jb.path(jb,'spy.spyParam') || ''`)
            jb.log(`chromeDebugger spyParam`,{spyParam, panelId})
            self.spy = jb.spy.initSpy({spyParam})
            initPanelPortListenser(panelId, panelFrame)
            jb.log(`chromeDebugger invoking initDevTools on debugee`,{panelId})
            await evalAsPromise(`self.jb && jb.jbm && jb.jbm.initDevToolsDebugge()`)
            jb.log(`chromeDebugger waiting for jb.jbm.connectToPanel func on debugee`,{panelId})
            await jb.exec(pipe(rx.pipe( // wait for the content-script to inject jb.jbm.connectToPanel into the debuggee
                source.interval(500), 
                rx.mapPromise(() => evalAsPromise(`self.jb && jb.jbm && typeof jb.jbm.connectToPanel`)),
                rx.log('chromeDebugger wait for connectToPanel func on debuggee'),
                rx.filter('%%==function'),
                rx.take(1)
            )))
            jb.log(`chromeDebugger invoking connectToPanel on debugee`,{panelId})
            await evalAsPromise(`self.jb && jb.jbm.connectToPanel('${jb.uri}')`)
            await jb.exec(waitFor(() => jb.parent))
            await renderOnPanel(panelId, panelFrame)
        } catch (e) {
            jb.logException(e,`init panel failure ${panelId}`,{panelFrame})
        }
    },

    async renderOnPanel(panelId,panelFrame) {
        const debugeeUri = await jb.chromeDebugger.evalAsPromise('typeof jb != "undefined" && jb.uri')

        jb.log(`chromeDebugger panel starting ${panelId}Ctrl ${debugeeUri}`)
        if (panelId == 'comp') 
        chrome.devtools.panels.elements.onSelectionChanged.addListener( async () => {
            const inspectedProps = await jb.chromeDebugger.selectedProps()
            const elem = document.querySelector('[widgettop="true"]>*')
            inspectedProps && inspectedProps.cmpId && elem && jb.ui.runBEMethod(elem,'refreshAfterDebuggerSelection',inspectedProps)
        })
        if (panelId == 'card') 
            chrome.devtools.panels.elements.onSelectionChanged.addListener(async () => {
                await jb.chromeDebugger.markSelected()
                const elem = document.querySelector('[widgettop="true"]>*')
                elem && jb.ui.runBEMethod(elem,'refreshAfterDebuggerSelection')
        })
        const inspectedProps = await jb.chromeDebugger.selectedProps()
        const profile = {$: `chromeDebugger.${panelId}Ctrl`, inspectedProps, uri: debugeeUri}
        jb.log(`chromeDebugger renderOnPanel firstRun ${panelId}`,{profile,inspectedProps, debugeeUri,panelFrame})
        jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().setVar('$disableLog',true).run(profile)),panelFrame.document.body)
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    markSelected() {
        jb.chromeDebugger.selectionCounter = jb.chromeDebugger.selectionCounter || 1
        return jb.chromeDebugger.evalAsPromise(`$0 && $0.setAttribute && $0.setAttribute("jb-selected-by-debugger","${jb.chromeDebugger.selectionCounter++}");`)
    },
    async selectedProps() {
        function buildPropsObj() {
            if (!self.jb) return
            const cmpElem = $0 && jb.ui.closestCmpElem($0)
            return cmpElem ? {
                cmpId: cmpElem.getAttribute("cmp-id"),
                frontEndState: cmpElem.state,
                frameUri: [self,...Array.from(frames)].filter(x=>x.document == $0.ownerDocument).map(x=>x.jb.uri)[0]
            } : {}
        }
        await jb.chromeDebugger.markSelected()
        return jb.chromeDebugger.evalAsPromise(`(${buildPropsObj.toString()})()`)
    },
})

jb.component('chromeDebugger.logsCtrl', {
    params: [
        {id: 'uri', as: 'string'}
    ],
    type: 'control',
    impl: group({
        controls: [
            picklist({
                title: 'jbm',
                databind: '%$inspectedUri%',
                options: pipe(
                    remote.data(net.listSubJbms(), byUri('%$uri%')),
                    unique(),
                    filter(not(contains('•vDebugger'))),
                    filter(not(contains('devtools'))),
                    aggregate(obj(prop('options',picklist.options('%%'))))
                ),
                features: picklist.allowAsynchOptions(),
            }),
            group({
                controls: remote.widget(studio.eventTracker(), byUri('%$inspectedUri%•vDebugger')),
                features: [
                    watchRef('%$inspectedUri%'),
                    group.wait(remote.data(jbm.start(jbm.vDebugger()),byUri('%$inspectedUri%')))
                ]
            })
        ],
        features: [
            watchable('inspectedUri', '%$uri%'),
            id('%$uri%')
        ]
    })
})

jb.component('chromeDebugger.compCtrl', {
    params: [
        {id: 'uri', as: 'string'},
        {id: 'inspectedProps'},
    ],
    type: 'control',
    impl: group({
        controls: remote.widget(studio.compInspector('%$inspectedProps%'), byUri('%$uri%•vDebugger')),
        features: group.wait(remote.data(jbm.start(jbm.vDebugger()),byUri('%$uri%')))
    })
})

jb.component('chromeDebugger.cardCtrl', {
    params: [
        {id: 'uri', as: 'string'},
    ],
    type: 'control',
    impl: remote.widget( cardExtract.showOptions(),byUri('%$uri%'))
})

jb.component('chromeDebugger.openResource', {
    type: 'action',
    params: [
        {id: 'location', as: 'array', description: 'file,line,col'}
    ],
    impl: (ctx,loc) => {
        console.log('chromeDebugger openResource',loc)
        chrome.devtools.panels.openResource(...loc)
    }
})

