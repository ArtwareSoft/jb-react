(function() {
const st = jb.studio;

const devHost = {
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.split('/').slice(1).join('/'),
    saveFile: (path, contents) => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json; charset=UTF-8");
        return fetch(`/?op=saveFile&path=${path}`,
        {method: 'POST', headers: headers, body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    createProjectOld: (request, headers) => fetch('/?op=createProject',{method: 'POST', headers, body: JSON.stringify(request) }),
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) })
}
st.host = st.host || devHost

//     localhost:8082/hello-world/hello-world.html?studio=localhost =>  localhost:8082/bin/studio/studio-localhost.html?entry=localhost:8082/hello-world/hello-world.html
//     localhost:8082/hello-world/hello-world.html?studio=jb-react@0.3.8 =>  //unpkg.com/jbart5-react@0.3.8/bin/studio/studio-cloud.html?entry=localhost:8082/hello-world/hello-world.html

userLocalHost = Object.assign({},devHost,{
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: (request, headers) => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers, body: JSON.stringify(
        Object.assign(request,{baseDir: request.project })) })
})


jsFiddler = ({entryUrl}) => ({
//     fiddle.jshell.net/davidbyd/47m1e2tk/show/?studio =>  //unpkg.com/jbart5-react/bin/studio/studio-cloud.html?entry=//fiddle.jshell.net/davidbyd/47m1e2tk/show/
})


st.initStudioHosts = entryUrl => {
    st.host = location.href.match(/localhost:[0-9]*\/project\/studio\/([a-zA-Z_0-9]*)\//) ?
            devHost
        : entryUrl.match(/localhost:[0-9]*\//) ?
            userLocalHost
        : entryUrl.match(/fiddle.jshell.net/) ? 
            jsFiddler
        : null
}


})()