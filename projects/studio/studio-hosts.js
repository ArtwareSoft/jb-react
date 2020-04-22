(function() {
const st = jb.studio;

const devHost = {
    settings: () => fetch(`/?op=settings`).then(res=>res.text()),
    //used in save
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    pathOfJsFile: (project,fn) => `/projects/${project}/${fn}`,

    // new project
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: `projects/${request.project}` })) }),
    // goto project
    projectUrlInStudio: project => `/project/studio/${project}`,
    // preview
    jbLoader: '/src/loader/jb-loader.js',
}

const vscodeDevHost = {
    settings: () => Promise.resolve('{}'),
    getFile: path => jb.studio.vscodeService({$: 'getFile', path}),
    locationToPath: path => decodeURIComponent(path.split('//file//').pop()).replace(/\\/g,'/'),
    saveDelta: (path, edits) => jb.studio.vscodeService({$: 'saveDelta', path, edits}),
    saveFile: (path, contents) => jb.studio.vscodeService({$: 'saveFile', path, contents}),
    createProject: request => jb.studio.vscodeService({$: 'createProject', request}),
    pathOfJsFile: (project,fn) => `/projects/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`,
    jbLoader: `${jb.frame.jbBaseProjUrl}/src/loader/jb-loader.js`,
}

const vscodeUserHost = Object.assign({},vscodeDevHost,{
    pathOfJsFile: (project,fn) => `${project}/${fn}`,
    jbLoader: `${jb.frame.jbBaseProjUrl}/node_modules/jb-react/dist/jb-loader.js`,
})

const userLocalHost = Object.assign({},devHost,{
    createProject: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: request.baseDir || request.project })) }),
    locationToPath: path => path.replace(/^[0-9]*\//,'').replace(/^projects\//,''),
    pathOfJsFile: (project,fn,baseDir) => baseDir == './' ? fn : `/${project}/${fn}`,
    projectUrlInStudio: project => `/studio-bin/${project}`,
    jbLoader: '/dist/jb-loader.js',
})

const cloudHost = {
    settings: () => Promise.resolve(({})),
    getFile: path => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files' }}),
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    createProject: request => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files'}}),
    pathOfJsFile: (project,fn) => fn,
    projectUrlInStudio: project => ``,
    canNotSave: true,
    jbLoader: 'https://artwaresoft.github.io/jb-react/dist/jb-loader.js',
}

//     fiddle.jshell.net/davidbyd/47m1e2tk/show/?studio =>  //unpkg.com/jb-react/bin/studio/studio-cloud.html?entry=//fiddle.jshell.net/davidbyd/47m1e2tk/show/

st.chooseHostByUrl = entryUrl => {
    entryUrl = entryUrl || ''
    st.host = jb.frame.jbInvscode ? jbModuleUrl ? vscodeUserHost : vscodeDevHost
        : entryUrl.match(/localhost:[0-9]*\/project\/studio/) ?
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
                    return {project, files: { [`${project}.html`]: html, [`${project}.js`]: js },source:'jsFiddle' }
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
                return {...settings,baseUrl,project,source:'github'}
            })
        }
    },
    studio: {
        fetchProject(id,project) {
            if (jb.frame.jbPreviewProjectSettings) {
                jb.exec(writeValue('%$studio/projectSettings%',jb.frame.jbPreviewProjectSettings))
                return Promise.resolve(jb.frame.jbPreviewProjectSettings)
            }
            const baseUrl = `/project/${project}?cacheKiller=${Math.floor(Math.random()*100000)}`
            return fetch(baseUrl).then(r=>r.text()).then(html =>{
                const settings = eval('({' + _extractText(html,'jbProjectSettings = {','}') + '})')
                return {...settings, project,source:'studio'}
            })
        }
    },
    test: {
        fetchProject(id,project) {
            return Promise.resolve({
                libs: 'common,ui-common,material,ui-tree,dragula,codemirror,testers,pretty-print,studio,studio-tests,object-encoder,remote,md-icons',
                jsFiles: ['remote-widgets','phones-3',...['data','ui','vdom','tree','watchable','parsing','object-encoder'].map(x=>x+'-tests')]
                    .map(x=>`/projects/ui-tests/${x}.js`),
                project, 
                entry: { $: 'uiTestRunner', test: project },
                source:'test'
            })
        }
    }
}


})()