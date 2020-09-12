jb.ns('widget,studio')

jb.chromeDebugger = {
    initPanel(id, panelFrame) {
        panelFrame.uri = `debugPanel:${id}`
        const jb = panelFrame.jb
        jb.cbLogByPath = {}
        jb.initSpy({spyParam: 'all'})
        panelFrame.spy = jb.spy
        jb.log('chromeDebugger init panel',[id, panelFrame])

        this.isIframeInitialized().then(res => !res && this.initIframeOnInspectedWindow())

        panelFrame.chrome.runtime.onConnect.addListener(port => {
            jb.log('chromeDebugger on connect',[port])
            if (port.name != 'jbDebugger') return
            self.remoteInspectedWindow = {}
            const remote = self.remoteInspectedWindow[panelFrame.uri] = {
                postObj: m => { 
                    jb.log(`chromeDebugger sent from ${self.uri} to inspectedWindow`,[m,self]); 
                    port.postMessage({from: self.uri,...m}) 
                },
                addEventListener: (ev,handler) => { 
                    jb.log('chromeDebugger addEventListener',[port,handler])
                    port.onMessage.addListener(m => {
                        jb.log(`chromeDebugger received from ${m.from} to ${m.to} at ${self.uri}`,[m,self])
                        m.to == self.uri && handler({data: m})
                    })
                },            
            }
            remote.CBHandler = jb.remoteCBHandler(remote).initCommandListener()
        })
        return this.waitFor(() => this.isIframeInitialized(),50,50).then(()=> {
            jb.log('chromeDebugger start passThrough',[id])
            chrome.tabs.executeScript({file: 'pass-through-content-script.js'})
            return this.waitFor(() => self.remoteInspectedWindow[panelFrame.uri],50,50)
                .then(() => this.renderOnPanel(panelFrame))
        })
    },
    renderOnPanel(panelFrame) {
        jb.log('chromeDebugger start logsCtrl',[id])
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
                            jb.log('remote chromeDebugger from inspectedWindow',[m]);
                            parent.postMessage({from: 'inspectedWindow',...m}) 
                        },
                        addEventListener: (ev,handler) => parent.addEventListener('message', m => {
                            jb.log('chromeDebugger remote to inspectedWindow',[m,parent,self,m.source]);
                            m.source == parent && m.data.to == 'inspectedWindow' && handler(m)  
                        })
                    };
                    jb.studio.initPreview(parent,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
                    jb.remoteCBHandler(remoteInterface).initCommandListener();
                </script>
            </head>`
            const iframe = self.jbStudioIframe = document.createElement('iframe')
            iframe.id = 'jBartHelper'
            iframe.style.display = 'none'
            iframe.src = 'javascript: this.document.write(`' + html +'`)'
            document.body.appendChild(iframe)
        }
        jb.log('chromeDebugger init iframe',[createIframe.toString()])
        return this.evalAsPromise(`(${createIframe.toString()})()`)
    },
    waitFor(checkPromise ,interval,times) {
        let count = 0
        return new Promise((resolve,reject) => {
            const toRelease = setInterval(() => {
                count++
                jb.log('chromeDebugger waitFor',[count,checkPromise])
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

jb.component('chrome.icon', {
    type: 'button.style',
    params: [
        {id: 'position', as: 'string', defaultValue: '0px 144px'}
    ],
    impl: customStyle({
      template: (cmp,{title},h) => h('div',{onclick: true }, title),
      css: `{ -webkit-mask-image: url(largeIcons.svg); --spritesheet-position: %$position%; width: 28px;  height: 24px;}`
    })
})