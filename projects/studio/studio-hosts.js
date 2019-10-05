(function() {
const st = jb.studio;

const devHost = {
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.split('/').slice(1).join('/'),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) }),
    scriptForLoadLibraries: '<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,material-css"></script>',
    pathToJsFile: (project,fn) => `/projects/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`,
}
//     localhost:8082/hello-world/hello-world.html?studio=localhost =>  localhost:8082/bin/studio/studio-localhost.html?entry=localhost:8082/hello-world/hello-world.html
//     localhost:8082/hello-world/hello-world.html?studio=jb-react@0.3.8 =>  //unpkg.com/jb-react@0.3.8/bin/studio/studio-cloud.html?entry=localhost:8082/hello-world/hello-world.html

const userLocalHost = Object.assign({},devHost,{
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: request.project })) }),
    scriptForLoadLibraries: `  <script type="text/javascript" src="/dist/jb-react-all.js"></script>
<script type="text/javascript" src="/dist/material.js"></script>
<link rel="stylesheet" type="text/css" href="/dist/material.css"/>`,
    pathToJsFile: (project,fn) => fn,
    projectUrlInStudio: project => `/studio-bin/${project}%2F${project}.html/${project}`,
})

const cloudHost = {
    getFile: () => jb.delay(1).then(() => { throw 'Cloud mode - can not save files'}),
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: (request, headers) => {
        jb.studio.previewjb.component(`${request.project}.main`,{
            type: 'control',
            impl: group({
                controls: [button('my button')]
            })
        })
        new jb.jbCtx().run(writeValue('%$studio/project%',request.project))
        new jb.jbCtx().run(writeValue('%$studio/page%','main'))
    },
    scriptForLoadLibraries: ``,
    pathToJsFile: (project,fn) => fn,
    projectUrlInStudio: project => ``,
}

//     fiddle.jshell.net/davidbyd/47m1e2tk/show/?studio =>  //unpkg.com/jb-react/bin/studio/studio-cloud.html?entry=//fiddle.jshell.net/davidbyd/47m1e2tk/show/

st.chooseHostByUrl = entryUrl => {
    if (!entryUrl) return devHost // maybe testHost...
    st.host = entryUrl.match(/localhost:[0-9]*\/project\/studio/) ?
            devHost
        : entryUrl.match(/studio-cloud/) ?
            cloudHost
        : entryUrl.match(/localhost:[0-9]*\/studio-bin/) ?
            userLocalHost
        : devHost
}

function getEntryUrl() {
    const location = jb.frame.location
    return location && new URLSearchParams(location.search).entryUrl || location.href
}
st.chooseHostByUrl(getEntryUrl())

function extractText(str,startMarker,endMarker) {
    const pos1 = str.indexOf(startMarker), pos2 = str.indexOf(endMarker)
    if (pos1 == -1 || pos2 == -1) return ''
    return str.slice(pos1 + startMarker.length ,pos2)
}

st.projectHosts = {
    jsFiddle : {
        fetchProject(jsFiddleid) {
            // return fetch(`http://fiddle.jshell.net/${jsFiddleid}/show/light/`, {"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3","accept-language":"en-US,en;q=0.9,he;q=0.8","if-none-match":"W/\"687187bf32e53d557fac8cc441202525\"","upgrade-insecure-requests":"1"},"referrer":`http://fiddle.jshell.net/${jsFiddleid}/show/light/`,
            //     "referrerPolicy":"strict-origin-when-cross-origin","body":null,"method":"GET","mode":"no-cors"})
            return fetch(jb.urlProxy + `http://jsfiddle.net/${jsFiddleid}`,)
            .catch(e => console.log(e))
            .then(r => r.text())
            .then(content=>{
                const str = (''+content).replace(/\\n/g,'\n').replace(/\\/g,'')
                //const all = extractText(str,'var EditorConfig =','fiddle: {')
                const json = extractText(str,'values: {','fiddle: {')
                const html = extractText(json,'html: "','js:   "').trim().slice(0,-2)
                const js = extractText(json,'js:   "','css:  "').trim().slice(0,-2)
                //const js = '(function()' + extractText(str,' window.onload=function()','//]]></script>') + ')()'
                if (html)
                    st.projectFiles = { html, js: [js], css: [] }
            })
        }
    }
}

})()