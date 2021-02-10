jbModuleUrl = 'http://localhost:8082';
jbm_create(['studio-all'],`devtools${decodeURIComponent('\u25ba')}logsPanel`)
    .then(jb=> {self.jb =jb; jb.chromeDebugger.initPanel('logs', self) })