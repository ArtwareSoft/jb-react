jb.ns('widget,studio')

jb.chromeDebugger = {
    initPanel(id, panelFrame) {
        return this.evalAsPromise('(self.jbPanelCounter = (self.jbPanelCounter || 1) +1)')
            .then(counter=> this.doInitPanel(`${id}-${counter}`, panelFrame))
    },
    doInitPanel(id, panelFrame) {
        chrome.runtime.onMessage.addListener((request, sender) => console.log('on message',request, sender))

        console.log('init panel',id,panelFrame)
        panelFrame.uri = `debugPanel-${id}`
        const jb = panelFrame.jb
        panelFrame.remoteInspectedWindow = panelFrame.remoteInspectedWindow || {}
        jb.cbLogByPath = {}
        jb.initSpy({spyParam: 'all'})
        panelFrame.spy = jb.spy
        jb.log('chromeDebugger init panel',{id, panelFrame})

        this.isIframeInitialized().then(res => {
            const firstTime = !res
            if (res)
                jb.log(`chromeDebugger panel ${panelFrame.uri} inspectedWindow iframe is already initialized`)

            panelFrame.chrome.runtime.onConnect.addListener(port => {
                jb.log('chromeDebugger panel on connect',{port})
                if (port.name != 'jbDebugger') return
                if (panelFrame.remoteInspectedWindow[panelFrame.uri]) return

                const remote = panelFrame.remoteInspectedWindow[panelFrame.uri] = {
                    uri: panelFrame.uri,
                    postObj: m => { 
                        jb.log(`chromeDebugger sent from ${panelFrame.uri} to inspectedWindow`,{m,panelFrame})
                        panelFrame.remoteInspectedWindow[panelFrame.uri] && port.postMessage({from: panelFrame.uri,...m}) 
                    },
                    addEventListener: (ev,handler) => { 
                        jb.log('chromeDebugger addEventListener',{port,handler})
                        port.onMessage.addListener(m => {
                            jb.log(`chromeDebugger received from ${m.from} to ${m.to} at ${panelFrame.uri}`,{m,panelFrame})
                            m.to == panelFrame.uri && handler({data: m})
                        })
                    }            
                }
                remote.CBHandler = jb.remoteCBHandler(remote).initCommandListener()
                port.onDisconnect.addListener(() => {
                    jb.log(`inspectedWindow port disconnected from panel at ${panelFrame.uri}`,{panelFrame})
                    delete panelFrame.remoteInspectedWindow[panelFrame.uri]
                })
            })
            return Promise.resolve()
                .then(()=> firstTime && this.initIframeOnInspectedWindow())
                .then(() => this.waitFor(() => this.isIframeInitialized(),50,50))
                .catch(e => jb.logException(e,`chromeDebugger panel ${self.uri} wait for frame failed`))
                .then(()=> this.inspectedWindowRequestToConnectToPanel(panelFrame))
                .then(() => this.waitFor(() => self.remoteInspectedWindow[panelFrame.uri],50,50))
                .catch(e => jb.logException(e,`chromeDebugger panel ${self.uri} wait for remote port failed`))
                .then(()=> this.renderOnPanel(panelFrame))
       })
    },
    renderOnPanel(panelFrame) {
        jb.log('chromeDebugger panel start logsCtrl',{id})
        const profile = {$: 'inspectedWindow.logsCtrl', panel: panelFrame.uri}
        jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().run(profile)),panelFrame.document.body)
    },
    evalAsPromise(code) {
        return new Promise( (resolve,rej) => 
            chrome.devtools.inspectedWindow.eval(code,(res,err) => err ? rej(err) : resolve(res)))
    },
    isIframeInitialized() {
        return this.evalAsPromise('self.jbStudioIframe')
    },
    inspectedWindowRequestToConnectToPanel(panelFrame) {
        return this.evalAsPromise(`postMessage({$: 'connectToPanel', from: 'inspectedWindow', panelUri: '${panelFrame.uri}' }) `)
    },
    initIframeOnInspectedWindow() {
        function createIframe() {
            if (self.jbStudioIframe) return
            const html = `<!DOCTYPE html>
            <html>
            <head>
                <script type="text/javascript" src="/bin/studio/studio-all.js"></script>
                    <script>
                    jb.cbLogByPath = {};
                    jb.initSpy({spyParam: 'remote,chromeDebugger,headless'});
                    spy = jb.spy;
                    const remoteInterface = {
                        postObj: m => { 
                            jb.log('remote chromeDebugger from inspectedWindow',{m});
                            parent.postMessage({from: 'inspectedWindow',...m}) 
                        },
                        addEventListener: (ev,handler) => parent.addEventListener('message', m => {
                            jb.log('chromeDebugger remote to inspectedWindow',{m,parent,self,source: m.source});
                            m.source == parent && m.data.to == 'inspectedWindow' && handler(m)  
                        })
                    };
                    console.log('inspectedWindow iframe before initPreview');
                    jb.studio.initPreview(parent,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
                    console.log('inspectedWindow iframe before initCommandListener');
                    jb.remoteCBHandler(remoteInterface).initCommandListener();
                </script>
            </head>`
            const iframe = self.jbStudioIframe = document.createElement('iframe')
            iframe.id = 'jBartHelper'
            iframe.style.display = 'none'
            iframe.src = 'javascript: this.document.write(`' + html +'`)'
            document.body.appendChild(iframe)
        }
        jb.log('chromeDebugger init iframe',{code: createIframe.toString()})
        return this.evalAsPromise(`(${createIframe.toString()})()`)
    },
    waitFor(checkPromise ,interval,times) {
        let count = 0
        return new Promise((resolve,reject) => {
            const toRelease = setInterval(() => {
                count++
                jb.log('chromeDebugger waitFor',{count,checkPromise})
                if (count >= times) {
                    clearInterval(toRelease)
                    reject('timeout')
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
    impl: (ctx,panel) => self.remoteInspectedWindow[panel]
})

jb.component('inspectedWindow.logsCtrl', {
    params: [
        {id: 'panel', as: 'string'}
    ],
    type: 'control',
    impl: widget.twoTierWidget(studio.eventTracker(), remote.inspectedWindowFromPanel('%$panel%'))
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