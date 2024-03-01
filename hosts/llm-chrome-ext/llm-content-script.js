async function initLLMHelper() {
    const res = await fetch('http://localhost:8082/plugins/loader/jb-loader.js')
    await eval(await res.text())
	const sourceCode = { plugins: ['net', 'llm']}
	const jb = await jbInit('llmHelper',sourceCode, {baseUrl: 'http://localhost:8082'})
    console.log(jb.exec('jb initialized','data<>'), jb.sourceCode)
    await jb.exec({$: 'jbm.start' , jbm: {$:'router' }}, 'action<>')
    console.log('connected to router', jb.jbm.networkPeers.router)
}

initLLMHelper()

// async function aa() { console.log('aa')}

// const script = document.createElement('script');
// script.textContent = '(' + initLLMHelper + ')();';
// (document.head||document.documentElement).appendChild(script);
//script.remove();
