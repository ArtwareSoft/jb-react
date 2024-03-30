async function initLlh() {
	const jb = await jbLoadPacked({uri:'llh'})
    jbHost.chromeExtV3 = true
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
