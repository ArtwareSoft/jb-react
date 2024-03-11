using('ui-core')

extension('ui','inIframe', {
    renderDialogInIframe(id, profile, el, sourceCode, baseUrl = 'http://localhost:8082') {
        const _plugins = sourceCode && sourceCode.plugins || jb.loader.pluginsOfProfile(profile)
        const plugins = jb.utils.unique([..._plugins,'tree-shake'])
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="${baseUrl}/plugins/loader/jb-loader.js"></script>
    <script type="text/javascript" src="${baseUrl}/package/${plugins.join(',')}.js?noSourceMaps=true"></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/dist/css/styles.css"/>
    <style>
        html, body {
            height: 100%; /* Set height for html and body */
            margin: 0; /* Remove default margin */
        }
    </style>    
</head>
<body>
    <div id="main" class="autoResizeInDialog11"></div>
    <script>
    jbHost.baseUrl = "${baseUrl}";
    document.iframeId = "${id}"
    ;(async () => {
        globalThis.jb = await jbLoadPacked("${id}");
        jb.baseUrl = "${baseUrl}";
        const ctx = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx());
        console.log('profile',${JSON.stringify(profile)})
        const vdom = await ctx.run(${JSON.stringify(profile)},'control<>');
        console.log('vdom',vdom)
        await jb.ui.render(jb.ui.h(vdom), main, { ctx });
        window.parent.postMessage('jbart is up', '*');
    })()
    </script>

</body>
</html>`
        const iframe = document.createElement('iframe')
        iframe.setAttribute('id',id)
        iframe.setAttribute('sandbox', 'allow-same-origin allow-forms allow-scripts')
        iframe.setAttribute('style', 'position: fixed;border: none')
        iframe.setAttribute('frameBorder', '0')        
        iframe.src = 'about:blank'
        iframe.onload = () => {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.open();
            iframeDocument.write(html);
            iframeDocument.close();
        }
        const res = new Promise(resolve => window.addEventListener('message', ev => (ev.data == 'jbart is up') && resolve()))
        document.body.prepend(iframe)
        return res
    }
})

component('renderDialogInIframe', {
  type: 'action',
  params: [
    {id: 'dialog', type: 'control', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'body'},
    {id: 'id', as: 'string', defaultValue: 'main'},
    {id: 'sourceCode', type: 'source-code<loader>'},
  ],
  impl: (ctx, control, selector, id, sourceCode) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidget can not find element for selector', { selector })
    return jb.ui.renderDialogInIframe(id, control.profile, el, sourceCode)
  }
})
