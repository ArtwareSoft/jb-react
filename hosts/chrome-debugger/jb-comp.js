jbModuleUrl = 'http://localhost:8082';
jbm_create(['studio-all'],{ loadFromDist: true, uri: `devtools${decodeURIComponent('\u2022')}compPanel` })
    .then(jb=> {self.jb =jb; jb.chromeDebugger.initPanel('comp', self) })
