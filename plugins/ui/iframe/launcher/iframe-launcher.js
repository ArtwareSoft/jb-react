using('loader')

extension('iframe','inIframe', {
    renderWidgetInIframe({id, profile, el, sourceCode, htmlAtts, baseUrl} = {}) {
        baseUrl = baseUrl || 'http://localhost:8082'
        const _plugins = sourceCode && sourceCode.plugins || jb.loader.pluginsOfProfile(profile)
        const plugins = jb.utils.unique(_plugins)
        const html = `<!DOCTYPE html>
<html ${htmlAtts}>
<head>
    <meta charset="UTF-8">
    <!-- 
    <script type="text/javascript" src="${baseUrl}/plugins/loader/jb-loader.js"></script>
    <script type="text/javascript" src="${baseUrl}/package/${plugins.join(',')}.js"></script>
    <link rel="stylesheet" type="text/css" href="${baseUrl}/dist/css/styles.css"/>
    -->
    <style>
        html, body {
            height: 100%; /* Set height for html and body */
            margin: 0; /* Remove default margin */
        }
    </style>    
</head>
<body>
    <div id="main"></div>
    <script>
    ;(async () => {
        let res = await fetch('${baseUrl}/plugins/loader/jb-loader.js')
        await eval(await res.text())
        jbHost.baseUrl = "${baseUrl}";
        document.iframeId = "${id}"
        res = await fetch('${baseUrl}/package/${plugins.join(',')}.js')
        await eval(await res.text())
    
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
        iframe.setAttribute('style', 'position: fixed;border: none;z-index:5000')
        iframe.setAttribute('frameBorder', '0')
        if (jbHost.chromeExtV3) {
          iframe.src = chrome.runtime.getURL('iframe.html')  
        } else {
          iframe.src = 'about:blank'
          iframe.onload = () => {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              iframeDocument.open();
              iframeDocument.write(html);
              iframeDocument.close();
          }
        }
        window.addEventListener('message', ev => {
          if (ev.data && ev.data.$ == 'getInfo') {
            iframe.contentWindow.postMessage({$: 'parentInfo', height: window.innerHeight, width: window.innerWidth, domain: document.domain}, ev.data.origin)
          } else if (ev.data && ev.data.$ == 'setIframeRect') {
            let {top, left, width, height} =  ev.data
            height != null && (iframe.style.height = height +'px');
            width != null && (iframe.style.width = width +'px');
            top != null && (iframe.style.top = top + 'px');
            left != null && (iframe.style.left = left +'px');
          }
        })
        const res = new Promise(resolve => window.addEventListener('message', ev => (ev.data == 'jbart is up') && resolve()))
        document.body.prepend(iframe)
        return res
    }
})

component('renderWidgetInIframe', {
  type: 'action',
  params: [
    {id: 'profile', byName: true},
    {id: 'selector', as: 'string', defaultValue: 'body'},
    {id: 'id', as: 'string', defaultValue: 'main'},
    {id: 'sourceCode', type: 'source-code<loader>'},
    {id: 'htmlAtts', as: 'string', defaultValue: 'style="font-size:12px"'}
  ],
  impl: (ctx, profile, selector, id) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidgetInIframe can not find element for selector', { selector })
    return jb.iframe.renderWidgetInIframe({id, profile, el, ...ctx.params})
  }
})
