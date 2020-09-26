jb.ns('widget,studio')

jb.chromeDebugger = {
    initPanel(id, panelFrame) { // use counter on inpsectedWin to support debugger refresh 
        return this.evalAsPromise('(self.jbPanelCounter = (self.jbPanelCounter || 1) +1)')
            .then(counter=> {
                const fullId = `${id}-${counter}`
                // support inpsectedWin refresh - 'inspectedCreated' is re-sent on content-script initializtion
                chrome.runtime.onMessage.addListener(req => req == 'inspectedCreated' && this.doInitPanel(id,fullId,panelFrame))
                return this.doInitPanel(id,fullId, panelFrame)
            })
    },
    doInitPanel(id, fullId, panelFrame) {
        panelFrame.uri = `debugPanel-${fullId}`
        const jb = panelFrame.jb
        panelFrame.inspectedPorts = panelFrame.inspectedPorts || {}
        jb.cbLogByPath = {}
        jb.initSpy({spyParam: 'all'})
        panelFrame.spy = jb.spy
        jb.log('chromeDebugger init panel',{fullId, panelFrame})

        return this.hasStudioOnInspected()
            .then(res => {
                if (!res)
                    this.initIframeOnInspectedWindow(panelFrame)
                return this.reCheckPromise('studio on inspectedWin',() => this.hasStudioOnInspected(),300,20)
            }).then(()=> {
                this.initStudioDebugPort(panelFrame)
                this.initPanelPortListenser(panelFrame)
                this.inspectedWindowRequestToConnectToPanel(panelFrame)
                return this.reCheckPromise('port to inspectedWin',() => self.inspectedPorts[panelFrame.uri],50,50)
            })
            .then(()=> { panelFrame.document.body.innerHTML=''; this.FECtrl = this.renderOnPanel(panelFrame,id) })
            .catch(e => jb.logException(e,`chromeDebugger panel ${panelFrame.uri} wait for ${e}`))
    },
    initPanelPortListenser(panelFrame) {
        panelFrame.chrome.runtime.onConnect.addListener(port => {
            jb.log('chromeDebugger panel on connect',{port})
            if (port.name != 'jbDebugger') return
            if (panelFrame.inspectedPorts[panelFrame.uri]) return

            const panelToInspectWindowPort = panelFrame.inspectedPorts[panelFrame.uri] = {
                from: panelFrame.uri,
                to: 'inspectedStudio',
                postMessage(m) { 
                    jb.log(`chromeDebugger sent from ${panelFrame.uri} to ${this.to}`,{m,panelFrame})
                    panelFrame.inspectedPorts[panelFrame.uri] && port.postMessage({from: panelFrame.uri, to: this.to, ...m}) 
                },
                onMessage: { addListener : handler => { 
                    port.onMessage.addListener(m => {
                        jb.log(`chromeDebugger received from ${m.from} to ${m.to} at ${panelFrame.uri}`,{m,panelFrame})
                        m.to == panelFrame.uri && handler(m)
                    })
                }}            
            }
            jb.remote.extendPortWithCbHandler(panelToInspectWindowPort).initCommandListener()
            port.onMessage.addListener(m => m.runProfile && jb.exec(m.runProfile))

            port.onDisconnect.addListener(() => {
                jb.log(`chromeDebugger inspectedWin port disconnected from panel at ${panelFrame.uri}`,{panelFrame})
                delete panelFrame.inspectedPorts[panelFrame.uri]
            })
        })
    },
    renderOnPanel(panelFrame,panelId) {
        const uri = panelFrame.uri
        jb.log(`chromeDebugger panel start logsCtrl ${uri}`)
        if (panelId == 'comp') 
            chrome.devtools.panels.elements.onSelectionChanged.addListener(() => this.selectedCmpId().then(cmpId => 
                    cmpId && jb.ui.runBEMethod(document.querySelector('[widgettop="true"]'),'refresh',cmpId)))

        return Promise.resolve(panelId == 'comp' && this.selectedCmpId()).then(cmpId=>{
                const profile = {$: `inspectedWindow.${panelId}Ctrl`, cmpId, uri}
                jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().setVar('$studio',true).run(profile)),panelFrame.document.body)
        })
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => 
            chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    inspectedWindowRequestToConnectToPanel(panelFrame) {
        return this.evalAsPromise(`postMessage({$: 'connectToPanel', 
            from: 'inspectedStudio', to: '${panelFrame.uri}' , panelUri: '${panelFrame.uri}' }) `)
    },
    selectedCmpId() {
        return this.evalAsPromise('$0 && jb.ui.closestCmpElem($0) && jb.ui.closestCmpElem($0).getAttribute("cmp-id")')
    },
    initStudioDebugPort(panelFrame) {
        return this.evalAsPromise(`self.studioDebugPort = self.studioDebugPort || jb.remote.cbPortFromFrame(self,'inspectedStudio','${panelFrame.uri}')`)
    },
    hasStudioOnInspected() {
        return this.evalAsPromise('self.jbStudio != null || self.studioDebugPort != null')
    },
    initIframeOnInspectedWindow(panelFrame) {
        function initFrameForChromeDebugger(uri) {
            if (self.jbStudio) return
            const html = `<!DOCTYPE html>
            <html>
            <head>
                <script type="text/javascript" src="/bin/studio/studio-all.js"></script>
                <script>
                    jb.cbLogByPath = {};
                    jb.initSpy({spyParam: jb.path(parent,'jb.spy.spyParam') || 'remote,chromeDebugger,headless,dialog'});
                    spy = jb.spy;
                    jb.studio.initPreview(parent,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
                    parent.studioDebugPort = jb.remote.cbPortFromFrame(self.parent,'inspectedStudio','${uri}');
                </script>
            </head>`
            const iframe = document.createElement('iframe')
            iframe.id = 'jBartHelper'
            iframe.style.display = 'none'
            iframe.src = 'javascript: this.document.write(`' + html +'`)'
            document.body.appendChild(iframe)
        }
        jb.log('chromeDebugger init studioIframe',{code: initFrameForChromeDebugger.toString()})
        return this.evalAsPromise(`(${initFrameForChromeDebugger.toString()})('${panelFrame.uri}')`)
    },
    reCheckPromise(description, checkPromise ,interval,times) {
        let count = 0
        return new Promise((resolve,reject) => {
            const toRelease = setInterval(() => {
                count++
                jb.log(`chromeDebugger waitFor ${description}`,{count,checkPromise})
                if (count >= times) {
                    clearInterval(toRelease)
                    reject(description + ' timeout')
                }
                Promise.resolve(checkPromise()).then(v => { if (v) { 
                    clearInterval(toRelease)
                    jb.log(`chromeDebugger waitFor ${description} resolved`,{count,checkPromise})
                    resolve(v) 
                } })
            }, interval)
        })
    },
}

