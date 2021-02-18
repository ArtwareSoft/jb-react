jb.chromeDebugger = {
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
            port.onDisconnect.addListener(()=> jb.delay(2000).then(() => location.reload()))

            jb.jbm.gateway = jb.ports['devtools'] = jb.parent = jb.jbm.extendPortToJbmProxy(jbPort)
            jb.log('chromeDebugger panel connected to devtools',{jbPort})
        })
    },
    async initPanel(panelId, panelFrame) {
        const spyParam = await this.evalAsPromise(`self.jb && jb.path(jb,'spy.spyParam') || ''`)
        self.spy = jb.initSpy({spyParam})
        this.initPanelPortListenser(panelId, panelFrame)
        jb.log(`chromeDebugger invoking initDevTools on debugee`,{panelId})
        await this.evalAsPromise(`self.jb && jb.jbm && jb.jbm.initDevToolsDebugge()`)
        await jb.exec(pipe(rx.pipe( // wait for the content-script to inject jb.jbm.connectToPanel into the debuggee
            source.interval(500), 
            rx.flatMap(source.promise(this.evalAsPromise(`self.jb && jb.jbm && jb.jbm.connectToPanel`))),
            rx.filter(x=>x),
            rx.take(1)
        )))
        jb.log(`chromeDebugger invoking connectToPanel on debugee`,{panelId})
        await this.evalAsPromise(`self.jb && jb.jbm.connectToPanel('${jb.uri}')`)
        await jb.exec(waitFor(() => jb.parent))
        await this.renderOnPanel(panelId, panelFrame)
    },

    async renderOnPanel(panelId,panelFrame) {
        const debugeeUri = await this.evalAsPromise('typeof jb != "undefined" && jb.uri')

        jb.log(`chromeDebugger panel starting ${panelId}Ctrl ${debugeeUri}`)
        if (panelId == 'comp') 
        chrome.devtools.panels.elements.onSelectionChanged.addListener( async () => {
            const inspectedProps = await this.selectedProps()
            const elem = document.querySelector('[widgettop="true"]>*')
            inspectedProps && inspectedProps.cmpId && elem && jb.ui.runBEMethod(elem,'refreshAfterDebuggerSelection',inspectedProps)
        })
        if (panelId == 'card') 
            chrome.devtools.panels.elements.onSelectionChanged.addListener(async () => {
                await this.markSelected()
                const elem = document.querySelector('[widgettop="true"]>*')
                elem && jb.ui.runBEMethod(elem,'refreshAfterDebuggerSelection')
        })
        const inspectedProps = await this.selectedProps()
        const profile = {$: `chromeDebugger.${panelId}Ctrl`, inspectedProps, uri: debugeeUri}
        jb.log(`chromeDebugger renderOnPanel firstRun ${panelId}`,{profile,inspectedProps, debugeeUri,panelFrame})
        jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().setVar('$disableLog',true).run(profile)),panelFrame.document.body)
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    markSelected() {
        this.selectionCounter = this.selectionCounter || 1
        return this.evalAsPromise(`$0 && $0.setAttribute && $0.setAttribute("jb-selected-by-debugger","${this.selectionCounter++}");`)
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
        await this.markSelected()
        return this.evalAsPromise(`(${buildPropsObj.toString()})()`)
    },
}

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
                    net.listAll(),
                    unique(),
                    filter(not(contains('►vDebugger'))),
                    filter(not(contains('devtools'))),
                    aggregate(obj(prop('options',picklist.options('%%'))))
                ),
                features: picklist.allowAsynchOptions(),
            }),
            group({
                controls: remote.widget(studio.eventTracker(), jbm.byUri('%$inspectedUri%►vDebugger')),
                features: [
                    watchRef('%$inspectedUri%'),
                    group.wait(remote.data(jbm.vDebugger(),jbm.byUri('%$inspectedUri%')))
                ]
            })
        ],
        features: [
            variable({name: 'inspectedUri', watchable : true, value: '%$uri%'}),
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
        controls: remote.widget(studio.compInspector('%$inspectedProps%'), jbm.byUri('%$uri%►vDebugger')),
        features: group.wait(remote.data(jbm.vDebugger(),jbm.byUri('%$uri%')))
    })
})

jb.component('chromeDebugger.cardCtrl', {
    params: [
        {id: 'uri', as: 'string'},
    ],
    type: 'control',
    impl: remote.widget( studio.cardExtraction(),jbm.byUri('%$uri%'))
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

