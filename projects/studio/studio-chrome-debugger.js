jb.ns('widget,studio')

jb.chromeDebugger = {
    initPanel(id, panelFrame) { // use counter on inpsectedWin to support debugger refresh 
        return this.evalAsPromise('(self.jbPanelCounter = (self.jbPanelCounter || 1) +1)')
            .then(counter=> {
                const fullId = `${id}-${counter}`
                // support inpsectedWin refresh - 'inspectedCreated' is re-sent on content-script initializtion
                chrome.runtime.onMessage.addListener(req => {
                    if (req == 'inspectedCreated') {
                        jb.log(`chromeDebugger re-initializing panel ${id} after content script reloading`,{})
                        this.doInitPanel(id,fullId,panelFrame)
                    }
                })
                return this.doInitPanel(id,fullId, panelFrame)
            })
    },
    doInitPanel(id, fullId, panelFrame) {
        panelFrame.panelId = id
        panelFrame.uri = `debugPanel-${fullId}`
        const jb = panelFrame.jb
        if (!panelFrame.inspectedPorts) {
            panelFrame.inspectedPorts = {}
            jb.cbLogByPath = {}
            jb.initSpy({spyParam: 'all'})
            panelFrame.spy = jb.spy
            jb.log('chromeDebugger init panel',{fullId, panelFrame})
        } else {
            jb.log('chromeDebugger re-init panel',{fullId, panelFrame})
        }

        return this.hasStudioOnInspected()
            .then(res => {
                if (!res)
                    id == 'card' ? this.initIframeOnUnknownInspectedWindow(panelFrame) : this.initIframeOnjBartInspectedWindow(panelFrame)
                return this.reCheckPromise('studio on inspectedWin',() => this.hasStudioOnInspected(),300,20)
            }).then(()=> {
                this.initStudioDebugPort(panelFrame)
                this.initPanelPortListenser(panelFrame)
                this.inspectedWindowRequestToConnectToPanel(panelFrame)
                return this.reCheckPromise('port to inspectedWin',() => self.inspectedPorts[panelFrame.uri],50,50)
            })
            .then(()=> { 
                //panelFrame.document.body.innerHTML=''; 
                this.FECtrl = this.renderOnPanel(panelFrame,id) 
            })
            .catch(e => jb.logException(e,`chromeDebugger panel ${panelFrame.uri} wait for ${e}`))
    },
    initPanelPortListenser(panelFrame) {
        panelFrame.chrome.runtime.onConnect.addListener(port => {
            jb.log('chromeDebugger panel on connect',{port})
            if (port.name != 'jbDebugger') return
            if (panelFrame.inspectedPorts[panelFrame.uri]) {
                jb.ui.unmount(panelFrame.document.body)
                panelFrame.document.body.innerHTML=''
                jb.log(`chromeDebugger widget cleanup ${panelFrame.uri}`,{panelFrame})
                delete panelFrame.inspectedPorts[panelFrame.uri]
            }

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

            port.onDisconnect.addListener(() => {})
        })
    },
    async renderOnPanel(panelFrame,panelId) {
        const uri = panelFrame.uri
        jb.log(`chromeDebugger panel starting ${panelId}Ctrl ${uri}`)
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
        const profile = {$: `inspectedWindow.${panelId}Ctrl`, inspectedProps, uri}
        jb.log(`chromeDebugger renderOnPanel firstRun ${panelId}`,{profile,inspectedProps, uri,panelFrame})
        jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().setVar('$studio',true).run(profile)),panelFrame.document.body)
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => 
            chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    inspectedWindowRequestToConnectToPanel(panelFrame) {
        return this.evalAsPromise(`postMessage({$: 'connectToPanel', 
            from: 'inspectedStudio', to: '${panelFrame.uri}' , panelUri: '${panelFrame.uri}' }) `)
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
                frameUri: [self,...Array.from(frames)].filter(x=>x.document == $0.ownerDocument).map(x=>x.jbUri)[0]
            } : {}
        }
        await this.markSelected()
        return this.evalAsPromise(`(${buildPropsObj.toString()})()`)
    },    
    initStudioDebugPort(panelFrame) {
        return this.evalAsPromise(`self.jbStudioDebugPort = self.jbStudioDebugPort || jb.remote.cbPortFromFrame(self,'inspectedStudio','${panelFrame.uri}')`)
    },
    hasStudioOnInspected() {
        return this.evalAsPromise('console.log("checkStudio",self,self.jbUri,self.jbStudioDebugPort);self.jbUri == "studio" || self.jbStudioDebugPort != null')
    },
    initIframeOnjBartInspectedWindow(panelFrame) {
        function initFrameForChromeDebugger(uri) {
            if (self.jbUri == 'studio') return
            const html = `<!DOCTYPE html>
            <html>
            <body>
                <script type="text/javascript" src="/bin/studio/studio-all.js"></script>
                <script>
                jb.cbLogByPath = {};
                jb.initSpy({spyParam: jb.path(parent,'jb.spy.spyParam') || 'remote,chromeDebugger,headless,dialog'});
                spy = jb.spy;
                jb.studio.initPreview(parent,[parent.Object.prototype,parent.Array.prototype]);
                self.jbUri = 'injectedStudio';
                parent.jbStudioDebugPort = jb.remote.cbPortFromFrame(self.parent,'inspectedStudio','${uri}');
                </script>
            </body>`
            const iframe = document.createElement('iframe')
            iframe.id = 'jBartHelper'
            iframe.style.display = 'none'
            iframe.src = 'javascript: this.document.write(`' + html +'`)'
            document.body.appendChild(iframe)
        }
        jb.log('chromeDebugger init studioIframe',{code: initFrameForChromeDebugger.toString()})
        return this.evalAsPromise(`(${initFrameForChromeDebugger.toString()})('${panelFrame.uri}')`)
    },
    initIframeOnUnknownInspectedWindow(panelFrame) {
        function initFrameForChromeDebugger(uri) {
            const urlPrefix = 'http://localhost:8082' // TBD: use internet url
            const html = `<!DOCTYPE html>
            <html>
            <body>
            <script>
            </script>
            <script type="text/javascript" src="${urlPrefix}/bin/studio/studio-all.js"></script>
            <script>
                console.log('start init iframe',jb);
                jb.cbLogByPath = {};
                jb.initSpy({spyParam: jb.path(parent,'jb.spy.spyParam') || 'remote,chromeDebugger,headless,uiComp'});
                spy = jb.spy;
                parent.jbStudioDebugPort = jb.remote.cbPortFromFrame(parent,'inspectedStudio','${uri}');
                console.log('end init iframe','${uri}',parent.jbStudioDebugPort);
                self.jbUri = 'injectedStudio';
            </script>
            </body>`
            self.jbFrames = self.jbFrames || []
            self.jbFrames.forEach(fr=>document.body.removeChild(fr))

            const iframe = document.createElement('iframe')
            self.jbFrames.push(iframe)
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
    impl: group({
        controls: widget.twoTierWidget(studio.eventTracker(), remote.inspectedWindowFromPanel('%$uri%')),
        features: id('%$uri%')
    })
})

jb.component('inspectedWindow.compCtrl', {
    params: [
        {id: 'uri', as: 'string'},
        {id: 'inspectedProps'},
    ],
    type: 'control',
    impl: widget.twoTierWidget(studio.compInspector('%$inspectedProps%'), remote.inspectedWindowFromPanel('%$uri%'))
})

jb.component('inspectedWindow.cardCtrl', {
    params: [
        {id: 'uri', as: 'string'},
    ],
    type: 'control',
    impl: widget.twoTierWidget( studio.cardExtraction(),remote.inspectedWindowFromPanel('%$uri%'))
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

jb.component('chromeDebugger.refreshAfterSelection', {
    type: 'feature',
    impl: method('refreshAfterDebuggerSelection', runActions(
        () => {
            const sorted = Array.from(parent.document.querySelectorAll('[jb-selected-by-debugger]'))
                .sort((x,y) => (+y.getAttribute('jb-selected-by-debugger')) - (+x.getAttribute('jb-selected-by-debugger')))
            sorted.slice(1).forEach(el=>el.removeAttribute('jb-selected-by-debugger'))
        },
        action.refreshCmp('%%')
    )),
})
