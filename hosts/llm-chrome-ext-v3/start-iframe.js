(async () => {
    function chromeExtV3() { 
        return {
          _fetch(path) { 
            const hasBase = path && path.match(/\/\//)
            return fetch(hasBase ? path: jbHost.baseUrl + path, fetchOptions) 
          },
          fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
          fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
          loadLib(path) { 
            return new Promise(resolve=>{
                const script = document.createElement('script')
                script.src = chrome.runtime.getURL(path)
                script.onload = resolve
                script.onerror = resolve
                document.body.appendChild(script)
            })
          },
          loadFELib(lib) {
            return new Promise(resolve=> {
                const url = chrome.runtime.getURL(`/dist/${lib}`)
                if (lib.match(/js$/)) {
                    const script = document.createElement('script')
                    script.src = url
                    script.onload = resolve
                    script.onerror = resolve
                    document.body.appendChild(script)
                } else if (lib.match(/css$/)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.href = url;
                    link.onload = () => { console.log('loading lib',lib); resolve() }
                    link.onerror = e => { console.log('error loading lib',lib,e); resolve() }
                    document.head.appendChild(link)
              } else if (lib.match(/woff2$/)) {
                    const [fontName,_lib] = lib.split(':')
                    const url = chrome.runtime.getURL(`/dist/${_lib}`)
                    const fontFace = `
                    @font-face {
                        font-family: '${fontName}';
                        src: url("${url}") format('woff2');
                    }`;
            
                    const style = document.createElement('style');
                    style.textContent = fontFace;
                    style.onload = () => { console.log('loading font',lib); resolve() }
                    style.onerror = e => { console.log('error loading font',lib,e); resolve() }
                    document.head.appendChild(style);    
                }})
            }
        }
    }

    globalThis.jbHost = { // browserHost - studioServer,worker and static
        fetch: (...args) => globalThis.fetch(...args),
        baseUrl: '',
        fetchOptions: {},
        log(...args) { console.log (...args) },
        codePackageFromJson() {
            return chromeExtV3()
        },
        loadFELib: chromeExtV3().loadFELib
    }          
    document.iframeId = "main"
    globalThis.jb = await jbLoadPacked("main");
    jb.baseUrl = "";
    const ctx = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx());
    const vdom = await ctx.run({
        "$": "inPlaceDialog",
        "$$": "control<>inPlaceDialog",
        "title": "LLM Helper",
        "content": {
            "$": "llm.main",
            "$$": "control<>llm.main",
            "doc": "%$helperDoc%"
        },
        "style": {
            "$": "inIframe.Floating",
            "$$": "dialog-style<>inIframe.Floating",
            "id": "helper",
            "width": "460",
            "height": "600"
        }
    },'control<>');
    await jb.ui.render(jb.ui.h(vdom), main, { ctx });
    window.parent.postMessage('jbart is up', '*');
})()