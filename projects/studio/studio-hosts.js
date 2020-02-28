(function() {
const st = jb.studio;

const devHost = {
    settings: () => fetch(`/?op=settings`).then(res=>res.text()),
    rootExists: () => fetch(`/?op=rootExists`).then(res=>res.text()).then(res=>res==='true'),
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    htmlAsCloud: (html,project) => html.replace(/\/dist\//g,'//unpkg.com/jb-react/dist/').replace(/src="\.\.\//g,'src="').replace(`/${project}/`,''),
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) }),
    scriptForLoadLibraries: libs => `<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,${libs.join(',')}"></script>`,
    srcOfJsFile: (project,fn) => `/projects/${project}/${fn}`,
    pathOfJsFile: (project,fn) => `/projects/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`,
    jbLoader: '/src/loader/jb-loader.js',
    isDevHost: true
}

const userLocalHost = Object.assign({},devHost,{
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: request.baseDir || request.project })) }),
    scriptForLoadLibraries: libs => {
        const libScripts = libs.map(lib=>`<script type="text/javascript" src="/dist/${lib}.js"></script>`)
            + libs.filter(lib=>jb_modules[lib+'-css']).map(lib=>`<link rel="stylesheet" type="text/css" href="/dist/${lib}.css"/>`)
        return '<link rel="stylesheet" type="text/css" href="/dist/css/styles.css"/>\n<script type="text/javascript" src="/dist/jb-react-all.js"></script>\n' + libScripts
    },
    srcOfJsFile: (project,fn,baseDir) => baseDir == './' ? `../${fn}` : `/${project}/${fn}`,
    pathOfJsFile: (project,fn,baseDir) => baseDir == './' ? fn : `/${project}/${fn}`,
    projectUrlInStudio: project => `/studio-bin/${project}`,
    jbLoader: '/dist/jb-loader.js',
    isDevHost: false
})

const cloudHost = {
    settings: () => Promise.resolve(({})),
    rootExists: () => Promise.resolve(false),
    getFile: path => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files' }}),
    htmlAsCloud: (html,project) => html.replace(/\/dist\//g,'//unpkg.com/jb-react/dist/').replace(/src="\.\.\//g,'src="').replace(`/${project}/`,''),
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    createProject: request => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files'}}),
    scriptForLoadLibraries: libs => {
        const libScripts = libs.map(lib=>`<script type="text/javascript" src="//unpkg.com/jb-react/dist/${lib}.js"></script>`)
            + libs.filter(lib=>jb_modules[lib+'-css']).map(lib=>`<link rel="stylesheet" type="text/css" href="//unpkg.com/jb-react/dist/${lib}.css"/>`)
        return '<link rel="stylesheet" type="text/css" href="//unpkg.com/jb-react/dist/css/styles.css"/>\n<script type="text/javascript" src="//unpkg.com/jb-react/dist/jb-react-all.js"></script>\n' + libScripts
    },
    pathOfJsFile: (project,fn) => fn,
    projectUrlInStudio: project => ``,
    canNotSave: true,
    jbLoader: 'https://artwaresoft.github.io/jb-react/dist/jb-loader.js',
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
    return location && (new URLSearchParams(location.search).entryUrl || location.href)
}
st.chooseHostByUrl(getEntryUrl())

function _extractText(str,startMarker,endMarker,replaceWith) {
    const pos1 = str.indexOf(startMarker), pos2 = str.indexOf(endMarker)
    if (pos1 == -1 || pos2 == -1) return ''
    if (replaceWith)
        return str.slice(0,pos1+ startMarker.length) + replaceWith + str.slice(pos2)
    return str.slice(pos1 + startMarker.length ,pos2)
}

jb.frame.aa_jsonp_callback = x => x
const jbProxy = jb.frame.location && (location.href.match(/^[^:]*/)[0] + '://jbartdb.appspot.com/jbart_db.js?op=proxy&url=')

function getUrlContent(url) {
    const proxy = jbProxy
    return fetch(proxy + url).then(r=>r.text(), {mode: 'cors'})
        .then(content=>content.match(/aa_jsonp_callback/) ? eval(content) : content)
        .catch(e => console.log(e))
}

st.projectHosts = {
    jsFiddle: {
        fetchProject(jsFiddleid,project) {
            return getUrlContent(`http://jsfiddle.net/${jsFiddleid}`)
            .then(content=>{
                const json = _extractText(str,'values: {','fiddle: {')
                const html = _extractText(json,'html: "','js:   "').trim().slice(0,-2)
                const js = _extractText(json,'js:   "','css:  "').trim().slice(0,-2)
                if (html)
                    return {project, files: { [`${project}.html`]: html, [`${project}.js`]: js } }
            })
        }
    },
    // host=github&hostProjectId=https://artwaresoft.github.io/todomvc/
    github: {
        fetchProject(gitHubUrl) {
            gitHubUrl = gitHubUrl.match(/\/$/) ? gitHubUrl : gitHubUrl + '/'
            const baseUrl = decodeURIComponent(gitHubUrl).replace(/^https?:/,'')
            const project = baseUrl.split('/').filter(x=>x).pop()
            return getUrlContent(gitHubUrl).then(html =>{
                const settings = eval('({' + _extractText(html,'jbProjectSettings = {','}') + '})')
                return {...settings,baseUrl,project}

            })
        }
    },
    studio: {
        fetchProject(id,project) {
            const baseUrl = `/project/${project}?cacheKiller=${Math.floor(Math.random()*100000)}`
            return fetch(baseUrl).then(r=>r.text()).then(html =>{
                const settings = eval('({' + _extractText(html,'jbProjectSettings = {','}') + '})')
                return {...settings, project}
            })
        }
    }
}


})()