jb.ns('widget,studio')

jb.chromeDebugger = {
    initPanel(id, panelFrame) { // use counter on inpsectedWin to support debugger refresh 
        return this.evalAsPromise('(self.jbPanelCounter = (self.jbPanelCounter || 1) +1)')
            .then(counter=> {
                const fullId = `${id}-${counter}`
                // support inpsectedWin refresh - 'inspectedCreated' is re-sent on content-script initializtion
                chrome.runtime.onMessage.addListener(req => req == 'inspectedCreated' && this.doInitPanel(fullId,panelFrame))
                return this.doInitPanel(fullId, panelFrame)
            })
    },
    doInitPanel(id, panelFrame) {
        console.log('init panel',id,panelFrame)
        panelFrame.uri = `debugPanel-${id}`
        const jb = panelFrame.jb
        panelFrame.inspectedPorts = panelFrame.inspectedPorts || {}
        jb.cbLogByPath = {}
        jb.initSpy({spyParam: 'all'})
        panelFrame.spy = jb.spy
        jb.log('chromeDebugger init panel',{id, panelFrame})

        return this.hasStudioOnInspected()
            .then(res => {
                if (!res)
                    this.initIframeOnInspectedWindow()
                return this.waitFor('studio on inspectedWin',() => this.hasStudioOnInspected(),300,20)
            }).then(()=> {
                this.initStudioDebugPort(panelFrame)
                this.initPanelPortListenser(panelFrame)
                this.inspectedWindowRequestToConnectToPanel(panelFrame)
                return this.waitFor('port to inspectedWin',() => self.inspectedPorts[panelFrame.uri],50,50)
            })
            .then(()=> { panelFrame.document.body.innerHTML=''; this.renderOnPanel(panelFrame) })
            .catch(e => jb.logException(e,`chromeDebugger panel ${panelFrame.uri} wait for ${e}`))
    },
    initPanelPortListenser(panelFrame) {
        panelFrame.chrome.runtime.onConnect.addListener(port => {
            jb.log('chromeDebugger panel on connect',{port})
            if (port.name != 'jbDebugger') return
            if (panelFrame.inspectedPorts[panelFrame.uri]) return

            const panelToInspectWindowPort = panelFrame.inspectedPorts[panelFrame.uri] = {
                from: panelFrame.uri,
                to: 'inspectedWindow',
                postMessage: m => { 
                    jb.log(`chromeDebugger sent from ${panelFrame.uri} to inspectedWindow`,{m,panelFrame})
                    panelFrame.inspectedPorts[panelFrame.uri] && port.postMessage({from: panelFrame.uri, to: 'inspectedWindow', ...m}) 
                },
                onMessage: { addListener : handler => { 
                    jb.log('chromeDebugger addEventListener',{port,handler})
                    port.onMessage.addListener(m => {
                        jb.log(`chromeDebugger received from ${m.from} to ${m.to} at ${panelFrame.uri}`,{m,panelFrame})
                        m.to == panelFrame.uri && handler(m)
                    })
                }}            
            }
            jb.remote.extendPortWithCbHandler(panelToInspectWindowPort).initCommandListener()
            port.onMessage.addListener(m => m.runProfile && jb.exec(m.runProfile))

            port.onDisconnect.addListener(() => {
                jb.log(`inspectedWindow port disconnected from panel at ${panelFrame.uri}`,{panelFrame})
                delete panelFrame.inspectedPorts[panelFrame.uri]
            })
        })
    },
    renderOnPanel(panelFrame) {
        jb.log(`chromeDebugger panel start logsCtrl ${panelFrame.uri}`)
        const profile = {$: 'inspectedWindow.logsCtrl', panel: panelFrame.uri}
        jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().run(profile)),panelFrame.document.body)
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => 
            chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    inspectedWindowRequestToConnectToPanel(panelFrame) {
        return this.evalAsPromise(`postMessage({$: 'connectToPanel', 
            from: 'inspectedWindow', to: '${panelFrame.uri}' , panelUri: '${panelFrame.uri}' }) `)
    },
    initStudioDebugPort(panelFrame) {
        return this.evalAsPromise(`jb.remote.cbPortFromFrame(self.jbStudio,'studio','${panelFrame.uri}')`)
    },
    hasStudioOnInspected() {
        return this.evalAsPromise('self.jbStudio != null')
    },
    initIframeOnInspectedWindow() {
        function initFrameForChromeDebugger() {
            if (self.jbStudio) return
            const html = `<!DOCTYPE html>
            <html>
            <head>
                <script type="text/javascript" src="/bin/studio/studio-all.js"></script>
                    <script>
                    jb.cbLogByPath = {};
                    jb.initSpy({spyParam: jb.path(parent,'jb.spy.spyParam') || 'remote,chromeDebugger,headless,dialog'});
                    spy = jb.spy;
                    parent.jbStudio = self
                </script>
            </head>`
            const iframe = document.createElement('iframe')
            iframe.id = 'jBartHelper'
            iframe.style.display = 'none'
            iframe.src = 'javascript: this.document.write(`' + html +'`)'
            document.body.appendChild(iframe)
        }
        jb.log('chromeDebugger initFrameForChromeDebugger',{code: initFrameForChromeDebugger.toString()})
        return this.evalAsPromise(`(${initFrameForChromeDebugger.toString()})()`)
    },
    waitFor(description, checkPromise ,interval,times) {
        let count = 0
        return new Promise((resolve,reject) => {
            const toRelease = setInterval(() => {
                count++
                jb.log(`chromeDebugger waitFor ${description}`,{count,checkPromise})
                if (count >= times) {
                    clearInterval(toRelease)
                    reject(description + ' timeout')
                }
                Promise.resolve(checkPromise()).then(v => { if (v) { clearInterval(toRelease); resolve(v) } })
            }, interval)
        })
    },
}

jb.component('remote.inspectedWindowFromPanel', {
    type: 'remote',
    params: [
        {id: 'panel', as: 'string'}
    ],    
    impl: (ctx,panel) => self.inspectedPorts[panel]
})

jb.component('inspectedWindow.logsCtrl', {
    params: [
        {id: 'panel', as: 'string'}
    ],
    type: 'control',
    impl: widget.twoTierWidget(studio.eventTracker(), remote.inspectedWindowFromPanel('%$panel%'))
})

jb.component('chromeDebugger.openResource', {
    type: 'action',
    params: [
        {id: 'location', as: 'array', description: 'file,line,col'}
    ],
    impl: (ctx,loc) => {
        console.log('loc',loc)
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