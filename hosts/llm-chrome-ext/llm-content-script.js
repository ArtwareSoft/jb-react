async function initLLMHelper() {
    const res = await fetch('http://localhost:8082/plugins/loader/jb-loader.js')
    const code = await res.text()
    await eval(code)
	const sourceCode = { plugins: ['net']}
	const jb = await jbInit('llmHelper',sourceCode, {baseUrl: 'http://localhost:8082'})
    console.log(jb.exec('jb initialized','data<>'), jb.sourceCode)
    await jb.exec({$: 'jbm.start' , jbm: {$:'router' }}, 'action<>')
    console.log('connected to router', jb.jbm.networkPeers.router)
}

initLLMHelper()