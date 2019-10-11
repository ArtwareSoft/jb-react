(function() {
const st = jb.studio;

const devHost = {
    rootName: path => fetch(`/?op=rootName`).then(res=>res.text()),
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.split('/').slice(1).join('/'),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) }),
    scriptForLoadLibraries: libs => `<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,${libs.join(',')}"></script>`,
    pathToJsFile: (project,fn) => `/projects/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`,
}

const userLocalHost = Object.assign({},devHost,{
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: request.baseDir || request.project })) }),
    scriptForLoadLibraries: libs => {
        const libScripts = libs.map(lib=>`<script type="text/javascript" src="/dist/${lib}.js"></script>`)
            + libs.filter(lib=>jb_modules[lib+'-css']).map(lib=>`<link rel="stylesheet" type="text/css" href="/dist/${lib}.css"/>`)
        return '<script type="text/javascript" src="/dist/jb-react-all.js"></script>\n' + libScripts
    },
    pathToJsFile: (project,fn) => `/${project}/${fn}`,
    projectUrlInStudio: project => `/studio-bin/${project}`,
})

const cloudHost = {
    getFile: () => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files' }}),
    locationToPath: path => path.split('/').slice(1).join('/'),
    createProject: request => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files'}}),
    scriptForLoadLibraries: libs => {
        const libScripts = libs.map(lib=>`<script type="text/javascript" src="//unpkg.com/jb-react/dist/${lib}.js"></script>`)
            + libs.filter(lib=>jb_modules[lib+'-css']).map(lib=>`<link rel="stylesheet" type="text/css" href="//unpkg.com/jb-react/dist/${lib}.css"/>`)
        return '<script type="text/javascript" src="//unpkg.com/jb-react/dist/jb-react-all.js"></script>\n' + libScripts
    },
    pathToJsFile: (project,fn) => fn,
    projectUrlInStudio: project => ``,
    canNotSave: true
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
    jsFiddle: {
        fetchProject(jsFiddleid,project) {
            return fetch(`https://jbartdb.appspot.com/jbart_db.js?op=proxy&url=` + `http://jsfiddle.net/${jsFiddleid}`,)
            .catch(e => console.log(e))
            .then(r => r.text())
            .then(content=>{
                const str = (''+content).replace(/\\n/g,'\n').replace(/\\/g,'')
                const json = extractText(str,'values: {','fiddle: {')
                const html = extractText(json,'html: "','js:   "').trim().slice(0,-2)
                const js = extractText(json,'js:   "','css:  "').trim().slice(0,-2)
                if (html)
                    return {project, files: { [`${project}.html`]: html, [`${project}.js`]: js } }
            })
        }
    }
}

})()