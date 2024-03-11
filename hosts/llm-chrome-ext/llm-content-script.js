async function initLLMHelper() {
    const res = await fetch('http://localhost:8082/plugins/loader/jb-loader.js')
    await eval(await res.text())
	const launcherSourceCode = { plugins: ['ui-iframe-launcher']}
	const jb = await jbInit('llmHelper', launcherSourceCode, {baseUrl: 'http://localhost:8082'})
    jb.exec({
        "$": "renderWidgetInIframe",
        "profile": () => ({
            "$": "inPlaceDialog",
            "$$": "control<>inPlaceDialog",
            "title": "LLM Helper",
            "content": {
                "$": "llm.docHelper",
                "$$": "control<>llm.docHelper",
                "doc": "%$llmDocExample%"
            },
            "style": {
                "$": "inIframe.Floating",
                "$$": "dialog-style<>inIframe.Floating",
                "id": "helper",
                "width": "460",
                "height": "600"
            }
        }),
        "sourceCode": {
            "$": "plugins",
            "$$": "source-code<loader>plugins",
            "plugins": "llm"
        }
    })
	// const jb = await jbInit('llmHelper',sourceCode, {baseUrl: 'http://localhost:8082'})
    // console.log(jb.exec('jb initialized','data<>'), jb.sourceCode)
    //await jb.exec({$: 'jbm.start' , jbm: {$:'router' }})
    //console.log('connected to router', jb.jbm.networkPeers.router)
    // jb.baseUrl = 'http://localhost:8082'
    // jb.exec({$: 'localHelper.init'})

    //const ctx = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx())

    //ctx.runAction({$: 'localHelper.openHelperDialog'})
}

initLLMHelper()

// async function aa() { console.log('aa')}

// const script = document.createElement('script');
// script.textContent = '(' + initLLMHelper + ')();';
// (document.head||document.documentElement).appendChild(script);
//script.remove();
