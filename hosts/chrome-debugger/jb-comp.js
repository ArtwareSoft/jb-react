// jbModuleUrl = 'http://localhost:8082';
// jbm_create(['studio-all'],{ loadFromDist: true, uri: `devtools${decodeURIComponent('\u2022')}compPanel` })
//     .then(jb=> {self.jb =jb; jb.chromeDebugger.initPanel('comp', self) })

jb_codeLoaderServer(`devtools${decodeURIComponent('\u2022')}compPanel`,{ projects: ['studio'], baseUrl: 'http://localhost:8082'})
    .then(() => jb.chromeDebugger.initPanel('comp', self))

// jb_codeLoaderClient(`devtools${decodeURIComponent('\u2022')}compPanel`)
//     .then(() => jb.codeLoaderJbm = 4)
//     .then(() => jb.codeLoader.getCodeFromRemote(['chromeDebugger.initPanel']))
//     .then(() => jb.chromeDebugger.initPanel('comp', self))