jb.component('remote.inspectedWindowFromPanel', {
    type: 'remote',
    params: [
        {id: 'uri', as: 'string'}
    ],    
    impl: (ctx,uri) => ({uri: uri, port: self.inspectedPorts[uri]})
})

jb.component('inspectedWindow.logsCtrl', {
    params: [
        {id: 'uri', as: 'string'}
    ],
    type: 'control',
    impl: widget.twoTierWidget(studio.eventTracker(), remote.inspectedWindowFromPanel('%$uri%'))
})

jb.component('inspectedWindow.compCtrl', {
    params: [
        {id: 'uri', as: 'string'},
        {id: 'cmpId', as: 'string'},
    ],
    type: 'control',
    impl: widget.twoTierWidget(studio.compInspector('%$cmpId%'), remote.inspectedWindowFromPanel('%$uri%'))
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

jb.component('chromeDebugger.icon', {
    type: 'button.style',
    params: [
        {id: 'position', as: 'string', defaultValue: '0px 144px'}
    ],
    impl: customStyle({
      template: (cmp,{title},h) => h('div',{onclick: true, title}),
      css: `{ -webkit-mask-image: url(largeIcons.svg); -webkit-mask-position: %$position%; width: 28px;  height: 24px; background-color: var(--jb-menu-fg);}`
    })
})