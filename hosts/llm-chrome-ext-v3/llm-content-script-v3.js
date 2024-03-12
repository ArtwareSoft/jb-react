async function initLLMHelper() {
	const jb = await jbLoadPacked({uri:'llmHelper'})
    jbHost.chromeExtV3 = true
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
}

initLLMHelper()
