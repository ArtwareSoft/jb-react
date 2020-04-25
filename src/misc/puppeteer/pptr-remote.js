jb.pptr = { hasPptrServer: typeof hasPptrServer != 'undefined' }

Object.assign(jb.pptr, {
    createComp(ctx,url,extract,features) {
        const comp = jb.pptr.hasPptrServer ? this.createServerComp(...arguments) : this.createProxyComp(ctx)
        comp.dataEm = jb.callbag.filter(e => e.$ == 'result-data')(comp.em)
        jb.callbag.subscribe(e => comp.results.push(e.data))(comp.dataEm)
        return comp
    },
    closeBrowser() {
        if (jb.pptr.hasPptrServer) {
            this._browser && this._browser.close()
        } else {
            socket = new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname}:8090`)
            socket.onopen = () => socket.send(JSON.stringify({profile: {$: 'pptr.closeBrowser'}}))
        }
    },
    createServerComp(ctx,url,extract,features,showBrowser) {
        const {pipe,last,subject,subscribe} = jb.callbag
        const comp = {
            em: subject(),
            results: [],
            endSession() {
                comp.em.next({profile: extract.ctx.profile, path: extract.ctx.path}) // for debug/logs
                return Promise.resolve(extract.do(comp)).then(x=> {
                    jb.asArray(x).forEach(data=>comp.em.next({$: 'result-data', data}));
                    comp.em.complete()
                })
            }
        }

        this.getOrCreateBrowser(showBrowser)
            .then(browser => browser.newPage())
            .then(page=> (comp.page = page).goto(url))
            .then(()=>applyFeatures())
            .catch(e => console.log(e))

        pipe(comp.em, last(), subscribe(e=> {
            this.prevPage && this.prevPage.close() 
            this.prevPage = comp.page
        }))

        return comp

        function applyFeatures() {
            features.forEach((f,i)=>f.index = i)
            features.filter(f=>f && !f.phase).forEach(f=>Object.assign(comp,f))
            const sortedFeatures = features.filter(f=>f.phase).sort((x1,x2) => x2.phase * 1000 + x2.index - x1.phase*1000 - x1.index)
            if (sortedFeatures.length == 0)
                comp.endSession()
            return sortedFeatures.reduce((pr,feature) => pr.then(()=>comp.em.next({feature})).then(feature.do(comp)), Promise.resolve())
        }
    },
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.impl.launch({headless: !showBrowser}).then(browser => this._browser = browser)
    },
    createProxyComp(ctx) {
        const {pipe,skip,take,toPromiseArray,subject} = jb.callbag
        const receive = subject()
        const socket = new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname}:8090`)
        socket.onmessage = ({data}) => {
            const _data = JSON.parse(data)
            if (_data.error)
                jb.logError('error from puppeteer',[_data.error,ctx])
            _data.res && receive.next(_data.res)
        }
        socket.onerror = e => receive.error(e)
        socket.onclose = () => receive.complete()
        socket.onopen = () => loadServerCode().then(() => socket.send(JSON.stringify({profile: ctx.profile})))
        return { em: skip(1)(receive), results: [] }

        function loadServerCode() {
            const st = (jb.path(jb,'studio.studiojb') || jb).studio
            if (!st.host) return Promise.resolve()
            return toPromiseArray(pipe(receive,take(1))).then(([m]) =>{
                if (m == 'loadCodeReq') {
                    return 'common,callbag,puppeteer'.split(',').reduce((pr,module) => pr.then(() => {
                            const moduleFileName = `${st.host.pathOfDistFolder()}/${module}.js`
                            return st.host.getFile(moduleFileName).then( loadCode => socket.send(JSON.stringify({ loadCode, moduleFileName })))
                        }), Promise.resolve())
                        .then(() => {
                            const moduleFileName = st.host.pathOfDistFolder().replace(/\/dist$/,'/src/misc/puppeteer/puppeteer.js')
                            return st.host.getFile(moduleFileName).then( loadCode => socket.send(JSON.stringify({ loadCode, moduleFileName })))
                        })
                        .then(() => socket.send(JSON.stringify({ require: 'puppeteer', writeTo: 'jb.pptr.impl'})))
                }
            })
        }
    },
})
