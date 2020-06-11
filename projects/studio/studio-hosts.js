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
    showError: text => jb.studio.showMultiMessages([{text, error: true}]),
    showInformationMessage: text => jb.studio.showMultiMessages([{text}]),
    reOpenStudio: () => jb.frame.location && jb.frame.location.reload(),
    projectsDir: () => '/projects',

    // new project
    createDirectoryWithFiles: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify({...request,baseDir: `projects/${request.project}` }) }),
    // goto project
    projectUrlInStudio: project => `/project/studio/${project}`,
    // preview
    jbLoader: '/src/loader/jb-loader.js',
}

const vscodeDevHost = {
    settings: () => Promise.resolve('{}'),
    getFile: path => jb.studio.vscodeService({$: 'getFile', path}).then( res=>res.content ),
    locationToPath: loc => decodeURIComponent(loc.split('//file//').pop()).replace(/\\/g,'/'),
    saveDelta: (path, edits) => jb.studio.vscodeService({$: 'saveDelta', path, edits}),
    saveFile: (path, contents) => jb.studio.vscodeService({$: 'saveFile', path, contents}),
    createDirectoryWithFiles: request => jb.studio.vscodeService({$: 'createDirectoryWithFiles', ...request}),
    showError: text => jb.studio.vscodeService({$: 'showErrorMessage', text }),
    showInformationMessage: text => jb.studio.vscodeService({$: 'showInformationMessage', text }),
    reOpenStudio: (fn,line) => jb.studio.vscodeService({$: 'reOpenStudio', fn, pos: [line,0,line,0] }),
    pathOfJsFile: (project,fn) => `/projects/${project}/${fn}`,
    projectUrlInStudio: project => `/project/studio/${project}`,
    pathOfDistFolder: () => `${jb.frame.jbBaseProjUrl}/dist`,
    jbLoader: `${jb.frame.jbBaseProjUrl}/src/loader/jb-loader.js`,
    projectsDir: () => `${decodeURIComponent(jb.frame.jbBaseProjUrl).split('//file///').pop()}/projects`
}

const vscodeUserHost = Object.assign({},vscodeDevHost,{
    pathOfJsFile: (project,fn) => `${project}/${fn}`,
    jbLoader: `${jb.frame.jbBaseProjUrl}/node_modules/jb-react/dist/jb-loader.js`,
    pathOfDistFolder: () => `${jb.frame.jbBaseProjUrl}/node_modules/jb-react/dist`,
    projectsDir: () => decodeURIComponent(jb.frame.jbBaseProjUrl).split('//file///').pop()
})

const chromeExtensionHost = {
    baseUrl: 'http:/localhost:8082',
    settings() { return fetch(`${this.baseUrl}/?op=settings`).then(res=>res.text()) },
    //used in save
    getFile(path) { return fetch(`${this.baseUrl}/?op=getFile&path=${path}`).then(res=>res.text())},
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    saveFile(path, contents) {
        return fetch(`${this.baseUrl}/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    pathOfJsFile(project,fn) { return `${this.baseUrl}/projects/${project}/${fn}` },
    showError: text => jb.studio.showMultiMessages([{text, error: true}]),
    showInformationMessage: text => jb.studio.showMultiMessages([{text}]),
    reOpenStudio: () => {},
    projectsDir() { return `${this.baseUrl}/projects`},

    // new project
    createDirectoryWithFiles(request) { return fetch(`${this.baseUrl}/?op=createDirectoryWithFiles`,{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify({...request,baseDir: `projects/${request.project}` }) }) },
    // goto project
    projectUrlInStudio(project) { return `${this.baseUrl}/project/studio/${project}` },
    // preview
    jbLoader() { return `${this.baseUrl}/src/loader/jb-loader.js` },
}

const userLocalHost = Object.assign({},devHost,{
    createDirectoryWithFiles: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
        Object.assign(request,{baseDir: request.project })) }),
    locationToPath: path => path.replace(/^[0-9]*\//,'').replace(/^projects\//,''),
    pathOfJsFile: (project,fn,baseDir) => baseDir == './' ? fn : `/${project}/${fn}`,
    projectUrlInStudio: project => `/studio-bin/${project}`,
    pathOfDistFolder: () => '/node_modules/jb-react/dist',
    jbLoader: '/dist/jb-loader.js',
})

const cloudHost = {
    settings: () => Promise.resolve(({})),
    getFile: path => fetch(`https://artwaresoft.github.io/jb-react/${path}`).then(res=>res.text()),
    locationToPath: path => path.replace(/^[0-9]*\//,''),
    createDirectoryWithFiles: request => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files'}}),
    pathOfJsFile: (project,fn) => fn,
    projectUrlInStudio: project => ``,
    canNotSave: true,
    pathOfDistFolder: () => 'https://artwaresoft.github.io/jb-react/dist',
    jbLoader: 'https://artwaresoft.github.io/jb-react/dist/jb-loader.js',
}

st.chooseHostByUrl = entryUrl => {
    entryUrl = entryUrl || ''
    st.host = jb.frame.jbInvscode ? (jbModuleUrl ? vscodeUserHost : vscodeDevHost)
        : entryUrl.match(/chrome-extension:/) ? chromeExtensionHost
        : entryUrl.match(/localhost:[0-9]*\/project\/studio/) ? devHost
        : entryUrl.match(/studio-cloud/) ? cloudHost
        : entryUrl.match(/localhost:[0-9]*\/studio-bin/) ? userLocalHost
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
            return fetch('/projects/ui-tests/tests.html').then(r=>r.text()).then(html =>{
                const settings = eval('({' + _extractText(html,'jbProjectSettings = {','}') + '})')
                return {...settings, project, 
                    entry: { $: 'test.showTestInStudio', testId: project },
                    source:'test'
                }
            })
        }
    }
}


})()