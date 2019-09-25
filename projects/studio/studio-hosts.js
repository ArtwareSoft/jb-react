(function() {
const st = jb.studio;

const devHost = {
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.split('/').slice(1).join('/'),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile&path=${path}`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    createProjectOld: (request, headers) => fetch('/?op=createProject',{method: 'POST', headers, body: JSON.stringify(request) }),
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) }),
    scriptForLoadLibraries: '<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,material-css"></script>',
    pathToJsFile: (project,fn) => `/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`
}
//     localhost:8082/hello-world/hello-world.html?studio=localhost =>  localhost:8082/bin/studio/studio-localhost.html?entry=localhost:8082/hello-world/hello-world.html
//     localhost:8082/hello-world/hello-world.html?studio=jb-react@0.3.8 =>  //unpkg.com/jbart5-react@0.3.8/bin/studio/studio-cloud.html?entry=localhost:8082/hello-world/hello-world.html

userLocalHost = Object.assign({},devHost,{
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: request.project })) }),
    scriptForLoadLibraries: `  <script type="text/javascript" src="/dist/jb-react-all.js"></script>
<script type="text/javascript" src="/dist/material.js"></script>
<link rel="stylesheet" type="text/css" href="/dist/material.css"/>`,
    pathToJsFile: (project,fn) => fn,
    projectUrlInStudio: project => `/studio-bin/${project}%2F${project}.html`
})

//     fiddle.jshell.net/davidbyd/47m1e2tk/show/?studio =>  //unpkg.com/jbart5-react/bin/studio/studio-cloud.html?entry=//fiddle.jshell.net/davidbyd/47m1e2tk/show/

st.chooseHostByUrl = entryUrl => {
    if (!entryUrl) return devHost // maybe testHost...
    st.host = entryUrl.match(/localhost:[0-9]*\/project\/studio/) ?
            devHost
        : entryUrl.match(/localhost:[0-9]*\/studio-bin/) ?
            userLocalHost
        : entryUrl.match(/fiddle.jshell.net/) ? 
            jsFiddler
        : devHost
}

function getEntryUrl() {
    const location = jb.frame.location
    return location && new URLSearchParams(location.search).entryUrl || location.href
}
st.chooseHostByUrl(getEntryUrl())

})()