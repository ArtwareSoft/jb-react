async function initLlh() {
    const res = await fetch('http://localhost:8082/plugins/loader/jb-loader.js')
    await eval(await res.text())
	const launcherSourceCode = { plugins: ['ui-iframe-launcher']}
	const jb = await jbInit('llh', launcherSourceCode, {baseUrl: 'http://localhost:8082'})
    jb.exec({
        "$": "renderWidgetInIframe",
        "profile": () => ({
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
        }),
        "sourceCode": {
            "$": "plugins",
            "$$": "source-code<loader>plugins",
            "plugins": "llm"
        }
    })
}

initLlh()

