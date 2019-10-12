(function() {
const st = jb.studio;

const devHost = {
    rootName: () => fetch(`/?op=rootName`).then(res=>res.text()),
    rootExists: () => fetch(`/?op=rootExists`).then(res=>res.text()).then(res=>res==='true'),
    getFile: path => fetch(`/?op=getFile&path=${path}`).then(res=>res.text()),
    locationToPath: path => path.split('/').slice(1).join('/'),
    saveFile: (path, contents) => {
        return fetch(`/?op=saveFile`,
        {method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' } , body: JSON.stringify({ Path: path, Contents: contents }) })
        .then(res=>res.json())
    },
    htmlAsCloud: html => html.replace(/\/dist\//g,'//unpkg.com/jb-react/dist/').replace(/src="\.\.\//g,'src="'),
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
    pathToJsFile: (project,fn,baseDir) => baseDir == './' ? `../${fn}` : `/${project}/${fn}`,
    projectUrlInStudio: project => `/studio-bin/${project}`,
})

const cloudHost = {
    rootName: () => Promise.resolve(''),
    rootExists: () => Promise.resolve('false'),
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

function extractText(str,startMarker,endMarker,replaceWith) {
    const pos1 = str.indexOf(startMarker), pos2 = str.indexOf(endMarker)
    if (pos1 == -1 || pos2 == -1) return ''
    if (replaceWith)
        return str.slice(0,pos1+ startMarker.length) + replaceWith + str.slice(pos2)
    return str.slice(pos1 + startMarker.length ,pos2)
}

window.aa_jsonp_callback = x => x
const jbProxy = 'http://jbartdb.appspot.com/jbart_db.js?op=proxy&url='

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
                const json = extractText(str,'values: {','fiddle: {')
                const html = extractText(json,'html: "','js:   "').trim().slice(0,-2)
                const js = extractText(json,'js:   "','css:  "').trim().slice(0,-2)
                if (html)
                    return {project, files: { [`${project}.html`]: html, [`${project}.js`]: js } }
            })
        }
    },
    // host=github&hostProjectId=https://artwaresoft.github.io/todomvc/
    github: {
        fetchProject(gitHubUrl) {
            const project = gitHubUrl.split('/').filter(x=>x).pop() 
            return getUrlContent(gitHubUrl).then(html =>{
                const srcUrls = html.split('<script type="text/javascript" src="').slice(1)
                    .map(x=>x.match(/^[^"]*/)[0])
                const css = html.split('<link rel="stylesheet" href="').slice(1)
                    .map(x=>x.match(/^[^"]*/)[0])
                const js = srcUrls.filter(x=>x.indexOf('/dist/') == -1)
                const libs = srcUrls.filter(x=>x.indexOf('/dist/') != -1).map(x=>x.match(/dist\/(.*)\.js$/)[1]).filter(x=>x!='jb-react-all')
                return css.concat(js).reduce((acc,file)=> 
                    acc.then(files => getUrlContent(gitHubUrl + file).then(content => Object.assign(files, {[file]: content}))), Promise.resolve({
                        [`${project}.html`]: fixHtml(html)
                    }) )
                        .then(files => ({project, files, libs}))
            })

            function fixHtml(html) {
                return extractText(html,'<!-- start-jb-scripts -->\n','<!-- end-jb-scripts -->','<!-- load-jb-scripts-here -->\n')
            }
        }
    }
}

})()