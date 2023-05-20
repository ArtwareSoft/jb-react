extension('studio', 'hosts', {
    initExtension() {
        const location = jb.frame.location
        const entryUrl = location && (new jb.frame.URLSearchParams(location.search).entryUrl || location.href) || ''
        const host = jb.frame.jbInvscode ? (jb.frame.jbModuleUrl ? jb.studio.vscodeUserHost() : jb.studio.vscodeDevHost())
            : entryUrl.match(/chrome-extension:/) ? jb.studio.chromeExtensionHost()
            : entryUrl.match(/localhost:[0-9]*\/project\/studio/) ? jb.studio.devHost()
            : entryUrl.match(/studio-cloud/) ? jb.studio.cloudHost()
            : entryUrl.match(/localhost:[0-9]*\/studio-bin/) ? jb.studio.userLocalHost()
            : jb.studio.devHost()
        jb.log('studio host',{frame: jb.frame, entryUrl, host })
        return { host }
    },

    devHost: () => ({
        name: 'devHost',
        baseUrl: jb.frame.jbBaseProjUrl || jb.frame.location && jb.frame.location.origin,
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
        jbLoader: jb.frame.location ? jb.frame.location.origin + '/plugins/loader/jb-loader.js' : '',
        openUrlInBrowser: url => jb.exec({$: 'winUtils.gotoUrl', url }),
        gotoPath: (path,semanticPart) => {}
    }),
    vscodeDevHost: () => ({
        name: 'vscodeDevHost',
        baseUrl: jb.frame.jbBaseProjUrl,
        settings: () => Promise.resolve('{}'),
        locationToPath: loc => decodeURIComponent(loc.split('/file//').pop()).replace(/\\/g,'/'),
        // getFile: path => jb.vscode.service({$: 'getFile', path}).then( res=>res.content ),
        // saveFile: (path, contents) => jb.vscode.service({$: 'saveFile', path, contents}),
        // createDirectoryWithFiles: request => jb.vscode.service({$: 'createDirectoryWithFiles', ...request}),
        // showError: text => jb.vscode.service({$: 'showErrorMessage', text }),
        // showInformationMessage: text => jb.vscode.service({$: 'showInformationMessage', text }),
        // reOpenStudio: (fn,line) => jb.vscode.service({$: 'reOpenStudio', fn, pos: [line,0,line,0] }),
        pathOfJsFile: (project,fn) => `/projects/${project}/${fn}`,
        projectUrlInStudio: project => `/project/studio/${project}`,
        pathOfDistFolder: () => `${jb.frame.jbBaseProjUrl}/dist`,
        jbLoader: `${jb.frame.jbBaseProjUrl}/plugins/loader/jb-loader.js`,
        projectsDir: () => `${decodeURIComponent(jb.frame.jbBaseProjUrl).split('/file///').pop()}/projects`,
        openUrlInBrowser: url => jb.exec({$: 'remote.action', 
            action: () => { debugger; jb.frame.vscodeNS.env.openExternal(jb.frame.vscodeNS.Uri.parse(url)) }, 
            jbm: {$: 'byUri(', uri: 'vscode' }}),
        gotoPath: (path,semanticPart) => jb.vscode.gotoPath(path,semanticPart)
    }),

    vscodeUserHost: () => ({
        ...jb.studio.vscodeDevHost(),
        name: 'vscodeUserHost',
        pathOfJsFile: (project,fn) => `${project}/${fn}`,
        jbLoader: `${jb.frame.jbBaseProjUrl}/node_modules/jb-react/dist/jb-loader.js`,
        pathOfDistFolder: () => `${jb.frame.jbBaseProjUrl}/node_modules/jb-react/dist`,
        projectsDir: () => decodeURIComponent(jb.frame.jbBaseProjUrl).split('/file///').pop()
    }),
    chromeExtensionHost: () => ({
        name: 'chromeExtensionHost',
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
        jbLoader() { return `${this.baseUrl}/plugins/loader/jb-loader.js` },
    }),

    userLocalHost: () => ({ 
        ...jb.studio.devHost(),
        name: 'userLocalHost',
        createDirectoryWithFiles: request => fetch('/?op=createDirectoryWithFiles',{method: 'POST', headers: {'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(
            Object.assign(request,{baseDir: request.project })) }),
        locationToPath: path => path.replace(/^[0-9]*\//,'').replace(/^projects\//,''),
        pathOfJsFile: (project,fn,baseDir) => baseDir == './' ? fn : `/${project}/${fn}`,
        projectUrlInStudio: project => `/studio-bin/${project}`,
        pathOfDistFolder: () => '/node_modules/jb-react/dist',
        jbLoader: '/dist/jb-loader.js',
    }),

    cloudHost: () => ({
        name: 'cloudHost',
        settings: () => Promise.resolve(({})),
        getFile: path => fetch(`https://artwaresoft.github.io/jb-react/${path}`).then(res=>res.text()),
        locationToPath: path => path.replace(/^[0-9]*\//,''),
        createDirectoryWithFiles: request => jb.delay(1).then(() => { throw { desc: 'Cloud mode - can not save files'}}),
        pathOfJsFile: (project,fn) => fn,
        projectUrlInStudio: project => ``,
        canNotSave: true,
        pathOfDistFolder: () => 'https://artwaresoft.github.io/jb-react/dist',
        jbLoader: 'https://artwaresoft.github.io/jb-react/dist/jb-loader.js',
    })
})

extension('projectHosts', {
    initExtension() { 
        jb.frame.aa_jsonp_callback = x => x
        return {
        jbProxy: jb.frame.location && (jb.frame.location.href.match(/^[^:]*/)[0] + '://jbartdb.appspot.com/jbart_db.js?op=proxy&url='),
        jsFiddle: {
            fetchProjectSettings(jsFiddleid,project) {
                return jb.projectHosts.getUrlContent(`http://jsfiddle.net/${jsFiddleid}`)
                .then(content=>{
                    const json = jb.projectHosts.extractText(str,'values: {','fiddle: {')
                    const html = jb.projectHosts.extractText(json,'html: "','js:   "').trim().slice(0,-2)
                    const js = jb.projectHosts.extractText(json,'js:   "','css:  "').trim().slice(0,-2)
                    if (html)
                        return {project, files: { [`${project}.html`]: html, [`${project}.js`]: js },source:'jsFiddle' }
                })
            }
        },
        // host=github&hostProjectId=https://artwaresoft.github.io/todomvc/
        github: {
            fetchProjectSettings(gitHubUrl) {
                gitHubUrl = gitHubUrl.match(/\/$/) ? gitHubUrl : gitHubUrl + '/'
                const baseUrl = decodeURIComponent(gitHubUrl).replace(/^https?:/,'')
                const project = baseUrl.split('/').filter(x=>x).pop()
                return jb.projectHosts.getUrlContent(gitHubUrl).then(html =>{
                    const settings = eval('({' + jb.projectHosts.extractText(html,'jbProjectSettings = {','}') + '})')
                    return {...settings,baseUrl,project,source:'github'}
                })
            }
        },
        studio: {
            fetchProjectSettings(id,project) {
                if (jb.frame.jbPreviewProjectSettings) {
                    jb.exec(writeValue('%$studio/projectSettings%',jb.frame.jbPreviewProjectSettings))
                    jb.log('fetch studio project from jbPreviewProjectSettings',{jbPreviewProjectSettings})
                    return Promise.resolve(jb.frame.jbPreviewProjectSettings)
                }
                const baseUrl = `/project/${project}?cacheKiller=${Math.floor(Math.random()*100000)}`
                return fetch(baseUrl).then(r=>r.text()).then(html =>{
                    const settings = eval('({' + jb.projectHosts.extractText(html,'jbProjectSettings = {','}') + '})')
                    jb.log('fetch studio project from url',{baseUrl, html,settings})
                    return {...settings, project,source:'studio'}
                })
            }
        },
        test: {
            fetchProjectSettings(id,project) {
                return fetch('/projects/tests/tests.html').then(r=>r.text()).then(html =>{
                    const settings = eval('({' + jb.projectHosts.extractText(html,'jbProjectSettings = {','}') + '})')
                    return {...settings, project, 
                        entry: { $: 'test.showTestInStudio', testId: project },
                        source:'test'
                    }
                })
            }
        }
    }},
    extractText(str,startMarker,endMarker,replaceWith) {
        const pos1 = str.indexOf(startMarker), pos2 = str.indexOf(endMarker)
        if (pos1 == -1 || pos2 == -1) return ''
        if (replaceWith)
            return str.slice(0,pos1+ startMarker.length) + replaceWith + str.slice(pos2)
        return str.slice(pos1 + startMarker.length ,pos2)
    },    
    getUrlContent(url) {
        return fetch(jb.studio.jbProxy + url).then(r=>r.text(), {mode: 'cors'})
            .then(content=>content.match(/aa_jsonp_callback/) ? eval(content) : content)
            .catch(e => console.log(e))
    }
})
