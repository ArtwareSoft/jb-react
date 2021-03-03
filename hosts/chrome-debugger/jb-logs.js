jbModuleUrl = 'http://localhost:8082';
jbm_create(['studio-all'],{ loadFromDist: true, uri: `devtools${decodeURIComponent('\u2022')}logsPanel`})
    .then(jb=> {self.jb =jb; jb.chromeDebugger.initPanel('logs', self) })